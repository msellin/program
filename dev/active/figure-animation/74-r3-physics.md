# Rescore 3, physics lens (2026-10-29, live 5a72c64)
Method: lane notes 60-63 against angles.md (kickup, hswalk, hipthrust, bridge2, sled, goblet, nordic, wallwalk rows read) and strip-kickup.png. COM numbers are the lanes' own, not re-simulated; tests cited by the lanes taken as passing (vitest figures 79/79 per lane 61).

## Scores
60 of 60 at 9 or more. Under 9: none.
Changed vs r2: kickup 8 -> 9, wallwalk 8 -> 9, hipthrust 8 -> 9, bridge2 8 -> 9 (settled by brief), hswalk 9 (stays), wristback 9, child / wristprep / wallhs_90 / wallhs_shrug / wallhs_taps 9 (not separately scored by physics before, no physics defect). All others unchanged at 9.

## Why the former 8s now earn 9
- kickup: hip-to-push-foot <= 80 sampled every 0.005 over p 0.05-0.15 (tested); front knee 125, start trunk 63, hips ~25 px above shoulders; second leg keeps drifting in (2 deg), no dead stop. Strip: start balanced on hands + rear foot, leg swings up, stacks by ~25%.
- wallwalk: 10 ms timeline test, no step with hands and feet moving together; planted pair range <= 0.5 px across each other-pair slot; foot x range <= 0.5 over the whole walk. This is the contact-slip measurement r2 asked for.
- hipthrust: start trunk 50, bottom hip 100 (norm 95-105), bottom knee 77-82, top hip 179 / knee 95 / shin 6; no hip rise past the line (safety held).
- bridge2: top hip 179 / knee 84 / shin 15 is the geometric optimum (settled; lane 60 tried the alternatives).
- hswalk: planted-hip counter-drift 3.5 px before each lift, free hand clears 9 px, elbows >= 163 (angles 171..178). Closes the r2 open [L].
- carries: sway +-5 px, one foot always down, shoulders level (0 px).
- sled: swing foot 10 px, shin max < 62, ground ticks at stance speed.

## Remaining, none under 9 (not blocking)
- [L] kickup: peak swing-leg angular speed (r2 target 300-500 deg/s) and top-end deceleration still not measured; the 25% frame already has the leg at hip 175, so the swing is fast and short (about 1 s). Route: assert max |d hip/dt| in a test.
- [L] hipthrust: bottom knee 77 is below the trainer's 90-110. Bench plus fixed shoulder cap it; accepted.
- [L] bridge start hip 128-132 (physio wanted >= 150): not reachable without breaking the knee 90-100 top rule. Accept.
- [L] splitsquat: grey badge/bench contrast in shared Scene helpers, an illustrator item, not physics.
- [L] COM-over-base is still checked by lanes only at start / mid / end, not frame by frame, for standing, kneeling and inverted figures. Route: one sweep test over every figure at 50 samples.
- Not physics: wristback/fingerraise ACCENT colouring, ladderBold ghost, thumbnails (illustrator).

## What a 10 would take
Frame-by-frame COM-over-base test across all 60, a measured kick-up peak leg speed and deceleration, and a held-load COM check for goblet/carries at each sample, not only at the lane-chosen frames.
