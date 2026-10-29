# Design lead — Plan tab (2026-10-29)
Score now: 5/10 (opened-days state). A 10: one day open (today), one entry per track, logged days read finished, nothing wraps, verbs out of the column.
## D7 call: (a) keep Recent as is. Plan = this week forward, Record = history backward. Dropping current-week days leaves Recent half-empty and the owner uses it for notes counts. Cheap tidy later; not now.
## Own items
- user D9 (logged track shows Done, not planned): ADOPT, it is D6's done state.
- mobile D9 (bottom padding clears nav): ADOPT, pure bug.
- copy D9 (display name, not slug, ~884/1043): ADOPT, the slug leak is the "Log overhead mobility" smell.
- copy D10 ("Open Day" -> "Open day"): ADOPT, matches D8 sentence case.
- visual D9 (one-line collapsed summary): DEFER, D1 accordion removes most of the density; no evidence yet.
- visual D10 (drop "· 1 logged"): ADOPT, the check plus Done row already say it.
- a11y D9 (muted contrast, opacity-70 skipped dimming ~557): ADOPT, replace dimming with a "Skipped" label; no opacity for state.
## Tension: rows vs button. Rule: with 2+ tracks the track rows ARE the entry (past + future); the button exists only where there is one thing to open (today, or a 1-track day). Never both.
| State | 1-track user | 2-track user | "⋯" sheet |
|---|---|---|---|
| Today | bronze "Open day" | bronze "Open day" (opens Today hub, rows are status only, not tappable) | Move, Skip |
| Past logged (any track done) | "Edit" outline button | rows "Done ✓ ›" / "Not logged ›", each opens that track for the date; no button | none (no ⋯) |
| Past missed | "Log" button | rows "Not logged ›" per track; no button | Move, Skip |
| Future | "Preview" button | rows "Planned ›" per track open Preview; no button | Move, Skip |
| Rest day | today/past: "Log a session" (off-plan); future: nothing | same | none |
| Skipped / moved | "Unskip" / "Undo move" stays inline (single verb) | same | n/a |
Notes: 1-track users never see rows as entries (list hidden at one program), so one entry each. A partly-logged 2-track day counts as logged: no ⋯, because Move would drag the done track. The "Edit" label for past-logged 1-track is mine; copy lens may rename.
## Implementation sketch (plan/page.tsx)
- 67-75: expandedDays -> single `openDay: string|null`; init to today ISO; toggle sets null on re-tap (D1).
- 551-715: day header gets "⋯" (44px) when `canMove||canSkip`; row 557 drop opacity-70; pad scroll container bottom for nav.
- 636-650 + 1018-1047 perProgramDayStates: return {slug, displayName, state: done|notLogged|planned}; render as Link rows when 2+ tracks and not today, plain text on today (D5/D6, display name from manifest).
- 790-972 WeekDayActions: delete 873-887 and the grid 897-944; render one auto-width button only per table (1-track, or today); move Move/Skip into a ⋯ sheet reusing MoveSheet 959 and ConfirmSheet 946; keep 835-867 unchanged.
- Bottom nav labels stay (D8). Record untouched (D7).
