# Failed attempt logging — tasks

- [x] Read handover, map the consumers of `reps`
- [x] Confirm scope with founder (missed-attempt only; dated ceiling; no Supabase write)
- [x] `failed` on `setLogSchema`
- [x] `isFailedAttempt` / `isMadeSet` in `set-progress.ts`
- [x] `bestFailedAttempt` + dated ceiling + `above_failed_attempt` in `tm-plausibility.ts`
- [x] `lastSessionSetsFor` excludes misses
- [x] `report.ts` — both `heaviest` picks exclude misses
- [x] `SetView` intake, gated on `isLoadable && has TM`
- [x] `SetView` pips + "Missed" badge + rep-seed fix
- [x] `CutCLogList` renders "— missed"
- [x] Schema round-trip test (dead-key guard)
- [x] Mutation-test all eleven guards
- [x] `npm run verify` — 698 passing
- [x] eslint + tsc clean
- [x] Production build check
- [ ] Commit and push
- [ ] Founder logs the 122 through the UI
