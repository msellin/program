# Citation sweep — batch 3 (17 ids, f–k)

**Date:** 2026-09-05
**Scope:** existence, identifier resolution, attribution, support for `used_for`, status, reach.
**Method:** every verdict below rests on text retrieved during this session (Crossref REST,
Europe PMC REST `resultType=core`, NCBI eutils, publisher/PMC HTML, publisher PDF). Nothing is
stated from memory. Where retrieval failed the verdict is `NOT_FOUND` and the searches are listed.

**Two behaviour facts established from the code, because both "Consequence" lines depend on them:**

1. `src/app/evidence/page.tsx` fetches `/data/citations.json` and renders **every field of every
   record verbatim** — `authors (year). title — source [link]` — to every user on `/evidence`.
   A wrong record in `citations.json` is user-facing, not internal bookkeeping.
2. `evidence_base.references[]` — the array that carries every `used_for` string audited here —
   **has no renderer.** `grep -rn "evidence_base" src --include=*.ts --include=*.tsx` returns only
   `schemas.ts` (parse) and a comment in `engine/citations.ts`. The one "Cites" strip in the app
   (`src/app/programs/[slug]/ProgramPreviewClient.tsx:402`) reads `program.goals.references`, and
   **all ten programmes have `goals.references` empty** — so that strip never renders for anybody.
   The `used_for` strings are therefore author-time reasoning, not shipped copy. That does not make
   them harmless: they are the stated warrant for prescriptions that *are* shipped.

---

### feito_2018 — OVERSTATED

**Cited for:** "16 wk HIFT — strength AND VO2max improved concurrently"
**Claimed:** Feito Y, Heinrich KM, Butcher SJ, Poston WSC (2018), "High-Intensity Functional
Training (HIFT): definition and research implications for improved fitness", Sports 6(3):76.
No URL in `citations.json`.
**Found:** Real, correctly attributed. Crossref `10.3390/sports6030076`; Europe PMC PMID 30087252,
`pubTypeList: ['review-article', 'Review', 'Journal Article']`. Full text read at
https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6162410/
**Quoted:**
> "Recently, several investigators have examined the effects HIFT-based programs after multiple
> weeks of training, and have shown significant improvements in maximal oxygen consumption (~12%)
> [11,12], decreases in body fat (~8%) [11,16], as well as improvements in bone mineral content
> (~1%) [16] after 16-weeks of HIFT."

> "the aims of this paper are to: (1) detail what we believe should constitute HIFT modalities;
> (2) provide a historical perspective … (3) provide differentiation between current
> high-intensity protocols; and (4) examine the application of HIFT training."

**Verdict:** OVERSTATED — this is a **definitional review**, not a 16-week trial; its own 16-week
sentence reports VO2max, body fat and bone mineral content, and does **not** report strength.
The strength half of the claim traces to a *different* paper by the same first author, Feito Y,
Hoffstetter W, Serafini P, Mangine G (2018), "Changes in body composition, bone metabolism,
strength, and skill-specific performance resulting from 16-weeks of HIFT", PLoS ONE 13:e0198324,
DOI `10.1371/journal.pone.0198324` (retrieved via Europe PMC) — and that paper measured 5RM
strength and WOD performance, **not** VO2max:
> "significant performance improvements were noted for all participants in WOD 1 (18.3% ± 16.8%),
> absolute 5RM (14.4% ± 9.7%), relative 5RM (15.4% ± 9.2%), WOD 2 (5.7% ± 6.5%), and WOD 3
> (−17.3% ± 14.7%)."

So no single cited paper shows strength **and** VO2max improving concurrently over 16 weeks.
**Consequence:** `concurrent-strength-maintenance.json` `reference_ids[28]`. This is the only
citation in CSM asserting that the programme's core premise — strength maintained while aerobic
capacity rises — has been demonstrated. Rendered on `/evidence` as a CITED record.
**Class:** data-defect (wrong paper for the empirical half of the claim).

---

### ferrari_2021 — NOT_FOUND

**Cited for:** no `used_for` anywhere — the id survives only as `evidence_refs` / `evidence_ref`
in `exercises.json` (8 sites: `hs_shoulder_taps`, `hs_single_step_attempt` incl. a
`prerequisites[].evidence_ref`, `hs_walk_shuttle_2_3`, `hs_walk_continuous_line`,
`hs_walk_marker_path`, `hs_walk_over_plate`, `hs_walk_through_cones`, `hs_walk_narrow_lane`).
**Claimed:** "Ferrari A, et al." (2021), "Walking initiation biomechanics", Gait & Posture.
No volume, no pages, no DOI, no URL.
**Found:** Nothing matching. Searches run:
- Crossref bibliographic: `Ferrari walking initiation biomechanics Gait and Posture 2021` — top
  hits are Grabowiecki/Hannigan/Strutzenberger/Drew, no Ferrari.
- Europe PMC: `AUTH:"Ferrari A" AND ("gait initiation" OR "walking initiation") AND PUB_YEAR:2021`
  — one hit, a Parkinson's freezing-of-gait trial protocol (PMID 34816053), unrelated.

The nearest real work, and almost certainly what these drills were reaching for, is
**Grabowiecki M, Rum L, Laudani L, Vannozzi G (2021), "Biomechanical characteristics of handstand
walking initiation", Gait & Posture 86:311–318, DOI `10.1016/j.gaitpost.2021.03.036`** (Crossref).
**Verdict:** NOT_FOUND — no such paper retrievable under this byline/title/venue.
**Consequence:** `handstand-walk.json` already retired this id from `evidence_base.references[]`,
replacing it with `yiou_2017` and recording "Replaced ferrari_2021 (unlocatable) 2026-08-18".
**The retirement did not reach `exercises.json` or `citations.json`.** The record is still in the
shared library, so it still renders on `/evidence` to every user of every programme as a real
citation, and eight handstand drills still name it as their evidence — including the level-3
`handstand_hold_static` prerequisite gate on `hs_single_step_attempt`, whose stated
`source: "literature"` currently resolves to nothing.
**Class:** data-defect.

---

### fyfe_2014 — SUPPORTS

**Cited for:** "The definitive interference-mechanism review. Anchors concurrent_strength_prescription."
**Claimed:** Fyfe JJ, Bishop DJ, Stepto NK (2014), "Interference between concurrent resistance and
endurance exercise: molecular bases and the role of individual training variables", Sports Medicine
44:743-762, https://link.springer.com/article/10.1007/s40279-014-0162-1
**Found:** Exact match. Crossref DOI `10.1007/s40279-014-0162-1`, Sports Medicine 44:743-762, 2014,
authors Fyfe Jackson J.; Bishop David J.; Stepto Nigel K. Europe PMC PMID 24728927, pubType Review.
**Quoted:**
> "The present review explores current evidence for the molecular basis of the specificity of
> training adaptation and the concurrent interference phenomenon. Additionally, insights provided
> by molecular and performance-based concurrent training studies regarding the role of individual
> training variables (i.e., within-session exercise order, between-mode recovery, endurance
> training volume, intensity, and modality) in the concurrent interference effect are discussed,
> along with the limitations of our current understanding of this complex paradigm."

**Verdict:** SUPPORTS — review scope matches the `used_for` exactly, including the
"individual training variables" framing.
**Reach note (do not resolve here):** the review's own hedge is load-bearing and is not carried
into the programme copy — "human studies to date have not observed such molecular 'interference'
following acute concurrent exercise that might explain compromised muscle hypertrophy".
**Consequence:** `engine-builder.json` `reference_ids[26]`, warranting
`evidence_base.concurrent_strength_prescription` (the RPE ≤ 7 maintenance cap).
**Class:** needs-credentialed-human (the reach note only).

---

### fyfe_bishop_stepto_2014 — SUPPORTS (duplicate id)

**Cited for:** "Definitive mechanism review + modulators"
**Claimed:** Fyfe JJ, Bishop DJ, Stepto NK (2014), "Interference between concurrent resistance and
endurance exercise", Sports Med 44(6):743-762. No URL.
**Found:** Same DOI `10.1007/s40279-014-0162-1`, same PMID 24728927 as `fyfe_2014` above. Crossref
returns exactly one Fyfe/Bishop/Stepto 2014 Sports Medicine record.
**Quoted:** as `fyfe_2014`.
**Verdict:** SUPPORTS the claim — **but `fyfe_2014` and `fyfe_bishop_stepto_2014` are two ids for
one paper.** Two `citations.json` records, two `/evidence` list entries, one work. The truncated
`fyfe_bishop_stepto_2014` title also drops the subtitle that carries the "individual training
variables" scope.
**Consequence:** `concurrent-strength-maintenance.json` `reference_ids[8]` uses the duplicate;
`engine-builder.json` `reference_ids[26]` uses `fyfe_2014`. `/evidence` prints the same 2014 review
twice under different bylines-of-record, inflating the "N cited studies" count in the page header.
**Class:** data-defect.

---

### fyfe_2016 — MISATTRIBUTED (the CSM record) + OVERSTATED (the volume claim, everywhere)

**Cited for:** three different strings against one id —
- `engine-builder.json`: "Endurance VOLUME (not intensity) drives interference — HIIT and MICT
  produce the same strength decrement at matched work. Cited in progression_rationale for why
  peak-volume weeks tighten the strength cap."
- `engine-builder-block-2.json`: "Endurance VOLUME (not intensity) drives interference. Anchors why
  concurrent-strength cap tightens in Block 2's peak-volume weeks 5-7."
- `concurrent-strength-maintenance.json`: "Endurance INTENSITY does not mediate interference —
  VOLUME does"

**Claimed:** three different bibliographic descriptions against one id —
| where | authors | title | source |
|---|---|---|---|
| `citations.json` | Fyfe JJ, Bishop DJ, **Zacharewicz E**, et al. | Endurance training intensity does not mediate interference… | Front Physiol 7:487 |
| `engine-builder`, `engine-builder-block-2` | Fyfe JJ, Bartlett JD, **Hamilton DL**, et al. | Endurance training intensity does not mediate interference… | Front Physiol 7:487 |
| `concurrent-strength-maintenance` | Fyfe JJ, Bishop DJ, Zacharewicz E, et al. | **Concurrent exercise incorporating high-intensity interval or continuous training modulates mTORC1 signaling and microRNA expression** | Front Physiol 7:487 |

**Found:** **They are two distinct real papers, and the repo has crossed them.** Crossref:

- `10.3389/fphys.2016.00487` — "Endurance Training Intensity Does Not Mediate Interference to
  Maximal Lower-Body Strength Gain during Short-Term Concurrent Training", **Fyfe Jackson J.;
  Bartlett Jonathan D.; Hanson Erik D.; Stepto Nigel K.; Bishop David J.**, *Frontiers in
  Physiology* **7**, 2016. Europe PMC PMID 27857692, pages 487.
- `10.1152/ajpregu.00479.2015` — "Concurrent exercise incorporating high-intensity interval or
  continuous training modulates mTORC1 signaling and microRNA expression in human skeletal muscle",
  **Fyfe Jackson J.; Bishop David J.; Zacharewicz Evelyn; Russell Aaron P.; Stepto Nigel K.**,
  *American Journal of Physiology-Regulatory, Integrative and Comparative Physiology* **310**,
  R1297–R1311, 2016.

**Which record is correct: neither is fully correct, and the answer splits.**
- **Title/venue:** `citations.json`, `engine-builder` and `engine-builder-block-2` are RIGHT.
  Front Physiol 7:487 *is* the "Endurance training intensity does not mediate interference" paper.
  **`concurrent-strength-maintenance.json` is WRONG** — it pairs the mTORC1 paper's title with the
  other paper's journal, volume and page. The mTORC1 paper is in *Am J Physiol Regul Integr Comp
  Physiol* 310:R1297-R1311, not *Front Physiol* 7:487.
- **Authors:** all three are wrong. The correct byline for Front Physiol 7:487 is
  **Fyfe JJ, Bartlett JD, Hanson ED, Stepto NK, Bishop DJ.** `citations.json` and CSM have
  transplanted the mTORC1 byline (Bishop, Zacharewicz); `engine-builder` and `engine-builder-block-2`
  get the first two right and then invent **"Hamilton DL"**, who is on neither paper.

**Quoted** (Europe PMC, DOI `10.3389/fphys.2016.00487`, abstract):
> "Twenty-three recreationally-active males … underwent 8 weeks (3 sessions·wk⁻¹) of either:
> (1) HIT combined with RT (HIT+RT group, n = 8), (2) **work-matched** MICT combined with RT
> (MICT+RT group, n = 7), or (3) RT performed alone (RT group, n = 8)."

> "the magnitude of this change was greater for RT vs. both HIT+RT (7.4 ± 8.7%; ES, 0.40 ± 0.40)
> and MICT+RT (8.2 ± 9.9%; ES, 0.60 ± 0.45)."

> "We conclude that concurrent training incorporating either HIT or work-matched MICT similarly
> attenuates improvements in maximal lower-body strength … **This suggests endurance training
> intensity is not a critical mediator of interference to maximal strength gain during short-term
> concurrent training.**"

**Verdict:**
- **MISATTRIBUTED** for `concurrent-strength-maintenance.json`'s record: the id, title and source
  it carries do not describe one paper.
- **OVERSTATED** for the *shared* substantive claim, in all three programmes. The study supports
  the negative half — intensity is not a critical mediator. It **cannot** support the positive half,
  "VOLUME does". Endurance work was **work-matched across the two concurrent arms by design**, so
  volume was held constant and was never a manipulated variable. Nothing in this trial licenses
  "volume drives interference"; that is an inference from the absence of an intensity effect.
- CSM's `principles[5].detail` — "Fyfe 2016: HIT+RT and MICT+RT produced same strength decrement
  (~0.9% difference)" — is fair (7.4% vs 8.2% attenuation = 0.8 points). The sentence that follows
  it, "Cap total endurance minutes; don't fear intensity per session", is half-supported: the
  don't-fear-intensity half is the finding, the cap-minutes half is not.

**Consequence:** this is the single most load-bearing citation in the batch.
- `engine-builder.json` `reference_ids[27]` → `evidence_base.progression_rationale`.
- `engine-builder-block-2.json` `reference_ids[25]` → `goals.concurrent_strength_policy.rationale`
  ("Fyfe 2016 showed endurance VOLUME (not intensity) drives interference"),
  `phases[4].notes[0]` ("**Lower the RPE cap to 6.5 if any lift feels 8+**" — an actual
  prescription change, warranted by the unsupported half of the claim),
  `immediate_actions[2].reason`, and `evidence_base.concurrent_strength_prescription`.
- `concurrent-strength-maintenance.json` `reference_ids[16]` → `principles[5]`.
- `src/lib/data-integrity.test.ts:1534` already declares `fyfe_2016` in
  `KNOWN_REFERENCE_CONFLICTS`, which **suppresses the failing assertion** rather than fixing it.
  The declaration is accurate as far as it goes but stops at "two different Fyfe 2016 papers"; it
  does not record that the Front Physiol 7:487 identifier belongs to the *intensity* paper, so a
  future editor has no way to tell which record to keep. Note also that the test's author check is
  `firstSurname` only, which is why "Hamilton DL" and "Zacharewicz E" both pass unnoticed.
**Class:** data-defect (the record crossing) + needs-credentialed-human (whether the Block-2
RPE-6.5 tightening survives once "volume drives interference" is withdrawn).

---

### hagerman_1994 — NOT_FOUND

**Cited for:** "Rowing-specific physiology overview"
**Claimed:** Hagerman FC (1994), "Physiology of competitive rowing", Endurance in Sport (Blackwell
Scientific). `url` is a **Google Scholar query string**, not an identifier. Already carries
`verification_status: "unverified"` in the programme record.
**Found:** The container exists — Open Library returns "Endurance in Sport (Encyclopaedia of Sports
Medicine)", Shephard RJ & Åstrand P-O, Blackwell Science, 1994, 656 pp. The **chapter** does not
resolve. Searches run:
- Crossref bibliographic `Hagerman physiology of competitive rowing` — 9 results, nearest are
  "Applied Physiology of Rowing", Sports Medicine 1984, DOI `10.2165/00007256-198401040-00005`,
  and "Energy expenditure during simulated rowing", J Appl Physiol 1978.
- Google Scholar query as stored in the repo — returns one unrelated Mikulic 2009 JSCR article.
- Web search for the book's contents: the *rowing* chapter identified in the 2000 second edition is
  **Secher NH, "Rowing"**, not Hagerman.
- Web search surfaced a secondary claim of a real Hagerman chapter — "The physiology of competitive
  rowing", in Garrett WE Jr & Kirkendall DT (eds), *Exercise and Sport Science*, Lippincott
  Williams & Wilkins, 2000, pp 843–873 — but I could not retrieve a primary record for it and am
  not asserting it.
**Quoted:** nothing retrievable. No abstract, no DOI, no library record for the chapter.
**Verdict:** NOT_FOUND — year, title and container cannot be jointly confirmed for any Hagerman
work. If the intended work is the 1984 Sports Medicine review or the 2000 Lippincott chapter, the
year in the id and the record are both wrong.
**Consequence:** `rowing-2k-test-prep.json` `reference_ids[23]`. It is the programme's only
rowing-specific physiology source — the warrant that a generic threshold/VO2max block transfers to
the 2K erg at all. On `/evidence` this renders as a CITED study whose "link" is a search box.
**Class:** data-defect.

---

### halson_2014 — SUPPORTS

**Cited for:** no `used_for` string (this id appears in no programme `references[]`). Its live use
is in code: `src/lib/engine/proposal-citations.ts:34`,
`day_adjustment_soften: "halson_2014"`, with the in-file rationale "Halson 2014 is the reference
for training-load monitoring as a fatigue-management input — exact fit."
**Claimed:** Halson SL (2014), "Monitoring training load to understand fatigue in athletes",
Sports Medicine 44(Suppl 2):S139-147, https://pubmed.ncbi.nlm.nih.gov/25200666/
**Found:** Exact match. Europe PMC PMID 25200666, DOI `10.1007/s40279-014-0253-z`, Sports Medicine
44 Suppl 2, S139-47, 2014, Halson SL, pubType Review. The stored PubMed URL resolves to this paper.
**Quoted:**
> "Appropriate load monitoring can aid in determining whether an athlete is adapting to a training
> program and in minimizing the risk of developing non-functional overreaching, illness, and/or
> injury."

> "Other monitoring tools used by high-performance programs include heart rate recovery,
> neuromuscular function, biochemical/hormonal/immunological assessments, questionnaires and
> diaries, psychomotor speed, and sleep quality and quantity."

**Verdict:** SUPPORTS — the review is squarely about using monitoring data (including diaries and
subjective questionnaires, which is what Terav's morning check is) as a fatigue-management input.
**Reach note (do not resolve here):** Halson's own caveat cuts against treating any single marker
as decisive — "very few of these markers have strong scientific evidence supporting their use, and
there is yet to be a single, definitive marker described in the literature" — and the population
throughout is athletes in high-performance programmes, not general users. The app's use is
directionally the same but is a hardcoded threshold on a self-report score.
**Consequence:** the highest-traffic safety path in the app. `citationIdForKind("day_adjustment_soften")`
returns this id; `src/components/workout/ProposalCard.tsx:150` renders `<CitationRef id=…>` under
the amber-bordered card whose eyebrow is "Fatigue or pain flagged today"
(`ProposalCard.tsx:196`, `:244`). This is the study a first-time user sees when the app proposes
softening a session. It is a correct record.
**Class:** needs-credentialed-human (reach note only).

---

### helgerud_2007 — SUPPORTS, with one attribution defect in CSM

**Cited for:** four programmes —
- `engine-builder`: "The Norwegian 4x4 protocol itself. Cited in the outcome_evidence range and in
  block_norwegian_4x4 rationale."
- `engine-builder-block-2`: "Norwegian 4×4 protocol. Block 2 uses it every other week…"
- `concurrent-strength-maintenance`: "The 4×4 protocol; +7.2% VO2max in 8 wk"
- `rowing-2k-test-prep`: "The 4×4 protocol; VO2max response reference"

**Claimed:** Helgerud J, Høydal K, Wang E, et al. (2007), "Aerobic high-intensity intervals improve
VO2max more than moderate training", MSSE 39(4):665-671,
https://pubmed.ncbi.nlm.nih.gov/17414804/
**Found:** Exact match. Europe PMC PMID 17414804, DOI `10.1249/mss.0b013e3180304570`, MSSE 39:665-671,
2007, pubType Randomized Controlled Trial. Stored PMID resolves correctly.
**Quoted:**
> "Forty healthy, nonsmoking, **moderately trained male subjects** were randomly assigned to one of
> four groups: 1) long slow distance (70% maximal heart rate; HRmax); 2) lactate threshold (85%
> HRmax); 3) 15/15 interval running…; and 4) 4 × 4 min of interval running (4 min of running at
> 90-95% HRmax followed by 3 min of active resting at 70% HRmax). All four training protocols
> resulted in similar total oxygen consumption and were performed 3 d·wk for 8 wk."

> "The percentage increases for the 15/15 and 4 × 4 min groups were 5.5 and **7.2%**… SV increased
> significantly by approximately 10% after interval training (P<0.05)."

**Verdict:** SUPPORTS. The +7.2%/8 wk figure, the 3 d·wk dose, the +10% stroke volume, the 4-min /
3-min work:rest ratio, and the "only the interval groups moved SV" claim in
`engine-builder.json /evidence_base/physiological_targets[2]` all match the retrieved abstract.
Engine-builder's `outcome_by_tier.dose_calibration_note` correctly discloses that the app ships one
hard session where Helgerud used three.

**But one attribution is wrong.** `concurrent-strength-maintenance.json`
`/evidence_base/session_rationale/why_norwegian_4x4` reads "Helgerud 2007 4×4 protocol delivered
+7.2% VO2max at 3×/wk × 8wk **in soccer players**." The retrieved abstract says "forty healthy,
nonsmoking, moderately trained male subjects". No soccer cohort. (Helgerud has a separate,
well-known soccer study; this is not it.)

**Reach note (do not resolve here):** all 40 subjects were male and moderately trained, with
baseline VO2max 55.5–60.5 ml·kg⁻¹·min⁻¹. Terav applies the protocol to strength-trained novices and
to rowers of any sex. Engine-builder's own tiering acknowledges headroom differences; the sex
restriction is nowhere disclosed.
**Consequence:** `engine-builder` `reference_ids[2]` anchors the shipped `block_norwegian_4x4`
session and the `outcome_evidence` +5-12% VO2max projections; `engine-builder-block-2`
`reference_ids[2]` and `physiological_targets[1]`/`[4]`; CSM `reference_ids[0]` and
`phases[1].rationale`; `rowing-2k-test-prep` `reference_ids[0]`.
**Class:** data-defect (the "soccer players" line) + needs-credentialed-human (population reach).

---

### henry_1968 — NOT_FOUND

**Cited for:** four programmes —
- `first-strict-pullup`: "Specificity hypothesis: motor abilities are task-specific. Anchors the
  per-capability drill selection at each capability's own level."
- `handstand-walk`: "…Underpins the sub-skill-independence principle and the multi_dimensional
  generation strategy itself."
- `muscle-up`: "Specificity hypothesis. Anchors per-capability drill selection. Also justifies the
  deliberate separation of strict vs kipping muscle-up."
- `rowing-2k-test-prep`: "Task-specificity foundation"

**Claimed:** Henry FM (1968), "Specificity vs generality in learning motor skill", Classical Studies
on Physical Activity. No URL, no DOI, no pages.
**Found:** A bibliographic record only. SciRP reference index:
> "Henry, F. M. (1968). Specificity vs. Generality in Learning Motor Skill. In R. C. Brown, & G. S.
> Kenyon (Eds.), Classical Studies on Physical Activity (pp. 331-340). Englewood Cliffs, NJ
> Prentice Hall."
(https://www.scirp.org/reference/referencespapers?referenceid=2109484) — this confirms author,
year, title, editors, publisher and page range, and indicates the piece was originally published in
1958 and reprinted in the 1968 collection. **No abstract, no full text, no indexed record.** Not in
Crossref, not in Europe PMC, not in PubMed (a 1968 Prentice-Hall book chapter would not be).
**Quoted:** nothing from the work itself. Everything I could retrieve is the citation string.
**Verdict:** NOT_FOUND — existence and attribution are confirmed; **content is not verified.**
Per the standing rule, "the title says specificity" is not evidence that the paper supports a
specificity hypothesis, and I will not assert it. This is the honest state: real reference,
unreadable claim.
**Consequence:** the single most structural citation in the batch. It is the stated warrant for
Terav's *architecture*, not just a prescription — per-capability independent drill selection in
`first-strict-pullup` and `muscle-up`, the `multi_dimensional` generation strategy in
`handstand-walk`, and the deliberate split of strict vs kipping muscle-up. If the specificity
warrant is wanted as *citable*, it needs a retrievable source; a reprint of a 1958 chapter with no
online text cannot function as one in an app whose landing promise is "every change cites a study".
**Class:** data-defect (unverifiable citation carrying a structural claim).

---

### hickson_1980 — SUPPORTS as scoped in `references[]`; OVERSTATED in the engine-builder prose

**Cited for:**
- `engine-builder`: "The concurrent-training interference effect — foundation for the strength
  maintenance-only recommendation."
- `engine-builder-block-2`: "Original interference-effect data. Same rules as Block 1, tighter
  monitoring."

**Claimed:** Hickson RC (1980), "Interference of strength development by simultaneously training for
strength and endurance", Eur J Appl Physiol 45(2-3):255-263,
https://pubmed.ncbi.nlm.nih.gov/7193134/
**Found:** Exact match. Europe PMC PMID 7193134, DOI `10.1007/bf00421333`, Eur J Appl Physiol Occup
Physiol 45:255-263, 1980. Stored PMID resolves correctly.
**Quoted:**
> "There were three exercise groups: a strength group (S)… an endurance group (E)… and an S and E
> group that performed the same daily exercise regimens as the S and E groups."

> "The rate of strength improvement by the S and E group was similar to the S group for the first 7
> weeks of training, but subsequently leveled off and declined during the 9th and 10th weeks. These
> findings demonstrate that simultaneously training for S and E will result in a reduced capacity to
> develop strength, but will not affect the magnitude of increase in VO2max."

**Verdict:** SUPPORTS both `used_for` strings as written — this is the original interference data
and it is the correct foundation for "don't chase strength PRs during an aerobic block".

**However**, `engine-builder.json /goals/concurrent_strength_policy/rationale` states: "Hickson
(1980) showed strength gains are attenuated by concurrent endurance training **in proportion to
endurance volume**." That is OVERSTATED. The design has one combined group at one endurance dose;
there is no volume gradient and therefore no dose-response finding. The proportionality claim is
imported from elsewhere and attributed to Hickson.
**Reach note (do not resolve here):** the endurance dose was 40 min·day⁻¹ **six days a week** for
10 weeks, alongside 5 d·wk strength work. That is far above what Terav prescribes; the interference
this study demonstrates is at a dose most users will never approach.
**Consequence:** `engine-builder` `reference_ids[4]` and `engine-builder-block-2`
`reference_ids[23]`. It is the warrant for the maintenance-only strength policy that both blocks
impose on every user.
**Class:** data-defect (the "in proportion to endurance volume" phrase) + needs-credentialed-human
(dose reach).

---

### impey_2018 — OVERSTATED

**Cited for:**
- `engine-builder`: "Carbohydrate periodisation — fuel resistance and hard interval sessions fully;
  easy Z2 can be lower-carb. Cited in concurrent_strength_prescription."
- `engine-builder-block-2`: "Fuel resistance sessions fully — Block 2's higher volume tightens the
  fuel-for-work-required framework."
- `concurrent-strength-maintenance`: "Fuel-for-work framework for concurrent programming"

**Claimed:** Impey SG, Hearris MA, Hammond KM, et al. (2018), "Fuel for the work required: a
theoretical framework for carbohydrate periodization and the glycogen threshold hypothesis",
Sports Medicine 48:1031-1048, https://link.springer.com/article/10.1007/s40279-018-0867-7
**Found:** Exact match. Europe PMC PMID 29453741, DOI `10.1007/s40279-018-0867-7`, Sports Medicine
48:1031-1048, 2018, Impey SG, Hearris MA, Hammond KM, Bartlett JD, Louis J, Close GL, Morton JP.
**Quoted:**
> "Deliberately training with reduced carbohydrate (CHO) availability to enhance
> **endurance-training-induced** metabolic adaptations of skeletal muscle…"

> "We also present the 'fuel for the work required' paradigm… whereby CHO availability is adjusted
> in accordance with the demands of the upcoming training session(s)."

> "Nonetheless, such muscle adaptations do not always translate to improved exercise performance
> (e.g. 37 and 63% of 11 studies show improvements or no change, respectively)."

**Verdict:** OVERSTATED. The paradigm and the easy-session-lower-carb half are directly supported.
Two gaps:
1. **Resistance training is outside the paper's scope.** Every train-low model listed (twice-daily,
   fasted, post-exercise CHO restriction, sleep-low) is an *endurance* protocol, and the outcome
   measures are oxidative enzymes and endurance performance. "Fuel resistance sessions fully" is a
   sensible extrapolation, not a finding of this paper. CSM's "fuel-for-work framework **for
   concurrent programming**" attributes a concurrent-training application the paper does not make.
2. The programme copy does not carry the paper's own performance caveat (63% of studies showed no
   performance change), which is the reason the authors frame it as a *hypothesis*.
**Consequence:** `engine-builder` `reference_ids[32]` → `evidence_base.concurrent_strength_prescription`
(fuelling guidance shown as part of the strength-maintenance prescription);
`engine-builder-block-2` `reference_ids[30]`; CSM `reference_ids[22]`.
**Class:** needs-credentialed-human (extrapolation from endurance to concurrent/resistance fuelling
is a judgement, and it is a nutrition judgement at that).

---

### jager_2017 — SUPPORTS

**Cited for:** "1.4-2.0 g/kg/day for exercising individuals"
**Claimed:** Jäger R, Kerksick CM, Campbell BI, et al. (2017), "International Society of Sports
Nutrition position stand: protein and exercise", J Int Soc Sports Nutr 14:20. No URL.
**Found:** Exact match. Europe PMC PMID 28642676, DOI `10.1186/s12970-017-0177-8`, J Int Soc Sports
Nutr 14:20, 2017, 22 authors beginning Jäger R, Kerksick CM, Campbell BI.
**Quoted:**
> "For building muscle mass and for maintaining muscle mass through a positive muscle protein
> balance, an overall daily protein intake in the range of **1.4–2.0 g protein/kg body weight/day
> (g/kg/d) is sufficient for most exercising individuals**, a value that falls in line within the
> Acceptable Macronutrient Distribution Range published by the Institute of Medicine for protein."

**Verdict:** SUPPORTS — the `used_for` is a near-verbatim restatement of the position statement.
**Status note:** this is a position stand and a candidate for `SUPERSEDED` in principle, but I found
no retrievable ISSN protein position-stand update, so I am not claiming one. Verdict stands as
SUPPORTS on retrieved text.
**Consequence:** `concurrent-strength-maintenance.json` — the record is in
`evidence_base.references[]` but the id is **not** in CSM's `reference_ids[]` and does not appear in
any prescription string in the file. It underwrites nutrition guidance that the programme carries
elsewhere (`engine-builder-block-2` states a 1.6 g/kg floor citing Morton 2018, not this).
**Class:** none — clean.

---

### joyner_coyle_2008 — OVERSTATED

**Cited for:** three programmes —
- `concurrent-strength-maintenance`: "Threshold > VO2max as primary metric to track"
- `rowing-2k-test-prep`: "Threshold > VO2max as primary metric to track"
- `engine-builder-block-2`: "VO2max plateaus; threshold and running economy keep improving. Anchors
  why Block 2's headline metric is threshold shift, not VO2max."

**Claimed:** Joyner MJ, Coyle EF (2008), "Endurance exercise performance: the physiology of
champions", J Physiol 586(1):35-44. No URL in `citations.json`.
**Found:** Exact match. Europe PMC PMID 17901124, DOI `10.1113/jphysiol.2007.143834`, J Physiol
586:35-44, 2008, pubType Review. **Full text retrieved and read** (10-page publisher PDF,
https://paulogentil.com/pdf/Endurance%20exercise%20performance%20-%20the%20physiology%20of%20champions.pdf,
49,577 characters of extracted text).

**On the WHICH-METRIC claim.** The paper does not rank the three determinants. It multiplies them:
**Quoted:**
> "The concepts above and in Fig. 2 suggest that V̇O2,max and lactate threshold **interact** to
> determine how long a given rate of aerobic and anaerobic metabolism can be sustained (i.e.
> performance V̇O2) and efficiency then determines how much speed or power (i.e. performance
> velocity) can be achieved at a give amount of energy consumption."

> "marathon running speed was essentially predicted by the equation: V̇O2,max × lactate threshold
> percentage × running economy"

> "For endurance sports three main factors — maximal oxygen consumption (V̇O2,max), the so-called
> 'lactate threshold' and efficiency … appear to play key roles in endurance performance."
(abstract)

The nearest thing to support for prioritising threshold is a trainability statement about the
threshold's substrate:
> "While the physiological determinants of the lactate threshold are extremely complex, they are
> determined mainly by the oxidative capacity of the skeletal muscle… This capacity is **highly
> plastic** and can essentially increase more than twofold in the trained skeletal muscle of humans
> or animals who engage in 20–120 min of training at a requisite intensity."

**On the "VO2max plateaus" claim.** The word "plateau" **does not occur anywhere in the paper**
(`grep -io "plateau" → 0 matches` across the full extracted text). I found no statement that VO2max
stops responding to training while threshold continues. What the paper does say about continued
improvement concerns *efficiency*, not threshold:
> "these case reports suggest that muscular efficiency and running economy might indeed improve
> with continued endurance training at a rate of approximately **1–3% per year**."

**On numeric magnitude of threshold change.** As instructed, checked specifically: the paper
contains **no** trainability figure for lactate threshold — no percentage, no time course. The only
numeric change figures in the paper are the efficiency case reports above (14% over 5 years,
Jones 2006; 8% over 7 years, Coyle 2005) and the >twofold oxidative-capacity figure. **None of
these is a threshold-shift magnitude and none may be read as one.**

**Verdict:** OVERSTATED.
- "Threshold IS the primary trainable metric" / "threshold > VO2max" — the paper supports
  *threshold is highly trainable* and *threshold is one of three co-determinants*. It does not
  rank threshold above VO2max, and it does not frame either as a metric to *track*. The programme
  claim is a reasonable coaching inference dressed as a finding.
- "VO2max plateaus" (`engine-builder-block-2`) is **MISATTRIBUTED** in substance — not in the paper.
- The instructed guard is **partly already honoured and partly not**:
  - `rowing-2k-test-prep.json` is **clean and exemplary**. `principles[2].detail` and
    `evidence_base.session_rationale.why_threshold` both state "NO NUMERIC TARGET is attached to
    it", record that the 3–6% figure was withdrawn on 2026-09-05, and name the reason. Nothing to
    fix there.
  - **`engine-builder-block-2.json` still violates it.**
    `/evidence_base/physiological_targets[0]`: "Threshold (LT2 / MLSS) pace / power shift **+2-5%
    over 8-12 weeks** — the biggest single lever for 20-90 min endurance performance
    **(Joyner & Coyle 2008)**." The citation sits directly on a sentence carrying a numeric
    magnitude the paper does not contain. `/evidence_base/outcome_evidence` repeats the ranges
    (+2-5% / +3-6% / +2-4% by tier) without a citation, but in a file where Joyner is the declared
    anchor for threshold. Same pattern, same paper, one file behind the rowing fix.
- `engine-builder-block-2` `/goals/modality_policy/cross_modal` cites Joyner for "specificity of
  adaptation" — that concept is not in this paper either.

**Consequence:** `engine-builder-block-2` `reference_ids[5]` is the anchor for the entire block's
**headline metric** (`principles[1]`, `physiological_targets[0]`, `session_rationale.block_threshold_cruise`,
`outcome_evidence`) — i.e. what the block claims it will move and by how much.
`concurrent-strength-maintenance` `reference_ids[3]` warrants `phases[2].rationale`, which
substitutes submax HR at fixed pace as a "threshold-shift proxy". `rowing-2k-test-prep`
`reference_ids[2]`.
**Class:** data-defect (the +2-5% attribution and the "VO2max plateaus" line in Block 2) +
needs-credentialed-human (whether threshold-first is the right primary metric — it may well be;
Joyner & Coyle is just not the paper that says so).

---

### karni_1998 — SUPPORTS

**Cited for:** four programmes —
- `first-strict-pullup`: "Fast (within-session) and slow (across-session) learning phases. Anchors
  the daily-short-beats-long claim and the grease-the-groove pattern."
- `handstand-walk`: "Fast (within-session) vs slow (across-session) motor learning. M1 remapping
  over ~3 weeks. Underpins the daily-short-sessions design."
- `muscle-up`: "…Anchors daily-short-beats-long."
- `overhead-mobility`: "Fast vs slow motor learning; consolidation window"

**Claimed:** Karni A, Meyer G, Rey-Hipolito C, et al. (1998), "The acquisition of skilled motor
performance: fast and slow experience-driven changes in primary motor cortex", PNAS 95(3):861-868.
No URL.
**Found:** Exact match. Europe PMC PMID 9448252, DOI `10.1073/pnas.95.3.861`, PNAS 95:861-868, 1998,
Karni A, Meyer G, Rey-Hipolito C, Jezzard P, Adams MM, Turner R, Ungerleider LG.
**Quoted:**
> "We propose that skilled motor performance is acquired in several stages: '**fast**' learning, an
> initial, within-session improvement phase, followed by a period of **consolidation** of several
> hours duration, and then '**slow**' learning, consisting of delayed, incremental gains in
> performance emerging after continued practice."

> "**a few minutes of daily practice** on a sequential finger opposition task induced large,
> incremental performance gains over a few weeks of training."

> "functional MRI data showing that a more extensive representation of the trained sequence emerged
> in primary motor cortex after **3 weeks** of training."

**Verdict:** SUPPORTS — every element of every `used_for` string maps onto retrieved sentences:
fast/slow phases, the consolidation window, ~3-week M1 remapping, and "a few minutes of daily
practice" for the daily-short-sessions design.
**Reach note (do not resolve here):** the task is **sequential finger opposition**, a low-load
fine-motor sequence learned in an fMRI scanner. Terav applies the phase structure to handstand
walking, pull-ups, muscle-ups and overhead mobility — gross, load-bearing, fatigue-limited skills
where session frequency is constrained by tissue recovery rather than by consolidation. The paper's
own finding that gains "did not generalize to the contralateral hand nor to a matched sequence of
identical component movements" is worth noting for `handstand-walk`'s sub-skill-independence
principle: it cuts the same way, which strengthens the case, but it is a finger-sequence result.
**Consequence:** four programmes' session-frequency architecture — the "daily short beats weekly
long" design and `first-strict-pullup`'s grease-the-groove pattern.
**Class:** needs-credentialed-human (reach only).

---

### kerwin_trewartha_2001 — SUPPORTS

**Cited for:** "Wrist-torque-dominated balance strategy (analogous to ankle strategy in upright
stance). Underpins the fingertip-tap drill and belly-to-wall balance-search rationale."
**Claimed:** Kerwin DG, Trewartha G (2001), "Strategies for maintaining a handstand in the
anterior-posterior direction", MSSE 33(7):1182-1188. No URL.
**Found:** Exact match. Europe PMC PMID 11445766, DOI `10.1097/00005768-200107000-00016`, MSSE
33:1182-1188, 2001.
**Quoted:**
> "In a number of trials, **wrist torque played a dominant role** in accounting for CM variance.
> Ostensibly, superior handstand balances are characterized by important contributions from wrist
> torques and shoulder torques with little influence from hip torques. In contrast, hip torques
> were found to be increasingly influential in less successful balances."

> "there appears to be two joint involvement strategies, which **supports similar findings from
> postural research on normal upright stance**."

**Verdict:** SUPPORTS — including the "analogous to ankle strategy in upright stance" parenthetical,
which the authors themselves draw. The wrist-dominant/hip-dominant contrast is also a direct warrant
for coaching toward wrist correction rather than hip piking.
**Reach note (do not resolve here):** **N = 6 handstand balances**, inverse-dynamics analysis, and
the abstract does not state the participants' skill level in the retrieved text. Terav applies it
to novice handstand-walk users whose balances are, by the paper's own classification, the "less
successful" hip-dominant kind. A corroborating 2025 systematic review retrieved in the same search
(MacDonald M et al., Front Sports Act Living 7:1694648, PMID 41473027) reports the same conclusion
across 21 studies — "gymnasts minimize problems related to disturbed balance during the handstand
using a 'wrist strategy'… If the 'wrist strategy' fails, then the wrists, shoulders, hips, and
elbows are utilized" — so the finding has replicated; it is not SUPERSEDED, it is confirmed.
**Consequence:** `handstand-walk.json` `evidence_base.references[]`, plus four `exercises.json`
`evidence_refs` entries (`hs_fingertip_taps`, `hs_wall_kickup_hold`, one belly-to-wall drill, and
`hs_walk_narrow_lane`).
**Class:** needs-credentialed-human (sample-size reach only).

---

### kibler_2013 — MISATTRIBUTED (one id, two different real papers)

**Cited for:** three programmes, two of which describe a different paper than `citations.json` —
- `first-strict-pullup`: "Scapular dyskinesis and its role in overhead / hang loading. Supports the
  shoulder-prep-before-every-session rule." — record given as **Kibler WB, Ludewig PM, McClure PW,
  Michener LA, Bak K, Sciascia AD (2013), "Clinical implications of scapular dyskinesis in shoulder
  injury: the 2013 consensus statement", BJSM 47(14):877-885**
- `muscle-up`: "Scapular dyskinesis pattern in overhead / hang loading. Anchors the
  shoulder-prep-before-every-session rule." — same 2013 record
- `overhead-mobility`: "**SICK scapula screening pattern.** Year corrected from 2013 → 2010 per
  review…" — record given as **Kibler WB, Sciascia A (2010), "Current concepts: scapular
  dyskinesis", BJSM 44(5):300-305**, `verification_status: "unverified"`, `url` = a **PubMed search
  query string**

**Claimed:** `citations.json` carries the **2010** paper under the id `kibler_2013`, with a
`review_note` explaining the id was kept "for stability of downstream references".
**Found:** **Both papers are real, distinct, and correctly described where they appear.**
- Europe PMC PMID 19996329, DOI `10.1136/bjsm.2009.058834` — Kibler WB, Sciascia A, "Current
  concepts: scapular dyskinesis", BJSM **44**:300-305, **2010**.
- Europe PMC PMID 23580420, DOI `10.1136/bjsports-2013-092425` — Kibler WB, Ludewig PM, McClure PW,
  Michener LA, Bak K, Sciascia AD, "Clinical implications of scapular dyskinesis in shoulder
  injury: the 2013 consensus statement from the 'Scapular Summit'", BJSM **47**:877-885, **2013**,
  pubType Consensus Statement.

**Quoted** (2013 consensus, the one `first-strict-pullup` and `muscle-up` describe):
> "Major conclusions were (1) scapular dyskinesis is present in a high percentage of most shoulder
> injuries; (2) **the exact role of the dyskinesis in creating or exacerbating shoulder dysfunction
> is not clearly defined**; … (4) scapular dyskinesis is most aptly viewed as a **potential
> impairment** to shoulder function; … (7) rehabilitation programmes to restore scapular position
> and motion can be effective **within a more comprehensive shoulder rehabilitation programme**."

**Quoted** (2010 current concepts, the one `citations.json` and `overhead-mobility` describe):
> "it appears that scapular dyskinesis is a **non-specific response to a painful condition in the
> shoulder** rather than a specific response to certain glenohumeral pathology."

> "An examination consisting of visual inspection of the scapular position at rest and during
> dynamic humeral movements, along with the performance of objective posture measurements and
> scapular corrective maneuvers, will help the clinician ascertain the extent to which the scapula
> is involved in the shoulder injury."

**Verdict:** MISATTRIBUTED — **one id resolving to two different papers is the defect**, regardless
of which is "right". A reader who taps the source line under a pull-up shoulder-prep rule is shown
the 2010 paper on `/evidence` while the programme's own record describes the 2013 consensus. The
`review_note` explicitly chose id stability over correctness; the cost of that choice is that the
id now silently disagrees with two of the three programmes that use it.

Two substantive problems on top of the id collision:
1. **"SICK scapula screening pattern" is not in the retrieved 2010 abstract.** The abstract
   describes a scapular-dyskinesis examination (rest position, dynamic motion, posture measures,
   corrective manoeuvres) and never uses the term. The full text was not reachable — BMJ returned a
   5.6 KB interstitial for both `/content/44/5/300` and `/content/44/5/300.long`, and the paper is
   not in PMC — so I cannot exclude the term appearing in the body, but I cannot confirm it either.
   "SICK scapula" is a distinct named syndrome from a different paper; the overhead-mobility record
   already flags itself `verification_status: "unverified"`, and it should stay flagged.
2. **The overhead/hang-loading and prophylactic-prep reach is not supported by either paper.**
   Both are about *injured* shoulders. The 2013 consensus explicitly declines to establish a causal
   role ("not clearly defined"; "potential impairment") and endorses rehabilitation only "within a
   more comprehensive shoulder rehabilitation programme". Neither paper studies hang loading, and
   neither supports mandatory scapular prep for asymptomatic trainees. That specific `used_for`
   sentence is OVERSTATED even where the id resolves correctly.

**Consequence:** `first-strict-pullup.json` and `muscle-up.json` — this is the cited warrant for the
**shoulder-prep-before-every-session rule**, i.e. a mandatory block prepended to every session in
two shipping programmes. `overhead-mobility.json` — the SICK-scapula screening pattern.
On `/evidence` the 2010 record renders with a link that is a **PubMed search query**, not a
paper URL (`src/app/evidence/page.tsx:100-111` renders `c.url` as a "link" anchor).
**Note for whoever fixes this:** `data-integrity.test.ts`'s title-overlap check does not catch this
pair. `titleWords` overlap for "Clinical implications of scapular dyskinesis in shoulder injury…"
vs "Current concepts: scapular dyskinesis" is exactly 2/4 = 0.50, and the threshold is `< 0.5`.
It passes by one word. The first-author check passes too, since both are Kibler.
**Class:** data-defect (id collision, search-string URL) + needs-credentialed-human (whether
mandatory scapular prep for asymptomatic users is warranted at all — that is a clinical call).

---

### kilding_2012 — NOT_FOUND

**Cited for:** "MLSS validity for threshold prescription"
**Claimed:** Kilding AE, Winter EM, Fysh M (2012), "Investigation of the maximal lactate steady
state (MLSS) in trained runners", Int J Sports Med 33(1):11-16. `url` is a **PubMed search query
string**; already carries `verification_status: "unverified"`.
**Found:** No such paper. Searches run, all negative:
- Europe PMC `AUTH:"Kilding AE" AND "lactate steady state"` — one hit, **Kilding AE, Jones AM
  (2005), "Validity of a single-visit protocol to estimate the maximum lactate steady state", MSSE
  37:1734-1740, PMID 16260974**. Different year, different journal, different co-author.
- Europe PMC `"maximal lactate steady state" AND "trained runners"` — nothing by Kilding.
- Europe PMC / PubMed `maximal lactate steady state AND Kilding` — **empty result set.**
- PubMed `Kilding[Author] AND 2012[dp]` — 7 records, listed in full below. **None is an MLSS study.**
  The only IJSM one is 22377939, "Effect of hyperoxic-supplemented interval training on endurance
  performance in trained cyclists", Int J Sports Med **33**:359-63.
- PubMed enumeration of **Int J Sports Med vol 33, issue 1** — 13 records, page ranges 1-7, 8-12,
  13-17, 18-25, 26-30, 31-5, 36-42, 43-7, 48-52, 53-7, 58-66, 67-75, 76-80. **There is no article
  at pages 11-16 in that issue** — the claimed page range straddles two real articles and matches
  neither. No Kilding paper in the issue.
- Crossref bibliographic `Kilding Winter Fysh maximal lactate steady state trained runners
  International Journal of Sports Medicine` — the real Kilding/Winter/Fysh IJSM paper is
  **"A Comparison of Pulmonary Oxygen Uptake Kinetics in Middle- and Long-Distance Runners", IJSM
  27:419-426, 2006, DOI `10.1055/s-2005-865778`** — right author trio, right journal, wrong year,
  wrong volume, wrong topic.

**Quoted:** nothing. The work does not exist as described.
**Verdict:** NOT_FOUND — and this one is worse than an unlocatable book chapter: the volume, issue
and page range are specific enough to be checked, and they are demonstrably wrong. A real
author-trio has been attached to a title and a locator that do not go together.
**Consequence:** `rowing-2k-test-prep.json` `reference_ids[28]`. It is the programme's only cited
warrant that **MLSS is a valid basis for threshold prescription** — the methodological floor under
the whole threshold-first design that `joyner_coyle_2008` supplies the rationale for. Both of the
rowing programme's threshold citations are now in question from opposite directions: this one does
not exist, and Joyner does not say what it is cited for. Renders on `/evidence` as a CITED study
with a search-box "link".
**Class:** data-defect.

---

## Summary

| id | verdict | class |
|---|---|---|
| feito_2018 | OVERSTATED | data-defect |
| ferrari_2021 | NOT_FOUND | data-defect |
| fyfe_2014 | SUPPORTS (duplicate of `fyfe_bishop_stepto_2014`) | data-defect (duplication only) |
| fyfe_2016 | MISATTRIBUTED (CSM record) + OVERSTATED (volume claim, all three) | data-defect + needs-credentialed-human |
| fyfe_bishop_stepto_2014 | SUPPORTS (duplicate of `fyfe_2014`) | data-defect (duplication only) |
| hagerman_1994 | NOT_FOUND | data-defect |
| halson_2014 | SUPPORTS | needs-credentialed-human (reach) |
| helgerud_2007 | SUPPORTS | data-defect ("soccer players") + needs-credentialed-human (reach) |
| henry_1968 | NOT_FOUND (exists bibliographically; content unretrievable) | data-defect |
| hickson_1980 | SUPPORTS as scoped; OVERSTATED in `concurrent_strength_policy.rationale` | data-defect + needs-credentialed-human |
| impey_2018 | OVERSTATED | needs-credentialed-human |
| jager_2017 | SUPPORTS | — |
| joyner_coyle_2008 | OVERSTATED | data-defect + needs-credentialed-human |
| karni_1998 | SUPPORTS | needs-credentialed-human (reach) |
| kerwin_trewartha_2001 | SUPPORTS | needs-credentialed-human (reach) |
| kibler_2013 | MISATTRIBUTED | data-defect + needs-credentialed-human |
| kilding_2012 | NOT_FOUND | data-defect |

**4 clean · 5 SUPPORTS-with-reach-note · 4 OVERSTATED · 2 MISATTRIBUTED · 4 NOT_FOUND.**
(`fyfe_2014` / `fyfe_bishop_stepto_2014` counted once each; `fyfe_2016` counted as MISATTRIBUTED.)

### Answers to the two flagged questions

**Are the three Fyfe ids three distinct works?** No — **two works across three ids.**
`fyfe_2014` and `fyfe_bishop_stepto_2014` are the same Sports Medicine 2014 review (DOI
`10.1007/s40279-014-0162-1`), duplicated. `fyfe_2016` is a third id pointing at a real but
differently-described 2016 study.

**Which `fyfe_2016` record is correct?** Title and venue: **`citations.json` and the two
engine-builder files are correct** — Front Physiol 7:487 is "Endurance training intensity does not
mediate interference…". **`concurrent-strength-maintenance.json` is wrong**; it has pinned the
mTORC1 paper's title (a real paper, but in *Am J Physiol Regul Integr Comp Physiol* 310:R1297-R1311)
onto the intensity paper's journal/volume/page. Authors: **all three records are wrong.** The
correct byline is Fyfe JJ, Bartlett JD, **Hanson ED**, Stepto NK, Bishop DJ — not "Hamilton DL"
(engine-builder ×2), not "Bishop DJ, Zacharewicz E" (citations.json, CSM).

**Does `joyner_coyle_2008` support the WHICH-METRIC claim?** Only weakly, and not as stated. Full
text read; the paper models the three determinants **multiplicatively** and ranks none. It supports
"the lactate threshold's substrate is highly plastic"; it does not support "threshold > VO2max as
the primary metric to track", and it contains **no** threshold-shift magnitude of any kind — the
word "plateau" does not appear in it. `rowing-2k-test-prep.json` has already withdrawn its numeric
attribution and is clean. **`engine-builder-block-2.json /evidence_base/physiological_targets[0]`
has not**: it still attaches "+2-5% over 8-12 weeks" to a sentence ending "(Joyner & Coyle 2008)".

---

## Claims now unsupported

Every programme assertion below stands on a citation that is not `SUPPORTS`. Listed as claims, not
as fixes. A human decides what happens to them.

1. **"Endurance VOLUME (not intensity) drives interference."**
   `engine-builder-block-2` `goals.concurrent_strength_policy.rationale`,
   `immediate_actions[2].reason`, `evidence_base.concurrent_strength_prescription`;
   `engine-builder` `evidence_base.progression_rationale`; CSM `principles[5]`.
   Fyfe 2016 work-matched the endurance arms; volume was never varied. Only the *intensity* half is
   supported. **Downstream prescription:** `engine-builder-block-2 phases[4].notes[0]` — "Lower the
   RPE cap to 6.5 if any lift feels 8+" in peak-volume weeks 5-7.

2. **"Threshold (LT2 / MLSS) pace / power shift +2-5% over 8-12 weeks (Joyner & Coyle 2008)."**
   `engine-builder-block-2` `evidence_base.physiological_targets[0]`, and the tiered ranges in
   `evidence_base.outcome_evidence`. No threshold-change magnitude exists in that paper. This is
   the same defect `rowing-2k-test-prep` closed on 2026-09-05 against `astorino_2013`; Block 2 has
   the same shape of error against a different citation.

3. **"VO2max plateaus; threshold and running economy keep improving."**
   `engine-builder-block-2` `evidence_base.references[5].used_for`, and the framing of
   `principles[1]`. The word "plateau" does not occur in Joyner & Coyle 2008.

4. **"Threshold > VO2max as primary metric to track."**
   CSM `evidence_base.references[3].used_for` and `phases[2].rationale`; `rowing-2k-test-prep`
   `principles[2]` and `session_rationale.why_threshold`. The paper ranks nothing. The programme's
   choice may be right; this citation does not establish it.

5. **"Specificity of adaptation" for the cross-modal substitution rule.**
   `engine-builder-block-2` `goals.modality_policy.cross_modal`. Not a concept addressed in
   Joyner & Coyle 2008.

6. **"MLSS validity for threshold prescription."**
   `rowing-2k-test-prep` `reference_ids[28]`. The cited paper does not exist; IJSM 33(1) has no
   article at pages 11-16. There is currently **no** valid citation under the rowing programme's
   threshold-prescription method.

7. **"Rowing-specific physiology overview."**
   `rowing-2k-test-prep` `reference_ids[23]`. Chapter unlocatable. The programme's only claim to
   rowing specificity is uncited.

8. **"16 wk HIFT — strength AND VO2max improved concurrently."**
   CSM `reference_ids[28]`. No cited paper shows both. The review reports VO2max ~12% at 16 weeks;
   the same author's PLoS ONE trial reports 5RM strength gains but no VO2max. This is CSM's
   headline premise.

9. **"Hickson (1980) showed strength gains are attenuated … in proportion to endurance volume."**
   `engine-builder` `goals.concurrent_strength_policy.rationale`. Hickson has one combined group at
   one dose; there is no dose-response finding in it.

10. **"Helgerud 2007 … in soccer players."**
    CSM `evidence_base.session_rationale.why_norwegian_4x4`. The cohort was 40 moderately trained
    males, unspecified sport. The +7.2% figure itself is correct.

11. **"Fuel-for-work framework for concurrent programming" / "Fuel resistance sessions fully."**
    CSM `reference_ids[22]`; `engine-builder` and `engine-builder-block-2` `concurrent_strength_prescription`.
    Impey 2018 is an endurance train-low framework; resistance training and concurrent programming
    are outside its scope, and its own performance caveat (63% of studies showed no change) is not
    carried across.

12. **"Scapular dyskinesis and its role in overhead / hang loading" → shoulder-prep-before-every-session.**
    `first-strict-pullup` and `muscle-up`. The 2013 consensus states the role "is not clearly
    defined" and calls dyskinesis a "potential impairment"; both papers concern injured shoulders,
    neither studies hang loading, and neither supports prophylactic prep in asymptomatic trainees.
    Additionally the id these two programmes use resolves, in `citations.json` and on `/evidence`,
    to the *2010* paper they do not describe.

13. **"SICK scapula screening pattern."**
    `overhead-mobility` `reference_ids`. Term not present in the retrieved 2010 abstract; full text
    unreachable. The record's existing `verification_status: "unverified"` is correct and should
    not be cleared.

14. **The task-specificity foundation itself.**
    `first-strict-pullup` per-capability drill selection, `handstand-walk`'s
    sub-skill-independence principle and `multi_dimensional` generation strategy, `muscle-up`'s
    strict/kipping split, `rowing-2k-test-prep`'s specificity framing — all rest on `henry_1968`,
    whose content I could not retrieve in any form. Bibliographically real; substantively unread.

15. **Eight handstand drills' evidence, and one prerequisite gate.**
    `exercises.json` `evidence_refs` on `hs_shoulder_taps`, `hs_single_step_attempt`,
    `hs_walk_shuttle_2_3`, `hs_walk_continuous_line`, `hs_walk_marker_path`, `hs_walk_over_plate`,
    `hs_walk_through_cones`, `hs_walk_narrow_lane` cite `ferrari_2021`, which does not exist. The
    `hs_single_step_attempt` `prerequisites[0]` names it as `evidence_ref` with
    `source: "literature"` for a level-3 `handstand_hold_static` gate. `handstand-walk.json`
    retired this id on 2026-08-18; `exercises.json` and `citations.json` did not follow.

### Two things not in scope but visible from here

- **`/evidence` renders three "link" anchors that are search queries, not papers**
  (`hagerman_1994` → Google Scholar query; the `kilding_2012` and `overhead-mobility` `kibler_2013`
  search-string URLs live in programme records, which are unrendered, but the pattern is the same
  and `hagerman_1994`'s is in `citations.json` and therefore live). A user tapping "link" expecting
  the paper gets a search box. `src/app/evidence/page.tsx:100-111`.
- **`data-integrity.test.ts`'s cross-check has two blind spots** this batch walked into: the author
  comparison is `firstSurname` only, so wrong second and third authors pass (`fyfe_2016` ×3); and
  the title-overlap threshold `< 0.5` is met exactly at 0.50 by the `kibler_2013` pair, so a real
  two-papers-one-id collision passes undeclared. Reporting, not fixing.
