# 91 calisthenics lens: new figures r2 rescore (arch, dbrow, pulldown) - movement correctness
Evidence: new-r2/sheets/sheet-01.png, strips/sheet-01.png, rig.ts 869-932 (side views, derived from the builders, angles.md not run; elbow numbers below computed by hand from the segment lengths).
Previous: 63-calisthenics-new.md (9/9/9 after my own fixes). Lane C r2 (82) changed arch (lift, breath, scale), pulldown (scale, one upright, lean) and left dbrow untouched.

| figure | r1 | r2 |
|---|---|---|
| arch | 9 | 9 |
| dbrow | 9 | 9 |
| pulldown | 9 | 9 |

## arch - 9
- Better than r1: chest 12.5 deg, legs 9 deg, hips fixed on the floor, breath +-1.5 px on a 4 s cycle after a 900 ms ease-in, no jump over 2.5 px. Lift reads in the 144 px tile and at 56x40; neck follows the trunk line.
- [M] The arms rise 28.5 deg (chest 12.5 + 16) while the trunk is at 12.5, so at 26 px from the shoulder the arm is 12 px above the line and the head dot (r 11, dropped 5 px) is tangent to the stroke: the arm clips the top of the head in the tile. A true Superman keeps the arms about in line with the ears, so over the head they should not be steeper than the trunk by 16 deg -> arms +8 deg over the chest (hand 20.5 deg), leaving the arm ~4 px clear of the head dot.
- [L] Stale comment says "chest 7 deg"; code is 12.5. No effect on the drawing.

## dbrow - 9
- Unchanged since my r1 re-check: back 12 deg, planted foot at [140,166] bent and beside the bench, bench arm exactly locked, pull 1456 ms / top dwell 520 ms / lowering 2496 ms (1.7x), elbow ends behind the shoulder along the ribs, dumbbell plumb. Reads correctly in the strip, thumb is legible.
- CEILING: the bench arm leans ~27 deg forward of vertical (shoulder 55 px above the hand, arm 62 px, so the hand sits 28 px ahead). A vertical arm needs the shoulder 62 px above the bench hand, i.e. a back of about 20 deg, which turns the flat row into a high-shoulder pull-over (my r1 [H]). Within fixed segments a flat back and a plumb arm exclude each other; accept the lean.
- [L] Stale comment says "about 17 deg"; code is 12.

## pulldown - 9
- Correct: lean 10 to 18 deg and stays put, thighs under the pad, shin 93 deg, cable straight, bar passes in front of the chin (x >= S+12), timing pull 1680 / dwell 720 / return 2820 ms (1.7x). The one-upright simplification helps the thumb (figure + cable are legible).
- [M] End position: hand S+[12,16] is 20 px from the shoulder, so the lower-elbow IK puts the elbow at about S+[-17,+26], i.e. the upper arm ends ~51 deg behind the trunk line (trunk is 18 deg back at the bottom, arm 33 deg behind vertical) and the elbow sits ~25 px behind the back. Real finish: elbow beside the ribs, shoulder extension about 40 deg -> hand S+[16,20] (elbow ~S+[-14,+28], ~45 deg), bar still at the upper chest, still clear of the chin.
- [L] The horizontal rod from the pad to x=258 ends in the air and reads as a second bar at 56x40 -> shorten to x ~ 226 or draw a small stack post at its end.
- CEILING: grip width and the pronated hand cannot be shown from the side; the label carries it.
