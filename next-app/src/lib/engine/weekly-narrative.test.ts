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

describe("Record's week headline counts honestly", () => {
  const strengthProgram = {
    slug: "s",
    blocks: [{ id: "block_squat", name: "Squat", category: "strength", items: [] }],
    phases: [],
    weekly_template: { week: [{ day: "Mon", session: "block_squat" }, null, { day: "Wed", session: "block_squat" }, null, { day: "Fri", session: "block_squat" }, null, null] },
  } as unknown as Program;
  const set = (w: number, r: number) => ({ weight_kg: w, reps: r, rpe: null, failed: false });
  const day = (sets: ReturnType<typeof set>[], extra: object = {}) => ({
    exercises: { "block_squat:front_squat": { done: true, sets } },
    symptoms: null,
    notes: "",
    ...extra,
  });

  it("a best is heavier than every earlier set of that lift, not just the week's top set", () => {
    const store = {
      version: 2,
      training_maxes: {},
      logs: {
        "2026-10-19": day([set(115, 3)]),
        "2026-10-26": day([set(80, 5)]),
        "2026-10-28": day([set(110, 3)]),
      },
    } as unknown as Store;
    const s = computeWeekSummary(store, strengthProgram, "2026-10-29");
    expect(s.training.prsHit).toBe(1); // lifts trained
    expect(s.training.newBests).toBe(0); // 110 < 115 from the week before
  });

  it("behind counts planned days so far, and a red-check day is not a miss", () => {
    const store = {
      version: 2,
      training_maxes: {},
      logs: { "2026-10-26": day([set(80, 5)]), "2026-10-28": { exercises: {}, symptoms: null, notes: "", derived_state: "red" } },
    } as unknown as Store;
    const s = computeWeekSummary(store, strengthProgram, "2026-10-29");
    expect(s.sessions.dueSoFar).toBe(1); // Mon due, Wed held by red, Fri not yet
    expect(s.sessions.completed).toBe(1);
  });
});
