# R3 COPY lens: Profile + Plan labels (2026-10-29)

Source: `app/profile/page.tsx`, `components/profile/AwayDays.tsx`, `app/plan/page.tsx`. No code edited.

## Label fixes (current -> replacement)
- "INTAKE PENDING" (profile:227, amber, shown when no tier/intake_answers/baseline_capabilities): amber = warning, and it nags a program trained for weeks. CUT the pill. If the program has an intake and it is unanswered, show a tappable text link "Finish setup" instead. Never amber.
- "STAFF" chip (profile:136): internal flag shown to the founder only. Hide in production UI (admin tools live elsewhere), or if kept: "Admin".
- "TODAY'S" (profile:221): ambiguous ("today's what?"). Replace with "Up next today". Better: drop it; with a single main program it is noise. Show only when 2+ programs run: "Leads today".
- "2 TRACKS" on every row (plan:679): says nothing the dots do not. Show only when a day differs from the norm; replace with per-program names in line 2 (see Plan). If a chip stays: "2 sessions".
- "Re-run intake" (profile:352): jargon + sounds destructive. -> "Update my answers" (sub-line: "Changes what your program asks of you"). Hide when the program has no intake.
- "Report" (profile:363) vs page H1 "Training summary": label and H1 differ, and "Record" is a tab. -> "Training summary".
- "Evidence" (profile:383): page says "{N} cited studies". -> "Studies behind Terav".
- "Extra session" (profile:313): flag-gated off for the public catalog; vague. If kept: "Log an extra workout" (one noun: session or workout, not both). Cut from MVP.
- "Send feedback": keep. "Guide": keep, but "How Terav works" tells you what is inside.
- Section heading "More" is fine. "BROWSE ALL PROGRAMS ->": "Browse programs" (drop ALL and the arrow, chevron does the job).
- "WHY (OPTIONAL)" -> "Reason (optional)"; "Add" -> "Add away days". Caps for form labels is shouting.

## Away days explainer (AwayDays.tsx:57)
Now (22 words): "Days you can't train. Nothing gets prescribed — you can still log a ride, a run or a class, and the engine still reads it."
Replace (13 words): "Travel, illness, a break. Terav plans nothing on these days. Anything you log still counts."
Card title: "Days off" is plainer than "Away days"; keep "Away days" only if Plan uses it. Recommend "Time off". Collapse into one row "Time off · none planned ›" that opens the pickers; frees the room the founder complained about.

## Working maxes
Heading "YOUR WORKING MAXES" shows only lifts with a training max. Skill-only users get an empty card: hide the whole block when no maxes exist. Rename "Working maxes" -> "Lift numbers" would lose meaning; keep, add sub-line once: "Starting points for your sets. Terav proposes changes; you approve."

## Plan legend (plan:394-409)
"PLANNED / DONE / SKIPPED / MOVED" uses grey, green, amber, slate; today's bronze is not in it and the two-dots-per-row meaning is not stated. Replace with a single line, only when 2+ programs: "One dot per program: grey planned, green done, amber skipped, blue moved." Drop caps tracking. Better still: replace dots with the program names on line 2 and delete the legend.
Dot question answer: one dot = one active program that day. Say so in the legend, or remove the dots.

## Plan intro and rows
- Intro "Your week at a glance. Tap a day to see it, move it or skip it." -> cut entirely (the screen is the explanation); that is a line back.
- Phase card "Cycles 3 and 4 · includes a strength test": "cycles" undefined. -> "Weeks 3-4 · strength test this week" and merge into the week switcher subtitle instead of its own card.
- Row line 2: "Mon — heavy squat day + Daily reset · pre…" -> "Heavy squat day · Daily reset", drop the day prefix "Mon —" repeated from line 1.
- "· 1 logged" -> "1 done" (matches DONE in legend; "logged" vs "done" drift).

## Scores (Plan copy only)
Now 6/10. After: 8/10.

## Top 3
1. Remove "INTAKE PENDING" and "STAFF"; relabel "Re-run intake" -> "Update my answers", "Report" -> "Training summary", "Evidence" -> "Studies behind Terav".
2. Away days: collapse to one "Time off" row with explainer "Travel, illness, a break. Terav plans nothing on these days. Anything you log still counts."
3. Plan: delete intro + "2 TRACKS" chip, merge phase card into week switcher, replace legend with "One dot per program: grey planned, green done, amber skipped, blue moved."
