# Iter 3 — Full 4-week Phase 2 flow (final audit)

**Target:** https://program-v2.pages.dev
**Persona:** 37M CrossFitter, TM back squat = 110 kg, TM block pull = 130 kg.
**Simulated window:** 2026-08-30 → 2026-09-27 (Phase 2 Cycle 1: three loading weeks + deload).
**Viewport / device:** iPhone 12 (390 × 844), Europe/Tallinn tz, English UK locale.
**Harness:** `/tmp/pw-audit/iter3-fullflow.js` (main flow) + `/tmp/pw-audit/iter3-verify.js` (UI verification pass).
**Screenshots:** `dev/audits/iter3-fullflow-shots/` (24 png files).
**Raw findings:** `dev/audits/iter3-fullflow-shots/findings.json`, `verify-findings.json`.

## Executive summary

Four real bugs, three UX rough edges, several confirming notes. **0 critical, 2 high, 4 medium, 1 low.**

The two most damaging are:

1. **The cycle-end banner disappears on the day the user actually needs it.** `evaluateCycleEnd` fires only during cycle-week-3 (Sun deload week is `daysIn ∈ [21, 27]`). Sep 27 in this scenario is `daysIn = 28`, which is cycle week 0 of the next cycle. The user opens the app on Sun Sep 27 to see "you finished the cycle — here's your TM bump" and gets nothing. The intended fix hinted at in the brief ("only bump lifts that were actually trained") is present in `adapt.ts:107-119` and works when the banner does show — but on Sep 27 the whole banner is gone.
2. **The Saturday volume-day prescription is wrong.** `block_squat_volume` is a distinct block whose scheme is `5×5 at 60-70% TM` (~66-77 kg for TM 110). The suggestion engine (`suggest.ts:92-104`) is phase-driven and returns the same 5/3/1 top set as Monday — 93.5 × 5+ (or 89 × 5+ with the amber -5% modifier). The card's scheme *label* says "5×5 at 60-70% TM", the "Suggested today" contradicts that with 89 × 5+. Confused user reads the top of the card, reads the middle, reads the bottom, and gets three different prescriptions.

Confirmations from iter 2 that still hold:
- 5/3/1 percentages compute correctly on green (Mon Aug 31: 93.5 × 5+ = 85% × 110 ✓; Mon Sep 7: 99 × 3+ = 90% × 110 ✓; Mon Sep 14: 104.5 × 1+ = 95% × 110 ✓).
- Block-pull 85% × 130 = 110.5 kg shows correctly (Sep 2).
- Amber state applies the 5% reduction (Sep 5: TM 110 → 89, FSL 68) — the *math* is right, only the *choice of prescription* is wrong.
- HeroStateCard renders "Ready to lift" for green derived state.
- Rest timer auto-starts (3:00 appeared on-screen after typing weight+reps into a set row).
- Reload preserves `?today=…` in URL (works fine).
- The `Set TM` inline chip renders, is clickable, and does update `training_maxes` + Progress tab (verified: 110 → 112.5).

Corrections vs. iteration 1/2 reports:
- The "Wipe leaves logs behind" theory in the first automated pass was a **test harness bug** (`page.on('dialog')` was registered after the click, so the confirm dialog was cancelled by default). Wipe with a proper dialog handler zeros out logs and TMs cleanly.
- The "Skip UI is not discoverable" observation was also a test bug — the SessionActions bar exposes "Skip today" / "Move day" / "Whole week" clearly at the bottom of Today, with a reason input in the modal. Users can absolutely type "comp" as the reason.

---

## Findings

### HIGH-1 · SEP27-CYCLE-BANNER-GONE · Cycle-end banner is invisible on the day the cycle ends

**Where:** `src/lib/engine/adapt.ts:60-63`
```ts
const daysIn = Math.floor((today.getTime() - start.getTime()) / 864e5);
const cycleWeek = Math.floor(daysIn / 7) % 4;
if (cycleWeek !== 3) return null;
```

**Repro:**
1. Seed TMs: back_squat_highbar=110, block_pull_midshin=130. Log an AMRAP crush on Sep 14 (104.5 × 8), a solid pull on Sep 16 (123 × 5), and deload sessions Sep 21 / Sep 23.
2. Navigate to `/progress?today=2026-09-27` (the Sunday after the 4-week cycle finishes).
3. Look for the "Cycle end — …" banner with Apply-all bumps.

**Expected:** Banner surfaces with per-lift TM recommendations (e.g. back squat 110 → 120 kg, block pull 130 → 137.5 kg). This is what the user came to the app for on Sunday morning.

**Actual:** No banner. Only the static tmMeta "Cycle end all-green: TM +5 kg squat variants…" note is present (that's a phase description, not the adaptive engine speaking).

**Why:** Sep 27 - Aug 30 = 28 days. `Math.floor(28/7) % 4 = 0`. The check `cycleWeek !== 3 → return null` runs at the start of the next cycle instead of at the true cycle-end moment. The user is one calendar day too late.

**Two possible fixes:**
1. Make the banner visible for a grace window (e.g. cycleWeek === 3 || daysIn === 28), so it lingers into Sunday.
2. Base cycle-end on the phase itself: if `todayISO === lastDayOfCycle + 1..7` show the review banner.

**Screenshot:** `iter3-fullflow-shots/19-progress-sep27-cycleend.png` — no banner visible.

---

### HIGH-2 · SEP5-VOLUME-PRESCRIPTION · Saturday volume day serves the Monday heavy prescription

**Where:** `src/lib/engine/suggest.ts:92-105` — the MAIN_PHASE branch ignores which block the exercise is in and always returns the 5/3/1 top set for that phase-week.

**Repro:**
1. TMs seeded, Sep 5 (Sat).
2. Save morning check with `low_back=4, stiffness=20` → derived amber.
3. Navigate to `/?today=2026-09-05`.
4. Open the "Sat — moderate volume + carries" block, back-squat card.

**Expected (per program.json `block_squat_volume` scheme):** 5×5 at 60-70% TM = 66-77 kg × 5, tempo 3-0-1-0. With amber -5%: 62-73 kg. Something like "Suggested today: 71.5 × 5 (65% TM)".

**Actual:** Card shows
```
Suggested — hold (amber day)
89 kg × 5+
FSL 5×5 @ 68 kg
Cycle 1, week 1. Top set: 85% TM × 5+.
```
This is the Monday `block_squat_heavy` prescription (85% × 110 × 0.95 amber). The user would attempt 89 × 5+ on Saturday, four days after their Monday heavy top set at 93.5.

**Why:** `suggestForExercise` is keyed on `exId` and `phase`, not on `blockId`. The Saturday block passes `back_squat_highbar` to the same code path as the Monday block, and gets the same answer. The block-level `scheme` field ("5×5 at 60-70% TM, all sets same weight, tempo 3-0-1-0") is used only as static header text in ExerciseCard's meta line — nothing consumes it into the suggestion.

**Impact:** On paper the user does one heavy squat day per week. In reality this app is telling them to do *two*, ~48h apart (Thu FS + Sat "volume" that's actually heavy). That's exactly what the "48h between heavy squat days" invariant in program.json:530 explicitly forbids.

**Fix:** Either
- read block metadata (or a `role` on the item, `role: "moderate_volume"` is already present at program.json:381) and branch on it inside `suggestForExercise`, or
- add a `volume_pct` field per block/item so the engine knows to use 65% instead of the phase-week percentage.

**Screenshot:** `iter3-fullflow-shots/v4-today-sep5-volume.png` (verification pass).

---

### MED-1 · POST-WIPE-NO-ONBOARDING · Wipe clears the log but the onboarding flow does not reappear

**Where:** `src/lib/useStore.ts:205` (wipe implementation) doesn't clear `program.onboarding.done` or `program.firstrun.dismissed`.

**Repro:**
1. Start a fresh browser, complete onboarding once.
2. Navigate to `/data`, tap "Wipe local log", confirm.
3. Return to Today.

**Expected:** Since the log is empty and the user is essentially starting over, the three-question onboarding (`Onboarding.tsx`) should reappear, or at minimum the FirstRunBanner nudging the user to open Progress and set TMs.

**Actual:** The Today page silently shows "No check yet · Rest day — no barbell scheduled". No onboarding, no TM setup guidance, no clue that the user is now on an empty store. If they then walk into the check page and save a morning check, the store bootstraps back up — but the app never asks for TMs, so all suggestions collapse to `null` until the user finds `/progress`.

**Fix:** In `wipe()`, also clear `program.onboarding.done` and `program.firstrun.dismissed`. Alternatively, keep both flags but add a first-run banner variant that fires when `logs.count === 0 && Object.keys(training_maxes).length === 0` regardless of the dismissed flag.

**Screenshot:** `iter3-fullflow-shots/v9-post-wipe-home.png`.

---

### MED-2 · TM-CHIP-VS-CYCLE-END-INCONSISTENCY · The inline TM chip and the cycle-end engine disagree by a factor of ~4×

**Where:** `src/components/workout/ExerciseCard.tsx:387` (Epley-based `inferTMFromSet`) vs `src/lib/engine/adapt.ts:133-138` (`over >= 6` big-bump branch).

**Repro:**
1. Aug 30 TM = 110. Sep 14 log 104.5 × 8 @ RPE 10 (crushed the 1+ target by 7 reps).
2. Inline chip appears: `est 1RM ~132.5 kg · suggested TM 112.5 kg (+2.5)`.
3. Follow the user brief and expect "bump TM to ~130 kg".
4. Also run `evaluateCycleEnd` (if the banner had shown on Sep 20-26 — see HIGH-1): AMRAP `over = 7 ≥ 6`, so `newTM = max(currentTM + 10, inferred.suggestedTM) = max(120, 112.5) = 120 kg`. The cycle-end engine says 120, the inline chip says 112.5, the brief expected 130.

**Impact:** Three prescriptions from the same event. The user taps "Set TM" on the chip, sees 112.5, moves on — and next Monday their week-1 top set is 95.6 × 5+ instead of the 102 × 5+ (or 110 × 5+) they should be aiming at. That's a real training-quality loss from a UI inconsistency.

**Fix suggestion:** The inline chip should either match the cycle-end big-bump math (`max(currentTM + 10, inferred)`) or clearly label itself as "conservative interim" and defer to the cycle-end recommendation. The current +2.5 in the face of 8 reps @ RPE 10 is misleadingly quiet.

**Screenshot:** `iter3-fullflow-shots/v5-sep14-tm-chip.png`.

---

### MED-3 · STREAK-INVISIBLE-AFTER-SKIP · StreakChip renders nothing after Sep 12 comp skip

**Where:** `src/components/StreakChip.tsx` — verify-findings note: `Sep 13 streak chip after skip: null`.

**Repro:**
1. Log green + done sessions Sep 7 / 9 / 10. Skip Sep 12 with reason "comp".
2. Load `/?today=2026-09-13`. Look for the streak chip in the header top-right.

**Expected:** Either "3-day streak" (skipping doesn't reset), or "streak paused (comp)".

**Actual:** No streak chip rendered at all. The component may render null when there's no data-driven definition of "streak" or when the last day is skipped. Either way, silently disappearing is worse than showing a preserved-streak state.

**Impact:** LOW-MED. User loses the gamified feedback loop right when they're missing training for a legit reason. Depending on personality, this can feel like the app "punishing" them.

**Fix:** Explicitly render "streak preserved · N days" when the previous day is `skipped[]` with a reason. Or if streak is legitimately 0, show "0 · restart".

---

### MED-4 · SEP12-SKIP-REASON-DISCOVERABILITY · Skip reason input is only in the modal, not surfaced afterwards

**Where:** `src/components/workout/SessionActions.tsx:310-315` (reason input inside SkipModal).

**Repro:**
1. Sep 12, tap "Skip today". Modal opens with a reason field.
2. Type "comp", tap "Skip today's session" confirm.
3. Return to Today for Sep 12.

**Expected:** The skipped-day card shows "Skipped · comp" so the user (and Claude reading the export) can see why.

**Actual:** The reason DOES land in `store.skipped["2026-09-12"].reason = "comp"` (verified in localStorage). But there's no visible surfacing on Today for that day — you see a bare "Skipped" state, not the reason. On the History page it's visible (`SessionActions.tsx:35 → skipped.reason ?? "No reason logged"`), but Today's UI doesn't expose it.

**Impact:** LOW. Cosmetic. But a user opening Today for their skipped day expects to see WHY they skipped — otherwise the button feels destructive rather than a note-to-self.

---

### LOW-1 · TIMER-STATE-LEAKS-BETWEEN-DAYS · Timer instance is process-scoped, not day-scoped

**Where:** `src/lib/useTimer.ts` combined with `src/components/workout/RestTimerHost.tsx`.

**Repro:** Log a set on Aug 31; timer starts at 3:00 counting down. Immediately click DateNav → next day (Sep 2). The timer keeps counting — but it's now displayed under the Sep 2 UI even though it belongs to Aug 31's set.

**Impact:** LOW-INFO. Not incorrect per se — a real user timing rest between sets across a date-nav interaction would want the timer to keep running. But it feels slightly weird that navigating to a different day doesn't reset the workout-context timer.

**Screenshot:** none — hard to capture without instrumentation.

---

## Surprise moments (things a real user would notice but aren't clearly bugs)

1. **After crushing an AMRAP with 8 reps at RPE 10, the inline "Set TM" chip suggests +2.5 kg** (110 → 112.5). Numerically Epley says that's right, but a CrossFitter's intuition is "I did 8 reps at supposed 95% — my TM must be way off, bump it 10-15 kg". The +2.5 feels like the app didn't notice the crush. The cycle-end engine WOULD say +10, but the user acts on the chip they see first. (MED-2 covers the fix.)
2. **Reading the Sat volume day, three parts of the same card disagree:** header title says "moderate volume + carries", scheme label says "5×5 at 60-70% TM", "Suggested today" shows 89 × 5+. A user reads top→bottom and gets contradicted twice. (HIGH-2.)
3. **The morning-check derives amber for `low_back=4, stiffness=20`** — which is correct per `derive()` (peak >= 4 OR stiffness > 30, only the first clause fires). But the reasoning shown to the user under the verdict says "amber morning state → load reduced 5%. Hold, don't push." That advice conflicts with a Saturday volume day where "5×5 at 60-70% TM" is *already* the hold day. Effectively the user gets told to hold on a hold day, which either reduces load double or leaves them confused.
4. **The rest timer default is 3:00.** For a top-set AMRAP at 95% TM that's low — real 5/3/1 rest between working sets is 3-5 min. No UI to bump it inline once running — you have to open the config.
5. **DateNav "back" chevron goes one calendar day, not one training day.** Tapping ← on Wed pull day lands on Tue (a rest day, empty card). Users trying to compare "last squat day" get 3 taps on Mon plus one rest day in between. Not a bug, but "prev training day" would be more useful.
6. **The App title stays "Today" even when viewing Sep 14 from Aug 7's system clock.** The DateNav shows "Monday 14 Sept · Today", but `isToday` in page.tsx:58 is `activeDate === todayISO()`, which is 2026-09-14 because of the URL override — matching. Fine. But if the user takes a screenshot to send to a coach, the label "Today" is ambiguous.
7. **Post-wipe, the app doesn't ask for TMs.** It just shows Rest day, and the user has to know to navigate to /progress. First-run banner should nudge them.
8. **Nav from `/history` back to `/` drops the `?today=` param.** If a user is auditing Sep 09 and taps History then Today (nav bar), they land on today's real date, not Sep 09. Reload on the same URL does preserve `?today=`. Only cross-route navigation drops it. Not necessarily wrong, but potentially confusing during a review session.

---

## Not-a-bug list (things flagged in the initial automated pass that turned out to be test artifacts)

- ~"Wipe leaves logs behind"~ — playwright dialog handler was registered after the click.
- ~"Import doesn't work"~ — fake export was missing required `version: 2` and `cycle` fields. With a schema-compliant export it imports cleanly.
- ~"Skip today with a reason is not discoverable"~ — Skip modal exposes a reason input; my scraper missed the SessionActions bar.
- ~"Aug 31 morning check didn't derive green"~ — my scripted slider fills mis-targeted the labels; the real UI derives correctly (verified `green` with real slider interactions).
- ~"Sep 5 amber-reduced 68 kg missing"~ — 68 kg is the FSL, the top set is 89 kg. The card shows both. The real bug is HIGH-2 above (volume-day should have a different prescription entirely).
- ~"Sep 21 deload 78 kg missing"~ — 78 kg is shown correctly. Was a regex artifact.

---

## Suggested triage order

1. **HIGH-2 (Sep 5 volume prescription)** — a user actually training this program will hurt themselves or plateau within a cycle. The suggestion engine sending them the Monday load on Thursday-plus-Saturday is a real safety issue on a rehab-context user.
2. **HIGH-1 (cycle-end banner window)** — one-line fix (broaden the `cycleWeek !== 3` guard). The whole point of the app's adaptive engine is invisible right when the user needs it.
3. **MED-2 (TM chip vs cycle-end math)** — the inline chip should either be conservative-labeled or match cycle-end math.
4. **MED-1 (Wipe → onboarding)** — small polish, big UX win for a rehab user who's likely to reset multiple times.
5. **MED-3, MED-4, LOW-1** — polish items.
