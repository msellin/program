# Off-plan redesign — task checklist

- [x] Read `off-plan/page.tsx` in full — confirmed it reads
      `program.blocks` filtered by category directly, same shape
      `DaySession`'s rail already consumes, no separate data model
- [x] `RailExercise` type (DaySession.tsx) gains `isLoadable: boolean`;
      Day's own rail-builder sets it `true` (blocksForDate only ever
      selects strength blocks)
- [x] `SetView.tsx` extended: hides the weight display/stepper/plates
      line when `!isLoadable`, confirm button reads "Done" instead of
      "Done — N kg", "Change the reps" instead of "Change the weight",
      writes `weight_kg: null` on confirm for non-loadable exercises,
      skips the PR check (no weight to compare)
- [x] `src/components/offplan/OffPlanSession.tsx` — new sibling shell to
      DaySession: DateNav-driven date, grouped browsing list
      (Accessories & home rehab / Cardio & conditioning, same
      program-dependent labels the old page had), flattened rail across
      both groups, reuses SetView/RestTakeover/NoteSheet/OverflowSheet
      unmodified beyond the isLoadable extension above
- [x] `off-plan/page.tsx` rewritten as a thin wrapper (matches
      SessionClient.tsx → DaySession pattern)
- [x] tsc clean; eslint unchanged from baseline (71 problems, verified
      via prior baseline checks — zero new issues); vitest 167/167
- [x] Live-verified on the sandboxed e2e test account, switched to
      `anterior-hip-rebuild` (real accessory data, confirmed via
      data/program.json + exercises.json to have a genuine mix of
      loadable ("goblet_squat", category strength) and non-loadable
      ("hip_flexor_iso_seated" isometric, "dead_bug" trunk, "hip_switch_9090"
      mobility, etc.) exercises — the actual scenario this extension
      exists for, not a synthetic one):
  - Browsing list renders both groups with real rows
  - Non-loadable exercise (Seated hip flexor isometric) → Set screen
    correctly shows big reps number, no weight, "Done" / "Change the
    reps"
  - Loadable exercise (Goblet squat) → full weight UI, plates line,
    "Done — 0 kg" / "Change the weight"
  - Rail flattens across both groups correctly, rail-tap navigation
    works
  - Rest takeover works identically to Day's (full-screen, "Next up"
    showing the next exercise)
  - No console errors at any point
  - `/` dashboard still renders correctly after switching the test
    account's active program (sanity check, unrelated code path)

## Known follow-up, not done here
`ExerciseCard`/`SetRow`/`RestTimer` are now fully orphaned (this was
their last remaining consumer). Not deleted in this commit — keeping
build-and-delete separate, matching the pattern from the Day redesign.
Flagging as a clean, low-risk next step: `grep -rln
"ExerciseCard\b\|SetRow\b" src/app` should return nothing once this
lands, confirming they're safe to remove.
