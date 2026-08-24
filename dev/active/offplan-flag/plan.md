# Off-plan behind a flag — accepted plan (2026-08-24)

## Why

MVP density. Founder ask: cut off-plan for the public catalog, keep it for
his own use as a single Profile row, hide it behind a flag so the code
survives for a later, possibly different, form.

## The two findings that shaped this

**1. No public program has off-plan-only content.** Every `accessory` /
`run` block in all nine programs is already scheduled onto a specific day
by the phases + weekly template. Off-plan-only count: 0, every program.
`/off-plan` is a second, unscheduled door into work the plan already
prescribes — and a live double-logging path.

**2. Off-plan is anterior-hip-shaped by construction.** `schedule.ts:457`:
hip-rebuild is the ONLY program that filters non-strength blocks off Day
("its non-strength blocks live on the Extras tab by design"). Every other
program renders its accessory/run blocks on Day as normal sessions. So
off-plan isn't a general feature the public ignores — it exists for one
program.

## What is NOT cut: activity logging

`RunSlotCard` / `logs[date].runs[]` is a different feature that happens to
share the "off-plan" label. It is the retest data source for four programs:

    engine-builder          runs[].avg_hr where intensity == 'easy'
    engine-builder-block-2  runs[].avg_hr where intensity == 'easy' and week_in_program in [1,4,8]
    concurrent-strength     runs[].avg_hr where intensity == 'easy'
    rowing-2k-test-prep     runs[].total_seconds where activity_type == 'row'
                            runs[].avg_pace_500m_seconds where activity_type == 'row'

Engine Builder and rowing-2k are made ENTIRELY of `run`-category blocks —
the prescribed session IS the run/row. Plus six decision paths read
`runs[]`: cardio→fatigue→`day_adjustment_soften` load multiplier
(`note-signals.ts:247`), layoff detection (`adapt.ts:252`), missed-week
(`missed-week.ts:43`), the concurrent interference callout
(`TodaySession.tsx:332`), proposal suppression (`select.ts:69`).

Decision: KEEP activity logging for everyone, rename it off "off-plan" so
it stops reading as optional extra. Prominence stays uniform across
programs (program-conditional prominence was considered and dropped as
scope creep).

## Scope

**Flag** `feature_flags.off_plan`, tri-state:
- `undefined` — never had it. Nothing renders. Default for every new user.
- `true` / `false` — has had it. Settings toggle renders so it can be
  turned back on. Necessary because the PWA has no URL bar: there is no
  query-string escape hatch, so recovery must be in-app.

**Grandfathering.** One-shot, in `StoreHydrator`, guarded by a marker in
`migrations_applied`. Sets the flag `true` for accounts with logged
off-plan drill work on >= 3 distinct days. Threshold rather than >= 1 so an
incidental tap during beta doesn't hand a public user the surface.

**Surfaces**
| Surface | Action |
|---|---|
| `profile/page.tsx` Off-plan row | gate on flag |
| `TodaySession.tsx` "N drills available" DashboardBlock | delete for everyone — duplicate of the Profile row and the Brief footer |
| `BriefView.tsx` footer line | rename to activity logging, keep for everyone |
| `OffPlanSheet.tsx` "Or pick a drill" section | gate on flag; retitle sheet to "Log an activity" |
| `/off-plan` route | flag off → empty state, route stays alive |

**Not touched:** program JSON, `runs[]` schema, any engine read path,
RunSlotCard itself, the rest-day RunSlotCard on Day.

## Known wart, deliberately not fixed here

For Engine Builder / rowing, the session flow logs `exercises[].sets`
while the retest metric reads `runs[]`. Doing the prescribed run inside
the session does NOT feed the metric — the user has to log it as an
activity as well. Real product gap, out of scope for a flag change.
Logged as a follow-up.

## Risks

- Grandfather misses the founder → he loses his rehab blocks with no
  in-app way back. Mitigated by the Settings toggle rendering whenever the
  flag is defined, plus an e2e test asserting a hip-rebuild account with
  off-plan history gets flagged on.
- Public user surprised by a vanished surface. Accepted — beta, and the
  content is all still reachable on Day where it is scheduled.
