# Rescore P1 04 Accessibility / gym legibility (after 688de55)

Evidence: live A-first-run 06-intake-02, 08-first-session; C-viewport-393 04-record-top, 05-check-top; persona mobile 01-day, 16-session-today (local build, 15:12). SessionDone not captured, not scored. No DOM/contrast measured; ratios are by eye.

Scores (round 1 -> P0 -> now, 10 best):
- Text density: 8 -> 8 -> 9 (brief is exercises first; how-to cards folded away)
- Text size: 6 -> 6 -> 7 (nav labels 13px title case; phase line is sans; mono eyebrows are fewer)
- Visual richness: 6 -> 7 -> 7 (hero card and bronze figures are not in my captures beyond the brief play buttons)
- Consistency: 8 -> 8 -> 8

## Improved
- 08 brief: the phase line is now sentence-case sans on one line ("Hang, scap, row base · week 1 of 8 · ends 22 Dec"). This closes my P0 [H].
- Bottom nav: "Today/Plan/Record/Profile" in 13px sans with a bronze active bar. Readable at arm's length.
- 05 check: severity chips are about 44px tall. Selected state is a check mark plus border plus label, so it is not colour-alone. The red banner has a text label ("Back off") and a "Saved" line with a check.
- 08 brief: Start session is a full-width bronze bar, easy to hit.
- 04 record: the legend dots now sit beside text labels, including "Rest or missed".

## Still wrong
- [H] 08-first-session — the sticky Start session bar still covers the third exercise card at rest. That is acceptable only if the page ends with bar-height padding; 09-bottom should confirm it → verify end-of-page padding.
- [H] 05-check — the sticky "Update check" bar covers the Low back chip row. The row can still be scrolled clear (the safety input), but at rest it is half hidden → keep the scroll-padding fix; check it with the keyboard (focus on a chip under the bar, 2.4.11).
- [M] 06-intake-02 / 05-check — option chip borders are still faint grey on the card (about 2-3:1 by eye, 1.4.11). Only the selected chip is bright → line-strong on the unselected borders.
- [M] 06-intake-02 — the intro text ("Answer for the last few months…") and the 04 Record intro are muted grey on near-black, about 4.5:1 and borderline → raise to ink-2.
- [M] 04-record — the legend and "Latest retest" caption stay 11px, uppercase and letter-spaced; "+12.0 reps since baseline · 3 retests" is a long sentence in an eyebrow → sentence case 13px.
- [M] 04-record — the amber "2 amber · 1 red" is amber text on dark. Contrast is likely fine, but the meaning is carried by colour plus words, so OK. The heatmap cells alone carry no text, so confirm they have an alt or table equivalent (1.1.1/1.4.1).
- [L] 01-day — the dev badge overlaps the Today nav item (ignored as dev only).
- [L] 05-check — "Regions" divider label is small and muted. "Flags · tap to toggle" is cropped behind the bar.

## P2 first
1. Chip and outline border tokens: one line-strong swap covers intake, check and outlined buttons (1.4.11).
2. DOM pass: heatmap text equivalent, one h1 per route, aria-current on nav, focus ring against the sticky bars (needs persona DOM, not screenshots).
3. Convert the remaining mono eyebrows that hold sentences (Record retest caption) to sans.
