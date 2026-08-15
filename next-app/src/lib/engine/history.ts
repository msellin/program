import type { Store, SetLog } from "../schemas";

/**
 * The last session's set array for a given exercise, if any.
 *
 * Used by ExerciseCard to pre-fill SetRow placeholders — the single most-praised
 * feature in Strong / Hevy reviews. Removes cognition: last session's numbers
 * appear as ghost text; user overwrites if going up, or keeps them by moving on.
 *
 * "Last session" = the most recent prior date with at least one set that has
 * a positive weight AND reps. Ties broken by date order (later wins).
 */
export function lastSessionSetsFor(
  store: Store,
  exerciseId: string,
  todayISO: string,
): SetLog[] | null {
  const dates = Object.keys(store.logs)
    .filter((d) => d < todayISO)
    .sort()
    .reverse();

  for (const d of dates) {
    const day = store.logs[d];
    for (const [key, entry] of Object.entries(day.exercises)) {
      if (!key.endsWith(":" + exerciseId)) continue;
      const sets = entry.sets ?? [];
      const anyLogged = sets.some(
        (s) => s.weight_kg != null && s.weight_kg > 0 && s.reps != null && s.reps > 0,
      );
      if (anyLogged) return sets;
      // Legacy single-value entry (pre-sets migration) — synthesise a single set.
      if (
        entry.weight_kg != null &&
        entry.weight_kg > 0 &&
        entry.reps != null &&
        entry.reps > 0
      ) {
        return [
          {
            weight_kg: entry.weight_kg,
            reps: entry.reps,
            rpe: entry.rpe ?? null,
          },
        ];
      }
    }
  }
  return null;
}
