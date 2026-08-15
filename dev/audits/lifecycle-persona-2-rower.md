# Sara — 32, physio, sub-elite rower. 8-week arc into a corporate regatta.

Concept2 in the garage. 2K PR 7:52. Wants sub-7:40 for a regatta on 2026-10-25. Reads Seiler for fun. Chest strap on every session. If Terav cites Bosquet on the landing page, I want to see Bosquet in the evidence base — and I want the taper to look like Bosquet.

## 1. Promise ledger — 15 claims I'll hold you to

Pulled from the marketing surface + program preview + program JSON. Numbered so I can grade each one after I've actually gone through the flow.

| # | Claim | Where it lives |
|---|---|---|
| P1 | "Six weeks. A cleaner pull. A faster 2K." | `landing/src/lib/programs-catalog.ts:121` |
| P2 | "You care about splits, watts, and HR zones — not just 'feel'." | `landing/src/lib/programs-catalog.ts:132` |
| P3 | "You want a real taper, not just 'take it easy' the week before." | `landing/src/lib/programs-catalog.ts:131` |
| P4 | "Test-date-driven — enter your target date at intake and the whole phase structure shifts to end there." | `landing/src/lib/programs-catalog.ts:135` |
| P5 | Cites Bosquet 2007: "40-60% volume reduction with intensity held" | `landing/src/lib/programs-catalog.ts:146-148` |
| P6 | Cites Seiler 2010 polarised 80/20 | `next-app/public/data/programs/rowing-2k-test-prep.json:20-22,607` |
| P7 | Progression tier (8:00-9:00): "2K time down 8-15 seconds" | `landing/src/lib/programs-catalog.ts:153` and JSON `plan_tiers[]:57-58` |
| P8 | Retest = actual 2K time, "Log via the app — pace, split, and target time surface on the block card" | `landing/src/lib/programs-catalog.ts:150` |
| P9 | Weeks 5-6 taper: "volume drops 45%, intensity holds" | `landing/src/lib/programs-catalog.ts:135` (marketing) + JSON `phases[2]:362-370` |
| P10 | "48h between hard sessions" enforced | JSON `schedule_constraints.hard_day_separation_h:92` |
| P11 | ≥6h separation between hard cardio and heavy lift | JSON `schedule_constraints.interference_ceiling_h:93` |
| P12 | 6-hour pre-flight interference warning fires when logging | `next-app/src/components/workout/RunSlotCard.tsx:509-525` |
| P13 | Every rule the engine applies traces to a peer-reviewed primary source | `landing/src/app/evidence/page.tsx:154-155` |
| P14 | The catalog page fitFor "You have a 2K PR" — implies capacity gate on days-per-week + a 2K baseline | JSON `intake.questions:141-206` |
| P15 | "Sign up… complete the intake, and your first session is on Today within two minutes" | `landing/src/app/programs/[slug]/page.tsx:138-141` |

## 2. Walkthrough — signup to end of arc

### Signup
Standard email + 8-char password + two consents (terms, symptom-data). Clean. No PII friction. Fine for me.

### Empty Today
Signed in on a fresh account. Today shows "Pick a program to see your training maxes…" and a "Browse programs" CTA. No dark-pattern nudge, no upsell. Ok.

### Discover + filter
`/programs` — filter chip **"Engine & endurance"** is the label. Manifest has category IDs `endurance` mapped to that label. Filter works. I see Engine Builder + Rowing 2K + CSM. Rowing 2K card is teal, 6 weeks, PROVISIONAL amber chip on the app side (landing page doesn't mention the PROVISIONAL flag at all — that's a marketing-vs-app gap).

### Program preview (app-side)
`/programs/rowing-2k-test-prep`. Prerequisites shown ("Recommended background — not enforced"). Retest text present. **No tier picker** (rowing is `correlated_tier`, not multi-dim) — I go straight to intake. So far this contradicts the landing page's "Honest outcome ranges" table which shows Foundation/Progression/Push side-by-side — that table doesn't appear on the app-side preview. When I compare the two before starting, the app side is thinner. **Finding F1.**

### Intake
Nine questions. Answered:
- days_per_week = **5**
- current_2k_time = **7:00-8:00** *(bucket — see F2, I can't type 7:52)*
- erg_familiar = regular
- target_test_date = **2026-10-25**
- all safety gates: no / false
- consents: yes

`inferTier` runs. `SELF_REPORT_TO_NUMERIC["rowing-2k-test-prep"].current_2k_time["7_8"] = 450`. Push condition is `current_2k_seconds < 480`. 450 < 480, so I get **Push tier** — "2K down 3-8 seconds" (`plan_tiers[].typical_outcome`).

I'm gunning for 12 seconds off a 472-second baseline. The tier the engine assigns me promises 3-8s. My real answer of 7:52 is on the very edge of Push (472 < 480) but the enum's midpoint (450 = 7:30) actively over-classifies me. If the range were expressed honestly against my real time, I'd be labelled Progression (8-15s), which matches my goal. **Finding F2 — enum bucketing pushes users into a lower promised uplift.**

`phase_shift_days` computes: authored end 2026-09-23, my target 2026-10-25 → +32 days. All phase `starts` and `ends` shift +32. Result: `phase_1_base_check.starts` = 2026-09-14. **I signed up on 2026-08-13. For the next 32 days Today will render "Before the program starts."** No sessions, no plan, nothing to do. **Finding F3 — phase-shift math is wrong; it shifts start too, not just end.**

### First session
If I skip ahead to the phase_1 start date and pretend it's today, the block renders as **Zone 2 · Row**, 40-60 min, "Sustainable pace. HR ~70-78% max." Below it, a **RowingPersonalisedTargets** card computes my "Z2 split (approx.)": `(450/4) + 20 = 132.5s → 2:12/500m`. My actual 7:52 gives a real Z2 pace closer to 2:20. **The app's target split is 8 seconds/500m faster than my honest Z2 pace,** because the enum midpoint (7:30 = 450s) is used, not my real 472s. Every day the app quietly tells me I'm off-pace. **Finding F4.**

Below the block a "Log this session" scroll-anchor deep-links to the RunSlotCard.

### Logging (session type chips)
RunSlotCard is thoughtful for rowing: activity picker + session-type chips (z2 / technique / threshold / race_pace / 2K test / recovery) + 2K-time input + watts + HR. Two subtle traps:
- **Default activity_type = "run"** (`RunSlotCard.tsx:35`). Retest metric filters `activity_type == 'row'`. If I forget to tap "Row" in the activity picker, my 2K test gets excluded from the retest chart. Activity should default to `row` when active program is a rowing program. **Finding F5.**
- **Interference warning only fires for CSM + Engine Builder** (`RunSlotCard.tsx:514-516`). Not for me — correctly doesn't false-positive since rowing-2k doesn't declare interference against itself. P12 doesn't apply to Sara. **Verified — good.**

### Simulated 8-week log

Assume Sara restarts with `target_test_date` matching the authored 2026-09-23 (which she'd have to compromise on to get a session) — the F3 phase-shift bug forces this. Then:

- W1 Mon 2026-08-13, Z2, activity=row, session_type=z2: 45 min, 12.5 km, avg 1:48/500m at 165 bpm. *Note: felt fine.*
- W1 Tue technique 30 min. avg HR 138.
- W1 Wed 2K test (base): **7:52.4** (472s), avg 1:58/500m, avg HR 182, max 194. *Note: this is the number.*
- W1 Thu Z2 50 min 165 bpm.
- W1 Sat race-pace 6×500m at 1:58: rest 3:30. avg HR 187 on last piece. *Note: legs cooked.*
- W2: threshold 4×8min at 2:03/500m, rest 2:00. avg HR 176. + Z2 45min + easy recovery.
- W3-W5: Z2 x2, threshold x1, race-pace x1, easy 1x. Sara consistent, 5/5 sessions/week. HR at threshold trends 176→172 by W5 (nice — signal of aerobic adaptation).
- W3 mid-arc test: **7:47.2** (467s) — 5s down. Confidence rising.
- W6 (final week / taper) — **THIS is where I check P9.** The schedule loader (`schedule.ts:116-124`) checks `is_taper && phase.ends`, and if `daysToEnd <= 7`, applies `block_replacements_final_week`. Rowing 2K JSON declares `"block_race_pace_row": "block_easy_recovery"`. Confirmed **race-pace becomes recovery in the last 7 days**. Threshold sessions still run (they're on Wed of the final week per weekly_template).

**Bosquet 2007 sanity check:** Bosquet's meta calls for a 41-60% volume reduction with intensity preserved. The JSON hard-codes `duration_multiplier: 0.55` on the taper phase (`phases[2]:365`) — matches. **But intensity is NOT actually preserved:** race-pace (the highest-intensity block) is *replaced* with easy recovery in the final 7 days. Threshold survives. So intensity is partially preserved, not fully. That's a defensible engineering choice, but the landing page says "intensity held" (P9) — which is not what happens for race-pace-tagged sessions. **Finding F6 — taper marketing overstates intensity preservation.** More seriously, the Bosquet 2007 citation is on the landing page (P5) and the guide page but is **not in the Evidence page grouped citations** (`landing/src/app/evidence/page.tsx`). Sara searches for Bosquet in the "25+ primary sources · Aerobic physiology" section — no hits. **Finding F7 — cited on marketing, missing from Evidence page.** Same for **Seiler 2010** — cited in the JSON's `principles[0]` and `session_rationale` but not in the Evidence page listing. Every rule traces to a peer-reviewed source (P13) — except the two that anchor my whole taper and intensity distribution.

- W6 Sat test day = the `target_test_date`. Today renders the `variant="test"` RestDayCard: "Test day. The 2K test is on…" (`page.tsx:436-443`). **This works.**

- **Retest chart on Progress tab**: `RetestMetricsPanel` renders "row_2k_time_seconds" card. Baseline = 472 (first 2K test). Current = whatever my W6 test is. Target column shows `formatMetric(-3, "seconds")`. `formatMetric` uses `Math.floor(-3/60):(-3%60).padStart(2,"0")` = **"-1:-3"**. Rendered target: `-1:-3`. Not "−3s" or "−0:03". Same for Foundation tier target −15: `"-1:-15"`. **Finding F8 — retest target display is broken for negative-delta metrics. This is the hero surface. P0.**

### End of plan
After 2026-10-25 (or the authored 2026-09-23 if she didn't shift), `activePhaseFor` returns `phases[phases.length - 1]` — the taper phase — indefinitely. Today keeps drawing taper-week Z2/technique/recovery cards forever. There is no completion moment, no "here's what you did," no "next program?" prompt. `grep` for completion strings across the app: nothing. **Finding F9 — end-of-arc is undefined.**

### History tab, for a rower
The History page hardcodes:
- SymptomSpark for Groin, Low back, Buttock, Shoulder Right (`history/page.tsx:10-15`)
- Top-set weight for back_squat, front_squat, block_pull, deadlift (`history/page.tsx:17-22`)

None of this applies to me. I never lift barbell. The history view is 90% empty rows about symptoms of the hip program. **Finding F10 — History is unmodified for non-hip users.** No 2K-time chart, no HR trend, nothing rowing-specific. Report page is the same story: `SymptomLoadChart` only, plus a flat "Aerobic sessions in range" list grouped by session_type (this last part is good). No line chart of 2K time over time. P2 ("splits, watts, HR zones") is honored for logging inputs but not for viewing outputs.

## 3. Findings

### P0 (credibility-killing)

- **F3 — `phase_shift_days` shifts start of arc, not just end.** `next-app/src/lib/engine/schedule.ts:49-58` uniformly shifts every phase's `starts` and `ends`. For a target date > authored end, the entire program moves into the future and Today shows "Before the program starts" for weeks. For target date < authored end, the program shifts into the past and I skip phases silently. This is P4 broken. Fix: scale phase durations proportionally so `phases[0].starts = today` and `phases[last].ends = target_test_date`, or reject a target-date outside a supported window at intake.

- **F4 — RowingPersonalisedTargets uses enum midpoint, not the user's real 2K.** `next-app/src/app/page.tsx:372-380`. Sara answers "7:00-8:00" (only bucket available), map returns 450s (7:30). Her actual is 472s (7:52). Every displayed target split is 8 s/500m faster than her honest pace. Fix: add a numeric-input field for exact seconds, or replace the enum with a text field with mm:ss parsing (parseTimeToSeconds already exists in RunSlotCard).

- **F8 — Retest target column renders `−1:−3` / `−1:−15` for negative-delta seconds.** `next-app/src/lib/engine/retest-evaluator.ts:213-215` — `formatMetric` computes `Math.floor(-3/60)` = -1 and `-3%60` = -3. For a program whose *entire selling point* is retesting the actual 2K time, the target column is garbled. Fix: special-case negative values → `−0:03` or use signed formatDelta which handles this.

- **F7 — Bosquet 2007 and Seiler 2010 are cited by the program but NOT listed on `/evidence`.** `landing/src/lib/programs-catalog.ts:146` cites Bosquet; the JSON principles cite Seiler; `landing/src/app/evidence/page.tsx` (the page whose whole promise is "every rule the engine applies traces to one of these") lists neither. That's a direct violation of P13. Fix: add both entries to the Aerobic physiology group.

### P1 (embarrassing, not catastrophic)

- **F2 — `current_2k_time` enum over-classifies borderline athletes.** `intake-tier.ts:266-274` maps "7_8" bucket to 450s midpoint, which trips the Push tier's `<480` gate. A 7:52 rower gets promised only 3-8s uplift when Progression's 8-15s is what her goal actually asks for. Fix: use a numeric field OR set the "7_8" midpoint to 480 (the upper bound of the bucket, biased against Push) OR make the tier condition use the raw answer bucket instead of a proxy.

- **F5 — RunSlotCard activity_type default = "run" for rowing users.** `RunSlotCard.tsx:35`. If Sara doesn't manually tap "Row" every session, her 2K test filters out of the retest chart entirely (source_ref requires `modality == 'row'`). Fix: default activity to `row` when `activeProgramSlug === "rowing-2k-test-prep"`.

- **F6 — Taper claim "intensity held" is overstated.** Landing page (`programs-catalog.ts:135`, `programs-catalog.ts:146-148`) and JSON `principles.taper_last_week` both say "intensity held". Actual behavior (`schedule.ts:116-124` + JSON `block_replacements_final_week`) swaps race-pace → easy recovery in the final 7 days. Threshold survives. That's *most* intensity held, not all. Bosquet's meta is more precise: "training intensity should be maintained." Fix: either preserve race-pace on one day of final week, or clarify the marketing to "threshold intensity held; race-pace deferred to test day."

- **F1 — App-side program preview drops the "Honest outcome ranges" tier table.** Landing shows Foundation/Progression/Push side by side with expected 2K deltas. App-side preview (`ProgramPreviewClient.tsx`) doesn't. When Sara clicks through she gets less information than the landing page promised — a common bait-and-switch pattern. Fix: render `program.plan_tiers[].typical_outcome` on the app-side preview too.

- **F10 — History + Progress hardcoded to the hip program's schema.** `history/page.tsx:10-22` — regions + lifts are strings from the hip clinical context. For rowing users the sparklines are empty and irrelevant. Report page (`report/page.tsx`) only draws SymptomLoadChart. No 2K time line chart, no HR-vs-pace trend. This is P2 half-honored (input side yes, output side no).

- **F9 — No end-of-plan state.** `schedule.ts:80` returns the last phase forever after the final `ends` date. No completion card, no "start next program" suggestion, no summary. Sara finishes her regatta and the app never acknowledges it.

### P2 (small papercuts)

- **F11 — `daily_log_schema.row` field names in the JSON don't match the actual runLog schema.** JSON declares `avg_pace_500m` and `avg_hr_bpm`; schema uses `avg_pace_500m_seconds` and `avg_hr`. Nothing else reads `daily_log_schema` so it's inert documentation, but if a coach or another engine reads the JSON they'd wire the wrong fields.

- **F12 — Push tier's Sunday Z2 override works but isn't visible in preview.** `schedule.ts:107-109` and JSON `push_tier_override`. Sara's Push tier gets +1 Z2 on Sunday, but on the program preview she'd see the base week. Minor.

- **F13 — "engineering" flag is set on the Astorino 2013 cross-domain extrapolation.** JSON `engineering_choices_flagged[4]:634-637`. That's an honest tag, and Sara respects it. But the same tag is *not* set on the 6-week duration for a taper program — Mujika's meta-analysed tapers are 1-3 weeks, which the JSON acknowledges (`engineering_choices_flagged[2]:624-627`). The 6-week race-prep block is flagged as engineering. OK. This one is a "credit where credit is due" — the JSON is honest about its non-RCT choices when read carefully. Landing page glosses it.

## 4. What Sara would type on Reddit r/Rowing that night

> "Tried Terav for a corporate regatta prep. Reads Seiler and Bosquet on the landing page, and the JSON of the program actually cites them (I dug into the source). But their own Evidence page — 25+ aerobic physiology citations, allegedly — doesn't list either. Weird.
>
> Bigger issue: I put my target date 10 weeks out (regatta is early October) and the app shifted the whole 6-week arc to *start* 4 weeks from now. Not "extend base phase, keep taper at 2 weeks." Just moved it. I'm supposed to sit on my hands for a month.
>
> Their target-pace card told me my Z2 was 2:12/500m when my actual PR pace at 7:52 works out to 1:58 — turns out they bucket your intake time into 5 buckets and use the midpoint. My bucket (7-8) maps to 7:30. Every day the app thought I was faster than I am.
>
> Retest column showed my 2K target as `-1:-3`. I think they meant −3 seconds. Formatter bug.
>
> The taper actually works — race-pace gets swapped for recovery in the last 7 days, volume is 55% of authored duration. That part is fine. But 'intensity held' isn't quite what happens.
>
> Overall: the *thinking* is good — better than most trainer-influencer apps. The *execution* is beta. I'd come back in six months."

## 5. What's genuinely good — for the record

- **`shiftedPhases` implementing test-date-driven programming at all** puts this ahead of every generic rowing app. The concept is correct; the math is wrong.
- **`block_replacements_final_week` swap on `is_taper` phase** is real programming logic, not window dressing. The mechanism works.
- **`RowingPersonalisedTargets` idea** is right — most rowing apps give you generic pace prescriptions. This one tries to personalise. Just needs to read the real number.
- **`inferTier` is a real evaluator** — not string-matching, actual recursive-descent parsing of tier condition expressions, with a NOT operator, boolean literals, parens. Overkill for the current tier conditions, but the right shape for the future.
- **JSON's `engineering_choices_flagged` array** is the most intellectually honest thing in the whole stack. If a rower reads the JSON directly, they see exactly which choices are Mujika / Seiler / Astorino and which are "we picked the middle of a range." Nothing else in the fitness-app space does this.
- **Session-type chip + total-time + watts + HR in one card** on RunSlotCard is a good density trade for a data-native user.

Sara would keep watching this space. But she'd row her regatta from a spreadsheet.
