# Rescore P2 02 Mobile UX (after f0f094f)
Evidence: gaps/A-first-run 06-intake-01, 07-today-day-1, 08-first-session, 10-session-done; C-viewport-375 05-check-top/bottom. Path B not used.

Scores (round 1 -> P0 -> P1 -> now):
- Text density: 6 -> 7 -> 7 -> 8
- Text size: 8 -> 7 -> 8 -> 8
- Visual richness: 6 -> 6 -> 6 -> 7
- Consistency: 8 -> 7 -> 7 -> 8

## What improved
- Today day 1 (375x667): hero card is first, Start your first session is a 44px+ bronze button at y~513 with nav under it; setup and duplicate "No check yet" cards are gone. Whole decision fits one screen.
- "Do a morning check first" is now a secondary link under the CTA (still text, but it is a second path, not the main one).
- Brief (08): follow-along blocks are compact headers with a play button, "3 moves . with a timer" and 36px figure rows; first block plus half of the second sit above the fold. P1 [H] fixed.
- Morning check bottom (05): "Update check" sits at the end of the form with clean padding above the nav; no bar over the chips. P1 [M] fixed. Chips are about 46px tall.
- Intake-01: "Pick the one closest to you" hint under the muted Continue; options are a vertical list, 56-80px tall. P1 [M] fixed.
- Session-done (10): 3 stat tiles, best set, level ladder, next session; ends on a real payoff screen with nav intact.

## Still wrong
- [M] 05-check-top — result card shows an empty "Why?" with no body, above Saved line; looks broken, also pushes Shoulder/Elbow chips to y~470 -> collapse "Why?" into a closed row with content or hide when empty.
- [M] 07-today-day-1 — "Do a morning check first" is an 14px underlined link, about 20px tall -> min-h-11 secondary button or padded link.
- [M] 06-intake-01 — "Detailed setup (about 5 min)" is still an underlined text link about 18px tall -> min-h-11.
- [L] 08-first-session — Start session bar (y~571) overlaps the next card's top edge with a sliver showing; small clipping at 375 -> add bottom padding to the list matching the bar plus nav.
- [L] 10-session-done — ladder card repeats "Hang established..." in the list and again as the Next level line; 3 stacked cards before Next session -> merge.
- [L] 08-first-session — "Scap retraction hold ..." truncated with OPTIONAL tag -> allow wrap to 2 lines.

## P3 first
Make the three text-link CTAs (morning check, Detailed setup, Log how it feels) real 44px targets, and fix the empty "Why?" row on the check result.
