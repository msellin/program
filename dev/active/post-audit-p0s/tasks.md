# Post-audit P0s — what remains

> **Triaged 2026-09-08.** Every `- [ ]` in the original was checked against the
> codebase, not against its own description. Result: **12 already done and
> never ticked · 18 obsolete or superseded · 3 genuinely remaining.**
>
> The full original is preserved at
> `dev/archive/triaged-2026-09-08/active__post-audit-p0s__tasks.md` — nothing was deleted, and the
> DONE verdicts are recoverable from there. What follows is only what survived,
> so the generated index in `dev/active/OPEN-TASKS.md` counts reality instead of
> counting boxes nobody walked back to tick.

## Remaining

- [ ] **E1 — type-scale sprawl has REGRESSED.** The codemod ran 2026-08-17;
      43 half-pixel classes are back (18x `13.5`, 12x `14.5`, 6x `9.5`,
      4x `12.5`), mostly in newer `src/components/session/*`.
- [ ] **F2 — CLS on `MissedSessionPrompt`.** `:55` returns `null` pre-hydration
      then pops ~120px. The sibling fix already shipped in `ProposalStack.tsx:42`
      (an `aria-hidden` reserve div) and was never applied here.
- [ ] **G3 — re-verify the simulator matrix.** Never run, and the reason it
      mattered is now worse: see the harness note in `OPEN-TASKS.md` P0-1.
      The plan's `npm run e2e:matrix-v2` script does not exist.

All 18 obsolete entries were the `~~`-struck legacy blocks under `DONE` /
`NOT-A-BUG` headings. C3 was struck as "PARTIAL" and is now genuinely fixed —
`globals.css:28` clears the 3:1 target.
