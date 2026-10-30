# 64 - physics, ten new figures (threadneedle, arch, dbrow, pulldown, fingertaps, hollowrock, elbowstand, crowroll, matfall, cartwheel)

Method: contact sheets /tmp/phys-new/sheet-01/02.png read; every figure sampled every 33 ms through `drawFigure`
and the largest single-frame vertex jump measured (script in the session scratchpad; excludes the loop wrap, which
is faded by `fade`); planted contacts tracked in x; COM estimated from the skeleton (trunk 48 / head 10 / legs 32 /
arms 10 %). Note: the sheet's "6565 ms" frame is already the wrapped start pose, not the end pose.

| fig | score | one line |
|---|---|---|
| threadneedle | 7 | contacts and COM fine; the working elbow flips 54 px in 33 ms at ~5.7 s into the thread rep |
| arch | 9 | hips planted, max 1.4 px/frame, lift 7 deg chest / 4 deg legs, COM on the floor |
| dbrow | 9 | plumb plate, bench hand/knee/foot static, COM x 172-190 inside foot 124..hand 195, 2.3 px/frame |
| pulldown | 9 | seat/pad/feet static, cable straight hand to fixed pulley (7-13 deg off vertical, taut) |
| fingertaps | 9 | body static, hands on the wall (no slide), COM inside the lean, 4 taps per hand, seam clean |
| hollowrock | 9 | roll direction matches the rotation (contact moves 2.8 px), 23 deg/s peak, seam clean |
| elbowstand | 9 | COM x ~184 over the hand plate 177..193; 14 px leg lift; see M on the label |
| crowroll | 7 | knees sit on the arms (6 px), COM x 164 over hand 168; elbow pops 53 px at p=0.60 |
| matfall | 7 | feet at the wall, hand planted to p=0.42, lands on the mat; elbow pops 62 px at p=0.54 |
| cartwheel | 4 | final stand is unbalanced and crouched (see B); knee pops 50 px at p=0.50 |

Findings
- [B] cartwheel: end pose (p 0.75-0.94) has the trunk vertical at x=265 and both feet at x=323/330, so the COM is
  ~58 px outside the base and the legs rake 48 deg; hips are 52 px up (standing is 78). Cause: `Hend=[236,88]` is
  ~90 px left of where the feet landed (fx1=323) and the 78 px clamp drags the hips onto the line to it
  → `Hend=[(fx1+fx2)/2, 166-78]` (computed from the landed feet, not a constant), then re-check hips y = 88 at p=0.94.
- [H] cartwheel: far-leg knee flips at p=0.50 (`kn` flips when ux changes sign, ikSide picks by x-side): 50 px in
  33 ms → keep the bend direction continuous (choose it from the cross product of the previous frame's chain, or
  blend kn through 0), so the knee never jumps.
- [H] crowroll: arm `ikSide(..., -1)` flips the elbow at p=0.60, 53 px in 33 ms → fixed bend side (elbow behind
  the body while the hand is planted, then toward the shin) or a continuous elbow angle.
- [H] matfall: arm sign switch `p < 0.5 ? 1 : -1` gives a 62 px elbow pop at p=0.54 (the ikSide x-side test flips
  late) → one fixed side through the whole fall (elbow trailing the fall direction).
- [H] threadneedle: thread rep, `ikSide(S, W, ..., 1)` flips the elbow (below -> above the arm line, y 130 -> 76)
  at ~5.7 s of the rep → pick the elbow side from the sign it had at q=0 (down) and hold it; the elbow must stay
  below the shoulder-wrist line while the arm slides under the chest.
- [M] cartwheel: feet land 157 px from the planted hands (hand 166-170, feet 323/330) against the label "land
  beside the hands" → either shorten the travel or reword (a cartwheel travels about a body length, so reword).
- [M] elbowstand: the id/exercise is "elbow stand" but the drawing is straight-arm hands on the floor (L handstand,
  hips 114 px up). Balance is correct for what is drawn; name/label consistency is another expert's call.
- [L] matfall: the shoulders descend 24 px in 1.3 s with an ease-in-out; a real tip-off would accelerate and the mat
  would stop it. Acceptable as a controlled demo; a 0.25 s ease-in with a soft settle would read more true.
- [L] dbrow: planted-foot leg needs 88 px, limbs give 86 (2 px stretch); shorten F by 2 px or lengthen to 44+44.
- [L] hollowrock: comment says one rock each way in 1 s; the cycle is 2.4 s (real rocks 1.2-1.6 s). Doc fix or
  dur 1600; peak speed would still be only 35 deg/s.

## Re-measure after fixes (same method, 33 ms steps, loop wrap excluded; crowroll now dur 5000)
- Max single-frame jump: threadneedle 3.8, arch 2.4, dbrow 2.4, pulldown 5.4, fingertaps 1.6, hollowrock 4.2, elbowstand 0.7, crowroll 6.9, matfall 7.8, cartwheel 7.8 px: all elbow/knee pops gone.
- Cartwheel end: feet 227/259, hips x 243 (inside the base), hips 76 px up: balanced. B closed. Landing is 60 px from the hands now.
- Scores: threadneedle 9, arch 9, dbrow 9, pulldown 9, fingertaps 9, hollowrock 9, elbowstand 9, crowroll 9, matfall 8, cartwheel 8.
- [H] cartwheel + matfall: the planted hands creep in x while "planted": hand A 166 -> 175.7 (p 0-0.48), hand B 192 -> 199.9 (p 0-0.14), 8-10 px. Pin them at 166 / 192 until lift-off (the `toward(..., 60)` reach clamp drags them).
- [L] matfall reports the same hand/foot tracks as cartwheel to the decimal; confirm it is meant to share the rig.
