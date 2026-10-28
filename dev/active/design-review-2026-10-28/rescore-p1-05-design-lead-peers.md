# Rescore P1 05 Design lead vs peers (after 688de55)
Evidence: gaps/A-first-run 06-intake-01, 07-today-day-1, 08-first-session; C-viewport-393 01-today-top, 04-record-top; persona-csm-d2/mobile/01-day.png (15:06, local build). Session-done not captured, not scored. Caveat: the A-first-run 07/08 captures show day 1 without the hero (the Today hero appears only in the persona build), so first-run Today may not be showing it.

Scores (round 1 -> P0 -> now, /10):
- Text density: 6 -> 7 -> 7
- Text size: 8 -> 8 -> 8
- Visual richness: 3 -> 5 -> 6
- Consistency: 9 -> 8 -> 8

## What improved
- Session brief (08): exercises now come first, grouped under "Follow along" with a bronze play button and "3 moves · with a timer". It reads like Hevy/Calis, and the three prose cards are gone from the first screen.
- Today (persona 01-day): the hero card has a figure tile, "1 block · 1 exercise", "About 45 min", a week strip and a full-width bronze Open session. This is the Runna/Pliability shape.
- Record (04): the readiness heatmap, a big "112 reps +12.0" retest tile and sentence-case sections are now the first screen. It is much richer than the old text list.
- Mono is now limited to numbers and small eyebrows, and the nav is quieter.

## Still wrong
- [H] 07-today-day-1 (first run) — no hero. Setup card plus "No check yet" card still compete, with the same mono eyebrows. → Show the hero on day 1 too, and fold the check into one line.
- [H] Today (persona) — the hero sits below the fold, under the plan-built card, the proposal card and "Workout ready". Four cards stack before the session. → Hero first; proposals and the plan banner below it.
- [M] 08 — the exercise rows have no figure thumbnails, so the P0 figures never reach the list. The figure family stays at the hero tile only, and the tile is mostly empty (small grey figure on black). → Put a 40px figure per row; scale up the hero figure.
- [M] 06-intake-01 — still text-only options, a dim Continue that reads as disabled, no "Your starting tier" result. → Figure or icon per level, a one-line helper, and a result screen.
- [M] 04-record — the first screen is fine, but there is still no line chart in the hero (heatmap only). → Trend chart above the fold.
- [L] Eyebrows are still all-caps tracking on 3 or more lines per screen (Today, retest, session). → One per screen.

## P2 first
1. Today order: hero first, on day 1 and later; collapse the banner and proposal into one "Suggestions" row.
2. Figure thumbs in exercise rows plus a bigger hero figure.
3. Quick-start level icons and a result screen, then the Record trend chart.
