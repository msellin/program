# Citation sweep — batch 5 (17 ids)

Date: 2026-09-05. Auditor: evidence-verifier.
Scope: existence, identifier, attribution, support, status, reach.
Every verdict below rests on text retrieved during this run. Nothing is stated
from memory. Where retrieval failed, the verdict is `NOT_FOUND` and the searches
are listed.

Records read: `next-app/public/data/citations.json`;
`next-app/public/data/programs/*.json` (`evidence_base.references[]`).
Code read for Consequence: `src/app/evidence/page.tsx`,
`src/lib/engine/citations.ts`, `src/lib/engine/proposal-citations.ts`,
`src/lib/schemas.ts`, `src/lib/data-integrity.test.ts`.

## Shared consequence (applies to all 17)

`/evidence` renders **citations.json verbatim** — `authors (year). title — source`
plus a `link` anchor when `url` is set, sorted by author, with a `CITED`/`VERIFIED`
pill (`src/app/evidence/page.tsx:60-118`). All 17 carry no `status`, so all render
`CITED`. A wrong title, venue or URL in citations.json is therefore **shipped to
every user of every programme**, not an internal note.

Programme `used_for` strings are **not rendered anywhere**. `schemas.ts:546`
requires them; no component reads them. They are author-facing rationale plus
review-gate material. Their defects are review-integrity defects, not display bugs.

`src/lib/engine/citations.ts` exposes `getCitationById` / `snapshotCitation`;
`useStore.ts:736,771` snapshots `display_short` + `display_line` into accepted
proposals. Of these 17, only `rhea_2003_meta` is wired to a proposal kind
(`proposal-citations.ts:35-36`). The other 16 reach the user only through
`/evidence` and the bibliography.

`data-integrity.test.ts:1466-1626` compares each programme reference against its
citations.json entry on first surname and title overlap, with a
`KNOWN_REFERENCE_CONFLICTS` allowlist. `ross_2015`, `proteau_1992`,
`reinold_2007` and `petre_2018` are declared there. **The allowlist compares the
two repo records against each other. It never checks either against the world.**
Five of the defects below are invisible to it for that reason.

---

### petre_2018 — MISATTRIBUTED
**Cited for:** "Trained lifters: HIIT vs continuous produced same squat gains"
(concurrent-strength-maintenance)
**Claimed:** programme record — Petré H, Hemmingsson E, Rosdahl H, Psilander N
(2018), "Development of maximal dynamic strength during concurrent resistance and
endurance training in untrained, moderately trained and trained individuals",
J Sports Sci Med 17(2):167-173. citations.json — Petré H, Löfving P, Psilander N
(2018), "The Effect of Two Different Concurrent Training Programs on Strength and
Power Gains in Highly-Trained Individuals", JSSM 17(2):167-173.
**Found:** both papers exist and are different works.
- PMID 29769816 (https://pubmed.ncbi.nlm.nih.gov/29769816/) — *J Sports Sci Med.
  2018 May 14;17(2):167-173.* "The Effect of Two Different Concurrent Training
  Programs on Strength and Power Gains in Highly-Trained Individuals." Petré H,
  Löfving P, Psilander N.
- PMID 33751469 (https://pubmed.ncbi.nlm.nih.gov/33751469/) — *Sports Med. 2021
  May;51(5):991-1010.* "Development of Maximal Dynamic Strength During Concurrent
  Resistance and Endurance Training in Untrained, Moderately Trained, and Trained
  Individuals: A Systematic Review and Meta-analysis." Petré H, Hemmingsson E,
  Rosdahl H, Psilander N.

**Quoted (29769816):** "Sixteen highly-trained ice-hockey and rugby players were
divided into two groups that underwent either CT (n = 8) or HIIT (n = 8) in
parallel with RT… Parallel squat performance improved after both RT + CT and
RT + HIIT (12 ± 8% and 14 ± 10% respectively, p < 0.01), with no difference
between the groups."

**Quoted (33751469):** "The 1RM for leg press and squat exercises was negatively
affected by concurrent training in trained individuals (ES = - 0.35, p < 0.01),
but not in moderately trained ( - 0.20, p = 0.08) or untrained individuals
(ES = 0.03, p = 0.87)…"

**Which one the programme meant:** **the citations.json one — Petré, Löfving &
Psilander 2018, JSSM 17(2):167-173.** The `used_for` string is a one-line summary
of exactly that paper's result (HIIT vs continuous, same squat gain). The
programme's `authors`/`title` fields are the 2021 Sports Med meta-analysis,
which is a **2021** paper in a different journal and cannot occupy
JSSM 17(2):167-173. The programme's bibliographic fields are the defect;
citations.json is correct.

**Verdict:** MISATTRIBUTED — the programme's author list, title and implied
population belong to a different paper (Petré 2021 Sports Med), while the
locator and the `used_for` belong to Petré 2018 JSSM.
**Reach:** n=16 highly-trained ice-hockey and rugby players, 6 weeks, endurance
performed *after* RT. CSM's "Trained lifters" is a fair gloss of "highly-trained",
but the app's CSM users are not necessarily at that level, and the study's
6-week window is shorter than a CSM block. Note also that the *other* Petré paper
— the one whose title the programme pasted in — reports the **opposite** for
trained individuals (ES −0.35 against concurrent). If a reader follows the
programme's title rather than its locator they land on a finding that argues
against the sentence it is attached to.
**Consequence:** `/evidence` currently displays the citations.json (correct)
line, so the user-facing surface is right. The programme record is what a
reviewer reads. `KNOWN_REFERENCE_CONFLICTS.petre_2018` in
`data-integrity.test.ts:1552` holds this open. **Classification: data-defect.**

---

### pilegaard_2000 — MISATTRIBUTED
**Cited for:** "MCT1 upregulation from threshold-and-above work. Anchors why
threshold cruise is Block 2's primary driver." (engine-builder-block-2);
"MCT1 upregulation with endurance training. Cited in physiological_targets and
block_sustained_tempo rationale." (engine-builder)
**Claimed:** Pilegaard H, Domino K, Noland T, et al. (2000), "Effect of
high-intensity exercise training on lactate/H+ transport capacity in human
skeletal muscle", *Am J Physiol Endocrinol Metab* 278(4):E571-E579, url
`https://journals.physiology.org/doi/full/10.1152/ajpendo.2000.278.4.E571`.
**Found:** the title/authors and the locator/URL belong to **two different
papers**.
- The Pilegaard paper is *Am J Physiol.* **1999 Feb;276(2):E255-61**, PMID
  9950784 (https://pubmed.ncbi.nlm.nih.gov/9950784/), doi
  10.1152/ajpendo.1999.276.2.E255. Authors: Pilegaard H, Domino K, Noland T,
  Juel C, Hellsten Y, Halestrap AP, Bangsbo J.
- **278(4):E571-9** is PMID 10751188 (https://pubmed.ncbi.nlm.nih.gov/10751188/)
  — *Am J Physiol Endocrinol Metab. 2000 Apr;278(4):E571-9*, "Endurance training,
  expression, and physiology of LDH, MCT1, and MCT4 in human skeletal muscle",
  **Dubouchaud H, Butterfield GE, Wolfel EE, Bergman BC, Brooks GA.**

**Quoted (9950784):** "The rate of lactate/H+ transport determined in sarcolemmal
giant vesicles was 12% higher (P < 0.05) in the trained than in untrained muscle
(n = 7). The content of MCT1 and MCT4 protein was also higher (76 and 32%,
respectively; n = 4) in trained muscle."

**Quoted (10751188):** "MCT1 amounts significantly increased in MU, SL, and MI
after training (+90%, +60%, and +78%, respectively)… Nine weeks of leg cycle
endurance training [75% peak oxygen consumption (VO(2 peak))]…"

**Verdict:** MISATTRIBUTED — the DOI and URL in the record resolve to
Dubouchaud et al., not Pilegaard et al. The URL is live and points at the wrong
paper, which is the worst case: it looks verified.
**Note on the substance:** the MCT1-upregulation claim survives on **either**
paper — Pilegaard 1999 for high-intensity work (+76% MCT1), Dubouchaud 2000 for
endurance work at 75% VO2peak (+90% MCT1). Block-2's "threshold-and-above" gloss
fits Pilegaard 1999; engine-builder's "with endurance training" fits Dubouchaud
2000. The programmes have, by accident, cited a single hybrid record that each is
reading in the direction it needs.
**Reach:** Pilegaard 1999 is n=7 (transport) / n=4 (protein), one-legged
knee-extensor training — a very small, highly artificial model. Neither paper
measures a training-programme outcome; both are molecular. Nothing here licenses
"threshold cruise is Block 2's primary driver" as a *performance* claim.
**Consequence:** `/evidence` ships the wrong title-to-URL pairing to every user
(`page.tsx:97-110` renders `c.url` as `link`). Not caught by
`data-integrity.test.ts` — programme and citations.json agree with **each other**,
so the cross-record test passes. **Classification: data-defect.**

---

### potdevin_2018 — OVERSTATED
**Cited for:** "n=18 children, 8-week gymnastics: video KP after ~5 reps improved
skill and self-assessment. Used in block_skill_B_freestand_search rationale and
video_review dosing (not every rep)." (handstand-walk); near-identical in
muscle-up.
**Claimed:** Potdevin F, et al. (2018), *Physical Education and Sport Pedagogy*
23(6).
**Found:** Crossref 10.1080/17408989.2018.1485138 and Semantic Scholar record —
Potdevin F, Vors O, Huchez A, Lamour M, Davids K, Schnitzler C, "How can video
feedback be used in physical education to support novice learning in gymnastics?
Effects on motor learning, self-assessment and motivation", *Physical Education
and Sport Pedagogy* **23(6):559-574**, 2018.
**Quoted:** "Two French classes of beginners took part in a typical **five-week**
learning programme in gymnastics. During each of the five, weekly lessons
participants carried out the same warm-up routine and exercises. The experimental
group (10 girls – 8 boys, 12.4 ± 0.5 years) received VFB intermittently when
learning a **front handstand to flat back landing**. **VFB was given after every
five attempts**, combined with self-assessment and verbal instructions from the
teacher." … "Statistical analysis of arm-trunk angle values showed significant
differences only for the VFB group between the fifth lesson and all other
lessons." … "Self-assessment scores improved significantly for the VFB group
between lesson 1 and lesson 2 (p < 0.01, ES = 1.79) and between lesson 4 to
lesson 5 (p < .01, ES = 0.94)."
**Verdict:** OVERSTATED — three of the four elements check out exactly (n=18 in
the VFB arm; children; feedback after every five attempts; skill and
self-assessment both improved). The **duration is wrong: five weeks / five
lessons, not eight weeks.** The title and volume in citations.json are also a
stub ("Video feedback and self-assessment in gymnastics learning", no pages) that
does not match the published title, so a reader cannot look it up from the
`/evidence` line.
**Reach:** 12-year-old PE novices learning a front handstand to flat-back
landing, in a school class with a teacher present. handstand-walk and muscle-up
apply the KP dose to adult self-coached athletes doing freestanding handstand
search and ring work. The "every five reps" number transfers as a *heuristic*,
not as a validated dose for these populations. This is the judgement call.
**Consequence:** `/evidence` shows a non-lookup-able stub title with no volume
or pages and no URL. The dosing rule it anchors (`video_review`, "not every
rep") is programme copy, not engine behaviour — no code branches on it.
**Classification: data-defect (title stub, wrong duration) +
needs-credentialed-human (children→adults reach).**

---

### proteau_1992 — MISATTRIBUTED
**Cited for:** "Learning is specific to the sensory conditions of practice.
Supports the multi-dimensional per-capability approach." (first-strict-pullup,
muscle-up); "Specificity of practice — learning is bound to the sensory context.
Underpins the choice to train wall hold + freestand + walk as separate state
variables." (handstand-walk); "Specificity of practice — race-pace work
rationale. Title/source corrected 2026-08-18 (Path A Q2)." (rowing-2k-test-prep)
**Claimed:** citations.json + rowing-2k — "Specificity of practice: the case of
the goal-directed aiming task", *Journal of Motor Behavior* 24(1):81-104. The
three gymnastics programmes — "A sensorimotor basis for motor learning: evidence
indicating specificity of practice", *Quarterly Journal of Experimental
Psychology* 44A(4):557-575.
**Found:**
- The QJEP paper is real: PMID 1631322
  (https://pubmed.ncbi.nlm.nih.gov/1631322/) — *Q J Exp Psychol A. 1992
  Apr;44(**3**):557-75*, doi 10.1080/14640749208401298, Proteau L, Marteniuk RG,
  Lévesque L.
- **The J Motor Behav paper does not exist.** Crossref, complete listing of
  *Journal of Motor Behavior* volume 24 (1992), ISSN 0022-2895 — 37 items,
  all retrieved. No Proteau item. No article occupies pages 81-104 (the
  neighbouring spans are 67-83 Schmidt et al. and 85-94 Beek & van Santvoord).
  A Crossref bibliographic query for the exact title returns no matching work.

**Quoted (1631322):** "From these and our previous results, and the idea of the
sensorimotor representation underlying learning, we develop the idea that
**learning is specific to the conditions that prevail during skill acquisition**.
This has implications for the ideas of the generalized motor program and schema
theory."

**Which one the programme meant:** **the QJEP paper — Proteau, Marteniuk &
Lévesque 1992, Q J Exp Psychol A 44(3):557-575, PMID 1631322.** It is the only
one that exists, and its own concluding sentence is nearly word-for-word the
`used_for` the three gymnastics programmes attach. The "J Motor Behav 24(1):
81-104" record in citations.json — and copied into rowing-2k — is a
**non-existent reference**, and it was introduced by the 2026-08-18 "correction"
(`review_note` in citations.json, and rowing-2k's own "Title/source corrected
2026-08-18 (Path A Q2)"). The correction moved the record from a real paper to
a fabricated one. Minor: the gymnastics programmes' issue number, 44A(4), should
be 44A(3).

**Verdict:** MISATTRIBUTED — the canonical citations.json record points to a
work that could not be found to exist.
**Reach:** the paper is a laboratory manual-aiming task with and without vision
of the limb. Extending "learning is specific to the sensory conditions of
practice" to *train wall hold, freestand and walk as separate state variables*
and to *race-pace rowing* is a theoretical extrapolation. It is a widely-held
one, but this paper does not test it in either domain.
**Consequence:** `/evidence` prints the fabricated line — "Proteau L, Marteniuk
RG, Lévesque L (1992). Specificity of practice: the case of the goal-directed
aiming task — Journal of Motor Behavior 24(1):81-104" — with a `CITED` pill, to
every user. Four programmes' specificity reasoning traces to it.
`KNOWN_REFERENCE_CONFLICTS.proteau_1992` (`data-integrity.test.ts:1541`) records
the disagreement but, comparing repo to repo, cannot see that one side is not a
real paper. **Classification: data-defect.**

**Searches run for the J Motor Behav record:** PubMed `Proteau L[au] AND
1992[dp]`; PubMed `"J Mot Behav"[jour] AND 1992[dp] AND Proteau` (0 results);
PubMed `Proteau goal-directed aiming specificity practice`; Crossref
`query.bibliographic=Specificity of practice goal-directed aiming task Proteau`;
Crossref full journal listing for ISSN 0022-2895, 1992 (37/37 items enumerated).

---

### reinold_2007 — MISATTRIBUTED
**Cited for:** "Supraspinatus EMG load data — informs the shoulder-pain-stops-
session rule for hang and pull work." (first-strict-pullup); "Supraspinatus EMG
data — informs the shoulder-pain-stops-session rule and the pre-session prep
dose." (muscle-up); "Rotator cuff / deltoid activation patterns in overhead
loading. Cited in shoulder-endurance contraindication and belly-to-wall hold
rationale." (handstand-walk); "Rotator-cuff activation levels across drill
variants; informs light-load rationale in Phase 2" (overhead-mobility).
Load-bearing prose: `overhead-mobility.json:36` "Reinold 2007 — active
rotator-cuff engagement should precede end-range positioning" and
`overhead-mobility.json:471` "Reinold 2007 — rotator-cuff activation precedes
end-range loading."
**Claimed:** three programmes — Reinold MM, Wilk KE, Fleisig GS, et al. (2007),
"Electromyographic analysis of the supraspinatus and deltoid muscles during 3
common rehabilitation exercises", *JOSPT* 37(9):519-527. overhead-mobility and
citations.json — Reinold MM, Escamilla RF, Wilk KE (2007), "Current concepts in
the scientific and clinical rationale behind exercises for glenohumeral and
scapulothoracic musculature", *JOSPT* (overhead-mobility adds 37(11):659-670).
**Found:** both papers are real. **Neither locator is.**
- PMID 18174934 (https://pubmed.ncbi.nlm.nih.gov/18174934/) — *J Athl Train.*
  **2007 Oct-Dec;42(4):464-9**, "Electromyographic analysis of the supraspinatus
  and deltoid muscles during 3 common rehabilitation exercises", Reinold MM,
  Macrina LC, Wilk KE, Fleisig GS, Dun S, Barrentine SW, Ellerbusch MT,
  Andrews JR. **Journal of Athletic Training, not JOSPT.**
- PMID 19194023 (https://pubmed.ncbi.nlm.nih.gov/19194023/) — *J Orthop Sports
  Phys Ther.* **2009 Feb;39(2):105-17**, doi 10.2519/jospt.2009.2835, "Current
  concepts in the scientific and clinical rationale behind exercises for
  glenohumeral and scapulothoracic musculature", Reinold MM, Escamilla RF,
  Wilk KE. **2009, not 2007.**
- PubMed `"J Orthop Sports Phys Ther"[jour] AND 2007[dp] AND 37[vi] AND 519[pg]`
  → 0 results. `…AND 2007[dp] AND 659[pg]` → 0 results. A listing of all Reinold
  PubMed records 2005-2009 contains no JOSPT 2007 volume-37 article.

**Quoted (18174934):** "Twenty-two asymptomatic subjects (15 men, 7 women) with
no history of shoulder injury participated… **No statistical difference existed
among the exercises for the supraspinatus.** … While all 3 exercises produced
similar amounts of supraspinatus activity, the full-can exercise produced
significantly less activity of the deltoid muscles and may be the optimal
position to recruit the supraspinatus muscle for rehabilitation and testing."

**Quoted (19194023):** "The purpose of this paper is to provide the clinician
with a thorough overview of the available literature relevant to develop safe,
effective, and appropriate exercise programs for injury rehabilitation and
prevention of the glenohumeral and scapulothoracic joints. **LEVEL OF EVIDENCE:
Level 5.**"

**Which paper each programme meant:**
- first-strict-pullup, muscle-up, handstand-walk meant the **EMG paper —
  Reinold et al. 2007, *J Athl Train* 42(4):464-469, PMID 18174934.** The title
  they carry is that paper's exact title; only the venue and pages are wrong.
- overhead-mobility meant the **narrative review — Reinold, Escamilla & Wilk,
  *JOSPT* 39(2):105-117, 2009, PMID 19194023.** Its own prose
  (`overhead-mobility.json:891`, "catalogued rotator-cuff EMG activation across a
  wide range of common drills… an engineering read of an EMG review") describes a
  review, not a three-exercise EMG study. The year is wrong by two.
- citations.json holds the **2009 review's title under the year 2007**, so the
  single canonical record matches neither of the two things the id is used for.

**On "cuff activation precedes end-range loading":** this sentence appears twice
in overhead-mobility as a hard rule (`no_ballistic_end_range` at line 36, and the
Phase-2 rationale at line 471). **It is not in either retrieved abstract.** The
2009 review's abstract makes no statement about activation sequencing relative to
end-range; the 2007 EMG paper's headline result is the opposite of a
loading-order claim ("No statistical difference existed among the exercises for
the supraspinatus"). Full text of the 2009 review is paywalled and was not
retrieved, so I cannot say it is absent from the paper — only that nothing
retrieved supports it, and the programme's own
`engineering_choices_flagged` block (line 920-924) already concedes the
light-load inference is "an engineering read of that catalogue", not a finding.

**Verdict:** MISATTRIBUTED — one id serves two different papers, and both
locators are wrong (wrong journal for one, wrong year for the other), so neither
resolves.
**Reach:** the EMG study is 22 **asymptomatic** subjects performing three
isolated cuff exercises. The three gymnastics programmes use it to justify a
*stop-the-session* rule during hangs, pull-ups and ring work — a different
population state (symptomatic), a different set of movements, and a clinical
decision the paper does not address. The 2009 review is self-declared Level 5.
**Consequence:** `/evidence` ships "Reinold MM, Escamilla RF, Wilk KE (2007).
Current concepts… — Journal of Orthopaedic & Sports Physical Therapy" with no
volume, no pages, no URL and a `CITED` pill — unfollowable, and off by two years.
Four programmes cite the id. `KNOWN_REFERENCE_CONFLICTS.reinold_2007`
(`data-integrity.test.ts:1546`) holds the internal disagreement open; the
external errors (wrong journal, wrong year) are outside what that test can see.
**Classification: data-defect (identifiers) + needs-credentialed-human (the
sequencing rule and the asymptomatic→symptomatic reach).**

---

### rhea_2003_meta — SUPPORTS
**Cited for:** "General strength dose-response anchor for the weekly hard-rep
target. Replaces a retracted reference (Barbalho 2020, retracted April 2020)…
Rhea establishes the dose-response shape only — the specific 40-60 hard reps/week
figure remains coaching consensus and is labelled as such in the tier rationale,
not presented as an RCT result." (first-strict-pullup)
**Claimed:** Rhea MR, Alvar BA, Burkett LN, Ball SD (2003), *Med Sci Sports Exerc*
35(3):456-464, https://pubmed.ncbi.nlm.nih.gov/12618576/
**Found:** PMID 12618576 (https://pubmed.ncbi.nlm.nih.gov/12618576/) — *Med Sci
Sports Exerc. 2003 Mar;35(3):456-64*, doi 10.1249/01.MSS.0000053727.63505.D4.
Authors, year, journal, volume, issue and pages all match exactly. URL resolves
to this paper.
**Quoted:** "A meta-analysis of 140 studies with a total of 1433 effect sizes
(ES) was carried out to identify the dose-response relationship… Training with a
mean intensity of 60% of one repetition maximum elicits maximal gains in
untrained individuals, whereas 80% is most effective in those who are trained.
Untrained participants experience maximal gains by training each muscle group
3 d.wk and trained individuals 2 d.wk. Four sets per muscle group elicited
maximal gains in both trained and untrained individuals."
**Verdict:** SUPPORTS — the paper is a dose-response meta-analysis, which is
exactly and only what the `used_for` claims of it. The `used_for` explicitly
declines to attribute the 40-60 reps/week figure to it. This is the batch's
model citation: it names its own limit.
**Reach:** the meta reports intensity, frequency and set volume; it does not
report a weekly hard-rep target, and the programme says so.
**Consequence:** the one id in this batch wired to engine behaviour.
`src/lib/engine/proposal-citations.ts:35-36` maps **both** `tier_advance` and
`tm_bump` to `rhea_2003_meta`; `useStore.ts:736,771` snapshots its
`display_short`/`display_line` onto every accepted proposal of those kinds, so
this string is frozen into user history. Also on `/evidence`.
**Classification: none — clean.**

---

### robertson_2004 — NOT_FOUND (support), record verified
**Cited for:** "4-6h post-practice consolidation window vulnerable to
similar-task interference. Underpins the 'don't stack handstand practice
immediately after heavy overhead press' placement rule." (handstand-walk)
**Claimed:** Robertson EM, Pascual-Leone A, Miall RC (2004), "Current concepts in
procedural consolidation", *Nature Reviews Neuroscience* 5:576-582.
**Found:** PMID 15208699 (https://pubmed.ncbi.nlm.nih.gov/15208699/) — *Nat Rev
Neurosci. 2004 Jul;5(7):576-82*, doi 10.1038/nrn1426, Robertson EM,
Pascual-Leone A, Miall RC. Authors, year, journal, volume and pages all match.
**Quoted:** the PubMed record carries **no abstract**. OpenAlex
(`api.openalex.org/works/https://doi.org/10.1038/nrn1426`) returns the title,
year and venue with `abstract_inverted_index: null`. Semantic Scholar returns
`"abstract": null` with the publisher-elided notice. nature.com/articles/nrn1426
returns a 303 to an identity provider.
**Verdict:** NOT_FOUND — the paper unambiguously exists and is attributed
correctly, but **no sentence of its content was retrieved**, so the specific
"4-6 h window vulnerable to similar-task interference" claim is unverified. I
will not assert what a review of procedural consolidation says from its title.
**Searches run:** PubMed efetch abstract for 15208699 (no abstract on record);
OpenAlex by DOI; Semantic Scholar Graph API by DOI; WebFetch
`https://www.nature.com/articles/nrn1426` (303 to idp.nature.com).
**Consequence:** the "don't stack handstand practice immediately after heavy
overhead press" placement rule in handstand-walk rests on the 4-6 h figure. That
rule is programme copy — grep finds no scheduling code that reads a
consolidation window; session placement is not gated on it. So the exposure is
a stated rationale a user may believe, not a behaviour.
**Classification: data-defect (unverifiable as cited — needs the numeric claim
sourced to a retrievable sentence, or softened).**

---

### robineau_2016 — SUPPORTS
**Cited for:** "The 6h separation dose-response — the key rule the program
applies" (CSM); "6+ h separation preserves both adaptations; 0h halves strength
gains. Anchors the same-day sequencing rule." (engine-builder-block-2); "6+ h
separation dose-response: C-0h halves strength gains vs alternate-day. Cited in
adaptive_engine_hooks and concurrent_strength_prescription." (engine-builder)
**Claimed:** Robineau J, Babault N, Piscione J, Lacome M, Bigard AX (2016),
*J Strength Cond Res* 30(3):672-683, journals.lww.com link.
**Found:** PMID 25546450 (https://pubmed.ncbi.nlm.nih.gov/25546450/) — *J Strength
Cond Res. 2016 Mar;30(3):672-83*, doi 10.1519/JSC.0000000000000798. Authors,
year, journal, volume, issue and pages match exactly.
**Quoted:** "This study aimed to determine whether the duration (0, 6, or 24
hours) of recovery between strength and aerobic sequences influences the
responses to a concurrent training program. Fifty-eight amateur rugby players
were randomly assigned to control (CONT), concurrent training (C-0h, C-6h, or
C-24h), or strength training (STR) groups during a 7-week training period… Gains
in maximal strength for bench press and half squat were lower in C-0h compared
with that in C-6h, C-24h, and STR… **Fitness coaches should avoid scheduling 2
contradictory qualities, with less than 6-hour recovery between them** to obtain
full adaptive responses to concurrent training."
**Verdict:** SUPPORTS — the 6 h rule is the paper's own stated recommendation, in
its own conclusion.
**Reach, and one overstatement to note:** "0h **halves** strength gains" is not a
number this abstract reports. It reports that C-0h gains were "lower" than C-6h,
C-24h and STR, assessed by magnitude-based inference — not a 50% figure, and not
frequentist. The abstract also says C-6h is itself sub-optimal: "Daily training
without a recovery period between sessions (C-0h) and, **to a lesser extent,
training twice a day (C-6h), is not optimal**". Two programmes cite the 6 h
figure as the safe floor; the paper treats 24 h as the better answer. Population:
58 **amateur rugby players**, strength always before aerobic. The engine applies
the rule to arbitrary sequencing.
**Consequence:** `/evidence` line is correct and the URL resolves. The sequencing
rule lives in programme copy (`adaptive_engine_hooks`,
`concurrent_strength_prescription`); no engine code reads a separation-hours
field. **Classification: needs-credentialed-human (the "halves" quantifier and
the 6h-vs-24h framing).**

---

### rogers_2021_dfa — SUPPORTS
**Cited for:** "DFA a1 = 0.75 as VT1 anchor for chest-strap users."
(engine-builder-block-2); "DFA a1 = 0.75 as VT1 anchor. Cited in
hr_zone_methodology as the preferred method for chest-strap-equipped users."
(engine-builder)
**Claimed:** Rogers B, Giles D, Draper N, Hoos O, Gronwald T (2021), *Frontiers in
Physiology* 11:596567, doi 10.3389/fphys.2020.596567.
**Found:** Crossref 10.3389/fphys.2020.596567 — "A New Detection Method Defining
the Aerobic Threshold for Endurance Exercise and Training Prescription Based on
Fractal Correlation Properties of Heart Rate Variability", Rogers, Giles, Draper,
Hoos, Gronwald, *Frontiers in Physiology* vol 11, published 2021-01-15. Fetched
https://www.frontiersin.org/journals/physiology/articles/10.3389/fphys.2020.596567/full
**Quoted:** "The short-term scaling exponent alpha1 of detrended fluctuation
analysis (DFA a1), a nonlinear index of heart rate variability (HRV) based on
fractal correlation properties, has been shown to steadily change with increasing
exercise intensity." DFA a1 = 0.75 is proposed as the aerobic-threshold marker,
selected as "the midpoint between a fractal behavior of the HR time series of 1.0
(seen with very light exercise) and an uncorrelated value of 0.5 which represents
white noise." Sample: n=15 final (17 enrolled, 2 excluded for cardiac ectopy),
**male only**, 19-52 years, VO2max 41-74 ml/kg/min.
**Verdict:** SUPPORTS — the 0.75 value and its use as a VT1 anchor are the
paper's own proposal, stated in the paper.
**Reach:** n=15, all male, single session, and the 0.75 value is a *reasoned
midpoint* rather than an empirically optimised cut-point. It also requires
beat-to-beat R-R data — the programmes correctly restrict it to chest-strap
users. A female user, or an optical-HR user, is outside what was tested.
**Consequence:** `hr_zone_methodology` copy in two programmes; the URL on
`/evidence` resolves to the correct paper. No code reads a DFA value.
**Classification: needs-credentialed-human (male-only n=15 → general users).**

---

### rohleder_vogt_2018 — OVERSTATED
**Cited for:** "Combined tactile-verbal + visual feedback outperforms either
alone. Used in feedback_type rationale and video_review drill design."
(handstand-walk)
**Claimed:** Rohleder J, Vogt T (2018), "Combined tactile-verbal and visual
feedback in gymnastics skill acquisition", *Science of Gymnastics Journal /
International Journal of Performance Analysis in Sport* 18(1).
**Found:** Crossref, author query — Rohleder J, Vogt T, "TEACHING NOVICES THE
HANDSTAND: A PRACTICAL APPROACH OF DIFFERENT SPORT-SPECIFIC FEEDBACK CONCEPTS ON
MOVEMENT LEARNING", *Science of Gymnastics Journal* **10(1):29-42**, 2018. Full
PDF retrieved from
https://www.fsp.uni-lj.si/mma/SCGYM-10-1-2018-article-3/20180228215325/
**Quoted (abstract, verbatim from the PDF):** "…this study investigated whether
standardised tactile-verbal feedback **vs.** visual-comparative feedback
short-term enhance novel gymnasts' handstand postural performance and motor
imagery. Twenty-six students (7 females, 19 males) were randomly assigned to the
tactile-verbal feedback (age: 22.7 ± 3.9 years) or visual-comparative feedback
(age: 21.9 ± 1.8 years) group (**each n = 13**), performing a pre-post designed
experimental session of handstand trials… Shoulder positioning enhanced after
receiving tactile-verbal feedback (p < .01), whereas shoulder angle imagery
enhanced following visual-comparative feedback (p < .05)… Tactile-verbal feedback
and visual-comparative feedback effect several issues of motor learning in
different manners; however, this is true even in a short-term approach. Thus,
**practical recommendations are suggested to consider combined feedback concepts**
to allow comprehensive handstand acquisition."
**Verdict:** OVERSTATED — **no combined condition was tested.** The design is two
arms, tactile-verbal (n=13) vs visual-comparative (n=13). "Consider combined
feedback concepts" is a suggestion in the authors' conclusion, derived from the
two modalities affecting different variables. The `used_for` converts an
untested recommendation into a measured superiority ("outperforms either alone").
That is precisely the gap the paper cannot close, because it never ran the arm.
Separately: it is a **single session**, pre-post — not skill acquisition over
time.
**Reach:** 26 university students, one session, wall-free handstand posture
measured goniometrically. handstand-walk uses it to design video-review drills
across a multi-week block.
**Consequence:** the `/evidence` line carries a **fabricated title** ("Combined
tactile-verbal and visual feedback in gymnastics skill acquisition" — the paper
is not called that) and a **hedged double venue with the wrong volume** ("Science
of Gymnastics Journal / International Journal of Performance Analysis in Sport
18(1)"; correct is Science of Gymnastics Journal 10(1):29-42). Unfollowable as
printed. The `feedback_type` rationale and `video_review` drill design in
handstand-walk are programme copy; no code reads them.
**Classification: data-defect (title and venue) + the OVERSTATED support claim.**

---

### ronnestad_hansen_2020 — CONTRADICTS
**Cited for:** "Short intervals were **SUPERIOR to long intervals for VO2max** in
trained cyclists. Informs the decision to keep 4×4 as the VO2max stimulus…"
(engine-builder); "Short intervals (**5×3, 8×2**) accumulate more
**time-at-VO2max** per session for well-trained users. Anchors the
block_short_intervals alternation." (engine-builder-block-2)
**Claimed:** Rønnestad BR, Hansen J, et al. (2020), "Short intervals induce
superior training adaptations compared with long intervals in cyclists",
*Journal of Science and Medicine in Sport / European Journal of Applied
Physiology*, https://pubmed.ncbi.nlm.nih.gov/31977120/
**Found:** PMID 31977120 resolves to *Scand J Med Sci Sports.* **2020
May;30(5):849-857**, doi 10.1111/sms.13627 — "Superior performance improvements in
elite cyclists following short-interval vs effort-matched long-interval
training", Rønnestad BR, Hansen J, Nygaard H, Lundby C. **Neither journal named
in the record is correct.**
**Quoted:** "…short intervals (SI; n = 9; 3 series with **13 × 30-second** work
intervals interspersed with 15-second recovery and 3-minutes recovery between
series) against effort-matched… long intervals (LI; n = 9; 4 series of 5-minute
work intervals…) on performance parameters in **elite cyclists** (V̇O2max 73 ± 4
mL min-1 kg-1). … SI achieved a larger (P < .05) relative improvement in peak
aerobic power output than LI (3.7 ± 4.3% vs -0.3 ± 2.8%…), fractional
utilization of V̇O2max at 4 mmol L-1 [La-]… and larger relative increase in power
output at 4 mmol L-1 [La-]…, **while there was no group difference in change of
V̇O2max**."
**Verdict:** CONTRADICTS — engine-builder's `used_for` says short intervals were
superior **for VO2max**. The paper says explicitly that there was **no group
difference in change of VO2max**. Superiority was in peak aerobic power output,
fractional utilisation, power at 4 mmol/L and 20-min mean power — every one of
them a *performance* or *threshold* variable, not VO2max. The programme then uses
this misread to justify keeping 4×4 as its VO2max stimulus; the conclusion may be
fine, but the reason given is the reverse of what the paper found.

Block-2's `used_for` is a different problem: "**time-at-VO2max**" and the "5×3,
8×2" protocols. This paper's SI protocol was 13×30 s, not 5×3 or 8×2, and it did
not measure time at VO2max. The paper that measured time above 90% VO2max is
**Almquist NW, Nygaard H, Vegge G, Hammarström D, Ellefsen S, Rønnestad BR,
*Scand J Med Sci Sports.* 2020 Jul;30(7):1140-1150**, PMID 32267032
(https://pubmed.ncbi.nlm.nih.gov/32267032/): "SI was associated with 14% ± 3%
higher mean power output… and **longer working time above 90% of maximal oxygen
uptake** (VO2max, 54% ± 76%) and 90% peak heart rate (HRpeak, 153% ± 148%) than
LI (all P < .05)". Block-2 is describing Almquist 2020, under Rønnestad &
Hansen's id.
**Reach:** n=9 per arm, **elite** cyclists at VO2max 73 mL/kg/min, 3 weeks.
Block-2 applies it to "well-trained users" on an erg or bike in a consumer app.
That is a substantial extrapolation from nine elite cyclists.
**Consequence:** `/evidence` prints a paraphrased title and a two-journal
either/or ("Journal of Science and Medicine in Sport / European Journal of
Applied Physiology") where the real venue is Scandinavian Journal of Medicine &
Science in Sports — while the URL beside it resolves correctly, so title and link
disagree on the same line. `data-integrity.test.ts:942` names
`ronnestad_hansen_2020` in the history of a prior drill-citation defect, but no
current test compares a `used_for` against the paper's findings — nothing in the
repo can catch a `used_for` that inverts a result.
**Classification: data-defect (venue, and block-2's claim belongs to Almquist
2020) + the CONTRADICTS on engine-builder's VO2max sentence.**

---

### ross_2015 — MISATTRIBUTED
**Cited for:** "Non-response drops from 50% intensity to 0% at 75% — often dose,
not genotype" (CSM); "Non-response at 50% intensity drops to 0% at 75%. Informs
why Push tier adds a third session for high-cardio users."
(engine-builder-block-2); "Non-response at 50% intensity is substantially reduced
at 75% intensity. Informs the tier progression logic — under-dosing is often the
cause of apparent non-response." (engine-builder); "Non-response drops at higher
intensity — race-prep intensity distribution rationale" (rowing-2k-test-prep).
**Claimed:** engine-builder and engine-builder-block-2 — Ross R, Goodpaster BH,
Koch LG, et al., "Precision exercise medicine: understanding exercise response
variability", *Mayo Clinic Proceedings* 90(11):1506-1514, url
https://pubmed.ncbi.nlm.nih.gov/26586576/. CSM and rowing-2k — Ross R,
de Lannoy L, Stotz PJ, "Separate effects of intensity and amount of exercise on
interindividual cardiorespiratory fitness response", Mayo Clin Proc
90(11):1506-1514. citations.json — the "Separate effects" **title** with the
"Precision exercise medicine" **author list** and the PMID 26586576 URL.
**Found:** three distinct problems.
- The real Mayo paper is **PMID 26455890** (https://pubmed.ncbi.nlm.nih.gov/26455890/)
  — *Mayo Clin Proc. 2015 Nov;90(11):1506-14*, doi 10.1016/j.mayocp.2015.07.024,
  "Separate Effects of Intensity and Amount of Exercise on Interindividual
  Cardiorespiratory Fitness Response", **Ross R, de Lannoy L, Stotz PJ**.
- "Precision exercise medicine: understanding exercise response variability" is
  **PMID 30862704** (https://pubmed.ncbi.nlm.nih.gov/30862704/) — *Br J Sports
  Med.* **2019 Sep;53(18):1141-1153**, doi 10.1136/bjsports-2018-100328, Ross R,
  Goodpaster BH, Koch LG, Sarzynski MA, Kohrt WM, … Bouchard C. A **2019 BJSM**
  paper, not a 2015 Mayo one.
- **The URL in citations.json — PMID 26586576 — is not either of them.** It is
  *Sci Rep. 2015 Nov 20;5:16894*, "**Resequencing of the common marmoset genome**
  improves genome assemblies and gene-coding sequence analysis", Sato K, Kuroki Y,
  et al.

**Quoted (26455890):** "Participants were 121 (75 females, 62%) **sedentary,
middle-aged** (mean [SD] age, 53.2 [7.5] years), **abdominally obese adults**…
At 24 weeks, 38.5% (15 of 39), 17.6% (9 of 51), and **0% (0 of 31)** of the
participants within the LALI, HALI, and HAHI groups, respectively, were CRF
nonresponders… At a fixed amount of exercise, increasing the exercise intensity
eliminated nonresponse (P=.001)… **Low-intensity exercise may not be sufficient
to improve CRF for a substantial proportion of sedentary obese adults.**"

**Which paper the programmes meant:** **the Mayo 2015 paper — Ross, de Lannoy &
Stotz, *Mayo Clin Proc* 90(11):1506-1514, PMID 26455890.** It is the only one of
the two that contains the 50%→75%, 38.5%→0% non-response numbers all four
`used_for` strings recite. engine-builder and engine-builder-block-2 have pasted
the 2019 BJSM title and author list onto the 2015 Mayo locator; CSM and rowing-2k
carry the correct title and authors. citations.json is a third variant: right
title, wrong authors, and a URL to a marmoset genome paper.

**Verdict:** MISATTRIBUTED — the canonical record's identifier resolves to an
unrelated work in a different field, and two of the four programme records
describe a different Ross paper.
**On the underlying claim — "apparent non-response is usually under-dosing":**
the Mayo abstract supports *a* version of this. Increasing intensity at fixed
amount eliminated non-response (0/31); increasing amount at fixed intensity
halved it. What it does **not** support is the word "usually" applied to this
app's users. The population is 121 sedentary, abdominally obese, middle-aged
adults (62% female) over 24 weeks at 50% vs 75% of VO2peak. engine-builder uses
it for **tier progression logic** and block-2 for **adding a third session to
high-cardio users** — trained people already exercising well above 50% VO2peak,
for whom "you are simply under-dosed at 50% intensity" is not the relevant
question. The paper's own conclusion is scoped to "sedentary obese adults". This
is the largest reach gap in the batch.
**Consequence:** `/evidence` renders the citations.json line with a `link`
anchor going to the marmoset paper. Four programmes cite the id.
`KNOWN_REFERENCE_CONFLICTS.ross_2015` (`data-integrity.test.ts:1536`) declares
the internal title conflict; the dead-wrong URL is invisible to it, because that
test compares author surnames and title words only and never dereferences a URL.
**Classification: data-defect (URL, authors, two programme records) +
needs-credentialed-human (sedentary obese → trained-user tier logic).**

---

### sadowski_2021 — MISATTRIBUTED
**Cited for:** "Shoulder-moment analysis of the press to handstand. Directly
informs the choice NOT to program straight-arm press early…" (handstand-walk);
"…the closest available analog for ring-support end-range shoulder load"
(muscle-up); "Shoulder-moment analysis for the straight-arm press to handstand —
informs the no-heavy-load-early rule" (overhead-mobility). All three carry
`verification_status: unverified` or an in-line flag.
**Claimed:** Sadowski J, Mastalerz A, Niznikowska E, et al. (2021), "Kinematic and
kinetic analysis of the straight-arm press to handstand", *PLOS One*
16(7):e0253951.
**Found:** Crossref record for **10.1371/journal.pone.0253951** — "Kinematics and
joints moments profile during straight arm press to handstand in male gymnasts",
**Mizutori H, Kashiwagi Y, Hakamada N, Tachibana Y, Funato K**, *PLOS ONE* 16(7),
2021-07-14. Full text fetched at https://pmc.ncbi.nlm.nih.gov/articles/PMC8279359/
Searches for a Sadowski paper of this description: PubMed `Sadowski J[au] AND
2021[dp] AND gymnast*` → 0 results; Crossref author+bibliographic query
`Sadowski` + `handstand` → no matching work; web search returns only the Mizutori
paper. **No Sadowski straight-arm-press-to-handstand paper was found to exist.**
**Quoted (PMC8279359):** the study is a **floor / force-platform** study —
participants "placed their hands shoulder width apart on the middle of the force
platform". Highly-skilled performers' shoulder moments were "under 1.5 Nm·kg⁻¹";
wrist joint moments were maintained at approximately "40 percent of the body
weight"; less-skilled performers showed larger shoulder flexion moments (3-59% of
movement, p<0.001).
**Verdict:** MISATTRIBUTED — the author attribution appears to be invented; the
DOI belongs to a different research group.
**Two further errors in the repo's own correction note.** All three programmes
and `citations.json.review_note` state that the DOI resolves to "a Mizutori-
authored **parallel-bars** study" and that "the 3× BW figure was a **parallel-bars
finding, not a floor finding — do not cite that number**". Retrieved text says the
opposite on both points: (a) it **is** a floor/force-platform press to handstand,
which is exactly the movement the programmes care about; (b) no 3× bodyweight
shoulder figure appears — highly-skilled shoulder moments are under 1.5 Nm·kg⁻¹,
and the ~40% body weight figure is at the **wrist**. So the withdrawal note
withdraws the right number for the wrong reason, and simultaneously discards a
paper that is *more* on-point than the note claims.
**Reach:** 59 male gymnasts, skilled and less-skilled, on the floor. muscle-up
uses it as an analogue for **ring-support** end-range load — a different implement
with a different stability demand, and the paper says nothing about rings.
**Consequence:** `/evidence` prints "Sadowski J, Mastalerz A, Niznikowska E, et
al. (2021). Kinematic and kinetic analysis of the straight-arm press to handstand
— PLOS One 16(7):e0253951" with a `CITED` pill. A user who looks up that DOI finds
a different paper by different authors. Three programmes' no-heavy-load-early
rules trace to it. `data-integrity.test.ts:892` ("citations carry real bylines")
checks byline shape, not byline truth. **Classification: data-defect.**

---

### salmoni_schmidt_walter_1984 — NOT_FOUND (support), record verified
**Cited for:** "Guidance hypothesis; feedback frequency in mobility drill
acquisition" (overhead-mobility)
**Claimed:** Salmoni AW, Schmidt RA, Walter CB (1984), "Knowledge of results and
motor learning: a review and critical reappraisal", *Psychol Bull* 95(3):355-386.
**Found:** PMID 6399752 (https://pubmed.ncbi.nlm.nih.gov/6399752/) — *Psychol
Bull. 1984 May;95(3):355-86*. Crossref DOI 10.1037/0033-2909.95.3.355 — same
title, authors Salmoni, Schmidt, Walter, *Psychological Bulletin* 95(3):355-386,
1984. **Every bibliographic field in the repo matches exactly.**
**Quoted:** the PubMed record has **no abstract**. OpenAlex returns
`abstract_inverted_index: null`. Semantic Scholar returns `"abstract": null` with
the publisher-elided notice. Crossref carries no abstract. APA PsycNet is
JS-gated (and record id 1984-14717-001 is a different article entirely).
**Verdict:** NOT_FOUND — the record is verified as real and correctly attributed,
but **no sentence of the paper's content was retrieved**, so I cannot confirm that
it is the source of the guidance hypothesis or of feedback-frequency findings.
Search-engine summaries asserting this were returned and are deliberately not
relied on: they are not retrieved primary text.
**Searches run:** PubMed `Salmoni knowledge of results motor learning review
critical reappraisal`; PubMed efetch 6399752; Crossref by title and by DOI;
OpenAlex by DOI; Semantic Scholar by DOI; WebFetch pubmed.ncbi.nlm.nih.gov/6399752
(cookie wall); WebFetch psycnet.apa.org record page (JS shell); r.jina.ai proxy on
doi.org/10.1037/0033-2909.95.3.355 (empty); two candidate hosted PDFs (404 / 403).
**Consequence:** overhead-mobility's feedback-frequency dosing rationale. Not
rendered in the UI beyond the `/evidence` line, which is correct and complete
except for the missing DOI/URL — adding
`https://doi.org/10.1037/0033-2909.95.3.355` would make it followable.
**Classification: data-defect (no resolvable identifier on the record; content
unverified).**

---

### san_millan_brooks_2018 — OVERSTATED
**Cited for:** "Zone 2 = lactate <2 mmol/L; substrate oxidation" (CSM);
"Metabolic flexibility framework and Zone 2 lactate-clamp methodology. Anchors
the block_z1_steady prescription." (engine-builder); "Zone 2 anchor (blood
lactate < 2 mmol/L)" (rowing-2k-test-prep)
**Claimed:** San-Millán I, Brooks GA (2018), *Sports Medicine* 48(2):467-479,
https://link.springer.com/article/10.1007/s40279-017-0751-x
**Found:** PMID 28623613 (https://pubmed.ncbi.nlm.nih.gov/28623613/) — *Sports
Med. 2018 Feb;48(2):467-479*, doi 10.1007/s40279-017-0751-x, "Assessment of
Metabolic Flexibility by Means of Measuring Blood Lactate, Fat, and Carbohydrate
Oxidation Responses to Exercise in Professional Endurance Athletes and Less-Fit
Individuals", San-Millán I, Brooks GA. Authors, year, journal, volume, pages
match; the URL resolves to this paper.
**Quoted:** "We used indirect calorimetry and [La-] measurements to study the
metabolic responses to exercise in PAs, moderately active individuals (MAs), and
MtS individuals… FATox was significantly higher in PAs than MAs and patients with
MtS (p < 0.01), while [La-] was significantly lower in PAs compared with MAs and
patients with MtS. FATox and [La-] were inversely correlated in all three groups
(PA: r = -0.97…)… we believe that measurements of [La-] and FATox rate during
exercise provide an indirect method to assess metabolic flexibility and oxidative
capacity across individuals of widely different metabolic capabilities."
**Verdict:** OVERSTATED — the metabolic-flexibility framework and the
lactate/FATox relationship (engine-builder's `used_for`) are squarely supported.
The **"Zone 2 = lactate <2 mmol/L"** cut-point used by CSM and rowing-2k is
**not present in any text I retrieved**. The abstract reports a continuous inverse
correlation between lactate and fat oxidation; it does not define a zone, and it
does not name a 2 mmol/L boundary. Full text is behind a Springer identity
redirect (303 to idp.springer.com) and the eScholarship mirror returned an empty
body, so I cannot rule out that the number appears in the paper — but nothing
retrieved supports attaching a specific numeric training threshold to this
citation. Two programmes state it as a definition.
**Reach:** professional endurance athletes vs moderately active vs metabolic
syndrome patients, laboratory indirect calorimetry with blood draws. The app's
users have neither a lactate meter nor a metabolic cart; the prescription is
delivered as an HR/RPE zone. The bridge from "lactate <2 mmol/L" to a prescribed
Zone 2 effort is not in this paper.
**Searches run for the 2 mmol/L claim:** WebFetch link.springer.com (303 to IdP);
eScholarship PDF mirror qt5cz1v976 (empty / HTML); web search for "2 mmol" within
the paper (returned commentary and third-party summaries only).
**Consequence:** `/evidence` line is correct and resolves. Three programmes'
Zone-2 definitions cite it; `block_z1_steady` prescription copy rests on it. No
engine code reads a lactate value. **Classification: data-defect (the numeric
cut-point is attributed to a source not shown to contain it) +
needs-credentialed-human (lab lactate → field HR zone).**

---

### schmidt_1975 — SUPPORTS
**Cited for:** "Schema theory: variability of practice builds recall and
recognition schemas. Anchors the grip-width rotation in Tier D."
(first-strict-pullup); same in muscle-up (low-ring / jump-assist / strict
variety) and handstand-walk (line, markers, precision lane).
**Claimed:** Schmidt RA (1975), "A schema theory of discrete motor skill
learning", *Psychological Review* 82:225-260 (first-strict-pullup and muscle-up
give 82(4):225-260).
**Found:** Crossref 10.1037/h0076770 — "A schema theory of discrete motor skill
learning.", Schmidt, *Psychological Review* **82(4):225-260**, July 1975. All
fields match. Abstract retrieved from OpenAlex
(`api.openalex.org/works/https://doi.org/10.1037/h0076770`).
**Quoted:** "After these difficulties are discussed, a new theory for discrete
motor learning is proposed that seems capable of explaining the existing
findings. **The theory is based on the notion of the schema and uses a recall
memory to produce movement and a recognition memory to evaluate response
correctness.** Some of the predictions are mentioned, research techniques and
paradigms that can be used to test the predictions are listed, and data in
support of the theory are presented."
**Verdict:** SUPPORTS — the recall/recognition schema mechanism is the paper's
central proposal, stated in its own abstract, exactly as the `used_for` describes.
**Reach, stated honestly:** the retrieved abstract does **not** contain the words
"variability of practice". Variability of practice is a *prediction derived from*
schema theory ("Some of the predictions are mentioned") rather than a result
reported in this paper; it was tested by others afterwards and has a contested
empirical record. And the domain is **discrete laboratory motor tasks** — applying
it to grip-width rotation on pull-ups, ring-height variety, and handstand-walk
lane markers is a theoretical transfer, not a demonstrated one. The
`used_for` phrasing "variability of practice builds recall and recognition
schemas" states the prediction as though it were the finding.
**Consequence:** three programmes' Tier-D variety design. `/evidence` line is
correct but has no DOI/URL — adding `https://doi.org/10.1037/h0076770` would make
it followable. **Classification: needs-credentialed-human (prediction vs finding;
lab task → gym task).**

---

### schumann_2022 — SUPPORTS
**Cited for:** "The updated meta — max strength SMD −0.06 (n.s.), hypertrophy SMD
−0.01 (n.s.), explosive strength SMD −0.28 (p=0.007). The reconciliation." (CSM);
"SMD −0.28 explosive strength — the specific loss zone. Anchors 'no PR chasing'
rule." (engine-builder-block-2); "…Anchors the 'no PR chasing' rule specifically
for explosive lifts." (engine-builder)
**Claimed:** Schumann M, Feuerbacher JF, Sünkeler M, et al. (2022), *Sports
Medicine* 52:601-612 (CSM gives 52(3):601-612),
https://link.springer.com/article/10.1007/s40279-021-01587-7
**Found:** PMID 34757594 (https://pubmed.ncbi.nlm.nih.gov/34757594/) — *Sports
Med. 2022 Mar;52(3):601-612*, doi 10.1007/s40279-021-01587-7, Schumann M,
Feuerbacher JF, Sünkeler M, Freitag N, Rønnestad BR, Doma K, Lundberg TR. Every
field matches; the URL resolves.
**Quoted:** "A total of 43 studies were included. The estimated standardised mean
differences (SMD) based on the random-effects model were **- 0.06** (95% CI - 0.20
to 0.09; p = 0.446), **- 0.28** (95% CI - 0.48 to - 0.08; **p = 0.007**), and
**- 0.01** (95% CI - 0.16 to 0.18; p = 0.919) for maximal strength, explosive
strength, and muscle hypertrophy, respectively. **Attenuation of explosive
strength was more pronounced when concurrent training was performed within the
same session (p = 0.043) than when sessions were separated by at least 3 h**
(p > 0.05)."
**Verdict:** SUPPORTS — all three SMDs, the p-value, and the direction of the
finding are quoted correctly to three significant figures. The best-transcribed
citation in the batch.
**Reach:** genuinely broad — 43 studies, healthy adults of any age or sex, and
the abstract states the result held across training status (untrained vs active)
and age. One note the programmes should carry: the paper's separation threshold
is "**at least 3 h**", whereas the same programmes cite Robineau 2016 for a
**6 h** rule. Both are cited side by side without reconciling the two numbers.
**Consequence:** the "no PR chasing" rule in three programmes. `/evidence` line
is correct and resolves. **Classification: none on the citation itself; the 3h
vs 6h inconsistency across two citations is needs-credentialed-human.**

---

## Summary

| id | verdict | class |
|---|---|---|
| petre_2018 | MISATTRIBUTED | data-defect |
| pilegaard_2000 | MISATTRIBUTED | data-defect |
| potdevin_2018 | OVERSTATED | data-defect + human |
| proteau_1992 | MISATTRIBUTED | data-defect |
| reinold_2007 | MISATTRIBUTED | data-defect + human |
| rhea_2003_meta | SUPPORTS | — |
| robertson_2004 | NOT_FOUND | data-defect |
| robineau_2016 | SUPPORTS | needs-credentialed-human |
| rogers_2021_dfa | SUPPORTS | needs-credentialed-human |
| rohleder_vogt_2018 | OVERSTATED | data-defect |
| ronnestad_hansen_2020 | CONTRADICTS | data-defect |
| ross_2015 | MISATTRIBUTED | data-defect + human |
| sadowski_2021 | MISATTRIBUTED | data-defect |
| salmoni_schmidt_walter_1984 | NOT_FOUND | data-defect |
| san_millan_brooks_2018 | OVERSTATED | data-defect + human |
| schmidt_1975 | SUPPORTS | needs-credentialed-human |
| schumann_2022 | SUPPORTS | — |

4 SUPPORTS · 3 OVERSTATED · 6 MISATTRIBUTED · 1 CONTRADICTS · 2 NOT_FOUND ·
0 SUPERSEDED.

### Resolution of the four declared conflicts

| id | the programme meant | authority |
|---|---|---|
| petre_2018 | Petré, Löfving & Psilander 2018, *J Sports Sci Med* 17(2):167-173 — **highly-trained** | PMID 29769816. citations.json is right; the programme pasted the title/authors of Petré 2021 *Sports Med* 51(5):991-1010 (PMID 33751469), a different paper whose trained-subgroup result runs the other way (ES −0.35). |
| proteau_1992 | Proteau, Marteniuk & Lévesque 1992, *Q J Exp Psychol A* **44(3)**:557-575 | PMID 1631322. The citations.json alternative (*J Motor Behav* 24(1):81-104) **does not exist** — full 1992 JMB volume enumerated, 37/37 items, no Proteau, no such page range. |
| reinold_2007 | first-strict-pullup / muscle-up / handstand-walk → Reinold et al. 2007, ***J Athl Train* 42(4):464-469** (PMID 18174934). overhead-mobility → Reinold, Escamilla & Wilk, *JOSPT* **39(2):105-117, 2009** (PMID 19194023). | Both repo locators (JOSPT 37(9):519-527 and JOSPT 37(11):659-670) return 0 PubMed hits. |
| ross_2015 | Ross, de Lannoy & Stotz 2015, *Mayo Clin Proc* 90(11):1506-1514 | PMID **26455890**. "Precision exercise medicine" is Ross, Goodpaster, Koch et al., *BJSM* 2019;53(18):1141-1153 (PMID 30862704). The URL on the record, PMID 26586576, is a **marmoset genome paper**. |

### Two defects the citations layer cannot currently see

1. **`KNOWN_REFERENCE_CONFLICTS` compares repo to repo.** It caught all four
   declared conflicts, and it would have caught none of: pilegaard_2000
   (programme and citations.json agree — with each other — on a locator belonging
   to Dubouchaud et al.), rohleder_vogt_2018 (both carry the same fabricated
   title), sadowski_2021 (both carry the same non-existent author), or
   ronnestad_hansen_2020's inverted finding.
2. **No test dereferences a `url`.** `ross_2015` ships a link to a marmoset
   genome paper and `pilegaard_2000` a link to a different physiology paper, both
   rendered as `link` anchors on `/evidence` (`page.tsx:97-110`) with a `CITED`
   pill beside them.

---

## Claims now unsupported

Programme assertions left standing on a citation that is not `SUPPORTS`. Each is
stated as the repo states it; none is corrected here.

1. **engine-builder** — "Short intervals were SUPERIOR to long intervals for
   **VO2max** in trained cyclists." Rønnestad et al. 2020 reports "no group
   difference in change of V̇O2max". The superiority was in peak aerobic power,
   fractional utilisation and 20-min power. `CONTRADICTS`.
2. **engine-builder-block-2** — "Short intervals (**5×3, 8×2**) accumulate more
   **time-at-VO2max** per session." Not this paper: its SI protocol was 13×30 s
   and it did not measure time at VO2max. The time-above-90%-VO2max finding is
   Almquist et al. 2020, PMID 32267032, which is not in citations.json.
3. **concurrent-strength-maintenance** — "Zone 2 = lactate **<2 mmol/L**" and
   **rowing-2k-test-prep** — "Zone 2 anchor (blood lactate **< 2 mmol/L**)". No
   retrieved text from San-Millán & Brooks 2018 states a 2 mmol/L boundary; the
   paper reports a continuous inverse lactate/FATox correlation.
4. **overhead-mobility** (`:36`, `:471`) — "Reinold 2007 — active rotator-cuff
   engagement should **precede end-range positioning**" / "rotator-cuff
   activation **precedes end-range loading**." Not in either retrieved Reinold
   abstract. The 2007 EMG paper's headline is "No statistical difference existed
   among the exercises for the supraspinatus"; the 2009 review is Level 5 and its
   abstract makes no sequencing claim. This is a hard rule
   (`no_ballistic_end_range`) in a shoulder programme, resting on an id that
   resolves to nothing.
5. **handstand-walk** — "Combined tactile-verbal + visual feedback **outperforms
   either alone**." Rohleder & Vogt 2018 tested two arms and never ran a combined
   condition; "consider combined feedback concepts" is a suggestion in their
   conclusion.
6. **handstand-walk** — "**4-6h** post-practice consolidation window vulnerable to
   similar-task interference", underpinning the don't-stack-after-overhead-press
   placement rule. Robertson et al. 2004 exists and is correctly attributed, but
   no content was retrievable; the numeric window is unverified.
7. **handstand-walk / muscle-up / overhead-mobility** — every no-heavy-load-early
   rule anchored on `sadowski_2021`. No such paper was found; the DOI is
   Mizutori et al. Separately, the repo's own withdrawal note is wrong: the study
   **is** a floor force-platform study (so it is more relevant than the note
   claims), and no 3× bodyweight shoulder figure appears in it at all.
8. **muscle-up** — Sadowski/Mizutori as "the closest available analog for
   **ring-support** end-range shoulder load." The paper is floor press to
   handstand in 59 male gymnasts; rings are not studied.
9. **handstand-walk / muscle-up** — "n=18 children, **8-week** gymnastics." The
   study ran **five weeks / five lessons**. n=18 and the every-five-attempts dose
   are correct.
10. **engine-builder / engine-builder-block-2** — "under-dosing is often the cause
    of apparent non-response", driving **tier progression** and **adding a third
    session for high-cardio users**. The finding is real but in 121 sedentary,
    abdominally obese, middle-aged adults at 50% vs 75% VO2peak over 24 weeks;
    the paper's own conclusion is scoped to "sedentary obese adults".
11. **engine-builder / engine-builder-block-2** — "MCT1 upregulation from
    threshold-and-above work. **Anchors why threshold cruise is Block 2's primary
    driver.**" The molecular finding holds (on either of the two conflated
    papers), but neither measures a performance outcome, and n=7/n=4 one-legged
    knee-extensor work does not establish a block's primary driver.
12. **concurrent-strength-maintenance / engine-builder / engine-builder-block-2** —
    "0h **halves** strength gains." Robineau 2016 reports gains "lower" in C-0h by
    magnitude-based inference; no 50% figure. The same abstract also calls C-6h
    sub-optimal, while the programmes treat 6 h as the safe floor. Adjacent:
    Schumann 2022 uses **3 h** as its separation threshold, cited in the same
    programmes without reconciliation.
13. **first-strict-pullup / muscle-up / handstand-walk** — "Schema theory:
    **variability of practice** builds recall and recognition schemas." Schmidt
    1975's abstract establishes the recall/recognition mechanism; variability of
    practice is a listed *prediction*, not a reported finding, and the domain is
    discrete laboratory tasks.
14. **overhead-mobility** — "Guidance hypothesis; feedback frequency in mobility
    drill acquisition." Salmoni, Schmidt & Walter 1984 is real and exactly
    attributed, but no content was retrievable; the attribution is unverified.
15. **All four programmes citing `proteau_1992`**, and **rowing-2k specifically**,
    whose "race-pace work rationale" cites the *non-existent* J Motor Behav
    record introduced by the 2026-08-18 correction. The reasoning is defensible on
    the real QJEP paper; the reference as printed cannot be looked up.

Nothing above is a prescription change. Every item is either a record to fix or a
reach judgement for a credentialed human.
