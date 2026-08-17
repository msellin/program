# Terav app — Copy clarity audit (microcopy, tone, empty states, 3 personas)

Personas: persona-recover (hip-rebuild, day 30), persona-strength (engine-builder, day 30, 17-day pause), persona-erratic (concurrent-strength, day 45)
Artifacts: `next-app/tests/e2e/artifacts/personas/*/text/`
Voice source: `landing/src/i18n/dictionaries/en.ts`

---

## 1. Overall verdict

The captures show a real product with the confirm-first spine intact — the "Back after 17 days — soften plan?" signal, the reintro-graduation banner, the missed-session prompt, the Green/Amber/Red hero strip, and the Guide's plain-English glossary all read like the work of an author who has thought hard about tone. The biggest failure is a load-bearing one: **on Coach, all three personas see identical "Coming soon" copy, so the product's core landing promise — "engine proposes, cites, you Accept or Ignore" — has no live surface where a user can point and say *this is that*.** The second failure is a positioning contradiction: landing pitches "Not a streak game" (`landing/src/i18n/dictionaries/en.ts:73-74`), but the app ships a `Flame` streak chip in the hero (`next-app/src/components/StreakChip.tsx:36`). Third: the giant "0 done" stack on History (30-45 rows deep on erratic) makes days with no activity look like a failure column when they are just calendar noise. What is done well — the missed-session prompt (`MissedSessionPrompt.tsx:85-90`) is a masterclass in non-shaming, action-forward copy that respects the "skip a week, the plan sharpens against that too" claim.

---

## 2. Empty-state inventory

Persona-erratic and persona-strength surface the highest-volume empty states. Judged against orient / motivate / guide.

| Route | Captured string | Orients? | Motivates? | Guides? | Rewrite |
|-------|-----------------|----------|------------|---------|---------|
| `/coach` (all 3 personas) | "Coming soon · A coach that reads your whole log every time you ask. Plain-English questions like 'is my squat progressing?' — answered against every session you've logged and the research your program is built on. Meanwhile: keep logging on Today. When the coach lands, your history is what it reads." (`coach/page.tsx:402-413`) | y | y | weak | Keep the pitch, add a dated milestone + a subscribe hook: "Coming soon — Q1 2026. A coach that reads every log you've written. Notify me when it lands." |
| `/progress` (persona-strength, no logs this week) | "Nothing logged this week yet. Come back Sunday for a summary." (`WeeklyNarrativeTile.tsx:70`) | y | n | n — "come back" is a passive dead end | "No log yet this week. Log today's session and Sunday's summary starts writing itself." |
| `/history` (persona-erratic, 45 rows, zero exercises logged) | "Sat 15 Aug · 0 done" × 30 (`history/page.tsx:323`) | y | n | n — every row screams zero | Suppress rows with 0 done AND no symptom check. If shown, replace "0 done" with "rest" for weekly rest days, "skipped" for skips, and hide the phrase entirely for logged-check-only days. |
| `/history` (fresh user, `days.length === 0`) | "No entries yet. Log a session or save a morning check." (`history/page.tsx:65`) | y | weak | y | "History fills up as you log. First entry: today's morning check or session." |
| `/extras` (persona-erratic, program has none) | "This program has no extras — every prescribed session lives on Today. You can still use the session-log card on Today to log cross-modal work (cardio, class attendance, walks) if you want it in your history." (`extras/page.tsx:105-107`) | y | y | y | Keep. |
| `/extras` (persona-recover, has home rehab) | "Do these when you can — they log to today, no calendar constraint." | y | y | y | Keep — one of the best lines in the app. |
| `/progress` (retest metrics, no baseline) | "BASELINE — · CURRENT — · Δ —" with "Target -5 bpm · stretch -10 bpm" below | n | n | n | Above the em-dashes: "Log a baseline reading — you can't measure a delta from nothing." (only when both baseline and current are null) |
| `/progress` (persona-recover, hip sub-track) | "Not logged yet. · No data yet" (double empty) | n | n | n | One line, not two: "Log your first hip-flexor + balance check to start the trend." |
| `/progress` (persona-recover milestones panel — TMs with no values) | Five lifts listed as "High-bar back squat · kg" with the number blank | n | n | n | Show a single line above the block: "Training maxes appear once you log your first 5RM test. Do that in evaluation week." |
| `/events` (all 3 personas) | "This page couldn't load · Reload to try again, or go back. · Reload · Back" | y (route broken) | n | n — doesn't say WHY | "Events isn't ready yet — this route will land with the coach. Back to Today →" (assuming Events is intentional dead code; otherwise fix the route.) |
| `/coach` sub-line | "Reads your full history + clinical context each turn." (`coach/page.tsx:248`) | y | y | n — no CTA when the feature isn't live | Move under Coming Soon block and reword: "When live, reads your full history + clinical context on every ask." |
| `/today` (persona-strength, program finished) | "YOU FINISHED · Engine composite (Block 1) · 6 weeks logged. Nice. · No retest metrics recorded — head to Progress to log your final numbers." (`app/page.tsx:491-525`) | y | y | y | Keep. "Nice." is the single word of praise that earns itself. |

**Word-budget check**: `/coach` empty state = 55 words. Over the 40-word budget by 15. Cut: "Plain-English questions like 'X' —" is redundant with the paragraph that follows; kill the leading phrase. `/progress` weekly narrative = 10 words, within budget but toothless.

---

## 3. Proposal explanations (the core promise)

Landing claim (`landing/src/i18n/dictionaries/en.ts:9,43,86`): *"Every change cites a study — you approve each one."* / *"Engine proposes. You Accept or Ignore."*

Persona-strength `/today` — signals captured after 17-day pause:

| Proposal | Has 'why'? | Cites source? | Verdict |
|----------|-----------|----------------|---------|
| "Back after 17 days — soften plan?" (`SignalsStrip.tsx:113`) | Only when expanded — "14+ days without a logged strength session. The engine can soften your first week back to protect against a compressed-return spike." (`SignalsStrip.tsx:264-266`) | n | Reason is human, no study citation. Landing promises a study on every change. |
| Deep proposal on `/progress` (`adapt.ts:270`) | y — "Suggest a 2-week calibration mini-cycle: week 1 reintro at 60-70% previous TM, week 2 5RM test to reset TM." | n | Prescriptive and clear, no citation to the return-from-detraining literature. |
| Persona-recover: "Ready to leave reintro" (`ReadinessProposal.tsx:55-74`) | y — "Two straight sessions above 80% TM at RPE ≤ 7 with no red/amber days. Mechanically you're done with Phase 1." + evidence list of dated sessions | partial — the "citation" is the athlete's own logged sessions | Excellent. Cites the log, not the literature — arguably a stronger promise than a study link. |
| Persona-recover: "Not feeling 100%?" (`SignalsStrip.tsx:76`, `DayAdjustmentProposal.tsx:89`) | Component renders the load multiplier and asks for confirmation | n | The "why" (yesterday's fatigue signal, or pain from morning check) lives inside `DayAdjustmentProposal` but is shorter than it should be. |
| Persona-recover: "First hip check" / "Monthly hip check due" (`SignalsStrip.tsx:92`) | n — label only | n | Chip alone. What happens if I don't do it? What does it feed? Add a one-line why on the expanded panel. |
| Persona-strength: "Retest window this week." (`app/page.tsx:672-675`) | y — "You're 6 weeks in. Progress → Insights shows your current retest metrics against baseline and target." | n | Clear. The retest concept is defined in Guide. |

**Gap vs. landing promise:**

Zero of the six proposals surface a study citation. The Guide page does cite (Helgerud 2007, Bosquet 2007, Schumann 2022 named on program pages) but the *proposal itself* — the "here's what I'm suggesting you change" moment — carries only heuristics-in-english, never a footnote or link. Landing promises "every change cites a study." That is either false, or the citation lives one screen away and needs to be surfaced.

**Recommendation:** every proposal card gets a third line — `Because: {mechanism/study}` — e.g. under "Back after 17 days":

> Because: detraining strength loss is nonlinear past ~10 days (Bosquet 2013). One week at 60-70% previous TM protects against re-injury on return.

Under "Ready to leave reintro":

> Because: two sessions at ≥80% TM ≤ RPE 7 with no amber days = your protocol's exit gate. Not a study, your own log.

Distinguish study-cited from log-cited with an icon or leading verb. Both are legitimate; both need to appear.

---

## 4. Error + negative states

| Where | Captured string | Problem | Rewrite |
|-------|-----------------|---------|---------|
| `/events` all personas | "This page couldn't load · Reload to try again, or go back." | Doesn't tell user WHY. Route appears dead. | "Events lands with the coach — not ready yet. → Back to Today" (or fix the route). |
| Missed-session prompt (persona-recover today) | "Yesterday was a strength day — nothing logged. Log what you did so history stays honest, or mark it skipped so the week's progression can respond correctly." (`MissedSessionPrompt.tsx:85-89`) | 26 words — over the 15-word toast budget but this is a banner, budget OK. Tone is exemplary. | Keep. Consider trimming "so the week's progression can respond correctly" → "so the plan sharpens" (7 words saved, echoes landing). |
| Missed-session skip stage | "Pick how the week responds. Both options mark yesterday skipped." (`MissedSessionPrompt.tsx:90`) | Vague — WHICH two options? | "Skip and hold this week's load, or skip and let the engine soften? Both mark yesterday skipped." |
| Red-state hero (persona-recover if fired) | "Red · Back off. Something above 5/10 or a red flag noted." (`HeroStateCard.tsx:13`) | Landing says "not a clinician." "Back off" is direction, not diagnosis — good. Missing: what to *do*. | "Red · Something above 5/10 or a red flag. Load drops 10% today. If pain wakes you at night or shortens your stride → Escalate." |
| Amber-state hero | "Amber · Hold load. A 4-5/10 or morning stiffness over 30 min." | Good — but "Hold load" is jargon. | "Amber · Hold today's load. Something 4-5/10 or 30+ min morning stiffness." |
| Save-check missing feedback | No explicit toast on save captured — button reads "Save check" and page re-renders | Silent success is unclear on mobile. | Add toast: "Check saved. Today's load adjusted." (7 words.) |
| Data page "Wipe local log" | "Wiping affects only this browser — your synced data on the server is untouched." (`app/data/page.tsx`) | Good. | Keep. Best data-page copy in the class. |

**No offline banner captured.** PWA that syncs local → server should show one when connection drops. Flag P1.

---

## 5. Forms & labels

**Log form / today prescription** (persona-recover strength card, `app/page.tsx`):
- Exercise names use plain English — "High-bar back squat", "Block pull, mid-shin height", "Bulgarian split squat, dumbbells", "Dead bug, slow". Good.
- Cue chips like "CUE — On the dedicated pull day only" are terse and clear.
- L/R lat markers on unilateral work — present, correct.
- Verdict: strong.

**Morning check labels** (`check/page.tsx:100-192`):
- Persona-recover check has lat-marked "L Groin", "Low back", "L Buttock", "R Shoulder" — good, lay language, not `groin_left`.
- "Clicking present", "Clicking is painful" — two checkboxes: the second only means anything if the first is on. Merge to a single 3-state: "Clicking · none / painless / painful."
- "Woke me at night" — good.
- "Shortened my stride when running" — good, specific.
- "Morning stiffness · 0 min" slider — good.
- "Life load (0=fresh, 10=wrecked)" (`check/page.tsx:156`) — scale hint IN the label. Torrey Podmajersky would clap. Keep.
- "Outside training yesterday" free-text placeholder: "e.g. 90 min padel, long hike, poor sleep" — excellent.
- Helper: "The engine treats keywords here (padel, hike, tired…) as external load and factors it into today's proposals." (`check/page.tsx:179`) — good, tells the user WHY typing matters.

**Symptom scale** (0-10) meaning: defined *once* in the Guide's Green/Amber/Red section (`guide/page.tsx:136`) and inside the Onboarding step subtitle ("0 = nothing, 4 = mild, 10 = severe"). It is **not** referenced on the Morning check page — a first-time user hitting `/check` after onboarding sees sliders with no anchor. Add a one-line legend under the h1.

**Notes prompt**: no dedicated notes field captured on `/check`. `/today` exercise cards have a notes field per exercise (from source). Placeholder unaudited here — check `ExerciseCard.tsx`. Flag P2: verify prompt is invitational.

**Bottom-nav labels** (`nav/BottomNav.tsx:15-21`): Today · Week · Progress · History · Profile. Each matches its route H1. Good.

---

## 6. Onboarding

`src/components/Onboarding.tsx` — a 3-step modal, only fires for the anterior-hip program on a truly fresh install.

- Steps: 3.
- Words per step (question + subtitle): "How's the low back this morning? · 0 = nothing, 4 = mild, 10 = severe" = 12 words. "How's the left hip / groin? · Same scale." = 8. "Slept how many hours? · Tap the number, adjust with buttons." = 10.
- Total wizard footprint: under 30 words. Under budget. Good.
- Header: "Setup · 1 of 3" — clear progress.
- CTAs: "Skip setup", "Next", "Start". Three words max. Good.

**Findings:**
- The onboarding fires *only* if `activeSlug === "anterior-hip-rebuild"` (`Onboarding.tsx:65`). For any other program a new user gets no onboarding at all. Persona-strength and persona-erratic never see it. That is a design decision (avoid hip-flavoured questions for non-hip users) but the *absence* of an onboarding for other programs means they hit Today with no orientation — no "here's what green/amber/red means", no "log your first check". Add a program-agnostic 2-step version: (1) sleep last night, (2) any pain 0-10.
- "0 = nothing, 4 = mild, 10 = severe" — this is the *only* place in the app that anchors the 0-10 scale before the user uses it. That anchor should also live on `/check` (persistent, small).
- Consent language: no captured mention of TOS acceptance in onboarding. If consent is captured elsewhere on signup, verify it is plain-English. Legal is at `/legal/*` — good separation.

---

## 7. Tone vs. positioning

Landing promises (`landing/src/i18n/dictionaries/en.ts`):

1. **"A training plan that sharpens every session"** (hero:h1_a/b) → App matches: phase notes like "Rebuild the pattern under progressive load" (persona-recover `/week`) and the "engine sharpens against your log" mechanic are consistent. **Match.**
2. **"Every change cites a study — you approve each one"** (hero:sub) → App partially matches. Confirm-first is fully honoured (`ReadinessProposal.tsx:23`, `SignalsStrip.tsx` proposals). Study citations on the proposal moment: absent. **Partial match — see §3.**
3. **"Engine proposes. You Accept or Ignore."** (how:step_03_body) → App matches, but the buttons captured say "Accept" and *dismiss* (X), not "Ignore". "Not yet" appears on the readiness card (`ReadinessProposal.tsx:102`). Standardise. **Partial match.**
4. **"Not a clinician. Red-flag patterns fire an escalate banner, not a diagnosis."** (wontdo:not_a_clinician_body) → App matches. "Red" hero says "Back off … a red flag noted" and links to `/guide/#red-flags`. Escalate → present. No app string uses "diagnose" or names a condition. **Match.**
5. **"Not a streak game. Skip a week. The plan sharpens against that too."** (wontdo:not_streak_body) → **CONTRADICTED.** `StreakChip.tsx` renders a flame icon + day count in the hero (`HeroStateCard.tsx:66,89`). Even with the "restraint > gamification" comment in the source, a flame + counter is the universal streak-game visual. This is a P0 tone violation. **Mismatch.**
6. **"VO2max response varies ~10× person-to-person. We quote ranges, not one number."** (wontdo:not_certain_body) → App matches: "5-8% VO2max improvement", "resting HR drop (5-10 bpm typical)" on the Engine Builder program page. **Match.**

**Streak / motivational hits (search: `"Great job"`, `"Keep going"`, `"crushed"`, streak, `Nice`):**
- `StreakChip.tsx:36`: `Flame` icon + "Xd" — **kill**.
- `app/page.tsx:495`: `{weeksIn} weeks logged. Nice.` — this is on the graduation card only. One "Nice." at end-of-program is earned and human. **Keep.**
- No "Great job", "Keep going", or emoji fireworks found. Good discipline.

**Not-a-streak-game repair recipe:**
1. Delete `StreakChip.tsx` entirely.
2. Or, if a run-of-days signal is needed for the internal cadence-fires logic, render it as a small non-icon caption: "Logged 6 of last 7 days" — factual, no fire.

---

## 8. Terminology map

| Concept | Terms in use | Occurrences | Recommend one |
|---------|--------------|-------------|----------------|
| Prescribed unit of work | "session" (36 in src), "workout" (0), "block" (36 — but "block" is used for a *training block*, not a workout unit), "day" | Session dominates; workout unused. | **session** — you're already there. Audit passes. |
| Training macrostructure | "phase" (`Rebuild + evaluate`), "block" (`Engine Builder — Block 1: Base`), "cycle" (`5/3/1 cycle`) | 3 distinct concepts, each program uses one primary. | Keep — each is a real concept, program-scoped, and defined in Guide. **No drift.** |
| Symptom state | green / amber / red — used uniformly | Consistent across HeroStateCard, Heatmap legend, Guide, program.json rules | **Passes.** |
| Symptom scale | 0-10; hero copy uses "above 3/10", "4-5/10", "above 5/10"; onboarding uses "0 = nothing, 4 = mild, 10 = severe" | Consistent. | **Passes.** |
| Load number | "TM" / "Training Max" / "training-max" — all three appear | Guide defines TM plainly (`guide/page.tsx:30`). Progress uses "TM 89 kg". Onboarding never says "TM" because there's no lift on it. | First appearance in a session card should be "Training max (TM)" the first time, "TM" thereafter — do this per-day, per-session. |
| Perceived effort | "RPE" defined in Guide, used raw on cards | Persona-recover today card uses "RPE cap of 7" (`app/page.tsx`) — the user has to know what RPE is to parse it. | Add tooltip/glossary link on first RPE occurrence per session; label the number as "RPE 7 (three reps left in tank)". |
| Rehab | "home rehab", "accessory work", "activation" | 3 phrasings on `/extras` — "Home rehab and activation", "Daily squat skill", "Accessory work" | The `/extras` header calls it "Accessory work, home rehab, around-runs." All three appear. Consolidate to a two-tier label: "Rehab (daily)" + "Accessories (as-needed)". |
| Program | "program" (dominant) vs. "plan" (landing hero) | Landing: "A training plan that sharpens..." App: "Programs" tab, "your current program", "End this program" | Landing = "plan" (marketing warm), app = "program" (SKU-like). Persona-strength profile card says "Engine Builder — Block 1: Base" — clearly a program. **Acceptable drift**, but consider aligning to one word if a rename is cheap. |
| Retest metric | "Retest metrics" / "Retest window" / "5RM confirm" / "Cycle-end 5-rep max" | Persona-strength has "Week 8 midweek retest" verbiage on the program page. Persona-recover has "Cycle-end 5-rep max on primary lifts (squat, block pull) with symptom review". Consistent. | **Passes.** |
| Brand | "Terav" — top of every screen (persona artifacts show `TERAV` caps) | Consistent capitalization. | Header uses `TERAV` (caps). No pronunciation lockup. **Matches brand memory. Passes.** |

---

## 9. Priorities

**P0 (copy blocking product promise):**
- **Streak chip contradicts "Not a streak game"** landing promise. Kill `StreakChip.tsx` or reduce to a plain-text "Logged X of last 7 days" caption. `next-app/src/components/StreakChip.tsx:29-38` + call sites `HeroStateCard.tsx:66,89`.
- **No study citation on any proposal.** Landing says "every change cites a study." Add a `Because:` line per proposal in `SignalsStrip.tsx`, `ReadinessProposal.tsx`, `DayAdjustmentProposal.tsx`, and the pause/soften/cycle-end review on `/progress`. Distinguish study-cited (Bosquet 2013, Schumann 2022 etc.) from log-cited (user's own sessions) with a leading verb.
- **Coach empty state is identical for all three personas and shows no product surface.** If Coach is Q1 2026, say so + add a notify-me. If it's inside Profile now per IA audit, remove `/coach` route or redirect it. `coach/page.tsx:395-417`.

**P1 (do this month):**
- **History "0 done" spam.** For 30-45 zero-activity rows, suppress or roll up. `history/page.tsx:323` — condition on `doneCount === 0 && !day.symptoms && !skipped[date]` → hide row entirely; render a "…rest days omitted (12)" separator.
- **Empty retest metric panels** show four bare em-dashes. Add a one-line "Log a baseline reading" call to action when both baseline and current are null. `progress/page.tsx` (retest metrics rendering).
- **Onboarding only fires for anterior-hip.** Add a program-agnostic 2-step onboarding (sleep hours + any pain 0-10) for engine-builder, concurrent-strength, rowing, handstand, overhead. `Onboarding.tsx:65-78`.
- **0-10 scale anchor missing on `/check`.** Add "0 = nothing · 4 = mild · 10 = severe" as a persistent legend under the h1. `check/page.tsx:100-105`.
- **`/events` broken route** shows a generic "This page couldn't load." Either remove the route or give a purposeful "Not ready yet — lands with the coach" state.
- **Save-check success has no toast.** After tapping "Save check" the page rerenders; on mobile the state change is easy to miss. Add "Check saved. Today's load adjusted." toast.
- **Weekly narrative empty**: "Nothing logged this week yet. Come back Sunday for a summary." Rewrite to "No log yet this week. Log today's session and Sunday's summary starts writing itself." `WeeklyNarrativeTile.tsx:70`.
- **Missing offline banner.** PWA that syncs locally → server needs "You're offline — logged locally, will sync when back online." on connection drop. Out of scope? → see `app-audit-N-mobile-ux` if there is one; otherwise own it.

**P2 (polish):**
- **"Clicking present" + "Clicking is painful"** two checkboxes → merge to 3-state segmented control: "Clicking · none / painless / painful."  `check/page.tsx:121-133`.
- **Missed-session skip picker** "Pick how the week responds. Both options mark yesterday skipped." (`MissedSessionPrompt.tsx:90`) is vague. Rewrite: "Skip and hold this week's load, or skip and let the engine soften? Both mark yesterday skipped."
- **Amber hero copy** uses "Hold load" — jargon. "Hold today's load." (add "today's").  `HeroStateCard.tsx:12`.
- **"Ready to leave reintro"** signal chip label is too casual. "Reintro complete — ready to advance?" is closer to the tone of the expanded panel (which is excellent). `SignalsStrip.tsx:87`.
- **First hip check chip** — bare label, no why. Add expanded panel copy: "Anterior-hip programs use this six-item self-check every 28 days. Sets the baseline so the next check shows real change." `SignalsStrip.tsx:92-94`.
- **"You've been away 17 days"** in Progress duplicates the same 17-day figure in the Today signal ("Back after 17 days — soften plan?"). Fine — but only one should call the same soften-plan CTA. Currently both point at Progress. Verify accept/apply flow lives in one place only. `app/progress/page.tsx:196`, `SignalsStrip.tsx:113`.
- **Terminology polish**: first RPE usage in a session card should read "RPE 7 (three reps left in tank)" — first-appearance-defines. Guide already does this. Do it inline too.
- **"MORNING CHECK · 16g · 10a · 4r · 1065?"** on the specialist report (persona-recover `/report`) — the compact code is opaque to a clinician reading the print-out. Add a legend row above: "green / amber / red / unlogged".
- **"Or paste JSON"** on Data page reads like a dev artifact. Rebrand: "Restore from a JSON backup" as the section heading, "Paste backup" as the button.
- **"How this app works"** in the Profile menu (`persona-*/text/08-profile.txt`) is a strong CTA. Verify it links to `/guide` and not a dead route.
- **"Ask coach"** in Profile menu — while Coach is coming-soon, this link should show the coming-soon page. Confirm it doesn't 404.

---

## Appendix: strings quoted verbatim (from captured text)

- Missed-session prompt: "Yesterday was a strength day — nothing logged." + "Log what you did so history stays honest, or mark it skipped so the week's progression can respond correctly." — `MissedSessionPrompt.tsx:85-89`
- Readiness proposal signal chip: "Back after 17 days — soften plan?" — `SignalsStrip.tsx:113`
- Retest window: "Retest window this week." + "You're 6 weeks in. Progress → Insights shows your current retest metrics against baseline and target." — `app/page.tsx:672-675`
- Program-finished card: "YOU FINISHED · Engine composite (Block 1) · 6 weeks logged. Nice. · No retest metrics recorded — head to Progress to log your final numbers. · RETEST — LOG YOUR NUMBERS · PICK YOUR NEXT PROGRAM →" — `app/page.tsx:491-540`
- Back-after-a-break expanded panel: "14+ days without a logged strength session. The engine can soften your first week back to protect against a compressed-return spike." — `SignalsStrip.tsx:263-266`
- Reintro graduation: "Signal · you look ready to leave reintro · Two straight sessions above 80% TM at RPE ≤ 7 with no red/amber days. Mechanically you're done with Phase 1. Advancing to Cycle 1 is a call to make deliberately — not something the app will do behind your back." — `ReadinessProposal.tsx:55-74`
- Coach coming soon: "A coach that reads your whole log every time you ask." — `coach/page.tsx:402-404`
- Life load: "Life load (0=fresh, 10=wrecked)" — `check/page.tsx:156`
- Streak chip label: "6-day streak, today not yet logged" — `StreakChip.tsx:30`

---

**Out-of-scope callouts:**
- Visual hierarchy of empty states (font size of the row-of-30 "0 done") — see `app-visual-craft`.
- Tap targets on the row buttons — see `app-mobile-ux`.
- Screen-reader labels on the sparkline bars and heatmap cells — see `app-accessibility`.
- Whether landing's "every change cites a study" is a promise the app can/should deliver on end-to-end — see `app-landing-alignment`.
