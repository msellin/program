# Older lists: reconciled status (2026-10-30)

Paths below are under `next-app/` unless prefixed. Evidence is a file:line read, or a doc record where the item is a run or decision.

| ID | Verdict | Relevance | Evidence (file:line or commit) | Note |
|---|---|---|---|---|
| OT Mine: Persona sweep #8 | DONE | LATER | OPEN-TASKS.md:8 (run record) | Run record only; no code evidence to check independently. |
| OT Mine: Off-plan strength has nowhere to go | DONE | ADS | next-app/src/app/off-plan/page.tsx; next-app/src/components/offplan/OffPlanSession.tsx; next-app/public/data/exercises.json:4820 (bench_press) | Bench press now in library; off-plan logging page exists. |
| OT Mine: External load never reaches proposal path | PARTIAL | ADS | next-app/src/lib/engine/adapt.ts:605 (comment only); next-app/src/lib/engine/external-load-headroom.test.ts; commit 22f72b5 | Headroom test exists; no runtime read of Z3 runs found in proposal path. |
| OT Mine: Video analysis, unblock it | OPEN | LATER | dev/active/video-analysis/tasks.md:93 (V0-5 still [!]); next-app/src/lib/video absent | Phone benchmark gate still blocked; no feature code, no flag. |
| OT Mine + traffic: content, structured data, Search Console | PARTIAL | LATER | landing/src/app/sitemap.ts; landing/src/app/robots.ts; dev/active/traffic/traffic-tasks.md (citation corrections open) | Sitemap and robots shipped; citation precondition still open. |
| OT Yours: Background app mid-set on Android | OWNER | ADS | none (device behaviour) | Needs real Android device proof; code cannot establish it. |
| OT Yours: Overhead-mobility Push targets | OWNER | TRUST | next-app/src/lib/engine/measurement-error.test.ts (accepted exception) | Moving a target is the owner's call. |
| OT Yours: Withdraw kilding_2012 and its claim | OPEN | TRUST | next-app/public/data/citations.json:620; next-app/src/lib/citation-labels.test.ts | Citation still present; not withdrawn. |
| OT Yours: SELF_REPORT_TO_TEST_VAR for muscle-up and overhead-mobility | PARTIAL | ADS | next-app/src/lib/engine/intake-tier.ts:358 | Map exists; the "3-5 ring dips" mapping decision not verified. |
| OT Yours: Capability slots that yield nothing (block_thoracic_prep, push) | OPEN | ADS | next-app/public/data/programs/overhead-mobility.json (block_thoracic_prep); next-app/src/lib/engine/plan-generator.test.ts | Guard test pins the gaps; no fix found. |
| OT Yours: Pull-up Tier B eccentric volume | OWNER | LATER | dev/active/OPEN-TASKS.md (narrowed; ramp unspecified by study) | Prescription call on entry ramp. |
| OT Yours: Muscle-up false grip from Tier A | OWNER | LATER | dev/active/OPEN-TASKS.md (narrowed, needs coach) | Coaching decision, not code. |
| OT Yours: Log Friday's two activities | UNKNOWN | LATER | none | Live data in Supabase; not read per brief. |
| OT Yours: starting_values_kg, wire up or delete | OPEN | ADS | next-app/src/lib/engine/adapt.ts:538 (Boolean gate; values unread) | Gate still live on unused values. |
| OT Yours: Resend key, second one live? | OWNER | TRUST | next-app/functions/api/feedback.ts; next-app/functions/api/admin/notify.ts | Only the Resend dashboard can answer; codebase uses one binding. |
| OT Yours: SR-panel §C, EVID-1, QA-1, S4, S3 billing (group) | OWNER | PAY | master list EVID-1 [~] line 109; S4 and QA-1 below | Admin and prescription decisions; S3 billing row below. |
| OT Found: muscle-up starting_capability_levels keys | OPEN | ADS | next-app/public/data/programs/muscle-up.json:498-504 | Keys still present; domain match not re-checked. |
| OT Found: CSM amber rule hardcoded slug, dead data key | PARTIAL | TRUST | next-app/src/lib/engine/plan-generator.ts:~99 (slug check); ACTION-POINTS.md SF-04 | "Resume at 3x4" promise fixed or dropped per SF-04; hardcoded slug remains. |
| OT Found: shoulder_pain_stop_rule consent never enforced | OPEN | TRUST | next-app/public/data/programs/muscle-up.json:382-384; no reader under next-app/src | Declared as required consent; no reader found. |
| OT Found: authoring_note stripped by Zod | DONE | LATER | next-app/src/lib/schemas.ts:563 | Field now declared in schema. |
| OT Found: 13 display sites convert dates through UTC | OPEN | ADS | next-app/src/lib/utc-date-keys.test.ts:20 (baseline) | Baseline still lists remaining sites; not recounted. |
| OT Found: Load softening cannot fire on 7 of 9 programmes | OPEN | ADS | next-app/src/lib/proposals/select.ts:89-98 (strength-category filter) | Filter unchanged; whether others should soften is owner's call. |
| OT Found: store.cycle wholly dead | DONE | LATER | next-app/src/lib/schemas.ts:1436-1445; master list H2 | Cycle state removed per H2. |
| OT Found: block_smolov_jr_squat scheduled by nothing | OPEN | LATER | next-app/public/data/programs/anterior-hip-rebuild.json; next-app/src/lib/data-integrity.test.ts | Personal programme; only tests reference the id. |
| OT Found: handstand-walk orphan tier keys | OPEN | LATER | next-app/src/lib/data-integrity.test.ts:467 (ORPHAN_TIER_DOMAINS) | Still baselined as orphans. |
| OT Found: phases[].retest_gate gates nothing | OPEN | LATER | next-app/src/lib/engine/phase-zero-gate.test.ts (test only) | No non-test reader of retest_gate found. |
| OT Found: Mid-session pain has no input | DONE | TRUST | OPEN-TASKS.md (RESOLVED 2026-09-11, consent resurfaced) | Detection itself is a design change, not built. |
| Batch-36: Generate MANIFEST.sha256 | OPEN | LATER | next-app/tests/e2e/artifacts/personas.baseline-pre-batch-36 (no manifest) | No manifest file present. |
| Batch-36: Point ProposalStack at ui/ProposalCard | OPEN | ADS | next-app/src/components/workout/ProposalStack.tsx:9; next-app/src/app/dev/primitives/page.tsx:27 | Stack still imports the older card; ui/ProposalCard only in dev page. |
| Batch-36: LCP and INP capture in personas.spec.ts | PARTIAL | LATER | next-app/tests/e2e/harness/vitals.ts; next-app/tests/e2e/harness/tour.ts | Vitals harness exists; personas.spec.ts wiring not confirmed. |
| Batch-36: Regenerate personas.post-batch-36 | SUPERSEDED | LATER | next-app/tests/e2e/artifacts (no post-batch-36 dir) | Directory gone; personas regenerated since. |
| Batch-36: Run blind-walk.py baseline vs post | UNKNOWN | LATER | dev/scripts/blind-walk.py (exists) | Run history not establishable from code. |
| Batch-36: FOUNDER ship gate (blind walk >= 7.0) | OWNER | LATER | dev/active/batch-36/tasks.md | Founder evaluation outstanding. |
| Post-audit P1: citation snapshot on tier/phase accepts | DONE | TRUST | next-app/src/lib/useStore.ts:1589 (promoteTier), :1639 (advancePhase) | Both snapshot evidence now. |
| Post-audit P3: undoLastProposalOutcome | DONE | ADS | next-app/src/lib/proposal-undo.test.ts:59; next-app/src/components/workout/ProposalStack.tsx:79 | Undo wired and tested. |
| Post-audit P3: undo toast role="status" | DONE | ADS | next-app/src/components/workout/ProposalStack.tsx:72 | Status region present. |
| Post-audit P4: Re-run onboarding row in Profile | OPEN | LATER | grep: no "re-run onboarding" in next-app/src | Row not present in Profile. |
| Post-audit P5: rerun the matrix | DONE | LATER | next-app/tests/e2e/simulate-matrix-v2.spec.ts; post-audit-p0s record (2026-09-14) | Record says all six cells pass; run not re-checked. |
| Post-audit P6: triage flow-grade brief | PARTIAL | LATER | dev/design-briefs/2026-08-17-flow-grade-full-journey.md; next-app/src/lib/flow-grade-fixes.test.ts | Some fixes shipped; no triage record found. |
| Post-audit FOUNDER: consent-first setDaySymptoms | OWNER | TRUST | next-app/src/components/onboarding/LifeLoadStep.tsx:27 | Still writes during onboarding; legal call. |
| Traffic: landing sitemap.ts (15 URLs) and robots.ts | DONE | LATER | landing/src/app/sitemap.ts; landing/src/app/robots.ts | Shipped. |
| Open-task-list: B4 body copy 13px to 14px | OPEN | ADS | next-app/src/components/session/SetView.tsx (text-[9px] present) | 9px survives in primary logging flow. |
| Open-task-list: C15 safety copy >= 14px | UNKNOWN | TRUST | WeekRecoveryCard.tsx not found under next-app/src | File not found; likely renamed or removed; not traced. |
| Open-task-list: C17 border-l-slate on non-interactive borders | DONE | LATER | grep: no border-l-slate under next-app/src | Class gone. |
| Open-task-list: FOUNDER D9 content-visibility on Week rows | OWNER | LATER | next-app/src/app/globals.css:227-232 | Conditional on a CLS measurement nobody took. |
| Open-task-list: FOUNDER D12 mono-caps to sentence case | SUPERSEDED | LATER | master list R4 (rejected) | Rejected; mono-caps is the brand. |
| Open-task-list: FOUNDER E5 retest-week polish | OWNER | LATER | next-app/src/app/profile/page.tsx:168-240 | Surfaces ship; no acceptance criterion defined. |
| Open-task-list: FOUNDER F2 close concurrent-tracks audit | OWNER | LATER | dev/active/concurrent-tracks-audit | Founder close-out. |
| Open-task-list: FOUNDER F3 SaaS Phase 3 billing | OPEN | PAY | no Stripe or Paddle code in next-app/src, next-app/functions; ACTION-POINTS.md:127-131 | Billing not built; see B-01 to B-05. |
| Open-task-list: FOUNDER F4 F5 correlation trigger | OWNER | LATER | master list S4 | Needs N users x 90 days threshold decision. |
| Master: CONTENT-1 engine-builder Block 3 and rowing defects | PARTIAL | TRUST | next-app/public/data/programs/engine-builder.json:5,12 (Block 3 NOT SHIPPED note); rowing-2k-test-prep.json:481 (test-day plan) | Block 3 now disclosed; other defects not rechecked. |
| Master: S3 SaaS Phase 3 billing (Paddle/Stripe) | OPEN | PAY | no billing code; ACTION-POINTS.md:124-131 (B-01 to B-05 open) | Owner chose Stripe; nothing built. |
| Master: S4 F5 correlation view threshold | OWNER | LATER | master list S4 | Decision: trigger or defer. |
| Master: QA-1 shipping-log drift protocol | UNKNOWN | LATER | no protocol file located | Not searched exhaustively. |
| Master: H1 simulator never seeds baselines | UNKNOWN | LATER | next-app/tests/e2e/harness/simulator-v2.ts (16 capabilitySeed refs) | Per-persona seeding not counted. |
| Master: P2-32 icon-stroke discipline | DONE | LATER | master list line 207 (closed 2026-09-02) | Closed; OPEN-TASKS line still says open. |
| Master: H2 delete store.cycle.phase_id | DONE | LATER | next-app/src/lib/schemas.ts:1436-1445 | Removed. |
| SaaS T0: Confirm free tier = 1 program | OWNER | PAY | next-app/src/app/programs/[slug]/ProgramPreviewClient.tsx:32 ("free beta, everyone starts everything") | Tier rule still undecided; see free-tier-design.md. |
| SaaS T0: Confirm beta invite mechanism (Clerk allowlist) | SUPERSEDED | ADS | @clerk absent from next-app/package.json; sign-up at next-app/src/app/(auth)/sign-up/page.tsx | Replaced by Supabase auth; BETA-2 in master list. |
| SaaS T0: Confirm migration approach for existing data | SUPERSEDED | LATER | saas-launch tasks.md Clerk migration lines (STALE) | Clerk-era plan; state now in Supabase user_states. |
| SaaS T0: Budget legal review; lawyer review of TOS and privacy | OWNER | TRUST | next-app/src/app/legal/terms/page.tsx:12; next-app/src/app/legal/privacy/page.tsx:12 | Pages say "lawyer-reviewed before public launch"; budget and review not evidenced. |
| SaaS T0: "Delete my account" cascade | DONE | TRUST | next-app/functions/api/delete-account.ts:67-93 (auth delete, FK cascade); next-app/src/app/account/page.tsx:230 | Auth delete plus FK cascade in Supabase. |
| SaaS T0: Clerk items (Clerk account, ClerkProvider, Clerk migration script) | SUPERSEDED | LATER | saas-launch tasks.md (marked STALE); next-app/src/lib/shipped-claims.test.ts:22 | Replaced by Supabase auth (AuthGate, @supabase/ssr). |
| SaaS T0: Supabase auth, state API, sign-in, sign-up, consent, legal pages, isolation tests, Phase 0 deploy (group) | DONE | TRUST | next-app/src/app/(auth)/sign-up/page.tsx; next-app/src/app/legal/*; next-app/functions/api/state.ts | Shipped; live at app.terav.fit per tasks.md. |
| SaaS T1: catalog, intake, Start program, Today week, no-program state (group) | DONE | ADS | next-app/src/app/programs/page.tsx; next-app/src/app/programs/[slug]/intake/IntakeClient.tsx | Shipped. |
| SaaS T1: onboarding 3-question flow; onboarding respects consent | UNKNOWN | ADS | IntakeClient.tsx exists; 3-question flow not traced | Not traced to completion. |
| SaaS T2: Deadlift base builder; Zone-2 base; L/R hip asymmetry; programs 2-6 design | SUPERSEDED | LATER | next-app/public/data/programs/manifest.json (9 shipped); Engine Builder subsumes Zone-2 | Not in catalog; Engine Builder replaces Zone-2. |
| SaaS T2: Sort by difficulty / duration | DONE | ADS | next-app/src/app/programs/page.tsx:39-42 (duration_asc, difficulty_asc) | Sort options shipped. |
| SaaS T2: Switch program flow with warning | OPEN | LATER | no warning string in next-app/src/app/profile/page.tsx | Multi-program switch has no warning. |
| SaaS T2: Free-tier 1-program gate | SUPERSEDED | PAY | free-tier-design.md (launch-readiness); ACTION-POINTS B-03 | Replaced by 14-day Pro reverse trial design; still unbuilt. |
| SaaS T2: Shoulder overhead, low back, aerobic packs (deferred) | SUPERSEDED | LATER | saas-launch tasks.md (deferred to v2) | Deferred; not on path. |
| SaaS T3: Paddle account, checkout, webhook, tier, feature gates, trial, upgrade CTA, cancel (14 rows) | SUPERSEDED | PAY | ACTION-POINTS.md:124-131 (Stripe, B-01 to B-05, open); no Paddle code | Paddle replaced by Stripe; the work is open under B-02 and B-03. |
| SaaS T3: Resend email templates (welcome, trial, receipts, retest reminder) | OPEN | PAY | next-app/src/lib/notify.ts (no welcome or trial templates); functions/api/feedback.ts; functions/api/admin/notify.ts | Only feedback and admin notify send mail. |
| SaaS T3: End-to-end signup, trial, charge, cancel, downgrade test | OPEN | PAY | no billing code | Blocked on Stripe build. |
| SaaS T4: In-app feedback form | DONE | ADS | next-app/src/app/feedback/page.tsx; next-app/functions/api/feedback.ts | Shipped. |
| SaaS T4: First-run tutorial overlay on Today | OPEN | ADS | no tutorial component under next-app/src/components | Not built. |
| SaaS T4: Retest week UX and post-retest actions (extend, graduate) | DONE | LATER | next-app/src/app/profile/page.tsx:168-240 | Graduated and extended states rendered. |
| SaaS T4: Sentry SDK | DONE | TRUST | next-app/package.json:16; next-app/sentry.client.config.ts; next-app/src/app/global-error.tsx:33 | Shipped. |
| SaaS T4: PostHog with EU cloud, consent-gated | OPEN | ADS | no posthog reference in next-app or landing | Not integrated. |
| SaaS T4: How-to-use one-pager handout | UNKNOWN | ADS | next-app/src/lib/how-to-doc.test.ts (test exists) | Handout not located. |
| SaaS T4: Buy domain, point Pages at it | DONE | ADS | saas-launch tasks.md:12 (purchased 2026-08-17); landing/src/app/ | Live at terav.fit. |
| SaaS T4: Announcement post; first 3 beta users; first-week check-in | OWNER | ADS | none (outreach) | Founder action. |
| SaaS Deferred and nice-to-have (about 15 rows) | OPEN | LATER | saas-launch tasks.md lines 140-157 | Deferred post-beta; not on path. |
| SaaS plan.md: program switching flow, Clerk items, program design 2-6 | SUPERSEDED | LATER | saas-launch plan.md (Clerk-era) | Replaced by launch-readiness and manifest.json. |
| redesign-p0: session brief prose cards and sticky footer (M-008) | OPEN | ADS | next-app/src/components/session/BriefView.tsx:452 ("How to run this" still rendered); design-review-2026-10-28/MASTER-LIST.md:70 | Prose cards still present. |
| redesign-p0 / p1: re-shoot from live, rescore | PARTIAL | LATER | commits d92e032, 4c05d7b (rescores P2, P3); c5d3571 (live re-shoot) | P2 and P3 rescored; P0 and P1 re-shoot not evidenced. |
| redesign-p2: wire session duration, verify | DONE | ADS | next-app/src/lib/session-duration.ts; commit f0f094f | Duration rule shipped. |
| redesign-p2: follow-along log bug (updateSet never called) | DONE | ADS | next-app/src/components/follow-along/FollowAlong.tsx:138-146 | updateSet now called. |
| redesign-p2 / p3: rescore after P2 and P3 | DONE | LATER | commits d92e032, 4c05d7b | Rescores recorded. |
| launch-readiness: Hackathon on the new account | OPEN | PAY | dev/active/launch-readiness/tasks.md (marked next) | No completion record. |
| launch-readiness: Build sprint B1-B11 | PARTIAL | ADS | dev/active/launch-readiness/ACTION-POINTS.md (P-01, P-02, SF-04, SF-05 marked done) | Several items shipped; others open in ACTION-POINTS. |
| launch-readiness: Phase 0 capture and Phase 1 audit, Phase 2 plan (superseded block) | SUPERSEDED | LATER | dev/active/launch-readiness/ACTION-POINTS.md; launch-plan.md | Replaced by ACTION-POINTS.md and launch-plan.md. |
| video-analysis: V1-V6 phases (about 42 open, 2 blocked) | OPEN | LATER | dev/active/video-analysis/tasks.md; next-app/src/lib/video absent | Not built; V0-5 phone gate blocked. |
| video-analysis: V-ADJ-1 RPE picker floor | DONE | ADS | commit 92e149b (per tasks.md) | Reps-in-reserve picker shipped. |
