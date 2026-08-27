# Persona harness — coverage improvement plan (2026-08-24)

Audit: `dev/audits/app/2026-08-24-persona-coverage-audit.md`.
Starting point: 63% routes, 0% interactions, 35% store keys, 40% of
personas producing any log, 0 mid-session states, 0 timeline movement.

## Principle

Keep the smoke tour — it does its job. Add a second capability the
harness has never had: **flows**, which drive real UI and capture at each
step. State fabrication stays for breadth (15 program arcs); flows give
depth on the paths a person actually walks.

## Phases

**1 · Tour repair** — drop the dead `/events` route (404 for every
persona since it was added); add `/session/[slug]`, `/settings`,
`/programs/[slug]/intake`, `/evidence`, `/legal/privacy`. Add timeline
variants via `?date=` on the session route: a past logged day and a
future planned day.

**2 · Flows** — new `harness/flows.ts`. Each flow is a named sequence of
real interactions with a capture after every step. Initial set:

  - `session-log-set` — Brief → Start → log set 1 → rest → skip → set 2
  - `session-edit-past-set` — back to set 1 via pips → Editing → Save
  - `session-rest-extend` — +30s actually extends
  - `session-overflow` — the `⋯` sheet
  - `activity-log` — the Brief footer sheet
  - `plan-expand-day` — a Plan day row's expanded actions

Flows are declared per persona (not every persona can run every flow — a
rest day has no session), and skip cleanly with a recorded reason rather
than failing the run.

**3 · Simulator fidelity** — compose slot-based drills so handstand /
mobility personas log at all; leave some sessions partially logged so
mid-session states exist; populate `dismissed_proposals` for erratic
archetypes; write `scheduled_blocks` states (moved / skipped / done).

**4 · Coverage report** — compute routes / flows / store-keys / states
covered and write `coverage.json` + a markdown summary per run, so the
number is tracked rather than assumed.

## Non-goals

- Not replacing the tour.
- Not asserting correctness in flows — they capture, they don't judge.
  Assertions belong in the targeted specs (`session-set-edit.spec.ts` etc).
- Not fixing `persona-strength-long`'s 400-day sparsity (separate issue:
  the sim's phase-window logic, not coverage).

---

# Round 2 — 2026-08-27

Baseline sweep against prod at `0477614`: 17 personas, **146 behavioural
checks, 0 failures, 0 flow errors, no console errors, no non-2xx
responses**. Nothing to fix in the app. All of round 2 is measurement and
reach.

| Dimension | Run 1 | Target |
|---|---|---|
| Routes | 100% | hold |
| Surfaces | 74.5% | 90%+ |
| Controls | 82% | 90%+ |
| Store keys | 81.4% | 90%+ |

## R2-1 · RetestLoggingSheet — three faults, none of them the persona

`RetestLoggingSheet` is the only surface no persona has ever reached, and
the persona built for it skipped with "no retest-due proposal open" — as
did every other persona.

The first hypothesis was wrong and is recorded here because it was
plausible enough to act on: engine-builder's END-of-block targets are
`at_week: 8`, the persona runs 25 days, so it looked positioned outside
its own window. It is not. The program also declares a MID-block metric
at `at_week: 4`, the persona sits in week 4, and persona-retest's own
tour capture shows "MID-BLOCK RETEST WINDOW OPEN / LOG READING" on Day.
The proposal was on screen in every sweep ever run.

Three faults stacked, each sufficient alone:

1. `/^Log reading$/` is case-SENSITIVE. Playwright derives the accessible
   name from RENDERED text, which applies `text-transform`, and the
   button is styled `font-mono uppercase` — so its name is "LOG READING".
2. A flat `waitForTimeout(1500)` is shorter than this account's
   hydration. Proposals are derived from the store, and the store arrives
   from KV, so the button does not exist when a fixed sleep expires. The
   tour waits longer, which is why its capture disagreed with the flow's
   own `count()` on the same page.
3. `goto("/")` does not land on Day. `ResumeLastRoute` — the A10 fix —
   redirects a cold load of "/" to the last route visited within six
   hours, which for a flow means wherever the PREVIOUS flow finished.
   This flow runs after `hip-check`, so it was navigated to `/check/hip`
   out from under itself: the button was found, then detached, and the
   click burned its full timeout. The flow's own capture is a screenshot
   of the hip check.

Fixing (1) and (2) made the flow stop skipping and start FAILING, which
re-triggered G15: an 8-15s wait plus a 15s click timeout blew the 900s
persona budget and cascaded a closed context. Every timeout in a flow
that begins to do real work has to be re-budgeted. That is the standing
cost of coverage going up, and worth expecting next time.

## R2-2 · Surface coverage counts unreachable surfaces

Eight personas sit at 53.3%. They are cardio-only or graduated:
engine-builder is entirely run blocks, rowing has no set flow on any day.
Six surfaces (SetView, RestTakeover, OverflowSheet, NoteSheet,
ExerciseDetailsSheet, VideoModal) hang off a set flow those programs do
not have. Marking a persona down for a sheet its program cannot produce
is the surface-level version of the mistake G17 recorded for flows: a
skip and a death must not look the same.

Fix: score against the surfaces APPLICABLE to the persona's program, and
report the raw number alongside it so nothing is hidden by the rescope.

## R2-3 · SetView's denominator grows with session content

Rail tabs enter `seen` under their exercise names ("High-bar back squat",
"Pallof press"), so the denominator is a function of which drills the
program authored. Same class as G6, which was only ever fixed for the
`"Save — set N · N kg"` family.

## R2-4 · The steppers are tapped after the flow has left them

`probe` sees `kg` and `reps`; `tap` reports "no element matched". The
rail walk runs first and lands on a non-loadable exercise, so by the time
the steppers are tapped they are no longer mounted. Ordering, not
selector.

## R2-5 · Close controls and the rest-takeover trio

`ExerciseDetailsSheet.Close` (0/1), `OverflowSheet.Close`,
`MoveSheet.Close move sheet`, and RestTakeover's "Add a note", "Solid",
"Do something else next" are seen but never driven.

## R2-6 · Store keys with no writer in the simulation

`contraindications` is empty in 17/17 — real state with a store action
and two readers, never seeded. `day_adjustments` (13/17),
`dismissed_proposals` and `proposal_history` (12/17) are gated on
`derivedState !== "green"`, so steady-state personas never write them.

## R2-7 · An archetype that could never have a bad day

`CONSISTENT_AVERAGE` declares `lifeLoad: (d) => 3 + rand*3` (3-5) and
then hardcodes `life_load: 4` in its symptom payload. The varying value
was dead code for every symptom consumer, and a flat 4 sits exactly one
point under the amber threshold (`lifeLoad >= 5`). So an archetype whose
own description promises an "occasional life event" went 25+ simulated
days without a single elevated one, the engine never proposed a
softening, and there was never anything to accept — which is why
`day_adjustments` was empty in 13 of 17 personas.

Wired to the declared range, the occasional 5 lands amber. This is a
fidelity fix, not a number-chasing one: the previous model produced an
athlete who never has a bad week.

`OVERPERFORMER` is deliberately left alone. It is all-zero by design
("crushes every prescribed top-set, never misses"), so `day_adjustments`
is legitimately inapplicable to it — and it is the archetype that proves
the engine stays quiet when nothing is wrong.

## What this round did NOT find

Nothing in the app. Run 1 against prod at `0477614` passed 146
behavioural checks with zero failures, zero flow errors, zero console
errors and zero non-2xx responses across 17 personas. Every gap chased
in this round was the harness under-measuring itself — the same class the
G-series already records, found again in five new places.

## Round 2 result (2026-08-27, prod `0477614`)

| Dimension | Run 1 | Run 2 |
|---|---|---|
| Routes toured | 100% | 100% |
| Interactive surfaces | 74.5% | **92.3%** (75.3% unscoped) |
| Store keys populated | 81.4% | **97.7%** |
| Controls within surfaces | 82% | **91.7%** |
| Behavioural checks | 146 pass / 0 fail | **148 pass / 0 fail** |
| Surfaces never reached | RetestLoggingSheet | **none** |

First sweep in the harness's history with every surface reached.

## Round 3 — what is left, and it is one bug

Every remaining control gap is the same fault: **`Close` on a STACKED
sheet times out at 15s.** ExerciseDetailsSheet, OverflowSheet and
NoteSheet each open over another sheet, and the one underneath still owns
the scrim, so the press is swallowed without failing. Nine personas hit
it three times each, which is also why wall-clock went from 16.9 to 22.9
minutes — roughly two minutes per persona spent waiting on clicks that
cannot land. Fixing it should BUY time, not cost it.

- [ ] R3-1 Close-on-a-stacked-sheet: dismiss via the topmost scrim or
      Escape, and stop paying 15s per attempt. Fixes ExerciseDetailsSheet
      (still 0/1), OverflowSheet and NoteSheet in one change.
- [ ] R3-2 The jump sheet inside RestTakeover lists exercise NAMES, so
      the rail-tab denominator problem (R2-3) has reappeared one surface
      over: "High-bar back squat" and "Block pull, mid-shin height" now
      sit in RestTakeover's `seen`. Same alias treatment.
- [ ] R3-3 RetestLoggingSheet's dismiss control is not
      Close/Cancel/Not now — find its real name. Currently 1 of 2
      non-mutating controls.
- [ ] R3-4 `NoteSheet · Stop session` reports "no element matched" on
      nine personas although it is `ctx.note`'d as held back. Held-back
      controls should not also be attempted.
