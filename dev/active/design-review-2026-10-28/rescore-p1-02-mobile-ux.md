# Rescore P1 02 Mobile UX (after 688de55)
Evidence: gaps/A-first-run 06-intake-01, 08-first-session; C-viewport-375 01-today-top, 05-check-top/bottom; C-viewport-393 01-today-top (that file shows Extra session). No persona mobile PNGs dated after 14:00 (none found); SessionDone not scored.

Scores (round 1 -> P0 -> now):
- Text density: 6 -> 7 -> 7
- Text size: 8 -> 7 -> 8
- Visual richness: 6 -> 6 -> 6
- Consistency: 8 -> 7 -> 7

Note: the session brief capture (08) still shows two expanded "Follow along" cards above the exercise list, not a closed "How to run this" disclosure, so the P1 brief change is not visible in the fresh capture.

## What improved
- Footer: the "Log an extra session" row and 11px mono phase caption are gone; only Start session (48px, y~571) + nav remain, about 110px of 667. P0 [H] footer finding fixed.
- Morning check 375: chips in Context are about 46px tall (None/<15/15-30/>30); the Shoulder chips are no longer clipped to 30px. The bottom capture shows clean scroll padding above the sticky bar. P0 [M] mostly fixed.
- Nav labels are 13px title case, readable at 375; active tab has a bronze top rule plus bold label (01-today-top), not colour alone.
- Intake-01: option cards 56-80px tall, one-line headings; consents/step copy shorter.

## Still wrong
- [H] 08-first-session — Follow-along cards (about 190px each, with inner list) still precede the exercises; the second card is cut mid-list behind Start → make "How to run this" one closed row, exercises first.
- [M] 05-check-top — the Update check bar still covers the Shoulder chips at first view (only chip tops show at y~517) → scroll the Shoulder row into view after Save, or shrink the bar to Save only.
- [M] 06-intake-01 — Continue is muted bronze (disabled look) with no "pick one" hint; "Detailed setup" is a 14px underlined link, about 18px tall → min-h-11 and a hint line.
- [M] 01-today-top (375) — "Log how it feels" is an underlined text link about 18px tall on the red-day card → 44px secondary button.
- [L] 05-program-detail — nav and sticky CTA are still stacked for a user not yet enrolled.
- [L] Today (375, red day) — about 280px of empty space below the card; the hero card is not visible in the capture, so it is unscored.

## P2 first
Collapse the how-to cards into the closed disclosure so the first exercise sits above the fold, then convert the two text-link CTAs (Log how it feels, Detailed setup) to 44px targets.
