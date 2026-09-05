# Citation sweep — batch 7 (16 ids)

Auditor: `evidence-verifier`. Date: 2026-09-05.
Scope: existence, identifier resolution, attribution, support for `used_for`, status, reach.
Every verdict below rests on text I retrieved during this run. Where I could not retrieve, the
verdict is `NOT_FOUND` and the searches are listed. I did not read anything under `dev/`.

Retrieval routes used: NCBI E-utilities `efetch`/`esearch` (PubMed abstracts — the PubMed HTML
pages are cookie-walled to the fetch tool), Crossref REST, OpenAlex, Europe PMC REST, Unpaywall,
Google Books, and two publisher/author-hosted PDFs.

---

## Where these citations actually surface (read before the Consequence lines)

Three of the four plausible consequence surfaces turn out to be dead. Checked in code, not
inferred:

- **`evidence_base.references[]` — parsed, never rendered.** `evidenceBaseSchema`
  (`src/lib/schemas.ts:520`) validates it; no component reads it. The `used_for` strings are
  author-facing provenance only.
- **The program preview "Cites" strip reads `program.goals.references`, and no program has
  that key.** `src/app/programs/[slug]/ProgramPreviewClient.tsx:400-402` then
  `if (!refs.length || entry.personal) return null;`. I checked all nine programme files:
  `goals.references` is absent in every one. The strip renders nothing today.
- **`exercises.json` `evidence_refs[]` — parsed, never rendered.** Confirmed by
  `src/lib/schemas.ts:78` plus the comment at `data-integrity.test.ts:938` and by grep: no
  `.tsx` reads the field. `sinnett_2019` (19 drills) and `vidal_rovira_2024` (9 drills) are
  therefore invisible today and load-bearing the moment anyone ships "show me the papers
  behind this drill".
- **Programme `phases[].rationale` and `blocks[].rationale` — also not rendered.** Only
  `exercises.json`-sourced `rationale` reaches a user, via
  `src/components/workout/ExerciseDetailsSheet.tsx:127-130`.

What IS live for all sixteen:

1. **`/evidence`** (`src/app/evidence/page.tsx`) renders **every** row of `citations.json`,
   authors + year + title + source + link, with a `CITED`/`VERIFIED` pill. This is the
   walled-garden fulfilment of the landing's "every change cites a study". A wrong byline or a
   URL pointing at another paper is user-visible here.
2. **`exercises.json` rationale prose** — one of the sixteen (`bandura_1997_self_efficacy`)
   reaches users this way. See its entry.
3. `CitationRef` (`src/components/citations/CitationRef.tsx`) renders under proposals, but
   `src/lib/engine/proposal-citations.ts` wires only `kraemer_2002_acsm_position_stand`,
   `halson_2014`, `rhea_2003_meta`, `bouchard_1999_heritage`, `hecksteden_2015`. **None of the
   sixteen drives a proposal.**

Four ids — `adkin_frank_2000`, `carpenter_frank_2001`, `hardy_1996_catastrophe`,
`bandura_1997_self_efficacy` — are **not referenced by id anywhere**: not in a programme's
`references[]`, not in `reference_ids[]`, not in `evidence_refs[]`. They exist in
`citations.json` (so they render on `/evidence`) and are invoked by **surname in prose** inside
`handstand-walk.json`'s `phase_0_bail_out_prep.rationale` and
`block_bail_mat_falls.rationale`. Prose citation is outside every integrity test in the repo:
the "programme reference and its citations.json entry are the same paper" test
(`data-integrity.test.ts:1466`) iterates `evidence_base.references`, which these never enter.
That is how `hardy_1996_catastrophe` (below) got in.

---

### wulf_2013 — SUPPORTS

**Cited for:** (first-strict-pullup) "15-year review supporting the external-focus default. ~100 studies across balance and complex motor skills." — (handstand-walk) "15-year review of ~100 studies confirming external focus benefit. Codified in the external_focus_default principle." — (muscle-up) "15-year review supporting the external-focus default." — (overhead-mobility) "External-focus cue meta — cited on every drill card"
**Claimed:** Wulf G (2013), "Attentional focus and motor learning: a review of 15 years", International Review of Sport and Exercise Psychology 6:77-104. No URL in `citations.json`.
**Found:** Crossref `10.1080/1750984x.2012.723728` — Wulf, IRSEP vol 6, pp 77-104, 2013. Author's own copy fetched and text-extracted: https://gwulf.faculty.unlv.edu/wp-content/uploads/2018/11/Wulf_AF_review_2013.pdf
**Quoted:** "International Review of Sport and Exercise Psychology, 2013 / Vol. 6, No. 1, 77104" … "Over the past 15 years, research on focus of attention has consistently demonstrated that an external focus (i.e., on the movement effect) enhances motor performance and learning relative to an internal focus (i.e., on body movements)." … "Findings show that the performance and learning advantages through instructions or feedback inducing an external focus extend across different types of tasks, skill levels, and age groups."
**Verdict:** SUPPORTS — the external-focus default is exactly what this review concludes, across tasks, skill levels and age groups.
**Note on the number:** "~100 studies" is not the paper's figure. Its own count, p.95: "A rough count of the number of studies that have used comparable instructions under different focus conditions reveals that in about 80 experiments significant advantages of external relative to internal foci … were found". Inflation of about 25%, in a `used_for` string that is not user-visible. `data-defect`, minor.
**Consequence:** `/evidence` row. The substantive dependency — the `external_focus_default` principle and the external-focus wording of drill cues in `exercises.json` — is unaffected.

---

### wulf_shea_2002 — SUPPORTS

**Cited for:** (first-strict-pullup, muscle-up) "Crucial caveat: CI benefit is smaller for complex skills than lab tasks. Reduce challenge in acquisition (blocked weeks 1-2), add later. Anchors the phase-gated CI schedule." — (handstand-walk) "The crucial caveat that CI benefits are smaller for complex skills. Underpins the blocked-first, interleaved-later progression." — (overhead-mobility) "Complex motor skill acquisition; informs blocked-then-random session structure"
**Claimed:** Wulf G, Shea CH (2002), Psychonomic Bulletin & Review 9:185-211. No URL.
**Found:** PMID 12120783 via eutils efetch; Crossref `10.3758/bf03196276`. "Psychon Bull Rev. 2002 Jun;9(2):185-211."
**Quoted:** "We interpret these apparently contradictory findings as suggesting that situations with low processing demands benefit from practice conditions that increase the load and challenge the performer, whereas practice conditions that result in extremely high load should benefit from conditions that reduce the load to more manageable levels. The findings reviewed here call into question the generalizability of results from studies using simple laboratory tasks to the learning of complex motor skills."
**Verdict:** SUPPORTS — "reduce the load to more manageable levels" under high processing demand is precisely the blocked-first, interleaved-later reading. Attribution, year, venue, volume and pages all correct.
**Consequence:** `/evidence` row; author-time justification for the phase-gated contextual-interference schedule in four programmes. Nothing in code branches on it.

---

### adkin_frank_2000 — OVERSTATED

**Cited for:** No `used_for` — no `used_for` exists, because no programme references this id. Invoked in prose at `handstand-walk.json` `phase_0_bail_out_prep.rationale`: "Fear-of-falling literature: Adkin & Frank 2000/2002 (postural threat alters muscle activation before the fall)".
**Claimed:** Adkin AL, Frank JS, Carpenter MG, Peysar GW (2000), "Postural control is scaled to level of postural threat", Gait & Posture 12(2):87-93, https://pubmed.ncbi.nlm.nih.gov/10998604/
**Found:** PMID 10998604 via eutils efetch — every field matches exactly. "Gait Posture. 2000 Oct;12(2):87-93."
**Quoted:** "Sixty-two healthy adults (mean+/-S.D.=20.3+/-1.3 years) stood quietly on a force plate 40 cm (LOW threat), 100 cm (MEDIUM threat) or 160 cm (HIGH threat) above ground level." … "Amplitude of centre of pressure (COP) displacement decreased and frequency of COP displacement increased linearly as postural threat increased from LOW to HIGH. The central nervous system progressively tightened control of posture as postural threat increased."
**Verdict:** OVERSTATED — the paper is real and correctly identified, and it does establish that postural control scales to threat. But it reports **centre-of-pressure kinematics only; there is no EMG in this study**. "Postural threat alters muscle activation" is not this paper's finding — it is Carpenter 2001's. The prose also cites "Adkin & Frank 2000/**2002**"; no 2002 Adkin paper exists in `citations.json` at all, so half the cited pair is unlocatable from the repo.
**Reach:** 62 healthy young adults standing quietly on an elevated platform. The programme applies it to a self-taught adult falling out of an inverted handstand. Different task, different direction of threat, no locomotion. `needs-credentialed-human`.
**Consequence:** `/evidence` row only. The prose it supports (`phases[].rationale`) is not rendered — schema field `src/lib/schemas.ts:198`, no reader. The Phase 0 gate itself is driven by the `bail_out_readiness` intake answer and `bail_out_confidence >= 6 for 2 consecutive days`, neither of which reads a citation.

---

### carpenter_frank_2001 — OVERSTATED

**Cited for:** No `used_for`. Prose at `phase_0_bail_out_prep.rationale`: "Carpenter 2001 (anxiety degrades balance strategy)".
**Claimed:** Carpenter MG, Frank JS, Silcher CP, Peysar GW (2001), "The influence of postural threat on the control of upright stance", Experimental Brain Research 138(2):210-218, https://pubmed.ncbi.nlm.nih.gov/11417462/
**Found:** PMID 11417462 via eutils efetch — every field matches. "Exp Brain Res. 2001 May;138(2):210-8."
**Quoted:** "we examined kinetic and kinematic parameters during quiet stance of eight young healthy adults standing under three conditions which posed increasing levels of postural threat" … "A stiffening strategy was adopted when individuals stood under high threat conditions involving significant changes in kinematic, kinetic and EMG variables. The A-P stiffness constant increased significantly (27.5%) for the high threat compared to low threat condition".
**Verdict:** OVERSTATED — real, correctly identified, and it is the right paper for the muscle-activation claim mis-assigned to Adkin above. But "**degrades** balance strategy" is an interpretive step the paper does not take: it reports that a *different* strategy (stiffening) is adopted, and frames the work as understanding "the contribution of psychological factors such as fear of falling" to posturography, not as demonstrating decrement. n = 8.
**Reach:** eight young adults in quiet bipedal stance, 81 cm elevation. Nothing about inverted postures, hand support, or trained falling. `needs-credentialed-human`.
**Consequence:** `/evidence` row only; the prose is unrendered, as above.

---

### hardy_1996_catastrophe — CONTRADICTS

**Cited for:** No `used_for`. Prose at `phase_0_bail_out_prep.rationale`: "Hardy 1996 catastrophe model (anxiety above threshold causes performance collapse, not linear degradation)".
**Claimed:** Hardy L (1996), "A test of the catastrophe models of anxiety and sports performance against multidimensional anxiety theory", Anxiety, Stress, & Coping 9(1):69-86. No URL.
**Found:** Crossref `10.1080/10615809608249393` and OpenAlex record for the same DOI. Real title is longer than the repo's: "A test of catastrophe models of anxiety and sports performance against multidimensional anxiety theory models **using the method of dynamic differences**". Anxiety, Stress, & Coping 9(1):69-86, 1996. Author, year, venue, volume, pages correct.
**Quoted (OpenAlex abstract for `10.1080/10615809608249393`):** "Guastello's method of dynamic differences was used to fit catastrophe and multidimensional anxiety theory based behavior surfaces to data obtained from eight experienced golfers." … "Preliminary examination of the results suggested that the catastrophe models were superior to the multidimensional anxiety theory models … However, further tests of other control models suggested that the apparent superiority of the catstrophe models was probably due to the inclusion of a temporal factor in Guastello's method of dynamic differences. **It was concluded that the results do not offer any clear evidence for the superiority of either catastrophe or multidimensional anxiety theory based models of anxiety and performance.**"
**Verdict:** CONTRADICTS — the programme cites this paper as the authority for the catastrophe model, and the paper is a **null result on exactly that question**. Its own conclusion is that it found no clear evidence favouring catastrophe models. Its positive finding is a different one: "self-confidence is an important factor in performance which is at least partially independent of cognitive anxiety." Whatever the standing of catastrophe theory elsewhere in Hardy's corpus, *this* citation argues against the use it is put to.
**Reach:** eight experienced golfers, self-reported anxiety on a 1-27 integer scale, heart rate before each putt in a Stapleford competition. Discrete, low-physical-risk, self-paced task. `data-defect` (wrong paper for the claim) compounded by `needs-credentialed-human` (whether the catastrophe framing belongs in a falling-practice rationale at all is a judgement).
**Consequence:** `/evidence` row — the paper is presented in the app's bibliography as part of the evidence base. The rationale prose that misuses it is not rendered. Nothing in code branches on it. The remedy is a data question for a human, not a prescription change.

---

### bandura_1997_self_efficacy — SUPPORTS (with two stated limits)

**Cited for:** No `used_for`; `review_note` in `citations.json` reads "Book, not paper. Referenced for the mastery-experiences → threat-perception reduction mechanism used in Phase 0 bail-out drill design." Invoked in prose at `phase_0_bail_out_prep.rationale` ("Bandura (mastery experiences on bail-outs reduce threat perception on the primary skill — you don't reduce fear by walking more)"), at `block_bail_mat_falls.rationale`, and — **the only user-visible instance in this batch** — at `exercises.json` `deliberate_mat_falls.rationale`: "Bandura self-efficacy: mastery experiences on the FEARED thing (not on a proxy) reduce threat perception on the primary skill."
**Claimed:** Bandura A (1997), *Self-Efficacy: The Exercise of Control*, W. H. Freeman (book).
**Found:**
- Existence — Google Books record `id=eJ-PN9g_o-EC`: "**Title:** Self-Efficacy: The Exercise of Control / **Author:** Albert Bandura / **Publisher:** Worth Publishers / **Year:** 1997 / **ISBN:** 0716728508, 9780716728504 / **Page Count:** 604 pages". Retailer and Wikipedia records give the imprint as W. H. Freeman, 1997, same ISBN. The book exists as claimed; W. H. Freeman / Worth is an imprint difference, not a defect.
- Mastery half — https://pmc.ncbi.nlm.nih.gov/articles/PMC12502103/ (peer-reviewed, quoting Bandura 1997 with page): the four sources are **"mastery experience, vicarious experience, social persuasion, and physiological and emotional states"** (Bandura 1997, p. 3), and **"Mastery experience, derived from successfully navigating challenging situations through persistent effort, is assumed to represent the most potent source of self-efficacy"** (Bandura, 1997).
- Threat half — Bandura's **own** words, "Self-efficacy conception of anxiety", 1988, `10.1080/10615808808248222`, via OpenAlex: "In social cognitive theory, perceived self-efficacy to exercise control over potential threats plays a central role in anxiety arousal. **Threat is a relational property reflecting the match between perceived coping capabilities and potentially hurtful aspects of the environment.** People who believe they can exercise control over potential threats do not engage in apprehensive thinking and are not perturbed by them."
**Verdict:** SUPPORTS — the mechanism the programme attributes to Bandura is Bandura's, not a later gloss. Mastery experience as the most potent efficacy source is his; and threat-as-appraisal-relative-to-perceived-coping-capability is his own formulation in his own voice. The two-step chain the programme states (mastery on the feared act → raised coping efficacy → reduced threat appraisal) is social cognitive theory as Bandura wrote it.
**Two limits, stated rather than resolved:**
1. **I could not retrieve a page of the 1997 book itself.** No open-access copy is reachable; the mastery-ranking quote is a peer-reviewed secondary source quoting p. 3, and the threat quote is Bandura's 1988 paper. Nothing I retrieved is the 1997 text. If page-accurate attribution matters — and for a book citation on a bibliography page, it plausibly does — that is an open item.
2. **The transfer step is not evidenced by anything I retrieved.** "Mastery experiences on the FEARED thing … reduce threat perception on **the primary skill**" asserts that efficacy gained on deliberate mat falls generalises to the handstand walk. Bandura's theory concerns efficacy for a given domain of functioning; whether bail-out efficacy transfers to inversion efficacy in this population is an empirical claim no source here tests. `needs-credentialed-human`.
**Consequence:** This is the one entry in the batch with a live user-facing surface beyond `/evidence`. `exercises.json` `deliberate_mat_falls.rationale` renders in `ExerciseDetailsSheet.tsx:127-130` to any handstand-walk user who opens that drill's details — a drill whose instruction is "From wall handstand, LET GO ON PURPOSE." The rationale is the stated justification for a deliberately risk-taking instruction, and it is also gated: `handstand-walk.json:537` blocks the programme outright for post-concussive/vestibular users on the grounds that "this program opens with deliberate falls." The citation itself holds up. The transfer assumption on top of it is the part a human should sign.

---

### bosquet_2007 — OVERSTATED

**Cited for:** "Meta-analysis anchor for the ~3% performance uplift claim on the taper. Stronger single-source anchor than Mujika & Padilla 2000 alone; both are now cited." Also `rowing-2k-test-prep.json:36`: "Bosquet 2007 meta-analysis + Mujika & Padilla 2000 (I+II): reducing volume 40-60% while holding intensity produces the classic taper effect — ~3% performance uplift on race day. Bosquet is the stronger single-source anchor for the effect size".
**Claimed:** Bosquet L, Montpetit J, Arvisais D, Mujika I (2007), "Effects of tapering on performance: a meta-analysis", MSSE 39(8):1358-1365, https://pubmed.ncbi.nlm.nih.gov/17762369/
**Found:** PMID 17762369 via eutils efetch — authors, title, journal, volume, issue, pages all exact. Unpaywall for `10.1249/mss.0b013e31806010e0`: `"oa_status": "closed"`, `"oa_locations": []` — no full text reachable.
**Quoted:** "Twenty-seven of 182 potential studies met these criteria" … "The optimal strategy to optimize performance is a tapering intervention of 2-wk duration (overall effect = 0.59 +/- 0.33, P < 0.001), where the training volume is exponentially decreased by 41-60% (overall effect = 0.72 +/- 0.36, P < 0.001), without any modification of either training intensity … or frequency".
**Verdict:** OVERSTATED — the paper exists exactly as cited, the identifier resolves correctly, and the **structural** half of the claim is verbatim supported: 2-week taper, volume down 41-60%, intensity held. But the paper as retrievable reports **standardised effect sizes, not percentages**. The "~3%" figure is nowhere in the abstract, and the programme itself attributes the same 3% to Mujika & Padilla 2000 in four other places (`:410`, `:665`, `:758`, `:1003`) — so `bosquet_2007` is being described as "the stronger single-source anchor for the effect size" for a number that appears to come from the other source. I could not obtain full text to rule out a 3% figure in the results or discussion; that check remains open. Classify `data-defect` pending full-text.
**Consequence:** The 3% number is **user-visible**, unlike most of this batch: `rowing-2k-test-prep.json:1003` `body_md` — "The taper week reduces volume ~45% while intensity holds — that's where the ~3% uplift comes from" — and `:1063` copy promising "race-day taper will unlock the last 3-5%". The prescription those sit on (volume −45%, intensity held, 2 weeks) is supported by the retrieved abstract; the quantified promise to the user is the part that is not.

---

### steinacker_1998 — MISATTRIBUTED (identifier)

**Cited for:** "Rowing-specific physiological profile in elite rowers preparing for world championships. Replaced das_2019 as a stronger anchor for the metabolic-profile claims (Path A Q5)."
**Claimed:** Steinacker JM, Lormes W, Lehmann M, Altenburg D (1998), "Training of rowers before world championships", MSSE 30(7):1158-1163, **https://pubmed.ncbi.nlm.nih.gov/9662688/**
**Found:** PMID **9662688** via eutils efetch resolves to a **different paper**: "Med Sci Sports Exerc. 1998 Jul;30(7):1151-7. **Overtraining and immune system: a prospective longitudinal study in endurance athletes.** Gabriel HH, Urhausen A, Valet G, Heidelbach U, Kindermann W." The paper the repo describes is **PMID 9662689** — adjacent record, one digit out: "Med Sci Sports Exerc. 1998 Jul;30(7):1158-63. Training of rowers before world championships. Steinacker JM, Lormes W, Lehmann M, Altenburg D."
**Quoted (the correct record, PMID 9662689):** "In rowing, static and dynamic work of approximately 70% of the body's muscle mass is involved for 5.5 to 8 min at an average power of 450 to 550 W. In high load training phases before World Championships, training volume reaches 190 min.d-1, of which between 55 and 65% is performed as rowing … Rowing training is mainly performed as endurance training, rowing 120 to 150 km or 12 h.wk-1. Rowing at higher intensities is performed between 4 and 10% of the total rowed time."
**Verdict:** MISATTRIBUTED — the cited URL points at another study. Title, authors, journal, volume, issue and page range in `citations.json` are all correct for the real paper; only the PMID is wrong. On the substance, the real paper does support "rowing-specific physiological profile in elite rowers preparing for world championships" — 70% muscle mass, 5.5-8 min, 450-550 W, and the polarised 4-10%-high-intensity distribution. `data-defect`, one character.
**Reach:** international-standard rowers in a world-championship build. The programme is a 6-week 2K test prep for a general beta user. The power and volume figures (190 min/day, 120-150 km/wk) do not transfer and are not being prescribed; the *shape* of the metabolic demand is what is borrowed. Note the gap; a human decides. Also `verification_status: "unverified"` on the programme reference is honest and should stay until the PMID is fixed.
**Consequence:** `/evidence` row carries the wrong link — a reader who taps "Read the paper ↗" lands on an overtraining/immunology study. `CitationRef.tsx:64-70` renders `citation.url` as that link; `evidence/page.tsx` renders it too. This is the one defect in the batch that misleads a user *in one tap*.

---

### yiou_2017 — OVERSTATED

**Cited for:** "Walking initiation biomechanics — CoP shift precedes step. Informs the single_step_attempt drill design and the 'lean the shape toward the far wall' external-focus cue. Replaced ferrari_2021 (unlocatable) 2026-08-18 per founder-approved plan."
**Claimed:** Yiou E, Caderby T, Delafontaine A, Fourcade P, Honeine JL (2017), World Journal of Orthopedics 8(11):815-828, https://pubmed.ncbi.nlm.nih.gov/29184756/
**Found:** PMID 29184756 via eutils efetch — every field matches exactly. "World J Orthop. 2017 Nov 18;8(11):815-828."
**Quoted:** "It is well known that balance control is affected by aging, neurological and orthopedic conditions. Poor balance control during gait and postural maintenance are associated with disability, falls and increased mortality. Gait initiation — the transient period between the quiet standing posture and steady state walking — is a functional task … Balance control mechanisms reviewed in this article included **anticipatory postural adjustments**, stance leg stiffness, foot placement, lateral ankle strategy, swing foot strike pattern and vertical center of mass braking."
**Verdict:** OVERSTATED — real, correctly identified, and anticipatory postural adjustments preceding the step is squarely within its reviewed scope, so the narrow biomechanical statement stands. The overstatement is the **task and population**: this is a review of **bipedal gait initiation from quiet standing**, framed for "aging, neurological and orthopedic conditions" and "frail populations", explicitly aimed at rehabilitation targeting. It is applied here to initiating locomotion **on the hands, inverted**, in a healthy skill-training adult. Nothing in the paper addresses upper-limb support, inversion, or a base of support at the hands.
**Reach:** the whole distance between able-bodied/frail bipedal gait initiation and handstand walking. `needs-credentialed-human`. I note it; I do not resolve it. Worth flagging that this citation was itself a replacement for an unlocatable one (`ferrari_2021`), which is the classic setting for a near-enough substitution.
**Consequence:** `/evidence` row. The drill it justifies (`single_step_attempt`) and the "lean the shape toward the far wall" cue are authored content; no code path reads the citation.

---

### youdas_2010 — OVERSTATED (and the byline is wrong)

**Cited for:** (first-strict-pullup) "EMG hierarchy across pull-up variants — scap phase precedes concentric pull; wide-grip biases lat, neutral biases brachialis. Anchors the scap-first progression and grip-width rotation in Tier D." — (muscle-up) "Pull-variant EMG hierarchy. Supports the false-grip-as-separate-capability framing and the grip-position-matters logic. Referenced by the shared drill library."
**Claimed:** Youdas JW, **Amundson CL, Cicirello KS, Hellmers CJ**, Hollman JH (2010), JSCR 24(12):3404-3414, https://pubmed.ncbi.nlm.nih.gov/21068680/, `verification_status: "verified"`
**Found:** PMID 21068680 via eutils efetch — journal, volume, issue, pages and year exact; PMID resolves correctly. Actual byline: "Youdas JW, **Amundson CL, Cicero KS, Hahn JJ, Harezlak DT**, Hollman JH."
**Quoted:** "This study compared a conventional pull-up and chin-up with a rotational exercise using Perfect·Pullup™ twisting handles. Twenty-one men (24.9 ± 2.4 years) and 4 women (23.5 ± 1 years) volunteered" … "Average EMG muscle activation values (%MVIC) were as follows: latissimus dorsi (117-130%), biceps brachii (78-96%), infraspinatus (71-79%), lower trapezius (45-56%), pectoralis major (44-57%), erector spinae (39-41%), and external oblique (31-35%)." … "A general pattern of sequential activation occurred suggesting that pull-ups and chin-ups were **initiated by the lower trapezius and pectoralis major and completed with biceps brachii and latissimus dorsi recruitment**."
**Verdict:** OVERSTATED, on four counts:
1. **Supported:** "scap phase precedes concentric pull" — the sequential-activation sentence is a fair reading (lower trapezius initiates).
2. **Not supported:** "wide-grip biases lat, neutral biases brachialis." The three conditions were pull-up, chin-up and Perfect·Pullup. There was **no wide-grip and no neutral-grip condition**, and **brachialis was not among the eight recorded muscles**. This half of the `used_for` describes a study that was not run.
3. **Not supported:** "supports the false-grip-as-separate-capability framing" (muscle-up). **False grip was not studied.**
4. **Byline defect:** `Cicirello KS` and `Hellmers CJ` do not appear on the paper; `Hahn JJ` and `Harezlak DT` are missing. `citations.json` and both programme reference blocks carry the *same* wrong names, so the "same paper" test at `data-integrity.test.ts:1466` — which compares first surname and title overlap between programme and citations records — passes cleanly on an error present in both. Consistency is not correctness.
The `verification_status: "verified"` flag on this record is not warranted. `data-defect`.
**Consequence:** `/evidence` renders the wrong byline to users. Downstream of the *claim*: 13 drills in `exercises.json` carry `youdas_2010` in `evidence_refs[]` (`pu_*` and muscle-up pull drills) — unrendered today, wrong the day that field gets a UI. The "grip-width rotation in Tier D" programming decision in first-strict-pullup has, on this evidence, no citation behind it.

---

### roig_2009 — OVERSTATED (the quoted effect sizes are not in the paper, and the matched-work condition is a null result)

**Cited for:** (first-strict-pullup) "Meta-analytic evidence: eccentric training produces greater strength gains than concentric-only **for matched work (ES 1.02 vs 0.94)**. Anchors the negatives-as-primary-Tier-B-driver decision." — (muscle-up) "Eccentric training produces greater strength gains than concentric-only. Anchors the transition-negative-from-support drill as the **highest-transfer analog** for the muscle-up transition."
**Claimed:** Roig M, O'Brien K, Kirk G, et al. (2009), BJSM 43(8):556-568, https://pubmed.ncbi.nlm.nih.gov/18981046/, `verification_status: "verified"`
**Found:** PMID 18981046 via eutils efetch — authors, title, journal, volume, issue, pages, year all exact; identifier resolves correctly. Full text retrieved and text-extracted from https://www.mvclinic.es/wp-content/uploads/Roig-et-al-2009-Effects-ECC-Vs-CON-on-muscle-Systematic-Review.pdf (14 pp.).
**Quoted (abstract):** "Meta-analyses showed that when eccentric exercise was performed **at higher intensities** compared with concentric training, total strength and eccentric strength increased more significantly. However, compared with concentric training, strength gains after eccentric training appeared more specific in terms of velocity and mode of contraction." … "Further research is required to investigate the underlying mechanisms of this specificity and **its functional significance in terms of transferability of strength gains to more complex human movements**."
**Quoted (full text, Results — "Total strength"):** "The meta-analyses of all participants in 15 studies, regardless of whether they trained at higher or equal eccentric than concentric training intensities, showed **no difference** in improved total strength as reflected by average peak torque (WMD 3.71 N.m; 95% CI 20.27 to 7.70; p = 0.07; n = 333) … However, a meta-analysis of a subgroup of participants who trained at **higher** eccentric than concentric intensity showed significantly greater increases in total strength of 4.24 N.m (95% CI 0.24 to 8.24; p = 0.04; n = 313) … In contrast, **when the intensity of eccentric and concentric training was comparable, no significant differences in the improvement of total strength after training were observed**."
**Verdict:** OVERSTATED, and the specific numbers do not exist:
1. **"ES 1.02 vs 0.94" is not in the paper.** I searched the extracted full text for `1.02`, `0.94`, `ES =`, `SMD` and `standardised mean` — no matches. The paper reports **weighted mean differences in N.m and kg**, not standardised effect sizes. Two decimal-place figures presented as meta-analytic effect sizes, absent from the source. That is the most serious kind of citation defect in the batch: a reader has no way to know the number was not taken from the paper.
2. **The qualifier inverts the finding.** The `used_for` says eccentric beats concentric "**for matched work**". The paper says the opposite: superiority appears **only** when eccentric intensity is *higher*, and "when the intensity … was comparable, no significant differences … were observed."
3. **"Highest-transfer analog" is the one thing the authors explicitly decline to claim**, calling transferability to "more complex human movements" the open question.
**Reach:** healthy adults 18-65, and — from the extracted inclusion criteria and study table — training performed largely on **isokinetic dynamometers**, overwhelmingly **knee extensors**, with some elbow flexors/extensors and rotator cuff. Inclusion required "comparison of eccentric and concentric training programmes performed separately (eg, isokinetic dynamometer)". The application is to bodyweight pull-up negatives and a ring muscle-up transition: multi-joint, self-loaded, skill-coupled, not velocity-controlled. The authors' own caveat — "excessively weighted gains in eccentric strength could have influenced the measure of total strength" — bears directly on reading this as general strength transfer. `data-defect` (the numbers and the "matched work" qualifier) plus `needs-credentialed-human` (whether the negatives-first decision survives once the qualifier is corrected).
**Consequence:** 11 drills in `exercises.json` carry `roig_2009` in `evidence_refs[]` (unrendered). `/evidence` row is bibliographically correct. The programming decisions named in the `used_for` — negatives as the primary Tier B driver in first-strict-pullup, and transition-negative-from-support as the muscle-up anchor — are authored, not code-gated; nothing in `src/` reads the id. So the exposure is to the *claim*, not to app behaviour: the app will do the same thing tomorrow whatever this verdict says, but the stated reason for doing it is wrong as written. `verification_status: "verified"` is not warranted.

---

### sinnett_2019 — NOT_FOUND

**Cited for:** (first-strict-pullup) "Band-assisted pull-up training improves strength and pull-up performance. Supports band assistance as a legitimate groove/volume driver rather than a lesser substitute." — (muscle-up) "…and underwrites **band-assisted ring dip as the deferral substitute**." Both carry a 2026-09-02 note that an earlier EMG wording was already walked back.
**Claimed:** Sinnett AM, Cheatham SW, Brismée JM (2019), "The effect of band-assisted pull-up training on muscular strength and pull-up performance", "Journal of Strength and Conditioning Research (or proceedings)", no URL, `verification_status: "pending"`
**Found:** Nothing. Searches run, all in this session:
- PubMed esearch `Sinnett AND pull-up` → **0 results**.
- Europe PMC `AUTH:"Sinnett AM"` → hitCount 1, and it is a different paper: "Sinnett AM, Berg K, Latin RW, Noble JM. *The relationship between field tests of anaerobic power and 10-km run performance*, 2001."
- Europe PMC `"band-assisted pull-up"` → **hitCount 0**.
- Crossref bibliographic query "band-assisted pull-up training muscular strength pull-up performance Sinnett Cheatham" → top hits are unrelated encyclopaedia entries ("Pull-Up", "Gorilla Pull-Up") and LaChance & Hortobagyi 1994.
- Web search "Sinnett Cheatham Brismée band-assisted pull-up 2019" → no matching record; results are commercial fitness blogs.
**Verdict:** NOT_FOUND — no record of this work in PubMed, Europe PMC, Crossref or open web search. The `source` field in the repo ("Journal of Strength and Conditioning Research (**or proceedings**)") is itself an admission that nobody has ever located it. Note that Cheatham SW and Brismée JM are real, prolific authors; a plausible byline on an unlocatable title is the signature pattern to be worried about, not reassured by. `data-defect`.
**Consequence:** the widest blast radius in the batch. **19 drills** in `exercises.json` carry `sinnett_2019` in `evidence_refs[]` — more than any other id here — plus references in two programmes. Unrendered today (`data-integrity.test.ts:938`), so no user currently sees it, but it appears on `/evidence` as a `CITED` row with no link, under a page that tells the user "If a claim in the app can't be traced back to something here, it's engineering-choice, not cited." The band-assistance progression and the muscle-up **deferral substitute** — the thing offered to a user who is not yet ready — currently rest on nothing retrievable.

---

### vigouroux_2007 — MISATTRIBUTED (identifier; and the year, volume and pages are wrong)

**Cited for:** "Tendon tension and pulley force vary substantially by grip technique — the basis for treating grip position as a load variable in hang work. The paper does not establish a hang-time dose; the 20-45s range is coaching convention, not a finding from this source."
**Claimed:** Vigouroux L, Quaine F, Labarre-Vila A, Moutet F (**2007**), "Estimation of finger muscle tendon tensions and pulley forces during specific sport-climbing grip techniques", **Journal of Biomechanics 40(13):2896-2903**, **https://pubmed.ncbi.nlm.nih.gov/17442324/**, `verification_status: "verified"`
**Found:** PMID **17442324** via eutils efetch resolves to: "**J Chromatogr A. 2007 Jun 22;1154(1-2):3-25. Comprehensive multi-residue method for the target analysis of pesticides in crops using liquid chromatography-tandem mass spectrometry. Hiemstra M, de Kok A.**" A pesticide-residue chemistry paper. The real paper, found via PubMed esearch `Vigouroux AND pulley AND climbing` → PMID **16225880**: "**J Biomech. 2006;39(14):2583-92.** Estimation of finger muscle tendon tensions and pulley forces during specific sport-climbing grip techniques. Vigouroux L, Quaine F, Labarre-Vila A, Moutet F." Title and full author list match exactly; **year, volume, issue and pages in the repo are all wrong** (2007/40(13)/2896-2903 vs 2006/39(14)/2583-92).
**Quoted (PMID 16225880):** "A three-dimensional static biomechanical model was used to estimate finger muscle tendon and pulley forces during the 'slope' and the 'crimp' grip." … "The FDP-to-FDS tendon-force ratio was 1.75:1 in the crimp grip and 0.88:1 in the slope grip." … "**The forces acting on the pulleys were 36 times lower for A2 in the slope grip than in the crimp grip, while the forces acting on A4 were 4 times lower.**"
**Verdict:** MISATTRIBUTED — the identifier points at a completely unrelated paper in analytical chemistry, and three further bibliographic fields are wrong. On substance, once you find the right record, the claim is well supported and honestly bounded: a 36-fold A2 pulley-force difference between grips is about as strong a statement of "grip position is a load variable" as one could ask for, and the `used_for` already disclaims the hang-time dose rather than smuggling it in. That disclaimer is good practice and should be preserved when the record is corrected. `data-defect`.
**Reach:** the model is of **finger flexor tendons and annular pulleys in sport-climbing grips** (crimp vs slope). Applied to dead hangs and farmer's carries on a pull-up bar. The direction of the finding (grip configuration changes tissue loading substantially) travels; the specific pulley-force magnitudes do not, and are not being used. `needs-credentialed-human` only lightly.
**Consequence:** `/evidence` renders the wrong year and source line, and its "Read the paper ↗" link (`evidence/page.tsx`, `CitationRef.tsx:64`) sends a user to a paper about pesticides in lettuce. Two drills (`pu_dead_hang`, `pu_farmers_carry`) carry it in `evidence_refs[]`, unrendered. `verification_status: "verified"` is not warranted.

---

### beattie_2014 — MISATTRIBUTED (as currently attached; the paper itself is sound)

**Cited for:** **No `used_for` remains.** The programme reference was deliberately removed — `first-strict-pullup.json:1603`: "C-1 beattie_2014 removed (endurance-athlete review cited for grip dose)." But the id still sits in `exercises.json` `evidence_refs[]` on exactly two drills: `pu_dead_hang` (89) and `pu_farmers_carry` (112).
**Claimed:** Beattie K, Kenny IC, Lyons M, Carson BP (2014), "The effect of strength training on performance in endurance athletes", Sports Medicine 44(6):845-865, **url: null**, `verification_status: "pending"`
**Found:** Crossref `10.1007/s40279-014-0157-y`, then PMID 24532151 via eutils efetch — "Sports Med. 2014 Jun;44(6):845-65." Authors, title, journal, volume, issue, pages, year **all exact**.
**Quoted:** "The aim of this systematic review was to search the body of scientific literature for original research investigating the effect of strength training on performance indicators in **well-trained endurance athletes** — specifically economy, [VO2max] and muscle power (vMART)." … "Twenty-six studies met the inclusion criteria (athletes had to be trained endurance athletes with ≥6 months endurance training, training ≥6 h per week OR [VO2max] ≥50 mL/min/kg…)" … "The results showed that strength training improved time-trial performance, economy, [VO2max] and vMART in competitive endurance athletes."
**Verdict:** MISATTRIBUTED — the paper is real, correctly described, and its own claims are sound. But it is a review of **strength training for trained endurance athletes' running/cycling economy and time-trial performance**, and it is currently attached as supporting evidence to a **dead hang** and a **farmer's carry** in a beginner pull-up programme. It says nothing about grip endurance, isometric hang dose, or loaded carries. The programme author already reached this conclusion and pulled it from `references[]`; **the removal was incomplete** — the two `evidence_refs[]` pointers survived because nothing reads or tests that field for claim-fit (only for id existence, `data-integrity.test.ts:950`). `data-defect`, and a tidy illustration of why an unrendered pointer set still has to be right.
**Consequence:** `/evidence` row is bibliographically correct and unlinked (`url: null`, so no "Read the paper ↗" renders — see `evidence/page.tsx` `{c.url ? … : null}`). The two stale `evidence_refs` are invisible today and would misattribute the moment a "papers behind this drill" view ships. `verification_status: "pending"` should now read verified for the *record* — the defect is the attachment, not the paper.

---

### dickie_2017 — MISATTRIBUTED

**Cited for:** "EMG data on pull-up variants — supports the drill-library ordering and the **false-grip pull-up as its own capability**."
**Claimed:** Dickie JA, Faulkner JA, Barnes MJ, Lark SD (2017), "Electromyographic analysis of muscle activation during pull-up variations", Journal of Electromyography and Kinesiology 32:30-36, **url: null**, `verification_status: "pending"`
**Found:** Crossref `10.1016/j.jelekin.2016.11.004`, then PMID 28011412 via eutils efetch — "J Electromyogr Kinesiol. 2017 Feb;32:30-36." Authors, title, journal, volume, pages, year **all exact**.
**Quoted:** "This study sought to identify any differences in peak muscle activation (EMGPEAK) or average rectified variable muscle activation (EMGARV) during **supinated grip, pronated grip, neutral grip and rope pull-up** exercises. Nineteen strength trained males (24.9±5y…)" … "**Results indicate that EMGPEAK and EMGARV of the shoulder-arm-forearm complex during complete repetitions of pull-up variants are similar despite varying hand orientations**; however, differences exist between concentric and eccentric phases of each pull-up."
**Verdict:** MISATTRIBUTED — real, correctly identified, and it does not address the claim. **False grip was not one of the four conditions** (supinated, pronated, neutral, rope), so it cannot support "the false-grip pull-up as its own capability". Worse for the framing: the paper's headline conclusion runs the *other* way — activation is "similar despite varying hand orientations", with the single exception of middle trapezius in pronated vs neutral (ES 1.19 / 1.29). Cited as evidence that grip orientation differentiates capability, when its conclusion is that orientation largely does not differentiate activation. The one finding that *would* be useful here — "The concentric phases of each pull-up variation resulted in significantly greater EMGARV of the brachioradialis, biceps brachii, and pectoralis major in comparison to the eccentric phases" — is not what the `used_for` cites it for. `data-defect`.
**Reach:** 19 strength-trained males, bar pull-ups. Applied to ring work in a mixed-ability catalog programme. Note the gap.
**Consequence:** `/evidence` row (unlinked, `url: null`). Two drills (98, 99) carry it in `evidence_refs[]`, unrendered. The false-grip-as-separate-capability framing in muscle-up now has **two** citations behind it and neither holds: this one (false grip not studied) and `vidal_rovira_2024` (below, not found). `youdas_2010` was the third, and false grip is absent there too.

---

### vidal_rovira_2024 — NOT_FOUND

**Cited for:** "Higher forearm activation in false-grip vs standard. Small sample, flagged for founder science-advisor review. Supports the false-grip-as-separate-capability framing but is not the load-bearing citation."
**Claimed:** Vidal-Rovira R, et al. (2024), "Forearm activation patterns in false-grip vs standard grip on gymnastic rings", "Preprint / conference — verification required", no URL, `verification_status: "pending"`
**Found:** Nothing. Searches run, all in this session:
- Crossref bibliographic "false grip gymnastic rings forearm activation Vidal-Rovira" → no relevant hit (top results: a BSI standard for hanging rings, a paediatric forearm-fracture thesis, an IEEE grip-aperture paper).
- OpenAlex search "false grip rings forearm activation" → no relevant hit.
- Europe PMC `AUTH:"Vidal-Rovira"` → **hitCount 0**.
- Europe PMC `"false grip" AND rings` → hitCount 1, a different paper: Walker CW, Bruenger AJ, Tucker WS, Lee HR, "Comparison of Muscle Activity During a Ring Muscle Up and a Bar Muscle Up", 2023.
- Web search `"Vidal-Rovira" false grip gymnastic rings forearm activation 2024` → no record of the author in this context; results are retail and coaching pages.
**Verdict:** NOT_FOUND — no record in Crossref, OpenAlex, Europe PMC or open web search, under the author name or the title. The repo's own `source` field says "Preprint / conference — verification required", which is honest, but an unverifiable preprint has been sitting in a shipped bibliography for some period. `data-defect`.
**Consequence:** **9 drills** in `exercises.json` carry it in `evidence_refs[]` (the false-grip and ring-transition family), unrendered. It renders on `/evidence` as a `CITED` row with no link and a `display_line` that reads "Vidal-Rovira et al. (2024), preprint (verification pending)" — the app is telling users it has a source it cannot produce. Note the honest hedge already in the `used_for` ("is not the load-bearing citation") — but per `dickie_2017` above, the citation it defers to does not carry the claim either. There is a real adjacent paper (Walker et al. 2023, ring vs bar muscle-up EMG) that a human may want to assess; I make no recommendation.

---

## Summary

| id | verdict | class | identifier resolves? |
|---|---|---|---|
| wulf_2013 | SUPPORTS | (count drift: "~100" vs paper's "about 80 experiments") | no URL given; DOI verified |
| wulf_shea_2002 | SUPPORTS | — | no URL given; PMID 12120783 verified |
| adkin_frank_2000 | OVERSTATED | needs-credentialed-human + data-defect | yes |
| carpenter_frank_2001 | OVERSTATED | needs-credentialed-human | yes |
| hardy_1996_catastrophe | **CONTRADICTS** | data-defect | no URL; DOI verified, title truncated |
| bandura_1997_self_efficacy | SUPPORTS | needs-credentialed-human (transfer step) | book verified via Google Books/ISBN |
| bosquet_2007 | OVERSTATED | data-defect (3% unverifiable; full text closed) | yes |
| steinacker_1998 | **MISATTRIBUTED** | data-defect | **no — PMID 9662688 is a different paper; correct is 9662689** |
| yiou_2017 | OVERSTATED | needs-credentialed-human | yes |
| youdas_2010 | OVERSTATED | data-defect (byline wrong; two claims not studied) | yes |
| roig_2009 | OVERSTATED | data-defect + needs-credentialed-human | yes |
| sinnett_2019 | **NOT_FOUND** | data-defect | no URL; no record anywhere |
| vigouroux_2007 | **MISATTRIBUTED** | data-defect | **no — PMID 17442324 is a pesticide-chemistry paper; correct is 16225880, and year/vol/pages are also wrong** |
| beattie_2014 | MISATTRIBUTED (as attached) | data-defect | no URL; PMID 24532151 verified |
| dickie_2017 | **MISATTRIBUTED** | data-defect | no URL; PMID 28011412 verified |
| vidal_rovira_2024 | **NOT_FOUND** | data-defect | no URL; no record anywhere |

Two `SUPPORTS`. Two `NOT_FOUND`. One `CONTRADICTS`. Three verdicts turn on an identifier that resolves to the wrong paper or to nothing.

Three records carry `verification_status: "verified"` and should not: `youdas_2010` (byline wrong, two cited claims not studied), `roig_2009` (quoted effect sizes absent from the paper), `vigouroux_2007` (PMID, year, volume and pages all wrong). On `/evidence` those three render a green `VERIFIED` pill (`evidence/page.tsx`: `status === "REVIEWED" || status === "VERIFIED" ? "VERIFIED" : "CITED"`) — the pill is the app's own assertion that a specialist checked the source. Note that the pill reads `citations.json`'s `status` field, which none of these three actually sets, so they currently render `CITED`; the `verification_status` key they do set is a different field and is not read by the page. Both facts are worth a human's attention: the flag that would mislead is not wired, and the flag that is set is unearned.

---

## Claims now unsupported

Every programme assertion below stands on a citation that did not come back `SUPPORTS`. Listed
as claims, not as fixes. I do not propose prescription changes.

1. **"Anxiety above threshold causes performance collapse, not linear degradation."**
   (`handstand-walk.json` `phase_0_bail_out_prep.rationale`.) Rests on
   `hardy_1996_catastrophe`, whose stated conclusion is that it found **no clear evidence**
   for catastrophe models over multidimensional anxiety theory. `CONTRADICTS`.

2. **"Postural threat alters muscle activation before the fall"** attributed to Adkin & Frank
   2000. That study measured centre-of-pressure only; it contains no EMG. The claim belongs to
   `carpenter_frank_2001`. The companion "Adkin & Frank **2002**" has no record in
   `citations.json`.

3. **"Anxiety degrades balance strategy"** (Carpenter 2001). The paper reports a *stiffening
   strategy* under threat in n=8 quiet standers — a change of strategy, not a demonstrated
   decrement, and anxiety was not the manipulated variable.

4. **"Eccentric training produces greater strength gains than concentric-only for matched
   work (ES 1.02 vs 0.94)."** (`first-strict-pullup`, anchoring negatives as the primary
   Tier B driver.) The effect sizes appear nowhere in Roig 2009's full text, which reports
   weighted mean differences; and the paper found **no significant difference** in exactly the
   matched-intensity condition the claim names.

5. **"Transition-negative-from-support is the highest-transfer analog for the muscle-up
   transition."** (`muscle-up`.) Transferability of eccentric strength gains "to more complex
   human movements" is the question Roig 2009 explicitly leaves open.

6. **"Wide-grip biases lat, neutral biases brachialis"** and the **grip-width rotation in
   Tier D** (`first-strict-pullup`). Youdas 2010 ran no wide-grip and no neutral-grip
   condition and did not record brachialis.

7. **The false-grip-as-separate-capability framing** (`muscle-up`). All three supporting ids
   fail: `youdas_2010` (false grip not studied), `dickie_2017` (false grip not among its four
   grips, and its conclusion is that activation is *similar* across hand orientations),
   `vidal_rovira_2024` (no record of the work exists).

8. **"Band assistance is a legitimate groove/volume driver rather than a lesser
   substitute"**, and **band-assisted ring dip as the muscle-up deferral substitute.** Both
   rest solely on `sinnett_2019`, which is `NOT_FOUND`. The deferral substitute is what a
   not-yet-ready user is handed, which makes this the one unsupported claim in the batch with
   a safety-adjacent role.

9. **"~3% performance uplift on race day"** — user-visible in `rowing-2k-test-prep.json:1003`
   and as "the last 3-5%" at `:1063`. Bosquet 2007's retrievable record reports SMD 0.59 ±
   0.33, not a percentage; full text is paywalled and the figure could not be confirmed. The
   *structural* prescription (2 weeks, volume −41-60%, intensity held) **is** supported
   verbatim.

10. **CoP/anticipatory-postural-adjustment biomechanics as the basis for `single_step_attempt`
    and the "lean the shape toward the far wall" cue** (`handstand-walk`). Yiou 2017 is a
    review of **bipedal gait initiation from quiet standing**, aimed at aging, neurological
    and orthopedic populations. It addresses neither inversion nor hand support.

11. **Grip position as a load variable in hang work** (`first-strict-pullup`). The claim is
    well supported — but by Vigouroux et al. **2006**, J Biomech 39(14):2583-92, PMID
    16225880. As shipped, the citation's PMID leads a user to a paper on pesticide residues
    in crops, and three other bibliographic fields are wrong.

12. **Any grip/hang claim attached to `pu_dead_hang` and `pu_farmers_carry` via
    `beattie_2014`.** That review concerns strength training for trained endurance athletes'
    economy and time-trial performance. The programme author already withdrew it from
    `references[]` for this reason; the `evidence_refs[]` pointers were not withdrawn with it.

13. **"Rowing-specific physiological profile"** in `rowing-2k-test-prep`. The claim *is*
    supported by the real Steinacker 1998, but the shipped PMID resolves to Gabriel et al.,
    "Overtraining and immune system" — so as published, the claim is untraceable by the reader
    and the `/evidence` link is wrong.

Two further items for a human, not claims:
- **Prose citation is untested.** Four of these sixteen are invoked by surname inside
  `rationale` strings and by no id. `data-integrity.test.ts:1466` cannot see them. That is the
  route by which a `CONTRADICTS`-grade citation reached a shipped programme.
- **`exercises.json` `evidence_refs[]` is checked for id existence but never for claim-fit.**
  `beattie_2014` on a dead hang and `sinnett_2019` on 19 drills both survive that test.
