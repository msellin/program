# Citation sweep — batch 2 (17 ids)

Auditor: `evidence-verifier`. Date: 2026-09-05.
Scope: existence, identifier, attribution, support, status, reach — for the 17
ids listed below, as recorded in `next-app/public/data/citations.json` and used
in `next-app/public/data/programs/*.json`.

**Method note.** Every verdict below rests on retrieved text, quoted inline,
with the URL/endpoint named. Nothing here is stated from memory. Where
retrieval failed, the verdict is `NOT_FOUND` and the searches are listed.

Retrieval endpoints used: NCBI E-utilities (`esearch`/`efetch`, PubMed),
`api.crossref.org`, `api.openalex.org`, PMC full text, Frontiers full text.

**Surface facts established from the code (they apply to nearly every entry
below, so they are stated once here):**

- `evidence_base.references[].used_for` is **not rendered anywhere**.
  `evidenceBaseSchema` (`src/lib/schemas.ts:516`) parses it and its docstring
  claims it "Renders on the program's intro page", but no component reads
  `program.evidence_base` — grep across `src/**/*.tsx` returns only
  `schemas.ts` and `engine/citations.ts`. The `used_for` strings are
  author-time rationale, not user-facing copy. That docstring is stale in the
  same way the two claims CLAUDE.md already retracted were stale.
- What *is* user-visible is `citations.json` itself, rendered in full by
  `src/app/evidence/page.tsx` — authors, year, title, source and a **`link`
  anchor to `c.url`** — every entry pilled `CITED` (none of the 17 carries a
  `status`, so `status ?? "REFERENCED"` → label `CITED`).
- Top-level `program.principles[]` (which carries several of the prose claims
  below) parses (`schemas.ts:594`) but nothing renders it. `plan/page.tsx:708`
  renders `weekly_template.principles`, a different array.
- `evidence_base.reference_ids[]` is what `data-integrity.test.ts` walks for
  referential integrity; it drives no runtime behaviour.

---

### brandt_2025_hyrox — SUPPORTS
**Cited for:** "First direct HYROX physiological profiling: VO2max is the strongest predictor; grip strength and muscle mass are NOT reliable predictors. Anchors the recommendation for HYROX-goal users to prioritise aerobic development over strength during Block 1."
**Claimed:** Brandt K, et al. (2025), "Acute physiological responses and performance determinants in Hyrox", Frontiers in Physiology 16:1519240, `https://www.frontiersin.org/journals/physiology/articles/10.3389/fphys.2025.1519240/full`
**Found:** Crossref record for `10.3389/fphys.2025.1519240` plus the Frontiers full text at the URL as given. Title: "Acute physiological responses and performance determinants in Hyrox© – a new running-focused high intensity functional fitness trend", Frontiers in Physiology vol 16, 2025-03-31. Authors: **Tom Brandt, Cindy Ebel, Christopher Lebahn, Annette Schmidt**.
**Quoted:** "Faster Hyrox © completion correlated significantly with higher VO 2 max (p = 0.01), greater endurance training volume (p = 0.04), and lower body fat percentage (p = 0.03)." — and from the discussion: "in contrast to CF, where measures of muscular strength were found to be important performance determinants, neither HGS nor muscle mass percentage correlated with performance in the present study". Table 3 gives full-Hyrox ρ: VO2max −0.71 (p 0.01), endurance volume −0.68 (p 0.04), HGS 0.09 (p 0.79), muscle mass % −0.03 (p 0.94). Conclusion: "Hyrox © is a HIFT modality with an emphasis on endurance capacity and moderate to low requirements in terms of maximum strength".
**Verdict:** SUPPORTS — both clauses of the `used_for` are in the retrieved text, and the "prioritise aerobic" recommendation matches the paper's own conclusion.
**Two caveats that do not change the verdict:**
- *Attribution defect (data-defect).* Both `citations.json` and `engine-builder.json` say **"Brandt K, et al."**. The first author is **Brandt T**. `/evidence` prints that byline to users. Separately, `data-integrity.test.ts:1530` already records a *different* id, `brandt_2025`, whose two records disagree, with the note "the real paper is Brandt T, Ebel C, Lebahn C, Schmidt A — so BOTH bylines are wrong." The same wrong initial has propagated to `brandt_2025_hyrox`, which that test does not cover (the conflict test compares surnames only, and the surname matches).
- *Reach (needs-credentialed-human).* n = 11 recreational athletes, 27% women, Spearman correlations with no regression and no multiplicity correction. "Strongest predictor" rests on ρ −0.71 vs −0.68 for endurance-training volume — a gap this design cannot resolve. "Predictor" is the paper's word ("possible performance determinants") but it is correlational.
**Consequence:** `engine-builder.json` `reference_ids[]` and the bibliography row on `/evidence`. No engine rule reads it — grep for `brandt` in `src/` returns only `data-integrity.test.ts`. The "prioritise aerobic over strength in Block 1" behaviour is the block layout itself, which is not conditioned on a HYROX goal anywhere in code.

---

### brooks_2018 — SUPPORTS
**Cited for:** engine-builder: "Modern lactate shuttle theory synthesis — lactate is fuel + signalling molecule, not waste. Cited in physiological_targets and block_sustained_tempo rationale." · block-2: "Modern lactate shuttle theory. Supports the threshold-cruise rationale."
**Claimed:** Brooks GA (2018), "The science and translation of lactate shuttle theory", Cell Metabolism 27(4):757-785.
**Found:** PubMed 29617642 via E-utilities efetch — "Cell Metab. 2018 Apr 3;27(4):757-785. doi: 10.1016/j.cmet.2018.03.008. The Science and Translation of Lactate Shuttle Theory. Brooks GA."
**Quoted:** "Once thought to be a waste product of anaerobic metabolism, lactate is now known to form continuously under aerobic conditions. Shuttling between producer and consumer cells fulfills at least three purposes for lactate: (1) a major energy source, (2) the major gluconeogenic precursor, and (3) a signaling molecule."
**Verdict:** SUPPORTS — authors, year, journal, volume and pages are exact, and the fuel-plus-signal-not-waste framing is the abstract's opening claim.
**Note (data-defect, low):** block-2's `used_for` says it "Supports the threshold-cruise rationale", but block-2's `session_rationale.block_threshold_cruise` cites Joyner & Coyle, Seiler and Rønnestad, not Brooks; `block_sustained_tempo` cites "Brooks & Mercier 1994" — an id that **does not exist in `citations.json`** (only `brooks_2018` and `san_millan_brooks_2018` do). A prose citation with no library entry.
**Consequence:** `/evidence` row; `reference_ids[]` in engine-builder and block-2. No behaviour.

---

### buchheit_laursen_2013_a — SUPPORTS
**Cited for:** block-2: "Time-at-VO2max framework. Anchors why Block 2 alternates 4×4 and short-interval formats." · rowing-2k: "Interval-programming variables (long vs short, work:rest)"
**Claimed:** Buchheit M, Laursen PB (2013), Part I, Sports Med 43(5):313-338.
**Found:** PubMed 23539308 — "Sports Med. 2013 May;43(5):313-38. doi: 10.1007/s40279-013-0029-x. High-intensity interval training, solutions to the programming puzzle: Part I: cardiopulmonary emphasis."
**Quoted:** "there has been a growth in interest by the sport science community for characterizing training protocols that allow athletes to maintain long periods of time above 90% of VO2max (T@VO2max)" … "Prescription for HIT consists of the manipulation of up to nine variables, which include the work interval intensity and duration, relief interval intensity and duration, exercise modality, number of repetitions, number of series, as well as the between-series recovery duration and intensity."
**Verdict:** SUPPORTS — both `used_for` strings are the abstract's own content.
**Consequence:** `reference_ids[]` in block-2 and rowing-2k; `/evidence` row. Block-2's `engineering_choices_flagged[2]` already discloses the limit honestly: "Z3 optional third session for Push tier — pragmatic; Buchheit & Laursen 2013 support the zone but not the exact placement."

---

### buchheit_laursen_2013_b — SUPPORTS
**Cited for:** block-2: "Practical HIIT programming. Supports the two-hard-sessions/wk dose and the Z3 optional session for Push tier." · rowing-2k: "Anaerobic-specific programming variables"
**Claimed:** Buchheit M, Laursen PB (2013), Part II, Sports Med 43(10):927-954.
**Found:** PubMed 23832851 — "Sports Med. 2013 Oct;43(10):927-54. doi: 10.1007/s40279-013-0066-5. High-intensity interval training, solutions to the programming puzzle. Part II: anaerobic energy, neuromuscular load and practical applications."
**Quoted:** "However, anaerobic glycolytic energy contribution and neuromuscular load should also be considered to maximize the training outcome." … "In this part of the review, the different aspects of HIT programming are discussed, from work/relief interval manipulation to HIT periodization".
**Verdict:** SUPPORTS. **The `_a`/`_b` pair is not a duplicate** — two genuinely distinct papers, distinct DOIs, distinct issues and page ranges, each cross-referencing the other ("refer to the previously published first part of this review").
**Reach note (needs-credentialed-human):** the "two hard sessions/wk" dose is not in either abstract; block-2's own `progression_rationale` attributes it to Rønnestad 2020, which is the honest attribution.
**Consequence:** as for `_a`.

---

### bullock_2019 — MISATTRIBUTED
**Cited for:** "Shoulder rotational ROM (IR + total arc) in throwers — supports the retest choice to include a rotational component alongside supine flexion. Does NOT directly support the thoracic→shoulder pathway; the thoracic-prep rationale rests on Kim 2013 + coaching consensus."
**Claimed:** Bullock GS, Faherty MS, Ledbetter L, Thigpen CA, Sell TC (2019), "Shoulder range of motion and baseball throwing performance", J Athl Train 54(6):679-687. URL in `overhead-mobility.json` is `https://pubmed.ncbi.nlm.nih.gov/?term=Bullock+shoulder+range+of+motion+baseball+throwing+2019` — a **search query, not a record**.
**Found:** The paper by those five authors is PubMed 30525937 / DOI 10.4085/1062-6050-439-17 — "**J Athl Train. 2018 Dec;53(12):1190-1199.** Shoulder Range of Motion and Baseball **Arm Injuries**: A Systematic Review and Meta-Analysis. Bullock GS, Faherty MS, Ledbetter L, Thigpen CA, Sell TC." Crossref query on the claimed bibliographic string returns the same 2018 record as top hit. A Crossref scan of *Journal of Athletic Training* volume 54 (2019) returned **no article at page 679**, and a PubMed query `"J Athl Train"[jour] AND 54[volume] AND 679[page]` returned zero hits. No paper titled "…baseball throwing performance" by this group was retrievable.
**Quoted:** "CONCLUSIONS: High-quality evidence demonstrated that deficits in throwing-arm TROM and IR were associated with upper extremity **injury** in baseball players."
**Verdict:** MISATTRIBUTED (data-defect) — year, volume, pages and title are all wrong, and the substantive difference is not cosmetic: the real paper is about **injury risk**, the record claims **throwing performance**. The `used_for` clause about IR and total arc is in fact supported by the real 2018 paper, so the *reasoning* survives; the *record* does not.
**Reach note (needs-credentialed-human):** cohort is prospectively-followed baseball players. `overhead-mobility` serves general overhead-mobility users; "deficits associated with injury in throwers" does not by itself establish that a rotational retest is informative for a non-throwing population.
**Consequence:** `/evidence` prints "Bullock et al. (2019) … Shoulder range of motion and baseball throwing performance — J Athl Train 54(6):679-687" with **no `link`** (the search-query URL lives only in the programme copy, not in `citations.json`). `overhead-mobility.json` `reference_ids[]`. The retest itself is authored in `retest_metrics`; no code branches on this id.

---

### butcher_2015 — SUPPORTS
**Cited for:** "CrossFit Total = strongest Fran/Grace predictor — strength floor matters"
**Claimed:** Butcher SJ, Neyedly TJ, Horvey KJ, Benko CR (2015), Open Access J Sports Med 6:241-247.
**Found:** PubMed 26261428 — "Open Access J Sports Med. 2015 Jul 31;6:241-7. doi: 10.2147/OAJSM.S88265. Do physiological measures predict selected CrossFit(®) benchmark performance?"
**Quoted:** "Performance of Grace and Fran was related to whole-body strength (CrossFit Total) (r=-0.88 and -0.65, respectively) … however, whole-body strength was the only variable to survive the prediction regression for both of these WODs (R (2)=0.77 and 0.42, respectively)."
**Verdict:** SUPPORTS — the record is exact and the claim is the paper's headline result.
**Reach note (needs-credentialed-human):** n = 14 CrossFit Open/Regional athletes; cross-sectional correlation, not an intervention. "Strength floor matters" is an inference from a correlation in a competitive cohort.
**Consequence:** `concurrent-strength-maintenance.json` `reference_ids[]`; `/evidence` row. No engine rule reads it.

---

### butcher_2015_crossfit — CONTRADICTS
**Cited for:** "CrossFit Total predicts Fran/Grace performance most strongly, **but VO2max still contributes**. Anchors the 'aerobic base protects your CrossFit performance' claim."
**Claimed:** identical paper to `butcher_2015` — same authors, same title, same pages; only the journal-name abbreviation and the presence of a Dovepress URL differ.
**Found:** same PubMed record, 26261428.
**Quoted:** "CONCLUSION: CrossFit benchmark WOD performance **cannot be predicted by VO2max**, Wingate power/capacity, or either respiratory compensation or anaerobic thresholds. Of the data measured, only whole-body strength can partially explain performance on Grace and Fran, although anaerobic threshold also exhibited association with performance."
**Verdict:** CONTRADICTS — the first clause is supported; the second clause ("VO2max still contributes") is the exact proposition the paper's conclusion negates. Anaerobic threshold was *associated* (r = −0.61 / −0.53) but did not survive regression; VO2max is named in the list of measures that do not predict. The paper's closing sentence — "CrossFit athletes should likely ensure an adequate level of strength and aerobic endurance to optimize performance on at least some benchmark WODs" — is the strongest support available for the "aerobic base protects your CrossFit performance" framing, and it is a recommendation, not a finding.
**Also: duplicate-id defect (data-defect).** `butcher_2015` and `butcher_2015_crossfit` are **the same work entered twice** under two ids. `/evidence` therefore lists the Butcher study twice, once with a link and once without. `data-integrity.test.ts`'s new same-paper test compares a programme reference against *its own* `citations.json` entry; it does not detect two citation ids describing one paper.
**Consequence:** `engine-builder.json` `reference_ids[]`; two rows on `/evidence`. No engine rule reads either id.

---

### chiviacowsky_wulf_2002 — SUPPORTS
**Cited for:** four programmes, e.g. handstand-walk: "Self-controlled feedback beats forced schedules. The video review button design (self-selected, never auto-shown) is directly from this study."
**Claimed:** Chiviacowsky S, Wulf G (2002), Res Q Exerc Sport 73:408-415.
**Found:** PubMed 12495242 — "Res Q Exerc Sport. 2002 Dec;73(4):408-15. doi: 10.1080/02701367.2002.10609040."
**Quoted:** "One group of learners (self-control) was provided with feedback whenever they requested it, whereas another group (yoked) had no influence on the feedback schedule. **The self-control group showed learning benefits on a delayed transfer test.**"
**Verdict:** SUPPORTS — record exact, finding as described.
**Reach note (needs-credentialed-human):** the task was "a sequential timing task" in a laboratory, with knowledge-of-results feedback. Generalising to self-recorded video knowledge-of-performance during a handstand or muscle-up is a real extrapolation. `handstand-walk`'s own `physiological_targets[5]` is more careful, co-citing Potdevin 2018 (n=18 children) and Rohleder & Vogt 2018 for the video-specific step.
**Consequence — behaviour, checked in code:**
- There is **no self-recorded-video feature in the app**. The only video UI is `VideoModal` opened from `ExerciseCard` (`hasVideo = !!(exercise.video_url || exercise.video_search)`), which shows a *demonstration* video or a YouTube search link. Grep for `self-video|record your|camera|review your` across `src/` finds nothing.
- The design the citation anchors is implemented **as a drill, not as a UI button**: `hs_video_review`, `pu_video_review`, `mu_video_review` in `exercises.json`, each carrying `feedback_type: "self_controlled"` and `evidence_refs: [chiviacowsky_wulf_2002]`.
- In `handstand-walk` it is placed in five blocks with `"optional": true, "role": "feedback", "note": "User taps to review a recorded attempt. Never auto-shown."` — and `optional` **is** honoured (`DaySession.tsx:483` `optional: item.optional === true`, "Whole-exercise opt-out"). So the self-selected design is real there, modulo the fact that the user must record on their own phone.
- In `muscle-up` and `first-strict-pullup` the drill exists **only in `drill_library`** and is placed in no block; it can reach a session only if the capability-slot composer (`plan-generator.ts:269`) selects it. The programme prose "Video review is a button, not a schedule" is, for those two programmes, describing something that has no guaranteed surface.

---

### cocks_2013 — CONTRADICTS
**Cited for:** "Endurance and SIT both increase capillary-to-fibre ratio comparably; **endurance drives capillary density (per area) more reliably**. Cited in physiological_targets."
**Claimed:** Cocks M et al. (2013), J Physiol 591(3):641-656, `https://pubmed.ncbi.nlm.nih.gov/22946099/`
**Found:** PubMed 22946099 (URL resolves to the right paper) and PMC3577551 full text.
**Quoted:** Abstract — "In conclusion, in sedentary males SIT and ET are **equally effective** in improving muscle microvascular density and eNOS protein content." Results — "The capillary-to-fibre ratio on an individual-fibre basis was increased in both ET and SIT by 22% and 24%, respectively, with **no difference between groups**… Finally, **capillary density was increased 32% in the ET group and 27% in the SIT group, with no difference between groups** (main effect of training, P < 0.05, Table 2)."
**Verdict:** CONTRADICTS — the first clause ("comparably") is supported; the second clause is the negation of this paper's central finding. Cocks reports no ET-vs-SIT difference on capillary density per unit area, and says so in its title.
**Second defect (data-defect):** the programme string it feeds, `engine-builder.evidence_base.physiological_targets[1]`, reads "Capillary-to-fibre ratio **+10-20%** in 8 weeks; capillary density (per unit area) responds most reliably to endurance/continuous work (+13±3%), less to sprint-interval training (Andersen & Henriksson 1977; **Cocks 2013**; 2025 mito+cap meta-regression PMC11787188)." Cocks measured **+22% / +24%** C:F over **6 weeks**, and neither the "+13±3%" figure nor the "less to SIT" contrast comes from it. Whether the co-cited 2025 meta-regression carries them is outside this batch and should be checked.
**Reach note (needs-credentialed-human):** 16 young sedentary males, 6 weeks. Engine Builder's stated audience is a strength-trained user new to aerobic work.
**Consequence:** `engine-builder.json` `reference_ids[]`, the `physiological_targets` string above (not rendered — nothing reads `evidence_base`), and the `/evidence` row (link correct).

---

### coffey_hawley_2007 — SUPPORTS
**Cited for:** "Foundational integrative review of concurrent-training mechanism"
**Claimed:** Coffey VG, Hawley JA (2007), Sports Med 37(9):737-763.
**Found:** PubMed 17722947 — "Sports Med. 2007;37(9):737-63. doi: 10.2165/00007256-200737090-00001. The molecular bases of training adaptation."
**Quoted:** "Prolonged endurance training elicits a variety of metabolic and morphological changes… In contrast, heavy resistance exercise stimulates synthesis of contractile proteins responsible for muscle hypertrophy… Concomitant with the vastly different functional outcomes induced by these diverse exercise modes, **the genetic and molecular mechanisms of adaptation are distinct**."
**Verdict:** SUPPORTS — record exact; the divergent-signalling premise that the concurrent-training argument rests on is explicitly in the abstract.
**Note:** the abstract never uses the word "concurrent" — it is a review of training adaptation generally. The concurrent framing is CSM's, and it is a fair reading of the divergence claim. Nothing in CSM's prose leans on Coffey for a number (grep for "Coffey" in the programme returns only the reference entry).
**Consequence:** `concurrent-strength-maintenance.json` `reference_ids[]`; `/evidence` row (no URL, so no link).

---

### coyle_1984 — OVERSTATED
**Cited for:** four programmes. engine-builder: "Detraining timecourse: **VO2max −7% at 12 days**, −16% at 12 weeks. Informs the post-block maintenance dose." · CSM: "Detraining timeline — **VO2max −7% at 12 days**, informs deload week planning" · rowing-2k: "Detraining timeline informs taper depth" · block-2: "Detraining timecourse. Informs the Foundation-tier 2-week re-entry ramp".
**Claimed:** Coyle EF et al. (1984), J Appl Physiol 57(6):1857-1864, `https://pubmed.ncbi.nlm.nih.gov/6511559/`
**Found:** PubMed 6511559 (URL resolves correctly) — record exact on authors, journal, volume, issue, pages.
**Quoted:** "Seven endurance exercise-trained subjects were studied 12, 21, 56, and 84 days after cessation of training. **Maximal O2 uptake (VO2 max) declined 7% (P less than 0.05) during the first 21 days of inactivity and stabilized after 56 days at a level 16% (P less than 0.05) below the initial trained value.** … Citrate synthase and succinate dehydrogenase activities in muscle declined with **a half-time of 12 days**."
**Verdict:** OVERSTATED (data-defect) — "−7% at 12 days" is not what the paper reports. The 7% decline is stated **over the first 21 days**; the number **12 days** in this paper is the *half-time of the oxidative-enzyme decline*, a different quantity. The "−16% at 12 weeks" half of the engine-builder string is defensible: the value stabilised at −16% after 56 days and the final measurement was at 84 days (= 12 weeks).
**Reach note (needs-credentialed-human).** n = 7, and the exposure is **complete cessation of training**. CSM applies it to "deload week planning" and rowing-2k to "taper depth" — a deload and a taper are reduced training, not cessation, and detraining curves after cessation do not transfer to them without a judgement call. Block-2 is the honest one: `engineering_choices_flagged[4]` says "Foundation-tier 2-week re-entry ramp — engineering choice; Coyle 1984 detraining timecourse informs the concept but not the exact protocol."
**Second defect (data-defect):** `muscle-up.json`'s `session_rationale.block_pullup_maintenance` invokes "Coyle 1984 detraining-timecourse analog" in prose, but `coyle_1984` is in **neither** that programme's `references[]` **nor** its `reference_ids[]`. The integrity test checks references→ids and ids→citations; it does not catch a citation that exists only in prose.
**Consequence:** `reference_ids[]` in four programmes; `/evidence` row with a correct link. The "−7% at 12 days" figure appears only in `used_for` strings, which are not rendered — so the wrong number is currently invisible to users, but it is the number a future reviewer or generated copy would pick up.

---

### das_2019 — NOT_FOUND
**Cited for:** nothing. No programme references it — grep across `public/data/programs/*.json` finds the string only inside another citation's prose, in `rowing-2k-test-prep.json:932`: "Replaced das_2019 as a stronger anchor for the metabolic-profile claims (Path A Q5)."
**Claimed:** Das A, Kumar S, Guha S, Chatterjee S (2019), "Physiological demands of rowing sport", J Phys Ed Sports Manage 6(1):5-11. URL: `https://scholar.google.com/scholar?q=Das+Kumar+physiological+demands+rowing+sport+2019` — **a Google Scholar search query, not a record**.
**Found:** nothing. Searches run:
1. PubMed E-utilities, `Das Kumar Guha Chatterjee physiological demands of rowing sport` — 0 hits.
2. Crossref `query.bibliographic=Physiological demands of rowing sport Das 2019` — top hits are Kellner 2024, McIver 2019, Draper 2019; no match.
3. Crossref `query.title=Physiological demands of rowing` + `query.author=Das` — returns unrelated Das papers (Pilates/rowing 2022, cardiac pacing) plus "Monitoring Changes of Cardio-Respiratory Parameters During 2000m Rowing Performance", Das et al., Int J Exerc Sci 2019 — a **different** title and venue.
4. OpenAlex `search=physiological demands of rowing sport` and `filter=title.search:physiological demands rowing` — 4 results, none matching.
5. Web search for the exact title + all four surnames + the journal name + 2019 — no match.
**Verdict:** NOT_FOUND. The nearest real Das-2019 rowing paper found is "Monitoring Changes of Cardio-Respiratory Parameters During 2000m Rowing Performance" (Das, Mandal, Syamal, Majumdar; Int J Exerc Sci 2019) — different title, different journal. I am **not** asserting the record is a mangled version of it; that is a guess, and it should be treated as one.
**Consequence:** it is an **orphan** — no programme cites it, so nothing rests on it. But `/evidence` renders every row in `citations.json`, so a user reading the bibliography sees "Das et al. (2019). Physiological demands of rowing sport — J Phys Ed Sports Manage 6(1):5-11" with a `link` that opens a **Google Scholar search box**. On the page whose copy reads "the full bibliography behind every program, proposal, and progression rule in the app", pilled `CITED`. That is the citation-laundering failure mode in its purest form: an unverifiable entry acquiring the authority of the list it sits in. A human should decide whether to delete the row or replace it with the paper actually meant.

---

### difiori_2006 — OVERSTATED
**Cited for:** handstand-walk: "**Fracture-site data** at distal radius under load-through-hand mechanism. Cohort is young gymnasts (open physes); Terav uses this as a mechanism analog for the adult low-BMD osteoporosis contraindication, not as direct evidence in adult practitioners." · overhead-mobility: "Wrist-tolerance considerations if program includes handstand-adjacent work"
**Claimed:** DiFiori JP, Caine DJ, Malina RM (2006), Am J Sports Med 34(5):840-849.
**Found:** PubMed 16493174 — "Am J Sports Med. 2006 May;34(5):840-9. doi: 10.1177/0363546505284848." Record exact.
**Quoted:** "In gymnastics, the wrist joint is subjected to repetitive loading in a weightbearing fashion. In this setting, chronic wrist pain is quite common… imaging studies have identified evidence of injury to the **distal radial physis** and the development of **positive ulnar variance**. … **This article provides a comprehensive review** of these issues and offers suggestions for management, preventive measures, and future research."
**Verdict:** OVERSTATED — this is a **narrative review of physeal injury and ulnar variance**, not a source of "fracture-site data", and the abstract does not mention fracture. `handstand-walk`'s prose repeats the misdescription three times: `intake.questions[7].help` and `immediate_actions[3].reason` both say "DiFiori 2006 **catalogued** the fracture sites", and `contraindications[1]` says "DiFiori 2006 catalogued distal radius as a common fracture site under this mechanism; vertebral and hip fractures follow" — the vertebral/hip clause has no source at all. The overhead-mobility `used_for` ("wrist-tolerance considerations") is a fair description of the same paper.
**Reach (needs-credentialed-human):** the programme already flags the gap and deserves credit for it — skeletally immature gymnasts with open physes, reasoning transferred to adult low-BMD. That transfer is a clinical judgement, and the paper cannot settle it. Physeal injury in a growing wrist and fragility fracture in an osteoporotic adult are different pathologies sharing a loading direction.
**Consequence — this one drives behaviour.** `handstand-walk.intake.safety_gates[0]` is `{question_id: "osteoporosis_dx", unsafe_values: ["yes"], block_title: "See your clinician first"}`, and safety gates are live: `IntakeClient.tsx:209-217` calls `evaluateSafetyGates(intake.safety_gates, answers)` (`src/lib/engine/safety-gates.ts`, "the one place a program's `safety_gates` are evaluated") as a hard block on starting the programme. The gate itself is a conservative call and I am not questioning it — but the sentence shown to the user beside the question ("DiFiori 2006 catalogued distal radius as a common fracture site under this mechanism") is **user-visible copy that misdescribes the cited paper**. That copy is what needs a credentialed human, not the gate.

---

### docherty_sporer_2000 — MISATTRIBUTED
**Cited for:** "Interference model — informs the same-day sequencing rule (strength first if both must share a day) and the 6+ h separation guideline."
**Claimed:** Docherty D, Sporer B (2000), Sports Medicine 30(6):385-394, URL `https://pubmed.ncbi.nlm.nih.gov/11132122/` — **the same wrong URL in both `citations.json` and `engine-builder.json`**.
**Found:** The paper is real, at **PMID 11132121** — "Sports Med. 2000 Dec;30(6):385-94. doi: 10.2165/00007256-200030060-00001. A proposed model for examining the interference phenomenon between concurrent aerobic and strength training. Docherty D, Sporer B." The cited PMID **11132122** is the *next article in the same issue*: "Sports Med. 2000 Dec;30(6):395-403. **The role of hyperbaric oxygen therapy in sports medicine.** Babul S, Rhodes EC."
**Quoted:** from the real paper — "A review of the current research on the interference phenomenon between concurrent aerobic and strength training indicates modest support for the model proposed in this article… There should be **adequate recovery and regeneration between the concurrent training sessions** as well as during the training cycle."
**Verdict:** MISATTRIBUTED (data-defect) on two counts. (1) **The identifier resolves to a different work** — an off-by-one PMID landing on a hyperbaric-oxygen review. (2) The `used_for` attributes to this paper two specifics it does not contain: the abstract states no session-order rule and no 6-hour figure, and describes the model as having only "modest support".
**Mitigating, and worth recording:** the app's actual prose does **not** rest the numbers on Docherty. `engine-builder`'s user-facing rule reads "Robineau 2016 dose-response showed 6+ h separation preserves both adaptations, 0h separation halves the strength gain" and "If same day is unavoidable, lift first (Eddens 2018 meta: +6.91% lower-body strength gain vs endurance-first)". So the `used_for` overclaims relative to the programme's own, better-sourced copy. Robineau 2016 and Eddens 2018 are outside this batch and are now the load-bearing citations for those two rules.
**Consequence:** `/evidence` renders this row **with a working `link` that takes the reader to the hyperbaric-oxygen paper.** That is the single most reader-visible defect in this batch: a user checking the app's evidence claim lands on an unrelated article and has every reason to conclude the bibliography is decorative. `engine-builder.json` carries the same bad URL in `references[].url`.

---

### doma_2019 — MISATTRIBUTED
**Cited for:** "Bidirectional damage — **running-induced damage impairs squat/deadlift 24-48h**"
**Claimed:** Doma K, Deakin GB, Bentley DJ (2019), "Implications of impaired endurance performance following single bouts of resistance training", Sports Med 49(5):669-682.
**Found:** **The record conflates two different papers.** The *title* and the three-author byline belong to PubMed 28702901 — "Sports Med. **2017 Nov;47(11):2187-2200**. Implications of Impaired Endurance Performance following Single Bouts of Resistance Training: An Alternate Concurrent Training Perspective. Doma K, Deakin GB, Bentley DJ." (with an erratum, PMID 28752468). The *year, volume and pages* belong to PubMed 30847824 — "Sports Med. **2019 May;49(5):669-682**. **Training Considerations for Optimising Endurance Development: An Alternate Concurrent Training Perspective.** Doma K, Deakin GB, **Schumann M**, Bentley DJ" — a different title and a fourth author.
**Quoted:** 2019 paper — "There is a growing body of research indicating that typical **resistance exercises impair neuromuscular function and endurance performance** during periods of resistance training-induced muscle damage." 2017 paper — "A single bout of **resistance training** induces residual fatigue, which may impair performance during subsequent **endurance training** if inadequate recovery is allowed."
**Verdict:** MISATTRIBUTED on both the record and the claim. The record is a chimera of two papers. More importantly, **both** papers run **resistance → endurance**; the `used_for` claims the opposite direction, **endurance (running) → squat/deadlift**, and calls it "bidirectional". Neither retrieved abstract asserts that running-induced damage impairs subsequent squat or deadlift force, and neither mentions a 24-48 h window for that direction. I could not retrieve the full text of either (Springer paywall), so I state only what the abstracts show: the direction cited is not the direction either abstract describes.
**Consequence:** the claim appears three times in `concurrent-strength-maintenance.json` — `principles[3].detail` ("Doma 2019: bidirectional damage — running-induced damage impairs subsequent squat/deadlift force 24-48h"), `session_rationale.why_row_not_run` ("Wilson 2012 modality interference… Doma 2019 bidirectional damage. For the strength athlete, rowing / cycling preserve the pull the day after"), and `engineering_choices_flagged[5].rationale` ("Wilson 2012 meta + Doma 2019 carry the actual interference evidence"). It is therefore the **stated evidential basis for CSM's row-not-run modality choice**. None of the three is rendered: top-level `principles[]` has no renderer (`schemas.ts:594`; `plan/page.tsx:708` renders the *other* principles array — CSM's `weekly_template.principles` is the three-line list "Lift Mon + Wed…", which does not mention Doma), and `evidence_base` has no renderer. The modality choice itself is authored into the block structure, not computed. So: not user-visible today, but the programme's own account of why it prescribes rowing over running currently cites a paper for the reverse finding.

---

### escamilla_2009 — SUPPORTS
**Cited for:** "EMG-guided drill selection — informs scap-activation block content"
**Claimed:** Escamilla RF, Yamashiro K, Paulos L, Andrews JR (2009), Sports Med 39(8):663-685.
**Found:** PubMed 19769415 — "Sports Med. 2009;39(8):663-85. doi: 10.2165/00007256-200939080-00004." Record exact.
**Quoted:** "During maximum humeral elevation the scapula normally upwardly rotates 45-55 degrees, posterior tilts 20-40 degrees and externally rotates 15-35 degrees. **The scapular muscles are important during humeral elevation because they cause these motions, especially the serratus anterior**, which contributes to scapular upward rotation, posterior tilt and ER."
**Verdict:** SUPPORTS — a review of shoulder muscle activity and function across rehabilitation exercises, with scapular-muscle content that matches "informs scap-activation block content".
**Note:** it is a narrative review synthesising EMG and modelling work, not itself an EMG study; "EMG-guided" is loose but not misleading. The specific drills `overhead-mobility` selects are not named in the retrieved abstract text, so the mapping from this review to those particular drills is a coaching judgement (needs-credentialed-human), not a finding.
**Consequence:** `overhead-mobility.json` `reference_ids[]`; `/evidence` row (no URL, no link). No engine rule reads it.

---

### faude_2009 — SUPPORTS
**Cited for:** block-2: "Lactate threshold concepts review. Anchors why Block 2's headline metric is threshold shift." · rowing-2k: "Threshold definitions — informs `retest_metric.source_ref`"
**Claimed:** Faude O, Kindermann W, Meyer T (2009), Sports Med 39(6):469-490.
**Found:** PubMed 19453206 — "Sports Med. 2009;39(6):469-90. doi: 10.2165/00007256-200939060-00003." Record exact.
**Quoted:** "**A shift of such lactate curves indicates changes in endurance capacity.** … The aerobic-anaerobic transition may serve as a basis for individually assessing endurance performance as well as for prescribing intensities in endurance training. … This model consists of two typical breakpoints… the intensity at which bLa begin to rise above baseline levels and the highest intensity at which lactate production and elimination are in equilibrium (maximal lactate steady state [MLSS])."
**Verdict:** SUPPORTS — the threshold-shift-as-endurance-metric premise and the LT2/MLSS definitions are both explicit.
**Note (data-defect, low):** rowing-2k's `used_for` says it "informs `retest_metric.source_ref`", but `retest_metrics[].source_ref` in that programme holds **log-data paths** — `"runs[].total_seconds where activity_type == 'row'"` and `"runs[].avg_pace_500m_seconds where activity_type == 'row'"` — not citation ids. The `used_for` describes a field mapping that does not exist.
**Consequence:** `reference_ids[]` in block-2 and rowing-2k; `/evidence` row (no URL, no link). The threshold retest is authored data, not a coded rule.

---

## Summary

| id | verdict | class |
|---|---|---|
| brandt_2025_hyrox | SUPPORTS | data-defect (byline: Brandt K → Brandt T) + reach note |
| brooks_2018 | SUPPORTS | clean; one dangling co-citation (`Brooks & Mercier 1994` not in library) |
| buchheit_laursen_2013_a | SUPPORTS | clean — genuinely distinct from `_b` |
| buchheit_laursen_2013_b | SUPPORTS | clean — genuinely distinct from `_a` |
| bullock_2019 | MISATTRIBUTED | data-defect (wrong year/volume/pages/title; real paper is about injury, not performance) |
| butcher_2015 | SUPPORTS | duplicate of `butcher_2015_crossfit` |
| butcher_2015_crossfit | CONTRADICTS | data-defect (duplicate id) + claim negated by the paper's conclusion |
| chiviacowsky_wulf_2002 | SUPPORTS | reach note; behaviour gap in 2 of 4 programmes |
| cocks_2013 | CONTRADICTS | second clause is the negation of the paper's title finding |
| coffey_hawley_2007 | SUPPORTS | clean |
| coyle_1984 | OVERSTATED | data-defect (−7% is at 21 days, not 12) + reach (cessation ≠ deload/taper) + dangling prose cite in muscle-up |
| das_2019 | NOT_FOUND | data-defect — unverifiable, orphaned, rendered to users with a Scholar-search link |
| difiori_2006 | OVERSTATED | data-defect ("fracture-site data" ← narrative review) — misdescription is in user-visible intake copy |
| docherty_sporer_2000 | MISATTRIBUTED | data-defect — PMID resolves to a hyperbaric-oxygen paper; `used_for` claims specifics not in the paper |
| doma_2019 | MISATTRIBUTED | data-defect (record conflates two papers) + claim runs the opposite causal direction |
| escamilla_2009 | SUPPORTS | clean |
| faude_2009 | SUPPORTS | clean; one wrong field mapping in `used_for` |

9 SUPPORTS · 2 CONTRADICTS · 3 MISATTRIBUTED · 2 OVERSTATED · 1 NOT_FOUND.
No retractions or corrections found for any of the 17 beyond the Doma 2017
erratum (PMID 28752468), which is an erratum to the paper whose *title* the
`doma_2019` record borrowed, not to the paper whose *volume and pages* it
borrowed.

---

## Claims now unsupported

Every programme assertion below stands on a citation that is not `SUPPORTS`.
None of them is a recommendation to change — that is not this agent's surface.
Each names the file and key so a credentialed human can find it.

1. **"VO2max still contributes" to CrossFit benchmark performance** —
   `engine-builder.json` `references[butcher_2015_crossfit].used_for`, which
   further says it "Anchors the 'aerobic base protects your CrossFit
   performance' claim." Butcher's conclusion states benchmark WOD performance
   *cannot* be predicted by VO2max. Whatever supports the aerobic-base claim,
   it is not this sentence of this paper. `CONTRADICTS`.

2. **"Endurance drives capillary density (per area) more reliably" than SIT** —
   `engine-builder.json` `references[cocks_2013].used_for` and
   `evidence_base.physiological_targets[1]`. Cocks reports +32% ET vs +27% SIT
   with **no difference between groups**. The "+13±3%" and "less to
   sprint-interval training" in the same string are not from Cocks; the
   co-cited 2025 meta-regression (PMC11787188) is unverified and outside this
   batch. `CONTRADICTS`.

3. **"Running-induced damage impairs squat/deadlift 24-48h"** —
   `concurrent-strength-maintenance.json` `principles[3].detail`,
   `session_rationale.why_row_not_run`,
   `engineering_choices_flagged[5].rationale`. Both candidate Doma papers run
   resistance → endurance. This is CSM's stated reason for prescribing rowing
   over running. `MISATTRIBUTED`.

4. **"VO2max −7% at 12 days"** — `engine-builder.json` and
   `concurrent-strength-maintenance.json` `references[coyle_1984].used_for`.
   The paper says 7% over the **first 21 days**; 12 days is the enzyme
   half-life. CSM additionally applies a **cessation** curve to **deload**
   planning, and rowing-2k to **taper depth**. `OVERSTATED`.

5. **"DiFiori 2006 catalogued distal radius as a common fracture site… vertebral
   and hip fractures follow"** — `handstand-walk.json`
   `intake.questions[7].help` (**user-visible**),
   `immediate_actions[3].reason`, `evidence_base.contraindications[1]`. The
   paper is a narrative review of physeal injury and ulnar variance in
   skeletally immature gymnasts; its abstract does not mention fracture, and
   the vertebral/hip clause has no cited source. The osteoporosis hard-block
   gate it accompanies is live and conservative; the sentence describing the
   evidence is what is wrong. `OVERSTATED`.

6. **"Docherty & Sporer informs the same-day sequencing rule and the 6+ h
   separation guideline"** — `engine-builder.json`
   `references[docherty_sporer_2000].used_for`. Neither specific is in the
   paper, which describes its own model as having "modest support"; the
   programme's user-facing copy correctly credits Robineau 2016 and Eddens
   2018 instead. Additionally the cited PMID resolves to an unrelated
   hyperbaric-oxygen review, and `/evidence` links users to it.
   `MISATTRIBUTED`.

7. **"Shoulder range of motion and baseball throwing performance (2019)"
   supports including a rotational component in the retest** —
   `overhead-mobility.json` `references[bullock_2019]`. No such paper was
   retrievable. The real Bullock et al. paper (2018, 53(12):1190-1199)
   concerns **injury risk**, in prospectively-followed baseball players, not
   throwing performance and not a general overhead-mobility population.
   `MISATTRIBUTED`.

8. **The `das_2019` bibliography row itself** — `citations.json`. No programme
   cites it; `rowing-2k-test-prep.json` records that it was replaced. It is
   nonetheless rendered on `/evidence`, pilled `CITED`, under the heading "the
   full bibliography behind every program, proposal, and progression rule in
   the app", with a link that opens a Google Scholar search box. `NOT_FOUND`.

## Two integrity gaps this sweep exposed in the test suite

Reported as observations, not as changes.

- **`data-integrity.test.ts` cannot see a duplicate paper under two ids.** Its
  new same-paper test compares each programme reference to *its own*
  `citations.json` entry. `butcher_2015` and `butcher_2015_crossfit` agree
  with themselves perfectly and are one study.
- **It cannot see a citation that exists only in prose.** `muscle-up.json`
  invokes "Coyle 1984" in `session_rationale`, and
  `engine-builder-block-2.json` invokes "Brooks & Mercier 1994" — neither id
  is in the invoking programme's `references[]`/`reference_ids[]`, and
  `brooks_mercier_1994` is in no library at all. Integrity is asserted
  references→ids→citations; prose is not walked.
