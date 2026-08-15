# Simulation project — running context

**Status:** Phase 1 baseline ✓ · Phase 2 harness ✓ · Phase 3 first 90-day matrix run ✓ · **Phase 3-audit in flight** (3 agents running)

## What exists

### Test infrastructure
- `tests/e2e/setup-test-user.ts` — Supabase admin REST helper, safety-fenced (e2e- prefix, uid exclusion)
- `tests/e2e/fixtures.ts` — Playwright `authedPage` fixture, dismisses onboarding
- `tests/e2e/playwright.config.ts` — targets prod
- `tests/e2e/baseline.spec.ts` — 15 tests, all green
- `tests/e2e/simulate.spec.ts` — 30-day smoke sim, green
- `tests/e2e/simulate-matrix.spec.ts` — 9-sim × 90-day matrix, green (1.3 min total runtime)

### Simulator harness
- `tests/e2e/harness/archetype.ts` — 5 archetypes: overperformer, underperformer, consistent-average, erratic, injured-recovery
- `tests/e2e/harness/simulator.ts` — store-driven day iterator with clock mocking

### Test user
- `e2e-baseline@margus.dolmit.dev` / `TestPassword123!` (used for all baseline + sim runs)

## Sim results — matrix run

9 archetype × program combinations, 90 days each. Results in `tests/e2e/screenshots/matrix/`:
- Every sim wrote 52-90 logs (matches archetype's compliance rate)
- Erratic archetype: 38 skips over 90 days (correct — 40% skip rate)
- Injured-recovery: 10 skips clustered in weeks 1-2 (correct)
- **All 9 sims:** `day_adjustments_count: 0`, `training_maxes: {}` → the adaptive engine either (a) doesn't respond to logs alone, or (b) responds only to specific block IDs, and my simulator writes to a synthetic `sim:strength:sim_lift` block.

## Audit agents in flight

1. **UX/UI audit** — reads all screenshots (baseline + matrix), documents findings F-003+
2. **Logic/engine audit** — reads adapt.ts + note-signals + suggest + sim outputs, explains why day_adjustments never fired. Findings F-050+
3. **Whitepaper defensibility audit** — checks whether each program's marketed claims are actually rendered in the shipped app. Findings F-100+

All 3 append to `findings.md` and return summaries.

## Known findings before audit
- F-001: manifest name inconsistency ("Anterior hip + strength rebuild" vs canonical short form)
- F-002: NoActiveProgram screen omits the ⋮ overflow menu

## Simulator limitations (known)

- Writes to synthetic block `sim:strength:sim_lift` — real program block IDs would let engine adapt properly. **The Logic agent will confirm/refute this hypothesis and produce a v2 simulator plan.**
- Onboarding modal shows on some post-clock snapshots (cosmetic — sim still works)
- Doesn't simulate morning check (`/check` route inputs)
- Doesn't simulate SignalsStrip proposal accept/dismiss actions
- Doesn't simulate `day_adjustments` writes

## Where to resume

When 3 audit agents return:
1. Read `findings.md` — should now have F-001 through F-150+
2. Group findings by severity (BLOCKER / SHOULD-FIX / MINOR)
3. Decide with user which to fix first
4. Rebuild simulator with real block IDs (per Logic agent's plan) if the "adaptive engine doesn't respond" gap is real
5. Rerun matrix (90 days first, then 180) once simulator can trigger engine
6. Fire Phase 4 whitepaper-claim audit
