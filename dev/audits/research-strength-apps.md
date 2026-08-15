# Strength Training App Research

Benchmark of ten strength-focused training apps, focused on how they structure information across screens. Compiled for the redesign of `program-f3r.pages.dev` (single-user 5/3/1 + FSL + Smolov Jr rehab-and-strength tracker).

Research method: App Store listings, official help/feature pages, third-party UX writeups (Medium, Barbend, Dr Muscle, screensdesign.com), and lifter reviews. No screenshots were downloaded; sources are linked inline. Where the public web was thin (Juggernaut AI internals, RP Hypertrophy interior screens, Wendler apps), best-available secondhand descriptions are used and flagged.

---

## 1. Executive summary

Across ten apps, four dominant structural patterns show up again and again:

1. **Bottom-tab navigation, 3-5 tabs, "Home / Workouts / Progress / Profile" is the modal shape.** Nobody uses side drawers anymore. Hevy, Boostcamp, Strong, Barbell Medicine, Fitbod, Caliber all use bottom tabs. The Today action lives in the first or second tab; History and Analytics live in a separate tab.
2. **"Today" is a launcher, not a workspace.** The best apps show one card ("Squat Day - Week 3 Day 1 - Start Workout") plus at most a small strip of context (last session, next up in the week). Detail lives inside the workout screen after the user taps Start. Fitbod, Caliber, Boostcamp all follow this. Cramming prescriptions, warm-ups, PR history, and accessories on Today is the anti-pattern I need to leave behind.
3. **In-workout screen is a scrollable list of exercises with inline set rows.** Each set is one row: previous / weight / reps / checkmark. Tapping the checkmark completes the set and starts the rest timer. This is the Hevy/Strong/Boostcamp/Fitbod pattern and is now the de-facto industry standard.
4. **Calendar is history-first, not scheduling-first.** Most apps (Hevy explicitly, Strong, Barbell Medicine) treat the calendar as a heatmap of completed workouts. Rescheduling a specific programmed session to another day is rare and, when it exists (Boostcamp, Fitbod), is done by "skip / reorder" not by drag-and-drop. Fitbod solves missed days algorithmically rather than by making the user re-plan.

---

## 2. Per-app breakdown

### 2.1 StrongLifts 5x5

- **Home / first screen.** After setup, home shows the next scheduled workout (Workout A or B) with a big "Start Workout" button. A "Program" button in the top right lets you switch program. Extremely spare.
- **Navigation.** Simple bottom nav. Workout / History / Progress / Settings. Very few tabs by design.
- **Session flow.** Full exercise list on one screen. Each exercise has five circles (one per set).
- **Set logging.** The signature StrongLifts mechanic: single tap on a set circle logs 5 reps. If you failed, tap the circle repeatedly to decrement (5 -> 4 -> 3 -> 2 -> 1 -> 0). Rest timer starts automatically. This is faster than any keyboard-based input in the space.
- **Prescription.** Absolute kg/lb only. No percentages surfaced; program handles internally. Deloads triggered automatically after 3 consecutive failures.
- **Progression.** Progress tab has a line chart per lift. No RPE, no TM concept.
- **Calendar.** Basic list-style history, not a heatmap.
- **Warm-ups.** Auto-calculated based on working weight. Displayed above the working sets.
- **Missed days.** Program picks up where you left off. No "make-up" concept.
- **Onboarding.** Vertical scrolling pickers for age/height/weight/experience, then straight into workout A. Very short.
- **Key takeaway.** The one-tap logging is the most efficient set-completion UX in the industry. Cost: no rep-level flexibility, no RPE, no weight tweaks per set.

Sources: [StrongLifts App Store](https://apps.apple.com/us/app/stronglifts-5x5-workout-plan/id488580022), [StrongLifts logging guide](https://support.stronglifts.com/article/63-log-workouts), [Screensdesign showcase](https://screensdesign.com/showcase/stronglifts-weight-lifting-log).

### 2.2 Strong (workoutstrong.com)

- **Home / first screen.** Opens directly to Templates. User taps a template (a saved routine) to launch it, or "Start Empty Workout" from the top. No opinionated "Today" view - the user picks.
- **Navigation.** Bottom tabs: Workout / History / Exercises / Measure / Profile.
- **Session flow.** Vertical list of exercises. Each exercise is a card with set rows underneath. Superset grouping is supported.
- **Set logging.** Each set row = previous / lbs / reps / checkmark. Numeric keypad. Rest timer autostarts on checkmark. Warm-up calculator built in.
- **Prescription.** No opinion. Strong is a logger, not a coach. User defines targets in the template.
- **Progression.** Advanced charts per lift, muscle heat map, body measurements, PR tracking. Lives in Profile / Progress.
- **Calendar.** Workout scheduling exists (marketing mentions it) but is not the central UI - it's a history calendar for the most part.
- **Warm-ups.** Warm-up calculator generates them from working weight. Explicit setting.
- **Missed days.** No penalty, no make-up flow.
- **Onboarding.** Minimal - Strong assumes you know what you're doing. Pick or create a template.
- **Key takeaway.** Strong's model of "Templates as the front door" is important. The user doesn't think "what day is it, what's on today"; they think "what am I about to do", pick a template, and go. For a single-user app running fixed programs, this is different from what I need - but the template card being the atomic navigation unit is worth adopting.

Sources: [Strong App Store](https://apps.apple.com/us/app/strong-workout-tracker-gym-log/id464254577), [strong.app](https://www.strong.app/), [Nerdy Student review](https://www.thenerdystudent.com/2021/08/strong-review/).

### 2.3 Hevy

- **Home / first screen.** The Workout tab shows a list of Routines (folders + saved workouts). Tapping a routine reveals sets and lets you start it. There is also a "Home" tab which is a *social feed*, not the training entry point - important structural quirk.
- **Navigation.** Bottom tabs (five): Home (social feed) / Workout (routines + start) / Add (a central plus for quick actions) / Explore (discover athletes) / Profile (progress + calendar).
- **Session flow.** Standard vertical list of exercises. Each exercise expands to rows: previous / kg / reps / RPE(optional) / checkmark. Set type (warm-up, drop, failure, normal) is togglable per set.
- **Set logging.** Numeric keypad. Checkmark completes the set and triggers the rest timer. Live Activity on iOS puts the rest timer in Dynamic Island - a huge UX win.
- **Prescription.** Whatever the routine defines. Hevy is a logger.
- **Progression.** Profile tab has volume/weight/reps charts per exercise, monthly report, 1RM estimates, PR notifications during workout.
- **Calendar.** Explicitly a *consistency heatmap* - blue dots on days you trained. Cannot be used to plan future workouts. Hevy support docs are explicit that the calendar is history-only.
- **Warm-ups.** Warm-up set calculator per exercise. Sets tagged as warm-up don't count toward volume.
- **Missed days.** No native concept. User just doesn't open the app.
- **Onboarding.** Fast: sign up, pick a routine from library, start workout. AHA moment is "log your first set".
- **Key takeaway.** Hevy separates *logging* (Workout tab) from *analytics* (Profile tab) cleanly. It also separates *scheduling intent* (routines you saved) from *history* (calendar heatmap). That split is the exact thing my current app doesn't do.

Sources: [Hevy App Store](https://apps.apple.com/us/app/hevy-workout-tracker-gym-log/id1458862350), [Hevy features](https://www.hevyapp.com/features/), [Hevy calendar docs](https://help.hevyapp.com/hc/en-us/articles/35380117933207-Track-Your-Workout-Consistency-with-the-Calendar-and-Streak-Features), [Hevy tutorial](https://www.hevyapp.com/hevy-tutorial/), [Kelly Z UX review on Medium](https://medium.com/@kellyz94/hevy-8-goals-of-mobile-ux-88dcce85404f).

### 2.4 Boostcamp

- **Home / first screen.** Home shows the current program's *next scheduled workout* as a big card. Below it, a "This Week" strip shows the week's scheduled days at a glance. Program metadata (week X of Y) is prominent.
- **Navigation.** Bottom tabs: Home / Programs (library) / History / Analytics / Profile. (Exact naming varies by version - some builds have a Planner tab.)
- **Session flow.** Vertical scrolling list of exercises. Each exercise card shows demo video thumbnail, past performance summary, and set rows.
- **Set logging.** Set rows with previous / weight / reps / RPE / RIR / checkmark. Each set can be tagged: Work / Warm-up / Drop / Failure. Plate calculator is *in* the workout screen - lays out plates per side of the bar for the prescribed weight. Auto-progression handles the math after AMRAP sets.
- **Prescription.** Percentages of TM, absolute kg, and rep targets all shown together. For 5/3/1 specifically: each set displays prescribed % + resulting kg + reps. On AMRAP sets, the app records rep count and rolls it into next cycle's TM bump automatically.
- **Progression.** Analytics tab has per-exercise charts, estimated 1RMs, muscle volume heatmap, streaks. TM history is visible per lift.
- **Calendar / schedule.** A Planner icon opens a view of all scheduled workouts across all weeks of the program. Not a monthly grid - more like a program-level list ordered by week. If you miss a workout you can reschedule it; drag-and-drop is not the primary mechanism but "skip" and "reschedule" flows exist.
- **Warm-ups.** Explicitly prescribed in Wendler programs; user can also add custom warm-ups. Plate calculator applies to warm-ups too.
- **Missed days.** Reschedule flow. Program does not auto-shift.
- **Onboarding.** Thorough onboarding quiz - goals, injuries, equipment. Then program browser. Then start.
- **Key takeaway.** Boostcamp is the closest existing app to what I need. Specifically: (a) Home = one card with next workout + weekly strip. (b) Prescription surfaces %/kg/reps together. (c) Plate calculator lives inside the workout screen, not off in Settings. (d) AMRAP -> TM update is invisible to the user, which is exactly how 5/3/1 should feel.

Sources: [Boostcamp App Store](https://apps.apple.com/us/app/boostcamp-workout-programs/id1529354455), [Boostcamp tips & tricks](https://www.boostcamp.app/blogs/tips-and-tricks-to-using-boostcamp-app), [Boostcamp 5/3/1 comparison](https://www.boostcamp.app/best/5-3-1), [Barbend Boostcamp review](https://barbend.com/boostcamp-review/), [Screensdesign showcase](https://screensdesign.com/showcase/boostcamp-gym-workout-fitness).

### 2.5 Fitbod

- **Home / first screen.** The Workout tab opens to today's *generated* session as a scrollable list of exercises. A large "Start Workout" button is at the bottom or top. Above the list: a Swap menu for changing the split (Push / Pull / Recovered muscles / Upper / Lower / Full body).
- **Navigation.** Bottom tabs: Workout / Log / Explore / Profile (approximately).
- **Session flow.** Vertical exercise list. Tap an exercise to see the Exercise Details screen with instructions, video, and set/rep/weight recommendations. Then log inline.
- **Set logging.** Sets, reps, weight, and RiR (Reps in Reserve) fields. Editable both live and afterward from the log.
- **Prescription.** Recommended sets/reps/weight per exercise, algorithm-driven. No percentages. RiR is the effort target.
- **Progression.** Log tab shows history. Detailed workout reports over weeks/months/years.
- **Calendar.** No traditional calendar-with-drag. Fitbod's model is "next session is whatever the algorithm decides". History is a log.
- **Warm-ups.** Auto-generated warm-up sets per compound.
- **Missed days.** No make-up. Fitbod re-generates the next session accounting for missed days - if you've been away long enough, weights are reduced automatically to protect against injury. This is the smartest missed-day handling in the space.
- **Onboarding.** Long questionnaire - goals, equipment, experience, injuries. Then generates first workout.
- **Key takeaway.** Fitbod's "algorithm handles the schedule; the user just shows up" is the best answer to "what if the user misses a day". For a fixed program like 5/3/1 you can't do this exactly, but the principle - *the user should never see an angry red missed-day marker; the app should just present the next thing to do* - is directly applicable.

Sources: [Fitbod App Store](https://play.google.com/store/apps/details?id=com.fitbod.fitbod), [Fitbod schedule & logging docs](https://help.fitbod.me/hc/en-us/sections/1500000505721-Workout-Schedule-Logging), [Missing a Workout blog](https://fitbod.me/blog/missing-a-workout/), [Fitbod algorithm](https://fitbod.me/blog/fitbod-algorithm/).

### 2.6 Juggernaut AI

- **Home / first screen.** The Dashboard tab is home. Shows current mesocycle phase, weekly volume, upcoming workouts, progress deltas. Reviewers call it "initially overwhelming" but "super easy after a couple sessions" - a red flag worth respecting.
- **Navigation.** Three tabs: Dashboard / Workouts / Exercises.
- **Session flow.** Workouts tab is where the session lives. Before starting, user logs a readiness check-in (sleep, soreness, motivation). Then standard exercise list with set rows.
- **Set logging.** Weight, reps, RPE, RIR per set. RPE is the primary autoregulation input.
- **Prescription.** RPE-first. Rather than "squat 140kg x 5", the prescription is "squat @ RPE 8 x 5". The app suggests a starting weight; user adjusts based on RPE. Loads recalibrate for next session.
- **Progression.** Dashboard shows estimated 1RMs, volume trend, intensity trend. Weak-point interventions surface automatically.
- **Calendar.** Not a calendar-first product. The mesocycle structure is the timeline.
- **Warm-ups.** Video-driven coaching on warm-up protocol; less prescription of specific warm-up sets.
- **Missed days.** Autoregulation absorbs missed days - loads back off if performance drops.
- **Onboarding.** Very long questionnaire: PRs, goals (powerlifting vs powerbuilding), weak points, recovery. Sets up the first mesocycle.
- **Key takeaway.** The pre-session readiness check-in (sleep, soreness, motivation logged *before* the workout starts) is a pattern I should steal for a rehab context - I already have `daily_log_schema` with a symptom score, and prompting the user for it *at session start* rather than as an afterthought would make the amber/red gating actually work.

Sources: [Juggernaut AI App Store](https://apps.apple.com/us/app/juggernautai/id1515756471), [Dr Muscle review](https://dr-muscle.com/juggernaut-workout-app-review/), [AI Tools Bakery review](https://aitoolsbakery.com/blog/juggernautai-review/), [Lift Big Eat Big review](https://shop.liftbigeatbig.com/blogs/reviews/best-workout-app-for-muscle-gain).

### 2.7 Barbell Medicine app

- **Home / first screen.** Home has progress-chart widgets and an "upcoming workout" surface.
- **Navigation.** Bottom tabs: Home / History / Programs / Profile. Four tabs, clean.
- **Session flow.** Standard list-of-exercises with set rows.
- **Set logging.** Weight, reps, RPE. Notes per exercise. RPE calculator estimates 1RM from a set.
- **Prescription.** RPE-based (Barbell Medicine's methodology). The Bridge, Beginner Prescription, etc. all prescribe RPE with target rep ranges.
- **Progression.** Charts per lift, e1RM up to 10 reps, session volume, PRs. Lives in History and on Home.
- **Calendar.** Not a first-class scheduling calendar; history is chronological.
- **Warm-ups.** Prescribed as part of the program.
- **Missed days.** No native make-up flow.
- **Onboarding.** Questionnaire matches the user to a starting program. 1-week free trial.
- **Key takeaway.** The Programs tab as a separate destination (not buried in Settings) is the right move. Programs are big, they change infrequently, they're worth their own tab. Also: RPE as first-class citizen on every set is what makes this feel like a strength app rather than a fitness tracker.

Sources: [Barbell Medicine App Store](https://apps.apple.com/us/app/barbell-medicine/id1536216161), [Barbell Medicine site](https://www.barbellmedicine.com/app/), [MWM app profile](https://mwm.ai/apps/barbell-medicine/1536216161).

### 2.8 5/3/1 by Jim Wendler / Five/Three/One / Wendler 531 Log

There are several unofficial-but-well-regarded dedicated 5/3/1 apps: **5/3/1 Workout Logger** (Ratana), **Five/Three/One** (Strong Pigeon), **Wendler Log 531** (Vandersoft). None are officially by Wendler.

- **Home / first screen.** All three open to the current cycle's next workout. TM values per lift are shown prominently. "Show up, open app, lift" is the shared slogan.
- **Navigation.** Two or three top-level views: Today's Workout / History / Settings (which includes TMs and program config).
- **Session flow.** Warm-up sets (40/50/60% is the Wendler default) shown above the working sets. Working sets prescribed as % of TM, resulting kg, and rep target (5/3/1 for the three main sets, AMRAP on the last).
- **Set logging.** Tap-to-log or keyboard entry per set. Rest timer autostarts (2 min default).
- **Prescription.** All three of: percentage of TM, absolute kg, rep target. AMRAP set is the focal point - user enters actual reps hit, app estimates 1RM.
- **Progression.** e1RM per lift over time. TM auto-bumps between cycles based on AMRAP performance.
- **Calendar.** Cycle/week/day structure rather than a monthly calendar. History is a session log.
- **Warm-ups.** Auto-calculated. Plate calculator shows exactly what to load.
- **Missed days.** No make-up; the cycle just resumes where you left off.
- **Onboarding.** Enter 4 numbers (squat/bench/DL/OHP 1RMs) and pick a template. Done.
- **Key takeaway.** For 5/3/1 specifically, the "enter your four 1RMs, done" onboarding is a benchmark I should hit. The prescription format `[%TM] [kg] x [reps]` on every set - with the AMRAP set visually differentiated - is exactly right.

Sources: [5/3/1 Workout Logger App Store](https://apps.apple.com/us/app/5-3-1-workout-logger-531/id1114435690), [Five/Three/One app](https://fivethreeone.app/), [Vandersoft Wendler guide](https://vandersoft.co/wendler-531-app-guide/), [Boostcamp 5/3/1 comparison](https://www.boostcamp.app/best/5-3-1).

### 2.9 RP Strength (RP Hypertrophy app)

- **Home / first screen.** Current mesocycle view with the current week's sessions. Feedback-driven adjustments surface between sessions.
- **Navigation.** Roughly: Mesocycle / Workout / Progress / Profile.
- **Session flow.** Standard exercise list. Before/after each muscle group, the app asks about pump, soreness, and workload (three quick sliders/pickers). These answers plus the reps you hit drive next week's programming.
- **Set logging.** Sets/reps/weight/RIR per set. Standard checkmark flow.
- **Prescription.** RIR (Reps in Reserve) as the effort target. Volume progresses week-to-week via the feedback system.
- **Progression.** Progress tab, per-mesocycle recap, per-exercise history.
- **Calendar.** Mesocycle timeline (weeks 1-N of a block) rather than a monthly grid.
- **Warm-ups.** Prescribed for compounds.
- **Missed days.** Feedback-driven; algorithm adjusts.
- **Onboarding.** Template picker (45+ mesocycles) with per-mesocycle customization.
- **Key takeaway.** Two things: (a) The between-sets/between-muscle feedback prompts (pump / soreness / workload) are structurally similar to my rehab symptom logging. Doing this *contextually* (right after the exercise that provokes the symptom) rather than end-of-session gives cleaner data. (b) The mesocycle timeline (Week 1 to Week N linear view, not a calendar month) is the correct shape for a fixed program - it's a *program timeline* not a *calendar*.

Sources: [RP Hypertrophy site](https://rpstrength.com/pages/hypertrophy-app), [App Store](https://apps.apple.com/us/app/rp-hypertrophy/id1555614554), [Dr Muscle review](https://dr-muscle.com/rp-hypertrophy-app-review/), [StrengthLab360 review](https://strengthlab360.com/blogs/reviews-and-tests/the-rp-hypertrophy-app-review-why-strengthlab360-is-superior).

### 2.10 Caliber Strength

- **Home / first screen.** Dashboard shows today's activities. A big red "+" floating action button (bottom-right) adds a new activity. Users can also navigate between dates.
- **Navigation.** Bottom tabs: Home / Plans / Progress / Community / Profile (approximately).
- **Session flow.** Tap into the workout, see exercise list, tap an exercise, log sets. Each set row includes "Last: 95 lbs" ghost-text showing the previous session's weight.
- **Set logging.** Time/reps/weight per set. Complete button (red) at bottom of exercise.
- **Prescription.** Coach-programmed absolute weight, reps, and rest. Coach adjusts between sessions.
- **Progression.** Strength Score (composite metric) and Strength Balance (per-muscle-group breakdown). PR cards on workout summary.
- **Calendar.** Date-based dashboard - swipe between days. Not a scheduling drag-drop calendar.
- **Warm-ups.** Swipe-left on a set to add a warm-up.
- **Missed days.** Coach reassigns. No auto-shift.
- **Onboarding.** Long quiz + optional coach match. Activation checklist on first home visit.
- **Key takeaway.** The date-swipe pattern on the home dashboard is a solid alternative to a full calendar - lets the user check "what's tomorrow" or "what was yesterday" with one gesture. The activation checklist (guide-new-users) is also worth borrowing since my open-questions flow could benefit from a similar "here are the 3 things to fill in before your program is real" checklist.

Sources: [Caliber App Store](https://apps.apple.com/us/app/caliber-strength-training/id1482405410), [Screensdesign Caliber showcase](https://screensdesign.com/showcase/caliber-strength-training), [Caliber user guide](https://caliberstrong.freshdesk.com/support/solutions/articles/48001257776-caliber-app-user-guide), [Garage Gym Reviews Caliber review](https://www.garagegymreviews.com/caliber-app-review).

---

## 3. Patterns worth stealing (ranked)

Ranked by impact-for-effort in the context of my current app.

1. **Home = one card + one strip. Best example: Boostcamp.** Home shows *one* big "Next Workout" card ("Squat Day - Week 3 / Cycle 2 - Start") plus a horizontal strip of this week's days with status dots. Everything else moves off Today. This is the single highest-value change - it fixes "too dense on one screen" in one move.
2. **In-workout screen = vertical list of exercises with inline set rows. Best example: Hevy / Strong.** Row = previous | weight | reps | RPE | checkmark. Tap checkmark to complete + start rest timer. This is the industry standard; deviating from it is expensive user cost for no gain.
3. **Prescription block on each exercise showing %TM, kg, and reps together. Best example: Boostcamp for 5/3/1.** For a 5/3/1 app, users want *all three* on every set: "65% x 145kg x 5". AMRAP set visually differentiated (a "+" or "AMRAP" badge). This is what makes it feel like a proper 5/3/1 app not a generic logger.
4. **Plate calculator lives inside the workout screen. Best example: Boostcamp.** Not a separate tool - a small "plates" affordance next to each set that expands to show plate-per-side. Cognitive load reduction while you're actually loading the bar.
5. **Programs / Routines as a separate tab. Best example: Barbell Medicine, Hevy.** Split Home (today) from Programs (what programs am I running, edit them, swap them). My app currently has program config in Settings which is wrong - it deserves a tab.
6. **Pre-session readiness check-in. Best example: Juggernaut AI.** Log symptom score, sleep, whatever inputs your gating system needs *before* the workout starts, not after. This makes green/amber/red gating actually work at the point of decision. For me this is where the existing `daily_log_schema` symptom score should live.
7. **Contextual feedback prompts. Best example: RP Hypertrophy.** After the exercise most likely to provoke a symptom (e.g. resisted SLR analogues, deadlift for lumbar, OHP for shoulder), pop the "how did that feel?" prompt right then, not at end of session. Gives cleaner rehab data.
8. **Date-swipe dashboard. Best example: Caliber.** Left/right swipe on Home moves between days without leaving Today's context. Fills the calendar need without an actual calendar-widget commitment.
9. **Program timeline view (not calendar). Best example: RP Hypertrophy, Boostcamp Planner.** For fixed multi-week programs, a "Week 1 -> Week 8" linear timeline is more useful than a monthly grid because the *structure* of the program is what matters, not calendar dates. My 5/3/1 cycles + Smolov Jr blocks are exactly this shape.
10. **Auto-progression on AMRAP. Best example: Boostcamp / any Wendler app.** User enters AMRAP reps -> app computes next cycle's TM automatically. User never sees the calculation. This is the *right* level of abstraction: user does the work, app does the math.
11. **Warm-ups auto-calculated but overridable. Best example: StrongLifts, all 5/3/1 apps.** Compute defaults (40/50/60%) but let the user add or skip. Never require manual entry every session.
12. **One-tap set completion where possible. Best example: StrongLifts.** For fixed-rep prescribed sets (Wendler's fixed 5/3/1 sets), a single tap logs the prescription. Keyboard only appears for AMRAP or when the user needs to deviate. Cuts logging time by ~60%.

---

## 4. Patterns to AVOID

- **Cramming the current session's full detail on Today.** This is what my current app does. Every reviewed app either shows a launcher card (Boostcamp, Fitbod, Caliber) or opens directly into templates (Strong, Hevy). Detail comes after Start.
- **Social feed as the Home tab.** Hevy does this and it's confusing - "Home" is a social feed and "Workout" is the training entry point. For a single-user app this pattern is actively harmful; skip social entirely.
- **Long questionnaire onboarding for a program you already know you want.** Juggernaut and Caliber both have 5+ minute intake flows. For a single-user 5/3/1 app, the four 1RMs (Wendler apps) is the right length. Anything else is theatre.
- **Drag-and-drop workouts on a monthly calendar.** No serious strength app does this. The mental model for a fixed program is "next session", not "Tuesday 6pm". Save this pattern for cardio/lifestyle apps.
- **Missed-day scoldy UI.** Nothing kills a rehab-log more than red "you missed" markers. Fitbod's silent recalibration is the model.
- **RPE / RIR / percentage mixed on the same set without hierarchy.** Some apps show all three which becomes noise. Pick one primary (I'd say %TM + kg for 5/3/1, RPE for accessories) and demote the others.
- **Warm-ups as a separate flow before the "real" workout.** They belong inline at the top of the exercise, not in a preamble screen. Every good app treats them as normal sets tagged "warm-up".
- **Nested navigation more than 2 deep from Home.** Home -> Workout -> Exercise Details is fine. Home -> Programs -> Program -> Week -> Day -> Exercise -> Set is a trap Boostcamp gets close to.

---

## 5. Data-splitting insight: how the best apps decide what goes where

This is the core question for the redesign. Looking across the ten apps, the pattern is consistent:

**Today screen contains only what the user needs to answer "should I open the workout now?".**
- Which session is next (one card, one tap to start)
- One glance of context: last session's outcome, this week's progress dots
- Optional: readiness prompt if the app has one (Juggernaut, Fitbod)
- That's it.

**Workout screen contains everything needed to execute the session.**
- Full exercise list with prescribed sets
- Set logging inline
- Rest timer
- Plate calculator, warm-up calculator inline
- Notes per exercise
- Nothing about last week's PRs, next week's schedule, or program-level stats

**Programs / Plans tab contains everything about "what am I running".**
- Program name, phase, week
- Ability to switch programs
- Edit or fork the program
- TM values (for 5/3/1) live here or in Profile

**History tab contains chronological session records.**
- List of past sessions
- Tap a session to see what was logged
- Not a calendar; a reverse-chronological list

**Progress / Analytics tab contains longitudinal views.**
- Charts per lift
- e1RM trends
- PR list
- Muscle-group volume heatmap (if applicable)

**Profile / Settings contains user config.**
- Body stats, equipment, units, integrations
- Notifications
- TM values (some apps) or move these to Programs

**Calendar - when it exists - is a consistency heatmap in Profile or Progress.** It is *not* a scheduling tool for fixed programs. This is the biggest miss in most user expectations: they *say* they want a calendar to move workouts around, but the best apps deliberately don't build that because it undermines program integrity.

For my app specifically, the recommended split:

- **Today.** "Next: Squat Day W3D1" card. This week's strip (M T W T F S S with dots). Symptom score prompt if not logged today. Physio-note nag (highest-value unaddressed action). Nothing else.
- **Workout (activated on Start).** Warm-ups + main sets (%TM/kg/reps) + FSL block (if applicable) + accessories. Set logging inline. Symptom check at the exercise most likely to provoke, not at end.
- **Program.** 5/3/1 cycle timeline (weeks 1-4 with day breakdown). TM values per lift. Smolov Jr block toggle. Provisional flag if `open-questions` not answered.
- **History.** List of past sessions. Tap for details. Include symptom score per session (this is *the* long-view rehab artefact).
- **Progress.** e1RM per lift chart. Symptom-vs-load chart (this is the killer feature for a rehab app). Consistency heatmap.
- **Profile / Settings.** Config, open-questions status, red-flag reference, physio referral log.

The Symptom-vs-Load chart on Progress is the single feature none of the ten reviewed apps has and it's the one that would make a specialist appointment productive - it's the whole point of the project per CLAUDE.md.

---

Word count: ~2380.

