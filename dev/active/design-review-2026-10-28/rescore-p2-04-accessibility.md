# Rescore P2 04 Accessibility / gym legibility (after f0f094f)

Evidence: live A-first-run 06-intake-02, 07-today-day-1, 08-first-session, 10-session-done; C-viewport-393 05-check-bottom. No DOM/contrast measured; ratios by eye.

Scores (round 1 -> P0 -> P1 -> now, 10 best):
- Text density: 8 -> 8 -> 9 -> 9 (Today hero is one card, 3 bullet lines; brief rows are name + sets)
- Text size: 6 -> 6 -> 7 -> 7 (nav 13px, body 15-16px; eyebrows and set counts still ~11-13px grey)
- Visual richness: 6 -> 7 -> 7 -> 8 (hero figure, row thumbnails, stat tiles on Done)
- Consistency: 8 -> 8 -> 8 -> 8

## Improved
- 07 Today: hero first, one primary full-width bronze button, "Do a morning check first" is a clear underlined text link (not colour-alone).
- 08 brief: block headers are short, play button is a large bronze target, rows are scannable; Start session bar is reachable.
- 10 Done: big numerals (11 / 3 / 86) are legible from arm's length; levels carry number + text, current one bold + bronze marker.
- 05 check bottom: Update check is at the end of the form, not covering chips. Closes my P1 [H] about the bar hiding Low back. Selected chips show a check + border.
- 06 intake: chips are 44px, questions are plain.

## Still wrong
- [M] 06-intake-02 / 05-check — unselected chip borders still faint grey on card (about 2-3:1, 1.4.11) → line-strong token on unselected chips and outlined buttons.
- [M] 06-intake-02 / 10-done — intro ("Answer for the last few months...") and unselected levels 2-4 are mid-grey on near-black, about 4.5:1 borderline → ink-2.
- [M] 08-first-session — sticky Start session bar still overlaps the next block header at rest; confirm end-of-page padding in 09-bottom → keep bar-height padding.
- [M] 08 / 10-done — "OPTIONAL", "3 sets", "SETS/MOVEMENTS/REPS", "NEXT SESSION" are 11-13px uppercase grey → 13px+ and ink-2.
- [M] 07 Today — "25-30 MIN" is 11px grey mono → 13px sans.
- [L] 05-check — "Flags · tap to toggle" and "Context" dividers small and muted; the "Woke me at night" dot is the only state cue besides border → add check on selected.
- [L] 08 — "Scap retraction hold ..." is truncated with an ellipsis → wrap instead.
- [L] 10-done — the heading "Done" has no live-region or focus move in the capture; not verifiable by screenshot.

## P3 first
1. Border and muted-text tokens (line-strong, ink-2): one swap fixes chips, outlined buttons, intro text (1.4.3, 1.4.11).
2. DOM pass: heatmap text equivalent, one h1 per route, aria-current on nav, focus ring against sticky bars, focus move to the Done heading.
3. Raise the 11px uppercase meta labels to 13px sentence case.
