# Figure review kit

How Terav reviews its exercise figures (`next-app/src/lib/figures/rig.ts`). Set up 2026-10-29 at the owner's
request: two standing expert teams, measured evidence, and a loop that runs until the team rates every figure 10/10.

## The two teams (project agents in `.claude/agents/`, all Sonnet)
**Visual and motion: does it move like a human, step by step, and look right?**
- `figure-animator`: timing, spacing, arcs, sequencing, holds, gait, loop seams.
- `figure-illustrator`: silhouette, anthropometric proportions, body form, readability at 144 px and 56x40.
- `figure-motion-physicist`: contacts (no sliding), ground reference, centre of mass, equipment physics. Reviews every figure.
- `figure-frontend-engineer`: how a change fits the rig, cost per frame, which invariant test proves it.

**Training and health: is the movement itself right (angles, ranges, motion, safety)?**
- `figure-biomechanist`: sequencing, bar paths, faults; arbitrates trainer norms against geometry.
- `figure-sc-coach`: squats, deadlift, hip thrust, bridges, split squat, single-leg RDL, Nordic, sled, carries.
- `figure-physio`: rehab and mobility, with `CLAUDE.md` provocative positions as hard limits.
- `figure-calisthenics-coach`: hangs, pull-ups and progressions, ring rows, pull-aparts.
- `figure-handbalance-coach`: wrist prep, wall and freestanding handstands, handstand walk, kick-up, wall walk.

The family lists live in each agent file. A new figure goes into a family's list in the same commit.

## Evidence (run from `next-app/`)
```bash
node ../dev/active/figure-animation/measure-angles.mjs > ../dev/active/figure-animation/angles.md
```
```bash
node ../dev/active/figure-review/render-figures.mjs ../dev/active/figure-animation/sheets-all
```
```bash
git show <rev>:next-app/src/lib/figures/rig.ts > /tmp/oldrig.ts && node ../dev/active/figure-animation/render-motion.mjs /tmp/oldrig.ts ../dev/active/figure-animation/motion squat deadlift sled
```
- `angles.md`: joint angles measured from the skeleton (included hip, knee and elbow angles; trunk and shin
  from vertical) at start, 25%, 50% and 75%, plus min..max.
- Contact sheets: frames through one cycle, the reduced-motion frame, the 144 px tile and the thumbnail.
- `render-motion.mjs`: before | after clips (mp4 + gif) at 30 fps. Frame strips for agents must span the WHOLE
  cycle: a fixed every-6th-frame step covers only the first 2 s, and through rescore 3 (2026-10-29) the
  reviewers judged the wall walk and squat from their opening seconds. Spread 10 frames evenly:
  `n=$(ffprobe -v error -count_frames -select_streams v:0 -show_entries stream=nb_read_frames -of csv=p=0 x.mp4);
  ffmpeg -i x.mp4 -vf "select='not(mod(n\,$(( (n+9)/10 ))))',scale=360:-1,tile=2x5" -frames:v 1 strip-x.png`.

## The loop
1. Refresh the evidence (above).
2. Review. The four trainers each take their family, `figure-motion-physicist` takes all figures, and each writes
   `<NN>-<lens>.md` with per-figure scores and `[H/M/L] issue → target` lines with numbers.
3. Fix. Run one lane per family in its own worktree. A lane edits only its family's builders, puts its tests in
   `rig-<family>.test.ts` and measures before it commits (see `dev/active/figure-animation/BRIEF-LANES.md`).
   Shared helpers (`TEMPO`, `lead`, `stride`, `swingPos`, `carryGait`, `Scene.ground`, `ARM86` / `ARM80`) are
   changed by the lead only.
4. Rescore with both teams (trainers + physicist + animator + illustrator). Repeat 3–4 until every figure is
   10/10, or the remaining gap is a decision for the owner.
5. Before shipping: `cd next-app && npm run verify`, then push and watch CI.

## Rules that never move
- Segment lengths are fixed: limbs rotate, never stretch.
- The near side is the figure's RIGHT; left limbs are drawn behind.
- Provocative positions are never depicted (see `CLAUDE.md` and the rig.ts header).
- Every meaningful stroke has at least 3:1 contrast.
- Reduced motion shows the poster pose, with the other extreme as a ghost outline.
- No mocap or MediaPipe for shipped motion; see `dev/active/figure-animation/00-recommendation.md`.
