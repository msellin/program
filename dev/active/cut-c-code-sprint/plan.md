---
name: Cut C code sprint · Record surface implementation
started: 2026-08-21
week: 1-2 of the locked 4-week sequence
status: IN PROGRESS
---

# Cut C code sprint · plan

## Approved scope (from `dev/active/decisions-2026-08-21-locked.md`)

Ship the Record surface as coded routes + components. Replaces `/progress` + `/history` with a single `/record` route. 5 tabs → 4 tabs.

**What ships in Weeks 1-2:**

1. **New `/record` route** — canonical Record surface with three stacked sections (Now / Trend / Log)
2. **New components** (with `CutC-` prefix per DESIGN-cut-c.md convention until stable):
   - `CutCProgramCurveCard` — rolling-avg line chart, uses Recharts, slate curve, tri-color retest event pins overlay
   - `CutCWindowTierControl` — segmented 4-tier control (30d / 90d / 1y / All) with data-adaptive default
   - `CutCRetestTimeline` — horizontal event strip with date labels every 3rd pin + milestone size-modulation
   - `CutCLatestRetestTile` — Now-section anchor with 4px left rail, since-baseline line, inline citation
   - `CutCActivityHeatmap` — auto-switches between 12-week matrix mode (<120 days) and year-column mode (over 120 days)
   - `CutCRecordOnboardingBeacon` (C5) — one-time InfoSheet on first `/record` visit, "Every change here cites a source"
3. **Redirect `/progress` → `/record`** and delete the old `/progress/page.tsx`
4. **Nav update** — bottom nav goes 5 tabs → 4 tabs (Today · Week · Record · Programs)
5. **JSON export endpoint** — one-click "EXPORT" from Record header downloads full log + accepted proposals + citations + retest events + program state as JSON. File: `terav-{userId}-{timestamp}.json`
6. **Data-viz palette tokens** — add `--dv-*` to `globals.css` (currently only in mockup HTML)
7. **Synthetic 400-day persona** — extend `tests/e2e/harness/personas.ts` with `persona-strength-long` (~400 days simulated) so the harness can verify Record at scale
8. **Persona harness re-run** — all 14 personas green, no React errors, no pageerrors

## Non-goals (do NOT scope creep)

- Program transitions on curve (C3 · deferred to Cut A)
- Deload period shading (C4 · deferred to Cut A)
- Today / Week / Extras refactor (D1-D5 · Week 4 after hallway test)
- Landing/app string drift fixes (FLAG-2 · Week 4)
- Beta feedback channel (FLAG-1 · Week 4)
- Analytics falsification event (FLAG-5 · Week 4)
- Any new visual system tokens beyond `--dv-*`

## Component naming discipline

Every new component uses the `CutC-` prefix in code (per DESIGN-cut-c.md). This is INTENTIONAL friction — it makes it obvious in diffs which components are under-review vs stable. After Cut C ships + stabilizes (post-Week-3 prod verify), a rename batch drops the prefix.

## Existing components to preserve unchanged

- `WeeklyHeatmap` (used for Now-section 12-week readiness heatmap)
- `WeeklyNarrativeTile` (used for Now-section "Week N — Cycle N" card)
- `HipProgressTile` (used inside Trend-section Rehab subsection — conditional render, personal-program only)
- `SymptomLoadChart` (Rehab subsection)
- `InfoSheet` (used by C5 onboarding beacon + retest event citation sheets)
- `StatusPill`, `ArcProgressBar`, `DashboardBlock` (v1.1.1 primitives)

## Deleted components / routes

- `/progress/page.tsx` and `/progress/error.tsx` → delete after redirect lands (keep redirect stub for external bookmarks)
- `RetestMetricsPanel.tsx` → retired; retest concept moves to `CutCRetestTimeline` + `CutCLatestRetestTile`
- Milestone table in `progress/page.tsx` (`.milestones`) → retired; rolling-avg curve replaces it

## Verification target (before Week 2 → Week 3 handoff)

- Persona harness 14/14 clean on new Record surface (0 React errors, 0 pageerrors)
- Synthetic day-400 persona renders Record with year-column ActivityHeatmap + full RetestTimeline + `+X since Q1'24` since-baseline
- JSON export downloads a valid file with citation payload
- `/progress` redirects to `/record` (not 404)
- BottomNav shows 4 tabs, Record active
- No visible regression on Today, Week, Programs, Session

## Risks

- **Recharts integration for retest event pins overlay** — Recharts' `<ReferenceDot>` might not accept our tri-color scheme cleanly; may need custom `<Scatter>` layer
- **Static export + client-side JSON blob download** — verify blob URL + `<a download>` works on Cloudflare Pages (should — pure client)
- **Migration: users who bookmarked `/progress`** — redirect stub required, not just deletion

## References

- Design brief: `dev/active/redesign-progress/brief.md`
- Design MD: `dev/active/redesign-progress/DESIGN-cut-c.md`
- v3 mockup (canonical): `dev/active/redesign-progress/record-mockup-day400-v3.png` + `.html`
- Day-90 engine mockup: `dev/active/redesign-progress/record-mockup-day90-engine.png`
- Day-90 rehab mockup: `dev/active/redesign-progress/record-mockup-day90-recover.png`
- Locked decisions: `dev/active/decisions-2026-08-21-locked.md`
- Competitive matrix: `dev/audits/competitive/2026-08-21-fitness-app-matrix.md`
