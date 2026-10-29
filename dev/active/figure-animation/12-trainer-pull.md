# Trainer review: pull-up / hang / row family (strict pull-up coach), 2026-10-29
Bar figures are front views and `angles.md` has no joint data for them, so I derived angles from `pullFig` in rig.ts
(arm segments 26+26, hands at y=30 and x=152/206, shoulders x=166/192, shoulder y = lerp(78,46,h), bar centre y=28).
Derived elbow: dead hang ~165-170 deg, h=0.35 ~99 deg, chin-over ~44 deg. Norm used: top of a strict pull-up has the
shoulders ~8-10 cm under the bar, elbow ~30-40 deg, chin clearly above the bar; mid-range elbow ~90 deg.

### hang - 8/10
- [L] Shoulder shrug is only 4 px, subtle in the 56x40 brief thumb -> 6-8 px; reads fine at 144 px. Elbow ~170, target 175-180.
### activehang - 7/10
- [M] Head top reaches y~29, overlapping the bar (bar spans 25-31) -> keep a 3-4 px gap: lift 8 (not 12) or head offset 24.
- [L] Depression is correct (arms stay straight, trunk rises, shoulder joints fixed). Real rise is ~3-6 cm -> 6-8 px.
### scappull - 6/10
- [M] Same head-into-bar overlap at peak (lift 12) -> lift 6-8, head clear of bar.
- [M] Down phase 1.2 s is as fast as the up: scap pull is taught 1 s up, 1 s hold, 2 s down -> k to ~[0.1,0.3,0.5,0.9].
### pullup - 7/10
- [H] Top is chin AT the bar, not over it: head centre y=18, chin y=29, bar drawn in front -> chin must clear: shoulder y 40-42 at h=1 (elbow ~30-35, shoulders 8-10 below the bar), head centre <= 12.
- [M] No scapular start: the shoulders go straight into elbow flexion. A coach teaches depress first (~4-6 px, arms straight) then pull -> first 15% of the up phase is scap only.
- [M] Mid-pull the head crosses the bar line at h~0.35 (head top 27.7): head must stay clearly below the bar until the chin reaches it.
- [L] Tempo ~1.3 s up, 0.5 s top, 2.3 s down is right. Grip 54 px = ~2x shoulder width, fine (1.5x preferred).
### pullup_single - 6/10
- [M] Same top and head issues as pullup. Lowering is 1.5 s (faster than pullup 2.3 s) -> same control, 2-3 s.
- [L] Label says "let go and rest" but the figure keeps hanging for 2.7 s; show a pause only, or reword the label.
### pullup_slow - 7/10
- [M] Same top issue. Phases ~3 s up, 0.6 s pause, 4 s down: right for 3-1-4 tempo; give the pause a true 1 s (k 0.35 -> 0.42 is 0.63 s).
### pullup_band / pullup_band_light - 6/10 each
- [M] Band hangs as two straight lines from the bar at x=164/194, i.e. on top of the shoulders and forearms like a curtain -> loop around the bar at x~150/208 or hang it clear of the arms, and end under the knees.
- [M] Legs are straight and the band sits at knee height: a banded rep has the knees slightly bent in front (shins back). Acceptable in a front view, but add ~10 px of bend or show it by the band touching behind the knees.
- [L] Thick vs thin is the only difference; stretch shortens correctly at the top (assistance is largest at the bottom, a thicker line there would teach it).
- [M] Same top, scap and head issues as pullup.
### pullup_partial - 7/10
- [L] Ends at h=0.35: elbow ~99 deg, a right angle as the label says. Good. Hand/shoulder start is straight arms. Head crosses the bar line at the top of the range (see mid).
### pullup_negative (10 s) / pullup_negative5 (5 s) - 6/10 each
- [H] Durations do not match the labels: 10 s negative lowers in 8.0 s, 5 s one in 4.5 s -> lowerMs 10000 and 5000 (control tempo, near constant speed).
- [M] Start pose has the chin at the bar, not over it (see pullup); a negative starts from chin clearly over.
- [L] Cut back to the top is fine and says "step up" in the label. Keep.
### pullup_top - 6/10
- [H] Label says chin over the bar; figure is chin level with it, and the bar is drawn in front of the face -> shoulders y 40-42, head clear above.
- [L] Retraction is 3 px; fine for a front view.
### pullup_mid - 8/10
- [M] Elbow ~99 deg is right, but head top sits on the bar (y 27.7) -> drop the head 6-8 px or draw it behind the bar so the face reads below it.
### rowflat - 5/10
- [H] Elbow path is wrong: upper arm swings overhead as you pull. Measured shoulder angle 108 -> 174 at 25% -> 149 at the top, elbow 164 -> 45. In a ring row the elbows travel back along the ribs and finish behind the torso (shoulder angle ~40-70 at the top, upper arm pointing toward the feet). `ik(..., false)` bends toward the head; flip it to put the elbow behind/below.
- [M] Bottom elbow is 164, not straight (arms "fully straight" in the label) -> 175-180 (shoulder 51.5 from the ring needs 52+).
- [M] Body line goes 9 -> 23 deg off horizontal at the top: fine and realistic for a fixed-foot row; keep, but hip must stay in line (check align cue is satisfied at 75%: trunk 79 vs 67 shows the body shifts, ok).
### rowincline - 3/10
- [H] The pull barely happens: elbow only 164 -> 130, shoulder 161 -> 156, trunk 56 -> 50. Hand-to-foot distance (~197) exceeds L + shoulder reach at the top (150+20), so the IK clamps and the chest never reaches the rings. Target: elbow 175-180 -> 40-50, chest to the rings, body ~35-40 deg off horizontal throughout. Move the rings/feet so the top is reachable (hand-foot distance <= 170).
- [H] Same overhead elbow direction as rowflat once it can move.
### rowfeet - 5/10
- [H] Same overhead upper arm: shoulder 97 -> 174 at 50%, elbow 164 -> 45. Target shoulder <=70 at the top.
- [L] Level body at the bottom (89 deg) and 10 deg tilt at the top is right for feet elevated.
### pullapart - 6/10
- [M] Start hands are ~62 px apart and outside the shoulders; real start is hands shoulder-width in front of the chest (~26-30 px) with the band straight -> start spread ~30, end ~130 (arms level, 90 deg abduction, hands at 2x+ shoulder width).
- [M] Shoulders never move: label says blades squeeze together. Shoulder x 166/192 -> 169/189 at the end.
- [L] Band is a U that drops 10 px below the hands; a loaded band is a straight line between the hands.
- [L] Arm length changes (foreshortened toward the viewer); acceptable but state it as front-view foreshortening in the comment.

## Lowest scorers
rowincline 3, rowflat 5, rowfeet 5, then scappull/pullup_band/pullup_band_light/negatives/pullup_top/pullapart at 6.
Shared fixes (one change lifts ~12 figures): chin clearly over the bar at the top (shoulder y ~41), head clear of the bar mid-rep, scap-first start, negative lowering times match labels.
