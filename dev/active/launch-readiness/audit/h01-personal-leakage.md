# H01 personal-track leakage to new users (static read, 2026-10-27, no runtime run)

[BLOCKS-ADS-TODAY] next-app/src/components/workout/SignalsStrip.tsx:425 - AssessmentDueBanner rendered ungated on Today for every program; isDue() (lib/engine/assessment-engine.ts:27-34) returns due:true when no entry exists, so a new user sees "First hip check" pointing at /check/hip (AssessmentDueBanner.tsx:41; pack = assessments-data.ts:56 HIP_FLEXOR_PACK). Gate: none. Fix: render only when program.slug === "anterior-hip-rebuild", as the chip at SignalsStrip.tsx:69 already does.
[BLOCKS-ADS-TODAY] next-app/public/data/clinical-context.json and next-app/public/data/programs/anterior-hip-rebuild.json - static files served to anyone at /data/*. clinical-context holds findings, exam, history (2020-12 to 2023-11); the hip program carries exercise_overrides_note naming the documented deficits (anterior-hip-rebuild.json:293). Gate: none (no auth on static files). Fix: remove from public/ or move behind auth before traffic.
[BLOCKS-ADS-TODAY] landing/src/components/mockups/TodayMockup.tsx:21 - marketing mock shows "Left hip stiffness noted 2x / load x0.90" to every visitor; landing/src/i18n/dictionaries/en.ts:93-95 founder story names the hip. Gate: none. Owner decision on whether this reads as personal before paid traffic lands.
[BEFORE-SCALE] next-app/src/app/programs/[slug]/page.tsx:9-17 - generateStaticParams prerenders every manifest slug incl. personal, and dynamicParams=false (line 24), so /programs/anterior-hip-rebuild/ and its /intake are reachable by URL. Gate: only a tick-box modal before "Make this my focus" (ProgramPreviewClient.tsx:167, 597); the page body renders ungated. Fix: drop personal slugs from generateStaticParams.
[BEFORE-SCALE] next-app/src/app/check/page.tsx:169-172 - no active program => regionsForProgram(null) => LEGACY_REGIONS (lib/symptom-regions.ts:83-98: groin_left, low_back, buttock_left, shoulder_right). Gate: none on this path. Reachable from /check links (SignalsStrip.tsx:331, FollowAlong.tsx:337). Fix: no-program state should show NoActiveProgram, not hip regions.
[BEFORE-SCALE] next-app/src/lib/data-loader.ts:11,40 - DEFAULT_PROGRAM_SLUG = anterior-hip-rebuild is the silent fallback when loadProgram() gets no slug. Callers checked (StoreHydrator, OnboardingRunner, OverflowSheet, record/page.tsx:99, report/page.tsx:78, OffPlanSession.tsx:49) all guard the slug first, so no live path found. Fix: remove the fallback so it throws.
[LATER] next-app/src/app/guide/page.tsx:155 - guide copy names "the anterior-hip case study" to all users. Copy-only.
[LATER] next-app/src/lib/assessments-data.ts:81 - hip pinch wording ("anterior-hip pinch") ships in the pack; only visible once #1 is fixed.

Verified gated (no leak found):
- next-app/src/app/programs/page.tsx:100-110, 159 - public catalog filters personal, DRAFT, PROVISIONAL.
- landing/src/lib/programs-catalog.ts:403 and landing/src/app/sitemap.ts - PUBLIC_PROGRAMS only; personal excluded from sitemap.
- Hip-specific UI keyed on slug: record/page.tsx:126, report/page.tsx:127, OffPlanSession.tsx:80-82, RunSlotCard.tsx:34, DaySession.tsx:227, TodaySession.tsx:506, SignalsStrip.tsx:69.
- TodaySession.tsx:131-136 - no-program user routed to NoActiveProgram, no hip default stamped.

Not checked: runtime/browser behaviour (nothing built or run); next-app/src/app/check/hip/page.tsx and layout.tsx gating; whether live terav.fit serves /data/* (static read only); home page and onboarding wizard defaults; landing built out/ sitemap; SignalsStrip render conditions above line 412.
