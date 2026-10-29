# Founder feedback round 3 (2026-10-29 evening): Profile and Plan, MVP cut before ads

The founder (two tracks: anterior-hip-rebuild + overhead-mobility) sent five phone screenshots (not on disk;
described here) and asks: what is needed for the MVP before the €150 ad test, what is confusing, what could look
better, and is Plan clean, intuitive and engaging enough. Terav is a focused-improvement app, NOT a full plan.
Read `CLAUDE.md` at the repo root. Peers (Hevy, Strong, Runna, GOWOD) are idea sources only.

## Profile (`app/profile/page.tsx`, `components/profile/BeliefsSection.tsx`)
Top to bottom: wordmark + gear; H1 "Profile"; account card (avatar "S", email, "JOINED AUG 2026", "STAFF" chip, ›);
**YOUR WORKING MAXES** card: Front Squat 107.5 kg ⌄, Back Squat (High Bar) 122.5 kg ⌄, Block Pull (Midshin) 155 kg ⌄;
**YOUR PROGRAMS**: "Anterior hip + strength rebuild · 34 weeks · intermediate · TODAY'S · INTAKE PENDING" with
"End this program"; "Overhead Mobility · 10 weeks · multi-tier · INTAKE PENDING" with "Remove";
"BROWSE ALL PROGRAMS →"; **AWAY DAYS** card: explainer ("Days you can't train. Nothing gets prescribed — you can
still log a ride, a run or a class, and the engine still reads it."), FROM / TO date pickers, "WHY (OPTIONAL)" input,
"Add"; **MORE** list: Extra session, Send feedback, Re-run intake, Report, Guide, Evidence (each a row with icon ›);
footer links Privacy · Terms · Medical disclaimer; "Sign out" button; bottom nav Today / Plan / Record / Profile.
Founder: working maxes and programs are nice. Q: does the working-maxes block adapt to all programs? (Fact: it lists
every key in `store.training_maxes`; only lifts with a training max appear — skill programs use tiers/levels and
show nothing there.) Away days: "maybe not in MVP? messy, takes room". More: which rows are needed for MVP, which are
confusing, could they look nicer? Note "INTAKE PENDING" shows on programs he has been training for weeks.

## Plan (`app/plan/page.tsx`)
Wordmark + gear; H1 "Plan"; intro "Your week at a glance. Tap a day to see it, move it or skip it."; week switcher
card "‹ 26 Oct → 1 Nov / This week ›"; phase card "Cycles 3 and 4 · includes a strength test"; legend row
"● PLANNED ● DONE ● SKIPPED ● MOVED"; then one card with seven day rows. Each row: two small grey dots, "Mon 26 Oct",
"· 1 logged" (green, on Mon/Wed), an amber-dot chip "2 TRACKS" on every row, a chevron; second line the session
titles joined with "+", truncated ("Mon — heavy squat day + Daily reset · pre…"). Today's row is tinted with two
bronze dots and a "TODAY" chip. Founder: "looks nice", but asks what the two dots mean (fact: one dot per active
program, coloured by that program's status — `page.tsx:581-608`; bronze for today is not in the legend), and says
30–40% of the screen is used before the first day row appears.

Also on the founder's mind (round 1/2, now being built): Plan's Move now actually moves sessions (fixed today).

## Output
Write `dev/active/founder-feedback-2026-10-29/<NN>-r3-<lens>.md`, ≤ 35 lines. For Profile: per section KEEP /
MOVE (where) / CUT for MVP / REDESIGN, with one-line reasons; the ideal order. For Plan: what to cut or merge above
the list, what each row should show, the dot question, and a 1–10 score now and after your changes. End with your
top 3. Reply with the top 3 and the scores only. Don't edit code.
