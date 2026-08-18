# rowing-2k-test-prep · comprehensive audit — 2026-08-18

Vector B — full-stack audit against `persona-rowing` (consistent-average, 45 days). Read-only; no
code or JSON modified. Cross-referenced Vector A findings in
`dev/audits/programs/2026-08-18-setup-audit.md`. Persona artifacts at
`next-app/tests/e2e/artifacts/personas/persona-rowing/`.

## 1. Verdict

The race-anchored arc is authored well end-to-end (evidence base, tier ladder, taper phase with
`is_taper` + `block_replacements_final_week`, mid-block retest hook, mm:ss intake parser). The two
retest-metric `source_ref` fixes shipped 2026-08-18 unlock the metric queries at the schema layer,
and the taper substitution logic in `schedule.ts:183-192` is correctly Shape-A compatible. But the
persona-rowing artifacts expose a P0 that dwarfs everything else: **the sim skipped intake, so
there is no tier, no baseline, no phase shift, and no runs** — with the result that Today, Week and
Progress render a program that has been "week 1 of 2 · ends 26 Aug" for 45 days AND simultaneously
shows an "END-OF-BLOCK RETEST WINDOW OPEN · Week 6" card, which is a contradiction the user should
never see.

## 2. P0 findings

### P0-1 · Today shows "week 1 of 2" AND "Week 6 retest window open" simultaneously

`next-app/tests/e2e/artifacts/personas/persona-rowing/text/01-today.txt:22-30` and mobile
screenshot `mobile/01-today.png`:

```
Base check · Weeks 1–2 · week 1 of 2 · ends 26 Aug
END-OF-BLOCK RETEST WINDOW OPEN
Because: Week 6 end-of-block retest is due. Log a reading to compare against baseline.
Week 7 · logging 2K row time (seconds)
```

Two different clocks are showing different weeks on the same screen. Root cause: the persona was
active for 45 days (`persona.json:6`) with `active_program_started_at = 2026-07-01`
(`final-store.json:433`), but has **no `program_states[slug]`** (grep confirms only occurrence of
"tier" in the store is `tier: "beta_forever"`). Because the sim never ran intake, none of the
commit-time writes fired in `IntakeClient.tsx:278-344` (no `tier`, no `intake_answers`, no
`baseline_training_maxes`, no `phase_shift_days`). The retest-window computer keys off elapsed days
from `active_program_started_at` (Week 7), but `activePhaseFor()` returns `phase_1_base_check`
(dates 2026-08-13 → 2026-08-26 per `rowing-2k-test-prep.json:298-299`) because those authored dates
were never shifted. Two different anchors, two different weeks, both on-screen at once.

Real users going through intake won't hit this exact contradiction — the phase-shift logic at
`IntakeClient.tsx:310-326` re-anchors `phase[0].starts` to today. But the sim harness bypasses
intake, and the fact that the app renders this at all (no reconciliation check between "phase says
week 1" and "elapsed says week 7") is the real bug. In production it manifests any time
`program_states[slug]` gets cleared or corrupted while `active_program_started_at` survives (KV
sync race, partial store restore, user deletes the program and re-adds it without re-intake).

Recommended: gate the "END-OF-BLOCK RETEST WINDOW OPEN" card on `program_states[slug].tier != null`
or on "the phase computed by elapsed days matches the phase computed by dates" — either would
suppress the contradiction. Also: fix the persona harness to run intake commit (see P0-2).

### P0-2 · Persona harness skips intake commit — makes every rowing screen unaudittable

`persona-rowing/final-store.json` has zero runs, zero exercise logs, zero `program_states`, zero
retest readings. `exercises: {}` on every one of the 45 days. `logs_count: 45` in the sim summary
(`persona.json:14`) counts symptom-only entries. The archetype "consistent-average" was supposed to
mean "logs sessions consistently" — instead it's logging nothing but morning symptoms.

Impact on this audit specifically: cannot verify (a) whether retest cards populate from run logs
after the 2026-08-18 fix to `source_ref`, (b) whether the taper block replacement actually fires
on-day, (c) whether Today renders the taper session copy or the base-check session copy on day 40+,
(d) whether `is_taper` badges show up. **Cannot judge the shipped fixes end-to-end.**

The harness needs a run-log emitter for `programSlug: rowing-2k-test-prep` that writes at least:

- one `runs[]` entry per prescribed row day, with `activity_type: "row"`, `session_type` matching
  the block (`z2` / `technique` / `threshold` / `race_pace` / `2k_test` / `recovery`), a `total_seconds`
  on 2K test days and an `avg_pace_500m_seconds` on threshold days;
- baseline 2K on day 1 or 2 (Week 1 base check per `phases[0].blocks` includes `block_open_2k`);
- mid-block retest around day 21 (Week 3 per `retest_metrics_mid_block[0].at_week`);
- `program_states[slug]` populated with tier, intake_answers, started_at, baseline_training_maxes,
  phase_shift_days — as `IntakeClient.commit()` writes them.

Without this the persona is worthless as an auditing surface for anything downstream of intake.

## 3. P1 findings

### P1-1 · `retest_metrics_mid_block[0].metric_id` name mismatch (confirmed Vector A P2, upgraded)

`rowing-2k-test-prep.json:1001` references `metric_id: "threshold_pace_500m"`; actual metric
declared at `:501` is `metric_id: "threshold_pace_500m_seconds"`. The Vector A audit correctly
flagged this but rated P2. It should be P1 because the mid-block retest at Week 3 is the classifier
signal for `non_responder_classifier.primary_signal_metric_id`
(`rowing-2k-test-prep.json:979`), which is *also* mis-named as `threshold_pace_500m`. Two places
authored to point at a metric that doesn't exist by that name — the non-responder read
(under_dosing vs true_non_response vs responding, `:983-996`) never fires because the classifier
can't resolve its input.

Fix: rename both consumer references to `threshold_pace_500m_seconds` (JSON-only, no engine
change).

### P1-2 · `current_2k_time` intake question is free-text, not the enum documented in the audit brief

The audit brief describes an enum with values `sub_7 / 7_8 / 8_9 / 9_10 / over_10`. The actual JSON
at `rowing-2k-test-prep.json:174-180` declares `type: "text"` with help "Format: mm:ss, e.g. 7:52.
Type 'never' if you haven't tested a 2K on the erg." The enum values ARE mapped in
`intake-tier.ts:299-305` under `SELF_REPORT_TO_NUMERIC["rowing-2k-test-prep"].current_2k_time`, but
no UI ever produces them — dead code, and the intake's tier inference route is entirely mm:ss
parsing at `intake-tier.ts:363-370` plus the `never` fallback at `:376-378`.

Not broken, but two consequences:

1. Users answering "7:30" get the correct 450s → Progression tier. Users answering "seven thirty"
   or "7.30" or "7 30" fall through to `vars[testVar] == null` → no `never` regex match → the
   condition-eval defaults every var to 0 → tier `push` matches first (`current_2k_seconds < 480`
   with 0 < 480 = true) → user lands on Push. **Push tier's honest range is 2K < 8:00; a novice
   fat-fingering their answer lands on the arc that assumes they can already row sub-8.** That's a
   UX bug with correctness consequences.
2. The intake screen shows only a free-text field with help copy. Compared with the enum-picker
   pattern (chips like "sub 7:00", "7:00-8:00", ...) which the code was clearly written to support,
   this is worse for cold-start users who don't know their time yet.

Fix: either drop the free-text field for a select with the enum values (and keep mm:ss as a stretch
"if you know your exact time" secondary input), or add stricter parsing + a validation state that
blocks Continue on unparseable answers. The dead `SELF_REPORT_TO_NUMERIC` entry hints the original
design intended the enum.

### P1-3 · Progress "CHECK AT WEEK 6" label lies to a user starting today

`persona-rowing/text/05-progress.txt:29-31` and mobile `05-progress.png` both render:

```
2K row time · CHECK AT WEEK 6
BASELINE — · CURRENT — · Δ —
Target −0:15 · stretch −0:30
```

The `at_week: 6` on `retest_metrics[0].targets[]` is authored per tier
(`rowing-2k-test-prep.json:483,488,494`). The `retest_metrics_mid_block[0].at_week: 3` is also
authored (`:1002`). But the Progress screen only surfaces the end-of-block week 6 target — the Week
3 mid-block check isn't shown at all. Users with the Progression / Push tiers who want to know
"when do I re-test threshold pace next?" get no answer from Progress.

Fix: render a "Mid-block check at Week 3" caption on the threshold-pace card sourced from
`retest_metrics_mid_block[]`. Cheap; increases the felt cadence of the arc.

### P1-4 · Preview page doesn't warn that this is a test-dominant arc

`persona-rowing/text/07-programs-active.txt:22-32` and mobile `07-programs-active.png`. The preview
reads clean and honest but never says "you must actually do the 2K test on the final week for the
arc to make sense." The two most easy-to-skip prescribed sessions in this program are (a) the
baseline 2K in Week 1 (`immediate_actions[0]`, `rowing-2k-test-prep.json:549`) and (b) the test-day
2K in Week 6. Skip either and the whole arc's promise ("2K down 15-30 seconds by tier") becomes
uncheckable — the baseline can't be measured and the endpoint can't be measured.

The `who_this_is_for` and `what_you'll_achieve` copy both frame the user as someone who's already
committed to a 2K PR attempt. Missing: an explicit "you're signing up to do a hard 2K in Week 1 AND
Week 6" callout. Fix: add a small "Two hard test days baked in" strip between "Retest" and
"Recommended background" that names the two test dates explicitly (Week 1 open-2K and Week 6
test-day 2K).

### P1-5 · Intake question ordering doesn't front-load the safety gates

`rowing-2k-test-prep.json:141-245` orders questions: days_per_week → current_2k_time →
erg_familiar → target_test_date → hypertension_unmanaged → exertional_syncope_history →
chest_pain_recent → flaring_low_back → consent_symptom_data.

The four safety gates are at positions 5-8. The IntakeClient wizard groups them into a "Screening"
section (`IntakeClient.tsx:469-478`) and puts screening steps first regardless of authored order
(`:633-640`). So the actual wizard order is fine — screening comes first. But the JSON's order is
misleading to anyone reading the raw file. Cosmetic: reorder the JSON to match the wizard
grouping.

## 4. P2 findings

### P2-1 · Programs list domain label "Aerobic" doesn't include this program

`persona-rowing/text/06-programs.txt:65-95` shows rowing-2k-test-prep grouped under "Engine &
endurance" (from manifest `category: "endurance"`, `manifest.json:119`). The landing dict at
`landing/src/i18n/dictionaries/en.ts:61` uses `domain_aerobic: "Aerobic"`. If the app is expected
to filter/facet by `race_prep` or `rowing`, neither surfaces in the catalog. Search-by-tag would
land this program more precisely; today it lives one nesting level down from where a race-anchored
seeker would look.

### P2-2 · History treats every 45 days as a session

`persona-rowing/text/04-history.txt:11` reads `0 strength · 45 active total`. But with zero
exercises and zero runs across all 45 days, "45 active total" is misleading — the persona logged
morning symptoms only. The heatmap is compressing "morning check present" as an active day. This
inflates the streak-ness of a user who is doing nothing. Fix: separate the "morning check only"
class from the "session logged" class in the History heatmap counter.

### P2-3 · Progress "How the engine reads you" section is collapsed and unhelpful

`text/05-progress.txt:14`. Users who tap it get generic engine-explains copy, not
rowing-specific — the `signal_completeness.currently_reads[]` and `would_additionally_use[]`
authored at `rowing-2k-test-prep.json:922-949` are program-specific and directly relevant (HR per
interval, stroke rate per interval), but the Progress panel doesn't surface them.

### P2-4 · Report screen shows "MORNING CHECK · 45g · 1050?"

`text/10-report.txt:39-40` — that "45g · 1050?" reads like a rendering bug or an unformatted count.
Real: this is 45 green checks and 1050 seconds (17.5 min) of morning-check time. Currently reads as
gibberish. Fix: use human units (`45 green · ~17 min`).

### P2-5 · Coach tab still just says "Coming soon"

`text/03-coach.txt`. Fine as an interim, but the copy names 2K trend as the example question — good
pointer for what to build.

## 5. Adaptation verification

**Cannot verify most adaptation behavior** because the persona has zero runs and no
`program_states`. What was verified structurally:

- **Taper block replacement (`schedule.ts:183-192`) — code path is correct.** Given a date within
  7 days of `phase.ends` (2026-09-23) AND `phase.is_taper == true`, the layout's `block_race_pace_row`
  gets mapped to `block_easy_recovery` per `phase.block_replacements_final_week`. The persona's
  captured screen is on 2026-08-18 (day 45), which corresponds to phase_1_base_check per the
  unshifted authored dates — nowhere near the taper window. **Not observed firing.**
- **Retest firing (`retest-evaluator.ts:150-164`) — code path is correct given the fixed
  source_refs.** `runs[]` filter now uses `activity_type` (aliased from `modality`) which is a real
  field per `schemas.ts:765-767`. `session_type` was dropped from `retest_metrics[0].source_ref`
  per the 2026-08-18 fix; the `total_seconds` field exists at `schemas.ts:815`. The
  `avg_pace_500m_seconds` field exists at `schemas.ts:813`. Both retest metrics will populate
  correctly *when a real run is logged*. **Confirmed empty because no runs exist in the persona.**
- **`is_taper: true` badge / copy on Today or Week** — searched `text/01-today.txt` and
  `text/02-week.txt`: neither string appears. The persona is in base-check, so this is expected —
  cannot confirm the taper badge renders when it should.
- **Phase advance from base-check → threshold-build → taper across 45 days** — did not happen.
  `text/01-today.txt:22` shows "Base check · Weeks 1–2 · week 1 of 2 · ends 26 Aug" on day 45. Root
  cause is the missing `program_states` (no `phase_shift_days` re-anchoring the phases to the
  user's actual start date), not a code bug — but the visible-in-app symptom is still that a user
  can end up parked in Week 1 forever.
- **Confirm-first proposals on Coach** — `text/03-coach.txt` is just the "Coming soon" placeholder.
  Cannot verify.

## 6. Landing→app promise alignment

`landing/src/i18n/dictionaries/en.ts:57` — `rowing_pitch: "Six weeks to a 2K row PR."` — clean,
delivers on `program_goal.metric: row_2k_time_seconds` (`rowing-2k-test-prep.json:74`) and matches
the manifest's `what_you'll_achieve` at `manifest.json:128`. `stat_programs_value: "5 programs"`
(`en.ts:14`) — the catalog shows 5 shipped + 3 provisional per `text/06-programs.txt`, matches.

Gap: landing's `hero.h1` frames the product as "pick one thing you want stronger" — for a
race-prep user, "stronger" is off-vocabulary. That's a landing-copy question, not a rowing-program
question. The pitch line lands the goal correctly.

Contrast row copy is defensible for rowing: `row_scope_terav: "A focus arc. Rest stays yours."` +
`row_when_terav: "Every session, against your log."` both align with what the app delivers if the
user actually logs sessions. **Delivery gap: the app can't demonstrate "every session, against
your log" if the persona doesn't have logs — see P0-2.**

## 7. What worked

- **Evidence base is genuinely thorough.** 28 references at `rowing-2k-test-prep.json:630-864` plus
  two additional references (Bosquet 2007 as verified taper anchor, Steinacker 1998 replacing
  das_2019) at `:951-971`. Every principle (`principles[]` at `:17-43`) cites papers. Sixteen
  citations with `verification_status: "unverified"` are honestly flagged rather than hidden.
  `engineering_choices_flagged[]` at `:586-617` is unusually candid — the 6-week duration,
  1× threshold + 1× race-pace, 2-week taper, and Astorino extrapolation to rowing are all called
  out as engineering choices, not measured RCT findings.
- **`is_taper` + `block_replacements_final_week` authoring pattern is correct.** The JSON declares
  the substitution the schedule engine actually consumes at `schedule.ts:183-192`. Vector A
  confirmed this passes structural check.
- **mm:ss parser at `intake-tier.ts:363-370` and the `never` fallback at `:376-378`.** Small,
  well-scoped, testable.
- **`non_responder_classifier` at `:973-997` is honest about HERITAGE non-response.** The
  `true_non_response` copy explicitly names the options (finish honestly with lower target, extend,
  accept ceiling) rather than pretending everyone hits target.
- **`retest_metrics_mid_block[]` (`:999-1006`)** is a genuinely useful UX pattern for a
  taper-terminated arc — Week 3 is exactly when a user wants to know "am I on track". The
  metric_id name mismatch (P1-1) is the only thing stopping it from firing.
- **The two 2026-08-18 source_ref fixes are correct** — dropping `session_type` and switching
  `modality` → `activity_type` unblocked both retest queries against the shipping schema. Verified
  by reading `retest-evaluator.ts:87-101` (modality alias) and `schemas.ts:761-828`
  (activity_type + total_seconds + avg_pace_500m_seconds all present).
- **Safety gates (`intake.safety_gates[]` at `:259-292`) all resolve** — hypertension_unmanaged
  select → "yes"; exertional_syncope_history, chest_pain_recent, flaring_low_back booleans → "true"
  — matches IntakeClient's serialisation per `IntakeClient.tsx:1040-1088`.

## 8. Recommended fix order

1. **P0-1 — Suppress the "week 1 vs Week 6/7" contradiction on Today.** Add a reconciliation check
   in the retest-window computer: only render "END-OF-BLOCK RETEST WINDOW OPEN" when
   `program_states[slug].tier` is set AND the phase computed by elapsed days matches the phase
   computed by dates. Or simpler: hide the whole retest-window card when `program_states[slug] ==
   null`. `next-app/src/lib/engine/schedule.ts` + wherever the retest-window card is rendered on
   Today.
2. **P0-2 — Fix `persona-rowing` harness to run intake commit and log real runs.** Cannot audit
   downstream behavior otherwise. Emit `runs[]` with `activity_type` / `session_type` /
   `total_seconds` / `avg_pace_500m_seconds` matching the prescribed session; populate
   `program_states[slug]` as `IntakeClient.commit()` would.
3. **P1-1 — Rename `threshold_pace_500m` → `threshold_pace_500m_seconds` in
   `retest_metrics_mid_block[0].metric_id` (`:1001`) AND
   `non_responder_classifier.primary_signal_metric_id` (`:979`).** JSON-only, unblocks the
   non-responder classifier and the mid-block retest link.
4. **P1-2 — Replace free-text `current_2k_time` with a select using the enum values the tier
   evaluator already maps** (`sub_7`, `7_8`, `8_9`, `9_10`, `over_10`, `never`). Keep mm:ss as an
   optional exact-time secondary. Prevents "user typed a nonsense value → landed on Push tier"
   silent bug. Two-line JSON change.
5. **P1-3 — Surface `retest_metrics_mid_block[0]` on the Progress screen** so users see the Week 3
   threshold check is coming.
6. **P1-4 — Add a "Two hard test days baked in" strip to the preview page** — Week 1 open-2K and
   Week 6 test-day 2K.
7. **P2-4 — Fix Report "45g · 1050?" copy** to human-readable units.
8. **P2-2 — History heatmap: separate "morning check only" from "session logged".**
9. **P2-3 — Progress: surface `signal_completeness` copy** so users know what to log (HR, stroke
   rate).
10. **P1-5 (cosmetic) — Reorder intake JSON questions so screening gates come first in the file.**
