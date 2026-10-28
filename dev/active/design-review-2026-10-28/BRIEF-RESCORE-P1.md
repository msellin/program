# Rescore after redesign P1 (2026-10-28)

Read `BRIEF.md` for context and rules, your round-1 report (`0N-*.md`) and your post-P0 rescore (`rescore-0N-*.md`).
Same lens.

**Changed since the P0 rescore. Live on app.terav.fit after deploy 688de55:**
- Session brief: exercises first; the three how-to cards are one closed "How to run this" disclosure; footer is one
  compact button row; phase line in sans.
- Figures: bronze working limb or bar, heavier stroke, a tinted ground and hero tile.
- Today: a hero card (figure, summary, about-N-min, week strip, Open session).
- Morning check: scroll padding clears the sticky bar; severity chips ≥ 44px.
- Mono only on numbers; nav labels 13px title case.
- Quick-start consents shortened (each stays a separate checkbox); plan jargon, "Pull-Up" spelling, rest days shown as
  "Rest".
- Session-done screen: stat tiles, best set (PB only when history proves it), level ladder, next session.

**Evidence: use ONLY these fresh captures**
- `dev/active/launch-readiness/screens/gaps/A-first-run/`, `B-red-day/`, `C-viewport-375/`, `C-viewport-393/` (live).
- `next-app/tests/e2e/artifacts/personas/*/mobile/*.png` dated 2026-10-28 14:00 or later (local build of the same
  code; ignore the red "N Issues" dev badge). Check the file time with `ls -la`; older files predate P1.
- Persona `flows/` folders are mostly older; use a flow PNG only if dated 2026-10-28 14:00 or later.
- The session-done screen is not captured; score it from `next-app/src/components/session/SessionDone.tsx` and
  `session/done/` if your lens needs it, and say so.

**Score 1–10 (10 = best)** on text density, text size, visual richness and consistency. Show round-1 → P0 → now.

**Then list:** what improved; what is still wrong as `- [B/H/M/L] screen — issue → fix`; what P2 should do first.

Write `rescore-p1-<NN>-<lens>.md`, at most 40 lines. Reply with the score line and your top 3 remaining issues only.
