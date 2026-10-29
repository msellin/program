# Lane note: handstand family (2026-10-29)

Base: this worktree was cut before the shared helpers (ARM80, TEMPO, `gait`, `Scene.ground`) existed in git; I copied the
main checkout's uncommitted `rig.ts` / `rig.test.ts` in first; the single commit therefore contains those shared changes plus my builders.

- wristprep/fingerraise (`wristFig`): arm 52 -> ARM80 62, hip/knee proportions 41/56 instead of 52/98 trunk. Shoulder travel
  now 11 px (10 deg of arm) past the wrist (was ~23 px, 26 deg); hip 109 -> 126, trunk held ~74. Fingers lift 30 -> 40 deg
  (longer 14 px finger segment, palm stays down); 1 s up / 1 s hold / 1.5 s down. Not fixed: hs_wrist_pushups_floor is
  palms-up backs-of-hands loading in exercises.json (not a body push-up), so the rock is wrong for it: unmap it in
  exercise-figures.ts (shared file, not mine).
- downdog: leg 119 -> 80; trunk line 40 deg above the floor (50 from vertical), arms+trunk one line, head hangs between arms.
- child: arms ARM80, head resting low ahead of the shoulders. Hip/knee/trunk unchanged.
- wallhs: arms ARM80 (46 -> 62), chest-in 6 deg kept. Toe-press sway not possible: a hold only receives p (one 0.9 s ease), no clock.
- wallhs_90 / wallhs_lean: the exercises (Kinoshita 90 / 135) are defined by HIP angle with feet on a box in
  exercises.json, not by trunk lean; ids untouched, figures are the wall-incline approximation. Lean 15 -> 22 and 38 -> 45, all
  at the same hand x so the ladder ghost aligns; labels rewritten ("first step", "steeper step"). Ladder 6 -> 22 -> 45.
- wallhs_shrug: body rises 8 -> 9 px (15% of the arm) with a drawn shoulder-girdle segment, arms stay 62 (test), 1 s / 0.5 s / 1.5 s.
- wallhs_taps: now `move2` (arms alternate, as the label says); work arm elbow 178 at start -> 19 at the tap (was 147), support arm
  locked at 62; shoulders shift +3 deg (trunk 6 -> 9) before the hand leaves. Lateral shift is not drawable from the side; the
  3 deg forward press is the stand-in. ~1 s out, 0.5 s hold, 1.3 s back.
- hsfree: fingertips press 1.2 px at the sway peak (heel lifts).
- hstuck: hip 180 -> 65, knee 180 -> 35, shin 34 deg from vertical (was 105 / 30 / 72); knees close first, hips fold after; the line
  leans back 4 deg so hips stay over the hands.
- hswalk: lean 1 -> 6 deg at each step (was constant 2), step 18 -> 24 px, legs scissor +-7 deg, arms ARM80 with shoulder height
  from the planted arm; ground marks scaled with the step (scroll 24/0.55, test passes). Free arm bends to 134 at the lift (side-view
  projection of a hand 5 px off the floor); not eliminated.
- kickup: now a `gait` cycle (so the way down differs from the way up). Lunge start: front knee 129, swing leg 25 deg under
  horizontal behind; trunk 76 from vertical (target 45-60 unreachable: straight 62 px arms put the shoulder at 106, the leg reaches
  hip height <= 94). Kick 0.54 s, stack 1.35 s, step-down with legs together, push leg lands as front foot; loop closes exactly.
- wallwalk: start trunk 71 -> 64 (target 80-88 impossible with a 62 px arm and a 136 px body); six steps of 0.4 slot move + pause;
  end trunk 20.
- Not changed: rig.test.ts. Tests: rig-handstand.test.ts (8).
