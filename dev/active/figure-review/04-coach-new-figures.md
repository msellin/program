# Coach review: 14 new hip-program figures (2026-10-28)

Method: read `HIP_FIGS` and `squatPose` in `rig.ts`, checked angles by hand against the geometry, viewed contact sheets 01-03, compared cues in `exercises.json`. Scores 1-10, 10 = best.
"Provocative" = a position listed in `clinical-context.json.provocative_positions`.

## Verdict: 10 PASS, 4 FIX (all minor), 0 safety problems

| Figure | Verdict | Score | Touches provocative position? |
|---|---|---|---|
| bridge2 (glute_bridge) | PASS | 8 | No. Shoulder-hip-knee one line, no arch |
| hipthrust | PASS | 7.5 | No. Top = trunk and thigh level, no lumbar extension |
| splitsquat | PASS (note) | 7 | No, but rear hip is in some extension (see note) |
| slrdl | PASS | 7.5 | No. Spine and free leg one line, soft stance knee |
| pallof | FIX | 5.5 | No. Legibility only |
| nordic | FIX (small) | 7 | No (hip stays extended, no flexion) |
| sled | PASS (note) | 7 | Borderline: loaded hip flexion close to 100 deg |
| suitcase | PASS | 6.5 | No |
| farmer | PASS | 7 | No |
| airsquat | PASS (note) | 8 | At the edge by design: parallel, about 120 deg hip flexion with the 30 deg lean. Capped, not deep |
| goblet | PASS (note) | 7.5 | Same as airsquat (22 deg lean) |
| amarch | PASS | 7.5 | No. Level thigh, knee bent, unloaded |
| legswing | FIX | 6.5 | Poster frame resembles a straight-leg raise (see below) |
| hollowtuck | FIX | 6.5 | No. Tabletop 90/90 hips and knees, lumbar neutral |

## Per figure

**bridge2 - PASS, 8.** Hip rises to a straight shoulder-hip-knee line (thigh 19.7 deg above the shoulder-hip line at the top, shin vertical). Arms on the floor, far leg behind. Top frame and 56x40 thumbnail both read. No change.

**hipthrust - PASS, 7.5.** At p=1 (th=0) trunk and thigh are horizontal, shin vertical, hip at y=106 = bench top height. Bar sits on the hips, not the spine. Bottom (th=36, hip about y=162) is a modest hip flexion. Good. Optional: head at -128 deg looks slightly chin-up on the 144px tile; use -140 for a more tucked look (cue says "chin tucked").

**splitsquat - PASS, 7.** Front shin near vertical in the tile, thigh about parallel at the bottom, trunk upright, dumbbell hangs at the side. Note: with the rear foot at x=96 and hip going to x=150, the rear hip ends at roughly 40-50 deg extension, a mild loaded hip-flexor stretch (cf. the couch-stretch caution). Not in the formal list, but cheap to soften: move `R` from [96,116] to [110,116] and the bench box to x 74-132 so the rear thigh stays closer to vertical. Side R/L layering is inconsistent (work leg always drawn on top) but invisible at size.

**slrdl - PASS, 7.5.** Trunk (-20 deg) and free leg (160 deg) are exactly 180 deg apart: one line, spine neutral, head in line. Load hangs vertically from the opposite hand (correct for L stance; for R it is the far hand and is drawn first, correct). Stance knee soft. The free leg rises behind and stays below hip height after 70 deg of hinge, so no extreme hip extension. No change.

**pallof - FIX, 5.5.** The front view is the right choice for showing "do not rotate", but the press does not read: hand y goes only 62 -> 52 and the arms foreshorten into a bronze box/X on the chest, which looks like crossed arms at the 144px tile and a lump at 56x40. Concrete changes in `pallof.build`: (1) make the end hand dot grow, `sc.dot(hand, lerp(6, 11, p), BODY)` so toward-the-viewer travel is visible; (2) end elbow nearly straight: replace the mid point `lerpP(sR, hand, 0.5)` at p=1 with a point offset only 3px outward so the arm draws as one straight foreshortened bar; hand y to 46 (chest height), shoulders unchanged; (3) show the band stretching: draw the band line thicker as p rises (3 -> 4) and anchor it at hand height (y = hand y) so it stays level. Keep the front view. Safety: none (trunk stays square, legs neutral).

**nordic - FIX (small), 7.** Body line knee-hip-shoulder-head is straight at every frame, head in line: correct. Defect: at p=1, shoulder y is about 125, floor is 168 (so 43 px), but the arm is 50 long and points straight down, so the hand goes about 9px below the floor. Change the hand to `ik`-style: `hand = [S[0] + 6, 166]` at p=1 (lerp the hand target from P(S,50,a+150) to [S[0]+6,166]). Also the ring (ankle anchor) hovers above the ankle at y 153: acceptable. No hip flexion, no lumbar extension. Note: this is a heavy hamstring eccentric; it is not in the provocative list, so PASS on safety.

**sled - PASS (note), 7.** Treadmill-style legs read correctly: the planted leg slides back along the floor, the other leg drives through, the trunk stays at 45 deg, arms long. Computed hip angle at the planted-front-foot end (foot x=172) is about 80 deg included (about 100 deg flexion) under heavy load, with the front foot ahead of the knee-line. Not deep, but it is the most flexed loaded position among the new figures for a FADIR-positive hip. Change: front foot max x 172 -> 160 and drive lift 18 -> 14, `H` y 98 -> 102. That brings the included angle to about 90.

**suitcase - PASS, 6.5.** Front view, loaded arm hangs straight, trunk vertical, L badge on the viewer's right (the figure's left): correct. Weak point: 6 px foot lift reads as standing still at thumbnail size. Raise lift to 10 and keep the trunk fixed. Optional contrast (non-leaning) is fine as is.

**farmer - PASS, 7.** Same rig, both arms working, bells hang beside the hips. Same optional lift increase (6 -> 10).

**airsquat - PASS (note), 8.** Computed: hip (129,127), knee (173,128): thigh exactly horizontal at the bottom, shin about 25 deg forward, hip behind the ankle, arms forward. That is parallel, as intended. Knees track forward in the sagittal plane, no collapse drawn. Cue text conflict: the shipped cues say "full depth without pain" and "Full depth without knees caving" (goblet) while the figure stops at parallel. Figure stays; the cues should read "to about parallel, pain-free" for this program (data/copy issue, not a figure fix).

**goblet - PASS (note), 7.5.** Same depth, 22 deg lean, bell at the chest with the elbow down. The bell ring overlaps the chin in the 56x40 thumbnail; acceptable. Same cue conflict as airsquat.

**amarch - PASS, 7.5.** Thigh reaches level (0 deg) and stops; shank vertical (knee 90 deg), stance leg straight and under the hip, trunk upright, opposite arm forward in both reps (checked code for rep 0 and rep 1). Unloaded, bent knee, nothing near straight-leg raise. Matches the cue "approximately 90 degrees only".

**legswing - FIX, 6.5.** Range (14 deg back to 30 deg forward) and a front-back plane are right. Two issues: (1) `poster: 1` freezes the reduced-motion/tile image at the forward extreme with a nearly straight leg held out front, which reads as a straight-leg raise hold, the exact thing the rig comment says to avoid. Set `poster: 0.5` (vertical, a=82). (2) the soft knee is only 8 deg (shank = a+8) and invisible; use `a + 16`. Support arm and pole fine.

**hollowtuck - FIX, 6.5.** Deliberate tuck is correct and safe: thigh vertical (-98 deg), shin horizontal = 90/90 tabletop, lower back flat on the floor, shoulders curled 16 deg. No straight leg, no lumbar extension, no deep flexion. Defect: the arm is drawn at -12+a/2 (about -4 deg at full) from the shoulder, almost on top of the trunk line S-H (about 16 deg apart), so it reads as a stripe along the body, not arms reaching to the knees. Change the arm angle to `-26 + a * 0.3` (aims from the shoulder at about (106,135) toward the knee at about (187,99)). Optional: draw the head dot 4px closer to the shoulder (gap reads as a floating head).

## Deliberate choices evaluated
- Tuck hollow: correct call for this client. Keep. A straight-leg version would teach a resisted SLR pattern.
- Pallof front view: right plane, weak legibility; fixable (above). Do not switch to a side view, it would hide the anti-rotation.
- Front-view carries: right choice for not-leaning; only the foot lift is too small to read.
- Squats at parallel: correct and consistent with the program; the cues, not the figures, are inconsistent ("full depth").
- Sled treadmill style: reads well; trim the front-foot reach.

## Ranked fix list
1. pallof: end-frame legibility (growing hand dot, straight arm, level band). Highest visual impact.
2. legswing: `poster: 0.5` and knee `a+16`. Removes the only static frame that resembles a forbidden position.
3. hollowtuck: arm angle `-26 + a*0.3`.
4. nordic: end-frame hand must meet the floor (+9 px bug).
5. sled: front foot max 160, hip y 102 (keeps loaded flexion near 90).
6. splitsquat: rear foot to x=110 (softens rear hip extension).
7. suitcase/farmer: foot lift 6 -> 10. Cue copy: change "full depth" to "to about parallel" for airsquat/goblet in this program's overrides.
