# Rescore P3 05 Design lead vs peers (after 3416f75 / d5c1749)
Evidence: gaps/A-first-run 06-intake-01, 07-today-day-1, 10-session-done, 11-record-after-session (fresh, 21:08-21:10).

Scores (round 1 -> P0 -> P1 -> P2 -> now, /10):
- Text density: 6 -> 7 -> 7 -> 8 -> 8
- Text size: 8 -> 8 -> 8 -> 8 -> 8
- Visual richness: 3 -> 5 -> 6 -> 7 -> 7
- Consistency: 9 -> 8 -> 8 -> 8 -> 8

## What improved
- Today (07): the hero figure is now a proper 144px tile with a bronze tint, so the hero is no longer a thin grey figure in a black void. The header, 3 bullets and week strip read as one card, as Runna does it. Block titles are plain ("Ring rows — pulling with feet down"), which makes the bullets scannable.
- Record (11): the heatmap counts the trained day as Done, so the screen agrees with the session just done. The empty trend and retest cards now say what will fill them, and the page no longer contradicts itself.
- Session-done (10): the best-set card is clean. The variant naming is not visible in my capture, because the best set still says "Ring row".
- Eyebrows are 12px and readable. Peers (Whoop, Strava) use about this size for meta labels.

## Still wrong
- [M] 10-session-done — the tier ladder is unchanged. It is plain text, and the page ends in text cards with no figure or chart. Strava/Whoop end a session on a visual payoff. → Mark the current step, add a bronze check, and show the figure on the "Next session" card.
- [M] 06-intake-01 — still text-only radios, and Continue is dim with the hint below it. This is the last unchanged first-run step, and it is the first thing a new user touches. → A figure per level (handstand already has them); a clear disabled style on Continue.
- [M] 07 — three all-caps eyebrows are still on one screen ("TODAY · WEEK 1 OF 8", "FIRST STRICT PULL-UP 1/8", "TODAY", "25-30 MIN"). The tile figure is better but still thin and low-contrast. → One eyebrow per screen; give the figure a bolder stroke.
- [L] 07 — "Do a morning check first" is a teal link cut off at the nav edge in the capture, so its 44px target is hard to see. → Space for the link above the nav.
- [L] 11 — the Trend section is two empty cards above the fold line, and the Activity heatmap is one green cell in an empty grid. → Collapse empty trend cards into one line; show a count instead of a grid until there are 2+ weeks.

## P3 gain was mostly copy and polish; richness did not move
Density and consistency hold. Richness stays at 7 because the screens P2 flagged as text-only (intake, done) did not change.

## Next
1. Session-done: current-step marker, one visual, figure on "Next session".
2. Quick-start level figures (plus a "Your starting tier" result).
3. One eyebrow per screen; collapse empty Record trend cards.
