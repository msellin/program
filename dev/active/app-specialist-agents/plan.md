# App specialist agents — Plan

Mirror the 5 landing specialists (`.claude/agents/landing-*.md`) for the mobile app itself, but wire them to consume Playwright-generated artifacts from **3 personas** each running a different program at a settled state, so audits are grounded in real screens/text/logs — not code guesses.

Written 2026-08-16.

---

## Problem

The landing has 5 world-class auditor agents. The app has none. Manual mobile-app QA is currently:
1. Slow (one screen at a time).
2. Blind to real user state — Margus is the only test user; there's no "day-30 overperformer on engine-builder" screen to look at.
3. Uncorrelated with landing promises — nobody's verifying the app actually delivers what the landing pitches.

## Success shape

After a single command:
1. Playwright spins up **3 personas** (different program + archetype), advances each to a settled state, then tours every app route capturing:
   - Mobile screenshots (375 + 393)
   - Desktop cross-check (1280)
   - Rendered text extract per screen
   - DOM snapshot per screen
   - Final store JSON (logs, TMs, proposals, adjustments)
   - Console + network logs
2. **6 specialist agents** read those artifacts and write audits into `dev/audits/app/`.
3. Reports name `persona:route` + `file:line` for every finding.

## The 3 personas

Chosen so each stresses a different part of the app:

| ID | Archetype | Program | Day | Why this combination |
|----|-----------|---------|-----|----------------------|
| `persona-recover` | injured-recovery | anterior-hip-rebuild | 30 | Rehab pathway, gated phases, symptom → red/amber banner |
| `persona-strength` | overperformer | engine-builder | 30 | Adaptive load progression, engine proposing increases, high accept rate |
| `persona-erratic` | erratic | concurrent-strength-maintenance | 45 | Skip/re-plan behavior, `skipped[]`, dismissed proposals |

3 different programs = coverage of rehab / strength / concurrent domains.

## The 6 specialist agents

5 mirror the landing set + 1 new for cross-checking landing promises against app reality:

| Agent | Scope |
|-------|-------|
| `app-accessibility` | WCAG 2.2 AA inside the app — keyboard nav across sticky bottom nav, focus visibility on log/session forms, ARIA on charts (Heatmap, Progress), form-label pairing on onboarding and log forms, contrast in warm-dark palette, screen-reader flow on Today/Coach/History |
| `app-mobile-ux` | Thumb reach in bottom-nav zone, tap targets ≥44px on log inputs and Accept/Ignore buttons, sticky bottom-nav behavior over iOS safe-area / keyboard, 100vh trap on Today page, snap behavior on Programs carousel, overflow-x on Heatmap |
| `app-visual-craft` | Type scale rem→px per breakpoint on Today/Coach/History, palette discipline vs. `globals.css` warm-dark tokens, spacing rhythm across cards, iconography consistency (lucide stroke weights) |
| `app-motion-perf` | CWV on Today (the LCP page), PWA install prompt, first paint per route, animation choreography on Accept/Ignore toast, prefers-reduced-motion compliance |
| `app-copy-clarity` | In-app microcopy — empty states (no-program, no-logs, no-history), error toasts, log-form labels, proposal explanation text (does the "cite" show up?), onboarding step copy |
| `app-landing-alignment` | Every landing promise → does the app deliver? Landing says "adaptive strength, cardio, and rehab", "every change cites a study — you approve each one", "5 programs live", "engine sharpens against your log", "sessions in ten minutes". For each claim, find the screen/text that satisfies it (or fails to). Uses `landing/src/i18n/dictionaries/en.ts` as source of truth. |

## Artifact layout

Each persona run produces:

```
next-app/tests/e2e/artifacts/personas/{persona-id}/
├── mobile/
│   ├── 01-welcome.png
│   ├── 02-week.png
│   ├── 03-coach.png
│   └── ... one per route
├── desktop/
│   └── ... same, 1280 viewport
├── text/
│   ├── 01-welcome.txt              # visible text extract
│   ├── ...
├── dom/
│   ├── 01-welcome.html
│   ├── ...
├── console.log                     # browser console (per route with headers)
├── network.log                     # request URLs + status (per route)
├── final-store.json                # end-of-simulation store
├── actions.log                     # human-readable action trace
└── manifest.json                   # persona metadata (archetype, program, day, viewport list, timestamp)
```

## Agents share the same artifact dir

All 6 specialists read from `next-app/tests/e2e/artifacts/personas/*/` — this is the "single source of truth" the user asked for. Each agent writes ONE audit per run at `dev/audits/app/{date}-{agent}.md` that cross-references all 3 personas (not one file per persona × agent — that would produce 18 files nobody reads).

## Phases

**Phase 1 — Persona runner (highest risk, do first)**
- Extend `setup-test-user.ts` to support multiple scoped test users
- New file `harness/personas.ts` — declares the 3 personas
- New file `harness/tour.ts` — post-simulation, walk every route capturing artifacts
- New spec `personas.spec.ts` — for each persona: reset state, simulate to day N, tour, save artifacts
- Add `npm run e2e:personas` script

**Phase 2 — Agent authoring**
- Copy landing agent shape (`landing-visual-craft.md` as canonical) into 6 new app agents
- Each agent's method section points at the artifact layout
- Each agent's output section writes to `dev/audits/app/{date}-{agent}.md`

**Phase 3 — Orchestration**
- `dev/scripts/run-app-audit.sh` — runs personas, then dispatches all 6 agents in parallel
- Update project `README.md` with a single-line invocation

## Risks / open decisions

- **Playwright cost of full tour per persona.** ~14 routes × 3 personas × 2 viewports = 84 screenshots. At ~2s per route load + screenshot, ~5min per persona. Acceptable.
- **Persona test emails.** Must follow the `e2e-` safety prefix already enforced in `setup-test-user.ts`. Will use `e2e-persona-recover@…`, `e2e-persona-strength@…`, `e2e-persona-erratic@…`.
- **State cleanup between runs.** Deleting a persona's Supabase row + KV entry before each run so archetypes replay deterministically. Add to `harness/personas.ts`.
- **Landing-alignment agent scope creep.** Must NOT re-audit landing itself — only verifies app-side delivery of landing claims. Cite landing dict `en.ts` key + app screen/text.
- **App routes list assumption.** Based on `next-app/src/app/` listing. If `(auth)` and `legal` and `reset-password` shouldn't be in the tour post-signin, exclude them.

## Non-goals

- Replacing the existing `simulate-matrix-v2.spec.ts`. It keeps running for engine correctness. This is a separate, screenshots-and-text pipeline.
- Building a UI to browse audit reports.
- Auto-fixing findings. Reports only.
