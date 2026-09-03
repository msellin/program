# Failed attempt logging — plan

**Task A from `HANDOVER-2026-09-03.md`.** Founder made 115×1 front squat and
failed 122. The 122 is the most informative number in that session and it
lives in a free-text note no engine reads.

## Why this is a program feature, not an off-plan one

Founder pushed back on 2026-09-03, reasonably: off-plan should not become a
detailed logging surface in MVP, and the thing that matters is input to
*program* exercises.

That is exactly what this is. `front_squat` is a training max. Every front
squat prescription is computed from it, `tm-plausibility` currently has to
guess a ceiling it cannot see, and the 122 is the number that settles it.

The scope consequence he is right about: `SetView` is shared by
`DaySession.tsx:293` (program) and `OffPlanSession.tsx:204` (off-plan), so an
ungated affordance would appear on all 34 items of the off-plan rail, on
mobility holds, on aerobic blocks. **Gate: loadable set AND the lift has a
training max.** Nothing else in the app gains a field.

## Decisions taken (founder, 2026-09-03)

1. **Missed attempt only.** `failed: true` always means `reps: 0` — you
   loaded it, you did not lift it. A mid-set miss stays what it is: you got
   3 of 5, you log 3. One flag, one meaning, no new field to fill in.
2. **Ceiling caps the estimate, dated.** A failed load caps the estimated
   1RM to just under it, but only failures on or after the date of the best
   made lift count. An old miss on a bad day must not cap a newer log.
3. **No Supabase write.** Ship the code; founder logs the 122 himself
   through the new UI.

## The sibling problem

`reps: 0` flows into consumers with no `> 0` guard. Fixing `SetView` alone
would ship a defect, which is the recurring shape this repo keeps hitting.

Already safe (guard `reps > 0`):
- `lib/pr.ts` `isSetPR` — `reps <= 0` returns false
- `lib/engine/adapt.ts` `pickHeaviest` — `r <= 0` skipped, so
  `performanceSignals` cannot read a miss as headroom
- `lib/engine/tm-plausibility.ts` `estimateOneRM` — `reps > 0` required
- `lib/engine/weekly-narrative.ts:170` — `s.reps <= 0` skipped

Needs fixing:
- `lib/engine/report.ts:272` — sorts sets by weight, takes heaviest with
  `reps != null`. A failed 122 becomes `top_kg` on the clinical report.
  Same defect at `:199`.
- `lib/engine/history.ts` `lastSessionSetsFor` + `SetView`'s `prev` — would
  seed the next session's weight at 122 and show "Last time 122 × 0".
- `components/record/CutCLogList.tsx:211` — renders "122 kg × 0".
- `SetView` set pips — `${weight_kg}×${reps}` reads "122×0".

`isSetLogged` counts a failed set as logged (`reps != null`) and that is
CORRECT — you did the attempt, the row is used, progress should advance.
Do not change it.

## Phases

1. Schema: `failed: z.boolean().optional()` on `setLogSchema`, with the
   comment explaining that `reps: 0` is the invariant.
2. `SetView` intake, gated as above. Writes `{weight_kg, reps: 0, failed: true}`.
3. Display: pips, `CutCLogList`, `prev` seeding.
4. `report.ts` exclusions.
5. `tm-plausibility`: `bestFailedAttempt`, dated ceiling, new finding kind
   for a TM at or above a failed load.
6. Tests, including deliberate mutation to prove each guard is load-bearing.

## Risk

Zod strips unknown keys silently. `failed` must be read by something and
have a test proving it, or it becomes this repo's most-repeated defect.
`tm-plausibility` is the consumer.
