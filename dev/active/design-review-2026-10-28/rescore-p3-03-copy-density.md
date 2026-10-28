# Rescore P3 03 Copy density (after redesign P3, d5c1749)
Evidence: A-first-run 06-intake-03, 07-today-day-1, 10-session-done, 11-record-after-session; C-viewport-375 02-plan-top. B-red-day has no captures (notes only), ignored.

Scores (round 1 -> P0 -> P1 -> P2 -> now): text density 6 -> 8 -> 8 -> 9 -> 9 | text size 8 -> 8 -> 8 -> 8 -> 8 | visual richness 6 -> 8 -> 8 -> 8 -> 8 | consistency 6 -> 7 -> 8 -> 8 -> 8

## What improved
- Jargon pass landed. Block titles are plain ("Ring rows — pulling with feet down", "Shoulder-blade pulls — scap pull-ups", "Shoulder and grip prep") on Today and in Next session.
- Week-8 line is readable: "hang from the bar for 25-45 seconds, do clean shoulder-blade pulls, and 5-10 ring rows with your feet raised."
- Intake consents are clearer ("Not medical advice. I'll see a clinician for shoulder or elbow pain that lasts past a session.") and "Detailed setup (about 5 min)" is a real link.
- Plan intro is shorter and in plain words ("Your week at a glance. Tap a day to see it, move it or skip it.").
- Today hero is calm: one card, one CTA, 3 plain block lines, and the day dots. The first-session CTA is clear.
- Record no longer says "No session history yet" after session 1. It shows "1 active day", "Wed 28 Oct - 3 done" and a green cell.

## Still wrong
- [M] 375 Plan: Mon is still "Skipped" in amber with a struck-through "Skipped session" plus Unskip. This is the fourth round it has been listed, and it is a tone risk on a day-1 account. -> "Rest day", no strike-through; show Unskip only on tap.
- [M] 10 Session-done: the 4-level ladder is still repeated in full, and "Next level: Hang established, no strict rep yet." is a progress claim after one session. -> One line "Level 1 · No hang yet"; put the ladder behind a tap.
- [M] 11 Record: two near-identical 12-week heatmaps (Readiness and Activity) with the same legend. Retests says "0 events" and "Rolling 7-day avg" is empty on day 1. -> Merge them into one heatmap; collapse the empty trend cards into a single line, "Trends appear after your second retest."
- [L] 06-intake-03: the three stat tiles are still ~110px tall with a single 20px value. -> One row, "8 weeks · 25 min · 3 days/week".
- [L] 07 Today: "Do a morning check first" is the one quiet link under the CTA and is clipped by the nav at 375 height. It is the safety step. -> Move it above the CTA, or add one line saying what it gates.
- [L] 02-plan-top: "Mixed practice · After your first rep: each session mixes 2-3 drills..." reaches a day-1 user who cannot yet use it. -> Hide it until the first rep is logged.

## Next (copy lens)
1. Plan "Skipped" -> "Rest day", and cut the Session-done ladder to one line. Both have been open for 3+ rounds.
2. Record: merge the two heatmaps and collapse the empty trend cards.
3. Intake: tiles to one row. This is the last visible density gap.
