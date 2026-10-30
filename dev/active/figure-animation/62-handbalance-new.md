# 62 - handbalance review, six new figures (movement correctness, 1-10)
Evidence: /tmp/hb-new/sheet-01.png + rig.ts 874-1020 + exercises.json cues. Static read of code; no angles.md rerun.

| fig | score |
|---|---|
| fingertaps | 8 |
| hollowrock | 8 |
| elbowstand | 8 |
| crowroll | 8 |
| matfall | 4 |
| cartwheel | 8 |

## Findings
- [B] matfall: chest-to-wall facing the wall (right), the body tips AWAY from it (trunk -84 -> -180, shoulders to x 146, feet to the left). Heels leaving the wall backward = overbalancing into a back-bend over locked arms (bridge / back walkover), not a rounded-back landing; a rounded landing on the upper back from there is not what happens (feet come over first). Facing the wall there is no safe tuck-roll exit. The exercise's own cue says "exit direction: side (one of the two drilled above)". → Correct bail = side exit (cartwheel/pirouette). Rebuild matfall as the front view (front:true, scale .75) reusing cartwheel's rig(): handstand 0-0.12, lift trailing... lead hand at 0.12, body turns over the other arm, feet land on a mat drawn on the floor; add an exhale ring at first foot contact (~p .45) and a 1 s "land, stand" settle. Drop the wall-away tuck/shin-hold ending; mat box stays under the landing x.
- [M] matfall (if the side view is kept anyway): the wall must be at the BACK of the arc, i.e. feet land toward the wall side; never draw feet over the back side. Prefer the rebuild above.
- [M] cartwheel: first foot lands ~100 px (0.6 body height) from the nearest hand. For a cartwheel travelling out that is within the real range (pivot about the hand, straight legs at ~45 deg gives ~140 px) but a controlled WALL exit lands closer. → pike the legs on the way down: bend 1 -> 0.74 starting at psi 30 -> start at psi 15 and end at 0.6, shift Hend from [236,88] to [214,90] so feet land ~55-65 px from hand A and the finish stays between the hands' line and the mat. Also widen the straddle (dl 30/dt -18 -> 38/-22) so the legs visibly split.
- [L] cartwheel: handB lifts at p .12 and the hands are ~26 px apart (shoulder width) - correct order (lead hand off first, foot on the same side lands first). Keep. 56x40 thumb reads as a vertical bar; add a 2 px lateral offset of the hips at p ~.5 so the thumb shows travel.
- [M] hollowrock: ±9 deg about the pelvis is too small to read (shoulder travel ~12 px at tile size); real hollow rocks swing ~15-20 deg. Segments are straight lines: no hollow. → rho 9 -> 15; bend the trunk/pelvis slightly (ribs-to-pelvis 8 deg posterior tilt, e.g. trunk angle a+4, legs a-2, a=14 -> 12 shoulders / 10 legs); header comment says 1 s per rock but dur is 2400 ms - make the comment true or set dur 1800 (one rock each way). Keep legs/shoulders low and the contact ring (nice).
- [M] elbowstand: label says "elbow stand / straddle L" but the drawing is a straight-arm straddle L stand, hips 56 px above the shoulders, trunk 22 deg back. The side view cannot show the straddle (far leg only 6 px lower, 6 px shorter). → keep the straight-arm pose (it is the safe Kinoshita position 3 variant) but widen the far leg to lift+16 and length 70 so the straddle reads, and note in the label "forearms optional". Hold: add a ±1.5 deg breathing sway of the legs (lift 10 -> 8..12) so it is not a static pic; weight sits over fingers (hips behind hands by ~ 20 px at tr -112) - good.
- [M] crowroll: sequence is right (chin tuck, hips over shoulders, hands stay until shoulders pass, finish on the back with hands to shins). 7000 ms with ~1.4 s of motion is slow and scale .9 makes the 56x40 thumb (figure ~10 px tall) unreadable. → scale .9 -> 1.1, shave dur to 5500, make the hands-to-shins arrive at p .74 not .8, hold the end 0.2.
- [L] fingertaps: right line (20 deg, shoulder-hip-foot marks). No weight shift is drawn before a hand leaves. → shoulder sway 1.5 px toward the planted hand 0.1 s before each peel (or a 1 deg torso lean) so the rule "shift first, then lift" is visible; 4 taps in 0.5 s each is OK, maybe slow to 0.6 s (dur 4800).
- Nothing here breaks a rig.ts / CLAUDE.md safety rule (all spines neutral or rounded-forward; the matfall back-bend was the only violation risk).

## Round 2 (re-render /tmp/hb-r2)
Scores: fingertaps 8, hollowrock 8, elbowstand 9, crowroll 8, matfall 8, cartwheel 8. No [B]/[H] left; matfall's wall-away bail is gone (side exit, mat to the right, exhale ring).
- [M] matfall/cartwheel: the 56x40 thumbs are still a thin vertical bar or low crouch; the mat is small and far from the hands in the 144 px tile - widen it to ~40 px and put its near edge ~25 px from the landing foot.
- [M] hollowrock: shape still two straight segments (no visible rib-down curve); wider rock now reads. Keep 8 until the trunk tilt is added.
- [L] crowroll: thumb figure ~10 px tall; scale 1.1. fingertaps: 7 px peel and dip are subtle at 56x40 - acceptable.
