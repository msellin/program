# Post-audit P0s implementation plan — what remains

> **Triaged 2026-09-08.** Every `- [ ]` in the original was checked against the
> codebase, not against its own description. Result: **29 already done and
> never ticked · 4 obsolete or superseded · 7 genuinely remaining.**
>
> The full original is preserved at
> `dev/archive/triaged-2026-09-08/active__post-audit-p0s__implementation-plan.md` — nothing was deleted, and the
> DONE verdicts are recoverable from there. What follows is only what survived,
> so the generated index in `dev/active/OPEN-TASKS.md` counts reality instead of
> counting boxes nobody walked back to tick.

## Remaining

- [ ] **P1 — citation snapshot on tier/phase accepts.** `acceptDayAdjustment`
      snapshots (`useStore.ts:781`); `promoteTier` (`:1429`) and `advancePhase`
      (`:1473`) do not, so `tier_history[]` records a promotion with no evidence.
      The repo's signature defect: right fix, one sibling.
- [ ] **P3 — `undoLastProposalOutcome`.** `recordProposalOutcome` shipped; the
      undo it was written for never did. Zero hits for `undoLast`.
- [ ] **P3 — undo toast** (`role="status"`, 6s). No undo affordance on the stack.
- [ ] **P4 — "Re-run onboarding" row in Profile.** The per-program key clearing
      exists but is reachable only from wipe/reset paths.
- [ ] **P5 — rerun the matrix** post-A5, and re-confirm the previously-passing
      assertions. Both blocked on G3.
- [ ] **P6 — triage the flow-grade brief** (`dev/design-briefs/2026-08-17-flow-grade-full-journey.md`)
      into real tasks. Written, never triaged.
- [ ] **FOUNDER — consent-first `setDaySymptoms`.** `SymptomPrimerStep` documents
      the removal, but `LifeLoadStep.tsx:27` still writes `setDaySymptoms` during
      onboarding. The file argues life-load is general stress rather than Article 9
      health data. That is a legal call, not a code one.
