# v2 Architecture Spec — Implementable

**Companion to** `dev/whitepapers/00_master.md` Part 3. This file is the engineering spec — what changes in the codebase, in what order, and how to migrate.

## The three commits that land v2

### Commit 1 — Drill library extraction

**Goal:** `exercises.json` becomes `drills.json`. Every entry adds the v2 fields (capability_domains, level, prerequisites, cues, feedback_type, retest_metric). No user-facing change; catalog still renders the same programs.

**File changes:**
- Rename `next-app/public/data/exercises.json` → `next-app/public/data/drills.json`
- Extend `exerciseSchema` in `src/lib/schemas.ts` to `drillSchema` with v2 fields (`capability_domains`, `level`, `prerequisites`, `cues_external_focus`, `cues_internal_focus`, `feedback_type`, `retest_metric`, `evidence_refs`)
- All existing `exercise_id` references in programs continue to work (drills use the same id namespace)
- Legacy `exercises.json` symlinked or aliased in the loader for one release cycle to avoid caller breakage

**Data authoring work per drill (~5 min each × 34 existing drills = ~3 hours):**
- Pick 1-3 `capability_domains` for each drill
- Assign `level` 1-5 within its dominant capability
- Fill external-focus cues (Wulf 1998, 2013 — required for any drill that ships)
- Fill `feedback_type` (`self_controlled` for skill, `KR` for logged strength, `KP` for form-critical)
- Set `retest_metric` (name / unit / direction)
- Set `evidence_refs` — array of citation ids into the program's evidence_base

**Ship:** no user-visible change. Preview: `/programs` catalog looks identical.

### Commit 2 — Program.generation_strategy field

**Goal:** every program declares `"correlated_tier"` or `"multi_dimensional"` in `programs/*.json`. Add the plan generator function that branches on this field.

**File changes:**
- Add `generation_strategy` (enum) to `programSchema` — required for new programs, defaults to `"correlated_tier"` for legacy programs during migration
- New file: `src/lib/engine/plan-generator.ts` — exports `generateWeeklyPlan(program, profile, historicalLogs)`
- New file: `src/lib/engine/capability-profile.ts` — user capability profile shape + updater functions
- Store extension: `store.user_profile.capability_profile: Record<string, { estimated_level, confidence, last_measured_at }>`

**Anterior Hip Rebuild + Engine Builder authored on `correlated_tier`.** No changes needed — the plan generator's `correlated_tier` branch applies the existing weekly template scaled by tier, which is exactly what those programs currently do.

**Ship:** no user-visible change. Both programs continue to render the same Today view.

### Commit 3 — Multi-dimensional generator + Handstand Walk

**Goal:** implement the `multi_dimensional` branch of the plan generator and use it to author Handstand Walk.

**File changes:**
- Implement `composeSession()` in `plan-generator.ts` following the 7 rules from whitepaper Part 3:
  1. Weakest-capability priority (Henry 1968; Proteau 1992)
  2. CI gated by phase — blocked weeks 1-2, random week 3+ (Wulf & Shea 2002; Shea & Morgan 1979)
  3. External-focus cues rendered on drill card (Wulf 1998, 2013)
  4. Feedback dose per drill type (Chiviacowsky & Wulf 2002; Winstein & Schmidt 1990)
  5. Prerequisite gating at composition time (Sands 2000; Gabbett 2016)
  6. Consolidation windows respected (Robertson 2004)
  7. Daily short over infrequent long for skills (Karni 1998; Walker 2003; Shea 2000)
- Author `programs/handstand-walk.json` with:
  - `generation_strategy: "multi_dimensional"`
  - Capability domains: `handstand_hold_static`, `handstand_walk_dynamic`, `handstand_turns`, `handstand_obstacles`, `wrist_load_tolerance`, `shoulder_overhead_endurance`
  - Intake collecting a self-report level per capability + physical tests to verify (hold time, walk distance, obstacle count, turn count)
  - Drill library reference — 20-30 handstand-family drills tagged appropriately
  - `evidence_base` citing motor learning primary sources

**Ship:** Handstand Walk appears in the catalog. Multi-dimensional plan generation is live.

## The drill schema in full

```typescript
export const drillSchema = z.object({
  // Legacy fields (preserved for backward compat)
  id: z.string(),
  name: z.string(),
  name_et: z.string().optional(),
  category: z.string(),
  targets: z.array(z.string()).optional(),
  default: z.record(z.string(), z.unknown()).optional(),
  setup: z.string().optional(),
  rationale: z.string().optional(),
  warning: z.string().optional(),
  avoid: z.string().optional(),
  flags: z.array(z.string()).optional(),
  video_url: z.string().optional(),
  video_search: z.string().optional(),

  // v2 additions
  capability_domains: z.array(z.string()).min(1),  // required — every drill has at least one
  level: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
  prerequisites: z.array(z.object({
    capability_domain: z.string(),
    minimum_level: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
    rationale: z.enum(["injury_mitigation", "coordination_prerequisite", "load_tolerance"]),
    source: z.enum(["literature", "coaching_consensus", "engineering"]),
    evidence_ref: z.string().optional(),  // required when source === "literature"
  })).default([]),
  cues_external_focus: z.array(z.string()).min(1),  // required — Wulf 2013
  cues_internal_focus: z.array(z.string()).default([]),
  feedback_type: z.enum(["KR", "KP", "self_controlled"]),
  retest_metric: z.object({
    name: z.string(),
    unit: z.string(),
    better: z.enum(["higher", "lower"]),
  }),
  default_dose: z.object({
    sets: z.number().optional(),
    reps: z.number().optional(),
    duration_s: z.number().optional(),
  }),
  rest_between_s: z.number().optional(),
  evidence_refs: z.array(z.string()).default([]),
});
```

## The capability profile

```typescript
export const capabilityProfileEntrySchema = z.object({
  estimated_level: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
  confidence: z.enum(["self_report", "physical_test", "adaptive_measured"]),
  last_measured_at: z.string(),  // ISO datetime
  measured_value: z.number().optional(),  // the raw number (e.g. hold seconds, walk metres)
  measured_unit: z.string().optional(),
});

// stored on user_profile
capability_profile: z.record(z.string(), capabilityProfileEntrySchema).optional(),
```

## The plan generator interface

```typescript
export function generateWeeklyPlan(
  program: Program,
  profile: UserCapabilityProfile,
  historicalLogs: DayLog[],
  weekStart: string,
): WeeklyPlan {
  switch (program.generation_strategy) {
    case "correlated_tier":
      return generateCorrelatedTierPlan(program, profile, historicalLogs, weekStart);
    case "multi_dimensional":
      return generateMultiDimensionalPlan(program, profile, historicalLogs, weekStart);
    default:
      // Legacy programs without the field: default to correlated_tier
      return generateCorrelatedTierPlan(program, profile, historicalLogs, weekStart);
  }
}
```

## Session composition — the multi-dimensional branch in pseudocode

```typescript
function generateMultiDimensionalPlan(
  program: Program,
  profile: UserCapabilityProfile,
  logs: DayLog[],
  weekStart: string,
): WeeklyPlan {
  const drills = program.drill_library;
  const phase = computePhaseFromWeekStart(program, weekStart);  // week 1-2 blocked, 3+ random
  const targets = pickTargetCapabilities(profile, program);      // rule 1 — weakest first
  const consolidationWindows = computeInterferenceWindows(logs); // rule 6
  const sessions: Session[] = [];

  for (const slot of program.weekly_slots) {
    const eligibleDrills = drills.filter(d =>
      d.capability_domains.some(c => targets.includes(c))
      && prerequisitesMet(d, profile)                     // rule 5
      && respectsConsolidation(d, consolidationWindows, slot.time)  // rule 6
    );
    const composed = phase === "blocked"
      ? blockedComposition(eligibleDrills, slot, profile)   // rule 2 weeks 1-2
      : randomComposition(eligibleDrills, slot, profile);   // rule 2 weeks 3+
    composed.forEach(drill => {
      drill.cue = drill.cues_external_focus[0];             // rule 3
      drill.feedback_config = drill.feedback_type;          // rule 4
    });
    sessions.push({ slot, drills: composed });
  }
  return { sessions };
}
```

## The trainer-parity claim ships with data

Every program's `evidence_base` now MUST cite primary sources for every session type. The whitepaper's Part 2 is the reference for the anti-dismissal defense. When a trainer or physio challenges any session choice in a shipped program:

- The user taps the (i) icon on the drill card
- The bottom sheet renders the `cues_external_focus`, `feedback_type`, the primary literature citation (from `evidence_refs`), and the `evidence_base.session_rationale` paragraph
- If the source is `"engineering"` (not literature), the sheet says so honestly

This is the mechanized honesty layer.

## Migration timeline (once decisions land)

| Commit | Est effort | User-visible change |
|---|---|---|
| Commit 1 (drill library) | 4-6 hours (3h data authoring + 1-3h code) | None |
| Commit 2 (`generation_strategy` + generator scaffold) | 4-6 hours | None (legacy programs default) |
| Commit 3 (multi_dim + Handstand Walk) | 30-40 hours (mostly Handstand Walk content authoring + drill library expansion for handstand family) | Handstand Walk appears in catalog |
| Engine Builder evidence_base rewrite | 6-8 hours | Program preview page shows deeper citations |

Total to full v2 with two programs shipping (Engine Builder correlated, Handstand Walk multi-dim): **~50 hours of focused work, plus content authoring for Handstand Walk**.

## Non-goals for v2 (deferred)

- Video / pose analysis for form check — flagged in `future-features.md`, needs separate architecture
- Wearable ingest — flagged
- Compatibility check for multi-program stacking — flagged (needs `intensity` + `domain` at program level; can add in v2.1)
- Injury profile → persistent Extras — flagged; requires `user.injury_profile` refactor

## Success criteria

v2 ships when:
1. Both `correlated_tier` and `multi_dimensional` programs render Today views correctly for real users
2. Every drill in the library has all required v2 fields populated with human-authored content (no auto-generated placeholders)
3. The `evidence_base` on both Engine Builder and Handstand Walk has ≥15 primary citations each
4. Beta users can complete an intake, receive a personalized plan, and progress through week 1 without engineering intervention

Then we invite Margus's gym members.
