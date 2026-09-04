# Backgrounding — context

Founder, 2026-09-04: "backgrounding app seems to mess up things, timers,
page views reset etc." Two bugs, two commits.

## Commit 1 — the timers (`4940cee`)

`lib/wall-clock.ts` is the new primitive. Elapsed is derived from two
timestamps; the interval only triggers a repaint. All three timers consume
it: `RestTakeover`, `RestTimer` (still live on /off-plan), `SetView`'s hold.

**The non-obvious part:** `elapsed` can now JUMP, so every side effect keyed
to a specific second had to be re-read as "correct across a gap".
Completion was already `>=` and survived. The 30-second call was `=== 30`
in TWO files and was simply unreachable across a jump — both fixed. The
3-2-1 lead-in is deliberately left to be skipped: replaying it on return
would be counting down to a moment that has gone.

The anchor is taken inside an effect, never in render. `useRef(Date.now())`
can anchor twice under a re-render before commit — a rest timer that
silently restarts itself. The lint rule caught this; it was right.

## Commit 2 — the cursor

`lib/session-cursor.ts`. `ResumeLastRoute` (2026-08-26) already restores the
ROUTE after an iOS eviction. Its comment claimed that was enough because
"DaySession lands on the first unfinished set". It is not:

- `mode` resets to "brief" — you are dumped out of the set you were on
- `activeKey` resets to first-unfinished in RAIL order, not where you were
- a logged set you tapped back into to CORRECT is not "unfinished", so
  derivation actively cannot find it

`DaySession` and `OffPlanSession` hold an identical three-field cursor, so
the module is consumed twice. `reconcileCursor` was initially inlined in
both — caught and extracted before commit.

Scopes are separate (`day:<slug>` vs `offplan`) so backgrounding out of one
cannot drop you into the other. Six-hour window, matched to
`ResumeLastRoute` on purpose: different numbers would mean landing on the
right route with a stale cursor.

## Verification

Timer tests advance the SYSTEM CLOCK without running intervals in between —
what a suspended web view does — then let one tick through. Reverting the
hook to tick-counting turns four red. All cursor guards mutation-tested
(scope, freshness, structural validation, dangling key): each break turns
the suite red.

717 tests, up from 706.

## Not done

- **Persisting a RUNNING timer across a cold load.** Deliberately deferred.
  It needs a product answer that has not been given: rest that EXPIRED
  while the app was evicted must not resurrect as a live countdown, so it
  needs a "rest finished N min ago" state, which is new UI rather than a
  restore. The cursor lands you on the right set; you tap on.
- **Push notification on rest expiry.** Out for MVP — needs a permission
  prompt, and mid-session is the wrong moment to ask.

## Still unverified

Neither commit has been exercised on a real iOS PWA. The tests simulate a
suspended web view; they cannot prove Safari's actual eviction behaviour.
Founder should background mid-set and report.
