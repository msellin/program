# 93 - physics, new figures round 3 (all 11)

Method: jumps.mjs (33 ms steps) for all 11 after the lane changes; cartwheel/matfall also sampled through drawFigure
every 300 ms (hand/foot contact y, end-frame skeleton, COM). Both are FRONT views.

| fig | score | fig | score |
|---|---|---|---|
| threadneedle | 10 | crowroll | 10 |
| hipflex | 10 | matfall | 9 |
| arch | 10 | cartwheel | 10 |
| dbrow | 10 | elbowstand | 10 |
| pulldown | 10 | hollowrock | 10 |
| fingertaps | 10 | | |

Max jump px/33 ms: threadneedle 4.9, hipflex 0.3, arch 2.9, dbrow 2.4, pulldown 4.7, fingertaps 6.1 (peel, intended),
hollowrock 4.8, elbowstand 0.6, crowroll 5.0 (was 6.7), matfall 7.4, cartwheel 6.2 (was 7.4). No teleports.

Checks (measured)
- cartwheel: hand A pinned at (166,168) p 0 -> ~0.70 (t 4200 ms still 166,168); first foot lands (229,166) at ~4.2 s, 63 px
  from A, one at a time; end feet 229/281 (52 px base), hips x 256, y 92, trunk vertical, COM x ~256 vs base centre 255:
  balanced. Hand B lifts early and does not re-plant, as labelled (one hand lifted, then legs down).
- matfall: hand A pinned until the first foot lands (248,165 at 3.0 s); end feet 247/275 on the mat (222..327), COM x 261
  = base centre 261, hips y 88: balanced. Tip now accelerates and lands via foot contact (no creep, no slide).
- threadneedle: planted hand/knee unchanged, wrist-head 20 px; elbowstand/hipflex/arch within rig.ts and CLAUDE.md limits.

Under 10
- matfall [L]: peak 7.4 px/33 ms (0.22 px/ms) at 1254 ms, the free-leg swing in the 0 -> 90 turn, vs 6.2 for cartwheel from
  the same builder. Route: lower matfall swing/bend ease so that segment peaks <= 6 px; no other defect measured.
- No CEILING claimed for any other figure: cartwheel's lateral plane is shown as the front-view straddle, which is what
  this front view can legitimately show.
