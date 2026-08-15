# Persona A — The Cautious Browser

## 1. Persona recap

36 y.o. male, 8 years mixed CrossFit + strength, no aerobic base. Signed up to
kick the tyres — reads every menu item before committing, expects the Coach to
say something real, ends up picking Engine Builder because aerobic capacity is
his gap. Empty-account first, then 2 sim-weeks on Engine Builder.

---

## 2. Empty-account tour findings (before picking a program)

Bottom-nav visit order after signup: Today → Week → Progress → History →
Profile. Overflow strip discovered later.

### F-A-01 — "Terav" brand is Estonian. The audit brief lists this as a kill target

The audit brief says "any trace of Estonian text on the app UI (we killed
Estonian in the app for now)." The word **Terav** (Estonian for "sharp")
appears eight times as a visible brand mark. If the brand is being retained
intentionally, the audit's kill rule needs an explicit carve-out; if not,
it's the most user-visible violation:

- `src/app/layout.tsx:25,32` — page title + Apple web app title.
- `src/app/(auth)/sign-in/page.tsx:69`, `sign-up/page.tsx:89`,
  `reset-password/page.tsx:62` — auth pages open with a mono "TERAV" wordmark.
- `src/app/guide/page.tsx:9` — first section header on the Guide reads
  "How **Terav** plans training".
- `src/app/data/page.tsx:54,61` — Web Share sheet uses "Terav log" as title.
- `src/app/profile/page.tsx:281` — backup file names `terav-backup-YYYY-MM-DD.json`.
- `src/lib/personalization/reveal-copy.ts:121` — fallback program name.

A cautious first-time user reads "Terav — sharpen the plan" in the browser
tab and has no idea what it means. Either drop the Estonian brand for now or
own it with a one-line English explainer near the auth wordmark.

### F-A-02 — Today's empty state is clean but drops the FirstRunBanner INSIDE the "Pick a program" state

`src/app/page.tsx:93-96` — when hydrated + no active program, the page short-
circuits to `<NoActiveProgram />` and never mounts `<FirstRunBanner />`,
`<HeroStateCard />`, `<SignalsStrip />` etc. That is correct visually. The
consequence, though: the first-time onboarding banner "Your training data
stays on your device and syncs to your account…" (privacy pitch) is NEVER
shown to a fresh signup on Today. It only appears AFTER a program is picked,
by which point the user is looking at their first prescription. The persona
who ticked two consent boxes 45 seconds ago now wonders where the promised
data-safety story went. Consider moving the FirstRunBanner ABOVE the
NoActiveProgram card, or paste a one-line "Your data lives on your device
and syncs when signed in" under "Pick a program".

### F-A-03 — Every empty-state header links to `/programs` but never the intake wizard

`/`, `/week`, `/extras`, `/progress`, `/report` all render an identical
"Browse programs →" CTA. On a phone, that's five identical CTAs in a
row-by-row tour. Nothing wrong with it — it's the "right" answer — but by
the fourth tab the cautious browser is thinking "the same button in five
places… does anything work here yet?" A single one-line variant per page
would signal that each tab knows why it's empty (e.g. "Pick a program to
see your weekly rhythm", "…to see your PRs and milestones", etc.). The
copy already varies; the CTA does not.

### F-A-04 — Progress renders "Lifts / Insights" tabs on empty account but the tabs read as available

`src/app/progress/page.tsx:80-94` — Progress renders the empty-state card
BEFORE the `<ProgressBody />` mounts, so tabs never render. Correct.
Verified. No regression.

However, `/report` shows a CTA button `Export report` in the header
(`progress/page.tsx:181-186`) that a fresh user cannot see because
`ProgressBody` isn't reached. Not a bug, just noting the plumbing is right.

### F-A-05 — Coach is not in the bottom nav, not in the overflow menu

`src/components/nav/BottomNav.tsx` — 5 tabs: Today, Week, Progress, History,
Profile. `src/components/nav/HeaderQuickLinks.tsx` — 6 items: Programs,
Check, Extras, Report, Data, Guide. **Coach appears in NEITHER.** The only
entry point is Profile → "See what's coming" (`profile/page.tsx:193`) or a
direct URL. A cautious browser who reads the Guide will see "Coach. Coming
soon…" and then hunt for the tab. There is no tab. Either add Coach to the
overflow (it's already listed on Guide as a top-line row on line 107) or
strike Coach from the Guide's "How to use the tabs" section — it's not a
tab.

### F-A-06 — Guide "How to use the tabs" is out of date vs current nav

`src/app/guide/page.tsx:99-114` documents Today, Week, Extras, Check,
Coach, Progress, History. Missing: Profile, Programs, Report, Data. And
Extras+Check+Coach aren't tabs on the bottom nav any more (per BottomNav.tsx
which shows Today / Week / Progress / History / Profile). The Guide still
describes a nav that doesn't exist.

### F-A-07 — Coach page copy still ships program-specific starter prompts even before program picked

`src/app/coach/page.tsx:15-51` maps 6 program slugs to prompt lists;
`DEFAULT_STARTERS` (52-57) is used when no slug is set. Verified: the empty-
account persona gets the generic starters. Good. **But** the empty-state
list still includes "Am I on track for my program's retest metric?" which
reads oddly before a program is picked. Trim to two neutral prompts on
empty account ("Explain how the app plans training", "What's a good starting
program for me?").

### F-A-08 — Coach "Coming soon" copy: rewrite is good, one instance of "physio" survives

`src/app/coach/page.tsx:295-357` — the rewrite is genuinely useful. The
four "What it'll do" bullets read like real product, not a placeholder. One
remaining issue: line 341 says "flags patterns worth taking **to your
clinician**" — that's the fix. Was previously "physio" per round 2. Fix is
verified. **However** the "Meanwhile" section (347-353) still references
"morning-check history" as something the coach will read, which for an
Engine-Builder / rower / handstand user isn't the primary logged signal.
Consider "the morning-check + session-log history…" or generic phrasing.

### F-A-09 — Check page renders GENERIC_REGIONS with meaningful defaults on empty account

`src/app/check/page.tsx:25-30` — verified. When there's no program the
generic labels are "Low back / Any joint pain / Muscle soreness / Shoulder /
upper body". Sliders work. The bottom of the form ("Outside training
yesterday") mentions "the engine treats keywords here (padel, hike,
tired…) as external load and factors it into today's proposals." For a
user with no program yet, there is no "today's proposals" — the copy
overreaches. Add a hydration guard or soften to "…for programs that use
external load signals."

### F-A-10 — Extras page: verified empty-state is clean, no anterior-hip leak

`src/app/extras/page.tsx:31-46` — verified. Renders "Pick a program to see
accessory work…" with a Browse programs CTA. No categorical rendering of
hip content. Round-3 fix confirmed.

### F-A-11 — Week page: verified empty-state fires, no fallback schedule leak

`src/app/week/page.tsx:68-83` — verified. Renders "Pick a program to see
the weekly rhythm here." Round-3 fix confirmed. Reviewer note in the code
(`page.tsx:54-59`) explicitly documents the intent. Good.

### F-A-12 — Report page: empty-state renders but sits behind `hydrated` guard order

`src/app/report/page.tsx:76-100` — the guard order is `error → hydrated →
primarySlug → program/report`. For a fresh account the flow lands at line
84 briefly ("Loading…") then line 85 ("Pick a program…"). One frame of
"Loading…" is visible on slow phones. Not a bug, just cosmetic.

### F-A-13 — /guide referenced by /coach "coming soon" as `physio` clone

Already caught in F-A-08. Also note `guide/page.tsx:139` still uses
"physio" ("Screen for inflammatory pattern"). Not a copy issue per se, but
persona A (no physio, has GP) reads "physio" as a rehab context this app
apparently assumes. Recommend "clinician" throughout for user-facing UX.

### F-A-14 — /data references old app URL that isn't the cautious-browser's context

`src/app/data/page.tsx:249-257` — the "Paste JSON" section says "Coming
from the old app at program-f3r.pages.dev?". A brand-new signup has no
"old app". This is dead copy for a first-timer. Gate on "logs.length ===
0 && training_maxes.length === 0", or fold it into a `<details>` block.

### F-A-15 — Profile → Data & privacy behaves cleanly on empty history

`src/app/profile/page.tsx:179-188` — Export My Data downloads an empty
JSON store, which is technically correct. No errors, no crashes. However
the button says "Export my data" with a JSON badge — a user with 0 logs
downloading a 200-byte file is odd. Consider disabling the button or
adding a helper "Nothing to export yet — comes to life after you log a
session."

---

## 3. Intake + first-session findings (Engine Builder)

Persona A picked Engine Builder from the catalog. `/programs` catalog
renders fine — hip program is `personal:true` and correctly hidden from
public browse (verified `src/app/programs/page.tsx:36-42`).

### F-A-16 — Engine Builder preview lists "5-day intake" — misleading

`ProgramPreviewClient.tsx:220` (via `intake.duration_days = 5` in
`engine-builder.json:71`). Says "Starts with a 5-day intake — 15 short
questions and 4 benchmark tests". Nothing about the wizard takes 5 days —
the 5 is the measurement window for resting HR + submax HR. Cautious
browser reads "5-day" and thinks "I have to wait 5 days to start??" and
bounces. Reword to "Baseline setup (5-day HR window optional)". Round 2
also flagged this — still not fixed.

### F-A-17 — Intake wizard: 22 questions, ~5 screens on phone, no progress indicator

`src/app/programs/[slug]/intake/IntakeClient.tsx` renders three
`<QuestionGroup>` panels + optional physical tests + consent. On my phone
the screening panel alone is 8 items requiring scrolling. There's no
progress bar or "8 of 22" chip. Cautious browser abandons three questions
in. Add either a stepper (Screening → About → Skill → Review) or a
"required questions answered: X / Y" caption on the sticky bottom bar.
Currently the button just says "Answer required questions to continue"
which doesn't tell me how many I have left.

### F-A-18 — Wizard heading dupe: "Screening — Safety gates" AND questions labeled twice

`IntakeClient.tsx:397-405` renders a title "Screening" with hint "Safety
gates — a few no-questions before we start." Then the first question is
`hypertension_unmanaged` (from `engine-builder.json:266`) which reads
"Do you have unmanaged high blood pressure…?". The screening title uses
the phrase "no-questions" which reads like "questions we say no to" or
"no-questions asked". Reword to "quick safety filter".

### F-A-19 — `consent_symptom_data` question appears in "Screening" AND consent list — de-dup rule is right but the code path is fragile

`IntakeClient.tsx:274-278` — `CONSENT_IDS` set contains
`consent_symptom_data`, and screening/skill/about filters strip it out
so it only renders once as a consent checkbox. Verified fix from round 2.
But the fix only covers exactly that one id. Engine Builder authors
adding more consent-flavoured questions would repeat the same double-
consent bug. Consider filtering by `q.id.startsWith("consent_")` or by
metadata on the question itself.

### F-A-20 — Days-per-week capacity gate is dead code for Engine Builder

`IntakeClient.tsx:86-96` — the capacity gate fires when `days_per_week`
< program's `session_count_per_week_range[0]`. Engine Builder's range
is `[2, 5]` (`engine-builder.json:401`). A user answering
`days_per_week=2` passes. That's fine per the JSON, but the safety
guardrail described in `intake.questions[0].help` — "If your ceiling
is 2, we'll tell you upfront whether this program can deliver on its
claim at that dose" — never fires because 2 is inside the range. Either
raise the range floor to 3 (evidence-based: Block 1 needs ≥3 sessions
for the promised 5-8% VO2max delta) or drop the "we'll tell you"
promise from the question help.

### F-A-21 — Tier picker after intake: no explanation of why the recommendation was made

`IntakeClient.tsx:305-314` renders "Recommended: {tier_label} — Based
on: {formatVars(inferred.vars)}". `formatVars` prints e.g.
"cardio hours per week ≈ 3, days per week ≈ 4". Two numbers. No prose,
no "we picked Progression because you have 3 hours of prior cardio and
can sustain 20-min continuous". The cautious browser sees a number soup
and doesn't trust it. Add a one-line explanation from the tier's own
`typical_outcome` field or the tier's `condition` reworded in plain
English.

### F-A-22 — After committing intake: reveal card fires with schedule_line built from `deriveSessionCount`

`YourPlanCard.tsx:74-88` uses `buildRevealCopy` which relies on
`deriveSessionCount` (`reveal-copy.ts:135`). For Engine Builder's
`weekly_template.week` shape (verified via program JSON), the count logic
should read correctly. Cautious browser sees the reveal card. Good.
Reveal card promises `attribution_line` at the bottom — needs empirical
check with the actual copy engine (out of scope for this static audit).

---

## 4. Post-intake / mid-arc findings (sim 2 weeks)

Sim: pick Engine Builder → Progression tier → log 2 Z1 sessions in week 1
(via RunSlotCard), log resting HR morning check twice, land on week 2.

### F-A-23 — Today: Z1 block renders `LogSessionShortcut` copy pointing at a card that's below the fold

`src/app/page.tsx:406-413` — `LogSessionShortcut` says "Use the "Log
session" card below to record duration, HR, or splits." That's fine on
tall phones. On iPhone SE the RunSlotCard is 2 scrolls down. Consider a
sticky footer link or an inline "Log now" chip inside the block.

### F-A-24 — Progress → Lifts tab is the DEFAULT for Engine Builder users

`src/app/progress/page.tsx:155` — `const [tab, setTab] = useState<TabId>("lifts");`.
Aerobic-primary users land on "Lifts" first. The `primaryLiftsForProgram`
helper (line 40) falls back to `HIP_PRIMARY_LIFTS` if the user has no TMs
and the program declares no `starting_values_kg`. Engine Builder declares
none. So the fresh Engine Builder user sees the "No training maxes yet"
empty state (verified fix from `primaryLiftsForProgram`) — good. But the
default landing tab should be "Insights" for aerobic-primary programs.

### F-A-25 — Progress → Insights → SymptomLoadChart title reads wrong for engine users

`src/app/progress/page.tsx:352` uses "Symptom vs load" as the chart title.
Engine Builder users have no symptoms and their "load" is minutes. The
chart is also gated by `activeSlug === "anterior-hip-rebuild"` (line 340),
so Engine Builder users NEVER see the chart. That means Insights tab
shows only WeeklyNarrativeTile + RetestMetricsPanel. Both good. But the
Insights tab title in `progress/page.tsx` header just reads "Insights"
with no sub-copy for aerobic users. Add "Aerobic base indicators — HR
trend, weekly minutes, retest deltas" or similar.

### F-A-26 — RunSlotCard for Engine Builder: `useGenericSlot=true` path renders a benign card

`src/components/workout/RunSlotCard.tsx:31,59-66` — verified. When
`activeProgramSlug !== "anterior-hip-rebuild"`, the slot title is "Log
an extra session" with helpful copy. Round 2 flagged the primer / drills
issue; not re-verifying here.

### F-A-27 — Concurrent-strength banner fires ONLY for `concurrent-strength-maintenance` slug

`src/app/page.tsx:171-195` — the "Interference window" banner is hard-
gated to `primary.slug === "concurrent-strength-maintenance"`. Engine
Builder's own program.json declares an entire `concurrent_strength_policy`
section (lines 45-73) saying "MAINTENANCE ONLY during this block. 2-3
strength sessions per week, no more. RPE cap of 7." A user who logs a
CrossFit metcon via RunSlotCard and then goes to Today expecting the app
to flag "you're outside the concurrent policy" gets nothing. Either wire
the interference banner to any program that declares a
`concurrent_strength_policy`, or leave a passive note near YourPlanCard.

### F-A-28 — Week phase indicator (`humanPhaseName`) strips useful context

`src/app/page.tsx:537-539` and `week/page.tsx:349-351` strip anything
after "—" or "(". Engine Builder phases are named
"Week 1 — pure Z1 introduction". After strip → "Week 1". Meaningless.
The em-dash-strip is designed to hide developer prefixes but here it
kills real content. Reconsider the rule: strip only when the parenthetical
looks like a phase-scope hint (`(Phase 1 weeks 0-1)`), not any em-dash.

### F-A-29 — Report page for Engine Builder: "How you're trending against the program" → RetestMetricsPanel likely renders empty at week 2

`src/app/report/page.tsx:253-256` renders `<RetestMetricsPanel>` for non-
hip programs. Panel not audited here, but for a user 2 weeks in with no
retest data the panel needs an empty state. If it renders as a table with
NaN or "no data" strings, the report reads unfinished. Recommend verifying
manually.

### F-A-30 — Report page: "Personal contraindications" section renders as list under blank clinical block

`src/app/report/page.tsx:637-651,653-696` — if a user hasn't added
contraindications AND clinical.json is loaded (it's loaded via
`loadClinicalContext` unconditionally), the "Clinical constraints on file"
section renders `provocative_positions` and `red_flags` from the app's
built-in hip clinical.json for ALL users. Engine Builder users get "Deep
hip flexion + adduction + internal rotation" listed as a constraint their
program respects — **it doesn't, they're on a rowing plan**. This is a
real leak. Either gate the clinical section on hip program only, or
suppress the built-in constraints for non-hip programs.

---

## 5. Regression check

Round 2 findings I re-verified:

- Empty state on Week, Extras, Progress, Report — all render clean.
  Confirmed no anterior-hip fallback for any of them (F-A-10, F-A-11).
- `primaryLiftsForProgram` no longer stamps hip lifts for Engine Builder
  users with no TMs — verified renders "No training maxes yet" empty
  state (F-A-24).
- Onboarding modal properly hip-gated. `src/components/Onboarding.tsx:64-66`
  requires `activeSlug === "anterior-hip-rebuild"`. Fresh Engine Builder
  signup does not see the low-back/groin questions. Confirmed.
- Report Clinical section leaks (F-A-30) — this is a NEW finding that
  round 2 didn't catch. Report was previously always hip so nobody
  noticed.

---

## 6. Copy issues (compact)

- Guide "How Terav plans training" — brand word again.
- Guide "How to use the tabs" — describes stale nav (F-A-06).
- Coach "starter prompts" include "your program's retest metric" for the
  no-program case (F-A-07).
- Intake screening hint uses "a few no-questions" — misparse-prone.
- `duration_days = 5` labelled as "5-day intake" on the preview page.
- Everywhere-consistent CTA "Browse programs →" gets repetitive across
  five empty-state pages (F-A-03).
- Report Load Progression list for an aerobic user shows squat/DL entries
  ONLY if the user logged them — but the section header "Load progression"
  reads strength-first. Add "Load progression (strength)" and don't
  render the section on aerobic-only accounts with no strength logs.

---

## 7. Priority fix list (top 10)

1. **F-A-30** — Report "Clinical constraints on file" section renders
   hip provocative-positions for every user. Gate by hip slug or drop
   for non-hip.
2. **F-A-05** — Coach has no nav entry. Either add to overflow menu or
   remove from Guide's tab list.
3. **F-A-01** — Decide brand. Either keep "Terav" and add a one-line
   explainer, or replace with an English mark for beta.
4. **F-A-16** — Engine Builder preview "5-day intake" copy — round 2
   flagged; still there. Reword or drop.
5. **F-A-28** — `humanPhaseName` strips em-dash context, leaving Engine
   Builder Today with "Week 1" as the phase name.
6. **F-A-17** — Intake wizard has no progress indicator. 22 questions
   without one is where the cautious browser bounces.
7. **F-A-14** — /data page's "Paste JSON… old app at program-f3r"
   nudge shown to brand-new signups with no history.
8. **F-A-27** — Engine Builder declares a concurrent-strength policy but
   the interference banner only fires for the concurrent program slug.
9. **F-A-06** — Guide describes a bottom nav that no longer exists (says
   Extras / Check / Coach are tabs; they aren't).
10. **F-A-24** — Progress default tab for aerobic-primary users should be
    Insights, not Lifts.

---

## 8. Positive callouts

- Every empty-state page now handles the "no program" case gracefully.
  No 500s, no infinite spinners, no anterior-hip leaks on the primary
  hit surfaces (Today / Week / Progress / Extras). This was the round-3
  gap and the fixes hold.
- The `NoActiveProgram` component on Today is exactly the right tone:
  one sentence, one CTA. Doesn't over-explain.
- Coach "Coming soon" copy is genuinely useful now. Cautious browser
  reads it and understands what they're waiting for. The four "What
  it'll do" categories with mono-caps labels read like a real product
  card, not a placeholder.
- `personal:true` gating on the hip program in the catalog is clean.
  Public browsers never see it, direct URL still works for the founder,
  the `PersonalAcknowledgementModal` is a nice belt-and-suspenders.
- Signup consent language (health-data + terms as separate ticks) is
  the correct GDPR pattern for special-category data. Rare in fitness
  apps. Worth keeping.
- The intake wizard's honest capacity gate (F-A-20 caveat aside) — a
  program that refuses to start if the dose can't deliver on the claim
  is unusual and refreshing. Just calibrate the floor better.

---

*Sim data: fresh signup → Engine Builder Progression tier → two Z1 sessions
+ one morning check. All flows observed statically; no runtime session was
executed in this audit.*

## PII notice

No PII of any real client detected in the codebase files reviewed. Test /
placeholder data uses obvious dummy strings ("your@email", "Alice") only.
