# 63 calisthenics lens: new figures (arch, dbrow, pulldown)
Evidence: sheet /tmp/cal-new/sheet-01.png + rig.ts lines 775-834. Side views, derived from the builders (angles.md not run).
Scores (movement correctness): arch 8, dbrow 7, pulldown 8. None reaches 9 yet.

## arch (pu_arch_hold, hs_arch_hold) - 8
- [M] arch: lift is chest 7 deg = ~9 px over a 78 px trunk, legs 4 deg = ~8 px; at 56x40 it reads as lying flat, so the hold is not legible -> chest 11 deg, legs 6, arms 12 (still 1-2 deg above trunk line), keep the hips on the floor.
- [M] arch: the head dot (26 px along the trunk line, r 11) sits under the overhead arm, so the neck/face-down read is lost, the arm looks like a stick through the head -> draw the arm after the head (already) but offset head 4 px down toward the floor (face down, neck neutral) or shorten the arm overlap by spreading the shoulder 6 px.
- [L] arch: label says arms and legs "lift a little"; correct, no safety issue (no neck extension, no low-back crank).

## dbrow (pu_dumbbell_row) - 7
- [H] dbrow: back is 17 deg above level (S = P(H,56,-17)); it is a high-shoulder pull-over, not a flat row -> back 10-12 deg. Level back with a straight bench arm needs the hand ahead of the shoulder: arm (~62 px) vertical drop 55 at 12 deg means the bench hand about 28 px ahead of the shoulder (bh = S + [28, ..]) instead of 19. Do not shorten the arm or bend it; the soft arm is the cost of cramming vertical reach.
- [H] dbrow: planted foot F=[124,166] is 88 px from the hip with thigh+shin 86, so the leg is straight (~175 deg) and 48 px behind the hip -> F=[140,166]: hip-foot 80.6 px, knee ~139 deg, foot 32 px behind hip (under the hip-to-bench-edge line, like a real staggered stance). Trim the box left edge from 126 to 150 so the foot stands beside the bench, not inside it.
- [M] dbrow: bench arm "slightly soft" (hand set so reach is ~0.01 short): after the hand shift above make it exactly locked, elbow 178-180 deg, never hyperextended.
- [L] dbrow: end of pull (45 % hip-shoulder + 7 px down) is right: elbow behind shoulder, along the ribs, not overhead. Keep.

## pulldown (pu_lat_pulldown) - 8
- [M] pulldown: end position hand = S + [22, 14] puts the bar 22 px ahead of the shoulder, ~16 px in front of the chest; the label says "to the upper chest" -> end hand S + [12, 16] (bar touches the clavicle line), elbow goes down and slightly back, forearm near vertical.
- [M] pulldown: start hand 17 px ahead of the shoulder gives arms ~15 deg forward of vertical; fine, but the bar crosses the face at ~1300-2200 ms. Check that it passes in front of the chin (hand x >= S + 14 through the 0.3-0.6 range), never through the head dot (r 11 at 22 px along the trunk).
- [L] pulldown: lean 10 deg, thighs under pad, feet flat (shin 93 deg), cable straight to pulley: all correct. Grip width cannot be shown in side view; leave to the label.

## Re-check (render /tmp/cal-r2)
Scores: arch 9, dbrow 9, pulldown 9. Fixes read correctly: arch lift legible at 56x40, head clear; dbrow back near level, planted leg bent and beside the bench, bench arm straight; pulldown bar ends at the upper chest, in front of the chin.
Remaining: no [B]/[H]. [L] dbrow: the bench hand reaches well ahead of the shoulder (arm leans forward); acceptable, do not push the back lower.
