# Accessibility — Plan tab
Score now: 6/10 (Plan, opened-days state). What a 10 needs: one open day (single tab-stop region), one primary action, Move/Skip as a real menu/sheet with focus return, tracks as links with state in the accessible name, no wrapped 3-line labels, "Missed/Not logged" in text.
Record Recent score: n/a
D1 AMEND — APPROVE accordion, but on close/open keep focus on the toggle button the user pressed (no focus loss when the previous panel collapses and layout shifts); don't auto-scroll; keep aria-expanded/aria-controls (page.tsx:~590); Today-open default fine.
D2 APPROVE — single compact Link removes the 3-line wrap (page.tsx:897-944); keep >=44px; label "Log" must carry the date/track in its name ("Log Tue 27 Oct") not just "Log".
D3 AMEND — pick (a) overflow, but it needs aria-label "More actions for Tue 27 Oct", aria-haspopup="dialog", focus into sheet, Esc closes, focus returns to the "⋯" trigger. Existing MoveSheet/ConfirmSheet already use role=dialog aria-modal (SessionActions.tsx:164,248) — verify they trap/restore focus and Esc. (b) is the safest a11y-wise (plain buttons, no focus management); (c) is worst (acts on an implicit "open day").
D4 APPROVE — removing inapplicable verbs beats disabled buttons (disabled:opacity-40 + text-muted at page.tsx:921-936 fails 1.4.3 and gives SR users dead stops).
D5 APPROVE tappable rows (not the sheet) — rows are Links, name "Anterior Hip Rebuild, not logged, open session" (state in text, not colour/dot only; DayMarker dot is colour-only today). Whole row >=44px. Sheet adds a dialog stop for no gain.
D6 APPROVE — "planned" on a past day is a false statement for SR users too; use text "Not logged"/"Missed" plus check glyph with sr-only "Done"; never colour alone (1.4.1).
D7 (a) keep — no a11y difference; Recent must stay a list with links, not duplicate headings.
D8 REJECT uppercase — keep Sentence case. CSS text-transform is mostly read normally, but all-caps hurts low-vision/dyslexic legibility (1.4.12 spirit) and some SRs spell short caps; BottomNav already has aria-label="Primary" + aria-current (BottomNav.tsx:49,71).
D9 (mine) Muted text: --color-muted #93989f is 4.6:1 only on surface-3; verify on Plan card bg and at the 12px eyebrow/"· planned" size (page.tsx:~600 text-eyebrow text-muted); and bronze/15 pill "Today". Also `skip && opacity-70` on the whole row (page.tsx:557) drops all text below 4.5:1 — replace with a text "Skipped" label.
Top 3 findings:
1. Disabled Move/Skip with opacity-40 + muted text: contrast fail and dead tab stops — page.tsx:921-936 (1.4.3, 4.1.2)
2. Row opacity-70 on skipped days dims every child below AA — page.tsx:557 (1.4.3)
3. Full-width link "Log overhead mobility →" and "Log session →" are ambiguous out of context when repeated per day (2.4.4) — page.tsx:873-887, 905-910; need date in accessible name.
