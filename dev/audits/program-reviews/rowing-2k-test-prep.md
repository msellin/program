# Rowing 2K Test Prep — aerobic-physiology review (2026-08-17)

## 1. Verdict

**CONDITIONAL.** The program's architecture (polarised base + threshold build + taper) is defensible and its citation of Seiler 2010 / Joyner & Coyle 2008 / Mujika & Padilla 2000 is largely accurate. Three problems block a clean PASS: the taper claim is missing its strongest anchor (Bosquet 2007 meta), Astorino 2013 is applied to rowing when its cohort was cyclists (the program correctly flags this, but the claim in `principles` reads as if it's rowing evidence), and Proteau 1992 is cited under a different title than what appears in the canonical citations.json library. There are also several rowing-specific citations flagged `verification_status: verified` whose URLs are Google Scholar / PubMed **search queries**, not direct paper links — this is a soft failure of the verification bar.

## 2. Program scope reviewed

A 6-week race-prep block for the Concept2 2K test. Assumes an aerobic base already exists (points user to Engine Builder for that). Three tiers by starting 2K time (Foundation ≥9:00, Progression 8-9:00, Push <8:00). Weekly structure: 2× Z2 row + 1× threshold row (4×8 min at 5-10 s/500m over 2K pace) + 1× race-pace row (6×500m at 2K pace) + 1× technique + 1× easy recovery. Phase 1 (weeks 1-2) is base + technique + open 2K baseline; phase 2 (weeks 3-4) is threshold-dominant; phase 3 (weeks 5-6) is taper + test. Tests are the 2K itself.

Target outcomes: −15 to −30 s (Foundation), −8 to −15 s (Progression), −3 to −8 s (Push), 2K time.

## 3. Citation-by-citation audit

| Citation | Paper's actual claim | Program's claim | Assessment |
|---|---|---|---|
| `helgerud_2007` | 4×4 min at 90-95% HRmax produced VO2max +7.2% and SV +10% in moderately trained men | Cited in reference list as "the 4×4 protocol; VO2max response reference" | **Match** — but note the program does NOT actually prescribe a 4×4 anywhere in the 6-week block. Citing Helgerud in the reference list without using the intervention is odd — it's listed as a reference the reader can validate the base logic against. Acceptable if kept, but the block itself doesn't lean on this study. |
| `seiler_2010` | Polarised 80/20 distribution outperforms threshold-dominant in trained endurance athletes | "Race prep still respects the distribution — the 20% just concentrates in threshold + race pace rather than VO2max intervals" | **Drift.** Seiler 2010 describes polarised as ~80% low-intensity / ~20% at VO2max intensity — the 20% is specifically NOT threshold-dominant work. The program's race-prep adaptation ("concentrate the 20% in threshold + race-pace") is a coaching-consensus taper-focus interpretation, not Seiler's model. The program partially acknowledges this ("polarised race prep") but still cites Seiler as the anchor. Should be flagged as an engineering interpretation. |
| `joyner_coyle_2008` | Endurance performance = VO2max + LT + economy; VO2max plateaus while LT and economy keep improving | "Post-VO2max ceiling, threshold IS the primary metric" and "threshold rises predictably at trained-athlete level" | **Match** for the direction (LT is trainable after VO2max plateau). "Predictably rises" is somewhat over-tight — Joyner & Coyle argue LT continues to be *responsive*, not that it rises predictably in any given 4-week window. Soft drift. |
| `san_millan_brooks_2018` | Zone 2 defined via blood lactate < 2 mmol/L; identifies fat-ox intensity | Cited in reference list as "Zone 2 anchor" | **Match** — but the program's Z2 blocks describe Z2 as "HR ~70-78% max" and "nose breathing where possible." Nose-breathing is folk-anchor, not San-Millán. HR range 70-78% max is close to Fatmax but not what San-Millán specifically anchors — he anchors lactate. Acceptable proxy; call out that lactate-clamp is the paper's method, HR is the field proxy. |
| `mujika_padilla_2000_a` and `_b` | Part I: short-term detraining timecourse. Part II: long-term detraining; **intensity preserved > volume for maintenance**. | "Reducing volume 40-60% while holding intensity produces the classic taper effect — ~3% performance uplift on race day" | **Drift.** Mujika & Padilla's 2000 detraining review supports "intensity preserved, volume can drop" for MAINTENANCE dose. The specific "3% performance uplift from taper" is a claim more properly attributed to Bosquet et al. 2007 (Med Sci Sports Exerc 39(8):1358-65, "Effects of tapering on performance: a meta-analysis"), which is the meta that quantified the ~3% average uplift across taper studies. Program should cite Bosquet 2007 for the "3%" number, and keep Mujika & Padilla for the maintenance-dose rationale. |
| `wilson_2012` | Concurrent training interference meta | "Rowing near-zero interference with strength" | **Broken.** Wilson 2012 shows RUNNING interferes with strength gains more than cycling; rowing is not specifically studied in the meta. The paper does NOT license a "near-zero interference for rowing" claim. Extrapolation from cycling data is reasonable coaching consensus but is not what Wilson 2012 concludes. Should be flagged engineering. |
| `eddens_2018` | RE-first > EE-first for lower-body strength preservation | Same-day sequencing rule | **Match** |
| `coyle_1984` | VO2max −7% at 12 days, −16% at 12 weeks detraining | "Detraining timeline informs taper depth" | **Match**, but the connection between Coyle's steep detraining curve and a 2-week taper design is loose. Coyle's numbers are about **stopping** training entirely; taper is a controlled reduction. The paper informs the "don't take a full week off before the test" instinct but isn't a direct anchor. Soft. |
| `astorino_2013` | HIIT in college-aged male CYCLISTS: VO2max, threshold, force outcomes | "Threshold pace shift 3-6% in 4-8 wk in trained rowers" | **Drift.** Astorino 2013 was cyclists, not rowers. Program has honestly flagged this in `engineering_choices_flagged` — "The 3-6% threshold shift is documented in cycling/running populations. Applied to rowing here as engineering inference." Good flag, but the `principles.threshold_dominant_middle` rule reads as if it's rowing evidence ("Threshold shifts up by 3-6% in trained rowers over 4 weeks (Astorino 2013)."). The `principles` copy should match the flagged caveat. |
| `billat_2001` | MLSS concept | "MLSS as threshold intensity target" | **Match** |
| `buchheit_laursen_2013_a/b` | HIIT programming variables | Interval-programming rationale | **Match** |
| `midgley_2007` | Optimal training intensity meta | Intensity distribution reference | **Match** |
| `laursen_jenkins_2002` | HIT rationale in trained endurance | Reference | **Match** |
| `billat_2000` | Aerobic interval prescription | Interval prescription | **Match** |
| `faude_2009` | Lactate threshold concept review — LT1 vs LT2 vs MLSS | "Threshold definitions — informs retest_metric.source_ref" | **Match** |
| `bishop_2008` | Repeated-sprint ability recommendations | "Race-pace repeat-set programming" | **Drift.** Bishop 2008 is about repeated-sprint ability (short all-out sprints, e.g. 6×30 s), not 6×500m at 2K pace over ~1:30-2:00 each. Different energy system, different adaptation target. The program's race-pace block is threshold-adjacent match-quality work, not RSA. Should be dropped as a citation for this block or moved to justify a different session. |
| `wisloff_2007` | 4×4 in HF patients, VO2peak +46%, LV EF +35% | "Stroke volume response reference" | **Match** — but again, the program doesn't actually prescribe 4×4. Reference-list appropriate. |
| `proteau_1992` | Actual title in citations.json: "Learning is specific to the sensory conditions of practice" (Quarterly Journal of Experimental Psychology 44A:557-575) | Program title given: "A sensorimotor basis for motor learning" (QJEP 44A:557-575) | **Broken title.** Same author, same journal, same page range, but the title in the program does not match the title in the canonical citations.json. One of the two is wrong. This is a citation-hygiene failure — the canonical library and the program disagree on what the paper is called. |
| `henry_1968` | Specificity of practice | Foundation for race-pace work | **Match** (foundational, not spot-checkable) |
| `bouchard_1999_heritage` | HERITAGE: 47% heritability of training response; ~10× range | "Push tier — HERITAGE-style non-response distribution begins to dominate — genetic ceiling in view" | **Match** for direction. "Genetic ceiling in view" for a −3 to −8 s 2K improvement on a sub-8:00 base is defensible; HERITAGE participants started closer to sedentary so the analogy is loose. Soft. |
| `ross_2015` | Non-response at low intensity converts to response at higher intensity | "Non-response drops at higher intensity — race-prep intensity distribution rationale" | **Match**, though the program's actual intensity distribution (80% Z2 + threshold + race pace, 1×/wk each) is not the paper's arm. Reference-appropriate. |
| `hagerman_1994` | Rowing physiology chapter (Blackwell) — VO2max and lactate profile of elite rowers | "Rowing-specific physiology overview" | **Match** (but `url` field is a Google Scholar search query, not the chapter — see §5) |
| `steinacker_1993` | Rowing training physiology (IJSM supplement) — training volume/intensity structure of national-team rowers | "Rowing-specific interval + volume prescription" | **Match**, but the URL is a PubMed **search query**, not a direct link. `verification_status: verified` is not credible without a real link. |
| `mikulic_2011` | 6-year case study of a world-champion crew — physiological trajectory | "Elite rower development trajectory context" | **Match**, same URL problem. |
| `das_2019` | Journal not indexed in the top rowing-physiology venues (J Phys Ed Sports Manage) — low quality relative to Hagerman / Steinacker / Mikulic | "Rowing metabolic profile — informs Z2 dose" | **Weak citation.** The journal is not peer-reviewed at the standard the whitepaper implies. Consider dropping in favour of Secher 1993 or Steinacker's later work. |
| `kilding_2012` | MLSS validity in trained runners | "MLSS validity for threshold prescription" | **Match** for runners; extrapolation to rowing is coaching consensus. Flag. |

**Missing citation the prompt flagged:** `bosquet_2007` (Effects of tapering on performance: a meta-analysis, Med Sci Sports Exerc 39(8):1358-65). This is the canonical anchor for the "3% performance uplift from taper" number. The program uses the 3% claim without citing Bosquet. Adding this citation is the single most important fix.

**Also missing (prompt-flagged):** the Rønnestad 5×3 / 8×2 short-interval work. The program doesn't use these protocols, so absence is fine — but Rønnestad is the most-cited author for interval prescription in trained cyclists/rowers over the last decade, and its absence from a rowing race-prep program's reference list is notable. Not required for PASS.

## 4. Phase / block structure check

- **Weeks 1-2 base check + technique** — coaching consensus, not RCT-anchored. Reasonable given the "assume Engine Builder base" positioning.
- **Weeks 3-4 threshold + race pace** — this is the block's evidence-lean phase. Astorino 2013 is the only threshold-shift anchor, and it's cyclists not rowers. Program flags this correctly in `engineering_choices_flagged` but the principle copy doesn't match the caveat. See §3.
- **Weeks 5-6 taper + test** — Mujika & Padilla 2000 supports the intensity-preserved / volume-reduced pattern. Bosquet 2007 is the missing quantitative anchor (see §3, §7).
- **Race-pace 6×500m** — flagged as coaching consensus. Honest.
- **500m intervals rest ratio (3-4 min)** — no interval-specific evidence for the exact rest, flagged as engineering. Honest.

The 4-day/wk minimum with 5 sessions in the reference layout is appropriately dosed for a 6-week race-prep block. Not building base fitness; using existing base.

## 5. Retest metric check

Two `retest_metrics`:

1. **`row_2k_time_seconds`** — the target metric itself, not a proxy. Perfect measurement validity. The 6-week timeline for −15 to −30 s (Foundation), −8 to −15 s (Progression), −3 to −8 s (Push) is defensible if a base already exists — Foundation's Bosquet-style ~3% taper effect on a 9:00+ starting point is 15+ seconds. Progression tier's −8 to −15 s (~1.5-3%) is within range. Push tier's −3 to −8 s (~0.6-1.5%) is at the taper-effect floor — honest.
2. **`threshold_pace_500m_seconds`** — a session-derived metric (avg pace in threshold sessions). Reasonable proxy for LT2 development but is influenced by fatigue and pacing decisions on the day. Aggregation `trend_slope` over 21 days is smart. **Match.**

The `signal_completeness` block honestly flags what's missing (per-interval HR, stroke rate). Good.

## 6. Engineering choices

Honestly flagged:
- 6-week duration ✓
- 1× threshold + 1× race pace per week ✓
- 2-week taper (Mujika supports 1-3 weeks) ✓
- 500m intervals at 2K pace ✓
- Astorino 2013 threshold-shift range applied to rowing ✓

**Hidden engineering** the program presents as evidence:
- The "polarised" characterisation of the 80/20 distribution when the 20% is threshold+race pace, not VO2max intervals (see Seiler 2010 in §3).
- Wilson 2012's "rowing near-zero interference with strength" claim — the meta didn't study rowing directly.
- Bishop 2008's RSA framework applied to 6×500m at 2K pace — different energy system.
- Kilding 2012's MLSS-in-runners applied to rowers.

## 7. Fixes required before REVIEWED

1. **Add `bosquet_2007` to citations.json and the program's reference list** as the anchor for the "~3% performance uplift on race day" claim. Bosquet M, Montpetit J, Arvisais D, Mujika I. "Effects of tapering on performance: a meta-analysis." Med Sci Sports Exerc 39(8):1358-1365. This is a canonical taper citation and its absence is the single biggest gap.
2. **Fix the Proteau 1992 title mismatch.** Program has "A sensorimotor basis for motor learning"; citations.json has "Learning is specific to the sensory conditions of practice." Determine the correct title (the citations.json version is closer to the paper's actual QJEP title) and align.
3. **Fix the Astorino 2013 principle-vs-flag inconsistency.** `principles.threshold_dominant_middle` reads "Threshold shifts up by 3-6% in trained rowers over 4 weeks (Astorino 2013)." The paper is on cyclists. Match the flagged caveat: either "in trained cyclists (extrapolated to rowing)" or drop the specific number and cite the extrapolation.
4. **Drop or relocate `bishop_2008`.** RSA framework is not what 6×500m at 2K pace trains. If the race-pace block wants a citation, Buchheit & Laursen 2013 Part I/II is a better fit (already in the reference list).
5. **Reframe Seiler 2010 for race-prep.** The current program says the 20% concentrates in threshold + race pace — this is a race-prep adaptation of the polarised model, not Seiler's original prescription. Say so.
6. **Reframe Wilson 2012 rowing claim.** "Rowing near-zero interference with strength" is not in the meta. Say it's extrapolated from the cycling data (which showed less interference than running) plus rowing's non-eccentric loading profile.
7. **Fix the "verified" URLs for rowing-specific citations.** Hagerman 1994, Steinacker 1993, Mikulic 2011, Das 2019 all have `verification_status: verified` with URLs that are Google Scholar / PubMed **search queries**. A search query is not verification. Either replace with direct paper URLs, or downgrade `verification_status` to `unverified`.
8. **Consider replacing `das_2019`.** Journal is low-tier for rowing physiology. Steinacker 1993 or a Secher chapter would carry more weight.
9. **Note the Rønnestad absence** as an engineering choice if the founder consciously excluded it, or add it. Rønnestad's short-interval work (30/15, 5×3 min, 8×2 min) is the dominant contemporary interval literature for trained cyclists/rowers — its absence from a rowing race-prep block is notable.
10. **HERITAGE non-responder gate at Push tier.** The Push tier's honest "−3 to −8 s" ceiling invokes Bouchard 1999 correctly. Consider whether the 6-week retest cadence + `at_week: 6` targets can catch a Hecksteden-2015-style non-responder — the whitepaper flags "≥2 baselines needed" and this block only has one (the base-check week 1-2 open 2K).

## 8. What was NOT checked

- Full-text spot-check of Astorino 2013 exact numbers (PubMed cookie wall during review). The 3-6% figure is what the paper is commonly cited for; verification wasn't independent.
- Bosquet 2007 exact effect size wasn't re-verified — the "~3% average performance improvement" number is what the meta is standardly cited for.
- Hagerman 1994 chapter (Blackwell Scientific "Endurance in Sport") — not accessible via URL; verification requires the book.
- Steinacker 1993 IJSM supplement — same PubMed issue.
- The adaptive-engine hooks in `evidence_base.adaptive_engine_hooks` were not simulated against a real user log.
- Whether the intake screener's exertional-syncope + chest-pain gates are consistent with the app's other program screeners (Engine Builder has an almost-identical block — cross-consistency wasn't reviewed).
- Race-pace intensity for a 2K target — I did not attempt to derive the specific w/500m pace targets from a physiological model; the coaching-consensus 500m-at-2K-pace + 3-4 min rest is standard rowing practice.

---

**Verdict: CONDITIONAL.** The program's core aerobic-physiology architecture (polarised distribution → threshold build → intensity-preserved taper) is sound and the citation load is above the typical shipping-program bar. But three specific fixes — add Bosquet 2007 for the taper anchor, fix the Proteau title, and resolve the Astorino-cyclists-vs-rowers wording — plus dropping Bishop 2008 (wrong energy system) and downgrading the search-query "verified" URLs are needed. With those addressed, this program clears the REVIEWED bar.
