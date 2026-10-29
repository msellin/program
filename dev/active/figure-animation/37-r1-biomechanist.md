# 37 r1 biomechanist: arbitration of "unreachable" items (2026-10-29)
Key: (a) lane right, figure correct; (b) target right, geometric route given; (c) rig-wide change needed.

## Goblet depth vs CLAUDE.md
(a) Keep parallel. clinical-context.json provocative_positions: "loaded end-range hip flexion, especially eccentric" and "deep flexion + adduction + IR" (FADIR + bilaterally). rig.ts L51/L1146: parallel is a limit. Trainer's hip 55-62 is below parallel under load. Standing rule wins. Coaching intent (elbows inside knees, tall chest) is met by trunk 26 and shin 33; add it to the label, not depth.

## Strength (20)
- deadlift knee 110-130: (a). Mid-shin bar + 67 px vertical arms solves to knee ~97. A higher bar (blocks) is a different exercise.
- bridge2 knee 90-110 vertical shin: (a). Planted foot + straight shoulder-hip-knee line fixes shin ~15 at knee 84; the below-line hip is a safety test.
- hipthrust knee 100-110: (a). Feet fixed means knee closes at the bottom. Reach: move the foot out 10 px (shin 17 -> ~25) to get knee ~85; do not chase 100.
- splitsquat rear knee/shin 35-45: (b) partly. Raise rear bench ~6 px and shorten stance 8 px: rear shin ~30, rear knee ~80. Load share 45% stays (needs front shin off vertical; do not allow it, front shin stays near vertical by rig rule).
- splitsquat front knee 153 standing: (a). Both feet must reach; fine.
- slrdl stance hip 110-120: (a). Soft knee kept is right for a hinge; the vertical-thigh assumption was the trainer's.
- sled swing lift 50-60: (a). Hip-foot distance at mid-swing sets 74; 8 px lift is the realistic sled gait.
- squat COM within mid-foot: (a). 157.8 vs 159 is 1 px; fine.

## Rehab (21)
- adductor/bridge hip+knee+shin all together: (a). Over-constrained; the chosen priority (knee) is correct. Bridge shin 25 is fine.
- kneel hip travel 8 px (ext ~10 not 15): (a). Rear-hip extension past ~10 deg is lumbar-compensation territory for an anterior-hip user. Keep.
- legswing front flexion 30 not 35-40: (a). Test asserts thigh >= 59.5 deg; 30 deg is the safe side for iliopsoas-irritable hips. Keep, do not edit the test.
- roller trunk 84: (a). Physical direction is right; trainer's 45-50 was wrong sign. Elbow ~15 acceptable for hands behind head.
- amarch heel lift: (a). Leg length fixes ankle height; the cue can carry it.
- pallof start elbow 72: (a). 25 px of travel at 90 is too little to read.

## Pull (22)
- head passes bar line in front view: (a). Geometric at 22 px head; a camera fact.
- negative reset cut fade: (c-lite). Needs a shared drawFigure opacity hook, a frontend change, not rig proportions. Worth doing: a 7 ms cut teaches a "pop" to the start.
- bands knee bend: (a). Front view cannot show it.

## Handstand (23)
- kickup trunk 45-60 from vertical: (c). Needs longer arms or a different start (hands on a block), not reachable with ARM80 62 px. Alternative (b): start with the front knee deeper (129 -> ~110) and the hands 6 px further forward; trunk ~68. Keep 76 otherwise; do not shorten the body.
- wallwalk start trunk 80-88: (a). 62 px arm vs 136 px body; start 64 plus a "feet on the floor, hands walk in" label is honest.
- wallhs_taps lateral shift: (c-lite). Needs a front-view variant; the side-view 3 deg press is an acceptable stand-in.
- wallhs toe-press sway: (c-lite). Needs a clock for holds (frontend), not rig.
- hswalk free arm 134: (a). Projection artefact, small.
- wallhs_90/lean are hip-angle defined: (a) lane right; keep a label note that the figure is the wall incline approximation.
- wristprep hs_wrist_pushups_floor mapping: (a) lane right; unmap in exercise-figures.ts (belongs to frontend engineer).

## Rig-wide
No proportion or 3-segment spine change is warranted by any item. Only two shared frontend hooks: fade on the reset cut, and a hold clock.
