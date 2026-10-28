# Rescore P2 03 Copy density (after redesign P2, f0f094f)
Evidence: A-first-run 06-intake-03, 07-today-day-1, 08-first-session, 10-session-done; C-viewport-375 02-plan-top.

Scores (round 1 -> P0 -> P1 -> now): text density 6 -> 8 -> 8 -> 9 | text size 8 -> 8 -> 8 -> 8 | visual richness 6 -> 8 -> 8 -> 8 | consistency 6 -> 7 -> 8 -> 8

## What improved
- Today day 1: one hero card above the fold ("3 blocks · 6 exercises", one line of intro, "25-30 min", one CTA, one quiet link). The stack of cards is gone.
- Intake: the stepper is a vertical list with short labels ("No hang yet", "Hang established, no strict rep yet"). Two consents are now short (~12 words each).
- Brief: compact block headers ("Row strength", "3 moves · with a timer"), rows with thumbnails and a plain "3 sets". Session length is the same everywhere ("25-30 min").
- Session-done: "Done / 11 sets across 3 movements." plus three big numbers, Best set and Next session. It has no streak language and a clear payoff.

## Still wrong
- [M] 06-intake-03: "Often by week 8: 25-45 second dead hang, first clean scapular pulls, and 5-10 strict feet-elevated ring rows." is unchanged, 3 lines of jargon. -> "By week 8: a 25-45 s hang and your first clean pulls."
- [M] 07 Today and 08 Brief: block names are still jargon ("Row strength — closed-chain pull", "Scapular pull ladder", "Shoulder + grip prep — every session"). -> "Rows", "Scap pull-ups", "Shoulder and grip prep".
- [M] 375 Plan: Mon shows "Skipped" with a struck-through "Skipped session" and an Unskip link. This is still a tone risk, and it is the third round it has been listed. -> "Rest day", no strike-through, no label.
- [M] 375 Plan: the intro is unchanged: "The 7-day rhythm. Browse other days, move sessions, skip a day — all from here." -> "Move or skip any day."
- [M] 10 Session-done: the level ladder repeats in full at the bottom of "Done", and "Next level: Hang established, no strict rep yet" is the current level's own text. It reads as a progress claim after one session. -> Show only "Level 1 · No hang yet", with the ladder behind a tap.
- [L] 06-intake-03: the two consents overlap (both about shoulder pain). -> One line: "Not medical advice. I'll stop if my shoulder hurts."
- [L] 06-intake-03: the three stat tiles (Weeks / Minutes / Days) are half empty with 20px values in 80px boxes. -> Make them one row, "8 weeks · 25 min · 3 days".
- [L] 08 Brief: "Scap retraction hold ..." is truncated and "OPTIONAL" sits at the far right. -> Wrap the name to 2 lines.

## P3 should do first (copy lens)
1. One pass on the jargon strings (block titles, week-8 line, Plan intro, Skipped/strike-through). They are small, and four rounds have not removed them.
2. Session-done: cut the ladder to one line.
3. Intake: collapse the stat tiles and the consents.
