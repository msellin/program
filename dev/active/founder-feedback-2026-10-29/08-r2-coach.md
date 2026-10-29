# R2 coach lens (S&C coach)

Finding: `exercises.json` already carries the shape in `default` (`distance_m`, `hold_seconds`, `reps`, `tempo`). The kg counter keys off `category` only, so the data is there and the UI ignores it.

**A. Figure motion before Start (guided).** CHANGE: loop it. A still figure on a "Watch demo" tile reads as a photo, and the lifter is deciding between "watch" and "go". Looping a slow demo is the demo. On Start, the loop should reset to rep 1 and sync to the work clock. Keep it still only under reduced-motion. Set player already loops; make both consistent.

**B. Sled push/drag.** The lifter needs: distance, load on the sled (plates + sled weight, gym-specific so never a suggestion from the engine), and last time's load. Set screen: main number `20 m · 40 kg`, tiles `Set 1 of 6`. Done button: `Done — set 1 · 20 m · 40 kg`. Secondary: `Change load`. Distance comes from `default.distance_m` (plan text "6 × 20 m" confirms it), editable in 5 m steps. First time: load starts blank, shown as `— kg`, not `0 kg`, with the helper line "Load depends on your sled: note what you pushed". Never propose a TM-based number (no max exists for sleds). Later sessions: prefill last logged load; progression is the lifter's call (or a confirm-first "+5 kg?" after clean sets).

**C. Nordic curl.** 0 kg is meaningless and wrong. Bodyweight eccentric: main `5 reps`, Done `Done — set 1 · 5 reps`. Under it a one-tap regression chip row, since the exercise name already offers them: `Full · Band-assisted · Slider/GHR`. Log the variant (it is the real progression signal), not a load. Optional "assist" belongs on the band variant, not kg. Cue the lifter on the thing that matters: lower as slowly as you can, 3-5 s, catch yourself with hands.

**Mechanism (smallest correct).** Add `logging` to each exercise in `exercises.json`: `load_reps | bodyweight_reps | added_load_optional | distance_load | time_hold | time_load`. Default it from existing `default` keys in code (distance_m -> distance_load, hold_seconds -> time_hold) and set explicit values only where the heuristic is wrong. Do NOT parse the plan's free text: the plan's scheme is prose, the library's `default` is structured and already agrees. `isLoadable` becomes `logging !== bodyweight_reps/time_hold`. A test asserts every loadable-category exercise has a kind.

**Library scan (category strength/unilateral but not plain load x reps):**
- distance + load: `sled_push` (20 m), `farmer_carry` (30 m), `pu_farmers_carry` (30 m).
- bodyweight reps: `nordic_curl`, `hs_wrist_pushups_floor`, `hs_wall_supported_shrugs`.
- time hold: `copenhagen_short` (15 s per side, plus a lever not a load).
- band/bodyweight (no kg): `banded_march_standing` (band colour, not kg).
- added-load optional (0 = bodyweight, show `BW`): `split_squat_rfe`, `single_leg_rdl`, `bulgarian_split_squat_db` (DB load per hand), `pu_dumbbell_row` is genuine load.
- bodyweight base, `+kg`: `weighted_pullup`, `dip_weighted` (label `+10 kg`, 0 = `BW`).
- genuinely load x reps: the barbell lifts, goblet squat, lat pulldown, hip thrust, trap-bar, RDL, rows, presses.

Peers: Hevy and Strong ship exactly these types (weight+reps, bodyweight, weighted bodyweight, assisted, duration, distance+duration). Idea source only.

**Votes:** A CHANGE (loop before Start) · B BUILD (distance + load, blank first load) · C BUILD (bodyweight reps + variant chip) · mechanism BUILD (`logging` kind in exercises.json).
**Top 2:** 1) `logging` kind driving the counter, Done label, and the `0 kg` removal; 2) distance field on sled/carries with last-load prefill and no engine-suggested sled load.
