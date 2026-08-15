# Strength-coach audit v2 — program-v2.pages.dev

Reviewed live app + `next-app/src/lib/engine/{suggest,adapt}.ts` + `src/lib/pr.ts` +
`src/lib/plates.ts` + `data/program.json`, 2026-08-06. Compared against
`dev/audits/strength-coach.md`.

## 1. Refreshed verdict

**Yes, no caveats worth naming out loud.** Last verdict was "yes, with caveats — hand it
over with a paper notebook until multi-set lands." The paper notebook is now redundant.
The app has the four things a real strength app must have and most consumer apps don't:
a proper multi-set data model, a symptom→prescription pipeline that changes the number
on screen, a plate calculator so the number is actionable, and a cycle-end engine that
offers a TM change rather than making the user do the arithmetic. The three math bugs
from last time are fixed. The Wendler prescription is coach-grade at every phase
boundary I checked. If a client of mine came in with this profile — post-injury,
muscle-memory return ahead, disc-golf-mechanism-not-CrossFit, physio still on the
referral list — I would tell them to log every session here and bring the Progress
screen to the physio in six weeks. It is now closer to a Juggernaut/RP tier tool than to
a Notes app with kg inputs.

## 2. Confirmed fixes

**Phase-4 week clamp — FIXED.** `suggest.ts:88` uses `pcts[week % 4]`. Phase 4 weeks 5-8
correctly cycle back to 65/75/85 → 70/80/90 → 75/85/95 → deload rather than getting
locked to deload from week 5 on. Old code did `Math.min(3, week-1)` which is
irreversible past week 4.

**Phase-6 peak percentages — FIXED.** Dedicated `PEAK_PERCENTS` table
(`suggest.ts:26-31`) hits 70/80/87.5 → 75/85/92 → 80/90/96 → deload, labelled correctly
(5RM/3RM/1RM opener). The dispatcher checks `phase.id === PEAK_PHASE_ID` before the
main-cycle branch would fire. Nit: peak indexing uses `Math.min(3, week)` so any week 5+
inside the phase silently repeats deload — currently phase 6 is exactly 4 weeks so it's
moot, but flag for extension.

**80% TM reintro cap — FIXED.** `suggest.ts:119-138`: `reintroCap = round(tm * 0.8)`,
then `Math.min(rawNext, reintroCap)` before the state modifier, and the reasoning line
exposes it. Verified live: TM 110, last set 90×5 @ RPE 5, app suggests 88 kg × 5 (was
100 in old code), reasoning reads *"Bump +10 kg to target RPE ~7. Capped at 80% TM = 88
kg (reintro)."*

Three-for-three.

## 3. New features assessed

**Multi-set logging.** Works. Rows for prescribed set count, `+ Add set`, delete-per-row,
per-set kg/reps/RPE, PR badge fires on the row that qualifies. Warm-ups + working sets +
AMRAP is now doable in one card. **Verdict: very good.** Two gaps to close next: no
set-level note (which set had the grinder?), and no per-set rest timer or auto-start.

**Adaptive engine.** `adapt.ts` reads the last 28 days, groups by symptom state, and
produces a TM recommendation per lift. Tiers — `+6 reps→big inferred-TM bump`, `+3
reps→+7.5/+10`, `all-green→+5/+7.5`, `amber hold`, `red −10%` — are defensible. The
"crushed AMRAP → inferred TM or +10 kg whichever higher" branch uses `inferTMFromSet`
with `rpe=null`, which is correct (a completed AMRAP is RPE 10 by definition, use raw
reps). **Verdict: sound.** Watch: (a) worst-state uses `redCount > 0`, so a single red
morning sinks the whole cycle — consider a threshold like ≥2 red or ≥3 amber; (b) the
squat +5 / pull +7.5 differential in the green branch and squat +7.5 / pull +10 in the
strong branch are both Wendler-canonical, keep.

**Date navigation.** Prev / next / Home. Non-today HeroStateCard is non-clickable —
correct, you shouldn't be back-dating a morning check. **Verdict: good.**

**Skip and Move.** Skip stores a reason; Move stores `moved_to` on the origin and
creates a `scheduled_overrides` entry on the target. No TM change from either. The
"Session skipped today · Undo" banner is exactly right. **Verdict: good.** Small note:
the move-target date input `min=today` prevents retroactively moving a past session
between two past dates. Minor.

**PR detection.** `pr.ts` rule: PR if no prior set has weight ≥ AND reps ≥ current.
Catches heaviest at any rep count, rep PR at same load, and new-territory rep PR at
lower load. What it doesn't catch is an **e1RM PR** — 100 × 3 beating a prior 95 × 5
both estimate to ~110 but the rule fires only if no prior set was ≥100 kg AND ≥3 reps.
The coarse rule is close enough. **Verdict: solid enough.** Add an e1RM comeback badge
alongside — that's the morale event post-injury.

**Plate calculator.** 20 kg bar, plates 25/20/15/10/5/2.5/1.25, greedy from heaviest,
per-side, remainder printed if short. Matches the box inventory. Home garage only has
10/5/2.5 — the label renders "impossible" loadings for home over 55 kg but that's the
correct signal (go to the box). **Verdict: right.** Nice-to-have: home/box toggle so the
label warns *"cannot load 90 kg with home plates."*

**Symptom modulation.** Amber → ×0.95, Red → ×0.90, applied after percentage and cap.
Verified live: red day, high-bar back squat, capped 88 → red-mod 79 kg × 5, reasoning
reads *"Consider skipping and doing Extras only."* **Verdict: right magnitude, wrong
mechanism on red.** A −10% load on a red morning is still a bar over the athlete's spine,
and amber vs red is currently only 5% + a sentence. The user's hand still goes to the
bar. Red should be a *skip-recommendation* with load hidden behind a disclosure and
"log a set anyway" as the secondary action. Amber = load reduction as now, red = default
to skip and feed the skip into the adaptive engine as a red-day marker rather than a
data-hole.

## 4. Ranked recommendations — 8 things to move from solid tool to best-in-class

1. **Rest timer with strength presets and auto-start on set save.** 90/120/180 s
   presets; auto-select 180 s for main lifts, 90 s for accessories. Flagged in the last
   audit; ship it.
2. **Red-day = skip-first UX, not load-reduction UX.** See §3. Hide the bar behind a
   disclosure; surface Extras/mobility as the primary action; mark the day as red-skip
   for the engine.
3. **Set-level RPE prompt and per-set note.** After weight+reps are typed, one-tap
   RPE (6/7/8/9/10) if empty. Per-set note field so the grinder / the miss gets logged.
   Fuel for the engine and the physio conversation.
4. **e1RM comeback badge.** "Best est. 1RM since May." The current PR rule doesn't fire
   on it and this is the whole point of the muscle-memory phase.
5. **Left/right split for unilaterals.** Program calls out a left-hip strength gap. The
   Bulgarian / step-up / single-leg RDL rows should have side-tagged sets or an L/R
   column. Currently the laterality spine shows L|R but the sets are undifferentiated.
6. **Bar-loading chip strip.** Tap a suggested weight → chip row *"25 · 25 · 5 · 2.5 ·
   1.25 per side · 88.5 kg total,"* tap-and-hold to switch to home plate set.
   Mid-session useful.
7. **AMRAP-aware suggestion.** Week 3 top set is a "1+" — the box should say *"Target:
   1 rep for 5/3/1. Bonus reps drive the next cycle bump."* Convert into a call-to-action
   rather than a shrug.
8. **Warm-up ramp beyond 2 sets.** Real ramp is empty bar → 40 → 60 → 80 → work. Compute
   4 warm-ups linearly from bar to top set for main lifts. Cheap; sets trust.

## 5. Watch items — right on paper, need real use to prove

- **The muscle-memory trajectory.** TM 110 → 165 back squat over ~34 weeks means +1.6
  kg/week averaged, front-loaded by "+7.5 to +10 per cycle in cycles 1-2." Aggressive but
  reasonable for a 10-year-trained lifter returning to a lift they were at 150 last year.
  If cycles 1-2 land green and hit their milestones (TM 120 then 130), the trajectory is
  real. If cycle 1 lands amber, everything else slides and the birthday attempt window
  (2027-04-20 to 24) shifts from "180 kg floor" to "180 kg stretch." Coaching
  assumption to reality-check at 2026-09-27, not a code issue.
- **Cycle-end engine on partial data.** Engine wants ≥4 logged days in the last 28. A
  realistic user logs heavy sessions cleanly, hip-flexor iso sporadically. Over 8-12
  logged days per cycle, `worstState` may over-index on a single red morning. Consider a
  proportion threshold across 2-3 cycles.
- **The 80% TM cap only fires in phase 1.** Cap lives inside the autoregulate branch.
  Once phase 2 starts (2026-08-30) the cap is gone because main-cycle percentages
  themselves cap at 95%. Correct — but if the user re-injures mid-programme and pauses,
  the cap doesn't automatically come back on resume. Consider gating the cap on the
  `detectPauseResume` calibration signal rather than the phase.
- **Auto-seed from `/data/log.json`.** Elegant. Seeded log has empty weight/reps for hip
  iso days — cold-start path (no prior log → ~55% TM) correctly takes over. Watch that a
  real logged barbell session in phase 1 produces the intended autoregulate suggestion
  on the next visit.
- **Skip streak semantics.** Skip banner says "Streak pauses but doesn't break" — no
  visible counter yet. When you add one, make sure moved-session skips don't burn it.
  The data already distinguishes `{moved_to}` from `{reason}` so this is easy to keep
  right.

## Bottom line

Last audit: prescription math right, single-set data model wrong, symptom pipeline
disconnected, cycle-end automation missing. All four resolved. What's left is tightening
the interaction layer around a correct engine — rest timer, red-day-as-skip, per-set
prompts, warm-up ramps, e1RM PRs, bar-loading chips, L/R splits. None of it is a rewrite
and none of it needs to land before phase 1 starts. It should land before the birthday
waypoint.
