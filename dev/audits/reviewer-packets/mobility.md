# Reviewer packet — Shoulder mobility

**Generated 2026-09-06 from the shipping program data.** Regenerate with
`python3 dev/scripts/build-reviewer-packet.py`; do not edit by hand, or it
will start describing a program that no longer ships.

<!-- source-fingerprint: bcd6e18c70eaffb3 -->

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

**bullock_2019** — Shoulder range of motion and baseball arm injuries: a systematic review and meta-analysis · Bullock GS, Faherty MS, Ledbetter L, Thigpen CA, Sell TC · 2018

- *overhead-mobility says it supports:* Systematic review and meta-analysis in prospectively followed baseball players: high-quality evidence that deficits in throwing-arm total rotational arc and internal rotation are associated with upper-extremity injury. Cited for the rotational-ROM construct, and it establishes that construct only as an injury-risk marker in throwers. Engineering choice: including a rotational component alongside supine flexion in the retest for a general, non-throwing overhead-mobility population is a coaching judgement; an injury association in throwers does not by itself establish that the retest is informative here. Does NOT support the thoracic-to-shoulder pathway; that rationale rests on Kim 2013 plus coaching consensus. Corrected 2026-09-05: the record described a 2019 paper on baseball throwing PERFORMANCE that does not exist; the real paper is the 2018 meta-analysis on arm INJURY, and the programme's url was a PubMed search query rather than a record.
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

**kibler_2013** — Clinical implications of scapular dyskinesis in shoulder injury: the 2013 consensus statement from the Scapular Summit · Kibler WB, Ludewig PM, McClure PW, Michener LA, Bak K, Sciascia AD · 2013

- *overhead-mobility says it supports:* This programme means Kibler WB & Sciascia A (2010), 'Current concepts: scapular dyskinesis', BJSM 44(5):300-305 (PMID 19996329, DOI 10.1136/bjsm.2009.058834) - a DIFFERENT paper from the one the id kibler_2013 now serves. That paper describes a scapular examination consisting of visual inspection of scapular position at rest and during dynamic humeral movement, objective posture measurement and scapular corrective manoeuvres, and concludes that scapular dyskinesis 'appears to be a non-specific response to a painful condition in the shoulder rather than a specific response to certain glenohumeral pathology'. Corrected 2026-09-05: two things. (1) The id collision: kibler_2013 was resolving to the 2010 paper in citations.json while first-strict-pullup and muscle-up described the 2013 Scapular Summit consensus. The canonical record now serves the 2013 consensus; the 2010 paper needs its own id before this reference resolves correctly, and this reference should keep verification_status 'unverified' until it does. (2) 'SICK scapula screening pattern' is withdrawn: that term does not appear in the retrieved 2010 abstract, and the full text was unreachable (BMJ interstitial, not in PMC), so it can be neither confirmed nor excluded. SICK scapula is a separately named syndrome from a different paper. The screen this programme runs stands as an engineering choice built on the 2010 examination description.
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

**manske_2010** — A randomized controlled single-blinded comparison of stretching versus stretching and joint mobilization for posterior shoulder tightness measured by internal rotation motion loss · Manske RC, Meschke M, Porter A, Smith B, Reiman M · 2010

- *overhead-mobility says it supports:* Randomised single-blinded trial in 39 ASYMPTOMATIC college-age participants (7 men, 32 women) comparing a CROSS-BODY stretch alone against cross-body stretch plus posterior joint mobilisation, with internal-rotation motion loss as the outcome. The combined group gained more internal rotation, but the between-group difference was not statistically significant. Corrected 2026-09-05: this read 'sleeper stretch effectiveness for posterior capsule tightness'. The trial tested the cross-body stretch, not the sleeper stretch, and choosing between those two is precisely what the citation was meant to settle; the participants were asymptomatic rather than people with symptomatic posterior capsule tightness; and the difference it did find was not significant. Prescribing the sleeper stretch is an engineering choice with no trial behind it here. The verification_status 'verified' flag on this reference was wrong for this use and should read 'unverified' - note it is stripped by Zod and has no runtime meaning either way. The record's PubMed search-string url is replaced by PMID 23015927.
- **Does it? ☐ yes ☐ partly ☐ no —**

**reinold_2007** — Electromyographic analysis of the supraspinatus and deltoid muscles during 3 common rehabilitation exercises · Reinold MM, Macrina LC, Wilk KE, Fleisig GS, Dun S, Barrentine SW, Ellerbusch MT, Andrews JR · 2007

- *overhead-mobility says it supports:* This id now resolves to the EMG study, J Athl Train 42(4):464-469, PMID 18174934: 22 asymptomatic subjects, three isolated cuff exercises, no difference among them for supraspinatus. The cross-drill activation catalogue this programme actually described is a different work, Reinold, Escamilla and Wilk, JOSPT 2009;39(2):105-117, PMID 19194023, a narrative review the authors grade Level of Evidence 5; it needs its own citation id before Phase 2 copy can cite it. Neither paper states that cuff activation must precede end-range loading, so the light-load bias is an engineering choice, as this programme's own engineering_choices_flagged block already says. Corrected 2026-09-05: the record was dated 2007 at JOSPT 37(11):659-670, a locator with zero results, for a paper published in 2009, and a hard rule was attributed to text that is in neither abstract.
- **Does it? ☐ yes ☐ partly ☐ no —**

**sadowski_2021** — Kinematics and joint moments during the press to handstand · Mizutori H, et al. · 2021

- *overhead-mobility says it supports:* Shoulder-moment analysis for the straight-arm press to handstand — informs the no-heavy-load-early rule. Attribution flagged for founder review (see citations.json review_note): DOI resolves to a Mizutori-authored floor study; the 3× BW figure is a parallel-bars finding, not a floor finding. Terav uses this only for the general 'heavy shoulder moment early is unsafe' principle, not for a specific numeric threshold. CORRECTED 2026-09-05: the byline said Sadowski and no such paper exists, but the DOI was always right and resolves to Mizutori et al. It is a FLOOR study, not parallel bars, and the 3x bodyweight figure lived in its introduction quoting someone else. Its real finding — less-skilled performers produced LARGER shoulder flexion moments — supports this rule better than the withdrawn number.
- **Does it? ☐ yes ☐ partly ☐ no —**

**salmoni_schmidt_walter_1984** — Knowledge of results and motor learning: a review and critical reappraisal · Salmoni AW, Schmidt RA, Walter CB · 1984

- *overhead-mobility says it supports:* Guidance hypothesis; feedback frequency in mobility drill acquisition
- **Does it? ☐ yes ☐ partly ☐ no —**

**sands_2000** — Injury prevention in women's gymnastics · Sands WA · 2000

- *overhead-mobility says it supports:* Narrative review of injury prevention in women's artistic gymnastics. It offers a framework of thinking - prevention grounded in science and medicine plus intimate knowledge of the demands of the movement - and no protocol, no effect size and no comparison; the full text is paywalled. Corrected 2026-09-05: previously described as a 'skill-readiness assessment framework' informing prerequisite gating. It is not an assessment framework. The prerequisite gating in this programme is an engineering choice, and the paper's population (young elite female gymnasts) is far from adult users working on overhead position.
- **Does it? ☐ yes ☐ partly ☐ no —**

**shea_morgan_1979** — Contextual interference effects on the acquisition, retention, and transfer of a motor skill · Shea JB, Morgan RL · 1979

- *overhead-mobility says it supports:* Contextual interference in motor learning — blocked-first, random after
- **Does it? ☐ yes ☐ partly ☐ no —**

**walker_2003** — Sleep and the time course of motor skill learning · Walker MP, Brakefield T, Seidman J, Morgan A, Hobson JA, Stickgold R · 2003

- *overhead-mobility says it supports:* Sleep-dependent consolidation of a motor pattern: doubling the amount of initial finger-tapping training did not increase the overnight gain, which is what the daily-short rationale leans on. A laboratory keypress task, so its application to mobility drills is an engineering choice. Corrected 2026-09-05: the record kept the Nature paper's title and byline over this Learning & Memory locator; the correct record is Walker MP, Brakefield T, Seidman J, Morgan A, Hobson JA, Stickgold R, 'Sleep and the time course of motor skill learning', Learn Mem 10(4):275-284, PMID 12888546.
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
