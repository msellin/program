# Persona 3 — Powerlifter on CSM (12 weeks)

## Persona recap

31 yo regional powerlifter (175/100/210). Coach said "add cardio, don't lose strength." Signed up because the landing promised "cardio without your squat suffering." Paranoid about interference; wants numbers, ranges, and honesty — not hype. Watching this app very closely.

## The load-bearing question

**"How do I know my squat isn't getting worse?"** — I could not answer this from the UI in 30 seconds at any point in a 12-week code walkthrough. That is the app's central promise for this persona and it isn't defended anywhere the user actually looks. **Blocker.**

## Blockers

- **B1. Squat-preservation surface does not exist.** Persona 3's whole reason for buying. `retest_metrics` (`back_squat_5rm_kg`, `submax_hr_pace5_bpm`) is declared in `public/data/programs/concurrent-strength-maintenance.json:847-914` with `source_ref`, cadence, tier targets. No component in the tree reads it. `grep -rn retest_metrics src/` shows only a schema declaration (`schemas.ts:442`) and a comment in `adapters/multi-dim.ts:18` promising Phase C. There is no retest card on Today, on Progress, or on Report. The Retest phase (`phase_3_test`, weeks 7-8) will render as generic strength/aerobic block headers with no evaluation UI.
- **B2. No TM series on Report.** `src/app/report/page.tsx:80,209` — every symptom / hip / provocateur / rehab-adherence section is gated `isHipProgram`. For CSM the only strength surface is a plain chronological list of top sets (line 422-453). No TM-over-time chart, no delta-from-baseline call-out, no comparison against `retest_metrics.back_squat_5rm_kg.baseline`. A powerlifter cannot open this and tell if her squat is holding.
- **B3. No HR trend on Report.** The alternate-branch (`report/page.tsx:229-275`) shows an unordered list of every logged session's raw fields. That's a log dump, not a trend. `submax_hr_pace5_bpm.aggregation = "trend_slope"` (window_days 28) is not computed anywhere.
- **B4. `strengthPrimaryPrograms = new Set(["anterior-hip-rebuild"])` at `SignalsStrip.tsx:57` and `DayAdjustmentProposal.tsx:80` — for CSM the notes-signal engine literally cannot propose anything. Persona 3 logging "squat felt heavy" three sessions in a row generates zero surfaces: no proposal card, no signals strip, no history mark. The engine reads it (note-signals.ts extracts "heavy" → `STIFF` regex → elevated fatigue), then throws the result away because the program isn't hip. This is silent.

## Bugs

- **G1. RunSlotCard duplicate `total_seconds` write.** `RunSlotCard.tsx:140` sets `total_seconds` from duration, then line 151 overwrites it with the 2K test time when both are present. If Persona 3 logs a Norwegian 4×4 with `total_seconds` = 28 min and also fills the 2K time field for a separate session, the 4×4 duration is wiped.
- **G2. `SignalsStrip.tsx:53-54` uses `store.scheduled_overrides` for "rescheduled session" but override composition on `page.tsx:107` only applies overrides to the primary program's *strength* blocks. If Persona 3 reschedules her Wed lift, the aerobic blocks that day still render — the override strip says "Rescheduled" but the actual layout ignores it for the aerobic slots.
- **G3. `note-signals.ts:213` — cardio fatigue detection triggers `high` on `cardioMinutes >= 90 OR cardioHardBucket >= 60 OR cardioHrMax >= 180`. A Norwegian 4×4 (~28 min total time, ~16 min hard time, HR ≥ 180 by design) will trip max HR ≥ 180 → high fatigue → propose `×0.90` next session. For a CSM user this is exactly correct — but B4 means the proposal is thrown away. So the code that DOES work for her use case never reaches her.
- **G4. Intake capacity gate reads `session_count_per_week_range[0] = 4` (`intake/IntakeClient.tsx:87-96`) but `schedule_constraints.available_days_min` is also 4. These are two different fields for the same idea. If a future edit changes one and not the other, silent drift.
- **G5. `intake-tier.ts:139` boolean-literal parsing rewinds `pos = start` then falls through to `parseTerm()`, which returns 0 for `true`/`false` idents (they're not in the vars map). `has_squat_prs == true` where user answered `false`: vars is `{ has_squat_prs: 0 }`, right-side `true` parses to 0, `0 == 0` → true. Silently misclassifies a user with no squat PRs as passing the `has_squat_prs == true` check. Test coverage in `intake-tier.test.ts` doesn't cover this path.
- **G6. Phase dates in `concurrent-strength-maintenance.json:234` are hard-coded starting 2026-08-12. A user starting on 2026-11-01 will be dropped into Phase 3 (Retest) on day 1 because `activePhaseFor()` picks the phase containing the date without a user-relative shift for non-test-prep programs. `phase_shift_days` (`IntakeClient.tsx:134`) is only computed when `target_test_date` is present — CSM has no such question.

## UX gaps

- **U1. Weekly template lands aerobic days on the SAME day as heavy lifts once per phase.** Never. Actually the CSM template is clean (Mon strength / Tue Z2 / Wed strength / Thu 4×4 / Fri Z2 / Sun Z2). But there is no visible enforcement of "6h separation" if the user drags a session or logs a 4×4 same day as heavy squat. `schedule_constraints.interference_ceiling_h = 6` is declared and read nowhere.
- **U2. RunSlotCard renders on every day including heavy-squat Mon and Wed with `useGenericSlot = true` (`RunSlotCard.tsx:31`). The generic copy is neutral ("Log an extra session"). For a powerlifter following CSM, this invites her to trash the plan: e.g. log a lunchtime run 3h before her Wed lift. No 6h warning fires. The hip-only `slotForDow()` at least warned "heavy squat day — keep conditioning light." Non-hip users lost this protection.
- **U3. No "how am I trending vs Schumann's −0.28" surface.** The program declares SMD −0.28 as its evidence bound six times in JSON. The number never reaches the UI. `principles[].detail` from the program JSON is never rendered anywhere. Persona 3 came here specifically for this number.
- **U4. Retest UI missing.** `phase_3_test` blocks `block_retest_hr` and `block_retest_strength` are rendered as generic Block cards with `note` text. There is no "record baseline / record retest / show delta" flow. Persona 3 has to eyeball her own log dump.
- **U5. Concurrent-training story is buried.** `program.rationale` and the "why lift 2×/wk", "why row not run", "why Z2 dominates" copy in `evidence_base.session_rationale` never renders. The Coach page has a canned prompt "Explain why today's prescription is what it is" but Coach is `coming soon`, so the answer never comes.
- **U6. Progress → Insights uses `SymptomLoadChart` with symptom keys `groin_left / buttock_left / low_back` (`report.ts`). For a CSM user with all-zero hip symptoms it will render a flat line labelled "peak morning symptom score" — meaningless.
- **U7. YourPlanCard on Today shows the plan summary but not the tier the user was placed in during intake. Persona 3 goes back after week 2 to check if she got "Progression" or "Push" — she has to visit /programs/[slug] to find out.

## Copy issues

- **C1. Landing promises "cardio without your squat suffering" and the app never repeats or measures this. Not on Program Preview, not on YourPlanCard, not on Report. The promise dies at the door.
- **C2. `page.tsx:162` — "Concurrent endurance + strength has known interference effects (Schumann 2022). Aim for ≥6 hours between sessions if you do both." — only fires when TWO PROGRAMS are active. For a CSM user (one program) this warning never appears, even though the same 6h rule applies within CSM.
- **C3. `intake/IntakeClient.tsx:229-232` — `KNOWN_SYMPTOM_HISTORY_IDS` includes `wrist_pain_12mo`, `joint_issues` — screening categories that don't apply to CSM's intake. Dead branches, but harmless.
- **C4. `report/page.tsx:157-159` "This is a self-tracked training log, not a diagnosis" is hip-context copy. For a powerlifter, "diagnosis" is meaningless framing. Should read "not medical advice" once, then the report starts.
- **C5. `intake` question labels for CSM are strong. `"Do you have a current back-squat 5RM you'd rather not lose?"` reads like the founder wrote it after coaching a real person. Keep.
- **C6. `SessionActions` / RestDayCard copy ("Optional work lives on the Extras tab") — Extras tab is anterior-hip legacy (accessories). For a CSM user, Extras is empty. Copy should be program-aware.
- **C7. `humanBlockName()` at `page.tsx:363` strips block-name parentheticals — good — but `block_retest_hr` renders as "Retest · Submax HR" which is opaque for a first-timer. Add a one-line "what this session is" beneath.

## Visual / graph issues

- **V1. Report Overview stat "Endurance sessions" (`report/page.tsx:176-182`) is a raw count with total km. For CSM the more meaningful stat is Z2 minutes vs hard-interval minutes (polarised distribution). Just a number is not useful.
- **V2. SymptomLoadChart on Progress → Insights renders a chart even when every symptom value is 0 (CSM users). Result: flat line at y=0 with a top-set weight overlay. Confusing.
- **V3. TM editor on Progress > Lifts includes `deadlift_conventional` (`page.tsx:24-29`) which is NOT in CSM's exercises (CSM uses `block_pull_midshin`). Persona 3 sees a TM row for a lift she doesn't do.
- **V4. `report/page.tsx:319` insight-info text: "The KPI no other strength app tracks: peak symptom score alongside top-set kg over time." — pure hip framing. For CSM this reads as marketing wank.
- **V5. `phaseProgress()` returns "Week 3 of 4 · ends 22 Sep" which is fine, but there's no linear phase progress bar showing where she is in the 8-week arc.

## Sub-tab specific findings

**Progress > Lifts.** Renders. TM editor works. But `PRIMARY_LIFTS` array is hardcoded — includes `deadlift_conventional` (not in CSM), missing `front_squat` (in CSM as `block_strength_moderate`). Should read from active program's TM-eligible exercises.

**Progress > Hip.** Correctly hidden for CSM (`page.tsx:118`). Good.

**Progress > Insights.** Renders `WeeklyNarrativeTile` + `SymptomLoadChart`. Weekly narrative is program-agnostic and OK. `SymptomLoadChart` is hip-specific (V2). Insights tab is where the CSM-specific concurrent-training story SHOULD live: submax HR trend, TM-vs-plan bar, Schumann −0.28 comparison. None of it is there.

**Report page.** Split at line 80 by `isHipProgram`. The non-hip branch drops symptom chart, hip check, provocateur incidents, rehab adherence — replaced by ONE aerobic session list (line 229). Load progression (line 421) is the only universal section and it's a chronological dump. No trend, no delta, no compare-to-baseline. Print CSS is present but the printed report will have almost nothing for a CSM user.

**Week tab.** Not walked here — but the same `blocksForDate()` drives it. Aerobic days should show a header + duration (verified).

## Positive callouts

- **P1. `strengthBlocksForDate()` was rewritten to return non-strength blocks for non-hip programs (`schedule.ts:266`). The comment explicitly names the CSM fix. Today DOES now render "Zone 2 · Bike" and "Norwegian 4×4 · Row" with duration + note.
- **P2. The RunSlotCard rowing/erg session_type + 2K test time + avg_watts fields (`RunSlotCard.tsx:438-494`) are actually there. Persona 3 can log a 2K test with pace-derivation.
- **P3. Intake tier inference for CSM works correctly. Traced: `cardio_hours_per_week = "3_6"` maps to 4.5 via `intake-tier.ts:250-257`; conditions evaluate cleanly; Progression tier selected. Boolean coercion for `has_squat_prs` works (path `lower === "true"` → 1).
- **P4. Capacity gate at `IntakeClient.tsx:87-96` blocks < 4 days with an honest "the evidence base doesn't back the outcome at this dose" message. This is the tone the persona wants everywhere else.
- **P5. `note-signals.ts:186-216` (RunSlotCard cardio-load signal) works — reads `runs[]` duration and HR, flags high fatigue on HR ≥ 180 or > 90 min total. The engine is correct. It's just gated off from doing anything for CSM.
- **P6. `program.intake.safety_gates` render as hard blocks (`IntakeClient.tsx:74-98`) — unmanaged hypertension, exertional syncope, flaring tendon all correctly stop the wizard.
- **P7. The concurrent-training rationale in the JSON is excellent: 32 citations, honest confidence labels (`realistic` vs `stretch`), HERITAGE non-response acknowledgement. If any of it reached the UI, this persona would love the app.

## Priority fix list

1. **Build the retest surface.** Any card that renders `program.retest_metrics` with baseline + latest + target + delta. Show on Progress > Insights and Report. Wire `source_ref` to actual store fields. Without this, "your squat won't suffer" is unfalsifiable.
2. **Ungate the notes-signal engine for CSM.** Either remove the `strengthPrimaryPrograms` set at `SignalsStrip.tsx:57` + `DayAdjustmentProposal.tsx:80`, or expand it. CSM has strength blocks; the engine's proposal ("take 10% off the top set today") is exactly right when signals fire. The Rehab-mobility protection comment in `DayAdjustmentProposal.tsx:16` already guarantees only TM_EXERCISES scale.
3. **TM series chart on Report for any program with `training_maxes`.** Line chart of TM over time per lift, red horizontal band at −2.5 kg (the persona's tolerance).
4. **HR trend chart on Report for any program with `retest_metrics.source = "run_field"`.** Submax HR at pace-5 over 28-day window.
5. **6h separation enforcement.** When logging a run/erg session and the same date already has a strength block scheduled, warn. When rescheduling a lift within 6h of a hard cardio, warn. Uses `schedule_constraints.interference_ceiling_h`.
6. **Concurrent-training story on Progress > Insights.** Render `program.principles`, `evidence_base.session_rationale`, `evidence_base.outcome_by_tier` for the user's tier. The Schumann −0.28 number in an "evidence bounds" card.
7. **RunSlotCard slot copy per-program.** For CSM: heavy lift days = "primary heavy squat / block-pull — no hard cardio within 6h". Aerobic days = "your Z2 / 4×4 slot; log it below."
8. **Hardcoded `PRIMARY_LIFTS` in Progress > Lifts (`page.tsx:24-29`).** Read from program.
9. **Tier / plan header on YourPlanCard.** "You're on Progression tier — targeting submax HR −8 to −15 bpm, strength held ±2.5 kg." Keeps the promise visible every day.
10. **Fix the `has_squat_prs == true` boolean-coercion silent-bug (`intake-tier.ts:139-148`).** When user answers "No", the `false == true` comparison should evaluate to false, not true. Add a test in `intake-tier.test.ts` covering the CSM tier map.

---

**Bottom line as this persona:** the JSON program is one of the best written concurrent-training prescriptions I've seen — accurate citations, honest confidence bounds, correct 6h separation, correct RPE 7 ceiling. But 90% of that quality lives in a file the user never sees. On the actual screens I'd use every day, I cannot find a single number that tells me whether my squat is holding. That's the reason I bought this app. That's the churn moment.
