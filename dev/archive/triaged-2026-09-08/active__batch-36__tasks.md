# Batch 36 · task tracker

**Legend**: `[ ]` pending · `[~]` in-progress · `[x]` done · `[!]` blocked

## Pre-flight

- [x] Design system v1.1.1 doc (13.4k words, 6/6 juries clear)
- [x] Stitch mockup jury (visual-craft + mobile-UX + design-lead)
- [x] Design checkpoint commit `9c9d3a5`
- [~] Stitch re-fires (Today, Session, Check, Progress) — server-side, ~15 min
- [x] Batch 36 Plan agent execution order
- [x] Dev docs created (plan / context / tasks)

## Step 0 — Baseline snapshot (HARD PRE-GATE)

- [ ] Run persona harness `dev/scripts/run-app-audit.sh` (or equivalent) to capture pre-Batch-36 state
- [ ] Copy artifacts to `next-app/tests/e2e/artifacts/personas.baseline-pre-batch-36/`
- [ ] Generate `MANIFEST.sha256` for reproducibility
- [ ] Create `dev/scripts/blind-walk.py` (shuffled sequence + anonymized filenames)
- [ ] Commit baseline as its own dedicated commit

## Step 1 — Token migration

- [ ] `globals.css:15` — `--color-muted` bump to `#93989f`
- [ ] `globals.css:23` — `--color-line` bump to `#5f6570`
- [ ] `globals.css:44+` — add `--color-line-strong: #6b717d`
- [ ] `globals.css` — add safe-area tokens
- [ ] `globals.css` — add `--ease-out-terav`
- [ ] `globals.css` — add `.dvh-screen` utility
- [ ] Typecheck + `npm run build` clean
- [ ] Commit

## Step 2 — AppShell extend

- [ ] `AppShell.tsx` — add `stickyCta?: ReactNode` prop
- [ ] `AppShell.tsx` — add `pullToRefresh?: 'contain' | 'auto'` prop
- [ ] `AppShell.tsx` — render stickyCta above BottomNav with 1px line-soft divider
- [ ] `BottomNav.tsx` — three-signal active-tab indicator (font-weight + text-strong + 2px bronze top-edge)
- [ ] Typecheck
- [ ] Commit

## Step 3 — ExplainSheet contract

- [ ] Rename `InfoSheet.tsx` → `ExplainSheet.tsx` (or create alongside + deprecate)
- [ ] Add `trigger` prop union
- [ ] Add `citation` + `logSignal` optional objects
- [ ] Safe-area bottom padding
- [ ] Drag handle 24×4px with `aria-hidden`
- [ ] Backdrop tap-safety zone (40px above sheet chrome)
- [ ] Body copy style rules (no exclamations, cite threshold + logSignal)
- [ ] Role dialog + aria-modal + focus trap + Escape close
- [ ] sheet-slide 300ms with reduced-motion collapse
- [ ] Update all callers
- [ ] Commit

## Step 4 — StatusPill formalise

- [ ] Create `next-app/src/components/ui/StatusPill.tsx`
- [ ] Signature: `label`, `tone`, `dot`, `interactive`, computed ARIA
- [ ] Persistent container for `role="status" aria-live="polite"`
- [ ] Migrate inline usage across codebase (grep pattern)
- [ ] Commit

## Step 5 — MetricStripCluster

- [ ] Create `next-app/src/components/ui/MetricStripCluster.tsx`
- [ ] `<dl>/<dt>/<dd>` structure
- [ ] Tabular numerics
- [ ] Grid cells with mono-caps labels + metric-display values
- [ ] ARIA label enforcement on `×` and `/` cells
- [ ] Commit

## ⛳ Checkpoint 1 — report to founder

## Step 6 — ProposalCard primitive

- [ ] Evolve `next-app/src/components/workout/ProposalCard.tsx` → `ui/ProposalCard.tsx`
- [ ] Amber left-stripe, Accept bronze filled, Ignore ghost outline
- [ ] `onExplain` opens ExplainSheet with `trigger="proposal-citation"`
- [ ] Post-decision undo state
- [ ] Update `ProposalStack.tsx` wrapper
- [ ] Commit

## Step 7 — WorkoutHero primitive

- [ ] Create `next-app/src/components/ui/WorkoutHero.tsx`
- [ ] Props signature per §2.2
- [ ] H1 pattern: 32px title on Today, 26px on Session/Preview
- [ ] Dev-mode console.warn for workout-name-tallest guardrail
- [ ] Block list with `[cited]` chips
- [ ] Sticky CTA slot forwarded to AppShell
- [ ] Commit

## Step 8 — ReadinessTrail upgrade + score-hero button

- [ ] Extend `ReadinessTrail.tsx` with `interactive` prop
- [ ] Interactive variant: min-h-11 min-w-11 per cell + role=group
- [ ] Non-interactive: role=img with computed aria-label
- [ ] Compose merged "Why this?" button inside WorkoutHero
- [ ] Width guardrail ≤ 40% card interior
- [ ] Commit

## Step 9 — 6 primitives to /dev/primitives

- [ ] `ui/WeeklySessionStrip.tsx`
- [ ] `ui/ArcProgressBar.tsx`
- [ ] `ui/CategoryTileGrid.tsx`
- [ ] `ui/WeeklyHeatmap.tsx`
- [ ] `ui/OutcomeBar.tsx`
- [ ] `charts/Sparkline.tsx` extend with `targetValue`, `caption`, `n<2` null wrapper
- [ ] `next-app/src/app/dev/primitives/page.tsx` story route
- [ ] Commit as single batch

## Step 10 — Wire Today

- [ ] `TodaySession.tsx` — invert H1, drop HeroStateCard for WorkoutHero
- [ ] Slot ArcProgressBar above hero
- [ ] Slot score-hero composition
- [ ] Slot ProposalCard between hero and Extras
- [ ] Keep CategoryTileGrid 2×2 for Extras
- [ ] AppShell `pullToRefresh="contain"`
- [ ] Local dev + persona harness spot check
- [ ] Commit

## ⛳ Checkpoint 2 — Today shipped, founder-visible

## Step 11 — Wire Progress
## Step 12 — Wire Session
## Step 13 — Wire Programs catalog + Preview
## Step 14 — Wire Week, Intake, Check, Profile, Account, Evidence, Guide, Report

## Step 15 — Persona harness regen + LCP/INP + blind-walk

- [ ] Extend `personas.spec.ts` with LCP + INP capture
- [ ] Regenerate `personas.post-batch-36/`
- [ ] Run `blind-walk.py` against baseline vs. post
- [ ] Founder blind-walk (numeric ≥7.0 + binary "2026 peer?" YES)
- [ ] Deploy to app.terav.fit

## ⛳ Checkpoint 3 — ship-gate passed
