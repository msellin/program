import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { blocksForDate } from "./plan-generator";
import { suggestForExercise } from "./suggest";
import { activePhaseFor } from "./schedule";
import type { Program, Store } from "../schemas";

/**
 * Competition-week taper — the real anterior-hip-rebuild JSON, not a fixture
 * (2026-09-03). The point of this file is that the shipped program actually
 * behaves as intended on the shipped dates: a fixture that passes while the
 * real data is wrong would be worse than no test.
 *
 * Comp is Sat 2026-09-12. Override window: Sun 2026-09-06 → Sat 2026-09-12.
 */
function loadProgram(): Program {
  const p = path.resolve(__dirname, "../../../public/data/programs/anterior-hip-rebuild.json");
  const parsed = JSON.parse(fs.readFileSync(p, "utf8")) as Program;
  parsed.slug = "anterior-hip-rebuild";
  return parsed;
}

const program = loadProgram();
const noProfile: Store["user_profile"] = undefined;

function idsOn(dateISO: string): string[] {
  const phase = activePhaseFor(program, dateISO, noProfile);
  return blocksForDate(program, noProfile, phase, dateISO).map((b) => b.id);
}

describe("comp-week schedule (2026-09-06 → 2026-09-12)", () => {
  it("Mon 2026-09-07 renders the squat taper, not the heavy day", () => {
    expect(idsOn("2026-09-07")).toEqual(["block_squat_taper"]);
  });

  it("Wed 2026-09-09 renders the pull taper, not the heavy day", () => {
    expect(idsOn("2026-09-09")).toEqual(["block_pull_taper"]);
  });

  it("Thu 2026-09-10 drops the second squat day entirely", () => {
    expect(idsOn("2026-09-10")).not.toContain("block_squat_variant");
  });

  it("Sat 2026-09-12 — competition day — schedules no barbell session", () => {
    expect(idsOn("2026-09-12")).toEqual([]);
  });

  it("the taper blocks are declared on phase_2, or schedule.ts filters them out", () => {
    // schedule.ts filters block ids not present in the active phase's
    // `blocks[]`. Authoring a block and forgetting this line renders an
    // empty day with no error anywhere — the exact silent failure this
    // asserts against.
    const phase2 = program.phases.find((p) => p.id === "phase_2_cycle_1");
    expect(phase2?.blocks).toContain("block_squat_taper");
    expect(phase2?.blocks).toContain("block_pull_taper");
  });

  it("the week AFTER the comp is back to the full template", () => {
    // The taper is a window, not a new normal. Mon 2026-09-14 is week 3 —
    // the 95% AMRAP that sets the next TM.
    expect(idsOn("2026-09-14")).toEqual(["block_squat_heavy"]);
  });

  it("the week BEFORE the comp is untouched", () => {
    expect(idsOn("2026-09-03")).toEqual(["block_squat_variant"]);
  });
});

describe("taper blocks demote FSL to optional", () => {
  const store = {
    training_maxes: { back_squat_highbar: 110, block_pull_midshin: 130 },
    logs: {},
  } as unknown as Store;

  it("the taper day keeps the full top set — intensity is not cut", () => {
    const heavy = suggestForExercise("back_squat_highbar", "block_squat_heavy", program, store, "2026-09-07");
    const taper = suggestForExercise("back_squat_highbar", "block_squat_taper", program, store, "2026-09-07");
    expect(taper?.top_set.kg).toBe(heavy?.top_set.kg);
    expect(taper?.top_set.reps).toBe(heavy?.top_set.reps);
  });

  it("the taper day marks the FSL backoff optional", () => {
    const s = suggestForExercise("back_squat_highbar", "block_squat_taper", program, store, "2026-09-07");
    expect(s?.fsl?.optional).toBe(true);
    // Still prescribed, still the same load — offered, not removed.
    expect(s?.fsl?.sets).toBe(5);
  });

  it("the pull taper does the same", () => {
    const s = suggestForExercise("block_pull_midshin", "block_pull_taper", program, store, "2026-09-09");
    expect(s?.fsl?.optional).toBe(true);
  });

  it("the ordinary heavy day does NOT mark FSL optional", () => {
    const s = suggestForExercise("back_squat_highbar", "block_squat_heavy", program, store, "2026-09-07");
    expect(s?.fsl?.optional).toBe(false);
  });

  it("says so in the reasoning, so it does not read as a missing prescription", () => {
    const s = suggestForExercise("back_squat_highbar", "block_squat_taper", program, store, "2026-09-07");
    expect(s?.reasoning).toContain("optional");
  });
});

describe("regression: the hip program honors weekly_overrides at all", () => {
  // Until 2026-09-03 it did not. `strengthBlockIdsForDate` branches on
  // `slug === HIP_SLUG` into a hand-written layout and never reached the
  // generic path where overrides were implemented, so any override authored
  // on this program was dead data that failed silently — the day just
  // rendered the default session and nothing anywhere said otherwise.
  it("an override window changes what the hip program prescribes", () => {
    const mon = "2026-09-07";
    const phase = activePhaseFor(program, mon, noProfile);
    const withOverride = blocksForDate(program, noProfile, phase, mon).map((b) => b.id);

    const stripped = JSON.parse(JSON.stringify(program)) as Program;
    const p2 = stripped.phases.find((p) => p.id === "phase_2_cycle_1")!;
    delete (p2 as unknown as { weekly_overrides?: unknown }).weekly_overrides;
    const withoutOverride = blocksForDate(stripped, noProfile, p2, mon).map((b) => b.id);

    expect(withoutOverride).toEqual(["block_squat_heavy"]);
    expect(withOverride).toEqual(["block_squat_taper"]);
  });

  it("a day absent from the override map falls through to the template", () => {
    // The comp-week map names all seven days, so prove the fallthrough on
    // the mechanism rather than on data that happens not to exercise it.
    const partial = JSON.parse(JSON.stringify(program)) as Program;
    const p2 = partial.phases.find((p) => p.id === "phase_2_cycle_1")!;
    (p2 as unknown as { weekly_overrides: Array<{ days: Record<string, string> }> })
      .weekly_overrides[0].days = { Mon: "block_squat_taper" };
    const thu = blocksForDate(partial, noProfile, p2, "2026-09-10").map((b) => b.id);
    expect(thu).toEqual(["block_squat_variant"]);
  });
});

describe("every block a phase declares is real, and vice versa", () => {
  // The silent-failure guard. `strengthBlocksForDate` filters resolved ids
  // against `program.blocks`, and `blockIdsFromWeeklyTemplate` filters again
  // against `phase.blocks` — so a typo in either place yields an empty day
  // with no error. Both directions asserted.
  it("phase.blocks[] ids all resolve to a real block", () => {
    const real = new Set(program.blocks.map((b) => b.id));
    for (const phase of program.phases) {
      for (const id of phase.blocks ?? []) {
        expect(real.has(id), `${phase.id} declares unknown block ${id}`).toBe(true);
      }
    }
  });

  it("every block id named in a weekly_overrides day is declared on that phase", () => {
    for (const phase of program.phases) {
      const wo = (phase as unknown as {
        weekly_overrides?: Array<{ days: Record<string, string> }>;
      }).weekly_overrides;
      if (!wo) continue;
      const declared = new Set(phase.blocks ?? []);
      for (const o of wo) {
        for (const session of Object.values(o.days)) {
          for (const id of session.match(/block_[a-z0-9_]+/g) ?? []) {
            expect(declared.has(id), `${phase.id} override names ${id}, not in phase.blocks[]`).toBe(true);
          }
        }
      }
    }
  });
});
