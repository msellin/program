# Context — optional session items

## Key files
- `next-app/src/lib/schemas.ts:128` — `blockItemSchema.optional` (was dead)
- `next-app/src/lib/engine/suggest.ts:100` — `suggestForExercise`, owns FSL
- `next-app/src/components/session/DaySession.tsx:357` — `useMemoRail`
- `next-app/src/components/session/BriefView.tsx:263` — rail rows
- `next-app/src/components/session/SetView.tsx:251` — `totalRemaining`
- `next-app/src/components/session/shared/advance.ts` — `nextAfterSet`
- `next-app/src/lib/engine/schedule.ts:270` — `weekly_overrides`
- `next-app/public/data/programs/anterior-hip-rebuild.json`

## Decisions
- New RailExercise fields are OPTIONAL (`?`) so `OffPlanSession.tsx:86`,
  which constructs the same type, needs no change.
- Optional work stays in `rowCount` (it is real work you may do); it is
  excluded from *remaining* counters only.
- Taper blocks reuse `block_squat_heavy` / `block_pull_heavy` item lists so
  nothing about exercise selection changes — only the FSL flag and the
  accessory `optional` flags differ.

## Status
**Done and shipped 2026-09-03.** 516 tests pass, typecheck + production build
clean.

## Open question for the founder
Phase 1's eval week: JSON said Tue = 5RM squat, Fri = 5RM block pull. The code
that actually ran did the opposite. The window is past so nothing is broken,
but if phase 3+ ever authors an eval week the two need to agree first.
