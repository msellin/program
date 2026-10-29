# Fix lanes, round 3: close every movement score under 9 (2026-10-29)

Rescore 2 (`50`–`57-r2-*.md`, live 597bfef): no [H] from any movement lens; biomechanist 58/60 and physics
56/60 at 9+, the trainers 5/15 to 10/17. Every sub-9 figure has a stated route inside the rig's rules. Same
rules as `BRIEF-LANES.md` (own builders only, safety rules never break, measure, look at rendered sheets, tests
in `rig-<family>.test.ts`, commit on your worktree branch when `npx vitest run src/lib/figures` passes; a
`task-index` "is not stale" timeout in the pre-commit hook is flaky, retry once). Worktree is cut from main.

## Your inputs
- Your trainer's `5N-r2-*.md`: every figure under 9, the route given.
- `54-r2-physics.md`, `55-r2-biomechanist.md` (arbiter: where it overrules an earlier target, follow it).
- `57-r2-illustrator.md` [H] for your figures; `56-r2-animator.md` [H] "phase beats": where your figures have a
  key pose (lockout, top, end of range) with no visible dwell, give it ≥ 150 ms in `k`. NOT the animator's
  "squat hip leads the ascent": the trainers and biomechanist call hips rising before the chest a fault.
- Overshoot is never allowed on bridge, thrust, kneel, 90/90, swing, march.

## Output
`dev/active/figure-animation/6N-lane-r3-<family>.md` (≤ 30 lines): per figure the r2 route → done → numbers.
Reply with branch, commit and ≤ 8 lines.
