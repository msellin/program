# R4 — SaaS docs vs code (2026-10-27)
Tags: DONE / PARTIAL / OPEN / SUPERSEDED / STALE-drop. Ads run now on free beta; Stripe billing + free/Pro later.

## 1. Planned items (doc:line → status [tag])
- DONE: Supabase auth, consent, legal pages (tasks.md:20-34); 9-program catalog, intake, Today (tasks.md:46-56); catalog sort (programs/page.tsx:64); switch confirm (ProgramPreviewClient.tsx:56); retest extend/graduate (profile/page.tsx:172); /feedback; Sentry; sitemap/robots (landing/src/app); founder contact (BetaCTA.tsx:29); JSON export (record/page.tsx:138).
- DONE-in-code: delete account (tasks.md:35 → functions/api/delete-account.ts, lib/account/actions.ts:49). KV-cascade wording STALE (no KV; user_states FK cascade).
- PARTIAL: 1-program free cap (plan.md:102, tasks.md:90) = useStore.ts:1064 MULTI_MAIN_ENABLED=false; account `tier` inert (data-integrity.test.ts:1839).
- OPEN [BLOCKS-ADS-TODAY]: lawyer review (tasks.md:39; privacy/page.tsx:12); citation corrections (traffic-tasks.md:7; traffic-plan.md:49); analytics/conversion (tasks.md:130, FLAG-5). No analytics in code, so ads cannot be measured.
- OPEN [BEFORE-SCALE, verify]: medical disclaimer on every app page (plan.md:176); not found in AppShell/layout.
- OPEN [BEFORE-SCALE]: Phase 3 billing (tasks.md:102-118), trial (plan.md:115), billing emails (tasks.md:111-116). No Stripe or Paddle in code.
- OPEN [BEFORE-SCALE]: free 30-day history and paid PDF gate (plan.md:103-111). No gate; PDF is print-to-PDF (report/page.tsx:184).
- SUPERSEDED: Paddle fields and rationale (plan.md:93-96, 135-140) → Stripe.
- STALE-drop: Clerk (plan.md:119-127, 191-193; tasks.md:131); beta invite allowlist (tasks.md:131, 245; plan.md:281). Open beta, no invite gate.
- OPEN [LATER]: deadlift base (tasks.md:81); L/R hip asymmetry (tasks.md:83); shoulder, low-back, aerobic packs (tasks.md:94-96); onboarding polish and first-run tutorial (tasks.md:125-126; FirstRunBanner exists, PARTIAL); retest reminder (tasks.md:117).
- SUPERSEDED [LATER]: zone-2 program (tasks.md:82) → Engine Builder.
- PARTIAL [LATER]: AI narrative. WeeklyNarrativeTile is deterministic; worker/src/index.ts is a coach proxy, not wired to it. architecture-v2 commit 1 drills.json not started (architecture-v2.md:9).

## 2. Docs needing a banner or rewrite
- plan.md: rewrite §4 tiers/paddle fields, §5 billing/analytics/auth, §6 invite; add banner (none today).
- tasks.md: stale percentages (:5-8); Phase 3 Paddle (:102) → Stripe; Clerk/invite lines (:131, 245).
- context.md: banner exists (:1-22); add a Stripe row. No rewrite.
- traffic-plan.md: sequencing (:49-52) assumes no promotion; rewrite for ads running now. traffic-tasks.md: add ads-gating note to :7.
- README.md: rewrite. Describes the retired single-file tracker (index.html, validate.py, localStorage).
- NEXT.md: rewrite. Items 7 (sync backend) and 8 (domain) are DONE (Supabase, terav.fit).
- architecture-v2.md: add status banner (commit 1 not started, commit 2 partial).
- future-features.md, how-to-use-terav.md, whitepapers/00_master.md (:215-220): no banner; add PRO? tags and a free-tier line when billing ships.

## 3. Future features, PRO? tag
- PRO? yes: video form analysis (future-features.md:17); FIT ingestion (:109); wearable ingest (tasks.md:149); injury-profile extras (:91); multi-program stacking (:78); coach view (:151); gym owner dashboard (tasks.md:154); human coach (tasks.md:146); AI narrative (tasks.md:140).
- PRO? no: v2 multi-dimensional engine (:42); referral credits (tasks.md:153); community (:150); ET/FI language (:153); native shells (:154); digest and push (tasks.md:156-157).

Not checked: whitepaper Parts 1-2 and 4; landing copy beyond cited lines; Supabase signup config (open signup assumed); Resend template content; Sentry DSN; saas-launch/sql; ops items tasks.md:134-136.
