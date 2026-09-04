"use client";

import { useEffect, useState } from "react";

/**
 * One source of truth for "how long has this been running" (2026-09-04).
 *
 * Founder-reported: "backgrounding app seems to mess up things, timers,
 * page views reset etc."
 *
 * Every countdown in the app counted `+1` per `setInterval` tick, which
 * makes the interval ITSELF the clock:
 *
 *   - `RestTakeover`   — the rest takeover on a programme day
 *   - `RestTimer`      — the older bottom-fixed widget, still live on /off-plan
 *   - `SetView`        — the hold / duration countdown
 *
 * Every browser throttles background timers hard, and both mobile engines
 * go further: Android Chrome FREEZES a backgrounded tab (Page Lifecycle
 * API) after a few minutes, and iOS suspends the web view outright. Either
 * way all three timers drifted low or stalled — a three-minute rest taken
 * with the phone in a pocket came back reading ninety seconds, and the
 * completion chime never fired.
 *
 * Platform note, corrected 2026-09-04: the original diagnosis of this
 * family of bugs (`ResumeLastRoute`, 2026-08-26) attributed it to iOS.
 * The founder is on ANDROID and always has been. The fix is the same on
 * both — a wall clock does not care what suspended you — but the
 * attribution was wrong, and it was wrong in a way that shaped what got
 * tested.
 *
 * The wall clock is the only correct source of elapsed time. The interval
 * survives here purely to trigger a repaint; if it misses a hundred ticks
 * the arithmetic is still right, because the answer is derived from two
 * timestamps rather than accumulated.
 *
 * Sub-second polling is deliberate. On returning to the app the display
 * must be right immediately, and `visibilitychange` alone is not enough —
 * it does not fire when a web view is merely throttled rather than hidden,
 * and Safari's firing on PWA resume is not something to depend on. The
 * event is wired up as well, so the common case snaps instantly.
 */

/** Whole seconds between `startedAt` and now. Never negative. */
export function elapsedSecondsSince(startedAt: number, now: number = Date.now()): number {
  if (!Number.isFinite(startedAt)) return 0;
  return Math.max(0, Math.floor((now - startedAt) / 1000));
}

/**
 * Elapsed whole seconds for a running timer.
 *
 * The anchor is taken inside the effect, never during render — reading the
 * clock in render is impure, and under a re-render before commit it can
 * anchor twice, which is a rest timer that silently restarts itself.
 *
 * `active: false` freezes the value, which is what a pause needs. Callers
 * that pause add their own banked total; `SetView`'s hold timer is the
 * only one that does.
 *
 * `restoreFrom` anchors to a timestamp recovered from storage instead of
 * to now — a rest that was already running when the OS discarded the app.
 */
export function useElapsedSeconds(
  active: boolean,
  restoreFrom?: number | null,
  /**
   * Seconds already accumulated before this run started. A pausable timer
   * banks its total on pause and passes it back on resume, so the anchor
   * can be re-taken without losing what came before. `RestTimer` pauses;
   * `RestTakeover` does not.
   */
  bankedSeconds = 0,
): number {
  const [seconds, setSeconds] = useState(bankedSeconds);

  useEffect(() => {
    if (!active) return;
    const startedAt = restoreFrom ?? Date.now();
    const sync = () => setSeconds(bankedSeconds + elapsedSecondsSince(startedAt));
    sync();
    // Sub-second polling is deliberate. On returning to the app the display
    // must be right immediately, and `visibilitychange` alone is not enough:
    // it does not fire when a page is throttled rather than hidden, and
    // Safari's firing on PWA resume is not something to depend on.
    //
    // The events are wired up as well so the common case snaps instantly:
    //   - `resume`   — Page Lifecycle API. ANDROID CHROME fires this when it
    //                  un-freezes a backgrounded tab, and freezing is
    //                  precisely the state in which this interval has not
    //                  been running. It is the most on-point signal there is
    //                  for the founder's actual platform, and it was missing
    //                  until 2026-09-04 because the whole family of fixes had
    //                  been written against an iOS diagnosis. Safari fires
    //                  nothing here, which is why the poll stays.
    //   - `pageshow` — a bfcache restore, which fires no visibilitychange.
    const id = setInterval(sync, 250);
    document.addEventListener("visibilitychange", sync);
    document.addEventListener("resume", sync);
    window.addEventListener("pageshow", sync);
    window.addEventListener("focus", sync);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", sync);
      document.removeEventListener("resume", sync);
      window.removeEventListener("pageshow", sync);
      window.removeEventListener("focus", sync);
    };
  }, [active, restoreFrom, bankedSeconds]);

  // Paused: hold at whatever was banked, rather than at a stale running
  // total that would keep the last polled value on screen.
  return active ? seconds : bankedSeconds;
}
