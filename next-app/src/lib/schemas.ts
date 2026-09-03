import { z } from "zod";

/**
 * Zod schemas for the program data files and localStorage log.
 * These define the runtime contract — any file or state that fails validation
 * is treated as corrupt and either sanitized or discarded.
 */

// Movement library entry
/**
 * v2 additions to the movement library. Every exercise gains capability tagging,
 * a difficulty level within its capability domain, prerequisite gating, external-
 * focus cues (Wulf 1998, 2013), a feedback type (Chiviacowsky & Wulf 2002),
 * and a retest metric. All optional so legacy exercises continue to validate;
 * multi-dimensional programs (Handstand Walk et al.) require them.
 */
export const drillLevelSchema = z.union([
  z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5),
]);

export const drillPrerequisiteSchema = z.object({
  capability_domain: z.string(),
  minimum_level: drillLevelSchema,
  rationale: z.enum(["injury_mitigation", "coordination_prerequisite", "load_tolerance"]),
  source: z.enum(["literature", "coaching_consensus", "engineering"]),
  evidence_ref: z.string().optional(),
});

export const drillRetestMetricSchema = z.object({
  name: z.string(),
  unit: z.string(),
  better: z.enum(["higher", "lower"]),
});

export const exerciseSchema = z.object({
  id: z.string(),
  name: z.string(),
  /**
   * P1-79 (2026-08-19) — the parenthetical modifier extracted out of
   * `name` so cards can render it as a subtitle instead of truncating
   * "Active hang (scap-engaged)" mid-word. Optional; only present on
   * exercises whose original name had a `(...)` variant clause.
   */
  variant: z.string().optional(),
  name_et: z.string().optional(),
  category: z.string(),
  targets: z.array(z.string()).optional(),
  default: z.record(z.string(), z.unknown()).optional(),
  setup: z.string().optional(),
  cues: z.array(z.string()).optional(),
  rationale: z.string().optional(),
  warning: z.string().optional(),
  avoid: z.string().optional(),
  notes: z.string().optional(),
  flags: z.array(z.string()).optional(),
  video_search: z.string().optional(),
  video_url: z.string().optional(),
  progression: z.string().nullable().optional(),
  regression: z.string().nullable().optional(),
  prerequisite: z.string().optional(),
  phase_gated: z.boolean().optional(),

  // v2 additions — optional for legacy exercises, required for new drills
  // authored on the multi-dimensional generation strategy
  capability_domains: z.array(z.string()).optional(),
  level: drillLevelSchema.optional(),
  prerequisites: z.array(drillPrerequisiteSchema).optional(),
  cues_external_focus: z.array(z.string()).optional(),
  cues_internal_focus: z.array(z.string()).optional(),
  feedback_type: z.enum(["KR", "KP", "self_controlled"]).optional(),
  retest_metric: drillRetestMetricSchema.optional(),
  default_dose: z.object({
    sets: z.number().optional(),
    reps: z.number().optional(),
    duration_s: z.number().optional(),
  }).optional(),
  rest_between_s: z.number().optional(),
  evidence_refs: z.array(z.string()).optional(),
});

/**
 * Per-program override of shared movement-library copy.
 *
 * `exercises.json` is shared across the whole catalog, so its `cues` and
 * `rationale` must stay general coaching copy. Constraints that belong to one
 * person's clinical record (shoulder retroversion, a Bertolotti segment, a
 * documented left glute-max deficit) live here, scoped to the program that owns
 * them, and are merged in at render time by `applyProgramExerciseOverrides`.
 *
 * `cues` replaces the library list; `cues_append` adds to it. Use `cues` when the
 * personal wording is a more specific version of the same cue, `cues_append` when
 * it is purely additive.
 */
export const exerciseOverrideSchema = z.object({
  cues: z.array(z.string()).optional(),
  cues_append: z.array(z.string()).optional(),
  cues_external_focus: z.array(z.string()).optional(),
  cues_internal_focus: z.array(z.string()).optional(),
  setup: z.string().optional(),
  rationale: z.string().optional(),
  warning: z.string().optional(),
  /** Merged into `exercise.default.extra_set_side` — drives the laterality badge. */
  extra_set_side: z.string().optional(),
});

export type ExerciseOverride = z.infer<typeof exerciseOverrideSchema>;

export const exercisesFileSchema = z.object({
  schema_version: z.string(),
  exercises: z.array(exerciseSchema),
  categories: z.array(z.string()).optional(),
  targets: z.array(z.string()).optional(),
  class_modifications: z.array(z.record(z.string(), z.unknown())).optional(),
});

// Program: phase + block + item structure
export const blockItemSchema = z.object({
  exercise_id: z.string().nullable().optional(),
  name: z.string().optional(),
  order: z.union([z.string(), z.number()]).optional(),
  role: z.string().optional(),
  scheme: z.string().optional(),
  reps: z.number().optional(),
  sets: z.number().optional(),
  hold_seconds: z.number().optional(),
  distance_m: z.number().optional(),
  intensity: z.string().optional(),
  optional: z.boolean().optional(),
  progress_to: z.string().optional(),
  after_weeks: z.number().optional(),
  condition: z.string().optional(),
  skip_if: z.string().optional(),
  note: z.string().optional(),
  starts_week: z.number().optional(),
  extra_set_side: z.string().optional(),
});

export const blockSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z
    .enum(["strength", "accessory", "run", "skill", "endurance", "rehab", "mobility"])
    .optional(),
  /**
   * v2 multi-dim: the capability domain this block primarily targets. When
   * set AND the program is `multi_dimensional` AND the plan generator is
   * called with `drillsById`, block.items get REPLACED with drills composed
   * from `program.drill_library` — filtered to those that target this
   * capability, at the user's estimated level (±1), with prerequisites met.
   * Blocks WITHOUT this field keep their authored item list unchanged.
   */
  capability_slot: z.string().optional(),
  /**
   * How many drills the composer should place in this slot per session.
   * Defaults to 2 if unset. Range: 1-5.
   */
  slot_drill_count: z.number().min(1).max(5).optional(),
  location: z.string().optional(),
  frequency: z.string().optional(),
  frequency_per_week: z.number().optional(),
  duration_min: z.union([z.number(), z.tuple([z.number(), z.number()])]).optional(),
  phase_gated: z.string().optional(),
  note: z.string().optional(),
  items: z.array(blockItemSchema).optional(),
  segments: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        duration_min: z.number().optional(),
        items: z.array(blockItemSchema),
        warning: z.string().optional(),
      }),
    )
    .optional(),
  substitutions: z.record(z.string(), z.unknown()).optional(),
  equipment: z.array(z.string()).optional(),
  excluded: z.array(z.record(z.string(), z.unknown())).optional(),
});

export const phaseSchema = z.object({
  id: z.string(),
  name: z.string(),
  starts: z.string(),
  ends: z.string().nullable().optional(),
  duration_weeks: z.union([z.number(), z.tuple([z.number(), z.number()])]).nullable().optional(),
  blocks: z.array(z.string()),
  /**
   * Which tier(s) this phase applies to. When set, `activePhaseFor()`
   * prefers phases whose `for_tier_ids` contains the user's tier over
   * date-only matches. Multi-tier skill programs (handstand-walk,
   * first-strict-pullup, muscle-up) author one phase per tier with
   * identical `starts` dates; without this field, `activePhaseFor()` uses
   * `.find()` and always returns the first (Tier A), so higher-tier users
   * get Tier A drills. Comprehensive audit 2026-08-18 P0-6.
   */
  for_tier_ids: z.array(z.string()).optional(),
  rationale: z.string().optional(),
  /**
   * Substitute one block for another for this phase's whole duration, keyed
   * old_id → new_id. Applied in `strengthBlockIdsForDate` BEFORE the
   * phase-scope filter, so the substitute only has to appear in this phase's
   * `blocks[]`.
   *
   * `block_replacements_final_week` already existed but fires only on a taper
   * phase in its last 7 days, so a phase wanting a substitution for its whole
   * length had no way to express it and would have had to edit the shared
   * `weekly_template`, changing every phase at once. Added 2026-09-03 so
   * rowing's threshold build can turn its weekly race-pace session into a
   * race-PLAN rehearsal — same slot, different intent.
   */
  block_replacements: z.record(z.string(), z.string()).optional(),
  goal: z.string().optional(),
  template: z.string().optional(),
  template_note: z.string().optional(),
  note: z.string().optional(),
  cycle_structure: z.record(z.string(), z.unknown()).optional(),
  test_at_end: z.string().optional(),
  test_window: z.string().optional(),
  reintroduction_gate: z.record(z.string(), z.unknown()).optional(),
  week_by_week: z.record(z.string(), z.unknown()).optional(),
  notes: z.array(z.string()).optional(),
  gating: z.string().optional(),
  note_holiday_gap: z.string().optional(),
  /**
   * Opt-in for the 5/3/1 cycle-end evaluator in `engine/adapt.ts`. When true,
   * a phase entering days 21-28 will fire the AMRAP-vs-expected review and
   * propose TM adjustments. Legacy default false so pre-migration programs
   * don't accidentally start firing evaluations. Anterior Hip Rebuild's
   * phase_2/3/4 should have this = true.
   */
  runs_cycle_end_eval: z.boolean().optional(),
  /**
   * Per-week schedule overrides that supersede the default
   * `weekly_template.week` for a specific date range. Use when a phase has
   * specific weeks with different content than the default — e.g. eval week
   * (5RM tests replace the usual heavy sessions), taper week (light + rest
   * days replace the usual pattern), race / peak weeks, etc.
   *
   * Semantics:
   *  - Each override maps `days: { Mon: "block_id_a block_id_b", ... }`.
   *  - Days present in the map use the override's session string.
   *  - Days NOT in the map fall through to the default `weekly_template.week`.
   *  - Empty string ("") = explicit rest day, overriding the default block.
   *  - Multiple overrides can exist per phase; the first matching window wins.
   */
  weekly_overrides: z
    .array(
      z.object({
        starts: z.string(),
        ends: z.string(),
        note: z.string().optional(),
        days: z.record(
          z.enum(["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]),
          z.string(),
        ),
      }),
    )
    .optional(),
});

export const milestoneSchema = z.object({
  date: z.string(),
  phase: z.string(),
  lift: z.string(),
  target_tm_kg: z.number(),
  stretch_tm_kg: z.number().optional(),
  waypoint: z.boolean().optional(),
  note: z.string().optional(),
});

/**
 * Intake question shown before a program starts. Answers feed the plan
 * generator to pick the right tier (foundation / progression / push).
 * Deliberately generic so a single UI renders any program's intake.
 */
export const intakeQuestionSchema = z.object({
  id: z.string(),
  label: z.string(),
  type: z.enum(["select", "number", "boolean", "text", "slider"]),
  required: z.boolean().optional(),
  help: z.string().optional(),
  unit: z.string().optional(),
  min: z.number().optional(),
  max: z.number().optional(),
  step: z.number().optional(),
  options: z
    .array(
      z.object({
        value: z.string(),
        // Some programs omit `label` on options where the value is
        // self-explanatory ("yes" / "no" / "unsure"). Fall back to the
        // value in the renderer rather than 500-ing the whole program.
        label: z.string().optional(),
        hint: z.string().optional(),
      }),
    )
    .optional(),
});

/**
 * Physical benchmark test the user performs during the intake week and
 * records the result of. Different from a question — this is a "go do the
 * movement and record your number".
 */
export const physicalTestSchema = z.object({
  id: z.string(),
  label: z.string(),
  instructions: z.string(),
  unit: z.string(), // "reps", "seconds", "kg", "m", "bpm"
  min: z.number().optional(),
  max: z.number().optional(),
  video_url: z.string().optional(),
  video_search: z.string().optional(),
  /**
   * Audit 2026-08-18 (#68) — non-clinician users struggle to estimate
   * "shoulder flexion in degrees, standing". Adding `ranges` lets a
   * program author declare discrete-choice buckets (each with a human
   * label + representative numeric value) so the intake renders as an
   * option-row list instead of a raw number input. The chosen bucket's
   * `value` gets written to test_results as the numeric surrogate,
   * preserving downstream tier-inference math.
   *
   * When `ranges` is present, the intake renders the list. When absent,
   * it falls back to the numeric input.
   */
  ranges: z
    .array(
      z.object({
        label: z.string(),
        description: z.string().optional(),
        value: z.number(),
      }),
    )
    .optional(),
});

/**
 * A single tier the plan generator can pick between. Condition is a
 * machine-evaluable expression over intake answers (e.g. "dead_hang_seconds >= 30 && band_pullups >= 3").
 * Kept as a string here — the generator function evaluates it in code, so we
 * don't ship an unsafe eval to the client.
 */
export const planTierSchema = z.object({
  id: z.string(), // "foundation" | "progression" | "push" | custom
  label: z.string(),
  condition: z.string(),
  typical_outcome: z.string(), // "1-3 heavy-band assisted pull-ups"
  outcome_confidence: z.enum(["realistic", "fair", "stretch"]).optional(),
  full_goal_weeks_estimate: z.number().optional(),
  starting_phase_id: z.string().optional(), // which phase in the program's phases[] to start at
  program_adjustments: z.record(z.string(), z.unknown()).optional(), // per-tier tweaks (starting TM %, volume multiplier, etc.)
});

/**
 * B3 (Phase 4): declarative onboarding step primitives.
 *
 * Each program JSON declares an `onboarding_steps` array against a closed
 * union of five kinds. The `<OnboardingRunner>` component renders them.
 * See dev/design-briefs/2026-08-17-b3-program-agnostic-onboarding.md.
 *
 * Consent-first: NO step writes symptom (Article 9 medical) data. The old
 * hip-flow's silent `setDaySymptoms` write is removed — symptom capture
 * happens on `/check` where consent language already lives.
 */
export const onboardingStepSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("scale_anchor"),
    title: z.string(),
    body_md: z.string(),
    anchors: z.object({
      low: z.string(),
      mid: z.string(),
      high: z.string(),
    }),
  }),
  z.object({
    kind: z.literal("life_load"),
    title: z.string(),
    body_md: z.string(),
    // The Life-load step captures a self-reported 0-10 stress signal —
    // NOT medical data. Persisted via setDaySymptoms.life_load only.
    write_on_complete: z.boolean().default(true),
  }),
  z.object({
    kind: z.literal("symptom_primer"),
    title: z.string(),
    body_md: z.string(),
    // Fields shown as an information list — the user is being TOLD what
    // they'll be asked on /check each morning, not asked here.
    fields: z.array(z.string()).min(1),
    gdpr_note: z.string().optional(),
  }),
  z.object({
    kind: z.literal("scan_anchor"),
    title: z.string(),
    body_md: z.string(),
    cta_href: z.string().optional(),
    cta_label: z.string().optional(),
  }),
  z.object({
    kind: z.literal("custom_copy"),
    title: z.string(),
    body_md: z.string(),
  }),
]);

export const onboardingStepsSchema = z.array(onboardingStepSchema);

/**
 * F1 Path 1 (2026-08-17): signal-completeness surface.
 *
 * Each program declares what the engine currently reads from the user's log,
 * and what it would additionally use if the user were willing to log or
 * connect more. Rendered on Progress as a non-graded transparency card —
 * NOT an A/B/C/D grade (research showed letter grades read as failing;
 * see dev/audits/product-concerns/A-trackability-transparency.md).
 *
 * Consent-first: shipping this makes engine limits visible so users can
 * co-build adaptiveness rather than trust a black box.
 */
export const signalCompletenessSchema = z.object({
  currently_reads: z.array(
    z.object({
      label: z.string(),
      detail: z.string().optional(),
    }),
  ),
  would_additionally_use: z
    .array(
      z.object({
        label: z.string(),
        why_it_matters: z.string(),
        user_action_free: z.string(),
        user_action_paid: z.string().optional(),
      }),
    )
    .optional(),
});

/**
 * Program-level intake + generator + goal metadata. All optional — Margus's
 * legacy program was authored before this was a formalised contract, so it
 * validates without these fields. New programs authored for the catalog SHOULD
 * populate them.
 */
export const programIntakeSchema = z.object({
  duration_days: z.number(), // usually 1-7
  questions: z.array(intakeQuestionSchema),
  physical_tests: z.array(physicalTestSchema).optional(),
  consent: z
    .array(
      z.object({
        id: z.string(),
        label: z.string(),
        required: z.boolean(),
      }),
    )
    .optional(),
  /**
   * Program-declared safety gates. Each entry references an intake question
   * by id and names the answer values that hard-block starting the program.
   * When any gate fires, the intake wizard shows `block_title` + `block_body`
   * and refuses to continue. Fixes F-103: contraindication gating was
   * hardcoded to Handstand Walk fields, ignoring each program's own
   * documented contraindications.
   */
  safety_gates: z
    .array(
      z.object({
        question_id: z.string(),
        unsafe_values: z.array(z.string()),
        block_title: z.string(),
        block_body: z.string(),
        /**
         * How hard the gate holds. Absent → "block", so silence can never
         * loosen an existing refusal.
         *
         * Added 2026-09-03. A gate could only hard-block, so an author facing
         * a question where refusal was too blunt and silence too permissive
         * chose silence — seven of eight programs have at least one risky
         * answer that reaches no gate. "warn" is the middle: the user is told
         * what their answer means, must acknowledge it, and the
         * acknowledgement is persisted as `safety_ack.<question_id>`.
         *
         * Evaluated only in `lib/engine/safety-gates.ts`. Which gate gets
         * which severity is a clinical decision for the program's author; how
         * a severity behaves is not.
         */
        severity: z.enum(["block", "warn"]).optional(),
        /** Warn-only: what the user is ticking. Defaults to a generic line. */
        acknowledge_label: z.string().optional(),
      }),
    )
    .optional(),
});

export const programGoalSchema = z.object({
  metric: z.string(), // "max_strict_pullups" | "500m_row_seconds" | "resting_hr" | ...
  target_value: z.number(),
  stretch_value: z.number().optional(),
  display_name: z.string(),
  unit: z.string().optional(),
  direction: z.enum(["higher_is_better", "lower_is_better"]).default("higher_is_better"),
});

/**
 * Evidence base — the honest "why" behind a program's structure. Optional so
 * legacy programs still parse, but strongly encouraged for any new endurance /
 * strength template shipped in the catalog. Renders on the program's intro
 * page (below the marketing copy) so the user can see the reasoning and the
 * research it rests on before they commit.
 *
 * `session_rationale` is keyed by block_id so we can render a "why this
 * session" tooltip next to each session in the plan preview.
 *
 * `references` is a lightweight bibliography. Every entry needs a `used_for`
 * field so we know which claim each citation backs.
 */
export const evidenceBaseSchema = z.object({
  // Documentation-only fields — the app never reads their internal shape,
  // just displays whatever prose the program author supplies. Allow either
  // strings, arrays of strings, or richer nested objects (some newer
  // programs use objects with a `pattern` / `citation` sub-shape). Anything
  // that trips a Zod check here surfaces as a "can't load program" error
  // in production which is a much worse outcome than a slightly-different
  // rendering.
  physiological_targets: z.unknown().optional(),
  session_rationale: z.unknown().optional(),
  progression_rationale: z.unknown().optional(),
  outcome_evidence: z.unknown().optional(),
  outcome_by_tier: z.unknown().optional(),
  contraindications: z.unknown().optional(),
  adaptive_engine_hooks: z.unknown().optional(),
  engineering_choices_flagged: z.unknown().optional(),
  hr_zone_methodology: z.unknown().optional(),
  concurrent_strength_prescription: z.unknown().optional(),
  references: z.array(
    z.object({
      id: z.string(),
      authors: z.string(),
      year: z.number(),
      title: z.string(),
      source: z.string(),
      url: z.string().optional(),
      used_for: z.string(),
    }),
  ),
  /**
   * Phase 1 (A2): canonical citation-library IDs used by this program.
   * Populated by `dev/scripts/migrate-citations.ts`. Resolves against
   * `public/data/citations.json`. Kept alongside `references[]` for one
   * release cycle; drop `references[]` in a follow-up once every consumer
   * reads via the canonical loader.
   */
  reference_ids: z.array(z.string()).optional(),
});

export const programSchema = z.object({
  /** Program slug, set by data-loader after parse so downstream code can
   *  identify the loaded program without a separate arg. Not authored in the
   *  program JSON — populated at load time from the filename. */
  slug: z.string().optional(),
  schema_version: z.string(),
  generated: z.string(),
  status: z.string(),
  /**
   * F10 Batch 31 · promotion attribution fields. Mirror the manifest-entry
   * schema so `program.reviewed_by` etc. are typed for consumers like
   * ProgramPreviewClient. Optional — REFERENCED programs have no reviewer.
   */
  reviewed_by: z
    .object({
      name: z.string(),
      role: z.string(),
      date: z.string(),
      scope: z.string().optional(),
    })
    .optional(),
  reviewed_at: z.string().optional(),
  status_history: z
    .array(
      z.object({
        from: z.string(),
        to: z.string(),
        date: z.string(),
        note: z.string().optional(),
      }),
    )
    .optional(),
  review_evidence: z.array(z.string()).optional(),
  goals: z.record(z.string(), z.unknown()).optional(),
  equipment_inventory: z.record(z.string(), z.unknown()).optional(),
  principles: z.array(z.record(z.string(), z.unknown())).optional(),
  training_maxes: z.record(z.string(), z.unknown()).optional(),
  /** Prose note next to `exercise_overrides`; authored, never rendered. */
  exercise_overrides_note: z.string().optional(),
  /** exercise_id → per-program copy overrides. See `exerciseOverrideSchema`. */
  exercise_overrides: z.record(z.string(), exerciseOverrideSchema).optional(),
  phases: z.array(phaseSchema),
  blocks: z.array(blockSchema),
  weekly_template: z.record(z.string(), z.unknown()).optional(),
  /**
   * Region ids this program asks about in the morning check. Ids must resolve
   * against `SYMPTOM_REGIONS`; `data-integrity.test.ts` fails otherwise, which
   * is what keeps this from becoming another authored key nothing reads.
   * Absent → the historical four (see `regionsForProgram`).
   *
   * A program declares WHAT feeds the safety gate. It does not declare how
   * lenient the gate is — thresholds stay central and audited in `deriveState`.
   */
  symptom_regions: z.array(z.string()).optional(),
  /**
   * Red-flag chip ids for the morning check, resolved against `SYMPTOM_FLAGS`.
   * Absent → night pain only. Same contract as `symptom_regions`: a program
   * declares what it asks, never how the gate treats the answer.
   */
  symptom_flags: z.array(z.string()).optional(),
  /**
   * What "load" means for this program on the symptom-vs-load chart. Ids
   * resolve against `LOAD_SIGNALS` in `lib/load-signals.ts`; every id a
   * program declares must share a unit, since the chart has one load axis.
   *
   * The load-side twin of `symptom_regions`, and it exists for the same
   * reason: the chart hardcoded three squat and four deadlift ids, which only
   * two of nine programs prescribe, so everyone else saw an empty load line.
   * Absent → the historical squat/pull pair, and the data test fails a
   * program that leaves it absent.
   */
  load_signals: z.array(z.string()).optional(),
  /**
   * A named outside specialist's review (EVID-1).
   *
   * Distinct from `reviewed_by`, which records Terav's own audit pass. Every
   * program's `reviewed_by` is "Terav specialist audit agent", and the ladder
   * disclosure says so in as many words — that no physiotherapist, coach or
   * sport scientist has independently signed off anything in the catalog. This
   * field is what makes that sentence false, one program at a time.
   *
   * `changes[]` records what the reviewer asked for AND what we did about it,
   * including where we declined. A review that only publishes the findings we
   * agreed with is marketing.
   */
  specialist_review: z
    .object({
      name: z.string(),
      credential: z.string(),
      date: z.string(),
      scope: z.string(),
      /** Anything outside their domain that they explicitly did not assess. */
      not_reviewed: z.string().optional(),
      verdict: z.enum(["ships_as_is", "ships_with_changes", "do_not_ship"]),
      changes: z
        .array(
          z.object({
            finding: z.string(),
            our_response: z.string(),
            applied: z.boolean(),
          }),
        )
        .optional(),
    })
    .optional(),
  /**
   * Per-phase skip rules driven by an intake answer. `handstand-walk` uses one
   * to skip `phase_0_bail_out_prep` for users who can already exit reliably.
   *
   * This field's absence was a live bug, not an oversight in authoring. The
   * gate is fully implemented — `isPhaseSkipped` in `engine/schedule.ts` reads
   * `phase_gates`, resolves the intake answer and returns true — but it reads
   * through a cast, and zod strips unknown keys, so `programSchema.parse`
   * deleted the input before the implementation ever saw it. `gates?.length`
   * was always undefined and the function always returned false.
   *
   * The 2026-08-18 handstand audit reported this as P0-5 "dead phase_gates[],
   * nothing reads it". Half right: something did read it, and the schema was
   * eating the data. A cast is invisible to the compiler, which is why nothing
   * flagged the mismatch for three weeks.
   */
  /**
   * Movements deferred because of an intake answer.
   *
   * The intake already told users this happens. `first-strict-pullup` says "if
   * current, we defer heavy negatives and use scap-focused work first" under
   * `elbow_tendon_pain`; `muscle-up` says "we defer ring dip work and use
   * band-assisted dip only". Those answers were stored and never read, so a
   * user with current medial epicondylitis was told ring dips would be deferred
   * and then given ring dips. This field is what makes the promise true.
   *
   * `reason` is user-facing — a deferral the user cannot see reads as the plan
   * being wrong rather than the plan listening.
   */
  intake_exclusions: z
    .array(
      z.object({
        id: z.string(),
        question_id: z.string(),
        when_value_in: z.array(z.string()),
        exclude_exercise_ids: z.array(z.string()),
        /** Kept in the session in place of what was removed, so the block does not just get thinner. */
        substitute_with: z.string().optional(),
        reason: z.string(),
      }),
    )
    .optional(),
  phase_gates: z
    .array(
      z.object({
        phase_id: z.string(),
        gate_type: z.string(),
        question_id: z.string(),
        run_if_value_in: z.array(z.string()).optional(),
        skip_if_value_in: z.array(z.string()).optional(),
        note: z.string().optional(),
      }),
    )
    .optional(),
  progression_rules: z.record(z.string(), z.unknown()).optional(),
  daily_log_schema: z.record(z.string(), z.unknown()).optional(),
  immediate_actions: z.array(z.record(z.string(), z.unknown())).optional(),
  adaptive_engine: z.record(z.string(), z.unknown()).optional(),
  // Formalised intake + generator + goal (optional so legacy programs pass)
  intake: programIntakeSchema.optional(),
  plan_tiers: z.array(planTierSchema).optional(),
  program_goal: programGoalSchema.optional(),
  evidence_base: evidenceBaseSchema.optional(),
  /**
   * B3 (Phase 4): declarative per-program onboarding.
   * When absent, `<OnboardingRunner>` shows the shared fallback splash.
   */
  onboarding_steps: onboardingStepsSchema.optional(),
  /**
   * F1 Path 1: signal-completeness surface. When absent, the transparency
   * card doesn't render for this program.
   */
  signal_completeness: signalCompletenessSchema.optional(),
  /**
   * v2: declare how the plan generator should build weekly sessions from this
   * program. `correlated_tier` = Foundation/Progression/Push scaled template
   * (Engine Builder, strength arcs — capabilities move together). `multi_dimensional`
   * = per-capability drill selection per session (Handstand Walk, muscle-up,
   * HSPU — sub-skills develop independently). Optional; legacy programs default
   * to `correlated_tier`.
   */
  generation_strategy: z.enum([
    "correlated_tier",
    "multi_dimensional",
    "trend_based",       // aerobic — no per-session TM concept, HR-trend evaluator
    "hybrid_concurrent", // strength + aerobic composite
  ]).optional(),
  /**
   * v2: list of `drill_id`s that make up this program's active drill library.
   * The multi-dimensional generator picks from this pool. Optional for
   * legacy programs which reference exercises via `blocks[].items[].exercise_id`.
   */
  drill_library: z.array(z.string()).optional(),
  /**
   * HERITAGE non-responder classifier · 2026-08-18.
   * See dev/active/heritage-non-responder-gate-plan.md.
   *
   * Program-agnostic infrastructure — each program declares its own
   * variance literature + signal metrics + response patterns. Engine
   * Builder + Rowing 2K populate this today (both invoke HERITAGE at
   * Push tier). CSM / HSW / OVM can opt in later with their own
   * variance sources (Schumann 2022 for strength SMD, Šimůnková 2024
   * for skill acquisition, etc.).
   *
   * `patterns` are declarative rule expressions the classifier evaluates
   * against per-metric baselines. Requires >= 2 baselines per Hecksteden
   * 2015 — a single Week-N retest can't classify a non-responder honestly.
   */
  non_responder_classifier: z
    .object({
      variance_source: z.object({
        citation_id: z.string(),
        note: z.string().optional(),
      }),
      requires_baselines: z.number().int().min(2).default(2),
      primary_signal_metric_id: z.string(),
      secondary_signal_metric_ids: z.array(z.string()).optional(),
      patterns: z.object({
        under_dosing: z.object({
          rule: z.string(),
          recommendation_key: z.string(),
          copy: z.string(),
        }),
        true_non_response: z.object({
          rule: z.string(),
          recommendation_key: z.string(),
          copy: z.string(),
        }),
        responding: z.object({
          rule: z.string().optional(),
          copy: z.string(),
        }),
      }),
    })
    .optional(),
  /**
   * Mid-block retest metrics — parallel to `retest_metrics` (which fire
   * at phase_end / waypoint). Mid-block cadence is what makes 2-baseline
   * classification possible. Read by the non-responder classifier and
   * surfaced on Today as a proposal card when the retest is due.
   */
  retest_metrics_mid_block: z
    .array(
      z.object({
        metric_id: z.string(),
        at_week: z.number().int().min(1),
        cadence_weeks: z.number().int().optional(),
        trigger: z.enum(["user_initiated", "auto"]).default("user_initiated"),
        purpose: z.string(),
      }),
    )
    .optional(),
  /**
   * Phase B — Level 3 constraint layer. All fields optional to preserve
   * backward-compat; legacy programs work unchanged. When present, the
   * generator uses these to shape the user's plan against their intake
   * (available days, session length, hard-day separation) instead of a
   * fixed layout array.
   */
  schedule_constraints: z
    .object({
      available_days_min: z.number().min(1).max(7),
      available_days_max: z.number().min(1).max(7),
      session_length_min_range: z.tuple([z.number(), z.number()]),
      session_count_per_week_range: z.tuple([z.number(), z.number()]),
      hard_day_separation_h: z.number().default(48),
      interference_ceiling_h: z.number().optional(),
    })
    .optional(),
  deload_window: z
    .object({
      every_weeks_min: z.number(),
      every_weeks_max: z.number(),
      trigger: z.enum(["scheduled", "fatigue_signal", "either"]),
    })
    .optional(),
  /**
   * Phase B — track positioning. Main tracks drive Today's primary session
   * and always have intake. Side tracks layer on any main and skip intake.
   * Enforced in the catalog + intake flow.
   */
  positioning: z.enum(["main_track", "side_track"]).optional(),
  interference_hints: z
    .object({
      incompatible_with: z.array(z.string()).optional(),
      compatible_with: z.array(z.string()).optional(),
      contraindicated_modalities: z.array(z.string()).optional(),
      min_recovery_h_from: z.record(z.string(), z.number()).optional(),
    })
    .optional(),
  /**
   * Phase B — per-block modality choices. Users with `no barbell at home`
   * can substitute the primary lift; DailyPlan's composer honors this at
   * composition time. Keyed by block.id.
   */
  modality_options: z
    .record(
      z.string(),
      z.object({
        primary: z.string(),
        alternatives: z.array(z.string()),
      }),
    )
    .optional(),
  /**
   * Phase B — declarative retest metrics. `adapt.ts` iterates this list,
   * resolves `source_ref` against the user's log data, aggregates over
   * `window_days`, and emits progress signals. Progress view renders one
   * card per metric. Replaces per-program ad-hoc signal declarations.
   */
  retest_metrics: z
    .array(
      z.object({
        metric_id: z.string(),
        display_name: z.string(),
        unit: z.string(),
        direction: z.enum(["higher_is_better", "lower_is_better"]),
        source: z.enum([
          "log_field",
          "run_field",
          "physical_test",
          "assessment_pack",
          "capability_level",
        ]),
        source_ref: z.string(),
        cadence_weeks: z.number(),
        trigger: z.enum([
          "phase_end",
          "waypoint_beat",
          "user_initiated",
          "adaptive_signal",
        ]),
        targets: z.array(
          z.object({
            tier_id: z.string().optional(),
            baseline: z.number().optional(),
            target: z.number(),
            stretch: z.number().optional(),
            at_week: z.number().optional(),
          }),
        ),
        aggregation: z
          .enum(["latest", "best_of_last_n", "trend_slope", "median_of_window"])
          .optional(),
        window_days: z.number().optional(),
      }),
    )
    .optional(),
});

/**
 * Self-scored assessment entry — user rates a fixed pack of body-region self-tests
 * on a 0-10 scale. Purely subjective; framed to the user as "data so we see the trend",
 * not a diagnosis. Not clinical advice.
 *
 * Structure kept generic (pack_id + scores keyed by question_id or `question_id:side`)
 * so the same infrastructure supports future packs (shoulder, low back, etc.) without
 * a schema change.
 */
export const assessmentEntrySchema = z.object({
  pack_id: z.string(),
  date: z.string(), // ISO yyyy-mm-dd
  scores: z.record(z.string(), z.number().min(0).max(10)),
  notes: z.string().optional(),
});

// Log entries
export const setLogSchema = z.object({
  weight_kg: z.number().nullable(),
  reps: z.number().nullable(),
  rpe: z.number().nullable().optional(),
  /**
   * Seconds actually held, for time-based work (2026-08-25).
   *
   * Isometrics and stretches author `hold_seconds` and no reps —
   * `hip_flexor_iso_seated` is `{sets: 5, hold_seconds: 20, per_side: true}`
   * — but the set screen only ever offered a rep counter, so a 30-second
   * kneeling stretch got logged as "x12". Meaningless, and for a programme
   * that is half holds it meant the rehab layer had no measurable dose at
   * all.
   *
   * ADDITIVE on purpose. `reps != null` is the "this set is logged"
   * predicate in 42 places across 18 files — the pips, the rail counters,
   * adherence, PR detection, history, the engine's did-you-train check.
   * A hold set therefore still writes `reps` (the number of holds
   * completed, normally 1) and carries the duration here. Writing
   * `seconds` INSTEAD of `reps` would make every hold set read as
   * unlogged everywhere at once.
   */
  seconds: z.number().nullable().optional(),
  notes: z.string().optional(),
});

export const exerciseLogSchema = z.object({
  done: z.boolean(),
  weight_kg: z.number().nullable().optional(),
  reps: z.number().nullable().optional(),
  rpe: z.number().nullable().optional(),
  notes: z.string().optional(),
  sets: z.array(setLogSchema).optional(),
});

/**
 * Scored regions are flat top-level keys, one per `SYMPTOM_REGIONS` entry in
 * `lib/symptom-regions.ts`. Flat and unmigrated on purpose: the original four
 * keep their exact key names, so multi-year history recorded against them still
 * validates and still renders. Which of these a user is actually asked about is
 * the active program's `symptom_regions[]`, not this list.
 */
export const symptomsSchema = z.object({
  // Hip / trunk — the original four, ids frozen for history.
  groin_left: z.number().optional(),
  groin_right: z.number().optional(),
  low_back: z.number().optional(),
  buttock_left: z.number().optional(),
  buttock_right: z.number().optional(),
  // Unsided variants for programs where laterality is not the clinical point.
  shoulder: z.number().optional(),
  elbow: z.number().optional(),
  wrist: z.number().optional(),
  knee: z.number().optional(),
  achilles: z.number().optional(),
  // Upper body — sided.
  shoulder_left: z.number().optional(),
  shoulder_right: z.number().optional(),
  elbow_left: z.number().optional(),
  elbow_right: z.number().optional(),
  wrist_left: z.number().optional(),
  wrist_right: z.number().optional(),
  neck: z.number().optional(),
  // Lower body.
  knee_left: z.number().optional(),
  knee_right: z.number().optional(),
  hamstring_left: z.number().optional(),
  hamstring_right: z.number().optional(),
  achilles_left: z.number().optional(),
  achilles_right: z.number().optional(),
  shin: z.number().optional(),
  click_present: z.boolean().optional(),
  click_painful: z.boolean().nullable().optional(),
  morning_stiffness_min: z.number().optional(),
  night_pain: z.boolean().optional(),
  gait_change: z.boolean().optional(),
  /**
   * Free-text description of any outside-training load done yesterday (padel,
   * hike, long walk, sleep-deprived night). Read by daySignals() so the notes
   * signal engine gets structured input alongside per-exercise notes.
   */
  outside_training: z.string().optional(),
  /**
   * Coarse rating of overall life stress / sleep quality on a 0-10 scale.
   * 0 = fresh, 10 = wrecked. Optional; fed into fatigue detection.
   */
  life_load: z.number().min(0).max(10).optional(),
  /**
   * Which instrument produced these numbers.
   *
   * The fields above are all typed `z.number()` on a 0-10 range, but the UI
   * that fills them has changed shape. Until 2026-08-21 the check used
   * continuous sliders and any value 0-10 could appear. Cut D replaced them
   * with a four-option tap scale writing exactly {0, 2, 5, 8}
   * (`CheckRegionRow.BUCKET_TO_VALUE`), plus three-option life load and
   * four-option stiffness.
   *
   * Nothing recorded which produced a given row, so a multi-year chart shows
   * a step change at that date that belongs to the FORM, not the person —
   * and no consumer could tell the difference. Stamped on write from
   * `SYMPTOM_SCALE_VERSION`; absent means a pre-Cut-D slider entry, which is
   * the honest reading of the history that already exists.
   */
  scale_version: z.string().optional(),
});

/**
 * Endurance session logged on a day. Discipline-agnostic on purpose — a Zone-2
 * base run, a HYROX simulation, a HIIT interval workout, and a long ride all
 * share this shape. The `intensity` field is a coarse Z1/Z2/Z3 label the user
 * picks; it feeds the notes-signal engine (a Z3 today counts as external load
 * for tomorrow's top-set proposal).
 *
 * `source` distinguishes manually-entered from device-imported sessions. When
 * `source: "gpx"` the HR / elevation fields come from the parsed file and are
 * trustworthy; manual entries won't have them.
 */
export const runLogSchema = z.object({
  distance_km: z.number().nullable().optional(),
  minutes: z.number().nullable().optional(),
  intensity: z.enum(["easy", "moderate", "hard"]).optional(),
  activity_type: z
    .enum(["run", "hyrox", "cycle", "row", "ski_erg", "walk", "crossfit_class", "other"])
    .optional(),
  avg_hr: z.number().min(30).max(230).optional(),
  max_hr: z.number().min(30).max(230).optional(),
  elevation_gain_m: z.number().min(0).max(10000).optional(),
  source: z.enum(["manual", "gpx", "fit"]).optional(),
  device_name: z.string().optional(),
  started_at: z.string().optional(), // ISO datetime from device metadata
  note: z.string().optional(),
  /**
   * Raw file content when the log came from an imported track file. Kept so
   * we can re-parse later (e.g. add HR-zone distribution) without needing the
   * user to re-upload. Size-capped by the store's overall 1 MB PUT limit; the
   * uploader rejects files > 500 KB to keep headroom.
   */
  raw_gpx: z.string().max(600_000).optional(),
  /**
   * Rowing/aerobic-native fields. Optional so existing manual-entry runs stay
   * valid. Programs like rowing-2k-test-prep query these for retest metrics
   * (`total_seconds where session_type == '2k_test'`); a 2K test-day entry
   * without total_seconds is unusable for that metric.
   *
   * `session_type` classifies the intent so retest queries can filter. Free-
   * form so programs can add their own values without a schema bump.
   * `avg_pace_500m_seconds` = seconds per 500m split (rowing / ski erg).
   * `avg_watts` = mean session wattage (bike / erg with power).
   * `total_seconds` = time to completion for a fixed-distance test.
   * `interval_splits` = per-interval splits for interval sessions.
   */
  session_type: z
    .enum([
      "z1",
      "z2",
      "technique",
      "threshold",
      "race_pace",
      "recovery",
      "2k_test",
      "5k_test",
      "1k_tt",
      "500m_tt",
      "vo2max_intervals",
      "steady_state",
      "warmup",
      "cooldown",
    ])
    .optional(),
  avg_pace_500m_seconds: z.number().min(60).max(600).optional(),
  /**
   * Erg drag factor (Concept2 display, menu → More Options → Display Drag
   * Factor). Recorded so a retest is comparable to the baseline it is
   * measured against.
   *
   * Without it `row_2k_time_seconds` is not a comparable measure across a
   * block: a user who moves the damper between the week-1 baseline and the
   * week-6 test reads a setting change as an adaptation. That is a
   * measurement-validity defect in the programme's primary outcome, not a
   * nicety — flagged by the 2026-09-03 review.
   */
  drag_factor: z.number().min(50).max(250).optional(),
  avg_watts: z.number().min(20).max(2000).optional(),
  total_seconds: z.number().min(1).max(36_000).optional(),
  interval_splits: z
    .array(
      z.object({
        duration_s: z.number().min(1).max(10_000).optional(),
        distance_m: z.number().min(1).max(20_000).optional(),
        pace_500m_s: z.number().min(60).max(600).optional(),
        avg_watts: z.number().min(20).max(2000).optional(),
        avg_hr: z.number().min(30).max(230).optional(),
      }),
    )
    .max(30)
    .optional(),
});

export const dayLogSchema = z.object({
  date: z.string(),
  /**
   * When this day's row was first created, as an ISO datetime.
   *
   * `date` is the day the entry is ABOUT; this is when the user actually
   * wrote it. Logging Tuesday's session on Tuesday morning and backfilling
   * the whole week on Sunday night are different measurement processes with
   * different recall error, and until now they were indistinguishable —
   * server snapshots prune at 14 days (`SNAPSHOT_RETENTION_DAYS`), so after
   * two weeks nothing anywhere recorded which had happened.
   *
   * Stamped once by `ensureDay` when the row is created and never rewritten;
   * every caller of `ensureDay` is a write path. Absent on rows created
   * before 2026-09-03, and that absence cannot be repaired — which is why it
   * was added before more history accrued rather than when a consumer needed
   * it.
   */
  first_written_at: z.string().optional(),
  exercises: z.record(z.string(), exerciseLogSchema),
  symptoms: symptomsSchema.nullable(),
  derived_state: z.enum(["green", "amber", "red"]).nullable(),
  notes: z.string().default(""),
  runs: z.array(runLogSchema).optional(),
});

/**
 * Block-object rebuild, Phase B — see
 * dev/active/block-object-rebuild-2026-08-18.md §1.
 *
 * A ScheduledBlock is a first-class scheduled instance of one of a
 * program's `blocks[]` template entries on a specific date, with its
 * own identity, state, and audit trail. Enables per-track skip/move
 * and unlocks per-block history / retest Δ / coach references.
 */
const scheduledBlockStateSchema = z.enum([
  "planned",
  "done",
  "skipped",
  "moved",
  "amber_downshifted",
]);

const moveHistoryEntrySchema = z.object({
  from: z.string(),
  to: z.string(),
  at: z.string(),
  reason: z.string().optional(),
});

const blockEngineAdjustmentSchema = z.object({
  proposal_id: z.string(),
  applied_at: z.string(),
  kind: z.enum([
    "day_adjustment_soften",
    "tm_bump",
    "readiness_after_layoff",
    "tier_advance",
  ]),
  payload: z.record(z.string(), z.unknown()),
});

const scheduledBlockSchema = z.object({
  id: z.string(),
  program_slug: z.string(),
  block_template_id: z.string(),
  planned_date: z.string(),
  actual_date: z.string(),
  state: scheduledBlockStateSchema,
  move_history: z.array(moveHistoryEntrySchema).optional(),
  completed_at: z.string().optional(),
  log_entry_id: z.string().optional(),
  notes: z.string().optional(),
  engine_adjustments: z.array(blockEngineAdjustmentSchema).optional(),
});

const programMaterializationSchema = z.object({
  materialized_through: z.string(),
  materialized_at: z.string(),
  materialization_seed: z.string(),
  /**
   * Which version of the day-selection rules produced these blocks. When
   * it no longer matches `SCHEDULE_RULES_VERSION`, the forward window is
   * regenerated — otherwise a rules fix never reaches anyone whose blocks
   * were already materialized. Optional: absent means "before versioning",
   * which counts as stale.
   */
  rules_version: z.string().optional(),
});

const featureFlagsSchema = z.object({
  /**
   * Off by default. On → block-object readers become authoritative for
   * enabled surfaces (Today first, then Week, etc.). Legacy readers
   * still function so partial rollout is safe.
   */
  block_object: z.boolean().optional(),
  /**
   * Off by default. On (once `block_object` is on and stable) → legacy
   * `skipped` / `scheduled_overrides` fields stop being written to,
   * blocks become the sole write target.
   */
  block_object_writes: z.boolean().optional(),
  /**
   * Off-plan drill logging — the `/off-plan` page, its Profile row, and
   * the drill list inside the session's activity sheet.
   *
   * Tri-state on purpose (2026-08-24):
   *   undefined — never had it. Nothing renders, no Settings row. The
   *               default for every new account.
   *   true/false — has had it. The Settings toggle renders so it can be
   *               turned back on. The PWA has no URL bar, so a
   *               query-string escape hatch is not a real recovery path;
   *               the toggle has to persist once the account qualifies.
   *
   * Cut from the public catalog because no program has off-plan-ONLY
   * content — every accessory/run block is already scheduled onto a day
   * by the phases + weekly template, so the page was a second door into
   * prescribed work (and a double-logging path). It survives for
   * anterior-hip-rebuild, the one program that deliberately routes its
   * non-strength blocks off Day (see schedule.ts:457).
   *
   * NOT related to activity logging (`logs[].runs[]`), which stays on for
   * everyone — four programs read it for their retest metrics.
   */
  off_plan: z.boolean().optional(),
});

export const storeSchema = z.object({
  version: z.literal(2),
  logs: z.record(z.string(), dayLogSchema),
  training_maxes: z.record(z.string(), z.number()),
  cycle: z.object({
    phase_id: z.string().nullable(),
    cycle_number: z.number(),
    week_in_cycle: z.number(),
  }),
  stretch_targets: z.record(z.string(), z.number()).optional(),
  /**
   * HERITAGE Phase 5 (2026-08-18 · #63) — retest readings the classifier
   * consumes. Each entry is a single logged reading of one metric on one
   * date, plus optional compliance context. Two readings per metric are
   * required before the classifier speaks (Hecksteden 2015 · ≥2
   * baselines). Populated by the Log retest-reading proposal + entry
   * point; read by `classify()` in non-responder-classifier.ts.
   */
  retest_readings: z
    .array(
      z.object({
        metric_id: z.string(),
        value: z.number(),
        observed_at: z.string(), // yyyy-mm-dd
        program_slug: z.string().optional(),
        at_week: z.number().int().optional(),
        intensity_compliance_pct: z.number().optional(),
        session_compliance_pct: z.number().optional(),
        notes: z.string().optional(),
      }),
    )
    .optional(),
  /** Unix millis of the most-recent local write. Used for last-write-wins sync. */
  updated_at: z.number().optional(),
  /**
   * @deprecated Phase F (2026-08-18) — superseded by `scheduled_blocks`.
   * Kept in the schema for one release cycle so existing KV blobs still
   * parse. Read paths dual-consult until a future release removes the
   * field entirely. Do NOT write here from new code paths.
   */
  scheduled_overrides: z
    .record(
      z.string(),
      z.object({ blocks: z.array(z.string()), reason: z.string().optional() }),
    )
    .optional(),
  /**
   * @deprecated Phase F (2026-08-18) — superseded by `scheduled_blocks`
   * with per-block state ("skipped" / "moved"). Kept for one release
   * cycle so existing KV blobs still parse. Do NOT write here from new
   * code paths.
   */
  skipped: z
    .record(
      z.string(),
      z.object({ reason: z.string().optional(), moved_to: z.string().optional() }),
    )
    .optional(),
  /**
   * Block-object rebuild, Phase B (2026-08-18) — see
   * dev/active/block-object-rebuild-2026-08-18.md §1.
   *
   * Materialized scheduled blocks keyed by a stable id
   * `<slug>:<planned_date>:<block_template_id>`. Written by the
   * materializer on program start / weekly rollover; mutated by
   * per-block Skip / Move / Complete actions.
   *
   * All fields optional at the store level — a store without this map
   * behaves exactly like the pre-Phase-B world (legacy readers still
   * work). Flip `feature_flags.block_object` to swap views to the new
   * source of truth. Removed entirely in Phase F.
   */
  scheduled_blocks: z.record(z.string(), scheduledBlockSchema).optional(),
  /**
   * Per-program bookkeeping so the materializer knows how far into the
   * future blocks have been generated. On rollover the materializer
   * extends this window.
   */
  program_materialization: z
    .record(z.string(), programMaterializationSchema)
    .optional(),
  /**
   * Rollout flags. Phase A / B ship with everything OFF — behavior is
   * identical to pre-Phase-B until the founder flips them. Phase C flips
   * `block_object` per user account for staged validation.
   */
  feature_flags: featureFlagsSchema.optional(),
  /**
   * List of one-way migration ids that have already been applied to this
   * user's store. Used by the legacy-to-blocks migrator to short-circuit
   * on re-hydrate. Migration script writes an id here on completion.
   */
  migrations_applied: z.array(z.string()).optional(),
  /**
   * User-accepted per-day adjustments to the engine's recommendations.
   * Only set after an explicit Accept in the UI — nothing writes here silently.
   * `load_multiplier` scales the suggested top-set weight for strength lifts on that date;
   * rehab / mobility exercises are exempt (checked in the suggest engine).
   */
  day_adjustments: z
    .record(
      z.string(),
      z.object({
        load_multiplier: z.number().min(0.5).max(1.15),
        reason: z.string().optional(),
        source: z.enum(["notes", "manual"]).optional(),
        accepted_at: z.number().optional(),
        /**
         * Phase 1 (A2): immutable citation snapshot recorded at Accept time.
         * Survives later edits to `citations.json`. Absent for log-cited
         * proposals (no underlying study — reason is derived from the log).
         */
        citation_snapshot: z
          .object({
            id: z.string(),
            display_short: z.string(),
            display_line: z.string(),
            snapshotted_at: z.number(),
          })
          .optional(),
      }),
    )
    .optional(),
  /** Per-day proposals the user explicitly dismissed — so we don't nag them again. */
  dismissed_proposals: z.record(z.string(), z.array(z.string())).optional(),
  /**
   * A5 (Phase 3): outcome log for every confirm-first proposal the user
   * Accepted or Ignored. Consent-first audit trail. Read by History and any
   * future export/GDPR flow. Append-only from the app side.
   *
   * `citation_snapshot` matches the shape on `day_adjustments` — recorded
   * for study-cited proposals at outcome time so later citation edits don't
   * rewrite history.
   */
  proposal_history: z
    .array(
      z.object({
        id: z.string(),
        kind: z.string(),
        outcome: z.enum(["accepted", "ignored"]),
        at: z.number(),
        date: z.string(),
        citation_snapshot: z
          .object({
            id: z.string(),
            display_short: z.string(),
            display_line: z.string(),
            snapshotted_at: z.number(),
          })
          .optional(),
      }),
    )
    .optional(),
  /**
   * Phase B — materialised daily plans. One shared composition powers Today,
   * Report, and future push-notification jobs. Keyed by dateISO. Contains
   * per-program block groups + interference conflict flags + total load.
   * Recomputed on: profile change, program change, cycle boundary, retest.
   * Cache — pure derivation, safe to invalidate.
   */
  daily_plans: z
    .record(
      z.string(),
      z.object({
        date: z.string(),
        programs: z.array(
          z.object({
            slug: z.string(),
            positioning: z.enum(["main_track", "side_track"]).optional(),
            block_ids: z.array(z.string()),
            generation_trace_ref: z.string().optional(),
          }),
        ),
        conflicts: z
          .array(
            z.object({
              between_programs: z.tuple([z.string(), z.string()]),
              reason: z.string(),
              severity: z.enum(["hint", "warning", "block"]),
            }),
          )
          .optional(),
        total_load_estimate: z
          .object({
            time_min: z.number().optional(),
            internal_load_score: z.number().optional(),
          })
          .optional(),
        composed_at: z.number(),
      }),
    )
    .optional(),
  /**
   * Subjective self-test results, grouped by pack id. Each pack accumulates a chronological
   * list of entries. Read on Progress to chart trend; read on Today to decide whether the
   * "assessment due" banner appears.
   */
  assessments: z.record(z.string(), z.array(assessmentEntrySchema)).optional(),
  /**
   * User account / program profile. Optional so existing single-user localStorage
   * keeps working; populated on onboarding for new (multi-user) signups. Auth-
   * layer state (uid, email, tier) lives here so the client can render tier-gated
   * UI without a network hop, and so we can migrate a user's stored state when they
   * sign up under a real uid.
   *
   * `active_program_id` is the slug of the program template loaded on Today. If
   * unset, the app falls back to Margus's canonical program for legacy sessions.
   */
  user_profile: z
    .object({
      uid: z.string().optional(),
      email: z.string().optional(),
      display_name: z.string().optional(),
      created_at: z.number().optional(),
      weakness_at_signup: z.string().optional(),
      goal_at_signup: z.string().optional(),
      experience_level: z.enum(["beginner", "intermediate", "advanced"]).optional(),
      active_program_id: z.string().optional(),
      active_program_started_at: z.string().optional(),
      /**
       * Dates the user is away and cannot train (2026-08-27).
       *
       * Replaces `HIP_RACE_DATE`, a single date hard-coded into the
       * scheduler. That constant blocked 2026-08-29 for a race the founder
       * then decided to skip, and there was no way to change it without a
       * deploy — while a genuine away week (travel, summer) had no
       * representation at all.
       *
       * Blocks PRESCRIBED sessions only. Activity logging stays open, on
       * purpose: an away day is usually not an empty day. The founder's
       * first use of this is a Saturday he is riding 90 km.
       */
      away_periods: z
        .array(
          z.object({
            start: z.string(),
            end: z.string(),
            reason: z.string().optional(),
          }),
        )
        .optional(),
      /**
       * v2 multi-program: full list of concurrently-active program slugs. The
       * legacy `active_program_id` remains as the "primary" (drives global
       * phase headers, TM proposals, milestones). Additional entries here are
       * secondaries that render their own blocks on Today when their weekly
       * template targets the current day. Empty / unset → falls back to the
       * primary alone.
       */
      active_program_ids: z.array(z.string()).optional(),
      /**
       * v2: per-program state, keyed by program slug. Holds the user's picked
       * tier (for `plan_tiers`-based programs), stored intake answers, and
       * start date. Designed for multi-program support: when we lift the
       * one-program-at-a-time restriction, each active program gets its own
       * entry here. Legacy programs without a picked tier fall through to
       * whichever tier gate the program defines as default.
       */
      program_states: z
        .record(
          z.string(),
          z.object({
            tier: z.string().optional(),
            intake_answers: z.record(z.string(), z.string()).optional(),
            started_at: z.string().optional(),
            /**
             * Phase-date shift in whole days, applied when resolving
             * `program.phases[].starts` / `.ends`. Used by test-prep programs
             * (Rowing 2K) where the user answers `target_test_date` in intake
             * and we shift all phase dates so the final phase ends on that
             * date. Positive = phases shift later; negative = earlier.
             */
            phase_shift_days: z.number().int().optional(),
            /**
             * Snapshot of training_maxes at the moment the user committed
             * this program. Retest metrics that read `training_maxes.<lift>`
             * compute Δ against this baseline. Kept per-program so a user
             * running multiple programs gets each's own baseline.
             */
            baseline_training_maxes: z.record(z.string(), z.number()).optional(),
            /**
             * Skill programs snapshot capability_profile[testId].measured_value
             * at intake so a future retest-capture flow can update the current
             * value without erasing the Δ math. Independent of
             * capability_profile itself, which represents the *current* reading.
             */
            baseline_capabilities: z.record(z.string(), z.number()).optional(),
            /**
             * Multi-tier programs: history of tier changes for this program.
             * Written by `promoteTier`. Populated when the user advances via
             * the confirm-first proposal on Progress → Retest.
             */
            tier_history: z
              .array(
                z.object({
                  from_tier: z.string(),
                  to_tier: z.string(),
                  at: z.string(),
                  trigger: z.enum(["retest", "manual"]),
                }),
              )
              .optional(),
            /**
             * Composite marker preventing the same tier-advance proposal from
             * re-appearing on the same data. Format: `<tier_id>@<vars_hash>`.
             * When new retest measurements change the hash, the proposal
             * fires again.
             */
            tier_proposal_dismissed_for: z.string().optional(),
            /**
             * Phase A: whether the "your plan is built" reveal card has been
             * dismissed for this program. Set true on user X-tap or Continue.
             * Card never re-appears once seen. Fires once per (user, program).
             */
            reveal_seen: z.boolean().optional(),
            /**
             * When the user first landed on the graduated-arc surface for
             * this program (isPastProgramEnd = true). Auto-written from
             * GraduationCard on mount so downstream surfaces (Profile,
             * Programs catalog, Programs detail) can flip the ACTIVE badge
             * to GRADUATED without another explicit user action.
             * Delta-3 graduation audit 2026-08-19.
             */
            graduated_at: z.string().optional(),
            /**
             * F5 (Batch 23) — user chose "Extend +N weeks" at retest hand-off.
             * Consumed by `activePhaseFor` in schedule.ts to shift phase
             * end-dates. Additive across multiple extensions.
             */
            extension_weeks: z.number().int().min(0).optional(),
            /**
             * F5 (Batch 23) — user chose "Take a break" at retest hand-off.
             * Program stays in `active_program_ids` but the plan-generator
             * returns [] for its blocks until Resume from Profile clears
             * this. Multi-program: other programs still render.
             */
            paused_at: z.string().optional(),
            /**
             * User's own rating of the arc at graduation. 1-5 scale +
             * optional freeform note. Written by GraduationCard's survey.
             * Delta-3 2026-08-19: gives the user a place to say "this
             * worked" or "this was miserable" so the arc ends with a
             * voice, not a silence.
             */
            graduation_feedback: z
              .object({
                rating: z.number().int().min(1).max(5),
                note: z.string().optional(),
                submitted_at: z.string(),
              })
              .optional(),
            /**
             * Phase A / generation_trace stub: the input snapshot at the moment
             * the user committed this program. Persists intake_answers + tier
             * + any capability_profile values that were used to shape the plan,
             * plus a version stamp so we can re-derive if the schema evolves.
             */
            generation_trace: z
              .object({
                strategy: z.string().optional(),
                tier_id: z.string().optional(),
                seed: z.string(),
                answered_at: z.string(),
                input_snapshot: z.record(z.string(), z.unknown()),
                version: z.string(),
              })
              .optional(),
          }),
        )
        .optional(),
      consent_symptom_data_at: z.number().optional(),
      /**
       * In-progress intake drafts, keyed by program slug. Persists answers,
       * physical-test results, consent checkbox state, and the wizard's
       * current step so the user can leave and come back without losing
       * work. Cleared on successful commit of that program's intake.
       *
       * Store-based (rather than localStorage-only) so it survives origin
       * mismatches (preview URL ↔ prod), incognito, cache clears, and
       * device switches through server sync.
       */
      intake_drafts: z
        .record(
          z.string(),
          z.object({
            answers: z.record(z.string(), z.string()).optional(),
            test_results: z.record(z.string(), z.number()).optional(),
            consents: z.record(z.string(), z.boolean()).optional(),
            step_index: z.number().int().min(0).optional(),
            updated_at: z.string().optional(),
          }),
        )
        .optional(),
      tier: z.enum(["free", "trial", "paid", "beta_forever"]).optional(),
      trial_ends_at: z.string().optional(),
      /**
       * v2: per-capability level estimates. Keyed by capability_domain (e.g.
       * "handstand_hold_static", "handstand_walk_dynamic"). Populated by the
       * intake, refined by physical tests, updated by the adaptive engine as
       * real training data lands. Multi-dimensional plan generator reads this
       * to compose sessions targeted at each user's weak capabilities at their
       * own level.
       */
      capability_profile: z
        .record(
          z.string(),
          z.object({
            estimated_level: drillLevelSchema,
            confidence: z.enum(["self_report", "physical_test", "adaptive_measured"]),
            last_measured_at: z.string(),
            measured_value: z.number().optional(),
            measured_unit: z.string().optional(),
          }),
        )
        .optional(),
    })
    .optional(),
  /**
   * User-maintained list of movement patterns / positions that hurt or historically
   * caused symptoms. Rendered in the Report and available for future engine logic
   * to gate exercise proposals. Independent of the built-in clinical-context.json
   * (which is read-only baseline) so any user in any track can maintain their own.
   */
  contraindications: z
    .array(
      z.object({
        id: z.string(),
        label: z.string(),
        reason: z.string().optional(),
        added_at: z.number().optional(),
      }),
    )
    .optional(),
});

/**
 * Program catalog manifest — list of program templates the user can pick from.
 * The manifest holds catalog metadata; each entry is a slug that resolves to a
 * full program.json under `/data/programs/{slug}.json`.
 */
export const programManifestEntrySchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  category: z.enum(["rehab", "strength", "skill", "endurance", "hyrox", "asymmetry"]),
  weakness_target: z.string(),
  duration_weeks: z.number(),
  difficulty: z.enum(["beginner", "intermediate", "advanced", "multi-tier"]),
  /**
   * Ordered list of levels the program covers, shown as a chain
   * ("Foundation → Wall → Freestand → Advanced") on the catalog card. When
   * present, this replaces the bare "beginner" difficulty tag and tells the
   * user the program adapts across a range rather than being fixed-level.
   */
  levels: z.array(z.string()).optional(),
  /**
   * One-line "the app adapts to you" hint shown under levels. Explains that
   * intake picks the tier and workouts continue to adapt. Only present on
   * multi-tier programs.
   */
  adapts: z.string().optional(),
  prerequisites: z.array(z.string()).optional(),
  short_description: z.string(),
  who_this_is_for: z.string(),
  what_youll_achieve: z.string(),
  retest: z.string().optional(),
  tags: z.array(z.string()).optional(),
  // Governance model (B1, 2026-08-17; DRAFT replaces PROVISIONAL 2026-08-19 P0-9):
  //   DRAFT       — authored but not shipped to public catalog. Hidden by the
  //                 same filter as `personal:true`. Was PROVISIONAL — legend
  //                 didn't cover it and copy leaked debug intent.
  //   draft       — legacy lowercase alias for DRAFT (schema back-compat)
  //   REFERENCED  — default shipped state; every claim cites a paper,
  //                 simulator harness passes across archetypes.
  //   REVIEWED    — a domain-specialist audited the program against its
  //                 whitepaper; cited studies match claims, drill sequencing
  //                 evidence-backed. `reviewed_by` + `review_evidence[]`
  //                 required.
  //   VERIFIED    — ≥5 beta users completed the arc with subjective success
  //   stable      — legacy alias for VERIFIED; kept for schema back-compat
  //   PROVISIONAL — legacy alias for DRAFT; kept for schema back-compat while
  //                 program JSONs are migrated.
  status: z
    .enum(["DRAFT", "draft", "PROVISIONAL", "REFERENCED", "REVIEWED", "VERIFIED", "stable"])
    .optional(),
  /**
   * F10 Batch 31 · promotion attribution. Set on REVIEWED programs to name
   * the specialist who audited + the date + which files anchor the review.
   * Absent on REFERENCED programs (no external review yet).
   */
  reviewed_by: z
    .object({
      name: z.string(),
      role: z.string(),
      date: z.string(),
      scope: z.string().optional(),
    })
    .optional(),
  reviewed_at: z.string().optional(),
  /**
   * Append-only history of status transitions. Every promotion records
   * from→to + date + optional note. Enables the "See review trail" affordance
   * on the preview page.
   */
  status_history: z
    .array(
      z.object({
        from: z.string(),
        to: z.string(),
        date: z.string(),
        note: z.string().optional(),
      }),
    )
    .optional(),
  /**
   * Anchor files that back the current status. For REVIEWED programs this
   * is the list of audit / delta / review reports the promotion consulted.
   * Enables provenance without inlining the audit content in program JSON.
   */
  review_evidence: z.array(z.string()).optional(),
  featured: z.boolean().optional(),
  /**
   * When true, this program is authored for one specific user's clinical context
   * (see repo /data/clinical-context.json) and is NOT marketed as an evidence-
   * backed catalog program. The catalog renders a "Personal" badge and the
   * preview page suppresses the "evidence trail" section. Purpose: avoid making
   * implicit "clinically validated" claims about a solo-authored program.
   */
  personal: z.boolean().optional(),
  /**
   * Phase B — track positioning at the catalog level. Main tracks drive
   * Today's primary session and always have intake. Side tracks layer on
   * any main and skip intake. Manifest positioning drives catalog grouping
   * (main-track section vs side-track section). Defaults to main_track for
   * legacy entries that haven't declared.
   */
  positioning: z.enum(["main_track", "side_track"]).optional(),
  /**
   * Phase B — surfaced on catalog + preview cards. e.g. "~3 hr/week". Used
   * to help users judge whether a side track fits alongside their main.
   */
  load_hint: z.string().optional(),
});

export const programManifestSchema = z.object({
  schema_version: z.string(),
  programs: z.array(programManifestEntrySchema),
  categories: z.record(
    z.string(),
    z.object({
      label: z.string(),
      description: z.string(),
      order: z.number(),
    }),
  ),
});

// TypeScript types inferred from schemas
export type Exercise = z.infer<typeof exerciseSchema>;
export type Block = z.infer<typeof blockSchema>;
export type Phase = z.infer<typeof phaseSchema>;
export type Milestone = z.infer<typeof milestoneSchema>;
export type Program = z.infer<typeof programSchema>;
export type ProgramManifestEntry = z.infer<typeof programManifestEntrySchema>;
export type ProgramManifest = z.infer<typeof programManifestSchema>;
export type IntakeQuestion = z.infer<typeof intakeQuestionSchema>;
export type PhysicalTest = z.infer<typeof physicalTestSchema>;
export type PlanTier = z.infer<typeof planTierSchema>;
export type ProgramIntake = z.infer<typeof programIntakeSchema>;
export type ProgramGoal = z.infer<typeof programGoalSchema>;
export type EvidenceBase = z.infer<typeof evidenceBaseSchema>;
export type SignalCompleteness = z.infer<typeof signalCompletenessSchema>;
export type OnboardingStep = z.infer<typeof onboardingStepSchema>;

// A5 (Phase 3): discriminated Proposal union. Lives outside the Zod store
// schema — proposals are transient (regenerated by selectProposals on every
// render), not persisted. Only their outcomes (Accepted/Ignored) survive,
// via `proposal_history[]` above.
export type CitationSnapshot = {
  id: string;
  display_short: string;
  display_line: string;
  snapshotted_at: number;
};

type ProposalBase = {
  id: string;
  priority: number;
  reason: string;
  citationId: string | null;
};

export type ReadinessProposalPayload = ProposalBase & {
  kind: "readiness_after_layoff";
  programSlug: string;
  targetPhaseId: string;
  targetPhaseName: string;
  daysToShift: number;
  evidence: Array<{
    date: string;
    exerciseId: string;
    weightKg: number;
    reps: number;
    rpe: number | null;
    pctTM: number;
    reintroCap: number;
  }>;
  // Audit 2026-08-18 (#67) — transparency on which sessions the rule
  // picked and how many were skipped in between for not hitting the
  // threshold. See engine/readiness.ts.
  nonQualifyingSessionsSkipped: number;
};

export type DayAdjustmentProposalPayload = ProposalBase & {
  kind: "day_adjustment_soften";
  /**
   * The day the softening APPLIES to — the next day carrying loaded work,
   * which is not always the day the signal appeared (2026-08-27).
   *
   * `acceptDayAdjustment` writes `day_adjustments[date]` and the suggester
   * reads `day_adjustments[dateBeingViewed]`, so an adjustment accepted on
   * a rest day silently did nothing: there was no session for it to
   * change, and it did not carry forward. The founder logged two sessions
   * on a Thursday with no strength scheduled, was offered 10% lighter, and
   * reasonably asked what day it was for.
   */
  date: string;
  /** The day the SIGNAL came from, when that differs from `date`. */
  signalDate?: string;
  multiplier: number;
  matches: string[];
};

export type TierAdvanceProposalPayload = ProposalBase & {
  kind: "tier_advance";
  programSlug: string;
  tierId: string;
  tierLabel: string;
  varsHash: string;
  rationale?: string;
};

export type TMBumpProposalPayload = ProposalBase & {
  kind: "tm_bump";
  lifts: Array<{ exerciseId: string; currentTM: number; newTM: number; delta: number }>;
  triggers: string[];
};

/**
 * HERITAGE Phase 4 (2026-08-18) — non-responder classification proposal.
 * Fires when the non_responder_classifier composite verdict is
 * `true_non_response` for the active program. Delivers the program-authored
 * `recommendation_key` copy so the user can weigh a program swap or arc
 * change against staying the course. Confirm-first, like every proposal:
 * engine proposes, user Accepts (marks the recommendation acknowledged) or
 * Ignores (dismisses for 7 days).
 */
/**
 * HERITAGE Phase 5 (2026-08-18 · #73) — retest-due proposal.
 * Fires on Today when the user is inside the calendar window for a
 * retest_metrics_mid_block[].at_week or retest_metrics[].at_week gate
 * and no reading has been logged for that metric in the past 7 days.
 * Accept opens a logging sheet; Ignore dismisses for 3 days (so the user
 * has time but isn't spammed).
 */
export type RetestDueProposalPayload = ProposalBase & {
  kind: "retest_due";
  programSlug: string;
  metricId: string;
  metricDisplayName: string;
  metricUnit: string;
  atWeek: number;
  currentWeek: number;
  cadenceKind: "mid_block" | "end_of_block";
};

export type NonResponderProposalPayload = ProposalBase & {
  kind: "non_responder_recommendation";
  programSlug: string;
  verdict: "under_dosing" | "true_non_response";
  compositeCopy: string;
  perMetric: Array<{
    metric_id: string;
    role: "primary" | "secondary";
    delta_at_mid_block?: number;
    verdict: string;
  }>;
  recommendationKey: string;
};

export type Proposal =
  | ReadinessProposalPayload
  | DayAdjustmentProposalPayload
  | TierAdvanceProposalPayload
  | TMBumpProposalPayload
  | NonResponderProposalPayload
  | RetestDueProposalPayload;
export type DrillLevel = z.infer<typeof drillLevelSchema>;
export type DrillPrerequisite = z.infer<typeof drillPrerequisiteSchema>;
export type DrillRetestMetric = z.infer<typeof drillRetestMetricSchema>;
export type ExerciseLog = z.infer<typeof exerciseLogSchema>;
export type DayLog = z.infer<typeof dayLogSchema>;
export type Symptoms = z.infer<typeof symptomsSchema>;
export type Store = z.infer<typeof storeSchema>;
export type SetLog = z.infer<typeof setLogSchema>;
export type AssessmentEntry = z.infer<typeof assessmentEntrySchema>;
export type RunLog = z.infer<typeof runLogSchema>;
export type ScheduledBlock = z.infer<typeof scheduledBlockSchema>;
export type ScheduledBlockState = z.infer<typeof scheduledBlockStateSchema>;
export type MoveHistoryEntry = z.infer<typeof moveHistoryEntrySchema>;
export type BlockEngineAdjustment = z.infer<typeof blockEngineAdjustmentSchema>;
export type ProgramMaterialization = z.infer<typeof programMaterializationSchema>;
export type FeatureFlags = z.infer<typeof featureFlagsSchema>;
