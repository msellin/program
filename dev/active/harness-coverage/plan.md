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
