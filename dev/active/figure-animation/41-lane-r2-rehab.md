# Lane 41 (round 2): rehab family (2026-10-29). Code: rig.ts builders; test: rig-rehab.test.ts (+1)
Source: 31-r1-physio.md "Order of next fixes", 35 animator (amarch arm), 36 illustrator (ninety, roller).
- hollowtuck: thigh -80 -> -74 deg, shin -8 -> -2 (knee unchanged). Hip included 84..100 -> 90..106 (flexion <= 90 for the whole hold, FADIR-safe by default). Test asserts >= 89.5. The 84 deep variant is not drawn; if wanted it is a gated progression (program data).
- ninety: arms shortened and lowered, hands now rest on the floor beside the hips (hand 28,24 px from shoulder -> 10,25); no T / antler line at the tile.
- roller: elbows now a narrow V up and forward of the ears (hand 5,7 from head, bend side as before); roller disc outlined in the brand tone (r 19 over a grey r 16) so it is not grey on grey at the 56x40 tile.
- kneel: pelvic-tuck arc redrawn in the builder at w 5 (the shared cue arc is thin and left untouched), readable at 56x40.
- amarch: back arm 28 -> 40 deg behind (forward arm 65 unchanged); well above the animator's +-12. Stroke already 8 px = other arms.
Not done / out of scope:
- hollow straight-leg gating is program data (hollow before hollowtuck in the rehab program): not changed here.
- adductor / adductor_ext ball ring, pallof band at thumb, legswing ghost end positions: not attempted (all [L]; the physio scored them 8 on legibility only). Adductor ball is the remaining gap to 9.
- Score-limiting [L]s that I judge geometry/safety and keep: adductor shin 41, bridge shin 25, kneel rear hip 172, legswing 30 front (rig.test.ts asserts it), pallof start elbow 72, amarch stance heel.
- tsc: only the known LayoutProps typegen error (needs `next typegen`); vitest src/lib/figures 70/70.
