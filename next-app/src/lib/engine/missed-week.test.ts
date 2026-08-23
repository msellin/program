import { describe, it, expect } from "vitest";
import { detectMissedWeek } from "./missed-week";
import type { Program, Store } from "../schemas";

/**
 * Fixture pattern cribbed from schedule.test.ts. Three strength days a
 * week (Mon/Wed/Fri); Sun/Tue/Thu/Sat are an accessory block, which
 * `detectMissedWeek` must not count as "scheduled" (only category
 * "strength" counts, matching MissedSessionPrompt's existing filter).
 */
const program: Program = {
  slug: "test-program",
  schema_version: "1.0.0",
  generated: "2026-08-01",
  status: "ACTIVE",
  phases: [
    {
      id: "phase_test",
      name: "Test phase",
      starts: "2026-08-10",
      ends: "2026-08-30",
      blocks: ["block_squat_heavy", "block_pull_heavy", "block_squat_volume", "block_a_home"],
    },
  ],
  blocks: [
    { id: "block_squat_heavy", name: "Squat heavy", category: "strength", items: [] },
    { id: "block_pull_heavy", name: "Pull heavy", category: "strength", items: [] },
    { id: "block_squat_volume", name: "Squat volume", category: "strength", items: [] },
    { id: "block_a_home", name: "Home rehab", category: "accessory", items: [] },
  ],
  weekly_template: {
    week: [
      { day: "Sun", session: "block_a_home" },
      { day: "Mon", session: "block_squat_heavy" },
      { day: "Tue", session: "block_a_home" },
      { day: "Wed", session: "block_pull_heavy" },
      { day: "Thu", session: "block_a_home" },
      { day: "Fri", session: "block_squat_volume" },
      { day: "Sat", session: "block_a_home" },
    ],
  },
} as unknown as Program;

function baseStore(overrides?: Partial<Store>): Store {
  return {
    version: 2,
    logs: {},
    training_maxes: {},
    cycle: { phase_id: null, cycle_number: 1, week_in_cycle: 1 },
    ...overrides,
  } as Store;
}

// Week of Mon 2026-08-17 → Sun 2026-08-23. "Today" = Thu 2026-08-20:
// Mon (17th, strength) and Wed (19th, strength) are past; Fri (21st,
// strength) is future.
const TODAY = "2026-08-20";
const MON = "2026-08-17";
const WED = "2026-08-19";
// Fri 2026-08-21 is the week's third strength day, always in the future
// relative to TODAY — exercised via totalScheduledThisWeek/
// remainingScheduledCount below, no separate reference needed.

describe("detectMissedWeek", () => {
  it("returns null when nothing is missed", () => {
    const store = baseStore({
      logs: {
        [MON]: { date: MON, exercises: { "b:x": { done: true } } } as unknown as Store["logs"][string],
        [WED]: { date: WED, exercises: { "b:x": { done: true } } } as unknown as Store["logs"][string],
      },
    });
    expect(detectMissedWeek(program, store, undefined, TODAY)).toBeNull();
  });

  it("flags a past scheduled strength day with nothing logged", () => {
    const store = baseStore({
      logs: {
        [MON]: { date: MON, exercises: { "b:x": { done: true } } } as unknown as Store["logs"][string],
        // Wed: nothing logged.
      },
    });
    const signal = detectMissedWeek(program, store, undefined, TODAY);
    expect(signal).not.toBeNull();
    expect(signal!.missedDates).toEqual([WED]);
    expect(signal!.weekStartISO).toBe(MON);
    // Mon + Wed + Fri are the week's three strength days.
    expect(signal!.totalScheduledThisWeek).toBe(3);
    // Fri is future and not yet done/skipped — counts as remaining.
    expect(signal!.remainingScheduledCount).toBe(1);
  });

  it("does not flag a day that was explicitly skipped", () => {
    const store = baseStore({
      logs: {
        [MON]: { date: MON, exercises: { "b:x": { done: true } } } as unknown as Store["logs"][string],
      },
      skipped: { [WED]: { reason: "busy" } },
    });
    expect(detectMissedWeek(program, store, undefined, TODAY)).toBeNull();
  });

  it("does not flag today or future days, even if unlogged", () => {
    // Only Mon is in the past relative to TODAY=Wed; Mon is logged, so
    // nothing should be flagged even though Fri (future) has nothing.
    const store = baseStore({
      logs: {
        [MON]: { date: MON, exercises: { "b:x": { done: true } } } as unknown as Store["logs"][string],
      },
    });
    const signal = detectMissedWeek(program, store, undefined, WED);
    expect(signal).toBeNull();
  });

  it("a logged run (no exercise done) also counts as not missed", () => {
    const store = baseStore({
      logs: {
        [MON]: { date: MON, exercises: {} } as unknown as Store["logs"][string],
        [WED]: {
          date: WED,
          exercises: {},
          runs: [{ activity_type: "run" }],
        } as unknown as Store["logs"][string],
      },
    });
    // Mon has an exercises map but nothing done → still missed. Wed has a
    // logged run → not missed.
    const signal = detectMissedWeek(program, store, undefined, TODAY);
    expect(signal).not.toBeNull();
    expect(signal!.missedDates).toEqual([MON]);
  });
});
