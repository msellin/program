# Panel: mobile UX (Sonnet) — 2026-10-27 evening sweep
Coverage: 14 images (pullup, csm-red, gaps B/C-375). Handstand, strength-long, A-first-run, 393 not opened.

1. FIX-TONIGHT — Plan "Move session" sheet clipped on the right, Move button looks disabled with a row selected; no grabber, X top-right. `persona-pullup/flows/plan-move-sheet/01-move-sheet.png`. Likely missing `min-w-0` / w-full+padding overflow.
2. FIX-TONIGHT — Guided player: "This hurts" + Close at the very top (ouch zone); thin outlined pill ~36px, colour only on text. Move into bottom cluster. `session-follow-along/02-guided-ready.png`, `03-guided-working.png`.
3. FIX-TONIGHT — Guided rep counter: "−1" and "Log all 10" ~36px; no "+1" (only Log all, wrong for short sets); Back / Skip set 11px labels; unguarded Skip set one thumb from Set done. `03-guided-working.png`.
4. FIX-TONIGHT — Guided Done screen: "L·0 sets / R·0 sets / Both·1" + "10 skipped — not logged" on bilateral ring rows reads as data loss; only "Back to session", no "Next block". Same chips on Stopped. `05-guided-done.png`, `session-follow-along-stop/03-guided-stopped.png`.
5. FIX-TONIGHT — Floating feedback button covers a sheet row at 375; header "CONCURRENT-STRENGTH MAINTENANC" clipped. Hide FAB while a sheet is open; truncate label. `gaps/B-red-day/07-session-started-on-red.png`.
6. FIX-TONIGHT — Brief: ~3 taps + scroll to first set; three prose cards with citations ("Fahs 2015") push Follow-along below the fold; first card clipped by nav. Sticky Start CTA, collapse prose. `session-follow-along/01-brief.png`, `session-finish-here/02-finished-here.png`.
7. LATER — Rest screen: RPE chips ~38px, 10px labels; "Do something else next" unlabelled link near home indicator; no safe-area padding. `session-log-set/03-rest.png`.
8. LATER — Set screen header crowded; exercise tabs truncate; Stop session in hurt sheet has no confirm, 8px under "Skip this exercise". `csm-red/flows/session-hurt-stop/02-hurt-sheet.png`, `03-session-stopped.png`.
9. LATER — Plan skip confirm sheet floats; destructive amber looks like a safe action; day-card actions small, wrapped. `plan-skip-confirm/01-skip-confirm.png`.
10. LATER — 375 rest-day screen is a dead end (no next-session preview); nav labels 10px. `gaps/C-viewport-375/03-session-bottom.png`.

Top 3: dock hurt/stop/rep controls in thumb zone ≥44px + add +1; fix Move sheet clip + FAB over sheets; sticky Start on brief, collapse prose, Next block on Done.
