# Evidence sourcing — five unlocatable citations in Terav's gymnastics/skill programmes

Date: 2026-09-05
Agent: evidence-sourcer
Scope: `next-app/public/data/citations.json`, `programs/handstand-walk.json`,
`programs/muscle-up.json`, `programs/overhead-mobility.json`,
`programs/first-strict-pullup.json`, `exercises.json`

Databases queried: Europe PMC REST (search + core + fullTextXML), Crossref REST,
publisher pages via fetch. Every candidate below was retrieved and quoted. Nothing
is proposed on recall.

**Headline results**

| id | outcome |
|---|---|
| `wiesinger_2019` | Source misattributed AND the claim is **contradicted** by the literature the real paper itself cites. |
| `sinnett_2019` | **Does not exist.** No indexed record anywhere. The only "hit" is a hallucinated search summary. |
| `sadowski_2021` | Paper exists at the recorded DOI under different authorship, and it is a **floor** study — closer to the claim than the repo currently believes. |
| `robertson_2004` | Paper is **real and correctly cited**; the specific "4–6h" claim is **contested** in the primary literature. |
| `ferrari_2021` | Does not exist, but a **near-exact** real paper does — Grabowiecki 2021, and it is more direct than the `yiou_2017` replacement. |

---

## 1. "Tendon adaptation timeframe (8-12 weeks for collagen turnover)" — `wiesinger_2019`

Lives in: `programs/handstand-walk.json:1771-1778` (`used_for`, mechanism basis for the
wrist volume cap) and as `evidence_ref` on six `prerequisites[]` entries in
`exercises.json` (lines 946, 1177, 1230, 1328, 1388, and the `references[]` at 924, 967,
1350, 2176) — gating `hs_wrist_pushups_floor`, `hs_kinoshita_1`, `hs_kinoshita_2`,
`hs_wall_walk`, `hs_chest_to_wall_hold`. `plan-generator.ts:418` drops drills on these.

**What the literature says:** The 2019 German Journal of Sports Medicine tendon paper is
Bohm S, Mersmann F, Arampatzis A, *Functional adaptation of connective tissue by
training*, DZSM 70:105-110 — confirmed by Crossref against the exact DOI the sweep
found. It is a narrative review, its own loading paradigm is **14 weeks**, and it
contains **no collagen-turnover figure at all**. Worse for the claim: the one thing it
says about collagen turnover is to cite Heinemeier et al. 2013, whose finding is that the
adult human tendon core is **essentially never renewed**. So "8-12 weeks for collagen
turnover" is not a soft paraphrase of the source — the source points the other way.

The defensible version of the underlying idea is not about collagen turnover at all. It
is that tendon *mechanical* adaptation (stiffness, Young's modulus) is demonstrable over
interventions of ≥8 weeks, larger at ≥12, and driven by loading **magnitude** rather than
duration or contraction type (Bohm 2015 meta-analysis). That is a different mechanism
from matrix turnover, and it does not license a *volume* cap — if anything it argues the
governing variable is intensity.

### Candidates

| rank | citation | design | n | population | verdict |
|---|---|---|---|---|---|
| 1 | Bohm, Mersmann & Arampatzis 2015 | Systematic review + meta-analysis | 27 studies / 37 interventions / 264 | Healthy adults 18–50, Achilles + patellar | PARTIAL |
| 2 | Heinemeier et al. 2013 | Forensic tissue study, ¹⁴C bomb-pulse | 28 tendon + 4 muscle samples | Adult human Achilles, cadaveric | **CONTRADICTS** |
| 3 | Bohm, Mersmann & Arampatzis 2019 (the real DZSM paper) | Narrative review | — | — | NONE (does not carry the figure) |
| 4 | Heinemeier et al. 2018 | ¹⁴C bomb-pulse, case-control | 25 tendinopathic / 10 healthy | Adult Achilles | CONTRADICTS (as applied) |

**Candidate 1 — Bohm S, Mersmann F, Arampatzis A (2015)**
- *Human tendon adaptation in response to mechanical loading: a systematic review and meta-analysis of exercise intervention studies on healthy adults.* Sports Med Open 1:7.
- **Identifier:** doi:10.1186/s40798-015-0009-9, PMID 27747846. Retrieved via Europe PMC `resultType=core`.
- **Quoted:** "A study was included if it conducted (a) a longitudinal exercise intervention (≥8 weeks) on (b) healthy humans (18 to 50 years)… SMD was 0.70 (confidence interval: 0.51, 0.88) for tendon stiffness (N=37), 0.69 (0.36, 1.03) for Young's modulus (N=17), and 0.24 (0.07, 0.42) for CSA (N=33), with significant overall intervention effects (p<0.05)."
- **Quoted:** "Although not significantly different, SMD was higher for interventions with longer duration (≥12 weeks)."
- **Quoted:** "the data strongly suggests that loading magnitude in particular plays a key role for tendon adaptation in contrast to muscle contraction type. Furthermore, intervention-induced changes in tendon stiffness seem to be more attributed to adaptations of the material rather than morphological properties."
- **Reach:** Achilles and patellar tendon only — lower limb, weight-bearing, largely isometric/resistance protocols in a lab. Terav is applying this to *wrist* extensor/flexor load in inverted support. No wrist tendon is in this dataset. Directness is poor at the site level, fair at the tissue level.
- **Would license:** "Tendon mechanical properties respond to ≥8 weeks of loading, with larger effects at ≥12 weeks, and loading magnitude matters more than contraction type (Achilles/patellar evidence)." Nothing about weeks-to-collagen-turnover, and nothing about a wrist minutes-per-week cap.

**Candidate 2 — Heinemeier KM, Schjerling P, Heinemeier J, Magnusson SP, Kjaer M (2013)**
- *Lack of tissue renewal in human adult Achilles tendon is revealed by nuclear bomb ¹⁴C.* FASEB J 27:2074-2079.
- **Identifier:** doi:10.1096/fj.12-225599, PMID 23401563. Retrieved via Europe PMC.
- **Quoted:** "existing data provide diverging estimates of tendon protein half-life that range from 2 mo to 200 yr."
- **Quoted:** "The tendon concentrations of ¹⁴C approximately reflected the atmospheric levels present during the first 17 yr of life, indicating that the tendon core is formed during height growth and is essentially not renewed thereafter."
- **Reach:** Forensic Achilles samples from adults born 1945–1983; not athletes, not wrists, not an exercise study. But it is the definitive measurement of the exact quantity the Terav claim asserts.
- **Would license:** "The load-bearing collagen core of adult human tendon shows essentially no renewal during adult life." Which is the opposite of the sentence in `handstand-walk.json`.

**Candidate 3 — Bohm S, Mersmann F, Arampatzis A (2019)** — the paper `wiesinger_2019` was presumably meant to be
- *Functional adaptation of connective tissue by training.* Dtsch Z Sportmed 70:105-110.
- **Identifier:** doi:10.5960/dzsm.2019.366. Confirmed via Crossref (authors, title, journal, volume, pages) and fetched from germanjournalsportsmedicine.com.
- **Quoted from the fetched article:** "the temporal adaptation dynamics of both tissues are different with slower response rates of the tendon"; the protocol described is "14 weeks"; adaptation involves "changes in the material properties (e.g. increases in collagen content or collagen cross-linking)". The article's only collagen-turnover reference is to Heinemeier et al. 2013.
- **Reach:** Review, no primary data of its own on wrists.
- **Would license:** "Tendon adapts more slowly than muscle." No number.

### Recommendation

**WITHDRAW the claim as worded** — "8-12 weeks for collagen turnover" is not merely
unsourced, it is contradicted by the best available measurement (Heinemeier 2013), and
the paper it was presumably drawn from cites that contradiction itself.

Two follow-ons for the human to decide, both outside my remit to apply:

1. If a tendon-timeframe rationale is wanted at all, ADOPT `bohm_2015`
   (doi:10.1186/s40798-015-0009-9) for a claim reworded to: *"Tendon mechanical
   properties adapt over interventions of 8 weeks or more, with larger effects beyond 12
   weeks; the evidence is from Achilles and patellar tendon in healthy adults, not the
   wrist."*
2. Even so, that paper supports a **timeframe**, not a **volume cap** — the meta-analysis
   points at loading magnitude, not minutes. The 20-30 min cap should stay labelled what
   the programme already calls it: **KEEP AS ENGINEERING CHOICE**.

**Note on the six `prerequisites[].evidence_ref` entries.** These are marked
`source: "literature"` and cause `plan-generator.ts` to withhold drills. None of the
retrieved papers speaks to a wrist capability-level threshold for a handstand drill.
Whatever id replaces `wiesinger_2019` there, `source` for those six should read
`coaching_consensus`, not `literature` — I found no literature that gates a handstand
drill on a graded wrist tolerance level.

---

## 2. "Band-assisted pull-up training improves strength and pull-up performance." — `sinnett_2019`

Lives in: `programs/first-strict-pullup.json:1325-1332`, `programs/muscle-up.json:1352-1360`
(the muscle-up entry is the sole warrant for the **deferral substitute** — the
band-assisted ring dip a not-yet-ready user is handed instead), plus ~24 `references[]`
entries across `exercises.json`.

**What the literature says:** There is no such paper. Sinnett AM has exactly one indexed
publication (a 2001 JSCR study on anaerobic power and 10-km run performance, unrelated).
Cheatham SW has no indexed pull-up paper. Brismée JM published ten indexed papers in
2019, all in manual therapy and none on pull-ups. Crossref returns nothing. A full-text
Europe PMC search for the phrases "assisted pull-up" and "band-assisted" returns 13 and
154 hits respectively, of which **zero** are band-assisted pull-up training studies (the
"band-assisted" corpus is almost entirely endoscopy). More broadly: I could not retrieve
**any** intervention study, in any journal, comparing band-assisted pull-up training to a
control for the acquisition of an unassisted pull-up. The claim is not weakly supported;
it is unstudied.

**A specific warning about how this id may have entered the repo.** A web search for the
exact byline returned a confident summary asserting a 2019 three-arm study (bands vs.
machine vs. eccentric) in which "the group using resistance bands showed the least
improvement" and researchers coined a "false competence zone". I fetched the page that
summary was built from (boxrox.com). It cites five studies, from 2002, 2013, 2015, 2017
and 2010, and **names none of Sinnett, Cheatham or Brismée**. The summary was
confabulated. This is worth recording: the `sinnett_2019` record has the exact texture of
a citation generated rather than retrieved, and the search layer will keep manufacturing
corroboration for it on demand.

### Candidates

| rank | citation | design | n | population | verdict |
|---|---|---|---|---|---|
| — | *Band-assisted pull-up training* | — | — | — | **NONE-FOUND** |
| 1 | Lopes et al. 2019 | Systematic review + meta-analysis | 8 studies | Mixed adult | INDIRECT (band *resistance*, not *assistance*) |
| 2 | Sánchez-Moreno et al. 2020 | RCT (2-arm) | 29 | Strength-trained men, 15.9 ± 4.9 pull-ups | INDIRECT (already able to do pull-ups) |
| 3 | Dickie et al. 2017 | Cross-sectional EMG | 19 | Strength-trained males | INDIRECT (no assistance condition) |

**Candidate 1 — Lopes JSS, Machado AF, Micheletti JK, de Almeida AC, Cavina AP, Pastre CM (2019)**
- *Effects of training with elastic resistance versus conventional resistance on muscular strength: A systematic review and meta-analysis.* SAGE Open Med 7:2050312119831116.
- **Identifier:** doi:10.1177/2050312119831116, PMID 30815258. Retrieved via Europe PMC.
- **Quoted:** "The results of the meta-analysis demonstrated no superiority between the methods analyzed for lower limb (SMD = -0.11, 95% CI -0.40, 0.19, p = 0.48) or upper limb muscular strength (SMD=0.09; 95% CI -0.18, 0.35; p = 0.52)… Elastic resistance training is able to promote similar strength gains to conventional resistance training, in different population profiles and using diverse protocols."
- **Reach:** Large. This is elastic **resistance** — band adds load. Terav's use is elastic **assistance** — band removes load, and removes most of it exactly at the bottom position where the sticking point lives. Mechanically these are near-opposites. Eight studies, none involving pull-ups.
- **Would license:** "Elastic devices can produce strength gains comparable to weights when used as the resistance." It does not license anything about band assistance, and it must not be cited as if it did.

**Candidate 2 — Sánchez-Moreno M, Cornejo-Daza PJ, González-Badillo JJ, Pareja-Blanco F (2020)**
- *Effects of Velocity Loss During Body Mass Prone-Grip Pull-up Training on Strength and Endurance Performance.* J Strength Cond Res 34(4):911-917.
- **Identifier:** doi:10.1519/JSC.0000000000003500, PMID 32213783. Retrieved via Europe PMC.
- **Quoted:** "VL25 attained significantly greater gains than VL50 in all analyzed variables except in MNR (P < 0.05)… once a 25% velocity loss is achieved during PU training, further repetitions did not elicit additional gains and can even blunt the improvement in strength and endurance performance."
- **Reach:** Poor for this claim. Participants already averaged 15.9 pull-ups to failure — the opposite end of the population from a `first-strict-pullup` user, and no assistance modality is used. Its relevance is to *set termination*, not to assistance.
- **Would license:** "In men who can already do pull-ups, stopping sets at ~25% velocity loss produces better strength and endurance gains than grinding to 50%."

**Candidate 3 — Dickie JA, Faulkner JA, Barnes MJ, Lark SD (2017)**
- *Electromyographic analysis of muscle activation during pull-up variations.* J Electromyogr Kinesiol 32:30-36.
- **Identifier:** doi:10.1016/j.jelekin.2016.11.004, PMID 28011412. Retrieved via Europe PMC.
- **Quoted:** "Results indicate that EMGPEAK and EMGARV of the shoulder-arm-forearm complex during complete repetitions of pull-up variants are similar despite varying hand orientations; however, differences exist between concentric and eccentric phases of each pull-up."
- **Reach:** Grip variations only, no band condition, n=19 strength-trained males. Included here only because `citations.json` records that an earlier `sinnett_2019` wording described EMG findings — if that EMG language ever resurfaces, this is the real paper in that space, and it says nothing about assistance.
- **Would license:** "Grip orientation does not meaningfully change pull-up muscle activation over a full rep."

### Recommendation

**WITHDRAW `sinnett_2019` — the source does not exist and the claim is unstudied.**

This is the finding with the most product weight, because of where the citation sits:

- In `muscle-up.json` it is the **sole** warrant for the deferral substitute. A user told
  they are not ready for a muscle-up is handed a band-assisted ring dip on the strength
  of a citation with no referent. Under the confirm-first rule ("every change cites a
  study OR names its log signal") that substitution currently cites neither.
- In `first-strict-pullup.json` it underwrites band assistance being "a legitimate
  groove/volume driver rather than a lesser substitute." Note that this specific
  reassurance is the one the literature is *least* able to give: the only retrieved
  quantitative claim in the neighbourhood (Roig 2009, already adopted at
  `first-strict-pullup.json:1320`) favours eccentrics, and nothing establishes that
  band-assisted reps transfer to unassisted ones.

The honest replacement is not another citation. It is **KEEP AS ENGINEERING CHOICE** —
band assistance is standard coaching practice, its transfer to the unassisted rep is not
established either way, and labelling it as coaching convention is accurate. Do **not**
substitute Lopes 2019: band resistance and band assistance are different interventions,
and swapping one in for the other would repeat the failure mode this sweep exists to
catch.

---

## 3. Press-to-handstand shoulder-moment analysis — `sadowski_2021`

Lives in: `programs/handstand-walk.json:1737-1745`, `programs/muscle-up.json:1232-1240`,
`programs/overhead-mobility.json:964-972`, and as `evidence_ref` on four `prerequisites[]`
entries in `exercises.json` (1277, 1375, 1384, plus `references[]` at 1199, 1252, 1410, 1502).

**What the literature says:** Lead with the good news, because the repo's current belief
is wrong in a way that *understates* its own position. There is no Sadowski paper — but
the DOI in the record is correct, and the paper at it is **Mizutori H, Kashiwagi Y,
Hakamada N, Tachibana Y, Funato K (2021), *Kinematics and joints moments profile during
straight arm press to handstand in male gymnasts*, PLoS One 16(7):e0253951**. It is not,
as all three programmes currently state, a parallel-bars study. Participants pressed to
handstand **with their hands on a force platform and their feet on the floor**. It is a
floor press-to-handstand study — precisely the movement the citation is used to reason about.

Where the "parallel bars" belief came from is now traceable: the 3× bodyweight figure
appears in Mizutori's *introduction*, describing prior work by Prassas on the parallel
bars event, not as a finding of this paper. So the repo's instruction "do not cite that
number" is substantively right, for the wrong stated reason.

And the paper's actual finding supports the programming rule more directly than the
withdrawn number did: **less-skilled** performers produced **larger** shoulder flexion
moments than highly-skilled ones, across most of the movement.

### Candidates

| rank | citation | design | n | population | verdict |
|---|---|---|---|---|---|
| 1 | Mizutori et al. 2021 | Cross-sectional biomechanics, force plate + inverse dynamics | 59 | Highly skilled male artistic gymnasts, two skill strata | **DIRECT-SUPPORT** (qualitative) |
| 2 | MacDonald et al. 2025 | Systematic review | 21 studies | Gymnasts, handstand biomechanics | PARTIAL (context, not moments) |

**Candidate 1 — Mizutori H, Kashiwagi Y, Hakamada N, Tachibana Y, Funato K (2021)**
- *Kinematics and joints moments profile during straight arm press to handstand in male gymnasts.* PLoS One 16(7):e0253951.
- **Identifier:** doi:10.1371/journal.pone.0253951, PMID 34260617, PMC8279359. Abstract and full text retrieved via Europe PMC (`fullTextXML`).
- **Quoted (abstract):** "Fifty-nine male gymnasts performed a straight arm press to handstand on a force platform and were judged on their performance by experienced certified judges… Larger shoulder flexion moments were observed in less-skilled compared with highly-skilled performers (at 3–59%, p < 0.001) while larger hip flexion moments were observed in highly-skilled performers at 52% (p = 0.045) and 56% (p = 0.048)."
- **Quoted (methods, full text):** "participants placed their hands shoulder width apart on the middle of the force platform with their feet placed on the floor (off the force platform) before performing the SAPH." — i.e. floor, not parallel bars.
- **Quoted (introduction, full text — the provenance of the 3× figure):** "As for joint moment analysis on SAPH during the parallel bars event [14–16], the shoulder joint moment is about three times body weight" — cited to Prassas, not measured here.
- **Quoted (introduction, full text — a floor-relevant magnitude that IS usable, though also secondhand):** "moment produced by each joint during a handstand is from 0.2 Nm・kg⁻¹ of body weight to 1.0 Nm・kg⁻¹ at most [9]."
- **Reach:** 59 male artistic gymnasts, all skilled enough to perform a straight-arm press. Terav's users are adults who by construction cannot do this. The direction of the finding is what transfers — the *less* skilled group loaded the shoulder more — and that inference runs the right way for Terav's rule, but it is an extrapolation from "less skilled gymnast" to "cannot press at all".
- **Would license:** "In male gymnasts performing a floor straight-arm press to handstand, less-skilled performers generate larger shoulder flexion moments than highly-skilled performers over most of the movement." That is a direct, quotable warrant for *not programming the straight-arm press early*, with no number attached.

**Candidate 2 — MacDonald M, Baker JS, Gu Y, Ugbolue UC (2025)**
- *Biomechanical analyses of the handstand: a systematic review.* Front Sports Act Living.
- **Identifier:** doi:10.3389/fspor.2025.1694648, PMID 41473027. Retrieved via Europe PMC.
- **Quoted:** "gymnasts minimize problems related to disturbed balance during the handstand using a 'wrist strategy' to secure a fixed-body configuration. If the 'wrist strategy' fails, then the wrists, shoulders, hips, and elbows are utilized, which can be interpreted as a mixed control strategy… Gymnasts with greater strength possess better balance control."
- **Reach:** 21 studies, gymnast populations throughout. Reports that only 21% of the included studies examined joint torque contributions — i.e. this is a thin evidence base by the review's own accounting.
- **Would license:** "Handstand balance is primarily wrist-mediated, with shoulders/hips/elbows recruited when the wrist strategy fails; stronger gymnasts balance better." Useful as programme framing; carries no press-to-handstand moment figure.

### Recommendation

**ADOPT `10.1371/journal.pone.0253951` under its correct byline — Mizutori et al. 2021 —
for a claim reworded to:** *"In male gymnasts performing a floor straight-arm press to
handstand, less-skilled performers produced larger shoulder flexion moments than
highly-skilled performers across most of the movement. Terav uses this as the reason not
to programme the straight-arm press early. No bodyweight-normalised moment figure is
taken from this paper."*

Three corrections a human should apply, in citations.json and all three programmes:

1. `authors` → `Mizutori H, Kashiwagi Y, Hakamada N, Tachibana Y, Funato K`;
   `title` → `Kinematics and joints moments profile during straight arm press to
   handstand in male gymnasts`. The id string can stay if churn is a concern, but the
   displayed byline is currently wrong on the public `/evidence` page.
2. Delete the "parallel-bars study" characterisation from all three `used_for` strings.
   It is factually incorrect and it makes the programmes look less well-sourced on this
   point than they actually are.
3. Keep the 3× bodyweight figure withdrawn, but for the correct reason: it is a
   parallel-bars value from Prassas, quoted in Mizutori's introduction, not a finding of
   the retrieved paper. `muscle-up.json` already reached the right conclusion here.

The four `exercises.json` prerequisites gating on `shoulder_overhead_endurance`
minimum levels still exceed what this paper licenses — it measures moments, it does not
set a capability threshold. Same note as §1: `source: "coaching_consensus"` would be the
accurate label for the threshold itself.

---

## 4. "4-6h post-practice consolidation window vulnerable to similar-task interference" — `robertson_2004`

Lives in: `programs/handstand-walk.json:1904-1911` — underpins the "don't stack handstand
practice immediately after heavy overhead press" placement rule.

**What the literature says:** The citation is real and correctly recorded — Robertson EM,
Pascual-Leone A, Miall RC, *Current concepts in procedural consolidation*, Nat Rev
Neurosci 5:576-582, doi:10.1038/nrn1426, PMID 15208699. Europe PMC holds no abstract and
the Nature page is paywalled, so **I could not retrieve its text and will not quote it**.
The primary literature it reviews is retrievable, and it splits. Brashers-Krug, Shadmehr
& Bizzi 1996 is the origin of the window and found interference abolished at four hours.
Caithness et al. 2004 — three laboratories, six experiments — failed to replicate,
finding full interference at 24 hours and even at one week. Goedert & Willingham 2002
found the same for sequence learning and prism adaptation. Robertson himself, in a
second 2004 paper, wrote a Current Biology dispatch about the concept being challenged.
So: a real citation, a real classic behind it, and a claim the field has not settled.

Note also that the interference literature is entirely about **similar** tasks — opposing
force fields, competing visuomotor rotations, conflicting motor sequences. Heavy overhead
pressing is not a competing motor *memory* for handstand balance; whatever the case for
not stacking them, it is a fatigue and shoulder-load argument, not a consolidation one.
That gap is larger than the replication problem.

### Candidates

| rank | citation | design | n | population | verdict |
|---|---|---|---|---|---|
| 1 | Caithness et al. 2004 | Multi-lab replication attempt, 6 experiments | 3 laboratories | Healthy adults, reaching tasks | **CONTRADICTS** |
| 2 | Brashers-Krug, Shadmehr & Bizzi 1996 | Psychophysical experiment | not stated in abstract | Healthy adults, force-field reaching | PARTIAL (origin of the 4h figure) |
| 3 | Goedert & Willingham 2002 | Interference paradigm, 48h retest | not stated in abstract | Healthy adults, sequence + prism | CONTRADICTS |
| 4 | Krakauer & Shadmehr 2006 | Narrative review | — | — | PARTIAL (adjudicates the dispute) |
| 5 | Robertson et al. 2004 (the cited paper) | Review | — | — | UNRETRIEVED — exists, content not verified |

**Candidate 1 — Caithness G, Osu R, Bays P, Chase H, Klassen J, Kawato M, Wolpert DM, Flanagan JR (2004)**
- *Failure to consolidate the consolidation theory of learning for sensorimotor adaptation tasks.* J Neurosci 24:8662-8671.
- **Identifier:** doi:10.1523/JNEUROSCI.2214-04.2004, PMID 15470131. Retrieved via Europe PMC.
- **Quoted:** "The evidence supporting this idea comes from studies showing that the motor memory of a task (A) is lost when an opposing task (B) is experienced soon after, but not if sufficient time is allowed to pass (approximately 6 hr). We report results from three laboratories challenging this consolidation idea… we found that B fully interferes with the retention of A even when B is experienced 24 hr after A… we also observed full interference between A and B when they are separated by 24 hr or even 1 week… Our results fail to support the idea that motor memories become consolidated into a protected state."
- **Reach:** Healthy adults, laboratory reaching under visuomotor rotations and force fields. Very far from whole-body inverted balance practice. But it is the direct test of the mechanism Terav invokes.
- **Would license:** "The claim that motor memories become interference-proof after ~6 hours failed to replicate across three laboratories."

**Candidate 2 — Brashers-Krug T, Shadmehr R, Bizzi E (1996)**
- *Consolidation in human motor memory.* Nature 382:252-255.
- **Identifier:** doi:10.1038/382252a0, PMID 8717039. Retrieved via Europe PMC.
- **Quoted:** "consolidation of a motor skill was disrupted when a second motor task was learned immediately after the first. There was no disruption if four hours elapsed between learning the two motor skills, with consolidation occurring gradually over this period."
- **Reach:** Same laboratory-reaching limitation, and it is the *first* result — the one Ioannidis's warning is aimed at. Thirty years old, and the effect did not survive replication.
- **Would license:** "In a force-field reaching task, learning a second task immediately after a first disrupted retention of the first; a four-hour gap abolished the disruption." Note the figure is **four** hours, not "4-6h" — the 6h number comes from Caithness's summary of the literature it then refutes.

**Candidate 3 — Goedert KM, Willingham DB (2002)**
- *Patterns of interference in sequence learning and prism adaptation inconsistent with the consolidation hypothesis.* Learn Mem 9:279-292.
- **Identifier:** doi:10.1101/lm.50102, PMID 12359837. Retrieved via Europe PMC.
- **Quoted:** "In both the learning of a movement sequence and the learning of a visuo-motor mapping, we found that remote memories were susceptible to interference, but the passage of time did not afford protection from interference. These results are inconsistent with the long-term consolidation of these motor skills."
- **Reach:** As above. The authors themselves note their tasks "are not dynamic motor skills", which is a caveat that partially protects the original claim for whole-body tasks.
- **Would license:** "For sequence learning and prism adaptation, elapsed time does not protect a motor memory from interference."

**Candidate 4 — Krakauer JW, Shadmehr R (2006)**
- *Consolidation of motor memory.* Trends Neurosci 29:58-64.
- **Identifier:** doi:10.1016/j.tins.2005.10.003, PMID 16290273. Retrieved via Europe PMC.
- **Quoted:** "We also review evidence for and against a consolidation process for adaptation of arm movements. We propose that contradictions have arisen because consolidation can be masked by inhibition of memory retrieval."
- **Reach:** Review; Shadmehr is an author of the 1996 original, so read it as an interested reconciliation rather than a neutral adjudication.
- **Would license:** "Whether motor memory consolidates into an interference-proof state remains disputed; one proposed reconciliation is that consolidation is masked by retrieval inhibition."

**Candidate 5 — the cited paper itself.** Robertson EM, Pascual-Leone A, Miall RC (2004),
Nat Rev Neurosci 5:576-582, doi:10.1038/nrn1426, PMID 15208699. Existence and identifiers
confirmed in Europe PMC and against the DOI. No abstract is indexed; nature.com returns a
303 to an authentication endpoint. **I have not read it and therefore quote nothing from
it.** Contextually relevant: the same author's other 2004 paper, *Skill learning: putting
procedural consolidation in context* (Curr Biol 14:R1061-3, doi:10.1016/j.cub.2004.11.048,
PMID 15620642), is abstracted as — quoted — "An important aspect of this processing is
thought to be the transformation of a memory from a fragile to a stable state: a concept
challenged by a recent study." Robertson was writing about the challenge in the same year
Terav cites him for the claim.

### Recommendation

**KEEP the citation, REWORD the claim, and DROP the numeric window.**

`robertson_2004` is the one id in this sweep that is real and correctly recorded, and a
2004 Nature Reviews piece is a defensible anchor for "practice sessions are followed by
offline processing." What it cannot carry is "4-6h… vulnerable to similar-task
interference" stated as fact: the four-hour figure is Brashers-Krug 1996, the six-hour
figure is Caithness's paraphrase of the literature it goes on to refute, and three
laboratories failed to replicate the protection.

Suggested rewording for the human to consider: *"Motor skills continue to be processed
after practice ends, and early post-practice interference from a competing motor task has
been reported — though the size and duration of any protected window is disputed
(Brashers-Krug 1996 vs Caithness 2004). Terav's rule against stacking handstand practice
on heavy overhead press is a fatigue and shoulder-load decision, not a consolidation
finding."*

Somebody with journal access should read `nrn1426` before the reworded text ships. I
could not, and the rule against citing unread sources applies to the reworded claim too.

---

## 5. Walking-initiation biomechanics — `ferrari_2021` (orphaned)

Lives in: `exercises.json` — `references[]` at 1548, 1724, 1770, 1813, 1857, 2045, 2091,
2137, and critically a `prerequisites[].evidence_ref` at 1703 gating
`hs_single_step_attempt` on `handstand_hold_static` minimum_level 3.
`handstand-walk.json:1835` replaced it with `yiou_2017` on 2026-08-18; `citations.json:372`
still carries the orphaned record, and `exercises.json` still points at it.

**What the literature says:** "Ferrari A, et al. (2021), Walking initiation biomechanics,
Gait & Posture" does not exist. The paper the sweep flagged as nearest is not merely
nearest — it is the paper. **Grabowiecki M, Rum L, Laudani L, Vannozzi G (2021),
*Biomechanical characteristics of handstand walking initiation*, Gait & Posture
86:311-318.** Same year, same journal, and the volume and page range match exactly what
the sweep saw. It is a study of **handstand** walking initiation in gymnasts, which makes
it substantially more direct than `yiou_2017` — a narrative review of bipedal gait
initiation oriented toward frail and neurological populations. There is also a 2025
follow-up from the same group.

This is the one claim in the sweep where the literature is better than the repo currently
thinks, and where the *replacement already made* is the weaker of the two available options.

### Candidates

| rank | citation | design | n | population | verdict |
|---|---|---|---|---|---|
| 1 | Grabowiecki et al. 2021 | Cross-sectional biomechanics, force plates + stereophotogrammetry | 19 | Gymnasts, handstand walking initiation | **DIRECT-SUPPORT** |
| 2 | Grabowiecki et al. 2025 | Repeated-measures within-subject | 18 | Experienced gymnasts, loaded handstand walk initiation | PARTIAL |
| 3 | Yiou et al. 2017 (current replacement) | Narrative review | — | Able-bodied + frail, bipedal | INDIRECT |

**Candidate 1 — Grabowiecki M, Rum L, Laudani L, Vannozzi G (2021)**
- *Biomechanical characteristics of handstand walking initiation.* Gait Posture 86:311-318.
- **Identifier:** doi:10.1016/j.gaitpost.2021.03.036, PMID 33839425. Retrieved via Europe PMC.
- **Quoted:** "While past literature abundantly investigated the initiation in bipedal gait, the initiation of handstand walking remains unexplored."
- **Quoted:** "We found that to successfully perform the handstand walking initiation, a shift of the CoM forward and towards the stance hand is required as a result of a lateral and posterior CoP shift. All participants performed a similar CoP pattern in the mediolateral direction, whereas two anteroposterior CoP displacement strategies were identified across participants based on different timing execution of posterior CoP shift."
- **Quoted:** "A better understanding of the required CoP/CoM patterns and balance control provides the basis for further neuromechanics research on the topic and could contribute to individualise training protocols to improve the learning of the task."
- **Reach:** 19 gymnasts, all already able to handstand-walk. Terav's `hs_single_step_attempt` user is by definition not there yet, so this describes the target pattern rather than the learner's. That is exactly the use the drill design makes of it. Close directness — the closest of anything in this sweep.
- **Would license:** "Initiating a handstand walk requires shifting the centre of mass forward and toward the stance hand, produced by a lateral and posterior shift of the centre of pressure." Which is, near-verbatim, the "lean the shape toward the far wall" cue rationale currently attributed to `yiou_2017`.

**Candidate 2 — Grabowiecki M, Rum L, Laudani L, Vannozzi G (2025)**
- *Effects of an external load on anticipatory mechanisms of handstand walking initiation in experienced gymnasts.* J Sports Sci 43:370-380.
- **Identifier:** doi:10.1080/02640414.2025.2458995, PMID 39878630. Retrieved via Europe PMC.
- **Quoted:** "Anticipatory postural adjustments (APAs) are responsible for a successful first step execution in handstand walking."
- **Quoted:** "Results show gymnasts' ability to modify their APAs over repeated trials to adapt to an external load, enabling them to initiate accurate forward steps. Training exercises should target handstand walking preparatory mechanisms for a smooth transition between handstand and stepping."
- **Reach:** 18 experienced gymnasts, load-perturbation paradigm. Adds a training-design implication the 2021 paper does not state, and it points the same way as the drill: train the *preparation*, not just the step.
- **Would license:** "Anticipatory postural adjustments govern the first step in handstand walking, and gymnasts adapt them over repeated trials; training should target these preparatory mechanisms."

**Candidate 3 — Yiou E, Caderby T, Delafontaine A, Fourcade P, Honeine JL (2017)** — the replacement currently in `handstand-walk.json`
- *Balance control during gait initiation: State-of-the-art and research perspectives.* World J Orthop 8:815-828.
- **Identifier:** doi:10.5312/wjo.v8.i11.815, PMID 29184756. Retrieved via Europe PMC.
- **Quoted:** "Gait initiation - the transient period between the quiet standing posture and steady state walking - is a functional task that is classically used in the literature to investigate how the central nervous system (CNS) controls balance during a whole-body movement… It is well known that balance control is affected by aging, neurological and orthopedic conditions."
- **Reach:** Poor for a handstand programme. Bipedal, upright, framed around "frail populations" and rehabilitation targeting. A narrative review, which ranks below the primary biomechanics work available on the actual task.
- **Would license:** "Gait initiation is a balance-challenging transition governed by anticipatory postural adjustments." True, and about walking on your feet.

### Recommendation

**ADOPT `10.1016/j.gaitpost.2021.03.036` (Grabowiecki et al. 2021) for a claim reworded
to:** *"Handstand walking initiation requires shifting the centre of mass forward and
toward the stance hand, produced by a lateral and posterior centre-of-pressure shift
(19 gymnasts, force plate + motion capture). Informs the single-step drill design and the
'lean the shape toward the far wall' external-focus cue."*

Notes for the human:

- This should replace `yiou_2017` in `handstand-walk.json:1835` as well as the orphaned
  `ferrari_2021` in `exercises.json`. Grabowiecki is primary biomechanics on the exact
  task; Yiou is a narrative review of a different task in a different population. Keeping
  Yiou alongside as general balance-control context is defensible; keeping it *instead*
  is not.
- Consider adding Grabowiecki 2025 (doi:10.1080/02640414.2025.2458995) as the second
  reference, since it is the one that actually says training should target the
  preparatory phase.
- The `prerequisites[]` gate at `exercises.json:1703` — `handstand_hold_static`
  minimum_level 3 before `hs_single_step_attempt` — is **not** licensed by either paper.
  Both studied gymnasts who could already do the skill; neither establishes a hold-duration
  threshold that predicts readiness to step. Same recommendation as §1 and §3: that gate
  is `coaching_consensus`, and marking it `source: "literature"` overstates it.
- Once `exercises.json` no longer references it, the orphaned `ferrari_2021` record at
  `citations.json:372` can go.

---

## Cross-cutting observation

Eleven `prerequisites[].evidence_ref` entries across `exercises.json` are marked
`source: "literature"` and cause `plan-generator.ts:418` to withhold a drill from a user.
Across all five claims, **not one** retrieved paper establishes a capability-level
threshold for any drill. The papers measure moments, centres of pressure, tendon
stiffness and interference windows; the thresholds are coaching judgement layered on top.
That layering is reasonable — but the `source: "literature"` label asserts something the
sources do not say, and it does so at the point in the system where the app decides what
a user is not allowed to attempt.

That is the same pattern the CLAUDE.md notes record for `daily_log_schema` and
`progression_rules.states[]`: a field authored in good faith that claims more than what
sits behind it. Worth a human decision separate from the five citations.
