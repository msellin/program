# Ideas 02 - illustrator lens: body form and visual language (scores 1-10, 10 = best)

Today: uniform round-cap polylines (limb 8, torso 12, head dot 11), one accent colour for the working limb. Reads as a clean wireframe, ~5.5/10 "professional".
Key enabler found in ExerciseFigure.tsx: slots are `<polyline>` with `fill`, so a CLOSED polygon with a thin round-join stroke is already supported. Tapered limbs and torso shapes need NO `<path>`; only a hull helper in Scene and (for volume) a higher slot cap than 24 (SLOTS) because each limb stays one slot.

## 1. Tapered limb capsules (thigh > shin > ankle, upper arm > forearm)
What: each segment is a filled tapered capsule (hip r 6.5 -> knee r 4.5 -> ankle r 3; shoulder 5 -> wrist 2.8) instead of a constant-width line.
Why: the single biggest "this is a body" cue; every pro app (Fitbod, NTC) has mass that varies along the limb.
Sketch: `Scene.limb(pts, radii, color)` builds one polygon per chain: offset each joint by +-r along the segment normal, round the elbow/knee by a 3-point arc, push as one slot with `fill=color`, stroke = same colour at 1px (non-scaling) to soften corners. Joint angles stay as now, so ik/limb-length rules are untouched. Working limb: same shape, accent fill.
Effort M (helper + swap every `sc.line([..],c,8)`; mechanical, can be a regex pass plus a per-segment radius table). Gain +1.5. Reduced motion: free.

## 2. Torso as ribcage + pelvis, not one fat line
What: torso = two filled blobs joined by a waist (chest wider, pelvis smaller), plus a neck stub; shoulder width gets a real deltoid cap.
Why: removes the "pipe" look, makes hinge/arch/neutral spine readable (chest vs pelvis angle) which also helps coaching accuracy.
Sketch: `Scene.torso(S, H, wChest, wPelvis)` -> one 8-point polygon (chest r 11 at S+0.25 along, waist 7, pelvis 9) with the ribcage tilted to S->H. Side views only; front views get a trapezoid. 1 slot. In `figureBounds` nothing changes (points in slots).
Effort M. Gain +1.0 (alone), +2 together with #1.

## 3. Head with a facing cue + neck
What: head circle plus a small nose/jaw wedge (or a 2-point visor line) pointing the way the face looks; neck line joins head to shoulder.
Why: a bare dot makes lying/inverted figures ambiguous (which way is the face? is the chin tucked?). Chin-over-bar and chin-tuck cues become visible.
Sketch: `Scene.head(c, r, angleDeg)`: dot slot + a 3-point filled triangle slot 0.8r outside the circle at `angle` in a slightly dimmer BODY. Reuse the existing angle each figure already computes for the head offset. Hidden below 64 px (LOD).
Effort S/M (36 call sites but all use `sc.dot(x,11,BODY)`; pass an angle). Gain +0.7.

## 4. Muscle highlight as a shaped glow, not a recoloured limb
What: the target muscle (glute, quad, lat, hamstring, adductor) is a translucent accent blob laid ON the limb/torso at 45% opacity; limb stays BODY grey.
Why: colouring the whole leg bronze says "this limb", not "this muscle"; anatomy atlases and Kemtai show the muscle. Also fixes the BODY/ACCENT equal-luminance problem (hue-only coding).
Sketch: `Scene.muscle(a, b, t0, t1, bulge, color, op)` -> polygon along the segment between fractions t0..t1 with a lens profile (width up to `bulge`), drawn after the limb. Add optional `op` that rises with p (contraction pulse: bulge *= 1+0.15p). Per-exercise it is 1 call (map in a small `MUSCLE` table keyed by figure id so shared-library copy stays generic). Needs +1-3 slots per figure, so raise SLOTS to ~40.
Effort M. Gain +1.2; this is the "teaches something" win, not just prettiness.

## 5. Motion cues: range arc, direction arrow, ghost end-pose
What: faint dashed arc along the path of the working joint/hand/foot with an arrowhead at the end target, plus the end-pose ghost (already built for reduced motion) shown at 15% in the normal animation too.
Why: a loop alone does not say "how far". A coach arrow is the strongest teaching cue after the pose itself; the ghost shows the target.
Sketch: `Scene.arc(centre, r, a0, a1, color, dash)`: polyline of 12 points, `dash:"4 4"` (slot already has `dash`), arrowhead as a 3-pt polyline. Fade `op` with p so it hides at the end of the range. Ghost: re-call `build` at p=1 into a lower-opacity pass (cheap, slots doubled only for the few "range" figures). Needs extra slots.
Effort M. Gain +1.0. Reduced motion: becomes the primary cue (arrow + ghost, static).

## 6. Ground shadow + far-limb depth
What: soft ellipse shadow under the figure and props; far limbs get lower opacity AND ~85% width and sit slightly cooler; props get a darker base edge.
Why: weightlessness is a stick-figure tell; a contact shadow pins the figure to the floor and a width/colour depth cue replaces the single FAR grey.
Sketch: `Scene.floor()` already runs on figures that have a floor: add one ellipse polygon slot (12 pts, fill #000 @ 35%, no stroke; cx = bbox of feet/hands from last items, clamp width). FAR becomes a helper `far(sc, pts)` = 0.85*w, colour #8a909c, op 0.9. Contrast: FAR stays >=3:1 on both backgrounds (current #8a909c does); the shadow is decoration, not information. Shadow must be excluded from `figureBounds` like `bg`.
Effort S. Gain +0.6.

## 7. Hands and feet as shapes
What: foot = tapered wedge (heel + ball + toe), hand = small mitten/circle that wraps the bar (a short thicker segment), not a line end.
Why: round-cap ends read as stumps; the foot is also the cue for plant/dorsiflexion. Hands on a bar/ring look gripped.
Sketch: `Scene.foot(ankle, dirDeg)` polygon 5 pts; `Scene.hand(wrist, dirDeg)` 4-pt rounded poly or dot r4.5; use only >= 100px (LOD). Extra slots 2-4 per figure; a single-leg figure only 2.
Effort M. Gain +0.6.

## 8. Prop realism with thickness
What: barbell plates as an ellipse-end pair (thickness lines), rings with a strap line to the anchor and a leather-coloured torus, bench/box with a top face + two legs/darker front, dumbbell with hex heads, kettlebell with a visible handle window.
Why: props are the cheapest "pro" signal and cost no anatomy risk; they are also where Fitbod/Hevy-style diagrams differ most.
Sketch: new `Scene` helpers `bench()`, `bar(c, len)`, `plate2(c,r)`, replacing `box`/`plate`. Keep outline-on-dark-fill (contrast and "never a second head" rule stay). At <64px collapse to the current simple outline.
Effort M. Gain +0.7.

## 9. Level of detail by drawn size (LOD tiers)
What: three tiers from `drawnPx` (already measured): <=64 px = silhouette only (solid body polygon, accent working limb, no head nose/hands/arrows/shadow); ~144 px = tapered limbs + torso + props + arrow; >=300 px = everything (muscle glow, hands/feet, ghost, shadow).
Why: richness at 360 px without mush at 56x40; matches the "bucket" idea already used for strokes.
Sketch: pass `lod: 0|1|2` into `drawFigure`/`build` through `Scene.lod`; each helper early-returns below its tier, so slot counts per tier stay fixed and `paint()` still maps by index (unused slots get op 0). `figureBounds` is computed per tier-0 so the frame does not jump when resized.
Effort M (mostly helper discipline). Gain +0.8 by preventing regressions of #1-8 at thumb size.

## 10. Warm-bronze light model (shading, not outlines)
What: one fixed light from top-left: body fill #c9ced6 with a 20% darker underside strip on each limb/torso polygon and a 1px rim highlight on the lit edge; skin never beige.
Why: cheap volume (a second polygon per major part, or a linear gradient defined once in `<defs>` and referenced by `fill`). Keeps the flat brand style but removes "paper cutout".
Sketch: SVG `<linearGradient>` in defs, referenced as fill="url(#bodyGrad)"; works with the current `fill` attr; gradient units `objectBoundingBox` so it follows the limb. No new slots. Check contrast of the darkest stop >=3:1 on #2a231f (use #8f95a1 floor).
Effort S/M. Gain +0.5.

## Preferred style mock (side view, 144 px tier; filled tapered parts, muscle lens, nose, shadow)
```
        ,-.            head r11 + nose wedge ▸ (facing right)
       ( o )▸          neck 5-wide
        `-'
      .-"""-.          ribcage polygon (wider, tilted S->H)
     /  ###  \         ### = muscle lens (accent @45%, grows with p)
     \_     _/         waist 7, pelvis blob 9
       |   |           thigh r6.5 ─ knee r4.5 ─ shin r3 ─ ankle ─ foot wedge
       |   |>
   ▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁     ground shadow ellipse (35% black), floor line
```
Snippet (one limb = one slot): `pts` = hull of [hip+n*6.5, knee+n*4.5, ankle+n*3, ankle-n*3, knee-n*4.5, hip-n*6.5], `fill=BODY`, `stroke=BODY`, stroke width 1 non-scaling, join round.

## Ranked top 3
1. #1 + #2 together (tapered limbs and ribcage/pelvis torso): +2.5, the whole "professional" step; M effort, no new slot count if one polygon per chain, and mechanical to roll out.
2. #4 (muscle highlight lens) and its #5 sibling (range arc + ghost): +1.2 / +1.0; they carry teaching value that no recolouring can; needs SLOTS raised to ~40 and ArcSlots at `dash`.
3. #9 LOD tiers as the guard-rail for all of the above (+0.8): without it #1-8 turn the 56x40 thumb into noise. Cheap wins to slot in alongside: #6 shadow (S), #3 head nose (S/M).
Projected: 5.5 -> ~8.5 with top 3, ~9 with #3, #6, #7, #8.
Notes: every idea is procedural SVG, polygon-in-polyline (no `<path>`), gradient is the only `<defs>` addition (#10); all shapes stay in `figureBounds` unless flagged `bg`; no personal clinical content (muscle table is general, keyed by exercise id); reduced motion shows poster solid + end-pose outline, arrow/ghost become the static cue.
