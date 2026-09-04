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

## Commit 3 — the running rest

`lib/rest-persistence.ts`. Deferred once as "needs a product answer"; it did
not. "Rest finished N min ago" IS the answer, and deferring it was the
second time in this session I mistook a determined call for a decision.

A rest is two numbers, so it restores exactly off the wall clock. Thirty
minute cap — much shorter than the cursor's six hours, because past that it
is not a rest, it is a note that you stopped training.

**The bug the tests caught.** `restoredExpired` was first DERIVED inside
`RestTakeover` from the current clock. That flips to true the moment a
legitimately-running restored rest reaches its target, which suppressed the
very completion it was supposed to fire. `restoreRest` now decides it once,
at the moment of restore, and passes it down. Worth remembering: the
component test found this, the unit tests could not have.

An expired rest does NOT fire the chime, the vibration or `onDone` — the
last would close the screen before the user saw why it was there. The
effort question, not the clock, is the content of that takeover.

## Not done

- **Push notification on rest expiry.** Out for MVP — needs a permission
  prompt, and mid-session is the wrong moment to ask.

## Still unverified

Neither commit has been exercised on a real iOS PWA. The tests simulate a
suspended web view; they cannot prove Safari's actual eviction behaviour.
Founder should background mid-set and report.
