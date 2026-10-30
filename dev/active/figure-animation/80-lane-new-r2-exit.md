# Lane A r2: matfall + cartwheel (wallExit), 2026-10-30

Changes in `wallExit(sc, praw, mat)` only (rig.ts); renders read at sheet, 144 px tile, 56x40 thumb.

1. Two drills, not one. matfall: quicker tip (psi 90 at p .45, 180 at .62), deeper fold (bend .45), leg swing 80, hips
   settle at 78, mat visible; poster p .42 = hips folding over the mat. cartwheel: slower wheel (psi 180 at .80), straighter
   legs (bend .78), wide straddle V (leg swings 110 / -35), stance 44 px, hips 74; poster p .26 = body tilted with the V
   legs (no longer a bare handstand). Hand-balance order kept: hand B lifts p .12, A planted until release, feet one at a time.
2. Mat: near edge 25 px before the first foot, far edge 52 px past the second (was 26 / 34), 6 px thick (was 5).
3. Leg tone: far leg #686e7a vs near BODY #c9ced6 = ~3.2:1 (was ~1.6:1); far leg vs card ~3.6:1. Test requires near=BODY, so the far one got darker.
4. Thumb fill: scale .75 -> .85 and poster moments that use the frame (figures taller than before in the 56x40 tile).
5. Dwells: p is time-warped so it holds 195 ms at first foot contact (exhale ring keeps running on real time) and holds on
   the final stand (matfall ~1.8 s, cartwheel ~1.0 s before the seam fade). Handstand dwell before lead hand = 780 ms.
   Measured via drawFigure every 33 ms: max vertex jump matfall 7.8 px, cartwheel 7.4 px (loop wrap excluded, fade covers it).
Also fixed: the hip-to-foot clamp used STAND, which dragged the hips sideways on a wide stance; it now uses leg reach (79).
Also: the final stand waits for the turn to finish (pE >= psi 180), cartwheel previously ended leaning.
Tests: vitest src/lib/figures 93 pass, tsc clean.
