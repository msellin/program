import { describe, it, expect } from "vitest";
import type { ScheduledBlock, Store } from "../schemas";
import {
  getBlocksForDate,
  getBlocksForProgram,
  getBlockById,
  countBlocksByProgramForDate,
  isBlockObjectOn,
} from "./block-selectors";

function block(overrides: Partial<ScheduledBlock>): ScheduledBlock {
  return {
    id: overrides.id ?? "x:2026-01-01:foo",
    program_slug: overrides.program_slug ?? "x",
    block_template_id: overrides.block_template_id ?? "foo",
    planned_date: overrides.planned_date ?? "2026-01-01",
    actual_date: overrides.actual_date ?? "2026-01-01",
    state: overrides.state ?? "planned",
    ...overrides,
  };
}

function makeStore(blocks: ScheduledBlock[]): Store {
  return {
    scheduled_blocks: Object.fromEntries(blocks.map((b) => [b.id, b])),
  } as Store;
}

describe("getBlocksForDate", () => {
  it("returns blocks keyed by actual_date, not planned_date (the Today-view duplication fix)", () => {
    const store = makeStore([
      // Planned Friday, moved to Saturday
      block({
        id: "hsw:2026-08-14:block_wall",
        program_slug: "handstand-walk",
        planned_date: "2026-08-14",
        actual_date: "2026-08-15",
        state: "moved",
      }),
    ]);
    expect(getBlocksForDate(store, "2026-08-14")).toHaveLength(0);
    const sat = getBlocksForDate(store, "2026-08-15");
    expect(sat).toHaveLength(1);
    expect(sat[0].id).toBe("hsw:2026-08-14:block_wall");
  });

  it("filters by slug when opts.slug is passed (multi-track)", () => {
    const store = makeStore([
      block({ id: "hsw:2026-08-18:a", program_slug: "handstand-walk", actual_date: "2026-08-18" }),
      block({ id: "eb:2026-08-18:b", program_slug: "engine-builder", actual_date: "2026-08-18" }),
    ]);
    const hsw = getBlocksForDate(store, "2026-08-18", { slug: "handstand-walk" });
    expect(hsw).toHaveLength(1);
    expect(hsw[0].program_slug).toBe("handstand-walk");
  });

  it("filters by state when opts.states is passed", () => {
    const store = makeStore([
      block({ id: "a", state: "planned", actual_date: "2026-08-18" }),
      block({ id: "b", state: "done", actual_date: "2026-08-18" }),
      block({ id: "c", state: "skipped", actual_date: "2026-08-18" }),
    ]);
    const active = getBlocksForDate(store, "2026-08-18", { states: ["planned"] });
    expect(active.map((b) => b.id)).toEqual(["a"]);
  });

  it("returns [] when scheduled_blocks is undefined", () => {
    expect(getBlocksForDate({} as Store, "2026-08-18")).toEqual([]);
  });

  it("orders results deterministically by planned_date then template id", () => {
    const store = makeStore([
      block({ id: "z", planned_date: "2026-08-19", block_template_id: "z", actual_date: "2026-08-18" }),
      block({ id: "a", planned_date: "2026-08-17", block_template_id: "a", actual_date: "2026-08-18" }),
      block({ id: "m", planned_date: "2026-08-18", block_template_id: "m", actual_date: "2026-08-18" }),
    ]);
    const ordered = getBlocksForDate(store, "2026-08-18");
    expect(ordered.map((b) => b.id)).toEqual(["a", "m", "z"]);
  });
});

describe("getBlocksForProgram", () => {
  it("returns blocks in the actual_date range for the specified program", () => {
    const store = makeStore([
      block({ id: "1", program_slug: "hsw", actual_date: "2026-08-10" }),
      block({ id: "2", program_slug: "hsw", actual_date: "2026-08-15" }),
      block({ id: "3", program_slug: "hsw", actual_date: "2026-08-25" }),
      block({ id: "4", program_slug: "eb", actual_date: "2026-08-15" }),
    ]);
    const range = getBlocksForProgram(store, "hsw", "2026-08-14", "2026-08-20");
    expect(range.map((b) => b.id)).toEqual(["2"]);
  });
});

describe("getBlockById", () => {
  it("returns the block or undefined", () => {
    const store = makeStore([block({ id: "found" })]);
    expect(getBlockById(store, "found")?.id).toBe("found");
    expect(getBlockById(store, "missing")).toBeUndefined();
  });
});

describe("countBlocksByProgramForDate", () => {
  it("counts blocks per program for the date", () => {
    const store = makeStore([
      block({ id: "1", program_slug: "hsw", actual_date: "2026-08-18" }),
      block({ id: "2", program_slug: "hsw", actual_date: "2026-08-18" }),
      block({ id: "3", program_slug: "eb", actual_date: "2026-08-18" }),
      block({ id: "4", program_slug: "hsw", actual_date: "2026-08-19" }),
    ]);
    expect(countBlocksByProgramForDate(store, "2026-08-18")).toEqual({
      hsw: 2,
      eb: 1,
    });
  });
});

describe("isBlockObjectOn", () => {
  it("returns false when the flag is absent", () => {
    expect(isBlockObjectOn({} as Store)).toBe(false);
  });
  it("returns true only when feature_flags.block_object === true", () => {
    expect(isBlockObjectOn({ feature_flags: { block_object: true } } as Store)).toBe(true);
    expect(isBlockObjectOn({ feature_flags: { block_object: false } } as Store)).toBe(false);
  });
});
