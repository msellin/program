# R4 Record — COACH lens

**What Record is for:** after a session or a block, answer three questions in ten seconds: Did I do what was planned? Is the one thing I'm training getting better? Did anything hurt? Everything else is archive.
**Score now: 3/10** (three heatmaps' worth of grid, an empty trend, raw ids, rehab layered onto the same scroll).

## What a lifter/skill trainee wants vs noise
- WANT: sessions done / planned this week (3/3), block progress (week 3 of 8: 14/22 done), the focus metric's last two readings + delta (freestand hold 12 s -> 19 s; 2k split; pull-up reps), bests (heaviest top set, longest hold), streak of weeks hit.
- NOISE: two identical 12x7 grids (Readiness and Activity), "Rolling 84-day avg" and "Retests 0 events" as separate cards, raw exercise ids (`block_pull_midshin`), the 30-row day list, a dual-axis chart nobody can read, "Morning check 1 green" as a stat.
- Strength programs: top set per main lift, est. 1RM or working max trend. Skill programs: the retest metric (hold, reps, distance) and a "best attempt". Endurance: retest time/pace. All exist as `retest_metrics` in every program JSON, so one generic "focus metric" card works for all 9 programs; no new claims needed.

## Per section
1. Readiness 12-wk grid: MERGE with Activity into ONE grid (done / amber / red / rest) and MOVE it below the headline. Duplicate today. Keep 12 weeks, lose the legend clutter.
2. Week card: KEEP, promote to the top. Show "3 / 3 sessions" as the ring or bar. Drop "Morning check 1 green" (fold into the grid) and show the top lift by display name via the exercise library, never the id.
3. Rolling 84-day avg + Retests: MERGE into one "Focus metric" card: first reading -> latest, delta, small sparkline; empty state says "Retest in N days to see your first change". CUT the window tabs (30D/90D/1Y/ALL) for MVP, a 12-week window is enough.
4. Rehab block (hip, `personal: true`): MOVE to a collapsed "Rehab" disclosure below the grid, same gate as today. Its "Check due" chip stays visible at the TOP as a small line, because that is a due action. The 0/30 rehab consistency card: CUT (reads as failure when the user has not started; the week card already counts sessions).
5. Dual-axis lifts + symptom chart: CUT from the default page. If kept, MOVE behind "Details" with a data table; one axis only. Symptoms never share an axis with load.
6. History list (30 rows + "load 30 more"): MOVE to its own screen via a "History" row at the bottom ("54 active days >"). Keep Export there.
7. Intro "Tap a point to see why it moved...": CUT (the page has no tappable points above the fold).

## Ideal order
Header (Record, Export in overflow) -> Headline: this week ring "3 / 3" + status line -> Focus metric card -> Bests this week (2-3 chips) -> 12-week grid -> [Rehab disclosure, hip only] -> History link.

## Honest wording for "behind"
Count, don't scold. "1 session behind plan" or "On track: 2 of 3 done, 2 days left". Only call it behind once the remaining days can't fit the remaining sessions; before that it's "2 left, 3 days". After a deliberate skip or a red day: "Skipped, plan adjusted" (the plan adapts; skipped from a red day is not a miss). Never a percent under 50% on a short window (0/30 = 0% is noise). Block-level: "Week 3 of 8, 11 of 14 done".

## Safety/symptom signals
Don't give them a chart. Show one line only when it matters: red/amber in the past 7 days ("Amber on Tue, wrist 5/10") with a link to that day, and a red-flag marker in the grid. When all green, show nothing. The gate itself stays on Today; Record is retrospective. Symptom trend lives in the History/details screen.

## Score after: 7/10
One screen, one headline, one metric, one grid, everything else a tap away.

## Top 3
1. Lead with this week's sessions done/planned (ring or bar) plus a plain "on track / N behind" line; fold Morning check and display names in, never raw ids.
2. Merge Rolling avg + Retests into one Focus-metric card (first -> latest, delta) fed by each program's `retest_metrics`; CUT window tabs and the dual-axis chart from the default view.
3. One 12-week grid (drop the duplicate), move the 30-row history to its own "History" screen, and collapse hip rehab to a disclosure with only a "Check due" line surfaced.
