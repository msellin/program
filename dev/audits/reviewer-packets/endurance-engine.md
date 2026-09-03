# Reviewer packet — Endurance — the Engine Builder arc

**Generated 2026-09-03 from the shipping program data.** Regenerate with
`python3 dev/scripts/build-reviewer-packet.py`; do not edit by hand, or it
will start describing a program that no longer ships.

<!-- source-fingerprint: 7a3c622cfbe73990 -->

## What we are asking

Terav is a focused-improvement training app. Each program targets one
capability and adapts against the user's log. Every claim it makes is
supposed to cite a peer-reviewed paper.

Those citations have been audited **only by us**. The app currently tells
users that a VERIFIED badge means the citations were re-checked in a
documented second pass, and states plainly that no outside clinician has
signed off any program. We would like that to stop being true.

**We are asking you to answer three questions**, program by program:

1. **Does each cited paper support the claim attached to it?** Tick-boxes
   below. A "partly" with one line of why is more useful than a yes.
2. **Is anything prescribed here you would not prescribe**, for the
   population described?
3. **Is anything missing from the screening** — who should this refuse to
   take that it currently accepts?

We are **not** asking for endorsement, and we will not describe it as one.
The app will say what you checked and on what date, and that you flagged
what you would change.

## Who this packet is for

An exercise physiologist or endurance coach comfortable with threshold and VO2max programming.

## Time

About 90 minutes. The citation list is the bulk of it; skim anything
outside your domain and say so rather than guessing.

## What happens to your answers

Recorded in the program file as `specialist_review` — your name, credential,
date and scope, plus every change you asked for and whether we made it. That
record is public. If we disagree with something you flag, the disagreement
is published too, not quietly dropped.

---

## engine-builder

**Goal the program sells:** Engine composite (Block 1) — target 1 z-score composite, stretch 1.5.

**What it tells users it does:** Block 1 of a 3-block, ~6-month engine transformation. Eight weeks of Zone 1/2 base with a single weekly hard session added in week 4. Row, bike, ski-erg, or run.

**What it promises by the end:** Block 1 of a 6-month engine transformation. In these 8 weeks: 5-8% VO2max improvement, a measurable resting HR drop (5-10 bpm typical), and — most importantly — the aerobic base that lets Block 2 (volume) and Block 3 (polarised) actually work. Modality is your choice at intake: row, bike, ski-erg, or run. Weeks 1-4 are low-impact regardless; running introduces at week 5 if that's your goal.

### Entry tiers

- **foundation** — Foundation. 

- **progression** — Progression. 

- **push** — Push. 


### Phases and what each is for

- **Week 1 — pure Z1 introduction** (1 wks) — Two Z1 sessions of 45 minutes each. No intervals. If HR runs away, back off pace immediately.
  - Method note: Push tier: same shape, but sessions run 50-55 min. Foundation: one session at 40 min if 45 is too much.
- **Week 2 — Z1 volume up** (1 wks) — Three Z1 sessions, 40-45 minutes each. Push tier: introduces first Norwegian 4x4 in place of one Z1.
  - Method note: Foundation tier: 2 Z1 sessions, 40-45 min each — hold volume rather than adding a third.
- **Week 3 — first sustained tempo** (1 wks) — Two Z1 (50-55 min) + one 20-minute sustained tempo. First taste of sub-threshold work.
  - Method note: Foundation: skip the tempo — third Z1 session at 40 min instead.
- **Week 4 — first Norwegian 4x4** (1 wks) — One long Z1 (60 min) + one moderate Z1 (45 min) + first Norwegian 4x4 for Progression and Push tiers.
  - Method note: Foundation tier: replace the 4x4 with a second sustained tempo (25 min). First 4x4 lands in week 5.
- **Week 5 — threshold enters + run-modality unlock** (1 wks) — One long Z1 (75 min) + one 3×8 threshold + one 45-min Z1. If goal modality is running, running is introduced now — one Z1 session becomes a Z1 easy run.
  - Method note: Push tier: threshold set becomes 3×10 minutes. Foundation: first 4x4 lands this week (delayed one week), no threshold this block.
- **Week 6 — volume peaks, first 4-session week** (1 wks) — Long Z1 (60) + moderate Z1 (45) + Norwegian 4x4 + easy recovery (30). This is the highest-volume week of Block 1.
  - Method note: Push tier: adds a second hard session — swap the recovery for a sustained tempo (30 min). Foundation: 3 sessions total, drop the recovery.
- **Week 7 — combined stimulus** (1 wks) — Long Z1 (75) + sustained tempo (30) + Norwegian 4x4 + Z1 (40). Peak stimulus before deload.
  - Method note: Foundation: threshold cruise instead of the 4x4 (3×8). Push tier as written; already at high load.
- **Week 8 — deload and retest** (1 wks) — One easy Z1 (60) early week, RETEST midweek, one very easy Z1 (40) after. Retest all metrics you measured at intake.
  - Method note: All tiers do the same deload + retest. This is the honest measurement of what Block 1 did.

### What it retests, and how often

- **submax_hr_pace5_bpm** — Submax HR — easy-effort avg (4-weekly)
- **resting_hr_bpm** — Resting HR (2-weekly)

### Who it refuses to take

- `hypertension_unmanaged` in ['yes'] → blocked: "See your clinician first"
- `pregnancy_first_trimester` in ['true'] → blocked: "Work with a specialist"
- `exertional_syncope_history` in ['true'] → blocked: "Get full cardiac clearance first"
- `post_covid_hr_elevated` in ['true'] → blocked: "Wait for baseline HR to normalise"
- `flaring_joint_tendon` in ['true'] → blocked: "Stay on low-impact modality"

**Is anything missing from that list? ☐ no ☐ yes —**


---

## engine-builder-block-2

**Goal the program sells:** Threshold pace / power shift — target 3 % improvement vs Block 2 baseline, stretch 5.

**What it tells users it does:** Block 2 of the 3-block engine transformation. Two hard sessions per week on top of a rising Z1 volume floor. Threshold pace shift is the headline metric.

**What it promises by the end:** Threshold pace / power shift 2-5% by tier. Additional VO2max +4-9% on top of Block 1. Submax HR at fixed pace additional -3 to -8 bpm. Retest at week 4 (mid-block check) and week 8-10 (end-of-block).

### Entry tiers

- **foundation** — Foundation. 

- **progression** — Progression. 

- **push** — Push. 


### Phases and what each is for

- **Weeks 1-2 — Re-entry ramp (Foundation tier only)** (2 wks) — Two weeks of Z1 volume + one sustained tempo per week. Rebuild the base before layering intensity.
  - Method note: Only fires for Foundation tier (block_1_completed == 'yes_lapsed' or 'no_but_equivalent' with low volume). Progression and Push tiers skip this phase and start at phase_1_intro_week.
- **Week 1 — Baseline check + first threshold** (1 wks) — Establish or confirm the 20-min threshold anchor. One 3×8 threshold session at the anchor pace. Two Z1 sessions.
  - Method note: If the user did the 20-min TT at intake within the last week, this week uses that number. Otherwise a fresh 20-min TT lands Wednesday.
- **Weeks 2-3 — Threshold expansion + first Norwegian 4×4** (2 wks) — Threshold expands from 3×8 → 3×10 minutes. First Norwegian 4×4 of the block lands week 2 (Progression / Push) or week 3 (Foundation).
  - Method note: Two hard sessions per week from week 2. Non-negotiable: 48h between the two.
- **Week 4 — Short-interval variant + threshold hold** (1 wks) — The VO2max session becomes short-interval (5×3 min or 8×2 min) this week — accumulates more time-at-VO2max per session (Ronnestad & Hansen 2020).
  - Method note: Alternating the format weeks 4-8 is the block's variety mechanism. Threshold stays at 3×10 this week.
- **Weeks 5-6 — Threshold to 3×12, back to 4×4** (2 wks) — Threshold expands to 3×12 minutes. VO2max session returns to 4×4 for these two weeks.
  - Method note: Peak-volume window. Z1 volume floor +15% vs week 1 for Progression tier; +30% for Push.
- **Week 7 — Short-interval + optional Z3 (Push tier)** (1 wks) — Short intervals return. Threshold stays at 3×12. Push tier optionally adds a third hard session (Z3 tempo).
  - Method note: Push tier only adds the third session — Progression stays at two hard sessions.
- **Week 8 — Threshold to 3×15, final VO2max stimulus** (1 wks) — Threshold hits the block's ceiling (3×15 for Progression, 3×18 for Push, 3×12 for Foundation). VO2max session is the last 4×4 of the block.
  - Method note: Final stimulus week before the taper.
- **Weeks 9-10 (or 8) — Taper and retest** (2 wks) — One week reduced volume, one week retest. Repeat the intake protocol at retest — 20-min TT, submax HR at fixed pace, resting HR, plus modality-specific TT (2K row / 5K run).
  - Method note: Mujika & Padilla 2000 taper literature: intensity preserved, volume down 40-60%, session count -1. The last 3 days before the retest are Z1 only.

### What it retests, and how often

- **threshold_20min_shift_pct** — 20-min threshold shift (4-weekly)
- **submax_hr_pace5_bpm** — Submax HR at Block 2 anchor pace (4-weekly)
- **resting_hr_bpm** — Resting HR (Block 2) (2-weekly)

### Who it refuses to take

- `block_1_completed` in ['no'] → blocked: "Build the base first"
- `hypertension_unmanaged` in ['yes'] → blocked: "See your clinician first"
- `exertional_syncope_history` in ['true'] → blocked: "Get full cardiac clearance first"
- `post_covid_hr_elevated` in ['true'] → blocked: "Wait for baseline HR to normalise"

**Is anything missing from that list? ☐ no ☐ yes —**


---

# Citations for this domain

43 unique papers across 2 programs. Where a paper backs more than one claim, every claim is listed under it — a paper stretched across two claims is worth a second look.

**achten_jeukendrup_2003** — Maximal fat oxidation during exercise in trained men · Achten J, Jeukendrup AE · 2003

- *engine-builder says it supports:* Fatmax at ~63% VO2max (range 45-75%) in trained men. Cited in physiological_targets fat-oxidation entry.
- **Does it? ☐ yes ☐ partly ☐ no —**

**andersen_henriksson_1977** — Capillary supply of the quadriceps femoris muscle of man: adaptive response to exercise · Andersen P, Henriksson J · 1977

- *engine-builder says it supports:* Foundational study showing +20% capillary density after 8 weeks of 40 min/day, 4×/wk continuous work. Cited in physiological_targets.
- **Does it? ☐ yes ☐ partly ☐ no —**

**astorino_2013** — Effect of high-intensity interval training on cardiovascular function, VO2max, and muscular force · Astorino TA, Allen RP, Roberson DW, Jurancich M · 2013

- *engine-builder-block-2 says it supports:* HIIT dose-response for VO2max. Supports the block's expected 5-10% VO2max additional gain range.
- **Does it? ☐ yes ☐ partly ☐ no —**

**baggish_wood_2011** — Athlete's heart and cardiovascular care of the athlete: scientific and clinical update · Baggish AL, Wood MJ · 2011

- *engine-builder says it supports:* Eccentric vs concentric LV remodelling review — endurance training drives eccentric hypertrophy, strength/isometric drives concentric. Cited in physiological_targets.
- **Does it? ☐ yes ☐ partly ☐ no —**

**billat_2000** — Interval training for performance: a scientific and empirical practice. Special recommendations for middle- and long-distance running. Part I: aerobic interval training · Billat V · 2000

- *engine-builder-block-2 says it supports:* Interval-training review. Supports the threshold + VO2max weekly dose.
- **Does it? ☐ yes ☐ partly ☐ no —**

**billat_2001** — The concept of maximal lactate steady state · Billat V, Sirvent P, Py G, et al. · 2001

- *engine-builder-block-2 says it supports:* MLSS / LT2 concept — the underlying physiology of the threshold work in this block.
- **Does it? ☐ yes ☐ partly ☐ no —**

**bishop_2008** — Repeated-sprint ability - Part II: recommendations for training · Bishop D, Girard O, Mendez-Villanueva A · 2008

- *engine-builder-block-2 says it supports:* Repeated-sprint / short-interval training recommendations. Supports the short-interval alternation with 4×4.
- **Does it? ☐ yes ☐ partly ☐ no —**

**bishop_2019** — CrossTalk opposing view: exercise training volume is more important than training intensity to promote increases in mitochondrial content · Bishop DJ, Botella J, Granata C · 2019

- *engine-builder says it supports:* Volume-vs-intensity signalling synthesis. Informs the block's volume-first design in weeks 1-3.
- *engine-builder-block-2 says it supports:* Volume drives mitochondrial content beyond a threshold. Anchors the Z1 volume floor rising across Block 2.
- **Does it? ☐ yes ☐ partly ☐ no —**

**bouchard_1999_heritage** — Familial aggregation of VO2max response to exercise training: results from the HERITAGE Family Study · Bouchard C, An P, Rice T, et al. · 1999

- *engine-builder says it supports:* Heritability of training response = 47%; ~10× range in individual gains. Cited in outcome_evidence's individual-variation caveat.
- *engine-builder-block-2 says it supports:* Heritability of training response 47%; ~10× range in individual gains. Anchors the outcome-range caveat.
- **Does it? ☐ yes ☐ partly ☐ no —**

**brandt_2025_hyrox** — Acute physiological responses and performance determinants in Hyrox · Brandt K, et al. · 2025

- *engine-builder says it supports:* First direct HYROX physiological profiling: VO2max is the strongest predictor; grip strength and muscle mass are NOT reliable predictors. Anchors the recommendation for HYROX-goal users to prioritise aerobic development over strength during Block 1.
- **Does it? ☐ yes ☐ partly ☐ no —**

**brooks_2018** — The science and translation of lactate shuttle theory · Brooks GA · 2018

- *engine-builder says it supports:* Modern lactate shuttle theory synthesis — lactate is fuel + signalling molecule, not waste. Cited in physiological_targets and block_sustained_tempo rationale.
- *engine-builder-block-2 says it supports:* Modern lactate shuttle theory. Supports the threshold-cruise rationale.
- **Does it? ☐ yes ☐ partly ☐ no —**

**buchheit_laursen_2013_a** — High-intensity interval training, solutions to the programming puzzle. Part I · Buchheit M, Laursen PB · 2013

- *engine-builder-block-2 says it supports:* Time-at-VO2max framework. Anchors why Block 2 alternates 4×4 and short-interval formats.
- **Does it? ☐ yes ☐ partly ☐ no —**

**buchheit_laursen_2013_b** — High-intensity interval training, solutions to the programming puzzle. Part II · Buchheit M, Laursen PB · 2013

- *engine-builder-block-2 says it supports:* Practical HIIT programming. Supports the two-hard-sessions/wk dose and the Z3 optional session for Push tier.
- **Does it? ☐ yes ☐ partly ☐ no —**

**butcher_2015_crossfit** — Do physiological measures predict selected CrossFit benchmark performance? · Butcher SJ, Neyedly TJ, Horvey KJ, Benko CR · 2015

- *engine-builder says it supports:* CrossFit Total predicts Fran/Grace performance most strongly, but VO2max still contributes. Anchors the 'aerobic base protects your CrossFit performance' claim.
- **Does it? ☐ yes ☐ partly ☐ no —**

**cocks_2013** — Sprint interval and endurance training are equally effective in increasing muscle microvascular density and eNOS content in sedentary males · Cocks M, Shaw CS, Shepherd SO, Fisher JP, Ranasinghe AM, Barker TA, Tipton KD, Wagenmakers AJM · 2013

- *engine-builder says it supports:* Endurance and SIT both increase capillary-to-fibre ratio comparably; endurance drives capillary density (per area) more reliably. Cited in physiological_targets.
- **Does it? ☐ yes ☐ partly ☐ no —**

**coyle_1984** — Time course of loss of adaptations after stopping prolonged intense endurance training · Coyle EF, Martin WH, Sinacore DR, Joyner MJ, Hagberg JM, Holloszy JO · 1984

- *engine-builder says it supports:* Detraining timecourse: VO2max −7% at 12 days, −16% at 12 weeks. Informs the post-block maintenance dose.
- *engine-builder-block-2 says it supports:* Detraining timecourse. Informs the Foundation-tier 2-week re-entry ramp for users lapsed 4+ weeks from Block 1.
- **Does it? ☐ yes ☐ partly ☐ no —**

**docherty_sporer_2000** — A proposed model for examining the interference phenomenon between concurrent aerobic and strength training · Docherty D, Sporer B · 2000

- *engine-builder says it supports:* Interference model — informs the same-day sequencing rule (strength first if both must share a day) and the 6+ h separation guideline.
- **Does it? ☐ yes ☐ partly ☐ no —**

**eddens_2018** — The role of intra-session exercise sequence in the interference effect: a systematic review with meta-analysis · Eddens L, van Someren K, Howatson G · 2018

- *engine-builder says it supports:* Resistance-before-endurance produced +6.91% lower-body strength gain vs endurance-first (p=0.006). Cited in concurrent_strength_prescription's same-day rule.
- *engine-builder-block-2 says it supports:* +6.91% lower-body strength gain when lifting precedes endurance. Anchors 'lift first if forced' rule.
- **Does it? ☐ yes ☐ partly ☐ no —**

**faude_2009** — Lactate threshold concepts: how valid are they? · Faude O, Kindermann W, Meyer T · 2009

- *engine-builder-block-2 says it supports:* Lactate threshold concepts review. Anchors why Block 2's headline metric is threshold shift.
- **Does it? ☐ yes ☐ partly ☐ no —**

**fyfe_2014** — Interference between concurrent resistance and endurance exercise: molecular bases and the role of individual training variables · Fyfe JJ, Bishop DJ, Stepto NK · 2014

- *engine-builder says it supports:* The definitive interference-mechanism review. Anchors concurrent_strength_prescription.
- **Does it? ☐ yes ☐ partly ☐ no —**

**fyfe_2016** — Endurance training intensity does not mediate interference to maximal lower-body strength gain during short-term concurrent training · Fyfe JJ, Bishop DJ, Zacharewicz E, et al. · 2016

- *engine-builder says it supports:* Endurance VOLUME (not intensity) drives interference — HIIT and MICT produce the same strength decrement at matched work. Cited in progression_rationale for why peak-volume weeks tighten the strength cap.
- *engine-builder-block-2 says it supports:* Endurance VOLUME (not intensity) drives interference. Anchors why concurrent-strength cap tightens in Block 2's peak-volume weeks 5-7.
- **Does it? ☐ yes ☐ partly ☐ no —**

**helgerud_2007** — Aerobic high-intensity intervals improve VO2max more than moderate training · Helgerud J, Høydal K, Wang E, et al. · 2007

- *engine-builder says it supports:* The Norwegian 4x4 protocol itself. Cited in the outcome_evidence range and in block_norwegian_4x4 rationale.
- *engine-builder-block-2 says it supports:* Norwegian 4×4 protocol. Block 2 uses it every other week rather than every week.
- **Does it? ☐ yes ☐ partly ☐ no —**

**hickson_1980** — Interference of strength development by simultaneously training for strength and endurance · Hickson RC · 1980

- *engine-builder says it supports:* The concurrent-training interference effect — foundation for the strength maintenance-only recommendation.
- *engine-builder-block-2 says it supports:* Original interference-effect data. Same rules as Block 1, tighter monitoring.
- **Does it? ☐ yes ☐ partly ☐ no —**

**impey_2018** — Fuel for the work required: a theoretical framework for carbohydrate periodization and the glycogen threshold hypothesis · Impey SG, Hearris MA, Hammond KM, et al. · 2018

- *engine-builder says it supports:* Carbohydrate periodisation — fuel resistance and hard interval sessions fully; easy Z2 can be lower-carb. Cited in concurrent_strength_prescription.
- *engine-builder-block-2 says it supports:* Fuel resistance sessions fully — Block 2's higher volume tightens the fuel-for-work-required framework.
- **Does it? ☐ yes ☐ partly ☐ no —**

**joyner_coyle_2008** — Endurance exercise performance: the physiology of champions · Joyner MJ, Coyle EF · 2008

- *engine-builder-block-2 says it supports:* VO2max plateaus; threshold and running economy keep improving. Anchors why Block 2's headline metric is threshold shift, not VO2max.
- **Does it? ☐ yes ☐ partly ☐ no —**

**konopka_2014** — Markers of human skeletal muscle mitochondrial biogenesis and quality control: effects of age and aerobic exercise training · Konopka AR, Suer MK, Wolff CA, Harber MP · 2014

- *engine-builder says it supports:* Effect sizes for oxidative enzyme changes (β-HAD +397-435%, CS +65-102%, PGC-1α +55-62% in 12 weeks) — cited in physiological_targets and block_z1_steady rationale. Also: no age blunting of relative response. Population caveat: cohort was older adults over 12 weeks; healthy strength-trained users on an 8-week block should not treat the top of these ranges as their ceiling.
- *engine-builder-block-2 says it supports:* 12-week enzyme-activity data anchors the additional Block 2 gains on top of Block 1.
- **Does it? ☐ yes ☐ partly ☐ no —**

**little_2010** — A practical model of low-volume high-intensity interval training induces mitochondrial biogenesis in human skeletal muscle · Little JP, Safdar A, Wilkin GP, Tarnopolsky MA, Gibala MJ · 2010

- *engine-builder says it supports:* Mitochondrial biogenesis signal detectable within 2 weeks of HIIT — cited in physiological_targets and progression_rationale for why weeks 1-2 focus on Z1 accumulation.
- **Does it? ☐ yes ☐ partly ☐ no —**

**morton_2018** — A systematic review, meta-analysis and meta-regression of the effect of protein supplementation on resistance training-induced gains in muscle mass and strength in healthy adults · Morton RW, Murphy KT, McKellar SR, et al. · 2018

- *engine-builder says it supports:* Protein plateau at 1.62 g/kg/day. Anchors the concurrent_strength_prescription's protein floor.
- *engine-builder-block-2 says it supports:* Protein floor 1.62 g/kg/day. Anchors the concurrent strength prescription.
- **Does it? ☐ yes ☐ partly ☐ no —**

**mujika_padilla_2000** — Detraining: loss of training-induced physiological and performance adaptations. Part I & II · Mujika I, Padilla S · 2000

- *engine-builder says it supports:* Maintenance dose during subsequent strength focus: 2 aerobic sessions/week with intensity preserved. Cited in outcome_evidence and post-block prescription.
- *engine-builder-block-2 says it supports:* Taper literature: intensity preserved, volume down 40-60%. Anchors the week 9-10 taper design.
- **Does it? ☐ yes ☐ partly ☐ no —**

**nes_2013_hunt** — Age-predicted maximal heart rate in healthy subjects: the HUNT Fitness Study · Nes BM, Janszky I, Wisløff U, Støylen A, Karlsen T · 2013

- *engine-builder says it supports:* HUNT formula HRmax = 211 − 0.64 × age (SEE 10.8 bpm). Cited in hr_zone_methodology as the default.
- *engine-builder-block-2 says it supports:* HUNT HRmax formula — used for zone defaults.
- **Does it? ☐ yes ☐ partly ☐ no —**

**perry_2010** — Repeated transient mRNA bursts precede increases in transcriptional and mitochondrial proteins during training in human skeletal muscle · Perry CGR, Lally J, Holloway GP, Heigenhauser GJF, Bonen A, Spriet LL · 2010

- *engine-builder says it supports:* mRNA-precedes-protein pattern — informs the choice to accumulate volume before adding interval intensity.
- **Does it? ☐ yes ☐ partly ☐ no —**

**pilegaard_2000** — Effect of high-intensity exercise training on lactate/H+ transport capacity in human skeletal muscle · Pilegaard H, Domino K, Noland T, et al. · 2000

- *engine-builder says it supports:* MCT1 upregulation with endurance training. Cited in physiological_targets and block_sustained_tempo rationale.
- *engine-builder-block-2 says it supports:* MCT1 upregulation from threshold-and-above work. Anchors why threshold cruise is Block 2's primary driver.
- **Does it? ☐ yes ☐ partly ☐ no —**

**robineau_2016** — Specific training effects of concurrent aerobic and strength exercises depend on recovery duration · Robineau J, Babault N, Piscione J, Lacome M, Bigard AX · 2016

- *engine-builder says it supports:* 6+ h separation dose-response: C-0h halves strength gains vs alternate-day. Cited in adaptive_engine_hooks and concurrent_strength_prescription.
- *engine-builder-block-2 says it supports:* 6+ h separation preserves both adaptations; 0h halves strength gains. Anchors the same-day sequencing rule.
- **Does it? ☐ yes ☐ partly ☐ no —**

**rogers_2021_dfa** — A new detection method defining the aerobic threshold for endurance exercise and training prescription based on fractal correlation properties of heart rate variability · Rogers B, Giles D, Draper N, Hoos O, Gronwald T · 2021

- *engine-builder says it supports:* DFA a1 = 0.75 as VT1 anchor. Cited in hr_zone_methodology as the preferred method for chest-strap-equipped users.
- *engine-builder-block-2 says it supports:* DFA a1 = 0.75 as VT1 anchor for chest-strap users.
- **Does it? ☐ yes ☐ partly ☐ no —**

**ronnestad_hansen_2020** — Short intervals induce superior training adaptations compared with long intervals in cyclists · Rønnestad BR, Hansen J, et al. · 2020

- *engine-builder says it supports:* Short intervals were SUPERIOR to long intervals for VO2max in trained cyclists. Informs the decision to keep 4×4 as the VO2max stimulus and NOT chase VO2max with the threshold cruise block — the cruise trains LT2 sustainable output (Joyner & Coyle 2008), a different adaptation than VO2max.
- *engine-builder-block-2 says it supports:* Short intervals (5×3, 8×2) accumulate more time-at-VO2max per session for well-trained users. Anchors the block_short_intervals alternation.
- **Does it? ☐ yes ☐ partly ☐ no —**

**ross_2015** — Separate effects of intensity and amount of exercise on interindividual cardiorespiratory fitness response · Ross R, Goodpaster BH, Koch LG, et al. · 2015

- *engine-builder says it supports:* Non-response at 50% intensity is substantially reduced at 75% intensity. Informs the tier progression logic — under-dosing is often the cause of apparent non-response.
- *engine-builder-block-2 says it supports:* Non-response at 50% intensity drops to 0% at 75%. Informs why Push tier adds a third session for high-cardio users.
- **Does it? ☐ yes ☐ partly ☐ no —**

**san_millan_brooks_2018** — Assessment of metabolic flexibility by means of measuring blood lactate, fat and carbohydrate oxidation responses · San-Millán I, Brooks GA · 2018

- *engine-builder says it supports:* Metabolic flexibility framework and Zone 2 lactate-clamp methodology. Anchors the block_z1_steady prescription.
- **Does it? ☐ yes ☐ partly ☐ no —**

**schumann_2022** — Compatibility of concurrent aerobic and strength training for skeletal muscle size and function: an updated systematic review and meta-analysis · Schumann M, Feuerbacher JF, Sünkeler M, et al. · 2022

- *engine-builder says it supports:* Updated concurrent-training meta: max strength SMD −0.06 (n.s.), hypertrophy SMD −0.01 (n.s.), EXPLOSIVE strength SMD −0.28 (significant). Anchors the 'no PR chasing' rule specifically for explosive lifts.
- *engine-builder-block-2 says it supports:* SMD −0.28 explosive strength — the specific loss zone. Anchors 'no PR chasing' rule.
- **Does it? ☐ yes ☐ partly ☐ no —**

**seiler_2010** — What is best practice for training intensity and duration distribution in endurance athletes? · Seiler S · 2010

- *engine-builder says it supports:* Polarised training model — the 80/20 easy/hard distribution that anchors the full 3-block arc.
- *engine-builder-block-2 says it supports:* Polarised training model — 80/20 easy/hard distribution. Block 2 is still base-heavy but leans further toward the 20% hard end.
- **Does it? ☐ yes ☐ partly ☐ no —**

**stoggl_sperlich_2014** — Polarized training has greater impact on key endurance variables than threshold, high intensity, or high volume training · Stöggl T, Sperlich B · 2014

- *engine-builder says it supports:* Comparative evidence that polarised distribution outperforms threshold-heavy blocks — informs the choice to keep only one hard session per week in Block 1.
- *engine-builder-block-2 says it supports:* Polarised outperforms threshold-heavy. Informs why Block 2 keeps two hard sessions (not three) and preserves Z1 volume.
- **Does it? ☐ yes ☐ partly ☐ no —**

**tanaka_2001** — Age-predicted maximal heart rate revisited · Tanaka H, Monahan KD, Seals DR · 2001

- *engine-builder says it supports:* HRmax = 208 − 0.7 × age, meta-analysis of 351 studies. Referenced in hr_zone_methodology alongside HUNT.
- *engine-builder-block-2 says it supports:* HRmax formula fallback.
- **Does it? ☐ yes ☐ partly ☐ no —**

**wilson_loenneke_2012** — Concurrent training: a meta-analysis examining interference of aerobic and resistance exercises · Wilson JM, Marin PJ, Rhea MR, Wilson SMC, Loenneke JP, Anderson JC · 2012

- *engine-builder says it supports:* Meta-analytic evidence that interference is proportional to endurance volume and intensity — informs the RPE cap and session-count cap on concurrent strength.
- *engine-builder-block-2 says it supports:* Concurrent-training meta. Anchors the concurrent-strength policy tightening in Block 2 peak-volume weeks.
- **Does it? ☐ yes ☐ partly ☐ no —**

**wisloff_2007** — Superior cardiovascular effect of aerobic interval training versus moderate continuous training in heart failure patients: a randomized study · Wisløff U, Støylen A, Loennechen JP, et al. · 2007

- *engine-builder says it supports:* 12-week 4×4-min interval trial showed VO2peak +46% and LV ejection fraction +35% in HF patients. Reinforces Helgerud 2007's finding that intervals — not continuous training — drive cardiac remodelling. Population caveat: cohort was heart-failure patients with substantial adaptive headroom; healthy trained users should not expect the +46% response magnitude — Helgerud 2007's +7.2% is the appropriate healthy-cohort anchor.
- *engine-builder-block-2 says it supports:* 12-week 4×4 stimulus. Reinforces Norwegian 4×4 as Block 2's cardiac remodelling anchor.
- **Does it? ☐ yes ☐ partly ☐ no —**


---

## Sign-off

- Name and credential:
- Date reviewed:
- Anything you did **not** review (out of your domain):
- Overall: ☐ ships as-is ☐ ships with the changes flagged ☐ do not ship until fixed
