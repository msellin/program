# Engine Builder — aerobic-physiology review (2026-08-17)

## 1. Verdict

**CONDITIONAL.** The evidence base is unusually good for a shipping program — 35 citations, most anchored to the correct primary sources with accurate effect sizes. Three specific drifts and one internal inconsistency need fixing before REVIEWED status. None of them destroy the program's core claims; the Z2-drives-mitochondrial-signal / 4×4-drives-stroke-volume architecture is exactly what the literature supports.

## 2. Program scope reviewed

Block 1 of a 3-block engine transformation arc, 8 weeks, 3-5 sessions/week. Aerobic base for a strength-trained user who is not currently endurance-trained. Z1/Z2 volume dominates; one hard weekly stimulus (Norwegian 4×4 or threshold cruise) is layered in from week 3-4. Three tiers (Foundation / Progression / Push) gate on cardio-hours-per-week and baseline Z1 tolerance. Retest at week 8 uses resting HR + submax HR at fixed pace + optional 500m row / 1 km run TT.

Target outcomes stated: RHR −5 to −10 bpm; submax HR −8 to −15 bpm at fixed pace; VO2max +5-8% (Progression), +3-6% (Foundation), +2-4% (Push).

## 3. Citation-by-citation audit

| Citation | Paper's actual claim | Program's claim | Assessment |
|---|---|---|---|
| `seiler_2010` | Elite endurance athletes converge on ~80% low-intensity / ~20% high-intensity distribution; polarised outperforms threshold-dominant in well-trained | "Backbone of the block — polarised distribution" | **Match** |
| `stoggl_sperlich_2014` | 9-week RCT n=48 trained endurance: polarised produced larger VO2peak (+11.7%) and TTE gains vs threshold, HIIT, or high-volume | Used to justify "only one hard session per week in Block 1" | **Drift.** Stöggl & Sperlich tested a fully polarised block (~7 hard sessions/wk in the HIIT arm, ~2/wk in polarised). One-hard-per-week in Block 1 is a defensible engineering choice for an aerobic-naive user; it is NOT what this paper studied. Should be flagged as engineering, not evidence. |
| `helgerud_2007` | n=40 moderately trained males, 8 wk, 3×/wk. Four arms: LSD, LT, 15/15 intervals, 4×4 intervals. Only interval groups improved VO2max (~5.5% and 7.2%) and SV (+10%). | Cited exactly for these numbers in `block_norwegian_4x4` and `outcome_evidence` | **Match.** Careful and accurate use. |
| `ronnestad_hansen_2020` | Title: "Short intervals induce **superior** training adaptations compared with long intervals in cyclists." Short intervals (e.g. 3×13× (30/15s)) produced larger VO2max and peak-power gains than long intervals (4×5 min) in trained cyclists. | "Long intervals produce **comparable** VO2max gains to short intervals in cyclists; superior for peak-power development is disputed." | **Drift, arguably broken.** The program softens (and effectively inverts) the paper's headline. Rønnestad 2020's finding is that short intervals were superior — not comparable. The program then uses this to justify 4×4 (short-ish) AND 3×8-10 threshold (long) in the same block. The block design is defensible on other grounds, but this citation is misrepresented. |
| `hickson_1980` | Classic concurrent-training interference: strength gains attenuated when high-volume endurance stacked on strength training | Cited for the maintenance-only recommendation | **Match** (cross-domain concurrent, whitepaper 02) |
| `wilson_loenneke_2012` | Meta of concurrent training: hypertrophy interference proportional to endurance frequency+duration; running interferes more than cycling | Cited for RPE cap and session-count | **Match** |
| `docherty_sporer_2000` | Interference model (competition for recovery / signalling substrate) | Same-day sequencing rule | **Match** |
| `little_2010` | n=7, 2-wk low-volume HIIT: CS, COXII/IV, PGC-1α, TFAM +25-30% | "Mitochondrial signal detectable within 2 weeks of HIIT" | **Match** |
| `perry_2010` | 7-wk HIIT training study; transient mRNA bursts precede protein increases | "mRNA-precedes-protein pattern" → justifies volume-first weeks 1-2 | **Match** |
| `konopka_2014` | 12 wk progressive cycling in older adults: PGC-1α +55-62%, CS +65-102%, β-HAD +397-435%, COXIV +80-126% | Effect sizes cited verbatim; "no age blunting of relative response" | **Match.** Effect sizes are correct. Minor caveat: 12 weeks not 8, and the population was older adults. The program does not explicitly claim 8-wk equivalence — but the effect-size table is presented alongside the 8-wk block claims, which risks reader inference. Flag as soft. |
| `bishop_2019` | CrossTalk piece: volume-vs-intensity for mitochondrial content, favouring volume | Cited for volume-first design in weeks 1-3 | **Match** |
| `andersen_henriksson_1977` | 8 wk × 4/wk × 40 min at 80% VO2max: VO2max +16%, capillary density +20% | Cited exactly | **Match** |
| `cocks_2013` | 6 wk SIT vs MICT in sedentary males: comparable c:f ratio + eNOS gains; endurance more reliable for cap density | Cited for endurance drives cap density per area | **Match** |
| `wisloff_2007` | 12 wk 4×4 in post-MI HF n=27: VO2peak +46%, LV EF +35% | Cited exactly | **Match**, but the population caveat is essential: this is HF patients starting from a low base. The +46% VO2peak is not what a healthy strength-trained user should expect from 4×4. Program does not explicitly extrapolate, but places the number next to healthy-user projections in `outcome_evidence`. Flag: soft. |
| `baggish_wood_2011` | Athlete's heart review: eccentric LVH with endurance, concentric with strength/isometric | Cited exactly | **Match** |
| `brooks_2018` | Lactate shuttle theory synthesis; lactate is fuel + signalling | Cited for `block_sustained_tempo` | **Match** |
| `pilegaard_2000` | 8 wk high-intensity training raises MCT1 in trained subjects | "MCT1 upregulation with endurance training" | **Match**, though note: Pilegaard's protocol was HIGH-intensity, not the sub-threshold "sustained tempo" the program pairs it with. The MCT1-tempo pairing is coaching consensus, not what Pilegaard studied. Should be flagged as engineering. |
| `san_millan_brooks_2018` | Metabolic flexibility via blood lactate; Zone 2 = highest fat-ox intensity, lactate < 2 mmol/L, preferential Type I recruitment | "Zone 2 lactate-clamp methodology anchors block_z1_steady" | **Match.** This is the most heavily leaned-on Z2 anchor and it is correctly used. |
| `achten_jeukendrup_2003` | Trained men Fatmax ~63% VO2max (range 45-75%) | Cited exactly | **Match** |
| `bouchard_1999_heritage` | HERITAGE Family Study: heritability of VO2max training response ~47%, ~10-fold range in individual gains | "Heritability 47%; ~10× range in individual gains" | **Match** |
| `ross_2015` | Non-response at low doses converts to response at higher doses (75% intensity or higher-amount arm) | "Non-response at 50% intensity drops to 0% at 75%" | **Drift.** Ross 2015 is not quite that clean — the paper showed non-response rate dropped substantially with higher-amount OR higher-intensity dosing, but "0% at 75%" is a hard number that isn't in the paper's summary as-written. Directionally correct; the specific "0%" claim overstates. |
| `tanaka_2001` | Meta of 351 studies: HRmax = 208 − 0.7 × age, SEE ~10 bpm | Cited in `hr_zone_methodology` | **Match** |
| `nes_2013_hunt` | HUNT: HRmax = 211 − 0.64 × age, SEE 10.8 bpm, no sex/BMI/fitness interaction | Cited as default in `hr_zone_methodology` | **Match** |
| `rogers_2021_dfa` | DFA-α1 = 0.75 corresponds to VT1 | Cited for chest-strap users | **Match** |
| `coyle_1984` | VO2max −7% at 12 days detraining, −16% at 12 weeks | Cited for detraining timecourse | **Match** |
| `mujika_padilla_2000` | Detraining Parts I+II; intensity > volume for maintenance | Cited for maintenance dose | **Match** |
| `fyfe_2014` | Concurrent training molecular bases review | Anchors `concurrent_strength_prescription` | **Match** |
| `fyfe_2016` | Volume, not intensity, drives interference in short-term concurrent | Cited exactly | **Match** |
| `schumann_2022` | Concurrent meta n=43: max strength SMD −0.06 (n.s.), hypertrophy SMD −0.01 (n.s.), explosive SMD −0.28 (sig) | Cited exactly | **Match** |
| `robineau_2016` | 6+ h separation preserves both adaptations; C-0h halves strength gains | Cited exactly | **Match** |
| `eddens_2018` | Resistance-first vs endurance-first meta: RE-first +6.91% lower-body strength gain vs EE-first (p=0.006) | Cited exactly | **Match** |
| `morton_2018` | Protein plateau ~1.62 g/kg/day for resistance training | Cited exactly | **Match** |
| `impey_2018` | Fuel-for-the-work-required framework | Cited exactly | **Match** |
| `brandt_2025_hyrox` | HYROX physiological profiling: VO2max is a strong predictor | "VO2max is the strongest predictor; grip strength and muscle mass are NOT reliable predictors" | **Soft drift.** The "grip / mass not reliable" phrasing is an over-simplification of what a first-profiling paper typically concludes. Not core to Engine Builder's aerobic architecture — used only for HYROX-goal positioning. Acceptable to keep with softer language. |
| `butcher_2015_crossfit` | CrossFit Total predicts Fran/Grace most strongly; VO2max contributes | Cited exactly | **Match** |

## 4. Phase / block structure check

- **Weeks 1-2 pure Z1** — matches Perry 2010 / Little 2010 / Bishop 2019 (mRNA precedes protein; volume-first). **Evidence-backed.**
- **Week 3 first tempo, week 4 first 4×4 (Progression tier)** — sequencing is coaching-consensus. No RCT specifies "sub-threshold before VO2max" ordering. Program does not claim this is RCT-anchored. **Engineering, honestly flagged.**
- **Norwegian 4×4 protocol** — Helgerud 2007 arms were 3×/wk for 8 wk. Program prescribes 1×/wk for weeks 4-7. This is a lower dose than Helgerud's, and the program says so in `dose_calibration_note`. Effect-size ranges are appropriately reduced. **Honest.**
- **Retest at week 8** — engineering choice matching block boundary, disclosed. **OK.**
- **Push tier introduces 4×4 at week 2** — this is aggressive for someone with only 1 week of baseline. Program justifies with Ross 2015's higher-intensity-lower-non-response logic. Defensible but stretches the reasoning; Ross's cohorts were not aerobic-untrained doing week-2 4×4s. Flag as engineering.

Overall phase structure is coherent and honest. The single largest evidence-backed choice — Z1 volume first, one hard stimulus, cardiac-remodelling-requires-intervals — is correctly grounded.

## 5. Retest metric check

Two metrics defined:

1. **Submax HR at pace-5 (row 2:00/500m)** — validated as an early aerobic-adaptation signal (Konopka 2014 documents submax HR reductions preceding VO2max improvements). Direction correct, sensitivity claim correct. **Match.**
2. **Resting HR** — most commonly cited early aerobic marker; parasympathetic tone + expanded SV. Only Foundation tier has an explicit target set. **Match**, but the missing Progression / Push targets in the `resting_hr_bpm.targets[]` array is an internal inconsistency — the physiological_targets section quotes −5 to −10 bpm for all tiers, but retest_metrics only defines Foundation.

The 500m row TT and 1 km run TT are described in intake `physical_tests` but not defined as `retest_metrics` entries. This is a schema gap: what the program describes verbally as retests are not machine-evaluable.

## 6. Engineering choices — honest or hidden?

Honestly flagged in `engineering_choices_flagged`:
- Session length granularity ✓
- Retest cadence ✓
- Number of intervals per session ✓
- 4×4 recovery ratio ✓
- Warm-up duration ✓
- HRmax formula caveat ✓

**Hidden engineering** the program presents as evidence:
- One-hard-session-per-week rationale invokes Stöggl & Sperlich 2014, which does not test that dose. Should move to `engineering_choices_flagged`.
- Sub-threshold tempo as the MCT1 stimulus invokes Pilegaard 2000, which tested high-intensity work. Coaching-consensus extrapolation.
- Push tier's week-2 4×4 invokes Ross 2015 more than the paper supports.

## 7. Fixes required before REVIEWED

1. **Rewrite Rønnestad & Hansen 2020 usage.** The paper's headline finding is that short intervals were **superior** to long intervals for VO2max and peak-power in trained cyclists. Program currently says the opposite ("comparable ... superior for peak-power development is disputed"). Either (a) reword to reflect the paper's actual finding, (b) cite a different paper for the "both interval lengths work" claim, or (c) drop the citation.
2. **Soften Ross 2015 "0% at 75%" number.** Paper shows non-response drops substantially at higher intensity — "substantially" not "to zero."
3. **Move to `engineering_choices_flagged`:** the "one hard session per week" rationale (Stöggl & Sperlich 2014 doesn't support the dose); sub-threshold tempo as MCT1 stimulus (Pilegaard 2000 tested high-intensity); Push-tier week-2 4×4 (Ross 2015 doesn't cover week-2 aggressive dosing).
4. **Complete `retest_metrics.resting_hr_bpm.targets[]`** — add Progression + Push tier targets so the schema matches the physiological_targets copy.
5. **Add `retest_metrics` entries for 500m row TT and 1 km run TT** (or explicitly state they are intake-only baselines and not machine-tracked retests).
6. **Population caveats on Wisløff 2007 and Konopka 2014.** The +46% VO2peak (Wisløff, HF patients) and +55-435% enzyme deltas (Konopka, older adults, 12 wk) should be labelled with the study population so healthy strength-trained users don't inherit the ceiling. A one-line qualifier in `outcome_evidence` is enough.
7. **Add a maintenance-dose retest cadence.** `mujika_padilla_2000` is cited for post-block maintenance but no explicit maintenance-dose retest is scheduled. Given the 2-week reversal timeline (Granata 2016, referenced in the whitepaper but not this program), a mid-block-2 aerobic check would catch detraining early.
8. **HERITAGE non-responder gate.** The program acknowledges Bouchard 1999's 10× variance in text but does not implement the Hecksteden 2015 "≥2 baselines needed" rule. Consider whether the Push-tier "if VO2max hasn't moved by week 6" trigger is compatible with a ≥2-baseline non-responder definition.

## 8. What was NOT checked

- Full-text of Rønnestad & Hansen 2020 — PubMed cookie wall blocked verification during this review. Verdict on that citation is based on the paper's title + abstract-level knowledge from the domain; a full-text spot-check by the founder is warranted before deleting/rewriting the citation.
- Wisløff 2007 exact effect-size verification (PubMed cookie wall). Effect sizes claimed in the program (+46% VO2peak, +35% LV EF) match well-known publication numbers.
- Rogers 2021 DFA-α1 = 0.75 validation study details — accepted at whitepaper level.
- Brandt 2025 HYROX paper full-text — this is a 2025 first-profiling paper and my knowledge of its specific claims is limited. The program treats it as a soft anchor for HYROX-goal positioning only; the aerobic architecture does not depend on it.
- The adaptive engine's response logic (day_adjustment, week-swap) was not exercised against realistic user data; that belongs in a separate engine audit, not a citation audit.
- Whether the app's UI actually renders the `outcome_by_tier` ranges honestly, or whether marketing copy elsewhere over-claims, was outside scope.

---

**Verdict: CONDITIONAL.** Fix the Rønnestad drift, the Ross 2015 "0%" overclaim, move the three hidden engineering choices to the flagged list, and complete the schema (retest targets for all tiers + row/run TT retests). Once those are done, this program clears the REVIEWED bar. The aerobic-physiology backbone is genuinely well-anchored to primary literature — a rare quality in shipping training programs.
