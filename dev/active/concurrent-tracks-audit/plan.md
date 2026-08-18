# Concurrent-tracks Today-view audit

**Status update 2026-08-18:** `persona-concurrent` definition landed in
`next-app/tests/e2e/harness/personas.ts`, along with a new
`Persona.additionalProgramSlugs` field. Primary + secondary programs
declared (anterior-hip-rebuild + engine-builder) so the scope below is
half-satisfied. Remaining work:
1. Extend `simulator-v2.ts` to activate multiple programs (call
   `addSecondaryProgram` for each additionalProgramSlugs entry; per-day
   scheduling logic to route logs to the right program based on which
   scheduled work that day).
2. Run the harness against `persona-concurrent` to produce artifacts.
3. Dispatch the 3 specialist agents (mobile-ux, visual-craft, copy-clarity)
   against the artifacts.
4. Product-design-lead follow-up brief.

Estimated remaining: ~3-4h. Runnable when the E2E harness has a Supabase-auth
setup or when the founder confirms the flow to run it manually.

**Original brief follows.** Surfaced 2026-08-17 from founder screenshots of a superadmin-added secondary program.

## Why this matters

- Concurrent tracks are a paid-tier feature (see `project_saas-track-model.md`) and one of the load-bearing "why upgrade" reasons.
- Current Today view degrades badly when two programs land on the same day — the founder's own screenshots show a two-prose-block wall with ambiguous per-program scoping and repeated intros.
- The three existing persona artifacts (`persona-strength`, `persona-erratic`, `persona-recover`) all test single-program flows. Concurrent state is untested by the audit harness.

## Scope

### 1. Add a fourth persona to the harness

File: `next-app/tests/e2e/harness/personas.ts` (or wherever the persona definitions live per `dev/scripts/run-app-audit.sh`).

New persona: `persona-concurrent`.
- Two active programs simultaneously — recommended pair: **anterior-hip-rebuild + engine-builder**. Covers the interference warning + a rehab program + an aerobic program (the two most dissimilar shapes in the catalog).
- 30 days of logs across both, with a realistic mix (~4 hip sessions/week, ~3 engine sessions/week, some conflict days).
- Include one day where both programs schedule sessions (the density case from the screenshots).
- Include one day where only one schedules (so the layout has to handle asymmetry).
- Life-load elevated on ~30% of days (drives day_adjustment_soften proposals under A5).

### 2. Run three audits against the new persona

- **app-mobile-ux** — thumb reach, tap targets, scroll length, safe-area behavior on the doubled content. Focus on the two-program Today view specifically.
- **app-visual-craft** — density, program-identity signal strength at row level, typography rhythm across two prose blocks + two exercise lists, accent economy when two programs' colored stripes stack.
- **app-copy-clarity** — repeated prose problem (session intros re-shown on every render), scope ambiguity of session-level verbs, coherence of the interference advisory copy.

Skip motion-perf + a11y + landing-alignment for this pass — this is a density-first audit.

### 3. Design brief follow-up

After the audits land, dispatch `product-design-lead` with the three findings + the Garmin references (`~/Downloads/895873b4-*`, `e70e99b9-*`, `9aadc5a5-*` from 2026-08-17) to produce a decision brief. Likely open questions to close:

- Where does per-session action verbs (Move day / Skip today / Whole week) belong when there are 2+ programs? Top action row, per-program strip, or floating action button?
- Should secondary programs collapse at rest by default, and if so what's the trigger (never-expanded / auto-collapse-after-first-view / user-preference)?
- Should the program identifier scale up to be visible at the exercise-row level (badge? colored icon? left-border weight)?
- Does the interference advisory need to move into ProposalStack (kind: `interference_warning`) so it can be Accepted (acknowledged for the day) or Ignored?

## Design context to feed to the auditors

Garmin references captured 2026-08-17 — the founder liked:
- Top-row global actions (`+`, refresh, sync, notifications) freeing the content column.
- Compact activity summary cards (icon + label + primary metric on one line, prose one tap deep).
- Progressive disclosure ("See All" / carousel dots) so density is opt-in.

## Preconditions

- Phase 3 (A5) ProposalStack shipped — the interference advisory audit assumes A5's proposal surface is live so the "should this be a proposal?" question is answerable.
- No landing/domain migration required for this audit.

## Estimated effort

- Persona construction (build 30 days of realistic logs across two programs): **2-3h**
- Persona artifact generation via existing harness: **30min-1h**
- Three audits (mobile-ux + visual-craft + copy-clarity): **~30-40min per agent, parallel-safe**
- Product-design-lead follow-up brief: **1-2h**
- Total: **~half a day**

## What this task does NOT cover

- Actually IMPLEMENTING the redesign — that's a follow-up phase after the design brief lands.
- Landing-page positioning for the concurrent-track proposition (separate; already captured in the positioning audit follow-ups).
- Handling >2 concurrent programs (defer until we know 2 works).
