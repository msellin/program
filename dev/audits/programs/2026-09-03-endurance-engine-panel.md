# Adversarial citation panel — engine-builder and engine-builder-block-2 (2026-09-03)

Three reviewers, each instructed to refute rather than confirm, read the same
43-citation packet covering `engine-builder` and `engine-builder-block-2`, plus
the shipped program JSON and `citations.json`.

| Reviewer | Assessed | Claim flags | Metadata flags |
|---|---|---|---|
| exercise-physiologist | 43 | 17 | 11 |
| endurance-coach | 43 | 15 | 9 |
| concurrent-training-researcher | 43 | 20 | 11 |

Distinct citations carrying at least one flag: **26 of 43**. Flagged on the claim
by all three: **12**. Flagged by some and not others: **12**. Metadata-only: **2**.

## What this is, and what it is not

These are three **AI expert personas**, not clinicians, not a literature search,
and not an independent review. None of them had journal access. Every "likely"
in their output is a reasoning-from-design judgement, not a page-checked one, and
all three said so unprompted. Four items are explicitly `needs_paper`
(`brandt_2025_hyrox`, the `konopka_2014` enzyme figures, the `butcher_2015`
significance pattern, the `astorino_2013` volume/year).

**This changes nothing user-facing on its own.** It does not move the VERIFIED
badge, and it does not alter the ladder copy, which continues to say that no
specialist has independently signed off any programme. That remains true.

A finding here is a **candidate defect**, not a verified one. The output of this
pass is a work queue and a short list to put in front of a human with a library
card and, separately, in front of a clinician.

## Calibration — do these reviewers look like they over-flagged?

Partly, yes, and it should be said before anything else is read.

The 2026-09-02 gymnastics panel flagged 30 of 41 citations **unanimously** and
exactly one of those flags survived independent checking — and even that one had
the diagnosis right and the prescription wrong (it said delete a citation that a
single HTTP request showed was real). Volume was not rigour there and is not
rigour here.

This panel is measurably more discriminating: 12 of 43 unanimous (28%) versus 30
of 41 (73%). But the same failure mode is visible in the detail. Three concrete
signals:

1. **One unanimous flag is already disclosed in the shipped data.** All three
   flagged `stoggl_sperlich_2014` for not supporting "one hard session per week".
   `engine-builder.json` → `evidence_base.engineering_choices_flagged` already
   says, verbatim: *"One hard session per week in Block 1 — Stöggl & Sperlich
   support polarised distribution but do not prescribe a single-session ceiling.
   Our engineering choice…"* The same is true of the `pilegaard_2000` intensity
   framing, the `ross_2015` week-2 introduction, the Rønnestad alternation, the
   Bishop 2019 volume percentage and the 10% mileage cap. Six of the panel's
   objections are answered by a field none of them read.
2. **Two "checkable" metadata claims do not reproduce.** The
   exercise-physiologist listed `Holloszy` as an uncited prose attribution in
   both files. "Holloszy" appears in these files only inside the author list of
   the Coyle 1984 reference. Two reviewers stated `baar_2014` has "no
   bibliographic record" — it has a complete one in `citations.json`
   (Baar K, 2014, *Sports Med* 44(S2):S117-S125). The real defect there is
   narrower: the record exists and is not in `engine-builder`'s `reference_ids`.
3. **Two flags overstate the difficulty of a fix that already exists.** The panel
   asks for `mujika_padilla_2000` to be split into two ids. `citations.json`
   already contains `mujika_padilla_2000_a` and `mujika_padilla_2000_b`, correctly
   split. And `brandt_2025_hyrox` was called unidentifiable on its byline; the
   record carries `Frontiers in Physiology 16:1519240` and a resolving Frontiers
   URL, which identifies the paper exactly.

What the panel is good at is the same thing the last one was good at: **noticing**.
It is unreliable at **deciding**. Treat every recommended action below as a
hypothesis about the fix, and check the artefact before applying it.

---

# Part 1 — Metadata. Actionable now, no journal access required

Every item in this section was re-checked against
`next-app/public/data/citations.json` and the two program JSON files while
writing this document. Each carries a verification note. This is the section to
work first; it is also the only section where the last panel produced a real
defect.

### M-1 · `bishop_2019` — title and source belong to different papers — **confirmed**

Shipped record:

```
authors: "Bishop DJ, Botella J, Granata C"
title:   "CrossTalk opposing view: exercise training volume is more important
          than training intensity to promote increases in mitochondrial content"
source:  "Physiology 34(1):56-70"
url:     .../10.1152/physiol.00038.2018
```

A CrossTalk opposing view is a *Journal of Physiology* format and runs three
pages; `Physiology 34(1):56-70` with a `10.1152/physiol` DOI is a different
journal and a 15-page review. All three reviewers flagged this and all three
asked for the two halves to be reconciled without saying which half is right.

**The author list decides it.** Bishop, Botella and Granata is the byline of the
*Physiology* review — "High-Intensity Exercise and Mitochondrial Biogenesis:
Current Controversies and Future Research Directions". So the source and URL are
correct and **the title is the wrong half**. Fix the title, not the source. This
also resolves the associated claim flag (Part 3, C-2) in the programs' favour: a
review is citable evidence in a way a debate position is not.

### M-2 · `perry_2010` — journal does not match title — **confirmed**

Title is the *J Physiol* 2010;588(23):4795-4810 mRNA-bursts paper; `source` reads
`Applied Physiology, Nutrition, and Metabolism 35(6):837-844`; the stored PMID
(20555380) is mid-2010, too early for a December issue. Three reviewers, same
finding. Needs one lookup to settle which paper was intended.

### M-3 · `ronnestad_hansen_2020` — source is a placeholder — **confirmed**

`source` is `"Journal of Science and Medicine in Sport / European Journal of
Applied Physiology"` — two journals, one slash, no volume, no pages. The PMID
resolves to a *Scand J Med Sci Sports* 2020 paper. This is the sole citation
behind Block 2's short-interval design, so it is the highest-value single lookup
in the set.

### M-4 · Year contradicts volume in three records — **confirmed**

| id | shipped | almost certainly |
|---|---|---|
| `billat_2000` | Sports Med 31(1):13-31, year 2000 | 2001 |
| `billat_2001` | Sports Med 33(6):407-426, year 2001 | 2003 |
| `bishop_2008` | Sports Med 41(9):741-756, year 2008 | 2011 |
| `astorino_2013` | JSCR 27(1):138-145, year 2013 | 2012;26(1) |

All four have `url: null`. Three reviewers independently noted the cluster: no
URL plus a year that disagrees with its own volume is the signature of a record
entered from memory. Verifiable from a volume table in minutes. The citation ids
encode the wrong years too, so fixing this touches `reference_ids` in both
programs.

### M-5 · `mujika_padilla_2000` fuses two papers, and the split already exists — **confirmed, fix is smaller than the panel thinks**

The cited record's source reads `"Sports Medicine 30(2):79-87 and 30(3):145-154"`
under one id and one URL, and `display_line` shows only Part I. But
`citations.json` already contains `mujika_padilla_2000_a` (Part I) and
`mujika_padilla_2000_b` (Part II), correctly split and currently cited by nothing.

**Action:** repoint both programs' `reference_ids` at the split records and delete
the fused one. This also isolates the Block 2 taper misattribution (Part 2, C-6)
so it can be fixed independently.

### M-6 · Near-duplicate records the panel did not find — **new, confirmed**

Not flagged by any reviewer; found while verifying their flags.

- `wilson_2012` and `wilson_loenneke_2012` are the same meta-analysis
  (JSCR 26(8):2293-2307) under two ids. The programs cite the second; the first
  has no URL and a truncated author list.
- `butcher_2015` and `butcher_2015_crossfit` are the same paper under two ids.
  The programs cite the second.

Two ids for one paper is how a `used_for` drifts out of sync with the copy that
cites it. Merge each pair.

### M-7 · `display_line` is clipped, not abbreviated — **confirmed**

Three records sit at exactly 80 characters, cut mid-word: `ronnestad_hansen_2020`
("…European Jou"), `pilegaard_2000` ("…Endocrinology and Meta"), `rohleder_vogt_2018`.
`perry_2010` is worse — it truncates at the journal name's first comma and renders
as "Perry et al. (2010), Applied Physiology", which reads on screen as a real but
different journal. These are user-visible strings. Fix the generator, not the rows.

### M-8 · Two-author papers rendered "X et al." — **confirmed, 23 records file-wide**

`Achten et al. 2003`, `Andersen et al. 1977`, `Baggish et al. 2011`,
`Buchheit et al. 2013`, `Docherty et al. 2000`, `Joyner et al. 2008`,
`Mujika et al. 2000`, `San-Millán et al. 2018`, `Stöggl et al. 2014` and 14 more
across the whole 126-entry file. A generator fix, one line, whole-catalog benefit.

### M-9 · Attributions in user-facing prose with no citation record — **confirmed, with two corrections to the panel**

Present in the files and resolving to nothing:

- **`Karvonen 1957`** — `hr_zone_methodology`, both files. It is the stated basis
  for using %HRR zone floors. No record in `citations.json`.
- **`Brooks & Mercier 1994`** — crossover concept, `engine-builder`. No record.
- **`Coggan`** — the 20-min TT protocol convention, `engine-builder-block-2`. No
  record.
- **`2025 mito+cap meta-regression PMC11787188`** — `engine-builder`
  `physiological_targets`, and the source of the "+13±3%" capillary-density
  figure. A bare PMC accession with no author, title, journal or year.

Corrections to the panel: **`Baar 2014` does have a record** — it is simply
absent from `engine-builder`'s `reference_ids`, so add the id rather than the
paper. **`Holloszy` is a false positive** — the string appears only inside the
Coyle 1984 author list. **`Nielsen 2014`** appears only inside
`engineering_choices_flagged`, where it is already labelled as directional support
for a number described as "coaching folklore"; that is a weaker problem than an
uncited claim.

None of these are caught by `data-integrity.test.ts`, because the test asserts
`references[]` ↔ `reference_ids[]` ↔ `citations.json` and prose attributions live
outside that graph. **A guard for author-year patterns in `evidence_base` prose
that do not resolve to a cited id is the durable fix**, in the same spirit as the
byline guards added after the gymnastics panel.

### M-10 · Outcome numbers contradict themselves inside each file — **new, confirmed**

Not a citation defect, but checkable in the same pass and user-visible:

| | `outcome_evidence` prose | `outcome_by_tier` |
|---|---|---|
| Block 1 Foundation | +5-8% | +3-6% |
| Block 1 Progression | +8-12% | +5-9% |
| Block 1 Push | +2-5% | +2-4% |
| Block 2 Progression | +5-10% | +6-9% |

The exercise-physiologist read only the prose and concluded the stacked promise
is +15-20% across both blocks; the tier tables actually say +5-9% then +6-9%.
Both surfaces render. Pick one set of numbers.

### M-11 · Two more internal contradictions, both one-line fixes — **confirmed**

- **RPE cap.** `engine-builder` `progression_rationale` says the strength cap
  tightens to **RPE ≤ 6** in peak-volume weeks; `concurrent_strength_prescription`
  in the same file says **RPE ≤ 7** throughout. A user gets whichever screen they
  read.
- **Threshold band.** `engine-builder-block-2` `hr_zone_methodology` defines the
  threshold zone as **88-92% HRmax**; `block_threshold_cruise` in the same file
  prescribes **90-92% HRmax**. Block 1's equivalent block is **85-90%**.

---

# Part 2 — Claim flags marked `certain` by at least one reviewer

Six items. Four of them can be settled **without any journal access**, because
they are contradictions between two statements in the same repo rather than
disagreements with a paper. Those are marked *self-checkable*. The other two need
someone to read the source.

### C-1 · `bishop_2008` — repeated-sprint literature cited for aerobic intervals — *needs the paper only to confirm which paper is meant*

Flagged by all three; `not_supported` (certain) from the exercise-physiologist.
Block 2's `session_rationale` says the repeated-sprint literature supports
short-interval work as a VO2max complement. RSA is all-out efforts under ~10 s
with incomplete recovery in team-sport athletes — a different energy system from
5×3 min and 8×2 min at ~VO2max. Compounded by M-4: the year is wrong, so it is
not certain which review is intended.

**Recommended:** drop it and lean on `buchheit_laursen_2013` or
`ronnestad_hansen_2020`, both already cited in the same block. Low risk — nothing
else in the block depends on it.

### C-2 · `ronnestad_hansen_2020` — the two blocks draw opposite conclusions — *self-checkable*

`engine-builder` states the finding correctly ("short intervals were SUPERIOR to
long intervals") and then gives it as the reason to **keep 4×4**, the long format.
`engine-builder-block-2`'s `block_threshold_cruise` states the opposite finding
("long intervals produce comparable adaptation with less monotony"), while
`block_short_intervals` in the same file states it correctly. One paper, three
uses, two of them wrong, and they disagree with each other.

No library needed to see this. Note also the cohort is well-trained cyclists,
where Block 1 users are aerobically untrained.

### C-3 · `little_2010` — cited for the inference its own result argues against — *self-checkable*

All three. `progression_rationale` gives it as a reason weeks 1-2 are pure Z1,
because "hard intervals on a missing base generate fatigue signals without
adaptation payoff". Little's subjects had no base and adapted, from six HIIT
sessions, in two weeks. The stated fact (signal detectable within ~2 weeks) is
accurate; the programming inference runs opposite to the study.

The Z1-first decision may well be right on recoverability and tissue-tolerance
grounds. It needs a different justification, or an
`engineering_choices_flagged` entry.

### C-4 · `perry_2010` — same inversion, same sentence — *self-checkable*

Perry's protocol was HIIT. "mRNA bursts precede protein accumulation" is a
time-course, not a sequencing rule, and the intervention was the thing being
deferred. `progression_rationale`'s "protein bursts precede functional enzyme
upregulation by 5-10 sessions" is additionally not a finding of that paper.

### C-5 · `fyfe_2016` — a null read as an affirmative — *self-checkable from the title*

The paper's own title states the null: endurance training **intensity does not
mediate** interference. The design work-matched HIIT against MICT, holding total
work constant. Both programs read it as "endurance **volume** (not intensity)
drives interference" — volume was never manipulated, so the affirmative half is
unsupported.

This is load-bearing: it is the stated reason the strength cap tightens in the
peak-volume weeks of both blocks. **Re-attribute the volume half to
`wilson_loenneke_2012`**, which meta-regressed frequency and duration. The
prescription does not need to change; the citation does. But see C-12 — the same
program cites Wilson for an intensity effect elsewhere, so fix both together.

### C-6 · `mujika_padilla_2000` — the taper is cited to the detraining reviews — *self-checkable from the record's own title*

Two reviewers `certain`, one `partly`. The record's title is "**Detraining**: loss
of training-induced physiological and performance adaptations. Part I & II".
Block 1's use (maintenance dose, intensity preserved at reduced frequency) is
appropriate. Block 2 hangs its weeks 9-10 taper on it — "intensity preserved,
volume down 40-60%, session count −1" — which is taper prescription from a
different literature (Mujika & Padilla 2003 in MSSE; Bosquet 2007 meta).

**Swap the citation, not the taper.** The taper design is conventional and fine.
Pairs with M-5.

---

# Part 3 — Flagged on the claim by all three reviewers

Six not already covered above. Consensus among personas from one model is a
signal that a problem is *legible*, not that it is *real* — the gymnastics panel
made that lesson expensive. Ordered by how cheaply each can be settled.

### C-7 · `konopka_2014` — the enzyme figures look an order of magnitude wrong — **needs a muscle physiologist with the results table**

`physiological_targets` attributes β-HAD +397-435% and CS +65-102% to 12 weeks of
aerobic training. The canonical human response over 8-12 weeks is roughly
+20-60%. All three reviewers said the numbers read like a different measurement,
a fold-change reported differently, or a misread column. The same file elsewhere
converts them into "+40-100%" for users, which contradicts its own figure.

Cohort was older adults, 12 weeks; Block 1 keeps that caveat, Block 2 drops it.
**Do not ship the numbers to users until someone reads the table.** This is the
top of the librarian queue alongside C-12/`brandt`.

### C-8 · `bishop_2019` — a debate position used as settled evidence — **resolved by M-1**

All three objected that a CrossTalk "opposing view" is commissioned advocacy
printed alongside its rebuttal, and cannot anchor Block 2's rising Z1 volume floor.
If M-1's reading is right — the byline says the source is the *Physiology* review,
not the CrossTalk — this objection evaporates with the title fix. **Fix the
metadata first, then re-ask the claim question.**

### C-9 · `ross_2015` — right numbers, wrong population, used to push dose up

Cohort: abdominally obese, previously sedentary adults, 24 weeks; the 0%
non-response cell was high **amount** plus high intensity. Block 2 uses it to
justify a third weekly hard session for already-trained users, which conflates
amount with intensity and imports non-response prevalence across a large cohort
gap. The derived line "non-response is usually under-dosing, not genotype" is a
causal generalisation the trial does not establish, and sits one sentence after
the HERITAGE heritability finding it contradicts.

The error direction is **toward over-dosing**, which is why this ranks above the
other population-mismatch flags.

### C-10 · `stoggl_sperlich_2014` — already disclosed for Block 1, live for Block 2

For Block 1 this is answered in `engineering_choices_flagged` (see the calibration
note). For Block 2 it is not, and there the objection is sharper: Block 2's own
status note describes the design as "threshold-dominant middle intensity", which
is the arm this study found least effective. **The citation points against the
design it is attached to.** Either add the equivalent engineering-choice
disclosure, or stop citing Stöggl in Block 2.

### C-11 · `butcher_2015_crossfit` — a causal claim from n=14 correlations — **partly needs the paper**

Cross-sectional, 14 subjects, correlations only. "An aerobic base protects your
CrossFit performance" is causal and prospective; the design is neither. Two
reviewers additionally recall that VO2peak was **not** a significant predictor of
Fran or Grace in that dataset, with the CrossFit Total and anaerobic measures
carrying the variance — which would make "VO2max still contributes" a reversal,
not an overstatement. That half needs the correlation table. The causal leap does
not.

### C-12 · `brandt_2025_hyrox` — one 2025 paper carrying a whole population's programming priority — **first item for a reviewer with journal access**

Structural objection, independent of what the paper says: a cross-sectional
determinants study cannot license "prioritise aerobic development over strength
during Block 1", and "grip strength and muscle mass are not reliable predictors"
in a homogeneous already-strong field is restriction of range, not evidence that
strength training does not help.

Correcting the panel: the byline is thin (`"Brandt K, et al."` where every other
multi-author entry names three), but the record resolves — *Frontiers in
Physiology* 16:1519240, with a working URL. It is identifiable. Fix the byline;
read the paper before touching the claim.

### C-13 · `rogers_2021_dfa` — "validated" overstates a single method paper

All three. `hr_zone_methodology` says DFA-a1 = 0.75 is "validated in elite and
recreational populations" and offers it as the **preferred** VT1 anchor for
chest-strap owners. One small validation study cannot carry both populations, and
DFA-a1 is documented as sensitive to RR artefact-correction method, recording
device and day-to-day autonomic state. Reviewers converge on the same fix:
**demote to an optional cross-check**, below the repeatable fixed-pace submax HR
the program already collects at intake and retests four-weekly.

---

# Part 4 — Contested. Open questions, not resolved by majority

Three personas drawn from one model share blind spots, so disagreement carries
more information than agreement does. Each of these is presented with the
reasoning on both sides and **no recommended action**.

**`joyner_coyle_2008`** (2 of 3). Both flaggers say the VO2max-plateaus pattern is
described for elite champions and is being applied to a recreational user eight
weeks past a base block. The sharper version: the same file cites the plateau and
then promises +6-9% VO2max in `outcome_by_tier`. The third reviewer did not flag
it. Open question: is the metric choice (threshold over VO2max as Block 2's
headline) defensible on measurement grounds — threshold is easier to test at home
— independently of the plateau rationale?

**`astorino_2013`** (2 of 3). Both flaggers say it is not a dose-response design
and cannot support "HIIT dose-response for VO2max"; one goes further and recalls
that VO2max did **not** change significantly in that trial, the notable result
being muscular force — which would make it evidence against the claim.
`outcome_evidence` currently lists it as "direct RCT precedent for a
Block-2-shaped protocol", which a 2-3 week single-dose HIIT study is not. Needs
the paper to settle the direction. Interacts with M-4 (wrong year/volume).

**`san_millan_brooks_2018`** (2 of 3). Cross-sectional comparison of lactate and
substrate oxidation between professional cyclists and less-fit individuals. Both
flaggers say it did not measure fibre-type recruitment, so "recruits Type I fibres
preferentially via the lactate-clamp methodology" attributes a measurement the
study did not make, and descriptive data cannot anchor a Z1 dose. Open question:
is the Zone-2 lactate-clamp framing a finding of this paper or San-Millán's
coaching practice popularised around it?

**`pilegaard_2000`** (1 of 3, plus a metadata dispute). The concurrent researcher
notes the paper's own title says **high-intensity** training while
`physiological_targets` attributes MCT1 upregulation to endurance training, and
the protocol was a one-legged knee-extensor model. The endurance coach instead
argued the record points at the wrong year entirely (1999;276(2) rather than
2000;278(4)) — but the shipped record's source, URL and DOI are internally
consistent on 278(4), so that half looks like the reviewer misremembering. Two
different objections to one record, only one of which can be checked cheaply.

**`wisloff_2007`** (1 of 3). Block 1 carries the heart-failure population caveat;
Block 2 drops it and lists "+35% LV EF in HF patients" as an anchor for continued
stroke-volume adaptation in healthy trained users. Ejection-fraction recovery from
a depressed baseline is disease reversal and has no analogue in a trained heart.
The flagger suggests Helgerud's +10% SV is the only appropriate anchor there. The
other two did not raise it.

**`faude_2009`** (1 of 3). The review's conclusion is that lactate-threshold
concepts disagree substantially with each other and with MLSS, and is cautious
about single-test estimates. Using it to anchor a headline metric measured by a
self-administered 20-min TT is close to inverting it. Counter-reading: it does
support that a threshold exists and is trainable, which may be all the citation is
doing.

**`achten_jeukendrup_2003`** (1 of 3). Fatmax at ~63% VO2max is reported
correctly, but ~63% VO2max sits near 73-78% HRmax while `block_z1_steady` is
written at 60-70% HRmax, which is roughly 45-58% VO2max — below the fat-oxidation
peak the program cites as its target. Either the zone or the citation has to move.
The other two reviewers accepted the zone. **This is the highest-consequence
contested item**: it sets what six of eight weeks feel like.

**`eddens_2018`** (1 of 3). Drives a real user-facing rule ("if same day is
unavoidable, lift first"). The flagger recalls the meta-analysis found intra-session
sequence did **not** meaningfully change strength outcomes, and separately notes
that "+6.91%, p=0.006" is a raw percentage with a p-value where a systematic review
of this type reports standardised mean differences — as the packet's own
`schumann_2022` entry correctly does. Needs the pooled estimate and its direction.

**`docherty_sporer_2000`** (1 of 3). A proposed conceptual model — no data, no
sequencing test, no recovery interval. It is currently made to co-support the
same-day sequencing rule and the "6+ h separation" number, which exists only in
Robineau. Using a model paper as a second, independent-looking source inflates the
apparent evidence base.

**`robineau_2016`** (1 of 3). Three discrete arms (0 h / 6 h / 24 h), n≈8 per
group, 7 weeks. Supports "do not stack them back to back". It is not a
dose-response, so 6 h is not established as a threshold, and
`adaptive_engine_hooks` has turned it into an automatic scheduling proposal that
fires whenever two sessions land within 6 h — a firmer rule than n≈8 across three
arms can carry.

**`wilson_loenneke_2012`** (1 of 3). Wilson established frequency, duration and
modality effects, not an intensity effect — while `fyfe_2016` is cited a few lines
away for the proposition that intensity does *not* mediate interference. The two
citations are asserted to support opposite things in the same file. Separately, on
the headline question Wilson is superseded by `schumann_2022` (also cited here),
which found no significant interference for maximal strength or hypertrophy;
presenting both as agreeing evidence overstates the case for the RPE and
session-count caps.

**Process observation worth more than any single flag.** The concurrent researcher
pointed out that several disagreements are not with a paper at all but between two
citations in the same file: Fyfe vs Wilson on intensity, Ross vs HERITAGE on
non-response, Stöggl vs Block 2's own threshold-dominant design, and Rønnestad read
in opposite directions by the two blocks. **All four are detectable with no journal
access.** A consistency pass over `evidence_base` prose would catch that whole
class before a reviewer's time is spent on it, and is a better use of the next
hour than any lookup in this document.

---

# Part 5 — Prescription and screening. Out of scope, volunteered, and mostly a clinician's call

The panel was asked about citations and returned 16 prescription concerns and 24
screening gaps. Recorded here without action, with the structural facts verified.

**Verified from the shipped JSON:**

- `engine-builder-block-2` `safety_gates` contains four gates
  (`block_1_completed`, `hypertension_unmanaged`, `exertional_syncope_history`,
  `post_covid_hr_elevated`). `engine-builder` contains five — the extra two being
  `pregnancy_first_trimester` and `flaring_joint_tendon`. **Block 2 screens for
  less than Block 1 while prescribing more, and can be entered directly by
  self-declaring `no_but_equivalent`.** All three reviewers found this
  independently. It is a data fact, not a judgement.
- `hypertension_unmanaged` offers `no` / `unsure` / `yes`; the gate's
  `unsafe_values` is `["yes"]`. A user who has just said they do not know whether
  their blood pressure is controlled passes into 4×4 intervals.
- The `pregnancy_first_trimester` gate blocks the first trimester only. All three
  reviewers argue the stated rationale — HR zones are unreliable in pregnancy —
  applies more strongly later, not less.
- Block 2 foundation tier condition is
  `block_1_completed == 'yes_lapsed' || block_1_completed == 'no_but_equivalent' && current_cardio_hours_per_week < 4`.
  `intake-tier.ts` parses `&&` tighter than `||`, so this reads
  `yes_lapsed || (no_but_equivalent && hours < 4)`. A `no_but_equivalent` user with
  ≥4 h/week therefore matches **no tier** and lands on the `"No tier matched —
  defaulted to lowest"` fallback. Conservative direction, so low severity — but the
  condition does not mean what it looks like it means. Parenthesise it.

**The one thing all three converged on that is not a clinical judgement:** every
zone, the daily readiness gate, both retest metrics and the DFA-a1 option are
heart-rate-derived, and neither intake asks about heart-rate-modifying medication
or rhythm devices. Beta-blockers, rate-limiting calcium channel blockers,
ivabradine, a pacemaker or permanent AF each independently invalidate the HUNT
formula, the %HRR floors, the ≥90% HRmax target, the "failed to reach 90% twice"
non-response classifier and the morning resting-HR gate — **simultaneously, and
silently**. This is a validity failure before it is a safety one: the program does
not degrade, it mis-prescribes with full confidence. That framing is within the
panel's competence and is worth putting in front of a clinician as the first
question.

Everything else in the screening list — cardiac thresholds, what counts as adequate
post-myocarditis clearance, pregnancy staging, RED-S and energy-availability
criteria, insulin-treated diabetes — was explicitly disclaimed by all three
reviewers as a physician's call. **Do not ship refusal criteria written by this
panel.** The list is a set of questions for a clinician, not a specification.

---

# Part 6 — Weak findings, stated as weak

Recorded so they are not mistaken later for consensus, and so the panel's error
rate stays visible.

- **`Holloszy` as an uncited attribution — wrong.** The string appears only inside
  the Coyle 1984 author list. No action.
- **`baar_2014` "has no bibliographic record" — wrong.** The record is complete.
  The real, much smaller defect is that it is missing from `engine-builder`'s
  `reference_ids`.
- **`brandt_2025_hyrox` "cannot be located from the record" — overstated.** Thin
  byline, yes; unidentifiable, no. Journal, volume, article number and a working
  URL are all present.
- **`mujika_padilla_2000` "split into two ids" — already done.** The split records
  exist and are uncited. The work is repointing, not authoring.
- **Six unanimous or near-unanimous objections are already disclosed** in
  `engineering_choices_flagged` (Stöggl session ceiling, Pilegaard intensity
  framing, Ross week-2 introduction, Rønnestad weekly alternation, Bishop 2019
  volume percentage, the 10% mileage cap). The panel read the citations and the
  prose but not the field where the authors had already conceded the point. That
  is a prompt defect on our side as much as a reviewer defect on theirs — **next
  panel gets `engineering_choices_flagged` in the packet.**
- **`pilegaard_2000` year dispute — likely a reviewer misremembering.** Source,
  URL and DOI agree internally on 2000;278(4). The separate objection about the
  paper's high-intensity title versus its endurance-training attribution stands and
  is cheap to check.
- **`rogers_2021_dfa` year/volume.** Nobody flagged it, and it looks fine on
  inspection — *Front Physiol* 11:596567 with a `fphys.2020` DOI and a 2021
  publication date is normal for that journal's volume boundary. Noted so a future
  pass does not re-open it as an M-4-shaped defect.
- **The `astorino_2013` and `butcher_2015` "the result was actually null" claims
  are recollections, not readings.** Both reviewers said so. They are the two
  places in this document where acting on the panel's word could delete a correct
  citation — exactly the mistake the gymnastics panel's remove-the-real-paper
  recommendation would have caused.

---

## Work queue

**Now, no journal access** — M-1 (title), M-5 + M-6 (id hygiene), M-7 + M-8
(generator), M-9 (prose attributions + a guard test), M-10, M-11, the Part 5
parenthesisation, and the four internal-contradiction claim flags C-2, C-3, C-4,
C-5/C-6.

**Human with a library card, in this order** — `brandt_2025_hyrox` (C-12),
`konopka_2014` figures (C-7), `ronnestad_hansen_2020` (M-3), `perry_2010` (M-2),
the four year/volume records (M-4), then `astorino_2013` and `butcher_2015`
significance patterns.

**Clinician** — the HR-medication and rhythm question first, then the Block 1 /
Block 2 gate asymmetry, then everything else in Part 5. Nothing from this panel
ships as a refusal criterion without that sign-off.


---

# Orchestrator verification (2026-09-03)

Nothing below was actioned on the panel's word. Every claim that could be
checked against the shipped data was checked.

## Verified and fixed

- **8 dangling `evidence_refs` across 18 drills.** `exercises.json` pointed at
  citation ids that do not exist. Three were id drift (`ludewig_2000` for
  `ludewig_cook_2000`, `ludewig_2009` for `ludewig_reynolds_2009`,
  `ronnestad_2020` for `ronnestad_hansen_2020`) and were repaired; five named
  sources never added to `citations.json` at all — two of them books rather than
  papers — and those pointers were removed, since a pointer that resolves to
  nothing is not evidence. Harmless while unrendered (nothing in `src/` reads
  `evidence_refs`), and a landmine the moment anyone builds the obvious feature
  on top of it.
- **7 citation URLs were PubMed search queries, not articles.** A link telling
  the reader to go and find the paper is not a citation to it. Removed.
- **46 display strings across 24 two-author papers rendered "A et al."** where
  convention is "A & B" — Achten & Jeukendrup shown as "Achten et al.".
  Corrected.

All three are now guarded in `data-integrity.test.ts` and mutation-tested.

## Checked and NOT true

- **"Duplicate `wilson_2012` / `butcher_2015` records."** There are no duplicate
  ids in `citations.json`.
- **"30 of the 51 citations have `url: null`."** Four of 126 do.

## Not actioned

Every claim-level flag — whether a paper's population transfers, whether an
effect size is read correctly. Those need the papers, and this panel is not a
source of evidence about them. They are a queue for a human reviewer, which is
what the reviewer packets exist for.

The pattern across all four domains is consistent: **these panels are good at
noticing metadata and structure, and unreliable at deciding what a paper says.**
Every finding that has survived independent checking, across two runs, has been
of the first kind.
