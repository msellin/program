# Rescore P2 01 Visual craft (after P2, deploy f0f094f)

Evidence: A-first-run 07, 08, 10-session-done; C-viewport-393 01 (shows Extra session, not Today). Path B not used.

Scores (round 1 doubled -> P0 -> P1 -> now):
- Text density: 4 -> 6 -> 7 -> 8
- Text size: 8 -> 8 -> 8 -> 8
- Visual richness: 4 -> 5 -> 7 -> 7
- Consistency: 8 -> 7 -> 8 -> 8

## What improved
- Today day 1 (07): hero is first and fills the screen: figure tile, "3 blocks · 6 exercises", 25-30 min, week strip, one bronze CTA, teal link below. Setup card and duplicate "No check yet" are gone. One focal point, one accent. This was my P2 #1 and #2.
- Brief (08): compact block headers ("Row strength", "Scapular pull ladder") on one line each, bronze play disc, "3 moves · with a timer", rows with figure thumbnails. Both titles fit; my P2 #3 is done. Header meta is one sans line.
- Session-done (10): big 11 / 3 / 86 stat tiles, best set, level ladder with a bronze current step, next session. A real payoff screen with a clear hierarchy; bronze used once.
- Nav, mono-on-numbers and the title scale stay consistent across 07, 08 and 10.

## Still wrong
- [M] 07 Today — hero figure is still a small thin line figure in a flat 100px tile; bronze shows only on one arm, strokes are lighter than on the program hero. → same heavier bronze working limb and radial bronze tint, tile 120px.
- [M] 08 — the sticky Start session bar overlaps the top of the third block card at 375 and hides what follows; no gutter above the nav. → add pb equal to bar height plus 16px, and a 16px gradient fade above the bar.
- [M] 08 — "Scap retraction hold ..." truncates beside OPTIONAL; thumbnails are tiny (about 40px), figures are near-identical across the three rows. → wrap the name to 2 lines, put OPTIONAL under the sets; differentiate the figure pose per row.
- [M] Extra session (C-393 01) — still 6+ identical plain cards with no figures or grouping; it is the weakest surface, off-brand next to the brief. → reuse the brief row (thumbnail + sets) and group by ladder with the block header.
- [L] 10 Done — stat tiles use white numerals; bronze is only on the step disc. "Best set" card is a lot of box for two lines. → bronze on the best-set number, merge it into the stat row's subtitle.
- [L] 07 / 08 / C-393 — teal still on Back and links beside bronze. → Back in muted ink; teal for links only.
- [L] 07 — progress "FIRST STRICT PULL-UP 1/8" repeats the title right above it. → drop the label, keep "1/8" beside the bar.

## P3 first
1. Rework Extra session onto the brief's row and block header pattern with figures.
2. Fix the figure tile (heavier bronze limb, radial tint, bigger) on Today and the brief rows, so richness reaches 8.
3. Clear the sticky-bar overlap with a gutter and fade; Back in muted ink.
