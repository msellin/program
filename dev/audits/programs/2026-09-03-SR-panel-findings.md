# Simulated specialist panel — verified findings (2026-09-03)

**No human has reviewed any Terav program.** SR-1..SR-4 are simulated
reviewers (`dev/audits/reviewer-personas/`). Recorded as agent reviews. None
of this may populate `specialist_review` or move the "no outside specialist
has signed off" sentence on /programs.

Four packets, four reviewers, **all four returned "do not ship until fixed"**,
each scoped narrowly to screening.

Everything below was checked by the orchestrator against the shipped JSON
before being recorded. Claims that could not be checked are listed separately
and were NOT acted on.

---

## A. The systemic finding: screening collects answers nothing acts on

Verified by script across the catalog.

**11 documented contraindications, across 7 of 9 programs, have no intake
question that could detect them.** The authors decided those people should not
be here; nothing asks.

| program | undetectable contraindication |
|---|---|
| first-strict-pullup | Persistent cervical radiculopathy — "avoid dead hangs **entirely**" |
| first-strict-pullup | Uncontrolled hypertension with Valsalva concern |
| muscle-up | Persistent cervical radiculopathy — "avoid dead hangs and false grip" |
| muscle-up | Uncontrolled hypertension with Valsalva concern |
| handstand-walk | Recent concussion or vestibular disorder |
| handstand-walk | First-trimester pregnancy |
| overhead-mobility | Adhesive capsulitis |
| overhead-mobility | Active AC-joint irritation |
| CSM / EB-block-2 / rowing | First-trimester pregnancy (each) |

**The two worst:** dead hang is the Tier A backbone of `first-strict-pullup`,
and its own file says a radiculopathy user must avoid it entirely — with no
question that could find them. `handstand-walk` opens with a week of
deliberate falling from inversion and never asks about concussion.

### Plus: questions asked whose answers change nothing

- **`engine-builder.joint_issue_severity`** offers the option
  **"Limits all cardio — see a clinician before starting"** and does not
  block. The option's own label tells the user to see a clinician, then
  enrols them. Verified verbatim.
- **`handstand-walk.wrist_pain_12mo`** — no gate, in the program whose own
  cited survey reports 56.7% chronic wrist pain.
- **`overhead-mobility.shoulder_pain_flexion`** — no gate (SR-1, already
  recorded).
- **`hypertension_unmanaged: "unsure"`** passes on five programs.
- `rotator_cuff_dx: "unsure"`, `osteoporosis_dx: "unsure"`,
  `hypertension_uncontrolled: "unsure"` — all pass.

**Shipped guard:** `data-integrity.test.ts` baselines every gap so new ones
fail and fixed ones must be delisted. **`severity: "warn"`** now exists
(`lib/engine/safety-gates.ts`) so the founder's answer to each "unsure" can be
*warn-and-record* rather than the previous forced choice of block-or-silence.
**Which gate gets which severity remains a clinical decision, unmade.**

### Missing entirely from every program

- **Beta-blockers / rate-limiting medication.** SR-3 and SR-4 independently
  called this their first fix. Both engine programs, CSM and rowing prescribe
  HR-anchored targets up to 90-95% HRmax. On a beta-blocker those targets are
  unreachable, and both HR retest metrics read as non-response for the whole
  block. It invalidates a prescription rather than merely under-serving it.
- Family history of sudden cardiac death under 40; known arrhythmia.
- Age — no program asks, while two prescribe from age-derived HR formulas.

---

## B. Verified content defects

- **`engine-builder` promises a Block 3 that does not exist.** Four
  references, including user-facing outcome copy: *"Bigger gains come in Block
  3's polarised phase."* The manifest ships nine programs; there is no block-3.
- **`rowing-2k-test-prep` has no test-day pacing plan.** No split plan, no
  stroke-rate plan, no drag-factor rule, no warm-up protocol — verified by
  search. The whole test-day instruction is *"Full 2K. Warm-up + all-out
  effort + cool-down."* Meanwhile the progression tier's promised outcome is
  **"Split consistency across all four 500s"** — nothing programs it, and
  `row_2k_time_seconds` records only the total, so nothing measures it.
- **The rowing taper contradicts itself.** The phase goal says "volume down
  40-50%, intensity held"; `block_replacements_final_week` replaces race-pace
  with easy recovery for the final 7 days. That is not a taper, it is a
  mini-detraining week.
- **`rowing-2k-test-prep` offers `days_per_week: 2`** while
  `session_count_per_week_range` is [4,5], and the help text promises "we'll
  tell you upfront whether this program can deliver at that dose."
- **Rowing `symptom_regions` omit the ribs** — rib stress injury is the second
  signature rowing injury and presents insidiously.
- **The Sadowski citation contradicts itself across two programs.**
  `handstand-walk` flags the attribution and says the 3× bodyweight figure
  should not be cited; `muscle-up` cites exactly that figure. Both ship.
- **`engine-builder`'s primary retest metric does not measure what it claims.**
  `submax_hr_pace5_bpm` resolves to `runs[].avg_hr where intensity == 'easy'`
  — no pace anchor, because the log has no pace field. It is the average HR of
  whatever the user labelled easy. SR-3: the claimed 8 bpm effect sits inside
  the instrument's noise band, and an improving user who simply goes faster on
  easy days reads as a non-responder. **43 citations, and none is attached to
  this metric.**

---

## C. Prescription concerns — clinical, NOT actioned

Recorded for the founder. Each is a coaching judgement.

- **first-strict-pullup Tier B eccentric volume** (SR-2's hardest-defended
  finding): 18 max-effort eccentric reps for someone who cannot yet do one
  rep, with `elbow_tendon_pain: "resolved"` treated as a clean entry.
- **muscle-up false-grip hangs from Tier A**, which admits "never tried".
- **handstand-walk deliberate falls** prescribed onto "thick yoga mat OK".
- **rowing day-1 maximal 2K** available to self-declared erg novices, taught
  technique afterwards.
- **CSM block note contradicts its own items** (FSL 5×5 @65% vs 5×5 @75% +
  5×3 @78%), and schedules a Wednesday lift 24h before a 4×4 while declaring
  `hard_day_separation_h: 48`.
- **Terminology**: "impingement" is deprecated (JOSPT 2025 → rotator
  cuff-related shoulder pain); scapular-dyskinesis-as-cause is contested.
  SR-1 and SR-2 independently flagged it. Both say the drills are broadly
  reasonable and the story told about them is out of date.

## D. Not verified — needs the papers

`kim_2013` (overhead-mobility's retest anchor), `kinoshita_2022` (missing DOI,
underwrites a whole handstand phase), `baker_2025_review`, `sands_2000`,
`astorino_2013` (SR-4: the 3-6% threshold-shift promise rests on it and three
things may be wrong at once), `eddens_2018`, `konopka_2014`, `brandt_2025`.

## E. The method finding, from three of four reviewers independently

SR-1, SR-2 and SR-4 each said the packet was too abstract to answer the
questions it asks. SR-2 put it hardest: *"A real reviewer, sent this and
nothing else, would tick 'no concerns' on question 2 in good faith and would
be wrong."*

Partly fixed the same day — the packet now prints every intake question, what
each answer does, and the documented contraindications. **Still missing: the
drill library with actual sets and reps.** SR-2 could not answer "would you
prescribe this?" without opening the JSON, and neither could a human.
