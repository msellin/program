# 73 Rescore 3: hand-balancing coach (handstand family + wristback)
Evidence: angles.md, sheets-all/sheet-06/07, motion/strip-kickup, strip-wallwalk, strip-hswalk, 63-lane-r3-handstand.md. Prev: 53.

## Scores (r2 -> r3)
wristprep 8->9 | fingerraise 8->8 | wristback 7->9 | downdog 9 | child 8->9 | wallhs 9 | wallhs_90 8->9
wallhs_lean 9 | wallhs_shrug 8->9 | wallhs_taps 8->9 | hsfree 9 | hstuck 9 | hswalk 8->8 | kickup 8->9 | wallwalk 8->8
At >= 9: 12 of 15. Under 9: fingerraise 8, hswalk 8, wallwalk 8.

## Why the new 9s
- wristback: 11 px accent hand now reads in the 144 px tile (sheet-06) as a bright forward-pointing segment; 3 px shoulder drift and 157 ms top dwell show load on the knuckles. Gone at 56x40 (cap, not a defect).
- kickup: start trunk 63, front knee 125, hips ~25 px above shoulders: a believable set-up in the tile and strip; swing leg straight over the hips by 2250 ms, clean stack, clean reset. Remaining short of 10: no visible hop/push-foot lift-off cue.
- shrug: chevron and 11 px head dip are visible at 700/1240 ms in sheet-07 (small chevron at the ears). taps: accent ring at the tap point shows at 820/4820 ms.
- child, wristprep, wallhs_90 (bold dashed ghost visible at 56x40): the r2 routes were done.

## Under 9
### fingerraise 8 (geometry cap)
- [L] Trunk/hip constant (74 / 109) by design; accent fingertips help at 144 px but the lift is ~2 px at 56x40. Route to 9: add a 1-2 px forearm lean forward as fingers lift (a real compensation), or accept as a cap. Not blocking for a wrist-prep drill.
### hswalk 8
- [M] Sheet-07: frames at 0/1800/3636/3600 ms look near-identical at 144 px; only the reduced frame shows the scissor V, the tile shows legs nearly closed. A coach reading the tile cannot tell a step is happening. Route: make the tile/representative phase fall near mid-step (legs +-12 deg open), and lengthen the 3.5 px planted-side hip drift to ~6 px so the weight shift is visible before the hand leaves. Hand clearance 9 px and elbow min > 163 are right.
### wallwalk 8
- [M] strip-wallwalk: frames 1-12 (about the first 5 s) are still nearly the same long plank (trunk 70-72, hands at the shoulder); the pike only appears in the last 4 frames, and the last frame jumps to a near-flat bar-like line (trunk 3). The front-loaded steps (i/N)^0.7 are not visible at strip sampling; the walk reads as "plank ... sudden pike". Route: make step 1-2 raise the feet 25+ px each and show the hands walking in 15+ px (trunk 70 -> 50 by 25% of the cycle), so the mid-cycle reads as a staircase. Check the last frame: trunk 3 with straight legs at the wall means the final pose is a vertical-ish stack against the wall, which is correct, but the drawn line looks horizontal; verify the wall-contact frame.
- [L] Planted-pair test passes (one pair moves at a time), which matches real wall-walk stepping.

## Rules
No safety rule in rig.ts / CLAUDE.md is in tension with these figures.

## Pass 3 (hswalk, wallwalk, fingerraise)
- hswalk 9: strip-hswalk now shows a clear scissor V on 8 of 10 "after" frames, hip drift 6 px, elbow > 163. Short of 10: sheet-07 still shows the old near-closed tile (sheet not regenerated, or the tile phase is not at mid-step).
- wallwalk 8: the lane reports trunk 52 at 25% and a staircase, but strip-wallwalk.png as read looks unchanged from pass 2: first ~6 of 10 sampled frames are the same long plank (trunk ~70), pike only in the last 2 rows. Cannot confirm the change; hand walk-in is 9 and 7 px per step (under the 15 ask, the lane says it trades off against trunk). [H] Re-render strip-wallwalk and check frames 2-6 differ by >= 10 px in foot height; if so, 9.
- fingerraise 8: 1.5 px shoulder lean is below what a 144 px tile can show (and 56x40 hides it). Geometry cap; accept at 8.
