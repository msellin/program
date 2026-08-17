# Engine Builder — aerobic-physiology review (2026-08-17)

## 1. Verdict

**CONDITIONAL.** The evidence base is unusually good — 35 citations, most anchored accurately with correct effect sizes. Three specific drifts and one internal inconsistency need fixing before REVIEWED. The core architecture (Z2 volume drives mitochondrial signal; 4×4 drives stroke volume) is exactly what the literature supports.

## 2. Program scope reviewed

Block 1 of a 3-block engine arc, 8 weeks, 3-5 sessions/week. Aerobic base for a strength-trained user new to endurance. Z1/Z2 volume dominates; one hard weekly stimulus (Norwegian 4×4 or threshold cruise) layered in from week 3-4. Three tiers (Foundation / Progression / Push) gate on cardio-hours-per-week + baseline Z1 tolerance. Retest at week 8: resting HR + submax HR at fixed pace + optional 500m row / 1 km run TT.

Target outcomes: RHR −5 to −10 bpm; submax HR −8 to −15 bpm; VO2max +5-8% (Progression), +3-6% (Foundation), +2-4% (Push).

## 3. Citation-by-citation audit

**Matches (accurate, no fix needed):** `helgerud_2007` (numbers cited verbatim); `hickson_1980`, `wilson_loenneke_2012`, `docherty_sporer_2000`, `fyfe_2014`, `fyfe_2016`, `schumann_2022`, `robineau_2016`, `eddens_2018`, `morton_2018`, `impey_2018` (concurrent-training block, all accurate); `little_2010`, `perry_2010`, `bishop_2019`, `andersen_henriksson_1977`, `cocks_2013` (mito/cap block, accurate); `baggish_wood_2011`, `brooks_2018`, `san_millan_brooks_2018`, `achten_jeukendrup_2003`, `bouchard_1999_heritage`, `tanaka_2001`, `nes_2013_hunt`, `rogers_2021_dfa`, `coyle_1984`, `mujika_padilla_2000`, `butcher_2015_crossfit` (accurate as cited).

**Drifts / issues:**

| Citation | Paper's claim | Program's claim | Issue |
|---|---|---|---|
| `stoggl_sperlich_2014` | 9-wk RCT n=48 trained: polarised (~2 hard/wk) > threshold-heavy for VO2peak / TTE | "Informs the choice to keep only one hard session per week in Block 1" | **Drift.** The paper's polarised arm was ~2 hard/wk, not 1. One-hard-per-week is defensible engineering for an aerobic-naive user but isn't what Stöggl tested. Move to `engineering_choices_flagged`. |
| `ronnestad_hansen_2020` | Title: short intervals induce **superior** VO2max / peak-power gains vs long intervals in trained cyclists | "Long intervals produce **comparable** VO2max gains to short intervals" | **Drift, arguably broken.** The program inverts the paper's headline. Either restate accurately, cite a different paper for "both work," or drop. |
| `konopka_2014` | 12 wk cycling in older adults: PGC-1α +55-62%, CS +65-102%, β-HAD +397-435% | Same numbers cited alongside 8-wk Block 1 claims | **Match on numbers**, but population (older adults) and duration (12 wk not 8) should be flagged so readers don't inherit the ceiling. |
| `wisloff_2007` | 12 wk 4×4 in post-MI HF n=27: VO2peak +46%, LV EF +35% | Same numbers cited | **Match on numbers**, but the HF-patient population starting from a low base is a critical caveat. Should be labelled. |
| `pilegaard_2000` | 8 wk HIGH-intensity training raises MCT1 | Cited to justify `block_sustained_tempo` (sub-threshold work) | **Extrapolation.** Pilegaard tested high-intensity, not sub-threshold. MCT1-tempo pairing is coaching consensus. Move to flagged. |
| `ross_2015` | Non-response drops substantially at higher intensity (75% arm) | "Non-response at 50% intensity drops to 0% at 75%" | **Drift.** Direction correct; "0%" is a hard number not in the paper. Soften to "substantially reduced." |
| `brandt_2025_hyrox` | First HYROX physiological profiling — VO2max is a strong predictor | "VO2max is the strongest predictor; grip strength and muscle mass are NOT reliable predictors" | **Soft drift.** The "not reliable" phrasing over-reads a first-profiling paper. Not load-bearing for the aerobic block — used only for HYROX positioning. |
| `seiler_2010` | Elite endurance ~80/20 low/high distribution | "Backbone of the block" | **Match** for the direction; Block 1 does not actually run 80/20 (one hard session per week is closer to 90/10). Acknowledged in `principles.polarised`, honest. |

## 4. Phase / block structure check

- **Weeks 1-2 pure Z1** — matches Perry 2010 / Little 2010 / Bishop 2019 (mRNA precedes protein). Evidence-backed.
- **Week 3 tempo, week 4 first 4×4 (Progression)** — coaching-consensus sequencing. Program doesn't claim RCT-anchoring. OK.
- **Norwegian 4×4 dose (1×/wk weeks 4-7)** — lower than Helgerud's 3×/wk. Program discloses this in `dose_calibration_note` and reduces expected effect sizes accordingly. Honest.
- **Push tier week-2 4×4** — aggressive for someone with 1 week of baseline. Program invokes Ross 2015; the paper doesn't specifically cover week-2 aggressive dosing on aerobic-naive users. Flag as engineering.
- **Retest at week 8** — block-boundary engineering, disclosed.

## 5. Retest metric check

Two `retest_metrics` defined:

1. **Submax HR at pace-5** (row 2:00/500m) — validated as an early aerobic marker (Konopka 2014, general submax-HR literature). Direction + sensitivity claim correct.
2. **Resting HR** — canonical early aerobic marker. **Only Foundation tier has explicit targets** in `retest_metrics.resting_hr_bpm.targets[]`; the `physiological_targets` copy quotes −5 to −10 bpm for all tiers. Internal inconsistency.

The 500m row TT and 1 km run TT are described in intake `physical_tests` but not defined as `retest_metrics`. Schema gap: what the program describes verbally as retests are not machine-evaluable.

## 6. Engineering choices — honest or hidden?

Honestly flagged: session length granularity, retest cadence, intervals-per-session, 4×4 recovery ratio, warm-up duration, HRmax formula.

**Hidden engineering** presented as evidence:
- One-hard-session-per-week rationale (Stöggl & Sperlich 2014 doesn't test that dose).
- Sub-threshold tempo as MCT1 stimulus (Pilegaard 2000 tested high-intensity work).
- Push tier week-2 4×4 (Ross 2015 doesn't cover it).

## 7. Fixes required before REVIEWED

1. **Rewrite `ronnestad_hansen_2020` usage** — the paper's headline finding is that short intervals were superior to long intervals in trained cyclists. Program says the opposite. Either restate accurately, cite a different paper for "both interval lengths work," or drop.
2. **Soften Ross 2015 "0% at 75%"** to "substantially reduced" — the specific "0%" number isn't in the paper.
3. **Move to `engineering_choices_flagged`:** one-hard-session-per-week rationale (Stöggl & Sperlich), sub-threshold tempo as MCT1 stimulus (Pilegaard), Push-tier week-2 4×4 (Ross).
4. **Complete `retest_metrics.resting_hr_bpm.targets[]`** — add Progression + Push tier targets to match `physiological_targets` copy.
5. **Add `retest_metrics` entries for 500m row TT + 1 km run TT**, or state explicitly they are intake-only baselines and not machine-tracked.
6. **Add population caveats** to Wisløff 2007 (HF patients) and Konopka 2014 (older adults, 12 wk) so healthy strength-trained users don't inherit the ceiling.
7. **Add a maintenance-dose retest cadence** — `mujika_padilla_2000` is cited for post-block maintenance but no schedule is defined. Given the 2-week reversal timeline (Granata 2016, in whitepaper but not this program), a mid-Block-2 aerobic check would catch detraining early.
8. **HERITAGE non-responder gate.** The program acknowledges Bouchard 1999's 10× variance in text but does not implement Hecksteden 2015's "≥2 baselines needed" rule. Consider whether a single week-8 retest is sufficient to classify a Push-tier user as a non-responder.

## 8. What was NOT checked

- Rønnestad & Hansen 2020 full-text — PubMed cookie wall blocked verification. Verdict based on the paper's title + abstract-level domain knowledge; a founder spot-check is warranted before rewriting the citation.
- Wisløff 2007 exact effect sizes (cookie wall). Numbers claimed match well-known publication figures.
- Rogers 2021 DFA-α1 validation details — accepted at whitepaper level.
- Brandt 2025 HYROX full-text — soft anchor for HYROX positioning only; aerobic architecture does not depend on it.
- Adaptive engine's response logic — belongs in a separate engine audit.
- Whether the app UI renders `outcome_by_tier` honestly, or whether marketing elsewhere over-claims — out of scope.

---

**Verdict: CONDITIONAL.** Fix the Rønnestad drift, the Ross "0%" overclaim, move the three hidden engineering choices to the flagged list, and complete the schema (retest targets for all tiers + row/run TT retests). Once addressed, this program clears the REVIEWED bar. The aerobic-physiology backbone is genuinely well-anchored to primary literature — a rare quality in shipping training programs.
