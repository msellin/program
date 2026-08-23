import type { Program, Store } from "@/lib/schemas";
import { activePhaseFor } from "./schedule";
import { blocksForDate } from "./plan-generator";
import { getBlocksForDate, isBlockObjectOn } from "./block-selectors";
import { iso } from "@/lib/utils";

/**
 * Plan redesign follow-up (2026-08-23) — "the week going wrong" (design
 * package turn t3, screen 3b). Generalizes the single-day check
 * `MissedSessionPrompt.tsx` already does ("was yesterday a scheduled
 * strength day with nothing logged?") across the whole current week,
 * so `WeekRecoveryCard` can show "you've missed N of M" instead of only
 * ever nudging about yesterday.
 *
 * Pure function — no store mutation. Scoped to the CURRENT week only;
 * callers should not call this for browsed past/future weeks (this is a
 * present-tense nudge, not archaeology).
 */
export type MissedWeekSignal = {
  weekStartISO: string; // Monday
  missedDates: string[]; // past, scheduled-strength, unlogged, unskipped days — ascending
  totalScheduledThisWeek: number; // scheduled strength days across the whole Mon–Sun week
  remainingScheduledCount: number; // scheduled strength days today or later, not yet logged/skipped
};

export function detectMissedWeek(
  program: Program,
  store: Store,
  userProfile: Store["user_profile"] | undefined,
  todayISO: string,
): MissedWeekSignal | null {
  const today = new Date(todayISO + "T00:00:00");
  const daysBackToMon = (today.getDay() + 6) % 7;
  const monday = new Date(today);
  monday.setDate(today.getDate() - daysBackToMon);

  const blockObjectOn = isBlockObjectOn(store);
  const isDoneOrSkipped = (dateISO: string): boolean => {
    const dayLog = store.logs[dateISO];
    const anyExerciseDone = dayLog
      ? Object.values(dayLog.exercises ?? {}).some((e) => e.done)
      : false;
    const anyRunLogged = (dayLog?.runs?.length ?? 0) > 0;
    const legacySkipped = !!store.skipped?.[dateISO];
    const blockObjectSkipped = blockObjectOn
      ? getBlocksForDate(store, dateISO, { slug: program.slug, states: ["skipped", "moved"] }).length > 0
      : false;
    return anyExerciseDone || anyRunLogged || legacySkipped || blockObjectSkipped;
  };

  const missedDates: string[] = [];
  let totalScheduledThisWeek = 0;
  let remainingScheduledCount = 0;

  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const dateISO = iso(d);

    const phase = activePhaseFor(program, dateISO, userProfile);
    const blocks = blocksForDate(program, userProfile, phase, dateISO);
    const isScheduledStrengthDay = blocks.some((b) => (b.category ?? "strength") === "strength");
    if (!isScheduledStrengthDay) continue;
    totalScheduledThisWeek++;

    if (dateISO >= todayISO) {
      // Today or a future day — not "missed" yet, but still counts toward
      // "N days left" if it hasn't already been logged/skipped ahead of
      // time (e.g. a future day already marked skipped).
      if (!isDoneOrSkipped(dateISO)) remainingScheduledCount++;
      continue;
    }

    if (!isDoneOrSkipped(dateISO)) missedDates.push(dateISO);
  }

  if (missedDates.length === 0) return null;
  return {
    weekStartISO: iso(monday),
    missedDates,
    totalScheduledThisWeek,
    remainingScheduledCount,
  };
}
