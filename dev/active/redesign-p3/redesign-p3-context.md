# Redesign P3: context

State 2026-10-28: all six lanes landed and reviewed; verify 1250/1250; launch-gaps A and C pass locally (B skipped,
no Wednesday persona session). Personas running locally before commit.

Decisions
- Quick-start level figures: pull-up and muscle-up resolved the same figure for adjacent levels, which reads as "these
  levels are the same". `levelFigures()` returns figures only when all levels have distinct ones.
- "Why?" on the check was never empty in data; it was a bare word that looked like a blank disclosure row.
- Block-title copy changed names only (ids unchanged); outcome copy kept every number and the "no amount is promised"
  hedges; resting-HR claims were dropped, not added.

Next: deploy, re-shoot from live (launch-gaps on app.terav.fit), six-lens rescore → `rescore-p3-0*.md`.
