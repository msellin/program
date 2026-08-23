import type { Program, Phase, Exercise } from "@/lib/schemas";

/**
 * Day redesign (2026-08-23) — pure display-formatting helpers extracted
 * from `TodaySession.tsx` so `DaySession.tsx` (the new /session/[slug]
 * shell) can reuse the exact same logic instead of re-deriving it.
 * Dashboard mode (`/`, via TodaySession.tsx) imports these too — behavior
 * for `/` is unchanged, just relocated.
 */

/**
 * Slug title-case matches the manifest name for every current program;
 * `program_goal.display_name` is often the target metric ("Loaded
 * overhead shoulder flexion") and reads as a bug. Same anti-pattern
 * reveal-copy.ts + BlockHistorySection.tsx already fix.
 */
export function programDisplayName(_program: Program, slug: string): string {
  return slug
    .split("-")
    .map((w) => (w.length ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

// Strip only obvious dev / phase-scope suffixes. Keep em-dash context intact:
// "Week 1 — pure Z1 introduction" is the phase's actual intent and the user
// wants to see it. Only kill parentheticals that look like phase-scope hints
// ("(Phase 1 weeks 0-1)") or explicit developer tags ("(sub-goal)").
export function humanPhaseName(name: string): string {
  return name
    .replace(/\s*\((?:Phase|weeks?|week|sub-goal|dev|internal)\b[^)]*\)\s*$/i, "")
    .trim();
}

// Same idea for block names: the source data carries phase-scope hints like
// "(Phase 1 weeks 0-1)" which are misleading when read literally by a user
// looking at Today (they imply the phase is only 2 weeks long).
export function humanBlockName(name: string): string {
  return name.replace(/\s*\((?:Phase|weeks?|week)\b[^)]*\)\s*$/i, "").trim();
}

/**
 * Turn a phase and today's date into a "week N of M · ends dd Mon" line.
 * That way the user always sees where they are in the phase, and never has
 * to infer duration from a misleading block-name parenthetical.
 */
export function phaseProgress(phase: Phase, dateISO: string): string | null {
  if (!phase.starts || !phase.ends) return null;
  const start = new Date(phase.starts + "T00:00:00");
  const end = new Date(phase.ends + "T00:00:00");
  const today = new Date(dateISO + "T00:00:00");
  if (today < start || today > end) return null;
  const daysIn = Math.floor((today.getTime() - start.getTime()) / 864e5);
  const totalDays = Math.floor((end.getTime() - start.getTime()) / 864e5) + 1;
  const currentWeek = Math.floor(daysIn / 7) + 1;
  const totalWeeks = Math.max(1, Math.ceil(totalDays / 7));
  const endsShort = end.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  return `week ${currentWeek} of ${totalWeeks} · ends ${endsShort}`;
}

/**
 * Same math as phaseProgress but returns the numeric pair so
 * ArcProgressBar can render a real progress bar. Returns null when phase
 * has no start/end anchors or when the date falls outside.
 */
export function phaseWeekPair(
  phase: Phase | null | undefined,
  dateISO: string,
): { current: number; total: number } | null {
  if (!phase || !phase.starts || !phase.ends) return null;
  const start = new Date(phase.starts + "T00:00:00");
  const end = new Date(phase.ends + "T00:00:00");
  const today = new Date(dateISO + "T00:00:00");
  if (today < start || today > end) return null;
  const daysIn = Math.floor((today.getTime() - start.getTime()) / 864e5);
  const totalDays = Math.floor((end.getTime() - start.getTime()) / 864e5) + 1;
  return {
    current: Math.floor(daysIn / 7) + 1,
    total: Math.max(1, Math.ceil(totalDays / 7)),
  };
}

// Merge duplicate exercise entries in the same block (e.g. squat "main" + squat "volume"),
// keeping the first occurrence but appending secondary schemes so the card still shows both.
export function dedupeItems<T extends { exercise_id?: string | null; scheme?: string }>(
  items: T[],
): T[] {
  const seen = new Map<string, number>();
  const out: T[] = [];
  for (const it of items) {
    if (!it.exercise_id) {
      out.push(it);
      continue;
    }
    const idx = seen.get(it.exercise_id);
    if (idx == null) {
      seen.set(it.exercise_id, out.length);
      out.push(it);
    } else if (it.scheme) {
      // Merge scheme text so the card indicates both roles in one card
      const existing = out[idx];
      const merged: T = {
        ...existing,
        scheme: existing.scheme ? `${existing.scheme} · then ${it.scheme}` : it.scheme,
      };
      out[idx] = merged;
    }
  }
  return out;
}

/** Rest duration by exercise category — ported from ExerciseCard.tsx. */
export function restSecondsFor(ex: Exercise): number {
  if (ex.category === "strength") return 180;
  if (ex.category === "unilateral") return 90;
  if (ex.category === "trunk" || ex.category === "mobility") return 60;
  return 120;
}
