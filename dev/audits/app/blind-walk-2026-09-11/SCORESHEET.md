# Terav Batch 36 · blind-walk scoresheet

**Generated**: 2026-09-11T16:34:04.354182Z
**Total slots**: 80

## Instructions

For each screen, give a numeric score 1–10 (higher = better) based on:

1. Does this read as a 2026 app? (Peer benchmark: Linear, The Outsiders, Runna, Anthropic Console)
2. Is the primary emphasis clear? (Workout name largest on Today, single primary CTA per surface)
3. Honest in worst state? (Amber weeks look amber, no glow/confetti)
4. Accent economy? (One bronze accent per surface, never two competing)


## What this run is, and is not

Generated 2026-09-11 — the first time `blind-walk.py` has ever been run. It was
written for the Batch 36 gate, completed, and never executed, so batches 37,
38, 38.1 and 39 all shipped on top of an unevaluated one.

**The comparison is baseline vs. CURRENT, not vs. Batch 36.**
`personas.post-batch-36/` was never generated and the fleet has been
regenerated many times since, so a Batch-36-only comparison is no longer
available and would be the less useful one anyway: what matters is whether the
app is better now than it was before, not whether one batch of four moved it.

**40 pairs, sampled.** The full run produces 840 slots — three and a half hours
of scoring at fifteen seconds each. The script assumed a far smaller set than
the persona fleet has grown into, so `--sample` was added. 80 slots is about
twenty minutes.

**2211 screens exist only in the post set.** The app has grown by more surfaces
than the baseline contains. Those cannot be scored comparatively at all, and
the gate says nothing about them.

Scores go in the table below. `MAPPING.json` holds the decode key — do not open
it until every row is filled, or the blinding is gone.

## Scores

| Slot | Score (1–10) | Notes |
|---|---|---|
| 001 | | |
| 002 | | |
| 003 | | |
| 004 | | |
| 005 | | |
| 006 | | |
| 007 | | |
| 008 | | |
| 009 | | |
| 010 | | |
| 011 | | |
| 012 | | |
| 013 | | |
| 014 | | |
| 015 | | |
| 016 | | |
| 017 | | |
| 018 | | |
| 019 | | |
| 020 | | |
| 021 | | |
| 022 | | |
| 023 | | |
| 024 | | |
| 025 | | |
| 026 | | |
| 027 | | |
| 028 | | |
| 029 | | |
| 030 | | |
| 031 | | |
| 032 | | |
| 033 | | |
| 034 | | |
| 035 | | |
| 036 | | |
| 037 | | |
| 038 | | |
| 039 | | |
| 040 | | |
| 041 | | |
| 042 | | |
| 043 | | |
| 044 | | |
| 045 | | |
| 046 | | |
| 047 | | |
| 048 | | |
| 049 | | |
| 050 | | |
| 051 | | |
| 052 | | |
| 053 | | |
| 054 | | |
| 055 | | |
| 056 | | |
| 057 | | |
| 058 | | |
| 059 | | |
| 060 | | |
| 061 | | |
| 062 | | |
| 063 | | |
| 064 | | |
| 065 | | |
| 066 | | |
| 067 | | |
| 068 | | |
| 069 | | |
| 070 | | |
| 071 | | |
| 072 | | |
| 073 | | |
| 074 | | |
| 075 | | |
| 076 | | |
| 077 | | |
| 078 | | |
| 079 | | |
| 080 | | |

## Binary gate (§8 v1.1.1)

**Q1**: Does the Today surface read as a 2026 peer app to you?

- [ ] YES · ship gate PASSES
- [ ] NO  · ship gate BLOCKS · unwind to bento fallback per §4

## Ship-gate decision

- Numeric mean ≥ 7.0/10 (no surface < 6.0) AND Q1 = YES → ship
- Numeric mean 6.0-6.9/10 → §4 bento-fallback unwind
- Numeric mean < 6.0/10 OR Q1 = NO → pause and re-brief