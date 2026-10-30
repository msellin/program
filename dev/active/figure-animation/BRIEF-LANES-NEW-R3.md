# Fix lanes, new figures round 3 (2026-10-30)

Same setup and rules as `BRIEF-LANES-NEW-R2.md` (reset to main, symlink node_modules, own figures only, render and
READ, ≤ 8 px per 33 ms — aim ≤ 6 — via `node ../dev/active/figure-animation/new-r2/jumps.mjs <ids>`, tests + typegen
+ tsc, commit on branch). Inputs: rescore `90`–`95-new-r2-*.md`. Below is the checked list; items already done or
stale are left out on purpose (the matfall mat is already ~77 px wider than the stance; crowroll scale is already 1.1).

Arbitration (settled):
- elbowstand keeps STRAIGHT arms (hand-balance coach owns correctness; the illustrator's bent-elbow route is out).
- CEILINGs named by a lens are accepted as limits; do not chase them.
- Stroke widths and BODY/FAR colours are house conventions (tests); legibility comes from pose, framing, poster.

## Lane A — matfall, cartwheel, crowroll (`wallExit` and the two entries, crowroll entry)
- cartwheel: first foot lands 55–65 px from hand A (now ~87): bend the legs more from psi ~15 (e.g. .78 -> .65) and
  move the end hips accordingly; keep the straddle V and the difference from matfall. Final stance a little wider
  (+8 px) so the legs do not merge. Thumb: a 2 px lateral hip offset at p .5 so travel shows. The 1.0–1.5 s
  segment under 6 px/frame.
- matfall: stretch the psi 90 -> 180 span (p .45–.62 -> .45–.66) and make the tip a short ease-in (accelerating) with
  a soft settle on the mat (~p .62–.66); poster at the moment one leg is still in the air (~p .36), showing the mat.
- crowroll: poster at a mid-roll moment that reads at 56x40 (hips over shoulders, ~p .25–.45: pick by rendering the
  thumb); roll-over peak under 5 px/frame (one more ease); mat line a little thicker if a test allows.

## Lane B — elbowstand, hollowrock, fingertaps
- elbowstand: the head reads as a pelvis ball beside the arms: make it unmistakably the head (between the arms,
  ~10 px lower/forward toward the hands, clear of the hip), leg sway 1.5 -> 2.5 deg on ~3 s.
- hollowrock: legs lag the trunk 3–5 deg through the rock (≈ +0.04 p); a 120–180 ms dwell at each rock extreme;
  header comment true to dur; reduced-motion ghost: no ring and nothing that reads as an artefact (a ghost must
  exist — test).
- fingertaps: weight shift visible before each peel (shoulders 4 px or a 1.5 deg torso lean, 150 ms before the
  lift); tip lift up to ~16 px if it stays anatomical (fingers, not the palm, leave the wall).

## Lane C — arch, pulldown, dbrow, threadneedle, hipflex
- arch: arms +8 deg over the chest line (hand ~20.5 deg) so the arm clears the head dot by ~4 px; 56x40 thumb
  crop ~1.3x tighter (poster framing); stale "7 deg" comment.
- pulldown: end hand S+[16,20] (shoulder extension ~45, bar at the upper chest, clear of the chin); pad rod ends at
  ~x 226 (no floating second bar); thumb clutter: figure larger in the thumb or the bar ring lighter; a 2 px elbow
  settle (≈150 ms) after the return.
- dbrow: a 2 px elbow settle after the lower; stale "17 deg" comment. (Bench-arm lean is a CEILING.)
- threadneedle: wrist ~20 px from the head centre at 0 ms and at the end of the opening rep (now 14); threading end
  wrist x 178 (was 184). Keep the elbow interpolation.
- hipflex: the press arrow a little bolder so it reads at 56x40 (shape, not the shared stroke rule); joints frozen.

Output: `dev/active/figure-animation/8N-lane-new-r3-<lane>.md` (≤ 25 lines). Reply: branch, commit, ≤ 8 lines.
