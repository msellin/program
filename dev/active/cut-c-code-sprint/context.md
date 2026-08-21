---
name: Cut C code sprint · durable state notes
last_updated: 2026-08-21 · sprint start
---

# Cut C code sprint · context

Rolling notes on decisions made during implementation, gotchas hit, state at last context-window boundary. Read this on session resume to pick up where you left off.

## Current state · 2026-08-21 sprint start

**Phase 1 · Foundations** — starting now.

Nothing built yet. Waiting on:
- First file changes to land

**Key files to touch (in order of first-write):**
1. `next-app/src/app/globals.css` — add `--dv-*` tokens (currently only in `dev/active/redesign-progress/record-mockup-day400.html` inline styles)
2. `next-app/src/app/record/page.tsx` — new
3. `next-app/src/components/record/` — new directory
4. `next-app/src/app/progress/page.tsx` — reduce to redirect stub
5. `next-app/src/components/nav/BottomNav.tsx` — swap Progress tab for Record

**Existing dependencies confirmed:**
- Recharts already lazy-loaded (used by `SymptomLoadChart`); adding one more chart to the same chunk costs zero incremental bundle bytes
- Zustand store persistence handles all data reads
- `useStore((s) => s.store.retest_readings)` returns `undefined` for users without any (matches Batch 37 fix — must be careful with `?? []` fallback INSIDE selectors → known infinite-loop trap)

## Decisions to reference (locked)

`dev/active/decisions-2026-08-21-locked.md` is the source of truth. Key locks driving this sprint:
- C1 v3 mockup approved
- C2 skip day-14 mockup (validate via synthetic persona)
- C5 add "Every change cites its source" onboarding beacon on first /record visit
- C6 session route stays `/session/[slug]?date=…` — do NOT touch
- Non-goals: D1-D5 (Today/Week refactor is Week 4), C3+C4 (Cut A deferred)

## Non-obvious constraints (recovered from prior audits + Batch 37)

- **`?? []` inside `useStore` selector is a React #185 trap.** Split into two lines: `const raw = useStore((s) => s.store.field); const val = raw ?? [];`. Batch 37 shipped this fix; do NOT reintroduce the pattern in new components.
- **Bronze CTA-only (R2)** — chart curve NEVER uses bronze. Slate (`--dv-curve-primary`) is the aliased color. Only bronze on Record surface = BottomNav active-tab indicator.
- **State color is allowed in data viz** — this is the reconciliation the visual-craft agent made. R2 is a UI-chrome rule; state tokens (`--color-green`, `--color-amber`, `--color-muted`) always shipped for state contexts.
- **Tabular-nums everywhere** — every metric readout must use `font-variant-numeric: tabular-nums` (mono class already applies this via JetBrains Mono).
- **44×44 tap targets** — every new interactive respects Apple HIG minimum. Retest pins in RetestTimeline wrap in 22×44 flex hitbox.
- **safe-area env()** — every fixed/sticky element uses `env(safe-area-inset-*)` per Batch 37 mobile-UX audit.
- **motion-reduce guard** — every transition gets `motion-reduce:transition-none`.

## API surface / data reads

Data shape for the Record surface (from Zustand):
- `store.logs` — day-keyed log entries with exercises + runs + symptoms + derived_state
- `store.retest_readings` — array of `{ metric_id, value, observed_at, program_slug }` (Batch 37 fix — raw can be undefined)
- `store.user_profile.active_program_id` + `active_program_ids` for multi-track
- `store.user_profile.program_states[slug]` for phase / cycle / tier / cadence position
- `store.accepted_proposals` — for JSON export citation payload
- `store.contraindications` — for JSON export
- `program.retest_metrics` (via `loadProgram(slug)`) for target values + windows + display names

Data derivations (from `lib/engine/`):
- `evaluateRetestMetrics(program, store, userTier)` — current retest values
- `dueRetestMetrics(program, store, today, userTier)` — which retests are due
- `deltaFromBaseline({ current, baseline, direction })` — the delta chip
- Rolling-average curve — new helper needed: `computeRollingAvg(entries, window_days, direction)` in `lib/engine/rolling-avg.ts` (new)

## Migration + compat notes

- Users who bookmarked `/progress` get a client-side redirect on mount (not an HTTP 3xx, since we're static-exported)
- Users who bookmarked `/history` — that route currently exists. Decision needed at Phase 5: (a) leave `/history` for backward compat + also let `/record` show the same content, or (b) redirect `/history` → `/record` too. Preferred: (b) redirect both.
- `RetestMetricsPanel` still shipping in `/progress` code — will be removed when the redirect stub lands

## Test / verification notes

Persona harness auto-writes `console.log` per persona with pageerror listener (added Batch 37). Every persona in `tests/e2e/harness/personas.ts` runs against every route in `tests/e2e/harness/tour.ts:buildRoutes()`. To add `/record`:
- Update `buildRoutes(activeProgramSlug)` — replace `{ slug: "05-progress", path: "/progress", desc: "Progress" }` with `{ slug: "05-record", path: "/record", desc: "Record" }`
- Consider adding `07-record-long` or similar for synthetic day-400 persona

Synthetic day-400 persona:
- Extend PERSONAS array with `persona-strength-long`
- days: 400, programSlug: "concurrent-strength-maintenance"
- Simulator runs 400 days of history; ensure retest_readings populate at retest cadence (every 4 weeks × 14 events)

## What to update as you build

When each phase completes:
1. Check off in `tasks.md`
2. Note any decision divergence from `decisions-2026-08-21-locked.md` here in this file (with rationale)
3. Note any surface pattern that emerges as reusable (worth pulling into a shared primitive)
4. Note any friction that suggests a decision was subtly wrong (feedback loop into future refactors)

## Session-boundary handoff

If context runs low mid-sprint:
1. Save current state notes here (which phase, what half-done)
2. Note the exact file + line where the next edit starts
3. New session just needs to read `plan.md` + `tasks.md` + this file
