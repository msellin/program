# Reviewer packet — Gymnastics & upper-body skill

**Generated 2026-09-07 from the shipping program data.** Regenerate with
`python3 dev/scripts/build-reviewer-packet.py`; do not edit by hand, or it
will start describing a program that no longer ships.

<!-- source-fingerprint: 10cf7a9199b3584a -->

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

A gymnastics or calisthenics coach, or a physiotherapist who works with overhead athletes.

## Time

About 90 minutes. The citation list is the bulk of it; skim anything
outside your domain and say so rather than guessing.

## What happens to your answers

Recorded in the program file as `specialist_review` — your name, credential,
date and scope, plus every change you asked for and whether we made it. That
record is public. If we disagree with something you flag, the disagreement
is published too, not quietly dropped.

---

## first-strict-pullup

**Goal the program sells:** Strict pull-up max reps — target 1 reps, stretch 5.

**What it tells users it does:** Multi-tier skill program on the shared pull drill library. Grip → scap → negative → band → unassisted, then volume. Personalised sessions target your weakest sub-capability first.

**What it promises by the end:** Beginners: 25-45 second dead hang, clean scap pulls, first ring rows. Assisted-only lifters: first strict rep from a 10-second negative. First-repper: 3-5 unbroken. Volume tier: 8-10 unbroken with wide-grip variety unlocked.

### Entry tiers

- **tier_a_hang** — Tier A — No hang yet. 

- **tier_b_assisted** — Tier B — Hang established, no strict rep yet. 

- **tier_c_first_rep** — Tier C — One strict rep, building the second. 

- **tier_d_volume** — Tier D — Multiple reps, adding volume. 


### Phases and what each is for

- **Weeks 1-4 — Hang, scap, row base (Tier A)** (4 wks) — Build the grip + scap prerequisites. Dead hang to 25+ seconds, first clean scap pulls, ring rows built to 8-10 clean reps.
  - Method note: Blocked practice weeks 1-2 (Wulf & Shea 2002): hang session, scap session, row session on separate days. Weeks 3-4 combine two capabilities per session as capability levels rise.
- **Weeks 1-8 — Negatives + heavy-band assist (Tier B)** (8 wks) — Groove the pull pattern via 5-10s negatives + heavy-band assistance. Test a strict rep from week 5 onward.
  - Method note: Blocked practice weeks 1-2 (Wulf & Shea 2002); interleaved from week 3. Negatives are the primary driver (Roig 2009 eccentric-heavy meta).
- **Weeks 1-8 — First unbroken set + grease the groove (Tier C)** (8 wks) — Extend 1-2 rep max to 3-5 unbroken. Introduce sub-maximal singles across the day.
  - Method note: Interleaved from week 1 (past acquisition stage). Sub-maximal doubles/triples at ~60-70% max as primary driver. Grease-the-groove singles daily.
- **Weeks 1-8 — Volume + variety (Tier D)** (8 wks) — 3-5 rep max → 8-10 unbroken. Wide-grip and neutral-grip variants unlocked. Weighted single-preview at end of block.
  - Method note: Fully interleaved (random CI) from week 1. Variety of practice (Schmidt 1975 schema theory) via grip-width rotation.
- **Weeks 5-8 — Interleaved consolidation for all tiers** (4 wks) — Post-acquisition: engine interleaves 2-3 drills per session across the weakest capabilities.
  - Method note: Multi-dimensional generator picks from drill_library filtered by capability_profile. Weakest first (Henry 1968).

### What it retests, and how often

- **strict_pullup_max_reps** — Strict pull-up max reps (4-weekly)
- **dead_hang_max_seconds** — Dead hang (max seconds) (4-weekly)

### What it asks, and what each answer does

- **Realistically, how many days per week can you commit?**  
  `days_per_week` — answers: 2, 3, 4, 5
- **How many strict pull-ups can you do right now — no kip, no swing, full range from dead hang to chin over the bar?**  
  `current_strict_pullups` — answers: zero_no_hang, zero_can_hang, assisted_only, one_partial, one_two, three_five
- **How long can you passively dead hang from a pull-up bar (arms straight, no scap engagement, just hanging)?**  
  `dead_hang_seconds_selfreport` — answers: under_10s, 10_20s, 20_45s, 45_60s, over_60s
- **How many strict feet-elevated ring rows can you do (feet on a box, body horizontal, pull chest to rings)?**  
  `ring_row_reps_selfreport` — answers: under_5, 5_10, 10_15, over_15
- **Have you had shoulder pain during any overhead pressing, pull-down, or hanging work in the last 12 months?**  
  `shoulder_pain_overhead`
- **Any elbow tendon pain (medial or lateral) currently or in the last 3 months?**  
  `elbow_tendon_pain` — answers: no, resolved, current
- **Do you have an acute shoulder injury (rotator cuff tear, labral tear, dislocation) in the last 6 months?**  
  `acute_shoulder_injury`
  - BLOCKS on ['true'] → "Wait for the acute injury to resolve"
- **Approximate bodyweight (kg) — used to shape band-tension progression**  
  `bodyweight_kg`
- **Persistent neck pain with numbness, tingling or weakness into the arm?**  
  `cervical_radiculopathy` — answers: no, unsure, yes
  - BLOCKS on ['yes'] → "Get the neck looked at first"
  - warns, then continues on ['unsure'] → "Worth finding out which it is"
- **Diagnosed high blood pressure that isn't currently controlled?**  
  `hypertension_valsalva` — answers: no, unsure, yes
  - BLOCKS on ['yes'] → "Get your blood pressure managed first"
  - warns, then continues on ['unsure'] → "Worth getting a blood-pressure reading"
- **I understand this program is a training template and not medical advice. I'll stop and see a clinician if shoulder or elbow pain persists after a session.**  
  `consent_symptom_data`

### Conditions the program says it should exclude

Printed against the questions above so you can see which are actually detectable.

- Shoulder pain during a hang or pull attempt — session ends immediately. Do not train through it. Conservative safety choice, not a cited finding: Reinold et al. 2007 (J Athl Train 42(4):464-469) is EMG in 22 asymptomatic subjects and reports no supraspinatus difference among the three exercises tested, so it describes cuff recruitment rather than licensing a stop rule.
- Acute rotator-cuff injury, labral tear, or shoulder dislocation in the last 6 months — dead hangs and pull-up attempts contraindicated until cleared by a clinician.
- Currently symptomatic medial or lateral elbow tendinopathy — defer heavy negatives and chinup variants. Use scap and row work only, and clear with a clinician for eccentric work.
- Persistent cervical radiculopathy — avoid dead hangs entirely; the traction can inflame nerve root symptoms.
- Uncontrolled hypertension with Valsalva concern — the top-position isometric hold provokes Valsalva. Use exhale-on-effort breathing or defer until controlled.

**Is anything missing — who should this refuse to take that it currently accepts? ☐ no ☐ yes —**


---

## muscle-up

**Goal the program sells:** Strict ring muscle-up (reps) — target 1 reps, stretch 3.

**What it tells users it does:** Multi-tier strict ring muscle-up program. False-grip base, transition mechanics, ring dip strength. Not for kipping muscle-ups — different skill, different program.

**What it promises by the end:** Prep tier: 3-5 strict ring dips, 15s false-grip hang. Transition tier: seated-band mastered, first low-ring muscle-up, first strict attempt week 8-10. First Rep tier: 2-3 strict ring muscle-ups unbroken with weighted-preview singles.

### Entry tiers

- **tier_a_prep** — Tier A — Prerequisites met, ring dips + false grip building. 

- **tier_b_transition** — Tier B — Transition drills unlocked. 

- **tier_c_first_rep** — Tier C — First strict rep hunt. 


### Phases and what each is for

- **Weeks 1-8 — Ring dip base + false-grip tolerance (Tier A)** (8 wks) — Build 3-5 strict ring dips + 15-second false-grip hang. No transition drills yet.
  - Method note: Blocked practice weeks 1-2, interleaved weeks 3+. Ring dip support hold + negative → full dip is the Tier A backbone.
- **Weeks 1-8 — Transition mechanics (Tier B)** (8 wks) — Groove the transition mechanic. Seated-band → low-ring → jump-assisted → first strict attempt week 8.
  - Method note: Weeks 1-2 blocked (each session focuses on one link of the chain), weeks 3+ interleaved. Transition negatives from support are the highest-transfer drill.
- **Weeks 1-8 — First rep consolidation (Tier C)** (8 wks) — 1 rep → 2-3 unbroken. Weighted preview from week 4.
  - Method note: Fully interleaved. Volume via low-ring reps + weighted dip / weighted false-grip pull-up. Weekly max-rep retest.

### What it retests, and how often

- **strict_ring_muscle_up_reps** — Strict ring muscle-up (max reps) (4-weekly)
- **false_grip_hang_max_seconds** — False-grip hang (max seconds) (4-weekly)
- **ring_dip_max_reps** — Strict ring dip (max reps) (4-weekly)

### What it asks, and what each answer does

- **Realistically, how many days per week can you commit?**  
  `days_per_week` — answers: 3, 4, 5
- **How many strict pull-ups can you do right now (no kip, no swing, dead hang to chin over bar)?**  
  `strict_pullup_count` — answers: under_3, 3_5, 6_10, over_10
  - BLOCKS on ['under_3'] → "Build the pull-up base first"
- **How many strict ring dips can you do (support position → full lockout → depth at 90° elbow → lockout)?**  
  `ring_dip_count` — answers: under_3, 3_5, 6_10, over_10
  - BLOCKS on ['under_3'] → "Build the ring-dip base first"
- **How long can you hold a false-grip dead hang (wrist on top of the ring, no thumb over)?**  
  `false_grip_hang_seconds_selfreport` — answers: never, under_5s, 5_15s, 15_30s, over_30s
- **Have you ever done a strict ring muscle-up?**  
  `muscle_up_experience` — answers: never, one_sometimes, one_reliable, multiple
- **Have you had shoulder pain during any overhead pressing, dip, or hanging work in the last 12 months?**  
  `shoulder_pain_overhead`
- **Any elbow tendon pain (medial or lateral) currently or in the last 3 months?**  
  `elbow_tendon_pain` — answers: no, resolved, current
- **Do you have an acute shoulder injury (rotator cuff tear, labral tear, dislocation) in the last 6 months?**  
  `acute_shoulder_injury`
  - BLOCKS on ['true'] → "Wait for the acute injury to resolve"
- **Persistent neck pain with numbness, tingling or weakness into the arm?**  
  `cervical_radiculopathy` — answers: no, unsure, yes
  - BLOCKS on ['yes'] → "Get the neck looked at first"
  - warns, then continues on ['unsure'] → "Worth finding out which it is"
- **Wrist injury in the last 6 weeks — TFCC tear, ligament instability, or a sprain still settling?**  
  `acute_wrist_injury` — answers: no, unsure, yes
  - BLOCKS on ['yes'] → "Let the wrist settle first"
  - warns, then continues on ['unsure'] → "Ramp the false grip, don't rush it"
- **Diagnosed high blood pressure that isn't currently controlled?**  
  `hypertension_valsalva` — answers: no, unsure, yes
  - BLOCKS on ['yes'] → "Get your blood pressure managed first"
  - warns, then continues on ['unsure'] → "Worth getting a blood-pressure reading"
- **I understand this program is a training template and not medical advice. I'll stop and see a clinician if shoulder or elbow pain persists after a session.**  
  `consent_symptom_data`

### Conditions the program says it should exclude

Printed against the questions above so you can see which are actually detectable.

- Shoulder pain during a hang, transition, or support hold — session ends immediately. Do not train through it. Reinold 2007 supraspinatus load data + Sadowski 2021 straight-arm shoulder moment analog support the caution.
- Acute rotator-cuff injury, labral tear, or shoulder dislocation in the last 6 months — dead hangs, ring support, and transition attempts contraindicated until cleared.
- Currently symptomatic medial or lateral elbow tendinopathy — defer ring dip work and transition negatives. Use scap and hollow work only until cleared.
- Acute wrist injury (TFCC tear, ligament instability) in the last 6 weeks — false-grip work is prohibited; hollow + hang-only substitutes.
- Persistent cervical radiculopathy — avoid dead hangs and false-grip hangs entirely; the traction can inflame nerve root symptoms.
- Uncontrolled hypertension with Valsalva concern — the transition and support hold provoke Valsalva. Use exhale-on-effort breathing or defer until controlled.

**Is anything missing — who should this refuse to take that it currently accepts? ☐ no ☐ yes —**


---

## handstand-walk

**Goal the program sells:** Handstand composite (Block 1) — target 1 z-score composite of hold + walk + wrist tolerance, stretch 1.5.

**What it tells users it does:** Multi-tiered handstand walk program from wall-supported beginner to advanced turns and obstacles. Personalised sessions target your specific weak capabilities.

**What it promises by the end:** Block 1 of a multi-block arc. Beginners: consistent wall handstand + brief freestand attempts. Wall-holders: first freestand hold + first walk step. Freestanders: 3-5 continuous walk steps. Advanced: first pirouette or obstacle traverse.

### Entry tiers

- **tier_a_foundation** — Tier A — Foundation (no handstand yet). 

- **tier_b_wall_handstand** — Tier B — Wall handstand established. 

- **tier_c_freestand** — Tier C — Freestanding, learning to walk. 

- **tier_d_advanced** — Tier D — Advanced (walks 10m+, wants turns / obstacles). 


### Phases and what each is for

- **Week 0 — Exits before line** (1 wks) — Learn to fall on purpose before you learn to hold vertical. Fear-of-falling gates handstand progress more than physical capacity for most self-taught users.
- **Weeks 1-2 — Wrist prep + Kinoshita position ladder (blocked practice)** (2 wks) — Build wrist load tolerance base + first exposure to the Kinoshita position 1 and 2 holds. No wall handstand attempts yet for Tier A.
  - Method note: Blocked practice (Shea & Morgan 1979, Wulf & Shea 2002): one drill focus per session. Reduces cognitive load in acquisition.
- **Weeks 1-4 — Wall handstand established + first freestand attempts** (4 wks) — Consolidate the wall handstand shape, add balance-search (belly-to-wall), begin freestand kick-up attempts from week 3.
  - Method note: Week 1-2 blocked, week 3+ interleaves wall hold + freestand attempt in the same session.
- **Weeks 1-4 — Single steps + short shuttles** (4 wks) — Extend freestand hold to 15+ seconds and chain first walking steps. Yiou 2017 CoP-shift work informs the single-step drill order.
  - Method note: Freestand hold and walk-step drills interleaved from week 1 (CI benefit expected because user is past cognitive stage). Wall shoulder taps as bridge from week 1.
- **Weeks 1-8 — Variability, turns, obstacles** (8 wks) — Add turns and obstacles. Week 1-2 wall pirouette + plate walkover attempts. Week 3+ first freestanding pirouette attempts.
  - Method note: Fully interleaved (random CI) from week 1 — Tier D users past the cognitive stage. Multi-drill sessions.
- **Weeks 3-8 — Interleaved practice for all tiers (post-acquisition)** (6 wks) — Once weeks 1-2 blocked-practice acquisition is complete, interleave. Plan generator picks 2-3 drills per session across the user's weakest capabilities.
  - Method note: Multi-dimensional generator picks from the drill_library filtered by the user's capability_profile. Weakest capability first (Henry 1968, Proteau 1992).

### What it retests, and how often

- **wall_hold_max_seconds** — Wall handstand hold (max) (4-weekly)
- **freestand_hold_max_seconds** — Freestand handstand hold (max) (4-weekly)
- **walk_distance_max_metres** — Handstand walk (max continuous) (4-weekly)

### What it asks, and what each answer does

- **Realistically, how many days per week can you commit?**  
  `days_per_week` — answers: 2, 3, 4, 5, 6, 7
- **How long can you hold a wall handstand (chest to wall or back to wall)?**  
  `wall_hold_seconds_selfreport` — answers: never, under_15s, 15_30s, 30_60s, over_60s
- **How long can you freestand (no wall)?**  
  `freestand_hold_seconds_selfreport` — answers: never, brief, 2_5s, 5_15s, 15_30s, over_30s
- **How far can you handstand walk continuously?**  
  `walk_distance_selfreport` — answers: never, few_steps, 5m_plus, 10m_plus, 20m_plus
- **Have you had wrist pain in the last 12 months during handstand or upper-body weight-bearing work?**  
  `wrist_pain_12mo` — answers: no, occasional, yes
  - warns, then continues on ['yes'] → "Ramp the wrists, don't chase the calendar"
- **Have you had shoulder pain during any overhead pressing or overhead hold in the last 12 months?**  
  `shoulder_pain_overhead`
  - warns, then continues on ['true'] → "This programme cannot route around your shoulder"
- **Age band**  
  `age_band` — answers: 18_30, 31_45, 46_60, 60_plus
- **Have you been diagnosed with low bone density (osteoporosis or low BMD)?**  
  `osteoporosis_dx` — answers: no, unsure, yes
  - BLOCKS on ['yes'] → "See your clinician first"
  - warns, then continues on ['unsure'] → "Worth knowing before you load the wrists"
- **Do you have high blood pressure that isn't under control? (Over 160/100 at rest, or diagnosed but not on medication — uncontrolled hypertension.)**  
  `hypertension_uncontrolled` — answers: no, unsure, yes
  - BLOCKS on ['yes'] → "See your clinician first"
  - warns, then continues on ['unsure'] → "Worth getting a blood-pressure reading"
- **Do you have an acute wrist injury (sprain, TFCC, ligament tear) in the last 6 weeks?**  
  `acute_wrist_injury`
  - BLOCKS on ['true'] → "Wait for the acute injury to resolve"
- **If your handstand tips past vertical, what happens?**  
  `bail_out_readiness` — answers: never_inverted, would_fall, can_step_out, can_exit_reliably
- **Concussion, or any dizziness / vertigo / balance disorder, in the last 3 months?**  
  `concussion_vestibular_recent` — answers: no, unsure, yes
  - BLOCKS on ['yes'] → "Not while that's settling"
  - warns, then continues on ['unsure'] → "Worth being certain before you go upside down"
- **Are you pregnant?**  
  `pregnancy_current` — answers: no, yes
  - warns, then continues on ['yes'] → "Talk to your clinician about inversion work"
- **I understand this program is a training template and not medical advice. I'll stop and see a clinician if wrist or shoulder pain persists after a session or if any bail results in a fall injury.**  
  `consent_symptom_data`

### Conditions the program says it should exclude

Printed against the questions above so you can see which are actually detectable.

- Shoulder pain during a handstand attempt — session ends immediately. Do not train through it. Pain-during-load motor-learning principle: continued exposure with pain reinforces a compensation pattern.
- Osteoporosis diagnosis (or low-BMD DEXA) — freestanding and any bail-risk attempts contraindicated. DiFiori 2006 catalogued distal radius as a common fracture site under this mechanism; vertebral and hip fractures follow. Tier A wall walks + Kinoshita positions with a spotter and soft floor are permitted only after clinician clearance.
- Uncontrolled hypertension (BP > 160/100 at rest or unmedicated) — defer all inversions until BP is controlled. Yoga-inversion literature documents transient systolic increases that stack with Valsalva during a kick-up attempt.
- Acute wrist injury (sprain, TFCC tear, ligament instability) in the last 6 weeks — wrist-load drills prohibited until cleared by a clinician. Program will offer hollow-body and shoulder-endurance drills only during this window.
- Persistent rotator cuff-related shoulder pain (also called impingement) or rotator-cuff pathology — sustained overhead position at ≥170° is not safe. Ludewig & Cook 2000, Reinold 2007: modified overhead loading and scapular retraining first, defer this program.
- First-trimester pregnancy — HR and BP responses shift; inversion literature is unclear. Defer.
- Recent concussion or vestibular disorder — inverted balance training exacerbates symptoms.

**Is anything missing — who should this refuse to take that it currently accepts? ☐ no ☐ yes —**


---

# Citations for this domain

42 unique papers across 3 programs. Where a paper backs more than one claim, every claim is listed under it — a paper stretched across two claims is worth a second look.

**ackerman_1988** — Determinants of individual differences during skill acquisition · Ackerman PL · 1988

- *handstand-walk says it supports:* Individual variance in psychomotor learning. Underpins 'no cohort ETA' in outcome_evidence.
- **Does it? ☐ yes ☐ partly ☐ no —**

**baker_2025_review** — A systematic review of the biomechanics of the handstand · MacDonald C, Baker JS, Gu Y, Ugbolue UC · 2025

- *handstand-walk says it supports:* Current best synthesis of handstand biomechanics — wrist strategy, elite-novice CoP differences, thin evidence base for prerequisite thresholds. Anchor citation for the whole evidence_base.
- **Does it? ☐ yes ☐ partly ☐ no —**

**barlow_2020** — Adult wrist weight-bearing tolerance across the lifespan · Barlow C, Scholtz K, Medeiros DM · 2020

- *handstand-walk says it supports:* Wrist WB tolerance declines from age 45. Informs the age-band intake question and Tier B+ warm-up ramp for older users.
- **Does it? ☐ yes ☐ partly ☐ no —**

**blenkinsop_2017** — Balance control strategies during perturbed and unperturbed balance in standing and handstand · Blenkinsop GM, Pain MTG, Hiley MJ · 2017

- *handstand-walk says it supports:* Confirms wrist-strategy dominance under perturbation. Used in physiological_targets and freestand-attempt drill rationale.
- **Does it? ☐ yes ☐ partly ☐ no —**

**chiviacowsky_wulf_2002** — Self-controlled feedback: does it enhance learning because performers get feedback when they need it? · Chiviacowsky S, Wulf G · 2002

- *first-strict-pullup says it supports:* Self-controlled feedback beats forced schedules. Anchors the video-review-as-button (not schedule) design.
- *muscle-up says it supports:* Self-controlled feedback beats forced schedules. Anchors video-review-as-button design.
- *handstand-walk says it supports:* Self-controlled feedback beats forced schedules. The video review button design (self-selected, never auto-shown) is directly from this study.
- **Does it? ☐ yes ☐ partly ☐ no —**

**dickie_2017** — Electromyographic analysis of muscle activation during pull-up variations · Dickie JA, Faulkner JA, Barnes MJ, Lark SD · 2017

- *muscle-up says it supports:* Peak and average rectified EMG of the shoulder-arm-forearm complex in 19 strength-trained males (~25 y) across four bar conditions: supinated, pronated, neutral and rope. Its conclusion is that activation is SIMILAR across hand orientations, with middle trapezius in pronated versus neutral the one exception; the difference it does report clearly is between phases, with brachioradialis, biceps brachii and pectoralis major significantly more active concentrically than eccentrically. Cited here for that phase difference, which supports treating pulls and negatives as distinct stimuli rather than the same drill at two speeds. Corrected 2026-09-05: this reference previously cited the paper for 'the false-grip pull-up as its own capability'. False grip was not among the four conditions, and the paper's headline finding runs the other way - hand orientation largely did not differentiate activation. Ordering the drill library by grip is an engineering choice, not a result from this study, and the population is bar work in trained males applied here to ring work in a mixed-ability programme.
- **Does it? ☐ yes ☐ partly ☐ no —**

**difiori_2006** — Wrist pain, distal radial physeal injury, and ulnar variance in the young gymnast · DiFiori JP, Caine DJ, Malina RM · 2006

- *handstand-walk says it supports:* Narrative review of wrist pain in young gymnasts under repetitive weight-bearing load through the hand: it documents chronic wrist pain as common in this cohort and identifies injury to the distal radial PHYSIS and the development of positive ulnar variance. It reports no fracture-site data and its abstract does not mention fracture. Cohort is skeletally immature gymnasts with open physes. Engineering choice: Terav uses the load-through-hand mechanism as an analog for the adult low-BMD osteoporosis contraindication; physeal injury in a growing wrist and fragility fracture in an osteoporotic adult are different pathologies that share only a loading direction, so the contraindication is a conservative clinical judgement this paper cannot settle, not a finding it reports. Corrected 2026-09-05: the previous string called this 'fracture-site data at distal radius'. It is a narrative review of physeal injury and ulnar variance. The same misdescription appears in user-visible copy at intake.questions[7].help, immediate_actions[3].reason and evidence_base.contraindications[1] (which additionally asserts 'vertebral and hip fractures follow' with no source at all); those three strings need the same correction and are outside the scope of this reference entry.
- **Does it? ☐ yes ☐ partly ☐ no —**

**henry_1968** — Specificity vs generality in learning motor skill · Henry FM · 1968

- *first-strict-pullup says it supports:* Specificity hypothesis: motor abilities are task-specific. Anchors the per-capability drill selection at each capability's own level.
- *muscle-up says it supports:* Specificity hypothesis. Anchors per-capability drill selection. Also justifies the deliberate separation of strict vs kipping muscle-up.
- *handstand-walk says it supports:* Specificity hypothesis: motor abilities are task-specific. Underpins the sub-skill-independence principle and the multi_dimensional generation strategy itself.
- **Does it? ☐ yes ☐ partly ☐ no —**

**karni_1998** — The acquisition of skilled motor performance: fast and slow experience-driven changes in primary motor cortex · Karni A, Meyer G, Rey-Hipolito C, et al. · 1998

- *first-strict-pullup says it supports:* Fast (within-session) and slow (across-session) learning phases. Anchors the daily-short-beats-long claim and the grease-the-groove pattern.
- *muscle-up says it supports:* Fast (within-session) and slow (across-session) learning phases. Anchors daily-short-beats-long.
- *handstand-walk says it supports:* Fast (within-session) vs slow (across-session) motor learning. M1 remapping over ~3 weeks. Underpins the daily-short-sessions design.
- **Does it? ☐ yes ☐ partly ☐ no —**

**kerwin_trewartha_2001** — Strategies for maintaining a handstand in the anterior-posterior direction · Kerwin DG, Trewartha G · 2001

- *handstand-walk says it supports:* Wrist-torque-dominated balance strategy (analogous to ankle strategy in upright stance). Underpins the fingertip-tap drill and belly-to-wall balance-search rationale.
- **Does it? ☐ yes ☐ partly ☐ no —**

**kibler_2013** — Clinical implications of scapular dyskinesis in shoulder injury: the 2013 consensus statement from the Scapular Summit · Kibler WB, Ludewig PM, McClure PW, Michener LA, Bak K, Sciascia AD · 2013

- *first-strict-pullup says it supports:* The 2013 Scapular Summit consensus statement: scapular dyskinesis is present in a high percentage of shoulder injuries, its exact role in creating or exacerbating shoulder dysfunction 'is not clearly defined', it is 'most aptly viewed as a potential impairment' to shoulder function, and rehabilitation to restore scapular position and motion can be effective 'within a more comprehensive shoulder rehabilitation programme'. Corrected 2026-09-05: the id kibler_2013 resolved in citations.json, and therefore on /evidence, to a different real paper - Kibler WB & Sciascia A (2010), 'Current concepts: scapular dyskinesis', BJSM 44(5):300-305 - while this programme's own record described the 2013 consensus. The canonical record has been corrected to the 2013 consensus, which is what this programme means. Substantively the reach is still wider than the source: the consensus concerns INJURED shoulders, declines to establish a causal role, and studies no hang loading, so mandatory shoulder prep before every session for asymptomatic trainees is an engineering choice, not something either Kibler paper licenses.
- *muscle-up says it supports:* The 2013 Scapular Summit consensus statement: scapular dyskinesis is present in a high percentage of shoulder injuries, its exact role in creating or exacerbating shoulder dysfunction 'is not clearly defined', it is 'most aptly viewed as a potential impairment', and scapular rehabilitation is endorsed only 'within a more comprehensive shoulder rehabilitation programme'. Corrected 2026-09-05: the id resolved in citations.json to a different real paper (Kibler WB & Sciascia A 2010, 'Current concepts: scapular dyskinesis', BJSM 44(5):300-305) while this programme described the 2013 consensus; the canonical record has been corrected to the 2013 consensus, which is what this programme means. The consensus concerns injured shoulders and studies no hang loading, so the shoulder-prep-before-every-session rule for asymptomatic trainees is an engineering choice rather than a finding of it.
- **Does it? ☐ yes ☐ partly ☐ no —**

**kinoshita_2022** — Stepwise increase of upper limb muscle activity induced by progressive 4 positions of a handstand training · Kinoshita T, et al. · 2022

- *handstand-walk says it supports:* Acute surface EMG of eight shoulder-girdle and upper-limb muscles (upper, middle and lower trapezius; serratus anterior; anterior and middle deltoid; infraspinatus; latissimus dorsi) across four static handstand-training positions: 90 degrees, 135 degrees, elbow stand, and full handstand. Muscle activity around the shoulder increased gradually across the four positions, and the scapular stabilisers (upper and middle trapezius, serratus anterior) reached handstand-like levels in the earlier positions. That stepwise shoulder loading is what the position ladder in block_skill_A_kinoshita is built on: it is a defensible way to expose a beginner to handstand-like scapular demand before the handstand. Corrected 2026-09-05: three overreaches removed. (1) No core or trunk musculature was measured - all eight electrodes were on the shoulder girdle and upper limb - so 'EMG activity of shoulder / core musculature' is wrong, and hs_hollow_body_hold sits in this block as a coaching addition, not as something this paper measured. (2) The third position is an elbow stand; 'elbow / straddle-L' is wrong, as straddle-L appears nowhere in the study. (3) This is an acute cross-sectional comparison with no training arm, no follow-up and no outcome measure, so it cannot 'validate' a progression - that training through the ladder produces a handstand is an engineering choice. The paper frames the positions as preferred for young beginners and recovering gymnasts, and the participant count is not in the deposited abstract. DOI 10.3233/IES-210169 has been added to the library record, so the 'DOI missing' flag can come off.
- **Does it? ☐ yes ☐ partly ☐ no —**

**ludewig_cook_2000** — Alterations in shoulder kinematics and associated muscle activity in people with symptoms of shoulder impingement · Ludewig PM, Cook TM · 2000

- *handstand-walk says it supports:* Cross-sectional comparison of 52 construction workers with routine overhead exposure, with and without shoulder impingement symptoms: the symptomatic group showed decreased scapular upward rotation, increased anterior tipping, increased medial rotation under load, and decreased serratus anterior activity across all loads and phases. Corrected 2026-09-05: this read 'serratus + trapezius ENDURANCE in SUSTAINED overhead flexion, underpins the wall_supported_shrugs drill and the 170 degree prerequisite'. The paper measured EMG amplitude during RAMPED humeral elevation across phases of 31-60, 61-90 and 91-120 degrees under 0 / 2.3 / 4.6 kg handheld loads. It measured no endurance, no sustained holds, and nothing at or near 170 degrees, and it is a symptomatic-population comparison rather than a training study - so it cannot underpin a drill or a prerequisite threshold. Both remain engineering choices, which is what this file already says of the 170 degree cutoff in engineering_choices_flagged.
- **Does it? ☐ yes ☐ partly ☐ no —**

**newell_1985** — Constraints on the development of coordination · Newell KM · 1986

- *first-strict-pullup says it supports:* Newell's constraints framework: organismic, environmental and task constraints that 'INTERACT to determine for a given organism the optimal pattern of coordination and control for any activity' (verified at p. 348 of the original chapter scan). Corrected 2026-09-05: two problems. Bibliography: the chapter's own title page dates it 1986, not 1985 (Wade MG & Whiting HTA eds, Motor Development in Children: Aspects of Coordination and Control, Martinus Nijhoff, chapter beginning p. 341), and the citations.json record named a third, non-existent book. Substance: the chapter says the three categories INTERACT, is about the development of coordination in children, and offers nothing about the statistical independence of trained sub-skills - so treating sub-skills as independent state variables is an engineering choice this chapter does not license and arguably argues against. What it does support is decomposing a skill by constraint category.
- *muscle-up says it supports:* Newell's constraints framework: organismic, environmental and task constraints that 'INTERACT to determine for a given organism the optimal pattern of coordination and control for any activity' (verified at p. 348 of the original chapter scan). Corrected 2026-09-05: two problems. Bibliography: the chapter is dated 1986 on its own title page (Wade MG & Whiting HTA eds, Motor Development in Children: Aspects of Coordination and Control, Martinus Nijhoff, chapter beginning p. 341); the citations.json record named a book that matches no Newell work. Substance: the chapter describes the three constraint categories as interacting and concerns the development of coordination in children; it says nothing about the statistical independence of trained sub-skills, so 'treat sub-skills as independent state variables' is an engineering choice rather than a finding of this source.
- *handstand-walk says it supports:* Newell's constraints framework: three categories of constraint - organismic, environmental and task - that 'INTERACT to determine for a given organism the optimal pattern of coordination and control for any activity' (verified at p. 348 of the original chapter scan). Corrected 2026-09-05: the bibliography, not the substance. The chapter is 'Constraints on the development of coordination', in Wade MG & Whiting HTA (eds), Motor Development in Children: Aspects of Coordination and Control, whose title page reads 1986 Martinus Nijhoff Publishers; it opens at p. 341. citations.json named a different Newell chapter's title ('Coordination, control and skill', 1985, in Differing Perspectives in Motor Learning, Memory and Control) against a book, 'Advances in Motor Development Research', that matches neither work. The three-category decomposition this programme uses for capability_domains is genuinely in the 1986 chapter; note that the chapter frames the categories as interacting, and is about the development of coordination in children.
- **Does it? ☐ yes ☐ partly ☐ no —**

**potdevin_2018** — How can video feedback be used in physical education to support novice learning in gymnastics? Effects on motor learning, self-assessment and motivation · Potdevin F, Vors O, Huchez A, Lamour M, Davids K, Schnitzler C · 2018

- *muscle-up says it supports:* n=18 in the video-feedback arm, PE beginners aged about 12, five weekly lessons on a front handstand to flat-back landing: knowledge-of-performance after every five attempts improved both skill and self-assessment. Reused here as the reason video review is dosed rather than given every rep; transferring a school-class gymnastics dose to adult self-coached ring work is an engineering choice. Corrected 2026-09-05: the study is five weeks and five lessons, not eight weeks, and the record's title was a stub.
- *handstand-walk says it supports:* n=18 in the video-feedback arm, French PE beginners aged 12.4 +/- 0.5, five weekly lessons learning a front handstand to flat-back landing with a teacher present: video knowledge-of-performance after every five attempts improved arm-trunk angle by lesson 5 and improved self-assessment scores. The every-five-reps number is carried across to adult self-coached freestand search as a heuristic; it is an engineering choice, not a dose validated in this population. Corrected 2026-09-05: the study is five weeks and five lessons, not eight weeks, and the record's title was a stub that could not be looked up.
- **Does it? ☐ yes ☐ partly ☐ no —**

**proteau_1992** — A sensorimotor basis for motor learning: evidence indicating specificity of practice · Proteau L, Marteniuk RG, Lévesque L · 1992

- *first-strict-pullup says it supports:* Laboratory manual-aiming task with and without vision of the limb; the authors conclude that learning is specific to the conditions that prevail during skill acquisition. Treating each capability as its own state variable is a design inference from that principle, not a result this paper reports for strength skills. Corrected 2026-09-05: the canonical record had been moved on 2026-08-18 to Journal of Motor Behavior 24(1):81-104, a reference that could not be found to exist; the real paper is Q J Exp Psychol A 44(3):557-575, PMID 1631322, and this programme's issue number should read 44(3), not 44A(4).
- *muscle-up says it supports:* Laboratory manual-aiming task with and without vision of the limb; the authors conclude that learning is specific to the conditions that prevail during skill acquisition. The per-capability split is a design inference from that principle rather than a finding about ring skills. Corrected 2026-09-05: the canonical record had been moved to a Journal of Motor Behavior reference that does not exist; the real paper is Q J Exp Psychol A 44(3):557-575, PMID 1631322, and the issue should read 44(3), not 44A(4).
- *handstand-walk says it supports:* Laboratory manual-aiming task with and without vision of the limb; the authors conclude that learning is specific to the conditions that prevail during skill acquisition. Training wall hold, freestand and walk as separate state variables follows that principle by extrapolation; the paper tests neither handstands nor locomotion. Corrected 2026-09-05: the canonical record had been moved to a Journal of Motor Behavior reference that does not exist, the title here was a description rather than the published title, and the issue should read 44(3).
- **Does it? ☐ yes ☐ partly ☐ no —**

**reinold_2007** — Electromyographic analysis of the supraspinatus and deltoid muscles during 3 common rehabilitation exercises · Reinold MM, Macrina LC, Wilk KE, Fleisig GS, Dun S, Barrentine SW, Ellerbusch MT, Andrews JR · 2007

- *first-strict-pullup says it supports:* EMG in 22 asymptomatic subjects across three isolated cuff exercises: no statistical difference among the exercises for supraspinatus activity, with the full-can position producing significantly less deltoid activity. That is a muscle-recruitment comparison in people without symptoms; it carries no information about training through pain. The stop-the-session rule for hangs and pulls stays, but as a conservative safety choice, not as a finding of this paper. Corrected 2026-09-05: the source read JOSPT 37(9):519-527, a locator that returns zero results; the paper is J Athl Train 42(4):464-469, PMID 18174934, and the byline was truncated.
- *muscle-up says it supports:* EMG in 22 asymptomatic subjects across three isolated cuff exercises: supraspinatus activity did not differ among them, and the full-can position produced significantly less deltoid activity. It supports choosing a cuff-prep position; it says nothing about symptomatic shoulders or about ending a session, so the stop-the-session rule is a safety choice and the pre-session prep dose is an engineering choice. Corrected 2026-09-05: the source read JOSPT 37(9):519-527, which does not exist; the paper is J Athl Train 42(4):464-469, PMID 18174934, and the byline was truncated.
- *handstand-walk says it supports:* EMG in 22 asymptomatic subjects across three isolated cuff exercises, with no difference among them for supraspinatus and less deltoid activity in the full-can position. It is not a study of sustained overhead or inverted loading, so the shoulder-endurance contraindication and the belly-to-wall rationale rest on clinical caution rather than on this measurement. Corrected 2026-09-05: the record named the wrong journal with no volume or pages; the paper is J Athl Train 42(4):464-469, PMID 18174934, and this id had been serving two different Reinold papers at once.
- **Does it? ☐ yes ☐ partly ☐ no —**

**rhea_2003_meta** — A meta-analysis to determine the dose response for strength development · Rhea MR, Alvar BA, Burkett LN, Ball SD · 2003

- *first-strict-pullup says it supports:* General strength dose-response anchor for the weekly hard-rep target. Replaces a retracted reference (Barbalho 2020, retracted April 2020) that previously carried this claim. Rhea establishes the dose-response shape only — the specific 40-60 hard reps/week figure remains coaching consensus and is labelled as such in the tier rationale, not presented as an RCT result.
- **Does it? ☐ yes ☐ partly ☐ no —**

**robertson_2004** — Current concepts in procedural consolidation · Robertson EM, Pascual-Leone A, Miall RC · 2004

- *handstand-walk says it supports:* 4-6h post-practice consolidation window vulnerable to similar-task interference. Underpins the 'don't stack handstand practice immediately after heavy overhead press' placement rule.
- **Does it? ☐ yes ☐ partly ☐ no —**

**rohleder_vogt_2018** — Teaching novices the handstand: a practical approach of different sport-specific feedback concepts on movement learning · Rohleder J, Vogt T · 2018

- *handstand-walk says it supports:* 26 university students in a single pre-post session, randomised to tactile-verbal feedback (n=13) or visual-comparative feedback (n=13): shoulder positioning improved after tactile-verbal (p<0.01) and shoulder-angle motor imagery improved after visual-comparative (p<0.05). No combined arm was run; combining the two is the authors' suggestion in their conclusion, not a measured result, so the mixed feedback design is an engineering choice supported by two modalities moving different variables. Corrected 2026-09-05: the used_for claimed combined feedback outperformed either alone, which the study never tested, and the record carried an invented title and a hedged double venue with the wrong volume (correct: Science of Gymnastics Journal 10(1):29-42).
- **Does it? ☐ yes ☐ partly ☐ no —**

**roig_2009** — The effects of eccentric versus concentric resistance training on muscle strength and mass in healthy adults: a systematic review with meta-analysis · Roig M, O'Brien K, Kirk G, Murray R, McKinnon P, Shadgan B, Reid WD · 2009

- *first-strict-pullup says it supports:* SUPERSEDED 2026-09-05. This read: 'Meta-analytic evidence: eccentric training produces greater strength gains than concentric-only for matched work (ES 1.02 vs 0.94).' Neither effect size appears in Roig's full text, and the paper states that at comparable intensity 'no significant differences in the improvement of total strength after training were observed'. Spudic & Nosaka 2025 (spudic_nosaka_2025, 27 studies, GRADE) settles it: eccentric-only beats concentric-only for ECCENTRIC strength (g=1.51) and is statistically indistinguishable for CONCENTRIC (g=-0.10, p=.726). A first strict pull-up is a CONCENTRIC task — so on the outcome this programme exists to produce, the pooled evidence shows no advantage. Negatives are retained: they build position tolerance and are a reasonable entry for someone with no concentric rep. But they are an ENGINEERING CHOICE, not an evidence-backed shortcut, and the programme should not imply otherwise.
- *muscle-up says it supports:* SUPERSEDED 2026-09-05 — see spudic_nosaka_2025. Eccentric-only is indistinguishable from concentric-only for concentric strength (g=-0.10, p=.726), so 'produces greater strength gains' is not supportable. The transition negative is retained as the closest available POSITION rehearsal for the muscle-up transition, which is a specificity argument, not a strength-gain one. Roig's own text also declines the transfer claim, leaving open 'transferability of strength gains to more complex human movements'.
- **Does it? ☐ yes ☐ partly ☐ no —**

**sadowski_2021** — Kinematics and joint moments during the press to handstand · Mizutori H, et al. · 2021

- *muscle-up says it supports:* Press-to-handstand shoulder-moment analysis, cited as the closest available analog for ring-support end-range shoulder load. ATTRIBUTION UNRESOLVED — the DOI resolves to a Mizutori-authored parallel-bars paper; handstand-walk carries the same flag and instructs that the 3x bodyweight figure not be cited. The specific number is therefore withdrawn here too (2026-09-03): the two programmes were shipping opposite instructions about the same citation. The qualitative point — straight-arm press is a high end-range shoulder load — stands without it. CORRECTED 2026-09-05: the byline said Sadowski and no such paper exists, but the DOI was always right and resolves to Mizutori et al. It is a FLOOR study, not parallel bars, and the 3x bodyweight figure lived in its introduction quoting someone else. Its real finding — less-skilled performers produced LARGER shoulder flexion moments — supports this rule better than the withdrawn number.
- *handstand-walk says it supports:* Shoulder-moment analysis of the press to handstand. Directly informs the choice NOT to program straight-arm press early, and the Tier A entry at Kinoshita 90°. Attribution flagged for founder review (see citations.json review_note): DOI 10.1371/journal.pone.0253951 resolves to a Mizutori-authored parallel-bars paper. The heavy-shoulder-moment principle survives on general grounds; the specific 3× BW figure was a parallel-bars finding, not a floor finding — do not cite that number. CORRECTED 2026-09-05: the byline said Sadowski and no such paper exists, but the DOI was always right and resolves to Mizutori et al. It is a FLOOR study, not parallel bars, and the 3x bodyweight figure lived in its introduction quoting someone else. Its real finding — less-skilled performers produced LARGER shoulder flexion moments — supports this rule better than the withdrawn number.
- **Does it? ☐ yes ☐ partly ☐ no —**

**sands_2000** — Injury prevention in women's gymnastics · Sands WA · 2000

- *first-strict-pullup says it supports:* Narrative review of injury prevention in women's artistic gymnastics, arguing that prevention has to be grounded in science and medicine while making pragmatic links to how the sport is actually practised, and observing that most gymnastics research to that point had been descriptive. It reports no effect size, no comparison and no readiness-screening protocol; the full text is paywalled. Cited here only for the general principle that skill demands should be matched to demonstrated readiness rather than to ambition. Corrected 2026-09-05: this reference previously said the paper 'supports the Tier A to B to C to D gating'. It supports no specific gate. The tier ladder for adult recreational users is a deliberately conservative engineering choice and is not licensed by a 2000 review of young elite female gymnasts.
- *muscle-up says it supports:* Narrative review of injury prevention in women's artistic gymnastics; reports no effect size, no comparison and no readiness-screening protocol in its abstract, and the full text is paywalled. Cited here only for the general principle that a high-demand skill should be attempted from demonstrated readiness rather than from ambition. Corrected 2026-09-05: this reference previously said the paper 'anchors the strict-pull-up + ring-dip prerequisite gate'. It anchors no gate. That prerequisite is an engineering choice made by Terav, and because it is a gate that withholds a movement from a user, it should be presented as our judgement rather than borrow authority from a paper about young elite female gymnasts.
- *handstand-walk says it supports:* Narrative review of injury prevention in women's artistic gymnastics: a bridging article, reporting no finding and offering no screening protocol in its abstract, with the full text paywalled. Cited here only for the general principle that readiness should gate exposure to a high-demand skill. Corrected 2026-09-05: previously read as support for prerequisite gating on advanced drills. The gating in this programme is an engineering choice; the population in the paper is young elite female gymnasts in 2000, not self-taught adults learning to invert.
- **Does it? ☐ yes ☐ partly ☐ no —**

**schmidt_1975** — A schema theory of discrete motor skill learning · Schmidt RA · 1975

- *first-strict-pullup says it supports:* Schema theory: variability of practice builds recall and recognition schemas. Anchors the grip-width rotation in Tier D.
- *muscle-up says it supports:* Schema theory: variability of practice builds recall and recognition schemas. Anchors the low-ring / jump-assist / strict variety.
- *handstand-walk says it supports:* Schema theory — variability builds recall + recognition schemas. Underpins the variability-of-practice at Tier D (line, markers, precision lane).
- **Does it? ☐ yes ☐ partly ☐ no —**

**sci_reports_2026_handstand_shoulder** — Exploring handstand walking biomechanics and shoulder pain · Angioi M, Hinds N, Twycross-Lewis R, Farmer C, Birn-Jeffery AV · 2026

- *handstand-walk says it supports:* Cross-sectional comparison of ten practitioners who could handstand walk six steps: those reporting shoulder pain moved significantly slower (p=0.005), showed shorter arm lengths (p=0.013) and greater net torsional work (p=0.002), a more flexed arm position associated with higher joint loading. With n=10 and no time order, it cannot say whether the pattern causes the pain or follows from it, and it reports nothing about managing a session. The shoulder-pain-stops-session rule is a conservative safety choice; this paper describes a compensation pattern consistent with it. The authors name discipline, training volume and gender as unaddressed confounders. Corrected 2026-09-05: this record's authors field was the placeholder 'Sci Reports handstand-walk shoulder pain team' rather than a byline, and the used_for asserted that byline and DOI had been checked against the publisher record on 2026-09-02, a check the same record falsified; the real byline is Angioi M, Hinds N, Twycross-Lewis R, Farmer C, Birn-Jeffery AV, Scientific Reports 16:22766, doi 10.1038/s41598-026-51612-w.
- **Does it? ☐ yes ☐ partly ☐ no —**

**shea_2000** — Spacing practice sessions across days benefits the learning of motor skills · Shea CH, Lai Q, Black CB, Park JH · 2000

- *first-strict-pullup says it supports:* Two practice sessions separated by 24 hours produced better performance in later practice and better delayed retention than the same sessions separated by 20 minutes, on a laboratory dynamic-balance task and a key-press timing task. The multi-session weekly template and the greasing-the-groove spacing rule apply that result to pulling strength by extrapolation, which is an engineering choice. Corrected 2026-09-05: the record's title was a description rather than the published title, its byline was truncated and it had no identifier, so the /evidence row could not be looked up.
- *muscle-up says it supports:* Sessions spaced 24 hours apart beat sessions spaced 20 minutes apart for later practice performance and delayed retention, on laboratory balance and timing tasks. The multi-session weekly template applies that to ring work by extrapolation. Corrected 2026-09-05: the record's title was a description, the byline was truncated and there was no identifier.
- *handstand-walk says it supports:* Sessions spaced across days beat sessions massed within a day, measured on a laboratory dynamic-balance task and a key-press timing task with a delayed retention test. The daily-short design and the do-not-double-up rule follow that principle; neither the task nor the population is a handstand, so the transfer is an engineering choice. Corrected 2026-09-05: the record's title was a description rather than the published title, with a truncated byline and no identifier.
- **Does it? ☐ yes ☐ partly ☐ no —**

**shea_morgan_1979** — Contextual interference effects on the acquisition, retention, and transfer of a motor skill · Shea JB, Morgan RL · 1979

- *first-strict-pullup says it supports:* Foundational CI study. Blocked practice benefits acquisition, random benefits retention. Anchors weeks 1-2 blocked, weeks 3+ interleaved.
- *muscle-up says it supports:* Foundational CI study. Blocked practice benefits acquisition, random benefits retention.
- *handstand-walk says it supports:* Foundational contextual-interference paper: blocked better in acquisition, random better in retention. Underpins the weeks-1-2-blocked / weeks-3+-interleaved progression.
- **Does it? ☐ yes ☐ partly ☐ no —**

**simunkova_2024** — Are the shoulder joint function, stability, and mobility tests predictive of handstand execution? · Malir R, Chrudimsky J, Provaznik A, Trebicky V · 2024

- *handstand-walk says it supports:* 111 novice college athletes aged 19-23: no relationship between handstand execution quality (E-score) and Upper Quarter Y Balance Test or Closed Kinetic Chain Upper Extremity Stability Test scores. That is a good reason not to gate entry on generic upper-quadrant screens. It is weaker support for not gating obstacles and turns, because nobody in a novice sample could perform those sub-skills, and the authors themselves attribute the null partly to design (testing at 90 versus 180 degrees of shoulder flexion) and to insufficient skill variability. Corrected 2026-09-05: the byline is wrong on both the programme record and citations.json: the paper is Malir R, Chrudimsky J, Provaznik A, Trebicky V, 'Are the shoulder joint function, stability, and mobility tests predictive of handstand execution?', PLOS One 19(5):e0302922 - Simunkova K is not an author, and the title here was a description.
- **Does it? ☐ yes ☐ partly ☐ no —**

**sinnett_2019** — The effect of band-assisted pull-up training on muscular strength and pull-up performance · Sinnett AM, Cheatham SW, Brismée JM · 2019

- *first-strict-pullup says it supports:* Band-assisted pull-up training improves strength and pull-up performance. Supports band assistance as a legitimate groove/volume driver rather than a lesser substitute. (Earlier wording described EMG findings; this is an intervention study and the EMG claim was not verifiable from it — 2026-09-02 citation audit.)
- *muscle-up says it supports:* Band-assisted pull-up training improves strength and pull-up performance. Supports band assistance as a groove/volume driver, and underwrites band-assisted ring dip as the deferral substitute. (Earlier wording described EMG findings; this is an intervention study and the EMG claim was not verifiable from it — 2026-09-02.)
- **Does it? ☐ yes ☐ partly ☐ no —**

**sobera_2019** — Stabilometric profile of handstand technique in male gymnasts · Sobera M, Serafin R, Rutkowska-Kucharska A · 2019

- *handstand-walk says it supports:* Eight male acrobatic gymnasts, four more and four less experienced, in a static handstand on a force platform: the more experienced minimised anterior-posterior sway while keeping medial-lateral sway small, and the less experienced showed irregular medial-lateral pressure, with the sway reduction paid for by exerting more force into the floor. The mechanism contrast is real; with four per group it will not carry an outcome claim, and the study is static, so nothing here speaks to walking. Corrected 2026-09-05: the used_for called this an elite-versus-novice difference and used it as outcome evidence, and the record carried a description in place of the published title 'Stabilometric profile of handstand technique in male gymnasts', Acta Bioeng Biomech 21(1):63-71, with no identifier.
- **Does it? ☐ yes ☐ partly ☐ no —**

**spudic_nosaka_2025** — Eccentric-only versus concentric-only isokinetic strength training effects on maximal voluntary eccentric, concentric and isometric contraction strength: a systematic review and meta-analysis · Spudić D, Nosaka K · 2025

- *first-strict-pullup says it supports:* Eccentric-only training improves ECCENTRIC strength more than concentric-only (g=1.51) but is statistically indistinguishable for CONCENTRIC strength (g=-0.10, p=.726). Added 2026-09-05 to replace roig_2009, and it narrows rather than supports this programme's use of negatives.
- *muscle-up says it supports:* Eccentric-only training improves ECCENTRIC strength more than concentric-only (g=1.51) but is statistically indistinguishable for CONCENTRIC strength (g=-0.10, p=.726). Added 2026-09-05 to replace roig_2009, and it narrows rather than supports this programme's use of negatives.
- **Does it? ☐ yes ☐ partly ☐ no —**

**vidal_rovira_2024** — Forearm activation patterns in false-grip vs standard grip on gymnastic rings · Vidal-Rovira R, et al. · 2024

- *muscle-up says it supports:* Higher forearm activation in false-grip vs standard. Small sample, flagged for founder science-advisor review. Supports the false-grip-as-separate-capability framing but is not the load-bearing citation.
- **Does it? ☐ yes ☐ partly ☐ no —**

**vidal_torija_2025** — The Wrist as a Weightbearing Joint in Adult Handstand Practitioners: A Cross-Sectional Survey of Chronic Pain and Training-Related Factors · Martonovich N, Maman D, Mahamid A, Alfandari L, Behrbalk E · 2025

- *handstand-walk says it supports:* Cross-sectional survey of 321 adult handstand practitioners: 182 (56.7 percent) reported chronic wrist pain, with no significant association between that pain and weekly training hours, training frequency, training duration, warm-up routine or brace use. The authors read it as multifactorial rather than volume-driven. Note the direction: this is evidence against volume being the driver, so it is not evidence for the wrist volume cap. The cap is a conservative engineering choice and should be labelled as one. Corrected 2026-09-05: the byline, title and venue were all wrong on both the programme record and citations.json; the paper is Martonovich N, Maman D, Mahamid A, Alfandari L, Behrbalk E, 'The Wrist as a Weightbearing Joint in Adult Handstand Practitioners', J Funct Morphol Kinesiol 10(4):372, doi 10.3390/jfmk10040372 - not Frontiers, and no author named Vidal-Torija exists on it.
- **Does it? ☐ yes ☐ partly ☐ no —**

**vigouroux_2007** — Estimation of finger muscle tendon tensions and pulley forces during specific sport-climbing grip techniques · Vigouroux L, Quaine F, Labarre-Vila A, Moutet F · 2006

- *first-strict-pullup says it supports:* Tendon tension and pulley force vary substantially by grip technique — the basis for treating grip position as a load variable in hang work. The paper does not establish a hang-time dose; the 20-45s range is coaching convention, not a finding from this source.
- **Does it? ☐ yes ☐ partly ☐ no —**

**walker_2003** — Sleep and the time course of motor skill learning · Walker MP, Brakefield T, Seidman J, Morgan A, Hobson JA, Stickgold R · 2003

- *first-strict-pullup says it supports:* Finger-tapping motor-skill learning across sleep: doubling the quantity of initial training did not change the amount of sleep-dependent improvement that developed overnight. That is the argument for short, frequent exposure over infrequent long sessions. It is a laboratory keypress task, so applying it to pull-up practice is an engineering choice. Corrected 2026-09-05: this id was a splice of two real papers, carrying the Nature paper's title and four-author byline over the Learning & Memory paper's locator; it is resolved onto Walker MP, Brakefield T, Seidman J, Morgan A, Hobson JA, Stickgold R, 'Sleep and the time course of motor skill learning', Learn Mem 10(4):275-284, PMID 12888546. The dissociable-stages claim this record previously made belongs to Nature 425(6958):616-620, PMID 14534587, which says nothing about session length or frequency.
- *muscle-up says it supports:* Finger-tapping motor-skill learning across sleep: doubling initial training volume did not increase the overnight sleep-dependent gain, which is the case for daily short exposure rather than occasional long sessions. Laboratory keypress task; the transfer to ring skills is an engineering choice. Corrected 2026-09-05: the record spliced the Nature paper's title and byline onto the Learning & Memory locator, and this programme's source field said Nature 425(6958):616-620 while two other programmes said Learning & Memory; the id is resolved onto Learn Mem 10(4):275-284, PMID 12888546, whose byline includes Seidman J and Morgan A.
- *handstand-walk says it supports:* Sleep-dependent motor consolidation: in finger-tapping learning, doubling the quantity of initial training did not alter the overnight sleep-dependent gain, which is the reason daily short exposure is preferred to infrequent long sessions. Laboratory keypress task, not a balance or inversion skill. Corrected 2026-09-05: the 2026-08-17 correction left the record internally spliced, keeping the Nature paper's title and its four-author byline over this Learning & Memory locator; the byline is Walker MP, Brakefield T, Seidman J, Morgan A, Hobson JA, Stickgold R and the title is 'Sleep and the time course of motor skill learning', PMID 12888546.
- **Does it? ☐ yes ☐ partly ☐ no —**

**wiesinger_2019** — Tendon adaptation to mechanical loading · Wiesinger HP, et al. · 2019

- *handstand-walk says it supports:* Tendon adaptation timeframe (8-12 weeks for collagen turnover). Mechanism basis for the wrist volume cap. Note: no direct dose-response study for handstand wrist load — the exact 20-30 min cap is an engineering choice. Flagged for founder review: DOI missing.
- **Does it? ☐ yes ☐ partly ☐ no —**

**wu_2014** — Temporal structure of motor variability is dynamically regulated and predicts motor learning ability · Wu HG, et al. · 2014

- *handstand-walk says it supports:* Planar reaching in a manipulandum: participants whose task-relevant motor variability was one standard deviation above average learned more than twice as fast as those one standard deviation below (p=0.0021), across reward-based trajectory learning and error-based force-field adaptation. It supports the individual-variance framing - people arrive with different learning rates - and nothing more specific than that for handstand acquisition. Corrected 2026-09-05: the figure is more than twofold, not 3x, and visuomotor rotation is not a paradigm in this study; the string appears in the paper only in its reference list. The same wrong phrasing remains in muscle-up.json outcome_evidence and must be fixed by hand.
- **Does it? ☐ yes ☐ partly ☐ no —**

**wulf_1998** — Instructions for motor learning: differential effects of internal versus external focus of attention · Wulf G, Höß M, Prinz W · 1998

- *first-strict-pullup says it supports:* External focus vs internal focus foundation. Anchors the external-focus cue on every drill card.
- *muscle-up says it supports:* External focus vs internal focus foundation. Anchors the external-focus cue on every drill card.
- *handstand-walk says it supports:* External focus outperforms internal focus. Foundational reference for the cues_external_focus field on every drill.
- **Does it? ☐ yes ☐ partly ☐ no —**

**wulf_2013** — Attentional focus and motor learning: a review of 15 years · Wulf G · 2013

- *first-strict-pullup says it supports:* 15-year review supporting the external-focus default. ~100 studies across balance and complex motor skills.
- *muscle-up says it supports:* 15-year review supporting the external-focus default.
- *handstand-walk says it supports:* 15-year review of ~100 studies confirming external focus benefit. Codified in the external_focus_default principle.
- **Does it? ☐ yes ☐ partly ☐ no —**

**wulf_shea_2002** — Principles derived from the study of simple skills do not generalize to complex skill learning · Wulf G, Shea CH · 2002

- *first-strict-pullup says it supports:* Crucial caveat: CI benefit is smaller for complex skills than lab tasks. Reduce challenge in acquisition (blocked weeks 1-2), add later. Anchors the phase-gated CI schedule.
- *muscle-up says it supports:* Crucial caveat: CI benefit is smaller for complex skills. Anchors phase-gated CI schedule (blocked 1-2, interleaved 3+).
- *handstand-walk says it supports:* The crucial caveat that CI benefits are smaller for complex skills. Underpins the blocked-first, interleaved-later progression.
- **Does it? ☐ yes ☐ partly ☐ no —**

**yiou_2017** — Balance control during gait initiation: State-of-the-art and research perspectives · Yiou E, Caderby T, Delafontaine A, Fourcade P, Honeine JL · 2017

- *handstand-walk says it supports:* State-of-the-art review of balance control during bipedal gait initiation from quiet standing, covering anticipatory postural adjustments, stance-leg stiffness, foot placement, lateral ankle strategy, swing-foot strike pattern and vertical centre-of-mass braking; written for aging, neurological and orthopedic conditions and aimed at rehabilitation. The one point borrowed here is general and real: a postural shift precedes the first step rather than following it, which is why single_step_attempt trains the weight shift before the step rather than the step alone. Corrected 2026-09-05: previously read as direct support for the drill design and the 'lean the shape toward the far wall' cue. The paper addresses neither inversion nor hand support, and nothing in it concerns a base of support at the hands, so carrying anticipatory postural adjustment across to initiating locomotion while inverted is an engineering choice. Worth remembering that this citation itself replaced an unlocatable one (ferrari_2021) on 2026-08-18, which is exactly the setting in which a near-enough substitution slips through.
- **Does it? ☐ yes ☐ partly ☐ no —**

**youdas_2010** — Surface electromyographic activation patterns and elbow joint motion during a pull-up, chin-up, or perfect-pullup rotational exercise · Youdas JW, Amundson CL, Cicero KS, Hahn JJ, Harezlak DT, Hollman JH · 2010

- *first-strict-pullup says it supports:* Surface EMG in 21 men and 4 women (mean age ~25 y) across three conditions: conventional pull-up, chin-up, and a rotating-handle (Perfect-Pullup) variant. One finding is used here: a sequential activation pattern in which lower trapezius and pectoralis major initiate the repetition and biceps brachii and latissimus dorsi complete it. That is the evidence behind teaching a scapular phase before the concentric pull. Corrected 2026-09-05: this reference also claimed 'wide-grip biases lat, neutral biases brachialis'. No wide-grip and no neutral-grip condition was run, and brachialis was not among the eight recorded muscles, so that half described a study that did not happen and is withdrawn. The grip-width rotation in Tier D is an engineering choice about varying the stimulus and now carries no citation. The byline was also wrong in this reference block and must be corrected to Youdas JW, Amundson CL, Cicero KS, Hahn JJ, Harezlak DT, Hollman JH.
- *muscle-up says it supports:* Surface EMG in 25 recreationally active adults across pull-up, chin-up and a rotating-handle variant, showing a sequential activation order: lower trapezius and pectoralis major initiate the repetition, biceps brachii and latissimus dorsi complete it. Cited here only for that ordering, which is why the shared pull drill library trains the scapular phase before the pull. Corrected 2026-09-05: this reference previously said the paper supports 'the false-grip-as-separate-capability framing'. False grip was not one of the three conditions, so it cannot. Treating false grip as its own capability is an engineering choice drawn from gymnastics coaching practice and currently has no citation behind it in this library. The byline was also wrong in this reference block and must be corrected to Youdas JW, Amundson CL, Cicero KS, Hahn JJ, Harezlak DT, Hollman JH.
- **Does it? ☐ yes ☐ partly ☐ no —**


---

## Sign-off

- Name and credential:
- Date reviewed:
- Anything you did **not** review (out of your domain):
- Overall: ☐ ships as-is ☐ ships with the changes flagged ☐ do not ship until fixed
