# Rescore 1, physics lens (contacts, balance, equipment, momentum), 2026-10-29
Method: lane numbers (20-23) checked against angles.md and my 14-physics targets; COM figures are the lanes' own measurements (mid-foot 159), not re-simulated. Not re-run: frame-by-frame kickup push-foot reach.

## Scores
sled 9, hswalk 9, squat 9, frontsquat 9, goblet 8, airsquat 9, deadlift 9, rowincline 9, rowflat 9, rowfeet 9, kickup 6, wallwalk 7, nordic 9, pullapart 9, pallof 9, farmer 9, suitcase 9, pullup_negative 7, pullup_negative5 7, pullup_band 9, pullup_band_light 9, splitsquat 7, hang 9, downdog 9, hipflex 9, slrdl 9, bridge2 8, hipthrust 8.
All others (adductor, adductor_ext, bridge, deadbug, kneel, ninety, pullover, roller, hollow, hollowpull, hollowtuck, pullup, pullup_single, pullup_slow, pullup_partial, pullup_top, pullup_mid, scappull, activehang, wristprep, fingerraise, child, wallhs*, hsfree, hstuck, amarch, legswing): 9. No [H] left on any. A 10 is withheld where a small physical doubt remains (listed) or the figure is a pose-only approximation.

## Fixed, confirmed (no further action)
- Ground contact: sled and hswalk now call `sc.ground` (rig.ts 738, 1057), scroll = stance speed. Owner's moonwalk question closed. 
- Squat/front/goblet/air COM at depth 157.8/157.5/156/157 vs mid-foot 159: inside the 156-160 target. Plumb cue now agrees with the bar.
- Deadlift: shin driven 14 -> 5 -> 9, knee goes back, bar clears knee >= 9 px (target >= 10; 1 px short, accept). Lockout 180/177.
- rowincline reachable now (feet 228, rings 42, hand-foot 164 vs reach ~170; elbow 173 -> 40). Rope tilt on rows (anchor = hand + 0.32 h = 18 deg, my target). Pallof anchor fixed at y 54, band thins. Pullapart straight hand to hand. Nordic hands pinned from first contact. Farmer/suitcase sway +-7 with feet 16 apart: single support under COM.

## Remaining
- kickup [M]: lane 23 rebuilt the cycle (gait, lunge start, loop closes) but its note never mentions my two points: start COM behind the push foot, and hip-to-push-foot distance 82-85 vs leg 80 from p 0.05 (needs heel-to-toe roll or earlier foot release). Verify strip-kickup.png; if the push foot is still at 162-178 with the hip at 141, move it under the hip (~145) and release the foot at p 0.05. Lane's trunk 76 (not 45-60) is sound: 62 px arm geometry forces it; accept. Swing-leg speed (136 deg/s peak) unchanged: a kick-up leg is 300-500 deg/s; the new 0.54 s kick probably helps, but end with a decelerating drift, not a stop.
- wallwalk [M]: six steps now, trunk 64 start (lane: 80-88 impossible with 62 px arm; reasoning holds). Contact still needs checking: hands and feet must be planted during the 0.3 s pause of each slot, and only one pair moves at a time; if hands slide during the foot slots the glide remains. Target: hand x constant across each foot slot.
- pullup_negative / negative5 [M]: the 7 ms reset cut is still unmarked (lane: needs a drawFigure opacity hook, build only sees q; judgement: the reasoning holds). Alternative with no hook: put the reset inside the hang, i.e. the bottom rest (hold the hang 0.3 s, where the shoulder is already near the straight-arm pose) and shorten the jump to 0 by starting the cycle with a 0.4 s scap-lift that ends at the top via a step the viewer reads as "jumped up". Or accept the cut and label "jump or step to the top" (a real negative begins with a jump). Not [H].
- splitsquat [M]: rear-foot load ~45% (real 15-30%); lane says it needs a front shin off vertical. Reasoning holds for a fixed bench height; cheaper route: front foot 8 px back (shin lean ~5 deg) and trunk lean 18 deg over the front knee moves COM 8 px forward = ~30%. Target rear share <= 35%.
- goblet [L]: stays at parallel (repo rule), COM 156 at the edge of the target; shift hip +3 px at depth.
- bridge2 / hipthrust [L]: knee 84 and 70 vs trainer 90-110: geometric limit (fixed foot, shoulder on the floor/bench) accepted. Not counted against the figures, 8 only for the pose approximation.
- hswalk [L]: counter-balance drift of the swing hip still not mentioned; add 2-3 px opposite hip drift. Free arm bends to 134 at the lift (side-view projection): accept.
- pullup_band [L]: the knee-bend not drawn (front view): accept. Also reset cut, see above, does not apply (band figures are not negatives).
- sled [L]: swing shin max 74 (hip-foot geometry), accepted; confirm the drag-angle/handle is still consistent (post-hand reach 62 px, elbow 160).
- farmer/suitcase [L]: no breathing/shoulder-level change under load; not physics. Belongs to the motion expert.
- Belongs to another expert: label wording on wallhs_90/lean (hip-angle exercises drawn as wall incline) and `hs_wrist_pushups_floor` mapping to wristprep (exercise-figures.ts): coaching/content.
