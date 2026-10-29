# Plan tab review — shared brief (2026-10-29)

Owner (Margus) runs two concurrent tracks himself: **Anterior Hip Rebuild** (primary) + **Overhead Mobility**
(secondary), alongside CrossFit classes. He finds the Plan tab heavy once days are opened. **Nothing is built
from this round** — the output is votes and a decision doc. Owner sees the recommendation before any build.

## Evidence
- Owner's phone (Android PWA, 2026-10-29, 900 px wide shots of a ~393 pt screen), in `dev/active/plan-tab-review/shots/`:
  `phone-1..6.png` = Plan tab, several days expanded; `phone-7.png` = Record tab (12-week heatmap + "Recent").
- Earlier live captures (hip persona): `dev/active/founder-feedback-2026-10-29/shots/r23b/plan*.png`, `record-full.png`.
- Prior Plan rescore today: `dev/active/founder-feedback-2026-10-29/00-summary-r23-rescore.md` (Plan 6–7).

## Code
- `next-app/src/app/plan/page.tsx` — `expandedDays` is a `Set` (line 67, `toggleDay` 68–75): any number of days
  stay open; none open by default. Day row 551–715. Per-program list 636–650 (`perProgramDayStates` 1018–1047:
  a past day with nothing logged still reads "· planned"). `WeekDayActions` 790–972:
  - past day with a secondary track → full-width `Log {slug} →` per secondary track (873–887; label is the slug
    with dashes replaced, lowercase: "Log overhead mobility →");
  - then a `grid-cols-3` row (897–944): `Open Day` (today) / `Log session →` (past, opens primary only) /
    `Preview →` (future), then `Move…`, then `Skip`. At 393 pt the 3-col grid wraps "Log session →" to 3 lines.
  - Move/Skip show on past days, including days already logged (Mon, Wed in the shots).
- `next-app/src/app/record/page.tsx` + `components/record/CutCLogList.tsx` (Recent, line ~83): last N logged days,
  "N done · N notes", crosses week boundaries, links to "All sessions · 54 days".
- `next-app/src/components/nav/BottomNav.tsx` — labels are already Sentence case ("Today", "Plan", "Record",
  "Profile"), 12-ish px caption, icon above.
- Peers (`dev/audits/app/competitor-refs.md`): Runna, GOWOD, Pliability, Hevy, Whoop, Strava, Ladder. Ideas, not specs.

## House rules you must apply
- Scores 1–10, 10 = best. Name what a 10 needs.
- Session verbs (Move/Skip) belong in a top action row / compact strip, not stacked in the content column
  (owner principle from Garmin, 2026-08-17). Test against the 2-track case.
- No calendar/events UI. Plan adapts to skipped/moved sessions; no new event-declaring forms.
- Terav core: one focus sharpened against your log; confirm-first; runs alongside the user's existing week.
- PWA has no URL bar: every capability needs a real in-app tap path (past-day backfill and future Preview must stay reachable).

## Proposed decisions — vote APPROVE / REJECT / AMEND on each, one line of reason
- **D1 Accordion.** One day open at a time; opening a day closes the previous. Today open by default on load.
- **D2 One primary action per open day**, state-dependent: Today → "Open Day"; past → "Log"; future → "Preview".
  Rendered as one compact button (not a 3-col grid), so no label wraps.
- **D3 Move/Skip leave the content column.** Options — pick one: (a) a "⋯" overflow on the open day's header row
  opening a small sheet (Move… / Skip); (b) a compact text-link strip under the open day; (c) a top action row on
  the Plan screen acting on the open day.
- **D4 Hide verbs that cannot apply:** no Skip or Move on a past day that is already logged; Move stays on a past
  missed day (rescheduling it is legitimate).
- **D5 One log entry point for two tracks.** The per-program lines ("Anterior Hip Rebuild · planned") become the
  entry points: each line is a tappable row "Anterior Hip Rebuild · Not logged ›" that opens that track's session
  for that date. The separate full-width "Log overhead mobility →" and the "Log session →" buttons go away.
  Alternative: one "Log →" opening a sheet that lists the tracks. Say which, or neither.
- **D6 Past-day track state reads true:** "planned" on a past day becomes "Not logged" (or "Missed"); done shows a check.
- **D7 Record "Recent" vs Plan week.** Options: (a) keep as is — different jobs (Plan = this week forward,
  Recent = history backward across weeks); (b) Recent drops days of the current week (Plan owns them);
  (c) remove Recent, keep only "All sessions ›". Pick one.
- **D8 Bottom-nav labels:** keep Sentence case (current) vs switch to UPPERCASE.

Add at most two decisions of your own (D9, D10) if something in your lens is clearly worse than the above.

## Output — write to the file named in your brief, ≤ 40 lines
```
# <lens> — Plan tab
Score now: X/10 (Plan, opened-days state). What a 10 needs: …
Record Recent score: X/10 (optional)
D1 APPROVE|REJECT|AMEND — reason
…
D8 …
D9/D10 (optional)
Top 3 findings in your lens with file:line
```
