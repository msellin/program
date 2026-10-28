# Rescore 04 Accessibility / gym legibility (after e6f1139)

Evidence: A-first-run 05, 06-intake-02/04, 08; C-viewport-375 04-record-top, 05-check-top.

Scores (round 1 -> now, 10 best):
- Text density: 8 -> 8 (quick start is 3 short screens; session brief still stacks 3 prose cards)
- Text size: 6 -> 6 (unchanged: 11px mono eyebrows and nav labels remain; body 14-16px fine)
- Visual richness: 6 -> 7 (figure on program page, stat tiles with 28px numerals)
- Consistency: 8 -> 8

## Improved
- Program page: stat tiles use large numerals; Start free is sticky, bronze, full width, ~7:1, thumb-sized.
- Quick start: "None of these" is a full-width 44px+ button; Yes/No options are 44px+ buttons with visible borders and a "Previous step" link. Screening copy is plain, "not a diagnosis".
- Day 1 Today: tour card gone; one primary CTA plus a text link. Cleaner arm's-length hierarchy.
- Status still never colour-alone (Record legend, WORKOUT READY label).

## Still wrong
- [H] 08-first-session — "HANG, SCAP, ROW BASE · WEEK 1 OF 8 · ENDS 22 DEC" still wraps to two lines of letter-spaced 11px mono directly above the CTA, and the sticky CTA + "Log an extra session" bar covers the exercise card behind it → sentence case 13px sans, one line; add bottom padding equal to the bar height.
- [H] 05-check-top — sticky "Update check" bar overlaps the second region (Elbow) at rest; severity rows (the safety input) sit behind it while scrolling → pad scroll container by bar height; confirm segments >=44px (they look ~44).
- [M] All tabs — bottom-nav labels still 11px mono uppercase (TODAY/PLAN/RECORD/PROFILE) → 12-13px, sentence case, or drop mono.
- [M] 04-record-top — "1 green · 2 amber" now fits but is right-aligned 14px mono; heatmap legend 11px mono; "REST OR MISSED" hollow dot is low-contrast (hollow ring on dark, likely <3:1) → solid fill/outline bumped to line-strong.
- [M] 05-program-detail — "DAYS / WEEK" and "WEEKS" tile captions 10-11px mono muted; figure is grey-on-near-black decoration with no visible alt (check alt="" vs described) → 12px captions; figure alt or aria-hidden decision.
- [M] 06-intake-02 — option buttons (No / Yes) have 1px borders in --color-line on surface-2 (~2.7:1, fails 1.4.11) → use line-strong.
- [L] 06-intake-02 — "STEP 2 OF 3" 11px mono muted; fine as a sole label but small → 12px.
- [L] 04-record-top — heatmap text equivalent unverified (not visible in capture); heading order not DOM-checked this pass.
- [L] 08-first-session — safety/caveat sentences ("Non-optional in weeks 1-3") are muted-weight body, same as trivia → ink for the clause that matters.

## P1 first
1. Kill sentence-in-eyebrow: cap 11px mono eyebrows at ~3 words everywhere, move sentences to 13px sans (08, nav labels).
2. Fix sticky-bar overlap on Check and Session brief (scroll padding) — it hides the safety controls.
3. Swap interactive borders to line-strong (intake options, outlined buttons) for 1.4.11.
