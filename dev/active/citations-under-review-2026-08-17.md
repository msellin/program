# Citations under review — 2026-08-17

Path A (mechanical + verifiable-soften) citation-drift fixes were applied
autonomously. This file collects the Tier 3 items that need founder
judgment before REVIEWED status can be bumped. Each entry: what's broken,
what the reviewer proposed, and the tightest founder question that will
close it.

Scope: only items the specialist reviews flagged where the fix depends on
either (a) locating a paper that WebFetch/PubMed couldn't confirm, or
(b) a design decision about whether a citation should stay, be swapped,
or be dropped.

## Global — verification approach

- PubMed cookie-walled agents during autonomous run; WebFetch on PLOS
  confirmed some DOIs, blocked others.
- Where a paper's DOI/PMC ID unambiguously resolves to a *different*
  paper, the current program citation's `verification_status` was
  downgraded to `unverified` and a `review_note` added to
  `citations.json`. Nothing was silently corrected.
- The mechanical Tier 1 + verifiable Tier 2 fixes are already in the
  tree (see git log 2026-08-17). This file is only what's left.

---

## CSM · concurrent-strength-maintenance

### C-1 · `berryman_2018` cites the wrong paper

**What's flagged:** The reviewer verified that IJSPP 13(1):57-64 is
Berryman's *strength-training-for-runners* meta-analysis, not the
cycling-compatibility paper the CSM program leans on.

**Reviewer's read:** the modality-preference claim ("cycling as cleanest
bidirectional compatibility") is already carried by Wilson 2012 +
Doma 2019. `berryman_2018` is either wrong-paper-wrong-claim (drop) or
wrong-metadata-right-claim (find the right Berryman paper).

**Founder question:** drop `berryman_2018` from CSM's reference list, or
locate the intended Berryman paper (search terms: Berryman concurrent
cycling strength interference)?

**Files touched if drop:** remove from `references[]` and
`reference_ids[]` in `next-app/public/data/programs/concurrent-strength-maintenance.json`.
Delete from `citations.json` if not used elsewhere.

---

### C-2 · `petre_2018` title mismatch

**What's flagged:** The finding attributed (HIIT vs continuous produce
same squat gains in highly-trained) is correct. Only the title metadata
in `citations.json` is wrong.

**Reviewer's actual title:** "The Effect of Two Different Concurrent
Training Programs on Strength and Power Gains in Highly-Trained
Individuals" (Petré, Löfving, Psilander 2018, JSSM 17(2):167-173).

**Founder question:** approve the reviewer's title? If yes I can update
`citations.json` in the next pass — pure metadata fix.

---

### C-3 · `brandt_2025` title mismatch

**Reviewer's actual title:** "Acute physiological responses and performance
determinants in Hyrox© – a new running-focused high intensity functional
fitness trend" (Brandt, Ebel, Lebahn, Schmidt 2025, Front Physiol; DOI
10.3389/fphys.2025.1519240).

**Founder question:** approve? Same shape as C-2.

---

## Engine Builder

### E-1 · `ronnestad_hansen_2020` says the OPPOSITE of what the program claims

**What's flagged:** The paper's headline finding is that *short* intervals
were superior to long intervals in trained cyclists. Program's
`block_threshold_cruise` rationale says "long intervals produce
comparable VO2max gains to short intervals."

**This is the biggest citation issue in the Path A batch.** Tier 1
soften isn't sufficient — the claim is directionally wrong.

**Reviewer's three options:**
1. Restate to match Rønnestad — "short intervals superior in trained
   cyclists; long intervals build LT2 sustainable output which is what
   drives race-pace at 2K and above."
2. Cite a different paper for the "both interval lengths work" framing.
3. Drop the claim; rely on Joyner & Coyle for the LT2 line.

**Founder question:** which of the three? My default recommendation
would be #1 — restate accurately, keep the LT2 emphasis intact. But
this changes program tone (short-vs-long becomes a real trade-off,
not a wash).

---

### E-2 · HERITAGE non-responder gate at Push tier

**What's flagged:** the program correctly cites Bouchard 1999's 10×
variance in text but doesn't implement Hecksteden 2015's "≥2 baselines
needed to classify non-responder" rule.

**Reviewer's concern:** a single week-8 retest is insufficient to call
someone a non-responder. Push tier's honest ceiling ("+2-4%") already
accepts non-response as possible; but the classification cadence is
loose.

**Founder question:** ship a mid-Block-2 aerobic check (retest cadence
addition), or accept single-baseline as "good enough for a beta
protocol" and file for post-beta?

---

## Handstand Walk

### H-1 · `sadowski_2021` DOI resolves to Mizutori paper

**Tier 1 soften already shipped:** `verification_status: unverified`,
`review_note` in `citations.json`, `used_for` softened to remove the
specific "3× BW" figure.

**Founder question:** should the *id* rename `sadowski_2021 → mizutori_2021`
happen? That's a cross-program refactor (both HSW and Overhead Mobility
use `sadowski_2021` as a `reference_id`). Or leave the id stable and treat
it as a broken canonical entry until locating the real Sadowski paper?

**Recommendation:** leave the id, keep the citations.json `review_note`,
because rename touches N program JSONs. Revisit only if we locate the
real Sadowski paper.

---

### H-2 · `vidal_torija_2025` PMC resolves to Martonovich paper

Same shape as H-1. Same recommendation.

---

### H-3 · `ferrari_2021` unlocatable

**What's flagged:** DOI/volume missing; the drill design (single-step
initiation → walking) doesn't require this specific citation. Reviewer
suggests Yiou 2017 or canonical Winter walking-initiation work as
substitutes.

**Founder question:** drop `ferrari_2021` and swap in Yiou 2017 /
Winter, or leave the flag and revisit later?

**Recommendation:** swap. Yiou is real and well-established. But it's
your call.

---

### H-4 · `sci_reports_2026_handstand_shoulder` unverified

**What's flagged:** URL claimed. The "237 stance phases" and "shorter
effective arm length / axial torsional work" specifics can't be
independently verified.

**Reviewer's position:** the "shoulder pain stops session" rule survives
on general principle even if this specific paper doesn't exist.

**Founder question:** WebFetch the URL yourself to confirm the paper
exists? If it does, `verification_status: verified` again. If not,
drop the specifics from `used_for` and keep the general rule.

---

### H-5 · `walker_2003` — three real Walker 2003 papers

**Already fixed to Learning & Memory 10(4):275-284** per whitepaper 04
guidance. But three real Walker 2003 papers exist:
- Neuroscience 133(4):911-917 (was in citations.json)
- Nature 425:616-620 (HSW's program reference used to say this)
- Learning & Memory 10(4):275-284 (whitepaper 04 says this; now
  canonical)

**Founder question:** confirm Learning & Memory 10(4) is the intended
sleep-consolidation reference? If yes, close this out. If the Nature
paper was actually the one you meant, revert.

---

### H-6 · `kinoshita_2022`, `wiesinger_2019` missing DOIs

**Tier 1:** `verification_status: unverified` set.
**Founder question:** locate the DOIs, or downgrade rhetoric
(remove EMG-specifics from `used_for`)?

---

## Overhead Mobility

### O-1 · Motor-learning references not visibly operationalised

**What's flagged:** Chiviacowsky-Wulf 2002, Wulf-Shea 2002, Shea-Morgan
1979, Salmoni 1984, Sands 2000 are all listed in `reference_ids` but
none are visibly driving drill card / weekly template design.

**Reviewer's frame:** "listed but not operationalised" is the citation
theatre the REVIEWED bar is designed to catch.

**Founder question:** either
(a) wire blocked→random and self-controlled feedback into the drill
   cards + weekly template, OR
(b) drop them from `reference_ids`.

Neither is trivial. (a) is a program-design decision. (b) is easy but
weakens the reference base.

---

### O-2 · `sadowski_2021` — see H-1
### O-3 · `walker_2003` — see H-5

---

## Rowing 2K Test Prep

### R-1 · Add `bosquet_2007` as taper anchor

**What's flagged:** "~3% performance uplift" is currently sourced to
Mujika & Padilla 2000. Reviewer says Bosquet 2007 (MSSE 39(8):1358-1365)
is the stronger, taper-specific meta anchor for that number.

**Founder question:** add `bosquet_2007` to `citations.json` and cite
alongside Mujika? Or replace Mujika (weakens the detraining rationale)?

**Recommendation:** add alongside. Both anchors, both real.

---

### R-2 · `proteau_1992` title mismatch

**What's flagged:** the program's citation and the citations.json
canonical title don't align.

**Founder question:** which is the intended paper? Need the correct
title before writing the fix.

---

### R-3 · Replace `das_2019` with a stronger source

**What's flagged:** J Phys Ed Sports Manage 6(1):5-11 is a low-tier
journal. Steinacker's later work or a Secher chapter would carry more
weight.

**Founder question:** replace with which? Reviewer didn't specify.

---

### R-4 · HERITAGE non-responder gate at Push tier

Same shape as E-2. Same open question.

---

## Not filed here (Tier 1 + 2, already fixed)

For the historical record — these were applied autonomously in the
2026-08-17 Path A commit and are NOT in this file:

- CSM: 6h separation moved to engineering_choices_flagged; deload block
  placement fixed (moved from phase_1 to phase_2)
- Engine Builder: 3 engineering choices added to
  engineering_choices_flagged; Ross 2015 "0%" softened to "substantially
  reduced"; Wisløff 2007 + Konopka 2014 population caveats added;
  Progression + Push resting HR retest targets filled
- Handstand Walk: weakest-capability-first added to
  engineering_choices_flagged; "coin between heels" cue replaced with
  "point toes at light fixture overhead"; DiFiori 2006 hedged as
  young-gymnast mechanism analog
- Overhead Mobility: Reinold 2007 rewritten as EMG catalogue (not RCT);
  Ludewig-Reynolds "cause" → "association"; Bullock 2019 `used_for`
  rewritten to rotational ROM (not thoracic); Kibler year 2013 → 2010;
  Walker 2003 journal corrected
- Rowing 2K: Astorino 2013 rewritten as cyclist-extrapolation-to-rowing;
  Seiler 2010 reframed for race-prep; Wilson 2012 rowing claim
  reframed; Bishop 2008 dropped from race-pace justification
  (Buchheit & Laursen carries); Rønnestad absence added as engineering
  choice; 4 search-query-URL "verified" flags downgraded to
  "unverified" (hagerman_1994, steinacker_1993, mikulic_2011, das_2019
  — plus bullock_2019 in overhead-mobility)

## After founder review

Once each item above has an answer, apply the fix and bump each
program's status from `REFERENCED` → `REVIEWED`. Log the promotion date
in each program's `status_history` (add the field if not present).
