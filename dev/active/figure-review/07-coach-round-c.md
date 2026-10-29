# Round C coach review (strength / gymnastics / rehab-adjacent), 2026-10-29

Method: read rig.ts cues/glyphs, the 10 sheets, thumbs-actual-size, before/after; computed cue geometry at poster frame (throwaway vitest, removed).
Verified: mid-foot plumb x = F+4 = centre of the drawn foot (F-4..F+12), correct. Parallel line y=128 vs hip y=127 at the bottom: thigh horizontal, correct. Align lines are SOLID at poster on bridge, bridge2, hipthrust, rowfeet, rowflat, rowincline, wallhs*, hsfree, nordic, slrdl.

## Problems (figure | cue | issue | fix)
| figure | cue | issue | fix |
|---|---|---|---|
| squat, frontsquat, goblet, airsquat | level at knee | Static line at the END pose reads as "touch this line" = a target depth. Hip-rebuild lifts must stop at parallel, and the tile teaches reaching it. airsquat label says "as deep as pain-free" yet the line says parallel | Name it in the label/alt text: "about parallel, a ceiling not a floor; stop here or above if the groin/hip pinches". Keep it faint; do NOT make it solid/reward-coloured when hips reach it. For anterior-hip-rebuild add an exercise_override cue text, not a deeper line |
| squat family | plumb mid-foot to bar | Back squat bar 3 units behind mid-foot, front squat 8 behind, goblet 7 ahead: line misses the load in 2 of 3 and never touches it at the top (it stops 10 above the bar) | Fine in principle; draw the line through the bar (stop at bar y, small tick) so "bar over mid-foot" is visibly true. Goblet: the weight is meant to be ahead of mid-foot; use "trunk over foot" or drop the plumb |
| deadlift | plumb mid-foot to bar | Right cue (bar path over mid-foot) but the bar is drawn at lockout x=172 vs mid-foot 176, start x=180: ok. Missing the cue that actually protects: neutral spine / hips-shoulders rise together (heavy axial load + deadlift is the user's presenting complaint) | Add a back-angle cue: dashed trunk line that must not change angle while hips rise from the block; no depth cue |
| kneel (half-kneeling stretch) | plumb hip to shoulder | Satisfiable by leaning back into lumbar extension (stacked shoulder over hip) which is exactly how the stretch is faked and loads the anterior capsule/L5 (provocative: lumbar extension, aggressive couch stretch). The line also runs inside the shin so it is hard to see | Replace with posterior-pelvic-tilt cue: ribs over pelvis plus a small "tuck" arc at the hip, or add "glute squeezed, ribs down" in the label; offset the line 8 units forward of the body |
| splitsquat | plumb ankle to knee | "Shin vertical" is a guideline not a rule; shin forward is normal in a Bulgarian squat. Can teach people to hold the knee back and dump load into the hip/low back | Soften: the line should be a corridor (knee no further than the toes), or mark as "knee over mid-foot, not collapsing inward" |
| pallof, suitcase | plumb at constant x=179 | Good cues (anti-rotation, anti-lateral-flexion). Hard-coded x, not a joint; only correct while the figure is centred | Fine; derive x from the pelvis mark later |
| bridge, bridge2, hipthrust | align shoulder-hip-knee | Right cue; solid only at the top, works. Risk: hip above the line = lumbar hyperextension, and abs() correctly goes dashed on that side, but the figure never shows it | OK. Add to label: "ribs down, don't arch past the line" |
| rowfeet/rowflat/rowincline, wallhs, wallhs_90, wallhs_lean, hsfree, nordic, slrdl | align | The figures are drawn straight, so the line is ALWAYS solid at the end: decoration, not feedback. Nordic: line through knee-hip-shoulder is right (hip not piking). slrdl: shoulder-hip-rear foot is right | Acceptable as the "target". If you want teaching, add one faint "wrong" frame (hip sag/pike) once; otherwise accept |
| pullup_partial, pullup_mid | elbow angle arc | Arc is the live angle, with no 90° reference; the label says right angle but nothing shows it | Add a 90° tick or draw the arc only at the end pose; low priority |
| pullup (full), activehang, dead hang, hang | none | Missing cue that matters: shoulders packed down away from ears at the bottom (active hang, first rep of a pull-up) | Add a shoulder-to-ear distance cue (short vertical between ear and shoulder) on hang/activehang |
| glyphs: negative 10 s vs 5 s | down arrow long vs short | Arrow length reads as RANGE (same as the short up-arrow for partial). Both negatives lower the full range | Same-length arrow, with "10" / "5" ticks or 3 vs 1 ticks; keep short arrow only for partial |
| glyphs: activehang vs pullup_top | both use "hold" (high bars) | A hang is not a high hold. Both look the same at 56x40 apart from body height | activehang gets its own glyph (bars at hang height) |
| glyphs: up / single / slow | arrow, +dot, +ticks | At 56x40 the dot and ticks are ~1 px; in thumbs-actual-size single/slow/pullup are indistinguishable | Make ticks 6 wide on the arrow shaft side-by-side, dot radius 6; or use "x1" mark. Do not rely on thumbnails alone for tempo |
| band heavy vs light | stroke 5 vs 2.5 | Half-pixel vs 1 px at thumbnail: not distinguishable; 5 vs 2.5 is also not a measure of assistance | Use two parallel strands (heavy) vs one, or colour intensity; label "more help" |
| scapulohumeral rhythm | shoulders slide in 3 units | Invisible at any size, and what is drawn is scapular retraction/depression, not upward rotation | Harmless; drop from claims or exaggerate to 5 |
| ladder ghosts | faint outline | Works on rows (flat -> feet-up). Wall handstand ghost reads as a second body behind it in the before/after (rowflat, wallhs_lean show a ghost ring/line) | Keep; lower opacity to 0.4 |

## Missing cues that matter
Hollow hold (lumbar flat: ribs-to-pelvis), deadbug (low back on floor), hang/activehang (shoulder-ear), nordic eccentric speed, sled/farmer (trunk neutral), handstand wrist/finger pressure.

## Safety
1. Parallel line must read "stop", never "go to". Anterior-hip-rebuild: deep flexion+adduction+IR and heavy axial load are provocative; squat/deadlift tiles already gated. Add override copy.
2. Kneel plumb can reward lumbar extension. Fix before shipping to rehab users.
3. Shin-vertical split squat may suppress a normal forward knee and shift load to the hip/back.
4. No cue draws a position the program forbids (no knee-raise, L-sit, Copenhagen). Pull-up angle arcs are safe.

## Score: teaches the movement correctly 7.5/10 (previous ~6)
Strong: mid-foot plumb, parallel level, bridge/hip-thrust/nordic/row aligns. Held back by kneel plumb, glyph legibility at thumbnail size, align lines that are decorative, and no safety wording on the parallel line.
