# CSM comprehensive audit — 2026-08-18

Read-only audit. Two persona bundles (`persona-strength`, 30d overperformer; `persona-erratic`, 45d skipped/dismissed) cross-referenced against `concurrent-strength-maintenance.json`, `manifest.json`, engine (`suggest.ts` / `adapt.ts` / `intake-tier.ts`), preview + intake components, and landing dictionary. All findings distinguish which persona surfaced them.

## 1. Verdict

CSM ships an intellectually strong, well-cited JSON authoring layer and reads honestly at the catalog and preview surfaces, but the engine layer never actually runs a 5/3/1 rendering path for it — CSM's phase IDs are not in `MAIN_PHASE_IDS` at `next-app/src/lib/engine/suggest.ts:4-8`, so the promised `5×5 @ 75% TM` scheme in the JSON falls through to the autoreg-from-last-set cold-start path. The persona harness confirms the overperformer TM-bump proposal cannot fire on this program because no strength exercises are logged in either bundle (empty `exercises: {}` on every day), while `day_adjustments` and skips ARE persisting correctly for persona-erratic. Landing → preview → intake copy is disciplined and matches the JSON's promises; the gap is in what the engine renders once the user is training, not in what the user was promised.

## 2. P0 findings

### P0-1. CSM's 5/3/1 scheme is never rendered by the engine
`next-app/public/data/programs/concurrent-strength-maintenance.json:286-298` prescribes `"5×5 @ 75% TM, RPE ≤ 7"` for `block_strength_heavy` and `"3 warm-ups + top set + FSL 5×5 @ 65%"` in `note`. But `suggestForExercise` at `next-app/src/lib/engine/suggest.ts:165` only enters the CYCLE_PERCENTS table when `phase.id` is in `MAIN_PHASE_IDS = {"phase_2_cycle_1", "phase_3_cycle_2", "phase_4_cycles_3_4_test"}` (`suggest.ts:4-8`). CSM's phases are `phase_1_intro`, `phase_2_intervals`, `phase_3_test` (`concurrent-strength-maintenance.json:232, 247, 264`) — none match. Similarly `VOLUME_BLOCKS`/`VARIANT_BLOCKS` at `suggest.ts:84-86` are hip-specific block IDs, not CSM's `block_strength_heavy` / `block_strength_moderate`. Result: every CSM strength day drops through to `suggest.ts:197-246`, the autoreg-from-last-set path with an 80% TM reintro cap, or cold-start at `~55% TM` if no prior log. The `5×5 @ 75% TM` scheme string in the JSON is documentation only; the app never renders it. This is the biggest single gap between authoring intent and shipped behavior for CSM.

### P0-2. Progress banner "60-70% previous TM" fires on users who have never trained
`persona-strength/text/05-progress.txt:6-8`: "Welcome back — you've been away 18 days. Suggest a 2-week calibration mini-cycle: week 1 reintro at 60-70% previous TM, week 2 5RM test to reset TM." `next-app/src/lib/engine/adapt.ts:245-247` counts a day as "activity" if it has `symptoms != null` OR any `exercise.done`. Persona-strength has `symptoms` on every day but zero `exercises.done` — so the pause detector reads the morning-check-only history as "prior training that lapsed". The recommended action refers to `previous TM`, but `training_maxes.back_squat_highbar: 115` came from intake, never from logging. The banner reads as scolding for a user who technically hasn't started, and prescribes work against a TM they never demonstrated. Same-persona `Today` also shows the sister banner at line 30: `"Back after 18 days — soften plan?"` (`next-app/src/components/workout/SignalsStrip.tsx:93`). Both fire on morning-check-only history.

## 3. P1 findings

### P1-1. Overperformer TM-bump has no path to fire on persona-strength — the "golden dataset" test never actually triggers
`persona-strength/final-store.json:395-407` shows a single `tm_history` entry sourced `sim:cycle_end_accept` on 2026-07-29, but zero logged strength sets (all 30 daily logs have `exercises: {}`). `evaluateOverperformer` at `next-app/src/lib/engine/adapt.ts:432-445` requires a lift to appear in `d.exercises` with `entry.done` and a set carrying `weight_kg && reps` within the last 7 days. Persona has neither. There are no `dismissed_proposals` and no tm_bump events in the store either. The persona was designed to verify A1 fires on this program; the harness produced state that A1 explicitly cannot evaluate. Either the harness needs to write completed strength sessions, or A1 needs a codepath that recognises "green streak + 'felt strong' notes + hydrated TMs" independent of same-week logging. The "felt strong — could have added weight" notes on 2026-07-08, 07-15, 07-22, 07-29 (`persona-strength/final-store.json:86, 171, 258, 342`) are the exact signal daySignals().easy reads at `adapt.ts:428` — the whole rest of the rule is satisfied bar the "one lift trained in last 7d" gate.

### P1-2. Day-adjustment fires on erratic but no aggregated red-week / softening banner surfaces
`persona-erratic/final-store.json:575-696` records 20 accepted `day_adjustments` at load × 0.95 with source `notes` across 45 days, and 15 skips (`skipped`, `:513-573`). The adjustments fire correctly one-shot, but there is no evidence in any of the erratic text artifacts of the aggregated `amber week detection (≥3 amber days) → drop 4×4 next week` hook listed at `concurrent-strength-maintenance.json:541`. The Week view `persona-erratic/text/02-week.txt:37` still shows `Norwegian 4×4 · Row / Ski` planned for Thu 20 Aug even though 3 amber-flagged days occurred in the same week. The rule is described in the JSON as an `adaptive_engine_hook` but I could not find its implementation reading `adapt.ts` or `suggest.ts`. If it exists it isn't visible on Week for a user who has produced the exact input it should fire on.

### P1-3. Phase readout does not advance in the state
Both stores have `cycle: {phase_id: null, cycle_number: 1, week_in_cycle: 1}` (`persona-strength/final-store.json:376-380`, `persona-erratic/final-store.json:494-498`) at simulated t = 2026-08-15+ despite the program starting 2026-07-01. `phase_1_intro` runs `2026-08-12 → 2026-08-25` per `concurrent-strength-maintenance.json:234-236` and the personas started 2026-07-01, so both should be inside phase_1 (or a pre-phase-1 grace band) by the time the artifacts were captured. Today text does show the phase-1 label rendering (`persona-strength/text/01-today.txt:22`: "Intro · Weeks 1–2 · week 1 of 2 · ends 25 Aug"), so the display is computed on the fly from `program.phases[].starts`. But the persistent `store.cycle.phase_id` is stuck at `null`. If any code path reads `store.cycle.phase_id` as source of truth (rather than recomputing) it will report the wrong phase for CSM users. Given `null` is the initial state and there are 30-45 days of activity, this looks like a state-transition bug — nothing is writing `phase_id` on phase change.

### P1-4. Coach and Report both stubbed with useful history unreachable
`persona-strength/text/03-coach.txt:6-8`: "Coming soon. A coach that reads your whole log every time you ask." `persona-erratic/text/03-coach.txt` identical. `persona-strength/text/10-report.txt:26-40` shows "STRENGTH SESSIONS 0 · ENDURANCE SESSIONS 0" and a garbled morning-check line "30g · 1065?" — the report generator is confused when 30 days of morning-check-only data exist and nothing else. Report has "Days in range: 1095" (`text/10-report.txt:20`) — 3 years of range for a program that started 6 weeks ago, driven by a default 3Y filter selection.

### P1-5. Preview page uses "Recommended background" heading but body lists hard prerequisites
`persona-strength/text/07-programs-active.txt:15, 28-31`: "Recommended background" heading is used for two items marketed in the manifest as `prerequisites` (`manifest.json:95-98`). The soft "recommended" framing is fine, but the second item ("At least some prior cardio exposure — you can hold Z1 pace for 15 min without HR runaway") is a self-report the intake never asks about — nothing gates on it, no downstream question captures it. It shows up as advisory text with no follow-through.

### P1-6. "Retest every 4 weeks" claim vs 8-week cadence in JSON
Manifest: `"retest": "Cycle-end 5RM confirm + submax HR at row pace-5. Every 4 weeks."` (`manifest.json:102`). Preview repeats the same at `persona-strength/text/07-programs-active.txt:24-26`. But `retest_metrics[0].cadence_weeks: 8` (`concurrent-strength-maintenance.json:902`) and `[1].cadence_weeks: 4` (`:936`) — the strength side is week-8-only, not every-4. Progress card at `persona-strength/text/05-progress.txt:34, 52` correctly reads "CHECK AT WEEK 8" for both. Copy mismatch between preview/manifest and what the engine actually schedules.

## 4. P2 findings

### P2-1. `retest_metrics[0].targets[*].baseline: 0` is inert
Confirmed still present (`concurrent-strength-maintenance.json:906-925`). Vector A P2 flagged this. `retest-evaluator.ts` reads baseline from `store.user_profile.program_states[slug].baseline_training_maxes`, not the target — so `baseline: 0` in the JSON does nothing. Cargo cult; delete for cleanliness.

### P2-2. `cardio_hours_per_week` string→numeric coupling still requires an engine-side map
`intake-tier.ts:286-293` still has `SELF_REPORT_TO_NUMERIC["concurrent-strength-maintenance"].cardio_hours_per_week: {under_1: 0.5, 1_3: 2, 3_6: 4.5, over_6: 7}`. Works today, but a JSON author adding a new select-encoded numeric would break tier inference silently. Same Vector A P2. No regression.

### P2-3. History for persona-strength shows "0 strength · 30 active total" with all 30 days at "0 done"
`persona-strength/text/04-history.txt:11`. Heatmap displays 30 days of morning-check activity as "active" but no session-level content. For a program whose whole promise is holding strength, a history where no strength sessions register is a UX failure signal — the surface should nudge the user toward logging strength, not celebrate 30 blank days as adherence.

### P2-4. Programs catalog card copy uses `PR-banned` which reads as jargon
`persona-strength/text/06-programs.txt:22` and `text/07-programs-active.txt:6`: "For lifters adding cardio without losing the squat. Explosive-strength cost bounded, cited, PR-banned." Landing at `landing/src/lib/programs-catalog.ts:77`: tagline `"Add cardio. Keep the squat."` is warmer. The card in-app is more jargon-dense than the landing surface.

### P2-5. Retest metric display name misleads
Vector A P2 (JSON:930-935): `display_name: "Submax HR at pace-5"` but `source_ref: "runs[].avg_hr where intensity == 'easy'"` — any easy Z2 pollutes it. Progress card at `persona-strength/text/05-progress.txt:50` shows the label with no clarifier that any easy run will feed it.

### P2-6. Coach tab visible in bottom nav but not implemented
`persona-strength/text/03-coach.txt` — the "Coming soon" placeholder is fine, but on both personas the tab is discoverable via the top-nav dots (`text/11-guide.txt:76`: "Coach. Coming soon."). It's not being surfaced as a nav destination on the mobile screenshot (`mobile/01-today.png` — bottom nav is TODAY/WEEK/PROGRESS/HISTORY/PROFILE), which is fine, but the discoverability path is inconsistent — Guide says it's under `⋮`, users won't find it.

### P2-7. Intake question count in preview
Preview at `persona-strength/text/07-programs-active.txt:38`: "7 short questions to set your baseline." JSON at `concurrent-strength-maintenance.json:92-195` has 7 questions plus 1 consent. Copy accurate.

## 5. Adaptation verification

- **Overperformer TM-bump (persona-strength):** does not fire. `final-store.json:395-407` — one `tm_history` entry, source `sim:cycle_end_accept`, no `dismissed_proposals` structure exists at all, no other tm_bump events. Root cause: `evaluateOverperformer` requires a lift trained (with weight_kg + reps) in last 7 days (`adapt.ts:432-445`); all 30 daily logs have `exercises: {}`. The persona harness produced morning-checks only, so A1 correctly gated itself out. This means the persona bundle does not verify what its name implies. Today's proposal strip (`persona-strength/text/01-today.txt`) does not surface a TM-bump proposal. If A1 were meant to be visible for this persona, either the harness needs to write strength sessions or A1 needs a signal-only branch.
- **Day adjustments (persona-erratic):** fires 20 times, all `load_multiplier: 0.95`, all `source: notes`, all with `accepted_at` timestamps (`final-store.json:575-696`). Skips fire 15 times (`:513-573`). Both the notes-signal `→ load ×0.95 next strength session` hook and the manual skip path are functioning. Progress correctly reports adherence: `text/05-progress.txt:19-22` "0/6 done · 0% · 4 UPCOMING · 2 SKIPPED".
- **Amber-week detection (persona-erratic):** no visible evidence it fired. `adaptive_engine_hooks` at `concurrent-strength-maintenance.json:541` promises "≥3 amber days → drop 4×4 next week". Week view still shows Norwegian 4×4 planned for Thu 20 Aug (`text/02-week.txt:37`) despite recent amber cluster. I could not locate this hook implemented in engine code.
- **Phase advancement:** cycle.phase_id stays `null` in both stores (persona-strength/erratic `final-store.json:377, 495`) despite Today's display correctly labeling `phase_1_intro`. State transition is not persisting. Display comes from live computation, not state; if any consumer reads `store.cycle.phase_id` directly, it will report the wrong phase for CSM.
- **5/3/1 percentages match Wendler canonical:** confirmed at `suggest.ts:16-21` (65/75/85 → 70/80/90 → 75/85/95 → 40/50/60 with correct FSL and rep schemes) — but this table never runs on CSM because CSM's phase IDs aren't in `MAIN_PHASE_IDS` (P0-1).

## 6. Landing → app promise alignment

Landing dict: `landing/src/i18n/dictionaries/en.ts:56` `csm_pitch: "Add cardio without losing the squat."` — the app catalog at `persona-strength/text/06-programs.txt:22` says "For lifters adding cardio without losing the squat. Explosive-strength cost bounded, cited, PR-banned." Landing catalog at `landing/src/lib/programs-catalog.ts:77` `tagline: "Add cardio. Keep the squat."` and `arcSummary` explicitly promises the 6-hour separation, retest at week 8, 5RM held ±2.5 kg, submax HR −5-10 bpm. Preview delivers on the same promises verbatim in `persona-strength/text/07-programs-active.txt:18-26`.

The gap is not in the promise — it is in the engine's ability to render the 5/3/1 mechanics that back the promise. A user starting CSM after reading `landing/src/lib/programs-catalog.ts:88-105` will get Today sessions labelled "Strength · Heavy" but with weight suggestions from the autoreg-from-last-set path (P0-1), not the disciplined 5×5 @ 75% TM scheme the landing (`landing/src/lib/programs-catalog.ts:91`: "Two lift days + three-to-four low-intensity aerobic sessions + one hard interval") implies. First-day cold-start weight will be `55% TM` (`suggest.ts:241`), not `75% TM` as the JSON says.

Landing evidence claims (Schumann 2022, Hickson 1980, Robineau 2016) are all in `concurrent-strength-maintenance.json:evidence_base.references`. No hallucinated references. The rationale text on Today (`persona-strength/text/01-today.txt:35`: "HR at ~70-75% max. Bike preferred over run (Wilson 2012 modality bias).") pulls directly from `blocks[].note` — good citation continuity.

## 7. What worked

- Preview page is honest, disciplined, and clearly differentiates "Recommended background" as non-blocking.
- Phase copy on Today reads well: `persona-strength/text/01-today.txt:12-14` — three phases with rationales, each one sentence.
- `day_adjustments` and `skipped` persist correctly and Progress reports adherence cleanly with "moved doesn't count as missed" clarifier (`persona-erratic/text/05-progress.txt:23`).
- Safety gates are well-authored: 3 hard gates (`hypertension_unmanaged`, `exertional_syncope_history`, `flaring_tendon`) with clinical framing at `concurrent-strength-maintenance.json:203-228`. Not tested via the personas (both cleared) but the code path at `IntakeClient.tsx:197-224` reads gates from the JSON as intended.
- Landing → preview promise mirroring is precise. No promise breaks in copy.
- `signal_completeness` block at `concurrent-strength-maintenance.json:986-1006` is a good discipline — it tells the user what the engine sees and what it can't yet. Not surfaced in the persona bundles' captures, but the discipline is right.
- Guide is comprehensive and well-organised (`text/11-guide.txt`), covers 5/3/1 terminology thoroughly.
- Extras page correctly self-labels as "This program has no extras" (`text/12-extras.txt:10`) rather than showing a broken empty state.
- Overperformer TM-bump code itself (`adapt.ts:395-475`) is well-scoped: reintro/rehab guards, squat-vs-pull bump differentiation, 2-lift-max cap for pushiness — the design is sound, only its firing conditions were unmet in the harness.

## 8. Recommended fix order

1. **P0-1** — Add CSM phase awareness to `suggest.ts`. Either (a) add `phase_1_intro`, `phase_2_intervals`, `phase_3_test` to `MAIN_PHASE_IDS` (wrong — CSM is NOT a 4-week cycle-repeat block) or (b) add a CSM-specific path that respects the JSON's `scheme` string ("5×5 @ 75% TM") and holds it flat with RPE-7 gating for the whole 8-week block. Option (b) is aligned with the JSON's `progression_rules.note` ("Cycle-end evaluation not run") and the maintenance-block intent. Without this, the landing's "Keep the squat" promise is not delivered mechanically.
2. **P0-2** — Gate `detectPauseResume` on training activity, not morning-checks alone. Change `adapt.ts:245` from `Object.values(day.exercises).some((e) => e.done) || day.symptoms != null` to just `Object.values(day.exercises).some((e) => e.done)`. Morning checks are not sessions; they should not trigger a "welcome back" banner. Also update calibration copy to not reference "previous TM" when no strength sessions exist in log history.
3. **P1-3** — Persist `store.cycle.phase_id` on phase transition. Every code path that reads phase should either recompute from `program.phases[].starts/ends` (like Today does correctly) or the persisted state should track the derived value. Pick one; right now both exist and they disagree.
4. **P1-2** — Wire the "≥3 amber days → drop 4×4 next week" hook (`concurrent-strength-maintenance.json:541`) into the schedule/plan-generator, or delete the promise from the JSON. Persona-erratic surfaces the exact input pattern for it.
5. **P1-1** — Update the persona-strength harness to write completed strength sessions (with weight_kg + reps + rpe) on strength days, so A1 has data to evaluate. This unblocks the audit path the persona was designed for.
6. **P1-6** — Reconcile manifest `retest: "Every 4 weeks"` with JSON `cadence_weeks: 8` on the strength metric. If the intent is "check strength at 8, HR at 4", say so in the copy.
7. **P1-4** — Report page: default the range picker to "since program start" for active programs, not 3Y. Fix the `MORNING CHECK 30g · 1065?` glyph.
8. **P2-1**, **P2-2** — Delete inert `baseline: 0` fields; document the SELF_REPORT_TO_NUMERIC coupling as a required author step OR move it into the JSON as a `numeric_map` field per question.
9. **P2-3** — Nudge on History when 5+ consecutive days show morning-check-only for a strength program: "log a lift so we can score you".
10. **P2-4**, **P2-5** — Copy pass on catalog card ("PR-banned" → "no PRs this block") and on submax-HR retest label to clarify it feeds off any easy run.

---
Total: 2 P0, 6 P1, 7 P2. Root cause density is engine-JSON coupling — the JSON reads clean, the copy reads clean, but the engine has grown around hip-rebuild's phase IDs and hasn't been extended to render CSM's mechanics. That's the through-line for both P0s and P1-3.
