# Visual craft — Plan tab
Score now: 4/10 (Plan, opened-days state). What a 10 needs: one open day at a time, one bronze or outlined primary per open day, Move/Skip demoted to a quiet header affordance, no wrapped labels, past-day state that reads true, and a quiet collapsed list where only the open day has weight.
Record Recent score: 6/10 (not examined closely; judged from the brief only)

D1 APPROVE — Several open days stack identical bordered buttons. At 393pt that is a wall of 44px outlines (phone-2, phone-5). One open day gives the page a single focal block. Today open by default is right.
D2 APPROVE — One compact button replaces the grid, so "Log session →" stops wrapping to 3 lines (page.tsx:897, 910). Use the filled `bg-bronze` button only for Today (:901). Past and future get one outlined button, so bronze keeps meaning "do this now". Drop the arrow glyph; the row chevron already implies navigation.
D3 AMEND — Pick (a), a "⋯" on the open day's header row opening a sheet. The sheet reuses the existing ConfirmSheet and Move sheet (:946). Option (b) adds a text strip that still takes about 40px in the column. Option (c) separates the verbs from the day they act on. Keep the "⋯" button at 44px hit size, ink-muted at rest.
D4 APPROVE — On a logged day, Move and Skip both draw as full-weight outlines (Mon, phone-2) even though they are dead actions. Hide them (:928-943) rather than disabling them. Disabled-but-visible still costs two buttons of height.
D5 AMEND — Make the per-program lines the tappable rows ("Anterior Hip Rebuild · Not logged ›"), with a 44px row height and a muted chevron. Reject the sheet alternative, which adds a tap for two tracks. This also deletes the full-width secondary button (:873-884), the loudest duplicate on screen. Keep the row's text weight at `text-small` ink with the state in muted.
D6 APPROVE — "planned" in grey on a past day (phone-2, Tue) next to an amber "Missed" header is a visual contradiction. Use muted "Not logged" in text-muted, with a green check when done. Do not add a third colour for missed. The dashed amber ring already carries it.
D7 (a) keep as is — I did not review Record closely. Plan looks forward, Recent looks backward. I abstain on a stronger vote.
D8 keep Sentence case — Today, Plan, Record and Profile at a roughly 12px caption (phone-5) already read calmly. Uppercase at 12px adds tracking and weight for no gain, and it clashes with the sentence-case 14px verbs.

D9 (own) — Collapsed rows truncate the summary with an ellipsis ("Daily reset · pre-…", phone-5). Clamp it to one line and show a single short title, such as the primary track's session name. The header row should carry the day, the date and one status mark. The full composition belongs in the open state.
D10 (own) — Header status copy "· 1 logged" in green sits beside a green check and a green "✓ back squat" line (phone-2, Mon). That is three greens saying the same thing. Keep the check and the exercise line; drop the "· 1 logged" suffix.

Top 3 findings
1. page.tsx:897 — `grid-cols-3` at 393pt gives about 105px per cell. "Log session →" wraps to 3 lines, and the buttons are equal in weight so nothing leads (phone-2, phone-5). Replace with one compact button plus a "⋯".
2. page.tsx:873-884 and 897-944 — an open past day with a secondary track renders 4 bordered 44px controls, about 190px of outlined buttons per day. With 2-3 days open, buttons outweigh content. D1, D2 and D5 together cut that to one.
3. page.tsx:1018-1047 (perProgramDayStates) — "planned" on a past day contradicts the amber "Missed" header (phone-2, Tue). Colour is semantically inconsistent: green appears three times on a logged day, and the bronze accent is used only for Today's button (:901) while outlined buttons fill the rest.
