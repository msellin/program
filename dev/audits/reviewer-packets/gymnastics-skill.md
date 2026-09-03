# Reviewer packet — Gymnastics & upper-body skill

**Generated 2026-09-03 from the shipping program data.** Regenerate with
`python3 dev/scripts/build-reviewer-packet.py`; do not edit by hand, or it
will start describing a program that no longer ships.

<!-- source-fingerprint: dd58939d20b4d0db -->

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

- Shoulder pain during a hang or pull attempt — session ends immediately. Do not train through it. Reinold 2007 supraspinatus / rotator-cuff load data supports the caution: hang position loads the long head of biceps + supraspinatus tendon.
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
- Persistent shoulder impingement or rotator-cuff pathology — sustained overhead position at ≥170° is not safe. Ludewig & Cook 2000, Reinold 2007: modified overhead loading and scapular retraining first, defer this program.
- First-trimester pregnancy — HR and BP responses shift; inversion literature is unclear. Defer.
- Recent concussion or vestibular disorder — inverted balance training exacerbates symptoms.

**Is anything missing — who should this refuse to take that it currently accepts? ☐ no ☐ yes —**


---

# Citations for this domain

41 unique papers across 3 programs. Where a paper backs more than one claim, every claim is listed under it — a paper stretched across two claims is worth a second look.

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

- *muscle-up says it supports:* EMG data on pull-up variants — supports the drill-library ordering and the false-grip pull-up as its own capability.
- **Does it? ☐ yes ☐ partly ☐ no —**

**difiori_2006** — Wrist pain, distal radial physeal injury, and ulnar variance in the young gymnast · DiFiori JP, Caine DJ, Malina RM · 2006

- *handstand-walk says it supports:* Fracture-site data at distal radius under load-through-hand mechanism. Cohort is young gymnasts (open physes); Terav uses this as a mechanism analog for the adult low-BMD osteoporosis contraindication, not as direct evidence in adult practitioners.
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

**kibler_2013** — Current concepts: scapular dyskinesis · Kibler WB, Sciascia A · 2010

- *first-strict-pullup says it supports:* Scapular dyskinesis and its role in overhead / hang loading. Supports the shoulder-prep-before-every-session rule.
- *muscle-up says it supports:* Scapular dyskinesis pattern in overhead / hang loading. Anchors the shoulder-prep-before-every-session rule.
- **Does it? ☐ yes ☐ partly ☐ no —**

**kinoshita_2022** — Progressive four-position handstand EMG activity · Kinoshita T, et al. · 2022

- *handstand-walk says it supports:* The 4-position progression ladder (90° incline → 135° → elbow / straddle-L → full wall handstand). Validated by EMG activity of shoulder / core musculature. Underpins block_skill_A_kinoshita and the Tier A entry. Flagged for founder review: DOI missing.
- **Does it? ☐ yes ☐ partly ☐ no —**

**ludewig_cook_2000** — Alterations in shoulder kinematics and associated muscle activity in people with symptoms of shoulder impingement · Ludewig PM, Cook TM · 2000

- *handstand-walk says it supports:* Serratus + trapezius endurance in sustained overhead flexion. Underpins the wall_supported_shrugs drill and the 170° prerequisite.
- **Does it? ☐ yes ☐ partly ☐ no —**

**newell_1985** — Coordination, control, and skill: constraints-led framework · Newell KM · 1985

- *first-strict-pullup says it supports:* Constraints-led framework for skill acquisition. Anchors the treat-sub-skills-as-independent-state-variables approach.
- *muscle-up says it supports:* Constraints-led framework. Anchors treat-sub-skills-as-independent-state-variables.
- *handstand-walk says it supports:* Organismic, task, environmental constraints. Underpins the multi-dimensional decomposition into capability_domains.
- **Does it? ☐ yes ☐ partly ☐ no —**

**potdevin_2018** — Video feedback and self-assessment in gymnastics learning · Potdevin F, et al. · 2018

- *muscle-up says it supports:* n=18 gymnastics children, 8 weeks: KP after ~5 reps improved skill and self-assessment. Anchors the KP-not-every-rep video review dose.
- *handstand-walk says it supports:* n=18 children, 8-week gymnastics: video KP after ~5 reps improved skill and self-assessment. Used in block_skill_B_freestand_search rationale and video_review dosing (not every rep).
- **Does it? ☐ yes ☐ partly ☐ no —**

**proteau_1992** — Specificity of practice: the case of the goal-directed aiming task · Proteau L, Marteniuk RG, Lévesque L · 1992

- *first-strict-pullup says it supports:* Learning is specific to the sensory conditions of practice. Supports the multi-dimensional per-capability approach.
- *muscle-up says it supports:* Learning is specific to sensory conditions of practice. Supports multi-dimensional per-capability approach.
- *handstand-walk says it supports:* Specificity of practice — learning is bound to the sensory context. Underpins the choice to train wall hold + freestand + walk as separate state variables.
- **Does it? ☐ yes ☐ partly ☐ no —**

**reinold_2007** — Current concepts in the scientific and clinical rationale behind exercises for glenohumeral and scapulothoracic musculature · Reinold MM, Escamilla RF, Wilk KE · 2007

- *first-strict-pullup says it supports:* Supraspinatus EMG load data — informs the shoulder-pain-stops-session rule for hang and pull work.
- *muscle-up says it supports:* Supraspinatus EMG data — informs the shoulder-pain-stops-session rule and the pre-session prep dose.
- *handstand-walk says it supports:* Rotator cuff / deltoid activation patterns in overhead loading. Cited in shoulder-endurance contraindication and belly-to-wall hold rationale.
- **Does it? ☐ yes ☐ partly ☐ no —**

**rhea_2003_meta** — A meta-analysis to determine the dose response for strength development · Rhea MR, Alvar BA, Burkett LN, Ball SD · 2003

- *first-strict-pullup says it supports:* General strength dose-response anchor for the weekly hard-rep target. Replaces a retracted reference (Barbalho 2020, retracted April 2020) that previously carried this claim. Rhea establishes the dose-response shape only — the specific 40-60 hard reps/week figure remains coaching consensus and is labelled as such in the tier rationale, not presented as an RCT result.
- **Does it? ☐ yes ☐ partly ☐ no —**

**robertson_2004** — Current concepts in procedural consolidation · Robertson EM, Pascual-Leone A, Miall RC · 2004

- *handstand-walk says it supports:* 4-6h post-practice consolidation window vulnerable to similar-task interference. Underpins the 'don't stack handstand practice immediately after heavy overhead press' placement rule.
- **Does it? ☐ yes ☐ partly ☐ no —**

**rohleder_vogt_2018** — Combined tactile-verbal and visual feedback in gymnastics skill acquisition · Rohleder J, Vogt T · 2018

- *handstand-walk says it supports:* Combined tactile-verbal + visual feedback outperforms either alone. Used in feedback_type rationale and video_review drill design.
- **Does it? ☐ yes ☐ partly ☐ no —**

**roig_2009** — The effects of eccentric versus concentric resistance training on muscle strength and mass in healthy adults: a systematic review with meta-analysis · Roig M, O'Brien K, Kirk G, Murray R, McKinnon P, Shadgan B, Reid WD · 2009

- *first-strict-pullup says it supports:* Meta-analytic evidence: eccentric training produces greater strength gains than concentric-only for matched work (ES 1.02 vs 0.94). Anchors the negatives-as-primary-Tier-B-driver decision.
- *muscle-up says it supports:* Eccentric training produces greater strength gains than concentric-only. Anchors the transition-negative-from-support drill as the highest-transfer analog for the muscle-up transition.
- **Does it? ☐ yes ☐ partly ☐ no —**

**sadowski_2021** — Kinematic and kinetic analysis of the straight-arm press to handstand · Sadowski J, Mastalerz A, Niznikowska E, et al. · 2021

- *muscle-up says it supports:* Press-to-handstand shoulder-moment analysis, cited as the closest available analog for ring-support end-range shoulder load. ATTRIBUTION UNRESOLVED — the DOI resolves to a Mizutori-authored parallel-bars paper; handstand-walk carries the same flag and instructs that the 3x bodyweight figure not be cited. The specific number is therefore withdrawn here too (2026-09-03): the two programmes were shipping opposite instructions about the same citation. The qualitative point — straight-arm press is a high end-range shoulder load — stands without it.
- *handstand-walk says it supports:* Shoulder-moment analysis of the press to handstand. Directly informs the choice NOT to program straight-arm press early, and the Tier A entry at Kinoshita 90°. Attribution flagged for founder review (see citations.json review_note): DOI 10.1371/journal.pone.0253951 resolves to a Mizutori-authored parallel-bars paper. The heavy-shoulder-moment principle survives on general grounds; the specific 3× BW figure was a parallel-bars finding, not a floor finding — do not cite that number.
- **Does it? ☐ yes ☐ partly ☐ no —**

**sands_2000** — Injury prevention in women's gymnastics · Sands WA · 2000

- *first-strict-pullup says it supports:* Skill-readiness assessment and prerequisite gating as an injury-mitigation heuristic. Supports the Tier A → B → C → D gating.
- *muscle-up says it supports:* Skill-readiness assessment and prerequisite gating as injury-mitigation heuristic. Anchors the strict-pull-up + ring-dip prerequisite gate.
- *handstand-walk says it supports:* Skill-readiness assessment as injury mitigation. Cited in prerequisite gating on advanced drills.
- **Does it? ☐ yes ☐ partly ☐ no —**

**schmidt_1975** — A schema theory of discrete motor skill learning · Schmidt RA · 1975

- *first-strict-pullup says it supports:* Schema theory: variability of practice builds recall and recognition schemas. Anchors the grip-width rotation in Tier D.
- *muscle-up says it supports:* Schema theory: variability of practice builds recall and recognition schemas. Anchors the low-ring / jump-assist / strict variety.
- *handstand-walk says it supports:* Schema theory — variability builds recall + recognition schemas. Underpins the variability-of-practice at Tier D (line, markers, precision lane).
- **Does it? ☐ yes ☐ partly ☐ no —**

**sci_reports_2026_handstand_shoulder** — Exploring handstand walking biomechanics and shoulder pain · Angioi M, Hinds N, Twycross-Lewis R, Farmer C, Birn-Jeffery AV · 2026

- *handstand-walk says it supports:* Pain-associated practitioners show a technique-driven compensation pattern. Underpins the non-negotiable 'shoulder pain stops session' rule. Byline and DOI checked against the publisher record on 2026-09-02.
- **Does it? ☐ yes ☐ partly ☐ no —**

**shea_2000** — Practice spacing effects on motor skill acquisition and retention · Shea CH, et al. · 2000

- *first-strict-pullup says it supports:* Spacing effect: spread practice across days beats massed practice on the same day. Anchors the multi-session weekly template and the GtG spacing rule.
- *muscle-up says it supports:* Spacing effect: spread practice across days beats massed practice. Anchors multi-session weekly template.
- *handstand-walk says it supports:* Spacing across days > massing within a day. Underpins daily-short design and the 'don't double up if you miss a session' rule.
- **Does it? ☐ yes ☐ partly ☐ no —**

**shea_morgan_1979** — Contextual interference effects on the acquisition, retention, and transfer of a motor skill · Shea JB, Morgan RL · 1979

- *first-strict-pullup says it supports:* Foundational CI study. Blocked practice benefits acquisition, random benefits retention. Anchors weeks 1-2 blocked, weeks 3+ interleaved.
- *muscle-up says it supports:* Foundational CI study. Blocked practice benefits acquisition, random benefits retention.
- *handstand-walk says it supports:* Foundational contextual-interference paper: blocked better in acquisition, random better in retention. Underpins the weeks-1-2-blocked / weeks-3+-interleaved progression.
- **Does it? ☐ yes ☐ partly ☐ no —**

**simunkova_2024** — Upper-quadrant Y-balance and CKCUEST vs handstand E-score · Šimůnková K, et al. · 2024

- *handstand-walk says it supports:* UQYBT/CKCUEST show NO predictive relationship with handstand E-score. Used to justify NOT gating obstacles / turns on generic upper-quadrant screens, and to reinforce sub-skill-independence principle.
- **Does it? ☐ yes ☐ partly ☐ no —**

**sinnett_2019** — The effect of band-assisted pull-up training on muscular strength and pull-up performance · Sinnett AM, Cheatham SW, Brismée JM · 2019

- *first-strict-pullup says it supports:* Band-assisted pull-up training improves strength and pull-up performance. Supports band assistance as a legitimate groove/volume driver rather than a lesser substitute. (Earlier wording described EMG findings; this is an intervention study and the EMG claim was not verifiable from it — 2026-09-02 citation audit.)
- *muscle-up says it supports:* Band-assisted pull-up training improves strength and pull-up performance. Supports band assistance as a groove/volume driver, and underwrites band-assisted ring dip as the deferral substitute. (Earlier wording described EMG findings; this is an intervention study and the EMG claim was not verifiable from it — 2026-09-02.)
- **Does it? ☐ yes ☐ partly ☐ no —**

**sobera_2019** — Postural control strategies of handstand-trained subjects · Sobera M, Serafin R, Rutkowska-Kucharska A · 2019

- *handstand-walk says it supports:* Elite vs novice difference — medial-lateral CoP control + stiffening strategy. Used in outcome_evidence and freestand hold rationale.
- **Does it? ☐ yes ☐ partly ☐ no —**

**vidal_rovira_2024** — Forearm activation patterns in false-grip vs standard grip on gymnastic rings · Vidal-Rovira R, et al. · 2024

- *muscle-up says it supports:* Higher forearm activation in false-grip vs standard. Small sample, flagged for founder science-advisor review. Supports the false-grip-as-separate-capability framing but is not the load-bearing citation.
- **Does it? ☐ yes ☐ partly ☐ no —**

**vidal_torija_2025** — Wrist symptoms in adult handstand practitioners: a cross-sectional survey · Vidal-Torija A, et al. · 2025

- *handstand-walk says it supports:* 56.7% chronic wrist pain but NO association with weekly training hours, frequency, warm-up, or brace use. Reframes wrist risk as technique-driven, not volume-driven — but supports the volume cap as a conservative upper bound. Attribution flagged for founder review: PMC12550924 resolves to Martonovich et al. (same underlying data). The claim itself survives; the author byline may need to be swapped.
- **Does it? ☐ yes ☐ partly ☐ no —**

**vigouroux_2007** — Estimation of finger muscle tendon tensions and pulley forces during specific sport-climbing grip techniques · Vigouroux L, Quaine F, Labarre-Vila A, Moutet F · 2007

- *first-strict-pullup says it supports:* Tendon tension and pulley force vary substantially by grip technique — the basis for treating grip position as a load variable in hang work. The paper does not establish a hang-time dose; the 20-45s range is coaching convention, not a finding from this source.
- **Does it? ☐ yes ☐ partly ☐ no —**

**walker_2003** — Dissociable stages of human memory consolidation and reconsolidation · Walker MP, Brakefield T, Hobson JA, Stickgold R · 2003

- *first-strict-pullup says it supports:* Dissociable consolidation stages. Supports daily short skill exposure over infrequent long sessions.
- *muscle-up says it supports:* Dissociable consolidation stages. Supports daily short skill exposure.
- *handstand-walk says it supports:* Sleep-dependent motor consolidation. Reinforces daily-short skill exposure over infrequent long sessions. Journal + byline corrected 2026-08-17 — canonical entry in citations.json is now Learning & Memory 10(4):275-284 (matches whitepaper 04).
- **Does it? ☐ yes ☐ partly ☐ no —**

**wiesinger_2019** — Tendon adaptation to mechanical loading · Wiesinger HP, et al. · 2019

- *handstand-walk says it supports:* Tendon adaptation timeframe (8-12 weeks for collagen turnover). Mechanism basis for the wrist volume cap. Note: no direct dose-response study for handstand wrist load — the exact 20-30 min cap is an engineering choice. Flagged for founder review: DOI missing.
- **Does it? ☐ yes ☐ partly ☐ no —**

**wu_2014** — Temporal structure of motor variability is dynamically regulated and predicts motor learning ability · Wu HG, et al. · 2014

- *handstand-walk says it supports:* 3× variance in visuomotor rotation learning correlates with baseline motor variability. Reinforces individual-variance framing.
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

- *handstand-walk says it supports:* Walking initiation biomechanics — CoP shift precedes step. Informs the single_step_attempt drill design and the 'lean the shape toward the far wall' external-focus cue. Replaced ferrari_2021 (unlocatable) 2026-08-18 per founder-approved plan.
- **Does it? ☐ yes ☐ partly ☐ no —**

**youdas_2010** — Surface electromyographic activation patterns and elbow joint motion during a pull-up, chin-up, or perfect-pullup rotational exercise · Youdas JW, Amundson CL, Cicirello KS, Hellmers CJ, Hollman JH · 2010

- *first-strict-pullup says it supports:* EMG hierarchy across pull-up variants — scap phase precedes concentric pull; wide-grip biases lat, neutral biases brachialis. Anchors the scap-first progression and grip-width rotation in Tier D.
- *muscle-up says it supports:* Pull-variant EMG hierarchy. Supports the false-grip-as-separate-capability framing and the grip-position-matters logic. Referenced by the shared drill library.
- **Does it? ☐ yes ☐ partly ☐ no —**


---

## Sign-off

- Name and credential:
- Date reviewed:
- Anything you did **not** review (out of your domain):
- Overall: ☐ ships as-is ☐ ships with the changes flagged ☐ do not ship until fixed
