# Evidence sourcing — two open prescription questions

Date: 2026-09-05
Agent: evidence-sourcer
Scope: what the literature SAYS. Not what to prescribe. No programme data was edited.

Sources read: `next-app/public/data/programs/first-strict-pullup.json`,
`next-app/public/data/programs/muscle-up.json`, `next-app/public/data/exercises.json`,
`next-app/public/data/citations.json`, and `next-app/src/lib/engine/plan-generator.ts`
(to establish what is actually rendered, as distinct from what is authored).

Nothing under `dev/` was read.

---

## Preliminary: the authored dose and the rendered dose are not the same number

The brief states 18 max-effort eccentric reps per session. That is the authored
intent of `block_negative_ladder`, but it is not what a Tier B entrant receives.
Establishing this first, because it changes the size of the question (not its
existence).

`block_negative_ladder` declares `capability_slot: "pu_negative_control"` and
`first-strict-pullup` has a `drill_library`, so `composeSlotDrills`
(`next-app/src/lib/engine/plan-generator.ts:399`) takes over: it discards the
authored items and composes from the library, admitting only drills within
`|drill.level − userLevel| <= 1`.

Tier B sets `pu_negative_control: 1`. The two negatives are `level: 3` and
`level: 4`. Both fall outside the window, `candidates.length === 0`, and the
code falls back to `filterBlockItemsByPrerequisites` on the authored items.
There, `pu_negative_pullup_10s` requires `pu_negative_control >= 3` and is
pruned. The authored per-item `condition` strings (`< 3` / `>= 3`) are mutually
exclusive in any case and are not evaluated on this path.

**Rendered for a Tier B entrant in week 1: 4×3 of 5-second eccentrics = 12
max-effort eccentric reps.** The 10-second work appears only once
`pu_negative_control` reaches 3. 18 reps is reachable only through a transient
state where both survive; I did not find a path that produces it. Treat the
question as being about ~12 reps, and separately about the fact that the
authored number and the rendered number differ by 50% with nothing asserting
which is intended.

This does not dissolve the concern. It resizes it.

---

## Claim 1a — "Roig 2009 meta: eccentric training beats concentric-only for matched work" — `first-strict-pullup.json`, `block_negative_ladder.note`; `evidence_refs: ["roig_2009", ...]` on `pu_negative_pullup_5s` / `_10s` in `exercises.json`

**What the literature says:** The current best evidence contradicts the claim as
made. The 2025 systematic review and meta-analysis that supersedes Roig for this
exact question found eccentric-only training superior for *eccentric* strength
and statistically indistinguishable from concentric-only for *concentric* and
isometric strength. A first strict pull-up is a concentric task. On the outcome
the programme exists to produce, the pooled evidence says eccentric-only confers
no advantage. A separate 2025 meta-analysis reaches the same null for
hypertrophy, at very low GRADE certainty. The one RCT I found that trained
pull-ups specifically with an eccentric regimen was in advanced climbers and
found improvements in maximum strength of +2.2% to +5.0% — indistinguishable
from the isometric and plyometric arms on that outcome.

### Candidates

| rank | citation | design | n | population | verdict |
|---|---|---|---|---|---|
| 1 | Spudić & Nosaka 2025, Sports Med Open | SR + meta-analysis, GRADE | 27 studies, 162 results | healthy adults, isokinetic | **CONTRADICTS** |
| 2 | da Silva et al. 2025, JSCR | SR + meta-analysis | 26 RCTs, 682 subjects | apparently healthy adults | CONTRADICTS (null) |
| 3 | Vigouroux & Devise 2024, Bioengineering | RCT, 4 arms | 30 | advanced/elite climbers | INDIRECT |
| 4 | Ansari et al. 2023, J Sports Sci Med | SR + meta-analysis | 19 trials, 618 | sedentary adults / metabolic disease | INDIRECT |

**1. Spudić D, Nosaka K (2025).** Eccentric-Only Versus Concentric-Only
Isokinetic Strength Training Effects on Maximal Voluntary Eccentric, Concentric
and Isometric Contraction Strength: A Systematic Review and Meta-analysis.
*Sports Med Open* 11(1):95.
- **Identifier:** PMID 40839186 · DOI 10.1186/s40798-025-00887-w · PMC12370621.
  Fetched: `https://pmc.ncbi.nlm.nih.gov/articles/PMC12370621/`
- **Quoted:** "Greater effects on MVCECC were found after eccentric-only than
  concentric-only training (Hedges' g: 1.51; 27 vs. 10%; p < 0.001). However, no
  differences were evident between the training modalities for changes in MVCCON
  (Hedges' g: -0.10; 13% vs. 14%, p = 0.726) and MVCISO (Hedges' g: -0.04; 18 vs.
  17%; p = 0.923)."
- **Quoted:** "Eccentric-only strength training is more effective for improving
  MVCECC, but both concentric-only and eccentric-only training provide similar
  effects on improving MVCCON and MVCISO."
- **Quoted (full text, on the direction of any difference):** "higher-velocity
  eccentric-only training had a smaller effect on slower MVCCON strength gains
  than higher-velocity concentric-only training"
- **Quoted (full text, volume across included studies):** "the number of
  repetitions per set ranged from 1 to 15 (mode = 10; mean ± SD = 9.6 ± 2.4)";
  "the number of sets ranged from 1 to 7 (mode = 3; mean ± SD = 4.7 ± 1.6)"
- **Quoted (full text, training status):** "no statistically significant
  differences were found within subgroups of sex, muscle, and training status"
- **Reach:** Isokinetic dynamometer, single-joint, velocity-controlled, healthy
  adults. Terav's user is doing a multi-joint bodyweight movement at a load they
  cannot reduce. The reach gap on *modality* is large. The reach gap on the
  *question asked* — does eccentric-only beat concentric-only for concentric
  strength — is small, and this is the highest-quality answer to it that exists.
- **Would license:** "Eccentric-only training reliably builds eccentric
  strength; pooled evidence shows no advantage over concentric-only training for
  concentric strength."

**2. da Silva LSL et al. (2025).** Comparison Between Eccentric vs. Concentric
Muscle Actions On Hypertrophy: A Systematic Review and Meta-analysis. *J Strength
Cond Res* 39(1):115-134.
- **Identifier:** PMID 39652733 · DOI 10.1519/JSC.0000000000004981
- **Quoted:** "The main findings indicated no statistical difference between ECC
  vs. CON on hypertrophy measurements (0.285 [95% CI: -0.131 to 0.701]; p =
  0.179; I2: 84.4%; GRADE: very low)."
- **Quoted:** "Subgroup analysis revealed an effect favoring the ECC for the
  upper limb muscles (p = 0.018), ≤8 weeks of intervention (p = 0.046)..."
- **Reach:** Healthy adults, mixed modalities. The upper-limb subgroup is the
  closest thing to a signal in the programme's favour anywhere in this sweep —
  but it is a subgroup of a null primary result at very low GRADE certainty, and
  the outcome is muscle size, not the ability to perform a rep.
- **Would license:** "Eccentric and concentric actions produce similar
  hypertrophy overall; an upper-limb subgroup signal exists at very low
  certainty."

**3. Vigouroux L, Devise M (2024).** Pull-Up Performance Is Affected Differently
by the Muscle Contraction Regimens Practiced during Training among Climbers.
*Bioengineering (Basel)* 11(1):85.
- **Identifier:** PMID 38247962 · DOI 10.3390/bioengineering11010085 · PMC10813506
- **Quoted:** "Thirty advanced to high-elite climbers were randomly divided into
  four groups: eccentric (ECC; n = 8), isometric (ISO; n = 7), plyometric (PLYO;
  n = 6), and no specific training (CTRL; n = 9), and they participated in a
  5-week training, twice a week, focusing on pull-ups on hangboard."
- **Quoted:** "Maximum strength improved in all three training groups (from +2.2
  ± 3.6% to +5.0 ± 2.4%; p < 0.001); velocity variables enhanced in the ECC and
  PLYO groups..."
- **Reach:** Very far. Advanced-to-elite climbers who can already do many
  pull-ups; group sizes of 6-9; outcome is force/velocity on an instrumented
  hangboard, not first-rep acquisition. It is nonetheless the only RCT I found
  that trained the actual movement with an eccentric regimen, and its eccentric
  arm was not superior for maximum strength.
- **Would license:** "In already-strong climbers, five weeks of eccentric,
  isometric or plyometric pull-up training all improved maximum strength by a
  few percent; the eccentric arm additionally improved velocity."

**4. Ansari M et al. (2023).** The Health and Functional Benefits of Eccentric
versus Concentric Exercise Training. *J Sports Sci Med* 22(2):288-309.
- **Identifier:** PMID 37293426 · DOI 10.52082/jssm.2023.288 · PMC10244982
- **Quoted:** "eccentric exercise ... resulted in significant increases in
  overall muscle strength (SMD 0.70; 95% CI 0.25 to 1.15; n = 224; P = 0.003)"
- **Reach:** Sedentary adults and people with metabolic disease; whole-body/
  walking modalities; the comparison is against "traditional exercise
  modalities," not concentric-only matched work. Does not speak to a bodyweight
  pull-up.
- **Would license:** "Eccentric training improves overall muscle strength
  relative to traditional exercise in sedentary and metabolically unwell adults."

### On `roig_2009`

Confirmed as the verification sweep found. Roig et al. 2009 (PMID 18981046, BJSM
43(8):556-568) is a real, correctly identified paper — `citations.json` marks it
`verification_status: "verified"`, which is true of its *existence* and false of
its *support* for the block note. It is also seventeen years old and has been
superseded for this precise question by Spudić & Nosaka 2025, which used the same
comparison with more studies and a GRADE assessment. Under Sackett's
best-*current*-evidence test it should not be the anchor even if it said what the
note claims.

### Recommendation — claim 1a

**WITHDRAW the claim.** The block note asserts eccentric superiority for matched
work as the reason the negative ladder is "the primary driver for Tier B." The
best current meta-analysis says the opposite for the outcome that matters here.
There is no reworded version of "eccentric beats concentric" that the literature
licenses in a programme whose goal is a concentric rep.

Something separate and true remains available and is worth saying instead: a
person who cannot perform the concentric can still load the movement
eccentrically, and eccentric-only training reliably builds eccentric strength
(Spudić & Nosaka 2025, Hedges' g 1.51). That is an argument from *availability*,
not from *superiority*, and it does not need Roig.

**Does a credentialed human remain required for 1a?** No, not for this part. This
is a citation-accuracy question, not a clinical one. The evidence is unambiguous
and the fix is editorial: strike the superiority claim from the block note and
from the two `evidence_refs` arrays. That decision is yours to make.

---

## Claim 1b — entry with `elbow_tendon_pain: "resolved"` (">3 months ago") receives no volume reduction — `first-strict-pullup.json`, `intake_exclusions[0]` gates only on `"current"`

**What the literature says:** Nothing I retrieved addresses resolved elbow
tendinopathy and eccentric loading directly — that specific study does not
appear to exist. What the literature does say, clearly and from good designs, is
two things that bear on the design decision. First, tendinopathy recurs at
non-trivial rates within twelve months even after apparent recovery: a
2×2 factorial RCT recorded one-year recurrence of 12% after placebo injection
and 54% after corticosteroid, and 29% vs 38% with and without physiotherapy —
none of these is near zero. Second, the general recommendation for introducing
eccentric work to a naive muscle is an explicit ramp, not a clean entry: an
initial phase of submaximal eccentric actions with incremental loading over
multiple sessions. I found **no** retrieved source specifying a return-to-load
progression keyed to time-since-resolution, and no source supporting ">3 months
ago" as a threshold at which loading precautions can be dropped. The threshold
appears to be unsourced.

### Candidates

| rank | citation | design | n | population | verdict |
|---|---|---|---|---|---|
| 1 | Coombes et al. 2013, JAMA | 2×2 factorial RCT, 1-yr follow-up | 165 | unilateral lateral epicondylalgia >6 wk | PARTIAL (recurrence rates) |
| 2 | Bisset et al. 2006, BMJ | RCT, 52-wk | 198 | tennis elbow >6 wk | PARTIAL (recurrence) |
| 3 | Hody et al. 2019, Front Physiol | narrative review | — | mixed / healthy | PARTIAL (progression principle) |
| 4 | Rio et al. 2016, BJSM | narrative review | — | tendinopathy generally | INDIRECT (recurrence framing) |
| — | return-to-load progression after resolved elbow tendinopathy | — | — | — | **NONE-FOUND** |

**1. Coombes BK, Bisset L, Brooks P, Khan A, Vicenzino B (2013).** Effect of
corticosteroid injection, physiotherapy, or both on clinical outcomes in patients
with unilateral lateral epicondylalgia: a randomized controlled trial. *JAMA*
309(5):461-469.
- **Identifier:** PMID 23385272 · DOI 10.1001/jama.2013.129
- **Quoted:** "Corticosteroid injection resulted in lower complete recovery or
  much improvement at 1 year vs placebo injection (83% vs 96%, respectively;
  relative risk [RR], 0.86 [99% CI, 0.75-0.99]; P = .01) and greater 1-year
  recurrence (54% vs 12%; RR, 0.23 [99% CI, 0.10-0.51]; P < .001)."
- **Quoted:** "The physiotherapy and no physiotherapy groups did not differ on
  1-year ratings of complete recovery or much improvement (91% vs 88%,
  respectively; RR, 1.04 [99% CI, 0.90-1.19]; P = .56) or recurrence (29% vs 38%;
  RR, 1.31 [99% CI, 0.73-2.35]; P = .25)."
- **Reach:** Moderate. Lateral epicondylalgia only (the intake question covers
  medial *or* lateral); a clinical population recruited at >6 weeks of symptoms,
  not people who resolved and returned to training; and "recurrence" here is
  defined against the trial's own recovery timepoints, not against a resumption
  of heavy eccentric loading. It establishes base-rate recurrence in this
  condition; it does not establish that eccentric pull-up negatives provoke it.
- **Would license:** "Lateral elbow tendinopathy recurs within a year in a
  meaningful minority of people who had recovered — 12% after placebo injection,
  29-38% across physiotherapy arms."

**2. Bisset L, Beller E, Jull G, Brooks P, Darnell R, Vicenzino B (2006).**
Mobilisation with movement and exercise, corticosteroid injection, or wait and
see for tennis elbow: randomised trial. *BMJ* 333(7575):939.
- **Identifier:** PMID 17012266 · DOI 10.1136/bmj.38961.584653.AE · PMC1633771
- **Quoted:** "Corticosteroid injection showed significantly better effects at six
  weeks but with high recurrence rates thereafter (47/65 of successes
  subsequently regressed) and significantly poorer outcomes in the long term
  compared with physiotherapy."
- **Reach:** Same population caveats as above, twenty years old, and the
  recurrence signal is specific to the corticosteroid arm. Included because it
  independently replicates the "apparent resolution is not durable" observation
  in the same condition.
- **Would license:** "Apparent short-term resolution of tennis elbow is
  frequently followed by regression, particularly after corticosteroid injection."

**3. Hody S, Croisier J-L, Bury T, Rogister B, Leprince P (2019).** Eccentric
muscle contractions: Risks and benefits. *Front Physiol* 10:536.
- **Identifier:** DOI 10.3389/fphys.2019.00536.
  Fetched: `https://www.frontiersin.org/journals/physiology/articles/10.3389/fphys.2019.00536/full`
- **Quoted:** "an initial phase consisting of submaximal eccentric muscle actions
  with incremental loading over multiple sessions should be used to introduce
  individuals to eccentric muscle training"
- **Quoted:** "A period of 2–4 days between the exposure stimulus and
  progressively higher levels of loading has been suggested as optimal"
- **Quoted:** "eccentric exercise induces greater muscle damage and negative
  functional consequences in an healthy naïve muscle than other types of
  exercise"
- **Quoted:** "Damage to extracellular matrix and connective tissue components
  also occur following a novel eccentric exercise"
- **Reach:** Narrative review, so design rank 5. Its concrete protocol numbers
  ("the progressive ramping eccentric protocol typically starts with load of
  50–75 W to reach the target training load of 400–500 W") are eccentric cycle
  ergometry and have no translation to bodyweight negatives. The *principle* —
  ramp in, do not start at target intensity — is stated generally and is the most
  directly applicable thing I found. Note this is a recommendation for healthy
  naive muscle, not for a previously symptomatic tendon; nothing here is
  specific to elbow tendinopathy history.
- **Would license:** "Introducing eccentric training to someone unaccustomed to
  it is recommended to begin with submaximal actions and incremental loading over
  multiple sessions, rather than at target intensity."

**4. Rio E, Kidgell D, Moseley GL, Gaida J, Docking S, Purdam C, Cook J (2016).**
Tendon neuroplastic training: changing the way we think about tendon
rehabilitation: a narrative review. *Br J Sports Med* 50(4):209-215.
- **Identifier:** PMID 26407586 · DOI 10.1136/bjsports-2015-095215 · PMC4752665
- **Quoted:** "Tendinopathy can be resistant to treatment and often recurs,
  implying that current treatment approaches are suboptimal."
- **Reach:** Narrative review, tendinopathy in general (the authors' work is
  predominantly Achilles/patellar). Supports the framing that "resolved" is a
  weaker state than the intake option label implies; supports nothing numeric.
- **Would license:** "Recurrence is a recognised feature of tendinopathy, not an
  edge case."

Also retrieved and rejected for this claim: Cook & Purdam 2009 (PMID 18812414)
and Cook et al. 2016 (PMID 27127294), the continuum model. They are real,
well-cited, and say nothing about a resolved tendon returning to eccentric load
— the continuum is a staging model for pathology, and the 2016 revisit is
largely a critique of classifying a pain condition by structure. Citing them here
would be exactly the "weaker cousin" substitution to avoid.

### The NONE-FOUND, stated plainly

I could not retrieve any study, review, or consensus statement that:
- specifies a return-to-load progression for medial or lateral elbow tendinopathy
  after symptom resolution;
- tests any time-since-resolution threshold (3 months or otherwise) as a point at
  which loading precautions may be relaxed;
- reports outcomes of eccentric upper-limb loading in people with a resolved
  elbow tendinopathy history.

Searches run: PubMed field-tagged (`lateral epicondylalgia[ti] AND (exercise OR
load*)`, tendinopathy load management / return to sport, medial epicondylitis
epidemiology, recurrence cohorts) and Europe PMC. The absence is not proof none
exists, but it is a broad enough sweep that a well-known guideline would have
surfaced.

### Recommendation — claim 1b

**KEEP AS ENGINEERING CHOICE, and label it as one.** The ">3 months ago = clean
entry, no volume reduction" rule has no source. It is not contradicted either.
It is an unevidenced threshold currently presented to users inside a clinical-
sounding option label, which is the part that is not defensible: the app is
asserting a clinical boundary it cannot support.

Two things the evidence does support saying, if a reworded position is wanted:
- Recurrence in this condition is common enough to be the expectation rather than
  the exception (Coombes 2013: 29-38% at one year across physiotherapy arms).
- The general recommendation for introducing eccentric work to an unaccustomed
  person is a submaximal ramp over multiple sessions, not entry at target
  intensity (Hody 2019).

Neither of those tells you what number to put in the programme.

**Does a credentialed human remain required for 1b?** **Yes.** This one does not
resolve. The evidence establishes that recurrence is real and that ramping is the
general principle, and then stops — it offers no threshold, no dose, and nothing
on the specific population. Choosing what happens to a "resolved" answer is a
clinical judgement made under genuine uncertainty, and the sourcing sweep has not
removed that uncertainty. It has only established that no one is going to
remove it for you from the literature. Filing this as "needs a credentialed
human" was the correct call and remains the correct call.

---

## Claim 1c — is 12-18 max-effort eccentric reps per session within or above what the evidence describes?

**What the literature says:** On raw repetition count, it is *within* range and
not remarkable. The 27 studies pooled by Spudić & Nosaka averaged 9.6 ± 2.4 reps
per set across 4.7 ± 1.6 sets — roughly 45 eccentric repetitions per session,
several times the Terav dose. Training status was tested as a moderator and was
not significant. So the volume, counted as reps, is not the outlier.

What the same literature does flag is a different variable: those were isokinetic
dynamometer protocols, where intensity is set by the machine and can be ramped
independently of the movement. In a bodyweight negative the load is the user's
body and cannot be reduced; the only tunable is descent duration, and the
programme's progression *increases* it (5s → 10s), which increases time under
tension rather than easing it. Hody's recommendation — submaximal actions with
incremental loading over multiple sessions before target intensity — has no
implementation in `block_negative_ladder`: week 1 session 1 is 4×3 at full
bodyweight, which is target intensity from the first exposure.

- **Quoted (Spudić & Nosaka 2025, full text):** "the number of repetitions per set
  ranged from 1 to 15 (mode = 10; mean ± SD = 9.6 ± 2.4)"; "the number of sets
  ranged from 1 to 7 (mode = 3; mean ± SD = 4.7 ± 1.6)"
- **Quoted (Spudić & Nosaka 2025, full text, on dose–response):** "given the higher
  within-set fatigue tolerance and possible muscle damage specific to eccentric
  contractions, the dose–response relationships of eccentric training protocols"
  require careful consideration
- **Quoted (Hody 2019):** "an initial phase consisting of submaximal eccentric
  muscle actions with incremental loading over multiple sessions should be used to
  introduce individuals to eccentric muscle training"
- **Quoted (Hody 2019):** "Morphological abnormalities observed immediately after
  exercise gradually extent to a larger number of muscle fibers and appear
  exacerbated 2–3 days post-exercise"

**Reach:** Both sources are healthy-adult, non-clinical, and neither used
bodyweight multi-joint eccentrics. Applying an isokinetic rep-count distribution
to bodyweight negatives is an inference the papers do not make.

### Recommendation — claim 1c

**KEEP AS ENGINEERING CHOICE.** The answer to the question as asked is: the rep
count is within what the evidence describes, and the *entry intensity* is the
part that departs from what the evidence recommends. Those are separable, and
only the second is actionable — the literature's recommendation (a submaximal
ramp before target intensity) is a design principle the block does not currently
implement, and implementing it would not require a number the literature declines
to give.

**Does a credentialed human remain required for 1c?** **Not for the volume
question** — 12-18 reps is comfortably inside the described range and that is a
settled, quotable fact. **Yes for the entry-intensity question**, if it is acted
on: deciding what a submaximal first exposure to a bodyweight negative looks like
for someone with an elbow history is the same judgement as 1b, and inherits the
same gap.

---

## Claim 2 — false-grip hangs available from Tier A — `muscle-up.json`, `block_false_grip_ladder`, `mu_false_grip_hang` (`level: 1`, `prerequisites: []`), `evidence_refs: ["vidal_rovira_2024"]`

**What the literature says:** There is essentially one indexed peer-reviewed
study anywhere that examines the false grip, and it says something bearing
directly on this question — though not the thing the programme cites it for. An
EMG comparison of ring versus bar muscle-ups in ten trained males found
significantly greater forearm-flexor and biceps activation during the ring
pull phase, attributed by the authors to the flexed wrist position of the false
grip, and concluded that the bar variation may be the better one to learn first.
Its recommended progression is: build pulling strength from the large muscle
groups, then the bar muscle-up, then the rings. `muscle-up.json` has no bar
muscle-up step and introduces the false grip at entry. On prerequisite exposure
specifically, and on progressing from standard grip to false grip, the literature
is **empty** — nothing exists.

### Candidates

| rank | citation | design | n | population | verdict |
|---|---|---|---|---|---|
| 1 | Walker et al. 2023, Int J Exerc Sci | cross-sectional EMG lab | 10 | trained males, ≥5 ring AND bar muscle-ups | PARTIAL / mildly CONTRADICTS |
| 2 | Ngo et al. 2021, OJSM | case-control survey | 93 | street workout practitioners | INDIRECT (context only) |
| — | false-grip wrist/forearm/elbow tissue load | — | — | — | **NONE-FOUND** |
| — | prerequisite exposure before false-grip work | — | — | — | **NONE-FOUND** |
| — | progressing standard grip → false grip | — | — | — | **NONE-FOUND** |

**1. Walker CW, Bruenger AJ, Tucker WS, Lee HR (2023).** Comparison of Muscle
Activity During a Ring Muscle Up and a Bar Muscle Up. *Int J Exerc Sci*
16(1):1451-1460.
- **Identifier:** PMID 38288256 · DOI 10.70252/FJQL7859 · PMC10824315.
  Fetched: `https://pmc.ncbi.nlm.nih.gov/articles/PMC10824315/`
- **Quoted:** "When the athlete grips the rings to perform a ring muscle up, they
  must use a false grip." / "This grip requires the hands be placed through the
  ring and have the rings rest on the wrist while the hand is in a flexed
  position."
- **Quoted:** "The RMU significantly elicited more muscle activation in the UT (p
  = 0.007), BB (p = 0.001), and FF (p = 0.001) during the pull phase."
- **Quoted:** "The flexed position used to achieve the false grip may have
  increased muscle activation of the forearm flexors when compared to the
  pronated grip of the bar muscle up."
- **Quoted (progression):** "A progression for athletes may focus on building the
  pulling strength from the larger muscle groups such as the latissimus dorsi and
  upper trapezius before progressing to a bar muscle up. As the athlete becomes
  more skilled on the bar muscle up, they may then begin practice for a ring
  muscle up."
- **Quoted (conclusion):** "Appropriate upper limb development is needed to
  perform the RMU and the BMU may be a better technique to learn first due to its
  lower difficulty."
- **Quoted (inclusion criteria):** "Each participant was required to engage in an
  active high-intensity training program that included bodyweight exercises for
  at least six months and be able to complete five muscle ups on the rings and
  using a bar."
- **Quoted (limitation, in the authors' own words):** "The small sample size was a
  limitation in this study."
- **Reach:** Large, in a specific direction that matters. Every participant could
  already perform five ring muscle-ups and five bar muscle-ups; n = 10; single
  session; the outcome is surface EMG amplitude, which is *muscular demand*, not
  tissue load, injury risk, or tolerance. Terav's Tier A user has three strict
  pull-ups and has never attempted a muscle-up — the study says nothing about
  what happens to that person. Note also that the app's block is false-grip
  *hangs and rows*, not muscle-ups; the study measured the full movement.
  Crucially: the progression sentence is the authors' *suggestion in a
  discussion*, not a tested comparison. It carries the weight of an informed
  opinion from people who measured the relevant thing once, and no more.
- **Would license:** "Ring muscle-ups elicit significantly greater forearm-flexor
  and biceps activation than bar muscle-ups during the pull phase in athletes who
  can already perform both; the authors suggest the bar variation as the easier
  one to learn first."

**2. Ngo JK, Solis-Urra P, Sanchez-Martinez J (2021).** Injury Profile Among
Street Workout Practitioners. *Orthop J Sports Med* 9(6):2325967121990926.
- **Identifier:** PMID 34189146 · DOI 10.1177/2325967121990926 · PMC8209839
- **Quoted:** "Overall, 62.4% of the 93 participants reported an injury in the
  previous 12 months, and tendinopathy was the most reported diagnosis (31.0% of
  injured practitioners). High injury frequency was reported in the shoulder
  (23.0%) and back (upper and mid) (18.4%)."
- **Quoted:** "Overtraining was the most reported perception of cause of injury
  (56.9%)."
- **Reach:** Very far. Retrospective self-report survey, n = 93, level 4 evidence,
  no false-grip or wrist-specific data — the wrist does not appear in the reported
  injury distribution at all. Included only to say that the closest population
  with any injury surveillance shows tendinopathy as the dominant diagnosis in a
  bodyweight-training population, which is context, not evidence about this drill.
- **Would license:** "Tendinopathy is the most commonly reported diagnosis among
  injured street workout practitioners." Nothing about the false grip.

### On `vidal_rovira_2024`

`citations.json` lists this as "Vidal-Rovira R, et al. (2024), Forearm activation
patterns in false-grip vs standard grip on gymnastic rings," source "Preprint /
conference — verification required," `url: null`,
`verification_status: "pending"`. It is attached to all three false-grip drills
in `exercises.json`.

I could not retrieve it. Europe PMC returns exactly one record in the entire
indexed literature for the phrase "false grip" — Walker 2023, above. A search on
the author name returns 1,074 hits, none in sports science; they are a
multiple-sclerosis research group with the surnames Vidal and Rovira. PubMed
returns nothing matching. **I found no evidence this work exists.** It should not
be treated as pending verification; it should be treated as unlocated, and the
honest move is to say so rather than to leave a `pending` badge implying someone
will find it. (Flagging, not deciding — this is `evidence-verifier` territory and
I am not editing anything.)

### The NONE-FOUND, stated plainly

There is no literature on:
- wrist, forearm or elbow **tissue load** in the false grip (Walker measured
  muscle *activation*, which is a different quantity);
- any prerequisite exposure, readiness criterion, or minimum capability before
  beginning false-grip work;
- progressing from a standard grip to a false grip — no protocol, no timeline, no
  comparison.

Searches run: Europe PMC on `"false grip"`, `"ring muscle-up"`, `"muscle-up" AND
rings`; PubMed on `muscle-up[ti]`, `rings[ti] AND gymnast*`, wrist load in
weight-bearing upper-limb sport, calisthenics and street workout injury
epidemiology. The rings literature that does exist is elite artistic gymnastics
(iron cross, inverted cross, still-rings strength holds) and does not touch the
false grip. This is a genuinely unstudied movement.

### Recommendation — claim 2

**WITHDRAW `vidal_rovira_2024`** — nothing adequate found, and specifically
nothing found at all. Three drills currently carry a citation I cannot locate.

**KEEP THE TIER A PLACEMENT AS AN ENGINEERING CHOICE, labelled as one.** The
single relevant paper is not strong enough to force a change: n = 10, EMG
amplitude, participants who could already do the movement, and a progression
recommendation offered as discussion rather than tested. But it is the only
evidence there is, and it points the other way from the current design — it
suggests bar before rings, and large-muscle pulling strength before either. A
design that puts false-grip work at the entry tier is not *contradicted* by
evidence; it is *unsupported* by it, with the one adjacent data point mildly
against.

Worth noting for whoever decides: the app's Tier A gate is
`strict_pullup_max_reps >= 3`, which already satisfies the first half of Walker's
suggested progression (pulling strength from the large muscle groups). What it
skips is the bar-muscle-up intermediate. Whether that matters is not something
the literature answers.

**Does a credentialed human remain required for claim 2?** **Yes — but a
different kind of human than for 1b.** There is no clinical uncertainty here to
adjudicate, because there is no clinical evidence at all: nothing about the false
grip has been studied, so no clinician can read the literature and tell you the
answer either. What is needed is an experienced gymnastics or calisthenics coach
making an explicit, labelled judgement call, and the app saying plainly that this
progression rests on coaching consensus rather than evidence. Note that
`exercises.json` already types the false-grip prerequisites as
`"source": "coaching_consensus"` — the drill-level metadata is honest; it is the
`evidence_refs` array pointing at a paper I cannot find that is not.

---

## Summary table

| # | Question | Verdict | Credentialed human still required? |
|---|---|---|---|
| 1a | Eccentric-only for a beginner who cannot do the concentric | **WITHDRAW** the superiority claim — best current meta contradicts it for concentric outcomes | **No** — editorial fix, evidence is clear |
| 1b | Eccentric loading with resolved elbow tendinopathy; return-to-load progression | **KEEP AS ENGINEERING CHOICE**, label the ">3 months" threshold as unsourced | **Yes** — literature offers no threshold, no dose, no population match |
| 1c | Is 12-18 max-effort eccentric reps within evidence? | **KEEP AS ENGINEERING CHOICE** — rep count is within range; *entry intensity* departs from the recommended ramp | **No** for volume; **yes** for entry intensity if acted on |
| 2 | False grip from Tier A | **WITHDRAW** `vidal_rovira_2024`; **KEEP** the placement as a labelled engineering choice | **Yes**, but a coach rather than a clinician — nothing about the false grip has been studied |

Two of the four questions the literature can settle. Two it cannot, and knowing
which is which is the useful part of this sweep.
