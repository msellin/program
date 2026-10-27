# Design decisions: clean, intuitive, one product (2026-10-27)
Product-design-lead (Sonnet). Saved by the orchestrator from the agent's reply, because its file write was refused.
Basis: x01-x13, g1, h04-h06, findings-product. Paths are under next-app/src. The audits were read in part; the agent
did not re-verify the file refs in code.

**Root cause:** three headers, four card styles, three primary buttons, two navs and six names for one idea. Fix
the repeated building blocks, not the screens one by one.

## 1. Information architecture [HACKATHON]
- **Tabs:** keep 4, renamed **Today / Plan / Record / You** (`BottomNav.tsx:29-32`). Peer: Hevy, Runna.
- **Record = progress + history + report in one route.**
  - Report becomes an Export row.
  - Delete the /week, /progress and /history redirect stubs once links are fixed.
  - That also removes the second nav found in x07.
- **You = the only account hub:** Programs, Settings, Account (export/delete), Sign out, Legal.
  - Remove the header gear (`AppShell.tsx:172`). Peer: Pliability.
- **Extra session:** no tab. One row at the bottom of Today plus one entry in You.
- **Files:** `nav/BottomNav.tsx`, `AppShell.tsx`, `app/{profile,account,settings,record}/page.tsx`. **Effort M.**
- **Record numbers:** fix or hide the contradictory deltas (x07) before ads. S each. This is the proof screen.

## 2. One name per concept [HACKATHON, copy only, S]
- **Logging outside work:** off-plan, extras, activity, accessory and cross-modal all become **"Extra session"**.
- **Engine proposal = "Suggestion":** one sentence of change, a "Because …" line, and **Accept / Not now**.
  - Drop "ADVANCE TO TIER B / IGNORE" and "tier gate cleared".
- **Effort words:**
  - RIR/RPE → "reps left" / "effort".
  - TM → "working max".
  - "×0.95 applied" → "Eased today by 5% because you felt off".
- **Citations** on screen ("Shea & Morgan 1979", "order shuffled by the seed") move behind a "Why?" tap.
- **Files:** `workout/RestTakeover.tsx:35-39`, `RunSlotCard.tsx:85`, `BriefView.tsx:491`, `OffPlanSession.tsx`,
  `SignalsStrip.tsx:64`, `ProposalCard.tsx`, `TodaySession.tsx:418-427`.
- Keep one glossary list so the words don't drift.

## 3. Today hierarchy, at most 3 cards [HACKATHON, M]
1. **Safety banner,** only when amber or red, at the top. When red it replaces the hero CTA ("Hold today" plus the
   check link). Never a pill above a contradicting card.
2. **Hero: one state, one verb.**
   - The states are Check first / Start session (title, week N of M, duration, one primary) / Rest day.
   - Compute the week number once.
3. **Suggestion card,** inline and never sticky. Delete the sticky verb bar (`ProposalCard.tsx:13`).

- **Below the fold:** only the Extra session row and a last-session recap.
- **Day 1:** remove FirstRunBanner + YourPlanCard and show one check CTA.
- **Error text:** replace the raw `{error}` (`TodaySession.tsx:146`) with a friendly retry (S).
- **Files:** `session/TodaySession.tsx`, `session/shared/StatusCards.tsx:103`, `workout/HeroStateCard.tsx:47`,
  `workout/Day1EmptyState.tsx`, `FirstRunBanner.tsx`. Peer: Runna, Ladder.

## 4. Workout session [HACKATHON]
- **Flow:** Brief → Set → Rest → next → **Done screen** (none exists today).
- **Top action row** (owner rule):
  - Back, then "exercise n of N", then an always-visible **"Something hurt"** chip plus an overflow.
  - The chip opens a sheet: Note it / Swap or skip / Stop session.
- **Overflow:** remove "Pain or tweak" and "Stop here" from it (`OverflowSheet.tsx:131,215`).
- **Finish and Stop become two different handlers.**
  - Finish → Done.
  - Stop → a stopped screen with a symptom prompt.
  - Stop works for every program, not only handstand (`DaySession.tsx:446`).
- **Set screen:** one primary. "Change time" and "Log it now" become one secondary row, with a 44pt minimum target
  (`SetView.tsx:649,671`).
- **Done screen** (new `session/SessionDone.tsx`, effort L):
  - Shows: movements, sets, time, any lift change, an optional "How did it feel?".
  - Ends with one button, "Back to Today". The Suggestion (Accept / Not now) appears here.
  - Also fix the stale "Continue — Ring row" CTA. Peer: Strava, Hevy.
- **Rest rail:** untruncated labels, and no reorder after "Jump to" (`RestTakeover.tsx:446-454`). M.

## 5. One visual system
- **5a. One primary button [HACKATHON]:** `ui/Button`.
  - Tan rectangle, r8, sentence case, h-12.
  - Three variants: primary / outlined secondary / teal text-link tertiary.
  - Swap the primaries on Today, Session, Check, Intake, Sign-up and Sign-out first.
- **5b. One header rule [HACKATHON]:** the wordmark bar on the 4 tab roots only; sub-pages get a back link + one H1
  size. Fix Record's small H1 and boxed Export.
- **5c. One card [HACKATHON; tints BEFORE-SCALE]:**
  - Filled surface, 1px line, r12, p-4, 12px gap.
  - The left accent bar means status only.
  - Drop the decorative bars and the Programs category tints later.
- **5d. Type scale [BEFORE-SCALE]:**
  - H1 32 bold, H2 20 semibold, body 16, caption 13.
  - Eyebrow 11 mono uppercase.
  - Mono for numbers and dates only.
- **5e. Token drift [BEFORE-SCALE]:**
  - Sync app and landing muted, line and bronze.
  - Correct `line` in tokens.md.
  - Reduce the 1,552 hardcoded styles file by file.
- **Files:** `components/ui/Button.tsx`, `globals.css @theme`, `dev/design/{tokens,components}.md`. M.

## 6. First run
- **Carry-through [BLOCKS-ADS, M]:** landing CTA → sign-up → email confirm → the chosen program's intake. Fix the
  `?next` handling in sign-up and GoogleAuthButton.
- **Flow:** Welcome (promise + chosen focus + one button) → Focus (skipped if they arrived with a program) → Intake
  → first session.
- **Up-front intake, 5 questions or fewer:** target, current level, days per week, equipment, injury gate.
  - Safety gates stay up front.
  - The rest moves to "Finish your profile" in You and into sessions 2-3.
  - Hackathon cut: carry-through plus trimming the optional steps only. The full IntakeClient split is L, BEFORE-SCALE.
- **Record empty state [S]:** fix the H1 vs body contradiction (`record/page.tsx:114-115`) and hide
  "Retests · 0 events".

## Hackathon design scope (one day)
**DO, in priority order:**
1. Program carry-through, sign-up to intake (M).
2. Today: one hero, safety banner on top, no sticky bar, no contradictory pills, one week number, a friendly error (S-M).
3. Names: Extra session, Suggestion, reps left, working max (S).
4. Session: "Something hurt" in the top row, a real Stop, the Finish CTA fixed, a minimal Done screen (M-L).
5. One Button + the header rule on the six ad-path screens (M).
6. Tabs renamed, gear removed, Settings and Account folded into You (M).
7. Record's broken numbers fixed or hidden (S).

**LEAVE:**
- Full intake split.
- Programs tints and the accent-bar purge.
- Type scale.
- Token sync.
- Hardcoded-style purge.
- Evidence page grouping.
- Reset-password waiting state.
- Link grammar.
- Search for the extras list.

**If time slips, cut in this order:** item 6 → item 5 down to the Button only → the Done screen down to its minimum.
Never cut items 1, 2 or the "Something hurt" chip.
