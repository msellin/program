# Comprehensive audit reconcile — 5 shipped catalog programs (2026-08-18)

Reconciled from five parallel program-comprehensive audits + Vector A setup audit.
Each program had a dedicated persona (60d engine, 30d CSM, 45d handstand/mobility/rowing)
that walked catalog → preview → intake → 8-week arc of logs → tour of every route
in mobile + desktop viewports. Raw reports at
`dev/audits/programs/2026-08-18-{slug}-comprehensive.md`.

## Executive summary

Five audits surfaced **seven engine-level P0s** and **one persona-harness P0**. Almost
every P0 hits multiple programs — the bugs are architectural, not per-program authoring
issues. The JSON authoring is generally solid (overhead-mobility is best-in-class,
engine-builder is the strongest evidence base, CSM has honest engineering-choice flags).
The gap between authored intent and shipped experience is in the engine + rendering
layer.

**Landing-page copy is honest across all five programs.** No hallucinated citations,
no promise inflation. When the app underdelivers, it's implementation, not marketing.

## P0 — engine + rendering (ship-blockers for beta)

### P0-1 · Multi-dim phase-remap on activation is a documented feature that doesn't exist
**Source:** handstand-walk audit.
**Where:** `next-app/public/data/programs/handstand-walk.json:5` claims "the generator
remaps to the user's real start date on activation." No such code exists. `phase_shift_days`
is only set for target-test-date programs (rowing) or manual `advancePhase()`.
**Impact:** Every multi-dim user who starts a program after the JSON's last phase-end
date (2026-03-08 for handstand-walk) lands on "YOU FINISHED" on day 1. Affects
handstand-walk, muscle-up, first-strict-pullup, and every future multi-dim skill
program.

### P0-2 · Today renders 2-5 contradictory state summaries simultaneously
**Source:** engine-builder, CSM, rowing, handstand audits — **same bug on 4 of 5**.
**Where:** `next-app/src/app/page.tsx` composes multiple state cards from different
clocks (elapsed days vs. JSON-authored phase dates). When `program_states[slug]` is
missing, both fire. Handstand-walk shows: "plan is built" + "Week 1 opens with…" +
phase name + "Week NaN" + "YOU FINISHED · 6 weeks logged" all at once.
**Fix candidate:** gate the retest-window banner on `program_states[slug].tier != null`;
gate "YOU FINISHED" on the same. Root fix is the missing `program_states` entry (see P0-3).

### P0-3 · `active_program_id` can be set without a `program_states[slug]` entry
**Source:** overhead-mobility audit, plus indirect on all 4 non-hip programs.
**Where:** Only `IntakeClient.commit()` writes `program_states[slug]`. Every other
code path that sets `active_program_id` skips the state row entirely → downstream
readers see the ID but nothing else, and fall back to JSON phase dates or defaults.
Persona harness is one such path; there may be app-side paths too.
**Impact:** Every downstream feature that reads `program_states` (retest firing,
`phase_shift_days`, tier persistence, baselines) silently degrades to "as if intake
never happened."

### P0-4 · `Week NaN` on every multi_dim program's Today
**Source:** handstand + overhead audits.
**Where:** `next-app/src/app/page.tsx:305` appends `"T00:00:00"` to
`active_program_started_at` which already ends in `Z` (full ISO). Produces
`Invalid Date`. Other files (`schedule.ts:251`, `plan-generator.ts:228`) correctly
call `.slice(0, 10)` first.
**Fix:** add `.slice(0, 10)` at `page.tsx:305`.

### P0-5 · CSM's 5/3/1 percentages never render — falls through to 55% cold-start autoreg
**Source:** CSM audit.
**Where:** `next-app/src/lib/engine/suggest.ts:4-8` gates `CYCLE_PERCENTS` on
`MAIN_PHASE_IDS = {phase_2_cycle_1, phase_3_cycle_2, phase_4_cycles_3_4_test}`
— those are **anterior-hip-rebuild** phase IDs. CSM's phases are
`phase_1_intro / phase_2_intervals / phase_3_test`. None match → every CSM strength
day falls through to autoreg-from-last-set at 55% TM.
**Impact:** CSM's core "keep the squat" promise is silently broken — JSON prescribes
"5×5 @ 75% TM", app renders 55% ramp.
**Fix candidate:** either add CSM's phase IDs to `MAIN_PHASE_IDS`, or better —
make the phase→cycle mapping a JSON field on the program instead of a code-side
hardcode.

### P0-6 · Multi-tier phase overlap wins Tier A's drills for Tier B/C/D users
**Source:** Vector A setup audit, confirmed in handstand-walk audit.
**Where:** `next-app/src/lib/engine/schedule.ts:83` uses `.find()`. handstand-walk,
first-strict-pullup, muscle-up all author multiple phases with identical `starts`
dates (one per tier). First match wins → higher-tier users get Tier A's phase.blocks
filter → wrong drills programmed.
**Fix candidate:** tier-aware phase selection in `activePhaseFor()`, or JSON
restructure to one phase per calendar window with all tiers' blocks.

### P0-7 · `detectPauseResume` false-fires on morning-check-only history
**Source:** CSM audit.
**Where:** `next-app/src/lib/engine/adapt.ts:245-247` counts a day as active if
`symptoms != null OR any exercise.done`. Persona-strength has 30 mornings + 0 lifts
→ Progress shows "Welcome back — 18 days away", prescribes "60-70% previous TM".
Sister banner "Back after 18 days — soften plan?" also fires on Today.
**Impact:** Any user who logs the morning check religiously but skips a week of
lifts will get softened on return — the opposite of what they want.
**Fix:** count lift-set presence, not `symptoms != null`, when detecting a lift lay-off.

## P0 — audit methodology (blocks future re-runs from being trustworthy)

### P0-M · Persona simulator only writes strength lifts to `exercises`; no `runs[]`, no baselines, no intake commit
**Source:** every audit flagged this in the "adaptation verification" section.
**Where:** `next-app/tests/e2e/harness/simulator-v2.ts:20` whitelists three strength
lifts and only writes to `store.logs[date].exercises`. Persona bundles for aerobic
(engine-builder, rowing) show `exercises: {}` for 60 days. Persona bundles for skill
(handstand, overhead-mobility) show only symptoms. None have `intake_answers`,
`capability_profile`, `program_states[slug]`, or `runs[]`.
**Impact:** Adaptation verification is impossible from the current artifact set for
4 of 5 programs. persona-erratic (skips + day_adjustments) is the only case where
the harness produced usable engine-state.
**Fix:** simulator needs (a) a program-scheme-aware exercise writer, (b) `runs[]`
writer for aerobic sessions, (c) intake commit path so `program_states[slug]` +
`capability_profile` + tier populate.

## P1 — real friction

### P1-1 · rowing `threshold_pace_500m` name mismatch in TWO places
Vector A rated this P2; now upgraded to P1.
**Where:** `retest_metrics_mid_block[0].metric_id:1001` + `non_responder_classifier
.primary_signal_metric_id:979` both use `threshold_pace_500m` but the actual metric
id is `threshold_pace_500m_seconds:501`.
**Impact:** Non-responder classifier can't fire on rowing; mid-block retest doesn't
resolve.

### P1-2 · rowing `current_2k_time` intake tier misassignment
**Where:** `intake.questions` declares `type: "text"` (free-text mm:ss). `intake-tier
.ts:299-305` maps an unused enum (`sub_7`, `7_8`, `over_10`, …). mm:ss parser catches
"7:52" fine. Anything unparseable defaults all vars to 0 → user lands on Push tier
(which assumes sub-8:00 rowing).
**Impact:** Someone who types "N/A" or "haven't tested" gets programmed as an elite
rower.

### P1-3 · overhead-mobility category mismatch mis-funnels the landing
**Where:** `overhead-mobility.json` declares `category: "skill"` (Gymnastics section)
but manifest declares an `asymmetry` category labelled "Left/right & mobility"
(`manifest.json:301-305`).
**Impact:** Landing's "Skill" chip lists overhead-mobility alongside handstand-walk.
Users looking for mobility work never find it.

### P1-4 · overhead-mobility "plan is built" name is the metric, not the program
**Where:** `reveal-copy.ts:116-122` derives program name from `program_goal.display_name`
= "Loaded overhead shoulder flexion". Today reads "Your Loaded overhead shoulder
flexion plan is built" instead of "Your Overhead Mobility plan is built."

### P1-5 · Retest cards render `— · — · —` with no baseline-log prompt
**Source:** overhead-mobility audit (all three cards affected). Same class as
rowing hiding the Week-3 mid-block retest that IS authored.
**Impact:** Users don't know that retest metrics require them to log physical-test
readings; the cards look permanently empty.

### P1-6 · `formatMetric` mm:ss's every seconds unit
**Source:** overhead-mobility audit.
**Where:** TGU target rendered `"0:15"` instead of `"15s"`. `formatMetric` treats
"seconds" as pace/time-of-day rather than duration.

### P1-7 · CSM manifest ↔ JSON retest-cadence contradiction
Manifest copy "every 4 weeks" vs JSON `cadence_weeks: 8`. Retest actually opens at
Week 8; users expect Week 4.

### P1-8 · Report page defaults to 3Y range on a 6-week program
Rowing + engine-builder audits both flag. Users see mostly empty axes.

### P1-9 · Garbled morning-check glyph on Report page
All three audits that reached Report (engine-builder, CSM, rowing) flag some variant
of `MORNING CHECK 48g · 1047?` or `MORNING CHECK · 45g · 1050?`. Likely a printf/glyph
fallback bug on a shareable/print surface.

### P1-10 · CSM `store.cycle.phase_id` never populates
Stays null despite 30-45 days elapsed on both CSM personas. Feeds P0-2 (state
contradictions on Today).

### P1-11 · CSM amber-week drop-4×4 hook is authored but not implemented
`concurrent-strength-maintenance.json:541` promises a specific hook; no code path
consumes it.

## P2 — polish (defer)

- History treats morning-check-only days as "active" (probably same root as P0-7).
- Progress doesn't surface program-specific `signal_completeness` (log HR + stroke rate).
- Catalog doesn't facet by tag (race_prep, hyrox, etc.).
- Coach still "coming soon" (correct call per copy audit; keep hidden until wired).
- Vector A structural passes hold (JSON syntax, block-ID resolution, safety-gate
  serialization, manifest sync).

## What worked (a full column, not a sentence)

- **JSON authoring is generally strong.** overhead-mobility's phase authoring is
  best-in-class. engine-builder's evidence base is the strongest (30+ refs with
  URLs). CSM has honest `engineering_choices_flagged` blocks. rowing's evidence
  base is candid.
- **Landing → app promise alignment is honest across all five programs.** No
  hallucinated citations, no marketing inflation. Where the app underdelivers,
  it's implementation, not copy.
- **Refactoring UI accent economy holds** — Today's palette discipline reads clean
  (per Profile-adjacent visual-craft audit).
- **Confirm-first is genuinely enforced** — every proposal renders Accept/Ignore;
  no silent engine mutations found.
- **Safety-gate copy is humane per program** — overhead-mobility's "See your physio
  first" / "Get clinician clearance first" / "Settle the neck first" are best-in-
  class.
- **Ballpark-friendly physical-test instructions** across mobility + skill programs.
- **2026-08-18 shipped fixes verified present in production:**
  - engine-builder `pace_500m` drop + `resting_hr_morning` typo fix
  - rowing source_ref repairs + `activity_type` alias
  - overhead-mobility Push tier reachability fix
  - intake-tier.ts string-literal support
  - ExerciseCard 5/3/1 row count + top-set-first order
- **Multi-dim generator's phase-aware substitution is correct** — once P0-1/P0-6
  ship, it will do the right thing.

## Recommended fix order

Beta-launch blockers (must ship before real users):
1. **P0-4** Week NaN — trivial `.slice(0, 10)` fix on `page.tsx:305`. Ship today.
2. **P0-5** CSM 5/3/1 phase-ID mapping — move to JSON field or add CSM's phase IDs
   to the `MAIN_PHASE_IDS` set. Ship today.
3. **P0-7** `detectPauseResume` counting morning-checks as active — one-line fix in
   `adapt.ts:245-247`. Ship today.
4. **P0-2** Today's contradictory state — gate the retest-window banner and
   "YOU FINISHED" card on `program_states[slug].tier != null`.
5. **P0-3** `active_program_id` set without `program_states[slug]` — audit every
   code path that sets `active_program_id`, ensure it either (a) triggers intake
   flow or (b) writes a minimal `program_states` entry.
6. **P0-1** Phase remap on activation — implement `phase_shift_days` computation
   for multi-dim programs on `IntakeClient.commit()`. Highest scope of the P0s;
   blocks handstand/mobility/pullup/muscle-up going live for real users.
7. **P0-6** Multi-tier phase overlap — tier-aware `activePhaseFor()` is cleanest;
   JSON restructure is possible but affects three programs.

Then P1 batch:
8. P1-1 rowing name typos (JSON-only, trivial).
9. P1-3 overhead-mobility category (JSON + manifest, trivial).
10. P1-4 program name derivation (`reveal-copy.ts`).
11. P1-6 `formatMetric` seconds handling.
12. P1-2 rowing tier fallback safety.
13. P1-5 retest-card empty-state UX + baseline-log prompt.
14. P1-9 Report page garbled glyph.
15. P1-7 CSM manifest ↔ JSON cadence contradiction.
16. P1-8 Report default range.
17. P1-10 CSM `phase_id` never populates (probably falls out of P0-3 fix).
18. P1-11 CSM amber-week hook implementation.

Then P0-M (harness):
19. Add `runs[]`, `capability_profile`, `intake_answers`, program-scheme-aware
    exercise writer, and intake commit path to `simulator-v2.ts`. Rerun personas.
    Only then can adaptation for aerobic/skill programs be re-audited.

## Persona harness state

All 8 personas passed the rerun (8.2 min serial). State push via Supabase REST is
verified working — real simulated program state renders in tour artifacts. Vector A
JSON P1 fixes shipped and confirmed live. The harness's remaining gap (see P0-M)
prevents strong adaptation evidence for aerobic/skill programs, but the visual +
copy + UX audits ran cleanly against the tour artifacts.
