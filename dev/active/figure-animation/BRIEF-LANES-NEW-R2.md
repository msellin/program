# Fix lanes, new figures round 2: take every new figure to 10 (2026-10-30)

Owner: "improve until all score 10". Scope: the 11 figures added 2026-10-30 in `next-app/src/lib/figures/rig.ts`.
Current scores and open items: `00-summary-new-figures.md`, lens files `60-physio-threadneedle-hipflex.md`,
`62-handbalance-new.md`, `63-calisthenics-new.md`, `64-physics-new.md`, `65-animator-new.md`, `66-illustrator-new.md`
(read the "Round 2 / Re-score" sections: those are the live items).

## Setup (worktree, in this order)
1. `git reset --hard main`
2. `ln -s /Users/margussellin/www/program/next-app/node_modules next-app/node_modules`

## Rules
- Edit ONLY your lane's figure entries (and a helper used only by them, e.g. `wallExit`). Never touch another
  figure's builder or a shared helper another figure uses without checking every caller.
- Render: `cd next-app && node ../dev/active/figure-review/render-figures.mjs <scratch-dir> <ids>` and READ the
  PNGs (gait figures are now sampled at the quarter phases; the tile shows the poster pose for gaits).
  Motion clips: `node ../dev/active/figure-animation/render-motion.mjs <old-rig.ts> <out> <ids>` (old rig =
  `git show main:next-app/src/lib/figures/rig.ts > /tmp/...`).
- Measure through `drawFigure` every 33 ms over the whole cycle: every vertex jump ≤ 8 px (loop wrap excluded
  only where `fade` covers it). Segment lengths constant. Planted contacts do not slide.
- Phase beats (animator): every key pose (start, end of range, landing, top) gets a visible dwell ≥ 150 ms.
- Hip-rehab safety rules in CLAUDE.md and every `rig*.test.ts` invariant must still hold. Never weaken a test.
- Do not claim a fix you did not render and look at.
- Done: `cd next-app && npx vitest run src/lib/figures && npx next typegen >/dev/null && npx tsc --noEmit -p .`
  pass, then commit on your worktree branch (pre-commit runs lint + verify; never --no-verify; a flaky
  "is not stale" task-index timeout: retry once).

## Output
`dev/active/figure-animation/8N-lane-new-r2-<lane>.md` (≤ 30 lines): per figure, item → what you did → numbers
(max jump px, angles, dwell ms). Reply with branch, commit hash and ≤ 8 lines.
