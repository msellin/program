# Off-plan flag — context

## Key files

- `next-app/src/lib/features.ts` — NEW. Flag read + grandfather eligibility.
- `next-app/src/lib/schemas.ts` — `featureFlagsSchema`, add `off_plan`.
- `next-app/src/components/StoreHydrator.tsx` — one-shot grandfather effect.
  Already hosts the block-object migration + the materialization keeper.
- `next-app/src/app/settings/page.tsx` — `ToggleRow` pattern to copy.
- `next-app/src/app/profile/page.tsx:~280` — the Off-plan row.
- `next-app/src/components/session/TodaySession.tsx:~559` — Day's off-plan card.
- `next-app/src/components/session/BriefView.tsx:~203` — Brief footer line.
- `next-app/src/components/session/OffPlanSheet.tsx` — the sheet.
- `next-app/src/components/offplan/OffPlanSession.tsx` — `/off-plan` body.

## Decisions made

- Tri-state flag, not boolean. `undefined` is what hides the Settings row
  from new users; once set (either value) the row persists so the feature
  can always be recovered in-app.
- Grandfather threshold 3 distinct days, not 1.
- Day's off-plan DashboardBlock deleted unconditionally, not gated — the
  founder asked for "one menu item under Profile", and the card duplicated
  both the Profile row and the Brief footer.
- Activity logging prominence stays uniform. Program-conditional
  prominence (loud for the 4 run-measured programs) was proposed and
  dropped to avoid scope creep.

## Verification

- `npx vitest run` — unit.
- `E2E_BASE_URL=http://localhost:3000 npx playwright test tests/e2e/offplan-flag.spec.ts --config tests/e2e/playwright.config.ts`
- Personas: `persona-recover` (hip, has off-plan history → grandfathered),
  `persona-engine` (public, no history → surfaces gone, activity logging
  still present).
