# SR-panel §C — context

Status: **three items closed, 739 tests.** Not yet deployed at time of writing.

## The headline: CSM was never a clinical concern

§C recorded it as "CSM block note contradicts its own items" and filed it as
a coaching judgement nobody could action. **It was a one-line rendering
defect**, and it had been shipping to every CSM user.

`MAINTENANCE_BLOCK_PCTS` (`suggest.ts:128`) handles CSM's two strength blocks
and returned `top_set` + `fsl:{sets:5}` with no `straight_sets`. `rowCount` is
`fsl.sets + (straight_sets ? 0 : 1)`, so a 5×5 rendered SIX rows and a 5×3
rendered six as well.

That is the identical defect the founder hit on his own front squat day
(2026-09-03, "the front squat weights for all 1 + 5 sets in app showed the
same, 77kg"). That fix added the flag to `VOLUME_BLOCKS` and `VARIANT_BLOCKS`
— both holding `anterior-hip-rebuild` ids only. **The CSM branch sits ten
lines above them, in the same function, and did not get it.**

## Two wrong turns worth recording

1. **I nearly shipped a dead key.** Before finding the maintenance branch I
   had added a declarative `prescription: {sets, reps, pct_tm}` field to
   `blockItemSchema`, on the theory that the engine ignored CSM's authored
   schemes entirely. It does not — `MAINTENANCE_BLOCK_PCTS` honours them.
   The field had no consumer, which is precisely the defect class this repo
   keeps producing, and I would have introduced it while fixing an instance
   of it. Reverted.
2. **I flip-flopped in front of the founder.** Claimed six sets → "corrected"
   myself to say CSM never reaches that path → confirmed the original claim.
   The middle step came from reading the fall-through and stopping before the
   branch above it. Both the claim and the correction were made before
   checking.

## What changed

| File | Change |
|---|---|
| `lib/engine/suggest.ts` | `straight_sets: true` on the maintenance branch |
| `lib/engine/straight-sets.test.ts` | 4 cases across both CSM blocks; mutation-tested |
| `programs/handstand-walk.json` | Deliberate falls now require a crash or folded gymnastics mat; a thin yoga mat is explicitly NOT enough, with wall bail-outs named as the fallback |
| `programs/rowing-2k-test-prep.json` | Day-1 2K note now tells a novice to do two technique sessions first, and says why: a maximal effort is where a novice sequence breaks down, and erg low-back pain is technique-driven |

Reviewer packets regenerated (freshness test caught them, as designed).

## Still open, and why

- **CSM's block note still describes a 5/3/1 session that does not exist**
  ("3 warm-ups + top set + FSL 5×5 @ 65%" against items of 5×5 @75% and 5×3
  @78%). The engine now honours the ITEMS. Which of the two is the intended
  prescription is a programming decision — flagged, not guessed.
- **Rowing's fix is copy, not a gate.** `erg_familiar: "novice"` is collected
  and nothing reads it. The proven `intake_exclusions` mechanism excludes
  EXERCISE IDS, and rowing's blocks are note-only cardio with no items — so a
  real gate needs block-level gating machinery that does not exist. Building
  it is a feature, not a fix. Confirm-first means an instruction is a
  legitimate mitigation, but it is weaker than a gate and should not be
  recorded as equivalent.
- **pull-up Tier B 18 eccentrics** and **muscle-up false-grip from Tier A**
  remain the founder's: a volume number and a tier gate.
