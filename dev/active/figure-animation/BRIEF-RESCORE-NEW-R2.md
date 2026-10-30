# Rescore, new figures round 2 (2026-10-30)

Owner's bar: **every lens scores each new figure 10.** Score 1–10 honestly; never round up. If a 10 is not reachable
inside the flat SVG rig (fixed-length segments, side or front view, one trunk line, no 3D), say `CEILING: <reason>`
with the exact limit, so the owner can accept it. Otherwise name the exact remaining issue and its route
(numbers, not adjectives).

Figures (`next-app/src/lib/figures/rig.ts`): threadneedle, hipflex, arch, dbrow, pulldown, fingertaps, hollowrock,
elbowstand, crowroll, matfall, cartwheel. What changed: `80-lane-new-r2-exit.md`, `81-lane-new-r2-handstand.md`,
`82-lane-new-r2-pull-rehab.md`. Your previous file: `60`/`62`–`66-*.md`.

Evidence (all in `dev/active/figure-animation/new-r2/`):
- `sheets/sheet-0N.png`: key frames (gaits now at the quarter phases — earlier sheets sat on the zero crossings and
  hid the rock and taps), reduced-motion frame, 144 px tile (2x), 56x40 thumb (2x). `thumbs-actual-size.png`.
- `strips/sheet-0N.png`: 16 frames evenly over the whole cycle (both reps of a move2; 12 s of a hold) — timing,
  dwells and spacing.
- `cd next-app && node ../dev/active/figure-animation/new-r2/jumps.mjs <ids>` — measured max vertex jump per 33 ms.
- Your own measurement through `drawFigure` is welcome; check a claim in the code before scoring it as a defect.

Settled (score with these as given, don't re-litigate):
- matfall/cartwheel: hand A stays planted until release; hand B (lead) lifts at p 0.12 by design. They share
  `wallExit` but now differ in tempo, leg shape, mat and poster.
- Every non-hold figure must show a thin ghost of the other pose in reduced motion (app test; a11y rule).
- elbowstand draws the straight-arm straddle-L option the exercise allows ("straddle-L stand ... or an elbow stand").
- Hip-rehab limits in CLAUDE.md (threadneedle, hipflex) are hard limits, not defects.

Output: `dev/active/figure-animation/9N-new-r2-<lens>.md` (≤ 35 lines): a score table, then per figure under 10 the
issue + route or CEILING + reason. Reply ≤ 10 lines: scores, and every item under 10.
