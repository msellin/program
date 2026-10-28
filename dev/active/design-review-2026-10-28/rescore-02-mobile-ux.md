# Rescore 02 Mobile UX (after e6f1139)
Evidence: A-first-run 05/06-01/07/08, C-viewport-375 05-check-top (fresh captures only).

Scores (new / round 1 doubled):
- Text density: 7 / 6
- Text size: 7 / 8
- Visual richness: 6 / 6
- Consistency: 7 / 8

Text size and consistency drop slightly: the 11px mono caption in the session footer is unchanged, and the new program page and the old session brief now feel like two different apps.

## What improved
- Today day 1: the tour card is gone. "Start your first session" is a 48px primary button at y~375, above the fold at 375x667 (07-today-day-1). Round-1 finding 1 is fixed.
- Program page (05): the SVG figure, 3 stat tiles and a sticky full-width "Start free" at y~560 sit in the thumb zone. Round-1 finding 9 is fixed. Everything is visible without scrolling at 375.
- Quick start (06-intake-01): 3 steps, large option cards about 50-60px tall, and a full-width Continue at y~475. This replaces the 16 small Yes/No screens, so finding 7 is gone.

## Still wrong
- [H] 08-first-session — the sticky footer is unchanged: "Log an extra session" row + 2-line 11px mono phase caption + Start + nav is about 190px (28% of 667). A Follow-along card is clipped mid-title at y~450 → move the phase line into the header, move the extra-session row into the page body, and stick only Start + nav.
- [H] 08/09-first-session — "How to run this" is still 3 prose cards (about 190px) before the first exercise, and the Follow-along scroll-in-scroll is unchanged → show 1 card and collapse the rest; use "+N more" instead of an inner scroll.
- [M] C-375/05-check-top — the sticky "Update check" button still covers the Elbow row, and the Shoulder chips are about 30px tall (fail Apple 44) → add pb-28 to the scroll container; use min-h-11 on the chips.
- [M] 06-intake-01 — the Continue button looks disabled (muted bronze) with no hint that you must pick an option. The "Detailed setup (about 5 min)" link is an underlined 14px text link, about 18px tall → use min-h-11 on the link, and show an enabled-state hint.
- [M] 07-today-day-1 — "Do a morning check first" is a text link about 20px tall, and the "No check yet" card is cut off by the nav at y~614 → make it a 44px secondary button.
- [L] 05-program-detail — the bottom nav shows to a not-yet-enrolled user alongside the sticky CTA. Two stacked bars take about 115px of 667. Consider hiding the nav on this page.
- [L] Round-1 findings 4, 5 and 8 (Today red-state link, Plan header pile) were not re-captured as changed; treat them as still open.

## P1 should do first
Fix the session-brief footer and the "How to run this" prose, which is the last unchanged heavy mobile surface and the first screen after Start. Then fix the check CTA overlap and the 44px chips.
