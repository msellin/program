# Tier-Promotion Mechanic — Design + Code Plan

Fixes SEV-1 F-7 (`dev/audits/lifecycle-persona-3-skill.md:122`). Reuses the
Batch A intake baseline snapshot (`IntakeClient.tsx:175-192`) and the
`physical_test` source now supported by the retest evaluator
(`retest-evaluator.ts:52-54, 130-149`). No new engine strategy — everything
threads through data already on the store.

---

## 1 · Design decisions

**1. Retest cadence = per-metric, authored, defaults to 4 weeks.**
Each metric already ships a `cadence_weeks` field
(`handstand-walk.json:1659` = 4 wk; `overhead-mobility.json:460` = 3 wk;
`overhead-mobility.json:491,522` = 5 wk). We honour that number literally:
a metric is "due" when `today - max(last_measured_at, started_at) >=
cadence_weeks * 7`. This lets authors tune per capability (a wall hold
tolerates monthly re-measurement; TGU endurance shifts slower). No global
cadence knob.

**2. Retest is on-demand, prompted, never blocking.** The retest CTA lives
on the Progress tab beside `RetestMetricsPanel` (`progress/page.tsx:370`).
When a metric is overdue, its card grows a "Retest" button; when all
metrics are green (not yet due) the section still shows an "I did a new
test" link. Rationale: forcing a retest week into the plan would collide
with `weekly_template.reference_week_tier_*` (`plan-generator.ts:83-128`)
and break the multi-dim generator's day-of-week routing. The user knows
when they hit a PR; we just make logging it a one-tap surface.

**3. Retest capture writes to the same fields intake wrote to.** The
Batch A fix already committed `capability_profile[testId].measured_value`
+ `last_measured_at` at intake (`IntakeClient.tsx:210-222`) and froze
`program_states[slug].baseline_capabilities` (`IntakeClient.tsx:179-189`).
Retest reuses those slots — updates `measured_value` + `last_measured_at`,
never touches `baseline_capabilities`. `deltaFromBaseline` in
`retest-evaluator.ts:259-266` then renders honest Δ.

**4. Promotion gate reuses the intake evaluator.** `plan_tiers[].condition`
strings (`handstand-walk.json:423, 447, 471, 495`) already parse with
`evaluateCondition` (`intake-tier.ts:206-217`). After a retest, we call
`inferTier(program, slug, intakeAnswers, capabilityValues)` where
`capabilityValues` is built from `capability_profile[testId].measured_value`
across every test the program declares (`handstand-walk.json:338-379`). If
the returned `tier_id` outranks the stored tier (index in `plan_tiers[]`),
we propose promotion. **No new expression grammar.**

**5. Promotion is Accept-first, always.** Following the
`ReadinessProposal` / `DayAdjustmentProposal` pattern
(`ReadinessProposal.tsx:19-75`, `DayAdjustmentProposal.tsx:21-116`) —
render a green banner on Today and Progress: "Your freestand hold is 14s.
Freestand tier's threshold was 5s. Advance to Freestand?" Two buttons:
Advance now / Not yet. Dismissal writes
`program_states[slug].tier_proposal_dismissed_at`; the proposal re-surfaces
next time the user retests upward (never nags on the same data). Accept
calls `setProgramTier` (`useStore.ts:733-742`) — that action already flows
through the multi-dim generator (`plan-generator.ts:64-72, 94-98`).

**6. On promotion, phase state resets to the new tier's
`starting_phase_id`.** `plan_tiers[].starting_phase_id` is authored
(`handstand-walk.json:427, 451, 475, 499`), so the promotion action must
also stamp `program_states[slug].phase_shift_days` (schema already exists
at `schemas.ts:766`) so the new tier's phase-1 starts today, not on the
original authored date. This matches the multi-dim generator's tier→week
lookup (`plan-generator.ts:97-104`) — drills swap on the next day render,
not mid-session. In-flight logs from the previous tier stay untouched (we
don't rewrite `store.logs`).

**7. Demotion is not automatic.** If a retest shows regression across a
tier boundary, we do NOT propose a demotion. Tomás having a bad
freestand-hold day shouldn't yank his plan back to Wall. If a user wants
to move down they use the manual tier picker on the program preview
(`ProgramPreviewClient.tsx:39-97`). Justification: Wulf/Karni evidence
base is asymmetric — motor patterns don't unlearn in one bad session.

**8. `multi-dim.ts` stub stays a stub — for now.** The promotion mechanic
lives in a new `tier-promotion.ts` module + a store action, called from
the retest capture UI. The `AdaptAdapter` interface
(`multi-dim.ts:22-39`) is designed around per-cycle-end evaluation and
per-exercise weight autoreg, neither of which fits skill retest. Keeping
promotion out of the adapter keeps the surface honest.

---

## 2 · User-facing flow — Tomás

**Week 1.** Intake picks Tier B (Wall) because he entered
`wall_hold_max_seconds = 30`, `freestand_hold_max_seconds = 3` — matches
`condition: "wall_hold_max_seconds >= 15 && freestand_hold_max_seconds < 5"`
(`handstand-walk.json:447`). Baseline snapshot writes:
`baseline_capabilities = { wall_hold_max_seconds: 30, freestand_hold_max_seconds: 3, walk_distance_max_metres: 0 }`.
Progress → Retest metrics panel shows three cards, each with "check at week 8".

**Week 4.** He opens Progress. Each retest card now shows a "Retest"
button (its `cadence_weeks = 4` window elapsed). He taps the freestand
card — modal opens showing the exact instructions from
`handstand-walk.json:365-368` ("Warm up 3-5 min. Take up to 5 kick-up
attempts…"). Number input, unit label "s", Save.

The store action `recordCapabilityMeasurement` writes
`capability_profile.freestand_hold_max_seconds = { measured_value: 8, last_measured_at: <now>, confidence: "physical_test", estimated_level: 3 }`.
Panel re-renders: baseline 3s, current 8s, Δ **+5s** (green).

Promotion check runs: current values still fail Tier C
(`freestand_hold_max_seconds >= 5 && walk_distance_max_metres < 5` — passes
first clause; walk is still 0 so this actually matches). Since Tier C's
condition matches AND he's currently on Tier B, a **Tier-advance
proposal** appears at the top of Progress AND on Today:

> **Ready for the next tier?**
> Your freestand hold jumped from 3s to 8s. That clears the Freestand
> tier's gate (freestand hold ≥ 5s). Advancing swaps your weekly focus
> from wall-supported holds to freestand attempts + first walk steps.
> Wrist prep + recovery blocks stay.
> \[ **Advance to Freestand** ]  \[ Not yet ]

Tomás taps Advance. Store writes `program_states["handstand-walk"].tier = "tier_c_freestand"`,
`phase_shift_days` recomputed so `phase_3_first_steps` begins today.
Tomorrow's Today renders `reference_week_tier_c` layout (Mon/Thu = freestand
hold, Tue/Fri/Sun = walk attempts — `handstand-walk.json:1105-1153`).

**Week 8.** Retest again. Free = 14s, walk = 4 steps ≈ 4m. Tier D
condition (`walk_distance_max_metres >= 10`) still fails; no proposal.
Delta cards keep climbing. On Today, YourPlanCard is long gone; the
active surface is the retest deltas.

---

## 3 · Code plan (ordered)

### Must-ship

**A. New module: `src/lib/engine/tier-promotion.ts`** (~70 lines)
Pure functions, no React. Export:
- `nextEligibleTier(program, profile) → { tier_id, tier_index, condition } | null`
  builds `vars` from `capability_profile[testId].measured_value` for every
  `program.intake.physical_tests[].id`, calls `inferTier` (returns the
  highest matching tier), returns it if its index in `program.plan_tiers`
  exceeds the current `program_states[slug].tier` index, else null.
- `dueRetestMetrics(program, profile, todayISO) → RetestValue[]` — filters
  `evaluateRetestMetrics` output by
  `(today - max(last_measured_at, started_at)) / 7 >= cadence_weeks`.

Reuses `evaluateCondition` and `inferTier` from `intake-tier.ts:206, 305`.

**B. Store action: `recordCapabilityMeasurement`** in `useStore.ts` (~30 lines,
insert near `setProgramTier` at line 733). Signature
`(testId: string, value: number, unit?: string) → void`. Updates
`user_profile.capability_profile[testId]` with new `measured_value` +
`last_measured_at = new Date().toISOString()`. Preserves
`estimated_level` and `confidence` if already set; defaults to
`"physical_test"` confidence and current tier baseline for level (same
mapping as `IntakeClient.tsx:200-209`).

**C. Store action: `promoteTier`** in `useStore.ts` (~35 lines). Signature
`(slug: string, newTierId: string, program: Program) → void`. Sets
`program_states[slug].tier`, recomputes `phase_shift_days` so the new
tier's `starting_phase_id` phase's `starts` shifts to today, appends
`{ from_tier, to_tier, at: nowIso, trigger: "retest" }` to a new
`program_states[slug].tier_history: []` (schema addition, see F).

**D. Store action: `dismissTierProposal`** (~10 lines). Writes
`program_states[slug].tier_proposal_dismissed_for = "<tier_id>@<vars_hash>"`
so the same proposal doesn't re-appear on the same data, but a NEW retest
that changes the numbers resets it.

**E. New component: `src/components/progress/RetestCaptureModal.tsx`** (~90
lines). Given `test: PhysicalTest`, shows label + instructions + number
input + Save. Reuses widget from `IntakeClient.tsx:685-707`. On save
calls `recordCapabilityMeasurement`, closes, and triggers a
promotion-eligibility check.

**F. `RetestMetricsPanel` upgrade** (`RetestMetricsPanel.tsx`, +40 lines).
For every metric whose `source === "physical_test"`, look up the matching
`intake.physical_tests[]` entry by id and render a Retest button in the
card header. "Overdue" badge when `dueRetestMetrics` includes the metric.
Opens `RetestCaptureModal`.

**G. New component: `src/components/workout/TierAdvanceProposal.tsx`** (~80
lines). Modeled on `ReadinessProposal.tsx:19-75`. Reads
`nextEligibleTier`. Renders the green banner + Advance / Not-yet buttons.
On Advance calls `promoteTier`. On dismiss calls `dismissTierProposal`.

**H. Mount `TierAdvanceProposal`** on Today above blocks list (in the
existing `today/page.tsx` proposal stack) AND on `progress/page.tsx` above
`RetestMetricsPanel` (`progress/page.tsx:370`). ~8 lines total.

**I. Schema additions in `src/lib/schemas.ts`** (`program_states[slug]` shape,
lines 760-802):
- `tier_history: z.array(z.object({ from_tier: z.string(), to_tier: z.string(), at: z.string(), trigger: z.enum(["retest", "manual"]) })).optional()`
- `tier_proposal_dismissed_for: z.string().optional()`

~10 lines. Backward compatible (both optional).

### Nice-to-have

**J. Progress page "Retest all" bulk flow.** When 3+ metrics overdue,
offer a stacked modal walking through each test in sequence. Saves
taps. ~40 lines.

**K. Attribution line on `TierAdvanceProposal`.** Cite the specific
condition string that unlocked ("freestand_hold_max_seconds ≥ 5 · walk
< 5m — matched"). Uses `InferredTier.rationale` (`intake-tier.ts:301`).
~5 lines.

**L. `overhead-mobility` retest via self-report proxy.** Current
`retest_metrics` on that program (`overhead-mobility.json:454-547`) point
at `shoulder_flexion_supine_deg` etc., but the program has NO
`intake.physical_tests[]` — only the self-report `shoulder_flexion_baseline`
select (`overhead-mobility.json:169-195`). Retest UI would need a
select-widget path in `RetestCaptureModal`. Ship the number path first;
add select path in a follow-up. ~30 lines.

**M. Adapter unification.** Once (A)-(I) ship, `multi-dim.ts:22-39`
becomes reachable by having `shouldEvaluate` return true when
`dueRetestMetrics().length > 0` and `evaluate` return a
`CycleEvaluation` proposing the promotion. Purely refactor — behaviour
already delivered by (A)-(H). ~50 lines.

---

## 4 · Open questions

1. **Overhead-mobility retest is currently self-report only.** All three
   `retest_metrics` reference IDs (`shoulder_flexion_supine_deg`,
   `ohs_hip_below_knee_cm`, `tgu_hold_max_seconds`) that no
   `physical_tests[]` array declares. Do we (a) add a `physical_tests[]`
   array to the JSON, (b) build a self-report retest widget mapping enum
   → number, or (c) treat overhead-mobility as tier-locked-at-intake for
   now? Item L above assumes (b) is the right long-term answer.

2. **Handstand tier C condition has a coverage gap.** `wall >= 15 &&
   free < 5` (Tier B) vs `free >= 5 && walk < 5` (Tier C) — a user with
   `free = 4, wall = 20` sits in B; a user with `free = 6, walk = 6`
   matches both B (free < 5 fails, so no) and C (yes) and D (walk >= 10
   fails, so no) — B/C boundary is clean. But `free = 6, walk = 12`
   matches C AND D. `inferTier` picks the last match
   (`intake-tier.ts:363-376`) → D. Correct behaviour, but worth
   confirming this is intentional at every boundary before the
   promotion loop starts firing.

3. **How aggressive is "Advance now" vs "Not yet" persistence?**
   Proposal (D) dismisses per-`vars_hash`. Alternative: expire the
   dismissal after N days regardless of data. Simpler; slightly noisier.
   Which one?

4. **Tier promotion mid-phase.** Decision 6 above shifts phase-1 to
   today. Alternative: keep current phase-index but re-map to the new
   tier's phase list. The multi-dim generator only reads
   `weekly_template.reference_week_tier_X` (not `phases[]`), so phases
   effectively only drive the phase card on the progress page. Confirm
   we're OK with "advancing tier restarts the phase clock" as the
   surface story.

5. **Tier history retention.** `tier_history` is per-program-state.
   Does the reveal card / attribution UI want to surface it ("You
   advanced from Wall to Freestand at week 4")? If yes, this becomes
   its own micro-feature.
