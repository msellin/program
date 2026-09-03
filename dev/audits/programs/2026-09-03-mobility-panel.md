# Adversarial citation panel — overhead-mobility (2026-09-03)

Three reviewers, each instructed to **refute rather than confirm**, read the same
19-citation packet for `overhead-mobility`, plus the shipped `programs/overhead-mobility.json`,
`exercises.json` and `citations.json`.

| Reviewer | Assessed | Claim flags | Metadata flags |
|---|---|---|---|
| shoulder-physiotherapist | 19 | 13 | 6 |
| overhead-sport-coach | 19 | 14 | 8 |
| motor-control-researcher | 19 | 13 | 5 |

Flagged on the claim by all three: **13**. Marked `certain` by at least one: **3**.
Contested (flagged by one, not the others): **1**. Explicitly checked and clean:
`chiviacowsky_wulf_2002`, `wulf_1998`, `escamilla_2009`.

## What this is, and what it is not

These are three **AI expert personas**. Not clinicians, not a literature search,
not an independent review. None of them had database access. All three said so
themselves, in specific terms: the physio did not verify a single DOI or PubMed
record and flagged eight of the nineteen as outside her field; the coach declined
to judge neuroscience methods, the clinical completeness of the contraindication
list, and whether the runtime engine enforces what the JSON describes; the
researcher noted that four entries carry PubMed *search strings* rather than
records, so his metadata judgements on those rest on recollection.

**This changes nothing user-facing on its own.** It does not move the VERIFIED
badge and it does not alter the ladder copy, which continues to say that no
specialist has independently signed off any programme. That statement is still
true, and this pass makes it more obviously true rather than less: the panel
found an entry shipping with `verification_status: "unverified"` inside a
programme whose `status` is `REVIEWED`.

A finding here is a **candidate defect**, not a verified one — except where this
document says otherwise. Everything in Part 1 was re-checked against the shipped
files while writing this, and is marked accordingly.

## Calibration — read this before reading the findings

The panel that ran on the gymnastics packet on 2026-09-02 flagged **30 of 41**
citations unanimously. Exactly one of those flags survived independent checking,
and even that one had the diagnosis right and the prescription wrong: it said
delete a citation that turned out to be a real, relevant paper with bad metadata.

This panel flagged **13 of 19** unanimously — 68%, the same shape as last time.
Take that as a property of the method, not a measurement of the programme.
Models told to refute over-flag as reliably as agreeable models under-flag, and
three personas drawn from one underlying model over-refute in correlated ways.

Two things are different this time, and they are why this run has more yield:

1. A larger share of the flags are **metadata and structural**, which means they
   can be checked in minutes against files already on disk. I checked all of
   them. They hold.
2. The reviewers converged on a **structural explanation** rather than 13
   independent complaints: the evidence base was, per the programme's own
   `status_note`, "drawn from whitepaper 04_handstand_walk.md" and never pruned
   to what this programme actually prescribes. Six citations support features
   that do not exist here.

Where they are almost certainly over-reaching is the prescription and screening
material in Parts 5 and 6 — long, confident, clinically-worded, and entirely
unverifiable from inside this repo. Treat those as questions for a clinician,
not as a work queue.

---

## Part 1 — Metadata. Checkable now, and checked.

Everything in this part I verified directly against
`next-app/public/data/citations.json`, `.../programs/overhead-mobility.json` and
`.../exercises.json` on 2026-09-03. Where the fix requires knowing what a paper
actually says, that is called out.

### 1.1 · `walker_2003` is spliced from two papers — CONFIRMED, fix needs one lookup

The stored record:

```
authors: "Walker MP, Brakefield T, Hobson JA, Stickgold R"
title:   "Dissociable stages of human memory consolidation and reconsolidation"
source:  "Learning & Memory 10(4):275-284"
```

All three reviewers independently reported the same splice: the title and the
four-author byline belong to the *Nature* 2003 paper (425:616-620); the journal,
volume and pages belong to a different paper, "Sleep and the time course of motor
skill learning" (Learn Mem 10(4):275-284), whose byline includes Seidman and
Morgan.

What is verifiable **inside the repo, right now**, without any lookup: the entry's
own `review_note` claims the "journal + byline" were corrected to the Learning &
Memory paper. The byline stored is a four-author byline. The Learning & Memory
paper has six authors. So the note describes a correction the record does not
contain — the previous pass moved the container and left the title and byline
behind. That is a repo-internal contradiction and it is actionable on its own.

**Action:** replace title *and* byline with the Learning & Memory paper, keep the
source line, rewrite the `review_note` to say what was actually changed. One
PubMed lookup confirms the byline. Do not simply revert the journal — all three
reviewers agree the Learning & Memory paper is the *better* support for the
motor-consolidation rationale.

### 1.2 · `sadowski_2021` ships two different titles for one id — CONFIRMED

| File | Title |
|---|---|
| `citations.json` | "Kinematic and kinetic analysis of the straight-arm press to handstand" |
| `overhead-mobility.json` → `evidence_base.references[]` | "Straight-arm press to handstand: shoulder joint moment analysis" |

Both confirmed verbatim. On top of that, the entry carries
`verification_status: "unverified"` in the programme file, and its own
`review_note` records that DOI `10.1371/journal.pone.0253951` resolves to a
Mizutori-authored parallel-bars study. The researcher additionally reads
"Niznikowska" as a corrupted form of Niznikowski, suggesting a reconstructed
rather than copied byline — that part is his inference, not a check.

This is the same `sadowski_2021` the gymnastics panel hit. It was retracted from
`handstand-walk` and left in place here.

**Action (highest priority in this document):** an entry marked `unverified` must
not ship inside a programme marked `REVIEWED`. Either resolve the identity or
remove the reference from this programme. All three reviewers recommend removal
on the separate ground that it does no work here — there is no press to handstand,
no floor support and no straight-arm loading anywhere in this drill library, and
the rule it backs ("don't load heavy early") is uncontroversial coaching that
needs no citation. **Note the gymnastics lesson before acting: last time, "delete
it" was the wrong call on a real paper with bad metadata.** Deleting the
*reference from this programme* is safe regardless, because the claim does not
need it. Deleting the *citation entry* is a separate decision that needs the
lookup.

### 1.3 · Four entries carry PubMed search strings instead of records — CONFIRMED

`bullock_2019`, `kibler_2013`, `kim_2013`, `manske_2010` all have a `url` of the
form `https://pubmed.ncbi.nlm.nih.gov/?term=...`. Confirmed verbatim on all four.

A search string is not a reference. A user tapping through lands on a results
page. It also means no specific record was ever pinned, which is why two
reviewers said their judgements on these four cannot be trusted without PMIDs.
For `bullock_2019` the search terms embed the disputed year.

**Action:** resolve all four to a PMID or DOI. This is a librarian task, not a
clinician task, and it unblocks several claim flags below.

### 1.4 · `bullock_2019` title / year / volume — CONFIRMED as stored, disputed as content

Stored: "Shoulder range of motion and baseball throwing performance", 2019,
J Athl Train 54(6):679-687, `verification_status: "unverified"`.

All three reviewers say this byline (Bullock, Faherty, Ledbetter, Thigpen, Sell)
published on shoulder ROM and baseball **arm injuries**, J Athl Train
2018;53(12):1190-1199 — different subject, year and volume. The coach notes
Ledbetter is a research librarian, which fits a systematic review.

I can confirm the record as stored and the `unverified` status. I cannot confirm
the paper. **This one needs the lookup from 1.3 before anything is edited.**

### 1.5 · Two-author papers rendered "et al." — CONFIRMED, five entries

| id | stored `display_short` | correct |
|---|---|---|
| `ludewig_cook_2000` | Ludewig et al. 2000 | Ludewig & Cook |
| `ludewig_reynolds_2009` | Ludewig et al. 2009 | Ludewig & Reynolds |
| `shea_morgan_1979` | Shea et al. 1979 | Shea & Morgan |
| `chiviacowsky_wulf_2002` | Chiviacowsky et al. 2002 | Chiviacowsky & Wulf |
| `wulf_shea_2002` | Wulf et al. 2002 | Wulf & Shea |

`kibler_2013` gets it right ("Kibler & Sciascia"), so the house style exists and
these five diverge from it. Worst case is the two Ludewig entries, which both
render as "Ludewig et al." and are indistinguishable to a user checking a source.

**Action:** cosmetic, zero-risk, do it in one edit. Consider a test: the byline
guards added after the gymnastics run already assert on prose and empty bylines;
"two authors in `authors`, `et al.` in `display_short`" is the same class of
check.

### 1.6 · `shea_morgan_1979` display truncates to a different journal — CONFIRMED

`source` is "Journal of Experimental Psychology: Human Learning and Memory 5:179-187";
`display_line` renders "Journal of Experimental Psychology". Those are two
different journals. As displayed, it points at the wrong publication.

### 1.7 · `reinold_2007` — the two shipped records disagree — CONFIRMED

`citations.json` has source "Journal of Orthopaedic & Sports Physical Therapy"
with no volume, issue or pages. The programme's `references[]` has
"JOSPT 37(11):659-670". Whichever renders, the other is wrong or incomplete.

### 1.8 · Five drill-card citation ids do not exist — CONFIRMED, with a severity correction

Ten of the twelve `om_*` drills in `exercises.json` carry at least one
`evidence_refs` id that does not resolve against `citations.json`:

| dangling id | drills |
|---|---|
| `marchant_2011` | 4 |
| `ludewig_2009` | 3 |
| `porter_wu_partridge_2010` | 3 |
| `ludewig_2000` | 1 |
| `kelly_starrett_2015` | 1 (`om_passive_bar_hang`) |

`ludewig_2000` / `ludewig_2009` are near-miss typos of `ludewig_cook_2000` /
`ludewig_reynolds_2009` and are trivially fixable. `marchant_2011` and
`porter_wu_partridge_2010` exist nowhere in the 126-entry citation corpus.
`kelly_starrett_2015` is a commercial mobility book — not a peer-reviewed source
— and it is the *only* evidence reference on `om_passive_bar_hang`, a
full-bodyweight end-range drill.

**Severity correction the reviewers did not make.** Both the coach and the
researcher described this as "every drill carries a citation that cannot be
displayed or checked". It cannot be *displayed*, because nothing displays it:
`evidence_refs` appears exactly once in the app source, in `schemas.ts` as an
optional array. No component reads it. So no user currently sees a broken
citation from this. It is a data-hygiene defect and a latent one — the moment
anything renders `evidence_refs`, it becomes user-facing — but it is not shipping
a visible falsehood today. Both reviewers overstated the impact; the underlying
fact is real.

**Action:** fix the two typos; decide whether `marchant_2011` and
`porter_wu_partridge_2010` refer to real intended papers or should be dropped;
remove `kelly_starrett_2015` (a trade book cannot be the sole citation on a drill
in an app that promises every claim cites a study). Then extend
`data-integrity.test.ts` to resolve `evidence_refs` — the coach's parenthetical
that the suite does not cover them is correct, and this is precisely the class of
defect that suite exists to catch.

### 1.9 · Found while verifying, not reported by the panel

Three checkable items I hit while confirming the above. Same evidential status as
Part 1: read off the shipped files.

- **A tier band with a hole.** `plan_tiers` conditions are `< 160`, `>= 165 && < 180`,
  and `>= 180 && tgu >= 30`. A user measuring 160–164, or 180+ with a TGU hold
  under 30s, matches no tier. `intake-tier.ts` falls back to the first tier, so
  the outcome is safe (most conservative), but the stored rationale becomes
  "No tier matched — defaulted to lowest" rather than a real explanation. Close
  the band or make the fallback deliberate.
- **The headline metric is never measured.** `program_goal.metric` is
  `shoulder_flexion_loaded_deg`. `retest_metrics` contains
  `shoulder_flexion_supine_deg`, `ohs_depth_ratio`, `tgu_hold_max_seconds`. No
  loaded-flexion measurement exists anywhere in the file. The coach reported this
  as a prescription concern; it is verifiable in the data and belongs here.
- **All three tiers share `starting_phase_id: phase_1_kinematic_base`.** Also the
  coach's claim, also confirmed.

---

## Part 2 — Claim flags marked `certain` (3)

Higher confidence than the rest, but still unverified: `certain` is the model's
own word about its own recollection.

**`ludewig_cook_2000`** (certain ×2, likely ×1). Cross-sectional comparison of
scapular kinematics and muscle activity in construction workers with and without
impingement symptoms. The programme says, in `session_rationale`, that scapular
upward-rotation timing "is the dominant driver of subacromial space", and in the
`kinematics_before_load` principle that the paper "documented that impingement
risk rises when scap upward rotation lags shoulder flexion under load". No risk
was measured — no prospective arm, no incidence, no follow-up — and direction of
causation is open. **Suggested fix: reword to an association, drop "risk" and
"dominant driver", and label scap-first sequencing as an engineering choice
rather than an evidence-derived one.** This is a copy edit and it does not need
the paper in hand to be safe, because the weaker wording is true whatever the
paper says.

**`shea_morgan_1979`** (certain ×1). The finding is that random practice was
*worse* in acquisition and *better* on retention and transfer. There is no
blocked-then-random condition in the study, so it cannot support the programme's
"blocked first, random after" phasing (`weekly_template`: "contextual
interference applies from Week 3+"). The physio adds a sharper version: the
programme has no contextual-interference structure to justify at all — blocks run
in fixed order every session. **Suggested fix: narrow `used_for` to "contextual
interference exists" and label the schedule as engineering.**

**`wulf_shea_2002`** (certain ×1). The paper's thesis is that principles from
simple laboratory skills do not generalise — and sometimes reverse — for complex
skills. It is cited as *support* for the blocked-then-random structure, alongside
`shea_morgan_1979`. If the reviewers have the thesis right, the programme is
citing a paper and its own refutation for the same design decision. The coach
adds a separate, cheaper finding: `weekly_template` attributes external-focus cue
attachment to "Wulf & Shea 2002", which is the wrong paper — external focus is
`wulf_1998` / `wulf_2013`. **That attribution fix is actionable now.**

---

## Part 3 — Flagged by all three (13)

Consensus is the cheap signal. It mostly tells you a problem is *legible*. The
reviewers' own structural read is more useful than the list, so here it is first.

The 13 cluster into **three causes**, not 13 problems:

**Cause A — inherited from the handstand-walk whitepaper, no surface here.**
`sadowski_2021`, `difiori_2006`, `sands_2000`, `manske_2010`, and `bullock_2019`
by a different route. Each is cited for something this programme does not
contain: a press to handstand, wrist-loaded gymnastics work, a gymnastics
skill-readiness framework, a sleeper stretch, a rotational retest. Verified in
the data: the string "sleeper" appears zero times in `overhead-mobility.json`
outside the `manske_2010` `used_for` itself; `retest_metrics` has no rotational
measure; `drill_library` has no hand-support drill. `status_note` names the
provenance explicitly. **Pruning these five costs the programme nothing and
removes most of what was flagged.** This is the single highest-value action in
the document and it needs no papers.

**Cause B — laboratory motor-learning findings carrying dose and schedule
prescriptions.** `shea_morgan_1979`, `wulf_shea_2002`, `walker_2003`, and the
`karni_1998` + `walker_2003` pairing behind `daily_short_over_long`. Finger-
sequence and barrier-knockdown tasks are being extended into "10 min daily beats
45 min biweekly" for shoulder range, and into a pre-bed timing rule
(`block_daily_reset`: "sleep does the consolidation (Walker 2003)"). No paper
here compares those frequency schedules for a range-of-motion outcome, and
passive range gain is substantially a stretch-tolerance adaptation on a different
timescale. The physio notes the programme already flags its 10-week duration as
engineering but not this frequency rule, which is the more load-bearing
inference. **Fix by rewording and by extending `engineering_choices_flagged`, not
by deleting citations.**

**Cause C — cross-sectional association written up as causal or as risk.**
`ludewig_cook_2000` and `ludewig_reynolds_2009` (both stretched across
principles, phase rationale and session rationale — three claims resting on two
associative papers, which makes the scap-first rationale look doubly evidenced
when it rests on one body of work), plus `reinold_2007`. On Reinold there are two
distinct over-reaches: `session_rationale` asserts a light-load-versus-bodyweight
comparison "at comparable positions" that the reviewers say the EMG catalogue
does not run; and `no_ballistic_end_range` attributes to Reinold that "active
rotator-cuff engagement should precede end-range positioning. Ballistic
end-range invites impingement." All three call that attribution invented — the
paper addresses neither ballistic stretching nor end-range ordering. The rule
itself is sound coaching; it is simply uncited coaching. **All three also credited
the programme for already disclosing the EMG-is-not-outcome problem honestly in
`engineering_choices_flagged`.** That half is handled well.

`kibler_2013` and `kim_2013` sit slightly apart:

- **`kibler_2013`** — two findings. The SICK scapula construct is attributed by
  all three to Burkhart, Morgan & Kibler 2003 (Arthroscopy), not the 2010 BJSM
  current-concepts paper stored here. And no scapular screen is implemented: the
  only trace is an optional, unscored "wall-slide test video (optional) — watch
  for scap dyskinesis pattern" in `immediate_actions`, with no criterion and no
  consequence. Two reviewers went out of their way to say the earlier 2013→2010
  year correction on this entry was right and well caught.
- **`kim_2013`** — the structural half is independent of the paper: a goniometric
  reliability finding is established for a defined procedure with an instrument
  and a rater. The implemented test says "have someone measure the angle between
  your upper arm and the floor. Ballpark is fine". Reliability does not transfer
  across that change of method, and tier assignment runs on 5-degree bands off
  the resulting number. **Either specify the procedure or stop describing the
  metric as anchored on a reliability study.** Actionable without the paper.

---

## Part 4 — Contested (1). Presented as an open question.

Do not resolve by majority. A panel drawn from one underlying model has
correlated blind spots, so disagreement is where the information is.

**`karni_1998` — flagged by the overhead-sport-coach only.**

- *Coach (partly, likely):* the `used_for` line itself ("fast vs slow motor
  learning; consolidation window") is an accurate description of the paper. The
  problem is downstream: `session_rationale.why_daily_short` states "10 min daily
  > 45 min biweekly" and `daily_short_over_long` makes it a programming law.
  Karni is an fMRI study of a finger-opposition sequence in primary motor cortex.
  It says nothing about session-duration trade-offs and nothing about joint range
  of motion. Daily short exposure is defensible coaching — it is just not this
  paper's finding, and the 10-week duration is already correctly flagged as
  engineering while this dose claim is not.
- *Physiotherapist:* did not flag it. She placed the whole motor-learning block
  outside her domain and said explicitly that her read is that most of it is fine
  as narrow cue-and-structure rationale but "should not be carrying frequency or
  dose prescriptions, which is currently what it does" — which is the coach's
  objection, arrived at from the other direction and not recorded as a flag.
- *Researcher:* did not flag Karni; called the packet's narrow claim for it
  "accurate". He raised the identical dose objection under `walker_2003`
  instead: "the '10 min daily > 45 min biweekly' dose rule is not in either
  paper."

**The open question is not whether the dose rule is over-claimed — all three say
it is. It is where the defect lives.** The coach attaches it to `karni_1998`; the
researcher attaches it to the Karni+Walker pairing; the physio attaches it to the
programme's `engineering_choices_flagged` omission rather than to any citation.
The third framing is the cheapest to act on and does not require deciding which
citation is at fault: add the frequency rule to
`engineering_choices_flagged` and let both citations keep their accurate narrow
`used_for` lines.

---

## Part 5 — Prescription concerns. Needs a human; some parts checkable.

This is outside the citation brief and it is where the personas are least
reliable. It is also where the consequences are largest, which is an
uncomfortable combination. Split by what can be settled from the repo:

**Checkable in the data now (structural, no clinical judgement required):**

- The goal metric `shoulder_flexion_loaded_deg` is never measured — confirmed in
  1.9. Either measure it or rename the goal to the passive metric actually
  collected.
- The supine test defines 180° as "elbows touching floor", which is the
  mechanical stop of the position; Push-tier retest targets are 185 and 190, and
  `physical_test` accepts up to 200. Above ~180 in that position the additional
  angle comes from somewhere other than the shoulder. All three reviewers
  independently reached this. The programme's own `outcome_by_tier` concedes
  confidence is only "fair" near 190 because "structural ROM begins to dominate".
  Capping the supine scale at 180 is a data change, not a clinical one.
- Tier boundaries (160 / 165 / 180) and retest deltas (5°) sit inside the noise
  of the prescribed measurement ("ballpark is fine", self-reported). Widening the
  bands or changing the measurement — `signal_completeness` already proposes a
  wall-touch in cm — is a design decision available today.
- `reference_week_foundation` contains no active-flexion and no loaded-overhead
  work, all three tiers share one starting phase, and the Foundation
  `typical_outcome` nonetheless promises "first snatch-grip Sotts press" by week
  10. The mismatch is in the file.
- No load is prescribed anywhere ("light KB", "sub-maximal", "challenging but
  controllable"), while the one concrete number in the file — 24kg — sits in a
  Push-tier marketing field. Confirmed shape; whether it matters is a coaching
  call.
- `interference_hints.incompatible_with` is empty and nothing counts total weekly
  overhead exposure for a programme explicitly sold to run alongside another.

**Not checkable here — a clinician's call:**

Whether the snatch-grip Sotts press is safe as the *primary* loaded-overhead drill
from week 4 for a Foundation-tier user under 160°; whether the to-failure TGU hold
belongs at intake at all; whether `om_passive_bar_hang` at 3×30s fully relaxed,
5×/week, is appropriate before any active or scap-engaged hang stage; and whether
the adaptive response is too narrow (on a shoulder-pain day the engine drops
`block_loaded_overhead` only — passive flexion at 5×/wk, the daily reset at 7×/wk
and the bar hang all continue). Three reviewers converged on each of these. That
convergence is not evidence. Put them to a physiotherapist.

---

## Part 6 — Screening gaps. The one place I would act ahead of a clinician.

All three raised the same four, in almost the same words, and two of them are
verifiable in the data rather than clinical:

1. **`shoulder_pain_flexion` is collected and then does nothing.** Confirmed: the
   question ("Does anything hurt in the last 30 degrees of overhead reach?") is
   `required: true` at intake, and the id appears in no safety gate, no tier
   condition and no phase rule. `safety_gates` fires on exactly three things:
   `rotator_cuff_dx == yes`, `post_dislocation_recent`, `cervical_flare_recent`.
   Asking a question and discarding the answer is worse than not asking, because
   the intake reads as though it screened.
2. **Two declared contraindications have no gate.** Confirmed: five
   contraindications are listed in `evidence_base` (rotator-cuff tear, recent
   dislocation, cervical radicular, adhesive capsulitis, active AC-joint
   irritation); three have gates. The last two have neither an intake question nor
   a gate. Either add them or stop listing them as contraindications.
3. **`unsure` on the rotator-cuff question passes as a `no`.** Confirmed: the gate
   blocks only on `"yes"`. All three flagged it independently.
4. **No hypermobility / atraumatic-instability screen, and no prior-surgery or age
   question.** The only instability screen is a dislocation within 12 months. Two
   reviewers made the same pointed observation: the Push tier's entry condition is
   `shoulder_flexion_supine_deg >= 180`, so a programme whose sole product is more
   range preferentially promotes the presentation that should have been screened
   out. Whether that is right is clinical. That the gate cannot see it is
   structural.

Items 1–3 are data changes with an obvious conservative direction (route to the
existing physio-referral copy). I would still put them past a human before
shipping, because gating decisions change who is refused a product, but they are
the strongest thing this panel produced after Part 1.

---

## Weak findings, stated as weak

Honest accounting of what in here should not be actioned, and why.

- **`bullock_2019`, `kibler_2013` (SICK attribution), `manske_2010`,
  `sands_2000`, `difiori_2006` content judgements.** Every one rests on a
  reviewer's recollection of a paper none of them could retrieve, and four of the
  five carry search-string URLs precisely because nobody ever pinned the record.
  Their *structural* halves — the cited feature does not exist in this programme —
  are checkable and hold. Their *bibliographic* halves are unverified assertions
  from a model. The gymnastics run is the cautionary case: the panel's
  recollection-based prescription there was wrong on a real paper.
- **`sands_2000`** was marked `needs_paper` by the coach, who said plainly he
  would not assert what the paper contains. That is the correct posture and the
  other two reviewers did not adopt it.
- **The `wulf_shea_2002` reversal argument** is the most intellectually appealing
  finding here — a programme citing a paper and its own refutation — which is
  exactly why it should be checked rather than enjoyed. It depends entirely on
  the reviewers characterising the thesis correctly.
- **The whole of Part 5's clinical half.** Three AI personas agreeing that a
  drill is provocative is one model agreeing with itself three times. The
  reviewers said as much: the researcher explicitly deferred the passive hang,
  the Sotts press and the to-failure TGU to "a shoulder physiotherapist to
  confirm or dismiss".
- **Severity language throughout.** Reviewers marked five prescription concerns
  "high". Nothing in this repo justifies a severity scale applied by a model to
  clinical risk. Read those as "this one seemed important to the persona".
- **The flag rate itself.** 13 of 19 unanimous. Last panel: 30 of 41 unanimous,
  one survivor. If this run yields more, it will be because Part 1 was
  machine-checkable — not because the reviewers were better.

## Suggested order of work

1. `sadowski_2021` out of this programme's `references[]` — an `unverified` entry
   inside a `REVIEWED` programme (1.2).
2. Prune the five inherited handstand-walk citations (Part 3, Cause A). No papers
   needed; the programme loses nothing.
3. The cosmetic metadata set: `et al.` on five two-author papers, the
   `shea_morgan_1979` journal truncation, the `reinold_2007` source disagreement,
   the `wulf_shea_2002`→`wulf_1998` external-focus misattribution (1.5–1.7,
   Part 2).
4. Fix the five dangling `evidence_refs` and add the resolution check to
   `data-integrity.test.ts` (1.8).
5. Reword `ludewig_cook_2000` / `ludewig_reynolds_2009` / `reinold_2007` claims
   from causal to associative, and move the frequency rule into
   `engineering_choices_flagged` (Parts 2–4).
6. Resolve four search-string URLs to PMIDs — librarian task, unblocks the
   remaining bibliographic flags (1.3, 1.4).
7. Put Parts 5 and 6 in front of a physiotherapist. Nothing there ships on a
   persona's say-so.

Until at least 1 and 2 are done, `overhead-mobility` should not be presented as a
programme whose citations have been re-checked.


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
