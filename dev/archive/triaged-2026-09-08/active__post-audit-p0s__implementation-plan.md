# Post-audit implementation plan

**Status:** approved 2026-08-17. Founder chose the future-proof option for all three open decisions.

Design briefs (source of truth for each phase):
- A2 — `dev/design-briefs/2026-08-17-a2-study-citations-on-proposals.md`
- A5 — `dev/design-briefs/2026-08-17-a5-accept-ignore-visibility.md`
- B3 — `dev/design-briefs/2026-08-17-b3-program-agnostic-onboarding.md`

Prior mechanical sweep: `dev/active/post-audit-p0s/tasks.md` (all mechanical items closed 2026-08-17, commit `586f4d7`).

---

## Sequenced plan

Order is load-bearing. A2 unlocks A1 (TM-bump citation slot already exists). A5 depends on the `Proposal` union and citation snapshot shape. B3 is schema-additive to program JSON and touches nothing the engine phases depend on.

```
Phase 1  A2   Citations library                  10-14 h   unlocks A1's citation slot
Phase 2  A1   Overperformer TM-bump engine rule    2-4 h   depends on A2
Phase 3  A5   ProposalStack + ProposalCard       10-14 h   depends on A2 (snapshot), A1 (union member)
Phase 4  B3   Declarative onboarding_steps        6-8 h   independent, safe to run in parallel
Phase 5  G3   Simulator-matrix re-verification    2-3 h   depends on A1 + A5 shipping
Phase 6  Flow-review                              2-3 h   after phases 1-5, product-design-lead
```

Total: ~32-46 h focused work. Ship in the order above; do not interleave.

---

## Phase 1 — A2 · Citations library

**Deliverable:** `next-app/public/data/citations.json` (~112 canonical refs, dedupe from 147), `<CitationRef>` component, `citation_snapshot` on `day_adjustments` and `promoted_tier` records.

### Sub-tasks
- [ ] Write `dev/scripts/migrate-citations.ts` (dedupe existing 147 → 109 unique + author 3 new: Halson 2014, Rhea 2003, Kraemer 2002 ACSM). Idempotent. Prints a diff report.
- [ ] Run migration → generates `citations.json` and rewrites each program JSON to add `reference_ids: string[]` alongside legacy `references[]`.
- [ ] Extend `next-app/src/lib/schemas.ts:335-364` (`evidenceBaseSchema.reference_ids`) and `:683-693` (`day_adjustments.citation_snapshot`).
- [ ] Author `next-app/src/lib/engine/citations.ts` (loader, `getCitationById`, `snapshotCitation`).
- [ ] Author `next-app/src/lib/engine/proposal-citations.ts` (proposal-kind → citation-id lookup table).
- [ ] Author `next-app/src/components/citations/CitationRef.tsx` (inline "Source: Author Year ↗" + tap-expand detail with aria-expanded/aria-controls).
- [ ] Wire into `ReadinessProposal.tsx:65-71`, `DayAdjustmentProposal.tsx:92-93`, `TierAdvanceProposal.tsx:39-43`. (These components die in Phase 3 — that's fine, citation lookup logic moves with them into `ProposalCard`.)
- [ ] `MissedSessionPrompt.tsx:88-91` — add `Because:` prefix, no `Source:` line (log-cited only).
- [ ] Extend `acceptDayAdjustment`, `promoteTier`, `advancePhase` in `useStore.ts` to snapshot the citation on Accept.
- [ ] Landing evidence page: add `id={slug}` anchors so `/evidence#coyle_1984` deep-links land in view.

### Verify
- Persona rerun (`npm run e2e:personas`) — `persona-strength/text/01-today.txt` (or the corresponding fresh capture) grep for `Source:` returns ≥ 1 hit.
- Playwright assertion: `<CitationRef>` renders with aria-expanded and expands on click.
- `git grep -l "references:" next-app/public/data/programs/` still finds the legacy refs (one-release-cycle overlap).

### Specialist audit chain (after phase)
- `app-copy-clarity` — write `display_short` / `display_line` strings + `Because:` vs. `Source:` disambiguation.
- `app-accessibility` — verify CitationRef semantics, tap target ≥ 44×44, aria-live wording on Accept.
- `app-visual-craft` — pick the citation-line token (recommended new `text-citation` at 55-65% contrast — Linear pattern).

### Risks
- The one-release-cycle overlap (`references[]` + `reference_ids[]` both present) is a JSON-size bump. Fine for now; drop `references[]` in a follow-up.

---

## Phase 2 — A1 · Overperformer engine bump

**Deliverable:** Engine emits `tm-bump` proposals when ≥ 3 consecutive green days + "felt strong" note keyword. Renders via A2's citation surface (Rhea 2003 meta).

### Sub-tasks
- [ ] `next-app/src/lib/engine/notes.ts` — keyword detector (`felt strong`, `could add weight`, `easy`, `bar felt light`). Return typed signal `NoteSignal[]`.
- [ ] `next-app/src/lib/engine/adapt.ts` — new rule: `evaluateOverperformer(store, program) → TMBumpProposal | null`. Uses `derived_state` for green streak + `NoteSignal` for keyword.
- [ ] Extend proposal union in `next-app/src/lib/schemas.ts` (post-Phase 3, `Proposal` union — until then, wire as a standalone `TMBumpProposal.tsx` alongside the three existing proposals).
- [ ] Program-specific bump amounts (squat +2.5 kg, pull/press +5 kg) — read from program JSON `progression_rules` or hardcode per lift-family.
- [ ] Register `tm-bump → rhea_2003_meta` in `proposal-citations.ts`.
- [ ] Assert `simSummary.day_adjustments_count ≥ 1` for the overperformer persona post-Phase 1 + 2.

### Verify
- Persona rerun — `persona-strength/persona.json.simSummary.day_adjustments_count ≥ 1`.
- `<CitationRef id="rhea_2003_meta" />` visible on the TM-bump card at page load once Phase 3 lands.

### Decision deferred to implementation time
- Should the bump apply immediately or on next-session-start? Default: on next-session-start (safer, respects the current phase's warm-up scheme). Revisit if the persona rerun shows it feels sluggish.

### Risks
- If the engine emits a TM-bump on the SAME day a rehab-safety soften proposal is live, the ProposalStack priority rule (rehab-safety > engine-cited > opportunistic) mutes it. That's correct — rehab-first is a design commitment. But it means the persona rerun for strength may need to sweep symptomatic sessions out of the persona for the bump to fire visibly.

---

## Phase 3 — A5 · ProposalStack + ProposalCard

**Deliverable:** One first-class Today surface for all proposals. Three current per-type components delete. `<ProposalStack>` renders `null` when empty.

### Sub-tasks
- [ ] `next-app/src/lib/schemas.ts:695` — append discriminated-union `Proposal` type and `proposal_history[]` field on `storeSchema`.
- [ ] `next-app/src/lib/proposals/select.ts` — pure `selectProposals(store, program, date): Proposal[]`. Absorbs logic from `SignalsStrip.tsx:42-152`, `DayAdjustmentProposal.tsx`, `ReadinessProposal.tsx`, `TierAdvanceProposal.tsx`, `adapt.ts:evaluateCycleEnd`, `adapt.ts:detectPauseResume`, and Phase 2's `evaluateOverperformer`. Priority sort: rehab-safety > engine-cited > opportunistic.
- [ ] `next-app/src/components/workout/ProposalStack.tsx` — reads `selectProposals()`, renders `null` if empty, else `<ProposalCard>` with a "1 of N" pager.
- [ ] `next-app/src/components/workout/ProposalCard.tsx` — one component per Proposal payload. Accept/Ignore inline, always expanded, `<CitationRef>` for study-cited kinds.
- [ ] `next-app/src/lib/useStore.ts` — new actions `recordProposalOutcome(entry)` + `undoLastProposalOutcome()`. Wrap existing `acceptDayAdjustment` etc.
- [ ] Undo toast — `role="status"` region inline with the stack, 6-second visibility. If a shared `<Toast>` primitive grows here, factor it out.
- [ ] `next-app/src/app/page.tsx:159` — insert `<ProposalStack>` between phase progress line and `HeroStateCard`.
- [ ] `next-app/src/app/page.tsx:172` — remove standalone `<TierAdvanceProposal>` line.
- [ ] `next-app/src/components/workout/SignalsStrip.tsx:42-153` — strip four signal branches (day-adj-proposal, readiness, cycle-end, pause) + expanded-body sections at :214-279. Keep `override`, `hip-check-due`, `check-overdue`, `AssessmentDueBanner`.
- [ ] Delete `DayAdjustmentProposal.tsx`, `ReadinessProposal.tsx`, `TierAdvanceProposal.tsx`, and (if Phase 2 shipped standalone) `TMBumpProposal.tsx`.

### Verify
- `persona-*/dom/01-today.html` grep for `>Accept<` and `>Ignore<` at page load (NOT behind `aria-expanded="false"`).
- Persona rerun — three personas each show correct proposal set, correct priority order, `null` where empty.
- Undo works: Accept → toast → Undo → state reverts, `proposal_history[]` popped.

### Specialist audit chain (after phase)
- `app-visual-craft` — accent economy on the new card, priority-tier left-border colours (rehab amber, engine bronze, opportunistic slate).
- `app-mobile-ux` — bump Accept/Ignore from `min-h-[36px]` to `min-h-[44px]`. Thumb-cradle distance to Accept ≤ 480px.
- `app-accessibility` — `<section aria-labelledby>`, focus-after-Accept jumps to next proposal, pager buttons labelled.
- `app-copy-clarity` — Accept verb per kind ("Apply lighter", "Advance", "Bump TM", "Soften the week"). Single "Ignore" verb. Toast strings.
- `app-motion-perf` — pager slide 150ms, reduced-motion fallback opacity-only.

### Risks
- The pager UX on 2+ proposals is untested with real users. If persona-recover on a red morning ends up with 3 stacked proposals feeling like nag, fall back to stacked-cards (1-2h extra).
- Ignore semantics — does an ignored proposal come back tomorrow? Brief says no by default; revisit if erratic persona regresses.

---

## Phase 4 — B3 · Declarative onboarding

**Deliverable:** `onboarding_steps` in every program JSON, rendered by `<OnboardingRunner>` over a 5-primitive union. Hip-rebuild copy migrates verbatim. Consent-first fix on symptom capture.

### Sub-tasks
- [ ] `next-app/src/lib/schemas.ts:275` — `onboardingStepSchema` + `onboardingStepsSchema`; add `onboarding_steps` field to `programSchema` (~line 389).
- [ ] Delete `next-app/src/components/Onboarding.tsx`.
- [ ] New folder `next-app/src/components/onboarding/`:
  - `OnboardingRunner.tsx` — loads program, renders steps, focus trap, localStorage key.
  - `ScaleAnchorStep.tsx`, `LifeLoadStep.tsx`, `SymptomPrimerStep.tsx`, `ScanAnchorStep.tsx`, `CustomCopyStep.tsx`, `FallbackStep.tsx`.
- [ ] `next-app/src/components/AppShell.tsx:10, 110` — swap import to `OnboardingRunner`.
- [ ] `next-app/src/lib/store.ts:371, 903` — replace single-key `removeItem("program.onboarding.done")` with per-program-key loop.
- [ ] Author `onboarding_steps` on each program JSON:
  - `anterior-hip-rebuild.json` — 3 steps (scale + symptom_primer + custom_copy). Verbatim from current hardcoded.
  - `engine-builder.json` — 3 steps (scale + life_load + custom_copy w/ Zone-1/2 primer).
  - `concurrent-strength-maintenance.json` — 3 steps.
  - `handstand-walk.json` — 3 steps (+ scan_anchor).
  - `rowing-2k-test-prep.json` — 3 steps (+ scan_anchor for target test date).
  - `overhead-mobility.json` — 2 steps.
- [ ] `next-app/src/app/profile/page.tsx` — "Re-run onboarding" row clears the per-program key.
- [ ] Consent-first fix: remove the silent `setDaySymptoms` call at `Onboarding.tsx:81-97` — that medical capture belongs on `/check`, which already has honest consent language. Do NOT re-introduce it in `SymptomPrimerStep.tsx`.

### Verify
- Persona-strength (engine-builder) first-login capture shows the general 2-step flow.
- Persona-erratic (concurrent) same.
- Persona-recover (hip-rebuild) still sees the full 3-step hip flow (migrated verbatim).
- `git grep "setDaySymptoms" next-app/src/components/onboarding/` returns zero.

### Specialist audit chain (after phase)
- `app-copy-clarity` — write copy for 6 programs × 2-3 steps. Enforce ≤ 24-word body budget. Anchor language matches `guide/page.tsx:136` Green/Amber/Red.
- `app-accessibility` — focus trap, ESC dismisses, step counter as `aria-live="polite"`, focus restores to `<h1>Today</h1>` on close.
- `app-visual-craft` — apply the codemodded type ramp; bronze CTA / ghost Skip; no rogue accents.
- `app-mobile-ux` — CTA in bottom-right thumb cradle, scale chips ≥ 44×44, safe-area-inset.

### Cross-phase check
- SaaS-launch alignment: `dev/active/saas-launch/plan.md` Phase 1 called for this exact shape. When SaaS-launch resumes, this phase is the delivered dependency.

---

## Phase 5 — G3 · Simulator matrix re-verification

**Deliverable:** Confirm that engine invariants asserted against the simulator now genuinely pass, not "pass against a dead store."

Background: the v2 simulator had a `program.store.v2` wrong-key bug for months. All engine assertions before the harness fix were potentially asserted against dead state. Personas + assertions may quietly need updates now that A1 + A5 + A2 changed the proposal-generation surface.

### Sub-tasks
- [ ] Rerun `next-app/tests/e2e/simulate-matrix-v2.spec.ts` post-A5.
- [ ] Diff `simSummary.day_adjustments_count` per persona × program combination against pre-Phase 1 baseline. Expected: overperformer × engine-builder jumps from 0 to ≥ 1 (A1 shipping).
- [ ] For each assertion that previously "passed", confirm it still holds; for any that now fail, decide: engine regression or stale expectation?
- [ ] Refresh persona artifacts + regenerate audit screenshots for the audit trail.

### Verify
- `npm run e2e:matrix-v2` green.
- Persona artifact `final-store.json` shape now includes `proposal_history[]` (from A5) and `day_adjustments[date].citation_snapshot` (from A2) on newly-generated fixtures.

---

## Phase 6 — Design-lead flow review

**Deliverable:** End-to-end flow-grade brief from `product-design-lead` covering fresh signup → intake → first session → first proposal → first Accept, post all four feature phases.

### Sub-tasks
- [ ] Dispatch `product-design-lead` with the full user-journey scope from `.claude/agents/product-design-lead.md` §"End-to-end flow reviews".
- [ ] Brief lands at `dev/design-briefs/2026-08-XX-flow-grade-full-journey.md`.
- [ ] Triage the brief's findings into the next post-audit tasks doc.

### Purpose
After A2/A1/A5/B3 ship, the isolated decisions may have compositional bugs (e.g. onboarding step 3 lands on a Today with a live proposal — do both fire? Which wins focus?). The flow review is where cross-phase seams get caught.

---

## Parallelism rules

- Phase 4 (B3) **CAN** run in parallel with Phase 1-3 — it touches no engine, no proposal surface, no schema field they need. If founder wants a second focused session going, this is the fork.
- Phase 5 (G3) **must** wait for Phases 1-4 to land — its whole point is verifying the changed surface.
- Phase 6 (flow review) **must** wait for Phases 1-4. No point flow-grading a partial implementation.

## What this plan explicitly does NOT cover

- History surfacing of `proposal_history[]` — the A5 brief flagged this as a deferred follow-up brief. Row group shape is defined; ship the row group in a later session.
- Multilingual (ET / RU) copy for onboarding steps and citations. Copy currently lives inline in program JSON per the B3 brief — future locale extraction is a separate design pass.
- Landing rewrite. The five broken-promise mechanical items already shipped in commit `586f4d7` via the soften path where appropriate; A2/A1/A5 close the remaining promises via the build path.
- F2 CLS on MissedSessionPrompt — deferred from mechanical sweep, still deferred.

## Rollback plan

Every phase is additive at the data layer. Rollback = revert the phase commit; schema fields go unused, cited proposals fall back to log-cited rendering, onboarding falls back to the single splash. No data migration required to roll back.
