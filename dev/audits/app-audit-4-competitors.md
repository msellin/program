# App audit 4 — competitor mobile-app teardown

Scope: **in-app** patterns, sourced from App Store copy, help docs, teardowns, press
releases (2024-2026). Unverifiable detail marked. No PII observed.

**Terav today** (from files read in prep): 5-tab bottom nav
`Today / Week / Progress / History / Profile` (`BottomNav.tsx:14-21`); Today =
`YourPlanCard` → `HeroStateCard` (morning check) → `SignalsStrip` → block → exercise
cards → `SessionActions` (Move / Skip / Whole week). No session-complete moment. Adaptive
banners live on Progress (`ProgressBody: pauseSignal / cycleEval / waypointStatus`).

---

## 1. Executive scan — one paragraph per competitor

**RP Hypertrophy** ([1][1], [2][2]). Home = current mesocycle → session. Per-set: pump /
soreness / joint-pain / workload prompts drive next week's volume. **Steal:** end-of-set
micro-feedback that closes the adaptive loop inside the exercise. **Reject:** joint-pain
interrogation mid-session is wrong for rehab. Reviews: dated UI, no offline.

**Fitbod** ([3][3], [4][4]). Home = today's session + **muscle-recovery heat map**, inline
set-logging. **Steal:** the heat map — best visual answer to "why did the plan change?"
**Reject:** silent overnight rearrangement (anti-confirm-first).

**Boostcamp** ([5][5]). Home = program → week → session. Clean logbook + per-set RPE +
Community feed. **Steal:** RPE as a first-class number per set — engine could reason off
proximity to failure. **Reject:** Community.

**Ladder** ([6][6]). Home = coach's team feed + today's tile; coach video inline; in-ear
coaching. Apple 2025 finalist. **Steal:** coach *presence* signal (small identity + short
note = felt accountability). **Reject:** team-cohort paradigm.

**Runna** ([7][7], [8][8]). Home = week strip + "next run" card. Missed >3 sessions =
**Plan Realignment** sheet the user accepts — confirm-first, same as Terav. **Steal:**
Plan Realignment is the ceiling `MissedSessionPrompt` should reach. **Reject:** week strip
on Home would duplicate Terav's Week tab.

**TrainingPeaks** ([9][9], [10][10]). Home = Fitness/Fatigue/Form (PMC) + "A" event
countdown. Sessions compliance-coloured green/yellow/orange/red vs. plan. **Steal:**
compliance colour on completed sessions — Terav's single-green-dot loses *how close*.
**Reject:** PMC chart on home; too pro.

**Humango** ([11][11]). Home = Hugo AI coach card + auto-adapt summary. Nightly adapts off
sleep/HRV/Garmin. **Steal:** the *daily* "why today looks like this" one-liner. Terav has
weekly on Progress; daily on Today is the differentiator. **Reject:** silent full
adaptation. Reviews flag "clunky" + Watch sync.

**Pliability (ex-ROMWOD)** ([12][12], [13][13]). Home = today's mobility card + streak.
Session done = streak +1. **Steal:** streak *of morning checks*, not sessions (Terav's
`2d` chip is the right instinct). **Reject:** streak-as-primary-metric; rehab users
legitimately miss days.

**GoWOD** ([14][14], [15][15]). Home = today's mobility derived from last test. **Steal:**
baseline-test → today's session provenance ("this is here because your ankle scored 40").
Terav has retest metrics but doesn't cite them into block notes. **Reject:** mandatory
full-body test as intake gate.

**The Ready State** ([16][16]). Home = library of mobilisations sortable by pain area.
**Steal:** pain-area quick picker as a Today entry. **Reject:** library-first; Terav is a
plan.

**Kaia Health** ([17][17]). Home = today's therapy card + Motion Coach pose-detection.
Monthly re-tune. **Steal:** the **monthly re-tune** as a named, dramatised event.
**Reject:** pose-detection (out of PWA scope) + paired coach.

**Whoop 4.0** ([18][18]). Home = recovery ring + strain bar; bottom nav has 6 data-tabs
incl. Coach. **Steal:** the **Journal** — nightly behaviour tags (alcohol, travel,
caffeine). Mirror on morning check. **Reject:** Coach as a bottom-nav tab. Terav's IA note
`BottomNav.tsx:14` stands.

**Ultrahuman Ring** ([19][19], [20][20]). Home = **UltraSphere** colour-orb + 60+ contextual
suggestions. Dark theme, single-day density. **Steal:** at-a-glance colour state (Terav's
`HeroStateCard` already does). **Reject:** the "60 suggestions" pattern; Emerald update
was criticised for hiding data behind "power plugs."

**Strava** ([21][21], [22][22]). Home = feed of friend activities. May 2026 added strength
log + auto muscle maps. **Steal:** auto-generated post-session summary. **Reject:**
feed-as-home; the recent Activity-view redesign drew complaints.

**Apple Fitness+** ([23][23]). Home = "For You" → Explore / Library / Search. **Steal:**
the mental model that Today should feel curated, not templated. **Reject:** class-
catalogue paradigm.

**Peloton / Strength+** ([24][24], [25][25]). Home = class-tiles carousel + Stack chaining.
Session complete = **stats summary + high-five stack**. **Steal:** the stats card (kg
lifted, reps, TUT). Terav has zero post-session moment. **Reject:** high-five social loop.

---

## 2. Pattern census table

| Pattern | Who uses it | Verdict for Terav |
|---|---|---|
| Home = today's session card | Fitbod, Ladder, Runna, Pliability, GoWOD, Kaia, Peloton, Boostcamp | Adopt — Terav has it |
| Home = feed of others | Strava, Peloton main | Reject; wrong audience |
| Home = biometric orb | Whoop, Ultrahuman | Aligned via `HeroStateCard` |
| Home = library / catalogue | Apple Fitness+, Ready State | Reject; Terav is prescriptive |
| Inline set-logging | Fitbod, Boostcamp, RP, Peloton+ | Adopt — RPE per set is the gap |
| Post-session summary / celebration | Peloton, Pliability, Strava, Fitbod | **Gap for Terav — §4** |
| Adaptive-change confirmation sheet | Runna, Terav `TierAdvanceProposal` | Aligned; Runna is the ceiling |
| Silent adaptive change | Fitbod, Humango, RP | Reject; violates confirm-first |
| Compliance colouring on completed | TrainingPeaks | Adopt — §5 |
| Streak of daily check-ins | Pliability, Whoop | Adopt as *check-in* streak only |
| Coach as bottom-nav tab | Whoop | Reject; `BottomNav.tsx:14` stands |
| Coach as inline daily card | Humango, Ladder, Kaia | Adopt daily-form on Today |
| Muscle-recovery heat map | Fitbod | Consider for concurrent-strength |
| End-of-set soreness dialogue | RP | Reject for rehab |
| Pain-area quick picker | Ready State | Consider as Today entry |
| Missed-session reconciliation sheet | Runna | Mature `MissedSessionPrompt` toward this |
| Behaviour tagging | Whoop Journal | Adopt as morning-check tags |

---

## 3. The bottom-nav comparison

Terav: `Today / Week / Progress / History / Profile` (5). Competitor counts, best-effort:
Runna ~4 (Home/Plan/Discover/Profile, unable to verify), Fitbod 5 (Home/Log/Explore/
Recovery/Profile), TrainingPeaks 4 (Home/Calendar/Analysis/Profile), Peloton Strength+ 4
(Home/Workouts/Progress/Profile), Whoop 6 (data-tabs, different animal).

Two things are unusual about Terav's set. First, `Today / Week` split — most competitors
collapse Week behind a calendar icon on Home. Terav's Week is a peer because the adaptive
engine changes it in place, and the info-scent gain (rhythm dots) is real. Defensible.
Second, `Progress / History` split — TrainingPeaks and Peloton merge. Terav's Progress is
the *adaptive engine surface* (banners live there); History is raw log. Defensible for a
data-nerd athlete but reads as duplication to a fresh user.

**Verdict:** hold at 5. Add a P1 spike to consider merging Progress + History under a
single Progress tab with a top-tabs strip once History earns its own summary layer.

---

## 4. The "logged" moment

Terav today: tap `ExerciseCard` check → strike-through (see screenshot). No summary, no
"you did it." Consequence lands on Progress tomorrow.

Competitors at session close: **Peloton** stats card (kg × reps × TUT); **Fitbod** updated
heat map; **Pliability** streak +1; **Strava** auto activity + muscle map;
**TrainingPeaks** compliance colour on tile; **Runna** paces vs. targets; **Boostcamp**
volume summary; **RP** soreness/pump prompts.

**Recommendation:** a "Session logged" card that replaces `SessionActions` when all
`ExerciseCard`s are checked, containing (1) session name + logged volume; (2) delta vs.
last time this block ran ("+2.5 kg on Squat, matched pulls"); (3) one symptom chip ("any
twinges today? 0-3"); (4) next session date; (5) no streak, no share.

**P0.** Every competitor has some form of this. File to change: `page.tsx:338` — swap
render when `allBlocks.every(b => logged)`.

---

## 5. Missing feature signals — 5 things every adaptive-strength competitor has that Terav doesn't

1. **Per-set RPE / RIR input.** RP, Boostcamp, Fitbod all take this per set; Terav collects
   morning state but not per-set effort. The engine's `cycleEval` in
   `progress/page.tsx:110` currently reasons off symptom score + completion — with RPE
   it could reason off proximity to failure, which is what the rehab literature actually
   uses.
2. **Compliance colouring on Week/History.** TrainingPeaks colours completed sessions by
   how close they landed to prescription; Terav's Week (`week/page.tsx:251-258`) uses a
   single "logged" green dot. A three-state (planned / partial / matched) would put the
   engine's decisions on the user's map.
3. **Post-session summary / "logged" moment.** See §4.
4. **Muscle-recovery view.** Fitbod's core viz. Terav has retest metrics but no
   "system state" glance. For concurrent-strength users this would justify the interference
   banner (`page.tsx:210-219`) with a visual, not just prose.
5. **Nightly / same-day narrative.** Humango's "Hugo" surfaces a *daily* "here's why your
   plan looks like this" one-liner. Terav has `WeeklyNarrativeTile` on Progress but nothing
   on Today. A one-line explainer under `YourPlanCard` would answer "why is today what it
   is" without a click.

---

## 6. What NOT to copy (patterns tempting but wrong for Terav's confirm-first positioning)

- **Silent plan mutation.** Fitbod / Humango change tomorrow based on yesterday, no ask.
  Terav's `TierAdvanceProposal` pattern is *right*; do not regress it. Note the
  organisation-level cue in `next-app/src/app/page.tsx:170` — the *proposal* card is the
  brand.
- **Streak-as-primary-metric.** Pliability's streak feels great when green, punishes when
  broken. Rehab users legitimately miss days. Streak of *morning checks* is different from
  streak of *sessions* — keep the former, never surface the latter.
- **Social feed.** Strava / Peloton / Boostcamp. Wrong audience; would leak clinical data.
- **Coach as a bottom-nav tab.** Whoop. Terav's IA note is right — don't promote until it
  works.
- **Community leaderboards / cohorts.** Ladder. Terav's user is training against their
  imaging report, not against strangers.
- **RP's soreness / pump / joint-pain interrogation between sets.** Wrong tone for a rehab
  user; "joint pain?" mid-set is exactly the prompt a user coming off a hip MRI does not
  want.
- **Auto-adaptive interference dodging.** Some concurrent apps silently move strength if
  a user did hard cardio yesterday. Terav's warning banner (`page.tsx:210-219`) is the
  right level — surface, don't act.

---

## 7. Top 10 competitor-inspired takeaways

**P0**

1. **Session-complete summary card.** Renders when all block exercises are checked.
   Volume delta + one symptom chip + next-session date. Exemplar: **Peloton / Runna**.
   File: `page.tsx:338` — swap `<SessionActions>` render conditionally.
2. **Compliance colouring on Week.** Three-state day dot (matched / partial / missed) by
   comparing logged volume vs. prescription. Exemplar: **TrainingPeaks**. File:
   `week/page.tsx:250-258` — extend the `dotColor` map.
3. **Missed-session realignment sheet.** Mature `MissedSessionPrompt` into a confirm-first
   "reshuffle rest of phase?" sheet when gap >3 days. Exemplar: **Runna Plan
   Realignment**. File: `components/workout/MissedSessionPrompt.tsx` (from `page.tsx:136`).

**P1**

4. **Per-set RPE input** on `ExerciseCard`; feed into `evaluateCycleEnd` so the engine
   reasons off effort, not just completion. Exemplar: **Boostcamp**. Files:
   `components/workout/ExerciseCard.tsx` + `lib/engine/adapt.ts`.
5. **Daily "why today looks like this" one-liner** under `YourPlanCard`. One sentence
   ("Reintro week 2 — RPE cap 7 because your last session logged 3/10 hip soreness").
   Exemplar: **Humango Hugo**. File: `page.tsx:131`.
6. **Behaviour tags on morning check** (alcohol / travel / poor sleep). Exemplar: **Whoop
   Journal**. File: `components/workout/HeroStateCard.tsx`.
7. **Merge Progress + History spike.** Decide if History earns its tab. Exemplar:
   **TrainingPeaks Analysis, Peloton Progress**. File: `components/nav/BottomNav.tsx:14`.

**P2**

8. **Muscle-recovery viz** for `concurrent_strength_policy` programs only. Exemplar:
   **Fitbod**. File: `progress/page.tsx:357` (Insights tab).
9. **Streak of morning checks** (not sessions). Formalise the `2d` chip with a gentle
   recovery mechanic. Exemplar: **Pliability**, framed correctly. File: `HeroStateCard.tsx`.
10. **Symptom quick-picker chips** at top of Today (fine / niggle / painful). Overrides
    "No check yet" with something a user will actually tap. Exemplar: **Ready State**.
    File: `page.tsx:166`.

---

## Sources

[1]: https://mesostrength.com/blog/best-hypertrophy-training-apps
[2]: https://dr-muscle.com/rp-hypertrophy-app-critique/
[3]: https://www.indiehackers.com/post/fitbod-app-review-2026-honest-take-after-real-testing-45d5f07a1b
[4]: https://fitbod.zendesk.com/hc/en-us/articles/360006269014-Muscle-Recovery
[5]: https://barbend.com/boostcamp-review/
[6]: https://www.garagegymreviews.com/ladder-app-review
[7]: https://support.runna.com/en/articles/10026375-how-to-use-the-plan-realignment-feature
[8]: https://support.runna.com/en/articles/10473504-your-quick-guide-to-navigating-the-runna-app
[9]: https://www.trainingpeaks.com/learn/articles/trainingpeaks-mobile-home-view/
[10]: https://help.trainingpeaks.com/hc/en-us/articles/204861204-Workout-Card-Overview
[11]: https://apps.apple.com/us/app/humango-ai-training-planner/id1554430755
[12]: https://pliability.com/
[13]: https://simplmobility.com/blog/pliability-app-review
[14]: https://apps.apple.com/us/app/gowod-mobility-stretching/id1227834875
[15]: https://www.gowod.app/
[16]: https://simplmobility.com/blog/the-ready-state-review
[17]: https://help.kaiahealth.com/article/5-how-does-the-kaia-health-app-work
[18]: https://createsell.com/blog/whoop-app
[19]: https://www.absolutegeeks.com/tech-news/ultrahuman-emerald-update-brings-clearer-insights-to-smart-ring-tracking/
[20]: https://www.gsmarena.com/ultrahuman_overhauls_its_app_with_ataglance_status_updates_and_suggestions-news-73871.php
[21]: https://press.strava.com/articles/strava-overhauls-strength-experience-with-expanded-partner-ecosystem-new-workout-log-and-muscle-maps
[22]: https://press.strava.com/articles/strava-launches-redesigned-record-experience
[23]: https://www.techradar.com/health-fitness/fitness-apps/apple-fitness-plus-just-got-a-big-redesign-to-help-you-find-the-right-classes
[24]: https://apps.apple.com/us/app/peloton-strength/id6476712925
[25]: https://www.pelobuddy.com/soon-feed-notification/
