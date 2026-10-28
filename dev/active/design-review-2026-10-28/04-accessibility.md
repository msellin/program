# 04 Accessibility / readability (lens: sweaty gym, arm's length)

**Verdict:** Contrast is solid and the new scale is mostly readable; the real risk is 11px uppercase mono (289 `text-eyebrow` uses) carrying meaning and whole sentences, plus a few clipped/overlapped spots. No ads-blocker.

Scores (1-5, 5 best): text density 4 | text size 3 | visual richness 3 | consistency 4

Contrast computed from `brand/tokens.css` (WCAG ratios):
- muted #93989f: ground 6.6, surface 6.1, surface-2 5.4, surface-3 4.7. All pass AA.
- ink 9.6+ everywhere. teal >=6.1, bronze >=5.2, amber >=6.3, green >=5.3.
- red #e5654b: 5.7 ground, 5.3 surface, 4.7 surface-2, **4.08 on surface-3** (fails 4.5 as text; red-strong exists, check use).
- `--color-line` #5f6570 is 3.0 on surface and 2.7 on surface-2: borders on surface-2 fall under 1.4.11 3:1.

## Findings
1. **FIX-THIS-WEEK. Eyebrow/mono 11px used for sentences.** "HANG, SCAP, ROW BASE · WEEK 1 OF 8 · ENDS 22 DEC" wraps to two lines of letter-spaced uppercase mono right above the CTA (`A-first-run/09-first-session-bottom.png`, `08-first-session.png`). All-caps mono at 11px is the slowest text to read with sweat and distance. Cap eyebrows at ~3 words; set sentences in sentence case 13px sans.
2. **FIX-THIS-WEEK. Bottom-nav labels 11px mono uppercase** (`C-viewport-375/01-today-top.png`). Inactive labels in muted on surface-2 pass (5.4) but are the smallest tappable text. Icons carry it; consider 12-13px or drop mono for labels. Tap targets are full-width columns, fine.
3. **FIX-THIS-WEEK. Sticky "Update check" button covers the severity segmented controls** (`C-viewport-375/05-check-top.png`): the Mild/Notable/Severe row is cut in half behind the bar. The controls are the safety input; make sure they can be scrolled fully clear (bottom padding) and that the segment buttons are >=44px tall.
4. **FIX-THIS-WEEK. Clipped eyebrow beside H1:** "WEDNESDAY / FIRST STRICT PULL-" truncated at 375 (`A-first-run/08-first-session.png`). cb83e26 says it was fixed; re-verify on live (`C-viewport-375/03-session-top.png` shows the fixed stacked form, so this shot is probably stale).
5. **FIX-THIS-WEEK. Status text on tinted/raised surfaces:** `1 green · 1 amber · 1 red` in amber, 13px mono, wraps awkwardly ("1 / red") (`C-viewport-375/04-record-top.png`). Colour is paired with words so 1.4.1 is OK, but the orphaned "red" reads as a bug. Use a stacked row or sans caption.
6. **LATER. Heatmap cells have no text equivalent visible; legend is 11px mono** (`04-record-top.png`). Legend does pair colour with word (good). Confirm a table/aria summary exists (SR, 1.1.1).
7. **LATER. `--color-line` on surface-2 is 2.7:1** for card/button borders; outlined buttons ("Optional" card, date picker) are fine on ground (3.3) but weaker on raised cards. Use `line-strong` (#6b717d) for anything interactive.
8. **LATER. Heading order:** the Today/Plan/Record pages use a 32px H1 with the program name as the H1 on Today and a "Rest today." card title (reads as h2/h3). Verify one H1 per route and no h1→h3 skip in `next-app/src/app/page.tsx` (not checked in DOM this pass).
9. **LATER. `disabled:opacity-30/40`** on plan arrows (`plan/page.tsx:313,334,962`) drops muted text below 3:1; disabled is exempt from 1.4.3 but reads as invisible in sunlight.
10. **TASTE.** Muted body at 13-14px (e.g. "Your shoulder is 8/10..." `01-today-top.png`) is dim grey on dark; it passes (6.1) but is the paragraph that matters most on a red day. Use ink for the safety sentence.

## Keep
- Muted token raised to #93989f: every text colour passes AA on all four surfaces except red on surface-3.
- Status never colour-alone: icon + word + left bar (`05-check-top.png` "BACK OFF" dot + label; Record legend).
- Primary bronze button with dark text, ~7:1 and large (`09-first-session-bottom.png`); 44px min-heights widespread in source (231 matches).
- Metric/H1 sizes (32/40) are legible at arm's length; H1 + short body on Today is a clean, low-density hierarchy.
- Skip link present ("Skip to content" in Today DOM capture).
