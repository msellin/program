# first-strict-pullup — Comprehensive Audit (2026-09-02)

Persona bundle: `next-app/tests/e2e/artifacts/personas/`.
Dimension detail: `2026-09-02-readiness-input-P0.md`, `2026-09-02-citation-dimension.md`.

**Read the harness caveat first.** Until this audit, no persona persisted
`started_at`, so the multi-dimensional programs graduated within days and every
artifact captured a graduation card where a real user sees a session (H-1). The
findings below are from artifacts regenerated after that fix; anything reported
against earlier captures for these programs should be re-derived.

## Verdict

Ships. Five dimensions audited; three P0s found and fixed, all of them shared
mechanism defects rather than authoring errors in this program.

## Findings

| id | Severity | Finding | State |
|---|---|---|---|
| P0-readiness | P0 | The morning check asked about `groin_left` / `buttock_left` / `shoulder_right` — the hip program's clinical map. This program authors `elbow_symptom_score` because medial epicondylitis is the classic pull-up injury, and there was no elbow field, so a user at 7/10 had nowhere to report it and the engine saw green. | Fixed — declares `[shoulder, elbow, low_back]` |
| I-1 | P0 | `elbow_tendon_pain` and `shoulder_pain_overhead` promised deferrals in their help text ("we defer heavy negatives and use scap-focused work first") that nothing implemented. | Fixed — `intake_exclusions[]`, visible on the session |
| S-1 | P1 | The contextual-interference legend rendered over the graduation card. | Fixed — `isPastProgramEnd` guard |
| C-1 | P1 | `beattie_2014` — "The effect of strength training on performance in endurance athletes" — cited for "forearm and grip strength training dose range". The paper covers running and cycling economy. | Fixed — reference removed |
| C-2 | P2 | `vigouroux_2007` (climbing tendon/pulley forces) cited to support a 20-45s hang dose. | Fixed — `used_for` narrowed to what the paper shows |
| C-3 | P2 | `sinnett_2019` described as EMG evidence; it is a training-intervention study. | Fixed — claim rewritten, not verifiable as EMG |
| W-1 | P2 | Day showed "WEEK 3 OF 4" and an unqualified "Week 7" together — phase week vs program week, nothing distinguishing them. | Fixed — reads "Program week 7" |

## Clean

- 20 references, all resolving, all with `used_for`, no orphans either direction.
- Motor-learning basis is standard and correctly applied, including
  `wulf_shea_2002` cited *against* the program's own default as a caveat.
- Tier phases carry `for_tier_ids` that all resolve; no tier lacks a phase.
- Session composition renders 3 blocks / 6 exercises at day 45 with no empty slots.
