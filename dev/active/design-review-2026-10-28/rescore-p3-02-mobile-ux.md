# Rescore P3 02 Mobile UX (after P3 deploy)
Evidence: gaps/A-first-run 06-intake-01, 07-today-day-1, 08-first-session; C-viewport-375 05-check-top. Path B not used.

Scores (round 1 -> P0 -> P1 -> P2 -> now):
- Text density: 6 -> 7 -> 7 -> 8 -> 8
- Text size: 8 -> 7 -> 8 -> 8 -> 8
- Visual richness: 6 -> 6 -> 6 -> 7 -> 8
- Consistency: 8 -> 7 -> 7 -> 8 -> 8

## What improved
- Today day 1 (375x667): 144px figure on a bronze tile gives the hero real presence; plain-word block list, week dots and a full-width bronze CTA at y~543 all sit above the nav.
- Check result (05-check-top): the empty "Why?" is now a visible underlined "Why this result? >" link; P2 [M] fixed. Chips about 46px tall.
- Brief (08): block headers and variant names ("Ring row (horizontal)") are distinct; Start bar has a fade and more list space.
- Detailed setup and morning-check links are now specified as 44px targets (code/brief); intake-01 shows them still as plain text, but the hit area is the concern, not the look.

## Still wrong
- [M] 07-today-day-1 — "Do a morning check first" now sits at y~603, half under the nav edge (nav starts y~610) at 375x667; the 44px target is mostly off-screen/covered -> keep the link above the fold (drop the week-dot row spacing or move the link above the CTA) or give the page nav-height bottom padding so it scrolls clear.
- [L] 08-first-session — Start bar (y~548-595) still shows a sliver of the next card under it at 375 -> fade/padding does not fully hide it; pad list by bar height + 16px.
- [L] 08-first-session — "Scap retraction hold ..." still truncated next to OPTIONAL -> wrap to 2 lines or move the tag under the title.
- [L] 06-intake-01 — "Detailed setup" is a tiny underlined 14px link visually; hit area is 44px but looks like a footnote -> fine, optionally style as a secondary button.

## P4 first
Make the Today secondary link reachable at 375x667 (it is the only main-flow control that collides with the nav), then fix the Brief Start-bar sliver and the truncated optional row.
