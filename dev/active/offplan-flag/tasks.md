# Off-plan flag — tasks

- [x] `off_plan` added to `featureFlagsSchema`
- [x] `lib/features.ts` — `isOffPlanOn`, `hasOffPlanSetting`, `offPlanUsageDays`, grandfather threshold
- [x] Unit tests for `lib/features.ts`
- [x] `StoreHydrator` one-shot grandfather effect + `migrations_applied` marker
- [x] Settings toggle, rendered only when the flag is defined
- [x] Profile Off-plan row gated
- [x] Day's off-plan DashboardBlock removed
- [x] Brief footer line renamed to activity logging
- [x] `OffPlanSheet` retitled; drill section gated
- [x] `/off-plan` empty state when flag off
- [x] e2e: grandfathered account keeps it; public account loses the three surfaces but keeps activity logging
- [x] Master task list entry + commit

All shipped 2026-08-24.

## Learned during implementation

- **Two async writers raced.** The block-object migration and the new
  grandfather check both did `loadProgram(...) -> replaceStore(snapshot)`.
  Whichever resolved last clobbered the other's `migrations_applied`.
  Fixed by keying both effects on a store-subscribed `migrationsKey` and
  having the grandfather check defer while `needsBlockMigration` is true.
  The materialization keeper had the same latent bug and got the same
  treatment — it previously couldn't run until the next mount.
- **Test fixtures must be schema-valid.** `dayLogSchema` requires
  `date` / `symptoms` / `derived_state`. A DayLog missing them fails
  validation, which invalidates the WHOLE store, which sends `loadLocal`
  to its empty default, which loses the `updated_at` comparison in
  `pullRemote`, so the server copy silently wins and the injected data is
  simply absent. Presents as "my seeding does nothing." Cost an hour.
- **No persona exercises off-plan.** All 15 persona simulations logged
  zero off-plan days — even the simulated user journeys never touched the
  surface. Corroborates the cut.
