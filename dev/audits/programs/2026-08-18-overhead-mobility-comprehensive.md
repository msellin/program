# Overhead Mobility — Comprehensive Audit · 2026-08-18

Persona: `persona-mobility` (consistent-average · 45 days).
Artifact root: `next-app/tests/e2e/artifacts/personas/persona-mobility/`.
Program: `next-app/public/data/programs/overhead-mobility.json`.

## 1. Verdict

The program authoring is the cleanest of the multi-tier arc — sequential (not overlapping) phases, matching physical-test/retest source_refs, honest not-medical-advice framing, and the Push tier condition fix (`shoulder_flexion_supine_deg >= 180 && tgu_hold_max_seconds >= 30`) is landed and reachable. The intake wizard is thoughtful, with radios-not-goniometer ranges and humane safety gates. But the shipped experience is undermined by (a) `Week NaN` on Today for any multi-dim program whose `active_program_started_at` is an ISO datetime string with `Z`, (b) the mobility program sitting under "Gymnastics & skill" instead of the manifest's own `asymmetry` / "Left/right & mobility" category, and (c) a Today reveal card that opens with the jargon-heavy phrase "Your Loaded overhead shoulder flexion plan is built" instead of the plain manifest name.

## 2. P0 findings

### P0-1 · Week NaN on Today for every multi_dim program

`next-app/src/app/page.tsx:305-309` reads `userProfile.active_program_started_at`, appends `"T00:00:00"`, and passes to `new Date()`. In the persona store the field is `"2026-07-01T08:00:01.267Z"` (`final-store.json:433`). Appending `T00:00:00` produces `"2026-07-01T08:00:01.267ZT00:00:00"` → `Invalid Date` → `daysIn = NaN` → `Math.floor(NaN / 7) + 1 = NaN` → rendered literally: `text/01-today.txt:32` shows

> Week NaN · random practice — order shuffled by the seed. Shea & Morgan 1979.

Node-verified. Also breaks the `week <= 2` blocked-vs-random branch. Applies to every multi-dim program (handstand-walk, first-strict-pullup, muscle-up, overhead-mobility). Fix: `.slice(0,10)` the value before concatenating, or new `Date(started)` directly.

### P0-2 · Multi-dim programs render Today's phase without honouring the phase-shift the intake would have set

Persona has `active_program_id: "overhead-mobility"` and `active_program_started_at: 2026-07-01` (`final-store.json:429-433`) but no `program_states.overhead-mobility` entry — no `tier`, no `phase_shift_days`, no `intake_answers`, no `capability_profile`. The only surface that adds those is `IntakeClient.commit()` at `IntakeClient.tsx:278-345`. `activePhaseFor()` at `next-app/src/lib/engine/schedule.ts:82-84` reads phases with `shiftedPhases(program, profile)`, and with no shift the phases fall back to the JSON-authored dates (2026-08-13 → 2026-10-21). Result: a user 48 days into the program is shown "Kinematic base · week 1 of 3 · ends 2 Sept" (`text/01-today.txt:22`). Either (a) the app has code paths that set `active_program_id` without running intake and need to be closed, or (b) `activePhaseFor()` needs to fall back to `active_program_started_at` when no shift is stored. The persona simulation exposes this as a realistic support case for users who "already had" a program before intake shipped, and for users bounced back after sign-out/re-hydrate.

## 3. P1 findings

### P1-1 · Overhead Mobility lives under "Gymnastics & skill", not the mobility category the manifest already ships

`manifest.json:146` marks `overhead-mobility.category = "skill"`; the same file at `:301-305` declares a category `asymmetry` labelled "Left/right & mobility". Result: on `/programs` the program is listed alongside handstand-walk, muscle-up, and pull-up under a gymnastics chip (`text/06-programs.txt:28-64`, `mobile/06-programs.png`). A user typing "mobility" or looking for shoulder work sees a gymnastics section, not the mobility section that literally has "mobility" in its label. Assign `category: "asymmetry"` — it is the only shipped `overhead-mobility`-shaped category — or rename `asymmetry` → `mobility` and move this program in.

### P1-2 · "Your Loaded overhead shoulder flexion plan is built"

The plan reveal card at `text/01-today.txt:6` reads

> Your Loaded overhead shoulder flexion plan is built.

`reveal-copy.ts:116-122` derives the name from `program.program_goal.display_name` — set to "Loaded overhead shoulder flexion" (`overhead-mobility.json:77`). That's the *metric* name, not the *program* name. The manifest name is "Overhead Mobility" (`manifest.json:145`). Fix either (a) `reveal-copy.ts:116` to prefer manifest name (already reachable via `deriveProgramName`'s slug fallback, but slug reads "overhead mobility" which is acceptable) or (b) rename `program_goal.display_name` to something that reads as a plan name.

### P1-3 · Retest cards show no baseline, no current, and never any prompt for physical tests

`text/05-progress.txt:32-84` shows all three retest cards with `BASELINE — · CURRENT — · Δ —`. Two reasons compound:

1. The persona never ran intake, so `capability_profile` / `baseline_capabilities` are empty. `retest-evaluator.ts:130-149` correctly returns `null`.
2. `dueRetestMetrics()` gates the "retest due" badge on tier + cadence; without a tier stored, the `RetestMetricsPanel.tsx:38` result is empty. The "LOG A NEW READING" button still appears (`RetestMetricsPanel.tsx:171-221`) but *only* because `canRetest` (physical_test source) is true. Nothing on the page tells the user "this is a self-measurement — go grab a broomstick, lie down, and log a number", nor when in the 10-week arc they should retest. The `at_week 10` chip renders as "check at week 10" but with no anchoring the phrase reads like a distant target, not "today's action".

Add a one-liner under the metric title when `baseline == null`: `"No baseline yet — log a starting reading."` and, for physical_test metrics that are due at phase end (weeks 3, 7, 10 per program), show a phase-relative countdown.

### P1-4 · Progress "Per-track adherence" reads 0/53 done · 0% because the simulator did not log any prescribed session

`text/05-progress.txt:16-22` shows `overhead mobility · 0/53 done · 0% · 42 UPCOMING · 11 SKIPPED`. Persona archetype `consistent-average` was designed to log symptoms daily (which it did — see `final-store.json:2-408`) but not prescribed exercises. That's a persona-harness gap, not a program bug — but it means the 45-day audit cannot verify that logging a mobility block updates adherence, streaks, or history rows. The bar visual (mobile/05) correctly renders a partial bronze bar. Fix persona: seed a couple of `Move` completions and a re-test reading so adherence + retest cards demonstrate real progress.

### P1-5 · TGU display "Target 0:15 · stretch 0:30" is misread as a race split

`text/05-progress.txt:84`: `Target 0:15 · stretch 0:30`. `formatMetric` in `retest-evaluator.ts:242-253` unit-switches on `"seconds"` and always produces `mm:ss` — 15s becomes `"0:15"` and 30s becomes `"0:30"`. For a TGU hold that's on the order of tens of seconds this reads like a 15-second lap in a race, not "15 seconds of overhead hold". Special-case seconds < 90 to render `15s` / `30s`, or extend `formatMetric` to accept a `format_hint` per metric.

### P1-6 · Coach tab surfaces a phase-aware question the user can't yet ask

`text/03-coach.txt:9`:

> Plain-English questions like "did I hit the phase-2 ROM gate?"

At Aug 18 the persona is in phase 1 with no ROM logged; the phase-2 gate reference reads as an app-generated goal the user has to remember. Coach is coming-soon anyway — but rotate the example question by active phase so it reads as guidance for now, not for a future they may not reach.

### P1-7 · History heatmap shows 45 days of green with 0 strength / 45 active — but nothing distinguishes "mobility drill done" from "symptom check saved"

`text/04-history.txt:8-24`: heatmap legend has `green / amber / red / accessory / skipped / nothing`; the entire 8-week window renders as green (mobile/04 confirms). The persona logged only symptoms — no drills — so the green means "morning check saved", not "session completed". A mobility user, whose daily reset is 5 min and whose training is entirely accessory, needs a distinct visual for "did the mobility drill" vs "logged a check". Add a mobility/skill icon or a second color-slot.

### P1-8 · No morning-check acknowledgement that this program has no daily symptom logging

`text/13-check.txt:1-22` is the generic morning check with Shoulder / Wrist / Muscle soreness / Low back sliders. Overhead-mobility's declared `daily_log_schema.symptoms` (`overhead-mobility.json:743-745`) is `["shoulder_pain_flexion_end_range", "shoulder_pain_load"]` — end-range pain and pain-under-load, not "shoulder soreness 0-10". The check page doesn't know that: a user coming from the Today "Morning check overdue (3d)" banner (`text/01-today.txt:31`) lands on a generic 0-10 shoulder slider with no context about *what* to score. The program's Symptom card design implicitly assumes program-tailored inputs — either surface the program's `symptoms[]` on the check page, or explicitly explain that shoulder = end-range pain / soreness combined.

## 4. P2 findings

### P2-1 · Push tier reachability verified — but no persona hits Push, so this is unverified in the artifact

The condition fix (`shoulder_flexion_supine_deg >= 180 && tgu_hold_max_seconds >= 30`, `overhead-mobility.json:66`) references two declared physical_tests (`:280`, `:296`), and `intake-tier.ts:355-419` binds physical_test results into `vars` before the enum-and-boolean fallback path — so a user entering 180+ for supine flexion and 30+ for TGU will land on Push. The persona is `consistent-average` and never ran intake, so this can only be asserted via code inspection. Suggest adding a `persona-mobility-push` variant that submits `shoulder_flexion_supine_deg = 185` + `tgu_hold_max_seconds = 45` to actually flow through and screenshot the Push landing.

### P2-2 · Safety gates verified

`overhead-mobility.json:307-328` uses `unsafe_values: ["yes"]` (select) and `["true"]` (boolean). The IntakeClient at `IntakeClient.tsx:200-224` and `:1500-1504` uses `Array.includes` on the raw answer string. Boolean answers serialise as strings `"true"` / `"false"` (`IntakeClient.tsx:1040` per Vector A audit); both gate patterns work. Verified.

### P2-3 · `program_goal.metric = shoulder_flexion_loaded_deg` has no logging path

The metric declared as the top-line goal (`overhead-mobility.json:74`) is `shoulder_flexion_loaded_deg`, but no intake question, physical_test, or retest_metrics entry provides a way to log it. The three retest metrics measure supine flexion + OHS depth + TGU hold. Loaded-flexion is only measurable indirectly. If the top-line metric is aspirational, that's fine, but a user reading "Your Loaded overhead shoulder flexion plan is built" (P1-2) can't ever see that number move. Consider either removing `program_goal` or renaming to `shoulder_flexion_supine_deg`.

### P2-4 · Report page renders "MORNING CHECK · 45g · 1050?"

`text/10-report.txt:40-41` shows `45g · 1050?`. That's not something a specialist would parse. This is a shared report-render bug, not overhead-specific — but it surfaces on this program because the persona only logged morning checks. Investigate on the report renderer.

### P2-5 · Extras page copy is honest but bare

`text/12-extras.txt:10` reads "This program has no extras — every prescribed session lives on Today." Good. This is a fine no-op page.

### P2-6 · `/check/hip` remains globally navigable and shows "Hip flexor + balance check"

Reached via the persona's tour (`mobile/14-check-hip.png`, `text/14-check-hip.txt`). Not a program-context leak per se — `/check/hip` is a global route — but a user with only overhead-mobility active has no reason to land there. Consider gating the route on hip program state or renaming as a general hip self-check that reads useful to a non-hip user.

### P2-7 · Foundation reference-week has 3 real sessions and 4 daily-reset stubs — is this the "3 sessions/wk" the reveal card promises?

Reveal card: "3 sessions/wk" (`text/01-today.txt:8`). Program's `reference_week_foundation` at `overhead-mobility.json:456-511` declares `sessions: 3` in the header but 7 entries in the layout — 3 "real" sessions (Mon/Wed/Fri, thoracic prep / scap / thoracic+scap) plus 4 daily-reset-only days. That reads as a light week for a beginner (3 real + 4 reset = 7 touchpoints) but the "3 sessions/wk" surfaces the compressed count. Verify with the tester whether users read "sessions/wk" as "training days" or "touchpoints". If the latter, use `~5-10 min daily reset · 3 focused sessions/wk`.

## 5. Adaptation verification (cite `final-store.json`)

**Store shape:**
- `active_program_id: "overhead-mobility"` (`final-store.json:429`).
- `active_program_started_at: "2026-07-01T08:00:01.267Z"` (`:433`) — 48 days before Aug 18.
- No `program_states.overhead-mobility` entry → no tier, no `baseline_capabilities`, no `intake_answers`, no `phase_shift_days`.
- No `capability_profile` on `user_profile`.
- 45 daily log entries `2026-07-02` → `2026-08-15` (`:4-408`); each has `exercises: {}` and only `low_back` + `life_load` symptoms. No `shoulder_pain_*` entries — the persona never used the program's declared symptoms.
- `skipped` map has 5 entries between 2026-07-23 and 2026-08-13 with reason `"sim: archetype skipped"` (`:437-457`) — matches the 11 SKIPPED count in the Progress adherence card (`text/05-progress.txt:21`) once un-simulated skips are included.
- `training_maxes` populated with strength lifts (`:410-416`) despite this being a mobility program. The consistent-average archetype ships those defaults; they're stored but unused. Not a bug, but a signal the persona harness doesn't wipe strength defaults when the active program is non-strength.

**Phase advancement:** did not fire. Today's phase readout is phase 1 week 1 (per P0-2). No retest_evaluator trigger fired because no phase actually advanced against the store state (`multiDimAdapter.shouldEvaluate` returns false — `multi-dim.ts:25-28`, Phase B stub). Consistent with the audit prompt's expectation that "This program has no TMs so overperformer path doesn't fire". Verified.

**Non-strength adaptation:** none fires. Adaptation on mobility relies on retest metrics (all `source: physical_test`), which need user-entered readings; the persona did not log any. The engine is not silently mutating — good — but a real user needs a nudge, hence P1-3.

## 6. Landing → app gap

`landing/src/i18n/dictionaries/en.ts:59` promises: `"Stronger snatch, OHS, and press."` and `:63` "Skill" domain chip. That aligns with the manifest's `category: "skill"` — but with the P1-1 observation, this is a self-consistent misplacement. Users looking for "shoulder mobility" through the landing → app conversion arrive at "Gymnastics & skill", not mobility. The landing overhead pitch is honest about outcome (snatch/OHS/press) but doesn't mention "mobility" or "shoulder ROM" — a user actively looking for mobility work may skip past it.

Landing does NOT overpromise. The pitch does not claim to fix impingement or rehab a rotator cuff. The `wontdo.not_a_clinician_title` (`en.ts:73`) generally covers the "physio first" hedge that `onboarding_steps[1].body_md` also raises (`overhead-mobility.json:1027`). Good alignment on the honesty axis.

## 7. What worked

- **Program authoring is the cleanest of the multi-tier programs.** Sequential phases (no overlap), matching physical_test / retest source_refs (all three resolve, per Vector A `:59-62`), Push condition now reachable.
- **Intake safety gates are humane and specific.** `overhead-mobility.json:307-328` bounces rotator-cuff dx, recent dislocation, and cervical flare with distinct block titles ("See your physio first", "Get clinician clearance first", "Settle the neck first"). Not one blanket "you're too broken" wall.
- **Instructions are ballpark-friendly.** `physical_tests[].instructions` explicitly say "Ballpark is fine" for supine flexion (`:283`). Meets the Terav "quantify without terrorising" bar.
- **Preview page is honest about who this is for and what week-10 looks like.** `text/07-programs-active.txt:26-31`: "loaded shoulder flexion at 180°, empty-bar OHS to parallel or better, first snatch-grip Sotts press."
- **Not-medical-advice framing is explicit.** `onboarding_steps[1]` at `:1024-1028`: "Overhead Mobility is a supplement, not a shoulder rehab. If you have a diagnosed labrum, cuff, or biceps injury, work with a physio first." Consistent with `consent.not_medical_advice` (`:268-270`).
- **`engineering_choices_flagged` transparency.** `overhead-mobility.json:784-814` names Sotts press, TGU hold as endurance metric, and 10-week duration as engineering-not-RCT choices. Rare and worth preserving.
- **Foundation and Progression outcome_confidence are `realistic`; Push is `fair` with an explicit "structural ROM begins to dominate near 190°" caveat** (`:773-775`). Push-tier users get warned upfront.

## 8. Recommended fix order

1. **P0-1 — Week NaN.** One-line fix at `next-app/src/app/page.tsx:305`. Impacts every multi_dim program persona, not just overhead. Regenerate persona artifacts after.
2. **P0-2 — Multi-dim programs render authored phase dates when intake wasn't run.** Either close the code paths that set `active_program_id` without commit-through-intake, or fall back to `active_program_started_at` in `activePhaseFor()`. Ship both to make it robust.
3. **P1-1 — Move overhead-mobility to `category: "asymmetry"` (rename to "mobility" if the term still fits).** Single-line manifest change (`manifest.json:146`). High discoverability payoff for the users who need this program most.
4. **P1-2 — Fix the "Loaded overhead shoulder flexion plan is built" reveal-card copy.** Either change `reveal-copy.ts:116-122` to prefer manifest name, or update `overhead-mobility.json:77` `display_name` to something plan-shaped.
5. **P1-3 — Retest cards need a "log your starting reading" hint and a phase-relative retest countdown.** Highest-impact fix for the adaptation loop: without baseline readings, nothing else in the arc animates.
6. **P1-5 — TGU/`0:15` seconds format.** One case in `retest-evaluator.ts:242-253`.
7. **P1-8 — Morning check needs program-tailored shoulder symptom names.** Extend the check page to consume `program.daily_log_schema.symptoms[]`.
8. **P1-6, P1-7, P2-4, P2-6 — Copy + component polish.** Coach example rotation, history legend, report shorthand fix, `/check/hip` global gating.
9. **P2-3 — Retire or reroute `program_goal.metric = shoulder_flexion_loaded_deg`.** If not loggable, it should not be the top-line surfaced metric.
10. **Persona harness — add `persona-mobility-push` variant that runs intake with Push-qualifying test results** so P2-1 is testable in artifacts, and a `persona-mobility-adherent` variant that logs real Move + retest to verify adherence math.
