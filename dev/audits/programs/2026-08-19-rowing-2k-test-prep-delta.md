# rowing-2k-test-prep · delta audit — 2026-08-19

Delta against `dev/audits/programs/2026-08-18-rowing-2k-test-prep-comprehensive.md`, testing the fixes
shipped in commits `65a397b`, `cccd609`, `df9b3a0`, `c70feba`, and the block-picker fix that
enabled realistic `runs[]` population. Personas at
`next-app/tests/e2e/artifacts/personas/persona-rowing/` (consistent-average, 17 runs, 45 days) and
`next-app/tests/e2e/artifacts/personas/persona-rowing-erratic/` (erratic, 12 runs, 33 skip days,
45 days). Read-only.

## 1. Verdict

Two of the four rowing-specific fixes landed cleanly (P1-1 metric_id rename, P1-2 conservative tier
fallback) and one landed partially (P1-9 morning-check glyph now says "45 green" / "45 amber"
instead of "45g · 1050?"). The P0-1 "two clocks" contradiction has mutated but not gone away: the
end-of-block retest banner + "YOU FINISHED" graduation card + reveal card ("Week 1 opens with z2
row") now render together on Today, which is worse UX than before, and P1-3 (Report defaults to
program-scoped range) regressed — the file still shows "Range: 21 Aug 2023 → 19 Aug 2026" (3Y) on
both personas, indicating the program-scoped default is racing hydration. `runs[]` populated
unlocks the threshold-pace retest for the first time (real Δ values render), which exposes a fresh
formatting bug (`++5s` double-plus) and shows the HERITAGE non-responder classifier still can't
fire because runs[] aren't dual-writing into `retest_readings`.

## 2. Fixed

### P1-1 · `threshold_pace_500m` → `threshold_pace_500m_seconds` in both consumer references

`next-app/public/data/programs/rowing-2k-test-prep.json:979` (`primary_signal_metric_id`) and
`:1001` (`retest_metrics_mid_block[0].metric_id`) both now read
`"threshold_pace_500m_seconds"`. Matches the metric declared at `:501`. Commit `65a397b`. This
unblocks the non-responder classifier's input wiring and the mid-block retest link — although the
classifier still can't fire for a separate reason (see §5).

### P1-2 · Tier fallback safety when free-text parse fails

`next-app/src/lib/engine/intake-tier.ts:385-391` declares:

```
if (vars[testVar] == null && ans != null && ans !== "") {
  const conservativeDefaults: Record<string, Record<string, number>> = {
    "rowing-2k-test-prep": { current_2k_seconds: 630 },
  };
  const def = conservativeDefaults[programSlug]?.[testVar];
  if (typeof def === "number") vars[testVar] = def;
}
```

Landed as authored. A user typing "N/A", "7 30", or "seven thirty" now defaults to 630s (Foundation
tier), not 0 (which matches Push tier's `current_2k_seconds < 480` gate). Commit `df9b3a0`. The
underlying UX (free-text field where an enum picker was clearly intended) is not fixed — the fallback
is a safety net around it.

### P1-9 · Morning-check glyph spelled out

`persona-rowing/text/10-report.txt:40` reads `45 green` (clean). Erratic:
`persona-rowing-erratic/text/10-report.txt:40` reads `45 amber` (clean). The tonight-audit garbled
"45g · 1050?" is gone. Commit `65a397b`.

### source_ref cleanup (structural, not persona-visible)

`rowing-2k-test-prep.json:506` (threshold pace) reads
`"runs[].avg_pace_500m_seconds where activity_type == 'row'"` — no `session_type == 'threshold'`
filter, `activity_type` not `modality`. The 2K time metric equivalent at `retest_metrics[0]`
similarly cleaned. The consistent-average persona's Progress + Report both surface a real
threshold-pace baseline (2:02) and current (2:07) — the metric query is executing against runs[]
end-to-end. First time this has been observable in the persona harness.

### Batch 2 · phase-remap fallback

`next-app/src/lib/engine/schedule.ts:63-90` runs the implicit shift correctly for
`persona-rowing`. Started_at 2026-07-01, authored phase_1.starts 2026-08-13, so shift = −43 days.
Shifted phase_3 ends 2026-08-10. Today (2026-08-19) is past all shifted phases, so
`activePhaseFor()` returns the last phase (`phases[phases.length-1]` at `schedule.ts:146`), giving
"Taper + test · Weeks 5–6" as today's phase header (`persona-rowing/text/01-today.txt:22`). That's
the intended graduation-fallback path.

## 3. Still broken

### P0-1 · "Today contradictory state" — mutated, not fixed

`persona-rowing/text/01-today.txt` shows FOUR mutually inconsistent time-anchors on the same
screen:

- Line 6-16: "Your Rowing 2k Test Prep plan is built. · Week 1 opens with z2 row." — the
  `YourPlanCard` reveal (`next-app/src/components/workout/YourPlanCard.tsx:99-113`). Still
  rendering on day 49 because `program_states.rowing-2k-test-prep.reveal_seen` is not set and the
  3-view auto-dismiss only accumulates via `localStorage`, which is empty on the persona
  harness.
- Line 22: "Taper + test · Weeks 5–6" — phase header (correct given phase-remap fallback).
- Line 24-28: "END-OF-BLOCK RETEST WINDOW OPEN · Week 7 · logging 2K row time (seconds)" — the
  retest-due proposal (`next-app/src/lib/proposals/select.ts:333` window is `[at_week,
  at_week+1]`). currentWeek=7, target at_week=6 → open. Correct semantically.
- Line 47-52: "YOU FINISHED · 2K row time reduction · 7 weeks logged. Nice." — graduation card
  fired because `isPastProgramEnd()` returns true (past shifted phase_3.ends 2026-08-10).

Four different clocks, four different weeks. The user is simultaneously told "week 1 opens with
z2 row", "you're in taper", "log the week-6 retest", and "you finished". Batch 2's phase-remap
fallback made the phase readout correct, but the reveal card and the graduation card were never
gated on program state. Recommended: hide `YourPlanCard` when `active_program_started_at` is >
one calendar week old, and hide the "END-OF-BLOCK RETEST WINDOW OPEN" banner once the user is past
all shifted phases (`isPastProgramEnd()` true).

The erratic persona shows the exact same four-way contradiction —
`persona-rowing-erratic/text/01-today.txt:6-52`.

### P1-3 · Report default range regressed

`persona-rowing/text/10-report.txt:10` reads `Range: 21 Aug 2023 → 19 Aug 2026` — 3-year span,
"all" preset. The code at `next-app/src/app/report/page.tsx:52-64` computes a program-scoped
default: with 45-49 elapsed days the correct preset is `"12w"` (28 < days ≤ 84 branch). But
`useStore.getState().store` is read once at initial `useState` — a hydration race. When the report
renders before the store rehydrates, `initialProgramStart` is undefined → `programScopedDefault` is
null → `initialLogCount` is 0 → fallback resolves to `"all"`. Fix: derive `preset` in a
`useEffect` that fires when `hydrated` flips, or bind to a `useMemo` on
`store.user_profile?.active_program_started_at`. Both personas regressed identically:
erratic `persona-rowing-erratic/text/10-report.txt:10` same.

### P1-3 · Mid-block retest still not surfaced on Progress

`persona-rowing/text/05-progress.txt:25-62` shows only the end-of-block `retest_metrics[]` cards
("CHECK AT WEEK 6"). `retest_metrics_mid_block[0]` (Week 3 threshold check,
`rowing-2k-test-prep.json:999-1006`) never appears. `next-app/src/components/progress/
RetestMetricsPanel.tsx:37` only reads `evaluateRetestMetrics(program, store, userTier)` — no
mid-block path. Users get no forward-looking cadence signal.

### P2-2 · History treats every calendar day as "active"

`persona-rowing/text/04-history.txt:10` — `0 strength · 45 active total`. With 17 runs logged, the
counter still counts morning-check-only days as "active". Erratic identical
(`persona-rowing-erratic/text/04-history.txt:10`). Same "0 done" per-day count line 39+ on both,
despite runs[] existing.

### Adherence counter blind to runs[]

`persona-rowing/text/05-progress.txt:19-21` — `0/25 done · 0% · 20 UPCOMING · 5 SKIPPED`. Persona
has 17 real runs. The Per-track adherence tile treats every logged row session as UPCOMING or
SKIPPED, never DONE. Erratic same: `persona-rowing-erratic/text/05-progress.txt:19-21` reads
`0/25 · 0% · 18 UPCOMING · 7 SKIPPED`. This is a bigger deal now that runs[] is populated —
adherence is the honesty surface for a race-prep arc and it's reporting zero for a user who
completed 68% of prescribed sessions.

### P0-2 residual · No `intake_answers`, no `phase_shift_days`, no `baseline_training_maxes`

`persona-rowing/final-store.json` `user_profile.program_states.rowing-2k-test-prep` = `{tier:
"foundation"}` only. Batch 3b (persona.tier flows through) landed the tier, but the harness still
doesn't emulate the rest of `IntakeClient.commit()`'s writes. That's why the phase-remap
fallback (Batch 2) has to carry the load — it does, but only because the JSON's `phases[0].starts`
happens to be a recent date. If the program's authored dates shift again the fallback re-anchors
correctly, but `intake_answers` is missing so `buildRevealCopy` (YourPlanCard) has no personalized
"Because you told us X" line.

## 4. New from erratic archetype

### 4.1 Erratic persona hits Foundation target by accident

`persona-rowing-erratic/text/05-progress.txt:52-60`: threshold pace baseline 2:05, current 2:02,
Δ −3s. Foundation target for threshold_pace_500m_seconds is −3s (`rowing-2k-test-prep.json:512`).
The erratic user hit target with 12 sessions logged (48% of prescribed). Root cause: the retest
evaluator picks first vs latest logged values, not test-day values. The erratic persona's random
pace values happened to trend downward. That's an artefact of persona fixture data, not the app —
but the surfaced consequence is that a 48%-compliant user gets an accidental "you hit target"
readout with no ceremony, which is exactly what the non-responder classifier was meant to gate.
Classifier can't fire (see §5) so nothing catches it.

### 4.2 History shows "SKIPPED" for prescribed sessions with no runs logged

`persona-rowing-erratic/text/04-history.txt:29-40` — "2026-08-13 Zone 2 · Row SKIPPED",
"2026-08-12 Threshold · Row SKIPPED", "2026-08-08 Race pace · Row SKIPPED", "2026-08-04
Technique · Row SKIPPED". Good — skip inference from empty `runs[]` days works. But those dates
are outside the phase-shifted window (past shifted phase_3.ends 2026-08-10), so the schedule
is imagining sessions past the program's end and marking them SKIPPED — inflates the skip count
in an already-graduated arc. Same taper-block-scope leak affects the consistent-average persona
too, whose Week view (`text/02-week.txt:31`) schedules "Threshold · Row" on Wed 19 Aug even
though phase_3_taper.blocks doesn't include `block_threshold_row`. Root cause: `blockIdsFromWeeklyTemplate`
at `schedule.ts:220-243` returns the weekly template's `block_threshold_row` for Wednesday without
checking that the current phase declares that block. Phase-scope filter is missing.

### 4.3 Non-responder classifier can't fire on erratic despite meeting `under_dosing` rule

Erratic: 12 runs / 25 prescribed = 48% compliance, threshold pace Δ = −3 (hit target). Consistent:
17 runs / 25 = 68%, threshold pace Δ = +5 (worsening). Consistent's numbers match the
`under_dosing` rule at `rowing-2k-test-prep.json:985`: `progress_ratio_at_mid_block < 0.4 AND
session_compliance_pct < 80`. Neither persona's Progress screen shows the "Room to push" chip.
`HeritageClusterChip.tsx:112-117` reads baselines from `store.retest_readings`, which is empty on
both personas even though `runs[]` has usable data. The classifier is architecturally cut off from
the data source that actually got populated. Dual-write path in
`RetestMetricsPanel.tsx:99-114` only fires on user submit, not on automatic run-log ingest.

### 4.4 Erratic Week view identical to consistent — no adaptation to sparse compliance

`persona-rowing-erratic/text/02-week.txt` scheduled Mon-Sat identical to consistent. There is no
"you skipped 4 last week — engine proposes lighter Wed" adaptation, no volume adjustment on the
Threshold day given the missed threshold day earlier. This may be by-design (confirm-first), but
the persona's Coach tab is still "Coming soon" (`persona-rowing-erratic/text/03-coach.txt:6`) so
even the propose surface is absent.

## 5. New adaptation evidence

### 5.1 Threshold-pace retest evaluator produces real numbers — first observable proof

`persona-rowing/text/05-progress.txt:47-60`: `Threshold pace / 500m · CHECK AT WEEK 6 · BASELINE
2:02 · CURRENT 2:07 · Δ ++5s`. `persona-rowing-erratic/text/05-progress.txt:47-60`: baseline
2:05, current 2:02, Δ −3s. The 2026-08-18 source_ref cleanup (`session_type` filter dropped,
`modality` → `activity_type` swap) is verified working against real runs. This is the first
persona-visible confirmation that `next-app/src/lib/engine/retest-evaluator.ts` end-to-end
returns baseline / current / delta for a non-hip program.

### 5.2 Delta rendering has a double-plus bug (NEW · P1)

`RetestMetricsPanel.tsx:165`:

```
${delta.value >= 0 ? "+" : ""}${formatDelta(delta.value, m.unit)}
```

`formatDelta` at `:240-247` already returns the signed string ("+5s" or "−3s"). The wrapper adds
another `+` in front of a positive value. Consistent-average's threshold pace worsened from 2:02
to 2:07, so `delta.value = +5`, and the panel renders `++5s` (see `text/05-progress.txt:60` and
`text/10-report.txt:78`). Erratic improved, `delta.value = −3`, so the wrapper adds nothing and
`−3s` renders correctly. Fix: drop the wrapper prefix at `:165`.

### 5.3 2K row time retest still has no data

Both personas' `runs[]` are `session_type: "z2" | "threshold"` only — none have
`total_seconds` set. The 2K time metric queries `runs[].total_seconds where activity_type == 'row'`
(`rowing-2k-test-prep.json:465` after source_ref cleanup). Result: `05-progress.txt:32-42` shows
`BASELINE — · CURRENT — · Δ —` on both personas. The block-picker fix populated Z2 and threshold
runs but did not populate `2k_test` / open-2K sessions. Persona harness needs an emitter for the
Week-1 baseline 2K and Week-6 test-day 2K to complete the retest coverage.

### 5.4 Aerobic volume weekly rollup is correct

`persona-rowing/text/10-report.txt:87-101` — "wk of 2026-06-28 · 1h 30m · 2 sessions · avg HR
140", etc. Weekly aerobic volume rollup accurately reports the runs[] data and correctly counts
hard sessions (1 hard on weeks with threshold logged). This surface works.

### 5.5 Per-run detail table renders

`text/10-report.txt:107-144` lists every threshold + z2 session with date, pace, minutes, HR. This
is genuinely useful specialist-facing content — the Report screen is halfway there for the
race-prep arc.

## 6. Landing→app residual gap

Landing (`landing/src/i18n/dictionaries/en.ts:57`) still promises "Six weeks to a 2K row PR".
The delivered app on day 49 (past graduation for a user who started 2026-07-01) shows
simultaneous "YOU FINISHED" + "END-OF-BLOCK RETEST WINDOW OPEN" + "Your plan is built · Week 1
opens with z2 row" — the landing promise cannot be verified from what the persona sees. The
`row_when_terav: "Every session, against your log"` promise now has partial evidence (threshold
pace evaluates against 17 real runs), but adherence tile reads `0/25 done · 0%` on that same
screen, contradicting the promise. Landing is honest; the app surface is not delivering the
signal.

## 7. Recommended next fixes (ordered)

1. **P0 · Fix the four-way Today contradiction.** Gate `YourPlanCard` on
   `active_program_started_at` age < 7 days OR `intake_answers` fresh. Gate the "END-OF-BLOCK
   RETEST WINDOW OPEN" banner on `!isPastProgramEnd()`. Alternatively, once
   `isPastProgramEnd()` is true, hide everything except "YOU FINISHED" + one CTA.
   Files: `next-app/src/app/page.tsx`, `next-app/src/components/workout/YourPlanCard.tsx`.

2. **P1 · Adherence counter must count runs[] as DONE.** `0/25 done` for a user with 17 real runs
   is the biggest honesty failure now that adaptation surfaces work. Trace the "per-track
   adherence" pipeline and route logged `runs[]` into the DONE count for the matching
   `activity_type: row` days. File: whatever powers the "rowing 2k test prep 0/25 done" row on
   Progress; search for `UPCOMING · SKIPPED`.

3. **P1 · `++5s` double-plus bug.** Drop the `${delta.value >= 0 ? "+" : ""}` prefix at
   `next-app/src/components/progress/RetestMetricsPanel.tsx:165`. `formatDelta` already signs.

4. **P1 · Report preset hydration race.** Move preset computation into a `useEffect` that fires
   on `hydrated` flip in `next-app/src/app/report/page.tsx:62`. Otherwise `programScopedDefault`
   silently resolves null on cold render and every fresh open shows 3Y.

5. **P1 · Non-responder classifier can't see run data.** Either (a) dual-write
   `retest_readings` from `runs[]` ingest for metrics whose `source_ref` resolves against runs,
   or (b) rewrite `collectBaselines` in `HeritageClusterChip.tsx:112` to read via
   `evaluateRetestMetrics` / retest-evaluator's data path. Right now classifier is architecturally
   cut off from the only populated data source.

6. **P1 · Phase-block-scope filter in `blockIdsFromWeeklyTemplate`.** If `phase.blocks` doesn't
   include the block id the weekly template resolves to, either substitute from the phase's
   allowed set or return empty. Currently the schedule engine happily returns
   `block_threshold_row` in the taper phase which doesn't declare it. Files:
   `next-app/src/lib/engine/schedule.ts:220-243`.

7. **P1 · Surface `retest_metrics_mid_block[]` on Progress.** Small card under the end-of-block
   metrics: "Mid-block check at Week 3 · threshold pace". File:
   `next-app/src/components/progress/RetestMetricsPanel.tsx`.

8. **P1 · Persona harness must emit `total_seconds` on Week-1 baseline and Week-6 test-day
   runs.** Without this the 2K row time retest — the primary metric — stays empty and the arc's
   flagship signal can't be verified.

9. **P2 · History "45 active total" vs "0 done" is inconsistent.** Once runs count as DONE
   (fix #2), the heatmap and log rows should reflect that instead of showing "0 done" for a day
   with a real run logged.

10. **P2 · YourPlanCard reveal-seen persistence.** The 3-view cap uses only localStorage; on
    persona harness / cross-device sync this never expires. Route dismissal through
    `program_states[slug].reveal_seen` so KV-sync users get the same expiry.
