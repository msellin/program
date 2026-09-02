# Adversarial citation panel — the three gymnastics programmes (2026-09-02)

Three reviewers, each instructed to **refute rather than confirm**, read the same
41-citation packet covering `first-strict-pullup`, `muscle-up` and
`handstand-walk`, plus the shipped program JSON and `citations.json`.

| Reviewer | Assessed | Flagged |
|---|---|---|
| gymnastics-coach | 41 | 32 |
| upper-limb-physio | 41 | 37 |
| motor-learning-scientist | 41 | 36 |

Flagged by all three: **30**. Flagged by some and not others: **9**. Clean on the
claim attached: **2** (`wulf_1998`, `wulf_2013` — and one reviewer noted the
external-focus replication record is weaker than Wulf 2013 implies).

## What this is not

These are three **AI expert personas**, not clinicians, not a literature search,
and not an independent review. None of them had database access; several
"cannot_assess" verdicts mean exactly that — the paper could not be pulled. Two
of the three explicitly said their clinical thresholds (blood pressure, ocular,
bone density, hypermobility loading) are a physician's call and not theirs.

**This changes nothing user-facing on its own.** It does not move the VERIFIED
badge, and it does not alter the ladder copy, which continues to say that no
specialist has independently signed off any programme. That statement remains
true after this pass and is more clearly true than before it: the panel found
citations with placeholder authors, pending verification status, missing DOIs and
acknowledged misattributions still shipping behind a `status: REVIEWED` field.

A finding here is a **candidate defect**, not a verified one. The output of this
pass is a work queue and a short list to put in front of a human.

---

## Part 1 — Consensus (30 citations, all three reviewers)

Consensus is the cheap signal. Three personas drawn from one underlying model
share blind spots, so agreement mostly tells you the problem is *legible* — an
obvious population mismatch, a missing DOI, a placeholder byline. Most of these
are fixable without a specialist. Work them in this order.

### 1A · Remove — the citation should not ship at all (4)

**`sci_reports_2026_handstand_shoulder`** — the `authors` field is the literal
string "Sci Reports handstand-walk shoulder pain team", `display_short` renders
"Sci et al. 2026", and the repo's own note records that existence at the claimed
URL is unconfirmed. All three: this is not a citation.
→ **Action: delete the entry. The stop-on-shoulder-pain rule stands on general
grounds and needs no reference.** Ship the rule uncited rather than cited to a
possibly-nonexistent paper.

**`sadowski_2021`** — the repo already recorded that DOI 10.1371/journal.pone.0253951
resolves to a Mizutori parallel-bars paper and instructed "do not cite that
number". The retraction was applied to `handstand-walk` **only**. `muscle-up.json`
still ships the 3× bodyweight shoulder-moment figure in three places
(ring-support rationale, straight-arm lockout rationale, `shoulder_pain_stops_session`),
and extends it with an unmeasured claim that ring support lockout "sees similar
peak moments".
→ **Action: this is the highest-priority item in the document. Strip the figure
from all three locations in `muscle-up.json` and remove the ring-support
extrapolation. A withdrawn number is shipping to users in a sibling programme.**

**`kinoshita_2022`** — DOI missing, unverifiable, already flagged internally, and
it is the *sole* support for `block_skill_A_kinoshita` and the Tier A entry
threshold. Even taken at face value, an acute EMG study of four static positions
has no learning outcome, no retention test, and no comparison of ladder
orderings.
→ **Action: pull the full text or drop it. Until then, relabel the four-position
ladder as a coaching progression and remove "validated by EMG activity" from
`used_for`. It cannot validate a training sequence either way.**

**`vidal_rovira_2024`** — `source` reads "Preprint / conference — verification
required", url null, `verification_status` pending. Two reviewers could not
assess it. One noted that if the finding is real, higher forearm activation in
false grip argues for *capping* false-grip volume, not for the programme's use
of it.
→ **Action: remove from a citation list presented to users as evidence, even
when labelled not-load-bearing. If retained, flip its `used_for` to the load
warning it actually implies.**

### 1B · Narrow the `used_for` — real paper, over-claimed (13)

These are all the same defect class: an acute EMG, a cross-sectional
description, or a lab task carrying a training prescription it cannot carry.

| Citation | What it actually is | What to cut from `used_for` |
|---|---|---|
| `youdas_2010` | Pull-up vs chin-up vs Perfect-Pullup device, 25 adults, mean EMG | Both claims fail. No wide-grip condition, no static neutral grip, no temporal analysis. Drop "scap phase precedes concentric pull" and "wide-grip biases lat, neutral biases brachialis" entirely — the Tier D grip rotation loses its only support |
| `dickie_2017` | Acute sEMG, bar grip variations, trained men | No rings, no false grip. Cannot support false-grip-as-its-own-capability, cannot order a drill library |
| `ludewig_cook_2000` | Construction workers ± impingement, open-chain elevation, kinematics + EMG | No endurance outcome, no inversion. **The 170° shoulder-flexion prerequisite has no source in this paper** — either find one or state it as a coaching threshold |
| `reinold_2007` | JOSPT EMG review, open-chain cuff/scapular rehab, healthy subjects | No hanging, no pull-ups, no pain-provocation protocol. Keep for prep-exercise selection; remove from the stop-on-pain rule |
| `kibler_2013` | Kibler & Sciascia **2010** narrative review, scapular dyskinesis | Bibliographic mismatch (id says 2013). No intervention arm; dyskinesis is common in asymptomatic overhead athletes. Cannot support "shoulder prep before every session" as prophylaxis |
| `roig_2009` | Eccentric vs concentric meta, isokinetic/machine, healthy adults | The headline advantage was **not significant overall**; ES 1.02 vs 0.94 is presented as settled. Keep the general eccentric point; **delete the muscle-up use entirely** — Roig has no transfer data, so it cannot rank the transition negative as "highest-transfer" |
| `sands_2000` | Narrative injury-prevention review, young female artistic gymnasts | Gating discussed as good practice, never demonstrated to reduce injury. Cannot justify the specific 3-pull-up / 3-ring-dip number |
| `rhea_2003_meta` | Dose-response in %1RM, barbell/machine | %1RM of a pull-up is undefined for Tier A/B users. The packet already labels 40–60 hard reps/week as consensus — say so and stop citing Rhea for it. Note it partly argues *against*: Rhea's trained optimum is ~2 sessions/muscle group/week, the programme runs 3–5 plus daily singles |
| `vigouroux_2007` | Finger pulley force modelling, crimp vs slope, climbers | A2/A4 loading arises from DIP hyperextension in a crimp, absent in a wrapped bar hang. Keep only "grip position changes tendon load"; the 20–45 s dose is convention |
| `karni_1998` | fMRI finger-opposition sequence, small n | No fatigue, no load, no comparison of practice distributions. Cannot license daily submaximal pull-up singles |
| `shea_2000` | Lab motor task, one vs two sessions/day | The spacing effect is real. It does not set a 4–6 day/week prescription and says nothing about the "don't double up if you miss a session" rule |
| `potdevin_2018` | n=18 **children**, 8-week school PE | The "KP after ~5 reps" dose is a protocol artefact, never compared against other frequencies. Carrying the video-review dose in two programmes on this is too much weight for one small paediatric sample |
| `kerwin_trewartha_2001` / `sobera_2019` | Descriptive kinetics / cross-sectional CoP, trained vs untrained | Both describe the endpoint, not the route. `sobera_2019` sits under `outcome_evidence`, where a between-group difference reads as a training effect — selection and survivorship explain it entirely. Move out of `outcome_evidence` |

### 1C · Wrong mechanism — the rule may be right, the citation is not (3)

**`robertson_2004`** — the consolidation-interference window requires a
*competing motor memory* (opposing force fields, conflicting sequences). A heavy
overhead press is a fatigue and tissue-load problem, not an interfering motor
memory.
→ **Action: keep the placement rule, restate its rationale as fatigue, drop the
citation.**

**`henry_1968`** — the specificity hypothesis says there is no general motor
ability. It does not license decomposing one skill into independently trained
sub-skills, and it contains nothing about "weakest capability first", which
three phase notes attribute to it as "(Henry 1968)". One reviewer argued it cuts
*against* the architecture: under strict specificity, whether dead hang / scap
pull / ring row transfer to a strict pull-up is exactly the open question.
→ **Action: remove "(Henry 1968)" from the three phase notes. Weakest-first is
an engineering choice — label it as one.**

**`yiou_2017`** — gait initiation in upright bipedal stance; the APA depends on
unloading a free swing limb. A handstand step has no swing-limb unloading and
inverted-pendulum mechanics. All three flagged the provenance: it was introduced
in 2026-08 to replace an unlocatable citation for a drill that already existed.
→ **Action: drop it. Do not backfill a replacement — the drill order came first
and does not need a paper.**

**`difiori_2006`** — distal radial *physeal* stress injury in skeletally immature
gymnasts. The physis does not exist in the adult population served, so it is not
a mechanism analog for adult low-BMD fragility. It is the only citation attached
to the osteoporosis block.
→ **Action: keep the osteoporosis precaution, remove the analog framing. The
precaution is defensible unsourced; it is not defensible mis-sourced.**

### 1D · Correction applied in one place and not the other (2)

**`sinnett_2019`** — the 2026-09-02 audit removed the EMG claim as unverifiable
from the citation blurb. **It is still live verbatim in the shipped text**:
`first-strict-pullup.json`'s `band_assistance_is_a_tool_not_the_goal` principle
and `block_band_assist`'s note both still assert the lower-EMG finding. Users
read the principle, not the blurb. `verification_status` is still pending, url
null, source recorded as "JSCR (or proceedings)" — possibly a conference
abstract. It is separately used in `muscle-up` to underwrite band-assisted ring
dip, a different movement in a different plane.
→ **Action: propagate the retraction into the principle text and the block note.
Remove the muscle-up use.**

**`walker_2003`** — the 2026-08-17 "correction" introduced a new error. The entry
now pairs the *Nature* 425:616–620 title and byline with the *Learning & Memory*
10(4):275–284 source, while `first-strict-pullup.json`'s inline `evidence_base`
still says Nature 425. Two different real Walker 2003 papers have been spliced.
On content, finger-tapping sleep consolidation concerns what happens *between*
sessions, not session length.
→ **Action: pick one paper, fix the metadata in both files, and drop "supports
daily short over infrequent long" — neither paper compares session
distributions.**

### 1E · Inference runs backwards from a null (2)

**`vidal_torija_2025`** — attribution already known wrong (PMC12550924 resolves to
Martonovich et al.). The larger problem: a null association between weekly hours
and chronic wrist pain in a **cross-sectional survey** is what reverse causation
produces — people whose wrists hurt train less, compressing the exposure range.
"Risk is technique-driven, not volume-driven" is not available from this design,
and technique was not measured. This null is the stated basis for how the
programme treats wrist volume.
→ **Action: fix the byline, and remove the volume-safety inference. It is
load-bearing for the programme's weakest safety area.**

**`simunkova_2024`** — a null cross-sectional finding that UQYBT/CKCUEST do not
predict handstand **E-score** is used as positive justification for *not* gating
advanced drills. E-score is a judged execution measure in already-competent
gymnasts; the study measured no injury outcome at all.
→ **Action: remove the "screens don't predict, so no gate" argument. Absence of a
detected relationship is not evidence of absence, and performance prediction is
not injury risk.**

### 1F · Cited to support a design the app cannot deliver (2)

**`rohleder_vogt_2018`** — the winning condition is **combined tactile-verbal plus
visual** feedback. Terav's video review is visual-only, i.e. the arm the study
reports as inferior. Cited honestly, this paper is evidence against the feature
it is attached to. Source metadata is also unresolved (two journals listed).
→ **Action: either cite it accurately — video-only is the weaker condition, and
say so in the copy — or drop it.**

**`wiesinger_2019`** — tendon adaptation timeframes come from Achilles and
patellar tendon under tensile cyclic load. The wrist in a handstand is axial
compression at end-range extension; the limiting tissues are radiocarpal
surfaces, TFCC and dorsal impingement. DOI missing.
→ **Action: tissue-category mismatch — drop the citation, keep the 20–30 min cap
as the engineering choice it already admits to being. And then **enforce** it
(see P-1).**

### 1G · Cannot assess — needs library access (2, plus the pending ones above)

**`baker_2025_review`** — designated **anchor citation for the entire handstand
evidence_base**, and none of the three could place it. Two other 2024–26
references in the same programme already have wrong attribution or unconfirmed
existence.
→ **Action: someone pulls PMC12745452 and records what it actually concludes
about prerequisite thresholds, or the anchor designation comes off.** A
biomechanics systematic review drawn from trained gymnasts in labs is
descriptive and cannot support prescriptive content regardless.

**`barlow_2020`** — no reviewer could locate a Journal of Hand Therapy paper
establishing that wrist weight-bearing tolerance declines from age 45; the
threshold reads too clean. It is also **moot in practice**: `age_band` appears
exactly once in `handstand-walk.json` — the intake question — whose option hint
promises "extra ramp built in". No ramp exists.
→ **Action: either build the ramp or delete the promise from the hint. Present
the age band as precaution, not finding, until the paper is confirmed.**

---

## Part 2 — Contested (9) · the section that matters

A panel drawn from one underlying model has correlated blind spots. Where all
three agree, the finding is usually *obvious*. Where they **disagree**, at least
one reviewer applied domain knowledge the others did not have, which is the only
place this exercise produced information a fourth persona would not have
reproduced.

**Do not resolve these by majority.** Each is an open question for a human
specialist. Five of the nine were flagged by the motor-learning scientist and/or
the physio and *not* by the coach — the pattern is that the theoretical-inference
problems are invisible from the gym floor, which is precisely why they survived
authoring.

### Q1 · `newell_1985` — does the constraints framework support decomposition, or forbid it?

- **motor-learning-scientist (not_supported):** Newell is an explicitly
  anti-decompositional, ecological account — coordination *emerges* from the
  interaction of organismic, task and environmental constraints. Citing it to
  justify "treat sub-skills as independent state variables" inverts the paper's
  central argument.
- **upper-limb-physio (partly):** a theoretical chapter with no empirical test;
  constraints-led coaching prescribes representative whole-task practice with
  manipulated constraints, close to the opposite of what it is cited for.
- **gymnastics-coach:** did not flag.

**Why it matters:** this is not one citation. Together with `henry_1968` and
`proteau_1992`, it is the theoretical footing for the **entire
`multi_dimensional` weakest-capability-first generator** across all three
programmes. If the reading is inverted, the architecture is uncited rather than
wrong — but it is currently presented to users as evidence-derived.
**Question for a human:** does any motor-learning literature support training
sub-capabilities separately over representative whole-task practice for a skill
of this class? If not, the generator stays and the citations go.

### Q2 · `proteau_1992` — specificity of practice endorses the substitute drills, or warns against them?

- **motor-learning-scientist (partly):** the claim is stated accurately, but the
  inference runs backwards. Specificity of practice predicts that wall handstand,
  low-ring muscle-up and band-assisted pull-up transfer **poorly** to the target
  condition. It is a warning about the substitute drills, not an endorsement of
  training them as separate variables.
- **upper-limb-physio (partly):** lab manual aiming with vision manipulated;
  nothing whole-body. Also notes `citations.json`'s `review_note` records a prior
  mix-up between two Proteau 1992 papers and describes the rationale in **rowing
  race-pace** terms — the entry looks carried over from another domain.
- **gymnastics-coach:** did not flag.

**Question for a human:** if specificity holds, how much of the assisted-drill
ladder is justified at all? That is a design question, not a citation question.

### Q3 · `schmidt_1975` — is grip rotation parameter variation, or a different task?

- **motor-learning-scientist (partly):** schema theory's variability-of-practice
  prediction concerns parameter variation *within one generalised motor
  programme*, and adult support is weak (van Rossum's review largely
  unsupportive). Rotating grip width, or line vs marker vs precision walking, is
  variation *between task variants*.
- **upper-limb-physio (partly):** same, plus a load argument the scientist did
  not make — grip width changes muscle recruitment per the packet's own EMG
  citations, so it is arguably a different task, **and rotating into chin-up and
  neutral grips is the specific volume pattern that produces medial
  epicondylalgia**.
- **gymnastics-coach:** did not flag.

**Question for a human:** the physio's version turns a citation problem into a
safety problem. Worth a clinician's read of the Tier D grip rotation on its own.

### Q4 · `chiviacowsky_wulf_2002` — self-controlled feedback across task classes

- **upper-limb-physio (partly):** self-controlled knowledge of **results** on a
  lab timing task vs the app's self-selected video knowledge of **performance**
  on a whole-body skill — different feedback type, different task class. Notes
  self-controlled learning has had notable replication failures since 2002.
- **motor-learning-scientist (partly):** same reading, and adds that
  self-controlled feedback is itself one of the simple-task principles
  `wulf_shea_2002` flags as possibly non-generalising.
- **gymnastics-coach:** did not flag.

### Q5 · `wulf_shea_2002` — the caveat that is cited once and then ignored

- **motor-learning-scientist (partly), alone:** the paper is cited correctly for
  the contextual-interference caveat and then ignored everywhere else. Its
  argument is general — simple-lab-task principles may not transfer to complex
  skills — yet the programmes go on to apply self-controlled feedback
  (beanbag aiming), reduced-KP dosing (n=18 children), schema variability
  (discrete timing) and spacing (finger/balance tasks) to whole-body skills
  without the same discount. **The paper is being used to license one exception
  rather than as the constraint it is.**

**This is the single most interesting finding in the document** and only one
reviewer produced it. It is a claim about the *pattern* of citation across the
packet rather than about any one entry, which is exactly the kind of thing a
majority vote discards. If it holds, roughly twenty skill-acquisition citations
need the same discount applied uniformly, and the programme copy needs to stop
presenting lab-task principles as established for these skills.

### Q6 · `shea_morgan_1979` — blocked-then-interleaved on a calendar

- **gymnastics-coach (partly):** real finding, produced by manipulating trial
  order *within a single session* on a barrier-knockdown task. The programmes
  extrapolate to weeks 1–2 blocked, week 3+ interleaved. The programmes' own
  caveat citation (Wulf & Shea 2002) argues this class of result does not scale.
- **motor-learning-scientist (partly):** same; the two-week boundary is an
  engineering choice presented across all three programmes as citation-derived.
- **upper-limb-physio:** did not flag (scoped out of motor-learning methodology
  by declaration).

### Q7 · `wu_2014` — variability predicting learning rate vs variance in outcomes

- **gymnastics-coach (partly):** lab planar reaching, adaptation rate — outside
  the paper's task and outcome measure, though directionally sympathetic to "no
  cohort ETA".
- **upper-limb-physio (partly):** sharper — the finding is that higher **baseline
  motor variability** predicts faster learning, which is a *different construct*
  from between-person variance in outcomes, the framing the programme uses.
- **motor-learning-scientist:** explicitly listed it as **clean**.

**Straight disagreement between a domain specialist and a methodologist on the
same paper.** Unresolvable from here.

### Q8 · `blenkinsop_2017` — wrist-strategy dominance, and who it applies to

- **upper-limb-physio (partly):** the paper found balance is regulated largely at
  the wrist **but with meaningful shoulder/hip contribution under perturbation**,
  softer than "confirms wrist-strategy dominance". Then used to justify
  freestand-attempt drills for Tier A/B novices, whose wrist strategy is
  precisely the thing not yet developed.
- **motor-learning-scientist:** listed it as **clean**.
- **gymnastics-coach:** did not flag.

### Q9 · `ackerman_1988` — ability determinants and "no cohort ETA"

- **upper-limb-physio (partly):** cognitive and perceptual-speed lab tasks, not
  gross whole-body motor skill. It shows ability-performance correlations shift
  across practice phases; it does not characterise between-person variance in
  learning an inverted balance skill.
- **motor-learning-scientist:** explicitly did not flag — "loose but used
  conservatively (to refuse to give a timeline)".

**The disagreement is about a standard, not a fact.** Is a loose citation
acceptable when it is used to *withhold* a promise rather than make one? That is
a policy question for the project, and it recurs across the packet.

---

## Part 3 — Prescription concerns

The panel was asked about citations and returned a prescription list that is
harder to dismiss than the citation list. Ranked by how many reviewers reached
it independently.

### P-1 · The wrist volume cap is stated, exceeded by the shipped template, and unenforced — 2 reviewers, HIGH

`wrist_volume_capped` says "weeks 1–2: wrist load ≤20–30 min/week; from week 3
increase ≤10%/week". `weekly_template.reference_week_tier_a` is 4 sessions ×
(5 min `block_wrist_prep` + 10–15 min skill block) = **60–80 min/week**. Tiers
B/C/D run 5 × (5 + 12–18) = **85–115 min/week**. Nothing in `blocks[]`,
`weekly_template` or `progression_rules` computes wrist-loaded minutes.

The programme's only stated safety limit for its highest-prevalence injury is
exceeded 2–4× from week 1 by its own authored reference week.
→ **Action: either compute and enforce wrist-loaded minutes in
`progression_rules`, or rewrite the template to fit the cap. Do not ship the
principle text as-is.**

### P-2 · `shoulder_pain_overhead` is asked, promises a deferral, and does nothing — 3 reviewers, HIGH

In `handstand-walk.json` the string occurs **exactly once** (the question);
`intake_exclusions` is `null`. The help text promises "we defer inversions this
block and route the plan to shoulder-safe positions first."

In `muscle-up.json` the string occurs **exactly once**; `intake_exclusions`
contains only the elbow rule. A user reporting 12 months of shoulder pain with
dips and hangs is routed into ring support holds, deep ring dips and transition
negatives with **zero** modification. `first-strict-pullup` implements a deferral
on the identical answer — and even there, the coach notes it removes the *dead
hang* (the mildest exposure) while retaining negatives, band pull-ups and weekly
max attempts.

The repo comment in `lib/engine/intake-exclusions.ts` documents this exact bug
class as previously fixed. It is live in two of three programmes.
→ **Action: P0. Implement the promised deferral, or delete the promise from the
help text. An unbacked safety promise at the point of consent is worse than no
question.**

### P-3 · Other collected-and-inert intake answers — 3 reviewers, HIGH

- `wrist_pain_12mo` (three levels, including "Yes — persistent or limiting") —
  occurs once in `handstand-walk.json`, drives nothing. This is the population the
  programme's own cited 56.7% chronic-wrist-pain figure describes.
- `age_band` — occurs once, hint promises "extra ramp built in" for 46–60. No ramp,
  gate or exclusion references it.
- `ring_row_reps_selfreport` (`first-strict-pullup`) — collected, and the Tier B
  condition reads only `dead_hang` and `strict_pullup`. Grip endurance alone
  promotes a user into a negatives-led block.

→ **Action: each of these is one clause. Wire them, or stop asking. Asking and
discarding manufactures confidence — the user reasonably assumes the plan
accounted for it.** Caveat from two reviewers: they traced this by counting
string occurrences, so if drill selection reads intake answers by some path they
did not find, these findings are wrong. **That is five minutes of an engineer's
time to confirm before any of it is actioned.**

### P-4 · The elbow deferral is a paper gate — 2 reviewers, HIGH

With `elbow_tendon_pain = 'current'`, exactly two ids are excluded
(`pu_negative_pullup_5s` / `_10s`). Still prescribed to the same symptomatic
user: `pu_slow_tempo_pullup` (3-3-3, eccentric-dominant), `pu_isometric_top_hold`
and `pu_isometric_mid_hold` (flexed-elbow isometrics), `pu_band_pullup_heavy`,
GtG singles, and the Tier D rotation into chin-up and neutral grips — which the
intake help text itself names as medial-elbow loading.

In `muscle-up`, the same answer substitutes band-assisted ring dip for four dip
variants and **leaves the entire false-grip ladder untouched** — false grip loads
the common flexor origin harder than the dip support does. The physio: deferring
the dips and keeping the false grip inverts the priority for medial elbow.
→ **Action: currently symptomatic epicondylalgia should be a gate or a
rows-and-isometrics pathway with a documented re-entry test, not a two-id
exclusion. If it stays a substitution, the exclusion must cover every
elbow-flexion-loaded item.**

### P-5 · No weekly pulling-volume ceiling anywhere — 2 reviewers, HIGH

Tier C/D runs 4 bar sessions plus a GtG day at 5 singles ("one per hour if
possible") — pulling load on 5+ days. Rhea supplies dose-response shape only; the
40–60 hard reps/week figure is acknowledged consensus and is enforced by no rule.
Compounding it, `retest_metrics` advertise 4-weekly testing while
`block_pullup_sets_submax` carries `pu_first_strict_attempt` ("weekly max-rep
test") on **Mon and Fri**, and `block_pullup_variety` adds another Wed for Tier D
— up to three max-effort tests in a Tier D week.

The coach adds the arithmetic problem: GtG unlocks at Tier C where max is 1–2
reps, so "a single at 60–70% of max" does not exist. In practice it is 3–5
near-maximal singles daily.
→ **Action: add a weekly hard-rep ceiling; reduce max testing to the advertised
4-weekly; gate GtG at a 5-rep max rather than 1.**

### P-6 · Muscle-up entry gate — 1 reviewer, HIGH, and the strongest single opinion in the packet

The coach: 3 strict pull-ups + 3 ring dips is far too low, and is "the single
thing I would change before this ships". Working prerequisite offered: 8–10
strict pull-ups to sternum, 8–10 strict ring dips, 30 s false-grip hang. At 3 and
3 there is no strength reserve; the athlete stalls at deepest shoulder flexion
with elbows behind the body and the tissue that absorbs it is long-head biceps
and medial elbow. Tier A sells this as a 20-week path to the goal — "optimistic
to the point of being a recruiting promise".

This is a single reviewer's craft judgement with no citation behind it (`sands_2000`
does not support the current number either). **It is exactly the question a real
gymnastics coach should be asked.**

Related, unresolved: the `ring_dip_count = 'under_3'` rule is authored as a
`safety_gate` — `IntakeClient.tsx` hard-blocks on any gate match — while the
block body says "if you continue, the Tier A phase becomes your ring-dip build"
and the option hint reads "Tier A — ring-dip build first". Either Tier A is
unreachable by design or the gate is not doing what the schema says. Some user
gets the wrong outcome.

### P-7 · False-grip volume is uncapped and lands 3–4 days a week — 1 reviewer, HIGH

Tier A: `block_false_grip_ladder` Wed **and** as a Friday wrap (4×10 s hangs +
4×6 rows each time). Tier B adds `block_false_grip_pullup` 5×3 Sat plus the
ladder as a Thu wrap. The false grip holds the wrist at end-range flexion with
the ring pressing the distal radius/ulna while wrist flexors work isometrically
— the physio calls it the single most reliable medial-epicondylalgia and
ulnar-sided-wrist generator in ring training. No weekly cap, no wrist question at
intake, no acute-wrist gate.
→ **Action: explicit weekly false-grip contact-time cap, ≤10%/wk ramp, never on
consecutive days.**

### P-8 · Depth and load gated on rep counts rather than symptoms — 2 reviewers

- `mu_ring_dip_deep` (below 90°, rings turned out) unlocks at week 4 on
  `mu_ring_dip_strength_level >= 4` — a strength number. RTO depth is the
  recognised mechanism for pec-major tendon injury and anterior shoulder /
  long-head-biceps strain. → gate on symptom history and a pain-free support
  hold; hold depth until ≥8 pain-free weeks of full-range dips.
- `mu_transition_negative_high` at week 4 on the strength of Roig, which contains
  no such movement. → own volume ceiling (suggested 6–8 reps/week, never
  consecutive days) rather than 3×2 inside a general block.
- Weighted work at +2.5 kg from muscle-up week 4 and pull-up week 7–8. → the
  conventional gate is ~10–12 clean strict reps; adding load earlier just returns
  the athlete to the low-rep zone under a loaded false grip.

### P-9 · "Cold, first movement in the session" contradicts non-optional prep — 2 reviewers

`pu_first_strict_attempt` and `mu_first_strict_ring_mu_attempt` are both
prescribed cold, while `block_shoulder_prep` is described as non-optional (and in
muscle-up, non-optional **weeks 1–3 only**, so from week 4 a maximal unwarmed
ring attempt at end-range support is the default).
→ **Action: pick one. Either prep runs first and the test is post-prep, or prep
is not non-optional. Right now the data says both.**

### P-10 · Generator-level defects — 1 reviewer (motor-learning-scientist), MEDIUM

- `shoulder_overhead_endurance` is a capability slot with exactly one block
  attached: `block_recovery`, a 5-minute downdog/child's-pose flush. Under
  weakest-capability-first, a user whose weakest capability is overhead shoulder
  endurance is served a recovery stretch **as their training for it**.
- `block_pullup_sets_submax` and `block_pullup_maintenance` both carry
  `capability_slot: mu_false_grip` but prescribe `pu_first_strict_attempt`, a
  standard-grip pull-up. Four of nine blocks claim the slot; two don't train it.
- No `handstand_obstacles` block exists despite `handstand_obstacles_level`
  driving conditions inside `block_skill_B_obstacles_or_turns`.

→ **Action: these are `data-integrity.test.ts` candidates — slot satisfiability
is already asserted, but "the block in this slot actually trains this capability"
is not.** Note the coach's caveat: none of the three reviewed the adaptive
engine's runtime behaviour, so where the generator overrides a block prescription
at render time, some of this may be aimed at data the user never sees.

### P-11 · Bail-out training assumes a surface nobody asked about — 1 reviewer, MEDIUM

Phase 0 gates on self-reported `bail_out_readiness`, but `deliberate_mat_falls`
(6 sets), `tuck_forward_roll_from_crow` and `wall_cartwheel_exit` are prescribed
with no question about surface, space or matting, in a product positioned as
home/gym-agnostic. The physio: "teaching a novice to fall out of a handstand onto
whatever floor they have is the highest-consequence single instruction in this
packet."

The coach, separately, calls Week 0 exits-before-line **the best design decision
in the three programmes** and would not change it — his only gap is that a
step-out and a cartwheel-out are different skills, and Tier D obstacle work
(falling sideways with a plate underfoot) should gate on the cartwheel-out.
→ **Action: add a surface/space question before Phase 0. Gate Tier D obstacles on
cartwheel-out competency, not step-out.**

### P-12 · The programmes cannot enforce their own placement principles — 2 reviewers

All three publish "do not run the same day as a heavy overhead press" and "48 h
between the two heaviest sessions". Intake never asks what the user's existing
week contains. For a product whose entire positioning is *runs alongside your
existing week*, concurrent upper-limb load is the decisive load-management
variable and is collected nowhere.
→ **Action: this is a product decision, not a bug fix. Either collect it or stop
publishing principles the app cannot honour.**

### P-13 · Unresolvable inline references — 1 reviewer, MEDIUM

`first-strict-pullup` shipped text cites "Halperin 2019", "Chiviacowsky & Wulf
2005", "Sommer 2008", "Low 2016" and "Wilk 2007" — **none exist in
`citations.json`**. Under the stated rule that every claim cites a paper, these
are presented to users as evidence and resolve to nothing.
→ **Action: `data-integrity.test.ts` should fail on an inline author-year string
that has no citations.json entry. Add the assertion, then fix the five.**

### P-14 · The REVIEWED badge — 1 reviewer, HIGH

All three files ship `status: REVIEWED` with `reviewed_by.name` = "Terav
specialist audit agent" and a credential-shaped `role` field, which reads to a
user as a named human specialist. The reviewer packet handed to the panel states
muscle-up is "Not yet REVIEWED … `reviewed_by` / `review_evidence[]` are
deliberately absent" — `muscle-up.json` has both. Given that this citation set
contains two entries with `verification_status: pending`, two missing DOIs, one
placeholder author string and two acknowledged misattributions, the reviewer's
position is that a REVIEWED badge is not currently supportable.
→ **Action: reconcile the packet with the shipped state — the discrepancy alone
is a defect. Then decide separately whether `reviewed_by` should name an agent
in a credential-shaped field at all. The ladder copy is already correct on this
and should not change.**

---

## Part 4 — Screening gaps

Three reviewers converged hard here, and it is the least citation-dependent part
of the output. Grouped by consensus.

**All three:**
- **Shoulder instability / dislocation history outside the 6-month acute window** —
  `first-strict-pullup` and `muscle-up` screen only `acute_shoulder_injury`. The
  transition passes the shoulder through deep flexion into extension behind the
  torso on unstable rings, at the moment the athlete is slowest. A dislocation
  three years ago is a materially different shoulder. Post-operative labral/SLAP
  and cuff repair are also commonly restricted from full hangs — the Tier A
  primary drill is a maximal-duration passive hang.
- **`handstand-walk` does not ask `acute_shoulder_injury` at all**, though the two
  sibling programmes both block on it. Looks like omission, not decision.
- **No wrist question in `muscle-up`** — the most wrist-hostile programme in the
  catalog. False grip is end-range wrist flexion under bodyweight with a ring on
  the distal forearm, prescribed 4×10 s from Tier A. Its `daily_log_schema`
  collects `wrist_symptom_score` and `progression_rules` read it: **the programme
  expects wrist problems, monitors for them, and screens for none of them.**
- **Ophthalmic inversion contraindications** — glaucoma / ocular hypertension,
  retinal detachment history, recent eye surgery. `handstand-walk` already accepts
  the inversion-risk argument by blocking uncontrolled hypertension. Taking one
  half of the pairing and omitting the better-established half reads as an
  incomplete screen.
- **Generalised hypermobility** — the Tier A dead-hang test explicitly instructs
  "arms fully extended, no scap engagement, just hanging", progressing to 45–60 s,
  and it is a headline retest metric. That is exactly the exposure a hypermobile
  shoulder should avoid, and the standard modification (active hangs only) is a
  different programme from the one Tier A runs.

**Two of three:**
- **Concussion, vestibular disorder/BPPV, syncope, seizure** for `handstand-walk`.
  Week 0 teaches falling; Tier A spends weeks inverted learning to search for
  balance, which a vestibular disorder makes uninterpretable.
- **Existing weekly pulling/overhead volume** — see P-12.

**One of three, worth a specialist's read:**
- `osteoporosis_dx = 'unsure'` and `hypertension_uncontrolled = 'unsure'` pass
  through — both gates fire on 'yes' only, so the people most likely to have
  undiagnosed low BMD (post-menopausal, 60+, long-term corticosteroid, never had a
  DEXA) select 'unsure' and proceed to kick-ups and deliberate falls.
- **Anterior elbow / distal biceps**, as distinct from the epicondylar question
  already asked. The transition's characteristic injury is not epicondylar.
- **Prior distal radius fracture, scapholunate or TFCC injury, carpal instability** —
  only an *acute* wrist injury in the last 6 weeks is screened.
- **Cervical spine and pregnancy** — hanging is a cervical traction position and is
  where radicular symptoms present; `tuck_forward_roll_from_crow` loads the neck
  under bodyweight in a beginner who by definition cannot yet exit a handstand.
- **`first-strict-pullup` asks no age question at all**, unlike `handstand-walk`. It
  is in the public catalogue; heavy hangs plus daily GtG singles is a described
  route to medial epicondyle apophysitis in adolescents — and DiFiori, in the
  programme's own citation set, is about load through the hand in immature
  skeletons.
- **Bodyweight or any strength-to-mass proxy** is collected nowhere, yet Tier B
  promises a first strict rep by week 8–10 to everyone who can hang 15 s, labelled
  "realistic".

---

## Part 5 — What to put in front of a human first

Ranked. Everything above this line is optional; these six are not.

1. **A clinician or physiotherapist, on the screening set.** The panel can say a
   question is missing; it cannot set a threshold. Bring: shoulder instability
   outside the acute window, hypermobility and the passive-hang prescription,
   ophthalmic and vestibular inversion contraindications, `elbow_tendon_pain =
   'current'` as gate-vs-substitution, and whether 'unsure' on osteoporosis and
   hypertension should route to a clinician prompt. Ship nothing new until this
   happens.

2. **An engineer, five minutes, on the inert-intake claims (P-2, P-3).** Two
   reviewers established these by counting string occurrences in the JSON. If
   drill selection reads intake answers by another path, a chunk of Part 3
   evaporates. Confirm before actioning — and if confirmed, `shoulder_pain_overhead`
   in `muscle-up` and `handstand-walk` is a P0.

3. **A gymnastics coach, on the muscle-up entry gate (P-6).** 3+3 vs the coach
   persona's 8–10 + 8–10 + 30 s false-grip hang is a fifteen-year-experience claim
   with no literature behind it on either side. It is the highest-consequence
   single number in the catalogue and `sands_2000` does not support the current
   one.

4. **Someone with library access, on eight papers.** `baker_2025_review`
   (PMC12745452, anchor for the whole handstand evidence base), `kinoshita_2022`
   (sole support for Tier A entry and `block_skill_A`), `barlow_2020`,
   `sci_reports_2026_handstand_shoulder`, `sinnett_2019`, `vidal_rovira_2024`,
   `vidal_torija_2025`, `rohleder_vogt_2018`. Two of these carry structural weight
   in `handstand-walk`; three have already been found to have wrong attribution or
   unconfirmed existence, which is the reason to check the rest.

5. **A motor-learning researcher, on Q1, Q2 and Q5.** The
   `newell_1985` / `proteau_1992` / `henry_1968` reading determines whether the
   `multi_dimensional` generator has any citation footing, and Q5 asks whether the
   whole skill-acquisition half of the packet needs a uniform complex-skill
   discount. This is the part of the panel's output a fourth AI reviewer would
   probably not reproduce.

6. **The project owner, on the REVIEWED badge and the packet discrepancy (P-14).**
   Not a research question. Decide whether `reviewed_by` may name an agent in a
   credential-shaped field, and reconcile the packet's claim that muscle-up is
   unreviewed with a `muscle-up.json` that carries `reviewed_by` and
   `review_evidence[]`.

---

## Weak findings, stated as weak

- **`ackerman_1988` (Q9)** — one reviewer flagged it, one explicitly cleared it as
  "loose but used conservatively". A citation used to *refuse* a promise is a
  different risk class from one used to make one. Low priority.
- **`wu_2014` (Q7)** — the physio's construct distinction (baseline variability ≠
  outcome variance) is sharp, but the motor-learning scientist cleared the same
  paper. Nothing in the app changes either way.
- **`vigouroux_2007`, `karni_1998`, `shea_2000`, `potdevin_2018`** — all four are
  real papers stretched past their task class, and in every case the programme
  already labels the derived number as convention rather than finding. The fix is
  editorial (`used_for` narrowing), not structural. Low.
- **The band-assisted-ring-dip substitution (motor-learning-scientist, "low")** —
  band assistance reduces load without removing the end-range support position the
  programme's own principle text names as the medial-elbow problem. Real, but the
  smallest item here.
- **P-10's generator findings** carry an explicit caveat: none of the three read
  the adaptive engine's runtime. Verify against rendered sessions before treating
  any of it as confirmed.

## Reviewer scope limits, in their own terms

Recorded so nothing here is read as cleared:

- **None of the three had literature-search tooling.** Every "cannot_assess" is
  literal.
- **gymnastics-coach:** did not assess bone-density reasoning beyond noting
  `difiori_2006` fails; did not read aerobic, strength or mobility programmes; did
  not review the adaptive engine's runtime behaviour.
- **upper-limb-physio:** judged the ~20 skill-acquisition citations on population
  and task transfer only — not internal validity, statistics, or replication
  standing; reviewed shipped JSON, not the generator; has not seen the app's
  rendered sessions.
- **motor-learning-scientist:** did not assess clinical appropriateness of the
  screening gates as medicine, did not assess the methodological quality of the
  EMG and biomechanics studies, did not assess exercise-physiology dose-response
  as such, and did not assess gymnastics coaching craft.

Nothing in this document covers the endurance, rowing or mobility programmes, or
the shared `exercises.json` cue copy.


---

# Verification pass by the orchestrator (2026-09-02, after the panel)

The panel flagged **30 of 41 citations unanimously**. That rate is itself a
signal about the method: three models told to be adversarial over-flag as
readily as agreeable ones under-flag, and correlated over-refutation is the
mirror image of the correlated agreement this panel was built to avoid. Nothing
below was actioned on the panel's word.

## Checked, and the panel was right

**`sci_reports_2026_handstand_shoulder` had fabricated-looking metadata.**
`authors` read "Sci Reports handstand-walk shoulder pain team" — a description
where a byline belongs — and `display_short` read "Sci et al. 2026", rendering a
journal name to users as a surname. Its own `used_for` carried "paper existence
at claimed URL unconfirmed", inside a programme badged REVIEWED, whose badge
means precisely that the citations were re-checked. A caveat saying "we did not
verify this" is not a substitute for verifying it, and is worse than nothing: it
makes shipping the unverified thing feel accounted for.

## Checked, and the panel's recommended action was wrong

The panel said **remove it entirely**. One HTTP request to the claimed URL shows
the paper is real: *Exploring handstand walking biomechanics and shoulder pain*,
Angioi M, Hinds N, Twycross-Lewis R, Farmer C, Birn-Jeffery AV, Scientific
Reports, doi 10.1038/s41598-026-51612-w. Acting on the panel's recommendation
would have deleted a genuine and relevant citation on the strength of bad
metadata.

Fixed instead: real byline, DOI, corrected display strings, and the stale caveat
removed.

## Guarded

`data-integrity.test.ts` now fails on a prose byline, an empty byline, a
`display_short` beginning with a journal word, and any `used_for` admitting its
source is unverified. Mutation-tested: all four fire. This defect survived
authoring, an internal audit pass, and a REVIEWED badge — it needed a test, not
another reviewer.

## Status of the other 29 unanimous flags

**Unverified, and deliberately not actioned.** Assessing whether Roig 2009's
population transfers to bodyweight gymnastics, or whether Youdas' grip-width
claim overreaches, requires the papers themselves. The panel's reasoning is
recorded above and is a reasonable queue for a human reviewer; it is not
evidence on its own, and the one item that could be checked independently came
back with the panel's *diagnosis* right and its *prescription* wrong.

That is the honest summary of what a single-source panel is worth: good at
noticing, unreliable at deciding.
