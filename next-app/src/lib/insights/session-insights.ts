import type { SetLog, Store } from "@/lib/schemas";
import { lastSessionFor } from "@/lib/engine/history";

/** RPE the set screen records for its "Easy" tile (4+ reps left). */
const EASY_RPE = 6;
const MAX_LINES = 3;

export type InsightExercise = {
  /** Store log key, `${blockId}:${exerciseId}`. */
  key: string;
  exerciseId: string;
  name: string;
  isLoadable: boolean;
  /** Names the movement counts toward "logged / planned". */
  planned: boolean;
};

const made = (s: SetLog, loadable: boolean): boolean =>
  s.reps != null && s.reps > 0 && (!loadable || (s.weight_kg != null && s.weight_kg > 0));

function setsOf(
  entry: Store["logs"][string]["exercises"][string] | undefined | null,
): SetLog[] {
  if (!entry) return [];
  if (entry.sets?.length) return entry.sets;
  return entry.reps != null ? [{ weight_kg: entry.weight_kg ?? null, reps: entry.reps }] : [];
}

const kg = (n: number) => `${Number.isInteger(n) ? n : n.toFixed(1)}`;

/**
 * Up to three templated sentences about the session just finished. Every line
 * names the log signal it came from; a line that the log cannot prove is
 * skipped, never guessed. No score, no claim about strength or health.
 */
export function sessionInsights(
  exercises: InsightExercise[],
  store: Pick<Store, "logs" | "training_maxes">,
  date: string,
): string[] {
  const day = store.logs[date];
  const tms = (store.training_maxes ?? {}) as Record<string, number>;
  const repLines: string[] = [];
  const easyLines: string[] = [];

  for (const ex of exercises) {
    if (!ex.isLoadable) continue;
    const sets = setsOf(day?.exercises?.[ex.key]).filter((s) => made(s, true));
    if (sets.length === 0) continue;

    // Reps against last time at the same weight.
    const top = sets.reduce((a, b) => ((b.weight_kg ?? 0) > (a.weight_kg ?? 0) ? b : a));
    const w = top.weight_kg as number;
    const bestToday = Math.max(...sets.filter((s) => s.weight_kg === w).map((s) => s.reps as number));
    const prev = lastSessionFor(store as Store, ex.exerciseId, date);
    const prevSame = prev?.sets.filter((s) => s.weight_kg === w && s.reps != null) ?? [];
    if (prevSame.length) {
      const diff = bestToday - Math.max(...prevSame.map((s) => s.reps as number));
      if (diff > 0) {
        repLines.push(
          `${ex.name} ${kg(w)} × ${bestToday}: ${diff} more ${diff === 1 ? "rep" : "reps"} than last time at this weight`,
        );
        continue;
      }
    }

    // Every set logged Easy, at one weight, against a working max that exists.
    const tm = tms[ex.exerciseId];
    const weights = new Set(sets.map((s) => s.weight_kg));
    if (sets.length >= 3 && weights.size === 1 && tm > 0 && sets.every((s) => s.rpe != null && s.rpe <= EASY_RPE)) {
      easyLines.push(
        `${ex.name}: all ${sets.length} sets Easy at ${kg(w)} kg (${Math.round((w / tm) * 100)}% of your working max)`,
      );
    }
  }

  const lines = [...repLines, ...easyLines];

  const planned = exercises.filter((e) => e.planned);
  const missing = planned.filter(
    (e) => !setsOf(day?.exercises?.[e.key]).some((s) => made(s, e.isLoadable) || (s.reps != null && s.reps > 0)),
  );
  if (planned.length > 1 && missing.length > 0 && missing.length < planned.length) {
    lines.push(
      `${planned.length - missing.length} of ${planned.length} exercises logged — ${missing.map((m) => m.name).join(", ")} not logged`,
    );
  }
  return lines.slice(0, MAX_LINES);
}
