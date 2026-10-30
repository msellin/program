# 65 animator: ten new figures (read from /tmp/anim-new sheets; static frames only, no clips rendered)
Scores (1-10): threadneedle 8, arch 7, dbrow 7, pulldown 6, fingertaps 5, hollowrock 5, elbowstand 7, crowroll 7, matfall 7, cartwheel 6.
Seams: every gait/move figure matches at 0 vs cycle end (6500/7000/4000 ms frames identical to 0) -> no loop pops seen.

- threadneedle: best of the set; reach/thread/return read across 8 frames, arm arc clear. Remaining: hand-off at ~6200-7150 ms (arm drops under the body) is the only busy beat; hold ~0.3 s longer at full rotation.
  - [L] threadneedle: end-range hold short vs 10 s cycle -> lengthen peak hold 300 ms.
- arch: hold; 0/300/2000 ms show the arch building then settling. Reads, but lying figure is 56x40-thumbnail illegible.
  - [M] arch: no breathing at 2000 ms+ (frames 2000 and reduced identical) -> add 1-2 px chest rise on ~4 s breath.
- dbrow: row beats visible (1040 down, 1820 pulled, 3744 return); L-weight rides with the hand. Row shows elbow lead but torso also looks static -> fine.
  - [M] dbrow: pull and lower look equal length at 5200 ms; lower should be ~1.5x slower than the pull and pause 150 ms at top.
- pulldown: figure is tiny in the 144 px tile; bar travel 1320 vs 4440 ms reads, but the torso lean-back is barely visible, so the pull looks like arm-only.
  - [M] pulldown: add 5-8 deg trunk lean-back at the bottom and ease return (eccentric ~1.5x pull).
- fingertaps (gait 4000): frames 0/2000/4040 are near-identical at sheet scale; the taps may be under ~1 px. Viewer sees a static wall lean, thumbnail shows nothing.
  - [H] fingertaps: tap motion not readable -> raise fingertip lift to >=4-5 px (visible peel-off from wall) and stagger the alternating hands.
- hollowrock (gait 2400): frames 0/1200/2424/2400 look identical; the rock (heel/shoulder arc) is not visible at any sampled phase, so it reads as a static hollow hold.
  - [H] hollowrock: rocking amplitude not readable -> rotate the whole body +/-6-8 deg about the lower back (shoulders rise as feet drop), 1200 ms each way with ease-in-out; check the rock is not hidden by sampling at 0/half phases only.
- elbowstand: stable, the straddle legs read well, legs offset gives depth. Hold has no live micro-balance.
  - [L] elbowstand: add 1 px/3 deg slow leg sway (~3 s) so the hold lives.
- crowroll: crow -> roll at 3500 ms reads as a tuck; the mid-roll frame shows a vertical blob, so the rotation is hard to follow at 7000 ms with only 3 beats.
  - [M] crowroll: add head-tuck lead before hips (chin first, ~200 ms) and show the roll continuing past the vertical so it reads as a roll rather than a pop-up.
- matfall: setup -> fall (3250 ms) -> reset; mid-frame reads as the cartwheel-out bail. Handstand to mat transition is fast to read, then reset teleports back to the wall at 6500 ms.
  - [M] matfall: reset to the handstand is a cut; ease up through a kick over ~600 ms or fade the return so it does not pop.
- cartwheel: front-on view; mid frame is a low scattered sprawl (3250 ms) with a very wide change from the handstand, so a limb-swap/draw-order pop is possible between ~1000 and 3000 ms (not rendered per-frame here).
  - [M] cartwheel: render a 30 fps strip and check for limb pops; keep the near/far leg draw order fixed through the rotation.
No [B] items. Two [H] (fingertaps, hollowrock): their motion is the exercise and is not visible.

## Re-score after fixes (/tmp/anim-r2)
threadneedle 8, arch 8, dbrow 8, pulldown 7, fingertaps 6, hollowrock 6, elbowstand 7, crowroll 8, matfall 7, cartwheel 7.
Seams still clean (end frame = frame 0); crowroll 5 s mid-frame now reads as a roll; dbrow/pulldown show more trunk travel; matfall/cartwheel reset has no visible pop.
- [M] fingertaps / hollowrock: sheet samples (0, half, end) land on the zero crossings of the cycle, so frames look identical and the 7 px peel / +-15 deg rock cannot be confirmed from the sheet (hollowrock reduced frame and tile do show a rock pose). Verify with a 30 fps strip at 25/75 %; no [H] if the strip shows the motion.
- [L] elbowstand/arch: holds still have no visible breathing sway at sheet scale.
