# Failed attempt logging — context

Status at end of 2026-09-03 session: **code complete, 698 tests green
(was 674), not yet pushed.** No Supabase write made.

## Key files

| File | What changed |
|---|---|
| `next-app/src/lib/schemas.ts` | `failed: z.boolean().optional()` on `setLogSchema` |
| `next-app/src/lib/set-progress.ts` | `isFailedAttempt` / `isMadeSet` predicates |
| `next-app/src/lib/engine/tm-plausibility.ts` | `bestFailedAttempt`, dated ceiling, `above_failed_attempt` finding |
| `next-app/src/lib/engine/history.ts` | `lastSessionSetsFor` returns made sets only |
| `next-app/src/lib/engine/report.ts` | two `heaviest` picks exclude misses |
| `next-app/src/components/session/SetView.tsx` | "Missed N kg" intake, gated on TM |
| `next-app/src/components/record/CutCLogList.tsx` | renders "122 kg — missed" |
| `next-app/src/lib/failed-attempt.test.ts` | new; schema round-trip + sibling guards |

## Decisions and why

- **`reps: 0`, not `reps: null`.** `reps != null` is the "set is logged"
  predicate in 42 places. A miss IS logged work — you did it, the row is
  spent — so `null` would make it read as untouched everywhere at once.
  Same reasoning as `seconds`.
- **`failed` written explicitly on BOTH paths in `confirm`.** `updateSet`
  merges; writing it only when true leaves a stale `true` on a corrected
  set, and the engine would keep treating a made lift as a ceiling.
  Mutation-tested (M10).
- **The ceiling is dated.** Only failures on or after the best made lift
  count, so an old bad day cannot cap every estimate forever. Ties count —
  the ladder case puts both numbers in one session.
- **Lightest miss binds.** Missing 122 then 130 does not raise the ceiling.
- **`FAILURE_MARGIN_KG = 2.5`** — one plate pair below the failed load.
- **Gate is `isLoadable && has a training max`**, not `isLoadable`. This is
  the founder's off-plan objection, answered: `SetView` is shared with
  `OffPlanSession`, whose rail runs to 34 accessory/cardio items.

## Verification

All eleven guards mutation-tested — each break turns the suite red:

M1 dated filter · M2 lightest-not-heaviest · M3 flag-not-rep-count ·
M4 the cap itself · M5 **the schema field (dead-key case)** · M6 history
filter · M7 `isMadeSet` · M8 report exclusion · M9 the TM gate ·
M10 explicit-false write.

M5 matters most: the other tests build stores with `as unknown as Store`
and bypass Zod entirely, so without the round-trip test in
`failed-attempt.test.ts` a stripped key would have gone unnoticed — which
is exactly how `daily_log_schema` and `progression_rules.states[]` shipped.

## Next steps

1. Founder logs his own 122 through the new UI. Nothing was written to his
   Supabase row; he chose "ship the code first".
2. Once logged, `checkTrainingMaxes` should still be SILENT on front squat
   — 110 TM against a 117.3 estimate capped at 119.5 is 94%, inside the
   band. There is a regression test pinning exactly this. If it starts
   firing after he logs, the ceiling is wrong, not his TM.
3. `deadlift_conventional` (handover item C) is still open and still needs
   him.

## Not done, deliberately

- No `to_failure` flag for mid-set misses. Founder's steer was explicitly
  against more logging surface; you got 3 of 5, you log 3.
- Off-plan gains nothing. Same reason.
