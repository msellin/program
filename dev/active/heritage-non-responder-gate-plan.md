# HERITAGE non-responder gate — plan

Founder decision 2026-08-18 (Q3, path A · Tier 3): add mid-block retest
cadence so the programs can classify non-response per Hecksteden 2015
(≥2 baselines needed) instead of the current single-Week-8 shortcut.

Affects **Engine Builder** + **Rowing 2K Test Prep** — both currently
invoke Bouchard 1999 HERITAGE variance at Push tier without honoring the
Hecksteden classification rule.

## The claim we're trying to earn

*"If your Week-8 (or Week-6 for Rowing) retest looks flat, we can tell
you honestly whether that's under-dosing or a HERITAGE-style true
non-response — because we compared TWO baselines, not one."*

Right now the programs say this in language; the engine doesn't do it.

## Data model additions

New per-program field: `retest_metrics_mid_block` (parallel to existing
`retest_metrics` for end-of-block).

```jsonc
"retest_metrics_mid_block": [
  {
    "metric_id": "vo2max_est_or_submax_hr",
    "at_week": 4,  // half of 8-week Engine Builder block
    "cadence_weeks": 4,
    "trigger": "user_initiated",
    "purpose": "First of two HERITAGE-baseline points. Classifier below."
  }
]
```

New per-program field: `non_responder_classifier` (declarative rule the
engine reads):

```jsonc
"non_responder_classifier": {
  "requires_baselines": 2,
  "signal_metric": "submax_hr_bpm | vo2max_est | threshold_pace_500m",
  "under_dosing_pattern": {
    "improvement_at_mid_block": "< target * 0.4",
    "recommendation_key": "increase_intensity_or_frequency"
  },
  "true_non_response_pattern": {
    "improvement_at_mid_block": "< 5% of target",
    "improvement_at_end_block": "< 15% of target",
    "recommendation_key": "punt_to_next_arc_or_swap_program"
  }
}
```

## Reader migration

- **Progress page** — new `<HeritageClassificationCard>` renders when both
  baselines are logged. Shows: "You're in Cluster A (responding — keep
  going)" or "Cluster B (under-dosing — engine will bump load)" or
  "Cluster C (HERITAGE non-responder — try Rowing 2K in a different arc)".
- **Today** — mid-block retest date surfaces as a proposal card. Same
  confirm-first mechanic as everything else.
- **Coach chat** — gains the classification result as context.

## Copy alignment

Program `outcome_evidence` copy currently says things like *"HERITAGE
variance = 10× range; Ross 2015 non-response usually under-dosing."*
Once the classifier ships, we change to *"Your classification will
tell us which — mid-block retest at Week 4."*

## Effort estimate

**~4-6h**, mostly cross-cutting:

- Schema: 1h (Zod additions, 3 program JSON edits: Engine Builder,
  Rowing 2K, and CSM if it invokes the same claim)
- Materializer + engine rule: 1.5h (compare 2 baselines against
  patterns, produce classification enum)
- Progress card: 1h
- Today proposal card: 1h
- Copy updates in 3 programs: 30m
- Tests: 1h

## Phased ship

- **Phase 1** (2h) — schema + program JSON edits. Zero UI. Ready for
  reader implementation.
- **Phase 2** (2h) — Progress `<HeritageClassificationCard>`, Today
  proposal card, feature flag OFF.
- **Phase 3** (30m) — flip flag ON for founder account, validate.

## Founder decisions still open

- **Which programs get this**? My default: Engine Builder + Rowing 2K
  (both currently invoke HERITAGE at Push tier). CSM invokes Schumann
  2022 differently — probably doesn't need the classifier. Confirm.
- **What's the mid-block metric**? For Engine Builder: submax HR at
  fixed pace is the fastest-moving signal — recommended. For Rowing 2K:
  500m TT pace at threshold RPE — recommended. Confirm.
- **What's the recommendation delivery**? A proposal card user Accepts,
  or an inline classification chip on Progress that only shows once both
  baselines are logged? My recommendation: chip. Proposal-card treatment
  reads as "the engine wants to change your plan" which is scary; a chip
  reads as "here's what the engine sees" which is honest.

## Not doing

- Long-term HERITAGE tracking across multiple arcs (would require a
  per-user longitudinal store).
- Retroactive classification for users who've already done a block —
  they only have one baseline in the historical record.
- Adding a mid-block deload (that's a separate design decision).
