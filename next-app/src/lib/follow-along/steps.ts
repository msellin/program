/**
 * Follow-along: a block becomes a flat list of steps, one effort per screen
 * (2026-10-19). Pure — the player owns time and logging.
 *
 * Dose precedence matches SetView (BUG-42): the block item's own numbers win
 * over the library default. Per-side work interleaves L, R per set; a
 * programme's `extra_set_side` adds one more set on that side, at the end.
 *
 * Logging shape matches manual logging exactly: a per-side set is ONE set
 * entry covering both sides (SetView runs side 1 then side 2 inside one set),
 * so both side-steps of set n carry `setIndex: n - 1`. The extra side's set
 * is its own index. History therefore reads the same whichever way the user
 * logged.
 */
import type { Exercise, Block } from "@/lib/schemas";
import { figureFor } from "@/lib/figures/exercise-figures";

export type StepSide = "L" | "R" | "B" | "E";

export type FollowStep = {
  /** Store key `${blockId}:${exerciseId}`. */
  key: string;
  blockId: string;
  exerciseId: string;
  name: string;
  cue: string | null;
  figure: string | null;
  videoUrl: string | null;
  videoSearch: string;
  kind: "hold" | "reps";
  seconds: number | null;
  reps: number | null;
  side: StepSide;
  set: number;
  of: number;
  setIndex: number;
  /** Rest before the NEXT step; 0 on the last. */
  restSeconds: number;
  optional: boolean;
};

export type FollowInput = {
  blockId: string;
  exercise: Exercise;
  item: NonNullable<Block["items"]>[number];
};

/**
 * Per-side exercises done as alternating reps inside one set ("6 each side,
 * alternating") rather than one side then the other. Their figure alternates
 * too.
 */
const ALTERNATING = new Set(["dead_bug"]);

function num(o: Record<string, unknown> | undefined, k: string): number | null {
  const v = o?.[k];
  return typeof v === "number" ? v : null;
}

export function buildSteps(inputs: FollowInput[]): FollowStep[] {
  const out: Omit<FollowStep, "restSeconds">[] = [];
  for (const { blockId, exercise, item } of inputs) {
    const def = exercise.default ?? {};
    const it = item as unknown as Record<string, unknown>;
    const reps = num(it, "reps") ?? num(def, "reps");
    const minutes = num(def, "minutes_per_set") ?? num(def, "minutes");
    const hold = num(it, "hold_seconds") ?? num(def, "hold_seconds") ?? (minutes != null ? minutes * 60 : null);
    // Same fallback as the session rail (DaySession: item → default → 3), so the
    // Brief's "3 sets" and the player never disagree about an undosed count.
    const sets = num(it, "sets") ?? num(def, "sets") ?? 3;
    const perSide = def.per_side === true;
    const extra = def.extra_set_side === "left" ? "L" : def.extra_set_side === "right" ? "R" : null;
    const kind: FollowStep["kind"] = hold != null && reps == null ? "hold" : "reps";

    const sides: [StepSide, number][] = !perSide
      ? [["B", sets]]
      : ALTERNATING.has(exercise.id)
        ? [["E", sets]]
        : [
            ["L", sets + (extra === "L" ? 1 : 0)],
            ["R", sets + (extra === "R" ? 1 : 0)],
          ];
    const max = Math.max(...sides.map(([, n]) => n));
    for (let i = 0; i < max; i++) {
      for (const [side, n] of sides) {
        if (i >= n) continue;
        out.push({
          key: `${blockId}:${exercise.id}`,
          blockId,
          exerciseId: exercise.id,
          name: exercise.name,
          cue: exercise.cues?.[0] ?? null,
          figure: figureFor(exercise.id),
          videoUrl: exercise.video_url ?? null,
          videoSearch: exercise.video_search ?? `${exercise.name} exercise form`,
          kind,
          seconds: kind === "hold" ? hold : null,
          reps: kind === "reps" ? (reps ?? 1) : null,
          side,
          set: i + 1,
          of: n,
          setIndex: i,
          optional: item.optional === true,
        });
      }
    }
  }
  return out.map((s, i) => ({ ...s, restSeconds: restBetween(s, out[i + 1]) }));
}

/**
 * Rest between two steps. Short on purpose: these are 20-second holds and
 * bodyweight sets, not barbell work, and `restSecondsFor` (2 min for an
 * isometric) would make a 12-minute home block take 40. The user can always
 * add 15 s, and nothing starts until they tap Start.
 */
export function restBetween(a: Omit<FollowStep, "restSeconds">, b?: Omit<FollowStep, "restSeconds">): number {
  if (!b) return 0;
  if (b.exerciseId === a.exerciseId && b.setIndex === a.setIndex) return 5; // switch sides
  if (b.exerciseId === a.exerciseId) return a.kind === "hold" ? 15 : 30;
  return 20; // next exercise: set up
}
