---
name: Batch 38 plan — F10 promote-closeouts + P1-78
started: 2026-08-21
---

# Batch 38 · plan

## Scope (in priority order)

Approved by founder in continuation of Batch 37 review:

1. **F10-CSM-P0** (H impact, M) — PerProgramAdherenceCard reports 0/25 despite 23 logged sessions. Root cause hypothesis: `legacy-to-blocks.ts:75-86` — blocks never flip planned→done. But BUG-8 in Batch 37 already shipped `flipBlockDoneIfEligible`. Need to verify what's still broken.
2. **F10-Rowing** (H impact, M-L) — 5 items: R-3 Das 2019 drop, orphan `references[]` schema drift, Proteau title inline fix, HERITAGE dual-write from `runs[]`, P0-1 four-way Today contradiction on graduation.
3. **F10-HSW** (M impact, S ~2h JSON) — H-3 Ferrari 2021 drop (still in refs at :685, :1507) + H-4 sci_reports softening (:82, :1541, :1719, :1720).
4. **P1-78** (M impact, S) — Kill ReadinessDot from AppShell header + polish HeroStateCard banner strings.

## Non-goals

- F10-EB, F10-OHM, F9-rest — save for Batch 39. They're feature work, not close-outs.
- P2-32 icon sweep — deferred.
- S3, S4, QA-1 — founder decisions.

## Verification

- Persona harness (14/14) must remain clean.
- CSM: PerProgramAdherenceCard shows real numbers on persona-strength + persona-strength-slow.
- Rowing: R-3 Das drop verified via grep, HERITAGE dual-write triggers via runs ingest.
- HSW: grep confirms Ferrari 2021 gone from JSON, no orphan `[cited]` references.
- P1-78: AppShell renders with no ReadinessDot; HeroStateCard reads with em-dash.

## Risks

- CSM adherence bug may already be partially fixed by BUG-8 (Batch 37 shipped `flipBlockDoneIfEligible`) — need to re-verify before assuming still broken.
- Rowing HERITAGE dual-write touches ingest layer — could regress if `runs[]` shape differs from what `retest_readings` expects.
- Rowing "P0-1 four-way contradiction" already listed as closed in Batch 17 — need to see if REV-5 is reporting stale.
