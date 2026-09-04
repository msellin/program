"use client";

/**
 * A rest timer that survives the OS discarding the app (2026-09-04).
 *
 * The companion to `session-cursor.ts`. That one puts you back on the set
 * you were on after the OS discards a backgrounded app; this one puts back
 * the rest you were in the middle of, which is otherwise the last piece of
 * the session state that simply vanishes.
 *
 * A rest is two numbers — when it started and how long it was for — so it
 * restores exactly, from the wall clock, with no drift. See
 * `wall-clock.ts`.
 *
 * The case that needs care is a rest that EXPIRED while the app was gone.
 * It must not come back as a live countdown: inventing time that has
 * already passed is worse than losing the timer, because the user acts on
 * it. `restoreRest` reports it as `expired` with how long ago, and the
 * takeover says so instead of counting.
 */

export type PersistedRest = {
  scope: string;
  date: string;
  startedAt: number;
  targetSeconds: number;
};

const KEY = "program.rest.v1";

/**
 * Beyond this a restored rest is not a rest, it is a note that you stopped
 * training a while ago. Deliberately much shorter than the session
 * cursor's six hours: a cursor a few hours old is still useful, a rest is
 * not.
 */
const MAX_AGE_MS = 30 * 60 * 1000;

export function writeRest(rest: PersistedRest): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(rest));
  } catch {
    // Private mode or blocked storage. Losing a restored rest costs the
    // user one tap; failing the session does not bear thinking about.
  }
}

export function clearRest(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // See above.
  }
}

export type RestoredRest =
  | { kind: "running"; startedAt: number; targetSeconds: number }
  | { kind: "expired"; startedAt: number; targetSeconds: number; agoSeconds: number };

export function restoreRest(
  scope: string,
  date: string,
  now: number = Date.now(),
): RestoredRest | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const r = JSON.parse(raw) as PersistedRest;
    if (!r || r.scope !== scope || r.date !== date) return null;
    if (!Number.isFinite(r.startedAt) || !Number.isFinite(r.targetSeconds)) return null;
    if (r.targetSeconds <= 0) return null;
    // A start time in the future is a clock that moved, not a rest.
    if (r.startedAt > now) return null;
    const elapsedMs = now - r.startedAt;
    if (elapsedMs > MAX_AGE_MS) return null;
    const overdueSeconds = Math.floor(elapsedMs / 1000) - r.targetSeconds;
    if (overdueSeconds >= 0) {
      return {
        kind: "expired",
        startedAt: r.startedAt,
        targetSeconds: r.targetSeconds,
        agoSeconds: overdueSeconds,
      };
    }
    return { kind: "running", startedAt: r.startedAt, targetSeconds: r.targetSeconds };
  } catch {
    return null;
  }
}
