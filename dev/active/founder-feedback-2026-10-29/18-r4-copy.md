# R4 Record — COPY + SCANNABILITY lens (2026-10-29)

Score now: 3/10. After the cut below: 7/10.

## What Record is FOR
One question, answered in 5 seconds: "Am I on track for this focus, and is it working?" Everything else is archive. Record = this week + one trend + (optional) history behind a tap.

## Copy findings (file:line)
- Intro `app/record/page.tsx:~144` "Tap a point to see why it moved. Every change cites a study or a signal from your log." Promise copy, no object: nothing on screen is yet a "point" for a stranger. Same sentence repeats in `CutCRetestTimeline.tsx:218`. CUT both; the cite promise belongs on Coach proposals.
- Dividers NOW / TREND / LOG (`page.tsx:151,184,218`): bureaucratic, and TREND sits above Rehab so the section name lies. CUT dividers; use real card titles.
- "ROLLING 84-DAY AVG" (`CutCProgramCurveCard.tsx:119`): jargon + 84 days is not a thing a user chose. Say "Pull top set, 12 weeks" (metric name + span). Empty copy `:122` ("builds here once you have two or more retest readings for the same metric") explains the engine, not the user's next step. Rewrite: "Retest in week 4 to see your curve." (needs next-retest date; else hide card).
- "RETESTS · 0 EVENTS" (`CutCRetestTimeline.tsx:131,160`): "events" is internal; a zero-count card is noise. Hide when 0; when >0 "Retests (3)".
- Raw id `block_pull_midshin` (`WeeklyNarrativeTile.tsx:112` renders `topLift.exerciseId`): P0 bug-level. Resolve to exercise name ("Block pull, mid-shin · 135 kg x 7"). Label "Top lift" -> "Heaviest set".
- "Weekly bests 3 lifts" (`:117`): ambiguous (3 lifts total? 3 PRs?). -> "New bests: 3".
- "Morning check 1 green" (`:146`): -> "Morning checks: 1 of 3 green" or hide unless amber/red.
- "logged" fallback (`CutCLogList.tsx:143`): says nothing. Show the thing ("Morning check", "Walk 40 min") or drop the row.
- Rehab paragraphs: `HipProgressTile.tsx:129` "Home rehab is the daily consistency layer the clinical file leans on. High adherence here is what protects everything else." — lecture, "clinical file" is jargon, and sits under a 0/30 0%. Rewrite: "Daily rehab, last 30 days." (nothing else). Section blurb about "the sub-track from the clinical reports": cut to the title. "Monthly check (lower = better)" keep, but put "lower = better" as a caption, not in the title. "No hip check on file yet" (`:92`) -> "No hip check yet. 6 items, ~4 min." fine otherwise. "CHECK DUE →" chip + "START CHECK →" duplicate: keep one.
- Log empty `CutCLogList.tsx:63`, Readiness empty `page.tsx:168`, page empty `:113-114` ("rolling-average curve, retest events, and activity history") — three jargon nouns. -> "Your week shows up here after your first session."
- Duplicate: READINESS 12-wk grid and ACTIVITY 12-wk grid look identical; two titles for one picture. 

## Per-section verdict
1. Header: KEEP; Export -> MOVE to Profile/Settings (a utility, not a headline).
2. Week card (Sessions 3/3, bests): KEEP as THE headline, move to top, make it a ring/bar "3 of 3 sessions" + "N behind" when under. Clean the lines (above).
3. Readiness grid: MERGE with Activity into one 12-week grid, legend cut to 3 (Done / Rest-missed / Flagged day). Single title: "Last 12 weeks".
4. Trend card (rolling avg) + retest timeline: MERGE into one "Progress" card for the program's focus metric; hide until 2 readings. Tabs 30D/90D/1Y/ALL: CUT for MVP (a 12-week fixed span).
5. Rehab block (hip only): KEEP but MOVE its check + adherence into the week card as one line ("Rehab 0/30 days") and the check chip to Today where the action is. Safety (amber/red) stays on Today and as a flagged cell in the grid.
6. Dual-axis chart (3 series, two units): CUT from the page; move behind "See details". Unreadable on a phone for a stranger.
7. Log list: MOVE behind a "History" row / link (own screen or collapsed, 7 rows + "Show all"). 30 rows is most of the scroll.

## Ideal order and length
Week card (headline) -> Last 12 weeks grid -> Progress (focus metric, if 2+ readings) -> Rehab line (hip only) -> History link. Roughly 3 phone screens down to ~1.5.

## Top 3
1. Fix the week card copy: resolve `block_pull_midshin` to a name, "Heaviest set", "New bests: 3", and make it the first, ring-style headline ("3 of 3 sessions", "N behind").
2. Cut jargon and empty-noise: drop NOW/TREND/LOG dividers, "Rolling 84-day avg", "Retests · 0 events" (hide at 0), the two intro/tap-a-point lines, the rehab consistency paragraphs, and "logged" rows.
3. Collapse by merging Readiness+Activity grids into one, folding the trend and retests into one Progress card, and moving the 30-row history and dual-axis chart behind a tap.
