# Citation dimension — the three CITED programs (2026-09-02)

Second pass of the comprehensive audit. Structural integrity is machine-checked
by `data-integrity.test.ts`; this pass reads each `used_for` claim against what
the cited paper is actually about.

## Structural: clean

| Program | refs | cited | orphans | missing `used_for` | unresolved |
|---|---|---|---|---|---|
| first-strict-pullup | 21 | 21 | 0 | 0 | 0 |
| muscle-up | 22 | 22 | 0 | 0 | 0 |
| engine-builder-block-2 | 32 | 32 | 0 | 0 | 0 |

All ids resolve against `citations.json` (126 entries). No entry is listed and
uncited, none cited and unlisted.

**Not a defect, but worth stating:** every program in the catalog — REVIEWED ones
included — attaches `reference_ids` only at `evidence_base` level, never per
block or per claim. Claim-level citation happens in code (`HeroStateCard`,
proposal cards), not in the program JSON. So "every claim cites a paper" is
delivered by two different mechanisms, and the JSON half is bundle-scoped.
Consistent across the catalog; noting it so a future audit does not read it as a
gap in these three.

## Findings

### C-1 · `beattie_2014` does not support the claim it is attached to — P1

`first-strict-pullup` lists it as:

> "Forearm and grip strength training dose range and adaptation timeline.
> General support for the hang-ladder progression."

The paper is **"The effect of strength training on performance in endurance
athletes"** (Beattie, Kenny, Lyons, Carson) — a review of how strength training
affects running and cycling economy and VO2max. It contains nothing about grip,
forearm dose, or hang progressions.

Severity is P1 rather than P0 because the reference sits in the bundle and is not
attached to a specific prescription, so nobody receives wrong programming from
it. But the evidence page presents it as supporting the hang ladder, which is
false, and it is exactly the kind of claim the VERIFIED badge asserts has been
checked.

**Action:** drop it, or replace with a real grip/forearm endurance reference.

### C-2 · `vigouroux_2007` is stretched past what it shows — P2

Used for: *"Grip endurance and dead hang time as valid tendon-load measures.
Supports the 20-45s dead hang dose range."*

The paper is **"Estimation of finger muscle tendon tensions and pulley forces
during specific sport-climbing grip techniques"**. It supports the idea that grip
technique changes tendon loading. It does not establish dead-hang time as an
endurance measure, and it says nothing about a 20-45 s dose.

**Action:** narrow the `used_for` to what the paper shows (tendon load varies by
grip position), and source the dose range separately or state it as a coaching
convention rather than a cited finding.

### C-3 · `sinnett_2019` is described as EMG evidence — P2, needs verification

Both `first-strict-pullup` and `muscle-up` describe it as showing *"band-assisted
EMG in lat + lower trap is lower than strict"*. The title is **"The effect of
band-assisted pull-up training on muscular strength and pull-up performance"** —
a training-intervention study, not obviously an EMG study.

I cannot confirm from the metadata alone whether it also collected EMG. Flagged
rather than asserted. **Action:** verify against the paper; if it is not an EMG
study, rewrite both `used_for` entries.

## Clean

`engine-builder-block-2` (32 refs) reads as the strongest evidence base in the
catalog — specific effect sizes tied to specific prescriptions (Schumann's
SMD −0.28, Eddens' +6.91 %, Robineau's 6-hour separation, Ross's non-response
falling to 0 % at 75 %), each matched to what the paper actually reports.

`muscle-up` is clean, and notably honest where it is weakest: `sadowski_2021` is
labelled "the closest analog" rather than direct evidence, and `vidal_rovira_2024`
carries "small sample, flagged for founder science-advisory review" in its own
`used_for`. Citing a limitation in the citation is the behaviour you want.

`first-strict-pullup`'s motor-learning block (Wulf, Shea & Morgan, Karni, Walker,
Shea 2000, Henry, Proteau, Newell, Schmidt) is a standard, correctly-applied set,
including `wulf_shea_2002` cited *against* the program's own default as a caveat.

---

# Screen coherence dimension (2026-09-02)

## S-1 · A finished arc narrates an in-progress one — P1, fixed

`persona-muscleup` (day 60) and `persona-pullup-fast` (day 60) both render, in
this order, on Day:

```
Week 9 · random practice — order shuffled by the seed. Shea & Morgan 1979.
YOU FINISHED
Muscle-Up
8 weeks logged. Nice.
```

A week counter nine weeks into an eight-week program, explaining how today's
drills were ordered, above a card saying there are no more drills.

This is the class the 2026-08-18 handstand audit named as P0-2 — three
contradictory "where am I" summaries on one screen. Three guards were added to
`TodaySession` at the time, each suppressing a readout once
`isPastProgramEnd()` is true; one comment records the same symptom ("Today
showed 'Taper + test · week 1 of 3' alongside the graduation card"). The
contextual-interference legend was simply missed. It renders on
`generation_strategy === "multi_dimensional"` plus a start date, and nothing
else — so every multi-dimensional program shows it forever.

Scope is exactly the multi-dimensional programs: 10 personas reach a graduation
state, and only these two carry the legend.

**Fixed** by adding the same `!isPastProgramEnd(...)` guard the neighbouring
three already use.

**Guarded** in `personas.spec.ts`: any persona whose Day capture contains
"YOU FINISHED" must not also contain a week/phase readout. Asserted on the
artifact rather than in a unit test because the defect is two independent
branches each independently deciding to render — only visible once the page is
assembled.

---

# Intake dimension (2026-09-02)

## I-1 · The intake promised programming changes it never made — P0, fixed

Three required questions carried help text written in the first person, present
tense, read by the user while signing up:

- `first-strict-pullup` / `shoulder_pain_overhead`: *"If yes, we bias the plan
  toward closed-chain scap work and defer heavy dead hangs."*
- `first-strict-pullup` / `elbow_tendon_pain`: *"If current, we defer heavy
  negatives and use scap-focused work first."*
- `muscle-up` / `elbow_tendon_pain`: *"If current, we defer ring dip work and
  use band-assisted dip only."*

Nothing read the answers. The single occurrence of `shoulder_pain_overhead` in
the source is a set deciding which visual section of the intake form it renders
in. So a user with current medial epicondylitis — the injury a pull-up program
is most likely to aggravate — answered "currently symptomatic", was told the
loading would be deferred, and was then scheduled it.

`contraindications` exists on the store but only feeds the report and the data
export; nothing filters exercises by it. There was no mechanism at all.

**A false-methodology note on my own first pass:** I initially grepped `src/`
for each question id, found zero references for the cardiac screening questions
in `engine-builder-block-2`, and nearly reported them as ignored. They are not —
`intake.safety_gates[]` is a generic, data-driven hard block, so ids correctly
never appear in source. Block-2 gates all three of its cardiac questions
properly. Checking the mechanism before believing the grep is what stopped a
false P0.

### Fix

- **`intake_exclusions[]`** on the program, applied as the final pass in
  `composeBlockForUser` — after both the slot-composed and authored-item paths,
  because the drill library selects by capability and would happily reintroduce
  a movement the user was told would be deferred.
- **Substitution, not deletion.** Each rule names what takes the deferred
  movement's place, inserted once at the position of the first item it replaces.
  "Defer ring dip work" that merely removes three items hands the user a thinner
  session with no explanation.
- **`mu_band_assisted_ring_dip` authored** in the shared library. The muscle-up
  copy promised a movement that did not exist in `exercises.json` — the deferral
  could not have been honoured even with a mechanism. Written with general
  coaching copy per the shared-library rule.
- **The reason is shown**, as an "Adjusted for you" note on the session brief. A
  substitution the user cannot account for reads as the plan being wrong rather
  than the plan listening, and confirm-first only means something if the user can
  see why the plan looks the way it does.

### Guards

- `intake-exclusions.test.ts` — 10 cases: fires on the right answer, silent on
  the others and on a user who never completed intake, substitutes once, keeps
  position, does not duplicate a movement already programmed, drops cleanly with
  no substitute.
- `data-integrity.test.ts` — 7 cases, each closing a way a rule could silently
  never fire: an unresolvable exercise id, a `question_id` matching no question,
  and — the subtlest — a `when_value_in` value the question can never produce.
  Booleans are stored as `"true"`/`"false"`; a rule written against `"yes"`
  would parse, validate, and never once match.
- **Harness** — `Persona.intakeAnswers` now seeds `program_states[].intake_answers`,
  and `persona-pullup-elbow` answers `elbow_tendon_pain: "current"`. Before this
  no persona supplied intake answers at all, so `activeExclusions` always
  returned empty and a broken rule was indistinguishable from a working one. The
  spec asserts the deferred movements are absent from the captured session, the
  substitute is present, and the reason is on screen.
