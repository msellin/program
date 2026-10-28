# Ideas 03: how the figures could teach more realistically (coach / biomechanics lens)

Not a re-review. Rig facts used: upright figures = thigh 44 / shin 42 / trunk 56-58 / arm 26+26 (squat, bar, handstand);
floor figures = thigh 62 / shin 58 / trunk ~98-100 / arm ~60 (bridge, pullover, deadbug). Head = 11 px radius. Floor y=168.
Anthropometry check: take H from legs (86/0.49 = 175 upright; 120/0.49 = 245 floor). Upright is close (trunk 56 vs 0.29H = 51;
arm 52 vs 0.33H = 58). The FLOOR family is the outlier: trunk 100 vs 0.29x245 = 71 (about 40% long), arm 60 vs 81 (25% short),
head 22 vs 0.13H = 32 (small). That is why lying figures read "long-bodied with stubby arms". Provocative positions untouched by every idea below.

## 1. One proportion table, applied to the floor family (S)
- What: scale floor figures to the upright table: trunk 100 -> 72, arm 60 -> 78 (upper 45, fore 33), head r 11 -> 14. Or scale the
  upright family to H=245 instead. One `ANTHRO` const (thigh .245, shin .246, trunk .29, uarm .186, farm .146, head r .065 x H) feeding both.
- Why: lever lengths set what a lift feels like. A 100 px trunk against a 62 px thigh makes a bridge look hip-dominant and makes
  pullover/dead-bug arms look short, so "reach overhead" never reaches the floor. Shoulder-flexion range (ear-level at 180 deg) is only legible when the arm is ~0.33 H.
- Figures: bridge, bridge2, deadbug, pullover, roller, hollow*, adductor, wristprep, child, downdog. Gain 6/10 (all lying drills). Effort M (re-tune the poses and `rig.test.ts` bounds).

## 2. Spine as 3 segments with a visible curve, plus a "ribs-down" tick (M)
- What: replace the single TORSO line with pelvis-lumbar-thorax: [H, L = H+0.45T, S] with the lumbar kink at +/-8 deg and a thoracic kink at +/-10.
  Per drill: neutral = lumbar 6 deg forward-convex curve; flexed (hollow, dead bug low back) = lumbar flat to 0 and a short ribs-down tick (a 10 px bronze
  arrow pointing down at the lower rib) that appears when the cue is "ribs down"; bad-form ghost not shown (general library, no fault pictures).
- Why: "neutral spine" is a curve, not a rod. Hollow/dead bug/RDL/deadlift/squat all teach "keep the back flat" and a ruler-straight back also teaches the lumbar-flat
  fault (posterior-tilt tuck at squat bottom). Thoracic extension on the roller and the pullover rib flare only exist if the thorax can move on the pelvis.
- Figures: deadbug, hollow, hollowtuck, hollowpull, pullover, roller, deadlift, squat family, slrdl, hipthrust, nordic (hip line), handstand (rib stack, "no banana").
  Gain 7/10. Effort M-L (polyline of 3 points per torso; all builders call `sc.line([H,S],BODY,TORSO)` so a helper `torso(sc,H,S,curve)` is a mechanical swap).

## 3. Scapulohumeral rhythm on every overhead / pull drill (M)
- What: add a scapula as a 12 px stub at the shoulder that rotates; humerus elevation e from 0..180: scapular upward rotation = e/3 (2:1 rhythm after ~30 deg),
  clavicle elevation 0..12 px at the top. In hang/pull-up: passive hang = scap elevated (shoulder 4 px up toward ear; already done), active/scap pull = depressed
  (shoulder moves 8-12 px DOWN from the ear, arm stays straight; already drawn as trunk rise), pull-up top = depressed+retracted (shoulder BELOW the bar, elbow tucked). Add the missing
  half: in front view draw the two shoulder points sliding together 6 px at the top of retraction (`sL.x +3, sR.x -3`) so "pull shoulder blades together and down" is a visible event.
  On pullover/wall handstand: shoulders elevate (shrug) only in the last 30 deg; hold the trunk static.
- Why: overhead range is ~60 deg glenohumeral + scap. A hand reaching the floor on the pullover with a flat trunk teaches a lumbar-extension cheat; the 2:1 rhythm shows where the range should come from.
  A handstand with a depressed (non-shrugged) shoulder is the core cue; at the moment `wallhs_shrug` is the only figure that shows elevation, so the "open shoulder" is never shown as the target.
- Figures: pullover, hollowpull, activehang, scappull, pullup_top, pullapart, wallhs*, hsfree. Gain 7/10. Effort M.

## 4. Knee travel coupled to ankle dorsiflexion, with a shin-angle readout (S)
- What: squats currently set shin ~25 deg from the IK solution only. Make the ankle explicit: foot flat, shin angle = 18-28 deg (air/back/front), the heel stays at F.x-4;
  show a thin vertical dashed line from the toe (F.x+12) and let the knee end 0-6 px past it. Heel-raised variant not drawn. Ghost: faint (op .25) standing shin at 0 deg so the tilt is read as "ankle bends".
  Hip:knee ratio: thigh-to-trunk angle at the bottom ~ hip 120 deg flexion with knee ~110; check trunk-shin parallelism (trunk lean 33 back / 12 front / 30 air / 22 goblet; shin 25) = trunk within ~8 deg of the shin angle for a back squat.
  Rig tweak: back squat lean 33 -> 38 so trunk ~ parallel to shin at 25-30 is not exceeded (currently 33 vs 25 = fine, keep); front squat lean 12 vs shin 25 is correct (more upright trunk).
- Why: most beginners fail squats by heels lifting or by hinge-only; a visible ankle angle teaches that the knee goes forward and the trunk follows the shin.
- Figures: squat, frontsquat, airsquat, goblet, splitsquat (front shin vertical vs 15 deg). Gain 6/10. Effort S.

## 5. Single key-cue overlay per drill, from one 4-type palette (M, best value-per-pixel)
- What: `cue?: {type, ...}` on Fig; the renderer draws ONE thin overlay in bronze at 40% opacity (never in thumbs < 64 px):
  - vertical line (bar path): over mid-foot x = F.x + 4 (squat, front squat, deadlift, goblet bell, bridge shin vertical, farmer). Bar centre drawn with a faint trail of 6 past positions (motion trail) so the bar's straightness is the lesson. In numbers: deadlift bar x should stay within +/-4 px of F.x+4 for the whole pull (currently 180 -> 172 -> ok; make it an asserted test).
  - level line: hip-height marker at knee height (parallel marker: horizontal tick at y(knee) that the hip crease touches, airsquat/goblet/splitsquat/hipthrust hip = bench top).
  - angle arc: 12 px arc with no number at the key joint (elbow 90 deg on mid hold, hip 90 on a-march, shin 25 on squat).
  - alignment line: ear-shoulder-hip-ankle straight line (handstand, hollow, nordic, plank/wall walk, slrdl) drawn dashed; turns solid when the figure is within 5 deg.
- Why: novices cannot extract "what to watch" from a moving silhouette; one explicit reference line converts animation into a check ("is my bar over my foot?"). Pure geometry, no text.
- Figures: ~30 of 50; Gain 8/10. Effort M (renderer: one dashed slot or two reused from the 24-slot list; reduced motion shows it on the poster).

## 6. Choose the view by what the drill is: add front/3-quarter ghosts where side hides the lesson (L)
- Side is right for: squats, hinges, bridge, hollow, dead bug. Front view is better for: pull-up elbow path (tucked, not flared), band pull-apart (already), Pallof (already),
  carries (already), nordic (hips level), wall handstand shoulder shrug (front shows scap elevation), hs_walk (hand placement under shoulders, base width), step/split-squat (knee not caving), scap pull (shoulders together).
  Implement as a second build per Fig (`front?: build`) and a tiny "side / front" toggle in the player that swaps; poster stays the side.
- Why: the faults that matter are frontal-plane (valgus, hip drop, elbow flare, hand width). Side-only figures cannot depict them, so they cannot teach the cue "track the knee over the 2nd toe".
- Figures: squat family, splitsquat, pullup family, nordic, hswalk/hsfree, wallhs*, wallwalk, bridge. Gain 7/10. Effort L (about 12 new builders; front rig already exists for carries).

## 7. Variant ladders drawn as a ghost of the neighbouring rung (S)
- What: variant figures draw the NEXT-harder and NEXT-easier pose at 20% opacity as outlines, and a 3-dot "rung" indicator (filled = this one). Numbers:
  - band heavy -> light: band line + resistance hint: sag = 24 px (heavy) / 14 (medium) / 6 (light) and bar-to-band-bottom tension colour; the foot/knee loop (single-leg through band) is NOT drawn. Heavy = more of the body weight carried by band: show hips +8 px higher at the bottom of the rep.
  - ring row: body angle 0 deg / 30 / 55 from horizontal (ring height 150 -> 118 -> 90 px above the floor) with a ghost of 30 behind 0.
  - incline handstand 135 -> 90: lean 38 and 22 deg from vertical (wall angle = 180 - lean... 135 = body 45 deg off vertical): ghost at 45, then 0; hands x offset 120 vs 160.
  - negatives 5 s / 10 s: not a pose but a time-bar under the figure (thin line that fills over 5 or 10 s, 3 px high) so the duration difference is visible.
- Why: progression-by-angle works only if the learner can see the angle changes loading (moment arm of body weight about the shoulder = sin(angle) x length). A ghost shows both "you are here" and "this is the next step".
- Figures: pullup_band, rowflat/incline/feet, wallhs_lean/wallhs_90/wallhs, pullup_negative(5), pullup_partial/mid/top, wristprep->fingerraise. Gain 6/10. Effort S-M.

## 8. Weight-distribution / base-of-support dot (S)
- What: a bronze dot on the floor under the centre of mass (CoM = weighted mean of trunk 0.50, thigh 0.10 x2, shank 0.05 x2, head 0.08, arms 0.05 x2 plus load), drawn as the dot on a 2 px base bar spanning heel to toe (or hands to feet for floor work).
  Dot must stay inside the bar: asserted in `rig.test.ts` (squat bar-over-midfoot test = CoM-with-load within heel..toe). In a one-leg stand (slrdl, A-march, kneel) base bar shrinks to the single foot, which visibly explains why they wobble.
- Why: balance is the hidden variable of nearly every drill; dot-in-base is the pass/fail criterion coaches use. Cheap (2 slots, 1 weighted mean).
- Figures: squat family, deadlift, slrdl, amarch, kneel, splitsquat, handstands (base = hand width; dot over hands, sway shown as dot movement), hswalk (dot crosses to the planted hand before the other lifts). Gain 6/10. Effort S.

## 9. Pace/phase indicator and breath marker (S)
- What: a 3 px phase bar beneath each figure: green segment = concentric, long grey = eccentric, short bronze = hold (the k=[..] keys already hold this). Optional breath tick (in on lowering, out on effort) for hollow, dead bug, Pallof.
- Why: tempo is a teaching variable (2:1 eccentric emphasis, 3-5 s holds) the figure cannot say alone; the phase bar makes "down 2.3 s, up 1.3 s" readable.
- Figures: all `move` types. Gain 4/10 (teaches tempo, not position). Effort S.

## Mapped exercises that still share a figure that teaches them poorly (checked against `EXERCISE_FIGURES`)
- `hs_half_pirouette_wall`, `quarter_pirouette_exit` -> `wallhs` (static; the lesson is a rotation): a top-view footprint (hands as two dots, feet arc 90/180 deg) or 3-quarter view is needed. Gain 6.
- `hs_half_pirouette_free`, `hs_full_pirouette_free`, `hs_freestand_attempt` -> `hsfree` (one 4 deg sway): the attempt needs the "catch" (fingertip pressure, hand-to-hand shift of 6-8 px) and bail-out (kick-down to a step) ; pirouettes need a hand-pivot.
- `hs_walk_*` x6 (shuttle, continuous, marker, precision, cones, plate) -> `hswalk`: only the hand-step is drawn; add a marker (hands land on a dot, cone gap) and a hip-stack ghost. `hs_walk_over_plate` needs a raised target.
- `pu_band_pullup_heavy/light` share `pullup_band` (see 7). `pu_first_strict_attempt` = `pullup`; fine.
- `pu_dead_hang` and `om_passive_bar_hang` share `hang` (fine), but `pu_scap_retraction_hold` -> `pullup_top` is a different joint story (elbows bent at top vs straight-arm retraction); `activehang`/`scappull` fit better.
- `hs_hollow_body_hold` and `pu_hollow_body_hold` -> `hollow` (straight legs, off the hip-program's `hollowtuck`): fine for them, but they teach neutral-spine only if idea 2 is in.
- `hs_wall_hs_hold_belly` vs `hs_wall_hs_hold_chest` -> same `wallhs`: chest-to-wall has a hollow-ish line, belly-to-wall has a shallow arch (the two are an inverted frame of reference); render chest-to-wall with hips 6 px further from wall and belly-to-wall with the feet at the wall.
- `hs_wrist_ext_prep` / `hs_wrist_pushups_floor` -> `wristprep` (only a rock): wrist push-up is an elbow-straight scap action, not a rock.
- `pallof_press` front view pressing legibility is flagged in 04; `suitcase_carry`/`farmer_carry` foot lift 6 -> 10 px.

## Ranked top 3 (teaches-the-movement-correctly)
1. **#5 Key-cue overlay** (gain 8, M): one bronze reference line per drill (bar path / hip height / elbow angle / body line) with a real bar trail; cheapest way to show what to check.
2. **#2 Curved, three-segment spine** + ribs-down tick (gain 7, M-L): removes the broken "one straight rod" for neutral spine on ~15 drills; every hinge/hollow/handstand cue depends on it.
3. **#3 Scapulohumeral rhythm** (gain 7, M), tied with **#6 front-view toggle** (gain 7, L); take #3 first because it is pure geometry on figures that already exist, and ship **#1 proportion fix** (gain 6, M) alongside since it re-bases all floor figures.
