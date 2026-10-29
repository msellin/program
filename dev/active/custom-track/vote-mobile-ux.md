# Vote: mobile UX (375x667, one-handed, 44px, safe areas)

| id | vote | reason |
|---|---|---|
| B1 | APPROVE | One meta line replaces phase jargon; cheap. |
| B2 | AMEND | Drop at <700px tall (about 72px of fold for numbers B1/B4 already say); keep at 852. |
| B3 | APPROVE | Carries the core idea (names the log signal); one line, tap target must be full-row 44px. |
| B4 | AMEND | Chips on main card must be non-interactive text and wrap to max 1 row; thumbnails stay decorative. |
| B5 | APPROVE | Full-width pill in bottom third; keep sticky with pb-28 + fade; "Finish" 44px. |
| B6 | AMEND | Approve only as non-tappable 8px dots inside header; a 7-day row edges toward a calendar/full plan. |
| P1 | AMEND | 4px bar OK but must sit below safe-area-inset-top; not a tap target. |
| P2 | APPROVE | Fixes the truncating rail; button h-11 full width; sheet items 48px. |
| P3 | AMEND | 24% (160px) only if height >=760; at 667 collapse to a 56px thumbnail + "Watch demo" pill (budget below). |
| P4 | APPROVE | One 24px line, never truncates; replaces caption. |
| P5 | AMEND | 64px numeral at >=700, 52px at 667; "Last top set" stays one line. |
| P6a | APPROVE | 56x44 chips, one 56px row, centred current; 15+ sets scroll sideways, fits. |
| P6b | REJECT | 3 rows x 44 = 132px, 76px more than P6a; does not fit at 667 with the band. |
| P7 | APPROVE | One 20px muted line; no tap target. |
| P8 | APPROVE | Done 56px, pills h-11 with 12px gap, Missed in a separate tint; AMRAP grid-cols-5 two rows. |
| P9 | AMEND | Ring only if effort question stays one tap; ring must not push the hero lower than 667 budget. |
| P10 | AMEND | Fine at brief/band; no wash on the 667 player (no band). Flat bronze tokens only. |

Pick: **P6a**.

## 667px player budget (SE, no island)
safe-top 0 | top bar + switcher 52 + progress 4 = 56 | media 56 thumb (inside hero row, 0 extra) -> band 0 | set line 24 | chip strip 56 | hero 52-64 numeral + plates + last = 112 | next-up 20 | Done 56 | secondary 44 | safe-bottom 16 | gaps 8x8 = 64.
Total **~448 with no band; 608 with the 160px P3 band** (59 slack). On island phones add 47 top + 18 bottom: 673 with band = overflow ~6px, so band must go (or <=100px) below 700px tall. AMRAP: swap Done 56 for 2-row grid 112 (+56): 664 with band, no fit; fits without band. With P6b instead: +76, no fit with band.
What gives at 667: the band (to thumbnail), B2 trio, numeral size.

## Scores (1-10)
- Brief: **7.5** (peer polish added, still one focus; B6 mild scope drift).
- Player: **7.0** (right bones, 44px chrome, fits only if the band is conditional on height).
