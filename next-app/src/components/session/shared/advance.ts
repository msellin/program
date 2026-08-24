import type { RailExercise } from "@/components/session/DaySession";

/**
 * What the session moves to when the rest timer ends.
 *
 * Both shells (DaySession, OffPlanSession) had this branch inlined in
 * their `onDone` handler, and RestTakeover separately rendered "Next up"
 * as `railExercises[activeIdx + 1]` — the next EXERCISE. Those disagreed:
 * rest after set 1 of 5 announced the next exercise while the timer
 * actually advanced to set 2 of the same lift. One computation now feeds
 * both the label and the advance.
 */
export type UpNext =
  | { kind: "set"; setIndex: number; rail: RailExercise }
  | { kind: "exercise"; rail: RailExercise }
  | { kind: "done" };

export function nextAfterSet(
  railExercises: RailExercise[],
  activeIdx: number,
  loggedForActive: number,
): UpNext {
  const active = railExercises[activeIdx];
  if (!active) return { kind: "done" };
  if (loggedForActive < active.rowCount) {
    return { kind: "set", setIndex: loggedForActive, rail: active };
  }
  const next = railExercises[activeIdx + 1];
  return next ? { kind: "exercise", rail: next } : { kind: "done" };
}
