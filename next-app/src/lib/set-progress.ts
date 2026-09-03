/**
 * One definition of "this set is logged" (2026-08-31).
 *
 * Founder bug report from the 31 Aug session: on dead bug and Pallof
 * press, saving set 2 or 3 bounced back to set 1 and the exercise never
 * read as done. Cause: seven separate call sites each open-coded
 * `s.weight_kg != null && s.reps != null`, but `SetView.confirm` writes
 * `weight_kg: null` on purpose for non-loadable exercises — a dead bug
 * has no weight. So a correctly logged bodyweight set could never satisfy
 * the predicate, and every counter read zero:
 *
 *   - `firstUnfinishedSetIndex` returned 0 → resume always landed on set 1
 *   - the rail's `n/m` and the Brief's "Done" tag never advanced
 *   - `totalRemaining` overcounted the sets left in the session
 *
 * SetView's own `loggedAt` already had the rule right, and its comment
 * claimed it was "the same rule DaySession/OffPlanSession use ... so the
 * pips and the rail's n/m never disagree". They did disagree. That claim
 * is only true if there is one implementation, so here it is.
 *
 * `isLoadable` is the caller's, from `["strength","unilateral"].includes(
 * exercise.category)` — the same gate `RailExercise` carries.
 */
import type { SetLog } from "./schemas";

export function isSetLogged(set: SetLog | undefined | null, isLoadable: boolean): boolean {
  if (!set || set.reps == null) return false;
  return isLoadable ? set.weight_kg != null : true;
}

export function countLoggedSets(sets: SetLog[], isLoadable: boolean): number {
  return sets.filter((s) => isSetLogged(s, isLoadable)).length;
}

/**
 * How many of an exercise's rows count as REQUIRED work (2026-09-03).
 *
 * Optional work is real work — it renders, it logs, it counts once you do
 * it. What it must not do is make a finished session read as unfinished.
 * Three call sites need that number (the Brief's summary, SetView's "sets
 * left", `nextAfterSet`), and the set-progress bug above is what happens
 * when three call sites each open-code the same rule. So: one function.
 *
 * - Whole-exercise optional (`item.optional`) → 0 required rows.
 * - Trailing optional rows (taper FSL) → `rowCount - optionalRows`.
 */
export function requiredRowCount(r: {
  rowCount: number;
  optional?: boolean;
  optionalRows?: number;
}): number {
  if (r.optional) return 0;
  return Math.max(0, r.rowCount - (r.optionalRows ?? 0));
}

/** True when this row index falls in the exercise's optional tail. */
export function isOptionalRow(
  r: { rowCount: number; optional?: boolean; optionalRows?: number },
  rowIndex: number,
): boolean {
  if (r.optional) return true;
  return rowIndex >= requiredRowCount(r);
}
