# Founder bugs 2026-10-01 — BUG-38..42 — plan

Source: founder's 2026-10-01 session review. Full statements in the master task list.

1. BUG-38 — Brief on a straight-sets day: rail scheme "5 × 75 kg", hero says "working sets" and never "top set". The day says plainly whether there is a top set.
2. BUG-42 — author `sets` (and `reps`) on the hip programme's block items where `scheme` states N×M; DaySession/SetView read item reps; integrity test that a leading N×M in `scheme` agrees with `sets`/`reps`.
3. BUG-41 — Plan past-day actions offer a log link per active programme carrying blocks that day.
4. BUG-39 — general `default` dose for all 12 `om_*` drills (hold_seconds for hangs/holds); integrity test: every drill_library entry resolves to a dose.
5. BUG-40 — verified `video_url` for the 12 `om_*` drills (background agent; oEmbed-verified, never invented).

Risks: changing row counts on existing logged days (rowCount = max(scheme, stored), so history is safe); shared-library copy must stay general (data-integrity guard).
