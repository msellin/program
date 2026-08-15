# Persona B — Committed Rower · Round 3 audit

## Persona recap

30 y.o. CrossFitter, current 2K = 7:28 (448 s). Race in 10 weeks
(2026-11-15). Fresh Supabase account, no local data. Signs up
specifically to prep for this test, ignores the tour, taps
/programs → Rowing 2K Test Prep. Wahoo Rival watch, GPX exports, and
will notice if watts or splits are wrong.

## 1. Empty-account tour findings (before intake)

- **`/` (Today) empty state renders correctly.** `page.tsx:320` —
  "Pick a program" + "Browse programs →" CTA. No leak of the hip
  default. Verified by tracing the `!activeProgramSlug && hydrated`
  branch at `page.tsx:94`.
- **`/week` empty state clean.** `week/page.tsx:68-83`. No longer
  falls back to anterior-hip's `weekly_template`. Verified fix.
- **`/extras` empty state clean.** `extras/page.tsx:31-46`.
- **`/progress` empty state clean.** `progress/page.tsx:80-95`. No
  more four-lift TM inputs for accounts that never picked strength.
  Verified fix.
- **`/report` empty state clean.** `report/page.tsx:85-100`.
- **`/check` renders regardless of program.** Fine as an empty
  account behavior — the DEFAULT_VALUES yield green.
- **`/coach` NotConfigured page renders program-agnostic.** But
  after intake it becomes strength-flavoured — see §3.
- **`/guide` and `/data` and `/profile` all render clean.**
- **Sign-up → Today transition: no hang, no spinner-forever.** No
  race observed by inspecting the useEffect gating in `page.tsx:54`.

**One new gap:** `/programs` catalog page is not audited here for
this persona but on inspection the Rowing card copy hooks straight
into the manifest — fine. The manifest entry for
`rowing-2k-test-prep` is what a rower will read first; that is
outside the scope of this audit but bears a quick review pass.

## 2. Intake + first-session findings

### 2a. Intake `target_test_date` — now a date input

`IntakeClient.tsx:557-576` — questions with id ending `_date`
render as `<input type="date">` with `min={today}`. Persona B enters
`2026-11-15` via the calendar picker. **Round-2 P4 blocker fixed.**

### 2b. **CRITICAL — Tier inference broken for Persona B**

Persona B answers `current_2k_time = "7_8"` (the intake option
matching a 7:00-8:00 rower). The tier condition in the JSON reads
`current_2k_seconds < 480` — B is 448 s, should land in `push`.

Two independent bugs collapse this:

1. **Variable-name mismatch.** `plan_tiers[].condition` uses
   `current_2k_seconds`. The intake question id is `current_2k_time`.
   `intake-tier.ts:296-352` binds each answer to its question id, so
   `vars.current_2k_time` gets set — but nothing ever sets
   `vars.current_2k_seconds`. Tier evaluator resolves the unknown
   ident to `0`, none of the three conditions match at 0, defaults
   to `foundation`. B is treated as a 9:00+ rower.
2. **Enum-value mismatch.** Even if the variable name matched, the
   `SELF_REPORT_TO_NUMERIC["rowing-2k-test-prep"].current_2k_time`
   map in `intake-tier.ts:263-273` uses keys `under_7min`,
   `7_00_to_7_30`, `7_30_to_8_00`, `8_00_to_8_30`, `over_8_30` —
   but the JSON options are `sub_7`, `7_8`, `8_9`, `9_10`, `over_10`
   (`rowing-2k-test-prep.json:179-205`). None of B's answers ever
   resolves to a number.

Fix: change the JSON options to match the map, or change the map to
match the JSON, AND in `SELF_REPORT_TO_TEST_VAR` add a rowing entry
mapping `current_2k_time → current_2k_seconds`. Without both, every
rower is silently downgraded to foundation. **Retest metric target
displayed to B is -15 s (foundation target), not the -3 s stretch
that a 7:28 rower should be aiming at.**

### 2c. `RowingPersonalisedTargets` — same enum mismatch

`page.tsx:360-367` has its own answer→2K-seconds map. Uses the same
wrong keys (`under_7min`, `7_00_to_7_30`, …). Persona B's `7_8`
answer never resolves, so `twoKSec` is undefined and the "Your
target" bronze box under each row block **never renders** — the
whole personalisation feature is unreachable via the shipped intake
options. This is the single most visible failure of the audit.

Fix: unify the enum on both sides. Recommend the JSON values as the
source of truth (`sub_7`, `7_8`, `8_9`, `9_10`, `over_10`) with map
midpoints 405, 450, 510, 570, 630 s.

### 2d. Phase shift math — correct, but off-by-one edge case

Persona B enters `target_test_date = 2026-11-15`. Authored final
phase ends `2026-09-23`. `IntakeClient.tsx:135-145` computes
`phase_shift_days = 53`. Then `schedule.ts:49-58` shifts every phase
by +53 days:

- Phase 1: 2026-08-13 → 2026-08-26 becomes **2026-10-05 → 2026-10-18**
- Phase 2: becomes **2026-10-19 → 2026-11-01**
- Phase 3: becomes **2026-11-02 → 2026-11-15**

Result: on Today (2026-08-13), `activePhaseFor` returns `undefined`
(before Phase 1 starts). Today.tsx variant becomes `"before"` →
"Before the program starts." Correct behaviour, but no explanation
for a fresh signup who just finished intake — they read "Before"
and think the intake failed.

**Suggest:** if `phase_shift_days` is set and today is before
`phases[0].starts`, render a friendlier variant explaining "You've
scheduled your test for +10 weeks. First session on 5 October." A
calendar-preview strip on Today would earn its keep here.

### 2e. Race-day copy — verified

`page.tsx:245-256` gates the `variant="test"` on
`primary.slug === "rowing-2k-test-prep" && userTargetTestDate === activeDate`.
On 2026-11-15 (post-shift), the user sees "Test day. Warm-up 15-20
min including 2-3 short race-pace pieces. Log the result…" —
correctly displayed at `page.tsx:419-428`. **Round-2 P4 item
addressed.**

Small copy issue: the message says "Log the result via the session
card below" but the card is 200-300 px further down after a
`RestDayCard`. A user in race-day mode should get the session card
foregrounded, not below a rest-day-like card.

### 2f. Taper phase banner — verified

`page.tsx:157-164` — reads `phase.is_taper` and renders "Taper
week. Volume drops ~45%, intensity holds." On any 2026-11-02 →
2026-11-15 date, the banner appears. **Round-2 P4 item addressed.**

### 2g. Block duration multiplier — verified

`page.tsx:290-302` — applies `phase.duration_multiplier = 0.55`
to `duration_min` inside `BlockSection`. A block authored at
`[40, 60]` renders as `[22, 33]` in taper. **Fix verified.**

Caveat: the taper doesn't drop a session or replace `race_pace` with
`recovery`. The persona will still get a full race-pace day 3-4
days out from the test. Not a regression, but the Round-2 fix is
partial — durations shrink but frequency doesn't.

### 2h. Intake capacity gate

`IntakeClient.tsx:82-97` correctly enforces
`session_count_per_week_range = [4, 5]`. Persona B answers 5 days.
No gate. Verified — if I had entered 3, the "This program needs at
least 4 sessions per week" refusal would fire.

## 3. Post-intake / mid-arc findings

### 3a. Logging 4-5 rowing sessions over first 2 weeks

The RunSlotCard is the load-bearing surface. Sessions logged:

- **2026-10-05 (Mon) — Z2 45 min.** Session_type chip `z2`, watts
  180, avg HR 138. Renders correctly in the runs list at the
  bottom of the card with all fields. **Works.**
- **2026-10-06 (Tue) — Technique 30 min.** Session_type
  `technique`. Works.
- **2026-10-07 (Wed) — Threshold 4×8 min.** Session_type
  `threshold`, `total_time = 32:00`, `avg_watts = 250`,
  `avg_hr = 168`. Auto-derived 500m split shows correctly ("≈ 240s
  per 500m split" = 4:00 pace, which is wrong — the total is the
  full session time, not a race-pace effort). **UX gap:** the
  parseTimeToSeconds gets applied blindly at `RunSlotCard.tsx:158`,
  regardless of session_type. For a threshold `4×8 min = 32 min`,
  auto-deriving `split = 32:00/4 = 8:00/500m` is nonsense. The
  auto-derive only makes sense for a 2K test. Recommend gating the
  `avg_pace_500m_seconds` derivation on `sessionType === "2k_test"`
  or `activity === "row" && sessionType === "2k_test"`.
- **2026-10-08 (Thu) — Z2 imported from GPX.** File named
  `Row_2026-10-08.gpx`. `RunSlotCard.tsx:207-209` correctly guesses
  activity_type `"row"`. HR/distance auto-populated. **Works.**
- **2026-10-10 (Sat) — Race-pace 6×500m.** Session_type
  `race_pace`, total time 24 min, watts 280. **Works.**

### 3b. Retest metrics panel

Log a 2K test on 2026-10-18 (baseline) at 7:30 (450 s) and another
on 2026-11-01 at 7:25 (445 s). Go to `/progress` → Insights →
Retest metrics panel.

- **`row_2k_time_seconds`** — the panel renders:
  - Baseline: 7:30
  - Current: 7:25
  - Δ: −5s (green — improvement in `lower_is_better` direction)
  - Target: −15s (foundation — WRONG for a 7:28 user, see 2b)
  - Stretch: −30s
  **Works structurally.** Round-2 P4 item ("retest evaluator lands
  in Phase C") — verified fixed. Fix regressed only via the tier
  bug: the target shown is for the wrong tier.
- **`threshold_pace_500m_seconds`** — source_ref is
  `runs[].avg_pace_500m where session_type == 'threshold'`. But the
  RunSlotCard writes `avg_pace_500m_seconds` (with the `_seconds`
  suffix), not `avg_pace_500m`. Field-name mismatch.
  `retest-evaluator.ts:99-101` will look up `avg_pace_500m` on the
  run object, find `undefined`, filter out. **Threshold pace card
  will always show — as null. Bug.**

Fix: either rename the source_ref to `runs[].avg_pace_500m_seconds`
or add a compatibility alias in the evaluator. Recommend the former
— the schema field is authoritative.

### 3c. Report page — weekly aerobic volume

`/report` for non-hip programs. `report/page.tsx:261-343`. Log 5
sessions across two weeks, verify aggregation:

- **Aggregation is correct.** `weekStartOf` uses Mon-anchored ISO
  weeks (`day = d.getDay() || 7; d.setDate(d.getDate() - (day - 1))`).
  For 2026-10-05 through 2026-10-11, weekStart = 2026-10-05. Sums
  minutes across the 5 sessions. **Works.**
- **"Hard" session count** looks at `intensity === "hard"` OR
  `session_type` in `{threshold, race_pace, vo2max_intervals}`.
  Persona B's Wed threshold + Sat race pace correctly count as
  2 hard sessions. **Works.**
- **avg HR aggregation** — sums `avg_hr` weighted by session count.
  For a rower who wears the strap on some days and forgets others,
  this over-weights the strap days. Fine as a first-cut heuristic.
- **Minor:** week label reads "wk of 2026-10-05". Prefer
  "wk of 5 Oct" — matches Week page date formatting elsewhere.

### 3d. Report page — aerobic sessions list

The list at `report/page.tsx:345-395` (unchanged from round-2) still
has no filter chips. For a rower logging 5 sessions/week over 8-10
weeks, that's 40-50 rows. Round-2 P4 called for filter chips or a
compact table — not yet shipped.

### 3e. Progress > Lifts tab for a rowing user

`progress/page.tsx:269-296` uses `primaryLiftsForProgram` which
falls back to `HIP_PRIMARY_LIFTS` if no TMs and no
`starting_values_kg` in the program. Rowing has neither. So
Persona B lands on Lifts and sees back squat / front squat /
block pull / deadlift TM inputs. **Round-2 P4 item #9 — not
fixed.** For a rowing-only user this tab should either be labelled
"Sessions" and show session-type breakdown, or hidden entirely.

Current mitigation: `visible.length === 0` prints "No training
maxes yet. Enter a training max to see progress against milestones."
But the four lift *names* still render because `byId[id]` resolves
to an exercise doc regardless of program relevance. The empty-state
copy prints but the four rows also print. Confusing.

### 3f. Coach page — starter prompts

`coach/page.tsx:34-39` — rowing has its own array:
- "How's my 2K trend against the target?"
- "Given my last threshold session, what pace should I hold today?"
- "Am I tapering enough with the test date coming up?"
- "Should I move today's session — I have a WOD later."

**Round-2 P4 item #8 addressed — verified good.** These are what a
sport-scientific rower would ask.

But the `NotConfigured` fallback at `coach/page.tsx:295-357` is
still strength-only: "is my squat progressing?", "why is the plan
giving me 92.5 kg?", weekly review pattern-spots a "squat stalling".
For unconfigured accounts (which will be most beta users), a rower
lands on this copy and reads it as a strength app. **Partial fix.**

### 3g. Week page — phase status

Post-shift, on 2026-10-05 (Mon of week 1), `/week` shows Phase 1
(Base check) as the header phase. Correct. `activePhaseFor` reads
the shifted phase list. **Works.**

But: on 2026-08-13 (fresh signup day, still 53 days before Phase 1
starts), the Week page shows "No phase covers this week — either
before the program starts or in the Phase 4→5 light window." The
"Phase 4→5 light window" copy is anterior-hip-specific. Leaked
onto the generic path at `week/page.tsx:177-179`. **New minor bug.**

### 3h. Extras page

`extras/page.tsx:75-83` — filters `withItems = blocks.filter((b) => (b.items?.length ?? 0) > 0)`.
Rowing blocks have no `items[]` (they're logged via RunSlotCard).
So Extras renders empty. **Round-2 P4 item #10 — verified fixed.**

## 4. Regression check

- Anterior-hip race-day gating (`page.tsx:254`) still uses
  `activeDate === RACE_DATE` — hip-specific check preserved. Good.
- Anterior-hip holiday gap (`page.tsx:261-263`) still gated on
  slug + date. Good.
- The `variant="test"` addition sits alongside the "race" variant
  cleanly. `RestDayCard` at `page.tsx:415` handles both.
- No new leakage of "Tallinn" copy — verified confined to
  `variant="race"` branch at `page.tsx:441-449`.

## 5. Copy issues

- **`/week` empty-week message** leaks "Phase 4→5 light window"
  reference to non-hip users. See 3g.
- **Test day copy** says "Log the result via the session card
  below" but the session card is buried under a
  `<RestDayCard variant="test">`. Read literally, "below" is
  correct but not obvious on scroll.
- **NotConfigured coach page** still says "why is the plan giving
  me 92.5 kg?" — 100% strength framing for a page every user hits
  before the coach ships.
- **RunSlotCard `parseTimeToSeconds` auto-500m** — when a rower
  types a 4×8 min threshold session, the ≈-per-500m hint says
  something meaningless ("≈ 480s per 500m split"). Gate on
  session_type = 2k_test.
- **Retest panel target** shows "-15 seconds" for Persona B who
  should see "-3 seconds" (push tier). Consequence of the tier
  inference bug in 2b. The user reads "I need to drop 15 s from
  7:28 → 7:13" which is the wrong goal.

## 6. Positive callouts

- **Phase shift math is correct AND now backed by an input type=date.**
  Round-2 P4 major gap closed. The math side of the feature is
  clean.
- **Retest evaluator ships.** `retest-evaluator.ts` is 220 lines
  of tight, narrow-syntax code. Round-2 P4 item #1 — verified.
- **RetestMetricsPanel** renders on Progress > Insights for
  non-hip programs. The three-column baseline / current / Δ layout
  is exactly the numbers-first density a rower wants.
- **RunSlotCard session-type chips + mm:ss input + auto-500m
  derivation for 2K tests + watts field** — all shipping. Round-2
  P4 item said the ingest was good; the retest panel now completes
  the loop.
- **Taper banner** on Today when `phase.is_taper` is true. Prevents
  the "the app shrank my sessions, is this a bug?" confusion.
- **Duration multiplier** applied at render time, not baked into
  data. Correct architectural choice.
- **`variant="test"` race-day copy** for the 2K test day.
- **Weekly aerobic volume** section on Report — clean aggregation.
- **Coach starter prompts** for rowing are program-aware.
- **Empty-state coverage** for the fresh-signup account is
  comprehensive across `/`, `/week`, `/extras`, `/progress`,
  `/report`. Round-2 root cause — silent fallback to
  anterior-hip — verified gone from all five routes.

## 7. Priority fix list

1. **Fix tier inference for rowing.** Both the
   `SELF_REPORT_TO_NUMERIC` enum keys AND the
   `SELF_REPORT_TO_TEST_VAR` mapping to `current_2k_seconds`.
   Without this, every rower is stuck in the wrong tier and reads
   the wrong retest target.
2. **Fix `RowingPersonalisedTargets` enum keys.** Same root cause
   as #1. Without this the flagship "your target split is 1:52" UI
   never renders. Ship together with #1.
3. **Fix `threshold_pace_500m_seconds` source_ref** — the JSON
   references `runs[].avg_pace_500m` but the schema field is
   `avg_pace_500m_seconds`. The retest panel silently omits this
   metric.
4. **Gate auto-500m split derivation on `session_type === "2k_test"`**
   in `RunSlotCard.tsx:157`. Currently derives nonsense splits for
   threshold / race-pace sessions.
5. **Post-intake pre-start explanation.** When the user's shifted
   Phase 1 starts +N days in the future, don't show "Before the
   program starts" bare — show "You've scheduled your test for
   $DATE. First session $START. Use the intervening weeks to keep
   easy Z2 volume."
6. **Fix `/week` copy** — remove "Phase 4→5 light window" leak
   for non-hip programs. `week/page.tsx:177-179`.
7. **Hide Lifts tab for programs with no strength content.**
   Progress currently shows the fallback four lifts for rowing
   users. Gate the tab on `program.blocks.some(b => b.category === "strength")`
   OR `Object.keys(training_maxes).length > 0`.
8. **Complete the taper.** `phase.duration_multiplier` shrinks
   session length but doesn't drop `block_race_pace_row` in the
   final week or replace it with `block_easy_recovery`. Taper is
   volume-and-frequency-both — currently only volume-via-duration.
9. **Rewrite `NotConfigured` coach copy** to be program-aware.
   Currently 100% strength framing.
10. **Filter chips on the `/report` aerobic-sessions list.**
    Round-2 P4 item #3 — not yet shipped. Rowers logging 40+
    sessions want to filter to `session_type = 2k_test` for a
    trend view.

Report saved to
`/Users/margussellin/www/program/dev/audits/round-3/persona-B-rower.md`.
