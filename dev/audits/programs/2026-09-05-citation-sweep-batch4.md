# Citation sweep — batch 4 (17 ids)

Date: 2026-09-05
Scope: `next-app/public/data/citations.json` + every `evidence_base.references[]`
`used_for` string that names one of these ids, checked against the retrieved
record. Nothing below is stated from memory; every verdict quotes text I fetched
in this session. Where I could not retrieve past an abstract, I say so.

Retrieval routes used: NCBI eutils `efetch`/`esearch` (PubMed), Crossref REST,
publisher/book scan (Newell). Retraction/erratum status was read off the PubMed
record's own `Erratum in` / `Comment in` / `Retraction in` fields.

## Shared "Consequence" facts (read from code, not from the JSON)

These apply to most entries and are not repeated in full each time:

- `src/app/evidence/page.tsx` fetches `/data/citations.json` and renders **every**
  record verbatim — `authors`, `year`, `title`, `source`, and `url` as a live
  link — on the in-app `/evidence` bibliography. All 17 ids are user-visible
  there. A wrong `url` is a wrong link a user can click.
- `src/components/citations/CitationRef.tsx` renders `display_short` /
  `display_line` inline. It is reached from `ProposalCard.tsx:150` (via
  `proposal.citationId`) and `CutCLatestRetestTile.tsx:209` (via a program's
  `retest_metrics[].citation_id`). Of these 17, **only
  `kraemer_2002_acsm_position_stand` reaches that surface** — the two
  `citation_id` fields in programme data both point at `bouchard_1999_heritage`.
- `evidence_base.references[]` is parsed (`schemas.ts:538`) but **no component
  reads it**. The "Cites" strip in `ProgramPreviewClient.tsx:402` reads
  `program.goals.references`, which is empty in all ten programme files, so that
  strip never renders today. `used_for` appears in no `.tsx`. So `used_for`
  strings are, at present, author-facing documentation — but they are the stated
  warrant for prose that *is* rendered (`rationale`, `detail`, `why_*`,
  `progression_rationale`), so a bad `used_for` is a bad warrant for live copy.
- `evidence_ref` / `evidence_refs` in `exercises.json` are schema-declared
  (`schemas.ts:26,78`) and never read. **But** the `prerequisites[]` object that
  carries `evidence_ref` *is* live: `plan-generator.ts:418` and `:471` call
  `arePrerequisitesMet()` to drop drills whose capability prerequisites the user
  has not met. The citation label on the gate is decoration; the gate is real.
- `hr_zone_methodology`, `progression_rationale`, `outcome_evidence` etc. are
  `z.unknown()` (`schemas.ts:528-537`) — displayed prose, never computed on.

---

### kraemer_2002_acsm_position_stand — OVERSTATED
**Cited for:** (no programme `used_for`; wired in code) `readiness_after_layoff: "kraemer_2002_acsm_position_stand"` — `src/lib/engine/proposal-citations.ts:33`
**Claimed:** American College of Sports Medicine (2002), "Progression models in resistance training for healthy adults", Med Sci Sports Exerc 34(2):364-380, https://pubmed.ncbi.nlm.nih.gov/11828249/
**Found:** PubMed 11828249 via eutils efetch — matches journal, volume, pages and year exactly. Byline is "Kraemer WJ, Adams K, Cafarelli E, … ; American College of Sports Medicine."
**Quoted:** "In order to stimulate further adaptation toward a specific training goal(s), progression in the type of resistance training protocol used is necessary." … "When training at a specific RM load, it is recommended that 2-10% increase in load be applied when the individual can perform the current workload for one to two repetitions over the desired number."
**Verdict:** OVERSTATED — the position stand is a *within-programme load-progression* document for **healthy adults**; the retrieved abstract says nothing about readiness to graduate out of a post-layoff or rehabilitation re-introduction phase, which is what the proposal it is attached to actually does. Additionally **superseded**: an identically-titled ACSM position stand exists at Med Sci Sports Exerc 2009;41(3):687-708 (PMID 19204579, fetched: "American College of Sports Medicine position stand. Progression models in resistance training for healthy adults.").
**Consequence:** This is the only id in the batch on a behavioural surface. `select.ts:180-192` builds the `readiness_after_layoff` proposal whose `reason` is "Two straight sessions above 80% TM at RPE ≤ 7 with no red/amber days. Mechanically you're done with Phase 1." and whose accept path (`useProposalActions.ts:49`) shifts the user from the rehab re-intro phase to `phase_2_cycle_1`. `ProposalCard.tsx:148-150` prints "Source: ACSM 2002" beneath it. So a document scoped to healthy adults is the printed warrant for leaving a rehab phase in `anterior-hip-rebuild` (`personal: true`).
**Class:** needs-credentialed-human (the reach from "healthy adults, load progression" to "exit rehab re-intro" is a clinical judgement), plus data-defect for the un-noted 2009 supersession.

---

### laursen_jenkins_2002 — SUPPORTS
**Cited for:** "HIT rationale in trained endurance athletes" (`rowing-2k-test-prep.json`)
**Claimed:** Laursen PB, Jenkins DG (2002), "The scientific basis for high-intensity interval training", Sports Med 32(1):53-73. No url in the record.
**Found:** PubMed 11772161 — Sports Med. 2002;32(1):53-73, doi 10.2165/00007256-200232010-00003. Full title carries a subtitle the repo drops: "…: optimising training programmes and maximising performance in highly trained endurance athletes."
**Quoted:** "It seems that, for athletes who are already trained, improvements in endurance performance can be achieved only through high-intensity interval training (HIT)."
**Verdict:** SUPPORTS — the retrieved abstract is exactly "HIT rationale in trained endurance athletes."
**Consequence:** `rowing-2k-test-prep.json:972` lists it in `reference_ids[]` only; no `rationale`/`detail` string in that file names Laursen. Renders on `/evidence` (no link, no url in record). No behaviour depends on it.
**Reach note (not a defect):** the paper's population is explicitly *highly trained*; Terav's rowing programme has no gate restricting it to trained athletes. Flag only. **Class:** needs-credentialed-human.

---

### little_2010 — OVERSTATED
**Cited for:** "Mitochondrial biogenesis signal detectable within 2 weeks of HIIT — cited in physiological_targets and progression_rationale for why weeks 1-2 focus on Z1 accumulation." (`engine-builder.json`)
**Claimed:** Little JP et al. (2010), J Physiol 588(6):1011-1022, https://pubmed.ncbi.nlm.nih.gov/20100740/
**Found:** PubMed 20100740 — "J Physiol. 2010 Mar 15;588(Pt 6):1011-22". Identifier resolves to this paper. Repo title drops the subtitle ": potential mechanisms".
**Quoted:** "Seven men (21 + or - 0.4 years, V(O2peak) = 46 + or - 2 ml kg(-1) min(-1)) performed six training sessions over 2 weeks." … "This study demonstrates that a practical model of low volume HIT is a potent stimulus for increasing skeletal muscle mitochondrial capacity and improving exercise performance."
**Verdict:** OVERSTATED — the first half of the `used_for` is supported exactly. The second half is not: the study is a **HIIT** intervention with no low-intensity arm and no base phase, so it cannot be evidence for "why weeks 1-2 focus on Z1 accumulation"; if anything it shows the mitochondrial adaptation arrives in two weeks *of intervals*, without a preceding base. n=7 young men.
**Consequence:** `engine-builder.json:1230` (`progression_rationale`, rendered prose): "Weeks 1-2 are pure Z1 because mitochondrial signalling protein bursts precede functional enzyme upregulation by 5-10 sessions (Perry 2010, Little 2010) — hard intervals on a missing base generate fatigue signals without adaptation payoff." Also `:1214` (`physiological_targets`): "detectable at 5-10 training sessions". Neither number is in the retrieved abstract (Little: six sessions / two weeks). No code branches on it — `engine-builder.json:1602` is `reference_ids[]` only.
**Class:** data-defect (the "5-10 sessions" figure is not in the cited source) + needs-credentialed-human (Z1-first sequencing is a coaching judgement, not this paper's finding).

---

### ludewig_cook_2000 — OVERSTATED (two `used_for` strings; one is clean, one is not)
**Cited for (a):** "Altered scap kinematics observed alongside impingement symptoms (the paper's own term); foundational rationale for scap-first sequencing. Association, not a demonstrated pathway." (`overhead-mobility.json`)
**Cited for (b):** "Serratus + trapezius endurance in sustained overhead flexion. Underpins the wall_supported_shrugs drill and the 170° prerequisite." (`handstand-walk.json`)
**Claimed:** Ludewig PM, Cook TM (2000), Phys Ther 80(3):276-291. No url in the record.
**Found:** PubMed 10696154 — "Phys Ther. 2000 Mar;80(3):276-91." Exact match on authors, year, venue, pages.
**Quoted:** "Fifty-two subjects were recruited from a population of construction workers with routine exposure to overhead work." … "Relative to the group without impingement, the group with impingement showed decreased scapular upward rotation at the end of the first of the 3 phases of interest, increased anterior tipping at the end of the third phase of interest, and increased scapular medial rotation under the load conditions." … "The serratus anterior muscle demonstrated decreased activity in the group with impingement across all loads and phases." … "CONCLUSION AND DISCUSSION: Scapular tipping … and serratus anterior muscle function are important to consider in the rehabilitation of patients with symptoms of shoulder impingement related to occupational exposure to overhead work."
**Verdict (a):** SUPPORTS. The design is a between-group comparison of symptomatic vs asymptomatic workers at one time point — association is precisely what it can bear, and "impingement" is indeed the paper's own word. The overhead-mobility `used_for` and `phases[].rationale` at `:455` ("Association, not cause") are an accurate reading.
**Verdict (b):** OVERSTATED — the paper measured **EMG amplitude during ramped humeral elevation under 0 / 2.3 / 4.6 kg loads**, not *endurance*, not sustained holds, and nothing at or near 170° of flexion (the reported phases are 31-60°, 61-90°, 91-120°). It is a symptomatic-population comparison, not a training study, so it cannot underpin a drill or a prerequisite threshold.
**Also flagged — a claim in the same file that exceeds both:** `overhead-mobility.json:889` `why_scap_first`: "Ludewig & Cook 2000, Ludewig & Reynolds 2009 — scap upward-rotation timing is **the dominant driver of subacromial space**. Fix sequence before adding load." "Dominant driver" is a causal-magnitude claim. Neither retrieved abstract makes it, and it directly contradicts the association-only framing the same programme adopts at `:31` and `:455`.
**Consequence:** (a) drives `phases[].rationale` (`:455`) and the `scap_first_shoulder_second` progression rule text (`:29-31`) — displayed prose; `block_scap_activation` ordering is authored into the phase blocks, not computed from the citation. (b) is attached to `hs_wall_supported_shrugs` (`handstand-walk.json:21,943`) and to the 170° Tier B+ threshold, which the same file already self-labels at `:1658` as "analogous to weightlifting overhead pass-through cutoff, **not empirically validated for handstand**" — so the file simultaneously calls the threshold an engineering choice and cites Ludewig & Cook as underpinning it. Separately, this id labels a **live gate**: `exercises.json:1223` attaches it as `evidence_ref` to a `shoulder_overhead_endurance ≥ level 1` prerequisite with `"source": "literature"`, and `plan-generator.ts:418` drops the drill when that prerequisite is unmet.
**Class:** (b) data-defect (the paper does not measure endurance or 170°); the `why_scap_first` line is data-defect too — it is a stronger claim than the source; the sequencing decision itself is needs-credentialed-human.

---

### ludewig_reynolds_2009 — SUPPORTS (with a strength-of-evidence caveat)
**Cited for:** "Scap upward-rotation lag correlates with symptomatic impingement; drives phase-1 emphasis" (`overhead-mobility.json`)
**Claimed:** Ludewig PM, Reynolds JF (2009), JOSPT 39(2):90-104. No url in the record.
**Found:** PubMed 19194022 — "J Orthop Sports Phys Ther. 2009 Feb;39(2):90-104. doi: 10.2519/jospt.2009.2808." Exact match.
**Quoted:** "There is a growing body of literature associating abnormal scapular positions and motions … with a variety of shoulder pathologies." … "There is evidence of scapular kinematic alterations associated with shoulder impingement, rotator cuff tendinopathy, rotator cuff tears, glenohumeral instability, adhesive capsulitis, and stiff shoulders. There is also evidence for altered muscle activation in these patient populations, particularly, reduced serratus anterior and increased upper trapezius activation." … "LEVEL OF EVIDENCE: Level 5."
**Verdict:** SUPPORTS — association with symptomatic shoulders, and specifically the serratus-down / upper-trap-up pattern the programme names, is stated in the retrieved abstract. Two caveats the repo does not record: (i) this is a **narrative review self-graded Level 5** — the weakest rung — so it is not independent evidence, it is a synthesis; (ii) the abstract does **not** rank scapular dyskinesis as "the most consistently documented" alteration (`overhead-mobility.json:31,455`), and does not support "dominant driver of subacromial space" (`:889`). It also does not restrict itself to athletes, as `:31` implies.
**Consequence:** underwrites `scap_first_shoulder_second` (`:29-31`), the phase-1 `rationale` (`:455`) and `why_scap_first` (`:889`) — all displayed prose. In `exercises.json` it tags `om_wall_slides` and five other drills' `evidence_refs[]`, which nothing reads. `overhead-mobility.json:1103` is `reference_ids[]`. No branch depends on it.
**Class:** needs-credentialed-human for the ranking language; data-defect for "dominant driver" (already logged under `ludewig_cook_2000`).

---

### manske_2010 — MISATTRIBUTED
**Cited for:** "Sleeper stretch effectiveness for posterior capsule tightness — engineering choice reference" (`overhead-mobility.json`, with `"verification_status": "verified"`)
**Claimed:** Manske RC et al. (2010), Sports Health 2(2):94-100; url is a **PubMed search string**, `https://pubmed.ncbi.nlm.nih.gov/?term=Manske+stretching+joint+mobilization+posterior+shoulder+tightness`
**Found:** PubMed 23015927 and Crossref 10.1177/1941738109347775 — "Sports Health. 2010 Mar;2(2):94-100." Bibliographically correct; the repo drops the operative half of the title, "…Measured by Internal Rotation Motion Loss".
**Quoted:** "The study comprised 39 college-age **asymptomatic** participants (7 men, 32 women)…" … "Participants in the stretching-only group performed the **cross-body stretch** on the limited side. Those in the other group (cross-body stretch plus joint mobilization) were treated with posterior joint mobilization techniques…" … "Although not statistically significant, the second group … had greater increases in internal rotation."
**Verdict:** MISATTRIBUTED — the trial tested the **cross-body stretch**, not the sleeper stretch; those are different interventions and choosing between them is the exact question the citation is meant to settle. The population is asymptomatic college students, not people with symptomatic posterior capsule tightness, and the between-group difference was not significant.
**Consequence:** `overhead-mobility.json:1117` `reference_ids[]`. Renders on `/evidence`, where the record has no url at all (the search-string url lives only in the programme file, and the programme file's refs are not rendered). The `"verification_status": "verified"` flag is (i) factually wrong for this `used_for` and (ii) silently dropped by Zod — the reference schema (`schemas.ts:538-546`) does not declare it, so it has no runtime meaning whatsoever; it exists only to reassure a reader.
**Class:** data-defect.

---

### meyer_morrison_zuniga_2017 — OVERSTATED
**Cited for:** "10-week CrossFit — VO2max + body comp + strength all improve concurrently" (`concurrent-strength-maintenance.json:841`)
**Claimed:** Meyer J, Morrison J, Zuniga J (2017), Workplace Health Saf 65(12):612-618. No url.
**Found:** PubMed 28363035 — "Workplace Health Saf. 2017 Dec;65(12):612-618. doi: 10.1177/2165079916685568." Exact match on authors, year, venue, pages. **Full text not retrievable** (paywalled; abstract only).
**Quoted:** the complete substantive abstract is: "This systematic literature review was conducted to analyze the current research on CrossFit, and assess the benefits and risks of this exercise strategy. Thirteen studies ( N = 2,326 participants) examined the use of CrossFit training among adults; CrossFit is comparable to other exercise programs with similar injury rates and health outcomes. Occupational health nurses should assess previous injuries prior to recommending this form of exercise."
**Verdict:** OVERSTATED — the retrieved record contains no 10-week trial, no VO2max figure, no body-composition figure and no strength figure. What it supports is "comparable injury rates and health outcomes to other exercise programmes". The specific claim is a *primary study inside* the review (most likely one of the thirteen); the correct citation is that study, not the review. I could not read the review's body, so I cannot say the sentence is absent from the full text — only that nothing retrievable supports it.
**Consequence:** `concurrent-strength-maintenance.json:904` `reference_ids[]`; no prose string in that file uses the "10-week" claim (grep for "10-week" returns only the `used_for` itself), so nothing rendered currently rests on it. Renders on `/evidence`.
**Class:** data-defect.

---

### midgley_2007 — MISATTRIBUTED
**Cited for:** "Intensity distribution meta for endurance" (`rowing-2k-test-prep.json`)
**Claimed:** Midgley AW, McNaughton LR, Wilkinson M (2007), "Is there an optimal training intensity for enhancing the maximal oxygen uptake of distance runners?", Sports Med 37(10):857-880.
**Found:** two different real papers, and the record fuses them.
 - The **title and author list** belong to PubMed 16464121: "Sports Med. 2006;36(2):117-32… Is there an optimal training intensity for enhancing the maximal oxygen uptake of distance runners?: empirical research findings, current opinions, physiological rationale and practical recommendations. Midgley AW, McNaughton LR, Wilkinson M."
 - The **year, volume and pages** belong to PubMed 17887811: "Sports Med. 2007;37(10):857-80… Training to enhance the physiological determinants of long-distance running performance… Midgley AW, McNaughton LR, **Jones AM**." (Third author differs; this one carries an Erratum, Sports Med 2007;37(11):1000.)
**Quoted (2006):** "Many studies have investigated the maximum amount of time runners can maintain 95-100% V-dotO(2max) with the assertion that this intensity is optimal in enhancing V-dotO(2max). Presently, there have been no well controlled training studies to support this premise."
**Quoted (2007):** "…it would be difficult to argue against the view that there is insufficient direct scientific evidence to formulate training recommendations based on the limited research." … "Scientists should be cautious when giving training recommendations to runners and coaches based on the limited available scientific knowledge."
**Verdict:** MISATTRIBUTED — the record identifies no single real work. Worse, **neither** candidate is "an intensity distribution meta": both are narrative reviews, neither pools effect sizes, and the paper matching the cited year/volume/pages argues explicitly that the evidence base is too thin to prescribe from. Cited as a warrant for prescription, the 2007 paper points the other way.
**Consequence:** `rowing-2k-test-prep.json:971` `reference_ids[]` only; no `rationale` string in that file names Midgley. Renders on `/evidence` with a title and a volume that belong to different articles, and no url.
**Class:** data-defect.

---

### mikulic_2011 — SUPPORTS
**Cited for:** "Elite rower development trajectory context" (`rowing-2k-test-prep.json`, `"verification_status": "unverified"`)
**Claimed:** Mikulic P (2011), Eur J Appl Physiol 111(9):2363-2368; url is a **PubMed search string**.
**Found:** PubMed 21336950 — "Eur J Appl Physiol. 2011 Sep;111(9):2363-8. doi: 10.1007/s00421-011-1870-y." Author, year, venue, volume, issue and pages all match.
**Quoted:** "This case study reports the results of a 6-year (2005-2010) follow-up study of a world-class rowing crew, the current world champions." … "Performance-related physical and physiological parameters seem to level-off at about 20 years of age…"
**Verdict:** SUPPORTS — "elite rower development trajectory context" is a fair, deliberately weak description of what this is. The `verification_status: "unverified"` flag can now be retired; note it is Zod-stripped and never had runtime meaning.
**Reach note:** n = one crew of adolescents tracked to world champion. It is a case study; it cannot support any prescriptive inference for an adult recreational 2K tester, and the programme does not currently make one.
**Consequence:** `rowing-2k-test-prep.json:983` `reference_ids[]`; no prose names it. Renders on `/evidence` without a url (the search-string url is in the programme file only).
**Class:** data-defect (search-string url, stale status flag) — trivial.

---

### morton_2018 — SUPPORTS
**Cited for (three programmes):** "Protein floor: no further hypertrophy benefit above 1.62 g/kg/day" (CSM) · "Protein floor 1.62 g/kg/day. Anchors the concurrent strength prescription." (EB block 2) · "Protein plateau at 1.62 g/kg/day. Anchors the concurrent_strength_prescription's protein floor." (engine-builder)
**Claimed:** Morton RW et al. (2018), BJSM 52:376-384, https://pubmed.ncbi.nlm.nih.gov/28698222/
**Found:** PubMed 28698222 — "Br J Sports Med. 2018 Mar;52(6):376-384." Identifier resolves correctly.
**Quoted:** "Data from 49 studies with 1863 participants…" … "**Protein supplementation beyond total protein intakes of 1.62 g/kg/day resulted in no further RET-induced gains in FFM.**" … "**With protein supplementation**, protein intakes at amounts greater than ~1.6 g/kg/day do not further contribute RET-induced gains in FFM."
**Verdict:** SUPPORTS — the number and the direction are verbatim. Two things the records omit: the finding is a **plateau/ceiling** (engine-builder's word "plateau" is right; CSM's and block 2's "floor" is a programming inversion of it, though their sentences state the direction correctly), and the paper carries an **Erratum, Br J Sports Med 2020 Oct;54(19):e7**, which none of the four records notes. The outcome measured is fat-free mass, not "hypertrophy" in the CSM `used_for` sense of muscle size specifically (the paper reports fibre CSA separately).
**Consequence:** `engine-builder.json:1276` `concurrent_strength_prescription` renders "Protein floor 1.6 g/kg/day (Morton 2018 meta)" — note the file says 1.6 while the reference says 1.62; both are within what the abstract states ("~1.6"). `reference_ids[]` at CSM:896, EB2:1526, EB:1626. No code reads a protein number.
**Class:** data-defect (missing erratum) — minor.

---

### mujika_padilla_2000 — MISATTRIBUTED
**Cited for:** "Taper literature: intensity preserved, volume down 40-60%. Anchors the week 9-10 taper design." (`engine-builder-block-2.json`) and "Maintenance dose during subsequent strength focus: 2 aerobic sessions/week with intensity preserved. Cited in outcome_evidence and post-block prescription." (`engine-builder.json`)
**Claimed:** Mujika I, Padilla S (2000), "Detraining… Part I & II", Sports Medicine 30(2):79-87 **and** 30(3):145-154, https://pubmed.ncbi.nlm.nih.gov/10999418/
**Found:** **PMID 10999418 is not a Mujika paper and not a sports paper.** Fetched: "Plant Mol Biol. 2000 Jun;43(2-3):387-99. Genetic and epigenetic interactions in allopolyploid plants. Comai L."
**Quoted (the wrong record the url resolves to):** "Allopolyploid plants are hybrids that contain two copies of the genome from each parent."
**Quoted (the works actually meant):** Part I = PMID 10966148, "Sports Med. 2000 Aug;30(2):79-87"; Part II = PMID 10999420, "Sports Med. 2000 Sep;30(3):145-54", which says: "All these negative effects can be avoided or limited by reduced training strategies, **as long as training intensity is maintained and frequency reduced only moderately. On the other hand, training volume can be markedly reduced.**"
**Verdict:** MISATTRIBUTED — the identifier resolves to a plant-genetics article. Two further problems: (i) the record is a **merged entry for two distinct works**, duplicating `mujika_padilla_2000_a` and `_b`, so the library holds three ids for two papers; (ii) neither abstract contains "**40-60%**" and neither is taper literature — they are detraining reviews. The qualitative shape ("intensity preserved, volume markedly reduced") is supported by Part II; the number is not. The correct source for the number is Bosquet et al. 2007 (PMID 17762369, fetched): "the training volume is exponentially decreased by **41-60%** … without any modification of either training intensity". Nor does either abstract contain "2 aerobic sessions/week"; Part II says only "frequency reduced only moderately".
**Consequence:** `/evidence` renders this record with a clickable link to the plant paper — the single most user-visible defect in this batch. `engine-builder.json:1620` and `engine-builder-block-2.json:1516` are `reference_ids[]`. No code branches on it.
**Class:** data-defect.

---

### mujika_padilla_2000_a — SUPPORTS
**Cited for:** "Detraining timeline — informs taper design" (`rowing-2k-test-prep.json`)
**Claimed:** Mujika I, Padilla S (2000), "Detraining… Part I", Sports Med 30(2):79-87. No url.
**Found:** PubMed 10966148 — "Sports Med. 2000 Aug;30(2):79-87. doi: 10.2165/00007256-200030020-00002. Detraining: loss of training-induced physiological and performance adaptations. Part I: short term insufficient training stimulus."
**Quoted:** "Short term detraining (less than 4 weeks of insufficient training stimulus) is analysed in part I of this review…" … "Short term cardiorespiratory detraining is characterised in highly trained athletes by a rapid decline in maximal oxygen uptake (VO2max) and blood volume."
**Verdict:** SUPPORTS — "detraining timeline" is exactly the subject, and using a detraining timeline to bound how much a taper can cost you is a legitimate, modest use. Note the record duplicates half of `mujika_padilla_2000`.
**Consequence:** `rowing-2k-test-prep.json:962` `reference_ids[]`; the `taper_last_week` rule detail at `:36` names "Mujika & Padilla 2000 (I+II)" for mechanism and correctly credits Bosquet 2007 as "the stronger single-source anchor for the effect size". That line is the one honest taper attribution in the file. Renders on `/evidence` without a url.
**Class:** none (housekeeping only: duplicate id).

---

### mujika_padilla_2000_b — OVERSTATED
**Cited for:** "Taper effect — ~3% performance uplift from volume down 40-60%" (`rowing-2k-test-prep.json`)
**Claimed:** Mujika I, Padilla S (2000), "Detraining… Part II", Sports Med 30(3):145-154. No url.
**Found:** PubMed 10999420 — "Sports Med. 2000 Sep;30(3):145-54… Part II: Long term insufficient training stimulus." Bibliographically exact.
**Quoted:** "All these negative effects can be avoided or limited by reduced training strategies, as long as training intensity is maintained and frequency reduced only moderately. On the other hand, training volume can be markedly reduced."
**Verdict:** OVERSTATED — the qualitative rule is supported; **neither the "40-60%" nor the "~3% performance uplift" appears in the retrieved abstract**, and this is a detraining review, not a taper trial or meta-analysis. The volume figure belongs to Bosquet 2007 ("exponentially decreased by 41-60%"); the Bosquet abstract reports the taper benefit as standardised mean differences (overall effect 0.59 ± 0.33 for a 2-week taper), **not** as ~3%, so the "~3%" figure is currently unsourced against anything I could retrieve. Full text of Part II is paywalled; I checked the abstract only.
**Consequence:** two rendered prose strings credit the uplift to Mujika alone: `rowing-2k-test-prep.json:410` (phase 3 `rationale`) "Mujika & Padilla 2000 — the ~3% performance uplift is bought by the taper, not by more work." and `:665` `why_taper` "…reducing volume 40-60% while holding intensity produces a ~3% performance uplift on race day, mostly via neuromuscular / hematological restoration." `:411` sets `is_taper: true` on that phase — that flag is authored, not derived from the citation. `:680` separately flags the 2-week taper length as a judgement call ("Mujika taper literature supports 1-3 weeks; we picked the middle"), which Bosquet in fact backs better than Mujika does.
**Class:** data-defect (two numbers attributed to a source that does not contain them).

---

### murach_bagley_2016 — SUPPORTS
**Cited for:** "Contrary evidence — hypertrophy not consistently reduced in ecologically valid protocols" (`concurrent-strength-maintenance.json`)
**Claimed:** Murach KA, Bagley JR (2016), Sports Med 46(8):1029-1039. No url.
**Found:** PubMed 26932769 — "Sports Med. 2016 Aug;46(8):1029-39. doi: 10.1007/s40279-016-0496-y." Exact. Repo drops the subtitle "**: Contrary Evidence for an Interference Effect**", which is the part that matters here.
**Quoted:** "However, a close examination of the literature reveals that the interference effect of concurrent exercise training on muscle growth in humans is not as compelling as previously thought. Moreover, recent studies show that, under certain conditions, concurrent exercise may augment resistance exercise-induced hypertrophy…"
**Verdict:** SUPPORTS — "contrary evidence" is the paper's own framing, and "not as compelling as previously thought" is the "not consistently reduced" claim. It is a narrative review, not a meta-analysis; the programme does not claim otherwise.
**Consequence:** `concurrent-strength-maintenance.json:562` `why_lift_twice_weekly` (rendered prose): "Murach & Bagley 2016 + Schumann 2022 — 2×/wk is sufficient for maintenance in trained lifters." The retrieved abstract contains **no frequency prescription**; "2×/wk is sufficient" is not in it, and the sentence pairs it with Schumann 2022, which is outside this batch and unverified here. Flag that line for the next sweep. `reference_ids[]` at `:888`.
**Class:** needs-credentialed-human for the 2×/wk attribution (out of this batch's scope to resolve, since it is jointly attributed).

---

### nes_2013_hunt — SUPPORTS
**Cited for:** "HUNT formula HRmax = 211 − 0.64 × age (SEE 10.8 bpm). Cited in hr_zone_methodology as the default." (engine-builder) · "HUNT HRmax formula — used for zone defaults." (EB block 2)
**Claimed:** Nes BM et al. (2013), Scand J Med Sci Sports 23(6):697-704, https://onlinelibrary.wiley.com/doi/abs/10.1111/j.1600-0838.2012.01445.x
**Found:** PubMed 22376273 — "Scand J Med Sci Sports. 2013 Dec;23(6):697-704. doi: 10.1111/j.1600-0838.2012.01445.x." The record's DOI-based url is the correct DOI for this article.
**Quoted:** "The present study examined the relationship between HRmax and age in 3320 healthy men and women within a wide age range using data from the HUNT Fitness Study (2007-2008)." … "**HRmax was univariately explained by the formula 211 - 0.64·age (SEE, 10.8)**, and we found no evidence of interaction with gender, physical activity, VO2max level, or BMI groups." … "HRmax predicted by age alone may be practically convenient for various groups, although a standard error of 10.8 beats/min must be taken into account."
**Verdict:** SUPPORTS — formula, standard error, and the no-interaction claim are all verbatim. The programme's own caveat at `engine-builder.json:1270` ("has ~11 bpm SEE; personalised max derived from observed workout HRs when available") is the caveat the paper itself asks for.
**Consequence:** `hr_zone_methodology` (`engine-builder.json:1275`) is displayed prose only — `hr_zone_methodology` is `z.unknown()` in `schemas.ts:536`, and **no code in `src/` computes HRmax from age**: grepping for `211`, `0.64`, `hrmax` finds only observed-HR handling (`gpx.ts:38,83,104` max from file; `note-signals.ts:297-323` thresholds at 170/180 bpm literal). So the "used for zone defaults" description in EB block 2's `used_for` overstates what the runtime does — the formula is documentation, not a computation. That is a code/data mismatch, not a citation defect.
**Class:** none for the citation; one note for the maintainers that "used for zone defaults" describes no live behaviour.

---

### newell_1985 — MISATTRIBUTED
**Cited for:** "Organismic, task, environmental constraints. Underpins the multi-dimensional decomposition into capability_domains." (handstand-walk) · "Constraints-led framework for skill acquisition. Anchors the treat-sub-skills-as-independent-state-variables approach." (first-strict-pullup) · "Constraints-led framework. Anchors treat-sub-skills-as-independent-state-variables." (muscle-up)
**Claimed:** citations.json: Newell KM (1985), "Coordination, control, and skill: constraints-led framework", *Advances in Motor Development Research*. handstand-walk repeats that. first-strict-pullup and muscle-up instead say (1985), "Constraints on the development of coordination", *Motor Development in Children: Aspects of Coordination and Control* (Wade & Whiting eds.).
**Found:** I retrieved and read the original chapter scan at https://grants.hhp.uh.edu/clayne/HistoryofMC/Newell1986.pdf. Title page: "Motor Development in Children: Aspects of Coordination and Control / edited by M.G. Wade … H.T.A. Whiting / **1986 Martinus Nijhoff Publishers**, Dordrecht / Boston / Lancaster". Chapter opens on **p. 341**: "CONSTRAINTS ON THE DEVELOPMENT OF COORDINATION — K.M. Newell". Separately, a **different** Newell 1985 chapter does exist: "Coordination, control and skill", in Goodman, Wilberg & Franks (eds), *Differing Perspectives in Motor Learning, Memory and Control*, North-Holland, pp. 295-317 (per scirp.org reference record).
**Quoted (p. 348 of the scan):** "It is proposed that there are three categories of constraints that **interact** to determine for a given organism the optimal pattern of coordination and control for any activity (Newell, 1984a). These are organismic constraints, environmental constraints and task constraints (see Figure 1)."
**Verdict:** MISATTRIBUTED — the canonical record in `citations.json` names one work's title (the 1985 *Coordination, control and skill*) against a book title that belongs to **neither** work ("Advances in Motor Development Research" matches nothing I could find), and dates the three-constraints chapter to 1985 when the book's own title page says 1986. The substance of the handstand-walk `used_for` — the three constraint categories — **is** in the 1986 chapter, verified above; it is the bibliography that is wrong, and it is wrong differently in three files.
**Reach note that matters:** the chapter says the three categories "**interact** to determine … the optimal pattern of coordination". first-strict-pullup and muscle-up cite it to anchor treating sub-skills "as independent state variables". The chapter is a framework for how constraints interact, is about the development of coordination in children, and offers nothing about statistical independence of trained sub-skills. That use is unsupported and arguably runs against the source.
**Consequence:** `reference_ids[]` at handstand-walk:1971, first-strict-pullup:1488, muscle-up:1394. Renders on `/evidence` as "Newell (1985), Advances in Motor Development Research" with no url. Note the guard in `data-integrity.test.ts:1466` ("a programme reference and its citations.json entry are the same paper") does **not** catch the handstand-walk-vs-muscle-up title divergence: it fails only below 50% shared title words, and {constraints, development, coordination} vs {coordination, control, skill, constraints, led, framework} shares 2 of 3 = 0.67.
**Class:** data-defect (bibliography) + needs-credentialed-human (the "independent sub-skills" reading).

---

### perry_2010 — MISATTRIBUTED
**Cited for:** "mRNA-precedes-protein pattern — informs the choice to accumulate volume before adding interval intensity." (`engine-builder.json`)
**Claimed:** Perry CGR, Lally J, Holloway GP, Heigenhauser GJF, Bonen A, Spriet LL (2010), "Repeated transient mRNA bursts precede increases in transcriptional and mitochondrial proteins during training in human skeletal muscle", **Applied Physiology, Nutrition, and Metabolism 35(6):837-844**, https://pubmed.ncbi.nlm.nih.gov/20555380/
**Found:** **PMID 20555380 is a different paper**: fetched, "Appl Physiol Nutr Metab. 2010 Jun;35(3):350-7. High-intensity interval training increases SIRT1 activity in human skeletal muscle. **Gurd BJ, Perry CG, Heigenhauser GJ, Spriet LL, Bonen A.**" The paper actually named is PMID 20921196: "**J Physiol. 2010 Dec 1;588(Pt 23):4795-810.** doi: 10.1113/jphysiol.2010.199448. Repeated transient mRNA bursts precede increases in transcriptional and mitochondrial proteins during training in human skeletal muscle. Perry CG, Lally J, Holloway GP, Heigenhauser GJ, Bonen A, Spriet LL."
**Quoted (the real paper):** "throughout a seven-session, high-intensity interval training period … we examined the time course…" … "**PGC-1α mRNA was increased >10-fold 4 h after the 1st session and returned to control within 24 h.** This 'saw-tooth' pattern continued until the 7th bout…" … "**Citrate synthase (CS) and β-HAD mRNA were rapidly increased (1 session), followed 2 sessions later (session 3) by increases in CS and β-HAD activities**…" … "the 'transcriptional capacity' of human muscle is extremely sensitive, being **activated by one training bout**."
**Verdict:** MISATTRIBUTED — both the url and the `source` (journal, volume, issue, pages) point at a different article by an overlapping author group. The named paper is real and does support "mRNA precedes protein". It does **not** support the second half of the `used_for`: the intervention was seven HIIT sessions with no volume-accumulation phase, and the finding — transcriptional capacity "activated by one training bout", enzyme activities up by session 3 — cuts against "accumulate volume before adding interval intensity".
**Consequence:** `/evidence` renders a clickable link to Gurd et al. under Perry's byline and title. `engine-builder.json:1230` `progression_rationale` (rendered prose): "Weeks 1-2 are pure Z1 because mitochondrial signalling **protein** bursts precede functional enzyme upregulation **by 5-10 sessions** (Perry 2010, Little 2010)". Perry reports **mRNA** bursts, not protein bursts, and a lag of 1-2 sessions to enzyme activity, not 5-10. `:1214` repeats "detectable at 5-10 training sessions" and `:1602-1603` are `reference_ids[]`. No code branches on it.
**Class:** data-defect.

---

## Summary

| id | verdict | class |
|---|---|---|
| kraemer_2002_acsm_position_stand | OVERSTATED (also superseded by ACSM 2009, PMID 19204579) | needs-credentialed-human + data-defect |
| laursen_jenkins_2002 | SUPPORTS | — |
| little_2010 | OVERSTATED | data-defect + needs-credentialed-human |
| ludewig_cook_2000 | SUPPORTS (overhead-mobility) / OVERSTATED (handstand-walk) | data-defect + needs-credentialed-human |
| ludewig_reynolds_2009 | SUPPORTS (Level 5 narrative review) | needs-credentialed-human |
| manske_2010 | MISATTRIBUTED | data-defect |
| meyer_morrison_zuniga_2017 | OVERSTATED | data-defect |
| midgley_2007 | MISATTRIBUTED | data-defect |
| mikulic_2011 | SUPPORTS | data-defect (url/status flag, trivial) |
| morton_2018 | SUPPORTS | data-defect (missing 2020 erratum) |
| mujika_padilla_2000 | MISATTRIBUTED | data-defect |
| mujika_padilla_2000_a | SUPPORTS | — |
| mujika_padilla_2000_b | OVERSTATED | data-defect |
| murach_bagley_2016 | SUPPORTS | needs-credentialed-human (the 2×/wk line) |
| nes_2013_hunt | SUPPORTS | — |
| newell_1985 | MISATTRIBUTED | data-defect + needs-credentialed-human |
| perry_2010 | MISATTRIBUTED | data-defect |

6 SUPPORTS · 5 OVERSTATED · 5 MISATTRIBUTED · 1 split (ludewig_cook_2000) · 0 CONTRADICTS · 0 NOT_FOUND · 0 retracted.

**Every one of the 17 works exists.** No fabricated papers in this batch. The
failures are of the identifier-and-attribution kind, which is the kind that
survives review because the title always looks right.

### On the three Mujika ids

They are **three ids for two works**.
- `mujika_padilla_2000_a` = Part I, Sports Med 30(2):79-87, PMID 10966148 — correct.
- `mujika_padilla_2000_b` = Part II, Sports Med 30(3):145-54, PMID 10999420 — correct.
- `mujika_padilla_2000` = a merged "Part I & II" record duplicating both, whose
  url (PMID 10999418) resolves to a plant-genetics paper. It has no bibliographic
  reason to exist; only `engine-builder` and `engine-builder-block-2` reference it.

### On Ludewig & Cook / Ludewig & Reynolds (the scap-first rationale)

Both papers are real, correctly attributed, and **do support an association** —
that framing is right and the programme's own "Association, not a demonstrated
pathway" and "Association, not cause" lines are faithful to the sources.

They support nothing stronger. Specifically they do **not** support:
- "scap upward-rotation timing is the **dominant driver of subacromial space**"
  (`overhead-mobility.json:889`) — a causal-magnitude claim in neither abstract,
  and inconsistent with the association framing 400 lines earlier in the same file;
- "the **most consistently documented** kinematic association" (`:31`, `:455`) —
  the 2009 review lists impingement, cuff tendinopathy, cuff tears, instability,
  adhesive capsulitis and stiff shoulders without ranking them;
- **endurance** in **sustained** overhead flexion at **≥170°** (handstand-walk) —
  Ludewig & Cook measured EMG amplitude during ramped elevation across 31-120°
  under handheld loads, in construction workers, cross-sectionally.

They are also weaker than the file implies in one respect nobody has recorded:
Ludewig & Reynolds 2009 self-grades as **Level of Evidence 5**.

## Claims now unsupported

Programme assertions left standing on a citation that is not SUPPORTS:

1. **`overhead-mobility.json:889`** — "scap upward-rotation timing is the dominant
   driver of subacromial space." No source in this batch supports a causal-driver
   claim. *(ludewig_cook_2000 / ludewig_reynolds_2009)*
2. **`overhead-mobility.json:31` and `:455`** — "the most consistently documented
   kinematic association". Ranking not present in the 2009 review's abstract.
3. **`overhead-mobility` sleeper-stretch selection** — the only trial cited for it
   tested the **cross-body** stretch in **asymptomatic** students, with a
   non-significant between-group difference. *(manske_2010)*
4. **`handstand-walk.json:1599` and the 170° Tier B+ prerequisite** — "sustained
   flexion at ≥170° draws on serratus anterior, upper/lower trapezius endurance
   (Ludewig & Cook 2000 …)". The paper measures neither endurance nor that range.
   The file already labels the threshold an engineering choice at `:1658`; the
   citation should not also be claimed to underpin it. *(ludewig_cook_2000)*
5. **`engine-builder.json:1214` and `:1230`** — "detectable at 5-10 training
   sessions" / "mitochondrial signalling protein bursts precede functional enzyme
   upregulation by 5-10 sessions". Perry reports **mRNA** bursts at 4 h after
   session 1 and enzyme activity up by **session 3**; Little reports adaptation
   after six sessions in two weeks. The number and the molecule are both wrong.
   *(perry_2010, little_2010)*
6. **`engine-builder.json:1230`** — "hard intervals on a missing base generate
   fatigue signals without adaptation payoff", warranted by Perry + Little. Both
   are HIIT-from-baseline studies that produced adaptation with no base phase.
   *(perry_2010, little_2010)*
7. **`engine-builder.json` post-block prescription** — "2 aerobic sessions/week
   with intensity preserved". Mujika & Padilla Part II supports "intensity
   maintained, frequency reduced only moderately"; the session count is Terav's.
   *(mujika_padilla_2000)*
8. **`rowing-2k-test-prep.json:410` and `:665`** — "~3% performance uplift" and
   "volume down 40-60%" credited to Mujika & Padilla 2000. The 41-60% figure is
   Bosquet 2007 (PMID 17762369); the ~3% figure is in neither abstract I
   retrieved. `:36` in the same file already attributes correctly — the two
   rendered strings do not. *(mujika_padilla_2000_b)*
9. **`rowing-2k-test-prep.json`** — Midgley cited as "intensity distribution meta
   for endurance". No meta-analysis exists under either candidate record, and the
   paper matching the cited year/volume/pages argues the evidence base is too thin
   to prescribe from. *(midgley_2007)*
10. **`concurrent-strength-maintenance.json:562`** — "2×/wk is sufficient for
    maintenance in trained lifters", jointly credited to Murach & Bagley 2016.
    That review's abstract contains no frequency prescription. (Schumann 2022, the
    co-attribution, is outside this batch.) *(murach_bagley_2016)*
11. **`concurrent-strength-maintenance.json:841`** — "10-week CrossFit — VO2max +
    body comp + strength all improve concurrently". Not in the review's abstract;
    full text not retrievable. Currently unused by any prose string.
    *(meyer_morrison_zuniga_2017)*
12. **`readiness_after_layoff` proposal, printed as "Source: ACSM 2002"** — the
    position stand addresses load progression in **healthy adults** and says
    nothing about graduating out of a rehabilitation re-introduction phase. This
    is the only claim in the batch attached to a live user decision.
    *(kraemer_2002_acsm_position_stand)*
13. **first-strict-pullup / muscle-up** — "treat sub-skills as independent state
    variables", anchored to Newell. The chapter I read says the three constraint
    categories "**interact**", and is about the development of coordination in
    children. *(newell_1985)*

Two further items that are not claims but are wrong in the shipped artifact and
are visible to users on `/evidence`:

- `mujika_padilla_2000.url` links to a **plant-genetics** paper.
- `perry_2010.url` and `perry_2010.source` link and point to **Gurd et al.**, a
  different study.

I report; I have changed nothing. A human decides what to correct and how.
