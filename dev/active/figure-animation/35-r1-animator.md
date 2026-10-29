# 35 Rescore 1, animator lens (2026-10-29)
Evidence: strips squat/deadlift/sled/farmer/hswalk/kickup/pullup/deadbug/hipflex/slrdl/roller/rowincline read (frames small, motion judged from 20-frame samples); sheets 02 and 09 read; the other sheets and lane notes read for numbers. Figures not in a strip are scored from lane numbers and rig logic, so cap 8.
Earlier: 01 scored the rig 5.5 (now), 06 gave 7.5. Open nits from 06 (toe-off ease stop, no arm swing in gaits): arm swing is still absent in sled/farmer/suitcase/amarch; toe-off ease status not re-measured, see M below.

## Scores (human-like / step-by-step, 1-10)
- Strength: squat 8, frontsquat 8, goblet 8, airsquat 8, deadlift 8, bridge2 7, hipthrust 7, splitsquat 7, slrdl 8, nordic 8, sled 7, suitcase 7, farmer 7, pallof 7
- Rehab: hipflex 7, adductor 7, adductor_ext 7, bridge 7, deadbug 7, kneel 7, ninety 7, pullover 8, roller 7, hollow 7, hollowpull 8, hollowtuck 7, amarch 6, legswing 7
- Pull: hang 7, pullup 8, pullup_single 8, pullup_slow 8, pullup_band 7, pullup_band_light 7, pullup_partial 7, pullup_negative 8, pullup_negative5 8, pullup_top 7, pullup_mid 7, scappull 7, activehang 7, rowflat 7, rowincline 8, rowfeet 7, pullapart 7
- Handstand: wristprep 7, fingerraise 7, downdog 7, child 7, wallhs 7, wallhs_90 7, wallhs_lean 7, wallhs_shrug 7, wallhs_taps 7, hsfree 7, hstuck 7, hswalk 7, kickup 8, wallwalk 7
Mean ~7.3 (was ~5.5 to 7.5 across rounds). Nothing is a 10: all are side or front stick figures with no secondary motion; see the shared items.

## Shared (apply to most figures)
- [H] Reset cut on looping non-gait moves (pullup_negative 10 s lower then a 7 ms cut to the top; same for pullup_single, kickup seam at the stack) → a visible pop every loop. The lane says it needs an opacity hook in drawFigure. Reasoning holds for a fade; an alternative inside `build`: end the cycle with a 0.4 s "release" (lowering to dead hang, a short hold) so the start pose equals the end pose and no cut is needed. Target: seam position delta < 1 px.
- [M] No arm swing or counter-rotation in any gait (sled, farmer, suitcase, amarch, hswalk): arms are locked at 62-67 px, trunk stays rigid. Farmer/suitcase are loaded, so a locked arm is right; amarch needs a +-12 deg arm swing opposite the leg.
- [M] Toe-off/touchdown on swing legs still start and end at zero velocity (06 nit, rig.ts stride()): in the sled strip the trailing foot looks parked then jumps. Target: swing speed at both ends equals stance speed (about 3 px/frame at 30 fps).
- [M] Phase beats (item 4 of 01): rest, effort, hold, return still look the same apart from the tempo. Target: one 150 ms dwell and an arrow pulse at each key on the loaded lifts and the pull family.
- [L] Breathing holds are 0.8 px, so they read as life only at tile size. Keep it; do not raise (06).

## Per-figure items below 10 that are not just the shared ones
- [M] squat family: sticking point now visible, the bottom is a 0.10 cycle hold, but the hip-lead looks like a slide at 4-5 frames out of the hold (strip rows 3-4: shoulder and hip rise together). Target: hip rises 5-8% of the way before the shoulder on the ascent.
- [M] deadlift: setup to pull is fine; lockout reads as a stop rather than a finish. Add a 150 ms hold at lockout and a 4 px shoulder settle. Bar path now vertical, good.
- [M] sled: legs drive well after the lane (knee to 178) but a 2-leg scissor at 0.55 s is a very fast trot for a heavy push. Target: ~1.0 s per step; the ground ticks should then scroll at the same px/s as the stance foot (they look right now).
- [M] farmer/suitcase: 0.55 s per step with +-7 px sway is credible; feet in front view drift apart to 20+ px in the strip at mid-swing. Target: swing foot lift 6 px, not a sideways slide.
- [M] hswalk: step 24 px with +-7 deg scissor reads as a wobble more than a step. Target: the weight shift over the planted hand visible by frame 2 of each step (lean 6 deg is there; add hip x +3 px).
- [M] kickup: a gait cycle, good; the 0.54 s kick leaves no anticipation (the lunge dip). Target: 120 ms countdown dip 6 px before the kick. Lane's lunge 76 deg trunk is a geometric limit; accepted.
- [M] pullup family: ARM80 and scap start read right; the head crossing the bar line is geometric (front view), accepted. Top has no hold beat in pullup (a 0.3 s pause at chin-over would mark the phase). pullup_top/mid are single poses with breath only, so 7.
- [M] deadbug: leg extension only 36 deg wider than before; in the strip the extending heel moves about 20 px, easily missed at tile size. Target: add the opposite-arm reach timing 100 ms ahead of the leg, and a 0.5 s hold at the tap.
- [M] hipflex / kneel / adductor: small ranges (hand fixed, thigh 3 deg) read as nearly static at 56x40. Accepted for safety (hip never past 90). Use the arrow pulse to mark the effort (see shared M).
- [M] roller: now the upper segment turns, but the roller ball stays put under the shoulder blades; real use rolls it 5-8 cm up the back. Target: ball x travel 6 px opposite the trunk extension.
- [M] rowincline / rowflat / rowfeet: elbow goes back along the ribs, correct. Chest reaches the rings, head drawn ahead of the rings at the top; fine. Missing: a 0.4 s squeeze at the top.
- [M] wallhs_taps: alternating taps and 3 deg press stand in for the lateral shift (not drawable from the side); judge holds. Alternative: tilt the head 4 px toward the support arm in the front view version if any exists.
- [M] hstuck: knees close first, hips fold after, good order. Entry has no counterweight shift; add a 3 px hand-to-shoulder lean.
- [L] pallof: press now travels 35 px with a fixed anchor, band thins; return is the same duration as the press (3 s); a Pallof should resist rotation, so add a 1.5 s hold, already ~2.2 s, OK.
- [L] nordic: lowers 3.9 s to 85 deg, the return is shown as a fast pull up (reads as hand-assisted, which is the right regression). Okay.
- [L] amarch (lowest, 6): the leg lifts to hip height and the arm swings, but march pace has no knee-drive snap and the stance heel stays flat (lane skip is valid, leg length fixes ankle height).
- [L] pullover/hollowpull: monotonic arm, 3 s out / 3 s back, good.

## Unreachable, judged
- Deadlift knee 110-130, bridge/hipthrust knee 90-110, hipflex hand motion, legswing flexion 30 not 35-40 (rig.test.ts asserts 59.5 deg thigh): all geometry or safety, reasoning holds; not counted.
- Kneel hip travel 8 px: holds; the brief intent (visible hip drive) is met by the front-knee 111 to 97 change.
- Toe-press sway in wallhs: build gets only p; the intent can be reached by a cosine wiggle on p in the breathing code (hold gate `!reduced`).
