# Tasks — separate person-specific cues from the shared exercise library

- [x] Audit `exercises.json` cues / cues_external_focus / cues_internal_focus for
      person-specific clinical content (also swept `rationale`, `setup`, `avoid`,
      `notes`, `default.extra_set_side`, `class_modifications`)
- [x] Add `exercise_overrides` + `exerciseOverrideSchema` to `programSchema`
- [x] `applyProgramExerciseOverrides()` in `data-loader.ts` (pure, cache-safe)
- [x] De-specify 11 library entries to general coaching copy
- [x] Move the personal wording into `anterior-hip-rebuild.json.exercise_overrides`
- [x] Wire the merge into all 5 render sites (record, report, off-plan, today, day)
- [x] `src/lib/data-integrity.test.ts` — 57 assertions, all green
- [x] Verified the guard fails against pre-change `exercises.json` (6 failures,
      including `concurrent-strength-maintenance renders no personal language`)
- [x] Full suite 280/280, `npm run build` clean
- [x] CLAUDE.md hard-constraint + validation sections updated

## Fixed in passing

- [x] `programs/first-strict-pullup.json` — `evidence_base.references[20]`
      (`rhea_2003_meta`, added in 5593f05) was missing the required `used_for`.
      `programSchema.parse` threw on it, so the program failed to load in the app
      entirely. Added the field.

## Not done — flagged for a decision

- `exercises.json.class_modifications[]` is an entirely personal CrossFit-class
  modification list (SLAP, posterior labral detachment, pseudoarthrosis with bone
  oedema, "documented provocateur"). It ships in the public `/data/exercises.json`
  but has **no consumer in `src/`** — schema only. Either move it under
  `anterior-hip-rebuild.json` or drop it; not touched here because nothing renders
  it and restructuring it is a separate call.
- Legacy `data/exercises.json` at the repo root (34-entry seed) still carries the
  original personal cues. Nothing loads it — the app serves
  `next-app/public/data/` only.
