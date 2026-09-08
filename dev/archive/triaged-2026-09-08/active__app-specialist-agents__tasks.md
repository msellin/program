# App specialist agents — Tasks

Check items as we go. Do not batch completions.

## Phase 1 — Persona runner

- [x] Verify current app routes list (post-auth) by walking `next-app/src/app/` and pruning `(auth)`, `legal`, `reset-password` from the tour list — 15 routes captured in `harness/tour.ts::buildRoutes`
- [x] Extend `setup-test-user.ts` — `ensureTestUser` already accepted email/password; added `resetTestUser` (delete + recreate)
- [x] Add a state-reset helper that deletes a persona's Supabase row + KV entry before each run — `resetTestUser` handles this via auth-user delete (fresh uid isolates state)
- [x] Create `harness/personas.ts` with the 3 personas declared (id, archetype, program, days, email)
- [x] Create `harness/tour.ts` — routes, viewports, screenshot + DOM + text + console + network + manifest
- [x] Create `personas.spec.ts` — iterate over personas: reset state, sign-in, simulate, tour, write persona.json
- [x] Add `npm run e2e:personas` script to `next-app/package.json`
- [ ] Smoke run: `E2E_BASE_URL=http://localhost:3000 npm run e2e:personas` completes and produces artifacts for at least one persona — requires local Supabase env keys + dev server, deferred until user runs
- [ ] Full run against `program-v2.pages.dev` produces all 3 personas × 15 routes × 2 viewports

## Phase 2 — Agent authoring

- [x] Draft `.claude/agents/app-accessibility.md`
- [x] Draft `.claude/agents/app-mobile-ux.md`
- [x] Draft `.claude/agents/app-visual-craft.md`
- [x] Draft `.claude/agents/app-motion-perf.md`
- [x] Draft `.claude/agents/app-copy-clarity.md`
- [x] Draft `.claude/agents/app-landing-alignment.md`
- [ ] **Restart Claude Code so agent files are discoverable (USER ACTION)**
- [ ] Dry-run each agent against the persona artifacts and eyeball the first report for shape

## Phase 3 — Orchestration

- [x] Create `dev/audits/app/` directory
- [x] Write `dev/scripts/run-app-audit.sh` — regenerates personas, prints parallel agent invocations
- [x] Add reference memory pointing at the whole system (`reference_app-audit-system.md`)
- [ ] First full audit round produces 6 reports; user reads and gives feedback
- [ ] Address feedback in a Phase-4 iteration doc

## Post-launch

- [ ] Add reduced-motion pass to the tour (once baseline works)
- [ ] Consider a 4th persona: brand-new-user (day 0, no logs) if empty-state coverage feels thin
- [ ] Move this task set to `dev/completed/` once first audit round accepted
