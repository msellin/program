# R3 mobile UX: Profile scroll depth, Plan header, row scanability (412x915)

Basis: profile/page.tsx, components/profile/AwayDays.tsx, plan/page.tsx:330-700. No code edited.

## Profile (ideal order)
Account row, Programs, Working maxes, More (trimmed), Away days (collapsed), footer + Sign out.
- Account card: KEEP, but compress to one 56px row; "STAFF" chip is internal, hide for non-staff screenshots/ads. (profile:116-140)
- Programs: MOVE ABOVE maxes. It is the thing people open Profile for and answers "what am I on". REDESIGN the badge: "INTAKE PENDING" on a 6-week-old program reads as a bug; show it only when the program has zero logged sessions, otherwise show "Week N of 34". "End this program"/"Remove" text links are fine (min-h-11, profile:256).
- Working maxes: KEEP, MOVE below Programs. Answer to founder: only lifts in training_maxes appear; skill programs show nothing, so hide the card entirely when empty (BeliefsSection already returns null) and for skill tracks show tier/level there instead (one line: "Handstand Walk . Tier 2").
- Away days: CUT from the page for MVP, MOVE to Plan (a "Can't train?" overflow action on the week card, or per-day Skip already covers one day). Today it costs ~330px: explainer + 3 stacked/wrapped fields + Add (AwayDays:87-133, flex-wrap with min-w-120/140 wraps to 3 rows at 412). Native date pickers on iOS also open a wheel that hides the form. If it stays: collapse behind a single "Add away days" row, and make the form a bottom sheet.
- More list: 6 rows x 48px = 288px. KEEP Send feedback, Guide, Re-run intake (rename "Redo intake"). MOVE Extra session to Today/Plan (it is a training action, not settings). MOVE Report + Evidence into one "Your data and evidence" row (or onto Record). CUT nothing legal. Confusing: Report vs Evidence vs Guide are three "read about it" rows; Guide could be the only one in MVP.
- Footer links: KEEP (required). Sign out: KEEP, last, destructive styling off.
Result: Profile drops from about 4.5 screens to about 2.

## Plan
Header stack before first day is about 330px = 36% of 915 (wordmark ~56, H1 ~40, intro ~44, switcher ~64, phase card ~56, legend ~24, gaps ~45).
- CUT the intro sentence (the chevron on each row teaches tap). Saves 44.
- MERGE H1 "Plan" away: the wordmark + tab already say it; fold into week switcher. Saves ~50.
- MERGE phase card into the switcher card as a second muted line ("Cycles 3 and 4 . includes a strength test"). Saves ~56.
- MOVE legend into a "?" popover, or drop it and fix the dots (below). Saves 24.
Target header about 130px (14%): first row visible at ~190px, whole week fits on a 915 screen (7 x 76 = 530).
Tap targets are fine: arrows 44x44 (plan:339), row is a full-width button. Hidden "Now" slot reserves 44px of dead width when on this week.

Row should show: Day + date (aligned grid), ONE status mark, session title(s), chevron. Currently each row carries dots + "1 logged" + "2 TRACKS" chip + "Today" chip + chevron on line 1, so line 1 wraps and the title on line 2 truncates ("pre..."). Fixes:
- CUT the "2 TRACKS" chip on every row (plan:~665): when it is true on all 7 rows it carries zero information. Show it only when it differs from the week norm, or drop it; the dots already count tracks.
- Titles: lead with the first program's session; "+ 1 more" instead of mid-word truncation. Allow 2 lines.
- Keep "N logged" but right-aligned with the chevron, not inline in the title line.
Dots: two dots = one per active program, coloured by state; nothing tells you which is which. Fix: for 2+ programs use ONE dot per row for the day (the existing single-status `status`, plan:~590), and put per-program detail in the expanded row where names already exist. Bronze for today is not in the legend: drop the dot colour for today and rely on the tint + "Today" chip. If dots stay, add the program initial in the expanded view.

Score (1-10): now 6 (clear and pretty, but header tax, noisy line 1, unexplained dots). After changes 8.5.

## Top 3
1. Plan: collapse the header to about 130px (drop intro and H1, merge phase into switcher, legend to a popover) and drop the constant "2 TRACKS" chip.
2. Profile: reorder Programs first, move Away days off Profile (to Plan) and Extra session off More; hide empty Working maxes; show "INTAKE PENDING" only with zero logged sessions.
3. Plan dots: one status dot per row (not per program), no bronze-without-legend; per-program detail only on expand.
