# Programme integrity audit — skill + mobility arcs

**Date:** 2026-09-06
**Agent:** `programme-integrity`
**Scope:** `handstand-walk`, `muscle-up`, `first-strict-pullup`, `overhead-mobility`
**Data:** `next-app/public/data/programs/*.json`, `next-app/public/data/exercises.json`
**Code:** `next-app/src/`, schema `next-app/src/lib/schemas.ts`

One question only: **does the app do what these four programmes' data says it does?**
Every consumer below was established by grep over `next-app/src` excluding `*.test.*`.
`LIVE` findings are recorded too — the ratio is the point.

Deliberately not re-reported (already known and handled): `age_band` OVERPROMISED,
top-level `principles[]` invisible until 2026-09-05, eleven `evidence_ref` entries
mislabelled `source: "literature"`.

---

## The one finding that changes how you read the rest

Everything downstream turns on this, so it goes first.

### F-1 · The production read path skips composition, prerequisite filtering AND intake deferrals for every block that has authored items — `SAFETY` · `UNENFORCED`

**Code.** `composeBlockForUser` is the single place where slot composition,
prerequisite pruning and `intake_exclusions` are applied
(`next-app/src/lib/engine/plan-generator.ts:229-282`). Its first substantive line is:

```
// plan-generator.ts:258
if (opts?.onlyIfEmpty && authoredCount > 0) return block;
```

Every production caller passes `onlyIfEmpty: true`:

- `next-app/src/components/session/TodaySession.tsx:187`
- `next-app/src/components/session/DaySession.tsx:147`
- `next-app/src/components/offplan/OffPlanSession.tsx:122`

Those three are the block-object read path, and the block-object path is the
production path: `next-app/src/components/StoreHydrator.tsx:159-160` sets
`feature_flags.block_object = true` for any account where it is `undefined`, i.e.
every account. The legacy `blocksForDate(...)` branch that calls
`composeBlockForUser` **without** `onlyIfEmpty`
(`plan-generator.ts:210`) is only reached when the flag is explicitly false.

`materializeBlocks` does not compensate — it calls `blocksForDate` with no
`drillsById` and keeps only `b.id`
(`next-app/src/lib/engine/materialize-blocks.ts:80-82`, and its own header
comment at :14-17 says drill selection is left to read time).

**Consequence, established by counting authored items per block:**

| programme | slot blocks | with authored items | composed in production |
|---|---|---|---|
| handstand-walk | 9 | 9 | 0 |
| muscle-up | 9 | 9 | 0 |
| first-strict-pullup | 11 | 11 | 0 |
| overhead-mobility | 7 | 0 | 7 |

So for the three skill programmes: `capability_slot`, `slot_drill_count`,
`drill_library`, `arePrerequisitesMet`, `applyContextualInterference` (the
Shea & Morgan blocked→random practice schedule) and `applyIntakeExclusions`
**never execute**. Every user of those three programmes receives the identical
authored item list for a given block, regardless of tier, capability level or
intake answer. Only *which blocks* are scheduled varies by tier (via
`weekly_template.reference_week_tier_*` + phase filtering), never *what is in them*.

The `intake_exclusions` half is the safety-relevant one, and it fails in the
worst possible shape — see F-2.

---

## SAFETY findings

### F-2 · `intake_exclusions` is bypassed while its user-facing notice still renders — `SAFETY` · `UNENFORCED` · `OVERPROMISED`

**Data.** `muscle-up.json` `intake_exclusions[0]`:

```json
{ "id": "elbow_current_band_dip_only", "question_id": "elbow_tendon_pain",
  "when_value_in": ["current"],
  "exclude_exercise_ids": ["mu_ring_dip_full","mu_ring_dip_deep","mu_ring_dip_negative","mu_rto_dip"],
  "substitute_with": "mu_band_assisted_ring_dip" }
```

`first-strict-pullup.json` declares two: `elbow_current_defer_negatives`
(`pu_negative_pullup_5s`, `pu_negative_pullup_10s` → `pu_scap_pull`) and
`shoulder_overhead_defer_dead_hang` (`pu_dead_hang` → `pu_ring_row_incline`).

The intake help text makes the promise explicitly:

- muscle-up `elbow_tendon_pain`: *"If current, we defer ring dip work and use band-assisted dip only."*
- first-strict-pullup `elbow_tendon_pain`: *"If current, we defer heavy negatives and use scap-focused work first."*
- first-strict-pullup `shoulder_pain_overhead`: *"…we bias the plan toward closed-chain scap work and defer heavy dead hangs."*

**Code.** `applyIntakeExclusions` has exactly one call site, inside
`composeBlockForUser` (`plan-generator.ts:274` and `:280`) — both *after* the
`onlyIfEmpty` early return at `:258`. The blocks that hold the excluded
movements all have authored items:

- `block_ring_dip_ladder` → `mu_ring_dip_support_hold, mu_ring_dip_negative, mu_ring_dip_full, mu_ring_dip_deep`
- `block_negative_ladder` → `pu_negative_pullup_5s, pu_negative_pullup_10s, pu_isometric_top_hold`
- `block_hang_ladder` → `pu_dead_hang, pu_active_hang`

So a muscle-up user answering `elbow_tendon_pain: current` receives ring-dip
negatives, full ring dips and deep ring dips — three of the four ids the rule
names.

**And they are told otherwise.** `activeExclusions` is *also* read independently
by the session brief: `next-app/src/components/session/BriefView.tsx:270` renders
`exclusionNotices(activeExclusions(program, store.user_profile))`. That path has
no `onlyIfEmpty` guard, so it fires correctly. The user sees "we deferred ring
dip work" above a session containing ring dips.

This is the exact failure the field was created to fix — its own schema doc
(`schemas.ts:676-690`) says so: *"a user with current medial epicondylitis was
told ring dips would be deferred and then given ring dips. This field is what
makes the promise true."* The field is implemented; the production read path
does not reach it.

**Affected:** every muscle-up user with current elbow tendon pain; every
first-strict-pullup user with current elbow tendon pain or overhead shoulder pain.

---

### F-3 · handstand-walk promises to defer inversions on shoulder pain and has no mechanism at all — `SAFETY` · `OVERPROMISED`

**Data.** `handstand-walk.json` intake question `shoulder_pain_overhead`
(type `boolean`, `required: true`), help text:

> *"Includes press, jerk, snatch, overhead squat, or any handstand attempt. If yes, we defer inversions this block and route the plan to shoulder-safe positions first."*

**Code.** `handstand-walk` declares `intake_exclusions: []` — zero rules. There
is no safety gate on `shoulder_pain_overhead` in its `intake.safety_gates`. Grep
for the id across `src` (excluding tests) returns three hits, none of them a
consumer:

- `next-app/src/app/programs/[slug]/intake/IntakeClient.tsx:510` — membership in
  `KNOWN_SYMPTOM_HISTORY_IDS`, which only decides **which visual section of the
  intake form the question renders in** (`IntakeClient.tsx:509-515, 525`).
- two comment lines in `next-app/src/lib/engine/intake-exclusions.ts:8,11`.

Nothing defers anything. `handstand-walk` is the only one of the four that makes
this promise and has no `intake_exclusions` entry at all — F-2 at least has a
mechanism that is bypassed; this has none. Note the docstring at
`intake-exclusions.ts:8-13` describes precisely this state as the *pre-fix* bug,
and the fix never covered handstand-walk.

**Affected:** every handstand-walk user answering yes to shoulder pain — a
population the programme itself identifies as at-risk, in an inversion programme.

---

### F-4 · `progression_rules.escalation` — stop rules and red-day rules, no consumer, no rendering path — `SAFETY` · `DEAD` · `INVISIBLE`

**Data.** All three skill programmes author an escalation rule under
`progression_rules`:

- handstand-walk: *"Two red days in a week → skip the higher-load skill session (kick-up or walk attempts) that week, replace with Kinoshita position 1 and hollow-body only. Persistent shoulder pain > 3 days → stop, see a clinician."*
- muscle-up: *"Two red days in a week → skip the heavier transition or muscle-up test session. Persistent shoulder or wrist pain > 3 days → stop, see a clinician."*
- first-strict-pullup: *"Two red days in a week → skip the heavier pull session, do shoulder prep + row strength only. Persistent shoulder or elbow pain > 3 days → stop, see a clinician."*

**Code.** `grep -rn "progression_rules" src --include=*.ts --include=*.tsx`
(excluding tests, excluding `schemas.ts`) returns **two comment lines only** —
`next-app/src/lib/symptom-state.ts:10` and
`next-app/src/lib/engine/schedule.ts:246`, both naming it as known-dead. The one
programme-declared softening hook that *is* implemented,
`applyProgramSoftening` (`plan-generator.ts:83-104`), is hardcoded to
`concurrent-strength-maintenance` and returns `blocks` unchanged for anything else:

```
// plan-generator.ts:88
if (program.slug !== "concurrent-strength-maintenance") return blocks;
```

Nor is it rendered. The /plan rules panel reads **top-level `principles[]` and
`weekly_template.principles`** (`next-app/src/app/plan/page.tsx:148, 737-741`) —
`progression_rules.escalation` is neither. So the "two red days → drop the heavy
session" rule and the "stop, see a clinician" rule are invisible as well as
unenforced.

`progression_rules.week_end_rule` in the same object claims *"advance
`capability_profile.estimated_level` where applicable"* — nothing does (see F-9).

---

### F-5 · muscle-up's `ring_dip_count` gate hard-blocks users its own gate body invites to continue, and makes Tier A unreachable — `SAFETY` · `MISLABELLED`

**Data.** `muscle-up.json` `intake.safety_gates`:

```json
{ "question_id": "ring_dip_count", "unsafe_values": ["under_3"],
  "block_title": "Build the ring-dip base first",
  "block_body": "Under 3 strict ring dips, the top-half of the muscle-up will collapse. The Tier A phase of this program is a ring-dip build — it's a legitimate use of your time here — but you may prefer to run a dedicated dip program first. If you continue, the Tier A phase becomes your ring-dip build." }
```

No `severity` field.

**Code.** `severityOf` defaults absent severity to `"block"`
(`next-app/src/lib/engine/safety-gates.ts:59-61`), and a blocking gate
short-circuits the whole intake (`safety-gates.ts:75-84`; consumed at
`IntakeClient.tsx:216-222`). So the body text's *"If you continue"* describes a
path the code refuses. This is a `severity: "warn"` gate shipped without the field.

**Two knock-on effects.**

1. The option hint on the same question reads `under_3 = "Tier A — ring-dip build first"`,
   directly contradicting the refusal.
2. `plan_tiers[0]` is `tier_a_prep`, condition
   `strict_pullup_max_reps >= 3 && ring_dip_max_reps < 3` — a tier defined by
   ring dips under 3. Anyone answering `under_3` is blocked at intake; anyone
   answering `3_5`+ who skips the optional physical tests gets
   `ring_dip_max_reps` unset → `0` via `vars[t.value] ?? 0`
   (`next-app/src/lib/engine/intake-tier.ts:138`) but also
   `strict_pullup_max_reps = 0`, failing the first clause. **`tier_a_prep` is
   effectively unreachable**, yet it is the fallback tier when nothing matches
   (`intake-tier.ts:479-487`), and it is what the retest panel uses for targets
   (F-11).

---

### F-6 · handstand-walk's `acute_wrist_injury` help describes a modified plan; the code refuses entry — `OVERPROMISED`

**Data.** help text: *"If yes, wrist-load drills are prohibited until cleared.
**The plan will offer hollow-body and shoulder-endurance drills only**, with a
note to clear with a clinician."*

**Code.** The gate on `acute_wrist_injury` has `unsafe_values: ["true"]` and no
`severity` → blocks the intake outright (`safety-gates.ts:59-84`). There is no
"hollow-body and shoulder-endurance only" plan variant anywhere: no
`intake_exclusions`, no phase gate, no modality option.

The outcome is *safer* than the copy, not less safe — but the user is told a
tailored plan exists, and then handed a refusal. Classified `OVERPROMISED`
rather than `SAFETY`.

Same shape, lower stakes: muscle-up's `strict_pullup_count` gate body says
*"Run First Strict Pull-Up first and return here at 3+"* and
`manifest.json` `muscle-up.prerequisites[2]` says *"intake **routes** you to
First Strict Pull-Up"*. `manifest.prerequisites` is rendered as prose only
(`next-app/src/app/programs/[slug]/ProgramPreviewClient.tsx:346, 379-383`) and
the gate blocker renders title + body text with no CTA. Nothing routes; the user
reads a paragraph and navigates themselves.

---

### F-7 · Two overhead-mobility blocks render zero exercises for every user, forever — `SAFETY`-adjacent · `UNENFORCED`

**Data.** `overhead-mobility.json` has seven blocks, all `capability_slot` with
`slot_drill_count: 2` and **zero authored items**. Two of them —
`block_loaded_overhead` (`shoulder_flexion_loaded`) and `block_overhead_endurance`
(`overhead_endurance`) — are the loading half of the programme and are scheduled
2×/week each in `reference_week_progression` and `reference_week_push`.

**Code path traced.**
`composeSlotDrills` (`plan-generator.ts:400-450`) requires
`Math.abs(level - userLevel) <= 1` (`:420`).
`userLevel` comes from `deriveLevelsFromProfile` → `tierIdToBaseLevel`
(`plan-generator.ts:545-556`), which matches `/^tier_([a-z0-9]+)/i`.
overhead-mobility's tier ids are `foundation` / `progression` / `push` — **no
`tier_` prefix, so the regex fails and the function returns `1` for all three
tiers**. `capability_profile` never contains a capability-domain key (F-9), so
the Proxy default at `plan-generator.ts:534-541` returns `1`.

Eligible drills in those two slots, from `exercises.json`:

- `shoulder_flexion_loaded`: `om_empty_bar_ohs` (L3), `om_kb_arm_bar` (L3), `om_snatch_grip_sotts_press` (L4) → `|3-1| = 2 > 1` → **0 candidates**
- `overhead_endurance`: `om_empty_bar_ohs` (L3), `om_tgu_hold` (L3) → **0 candidates**

`composeSlotDrills` then falls back to
`filterBlockItemsByPrerequisites(block, ...)` (`:427`), which on a block with no
`items` returns the block unchanged — i.e. empty.

Five of the twelve drills in `overhead-mobility.drill_library` are therefore
**unreachable by any user in any tier**: `om_empty_bar_ohs`,
`om_kb_arm_bar`, `om_snatch_grip_sotts_press`, `om_tgu_hold`,
`om_bottom_up_kb_press`. Since the programme has zero authored items anywhere,
those five movements exist in the data and are never prescribed.

Note `plan-generator.ts:222-227` documents the `onlyIfEmpty` path as the fix for
overhead-mobility rendering "0 exercises". It fixed five of seven blocks.

**Related, same programme:** a Foundation-tier user reaching `phase_3_load_and_retest`
gets `block_scap_activation` as Wednesday's primary block, but phase_3's
`blocks[]` does not list it. The phase-substitution fallback
(`plan-generator.ts:189-207`) looks for a same-category swap via
`skillCategoryOf` (`plan-generator.ts:288-295`, which only recognises
`block_skill_[AB]_` / `block_bail_`) and then for any id starting
`block_skill` or `block_bail`. overhead-mobility uses neither naming convention,
so **nothing is pushed** and the day silently loses its primary block.

---

### F-8 · 29 item-level `condition` gates and 16 `starts_week` gates — including symptom-conditioned ones — have zero consumers — `SAFETY` · `DEAD`

**Data.** Across the three skill programmes, `blocks[].items[]` carry:

| key | handstand-walk | muscle-up | first-strict-pullup |
|---|---|---|---|
| `condition` | 7 | 12 | 10 |
| `starts_week` | 7 | 4 | 5 |
| `optional` | 12 | 1 | 4 |
| `progress_to` / `after_weeks` / `skip_if` | 0 | 0 | 0 |

Examples (verbatim):

- `handstand-walk` `block_skill_A_kinoshita` / `hs_incline_135_hold`: `"condition": "wrist_symptom_score < 3"`, `"starts_week": 2`
- `handstand-walk` `block_skill_B_obstacles_or_turns` / `hs_full_pirouette_free`: `"condition": "handstand_turns_level >= 5"`, `"starts_week": 6`
- `muscle-up` `block_ring_dip_ladder` / `mu_ring_dip_deep`: `"condition": "mu_ring_dip_strength_level >= 4"`, `"starts_week": 4`
- `first-strict-pullup` `block_negative_ladder` / `pu_negative_pullup_10s`: `"condition": "pu_negative_control_level >= 3"`, `"starts_week": 3`

**Code.** `progress_to`, `after_weeks`, `starts_week` and item-level `skip_if`
return **zero non-test hits** in `src`. Item-level `condition` is in
`blockItemSchema` (`schemas.ts:126-128`) so it survives parse, but the only
`condition` evaluator in the codebase is `evaluateCondition`
(`intake-tier.ts:210-221`), reached solely from `inferTier` at
`intake-tier.ts:468` for `plan_tiers[].condition`. No caller passes a block item.

`optional` is the one that is live: `next-app/src/components/session/DaySession.tsx:483`
reads `item.optional === true`.

**Consequence.** Because F-1 also disables prerequisite filtering, these
conditions were the *last* remaining gate on item content — and they are not
evaluated either. A Tier A handstand-walk user in week 1 is served
`hs_full_pirouette_free` (level 5, gated on `handstand_turns_level >= 5` and
week 6). A muscle-up Tier A user in week 1 is served `mu_ring_dip_deep`
(level 4, gated on level ≥ 4 and week 4). A first-strict-pullup Tier A user —
by definition someone who cannot dead hang 15 seconds — is served
`pu_negative_pullup_10s` and `pu_slow_tempo_pullup`.

The wrist-symptom gate (`"wrist_symptom_score < 3"`) is the safety-shaped one: a
symptom-conditioned drill gate in an inversion programme, evaluated nowhere.

Secondary defect: several `condition` expressions name variables that would not
resolve even if the evaluator ran — `mu_false_grip_pull_level` and
`mu_transition_control_level` against actual capability domains `mu_false_grip`
and `mu_transition_mechanics`; `handstand_obstacles_level` against a domain
(`handstand_obstacles`) that no block declares as a `capability_slot`.

---

## Tier system findings

### F-9 · `capability_profile` is keyed by physical-test id, `capability_domains` are keyed by domain — they never meet — `DEAD` (contents) · `SHAPE-ONLY`

**Data.** All three skill programmes declare
`plan_tiers[].program_adjustments.starting_capability_levels` — per-domain
starting levels, one map per tier, eleven tiers total.

**Code.**
- `starting_capability_levels` → **zero hits in `src`**. Dead.
- `capability_profile` is written in exactly two places, both keyed by
  **physical-test id**: `IntakeClient.tsx:402-412`
  (`for (const [testId, value] of Object.entries(testResults)) newCaps[testId] = {...}`)
  and `useStore.ts:1366-1381` (`recordCapabilityMeasurement(testId, ...)`).
- `deriveLevelsFromProfile` (`plan-generator.ts:507-542`) then does
  `declared[domain] = entry.estimated_level` over those keys — so `declared`
  ends up containing `wall_hold_max_seconds`, `strict_pullup_max_reps`,
  `shoulder_flexion_supine_deg` etc., **never** `handstand_hold_static`,
  `mu_false_grip`, `shoulder_flexion_loaded`.
- Every real capability-domain lookup therefore misses `declared` and hits the
  Proxy default at `:534-541`, which returns `tierIdToBaseLevel(tierId)` — one
  coarse number for all domains.

**So per-capability level is always uniform and always tier-derived.** The v2
premise stated in `schemas.ts:145-152` and in the programmes' own
`sub_skill_independence` principle — *"sub-skills develop independently"*,
*"The plan generator picks per-capability weakness each week"* — does not exist
in the runtime. (And on the live path it would not matter, per F-1.)

Two further consequences worth naming:

- `arePrerequisitesMet`'s docstring (`plan-generator.ts:483-487`) claims
  *"Missing / unknown capability entries default to level 1 (weakest), which
  biases toward safety"*. The `levels[p.capability_domain] ?? 1` at `:492` can
  never fire — the Proxy always returns a number. Unknown domains default to the
  **tier baseline**, not 1. The comment describes a fail-safe the code does not have.
- `deriveLevelsFromProfile` contains a dead `const domains = new Set<string>()`
  and an empty `if (program.drill_library) { }` block (`:520-530`).

### F-10 · Tier reachability and self-report mapping gaps — `DEAD` · `OVERPROMISED`

`SELF_REPORT_TO_NUMERIC` and `SELF_REPORT_TO_TEST_VAR`
(`intake-tier.ts:258-352`) have entries for `handstand-walk`,
`first-strict-pullup`, `concurrent-strength-maintenance` and
`rowing-2k-test-prep`. **No entry for `muscle-up` or `overhead-mobility`.**
Physical tests are optional (`IntakeClient.tsx:756, 1432`).

- **overhead-mobility.** Tier conditions read `shoulder_flexion_supine_deg` and
  `tgu_hold_max_seconds` — both physical-test ids. The self-report question
  `shoulder_flexion_baseline` carries option hints `far = Foundation`,
  `mid = Foundation / Progression`, `near = Progression`, `vertical = Push` and
  is mapped to nothing. A user who answers `vertical` and skips the optional
  tests resolves `shoulder_flexion_supine_deg → 0` (`intake-tier.ts:138`),
  matches `foundation` (`< 160`) and is told Push. `OVERPROMISED`.
- **overhead-mobility tier gaps.** `foundation: < 160`, `progression: >= 165 && < 180`,
  `push: >= 180 && tgu >= 30`. Flexion 160–164 matches nothing; flexion ≥ 180
  with TGU < 30 matches nothing. Both fall to the `!matched` default
  (`intake-tier.ts:479-487`), which is `tiers[0]` = `foundation`. Conservative,
  but the most mobile user in the second case lands in the lowest tier.
- **overhead-mobility tiers are otherwise inert.** All three declare the same
  `starting_phase_id: phase_1_kinematic_base`, all three have empty
  `program_adjustments`, no phase declares `for_tier_ids`, and
  `tierIdToBaseLevel` returns 1 for all three (F-7). The only thing tier changes
  is which `reference_week_*` layout is read.
- **muscle-up.** `false_grip_hang_seconds_selfreport` is required, carries tier
  hints (`never = Tier A` … `over_30s = Tier B / C`), appears in no tier
  condition, no mapping, no gate, no exclusion. `DEAD` + `OVERPROMISED`.
  `muscle_up_experience: "multiple"` is hinted *"Program not optimised for you"*
  but matches no tier condition, so the most advanced user defaults to
  `tier_a_prep` — the lowest tier.
- **first-strict-pullup.** `ring_row_reps_selfreport` (required, tier hints
  `under_5 = Tier A` … `over_15 = Tier C+`) has no mapping and appears in no
  tier condition. `bodyweight_kg` is labelled *"used to shape band-tension
  progression"* — **zero hits in `src`**. Both `DEAD` + `OVERPROMISED`.
- **handstand-walk.** `days_per_week` help says *"If your ceiling is 2, we'll
  tell you upfront whether this program can deliver on its claim at that dose"*
  — the capacity gate at `IntakeClient.tsx:224-238` requires
  `program.schedule_constraints.session_count_per_week_range`, and
  handstand-walk is the only one of the four with **no `schedule_constraints`**.
  Answering 2 produces no message. `OVERPROMISED`.

Also dead across all four: `plan_tiers[].starting_phase_id` (declared by every
tier in three programmes, zero hits), `outcome_confidence` (zero hits),
`full_goal_weeks_estimate` (zero hits),
`program_adjustments.session_length_min` / `.sessions_per_week` (zero hits;
`reveal-copy.ts:35` reads `intakeAnswers.session_length_min`, which is not a
question in any of the four), `weekly_template.placement_principles` (zero hits).
`typical_outcome` is LIVE (`ProgramPreviewClient.tsx:524`, `IntakeClient.tsx:561`).

---

## Retest findings

### F-11 · `aggregation` / `window_days` are ignored for every metric in all four programmes — `DEAD`

All eleven retest metrics across the four declare `source: "physical_test"`.
`evaluateSource` handles `aggregation` and `window_days` **only** in the
`parsed.kind === "runs"` branch (`next-app/src/lib/engine/retest-evaluator.ts:176-217`);
the `physical_test` branch (`:141-157`) returns `capability_profile[testId].measured_value`
and the baseline snapshot directly. So `"aggregation": "best_of_last_n"` on nine
metrics and `"latest"` on two are inert.

### F-12 · Missing tier target rows silently fall back to Tier A's numbers — `UNENFORCED`

`retest-evaluator.ts:323-325`:

```
const found = userTierId ? targets.find((t) => t.tier_id === userTierId) : undefined;
const row = found ?? targets[0] ?? {};
```

Metrics with incomplete `targets[]`:

- handstand-walk `wall_hold_max_seconds` and `freestand_hold_max_seconds` — no `tier_d_advanced` row
- muscle-up `false_grip_hang_max_seconds` — no `tier_c_first_rep` row; `ring_dip_max_reps` — `tier_a_prep` only
- first-strict-pullup `dead_hang_max_seconds` — `tier_a_hang` / `tier_b_assisted` only

A Tier D handstand-walk user is shown Tier A's 15-second wall-hold target as
their own, with no indication it is a fallback.

### F-13 · overhead-mobility `ohs_depth_ratio`: `metric_id ≠ source_ref`, so a logged retest never updates the reading — `UNENFORCED`

**Data.** `{"metric_id": "ohs_depth_ratio", "source": "physical_test", "source_ref": "ohs_hip_below_knee_cm", ...}`.
It is the only metric in the four where the two differ.

**Code.** The Progress capture writes by **metric_id**:
`next-app/src/components/progress/RetestMetricsPanel.tsx:149`
`recordCapabilityMeasurement(m.metric_id, num, m.unit)`.
`evaluateSource` reads by **source_ref**: `capability_profile[parsed.testId]`
where `testId` came from `source_ref` (`retest-evaluator.ts:52-56, 147`).
So the write lands under `ohs_depth_ratio` and the read looks at
`ohs_hip_below_knee_cm`, which only the intake ever populates.
`dueRetestMetrics` compounds it — it looks up
`capability[m.metric_id]?.last_measured_at`
(`next-app/src/lib/engine/tier-promotion.ts:95-98`), sees the write, so the
"due" chip clears while the displayed value stays frozen at the intake number.

### F-14 · muscle-up's headline outcome metric has no baseline — `UNENFORCED`

`retest_metrics[0].metric_id = "strict_ring_muscle_up_reps"`, `source_ref` the
same. `intake.physical_tests[]` for muscle-up is
`strict_pullup_max_reps, ring_dip_max_reps, false_grip_hang_max_seconds,
false_grip_pullup_max_reps, ring_support_lockout_seconds` — **it is not there**.
`capability_profile` can therefore never hold it at intake, so `current` and
`baseline` are both `null` until the user manually captures it twice. The
programme's primary outcome is the one metric with no baseline.

### F-15 · Two retest capture surfaces write to different stores — `UNENFORCED`

- Progress panel → `recordCapabilityMeasurement` → `capability_profile` **and**
  `logRetestReading` → `retest_readings` (`RetestMetricsPanel.tsx:136-149`).
- Today's retest-due proposal sheet → `logRetestReading` **only**
  (`next-app/src/components/workout/RetestLoggingSheet.tsx:46-53`;
  `useStore.ts:1442-1452` touches only `retest_readings`).

`evaluateSource`'s physical_test branch and `nextEligibleTier`
(`tier-promotion.ts:42-48`) both read `capability_profile`. So a user who
captures a retest from the Today proposal — the surface the app actively prompts
them to use — updates the sparkline but not the current value, and does not
become eligible for tier promotion.

### LIVE here

`retest_metrics` → `evaluateRetestMetrics` → Progress panel: LIVE.
`cadence_weeks` → `dueRetestMetrics` (`tier-promotion.ts:88-105`),
`CutCLatestRetestTile.tsx:81-84`, `StatusCards.tsx:137-139`: LIVE.
`targets[].at_week` → `RetestMetricsPanel.tsx:172-174` and proposal scheduling
(`next-app/src/lib/proposals/select.ts:337-418`): LIVE.
Tier promotion via retest → `nextEligibleTier` → `promoteTier`
(`next-app/src/lib/proposals/useProposalActions.ts:56`): LIVE, subject to F-15.

---

## Other findings

### F-16 · handstand-walk's phase gate skips a phase without compressing the calendar — `UNENFORCED`

`phase_gates` is LIVE — `isPhaseGateSkipped` (`schedule.ts:145-166`) is real,
and the field is now in `programSchema` (`schemas.ts:698-710`) so it survives
parse.

But `shiftedPhases` (`schedule.ts:75-120`) anchors the whole calendar to
`program.phases[0].starts` — `phase_0_bail_out_prep`, `2026-01-05`.
`phase_1..4` start `2026-01-12`, i.e. day 8. A user answering
`bail_out_readiness: "can_exit_reliably"` has phase_0 filtered out at
`activePhaseFor` (`schedule.ts:204`) and no tier phase has begun, so `matches`
is empty and control falls to `return phases[phases.length - 1]`
(`schedule.ts:224`) — **`phase_all_weeks_3_8`**, the shared weeks-3-to-8 phase
with nine blocks. The user who skips Phase 0 gets week 3-8 content in week 1.

Also: `phase_gates[].run_if_value_in` is destructured in the type at
`schedule.ts:151-158` but never read — only `skip_if_value_in` drives behaviour
(`:166`). And the option hint `can_step_out = "Phase 0 recommended"` implies a
choice the code does not offer; `run_if_value_in` includes `can_step_out`, so it
simply runs.

### F-17 · Programme-level keys with zero consumers — `DEAD`

Established by grep over `src` excluding `*.test.*` and `schemas.ts`:

| key | in schema? | declared by | hits |
|---|---|---|---|
| `status_note` | **no** — stripped at parse | all four | 0 |
| `immediate_actions` (4/4/4/2 entries) | yes | all four | 0 |
| `daily_log_schema` (10/10/9/3 keys) | yes | all four | 0 (known-dead) |
| `progression_rules` | yes | HSW, MU, FSP | 0 (F-4) |
| `modality_options` | yes | overhead-mobility | 0 |
| `deload_window` | yes | overhead-mobility | 0 |
| `starting_capability_levels` | via `program_adjustments` record | HSW, MU, FSP | 0 |
| `starting_phase_id` | yes | HSW, MU, FSP | 0 |
| `outcome_confidence`, `full_goal_weeks_estimate` | yes | HSW, MU, FSP | 0 |
| `weekly_template.placement_principles` | record-typed | HSW, MU, FSP | 0 |
| block `phase_gated`, `frequency_per_week`, `substitutions`, `excluded` | yes | — | 0 |
| item `progress_to`, `after_weeks`, `starts_week`, `skip_if` | yes | HSW, MU, FSP | 0 (F-8) |

`status_note` is the notable one: it is **not in `programSchema`**, so Zod
discards it at parse. It cannot be read even in principle.

### F-18 · Unreachable drills — `DEAD`

Given F-1 (skill programmes never compose) the reachable set for those three is
just their authored items. Even on the legacy composing path, computed across
every tier's base level and prerequisite set:

- `overhead-mobility`: **5 of 12** library drills unreachable — `om_empty_bar_ohs`,
  `om_kb_arm_bar`, `om_snatch_grip_sotts_press`, `om_tgu_hold`,
  `om_bottom_up_kb_press`. All the loaded work. (F-7)
- `muscle-up`: 6 of 29 — `hs_arch_hold`, `hs_hollow_body_hold`, `hs_hollow_rock`,
  `pu_dead_hang`, `pu_negative_pullup_10s`, `pu_slow_tempo_pullup`
- `handstand-walk`: 2 of 31 — `hs_arch_hold`, `hs_hollow_rock`
- `first-strict-pullup`: 0

`handstand-walk` and `muscle-up` also declare `capability_domains` on library
drills that no block uses as a `capability_slot`
(`handstand_obstacles`, `hollow_body_shape`, `wrist_extension_mobility`;
and in muscle-up `pu_dead_hang_grip`, `pu_full_pullup_volume`,
`pu_negative_control`, `pu_row_strength`, `hollow_body_shape`) — those domains
can gate a prerequisite but can never be targeted.

Every `exercise_id` in all four programmes resolves against `exercises.json` —
no silent-disappearance defects of the kind `data-integrity.test.ts` guards.

### F-19 · `signal_completeness` claims signals that do not exist — `OVERPROMISED`

handstand-walk's transparency card declares the engine *currently reads*:
*"Self-reported drill scores per capability domain"* and
*"Per-drill completion + tier progression flags"*. There is no per-capability
input anywhere — `capability_profile` is keyed by test id and written only at
intake and retest (F-9). Rendered at
`next-app/src/components/progress/SignalCompletenessCard.tsx:35`, so the user
sees it. overhead-mobility's version is milder (*"Self-reported ROM in degrees
on retest days"*, which is true).

### F-20 · Two `principles[]` entries assert generator behaviour that does not exist — `OVERPROMISED`

Now that the /plan rules panel renders top-level `principles[]`
(`app/plan/page.tsx:148, 737-741`), the copy is user-visible:

- handstand-walk `sub_skill_independence`: *"The plan generator picks per-capability weakness each week."* — false per F-1 and F-9.
- first-strict-pullup carries the same principle id and text minus that sentence.
- muscle-up `prerequisites_gate_hard`: *"the manifest routes them to First Strict Pull-Up"* — see F-6.

### F-21 · `multiDimAdapter` is a declared no-op — `LIVE` (honest), context for the rest

`next-app/src/lib/engine/adapters/multi-dim.ts:25-36`: `shouldEvaluate` returns
`false`, `evaluate` and `suggest` return `null`, with the header naming Phase C
as the fill-in. So none of these four programmes has an adaptive per-session
engine; adaptation for them is entirely retest → tier promotion. The code is
candid about this. Noted because it bounds what any other "the engine adapts"
copy can truthfully claim.

---

## LIVE — what does work

Recorded so the ratio is legible.

| Mechanism | Consumer (file:line) | Programmes |
|---|---|---|
| `intake.safety_gates` incl. `severity: warn` + ack persistence | `lib/engine/safety-gates.ts:70-124`, `IntakeClient.tsx:216-222` | all four (9/9/5/10 gates) |
| boolean answers stored as `"true"` / `"false"` so `unsafe_values: ["true"]` fires | `IntakeClient.tsx:1169-1182` | all four |
| `plan_tiers[].condition` incl. string-enum comparison | `lib/engine/intake-tier.ts:210-221, 468` | all four |
| `SELF_REPORT_TO_NUMERIC` / `_TEST_VAR` self-report → tier | `intake-tier.ts:258-352` | HSW, FSP only |
| `phases[].for_tier_ids` tier-aware phase selection | `lib/engine/schedule.ts:202-212` | HSW, MU, FSP |
| `phase_gates[].skip_if_value_in` | `schedule.ts:145-166` | HSW (see F-16) |
| `weekly_template.reference_week_*` → daily blocks, incl. non-`tier_` ids | `plan-generator.ts:135-210, 559-567` | all four |
| phase-scoped block filtering + substitution | `plan-generator.ts:189-207` | HSW, MU, FSP (see F-7 for OVM) |
| `capability_slot` composition on empty blocks | `plan-generator.ts:269-278` | overhead-mobility only (5 of 7 blocks) |
| `symptom_regions[]` → morning check | `app/check/page.tsx:44, 136-145`, `lib/symptom-regions.ts` | all four |
| `symptom_flags[]` | same | all four |
| `load_signals[]` | `lib/load-signals.ts` | all four |
| central `green/amber/red` derivation over declared regions | `lib/symptom-state.ts:26-78` | all four |
| top-level `principles[]` + `weekly_template.principles` rules panel | `app/plan/page.tsx:148, 737-741` | all four (7/7/7/5) |
| `retest_metrics` → Progress cards, `cadence_weeks` due-check, `at_week` proposals | `retest-evaluator.ts`, `tier-promotion.ts:88-105`, `proposals/select.ts:337-418` | all four |
| retest → `capability_profile` → `nextEligibleTier` → `promoteTier` | `tier-promotion.ts:29-65`, `useProposalActions.ts:56` | all four (see F-15) |
| `schedule_constraints.session_count_per_week_range` capacity gate | `IntakeClient.tsx:224-238` | MU, FSP, OVM (not HSW — F-10) |
| `intake_exclusions` → user-facing deferral notice | `components/session/BriefView.tsx:270` | MU, FSP (notice only — F-2) |
| `onboarding_steps` | `onboardingStepSchema`, `<OnboardingRunner>` | all four (3/3/3/2) |
| `signal_completeness` render | `SignalCompletenessCard.tsx:35` | HSW, OVM (content — F-19) |
| `typical_outcome` | `ProgramPreviewClient.tsx:524`, `IntakeClient.tsx:561` | all four |
| `interference_hints` | `lib/engine/daily-plan.ts:76-88` | OVM |
| `positioning` | `daily-plan.ts:56`, `ProgramPreviewClient.tsx:341` | all four |
| item `optional` | `DaySession.tsx:483` | HSW, MU, FSP |
| every `exercise_id` / `drill_library` id resolves | verified against `exercises.json` | all four |
| `evidence_base.references[]` ↔ `reference_ids[]` counts agree (33/23/21/19) | — | all four |

---

## Summary table

| # | Finding | Class | Programmes |
|---|---|---|---|
| F-1 | `onlyIfEmpty` short-circuit disables composition, prereq filtering, CI shuffle and exclusions on the production path | `UNENFORCED` `SAFETY` | HSW, MU, FSP |
| F-2 | `intake_exclusions` bypassed while its notice still renders | `UNENFORCED` `OVERPROMISED` `SAFETY` | MU, FSP |
| F-3 | "we defer inversions this block" — no mechanism at all | `OVERPROMISED` `SAFETY` | HSW |
| F-4 | `progression_rules.escalation` stop rules: no consumer, no render path | `DEAD` `INVISIBLE` `SAFETY` | HSW, MU, FSP |
| F-5 | `ring_dip_count` gate blocks users its own body invites to continue; Tier A unreachable | `MISLABELLED` `SAFETY` | MU |
| F-6 | Help text describes a modified plan / a route that does not exist | `OVERPROMISED` | HSW, MU |
| F-7 | Two blocks always render zero exercises; 5/12 drills unreachable | `UNENFORCED` | OVM |
| F-8 | 29 item `condition` + 16 `starts_week` gates, incl. a symptom gate, unevaluated | `DEAD` `SAFETY` | HSW, MU, FSP |
| F-9 | `capability_profile` keyed by test id, never by capability domain | `DEAD` `SHAPE-ONLY` | HSW, MU, FSP, OVM |
| F-10 | Tier hints promise tiers no mapping can produce; dead intake questions | `DEAD` `OVERPROMISED` | MU, FSP, OVM, HSW |
| F-11 | `aggregation` / `window_days` ignored for `physical_test` metrics | `DEAD` | all four |
| F-12 | Missing tier target rows fall back to Tier A silently | `UNENFORCED` | HSW, MU, FSP |
| F-13 | `ohs_depth_ratio` write/read key mismatch | `UNENFORCED` | OVM |
| F-14 | Headline outcome metric absent from `physical_tests` — no baseline | `UNENFORCED` | MU |
| F-15 | Today's retest sheet writes only `retest_readings` | `UNENFORCED` | all four |
| F-16 | Phase gate skips a phase without compressing the calendar | `UNENFORCED` | HSW |
| F-17 | 13 declared keys with zero consumers (`status_note` not even in schema) | `DEAD` | all four |
| F-18 | Unreachable drills | `DEAD` | OVM (5/12), MU (6/29), HSW (2/31) |
| F-19 | `signal_completeness` claims per-capability signals that do not exist | `OVERPROMISED` | HSW |
| F-20 | `principles[]` copy asserts generator behaviour that does not exist | `OVERPROMISED` | HSW, MU |
| F-21 | `multiDimAdapter` is a declared no-op | `LIVE` (honest) | all four |

---

## SAFETY section — every protective claim that is not enforced

Ordered by how badly the gap between claim and behaviour could hurt someone.

1. **F-2 · Deferral promised, notice shown, movement still prescribed.**
   muscle-up + first-strict-pullup. A user with current medial epicondylitis
   reads "we deferred ring dip work" and is given ring-dip negatives, full ring
   dips and deep ring dips in the same session. Worse than silence: the notice
   actively reassures. `plan-generator.ts:258` vs `BriefView.tsx:270`.

2. **F-3 · "If yes, we defer inversions this block."** handstand-walk,
   `shoulder_pain_overhead`, required, boolean. Zero consumers. The answer's only
   effect anywhere in `src` is which section of the intake form it renders in
   (`IntakeClient.tsx:509-515`).

3. **F-8 · 29 item-level `condition` gates unevaluated**, including
   `"wrist_symptom_score < 3"` on a wall-handstand drill in an inversion
   programme, and level/week gates on `mu_ring_dip_deep`,
   `pu_negative_pullup_10s`, `hs_full_pirouette_free`. With F-1 removing
   prerequisite filtering too, nothing gates item content by capability at all.

4. **F-4 · "Two red days in a week → skip the higher-load skill session"** and
   **"Persistent shoulder pain > 3 days → stop, see a clinician."** Three
   programmes, `progression_rules.escalation`. No consumer, and not on the /plan
   rules panel either, which reads `principles[]` — so the user is not even told
   the rule exists. `applyProgramSoftening` is hardcoded to one other programme
   (`plan-generator.ts:88`).

5. **F-5 · A hard block wearing warn-gate copy.** muscle-up `ring_dip_count`.
   The refusal text says "If you continue, the Tier A phase becomes your ring-dip
   build" and there is no continue. Missing `severity: "warn"`
   (`safety-gates.ts:59-61`).

6. **F-9 · The declared fail-safe is inverted.** `arePrerequisitesMet`'s comment
   claims unknown capability domains default to level 1 "which biases toward
   safety" (`plan-generator.ts:483-487`). The Proxy at `:534-541` returns the
   tier baseline instead, so a Tier D user auto-satisfies every prerequisite up
   to level 4 in domains they have never been measured in. Latent today because
   of F-1; live the moment `onlyIfEmpty` is relaxed.

7. **F-7 · Silent empty sessions in a loading phase.** overhead-mobility
   Progression and Push users get `block_loaded_overhead` twice a week and
   `block_overhead_endurance` twice a week, each with zero exercises, every week,
   with no error. The programme's entire loading half is unreachable.

8. **F-6 · "wrist-load drills are prohibited… the plan will offer hollow-body
   and shoulder-endurance drills only."** handstand-walk `acute_wrist_injury`.
   The behaviour is a hard block, which is safer — but the user is promised a
   tailored plan that does not exist, which erodes the credibility of the gates
   that are real.
