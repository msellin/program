# Lane r2: handstand family (2026-10-29)
- hs_wrist_pushups_floor: new `wristback` figure (kneeling, backs of hands down, fingers toward the knees, hand pivots up 0 -> 65 deg
  over 3 s, 1 s back, body static, palm tick); mapped in exercise-figures.ts. wristprep no longer used for it.
- wristprep/fingerraise/downdog/child: unchanged. wristprep already holds p=1 for 22% of the cycle (1.3 s dwell at max travel);
  hip travel with the shoulders not added (L). downdog/child get only the renderer's breath.
- wallhs/_90/_lean: wallhs gets a +-0.5 deg toe-press sway from the clock `t` (3.2 s). wallhs_90 lean 22 -> 27 (gap to wallhs ~21 deg,
  to lean 45: 18 deg; ladder monotonic).
- wallhs_shrug: rise 9 -> 13 px (21% of the 62 arm, arms stay 62), head sinks 18 -> 11 px from the shoulders, shoulder segment in accent.
- wallhs_taps: tap point 10 -> 12 px past the shoulder (clearly at shoulder height).
- hsfree: second harmonic (0.75 deg, 3 cycles per loop, from `t`) on the sway; loop still closes.
- hstuck: knees close in the first 40% (knee < 60 while hip still > 150, shin ~31 from vertical), hips fold from 30%: transit is a tuck, not a pike.
- hswalk: arm elbow min 134 -> ~171 (hand lifts via a free-side shoulder elevation of up to 7 px; arm stays ~straight);
  hips drift +3 px per step with the lean (lean now 1-6 as hips + tilt); legs scissor +-7 -> +-12. Opposite-hip counter drift not
  added (animator's +3 px toward the step used instead).
- kickup: front knee 129 -> 112, hands 6 px forward, arm start angle -110, push foot under the hip (x 120 vs hip ~127), 6 px
  countdown dip before the kick (p 0..0.05, released by 0.09). Trunk now ~83 from vertical: the biomechanist's ~68 is geometrically
  inconsistent with knee 112 (hip height >= 100 vs shoulder 108 forces trunk >= ~80); the knee target was taken, trunk not.
  Swing leg already decelerates (drive curve ends at zero velocity).
- wallwalk: start with the feet 14 px (~18 cm) up the wall, trunk ~70; each of six steps moves ONE pair while the other is planted
  (feet first with the hips piking, then the hands walk in; hands first once |dy| would grow); hip from IK (pike up); a test asserts
  hands and feet never move in the same 20 ms. End trunk 20.
- Tests: rig-handstand.test.ts (updated shrug range, kickup knee 105-120; +5 r2 tests). rig.test.ts untouched.
