# R4 Visual craft: Record (2026-10-29)

Read: record/page.tsx, WeeklyHeatmap.tsx, CutCActivityHeatmap.tsx, WeeklyNarrativeTile.tsx:60-140, CutCLogList.tsx, tokens.css.
Score now: 3/10. After the cut below: 7.5/10.

## What is wrong
- Eight stacked cards, no hierarchy: nothing on the page is bigger than anything else, so the eye has no entry. Every card has the same eyebrow, same border, same weight.
- Two identical grids. page.tsx:140 builds a 12x7 from derived_state; CutCActivityHeatmap.tsx:158 builds a second one. WeeklyHeatmap also encodes 5 states (green/amber/red/rest/missed) in cells ~20px wide, so it cannot be read without the legend. A 12-week grid is a Github idiom; for someone with 3 sessions a week it is 36 dots.
- "Readiness" and "Activity" are the same picture with different names. One of them is a lie about what it shows.
- Weekly card (WeeklyNarrativeTile:98-140) is the best thing on the page (founder agrees) but it is a text list in mono green: no shape. "Top lift" prints a raw exercise id (:112). Every tone is "good" green, so green stops meaning anything.
- Dual-axis chart (kg lines + 0-10 bars, 3 units): unreadable to a non-analyst, tooltip is the only explanation. Reject for MVP.
- Empty cards (Rolling avg, Retests, Monthly check, Rehab 0/30) say "no data" 4 times on one scroll.
- 30-row history list is the longest element and the least useful; it is a log, not a record.

## What makes GOWOD/Runna/Whoop progress screens feel good (ideas only)
One big shape answers one question ("am I on track this week?"). Rings/bars fill toward a target, so absence reads as "room left", not "missing". Everything else is a number under it. Colour: one hue for the shape, grey for the unfilled part.

## Decision per section
- Headline visual (NEW, top): "This week" ring row, 3 rings max, in bronze fill on surface-2 track: Sessions done/planned (3/3), Focus-lift or skill sessions, Check-ins (morning checks/7). Large number inside ring (text-h1 mono), label under. Works for every program (sessions planned is universal). When behind: ring shows 1/3 plus the single line "2 behind, 4 days left" in ink (not red; behind is not a safety signal). Replaces Readiness grid and the green mono list.
- Weekly card: MERGE into headline. Keep the < > week switcher. Keep Weekly bests as a small chip row beneath ("3 weekly bests" tap to list), exercise NAMES not ids.
- Readiness 12wk grid: CUT. The morning-check colour already lives on Today; amber/red days go in as small dots on the week strip below.
- Week strip (NEW, small): 7 day cells M-S of the current week, filled = trained, amber/red ring if the check was amber/red. This is where safety stays visible. Same primitive as WeeklyHeatmap with weeks=1.
- Activity 12wk grid: KEEP as the ONLY long-range view, renamed "Consistency, 12 weeks", collapsed to 2 states (trained / not) at 12px cells; shown below the headline.
- Trend section (rolling avg, retests): KEEP one card, "Focus trend", hidden entirely until >=2 readings (no empty card). Retests timeline MERGE into it as dots on the same line.
- Dual-axis chart: MOVE to Rehab detail (hip program only, behind "Details" tap) and split into two single-axis charts (lift kg; peak symptom). Never three units on one plot.
- Rehab block (hip only): MOVE under Trend as one collapsed row "Rehab - check due >". Check-due chip stays; its empty cards disappear until the first check exists.
- History list: MOVE off Record to a "All sessions" row at the bottom (one link, opens existing list). Default 7 rows if inline. Export link goes there too.

## Ideal order
1 Header (H1, no intro paragraph; cut the "Tap a point" sentence, nothing is tappable yet)  2 Week rings  3 Week strip  4 Consistency grid  5 Focus trend (if data)  6 Rehab row (if hip)  7 All sessions link.
Cards: 8 -> 4 on a new account. Height at 393px: roughly 4 screens -> 1.5.

## Top 3
1. Add one headline: three bronze week rings (sessions x/planned, focus sessions, check-ins) with "N behind" in ink, replacing Readiness grid + mono green list.
2. Cut Readiness grid, dual-axis chart (split, hip-only, collapsed), and all empty trend/retest/rehab cards; show them only when data exists.
3. Move the 30-row history list to an "All sessions" link; keep one 2-state consistency grid; show exercise names, never raw ids.
Scores: now 3/10, after 7.5/10.
