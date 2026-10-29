# Custom track pass: tasks

- [x] Capture current screens (375×667, 393×852): brief, player set 1, AMRAP, 20 sets, done
- [x] Reviews: design lead, mobile UX, visual craft, copy, strength coach (scores 1–10) — `review-*.md`
- [x] Frame-check clips for block pull, hip thrust, SL RDL — `demo-clips-strength.md`
- [x] v1 layout shown; owner rejected it as dull → peers studied (`peers-visual-language.md`)
- [x] v2 decisions voted by the five lenses (`decisions-v2*.md`)
- [x] Build brief + player + rest + done; rounds 3–9 on the BUILT screens until every lens ≥ 9 (`scores.md`)
- [x] Owner decision: opt-in autoplay for demo clips (Settings switch, one-time ask, privacy page updated)
- [x] Owner agreed the final screens (`shots/v8`) — "Yes, ship it", 2026-10-29
- [x] Unit tests updated; e2e specs updated for renamed controls; harness rail walk → exercise switcher
- [x] Persona harness (31) on the build — all pass (one real fix: intake-deferral reasons now show on guided-only days)
- [x] `npm run verify`, commit, rebase, push to main, CI green — f847e5b, 2026-10-29
- [x] Re-shoot from live, rescore with the same five lenses — every lens ≥ 9 (`scores.md`)

Follow-ups (not this pass):
- Hip thrust's linked video is a podcast with no hip thrust in it — needs a new official clip.
- Done: "vs plan" line and volume need planned values plumbed into the session summary.
- Off-plan e2e specs assert copy that no longer exists ("lives in your sessions now", "Log a run, row, or class"
  button) and one picks a timed hold expecting "Done — set 1" — pre-existing, not from this pass.
- Polish the lenses still list (none below 9): done-screen boxes into fewer cards (VC), "Switch exercise" quieter
  (VC, DL), loads on brief rows 2–4 (DL, SC), "Last" per working set and on rest (SC), brief row 4 under Start at
  375 (MX). Each lens's open items: `live-*.md`.
