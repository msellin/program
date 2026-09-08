# Batch 36 — what remains

> **Triaged 2026-09-08.** Every `- [ ]` in the original was checked against the
> codebase, not against its own description. Result: **68 already done and
> never ticked · 7 obsolete or superseded · 6 genuinely remaining.**
>
> The full original is preserved at
> `dev/archive/triaged-2026-09-08/active__batch-36__tasks.md` — nothing was deleted, and the
> DONE verdicts are recoverable from there. What follows is only what survived,
> so the generated index in `dev/active/OPEN-TASKS.md` counts reality instead of
> counting boxes nobody walked back to tick.

## Remaining

- [ ] **Generate `MANIFEST.sha256`** over the pre-batch baseline artifacts.
      `personas.baseline-pre-batch-36/` holds 14 persona dirs and no integrity
      record, so the baseline cannot be shown to be the baseline.
- [ ] **Point `ProposalStack` at `ui/ProposalCard`.** `ProposalStack.tsx:6` still
      imports the older `workout/ProposalCard`. The `ui/` one carries the
      `[cited]` chip and the InfoSheet citation trigger — the confirm-first
      affordance users never see. See the defect note below.
- [ ] **LCP + INP capture in `personas.spec.ts`.** No `PerformanceObserver` or
      web-vitals anywhere under `tests/e2e/`.
- [ ] **Regenerate `personas.post-batch-36/`** — or record the decision not to.
      `personas/` has been regenerated many times since and the baseline is
      three weeks stale, so this may be obsolete; nothing has said so.
- [ ] **Run `blind-walk.py`** against baseline vs post. The script exists and is
      complete; it has never been run.
- [ ] **FOUNDER — the ship gate.** Blind walk scoring >= 7.0 and "2026 peer?" YES.
      Batches 37, 38, 38.1 and 39 all shipped on top of an unevaluated Batch 36.

## Defect found during triage, recorded nowhere

Five of the eight Batch 36 primitives never reached a user surface:
`ui/WorkoutHero`, `ui/CategoryTileGrid`, `ui/OutcomeBar`, `ui/WeeklySessionStrip`
and `ui/ProposalCard` are imported **only** by `src/app/dev/primitives/page.tsx`.
(`ArcProgressBar`, `WeeklyHeatmap`, `MetricStripCluster`, `StatusPill` and
`StickyCta` did land.)

The worst is `ui/ProposalCard`: a complete Accept/Ignore primitive with an undo
state and a citation chip, sitting dead beside the older card that actually
ships. Two divergent implementations of the confirm-first mechanic, and the one
carrying the evidence affordance is the one nobody sees.
