# Context

## Key files

- `next-app/public/data/exercises.json` — shared library, now general copy only
- `next-app/public/data/programs/anterior-hip-rebuild.json` — `exercise_overrides`
  (after `training_maxes`), 11 entries, plus `exercise_overrides_note`
- `next-app/src/lib/schemas.ts` — `exerciseOverrideSchema`, `programSchema.exercise_overrides`
- `next-app/src/lib/data-loader.ts:97` — `applyProgramExerciseOverrides`
- `next-app/src/lib/data-integrity.test.ts` — the guard

## Decisions

- Override layer keyed by `exercise_id`, scoped to the program, merged at render
  time. Not a per-user constraint layer — nothing in the app models user-level
  clinical constraints yet, and `anterior-hip-rebuild` is `personal: true`, so
  program scope and user scope coincide today. If a per-user layer lands later,
  `applyProgramExerciseOverrides` is the seam to extend.
- `cues` replaces, `cues_append` adds. Replace is used where the personal wording
  is a more specific version of the same cue (`back_squat_highbar`, `front_squat`,
  `deadlift_conventional`, `bulgarian_split_squat_db`); append where it is purely
  additive (`glute_bridge_single`, `single_leg_rdl`, `block_pull_midshin`,
  `banded_march_standing`, `split_squat_rfe`).
- `default.extra_set_side` moved out of the library too — `ExerciseCard:73` renders
  a laterality badge straight off it, so a baked-in `"left"` was the same defect.
- `TodaySession` runs concurrent tracks off one library, so it folds every active
  program's overrides in. Only `personal: true` programs carry any, and those are
  single-user, so the worst case is the owner seeing their own constraint on a lift
  two of their tracks share.
- Sites that load exercises without a program (log lists, loading fallbacks) render
  the general copy. That is the correct default, not a regression.

## State

Complete. Suite green (280/280), build clean.
