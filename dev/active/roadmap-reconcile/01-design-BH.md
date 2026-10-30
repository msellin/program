# 01 design-review MASTER-LIST [B]+[H] (M-001..M-035), checked against main 2026-10-30

| ID | Verdict | Relevance | Evidence (file:line or commit) | Note ≤15 words |
|---|---|---|---|---|
| M-001 | DONE | ADS | components/FirstRunBanner.tsx absent, no references; redesign-p0 L-P | Four-tabs tour card removed |
| M-002 | DONE | ADS | follow-along/FollowAlong.tsx:418-419 box only if figure/video; 461 "Find a demo" link; P0 Lane F | Box collapses; 31 poses added |
| M-003 | DONE | ADS | intake/IntakeClient.tsx:1097 hint not rendered; IntakeEntry.tsx:11-32 quick start default; QuickStart.tsx:395 | 3-screen quick start; "about 5 min" on detailed |
| M-004 | DONE | ADS | programs/[slug]/ProgramPreviewClient.tsx:16,500 StickyCta "Start free"; P0 Lane P | Sticky Start in place; "Section n of 4" not rechecked |
| M-005 | PARTIAL | ADS | P1 L3 Today hero card (commit 3416f75 P3 bigger figure); P0 catalog figures | SVG figures only; photo/AI hero is owner call |
| M-006 | OPEN | ADS | lib/proposals/useProposalActions.ts:171-185 ("Advance to ${tierLabel}", "Apply bump"); select.ts:315; ProposalCard.tsx:167 "Do it"; first-strict-pullup.json "Tier B — ..." | Em-dash labels and three verb pairs unchanged |
| M-007 | DONE | LATER | components/ui/Wordmark.tsx used by AppShell.tsx:176, sign-in, sign-up | One shared "terav." wordmark everywhere |
| M-008 | DONE | ADS | redesign-p1-tasks L1 [x]; no "guided, one at a time" string left in components/app | Exercises-first brief, slim footer |
| M-009 | DONE | ADS | session/SetView.tsx:636-643 "Set N of M" per exercise, total labelled "sets left today" | Per-exercise set count now separate |
| M-010 | DONE | ADS | session/SessionDone.tsx:98-102 "Nothing logged" state; afa3e4e all-done brief; P1 L6 | Start-hidden-after-done not re-verified |
| M-011 | OPEN | TRUST | components/offplan/OffPlanSession.tsx: no symptom/red-region filtering (grep) | Hang drills still offered on red-shoulder day |
| M-012 | PARTIAL | ADS | intake/IntakeEntry.tsx:11-32 quick start default, ?mode=full keeps full intake | Ad path cut to 3 screens; full intake still long |
| M-013 | PARTIAL | ADS | QuickStart.tsx level ladder (no Tier D); first-strict-pullup.json:496 typical_outcome "8-10 strict" still, shown at ProgramPreviewClient.tsx:470 | Outcome number still uncited; claim vs landing tension |
| M-014 | PARTIAL | ADS | IntakeClient.tsx:980,1005 header still truncate; one "Step N of M" counter at 1006-1008 | Only reached via full intake now; count mismatch unchecked |
| M-015 | OPEN | PAY | (auth)/sign-up/page.tsx:47,126 three consent ticks + Turnstile still gate | Owner/compliance decision SG-02 not taken |
| M-016 | DONE | LATER | commits 1e18ab0, c57478c, 425dd10 Record redesign (week headline, one grid, history behind tap) | Record rescored 3 to 7 |
| M-017 | OPEN | LATER | components/progress/RetestMetricsPanel.tsx:56 prints `Tier target: ${userTier}` | Raw tier id still printed |
| M-018 | OPEN | LATER | RetestMetricsPanel.tsx:252-255 shows target when != null, so 0 renders | "Target 0, stretch 1" not hidden |
| M-019 | OPEN | LATER | app/report/page.tsx:885 hardcoded "graduated" | Status line still not derived from verdict |
| M-020 | PARTIAL | ADS | programs/page.tsx:14 ProgramFigure added; :305 sort <select>, CITED pills :21-27 remain | Figures added; sort/filter/CITED not dropped |
| M-021 | OPEN | LATER | ProgramPreviewClient.tsx:413-425 Go to Today and End program same size, side by side | Confirm sheet exists; not demoted |
| M-022 | OPEN | TRUST | app/legal/privacy/page.tsx:12, terms/page.tsx:12 "lawyer-reviewed before public launch"; privacy page:26 <table> | Both defects still present |
| M-023 | PARTIAL | ADS | P1 L5/P3 L6 plain titles; still "engine reads" in OffPlanSession.tsx:104, plan/page.tsx:1015, EngineReadsNotesHint | Tier/arc softened; "engine" copy remains |
| M-024 | PARTIAL | LATER | commit 688de55 P1 mono sweep; 92 font-mono uses remain | Sentences moved to sans; some mono left |
| M-025 | OPEN | TRUST | public/data/citations.json contains "16(x)", "s4159", "verification required" | Placeholders shipped; needs evidence-verifier |
| M-026 | OPEN | TRUST | app/programs/page.tsx:183,372-373 "simulator harness", "archetypes" | Info sheet still leaks internals |
| M-027 | OPEN | LATER | plan/page.tsx:252,717 and SessionActions.tsx:35 print raw moved_to; 38 ad hoc date formats; no shared helper | Mixed date formats unchanged |
| M-028 | OPEN | LATER | session/BriefView.tsx:369 "your programme's rule"; evidence/layout.tsx:11 "programmes" | User-visible British spelling remains |
| M-029 | UNKNOWN | LATER | report/page.tsx:856 and record/CutC*.tsx:82 call same evaluateRetestMetrics | Same function; divergence could be inputs; not reproduced |
| M-030 | DONE | LATER | lib/program-progress.ts used by plan/page.tsx:284 and TodaySession.tsx:281; 2b1ff58 Plan header | One selector feeds both |
| M-031 | SUPERSEDED | LATER | 2b1ff58 Plan tab rebuilt; b6197f1 G-14 red day holds loaded session | Old Plan row replaced; adjusted-day rule not retraced |
| M-032 | PARTIAL | LATER | 7979f19, 2b1ff58, 631ce62 (one state per day, Not logged, one action per day) | Plan fixed; session-future/past pages unchecked |
| M-033 | OPEN | ADS | app/check/page.tsx:291 still "Saved. Today's plan is adjusted." | Copy unchanged; banner naming region unchecked |
| M-034 | PARTIAL | LATER | TodaySession.tsx:251,255; DaySession.tsx:243 guard isPastProgramEnd; plan/page.tsx has none | Today/session guarded; Plan not |
| M-035 | UNKNOWN | LATER | no single resolved-plan-per-date change found in log; capture-specific | Cold-load mismatch needs a live repro |

## Summary
- 35 rows: DONE 10, PARTIAL 9, OPEN 13, SUPERSEDED 1, UNKNOWN 2, OWNER 0.
- Blockers B (M-001..004) are all DONE: tour card gone, media box collapses, hints hidden/quick start default, sticky Start.
- Still hurting a stranger from an ad: M-006 proposal copy, M-033 morning-check copy, M-005 hero is SVG only, M-023 "engine" jargon.
- Trust items open: M-011 (hang drills on red day), M-022 ("lawyer-reviewed" line), M-025 (placeholder citations), M-026 (internals in info sheet).
- Pay path: M-015 sign-up consent stack still waits on an owner/compliance decision.
- Report/Record items M-017/018/019 remain plain-text defects, quick fixes, LATER.
