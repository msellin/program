import { describe, it, expect, beforeEach } from "vitest";
import { useStore } from "./useStore";
import type { ScheduledBlock } from "./schemas";

/**
 * Phase B store-action tests — see block-object-rebuild-2026-08-18.md §3.
 *
 * These hit the real Zustand store. Each test resets via `wipe()` +
 * seeds `scheduled_blocks` directly through `useStore.setState` so we
 * don't depend on the materializer for shape coverage.
 */

function seedBlocks(records: ScheduledBlock[]): void {
  const map = Object.fromEntries(records.map((b) => [b.id, b]));
  useStore.setState((prev) => ({
    store: {
      ...prev.store,
      scheduled_blocks: map,
    },
  }));
}

function block(overrides: Partial<ScheduledBlock>): ScheduledBlock {
  return {
    id: overrides.id ?? "hsw:2026-08-18:block_wall",
    program_slug: overrides.program_slug ?? "handstand-walk",
    block_template_id: overrides.block_template_id ?? "block_wall",
    planned_date: overrides.planned_date ?? "2026-08-18",
    actual_date: overrides.actual_date ?? "2026-08-18",
    state: overrides.state ?? "planned",
    ...overrides,
  };
}

function getBlock(id: string) {
  return useStore.getState().store.scheduled_blocks?.[id];
}

describe("block actions (Phase B)", () => {
  beforeEach(() => {
    // Reset store to a clean base — wipe clears everything then rehydrates.
    useStore.setState((prev) => ({
      store: {
        ...prev.store,
        scheduled_blocks: undefined,
        skipped: undefined,
        scheduled_overrides: undefined,
        feature_flags: undefined,
      },
    }));
  });

  it("skipBlock flips state → 'skipped' and stores the reason as notes", () => {
    const b = block({ id: "test:1" });
    seedBlocks([b]);
    useStore.getState().skipBlock("test:1", "long day");
    const out = getBlock("test:1");
    expect(out?.state).toBe("skipped");
    expect(out?.notes).toBe("long day");
  });

  it("skipBlock on unknown id is a no-op", () => {
    seedBlocks([]);
    useStore.getState().skipBlock("does-not-exist");
    expect(getBlock("does-not-exist")).toBeUndefined();
  });

  it("moveBlock updates actual_date, sets state='moved', appends move_history", () => {
    seedBlocks([block({ id: "m:1" })]);
    useStore.getState().moveBlock("m:1", "2026-08-19", "traveling");
    const out = getBlock("m:1");
    expect(out?.state).toBe("moved");
    expect(out?.actual_date).toBe("2026-08-19");
    expect(out?.move_history?.length).toBe(1);
    expect(out?.move_history?.[0].from).toBe("2026-08-18");
    expect(out?.move_history?.[0].to).toBe("2026-08-19");
    expect(out?.move_history?.[0].reason).toBe("traveling");
  });

  it("moveBlock twice → move_history has two entries, current actual_date is latest", () => {
    seedBlocks([block({ id: "m:2" })]);
    useStore.getState().moveBlock("m:2", "2026-08-19");
    useStore.getState().moveBlock("m:2", "2026-08-20");
    const out = getBlock("m:2");
    expect(out?.actual_date).toBe("2026-08-20");
    expect(out?.move_history?.length).toBe(2);
  });

  it("restoreBlock resets state back to planned and drops completion", () => {
    seedBlocks([
      block({
        id: "r:1",
        state: "done",
        actual_date: "2026-08-20",
        planned_date: "2026-08-18",
        completed_at: "2026-08-20T09:00:00Z",
        log_entry_id: "2026-08-20",
      }),
    ]);
    useStore.getState().restoreBlock("r:1");
    const out = getBlock("r:1");
    expect(out?.state).toBe("planned");
    expect(out?.actual_date).toBe("2026-08-18");
    expect(out?.completed_at).toBeUndefined();
    expect(out?.log_entry_id).toBeUndefined();
  });

  it("completeBlock sets state='done' + completed_at + log_entry_id", () => {
    seedBlocks([block({ id: "c:1" })]);
    useStore.getState().completeBlock("c:1", "log-2026-08-18");
    const out = getBlock("c:1");
    expect(out?.state).toBe("done");
    expect(out?.log_entry_id).toBe("log-2026-08-18");
    expect(out?.completed_at).toBeTruthy();
  });

  it("applyBlockProposal appends to engine_adjustments and downshifts planned blocks", () => {
    seedBlocks([block({ id: "p:1" })]);
    useStore.getState().applyBlockProposal("p:1", {
      proposal_id: "prop-1",
      kind: "day_adjustment_soften",
      payload: { load_multiplier: 0.9 },
    });
    const out = getBlock("p:1");
    expect(out?.state).toBe("amber_downshifted");
    expect(out?.engine_adjustments?.length).toBe(1);
    expect(out?.engine_adjustments?.[0].proposal_id).toBe("prop-1");
    expect(out?.engine_adjustments?.[0].payload).toEqual({ load_multiplier: 0.9 });
  });

  it("skipWholeDay skips every planned block on the date across programs", () => {
    seedBlocks([
      block({ id: "hsw:2026-08-18:a", program_slug: "handstand-walk", actual_date: "2026-08-18" }),
      block({ id: "eb:2026-08-18:b", program_slug: "engine-builder", actual_date: "2026-08-18" }),
      block({ id: "hsw:2026-08-19:c", program_slug: "handstand-walk", actual_date: "2026-08-19" }),
    ]);
    useStore.getState().skipWholeDay("2026-08-18", "sick");
    expect(getBlock("hsw:2026-08-18:a")?.state).toBe("skipped");
    expect(getBlock("eb:2026-08-18:b")?.state).toBe("skipped");
    expect(getBlock("hsw:2026-08-19:c")?.state).toBe("planned");
  });

  it("moveWholeDay moves every planned block from fromDate to toDate", () => {
    seedBlocks([
      block({ id: "hsw:2026-08-18:a", program_slug: "handstand-walk", actual_date: "2026-08-18" }),
      block({ id: "eb:2026-08-18:b", program_slug: "engine-builder", actual_date: "2026-08-18" }),
    ]);
    useStore.getState().moveWholeDay("2026-08-18", "2026-08-19");
    expect(getBlock("hsw:2026-08-18:a")?.actual_date).toBe("2026-08-19");
    expect(getBlock("eb:2026-08-18:b")?.actual_date).toBe("2026-08-19");
    expect(getBlock("hsw:2026-08-18:a")?.state).toBe("moved");
    expect(getBlock("eb:2026-08-18:b")?.state).toBe("moved");
  });

  it("setFeatureFlag toggles a flag and persists via commit", () => {
    useStore.getState().setFeatureFlag("block_object", true);
    expect(useStore.getState().store.feature_flags?.block_object).toBe(true);
    useStore.getState().setFeatureFlag("block_object", false);
    expect(useStore.getState().store.feature_flags?.block_object).toBe(false);
  });
});
