import { entrySets } from "@/lib/useStore";
import { isMadeSet } from "@/lib/set-progress";
import type { SetLog, Store } from "@/lib/schemas";
import type { RailExercise } from "@/components/session/DaySession";

type Logs = Store["logs"];

export type BestSet = { exerciseId: string; name: string; label: string; isPB: boolean };

/** Totals over what was really logged on `date`. Nothing is estimated. */
export function sessionTotals(rail: RailExercise[], logs: Logs, date: string) {
  let reps = 0;
  let holdSeconds = 0;
  for (const r of rail) {
    for (const s of entrySets(logs[date]?.exercises?.[r.key] ?? null)) {
      if (!isMadeSet(s, r.isLoadable)) continue;
      reps += s.reps ?? 0;
      holdSeconds += s.seconds ?? 0;
    }
  }
  return { reps, holdSeconds };
}

function legacySet(entry: { weight_kg?: number | null; reps?: number | null }): SetLog[] {
  return entry.reps != null ? [{ weight_kg: entry.weight_kg ?? null, reps: entry.reps }] : [];
}

/** Every lifted set for an exercise on dates strictly before `date`. */
function priorSets(logs: Logs, exerciseId: string, date: string, isLoadable: boolean): SetLog[] {
  const out: SetLog[] = [];
  for (const [d, day] of Object.entries(logs)) {
    if (d >= date) continue;
    for (const [key, entry] of Object.entries(day.exercises)) {
      if (!key.endsWith(":" + exerciseId)) continue;
      const sets = entry.sets?.length ? entry.sets : legacySet(entry);
      for (const s of sets) if (isMadeSet(s, isLoadable)) out.push(s);
    }
  }
  return out;
}

function sameKind(s: SetLog) {
  return s.seconds != null && s.seconds > 0 ? "hold" : "reps";
}

function beats(s: SetLog, prior: SetLog[], isLoadable: boolean): boolean {
  if (sameKind(s) === "hold") {
    return prior.every((p) => (p.seconds ?? 0) < (s.seconds ?? 0));
  }
  if (isLoadable) {
    const w = s.weight_kg ?? 0;
    const r = s.reps ?? 0;
    return prior.every((p) => !((p.weight_kg ?? 0) >= w && (p.reps ?? 0) >= r));
  }
  return prior.every((p) => (p.reps ?? 0) < (s.reps ?? 0));
}

function setLabel(s: SetLog, isLoadable: boolean): string {
  if (sameKind(s) === "hold") return `${s.seconds} s hold`;
  if (isLoadable && s.weight_kg) return `${s.weight_kg} kg × ${s.reps}`;
  return `${s.reps} reps`;
}

/**
 * The best set of the session. `isPB` is true ONLY when earlier logged history
 * for the same exercise exists and this set beats every one of those sets
 * (same dominance rule as lib/pr.ts). A first-ever log is not a PB: nothing
 * proves it. Returns null when nothing was lifted.
 */
export function bestSetOfSession(rail: RailExercise[], logs: Logs, date: string): BestSet | null {
  let best: { r: RailExercise; s: SetLog } | null = null;
  let bestPB: { r: RailExercise; s: SetLog } | null = null;
  const score = (s: SetLog) =>
    sameKind(s) === "hold" ? (s.seconds ?? 0) : (s.weight_kg ?? 0) * 1000 + (s.reps ?? 0);
  for (const r of rail) {
    const sets = entrySets(logs[date]?.exercises?.[r.key] ?? null).filter((s) => isMadeSet(s, r.isLoadable));
    if (!sets.length) continue;
    const prior = priorSets(logs, r.exercise.id, date, r.isLoadable);
    for (const s of sets) {
      if (!best || score(s) > score(best.s)) best = { r, s };
      if (prior.length > 0 && beats(s, prior, r.isLoadable) && (!bestPB || score(s) > score(bestPB.s))) {
        bestPB = { r, s };
      }
    }
  }
  const pick = bestPB ?? best;
  if (!pick) return null;
  return {
    exerciseId: pick.r.exercise.id,
    name: pick.r.exercise.name,
    label: setLabel(pick.s, pick.r.isLoadable),
    isPB: bestPB !== null,
  };
}

/** The program's next planned block after `date` — day + focus, or null. */
export function nextPlanned(
  scheduled: Store["scheduled_blocks"] | undefined,
  slug: string,
  date: string,
): { date: string; blockId: string } | null {
  const next = Object.values(scheduled ?? {})
    .filter((b) => b.program_slug === slug && b.state === "planned" && b.actual_date > date)
    .sort((a, b) => a.actual_date.localeCompare(b.actual_date))[0];
  return next ? { date: next.actual_date, blockId: next.block_template_id } : null;
}
