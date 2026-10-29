# 53 Rescore 2: hand-balancing coach (handstand family + wristback)
Evidence: angles.md, sheets-all/sheet-06/07, motion/strip-kickup, strip-wallwalk, 43-lane-r2-handstand.md, 33-r1.

## Scores (r1 -> r2)
wristprep 7->8 | fingerraise 8->8 | wristback new 7 | downdog 9->9 | child 8->8 | wallhs 8->9 | wallhs_90 7->8
wallhs_lean 8->9 | wallhs_shrug 7->8 | wallhs_taps 8->8 | hsfree 8->9 | hstuck 8->9 | hswalk 7->8 | kickup 8->8 | wallwalk 7->8
At >= 9: 5 of 15 (downdog, wallhs, wallhs_lean, hsfree, hstuck). Under 9: 10.

## Mapping check
- hs_wrist_pushups_floor -> wristback is right (supinated, backs of hands down). wristprep no longer misused. Closed.

## Under 9
### wristback 7 (CAN reach 9)
- [H] The only moving part is a hand tick; at 144 px tile (sheet-06) the 0->65 deg pivot reads as a small white stroke beside the arm base, at 56x40 it is gone. Body is static (trunk 74 flat). → enlarge the hand to a visible ~10-12 px segment, tint it accent, and draw the fingers lifting ~65 deg against the floor line; a 3 px forward shoulder drift over the 3 s press would show load going onto the knuckles.
- [M] Arm is vertical, hand pivots at the wrist: correct. Label says fingers point toward the knees; confirm the drawn fingers point back (they do on the sheet).
### wristprep 8 (CAN)
- [L] Dwell exists (22% at p=1). Hips still travel 109->126 while trunk stays 73-74 (hips sit back, shoulders do the rocking: right). Short of 9: pure sine on the way in/out; ease hold at the front end to ~0.8 s, add 3 px hip following.
### fingerraise 8 (capped by scale)
- [L] Fingers <2 px at thumbnail; identical trunk/hip all cycle. Geometry cap, not a defect; accent the lifted fingertips for 9.
### child 8 (CAN)
- [L] Static, arm a straight rod. Renderer breath exists; a 1 px rib breath and a slight elbow soft-bend (150 -> arm relaxed) would reach 9.
### wallhs_90 8 (CAN)
- [M] Lean 27 now reads apart from wallhs 6 and lean 45 (sheet-06 tile). Holds 27..28. Short of 9: ghost line vs the body is the only angle cue at 56x40 → heavier ghost.
### wallhs_shrug 8 (CAN)
- [M] Rise 13 px (21% of 62 arm), shoulder segment accented. Sheet-07 tile at 700-2850 ms still shows near-identical frames; the rise is ~1.5 px of body motion at 144 px. → make the head dip visibly (11 -> 7 px gap at top) or add a small chevron mark at the ears; reach 9.
### wallhs_taps 8 (CAN)
- [M] Elbow 178->22, trunk 6->9, tap 12 px past the shoulder: now clear at 820/4820 ms. Lateral shift is not drawable in side view (cap). Thumbnail still hides the tapping arm: accept.
### hswalk 8 (CAN, mostly)
- [M] Elbow min 171 (was 134): locked-arm rule met; far shoulder 162..179 lifts the hand. Good. Frames 0/1800/3600 at 144 px still look nearly identical; the step is 24 px of scrolling marks only. → widen legs scissor visibility (reduced frame shows a V, tile shows near-closed legs: tile phase should sit near mid-step) and lean 6 -> 8 for a readable weight shift.
- [L] Legs +-12 deg now inside target 10-20.
### kickup 8 (geometry cap on trunk)
- [M] Start trunk 80 (front knee 112, hands forward, dip added): reads as a real set-up in the tile, swing leg long and low. Lane says trunk <= ~68 is inconsistent with knee 112 and 62 px arm: agree (hip height vs shoulder 108 px). Owner decision: caps at ~8-9 unless the arm/torso proportion changes.
- [L] Strip: swing leg crosses the vertical with a straight knee (162) and trailing leg stays bent until ~2250 ms; fine. Gait cycle resets cleanly.
### wallwalk 8 (CAN)
- [M] Start trunk 70, feet up the wall 14 px, one pair planted at a time (test-asserted): matches real wall-walk stepping. The strip shows the early frames still as a long thin plank at ~65-70 deg with the hands at the shoulder; pike appears from frame 16 onward. Short of 9: 6 steps all start from nearly the same plank (frames 1-12 barely differ) → compress the first two steps into visible hand-walk-in, and check the ~15 deg pike steps the hip rises 10+ px before the hands move.
- [L] Plank start 80-88 is not reachable (62 px arm); 70 is the honest value, not counted against it.

## At >= 9, what a 10 needs
- downdog 9: no heel reach (1-2 px), no breath sway beyond renderer breath.
- wallhs 9 / wallhs_lean 9: sway +-0.5 deg is invisible; a 10 needs a toe-press micro-motion visible at 144 px.
- hsfree 9: second harmonic is in; 10 needs a visible finger-press (fingertips flex) coupled to the sway.
- hstuck 9: transit is a tuck now (knee < 60 early); 10 needs a 1 s full-tuck plateau confirmed and a small hip shift over the hands.

## Rules
No safety rule in rig.ts / CLAUDE.md is in tension with these figures (no hip-provocative positions here).
