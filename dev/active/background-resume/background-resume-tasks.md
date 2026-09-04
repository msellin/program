# Backgrounding — tasks

- [x] Diagnose: two distinct bugs, not one
- [x] `lib/wall-clock.ts` primitive
- [x] `RestTakeover` → wall clock
- [x] `RestTimer` → wall clock
- [x] `SetView` hold → wall clock
- [x] Re-read every second-keyed side effect for gap-correctness
- [x] Backgrounding tests (system clock moves, intervals do not)
- [x] Mutation-test the clock across all three timers
- [x] `lib/session-cursor.ts` + `reconcileCursor`
- [x] Wire into `DaySession` and `OffPlanSession`
- [x] Mutation-test all four cursor guards
- [x] verify / eslint / tsc / production build
- [ ] **Founder: background mid-set on the real PWA and report**
- [ ] Deferred: persist a running timer across a cold load (needs the
      "rest finished N min ago" state — new UI, not a restore)
