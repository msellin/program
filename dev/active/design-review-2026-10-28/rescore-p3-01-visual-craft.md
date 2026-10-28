# Rescore P3 01 Visual craft (after P3, d5c1749)

Evidence: A-first-run 07, 08, 11; C-viewport-393 10-off-plan-top. Path B not used.

Scores (round 1 -> P0 -> P1 -> P2 -> now):
- Text density: 4 -> 6 -> 7 -> 8 -> 8
- Text size: 8 -> 8 -> 8 -> 8 -> 8 (12px eyebrows now read cleanly)
- Visual richness: 4 -> 5 -> 7 -> 7 -> 7
- Consistency: 8 -> 7 -> 8 -> 8 -> 8

## What improved
- 07 Today: figure tile is bigger (~145px), warm bronze-tinted, with one bronze limb; the hero reads as one focal block. Plain block list ("Ring rows - pulling with feet down") is easy to scan. "Do a morning check first" is a proper link.
- 08 Brief: variant names ("Ring row (horizontal)") make rows distinct; bottom fade/space under Start bar is present.
- 11 Record: heatmap now shows the green Done cell and "1 active day"; empty cells stay quiet. Meta labels at 12px are more legible.

## Still wrong
- [M] 07 Today - figure is still a thin grey line drawing in a large tile; the bronze tint carries the tile, not the figure. → heavier strokes (2.5px), bronze working limb, centre the figure at ~70% tile width.
- [M] 08 Brief - row thumbnails are ~40px and near-identical across the three ring rows and the two scap rows; "Scap retraction hold ..." still truncates beside OPTIONAL. → 2-line name, OPTIONAL under sets, vary pose per variant.
- [M] Extra session (C-393 10) - still a flat list of 6+ identical text cards, no figures, no ladder grouping; weakest surface next to the brief. → reuse the brief row (thumb + sets) under block headers.
- [L] 08 - Start bar still sits tight on the third card even with the fade. → raise pb by ~16px.
- [L] 07 / 11 / 10 - teal still used for Back, Export, Feedback and the check link beside bronze. → Back in muted ink; teal for inline links only.
- [L] 07 - "FIRST STRICT PULL-UP 1/8" repeats the H1 above. → drop the label, keep 1/8 by the bar.
- [L] 11 Record - two identical 7x12 heatmaps (Readiness, Activity) with the same legend, mostly empty on day 1. → collapse empty heatmap to a single line until 3+ active days.

## Next
1. Figure illustration quality (Today + brief rows): the one lever left for richness 8.
2. Extra session onto the brief row pattern.
3. Teal-to-ink pass for Back/Export; trim empty-state heatmap duplication.
