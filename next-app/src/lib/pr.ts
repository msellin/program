import type { Store, ExerciseLog, SetLog } from "./schemas";

/**
 * PR detector — is (weight, reps) a new personal record for exId
 * considering all logs in the store strictly BEFORE the current date?
 *
 * Rule: PR if there is no prior set with (weight >= current AND reps >= current).
 * Simple heuristic that catches:
 *   - New heaviest weight at any rep count → PR
 *   - Same weight at higher reps → PR (rep PR)
 *   - Lower weight for more reps than any prior → PR (rep PR at lower load)
 */
export function isSetPR(
  store: Store,
  exId: string,
  weight: number,
  reps: number,
  ownDateISO: string,
): boolean {
  if (!weight || !reps || weight <= 0 || reps <= 0) return false;
  for (const [date, day] of Object.entries(store.logs)) {
    if (date >= ownDateISO) continue;
    for (const [key, entry] of Object.entries(day.exercises)) {
      if (!key.endsWith(":" + exId)) continue;
      if (setsMeetOrBeat(entry.sets, weight, reps)) return false;
      if (
        entry.weight_kg != null &&
        entry.reps != null &&
        entry.weight_kg >= weight &&
        entry.reps >= reps
      ) {
        return false;
      }
    }
  }
  return true;
}

function setsMeetOrBeat(
  sets: SetLog[] | undefined,
  weight: number,
  reps: number,
): boolean {
  if (!sets) return false;
  return sets.some(
    (s) => s.weight_kg != null && s.reps != null && s.weight_kg >= weight && s.reps >= reps,
  );
}

/** Given today's logged sets for an exercise, count how many are PRs relative to prior days. */
export function prCountForToday(
  store: Store,
  exId: string,
  entry: ExerciseLog | null,
  dateISO: string,
): number {
  if (!entry) return 0;
  let count = 0;
  const sets = entry.sets ?? [];
  for (const s of sets) {
    if (s.weight_kg && s.reps && isSetPR(store, exId, s.weight_kg, s.reps, dateISO)) {
      count++;
    }
  }
  // legacy single-set support
  if (
    sets.length === 0 &&
    entry.weight_kg != null &&
    entry.reps != null &&
    isSetPR(store, exId, entry.weight_kg, entry.reps, dateISO)
  ) {
    count++;
  }
  return count;
}
