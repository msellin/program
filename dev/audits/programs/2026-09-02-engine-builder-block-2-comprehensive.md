# engine-builder-block-2 — Comprehensive Audit (2026-09-02)

Persona bundle: `next-app/tests/e2e/artifacts/personas/`.
Dimension detail: `2026-09-02-readiness-input-P0.md`, `2026-09-02-citation-dimension.md`.

**Read the harness caveat first.** Until this audit, no persona persisted
`started_at`, so the multi-dimensional programs graduated within days and every
artifact captured a graduation card where a real user sees a session (H-1). The
findings below are from artifacts regenerated after that fix; anything reported
against earlier captures for these programs should be re-derived.

## Verdict

Ships. The cleanest of the three: no citation defects, no intake defects, and
its safety screening is the model the others should follow.

## Findings

| id | Severity | Finding | State |
|---|---|---|---|
| P0-readiness | P0 | An aerobic program asked about hip clicking and gait change, and its authored readiness signals (resting HR against baseline, pace drop at fixed HR) were never read. | Fixed — declares `[low_back, knee, achilles]` |

Nothing else. No citation mismatch across 32 references, no unimplemented intake
promise, no screen-coherence defect.

## Clean, and notably so

- **The strongest evidence base in the catalog.** Specific effect sizes tied to
  specific prescriptions: Schumann's SMD −0.28 for explosive strength, Eddens'
  +6.91 % when lifting precedes, Robineau's 6-hour separation, Ross's
  non-response rate falling from 50 % to 0 % as intensity rises to 75 %,
  Bouchard's HERITAGE heritability behind the ~10× response-variation claim the
  landing makes.
- **Safety screening is done right.** `exertional_syncope_history`,
  `hypertension_unmanaged` and `post_covid_hr_elevated` are all declared in
  `intake.safety_gates[]` and hard-block. I nearly filed a false P0 here by
  grepping `src/` for the question ids and finding nothing — the gate mechanism
  is generic and data-driven, so ids correctly never appear in source. Worth
  recording as a method note for the next auditor.
- "1 block · 1 exercise" on Day is correct, not a composition failure: the
  threshold session is a single 50-75 min aerobic prescription carried in prose.
