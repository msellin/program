# Persona 4 — Rowing 2K test prep audit

## Persona recap

29 y.o. CrossFitter, 4 y training. Current 2K: 7:24, target sub-7:00 in 6 weeks. Uses a Concept2 at home + box ergs, Wahoo Rival with GPX/FIT exports. Sport-scientific reader — expects splits, watts, HR zones, taper compliance, and numbers-first UI.

Simulator v2 does not support this program (it only writes strength `logs[].exercises`; it never writes `logs[].runs`), so this is a route-by-route walkthrough of a 6-week arc with three fake test-date scenarios (default `2026-09-23`, 8-weeks-out `2026-10-08`, and a race-day walk-through).

## Blockers

None. A rower can complete intake, activate the program, and log every session. But almost everything downstream of the log is broken or empty for this modality — see UX gaps.

## Bugs

- **`retest_metrics` are declared but never evaluated.** `rowing-2k-test-prep.json:459-521` defines `row_2k_time_seconds` and `threshold_pace_500m_seconds` with `source_ref` queries into `runs[]`. `next-app/src/lib/engine/adapters/multi-dim.ts:15-26` explicitly comments that retest metric resolution "lands in Phase C" — Phase C isn't shipped. Grep for `retest_metrics` across `src/lib/engine/**` returns zero call sites. Consequence: I can log seven weekly 2K tests dropping from 7:24 → 7:05 and the app tracks nothing, promotes no tier, celebrates no PR.
- **Phase shift silently no-ops on bad date input.** `IntakeClient.tsx:135-145` requires an exact `/^\d{4}-\d{2}-\d{2}$/` string. The question is `type: "text"` (`rowing-2k-test-prep.json:225-230`), so a user who types "2026-10-08" gets the shift, but "Oct 8" or "8/10/2026" produces no shift and no error — the phases stay on 2026-08-13 → 2026-09-23. I only realised the shift didn't take when I hopped to `/week +5`. Should be an `<input type="date">` and/or validate + surface an error.
- **`/report` Aerobic-sessions list has no way to filter by session_type.** `report/page.tsx:229-274`. When Wed threshold, Sat race pace, and mid-block 2K all land in the same week, the list is a wall of "row · z2 · 42:10 · 200 W · avg HR 152" rows. No filter chips, no separation by session_type, no ability to isolate "just my 2K tests" — which is the single number the sport-scientific persona cares about.
- **`RunSlotCard` autofills `distance_km = 2` only for `2k_test`.** `RunSlotCard.tsx:158`. Retest queries filter on `session_type == '2k_test'`, but a rower doing a `race_pace` 6×500m session enters twoKTime = mm:ss for total time and gets no `distance_km` written. Report + progress therefore can't sum weekly volume in metres — a rowing-native metric.
- **Report page overview stat "days_with_logs" counts only symptom/exercise days.** `report/page.tsx:100` (I inspected it briefly). A rower whose only entries are `runs[]` will show as low-adherence on the overview even after 20 sessions, because the overview counter is strength-centric. Needs confirmation but the shape of `Object.values(store.logs)` filtering suggests it.
- **`session_type` string is unvalidated.** `schemas.ts:583` — `z.string().optional()`. The `RunSlotCard` chips write `z2 | technique | threshold | race_pace | 2k_test | recovery`, but a manually-edited entry (or a future different UI) can drift. Retest query `session_type == '2k_test'` would silently miss a typo `2K_test`.

## UX gaps

- **No "start row session" affordance on Today.** `page.tsx:190-214` renders each rowing block via `BlockSection`. Rowing blocks in the JSON have `category: "run"` and NO `items[]`. `page.tsx:334` `dedupeItems(items).map(...)` renders nothing. The block card shows: title + `40–60 min` + note. Below is the `RunSlotCard`. There is no "Log this session" button that pre-fills the block's `session_type` and preview. I have to (a) read the block name, (b) scroll to the RunSlot, (c) manually pick the right chip. A CrossFitter blasting through Today with sweat on the phone will type the wrong `session_type` more often than not.
- **BlockSection prescription is under-specified for a race-prep rower.** The `block_threshold_row` note reads `"4×8 min @ ~5-10 sec/500m over 2K pace, 2 min rest. HR 82-88% max."` — but nowhere on Today does the app derive a personal target pace from my baseline 2K. If I answered "7:00–8:00" in intake, "5-10 sec over 2K pace" needs me to do the math in my head. A single line "Target split: 1:56.6–1:57.8 / 500m" is the whole reason a sport-scientific rower opens the app.
- **Taper is declared, never enforced.** Grep for `taper|reduce.*volume` across `src/lib/engine/**` returns exactly one hit — the guide page copy. `phase_3_taper_test` runs the same `weekly_template.week` as phase 1 and 2. `duration_min` on `block_z2_row` is still `[40, 60]` in the taper week. The phase note says "Volume down 40-50%" but Today does not shrink duration, drop a session, or reflect the taper anywhere. A Wahoo user will do 55 min Z2 the day before the test because the app told them to.
- **Sunday is empty in the weekly template.** `rowing-2k-test-prep.json:447-449`. On `/week`, Sunday renders "Rest / accessory day". Fine for foundation tier, but the JSON note (line 421) says "Push adds one Z2 session Sunday" — the app never expresses that. Push-tier users get a rest day the JSON doesn't want them to have.
- **`/check` regions are misleading for rowing.** `check/page.tsx:17-22` sets `GENERIC_REGIONS` to `low_back / "Any joint pain" / "Muscle soreness" / "Shoulder / upper body"` — but under the hood these write to `groin_left`, `buttock_left`, `shoulder_right`. It "works" but it's a data-model leak, and none of the four map to what actually gates a rower (perceived respiratory fatigue, lumbar-erector stiffness, hamstring cramps post-race-pace). "Clicking present / painful", "Shortened my stride" checkboxes are hidden for non-hip users — but "Woke me at night" and "Morning stiffness" stay, so the check still feels ortho-flavoured.
- **`/coach` "Coming soon" copy is strength-first.** `coach/page.tsx:262-303`. The example prompts read: "is my squat progressing?", "why is the plan giving me 92.5 kg?", "Weekly review" pattern-spots "a squat stalling because bench day is too heavy". Zero rowing framing. As a rower I'd expect: "why is my threshold pace flattening?", "should Wednesday be threshold or race pace this week?", "does my HR drift on Z2 mean my fitness is up or my sleep is down?". The starter prompts `page.tsx:15-20` are program-agnostic and pass; the NotConfigured copy fails.
- **`/progress` has no rowing view.** `progress/page.tsx:24-29` hardcodes `PRIMARY_LIFTS = [back_squat_highbar, front_squat, block_pull_midshin, deadlift_conventional]`. Rowing users land on the Lifts tab and see four empty TM inputs. Insights tab renders `SymptomLoadChart` — which needs a symptom + `heaviest_top_set` for the day. All my sets are empty (no strength maintenance is authored on this program). The chart is blank. There is no 2K trend, no threshold pace slope, no watts progression. This is the tab this persona would spend the most time on.
- **`/programs/rowing-2k-test-prep` intake `target_test_date` uses a text input with a `yyyy-mm-dd` help hint.** Combined with the silent phase-shift no-op, the flow is: user types "October 8", nothing happens, they land on Today, phases still on the authored dates, they discover the taper is on the wrong week only when they read Week +5. Trivial fix — `<input type="date">`.
- **`SessionActions` at the bottom of Today (`page.tsx:212`) is strength-only.** It renders "Skip today", "Move to another day" — the "Move" flow assumes you're moving a strength `block_*` and the target day accepts strength blocks. Moving a threshold row session forward two days doesn't make coaching sense; the app should either grey out Move for aerobic blocks or actually reason about the 48h between-hard rule (`weekly_template.principles[1]`).
- **`RunSlotCard` `sessionType` chips + `twoKTime` field WORK as advertised.** Verified. Pick `2k_test`, type `7:24`, submit → the entry has `session_type: '2k_test'`, `total_seconds: 444`, `avg_pace_500m_seconds: 111`, `distance_km: 2`. That data is retrievable — but the retest evaluator doesn't read it and nothing on `/progress` displays it. So the ingest is good, the surface is empty.

## Copy issues

- **Race day copy is de-hardcoded — verified.** `page.tsx:172-186` gates the `variant="race"` on `primary.slug === "anterior-hip-rebuild"`. A rower will never see "Tallinna Ülemiste Järve Jooks". If the rower's test-date lands on an off-schedule day, they get generic `"rest"` copy. There is no `variant="race"` for the 2K test day itself. For a program that explicitly lists a race-pace test as a milestone, that's a miss — the taper-week 2K deserves special-cased copy ("2K test day. Warm-up + one all-out effort. Log the split.").
- **`/guide` Endurance terms section — read as a rower.** Solid overall, but three gaps:
  - Term "500m split" example uses `7:35 = ~1:53.7 avg split` — for a persona targeting sub-7:00 the example is inconsistent with the audience. Not wrong, just slightly off-persona; consider "6:59 = 1:44.75 split".
  - No definition of "stroke rate" or "s/m" — the second most-used rowing metric after split. A rower reads "race pace" and immediately asks "at what rate?". The program note on `block_race_pace_row` gives distances but never mentions rate.
  - No definition of "drag factor" (Concept2-native). If the coach ever needs to interpret a slower split, drag factor is the first confound.
  - "Taper" citation is Bosquet 2007 in the guide but Mujika 2000 I+II in the program JSON. Two different references for the same concept. Pick one canonical source.
- **`/coach` NotConfigured copy** — see UX above; it's not wrong for a strength user, but every example is strength.
- **`/check` label "Any joint pain"** feels lazy after the specificity of the hip check. Suggest program-aware labels: "Lumbar stiffness", "Hamstring soreness", "Anterior shoulder / lat".
- **Program status line on Today** reads `"Base check · week 1 of 2 · ends 26 Aug"`. Good. But `phase.goal` on `/week` renders "Establish current 2K + submax HR baseline. Sharpen technique before overloading." — that copy still fires when the phase has been shifted 14 days later; the phase name is unchanged but the "current" wording gets stale on a shifted schedule. Minor.

## Visual / graph issues

- **Report Aerobic-sessions list layout** (`report/page.tsx:244-273`): `font-mono` `flex-wrap` rows with a 24-column date, then session_type, then `total_seconds · pace · watts · km · minutes · HR`. On an iPhone SE this wraps to 2-3 lines per session. For 25+ sessions in a 12-week range that's a scroll-wall. Suggest a compact table (date | type | time | 500m | watts | HR) with `overflow-x-auto`, mirroring the hip-check mobile-card pattern already in the file.
- **`/progress` → Insights → Symptom vs load chart is blank** for a rowing user because they have no strength logs. The empty chart doesn't say "no strength load in range" — it just draws axes. Confusing.
- **Rowing block card visual on Today** — `border-l-green` (`page.tsx:319`) with `bronze` for strength. Green is fine but if a user runs both Rowing and Engine Builder concurrently (they'll want to for the polarised base, though `interference_hints` blocks it), the green bar reads identically for both, no differentiation.
- **Tap targets are OK** — 44px+ across `RunSlotCard`. The `2K test` chip and the "Total time" mm:ss field are prominent enough.
- **`Extras` duplicates every rowing block.** Because all 6 blocks are `category: "run"` (`rowing-2k-test-prep.json:369-417`), `extras/page.tsx:54-68` shows every rowing block under "Cardio & conditioning" — with no `items[]`, so each shows a hollow BlockSection card. Meanwhile Today already shows today's row. Extras is redundant noise for this program.

## Sub-tab specific findings — Progress

- **Lifts tab.** Rowing user sees `back_squat_highbar / front_squat / block_pull_midshin / deadlift_conventional` — none of which are in `rowing-2k-test-prep`. TM inputs are empty. The "Milestones" section reads `program.goals.progression_targets.milestones` (`progress/page.tsx:52-55`) — rowing program's `goals` shape is different (`goals.primary` string, not `progression_targets`), so the milestones section is hidden. Net UX: a page that's 90% hidden with 4 unrelated lifts sitting there.
- **Hip tab.** Correctly hidden (`showHipTab = activeSlug === "anterior-hip-rebuild"`).
- **Insights tab.** `WeeklyNarrativeTile` — need to check if it's program-aware; if it narrates strength volume changes it'll say "No strength load this week" every week. `SymptomLoadChart` — blank (see above).

**What Progress needs for a rower**: a 2K trend line (mm:ss over weeks), a threshold pace slope with a projected week-6 target, a HR-at-Z2-pace drift chart (fitness surrogate), a stacked bar of weekly volume by `session_type`. None exist.

## Positive callouts

- **Phase shift math is correct.** `IntakeClient.tsx:135-145` + `schedule.ts:39-58` — when input format is valid, phases move as expected. 8-week test-date shifts phases +14 days (verified by reading the math). Bug is only in the input surface.
- **Race day hardcode removal is clean.** The `variant="race"` gate on `primary.slug === "anterior-hip-rebuild"` is exactly the right shape. Rowers get generic rest copy, no Tallinn reference. Verified `page.tsx:172-186`.
- **RunSlotCard rowing UI is genuinely good.** Chips are 44px+, mm:ss parser accepts `7:35`, `7:35.4`, and bare seconds `455` (`RunSlotCard.tsx:95-112`). Auto-derived 500m split displays live under the input (`:488-492`). Data model captures `session_type`, `total_seconds`, `avg_pace_500m_seconds`, `avg_watts`. All correctly filled and rendered in the runs list. This is the highest-quality rowing surface in the app.
- **GPX import works and infers `activity_type: "row"` from filename.** Wahoo exports as `Row_2025-06-08.gpx` and lands with the correct chip pre-selected. HR and elevation come across.
- **`/report` "Aerobic sessions in range" section exists.** Even if the layout needs work and there's no filtering, having a chronological list of every row/run/bike is a strong start for handing to a coach.
- **Guide "Endurance terms" section reads correctly.** Zone definitions, LT2 / MLSS, VO2max intervals, 500m split, taper — all present. The Bosquet vs Mujika citation drift and the missing stroke-rate/drag-factor terms are the only real gaps.
- **`interference_hints` in the JSON correctly names `engine-builder` as `incompatible_with`.** Would be nice to surface this to the user, but at least the data is right.

## Priority fix list

1. **Ship the retest metric evaluator.** Without it the entire program is decorative. `runs[].total_seconds where session_type == '2k_test'` → weekly best_of_last_n → display + tier gate. This is table stakes for a test-prep block.
2. **Add a 2K trend + threshold pace slope chart to `/progress`.** For a numbers-first rower this replaces the (currently blank) Symptom-vs-load chart.
3. **Enforce the taper.** Reduce `duration_min` by 40-50% on `block_z2_row` when `dateISO` sits inside `phase_3_taper_test`. Hide `block_race_pace_row` on the second taper week or replace with `block_easy_recovery`.
4. **Auto-derive personal target splits.** `intake_answers.current_2k_time` + block prescription → concrete "1:56–1:58 / 500m" on the block card. This is what actually turns Today into training software.
5. **Make `target_test_date` an `<input type="date">`.** Silently no-oping on "October 8" is a data-integrity trap.
6. **Add a "Log this session" affordance on the block card** that opens `RunSlotCard` with `sessionType` pre-selected from the block's semantic type.
7. **Race-day copy for the 2K test day.** Program declares "test at week 6" — surface it as a `variant="race"` styling with a "warm up, one all-out effort, log the split" message. Same shape as the hip race-day, gated by program+date.
8. **Rewrite `/coach` NotConfigured examples to be program-aware.** At minimum: swap in "why is my threshold pace flattening?", "HR drift on Z2 — fitness up or sleep down?" for rowing users.
9. **Fix Progress Lifts tab for non-strength programs.** Either hide it, or read primary lifts from the active program (this program has none — the tab should be "Sessions" and show session-type breakdown).
10. **De-duplicate Extras for run-category-only programs.** If every block in the program has category `run`, don't repeat them on Extras — that page should show 0 sections instead of 6 hollow cards.

Report saved to `/Users/margussellin/www/program/dev/audits/round-2/persona-4-rowing.md`.
