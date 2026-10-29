# R2 design lead: set player main number, Done, guided figure

Principle: the big number is the thing the lifter changes between sets. Showing "0 kg" for work that has no kg is a lie; showing "x 1" for work measured in metres hides the prescription.

**B/C mechanism: add `logging` to exercises.json (enum), not scheme parsing.** Scheme text is free prose ("6 x 20 m heavy", "3x5 eccentric"); parsing it breaks the first time someone writes "2 x 40 m". The category test at DaySession.tsx:598 is a proxy that is already wrong. One optional field per exercise, default derived from category so nothing breaks:
`logging: "load_reps" | "bodyweight_reps" | "load_optional" | "distance_load" | "time"`. Replace the includes() at :598 with `isLoadable = logging in {load_reps, load_optional, distance_load}`. It is general coaching metadata (no personal language), so it passes data-integrity. A test asserts every strength/unilateral exercise declares one. Distance target comes from a new optional `item.distance_m` (number) on the program item, not from scheme text.

**Layouts (92px main number, Done below):**
- load_reps (squat, DL): `80 kg` big, `x 5` secondary; Done: `Done: set 2 · 80 kg`. Unchanged.
- bodyweight_reps (nordic_curl, hs_wrist_pushups, banded_march, copenhagen_short, single-leg work): main number is reps: `5` big, label `reps`. Done: `Done: set 1 · 5 reps`. No kg stepper; "Change reps" only (path already exists at SetView:1056). Eccentric cue stays in the title/cue line.
- load_optional (weighted pull-up, dip, split squat, Bulgarian, SL RDL): main `5 reps`, beneath it a quiet chip `Bodyweight` that becomes `+10 kg` once added; stepper opens from "Add weight" (not "Change weight"). Done: `Done: set 1 · 5 reps` or `· 5 reps +10 kg`. Default 0 is stored as null, never "0 kg". Engine TM inference only reads sets with weight > 0, so confirm-first is intact.
- distance_load (sled_push, farmer carries): main `20 m` big (from distance_m), load chip `x 60 kg` beside it; Done: `Done: set 1 · 20 m · 60 kg`. With no suggestion, load shows `Add load` (empty, not "0 kg"), Done still enabled (a bodyweight/empty-sled pass is valid). Stepper for kg only; distance steps 5 m in "Change".
- time (planks, holds): out of scope here; the timer path exists.

**Schema:** log set gets optional `distance_m`; weight_kg null already legal. Additive, no migration; old logs render as today.

**Sled with no kg suggestion:** do not invent one. Show "Add load" and let first-session logging seed the previous-weight suggestion. Prescription "heavy" stays text under the title.

**A (figure motion): guided player should loop the figure before Start.** Still-until-Start reads as a broken image (the founder asked if it was a bug), and the figure is the demo; the pre-Start moment is exactly when someone wants to see what to do. Looping before Start and during the work phase, pausing only in rest/paused, makes both players consistent. Respect prefers-reduced-motion: static pose in both players. Change getElapsed in FollowAlong.tsx:216 to run in the ready phase.

## Votes
- A (guided figure loops before Start): CHANGE (loop it; reduced-motion = still)
- B (sled: metres + optional load): BUILD (distance_load kind, `20 m` main number)
- C (Nordic: no "0 kg"): BUILD (bodyweight_reps kind; load_optional for weighted pull-ups/dips)
- Mechanism (logging kind vs scheme parsing): BUILD kind field; REJECT scheme parsing

Top 2: 1) logging kind on exercises.json replacing the category proxy at DaySession.tsx:598; 2) main number follows the kind (reps for bodyweight, metres for carries, never "0 kg").
