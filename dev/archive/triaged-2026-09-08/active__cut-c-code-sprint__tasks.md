---
name: Cut C code sprint · tasks
---

# Cut C code sprint · tasks

## Phase 1 · Foundations (day 1)

- [ ] Add `--dv-*` data-viz tokens to `globals.css` (curve-primary, retest-hit/hold/back, bar-low/mid/high)
- [ ] Extend Tailwind config if any custom class shortcuts needed (`dv-curve`, `dv-bar-*`)
- [ ] Verify Recharts is already lazy-loaded in the bundle; confirm chunk cost
- [ ] Create `next-app/src/app/record/` directory + `page.tsx` scaffold (client component, similar to `/progress`)
- [ ] Create `next-app/src/components/record/` directory for new components
- [ ] Add redirect stub at `/progress/page.tsx` → `router.replace('/record')` on mount (preserves external bookmarks)

## Phase 2 · Primitives (days 2-3)

- [ ] `CutCWindowTierControl` — segmented 4-tier control [30d 90d 1y All] + data-adaptive default + persist selection per-user via Zustand
- [ ] `CutCLatestRetestTile` — 4px left rail, metric value + delta + since-baseline line + inline citation with `→` chevron + tap-to-open InfoSheet
- [ ] `CutCRetestTimeline` — horizontal scroll strip, tri-color pins by outcome, date labels every 3rd pin, milestone size-modulation, `role="group"` + full aria-label
- [ ] `CutCProgramCurveCard` — Recharts wrapper: `LineChart` with slate curve + `ReferenceDot`/`Scatter` for tri-color retest event pins + reduced gridlines (3 not 5) + delta callout row + `[Show raw]` toggle
- [ ] `CutCActivityHeatmap` — auto-switching primitive: `<120 days` renders WeeklyHeatmap (existing) with 12-week matrix; `≥120 days` renders monthly-total mini-bars with 3-tone density ramp

## Phase 3 · Compose Record surface (day 4)

- [ ] `record/page.tsx` composition — H1 "Record" + Export button + 3 sections (Now / Trend / Log)
- [ ] Section anchors (mono-caps eyebrow + fading horizontal rules per DESIGN-cut-c.md)
- [ ] Now section: WeeklyHeatmap + WeeklyNarrativeTile + CutCLatestRetestTile
- [ ] Trend section: CutCWindowTierControl + CutCProgramCurveCard + CutCRetestTimeline + conditional RehabSection (HipProgressTile + SymptomLoadChart, only when user has a rehab track — firewalled from Trend curve aggregation)
- [ ] Log section: CutCActivityHeatmap + log-summary line + LogList accordion (existing pattern, 30-per-page pagination)
- [ ] Wire Zustand selectors — data flows the SAME as current `/progress` for kept components; new components read from `store.retest_readings` + `store.logs` + program.retest_metrics

## Phase 4 · Export + onboarding (day 5)

- [ ] JSON export button in header — client-side blob download, file: `terav-{userId}-{ISO-timestamp}.json`
- [ ] JSON schema: `{ generated_at, user_id, program_states, logs, retest_readings, accepted_proposals, citations, contraindications }` — full payload with citation attribution
- [ ] `CutCRecordOnboardingBeacon` (C5) — one-time InfoSheet on first `/record` visit, dismissable, stored in `store.ui.record_beacon_seen`. Copy: `"Every change here cites its source. Tap any retest pin to see the study or log signal that triggered it."`
- [ ] Zustand action to mark beacon seen

## Phase 5 · Nav + redirect (day 5)

- [ ] Update BottomNav — remove Progress tab, add Record tab (icon: chart line variant), preserve bronze-active pattern
- [ ] Delete `/progress/page.tsx` content + `error.tsx` — replace with redirect stub
- [ ] Ensure `/record` is reachable via direct URL and bottom-nav tap
- [ ] Wire Cut C Record as the destination of any prior `/progress` links across the codebase (grep for `href="/progress"` or `router.push("/progress")`)

## Phase 6 · Verification (day 6-7)

- [ ] Extend `tests/e2e/harness/personas.ts` with `persona-strength-long` (400+ days simulated, extends `persona-strength`)
- [ ] Update tour.ts routes: `05-progress` → `05-record`
- [ ] Run persona harness on all 14 personas + new persona-strength-long
- [ ] Assert 0 React errors, 0 pageerrors, /record renders content on all personas
- [ ] Manual QA on day-14 empty state (via a fresh persona at 14 days) — no mockup needed per C2
- [ ] Screenshot day-400 render vs `record-mockup-day400-v3.png` — visual diff eyeball

## Phase 7 · Deploy + master task list update (day 7)

- [ ] Build + `wrangler pages deploy`
- [ ] Verify app.terav.fit picked up the new chunk
- [ ] Update `dev/audits/app/2026-08-19-master-task-list.md` — record Cut C ship
- [ ] Update `MEMORY.md` if any founder-durable notes emerged
- [ ] Commit + push
- [ ] Prep for Week 3 · prod verify + D6 hallway test
