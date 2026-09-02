# muscle-up — Comprehensive Audit (2026-09-02)

Persona bundle: `next-app/tests/e2e/artifacts/personas/`.
Dimension detail: `2026-09-02-readiness-input-P0.md`, `2026-09-02-citation-dimension.md`.

**Read the harness caveat first.** Until this audit, no persona persisted
`started_at`, so the multi-dimensional programs graduated within days and every
artifact captured a graduation card where a real user sees a session (H-1). The
findings below are from artifacts regenerated after that fix; anything reported
against earlier captures for these programs should be re-derived.

## Verdict

Ships. Same three shared-mechanism P0s as its sibling; its own authoring is the
most careful in the catalog.

## Findings

| id | Severity | Finding | State |
|---|---|---|---|
| P0-readiness | P0 | No wrist field existed, while false grip is notorious for wrist strain and this program authors `wrist_symptom_score`. | Fixed — declares `[shoulder, elbow, wrist]` |
| I-1 | P0 | `elbow_tendon_pain` promised "we defer ring dip work and use band-assisted dip only". Nothing read it — and the substitute it named did not exist in `exercises.json`, so the promise was unkeepable twice over. | Fixed — `intake_exclusions[]` plus `mu_band_assisted_ring_dip` authored |
| S-1 | P1 | "Week 9 · random practice" rendered above "YOU FINISHED · 8 weeks logged". | Fixed |
| C-3 | P2 | `sinnett_2019` described as EMG evidence. | Fixed |

## Clean

- 22 references, all resolving. Graduation at day 60 of an 8-week arc is correct.
- **Honest where it is weakest**, which is worth recording: `sadowski_2021` is
  labelled "the closest analog" rather than direct evidence, and
  `vidal_rovira_2024` carries "small sample, flagged for founder
  science-advisory review" inside its own `used_for`. Citing a limitation inside
  the citation is the behaviour the ladder is meant to reward.
- Three tiers, all with resolving `for_tier_ids`.
