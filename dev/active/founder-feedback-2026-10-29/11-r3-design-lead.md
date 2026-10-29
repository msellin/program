# R3 Design lead: Profile and Plan IA (2026-10-29)

Frame: Profile = who I am + what I'm training + the exits. Plan = the week. Everything else is a verb that belongs where the noun is.

## Profile: ideal order (MVP)
1. Account card (KEEP; drop the STAFF chip for non-staff, it is already conditional, keep it only for you).
2. YOUR PROGRAMS (KEEP, REDESIGN) - moves above maxes: programs are the object, maxes are an attribute of them.
   - REDESIGN: "INTAKE PENDING" (profile/page.tsx:227) must key off "intake never completed AND no sessions logged", not a missing field. A program trained for weeks is a bug, not a state. Show "Week 6 of 34" instead (the useful fact). "End/Remove" go behind a row chevron into a program sheet, not inline buttons (misfire risk on a destructive verb).
3. WORKING MAXES (KEEP, REDESIGN) - answers the founder's Q: no, it is only lifts with a training max; skill programs show nothing. Fix: hide the card when empty (no empty shell), and title it "Lift maxes". Do not invent skill levels here; the skill tier belongs on the program row ("Tier 2 of 4"). Reason: one number per program, one place.
4. MORE (REDESIGN to 3 rows): Send feedback, Guide, Re-run intake. 
   - Extra session -> MOVE to Today (a "+ add a session" tail on the day card; it is a Today verb). 
   - Report -> MOVE to Record (it is a read of the log). Evidence -> MOVE into Guide as a section (the citations are the trust story, but nobody opens it from a settings list). 
   - Re-run intake -> MOVE inside each program's sheet (it is per-program, not global).
   So MORE = Send feedback + Guide. Two rows; rename the group "Help".
5. AWAY DAYS: CUT the card for MVP; MOVE to Plan as a day-row action ("Can't train this day/range") reusing Skip/Move. Founder is right: it is a calendar form, which we decided not to build (no-calendar-events-ui). Keep the data model, remove the form from Profile. Saves ~25% of the screen.
6. Footer: Privacy, Terms, Medical disclaimer, Sign out - KEEP, but Sign out as a plain text row, not a button; Delete account must remain reachable (GDPR) - confirm it is behind the gear/account card.
Settings gear: keep for prefs only (units, notifications, theme). Not a second Profile.

## Plan: above the list (today 30-40% of screen)
- CUT the intro sentence (the legend and chevrons teach it; the founder has it memorised after one use).
- MERGE the week switcher and phase card into one 2-line header: "‹ 26 Oct - 1 Nov ›" with "Cycles 3-4 · strength test" as a subtitle. Drop "This week" (the date range plus the TODAY row says it).
- LEGEND: CUT as a standing row. Replace with a long-press/info popover on the dots, or delete once dots are fixed (below).
- Result: first day row at roughly 20% of the screen, not 35%.

## Plan: each row
Line 1: "Mon 26" + status word only when not planned (Done / Skipped / Moved). Line 2: the first session title, then "+1" - not two titles ellipsised mid-word. Drop the "2 TRACKS" chip on every row (it carries no information when true on all rows; show it only when tracks differ in state, which the dots already do). Keep "· 1 logged" but as "1/2 done" so progress is a fraction. Chevron stays.

## The dot question
Two dots = two programs, but with no key they read as noise. Fix: dots take the PROGRAM colour identity only if each program has a stable hue (hip = bronze, overhead = slate); state is fill (filled = done, ring = planned, struck = skipped). Then today's tint, not a bronze dot, marks today, which removes the legend collision. Add a one-time key: tapping the week header shows "● Anterior hip  ● Overhead". With 1 program, show no dots at all. Cap at 3, then "+N".

## Score
Plan now 6/10 (clear, pretty, but header-heavy and its dots unreadable). After 8.5/10.
Profile now 6/10. After 8/10.

## MVP before ads
The ad lands a new user on Today/Profile with one program; their Profile must not show an empty maxes shell, a calendar form, or "intake pending".

## Top 3
1. Fix "INTAKE PENDING" on programs in use and put Programs first; destructive verbs into a program sheet.
2. Cut Away days form and shrink MORE to Help (Extra session -> Today, Report -> Record, Evidence -> Guide, Re-run intake -> program sheet).
3. Plan header: drop intro and legend, merge switcher+phase into one header; dots get per-program hue + fill-for-state, no chip on every row.
