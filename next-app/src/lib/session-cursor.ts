"use client";

import { useEffect, useRef } from "react";

/**
 * Where you were in a session, across an OS-level app eviction (2026-09-04).
 *
 * Founder: "backgrounding app seems to mess up things, timers, page views
 * reset etc." The timers were one bug (see `wall-clock.ts`); this is the
 * other.
 *
 * `ResumeLastRoute` (2026-08-26, same founder, same symptom) already
 * restores the ROUTE after iOS evicts a backgrounded web view and relaunches
 * cold at the manifest `start_url`. What it cannot restore is what was ON
 * that route. Its own comment claimed restoring the route was enough,
 * because "DaySession lands on the first unfinished set" — true, and still
 * not the same thing:
 *
 *   - `mode` resets to "brief", so you are dumped out of the set you were
 *     working on back to the session overview
 *   - `activeKey` resets to the first unfinished exercise in RAIL order,
 *     which is not necessarily the one you were on — jump to an accessory
 *     out of order and you come back somewhere else entirely
 *   - a set you had already logged and tapped back into to CORRECT is not
 *     "unfinished", so derivation actively cannot find it
 *
 * So the cursor is remembered rather than inferred. Derivation stays the
 * fallback for every case where nothing was stored.
 *
 * `DaySession` and `OffPlanSession` hold an identical three-field cursor.
 * One module, consumed twice — the alternative is the shape this repo keeps
 * producing.
 */

export type SessionCursor = {
  mode: "brief" | "set";
  activeKey: string | null;
  activeSetIndex: number;
};

type Stored = SessionCursor & { scope: string; date: string; at: number };

const KEY = "program.sessionCursor.v1";

/**
 * Long enough to survive the gym and the trip home, short enough that
 * yesterday's session does not reopen. Matches `ResumeLastRoute`, which
 * restores the route this cursor sits on — a different number in either
 * place would mean landing on the right route with a stale cursor, or the
 * reverse.
 */
const MAX_AGE_MS = 6 * 60 * 60 * 1000;

export function readSessionCursor(
  scope: string,
  date: string,
  now: number = Date.now(),
): SessionCursor | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as Stored;
    if (!s || s.scope !== scope || s.date !== date) return null;
    if (now - (s.at ?? 0) > MAX_AGE_MS) return null;
    if (s.mode !== "brief" && s.mode !== "set") return null;
    if (s.activeKey != null && typeof s.activeKey !== "string") return null;
    if (!Number.isInteger(s.activeSetIndex) || s.activeSetIndex < 0) return null;
    return { mode: s.mode, activeKey: s.activeKey, activeSetIndex: s.activeSetIndex };
  } catch {
    // Private mode, blocked storage, corrupt value. Resume is a
    // convenience; derivation is the fallback and it still works.
    return null;
  }
}

export function writeSessionCursor(scope: string, date: string, c: SessionCursor): void {
  try {
    localStorage.setItem(
      KEY,
      JSON.stringify({ ...c, scope, date, at: Date.now() } satisfies Stored),
    );
  } catch {
    // See above.
  }
}

export function clearSessionCursor(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // See above.
  }
}

/**
 * Reconcile a restored cursor against the rail that exists NOW.
 *
 * A cursor can be six hours old and the programme can have moved under it
 * — a phase rolled over, a block was replaced, an exercise was swapped.
 * Restoring onto a key that no longer resolves would put the user on a
 * blank Set screen with no way back except the nav.
 *
 * Falling back to "brief" rather than to null is deliberate: the Brief is
 * the screen that can always render, whatever the rail turned into.
 */
export function reconcileCursor(
  stored: SessionCursor,
  keyExists: (key: string) => boolean,
): SessionCursor {
  if (stored.activeKey == null) return { ...stored, mode: "brief" };
  if (!keyExists(stored.activeKey)) return { mode: "brief", activeKey: null, activeSetIndex: 0 };
  return stored;
}

/**
 * Persist `current` as it changes, and restore once on a cold load.
 *
 * `apply` is called at most once, from a mount effect, and only when a
 * stored cursor is valid, in scope, for the same day and still fresh. The
 * caller decides whether the restored `activeKey` still resolves against
 * its rail — the programme may have changed underneath a six-hour-old
 * cursor, and a cursor pointing at an exercise that no longer exists must
 * not strand the user on a blank screen.
 */
export function useSessionCursor(
  scope: string,
  date: string,
  current: SessionCursor,
  apply: (c: SessionCursor) => void,
  ready: boolean,
): void {
  const restored = useRef(false);
  const applyRef = useRef(apply);
  useEffect(() => {
    applyRef.current = apply;
  });

  useEffect(() => {
    if (!ready || restored.current) return;
    restored.current = true;
    const stored = readSessionCursor(scope, date);
    if (stored) applyRef.current(stored);
  }, [ready, scope, date]);

  useEffect(() => {
    // Never write before the restore has had its chance, or the mount-time
    // default ("brief", null, 0) overwrites the very cursor being restored.
    if (!ready || !restored.current) return;
    writeSessionCursor(scope, date, current);
    // Depends on the cursor's FIELDS, not the object: callers build it
    // inline every render, so an object dep would write on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, scope, date, current.mode, current.activeKey, current.activeSetIndex]);
}
