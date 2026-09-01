# Separate person-specific clinical cues from the shared exercise library

## Problem

`next-app/public/data/exercises.json` is a shared movement library. Several `cues[]`
and `rationale` strings encode one individual's clinical findings (right-shoulder
SLAP / posterior labral detachment / retroversion, Bertolotti segment, documented
left glute-max and hip-flexor deficits, a specific 150 kg block-pull threshold).

Three of the affected exercises — `back_squat_highbar`, `front_squat`,
`block_pull_midshin` — are referenced by `concurrent-strength-maintenance`, which is
catalog-public (`personal: true` is set only on `anterior-hip-rebuild` in
`programs/manifest.json`). Any beta user on CSM is shown one person's shoulder
diagnosis as generic coaching copy. CLAUDE.md requires the data stay de-identified.

Additionally `default.extra_set_side: "left"` is baked into four library entries and
rendered as a "left emphasis" badge by `ExerciseCard` for every program.

## Approach

Per-program override layer, not a fork of the library.

1. Add `exercise_overrides` to `programSchema` — a map keyed by `exercise_id`:
   `{ cues?, cues_append?, cues_external_focus?, cues_internal_focus?, setup?,
      rationale?, warning?, extra_set_side? }`.
2. `applyProgramExerciseOverrides(byId, program)` in `data-loader.ts` returns a new
   `byId` with the program's overrides merged. Pure, no cache mutation.
3. De-specify the leaked strings in `exercises.json` to general coaching copy.
4. Move the person-specific text into
   `programs/anterior-hip-rebuild.json.exercise_overrides` — clinical meaning
   preserved verbatim for the one program it belongs to.
5. Call the merge at every render site that has a program in hand.
6. Add `src/lib/data-integrity.test.ts`:
   - referential integrity (every `exercise_id` resolves)
   - every override key resolves to a real exercise
   - a person-specific-language guard over the shared library
   - hip-rebuild still renders the personal cues after merge

## Risks

- Sites that load exercises without a program (log lists, fallbacks) render general
  copy. That is the intended default, not a regression.
- Overrides are additive; no program loses cue rendering.

## Out of scope (flagged, not changed)

- `exercises.json.class_modifications[]` — an entirely personal CrossFit-class
  modification list (SLAP, posterior labral detachment, pseudoarthrosis with bone
  oedema). Shipped in the public JSON but has no consumer in `src/`.
- Legacy `data/exercises.json` (34-entry seed, not served by the app).
