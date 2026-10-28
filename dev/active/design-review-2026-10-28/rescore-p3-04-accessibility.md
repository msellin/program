# Rescore P3 04 Accessibility / gym legibility (after d5c1749)

Evidence: live A-first-run 07-today-day-1, 08-first-session, 11-record-after-session (+ C-viewport files not re-opened). Screenshots only; no DOM or measured contrast.

Scores (round 1 -> P0 -> P1 -> P2 -> now, 10 best):
- Text density: 8 -> 8 -> 9 -> 9 -> 9
- Text size: 6 -> 6 -> 7 -> 7 -> 7 (eyebrows 12px, still uppercase grey; set counts and "OPTIONAL" unchanged)
- Visual richness: 6 -> 7 -> 7 -> 8 -> 8
- Consistency: 8 -> 8 -> 8 -> 8 -> 8

## Improved
- 07 Today: 144px figure on bronze tile reads at arm's length; "Do a morning check first" is a 44px link (2.5.8).
- 08 brief: variant names ("Ring row (horizontal)") make rows distinguishable for SR users (2.4.6); plain block titles.
- 11 Record: heatmap now shows Done after session 1; legend pairs colour with text labels.

## Still wrong
- [H] 11 Record - both heatmaps are colour-only cells (green vs dark grey, 1.4.1/1.1.1); no text equivalent visible and the lone Done cell is tiny -> role="img" + aria-label summary or a table; the "1 active day" line is a start.
- [M] 07/08/11 - 12px uppercase grey eyebrows (READINESS, ROLLING 7-DAY AVG, OPTIONAL, 25-30 MIN) still under comfortable gym size, borderline contrast (1.4.3) -> 13px ink-2.
- [M] 11-record - unselected legend ring "Rest or missed" and empty heatmap cells are near-invisible against card (1.4.11) -> line-strong.
- [M] 08 - Start session bar still sits over the next card at rest; scrap-retraction row still ellipsised -> wrap.
- [L] DOM-only items still unverified: one h1 per route, aria-current on nav, focus ring against sticky bars, focus move to Done heading.

## Next
1. Heatmap text equivalent plus visible Done cell size.
2. Muted-text and border tokens (ink-2, line-strong).
3. DOM/keyboard pass with axe on Today, brief, Record.
