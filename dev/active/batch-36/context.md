# Batch 36 · context

**Last updated**: 2026-08-20 (session ongoing)

## Where we are

Design system v1.1.1 approved and committed (`9c9d3a5`). Batch 36 is the wire-up execution — coordinated coding to implement v1.1.1 across 13 surfaces of the Terav app.

Founder green-lit "full A mode, autonomous, use agents." I dispatched the Plan agent → got surgical 15-step order (`dev/active/batch-36/plan.md`). Currently starting Step 0 (baseline snapshot).

## Key decisions made in the design phase (must respect during wire-up)

1. **Semantic score-hero, NOT autonomous Whoop-style donut** (R8). Composition: StatusPill + ReadinessTrail sparkline + single merged "Why this?" button opening ExplainSheet.
2. **Workout name is H1 32px, tallest strong-white element on Today**. Route name "Today" is NEVER an H1 — it lives in mono-caps eyebrow like "TODAY · WEEK 3 OF 6".
3. **Bento rejected for Today** (single column). Bento adopted for browse surfaces (Programs catalog 2×3, Progress).
4. **13-surface single-batch ship**. No incremental per-surface deploy. §6 explicit.
5. **One accent per surface**. Bronze goes to primary CTA + one supporting bronze mark (heatmap intensity, nav indicator, progress fill). Never two competing bronzes.

## Existing primitives (discovered — reduces scope)

- `AppShell.tsx` — exists, extend (§2.14 doc said "NEW" but it already exists)
- `DashboardBlock.tsx` — exists, keep
- `InfoSheet.tsx` — exists, evolve to ExplainSheet
- `ConfirmSheet.tsx` — exists, keep (adjacent)
- `workout/ProposalCard.tsx` — exists, evolve + move to ui/
- `workout/ProposalStack.tsx` — exists (thin wrapper around ProposalCard)
- `workout/ReadinessTrail.tsx` — exists, extend for interactive variant
- `workout/HeroStateCard.tsx` — will be REPLACED by WorkoutHero
- `charts/Sparkline.tsx` — exists, extend with targetValue prop

## Missing primitives (must create)

- `ui/StatusPill.tsx` (formalise from inline usage across codebase)
- `ui/MetricStripCluster.tsx` (new)
- `ui/WorkoutHero.tsx` (new — primary anchor)
- `ui/WeeklySessionStrip.tsx` (new)
- `ui/ArcProgressBar.tsx` (new)
- `ui/CategoryTileGrid.tsx` (new)
- `ui/WeeklyHeatmap.tsx` (new)
- `ui/OutcomeBar.tsx` (new)

## Token migration (from v1.1.1 doc)

- `--color-line`: `#4d525d` → `#5f6570` (a11y bump per v1.1.1 §1)
- Add `--color-line-strong: #6b717d` (new token)
- `--color-muted`: `#8a8f9a` → `#93989f` (a11y bump)
- Add `--safe-area-{top,bottom,left,right,keyboard}` env() tokens
- Add `--ease-out-terav: cubic-bezier(0.2, 0.8, 0.2, 1)`
- Add `.dvh-screen { min-height: 100dvh }` utility

## Motion budget (v1.1.1 patch — 800ms dropped)

- `fast: 200ms` — state changes
- `medium: 400ms` — sheet dismiss
- `sheet-slide: 300ms` — sheet slide (iOS norm)
- NO 800ms hero flourishes. Peer alignment: Outsiders 600, Whoop 350, Runna 280.

## Ship gate (Step 15)

- Blind persona-walk score ≥7.0/10 (numeric)
- Binary "reads as 2026 peer?" = YES (both required, no OR)
- LCP < 2200ms on all personas 4G cold
- INP < 180ms on DashboardBlock expand
- CLS < 0.01 on Today

## Failure protocol (§6 pause-and-rescope)

If ANY step blows estimate by >48h → STOP, re-brief with a spec agent, do NOT push through.

## Bento fallback unwind (§4)

If Today lands 6.0-6.9 numeric band in blind-walk, first intervention is 2-col bento for Extras+Signals+Adherence below hero. NOT primitive iteration.

## Stitch mockup winners (curated set, ~5 more surfaces re-firing)

Cleared by 3 juries (visual-craft + mobile-UX + design-lead):
- Programs catalog: `637675d2`
- Week: `755d9315`
- Profile: `1ea52f9c`
- Settings: `7ab0edcc`
- Report: `7f29559d`
- Intake: `a2a34230`
- Extras: `a97528e0`
- History: `b84f5aea`

Re-firing (server-side):
- Today (v1.1.1 with workout-name H1)
- Session detail (with sticky CTA + workout-name H1)
- Check (keyboard-aware sticky CTA)
- Progress (never landed on first pass)

Full inventory: `dev/audits/app/2026-08-20-stitch-mockup-inventory.md`.

## Next concrete action

Step 0 — baseline snapshot. Involves running the persona harness (`dev/scripts/run-app-audit.sh`) to capture pre-Batch-36 screenshots, then committing them under a `.baseline-pre-batch-36/` directory with a SHA manifest. Also create `dev/scripts/blind-walk.py` — the randomizer script that shuffles screenshots for the blind-walk gate at Step 15.

## Session hand-off notes

If context runs low and this needs to continue in a new session:
1. Read this context.md
2. Read `plan.md`
3. Check `tasks.md` for what's done vs. in-progress
4. Read `dev/audits/app/2026-08-20-terav-design-system-v1.1.md` (source of truth)
5. Continue from the first pending task
