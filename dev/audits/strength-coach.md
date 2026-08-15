# Strength-coach audit — program-f3r.pages.dev

Reviewed live app + `index.html` + `data/program.json` + `data/exercises.json`, 2026-08-06.

## 1. Verdict

**Yes, with caveats.** Better than 90% of app-store tracking apps I've seen. TM, prescribed top set with warm-ups, FSL, RPE input, RIR-adjusted 1RM back-calc, live TM update, morning check + green/amber/red — all the right primitives are there. Two things hold it back: (a) it can only log a single set per lift per day, which breaks FSL / AMRAP records / Smolov Jr / Hatch, and (b) most of the auto-progression logic in the JSON and Guide is not wired in code. Both fixable inside the existing architecture. I would hand this user the app tomorrow — with a paper notebook alongside it until multi-set is in.

## 2. Session-flow walk-through

Simulated a Mon `block_squat_heavy` session against the live UI.

- **Warm-up.** Suggestion box shows two warm-ups (`75×5 → 86.5×3`). Fine for experienced, but real lifters do 4+ warm-ups from empty bar. Adds trust if the ramp is shown.
- **Main lift top set.** The green "Suggested today" card is the star feature. `98 kg × 5+` with the reasoning line is exactly what a coach would say. Big win.
- **AMRAP.** Reps field accepts an integer, but nothing keys off "you hit 11 at 85% — that's a rep-record PR." Wendler's rep-max ladder is invisible.
- **FSL 5×5.** Shown as one line. One weight, one reps input for the whole exercise. No way to log five separate sets or note which one started grinding. User will type `75` / `25` and lose the granularity.
- **Accessories.** Checkbox + notes. Fine.
- **Unilateral.** Spine shows L | R and highlights the extra-set side, but no separate L/R rep or RPE input. Bulgarian split squat — right side 8 clean, left wobbles at 6 — can't record that.
- **Rest timer.** Present and sticky, but presets are 20/30/45/60s (isometric holds). Strength sets need 2-3 min. Add 90/120/180s presets, ideally auto-select based on the last-touched card's category.
- **Notes.** Per-exercise textarea. Good.
- **Friction.** Auto-marking "done" when any log input is typed breaks the "log warm-ups too" idea and forces reopening the checkbox mid-session.
- **What works best.** The live TM back-calc (`→ implies 1RM ~120 kg · suggested TM 102 kg`). Verified: 90 kg × 5 @ RPE 5 correctly infers 5 RIR → 10-rep max → Epley 1RM 120 → TM 102. Coach-grade math.

## 3. Weight prescription math check

**5/3/1 percentage table** — matches Wendler exactly.

| Week | WU1 | WU2 | Top | Reps |
|---|---|---|---|---|
| 1 | 65% | 75% | 85% | 5/5/5+ ✓ |
| 2 | 70% | 80% | 90% | 3/3/3+ ✓ |
| 3 | 75% | 85% | 95% | 5/3/1+ ✓ |
| Deload | 40% | 50% | 60% | 5/5/5 ✓ |

**`inferTMFromSet` math:**
- Epley 1RM = weight × (1 + reps/30) — canonical.
- RIR = 10 - RPE — Zourdos, correct.
- TM = 1RM × 0.85 — conservative (Wendler's convention is closer to 0.9); appropriate for this user given the layoff. On 90×5@5 that's 102 vs 108. Keep at 0.85.

**RPE bump table** (`suggestForExercise` reintro branch):
- ≤5 → +10, ≤6 → +7.5, ≤7 → +5, ≤8 → +2.5, ≥9 → +0, null → +5.

Defensible. Two comments: (1) +10 for RPE ≤5 is fine on squat but I'd cap DL at +7.5. Same table applies to all lifts today. (2) **The "80% TM cap in reintro" is in the reasoning string but not in the code.** 90 kg × 5 @ RPE 5 with TM 110 → app suggests 100 kg, exceeding the stated 88 kg cap. Trivial fix: `suggested = Math.min(suggested, rnd(tm*0.8))`.

## 4. Missing features (ranked)

1. **Multi-set logging.** Non-negotiable for FSL, BBB, Smolov Jr, Hatch — all in the program. Needs `sets: [{weight, reps, rpe, side_note}]` per exercise, not scalars.
2. **Separate L/R for unilaterals.** Program calls out left-side deficit explicitly; app can't measure whether it's closing.
3. **AMRAP rep records.** Wendler's e1RM from the "+" set is the whole point of the method. Store best AMRAP reps @ % per lift and flag PRs.
4. **Rest-timer presets suited to strength.** 90s / 120s / 180s. Auto-start on set save.
5. **Bar-loading calculator** on tap of suggested weight. Trivial to add, valuable mid-session.
6. **Warm-up ramp beyond 2 sets.** Empty bar → 40 → 60 → 80 → work.
7. **Session summary.** Total tonnage, top e1RM, rep-record hits.
8. **Deload week visual differentiation.** Currently indistinguishable from a heavy week card.
9. **Read-back of last cycle.** "Cycle 1 week 3: 98 kg × 8 → e1RM 124 → TM +5 recommended."

## 5. Program-vs-app coherence

The JSON is much richer than the UI shows. Not rendered:

- `goals.non_negotiables` — six safety rules. Belongs on Guide.
- Top-level `principles` (six items). Only `weekly_template.principles` renders.
- `immediate_actions` (5 dated actions incl. "book physio").
- `phases[*].week_by_week` — reintro / eval / race-week detail invisible on Today.
- `phases[4].reintroduction_gate.conventional_deadlift` — the block-pull → conv-DL gate. Nothing triggers it.
- `blocks[block_smolov_jr_squat]` — full protocol in JSON, zero UI, `phase_gated_optional` never checked. User has to hand-edit to activate.
- `blocks[block_hatch_a/b]` — see phase-5 bug below.
- `substitutions` inside `block_squat_variant` — "front squat problem today → paused high-bar" hidden.

**Real code bugs:**

- **Phase 4 (8 weeks) week-mapping.** `week = floor(days/7)+1`, then `Math.min(3, week-1)` clamps at deload. So weeks 5-8 (cycle 4) all show 40/50/60% instead of cycling back to 65/75/85. Four weeks of silently-wrong deloads. Fix: `weekInCycle = ((week-1) % 4) + 1`, or split phase 4 into two phase entries.
- **Phase 6 treated as a 5/3/1 cycle.** It's in `inMainCycle` but the JSON defines it as a 12-week peak (`5RM@87.5% → 3RM@92% → 1RM@96%`). App will show 65/75/85 → 70/80/90 → 75/85/95 which is not the peak protocol.
- **Phase 5 (Hatch) falls to autoregulate branch.** Not in `inMainCycle`, no Hatch table anywhere in code. The app just bumps off last logged set — neither Hatch nor 5/3/1.

## 6. Injury guardrails

**Not connected.** Zero references to `symptoms` or `derived_state` inside `suggestForExercise` or the Today render path.

- No banner on Today if the morning check was red.
- No load reduction based on today's derived state.
- No session-skip / substitution prompt on red.
- No "3 amber weeks → clinician" trigger, despite the escalation text in `progression_rules.escalation`.
- `warning`/`avoid` on exercise cards renders (good), but no dynamic hide of `historical_provocateur` movements when symptoms warrant.

If the user reports groin 5/10 tomorrow, the app derives "red," logs it, and next Mon still cheerfully suggests 98 kg × 5+. **Biggest miss in the app given who this is for.**

Minimum fix: read the most recent morning check inside `suggestForExercise`. On red: subtract 10% from suggested load and return a `warn`. On amber: hold last week's numbers. Also gate hip-flexor provocateurs behind "groin symptom ≥3."

## 7. The auto-adjust promise

**Automatic:**
- Suggested top set / warm-ups / FSL from TM and cycle week (in main-cycle phases).
- Inferred TM from any logged set (weight+reps+RPE), with one-tap accept.
- "Milestone beaten by ≥4 weeks — stretch remaining targets?" — nicely implemented.
- Cold-start suggestion at 55% TM with no prior log.

**Still manual:**
- Cycle-end TM increment (green → +5 / +7.5). No code scans last 4 weeks of `derived_state` to offer it.
- Amber hold / red -10%. Not automated.
- Missed-reps reset rule (fail 95% top set → TM -10%). Not automated.
- Conventional-DL unlock gate (4 green weeks @ 150 kg block pull). Not automated.
- Smolov Jr activation, Hatch progression, phase-6 peak percentages — all manual.
- "3 amber weeks → clinician" — not triggered.
- Symptom → today's prescription — not wired at all.

**Summary:** the app is strong at telling the lifter *what today's prescription is* and *what today's set implies about TM*. It has almost no memory across weeks / cycles. That is the gap between the stated goal ("self-studying program") and reality.

**Highest-value automation to add, in order:**
1. Cycle-end review: "Last 4 weeks all green — bump TM +5? [Accept / Hold / Reset -10%]."
2. Symptom → today's suggestion (red -10%, amber hold).
3. Multi-set logging (so 1 and 2 have real data to reason over).

## Bottom line

Prescription math is right where it applies (weeks 1-3 of a 4-week cycle). Single-set data model, two phase-boundary bugs, and the disconnected symptom pipeline are what stop this from being the auto-adjusting program the user asked for. All fixable inside the current architecture — no framework, no rewrite. Priority order: (1) multi-set data model; (2) symptom → session gating; (3) phase-4 week modulo + phase-5/6 protocols; (4) cycle-end automated TM review; (5) L/R unilateral logging.
