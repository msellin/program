# Trainer review: angles, ranges and motion of every figure (owner request, 2026-10-29)

The owner wants every exercise figure checked by the trainer who would coach that movement, on **joint angles,
range of motion and how the movement unfolds**, and iterated until the team rates it 10/10. The figures are
instructional: a wrong angle teaches a wrong rep. You are reviewing YOUR family only.

## Evidence (all in `dev/active/figure-animation/`)
- `angles.md`: measured from the live skeleton for every figure: trunk from vertical, hip and knee included
  angles (180 = straight), shin from vertical, shoulder and elbow, at start / 25% / 50% / 75% of the cycle
  and min..max. Conventions are at the top of `measure-angles.mjs`. Side views face right; y grows down.
  The "start" column is t = 0, i.e. the rest pose before the rep; for squats that is standing.
- `sheets-all/sheet-NN.png` (`index.txt` says which figures are on which sheet): frames through one cycle,
  the reduced-motion frame, the 144px tile and the brief thumbnail.
- Motion clips for six figures (`motion/*.gif`, before | after) and frame strips (`motion/strip-*.png`).
- Code: `next-app/src/lib/figures/rig.ts`. Its header lists rules set by earlier panels; they are safety
  rules for a hip-rehab user (`CLAUDE.md` at the repo root: provocative positions). Keep them.
- Each figure's text label (in `angles.md`) is what the movement claims to show; check the drawing matches it.

## Per figure
- **Angles and ranges**: are start, end and the range what a good coach teaches (cite the norm you use, e.g.
  "block pull from mid-shin: hip ~70-90°, knees ~110-130°, lockout hip and knee ~175-180°")? Name every
  number that is off, with the target.
- **Motion**: sequencing, tempo, what moves first, bar path, anything that teaches a fault.
- **Score 1-10** for "a coach would show this to a client as a model rep".

Write `dev/active/figure-animation/<NN>-trainer-<family>.md` (≤ 60 lines): one block per figure:
`### id — score/10` then `- [H/M/L] issue → target (angle/range numbers)`. End with your family's
lowest-scoring figures. Don't edit code. Reply with each figure's score and your [H] items only (≤ 25 lines).
