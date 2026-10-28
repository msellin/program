# Coach review of the 36 Terav figures (01-coach)

Reviewer: coach pass from rig.ts geometry + contact sheets 01-06. Scores 1-10 (10 = best).
Result: 12 PASS, 24 FIX. Provocative positions: none taught (details at the end).
Coordinates: SVG px, y down, floor y=168, angles in degrees, 0 = right, -90 = up.

## Summary table

| # | figure | verdict | score | one-line problem |
|---|---|---|---|---|
| 1 | hipflex | PASS | 8 | seated iso, hands on thigh, arrow up; good |
| 2 | adductor | FIX | 5 | only ONE leg drawn; ball sits on the knee, not between two; extended variant not shown |
| 3 | bridge | PASS | 8 | straight shoulder-hip-knee line, free leg bent, correct side |
| 4 | deadbug | PASS | 8 | opposite arm/leg, tabletop start, low leg to ~10 deg; correct |
| 5 | kneel | PASS | 7 | upright trunk, small hip shift; back thigh 52-55 vs front 64 |
| 6 | ninety | FIX | 5 | top-down view unreadable; feet pinned, knees wag; arms look like cheering |
| 7 | hang | PASS | 7 | fine; passive vs active hang differ by only 12 px |
| 8 | pullover | PASS | 7 | good range; arm brushes head at end; hollow-pullover mapping wrong |
| 9 | roller | PASS | 8 | roller under upper back, ~35 deg extension, hips down |
| 10 | pullup | FIX | 5 | top: shoulders at bar level, elbows winged sideways at bar height |
| 11 | pullup_slow | FIX | 5 | same geometry/flaw as pullup; only tempo differs |
| 12 | pullup_band | FIX | 5 | same elbow flaw; band overlaps torso and shares arm colour |
| 13 | pullup_partial | FIX | 5 | elbow angle at top ~67 deg, not 90 as cued |
| 14 | pullup_negative | FIX | 4 | rises in 1.2 s at the end (looks like a fast pull-up); 5 s and 10 s share one 10 s loop |
| 15 | pullup_top | FIX | 5 | elbows flared, not tucked; shoulders at bar level |
| 16 | pullup_mid | FIX | 5 | elbow ~67 deg, not 90 |
| 17 | scappull | PASS | 7 | tiny shoulder rise, arms straight; ok |
| 18 | activehang | FIX | 5 | identical to scappull top frame; "scap retraction hold at top" mapped here is wrong |
| 19 | rowflat | FIX | 4 | bottom frame lies on the floor (shoulder 16 px up, hips ~floor) |
| 20 | rowincline | FIX | 4 | only ~11 deg steeper than flat; not distinguishable |
| 21 | rowfeet | FIX | 5 | box present, but shoulders lower than feet at the bottom; looks like flat |
| 22 | pullapart | PASS | 7 | T-sweep, band sags below hands; fine |
| 23 | hollow | PASS | 8 | shoulders and straight legs lifted, low back on floor |
| 24 | wristprep | FIX | 6 | knees slide with the torso; finger raises / wrist push-ups not shown |
| 25 | downdog | PASS | 7 | long line, hands/feet flat; no heel/knee detail needed |
| 26 | child | FIX | 6 | arm segment 91 px (others 46-60); hips fine |
| 27 | wallhs | FIX | 6 | one static pose for 7 exercises (taps, shrugs, pirouettes, belly) |
| 28 | wallhs_lean | FIX | 6 | lean 22 deg is barely different from wallhs (6 deg) |
| 29 | hsfree | PASS | 7 | stack + tiny sway; pirouette mappings wrong |
| 30 | hstuck | FIX | 5 | tucked all cycle, never enters/exits; legs 68 px vs 58 straight |
| 31 | hswalk | FIX | 5 | single arm lifts = hop; no far hand planted; no step |
| 32 | kickup | FIX | 6 | both legs together, straight; no lead/trail leg |
| 33 | wallwalk | FIX | 4 | start pose has feet 90 px up the wall; should be a floor plank |
| 34 | squat | FIX | 5 | head clipped at top; shin near vertical; arm hangs, no grip on bar |
| 35 | frontsquat | FIX | 4 | arm points down-forward; elbows are not high; head clipped |
| 36 | deadlift | FIX | 6 | start torso only ~25 deg above horizontal (reads RDL); foot behind ankle |

## FIX detail

**adductor (5).** Only one leg chain `[H,K,F]` is drawn; the ball is at `K+(-4,8)` so it reads as a ball on one knee. Add the second leg in FAR colour, `K2` = `K + (-16,0)` and `F2` = `F + (-10,0)`, and put the ball between the two knees at their midpoint (circle squeezed, r 10 to 7.5). `adductor_iso_extended` ("knees at 45 degrees, longer lever") shares the pose: needs its own variant with the foot at about x=300 (shin and thigh nearly straight, knees apart) or accept a 2-variant figure.

**ninety (5).** Top-down view is the hardest view to read at 56x40. Feet are pinned at (108,172) and (250,172) and only the knees wag, so it reads as wobbly legs, not a hip switch. The arms (146,34)/(210,34) look raised. Suggest a floor-level front view or at least: knees sweep with the shins (foot pivots about the ankle, foot y follows), arms short and behind the hips (end at y≈80), plus a floor line. Keep the phi clamp (see safety).

**pullup, pullup_slow, pullup_band, pullup_top, pullup_partial, pullup_mid (all 5).** One shared flaw in `pullFig`. At h=1 `Sy=lerp(78,32,h)=32`, so shoulders sit at bar height (bar y=28/30) and the hands (152,30) are 14 px from the shoulders. The elbow solver then throws elbows 24 px out sideways, level with the bar: a "W" wing. A real top has shoulders about 14 px BELOW the bar, elbows pointing down and in, chin at the bar. Fix: `Sy = lerp(78, 44, h)`, head at `Sy-14` stays over the bar (chin at bar y≈30), elbows come out below the hands. Also `pullup_top` cue "elbows tucked": bring grip in (hands x 160/198) at the top or accept.
- Mid/partial: cued as "elbows at right angle". At h=0.5, shoulder-hand dist 28.7 gives ~67 deg. For 90 deg use shoulder-hand dist ~37 px, i.e. h ≈ 0.30-0.35 on the new scale (Sy≈62).
- pullup_band: bronze band lines at x=172/186 run through the torso (179 +/- 6) and match the arm bronze. Put them at x=164/194 outside the torso, drawn first (behind), and use a distinct tone from the working-limb bronze.
- pullup vs pullup_slow vs GtG: geometry is identical (only 5 s vs 9 s). Acceptable for slow, but then add a visual: for slow, hold at the top 1 s, and for GtG (`pu_grease_the_groove_singles`) a 3.5 s cycle with a long rest at the bottom (k=[0.05,0.25,0.35]) so it reads as "one crisp single, then rest". Currently first-strict-attempt, slow and GtG are indistinguishable at thumbnail size.

**pullup_negative (4).** `k=[0.04,0.8,0.88]`: lowering takes 7.6 s, then the return to the top takes 1.2 s via `1-ease`, which animates as a fast pull-up and teaches the wrong thing. Make the return a cut (hold the bottom, then jump to top with opacity/instant: e.g. k=[0.04,0.9,0.97] and the return instant) or step-up style. `pu_negative_pullup_5s` and `_10s` both play a 10 s loop: split in two figures: 5 s lower = dur 6500, 10 s lower = dur 11500.

**activehang (5).** `from=to=1, scap=true` gives Sy=70, which is exactly scappull's top frame, and 12 px different from passive hang (Sy 78+4). It is fine for `pu_active_hang`, but `pu_scap_retraction_hold` ("scap retraction hold at top") is mapped here: that is the pull-up top with shoulder blades back, so it should map to `pullup_top` (after the elbow fix), not a hang. For active hang increase the contrast: `Sy=lerp(78,66,h)` (passive sinks to 82).

**rowflat / rowincline / rowfeet (4,4,5).** Ring height `yHand` is too low for flat: bottom shoulder y=152 (feet 164), hips about 4 px off the floor. The body lies on the ground and the ring set looks 16 px above it. Distinction between the three is weak (bottom incline: flat 4.6 deg, incline 15 deg, top 20 / 32 deg). Suggested: rowflat `yHand` 90 (bottom ~10 deg, top ~26 deg); rowincline `yHand` 36, which needs the anchor `A` moved up to y=-20 (bottom ~32 deg, top ~53 deg); rowfeet keep F=(268,128) but `yHand` 100 so the bottom shows body level and the top slightly rising. Right now rowfeet at the bottom has shoulders 24 px below feet (declined, hips sag toward the floor); keep the body line level at the bottom instead.
Body line itself (foot-hip-shoulder collinear) is correct, no hip break. Elbow direction (toward the feet) is correct.

**wristprep (6).** `H = S - 98`, so when the shoulders rock forward the hips AND knees slide forward by 23 px; in a wrist rock the knees stay planted. Fix: keep `H` fixed at (S0.x-98) and shorten via rotating the torso about the hip instead (small angle), or drop knee shift. Mapping: `hs_finger_raises` (individual finger lifts) and `hs_wrist_pushups_floor` are shown as a rocking motion; at minimum add the fingertip segment lifting 6 px (hand polyline [x-14..x+14] raising its front 5 px at p=1) for finger raises.

**child (6).** Arm S(186,150) to hand (96,164) is 91 px; every other arm is 46-60. Bring the hand to (136,164) (arm ~55), or move the shoulder forward. Thigh K-H is 39 px against shin 58: lengthen thigh to ~55 by moving hip to (258,142) or knee to (200,164).

**wallhs (6).** Pose is fine (6 deg lean, feet on wall), but it serves 7 exercises: chest hold, belly hold, **shoulder taps** (one hand lifts), **supported shrugs** (shoulders shrug up/down), **half pirouette / quarter pirouette exit** (hand pivot / leg lowering), and incline 90 hold. At least: (a) a `wallhs_shrug` move variant: lerp S.y by 6 px up and down, arm shortened visually by raising the head dot 6 px into the shoulders; (b) a `wallhs_taps` variant with a far arm (FAR colour) and a near arm that lifts its hand to the opposite shoulder (hand y 168 to 122, body stays still); (c) the pirouettes can stay on `wallhs` only if the label says so. `hs_wall_hs_hold_belly`: if belly = facing away from the wall the figure faces the wrong way (head offset +9 toward wall); mirror the head and feet to the other side. Cheapest fix: do (a) and (b).

**wallhs_lean (6).** Only 22 deg vs 6 deg for wallhs; "135 incline" and "90 incline" should read as clearly different steps. Use lean 35-40 with hands at x≈120 (feet drop to y≈50 on the wall), and give `hs_incline_90_hold` a different lean than the chest hold (e.g. 15).

**hstuck (5).** `tuck: true` draws the tucked leg for the entire cycle, with only the 4 deg lean moving. Thigh 34 + shin 34 = 68 vs straight legs 58 (lengths changing between figures). Animate p: straight to tuck to straight: `K = P(H, 34, a + lerp(0,30,p))` ... and the shin angle `a - lerp(0,70,p)`; use 29/29 segments so the leg total equals 58.

**hswalk (5).** One arm only; at 0-0.5 the single arm lifts 6 px, so both hands are off the floor at once (a hop). Add a far arm in FAR colour planted at x=180; near arm lifts and steps to 198; then the far arm follows (second half of the cycle: far arm steps while near stays). Legs also never counterbalance; a 3 deg leg split would help. Several mapped drills (over a plate, through cones, marker path) cannot be told apart; acceptable if the label is generic.

**kickup (6).** Start pose: body straight 25 deg above horizontal behind the hands (a long "plank/pike"), both legs rigid together. Kick-up is lead leg (bent, then straight) plus trail leg. Draw two leg chains: lead `F1 = P(H,58,lerp(-150,-92,p))`, trail `F2` with 0.15 p lag, in FAR colour for the trail; start lunge: lead knee bent. The kick path itself (from behind, up and over to stack) is the right direction.

**wallwalk (4).** At p=0: `dx=133`, `F.y = 122 - sqrt(140²-133²) = 78`, the feet already 90 px up the wall; frame 0 is a pike, not the plank described in the cue. Start must be a floor plank: feet at y≈166, so use `F.y = 122 + sqrt(140²-dx²)` for dx from 133 to the point where F.y reaches the floor, then switch to the `-` branch as the feet climb (or parametrize by foot height lerp(166,-10,p) and solve hx). Hands walking in (hx from 167 to 254) is right. Also make the wall prop taller at the top and keep the head 6 px forward as is.

**squat (5).** (1) At 0 ms the head dot is at y=0 (S.y=24, head S.y-24) and is clipped by the tile; scale 0.9 or shift the squat origin down 12 px. (2) Shin tilt at the bottom ~5 deg (knee x 176, ankle x 172): real high-bar bottoms have ~25-30 deg. Set `F=[155,166]` and hip path `[155,80] to [129,127]`: shin ~25 deg, thigh parallel, hips 26 px behind the ankle, bar over mid-foot. (3) The arm is S to (S.x+6,S.y+24): hangs by the side, no grip. Use two segments: `[S+(-6,2), E=(S.x-12,S.y+18), hand = bar]` (elbow back and down, hand on bar). (4) Depth is correct (thigh parallel).

**frontsquat (4).** Arm `[S, S+(22,24)]` points down-forward at 45 deg; cue is "elbows high". Draw two segments: elbow `E=(S.x+24, S.y-2)` (upper arm forward, nearly horizontal), then back to the bar `hand=(S.x+10, S.y-8)`. Bar is placed correctly on the front shoulders (S+(10,2)). Head clipping same as squat. Torso lean 12 deg is right.

**deadlift (6).** Start lean 65 deg puts the torso 25 deg above horizontal with hips (y=114) only 10 px above the knee (y=124): reads as an RDL / good morning, not a block pull. Use lean 55 and `H0=[134,124]`; keep bar at y≈146 (mid-shin). Bar x is 11 px ahead of the ankle; fine (touching shins). Lockout is good (hip over ankle, bar at hip). The foot stub extends behind the ankle (see cross-cutting).

## Figures that passed (short notes)

- hipflex: thigh ends 14 deg above horizontal (hip ~100 deg flexion); do not raise it further. Hand-on-thigh with up arrow = correct isometric.
- bridge: free leg tabletop (thigh ~vertical, shin horizontal), planted knee rises above the hip (straight line shoulder-hip-knee, ~20 deg). Good tempo (5 s, 2 s hold).
- deadbug: opposite pairs verified in both reps; leg stops ~10 deg above floor; 7 s per rep is right.
- kneel: trunk upright (-90 to -88), hip travels 16 px, ring fades in at the stretch; fine. Back thigh 52-55 vs front 64 is a small length inconsistency.
- roller: ~35 deg extension, hips lowered, hands cup head; good.
- hang: ok; passive hang sinks 4 px. Feet exit the tile at y=192 (cropped) on all bar figures, harmless.
- scappull: 8 px rise (about 4-5 cm); correct "tiny".
- pullapart: sweeps to T, band sags 10 px under the hands; good.
- hollow: shoulders +19 px, feet +24 px, ring marks the lumbar contact. Good.
- downdog: collinear arms-spine, hips high; fine.
- hsfree: vertical stack, 4 deg sway.

## Safety: provocative positions

No figure teaches a provocative position.
- ninety: clamped (phi +/-55). At the extreme the front thigh points straight forward with the shin lateral (external rotation) and the rear leg is abducted with internal rotation, never adduction past the hip line: OK. Keep the clamp if this figure is redrawn.
- hipflex: bent-knee seated hold, not a straight-leg raise; bridge free leg held bent, as the panel required. Dead bug legs lower with straight legs but unloaded (no resisted SLR); keep the end at about 10 deg above the floor, no lower.
- Hanging knee raise / L-sit / Copenhagen / couch stretch: none drawn.
- Caution (not a figure bug): squat, front squat and block pull show a loaded bar (axial load). Make sure these three figures are only reachable from concurrent-strength-maintenance and never from the anterior-hip-rebuild program.

## Cross-cutting (6)

1. Shared figures misrepresent moving exercises: hs_wall_shoulder_taps, hs_wall_supported_shrugs, hs_half_pirouette_wall, quarter_pirouette_exit, hs_half/full_pirouette_free (all static poses), hs_finger_raises and hs_wrist_pushups_floor (rocking), pu_hollow_body_pullover (feet planted, dowel instead of dumbbell), adductor_iso_extended, pu_scap_retraction_hold, pu_negative 5 s/10 s. Add variants or label-only fallbacks.
2. Pull-up family all share one top-frame defect (shoulders at bar level, winged elbows); fix `Sy` range once in `pullFig` and 7 figures improve. Then differentiate by timing: slow (hold at top), GtG (rest), negative (instant reset).
3. Proportions vary between families: leg length 58 (hang, pull-up, handstand), 86 (squat, deadlift), 128 (floor figures); arm 46/52/54/60/91. Adopt one length table (legs ~86 total for upright figures, arms ~52).
4. Foot stubs in squat, front squat and deadlift run 14 px behind the ankle point (the shin ends at the toe tip). Draw heel at F.x-4 and toe at F.x+12 in the facing direction.
5. Framing: squat and front squat heads are clipped at y=0 when standing; bar figures' feet leave the tile at y=192. Reduce scale to 0.9 for the squat family and set a vertical offset so head top >= 8.
6. Return phases animate as a mirror of the effort (negative pull-up, kick-up, hold exits). Where the real return is a reset (negative up, kick-up setdown) use a quick fade/cut or a labelled reset instead of a reverse animation.
