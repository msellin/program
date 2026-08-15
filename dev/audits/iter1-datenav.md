# DateNav + Phase-Routing Audit (Iter 1)

**Target:** https://program-v2.pages.dev
**Under test:** `next-app/src/app/page.tsx` — `strengthBlocksForDate()`, `activePhaseFor()`
**Data:** `data/program.json` phases 1–7
**Method:** Playwright + `?today=YYYY-MM-DD` override, Europe/Tallinn, iPhone 14 viewport. 47 dates inspected + 100-tap perf loop + reload check. Data: `iter1-datenav-shots/findings.json`. Screenshots: `iter1-datenav-shots/`.

## Summary

- **Critical: 4** — Phase 4→5 gap misroutes to Phase 7; `block_peak_singles` never renders; race Sat routes as training; Phase 7 no-day-prefix fallback silently pins to Monday.
- **High: 3** — Phase 1 Day 1 shows Rest (bad onboarding); Phase 1 Thursday routing contradicts `week_by_week` (Thu = front squat); race week Aug 24–29 has no light/rest treatment.
- **Medium: 3** — Reload does not preserve viewed date; Home button jumps to overridden `today()` under `?today=` (PWA bookmark hazard); Phase 5 first day (Tue Jan 5) renders as Rest with no phase-change banner.
- **Low: 2** — Pre-program guard uses string compare + optional chain, silently degrades on missing data; `DateNav.shift()` uses `toISOString().slice(0,10)` instead of local `iso()` helper — safe by noon-anchor but inconsistent with the utility.

**Transitions broken:** Phase 4→5 (gap), Phase 6 peak-window, pre-Phase-1 Day 1, Phase 1 race Sat.
**Transitions correct:** Phase 1→2 (Aug 29/30), 2→3 (Sep 27/28), 3→4 (Oct 25/26 across DST-end), 5→6 (Mar 28/29 across DST-start), 6→7 (Apr 24/25).

---

## CRITICAL-1 — Gap between Phase 4 and Phase 5 falls through to Phase 7

**Repro:** `?today=2026-12-21`, `12-25`, `12-28`, `2027-01-01`, `01-04`.
**Observed:** Phase header reads "Post-birthday — ongoing progression" on all five dates. Mondays in the gap render `block_squat_heavy`; would-be-Saturdays render `block_squat_volume`.
**Expected:** Per `phase_5_hatch_specialise.note_holiday_gap`: "Dec 21 – Jan 4 is a light/holiday period. Optional 2 sessions/week at 60% TM." App should show a bridge card, not the post-birthday programme six months early.
**Root cause:** `page.tsx:217–227` `activePhaseFor()` returns `phases[phases.length-1]` for any date past the last dated phase. No representation of the gap.
**Fix:** Detect `dateISO > prev.ends && dateISO < next.starts` and return `undefined` (or a synthetic bridge phase driven by `note_holiday_gap`).

## CRITICAL-2 — `block_peak_singles` never renders

**Repro:** `?today=2027-04-20` through `04-24` (declared 1RM test window).
**Observed:** Mon `block_squat_heavy`, Wed `block_pull_heavy`, Thu `block_squat_variant`, Sat `block_squat_volume`. `block_peak_singles` is unreachable in every screenshot `10_*` and `11_*`.
**Root cause:** `page.tsx:16–21` — `MAIN_PHASE_IDS` includes `phase_6_peak_test`, so routing consults `weekly_template.week[]`. That template never names `block_peak_singles`. The block is in `phase.blocks` but the router doesn't look there for Phase 6.
**Fix:** Add a Phase-6 waypoint-week branch that surfaces `block_peak_singles` on Mon/Fri (or introduce `phase.waypoint_window`). Alternatively remove Phase 6 from `MAIN_PHASE_IDS` and rename the block to `"Mon — heavy singles"` so the Phase-7-style day-prefix filter picks it up.
**Severity:** The birthday PR attempt is the declared goal of the entire program. The block carrying it is unreachable in the UI.

## CRITICAL-3 — Race Saturday (2026-08-29) routes as a normal reintro day

**Repro:** `?today=2026-08-29`. Screenshot `05_phase1_last_sat_2026-08-29.png`.
**Observed:** Renders `block_reintro` with full weight suggestions.
**Expected:** Per `week_3_aug_24_29_race_week`: "Sat: RACE." Rest / race-day banner.
**Root cause:** `page.tsx:246–255` — Phase 1 code only special-cases `week === 2` (eval). `week === 3` (race) hits the generic barbell branch and picks `block_reintro`.
**Fix:** Add `else if (week === 3) candidateIds = []` and a `<RaceDayCard />`. The race date is a waypoint and deserves first-class treatment.

## CRITICAL-4 — Phase 7 no-day-prefix fallback silently pins to Monday

**Repro:** Inspect `page.tsx:266–275` under `?today=2027-04-26` (Mon).
**Observed:** Filter parses `^(Sun|Mon|...)\s*[—-]` from `block.name`. Blocks without a prefix hit `return dow === 1` — an arbitrary fallback. Currently masked because the two prefix-less strength blocks (`block_a_home`, `block_daily_skill`) are `category: "accessory"` and filtered off at `page.tsx:278`. But rename `block_squat_heavy` from `"Mon — heavy squat day"` to `"Heavy squat day"` and Phase 7 collapses to Monday-only.
**Fix:** Replace English-prefix parsing with a structured `block.days: ["Mon","Sat"]` field. Fail loudly during load if a strength block in `phase_7_continue.blocks` has no day set.

## HIGH-1 — Phase 1 Day 1 (Thu 2026-08-06) shows Rest

**Repro:** `?today=2026-08-06`. Screenshot `02_phase1_day1_2026-08-06.png`.
**Observed:** Rest card. Phase label correct.
**Expected:** Per `week_0_aug_6_9`: "2 barbell sessions (Fri + Sat, or as schedule permits)." Technically Thu is not scheduled — but the very first day of the program, the user sees no context, no "Phase 1 starts" banner, no forward preview.
**Root cause:** `barbellDays = {1,3,5,6}` in `page.tsx:248`. Aug 6 is Thu (4). No first-day banner logic anywhere.
**Fix:** Detect `dateISO === phase.starts` and render a phase-intro banner.

## HIGH-2 — Phase 1 Thursday rest contradicts `week_by_week`

**Repro:** `?today=2026-08-13`, `08-20`. Screenshot `03b_phase1_thu_2026-08-13.png`.
**Observed:** Rest.
**Expected per `week_1_aug_10_16`:** "Thu front squat 3×5 to 60-70 kg + Bulgarian split squat."
**Root cause:** Code excludes Thursday (4) from `barbellDays`; the copy in `program.json` promises a Thursday session.
**Fix:** The **data-vs-code drift** is the real bug. Either add 4 to `barbellDays` for weeks 0–1 or amend the phase copy. Currently the user reads the phase description, opens the app, and gets a contradiction.

## HIGH-3 — Race week (Aug 24–29) has no light-week treatment

**Same root cause as CRITICAL-3.** `week === 3` should downshift Mon/Wed to lighter volumes (`3×5 at 50%`) and rest Thu–Fri. Current code applies full reintro suggestions all week.

## MEDIUM-1 — Reload does not preserve viewed date

**Repro:** `?today=2026-08-06`, tap Next ×5 → "Tuesday 11 Aug". Reload → "Thursday 6 Aug". `findings["16_reload"]`.
**Root cause:** `page.tsx:27` `useState(() => todayISO())` — local component state, never mirrored to URL or store.
**Fix:** `useEffect` mirroring `activeDate` into `history.replaceState({}, "", "?date=" + activeDate)`, and initialise from that param on first render (falling back to `?today=` or real today).

## MEDIUM-2 — Home button semantic drift under `?today=`

`todayISO()` reads `?today=` from the URL on every call. Once a user installs the PWA and returns weeks later, the `?today=` bookmark is stale but still authoritative — the Home button snaps back to the bookmark date instead of the device's actual today.
**Fix:** After first read, strip `?today=` via `history.replaceState`. Consider moving the override to a session-storage-scoped flag.

## MEDIUM-3 — Phase 5 first day (Tue 2027-01-05) renders as Rest with no context

Same class as HIGH-1: first day of a new phase, no phase-change banner, user sees Rest.

## LOW-1 — Pre-program guard

`page.tsx:95` — `activeDate < program.phases[0]?.starts` degrades silently if `phases[0]` or `starts` is missing (compares to `undefined` → always false → banner disappears). Explicit guard is safer.

## LOW-2 — DateNav uses `toISOString().slice(0,10)`

`DateNav.shift` returns `d.toISOString().slice(0,10)` where `utils.iso(d)` would be the correct local-timezone accessor. Verified safe by the `T12:00:00` anchor across Europe/Tallinn's 2026-10-25 DST-end and 2027-03-28 DST-start, but the two code paths should agree.

---

## Gap-between-phases behavior (Dec 21 → Jan 4)

The 15-day gap between Phase 4 (`ends: 2026-12-20`) and Phase 5 (`starts: 2027-01-05`) is entirely unhandled. `activePhaseFor()` falls through to `phase_7_continue`; because Phase 7 is not in `MAIN_PHASE_IDS`, routing uses the day-prefix filter and picks the four post-birthday session blocks on Mon/Wed/Thu/Sat. The user is served the full post-birthday programme during what `program.json` explicitly designates a "light/holiday period." Weight suggestions rendered by `SuggestionBox` will use whatever TMs are in the store at Dec 20 applied at Phase-7 percentages — not the documented 60% TM light sessions.

## Date-arithmetic quirks

1. Phase 1 week calc `Math.floor((today - start) / 864e5)` (`page.tsx:246`) is DST-safe because both anchors are `T00:00:00` in the same locale; a ±3600 s DST wobble is absorbed by 864e5. Verified: 2026-08-29 → week 3.
2. `new Date(dateISO + "T12:00:00").getDay()` (`page.tsx:231`) — noon anchor sidesteps midnight rollover. Correct in every zone.
3. DateNav's `toISOString().slice(0,10)` (LOW-2) — safe by construction but stylistically diverges from `utils.iso`.
4. DST inspected: 2026-10-24 → 25 → 26 (autumn) and 2027-03-27 → 28 → 29 (spring). No off-by-one. Phase transitions cross both correctly.
5. Note: the task brief's "Sep 27 2026 DST" is a red herring — Estonia's DST-end is the **last Sunday of October** (2026-10-25). Sep 27 is a normal Sunday.

## Performance

100 rapid Next-day taps: **586 ms total**, avg **5.9 ms**, p95 **8 ms**, max **51 ms**. After 100 taps the header reads "Saturday 14 Nov" (Aug 6 + 100 = Nov 14). No hang, no drift, no memory growth in devtools. `activeDate` is component-local state so no persistence bottleneck. SW cache warmed on first load; subsequent renders are pure client.

## Recommendations (impact order)

1. **Gap-handling in `activePhaseFor`** — return `undefined` or a synthetic bridge phase when `dateISO` falls between `prev.ends` and `next.starts`.
2. **Structured `block.days: []`** — replace English-prefix parsing at `page.tsx:271` and fail loudly on missing data during load.
3. **First-class waypoints** — `waypoint_dates` on phases (race Aug 29, birthday Apr 24, 1RM test week) short-circuit strength routing and render a dedicated card.
4. **`activeDate` ↔ URL sync** — reload/bookmark preserve position.
5. **Reconcile Phase 1 `week_by_week` narrative with `barbellDays` set** — Thu is either in or out; the current mismatch will bite the user.

Screenshots (61 files) at `dev/audits/iter1-datenav-shots/`; structured findings at `dev/audits/iter1-datenav-shots/findings.json`.
