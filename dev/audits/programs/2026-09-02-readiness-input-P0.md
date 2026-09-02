# P0 · The readiness gate reads one person's hip-rehab body map, for every program

**Found:** 2026-09-02, during the comprehensive audit of the three CITED programs.
**Scope:** cross-cutting. Affects all 8 catalog-public programs, not only the three.
**Artifacts:** `persona-pullup`, `persona-muscleup`, `persona-engine-block2` (2026-09-02 run).

## The finding

Every program authors its own daily log shape. None of it is read.

| Program | Authors these symptom inputs | Reaches the engine |
|---|---|---|
| `first-strict-pullup` | `shoulder_symptom_score`, `elbow_symptom_score`, `grip_stiffness_am` | none |
| `muscle-up` | `shoulder_`, `elbow_`, `wrist_symptom_score` | none |
| `engine-builder-block-2` | `resting_hr` vs baseline, pace/watt drop | none |
| `anterior-hip-rebuild` | `symptoms` region map | **all of it** |

The morning check renders exactly one field set, hardcoded in
`src/app/check/page.tsx:127-138` and pinned by `symptomsSchema`
(`src/lib/schemas.ts:820-839`):

```
groin_left · low_back · buttock_left · shoulder_right
click_present · click_painful · morning_stiffness_min · night_pain · gait_change
life_load · outside_training
```

That is `anterior-hip-rebuild`'s clinical map — left groin, left buttock, right
shoulder, hip clicking, night pain, gait change. It is the one program in the
manifest marked `personal: true`.

`reasonFor` (`check/page.tsx:101-125`) then derives `green|amber|red` from
`max(groin_left, low_back, buttock_left, shoulder_right)` plus the hip red
flags, and `HeroStateCard.COPY` (`HeroStateCard.tsx:40-90`) states the
thresholds as fixed prose citing Kellmann 2010.

## Why it matters, per program

- **first-strict-pullup** — medial epicondylitis is *the* classic pull-up injury.
  The program authors `elbow_symptom_score`. **There is no elbow field.** A user
  whose elbow is at 7/10 reports nothing, and the engine sees green.
- **muscle-up** — false grip is notorious for wrist strain. The program authors
  `wrist_symptom_score`. **There is no wrist field.**
- **Either** — only `shoulder_right` exists. A left shoulder has nowhere to go.
- **engine-builder-block-2** — an aerobic program asks the user about hip
  clicking and gait change, and shows amber as *"a 4-5/10 or morning stiffness
  over 30 min"* (`persona-engine-block2/text/01-day.txt:11`). Its authored
  readiness signals — resting HR against baseline, pace drop at fixed HR — are
  never read.

## Two documentation claims this falsifies

`CLAUDE.md`, App notes:

> "`program.json.daily_log_schema` is the logging input shape."

False for 8 of 9 programs.

> "`progression_rules.states[]` derives `green|amber|red` from a logged symptom score."

False for all 9. `progression_rules` is typed `z.record(z.string(), z.unknown())`
(`schemas.ts:571`) — an opaque blob. Nothing reads `states[]`. The only mention
in `src/` is a comment in `note-signals.ts:70`.

## A related violation of a hard constraint

`CLAUDE.md` requires: *"Progression rules stay machine-evaluable — conditions,
not prose."* All three programs' `red` state is prose inside `any_of`:

```json
"any_of": [
  "shoulder_or_elbow_symptom_score_previous_day > 6",
  "new_shoulder_pain_during_hang",
  "acute_injury"
]
```

`any_of` appears in three program files and in **no** source file. Amber's
`"or"` key is likewise a prose sentence. These were never evaluable — which is
survivable only because nothing evaluates the block at all.

## Severity

Not dangerous — the hardcoded ladder is conservative, and is in fact *stricter*
than what pull-up authored (app reds at >5; the program reds at >6). Nobody is
being told to train through pain.

But it hollows out the product's central claim. "Adapts every session against
your log" is true only for the program whose body map got hardcoded. For the
other eight the engine is asking the wrong questions and cannot see the answer
that matters.

## Fix options

1. **Program-driven check.** Render fields from the active program's
   `daily_log_schema`, derive state from its `progression_rules.states[]`.
   Correct, and the largest change: needs a real condition evaluator, a
   migration for stored `symptoms`, and per-program check UI.
2. **Generic core + program extras.** Keep a shared spine (sleep, life load,
   readiness, red flags) and let each program add 2-3 scored regions. Smaller,
   and fixes the elbow/wrist blind spots.
3. **Minimum viable honesty.** Add the missing regions as optional fields and
   fold them into `reasonFor`'s peak. Hours, not days. Does not make authored
   rules live, but stops the engine being blind to the injuries these programs
   actually cause.

Option 3 unblocks promotion to REVIEWED; 1 and 2 are product decisions.


---

# Resolution — shipped 2026-09-02

Founder chose the program-driven data model (option 1) over the generic-core
compromise, correctly: my option 2 capped programs at "2-3 extras" for no
principled reason, and I over-stated the fragmentation risk — every program
already authors `sleep_hours` and `subjective_readiness_0_10`, so the shared
spine was achievable under either.

Built as option 1 for the data model, with the safety gate kept central.

## What shipped

- **`lib/symptom-regions.ts`** — a curated region library. Programs select from
  it via `symptom_regions[]`, exactly as they select from `exercises.json`.
  Sided ids for programs whose record is explicitly left-vs-right, unsided for
  those where laterality is not the clinical point and a six-row daily form
  would just train people to tap through.
- **No migration.** Region ids are the same flat top-level keys `symptoms`
  always used, so multi-year history under `groin_left` still validates and
  still renders. Nothing orphaned.
- **`lib/symptom-state.ts`** — `deriveState` / `reasonForState` / `peakRegionScore`,
  the single audited gate. Peak runs over every scored region. The "why" line
  now names the region that fired ("Elbow R is above 5/10") instead of "a
  symptom score".
- **Check page** — renders the active program's regions, loaded from the program
  JSON, falling back to the historical four if the load fails rather than
  rendering an empty form.
- **Downstream** — `SymptomLoadChart`, `CutCLogList` and the specialist report
  all enumerate the region library instead of four hip keys, so a logged elbow
  is actually shown back. `report.symptomSeries.regions` is keyed by region id.
- **Per-program declarations** — all nine programs, e.g. pull-up
  `[shoulder, elbow, low_back]`, muscle-up `[shoulder, elbow, wrist]`, hip keeps
  its original four.

## Two further defects found while fixing this

- **`SKILL_PROGRAMS` contained `muscle-up-first-rep`**, a slug that does not
  exist — the real one is `muscle-up`. So muscle-up never received the skill
  labels and fell through to the generic bucket set. A dead identifier matching
  nothing, invisible because the fallback looked plausible.
- **`SKILL_REGIONS` relabelled `groin_left` as "Wrist".** The label was remapped;
  the storage key was not. Skill users' wrist scores were being written into the
  groin series — actively corrupting the longitudinal record the History view
  exists to build, not merely failing to record.

## Guards added

- `symptom-state.test.ts` — 10 cases. Elbow at 7 reds a pull-up user; wrist at 4
  ambers a muscle-up user; a left shoulder is visible at all; the hip program's
  four behave exactly as before.
- `data-integrity.test.ts` — every program declares regions; every id resolves;
  1-5 regions each; pull-up contains `elbow` and muscle-up contains `wrist`;
  the personal program keeps its own map.
- **Dead-key test** — fails on any top-level program key the runtime discards.
  This is the durable fix for the class, and it found two more on its first run:
  `handstand-walk.phase_gates` (reported P0-5 in the 2026-08-18 audit and never
  removed) and `overhead-mobility.capability_domains` (previously unknown). Both
  now listed as knowingly dead with reasons; tracked as PROG-1 and PROG-2.
- **Harness** — the simulator projects archetype severities onto each program's
  declared regions, so gymnastics personas stop writing `groin_left`; its
  `computeDerivedState` mirrors the app over all scored regions; and
  `personas.spec.ts` asserts each persona's captured check contains the labels
  its program declares.

## Still open

- ~~Red flags remain hip-scoped via an `isHip` check~~ — **closed 2026-09-02.**
  `symptom_flags[]` now works exactly as `symptom_regions[]` does: declared per
  program, resolved against a shared `SYMPTOM_FLAGS` library, guarded by tests.
  `night_pain` is asserted present on every program (pain that wakes you is a
  red flag whatever you train for, and it is the one flag a program must not be
  able to drop by omission), and the two hip-labral flags are asserted to appear
  on `anterior-hip-rebuild` and nowhere else. The check page now contains no
  slug comparisons at all.
- `progression_rules` and `daily_log_schema` remain in the program files as
  authoring documentation. They are now explicitly marked dead in the test's
  allowlist rather than silently ignored.
