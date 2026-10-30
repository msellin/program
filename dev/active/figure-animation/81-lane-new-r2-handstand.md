# Lane B, new figures round 2 (hollowrock, elbowstand, fingertaps, crowroll)
Measured every 33 ms through drawFigure (loop wrap excluded). Rendered and read the sheets.

- hollowrock: trunk is now a 3-point TORSO line (shoulder, ribs, pelvis), two 40 px segments bowed 8 deg, ribs 5.6 px below
  the chord; `flesh` bends the trunk outline by that offset (sine along the chord; only 3-point trunks, none existed before).
  Whole shape still rocks rigid (+-15 deg). Contact ring now fixed at the pelvis, so the reduced-motion ghost no longer
  draws a stray ring (ghost test requires a ghost, so it stays as the thin other-pose outline). Max jump 4.3 px.
- elbowstand: second (far) arm in FAR 7 px to the right, flat hands with fingers forward (15 px), head hangs between the
  arms 18 px below the shoulders. Pose, balance and 1.5 deg leg sway unchanged. Max jump 0.3 px.
- fingertaps: peel 40 -> 65 deg, finger 11 -> 13 px (tip lifts ~12 px), trapezoid peel with 0.15 s dwell at the top
  (0.5 s tap), weight shift 1.5 -> 2.5 px. Max jump 5.0 px.
- crowroll: crow dwell 0.6 s (p 0-.12), chin leads hips by 0.3 s, trunk passes vertical at p .5 and rolls on to the back,
  knees overshoot 8 deg at p .74 and settle by p .84 (about 0.5 s). Max jump 7.4 px. Thumb: poster is still the crow pose; not enlarged.
Tests: vitest src/lib/figures 93/93, tsc clean.
