# Citation sweep — batch 1 (17 ids, A–B)

Date: 2026-09-05
Auditor scope: existence · identifier · attribution · support · status · reach.
Every verdict below rests on text I retrieved during this sweep. Where I could
not retrieve the text, the verdict is `NOT_FOUND` and I say what I ran.

Records checked: `next-app/public/data/citations.json` (126 entries) and the
per-programme copies in `next-app/public/data/programs/*.json`
(`evidence_base.references[]`). The programme copies and the library copies of
these 17 are byte-identical in the fields that matter, so every metadata defect
below exists in **both** places.

---

### achten_jeukendrup_2003 — SUPPORTS
**Cited for:** "Fatmax at ~63% VO2max (range 45-75%) in trained men. Cited in physiological_targets fat-oxidation entry." (engine-builder.json)
**Claimed:** Achten J, Jeukendrup AE (2003), *Maximal fat oxidation during exercise in trained men*, Int J Sports Med 24(8):603-608, https://pubmed.ncbi.nlm.nih.gov/14598198/
**Found:** PMID 14598198 via NCBI efetch — `Int J Sports Med. 2003 Nov;24(8):603-8. doi: 10.1055/s-2003-43265.` Authors, title, year, volume, issue, pages all as claimed. URL resolves to this paper.
**Quoted:** "Maximal fat oxidation rates of 0.52 +/- 0.15 g x min(-1) were reached at 62.5 +/- 9.8 % VO(2)max… In the present study the average intensity of maximal fat oxidation was located at 63 % VO(2)max. Even within a homogeneous group of subjects, there was a relatively large inter-individual variation in Fat(max) and the rate of maximal fat oxidation."
**Verdict:** SUPPORTS — the 63% figure is verbatim and the "trained men" qualifier is correct (n=55 male endurance-trained subjects, cycle ergometer).
**Reach / precision note:** the parenthetical "(range 45-75%)" is **not** in the abstract. The abstract reports 62.5 ± 9.8% SD. 45-75% is roughly ±1.3 SD, so it is a defensible gloss but it is the repo's number, not the paper's. Population is male cyclists on a cycle ergometer; engine-builder applies it to row/bike/ski-erg and to all users. `needs-credentialed-human` for the reach; `data-defect` (minor) for presenting an unquoted range as if cited.
**Consequence:** renders on `/evidence` (`app/evidence/page.tsx` prints `authors (year). title — source` + link) and inside `engine-builder.json` `physiological_targets`, which `ProgramPreviewClient` surfaces. No engine rule branches on it.

---

### ackerman_1988 — NOT_FOUND (record verified; content unverifiable)
**Cited for:** "Individual variance in psychomotor learning. Underpins 'no cohort ETA' in outcome_evidence." (handstand-walk.json)
**Claimed:** Ackerman PL (1988), *Determinants of individual differences during skill acquisition*, J Exp Psychol: General 117:288-318. No URL.
**Found:** Crossref DOI `10.1037/0096-3445.117.3.288` — "Determinants of individual differences during skill acquisition: Cognitive abilities and information processing.", Ackerman Phillip L., 1988, Journal of Experimental Psychology: General, vol 117, pp 288-318. Unpaywall: `"oa_status": "closed"`, `"has_repository_copy": false`, `"oa_locations": []`. OpenAlex: `NO ABSTRACT`. Semantic Scholar: `"abstract": null` with publisher-elision notice. PsycNET record page returned only "Loading…".
**Quoted:** (metadata only) "Determinants of individual differences during skill acquisition: Cognitive abilities and information processing." | Journal of Experimental Psychology General | 1988 | 117 | 288-318
**Verdict:** NOT_FOUND — the work exists and author/year/venue/pages are correct, but **no abstract or full text is reachable from any open source**, so I cannot confirm it supports "individual variance in psychomotor learning", still less handstand-walk's stronger in-body claim "Ackerman 1988 and Wu 2014 both show 3-10× individual variance in psychomotor learning".
**Searches run:** PubMed esearch (`Ackerman[au] AND determinants of individual differences during skill acquisition` → 3 unrelated PMIDs), Crossref bibliographic query, `api.semanticscholar.org/graph/v1/paper/DOI:…`, `api.unpaywall.org/v2/…`, `api.openalex.org/works/doi:…`, WebFetch of `psycnet.apa.org/record/1989-01185-001`.
**Data-defect (separate, certain):** the title in `citations.json` truncates the subtitle. The paper is "…skill acquisition: **Cognitive abilities and information processing**". Users see the truncated form on `/evidence`.
**Reach:** the paper is cognitive-ability psychology, not handstand motor learning. The "3-10×" figure has no retrievable source in this citation. `needs-credentialed-human`.
**Consequence:** `handstand-walk.json` `outcome_evidence` and `total_arc_weeks_estimate.note` — the "No cohort ETA" refusal to promise a timeline. That refusal is conservative, so an unsupported citation here does not endanger a user; it does make the "every change cites a study" line on `/evidence` weaker than it reads.

---

### andersen_henriksson_1977 — SUPPORTS
**Cited for:** "Foundational study showing +20% capillary density after 8 weeks of 40 min/day, 4×/wk continuous work. Cited in physiological_targets." (engine-builder.json) · "Foundational capillary density +20% in 8 wk endurance" (concurrent-strength-maintenance.json)
**Claimed:** Andersen P, Henriksson J (1977), J Physiol 270(3):677-690, https://pubmed.ncbi.nlm.nih.gov/198532/
**Found:** PMID 198532 — `J Physiol. 1977 Sep;270(3):677-90.` Everything as claimed; URL resolves correctly.
**Quoted:** "Five subjects trained for 8 weeks on a bicycle ergometer for an average of 40 min/day, four times a week at a work load requiring 80% of the maximal oxygen uptake… The training programme resulted in a 16% increase in V(O2 max.), a 20% increase in capillary density…"
**Verdict:** SUPPORTS — the used_for string is an accurate paraphrase down to the dose (40 min/day, 4×/wk, 8 wk) and the +20%.
**Reach note:** n = 5, at 80% VO2max. engine-builder cites it for Z1 (low-intensity) volume; the trained intensity was 80% VO2max, not Z1. Also, the adjacent physiological_targets line attributes "+13±3%" capillary density to a group that includes this paper — that number is not Andersen's (+20% is). `needs-credentialed-human`.
**Consequence:** `engine-builder.json` `physiological_targets` capillary line and `concurrent-strength-maintenance.json` evidence base. Display only; no rule reads it.

---

### aragon_schoenfeld_2013 — OVERSTATED
**Cited for:** "Anabolic window is 4-6h, not 30 min — supports 6h separation compatibility" (concurrent-strength-maintenance.json)
**Claimed:** Aragon AA, Schoenfeld BJ (2013), *Nutrient timing revisited: is there a post-exercise anabolic window?*, J Int Soc Sports Nutr 10:5. No URL.
**Found:** PMID 23360586 / PMC3577439 — metadata exactly as claimed. Full text pulled from Europe PMC (`/webservices/rest/PMC3577439/fullTextXML`).
**Quoted:** "Due to the transient anabolic impact of a protein-rich meal and its potential synergy with the trained state, pre- and post-exercise meals should not be separated by more than approximately 3–4 hours, given a typical resistance training bout lasting 45–90 minutes. If protein is delivered within particularly large mixed-meals (which are inherently more anticatabolic), a case can be made for lengthening the interval to 5–6 hours." … "widely varying feeding patterns among individuals challenge the common assumption that the post-exercise 'anabolic window of opportunity' is universally narrow and urgent."
**Verdict:** OVERSTATED — two distinct distortions. (a) The paper's number is a **3-4 hour** pre-to-post *meal* interval, extendable to 5-6 h only with large mixed meals; "the anabolic window is 4-6h" is not a sentence this paper contains, and the repo's figure sits above the paper's default. (b) The paper is about **nutrient timing around one resistance bout**. It says nothing about spacing an endurance session from a strength session, so it cannot "support 6h separation compatibility" — that is a different construct.
**Mitigation, verified in the data:** the 6h rule itself is *not* hung on this paper. `principles[].six_hour_separation` reads "Robineau 2016 dose-response tested 0h / 6h / 24h…", `concurrent_strength_prescription.reason_separation` names Robineau, and `engineering_choices_flagged` already concedes "the paper does not establish 6h as *the* threshold". Aragon is decoration on a rule that stands on Robineau.
**Classification:** `data-defect` (the used_for misstates the paper's number and construct).
**Consequence:** `/evidence` listing and CSM `evidence_base`. Nothing in `src/` reads this id — `grep -rn aragon src/` returns nothing. No prescription depends on it.

---

### atherton_2005 — SUPPORTS
**Cited for:** "AMPK-PKB switch — molecular basis of concurrent interference" (concurrent-strength-maintenance.json)
**Claimed:** Atherton PJ, Babraj J, Smith K, et al. (2005), FASEB J 19(7):786-788. No URL.
**Found:** PMID 15716393 — `FASEB J. 2005 May;19(7):786-8. doi: 10.1096/fj.04-2179fje.` Volume/issue/pages exactly as claimed. Crossref confirms the DOI and the full title.
**Quoted:** "HFS selectively activates the PKB-TSC2-mTOR cascade causing a prolonged activation of translational regulators… We term this behavior the 'AMPK-PKB switch.' We hypothesize that the AMPK-PKB switch is a mechanism that partially mediates specific adaptations to endurance and resistance training, respectively."
**Verdict:** SUPPORTS — "AMPK-PKB switch" is the paper's own coinage and the interference mechanism is its stated hypothesis.
**Reach note:** the study is **isolated rat muscle under electrical stimulation** (LFS 3 h at 10 Hz; HFS 6×10 bursts at 100 Hz), and the authors say "We hypothesize", not "we show", for the training-adaptation link. CSM presents it as "molecular basis" without the species or the hedge. `needs-credentialed-human`.
**Consequence:** CSM `evidence_base` + `/evidence`. Mechanistic framing only; the RPE-7 ceiling and 6h rule cite Schumann and Robineau.

---

### baar_2014 — SUPPORTS
**Cited for:** "AMPK window ~3h post-endurance; mTORC1 sensitised 18-24h post-lifting" (concurrent-strength-maintenance.json)
**Claimed:** Baar K (2014), *Using molecular biology to maximize concurrent training*, Sports Med 44(S2):S117-S125. No URL.
**Found:** PMID 25355186 / PMC4213370 — `Sports Med. 2014 Nov;44 Suppl 2(Suppl 2):S117-25.` Exactly as claimed. Full text via Europe PMC.
**Quoted:** "Then, a period of recovery of at least 3 h should be given, so that AMPK and SIRT1 activity can return to baseline levels, before resistance exercise is performed. This suggestion is based on the fact that AMPK activity increases rapidly and then returns to baseline levels within the first 3 h after high-intensity exercise [63], whereas mTORC1 activity can be maintained for at least 18 h after resistance exercise [8, 9]."
**Verdict:** SUPPORTS — both halves of the used_for map onto that sentence.
**Precision note:** the paper says "**at least** 18 h"; "18-24h" is the repo's bracketing, and "sensitised" is the repo's word for "activity can be maintained". Neither changes the direction. Note also the paper's own recommendation is *endurance first, then lift ≥3 h later* — the opposite ordering to CSM's `lift_first_rule` (which cites Eddens 2018, outside this batch). Worth a human eye on the two rules coexisting.
**Consequence:** CSM `evidence_base` + `/evidence`. `grep -rn baar_2014 src/` → nothing.

---

### baggish_wood_2011 — NOT_FOUND (record verified; content unverifiable)
**Cited for:** "Eccentric vs concentric LV remodelling review — endurance training drives eccentric hypertrophy, strength/isometric drives concentric. Cited in physiological_targets." (engine-builder.json)
**Claimed:** Baggish AL, Wood MJ (2011), Circulation 123(23):2723-2735, https://www.ahajournals.org/doi/10.1161/CIRCULATIONAHA.110.981571
**Found:** PMID 21670241 — `Circulation. 2011 Jun 14;123(23):2723-35. doi: 10.1161/CIRCULATIONAHA.110.981571.` Authors, title, year, volume, issue, pages, DOI all correct. Europe PMC core record confirms `Circulation 123 2723-2735 2011`.
**Quoted:** PubMed record carries **no abstract** ("Athlete's heart and cardiovascular care of the athlete: scientific and clinical update. / Baggish AL(1), Wood MJ. / … / DOI: … / PMID: 21670241" — nothing between). Europe PMC: `abstract: NONE`, `isOpenAccess: N`.
**Verdict:** NOT_FOUND — for the *support* step only. The citation record itself is clean and the URL resolves to the right article. I could not read one sentence of the paper, so I will not assert what it says about eccentric vs concentric remodelling.
**Searches run:** NCBI efetch PMID 21670241; Europe PMC core search by DOI; WebFetch of the AHA DOI URL (**HTTP 403**); web search for an open copy (returned only citing works).
**Classification:** `data-defect` in the weak sense — the claim is uncheckable from the record as shipped. Adding a PMC/open mirror or an `verification_status` marker would fix it.
**Consequence:** `engine-builder.json` `physiological_targets`: "Left-ventricular stroke volume +5-10% in 8 weeks — REQUIRES interval intensity ≥90% HRmax… Cardiac remodelling is eccentric with endurance training (Baggish & Wood 2011)." That is displayed as an expected outcome to Engine Builder users. The +5-10% SV figure is attributed to Helgerud in the same sentence, not to Baggish.

---

### barlow_2020 — SUPPORTS (content) · hard metadata defect
**Cited for:** "Wrist WB tolerance declines from age 45. Informs the age-band intake question and Tier B+ warm-up ramp for older users." (handstand-walk.json)
**Claimed:** "Barlow C, Scholtz K, Medeiros DM (2020), *Adult wrist weight-bearing tolerance across the lifespan*, Journal of Hand Therapy (n=465 healthy adults)". No URL, no DOI.
**Found:** PMID 33309075 — `J Hand Ther. 2022 Jan-Mar;35(1):74-79. doi: 10.1016/j.jht.2020.10.019. Epub 2020 Oct 24.` **"Wrist weight-bearing tolerance in healthy adults." Barlow SJ, Scholtz JS, Medeiros W.**
**Quoted:** "A sample (N = 465) of healthy adults ages 18-64 completed a questionnaire… A 2-way analysis of covariance revealed main effects for both gender (20.9, 95% CI [15.7, 26.0] pounds, P < .001) and age (F(4, 454) = 6.143, P < .001, partial η2 = .051). The highest weight-bearing tolerance was observed in males and individuals 25-34 years of age. Multiple regression analysis affirmed that gender, height and age categories of 45-54 and 55 to 64 were all statistically significant predictors of wrist weight-bearing tolerance, P < .01."
**Verdict:** SUPPORTS — the physiological claim holds: age is a significant predictor and the 45-54 / 55-64 bands are the ones that move, which is what "declines from age 45" asserts. n=465 is correct.
**`data-defect`, and it is not cosmetic:** three of the record's five fields are wrong. The **title as shipped does not exist** — the paper is "Wrist weight-bearing tolerance in healthy adults", not "Adult wrist weight-bearing tolerance across the lifespan". Author initials are wrong on all three names (`Barlow C / Scholtz K / Medeiros DM` vs `Barlow SJ / Scholtz JS / Medeiros W`). The year is the epub year; the issue is 2022;35(1):74-79. A reader who searches the printed title will not find the paper. There is no DOI or URL in the record, so `/evidence` renders it as unlinked text. DOI to add: `10.1016/j.jht.2020.10.019`.
**Reach note:** the measurement is a static push against a calibrated analog scale by a questionnaire-screened sample aged 18-64. It is not handstand load, not repeated load, and not a tolerance-over-time measure. Extending it to "extra warm-up ramp for handstand practice" is a judgement. `needs-credentialed-human`.
**Consequence — and a behaviour claim that does not hold:** the id is quoted inside a user-visible intake hint. `handstand-walk.json` `intake.questions[age_band].options[46_60].hint` = *"Barlow 2020: wrist WB tolerance drops from age 45 — extra ramp built in"*. `IntakeClient.tsx:1069` renders `opt.hint` (only when `step.tone === "calibration"`). **`46_60` appears exactly once in the whole repo — in that option — and `age_band` appears zero times under `next-app/src/`.** Nothing branches on the answer. The `intake.safety_gates` entry that does produce a ramp warning keys off `wrist_pain_12mo`, not age. So the promise "extra ramp built in" is copy, not behaviour. `data-defect`.

---

### bartlett_2015 — SUPPORTS
**Cited for:** "Train-low framework — low CHO amplifies AMPK/PGC-1α/p53" (concurrent-strength-maintenance.json)
**Claimed:** Bartlett JD, Hawley JA, Morton JP (2015), *Carbohydrate availability and exercise training adaptation: too much of a good thing?*, Eur J Sport Sci 15(1):3-12. No URL.
**Found:** PMID 24942068 — `Eur J Sport Sci. 2015;15(1):3-12. doi: 10.1080/17461391.2014.920926. Epub 2014 Jun 19.` Authors, title, venue, volume, issue, pages all as claimed. (Crossref shows the same DOI with an online-first date of 2014-06-19; the issue year 2015 in the record is correct.)
**Quoted:** "…deliberately training in conditions of reduced CHO availability can promote training-induced adaptations of human skeletal muscle… Such data have led to the concept of 'training low, but competing high'… The augmented training response observed with training-low strategies is likely regulated by enhanced activation of key cell signalling kinases (e.g. AMPK, p38MAPK), transcription factors (e.g. p53, PPARδ) and transcriptional co-activators (e.g. PGC-1α)…"
**Verdict:** SUPPORTS — AMPK, PGC-1α and p53 are all named, in the stated direction, under the stated "train low" framework.
**Reach note:** the review's closing caution is not carried into the used_for: "athletes should practise 'train-low' workouts in conjunction with sessions undertaken with normal or high CHO availability so that their capacity to oxidise CHO is not blunted on race day." Also "the optimal practical strategies to train low are not currently known." If any CSM copy tells a user to train low, that caveat should travel with it. `needs-credentialed-human`.
**Consequence:** CSM `evidence_base` + `/evidence`. No code reads it.

---

### berryman_2018 — MISATTRIBUTED
**Cited for:** "Short-term cessation effects on running energy cost + neuromuscular performance. Terav extrapolates this running-side sensitivity to a modality-preference read (cycling as the safer concurrent partner) — see engineering_choices_flagged. Wilson 2012 + Doma 2019 carry the direct concurrent-interference evidence." (concurrent-strength-maintenance.json)
**Claimed:** Berryman N, Mujika I, Bosquet L (2018), *Effects of short-term concurrent training cessation on the energy cost of running and neuromuscular performances*, Int J Sports Physiol Perform 13(1):57-64.
**Found:** **The record is a chimera of two different Berryman papers.**
- Title + author list match PMID 33374897 / DOI `10.3390/sports9010001` — "Effects of Short-Term Concurrent Training Cessation on the Energy Cost of Running and Neuromuscular Performances in Middle-Distance Runners", Berryman N, Mujika I, Bosquet L, **Sports (Basel). 2020 Dec 22;9(1):1**.
- Year + venue + volume + issue + pages match Crossref `10.1123/ijspp.2017-0032` — "**Strength Training for Middle- and Long-Distance Performance: A Meta-Analysis**", Berryman Nicolas, Mujika Iñigo, **Arvisais Denis, Roubeix Marie**, *International Journal of Sports Physiology and Performance* **13**, **57-64**, **2018**.
**Quoted (the paper the used_for actually describes, PMID 33374897):** "Eight runners completed this study… The results suggest that the energy cost of running improvements observed after the intervention (-5.75%; 95% CI = -8.47 to -3.03) were maintained once explosive strength training was interrupted (-6.31%; 95% CI = -10.30 to -2.32)… However, coaches and athletes must interpret these results cautiously considering the study's low sample size and the very limited available literature in this domain."
**Verdict:** MISATTRIBUTED — the identifier set (2018, IJSPP 13(1):57-64) points to a different paper by an overlapping author team. A reader following the citation lands on a strength-training meta-analysis, not the cessation study. The *content* claim is fine against the 2020 Sports paper.
**Fix direction (for a human):** either repoint to `10.3390/sports9010001`, Sports 2020;9(1):1, and rename the id, or keep the id and repoint title/authors to the IJSPP meta-analysis. Both are real; they are not the same work.
**Reach note:** whichever is chosen, the cessation study is **n = 8 middle-distance runners** and the authors themselves flag the sample size. CSM already flags the cycling-modality extrapolation in `engineering_choices_flagged`, which is the right instinct — but the extrapolation is running off a single 8-person trial. `needs-credentialed-human`.
**Consequence:** `/evidence` row (renders "Berryman N, Mujika I, Bosquet L (2018). Effects of short-term concurrent training cessation… — Int J Sports Physiol Perform 13(1):57-64", a combination that does not exist) and CSM's modality-preference rationale. No engine rule reads the id.

---

### billat_2000 — SUPPORTS (content) · year defect
**Cited for:** "Interval-training review. Supports the threshold + VO2max weekly dose." (engine-builder-block-2.json) · "Aerobic interval prescription" (rowing-2k-test-prep.json)
**Claimed:** Billat V (**2000**), Sports Med 31(1):13-31. `display_line`: "Billat (2000), Sports Med 31(1)".
**Found:** PMID 11219499 — `Sports Med. **2001**;31(1):13-31. doi: 10.2165/00007256-200131010-00002.` Author is **Billat LV** (single author).
**Quoted:** "Interval training involves repeated short to long bouts of rather high intensity exercise (equal or superior to maximal lactate steady-state velocity) interspersed with recovery periods (light exercise or rest)… outside of the competition season it seems better to refer to the velocities associated with particular physiological responses in the range from maximal lactate steady state to the absolute maximal velocity."
**Verdict:** SUPPORTS the "interval-training review / aerobic interval prescription" use. The paper is a history-and-recommendations review of aerobic interval training in middle- and long-distance running.
**`data-defect`:** the **year is wrong by one**. Sports Med 31(1) is the 2001 volume. The wrong year is in `citations.json` `year`, `display_short` ("Billat 2000"), `display_line` ("Billat (2000), Sports Med 31(1)"), the id itself, and both programme copies. `/evidence` prints "Billat V (2000)."
**Reach note:** the review makes no weekly-dose recommendation in the abstract — it is qualitative about intensity anchoring. "Supports the threshold + VO2max weekly dose" is doing more work than the abstract licenses; the dose numbers in engine-builder-block-2 should be traced to whatever else supplies them. Population is middle- and long-distance **runners**; rowing-2k applies it to erg intervals. `needs-credentialed-human`.
**Consequence:** `/evidence` and two programmes' `evidence_base`. No engine rule reads it.

---

### billat_2001 — SUPPORTS (content) · year defect (2 years)
**Cited for:** "MLSS / LT2 concept — the underlying physiology of the threshold work in this block." (engine-builder-block-2.json) · "MLSS as threshold intensity target" (rowing-2k-test-prep.json)
**Claimed:** Billat V, Sirvent P, Py G, et al. (**2001**), *The concept of maximal lactate steady state*, Sports Med 33(6):407-426.
**Found:** PMID 12744715 — `Sports Med. **2003**;33(6):407-26. doi: 10.2165/00007256-200333060-00003.` "The concept of maximal lactate steady state: **a bridge between biochemistry, physiology and sport science**." Billat VL, Sirvent P, Py G, Koralsztein JP, Mercier J.
**Quoted:** "The maximal lactate steady state (MLSS) is defined as the highest blood lactate concentration (MLSSc) and work load (MLSSw) that can be maintained over time without a continual blood lactate accumulation. A close relationship between endurance sport performance and MLSSw has been reported…"
**Verdict:** SUPPORTS — MLSS as a threshold-intensity construct is exactly what the paper defines.
**`data-defect`:** **year wrong by two** (2003, not 2001) across `year`, `display_short`, `display_line`, the id, and both programme copies. Title is also truncated (subtitle dropped).
**Reach note the repo does not carry:** "MLSSc has been reported to demonstrate a great variability between individuals (from 2-8 mmol/L) in capillary blood **and not to be related to MLSSw**." Any app copy that implies a fixed lactate number marks the threshold is not supported by this paper. `needs-credentialed-human`.
**Consequence:** `/evidence` and two programmes. No engine rule reads it.

---

### bishop_2008 — SUPPORTS (content) · year defect (3 years)
**Cited for:** "Repeated-sprint / short-interval training recommendations. Supports the short-interval alternation with 4×4." (engine-builder-block-2.json) · "Repeated-sprint-ability programming. Note (2026-08-17 review): RSA is not the correct energy-system framing for 6×500m at 2K pace. Buchheit & Laursen 2013 covers this better; kept in the library but the race-pace justification now defers to Buchheit & Laursen." (rowing-2k-test-prep.json)
**Claimed:** Bishop D, Girard O, Mendez-Villanueva A (**2008**), Sports Med 41(9):741-756.
**Found:** PMID 21846163 — `Sports Med. **2011** Sep 1;41(9):741-56. doi: 10.2165/11590560-000000000-00000.` Authors and title exactly as claimed.
**Quoted:** "…two key recommendations emerge from this review; it is important to include (i) some training to improve single-sprint performance (e.g. 'traditional' sprint training and strength/power training); and (ii) some high-intensity (80-90% maximal oxygen consumption) interval training to best improve the ability to recover between sprints." Also: "This review has highlighted that **there is not one type of training that can be recommended** to best improve RSA…"
**Verdict:** SUPPORTS the engine-builder-block-2 use — high-intensity interval work alongside sprint work is the review's explicit recommendation.
**`data-defect`:** **year wrong by three**. Sports Med 41(9) is 2011. Wrong in `year`, `display_short` ("Bishop et al. 2008"), `display_line`, the id, and both programme copies.
**Rowing-2k:** the repo has already self-corrected here — the record itself says RSA is the wrong framing for 6×500m and defers to Buchheit & Laursen. That note is honest and should stay; it makes the rowing use no longer load-bearing.
**Reach note:** the population is team-sport athletes doing ≤10 s sprints with ≤60 s recovery. A 4×4-minute Norwegian interval is not a repeated sprint. The engine-builder-block-2 use survives on the 80-90% VO2max interval recommendation, not on the RSA construct. `needs-credentialed-human`.
**Consequence:** `/evidence` and two programmes. No engine rule reads it.

---

### bishop_2019 — MISATTRIBUTED
**Cited for:** "Volume drives mitochondrial content beyond a threshold. Anchors the Z1 volume floor rising across Block 2." (engine-builder-block-2.json) · "Volume-vs-intensity signalling synthesis. Informs the block's volume-first design in weeks 1-3." (engine-builder.json)
**Claimed:** Bishop DJ, Botella J, Granata C (2019), *CrossTalk opposing view: exercise training volume is more important than training intensity to promote increases in mitochondrial content*, **Physiology 34(1):56-70**, url `https://journals.physiology.org/doi/full/10.1152/physiol.00038.2018`
**Found:** **Another chimera — title and identifier are two different papers.**
- The title is real: PMID 31309570 — "CrossTalk opposing view: Exercise training volume is more important than training intensity to promote increases in mitochondrial content." Bishop DJ, Botella J, Granata C. **J Physiol. 2019 Aug;597(16):4115-4118. doi: 10.1113/JP277634.**
- The `source` and `url` are a *different* paper: DOI `10.1152/physiol.00038.2018` = PMID 30540234 — "**High-Intensity Exercise and Mitochondrial Biogenesis: Current Controversies and Future Research Directions.** Bishop DJ, Botella J, **Genders AJ, Lee MJ, Saner NJ, Kuang J, Yan X, Granata C**. Physiology (Bethesda). 2019 Jan 1;34(1):56-70."
**Quoted (the paper the URL actually opens):** "It is well established that different types of exercise can provide a powerful stimulus for mitochondrial biogenesis. However, **there are conflicting findings in the literature, and a consensus has not been reached** regarding the efficacy of high-intensity exercise to promote mitochondrial biogenesis in humans. The purpose of this review is to examine current controversies in the field and to highlight some important methodological issues that need to be addressed to resolve existing conflicts."
**Verdict:** MISATTRIBUTED — the DOI shipped in the record resolves to a different work with a different author list, and that work's stated position is *"a consensus has not been reached"*, which is weaker than "volume drives mitochondrial content beyond a threshold". A user who taps the "link" on `/evidence` reads a paper that does not make the claim the row is cited for.
**On the CrossTalk itself:** J Physiol carries **no abstract** for 597:4115-4118 and Europe PMC reports `isOpenAccess: N`, so I could not read its body. Its *title* asserts the volume-over-intensity position, and a CrossTalk is by construction one side of a debate with a published rebuttal (`Comment in: J Physiol. 2019;597(16):4119-4120`). The used_for reads as settled physiology; the source format is an explicitly contested position piece. That is an `OVERSTATED`-shaped problem sitting underneath the `MISATTRIBUTED` one, and I flag it rather than resolve it.
**Fix direction (for a human):** decide which paper is meant. If the CrossTalk: `10.1113/JP277634`, J Physiol 2019;597(16):4115-4118, and the used_for should name it as one side of a CrossTalk. If the Physiology review: 8 authors, and the used_for cannot claim volume "drives" anything.
**Consequence:** this is the most load-bearing id in the batch. It is cited as the **anchor for the rising Z1 volume floor across Engine Builder Block 2** and for "the block's volume-first design in weeks 1-3" in Engine Builder — i.e. it is the stated justification for how much low-intensity work the app asks a user to do. It renders on `/evidence` with a working link to the wrong paper.

---

### blenkinsop_2017 — SUPPORTS
**Cited for:** "Confirms wrist-strategy dominance under perturbation. Used in physiological_targets and freestand-attempt drill rationale." (handstand-walk.json)
**Claimed:** Blenkinsop GM, Pain MTG, Hiley MJ (2017), *Balance control strategies during perturbed and unperturbed balance in standing and handstand*, Royal Society Open Science 4:161018. No URL.
**Found:** PMID 28791131 — `R Soc Open Sci. 2017 Jul 26;4(7):161018. doi: 10.1098/rsos.161018.` Authors, title, year, volume, article number all as claimed. Open access (PMC5541526).
**Quoted:** "During perturbed and unperturbed balance in handstand, the most prevalent control strategy was a wrist strategy, which was employed for more than 75% of the time in balance… In contrast to previous literature, surprisingly little time was spent in a mixed strategy, representing less than 1% of time in standing balance and approximately 2% of time in handstand balance."
**Verdict:** SUPPORTS — "wrist-strategy dominance under perturbation" is stated almost verbatim, and the abstract covers both perturbed and unperturbed conditions, so the used_for if anything understates it.
**Minor `data-defect`:** no DOI/URL in the record despite the paper being fully open access. Add `10.1098/rsos.161018` / PMC5541526 so `/evidence` can link it.
**Reach note:** the abstract does not report sample size or skill level; handstand-walk uses it to justify a freestand-attempt drill for novices. The strategy finding is descriptive biomechanics, not evidence that training the wrist strategy improves handstand acquisition. `needs-credentialed-human`.
**Consequence:** `handstand-walk.json` `physiological_targets` ("the handstand hold is wrist-torque-dominated (Kerwin & Trewartha 2001; Blenkinsop 2017)") and `session_rationale.block_skill_A_wall_hold` / freestand-search rationale — copy users read on the session screen.

---

### bouchard_1999_heritage — SUPPORTS (core figures) · OVERSTATED (the "~10×" gloss) · one UI string MISATTRIBUTED
**Cited for (four uses):**
- "Heritability of VO2max response = 47%; 2.5× between-family variance" (concurrent-strength-maintenance.json)
- "Heritability of training response 47%; ~10× range in individual gains. Anchors the outcome-range caveat." (engine-builder-block-2.json)
- "Heritability of training response = 47%; ~10× range in individual gains. Cited in outcome_evidence's individual-variation caveat." (engine-builder.json)
- "Individual response variance — informs Push tier honest ranges" (rowing-2k-test-prep.json)
**Claimed:** Bouchard C, An P, Rice T, et al. (1999), J Appl Physiol 87(3):1003-1008, https://pubmed.ncbi.nlm.nih.gov/10484570/
**Found:** PMID 10484570 — `J Appl Physiol (1985). 1999 Sep;87(3):1003-8.` Everything as claimed; URL resolves correctly.
**Quoted:** "A total of 481 sedentary adult Caucasians from 98 two-generation families was exercise trained for 20 wk… The mean increase in VO(2max) reached approximately 400 ml/min, but there was considerable heterogeneity in responsiveness, with some individuals experiencing little or no gain, whereas others gained >1.0 l/min. An ANOVA revealed that there was 2.5 times more variance between families than within families in the VO(2max) response variance. With the use of a model-fitting procedure, the most parsimonious models yielded a maximal heritability estimate of 47% for the VO(2max) response…"
**Verdict — CSM use:** SUPPORTS. "47%" and "2.5× between-family variance" are both verbatim.
**Verdict — engine-builder and engine-builder-block-2 use:** OVERSTATED on one number. "**~10× range in individual gains**" is not in the abstract. What the abstract says is "some individuals experiencing little or no gain, whereas others gained >1.0 l/min" against a mean of ~400 ml/min — an unbounded, undivideable spread (you cannot form a ratio against "little or no gain"). Note also that the heritability estimate is described as "a **maximal** heritability estimate", i.e. an upper bound, which the repo's flat "= 47%" drops. `data-defect`.
**Verdict — rowing-2k use:** OVERSTATED / flagged in-repo. `rowing-2k-test-prep.json` `variance_source.note` states it plainly: "HERITAGE VO2max variance extrapolated to 2K rowing performance. Anaerobic-heavy 2K response tracks aerobic VO2max response with a task-specificity multiplier — trained 2K coordination lifts even non-responders slightly." The "task-specificity multiplier" is an assertion with no cited source. Honest disclosure, still an extrapolation. `needs-credentialed-human`.
**A fourth use, in code, that the paper does not support at all:** `next-app/src/components/workout/SignalsStrip.tsx:388` renders, for the CSM amber-week auto-swap:
> "The engine is holding the Norwegian 4×4 for this week and will resume it next week — per `concurrent-strength-maintenance.json:435`. **Bouchard 1999 HERITAGE variance says a hard aerobic stimulus on top of amber symptoms doesn't pay back**; the strength work stays."

HERITAGE is a 20-week heritability study in 481 sedentary adults. It contains nothing about symptoms, nothing about amber days, and nothing about withholding a session. This is a hardcoded UI string attributing a symptom-gating recommendation to a genetics paper. `data-defect`, and the most straightforwardly wrong thing in the batch, because it is the one instance where the citation appears in prose the user reads at the moment a session is being removed from their week.
**Reach note across all uses:** 481 sedentary Caucasian adults, 20 weeks, cycle ergometer. Terav's users are self-selected trained-ish adults on ergs.
**Consequence (code-verified):**
- `lib/engine/proposal-citations.ts:38` — `non_responder_recommendation: "bouchard_1999_heritage"`, the fallback citation stamped on the non-responder proposal when a programme omits `variance_source`.
- `lib/proposals/select.ts:292` — `citationId: result.variance_source_citation_id ?? null` on the non-responder proposal; both programmes that declare `variance_source` declare this id.
- `lib/engine/citations.ts` `snapshotCitation()` copies `display_short` + `display_line` into the accepted proposal, and `lib/engine/record-export.ts` exports "every accepted proposal — including its citation payload". So a defective display string is **persisted into user records and exported**, not merely rendered.
- `components/workout/SignalsStrip.tsx:388` — the hardcoded prose above.
- `components/citations/CitationRef.tsx` — "Source: {display_short}" under the proposal, expanding to title + journal + link.

---

### bouchard_2011 — SUPPORTS
**Cited for:** "21-SNP model explains 49% of variance — honest range in outcomes" (concurrent-strength-maintenance.json)
**Claimed:** Bouchard C, Sarzynski MA, Rice TK, et al. (2011), *Genomic predictors of the maximal O2 uptake response to standardized exercise training programs*, J Appl Physiol 110(5):1160-1170. No URL.
**Found:** PMID 21183627 — `J Appl Physiol (1985). 2011 May;110(5):1160-70. doi: 10.1152/japplphysiol.00973.2010.` Authors (Bouchard C, Sarzynski MA, Rice TK, Kraus WE, Church TS, Sung YJ, Rao DC, Rankinen T), title, year, volume, issue, pages all as claimed.
**Quoted:** "Stepwise multiple regression analysis of the 39 SNPs identified a panel of **21 SNPs that accounted for 49% of the variance in VO(2max) trainability**. Subjects who carried ≤9 favorable alleles at these 21 SNPs improved their VO(2max) by 221 ml/min, whereas those who carried ≥19 of these alleles gained, on average, 604 ml/min."
**Verdict:** SUPPORTS — "21-SNP model explains 49% of variance" is verbatim, and the 221 vs 604 ml/min contrast is exactly the "honest range in outcomes" the used_for invokes.
**`data-defect` (minor):** no DOI/URL in the record, so `/evidence` renders it unlinked. Add `10.1152/japplphysiol.00973.2010` (PMC3098655, open).
**Reach note:** the paper's own closing line is "**Large-scale replication studies are warranted**", and the 49% is an in-sample stepwise-regression fit in 473 sedentary whites — stepwise selection inflates R² and the panel was only partially replicated (STRRIDE n=183, DREW n=112, HERITAGE blacks n=247, a handful of SNPs each). Presenting 49% as a stable explained-variance figure overstates its generalisability; CSM uses it only as a caveat, which is the right direction. `needs-credentialed-human`.
**Consequence:** CSM `evidence_base` + `/evidence`. `grep -rn bouchard_2011 src/` → nothing.

---

## Summary

| id | verdict | class | identifier resolves to this paper? |
|---|---|---|---|
| achten_jeukendrup_2003 | SUPPORTS | needs-credentialed-human (reach) | yes |
| ackerman_1988 | NOT_FOUND | data-defect (truncated title) | no url; DOI found by me |
| andersen_henriksson_1977 | SUPPORTS | needs-credentialed-human (n=5, intensity) | yes |
| aragon_schoenfeld_2013 | OVERSTATED | data-defect | no url |
| atherton_2005 | SUPPORTS | needs-credentialed-human (rat, ex vivo) | no url |
| baar_2014 | SUPPORTS | — | no url |
| baggish_wood_2011 | NOT_FOUND | data-defect (uncheckable) | yes, but paywalled + no abstract |
| barlow_2020 | SUPPORTS | **data-defect (title + all 3 author initials + year wrong; unimplemented behaviour claim)** | no url |
| bartlett_2015 | SUPPORTS | needs-credentialed-human (caveat dropped) | no url |
| berryman_2018 | **MISATTRIBUTED** | data-defect | **no — two papers merged** |
| billat_2000 | SUPPORTS | data-defect (year 2001) | no url |
| billat_2001 | SUPPORTS | data-defect (year 2003) | no url |
| bishop_2008 | SUPPORTS | data-defect (year 2011) | no url |
| bishop_2019 | **MISATTRIBUTED** | data-defect | **no — url opens a different paper** |
| blenkinsop_2017 | SUPPORTS | data-defect (missing OA doi) | no url |
| bouchard_1999_heritage | SUPPORTS / OVERSTATED | data-defect | yes |
| bouchard_2011 | SUPPORTS | data-defect (missing doi) | no url |

Counts: SUPPORTS 11 · OVERSTATED 1 (+1 partial) · MISATTRIBUTED 2 · NOT_FOUND 2 · CONTRADICTS 0 · SUPERSEDED 0.
No retractions or corrections surfaced on any of the 17 records I retrieved.

**Cross-cutting observations**

1. **Four wrong years, all rendered to users.** billat_2000 (→2001), billat_2001 (→2003), bishop_2008 (→2011), barlow_2020 (→2022 issue). `/evidence` prints `{authors} ({year}).` directly, and `display_line` carries the wrong year too. `data-integrity.test.ts` has two citation-display tests — "a two-author paper is 'A & B', never 'A et al.'" and "no url is a search query instead of the article" — but **nothing checks a year, venue, or title against any external record**. That is the systematic gap; every defect in this batch is of a kind those two tests cannot see.
2. **Two chimeric records** (berryman_2018, bishop_2019) built from two real papers each. Both look impeccable to a reader and to the schema. bishop_2019's URL is live and opens the wrong paper — the failure mode the role brief calls worse than no identifier at all.
3. **11 of 17 have no url or DOI.** The evidence page only renders a "link" when `c.url` exists, so most of this batch is unverifiable by a user without leaving the app. All 11 have retrievable DOIs; I have listed them above where I found them.
4. **Defects propagate.** `snapshotCitation()` writes `display_short`/`display_line` into accepted proposals, and `record-export.ts` exports them. A wrong year is not just a page render; it goes into the user's exported record.

---

## Claims now unsupported

Programme assertions left standing on a citation that is not `SUPPORTS`:

1. **"Volume drives mitochondrial content beyond a threshold" — the anchor for the rising Z1 volume floor across Engine Builder Block 2, and for Engine Builder's volume-first weeks 1-3.** Stands on `bishop_2019`, whose shipped DOI opens a paper stating "there are conflicting findings in the literature, and a consensus has not been reached". The titled CrossTalk is real but is one declared side of a published debate and I could not read its body. *(engine-builder-block-2.json, engine-builder.json)*

2. **"Cycling is the safer concurrent partner" (modality preference in CSM).** Stands on `berryman_2018`, a record that does not correspond to any single paper. The nearest real paper (Sports 2020;9(1):1) is n=8 and its authors caution against generalising. CSM already flags this as an extrapolation in `engineering_choices_flagged`; the citation underneath it now also needs repointing. *(concurrent-strength-maintenance.json)*

3. **"Anabolic window is 4-6h, not 30 min — supports 6h separation compatibility."** The paper says 3-4 h (5-6 h only with large mixed meals) and is about meal timing around one lifting bout, not about spacing two sessions. The 6h rule itself survives on Robineau 2016. *(concurrent-strength-maintenance.json)*

4. **"~10× range in individual gains" (Engine Builder and Block 2 outcome-range caveat).** Not a HERITAGE figure. The paper reports a mean of ~400 ml/min with "some individuals experiencing little or no gain, whereas others gained >1.0 l/min", and describes 47% as a *maximal* heritability estimate. *(engine-builder.json, engine-builder-block-2.json)*

5. **"Bouchard 1999 HERITAGE variance says a hard aerobic stimulus on top of amber symptoms doesn't pay back."** Hardcoded at `next-app/src/components/workout/SignalsStrip.tsx:388` and shown at the moment the engine removes the Norwegian 4×4 from a user's week. HERITAGE contains no symptom, readiness, or session-withholding finding of any kind. The swap behaviour itself is real and implemented (`plan-generator.ts:82-103`); only its cited justification is wrong.

6. **"Barlow 2020: wrist WB tolerance drops from age 45 — extra ramp built in."** Two separate problems. The evidence half is fine — age 45-54 and 55-64 are significant predictors in a real n=465 study. But (a) the record's title and all three author initials do not match that study, and (b) **"extra ramp built in" is not implemented**: `age_band` appears nowhere under `next-app/src/`, `46_60` appears once in the whole repo (in the option itself), and the only wrist ramp gate keys off `wrist_pain_12mo`. The app tells an over-45 user a protection exists that does not. *(handstand-walk.json)*

7. **"3-10× individual variance in psychomotor learning" (handstand-walk's no-cohort-ETA rationale).** `ackerman_1988` is a real, correctly-attributed paper whose contents I could not retrieve from any open source. The claim may well be sound; it is currently uncheckable. *(handstand-walk.json)*

8. **"Cardiac remodelling is eccentric with endurance training (Baggish & Wood 2011)"** in Engine Builder `physiological_targets`. Correct citation, resolving URL, but Circulation published no abstract and the full text is 403 to me. Uncheckable as shipped. *(engine-builder.json)*

Nothing here is a prescription recommendation, and nothing in this file should be
applied to programme data without a credentialed human. Items 1, 2, 3, 4, 5 and
the metadata half of 6 are `data-defect` and are decidable from the record alone.
Items 7 and 8, and the reach notes throughout, are `needs-credentialed-human`.
