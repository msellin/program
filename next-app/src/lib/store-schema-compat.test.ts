import { describe, it, expect } from "vitest";
import { storeSchema } from "@/lib/schemas";

/**
 * Removed store keys must stay parseable (added 2026-09-11 with H2).
 *
 * `cycle.phase_id` was deleted from `storeSchema` because nothing read it. The
 * safety of that delete rests entirely on a Zod behaviour — unknown keys are
 * stripped, not rejected — and that behaviour was asserted in a code comment
 * and nowhere else.
 *
 * This repo has been bitten precisely there before: `daily_log_schema` and
 * `progression_rules.states[]` were both authored in good faith and silently
 * discarded, and the silence is what made them survive for months. A comment
 * claiming "old data still parses" is the same kind of unverified assertion.
 * So it is a test.
 *
 * Every user's stored store and all 37 persona artifacts still carry
 * `"phase_id"`. If a future schema change makes `cycle` strict, this fails
 * rather than locking those users out of their own history.
 */
describe("a store written before a key was removed still loads", () => {
  it("strips cycle.phase_id instead of rejecting the store", () => {
    const legacy = {
      version: 2,
      logs: {},
      training_maxes: {},
      cycle: { phase_id: null, cycle_number: 3, week_in_cycle: 2 },
    };

    const parsed = storeSchema.safeParse(legacy);

    expect(parsed.success, "a pre-2026-09-11 store must still parse").toBe(true);
    if (!parsed.success) return;
    expect((parsed.data.cycle as Record<string, unknown>).phase_id).toBeUndefined();
    // The surviving siblings must come through untouched — the delete was
    // scoped to one key, and a store losing its cycle counters would be a
    // different and much worse change.
    expect(parsed.data.cycle.cycle_number).toBe(3);
    expect(parsed.data.cycle.week_in_cycle).toBe(2);
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
});
