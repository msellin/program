import type { Exercise } from "@/lib/schemas";

/**
 * What a set of an exercise records. The category used to stand in for this
 * (strength/unilateral = a kilo counter), which put "0 kg" on nordic curls,
 * sled pushes and weighted pull-ups. `exercises.json` sets `logging` only where
 * the category default is wrong.
 */
export type LoggingKind = NonNullable<Exercise["logging"]>;

export function loggingKind(exercise: Pick<Exercise, "category" | "logging">): LoggingKind {
  if (exercise.logging) return exercise.logging;
  return ["strength", "unilateral"].includes(exercise.category) ? "load_reps" : "bodyweight_reps";
}

/** Kinds that carry a load figure on the set screen. */
export function isLoadable(exercise: Pick<Exercise, "category" | "logging">): boolean {
  const k = loggingKind(exercise);
  return k === "load_reps" || k === "load_optional" || k === "distance_load";
}
