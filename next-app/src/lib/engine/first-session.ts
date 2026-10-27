import type { Store } from "../schemas";

/**
 * G-01 (2026-10-27): a new sign-up's day 1 must have a session.
 *
 * The weekly template is weekday-anchored (pull-ups train Mon/Wed/Fri), so
 * anyone who starts on a Tuesday met "Rest day." as their first screen, with
 * no workout reachable. Rotating the template to the start weekday would
 * reshuffle every existing user's calendar; instead, on a fresh program with
 * nothing on today, offer to pull the NEXT planned session forward to today.
 *
 * Pulling only the first session forward never tightens spacing: the session
 * after it keeps its date, so the gap to it only grows, and there is nothing
 * before it. The user taps to accept (confirm-first); the move is the existing
 * `moveWholeDay(offer.fromDate, todayISO, FIRST_SESSION_MOVE_REASON)`, so the
 * plan, Today and history all see one consistent calendar.
 */

/** How long after starting a program the offer stays available. */
export const FIRST_SESSION_WINDOW_DAYS = 7;
export const FIRST_SESSION_MOVE_REASON = "first session";

export type FirstSessionOffer = {
  /** The planned date of the program's next session — pass to `moveWholeDay`. */
  fromDate: string;
  /** `scheduled_blocks` ids that would move, in planned order. */
  blockInstanceIds: string[];
  blockTemplateIds: string[];
};

const daysBetween = (a: string, b: string) =>
  Math.round((new Date(b + "T00:00:00").getTime() - new Date(a + "T00:00:00").getTime()) / 864e5);

export function firstSessionOffer(
  store: Store,
  slug: string,
  todayISO: string,
): FirstSessionOffer | null {
  const startedAt = store.user_profile?.program_states?.[slug]?.started_at;
  if (!startedAt) return null;
  const age = daysBetween(startedAt.slice(0, 10), todayISO);
  if (age < 0 || age >= FIRST_SESSION_WINDOW_DAYS) return null;

  const mine = Object.values(store.scheduled_blocks ?? {}).filter((b) => b.program_slug === slug);
  // Anything already done, or anything on today (planned, moved here, skipped), means
  // day 1 is not an empty rest day — the offer is only for "nothing to do yet".
  if (mine.some((b) => b.state === "done" || b.actual_date === todayISO)) return null;

  const next = mine
    .filter((b) => b.state === "planned" && b.actual_date > todayISO)
    .sort((a, b) => a.actual_date.localeCompare(b.actual_date))[0];
  if (!next || daysBetween(todayISO, next.actual_date) >= FIRST_SESSION_WINDOW_DAYS) return null;

  const sameDay = mine.filter((b) => b.state === "planned" && b.actual_date === next.actual_date);
  return {
    fromDate: next.actual_date,
    blockInstanceIds: sameDay.map((b) => b.id),
    blockTemplateIds: sameDay.map((b) => b.block_template_id),
  };
}
