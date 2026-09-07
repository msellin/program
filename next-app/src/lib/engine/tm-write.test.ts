import { describe, it, expect } from "vitest";
import type { Store } from "../schemas";
import { validateTMWrite } from "./tm-write";

function storeWith(
  sets: Array<{ date: string; weight_kg: number; reps: number; failed?: boolean }>,
): Store {
  const logs: Record<string, unknown> = {};
  for (const s of sets) {
    const day = (logs[s.date] ??= { date: s.date, exercises: {} }) as {
      exercises: Record<string, { sets: unknown[] }>;
    };
    const key = "block_x:back_squat_highbar";
    (day.exercises[key] ??= { sets: [] }).sets.push({
      weight_kg: s.weight_kg,
      reps: s.failed ? 0 : s.reps,
      ...(s.failed ? { failed: true } : {}),
    });
  }
  return { version: 2, logs, training_maxes: {} } as unknown as Store;
}

/**
 * The engine may not write a training max the log rules out. A person may.
 *
 * Five call sites reach `setTM` — a manual edit, an accepted card suggestion,
 * the cycle rollover, the adaptive `tm_bump` proposal, and intake — and none
 * consulted `tm-plausibility`. On 2026-09-07 the adaptive path proposed
 * raising a front-squat TM to 112.5 for a user who had maxed 115 at RPE 10 six
 * days earlier and failed 122 before that. It was accepted.
 *
 * The split this file enforces is between two kinds of claim that had been
 * treated as one:
 *
 *   HARD — "you failed 122". Your 1RM is under 122. Arithmetic; blocks the
 *   engine.
 *   SOFT — "your 5×5 implies ~134". A prediction equation carrying ~9.8%
 *   standard error (Greig 2023, PMID 37493929) — larger than the 6-7%
 *   discrepancies this mechanism exists to notice. Warns; never blocks.
 *
 * The second one is the discipline that took a week to learn: do not report an
 * instrument's noise back to the user as a finding.
 */
describe("validateTMWrite", () => {
  const failed122 = storeWith([
    { date: "2026-09-01", weight_kg: 110, reps: 2 },
    { date: "2026-09-01", weight_kg: 115, reps: 1 },
    { date: "2026-09-01", weight_kg: 122, reps: 0, failed: true },
  ]);

  it("blocks an automated write above a failed attempt", () => {
    const v = validateTMWrite(failed122, "back_squat_highbar", 125, "bump");
    expect(v.ok).toBe(false);
    expect(v.violations.map((x) => x.kind)).toContain("above_failed_attempt");
  });

  it("allows the same write from a person, and keeps the receipt", () => {
    // Overruling your own log is a choice, and it is the user's to make. What
    // must not happen is it being made silently or by the engine.
    const v = validateTMWrite(failed122, "back_squat_highbar", 125, "manual");
    expect(v.ok).toBe(true);
    expect(v.violations.map((x) => x.kind)).toContain("above_failed_attempt");
  });

  it("does not treat the heaviest lifted weight as a ceiling", () => {
    /**
     * The trap `tm-plausibility` already avoided and this nearly reintroduced.
     * Working up to 115 and then missing 122 puts the true single in
     * [115, 122) — so the heaviest MADE lift is a floor under the 1RM, not a
     * ceiling over the TM. A TM of 116 is not impossible; it is merely high.
     */
    const madeOnly = storeWith([
      { date: "2026-09-01", weight_kg: 110, reps: 2 },
      { date: "2026-09-01", weight_kg: 115, reps: 1 },
    ]);
    const v = validateTMWrite(madeOnly, "back_squat_highbar", 116, "bump");
    expect(v.violations.map((x) => x.kind)).not.toContain("above_failed_attempt");
    expect(v.ok).toBe(true);
  });

  it("stays quiet inside the estimator's own error", () => {
    // 115×5 implies a single around 134. A TM of 120 is 10% under that and a
    // TM of 140 is only 4% over — inside 9.8% SEE either way. Flagging there
    // would be reporting measurement noise as a finding.
    const fives = storeWith([{ date: "2026-08-26", weight_kg: 115, reps: 5 }]);
    expect(validateTMWrite(fives, "back_squat_highbar", 140, "bump").violations).toEqual([]);
  });

  it("warns, without blocking, well outside that error", () => {
    const fives = storeWith([{ date: "2026-08-26", weight_kg: 115, reps: 5 }]);
    const v = validateTMWrite(fives, "back_squat_highbar", 175, "bump");
    expect(v.violations.map((x) => x.kind)).toContain("far_above_estimate");
    // Soft: an estimate that carries 10% error does not get to veto anything.
    expect(v.ok).toBe(true);
  });

  it("rejects a value that is not a weight, whoever asks", () => {
    for (const source of ["manual", "bump", "test"] as const) {
      expect(validateTMWrite(failed122, "back_squat_highbar", 900, source).ok).toBe(false);
      expect(validateTMWrite(failed122, "back_squat_highbar", 0, source).ok).toBe(false);
    }
  });

  it("permits a sane write with an empty log", () => {
    // A new user has no bounds to violate, and must not be blocked by that.
    expect(validateTMWrite(storeWith([]), "back_squat_highbar", 100, "intake").ok).toBe(true);
  });
});
