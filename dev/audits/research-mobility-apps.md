# Mobility, wellness & habit app research — how leading apps handle multi-content-type screens

**Compiled for:** program-f3r.pages.dev redesign
**Date:** 2026-08-06
**Focus:** apps that mix training + mobility + habits + injury/recovery awareness without overwhelming the Today screen
**Method:** desk research (App Store, product blogs, review sites, design case studies). No app was operated first-hand in this pass — treat the per-app anatomies as best-effort reconstructions, not spec.

---

## 1. Executive summary

Four organising patterns keep recurring across the mobility, recovery, and habit-tracking apps that get this right:

1. **One hero, everything else deferred.** Whoop, Oura, Freeletics, Ladder, Hevy Coach, GOWOD all resolve "what do I do now?" to a single hero card above the fold. Support content lives below, and comparisons/history live behind a tap. Whoop is the extreme case — one giant recovery number sets the day.
2. **The morning score is the router.** Whoop and Oura don't ask users to choose; they surface a readiness/recovery number, colour-code it, and let it *change what the app shows next*. Green day → hard workout card. Red day → mobility and sleep cards. The score is a routing device, not just a metric.
3. **Attach mobility to the workout, don't schedule it separately.** GOWOD's pre-WOD and post-WOD flows and Nike Run Club's post-run cool-down prompt both piggyback mobility onto an event the user was already going to do. This is the single most important idea for our use case.
4. **Habit vs prescription is a mode, not a screen.** Freeletics ("Coach Day" + "Explore all"), Pliability ("Daily" + sport programmes), and Oura ("today's insight" + tags) all separate the prescribed thing from the discretionary thing on the same screen but at different weights. The prescription is a single big card; habit choices are a smaller strip.

---

## 2. Per-app sections

### GOWOD (mobility for CrossFitters — the closest adjacent app)

- **Home anatomy.** After a mobility assessment on onboarding, home opens on a "Daily Plan" hero: personalised routine driven by the user's mobility profile, available equipment, and time budget. Below the daily card: "Per Body Zone" (targeted work) and "Classic Flows" (Morning / Bedtime / Desk Job / Travel). Bottom tabs: profile, flows, settings.
- **Today's priority.** The Daily Plan is the default. Pre-WOD and Post-WOD are separate entry points the user opens *when they know they're training*.
- **Attached-to-workout.** This is the pattern to steal. On Pre-WOD or Post-WOD, GOWOD asks the user to pick (a) time budget, (b) equipment on hand, (c) the movements in today's WOD; it then generates a mobility flow shaped around those joints. Some CrossFit affiliates programme their WODs directly into GOWOD so the mobility session inherits the day's movements automatically.
- **Onboarding.** Three steps: download → mobility assessment → personalised routines. The assessment score becomes the app's ongoing progress metric ("+18% mobility in 60 days" is the marketing pitch — but internally that's the number the app is tuning).
- **Habit vs prescription.** Prescription. Daily Plan is *this* routine, not *pick* a routine. Users can override by picking a Classic Flow.
- **Progression.** Mobility score and per-joint scores over time. Streaks are secondary.

### Pliability (formerly ROMWOD)

- **Home anatomy.** App opens on "Daily" — one curated session, chosen for the user that morning. No decision required. Below it: shorter 5–10 min routines for time-crunched days, sport-specific programmes (HYROX / CrossFit / running / cycling / lifting / golf / combat), pain-relief flows, sleep and recovery flows.
- **Today's priority.** Daily hero > everything else. Balanced session length is chosen automatically; the user just presses play.
- **Attached-to-workout.** Weaker than GOWOD. Sport-specific programmes exist but they are their own multi-week arcs, not "attach to today's WOD."
- **Onboarding.** Mobility Test defines the sport, focus areas, and baseline. New UI across web/iOS/Android/tvOS launched with the ROMWOD → Pliability rename.
- **Habit vs prescription.** Prescription-first with a habit gloss. "Daily" session is a prescription; the sport programmes are prescriptions; the streak/frequency messaging is habit-flavoured.
- **Tone.** Deliberately dark, masculine, athletic — pitched away from studio-yoga aesthetics.

### Nike Training Club + Nike Run Club

- **Home anatomy (NTC).** Curated collections above the fold ("Get your hustle up," "5-minute fundamentals"). Browse-by-category (Strength / HIIT / Yoga / Pilates / Mindset) sits below. High-contrast, minimal chrome. Bottom tab bar.
- **Today's priority.** Weaker than the readiness-driven apps — NTC is a browse-and-choose experience with editorial curation. It suggests, it doesn't decide.
- **Attached-to-workout (NRC).** Interesting pattern: after a run ends, NRC prompts the user with a *post-run recovery routine or reminder-for-later*. Two buttons: "Do it now" / "Remind me." This is the mobility-attached-to-run pattern our app needs.
- **Onboarding.** Goal-setting, then category discovery.
- **Notifications.** Nike leans hard on post-workout re-engagement (the recovery prompt is a re-engagement moment disguised as UX).
- **Progression.** Milestones, badges, editorial recognition. Not primarily streak-based.

### Freeletics

- **Home anatomy.** "Coach Day" hero card: today's session with duration, equipment, focus, target muscles displayed at the top of the card. Directly below: "Explore all" — alternative or additional workouts by category. Bottom tabs.
- **Today's priority.** One card = one workout, chosen by the AI Coach for today. The rest of the app is discretionary.
- **Missed-session handling.** If you miss a day, the workout shifts to the next day rather than being lost. Days with a workout show a filled circle in the week view — days without are empty. This is the anti-perfectionism pattern.
- **Habit vs prescription.** Hybrid. Coach Day is a prescription; "Explore all" underneath is habit territory (add-on movement, alternate style). The two are visibly separated by weight, not by screen.
- **Onboarding.** Test workout → Coach generates a plan. AI adjusts based on completion, RPE, and time available.
- **Today View update.** Recent redesign moves from weekly to daily plan generation — the Coach re-decides each morning. This is the same "morning routing" pattern Whoop uses, applied to workout prescription.

### Whoop

- **Home anatomy.** Recovery score dominates: a single percentage in green/yellow/red at ~72pt equivalent, readable from arm's length. Below: Strain (0–21) and Sleep (hours + performance %). Everything else is reorderable tiles. Dark background so the coloured data pops.
- **Today's priority.** The Recovery score *is* the routing device. Green (67–99%) → high strain target, hard training encouraged. Yellow → moderate. Red (<33%) → light activity, mobility, hydration, earlier bedtime.
- **Recovery integration.** The score isn't just presented; it drives daily Strain Target and Coach recommendations. Whoop Coach (LLM-backed) will produce a training suggestion on demand: "recommend a low-strain day given my recovery and sleep debt."
- **Habit vs prescription.** Journal is habit-driven: users track up to 140 behaviours (sleep aids, caffeine timing, meditation, injury flags) and the app shows correlations with recovery. Journal now accepts voice/text prompts — friction almost zero.
- **Progression.** Weekly and monthly reviews, HRV trend, sleep debt, strain balance. Not gamified — trend-based.

### Oura Ring

- **Home anatomy.** "Today" tab. Three big score cards top: Sleep, Readiness, Activity. Below: reorderable shortcut chips (heart rate, daytime stress, cycle insights). Then a stack of cards grouped by health area (readiness / sleep / activity / stress / heart / metabolic).
- **Today's priority.** *Time-adaptive*. What's above the fold on Today changes through the day: morning → readiness, afternoon → activity, evening → wind-down. "Each day will look different and contain a different set of features depending on what is most timely and relevant."
- **Recovery integration.** Readiness Score aggregates sleep, HRV, RHR, temperature, prior activity. Daily insight cards translate the score into a soft recommendation.
- **Habit vs prescription.** Habits, not prescriptions. Oura tags what you did (nap / caffeine / alcohol / cold exposure) and shows correlations. Doesn't tell you to lift heavy or take a rest day directly.
- **Timeline.** A day-progress ribbon shows how sleep, activity, and choices played out over the last 24h. Retrospective, not prescriptive.

### Hevy Coach (programming layer over Hevy)

- **Home anatomy.** In Hevy (the athlete app), a "Coach" tab surfaces the assigned plan and program notes. Home shows today's routine as a widget that starts a live workout on tap.
- **Today's priority.** Today's routine widget is one tap from the OS home screen.
- **Missed-session handling.** Standard: workouts stay scheduled; user can shift day.
- **Notes.** Coach delivers RPE targets, superset pairing, rest timers per set — training variables load into the workout automatically. This is the "prescription per set" pattern, not "prescription per day."
- **Attached-to-workout.** Not really — Hevy Coach is a strength-only programming tool.

### TrainerRoad

- **Home anatomy.** "Career" screen with a snapshot: next workout card + Progression Levels + FTP/weight/W-per-kg. Calendar tab is the second main surface — a full week with green (completed) and grey (planned) TSS bars and a weekly load chart on top.
- **Today's priority.** "Next workout" card on Career is the hero. Users can jump directly into it.
- **Calendar model.** Weekly-first, with an interactive load graph. Rest days are shown explicitly as calendar entries (not empty cells) — the app treats "recover" as a scheduled thing.
- **TrainNow.** For unstructured days, the app recommends a workout based on current form and adaptation status. This is a "no plan today? Here's an intelligently chosen substitute" fallback.
- **Adaptive training.** Missed workouts don't just shift — the plan re-generates. This is expensive to build but the effect is that the plan never looks broken.

### Zwift Companion

- **Home anatomy.** Fitness graph on home shows completed + planned activities into the future. A "Next Up" card recommends the next activity based on ride history and preferred type.
- **Calendar model.** Weekly planner introduced in 2025. Users schedule specific rides, workouts, group events, and challenge tasks; the fitness graph updates ahead-of-time.
- **Today's priority.** "Next Up" card > the calendar > the workout library.
- **Third-party plans.** Populate the calendar automatically. Same principle as our "the plan lives in one place" idea.

### SugarWOD / Wodify (CrossFit affiliate apps)

- **Home anatomy.** The affiliate's WOD for today is the top card. Below: the day's leaderboard, teammates' scores, PR history.
- **Today's priority.** Today's programmed WOD. Simple, because the affiliate decides. This is why athletes engage more with SugarWOD than any other affiliate platform's equivalent — the choice architecture is removed.
- **Progression.** PRs and per-movement bests are surfaced on each movement. The WOD screen carries "your last time / your PR" inline.
- **Missed-session handling.** Weak — CrossFit affiliate model assumes the box has a schedule; the app doesn't try to make up for missed days.
- **What to steal.** The "one prescribed thing per day, with your history inline" pattern.

### Peloton

- **Home anatomy.** Streak counter (weeks-in-a-row + this-week days) near the top. "Fitness categories" grid for browsing modality. Header row has three icons top-right: bookmarks / Stack / schedule. If a Stack is active, a banner reads "Up Next In Your Stack."
- **Today's priority.** Stack. The user builds a chained sequence (bike → strength → stretch → meditation) and the Stack banner takes priority when active. Otherwise the app is a browse experience with light personalisation.
- **Attached content.** Cool-down and stretch classes are surfaced as "add to your Stack" suggestions at the end of a class. This is the same pattern as Nike Run Club's post-run prompt, but user-initiated (stacking) rather than app-initiated (post-run prompt).
- **Habit vs prescription.** Habit-first — the streak counter is prominent. Programs (multi-week prescriptions) exist but sit inside a browse experience.

### Ladder

- **Home anatomy.** "Start Workout" is one tap. Weekly programmed workouts by day. Home widgets on iOS surface water, macros, steps as small cards.
- **Today's priority.** Today's programmed workout, chosen by a human coach in 5–6 week blocks. Zero choice — pick your track once, then follow.
- **Progression.** 5–6 week block cadence with progressive difficulty. Team-based social layer for adherence.

### Streaks-style habit apps

- **Home anatomy.** A Today screen of large tappable habit tiles (Streaks caps at 12 — deliberately). Tile = big check circle + habit name + streak count. Widgets on iOS home and lock screens surface today's progress without opening the app.
- **Today's priority.** All habits equal-weight on one screen. Chronology and priority live in the widget stack.
- **Streak protection.** Sticky habit apps engineer forgiveness in: streak shields, weekly skip passes, "unified" streaks that stay alive if you log anything. Multiple streak tiers (micro / standard / challenge) so a bad day doesn't nuke the count.
- **What to avoid.** Pure red-wall guilt-trip design when a day is missed. Users abandon.

---

## 3. Patterns worth stealing (ranked)

### 1. The "Pre-WOD / Post-WOD" attachment pattern (GOWOD)
Rather than schedule mobility as its own daily obligation, attach it to the workout the user is already committed to. In our app: mobility is offered *when the user logs the run* (post-run mobility) or *when they start today's strength session* (pre-lift activation for hips). This gets the mobility done without adding a screen or a to-do. Best-in-class: **GOWOD.**

### 2. Morning-score-as-router (Whoop, Oura)
One score at the top of the Today screen changes what appears below. Green → strength card is hero, mobility is a strip. Amber → mobility promoted, strength de-emphasised. Red → recovery only. Our `progression_rules.states[green|amber|red]` model already exists; the UI hasn't consumed it. This is a two-hour build with outsized effect. Best-in-class: **Whoop.**

### 3. One hero card + secondary strip (Freeletics)
Coach Day is a big single card. "Explore all" is a scrollable horizontal strip below. This visually separates prescription from habit without needing two screens. Ports directly to our three content types: strength = hero, accessory = strip, run-mobility = attached-on-demand. Best-in-class: **Freeletics.**

### 4. Time-adaptive Today content (Oura)
Same screen looks different in the morning (readiness + plan preview) vs. evening (recovery summary + wind-down). Our Today screen currently shows everything all the time — a 6 AM view and a 6 PM view should not be identical. Best-in-class: **Oura.**

### 5. Missed-session soft handling (Freeletics, streak apps)
When a user misses a day, don't reset — shift, forgive, keep the streak with a "shield." Freeletics rolls today's workout to tomorrow. Streaks caps at 12 habits deliberately to avoid overwhelm. Never-miss-twice framing is more sustainable than never-miss. Best-in-class: **Freeletics** (workout shift), **Streaks** (shield).

### 6. Chained "Stack" pattern (Peloton, Zwift)
For days with multiple things (barbell + accessory + mobility), a user-visible chain — "Up Next" banner, ordered sequence — gives a linear progress feel without stacking three separate cards on Today. Peloton's Stack is the reference. Zwift's Next Up card is the leaner version.

### 7. History and PR inline on the movement (SugarWOD, Hevy)
Every movement carries "your last / your PR / date." Removes context-switching to a history tab. Our history view already matters — surfacing per-exercise history *at the moment of doing that exercise* is where it earns its keep.

### 8. Post-workout prompt for the attached habit (Nike Run Club)
The moment a run ends, prompt with "post-run mobility now or later?" Two buttons. If the user picks later, schedule a notification for evening. This is the exact mechanism for our run-mobility attachment.

### 9. Rest days are explicit calendar entries (TrainerRoad)
A rest day is scheduled content, not absence of content. Users see "Rest — mobility only" as a card, not a blank cell. This matters for a rehab app in particular — rest is prescribed, not accidental.

### 10. Journal correlations (Whoop, Oura)
Users log behaviours (sleep, caffeine, pain, provocateur exposure); the app surfaces correlations against outcomes. For our app, the natural analogue is: log symptom score + log what you did today + surface which exercises are amber-triggering. This is the missing bridge between `daily_log_schema` and useful clinical output.

---

## 4. Anti-patterns to avoid

- **Whoop's density trap for the uninitiated.** The Recovery number is great once you know what 67% means. Cold-start users get one giant percentage and no context. If you steal the "morning score" pattern, ship it with a one-line "what this means today" caption *and* the recommended actions inline. Never the number alone.
- **Streaks-app red-wall of guilt.** Missed-day design that reads as punishment produces churn, not adherence. Design for the comeback.
- **Peloton's browse-heavy home.** If the user has to *choose* between 40 classes on Today, you've offloaded a coach's job to the user. This is the mistake our current Today screen also makes — it lists everything.
- **NTC-style category grid as home.** Category browsing kills daily prescription. Fine for a discovery tab, wrong for a Today screen.
- **Wodify's "everything the affiliate offers" laundry list.** In athlete-view Wodify shows classes, WODs, leaderboard, PRs, retail, membership — all at once. Athlete engagement is significantly lower than SugarWOD as a result. Feature completeness ≠ usable Today screen.
- **Multi-level scoring that doesn't route.** Oura shows Sleep + Readiness + Activity. All three are useful but none *changes what appears next*. Whoop wins here because one score routes; Oura's three scores co-exist. Pick one primary signal for our morning check.
- **Streak counters as the only progression story.** Streaks reward consistency but not progress. For a rehab-to-strength app, adherence *without* strength gains is failure. Show PR/load progression alongside adherence — SugarWOD and Hevy do this well, streak apps don't.
- **Onboarding assessments the user can't re-take.** GOWOD's initial mobility test is the app's whole progress metric. Retaking it should be one tap; too many apps bury it three menus deep.

---

## 5. Recommendations for THIS app

The current Today screen has three content types competing at equal weight (strength blocks, rehab/accessory work, run-mobility) plus a vitals row, plus phase context. That is why it feels dense: nothing is the hero.

**The recommended pattern is Freeletics' hero-plus-strip, filtered by a Whoop-style morning router:**

1. **Above the fold: one hero card per day.**
   The hero is *whichever of the three content types is today's calendar-critical thing*. On barbell days, strength is hero. On rest days, mobility is hero. On run days, the run itself (or the post-run mobility) is hero. Pick using the same `todaysScheduledBlocks()` logic that already exists — but only the top item renders as hero. Everything else is deferred.

2. **Below the hero: a small "also today" strip.**
   Horizontal-scrolling or single-column list of the day's other items — accessory work, provocateur checklist, wind-down mobility. Small height, low weight, clearly secondary. Freeletics' "Explore all" is the reference.

3. **Run-mobility lives attached to the run, not on Today.**
   Do not schedule around-run mobility as a daily strip item. When the user logs a run (or opens the run block), *then* offer the pre-run and post-run mobility flows. Two-button post-run prompt: "Do mobility now" / "Later tonight." This is the GOWOD pre-/post-WOD pattern plus the Nike Run Club post-run prompt.

4. **The morning check-in is a router, not a form.**
   Log a symptom score 1–5 (green/amber/red as we already have). The check-in's job is to *decide what today looks like*. Green: full strength + accessory. Amber: reduced load, mobility promoted. Red: mobility only, log-only strength, "rest day" hero card. Currently the check-in produces data with no consequence. Making it consequential doubles the reason to fill it in.

5. **The vitals row (as flagged in the UX audit) becomes a tiny 44px status bar** or moves inside the hero card. It should not be a 300px block. Whoop's mistake to avoid: don't put four equal-weight numbers up top when one number (today's state) is the actual router.

6. **Rest days are content, not absence.** When the calendar says rest, the hero is "Rest — light mobility if you want it." TrainerRoad style. This matters especially because in a rehab context the user needs to see that rest was *planned*, not that they skipped.

7. **Missed-session behaviour: shift, don't reset.** If yesterday's strength wasn't logged, offer today: "Log yesterday now" *or* "Skip and continue." Never reset a phase. Streak-shield the accessory-work adherence but not the strength-progression (progression should reflect reality).

8. **Progression display: two streams, side by side.**
   - Adherence stream: days logged, sessions completed, mobility attached-to-run rate.
   - Load/symptom stream: strength progression per lift + symptom trend over weeks.
   The clinical value of this app is the *combination* — none of the researched apps mixes strength progression with symptom history. That's our differentiator.

**In one sentence:** steal Freeletics' hero-plus-strip layout, use the existing green/amber/red state as Whoop's routing device, attach run-mobility to the run via a Nike Run Club-style post-workout prompt, and hide everything else behind a tap. That fixes density without losing content.

---

## Sources

- [GOWOD Concept page](https://www.gowod.app/concept)
- [GOWOD — WillPower Strength & Rehab review](https://willpowerstrength.com/injury-prevention/gowod/)
- [GOWOD Garage Gym Reviews](https://www.garagegymreviews.com/equipment/gowod)
- [GOWOD Mobility Review 2024 — MuscleFitProgram](https://www.musclefitprogram.com/blog/gowod-mobility-app-review-2024-crossfit)
- [Pliability 90-day review — Fitness Tools Reviewed](https://fitnesstoolsreviewed.com/app-reviews/pliability-review-the-unfiltered-truth-after-90-days/)
- [Pliability review — Fitness Drum](https://fitnessdrum.com/pliability-app-review/)
- [Pliability review — Men's Fitness](https://mensfitness.co.uk/review/pliability-review/)
- [Pliability Mobility Test UX case study — Erwan Compes](https://www.erwancompes.com/cases/pliability)
- [Pliability vs GoWOD — TheProgrm](https://www.theprogrm.com/blog/romwod-vs-gowod)
- [Whoop design breakdown — 925 Studios](https://www.925studios.co/blog/whoop-design-breakdown)
- [Whoop Recovery 101](https://www.whoop.com/us/en/thelocker/how-does-whoop-recovery-work-101/)
- [Whoop Coach — Powered by OpenAI](https://www.whoop.com/us/en/thelocker/whoop-unveils-the-new-whoop-coach-powered-by-openai/)
- [Whoop Journal](https://www.whoop.com/us/en/thelocker/the-whoop-journal/)
- [Whoop 2026 What's New](https://www.whoop.com/us/en/thelocker/2026-whats-new/)
- [Oura — new app experience blog](https://ouraring.com/blog/new-oura-app-experience/)
- [Oura app help — how to use](https://support.ouraring.com/hc/en-us/articles/360058599753-How-to-Use-the-Oura-App)
- [Oura Readiness Score explained](https://ouraring.com/blog/readiness-score/)
- [Freeletics Today View update](https://www.freeletics.com/en/blog/posts/update-today-view/)
- [Freeletics — new week and coach day view](https://www.freeletics.com/en/blog/posts/new-coach-week-day-view/)
- [Freeletics Training Journeys](https://www.freeletics.com/en/blog/posts/update-freeletics-training-journeys/)
- [Freeletics review — Fitness Drum](https://fitnessdrum.com/freeletics-review/)
- [Nike Training Club — UI breakdown ScreensDesign](https://screensdesign.com/showcase/nike-training-club-wellness)
- [Nike Run Club — post-run design case study](https://www.erineconnolly.com/nike-run-club)
- [Peloton home tab update — PeloBuddy](https://www.pelobuddy.com/home-tab-digital/)
- [Peloton Stack how-to — Leah Ingram](https://www.leahingram.com/how-to-stack-peloton-classes/)
- [Peloton UI breakdown ScreensDesign](https://screensdesign.com/showcase/peloton-fitness-workouts)
- [TrainerRoad Calendar guide](https://support.trainerroad.com/hc/en-us/articles/360015831912-TrainerRoad-s-Calendar-What-It-Is-And-How-to-Use-it)
- [TrainerRoad new mobile app intro](https://www.trainerroad.com/blog/introducing-the-all-new-trainerroad-mobile-app/)
- [Zwift Companion — planning launch](https://zwiftinsider.com/planning-launch/)
- [Zwift Companion workout browsing](https://zwiftinsider.com/companion-3-54/)
- [SugarWOD — best workout tracking for CrossFit](https://www.sugarwod.com/2026/07/best-workout-tracking-app-for-crossfit-how-to-log-wods-and-track-prs/)
- [SugarWOD vs Wodify vs BTWB comparison — DroidLore](https://droidlore.com/crossfit/crossfit-apps-boxmembers)
- [Wodify Athlete member quickstart PDF](https://wodify-website-files.s3.amazonaws.com/coremarketing/print/2019_Wodify_Athlete_App_Member_Quickstart_guide.pdf)
- [Hevy Coach — client experience](https://www.hevyapp.com/features/trainer-platform/)
- [Hevy home screen widgets](https://www.hevyapp.com/features/home-screen-widgets/)
- [Ladder app review — Garage Gym Reviews](https://www.garagegymreviews.com/ladder-app-review)
- [Streak-based fitness psychology — Routyne](https://www.routyne.fit/blog/streak-based-fitness)
- [Never miss twice rule — OgamicX](https://ogamic.com/blog/never-miss-twice-rule-for-working-out)
- [Streak anxiety from fitness apps — OgamicX](https://ogamic.com/blog/streak-anxiety-from-fitness-apps)
- [Progressive disclosure — Nielsen Norman Group](https://www.nngroup.com/articles/progressive-disclosure/)
