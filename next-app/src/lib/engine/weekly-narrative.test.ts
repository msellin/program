import { describe, expect, it } from "vitest";
import type { Program, Store } from "@/lib/schemas";
import { computeWeekSummary } from "./weekly-narrative";

// A skill-category block: the old count only credited "strength" blocks, so Record read 0 / 0
// for a day Plan called "1 logged".
const program = {
  slug: "p",
  blocks: [{ id: "block_skill", name: "Skill", category: "skill", items: [] }],
  phases: [],
  weekly_template: {},
} as unknown as Program;

describe("Record counts the sessions Plan counts", () => {
  it("counts a logged day in any block category, and never shows more done than scheduled", () => {
    const store = {
      version: 2,
      training_maxes: {},
      logs: { "2026-10-26": { exercises: { "block_skill:x": { done: true, sets: [] } }, symptoms: null, notes: "" } },
    } as unknown as Store;
    const s = computeWeekSummary(store, program, "2026-10-28");
    expect(s.sessions.completed).toBe(1);
    expect(s.sessions.scheduled).toBeGreaterThanOrEqual(1);
  });
});
