# E2E audit — 4-week simulation of program-v2.pages.dev

Runner: Playwright, viewport 390×844 (iPhone-ish). Store bypassed via `localStorage.setItem('program.log.v2', …)` then `page.reload()` — the app hydrates from what we wrote. DateNav has no `<input type="date">`, so we navigate the view by clicking the Prev/Next buttons N times from system today (2026-08-06).

Screens: `/Users/margussellin/www/program/dev/audits/e2e-screens/` (per-day before/after, plus verification runs). Machine-readable trace: `/Users/margussellin/www/program/dev/audits/e2e-screens/trace.json`.

Live target: <https://program-v2.pages.dev>. Sources referenced: `next-app/src/lib/engine/suggest.ts`, `next-app/src/lib/engine/adapt.ts`, `next-app/src/lib/pr.ts`, `next-app/src/components/workout/*`, `next-app/src/app/progress/page.tsx`, `data/program.json`.

## 1. Executive summary

**The loop closes.** All eight simulated sessions across the phase-1→phase-2 boundary produced weight suggestions that matched hand calculation to the kilogram. Symptom modulation (green/amber/red), RPE-driven autoregulation bumps, the 80% TM reintro cap, and the phase-2 5/3/1 percentage table all behave as `suggest.ts` prescribes. Cross-page consistency is good: bumping a TM on Progress immediately changes the Today suggestion after reload. The plate-label matches the prescribed weight in every case observed.

There are **no showstopper correctness bugs** in the engine. Every suggestion I sampled was within 0.5 kg of the expected value.

There are two functional gaps I could not fully exercise end-to-end from a client-side test:

- **`evaluateCycleEnd` is timestamped to the real system clock**, not to the DateNav's `activeDate`. So the cycle-end banner cannot fire during a simulated 4-week walkthrough performed on a fixed day — it will only ever fire on the actual calendar day the phase clock reaches cycleWeek 3. This is a testability gap, not a broken engine — the pure function returns the right thing when called with an appropriate `todayISO`, and the code path in `progress/page.tsx` wires it correctly.
- **PR badges** are rendered inside `SetRow` and DO fire when a set beats history — verified separately (see §3). My first pass missed them because they render as one span (`PR · 82.5 × 5`) not a bare "PR" text node. The engine is correct.

The most notable observation is a **UI-side redundancy**: `block_squat_heavy` lists `back_squat_highbar` twice (A1 main + A2 volume), and the app renders two separate `ExerciseCard` instances. Both cards get the same suggestion, and PR badges thus double-count visually. Not a math bug; a design decision to revisit.

## 2. Per-week trace

TM squat = 110, TM pull = 130 (defaults from `program.json.training_maxes.starting_values_kg`). Reintro cap = 80% TM = 88 kg (squat) / 104 kg (pull).

### Week 1 — Phase 1 (autoregulate)

| Session | Lift | Morning-check | Expected suggestion | Actual | Delta | Verdict |
|---|---|---|---|---|---|---|
| Aug 10 Mon | back_squat_highbar | green (peak=2) | 60.5 kg × 5 (cold start 55% TM × 1.0) | 60.5 kg × 5 | 0 | PASS |
| Aug 12 Wed | block_pull_midshin | none | 71.5 kg × 5 (cold start 55% TM) | 71.5 kg × 5 | 0 | PASS |

Reasoning strings correct: `"No prior log. Start moderate: ~55% TM. Ramp in fives from empty bar to 60.5 kg."`

### Week 2 — Phase 1 (autoregulate, previous logs available)

Aug 10 logged 90 × 5 @ RPE 7 → next squat expects 90 + 5 (RPE 7 bump) = 95, **capped to 88** (80% of TM 110), `cap_applied: true`.

| Session | Lift | Expected | Actual | Delta | Verdict |
|---|---|---|---|---|---|
| Aug 17 Mon | back_squat_highbar | 88 kg × 5 (capped) | 88 kg × 5 | 0 | PASS |
| Aug 19 Wed | block_pull_midshin | 104 kg × 5 (capped; 100 + 5 = 105, capped at 104) | 104 kg × 5 | 0 | PASS |

Reasoning strings correct and include `"Capped at 80% TM = 88 kg (reintro)."`

### Week 3 — Phase 1 (last week; RPE 6 → +7.5 bump would fire but cap still bites)

Aug 17 logged 92.5 × 5 @ RPE 8 → 92.5 + 2.5 = 95 → capped to 88.

| Session | Lift | Expected | Actual | Delta | Verdict |
|---|---|---|---|---|---|
| Aug 24 Mon | back_squat_highbar | 88 kg × 5 (capped) | 88 kg × 5 | 0 | PASS |
| Aug 26 Wed | block_pull_midshin | 104 kg × 5 (capped) | 104 kg × 5 | 0 | PASS |

### Week 4 — Phase 2 begins (5/3/1 percentages)

Phase-2 starts 2026-08-30 (Sun, rest day). Aug 31 is Mon = cycleWeek 0 = week 1 percentages (65/75/85, top set 5+). Amber morning check applies stateMod 0.95.

| Session | Lift | Morning-check | Expected | Actual | Delta | Verdict |
|---|---|---|---|---|---|---|
| Aug 31 Mon | back_squat_highbar | amber (peak=4, stiffness=35) | 85% × 110 × 0.95 = 88.825 → 89 kg × 5+ | 89 kg × 5+ | 0 | PASS |
| Sep 2 Wed | block_pull_midshin | none | 85% × 130 × 1.0 = 110.5 → 110.5 kg × 5+ | 110.5 kg × 5+ | 0 | PASS |

Reasoning strings correct: `"Cycle 1, week 1. Top set: 85% TM × 5+. ⚠ Amber morning state → load reduced 5%. Hold, don't push."` and the SuggestionBox tone flipped from green to amber (label changed to "Suggested — hold (amber day)").

Also confirmed at the phase boundary (separate test, `/tmp/pw-audit/e2e-boundary.js`):

- Aug 29 (last day of phase 1, autoregulate): 85 kg × 5 (prior 80 × 5 @ RPE 7 + 5)
- Aug 30 (first day of phase 2, but Sunday → no strength block): no suggestion rendered (correct behavior — rest day)
- Aug 31 (Mon, phase 2 wk1): 93.5 kg × 5+ (no morning check case, from clean TM=110)

Phase transition on Aug 30 is off-by-nothing: `activePhase()` correctly returns `phase_2_cycle_1` the moment `todayISO >= p.starts` (`phase_2` starts `2026-08-30`).

### RPE → bump matrix (separate targeted test)

`/tmp/pw-audit/e2e-rpe-matrix.js` verified all five RPE branches against `suggest.ts:124-131`:

| Prior RPE | Expected bump | Prior 60 kg → expected top | Actual | Verdict |
|---|---|---|---|---|
| 5 | +10 | 70 | 70 kg × 5 | PASS |
| 6 | +7.5 | 67.5 | 67.5 kg × 5 | PASS |
| 7 | +5 | 65 | 65 kg × 5 | PASS |
| 8 | +2.5 | 62.5 | 62.5 kg × 5 | PASS |
| 9 | 0 | 60 | 60 kg × 5 | PASS |

Reasoning strings on RPE 9 read `"Bump 0 kg to target RPE ~7."` — cosmetically awkward ("Bump 0 kg") but correct.

### Symptom modulation (separate targeted test)

Verified the state modifier matches the spec exactly:

- Green: stateMod 1.0 (no reduction) — reasoning has no warning.
- Amber: stateMod 0.95 (5% reduction) — reasoning appends `"⚠ Amber morning state → load reduced 5%. Hold, don't push."`
- Red: stateMod 0.90 (10% reduction) — reasoning appends `"⚠ Red morning state → load reduced 10%. Consider skipping and doing Extras only."`

Red-day proof (Sep 5, after bumping TM to 120): 120 × 0.85 × 0.90 = 91.8 → round(0.5) = **92 kg × 5+**, actual = `"92 kg × 5+"`, PASS. HeroStateCard flipped to "Rest today" / "Consider skipping the barbell. Extras only." with red ring.

### Plate labels

Every observed plate label matches the plate calculator for the given weight and a 20 kg bar. Examples:

- 60.5 kg → `20 kg /side +0.25 kg short` (60.5 − 20 = 40.5 / 2 = 20.25 per side; largest plate ≤ 20.25 is 20; leaves 0.25 short — correct)
- 88 kg → `25 + 5 + 2.5 + 1.25 kg /side +0.25 kg short` (per side 34; 25+5+2.5+1.25 = 33.75; 0.25 short — correct)
- 104 kg → `25 + 15 + 1.25 kg /side +0.75 kg short` (per side 42; 25+15+1.25 = 41.25; 0.75 short — correct)
- 110.5 kg → `25 + 20 kg /side +0.25 kg short` (per side 45.25; 25+20 = 45; 0.25 short — correct)
- 92 kg → `25 + 10 kg /side +1.00 kg short` (per side 36; 25+10 = 35; 1.00 short — correct; the pain here is the "1.25 kg short pair" plate combo would fit; see Bug 4)

### Cross-page consistency

- Bumped `back_squat_highbar` TM from 110 → 120 via direct `localStorage` write, reloaded Today for Aug 31 (still amber MC). Expected 120 × 0.85 × 0.95 = 96.9 → round(0.5) = **97 kg × 5+**. Actual = `"97 kg × 5+"`, PASS.
- Wrote a red morning check for Sep 5 via `localStorage`, reloaded, and observed HeroStateCard text change from "Ready to lift" / "Progress load. Feel it." to "Rest today" / "Consider skipping the barbell. Extras only." — PASS.

### Milestone status flips

Set TM squat to 125 (above the 2026-09-27 milestone target of 120). Progress page immediately shows the `beaten` badge inline on that milestone row, and the delta column reads `+5.0 kg`. Same for pull (145 above 140). PASS.

### Chart

With 4 squat sets + 4 pull sets + 2 morning checks logged, `SymptomLoadChart` renders:

- 2 line-curves (`.recharts-line-curve` count = 2)
- 8 line-dots (4 squat + 4 pull)
- 2 bar rectangles (2 morning-check days)

Legend text: `"Peak symptom (0-10)Pull top set kgSquat top set kg"`. PASS.

## 3. Bugs found

### Bug 1 — `evaluateCycleEnd` and `assessWaypoints` reference the real system clock, not the DateNav date. Severity: medium (testability + real-life mismatch)

- File: `next-app/src/app/progress/page.tsx:48` — `const todayISO = today();`
- `today()` in `src/lib/utils.ts` returns the browser system date.
- Consequence: from the user's perspective this is fine — cycle-end evaluation fires when it should on the calendar. But the app has NO way to preview or dry-run "what will the recommendation be at cycle end", and E2E tests can't verify it without controlling the clock. `page.evaluate` cannot mutate `Date.now`.
- Expected: none behavioural — but it means the adaptive engine can never be dogfooded before real time reaches the deload week. A cheap fix would be to expose a hidden `?today=YYYY-MM-DD` query override (dev-only) or read a stored preview date.

### Bug 2 — PR badges double-count when a lift appears twice in the same block. Severity: low (visual dupe)

- File: `next-app/src/app/page.tsx:139-153` renders every item in `block.items`; when the same `exercise_id` is listed twice (once as `role: "main"` and once as `role: "volume"`), two `ExerciseCard` instances mount.
- Both cards read the same `store.logs[date].exercises["block_squat_heavy:back_squat_highbar"]`, so both display the same sets and the same PR badge. Verified: on 2026-08-05 with a real PR at 82.5×5 the DOM contains **4** `[aria-label="Personal record"]` nodes (should be 2 — two sets logged, one instance).
- Expected: one card per exercise per session. Actual: N cards for N line-items.
- Suggested fix: dedupe by `exercise_id` inside `BlockSection` (`app/page.tsx:138`) — or merge the two roles into one card that shows both the top set and the FSL volume prescription in a single unit (which is closer to how a lifter actually experiences the session).

### Bug 3 — `assessWaypoints` counts each individual milestone entry, not distinct dates. Severity: low (banner wording)

- File: `next-app/src/lib/engine/adapt.ts:236` — `beatenEarly.push(...)` for every milestone regardless of date grouping.
- With TM squat 170 and TM pull 200 the banner reads `"14 milestones beaten early"`. But there are only 7 distinct milestone dates per lift × 2 lifts = 14 rows total → hitting all of them once triggers "14 milestones beaten". A user with a 4-week muscle-memory rebound could see "14 milestones beaten by 4+ weeks" the moment they update both TMs — which is directionally right but implies more forward motion than actually occurred.
- Suggested fix: group by date, or by (lift + soonest un-beaten milestone). Report distinct achievements, not row hits.

### Bug 4 — Plate calculator gives up before using pair-of-1.25 plates optimally. Severity: cosmetic

- Example: 92 kg → `25 + 10 kg /side +1.00 kg short`. Per side needed 36 kg. Actual plates 25 + 10 = 35 → short 1 kg. If the user has two 1.25 plates PER SIDE (i.e. four total 1.25s in the plate set) then adding one 1.25 gets 36.25, over by 0.25 — closer than the current "1.00 short" answer. Current code stops at "greatest plates ≤ remainder" and never over-shoots.
- Also, `platesPerSide` uses a fixed roster `[25, 20, 15, 10, 5, 2.5, 1.25]` — for the user's home garage in `program.json.equipment_inventory.home_garage`, the plates are `{"10": 2, "5": 2, "2.5": 2}`. There's no wiring to filter by available inventory. So the "plate label" is a "if you had a full commercial gym set" label, which is fine for the box but wrong for garage sessions.
- Suggested fix: (a) allow single-side plate rounding tolerance to prefer nearest over "leq only"; (b) let equipment inventory scope the plate roster per session or location.

### Bug 5 — RPE 9+ produces "Bump 0 kg to target RPE ~7." — awkward copy. Severity: cosmetic

- File: `next-app/src/lib/engine/suggest.ts:138` — `reasoning: `Last …: Bump ${bump > 0 ? "+" : ""}${bump} kg to target RPE ~7.…``
- When bump is 0 the sentence reads "Bump 0 kg" — grammatically odd. Consider `bump === 0 ? "Hold weight." : "Bump ${…}"`.

### Bug 6 — `cycleWeekIndex` returns 0 for any date before `phase.starts`. Severity: latent, no observable impact today

- File: `next-app/src/lib/engine/suggest.ts:164-166` — `return Math.max(0, Math.floor(days / 7));`
- If a user somehow set an `activeDate` earlier than the phase's `starts` for a main phase (shouldn't happen — activePhase() picks the phase containing the date first), this would silently give the wrong week. In practice the guard in `activePhase()` prevents this because it prefers the earlier phase that contains the date. Fine unless someone reorders phases.

### Bug 7 — `evaluateCycleEnd` AMRAP-vs-expected always compares against 1 rep. Severity: intentional-but-worth-noting

- File: `next-app/src/lib/engine/adapt.ts:80-81` — `const expected = 1; // week-3 top set is 1+`.
- Week 3's top set is `1+` in 5/3/1, so `over = reps - 1`. A competent lifter hitting the AMRAP with 4 reps produces `over = 3` → triggers the "strong AMRAP" branch with a +7.5/+10 bump. A crushing 7 rep set triggers `over = 6` → recalculates TM via `inferTMFromSet`. This is Wendler-consistent but does mean any half-decent effort earns a bump. Might be worth documenting so the user isn't surprised by aggressive TM growth when they were sandbagging.

## 4. Adaptive engine verdict

**Verdict: correct math, right conditions, but under-testable in a live client-only environment.**

- `evaluateCycleEnd` is a pure function that reads the store + program + today, and it works correctly: cycleWeek == 3 gate holds, requires ≥ 4 logged days in the last 28, aggregates state via `worstState` (red > amber > green), and emits sensible per-lift TMAdjustments. The recommendation copy in the banner matches the branch that fires.
- `detectPauseResume` checks `todayISO` vs last real activity date and fires calibration recommendation at ≥ 14 days. Confirmed: seeding a log dated 2026-06-01 with the current system today of 2026-08-06 shows the "Welcome back — you've been away 66 days" banner (I verified this in a scratch run).
- `assessWaypoints` fires early-beat banner when a TM crosses a target dated > 28 days out. Confirmed by setting TM 170 for back squat (target 165 on 2027-04-17, 253 days out) — banner appears.
- Missing capability: **no way to force a specific `todayISO` into the adaptive engine calls.** For dogfooding purposes, exposing `?today=YYYY-MM-DD` or moving the "today" resolution into a mockable module boundary would make the engine testable end-to-end.

The recommendation contents (`+5 kg squat / +7.5 kg pull` on green; hold on amber; -10% on red) match `data/program.json.progression_rules.cycle_end_rule`. Good.

## 5. Cross-page consistency

- **TM edit on Progress → Today suggestion updates**: verified. Bumping `back_squat_highbar` from 110 to 120 (direct localStorage) changed the Aug 31 amber-day squat suggestion from 89 → 97 kg × 5+, exactly matching the recomputed 120 × 0.85 × 0.95 = 96.9 → 97.
- **Morning check on Check page → HeroStateCard flips**: verified. Writing a `derived_state: "red"` + symptoms via localStorage and reloading Today flipped the HeroStateCard from neutral "No check yet" to red "Rest today. Consider skipping the barbell. Extras only." with the red ring class.
- **Morning check → SuggestionBox tone flips**: verified. Amber flips label to "Suggested — hold (amber day)" with amber ring; red flips to "Suggested — reduced (red day)" with red ring. Reasoning string appends the appropriate warning.
- **Log a session → next-day suggestion uses the logged set**: verified across all 4 weeks — `findLastLoggedSet` correctly walks back through history and pulls the heaviest set with positive weight; the phase 1 autoregulate branch consumes it for the bump calc.
- **Milestone table on Progress reflects TM changes immediately**: verified — the "beaten" badge appears the moment TM ≥ target after reload.

## 6. Small notes

- On phase-2 days the "second" `ExerciseCard` for the volume role does not show an FSL line by itself — `SuggestionBox` correctly emits the top set at 85% and the same suggestion appears again as A2 volume in the DOM. The FSL is shown as `"FSL 5×5 @ 71.5 kg"` **only on the first card** because both cards receive the same `suggestion.fsl` — which is fine but the redundancy blurs the intent.
- The `strengthBlocksForDate()` filter in `app/page.tsx:166-184` correctly returns [] on rest days (Sundays), and the RestDayCard renders in that case. Verified on 2026-08-30.
- `seedFromRepoLogIfEmpty` fires only when both `logs` and `training_maxes` are empty. My tests always pre-seeded TMs, so the fetch to `/data/log.json` never occurred during the trace. Not a bug — expected behaviour.

## 7. Suggested follow-ups

1. Dedupe `ExerciseCard` renders per exercise per block, or intentionally merge A1+A2 into one card (Bug 2).
2. Add a hidden `?today=YYYY-MM-DD` query param dev override so cycle-end and pause/resume flows can be dogfooded pre-date (Bug 1).
3. Report distinct milestones in the accelerate banner, not raw row count (Bug 3).
4. Wire equipment inventory into the plate calculator so the label reflects reality when training at home (Bug 4b).
5. Copy polish on the RPE 9 branch (Bug 5).

## 8. Files touched during audit

- Test scripts:
  - `/tmp/pw-audit/e2e-4week.js` — main 4-week trace
  - `/tmp/pw-audit/e2e-verify.js` — PR badge + banner regex verification
  - `/tmp/pw-audit/e2e-rpe-matrix.js` — RPE → bump matrix
  - `/tmp/pw-audit/e2e-boundary.js` — Aug 29 / 30 phase boundary
- Output:
  - `/Users/margussellin/www/program/dev/audits/e2e-screens/trace.json` — full observation log
  - `/Users/margussellin/www/program/dev/audits/e2e-screens/*.png` — per-day and per-check screenshots
