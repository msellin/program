# Figure review — 2026-10-28

The first panel (2026-10-19) reviewed 9 of the then-36 figures. This pass reviewed **all 36**, fixed what the
panel flagged, and added **14 figures** for `anterior-hip-rebuild` (it had none for 14 of its exercises; the brief
listed 11, and the script also found `glute_bridge`, `a_march` and `leg_swing_controlled`). Every hip figure
was coach-reviewed before shipping. Scores are 1–10 (10 = best).

| report | lens | before |
|---|---|---|
| [01-coach.md](01-coach.md) | positions, range, props, variants | 12 PASS / 24 FIX, avg 5.8 |
| [02-motion.md](02-motion.md) | easing, holds, loop timing, limb integrity | 19 PASS / 17 FIX, avg 6.3 |
| [03-visual.md](03-visual.md) | silhouette at 56x40 and 144px, stroke, contrast | 5 PASS / 31 FIX, avg 4.2 (thumb) / 6.1 (tile) |
| [04-coach-new-figures.md](04-coach-new-figures.md) | the 14 hip-rebuild figures | 10 PASS / 4 FIX (all applied), 0 safety issues |

No existing figure taught a provocative position (`data/clinical-context.json`).

## What changed (all in `next-app/src/lib/figures/` + `ExerciseFigure.tsx`)

**Cross-cutting (all three lenses agreed):**
- **Fitted frame.** `figureBounds` fits the viewBox to the figure's whole cycle (floor, bar and wall are
  excluded and run past the edge). Before, the fixed 358x201 box left a standing figure about 26px tall in a
  brief thumbnail and 46% of the Today tile.
- **Strokes in screen px for the size drawn** (`strokePx`, `vector-effect: non-scaling-stroke`, measured with
  a ResizeObserver). A limb is 2.75px in a thumbnail, 5px on the tile and ~8px in the player. The working limb is
  1.25x heavier. Below 64px the L/R badges are hidden.
- **Poster pose for still figures.** Brief thumbnails and QuickStart show the drill's defining frame (chin over
  the bar, squat bottom, ring row chest-to-rings), not the rest pose. Before, all 9 pull-up variants were the
  same dead hang.
- **4-key timing** `k=[rest, end, hold, return]`: up ~1.3 s / down ~2.3 s / ~1 s bottom pause. Squats were
  inverted (down faster than up). A negative now RESETS to the top in one cut; before, its return looked like a
  fast pull-up. Hold entry is cosine (no first-frame jolt). In reduced motion the poster is shown solid and the
  other extreme as an outline.
- **Palette** ≥3:1 on the card AND on the tile tint (#2a231f). PROP and FLOOR failed on the tile before. The
  body went from #9aa0a8 to #c9ced6. Equipment is drawn as an outline (boxes on a dark fill; plates, balls and
  bells as rings), so a bar end no longer reads as a second head.

**Per-figure fixes (coach):**
- **Pull-ups:** shoulders now sit below the bar at the top, with the head up on the neck. Mid and partial holds
  are at 90° elbows.
- **Band:** moved outside the torso.
- **New pull-up figures:** 5 s and 10 s negatives are now separate figures, and grease-the-groove has its own
  single-rep-then-rest loop.
- **Scap work:** scap pull and active hang keep the arms at full length while the trunk rises; they used to
  shrink 19%. The scap retraction hold now maps to the pull-up top.
- **Ring rows:** the three variants differ by body angle (flat, steep incline, level on the box), with straight
  arms at the bottom.
- **Wall walk:** starts as a plank.
- **Kick-up:** separate swing and push legs.
- **Handstand walk:** one hand steps while the other is planted.
- **Tuck handstand:** goes in and out of the tuck.
- **Squats:** shin at ~25°, hands on the bar, front-rack elbows high, a foot drawn under the ankle.
- **Block pull:** start reads as a pull, not an RDL.
- **Adductor:** both knees drawn with the ball between them, plus an extended-lever variant.
- **Others:** wrist prep keeps the knees planted; child's pose arm length fixed.
- **New variants:**
  - wall handstand shrugs, shoulder taps and the 90° hold
  - finger raises
  - hollow-body pullover (it was mapped to the dowel pullover)

**New hip-rebuild figures:** `bridge2`, `hipthrust`, `splitsquat`, `slrdl`, `pallof` (front view), `nordic`,
`sled`, `suitcase` and `farmer` (front views), `airsquat`, `goblet`, `amarch`, `legswing`, `hollowtuck`.
The provocative positions are encoded as tests in `rig.test.ts`:
- squats never go below parallel
- the A-march stops at a level thigh
- leg swings stay at ≤30° with a soft knee
- the hip thrust and bridge finish in line, never arched
- `hollow_hold` is drawn TUCKED (no straight-leg-raise hold)

## Files
- `before/`, `after/`, `after-hip/`: contact sheets (frames through a cycle, reduced motion, Today tile and
  brief thumb at 2x), plus `thumbs-actual-size.png`.
- `before-after.png`, `before-after-hip-rebuild.png`: the founder's comparison at real sizes.
- `render-figures.mjs` (`cd next-app && node ../dev/active/figure-review/render-figures.mjs <out> [fig…]`) and
  `compare-figures.mjs` (needs `.old/rig.ts` from `git show`; see its header).

## Not done / follow-ups
- **Copy conflict (data, out of scope here):** `air_squat_daily` and `goblet_squat` cue "full depth", but the
  figures stop at about parallel for this program's provocative positions. The copy should say "to about
  parallel, pain-free", ideally in `anterior-hip-rebuild`'s `exercise_overrides`.
- **Left as is:**
  - `ninety` is still the top-down view, which the coach called hard to read.
  - The handstand sway is a single lean, not the irregular sway motion asked for.
  - Several `hswalk` drills (cones, plate, marker path) share one figure.
- **No in-app screenshots of signed-in screens:** sign-in needs a CAPTCHA. The public program page was checked
  in the dev server: fitted viewBox, measured height and px strokes all live.
