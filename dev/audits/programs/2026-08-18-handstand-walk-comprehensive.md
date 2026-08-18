# Handstand Walk — Comprehensive Audit (2026-08-18)

Read-only audit. Persona bundle: `next-app/tests/e2e/artifacts/personas/persona-handstand/`.

## 1. Verdict

Handstand Walk is the most ambitiously-authored program in the catalog — 30+ cited references, four tiers, a phase-0 bail-out prep, a slot-based drill library, and a real self-report → tier inference path. The JSON content is honest and the intake wizard is well-designed. **But almost none of that reaches a persona at Week 7 of a real start**, because two orthogonal scheduling bugs collapse the render: (a) the Vector-A phase-overlap bug fires exactly as described, and (b) the JSON's `status_note` claim that "the generator remaps to the user's real start date on activation" is **false** — no code in the repo shifts `phase.starts`/`phase.ends` when a non-test-prep program is activated, so a user who starts on 2026-07-01 is treated as complete on 2026-03-08. The persona at day 45 sees "YOU FINISHED" simultaneously with "Week 1 opens with bail wall cartwheel exit" and "Week NaN · random practice" on a single Today screen (`text/01-today.txt:5-40`).

## 2. P0 findings

- **P0-1 · Phase dates NEVER remap to the user's actual start.** `next-app/public/data/programs/handstand-walk.json:5` promises "the generator remaps to the user's real start date on activation." No such code exists. `schedule.ts:49-58` (`shiftedPhases`) only applies `phase_shift_days`, which is only set by `advancePhase()` (`useStore.ts:1198-1210`) or by the target-test-date branch in `IntakeClient.tsx:288-305` (rowing-only). Handstand-walk's intake has no `target_test_date` question, so `phase_shift_days` stays undefined. Persona started 2026-07-01, but the last phase `phase_all_weeks_3_8` ends `2026-03-08` in the raw JSON (`handstand-walk.json:712`), so `isPastProgramEnd()` returns true immediately on activation (`schedule.ts:66-75`) and `GraduationCard` fires (`page.tsx:332-333`). **Every handstand-walk user who activates after 2026-03-08 lands on "YOU FINISHED · 6 weeks logged" on day 1.** Same-shape bug will hit muscle-up-first-rep and any other multi-dim program whose phase anchors are hardcoded past.

- **P0-2 · Today screen shows three contradictory "state of the program" summaries at once.** `text/01-today.txt:5-46` and `mobile/01-today.png`:
  - Line 6: "Your Handstand composite (Block 1) plan is built."
  - Line 17: "Week 1 opens with bail wall cartwheel exit."
  - Line 23: phase name "Weeks 3-8 — Interleaved practice for all tiers (post-acquisition)"
  - Line 36: "Week NaN · random practice — order shuffled by the seed. Shea & Morgan 1979."
  - Line 38-42: "YOU FINISHED · Handstand composite (Block 1) · 6 weeks logged. Nice."
  These render simultaneously in one column. Root causes: P0-1 above (drives "YOU FINISHED"), P0-4 below (drives "NaN"), and no yielding logic between YourPlanCard, phase readout, CI legend, and GraduationCard.

- **P0-3 · Vector A P0 phase-overlap (`activePhaseFor` picks Tier A's phase for every tier) — confirmed still shipping.** `schedule.ts:83` uses `.find()`, phases 1-4 all start `2026-01-12` (`handstand-walk.json:636,654,673,692`), so Tier B/C/D users get `phase_1_foundation_prep`'s block filter and their layout's `block_skill_A_wall_hold` / `block_skill_A_freestand_hold` / `block_skill_A_variability` primary block gets substituted (via `plan-generator.ts:131-143`) for whatever Tier A's Kinoshita block appears in `phase_1_foundation_prep.blocks` (`handstand-walk.json:639-643`). A Tier D user thus receives Kinoshita 90° holds instead of variability walks. **Silent programming failure, invisible to the user.** Cite as Vector A P0.

- **P0-4 · `page.tsx:305` builds an invalid Date from the ISO timestamp and prints "Week NaN".** `active_program_started_at` is stored as full ISO with time (`final-store.json:433`: `"2026-07-01T08:00:01.315Z"`, 24 chars). Line 305 does `new Date(userProfile.active_program_started_at + "T00:00:00")` — the concatenation produces `"2026-07-01T08:00:01.315ZT00:00:00"`, an invalid date. `daysIn` becomes NaN, then `Math.max(0, Math.floor(NaN/864e5))` stays NaN, then `Math.floor(NaN/7)+1` is NaN. Text "Week NaN · random practice" (`text/01-today.txt:36`) is user-visible. `schedule.ts:251` and `plan-generator.ts:228` correctly guard on `.length === 10` — page.tsx forgot the same guard. One-line fix: `.slice(0, 10)` before concat.

- **P0-5 · Vector A P0 dead `phase_gates[]` — confirmed still shipping.** `handstand-walk.json:2017-2031` declares a skip rule for `phase_0_bail_out_prep` when `bail_out_readiness == "can_exit_reliably"`. Nothing in `schedule.ts` reads `phase_gates`. A user who can already cartwheel out reliably still gets Phase 0 blocks scheduled. Cite as Vector A P0.

- **P0-6 · Persona harness writes zero handstand-specific signal, so this program's adaptive claims are unverifiable.** `final-store.json` shows all 45 days as `"exercises": {}` (lines 4-408). The only tracked symptoms are `low_back` and `life_load` — neither is a handstand-relevant field. `training_maxes` contains only strength lifts (`back_squat_highbar: 110`, `deadlift_conventional: 150`, etc., lines 410-416). There is no `capability_profile`, no `retest_readings`, no `intake_answers` for `handstand-walk`, no wrist-symptom log, no drill completions. The persona is a **strength persona wearing a handstand costume** — the sim clearly ran the same simulator-v2 write path used for other archetypes. This is a harness bug (belongs in `tests/e2e/harness/simulator-v2.ts`), not the app, but it means every claim below about "engine adaptation" is inferred from code + config, not from artifact evidence.

## 3. P1 findings

- **P1-1 · GraduationCard fires with "No retest metrics recorded" while three retest cards on Progress read "—/—/—".** `text/01-today.txt:38-46` says "6 weeks logged. Nice. · No retest metrics recorded — head to Progress to log your final numbers. · RETEST — LOG YOUR NUMBERS." `text/05-progress.txt:28-86` renders all three retest cards with baseline/current/Δ all "—". This is honest to the empty log, but the celebratory framing ("6 weeks logged. Nice.") is congratulating a user for zero completed sessions. Same tone drift as the Engine Builder audit's P1-7.

- **P1-2 · The "Fear-of-falling gates handstand progress" copy appears on Today for a persona whose `bail_out_readiness` isn't set.** `text/01-today.txt:11-17`. The bail-out rationale is important content, but rendering it unconditionally erodes the confirm-first principle. A user who answered `can_exit_reliably` in intake should still see rationale for why Phase 0 is being SKIPPED — the current text always frames it as "learn to fall on purpose first."

- **P1-3 · Intake tier readout ("Based on: wall hold ≈ 22, freestand ≈ 3, walk distance ≈ 2") is behind a `<details>` element.** `IntakeClient.tsx:539-544`. The "How this was picked" summary is collapsed by default. `plan_tiers[].typical_outcome` renders above it (good), but the load-bearing "here's exactly what the wizard read from your answers" is one tap away. For a program that inferred a tier from 3 self-report questions, the reveal should be inline.

- **P1-4 · The "Don't agree? Pick a different tier" affordance uses text-muted uppercase-mono at 11px.** `IntakeClient.tsx:551-553`. On mobile this reads as legalese, not as an active choice. A user disagreeing with the Tier B inference has to notice a small mono-monogram section below the recommended-tier card. Users who know their capability better than the questions elicit (e.g. "I can hold 45s wall but had one bad kick-up in the test") will not find this.

- **P1-5 · Progress "Per-track adherence" shows "0/48 done · 0% · 39 UPCOMING · 9 SKIPPED".** `text/05-progress.txt:19-24`. Persona `skipped` map has 5 entries (`final-store.json:437-457`), not 9. Either the counter is over-counting skips (possibly rest days getting counted?) or "SKIPPED" includes rest days as intended, but the label doesn't distinguish. For a persona that literally logged 45 morning checks and zero drills, "0/48 done" is faithful; the framing is not.

- **P1-6 · Report "MORNING CHECK 45g · 1050?"** `text/10-report.txt:40`. This is `report.overview.stateDistribution` = 45 green + 1050 unchecked (`app/report/page.tsx:206-224`), because the default range is 3 years (1095 days, `text/10-report.txt:20`). The renderer is correct; the default range is not — a 45-day-old persona showing 1050 unchecked mornings on a 3-year range picker is worse than showing "no data yet."

- **P1-7 · `SELF_REPORT_TO_NUMERIC["handstand-walk"]` numeric proxies are defensible but produce a subtle asymmetry with the physical test.** `intake-tier.ts:262-285`. E.g. `wall_hold_seconds_selfreport.15_30s → 22`, meaning a user who self-reports the 15-30s range and one who did the physical test and got 22.0 evaluate to the same tier. But `over_60s → 90` overshoots a user who actually holds 61s — a physical test at 61 vs the enum midpoint at 90 could push the user into different tiers on borderline conditions like `wall_hold_max_seconds >= 15`. The impact here is small (all four handstand tiers gate on cheap thresholds), but the pattern is worth flagging before more programs adopt it.

- **P1-8 · Retest "CHECK AT WEEK 8" chip on all three metrics with no user hint that these need self-input.** `text/05-progress.txt:30-86`. Because `source: physical_test`, the current value only moves when the user taps "LOG A NEW READING" and enters a number (`RetestMetricsPanel.tsx:102-117`). No card, banner, or Today prompt tells the user "you're due to remeasure wall hold this week." `retest_metrics[0-2]` all declare `trigger: phase_end` (`handstand-walk.json:1879`); combined with P0-1 (phases already "ended" on activation), the retest-due signal never fires — but even in a healthy timeline the app never proactively asks for the reading.

- **P1-9 · Coach tab is "Coming soon".** `text/03-coach.txt:6-11`. Same overpromise pattern as Engine Builder audit's P1-8 — "am I ready to graduate from wall to freestand?" is the exact question this program would need to answer, but the tab is a placeholder.

## 4. P2 findings

- **P2-1 · Bail-out prep blocks (`block_bail_wall_cartwheel_exit`, `block_bail_quarter_pirouette`, `block_bail_tuck_forward_roll`, `block_bail_mat_falls`) are defined (`handstand-walk.json:1119-1180`) and referenced by `phase_0_bail_out_prep.blocks` (`:618-623`).** They are reachable in principle, but no `weekly_template.reference_week_tier_a` layout mentions them (`:1183-1225`). If P0-1 (phase remap) and P0-5 (phase_gate) both fix, a Tier A / Phase 0 user still needs the `multiDimensionalBlocksForDate` phase-substitution path (`plan-generator.ts:121-150`) to produce a bail block. It DOES: `phase_0.blocks` contains only bail blocks, so `phaseBlockSet` on line 122 forces the layout's Kinoshita primary to be substituted via the same-category fallback (`plan-generator.ts:138-140`). Verdict: bail blocks are reachable *once P0-1 and P0-5 are fixed*; today they are dead code because the phase itself is dead code.

- **P2-2 · Week view shows the SAME Tier A layout (Kinoshita + wall hold Mon/Wed/Fri/Sun) for a persona whose tier was never set.** `text/02-week.txt:14-56`. `resolveActiveTier` (`plan-generator.ts:64-72`) falls back to `plan_tiers[0].id` = Tier A when `program_states[slug].tier` is null (which it is in persona — see `final-store.json:429-434`). Silent Tier A default is a UX choice, but with no visible "You are on Tier A" chip anywhere on the Week/Today headers, the user cannot see what tier they're on.

- **P2-3 · No tier chip on the Today/Week/Progress headers.** Task brief specifically asked. The persona sim never picked a tier (P2-2), so this may be moot for this artifact, but a user who completes intake never sees "Tier B — Wall handstand established" on the app-shell header — only inside the intake review screen. Post-intake, tier is invisible unless the user opens Profile → Handstand Walk → preview.

- **P2-4 · "8 weeks · multi-tier" is the entire Profile card description for the active program.** `text/08-profile.txt:8-11`. No phase, no tier, no last-session marker. Compare with the Engine Builder audit's clean single-line Profile card — this one is functional but underinforms.

- **P2-5 · `intake-tier.ts:377` fallback assigns `vars[testVar] = 630` for any `never*` string answer when the self-report proxy doesn't match.** This is the rowing 2K default (10:30 in seconds). For handstand-walk it never triggers because `SELF_REPORT_TO_NUMERIC["handstand-walk"]` maps each `never` value to `0` (`:263, 271, 279`) — but if a new handstand-adjacent question adds a `never` enum without a proxy entry, that answer would silently set the target variable to 630s, wrongly qualifying the user for Tier D on the `walk_distance_max_metres >= 10` condition. Latent footgun.

- **P2-6 · `signal_completeness.would_additionally_use[0].label` is "Per-drill quality tag" (`handstand-walk.json:2005-2008`).** No such UI exists in the app. Similar overpromise to Engine Builder P2-5 (Garmin/Whoop) but smaller.

- **P2-7 · `retest_metrics[2]` (`walk_distance_max_metres`) has no target for Tier A or Tier B** (`handstand-walk.json:1944-1957` — only tier_c and tier_d listed). A Tier A/B user sees "Handstand walk (max continuous) · CHECK AT WEEK 8 · Target — · stretch —" on Progress. `text/05-progress.txt:68-86` matches (all dashes). This is arguably correct — Tier A shouldn't have a walk target — but the card renders anyway, and reads as "we forgot to set the target for you."

- **P2-8 · Landing pitch "Four tiers. Drills picked at your level." (`landing/src/i18n/dictionaries/en.ts:58`) is honest but the app never surfaces which tier drills are picked at.** After intake the tier chip disappears. See P2-3.

- **P2-9 · Preview page copy "Baseline setup — a few minutes on the wizard + a 3-day measurement window" (`text/07-programs-active.txt:35`) does not match the actual intake flow.** No 3-day measurement window is enforced; `intake.duration_days: 3` (`handstand-walk.json:91`) is authored but the wizard commits synchronously and starts the program same-day. Copy overstates the deliberateness.

- **P2-10 · Guide tab covers strength (5/3/1, TM, RPE) and endurance (Z1/Z2, VO2max, 4×4) in depth but does not define any skill terminology.** `text/11-guide.txt:14-83`. A user on Handstand Walk who wants to know what "Kinoshita position 1" or "CoP shift" means finds them in the drill copy, not the Guide. Small gap; the whole "skill programs use tier gates" one-liner (`text/11-guide.txt:8`) is the only pointer.

## 5. Adaptation verification

Verdict: **cannot verify from persona artifacts** because of P0-6.

Concrete gaps from `final-store.json`:

- No `program_states["handstand-walk"]` object exists at all (persona has `user_profile.active_program_id: "handstand-walk"` at `:429` and `active_program_ids: ["handstand-walk"]` at `:430-432`, but no `program_states` map anywhere — grep confirms).
- No `intake_answers`, no `tier` field, no `capability_profile`, no `baseline_capabilities`, no `phase_shift_days`.
- `training_maxes` contains only strength lifts (`:410-416`). No handstand physical-test measured_value entries.
- No `retest_readings[]` array in the store at all.
- No `dismissed_proposals`, no `day_adjustments`, no accepted or rejected engine proposals of any kind.
- 45 days of `symptoms: { low_back, life_load }`. Handstand-relevant morning-check fields (`wrist`, `shoulder`) never touched. `text/13-check.txt:6-12` confirms the check screen DOES surface Wrist and Shoulder inputs — the sim just didn't fill them.
- 5 skips (`:436-457`), all `reason: "sim: archetype skipped"`. Zero adherence signal beyond raw miss count.

Consequences for the audit questions in the brief:

- "Does the phase readout advance?" — Cannot verify. P0-1 makes the phase-readout question moot: the persona is past the last phase on day 1.
- "Do retest windows open?" — Cannot verify from artifact. From code: `dueRetestMetrics` uses `trigger: phase_end`, and phases are already "ended" per P0-1. In a fixed timeline, retest windows would open at week 8; today, never.
- "Any HERITAGE non-responder classification firing?" — Confirmed correct behavior: `evaluateOverperformer` in `adapt.ts` requires `hasStrengthProgression`, which handstand-walk has no path to (no TMs). Guard holds ✓. Same for underperformer — no retest_reading writes means no classifier input.

Recommend: rerun persona with a handstand-specific simulator that writes `program_states["handstand-walk"].intake_answers`, one `capability_profile.wall_hold_max_seconds.measured_value` at week 4 + week 8, one `retest_readings[]` entry per retest cadence, and per-drill completion signal on scheduled skill days. Without those, the persona verifies routing only.

## 6. Landing → app gap

Landing dictionary at `landing/src/i18n/dictionaries/en.ts`:

- ⚠ **"Four tiers. Drills picked at your level."** (`en.ts:58`). Four tiers are authored ✓. "Drills picked at your level" is delivered by `plan-generator.ts:154-173` (composeSlotDrills filters by level from `capability_profile` levels) — but requires the intake to have committed a tier + capability_profile. Persona never got that far. **Confirmable from code, not from artifact.**
- ✗ **"Personalised to your baseline, adaptive to how you respond."** (`en.ts` step 01 body, "Tomorrow's plan, written against your history.") — Blocked by P0-1: the persona has 45 days of history but the plan is "You finished." The response-adaptive claim cannot be tested against a program that thinks it's over.
- ⚠ **"Every proposal cites a study"** (`en.ts:10`). No engine proposal ever fires on this persona (empty exercise log). The Today safety strip about "Shoulder pain stops the session. Sci Reports 2026 pain-associated technique data" (`page.tsx:290-298`) does render on Today (`text/01-today.txt:31-35`) with citation intent, ✓. But the citations are baked into the UI, not into a live proposal.
- ✓ **Confirm-first mechanic** — no proposal fired, but the framework is in place (see PerProgramActions + ProposalStack in `page.tsx`).
- ⚠ **"REFERENCED = every claim cites a paper"** (`text/06-programs.txt:6`). Handstand Walk carries the REFERENCED chip. `evidence_base.references[]` has 33 entries (`handstand-walk.json:1834-1868`), several flagged `unverified` (`sadowski_2021`, `vidal_torija_2025`, `wiesinger_2019`, `sci_reports_2026_handstand_shoulder`, `ferrari_2021`). Landing legend does not surface the per-reference verification status. `ferrari_2021` was replaced by `yiou_2017` in `handstand-walk.json:2033-2043` per founder-approved plan, but the old `used_for` text still references Ferrari elsewhere in the file (`:682` phase_3 goal, `:1726`). Minor internal-consistency drift; landing claim survives.

## 7. What worked

- **Intake wizard structure is excellent**: safety_gates screen the user before content, self-report skill assessment feeds tier inference, optional physical tests are clearly separated, and the review screen shows `typical_outcome` inline (`IntakeClient.tsx:534-538`). The intake-tier fix on 2026-08-18 (string-literal support) is shipped and correct (`intake-tier.ts:181-190`).
- **`plan-generator.ts:121-150` phase-aware substitution** is a thoughtful workaround for the layout-vs-phase-blocks mismatch. Once P0-1 and P0-3 (Vector A) are fixed, it does the right thing: preserves the "Skill A" / "Skill B" alternation while respecting the phase's block list.
- **Extras tab exposes ALL blocks for logging** (`text/12-extras.txt:10-46`), including tier-D blocks a Tier-A user isn't scheduled for. This is the escape hatch a self-directed user needs when a session slot doesn't match how they want to train that day. Consistent with the "focused improvement, not full plan" positioning.
- **Preview page copy is clean and specific** (`text/07-programs-active.txt:5-37`): tiers listed as Foundation → Wall → Freestand → Advanced, weekly retest of freestand hold explicitly named, session dose specified honestly.
- **Non-negotiable "Shoulder pain stops the session" strip on Today** (`page.tsx:290-298`) is exactly the pattern the landing promise implies — safety-first, visible before drills, with a rationale.
- **`retest-evaluator.ts:130-149` correctly reads `capability_profile[testId].measured_value` and falls back to current-as-baseline** when the baseline snapshot is missing — resilient against pre-fix stores.
- **`RetestMetricsPanel.tsx` renders a working retest-log inline form** (`:171-221`) with dual-write to `capability_profile` + `retest_readings` for the classifier. When a user actually taps it, both stores update.

## 8. Recommended fix order

1. **Fix P0-1 (phase remap on activation).** Add a `program_started_at` → phase-anchor shift for every multi-dim program at activation (not just target-test-date programs). Cheapest fix: in `setActiveProgram` / `addSecondaryProgram` in `useStore.ts`, compute `phase_shift_days = daysBetween(program.phases[0].starts, today())` and write it to `program_states[slug].phase_shift_days`. This is a one-place fix that also protects future multi-dim programs from the same trap. Update `handstand-walk.json:5` `status_note` after — "the generator remaps" is currently a lie.
2. **Fix P0-3 (phase overlap) — Vector A P0.** Change `activePhaseFor` to consult `phase_gates[]` before falling into the `.find()`. When a phase is gated by an intake_answer skip rule, filter it out of the phases list first. This also fixes P0-5 (dead `phase_gates`).
3. **Fix P0-4 (Week NaN).** One-line: `active_program_started_at.slice(0, 10)` before concatenating `"T00:00:00"` in `page.tsx:305`.
4. **Fix P0-2 (Today contradiction).** Once P0-1 fires, the "YOU FINISHED" state should only render when phases are genuinely complete relative to the shifted timeline. Also gate the "Your plan is built" card so it hides once GraduationCard is showing (and vice versa).
5. **Fix P0-6 (persona harness).** Add a handstand-branch write path in `tests/e2e/harness/simulator-v2.ts` that: (a) commits `intake_answers` + `tier` at activation, (b) writes at least one `capability_profile.*_max_seconds.measured_value` per week, (c) logs per-drill completions on scheduled days, (d) records at least one `retest_readings` entry per cadence. Without this, no future audit of this program can verify adaptation.
6. **Address P1-1 through P1-9.** Retest-due signal on Today (P1-8), tier chip in header (P2-3, P1-3), inline reveal of tier rationale (P1-3), affordance for tier override (P1-4), copy pass on "Nice." (P1-1), skipped-count semantics (P1-5), report default range (P1-6).
7. **P2 cleanup.** Latent `intake-tier.ts:377` footgun (P2-5), Tier A/B target-less retest card (P2-7), preview copy overstating "3-day measurement window" (P2-9), Guide tab skill glossary (P2-10).
