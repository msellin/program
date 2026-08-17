# App specialist agents — Context

Running notes so a fresh session can resume with just "continue".

## Where we are (2026-08-17)

- Plan written (`plan.md`).
- Tasks scaffolded (`tasks.md`).
- Not yet started on implementation.

## Key files to know

**Existing infra we're building on:**
- `.claude/agents/landing-*.md` — canonical shape for specialist agents. Use `landing-visual-craft.md` as the template (most complete method + output sections).
- `next-app/tests/e2e/fixtures.ts` — Playwright auth fixture (Supabase sign-in). Reused as-is for personas.
- `next-app/tests/e2e/setup-test-user.ts` — has safety prefix enforcement (`e2e-`) and protected uids. Must extend, not bypass.
- `next-app/tests/e2e/harness/archetype.ts` — 5 archetypes fully defined with deterministic per-day behavior. Reuse.
- `next-app/tests/e2e/harness/simulator-v2.ts` — advances a user through N days with real state mutation. Reuse.
- `next-app/tests/e2e/simulate-matrix-v2.spec.ts` — reference implementation of running an archetype × program pairing.
- `landing/src/i18n/dictionaries/en.ts` — canonical source of landing promises for `app-landing-alignment` agent.

**New files this project will create:**
- `next-app/tests/e2e/harness/personas.ts` — 3 persona declarations.
- `next-app/tests/e2e/harness/tour.ts` — post-simulation route walker capturing screenshots/DOM/text/console/network.
- `next-app/tests/e2e/personas.spec.ts` — spec that runs `simulate → tour → save` for each persona.
- `.claude/agents/app-{accessibility,mobile-ux,visual-craft,motion-perf,copy-clarity,landing-alignment}.md`
- `dev/scripts/run-app-audit.sh` — orchestrator.
- `dev/audits/app/` — where audit reports land.

## Decisions locked

1. **3 personas, 3 programs.** Not 1 program × 3 archetypes — need program diversity for landing-alignment ("5 programs live" needs multiple programs in the tour).
2. **Route tour is post-simulation.** Simulate 30-45 days first (so history/progress/coach pages have data), then walk routes. Not the reverse.
3. **One audit report per agent** cross-referencing all 3 personas — not one report per persona × agent.
4. **Test emails follow `e2e-persona-*@…` pattern** — falls within existing safety prefix.
5. **State cleanup before each persona run** — delete Supabase row + KV entry. Idempotent replay.

## Decisions still open

- Whether `app-landing-alignment` should be tools=`Read, Grep, Glob, Bash, WebFetch, Write` (like landing agents) or also get Playwright access to re-run comparisons live. Leaning read-only for now.
- Whether the tour should include an authenticated-user error state (e.g., visit `/programs/nonexistent` to catch 404 quality). Not blocking Phase 1.
- Whether snapshots also include a "reduced motion" pass. Leaning yes for `app-motion-perf` but only after Phase 1 baseline works.

## Next step

Start Phase 1 — write `harness/personas.ts` first (declarative, no side effects), then `harness/tour.ts`, then wire the spec.

## Things easy to lose

- The `setup-test-user.ts` safety fence uses email prefix `e2e-` and a `NEVER_TOUCH_UIDS` set. Don't remove either.
- Simulator v2 mutates Supabase state directly via the client-side page context; our tour must run in the **same** Playwright page after simulation ends, before sign-out.
- The `authedPage` fixture auto-dismisses the onboarding "Skip setup" modal — personas that need to see onboarding should use a raw `page`, not `authedPage`.
