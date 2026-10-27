# Verified app findings (QA lead, Sonnet, 2026-10-27)
Code-checked; src = next-app/src. Saved by the orchestrator from the agent's reply, because its file write was refused.
Inputs: x01-x13, g1, h04, h05 on fresh persona captures (2026-10-27, 23/24 personas passed).
Format: rank · severity · what · file:line · fix · effort · tag

## 1. CONFIRMED, ranked by user harm
1 · SAFETY · **Pull-up "Pain or tweak" chip only saves a note.** Stop is offered only when slug==handstand-walk ·
  `NoteSheet.tsx:53`, `DaySession.tsx:449`, `OffPlanSession.tsx:373` · offer Stop for every pain-gated/skill program ·
  S · [HACKATHON]
2 · SAFETY · **"Stop here" calls the same handler as "Finish here".** It closes the sheet and returns to the brief;
  the "Continue" CTA stays, so nothing ends the session · `OverflowSheet.tsx:123,215`; `SetView.tsx:886` ·
  a real ended state; relabel · M · [HACKATHON]
3 · DEAD END · **No session completion or stopped state.** Stop and Finish just call setMode("brief"); only
  FollowAlong says "Session done" · `DaySession.tsx:433,455`; `BriefView.tsx:149` · add a done summary; the CTA
  becomes "Session complete" · M · [HACKATHON]
4 · SAFETY · **"Something hurt" is the 4th of 9 overflow rows,** and it's the only mid-session pain input for
  pull-up · `OverflowSheet.tsx:132-153` · a pinned top-row button · S · [HACKATHON]
5 · SAFETY · **/check/hip has no program guard.** Non-hip users get groin, SLR and hanging-leg-raise tests
  (documented provocateurs) · `app/check/hip/page.tsx:20` · redirect unless anterior-hip-rebuild · S · [HACKATHON]
6 · SAFETY · **AssessmentDueBanner is ungated by program** ("First hip check" shown to a pull-up user). The chip at
  `:69` is gated · `SignalsStrip.tsx:425`, `AssessmentDueBanner.tsx:12-22` · gate on the slug · S · [HACKATHON]
7 · DATA WRONG · **A hold set logged with seconds=0 still counts** ("Log it now" without holding). It is not a
  reload bug · `SetView.tsx:331` · require held>0 or a confirm · S · [HACKATHON]
8 · TRUST · **Green "Workout ready" pill above "Rest day".** HeroStateCard has no notion of a scheduled session ·
  `HeroStateCard.tsx:49,104`; `TodaySession.tsx:320` · hide or relabel on rest days · S · [HACKATHON]
9 · LEAK · **The report shows a "Rehab days" stat and an "orthopaedist and physiatrist" footer** for every program ·
  `app/report/page.tsx:275,810-811` · gate on the slug; a generic footer · S · [HACKATHON]
10 · CONFUSING · **The header's "WEEK n OF 4" disagrees with the body's "Program week 7"** · `TodaySession.tsx:418-427`
  · one week number · S · [HACKATHON]
11 · CONFUSING · **Plan move/skip:** one day shows both "1 logged" and "Skipped · moved to…"; the skip toast counts
  internal blocks · `plan/page.tsx:867-875`, `useStore.ts:1427` · count visible sessions; one status per day · M ·
  [HACKATHON]
12 · CONFUSING · **About 6 names for off-plan logging;** the flag-off stub is a dead end · `BriefView.tsx:491`,
  `RunSlotCard.tsx:85`, `OffPlanSession.tsx:250` · one noun ("Extra session"); a link in the stub · M · [HACKATHON]
13 · CONFUSING · **After "Finish here" the CTA still reads "Continue — Ring row, set 3"** · `OverflowSheet.tsx:131,215`;
  `BriefView.tsx:149` · resolved with #3 · S · [HACKATHON]
14 · DEAD END · **reset-password with no token says "Waiting for the reset link…" forever** ·
  `reset-password/page.tsx:21-35,68` · a ~5 s timeout, then "link expired, request new" · S · [BEFORE-SCALE]
15 · EXPOSURE · **/dev/primitives and /admin/keywords are reachable by any signed-in user** ·
  `app/dev/primitives/page.tsx:32`, `lib/route-access.ts` · gate on NODE_ENV, or drop from the export · S · [HACKATHON]
16 · DATA WRONG? · **The Record tile and the timeline disagree on current vs baseline** ·
  `CutCLatestRetestTile.tsx:60-100` vs `CutCRetestTimeline.tsx:209-212` · one shared selector · M · [BEFORE-SCALE]
  (engine-builder only; the root cause wasn't traced)
17 · MINOR · **muscle-up: excluded items are substituted correctly,** but the block title "Ring dip ladder" and the
  prose "→ full dip" still render · `muscle-up.json:656+` · a neutral title when excluded · S · [BEFORE-SCALE]
18 · CONFUSING · **Research jargon on the first screen** ("Shea & Morgan 1979", "order shuffled by the seed",
  Tier B) · `TodaySession.tsx:427` · move behind "Why?" · S · [HACKATHON per design brief]

## 2. ARTIFACT / UNCLEAR
- **~~ARTIFACT~~ → CONFIRMED by the owner on device (2026-10-27):** the sticky bars do cover content: the
  morning-check/suggestion sticky bar and the floating feedback button. The QA agent had called it a capture
  artifact (ProposalStack reserves padding at `ProposalStack.tsx:107-113`), but the owner sees the overlap on a real
  phone. Fix per `findings-design.md` §3: suggestions inline, nothing sticky except the nav, feedback moved into You.
  → Register A-UX-01.
- **ARTIFACT:** the Extras captures are stale; the route now redirects to /off-plan.
- **ARTIFACT:** "false 0s on cold reload" is really #7.
- **UNCLEAR:** the rail showing other exercises after "Jump to"; the rest timer restarting after a reload.
- **UNCLEAR:** a "no groin pain" note on the pull-up persona. It is not in src, so probably fixture or seed data;
  scrub the fixtures.
- **UNCLEAR:** Copenhagen plank in the shared off-plan list. Route it to programme-integrity.

## 3. Coverage gaps (no capture showed these)
- A true stranger's first run (signed-out → sign-up → intake → day 1).
- Red-day screens, the escalate path, and the concurrent-strength-maintenance red/amber state.
- A real-viewport check at 393 and 375×667; tap sizes were judged by eye.
- The session-hold and session-rest-jump flow folders are empty.
- reset-password with a real token, delete-account, offline/sync failure, and whether the Supabase writes landed.
