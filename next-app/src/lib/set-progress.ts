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
