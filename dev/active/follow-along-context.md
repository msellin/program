# Follow-along player — context

## Key files
- Canvas prototype: https://claude.ai/artifact/XbhjixsNZ3oMoACuzLWSf6 (D = frozen player; Gallery = 9 figures)
- Figure rig prototype: `dev/active/exercise-media/figures-prototype.js`
- AI clip experiments (paused): `dev/active/exercise-media/gemini-veo-test-prompts.md`

## Decisions
- Player = "D · Refined A" (founder picked A; D = A + panel fixes + no-jump layout).
- Media = SVG illustrations now; founder films clips once there are users; AI video paused (test 3 failed movement fidelity).
- Side colours in figures: L #5fa3b0, R #b58dbb, both #d6d9de; bronze reserved for actions.
- Home block must show on Today, not only Extras (founder, 2026-10-19).

## State / next steps
- 2026-10-19: panel review running; codebase mapping running.
- 2026-10-19: SHIPPED (BUG-47). Panel consensus after 2 rounds; player + figures + home block on Today built, tested and verified in a browser.
  Known, not caused here: `user_state_snapshots` upsert returns 403 for the e2e test account on load.
  Next, when the founder reviews: tune figures (90/90 top view, roller arms) from his real sessions; replace with filmed clips once there are users.
