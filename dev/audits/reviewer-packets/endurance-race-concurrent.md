# Reviewer packet — Race prep & concurrent training

**Generated 2026-09-04 from the shipping program data.** Regenerate with
`python3 dev/scripts/build-reviewer-packet.py`; do not edit by hand, or it
will start describing a program that no longer ships.

<!-- source-fingerprint: fe7b72954550774a -->

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

An endurance or strength-and-conditioning coach who works with concurrent athletes.

## Time

About 60 minutes. The citation list is the bulk of it; skim anything
outside your domain and say so rather than guessing.

## What happens to your answers

Recorded in the program file as `specialist_review` — your name, credential,
date and scope, plus every change you asked for and whether we made it. That
record is public. If we disagree with something you flag, the disagreement
is published too, not quietly dropped.

---

## rowing-2k-test-prep

**Goal the program sells:** 2K row time reduction — target -15 seconds, stretch -30.

**What it tells users it does:** For rowers chasing the 2K PR. Six weeks, cited, tapered — no more than that.

**What it promises by the end:** 2K down 3-30 seconds by tier. Threshold pace shifted 3-6%. Race-day taper baked in.

### Entry tiers

- **foundation** — Foundation — 2K > 9:00. 

- **progression** — Progression — 2K 8:00–9:00. 

- **push** — Push — 2K < 8:00. 


### Phases and what each is for

- **Base check · Weeks 1–2** (2 wks) — Establish current 2K + submax HR baseline. Sharpen technique before overloading.
- **Threshold build · Weeks 3–4** (2 wks) — Push threshold pace up 3-6%. Add one race-pace session per week.
- **Taper + test · Weeks 5–6** (2 wks) — Volume down 40-50%, intensity held. Test at week 6.

### What it retests, and how often

- **row_2k_time_seconds** — 2K row time (2-weekly)
- **threshold_pace_500m_seconds** — Threshold pace / 500m (2-weekly)

### What it asks, and what each answer does

- **Realistically, how many days per week can you commit?**  
  `days_per_week` — answers: 2, 3, 4, 5, 6, 7
- **What's your current or estimated 2K row time? (mm:ss)**  
  `current_2k_time`
- **How familiar are you with the Concept2 erg?**  
  `erg_familiar` — answers: novice, occasional, regular
- **Do you have a target test date? (approximate is fine)**  
  `target_test_date`
- **Do you have high blood pressure that isn't under control? (Over 160/100 at rest, or diagnosed but not on medication — uncontrolled hypertension.)**  
  `hypertension_unmanaged` — answers: no, unsure, yes
  - BLOCKS on ['yes'] → "See your clinician first"
  - warns, then continues on ['unsure'] → "Worth getting a blood-pressure reading"
- **History of fainting or unexplained cardiac symptoms during hard effort?**  
  `exertional_syncope_history`
  - BLOCKS on ['true'] → "Get cardiac clearance first"
- **Chest pain or shortness of breath outside normal exertion in the last 6 months?**  
  `chest_pain_recent`
  - BLOCKS on ['true'] → "See your clinician first"
- **Currently flaring low back?**  
  `flaring_low_back`
  - BLOCKS on ['true'] → "Resolve the flare first"
- **Do you take a beta-blocker or other heart-rate-lowering medication?**  
  `rate_limiting_medication` — answers: no, unsure, yes
  - warns, then continues on ['yes', 'unsure'] → "Heart-rate targets won't apply to you"
- **Are you pregnant?**  
  `pregnancy_current` — answers: no, yes
  - warns, then continues on ['yes'] → "Heart-rate zones won't be reliable for you"
- **I consent to storing training log + symptom scores.**  
  `consent_symptom_data`

### Conditions the program says it should exclude

Printed against the questions above so you can see which are actually detectable.

- Unmanaged hypertension — 2K test pushes HR to max
- History of exertional syncope — requires cardiac clearance
- Recent chest pain / shortness of breath — workup first
- Flaring low back — rowing loads the lumbar spine
- First-trimester pregnancy — HR-based zones unreliable

**Is anything missing — who should this refuse to take that it currently accepts? ☐ no ☐ yes —**


---

## concurrent-strength-maintenance

**Goal the program sells:** Submax HR reduction at fixed pace — target -10 bpm, stretch -15.

**What it tells users it does:** For lifters adding cardio without losing the squat. Explosive-strength cost bounded, cited, PR-banned.

**What it promises by the end:** Submax HR down 8-15 bpm at fixed pace, back squat / block pull / front squat maintained within 2.5 kg of pre-block TM, RPE ceiling 7 throughout (Schumann 2022 explosive-strength discipline).

### Entry tiers

- **foundation** — Foundation. 

- **progression** — Progression. 

- **push** — Push. 


### Phases and what each is for

- **Intro · Weeks 1–2** (2 wks) — Anchor the strength floor. Introduce Z2 volume. No high-intensity yet.
- **Intervals · Weeks 3–6** (4 wks) — Add Norwegian 4×4 once/week. Hold strength at RPE ≤ 7. Week 4 is the deload.
- **Retest · Weeks 7–8** (2 wks) — Retest submax HR at pace-5. Confirm strength held.

### What it retests, and how often

- **back_squat_5rm_kg** — Back squat 5RM (8-weekly)
- **submax_hr_pace5_bpm** — Submax HR — easy-effort avg (4-weekly)

### What it asks, and what each answer does

- **Realistically, how many days per week can you commit?**  
  `days_per_week` — answers: 2, 3, 4, 5, 6, 7
- **Current weekly cardio hours (Z1/Z2 combined)?**  
  `cardio_hours_per_week` — answers: under_1, 1_3, 3_6, over_6
- **Do you have a current back-squat 5RM you'd rather not lose?**  
  `has_squat_prs`
- **Do you have high blood pressure that isn't under control? (Over 160/100 at rest, or diagnosed but not on medication — uncontrolled hypertension.)**  
  `hypertension_unmanaged` — answers: no, unsure, yes
  - BLOCKS on ['yes'] → "See your clinician first"
  - warns, then continues on ['unsure'] → "Worth getting a blood-pressure reading"
- **Ever fainted or had unexplained cardiac symptoms during exertion?**  
  `exertional_syncope_history`
  - BLOCKS on ['true'] → "Get full cardiac clearance first"
- **Currently flaring tendon (Achilles, patellar, elbow)?**  
  `flaring_tendon`
  - BLOCKS on ['true'] → "Resolve the flare first"
- **Do you take a beta-blocker or other heart-rate-lowering medication?**  
  `rate_limiting_medication` — answers: no, unsure, yes
  - warns, then continues on ['yes', 'unsure'] → "Heart-rate targets won't apply to you"
- **Are you pregnant?**  
  `pregnancy_current` — answers: no, yes
  - warns, then continues on ['yes'] → "Heart-rate zones won't be reliable for you"
- **I consent to storing training log and symptom scores.**  
  `consent_symptom_data`

### Conditions the program says it should exclude

Printed against the questions above so you can see which are actually detectable.

- Unmanaged hypertension (BP > 160/100 at rest) — see clinician before Norwegian 4×4 sessions.
- History of exertional syncope or unexplained cardiac symptoms — full clearance first.
- First-trimester pregnancy — HR zones are unreliable; work with a specialist.
- Flaring lower-limb tendinopathy (Achilles, patellar) — no running variant of intervals.
- Post-COVID convalescence with elevated resting HR — defer intervals until baseline HR normalises.

**Is anything missing — who should this refuse to take that it currently accepts? ☐ no ☐ yes —**


---

# Citations for this domain

51 unique papers across 2 programs. Where a paper backs more than one claim, every claim is listed under it — a paper stretched across two claims is worth a second look.

**andersen_henriksson_1977** — Capillary supply of the quadriceps femoris muscle of man: adaptive response to exercise · Andersen P, Henriksson J · 1977

- *concurrent-strength-maintenance says it supports:* Foundational capillary density +20% in 8 wk endurance
- **Does it? ☐ yes ☐ partly ☐ no —**

**aragon_schoenfeld_2013** — Nutrient timing revisited: is there a post-exercise anabolic window? · Aragon AA, Schoenfeld BJ · 2013

- *concurrent-strength-maintenance says it supports:* Anabolic window is 4-6h, not 30 min — supports 6h separation compatibility
- **Does it? ☐ yes ☐ partly ☐ no —**

**astorino_2013** — Effect of high-intensity interval training on cardiovascular function, VO2max, and muscular force · Astorino TA, Allen RP, Roberson DW, Jurancich M · 2013

- *rowing-2k-test-prep says it supports:* Threshold-pace shift of 3-6% in 4-8 wk measured in trained cyclists — extrapolated to rowing as an engineering read, not directly studied. See engineering_choices_flagged.
- **Does it? ☐ yes ☐ partly ☐ no —**

**atherton_2005** — Selective activation of AMPK-PGC-1α or PKB-TSC2-mTOR signalling by low- vs high-frequency stimulation · Atherton PJ, Babraj J, Smith K, et al. · 2005

- *concurrent-strength-maintenance says it supports:* AMPK-PKB switch — molecular basis of concurrent interference
- **Does it? ☐ yes ☐ partly ☐ no —**

**baar_2014** — Using molecular biology to maximize concurrent training · Baar K · 2014

- *concurrent-strength-maintenance says it supports:* AMPK window ~3h post-endurance; mTORC1 sensitised 18-24h post-lifting
- **Does it? ☐ yes ☐ partly ☐ no —**

**bartlett_2015** — Carbohydrate availability and exercise training adaptation: too much of a good thing? · Bartlett JD, Hawley JA, Morton JP · 2015

- *concurrent-strength-maintenance says it supports:* Train-low framework — low CHO amplifies AMPK/PGC-1α/p53
- **Does it? ☐ yes ☐ partly ☐ no —**

**berryman_2018** — Effects of short-term concurrent training cessation on the energy cost of running and neuromuscular performances · Berryman N, Mujika I, Bosquet L · 2018

- *concurrent-strength-maintenance says it supports:* Short-term cessation effects on running energy cost + neuromuscular performance. Terav extrapolates this running-side sensitivity to a modality-preference read (cycling as the safer concurrent partner) — see engineering_choices_flagged. Wilson 2012 + Doma 2019 carry the direct concurrent-interference evidence.
- **Does it? ☐ yes ☐ partly ☐ no —**

**billat_2000** — Interval training for performance: a scientific and empirical practice. Special recommendations for middle- and long-distance running. Part I: aerobic interval training · Billat V · 2000

- *rowing-2k-test-prep says it supports:* Aerobic interval prescription
- **Does it? ☐ yes ☐ partly ☐ no —**

**billat_2001** — The concept of maximal lactate steady state · Billat V, Sirvent P, Py G, et al. · 2001

- *rowing-2k-test-prep says it supports:* MLSS as threshold intensity target
- **Does it? ☐ yes ☐ partly ☐ no —**

**bishop_2008** — Repeated-sprint ability - Part II: recommendations for training · Bishop D, Girard O, Mendez-Villanueva A · 2008

- *rowing-2k-test-prep says it supports:* Repeated-sprint-ability programming. Note (2026-08-17 review): RSA is not the correct energy-system framing for 6×500m at 2K pace. Buchheit & Laursen 2013 covers this better; kept in the library but the race-pace justification now defers to Buchheit & Laursen.
- **Does it? ☐ yes ☐ partly ☐ no —**

**bosquet_2007** — Effects of tapering on performance: a meta-analysis · Bosquet L, Montpetit J, Arvisais D, Mujika I · 2007

- *rowing-2k-test-prep says it supports:* Meta-analysis anchor for the ~3% performance uplift claim on the taper. Stronger single-source anchor than Mujika & Padilla 2000 alone; both are now cited.
- **Does it? ☐ yes ☐ partly ☐ no —**

**bouchard_1999_heritage** — Familial aggregation of VO2max response to exercise training: results from the HERITAGE Family Study · Bouchard C, An P, Rice T, et al. · 1999

- *rowing-2k-test-prep says it supports:* Individual response variance — informs Push tier honest ranges
- *concurrent-strength-maintenance says it supports:* Heritability of VO2max response = 47%; 2.5× between-family variance
- **Does it? ☐ yes ☐ partly ☐ no —**

**bouchard_2011** — Genomic predictors of the maximal O2 uptake response to standardized exercise training programs · Bouchard C, Sarzynski MA, Rice TK, et al. · 2011

- *concurrent-strength-maintenance says it supports:* 21-SNP model explains 49% of variance — honest range in outcomes
- **Does it? ☐ yes ☐ partly ☐ no —**

**brandt_2025** — Acute physiological responses and performance determinants in Hyrox© – a new running-focused high intensity functional fitness trend · Brandt N, Ebel K, Lebahn K, Schmidt A · 2025

- *concurrent-strength-maintenance says it supports:* VO2max = strongest HYROX predictor; grip / muscle mass NOT reliable
- **Does it? ☐ yes ☐ partly ☐ no —**

**buchheit_laursen_2013_a** — High-intensity interval training, solutions to the programming puzzle. Part I · Buchheit M, Laursen PB · 2013

- *rowing-2k-test-prep says it supports:* Interval-programming variables (long vs short, work:rest)
- **Does it? ☐ yes ☐ partly ☐ no —**

**buchheit_laursen_2013_b** — High-intensity interval training, solutions to the programming puzzle. Part II · Buchheit M, Laursen PB · 2013

- *rowing-2k-test-prep says it supports:* Anaerobic-specific programming variables
- **Does it? ☐ yes ☐ partly ☐ no —**

**butcher_2015** — Do physiological measures predict selected CrossFit benchmark performance? · Butcher SJ, Neyedly TJ, Horvey KJ, Benko CR · 2015

- *concurrent-strength-maintenance says it supports:* CrossFit Total = strongest Fran/Grace predictor — strength floor matters
- **Does it? ☐ yes ☐ partly ☐ no —**

**coffey_hawley_2007** — The molecular bases of training adaptation · Coffey VG, Hawley JA · 2007

- *concurrent-strength-maintenance says it supports:* Foundational integrative review of concurrent-training mechanism
- **Does it? ☐ yes ☐ partly ☐ no —**

**coyle_1984** — Time course of loss of adaptations after stopping prolonged intense endurance training · Coyle EF, Martin WH, Sinacore DR, Joyner MJ, Hagberg JM, Holloszy JO · 1984

- *rowing-2k-test-prep says it supports:* Detraining timeline informs taper depth
- *concurrent-strength-maintenance says it supports:* Detraining timeline — VO2max −7% at 12 days, informs deload week planning
- **Does it? ☐ yes ☐ partly ☐ no —**

**doma_2019** — Implications of impaired endurance performance following single bouts of resistance training · Doma K, Deakin GB, Bentley DJ · 2019

- *concurrent-strength-maintenance says it supports:* Bidirectional damage — running-induced damage impairs squat/deadlift 24-48h
- **Does it? ☐ yes ☐ partly ☐ no —**

**eddens_2018** — The role of intra-session exercise sequence in the interference effect: a systematic review with meta-analysis · Eddens L, van Someren K, Howatson G · 2018

- *rowing-2k-test-prep says it supports:* Lift-first same-day rule if athlete pairs strength + row
- *concurrent-strength-maintenance says it supports:* Lift-first rule: +6.91% lower-body dynamic strength gain (p=0.006)
- **Does it? ☐ yes ☐ partly ☐ no —**

**faude_2009** — Lactate threshold concepts: how valid are they? · Faude O, Kindermann W, Meyer T · 2009

- *rowing-2k-test-prep says it supports:* Threshold definitions — informs retest_metric.source_ref
- **Does it? ☐ yes ☐ partly ☐ no —**

**feito_2018** — High-Intensity Functional Training (HIFT): definition and research implications for improved fitness · Feito Y, Heinrich KM, Butcher SJ, Poston WSC · 2018

- *concurrent-strength-maintenance says it supports:* 16 wk HIFT — strength AND VO2max improved concurrently
- **Does it? ☐ yes ☐ partly ☐ no —**

**fyfe_2016** — Endurance training intensity does not mediate interference to maximal lower-body strength gain during short-term concurrent training · Fyfe JJ, Bishop DJ, Zacharewicz E, et al. · 2016

- *concurrent-strength-maintenance says it supports:* Endurance INTENSITY does not mediate interference — VOLUME does
- **Does it? ☐ yes ☐ partly ☐ no —**

**fyfe_bishop_stepto_2014** — Interference between concurrent resistance and endurance exercise · Fyfe JJ, Bishop DJ, Stepto NK · 2014

- *concurrent-strength-maintenance says it supports:* Definitive mechanism review + modulators
- **Does it? ☐ yes ☐ partly ☐ no —**

**hagerman_1994** — Physiology of competitive rowing · Hagerman FC · 1994

- *rowing-2k-test-prep says it supports:* Rowing-specific physiology overview
- **Does it? ☐ yes ☐ partly ☐ no —**

**helgerud_2007** — Aerobic high-intensity intervals improve VO2max more than moderate training · Helgerud J, Høydal K, Wang E, et al. · 2007

- *rowing-2k-test-prep says it supports:* The 4×4 protocol; VO2max response reference
- *concurrent-strength-maintenance says it supports:* The 4×4 protocol; +7.2% VO2max in 8 wk
- **Does it? ☐ yes ☐ partly ☐ no —**

**henry_1968** — Specificity vs generality in learning motor skill · Henry FM · 1968

- *rowing-2k-test-prep says it supports:* Task-specificity foundation
- **Does it? ☐ yes ☐ partly ☐ no —**

**impey_2018** — Fuel for the work required: a theoretical framework for carbohydrate periodization and the glycogen threshold hypothesis · Impey SG, Hearris MA, Hammond KM, et al. · 2018

- *concurrent-strength-maintenance says it supports:* Fuel-for-work framework for concurrent programming
- **Does it? ☐ yes ☐ partly ☐ no —**

**jager_2017** — International Society of Sports Nutrition position stand: protein and exercise · Jäger R, Kerksick CM, Campbell BI, et al. · 2017

- *concurrent-strength-maintenance says it supports:* 1.4-2.0 g/kg/day for exercising individuals
- **Does it? ☐ yes ☐ partly ☐ no —**

**joyner_coyle_2008** — Endurance exercise performance: the physiology of champions · Joyner MJ, Coyle EF · 2008

- *rowing-2k-test-prep says it supports:* Threshold > VO2max as primary metric to track
- *concurrent-strength-maintenance says it supports:* Threshold > VO2max as primary metric to track
- **Does it? ☐ yes ☐ partly ☐ no —**

**kilding_2012** — Investigation of the maximal lactate steady state (MLSS) in trained runners · Kilding AE, Winter EM, Fysh M · 2012

- *rowing-2k-test-prep says it supports:* MLSS validity for threshold prescription
- **Does it? ☐ yes ☐ partly ☐ no —**

**laursen_jenkins_2002** — The scientific basis for high-intensity interval training · Laursen PB, Jenkins DG · 2002

- *rowing-2k-test-prep says it supports:* HIT rationale in trained endurance athletes
- **Does it? ☐ yes ☐ partly ☐ no —**

**meyer_morrison_zuniga_2017** — The benefits and risks of CrossFit: a systematic review · Meyer J, Morrison J, Zuniga J · 2017

- *concurrent-strength-maintenance says it supports:* 10-week CrossFit — VO2max + body comp + strength all improve concurrently
- **Does it? ☐ yes ☐ partly ☐ no —**

**midgley_2007** — Is there an optimal training intensity for enhancing the maximal oxygen uptake of distance runners? · Midgley AW, McNaughton LR, Wilkinson M · 2007

- *rowing-2k-test-prep says it supports:* Intensity distribution meta for endurance
- **Does it? ☐ yes ☐ partly ☐ no —**

**mikulic_2011** — Maturation to elite status: a six-year physiological case study of a world champion rowing crew · Mikulic P · 2011

- *rowing-2k-test-prep says it supports:* Elite rower development trajectory context
- **Does it? ☐ yes ☐ partly ☐ no —**

**morton_2018** — A systematic review, meta-analysis and meta-regression of the effect of protein supplementation on resistance training-induced gains in muscle mass and strength in healthy adults · Morton RW, Murphy KT, McKellar SR, et al. · 2018

- *concurrent-strength-maintenance says it supports:* Protein floor: no further hypertrophy benefit above 1.62 g/kg/day
- **Does it? ☐ yes ☐ partly ☐ no —**

**mujika_padilla_2000_a** — Detraining: loss of training-induced physiological and performance adaptations. Part I · Mujika I, Padilla S · 2000

- *rowing-2k-test-prep says it supports:* Detraining timeline — informs taper design
- **Does it? ☐ yes ☐ partly ☐ no —**

**mujika_padilla_2000_b** — Detraining: loss of training-induced physiological and performance adaptations. Part II · Mujika I, Padilla S · 2000

- *rowing-2k-test-prep says it supports:* Taper effect — ~3% performance uplift from volume down 40-60%
- **Does it? ☐ yes ☐ partly ☐ no —**

**murach_bagley_2016** — Skeletal muscle hypertrophy with concurrent exercise training · Murach KA, Bagley JR · 2016

- *concurrent-strength-maintenance says it supports:* Contrary evidence — hypertrophy not consistently reduced in ecologically valid protocols
- **Does it? ☐ yes ☐ partly ☐ no —**

**petre_2018** — The Effect of Two Different Concurrent Training Programs on Strength and Power Gains in Highly-Trained Individuals · Petré H, Löfving P, Psilander N · 2018

- *concurrent-strength-maintenance says it supports:* Trained lifters: HIIT vs continuous produced same squat gains
- **Does it? ☐ yes ☐ partly ☐ no —**

**proteau_1992** — Specificity of practice: the case of the goal-directed aiming task · Proteau L, Marteniuk RG, Lévesque L · 1992

- *rowing-2k-test-prep says it supports:* Specificity of practice — race-pace work rationale. Title/source corrected 2026-08-18 (Path A Q2).
- **Does it? ☐ yes ☐ partly ☐ no —**

**robineau_2016** — Specific training effects of concurrent aerobic and strength exercises depend on recovery duration · Robineau J, Babault N, Piscione J, Lacome M, Bigard AX · 2016

- *concurrent-strength-maintenance says it supports:* The 6h separation dose-response — the key rule the program applies
- **Does it? ☐ yes ☐ partly ☐ no —**

**ross_2015** — Separate effects of intensity and amount of exercise on interindividual cardiorespiratory fitness response · Ross R, Goodpaster BH, Koch LG, et al. · 2015

- *rowing-2k-test-prep says it supports:* Non-response drops at higher intensity — race-prep intensity distribution rationale
- *concurrent-strength-maintenance says it supports:* Non-response drops from 50% intensity to 0% at 75% — often dose, not genotype
- **Does it? ☐ yes ☐ partly ☐ no —**

**san_millan_brooks_2018** — Assessment of metabolic flexibility by means of measuring blood lactate, fat and carbohydrate oxidation responses · San-Millán I, Brooks GA · 2018

- *rowing-2k-test-prep says it supports:* Zone 2 anchor (blood lactate < 2 mmol/L)
- *concurrent-strength-maintenance says it supports:* Zone 2 = lactate <2 mmol/L; substrate oxidation
- **Does it? ☐ yes ☐ partly ☐ no —**

**schumann_2022** — Compatibility of concurrent aerobic and strength training for skeletal muscle size and function: an updated systematic review and meta-analysis · Schumann M, Feuerbacher JF, Sünkeler M, et al. · 2022

- *concurrent-strength-maintenance says it supports:* The updated meta — max strength SMD −0.06 (n.s.), hypertrophy SMD −0.01 (n.s.), explosive strength SMD −0.28 (p=0.007). The reconciliation.
- **Does it? ☐ yes ☐ partly ☐ no —**

**seiler_2010** — What is best practice for training intensity and duration distribution in endurance athletes? · Seiler S · 2010

- *rowing-2k-test-prep says it supports:* Polarised 80/20 distribution. Note: Seiler's original prescription was for general endurance blocks. Our race-prep application (20% of hard work split between threshold and race pace) is a race-prep adaptation of the polarised model, not the base-block Seiler distribution.
- *concurrent-strength-maintenance says it supports:* Polarised training model (80/20 low/high)
- **Does it? ☐ yes ☐ partly ☐ no —**

**steinacker_1993** — Physiological aspects of training in rowing · Steinacker JM · 1993

- *rowing-2k-test-prep says it supports:* Rowing-specific interval + volume prescription
- **Does it? ☐ yes ☐ partly ☐ no —**

**steinacker_1998** — Training of rowers before world championships · Steinacker JM, Lormes W, Lehmann M, Altenburg D · 1998

- *rowing-2k-test-prep says it supports:* Rowing-specific physiological profile in elite rowers preparing for world championships. Replaced das_2019 as a stronger anchor for the metabolic-profile claims (Path A Q5).
- **Does it? ☐ yes ☐ partly ☐ no —**

**wilson_2012** — Concurrent training: a meta-analysis examining interference of aerobic and resistance exercises · Wilson JM, Marin PJ, Rhea MR, et al. · 2012

- *rowing-2k-test-prep says it supports:* Modality-interference rationale. Wilson's meta measured cycling and running against strength; rowing was not a primary studied modality. Terav infers rowing sits close to cycling on the interference gradient (non-eccentric, seated) — an engineering extrapolation, not a directly measured Wilson finding.
- *concurrent-strength-maintenance says it supports:* The interference numbers — strength ES −18%, hypertrophy −31%, power −40%. Frequency + duration + modality dose-response.
- **Does it? ☐ yes ☐ partly ☐ no —**

**wisloff_2007** — Superior cardiovascular effect of aerobic interval training versus moderate continuous training in heart failure patients: a randomized study · Wisløff U, Støylen A, Loennechen JP, et al. · 2007

- *rowing-2k-test-prep says it supports:* Stroke volume response reference
- *concurrent-strength-maintenance says it supports:* Interval-vs-continuous SV response; 46% vs 14%
- **Does it? ☐ yes ☐ partly ☐ no —**


---

## Sign-off

- Name and credential:
- Date reviewed:
- Anything you did **not** review (out of your domain):
- Overall: ☐ ships as-is ☐ ships with the changes flagged ☐ do not ship until fixed
