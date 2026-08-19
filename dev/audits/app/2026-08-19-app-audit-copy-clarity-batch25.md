# Terav app — Copy clarity audit (Batch 25)

Personas audited: persona-recover, persona-strength, persona-erratic, persona-graduate, persona-multitrack, persona-handstand, persona-concurrent (spot-checked). 15 routes × 14 personas.
Artifacts: `/Users/margussellin/www/program/next-app/tests/e2e/artifacts/personas/*/text/` (refreshed 2026-08-19).
Voice source: `/Users/margussellin/www/program/landing/src/i18n/dictionaries/en.ts`.
Batches folded in: 23 (FirstRunBanner, GraduationCard verb rows), 24 (MoveSheet, Week 3-verb row, RetestReminder), 25 (Coach removed, /account Extensions, revert ConfirmSheet body).

---

## 1. Overall verdict

Batch 23-25 landed the highest-leverage rewrites of the summer: the GraduationCard 4-verb stack finally *says what buttons do*, the MoveSheet stack-warning is calm and specific, and the /account Extensions row does exactly the P0 job the last audit called out — a single, undo-able surface for a reversible engine change. The tone matches the landing promise cleanly: no streak language, no "great job", no emoji fireworks; symptom bands stay clinical-lay ("Amber — hold the load, repeat the week") without alarm.

Two failures are P0. **FirstRunBanner still ships "Coach" as one of the ⋮-menu items** (`FirstRunBanner.tsx:70`) after Batch 25 removed Coach everywhere else — first-run users will look for a tab that no longer exists. And **the HeritageClusterChip surfaces internal jargon** ("Cluster A · responding", `metric_id` snake_case in the InfoSheet) that reads like a debug dump — none of the persona captures triggered it, but the code path is live for any user who seeds `retest_readings`.

A cluster of P1 leaks: exercise_id snake_case (`block_pull_midshin`, `back_squat_highbar`, `submax hr at pace-5`) surfaces inside Today proposals, Progress "Top lift", and Report load-progression — display_name resolution is missing at three call sites. The RetestReminder's `Log these on Progress → Insights` sentence uses an arrow as *nav syntax* which reads clean on mobile but is unconventional for screen readers. Otherwise, this is the strongest copy state the app has been in.

---

## 2. Empty-state inventory

The 3-job rule (**Orient / Motivate / Guide**) applied to every empty surface across persona-erratic, plus the new /coach 404 and Events page.

| Route | Persona-erratic captured string | Orients? | Motivates? | Guides? | Rewrite |
|-------|--------------------------------|----------|------------|---------|---------|
| `/today` (rest day) | "Submax HR reduction at fixed pace has no session on the schedule today. Optional work (accessories, mobility, easy movement) lives on the Extras tab and still logs to today." (`persona-erratic/01-today.txt:17`) | y | n | y | Keep — but the metric_id-derived label at the front ("Submax HR reduction at fixed pace") reads like a display_name leak. Prefer: "No session on the schedule today. Optional work — accessories, mobility, easy movement — lives on Extras and still logs to today." |
| `/coach` | "404 · This page could not be found." (`persona-erratic/03-coach.txt:2-3`) | n | n | n | Coach was removed in Batch 25 but the route still hits the generic 404. Ship a soft-redirect to /today, or a 200-response: "Coach isn't part of the beta yet — the engine proposes on Today. See it on the Guide." |
| `/history` (partial) | "LOG — 45 ACTIVE DAYS · SHOWING 30" then rows of "0 done" (`persona-erratic/04-history.txt:40, 42-100`) | y | n | n | Zero-log days flood the list. Rewrite the row copy: instead of "0 done" show a mid-gray "—" or the block that *should* have run ("Strength · Heavy — skipped"). Motivates: "You've logged 45 days in 7 weeks. Keep the log honest — the engine reads what's there." |
| `/history` (empty heatmap) | "green amber red accessory skipped nothing" legend rendered even with mostly-empty grid (`persona-erratic/04-history.txt:19-24`) | y | n | n | "nothing" as a legend label is flat. Change to "no log". |
| `/events` | "Not available · Events are in private beta. Ask Margus if you need access." (`persona-recover/15-events.txt:2-4`) | y | n | n | Adequate for beta; but "Ask Margus" is founder-mode. Prefer: "Events are in private beta. Email sellinmargus@gmail.com for access." (guides on WHAT to do) |
| `/extras` (no extras) | "This program has no extras — every prescribed session lives on Today. You can still use the session-log card on Today to log cross-modal work (cardio, class attendance, walks) if you want it in your history." (`persona-strength/12-extras.txt:10`) | y | y | y | Keep as-is. Best empty state in the app. Orients (why nothing here), motivates (still log if you want history), guides (where to go). |
| `/progress` first-week | "Sessions · 0 / 2" with "Signals · 3 fatigue · 1 outside load" (`persona-erratic/05-progress.txt:11-18`) | y | n | y | The 0/2 is fine as data. Motivate line missing: "You've missed both sessions this week. The engine holds load until you log — nothing degrades from silence." |
| `/today` graduate | "YOU FINISHED · Engine Builder · 9 weeks logged. Nice." (`persona-graduate/01-today.txt:11-15`) | y | y | y | Best celebration line in the app. "Nice." is voice-perfect — congratulations without the emoji-fireworks trap. |

**Verdict:** empty-state coverage is now 6/8 doing all three jobs. The two failures — /coach 404 and /history zero-log rows — are both routes that shouldn't exist in the state they render.

---

## 3. Proposal explanations (the core promise)

Persona-strength `/today` — 1 proposal card captured (the persona-recover set surfaces 2 more).

| Proposal | Has 'why'? | Cites source? | Verdict |
|----------|-----------|----------------|---------|
| "ROOM TO PUSH — HEADROOM ON YOUR LOG" (`persona-strength/01-today.txt:10-18`) | y | y (Rhea et al. 2003) | Excellent. "Because: 3 straight green days plus 'felt strong' in a recent note. The engine reads that as headroom." — orient, why, source, apply/ignore, all in ≤50 words. |
| "FATIGUE OR PAIN FLAGGED TODAY" (`persona-multitrack/01-today.txt:10-17`) | y | y (Halson 2014) | Good. "Because: Signal: life load 4/10. Consider trimming 5% from the top set." — the double "Signal:" is redundant. Kill one. |
| "YOU LOOK READY TO LEAVE REINTRO" (`persona-recover/01-today.txt:10-20`) | y | y (ACSM 2002) | Best-of-app. Names the two qualifying sessions, the between-sessions detail, the exact next phase. This is the paragraph the landing pitches. |

**Gap vs. landing promise:** the landing says *"Engine proposes. You Accept or Ignore."* — the app matches perfectly on these three cards. `Accept` in engine-copy became `APPLY BUMP` / `APPLY 5% LIGHTER` / `ADVANCE TO CYCLE 1 — FIRST REAL 5/3/1 FSL` — each verb-first, specific, and does what it says. The one nit: the exercise-id snake_case (`block_pull_midshin · 147.5 → 152.5 kg`) inside the top card leaks a machine identifier into a card that is otherwise the app's cleanest surface. See §4.

---

## 4. Error + negative states

| Where | Captured string | Problem | Rewrite |
|-------|-----------------|---------|---------|
| MoveSheet first tap | "That day already has a session. Tap Move session again to confirm you want to stack them." (`MoveSheet.tsx:164`) | Fine but wordy. 18 words, ≤15 target. | "That day has a session already. Tap Move again to stack them." (12 words.) |
| MoveSheet second tap | "OK — this will stack two sessions on that day." (`MoveSheet.tsx:163`) | Good. "OK" reads as acknowledgment, not filler. Keep. | Keep. |
| Skip confirm | "Marked as skipped. The engine reads that as an intentional off-day, not a missed one." (`week/page.tsx:707`) | Perfect. Names the mental model shift ("intentional off-day, not a missed one") without hedging. | Keep. |
| Amber banner on Today | "AMBER · Hold load. A 4-5/10 or morning stiffness over 30 min." (`persona-erratic/01-today.txt:10-11`) | The band definition ("A 4-5/10 or morning stiffness over 30 min") is Guide-copy, not banner-copy. Repeats what the user just felt. | "AMBER · Load held today. Engine dropped 5%." |
| Not-feeling banner | "Not feeling 100% · ×0.95 applied+1 more" (`persona-erratic/01-today.txt:13`) | The `+1 more` is a UI-string leak — reads like debug. And `×0.95` is math notation, not english. | "Not feeling 100% — dropped 5% today. +1 more signal applied." |
| Extension row | "Extended +4w · retest window pushed" (`account/page.tsx:184`) | "+4w" is fine — dense/scannable. "retest window pushed" is passive and vague. Pushed by what? | "Extended +4w · retest date moved to 25 Sept." (name the date so the user can sanity-check) |
| Revert extension body | "The retest window snaps back to the original end date. Your logs and phase progress stay intact." (`account/page.tsx:269`) | Excellent. Names what changes AND what doesn't — this is the Nicely-Said gold-standard: kind, specific, actionable. | Keep. |
| Delete confirm | "Everything goes — logs, training maxes, morning checks, server copies. This cannot be undone." (`account/page.tsx:382`) | Best-of-app for destructive confirm. Names four artifacts + irreversibility. Keep. | Keep. |
| Email change | "Email change ships soon · To change your sign-in email, contact sellinmargus@gmail.com for now. The in-app flow lands in a future release." (`account/page.tsx:281-291`) | Good. "ships soon" and "lands in a future release" are close synonyms — pick one. | "Email change ships soon · Contact sellinmargus@gmail.com to change your sign-in for now." (drop the second sentence — the mailto link makes it obvious) |
| HeritageClusterChip InfoSheet | "Cluster A · responding — engine read · No explanation available." (`HeritageClusterChip.tsx:65-79`) | P0 leak. "Cluster A/B/C" is HERITAGE-internal jargon. `metric_id` shown raw with snake_case, `verdict.replace(/_/g, " ")` is a machine-string patch. `"No explanation available."` is the empty-state fallback the user is most likely to hit. | Rename bands to "Responding · engine sees your metrics moving", "Under-dosing · consider more volume", "Not responding · time to swap arcs". Kill the `metric_id (role):` list; replace with the metric's display_name. Replace the fallback with: "The engine can't classify yet — needs at least {N} baseline readings." |

---

## 5. Forms & labels

- **Morning check labels** (`persona-erratic/13-check.txt:6-19`) — "Low back", "Any joint pain", "Muscle soreness", "Shoulder / upper body", "Woke me at night", "Morning stiffness", "Life load (0=fresh, 10=cooked)", "Outside training yesterday". Verdict: **excellent**. Every label is lay language ("Life load", not "perceived fatigue"), the 0-10 anchor is named inline ("0=fresh, 10=cooked"), and "Woke me at night" is direct without being clinical. Keep.
- **Symptom slider labels — lay vs. technical**: no `groin_left` or `hip_left` strings surface in captures. Passes.
- **Notes prompt** — captured on morning-check: "The engine reads these. Keywords like padel, hike, poor sleep feed today's proposal — no LLM, just a keyword parser, all done on-device." (`persona-erratic/13-check.txt:20-21`). Verdict: this reads as ONE meta-explainer rather than a per-field label. The actual "Outside training yesterday" input at line 19 has no placeholder guidance captured. Add placeholder: `e.g. "padel 2h, poor sleep, work stress"`.
- **MoveSheet "Why? (optional)"** (`MoveSheet.tsx:173`) — label good, placeholder "e.g. Family thing came up" (`MoveSheet.tsx:181`) is warm and specific. Best form microcopy in the app.
- **Session-log card** — Extras page: "Cross-modal work, walks, class attendance, mobility — anything not in the prescribed block. Optional. Nothing here changes the plan." (`persona-erratic/01-today.txt:20-21`). Verdict: keep. The three-part cadence (what fits / optional / doesn't change plan) is well-paced.

---

## 6. Onboarding

- Steps captured: none rendered in persona artifacts (personas skip onboarding via the harness). Reviewed source:
  - `OnboardingRunner.tsx:132` — "Skip setup" button. 2 words, actionable. Keep.
  - `ScanAnchorStep.tsx` — reads title + body from program JSON. Word budget is entirely at the JSON author's discretion; no in-component copy to audit.
  - FirstRunBanner: 5 tab-descriptions + one overflow-menu enumeration + one CTA.
- FirstRunBanner audit:
  - Title "Five tabs, one flow" (`FirstRunBanner.tsx:50`) — punchy, promise-shaped. Keep.
  - Tab descriptions ("Today — the session you're prescribed right now.") — 6-8 words each. Word budget passes.
  - **`FirstRunBanner.tsx:70` — P0 LEAK**: `"More lives behind the ⋮ menu (top right): Programs, Check, Extras, Coach, Report, Guide."` Coach was removed in Batch 25 (Guide + Profile) but this list wasn't updated. Fresh users will hunt for a tab that isn't there. Fix: `"More lives behind the ⋮ menu (top right): Programs, Check, Extras, Report, Data, Evidence, Guide."` (Match the Guide's `/guide/page.tsx:115-124` list exactly.)
  - CTA "Got it — start the day" (`FirstRunBanner.tsx:78`) — 5 words, verb-first with a temporal frame. Excellent replacement of the prior "Got it". Keep.
  - Dismiss aria-label "Dismiss five-tab tour" (`FirstRunBanner.tsx:57`) — accurate. Keep.

---

## 7. Tone vs. positioning

Landing promises (from `landing/src/i18n/dictionaries/en.ts`):
1. *"An engine, a skill, a lift, a stubborn joint. Terav writes that focus arc — the rest of your week is still yours. Every change cites a study."* (line 10)
2. *"You log a note. Engine proposes. You Accept or Ignore."* (line 48)
3. *"Ten minutes of questions and a short physical check. Tomorrow your first focus session lands — written against your history, with citations. You Accept or Ignore each change."* (line 91)
4. *"What Terav is not."* — a full negation list about scope. Positioning: sits alongside, not replaces.
5. *"Not fragile — sharpens against your log."* (memory from prior audit)

App matches:
- **Focus arc, not full plan** — passes. Programs page copy explicitly names each program as "one focus arc" (`persona-graduate/06-programs.txt:4`). No app string tries to be your whole week.
- **Engine proposes, you Accept or Ignore** — passes. Every proposal captured has `APPLY X` + `IGNORE` verbs. Persona-strength/01-today.txt:17-18 and persona-recover/01-today.txt:20-21 both deliver this cleanly.
- **Every change cites a study** — passes for the three proposals captured (Rhea 2003, Halson 2014, ACSM 2002). Where a proposal has *no* study — the "signal-based" proposals like `note-signals.ts` — the citation is a signal name ("LIFE LOAD 4/10"), which is honest.
- **Not fragile** — passes. Persona-recover Today reads confident, not fearful ("Two straight sessions above 80% TM at RPE ≤ 7 with no red/amber days. Mechanically you're done with Phase 1." — `persona-recover/01-today.txt:12`). No "consult your doctor" boilerplate on every card.
- **Not medical advice** — Report footer ("Generated by a self-tracking app. Not medical advice. Clinical decisions remain with the user's orthopaedist and physiatrist." — `persona-strength/10-report.txt:164`) is exactly the right register.

**Streak / motivational hits:** searched captures + source. Zero user-facing streak strings surface. The one "streak" is engine-internal (`adapt.ts:353,371,425-426` — "green-streak check" as a code comment, not UI copy). Pass.

**Emoji hits:** zero in captures. Pass.

**Motivational leak candidates:**
- "9 weeks logged. Nice." (`persona-graduate/01-today.txt:15`) — the "Nice." is the app's ONE motivational moment. Placed at graduation (rare-frequency), tone-appropriate (single word, understated). Keep.
- "Signals · 3 fatigue · 1 outside load" (`persona-erratic/05-progress.txt:17-18`) — signal-count as data, not exhortation. Pass.

---

## 8. Terminology map

| Concept | Terms in use | Occurrences (approx.) | Recommend one |
|---------|--------------|-----------------------|----------------|
| training unit | session (100+), workout (0), block (used only in the phase/program sense) | session wins | **session** — already dominant, keep. |
| load number | TM, Training Max, training-max, training maxes | 15+ | **TM** in UI chrome; **Training Max** on first mention (Guide handles this well). Keep as-is. |
| segment of program | phase (60+), cycle (5+, 5/3/1-specific), block (varied — sometimes a *phase*, sometimes a *lift group* like "block pull") | **block** is overloaded — see below | Reserve **block** for the JSON structure (exercise cluster); use **phase** for program-timeline chunks. Rename the graduation "NEXT BLOCK" card (`page.tsx:879`) to "NEXT ARC" or "NEXT PHASE". |
| effort scale | RPE (defined in Guide), "life load" (0=fresh, 10=cooked) | RPE 20+, life load 5+ | Keep both — they measure different things. |
| symptom color band | green / amber / red | consistent everywhere | Keep. |
| retest gate | retest (dominant), reassessment (not in captures), "retest window" (RetestReminder + /account) | retest ~15 | **retest** — settled. |
| proposal action | Apply / Accept / Ignore | Apply 8, Accept 0 in-app captures, Ignore 8 | The landing says "Accept or Ignore". The app says "APPLY X". Not a mismatch — "Accept" is the mental model, "Apply +5" is the specific verb. Keep the app's specific verbs. |
| exercise names | display_name (Guide + Today session labels) vs. exercise_id snake_case (`block_pull_midshin`, `back_squat_highbar`, `front_squat`) | display 30+, snake_case 8 | **Drift — display_name should win everywhere.** See §9-P1. |
| metric names | display_name ("Submax HR at pace-5") vs. metric_id ("submax hr at pace-5" lowercase) | display 20+, id 2 | Fix: `persona-multitrack/01-today.txt:21` and `persona-strength/05-progress.txt:14`. |

**Overloaded "block":** the word appears as (a) the JSON structural container (`blocks[]` in program.json), (b) a lift name suffix ("Block pull, mid-shin"), (c) a marketing chunk ("Block 2 of the 3-block engine transformation" — `persona-graduate/06-programs.txt:29`). The user reads "block" three ways in one screen. Recommend: keep the marketing usage ("Block 1: Base"), keep the lift name, but rename the "NEXT BLOCK" graduation card to "NEXT PHASE" (or drop the label — the card content self-orients).

---

## 9. Priorities

### P0 (copy blocking product promise)

- **`next-app/src/components/FirstRunBanner.tsx:70`** — remove "Coach" from the overflow-menu enumeration. Batch 25 shelved Coach; first-run users will search for a tab that isn't there. Replace with: `"Programs, Check, Extras, Report, Data, Evidence, Guide."`
- **`next-app/src/components/progress/HeritageClusterChip.tsx:62-79`** — kill "Cluster A / B / C" jargon in the pill and InfoSheet. Rename bands to "Responding" / "Under-dosing" / "Not responding". Remove the `metric_id` snake_case list at line 74; render `display_name` instead. Replace `"No explanation available."` fallback (line 69) with `"Needs {N} more baseline readings before the engine can classify."`
- **`next-app/src/app/coach/*` (deleted route)** — remove or redirect. Personas hit a bare 404, not a soft-landing. Options: 302 to `/` with a toast, or replace with a 200-page: `"Coach isn't part of the beta. The engine proposes on Today — see how in the Guide."`

### P1 (do this month)

- **exercise_id snake_case leaks** — `persona-strength/01-today.txt:14`, `persona-recover/01-today.txt:14-15`, `persona-strength/05-progress.txt:14`. Three call sites need to resolve `exercise_id → exercises[id].display_name` before render. Grep for occurrences in `page.tsx` (proposal cards), `progress/page.tsx` (weekly top lift), `report/page.tsx` (load progression header uses display_name correctly — model the fix on that).
- **metric_id lowercase leak** — `persona-multitrack/01-today.txt:21` — "Trending well on submax hr at pace-5 (row 2:00/500m) — consider a tier-up on Progress". Resolve to display_name capitalisation: "Trending well on Submax HR at pace-5 — consider a tier-up on Progress."
- **Amber banner reduplication** — `persona-erratic/01-today.txt:10-11`. The banner echoes the Guide's band definition instead of stating what the app *did* today. Rewrite: `"AMBER · Load held. Engine dropped today's top set 5%."`
- **"×0.95 applied+1 more" leak** — `persona-erratic/01-today.txt:13`. Math notation + concatenated `+1 more` reads like debug. Split: `"Not feeling 100% — dropped 5% today. +1 more signal applied."`
- **RetestReminder arrow syntax** — `page.tsx:1201`: "Log these on Progress → Insights". The `→` is doing double duty (nav breadcrumb + visual). Screen-reader hostile. Consider: `"Log these on Progress, Insights tab."`
- **Extension row "retest window pushed"** — `account/page.tsx:184`. Passive + vague. Name the new date: `"Extended +4w · new retest date 25 Sept"`. Requires state access to compute; if that's costly, at minimum active-voice: `"Extended by 4 weeks. Retest window moved."`
- **/history zero-log flood** — persona-erratic captures 30 rows of "0 done". Consider hiding zero-log rows behind a toggle, or replacing "0 done" with the day's scheduled session name struck-through (data the user can act on).
- **"Show rules of the week" disclosure trigger** — `persona-erratic/02-week.txt:57`. The `▸ Show rules of the week` uses a caret + long copy. Prefer `"Show this week's rules"` (matches the "rules" domain word already on page).
- **MoveSheet first-tap warning wordy** — `MoveSheet.tsx:164`. 18 words vs. 15-word target. Trim to: `"That day has a session already. Tap Move again to stack them."`

### P2 (polish)

- **"Nice." (`page.tsx` graduation)** — the one motivational moment. Perfectly placed; consider whether the ADD-A-STAR-RATING widget below it ("HOW WAS THIS ARC? · 1 2 3 4 5") undercuts the celebration by immediately asking for feedback. Move the feedback below the fold or delay it 24h.
- **"MORE" section header on Profile** (`persona-erratic/08-profile.txt:16`) — this is an all-caps eyebrow above Guide/Privacy/Terms/Medical disclaimer. "MORE" is content-free. Prefer `"HELP & LEGAL"` or drop the eyebrow entirely — the four links self-orient.
- **`INTAKE PENDING` pill** (`persona-erratic/08-profile.txt:14`) — pill correctly flags a state, but there's no adjacent CTA to actually complete intake. Add: `INTAKE PENDING · Complete →` linking to onboarding.
- **"nothing" legend label** — `persona-erratic/04-history.txt:24`. Rename to `"no log"` or `"—"`.
- **Program status pill "GRADUATED"** (`persona-graduate/08-profile.txt:12`) — celebratory tone would land better as `"COMPLETE"` or keep `"GRADUATED"` and pair with the arc-verdict color from the Today card.
- **"Sign-in" vs. "Signed-in identity" (Guide)** — `account/page.tsx:128` uses "Sign-in", Guide line 66 uses "Signed-in identity". Small drift; harmonise to "Sign-in" (shorter, more scannable).
- **Multitrack meta-line: "2 tracks scheduled today. If it's too much, snooze one from Profile."** (`persona-multitrack/01-today.txt:23`) — good copy. But "snooze" is undefined elsewhere in the app; consider "pause" (the same verb the graduation card uses at `page.tsx:919-921` for `pauseProgram`).
- **Programs cadence hint** — `persona-graduate/06-programs.txt:6`: "REFERENCED = every claim cites a paper, simulator harness passes. REVIEWED = domain specialist has audited the citations against literature. VERIFIED = ≥5 users completed the arc with subjective success." Excellent trust-hierarchy explanation. Consider surfacing the same triage in the Guide.

---

## Appendix — strings I looked for and didn't find (good)

- No "streak", "keep going", "great job", "you're crushing it", firework emoji.
- No "consult your doctor" boilerplate on every card (the Guide's red-flags list handles it once, prominently).
- No `groin_left` / `hip_right` symptom-id leaks.
- No `HERITAGE` codename in user copy (it stayed in comments only — grep confirms).
- No "Coach" in Guide or Profile (Batch 25 removed cleanly except FirstRunBanner leak).
- No pronunciation guides or meaning-annotations on "Terav" — brand memo respected.

## Appendix — brand casing

Wordmark renders as `TERAV` (uppercase) in `AppShell.tsx:125` and in every persona capture. Landing dictionary treats it as `Terav`. Not a drift — the uppercase in-app is a typographic choice (wordmark rendered as a small-caps stack), and the landing prose uses sentence-case. Both surfaces consistently apply their choice. No action.
