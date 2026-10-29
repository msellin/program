# Fix lanes, round 2: every movement score to 9+ (owner, 2026-10-29)

Owner: "since we don't have a real person, I would like the movement scores to be at least 9." Movement scores =
the trainer for your family, the physicist (`34-r1-physics.md`) and the biomechanist (`37-r1-biomechanist.md`).
After this round they rescore; any figure under 9 on any of them means another round.

Same rules as `BRIEF-LANES.md` (read it: own builders only, safety rules in rig.ts and CLAUDE.md never break,
measure with measure-angles.mjs, look at rendered sheets, tests in your own `rig-<family>.test.ts`, commit on
your worktree branch when `npx vitest run src/lib/figures && npx tsc --noEmit -p .` pass). Your worktree is cut
from current main (5df5e33): no base copying needed. Symlink node_modules as before.

## Your inputs
- Your trainer's rescore (`30`–`33-r1-*.md`): EVERY figure scored under 9 — fix each listed issue.
- `34-r1-physics.md` and `37-r1-biomechanist.md`: items for your figures (37 lists 3 targets that ARE
  reachable, with numbers: splitsquat, kickup, hipthrust).
- `35-r1-animator.md` and `36-r1-illustrator.md`: their [H] items for your figures (and cheap [M]s).
- Shared helpers you may now use: `Fig.fade` (opacity dip around a one-frame cut, see `negative()`), and the
  `t` (ms) argument to `build` for motion not driven by p (e.g. a hold's balance corrections).

## Output
`dev/active/figure-animation/4N-lane-r2-<family>.md` (≤ 30 lines): per figure, the r1 issue → what you did →
numbers after. Anything you judge cannot reach 9 and why. Reply with branch, commit and a ≤ 10-line summary.
