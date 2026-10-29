# Custom track pass: context (2026-10-28)

Worktree branch `claude/custom-track-d76ff9`, pushes to main. Parallel session `figure-review` owns `lib/figures/**`.

## Key files
- `next-app/src/components/session/BriefView.tsx` — brief rows (`railScheme`), duplicate top-set card, sticky Start.
- `next-app/src/components/session/SetView.tsx` — player: rail/top bar, caption, set pips, weight, Done, secondary row.
- `next-app/src/components/follow-along/DemoVideo.tsx` — tap-to-load clip; reused in the player.
- `next-app/tests/e2e/strength-player-shots.spec.ts` — capture spec (skipped unless `SHOTS_OUT` set). Seeds the
  `persona-recover` final store (gitignored artifact, copied from the main checkout) on `anterior-hip-rebuild`.
- Shots: `shots/before/{375x667,393x852}/`, later `shots/after/` and `shots/live/`.

## Findings from capture (before)
- Wednesday = block pull 5/3/1 (77.5×5, 90×5, 102.5×5+, 5×77.5) + hip thrust "4 sets" (authored 4×8, no load) +
  SL RDL "3 sets" (3×8 per side) + hollow hold "3 sets" (3×20 s).
- At 375×667 the AMRAP set crushes the Last time / Prescribed values to blank (flex column overflow).
- "Top set" eyebrow is keyed to the last row index, so it fires on added set 20 at 90 kg.
- Pips at 20 sets are ~14px wide; caption truncates "set N of M".
- "Last time 101 × 5" shown on set 1 at 77.5 (same-index set from last session, no date).

## Reviews
`review-*.md` in this folder (design lead, mobile UX, visual craft, copy, strength coach). Clips:
`demo-clips-strength.md`.

## Decisions
- v1 layout (`custom-track-layout.md`) rejected by the owner as dull; peers GOWOD/Runna/Pliability are the bar
  (`peers-visual-language.md`), ideas only, core idea kept.
- v2 decisions voted by five lenses (`decisions-v2.md`, `decisions-v2-tally.md`), built in code (uncommitted).
- Round 3 reviewed the BUILT screens (`round3-*.md`, `round3-tally.md`): mean ~7; fixes applied, shots `shots/v3`.
- Owner bar: every lens ≥ 9 on every screen. Round 4 (`review-round4-brief.md`) scoring; Q1 asks what autoplaying
  clips after a one-time opt-in would add — that is an owner decision (privacy promise), not ours.

## State (2026-10-29)
- Owner approved the final build (`shots/v8`, every lens ≥ 9, `scores.md`). Shipping.
- Key new pieces: `lib/prescription-line.ts` (one line per exercise, chips, set roles, the right "Last time"),
  `engine/history.ts:lastSessionFor`, exercise switcher sheet + set strip in `SetView`, opt-in autoplay
  (`useDemoAutoplayPref`, Settings → Demo clips, privacy page), rest ring, done screen (set chips, training-max row).
- Harness: rail walk → switcher; "Switch exercise" on rest; "Something hurts" label in the follow-along stop flow.
- The capture spec `tests/e2e/strength-player-shots.spec.ts` runs only with SHOTS_OUT set; it needs the gitignored
  `artifacts/personas/persona-recover/final-store.json` copied from the main checkout.

## Next steps
See `custom-track-tasks.md`.
