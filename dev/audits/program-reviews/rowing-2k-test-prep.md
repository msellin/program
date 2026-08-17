# Rowing 2K Test Prep — aerobic-physiology review (2026-08-17)

## 1. Verdict

**CONDITIONAL.** Architecture (polarised base → threshold build → intensity-preserved taper) is defensible; Seiler 2010 / Joyner & Coyle 2008 / Mujika & Padilla 2000 are largely accurate. Blockers: the taper claim is missing its strongest anchor (Bosquet 2007 meta), Astorino 2013 is applied to rowing while the cohort was cyclists, and Proteau 1992 is cited under a different title than what's in the canonical citations.json library. Four rowing-specific citations flagged `verification_status: verified` have URLs that are search-engine queries, not paper links — a soft verification-bar failure.

## 2. Program scope reviewed

A 6-week race-prep block for the Concept2 2K. Assumes an aerobic base exists (points to Engine Builder). Three tiers by starting 2K time: Foundation ≥9:00, Progression 8-9:00, Push <8:00. Weekly template: 2× Z2 row + 1× threshold (4×8 min at 5-10 s/500m over 2K pace) + 1× race-pace (6×500m at 2K pace) + 1× technique + 1× easy recovery. Phase 1 (wk 1-2) base + technique + open 2K; phase 2 (wk 3-4) threshold-dominant; phase 3 (wk 5-6) taper + test. Target: −15 to −30 s (Foundation), −8 to −15 s (Progression), −3 to −8 s (Push).

## 3. Citation-by-citation audit

**Matches (accurate as cited):** `helgerud_2007` (reference-list only, no 4×4 prescription in block); `wisloff_2007` (reference-list only); `eddens_2018`, `coyle_1984`, `billat_2001`, `buchheit_laursen_2013_a/b`, `midgley_2007`, `laursen_jenkins_2002`, `billat_2000`, `faude_2009`, `henry_1968`, `bouchard_1999_heritage`, `ross_2015`.

**Drifts / issues:**

| Citation | Paper's claim | Program's claim | Issue |
|---|---|---|---|
| `seiler_2010` | Polarised = ~80% low / ~20% at VO2max intensity | "The 20% just concentrates in threshold + race pace rather than VO2max intervals" | **Drift.** This is a race-prep adaptation of the polarised model, not Seiler's original prescription. Program partially acknowledges ("polarised race prep") but still cites Seiler as the anchor. Flag as engineering. |
| `joyner_coyle_2008` | Endurance = VO2max + LT + economy; LT and economy keep improving after VO2max plateau | "Threshold rises predictably at trained-athlete level with focused work" | **Soft drift.** Direction correct; "predictably" tightens the claim more than Joyner & Coyle argue. |
| `mujika_padilla_2000_a` / `_b` | Detraining review; supports intensity-preserved / volume-reduced for maintenance | "Reducing volume 40-60% while holding intensity produces ~3% performance uplift on race day" | **Drift.** The "~3% uplift from taper" number belongs to Bosquet et al. 2007 (MSSE 39(8):1358-65), the canonical taper meta. Mujika & Padilla justifies the *pattern*, not the *3% quantum*. Add Bosquet 2007. |
| `wilson_2012` | Concurrent interference meta — running interferes more than cycling; rowing not specifically studied | "Rowing near-zero interference with strength" | **Broken.** The paper does not license a rowing-specific claim. Extrapolation from cycling is reasonable coaching consensus; call it that. |
| `astorino_2013` | HIIT in college-aged male CYCLISTS: VO2max, LT, force outcomes | `principles.threshold_dominant_middle`: "Threshold shifts up by 3-6% in trained rowers over 4 weeks (Astorino 2013)" | **Drift.** Paper was cyclists, not rowers. Program correctly flags this in `engineering_choices_flagged` ("applied to rowing here as engineering inference") — but the `principles` copy reads as if it's rowing evidence. Match the principle to the flag. |
| `bishop_2008` | Repeated-sprint ability (short all-out sprints, e.g. 6×30 s) | Cited for "race-pace repeat-set programming" (6×500m at 2K pace) | **Broken.** 6×500m at 2K pace over ~1:30-2:00 each is not the RSA energy system. Different adaptation target. Drop or replace with Buchheit & Laursen 2013 (already in reference list). |
| `san_millan_brooks_2018` | Zone 2 defined via blood lactate < 2 mmol/L | Z2 blocks defined as "HR ~70-78% max" and "nose breathing where possible" | **Match** direction; the field proxy is looser than San-Millán's lactate-clamp method. Acceptable if the HR range is documented as a proxy for the true anchor. |
| `proteau_1992` | Actual title in canonical citations.json: "Learning is specific to the sensory conditions of practice" (QJEP 44A:557-575) | Program title given: "A sensorimotor basis for motor learning" (QJEP 44A:557-575) | **Broken title.** Same journal + page range but different title. The citations.json version is closer to the paper's actual QJEP title. Fix. |
| `das_2019` | Journal (J Phys Ed Sports Manage) is not peer-reviewed at the standard implied | "Rowing metabolic profile — informs Z2 dose" | **Weak citation.** Consider dropping in favour of Steinacker's later work or a Secher chapter. |
| `hagerman_1994`, `steinacker_1993`, `mikulic_2011`, `das_2019` | All have `verification_status: verified` in the program | URLs are Google Scholar / PubMed **search queries**, not paper links | **Verification bar failure.** A search query is not verification. Either replace with direct paper URLs or downgrade `verification_status` to `unverified`. |
| `kilding_2012` | MLSS in trained runners | "MLSS validity for threshold prescription" (in rowing) | **Extrapolation.** Runners → rowers is coaching consensus. Flag. |

**Missing citation the prompt flagged:** `bosquet_2007` (Effects of tapering on performance: a meta-analysis, MSSE 39(8):1358-1365) — canonical anchor for the "~3% performance uplift" claim the program makes. Absent from citations.json and the program's reference list. Single most important fix.

**Also missing (prompt-flagged):** Rønnestad 5×3 / 8×2 short-interval work. The program doesn't use these protocols, so absence is defensible; but Rønnestad is the dominant contemporary interval literature for trained cyclists/rowers. Notable but not required for PASS.

## 4. Phase / block structure check

- **Weeks 1-2 base + technique + baseline 2K** — coaching consensus; not RCT-anchored. Reasonable given the "assume base exists" positioning.
- **Weeks 3-4 threshold + race pace** — Astorino 2013 is the only threshold-shift anchor and it's cyclists. Program flags this correctly in `engineering_choices_flagged` but the `principles` copy doesn't match the caveat. Fix.
- **Weeks 5-6 taper + test** — Mujika & Padilla 2000 supports the intensity-preserved / volume-reduced pattern. Bosquet 2007 is the missing quantitative anchor for the "3%" claim.
- **6×500m at 2K pace race-pace block** — flagged as coaching consensus (`engineering_choices_flagged`). Honest.
- **500m interval rest 3-4 min** — no interval-specific evidence for exact rest; flagged. Honest.

The 4-day/wk minimum with 5-session reference layout is appropriately dosed for a 6-week race-prep block.

## 5. Retest metric check

Two `retest_metrics`:

1. **`row_2k_time_seconds`** — the target itself, not a proxy. Perfect measurement validity. The tier tolerances are defensible:
   - Foundation −15 to −30 s (9:00+ starting point): about 3-6% — within Bosquet's taper effect + LT gain window.
   - Progression −8 to −15 s (~1.5-3%): realistic.
   - Push −3 to −8 s (~0.6-1.5%): at the taper-effect floor. Honest.
2. **`threshold_pace_500m_seconds`** — session-derived (avg pace in threshold sessions). Reasonable LT2 proxy, influenced by pacing/fatigue. Aggregation `trend_slope` over 21 days is sound.

The `signal_completeness` block honestly flags what's missing (per-interval HR, stroke rate). Good.

## 6. Engineering choices — honest or hidden?

Honestly flagged: 6-week duration, 1× threshold + 1× race pace per week, 2-week taper, 500m intervals at 2K pace, Astorino-to-rowing extrapolation.

**Hidden engineering** presented as evidence:
- "Polarised" characterisation of the 80/20 distribution when the 20% is threshold + race pace (see Seiler 2010 above).
- Wilson 2012's "rowing near-zero interference" (paper didn't study rowing).
- Bishop 2008's RSA framework applied to 6×500m at 2K pace (different energy system).
- Kilding 2012's MLSS-in-runners applied to rowers.

## 7. Fixes required before REVIEWED

1. **Add `bosquet_2007`** to citations.json + program reference list as the anchor for the "~3% performance uplift" claim. Bosquet M, Montpetit J, Arvisais D, Mujika I. MSSE 39(8):1358-1365. Single biggest gap.
2. **Fix the Proteau 1992 title mismatch** — align the program's citation with the citations.json canonical title.
3. **Fix the Astorino 2013 principle-vs-flag inconsistency** — `principles.threshold_dominant_middle` reads as if the 3-6% shift is rowing evidence; match the flagged caveat wording ("in trained cyclists, extrapolated to rowing").
4. **Drop `bishop_2008`** from the race-pace justification (RSA is not what 6×500m at 2K pace trains). Buchheit & Laursen 2013 is already in the reference list and is a better fit.
5. **Reframe Seiler 2010** for race-prep — say the 20%-in-threshold-and-race-pace is a race-prep adaptation of the polarised model, not Seiler's original prescription.
6. **Reframe Wilson 2012 rowing claim** — extrapolated from cycling data + rowing's non-eccentric loading profile; not directly studied in the meta.
7. **Fix the "verified" URLs** for `hagerman_1994`, `steinacker_1993`, `mikulic_2011`, `das_2019`. Either replace with direct paper URLs or downgrade `verification_status` to `unverified`.
8. **Consider replacing `das_2019`** — journal is low-tier. Steinacker's later work or a Secher chapter would carry more weight.
9. **Note the Rønnestad absence** as a conscious engineering choice, or add. Rønnestad's short-interval work is the dominant contemporary interval literature for trained cyclists/rowers.
10. **HERITAGE non-responder gate at Push tier** — the honest "−3 to −8 s" ceiling invokes Bouchard 1999 correctly. Consider whether the single week-1-2 base-check 2K is sufficient to classify a non-responder (Hecksteden 2015 flags "≥2 baselines" as the bar).

## 8. What was NOT checked

- Full-text spot-check of Astorino 2013 exact numbers (PubMed cookie wall).
- Bosquet 2007 exact effect size (not re-verified independently; the "~3%" is what the meta is standardly cited for).
- Hagerman 1994 chapter — not accessible via URL.
- Steinacker 1993 — cookie wall.
- Adaptive-engine hooks were not simulated against a real user log.
- Cross-consistency of intake screener gates with Engine Builder's near-identical block.
- Race-pace intensity derivation — the 500m-at-2K-pace + 3-4 min rest is standard rowing practice; I did not derive it from a physiological model.

---

**Verdict: CONDITIONAL.** Core architecture is sound and citation load is above the typical shipping-program bar. Fixes are specific: add Bosquet 2007 for the taper anchor, fix the Proteau title, resolve Astorino-cyclists-vs-rowers wording, drop Bishop 2008, and downgrade the search-query "verified" URLs. Once addressed, this program clears the REVIEWED bar.
