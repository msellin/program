# Lane B, new figures round 3 (elbowstand, hollowrock, fingertaps)
Measured every 33 ms through drawFigure; sheet rendered and read.

- elbowstand: head dot moved to S+[8,28] (was S+[3.5,18]): 10 px lower, 4.5 px forward toward the hands, clear of the hip;
  leg sway 1.5 -> 2.5 deg on a 3.0 s cycle. Max jump 0.6 px.
- hollowrock: legs trail the trunk by 0.04 p (3.8 deg peak lag, legs rotated about the pelvis, length kept); 0.15 s dwell
  at each rock extreme (p .22-.28 and .72-.78), 1.05 s eased between; header comment updated (1.05 s each way, dwell, lag);
  contact ring removed, so the reduced-motion ghost is only the thin other-pose body outline (ghost test passes).
  Max jump 4.8 px (the 2409 ms sample is past the 2400 ms loop wrap).
- fingertaps: weight shift 4 px (was 2.5): loads on over the 0.15 s before each peel, holds through the lift, unloads on
  set-down; hips follow 0.6x. Finger 16 px at 72 deg: tip lift ~15 px, palm stays on the wall. Rise 0.18 s, 0.15 s dwell
  at the top, 0.17 s set-down. Max jump 6.1 px.
Tests: vitest src/lib/figures 93/93, typegen + tsc clean.
