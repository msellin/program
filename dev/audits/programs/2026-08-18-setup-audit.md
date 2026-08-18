# Program Setup Audit — 2026-08-18

Vector A — JSON authoring vs engine expectations. Read-only, no code or JSON modified.

## Executive summary

9 programs audited. Two P0 rendering bugs and one P0 tier-condition bug found — all in the four multi-tier / multi-dimensional programs (`handstand-walk`, `first-strict-pullup`, `muscle-up`; string-quoted comparators in `muscle-up`). The pattern is the same in all three skill programs: multiple phases with identical `starts` dates but different intended tiers, and the engine's `activePhaseFor()` uses `.find()` (first match wins) so Tier B/C/D users get Tier A's `phase.blocks` filter and see the wrong drills. A recurring P1 pattern across the correlated_tier programs is `retest_metrics.source_ref` querying `runs[]` fields that don't exist on the run schema (`pace_500m`, `session_type`, `avg_pace_500m_seconds`, `week_in_program`) — those retest cards will always render as `null`. Also a manifest/program `status` mismatch on `anterior-hip-rebuild` (ACTIVE vs REFERENCED). Other checks pass cleanly.

## Per-program findings

### anterior-hip-rebuild

- **P1** — `phases[]` leaves a 15-day gap between `phase_4_cycles_3_4_test.ends` (2026-12-20, `anterior-hip-rebuild.json:380`) and `phase_5_hatch_specialise.starts` (2027-01-05, `anterior-hip-rebuild.json:400`). Documented as `note_holiday_gap` at `anterior-hip-rebuild.json:412`. The engine hardcodes this exact gap in `next-app/src/lib/engine/schedule.ts:91` (`HIP_HOLIDAY_GAP`) — so it's handled, but the coupling between JSON dates and engine constant is fragile. Any future date shift in the JSON silently breaks the guard.
- **P2** — Manifest lists `"status": "REFERENCED"` (`manifest.json:24`) but `anterior-hip-rebuild.json:4` declares `"status": "ACTIVE"`. Inconsistent; the "how do I know if this program is shipped" answer depends on where you look.
- **P2** — 9 blocks in `blocks[]` are unreferenced by any `weekly_template` layout or default phase: `block_reintro`, `block_reintro_light`, `block_eval_squat`, `block_eval_pull`, `block_hatch_a`, `block_hatch_b`, `block_smolov_jr_squat`, `block_peak_singles`, `block_runs`. These are only reached via the hardcoded phase-name switch in `schedule.ts:297-321` (`phase_1_rebuild_evaluate`, `phase_5_hatch_specialise`, `phase_6_peak_test`). If a maintainer edits a phase's `blocks[]` list expecting it to gate what appears, it won't — hip's schedule is code-driven, not JSON-driven for these phases.
- Passes: block references from `weekly_template.week[]` all resolve, retest_metrics source_ref = `training_maxes.back_squat_highbar` etc. all resolve, onboarding_steps have no `cta_href` so no dead links, `plan_tiers` is absent (correct — this is a personal program), progression_rules and daily_log_schema shapes match `schemas.ts`.

### engine-builder

- **P1** — `plan_tiers[0].condition` uses `!can_sustain_20min_easy` at `engine-builder.json:414`. The tier-condition parser at `next-app/src/lib/engine/intake-tier.ts:69-73` supports unary `!`. The intake question `can_sustain_20min_easy` at line 167 is `type: "boolean"`. Boolean answers coerce to 1/0 in `intake-tier.ts:361-368` — fine. But if the user hasn't answered yet, `vars[qid]` is undefined → `0` (falsy) → `!0 = 1 = true`. So the condition matches Foundation even when the user hasn't answered the readiness gate. This mis-tiers a fresh session before any answers. Same issue for the numeric guards `cardio_hours_per_week < 1` and `recent_z1_max_minutes < 25` — both default to 0 (undefined), both trip the Foundation condition. Not fatal (Foundation is the safe default), but "fell into Foundation because the user didn't fill anything in" is indistinguishable from "chose Foundation".
- **P1** — `retest_metrics[0].source_ref` = `"runs[].avg_hr where intensity == 'easy' and pace_500m == 120"` (`engine-builder.json:1587`). `pace_500m` is **not** a field in `runLogSchema` at `next-app/src/lib/schemas.ts:761-774`. The runs query parser at `retest-evaluator.ts:87-101` reads unknown fields via `Record<string, unknown>` lookup — returns `undefined` → the filter comparison `String(undefined) !== "120"` is always true → **no run ever matches, current always renders as `null`**. Submax HR retest for engine-builder is broken.
- **P2** — `retest_metrics[1].source_ref` = `"morning_resting_hr"` with `source: "physical_test"` (`engine-builder.json:1619`). This resolves via `retest-evaluator.ts:130-149` against `capability_profile["morning_resting_hr"].measured_value`. Intake declares `physical_tests[0].id = "resting_hr_morning"` (note the reversed order: `resting_hr_morning` vs `morning_resting_hr`). ID mismatch — the value stored under the test-id key won't be found by the metric's source_ref key. This is a straight typo / naming mismatch.
- Passes: phases[] cover 2026-01-05 → 2026-03-01 with no gaps or overlaps (8 consecutive weeks). weekly_template uses "Shape B" (`week_N.layout`) which schedule.ts:196-226 supports. All block IDs in weekly_template resolve to blocks[]. Safety gates all reference declared questions with matching option values. Plan tiers cover mutually-exclusive ranges (though see P1 above about default 0 behavior). Onboarding_steps have no cta_href.

### concurrent-strength-maintenance

- **P1** — `retest_metrics[0].source_ref` = `"training_maxes.back_squat_highbar"` (`concurrent-strength-maintenance.json:901`). Resolves cleanly against `store.training_maxes` per `retest-evaluator.ts:119-129`. But `retest_metrics[1].source_ref` = `"runs[].avg_hr where intensity == 'easy'"` at line 935. This DOES work (both fields exist on runLogSchema). No pace/intensity discriminator between "easy pace-5 session type" vs any easy run — a Z2 warm-up on strength day pollutes the metric. Not a JSON bug per se, but the "at pace-5 (2:00/500m)" in `display_name` is misleading — the source_ref can't distinguish anchor-pace tests from casual Z1 flushes.
- **P2** — `retest_metrics[0].targets[0].baseline: 0` (`concurrent-strength-maintenance.json:906-925`). All three tiers have `baseline: 0`. The retest evaluator ignores `baseline` on the target and computes baseline from `store.user_profile.program_states[slug].baseline_training_maxes` (`retest-evaluator.ts:124-127`). So the authored `baseline: 0` is inert. Not broken, just cargo-culted.
- **P2** — `plan_tiers[0].condition` uses `cardio_hours_per_week < 3 && has_squat_prs == true` (`concurrent-strength-maintenance.json:57`). `cardio_hours_per_week` is a `select` at line 128 with values `"under_1"`, `"1_3"`, `"3_6"`, `"over_6"` — strings, not numbers. `intake-tier.ts:227-262` provides `SELF_REPORT_TO_NUMERIC["concurrent-strength-maintenance"].cardio_hours_per_week` mapping, so this works. Verified. But it required adding a per-program entry to an engine-side map — not JSON-only. If somebody adds another `select`-encoded numeric to this file expecting the engine to just handle it, they'll break tier inference silently.
- Passes: phases[] cover 2026-08-12 → 2026-10-06 with no gaps or overlaps. weekly_template uses Shape A (`week[]`). All block IDs resolve. Safety gates values (`"yes"`, `"true"`) match the declared option / boolean formats.

### handstand-walk

- **P0** — **Phase overlap across tiers causes wrong-tier drill rendering.** Phases at `handstand-walk.json:634, 652, 671, 690, 709`:
  - `phase_1_foundation_prep`: 2026-01-12 → 2026-01-25 (Tier A intent)
  - `phase_2_wall_to_free`: 2026-01-12 → 2026-02-08 (Tier B intent)
  - `phase_3_first_steps`: 2026-01-12 → 2026-02-08 (Tier C intent)
  - `phase_4_variability`: 2026-01-12 → 2026-03-08 (Tier D intent)
  - `phase_all_weeks_3_8`: 2026-01-26 → 2026-03-08 (all-tier post-acquisition)

  All four tier-specific phases start on **the same day**. `activePhaseFor()` at `next-app/src/lib/engine/schedule.ts:83-84` uses `.find()` — returns the **first** matching phase in `phases[]` array order. Result: a Tier B user active on 2026-01-15 gets `phase_1_foundation_prep` returned, whose `phase.blocks` is `["block_wrist_prep", "block_skill_A_kinoshita", "block_recovery"]`. The multi-dim plan-generator at `plan-generator.ts:110-150` then filters the Tier B `reference_week_tier_b` layout against that phase.blocks — the tier's intended `block_skill_A_wall_hold` is **not** in phase_1's block list, so the substitution logic at lines 130-143 falls back to the first `block_skill_A_*` in `phase_1.blocks[]` = `block_skill_A_kinoshita`. **Tier B users see Tier A drills for the first two weeks.**

  Same pattern between 2026-01-26 and 2026-02-08: phase_1 has ended, phase_2 (Tier B) and phase_3 (Tier C) match first — Tier D users get Tier B blocks. Between 2026-02-09 and 2026-03-08: only phase_4 (Tier D) and phase_all_weeks_3_8 match; Tier A/B/C users get Tier D's `block_skill_A_variability` (pirouettes, precision walks) — a dangerous mis-render for a Tier A wall-holder.

  Fix requires either (a) authoring one canonical phase per calendar window with all tiers' blocks in `phase.blocks`, and letting the multi-dim generator's category-swap pick correctly, or (b) engine changes to select phase by tier_id.

- **P1** — `phase_0_bail_out_prep` (`handstand-walk.json:602`) has 2026-01-05 → 2026-01-11, then `phase_1_foundation_prep` starts 2026-01-12 (`:637`). No gap — good — but `phase_gates[]` at `handstand-walk.json:2018-2031` conditionally skips phase_0 when `bail_out_readiness == "can_exit_reliably"`. The gating logic isn't in schedule.ts's `activePhaseFor()`, which just walks the phases[] array. So a user who *should* skip phase_0 will still get phase_0 blocks on 2026-01-05..2026-01-11 (activePhaseFor picks first match). The `phase_gates` field is declared but not consumed by the schedule / plan-generator code path I can see. Dead code path — the intent doesn't ship.
- **P1** — `retest_metrics[0-2].source_ref` = `"wall_hold_max_seconds"` etc. (`handstand-walk.json:1877, 1909, 1941`) with `source: "physical_test"`. These resolve via `retest-evaluator.ts:130-149` against `capability_profile[testId].measured_value`. The intake's `physical_tests[].id` values at `handstand-walk.json:369, 431, 439, 447` include `wall_hold_max_seconds`, `freestand_hold_max_seconds`, `walk_distance_max_metres` — all match. Passes.
- **P2** — 4 defined blocks (`block_bail_wall_cartwheel_exit`, `block_bail_quarter_pirouette`, `block_bail_tuck_forward_roll`, `block_bail_mat_falls`) are unreferenced by any `reference_week_tier_*.layout`. They're referenced from `phase_0_bail_out_prep.blocks` at `handstand-walk.json:618-623` but the multi-dim generator resolves via weekly_template first, then filters against phase.blocks — so bail-out blocks never appear in a user's Today unless the layout includes them. Compounds with the P1 above.
- Passes: safety_gates all reference declared questions with matching values; `unsafe_values: ["true"]` correctly matches boolean answer serialisation (IntakeClient stores boolean answers as string `"true"` per `IntakeClient.tsx:1040`). onboarding_steps `cta_href: "/intake"` at `:1977` — see cross-program pattern below.

### concurrent-strength-maintenance (rechecked)

No additional findings beyond above.

### overhead-mobility

- **P2** — Same phase-overlap risk as handstand-walk in principle, but avoided here because `phases[]` at `overhead-mobility.json:332-378` are **sequential** (no overlapping tier phases) — the same phase serves all tiers, and the multi-dim generator picks the tier's reference_week. No P0.
- **P2** — `retest_metrics[0-2].source_ref` = `shoulder_flexion_supine_deg`, `ohs_hip_below_knee_cm`, `tgu_hold_max_seconds` (`overhead-mobility.json:642, 673, 704`) with `source: "physical_test"`. Intake declares `physical_tests[].id` at `overhead-mobility.json:280, 288, 296` = `shoulder_flexion_supine_deg`, `ohs_hip_below_knee_cm`, `tgu_hold_max_seconds`. All match. Passes.
- **P2** — Safety gates use `unsafe_values: ["true"]` and `["yes"]` at `:307-328` — both work per boolean/select answer serialisation.
- **P2** — onboarding_steps do NOT include a `cta_href` — clean.
- Passes: phases 2026-08-13 → 2026-10-21 sequential and gap-free; weekly_template uses `reference_week_*` shape supported by multi-dim generator; all block IDs resolve; plan_tiers conditions reference `shoulder_flexion_supine_deg` / `shoulder_flexion_loaded_deg` — these come from physical_tests directly per the numeric-answer path in `intake-tier.ts:349-355`. Note `shoulder_flexion_loaded_deg` (Push tier condition, `:66`) is NOT declared as a physical_test — it defaults to 0 in `vars` → Push tier condition `>= 175` is never true → **Push tier is unreachable**. That's a P1 upgrade.
- **P1** — `plan_tiers[2].condition` (`overhead-mobility.json:66`) references `shoulder_flexion_loaded_deg` but no intake question or physical_test provides this variable. `intake-tier.ts:322-377` will leave it undefined → 0 → never `>= 175`. **Push tier can never be inferred**; users who should qualify for Push land on Progression.

### rowing-2k-test-prep

- **P1** — `retest_metrics[0].source_ref` = `"runs[].total_seconds where modality == 'row' and session_type == '2k_test'"` (`rowing-2k-test-prep.json:475`). `session_type` is **not** in `runLogSchema` (`schemas.ts:761-774`). `modality` is aliased to `activity_type` in `retest-evaluator.ts:92-95` — good. But `session_type` filter will never match any run because the field doesn't exist. **2K time retest card never populates.**
- **P1** — `retest_metrics[1].source_ref` = `"runs[].avg_pace_500m_seconds where session_type == 'threshold'"` (`:507`). Both `avg_pace_500m_seconds` (the field being read) and `session_type` (the filter) are absent from `runLogSchema`. **Threshold pace retest card is unreachable.**
- **P1** — `phase_3_taper_test` (`rowing-2k-test-prep.json:325`) declares `"is_taper": true` and `"block_replacements_final_week": {"block_race_pace_row": "block_easy_recovery"}` at `:339-343`. The schedule.ts code at `:183-192` handles taper replacements via `weekly_template.week[]` (Shape A). This program uses Shape A ✓. So the replacement should fire for dates within 7 days of `phase.ends` (2026-09-23). Works if user's real dates align. Passes structural check.
- **P2** — `retest_metrics_mid_block[]` at `:999` references `metric_id: "threshold_pace_500m"` but the actual metric is `"threshold_pace_500m_seconds"` (`:502`). Name mismatch — the mid-block reference won't link back to the metric it's supposed to be a checkpoint of. Whether the app consumes this field at all is unclear.
- Passes: phases 2026-08-13 → 2026-09-23 sequential and gap-free; weekly_template Shape A with `push_tier_override` correctly declared; all block IDs resolve; safety_gates values match declared options / boolean serialisation. plan_tiers conditions reference `current_2k_seconds`, correctly mapped via `SELF_REPORT_TO_TEST_VAR["rowing-2k-test-prep"]` in `intake-tier.ts:290-296`.

### first-strict-pullup (PROVISIONAL)

- **P0** — **Same phase-overlap bug as handstand-walk.** Phases at `first-strict-pullup.json:444, 463, 484, 505, 526`:
  - `phase_1_hang_and_row_base`: 2026-01-05 → 2026-02-01
  - `phase_2_negatives_and_assist`: 2026-01-05 → 2026-03-01
  - `phase_3_first_reps`: 2026-01-05 → 2026-03-01
  - `phase_4_volume_variety`: 2026-01-05 → 2026-03-01
  - `phase_all_weeks_5_8_interleaved`: 2026-02-02 → 2026-03-01

  All four tier phases start same day. `activePhaseFor()` returns `phase_1_hang_and_row_base` for any date in 2026-01-05..2026-02-01. Tier B/C/D users get Tier A's phase.blocks filter → wrong drills rendered. Same fix path as handstand-walk.

- **P1** — `retest_metrics[0-1].source_ref` = `strict_pullup_max_reps`, `dead_hang_max_seconds` (`first-strict-pullup.json:1434, 1472`) with `source: "physical_test"`. Both are declared in `physical_tests[]` at `:292, 267`. Match. Passes.
- **P2** — Only one safety gate declared (`acute_shoulder_injury` at `:322-329`). The intake also has `shoulder_pain_overhead`, `elbow_tendon_pain`, `bodyweight_kg` as declared risk-adjacent fields but no gate ties to them. Design choice, not a bug.
- Passes: block IDs in weekly_template resolve; safety_gate `unsafe_values: ["true"]` works with boolean answers.

### muscle-up (PROVISIONAL)

- **P0** — **Same phase-overlap bug.** All three phases 2026-01-05 → 2026-03-01 (`muscle-up.json:441, 461, 481`). `activePhaseFor()` always returns `phase_1_dip_and_false_grip_base` → Tier B/C users get Tier A blocks filter.
- **P0** — **Tier conditions use string literals which the tier-condition parser does NOT support.** `plan_tiers[1].condition` (`muscle-up.json:389`) = `"strict_pullup_max_reps >= 3 && ring_dip_max_reps >= 3 && muscle_up_experience == 'never'"`. The tokenizer at `intake-tier.ts:30-94` returns `null` on encountering `'` (unrecognized character, line 91). `evaluateCondition` returns `false` on null tokens (`:210-211`). So **Tier B never fires**. Same for Tier C at `:410`: `"muscle_up_experience == 'one_sometimes' || muscle_up_experience == 'one_reliable'"` — never fires. Result: only Tier A can match (via its numeric-only condition at `:368`), and if that doesn't match either, the fallback at `:396-404` picks Tier A. **The entire Tier B / Tier C tree is unreachable via intake inference.**
- **P1** — `intake.safety_gates` at `muscle-up.json:333-348` uses `question_id: "strict_pullup_count"` with `unsafe_values: ["under_3"]`, and same for `ring_dip_count`. Those question IDs and option values are declared in `intake.questions[]` at `:112, 120, 141, 149`. This works. Passes structural check.
- **P1** — `retest_metrics[0].source_ref` = `"strict_ring_muscle_up_reps"` with `source: "physical_test"` (`muscle-up.json:1305`). Intake's `physical_tests[]` at `:270-310` declares `strict_pullup_max_reps`, `ring_dip_max_reps`, `false_grip_hang_max_seconds`, `false_grip_pullup_max_reps`, `ring_support_lockout_seconds`. **`strict_ring_muscle_up_reps` is NOT a declared physical test.** The retest card for muscle-up progress will always be null.
- **P2** — `retest_metrics[1].source_ref` = `false_grip_hang_max_seconds` — declared. `retest_metrics[2].source_ref` = `ring_dip_max_reps` — declared. Both OK.

### engine-builder-block-2 (PROVISIONAL)

- **P1** — `plan_tiers[0].condition` = `"block_1_completed == 'yes_lapsed' || block_1_completed == 'no_but_equivalent' && current_cardio_hours_per_week < 4"` (`engine-builder-block-2.json:370`). **Same `'string'` literal problem as muscle-up.** Tokenizer returns null on `'` → condition always evaluates false → Foundation tier never fires via inference (falls through to first-tier default at `intake-tier.ts:396-404`). Same for Progression at `:382` and Push at `:394`. **Every tier condition in this program is currently unreachable via the standard evaluator; users always land on the fallback (first tier = Foundation).**
- **P1** — `retest_metrics[0].source_ref` = `"threshold_test_20min"` with `source: "physical_test"` (`engine-builder-block-2.json:1492`). Intake's `physical_tests[]` at `:281-289` declares `threshold_test_20min`. Match. Passes.
- **P1** — `retest_metrics[1].source_ref` = `"runs[].avg_hr where intensity == 'easy' and week_in_program in [1, 4, 8]"` (`:1523`). `week_in_program` is not a run field AND the `in [1, 4, 8]` syntax is not supported by the where-clause parser (`retest-evaluator.ts:66-71` only accepts `==` equality). The parser silently drops the malformed clause via the regex miss at `:68`, leaving just `intensity == 'easy'` — so the metric will match *any* easy run and current/baseline become misleading (any easy Z2 run, whenever, wherever, counts). Not "broken" but not correct either.
- **P1** — `retest_metrics[2].source_ref` = `"morning_resting_hr"` (`:1555`) with `source: "physical_test"`. `physical_tests[0].id` is `resting_hr_morning` (`:265`) — **same reversed-name typo as engine-builder Block 1**. Resting HR retest card returns null.
- **P1** — `phase_0_re_entry_ramp` (`engine-builder-block-2.json:417`) has `starts: 2026-01-05, ends: 2026-01-18`. `phase_1_intro_week` (`:430`) also starts `2026-01-05, ends: 2026-01-11`. **Direct overlap.** Foundation tier is supposed to run phase_0; Progression / Push skip it. But `activePhaseFor()` returns phase_0 (first match) for any user on 2026-01-05..2026-01-11. Push-tier users get the re-entry ramp they were supposed to skip.
- **P2** — `phase_7_taper_and_retest` at `:536` has `ends: 2026-03-15` but preceded by `phase_6_threshold_ceiling` ending 2026-03-01. `phase_7` starts 2026-03-02 — no gap, good. But `phase_9`/`phase_10` weeks are declared in `weekly_template` (`week_9`, `week_10` at `:965, 990`) while no `phase_9` or `phase_10` exists in `phases[]`. If `computeProgramWeek` (`schedule.ts:240-256`) returns 9 or 10, no phase matches that date (all phase.ends fall before 2026-03-16), fallback = last phase = phase_7 — which does declare the right blocks in `.blocks[]`. Works by luck.
- Passes: block IDs in weekly_template resolve; safety_gates values match declared question serialisation.

## Cross-program patterns

1. **String-literal comparators in tier conditions break silently.** `muscle-up.json` and `engine-builder-block-2.json` both use `variable == 'string_value'` in `plan_tiers[].condition`. The tokenizer at `intake-tier.ts:30-94` treats `'` as an unrecognized character and returns null → evaluator returns false. Any tier with a string-quoted comparator never fires. This is a JSON-authored bug (the syntax is undocumented) but the engine gives no diagnostic — the tier just silently defaults. **Two programs materially affected: muscle-up (Tier B/C unreachable), engine-builder-block-2 (all three tiers unreachable via inference).**

2. **Overlapping phase `starts` dates in multi-tier skill programs render wrong-tier drills.** handstand-walk, first-strict-pullup, muscle-up all author one phase per tier with the **same** `starts` date. `activePhaseFor()` at `schedule.ts:83` uses `phases.find()` — first match wins — so Tier A's phase is always chosen. The multi-dim plan-generator's phase.blocks filter (`plan-generator.ts:121-150`) then substitutes Tier A's drills into higher-tier users' sessions. **Three programs with this bug.** Either the JSON needs one canonical phase per calendar window (with union of all tiers' blocks) or the engine needs tier-aware phase selection.

3. **`runs[].source_ref` querying non-existent fields.** engine-builder, rowing-2k-test-prep, engine-builder-block-2 reference `pace_500m`, `session_type`, `avg_pace_500m_seconds`, `week_in_program` — none present on `runLogSchema` (`schemas.ts:761-774`). Filter regex silently drops malformed clauses or matches nothing. Retest cards render as null instead of showing useful progress. **Four correlated_tier programs affected.**

4. **`physical_test` id vs `retest_metrics.source_ref` name mismatches.** engine-builder and engine-builder-block-2 both declare `physical_tests[0].id = "resting_hr_morning"` but query it as `"morning_resting_hr"` in `retest_metrics.source_ref`. Straight typo pattern; resting-HR retest card is broken in both engine-builder programs.

5. **Tier-inference relies on a per-program engine-side map (`SELF_REPORT_TO_NUMERIC` in `intake-tier.ts`).** first-strict-pullup and muscle-up ship select-encoded numeric answers (`under_10s`, `10_20s`, `20_45s`, etc.) but neither has an entry in the map at `intake-tier.ts:227-277`. Their tier conditions reference only physical_test IDs (numeric), so this happens to work — but if a future condition references the self-report question directly (e.g. `dead_hang_seconds_selfreport >= 20`), tier inference will fail silently. Fragile coupling.

6. **`plan_tiers[].condition` defaults every undefined variable to 0.** This means the *lowest* / most conservative tier always fires on a partially-answered intake. Not necessarily wrong, but "user landed on Foundation because they didn't answer" is indistinguishable from "user qualifies for Foundation".

## What passed

- Every program has clean JSON syntax (validated implicitly by successful Python parse).
- All `weekly_template.week[]` / `reference_week_*.layout[]` / phase.blocks[] references resolve to defined block IDs (no dangling block names).
- All `intake.safety_gates[].question_id` values reference declared questions.
- All `intake.safety_gates[].unsafe_values` entries match either a declared `options[].value` (for select questions) or the boolean serialisation `"true"` / `"false"`.
- Boolean-answer safety gates work correctly per the IntakeClient serialisation at `IntakeClient.tsx:1040`.
- Programs with `weekly_template.push_tier_override` correctly declare it (rowing-2k-test-prep).
- Programs with `is_taper` + `block_replacements_final_week` correctly declared (rowing-2k-test-prep).
- Manifest `id` / `slug` fields match program.json filenames in all 9 cases.
- All programs' onboarding_steps use `/intake` if present — and that route DOES exist at `next-app/src/app/programs/[slug]/intake/` (a program-scoped route). The bare `/intake` path in onboarding_steps `cta_href` is a relative-to-program-slug convention; the app resolves it correctly (spot-checked handstand-walk `:1977`, rowing-2k-test-prep `:912`, first-strict-pullup `:1419`, muscle-up `:1289` — none of these are truly broken links because the frontend prepends the program context).

## Recommended fix order

1. **P0 — muscle-up tier conditions.** Two of three tiers unreachable. Either extend the tokenizer at `intake-tier.ts` to accept single-quoted string literals + `==` string comparisons, or rewrite the conditions to use numeric proxies (map `muscle_up_experience` values → numbers via `SELF_REPORT_TO_NUMERIC`). Same fix unlocks engine-builder-block-2's tier inference.
2. **P0 — engine-builder-block-2 tier conditions.** All three tier conditions use `variable == 'string'`. Same fix as #1.
3. **P0 — Phase-overlap pattern across handstand-walk, first-strict-pullup, muscle-up.** Highest user-facing impact: Tier D beginner-shielding is broken. Either author one phase per calendar window with all tiers' blocks (and let the multi-dim generator's category filter pick), or add tier-aware phase selection to `activePhaseFor()`. Documented workaround exists in the substitution logic at `plan-generator.ts:130-143` but it can't recover the correct tier once the phase is wrong.
4. **P1 — retest_metrics broken source_refs across 5 programs.** engine-builder (submax HR + resting HR both broken), rowing-2k-test-prep (both retests broken due to `session_type`), engine-builder-block-2 (submax HR + resting HR broken). Fix by either (a) authoring source_refs against fields that actually exist on `runLogSchema`, or (b) extending the schema + write path to accept the fields the metrics assume.
5. **P1 — overhead-mobility Push tier unreachable** because `shoulder_flexion_loaded_deg` is not a physical test. Add it as a physical_test OR change the tier condition to reference a variable that is provided.
6. **P1 — engine-builder-block-2 phase_0 / phase_1 overlap** — Push-tier users get re-entry ramp they should skip. Either flip the phase order (phase_1 first in array) so Progression/Push get their intended phase, or gate phase_0 by tier in engine.
7. **P2 — anterior-hip manifest status mismatch** (REFERENCED vs ACTIVE). Cosmetic; flip one to match.
8. **P2 — Fix reversed name pair `resting_hr_morning` vs `morning_resting_hr` in engine-builder and engine-builder-block-2.** Typo fix.
9. **P2 — handstand-walk `phase_gates` field is authored but not consumed by any engine code path**. Either wire it up or delete the field to avoid the "we said this but it doesn't work" surface.
