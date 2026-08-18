# Overhead Mobility — Delta Audit · 2026-08-19

Persona: `persona-mobility` (consistent-average · 45 days · tier=foundation).
Artifact root: `next-app/tests/e2e/artifacts/personas/persona-mobility/`.
Program: `next-app/public/data/programs/overhead-mobility.json`.
Prior audit: `dev/audits/programs/2026-08-18-overhead-mobility-comprehensive.md`.
Master fix list: `dev/audits/programs/2026-08-18-comprehensive-reconciled.md`.

## 1. Verdict

Tonight's shipped batches (65a397b, cccd609, df9b3a0, c70feba) land the majority of
the overhead-mobility fix backlog: Week NaN is gone, the reveal card leads with the
plan name, retest cards prompt for a baseline instead of showing a silent dash grid,
seconds format correctly, the Push tier condition compiles against declared physical
tests, and the manifest recategorisation drops the program into "Left/right & mobility"
where a mobility-seeking user actually finds it. Two P0-2-adjacent regressions remain:
`program_states["overhead-mobility"]` has `tier` but no `started_at` because the persona
harness writes the tier directly without going through `setActiveProgram`, and the
History page still surfaces the metric name ("Loaded overhead shoulder flexion") from
`program_goal.display_name` — the P1-4 leak that the reveal card fixed one location of.
Adaptation flow is limited to phase advancement (persona logs no readings), and phase
advancement itself is now working end-to-end via the implicit shift fallback in
`schedule.ts` — Today correctly shows Phase 3 week 1 for a day-49 persona.

## 2. Fixed

### 2.1 P0-1 · Week NaN — fixed (commit 65a397b)

- `next-app/src/app/page.tsx:310` now calls `.slice(0, 10)` on
  `active_program_started_at` before concatenating `"T00:00:00"`, matching the guard
  pattern already used at `schedule.ts:251` and `plan-generator.ts:228`.
- Persona evidence: `persona-mobility/text/01-today.txt:32` reads
  `Week 8 · random practice — order shuffled by the seed. Shea & Morgan 1979.`
  (previously `Week NaN`).
- Cross-check: `grep -n "NaN" persona-mobility/text/*.txt` returns zero matches across
  all 15 text artifacts.

### 2.2 P1-1 · Category recategorisation — fixed (commit 65a397b)

- `next-app/public/data/programs/manifest.json:146` now sets
  `"category": "asymmetry"`, aligning with the manifest-declared category label at
  `manifest.json:301-305`.
- Persona evidence: `persona-mobility/text/06-programs.txt:88-101` lists
  Overhead Mobility under the "Left/right & mobility · 1" chip (previously under
  "Gymnastics & skill" alongside handstand-walk / muscle-up / pull-up).
- The landing-conversion mismatch flagged in the prior audit (`en.ts:63` "Skill" chip)
  is now resolved in the app; landing copy remains a separate concern.

### 2.3 P1-4 · Reveal-card metric-as-name — fixed at the reveal path (commit 65a397b)

- `next-app/src/lib/personalization/reveal-copy.ts:119-130` now prefers a
  title-cased slug over `program_goal.display_name`, with the audit reference
  ("Comprehensive audit 2026-08-18 P1-4") in the docstring.
- Persona evidence: `persona-mobility/text/01-today.txt:6` reads
  `Your Overhead Mobility plan is built.` (previously "Your Loaded overhead shoulder
  flexion plan is built.").
- **Not universally fixed** — see Section 3.2.

### 2.4 P1-5 · Retest empty-state prompt + context-aware CTA — fixed (commit df9b3a0)

- `next-app/src/components/progress/RetestMetricsPanel.tsx:141-148` renders
  `"No readings yet. Log your baseline below so the delta has something to track
  against."` when `m.baseline == null && m.current == null && canRetest`.
- The log-button label at `RetestMetricsPanel.tsx:227-231` correctly branches on
  `m.baseline == null` → `"Log baseline"`, else `"Log a new reading"`, else
  `"Retest — log new reading"` when due.
- Persona evidence: `persona-mobility/text/05-progress.txt:28-56` — all three retest
  cards (supine flexion, OHS depth, TGU hold) show the prompt with `LOG BASELINE`.
  The same fix carries into the report at `persona-mobility/text/10-report.txt:46-74`.

### 2.5 P1-6 · formatMetric seconds heuristic — fixed (commit 65a397b)

- `next-app/src/lib/engine/retest-evaluator.ts:242-254`: when `unit === "seconds"`
  and `Math.abs(rounded) < 90`, render `"15s"`; else render `mm:ss`. Comment cites
  P1-6 explicitly.
- Persona evidence: `persona-mobility/text/05-progress.txt:54` reads
  `Target 15s · stretch 30s` (previously `Target 0:15 · stretch 0:30`).
  Matching render at `persona-mobility/text/10-report.txt:72`.

### 2.6 P0-1 in Push-tier condition (JSON) — fixed (commit 65a397b)

- `next-app/public/data/programs/overhead-mobility.json:66` now reads
  `"condition": "shoulder_flexion_supine_deg >= 180 && tgu_hold_max_seconds >= 30"`.
  Both variables are declared physical tests (`:280`, `:296`), so the Push tier is
  reachable via `intake-tier.ts:355-419`'s var-binding step.
- Persona is tier=foundation and never ran intake, so the artifact does not exercise
  Push. Prior audit's P2-1 recommendation to add a `persona-mobility-push` variant
  stands — the reachability is verified by code inspection only.

### 2.7 Phase advancement via implicit shift — fixed (commit cccd609)

- `next-app/src/lib/engine/schedule.ts:63-90` (`shiftedPhases`) now computes an
  implicit shift = `startedAt - phase[0].starts` when no explicit
  `phase_shift_days` is stored, using either `program_states[slug].started_at` or
  `active_program_started_at`. Comment cites the audit reference
  ("Comprehensive audit 2026-08-18 P0-1").
- Program authored phases start 2026-08-13; persona `active_program_started_at` is
  `2026-07-01T08:00:01.223Z` (`final-store.json:433`) → shift = -43 days.
- Shifted phases: Phase 1 (2026-06-30 → 2026-07-20), Phase 2 (2026-07-21 →
  2026-08-17), Phase 3 (2026-08-18 → 2026-09-07).
- `persona-mobility/text/01-today.txt:22` correctly reads
  `Load + retest · Weeks 8–10 · week 1 of 3 · ends 7 Sept` for activeDate 2026-08-19.
  Day 49 = start of Phase 3, matching the authored 3-4-3 phase durations.

## 3. Still broken / partially broken

### 3.1 P0-2 (partial) · `program_states[slug].started_at` missing when persona seeds the tier

- `final-store.json:436-438` shows `"overhead-mobility": { "tier": "foundation" }`
  with no `started_at`, no `intake_answers`, no `capability_profile`,
  no `phase_shift_days`.
- Root cause is a **write-order interaction between the harness and the app writer**.
  `simulator-v2.ts:222-226` writes `program_states[slug] = { tier }` directly to
  localStorage. `useStore.ts:52-62`'s `ensureProgramStateEntry` is idempotent — line
  58's `if (!map[slug])` short-circuits when the entry already exists, so
  `started_at` never lands.
- **Impact is limited** because `schedule.ts:69-71` reads
  `program_states[slug].started_at ?? profile?.active_program_started_at`, so the
  implicit-shift fallback still works (verified in Section 2.7). But downstream code
  that assumes `program_states[slug].started_at` is the authoritative anchor will hit
  a bug on personas / real users who bypass `setActiveProgram`.
- Recommended fix path A (harness): `simulator-v2.ts:222-226` should also set
  `started_at: new Date().toISOString()` in the entry it writes.
- Recommended fix path B (writer): `ensureProgramStateEntry` at `useStore.ts:52-62`
  should always merge `started_at` when missing, not gate on `!map[slug]`.
- Path B is safer because it heals any pre-existing store that shipped through the
  window before c70feba.

### 3.2 P1-4 (partial) · Metric name still leaks on History page

- `persona-mobility/text/04-history.txt:27` renders `Loaded overhead shoulder flexion`
  as the "Recent sessions" section heading.
- Source: `next-app/src/components/history/BlockHistorySection.tsx:107-109` reads
  `g.program?.program_goal?.display_name ?? g.slug.replace(/-/g, " ")` — the same
  metric-name-vs-plan-name conflation the reveal card had.
- Fix parallels the reveal-copy change: prefer a title-cased slug (or the manifest
  name from the loaded manifest) over `program_goal.display_name`. One-line change.
- Same anti-pattern should be swept: `grep -rn "program_goal.display_name"
  next-app/src/` may find more sites.

### 3.3 P1-3 (partial) · Retest cards render but nothing about "check at week 10" is
phase-relative

- Prior audit's P1-3 flagged two sub-issues: (a) no empty-state prompt (now FIXED per
  Section 2.4), and (b) `CHECK AT WEEK 10` reads as a distant target with no
  anchoring. Sub-issue (b) is unchanged — `persona-mobility/text/05-progress.txt:30`
  still shows `CHECK AT WEEK 10` for a day-49 persona who is actually IN week 8 of
  Phase 3 (the retest phase). The retest is essentially due now.
- Add a phase-relative countdown or a "due this phase" chip when
  `active phase.id === "phase_3_load_and_retest"` (or in general, when the current
  week ≥ `at_week - 1`).

### 3.4 P1-8 · Morning check still generic, no shoulder end-range prompt

- `persona-mobility/text/13-check.txt:6-16` still shows the generic
  Shoulder / Wrist / Muscle soreness / Low back slider set. Overhead-mobility's
  declared symptoms (`overhead-mobility.json:743-745`:
  `shoulder_pain_flexion_end_range`, `shoulder_pain_load`) are not surfaced.
- Not addressed in tonight's batches. Would require the check page to consume
  `program.daily_log_schema.symptoms[]`.

### 3.5 P1-7 · History heatmap still one-color for symptom-only days

- `persona-mobility/text/04-history.txt:10` shows `0 strength · 45 active total`;
  legend at `:19-24` is still `green / amber / red / accessory / skipped / nothing`.
  Mobility drills (had any been logged) and symptom-only days would both surface as
  the same color-slot. Not addressed in tonight's batches.

### 3.6 P1-4 · Progress adherence "0/45 done · 0%" — persona harness gap

- `persona-mobility/text/05-progress.txt:17-21`:
  `overhead mobility · 0/45 done · 0% · 36 UPCOMING · 9 SKIPPED`.
- Expected per prompt: mobility programs still have the exercise-item gap — the
  simulator does not write `TGU_hold_max_seconds`, OHS depth readings, or
  `shoulder_flexion_supine_deg` values because none of those are strength-set-shaped.
- `final-store.json` has 45 daily log entries with `"exercises": {}` on each. This is
  the known Batch 3b deferred gap.
- **Not a new bug** — flagged for the harness backlog. Downstream: retest cards can't
  animate, adherence math shows 0%, and the tier-promotion path can't be exercised.

### 3.7 New inconsistency · Today and Week disagree about the current phase

- `persona-mobility/text/01-today.txt:22` (activeDate 2026-08-19) reads
  `Load + retest · Weeks 8–10 · week 1 of 3 · ends 7 Sept` (Phase 3).
- `persona-mobility/text/02-week.txt:14` (viewedMon 2026-08-17) reads
  `Active + light-loaded · Weeks 4–7 · Add active ROM…` (Phase 2).
- Root cause: `next-app/src/app/week/page.tsx:103` calls
  `activePhaseFor(program, iso(viewedMon), userProfile)`. The shifted Phase 2 ends
  2026-08-17 exactly, so Monday of the current week falls in Phase 2 while Today
  (Wed 19 Aug) is in Phase 3. The Week page picks Phase 2 as the "dominant phase"
  even though 5 of 7 rendered days are in Phase 3.
- Not a functional bug (each day in the week renders its own `dayPhase` at
  `week/page.tsx:262`), but the weekly banner is now misleading. Options: (a) use
  `activePhaseFor` at the mid-week Thursday, (b) pick the phase covering the
  most days in the week, (c) pick the newest phase whenever the week spans a
  transition.
- Low priority — this is only a copy inconsistency, not a broken flow.

### 3.8 P2-4 · Report "MORNING CHECK · 45g · 1050?" — appears fixed

- `persona-mobility/text/10-report.txt:38-40` now cleanly reads
  `MORNING CHECK / 45 green`. Prior audit's P2-4 shorthand render bug does not
  reproduce.

## 4. Adaptation delta

Persona has 0 exercises logged, 0 retest readings, 0 capability_profile entries.
Consistent-average archetype seeded 45 daily symptom rows (2026-07-02 → 2026-08-15)
with `low_back` + `life_load` only — never the program's declared shoulder symptoms.
Adaptation surface available for verification is limited to phase advancement and
authoring integrity.

**Phase advancement — WORKING.** Day 49 correctly lands in Phase 3 via the
implicit-shift fallback at `schedule.ts:63-90`. Prior audit's P0-2 (phase always
falls back to authored dates when intake wasn't run) is now fixed for shift resolution
even though the `program_states[slug].started_at` field itself remains unpopulated
(Section 3.1).

**Retest evaluation — INERT.** `multi-dim.ts:25-28` (Phase B stub) returns
`shouldEvaluate = false`, so no retest_evaluator trigger fires. Not a regression —
consistent with prior audit's expectation.

**Non-strength adaptation — INERT.** Same as prior audit: no readings, no
capability_profile, nothing to react to. The engine is not silently mutating anything
— good.

**Push-tier reachability — verified by code, not by artifact.** JSON condition
compiles against declared vars; intake path unexercised.

## 5. Landing → app residual gap

The app-side gap (Overhead Mobility surfacing under "Gymnastics & skill" instead of
"Left/right & mobility") is now closed — see Section 2.2. A user landing on
`/programs` from a "shoulder mobility" search finds the program under the mobility
chip. This is the highest-payoff single-line change in tonight's batches for
discovery.

Landing copy still describes the program under a "Skill" chip
(`landing/src/i18n/dictionaries/en.ts:59, :63`) and does not use the word "mobility"
in the pitch. That's a landing-side gap, not an app gap. Because landing → app
category no longer matches (landing says Skill, app now says Mobility), the landing
copy should be updated to prevent user confusion at the conversion moment: either
add a mobility-chip in landing or rename the "Skill" chip's overhead-mobility entry
to sit under the mobility umbrella. Not a P0.

## 6. Recommended next fixes

Ordered by impact-per-line-change:

1. **P0-2 completion · `ensureProgramStateEntry` at `useStore.ts:52-62` should
   always merge `started_at` when the field is missing on an existing entry.**
   One-line change; heals both the harness path and any pre-existing store that
   shipped before c70feba. Currently `if (!map[slug])` gates too strictly.

2. **P1-4 sweep · History page + any other `program_goal.display_name` reader.**
   `BlockHistorySection.tsx:108` should prefer manifest name / title-cased slug,
   matching `reveal-copy.ts:119-130`. Grep for `program_goal?.display_name` and
   `program_goal.display_name` across `next-app/src/` and normalise.

3. **P1-3 completion · Phase-relative retest countdown.** When Today's phase is the
   phase containing an `at_week` retest (Phase 3 for overhead-mobility), replace
   `CHECK AT WEEK 10` with `RETEST DUE THIS PHASE` or `DUE IN 1 WEEK`. Highest
   activation payoff for the mobility retest loop.

4. **P1-8 · Program-tailored morning check.** Consume
   `program.daily_log_schema.symptoms[]` in `/check`. Overhead-mobility's
   `shoulder_pain_flexion_end_range` + `shoulder_pain_load` are meaningfully
   different from the generic "shoulder soreness 0-10" slider. Applies to any
   program that authors its own `daily_log_schema.symptoms`.

5. **Harness · Persona simulator should seed mobility drill items** for programs
   whose blocks are mobility-shaped (`TGU_hold_max_seconds`, `shoulder_flexion_supine_deg`,
   OHS depth). Batch 3b deferred gap; without this, retest / capability_profile
   evolution can't be audited via persona artifacts. Also needed to verify
   Push-tier promotion.

6. **Harness · Add `persona-mobility-push` variant** that submits
   `shoulder_flexion_supine_deg = 185` + `tgu_hold_max_seconds = 45` and runs
   intake. Verifies the Push tier reachability change from screenshots, not just
   from code inspection.

7. **Week-page phase banner · Prefer mid-week or majority-day phase.**
   `week/page.tsx:103` should use Thursday (or the phase covering the most days in
   the viewed week) instead of `iso(viewedMon)`. Fixes the Section 3.7
   Today/Week disagreement.

8. **P1-7 · History heatmap distinguish mobility drills from symptom-only days.**
   Add a fifth color-slot (or an icon overlay) for programs whose sessions are
   accessory-only. Applies to overhead-mobility, first-strict-pullup on
   scap-only weeks, and future skill-only programs.

9. **P2-3 · Retire or reroute `program_goal.metric = shoulder_flexion_loaded_deg`.**
   No logging path exists for this metric — either drop `program_goal` or rename
   to `shoulder_flexion_supine_deg` so the goal is actually loggable.

10. **Landing copy · Add "mobility" language to the Overhead Mobility pitch and
    consider a mobility-chip on landing.** Now that the app categorises this as
    mobility, landing should follow to keep the funnel consistent.

## 7. What works (unchanged since 2026-08-18)

- Program authoring remains the cleanest of the multi-tier arc — sequential phases,
  matching `physical_test` / `retest_metrics` source_refs, humane safety gates.
- Preview page (`persona-mobility/text/07-programs-active.txt:26-31`) is honest
  about who this is for and what week 10 delivers.
- Not-medical-advice framing at `onboarding_steps[1]` still explicit.
- `engineering_choices_flagged` transparency preserved.
- All three retest metrics remain declared with `source: physical_test` and matching
  units, correctly consumed by the (now-updated) `RetestMetricsPanel`.
