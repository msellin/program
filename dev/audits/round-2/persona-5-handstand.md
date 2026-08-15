# Persona 5 — Handstand walker (Tier D)

## Persona recap

I'm 34, six years CF, ex-gymnastics kid. I freestand 30s and take 3-5 walking steps —
I'm chasing 20m for RX at our local Open. I care about drill variety, contextual
interference (blocked → random), and prereq gating. Anything that treats me like a hip
patient loses me fast.

## Blockers

- **`/check` cannot log wrist or shoulder symptoms for handstand users.** The program
  authoritatively declares `wrist_symptom_score` and `shoulder_symptom_score` in
  `handstand-walk.json:1276-1277` as the primary daily signals that drive `green|amber|red`
  and gate the next session (`derived_state_rule`, l.1285). But `src/app/check/page.tsx:17-22`
  hardcodes `GENERIC_REGIONS` as `low_back, groin_left, buttock_left, shoulder_right`. The
  labels are relabelled ("Any joint pain", "Muscle soreness"), but the underlying keys are
  still hip fields, and there is **no wrist slider at all**. The `progression_rules.states`
  in the JSON reference values that the app cannot produce. Adaptive engine hooks in
  `evidence_base.adaptive_engine_hooks` (l.1367) all depend on `wrist_symptom_score` — none
  of them can fire. This is the single biggest gap for the multi-dim showcase program.

- **The "shoulder-pain-stops-session" rule — declared non-negotiable in `principles[]` and
  `contraindications[]` — is not surfaced anywhere on Today, in the Coach page, or on
  first-run**. It only appears on the intake consent checkbox and inside the program-preview
  drawer. After Day 1 it's gone from the UX. For a rule the JSON copy-marks as
  "non-negotiable," that's not enough.

## Bugs

- **Load hint is wrong.** `manifest.json:78` says `"~2 hr/week (four 15-30min sessions)"`.
  Tiers B/C/D all run `sessions_per_week: 5`, session_length_min `15-18`. Only Tier A is 4
  sessions. A Tier D user sees "four sessions" on the catalog card and later gets five
  scheduled — a promise gap that eats trust on the exact users the program targets.

- **`YourPlanCard` tier attribution reads "Composed for: adapts as you log every session"
  when the multi-dim path fires** (no `capability_profile` populated, no measured cap,
  no modality answer). `reveal-copy.ts:63-83` walks `capabilityProfile` looking for a
  `confidence === "physical_test"` entry — but the intake wizard writes physical test
  values into `program_states[slug].intake_answers` only, never into
  `user_profile.capability_profile`. So the entire attribution branch is dead code for
  handstand users unless we back-fill capability_profile at intake commit. Cross-checked
  in `IntakeClient.tsx:147-153` — `capability_profile` is never touched. This is the sole
  program that uses that field and it never gets populated.

- **`Progress` has no "Insights" tab content that means anything to a skill user.** The
  Insights tab renders `WeeklyNarrativeTile` + `SymptomLoadChart` (progress/page.tsx:275-297).
  `SymptomLoadChart` plots morning symptom scores against strength top-set kg —
  irrelevant. `WeeklyNarrativeTile` counts strength sessions/PRs/endurance/rehab
  (weekly-narrative.ts, no tier or capability awareness at all — grepped, no `tier`,
  `handstand`, `capability`, `freestand`, `walk_dist` references). No tier-progression
  view, no freestand-hold weekly retest surfaced, no drill volume, no CI-mode indicator.

- **`Progress > Lifts` shows a hardcoded `PRIMARY_LIFTS` list (progress/page.tsx:24-29):
  back squat, front squat, block pull, deadlift.** For a handstand user with no TMs
  and no strength lifts, the entire Lifts tab reads as an empty table of four kg boxes
  with no relevance. The "Milestones" section below is program-driven (fine, will just
  render nothing) — but the empty TM editor still shows. Should be hidden for programs
  without training_maxes.

- **Report page falls to "Aerobic sessions in range" for non-hip programs
  (report/page.tsx:224-276)** — a full section titled "Aerobic sessions" for a handstand
  athlete. Empty state: "Log a session on Today to see it here" — but there's no aerobic
  logging for this program.

- **`shoulder_pain_overhead` intake answer never influences Tier assignment.** The intake
  routes it to the `Screening` group and the safety-gate loop checks `unsafe_values`.
  But this question is `type: "boolean"` and its `unsafe_values` needs to be `"true"` —
  double-check that path: I see the wrist gate uses `"true"` and works; but
  `shoulder_pain_overhead` has NO safety_gate entry at all (l.392-417). Program JSON
  says (l.255) "we defer inversions this block and route the plan to shoulder-safe
  positions first" — that logic exists nowhere in code. Answering "yes" screens fine but
  the plan generator doesn't degrade to Kinoshita-only.

- **Contextual interference works as documented but the effect is invisible to the user**.
  I walked plan-generator.ts:176-209 with weeks 1, 2, 3, 5 as a Tier D user. Weeks 1-2:
  drills stay authored order (blocked practice). Week 3+: deterministic shuffle by
  `hashString(uid:slug:started:version:date:blockId)`. Great engineering. But Today shows
  the drills with no label indicating "week 3 — random practice from here on" or "you're
  still in blocked-acquisition weeks." A user seeing shuffled order without a legend will
  read it as a bug ("why did the drill order change today?"). Especially bad for a
  skill-focused user who knows the CI literature and wants to see it working.

## UX gaps

- **Intake result screen (`Your starting tier`)** shows `formatVars(inferred.vars)` which
  reads e.g. `wall hold max seconds ≈ 22, freestand hold max seconds ≈ 3, walk distance max
  metres ≈ 0` (IntakeClient.tsx:590-596). That's raw variable dump. For a persona 5 user
  who answers Tier D-consistent things, they'll see a snake_case variable name and no
  "so we put you in Tier D — Advanced because you walk 10m+." Missing plain-English
  rationale mapping. `plan_tiers[].condition` is code-string (`walk_distance_max_metres >= 10`);
  no `rationale_copy` field exists to give users an English version.

- **Foundation → Progression tier gate prerequisites are only implicit.** Each tier
  `program_adjustments.starting_capability_levels` seeds a capability level, but there's
  no "here's what you need to hit to graduate from Tier A to Tier B" visible on the intake
  result or on Progress. The JSON has `full_goal_weeks_estimate` per tier — never rendered.

- **YourPlanCard reveal**: for Persona 5 (Tier D), the copy would render as
  `"Your Handstand composite (Block 1) plan is built. · 5 sessions/wk. Starting at Tier D —
  Advanced (walks 10m+, wants turns / obstacles) — your intake put you here. Weeks 1-2 —
  Wrist prep + Kinoshita position ladder — ..."`. Two issues: (1) the `program_goal.display_name`
  is "Handstand composite (Block 1)" which is engineer copy, not user-facing; the reveal
  ends up "Your Handstand composite (Block 1) plan is built." Ugly. (2) The phase list
  iterates all four phases across all tiers because `phase_lines` slices the first four
  — but for a Tier D user, only `phase_4_variability` is relevant. The other three phase
  descriptions confuse ("weeks 1-2 wrist prep and Kinoshita" — Tier D isn't doing
  Kinoshita). No tier-scoped phase filter.

- **Coach page copy is strength-centric** (coach/page.tsx:254-315). "why is the plan
  giving me 92.5 kg?", "TMs", "top set", "symptom triage" — all lift-framed. Persona 5
  would ask "Why is my drill order shuffled this week?" or "Should I keep video-reviewing
  every rep?" — not covered in the coming-soon copy at all. Starter prompts on the empty
  state (l.15-20) are OK but generic. Should include a skill-track prompt.

- **Extras page groups blocks by `category`: `accessory` and `run`** (extras/page.tsx:37-40).
  For handstand, `wrist_prep` and `recovery` are `accessory` — so they show up as
  "Accessories & home rehab" on Extras. Fine. But every skill block A/B is also `accessory`,
  which means the skill blocks show up on Extras too, redundant with Today. Categories on
  handstand-walk.json are undifferentiated.

- **`RunSlotCard` renders on Today** even for handstand users (page.tsx:187, l.211).
  A handstand skill-focused user doesn't want an aerobic slot suggestion cluttering
  their session. Should be gated to programs that declare an aerobic modality.

## Copy issues

- Program preview short description: "Multi-tiered handstand walk program from
  wall-supported beginner to advanced turns and obstacles. Personalised sessions target
  your specific weak capabilities." — "Personalised sessions target your specific weak
  capabilities" is jargon-adjacent. Persona 5 gets it; a lay CF athlete won't.

- Tier labels use dev-marker suffixes: "Tier A — Foundation (no handstand yet)". The
  bracket clarification is helpful but the "Tier A/B/C/D" prefix on top of a label is
  duplicative for users who don't know what tiers mean.

- The Coach "coming soon" cards (coach/page.tsx:271-303) list "Weekly review", "Session-day
  check", "Explain the plan", "Symptom triage" — all valid but the language ("why 92.5 kg?
  Why 5×5 not 3×8?") is strength-training-only. A skill user reads this and thinks the
  coach isn't for them.

- `formatDose` in plan-generator.ts:273-278 emits "3×20" for hold_seconds — the "20" is
  seconds but you can't tell. Reads as reps. Should render "3 × 20s hold" for hold_seconds.

- Manifest short description: "Personalised sessions target your specific weak
  capabilities" — the marketing dial doesn't quite match the honest arc note in the JSON
  ("The block gives you a personal delta, not a promise.")

## Visual / graph issues

- SymptomLoadChart in Progress > Insights renders a 300px placeholder even when
  `chartDays` is empty for a handstand user (nothing in `training_maxes`, no top-set
  weight to plot). Confirmed via progress/page.tsx:291-294 — the chart component takes
  the array and needs to handle N=0. Likely renders axes with no lines, looks broken.

- YourPlanCard `phase_lines` bullet list uses `-indent-3` (l.82) — safe on desktop but
  the phase names for handstand-walk are long (`"Weeks 1-2 — Wrist prep + Kinoshita
  position ladder (blocked practice)"`). Truncation absent; on iPhone SE this wraps
  onto 3 lines per bullet, making the reveal card 8+ lines tall.

- Program preview "Program shape (peek inside)" details block lists every phase and
  every block flat. For Handstand Walk that's 5 phases + 9 blocks = 14 items in a
  collapsed drawer. No tier-scoping.

## Sub-tab specific findings

**Progress > Lifts** — Blank/useless for handstand users. `PRIMARY_LIFTS` hardcode
(l.24-29) shows 4 lift cards even when the user has no TMs and the program has none.
Milestones section is empty (no `progression_targets` for handstand). Adaptive engine
banners (l.167-205) never trigger because they read strength cycle data.

**Progress > Hip** — Correctly hidden for non-hip programs (l.117-118). Good.

**Progress > Insights** — Shows the WeeklyNarrativeTile and SymptomLoadChart. The
WeeklyNarrativeTile counts strength sessions, PRs, endurance, rehab — none of which
Persona 5 will log. Ends up as "This week so far · 0 sessions · nothing to note."
No drill count, no CI mode label, no video-review frequency (which is authored as a
motivation KPI in the JSON `adaptive_engine_hooks`), no freestand-hold retest trend.

## Positive callouts

- Multi-dim engine core is genuinely good. `blocksForDate` → `resolveActiveTier` →
  `multiDimensionalBlocksForDate` → `composeSlotDrills` chain is clean, tested
  (plan-generator.test.ts confirms integration against handstand-walk.json), and the
  contextual-interference switch at week 3 is deterministic-shuffled per user seed
  (Phase A change is correct — includes uid so co-located athletes don't get identical
  orderings).

- All 31 drills in `drill_library` resolve in exercises.json (verified via grep). No
  dangling references.

- The intake wizard's separation of Screening / Where you are now / About you / Physical
  tests is genuinely well-thought-out. Multi-line safety_gates + capacity gate at
  IntakeClient.tsx:74-98 handles both medical and dose-honesty in one loop.

- The evidence-base and engineering_choices_flagged sections in the JSON are model
  citizenship. If any of that surfaced in the UI (Progress > Insights, or a "Why this
  program" tab), it would be a massive differentiator.

- Wrist prep + shoulder recovery blocks are correctly authored: `block_wrist_prep` and
  `block_recovery` wrap every session in the weekly_template across all tiers.
  Non-negotiable in weeks 1-3 per JSON note. Good.

- Tier D `block_skill_B_obstacles_or_turns` weakest-capability rule (`condition:
  "handstand_turns_level < handstand_obstacles_level"`) is exactly the kind of
  contextual-interference gate a skill user wants.

## Priority fix list

1. Add wrist + shoulder sliders to `/check` when active program is handstand (or any
   program that declares those keys in daily_log_schema). Without this the entire
   adaptive engine for handstand-walk is non-functional.
2. Surface the shoulder-pain-stops-session rule on Today (top-of-page banner on skill
   session days) and inside program preview above the fold — not just consent.
3. Populate `user_profile.capability_profile` at intake commit so YourPlanCard
   attribution ("Composed for: handstand walk dynamic at level 4") isn't dead code.
4. Fix manifest `load_hint` — say "5 sessions/wk (4 for Tier A) · 15-18 min each".
5. Build a handstand-aware Progress > Insights tab: weekly freestand-hold trend, drill
   count per capability, tier-progression readout, CI-mode indicator.
6. Hide Progress > Lifts (TM editor + PRIMARY_LIFTS) when program has no training_maxes.
7. Replace Report's "Aerobic sessions in range" fallback with a proper "Skill
   progression" panel for skill programs — drill volume, freestand-hold retest,
   walk-distance retest.
8. Add a `rationale_copy` field per plan_tier and render it on the intake result page
   in plain English, replacing raw `formatVars` output.
9. Tier-scope the YourPlanCard phase_lines and program-preview phase list — a Tier D
   user shouldn't see Tier A Kinoshita phases.
10. Gate `RunSlotCard` on Today to programs that declare an aerobic modality.
