# Citation sweep — batch 6 (17 ids, s–w)

Date: 2026-09-05
Auditor: evidence-verifier
Records: `next-app/public/data/citations.json`
`used_for` sources: `next-app/public/data/programs/*.json` → `evidence_base.references[]`

Every verdict below rests on retrieved text, quoted. No paper's contents are
stated from memory. Retraction status checked via PubMed publication types for
all twelve PubMed-indexed items in this batch: zero retractions.

---

## Load-bearing code facts established for this sweep

Grepped before writing any Consequence line.

- **`citations.json` is user-visible.** `src/app/evidence/page.tsx` fetches
  `/data/citations.json` and renders every record — `authors`, `title`,
  `display_line`, `url` — sorted by `authors.localeCompare`. A wrong byline
  both misattributes on screen and mis-sorts the bibliography.
- **`CitationRef`** (`src/components/citations/CitationRef.tsx`) renders
  `display_short`, and on expand `title` + `display_line` + "Read the paper ↗"
  from `url`. This is the "engine proposes, and cites" surface.
- **`evidence_base.references[]` is validated and never rendered.**
  `schemas.ts:726` parses it; no component in `src/` reads it. So a placeholder
  byline in a programme file never reaches a user *through the app* — but it
  does reach reviewers through the generated specialist packets
  (`packet-freshness.test.ts` exists precisely because a packet shipped a stale
  `sci_reports_2026_handstand_shoulder` caveat).
- **`evidence_refs` / `evidence_ref` on exercises are validated and never
  rendered** (`schemas.ts:26`, `schemas.ts:78`).
- **`prerequisites` on exercises ARE live.** `plan-generator.ts:418`:
  `if (drill.prerequisites && !arePrerequisitesMet(drill.prerequisites, levels)) continue;`
  A drill whose prerequisites are unmet is silently dropped from the generated
  plan. Six wrist-load-tolerance prerequisites carry
  `"source": "literature", "evidence_ref": "wiesinger_2019"` — see that entry.
- **`hr_zone_methodology` is dead.** `schemas.ts:536` declares it
  `z.unknown().optional()`; nothing in `src/` reads it. No code anywhere
  computes HRmax from age — the only `hrMax` in the codebase is `lib/gpx.ts:38`,
  which takes the maximum *observed* HR out of an uploaded GPX file. Both HRmax
  formulae in this batch are prose, not arithmetic.
- **Top-level `principles[]` is dead.** `schemas.ts:594` parses it as
  `z.array(z.record(...))`; nothing reads it. The renderer at
  `src/app/plan/page.tsx:708` reads `weekly_template.principles`, which for
  `handstand-walk` is `null` (the file's key is `placement_principles`). So
  `shoulder_pain_stops_session` and `wrist_volume_capped` — the two rules the
  two shakiest handstand citations underwrite — **do not exist in the running
  app**, neither enforced nor displayed.

---

### sci_reports_2026_handstand_shoulder — OVERSTATED

**Cited for:** "Pain-associated practitioners show a technique-driven compensation pattern. Underpins the non-negotiable 'shoulder pain stops session' rule. Byline and DOI checked against the publisher record on 2026-09-02."
**Claimed:** citations.json — Angioi M, Hinds N, Twycross-Lewis R, Farmer C, Birn-Jeffery AV (2026), *Exploring handstand walking biomechanics and shoulder pain*, Scientific Reports 16, doi:10.1038/s41598-026-51612-w. Programme record (`handstand-walk.json:1821`) — authors "Sci Reports handstand-walk shoulder pain team".
**Found:** https://www.nature.com/articles/s41598-026-51612-w (fetched; publisher meta tags read directly).
**Quoted:**
- `citation_author` × 5: "Angioi, Manuela", "Hinds, Nicole", "Twycross-Lewis, Richard", "Farmer, Claire", "Birn-Jeffery, Aleksandra V."
- `citation_volume` 16, `citation_issue` 1, `citation_firstpage` 22766, `citation_doi` 10.1038/s41598-026-51612-w, `citation_online_date` 2026/07/21, `dc.date` 2026-07-21.
- Abstract: "Ten participants, who could handstand walk 6 steps, had force and positional data collected. Shoulder pain was assessed via questionnaire. … Participants with shoulder pain moved significantly slower (p = 0.005), exhibited shorter arm lengths (p = 0.013) and had greater net torsional work (p = 0.002) resulting in a lower axial–torsional work ratio. Altered handstand biomechanics in participants with pain demonstrate a more flexed position of the arm, often linked with higher joint loading."
- Abstract, closing: "Future studies should account for confounders including disciplines, training volume, and gender".

**Verdict:** OVERSTATED — the paper is real, correctly dated (published 2026-07-21, so the `2026` in the id is not a misdating), and the citations.json byline is exactly right; but it is a cross-sectional n=10 observational comparison that cannot establish direction, and it contains no session-management finding, so it cannot "underpin" a stop-the-session rule.

Three separate defects sit on this id:
1. **Placeholder byline.** The programme record's `authors` is "Sci Reports handstand-walk shoulder pain team" — not authors. `data-integrity.test.ts` already declares this in `KNOWN_REFERENCE_CONFLICTS`. (data-defect)
2. **False provenance note.** The same `used_for` asserts "Byline and DOI checked against the publisher record on 2026-09-02". The DOI checks out; the byline in that very record is a placeholder. The note claims a check that the record itself falsifies. (data-defect)
3. **Reach.** n=10; the authors themselves name discipline, training volume and gender as unaddressed confounders. Whether an association in ten practitioners licenses a non-negotiable rule is a clinical judgement. (needs-credentialed-human)

**Consequence:** The claim's stated dependent — the `shoulder_pain_stops_session` rule — is `handstand-walk.json` top-level `principles[5]`, which no code reads and no screen renders (see code facts above). The rule's own `detail` already hedges: "General motor-learning principle; the specific handstand-shoulder biomechanics paper is flagged unverified — the rule survives on principle regardless." The citation *does* reach users: it is `evidence_refs[1]` on the handstand-walk drill in `exercises.json`, and it renders on `/evidence` with the (correct) citations.json byline.

---

### seiler_2010 — SUPPORTS

**Cited for:** engine-builder — "Polarised training model — the 80/20 easy/hard distribution that anchors the full 3-block arc." · engine-builder-block-2 — "Polarised training model — 80/20 easy/hard distribution." · CSM — "Polarised training model (80/20 low/high)" · rowing-2k — "Polarised 80/20 distribution. Note: Seiler's original prescription was for general endurance blocks. Our race-prep application … is a race-prep adaptation of the polarised model, not the base-block Seiler distribution."
**Claimed:** Seiler S (2010), *What is best practice for training intensity and duration distribution in endurance athletes?*, IJSPP 5(3):276-291.
**Found:** PubMed 20861519 (efetch), and the record's own `url` returns HTTP 200.
**Quoted:** "Int J Sports Physiol Perform. 2010 Sep;5(3):276-91. … Numerous descriptive studies of the training characteristics of nationally or internationally competitive endurance athletes training 10 to 13 times per week seem to converge on a typical intensity distribution in which about 80% of training sessions are performed at low intensity (2 mM blood lactate), with about 20% dominated by periods of high-intensity work, such as interval training at approx. 90% VO2max."
**Verdict:** SUPPORTS — attribution, venue and the 80/20 figure are exact.
**Reach note (needs-credentialed-human):** the 80/20 figure is *descriptive of athletes training 10–13 times per week*, not a prescription, and Seiler adds "Training intensification studies performed on already well-trained athletes do not provide any convincing evidence that a greater emphasis on high-intensity interval training in this highly trained athlete population gives long-term performance gains." The rowing-2k record is the only one of the four that flags the extrapolation. Engine Builder's users are not training 10–13×/week.
**Consequence:** appears in four programmes' `evidence_base.references[]` (never rendered) and on `/evidence`. No engine rule keys off it.

---

### shea_2000 — MISATTRIBUTED (title)

**Cited for:** first-strict-pullup / muscle-up — "Spacing effect: spread practice across days beats massed practice on the same day. Anchors the multi-session weekly template and the GtG spacing rule." · handstand-walk — "Spacing across days > massing within a day. Underpins daily-short design and the 'don't double up if you miss a session' rule."
**Claimed:** citations.json — Shea CH, et al. (2000), *"Practice spacing effects on motor skill acquisition and retention"*, Human Movement Science 19:737-760.
**Found:** Crossref record for 10.1016/S0167-9457(00)00021-X, plus the ScienceDirect / Semantic Scholar listings.
**Quoted:** Crossref: title `['Spacing practice sessions across days benefits the learning of motor skills']`, authors `['Shea', 'Lai', 'Black', 'Park']`, container `['Human Movement Science']`, volume 19, issue 5, pages 737-760, published 2000-11.
Search result text on the study design: "In Experiment 1, a continuous dynamic balance task was practiced in two sessions of seven trials each, with one group's sessions separated by 20 minutes and another group's separated by 24 hours. … The results indicated that spacing practice sessions over relatively long intervals (days) resulted in the enhancement of performance during the remaining practice sessions and enhanced learning as assessed by the delayed retention test."
**Verdict:** MISATTRIBUTED — the paper is real and the finding is as cited; the **title** in `citations.json` is a description, not a title. The real title is *"Spacing practice sessions across days benefits the learning of motor skills"*, which is what the programme files carry. `authors` is also degraded ("Shea CH, et al." vs Shea CH, Lai Q, Black CB, Park J-H) and there is no `url`/`doi`. (data-defect)
**Consequence:** `/evidence` shows every user a title that cannot be looked up, with no URL to fall back on — precisely the failure the page's own docstring says it exists to prevent ("If a claim in the app can't be traced back to something here, it's engineering-choice, not cited"). Already declared in `data-integrity.test.ts` `KNOWN_REFERENCE_CONFLICTS.shea_2000`. Fix is a one-field edit: `title` → the Crossref title; add `doi: 10.1016/S0167-9457(00)00021-X`.
**Reach note:** the tasks were a stabilometer balance task and a key-press timing task in a lab. Whether that transfers to a pull-up or a handstand is a judgement, not a finding. (needs-credentialed-human)

---

### shea_morgan_1979 — SUPPORTS

**Cited for:** first-strict-pullup / muscle-up — "Foundational CI study. Blocked practice benefits acquisition, random benefits retention. Anchors weeks 1-2 blocked, weeks 3+ interleaved." · handstand-walk — same. · overhead-mobility — "Contextual interference in motor learning — blocked-first, random after".
**Claimed:** Shea JB, Morgan RL (1979), JEP: Human Learning and Memory 5:179-187.
**Found:** Crossref 10.1037/0278-7393.5.2.179 (authors Shea, Morgan; JEP:HLM; vol 5; 179-187; 1979-03) and the full PDF at https://gwern.net/doc/psychology/spaced-repetition/1979-shea.pdf (pdftotext, page 1 and results section).
**Quoted:** Abstract, page 1: "Subjects learned three motor tasks under a blocked (low interference) or random (high interference) sequence of presentation. … Results showed that retention was greater following high interference (random) acquisition than after low interference (blocked) acquisition when retention was measured under changed contextual interference conditions. Likewise, transfer was greater for high interference (random) acquisition groups than for low interference (blocked) acquisition groups."
Results: "Figure 2 shows that the blocked group performed considerably faster than the random group during the early acquisition trials. There was little decrease in TT for the blocked group over trials, whereas the TT for the random group decreased greatly over trials so that there was little difference between the two groups on the final block of trials."
**Verdict:** SUPPORTS — both halves of the `used_for` are in the retrieved text: blocked is better during acquisition, random is better at retention and transfer.
**Nuance worth carrying:** the blocked advantage in acquisition had largely washed out by the last acquisition block, and the retention advantage for random appeared "when retention was measured under changed contextual interference conditions" — i.e. it is conditional, not unqualified.
**Reach note (needs-credentialed-human):** the task was knocking down barriers in a timed sequence, over 10 minutes to 10 days. Applying a keypress-sequence CI result to a strict pull-up progression, an overhead mobility drill and handstand turns is an extrapolation each programme makes silently.
**Consequence:** used as a `prerequisites[].evidence_ref` with `"source": "literature"` on a level-4 handstand drill in `exercises.json` (`capability_domain: handstand_walk_dynamic, minimum_level: 3`), plus `evidence_refs` on three more drills. Those prerequisites are live at `plan-generator.ts:418`. The citation is sound, so the gate is defensibly labelled.

---

### simunkova_2024 — MISATTRIBUTED (byline)

**Cited for:** "UQYBT/CKCUEST show NO predictive relationship with handstand E-score. Used to justify NOT gating obstacles / turns on generic upper-quadrant screens, and to reinforce sub-skill-independence principle."
**Claimed:** Šimůnková K, et al. (2024), *Upper-quadrant Y-balance and CKCUEST vs handstand E-score*, PLOS One 19(5):e0302922.
**Found:** Crossref 10.1371/journal.pone.0302922 and https://pmc.ncbi.nlm.nih.gov/articles/PMC11090318/
**Quoted:** Crossref: title `['Are the shoulder joint function, stability, and mobility tests predictive of handstand execution?']`, authors `['Roman Malíř', 'Jan Chrudimský', 'Adam Provazník', 'Vít Třebický']`, PLOS ONE 19(5) e0302922, 2024-05-13.
PMC: "111 novice college athletes (ages 19-23) … Upper Quarter Y Balance Test (UQYBT) and Closed Kinetic Chain Upper Extremity Stability Test (CKCUEST) … no relationship between the quality of handstand execution (E-score) and measures of shoulder joint stability or mobility."
**Verdict:** MISATTRIBUTED — the DOI, journal, volume, issue and article number are exactly right and the **finding is exactly as cited**, but "Šimůnková K" is not an author of this paper. The real first author is Malíř R. The title is also a description rather than the published title. (data-defect)
**Important:** `data-integrity.test.ts`'s reference-conflict test cannot catch this — the programme record and `citations.json` agree with each other. They are both wrong in the same way, which is the failure mode that test is blind to by construction.
**Reach note (needs-credentialed-human):** the paper's own authors attribute the null to design ("different testing positions (90° versus 180° shoulder flexion) and insufficient participant skill variability may explain the null findings"). A null in 111 *novices* is being used to justify not gating *obstacles and turns*, which are advanced sub-skills nobody in that sample could perform. Absence of evidence in the wrong population.
**Consequence:** `/evidence` prints "Šimůnková K, et al." to every user, sorted under Š. `evidence_refs` on two handstand-walk drills (plate traverse, cone weave) — validated, not rendered, not behavioural.

---

### sobera_2019 — OVERSTATED

**Cited for:** "Elite vs novice difference — medial-lateral CoP control + stiffening strategy. Used in outcome_evidence and freestand hold rationale."
**Claimed:** Sobera M, Serafin R, Rutkowska-Kucharska A (2019), *Postural control strategies of handstand-trained subjects*, Acta of Bioengineering and Biomechanics.
**Found:** PubMed 31197281 (efetch). Independently corroborated in the Scientific Reports reference list fetched above: "citation_journal_title=Acta Bioeng. Biomech.; citation_title=Stabilometric profile of handstand technique in male gymnasts; citation_author=M Sobera, R Serafin, A Rutkowska-Kucharska; citation_volume=21; citation_publication_date=2019; citation_pages=63-71".
**Quoted:** "Acta Bioeng Biomech. 2019;21(1):63-71. Stabilometric profile of handstand technique in male gymnasts. Sobera M, Serafin R, Rutkowska-Kucharska A. … 8 acrobatic gymnasts (4 more and 4 less experienced) participated … More experienced gymnasts performing a handstand concentrate mainly on minimizing anterior-posterior body sway with minimum medial-lateral body sway. Less experienced gymnasts' pressure exerted on a surface by the hands is irregular in a medial-lateral direction. … The minimizing of body sway is compensated by exerting more force on a floor surface and the less experienced athletes cannot do that even after several years of training."
**Verdict:** OVERSTATED — the M-L control contrast and the force-exertion ("stiffening") reading are both in the abstract, so the mechanism claim stands; but the comparison is **4 vs 4 acrobatic gymnasts differing in experience**, not "elite vs novice", and n=8 will not carry an outcome claim. The record's `title` is also a description, not the published title (real: *Stabilometric profile of handstand technique in male gymnasts*), and `source` omits volume/pages. (title = data-defect; "elite vs novice" + `outcome_evidence` use = needs-credentialed-human)
**Reach note:** static handstand on force platforms. `handstand-walk` is a walking programme; the paper says nothing about locomotion.
**Consequence:** `evidence_refs` on three handstand-walk drills (back-to-wall kick-up, freestand hold, tuck freestand) — validated, not rendered. `/evidence` prints the description-as-title with no URL, so a user cannot look it up.

---

### steinacker_1993 — OVERSTATED

**Cited for:** "Rowing-specific interval + volume prescription" (`verification_status: "unverified"`; the record's only `url` is a PubMed *search query*, not a record).
**Claimed:** Steinacker JM (1993), *Physiological aspects of training in rowing*, Int J Sports Med 14(S1):S3-S10.
**Found:** PubMed 8262704 (efetch). **The record now has a real identifier: PMID 8262704.**
**Quoted:** "Int J Sports Med. 1993 Sep;14 Suppl 1:S3-10. Physiological aspects of training in rowing. Steinacker JM. … The AAT is 80%-85% of maximal performance in highly trained rowers. In successful rowers training intensity is 70%-90% of the training time below the AAT. Training eliciting a blood lactate above 4.0 mmol/l, sprint training and athletics training complete the training schedule, which may reach 1000 h, or 5000-7000 km per year."
**Verdict:** OVERSTATED — the paper exists exactly as claimed and does contain a training-distribution description, but it is a **descriptive review of what successful elite rowers do**, not a prescription, and it contains no interval prescription beyond "training eliciting a blood lactate above 4.0 mmol/l, sprint training and athletics training complete the training schedule". The volumes it reports (1000 h/yr; 5000–7000 km/yr) belong to international-level rowers.
- data-defect: `verification_status: "unverified"` and a search-URL are now both resolvable — PMID 8262704.
- needs-credentialed-human: "prescription" overstates a descriptive review, and a 2K-test-prep user is not an elite oarsman. Whether Steinacker's 70–90%-below-AAT distribution transfers is a coach's judgement.
**Consequence:** `rowing-2k-test-prep.json` `evidence_base.references[]` only — validated, not rendered. Not present in `citations.json`-driven UI beyond `/evidence`. No engine rule keys off it.

---

### stoggl_sperlich_2014 — SUPPORTS

**Cited for:** engine-builder — "Comparative evidence that polarised distribution outperforms threshold-heavy blocks — informs the choice to keep only one hard session per week in Block 1." · block-2 — "Polarised outperforms threshold-heavy. Informs why Block 2 keeps two hard sessions (not three) and preserves Z1 volume."
**Claimed:** Stöggl T, Sperlich B (2014), Frontiers in Physiology 5:33.
**Found:** PubMed 24550842 (efetch) + Crossref 10.3389/fphys.2014.00033.
**Quoted:** "Front Physiol. 2014 Feb 4;5:33. … Forty eight runners, cyclists, triathletes, and cross-country skiers (peak oxygen uptake: (VO2peak): 62.6 ± 7.1 mL·min(-1)·kg(-1)) were randomly assigned to one of four groups performing over 9 weeks. … POL demonstrated the greatest increase in VO2peak (+6.8 ml·min·kg(-1) or 11.7%, P < 0.001) … With the exception of slight improvements in work economy in THR, both HVT and THR had no further effects on measured variables of endurance performance (P > 0.05). CONCLUSION: POL resulted in the greatest improvements in most key variables of endurance performance in well-trained endurance athletes."
**Verdict:** SUPPORTS — "polarised outperforms threshold-heavy" is the paper's stated conclusion, in an RCT, at the claimed venue.
**Reach note (needs-credentialed-human):** n=48 well-trained athletes at VO2peak 62.6 mL·kg⁻¹·min⁻¹, over 9 weeks. Neither `used_for` string flags that. The specific inference — one hard session in Block 1, two in Block 2 — is an engineering choice the paper does not make; it compared four *distributions*, not two-vs-three sessions.
**Consequence:** `evidence_base.references[]` in two Engine Builder programmes (validated, not rendered) and `/evidence`. No engine rule keys off it.

---

### tanaka_2001 — SUPPORTS

**Cited for:** engine-builder — "HRmax = 208 − 0.7 × age, meta-analysis of 351 studies. Referenced in hr_zone_methodology alongside HUNT." · block-2 — "HRmax formula fallback."
**Claimed:** Tanaka H, Monahan KD, Seals DR (2001), *Age-predicted maximal heart rate revisited*, JACC 37(1):153-156.
**Found:** PubMed 11153730 (efetch).
**Quoted:** "J Am Coll Cardiol. 2001 Jan;37(1):153-6. … a meta-analytic approach was used to collect group mean HRmax values from 351 studies involving 492 groups and 18,712 subjects. … In the meta-analysis, HRmax was strongly related to age (r = -0.90), using the equation of 208 - 0.7 x age. … CONCLUSIONS: 1) A regression equation to predict HRmax is 208 - 0.7 x age in healthy adults."
**Verdict:** SUPPORTS — the formula attributed is the formula the paper publishes, and "351 studies" is exact. Attribution, year, journal, volume and pages all match.
**Minor data-defect:** the record's `url` (`jacc.org/doi/abs/…`) returns HTTP 403 to an unauthenticated request; `https://pubmed.ncbi.nlm.nih.gov/11153730/` is a working alternative for the "Read the paper ↗" link in `CitationRef`.
**Consequence:** **nothing computes this.** `hr_zone_methodology` is `z.unknown().optional()` (`schemas.ts:536`) and is read by no code; the only HRmax in `src/` is the observed max from an uploaded GPX (`lib/gpx.ts:38`). The formula is prose in `engine-builder.json:1275` and `engine-builder-block-2.json:1236`, plus a `/evidence` row. No user's zones are derived from it. Note the two programmes disagree about its role — "referenced alongside HUNT" vs "fallback" — with nothing to arbitrate, because nothing runs.

---

### vidal_torija_2025 — MISATTRIBUTED (byline + venue)

**Cited for:** "56.7% chronic wrist pain but NO association with weekly training hours, frequency, warm-up, or brace use. Reframes wrist risk as technique-driven, not volume-driven — but supports the volume cap as a conservative upper bound. Attribution flagged for founder review: PMC12550924 resolves to Martonovich et al. (same underlying data). The claim itself survives; the author byline may need to be swapped." (`verification_status: "unverified"`)
**Claimed:** Vidal-Torija A, et al. (2025), *Wrist symptoms in adult handstand practitioners: a cross-sectional survey*, "Frontiers (PMC12550924), n=321".
**Found:** https://pmc.ncbi.nlm.nih.gov/articles/PMC12550924/
**Quoted:** "Martonovich N, Maman D, Mahamid A, Alfandari L, Behrbalk E. The Wrist as a Weightbearing Joint in Adult Handstand Practitioners: A Cross-Sectional Survey of Chronic Pain and Training-Related Factors. *Journal of Functional Morphology and Kinesiology*. 2025;10(4):372. doi: 10.3390/jfmk10040372" · "Chronic wrist pain was reported by 182 (56.7%) of participants." · "no significant associations were observed between chronic pain and weekly training hours, warm-up routines, brace use, or grip device use." · "The duration of handstand training and weekly training frequency also showed no significant relationship with the presence of chronic wrist pain."
**Verdict:** MISATTRIBUTED — **the findings are exact**: 56.7%, n=321, and the null on hours, frequency, warm-up and brace use are all verbatim in the source. But the byline, the title and the venue are all wrong. It is Martonovich et al., in the *Journal of Functional Morphology and Kinesiology* (MDPI) — **not Frontiers**. "Vidal-Torija A" appears nowhere in the record. (data-defect; the substantive claim is verified and unchanged.)
Correct record: Martonovich N, Maman D, Mahamid A, Alfandari L, Behrbalk E (2025), *The Wrist as a Weightbearing Joint in Adult Handstand Practitioners: A Cross-Sectional Survey of Chronic Pain and Training-Related Factors*, J Funct Morphol Kinesiol 10(4):372, doi:10.3390/jfmk10040372.
**Reach note (needs-credentialed-human):** the authors' own conclusion is that pain "is not primarily determined by training volume or preventive routines, but rather likely reflects multifactorial influences including age, discipline type, and individual biomechanics." The programme reads this as licensing a volume cap "as a conservative upper bound" — i.e. it keeps a volume intervention while citing a null on volume. That is defensible as engineering, but the citation is not evidence for the cap; it is evidence against volume being the driver. The `used_for` half-says this. A clinician should decide whether the cap stays.
**Consequence:** `evidence_refs` on five wrist drills in `exercises.json` (wrist prep, wrist push-ups, finger raises, downward-dog recovery, child's-pose recovery) — validated, never rendered, not behavioural. Its stated dependent, `wrist_volume_capped`, is `handstand-walk.json` `principles[6]`, which no code reads and no screen renders. `/evidence` prints "Vidal-Torija A, et al." with no URL — the one place it does reach a user is the place it is most wrong, and it is unlookupable there.
**Note:** the `data-integrity.test.ts` conflict test cannot see this either — programme and citations.json agree with each other.

---

### walker_2003 — MISATTRIBUTED (one id, two papers, fields spliced)

**Cited for:** first-strict-pullup / muscle-up — "Dissociable consolidation stages. Supports daily short skill exposure over infrequent long sessions." (source given as Nature 425(6958):616-620) · handstand-walk / overhead-mobility — "Sleep-dependent motor consolidation. Reinforces daily-short skill exposure over infrequent long sessions." (source given as Learning & Memory 10(4):275-284)
**Claimed:** citations.json — Walker MP, Brakefield T, Hobson JA, Stickgold R (2003), title *"Dissociable stages of human memory consolidation and reconsolidation"*, source *"Learning & Memory 10(4):275-284"*, with a `review_note` asserting this was corrected: "the one Terav's motor-consolidation rationale actually leans on is Learning & Memory."
**Found:** two PubMed records, both fetched.
**Quoted:**
- PMID 14534587: "Nature. 2003 Oct 9;425(6958):616-20. doi: 10.1038/nature01930. **Dissociable stages of human memory consolidation and reconsolidation.** Walker MP, Brakefield T, Hobson JA, Stickgold R. … Using a motor skill finger-tapping task, here we provide evidence for at least three different stages of human motor memory processing after initial acquisition."
- PMID 12888546: "Learn Mem. 2003 Jul-Aug;10(4):275-84. doi: 10.1101/lm.58503. **Sleep and the time course of motor skill learning.** Walker MP, Brakefield T, **Seidman J, Morgan A,** Hobson JA, Stickgold R. … doubling the quantity of initial training does not alter the amount of subsequent sleep-dependent learning that develops overnight."

**Verdict:** MISATTRIBUTED — the `citations.json` record is a **splice of two different real papers**: it carries the Nature paper's title *and* the Nature paper's four-author byline, over the Learning & Memory paper's journal, volume, issue and page range. Following either half lands the reader somewhere the other half did not mean. The `review_note` claiming the record was corrected made it internally inconsistent rather than fixing it — and it names the wrong basis: the byline it kept is Nature's, and the L&M paper has six authors, including Seidman J and Morgan A, whom the record omits. (data-defect)

Compounding: **the four programme files disagree with each other about the `source` for this one id** — `first-strict-pullup.json` and `muscle-up.json` say Nature 425(6958):616-620; `handstand-walk.json` and `overhead-mobility.json` say Learning & Memory 10(4):275-284. `data-integrity.test.ts`'s conflict test compares only `authors` and `title`, never `source`, so this is invisible to the suite.

**On which paper each claim actually needs:**
- "Sleep-dependent motor consolidation … daily-short over infrequent long sessions" (handstand-walk, overhead-mobility) is the **L&M** paper — the retrieved sentence "doubling the quantity of initial training does not alter the amount of subsequent sleep-dependent learning that develops overnight" is exactly the short-vs-long argument. Content SUPPORTS, but under the wrong bibliographic record.
- "Dissociable consolidation stages" (pull-up, muscle-up) is the **Nature** paper. Its retrieved abstract describes wake/sleep consolidation and reconsolidation stages; it does **not** address session length or frequency, so the attached "supports daily short skill exposure over infrequent long sessions" is not carried by that paper.

**Fix requires a decision, not an edit:** either split into two ids (`walker_2003_nature`, `walker_2003_lm`) or pick one and repoint all four programmes. Both papers are real, unretracted, and doing distinct work in the app.
**Consequence:** four programmes cite it; `/evidence` renders one spliced row to every user with no URL. No engine rule keys off it. The user-facing damage is a bibliography row that resolves to neither paper.

---

### wiesinger_2019 — NOT_FOUND

**Cited for:** "Tendon adaptation timeframe (8-12 weeks for collagen turnover). Mechanism basis for the wrist volume cap. Note: no direct dose-response study for handstand wrist load — the exact 20-30 min cap is an engineering choice. Flagged for founder review: DOI missing." (`verification_status: "unverified"`)
**Claimed:** Wiesinger HP, et al. (2019), *Tendon adaptation to mechanical loading*, German Journal of Sports Medicine. No DOI, no URL, no volume, no pages.
**Found:** nothing matching. Searches run:
1. PubMed `esearch` on `Wiesinger HP[au]` — full author record, 20 items retrieved with `esummary`. Complete list spans 2016–2026. **No 2019 publication on tendons.** The only 2019-dated item is "The impact of sleep on complex gross-motor adaptation in adolescents", J Sleep Res 2019 Aug (Wiesinger is a middle author). His tendon work is 2017 (*Sport-Specific Capacity to Use Elastic Energy in the Patellar and Achilles Tendons of Elite Athletes*, Front Physiol), 2020 (*Mechanical and Material Tendon Properties in Patients With Proximal Patellar Tendinopathy*, Front Physiol) and 2022 (*Whole body vibration for chronic patellar tendinopathy*, Front Physiol).
2. Crossref `query.author=Wiesinger` + `query.bibliographic=tendon adaptation loading`, filtered 2018-01-01→2020-12-31 — 4 results, none in the German Journal of Sports Medicine, none titled anything like the claim.
3. Web search: `Wiesinger 2019 "German Journal of Sports Medicine" tendon adaptation mechanical loading Deutsche Zeitschrift für Sportmedizin` — returns no such paper.
4. Fetched the German Journal of Sports Medicine 2019 issue-4 archive page for the tendon-adaptation article that *does* exist there.

**Quoted (the paper that occupies the claimed slot, by different authors):** germanjournalsportsmedicine.com archive 2019/issue-4 — "**Functional Adaptation of Connective Tissue by Training.** Authors: Bohm S, Mersmann F, Arampatzis A. Journal: Dtsch Z Sportmed (German Journal of Sports Medicine). Year: 2019. Volume: 70. Pages: 105-110. DOI: 10.5960/dzsm.2019.366". On timeframe: the protocol it identifies is "five sets of four repetitive contractions with an intensity of ~90% of the isometric voluntary maximum maintained over 3 seconds" applied over "**14 weeks**"; on turnover it says only that tendon shows "slower response rates of the tendon due to a lower tissue turnover", with **no** collagen-turnover figure.

**Verdict:** NOT_FOUND — no work by Wiesinger, 2019, in the German Journal of Sports Medicine, on tendon adaptation, could be retrieved by any of four search routes. Two real candidates exist and neither matches the record as written:
- Bohm S, Mersmann F, Arampatzis A (2019), *Functional Adaptation of Connective Tissue by Training*, Dtsch Z Sportmed 70:105-110, doi:10.5960/dzsm.2019.366 — right journal, right year, right topic, **wrong authors**, and its protocol timeframe is 14 weeks, not 8–12.
- Wiesinger HP, Kösters A, Müller E, Seynnes OR (2015), *Effects of Increased Loading on In Vivo Tendon Properties: A Systematic Review*, Med Sci Sports Exerc — PubMed 25563908. Right author, right topic, **wrong year and wrong journal**.

Either way, **the "8-12 weeks for collagen turnover" figure is currently unsourced.** I did not retrieve it from any candidate. (data-defect)

**Consequence — the most serious in this batch.** `wiesinger_2019` is not decorative. In `exercises.json` it is the `evidence_ref` on **six drill `prerequisites` entries**, each marked `"source": "literature"` — wrist-load-tolerance and wrist-extension-mobility gates on wrist push-ups, box wall-walk, wall walk, and others. `plan-generator.ts:418` acts on those prerequisites: `if (drill.prerequisites && !arePrerequisitesMet(drill.prerequisites, levels)) continue;` — an unmet prerequisite silently removes the drill from the generated plan. The gates themselves may well be sensible; what is wrong is that they are labelled `source: "literature"` and point at a paper that could not be found to exist. That label is what distinguishes a cited gate from an engineering choice, and here it is doing the opposite of its job. It is also cited in the intake copy a user reads: `handstand-walk.json:409` — "Target for Tier B+ is 70 degrees; Wiesinger 2019 mechanism basis for tendon load tolerance." That sentence is on screen. It should either be re-sourced or the attribution removed and the gate reclassified `coaching_consensus` (a value `exercises.json` already uses elsewhere).

---

### wilson_2012 — SUPPORTS

**Cited for:** CSM — "The interference numbers — strength ES −18%, hypertrophy −31%, power −40%. Frequency + duration + modality dose-response." · rowing-2k — "Modality-interference rationale. Wilson's meta measured cycling and running against strength; rowing was not a primary studied modality. Terav infers rowing sits close to cycling on the interference gradient (non-eccentric, seated) — an engineering extrapolation, not a directly measured Wilson finding."
**Claimed:** Wilson JM, Marin PJ, Rhea MR, et al. (2012), J Strength Cond Res 26(8):2293-2307.
**Found:** PubMed 22002517 (efetch).
**Quoted:** "J Strength Cond Res. 2012 Aug;26(8):2293-307. … A meta-analysis of 21 studies was performed with a total of 422 effect sizes (ESs). … The mean ES for hypertrophy for strength training was 1.23; … for concurrent training, it was 0.85 … The mean ES for strength development for strength training was 1.76; … for concurrent training, it was 1.44. … The mean ES for power development for strength training only was 0.91; … for concurrent training, it was 0.55. … resistance training concurrently with running, but not cycling, resulted in significant decrements in both hypertrophy and strength. Correlational analysis identified significant negative relationships between frequency (-0.26 to -0.35) and duration (-0.29 to -0.75) of endurance training for hypertrophy, strength, and power. … interference effects of endurance training are a factor of the modality, frequency, and duration of the endurance training selected."
**Verdict:** SUPPORTS — the three percentages reconcile exactly against the retrieved effect sizes: strength 1.44/1.76 = −18.2%, hypertrophy 0.85/1.23 = −30.9%, power 0.55/0.91 = −39.6%. The "frequency + duration + modality dose-response" clause is the paper's stated conclusion.
**Wording caution (needs-credentialed-human):** these are reductions in **standardised effect size**, not reductions in strength, hypertrophy or power. "Strength ES −18%" is correctly labelled `ES` in the CSM string; if that number is ever rendered without the `ES`, it becomes a materially different and false claim. Grep confirms it is currently not rendered anywhere.
**Reach note:** the rowing-2k record's caveat is accurate and well made — the abstract does say the decrement was found "with running, but not cycling", and rowing is absent. That is an honestly declared extrapolation.
**Consequence:** `evidence_base.references[]` in two programmes (validated, not rendered) + `/evidence`. No engine rule keys off it. See `wilson_loenneke_2012` below for a duplicate-id defect.

---

### wilson_loenneke_2012 — SUPPORTS (but a duplicate id)

**Cited for:** engine-builder — "Meta-analytic evidence that interference is proportional to endurance volume and intensity — informs the RPE cap and session-count cap on concurrent strength." · block-2 — "Concurrent-training meta. Anchors the concurrent-strength policy tightening in Block 2 peak-volume weeks."
**Claimed:** Wilson JM, Marin PJ, Rhea MR, Wilson SMC, Loenneke JP, Anderson JC (2012), JSCR 26(8):2293-2307, https://pubmed.ncbi.nlm.nih.gov/22002517/
**Found:** PubMed 22002517 — same record as `wilson_2012` above.
**Quoted:** "Wilson JM, Marin PJ, Rhea MR, Wilson SM, Loenneke JP, Anderson JC." · "Correlational analysis identified significant negative relationships between frequency (-0.26 to -0.35) and duration (-0.29 to -0.75) of endurance training for hypertrophy, strength, and power."
**Verdict:** SUPPORTS — the fullest and most accurate byline of the two records, correct venue, working URL. The finding cited (interference scales with endurance frequency and duration) is in the retrieved abstract.
**One precision defect:** the `used_for` says "proportional to endurance volume and **intensity**". The abstract reports correlations for **frequency** and **duration**; the only intensity-linked correlation reported is "between ES for decreased body fat and % maximal heart rate (r = -0.60)", which is a different outcome. Substitute "duration" for "intensity" and the sentence becomes exact. (data-defect, minor)
**Structural defect (data-defect):** `wilson_2012` and `wilson_loenneke_2012` are **two ids for one paper** — same DOI, same journal, same pages. `/evidence` therefore prints the same study twice and the page's own count ("{citations.length} cited studies", asserted against the landing by `data-integrity.test.ts:435`) is inflated by one. `wilson_loenneke_2012` is the better record (full byline, working URL); `wilson_2012` has no URL. Four programmes are split across the two ids: CSM and rowing-2k use `wilson_2012`; engine-builder and block-2 use `wilson_loenneke_2012`.
**Consequence:** as above — validated, not rendered from programme files; visible on `/evidence`, twice.

---

### wisloff_2007 — SUPPORTS, with one mislabelled outcome

**Cited for:** engine-builder — "12-week 4×4-min interval trial showed VO2peak +46% and LV ejection fraction +35% in HF patients. Reinforces Helgerud 2007's finding that intervals — not continuous training — drive cardiac remodelling. Population caveat: cohort was heart-failure patients with substantial adaptive headroom; healthy trained users should not expect the +46% response magnitude — Helgerud 2007's +7.2% is the appropriate healthy-cohort anchor." · block-2 — "12-week 4×4 stimulus. Reinforces Norwegian 4×4 as Block 2's cardiac remodelling anchor." · CSM — "Interval-vs-continuous **SV** response; 46% vs 14%" · rowing-2k — "**Stroke volume** response reference"
**Claimed:** Wisløff U, Støylen A, Loennechen JP, et al. (2007), Circulation 115(24):3086-3094.
**Found:** PubMed 17548726 (efetch).
**Quoted:** "Circulation. 2007 Jun 19;115(24):3086-94. … Twenty-seven patients with stable postinfarction heart failure … (aged 75.5+/-11.1 years; left ventricular [LV] ejection fraction 29%; VO2peak 13 mL x kg(-1) x min(-1)) were randomized to either moderate continuous training (70% of highest measured heart rate …) or aerobic interval training (95% of peak heart rate) 3 times per week for 12 weeks or to a control group … **VO2peak increased more with aerobic interval training than moderate continuous training (46% versus 14%, P<0.001)** and was associated with reverse LV remodeling. LV end-diastolic and end-systolic volumes declined with aerobic interval training only, by 18% and 25%, respectively; **LV ejection fraction increased 35%**".
**Verdict:** SUPPORTS for the engine-builder and block-2 uses — the 12-week duration, the 46%-vs-14%, the +35% LVEF and the interval-vs-continuous framing are all verbatim, and engine-builder's population caveat is exactly the caveat the abstract demands.

**But the CSM and rowing-2k uses are OVERSTATED / mislabelled (data-defect):** "46% vs 14%" is **VO2peak**, not stroke volume. The retrieved abstract reports no stroke-volume figure at all; it reports LV end-diastolic and end-systolic volumes (−18%, −25%) and ejection fraction (+35%). CSM attaches the VO2peak number to the label "SV response", and rowing-2k calls the paper a "Stroke volume response reference" with no number and no caveat. One number, correctly retrieved, attached to the wrong physiological variable.

Neither CSM nor rowing-2k carries the population caveat that engine-builder does. The cohort is 27 postinfarction heart-failure patients, mean age 75.5, baseline VO2peak 13 mL·kg⁻¹·min⁻¹ and LVEF 29%. A +46% response in that cohort says nothing about a CrossFit athlete's stroke volume. (needs-credentialed-human)
**Consequence:** cited in four programmes' `evidence_base.references[]` (validated, not rendered) + one `/evidence` row. Nothing computes from it.

---

### wu_2014 — OVERSTATED

**Cited for:** "3× variance in visuomotor rotation learning correlates with baseline motor variability. Reinforces individual-variance framing."
**Claimed:** Wu HG, et al. (2014), *Temporal structure of motor variability is dynamically regulated and predicts motor learning ability*, Nature Neuroscience 17:312-321.
**Found:** PubMed 24413700 (efetch) + Crossref 10.1038/nn.3616 + full text at https://pmc.ncbi.nlm.nih.gov/articles/PMC4442489/ (fetched and searched).
**Quoted:**
- Abstract: "we found that higher levels of task-relevant motor variability predicted faster learning both across individuals and across tasks in two different paradigms, **one relying on reward-based learning** to shape specific arm movement trajectories and **the other relying on error-based learning to adapt movements in novel physical environments**."
- Full text, the magnitude: "individuals with variability that was at least one standard deviation above average had **more than twofold** higher learning rates than individuals with variability levels that were one standard deviation below average (Fig. 2g; P = 0.0021, t(6.76) = 4.23)."
- Full text, the paradigm: "we exposed subjects to a **velocity-dependent force field** in which the force vector perturbing the hand was proportional in magnitude and lateral in direction to the velocity of the hand".
- Searching the full text for "visuomotor rotation": the string appears **only in the reference list** (refs 35 and 48, other authors' work). It is not a paradigm in this study.

**Verdict:** OVERSTATED — the paper is real, correctly attributed, at the claimed venue and pages, and its general finding (baseline motor variability predicts learning rate; individual differences are large) does support the `used_for`'s closing clause, "Reinforces individual-variance framing." But the two specifics in the `used_for` are both wrong:
1. **"3×"** — the retrieved figure is "more than twofold", not threefold. (The only "more than fourfold" in the paper is the position-dependent component of adaptation after training, a different measure entirely.)
2. **"visuomotor rotation learning"** — not a paradigm in this study. The paradigms are reward-based trajectory learning and error-based **force-field** adaptation.

(data-defect on both specifics; the surviving framing claim is sound.)
**Reach note (needs-credentialed-human):** planar reaching in a manipulandum. Whether "high-variability learners learn faster" transfers to handstand acquisition is a judgement.
**Consequence:** `handstand-walk.json` `evidence_base.references[]` only — validated, not rendered. Nothing in `exercises.json` or `src/` uses the id. It reaches users only as a `/evidence` row, which prints the (correct) title and no URL. The false "3×" and "visuomotor rotation" live only in the `used_for`, which is not rendered — so the exposure today is to reviewers reading the programme file or a generated packet, not to users.

---

### wulf_1998 — SUPPORTS

**Cited for:** first-strict-pullup / muscle-up — "External focus vs internal focus foundation. Anchors the external-focus cue on every drill card." · handstand-walk — "External focus outperforms internal focus. Foundational reference for the cues_external_focus field on every drill." · overhead-mobility — "External-focus cue foundation".
**Claimed:** Wulf G, Höß M, Prinz W (1998), *Instructions for motor learning: differential effects of internal versus external focus of attention*, Journal of Motor Behavior 30:169-179.
**Found:** PubMed 20037032 (efetch).
**Quoted:** "J Mot Behav. 1998 Jun;30(2):169-79. doi: 10.1080/00222899809601334. Instructions for motor learning: differential effects of internal versus external focus of attention. Wulf G, Höß M, Prinz W. … In Experiment 1, the participants (N = 33) performed slalom-type movements on a ski-simulator. … Compared with the effects of internal-focus instructions and no instructions, the external-focus instructions enhanced learning. Internal-focus instruction was not more effective than no instructions. In Experiment 2 … instructing learners (N = 16) to focus on 2 markers on the platform of the stabilometer (external focus) led to more effective learning than instructing them to focus on their feet (internal focus), as measured by a retention test after 2 days of practice."
**Verdict:** SUPPORTS — title, byline, journal, volume, issue and pages exact; the finding is exactly what the four programmes cite it for.
**Nuance worth carrying:** the second half of the retrieved finding — "Internal-focus instruction was not more effective than no instructions" — is the sharper result and is not currently used. It is a stronger warrant for the design choice than "external beats internal" alone.
**Reach note (needs-credentialed-human):** N=33 and N=16, ski-simulator and stabilometer, retention at 2–3 days. `exercises.json` populates `cues_external_focus` on every drill in the shared library on this basis. That is a large generalisation from two small lab studies to a whole coaching-copy convention — well-replicated since, but this citation alone does not carry it. A `SUPERSEDED`-adjacent situation: a current review (e.g. Wulf's own later syntheses) would be a stronger anchor for a library-wide convention, but I did not retrieve one and so do not name one.
**Consequence:** the only citation in this batch whose stated dependent is genuinely everywhere — `cues_external_focus` is a required field pattern across the shared `exercises.json` library and is rendered on drill cards. The citation supports it; the load it is being asked to carry is the open question.

---

## Summary

| id | verdict | class |
|---|---|---|
| sci_reports_2026_handstand_shoulder | OVERSTATED | data-defect + needs-credentialed-human |
| seiler_2010 | SUPPORTS | needs-credentialed-human (reach) |
| shea_2000 | MISATTRIBUTED | data-defect |
| shea_morgan_1979 | SUPPORTS | needs-credentialed-human (reach) |
| simunkova_2024 | MISATTRIBUTED | data-defect + needs-credentialed-human |
| sobera_2019 | OVERSTATED | data-defect + needs-credentialed-human |
| steinacker_1993 | OVERSTATED | data-defect + needs-credentialed-human |
| stoggl_sperlich_2014 | SUPPORTS | needs-credentialed-human (reach) |
| tanaka_2001 | SUPPORTS | — (dead URL, minor) |
| vidal_torija_2025 | MISATTRIBUTED | data-defect + needs-credentialed-human |
| walker_2003 | MISATTRIBUTED | data-defect |
| wiesinger_2019 | **NOT_FOUND** | data-defect |
| wilson_2012 | SUPPORTS | data-defect (duplicate id) |
| wilson_loenneke_2012 | SUPPORTS | data-defect (duplicate id; "intensity"→"duration") |
| wisloff_2007 | SUPPORTS / OVERSTATED per use | data-defect (SV mislabel) + needs-credentialed-human |
| wu_2014 | OVERSTATED | data-defect |
| wulf_1998 | SUPPORTS | needs-credentialed-human (reach) |

Also verified as a control (named in the brief alongside `tanaka_2001`):

| nes_2013_hunt | SUPPORTS | — |

PubMed 22376273: "Scand J Med Sci Sports. 2013 Dec;23(6):697-704. … Age-predicted maximal heart rate in healthy subjects: The HUNT fitness study. Nes BM, Janszky I, Wisløff U, Støylen A, Karlsen T. … The present study examined the relationship between HRmax and age in **3320** healthy men and women … **HRmax was univariately explained by the formula 211 - 0.64·age (SEE, 10.8)**, and we found no evidence of interaction with gender, physical activity, VO2max level, or BMI groups." The formula and the SEE attributed in `engine-builder.json:1483` are exactly the ones the paper publishes. Both HRmax formulae in the app are correctly attributed.

Retractions: none. All twelve PubMed-indexed items returned zero `Retracted Publication` publication types.

Defects the existing suite cannot see (worth noting for whoever fixes them):
`data-integrity.test.ts`'s reference-conflict test compares `authors` and `title` between a programme record and `citations.json`. It therefore misses `simunkova_2024`, `vidal_torija_2025`, `sobera_2019` and `wiesinger_2019` — where the two records **agree with each other and are both wrong** — and misses `walker_2003`, where the divergence is in `source`, a field the test does not compare.

---

## Claims now unsupported

Programme assertions left standing on a citation that is not `SUPPORTS`.

1. **"Tendon adaptation timeframe (8-12 weeks for collagen turnover)"** — `handstand-walk.json` `principles[6].detail`, and the on-screen intake text at `handstand-walk.json:409` ("Target for Tier B+ is 70 degrees; Wiesinger 2019 mechanism basis for tendon load tolerance"). The cited work could not be retrieved by any of four search routes, and the 8–12-week figure appears in none of the candidate papers. **This is the batch's only NOT_FOUND, and the only one attached to live behaviour**: it is the `evidence_ref` marked `"source": "literature"` on six drill prerequisites that `plan-generator.ts:418` acts on to remove drills from a generated plan.

2. **"Pain-associated practitioners show a technique-driven compensation pattern … underpins the non-negotiable 'shoulder pain stops session' rule"** — the paper is real and its findings are as described, but it is a cross-sectional n=10 comparison that cannot establish direction and says nothing about session management. The rule is not derivable from it. (The rule itself is not in the running app.)

3. **"Byline and DOI checked against the publisher record on 2026-09-02"** — `handstand-walk.json:1825`. The DOI checks; the byline in that same record is the placeholder "Sci Reports handstand-walk shoulder pain team". The provenance note asserts a check the record falsifies.

4. **"Elite vs novice difference"** in handstand postural control, and its use in `outcome_evidence` — the study is 4 vs 4 acrobatic gymnasts differing in experience, in a static handstand. Not elite-vs-novice, not n enough for an outcome claim, not walking.

5. **"Rowing-specific interval + volume prescription"** — Steinacker 1993 is a descriptive review of what elite rowers do (1000 h/yr, 5000–7000 km/yr), not a prescription, and its only interval content is one clause about lactate >4.0 mmol/l and sprint work.

6. **"3× variance in visuomotor rotation learning correlates with baseline motor variability"** — both specifics are wrong against the retrieved full text: the figure is "more than twofold", and visuomotor rotation is not a paradigm in the study (reward-based trajectory learning and error-based force-field adaptation are). The general individual-variance framing survives.

7. **"Interval-vs-continuous SV response; 46% vs 14%"** (CSM) and **"Stroke volume response reference"** (rowing-2k) — 46% vs 14% is VO2peak. Wisløff 2007's abstract reports no stroke-volume figure. Neither record carries the heart-failure population caveat that engine-builder's does.

8. **"interference is proportional to endurance volume and intensity"** (engine-builder) — the meta reports correlations for **frequency** and **duration**. The only intensity correlation in the abstract is with body-fat change, a different outcome.

9. **Three citations a reader cannot look up at all** — `shea_2000`, `sobera_2019` and `simunkova_2024` each render on `/evidence` with a *description* where the title belongs, and `shea_2000` and `sobera_2019` have no `url`. `vidal_torija_2025` renders with a byline and a journal that both belong to no paper. `walker_2003` renders one row spliced from two different papers. `/evidence` exists to let a user trace a claim; for these five it cannot.

10. **A duplicated study inflates the count** — `wilson_2012` and `wilson_loenneke_2012` are the same paper (JSCR 26(8):2293-2307). `/evidence` announces "{citations.length} cited studies" and `data-integrity.test.ts:435` asserts the landing page agrees with that number. The number is one higher than the number of distinct studies.

No `prescription-change` is proposed here and none should be inferred. Items 1 and 3 are the two a human should look at first: item 1 because it is the only unretrievable source and the only one wired to plan generation, item 3 because a false verification note is the mechanism by which an unchecked citation acquires the appearance of having been checked.
