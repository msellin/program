# Plan tab rescore on live: shared brief (2026-10-30)

Round 1 (`00-decision.md`) scored the old Plan tab with days open: visual 4, mobile 4, copy 5, a11y 6, user 5,
lead 5. The agreed changes shipped as commit 2b1ff58 and are live on app.terav.fit. Rescore what is live now.

## Evidence (live app.terav.fit, captured 2026-10-30, today = Fri 30 Oct)
`dev/active/plan-tab-review/shots/live/`:
- `two-track-393-*` and `two-track-375-*`: a seeded test user on Anterior Hip Rebuild + Overhead Mobility.
  `01-load` is the screen on load, `01-load-full` the full page (a full-page capture draws the fixed bottom nav
  over the middle of the page; that is a capture artifact, not a bug). `02-open-N-<date>` has day N open
  (Mon 26 Oct to Sun 1 Nov; Mon-Thu past, Fri today, Sat-Sun future). `03-menu` is the "⋯" sheet.
- `one-track-393-*`: the hip-only persona, same set.
- Round-1 phone shots for comparison: `shots/phone-1..6.png`.

## Code
- `next-app/src/app/plan/page.tsx`: `openDay` accordion, `WeekDayActions` (single button), `DayMenu` ("⋯" sheet
  with Move…/Skip, `useFocusTrap`), track lines rendered as `Link` rows on non-today two-track days.
- `next-app/src/lib/plan-day-tracks.ts`: per-track state Done / Skipped / Moved / Not logged / Planned.

## Your job (≤ 30 lines, to the file named in your brief)
```
# <lens> — Plan tab rescore (live)
Score now: X/10 (was N). What still keeps it from a 10: …
Did each shipped change land? accordion / one action / ⋯ sheet / hidden verbs / track rows / Not logged — one line each
Top 3 remaining findings with file:line or screenshot name
```
Scores 1-10, 10 = best. Judge only your lens. Findings are ideas for the owner, not orders.
