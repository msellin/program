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
