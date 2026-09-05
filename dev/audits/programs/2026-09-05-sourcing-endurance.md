# Evidence sourcing — endurance & mobility citations

**Date:** 2026-09-05
**Agent:** evidence-sourcer
**Scope:** five claims in `next-app/public/data/programs/` whose citations could not be
verified, plus one orphaned citation.
**Method:** PubMed E-utilities (esearch/esummary/efetch), Crossref REST, Europe PMC,
PMC full text. Every candidate below has a retrieved identifier and a quote taken from a
record I actually fetched. Nothing is listed from recall.

**Standing caveat:** I propose; I do not adopt. Nothing here is a prescription, and
nothing here should be pasted into `citations.json` without a human deciding the
`used_for` wording.

---

## 1. "Supine flexion goniometer reliability — the retest_metric anchor" — `overhead-mobility.json` (`kim_2013`)

**What the literature says:** `kim_2013` does not exist — I enumerated the whole issue
and the cited pages fall in a gap, as the sweep reported. But the underlying claim is
well supported by other work, and better supported than the programme currently states.
Supine goniometry of shoulder flexion is *more* reliable than seated, not merely as
reliable; the real finding the programme is missing is not the ICC but the **minimal
detectable change**, which is 11–16° for a single rater. The programme's retest bands
(`< 160`, `>= 165`, `>= 180`) are separated by 5–15°, i.e. at or inside measurement
noise for one rater with a goniometer.

### Candidates

| rank | citation | design | n | population | verdict |
|---|---|---|---|---|---|
| — | `kim_2013` as recorded | — | — | — | **NONE-FOUND (does not exist)** |
| 1 | Muir, Corea & Beaupre 2010 | intra-/inter-rater reliability study | 17 | adults with and without shoulder pathology | **DIRECT-SUPPORT** |
| 2 | Sabari et al. 1998 | intrarater reliability, supine vs sitting | 30 | 11 rehab inpatients + 19 students | **DIRECT-SUPPORT (position-specific)** |
| 3 | van de Pol, van Trijffel & Lucas 2010 | systematic review (21 studies) | — | upper-extremity, with and without disorders | **PARTIAL (instrument-level, not supine-flexion-specific)** |
| 4 | Riddle, Rothstein & Lamb 1987 | reliability, clinical setting | 2×50 | shoulder patients | **PARTIAL (position uncontrolled)** |
| 5 | Kolber & Hanney 2012 | intrarater reliability + concurrent validity | 30 | asymptomatic | **INDIRECT (seated, not supine)** |

---

#### Disconfirmation of `kim_2013`

- **Identifier attempted:** "Kim SH, Kim HK, Kim MY (2013), *Reliability of shoulder ROM
  measurement in supine position*, J Phys Ther Sci 25(11):1435-1438"
- **What I did:** enumerated every PubMed-indexed article in *J Phys Ther Sci* vol 25
  issue 11 (35 records) via
  `esearch.fcgi?db=pubmed&term="J Phys Ther Sci"[jour]+AND+25[volume]+AND+11[issue]`.
- **Result:** the issue's pagination runs `1359-62 … 1429-31, 1433-5, 1437-43, 1445-9 …
  1511-3`. **Pages 1435-1438 do not exist.** Confirms the sweep exactly.
- A second search of the whole 2013 volume for `shoulder AND reliability` returned two
  papers, neither of them: Uritani 2013 (25(9):1181-4, ultrasound posture analysis) and
  Nam et al. 2013 (25(6):737-9, forward head posture).
- **Verdict: the cited work does not exist.** The `"verification_status": "verified"`
  flag currently on this entry in `overhead-mobility.json` is false, and its `url` is a
  PubMed *search-term* link, not a record link — the same failure shape as `das_2019`
  below. A search URL renders as a citation on the public /evidence page while proving
  nothing.

#### Candidate 1 — Muir SW, Corea CL, Beaupre L (2010)

- **Identifier:** PMID **21589666**; PMCID PMC2971638. *N Am J Sports Phys Ther*
  5(3):98-110. Fetched via `efetch.fcgi?db=pubmed&id=21589666`.
- **Quoted:** "The criterion reliability was achieved in both groups for intra-rater
  reliability of standing AROM abduction; **supine AROM and PROM abduction, flexion,
  external rotation at 0° abduction**". And: "The SEM ranged from 4°-7° for intra-rater
  and 6°-9° for inter-rater agreement on movements that achieved the criterion
  reliability. **The MCD ranged from 11°-16° for a single evaluator and 14°-24° for two
  evaluators.**" Conclusion: "**Assessment of AROM and PROM in supine achieves superior
  reliability.**"
- **Reach:** close. Adults, mixed symptomatic/asymptomatic, standard universal
  goniometer, supine, active *and* passive flexion — the exact measurement the programme
  asks a user to self-administer or have administered. Two gaps: n=17 is small, and
  these were trained raters in a clinic, not a lifter with a phone app measuring their
  own shoulder. Self-measurement is a further, unevidenced step.
- **Would license:** "Shoulder flexion measured supine with a goniometer reaches
  acceptable intra-rater reliability (SEM 4–7°), and supine is more reliable than
  standing; a change smaller than roughly 11° by the same rater cannot be distinguished
  from measurement error."

#### Candidate 2 — Sabari JS, Maltzev I, Lubarsky D, Liszkay E, Homel P (1998)

- **Identifier:** PMID **9630143**; DOI 10.1016/s0003-9993(98)90038-7. *Arch Phys Med
  Rehabil* 79(6):647-51.
- **Quoted:** "ICCs between trials 1 and 2 on comparable measurements in the same
  position indicated **high intrarater reliability for active and passive measurements,
  regardless of testing position**." And: "**Lowered reliability between measurements
  taken in different positions indicates that test position should be routinely
  recorded, and repeated clinical measures of individual subjects should be administered
  in a consistent position.**"
- **Reach:** moderate. 30 adults, but 11 were rehabilitation inpatients and 19 university
  students — neither is an overhead-athlete population. Directly answers the *position*
  question, which is the one the programme's design note actually turns on.
- **Would license:** "Supine and seated shoulder-flexion goniometry are each reliable
  within themselves, but they do not agree with each other — retest must use the same
  position every time."
- **Note for the programme:** this is the stronger warrant for the design decision at
  `overhead-mobility.json` line ~916 ("Supine flexion goniometer as primary retest") than
  anything about ICC magnitude. The reason to fix the position is that positions are not
  interchangeable, not that supine is uniquely reliable.

#### Candidate 3 — van de Pol RJ, van Trijffel E, Lucas C (2010)

- **Identifier:** PMID **20500132**; DOI 10.1016/s1836-9553(10)70049-7. *J Physiother*
  56(1):7-17. Systematic review, 21 studies.
- **Quoted:** "**Measurements of physiological range of motion using instruments were
  more reliable than using vision.** … In order to make reliable decisions about joint
  restrictions in clinical practice, we recommend that clinicians measure passive
  physiological range of motion using goniometers or inclinometers." Also, and this is
  the part worth keeping: "**Overall, the methodological quality of studies was poor.**"
- **Reach:** upper-extremity joints broadly, not supine shoulder flexion specifically.
  Highest design rank of the set, lowest directness.
- **Would license:** "Instrumented ROM measurement beats eyeballing it" — which is a
  weaker claim than the programme makes, but is the one a systematic review supports.

#### Candidate 4 — Riddle DL, Rothstein JM, Lamb RL (1987)

- **Identifier:** PMID **3575423**; DOI 10.1093/ptj/67.5.668. *Phys Ther* 67(5):668-73.
- **Quoted:** "The intratester intraclass correlation coefficients (ICCs) for all motions
  ranged from .87 to .99. … The intertester ICCs for PROM measurements of **flexion**,
  abduction, and lateral rotation ranged from **.84 to .90**."
- **Reach:** shoulder patients, n=100, but "Patients were measured **without controlling
  therapist goniometric placement technique or patient position** during measurements" —
  so it says nothing about supine. Superseded on directness by Muir 2010; kept here
  because it is the most-cited classic and someone will ask why it is not the anchor.

#### Candidate 5 — Kolber MJ, Hanney WJ (2012) — *listed to rule it out*

- **Identifier:** PMID **22666645**; PMCID PMC3362980. *Int J Sports Phys Ther* 7(3):306-13.
- **Quoted (abstract):** "Excellent intrarater reliability was present with Intraclass
  Correlation Coefficients (ICC- 3,k) for goniometry ≥ 0.94 and digital inclinometry ≥
  0.95."
- **Quoted (Methods, fetched from PMC full text):** "Flexion-AROM was assessed with the
  participant **seated upright in a high back chair** and a cloth gait belt secured
  around their waist (at the level of the umbilicus) and back of the chair to limit trunk
  compensation."
- **Reach:** this is the paper an LLM reaches for when asked for "shoulder flexion
  goniometry reliability," and it is **seated**. Do not use it for a supine claim. I am
  listing it precisely so nobody re-derives it later and adopts it by mistake.

### Recommendation (claim 1)

**REMOVE `kim_2013`.** It does not exist, and its `verification_status: "verified"` is
actively misleading.

**ADOPT Muir 2010 (PMID 21589666) as the primary anchor**, for a claim reworded to
something no wider than:

> "Supine shoulder-flexion goniometry is the more reliable of the common test positions
> (Muir 2010), and positions are not interchangeable, so retest in the same position each
> time (Sabari 1998). Single-rater minimal detectable change is about 11°."

**Flag for the human, outside my remit but visible from here:** if MCD for a single rater
is 11–16°, the programme's `< 160` / `>= 165` / `>= 180` tier gates are separated by less
than measurement error at the first boundary. That is a programming decision, not a
sourcing one, but adopting Muir 2010 honestly means surfacing the number that makes the
gates look tight.

---

## 2. "MLSS validity for threshold prescription" — `rowing-2k-test-prep.json` (`kilding_2012`)

**What the literature says:** `kilding_2012` does not exist. The nearest real Kilding
paper on MLSS is a **negative** result, and the most current authoritative work
**disputes** MLSS's status as the gold-standard threshold rather than affirming it. The
underlying claim survives, but only via a citation the programme *already holds* — Faude
2009 — and it survives in weaker form than "MLSS is valid for threshold prescription."

### Candidates

| rank | citation | design | n | population | verdict |
|---|---|---|---|---|---|
| — | `kilding_2012` as recorded | — | — | — | **NONE-FOUND (does not exist)** |
| 1 | Faude, Kindermann & Meyer 2009 | narrative/systematic review, 25 LT concepts, 32 studies | — | endurance athletes | **DIRECT-SUPPORT — already in this programme** |
| 2 | Jones, Burnley, Black, Poole & Vanhatalo 2019 | invited review / position argument | — | — | **CONTRADICTS the "gold standard" framing** |
| 3 | Hauser, Bartsch, Baumgärtel & Schulz 2013 | test-retest reliability | 32 | young men, cycle ergometry | **PARTIAL (reliability, not validity)** |
| 4 | Kilding & Jones 2005 | validation study | 8 | endurance-trained runners | **CONTRADICTS a shortcut protocol** |

---

#### Disconfirmation of `kilding_2012`

- **Identifier attempted:** "Kilding AE, Winter EM, Fysh M (2012), *Investigation of the
  maximal lactate steady state (MLSS) in trained runners*, Int J Sports Med 33(1):11-16."
- **What I did:** enumerated *Int J Sports Med* vol 33 issue 1 (13 records).
- **Result:** the issue paginates `1-7, 8-12, 13-7, 18-25, 26-30, 31-5, 36-42, 43-7,
  48-52, 53-7, 58-66, 67-75, 76-80`. **There is no article at 11-16** — the range
  straddles the 8-12 / 13-17 boundary. No Kilding paper in the issue. Confirms the sweep.
- I then enumerated **every** PubMed-indexed Kilding AE paper mentioning lactate (22
  records). The only MLSS paper is Kilding & Jones **2005**, in *MSSE*, not IJSM — see
  candidate 4. Kilding does have one real IJSM paper, 33(**5**):359-63, hyperoxic
  interval training in cyclists — a different volume position, different topic. The
  fabricated record looks like a collision of a real author, a real journal and a real
  volume with an invented title, year and page range.

#### Candidate 1 — Faude O, Kindermann W, Meyer T (2009)

- **Identifier:** PMID **19453206**; DOI 10.2165/00007256-200939060-00003. *Sports Med*
  39(6):469-90.
- **Quoted:** "Within this review, LTs are considered valid performance indicators when
  there are strong linear correlations with (simulated) endurance performance. In
  addition, **a close relationship between LT and MLSS indicates validity regarding the
  prescription of training intensities.** … Thirty-two studies evaluated the relationship
  of LTs with performance in (partly simulated) endurance events. **The overwhelming
  majority of those studies reported strong linear correlations, particularly for running
  events** … However, from a practical and statistical point of view **it would be of
  interest to know the variability of individual differences between the respective
  threshold and the MLSS, which is rarely reported.**"
- **Reach:** endurance athletes generally; running-weighted; not rowing. This is the
  single best available warrant for "MLSS is a defensible basis for prescribing
  threshold work," and it comes with its own limitation stated in the abstract.
- **Would license:** "Lactate thresholds correlate strongly with endurance performance
  and MLSS is a defensible anchor for prescribing training intensity; the size of the
  individual gap between any estimated threshold and true MLSS is rarely reported."
- **This citation is already at `rowing-2k-test-prep.json` line ~844.** `kilding_2012` is
  therefore not load-bearing — deleting it costs the programme nothing.

#### Candidate 2 — Jones AM, Burnley M, Black MI, Poole DC, Vanhatalo A (2019)

- **Identifier:** PMID **31124324**; PMCID PMC6533178; DOI 10.14814/phy2.14098. *Physiol
  Rep* 7(10):e14098.
- **Quoted:** "This has led to the view that CP overestimates the 'actual' maximal
  metabolic steady state and that MLSS should be considered the 'gold standard' … **In
  this article we will present evidence consistent with the contrary conclusion: i.e.,
  that (1) as presently defined, MLSS naturally underestimates the actual maximal
  metabolic steady state**; and (2) CP alone represents the boundary between discrete
  exercise intensity domains … **CP … should be considered the gold standard when the
  goal is to determine the maximal metabolic steady state.**"
- **Reach:** conceptual/physiological, all endurance modalities. Not a study of rowers.
- **Why it is here:** the programme's phrasing, "MLSS **validity** for threshold
  prescription," reads as settled. It is not. The most current authoritative statement in
  this literature argues MLSS is the *wrong* gold standard. Adopting Faude 2009 without
  acknowledging this would be citing 2009 as though 2019 had not happened — the
  supersession check this role exists to run.
- **Would license:** "Which threshold construct is the 'true' maximal steady state is
  actively contested; MLSS and critical power are not synonymous."

#### Candidate 3 — Hauser T, Bartsch D, Baumgärtel L, Schulz H (2013)

- **Identifier:** PMID **22972242**; DOI 10.1055/s-0032-1321719. *Int J Sports Med*
  34(3):196-9.
- **Quoted:** "**The coefficient of variability (CV) was calculated for PMLSS, BLCMLSS
  and HRMLSS with 3%, 16.6% and 6.3%, respectively.** The Intra-Class-Coefficient for
  PMLSS … was determined with 0.98 (p≤0.001) … **PMLSS and HRMLSS are characterized by a
  low day-to-day variability.**"
- **Reach:** 32 young men, cycle ergometry, lab MLSS protocol (4× 30-min constant-load
  tests). Very far from a rower doing a 20-minute self-administered test on a Concept2.
  If anything it is a *ceiling* on how good the app's proxy can be.
- **Would license:** "MLSS *power* is a reproducible quantity in the lab (CV ~3%),
  whereas the blood-lactate concentration at MLSS is not (CV ~17%)."
- **Carry this number into claim 4.** A 3% CV under ideal laboratory conditions is the
  floor of detectability. It is why "3-6%" was never a promise the data could carry.

#### Candidate 4 — Kilding AE & Jones AM (2005) — *the real Kilding MLSS paper*

- **Identifier:** PMID **16260974**; DOI 10.1249/01.mss.0000181691.72432.a1. *Med Sci
  Sports Exerc* 37(10):1734-40.
- **Quoted:** "**The MLSSsingle significantly underestimated the MLSStrad** with respect
  to speed (13.4 ± 1.2 vs 16.4 ± 1.6 km·h⁻¹, P = 0.002) … **The MLSStrad speed and
  MLSSsingle speed were poorly correlated (r = 0.29, P = 0.49).** … CONCLUSION: **The
  single-visit method of determining the MLSS substantially underestimates the actual
  MLSS.**"
- **Reach:** 8 endurance-trained runners, treadmill. Small.
- **Why it matters here:** if someone "fixes" `kilding_2012` by swapping in the nearest
  real Kilding MLSS paper — the obvious repair — they will be citing a study that shows a
  *convenience protocol for estimating MLSS fails*. That is close to the opposite of
  "MLSS validity for threshold prescription," and it is uncomfortably close to what this
  app does: estimate a threshold from one short test. **Do not adopt this as a
  replacement.** Adopt it only if the programme wants to state honestly that
  single-session threshold estimates are known to be poor proxies for laboratory MLSS.

### Recommendation (claim 2)

**REMOVE `kilding_2012`.** It does not exist, its `verification_status` is already
`"unverified"`, and its `url` is a PubMed search-term link. Nothing depends on it: Faude
2009 already carries the claim, in the same programme.

**Optionally ADOPT Jones 2019 (PMID 31124324)** alongside Faude, and reword the
`used_for` on the surviving MLSS references to:

> "Lactate thresholds correlate strongly with endurance performance and are a defensible
> basis for prescribing intensity (Faude 2009). Which construct is the true maximal
> steady state — MLSS or critical power — is contested (Jones 2019); this programme
> prescribes off a field proxy for either."

**Do not adopt Kilding & Jones 2005 as the replacement**, despite the name matching.

---

## 3. "Guidance hypothesis; feedback frequency in mobility drill acquisition" — `overhead-mobility.json` (`salmoni_schmidt_walter_1984`)

**What the literature says:** the citation is **real and exact** — every field in
`citations.json` matches PubMed. The problem is not existence, it is **directness and
supersession**. Salmoni 1984 is a review of simple laboratory movement tasks, and a
substantial later literature argues explicitly that principles derived from simple lab
skills **do not generalize** to complex skill learning. Applying a 1984 KR review to
"mobility drill acquisition" is exactly the extrapolation the 2002 review warns against.

### Candidates

| rank | citation | design | n | population | verdict |
|---|---|---|---|---|---|
| 1 | Salmoni, Schmidt & Walter 1984 | narrative review / critical reappraisal | — | lab motor tasks | **EXISTS; INDIRECT for mobility drills** |
| 2 | Wulf & Shea 2002 | review | — | simple vs complex motor skills | **CONTRADICTS the generalization** |
| 3 | Storberget et al. 2017 | systematic review, 6 studies | 304 | lower-extremity MSK rehab + prevention | **PARTIAL, most direct population available** |
| 4 | Winstein, Pohl & Lewthwaite 1994 | experiment, 2×2 | — | healthy adults, lab target task | **DIRECT-SUPPORT for the hypothesis itself** |

---

#### Candidate 1 — Salmoni AW, Schmidt RA, Walter CB (1984) — **verified as existing**

- **Identifier:** PMID **6399752**. *Psychol Bull* 1984 May;95(3):355-86.
- **Record retrieved:** journal, volume, issue, page range and all three author surnames
  match `citations.json` **exactly**. This entry is clean on existence.
- **Quotable finding: none available.** PubMed carries no abstract for this record
  (`efetch` returns title and PMID only), Europe PMC returns `abstractText: None`, and
  the APA PsycNet page did not render retrievable text. **Under the rule that governs
  this role, I will not paraphrase its findings from memory.** I can attest the paper
  exists and is correctly identified; I cannot attest to what it concludes.
- **Reach:** *Psychological Bulletin*, 1984, reviewing knowledge-of-results studies on
  simple laboratory movement tasks. The programme applies it to acquisition of overhead
  mobility drills. That is a large jump in task complexity, and 42 years old.
- **Would license:** nothing I can quote. Adopting it means adopting a paper on the
  strength of its reputation, which is precisely the failure mode this repo has already
  shipped once.

#### Candidate 2 — Wulf G, Shea CH (2002)

- **Identifier:** PMID **12120783**; DOI 10.3758/bf03196276. *Psychon Bull Rev*
  9(2):185-211.
- **Quoted:** "**Although some factors seem to have opposite effects on the learning of
  simple and of complex skills**, other factors appear to be relevant mainly for the
  learning of more complex skills. … **The findings reviewed here call into question the
  generalizability of results from studies using simple laboratory tasks to the learning
  of complex motor skills.**"
- **Reach:** directly about the inference the programme is making. Not about mobility
  drills specifically.
- **Would license:** "Feedback principles established on simple laboratory tasks may
  reverse on complex skills; do not assume reduced-frequency feedback transfers."
- **This is the supersession finding.** Salmoni 1984 has not been retracted or refuted,
  but the *extrapolation* the programme performs with it was challenged in print in 2002
  by one of the field's central figures.

#### Candidate 3 — Storberget M, Grødahl LHJ, Snodgrass S, van Vliet P, Heneghan N (2017)

- **Identifier:** PMID **29018544**; DOI 10.1136/bmjsem-2017-000256. *BMJ Open Sport
  Exerc Med* 3(1):e000256.
- **Quoted:** "Six studies were included, with a total sample of 304 participants. …
  **VAF was found to be effective for improving lower extremity biomechanics and postural
  control with moderate evidence from five studies.** … However, **it cannot be
  unequivocally confirmed that VAF is effective in this population, owing to study
  heterogeneity and a lack of high-quality evidence.**"
- **Reach:** the closest available population — people doing rehabilitation movement
  drills under coaching feedback. But it is **lower** extremity (ankle sprain, ACL
  reconstruction, injury prevention), not shoulder mobility, and it addresses *whether*
  verbal feedback works, not the *frequency* question the guidance hypothesis is about.
- **Would license:** "Verbal augmented feedback helps movement-quality outcomes in
  musculoskeletal rehabilitation, on moderate-quality evidence." It does **not** license
  a feedback-frequency prescription.

#### Candidate 4 — Winstein CJ, Pohl PS, Lewthwaite R (1994)

- **Identifier:** PMID **7886280**; DOI 10.1080/02701367.1994.10607635. *Res Q Exerc
  Sport* 65(4):316-23.
- **Quoted:** "The guidance hypothesis (Schmidt, 1991) predicts that the guiding
  properties of augmented feedback are beneficial for motor learning when used to reduce
  error, but detrimental when relied upon. … **the guidance hypothesis predicts that
  practice with a high relative frequency of augmented feedback would be detrimental for
  learning.** … **The high frequency physical guidance condition resulted in the poorest
  retention, and both high frequency feedback conditions resulted in the least accuracy
  in transfer.**"
- **Reach:** healthy adults, laboratory movements to a target. Same directness problem as
  Salmoni, but it is *quotable*, which Salmoni currently is not, and it states the
  hypothesis in the abstract.
- **Would license:** "Very frequent augmented feedback can impair retention and transfer
  of a practiced movement compared with faded feedback."

### Recommendation (claim 3)

**KEEP `salmoni_schmidt_walter_1984` as a citation — the record is accurate — but
REWRITE `used_for`, and do not treat it as evidence about mobility drills.** Proposed
wording, narrowed to what can actually be defended:

> "The guidance hypothesis — that constant augmented feedback aids performance but can
> impair retention — originates in the laboratory motor-learning literature (Salmoni
> 1984; demonstrated in Winstein 1994). Whether it transfers to mobility-drill practice
> is unestablished, and principles from simple laboratory tasks are known not to
> generalize reliably to complex skills (Wulf & Shea 2002)."

**ADOPT Winstein 1994 (PMID 7886280)** as the quotable companion, since Salmoni's own
abstract is not machine-retrievable anywhere I could reach — meaning the /evidence page
currently displays a claim no reader can check against the source.

**ADOPT Wulf & Shea 2002 (PMID 12120783)** as the honesty caveat, or drop the mobility-
drill application from the `used_for` entirely.

**Do not adopt Storberget 2017** for a frequency claim; it does not address frequency.

---

## 4. THE THRESHOLD MAGNITUDE QUESTION — `rowing-2k-test-prep.json` + `engine-builder-block-2.json`

> Does university-grade literature support ANY defensible magnitude for lactate-threshold
> / MLSS pace or power improvement over an 8-12 week structured block in recreationally
> trained adults?

**What the literature says — lead finding:** **No.** There is no meta-analysis that pools
a pre-post percentage change in threshold pace or power, and the primary trials that
report percentages do so in **well-trained athletes over 6-9 weeks**, with
**within-group standard deviations as large as the group means**. Compounding this, the
day-to-day coefficient of variation of MLSS power **under laboratory conditions is ~3%** —
so the bottom of the withdrawn "3-6%" band sat *inside laboratory measurement noise*, and
a field test on an ergometer is noisier than a lab. The 1997 meta-analysis that comes
closest to the question found the effect depends overwhelmingly on baseline fitness, and
was **not statistically significant in already-conditioned subjects at all.**

**The withdrawals on 2026-09-05 were correct, and the honest position is stronger than
"we lost the citation": the number is not recoverable, because the literature does not
contain it in a form that can be promised to an individual.**

### Candidates

| rank | citation | design | n | population | verdict |
|---|---|---|---|---|---|
| 1 | Londeree 1997 | meta-analysis, 85 groups / 34 studies | — | sedentary + conditioned | **PARTIAL — effect sizes, no %; effect vanishes in the trained** |
| 2 | Silva Oliveira, Boppre & Fonseca 2024 | systematic review + meta-analysis, 17 studies | 437 | athletes and young adults, ≥4 wk | **PARTIAL — SMD only, and null for threshold** |
| 3 | Mølmen et al. 2025 | randomized crossover | 30 | well-trained male cyclists | **PARTIAL — gives a %, and gives the SD that kills it** |
| 4 | Neal et al. 2013 | randomized crossover, 6 wk | 12 | trained male cyclists | **PARTIAL — gives a %, tiny n, wrong duration** |
| 5 | Stöggl & Sperlich 2014 | RCT, 9 wk, 4 arms | 48 | well-trained endurance athletes | **PARTIAL — gives a %, wrong population** |
| 6 | Hauser et al. 2013 | test-retest reliability | 32 | young men, cycling | **CONTRADICTS any promise below ~3%** |
| 7 | Bouchard et al. 1999 (HERITAGE) | family training study, 20 wk | 481 | sedentary adults | **CONTRADICTS group-mean promises to individuals** |
| — | any % figure for **rowing** threshold in **recreationally trained** adults over 8-12 wk | — | — | — | **NONE-FOUND** |

---

#### Candidate 1 — Londeree BR (1997) — the closest thing to a direct answer

- **Identifier:** PMID **9219214**; DOI 10.1097/00005768-199706000-00016. *Med Sci Sports
  Exerc* 29(6):837-43. "Effect of training on lactate/ventilatory thresholds: a
  meta-analysis."
- **Quoted:** "The original analyses included 85 study groups from 34 studies. … The
  results showed that **sedentary subjects (effect size (ES) = 2.32) improved
  significantly over controls (ES = 0.15), while conditioned subjects (ES = 0.63) showed
  nonsignificant gains.** There were no significant differences among training intensities
  within the fitness categories (Sed ES = 1.6 - 3.1; Cond ES = 0.3 - 1.1) although the
  conditioned subjects tended to respond better to high intensity training (ES of 1.1 vs
  0.4)."
- **Reach:** this is the *only* meta-analysis I could locate whose dependent variable is
  the threshold itself. Two hard limits: (a) the dependent variable is **VO2 at
  threshold**, not pace or power — the programme promises *pace*, which is a different
  quantity mediated by economy; (b) it is **1997**, and by Sackett's standard 29 years is
  a long time to lean on a single meta-analysis. I searched for a successor and found
  none: current meta-analyses in this space (TID, HIIT vs MICT) take VO2max or
  time-trial as the outcome, with threshold as a secondary at best.
- **Would license:** "Threshold improves substantially in untrained people and much less
  reliably in already-conditioned people; in conditioned subjects the pooled gain was not
  statistically significant." **Note what that does to the app's audience.** Terav's
  endurance users are, by the programme's own framing, not sedentary — Engine Builder
  Block 2 "assumes Block 1 completed OR an equivalent aerobic base." That places them on
  the side of the split where the meta-analysis found **no significant effect**.

#### Candidate 2 — Silva Oliveira P, Boppre G, Fonseca H (2024)

- **Identifier:** PMID **38717713**; PMCID PMC11329428; DOI 10.1007/s40279-024-02034-z.
  *Sports Med* 54(8):2071-2095.
- **Quoted:** "Seventeen studies met the inclusion criteria (n = 437 subjects). Pooled
  effect estimates suggest POL superiority for improving VO2peak (SMD = 0.24 [95% CI
  0.01, 0.48]) … **The remaining endurance performance surrogates were similarly affected
  by POL and other TIDs: … V/P VT2/LT2 (SMD = 0.04 [95% CI -0.21, 0.29]; z = 0.32
  (p = 0.75); n = 253; I2 = 0%).**"
- **Reach:** the most current meta-analysis touching speed/power at the second lactate
  threshold, across 253 subjects. It reports **standardized mean differences between
  training models**, not pre-post percentages — the quantity the programme needs is not
  in it, and I could not find it in any pooled analysis.
- **Would license:** "How you distribute intensity does not detectably change how much
  threshold pace/power improves." Useful to the programme's *design* rationale, useless
  for a magnitude promise. Worth noting this also weakens the polarized-vs-threshold
  framing in `rowing-2k-test-prep.json` lines ~662-663: POL beat other distributions on
  VO2peak, **not** on threshold.

#### Candidate 3 — Mølmen KS et al. (2025) — the most current primary, and the clearest warning

- **Identifier:** PMID **40101160**; DOI 10.1249/MSS.0000000000003706. *Med Sci Sports
  Exerc* 57(8):1780-1789.
- **Quoted:** "MIT block resulted in significantly greater improvements than REG in
  **PO 4mmol (4.0% (4.4%) vs -1.3% (3.7%), P < 0.01)**, PO V̇O2max (2.5% (4.5%) vs -0.7%
  (3.9%), P < 0.01), and V̇O 2max (2.0% (3.9%) vs 0.0% (3.5%), P = 0.05)."
- **Reach:** 30 well-trained male cyclists (VO2max 70.5), one 7-day interval microcycle
  plus 6 days recovery — **not** an 8-12 week block, not recreational, not rowing.
- **Why it is the key exhibit:** the improvement in power at 4 mmol was **4.0% with a
  standard deviation of 4.4%**. The dispersion exceeds the mean. A substantial fraction
  of these well-trained, well-supervised cyclists got worse. **A range like "3-6%" is not
  a conservative promise — it is roughly one standard deviation wide in a study where the
  distribution straddles zero.**
- **Would license:** "In well-trained cyclists, a concentrated block can move power at 4
  mmol by around 4% on average, with individual responses ranging from clearly negative
  to clearly positive."

#### Candidate 4 — Neal CM et al. (2013)

- **Identifier:** PMID **23264537**; DOI 10.1152/japplphysiol.00652.2012. *J Appl Physiol*
  114(4):461-71.
- **Quoted:** "Improvements were greater following polarized rather than threshold for
  PPO [mean (±SE) change of 8 (±2)% vs. 3 (±1)%, P < 0.05], **LT [9 (±3)% vs. 2 (±4)%,
  P < 0.05]**, and high-intensity exercise capacity [85 (±14)% vs. 37 (±14)%, P < 0.05]."
- **Reach:** **12** male cyclists, **6** weeks, crossover with 4 weeks detraining
  between. Already well-trained. Note the threshold-model arm improved LT by 2 (±4)% —
  i.e. indistinguishable from zero — which is the arm most like a threshold-dominant
  block.
- **Would license:** "In a small crossover of trained cyclists, six weeks of polarized
  training moved lactate threshold ~9%, and six weeks of threshold-dominant training
  moved it ~2%." Ioannidis applies: n=12, single lab, a striking first result.

#### Candidate 5 — Stöggl T, Sperlich B (2014)

- **Identifier:** PMID **24550842**; PMCID PMC3912323; DOI 10.3389/fphys.2014.00033.
  *Front Physiol* 5:33.
- **Quoted:** "Forty eight runners, cyclists, triathletes, and cross-country skiers (peak
  oxygen uptake: 62.6 ± 7.1 mL·min⁻¹·kg⁻¹) were randomly assigned to one of four groups
  performing over 9 weeks. … **Velocity/power at 4 mmol·L⁻¹ increased after POL (+8.1%,
  P < 0.01) and HIIT (+5.6%, P < 0.05).** … With the exception of slight improvements in
  work economy in THR, **both HVT and THR had no further effects on measured variables of
  endurance performance (P > 0.05).**"
- **Reach:** well-trained, mixed-sport, 9 weeks — the closest match on *duration*, the
  furthest on *population*. VO2peak 62.6 is not a recreational figure.
- **Would license:** "In well-trained endurance athletes, nine weeks of polarized or
  high-intensity training moved velocity/power at 4 mmol by roughly 6-8%; threshold-
  dominant and high-volume training did not move it detectably."

#### Candidate 6 — Hauser T et al. (2013) — the measurement floor

- **Identifier:** PMID **22972242** (full quote under claim 2 above).
- **Quoted:** "**The coefficient of variability (CV) was calculated for PMLSS … with
  3%**".
- **Why it is decisive here:** under a 4× 30-minute laboratory constant-load protocol, in
  a controlled lab, MLSS power varies **3% day to day in the same person with no training
  at all.** A programme that promises "3-6%" is promising, at the low end, an amount
  indistinguishable from a rower having a slightly better Tuesday.

#### Candidate 7 — Bouchard C et al. (1999), HERITAGE

- **Identifier:** PMID **10484570**; DOI 10.1152/jappl.1999.87.3.1003. *J Appl Physiol*
  87(3):1003-8.
- **Quoted:** "A total of 481 sedentary adult Caucasians from 98 two-generation families
  was exercise trained for 20 wk … **The mean increase in VO2max reached approximately
  400 ml/min, but there was considerable heterogeneity in responsiveness, with some
  individuals experiencing little or no gain, whereas others gained >1.0 l/min.** … the
  most parsimonious models yielded a **maximal heritability estimate of 47% for the
  VO2max response**."
- **Reach:** VO2max, not threshold; sedentary adults, 20 weeks. **Indirect** — I am
  listing it because the rowing programme already invokes "HERITAGE 10× variance" in
  user-facing copy (line ~1060), and that copy should rest on the retrieved record rather
  than on a remembered number. What HERITAGE actually establishes, in its own abstract,
  is *considerable heterogeneity* and 47% heritability of the **VO2max** response. It
  does not say "10×", and it does not measure threshold. If that phrasing is to survive
  in the app, it needs its own sourcing pass.

#### What I searched for and did not find

- A meta-analysis or systematic review reporting **pre-post percentage change in lactate-
  threshold pace or power** in recreationally trained adults: **NONE-FOUND**. Searched
  PubMed for `(lactate threshold OR MLSS) AND (meta-analysis[pt] OR systematic
  review[pt]) AND training`, `high-intensity interval training AND lactate threshold AND
  meta-analysis`, and `training intensity distribution AND meta-analysis AND endurance
  performance`. Everything returned either takes VO2max/time-trial as its outcome, or
  reports SMDs between training models rather than absolute change.
- Any **rowing-specific** threshold-improvement magnitude over 8-12 weeks: **NONE-FOUND**.
- Any trial in an explicitly **recreationally trained** cohort reporting threshold
  pace/power change over 8-12 weeks: **NONE-FOUND**. Every percentage I could retrieve
  and quote comes from well-trained or elite cohorts.

### Recommendation (claim 4)

**WITHDRAW permanently — do not restore a numeric threshold promise in any form.** This
is the substantive finding, not a gap awaiting a better search:

1. The only meta-analysis on the threshold itself (Londeree 1997) found the gain
   **non-significant in conditioned subjects** — the group Terav's endurance users are in
   by the programmes' own entry criteria.
2. The only current meta-analysis touching speed/power at LT2 (Silva Oliveira 2024) found
   **no difference between training models** on that outcome, and reports no pre-post
   percentage at all.
3. Where percentages exist (Mølmen 2025, Neal 2013, Stöggl 2014) they are **4-9% in
   well-trained athletes over 1-9 weeks**, with an SD in the best-controlled of them
   (4.4%) **larger than the mean (4.0%)**.
4. Laboratory day-to-day CV of MLSS power is **3%** (Hauser 2013). A field ergometer test
   is worse. The lower half of the withdrawn "3-6%" band was never distinguishable from
   noise.

**The honest answer to the question as asked is: it is too population-dependent, and too
individually variable, to promise.** The programmes' current post-withdrawal wording —
"Threshold pace should move; no percentage is promised, because no citation in this
programme measures one" (`engine-builder-block-2.json` line ~464) — is **correct and
better than any number I could source.** I recommend keeping it and, if anything,
strengthening it.

**If the product wants to say something quantitative**, the narrowest defensible statement
I can license from retrieved sources is a statement about *other people*, not a promise:

> "In well-trained endurance athletes, structured blocks of 6-9 weeks have moved
> power/velocity at a fixed blood-lactate reference by roughly 4-8% on average (Stöggl
> 2014; Mølmen 2025) — but individual responses in those studies spanned from negative to
> well above the mean, and the day-to-day measurement variability of threshold power is
> itself about 3% (Hauser 2013). No study we can cite measures this in recreationally
> trained rowers."

Even that is indirect on population and I would rather it were not shipped. **KEEP AS
ENGINEERING CHOICE, LABELLED:** train threshold because Joyner & Coyle establish it as
the trainable variable post-VO2max-plateau; state no magnitude; let the user's own
retest be the only number they see.

---

## 5. `das_2019` — orphaned, unresolvable URL — `citations.json`

**What the literature says:** the record as written does not exist, but a **real, closely
related paper by a real Das exists** and is almost certainly what the record is a
corruption of. The choice is therefore a genuine fix-or-remove, not a removal by default.

### Candidates

| rank | citation | design | n | population | verdict |
|---|---|---|---|---|---|
| — | `das_2019` as recorded | — | — | — | **NONE-FOUND (does not exist)** |
| 1 | Das A, Mandal M, Syamal AK, Majumdar P (2019) | descriptive physiological profiling | 27 | elite male rowers, National camp (India) | **REAL — plausibly the intended work** |

---

#### Disconfirmation of `das_2019` as recorded

- **Identifier attempted:** "Das A, Kumar S, Guha S, Chatterjee S (2019), *Physiological
  demands of rowing sport*, J Phys Ed Sports Manage 6(1):5-11." Its only `url` is
  `https://scholar.google.com/scholar?q=...` — a **search box**, not a record. That URL
  renders on the public /evidence page as though it were a source link.
- **What I did:**
  - Crossref bibliographic query for the exact title + author + year: no match (top hits
    were unrelated 2019 and 2024 papers).
  - The journal is **real**: *Journal of Physical Education and Sports Management*, ISSN
    2373-2156 / 2373-2164, Brooklyn Research and Publishing Institute. I enumerated its
    Crossref-deposited works: **98 total, none by Das, none on rowing.** Its 2019 vol 6
    content is on kinetotherapy, quality PE implementation, sport diplomacy, student-
    athlete injuries and teaching backhand technique.
  - PubMed: no such record.
- **Verdict: the record as written does not exist.** Fabricated or badly garbled — a real
  journal name, a real-looking volume/issue/page, an invented paper.

#### Candidate 1 — Das A, Mandal M, Syamal AK, Majumdar P (2019)

- **Identifier:** PMID **30899347**; PMCID PMC6413856; DOI **10.70252/YJSX4918**. *Int J
  Exerc Sci* 12(2):483-490, 2019. Retrieved from PubMed and confirmed independently in
  Crossref.
- **Quoted:** "The purpose of this study was to **characterize the kinetics of
  cardio-respiratory parameters of elite male rowers during 2000m rowing time trial. 16
  lightweight category (LWC) and 11 open category (OC) elite male rowers** attending
  National camp were included … Time to completion, HR, oxygen uptake (V̇O2), minute
  ventilation (V̇E) and respiratory exchange ratio (RER) were recorded at 500m, 1000m,
  1500m and 2000m intervals. … **This detailed insight of rower's physiological responses
  can help coaches and support staff to determine the physiological working capacity of
  rowers at different levels, predicting performance and provided normative ranges for
  developing a representative physiological profile of elite Indian rowers.**"
- **Reach:** **elite male rowers at a national training camp** — considerably further from
  a recreational Terav user than the phantom "physiological demands of rowing sport"
  title suggested. Descriptive time-trial profiling, n=27, no intervention, no threshold.
- **Would license:** "Cardio-respiratory responses across a 2000 m rowing time trial have
  been profiled in elite male rowers, with normative ranges by weight category." Nothing
  about training response, threshold prescription, or recreational rowers.

### Recommendation (claim 5)

`rowing-2k-test-prep.json` already records that `das_2019` was **replaced** by a stronger
rowing-profile anchor (line ~932). No programme cites it. It survives only as an orphan in
`citations.json` that the /evidence page still renders, with a Google Scholar search box
as its link.

**REMOVE `das_2019` from `citations.json`.** It is unreferenced, unverifiable as written,
and its rendered link is a dead end that damages the credibility of every real citation
next to it.

**Do not "repair" it into Das 2019 (PMID 30899347) unless a programme actually needs
that paper.** The real paper is elite-rowers descriptive profiling, the programme has
already replaced it with a stronger anchor, and silently repointing an id at a different
study is how the `astorino_2013` failure happened in the first place. If the elite-rower
profiling data is wanted, add it as a **new id** with the real DOI and an accurate
`used_for`.

---

## Cross-cutting observations for the human reviewer

These are not sourcing verdicts, but they came out of the sweep and bear on the same
failure mode.

1. **Search-term URLs are the tell.** Three of the five records here (`kim_2013`,
   `kilding_2012`, `das_2019`) carry a `url` that is a **PubMed or Google Scholar search
   query**, not a record link. All three turned out not to exist. A record whose author
   could not produce a permalink is a record whose author could not find the paper. This
   is mechanically checkable: `url` should match a DOI, a PMID record, or a publisher
   landing page — never contain `?term=` or `?q=`.

2. **`verification_status: "verified"` on `kim_2013` is false**, on a work that does not
   exist. Whatever process wrote that field did not verify anything. Consider whether the
   field should exist at all if it cannot be trusted, or whether it should be derivable
   only from a resolvable identifier.

3. **Two of the three phantoms pair a real author with a real journal and an invented
   paper.** Kilding is real and publishes in *Int J Sports Med*; Das is real and published
   on rowing in 2019. This is the signature of confabulation, not typos, and it means
   author-name plausibility is worthless as a check. Only the identifier counts.

4. **The magnitude question (claim 4) is the one to internalize.** The failure was not
   that a citation was wrong. It was that a number was wanted, so a number appeared. The
   correct answer to "how much will threshold improve" is that the literature will not
   say — and the current post-withdrawal copy in both programmes already says so better
   than any replacement citation could.
