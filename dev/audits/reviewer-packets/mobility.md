# Reviewer packet — Shoulder mobility

**Generated 2026-09-04 from the shipping program data.** Regenerate with
`python3 dev/scripts/build-reviewer-packet.py`; do not edit by hand, or it
will start describing a program that no longer ships.

<!-- source-fingerprint: ec7db72bea3ebd55 -->

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

A physiotherapist working in shoulder rehabilitation or overhead sport.

## Time

About 40 minutes. The citation list is the bulk of it; skim anything
outside your domain and say so rather than guessing.

## What happens to your answers

Recorded in the program file as `specialist_review` — your name, credential,
date and scope, plus every change you asked for and whether we made it. That
record is public. If we disagree with something you flag, the disagreement
is published too, not quietly dropped.

---

## overhead-mobility

**Goal the program sells:** Loaded overhead shoulder flexion — target 180 degrees, stretch 190.

**What it tells users it does:** Shoulder + thoracic + scap sequence for stronger snatch, OHS, and press. Kinematic base before load.

**What it promises by the end:** By week 10: loaded shoulder flexion at 180°, empty-bar OHS to parallel or better, first snatch-grip Sotts press. Retest via goniometer + OHS depth.

### Entry tiers

- **foundation** — Foundation — Wall-arm-raise fails / can't reach vertical. 

- **progression** — Progression — Vertical passive, loaded overhead is stiff. 

- **push** — Push — Vertical loaded, chasing efficiency + endurance. 


### Phases and what each is for

- **Kinematic base · Weeks 1–3** (3 wks) — Build passive ROM + scap sequencing before we add load.
- **Active + light-loaded · Weeks 4–7** (4 wks) — Add active ROM + light loaded overhead. Sotts press, TGU, empty bar OHS.
- **Load + retest · Weeks 8–10** (3 wks) — Consolidate loaded ROM. Retest at week 10.

### What it retests, and how often

- **shoulder_flexion_supine_deg** — Supine passive shoulder flexion (elbows-to-floor) (3-weekly)
- **ohs_depth_ratio** — Overhead squat depth (hip crease vs top of knee) (5-weekly)
- **tgu_hold_max_seconds** — Turkish get-up hold time (best of L / R) (5-weekly)

### What it asks, and what each answer does

- **Realistically, how many days per week can you commit?**  
  `days_per_week` — answers: 2, 3, 4, 5, 6, 7
- **Lie flat, arms overhead — how close can you get elbows to the floor?**  
  `shoulder_flexion_baseline` — answers: far, mid, near, vertical
- **Do you currently snatch, OHS, or press overhead?**  
  `current_overhead_lifts` — answers: none, occasional, regular
- **Does anything hurt in the last 30 degrees of overhead reach?**  
  `shoulder_pain_flexion` — answers: no, occasionally, yes
  - BLOCKS on ['yes'] → "This programme loads the range that hurts"
  - warns, then continues on ['occasionally'] → "Watch that range as you load it"
- **Diagnosed rotator-cuff tear, or persistent rotator cuff-related shoulder pain (also called impingement)?**  
  `rotator_cuff_dx` — answers: no, unsure, yes
  - BLOCKS on ['yes'] → "See your physio first"
  - warns, then continues on ['unsure'] → "Worth finding out which it is"
- **Shoulder dislocation or subluxation in the last 12 months?**  
  `post_dislocation_recent`
  - BLOCKS on ['true'] → "Get clinician clearance first"
- **Recent neck flare or radicular pain into the arm?**  
  `cervical_flare_recent`
  - BLOCKS on ['true'] → "Settle the neck first"
- **Has one shoulder lost range in ALL directions over weeks or months — including when someone else moves it for you?**  
  `frozen_shoulder` — answers: no, unsure, yes
  - BLOCKS on ['yes'] → "That needs its own protocol"
  - warns, then continues on ['unsure'] → "Worth having that pattern checked"
- **Sharp, well-localised pain right on top of the shoulder, where the collarbone meets the shoulder blade?**  
  `ac_joint_pain` — answers: no, unsure, yes
  - warns, then continues on ['yes'] → "End-range work can stir that up"
  - warns, then continues on ['unsure'] → "Watch that spot as you load overhead"
- **I consent to storing training log + symptom scores.**  
  `consent_symptom_data`

### Conditions the program says it should exclude

Printed against the questions above so you can see which are actually detectable.

- Diagnosed rotator-cuff tear (partial or full) — needs physio pathway
- Recent shoulder dislocation / subluxation — capsule stability first
- Cervical radicular symptoms into the arm — needs workup
- Adhesive capsulitis (frozen shoulder) — separate rehab protocol
- Active AC-joint irritation — end-range flexion can amplify

**Is anything missing — who should this refuse to take that it currently accepts? ☐ no ☐ yes —**


---

# Citations for this domain

19 unique papers across 1 programs. Where a paper backs more than one claim, every claim is listed under it — a paper stretched across two claims is worth a second look.

**bullock_2019** — Shoulder range of motion and baseball throwing performance · Bullock GS, Faherty MS, Ledbetter L, Thigpen CA, Sell TC · 2019

- *overhead-mobility says it supports:* Shoulder rotational ROM (IR + total arc) in throwers — supports the retest choice to include a rotational component alongside supine flexion. Does NOT directly support the thoracic→shoulder pathway; the thoracic-prep rationale rests on Kim 2013 + coaching consensus.
- **Does it? ☐ yes ☐ partly ☐ no —**

**chiviacowsky_wulf_2002** — Self-controlled feedback: does it enhance learning because performers get feedback when they need it? · Chiviacowsky S, Wulf G · 2002

- *overhead-mobility says it supports:* Self-controlled feedback in drill acquisition
- **Does it? ☐ yes ☐ partly ☐ no —**

**difiori_2006** — Wrist pain, distal radial physeal injury, and ulnar variance in the young gymnast · DiFiori JP, Caine DJ, Malina RM · 2006

- *overhead-mobility says it supports:* Wrist-tolerance considerations if program includes handstand-adjacent work
- **Does it? ☐ yes ☐ partly ☐ no —**

**escamilla_2009** — Shoulder muscle activity and function in common shoulder rehabilitation exercises · Escamilla RF, Yamashiro K, Paulos L, Andrews JR · 2009

- *overhead-mobility says it supports:* EMG-guided drill selection — informs scap-activation block content
- **Does it? ☐ yes ☐ partly ☐ no —**

**karni_1998** — The acquisition of skilled motor performance: fast and slow experience-driven changes in primary motor cortex · Karni A, Meyer G, Rey-Hipolito C, et al. · 1998

- *overhead-mobility says it supports:* Fast vs slow motor learning; consolidation window
- **Does it? ☐ yes ☐ partly ☐ no —**

**kibler_2013** — Current concepts: scapular dyskinesis · Kibler WB, Sciascia A · 2010

- *overhead-mobility says it supports:* SICK scapula screening pattern. Year corrected from 2013 → 2010 per review — BJSM 44(5) is the 2010 current-concepts paper. Keeping the citation `id: kibler_2013` for stability of downstream references.
- **Does it? ☐ yes ☐ partly ☐ no —**

**kim_2013** — Reliability of shoulder ROM measurement in supine position · Kim SH, Kim HK, Kim MY · 2013

- *overhead-mobility says it supports:* Supine flexion goniometer reliability — the retest_metric anchor
- **Does it? ☐ yes ☐ partly ☐ no —**

**ludewig_cook_2000** — Alterations in shoulder kinematics and associated muscle activity in people with symptoms of shoulder impingement · Ludewig PM, Cook TM · 2000

- *overhead-mobility says it supports:* Altered scap kinematics observed alongside impingement symptoms (the paper's own term); foundational rationale for scap-first sequencing. Association, not a demonstrated pathway.
- **Does it? ☐ yes ☐ partly ☐ no —**

**ludewig_reynolds_2009** — The association of scapular kinematics and glenohumeral joint pathologies · Ludewig PM, Reynolds JF · 2009

- *overhead-mobility says it supports:* Scap upward-rotation lag correlates with symptomatic impingement; drives phase-1 emphasis
- **Does it? ☐ yes ☐ partly ☐ no —**

**manske_2010** — A randomized controlled single-blinded comparison of stretching versus stretching and joint mobilization for posterior shoulder tightness · Manske RC, Meschke M, Porter A, Smith B, Reiman M · 2010

- *overhead-mobility says it supports:* Sleeper stretch effectiveness for posterior capsule tightness — engineering choice reference
- **Does it? ☐ yes ☐ partly ☐ no —**

**reinold_2007** — Current concepts in the scientific and clinical rationale behind exercises for glenohumeral and scapulothoracic musculature · Reinold MM, Escamilla RF, Wilk KE · 2007

- *overhead-mobility says it supports:* Rotator-cuff activation levels across drill variants; informs light-load rationale in Phase 2
- **Does it? ☐ yes ☐ partly ☐ no —**

**sadowski_2021** — Kinematic and kinetic analysis of the straight-arm press to handstand · Sadowski J, Mastalerz A, Niznikowska E, et al. · 2021

- *overhead-mobility says it supports:* Shoulder-moment analysis for the straight-arm press to handstand — informs the no-heavy-load-early rule. Attribution flagged for founder review (see citations.json review_note): DOI resolves to a Mizutori-authored parallel-bars study; the 3× BW figure is a parallel-bars finding, not a floor finding. Terav uses this only for the general 'heavy shoulder moment early is unsafe' principle, not for a specific numeric threshold.
- **Does it? ☐ yes ☐ partly ☐ no —**

**salmoni_schmidt_walter_1984** — Knowledge of results and motor learning: a review and critical reappraisal · Salmoni AW, Schmidt RA, Walter CB · 1984

- *overhead-mobility says it supports:* Guidance hypothesis; feedback frequency in mobility drill acquisition
- **Does it? ☐ yes ☐ partly ☐ no —**

**sands_2000** — Injury prevention in women's gymnastics · Sands WA · 2000

- *overhead-mobility says it supports:* Skill-readiness assessment framework — informs prerequisite gating
- **Does it? ☐ yes ☐ partly ☐ no —**

**shea_morgan_1979** — Contextual interference effects on the acquisition, retention, and transfer of a motor skill · Shea JB, Morgan RL · 1979

- *overhead-mobility says it supports:* Contextual interference in motor learning — blocked-first, random after
- **Does it? ☐ yes ☐ partly ☐ no —**

**walker_2003** — Dissociable stages of human memory consolidation and reconsolidation · Walker MP, Brakefield T, Hobson JA, Stickgold R · 2003

- *overhead-mobility says it supports:* Sleep-dependent consolidation of motor patterns — the daily-short rationale relies on the sleep-consolidation finding. Journal + byline corrected from Neuroscience 133(4):911-917 per review of whitepaper 04.
- **Does it? ☐ yes ☐ partly ☐ no —**

**wulf_1998** — Instructions for motor learning: differential effects of internal versus external focus of attention · Wulf G, Höß M, Prinz W · 1998

- *overhead-mobility says it supports:* External-focus cue foundation
- **Does it? ☐ yes ☐ partly ☐ no —**

**wulf_2013** — Attentional focus and motor learning: a review of 15 years · Wulf G · 2013

- *overhead-mobility says it supports:* External-focus cue meta — cited on every drill card
- **Does it? ☐ yes ☐ partly ☐ no —**

**wulf_shea_2002** — Principles derived from the study of simple skills do not generalize to complex skill learning · Wulf G, Shea CH · 2002

- *overhead-mobility says it supports:* Complex motor skill acquisition; informs blocked-then-random session structure
- **Does it? ☐ yes ☐ partly ☐ no —**


---

## Sign-off

- Name and credential:
- Date reviewed:
- Anything you did **not** review (out of your domain):
- Overall: ☐ ships as-is ☐ ships with the changes flagged ☐ do not ship until fixed
