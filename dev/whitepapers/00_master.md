# The Adaptive Training Whitepaper

**Purpose.** This document is the evidence base and design defense for the app. Every claim we make in a shipped program, every session prescription, every "why we do this" the user reads — must trace back to something in here or be explicitly labeled as engineering pragmatism.

**Structure.**
- **Part 1** — Evidence base (aerobic, concurrent training, motor learning). Detailed reports live in the sibling files.
- **Part 2** — Trainer-parity audit. What a personal trainer delivers, where we match, where we exceed, and the gaps we honestly admit.
- **Part 3** — Unified architecture (v2). One system supporting both correlated-capability programs (endurance, strength) and multi-dimensional programs (skill, gymnastics).
- **Part 4** — What we will not do. The explicit list of trainer-only capabilities we refuse to fake.

**Source reports** (live alongside this file):
- `01_aerobic_physiology.md` — 25+ primary sources on mitochondrial biogenesis, capillary density, cardiac remodeling, lactate metabolism, VO2max, HR zones, detraining, individual variation, age/sex modifiers
- `02_concurrent_training.md` — 35+ primary sources on the interference effect, session sequencing, modality, dose-response, nutrition, hybrid athlete research
- `03_motor_learning.md` — 40+ primary sources on motor learning stages, contextual interference, specificity, external focus, feedback, deliberate practice, consolidation, skill assessment

Total: **100+ primary peer-reviewed sources with effect sizes and study details.**

---

## Part 2 — Trainer-parity audit

*What a personal trainer actually delivers, how the app compares, and the explicit defense against the "nice app but you need a personal trainer" dismissal.*

### The honest median trainer

Not the imaginary elite coach with a physiology PhD. The actual trainer most gym members pay:

- Writes programs **every 2-4 weeks**, often monthly
- Adjustments happen at the next in-person session (**1-3× per week**)
- No systematic between-session tracking
- Doesn't remember what you said last Tuesday unless they wrote it down
- Can't cite the study behind their programming choice
- No cross-referenced pattern analysis across weeks or months
- Between sessions, the client trains alone

### What the app already does that the trainer doesn't

| Capability | Trainer (median) | App |
|---|---|---|
| **Adjusts every session** based on the last one | No — batched every 2-4 weeks | Yes — RPE + notes + cross-set drift + symptom carryover |
| **Parses free-text notes** for fatigue, pain, external load | No | Yes — regex extractor covering EN + ET, primed by physio-linguistic markers |
| **Remembers everything** across months and years | No, not systematically | Yes — full log queryable by any dimension |
| **Cross-references symptom trends with training load** | No | Yes — the specialist report is this artefact |
| **Confirm-first proposals** — engine suggests, user accepts | Not the typical dynamic | Yes — every adaptive change requires explicit Accept |
| **Cites the study behind every session choice** | No | Yes — `evidence_base` per program, sources per session type |
| **Available at 06:00 Sunday when deciding to train** | No | Yes — no session booking, no scheduling |
| **Zero upsell pressure** to book more sessions | Structural conflict of interest | Yes — subscription is flat |

The four rows in bold — adjustment frequency, note parsing, memory, and evidence — are structural advantages, not features. A trainer cannot match them without becoming an app.

### What a trainer does that the app cannot (yet)

Honest gaps. These do not go into marketing copy. They go into the whitepaper.

| Capability | Why we can't fake it | Our mitigation |
|---|---|---|
| **Watching your form live and catching knee valgus** | No live vision | Exercise cards flag common failure modes; force honest self-report; the notes engine catches subtle drift |
| **In-person motivation on a bad day** | We're not next to you | Streak, roadmap progress bar, weekly narrative give internal motivation; specialist report shows the arc is real |
| **Physical cueing** (hand on the shoulder to fix rotation) | We're not next to you | External-focus cues in the drill library (Wulf 1998, 2013) — the evidence-based verbal substitute |
| **Reading room energy** (tired, distracted, injured, upset) | Text-only interface | Morning check + life-load slider + notes-signal engine covers ~70% of what a trainer reads |
| **Medical assessment** (is this pain benign or serious?) | Not credentialed, not scoped | Red-flag pattern detection + explicit clinician-referral prompts; medical disclaimer honest |

The correct positioning is not "app replaces trainer." It is: **app does what median trainers actually deliver (batched biweekly plans, general advice, no session-by-session adjustment) *plus* what they structurally can't (daily adaptation, perfect memory, cited evidence, zero conflict of interest).** For elite one-on-one coaching, the app complements rather than replaces.

### The positioning line, defensible

> *"A personal trainer writes your plan every 2 weeks. This adapts to every rep, every note, every morning."*

Every claim in this sentence traces to:
- "Adapts every rep" — adaptive engine (documented in-code, see `suggest.ts`, `note-signals.ts`, `adapt.ts`)
- "Every note" — free-text signal extractor (`extractSignals` covers pain/fatigue/external-load/RPE-drift keywords in EN + ET)
- "Every morning" — morning check + state carryover (documented in `check/page.tsx`, engine's state-carry logic)

---

## Part 3 — Unified architecture (v2)

*One system supporting both correlated-capability programs (Engine Builder, strength arcs) and multi-dimensional programs (Handstand Walk, gymnastics skills). The architecture is a superset that reduces to tiered generation for programs where capability moves together, and expands to component-level generation for programs where sub-skills spread independently.*

### The fundamental data unit: the drill

Every practicable action in the app is a **drill**. Drills live in one library (`drills.json`, superseding parts of `exercises.json` for programmable content). Each drill declares:

```typescript
type Drill = {
  id: string;
  name: string;
  category: "endurance" | "strength" | "skill" | "mobility" | "rehab";
  capability_domains: string[];              // multi-tag: e.g. ["handstand_hold", "shoulder_endurance"]
  level: 1 | 2 | 3 | 4 | 5;                  // difficulty within its capability domain
  prerequisites: Array<{                     // gated on other drill capability levels
    capability_domain: string;
    minimum_level: 1 | 2 | 3 | 4 | 5;
    rationale: "injury_mitigation" | "coordination_prerequisite" | "load_tolerance";
    source: "literature" | "coaching_consensus" | "engineering";
  }>;
  cues_external_focus: string[];             // Wulf 1998 — always external, never internal
  cues_internal_focus: string[];             // fallback / advanced use only
  feedback_type: "KR" | "KP" | "self_controlled";  // Winstein & Schmidt 1990; Chiviacowsky & Wulf 2002
  retest_metric: {
    name: string;
    unit: string;
    better: "higher" | "lower";
  };
  default_dose: { sets?: number; reps?: number; duration_s?: number };
  rest_between: number;                       // seconds
  video_url?: string;
  evidence_refs: string[];                    // citation ids into the program's evidence_base
};
```

### The program declares its generation strategy

```typescript
type Program = {
  // ... existing fields (id, slug, name, category, evidence_base, etc.)
  generation_strategy: "correlated_tier" | "multi_dimensional";
  // ...
};
```

**`correlated_tier`** — Engine Builder, strength arcs, any program where the assessment produces a single dominant tier and the sub-metrics move together. The intake picks Foundation / Progression / Push. Session composition follows a fixed weekly template scaled by tier.

**`multi_dimensional`** — Handstand Walk, muscle-up, HSPU, any skill program where sub-capabilities develop independently. The intake collects per-capability scores. The generator composes each session drill-by-drill, targeting each of the user's weak capabilities at that capability's own level.

### Intake schema (superset supporting both)

```typescript
type IntakeQuestion = {
  id: string;
  label: string;
  type: "select" | "number" | "boolean" | "slider" | "text";
  capability_domain?: string;                  // if answering this affects one specific capability
  weight: number;                              // how much this answer factors into the initial plan
  // ... other UI fields
};
```

For a `correlated_tier` program, questions are aggregated across capability domains to pick a tier. For a `multi_dimensional` program, each question maps to one capability_domain and produces an independent capability_level_estimate for that domain.

### The plan generator: one function, two modes

```typescript
type UserCapabilityProfile = Record<string, {
  estimated_level: 1 | 2 | 3 | 4 | 5;
  confidence: "self_report" | "physical_test" | "adaptive_measured";
  last_measured_at: string;
}>;

function generateWeeklyPlan(
  program: Program,
  profile: UserCapabilityProfile,
  historicalLogs: DayLog[],
): WeeklyPlan {
  if (program.generation_strategy === "correlated_tier") {
    const tier = pickTier(program.plan_tiers, profile);
    return applyTemplate(program.weekly_template, tier, historicalLogs);
  }
  // multi_dimensional path
  const sessions: Session[] = [];
  for (const day of program.weekly_slots) {
    const session = composeSession({
      slotType: day.slotType,                 // strength_priority | skill_priority | recovery | ...
      targets: pickTargetsForToday(profile, historicalLogs),
      library: program.drill_library,
      consolidation_windows: computeInterferenceWindows(historicalLogs),  // Robertson 2004
    });
    sessions.push(session);
  }
  return { sessions };
}
```

### Session composition — the multi-dimensional rules

Grounded in cited literature:

1. **Weakest-capability priority.** If freestand is level 1 and walk-distance is level 3, freestand gets more session minutes. Rationale: skill acquisition is capability-specific (Henry 1968; Proteau 1992).

2. **Contextual interference gated by phase.** Weeks 1-2 of a program are **blocked practice** for the target capability at its current level. Week 3+ introduces **random rotation** across drills within a session. Rationale: Wulf & Shea 2002 — CI benefits emerge once basic patterning stabilizes.

3. **External-focus cues rendered on the drill card.** Every drill card shows the external-focus cue verbatim. Internal-focus cues are hidden by default. Rationale: Wulf 1998, 2013.

4. **Feedback dose set by drill type.** Skill drills default to `self_controlled` feedback (user requests it after a set). Strength drills default to `KR` (rep + weight logged). Rationale: Chiviacowsky & Wulf 2002; Winstein & Schmidt 1990.

5. **Prerequisite gating enforced at composition time.** If a target drill's prerequisites aren't cleared in the profile, the generator picks the closest capability-substitute drill at the level the user *is* at. Rationale: Sands 2000; Gabbett 2016 acute-to-chronic workload ratio.

6. **Consolidation windows respected.** Skill sessions separated by ≥4 hours from strength sessions targeting the same joint system (wrist for handstand, shoulder for HSPU). Rationale: Robertson 2004 interference window.

7. **Daily short over infrequent long for skills.** 15-25 min daily skill exposure > 60 min twice-weekly. Rationale: Karni 1998; Walker 2003; Shea 2000 spacing effect.

### The adaptive layer — unchanged, both strategies use it

The engine's per-session adaptation (RPE-based load modulation, notes-signal extraction, cross-set drift detection, morning-check state carryover, confirm-first proposals) is **generation-strategy-agnostic**. Both `correlated_tier` and `multi_dimensional` programs get identical treatment session-to-session once the initial plan is set.

This is the design elegance: one adaptive engine + two generation strategies + one drill library = complete coverage.

### What each program declares

**Engine Builder** (v2, after refactor):
- `generation_strategy: "correlated_tier"`
- Existing tier structure (Foundation / Progression / Push)
- Intake questions aggregate to a single tier
- Weekly template scaled by tier
- All Engine Builder logic already fits this pattern — mostly a data migration, not a rewrite

**Handstand Walk** (v2, first program authored on the new architecture):
- `generation_strategy: "multi_dimensional"`
- Capability domains: `handstand_hold_static`, `handstand_walk_dynamic`, `handstand_turns`, `handstand_obstacles`, `wrist_load_tolerance`, `shoulder_overhead_endurance`
- Intake collects a level (1-5) per capability
- Session composition per the rules above

**Programs neither Margus nor any user has yet authored** — First Strict Pull-Up, First Strict HSPU, First Bar Muscle-Up — inherit multi-dimensional strategy naturally (pull, dip, transition, kip, false grip are independent sub-skills).

### Migration path

- **v1 (current)**: Engine Builder authored with fixed tiers, no drill library, no multi_dimensional generation. Ships as-is once evidence_base is rewritten with primary sources.
- **v1.5**: Extract drill library from existing `exercises.json` entries used in Engine Builder. Tag each with capability_domain, level, prerequisites, cues, feedback_type. Zero user-facing change.
- **v2**: Engine Builder becomes a `correlated_tier` program that references the drill library. Handstand Walk authored as `multi_dimensional`, first proof of the new architecture. Both live in the catalog side-by-side.
- **v2.1+**: Additional skill programs (pull-up, HSPU, muscle-up) authored on `multi_dimensional` template. Additional endurance/strength programs (Deadlift base builder, HYROX prep) authored on `correlated_tier`.

### The engineering choices we flag as choices, not evidence

Per Part 1's cross-cutting table, the app must never market these as evidence:

- Exact session length (30 vs 60 min) — no strong evidence at this granularity
- Retest cadence (weekly vs biweekly) — engineering choice
- Exact prerequisite thresholds (30s vs 60s handstand hold before walk work) — coaching consensus, not tested
- Specific cue phrasing — Wulf's external-focus principle is directional; wording is craft
- Number of drills per session — no dose-response research for gymnastic skills

These live in the app's `rationale` metadata with an explicit `source: "engineering"` tag. When the user taps "why 45 minutes?" they get the honest answer.

---

## Part 4 — What we will not do

Explicit refusal list. The gaps we don't paper over with marketing:

1. **We will not fake live form check.** The user's form is not visible to us. Exercise cards flag common failure modes; the user honestly self-reports. Future feature: opt-in pose analysis with clear cost + accuracy caveats.

2. **We will not fake medical assessment.** The app is a training log, not a diagnostic tool. Red-flag patterns fire the escalate-to-clinician banner (documented in `SignalsStrip`), not a treatment plan.

3. **We will not fake in-person motivation.** The user is alone on Sunday morning. The streak, the roadmap, and the specialist-report artefact are the honest levers we can pull. We won't ship guilt-based streak-break notifications (see FTC 2025 dark-pattern guidance in `future-features.md`).

4. **We will not fake certainty about individual response.** Genetic non-responder / hyper-responder variance is real (Bouchard 1999 HERITAGE — ~10× range in VO2max response). Programs quote expected outcomes with the honest ranges from the literature, not a single number.

5. **We will not fake real-time cueing on the rep.** External-focus cues on the drill card is what we ship. A trainer's live "elbow higher" doesn't come through a screen.

6. **We will not fake nutrition coaching.** We surface the peer-reviewed protein/carb guidance (Morton 2018, Aragon & Schoenfeld 2013, Impey 2018) as reference material. We don't prescribe meals or track macros. That's a different app.

7. **We will not fake being the coach who watched you grow up in gymnastics.** Skill programs cite the gymnastics literature (Sleeper 2012 GFMT, Sands 2000, biomechanical analyses) as reference material. They are not substitutes for a coach who has watched the specific athlete for years.

---

## What this whitepaper commits us to

- Every session prescription in every shipped program traces to a citation or an engineering flag
- The `evidence_base` on each program is not marketing — it is the trainer-defense document
- The generation strategy per program is explicit and defensible
- We ship the gaps in the "won't do" list on the app itself (privacy page, evidence page, in the intake copy) so users see the honesty before they sign up

---

*Living document. Update as new primary sources land, as programs are authored, and as user feedback reveals gaps. Every change here should ripple to the affected program's `evidence_base` and the landing page's public-facing evidence link.*
