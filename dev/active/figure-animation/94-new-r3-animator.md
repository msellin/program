# 94 animator: new figures r3 rescore (2026-10-30)
Evidence: new-r3/strips/sheet-01/02.png (16 frames), jumps.mjs, lane notes 83-85. Previous: 94-new-r2 (all 8-9).

| figure | r2 | now | max jump | note |
|---|---|---|---|---|
| threadneedle | 9 | 9 | 4.9 px | head forward, wrist 20 px from head; arm still crosses trunk |
| hipflex | 9 | 9 | 0.3 px | arrow now reads; CEILING rehab hold |
| arch | 9 | 9 | 2.9 px | hand clear of head; CEILING 56x40 trunk line |
| dbrow | 9 | 10 | 2.4 px | 2.1 px elbow settle over 150 ms was my route; done, weight reads |
| pulldown | 9 | 10 | 4.7 px | 2.8 px elbow settle done; pad rod no longer floats |
| fingertaps | 8 | 9 | 6.1 px | 15 px tip lift + 4 px weight shift, 150 ms dwell |
| hollowrock | 9 | 10 | 4.8 px | 150 ms dwell at both extremes + 3.8 deg leg lag; rock turnaround now has a beat |
| elbowstand | 9 | 10 | 0.6 px | sway 2.5 deg / 3 s, head clear of hip; straight arms settled by arbitration |
| crowroll | 9 | 9 | 5.0 px | peak down 6.7 -> 5.0; thumb now mid-roll |
| matfall | 8 | 9 | 7.4 px | span lengthened to p .45-.66, still the peak |
| cartwheel | 8 | 9 | 6.2 px | window 6.0 px; first foot lands 63 px from hand |

Seams: all strips end on the frame-0 pose; matfall/cartwheel reset is a fade (the ghost in the last frame is the fade-in). No draw-order or limb pop seen in the strips.

- [M] matfall (9): 7.4 px at 1254 ms is the free-leg swing in the 0 -> 90 turn, above my < 6 px route (about 220 px/s, a single strip-frame change between 1210 and 1820 ms). Route: ease the swing leg (70 -> 55 deg, or +100 ms on the 0-90 turn). Not a ceiling: a bail is abrupt in the fall, not in the turn.
- [L] cartwheel (9): 6.2 px at 4323 ms is in the landing/stand-up, not the wheel; the first-foot catch frame still shows the legs pass the V in one frame at strip scale. Route: shave the second-foot swing to < 5.5 px.
- [L] crowroll (9): 5.0 px is at the limit I asked for (< 5); the hip speed between 2.0 and 3.2 s is still the fastest of the roll. Route: one more ease-in, about 4.5 px. Strip reads chin lead, vertical, back, settle.
- [L] threadneedle (9): CEILING flat side view, the arm must cross the trunk line; the 6 px head shift raises shoulder-to-head gap 21 -> 27 px (neck slightly long at rest). Route: 3 px of it back if the wrist offset can follow.
- [L] fingertaps (9): 6.1 px at 2937 ms is the set-down, the largest in a gait figure that should be a light tap; the lift is still ~3 px at 56x40 (CEILING for a side-on wall lean at thumb size). Route: soften set-down ease to < 5 px.
- hipflex (9): CEILING, a rehab hold allows no joint motion beyond breath (rig.ts / CLAUDE.md); pulse and arrow are the only live parts.
- arch (9): CEILING, lying figure 200 px long in a 1.4:1 thumb, so the 1.5 px breath is below thumb visibility; crop cannot tighten without cutting hand/feet (lane C measured).
No [H] items.
