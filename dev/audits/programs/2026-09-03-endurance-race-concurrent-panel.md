# Adversarial citation panel — `rowing-2k-test-prep` and `concurrent-strength-maintenance` (2026-09-03)

Three reviewers, each instructed to refute rather than confirm, read the same
51-citation packet (rowing 29 refs, CSM 32, union 51 after overlap), plus both
shipped program JSONs and `citations.json`.

| Reviewer | Assessed | Claim flags | Metadata flags |
|---|---|---|---|
| rowing-coach | 51 | 11 | 9 |
| strength-conditioning-coach | 51 | 19 | 10 |
| exercise-physiologist | 51 | 19 | 14 |

Flagged on the claim by **all three: 5**. Metadata flagged by all three: 5, by
two: 7.

## What this is, and what it is not

These are three **AI expert personas**. Not an outside clinician, not a
physiotherapist, not a literature search, not an independent review. None had
database access. Every reviewer wrote an explicit out-of-domain statement and
those are reproduced at the end of this document — read them before treating any
section as cleared.

**Nothing here moves the VERIFIED badge and nothing here changes the ladder
copy.** The ladder continues to say no specialist has independently signed off
any programme, and that remains true. Both programmes ship
`status: REVIEWED`, `reviewed_by.name = "Terav specialist audit agent"`,
`reviewed_at: 2026-08-19` — and rowing's own `status_note` still says three
rowing studies are "flagged for pre-launch URL verification". They still are.

A finding here is a **candidate defect**, not a verified one. The output is a
work queue and a short list to put in front of a human.

## Did this panel over-flag?

The prior panel (2026-09-02, gymnastics) flagged **30 of 41 citations
unanimously**, and on independent verification exactly one finding survived — a
metadata defect — and even there the panel's recommended action (delete the
citation) would have destroyed a real and relevant paper. That is the base rate
this document has to beat.

This panel is meaningfully better behaved, and the shape of the output says so:

- **Unanimity collapsed from 73% to 10%.** Five citations of 51 drew all three.
  Correlated over-refutation would have produced another 30-of-41.
- **All three volunteered clean verdicts** on specific citations, unprompted:
  `eddens_2018`'s +6.91% figure ("I went in expecting to flag it"),
  `helgerud_2007`'s +7.2%, `schumann_2022`'s SMDs, `jager_2017`,
  `bouchard_1999_heritage`, `andersen_henriksson_1977`, `murach_bagley_2016`,
  `fyfe_bishop_stepto_2014`, and both programmes'
  `engineering_choices_flagged` sections. A panel that only flags is not
  discriminating.
- **Every metadata flag I checked was true.** See Part 1 — I verified all
  fifteen against `citations.json` before writing them down. That is a
  qualitative difference from the last panel, where the single surviving finding
  was also a metadata one. Metadata is what this method is actually good at.

Where it still over-flags, and this needs saying plainly:

- **The 19-flag lists are inflated by verdict granularity.** A large share of
  the strength-coach's and physiologist's flags are `partly` verdicts that
  amount to "narrow the `used_for` string" — editorial, not defects. Counting
  those alongside `astorino_2013` (where the paper measured no threshold at all)
  presents volume as rigour. Read the verdict, not the count.
- **Several flags are population-transfer arguments, not readings of a paper.**
  The strength coach says so himself: "several of my flags on the rowing side
  rest on reasoning about study populations rather than a re-read of the papers".
  Population transfer is a legitimate coaching objection and an illegitimate
  citation objection, and this document keeps them apart.
- **`bosquet_2007` shows the failure mode inside a single row.** Two reviewers
  marked it `certain`/`likely` that the pooled effect is ~2%; the third marked
  the same claim `needs_paper` and said his ~2% recollection was exactly that, a
  recollection. Two confident personas and one honest one, over one number that
  none of them read. Treat the confident pair as no stronger than the cautious
  one.

## Blast radius, before you fix anything

These two programmes do not own their citations. `citations.json` is shared:

| Citation | Also cited by |
|---|---|
| `ross_2015` | engine-builder, **engine-builder-block-2**, CSM, rowing |
| `wisloff_2007` | engine-builder, engine-builder-block-2, CSM, rowing |
| `astorino_2013` | engine-builder-block-2, rowing |
| `helgerud_2007`, `seiler_2010`, `eddens_2018`, `fyfe_2016` | engine-builder, engine-builder-block-2, + these two |
| `billat_2000/2001`, `bishop_2008`, `faude_2009`, `joyner_coyle_2008` | engine-builder-block-2, rowing |
| `proteau_1992` | first-strict-pullup, muscle-up, handstand-walk, rowing |

**`engine-builder-block-2` was badged VERIFIED yesterday**, and the
2026-09-02 citation-dimension pass praised its evidence base by name:
"Ross's non-response falling to 0% at 75%" was listed as an example of a number
"matched to what the paper actually reports". This panel says that specific
reading conflates a 50% reduction in the *rate* of non-response with an exercise
intensity of 50%. Both cannot be right. That is the single most important
disagreement in this document and it is decidable in ten minutes by anyone with
the Mayo Clin Proc paper.

Every metadata fix below lands in a shared file and must be swept across all
programmes citing it, then `cd next-app && npm run verify`.

---

# Part 1 — Metadata. Actionable now, all verified against the shipped file

These need no papers and no specialist. I checked each against
`next-app/public/data/citations.json` while writing this; the "verified" column
means I confirmed the record says what the reviewer said it says, not that I
confirmed the correct value. Correct values still need one lookup each.

### 1A · Year/volume disagreements — 4 records, one shared cause

| id | shipped | reviewers say | verified in file |
|---|---|---|---|
| `astorino_2013` | 2013, JSCR 27(1):138-145 | 2012, JSCR 26(1):138-145 | yes — all 3 flagged |
| `billat_2000` | 2000, Sports Med 31(1):13-31 | vol 31 is 2001 | yes — all 3 |
| `billat_2001` | 2001, Sports Med 33(6):407-426 | vol 33 is 2003 | yes — all 3 |
| `bishop_2008` | 2008, Sports Med 41(9):741-756 | vol 41 is 2011 | yes — all 3 |

In every case the page range is right and the volume is right; the *year* is the
field that drifted, and in every case the year is also baked into the citation
id. The rowing coach's read is that the ids were minted before the metadata was
checked and are now a source of error in their own right — a plausible mechanism
for four records failing the same way.

→ **Action: sweep every record in `citations.json` for year-vs-volume
consistency, not these four. Then decide whether the id year is worth keeping at
all, given that renaming an id is a cross-programme edit.** `doma_2019` (below)
is a fifth instance and was surfaced by two reviewers independently.

### 1B · Records spliced from two different papers — 2, high confidence

**`midgley_2007`** (2 reviewers) — shipped as
`Midgley AW, McNaughton LR, Wilkinson M` / *"Is there an optimal training
intensity for enhancing the maximal oxygen uptake of distance runners?"* /
`Sports Med 37(10):857-880`. The title and author list belong to Sports Med
2006;36(2):117-132. The year, volume and pages belong to a different Midgley
paper (*Training to enhance the physiological determinants of long-distance
running performance*, McNaughton & Jones). The display line points the reader at
the wrong article.
→ **Action: pick one paper. The claim attached ("intensity distribution meta for
endurance") matches neither well — see Part 2.**

**`ross_2015`** (2 reviewers) — shipped as
`Ross R, Goodpaster BH, Koch LG, et al.` The Mayo Clin Proc 2015;90(11):1506-1514
trial is Ross R, de Lannoy L, Stotz PJ — three authors, no "et al.". Goodpaster
and Koch are co-authors on Ross's later precision-exercise-medicine work.
Journal, year, volume and pages are correct; the byline is not. This record
*does* have a resolving PubMed URL (26586576), so the byline can be checked in
one click.
→ **Action: fix the byline. Cheapest fix in the document, and it touches four
programmes.**

### 1C · `proteau_1992` — a record that does not match any paper I can place

Shipped: `Proteau L, Marteniuk RG, Lévesque L` (1992), *"Specificity of practice:
the case of the goal-directed aiming task"*, `Journal of Motor Behavior
24(1):81-104`, no URL.

All three reviewers went to the same known paper by those three authors:
*A sensorimotor basis for motor learning: evidence indicating specificity of
practice*, Q J Exp Psychol A 44(3):557-575. Two of them noted the packet records
this entry's title and source as "corrected 2026-08-18" — and that the
correction appears to have moved it **away** from the real record.

This one matters beyond these two programmes: `proteau_1992` is cited by
`first-strict-pullup`, `muscle-up` and `handstand-walk`, and the gymnastics panel
raised it too.
→ **Action: resolve to a DOI, not to another correction from memory. If the
paper cannot be pinned, drop it — see Part 3 for why the claim it carries is
weak anyway.**

### 1D · URLs — the debt is five times larger than the `status_note` admits

Four records carry search stubs rather than record links, exactly as flagged:

- `kilding_2012` → `pubmed.ncbi.nlm.nih.gov/?term=Kilding+Winter+...`
- `steinacker_1993` → `?term=Steinacker+physiological+aspects+training+rowing+1993`
- `mikulic_2011` → `?term=Mikulic+maturation+elite+rowing+crew+2011`
- `hagerman_1994` → `scholar.google.com/scholar?q=Hagerman+physiology+of+competitive+rowing...`

These are the three the rowing programme's `status_note` promised to verify
before launch, plus a fourth. They render to users as citation links.

**But the larger number, which no reviewer had the file access to see: 30 of the
51 citations in these two programmes have `url: null` entirely.** Including
`astorino_2013`, `midgley_2007`, `proteau_1992`, `doma_2019`, `billat_2000/2001`,
`bishop_2008`, `faude_2009`, `wilson_2012` — i.e. most of the records this panel
disputes are also the records nobody can click through to check. A search stub is
at least visible as a defect; a null URL is silent.

→ **Action: this is the highest-value item in Part 1. Resolve DOIs for the 30,
starting with the ~15 whose claims are contested below, and add a
`data-integrity` assertion that a citation URL must not be a search query
(`?term=`, `scholar.google.com/scholar?q=`).** `hagerman_1994` is also a book
chapter, not a paper — cite editors and page range, and stop counting it under
"peer-reviewed".

### 1E · `display_short` / `display_line` render two-author papers as "et al."

Confirmed in the file: `Joyner et al. 2008` (Joyner & Coyle), `Mujika et al.
2000` (Mujika & Padilla, both parts), `Buchheit et al. 2013` (both parts),
`Andersen et al. 1977` (Andersen & Henriksson). Same for
`aragon_schoenfeld_2013`, `coffey_hawley_2007`, `laursen_jenkins_2002`,
`murach_bagley_2016`, `san_millan_brooks_2018`. Conversely `proteau_1992` —
three authors — renders as `Proteau 1992` with no "et al." and `billat_2000` /
`bishop_2008` are correct. The generator is keying off something other than
author count.
→ **Action: fix the generator, regenerate, add a test. Two-author records render
"X and Y".**

### 1F · Part I / Part II pairs are indistinguishable in the UI

`mujika_padilla_2000_a` and `_b` both carry `display_short: "Mujika et al. 2000"`,
and their titles are truncated at "Part I" / "Part II" — the distinguishing
subtitles (*Short-term insufficient training stimulus* / *Long-term insufficient
training stimulus*) are not in the record at all. Same for
`buchheit_laursen_2013_a`/`_b`.

The physiologist's inference is worth quoting because it connects a metadata
defect to a claim defect: *"which is plausibly how a detraining review came to be
cited for a taper effect"*. See Part 2.
→ **Action: restore the subtitles, put the part number in `display_short`.**

### 1G · "N primary citations" is the wrong phrase

Both `status_note`s say "primary citations" (rowing: "28", though the file
carries 29 references; CSM: "32", which matches). A large share of both bases are
narrative reviews, position stands, systematic reviews and one book chapter.

The physiologist's point is that this framing is *causal*, not cosmetic: calling
a review a primary citation is what lets a review be credited with a trial's
result. `feito_2018` and `meyer_morrison_zuniga_2017` are both cited for specific
training outcomes they did not produce (Part 4).
→ **Action: say "references", fix the off-by-one, and add a `type` field
(trial / review / position stand / chapter / case study) so a reader can tell
`mikulic_2011` (n=1 crew case study) from a randomised trial.**

---

# Part 2 — Claim flags marked `certain` by at least one reviewer

Ordered by how much of the user-facing product rests on them.

### 2.1 · `astorino_2013` — `not_supported`, certain (all three)

The load-bearing citation for **"threshold pace shifted 3-6%"**, which appears in
the Foundation and Progression `typical_outcome` strings, the phase-2 goal, the
`threshold_dominant_middle` principle text, and the
`threshold_pace_500m_seconds` retest targets.

The reviewers converge on three separate failures, in increasing severity:

1. Population — recreationally active men and women, not "trained cyclists".
2. Duration — roughly 6 sessions over 2-3 weeks, not 4-8 weeks.
3. **Outcome — no lactate or ventilatory threshold was measured at all.** The
   title names cardiovascular function, VO2max and muscular force.

The programme honestly flags the cycling-to-rowing extrapolation. Both other
reviewers make the same observation independently: the flagged extrapolation is
the *fourth* problem, and the three underneath it are the ones that break the
chain.

→ **This is the highest-consequence citation finding in the document, and it is
also in `engine-builder-block-2`.** Two of three reviewers are `certain`; the
third is `likely` on recollection. Verify the paper first (its year is wrong too,
so start there), then either re-anchor "3-6%" to threshold-training literature in
a comparable population or delete the number from user-facing copy. Do not
rewrite the `used_for` and leave the number.

### 2.2 · `bosquet_2007` — `partly`, certain (all three, with one dissent on method)

The taper **structure** is used correctly and all three say so: ~2 weeks, volume
down 41-60%, intensity and frequency held, and the programme's
`duration_multiplier` of 0.55 sits properly inside that band.

The **number** is disputed: pooled improvement ~1.96% (CI roughly 0.8-3.1), so
"~3%" is the top of the interval quoted as the expectation. The rowing coach adds
the commercial arithmetic: at an 8:00 2K, 2% is ~9.6 s and 3% is ~14.4 s, against
a headline that sells −15 s. The strength coach adds that the programme calls
Bosquet "the stronger single-source anchor for the ~3% claim" when Bosquet is the
source giving the *smaller* estimate.

**But the physiologist marked this `needs_paper` and said so explicitly.** Two
personas confident, one honest, none of them holding the meta-analysis.
→ **Action: needs the paper. Then quote ~2% with 3% as the good-case end.**

### 2.3 · `faude_2009` — `not_supported`, certain (2 of 3), and checkable without the paper

Cited for "threshold definitions — informs `retest_metric.source_ref`". I
confirmed the metric it informs:

```
threshold_pace_500m_seconds
  source_ref: "runs[].avg_pace_500m_seconds where activity_type == 'row'"
  aggregation: trend_slope, window_days: 21
```

No intensity filter, no distance filter, no `session_type` filter. Z2 rows,
technique sessions, threshold pieces and race-pace pieces all write into the same
field. A paper about threshold *determination protocols* cannot license calling
an unfiltered session average "threshold pace".

→ **Action: this is a code/data fix, not a citation fix — see Part 5.1. The
citation becomes defensible the moment the metric implements a real threshold
piece.**

### 2.4 · `helgerud_2007` — `partly`, certain (2 of 3). The +7.2% is read correctly

Nobody disputes the finding. Two distinct misuses:

- **In rowing:** cited as supporting "the 4x4 protocol". Confirmed in the file —
  rowing prescribes no 4x4. Its hard sessions are `block_threshold_row`
  (4×8 min) and `block_race_pace_row` (6×500 m).
- **In CSM:** phase 2's rationale says the Helgerud dose "is fully compatible
  with maintenance strength if the 6h separation rule holds". Helgerud had no
  resistance arm and no strength outcome; compatibility with maintenance strength
  is not a Helgerud finding. That claim needs Schumann 2022 / Fyfe.
- **And the dose is not delivered.** Helgerud ran 4×4 three times a week for
  8 weeks. `block_4x4_row` is `1×/wk`, and phase 1 excludes it entirely, so
  weeks 3-6 minus the week-4 deload is **three interval sessions in the whole
  block**. The tier outcomes (−8 to −15 bpm) are calibrated on a dose that is not
  in the plan. CSM self-flags the 1×-vs-3× choice in
  `engineering_choices_flagged` and did not adjust the outcome claims to match.

→ **Action: two `used_for` rewrites, and a decision on the tier numbers. The
outcome claims are the user-facing half.**

### 2.5 · `seiler_2010` — `partly`, certain (2 of 3)

The polarised model is ~80% below LT1 and ~20% **above** LT2, with deliberately
little work *at* threshold — the sparse middle is the model's whole content.
Rowing's `polarised_race_prep` principle puts its entire hard 20% into threshold
plus race pace, and phase 2 is named `threshold_dominant_middle`. That is a
pyramidal/threshold distribution, which is the thing Seiler contrasts himself
with.

Separately, the delivered week is Z2 / technique / threshold / Z2 / easy / race
pace — two of six hard, ~33% by session count, against a principle text claiming
80/20.

The disclosed "race-prep adaptation" note covers where the 20% is spent. It does
not cover the distribution being a different distribution.
→ **Action: restate the principle honestly for a race-prep block, or move a hard
session. Do not leave the principle id, the rule text and the claim all asserting
Seiler's distribution is being followed.**

### 2.6 · `mujika_padilla_2000_b` — `not_supported` / `partly`, certain (2 of 3)

Both 2000 Sports Med papers are **detraining** reviews; their own titles say so.
Part II is *Long-term insufficient training stimulus*. The claim hung on it —
"~3% performance uplift from volume down 40-60%" — belongs to the taper
literature (Mujika & Padilla MSSE 2003; Bosquet 2007). The rowing programme's
phase-3 rationale states this misattribution to the user in prose.

The strength coach is fair to it: Part II does review reduced-training
maintenance, so it is adjacent. It just does not supply the number or the
prescription attributed to it.

The same reviewer flagged Part I (`_a`) as `partly` for the same reason with less
force: detraining kinetics tell you what you lose from an insufficient stimulus,
not how deep to taper.
→ **Action: add Mujika & Padilla 2003 and re-point the claim. See 1F — the two
parts are currently indistinguishable in the UI, which is the likeliest
mechanism.**

### 2.7 · `doma_2019` — `not_supported`, certain (2 of 3), and directionally inverted

The title is *Implications of impaired **endurance** performance following single
bouts of **resistance** training*. The claim attached describes the opposite arm:
"running-induced damage impairs squat/deadlift 24-48h". The physiologist's point
is that "bidirectional" does not rescue it — the review is unidirectional by
construction.

Read correctly the paper does not merely fail to support the claim, it **indicts
the weekly template**: CSM schedules Wednesday `block_strength_moderate` (5×5
front squat) followed ~24h later by Thursday `block_4x4_row` at 90-95% max HR.
Confirmed in the file.

This claim is load-bearing for the `modality_bias` principle, and with it failing,
`berryman_2018` (the stated co-anchor, which studied training *cessation*, not
modality) leaves `wilson_2012` carrying the modality read alone.
→ **Action: replace the citation, not the wording. Then look at the Wednesday /
Thursday pairing on its own merits.**

### 2.8 · `midgley_2007` — `partly`, certain (1 reviewer)

Two problems beyond the spliced record: it is a **narrative review**, so
"intensity distribution meta for endurance" mislabels the design; and its
conclusion is that training at 95-100% VO2max enhances VO2max in well-trained
runners — a high-intensity emphasis, not a distribution finding, and not
obviously supportive of the polarised framing it sits beside.
→ **Action: resolve the record first (1B). The claim rewrite follows from
whichever paper it turns out to be.**

---

# Part 3 — Flagged by all three

Five citations. `astorino_2013` (2.1), `bosquet_2007` (2.2), `ross_2015` and
`wisloff_2007` (below) and `proteau_1992` (below).

Consensus here is worth less than it looks, and the reason is visible in the
list: four of the five are **population-transfer** arguments, which is the
easiest objection for any competent reviewer to reach and therefore the most
correlated. Treat unanimity as "legible", not "true".

### 3.1 · `wisloff_2007` — `partly`, certain from all three

Two distinct errors, and they should not be conflated:

1. **The numbers are mislabelled.** 46% vs 14% are VO2peak increases
   (13.0→19.0 vs 13.1→14.9 ml/kg/min). Both programmes' claim strings call them a
   "stroke volume response". This is a factual error in the claim string and is
   checkable in one lookup.
2. **The population does not transfer.** Post-infarction heart failure patients,
   mean age ~75, EF ~29%, baseline VO2peak 13 ml/kg/min. A 46% gain is reachable
   only from that degree of deconditioning. It is quoted to a rower and to a
   lifter with a 100 kg squat.

All three agree the 4×4 protocol itself is fine to cite here. It is the number
attached to it that is not.
→ **Action: fix the label (now). Decide separately whether the magnitude belongs
in front of a user at all, or only as labelled mechanism illustration.**

### 3.2 · `ross_2015` — `partly` ×2, `not_supported` ×1, certain from the physiologist

This is the disagreement with yesterday's citation-dimension pass, and it needs
resolving before anything else in Part 3.

The physiologist's specific charge: the paper reports non-response of
38.5% / 17.6% / 0% across low-amount-low-intensity, high-amount-low-intensity and
high-amount-high-intensity groups, in 121 sedentary abdominally obese
middle-aged adults over 24 weeks. The claim "non-response drops from 50%
intensity to 0% at 75%" conflates the paper's *50% reduction in the rate of
non-response* (from adding amount) with an *exercise intensity of 50%*. Those are
different quantities.

The other two reviewers do not make that argument; they make the population one —
that a first-stimulus non-response rate in sedentary adults says nothing about
trained rowers or athletes already doing 6+ h/week, who have no 50% non-response
rate to eliminate.

Separately: CSM cites this as the basis for "8 weeks minimum for detectable
submax HR change". A 24-week trial in sedentary obese adults cannot establish an
8-week minimum in trained concurrent athletes, and that one is not a population
quibble — the trial has no 8-week arm.

→ **Action: put this in front of someone with the paper first, and treat the
answer as also deciding whether `engine-builder-block-2`'s VERIFIED badge rests
on a checked claim or an unchecked one.**

### 3.3 · `proteau_1992` — `partly` ×2, `not_supported` ×1

Nobody can confirm which paper is being invoked (1C). Taking the known Proteau /
Marteniuk / Lévesque work at face value, it is laboratory specificity-of-practice
in a discrete visually-guided aiming task, used to argue that 2K-pace erg work
develops "2K-specific hip-drive coordination".

The rowing coach is the fairest here: the coaching belief is reasonable, the jump
from aiming-task learning to a cyclic fatigue-limited whole-body power task is
large, and this paper does not test it. The strength coach goes further and
indicts the surrounding principle text: *"the 2K row is dominated by
wrist-torque-analog + hip-drive coordination"* is not a description of rowing —
wrist action in rowing is feathering and contributes no meaningful power.

Race-pace work is well justified by the pacing and physiological literature. It
does not need this citation.
→ **Action: drop the citation from rowing and fix the principle sentence, which
is user-facing copy that costs credibility with anyone who rows. Resolving the
record (1C) is still needed for the three gymnastics programmes.**

---

# Part 4 — Contested. Open questions, not majority votes

Disagreement is where the information is; a panel drawn from one underlying model
has correlated blind spots, so a 2-1 split is not a 2-1 verdict. Each of these is
presented as a question with the reasoning on each side.

**Q1 · `eddens_2018` — is the +6.91% a general rule or one subgroup?**
The physiologist checked it and cleared it explicitly: *"+6.91% (95% CI
1.96-11.87, p=0.006) for lower-body dynamic strength favouring resistance-first is
the paper's own reported result and conclusion. I went in expecting to flag it."*
The rowing coach (`needs_paper`) recalls the headline as closer to "sequence does
not meaningfully change interference". The strength coach (`likely`) splits the
difference: the number is probably quoted correctly, but if the overall finding
is null with lower-body dynamic strength the one significant subgroup, then
elevating it into a general "lift first" principle — and applying it to
"strength + row" pairing generally in rowing — is the overreach.
→ **Question for a human: is the meta's overall sequence effect null?** The
coaching rule survives either way; the phrasing of the principle does not.

**Q2 · `bouchard_1999_heritage` — applied to the wrong end of the training curve?**
Both flagging reviewers accept the numbers as quoted (47% heritability, ~2.5×
between-family variance). The dispute is the application: HERITAGE trained
previously sedentary adults for 20 weeks on a cycle ergometer, and rowing's Push
tier tells a sub-8:00 rower that "HERITAGE-style non-response distribution begins
to dominate — genetic ceiling in view". Variance in the *initial* response of
untrained people is not a statement about trained athletes near a ceiling.
The rowing coach adds a checkable point: the non-responder copy says "HERITAGE
10× variance in play", and 10× is not in the paper and contradicts the 2.5×
quoted in the sister programme's own evidence base.
→ **Actionable now: reconcile 10× against 2.5×. The rest needs a human.**

**Q3 · `joyner_coyle_2008` — does it rank threshold above VO2max?**
Both flagging reviewers say no: the paper proposes a three-term multiplicative
model (VO2max × sustainable %VO2max × efficiency) and argues that *among elites
with similar VO2max*, threshold and efficiency discriminate. Both programmes use
it as "threshold > VO2max as the primary metric". The physiologist adds the sharp
version: both programmes admit entrants for whom VO2max is plainly the dominant
limiter (2K > 9:00; under 3 h cardio/week), and for those users the paper's
caveat is exactly inverted. The strength coach is more forgiving — a defensible
coaching reading for trained athletes, layered on the model rather than found in
it. Load-bearing either way: it justifies rowing's threshold-build phase and
CSM's choice of submax HR as its headline outcome.

**Q4 · `feito_2018` and `meyer_morrison_zuniga_2017` — reviews credited with trials**
Same defect class, flagged by two reviewers each. `feito_2018` is a definitional
paper cited for "16 wk HIFT — strength AND VO2max improved concurrently";
`meyer_morrison_zuniga_2017` is a systematic review of the benefits **and risks**
of CrossFit cited for a specific 10-week result. Neither ran an intervention. The
strength coach adds that the Meyer review's distinctive contribution is its
injury-rate and rhabdomyolysis discussion, and only the benefits half is cited.
→ **Actionable now if the underlying trials can be identified: cite the trial.
This is exactly the failure the "primary citations" framing enables (1G).**

**Q5 · `fyfe_2016` — does it show volume mediates interference?**
Both flagging reviewers accept the first half (intensity did not mediate
interference — that is the title). Both reject the second half: the design
compared HIT+RT against MICT+RT and did not manipulate endurance volume at all,
so it cannot establish volume as the mediator. That inference belongs to Wilson
2012's dose-response correlations. This matters because CSM derives an actual
rule from it — "cap total endurance minutes" — and then never imposes a cap
anywhere in the file (Part 5.6). The physiologist adds a methodological caveat:
a non-significant difference between two conditions at roughly n=8 per group is
not evidence that intensity does not matter.

**Q6 · `wilson_2012` — are the −18 / −31 / −40% figures being read as percentages?**
One reviewer. They are relative reductions in **effect size** (strength
1.76→1.44, hypertrophy 1.23→0.85, power 0.91→0.55), not percentage losses of
strength, muscle or power. Presented as bare percentages in a consumer app they
read as the latter. Compounding it, CSM cites Schumann 2022's null result for max
strength and hypertrophy alongside them without saying which supersedes —
Schumann is the later and better-controlled meta and should carry the headline
bound.
→ **This one is close to actionable now: it is a reading of numbers the
programme already has, not a claim about a paper's design.**

**Q7 · `aragon_schoenfeld_2013` — nutrient timing used as session spacing**
Two reviewers, differing in force. Both agree the "4-6h rather than 30 min"
reading of the feeding window is fair. Both reject the appended inference that
this "supports 6h separation compatibility" between two *training bouts* — a
category error, since the interference literature's 6h question is about
AMPK/mTORC1 signalling and residual fatigue, not about when you eat. The strength
coach's framing is worth keeping: Robineau 2016 already carries this claim
properly, and Aragon adds "nothing but a false second anchor". Note that this is
a structural objection, not a nutrition judgement — the reviewer said so.

**Q8 · `bishop_2008` — RSA framing for sessions that contain no RSA**
One reviewer. Repeated-sprint ability means repeated maximal efforts of ~<10 s
with incomplete recovery. Rowing's race-pace session is 6×500 m (~1:45-2:15) with
3-4 min rest — a lactate-tolerance piece. The evidence base itself already
concedes the framing is wrong and defers to Buchheit & Laursen, yet the paper is
still in `reference_ids` with the RSA claim attached.
→ **Actionable now: finish the job. Remove it, or attach it to something the
programme prescribes.**

**Q9 · `atherton_2005` — mechanism as hypothesis or as basis?**
One reviewer. Isolated rat muscle stimulated ex vivo at low vs high frequency. It
supports the AMPK/PKB switch *hypothesis*; it does not establish "the molecular
basis of concurrent interference" in training humans, and the human evidence in
CSM's own citation list (Schumann 2022, Murach & Bagley 2016) has weakened that
hypothesis. Since a user-facing rule (6h separation) descends from this chain,
the mechanism should be described as a hypothesis.
Note: **two of three reviewers explicitly declined to adjudicate the signalling
cluster at all** (Atherton, Baar, Coffey & Hawley, and the AMPK/mTOR windows).
One physiologist opinion is thin ground.

**Q10 · `morton_2018` — is 1.62 g/kg/day a ceiling?**
One reviewer. It is a breakpoint point estimate with a wide CI (~1.03-2.20) from
a meta pooling resistance-training-only participants. Stating it as "no further
hypertrophy benefit above 1.62" presents a noisy estimate as a ceiling, and
excludes exactly the athlete this programme serves — someone adding several hours
of endurance work, whose requirement is plausibly higher. The Jäger 1.4-2.0 range
cited alongside is the safer user-facing number.
Note: the strength coach explicitly routed all nutrition claims to a dietitian
and declined to adjudicate.

**Q11 · `butcher_2015`, `steinacker_1993`, `kilding_2012`, `berryman_2018`,
`mujika_padilla_2000_a`, `andersen_henriksson_1977` display style** — one reviewer
each, all recorded above or in the weak-findings section.

---

# Part 5 — Implementation defects. Verified in the shipped files, actionable now

**This is the strongest part of the panel's output and it is not about
citations at all.** Every item below I confirmed by reading
`next-app/public/data/programs/*.json` and `next-app/src/lib/gpx.ts`. No papers
required. If only one section of this document gets worked, make it this one.

### 5.1 · Rowing's two retest metrics measure neither thing they are named for — P0

```
row_2k_time_seconds
  source_ref: "runs[].total_seconds where activity_type == 'row'"
  aggregation: best_of_last_n, window_days: 14, direction: lower_is_better

threshold_pace_500m_seconds
  source_ref: "runs[].avg_pace_500m_seconds where activity_type == 'row'"
  aggregation: trend_slope, window_days: 21
```

Neither filters on `distance_m` or `session_type`.

- **The 2K metric will report fabricated PRs.** The shortest `total_seconds` of
  *any* logged row wins. A 500 m rep from `block_race_pace_row` registers as a 2K
  of ~100 seconds. Worse: `phase_2_threshold_build`'s block list is
  `[block_z2_row, block_threshold_row, block_race_pace_row]` — **no 2K session at
  all** — so at the phase-2 end retest, with a 14-day window, the shortest
  ordinary row in that window *becomes* the reported 2K time. The physiologist
  adds that `RunSlotCard.tsx` sets `total_seconds` to whole-session duration when
  a 2K time was not entered.
- **The threshold metric tracks session mix.** Z2 and technique rows dominate the
  week by volume, so the 21-day trend moves with how much easy rowing was done. A
  Z2-heavy week reads as threshold regression. And the phase-3 taper's 45% volume
  cut removes proportionally more slow Z2 rowing, which will move the trend
  favourably on composition alone — at exactly the moment the user is looking for
  evidence the block worked.
- **It is also the `primary_signal_metric_id` for the non-responder classifier.**
  A mix artefact can tell a compliant athlete at week 3 that they have hit a
  genetic ceiling.

→ **Action: filter on `distance_m ≈ 2000` and `session_type` for the 2K metric;
derive threshold pace from a defined threshold piece for the other. Both are
one-line `source_ref` changes plus the loader work behind them.**

### 5.2 · CSM's strength retest cannot detect strength loss — P0

```
back_squat_5rm_kg
  source_ref: "training_maxes.back_squat_highbar"
  aggregation: latest
```

That reads back the configured training max — a static input the programme uses
to *prescribe*. It is circular: the number can only change if the user edits it.
Consequently `progression_rules`' red state, whose trigger is "strength loss
> 2.5 kg on any lift", can essentially never fire, and the protective mechanism it
guards (drop the 4×4 for a week) is dead code.

`daily_log_schema.strength` already collects `weight_kg` / `reps` / `rpe`, which
supports a real e1RM, and `block_retest_strength` describes a real 5RM
confirmation. Neither feeds the metric.
→ **Action: point the metric at logged sets or at the retest block.**

### 5.3 · CSM's headline metric reads fields that are not in its own schema — P0

```
submax_hr_pace5_bpm
  source_ref: "runs[].avg_hr where intensity == 'easy'"
  aggregation: trend_slope, window_days: 28
```

`daily_log_schema.endurance` is `["duration_min", "avg_hr_bpm", "modality"]`.
There is no `avg_hr` and no `intensity` key. `intensity` is derived elsewhere —
`gpx.ts intensityFromHr` — whose own docstring names this exact metric and this
exact silent-drop failure. Three further problems, all confirmed:

1. **Wrong quantity.** `block_retest_hr` specifies the right test: 5 min at a
   fixed pace, record steady-state HR. The metric averages whole 30-60 min easy
   sessions. A 45-min Z2 average sits several bpm above a 5-min steady state
   through cardiac drift alone.
2. **Modality-blind.** The log records modality; the metric ignores it. Bike and
   row differ by several bpm at matched relative intensity, and the programme
   prescribes both.
3. **The classifier moves under the metric.** `intensityFromHr` divides avg HR by
   the highest max HR ever logged; below 0.72 is "easy". The first true 4×4 in
   week 3 raises the denominator, so sessions at unchanged absolute HR reclassify
   from moderate into easy and enter the pool — pushing the measured trend the
   wrong way precisely when the athlete first makes a maximal effort. The 0.72
   cutoff also sits below the programme's own Z2 bands (70-78% rowing,
   70-75% bike), so part of prescribed Z2 is excluded from the metric by
   definition.

The programme's single outcome claim rests on this field.
→ **Action: point the metric at `block_retest_hr`.**

### 5.4 · The tier targets run backwards in CSM — P1

Confirmed in `plan_tiers`. CSM: Foundation (< 3 h/wk cardio) −5 bpm,
Progression −8, Push (6+ h/wk) −10 with −15 stretch. Trainability runs the other
way: the least aerobically trained athlete has the most room for submaximal HR to
fall at a fixed pace, and someone already doing 6+ h/wk will struggle to find
10 bpm in eight weeks off one 4×4 a week.

Rowing gets the ordering right — Foundation −15/−30 s, Progression −8/−15,
Push −3/−8. Two reviewers independently said CSM should mirror it.
→ **Action: invert. This is a data edit.**

### 5.5 · Rowing's headline goal shows the most flattering tier's number — P1

`program_goal` is `target_value: -15, stretch_value: -30` — Foundation's row,
shown to everyone, while the tier table privately expects −8 to −15 (Progression)
and −3 to −8 (Push). A sub-8:00 athlete sees a headline five times larger than
what the programme expects for them. The tier ranges themselves are sensible and
honest.
→ **Action: tier-resolve the headline.**

### 5.6 · The cap that the central principle rests on does not exist — P1

CSM's principle is that endurance **volume** mediates interference — "cap total
endurance minutes". There is no cap anywhere in the file. Nothing asks what the
user's existing cardio is beyond the tiering question, nothing says what to drop,
no weekly minutes ceiling exists. The Push tier is *defined* as someone already
doing 6+ h/wk, and the template note says Push "adds one Z2 session". The
highest-volume user gets more prescribed cardio on top of a 6 h habit, in a block
whose thesis is that total endurance volume is what costs you the squat.
→ **Action: this is the largest structural hole in CSM. Either implement a cap or
stop publishing the principle.** (See also Q5 — the citation behind it does not
support it either.)

### 5.7 · `weekly_template` contradicts the phase block lists, in both programmes — P1

Both templates are phase-invariant. Confirmed:

- **CSM** template runs Sun Z2 bike / Mon heavy / Tue Z2 bike / Wed moderate /
  Thu 4×4 / Fri Z2 row every week. `phase_1_intro`'s block list contains no
  `block_4x4_row`; `phase_3_test` drops both `block_z2_bike` and
  `block_strength_moderate`. So the displayed week shows intervals during the two
  weeks that are supposed to have none, and shows two sessions in weeks 7-8 that
  the phase removed.
- **Rowing** template places threshold on Wednesday and race pace on Saturday in
  *every* week, including `phase_1_base_check`, whose blocks are z2 / technique /
  open_2k / easy_recovery. And `block_open_2k` — the baseline the whole retest
  chain depends on — **has no slot on any template day in either variant**.
- **Rowing's `session_count_per_week_range` is [4, 5]**; the template lists six
  sessions Mon-Sat and `push_tier_override` lists seven.

Whichever structure the renderer honours, the other is lying to the user.
→ **Action: decide which is authoritative and add a `data-integrity` assertion
that every phase's blocks appear in that phase's rendered week and vice versa.
This class of defect has now appeared in four programmes.**

### 5.8 · CSM promises lifts it neither trains nor tests — P1

Foundation's `typical_outcome`: "back squat / bench / deadlift maintained within
2.5 kg of pre-block TM". Confirmed: there is **no bench press anywhere in the
file** — no upper-body movement of any kind. There is no deadlift;
`block_pull_midshin` is a partial-ROM variant. `training_maxes.starting_values_kg`
holds three entries (back_squat_highbar, front_squat, block_pull_midshin). The
only strength retest is the back squat. `block_strength_moderate`'s note says
"front squat + press pattern" and its items array contains one exercise, the
front squat.
→ **Action: fix the outcome string, or add the lifts. The string is the promise
the user reads.**

### 5.9 · Tier assignment falls through, in both programmes — P1

- **CSM:** foundation requires `cardio_hours_per_week < 3 && has_squat_prs ==
  true`. A user under 3 h who answers *no* to having a squat 5RM matches no tier.
  The strength coach's read is that this user should probably be redirected to
  Engine Builder rather than given a fourth tier — there is no strength floor to
  maintain.
- **Rowing:** all three tier conditions require a numeric `current_2k_seconds`,
  and the intake explicitly accepts "never".

→ **Action: both are one-line intake/routing fixes, and both are reachable by a
real user on day one.**

### 5.10 · Prescription concerns that need a coach's call, not a code fix

Recorded compactly; these are judgement, and two of the three reviewers are
in-domain for them.

- **No 2K pacing plan exists anywhere in rowing.** No opening-500 target, no
  split plan, no stroke-rate plan. The rowing coach searched for "pacing",
  "negative split", "first 500", "rate cap" — none appear. His argument: the
  standard amateur failure is going out 4-6 s/500 under target and losing 10-20 s
  in the third and fourth 500s, which is more than the ~2-3% of physiology the
  block buys. **He rates this the single highest-yield addition to the
  programme**, and it costs no citation work.
- **`block_threshold_row` is mis-prescribed.** "4×8 min @ ~5-10 s/500m over 2K
  pace, 2 min rest, HR 82-88% max". 2K pace +5 s/500 is not threshold for
  anyone; the HR target is a genuine threshold target, so pace and HR will
  conflict inside the same session. Suggested band: 2K pace +10 to +16 s/500.
  If it stays as written it is a second race-pace day, which then breaks the
  48h hard-day separation against Saturday.
- **The final week deletes all race-pace work** (`block_replacements_final_week`
  maps race pace to easy recovery) on the rationale that the nervous system
  should be "fresh, not primed" — which contradicts the taper principle the
  programme cites, where volume falls and intensity is held. Suggested: keep
  short sharp touches (4×250 m at target with full recovery, 3-4 days out) and
  cut volume instead.
- **Maximal 2K testing is over-prescribed.** `immediate_actions` puts a
  full-effort 2K on day 1; `block_open_2k` is declared in phase 1 (2 weeks) *and*
  phase 3, at "1×/wk (base weeks + test week)"; retest cadence is 2-weekly. Up to
  three or four maximal 2Ks in a six-week block containing two genuine loading
  weeks. Two reviewers independently: one baseline, one test, and a submaximal or
  4×8 proxy for the mid-block check.
- **The test is unstandardised while being used as a trend metric.** No drag
  factor, no same-machine requirement, and `block_open_2k` budgets 25 minutes
  total for "warm-up + all-out effort + cool-down" on a piece that takes 7-9
  minutes. Drag factor alone moves an amateur's 2K by several seconds.
- **6×500 m at 2K pace is 3000 m of race-pace work** — 150% of race distance,
  weekly from week 3 with no progression, and for the Foundation tier too. Two
  reviewers suggest 4-5×500 building to six. There is also no rule for
  re-anchoring target pace after the week-3 check.
- **Technique disappears from week 3**, exactly when the 4×8 and 6×500 sessions
  arrive and a novice's sequencing breaks down under fatigue. All three tiers use
  the same weekly layout, so a 9:30 novice and a 7:00 rower get an identical week.
- **A two-week taper inside a six-week block** leaves two loading weeks. Bosquet's
  optimum comes from tapers sitting on full training cycles. 7-10 days, or an
  8-week block.
- **CSM's maintenance dose has the intensity lever backwards.** Back squat 5×5
  @ 75% TM, block pull 5×3 @ 78%, front squat 5×5 @ 65% — roughly 68 / 70 / 59%
  of 1RM on the 5/3/1 convention the programme inherits, with an RPE ≤ 7 ceiling
  forbidding anything higher. The maintenance literature holds that intensity is
  what must be preserved and volume is what can be cut. This holds moderate
  volume at an intensity too low to maintain a 5RM, for eight weeks, on top of
  four cardio sessions.
- **CSM names explosive strength as the thing it structures to protect** (the
  `cost_bounded` principle, Schumann SMD −0.28) **and contains no explosive work**
  — no jumps, throws, dynamic-effort sets, or bar-velocity/intent cue anywhere.
  The mechanism it does use, an RPE ≤ 7 ceiling on submaximal 5×5, is close to
  the opposite of what preserves rate of force development.
- **Six sessions a week is not an add-on.** CSM's explicit non-goal is "replacing
  the athlete's sport-specific block", and it prescribes six sessions across six
  consecutive days. `days_per_week` is collected with options down to 2 and the
  help text promises "we'll tell you upfront whether this program can deliver on
  its claim at that dose" — the template never changes.
- **Rowing forbids all concurrent strength for six weeks** on grounds its sibling
  contradicts: CSM's own `modality_bias` principle puts seated non-eccentric
  modalities at the near-zero end of the interference gradient. A lifter chasing
  15 seconds should not be told to stop squatting.
- **Train-low citations (Bartlett 2015, Impey 2018) sit in CSM's evidence base**
  with no guidance, in a block whose purpose is protecting maximal strength.
  Either mark them "not in this block" or drop them. (Flagged by a reviewer who
  explicitly routed nutrition to a dietitian — treat as a pointer, not a verdict.)
- **Two small internal inconsistencies:** CSM's `flaring_tendon` block body says
  "running-based intervals will amplify a flaring tendon" in a programme that
  prescribes no running; and `note-signals.ts` flags cardio load off absolute max
  HR cutoffs of 170 and 180, which are age- and modality-blind.

---

# Part 6 — Screening

All three reviewers converged here, and it is the least citation-dependent part
of the output. It is also the part where **none of them is qualified to set a
threshold** — a coach and a physiologist can say a question is missing; only a
clinician can say what the answer should gate.

**All three, on CSM:**
- **No chest pain / exertional dyspnoea question exists at all** — not in intake,
  not in `safety_gates`, in the programme that prescribes weekly 4×4 at 90-95% max
  HR, the highest cardiac demand in the catalogue. Rowing asks it and blocks on
  it. Two programmes in one catalogue applying the same near-maximal load should
  not disagree about whether chest pain is disqualifying. This looks like an
  omission, not a decision.
- **No lumbar or spinal question anywhere**, in a programme prescribing 5×5 back
  squat at 75% TM and 5×3 block pulls at 78% twice weekly, plus rowing/ski
  intervals. The only musculoskeletal gate is `flaring_tendon`.

**All three, on both:**
- **Beta-blockers and rate-limiting cardiac medication.** Every intensity in both
  files is a percentage of max HR (70-75, 70-78, 82-88, 90-95%) and CSM's entire
  headline outcome is a heart-rate number. Under rate limitation the targets are
  unreachable, the athlete chases a HR they cannot hit — driving effort higher
  than intended — and the outcome metric becomes uninterpretable. The right
  handling is an intake question that switches to RPE/pace anchoring and swaps the
  goal metric, not a block.
- **Pregnancy is in both programmes' own `contraindications` and is asked in
  neither.** The physiologist adds that rowing's stated reason ("HR-based zones
  unreliable") is the weaker one: the concern with a maximal 2K is maximal
  exertion and the Valsalva load of the drive, and it is not confined to the first
  trimester. A documented contraindication that is not enforced protects nobody —
  the same is true of CSM's post-COVID/post-viral entry.

**Two of three:**
- **Rib stress injury** — the signature rowing overuse injury, provoked by exactly
  this mix of an erg volume step-up plus repeated high-force pieces. Not screened
  and not in the stop rule; the only related question is `chest_pain_recent`,
  which frames chest pain as cardiac, so a rower whose rib pain is obviously
  musculoskeletal answers "no" and proceeds to 4×8 threshold pieces.
- **Lumbar disc history that is settled but recurrent.** The gate is
  `flaring_low_back` — an active flare only. Rowing under fatigue is repeated
  loaded lumbar flexion, and the programme removes technique work from week 3
  while adding threshold pieces and maximal tests.
- **Family history of sudden cardiac death, known cardiomyopathy, diagnosed
  arrhythmia, and age.** Neither intake asks age at all. The exertional syncope
  question catches only someone who has already collapsed. The highest-risk single
  item in the catalogue is rowing's day-1 all-out 2K — effectively an unsupervised
  maximal exercise test — prescribed to a user who may have answered "never" to
  having tested a 2K and "novice" on erg familiarity.
- **Barbell competence and a current training max.** CSM's whole strength side is
  percentages of TM and `immediate_actions` asks for a 5RM confirmation on day 1.
  `has_squat_prs` is asked but only routes tiers, never safety. Nothing establishes
  the TM is current — ask the date it was last verified.
- **Existing training load outside the app.** Rowing collects `days_per_week` and
  nothing else; CSM asks `cardio_hours_per_week` and then ignores it in the
  template. The 48h hard-day separation rule cannot be applied to sessions the app
  cannot see, and the product positioning is explicitly "alongside your existing
  week".

**One reviewer each, worth a specialist's read:**
- **Low energy availability / disordered eating / weight-making.** Both programmes
  issue fuelling prescriptions and both add aerobic volume on top of an existing
  week. Neither asks about intake, weight trajectory or menstrual status. Matters
  most for the rowing programme, which sits in a weight-category sport culture.
- **CSM's `flaring_tendon` gate blocks on a session the programme does not
  prescribe** (running) while the real exposure — patellar loading from rowing
  intervals plus twice-weekly squatting — is never mentioned.
- **Blanket "at least 1.6 g/kg/day protein" with no upper guidance and no renal
  question**, issued to anyone who passes a three-question gate.

---

# Part 7 — Cross-cutting: how max HR is anchored

Raised by the physiologist, in scope, and verified in `next-app/src/lib/gpx.ts`.

The app does **not** use 220-minus-age or any age formula, which is the better
instinct and should be preserved. It anchors on `observedMaxHrFrom` — the highest
`max_hr` ever logged. Three consequences, and every %HRmax band in both
programmes inherits all three:

1. **It is a ratchet that only rises.** It cannot fall with detraining, illness or
   age.
2. **It is shared across modalities** with genuinely different maxima (rowing
   typically runs above cycling).
3. **For a novice who has never made a maximal effort it is set by whatever their
   easiest session peaked at**, which makes every prescribed zone too hard.

And it feeds the intensity classifier that CSM's headline metric filters on
(5.3), so the anchor moving changes what counts as an "easy" session
retroactively.

→ **Action: an explicit max-HR profile field, or at minimum a note that the zones
are provisional until a maximal effort has been logged.** This is a product
decision, cheap, and it improves seven programmes.

---

# Part 8 — What can be done now vs what needs a human with the papers

### Do now (no papers, no specialist — all verified above)

1. The four retest `source_ref` defects (5.1, 5.2, 5.3) — these are the
   programmes' only outcome measurements and none of them measures its outcome.
2. Resolve the 30 null URLs and 4 search stubs; add the assertion (1D).
3. The year/volume sweep (1A), the two spliced records (1B), the byline fix on
   `ross_2015`.
4. `display_short` / `display_line` generator and the Part I/II titles (1E, 1F).
5. Invert CSM's tier targets (5.4); tier-resolve rowing's headline (5.5).
6. Both tier fall-throughs (5.9).
7. CSM's bench/deadlift promise (5.8).
8. `wisloff_2007`'s "stroke volume" label — VO2peak, not SV (3.1).
9. Reconcile "HERITAGE 10× variance" against the 2.5× the same evidence base
   quotes elsewhere (Q2).
10. Remove `bishop_2008`'s RSA claim, which the evidence base already concedes
    (Q8).
11. Drop the word "primary" and fix the rowing count (1G).
12. Add a chest-pain/dyspnoea gate and a lumbar gate to CSM, matching rowing's
    existing ones — *pending the clinician review below, but the asymmetry
    between two sibling programmes is decidable without one*.

### Needs a human with the papers, ranked

1. **`astorino_2013`** — the "3-6% threshold pace" number, in rowing *and*
   `engine-builder-block-2`. Load-bearing in five places. Start here.
2. **`ross_2015`** — because it decides whether yesterday's citation-dimension
   pass or this panel is right, and because `engine-builder-block-2` was badged
   VERIFIED on the strength of the reading now disputed.
3. **`bosquet_2007`** — the ~2% vs ~3% question, which sets the headline the
   rowing programme sells. One reviewer said `needs_paper` and was right to.
4. **`eddens_2018`** — is the overall sequence effect null with one significant
   subgroup? Decides whether "lift first" is a principle or a hedge (Q1).
5. **`doma_2019`, `mujika_padilla_2000_b`, `feito_2018`,
   `meyer_morrison_zuniga_2017`, `midgley_2007`, `proteau_1992`, `kilding_2012`,
   `wilson_2012`** — eight records where the claim and the paper appear
   mismatched and where a single lookup settles it.

### Needs a clinician

The whole of Part 6. The panel can say a question is missing; it cannot set a
threshold. Bring: the chest-pain asymmetry, the missing lumbar gate on the
barbell programme, beta-blockers and rate-limited HR prescription, pregnancy,
family history and age, rib stress injury, and low energy availability. Ship no
new screening copy before this happens.

### Needs a rowing coach who is not a language model

Part 5.10's first four items — the pacing plan, the threshold pace band, the
final-week race-pace deletion, and the number of maximal 2Ks. The rowing coach
persona rates the pacing plan the highest-yield change available to this
programme, and it requires no citation at all.

---

# Weak findings, stated as weak

- **`bosquet_2007`'s ~3%** is in Part 2 because two reviewers marked it
  `certain` — but the third, who is the one whose domain it squarely is, said
  `needs_paper`. Read it as `needs_paper`.
- **Every population-transfer flag** (`ross_2015`, `wisloff_2007`,
  `steinacker_1993`, `bouchard_1999_heritage`, `butcher_2015`) is a coaching
  objection to how a real result is applied, not a claim that the paper says
  something else. `wisloff_2007`'s mislabelled SV/VO2peak is the exception and is
  a real error. The rest change `used_for` strings, not behaviour.
- **`kilding_2012`** was marked `needs_paper` by all three and one could not
  confirm it exists as described. That is an argument for resolving it, not for
  deleting it — the last panel's one deletion recommendation would have destroyed
  a real paper on the strength of bad metadata. Resolve, then decide.
- **`atherton_2005`, `morton_2018`, `aragon_schoenfeld_2013`** — one reviewer
  each, and in two of the three cases the *other two reviewers explicitly
  declined to adjudicate the domain*. Signalling and nutrition need a physiologist
  and a dietitian respectively. Do not action on one persona's read.
- **`berryman_2018`, `mujika_padilla_2000_a`, `butcher_2015`, `feito_2018`,
  `meyer_morrison_zuniga_2017`** — all five are "the citation is adjacent to the
  claim rather than supporting it". Editorial narrowing of `used_for`. Low
  priority, and the programmes' own `engineering_choices_flagged` sections already
  caught several of these. The pattern worth fixing is not the flag itself: it is
  that the self-flag usually sits in the evidence base while the unqualified
  version still appears in the principle text, the phase rationale, or the tier
  outcome the user actually reads.
- **The Doma / Wednesday-Thursday scheduling argument** is only as good as the
  Doma reading, which is itself a flag. If `doma_2019` turns out to be a different
  paper, the 24h pairing objection needs re-founding on Robineau.
- **Anything in Part 5.10 that reads as a coach's preference** — 4-5×500 vs 6×500,
  7-10 days vs two weeks of taper, the maintenance intensity argument — is
  defensible practice, not a defect. It belongs in a conversation with a coach,
  not in a fix list.
- **Nothing in this document evaluated the adaptive engine's proposal logic**, the
  barbell technique or exercise selection, the rowing technique drill
  progression, or anything clinical.

# Reviewer scope limits, in their own terms

Recorded so nothing here is read as cleared.

**rowing-coach** — reviewed all 51 for metadata; adjudicated content only where
the claim falls inside endurance/race-prep/taper coaching. Did **not** adjudicate
the molecular-signalling and nutrition citations (`atherton_2005`, `baar_2014`,
`bartlett_2015`, `impey_2018`, `coffey_hawley_2007`, `aragon_schoenfeld_2013`,
`jager_2017`, `morton_2018`, `andersen_henriksson_1977`) beyond bibliographic
detail — *"someone with a physiology/nutrition background should look at the
AMPK/mTOR window claims in particular, since the 6h separation rule leans on
them"*. Did not adjudicate the CrossFit/HYROX population papers (`butcher_2015`,
`feito_2018`, `meyer_morrison_zuniga_2017`, `brandt_2025`) or the genomics beyond
HERITAGE. **Has no basis to judge the Schumann 2022 / Wilson 2012 / Fyfe / Murach
/ Petre / Robineau / Doma / Berryman concurrent-interference cluster — which is
the evidential core of `concurrent-strength-maintenance`.** His review of that
programme covers the aerobic prescription, the metrics, the weekly load and the
screening only.

**strength-conditioning-coach** — assessed three areas structurally only and
would not want them treated as verified at source: (1) the molecular signalling
citations and the AMPK/mTORC1 timing numbers the 6h rule is built on — *"I can
say the program flags its own 6h floor as an engineering read rather than a
validated threshold, which is the honest framing, but I cannot verify the
signalling windows themselves"*; (2) the nutrition citations, with train-low
routed explicitly to a sports dietitian, and the Aragon flag marked as structural
rather than nutritional; (3) the genomics — flagged how HERITAGE is applied to
trained athletes, but cannot speak to whether the 21-SNP model's 49% has held up
in replication. Everything about the clinical-population papers (Wisløff, Ross) is
a transfer-of-population argument, not a clinical one. Several rowing-side flags
rest on reasoning about study populations rather than a re-read, hence "likely"
rather than "certain".

**exercise-physiologist** — reviewed threshold/MLSS concepts, HR-based
prescription and anchoring, detraining and taper timecourses, protein and
fuelling, and the reading of effect sizes out of the meta-analyses. **Not**
reviewed: barbell technique and exercise selection (block pull vs conventional
deadlift, front squat programming), rowing technique drill progression and the
biomechanics of the drive sequence, anything clinical or orthopaedic, and the
adaptive engine's proposal logic beyond the retest metrics themselves.

Nothing in this document covers the gymnastics, mobility or hip-rebuild
programmes, or the shared `exercises.json` cue copy — except where a shared
citation (`proteau_1992`, `ross_2015`, `wisloff_2007`, `astorino_2013`) reaches
them.


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
