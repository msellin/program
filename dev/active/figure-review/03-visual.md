# 03 Visual review: 36 stick figures (scores 1-10, 10 = best)

Method: read rig.ts + ExerciseFigure.tsx, contact sheets 01/03/04/06 and thumbs-actual-size.png
(sheets 02/05 judged from code + thumbs sheet). Contrast figures are WCAG relative luminance.

## 1. Numbers (screen px after viewBox scaling, s = min(W/358, H/201))

ExerciseFigure widens strokes x1.2 (w<=4: x1.25): limb 8 -> 9.6u, torso 12 -> 14.4u, head dot r11 -> 26.4u dia,
prop bar 6 -> 7.2u, rope/band 3 -> 3.75u, floor 2 -> 2.4u, ring/outline w2 -> 2.4u.

| element         | thumb 56x40 (s=.156) | tile 144 (s=.402) | player ~360 (s=1.0) |
|-----------------|----------------------|-------------------|---------------------|
| limb 9.6u       | **1.5 px**           | 3.9 px            | 9.6 px              |
| torso 14.4u     | 2.2 px               | 5.8 px            | 14 px               |
| head dia 26.4u  | 4.1 px               | 10.6 px           | 26 px               |
| prop bar 7.2u   | 1.1 px               | 2.9 px            | 7 px                |
| rope/band 3.75u | 0.6 px (gone)        | 1.5 px            | 3.8 px              |
| floor/ring 2.4u | 0.4 px (gone)        | 1.0 px            | 2.4 px              |

Frame fill. Viewbox is letterboxed into the tile: 358x201 in a 144 square = 80 px tall band, 32 px blank above and below.
Standing figure (pull-up, 164u tall) = 66 px = 46% of the tile. Squat/front squat/handstands scale 0.85-0.95 and are ~120-140u: 50-55%.
Lying figures (adductor, bridge, dead bug, hollow, pullover, roller; ~200-240u wide x 50u tall) = 80-95 px wide x 20-25 px tall:
a thin stripe in a 144 square (17% of height). At 56x40 every figure is limited by WIDTH: a standing pose is ~26 px tall of 40,
a lying pose ~31 px wide of 56 with 1.5 px limbs. This is the core defect: the tile is 2.2-2.9x too small a drawing.

Contrast (card #16181c L=.009; tile = bg-ground + bronze/15 ~ #2a231f L~.018):
| colour | L | on card | on tile |
|--------|----|---------|---------|
| BODY #9aa0a8 | .35 | 6.8 | 5.9 |
| FAR #6b717d | .16 | 3.6 | 3.1 (marginal) |
| PROP #5f6570 | .13 | 3.1 | **2.6 FAIL** |
| FLOOR #7d6a54 | .155 | 3.5 | **2.9 FAIL** |
| BAND #b08a5a | .28 | 5.6 | 4.8 |
| ACCENT #c89666 | .35 | 6.8 | 5.9 |
BODY and ACCENT have equal luminance (.35): the working limb is separated by hue only, so on the bronze-tinted tile it is
the same brightness as the bronze background tint family. Hue-only coding fails for low-contrast/colour-blind viewers.

## 2. Cross-cutting specs

**A. Fit-to-content viewBox (biggest win, +2.4x apparent size in the tile).**
- `figureBounds(id, side)` in rig.ts, memoised per (id, side-bucket): sample `drawFigure` at 24 evenly spaced t over the full cycle
  (move2: both reps) plus p=1 hold plus the reduced-motion ghost. Union the points of every slot with `op>0 && w>0`, mapping through
  the figure scale transform (x' = 179+k(x-179), y' = 160+k(y-168)). Add badge discs (r10). One bbox per figure, never per frame,
  so nothing jumps.
- EXCLUDE from the bbox: the floor (draw it 400u wide, let overflow clip), the wall line (draw it to bbox top + 8u), the ground ellipse.
  Today wall lines run to y=-20/-40 and the squat head at standing is at y~0 (clipped on sheet 06 frame 0): both are why a union bbox
  must be taken from body+props only, and the head/bar must be inside it.
- Padding: 10% of the longer side + half the stroke (~6u), min 10u. Min span 110u on both axes (so pullapart / child / hang do not blow up).
- Match the container aspect: expand the bbox to W/H (thumb 1.4, tile 1.0, player 1.78), centred horizontally, floor figures bottom-weighted
  (floor at ~82% of height) so the ground line sits on the same row in the tile across exercises.
- Expected result: standing figure 80-85% of tile height (134 px vs 66), lying figure ~92% of width (130 px vs 80), thumb height 36 px vs 26.
- Add `aspect: number` (or `size: "thumb"|"tile"|"player"`) prop to ExerciseFigure; viewBox computed from it. Default player keeps working.

**B. Stroke widths specified in screen px per bucket** (convert: strokeWidth_u = px / s; get s from the fitted viewBox and the bucket's
nominal size, or use `vector-effect: non-scaling-stroke` on the polylines; both survive the 1.2x weight() hack, which should be deleted).
| bucket | limb | torso | head dia | prop line | band/rope | floor | ring outline |
|--------|------|-------|----------|-----------|-----------|-------|--------------|
| thumb <=64 | **2.75** | 4 | 7 | 2.25 | 1.75 | 1.25 | 2 |
| tile ~144 | **5** | 7.5 | 14 | 3.5 | 2.5 | 1.5 | 2.5 |
| player ~360 | 8 | 11 | 22 | 5 | 3 | 2 | 2.5 |
(player slightly lighter than now: 9.6 -> 8, because fit-to-content makes it ~1.15x larger anyway.) Head dia = 2.5-2.75x limb at every size;
reduce head from r11 to r10 in player units (head:trunk 1:2.9; reads as stick figure, not lollipop).
Do not fill the torso as a shape; keep it a single round-capped line at 1.5x limb. Filled torsos would collide with limb overlap at 2.75 px.

**C. Palette (all >=3:1 on card AND tile, >=4.5:1 for body).**
- BODY `#c9ced6` (L .60, 8.9 on tile) was #9aa0a8. FAR `#8a909c` (4.6 on tile; still 1.9:1 darker than BODY so depth reads) was #6b717d.
- WORKING ACCENT `#e0a46c` (L .44, 7.0) for the one working limb/implement: now brighter than BODY would NOT be true (.60 vs .44),
  so keep accent as hue + extra 1.25x stroke weight on the working limb (accent economy: weight + hue, not hue alone).
  Sided teal/purple keep `#5fa3b0` -> `#6db8c6`, `#b58dbb` -> `#c79fcd` (L>=.35).
- PROP `#7d8590` (3.7 on tile, was 2.6 FAIL). FLOOR `#9a8164` (4.1, was 2.9 FAIL). BAND `#c29a64`. WOOD `#a8855f`.
- Equipment rule: **solid = body, ring = equipment.** Props are outlined shapes: 2 px PROP stroke + fill `#23262c`, never solid grey
  masses (the hip-flexor box and ring-row box are currently as bright as the body and compete with it). Plates/roller/ball/bar-end as
  ring + hole, never a filled dot: squat bar dot r12 beside head dot r11 reads as a second head (sheet 06).
- Reduced-motion ghost: keep FAR-colour 2.5 px outline; fine.

**D. Thumb/tile show a KEY POSE, not frame 0.** t=0 of every `move` figure is the rest pose: all 9 pull-up variants are the same dead hang,
3 ring rows are the same thin diagonal, dead bug is a "table". Add `still?: number` to Fig (the p to show) and `pose="key"` prop on
ExerciseFigure for thumb/tile use: pullup/slow/band p=1 (chin over bar); partial p=.5; negative p=1 held then 0.4; scappull p=1 (shrugged, body 8u up) + 2.5 px
bronze up-chevron over the head; activehang p=1 + no chevron; ring rows p=1 (chest at rings: flat 0deg vs incline ~35deg vs feet-up box now differ);
deadbug rep0 p=1 (arm overhead + leg out diagonal); squats p=1 bottom (lean 33 vs 12 differ, bar ring differs); kickup p=.5; hswalk p=.5; bridge p=1; kneel p=1; deadlift p=.5.
Rig/ExerciseFigure only, so screens just pass the prop later.

**E. Thumb-only simplification (<=64 px):** drop FAR limbs that are copies of near limbs (dead bug ghost pair), badges (L/R letters are 10u/12pt = illegible; a 2 px bronze
dot replaces them), ropes <1.75 px, ground ellipse, rings. Keep: body, working limb accent, bar/box/wall outline, floor.
Floor line at thumb 1.25 px FLOOR, full tile width (it anchors lying figures).

## 3. Per figure: PASS/FIX, score at 56x40 / 144 tile, element to change

Base for all FIX lines includes A (fit) and B (px stroke); listed items are the extra specific change.

| id | 56/144 | verdict | change |
|----|--------|---------|--------|
| hipflex | 4/6 | FIX | box PROP fill -> outline+`#23262c`; arrow (w3) needs thumb 2px; head r11->10 |
| adductor | 4/5 | FIX | lying, 22% of tile height; fit does most; ball = ring + hole not solid; floor to 4.1:1 |
| bridge | 5/6 | FIX | free leg FAR vs near BODY too close: FAR #8a909c; badge off at thumb; floor contrast |
| deadbug | 3/5 | FIX | 4 limbs + 2 FAR ghosts = noise; key pose rep0 p=1; ghosts hidden at thumb; arm/leg colours L/R only on moving pair |
| kneel | 5/7 | PASS-ish | back-knee ring (w2) invisible at thumb: 2px at thumb or drop; torso/head fine |
| ninety | 6/7 | PASS | top-down view legible, both legs accent OK; FAR forearms w6 -> 2px at thumb; fit trims empty top |
| hang | 7/7 | PASS | bar w6 -> 2.25 px thumb; shoulder line (w8, BODY) merges with torso: keep |
| pullover | 4/5 | FIX | dowel hand dots r8.5 invisible; draw dowel as a 3 px WOOD line across both hands; lying -> fit |
| roller | 4/6 | FIX | roller solid dot r17 -> ring+fill; head and shoulder both BODY/ACCENT blob |
| pullup | 5/7 | FIX | key pose p=1 (chin over bar) else identical to hang; bar 2.25 px thumb |
| pullup_slow | 4/7 | FIX | **indistinguishable from pullup**: add tempo mark: 3 small tick marks beside the torso (bronze 2 px) in key pose; or clock glyph |
| pullup_band | 5/7 | FIX | band w3 gone at thumb: 1.75 px BAND `#c29a64` loop + keep colour distinct from accent arms |
| pullup_partial | 5/7 | FIX | key pose p=.5 shows 90 deg elbows; add a faint tick on the bar-to-chin path (op .5) |
| pullup_negative | 4/7 | FIX | key pose p=1 + down-arrow (2.5 px accent) distinguishes from pullup |
| pullup_top | 5/7 | FIX | same pose as pullup p=1: acceptable only if pullup uses a motion arrow (up-arrow); add up-arrow to pullup, none to hold |
| pullup_mid | 5/7 | FIX | mid pose vs partial identical: partial gets arrow, mid is still |
| scappull | 4/6 | FIX | 8u shrug is 1.3 px at thumb: exaggerate to 14u in drawing (anatomically it is a few cm anyway) + chevron |
| activehang | 4/6 | FIX | vs scappull: straight arms, shoulders depressed pose, no chevron; vs hang: shoulders 14u lower than ears and head tucked |
| rowflat | 4/6 | FIX | ring ropes w3 and rings r7 w3 vanish: rope 1.75 px PROP, rings 4.5 px WOOD solid 2.5 px outline; key pose p=1 |
| rowincline | 4/6 | FIX | angle is the only difference: increase to ~40 deg in thumb pose (yHand 76 -> 60) |
| rowfeet | 5/7 | FIX | box = outline+fill so it reads as box; it is the only differentiator vs rowflat |
| pullapart | 4/6 | FIX | band w3 loop 0.6 px thumb: 1.75 px BAND; spread arms to a visible T at key pose p=1 |
| hollow | 3/5 | FIX | flat stripe at thumb: fit scale + draw banana curve more pronounced (a to 24 deg), key pose p=1 |
| wristprep | 4/6 | FIX | hand marks w4, ring: hand platform 2.5 px; keep rock-forward key pose p=1 |
| downdog | 6/7 | PASS | clear inverted V; hand platform w4 -> 2px; ring invisible at thumb |
| child | 5/6 | FIX | head dot hides in arm line; reads as a blob at thumb: head offset 6u higher |
| wallhs | 4/6 | FIX | wall line is the differentiator and is w4 at 0.6 px thumb: 2 px PROP, bbox-clipped; head not overlapping the arm |
| wallhs_lean | 4/6 | FIX | lean 22 vs 6: key pose same; hands further than wall: show 2 px floor-to-wall gap marker |
| hsfree | 4/6 | FIX | at thumb a vertical sliver; fit gives 36 px tall; head dot r10 needs offset from arm (add S+[9,16] -> [11,18]) |
| hstuck | 4/6 | FIX | tuck knees BODY vs accent: accent leg on tucked leg is good; key pose tuck p=0 fine |
| hswalk | 3/5 | FIX | identical to hsfree at thumb; key pose p=.5 with raised hand + lean 8 deg |
| kickup | 4/6 | FIX | key pose p=.5 (diagonal legs): rest pose is a flat low arc |
| wallwalk | 5/6 | PASS-ish | wall 4u, fine; footprint huge (bbox 300 x 190) so after fit figure smaller: clip wall to figure top |
| squat | 3/5 | FIX | standing frame clips head/bar at y<0; key pose bottom; bar dot -> plate ring |
| frontsquat | 3/5 | FIX | indistinguishable from squat at thumb; bottom key pose + forearm shelf (accent forearm horizontal ahead of throat) |
| deadlift | 5/6 | FIX | plate dot r16 PROP fails on tile; use ring r15 + bar through it; key pose p=.5 |

Counts: PASS/PASS-ish 5 (kneel, ninety, hang, downdog, wallwalk); FIX 31. Average 4.2 at thumb, 6.1 in tile.

## 4. Variants that are different drills but look alike (at 56x40, frame 0)
- pull-up x9: pullup / slow / band (identical except 3 px band), top/mid/partial (pose-only), negative, scappull/activehang (8u).
  After D: pull-up up-arrow, slow tempo ticks, band loop, partial half-pose + tick, negative down-arrow, scap shrug chevron: 6 distinct marks.
- ring rows x3: distinguished only by hand height (28u) and a box. D + incline 40 deg + box outline.
- squat/front squat: lean 33 vs 12 + bar at neck vs behind; D + forearm shelf.
- hsfree/hswalk/hstuck/wallhs*: key poses.
- scappull/activehang: chevron.

## 5. Scores (whole set)
| criterion | now | after A-E |
|-----------|-----|-----------|
| silhouette readability 56x40 | 4 | 7 |
| silhouette readability 144 | 6 | 8.5 |
| stroke weight 56x40 (1.5 px) | 3 | 7 (2.75 px) |
| stroke weight tile (3.9 px) | 5 | 8 (5 px) |
| frame fill | 3.5 (46% / 17%) | 8 (80-90%) |
| accent economy | 6 | 8 (hue + weight, one working limb, badges removed at thumb) |
| floor/props contrast (tile) | 4 (2.6/2.9) | 8 (3.7/4.1) |
| variants distinguishable | 3 | 7 |
| head/body proportions | 7 | 8 (r10, offset from arm lines) |
| props read (bar, rings, box, band, bar, wall) | 4 | 7 (outline+fill, 1.75-2.25 px min) |

## 6. Implementation notes (rig.ts / ExerciseFigure.tsx only)
1. `figureBounds` + `fitViewBox(id, side, aspect, pad)` pure functions, unit-test: bbox contains every frame of every figure (the rig.test.ts already
   iterates figures); no slot outside viewBox for p in 0..1; viewBox aspect equals requested.
2. Replace `weight()` with `strokePx(bucket, kind)` table above; Scene.line keeps abstract widths (limb 8/torso 12/prop 6/rope 3) and ExerciseFigure maps width class -> px/s.
   Needs a width->class lookup: <=3 rope, 4 minor, 6 prop, 8 limb, 10-12 torso, >=14 dot (dot width = diameter).
3. Working limb = 1.25x limb width in accent; in thumb bucket 3.4 px.
4. `floor()` draws x from -100 to 460 (clipped); stop deriving it from card inset.
5. Prop fill: Scene.line already takes `fill`; PROP box fill `#23262c`, stroke `#7d8590` w 2.
6. Contrast test in rig.test.ts: assert BODY/FAR/PROP/FLOOR/BAND/ACCENT >=3:1 on #16181c AND on #2a231f (the tile tint); 4.5:1 for BODY.
