# R4 · Record · DESIGN LEAD (what Record is FOR, MVP structure)

Score now: 3/10. After the cut below: 7/10.

## What Record is for
Record answers ONE question: "is my arc moving, and am I keeping up?" It is not a log archive, not a clinical dashboard.
Three jobs, in this order: (1) am I on schedule this week, (2) is the focus metric moving (the evidence the engine
cites), (3) look something up (history). Today owns "what now"; Record owns "how is it going". Anything that does not
serve those three is cut, moved, or collapsed.

## Headline visual (one)
Week card: "Sessions 3/3" as N rings/dots (done / planned) plus one line of status: "On track" or "1 behind" (planned
sessions whose date has passed and are unlogged, from the scheduled sessions Today/Plan already read; no new claim, a
count). Keep weekly bests under it (founder likes both). Works for every program: sessions, not hip-specific. Replace the
raw `block_pull_midshin` "Top lift" with the exercise display name, or drop it (bests cover it).

## Per section
1. Header + intro line: KEEP header and Export (move Export into a small overflow/footer link). CUT the "Tap a point..." line
   (it describes a chart most users never reach; the cite-per-change promise lives on proposals).
2. READINESS 12-week grid: CUT. It duplicates ACTIVITY (identical look, founder confused). Its "amber/red" content is a
   safety signal, so keep that as markers on the single grid below, not a second grid.
3. This-week card: KEEP, promote to #1, becomes the headline above. Morning check line stays only if amber/red.
4. TREND tabs + rolling-84 curve + retests card: MERGE into ONE "Focus metric" card showing the program's focus metric
   trend, with the retest points as dots on it. Hide the whole card until >=2 readings (no empty cards; empty state is a
   single muted line under the week card: "Trend appears after your second retest"). CUT the 30D/90D/1Y/ALL tabs for MVP
   (default to all data; zoom returns when anyone has >6 months). CUT the separate "RETESTS · 0 EVENTS" card.
5. REHAB block (hip-only, personal): KEEP but MOVE to the bottom of Record, rendered only when hasRehabTrack. Fold "Rehab
   0/30 0%" into the week card as a second ring row for that program; keep "Monthly check / CHECK DUE" as the single
   rehab card (a due check is a safety/consistency prompt, it must stay visible, not buried). Generic path: any program
   with symptom_regions gets "Symptoms" in its place (below).
6. Dual-axis chart (pull, squat, peak symptom): CUT from default. It is three units on two axes, no explanation: the very
   thing he cannot read. Keep behind a "Load vs symptoms" row (tap to open, one level deep) for hip users only; its
   data table link goes with it. Symptoms stay safe because red/amber days remain marked on the grid and the Today gate.
7. ACTIVITY grid: KEEP as the single 12-week grid (one legend: done / skipped-missed / flagged). This is the consistency
   picture GOWOD-style users want.
8. 30-row history list: DEMOTE. Collapse to "Last 7 days" (7 rows, tappable to day detail) + "All history" row opening
   a sub-view/route. Stop leading the page's bottom with 30 rows + "load 30 more".

## Ideal order (top to bottom)
Header · Week card (rings + on track/behind + weekly bests) · Focus-metric trend (or one-line empty note) · 12-week
grid · Last 7 days + All history · Rehab/Symptoms (program-specific, hip: monthly check) · footer. Dividers NOW/TREND/LOG
go; they label nothing the user thinks in.

## Persona / program fit
Strength: bests + metric = e1RM trend. Skill: focus metric = the program's retest. Erratic: "2 behind" is honest, not shaming;
word it neutrally. Rehab: check-due stays top-of-rehab, never buried by the cut.

## Top 3
1. Cut the duplicate readiness grid and the three-unit dual-axis chart; keep one 12-week grid and hide load-vs-symptoms one tap deep.
2. Make the headline a Week card: Sessions N/N rings + "on track / N behind" + weekly bests; drop raw exercise ids.
3. Merge trend + retests into one focus-metric card that does not render until it has data; collapse history to last 7 days + "All history".
