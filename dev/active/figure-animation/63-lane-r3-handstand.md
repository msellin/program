# 63 Lane r3: handstand family (2026-10-29)
Route (53/54/55/57 r2) -> done -> numbers. Tests in `rig-handstand.test.ts`; stills of kickup and hstuck looked at.

- wristback 7: hand 10-12 px accented + 3 px shoulder drift -> hand is an 11 px ACCENT segment (tick removed), shoulder arc 3.0 px forward over the press; top dwell 90 -> 157 ms (k 0.687..0.722, back 1 s kept).
- fingerraise 8: accented fingertips -> finger segment (14 px) is ACCENT, palm stays grey.
- hstuck 9 (illustrator 7): thigh grey 6 px, shin orange -> thigh BODY w6, shin COL.B w8; tuck-transit test kept (knee < 60 while hip > 150).
- kickup 8: knee ~125, start trunk ~60 (biomechanist overrides round-2 knee 112) -> front knee 125, shoulder arc start -132 deg (shoulder travels on its arc, arm stays 62), start trunk 63, hips ~25 px above shoulders. Hip-to-push-foot <= 80 over p 0.05-0.15 (tested, sampled every 0.005). Second leg keeps drifting in over the hold (2 deg, no dead stop).
- hswalk 8: planted-side hip counter-drift 3.5 px over the 0.4 s (0.111 of cycle) before each lift, released after; free hand clears 9 px (was 5); free shoulder elevation cap 7 -> 9 so the elbow stays > 163 (tested).
- wallwalk 8: test only (as asked). 10 ms timeline: no step where hands and feet both move; in every run of one pair moving, the other pair's position range <= 0.5 px; foot x range <= 0.5 over the whole walk; >= 10 runs. Passes with no rig change. Not done: hand-balance coach's "compress the first two steps".
- Not touched: child, wristprep, wallhs_90/shrug/taps (53 [L]/[M] ghost-line, chevron ideas not in my brief).
Note: knee 125 test range in kickup updated 120-130; the old fingerraise/hstuck tests re-pointed at the split segments.

## Second pass (the remaining 8s)
- child 8: 1 px rib breath (4.5 s) + relaxed arm (hand chord 60, elbow ~150) -> done, tested (elbow 135-170).
- wristprep 8: ease hold at the front end + hip following -> shoulder lean 10 -> 11.5 deg on a doubled ease (ends linger longer); hips follow through the ik; shoulders still < 13 px past the wrists (test). The 3 px hip number is a consequence of the lean, not a separate term.
- wallhs_90 8: heavier ghost -> new `ladderBold` flag: ghost 3 px / op 0.7 (others stay 2 px / 0.4), tested.
- wallhs_shrug 8: head dip + chevron -> head distance 18 -> 7 (11 px), accent chevron beside the shoulders fading in with the rise.
- wallhs_taps 8: route was "accept"; added a small accent ring at the tap point fading in over p 0.7-1.
- wallwalk 8: first steps compressed -> foot-height progress front-loaded (i/N)^0.7, so step 1-2 are the largest; the planted-pair test still passes. Rendered at 0.9/1.8/2.7/4.5 s: plank, pike, and the hand-walk-in now differ by step.

## Third pass (rescore 3: 73-r3-handbalance.md)
- hswalk 8: poster 0.8 -> 0.75 (mid-step, legs open about +-12 deg: tile shows the V, tested, leg gap > 14 px); planted-side hip counter-drift 3.5 -> 6 px (test window -5..-7 after the 0.95 scale). Elbow > 163 and ground-mark tests unchanged.
- wallwalk 8: waypoint table instead of the power curve: feet y 154,115,80,55,30,5,-22 (steps 1-2 climb 39 and 35 px) and body chord 136,118,114,116,122,130,136 so the body pikes then lengthens. Trunk 70 -> 52 at 25% of the cycle (tested 44-58), hands walk in 16 px by then (about 9 and 7 per step: under the 15+ per step ask; a deeper pike dropped trunk to 22 at 25%, the two numbers trade off), staircase visible in rendered strips at 0/0.9/1.8/2.25/2.7/3.6/4.5/6 s, final pose a near-vertical stack against the wall (trunk 19, hands 46 from the wall). Planted-pair test (one pair per slot, 0.5 px hold, >= 10 runs) still green.
- fingerraise 8: shoulder leans 1.4 deg (1.5 px) forward as the fingers lift, tested 1-2.5 px.
