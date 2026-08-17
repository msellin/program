# Concurrent Strength Maintenance — concurrent-training review (2026-08-17)

## 1. Verdict

**CONDITIONAL.** The core philosophy — "accept Schumann 2022 max/hypertrophy null; structure around SMD −0.28 explosive-strength cost" — is accurately anchored. Effect sizes (Schumann SMDs, Eddens +6.91%, Fyfe 2016 ~0.9%, Morton 1.62 g/kg, Brandt 2025 HYROX) all verified correct to source. Three fixes needed:

1. **`berryman_2018` cites the wrong paper.** IJSPP 13(1):57-64 is Berryman's strength-training-for-runners meta-analysis, not a cycling-compatibility paper. The modality-preference claim stands on Wilson 2012 + Doma 2019; drop Berryman here or find the correct source.
2. **`petre_2018` title is wrong in citations.json.** Actual title: "The Effect of Two Different Concurrent Training Programs on Strength and Power Gains in Highly-Trained Individuals" (Petré, Löfving, Psilander 2018). Finding attributed is correct; only title metadata needs fixing.
3. **Robineau 2016 language drifts.** The paper shows a 3-point dose-response (0h/6h/24h), not a validated 6h bright-line threshold. The program's ≥6h rule is a defensible engineering read; should be flagged as such.

None break the philosophy. All are copy-level fixes. No block or phase restructuring required.

## 2. Program scope reviewed

An 8-week concurrent block for a strength-trained user adding aerobic volume without losing squat / bench / deadlift training-maxes. Weekly template: 2 strength sessions (Mon heavy, Wed moderate) + 3–4 aerobic sessions (2× Z2 bike, 1× Z2 row, 1× Norwegian 4×4 row/ski from Phase 2). Retest week 7–8 confirms strength held (5RM) and submax HR dropped at fixed pace. RPE ≤7 ceiling on all strength; no PR chasing; 6h min separation on any same-day pairing; lift-first if unavoidable. Three tiers (Foundation / Progression / Push) gate on current cardio-hours-per-week.

## 3. Citation-by-citation audit

| Citation | Paper's actual claim | Program's claim | Assessment |
|---|---|---|---|
| `schumann_2022` | 43-study meta: max strength SMD −0.06 (p=0.446, n.s.), hypertrophy SMD −0.01 (p=0.919, n.s.), **explosive strength SMD −0.28 (p=0.007)** | Cited verbatim, drives `cost_bounded` principle and `rpe_ceiling` | **Match.** This is the load-bearing citation for the entire program philosophy and it is correctly used. Schumann's own commentary that same-session concurrent drives most of the explosive-strength cost is what motivates the 6h rule — accurate synthesis. |
| `wilson_2012` | Meta n=21 studies, 422 ES: concurrent reduces strength ES ~18%, hypertrophy ~31%, power ~40%; running > cycling for interference | Cited for interference numbers + modality bias | **Match.** Numbers are stated correctly. The running > cycling claim is a real Wilson finding (confirmed by external citing snippets). |
| `robineau_2016` | Rugby n=21, 4 groups (C-0h, C-6h, C-24h, S-only), 7 weeks: C-0h significantly attenuated bench + half-squat gains vs 6h/24h; C-24h had best VO2max response | Program treats "≥6h" as a validated threshold rule for "interference-window flag" | **Soft drift.** Robineau shows a **continuous dose-response**, not that 6h is a proven bright-line minimum. The program's 6h rule is a defensible interpretation (C-6h preserved strength) but is really a coaching-consensus threshold read off a 3-point dose curve. Currently `principles.six_hour_separation` presents it as if the paper set the threshold. Flag as engineering. |
| `eddens_2018` | Meta: resistance-before-endurance produced **+6.91% greater lower-body dynamic strength gain (95% CI 1.96, 11.87; p=0.006)** vs endurance-first | Cited verbatim in `lift_first_if_same_day` and `concurrent_strength_prescription` | **Match.** Confirmed at PMC5752732. Exact number, exact p-value, exact framing. |
| `fyfe_2016` | 8-wk RCT: RT-only 38.5% leg-press gain; HIT+RT 28.7%; MICT+RT 27.5%. Between-group HIT vs MICT difference **0.9 ± 8.1% (trivial)**. Authors: "volume, not intensity, mediates interference." | Cited verbatim in `endurance_volume_over_intensity` | **Match.** Numbers and interpretation confirmed at frontiersin.org. |
| `petre_2018` | Highly-trained rugby/hockey players: RT+CT 11.5% and RT+HIIT 14.4% squat gain (both p<0.01, no between-group difference). Both HIIT and continuous produced comparable squat gains. | Program cites for "highly trained: HIIT vs continuous produced same squat gains" | **Match on finding; broken on title.** Citations.json title "Development of maximal dynamic strength... untrained/moderately trained/trained" belongs to a **different Petré review**. Actual paper title is "The Effect of Two Different Concurrent Training Programs on Strength and Power Gains in Highly-Trained Individuals." Fix at citations.json level. |
| `morton_2018` | BJSM meta-regression: protein hypertrophy response plateaus at **1.62 g/kg/day (95% CI 1.03–2.20)** | `protein_floor` principle uses 1.6 exactly | **Match.** |
| `jager_2017` | ISSN position stand: 1.4–2.0 g/kg/day for exercising individuals | Cited as position stand supporting the floor | **Match.** |
| `berryman_2018` | **Cited title in citations.json does not match the paper at IJSPP 13(1):57-64.** The real paper at that citation slot is Berryman et al., "Strength Training for Middle- and Long-Distance Performance: A Meta-Analysis" (not about cycling bidirectional compatibility) | Program cites Berryman for "cycling as cleanest bidirectional compatibility with strength" (in `principles.modality_bias` and `session_rationale.why_row_not_run`) | **Broken.** The claim is defensible on Wilson 2012 + Doma 2019 alone. But the specific Berryman citation as-listed is not the paper that supports the claim. Remove Berryman from this program's reference list or find the correct source. |
| `doma_2019` | Sports Med review: bidirectional damage — resistance training impairs subsequent endurance (and vice versa), running-induced damage impairs squat/deadlift force 24–48 h | Cited exactly for "run-then-lift" damage window | **Match.** |
| `atherton_2005` / `coffey_hawley_2007` / `fyfe_bishop_stepto_2014` | AMPK-PKB switch / signalling review / interference mechanism review | Molecular anchors | **Match.** |
| `baar_2014` | AMPK ~3h post-endurance; mTORC1 sensitised 18-24h post-lifting | `phase_1_intro.rationale` — verbatim | **Match.** |
| `murach_bagley_2016` | Hypertrophy not consistently reduced in ecologically valid protocols; 2×/wk RT sufficient for trained maintenance | `why_lift_twice_weekly` | **Match.** |
| `aragon_schoenfeld_2013` | Anabolic window is 4–6 h, not 30 min | Supports 6h separation being nutritionally acceptable | **Match.** |
| `bartlett_2015` / `impey_2018` | Train-low + fuel-for-work frameworks | Cited but no per-session CHO prescription in blocks | **Match** (light use — could be dropped without loss). |
| `bouchard_1999_heritage` / `bouchard_2011` / `ross_2015` | HERITAGE 47% heritability + 21-SNP 49% variance + dose-fixes-non-response | Cited in `push` tier for non-response distribution | **Match** (light use; softer than engine-builder's use). |
| `brandt_2025` | HYROX physiological profiling: **VO2max ρ=−0.71 (p=0.01) with completion time** (strongest predictor); handgrip strength and muscle-mass % did NOT correlate with performance | Cited for HYROX positioning | **Match.** The "grip/muscle mass NOT reliable predictors" claim is exactly what Brandt 2025 states. Note: citations.json title "First physiological profiling of HYROX athletes" is a paraphrase — actual title is "Acute physiological responses and performance determinants in Hyrox©..." — but the finding attributed is correct. Minor metadata fix. |
| `helgerud_2007` | 4×4 at 90-95% HRmax × 3/wk × 8 wk → +7.2% VO2max in moderately trained males | Cited for `block_4x4_row` and `why_norwegian_4x4` (prescribed at 1×/wk, not 3×) | **Match with honest engineering flag.** Program explicitly acknowledges it prescribes 1× vs Helgerud's 3× in `engineering_choices_flagged` — this is the right disclosure pattern. |
| `wisloff_2007` | HF patients 12 wk 4×4: VO2peak +46%, LV EF +35% | Reference list only | **Match**; not extrapolated to healthy user (unlike engine-builder). |
| `seiler_2010` | 80/20 polarised in elite endurance | `why_z2_dominates` (3-4 Z2 : 1 hard) | **Match.** |
| `joyner_coyle_2008` | Threshold > VO2max as trainable marker | `phase_3_test.rationale` | **Match.** Submax HR at fixed pace is a valid threshold proxy. |
| `san_millan_brooks_2018` | Z2 = lactate <2 mmol/L | Z2 zone definition | **Match** (light). |
| `butcher_2015` / `meyer_morrison_zuniga_2017` | CrossFit-specific outcomes | Referenced but tangential to a non-CrossFit programme | **Match on paper; tangential — consider dropping.** |
| `feito_2018` | HIFT 16 wk: strength AND VO2max improve concurrently | Existence proof | **Match.** |
| `andersen_henriksson_1977` / `coyle_1984` | Cap density +20% / detraining timeline | Reference list; light use | **Match**; `andersen_henriksson_1977` unused — could drop. |

## 4. Phase / block structure check

The three-phase structure (Weeks 1-2 intro, Weeks 3-6 add 4×4, Weeks 7-8 retest) is coherent with the block-periodisation logic that (a) Baar 2014's molecular-window argument favours settling the aerobic baseline before layering intensity, and (b) Wilson 2012's meta-window is 6-24 weeks so 8 weeks sits at the short but valid end. The choice to add Norwegian 4×4 at 1×/wk (not the Helgerud 3×/wk) is explicitly flagged as engineering-biased-to-strength-preservation — correct disclosure.

Session order (lift Mon+Wed, cardio Sun/Tue/Thu/Fri, never lift+intervals same day) directly implements Eddens 2018 + Robineau 2016. Solid.

**One minor concern:** `block_deload` is listed in the `phase_1_intro` block array but the phase is only 2 weeks. The deload description says "Week 4" (which is in Phase 2, not Phase 1). This is a data-consistency issue — should the deload block live in Phase 2, or should the "Week 4" note be adjusted? Cosmetic, not evidence.

## 5. Retest metric check

- **`back_squat_5rm_kg`** — appropriate. A 5RM hold vs pre-block is exactly what "strength maintenance" claims to deliver, and it is directly measurable. Passes.
- **`submax_hr_pace5_bpm`** — Joyner & Coyle 2008 supports threshold-shift-at-fixed-workload as a valid endurance-adaptation proxy. Also passes. The choice of a 5-minute steady-state row over a proper LT test is an engineering simplification, appropriately implicit.

Retest cadence (week 8 for strength, 4-week trend for HR) is reasonable for a 2-month block. No fabricated predictive claims.

## 6. Engineering choices

The `engineering_choices_flagged` list is honest and correctly labels:
- 1× 4×4/wk vs Helgerud's 3× → engineering (biased to strength preservation)
- 8-week duration → engineering (matches concurrent-RCT window)
- RPE 7 not 8 ceiling → coaching_consensus (correctly labelled, no RCT specifies exact ceiling)
- Block pull vs conventional deadlift → engineering (founder clinical context)

**One additional engineering claim that should be flagged but isn't:** the "≥6h separation" rule is presented as a paper-derived threshold in `principles.six_hour_separation`. As discussed above, Robineau 2016 shows a dose-response with 3 sampled points, not a validated bright-line minimum. Move this to `engineering_choices_flagged` with rationale "6h derived from Robineau 2016 C-6h group preserving strength; treated as a practical minimum, not a proven threshold."

The `principles.endurance_volume_over_intensity` correctly cites Fyfe 2016. Good.

## 7. Fixes required before REVIEWED status

1. **Remove or replace `berryman_2018` in this program's reference list.** The paper as titled in citations.json is not the source that supports "cycling as cleanest bidirectional compatibility." The claim itself is supportable via Wilson 2012 (modality-interference gradient) + Doma 2019 (bidirectional damage) — those two carry it. Berryman as currently cited is wrong.
2. **Correct the `petre_2018` title in citations.json.** Actual title is "The Effect of Two Different Concurrent Training Programs on Strength and Power Gains in Highly-Trained Individuals" (Petré, Löfving, Psilander 2018, JSSM 17(2):167-173). The finding attributed (HIIT vs continuous produce same squat gains in highly-trained) is correct.
3. **Correct the `brandt_2025` title in citations.json.** Actual title is "Acute physiological responses and performance determinants in Hyrox© – a new running-focused high intensity functional fitness trend" (Brandt, Ebel, Lebahn, Schmidt 2025, Front Physiol; DOI 10.3389/fphys.2025.1519240). Finding attributed is correct.
4. **Reclassify the 6h separation rule.** Currently presented as a Robineau-derived threshold in `principles.six_hour_separation`. Should be added to `engineering_choices_flagged` with a rationale flag — the paper shows a dose-response, not a validated 6h minimum. The rule can stay; the honesty layer should acknowledge it's a practical engineering read of a 3-point curve.
5. **Cosmetic: fix `phase_1_intro.blocks` deload placement.** Either move `block_deload` to `phase_2_intervals` or update the block note to reflect its actual scheduling. Currently the description says "Week 4" but the block is listed under a Weeks 1-2 phase.

Optional (not blocking):
- Consider removing `butcher_2015`, `meyer_morrison_zuniga_2017`, `andersen_henriksson_1977` — cited but not operationally used in this program's evidence_base claims.
- Consider removing `bartlett_2015` / `impey_2018` if no per-session CHO prescription is going to be added — currently listed but not operationalised.

## 8. What I did NOT check

- Robineau 2016, Wilson 2012, and Doma 2019 verified via abstract + PMC excerpts + independent citing snippets, not full-PDF read. Schumann, Eddens, Fyfe 2016, Brandt 2025, and Petré 2018 findings confirmed directly.
- I did not check whether `adapt.ts` / `suggest.ts` code actually implements the RPE ≤7 ceiling, 6h flag, or amber-week detection — that is a code review, not a citation review.
- Safety gates (hypertension, tendon flare) are clinical common sense; not part of the concurrent whitepaper.
- Metadata drift (page ranges, DOIs) was checked spot-wise, not exhaustively.
- `principles.rpe_ceiling` was not checked against RPE-vs-load literature (Zourdos et al.) — program correctly labels it coaching_consensus.
