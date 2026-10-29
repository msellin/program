# Lane r3, strength (2026-10-29). Code: next-app/src/lib/figures/rig.ts, tests in rig-strength.test.ts

- bridge2 (S&C 7): the coach's route was TRIED numerically and is not reachable, so the geometry is unchanged
  (top hip 179 / knee 84 / shin 15, label and align cue stay honest). With the shoulder on the floor, trunk 78 vs
  thigh 66 / shin 62, and the existing "hip never above the shoulder-knee line" test (safety), hip 170 gives
  knee 76-79 at shin 12-16, or knee ~70 at shin ~8; knee 88 needs shin ~24. Every pair is worse overall than 84/15.
  Owner decision stays: change segment lengths, or accept 8.
- hipthrust (8): start trunk 58 -> 50 (th 32 -> 40). Bottom hip 113 -> 100 (norm 95-105), bottom knee 82, bottom
  shin 22 -> 31 (feet planted, hips sit nearer them); top unchanged (hip 179, knee 95, shin 6).
- goblet (8): the existing 0.55 s bottom pause now shows intent: the arm opens 5 deg about the shoulder (35 -> 40,
  elbow and bell travel ~2 px toward the knees), eases back in the first 0.08 of the rise. Depth unchanged.
- sled (8): swing-foot lift 8 -> 10 px, local to the sled (carryGait untouched, carries keep 6); max shin still < 62.
  Test limit moved 9 -> 10 px, plus a floor of 9.5 so it cannot regress.
- suitcase/farmer (8): sway multiplier 2.8 -> 2.0 (+-7 -> +-5 px; "always a foot down" and single-support tests pass).
  Shoulder level verified: loaded and free shoulders share one y at all times (0 px, within the <= 2 px ask);
  free arm hangs ~4 deg off vertical, the 25 deg tuck was not added.
- nordic (illustrator H): poster 0.7 -> 0.5 (trunk ~45 deg). The in-app tile and thumb use the poster; the review
  sheet's "Today tile" samples a frame at 4240 ms, so it still looks flat there: a sheet artifact.
- splitsquat clutter: not changed (dumbbell is already the grey prop; badge size and bench contrast live in shared
  Scene helpers). Open.
- No overshoot anywhere; bridge/thrust no-extension test passes.
