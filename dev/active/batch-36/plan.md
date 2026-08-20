# Batch 36 · wire-up execution plan

**Status**: in progress · 2026-08-20
**Owner**: Claude Opus 4.7 · autonomous mode approved by founder ("go A, full mode, make all decisions using agents help")
**Design contract**: `dev/audits/app/2026-08-20-terav-design-system-v1.1.md` (v1.1.1, 13.4k words, 6/6 juries clear)
**Scope**: ~140h realistic band (was 145-180h; existing primitives lowered scope). 15 discrete steps. 3 founder-visible checkpoints.

## The 15 steps

### Step 0 — Baseline snapshot (HARD PRE-GATE)
Nothing merges before this. Per v1.1.1 §9: engineering commits `tests/e2e/artifacts/personas.baseline-pre-batch-36/` + SHA manifest + randomizer script `dev/scripts/blind-walk.py` BEFORE any primitive PR.
- Files: `next-app/tests/e2e/artifacts/personas.baseline-pre-batch-36/`, `dev/scripts/blind-walk.py`
- Est: 2h

### Step 1 — Token migration in globals.css
Bump line color (a11y), add line-strong, add safe-area tokens, add ease token, add dvh utility.
- File: `next-app/src/app/globals.css:15,23-24,44+`
- Est: 1.5h

### Batch A — parallel-eligible after Step 1 lands
### Step 2 — AppShell extend
Add stickyCta slot, pullToRefresh prop, three-signal active-tab indicator on BottomNav.
- Files: `next-app/src/components/AppShell.tsx`, `next-app/src/components/nav/BottomNav.tsx`
- Est: 4h

### Step 3 — ExplainSheet contract (evolve InfoSheet)
8 sheet rules per §2.11. Load-bearing convergence primitive (3 juries flagged it).
- File: `next-app/src/components/InfoSheet.tsx` → `ExplainSheet.tsx`
- Est: 6h

### Step 4 — StatusPill formalise
Extract from inline usage. Create in `ui/`.
- File: `next-app/src/components/ui/StatusPill.tsx` (new)
- Est: 2h

### Step 5 — MetricStripCluster primitive
`<dl>/<dt>/<dd>` with tabular numerics.
- File: `next-app/src/components/ui/MetricStripCluster.tsx` (new)
- Est: 3h

### Batch B — parallel after 4+5 land
### Step 6 — ProposalCard primitive
Evolve `next-app/src/components/workout/ProposalCard.tsx` → `ui/ProposalCard.tsx`. Amber stripe, Accept bronze filled, Ignore ghost outline.
- Est: 3h (evolving existing)

**⛳ CHECKPOINT 1 — report to founder here. All primitives scaffolded, zero surfaces touched. Cheapest rollback point.**

### Step 7 — WorkoutHero primitive
Primary anchor. H1 = workout name (32px tallest strong-white). Nested StatusPill + MetricStripCluster + block list + optional sticky CTA slot.
- File: `next-app/src/components/ui/WorkoutHero.tsx` (new)
- Est: 8h

### Step 8 — ReadinessTrail upgrade + score-hero composition
Add interactive variant, merged "Why this?" button opening ExplainSheet with `trigger="status-composite"`.
- File: `next-app/src/components/workout/ReadinessTrail.tsx` (extend)
- Est: 4h

### Batch D — parallel (up to 6 devs / agents, 1 owner each)
### Step 9 — 6 primitives to `/dev/primitives` story route
WeeklySessionStrip, ArcProgressBar, CategoryTileGrid, WeeklyHeatmap, OutcomeBar, Sparkline `targetValue` extension.
- Files: `next-app/src/components/ui/{WeeklySessionStrip,ArcProgressBar,CategoryTileGrid,WeeklyHeatmap,OutcomeBar}.tsx`, `next-app/src/components/charts/Sparkline.tsx`, `next-app/src/app/dev/primitives/page.tsx`
- Est: 27h (parallelizable to ~5h wall-clock if 5 parallel workers)

### Step 10 — Wire Today surface
Invert H1 to workout name, drop `HeroStateCard` for `WorkoutHero`, slot ArcProgressBar / ReadinessTrail / ProposalCard / CategoryTileGrid 2×2.
- Files: `next-app/src/app/page.tsx`, `next-app/src/components/session/TodaySession.tsx`
- Est: 10h

**⛳ CHECKPOINT 2 — founder-visible moment. Ideally paired with Progress in same review.**

### Batch E — parallel after Step 10
### Step 11 — Wire Progress
### Step 12 — Wire Session
### Step 13 — Wire Programs catalog + Preview

### Batch F — parallel (8 files)
### Step 14 — Wire Week, Intake, Check, Profile, Account, Evidence, Guide, Report
Ripple: Evidence CITED/VERIFIED status ladder collapse touches master task list §G + landing en.ts + programs manifest.

### Step 15 — Persona harness regen + LCP/INP instrumentation + full blind-walk

**⛳ CHECKPOINT 3 — ship-gate. Numeric ≥7.0/10 (no surface <6.0) AND binary "reads as 2026 peer?" YES on Today.**

## In-batch caveats (continuous gates)

1. **Workout-name-tallest guardrail** — dev-mode console.warn inside WorkoutHero + visual-craft QA on every Today snapshot
2. **48h pause-and-rescope** — if any step blows estimate by >48h, PAUSE and re-brief
3. **Binary "2026 peer?" question** — at Step 15 blind-walk. Numeric AND binary YES required
4. **Semantic score-hero composition** — three focusable elements collapse to two per v1.1.1 patch (design-lead condition 2)
5. **Bento fallback unwind** — if Today lands 6.0-6.9 numeric band, first intervention is 2-col bento for Extras+Signals+Adherence below hero, NOT primitive iteration

## Files that will change (canonical list)

Core primitives:
- `next-app/src/app/globals.css` (tokens)
- `next-app/src/components/AppShell.tsx` (sticky-CTA slot)
- `next-app/src/components/nav/BottomNav.tsx` (three-signal indicator)
- `next-app/src/components/InfoSheet.tsx` → `ExplainSheet.tsx`
- `next-app/src/components/ui/StatusPill.tsx` (new)
- `next-app/src/components/ui/MetricStripCluster.tsx` (new)
- `next-app/src/components/ui/ProposalCard.tsx` (evolved from workout/)
- `next-app/src/components/ui/WorkoutHero.tsx` (new)
- `next-app/src/components/workout/ReadinessTrail.tsx` (extend)
- `next-app/src/components/ui/{WeeklySessionStrip,ArcProgressBar,CategoryTileGrid,WeeklyHeatmap,OutcomeBar}.tsx` (new)
- `next-app/src/components/charts/Sparkline.tsx` (extend)
- `next-app/src/app/dev/primitives/page.tsx` (new)

Surfaces:
- `next-app/src/app/page.tsx` + `next-app/src/components/session/TodaySession.tsx`
- `next-app/src/app/progress/page.tsx`
- `next-app/src/app/session/[slug]/page.tsx`
- `next-app/src/app/programs/page.tsx` + `next-app/src/app/programs/[slug]/page.tsx`
- `next-app/src/app/{week,check,profile,account,evidence,guide,report}/page.tsx`
- `next-app/src/app/programs/[slug]/intake/page.tsx`

Ripple:
- `landing/src/i18n/dictionaries/en.ts` (status ladder collapse)
- `data/programs/manifest.json` (status ladder collapse)
- `dev/audits/app/2026-08-19-master-task-list.md` §G

Tests + tooling:
- `next-app/tests/e2e/personas.spec.ts` (LCP + INP instrumentation)
- `next-app/tests/e2e/artifacts/personas.baseline-pre-batch-36/` (new dir)
- `next-app/tests/e2e/artifacts/personas.post-batch-36/` (new dir, populated at Step 15)
- `dev/scripts/blind-walk.py` (new)
- `dev/scripts/check-outcome-honesty.py` (new)
