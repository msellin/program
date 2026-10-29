# R4 rescore, design lead. Record: 7/10 (was 3)

The page now answers "how is my week" first, then shows one grid, then history behind a tap. The rewrite worked; what remains is correctness of signals and legibility.

- [H] "On track" / "2 sessions behind" is judged mid-week. Hip shows "2 sessions behind" at 1/3 with the week unfinished, which is a scold, and for a rehab user with amber checks it pushes against the safety gate. Fix: compare against sessions due so far (pace), say "1 of 3 · 2 left this week", and reserve "behind" for closed weeks.
- [H] Strength shows a green delta (-2.0) on a "139 bpm" tile whose "vs previous" is 113, so the tile contradicts itself. For HR, lower is better, so the sign colour logic needs checking, and the baseline vs previous lines must agree. Fix: one delta, direction-aware colour, one reference.
- [M] The 12-week grid has no axes (no week or weekday labels, no today marker), and "REST OR MISSED" is a hollow dot that matches no visible cell. Fix: label week columns and weekday rows, mark the current week, and drop or restyle the legend entry.
- [M] "1 red check this week." is rendered in amber, and 1/1 reads as success with "On track" right above it. Fix: red text for red, and put the red note ahead of the green headline or soften the headline.
- [L] Recent rows show a status dot with no key and a bare chevron; "1 done · 1 note" is terse. Fix: dots reuse the grid legend, or the row says "Morning check · amber".
- [L] The pull-up curve starts its y-axis at 100 and the chart is large for 3 data points. Fix: hide the curve until there are 4 or more readings and show the tile only.
