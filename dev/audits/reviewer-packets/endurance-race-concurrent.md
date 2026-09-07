# Reviewer packet — Race prep & concurrent training

**Generated 2026-09-07 from the shipping program data.** Regenerate with
`python3 dev/scripts/build-reviewer-packet.py`; do not edit by hand, or it
will start describing a program that no longer ships.

<!-- source-fingerprint: 165e7d409efe2b60 -->

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
- **Threshold build · Weeks 3–4** (2 wks) — Push threshold pace up. Add one race-pace session per week.
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

- *concurrent-strength-maintenance says it supports:* Nutrient timing around a single resistance bout: the review argues the post-exercise anabolic window is not universally narrow and urgent, and recommends that pre- and post-exercise meals not be separated by more than roughly 3-4 hours, extendable to 5-6 hours when protein arrives in large mixed meals. Cited here only for that feeding-interval finding. Engineering choice: the paper says nothing about spacing an endurance session from a strength session, so it does not license the 6h session-separation rule; that rule rests on Robineau 2016. Corrected 2026-09-05: the previous string read 'Anabolic window is 4-6h, not 30 min - supports 6h separation compatibility', which misstated the paper's number (3-4h default, 5-6h only with large mixed meals) and borrowed a meal-timing finding for a session-spacing construct the paper never addresses.
- **Does it? ☐ yes ☐ partly ☐ no —**

**astorino_2013** — Effect of high-intensity interval training on cardiovascular function, VO2max, and muscular force · Astorino TA, Allen RP, Roberson DW, Jurancich M · 2012

- *rowing-2k-test-prep says it supports:* HIIT (six sessions of repeated Wingate tests over 2-3 weeks) raised VO2max, O2 pulse and power output in 20 active young men and women. Cited here only for the general responsiveness of aerobic capacity to short high-intensity work. Corrected 2026-09-05 — it previously claimed a 3-6% threshold-pace shift in trained cyclists, which this study does not contain.
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

**berryman_2018** — Effects of short-term concurrent training cessation on the energy cost of running and neuromuscular performances in middle-distance runners · Berryman N, Mujika I, Bosquet L · 2020

- *concurrent-strength-maintenance says it supports:* Short-term cessation of explosive strength training in middle-distance runners (n=8): the improvement in the energy cost of running achieved during the intervention (-5.75%) was maintained after the strength work was interrupted (-6.31%). The authors themselves caution that the low sample size and the very limited literature in this area mean the result should be interpreted cautiously. Engineering choice: Terav reads a running-side sensitivity out of this and prefers cycling and rowing as the concurrent partner modality; the paper compares no modalities and does not support that preference - see engineering_choices_flagged. Wilson 2012 carries the direct concurrent-interference evidence. Corrected 2026-09-05: the citation record was a chimera of two Berryman papers and has been repointed to the cessation study (Sports 2020;9(1):1); the previous string also cited Doma 2019 as carrying direct interference evidence, which it does not - see that entry.
- **Does it? ☐ yes ☐ partly ☐ no —**

**billat_2000** — Interval training for performance: a scientific and empirical practice. Special recommendations for middle- and long-distance running. Part I: aerobic interval training · Billat V · 2000

- *rowing-2k-test-prep says it supports:* Aerobic interval prescription
- **Does it? ☐ yes ☐ partly ☐ no —**

**billat_2001** — The concept of maximal lactate steady state: a bridge between biochemistry, physiology and sport science · Billat VL, Sirvent P, Py G, Koralsztein JP, Mercier J · 2003

- *rowing-2k-test-prep says it supports:* MLSS as threshold intensity target
- **Does it? ☐ yes ☐ partly ☐ no —**

**bishop_2008** — Repeated-sprint ability - Part II: recommendations for training · Bishop D, Girard O, Mendez-Villanueva A · 2008

- *rowing-2k-test-prep says it supports:* Repeated-sprint-ability programming. Note (2026-08-17 review): RSA is not the correct energy-system framing for 6×500m at 2K pace. Buchheit & Laursen 2013 covers this better; kept in the library but the race-pace justification now defers to Buchheit & Laursen.
- **Does it? ☐ yes ☐ partly ☐ no —**

**bosquet_2007** — Effects of tapering on performance: a meta-analysis · Bosquet L, Montpetit J, Arvisais D, Mujika I · 2007

- *rowing-2k-test-prep says it supports:* Meta-analysis of 27 tapering studies (from 182 screened). It supports the structure of the taper week as prescribed here, verbatim: a 2-week taper (overall effect 0.59 +/- 0.33, p < 0.001) in which training volume is decreased exponentially by 41-60% (overall effect 0.72 +/- 0.36, p < 0.001) with no change to training intensity or frequency. Corrected 2026-09-05: this reference previously called the paper 'the stronger single-source anchor' for a ~3% performance uplift. The paper reports standardised effect sizes, not percentages, and no 3% figure appears anywhere in its retrievable record; the same 3% is attributed elsewhere in this programme to Mujika & Padilla 2000, so the anchor claim was circular. Full text is closed and could not be checked, so the number is unconfirmed rather than disproved. What is cited is the taper structure; any percentage shown to a user should read as Terav's own expectation, not as a measured meta-analytic result.
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

- *concurrent-strength-maintenance says it supports:* CrossFit Total = strongest Fran/Grace predictor — strength floor matters. (Note: this paper is ALSO in citations.json as butcher_2015_crossfit; one paper, two ids.)
- **Does it? ☐ yes ☐ partly ☐ no —**

**coffey_hawley_2007** — The molecular bases of training adaptation · Coffey VG, Hawley JA · 2007

- *concurrent-strength-maintenance says it supports:* Foundational integrative review of concurrent-training mechanism
- **Does it? ☐ yes ☐ partly ☐ no —**

**coyle_1984** — Time course of loss of adaptations after stopping prolonged intense endurance training · Coyle EF, Martin WH, Sinacore DR, Joyner MJ, Hagberg JM, Holloszy JO · 1984

- *rowing-2k-test-prep says it supports:* Detraining timeline after complete cessation of training in 7 endurance-trained subjects: VO2max declined 7% over the first 21 days of inactivity and stabilised after 56 days at 16% below the trained value. Engineering choice: taper depth is a reduced-training decision and this paper measures cessation, so it bounds how much can be lost during an unplanned break rather than telling you how far to taper. Corrected 2026-09-05: the previous string, 'Detraining timeline informs taper depth', implied the paper speaks to tapering; it does not, and the sibling programmes' '-7% at 12 days' figure was also wrong (7% is at 21 days; 12 days is the oxidative-enzyme decline half-time).
- *concurrent-strength-maintenance says it supports:* Detraining timeline after COMPLETE cessation of training in 7 endurance-trained subjects: VO2max declined 7% over the first 21 days of inactivity and stabilised after 56 days at 16% below the trained value. Engineering choice: a deload week is reduced training, not cessation, so this curve informs the concept of how fast aerobic adaptation is lost but does not set a deload dose. Corrected 2026-09-05: the previous string read 'VO2max -7% at 12 days'. The 7% figure is at 21 days; 12 days is this paper's half-time for the decline in citrate synthase and succinate dehydrogenase activity, a different quantity.
- **Does it? ☐ yes ☐ partly ☐ no —**

**doma_2019** — Training considerations for optimising endurance development: an alternate concurrent training perspective · Doma K, Deakin GB, Schumann M, Bentley DJ · 2019

- *concurrent-strength-maintenance says it supports:* Resistance-to-endurance interference: there is a growing body of research indicating that typical resistance exercises impair neuromuscular function and endurance performance during periods of resistance-training-induced muscle damage. That is the direction this paper establishes, and the only direction cited here. Engineering choice: the row-not-run modality preference is a programming judgement; neither this paper nor its 2017 companion establishes that endurance-induced damage impairs subsequent squat or deadlift force, and neither states a 24-48h window for that direction. Wilson 2012 carries the modality-interference evidence. Corrected 2026-09-05: the previous string read 'Bidirectional damage - running-induced damage impairs squat/deadlift 24-48h', which runs the opposite causal direction to the paper. The record was also a chimera of two Doma papers and has been repointed to Sports Med 2019;49(5):669-682, whose title and four-author byline differ from what was shipped. The same reversed claim appears in principles[3].detail, session_rationale.why_row_not_run and engineering_choices_flagged[5].rationale and needs the same correction there.
- **Does it? ☐ yes ☐ partly ☐ no —**

**eddens_2018** — The role of intra-session exercise sequence in the interference effect: a systematic review with meta-analysis · Eddens L, van Someren K, Howatson G · 2018

- *rowing-2k-test-prep says it supports:* Lift-first same-day rule if athlete pairs strength + row
- *concurrent-strength-maintenance says it supports:* Lift-first rule: +6.91% lower-body dynamic strength gain (p=0.006)
- **Does it? ☐ yes ☐ partly ☐ no —**

**faude_2009** — Lactate threshold concepts: how valid are they? · Faude O, Kindermann W, Meyer T · 2009

- *rowing-2k-test-prep says it supports:* Threshold definitions — informs retest_metric.source_ref
- **Does it? ☐ yes ☐ partly ☐ no —**

**feito_2018** — High-Intensity Functional Training (HIFT): definition and research implications for improved fitness · Feito Y, Heinrich KM, Butcher SJ, Poston WSC · 2018

- *concurrent-strength-maintenance says it supports:* Definitional review of high-intensity functional training. Its 16-week sentence reports VO2max up about 12%, body fat down about 8% and bone mineral content up about 1%; it reports no strength outcome, and it is a review rather than a trial. Corrected 2026-09-05: this read '16 wk HIFT - strength AND VO2max improved concurrently'. That is not in this paper, and no single cited paper shows both: the strength result comes from a different 2018 paper by the same first author (Feito Y, Hoffstetter W, Serafini P, Mangine G, PLoS ONE 13:e0198324), which measured 5RM strength and WOD performance but not VO2max. This programme's headline premise - strength held while aerobic capacity rises - is currently an engineering choice supported by two separate half-results, not a demonstrated concurrent outcome.
- **Does it? ☐ yes ☐ partly ☐ no —**

**fyfe_2014** — Interference between concurrent resistance and endurance exercise: molecular bases and the role of individual training variables · Fyfe JJ, Bishop DJ, Stepto NK · 2014

- *concurrent-strength-maintenance says it supports:* Definitive mechanism review + modulators
- **Does it? ☐ yes ☐ partly ☐ no —**

**fyfe_2016** — Endurance training intensity does not mediate interference to maximal lower-body strength gain during short-term concurrent training · Fyfe JJ, Bartlett JD, Hanson ED, Stepto NK, Bishop DJ · 2016

- *concurrent-strength-maintenance says it supports:* Eight weeks of concurrent training in 23 recreationally active men: HIT+RT and WORK-MATCHED MICT+RT attenuated maximal lower-body strength gain similarly relative to resistance training alone (7.4% vs 8.2%, a difference of about 0.8 points), so endurance INTENSITY is not a critical mediator of interference to maximal strength gain over the short term. Corrected 2026-09-05: three things were wrong here. The title was that of a DIFFERENT Fyfe 2016 paper (the mTORC1 / microRNA study, which is in Am J Physiol Regul Integr Comp Physiol 310:R1297-R1311, not Front Physiol 7:487), pinned onto this paper's journal, volume and page. The byline was that same other paper's (Bishop DJ, Zacharewicz E); the correct byline is Fyfe JJ, Bartlett JD, Hanson ED, Stepto NK, Bishop DJ. And 'VOLUME does' is not supported: the endurance arms were work-matched, so volume was held constant and never varied. Of the pair 'cap total endurance minutes; don't fear intensity per session', the second half is the finding and the first is an engineering choice.
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

- *concurrent-strength-maintenance says it supports:* Theoretical framework for carbohydrate periodisation - the 'fuel for the work required' paradigm - developed for ENDURANCE training. Corrected 2026-09-05: this read 'fuel-for-work framework for concurrent programming'. The paper makes no concurrent-training application: every train-low model it reviews is an endurance protocol and its outcomes are oxidative enzymes and endurance performance. Applying the framework to a concurrent week is an engineering choice. The paper's own caveat, unrecorded until now, is that 37% of 11 studies showed a performance improvement and 63% showed no change.
- **Does it? ☐ yes ☐ partly ☐ no —**

**jager_2017** — International Society of Sports Nutrition position stand: protein and exercise · Jäger R, Kerksick CM, Campbell BI, et al. · 2017

- *concurrent-strength-maintenance says it supports:* 1.4-2.0 g/kg/day for exercising individuals
- **Does it? ☐ yes ☐ partly ☐ no —**

**joyner_coyle_2008** — Endurance exercise performance: the physiology of champions · Joyner MJ, Coyle EF · 2008

- *rowing-2k-test-prep says it supports:* Models endurance performance as VO2max, lactate threshold and efficiency INTERACTING multiplicatively, and states that the oxidative capacity underlying the lactate threshold is 'highly plastic' and can more than double with appropriate training. Corrected 2026-09-05: this read 'Threshold > VO2max as primary metric to track'. The paper ranks no determinant above another and does not frame any as a metric to track; the word 'plateau' does not occur in it, so the 'post-VO2max ceiling' and 'VO2max plateaus much earlier' framings elsewhere in this file are not its language. It also contains no threshold-shift magnitude of any kind - the only numeric change figures in it are efficiency case reports (about 1-3% per year) and a greater-than-twofold oxidative-capacity figure - which is consistent with this file's existing decision on 2026-09-05 to attach no numeric target to threshold. Training threshold first is an engineering choice; this paper supports that threshold is highly trainable.
- *concurrent-strength-maintenance says it supports:* Models endurance performance as VO2max, lactate threshold and efficiency INTERACTING multiplicatively (marathon speed 'essentially predicted by' VO2max x lactate threshold percentage x running economy), and states that the oxidative capacity underlying the lactate threshold is 'highly plastic' and can more than double with training. Corrected 2026-09-05: this read 'Threshold > VO2max as primary metric to track'. The paper ranks no determinant above another and frames none of the three as a metric to track; it also contains no threshold-change magnitude, and the word 'plateau' does not occur in it. Using pre/post submaximal HR at fixed pace as a threshold-shift proxy remains a defensible engineering choice; this paper establishes that the threshold is trainable, not that it should be the primary metric.
- **Does it? ☐ yes ☐ partly ☐ no —**

**kilding_2012** — Investigation of the maximal lactate steady state (MLSS) in trained runners · Kilding AE, Winter EM, Fysh M · 2012

- *rowing-2k-test-prep says it supports:* MLSS validity for threshold prescription
- **Does it? ☐ yes ☐ partly ☐ no —**

**laursen_jenkins_2002** — The scientific basis for high-intensity interval training · Laursen PB, Jenkins DG · 2002

- *rowing-2k-test-prep says it supports:* HIT rationale in trained endurance athletes
- **Does it? ☐ yes ☐ partly ☐ no —**

**meyer_morrison_zuniga_2017** — The benefits and risks of CrossFit: a systematic review · Meyer J, Morrison J, Zuniga J · 2017

- *concurrent-strength-maintenance says it supports:* Systematic review of 13 studies (N = 2,326 adults) concluding that CrossFit 'is comparable to other exercise programs with similar injury rates and health outcomes', and that previous injuries should be assessed before recommending it. Corrected 2026-09-05: this read '10-week CrossFit - VO2max + body comp + strength all improve concurrently'. The retrieved record contains no 10-week trial and no VO2max, body-composition or strength figure; the full text is paywalled, so the sentence cannot be excluded from the body, only shown to be unsupported by anything retrievable. Any such result belongs to one of the thirteen primary studies inside the review, and that primary study is what would have to be cited. Nothing rendered in this programme currently rests on the withdrawn claim.
- **Does it? ☐ yes ☐ partly ☐ no —**

**midgley_2007** — Training to enhance the physiological determinants of long-distance running performance · Midgley AW, McNaughton LR, Jones AM · 2007

- *rowing-2k-test-prep says it supports:* Narrative review of training to enhance the physiological determinants of long-distance running performance, concluding that 'there is insufficient direct scientific evidence to formulate training recommendations based on the limited research' and that scientists should be cautious giving training recommendations from it. Corrected 2026-09-05: this read 'intensity distribution meta for endurance', and the record identified no single real work. The title and the Wilkinson byline belong to Midgley AW, McNaughton LR, Wilkinson M (2006), Sports Med 36(2):117-132 (PMID 16464121); the year, volume and pages belong to Midgley AW, McNaughton LR, Jones AM (2007), Sports Med 37(10):857-880 (PMID 17887811, erratum Sports Med 2007;37(11):1000). The canonical record now serves the 2007 paper matching the locator. Neither candidate is a meta-analysis and neither pools effect sizes, so there is no intensity-distribution meta here; the 2007 paper argues the evidence base is too thin to prescribe from, which points against using it as a warrant for an intensity distribution. This programme's intensity distribution is currently an engineering choice.
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

**mujika_padilla_2000_b** — Detraining: loss of training-induced physiological and performance adaptations. Part II: long term insufficient training stimulus · Mujika I, Padilla S · 2000

- *rowing-2k-test-prep says it supports:* Detraining review, Part II (long term insufficient training stimulus): the losses it catalogues 'can be avoided or limited by reduced training strategies, as long as training intensity is maintained and frequency reduced only moderately', while 'training volume can be markedly reduced'. Corrected 2026-09-05: this read 'taper effect - ~3% performance uplift from volume down 40-60%'. Neither number is in the retrieved abstract, and this is a detraining review rather than a taper trial or meta-analysis. The 41-60% volume-reduction figure belongs to Bosquet et al. 2007 (PMID 17762369), which this file already credits correctly at the taper_last_week rule, and Bosquet reports the taper benefit as a standardised mean difference (overall about 0.59 for a two-week taper), not as a percentage - so no retrieved source supports '~3%'. What survives is the qualitative rule: hold intensity, reduce frequency only moderately, cut volume markedly. The magnitudes are withdrawn. Full text of Part II is paywalled; the abstract only was checked.
- **Does it? ☐ yes ☐ partly ☐ no —**

**murach_bagley_2016** — Skeletal muscle hypertrophy with concurrent exercise training · Murach KA, Bagley JR · 2016

- *concurrent-strength-maintenance says it supports:* Contrary evidence — hypertrophy not consistently reduced in ecologically valid protocols
- **Does it? ☐ yes ☐ partly ☐ no —**

**petre_2018** — The Effect of Two Different Concurrent Training Programs on Strength and Power Gains in Highly-Trained Individuals · Petré H, Löfving P, Psilander N · 2018

- *concurrent-strength-maintenance says it supports:* n=16 highly-trained ice-hockey and rugby players, 6 weeks, endurance performed after resistance: parallel squat improved in both arms (RT+continuous 12 +/- 8 percent, RT+HIIT 14 +/- 10 percent, both p<0.01) with no difference between them. Read narrowly this says the choice between HIIT and continuous cardio did not cost squat gains in that cohort over that window; it does not say concurrent training is free. Applying it to CSM users, who are not necessarily at that training level and who run longer blocks, is an engineering choice. Corrected 2026-09-05: the record's authors and title belonged to Petre 2021, Sports Med 51(5):991-1010 (PMID 33751469), a meta-analysis whose trained subgroup reports the opposite direction (leg press and squat 1RM negatively affected, ES -0.35); the locator and this claim belong to Petre, Lofving and Psilander 2018, JSSM 17(2):167-173, PMID 29769816.
- **Does it? ☐ yes ☐ partly ☐ no —**

**proteau_1992** — A sensorimotor basis for motor learning: evidence indicating specificity of practice · Proteau L, Marteniuk RG, Lévesque L · 1992

- *rowing-2k-test-prep says it supports:* Laboratory manual-aiming task with and without vision of the limb; the authors conclude that learning is specific to the conditions that prevail during skill acquisition. Race-pace work is a reasonable application of that principle and an engineering choice: nothing in this paper concerns rowing, pacing or endurance. Corrected 2026-09-05: the 2026-08-18 correction this record recorded moved it from the real Q J Exp Psychol A 44(3):557-575 paper (PMID 1631322) onto Journal of Motor Behavior 24(1):81-104, which four search routes could not find to exist, and this programme copied that fabricated locator.
- **Does it? ☐ yes ☐ partly ☐ no —**

**robineau_2016** — Specific training effects of concurrent aerobic and strength exercises depend on recovery duration · Robineau J, Babault N, Piscione J, Lacome M, Bigard AX · 2016

- *concurrent-strength-maintenance says it supports:* The 6h separation dose-response — the key rule the program applies
- **Does it? ☐ yes ☐ partly ☐ no —**

**ross_2015** — Separate effects of intensity and amount of exercise on interindividual cardiorespiratory fitness response · Ross R, Goodpaster BH, Koch LG, et al. · 2015

- *rowing-2k-test-prep says it supports:* Non-response drops at higher intensity — race-prep intensity distribution rationale
- *concurrent-strength-maintenance says it supports:* Non-response drops from 50% intensity to 0% at 75% — often dose, not genotype
- **Does it? ☐ yes ☐ partly ☐ no —**

**san_millan_brooks_2018** — Assessment of metabolic flexibility by means of measuring blood lactate, fat and carbohydrate oxidation responses · San-Millán I, Brooks GA · 2018

- *rowing-2k-test-prep says it supports:* Substrate-oxidation basis for an easy-effort zone: fat oxidation and blood lactate move inversely across professional athletes, moderately active individuals and metabolic-syndrome patients. The under-2 mmol/L figure is coaching convention for placing that zone, not a boundary defined in this paper, and no user of this programme measures lactate. Corrected 2026-09-05: the used_for presented a numeric lactate cut-point as this paper's Zone 2 definition; nothing retrieved from the paper contains it.
- *concurrent-strength-maintenance says it supports:* Indirect calorimetry and blood lactate in professional endurance athletes, moderately active individuals and metabolic-syndrome patients: fat oxidation was higher and lactate lower in the athletes, and the two were inversely correlated within every group (professionals r=-0.97). That is the substrate-oxidation basis for an easy-effort zone. The 2 mmol/L number is coaching convention used to place the zone in practice, not a boundary this paper defines. Corrected 2026-09-05: the used_for stated Zone 2 = lactate under 2 mmol/L as this paper's definition; nothing retrieved from it contains that cut-point, and app users train the zone by heart rate or RPE with no lactate measurement at all.
- **Does it? ☐ yes ☐ partly ☐ no —**

**schumann_2022** — Compatibility of concurrent aerobic and strength training for skeletal muscle size and function: an updated systematic review and meta-analysis · Schumann M, Feuerbacher JF, Sünkeler M, et al. · 2022

- *concurrent-strength-maintenance says it supports:* The updated meta — max strength SMD −0.06 (n.s.), hypertrophy SMD −0.01 (n.s.), explosive strength SMD −0.28 (p=0.007). The reconciliation.
- **Does it? ☐ yes ☐ partly ☐ no —**

**seiler_2010** — What is best practice for training intensity and duration distribution in endurance athletes? · Seiler S · 2010

- *rowing-2k-test-prep says it supports:* Polarised 80/20 distribution. Note: Seiler's original prescription was for general endurance blocks. Our race-prep application (20% of hard work split between threshold and race pace) is a race-prep adaptation of the polarised model, not the base-block Seiler distribution.
- *concurrent-strength-maintenance says it supports:* Polarised training model (80/20 low/high)
- **Does it? ☐ yes ☐ partly ☐ no —**

**steinacker_1993** — Physiological aspects of training in rowing · Steinacker JM · 1993

- *rowing-2k-test-prep says it supports:* Descriptive review of international-level rowing practice: anaerobic threshold at 80-85 percent of maximal performance in highly trained rowers, 70-90 percent of training time below that threshold, and annual loads reaching 1000 hours or 5000-7000 km, with work above 4.0 mmol/L blood lactate plus sprint and athletics training completing the schedule. It describes what elite oarsmen do; it prescribes nothing, and a test-prep user is not an elite oarsman, so applying the distribution here is a coaching judgement. Corrected 2026-09-05: the used_for called a descriptive review a rowing-specific interval and volume prescription, and the record's only locator was a PubMed search query; it is PMID 8262704, Int J Sports Med 14 Suppl 1:S3-10, and verification_status can now be cleared.
- **Does it? ☐ yes ☐ partly ☐ no —**

**steinacker_1998** — Training of rowers before world championships · Steinacker JM, Lormes W, Lehmann M, Altenburg D · 1998

- *rowing-2k-test-prep says it supports:* Rowing-specific physiological profile in elite rowers preparing for world championships. Replaced das_2019 as a stronger anchor for the metabolic-profile claims (Path A Q5). das_2019 was deleted from citations.json on 2026-09-05 — sourcing review found no such paper, and its url was a Google Scholar search rather than a record.
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
