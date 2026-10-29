# Coach review, body v2 (coaching correctness only)

Reviewed: after-body-v2 sheets 01-10 (every sheet), thumbs-actual-size, rig.ts flesh section by name only. Poses are unchanged, so every issue below is a legibility issue created by the added mass, not a pose error.
Not verified: before-after-body-v2.png and thumbs-actual-size.png not opened separately; judgement from sheet tiles at 144px and 56x40.

## Verdict by concern
- Flat back on deadlift / slrdl / splitsquat / squat family: trunk is a narrow pelvis-waist-ribcage taper, back line still reads straight in profile. OK. No lumbar arch or rounding is invented.
- Knee over toe (splitsquat, squat, goblet, frontsquat): thigh/shin capsules are slim enough that the knee-toe relation stays readable. OK.
- Head 0.21x trunk: no chin-poke read in standing/squat figures. Exceptions below (hipthrust, rows, quadruped).
- Hang / pull-up family: arms stay distinct from trunk, role colouring is right (arms thin and orange, not thigh-thick). Only issue is head-over-arms (below).
- Front views (suitcase, farmer, pallof, pullapart, ninety): legs separate cleanly, no merging. Farmer and suitcase arms are correctly thin.
- Floor proportions: dead bug arms now reach overhead past the head and legs read as full length. Pullover arm reaches past the head. Bridge/bridge2 trunk-to-thigh ratio believable. Better than previous round.

## Problems (only where something is wrong)
| figure | frame | problem | fix |
|---|---|---|---|
| hollowtuck | all (tile 144px worst) | Orange blob lying along the floor over the trunk, ~2x as thick as any other arm; reads as a fat torso/thigh slab, hides the posterior pelvic tilt and the tuck itself. Looks like the arm (or the tucked shin) is classified with the thigh radius. | Check role classification: arms must use 0.085->0.048. Draw the arm behind the trunk layer or at ~70% opacity when it overlaps the trunk. |
| deadlift | 0ms, 988ms, 3718ms, tile | Orange arm hangs in front of the trunk and covers the exact line a coach is checking (neutral back, bar over midfoot). At lockout the arm and trunk read as one thick orange-grey column. | Draw arm below trunk in z-order for side views, or thin its stroke 20% while it overlaps the trunk. Keep the trunk silhouette unobstructed. |
| squat / frontsquat / goblet | mid-depth | Same arm-over-trunk overlap, less severe; back angle still readable. | Same z-order rule. Low priority. |
| hipthrust | 0ms, 990ms | Head sits above and slightly ahead of the shoulders on the bench with a visible neck gap; reads as cervical flexion/chin poke when the cue is chin tucked and gaze forward. At lockout the ribcage bulge over the bench edge reads as lumbar extension. | Lower the head so the neck line continues the trunk (chin tucked), and lessen the ribcage taper on supine/inclined trunks (see global fix). |
| bridge, bridge2 | peak | Trunk is a straight line shoulder-knee, so no arch is drawn. But the ribcage lobe plus the pelvis lobe leave a waist dip that can read as a slight lumbar sag next to the flat shoulder line. | Reduce waist/rib delta for floor figures by ~30%, or run the trunk shape as a near-uniform capsule when the trunk is horizontal. |
| hollow, hollowpull | tiles | Ribcage lobe sits up off the floor and reads as thoracic lift while the lower back is meant to be flat/pressed. The pose itself is fine. | Same global fix. Make sure the lumbar/waist point is the one touching the floor line. |
| rowflat, rowincline, rowfeet | top (chest to rings) | Head merges into the orange arm at the rings; the elbow and the head-in-line cue are hard to separate. Hip line looks slightly dipped at the waist (sag read), tile 2x. | Draw the head after the arm with a 1px dark outline, or shift the arm to the far-side layer. Fix the waist dip as above. |
| pullup family (pullup, _slow, _band, _mid, _top) | top and 144px tiles | Head disc (0.21) overlaps and hides both forearms and the bar near the top; at the top frame chin-over-bar vs head-behind-bar is unreadable. | Render head behind the bar line and in front of the arms, or shrink the head 10% for hanging figures only. |
| hang / activehang / scappull | 0ms | Shoulders merge into the head; reads as shrugged ears-to-shoulders, which is the opposite of scap depression (activehang/scappull) and acceptable for passive hang only. | Leave a visible neck gap of ~0.05 trunk in activehang/scappull; keep passive hang as is. |
| wristprep, fingerraise | all | Trunk with the ribcage lobe over the shoulder gives a hump at the thoracic region; reads as rounded upper back in quadruped where the cue is long neutral spine. Head sits level with the trunk, fine. | Use the straightened trunk for quadruped (taper only, no rib lobe). |
| hipflex | tile | Seated trunk is thin relative to the head; the L-marked leg is fine. Cosmetic. | None needed. |

## Global fix suggested (covers 5 of the rows above)
When the trunk is within ~30 deg of horizontal, apply a reduced (about 0.6x) rib-waist-pelvis delta. A side-view body with a lobed trunk invites a spine-curve read that the skeleton never intended.

## Safety
No new provocative position is depicted. Checked against provocative_positions: no hanging knee raise or L-sit, no deep flexion-adduction-IR, no heavy axial squat/deadlift tagged as loaded. The deadlift tile is a block pull at lockout/mid-shin, same as before. Added mass does not hide any red-flag pose; the one safety-adjacent risk is that the deadlift arm-over-trunk overlap hides back-neutrality, which is a teaching gap rather than a depiction of a provocative pose.

## Score (1-10, coaching correctness)
Previous round (after/): 7. Body v2: 7.5. Floor proportions and arm reach are clearly better and limbs are classified correctly almost everywhere. The deduction is mainly hollowtuck (fat arm/limb blob), the lobed trunk on horizontal figures, and arm/head overlaps on the deadlift and pull-up families. Fix those and this is an 8.5.
