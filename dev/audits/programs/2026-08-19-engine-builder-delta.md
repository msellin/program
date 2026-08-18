# Engine Builder — DELTA audit (2026-08-19)

Follow-up to `2026-08-18-engine-builder-comprehensive.md` after the 2026-08-18 fix
sweep (commits `65a397b`, `cccd609`, `df9b3a0`, `c70feba`, `ccbaa6d`). Two persona
bundles compared:

- `persona-engine` — consistent-average, tier=foundation, 60 days, life_load=4
- `persona-engine-fast` — overperformer, tier=progression, 60 days, life_load=2

Both regenerated at 2026-08-18 21:19–21:23Z via the patched simulator.

## 1. Verdict

The fix batch **landed the visible ones cleanly** — Week NaN is gone, the "YOU
FINISHED · 6 weeks logged" ghost card no longer fires, the retest cards render
real HR deltas (persona-engine: baseline 139 → current 136 bpm, Δ −3.0 bpm), the
`48g · 1047?` garbled Report glyph reads correctly as "49 green", and the
overperformer's tier assignment now flows through — the Today plan-built card
reads "Starting at Progression — your intake put you here"
(`persona-engine-fast/text/01-today.txt:10`). Adaptation verification is
**mechanically possible for the first time**: `runs[]` populates on both bundles
(22 and 24 easy/hard entries), the retest evaluator resolves the `avg_hr where
intensity == 'easy'` filter, and Progress → Report both consume the trend.
**But the harness still skips the intake-commit path** — top-level
`program_states` is `{}`, `capability_profile` and `intake_answers` are `null`,
so tier promotion, the non-responder classifier, and any second-tier retest
(`retest_metrics_mid_block[]`) still can't fire, and the archetype-differentiated
proposal — the whole point of the overperformer run — is silent.

## 2. Fixed — verified from artifacts + code

**Week NaN (P0-4, commit `65a397b`).** `next-app/src/app/page.tsx:310` now
`slice(0, 10)` before appending `T00:00:00`. Neither
`persona-engine/text/01-today.txt` nor `persona-engine-fast/text/01-today.txt`
contains the string `Week NaN`; the multi-dim contextual-interference banner
doesn't render at all for engine-builder (generation_strategy is not
`multi_dimensional`), which is the correct behaviour.

**`detectPauseResume` no longer counts morning-checks as activity (P0-7,
commit `65a397b`).** `next-app/src/lib/engine/adapt.ts:248-254` now requires
`Object.values(day.exercises).some((e) => e.done)` OR `day.runs.length > 0`.
Persona-engine has 60 morning checks + 22 runs; no "Welcome back — Xd away"
banner in `text/01-today.txt`. Correct.

**`formatMetric` seconds heuristic (P1-6, commit `65a397b`).**
`next-app/src/lib/engine/retest-evaluator.ts:244-253` — values under 90s render
`45s`, over 90s render `mm:ss`. Engine-builder retest cards use `bpm` unit so
this isn't directly exercised on this bundle, but the code path is present. No
`0:15` regression in retest cards on either persona.

**Report garbled glyph fix (P1-9, commit `65a397b`).**
`persona-engine/text/10-report.txt:38-40` reads `MORNING CHECK / 49 green`
cleanly. No `48g · 1047?` regression.

**"YOU FINISHED · 6 weeks logged. Nice." ghost card gone (P0-1 of the
comprehensive engine-builder audit).** Neither Today artifact contains "YOU
FINISHED" or "weeks logged". Both instead render a coherent single-frame Today
that names the active week ("Week 8 — deload and retest · week 1 of 1 · ends
24 Aug", `text/01-today.txt:23`) plus the day's block (Sustained tempo). Root
cause was two state cards racing; the gate has held.

**Retest cards now show real deltas (P0-3 → P1-5 in the reconciled list, commit
`c70feba`+`ccbaa6d`).** `persona-engine/text/05-progress.txt:38-50` shows
baseline 139 bpm, current 136 bpm, Δ −3.0 bpm against a Foundation target of
−5 bpm. The evaluator at `next-app/src/lib/engine/retest-evaluator.ts:150-164`
resolves `runs[].avg_hr where intensity == 'easy'` correctly — first easy run
(2026-07-02, HR 139) is the baseline, last easy run (2026-08-25, HR 136) is the
current. On persona-engine-fast the same path resolves 137 → 141, Δ +4.0 bpm
against a Progression target of −8 bpm (i.e. the card correctly reports "not
improving" — see section 4 for why the underlying signal is inverted).

**Retest empty-state UX (P1-5, commit `df9b3a0`).**
`next-app/src/components/progress/RetestMetricsPanel.tsx:147+231` — the resting-HR
card that has no `capability_profile.resting_hr_morning.measured_value` now reads
"No readings yet. Log your baseline below so the delta has something to track
against." with a `LOG BASELINE` button (`text/05-progress.txt:52-60`). Directly
addresses the "— · — · —" empty state that the 08-18 audit flagged as user-hostile.

**`resting_hr_morning` typo fix (Vector A → confirmed sticks post-Batch-1).**
`next-app/public/data/programs/engine-builder.json:1619` reads
`"source_ref": "resting_hr_morning"`, matching `physical_tests[0].id` at line
309. The Progress → Report chain reaches "physical_test" branch cleanly.

**`pace_500m` filter drop (Vector A, still in file).**
`engine-builder.json:1587` reads `runs[].avg_hr where intensity == 'easy'`
with no `pace_500m` filter. The 22 runs the simulator writes all have
`intensity: 'easy'` on Z2 days, `intensity: 'hard'` on 4×4 days
(`persona-engine/final-store.json`) — the filter matches Z2 days as intended.

**Tier-aware phase selection (P0-6, commit `cccd609`).**
`next-app/src/lib/engine/schedule.ts:124-134` now filters by `for_tier_ids`
before falling back. Engine-builder authors one phase per calendar window (not
tier-split) so this doesn't directly change output here, but the code is present
and doesn't break persona-engine-fast which sits on `tier: progression`.

**Multi-dim phase-remap fallback (P0-1, commit `cccd609`).**
`next-app/src/lib/engine/schedule.ts:63-90` — implicit shift from
`active_program_started_at` vs authored `phases[0].starts`. Not required for
engine-builder (single-dim, phases authored from the sim's own July window),
but the fallback is present.

**`ensureProgramStateEntry` (P0-3, commit `cccd609`).**
`next-app/src/lib/useStore.ts:52-62` writes `{started_at}` when a program is
activated without going through intake. **This fires on real user code paths,
but the simulator bypasses `useStore` entirely** — it seeds
`localStorage["program.log.v2"]` directly, so `program_states[slug].started_at`
is `undefined` in both persona artifacts. See section 3.

**Block-picker date shift (commit `ccbaa6d`).** `simulator-v2.ts:66-79` —
`toAuthoredDate()` maps persona July dates back to the JSON's 2026-01-XX phase
windows, so `pickAerobicBlocksForDate` (line 109-125) actually returns run
blocks. Result: `days_with_runs = 22` (engine) / `24` (engine-fast). Delta from
the 08-18 audit where the store was 60 days of `exercises: {}`. This alone
unblocks the retest chain.

## 3. Still broken

**`intake_answers` / `capability_profile` / top-level `program_states` still
empty (P0-3 in reconciled).** `persona-engine/final-store.json` shows top-level
`program_states: {}` (grep confirms), `capability_profile` absent from the
top-level keys, `intake_answers` absent. The tier + started_at that the code
DOES read from `user_profile.program_states.engine-builder` were written by
harness state-push
(`persona-engine/final-store.json` → `user_profile.program_states:
{"engine-builder": {"tier": "foundation"}}`) but no `started_at`, no
`baseline_capabilities`, no `baseline_training_maxes`. The retest evaluator
tolerates this by falling through
(`retest-evaluator.ts:153-158` — `startedAt` undefined → all-runs pass), but
the mid-block retest (`retest_metrics_mid_block[]`) and tier-promotion
mechanic (`tier-promotion.ts:37-58`) both bail out early. **The simulator
still needs to commit intake via the real path**, not just stamp the tier
label on `user_profile`.

**"Because: Fatigue signals in recent notes" reason string with zero notes
(engine-builder P2-6, still broken).** `persona-engine/text/01-today.txt:27`
fires the proposal card. Cause: `life_load: 4` on 60/60 days flips `sig.fatigue`
to `"elevated"` at `note-signals.ts:165-168`; then `proposedLoadMultiplier()`
at `:248-255` hard-codes the reason string as "Fatigue signals in recent
notes." The two ways to signal "elevated" (RPE drift vs. life_load ≥ 4) share
a copy path that only makes sense for the drift branch. Recommend: attribute
honestly — "Life load 4/10 mid-scale — consider a 5% trim." Cheap edit, one
line.

**Report page default range is still 3Y (P1-8 in reconciled, still broken).**
Both `text/10-report.txt:8-10` land on "Range: 21 Aug 2023 → 19 Aug 2026 ·
DAYS IN RANGE 1095 · DAYS LOGGED 49". A 60-day persona on an 8-week program
looking at a 3-year window is the wrong default. The fix landed in Batch 1 per
the reconciled list but doesn't show in the artifact — either it shipped a
different surface or it didn't stick.

**Per-track adherence "0/14 done · 0%" (engine-builder P1-2, still broken).**
`text/05-progress.txt:23-27` on both personas: `engine builder / 0/14 done ·
0% / · 11 UPCOMING · 3 SKIPPED` (or `14 UPCOMING` on fast). Runs are logged in
`runs[]` but the per-track adherence counter only reads
`store.logs[date].exercises[...].done`. Endurance sessions that live in
`runs[]` don't count. The reconciled list didn't include this as its own P1,
but it's the same class of bug as the retest side that was fixed — adherence
math has not been taught to read `runs[]`.

**History "0 done" every day (engine-builder P2-2 area, still broken).**
`persona-engine/text/04-history.txt:37-97` — 30 days of `0 done`. Same root
cause as the adherence counter. The heatmap header does say "0 strength · 53
active total" (`text/04-history.txt:10`) — so ONE spot on History acknowledges
runs, but the per-day expansion doesn't.

**Coach "Coming soon" still promises a specific future feature (P1-8 in the
engine audit).** `persona-engine-fast/text/03-coach.txt:8-9` still names
"am I ready to add the Norwegian 4×4?" as a concrete promise. Copy unchanged.

**"6 weeks logged. Nice." tone-drift was fixed by removal, not rewrite.** The
completion card doesn't fire at all now (correct behaviour when the persona
hasn't graduated), so the "Nice." off-tone is moot. If the graduation card
returns for graduated users, the tone question re-opens.

**Retest metric #1 anchor still overclaims (engine-builder P1-4, still
broken).** `engine-builder.json:1583` display reads `"Submax HR at pace-5
(row 2:00/500m)"` but the underlying source is `avg_hr where intensity ==
'easy'` (any easy run). There's no 2:00/500m pace discriminator in `runs[]`
schema. On persona-engine-fast this creates a real overclaim: the display
promises pace-controlled HR, the number is any easy-day HR. Rename or add a
pace field to the run schema.

## 4. New from archetype variety

**Overperformer path exposes an inverted retest baseline.**
persona-engine-fast has 24 runs, avg-HR trend on easy days visibly
DROPPING over time: 137 (07-02), 138, 142, 140, 138 … 136 (08-04), 136
(08-08), 136 (08-11), 136 (08-15). But the retest card shows baseline 137 →
current 141 (`text/05-progress.txt:38-48`). Why? The evaluator's "last easy
run" is `2026-08-25 HR 141`, but the Report's per-week HR bucket for wk of
08-16 shows `avg HR 164` because the last logged run WAS a "hard" one on
08-18 and the schema-sort returns the last easy day AFTER that (08-22 HR 142,
08-25 HR 141). Two ways to read this:
1. The retest metric picks first vs. last easy runs as
   baseline/current instead of averaging a window — one bad taper day (life_load
   spike, hot week, etc.) flips the delta. `retest-evaluator.ts:161-162` reads
   `matching[0]` and `matching[matching.length - 1]` — no windowing, no median,
   no smoothing.
2. The metric's own `aggregation: "trend_slope"` and `window_days: 28`
   (`engine-builder.json:1610-1611`) are AUTHORED but not IMPLEMENTED. The
   evaluator ignores both. So a 4-week trend-slope that would honestly show
   the overperformer's HR dropping never runs.

Net: **the overperformer's real signal is present in the runs, but the
displayed delta is dominated by two point-samples**. This is a legitimate new
P1 that the consistent-average persona couldn't have surfaced.

**No proposal card on the overperformer's Today.** `persona-engine-fast/text/
01-today.txt` has NO `APPLY` or `IGNORE` button anywhere in the rendered
strings. `life_load: 2` never crosses the ≥4 threshold at
`note-signals.ts:165`, so no fatigue-elevated proposal fires. This is
technically correct behaviour, but it also means **the confirm-first mechanic
is invisible in the overperformer bundle** — the whole reason Terav exists is
that proposals fire based on log signal, and this persona logs faster/lighter
easy days and gets no proposal to acknowledge that. There's no "your last
four easy days were −4 bpm below baseline — consider promoting to
Progression's Norwegian 4×4 slot" proposal. The engine's response to
overperformance is currently silent.

**Neither persona has a tier-promotion proposal.** `tier-promotion.ts:29-66`
requires `state.tier` + `capability_profile[testId].measured_value`. Both
personas have tier set but zero capability data → the function bails at line
44-48 (empty `capabilityValues`) and `inferTier` returns null. So even if the
persona were an overperformer, the promotion card can't fire until the
intake-commit path writes `capability_profile`. Same root cause as section 3.

**Tier-differentiated schedule DOES render.** Both personas see the same Today
block for 2026-08-19 (Wed → Sustained tempo), which is expected: the phase 8
retest window (`text/01-today.txt:23` on both) doesn't split by tier. The
tier-differentiated stimulus (Push introducing Norwegian 4x4 at week 2 vs.
Foundation delaying to week 5) lives earlier in the arc — the persona reveal
snapshot cited it correctly on Today's plan-built card
(`text/01-today.txt:10-15`). ✓

## 5. New adaptation evidence

**Retest evaluator runs end-to-end for the first time.** With runs[]
populated, `evaluateRetestMetrics` at `retest-evaluator.ts:172-236` returns
`{current: 136, baseline: 139, target: -5, stretch: -10, at_week: 8,
supported: true}` for persona-engine's `submax_hr_pace5_bpm`. Progress renders
this (`text/05-progress.txt:38-50`) and Report renders it identically
(`text/10-report.txt:50-62`). This is the first artifact bundle in the repo's
history where the retest chain has been mechanically verified.

**Weekly aerobic volume rollup works.** `text/10-report.txt:80-95` breaks
runs into `wk of YYYY-MM-DD / Xh Ym · N sessions · avg HR N` weekly rows.
persona-engine sees hard sessions correctly bucketed ("wk of 2026-08-16 /
0h 32m · 1 session · 1 hard · avg HR 168"). This is new signal the harness
now exposes.

**Non-responder classifier is silent.** The classifier at
`engine-builder.json:1696-1720` names `submax_hr_bpm` (not
`submax_hr_pace5_bpm`) as its `primary_signal_metric_id`. That id doesn't
resolve against `retest_metrics[]` (the metric there is `submax_hr_pace5_bpm`).
No place in Today, Progress, or Report renders the classifier verdict on
either persona. So the "responding / under_dosing / true_non_response"
copy authored on the JSON is dead-in-the-water for the same reason
`retest_metrics_mid_block[].metric_id: submax_hr_bpm` doesn't resolve either.
**Neither the 08-18 audit nor the reconciled list caught this** — the
classifier's primary_signal points at a metric_id that doesn't exist. Fresh
finding.

**No mid-block retest fires.** Week 4 evaluator
(`retest_metrics_mid_block[]` in `engine-builder.json:1722`) doesn't appear in
either Today or Progress. The mid-block reads
`capability_profile.submax_hr_bpm.measured_value` (per its metric_id) — which
requires a user-initiated capture. No such UI element in the tour. This
is a shipped-code gap the harness reveal now makes visible.

**Adherence math still doesn't count runs.** `0/14 done · 0%` on both
personas despite 22 and 24 logged runs is the loudest false-negative in the
new signal set.

## 6. Landing → app residual gap

`landing/src/i18n/dictionaries/en.ts:55` — `engine_builder_pitch: "For lifters
who can't yet run 5k."` matches the Programs catalog copy
(`text/06-programs.txt:63-67`) and the preview (`text/07-programs-active.txt:
14-20`) verbatim. Delivered.

`en.ts:48` — "You log a note. Engine proposes. You Accept or Ignore." —
Delivered for persona-engine (`text/01-today.txt:31-32` renders APPLY 5%
LIGHTER + IGNORE). NOT delivered for persona-engine-fast — the overperformer
sees NO proposal card despite logging 24 sessions with a downward HR trend.
The confirm-first mechanic is present but never fires in the archetype it
should most reward.

`en.ts:67` — "92 primary studies. Every session cites its research." — no
change since 08-18. Guide tab (`text/11-guide.txt`) still doesn't link to
`evidence_base.references[]`. Landing promise partially cashed.

`en.ts:9-10` — "Focused improvement, not a full training plan" — Today is
still cleanly single-track. Delivered.

## 7. Recommended next fixes

1. **Fix the retest evaluator to honour `aggregation: "trend_slope"` +
   `window_days: 28` on the engine-builder metric.** `retest-evaluator.ts:161-162`
   reads first/last point-samples; the JSON authored a 28-day trend slope. Two
   point-samples inverted the overperformer's Δ from a real −1 bpm to a false
   +4 bpm. Highest-value fix — it's what actually delivers the landing promise
   for the overperformer archetype.
2. **Teach the adherence math + History `0 done` counter to read `runs[]`.**
   Currently only `exercises[].done` counts. For an aerobic program this
   produces "0/14 done · 0%" that reads as "you're failing" when the user is
   actually 22/24 for the window. Same root cause on Progress per-track
   adherence and History day-level rows.
3. **Fire the non-responder classifier — the primary_signal_metric_id
   `submax_hr_bpm` at `engine-builder.json:1702` doesn't match the actual
   metric_id `submax_hr_pace5_bpm` at `:1582`.** Same class as the rowing
   name-mismatch (reconciled P1-1) but not previously caught for
   engine-builder. Fresh finding.
4. **Fix the proposal-reason attribution.** `note-signals.ts:251` hard-codes
   "Fatigue signals in recent notes" for the elevated branch, but life_load
   ≥ 4 with zero notes reaches the same branch. Attribute honestly ("Life
   load 4/10 — consider a 5% trim") — one line.
5. **Fire the overperformer proposal path.** Currently `note-signals.ts` fires
   only on fatigue/pain signals — there is no positive-adaptation branch that
   proposes "your last 4 easy days were 3 bpm below baseline — consider
   promoting Norwegian 4×4 to week 2." An overperformer with 24 clean logs
   sees ZERO engine feedback on Today. This is the mechanic that would let
   Foundation → Progression → Push tier promotion actually fire in-app.
6. **Persona simulator: commit intake through `useStore.setActiveProgram` /
   the intake-commit path instead of localStorage-seeding.** Right now
   `capability_profile`, `intake_answers`, and `program_states[slug].
   started_at` all bypass the code path that `ensureProgramStateEntry`
   (added in Batch 2) was supposed to guard. Until this lands, tier-promotion
   and mid-block retest can't be audited.
7. **Report page 3Y default range** — Batch 1 was supposed to fix this
   (per reconciled list) but the artifact still shows "Range: 21 Aug 2023 →
   19 Aug 2026". Verify the fix actually shipped to the Report component.
8. **Rename or window `submax_hr_pace5_bpm`** — the display_name promises a
   pace anchor the source_ref can't enforce until `runs[]` gains a
   `pace_500m` (or similar) numeric field. Either rename to
   "Submax HR on easy days" or add the field.
9. **Coach tab copy** — still promises "am I ready to add the Norwegian 4×4?"
   as a concrete future capability. Reword to keep the tone precise; landing
   voice is "cited before shipped" and Coach is neither.
10. **Mid-block retest UI** — `retest_metrics_mid_block[]` authored at
    `engine-builder.json:1722` is never surfaced in Today or Progress. Either
    render a "Week 4 mid-block check — log your submax HR" card at the right
    calendar day, or drop the JSON.

Landing → app alignment for engine-builder is fundamentally honest post-fix.
The remaining gap is that the *engine* underdelivers on the archetype
variety that landing promises — a fast responder should hear about it, and
right now doesn't.
