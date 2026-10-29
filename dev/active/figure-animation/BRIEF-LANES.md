# Fix lanes: trainer + physics findings, one lane per family (2026-10-29)

Goal: every figure in your family is what a coach would show as a model rep: angles, ranges, motion and
physics. The team will rescore to 10/10 after this; the bar is real, so fix every [H] and [M] item in your
family's trainer file and the physics file (`14-physics.md`), and [L] items where cheap.

## Inputs (in `dev/active/figure-animation/`)
- Your trainer file (named in your task), `14-physics.md` (only the items for your figures), `BRIEF-TRAINERS.md`
  (angle conventions), `angles.md` (current numbers), `sheets-all/` (current drawings).
- Code: `next-app/src/lib/figures/rig.ts`. Read its header first: earlier panels' rules are SAFETY rules for a
  hip-rehab user (fixed segment lengths, near side = figure's RIGHT, provocative ranges never depicted, 3:1
  contrast). `CLAUDE.md` at the repo root lists the provocative positions. Never break them; if a trainer's
  target would, keep the rule and say so.
- Shared helpers already in rig.ts (use, don't change): `TEMPO` / `tempo`, `lead()`, `stride()`, `swingPos()`,
  `carryGait()`, `Scene.ground()`, and the anthropometric arm constants `ARM86` (standing figures, leg 44+42)
  and `ARM80` (bar and handstand figures, leg 80). Use them for arms in your family's figures: the arms were
  ~18% short.

## Rules
- Edit ONLY the builder functions of your family's figures (and helpers used by no other family). Do not edit
  shared helpers, `drawFigure`, `flesh`, or other families' figures. If a shared change is needed, say so.
- Tests: add yours to a NEW file `next-app/src/lib/figures/rig-<family>.test.ts` (angle/range assertions for
  the targets you hit, e.g. deadlift lockout hip and knee >= 175). Don't edit `rig.test.ts`; if an existing
  test there must change, say which and why in your note instead.
- Measure, don't guess: `cd next-app && node ../dev/active/figure-animation/measure-angles.mjs > /tmp/<family>.md`
  and check your numbers hit the targets. Render to look: `node ../dev/active/figure-review/render-figures.mjs
  /tmp/<family>-sheets <ids...>` and READ the PNGs.
- Your worktree has no node_modules: `ln -s /Users/margussellin/www/program/next-app/node_modules next-app/node_modules`
  first. Must pass: `cd next-app && npx vitest run src/lib/figures && npx tsc --noEmit -p .`
- Commit on your worktree branch when green (the pre-commit hook runs lint + verify; never --no-verify). Do
  not push, do not commit angles.md or sheets. Commit message ends with
  "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>".

## Output
Write `dev/active/figure-animation/2N-lane-<family>.md` (≤ 30 lines) in your worktree and commit it with the
code: per figure, what changed with before → after numbers, and anything you could not fix and why. Reply with
your branch name, commit hash and a ≤ 10-line summary.
