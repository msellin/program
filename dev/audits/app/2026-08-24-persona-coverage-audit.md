# Persona harness — coverage audit (2026-08-24)

Audit of what the 15-persona harness actually exercises, run against the
artifacts captured 2026-08-21 23:39–23:54 and the harness source.

## Headline

The harness is a **state-fabricator plus a screenshot walker**. It writes
`localStorage` day by day, then visits 17 URLs at two viewports and
screenshots them. **It never clicks anything.** Every finding below
follows from that one architectural fact.

| Dimension | Covered | Total | % |
|---|---|---|---|
| User-facing routes toured | 15 | 24 | 63% |
| Interactive surfaces exercised (sheets, modals, takeovers) | 0 | 17 | 0% |
| Store schema keys ever written by the simulator | 7 | 20 | 35% |
| Personas producing any training log | 6 | 15 | 40% |
| Mid-session / partially-logged states produced | 0 | — | 0% |
| Timeline positions visited (past / future dates) | 0 | — | 0% |

## 1. Routes

Never toured: `/session/[slug]` — **the most important screen in the app
and the entire subject of the Day redesign** — plus `/settings`,
`/programs/[slug]/intake`, `/evidence`, `/reset-password`, and the three
`/legal/*` pages.

`/events` is toured but **does not exist** (`src/app/events` is absent).
Every persona has been capturing a 404 into `15-events.png` at two
viewports. One of 17 tour routes is pure waste.

## 2. Interactions: zero

`runTour` is `goto` + `screenshot`, nothing else. Seventeen interactive
surfaces exist and none is ever opened:

    ConfirmSheet, InfoSheet, VideoModal, OnboardingRunner, NoteSheet,
    OffPlanSheet, OverflowSheet, RestTakeover, ExerciseDetailsSheet,
    MoveSheet, PerProgramActions, RetestLoggingSheet, SessionActions,
    ProgramPreviewClient, account/report dialogs, BottomSheet

Consequences, all of them things the founder hit in a real workout on
2026-08-24 that the harness could not have caught:

- Starting a session, logging a set, the rest timer, `+30s`
- Going back a set / editing a logged set
- The exercise rail (the ~11px tap targets on off-plan)
- Accept / Ignore on a proposal
- Move / Skip a session

## 3. Store: 7 of 20 keys

Written: `logs`, `training_maxes`, `user_profile`, `cycle`, `skipped`,
`day_adjustments`, `updated_at`. (It also writes `tm_history`, which is
not a schema field at all.)

Never written: **`scheduled_blocks`** — the block-object model that Day
actually reads — plus `scheduled_overrides`, `dismissed_proposals`,
`retest_readings`, `assessments`, `proposal_history`, `daily_plans`,
`stretch_targets`, `contraindications`, `feature_flags`,
`program_materialization`, `migrations_applied`.

`scheduled_overrides` and `dismissed_proposals` are initialised to `{}`
and never populated — **including for `persona-erratic`, whose declared
focus is literally "Skipped sessions, dismissed proposals, re-plan
behavior."** That persona has never produced a dismissed proposal.

Because `scheduled_blocks` is empty in every bundle, every persona's block
state is whatever the `blocks_v2` migration derives at tour time: all
`planned`, never `moved` / `skipped` / `done` / `amber_downshifted`. The
per-track dots on Plan and the multi-track logic on Day have never been
photographed in a non-default state.

## 4. Nine of fifteen personas log nothing

Actual artifact contents:

```
persona                  days  exercises   runs  skipped  dayAdj
persona-handstand          45          0      0        5       0
persona-handstand-fast     60          0      0        0       0
persona-mobility           45          0      0        5       0
persona-multitrack         45          0     17        5       0
persona-engine             60          0     21        6       0
persona-engine-fast        60          0     24        0       0
persona-graduate           64          0     21        6       0
persona-rowing             45          0     16        5       0
persona-rowing-erratic     45          0     13       15      18
persona-recover            30         12      6       10       2
persona-concurrent         30         14     10        3       0
persona-strength           30         16     13        0       0
persona-erratic            45         15     14       15      19
persona-strength-slow      60         30     24        0      49
persona-strength-long     400         30     24        0       0
```

`persona-handstand`, `persona-handstand-fast` and `persona-mobility`
produce **zero training data of any kind** across 150 simulated days.
Cause: `itemsForBlock` reads `block.items`, but overhead-mobility authors
**0 items across all 7 blocks** and handstand-walk has 9 of 13 blocks
slot-based. Their drills only exist after `composeBlockForUser` runs, and
the simulator never calls it. A prior fix (F9 Batch 25) slug-gated those
programs to "log every drill" — but the drill list it returns is empty,
so the fix has never done anything.

`persona-strength-long` simulates 400 days and produces 30 exercise
entries — 0.075/day — because the sim only trains Mon/Wed/Fri inside
authored phase windows, and a 400-day arc mostly falls outside them.

## 5. No mid-session states, ever

Across all 15 personas and 1,064 simulated days: **117 fully-logged
exercises, 0 partially-logged.** The simulator writes
`{ done: true, sets: [3 sets] }` or nothing.

So no artifact has ever shown: a session in progress, the
`Continue — <exercise>, set 4` CTA, an exercise in the `Held` state, the
`logged/rowCount` rail counter at anything but 0 or full, or (now) the
set pips. Every set is also `reps: 5` at a single weight — never an
AMRAP, never a missed rep, never a top-set/FSL shape.

## 6. No timeline movement

The tour issues no query parameters and no `?date=`. `/session/[slug]`
accepts `?date=YYYY-MM-DD` (`SessionClient.tsx:22`) and is the app's only
way to view another day's session — never exercised. Past-day logging,
future-day preview, and the "log yesterday" prompt are all uncaptured.

## What this explains

Every bug in the 2026-08-24 live-workout report sat in the harness's blind
spot: set editing (interaction), track visibility on Day (`scheduled_blocks`),
`+30s` (interaction), the off-plan rail (interaction), the rest sound
(interaction). The harness was never going to find them.

It is good at what it was built for — does every route render without
crashing for 15 program states — and that is worth keeping. The gap is
that it has been treated as product coverage when it is really smoke
coverage.


---

# Post-fix results (2026-08-25)

Full 15-persona sweep, parallel at 5 workers, **10.6 minutes** (was 40+
serial — `describe.configure({mode:"serial"})` was a leftover from when
every persona shared one test account; each now signs in as its own user).

| Dimension | Before | After |
|---|---|---|
| User-facing routes toured | 63% | **100%** |
| Interactive surfaces reached | **0%** | **61.4%** mean |
| Store schema keys populated | 35% | 64.3% mean (55–80%) |
| Personas producing training data | 6 / 15 | **13 / 15** |
| Personas running the full flow set | — | **13 / 15** (10/10 flows) |
| Mid-session states, fleet-wide | **0** | 45 partially-logged exercises |
| Timeline positions per persona | 0 | 3 (past / today / future) |
| Sweep wall-clock | ~40 min | **10.6 min** |

The two personas that still skip session flows are `persona-rowing` and
`persona-rowing-erratic`: their 45-day arcs end at the 2K test date, so
there genuinely is no session within ±7 days. Correct behaviour, recorded
with a reason rather than silently counted as coverage.

## Still unreached

`ConfirmSheet`, `InfoSheet`, `VideoModal`, `MoveSheet`,
`RetestLoggingSheet`. Each needs state to exist before it can be opened —
a live proposal to Accept, a move to perform, an open retest window — so
each wants its own flow plus the simulator state to trigger it. That is
the next increment, worth roughly another 25 points of surface coverage.

`assessments`, `contraindications`, `daily_plans` and `stretch_targets`
remain unwritten. They are hip-rebuild-specific or near-legacy (1–4
referencing source files each); worth deciding whether they belong in the
denominator at all before chasing them.


---

# First production sweep (2026-08-25)

Prior runs were all against `localhost:3000`. This is the first full sweep
against `app.terav.fit`, on the build deployed the same day.

Result: **15/15 personas, routes 100%, surfaces 61.4% mean, store 65%
mean, 13 of 15 running all 10 flows.** ~20 min at 5 workers (vs 10.6 on
localhost — network latency, not extra work).

## Three bugs prod found that localhost did not

**The confirm-first gate hung the harness.** The Brief disables Start when
a cycle-start proposal is pending ("Accept the numbers to start").
persona-strength is the overperformer, so it always carries a TM bump.
`openBrief` saw the button, clicked, and Playwright waited the full 900s
test budget on a permanently-disabled control — then the closed context
cascaded "Target page, context or browser has been closed" into eight
downstream flows, which made a one-persona failure look systemic in the
logs. `openBrief` now resolves the gate by accepting the proposal, and
every click in every flow carries a 15s bound.

**`program-preview` never reached its target.** It looked for
`button[aria-expanded]`; the preview's disclosure is a native
`<details>/<summary>`. Skipped on 14 of 15 personas — `ProgramPreviewClient`
had never been reached at all.

**Stale session cookies killed sign-in.** persona-strength failed two
consecutive sweeps at `page.fill('input[type="email"]')` — a leftover
session makes `/sign-in/` redirect to Day, so the form never renders, and
the persona died before a single flow ran. Cookies are now cleared before
sign-in and the wait is bounded.

None of these were reachable on localhost, because the persona accounts
carry different server-side state there. The case for sweeping prod made
itself on the first run.

## Coverage note

`persona-rowing` and `persona-rowing-erratic` sit at 26.7% surfaces
(3/10 flows). Their 45-day arcs end at the 2K test date, so there is
genuinely no session within +/-7 days. Correct behaviour, recorded with a
reason. The handstand pair sits at 8/10 — their sessions are hold-based,
so the rest takeover does not always open.
