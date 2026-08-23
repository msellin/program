# Off-plan: bring to the Brief/Set/Rest pattern

Copied from the approved plan (harmonic-crafting-firefly.md at approval
time, 2026-08-23/24). See that file's history if needed.

## Why

Consistency sweep found `/off-plan` as the one page still on the
pre-redesign `ExerciseCard`/`SetRow`/`RestTimer` stack. User confirmed:
bring it to the new pattern via architectural reuse, not a parallel
reskin — off-plan's blocks are the same `Block`/item shape Day already
handles (`program.blocks` filtered to accessory/run category, no
phase/schedule gating).

## Approach

New sibling shell `src/components/offplan/OffPlanSession.tsx` (Day's
`DaySession.tsx` untouched). Owns date (via existing `DateNav`), the
same mode/activeKey/activeSetIndex/sheet state pattern, a rail built by
filtering `program.blocks` directly (no `blocksForDate`/phase — these
aren't schedule-gated). Renders a grouped browsing list (Accessories &
home rehab / Cardio & conditioning, same labels/logic as today) in
brief-equivalent mode, and the *existing* `SetView`/`RestTakeover`/
`OverflowSheet`/`NoteSheet` unmodified once an exercise is tapped.

One real extension: `SetView` gains an `isLoadable` flag (ported from
the old `ExerciseCard`'s `["strength","unilateral"].includes(category)`
gate) to hide the weight row for mobility/cardio exercises. `RailExercise`
type gains `isLoadable: boolean`.

`off-plan/page.tsx` becomes a thin wrapper, matching how
`SessionClient.tsx` wraps `DaySession`.

## Verification bar

Same as every prior pass: tsc/eslint/vitest clean (net-neutral vs.
baseline), live walk on the sandboxed e2e test account covering both
loadable and non-loadable exercises, DateNav still works, no console
errors. `ExerciseCard`/`SetRow`/`RestTimer` become fully orphaned once
this lands — flagged for a separate follow-up deletion, not bundled
into this commit.
