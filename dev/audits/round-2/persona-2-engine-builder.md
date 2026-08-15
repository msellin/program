# Persona 2 — Engine Builder audit

## Persona recap

I'm a 42-year-old carpenter, hands-on all day, 5 years of casual lifting behind
me, no formal aerobic block. I got winded on stairs and want to fix it before
it becomes a health story. My wife is a nurse so she watches me like a hawk
whenever an app claims to know anything medical. Android + Garmin 55. Push
tier per intake, no known joint issues.

---

## Blockers

None fatal. The intake and program actually run end-to-end for me. The
following are hard friction, not stops.

1. **Two "consent" bundles disagree with each other.** `engine-builder.json`
   declares `intake.consent[]` (2 items: `not_medical_advice`,
   `symptom_logging`) AND a question `consent_symptom_data` inside
   `intake.questions[]` (line 244). The wizard groups the question under
   "Screening" via the SCREENING_IDS set
   (`next-app/src/app/programs/[slug]/intake/IntakeClient.tsx:225-234`),
   but that same statement re-appears verbatim in the "Consent" section as a
   checkbox. I tick it twice, once as a yes/no button and once as a
   checkbox. Feels sloppy and could look like double-consent for GDPR
   purposes.

2. **Sign-up says "Free during beta"**
   (`(auth)/sign-up/page.tsx:94`) but the round-2 shared context explicitly
   says "No pricing language yet ('Free during beta' was removed on
   purpose)." The one on the landing was removed; the one on the auth
   sign-up wasn't. That is a live public tone violation.

---

## Bugs

1. **DayAdjustmentProposal never renders for me.**
   `SignalsStrip.tsx:57` and `DayAdjustmentProposal.tsx:80` both hard-gate
   `strengthPrimaryPrograms = new Set(["anterior-hip-rebuild"])`. This
   directly kills the "Cardio-load signal — after logging a hard 45-min run,
   does the next-day session card acknowledge it?" test case: the code path
   that acknowledges externalLoad in `note-signals.ts:186-216` exists, is
   correctly computed, is written into `NoteSignals`, and then the only
   consumer that would surface it to a user is program-gated to hip. Engine
   Builder users get zero next-day acknowledgment of yesterday's hard run.

2. **Push-tier layout override is only wired for a couple of weeks.**
   `engine-builder.json` declares `push_tier_override` on week_2 and week_6
   (lines 712 and 863). Weeks 3, 4, 5, 7, 8 use `push_tier_override_note`
   (a plain string sitting under `week_5`, line 816) or nothing at all.
   `schedule.ts:135` reads `.push_tier_override` and silently falls back to
   `.layout` for the others. So my Push tier plan is Push only every other
   week and vanilla Progression in between. Either add the missing weeks
   or drop Push from the tier picker.

3. **Push tier is offered even when the user answered `days_per_week=3`.**
   The tier condition is `cardio_hours_per_week >= 4 && ...` — days per
   week isn't in the gate. So a carpenter who does 5 hours of casual
   cycling on weekends but can only train 3 days lands on Push, which
   ships a 4-session week 6. The wizard's capacity gate
   (`IntakeClient.tsx:87-96`) only checks against
   `session_count_per_week_range` (2-5 per this program) which is
   trivially satisfied at 3. Push should require `days_per_week >= 4`.

4. **Intake wizard silently accepts empty `physical_tests`.** All four
   tests are optional (no `required: true`), and the section is
   `<details>`-collapsed. Skipping is one tap. Then in
   `IntakeClient.tsx:114` the tier inference uses `testResults` (empty). If
   I as a beginner skip everything but the wizard already saw
   `cardio_hours_per_week=5`, I get slotted into Push based on a
   self-report I might've inflated. The wizard should require ≥1 physical
   test for Push and Progression tiers, or clearly warn.

5. **`intake.duration_days = 5` on the preview page** — the ProgramPreview
   copy at `ProgramPreviewClient.tsx:209` says "Starts with a 5-day
   intake". That's misleading: nothing about the wizard takes 5 days;
   it's a `duration_days` field with no code path attached. The 5 days
   is the *measurement window* for resting HR + submax HR. Users will
   read "5-day intake" and expect an app-driven onboarding across 5
   days.

6. **`RunSlotCard` renders even when the day already scheduled a
   `block_z1_steady`.** On Today for Wed of week 3 (sustained tempo),
   the app renders the prescribed tempo block AND then a "Log an
   extra session" card underneath (page.tsx:211). The generic slot
   copy says "Cross-modal work, walks, class attendance… Optional.
   Nothing here changes the plan." — but I've already got a scheduled
   cardio session above. There's no coordination between what's
   scheduled and what "extra" means; two log surfaces compete.

7. **`intake.consent[]` items don't have i18n and lie about scope.** The
   `symptom_logging` consent line says "Data stays on my device /
   account and isn't shared." That's inaccurate: the user's data does
   go to Supabase (they see the uid on the Profile page). Not shared
   with third parties, sure, but "on my device" is wrong.

---

## UX gaps

1. **"Your plan is built" reveal is thin for me.** `YourPlanCard` shows
   headline + schedule + tier + up to 4 phase lines. The phase names
   from `engine-builder.json` are things like `"Week 1 — pure Z1
   introduction"` which read fine, but phase 4 says "first Norwegian
   4x4" — as a first-time user I have no idea what that is until I
   crack open Guide. Reveal card would land harder if it linked to
   the Guide "Endurance terms" section inline.

2. **No baseline capture UI.** The program tells me resting HR + submax
   HR are the "single most sensitive early indicators" (JSON line 295),
   yet neither the intake wizard nor Week 1 Today ever prompts me to
   actually record them. I can log them into RunSlotCard as an "other"
   session but that's not a baseline field. If the retest is comparing
   nothing to nothing, the program's Block 1 outcome is empty.

3. **The reveal card only fires once, ever.** After I dismiss it, it
   doesn't come back after the first cycle end or when the tier
   changes. If I move from Foundation → Progression at week 4, no
   "your plan sharpened" moment.

4. **Skipped days are invisible on Today.** I skipped Fri and Sat of
   week 2 (child was sick). Today's card the following Monday just
   shows the Mon session; no "you skipped 2 sessions, here's how the
   plan adjusts" acknowledgment. The `program.principles[]`
   `placement_principles` line (JSON:952) about "If you skip the hard
   session, do not double up next week" only lives inside the JSON,
   not in the UI.

5. **`humanBlockName` in `page.tsx:363-365` strips useful context.** It
   removes `(Phase … week …)` parentheticals, which is right for hip.
   For me it also strips clarifying text a Push user needs, e.g. a
   block named "Threshold cruise (3×10 min for Push)" is displayed
   just as "Threshold cruise" with no Push-specific hint.

6. **Cycle-end evaluator is 5/3/1-only.** `evaluateCycleEnd` in
   `progress/page.tsx:63` still assumes a 4-week 5/3/1 cadence. For
   Engine Builder, the cycle boundary is week 8 (retest), not every 4
   weeks. The banner never fires for me; the "Insights" tab feels
   dead until much later than it should.

7. **RunSlotCard `2K test` chip is bizarre in Engine Builder.** The
   activity picker offers "2K test" as a session type
   (RunSlotCard.tsx:442). Engine Builder's retests are 500m row TT
   and 1km run TT (JSON lines 309 and 318). There's no 2K test in
   this program. Wrong retest name.

8. **HR fields don't offer a "HR max estimate" auto-fill.** The intake
   asks for max_hr_estimate (JSON:234) then uses 208 − 0.7 × age as
   fallback. But nowhere in the app do I ever see what HR zones I'm
   working to. Z1/Z2/threshold copy tells me "65-75% max HR" but the
   app knows my max HR estimate. Show me the numbers.

---

## Copy issues

1. **`Block 1 of a 3-block engine transformation arc`** in the JSON
   `status_note` never surfaces in the UI. The program looks like an
   8-week one-and-done to me. If Blocks 2 + 3 exist as a promise, say
   so on the program page (Progress + Today are silent).

2. **"engine composite score" (JSON:432)** — literal jargon. `program_goal.display_name`
   is "Engine composite (Block 1)". Meaningless to a carpenter. Say
   "aerobic base score" or don't display it.

3. **The Coach "coming soon" page uses "your morning check history and
   flags patterns worth taking to your physio"** (`coach/page.tsx:298`).
   I don't have a physio. Non-rehab users see "physio" and get
   confused. Should read "your clinician / GP".

4. **Guide's "500m split" definition** (`guide/page.tsx:45`) says
   "A 2K in 7:35 = ~1:53.7 avg split." Fine for someone who's done a
   2K. For me: what's a 2K? Say "A 2000-metre row" the first time.

5. **Guide's "Taper" line** — "Bosquet 2007 meta-analysis: correctly
   done, a taper adds ~3% to peak performance." That's the kind of
   claim my wife will roast me for. Either drop the number or point
   at the citation.

6. **Endurance terms section mixes acronyms unequally.** "LT1"
   appears in the Z2 definition (`guide/page.tsx:34`) undefined.
   "MLSS" appears in Threshold header but is not expanded. LT2 is
   included by parenthetical. This is a knowledge inconsistency:
   define LT1, MLSS or don't use them.

7. **Norwegian 4x4 substitutions in JSON have a smart-quote key**
   (`if_hr_won't_climb_on_set_1`, line 635). Curly apostrophe in an
   object key is a smell; nothing will read it back correctly.

8. **Hero-state card copy is strength-flavoured.** For amber it says
   "Load with care · Hold today's prescription. Don't push."
   (HeroStateCard.tsx:12). "Prescription" is fine, but on a Z1 day
   there's no "hold" — the whole point of Z1 is you can't overdo it.
   Copy should be modality-aware.

9. **RunSlotCard warm-up primer defaults to running-specific drills**
   ("A-march", "Skips or strides") for every non-hip program
   (RunSlotCard.tsx:572). If I'm doing an indoor row, "controlled leg
   swings" is fine but "Skips or strides — 4 × 20 m at rising effort"
   is wrong. Modality-mismatch.

10. **Profile identity card shows raw uid.** `profile/page.tsx:107`
    surfaces `uid: <supabase uuid>`. That's implementation leak; my
    wife will call it "user tracking ID". Hide behind an "Account
    details" expander.

11. **Contraindications helper text** (`profile/page.tsx:337-339`)
    says "Movements or positions that hurt or shouldn't be programmed
    for you. Show up on your specialist report." — grammatically the
    second sentence has no subject. Read: "They show up on your
    specialist report."

12. **`week_5` note in JSON uses a stray field** `push_tier_override_note`
    (line 816) — a *string* field with the same prefix as the array.
    `schedule.ts` never reads it. Dead data.

13. **Guide "Coach" row** (`guide/page.tsx:107-110`) says the Coach
    "reads your full log, TMs, milestones, and clinical context each
    turn." But the Coach page for me shows a "coming soon" — the
    Guide overpromises. Sync the two.

14. **Sign-in page brand line "— sharp"** (`sign-up/page.tsx:90`)
    reads like an inside joke. The landing page has this too. If
    "Terav = sharp" is important, own it in a subtitle, don't
    mumble "— sharp" in 11 px muted text.

---

## Visual / graph issues

1. **`/progress` Insights tab shows a big empty chart at N=0.** The
   `SymptomLoadChart` (`progress/page.tsx:290-294`) receives an empty
   day array during my first week and renders a "Loading chart…"
   placeholder then an empty axis frame. No empty-state copy. On
   phone it's 300 px of blank space.

2. **`/report` "Aerobic sessions in range" list is fine data,
   ugly UX.** It's a flat `ul` of monospace lines. For 16-20
   sessions across 4 weeks it becomes a wall. Group by week or add
   a per-session badge (Z1 / tempo / VO2max). Currently
   `report/page.tsx:229-273`.

3. **`YourPlanCard` phase bullets scale poorly.** For Engine Builder
   there are 8 phases but the card shows only the first 4
   (`reveal-copy.ts:53`). The other 4 are silent. The card promises
   "Composed for: …" and doesn't show me the arc I'm actually on.

4. **Endurance terms section has no visual hierarchy.** Every term is
   `<strong>Term.</strong> body sentence`. Six terms rendered as a
   single wall of prose. Reads like a textbook. Would benefit from a
   two-column layout or per-term callouts on desktop.

5. **RunSlotCard's post-run static-stretch warning** is red-text on a
   sheet with white bg — fine — but on the small-screen sheet the
   text truncates against the close button.

---

## Sub-tab specific findings

**Progress → Lifts.** Correct that Hip tab is hidden for me
(`progress/page.tsx:118`). But Lifts tab is *entirely* strength lift
oriented: `PRIMARY_LIFTS = ["back_squat_highbar", "front_squat",
"block_pull_midshin", "deadlift_conventional"]` (line 24). I do
squat and DL casually but Engine Builder's whole point is aerobic,
so Lifts as my landing tab is jarring. The TM editor persists but
none of these TMs feed into the aerobic prescription. Consider
adding an "Aerobic baseline" section (rest HR, submax HR at intake
pace, current Z1 sustainable duration) that mirrors the TM editor
for endurance users, or default the tab order for aerobic users
to Insights first.

**Progress → Insights.** WeeklyNarrativeTile appears but
`SymptomLoadChart` is meaningless for a Z1 program — I don't have
symptoms, and my "load" is minutes not kg. Chart title reads
"Symptom vs load" for a program where neither axis is what I care
about.

**Report page.** Aerobic sessions list is good in principle but
misses total-week aggregation, which a printout for a coach or
clinician wants: total Z1 minutes, hard-session count, avg session
HR. All computable from the same data.

---

## Positive callouts

1. **Intake wizard's safety_gates read from the program JSON** — the
   architecture (`IntakeClient.tsx:74-98`) is exactly right: each
   program declares its own screen questions and refuses if
   unsafe answers appear. The gate for unmanaged hypertension +
   pregnancy + post-COVID + exertional syncope is genuinely careful.

2. **The capacity gate that stops a 2-day/wk user from starting a
   3-day/wk program** (line 87-96) is *the* honest move most
   fitness apps refuse to make. "This dose won't hit the promise" —
   love this.

3. **`engine-builder.json` acknowledges concurrent strength
   interference and cites Hickson 1980 + Wilson & Loenneke 2012.**
   As a strength-first user, this is exactly the copy that makes me
   trust the recommendation to hold, not chase, PRs during the block.

4. **Push tier only offered when actually beneficial** — the JSON
   says "smaller absolute drop because you started lower … Bigger
   gains come in Block 3's polarised phase." That's honest framing
   with a citation to Seiler. Nice.

5. **`RunSlotCard.parseGpx` runs client-side** (line 187-197). File
   never leaves the device. My wife will approve.

6. **`RunSlotCard` mm:ss duration input**
   (RunSlotCard.tsx:349-378) with two separate min / sec fields
   and a colon between them is genuinely mobile-friendly. And the
   `parseTimeToSeconds` helper handles bare seconds too — smart
   fallback.

7. **`/report` printable stylesheet** (`report/page.tsx:561-599`) is
   thorough and clean. Print → Save-as-PDF will actually produce
   something a coach could read.

8. **Coach "coming soon" page is honest about scope.** No
   "opens in Q4" — just what it will do when it ships. That's the
   right tone for beta.

---

## Priority fix list (top 10)

1. **Remove "Free during beta"** from `(auth)/sign-up/page.tsx:94`
   to match the intentional removal on the landing.
2. **Wire cardio-load acknowledgment to non-hip programs.**
   Widen `strengthPrimaryPrograms` (`SignalsStrip.tsx:57`,
   `DayAdjustmentProposal.tsx:80`) or move the trigger to a
   program-agnostic externalLoad path.
3. **Add `days_per_week >= 4` to the Push tier condition**
   (`engine-builder.json` plan_tiers[2].condition) — Push
   requires 4-session weeks; today the gate never enforces it.
4. **Fix the double-consent for `consent_symptom_data`** — pick
   one place (screening question OR consent checkbox), remove
   the duplicate.
5. **Fill missing `push_tier_override` for weeks 3, 4, 5, 7, 8**
   in `engine-builder.json` or drop Push from the visible tier
   options until they're written.
6. **Replace "physio" with "clinician" in Coach copy**
   (`coach/page.tsx:298`) — non-rehab users won't have a physio.
7. **Add baseline-capture UI in Week 1** (resting HR + submax HR
   entry) so the retest at week 8 has something to diff against.
   Right now the program's outcome claim is untestable.
8. **Guide's Coach row overpromises** (`guide/page.tsx:107-110`) —
   fix the "reads your full log" line to say "will read, once the
   Coach ships".
9. **Progress → Lifts is wrong first-tab for aerobic users.**
   Default to Insights for programs whose primary blocks are
   `category: run`, or add an aerobic-baseline section to Lifts.
10. **RunSlotCard's warm-up primer should switch drills by
    activity type** (`RunSlotCard.tsx:562-585`) — running drills
    on a row day is a mismatch, small but repeated across weeks.

---

*Word count: ~1990.*
