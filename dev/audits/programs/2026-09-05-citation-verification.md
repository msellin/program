# Citation verification — eight ids

Auditor: `evidence-verifier`. Date: 2026-09-05.
Scope: `next-app/public/data/citations.json` + the `evidence_base.references[]`
entries that carry the same ids across `next-app/public/data/programs/*.json`.

Retrieval channels used: NCBI E-utilities (`esearch` / `esummary` / `efetch`,
PubMed and PMC), Crossref REST, Europe PMC REST, and the Frontiers article page.
Every verdict below rests on text actually returned by one of those endpoints.
Where a source could not be retrieved, that is said plainly rather than filled in.

---

### kim_2013 — NOT_FOUND

**Cited for:** "Supine flexion goniometer reliability — the retest_metric anchor"
(`overhead-mobility.json`, `evidence_base.references[12]`, carrying
`verification_status: "verified"`)

**Claimed:** Kim SH, Kim HK, Kim MY (2013). "Reliability of shoulder ROM
measurement in supine position." *J Phys Ther Sci* 25(11):1435-1438. No DOI. The
`url` field is not a record — it is a PubMed *search query*:
`https://pubmed.ncbi.nlm.nih.gov/?term=Kim+shoulder+ROM+supine+position+reliability+2013`

**Found:** Nothing matching. Searches run, all against
`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&...`:

1. `"J Phys Ther Sci"[Jour] AND 2013[pdat] AND shoulder AND supine AND reliability` → **Count 0**
2. `Kim[Author] AND shoulder AND supine AND (reliability OR reliable) AND 2013[pdat]` → **Count 0**
3. The repo's own search string, `Kim shoulder ROM supine position reliability 2013` → **Count 0**
4. `shoulder range of motion supine reliability goniometer` → 11 hits, none by Kim, none in J Phys Ther Sci, none 2013 (oldest 1996, newest 2025).
5. `shoulder flexion supine goniometric reliability` → 4 hits: PMIDs 41346842, 30631776, 21589666, 9630143. None match.
6. Crossref: `query.bibliographic=Kim reliability shoulder range of motion supine position` → nearest hits are Lunden 2010 (JOSPT, *sidelying*), Lim/Kim/Lee 2015 (J Phys Ther Sci 27:3119-3122, *horizontal adduction, smartphone*), Furness 2015 (prone vs supine). None is the cited work.

I then enumerated the entire issue. `"J Phys Ther Sci"[TA] AND 2013[dp] AND
25[vi] AND 11[ip]` returns **35 records**, and the claimed page range does not
exist in it:

**Quoted (esummary, PMIDs 24396188-24396222):**
> `1433-5 | Effect of muscle vibration on postural balance of Parkinson's diseases patients in bipedal quiet standing. | Han J`
> `1437-43 | Change in the Mechanical Energy of the Body Center of Mass in Hemiplegic Gait after Continuous Use of a Plantar Flexion Resistive Ankle-foot Orthosis. | Haruna H`

Pages 1435-1438 straddle the gap between two unrelated articles. No article in
that issue occupies them, and no article in that issue concerns shoulder ROM.

**Verdict:** `NOT_FOUND` — the work could not be retrieved by author, title,
journal, year, or page range, and the claimed page range is demonstrably not
occupied by any article in that issue.

**Consequence:** Renders publicly on `/evidence`
(`next-app/src/app/evidence/page.tsx:40` fetches `/data/citations.json` and maps
every entry to a list row) with a **CITED** pill, no link, as one of the
"{citations.length} cited studies — the full bibliography behind every program,
proposal, and progression rule in the app". Inside the programme it is the sole
support for `overhead-mobility`'s retest metric — the measurement whose deltas
populate the `shoulder_flexion_deg_gain` figures rendered to users in the tier
picker (`app/programs/[slug]/intake/IntakeClient.tsx:678`,
`ProgramPreviewClient.tsx:524`: "+10-25" for Foundation). Separately, its
`verification_status: "verified"` is both false and inert: `grep -rn
"verification_status" next-app/src` returns nothing, the key is absent from
`evidenceBaseSchema` (`lib/schemas.ts:520-556`), and Zod therefore strips it.
Classification: **data-defect**.

---

### kinoshita_2022 — OVERSTATED

**Cited for:** "The 4-position progression ladder (90° incline → 135° → elbow /
straddle-L → full wall handstand). Validated by EMG activity of shoulder / core
musculature. Underpins block_skill_A_kinoshita and the Tier A entry. Flagged for
founder review: DOI missing." (`handstand-walk.json`,
`evidence_base.references[0]`, `verification_status: "unverified"`)

**Claimed:** Kinoshita T, et al. (2022). "Progressive four-position handstand EMG
activity." *Isokinetics and Exercise Science* 30:127-133. No DOI, no URL.

**Found:** The work exists, with a DOI the repo does not carry.
`https://api.crossref.org/works/10.3233/ies-210169` →
"Stepwise increase of upper limb muscle activity induced by progressive 4
positions of a handstand training", Kinoshita, Hoshino, Yokota, Hashimoto,
Nishizawa, Kida; *Isokinetics and Exercise Science* 30:127-133, issued 2022-05.
DOI **10.3233/IES-210169**. (The publisher page at journals.sagepub.com returns
403; Crossref carries the deposited structured abstract in full.)

**Quoted (Crossref abstract, verbatim):**
> "METHODS: This study utilized four different positions for progressive handstand training; namely, the 90, 135, elbow stand, and handstand positions. The activities of eight upper limb muscles (upper, middle, and lower trapezius; serratus anterior; anterior and middle deltoid; infraspinatus; and latissimus dorsi were measured by surface electromyography (EMG) for each position."
>
> "RESULTS: Muscle activity around the shoulder increased gradually throughout the progression of the four handstand training positions. Furthermore, the muscles required for scapular stabilization, such as the upper and middle trapezius and serratus anterior muscles, were activated at levels similar to those for a handstand without performing this movement."
>
> "CONCLUSIONS: A progressive handstand training program of four different positions resulted in gradual and well-balanced increases in muscle activity."

**Verdict:** `OVERSTATED` — the ladder and its graded shoulder EMG are exactly
this paper, but three things in the `used_for` are not: (1) **no core
musculature was measured** — all eight electrodes were on shoulder-girdle and
upper-limb muscles; (2) the third rung is **"elbow stand"**, not "elbow /
straddle-L" — straddle-L appears nowhere in the paper; (3) "validated" implies
training efficacy, and this is an acute cross-sectional EMG comparison with no
training arm, no follow-up, and no outcome measure. The paper establishes that
the four positions produce stepwise EMG loading. It does not establish that
training through them produces a handstand.

**Reach:** the abstract states the rationale as "preferred for young beginners
and/or recovering gymnasts". Participant count is not in the deposited abstract
and the full text was not reachable, so the sample size behind the ladder is
unknown to me.

**Consequence:** `block_skill_A_kinoshita` in `handstand-walk.json` — a real
prescribed block (`hs_incline_90_hold` 3×20s, `hs_hollow_body_hold` 3×30s,
`hs_incline_135_hold` 3×20s from week 2 gated on `wrist_symptom_score < 3`,
`capability_slot: handstand_hold_static`). It is one of three blocks in
`phase_1_foundation_prep` ("Weeks 1-2 — Wrist prep + Kinoshita position ladder"),
which is the `starting_phase_id` for `tier_a_foundation` — i.e. every
no-handstand-yet user starts here. The tier's `typical_outcome`, rendered to
users at intake (`IntakeClient.tsx:678`), promises "By week 8: stable Kinoshita
position 3 hold…". Note that `hs_hollow_body_hold` sits inside a block whose note
attributes it to Kinoshita; the paper measured no trunk musculature.
Classification: **data-defect** for the DOI, the truncated author list, the
"core" claim and the "straddle-L" rung; **needs-credentialed-human** for whether
an acute EMG gradient is a sufficient basis for an eight-week entry phase.

---

### baker_2025_review — SUPPORTS

**Cited for:** "Current best synthesis of handstand biomechanics — wrist
strategy, elite-novice CoP differences, thin evidence base for prerequisite
thresholds. Anchor citation for the whole evidence_base."
(`handstand-walk.json`, `evidence_base.references[4]`, `verification_status:
"verified"`)

**Claimed:** MacDonald C, Baker JS, Gu Y, Ugbolue UC (2025). "A systematic review
of the biomechanics of the handstand." *Frontiers in Sports and Active Living*
(PMC12745452), 21 studies 1988-2025.
URL `https://www.ncbi.nlm.nih.gov/pmc/articles/PMC12745452/`.

**Found:** `https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=PMCID:PMC12745452&resultType=core`
→ 1 hit, PMID 41473027, DOI 10.3389/fspor.2025.1694648, *Front Sports Act Living*
7:1694648, 2025. Authors per esummary: **MacDonald M**, Baker JS, Gu Y,
Ugbolue UC. Title: **"Biomechanical analyses of the handstand: a systematic
review."**

**Quoted (Europe PMC abstract, verbatim):**
> "Initially, 491 publications were identified. Of these, 21 studies were included in this systematic review, each of which conducted a biomechanical analysis of the handstand."
>
> "The findings of this study indicate that gymnasts minimize problems related to disturbed balance during the handstand using a 'wrist strategy' to secure a fixed-body configuration. If the 'wrist strategy' fails, then the wrists, shoulders, hips, and elbows are utilized, which can be interpreted as a mixed control strategy."
>
> "Gymnasts with greater strength possess better balance control. Other factors that also influence handstand performance are participation level and age of the performers."
>
> "42% of the publications analyzed the center of pressure of the handstand…"

**Verdict:** `SUPPORTS` — wrist strategy is stated verbatim; the 21-study count
is exact; CoP analysis and a participation-level effect are both present. Two
record defects, neither affecting the claim: the **title is wrong** (the repo
paraphrases it) and the **first author's initial is wrong** (MacDonald **M**, not
C). The DOI (10.3389/fspor.2025.1694648) is absent from both the citations.json
entry and the programme reference. "Thin evidence base for prerequisite
thresholds" is a fair reading of a 21-study, mostly-descriptive corpus but is not
a sentence the abstract contains.

**Consequence:** the self-declared "anchor citation for the whole evidence_base"
of `handstand-walk`, the newest catalog programme. Renders on `/evidence` with a
CITED pill and a working PMC link. Classification: **data-defect** (title,
author initial, missing DOI).

---

### sands_2000 — OVERSTATED

**Cited for:** four programmes, four near-identical strings —
- `first-strict-pullup.json` refs[18]: "Skill-readiness assessment and prerequisite gating as an injury-mitigation heuristic. Supports the Tier A → B → C → D gating."
- `muscle-up.json` refs[17]: "Skill-readiness assessment and prerequisite gating as injury-mitigation heuristic. Anchors the strict-pull-up + ring-dip prerequisite gate."
- `handstand-walk.json` refs[30]: "Skill-readiness assessment as injury mitigation. Cited in prerequisite gating on advanced drills."
- `overhead-mobility.json` refs[17]: "Skill-readiness assessment framework — informs prerequisite gating"

**Claimed:** Sands WA (2000). "Injury prevention in women's gymnastics."
*Sports Medicine* 30:359-373. No DOI, no URL in citations.json.

**Found:** PMID 11103849, *Sports Med.* 2000 Nov;30(5):359-73, DOI
10.2165/00007256-200030050-00004. Author, year, journal, volume and pages all
correct.

**Quoted (PubMed efetch, the abstract in full):**
> "The most serious problem faced by contemporary gymnasts is injury. Given that prevention is superior to treatment, can the gymnastics community and the scientific and medical community do a better job at injury prevention? Most research in gymnastics has been descriptive in nature. Injury prevention ultimately requires that one can predict the outcome of certain activities and their injurious nature. Making such predictions requires a knowledge of the scientific and medical aspects of injury, but more than that, one must have an intimate knowledge of the sport. Injury prevention efforts must be firmly grounded in science and medicine while making pragmatic linkages to gymnastics as it exists and is practiced. This article attempts to bridge the gap between the scientific and medical community and what actually happens in gymnastics."

**Verdict:** `OVERSTATED` — the paper is real, correctly identified, and is about
injury prevention in gymnastics. But it is a narrative bridging article whose own
abstract says "most research in gymnastics has been descriptive in nature", and
it reports **no finding at all** — no effect size, no comparison, no gating
protocol. It cannot "anchor" a prerequisite gate. The full text is paywalled
(Adis/Springer, no PMC deposit); I could retrieve nothing beyond the abstract, so
if a readiness-screening framework appears in the body I have not seen it and
neither, on this record, has anyone who cited it here.

**Reach:** the population is **women's artistic gymnasts**, largely
child/adolescent elite athletes, in 2000. It is applied here to adult recreational
users chasing a first strict pull-up, a muscle-up, and overhead squat mobility.
That gap is not addressed in any of the four `used_for` strings.

**Consequence:** the named justification for the tier ladders users are sorted
into at intake in four of the shipping programmes — the `condition` expressions
on `plan_tiers[]` that decide starting phase, sessions per week and starting
capability levels. In `muscle-up` it is the stated anchor for the strict-pull-up
+ ring-dip prerequisite gate, i.e. a gate that withholds a movement. Renders on
`/evidence` with a CITED pill and no link. Classification:
**needs-credentialed-human** — the citation record is accurate; whether a
narrative gymnastics review supports prerequisite gating for adult non-gymnasts
is a judgement, and it is currently being made by the `used_for` string.

---

### astorino_2013 — MISATTRIBUTED

**Cited for:** two programmes, two different claims —
- `rowing-2k-test-prep.json` refs[9]: "Threshold-pace shift of 3-6% in 4-8 wk measured in trained cyclists — extrapolated to rowing as an engineering read, not directly studied. See engineering_choices_flagged."
- `engine-builder-block-2.json` refs[4]: "HIIT dose-response for VO2max. Supports the block's expected 5-10% VO2max additional gain range."

**Claimed:** Astorino TA, Allen RP, Roberson DW, Jurancich M (**2013**). "Effect
of high-intensity interval training on cardiovascular function, VO2max, and
muscular force." *JSCR* **27(1)**:138-145. No DOI, no URL.

**Found:** PMID 22201691 — *J Strength Cond Res.* **2012 Jan;26(1):138-45**, DOI
10.1519/JSC.0b013e318218dd77. Correct authors and title; **wrong year and wrong
volume**. The claimed slot is occupied by a different paper: enumerating JSCR
27(1) 2013 via esummary returns `137-45 | Physiological and physical
characteristics of elite dragon boat paddlers. | Ho SR`.

**Quoted (PubMed efetch, verbatim):**
> "Active, young (age and body fat = 25.3 ± 4.5 years and 14.3 ± 6.4%) men and women (N = 20) of a similar age, physical activity, and maximal oxygen uptake (VO2max) completed 6 sessions of HIIT consisting of repeated Wingate tests over a 2- to 3-week period."
>
> "Changes in resting blood pressure (BP) and heart rate (HR), VO2max, body composition, oxygen (O2) pulse, peak, mean, and minimum power output, fatigue index, and voluntary force production of the knee flexors and extensors were examined pretraining and posttraining."
>
> "Results showed significant (p < 0.05) improvements in VO2max, O2 pulse, and Wingate-derived power output with HIIT."
>
> "Data show that HIIT significantly enhanced VO2max and O2 pulse and power output in active men and women."

**Verdict:** `MISATTRIBUTED` — on the rowing claim, on four counts at once. The
study (a) **measured no threshold** — the listed outcome variables are BP, HR,
VO2max, body composition, O2 pulse, Wingate power, fatigue index and knee
flexor/extensor force; lactate threshold, MLSS and threshold pace appear
nowhere; (b) was not in **trained cyclists** but in 20 *active young men and
women*, with a mixed-sex 9-person control group; (c) ran **2-3 weeks**, not
4-8; (d) the intervention was 6 sessions of **repeated Wingate tests**, not
threshold work. No part of "threshold-pace shift of 3-6% in 4-8 wk measured in
trained cyclists" is in this paper. The identifier is separately wrong (2012
26(1), not 2013 27(1)).

For `engine-builder-block-2`'s narrower use — "HIIT dose-response for VO2max" —
the paper does report a significant VO2max improvement, so that citation is
directionally live; but it supplies no dose-response curve and no percentage, and
the specific "5-10% additional gain" is not a number this abstract contains.

**Consequence:** this is the load-bearing one. In `rowing-2k-test-prep.json` the
3-6% figure appears in four places, two of which reach the user's eyes:

- `plan_tiers[foundation].typical_outcome`: **"By week 6: 2K time down 15-30 seconds. Threshold pace shifted 3-6%. Submax HR down 5-10 bpm at threshold."** This string renders directly in the intake tier picker (`app/programs/[slug]/intake/IntakeClient.tsx:678-679`) and in the public programme preview (`app/programs/[slug]/ProgramPreviewClient.tsx:524-525`), with `outcome_confidence: "realistic"`.
- `phases[phase_2_threshold_build].goal`: "Push threshold pace up 3-6%."
- `progression_rules[threshold_dominant_middle].detail`: "Threshold shifts of 3-6% over 4-8 weeks were measured by Astorino 2013 in trained cyclists".
- `evidence_base.session_rationale.why_threshold`: "Astorino 2013 documented ~3-6% threshold-pace shift in 4-8 wk in trained cyclists".

The programme's own `engineering_choices_flagged` already flags the
rowing extrapolation: *"The 3-6% threshold shift is documented in cycling /
running populations. Applied to rowing here as engineering inference."* That flag
guards the wrong seam. The problem is not that a cycling number was carried to
rowing — it is that **no threshold number exists in the cited paper at all**, and
the population it flags as "cycling / running" is in fact untrained-to-active
mixed-sex undergraduates doing Wingates. Classification: **data-defect** —
identifier and claim both, and the user-facing promise is the direct downstream.

---

### eddens_2018 — SUPPORTS

**Cited for:** four programmes, all the same claim —
- `concurrent-strength-maintenance.json` refs[12]: "Lift-first rule: +6.91% lower-body dynamic strength gain (p=0.006)"
- `engine-builder-block-2.json` refs[28]: "+6.91% lower-body strength gain when lifting precedes endurance. Anchors 'lift first if forced' rule."
- `engine-builder.json` refs[30]: "Resistance-before-endurance produced +6.91% lower-body strength gain vs endurance-first (p=0.006). Cited in concurrent_strength_prescription's same-day rule."
- `rowing-2k-test-prep.json` refs[7]: "Lift-first same-day rule if athlete pairs strength + row"

**Claimed:** Eddens L, van Someren K, Howatson G (2018). "The role of
intra-session exercise sequence in the interference effect: a systematic review
with meta-analysis." *Sports Medicine* 48:177-188. URL
`https://pmc.ncbi.nlm.nih.gov/articles/PMC5752732/`.

**Found:** PMID 28917030, *Sports Med.* 2018 Jan;48(1):177-188, DOI
10.1007/s40279-017-0784-1, PMCID PMC5752732. Authors, title, journal, volume,
pages and PMCID all correct.

**Quoted (PubMed efetch, verbatim):**
> "Analysis of pooled data indicated that resistance-endurance exercise sequence had a positive effect for lower-body dynamic strength, in comparison to the alternate sequence (weighted mean difference, 6.91% change; 95% confidence interval 1.96, 11.87 change; p = 0.006), with no effect of exercise sequence for lower-body muscle hypertrophy… lower-body static strength… or the remaining outcomes of maximal aerobic capacity and body fat percentage (p > 0.05)."
>
> "Ten studies were identified… across a prolonged (≥5 weeks) concurrent training programme in healthy adults."

**Verdict:** `SUPPORTS` — the effect size, the direction, the outcome domain
(lower-body *dynamic* strength specifically) and the p-value are all reproduced
exactly. This is the cleanest record of the eight. Worth preserving as authored:
the `used_for` strings correctly say *lower-body dynamic* strength rather than
"strength", which is the distinction the paper's own null results turn on. Two
minor notes for whoever maintains the records: `concurrent-strength-maintenance`
and `rowing-2k-test-prep` truncate the subtitle and carry no URL, and the
95% CI (1.96 to 11.87) is nowhere recorded — a 6.91% point estimate whose
interval reaches 1.96% is a weaker rule than the bare number reads.

**Consequence:** the same-day sequencing rule in
`engine-builder.concurrent_strength_prescription` and the "lift first if forced"
rule in `engine-builder-block-2` and `concurrent-strength-maintenance`.
Classification: none — no defect.

---

### konopka_2014 — OVERSTATED

**Cited for:** `engine-builder.json` refs[9]: "Effect sizes for oxidative enzyme
changes (β-HAD +397-435%, CS +65-102%, PGC-1α +55-62% in 12 weeks) — cited in
physiological_targets and block_z1_steady rationale. Also: no age blunting of
relative response. Population caveat: cohort was older adults over 12 weeks;
healthy strength-trained users on an 8-week block should not treat the top of
these ranges as their ceiling." Also `engine-builder-block-2.json` refs[11]:
"12-week enzyme-activity data anchors the additional Block 2 gains on top of
Block 1."

**Claimed:** Konopka AR, Suer MK, Wolff CA, Harber MP (2014). "Markers of human
skeletal muscle mitochondrial biogenesis and quality control: effects of age and
aerobic exercise training." *Journal of Gerontology A* 69(4):371-378. URL
`https://pmc.ncbi.nlm.nih.gov/articles/PMC3968823/`.

**Found:** PMID 23873965, *J Gerontol A Biol Sci Med Sci.* 2014
Apr;69(4):371-8, DOI 10.1093/gerona/glt107, PMCID PMC3968823. Authors, title,
journal, volume, pages, PMCID all correct. The article is **not open access** —
Europe PMC returns `isOpenAccess: N`, "Subscription required"; PMC efetch
returns a 7 kB metadata stub with no body; `fullTextXML` returns empty; the
Europe PMC PDF renderer returns 403/500. Full text was not reachable by any
channel available to me.

**Quoted (PubMed efetch, the abstract in full — the only retrievable text):**
> "The purpose of this study was to examine proteins regulating mitochondrial biogenesis and dynamics, VO2peak, and skeletal muscle size before and after aerobic exercise training in young men (20 ± 1 y) and older men (74 ± 3 y). Exercise-induced skeletal muscle hypertrophy occurred independent of age, whereas the improvement in VO2peak was more pronounced in young men. Aerobic exercise training increased proteins involved with mitochondrial biogenesis, fusion, and fission, independent of age."
>
> "These data indicate normal aging does not influence proteins associated with mitochondrial health or the ability to respond to aerobic exercise training at the mitochondrial and skeletal muscle levels."

**Verdict:** `OVERSTATED` — the paper is real and correctly identified, and the
"no age blunting of relative response" half of the claim is directly supported
("independent of age", twice). But the **three effect sizes are not verifiable
from anything I could retrieve**. The abstract reports *direction only* — it
names no percentage, and it describes **protein content** of biogenesis /
fusion / fission markers, not the enzyme *activities* (β-HAD, CS) the `used_for`
attributes to it. A Europe PMC full-text search for `"beta-HAD" AND
AUTH:"Konopka"` returned **0 hits**. The abstract also does not state the
12-week duration.

Two further cautions, both retrieved rather than assumed. First, the abstract
explicitly contradicts one half of the "no age blunting" framing as applied to
aerobic capacity: *"the improvement in VO2peak was more pronounced in young
men."* Second, the companion paper from the same lab — Konopka AR, Douglass MD,
Kaminsky LA, et al. (2010), *J Gerontol A* 65(11):1201-7, PMID 20566734, 12
weeks of cycle-ergometer training in nine older women — reports the *opposite*
sign on one of the three markers:

> "Mitochondrial protein COX IV was elevated (p < .05) 33 ± 7% after aerobic training, whereas PGC-1α protein content was 20 ± 5% lower (p < .05)."

That is a −20% PGC-1α protein change in a sibling study, against a cited
+55-62%. I make no claim about what the 2014 paper's own tables say; I am
recording that the cited magnitudes have no retrievable source and that the
nearest retrievable relative disagrees in direction.

**Reach:** the cohort is **young men (20 ± 1 y) and older men (74 ± 3 y)** — the
`used_for`'s own population caveat says "older adults", which understates the
mismatch in the other direction (a young-male arm exists) while correctly
flagging that an 8-week block is not 12 weeks.

**Consequence:** `engine-builder.evidence_base.physiological_targets[0]` states
the numbers as fact — "Konopka 2014 measured β-HAD +397-435%, CS +65-102%,
PGC-1α +55-62% in 12 weeks in older adults — no age blunting of relative
response" — and the same figures are named as the anchor for the
`block_z1_steady` rationale and, in `engine-builder-block-2`, for "the
additional Block 2 gains on top of Block 1". `physiological_targets` is
`z.unknown()` in `evidenceBaseSchema` (`lib/schemas.ts:519`) and is not rendered
by any component, so the numbers do not currently reach a screen; they reach the
*authoring* of the block, and they are what a reader of the repo would take as
established. Classification: **data-defect** (unsourced magnitudes attributed to
a named paper).

---

### brandt_2025 — SUPPORTS

**Cited for:** `concurrent-strength-maintenance.json` refs[29]: "VO2max =
strongest HYROX predictor; grip / muscle mass NOT reliable". Also carried in
`engine-builder.json`.

**Claimed:** citations.json — Brandt **N**, Ebel **K**, Lebahn **K**, Schmidt A
(2025), "Acute physiological responses and performance determinants in Hyrox© — a
new running-focused high intensity functional fitness trend", *Frontiers in
Physiology*, DOI 10.3389/fphys.2025.1519240, with `review_note: "Title/source
corrected 2026-08-18."` The programme reference disagrees with its own library
entry: **Brandt K, Krieger K, Kerner J, et al.**, "**First physiological
profiling of HYROX athletes**", Front Physiol 16:1519240.

**Found:** DOI resolves. Europe PMC core record for
`DOI:"10.3389/fphys.2025.1519240"` → PMID 40230601, *Frontiers in physiology* 16,
page 1519240, 2025. `authorString`: **Brandt T, Ebel C, Lebahn C, Schmidt A.**
Title: "Acute physiological responses and performance determinants in Hyrox© - a
new running-focused high intensity functional fitness trend."

**Quoted (Europe PMC abstract, verbatim):**
> "Eleven recreational Hyrox© athletes [27% women, Hyrox© experience median (interquartile range): 18 (19) months] participated. In a pre-test, height, body composition, hand grip strength (HGS), maximum oxygen consumption (VO2max), and volume of resistance and endurance training were assessed."
>
> "Faster Hyrox© completion correlated significantly with higher VO2max (p = 0.01), greater endurance training volume (p = 0.04), and lower body fat percentage (p = 0.03)."

And from the Frontiers full text
(`https://www.frontiersin.org/journals/physiology/articles/10.3389/fphys.2025.1519240/full`),
the correlation table for full-Hyrox completion time:

> "VO2max −0.71 **0.01**"
> "Hand grip strength 0.09 0.79"
> "Muscle mass percentage −0.03 0.94"

**Verdict:** `SUPPORTS` — VO2max is the strongest reported correlate
(rho −0.71), and hand grip strength (rho 0.09, p = 0.79) and muscle mass
percentage (rho −0.03, p = 0.94) are both flatly null. The `used_for` is an
accurate one-line summary of the table.

**Reach:** **n = 11 recreational athletes**, 27% women, Spearman rank
correlations from a single simulated competition. There is no regression model,
so "strongest predictor" is a strongest *correlation*, not a predictor ranking,
and an n of 11 makes every rho here wide. The claim is true of this paper;
whoever leans on it should lean lightly.

**Record defects (three, none of which change the verdict):** citations.json has
the wrong initials for three of four authors (Brandt **T**, Ebel **C**, Lebahn
**C**). The `concurrent-strength-maintenance` reference has **entirely wrong
authors** ("Brandt K, Krieger K, Kerner J, et al." — Krieger and Kerner are not
on this paper) **and a wrong title** ("First physiological profiling of HYROX
athletes"). The two records for the same id disagree with each other and both
disagree with the source. The `review_note` says the title was corrected on
2026-08-18; that correction reached citations.json and not the programme.

**Consequence:** renders on `/evidence` with a CITED pill and a working DOI link,
under the citations.json author string — so users see a fabricated-initials
byline. Classification: **data-defect** (author and title drift, and a
library/programme divergence the suite does not currently catch).

---

## Summary

| id | verdict | identifier correct? | class |
|---|---|---|---|
| `kim_2013` | **NOT_FOUND** | no identifier; page range unoccupied | data-defect |
| `kinoshita_2022` | **OVERSTATED** | exists; DOI 10.3233/IES-210169 missing from record | data-defect + needs-credentialed-human |
| `baker_2025_review` | **SUPPORTS** | PMC id correct; title + first-author initial wrong; DOI missing | data-defect (cosmetic) |
| `sands_2000` | **OVERSTATED** | correct | needs-credentialed-human |
| `astorino_2013` | **MISATTRIBUTED** | wrong year and volume (2012 26(1), not 2013 27(1)) | data-defect |
| `eddens_2018` | **SUPPORTS** | correct | — |
| `konopka_2014` | **OVERSTATED** | correct | data-defect |
| `brandt_2025` | **SUPPORTS** | DOI correct; authors wrong in both records, title wrong in one | data-defect |

Three of eight are clean on the claim (`baker_2025_review`, `eddens_2018`,
`brandt_2025`); one of those three is clean on the record too (`eddens_2018`).

---

## Claims now unsupported

Every programme assertion still standing on a citation that is not `SUPPORTS`.
None of these is a recommendation to change a prescription — that is not this
agent's surface. They are the sentences that currently have nothing behind them.

**1. "Threshold pace shifted 3-6%" — `rowing-2k-test-prep`, user-facing.**
Rendered verbatim in the intake tier picker and the public programme preview as
part of the Foundation tier's `typical_outcome`, marked
`outcome_confidence: "realistic"`. Its sole citation measured no threshold, in no
cyclists, over 2-3 weeks of Wingate tests. The programme's
`engineering_choices_flagged` entry defends the cycling→rowing transfer, which is
not where the failure is. Also affected by the same citation:
`phases[phase_2_threshold_build].goal` ("Push threshold pace up 3-6%"),
`progression_rules[threshold_dominant_middle].detail`, and
`evidence_base.session_rationale.why_threshold`. The Progression tier's
"Threshold power +5-8%" has no citation attached at all.

**2. The retest metric of the entire `overhead-mobility` programme.**
`kim_2013` is the named anchor for supine-flexion goniometer reliability and
does not appear to exist. The `shoulder_flexion_deg_gain` targets ("+10-25" for
Foundation, rendered at intake) are deltas on a measurement whose reliability
this repo asserts and cannot source. Compounding it, the reference carries
`verification_status: "verified"` — a claim that is false and, because Zod
strips the key, invisible.

**3. "Validated by EMG activity of shoulder / core musculature" —
`handstand-walk`, `block_skill_A_kinoshita`.** No core musculature was measured.
"Straddle-L" is not one of the paper's four positions. And an acute EMG
comparison cannot validate a training progression — the paper has no training
arm. The block is the entry point of `phase_1_foundation_prep`, the
`starting_phase_id` for every Tier A user, and the tier's user-facing
`typical_outcome` promises a "stable Kinoshita position 3 hold" by week 8.

**4. Prerequisite gating as injury mitigation — four programmes.**
`first-strict-pullup` (Tier A→B→C→D), `muscle-up` (strict-pull-up + ring-dip
gate), `handstand-walk` (advanced-drill gating), `overhead-mobility`. `sands_2000`
is a real narrative review of injury prevention in women's artistic gymnastics
that reports no finding and offers no gating protocol in its abstract; the full
text is paywalled. The population gap — elite young female gymnasts to adult
recreational users — is unaddressed in all four `used_for` strings.

**5. The oxidative-enzyme effect sizes in `engine-builder`.**
β-HAD +397-435%, CS +65-102%, PGC-1α +55-62% are stated as measured fact in
`physiological_targets` and named as the anchor for `block_z1_steady` and for
Block 2's incremental gains. No retrievable text contains them. The abstract
reports direction only, on protein content rather than enzyme activity; a
Europe PMC full-text search for β-HAD + Konopka returns zero; and the same lab's
2010 companion reports PGC-1α protein **20 ± 5% lower** after 12 weeks. The
paper itself is behind a paywall, so this is not a claim of fabrication — it is
a claim that nothing in the public record substantiates the numbers.

**6. Byline integrity on `/evidence`.** The public bibliography currently shows
users invented author initials for `brandt_2025` (Brandt N / Ebel K / Lebahn K
for Brandt T / Ebel C / Lebahn C), a wrong first-author initial and a
paraphrased title for `baker_2025_review`, a wrong year and volume for
`astorino_2013`, a truncated "Kinoshita T, et al." for a six-author paper, and a
full byline for a `kim_2013` that could not be found to exist. Two records for
`brandt_2025` — library and programme — disagree with each other on both authors
and title, which no current test detects.

## Notes for whoever fixes this

- `verification_status` is authored on at least two references
  (`overhead-mobility` → kim_2013 = "verified"; `handstand-walk` → kinoshita_2022
  = "unverified") and is read by nothing: absent from `evidenceBaseSchema`
  (`lib/schemas.ts:520-556`), zero hits from `grep -rn "verification_status"
  next-app/src`, therefore stripped by Zod. Same failure mode CLAUDE.md records
  for `daily_log_schema` and `progression_rules.states[]`. It should either
  become live or join the knowingly-dead list in `data-integrity.test.ts`.
- `data-integrity.test.ts:918-932` catches a `used_for` that *admits* it is
  unverified (`/unconfirmed|unverified|existence not|could not verif/`). The
  handstand-walk kinoshita string says "Flagged for founder review: DOI missing"
  and slips past. Neither that test nor any other compares a programme
  reference's `authors` / `title` / `year` against the citations.json entry with
  the same id — which is why `brandt_2025` ships two contradictory bylines.
- Four of the eight (`kim_2013`, `kinoshita_2022`, `sands_2000`,
  `astorino_2013`) carry neither DOI nor URL in citations.json. Three of those
  four have a retrievable identifier that could simply be added:
  `kinoshita_2022` → 10.3233/IES-210169; `sands_2000` → 10.2165/00007256-200030050-00004
  (PMID 11103849); `astorino_2013` → 10.1519/JSC.0b013e318218dd77 (PMID 22201691,
  and the year/volume need correcting to 2012 / 26(1) with it). The fourth
  is `kim_2013`, which is the whole problem.
- `baker_2025_review` should read: MacDonald M, Baker JS, Gu Y, Ugbolue UC (2025),
  "Biomechanical analyses of the handstand: a systematic review", *Front Sports
  Act Living* 7:1694648, DOI 10.3389/fspor.2025.1694648, PMID 41473027.
- `brandt_2025` should read: Brandt T, Ebel C, Lebahn C, Schmidt A (2025),
  *Front Physiol* 16:1519240, PMID 40230601 — in both places.

No programme data was edited.
