# 33 Rescore 1: hand-balancing coach (handstand family)
Evidence: angles.md (regenerated), sheets-all/sheet-05..07, 23-lane-handstand.md. Earlier file: 13-trainer-handstand.md.

## Scores (was -> now)
wristprep 7->7 | fingerraise 7->8 | downdog 8->9 | child 8->8 | wallhs 8->8 | wallhs_90 6->7 | wallhs_lean 7->8
wallhs_shrug 6->7 | wallhs_taps 6->8 | hsfree 8->8 | hstuck 6->8 | hswalk 5->7 | kickup 6->8 | wallwalk 6->7

## Mapping question: hs_wrist_pushups_floor
- [H] Do NOT keep `wristprep`. exercises.json describes palms-UP, backs of hands on the floor, pushing onto knuckles/palms; the figure is palms-down, shoulders rocking over the hands. It shows a different exercise (hs_wrist_ext_prep). Lane's reasoning holds → remove the line 45 mapping in exercise-figures.ts (falls back to no figure). If a figure is wanted: new `wristback` = kneeling, forearm supinated, backs of hands down, wrist extension rising ~0 -> 60-70 deg over 3 s down / 1 s up (the exercise's own tempo), body static. Do not reuse the rock.

## Figures below 10
### wristprep 7
- [M] Rock is now right (shoulder 11 px / ~10 deg of arm past the wrist, hip 109->126, shin fixed 81). Missing the front-end pause: 6 s smooth sine → add ~0.5 s dwell at max travel.
- [L] Trunk 73-74 from vertical while hips go 109->126 (hips sit back at the end, not following the shoulders): fine for prep, but hip should travel with the shoulders by ~3-5 px.
### fingerraise 8
- [L] Finger lift 40 deg, 1/1/1.5 s as asked. Readability at 56x40 is nil (fingers < 2 px); acceptable for a thumbnail, check the 144 px tile shows the lift against the floor line.
### downdog 9
- [L] Trunk 50 from vertical, arms+trunk one line, head between arms: good. Short of 10: static (no breath sway; hold has no clock, same lane limit) and heels float ~0 px off the floor in the tile; a 1-2 px heel-reach is nice-to-have.
### child 8
- [L] Hip 18/knee 27/trunk 84 correct, head low ahead. Static and the arm is a straight rod at shoulder ~150: add a 1 px rib-cage breath if a hold clock is ever added.
### wallhs 8
- [L] Trunk 6, arms 62 px locked. No toe-press sway: lane says a hold gets only the 0.9 s ease and no clock; reasoning holds, not counted. Intent alternative: none needed.
### wallhs_90 7 / wallhs_lean 8
- [M] Lane says "90"/"135" are HIP angles with feet on a box, not trunk lean. Reasoning holds, the wall-incline approximation is honest and labels were rewritten. Ladder 6 -> 22 -> 45 reads monotonic on the sheet and the ghost aligns.
- [M] wallhs_90 at 22 deg is still close to wallhs at 6 in the 56x40 thumb (hard to separate) → 25-28 deg would separate the first step from chest-in; keep lean 45.
- [L] wallhs_lean: shoulders open, line straight, hands ~1 m out: good.
### wallhs_shrug 7
- [H] Shrug is 9 px on a 62 px arm (15%): correct number, but at 144 px the rise is ~1 px of body motion; reads as a still hold. The drawn shoulder-girdle segment is the only cue → exaggerate to 12-14 px visually (traps toward ears, head dropping between the ears) while keeping arms at 62 px.
### wallhs_taps 8
- [M] Work elbow 178 -> 19, support arm locked, trunk 6 -> 9 before the hand leaves: matches the brief. Lateral shift not drawable from the side: judge OK; the forward 3 deg press is a fair stand-in. In the 56x40 thumb the tapping arm is not distinguishable.
- [L] Tap hand at elbow 19 lands on the opposite shoulder; sheet frames at 820/5360 ms show it as a small triangle: make sure the hand is clearly at the shoulder, not at the chest.
### hsfree 8
- [L] Trunk 0-3 with 1.2 px finger press: good. Missing a non-periodic feel (pure 6 s sine looks metronomic; balance corrections are irregular) → a second harmonic of ~25% at 0.37x period.
### hstuck 8
- [M] Hip 65, knee 35, shin 34: on target. At 1500 ms the sheet shows both legs sticking out near-horizontal like a pike (hip ~145, knee ~53, shin 87), reads as a pike for ~1 s of the cycle → bring the knees in first (knee < 60 while hip still > 150, shin < 60) so the transit is a tuck, not a pike.
- [L] Hold the full tuck ~1 s (confirm plateau).
### hswalk 7
- [H] Free arm bends to 134 at the lift (lane: side-view projection, not eliminated). A walking hand leaves the floor with the elbow locked; 134 reads as a bent-arm cheat. Lane's reasoning is partly valid (foreshortening) but a locked arm lifts by shoulder flexion not elbow → keep elbow >= 170 and lift the hand via 8-10 deg shoulder swing; the bend should not exceed ~165.
- [M] Lean 1 -> 6 deg and 24 px step (target 20-30 cm ~ 24 px at this scale): good. Sheet frames at 0/1800/3600 ms look nearly identical; the lean is small at 144 px. Scrolling marks do help.
- [L] Leg scissor +-7 deg (target 10-20) → ~12.
### kickup 8
- [M] Lunge start good (front knee 129, swing leg 25 deg under horizontal); gait cycle returns by step-down, 0.54 s kick, 1.35 s stack. Trunk 76 vs 45-60: lane reasoning holds (62 px arm, 106 px shoulder height vs leg reach 94); not counted. Alternative: lower the body target by bending the front knee to ~110 and letting the head drop toward the hands; this is the reachable way to cut trunk ~10 deg.
- [L] At rest the 144 px tile shows the swing leg low and long, hands in a "crawl", fine. 56x40 thumbnail shows only the stacked frame: ok.
### wallwalk 7
- [M] Start trunk 64 vs 80-88: lane says impossible with 62 px arm/136 px body. Reasoning holds (plank with feet at the wall base must have shoulders at 62 px height). Alternative: begin with the feet already 15-20 cm up the wall (start trunk ~75) so the first frame is a real plank-to-wall.
- [L] Six 0.4 slot steps with pauses: good. End trunk 20 good. At 25% (trunk 89) the body is flat, on the sheet at 3060 ms it reads as a plank lying across the floor with feet off the wall; check the feet stay on the wall during the walk.

## Lowest
wristprep 7 (and wrong for pushups), wallhs_90 7, wallhs_shrug 7, hswalk 7, wallwalk 7.
