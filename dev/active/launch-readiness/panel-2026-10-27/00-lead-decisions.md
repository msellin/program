# Launch panel 2026-10-27: lead decisions

Source reports 01 visual, 02 mobile, 03 copy, 04 a11y, 05 pull-up beginner, 06 CrossFit athlete, 07 strength/cardio parent.
Excluded: V-01..V-10 (fixed earlier). Wordmark double-mark = "brand session" (not assigned here).
Test-data note: 100+ rep baselines, 130->269 bpm HR, squat TMs on pull-up personas are simulator seeds. The UI defects they expose are listed; seed values are not.
Hard rules honoured: `lib/symptom-state.ts` untouched; no clinical wording for non-hip users; no medical advice; confirm-first; "ingest box WODs" = LATER.

Counts: BLOCKER 9, TONIGHT 20, LATER 14.

## Safety (first)

**P-01 BLOCKER, red day still offers a session.** Fix: when state is red, Today shows one card: "Rest today. Your {region} is {n}/10, so hard training waits. If it isn't settling, see a physio or doctor." with a single link "Log how it feels". Remove "Escalate ->" and hide "Open session" and the per-program session CTA while red. Display only; the gate is not changed. Sources 03#1, 07#2, 02. Files: `components/workout/HeroStateCard.tsx` (L77, L139), `components/workout/SignalsStrip.tsx`, `components/session/TodaySession.tsx` (L618). Effort M.

**P-02 BLOCKER, "log it anyway" on a severe day.** Fix: on red, the rest-day card drops "If you trained anyway... it still counts" and the "Log extra session" tile entirely (red = physio/doctor line only). On amber/green keep the copy but reword to "Rest day. Next session: {day}, {title}. Trained anyway? Log it." Sources 07#2, 06, 03#11. Files: `components/session/shared/StatusCards.tsx` (L121), `components/workout/RunSlotCard.tsx` (L85). Effort S.

**P-03 BLOCKER, life-load / "Apply 5% lighter" card against a severe flag.** Fix: suppress every load-adjust proposal (the life-load and fatigue proposal cards) while any region is red or amber-severe; the proposal list renders nothing for them. Do not change the engine; filter at render and mark as hidden. Sources 07#2, 03#6. Files: `components/workout/ProposalStack.tsx`, `components/workout/ProposalCard.tsx`, `components/workout/SuggestionBox.tsx`. Effort S.

**P-04 BLOCKER, stopped-after-hurt is a dead end and shows data-loss chips.** Fix: Stopped screen = "Session stopped. {n} sets logged. Stopping early is fine." + [Log what hurt] + [Back to Today]. Remove L/R/Both chips and "N skipped - not logged" from Stopped AND Done; on Done show "{n} sets logged" only, plus "Next block" if one exists. Sources 02#4, 03#10, 06, 07#2, 05. Files: `components/follow-along/FollowAlong.tsx` (L333 area), `components/session/SessionDone.tsx`, `components/session/HurtSheet.tsx`. Effort M.

## BLOCKER

**P-05 Record void + contradictions.** Fix: Retest card and chart read one source (the baseline entry); where fewer than 2 readings, hide the card and the "since baseline" delta rather than show 0 / 0.0. Readiness chart: render empty-state text "Check in a few mornings to see this" instead of a zero-height SVG; drop the duplicate legend. Sources 01#1,#2, 03#4, 05, 07. Files: `components/record/CutCLatestRetestTile.tsx`, `CutCProgramCurveCard.tsx`, `CutCRetestTimeline.tsx`, `app/record/page.tsx`, `components/charts/SymptomLoadChart.tsx`. Effort M.

**P-06 One progress/end-date source (Week 3 of 4 vs Weeks 5-8 vs 1/8).** Fix: Today, Plan, first-run and Programs all derive from the same `{weekN, totalWeeks, endsOn}` selector; the engine "tier" is never shown as the user's program tier. Sources 03#3, 05. Files: `components/ui/ArcProgressBar.tsx`, `components/workout/YourPlanCard.tsx`, `app/plan/page.tsx`, `lib/engine/schedule.ts` (read-only check). Effort M. Lane B.

**P-07 Profile shows lifts the program doesn't use, "Tier A", "GRADUATED" mid-run.** Fix: show a working max only if the active program references that lift or the user entered it; rename section "Your working maxes"; hide tier and status chips from Profile. Sources 03#3, 05, 06. Files: `components/profile/BeliefsSection.tsx`, `app/profile/page.tsx`. Effort S.

**P-08 "Reviewed by Terav specialist audit agent" and "sim:" strings leak.** Fix: render no reviewer line unless a human reviewer is named; drop the CITED/VERIFIED legend to a "How we check programs" disclosure. Sources 03#17, 05, 06, 01#7. Files: `app/programs/[slug]/ProgramPreviewClient.tsx`, `app/programs/page.tsx`; data: `public/data/programs/*.json` `reviewed_by` only if render-side hide is not enough (then `npm run verify`). Effort S.

**P-09 Day-1 beginner is told "Tier D / grease the groove / 60-70% max".** Fix: Day 1 line is plain ("Week 1. Try one hang, 5 seconds, and log what you get"); tier and GTG jargon removed from Today and intake result. Sources 03#2, 05. Files: `components/workout/Day1EmptyState.tsx`, `components/session/FirstSessionOfferCard.tsx`, `app/programs/[slug]/intake/IntakeClient.tsx`. Effort M.

## TONIGHT

**P-10** Rest-day Today dead end: card says "Rest day. Next session: {weekday}, {title} (~{min} min)" + log link; Day shows the next-session preview. Sources 01#4, 02#10, 03#11, 07. Files `StatusCards.tsx`, `HeroStateCard.tsx`. S. (B)
**P-11** Plan card wall of prose (handstand): collapse to 2 lines + "See plan"; Start CTA first. 01#5, 06. `YourPlanCard.tsx`. S. (B)
**P-12** Citations behind "Why?": strip "Shea & Morgan 1979", "Wilson 2012", "Halson 2014", "Kellmann" from Day/check body; replace with "Drills are mixed up each session; it helps skills stick." and a Why? disclosure. 01#8, 03#5,#7, 06. `TodaySession.tsx` (L449), `components/check/*`, `app/check/page.tsx`. S. (B)
**P-13** Suggestion card: contradictory "FATIGUE OR PAIN FLAGGED / WORKOUT READY". Copy: "Lighter lifts Wednesday? You did 45 min of cardio today. Take 5% off your heaviest set. [Do it] [Not now]"; "Life load" -> "A heavy week outside training"; one Button style for both. 03#6, 01#9. `ProposalCard.tsx`, `ui/Button.tsx`. S. (B)
**P-14** /check copy rewrite (outside-training prompt, "Saved. Today's plan is adjusted.", "You're good to train as planned.", severity key once, "Also happened:"); life-load selected state visible. 03#7, 01#9. `app/check/page.tsx`, `components/check/*`. M. (B)
**P-15** /check a11y: roving radios or native radios, selected = check + weight, `scroll-padding-bottom` 140px, focus ring outline. 04#5-7. `components/check/CheckSelectorRow.tsx`, `CheckRegionRow.tsx`, `app/check/page.tsx`. M. (B)
**P-16** Plan: label today's row, fix day-name alignment, "Move" sheet clipped on right (min-w-0), Move button not looking disabled, replace "Interleaved consolidation..." text, strip "(Tier A/B)" from drill names. 02#1, 01#11, 03#13. `app/plan/page.tsx`, `components/workout/MoveSheet.tsx`. M. (B)
**P-17** Guided player: move "Something hurts" and Close to the bottom cluster (>=44px); add "+1"; "Log all" and "-1" >=44px; guard "Skip set". 02#2,#3. `components/follow-along/FollowAlong.tsx`, `components/session/SetView.tsx`. M. (A)
**P-18** Brief: sticky Start CTA, collapse prose cards (citations behind Why?). 02#6, 06. `components/session/BriefView.tsx`. M. (A)
**P-19** Session text sizes: no 9/10px labels in session UI (min 12px); unfilled set chips get `border-line-strong` + label. 04#1,#2. `SetView.tsx`, `RestTakeover.tsx`, `BriefView.tsx`. M. (A)
**P-20** HurtSheet/BottomSheet a11y: title heading, focus new step title, status region mounted empty; RestTakeover announces end of rest and focuses on open. 04#3,#4. `components/session/shared/BottomSheet.tsx`, `HurtSheet.tsx`, `RestTakeover.tsx`. S. (A)
**P-21** Rest screen: RIR 3 choices "Easy / Right / Too hard" + "We'll use it next week."; "Pain or tweak" -> "Something hurt", "This hurts" -> "Something hurts"; hide "Log 30s" on holds never run. 03#9,#10, 06. `RestTakeover.tsx`, `SetView.tsx`, `NoteSheet.tsx` (L8,L53 string key: change both). S. (A)
**P-22** "No illustration yet" -> show the first cue line instead. 05, 06. `FollowAlong.tsx` (L369). S. (A)
**P-23** Feedback FAB hidden while a sheet is open; program label truncates in header. 02#5. `components/AppShell.tsx` FAB only (not the wordmark; brand session). S. (C)
**P-24** Record: drop the blocking "Every change here cites its source" sheet (show once, inline line "Tap a point to see why it moved"); remove Basis/Signal-cited chips; "+0 bpm" neutral grey; HR chart axis/validation check. 03#4, 07#3,#5. `CutCRecordOnboardingBeacon.tsx`, `CutCRetestTimeline.tsx`, `app/record/page.tsx`. S. (C)
**P-25** Intake: move screening after the ability questions; plain wording for "contraindicated", "radicular", "blood pressure"; say what "Yes" does; "Optional, skip any" once. 03#8, 05. `components/onboarding/OnboardingRunner.tsx`, `SymptomPrimerStep.tsx`, `app/programs/[slug]/intake/IntakeClient.tsx` (P-09 shares it: same lane C, one session). M. (C)
**P-26** Programs page: carousel gets visible second card/affordance, "8 wk" no wrap, COMING SOON cards visually quieter. 01#6. `app/programs/page.tsx`. S. (C)
**P-27** Naming: nav DAY/PLAN/RECORD/PROFILE vs coach-mark "Today/Plan/Record/You": choose Today/Plan/Record/Profile everywhere; "Accessory work" -> "Optional drills"; fix "+1 more" bug in eased copy. 03#12. `components/nav/BottomNav.tsx`, `app/guide/page.tsx`, `lib/engine/plan-generator.ts` string. S. (C)
**P-28** Events link 404; Extra drills page "Back to Day" dead end; Away days form clears nav. 07#3,#5. `app/profile/page.tsx`, `components/profile/AwayDays.tsx`, `app/off-plan/page.tsx` + remove events link. S. (C)
**P-29** End-of-cycle screen: lead with one primary "Keep going 4 more weeks", others behind "Other options"; "arc" -> "program". 07#4, 03#14. `components/session/CycleStartCard.tsx`. S. (B)

## LATER (not tonight)

P-30 Ingest box WOD / RPE / strength numbers (06, product). P-31 Shorter intake for trained users (06). P-32 First-run screen 70% empty (01#13). P-33 Nav active-state weight, last card clears nav (01#14). P-34 Record bottom sheet handle/close language (01#15). P-35 Red-day banner distinct from amber; life-load chip legibility (01#16). P-36 Per-day "non-negotiable" banner trim (06). P-37 Rest-screen RPE chip size/safe area; set-screen header crowding; Stop session confirm (02#7,#8). P-38 Plan skip-confirm sheet styling (02#9). P-39 Teal as second accent; control language/one Button (01#9,#10). P-40 Record log 15 identical rows, heatmap (01#12). P-41 Delete-account copy, Away days copy, "baseline" jargon (03#15,#16). P-42 amber double-use, tab aria-labels, role=alertdialog, heading hierarchy, reduced motion on countdown/sheet (04#8-13). P-43 Day-type mono eyebrows/spacing system (01#8). Brand session: double wordmark (01#3).

## Lanes (non-overlapping files)

**Lane A: session, guided player, stop/done.** P-04, P-17, P-18, P-19, P-20, P-21, P-22.
Owns: `components/follow-along/*`, `components/session/{SetView,RestTakeover,BriefView,SessionDone,HurtSheet,NoteSheet,OverflowSheet,OffPlanSheet}.tsx` (+ their tests), `components/session/shared/BottomSheet.tsx`, `components/offplan/*`, `app/session/[slug]/*`.

**Lane B: Today/Day, check, red day, suggestion cards, Plan.** P-01, P-02, P-03, P-06, P-10, P-11, P-12, P-13, P-14, P-15, P-16, P-29.
Owns: `components/workout/*` (all), `components/session/{TodaySession,DaySession,CycleStartCard,FirstSessionOfferCard}.tsx`, `components/session/shared/StatusCards.tsx`, `components/check/*`, `app/check/*`, `app/plan/*`, `app/page.tsx`, `components/ui/{ProposalCard,ArcProgressBar,Button,StickyCta}.tsx`, `components/plan/*`, `components/DashboardBlock.tsx`. P-09 Day-1 card strings in `Day1EmptyState.tsx` also go here (B), while the intake part is C.

**Lane C: Record, Profile, Programs, intake, elsewhere.** P-05, P-07, P-08, P-09 (intake half), P-23, P-24, P-25, P-26, P-27, P-28.
Owns: `components/record/*`, `components/charts/*`, `app/record/*`, `components/profile/*`, `app/profile/*`, `app/programs/*` (incl. intake), `components/onboarding/*`, `components/AppShell.tsx` (FAB only), `components/nav/BottomNav.tsx`, `app/guide/*`, `components/progress/*`, `public/data/programs/*` (only if needed; run `npm run verify`), `lib/engine/plan-generator.ts` strings.

Conflict notes: `NoteSheet.tsx` string "Pain or tweak" is read in A only (the key at L53 and chip at L8 change together). `lib/symptom-state.ts` is off-limits to every lane. Red state is read from the existing selector; lanes display only. Run `cd next-app && npm run verify` before each commit; rebase between lanes (disjoint files, so no conflicts expected).
