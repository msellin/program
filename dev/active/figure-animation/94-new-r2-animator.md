# 94 animator: new figures r2 rescore (16-frame strips + jumps.mjs, 2026-10-30)
Evidence: new-r2/strips/sheet-01/02.png, jumps.mjs (max vertex jump per 33 ms), lane notes 80-82. Previous: 65.

| figure | 65 r2 | now | note |
|---|---|---|---|
| threadneedle | 8 | 9 | hold 1430 ms per rep, arm no longer overlaps head; arc clean |
| hipflex | - | 9 | joints fixed by design (0.3 px jump); only the pulse lives |
| arch | 8 | 9 | breath 1.5 px / 4 s present; lift reads in tile |
| dbrow | 8 | 9 | pull 1456 / dwell 520 / lower 2496 (1.7x), good weight |
| pulldown | 7 | 9 | pull 1680 / dwell 720 / return 2820; 8 deg lean-back |
| fingertaps | 6 | 8 | peel exists (5 px jump at 594 ms) but is small in the strip |
| hollowrock | 6 | 9 | rock now clearly visible in strip: shoulders rise as feet drop |
| elbowstand | 7 | 9 | 1.5 deg sway, 0.7 px jump; far arm gives depth |
| crowroll | 8 | 9 | chin leads, passes vertical at p .5, rolls to back, overshoot settles |
| matfall | 7 | 8 | fall beat 7.8 px/frame is fast; hold on stand long |
| cartwheel | 7 | 8 | same; slow wheel reads, handstand dwell 780 ms |

Seams: all strips end on frame 0 pose; matfall/cartwheel reset is a fade (see below); no limb or draw-order pop found in strip (max jumps 0.3-7.8 px, all at planned fast beats).

- fingertaps (8): the strip frames at 5 s/16 = 312 ms spacing still look near-identical at sheet scale; the 12 px tip lift and 0.15 s top dwell are only visible at tile size. Route: raise tip lift 12 -> 16 px or stagger two hands by half a cycle so one is always visibly off the wall. CEILING partly: a side-on wall-lean at 56x40 shows ~3 px of finger motion; thumb cannot show it.
- hollowrock (9): rock arc reads, but there is no dwell at either end (the tilt reverses continuously). Route: 120-180 ms hold at each extreme (k warp) so the rock has a turnaround beat; amplitude +-15 deg stays. Minor, not a ceiling.
- threadneedle (9): hand-off around 6200-7150 ms was the busy beat; the strip still shows the arm passing under the body in about 3 frames. CEILING: flat side view, the arm must cross the trunk line, so a draw-order cut under the torso cannot be smoothed further.
- hipflex (9): CEILING: rehab hold with no joint motion allowed beyond breath; a 10 would need visible hip movement, which CLAUDE.md limits forbid. Pulse is the only live element.
- arch (9): lying figure is 56x40 thumbnail-small; 1.5 px breath is invisible at thumb size. CEILING: one flat trunk line at that aspect.
- dbrow / pulldown (9): top and bottom dwells good; no overlap or follow-through on the free arm/hand after the lower (settle 0 ms). Route: 2 px ease-out overshoot of the elbow at the bottom, ~150 ms. Pulldown thumb is figure + cable and reads.
- elbowstand (9): hold micro-sway of 1.5 deg is below strip visibility (frames identical). Route: raise to 2.5 deg over ~3 s; CEILING for breathing, rig has no ribcage on an inverted trunk.
- crowroll (9): max jump 6.7 px at 2838 ms during the roll-over (about 200 px/s); acceptable but the fast frame between 2 and 3.2 s has little spacing at the hips. Route: add one more ease-in so peak speed drops to under 5 px/frame. Poster/thumb is still the crow pose, so the roll does not show in the 56x40 thumb (CEILING for a thumbnail).
- matfall (8): fall at 7.8 px/frame is a one-frame blur at 30 fps; the strip shows 1210 ms to 1820 ms jumping from inverted to tucked, only 2 strip frames. Route: lengthen psi 90 to 180 span by 150 ms (p .45-.62 to .45-.66) and lower leg swing speed; the return is a fade, fine. Cheaper-to-accept ceiling: a bail is meant to be abrupt.
- cartwheel (8): max jump 7.4 px at 1320 ms (lead-hand lift into the wheel, p .12-.30). Strip shows the straddle V passing the horizontal in one frame. Route: ease the 1.0-1.5 s segment so max step is under 6 px; hold on the final stand 1.0 s is good.
No [H] items remain. Nothing here reaches 10 without the routes above or the stated ceilings.
