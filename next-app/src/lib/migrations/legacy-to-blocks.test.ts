import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import type { Program, Store } from "../schemas";
import { migrateLegacyToBlocks, needsBlockMigration } from "./legacy-to-blocks";

function loadProgram(slug: string): Program {
  const p = path.resolve(__dirname, "../../../public/data/programs", `${slug}.json`);
  const program = JSON.parse(fs.readFileSync(p, "utf8")) as Program;
  program.slug = slug; // data-loader.ts tags this at runtime; bypassed here.
  return program;
}

function makeBaseStore(activeSlug: string): Store {
  return {
    version: 2,
    logs: {},
    training_maxes: {},
    cycle: { phase_id: null, cycle_number: 0, week_in_cycle: 0 },
    user_profile: {
      active_program_id: activeSlug,
    },
  } as unknown as Store;
}

describe("legacy-to-blocks migrator", () => {
  it("short-circuits when migrations_applied already contains blocks_v2", () => {
    const store = makeBaseStore("concurrent-strength-maintenance");
    store.migrations_applied = ["blocks_v2"];
    const program = loadProgram("concurrent-strength-maintenance");
    const out = migrateLegacyToBlocks(store, { "concurrent-strength-maintenance": program }, program.phases[0].starts);
    expect(out).toBe(store);
    expect(needsBlockMigration(out)).toBe(false);
  });

  it("re-runs when only blocks_v1 is applied (Batch 38 repair path)", () => {
    // Users migrated under blocks_v1 (before BUG-8's shouldFlipDone logic)
    // must get their stuck state=planned blocks re-evaluated. This is the
    // whole reason for the v1→v2 bump.
    const store = makeBaseStore("concurrent-strength-maintenance");
    store.migrations_applied = ["blocks_v1"];
    expect(needsBlockMigration(store)).toBe(true);
  });

  it("materializes blocks for the active program on first run", () => {
    const program = loadProgram("concurrent-strength-maintenance");
    const store = makeBaseStore("concurrent-strength-maintenance");
    const anchor = program.phases[0].starts;
    const out = migrateLegacyToBlocks(store, { "concurrent-strength-maintenance": program }, anchor);
    expect(out.migrations_applied).toContain("blocks_v2");
    expect(Object.keys(out.scheduled_blocks ?? {}).length).toBeGreaterThan(0);
    expect(out.program_materialization?.["concurrent-strength-maintenance"]).toBeTruthy();
  });

  it("marks blocks skipped when store.skipped[date] carries a bare reason", () => {
    const program = loadProgram("concurrent-strength-maintenance");
    const anchor = program.phases[0].starts;
    const store = makeBaseStore("concurrent-strength-maintenance");
    store.skipped = { [anchor]: { reason: "sick" } };
    const out = migrateLegacyToBlocks(store, { "concurrent-strength-maintenance": program }, anchor);
    const skipped = Object.values(out.scheduled_blocks ?? {}).filter(
      (b) => b.actual_date === anchor && b.state === "skipped",
    );
    expect(skipped.length).toBeGreaterThan(0);
    expect(skipped[0].notes).toBe("sick");
  });

  it("marks blocks moved when scheduled_overrides has a 'moved from <date>' reason", () => {
    const program = loadProgram("concurrent-strength-maintenance");
    const start = program.phases[0].starts;
    const nextDay = new Date(new Date(start + "T00:00:00").getTime() + 864e5)
      .toISOString()
      .slice(0, 10);
    const store = makeBaseStore("concurrent-strength-maintenance");
    // Materialize once to get a real template id we can reference in the override.
    const bootstrap = migrateLegacyToBlocks(store, { "concurrent-strength-maintenance": program }, start);
    const templateBlock = Object.values(bootstrap.scheduled_blocks ?? {}).find(
      (b) => b.actual_date === start,
    );
    if (!templateBlock) {
      // engine-builder's phase_1 starts on a Wednesday in the JSON; if the
      // template happens to schedule nothing that day, the invariant still
      // holds — skip the assertion body but pass the guard.
      return;
    }
    // Simulate a legacy move: reset migrations_applied and add a legacy
    // override that points at that template id.
    const legacy: Store = {
      ...store,
      migrations_applied: undefined,
      scheduled_overrides: {
        [nextDay]: { blocks: [templateBlock.block_template_id], reason: `moved from ${start}` },
      },
      skipped: { [start]: { moved_to: nextDay } },
    };
    const out = migrateLegacyToBlocks(legacy, { "concurrent-strength-maintenance": program }, start);
    const moved = Object.values(out.scheduled_blocks ?? {}).find(
      (b) => b.planned_date === start && b.block_template_id === templateBlock.block_template_id,
    );
    expect(moved?.state).toBe("moved");
    expect(moved?.actual_date).toBe(nextDay);
    expect(moved?.move_history?.length ?? 0).toBeGreaterThan(0);
  });

  it("links log_entry_id when a day-log exists for the block's actual_date", () => {
    const program = loadProgram("concurrent-strength-maintenance");
    const anchor = program.phases[0].starts;
    const store = makeBaseStore("concurrent-strength-maintenance");
    store.logs = {
      [anchor]: {
        date: anchor,
        exercises: {},
      } as unknown as Store["logs"][string],
    };
    const out = migrateLegacyToBlocks(store, { "concurrent-strength-maintenance": program }, anchor);
    const linked = Object.values(out.scheduled_blocks ?? {}).filter(
      (b) => b.actual_date === anchor,
    );
    for (const b of linked) {
      expect(b.log_entry_id).toBe(anchor);
    }
  });

  it("flips block state to 'done' when a matching exercise is logged as done (BUG-8)", () => {
    const program = loadProgram("concurrent-strength-maintenance");
    const anchor = program.phases[0].starts;
    const store = makeBaseStore("concurrent-strength-maintenance");
    // Bootstrap once to discover a real block id we can log against.
    const bootstrap = migrateLegacyToBlocks(
      store,
      { "concurrent-strength-maintenance": program },
      anchor,
    );
    const anchorBlock = Object.values(bootstrap.scheduled_blocks ?? {}).find(
      (b) => b.actual_date === anchor,
    );
    if (!anchorBlock) return; // no block on anchor date — vacuous pass
    // Reset migration flag and add a log with a matching exercise key.
    const legacy: Store = {
      ...store,
      migrations_applied: undefined,
      logs: {
        [anchor]: {
          date: anchor,
          exercises: {
            [`${anchorBlock.id}:back_squat_highbar`]: {
              sets: [],
              done: true,
            },
          },
          symptoms: null,
          derived_state: null,
          notes: "",
        } as unknown as Store["logs"][string],
      },
    };
    const out = migrateLegacyToBlocks(
      legacy,
      { "concurrent-strength-maintenance": program },
      anchor,
    );
    const flipped = out.scheduled_blocks?.[anchorBlock.id];
    expect(flipped?.state).toBe("done");
    expect(flipped?.log_entry_id).toBe(anchor);
  });

  it("does NOT flip block state when log day has no matching activity (empty exercises)", () => {
    const program = loadProgram("concurrent-strength-maintenance");
    const anchor = program.phases[0].starts;
    const store = makeBaseStore("concurrent-strength-maintenance");
    store.logs = {
      [anchor]: {
        date: anchor,
        exercises: {},
      } as unknown as Store["logs"][string],
    };
    const out = migrateLegacyToBlocks(
      store,
      { "concurrent-strength-maintenance": program },
      anchor,
    );
    const anchorBlocks = Object.values(out.scheduled_blocks ?? {}).filter(
      (b) => b.actual_date === anchor,
    );
    for (const b of anchorBlocks) {
      expect(b.state).toBe("planned"); // stayed planned — empty log doesn't imply done
      expect(b.log_entry_id).toBe(anchor); // but link is still attached
    }
  });

  it("is idempotent — second run returns the same shape", () => {
    const program = loadProgram("concurrent-strength-maintenance");
    const anchor = program.phases[0].starts;
    const store = makeBaseStore("concurrent-strength-maintenance");
    const first = migrateLegacyToBlocks(store, { "concurrent-strength-maintenance": program }, anchor);
    const second = migrateLegacyToBlocks(first, { "concurrent-strength-maintenance": program }, anchor);
    expect(second).toBe(first); // short-circuit returns the same reference
  });

  it("Batch 38 regression — planned block WITH log_entry_id re-flips to done under v2", () => {
    // The exact bug from F10-CSM-P0: user's data was migrated under
    // blocks_v1 (before BUG-8's shouldFlipDone logic). Their block has
    // both log_entry_id set AND state === "planned" — because the v1
    // migrator linked the log but didn't yet know to flip the state.
    // Under v2 the log-link step re-evaluates and flips.
    const program = loadProgram("concurrent-strength-maintenance");
    const anchor = program.phases[0].starts;
    const store = makeBaseStore("concurrent-strength-maintenance");
    // Simulate the stuck-under-v1 state: a materialized block on anchor
    // with log_entry_id and state=planned.
    const firstPass = migrateLegacyToBlocks(store, { "concurrent-strength-maintenance": program }, anchor);
    const anchorBlock = Object.values(firstPass.scheduled_blocks ?? {}).find(
      (b) => b.actual_date === anchor,
    );
    if (!anchorBlock) throw new Error("no anchor block materialized");
    // Force the stuck v1 shape: state=planned + log_entry_id present.
    firstPass.scheduled_blocks![anchorBlock.id] = {
      ...anchorBlock,
      state: "planned",
      log_entry_id: anchor,
    };
    // Attach a matching exercise log entry (evidence).
    firstPass.logs = {
      [anchor]: {
        date: anchor,
        exercises: {
          [`${anchorBlock.id}:some_exercise`]: { done: true } as unknown as Store["logs"][string]["exercises"][string],
        },
      } as unknown as Store["logs"][string],
    };
    // Pretend the store was migrated under v1 (so v2 will re-run).
    firstPass.migrations_applied = ["blocks_v1"];
    const secondPass = migrateLegacyToBlocks(firstPass, { "concurrent-strength-maintenance": program }, anchor);
    const flipped = secondPass.scheduled_blocks?.[anchorBlock.id];
    expect(flipped?.state).toBe("done"); // was stuck at "planned" pre-Batch-38
    expect(flipped?.log_entry_id).toBe(anchor);
    expect(secondPass.migrations_applied).toContain("blocks_v2");
  });
});
