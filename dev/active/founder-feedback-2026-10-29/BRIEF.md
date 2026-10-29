# Founder feedback, 2026-10-29: brief for the expert panel

The founder trained today on the live app (anterior-hip-rebuild, his own `personal: true` program, plus the
overhead-mobility track running alongside) and sent four phone screenshots (`shots/`, ~412×915 Android, PWA).
He says the app "looks much, much better" overall. Your job: give your lens's take on each of his points below,
score where asked (1–10, 10 = best), and **vote** a recommendation per point. Peers (GOWOD, Runna, Pliability, Hevy,
Strong — `dev/audits/app/competitor-refs.md`) are idea sources, not templates. Terav is a focused-improvement app,
NOT a full training plan; confirm-first (engine proposes, user Accepts) is non-negotiable.

## Screens
1. `shots/1-set-player-bss.webp` — set player, Bulgarian split squat (`components/session/SetView.tsx`).
2. `shots/2-today-top.webp` — Today, two track hero cards (`components/session/TodaySession.tsx`, `today/TodayHero.tsx`).
3. `shots/3-today-below.webp` — Today below the fold: check card, "First hip check +1 more", "2 tracks scheduled
   today", "Heavy squat day — keep conditioning light" (`workout/HeroStateCard.tsx`, `workout/SignalsStrip.tsx`,
   `TodaySession.tsx:623`, `workout/RunSlotCard.tsx:907`).
4. `shots/4-mobility-brief-done.webp` — overhead-mobility brief with both moves DONE (`session/BriefView.tsx`).

## The founder's points (verbatim intent) + facts the lead established in code
A. **Figure motion.** On Today the figure moves; in the set player it doesn't (he thinks). "Watch demo" opens
   YouTube — "very good". Should the in-session figure move, or stay still with Watch demo covering motion? Is it
   intentional that only lead lifts animate?
   *Fact:* the set player is *coded* to animate (`SetView.tsx:534`, `playing={!demoOpen}`); brief thumbnails are
   still by design. So either it is a bug on his device or the motion is too subtle to read. Treat both possibilities.
B. **Today below the fold is a near-full page of blocks/text.** Does the check card need to be that big? The "First
   hip check" strip? (*Fact:* hip check is hip-program only, `SignalsStrip.tsx:425`; the check card shows for every
   program.) The "2 tracks scheduled today… snooze from Profile" banner? The "Heavy squat day — keep conditioning
   light" card taking main-screen space — needed, or wrong place?
C. **Progress overview.** GOWOD shows an overall mobility score as a pie/ring, then per area. Could Terav have a
   track-specific equivalent? Or instead **session insights**: Runna's finished-session view says what went well /
   not. Runna also has AI-generated text; we'd not need it, or could use Haiku (very cheap). Constraints: every
   change cites a study or names its log signal; no new claims the data can't back; safety gates untouched.
D. **Brief after everything is done** (shot 4): is "Log an extra session" needed there? The page feels empty —
   OK or not?
E. **Going back in a guided set.** In the guided player (bar hang, timed) he went back to look at a finished set and
   could not return to the current one without skipping it or redoing it. *Fact:* `FollowAlong.tsx:485` Back sets
   the previous set to "ready" (redo); the only forward control is "Skip set", which marks it skipped. No way to
   view a finished set and return.

Today's data (his own log, for the coach lens): front squat 5×5 @ 80 kg, all "Easy (4+ left)" (plan: 5×5 at
65–75% of a 107.5 kg working max set by hand 1 Oct; last week 115×3). BSS / Nordic / sled not logged.
Overhead mobility both moves done. Only 1 morning check in the last 14 logged days. No working-max suggestion
for front squat after the 115×3.

## Output
Write `dev/active/founder-feedback-2026-10-29/<NN>-<lens>.md`, ≤ 40 lines: per point A–E your verdict, a concrete
recommendation (what to cut / move / build, with file:line where you can), and a vote **BUILD / CHANGE / KEEP /
CUT**. End with your top 3 in priority order. Reply with only the vote line per point and your top 3.
Don't edit code. Don't read or request any user data beyond what is in this brief.
