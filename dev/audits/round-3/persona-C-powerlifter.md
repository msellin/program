# Persona C — The Skeptical Powerlifter (round 3, fresh signup)

## 1. Persona recap

33-year-old regional powerlifter (210 sq / 130 bp / 250 dl). Signs up expecting to run Concurrent Strength Maintenance to buy some aerobic base without letting the squat slip. Reads intake carefully, deliberately tests the capacity gate at 3 days, deliberately answers `has_squat_prs = false` first pass to probe the tokenizer fix from round 2.

## 2. Empty-account tour findings (before picking a program)

Every empty state renders cleanly and no longer leaks anterior-hip content — the round-2 leaks are all patched. Specifically:

- `/` renders `NoActiveProgram` with a "Browse programs" CTA (`src/app/page.tsx:320-338`). No default program is silently stamped.
- `/week` (`src/app/week/page.tsx:68-83`), `/extras` (`src/app/extras/page.tsx:31-46`), `/progress` (`src/app/progress/page.tsx:80-95`), `/report` (`src/app/report/page.tsx:85-100`) all render "Pick a program" empty states with matching copy and CTA styling. Good consistency win over round 2.
- `/coach` renders the "Coming soon" pitch (`src/app/coach/page.tsx:295-357`) regardless of program state. Fine.
- `/guide` renders program-agnostic content. Line 143 mentions "anterior-hip" in passing as an example — acceptable context, not a leak.
- `/programs` correctly hides `anterior-hip-rebuild` from the catalog for non-owner accounts (`programs/page.tsx:34`). Good.

**New empty-state gaps found:**

- **E1. `/extras` renders as a bare page with header + DateNav and nothing else for a CSM user post-intake.** Every CSM block in `blocks[]` is either category `strength` (rendered on Today) or category `run` with no `items[]` (filtered out by `withItems.length` at `extras/page.tsx:82-83`). Since CSM has no accessory or home rehab blocks, both groups collapse to null. Result: post-intake CSM user taps Extras and sees a page that looks broken. Two acceptable fixes: (a) hide the tab when there's nothing to show, or (b) render a "This program has no extras — everything's on Today" line so the tab reads as intentional rather than half-loaded.
- **E2. `/report` post-intake, pre-log:** the Overview section renders with zeros, RetestMetricsPanel renders under "How you're trending against the program" with `—` values, then "Weekly aerobic volume" says "Nothing logged in this range yet." That final message repeats itself in effect three times. Acceptable but noisy for day 1.

## 3. Intake + first-session findings

### Capacity gate (verified)

**Verified working.** `IntakeClient.tsx:87-96` reads `schedule_constraints.session_count_per_week_range[0] = 4` from CSM's JSON. Answering `days_per_week = "3"` produces a hard-block card with the exact "honest refusal" copy the founder wanted:

> "This program needs at least 4 sessions per week. You said 3. Below that, the evidence base doesn't back the outcome we promise…"

The copy names the program's `goals.primary` ("Add aerobic capacity without losing strength") verbatim, which reads honest rather than templated. Bumping to `4` clears the block instantly. This is the tone Persona C bought the app for — worth keeping this exact pattern for future programs.

### Tier-inference boolean fix (verified)

Traced end-to-end for the CSM `has_squat_prs == true` clause. Round-2 G5 asserted: when the user answered `false`, tokenizer emitted `has_squat_prs == true`, `has_squat_prs` resolved to 0 (from boolean coercion in `inferTier`), the identifier `true` on the RHS also resolved to 0 (unknown var → 0), and `0 == 0` matched.

**Now correctly resolves.** `intake-tier.ts:125-131` (parseTerm) and 141-153 (parseCmp) handle `true`/`false` literals as term operands returning 1/0 respectively. Walk-through:

- Answers `{ cardio_hours_per_week: "under_1", has_squat_prs: "false" }` → vars `{ cardio_hours_per_week: 0.5, has_squat_prs: 0 }`.
- Foundation cond `cardio_hours_per_week < 3 && has_squat_prs == true` → `0.5 < 3` = true, `0 == 1` = false → **false**.
- Progression `>= 3 && < 6` and Push `>= 6` both false at 0.5.
- No tier matches → falls back to `plan_tiers[0]` (Foundation) with rationale "No tier matched — defaulted to lowest" (`intake-tier.ts:371-379`).

Same answers with `has_squat_prs = "true"` → Foundation with real rationale `"cardio_hours_per_week < 3 && has_squat_prs == true"`. Both terminal states are Foundation, so the visible outcome is the same for Persona C — but the underlying evaluation is now correct.

- **F1. Coverage gap — persists.** `intake-tier.test.ts` still has zero CSM cases. The round-2 report explicitly asked for one covering `has_squat_prs == true` where user answered false. Add:
  ```ts
  it("csm: false answer to has_squat_prs prevents Foundation match", () => {
    const p = loadProgram("concurrent-strength-maintenance");
    const out = inferTier(p, "concurrent-strength-maintenance",
      { cardio_hours_per_week: "under_1", has_squat_prs: "false" }, {});
    expect(out!.rationale).toContain("No tier matched");
  });
  ```
  Without a lockdown test the fix will silently regress the next time someone touches `evalTokens`.

### Safety gates

`hypertension_unmanaged = "yes"`, `exertional_syncope_history = "true"`, `flaring_tendon = "true"` all correctly hard-block the wizard with the block copy from `program.intake.safety_gates`. No regressions.

### Fresh-signup phase-date bug (round-2 G6, still open)

**F2. Phase.starts is still hard-coded to 2026-08-12.** CSM has no `target_test_date` question, so `phaseShiftDays` in `IntakeClient.tsx:134-144` stays undefined and phases render at author-time dates. Fine for Persona C signing up today (2026-08-13 lands in Phase 1 correctly). Broken for anyone who signs up after 2026-10-06 — `activePhaseFor` returns `phases[phases.length-1]` (`schedule.ts:80`) which is `phase_3_test`. That user's first Today is Week 8's "Retest · 5RM confirm" block. First-run experience: catastrophic. Fix candidates: (a) compute phases from `user_profile.program_states[slug].started_at` for maintenance-block programs the way the hip program treats its anchor date, or (b) shift phases on intake commit to align phase 1 with signup week.

## 4. Post-intake / mid-arc findings (2 weeks simulated)

### CSM Today schedule (verified)

Weekly template resolution via `schedule.ts:blockIdsFromWeeklyTemplate` correctly matches DOW → day-short-name → session for CSM's `weekly_template.week` shape A. Traced across dates:

- Sun → `block_z2_bike` ✓
- Mon → `block_strength_heavy` ✓
- Tue → `block_z2_bike` ✓
- Wed → `block_strength_moderate` ✓
- Thu → `block_4x4_row` ✓
- Fri → `block_z2_row` ✓
- Sat → empty (rest) ✓

Aerobic sessions land on Sun / Tue / Thu / Fri as the persona brief expected. This was broken in round 2 (P1 fix confirmed).

### Retest metrics panel (verified)

**Verified working, one caveat.** `RetestMetricsPanel` reads `program.retest_metrics[]` and renders both metrics for CSM:

- `back_squat_5rm_kg` — source_ref `training_maxes.back_squat_highbar`, parsed correctly by `retest-evaluator.ts:49`, current = user's TM.
- `submax_hr_pace5_bpm` — source_ref `runs[].avg_hr where intensity == 'easy'`, parsed correctly by `retest-evaluator.ts:53-65`. Reads run logs with `intensity === "easy"` and returns latest `avg_hr`.

**Bug R1. Baseline for `training_maxes.*` metrics is always null.** In `evaluateSource` at `retest-evaluator.ts:107-110`, the training_maxes branch returns `{ current: v, baseline: null }` unconditionally — there's no baseline capture. Result: the "Δ from baseline" column on the back-squat card always renders `—`. For Persona C this is the single most important number the app promised and it doesn't compute. Fix: snapshot TM at intake commit (write `program_states[slug].baseline_tms = {...store.training_maxes}` in `IntakeClient.commit`), then in `evaluateSource` return the stored baseline.

**Bug R2. `runs[].avg_hr` baseline is "the first `intensity=easy` log across all history".** For a fresh CSM user, baseline correctly = first Z2 session's HR. But a user re-starting CSM after e.g. an anterior-hip stint has their years-old easy-run HRs as the baseline. Fix: filter by `date >= program_states[slug].started_at` before picking baseline.

**Note.** The `runs[].avg_hr where intensity == 'easy'` filter matches on `run.intensity`, and `RunSlotCard.tsx:41,137` defaults new logs to `intensity: "easy"`. Good — a naïve Z2 log surfaces the metric without extra tapping.

### Progress → Lifts (verified with residual bug)

`page.tsx:40-52` `primaryLiftsForProgram` was rewritten to read from user TMs + program-authored `starting_values_kg`. For CSM this **still falls back to `HIP_PRIMARY_LIFTS`** because:

1. Fresh user has empty `store.training_maxes` → `userLifts = []`.
2. CSM's JSON has **no `training_maxes` field at all** — no `starting_values_kg`. Verified via `python3 -m json.tool` — the program only references TMs inside `retest_metrics` and `block_strength_heavy.items[].scheme`. So `authored = []`.
3. `merged.size === 0` → return `HIP_PRIMARY_LIFTS`.

- **Bug L1. CSM users see `deadlift_conventional` as a TM row.** `HIP_PRIMARY_LIFTS = [back_squat_highbar, front_squat, block_pull_midshin, deadlift_conventional]`. The first three are actually in CSM (block_strength_heavy uses back_squat + block_pull; block_strength_moderate uses front_squat). But `deadlift_conventional` is nowhere in CSM's blocks. Persona sees a TM row for a lift she never trains.
- **Fix L1.** Add a `training_maxes` block to `concurrent-strength-maintenance.json`. Either:
  ```json
  "training_maxes": {
    "starting_values_kg": {
      "back_squat_highbar": 0,
      "front_squat": 0,
      "block_pull_midshin": 0
    },
    "note": "Enter your current 5RM for each. Baseline TMs drive the RPE-7 top-set targets and the week-8 retest."
  }
  ```
  With that authored, `primaryLiftsForProgram` picks the three CSM lifts instead of falling back.

### 6h interference warning (verified)

**Wired for CSM, one bug.** `page.tsx:171-195` reads yesterday's runs, flags `hard` intensity or hard `session_type` values (`threshold`, `race_pace`, `vo2max_intervals`, `2k_test`), and shows an amber "Interference window" banner if today has any strength block.

- **Bug I1. `useStore.getState().store` inside the render function.** Line 173 reads the store non-reactively. It's inside an `(() => {})()` IIFE and doesn't subscribe. Result: if the user logs a hard row *today* and navigates Today's date to yesterday (or Today refreshes for another reason), the banner state won't recompute from the fresh log. It works on hard refresh; it stalls on in-session mutation. Fix: promote yesterday's `runs` to a `useStore` subscription at the top of the component.
- **Copy niggle:** the banner says "Yesterday had a hard aerobic session" — for CSM the Norwegian 4×4 is Thu, so a lift day is either Mon (nothing yesterday) or Wed (yesterday = Tue Z2 = easy). The only in-plan trigger is if the user reschedules the 4×4 to Tue. Still worth having as a guardrail against off-plan hard sessions.
- **Also:** the round-2 U2 (RunSlotCard invites a lunchtime run 3h before Wed lift with no warning) is still open. The 6h banner only fires the day AFTER a hard cardio, not when a user is ABOUT to log one within 6h of a scheduled lift. Fine for phase 1 (no 4×4 yet); becomes a real footgun in phase 2.

### Notes-signal engine (verified)

**Ungated, working.** `SignalsStrip.tsx` and `DayAdjustmentProposal.tsx` no longer contain `strengthPrimaryPrograms` sets. `daySignals(store.logs[date])` runs for any program. Traced:

- Logging "squat felt heavy" as Mon's note → `STIFF` regex matches "heavy" → `fatigue: "elevated"` (not "high" because no external_load co-occurs) → `proposedLoadMultiplier(sig)` returns `{multiplier: 0.95, reason: "…"}` (elevated fatigue proposes ×0.95).
- The proposal renders on Tue as an amber "Not feeling 100%?" card with Accept/Not today buttons.
- Accepting writes `day_adjustments[Tue]` with `load_multiplier: 0.95, source: "notes"` — the Wed strength block picks it up via `suggest.ts` scaling.

Round-2 B4 (silent throwaway) is resolved.

- **Bug S1. Signal walks back 1-2 days but SignalsStrip pill's `label` only shows the current-day proposal state.** `SignalsStrip.tsx:63-76` computes signals from `daySignals(store.logs[date])`, walks back 1-2 days if today has nothing, but the pill copy says "Not feeling 100%?" without acknowledging that the trigger was yesterday's note. Minor UX opacity.

### YourPlanCard reveal

Fires exactly once post-intake per program. `buildRevealCopy` reads `tier`, `intake_answers`, `capability_profile` and produces `headline`, `tier_line`, `schedule_line`, `phase_lines`. Persona lands on Foundation → tier_line reads "Foundation tier — you're in the maintenance-first band". Fine, no leaks.

## 5. Regression check

Everything the round-2 report flagged as a fix target has been touched:

- Notes-signal ungate: done.
- Boolean tokenizer: done, but untested (see F1).
- Progress > Lifts hardcode: partially done — deadlift_conventional still leaks into CSM (see L1).
- CSM's Today rendering aerobic days: done.
- RetestMetricsPanel exists: done, but baseline for `training_maxes.*` is null (see R1).
- 6h interference banner: done, non-reactive (see I1).

**Nothing round 1 fixed appears to have regressed.** The empty-state work is thorough — no route leaks a founder default. Skimming diffs against round 2, the removal of `strengthPrimaryPrograms` from SignalsStrip is clean; no new gate has replaced it.

## 6. Copy issues

- **C1.** `report/page.tsx:187-190` — "Symptom scores are the user's own 0–10 ratings from a daily morning check" is hip framing on the non-hip branch too. A CSM user reads it as "why is symptom scoring the anchor?" Rewrite for the non-hip case: "Load values are logged workout data. Aerobic sessions include HR and duration; strength sessions include weight × reps × RPE."
- **C2.** `progress/page.tsx:402-407` — `InfoSheet` for "Symptom vs load" reads "The KPI no other strength app tracks: peak symptom score alongside top-set kg over time." This InfoSheet is gated inside `activeSlug === "anterior-hip-rebuild"` — so a CSM user never sees it. But the button that opens it (`page.tsx:365-373`) is also gated to hip. Fine, no leak, but the copy would be perfect for CSM if we plumbed the same "trend line" idea to submax HR + TM.
- **C3.** Round-2 C4 (report page framing) still applies: "not a diagnosis" reads odd for a powerlifter with no clinical context.
- **C4.** CSM safety gate for `flaring_tendon = "true"` uses the copy "Running-based intervals will amplify a flaring tendon." Persona might reasonably respond "I don't run — I row." The gate applies to interval work broadly; the copy is running-specific. Suggest: "Interval work (including Norwegian 4×4 on any modality) will amplify a flaring tendon. Consider deferring, or the strength-only variant while it settles."

## 7. Priority fix list

1. **L1 — Author `training_maxes.starting_values_kg` on CSM.** One JSON patch. Eliminates the deadlift-that-doesn't-exist row and gets Persona C's TM editor honest on the three lifts CSM cares about.
2. **R1 — Snapshot baseline TMs at intake commit.** Without this, the whole "your squat won't slip" retest surface always renders `Δ —`. Persona C's headline question is unanswerable. Small patch in `IntakeClient.commit` + `retest-evaluator.evaluateSource`.
3. **F2 — Compute phase dates from `started_at` for maintenance-block programs.** Any user signing up outside the authored window silently lands in Phase 3. Latent time bomb; fix before any external signup.
4. **F1 — CSM tier-inference tests.** Two cases (has_squat_prs = false, has_squat_prs = true × cardio_hours_per_week = under_1) lock down the tokenizer fix.
5. **R2 — Scope `runs[].*` retest queries to `date >= started_at`.** Prevents years-old easy-run HR from anchoring the baseline for a returning user.
6. **I1 — Make the interference-window banner reactive.** Promote `useStore.getState()` to a hook subscription so mid-session mutation lands.
7. **E1 — Non-empty state on `/extras` for CSM.** Either hide the tab or render a "This program uses Today for everything" line.
8. **Interference pre-flight for RunSlotCard.** If the user's about to log a hard cardio and Today has a scheduled strength block, warn *before* the log, not the morning after.
9. **Surface `program.principles` and `evidence_base.session_rationale`.** Persona C bought the app for Schumann 2022 SMD −0.28 honesty; that number never reaches a screen. Progress → Insights or ProgramPreview both viable homes.
10. **C1 + C4 — Retune the report framing and flaring-tendon copy** for non-hip contexts.

## 8. Positive callouts

- **P1. The capacity gate is the best refusal copy in the app.** "Below that, the evidence base doesn't back the outcome we promise" — reads like a coach who read the papers, not a marketer.
- **P2. Empty states are now consistent** across `/`, `/week`, `/extras`, `/progress`, `/report`. Same H1 shape, same CTA styling. Round-2 leaks are all sealed.
- **P3. RetestMetricsPanel exists and renders program-agnostic.** The scaffolding is right; the wiring bugs (R1, R2) are patchable.
- **P4. Notes-signal proposal is now universal** and its rehab-safety copy ("Rehab & mobility work stays as prescribed regardless of your choice") is exactly the reassurance Persona C needs to trust an adaptive system.
- **P5. CSM weekly-template rendering** on Today and Week matches the authored intent for every DOW. Aerobic sessions arrive on the right days with duration and note.
- **P6. Coach starter prompts for CSM** at `coach/page.tsx:28-33` are program-specific and load-bearing ("Is my back squat still holding at pre-block level?"). Even in "Coming soon" state, seeing this prompt list would make Persona C stick around.
- **P7. RunSlotCard 2K test path** correctly defaults intensity to "easy", supports session_type = 2k_test → avg_pace_500m_seconds derivation, guards against the round-2 G1 duplicate-total_seconds overwrite (`RunSlotCard.tsx:143`).
- **P8. Safety gates render as hard blocks** with the JSON-authored copy, no bypass path.

---

**Bottom line as this persona:** the empty-state work is a real improvement. The tier-inference and 6h-banner fixes both land. The retest surface exists, which was the round-2 blocker. What's left is two data-shape gaps (CSM missing `training_maxes.starting_values_kg`, baseline TM never snapshotted) and one time-bomb (hard-coded phase dates). Fix those three and Persona C's "how do I know my squat isn't slipping?" gets a real answer on Progress every time she opens the app.
