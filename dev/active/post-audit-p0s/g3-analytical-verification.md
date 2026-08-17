# Phase 5 (G3) — analytical verification

**Status:** analytical pass complete 2026-08-17. Actual playwright matrix re-run deferred to a fresh session.

## Question

After Phases 1-4 shipped (A2 citations, A1 overperformer, A5 ProposalStack, B3 onboarding), are any assertions in `next-app/tests/e2e/simulate-matrix-v2.spec.ts` at risk of failing on re-run — either due to schema drift or engine behavior drift?

## What the simulator actually touches

`next-app/tests/e2e/harness/simulator-v2.ts` interacts with the app store by:
- Reading + writing `localStorage["program.log.v2"]` directly via `page.evaluate()`.
- Writing these fields on the parsed store object: `logs`, `training_maxes`, `day_adjustments`, `dismissed_proposals`, `skipped`, `tm_history`, `updated_at`.
- NOT calling `useStore` actions or rendering ProposalStack / ProposalCard / OnboardingRunner.
- NOT calling engine functions (`evaluateOverperformer`, `assessReintroReadiness`, `nextEligibleTier`) — it fabricates outcomes based on the archetype script.

The v2 spec ends with a `finalStore` capture and asserts against derived summary counts (logs_count, skipped_count, day_adjustments_count, training_maxes).

## Change-by-change risk

| Phase | Change | Simulator risk | Notes |
|---|---|---|---|
| A2 | `evidenceBaseSchema.reference_ids` added optional | None | Optional field, ignored on parse; simulator doesn't touch program JSON |
| A2 | `day_adjustments[date].citation_snapshot` added optional | **None** | Simulator writes `day_adjustments` without `citation_snapshot`; Zod optional field survives |
| A1 | `evaluateOverperformer` added | None | Simulator doesn't call it; direct-write bypasses it |
| A5 | `Proposal` discriminated union added | None | Type-only; not persisted |
| A5 | `storeSchema.proposal_history[]` added optional | None | Simulator doesn't write it; optional survives |
| A5 | `<ProposalStack>`, `<ProposalCard>` added | None | Simulator doesn't render UI |
| A5 | 4 legacy proposal components deleted | None | Simulator never imported them |
| A5 | SignalsStrip stripped of proposal branches | None | Simulator doesn't render SignalsStrip |
| B3 | `programSchema.onboarding_steps` added optional | None | Optional field on program JSON, not on store |
| B3 | `Onboarding.tsx` deleted, replaced with `OnboardingRunner` | None | Simulator doesn't traverse onboarding UI; may or may not gate on the modal (check next paragraph) |
| B3 | `localStorage["program.onboarding.done"]` → `program.onboarding.done.<slug>` | **FIXED** | Simulator seeded the OLD key at `simulator.ts:124` and `simulator-v2.ts:177`. Would have blocked next matrix run with the OnboardingRunner modal covering the UI. Both sites now write BOTH the new per-program key AND the legacy key (transition safety). |

## Non-zero risk items — checked

1. **Onboarding key rename** — Fixed 2026-08-17. `simulator.ts:125` and `simulator-v2.ts:180` now write the per-program key `program.onboarding.done.<slug>` alongside the legacy key. Fixture `fixtures.ts:36-42` also has a runtime "Skip setup" click fallback — that survives regardless of the localStorage key.
2. **ProposalStack no-op on the simulated store** — the sim writes `day_adjustments` directly, so `selectProposals` will treat the day as "already accepted" and return no proposal. That's correct behavior; the simulator's counts are unaffected. But if a future spec asserts on `proposal_history[]` presence, that assertion needs the sim to also write history entries.

## Assertions to add on the next real re-run (not this session)

- `overperformer × strength-program-with-active-5/3/1-phase → simSummary.day_adjustments_count ≥ 1` — the A1 verify criterion from the implementation plan. Note that on hip-rebuild specifically, the simulator uses cycle-boundary direct-writes; A1's off-cycle bump path never actually fires under the current archetype. To surface A1 in the sim harness, either:
  - Add a new matrix cell using a non-hip-rebuild strength program, OR
  - Have the simulator call `evaluateOverperformer` per day and simulate the Accept branch when it fires. Simpler + more truthful than the direct-write.

## Onboarding-modal grep

