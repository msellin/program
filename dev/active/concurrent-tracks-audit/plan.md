# Concurrent-tracks Today-view audit

**Closed 2026-08-19 (S2 walk-through, Batch 28).** The four "remaining work"
items shipped implicitly during Batches 10-27:

1. **Simulator-v2 multi-program activation** — persona-concurrent
   (anterior-hip + engine-builder) and persona-multitrack (engine-builder
   + secondary) both run cleanly through `simulator-v2.ts`. Full 15/15
   personas pass in the 2026-08-19 harness rerun.
2. **Harness artifacts against persona-concurrent** — fresh in
   `next-app/tests/e2e/artifacts/personas/persona-concurrent/` (mtime
   2026-08-19 15:03) and persona-multitrack (15:12).
3. **Three specialist agents against the artifacts** — Batch 25 audit
   round dispatched all 6 UX/UI agents against all 15 personas. mobile-ux
   flagged persona-multitrack density findings; visual-craft covered the
   `PerProgramAdherenceCard`; copy-clarity covered the multi-track surfaces.
   Reports at `dev/audits/app/2026-08-19-app-audit-*-batch25.md`.
4. **Product-design-lead follow-up brief** — the F2/F5/F6/F7 brief at
   `dev/audits/app/2026-08-19-design-brief-features.md` covered the
   multi-track hand-offs (Pause, Extend, `/account` primary-picker for
   ≥ 2 programs). Batches 22-24 shipped the resulting UI: F3
   switch-program ConfirmSheet, F5 GraduationCard 4-verb with
   `pauseProgram` store action, F7 `/account` primary picker (only shown
   when ≥ 2 active).

Additional multi-track work not scoped in this plan but shipped:
- `PerProgramAdherenceCard` (Batch 5) — per-program tri-color adherence bar
- `PerProgramActions` (Batches 10-14) — per-program Skip/Move
- `CrossTrackWeekTile` — Week per-program dots
- `persona-concurrent` + `persona-multitrack` in the harness

**Original brief follows for archival reference.** Surfaced 2026-08-17
from founder screenshots of a superadmin-added secondary program.

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
