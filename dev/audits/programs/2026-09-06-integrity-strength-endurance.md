# Programme integrity audit — strength + endurance cohort

**Date:** 2026-09-06
**Agent:** `programme-integrity`
**Scope:** `anterior-hip-rebuild`, `concurrent-strength-maintenance`, `engine-builder`,
`engine-builder-block-2`, `rowing-2k-test-prep`
**Question:** does the app do what these five programmes' data says it does?

Every consumer below was established by grep against
`next-app/src/` (tests excluded unless named) and, where the answer was not
obvious from a read, by running the code. Nothing here is inferred from
plausibility.

Known-already, not re-litigated: `daily_log_schema` (dead),
`progression_rules.states[]` (dead), `training_maxes.starting_values_kg`
(SHAPE-ONLY), top-level `principles[]` (was invisible, fixed 2026-09-05).

---

## Method notes / evidence commands

- Top-level key inventory: `python3` walk over each `public/data/programs/*.json`.
- Consumer establishment: `grep -rn --include=*.ts --include=*.tsx "\b<key>\b" src/ | grep -v '\.test\.' | grep -v 'lib/schemas.ts'`.
- Two findings were proven by execution rather than reading, because a read
  would have been a guess. Both probes were temporary test files, run, deleted:
  - **Zod strip probe** — `programSchema.parse(rowing-2k-test-prep.json)` and
    printing `Object.keys()` of `phase_3_taper_test`.
  - **Condition-evaluator probe** — `evaluateCondition()` against
    engine-builder-block-2's Push tier expression.

---

## A. Findings that change what a user gets

### A1 · `is_taper` and `block_replacements_final_week` are stripped by Zod before the code that reads them — SAFETY-adjacent, `DEAD`

**Data declares** (`rowing-2k-test-prep.json`, `phases[2]`):

```json
{ "id": "phase_3_taper_test", "is_taper": true, "duration_multiplier": 0.55,
  "block_replacements_final_week": { ... },
  "block_final_week_replacements_note": "..." }
```

**Schema:** `phaseSchema` (`src/lib/schemas.ts:181-259`) declares
`id, name, starts, ends, duration_weeks, blocks, for_tier_ids, rationale,
block_replacements, goal, template, template_note, note, cycle_structure,
test_at_end, test_window, reintroduction_gate, week_by_week, notes, gating,
note_holiday_gap, runs_cycle_end_eval, weekly_overrides`. It does **not**
declare `is_taper`, `duration_multiplier`, `block_replacements_final_week`, or
`block_final_week_replacements_note`.

**Proven, not assumed.** `programSchema.parse` on the shipped rowing JSON
returns for that phase exactly:

```
["id","name","starts","ends","duration_weeks","blocks","rationale","goal"]
```

**Code that reads them, through a cast, on data that no longer exists:**

- `src/components/session/TodaySession.tsx:310` —
  `{phase && (phase as unknown as { is_taper?: boolean }).is_taper ? …}` —
  the taper banner on Today. Never renders.
- `src/lib/engine/schedule.ts:318` —
  `if (phase && (phase as unknown as { is_taper?: boolean }).is_taper && phase.ends)`
  guarding `src/lib/engine/schedule.ts:323`'s read of
  `block_replacements_final_week`. Never fires, so the taper week's swap of
  high-CNS blocks for lighter ones does not happen.
- `duration_multiplier` (0.55) has **zero** readers *and* is stripped.

This is the exact `phase_gates` failure the schema itself documents at
`schemas.ts:664-679` — a cast is invisible to the compiler, so nothing flagged
it. `rowing-2k-test-prep` is the only programme in the catalog that authors
`is_taper` (`grep -l "is_taper" public/data/programs/*.json`), so both
consumers are dead code today.

**Who is affected:** every rowing user, in the last two weeks before their test
— the week the programme's own `taper_last_week` principle calls its biggest
lever ("volume down 40-50%, intensity held … ~3% performance uplift").
Classification: `DEAD` (data), with two `UNENFORCED` consumers downstream.

---

### A2 · engine-builder-block-2's Push tier is unreachable — the condition cannot be tokenized · `DEAD`

**Data declares** (`engine-builder-block-2.json`, `plan_tiers[2].condition`):

```
block_1_completed == 'yes_recent' && (current_cardio_hours_per_week >= 6 || block_1_submax_hr_delta <= -8)
```

**Code:** `src/lib/engine/intake-tier.ts:33-102` `tokenize()`. The character
class list handles `( ) && || >= <= == != > < !` quoted strings, digits and
identifiers. `-` is not among them, so it falls to
`return null; // unrecognized character` (`intake-tier.ts:100`).
`evaluateCondition` (`intake-tier.ts:233`) then returns `false` on a null token
list — for the **whole** expression, not just the failing conjunct.

**Proven.** Probe with the ideal Push user (`yes_recent`, 8 h/wk, −10 bpm
delta):

```
EB2 Push condition → false
"a <= -8" with a = -10 → false      (isolated repro)
"a <= 8"  with a = -10 → true       (control)
```

`inferTier` (`intake-tier.ts:465-486`) walks tiers and takes the last match;
Progression requires `current_cardio_hours_per_week < 6`, so a 6+ h/wk Block-1
finisher matches **nothing** and hits the `if (!matched)` fallback at
`intake-tier.ts:477` — tier `foundation`, rationale
`"No tier matched — defaulted to lowest"`.

The intake tells that user `block_1_submax_hr_delta` "< -5 bpm, you're a Push
tier candidate." They are not; they cannot be.

**Also affected by the same fallback:** a `yes_recent` user with < 3 h/wk
matches no tier either (Foundation needs `yes_lapsed`/`no_but_equivalent`,
Progression needs `>= 3`).

---

### A3 · engine-builder-block-2's phase 0 overlaps phase 1, and `starting_phase_id` is dead — every tier gets the re-entry ramp · `DEAD` + `OVERPROMISED`

**Data declares:**

| phase | starts | ends | `for_tier_ids` |
|---|---|---|---|
| `phase_0_re_entry_ramp` | 2026-01-05 | 2026-01-18 | absent |
| `phase_1_intro_week` | 2026-01-05 | 2026-01-11 | absent |
| `phase_2_threshold_expansion_1` | 2026-01-12 | 2026-01-25 | absent |

Foundation declares `starting_phase_id: "phase_0_re_entry_ramp"`;
Progression and Push declare `starting_phase_id: "phase_1_intro_week"` and
copy that says "Progression is the reference plan. Weekly template runs as
written."

**Code:** `grep -rn "starting_phase_id" src/ | grep -v '\.test\.'` → **one
hit, `schemas.ts:351`**. Nothing reads it. Phase selection is
`activePhaseFor` (`src/lib/engine/schedule.ts:188-224`), which filters by date,
prefers a `for_tier_ids` match, then falls to `matches[0]` — array order.
`phase_0` is authored first, so it wins on 2026-01-05..01-18 for **every**
tier, and `phase_1_intro_week` is unreachable for everyone.

The inversion is total: the ramp promised only to Foundation is given to all,
and the "runs as written" reference plan runs for nobody.

---

### A4 · `plan_tiers[].program_adjustments` is dead — every tier promise about dose is unimplemented · `DEAD`, `OVERPROMISED`

**Data declares** (rendered to the user at
`ProgramPreviewClient.tsx:502-527` and `IntakeClient.tsx:654-680` via
`typical_outcome`, which the adjustments are supposed to produce):

- `engine-builder` Foundation: `z1_session_reduction: 1`,
  `delay_norwegian_4x4_until_week: 5`
- `engine-builder` Push: `z1_volume_multiplier: 1.15`,
  `introduce_norwegian_4x4_at_week: 2`, `add_second_hard_session_from_week: 6`
- `engine-builder-block-2` Push: `add_third_optional_hard_from_week: 5`,
  `z1_volume_multiplier: 1.15`, `threshold_expansion_ceiling_minutes: 18`
- `engine-builder-block-2` Foundation: 2-week ramp, 4×4 delayed to week 5,
  threshold expansion shortened

**Code:** `grep -rn "program_adjustments\|z1_volume_multiplier\|delay_norwegian\|add_second_hard_session\|threshold_expansion_ceiling" src/ | grep -v '\.test\.'`
→ two hits, both comments/schema:
`schemas.ts:352` and `src/lib/engine/plan-generator.ts:522` ("*could* fall back
on plan_tiers[].program_adjustments if drill_library is unavailable").
**Nothing applies any of it.**

Tier therefore changes exactly three things across this cohort:
`typical_outcome` copy, phase selection where `for_tier_ids` is authored (none
of these five author it), and rowing's `weekly_template.push_tier_override`
(`schedule.ts:292-296, 344-362`) — which is `LIVE`, and is the only real
tier-differentiated plan content in the cohort. Everything else is the same
plan with a different sentence over it.

---

### A5 · The HERITAGE non-responder classifier can never emit a verdict · `DEAD` in effect

`engine-builder` and `rowing-2k-test-prep` author
`non_responder_classifier` (EB2 does not, despite being the block where the
threshold test would make it honest). Two consumer paths exist:

**Path 1 — the Progress chip. Orphaned.**
`src/components/progress/HeritageClusterChip.tsx` is never mounted:
`grep -rn "HeritageCluster" --include=*.tsx --include=*.ts . | grep -v node_modules`
returns only the definition and four comments. No JSX use, no dynamic import.
Additionally it calls `classify(program, store, { baselines })` with no
`targets`, so `progress_ratio_at_mid_block` is `undefined`
(`non-responder-classifier.ts:206-209`) and every rule short-circuits false.

**Path 2 — the proposal.** `src/lib/proposals/select.ts:227-304`
`selectNonResponder` resolves `targets` correctly (lines 253-261) but calls
`classify(program, store, { baselines: readings, targets })` at line 263 —
**no `intensity_compliance_pct`, no `session_compliance_pct`.** Both shipped
`under_dosing` rules require one:

- engine-builder: `progress_ratio_at_mid_block < 0.4 AND intensity_compliance_pct < 80`
- rowing: `progress_ratio_at_mid_block < 0.4 AND session_compliance_pct < 80`

`evaluateComparison` (`non-responder-classifier.ts:120-125`) returns `false`
when either operand is `undefined`, so `under_dosing` cannot fire.
`true_non_response` is deliberately suppressed to `insufficient_data`
(`non-responder-classifier.ts:344-393`, documented, founder decision
2026-09-04). `select.ts:264-269` returns `null` for anything that is not one of
those two verdicts.

**Net:** `non_responder_classifier` — the whole block, `variance_source`,
`patterns`, `recommendation_key`, all authored `copy` — reaches no user through
any path. `retest_metrics_mid_block` (EB week 4, rowing week 3) is `LIVE` as a
retest-due proposal (`select.ts:343`, `retest-readings.ts:62`) but the
classification it exists to feed is inert.

The suppression is documented and deliberate. The compliance gap is not: the
schema comment at `schemas.ts` `ClassifyOptions` says unset compliance means
under-dosing rules "will not fire (returns 'responding' instead)" — accurate,
and the only caller never sets them.

---

### A6 · engine-builder-block-2's resting-HR retest reads a test id that does not exist · `DEAD`

**Data declares:**

- `intake.physical_tests[0].id` = `resting_hr_morning`
- `retest_metrics[2]` = `{ metric_id: "resting_hr_bpm", source: "physical_test", source_ref: "morning_resting_hr", … }`

**Code:** `parseSource` (`src/lib/engine/retest-evaluator.ts:46-53`) returns
`{ kind: "physical_test", testId: "morning_resting_hr" }`; `evaluateSource`
(`retest-evaluator.ts:132-156`) looks it up in
`store.user_profile.capability_profile[testId]`. That map is keyed by intake
physical-test id — `IntakeClient.tsx:403-407` writes
`newCaps[testId] = { … measured_value: value }` iterating `testResults`. There
is no `morning_resting_hr` key, so `current` and `baseline` are permanently
`null` and the metric renders empty forever.

`engine-builder` gets this right (`source_ref: "resting_hr_morning"`). The name
is transposed in Block 2 only.

**Why nothing caught it:** `data-integrity.test.ts:1028` explicitly skips
`physical_test` refs — `if (source === "physical_test" || … ) continue;` — so
the one test that guards `source_ref` resolution does not look at this class.

---

### A7 · The in-app "Cites" strip renders for none of these five programmes · `INVISIBLE`

**Data:** 128 references across the cohort, all under
`evidence_base.references[]` (CSM 32, EB 35, EB2 32, rowing 29; hip 0), each
with `used_for`, plus a parallel `reference_ids[]`.

**Code:** `ProgramPreviewClient.tsx:394-402`:

```ts
const goals = program.goals as unknown as { references?: … };
const refs = goals?.references ?? [];
if (!refs.length || entry.personal) return null;
```

It reads `program.goals.references`. `goals.references` is empty in all five
(checked programmatically). The strip returns `null` every time.

`grep -rn "evidence_base" src/ | grep -v '\.test\.'` → two hits, both
comments (`schemas.ts:726`, `citations.ts:5`). **Nothing in the runtime reads
`evidence_base` at all.** `/evidence` (`app/evidence/page.tsx:38`) fetches
`/data/citations.json` — the global library, not per-programme — so
`reference_ids[]` has no runtime consumer either.

Consequence: every prose field under `evidence_base` is invisible —
`physiological_targets`, `session_rationale`, `progression_rationale`,
`outcome_evidence`, `outcome_by_tier`, `contraindications`,
`adaptive_engine_hooks`, `engineering_choices_flagged`,
`concurrent_strength_prescription`, and `hr_zone_methodology`.

---

### A8 · `hr_zone_methodology` — confirmed dead, and nothing depends on it · `DEAD`

Asked for specifically, so stated flatly.

**Data:** `engine-builder.json:1275` and `engine-builder-block-2.json:1236`, a
prose paragraph naming HUNT (Nes 2013), Karvonen %HRR, and DFA a1 = 0.75
(Rogers 2021), plus a preference order (observed HRmax > formula).

**Schema:** `evidenceBaseSchema` keeps it as `z.unknown().optional()`
(`schemas.ts:536`) — so it survives parse.

**Consumers:** `grep -rn "hr_zone_methodology" src/` → **one hit, the schema
line.** Zero readers.

**What depends on it — nothing, in either direction:**

- No zone computation exists anywhere in `src/` that could consult it. There
  is no HRmax derivation, no %HRR helper, no DFA a1 handling.
- Three references cite *back* to it in their `used_for` strings
  (`engine-builder.json:1474, 1483, 1492`: "Referenced in
  hr_zone_methodology", "Cited in hr_zone_methodology as the default",
  "…as the preferred method"). Those `used_for` strings are themselves only
  read by `data-integrity.test.ts:925`. So the citation justifies a paragraph,
  and the paragraph justifies nothing.
- HR targets that *do* reach a user are authored as literal strings inside
  block items (`intensity`, `note`), rendered as text. They are not derived
  from this methodology; it merely describes how the author picked them.

Deleting it would break nothing. Keeping it is a documentation choice, and it
should be described as author-facing documentation rather than as a live
methodology, because a reader of the JSON reasonably assumes the app computes
zones this way. It does not compute zones at all.

---

### A9 · `interference_hints` is read only by an orphaned function · `DEAD`

**Data:** CSM declares `incompatible_with: ["engine-builder"]`,
`min_recovery_h_from: { "engine-builder": 6 }`,
`contraindicated_modalities: ["hiit_glycolytic_daily"]`. Rowing declares
incompatibility with both engine-builder and CSM, and
`contraindicated_modalities: ["heavy_lower_body_lift_within_24h_of_threshold"]`.

**Code:** the only reader is `detectConflicts` in
`src/lib/engine/daily-plan.ts:83-101`, called by `composeDailyPlan`
(`daily-plan.ts:44`). `grep -rn "composeDailyPlan" src/` returns **the
definition and nothing else** — no caller, not even a test.

And even if it were called, `detectConflicts` reads only
`incompatible_with`. `compatible_with`, `contraindicated_modalities` and
`min_recovery_h_from` have no code path at all.

**Compounding:** CSM's `signal_completeness.currently_reads` tells the user the
engine reads *"Interference-window flags between strength and aerobic
sessions."* That is this feature. It does not run. → also `OVERPROMISED`.

---

### A10 · `signal_completeness` is read only by an unmounted component · `DEAD`

`src/components/progress/SignalCompletenessCard.tsx:35` reads
`program.signal_completeness`. The component is never rendered:
`grep -rn "SignalCompleteness" --include=*.tsx --include=*.ts . | grep -v node_modules`
returns the definition, the schema type alias (`schemas.ts:1895`) and nothing
else. The Progress rebuild moved to `app/report/page.tsx`, which mounts
`RetestMetricsPanel` (line 320) but not this card.

Four of five programmes author it (EB2 does not). Its content is a
transparency promise — "here is what the engine reads, here is what it would
additionally use" — and it reaches nobody. Two of its claims are separately
false (A9 above; A11 below), which is worse than not showing it, but the
current state is that neither the true nor the false parts render.

---

### A11 · Multi-day escalation stop rules — authored in four programmes, enforced and displayed in none · `SAFETY`, `INVISIBLE`, `UNENFORCED`

**Data declares** (`progression_rules.escalation` / `cycle_end_rule`):

- `anterior-hip-rebuild`: *"Night pain, a clear step-change in symptoms, or
  three amber weeks in a row means see the orthopaedist. Do not simply keep
  resetting the TM."*
- `engine-builder`: *"Two red days in the same week → skip the hard session
  that week. Three red days in a row, or any red day with unexplained resting
  HR elevation > 15 bpm, means take a full week off and consult a clinician if
  it persists."*
- `engine-builder-block-2`: *"Two red days in the same week → skip the VO2max
  session that week; do threshold + Z1 only. Three red days in a row → take a
  full week off before returning."*
- `anterior-hip-rebuild` `adaptive_engine.on_cycle_end.red_cycle`:
  *"Escalate to clinician if two red cycles consecutive."*

**Schema:** `progression_rules: z.record(z.string(), z.unknown())`
(`schemas.ts:718`) — survives parse. `adaptive_engine` likewise
(`schemas.ts:721`).

**Consumers:** zero.
`grep -rn "escalation\|week_end_rule\|cycle_end_rule\|assessment_timing\|assessment_note" src/ | grep -v '\.test\.'`
returns only unrelated matches (`app/check/page.tsx:24` is a colour comment,
`note-signals.ts:57` is about load reduction).
`grep -rn "adaptive_engine" src/` → one hit, the schema line.

**Nothing counts consecutive red or amber days.**
`grep -rn "consecutive\|streak" src/lib src/components | grep -v '\.test\.'`
finds only the *upward* green-streak check (`adapt.ts:529`, "the last 3 logged
days must be all green") and `select.ts:482`. There is no downward counter
anywhere.

What a user actually gets is a single generic line, identical for every
programme, from `components/check/CheckLiveVerdict.tsx:42`:
*"A symptom above 5/10 or a red-flag signal … back off. If persistent, see a
clinician."* Per-day, no counting, no programme-specific threshold, no
"skip the hard session this week", no "take a full week off".

This is the cluster where a comforting sentence is worse than silence: four
programmes state a multi-day stop rule as though the app watches for it. The
app does not watch. The rule is not even shown to the user, so they cannot
apply it themselves.

**One partial exception, `LIVE`:** `anterior-hip-rebuild`'s
`cycle_end_rule` ("all 4 weeks green → TM +5 squat / +7.5 pull; any amber →
hold; any red → TM −10%") *is* implemented — but by hardcoded logic in
`src/lib/engine/adapt.ts:144-201`, not by reading the string, and with
different numbers: `+7.5` squat / `+10` pull on a clean cycle
(`adapt.ts:165`), an RPE-ceiling hold the JSON never mentions
(`adapt.ts:169-181`), and `+5 / +7.5` in a second branch (`adapt.ts:184`).
`−10%` on red matches (`adapt.ts:192`). Classify as `MISLABELLED`: the JSON
reads as the specification and is not.

---

### A12 · `weekly_template.placement_principles` is never rendered — engine-builder's and Block 2's spacing rules are invisible · `SAFETY`, `INVISIBLE`

The 2026-09-05 fix taught `app/plan/page.tsx:737-744` to render **top-level
`principles[]` and `weekly_template.principles`**. Engine Builder and Block 2
author neither of the latter — they author
`weekly_template.placement_principles`.

`grep -rn "placement_principles" src/` → **zero hits.**

Unrendered, unenforced, for both programmes:

- "Never place hard sessions on consecutive days."
- "48+ h between Norwegian 4x4 and any other hard session in the same week."
- "24+ h between a hard cardio session and any concurrent strength session;
  6+ h if they must share a day."
- Block 2: "Push tier third hard session (Z3): only mid-week, 6+ h from
  primary hard sessions."
- Block 2: "Foundation tier: skip the Norwegian 4×4 in weeks 2-3 if HR won't
  hit target; use threshold cruise instead."

The last one is a conditional programme instruction, not just guidance, and it
has no channel to the user at all.

CSM, rowing and hip use `weekly_template.principles` and therefore **do**
render (`LIVE`) — including CSM's "6h min between any two sessions same day"
and rowing's "48h between hard sessions". Rendered as prose in
`RulesAccordion`; enforced by nothing (see A13).

---

### A13 · `schedule_constraints` — one field of six is read; `hard_day_separation_h` is not enforced against anything · `DEAD` (five fields), `LIVE` (one)

**Data:**

| programme | days_min/max | session_length_min_range | session_count_range | hard_day_separation_h | interference_ceiling_h |
|---|---|---|---|---|---|
| CSM | 4 / 6 | [30, 75] | [4, 6] | 48 | 6 |
| engine-builder | 3 / 5 | [30, 90] | [3, 5] | 48 | — |
| engine-builder-block-2 | 4 / 6 | [35, 110] | [4, 5] | 48 | — |
| rowing-2k | 4 / 6 | [30, 60] | [4, 5] | 48 | 6 |

**Consumers:** exactly one, `IntakeClient.tsx:228`:

```ts
const range = program?.schedule_constraints?.session_count_per_week_range;
… if (days < range[0]) return { title: `This program needs at least ${minDays} sessions per week`, … }
```

Only `session_count_per_week_range[0]` is read, and only as an intake refusal.
`available_days_min`, `available_days_max`, `session_length_min_range`,
`hard_day_separation_h` and `interference_ceiling_h` have **zero** readers
(`grep -rn "hard_day_separation_h\|interference_ceiling_h\|session_length_min_range\|available_days_m" src/`
→ schema lines only).

**`hard_day_separation_h` against the CSM weekly template — asked for
specifically.** No code compares the two. Nothing at authoring time, nothing at
render time, nothing when a user Moves a session. For the record, the template
it would be checked against is:

```
Sun block_z2_bike · Mon block_strength_heavy · Tue block_z2_bike
Wed block_strength_moderate · Thu block_4x4_row · Fri block_z2_row · Sat rest
```

Wed `block_strength_moderate` → Thu `block_4x4_row` is a **24 h** gap. Whether
an RPE ≤ 7 maintenance lift counts as a "hard day" is an authoring judgement I
do not make. The integrity point is that the judgement is never made by
anything: the constraint is a number in a file with no evaluator, so the
template could violate it by any margin and nothing would notice — at author
time or after the user reschedules.

The schema's own docstring (`schemas.ts:817-822`) claims "the generator uses
these to shape the user's plan against their intake (available days, session
length, hard-day separation) instead of a fixed layout array." The generator
does no such thing; the layout array is fixed. → `OVERPROMISED` in the schema
comment as well as in the data.

---

### A14 · engine-builder-block-2's `days_per_week: "3"` hint says "warn"; the code refuses · `MISLABELLED`

`engine-builder-block-2.json`, `days_per_week` option `3`:
`"hint": "Below the block's evidence-backed floor. Program will warn."`

`IntakeClient.tsx:220-238` returns a `blocker`, not a warning:
*"This program needs at least 4 sessions per week."* The intake cannot proceed.

The `severity: "warn"` mechanism exists and is used correctly elsewhere in the
same file's safety gates (`safety-gates.ts`); the capacity gate predates it and
is unconditionally fatal. The hint describes the behaviour the author expected.

---

### A15 · `deload_window` and `modality_options` · `DEAD`

- `deload_window` — CSM `{4-5 weeks, trigger "either"}`, rowing
  `{6 weeks, "scheduled"}`. `grep -rn "deload_window" src/` → one hit,
  `schemas.ts:833`. No deload scheduler consults it. `adapt.ts:81` has a
  hardcoded "days 21-27 of any 4-week cycle" banner that is a 5/3/1 artefact
  and does not read the field.
- `modality_options` — CSM declares three block substitutions
  (`block_z2_bike`, `block_z2_row`, `block_4x4_row`), rowing four.
  `grep -rn "modality_options" src/` → one hit, `schemas.ts:859`. The schema
  comment says "DailyPlan's composer honors this at composition time"; the
  composer is `composeDailyPlan`, which is the orphaned function from A9 and
  does not read this field even so. A user with no bike gets a bike session.

---

### A16 · `retest_metrics` aggregation: `median_of_window` has no branch, and `window_days` is honoured for exactly one mode · `DEAD` (two fields, conditionally)

`aggregation` and `window_days` **are** read —
`retest-evaluator.ts:311-317` extracts them, `:250-270` inherits them onto
mid-block siblings. But `evaluateSource` (`retest-evaluator.ts:113-208`)
implements only three of the four enum values:

| declared | branch | shipped in |
|---|---|---|
| `trend_slope` | `retest-evaluator.ts:182` | CSM, EB, EB2, rowing | `LIVE` |
| `best_of_last_n` | `retest-evaluator.ts:192` | rowing `row_2k_time_seconds` | `LIVE` |
| `latest` | fall-through, `:218` | CSM, EB2 | `LIVE` |
| `median_of_window` | **none** | EB `resting_hr_bpm`, EB2 `resting_hr_bpm` | `DEAD` |

`median_of_window` silently falls through to `latest` — a point sample instead
of a 7-day median, which is the difference the mode exists to remove.

`window_days` is read in **one** place only: the `best_of_last_n` branch
(`retest-evaluator.ts:196-203`). The `trend_slope` branch computes
first-third-vs-last-third of all matching values and never looks at
`window_days`, so CSM's / EB's / EB2's / rowing's declared 21-28 day windows
have no effect. EB's and EB2's `window_days: 7` on `resting_hr_bpm` is doubly
inert: the mode is unimplemented *and* the source is `physical_test`, which
ignores aggregation entirely (`retest-evaluator.ts:132-156`).

---

### A17 · Block-item DSL strings: `condition` never appears; `skip_if` is dead · `DEAD`

Asked for specifically. `blockItemSchema` (`schemas.ts:117-136`) declares both
`condition: z.string().optional()` and `skip_if: z.string().optional()`.

**Are they evaluated?** No.

- `condition` on a block item: **no programme in this cohort authors one**
  (walked every `blocks[].items[]` and `blocks[].segments[].items[]`). The only
  `condition` the app evaluates is `plan_tiers[].condition`, via
  `intake-tier.ts:468` — a different field on a different object.
- `skip_if`: authored once, `anterior-hip-rebuild` `block_a_home` →
  `hip_switch_9090` → `"skip_if": "pinches"`. `grep -rn "skip_if" src/` returns
  `schemas.ts:132` and five hits for the unrelated `skip_if_value_in` on
  `phase_gates` (`schedule.ts:166`). Nothing evaluates the item-level string.
  Note the value `"pinches"` is not even DSL-shaped — there is no expression
  language it belongs to.

Same class, also dead: `progress_to` (`adductor_iso_bent` →
`adductor_iso_extended`) and `after_weeks: 2`, which together encode an
automatic progression after two weeks. `grep -rn "progress_to\|after_weeks\|starts_week" src/ | grep -v '\.test\.'`
→ zero non-schema hits. The exercise never progresses.

Block-level `phase_gated` (hip ×8, EB ×1, EB2 ×1) — `grep -rn "phase_gated" src/`
returns only `schemas.ts:61` and `:162`. Dead, though harmlessly so:
phase scoping is achieved by `phases[].blocks[]` membership, so the field is
redundant rather than load-bearing.

`item.optional` **is** `LIVE` (`DaySession.tsx:483`).

---

### A18 · `plan_tiers[].outcome_confidence` · `DEAD`

`realistic` / `fair` / `stretch`, authored on all three tiers of CSM, EB, EB2
and rowing. `grep -rn "outcome_confidence" src/` → one hit, `schemas.ts:349`.

The tier card renders `typical_outcome` (`ProgramPreviewClient.tsx:524`,
`IntakeClient.tsx:678`) with no confidence qualifier, so rowing's Push
("2K down 3-8 seconds", `stretch`) and CSM's Foundation
("submax HR down 5-10 bpm", `realistic`) are presented with identical
authority. The field exists precisely to prevent that and does not reach the
DOM. `full_goal_weeks_estimate` is dead by the same grep.

---

### A19 · `program_goal.metric` / `target_value` / `direction` · `DEAD`; only `display_name` is read

Four of five declare a `program_goal` (hip does not). Consumers:
`StatusCards.tsx:193, 305` and `reveal-copy.ts:127` — **all three read
`display_name` only**, and `reveal-copy.ts:114-116` documents that it is being
used as a name string. `metric`, `target_value`, `stretch_value`, `unit` and
`direction` have no reader.

CSM's `program_goal.metric` is `submax_hr_at_fixed_pace_bpm`; its
`retest_metrics` metric id is `submax_hr_pace5_bpm`. The two would not join
even if something tried.

---

### A20 · `goals.block_2_targets` — Block 1's twin is read, Block 2's is not · `INVISIBLE`

`StatusCards.tsx:332-335` reads `program.goals.block_1_targets` to render the
arc-verdict chip. `engine-builder-block-2` authors the parallel
`goals.block_2_targets`; `grep -rn "block_2_targets" src/` → **zero hits**.
Block 2 users get no verdict chip.

Same file, `LIVE`: `next_block_slug` (`StatusCards.tsx:311`) — engine-builder
declares it and the Block 2 hand-off link works.

---

## B. Remaining dead top-level keys (declared, schema-kept, zero readers)

Each verified with `grep -rn "<key>" src/ | grep -v '\.test\.'` returning only
`schemas.ts`.

| key | programmes | note |
|---|---|---|
| `immediate_actions` | all five | 2-4 authored actions each, incl. hip's "Book the physiotherapy appointment" — CLAUDE.md calls physio the highest-value unaddressed action, and it is unrendered |
| `adaptive_engine` | hip | 6 keys; its own `note` says "Full engine ships in the Next.js migration. Below is the specification." It shipped; this did not |
| `equipment_inventory` | hip | |
| `exercise_overrides_note` | hip | schema comment already says "authored, never rendered" |
| `training_maxes.progression_rule`, `.reset_rule_5_3_1`, `.evaluation_week`, `.starting_values_note` | hip | siblings of the known SHAPE-ONLY `starting_values_kg` |
| `goals.non_negotiables`, `.waypoints`, `.explicit_non_goals`, `.muscle_memory_expectation`, `.stretch_ambition`, `.crossfit_hyrox_readiness`, `.history`, `.modality_policy`, `.arc`, `.primary_intent` | hip / CSM / EB / EB2 / rowing | `goals` is `z.record(z.unknown())`, so everything under it survives parse and nothing but the four named sub-keys in A20/§C is read |
| `status_note` | all five | includes EB's "A third polarised block was planned and does NOT exist" — an honesty note no user sees |
| `blocks[].substitutions` | hip `block_squat_variant`, EB / EB2 `block_norwegian_4x4` | EB's is a bail-out rule: "if HR won't climb on set 1 — bail out, switch to Z1 easy for 30 min" |
| `blocks[].excluded` | hip `block_a_home` | couch stretch / pigeon / cobra with reasons — a contraindication list, unrendered. `SAFETY` |
| `phases[].test_at_end`, `.test_window`, `.week_by_week`, `.cycle_structure`, `.reintroduction_gate`, `.note_holiday_gap`, `.gating` | hip, EB, EB2 | all in `phaseSchema`, none read |
| `evidence_base.*` (10 prose fields + `reference_ids`) | CSM, EB, EB2, rowing | see A7 |
| `specialist_review` | none of the five author it | schema-only; noted so the ratio is honest |

---

## C. `LIVE` — what actually works

The denominator matters. These were each traced to a consumer that changes
behaviour or renders.

| declaration | consumer | effect |
|---|---|---|
| `symptom_regions[]` | `lib/symptom-regions.ts:145`, `app/check/page.tsx` | morning check asks each programme's own regions. CSM low_back/knee/shoulder, EB+EB2 low_back/knee/achilles, rowing low_back/knee/wrist, hip its clinical four. All ids resolve |
| `symptom_flags[]` | `symptom-regions.ts:147` | hip gets night_pain + gait_change + painful_click; others night_pain |
| `load_signals[]` | `lib/load-signals.ts:150-153`, `SymptomLoadChart.tsx` | CSM squat/pull kg; EB, EB2, rowing `aerobic_minutes`. All resolve against `LOAD_SIGNALS` |
| `intake.safety_gates[]` incl. `severity: "warn"` | `lib/engine/safety-gates.ts`, `IntakeClient.tsx:216` | hard blocks and acknowledgeable warns both work. 7 gates on EB, 7 on EB2, 6 each on CSM and rowing |
| `intake.consent[]`, `intake.questions[]`, `physical_tests[]` incl. `ranges` | `IntakeClient.tsx` | rendered, required-count logic correct |
| `plan_tiers[].condition` | `intake-tier.ts:468` | works for CSM, EB, rowing (rowing via `SELF_REPORT_TO_TEST_VAR` mm:ss parsing at `:389`). Fails for EB2 Push — A2 |
| `weekly_template.week` / `week_N.layout` / `push_tier_override` | `schedule.ts:273-362` | the actual plan. Rowing's Push override is the cohort's only working tier differentiation |
| `phases[].block_replacements` | `schedule.ts:314` | rowing phase_2's race-pace → race-plan-rehearsal swap. Added 2026-09-03, works |
| `phases[].weekly_overrides` | `schedule.ts:256-261` | hip phase_2 |
| `phases[].runs_cycle_end_eval` | `adapt.ts:75` | hip |
| `blocks[].items[].optional` | `DaySession.tsx:483` | |
| `exercise_overrides` | `data-loader.ts:99-118` | hip's per-person clinical copy, merged without polluting the shared library |
| `onboarding_steps[]` | `OnboardingRunner.tsx:77`, mounted at `AppShell.tsx:148` | all five author 3 steps; all render |
| `generation_strategy` | `adapters/index.ts:25`, `plan-generator.ts:62` | |
| `positioning` | `ProgramPreviewClient.tsx:341` | CSM + rowing `main_track` |
| `retest_metrics[]` (`metric_id`, `source`, `source_ref`, `direction`, `targets`, `cadence_weeks`) | `retest-evaluator.ts`, `RetestMetricsPanel` at `app/report/page.tsx:320` | works except A6 and A16 |
| `retest_metrics_mid_block[]` | `select.ts:343`, `retest-readings.ts:62` | retest-due proposals fire (EB wk4, rowing wk3) |
| `goals.progression_targets` | `adapt.ts:300-301` | hip |
| `goals.block_1_targets` | `StatusCards.tsx:334` | EB only — A20 |
| `goals.concurrent_strength_policy` | `TodaySession.tsx:330` | EB |
| `goals.next_block_slug` | `StatusCards.tsx:312` | EB → EB2 |
| top-level `principles[]` | `app/plan/page.tsx:148, 739` | since 2026-09-05. All five author 5-7 rules; all now render |
| `weekly_template.principles` | `app/plan/page.tsx:741` | CSM, rowing, hip. **Not** EB / EB2 — A12 |
| `reviewed_by`, `reviewed_at`, `review_evidence`, `status_history` | `ProgramPreviewClient.tsx:240-261` | |
| `blocks[].duration_min`, `frequency_per_week`, `category`, `items[].scheme/sets/reps/hold_seconds/intensity` | session rendering | |

---

## D. Summary table

| # | declaration | programme(s) | class | safety |
|---|---|---|---|---|
| A1 | `is_taper`, `duration_multiplier`, `block_replacements_final_week` stripped by Zod | rowing | DEAD (2 live consumers orphaned) | ● |
| A2 | Push tier condition untokenizable (`-8`) | EB2 | DEAD | |
| A3 | phase_0 / phase_1 date overlap + dead `starting_phase_id` | EB2 | DEAD + OVERPROMISED | |
| A4 | `plan_tiers[].program_adjustments` | EB, EB2 | DEAD, OVERPROMISED | |
| A5 | `non_responder_classifier` cannot emit a verdict | EB, rowing | DEAD in effect | |
| A6 | `source_ref: "morning_resting_hr"` — no such test id | EB2 | DEAD | |
| A7 | `evidence_base` has no runtime reader; Cites strip reads `goals.references` | CSM, EB, EB2, rowing | INVISIBLE | |
| A8 | `hr_zone_methodology` | EB, EB2 | DEAD | |
| A9 | `interference_hints` → orphaned `composeDailyPlan` | CSM, rowing | DEAD + OVERPROMISED | ● |
| A10 | `signal_completeness` → unmounted component | hip, CSM, EB, rowing | DEAD | |
| A11 | multi-day escalation / red-streak stop rules | hip, EB, EB2 | UNENFORCED + INVISIBLE | ● |
| A11b | hip `cycle_end_rule` implemented with different numbers in `adapt.ts` | hip | MISLABELLED | |
| A12 | `weekly_template.placement_principles` never rendered | EB, EB2 | INVISIBLE + UNENFORCED | ● |
| A13 | `hard_day_separation_h`, `interference_ceiling_h`, `available_days_*`, `session_length_min_range` | all four | DEAD | ● |
| A14 | `days_per_week: "3"` hint says warn, code blocks | EB2 | MISLABELLED | |
| A15 | `deload_window`, `modality_options` | CSM, rowing | DEAD | |
| A16 | `median_of_window` unimplemented; `window_days` honoured only for `best_of_last_n` | EB, EB2, + all | DEAD (partial) | |
| A17 | `skip_if`, `progress_to`, `after_weeks`, `phase_gated` on blocks/items | hip, EB, EB2 | DEAD | |
| A18 | `plan_tiers[].outcome_confidence`, `full_goal_weeks_estimate` | CSM, EB, EB2, rowing | DEAD | |
| A19 | `program_goal.metric/target_value/direction` | CSM, EB, EB2, rowing | DEAD | |
| A20 | `goals.block_2_targets` | EB2 | INVISIBLE | |
| §B | 12 further top-level / nested keys | all five | DEAD | ● (`blocks[].excluded`, `substitutions`) |

Roughly: **28 distinct declared surfaces are dead, unenforced, invisible or
mislabelled; 28 are live.** Every programme in the cohort is affected, and
`engine-builder-block-2` carries four defects that are unique to it (A2, A3,
A6, A14, A20) — consistent with it being the most recently authored and having
been copied from Block 1 rather than derived.

---

## E. SAFETY — protective claims that are not enforced

Listed separately because a stated safeguard nobody enforces is worse than
silence: the user reasonably stops watching for the thing themselves.

1. **Multi-day red/amber escalation (A11).** Four programmes state a
   stop-and-escalate rule keyed on consecutive red or amber days/weeks —
   including "consult a clinician" and "see the orthopaedist". No consecutive-red
   counter exists anywhere in `src/`. Neither enforced nor displayed.

2. **Hard-day separation (A12, A13).** Every programme declares 48 h between
   hard sessions, and 6-24 h between hard cardio and strength.
   `hard_day_separation_h` and `interference_ceiling_h` have zero readers;
   EB's and EB2's prose versions live in `placement_principles`, which is on no
   rendering path. Nothing checks the shipped template against the number, and
   nothing checks a user-moved session against it either.

3. **Rowing's taper (A1).** `is_taper` and `block_replacements_final_week` are
   deleted by `programSchema.parse` before the two functions that read them.
   The taper-week de-load of high-CNS blocks does not happen, and the Today
   banner that would tell the user they are tapering does not render — in the
   two weeks before a maximal test.

4. **Cross-programme interference (A9).** CSM declares engine-builder
   incompatible and a 6 h minimum recovery; rowing declares two incompatible
   programmes and a "no heavy lower-body lift within 24 h of threshold"
   contraindication. The only reader is a function with no caller. Worse, CSM's
   `signal_completeness` tells the user the engine reads interference windows.

5. **`blocks[].excluded` (§B).** hip's `block_a_home` lists couch stretch,
   pigeon and prone press-up with clinical reasons ("too aggressive into
   anterior hip", "deep flexion plus adduction"). Unrendered. CLAUDE.md's hard
   constraint is that provocative positions never reappear without a phase gate
   — the exclusion list is honoured in what the block *contains*, but the
   warning about what the user might add themselves reaches nobody.

6. **engine-builder's 4×4 bail-out (§B, `substitutions`).** "If HR won't climb
   on set 1: bail out, switch to Z1 easy for 30 min. Reschedule with 48 h
   clear." A mid-session stop rule with no consumer.

7. **hip's `adaptive_engine.on_symptom_flare` (§B).** "Cap today's suggestion
   at 90% of prescription. Banner on Today. Do not increment TM this cycle."
   Zero readers. A red-state load cap does exist in the app, hardcoded and
   audited centrally (`lib/symptom-state.ts`, per CLAUDE.md's deliberate split),
   so the protection is not absent — but the programme's own statement of it is
   not what provides it, and the two are not checked against each other.

---

## F. Two observations about why these survived

Not recommendations — the pattern, since it recurs.

**The cast is the hole.** A1 and the historical `phase_gates` bug are the same
failure: a consumer reaches for a field via `as unknown as { … }`, which the
compiler cannot check against `schemas.ts`, and Zod has already deleted the
data. Three casts of this exact shape are live in the cohort right now
(`TodaySession.tsx:310`, `schedule.ts:318`, `schedule.ts:323`) and all three
read stripped keys.

**The orphaned consumer is the second hole.** A9 and A10 are fields with a real,
correct reader that nothing calls or mounts. A grep for the key name finds a
consumer and looks satisfying; the field is dead anyway. `composeDailyPlan`,
`HeritageClusterChip` and `SignalCompletenessCard` all pass a naive
consumer-exists check.
