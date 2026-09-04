# Backgrounding: timers and lost state — plan

Founder, 2026-09-04: "backgrounding app seems to mess up things, timers,
page views reset etc". Supersedes handover item B, which scoped this as
"wall-clock rest timer, needs a product call". It is bigger than that and
most of it is not a product call at all.

## Two bugs that feel like one

**1. Short background — the timers are wrong.**
Every countdown in the app counts `+1` per `setInterval` tick, so the
interval IS the clock:

- `RestTakeover.tsx:110` — the redesigned rest takeover
- `RestTimer.tsx:40` — the old bottom-fixed widget, still live on /off-plan
- `SetView.tsx` — the hold/duration countdown

iOS throttles and then suspends timers in a backgrounded web view, so all
three drift low or stall outright. Not a product call: the wall clock is
the only correct source of truth for elapsed time.

**2. Long background — the screen resets.**
iOS evicts the web view under memory pressure; relaunch is a COLD load at
the manifest `start_url` ("/"). `ResumeLastRoute` (2026-08-26, same
founder, same symptom) restores the ROUTE. Nothing restores what was on
the screen: no running timer, and the set cursor is re-DERIVED as "first
unfinished" rather than remembered.

That derivation is why it half-works today and why the remaining half is
confusing: you get back to the right session but not the right set, and
any rest you were in the middle of is simply gone.

## Fixes

1. **One wall-clock timer primitive.** `startedAt` + `durationSeconds`;
   elapsed is `(Date.now() - startedAt) / 1000`. The interval only
   triggers a repaint. Recompute on `visibilitychange` so returning to the
   app snaps to the true remaining time instead of resuming a stale count.
   THREE call sites — this is the repo's signature defect shape, so it
   goes in one place and all three consume it.

2. **Persist the running timer** (`startedAt`, duration, kind) so a cold
   load can restore it.

3. **Persist the session cursor** (exercise key + set index) alongside the
   route. Re-derivation stays the fallback when nothing is stored.

## The one judgement call

Rest that EXPIRED while the app was away must not resurrect as a live
countdown — that would be inventing a rest period that already ended.
Show "rest finished N min ago" and let the user move on. A timer still
running resumes at its true remaining time.

Push notification on expiry is OUT for MVP: it needs a permission prompt,
and asking for one mid-session is the wrong moment. Buzz + sound on
return, which is what the code already does at zero.

## Risks

- `useTimer.ts`'s store drives the OLD `RestTimerHost`/`RestTimer` widget
  which is mounted app-wide in `AppShell`; `RestTakeover` deliberately
  runs its own independent countdown so the two never double-fire. Any
  shared primitive must NOT re-couple them — see the long comment on
  `SetView`'s `onConfirmed` prop.
- `Date.now()` in tests: use vitest fake timers, and `setSystemTime`.
