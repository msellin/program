import { describe, it, expect } from "vitest";
import { storeSchema } from "@/lib/schemas";

/**
 * Removed store keys must stay parseable (added 2026-09-11 with H2, widened
 * 2026-09-14 when the whole `cycle` object went).
 *
 * `cycle.phase_id` was deleted first because nothing read it; then
 * `cycle_number` and `week_in_cycle` turned out to have no readers either, so
 * `store.cycle` went entirely. The safety of both deletes rests on a single
 * Zod behaviour — unknown keys are stripped, not rejected — and that behaviour
 * was originally asserted in a code comment and nowhere else.
 *
 * This repo has been bitten precisely there before: `daily_log_schema` and
 * `progression_rules.states[]` were both authored in good faith and silently
 * discarded, and the silence is what made them survive for months. A comment
 * claiming "old data still parses" is the same kind of unverified assertion.
 * So it is a test.
 *
 * Every user's stored store, every Supabase snapshot and all 37 persona
 * artifacts still carry a `cycle` object. If a future schema change turns
 * `storeSchema` strict, this fails here rather than locking people out of
 * their own multi-year history.
 */
describe("a store written before a key was removed still loads", () => {
  it("strips the whole cycle object instead of rejecting the store", () => {
    const legacy = {
      version: 2,
      logs: {},
      training_maxes: {},
      cycle: { phase_id: null, cycle_number: 3, week_in_cycle: 2 },
    };

    const parsed = storeSchema.safeParse(legacy);

    expect(parsed.success, "a pre-2026-09-14 store must still parse").toBe(true);
    if (!parsed.success) return;
    expect(
      (parsed.data as Record<string, unknown>).cycle,
      "cycle should be dropped, not carried forward as dead weight",
    ).toBeUndefined();
  });

  it("accepts the non-null phase_id the fixtures used", () => {
    // `adapt.test.ts` and `failed-attempt.test.ts` wrote "phase_test" and "p1".
    // Only `null` appears in the shipped artifacts, but the string form was
    // real and may sit in a founder-era store.
    const parsed = storeSchema.safeParse({
      version: 2,
      logs: {},
      training_maxes: {},
      cycle: { phase_id: "phase_test", cycle_number: 1, week_in_cycle: 1 },
    });

    expect(parsed.success).toBe(true);
  });

  it("keeps the rest of a legacy store intact while dropping cycle", () => {
    // The failure this guards against is a delete that is not scoped: a
    // schema change that drops `cycle` AND quietly loses the logs beside it
    // would also pass the assertion above.
    const parsed = storeSchema.safeParse({
      version: 2,
      logs: {
        "2026-01-05": {
          date: "2026-01-05",
          exercises: {},
          symptoms: null,
          derived_state: null,
        },
      },
      training_maxes: { back_squat: 140 },
      cycle: { cycle_number: 9, week_in_cycle: 3 },
    });

    expect(parsed.success).toBe(true);
    if (!parsed.success) return;
    expect(Object.keys(parsed.data.logs)).toEqual(["2026-01-05"]);
    expect(parsed.data.training_maxes.back_squat).toBe(140);
  });

  it("no longer requires cycle on a newly written store", () => {
    // The other direction: a store created today has no `cycle` at all, and
    // must be valid. If `cycle` were still required this would fail, which is
    // what would happen if the schema edit were reverted without this file.
    const parsed = storeSchema.safeParse({ version: 2, logs: {}, training_maxes: {} });
    expect(parsed.success, "a store written after the removal must parse").toBe(true);
  });
});
