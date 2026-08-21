# Competitive design matrix — Part 2 (strength/logging + CrossFit)

**Date:** 2026-08-21
**Agent:** research-agent-2
**Apps covered:** 10 (TrainingPeaks, Hevy, Fitbod, StrongLifts 5×5, Caliber, Ladder, Boostcamp, Future, SugarWOD, Wodwell)

## Sources consulted per app

| App | Marketing URL | App Store URL | Review / teardown URLs | Notes |
|---|---|---|---|---|
| TrainingPeaks | https://www.trainingpeaks.com | https://apps.apple.com/us/app/trainingpeaks/id408047715 | https://help.trainingpeaks.com/hc/en-us/articles/204071874-Performance-Management-Chart-PMC ; https://www.trainingpeaks.com/learn/articles/trainingpeaks-mobile-home-view/ | Web-heavy product; mobile has PMC on Home. Screenshots not directly viewed. |
| Hevy | https://hevyapp.com | https://apps.apple.com/us/app/hevy-gym-tracker-workout-log/id1458862350 | https://www.hevyapp.com/features/gym-progress/ ; https://www.hevyapp.com/features/year-in-review/ ; https://www.hevyapp.com/features/social-features/ ; https://help.hevyapp.com/hc/en-us/articles/35688036014231 ; https://www.hotelgyms.com/blog/hevy-workout-app-review-the-up-and-comer-taking-the-fitness-world-by-storm | Richest H-bucket data of the set. Calendar w/ multi-year view confirmed. |
| Fitbod | https://fitbod.me | https://apps.apple.com/us/app/fitbod-gym-fitness-planner/id1041517543 | https://www.indiehackers.com/post/fitbod-app-review-2026-honest-take-after-real-testing-45d5f07a1b ; https://help.fitbod.me/hc/en-us/articles/360006499194-Apple-Watch ; https://help.fitbod.me/hc/en-us/sections/35305345636375-Integrations | Muscle-fatigue heatmap is distinctive. CSV export via third-party per GitHub project. |
| StrongLifts 5×5 | https://stronglifts.com | https://apps.apple.com/us/app/stronglifts-5x5-workout-plan/id488580022 | https://dr-muscle.com/stronglift-5x5-app-review/ ; https://support.stronglifts.com/article/186-widget | UI described as dated ("early 2000s") per Dr. Muscle review. |
| Caliber | https://caliberstrong.com | https://apps.apple.com/us/app/caliber-strength-training/id1482405410 | https://barbend.com/caliber-fitness-app-review/ ; https://www.garagegymreviews.com/caliber-app-review | Data export in Menu > Account Details, per App Store notes. |
| Ladder | https://joinladder.com | https://apps.apple.com/us/app/ladder-strength-training-plans/id1502936453 | https://www.bustle.com/wellness/ladder-app-review ; https://theeverygirl.com/ladder-app-review/ ; https://www.outdoorsynomad.com/ladder-fitness-app-review/ | Team + human coach model; dark palette with teal per marketing. |
| Boostcamp | https://www.boostcamp.app | https://apps.apple.com/us/app/boostcamp-workout-programs/id1529354455 | https://barbend.com/boostcamp-review/ | Program-catalog first; year-in-review confirmed. |
| Future | https://future.co | https://apps.apple.com/us/app/future-pro-personal-training/id1288178982 | https://www.athleticinsight.com/exercise/future-fitness-app-review ; https://onbetterliving.com/future-app/ ; https://www.garagegymreviews.com/future-app-review | Human 1:1 coach model; app is chat-centric. |
| SugarWOD | https://sugarwod.com | https://apps.apple.com/us/app/sugarwod/id665516348 | https://www.sugarwod.com/athlete-features/ ; https://help.sugarwod.com/hc/en-us/articles/115003724008 | Gym-affiliated; leaderboard-first daily loop. |
| Wodwell | https://wodwell.com | https://apps.apple.com/us/app/wodwell/id6739048273 | https://wodwell.medium.com/log-your-workouts-on-wodwell-d2aae2f5addd | Very sparse public UI documentation; app relaunched 2025. |

---

## Attribute matrix

### 1. TrainingPeaks

- A1 Background scheme: light-primary; some in-app dark surfaces on iOS but not confirmed dual [source: https://apps.apple.com/us/app/trainingpeaks/id408047715]
- A2 Primary accent color: blue (TrainingPeaks brand blue, ~#1E7AC4) [source: https://www.trainingpeaks.com]
- A3 Accent economy: multi-accent (blue + PMC uses yellow/blue/pink for fitness/fatigue/form) [source: https://help.trainingpeaks.com/hc/en-us/articles/204071874-Performance-Management-Chart-PMC]
- A4 H1 max size: unknown — no screenshots inspected
- A5 Body-copy default: unknown
- A6 Mono/tabular numerals for data: yes (heavy numeric UI, PMC and workout files use tabular figures) [source: inferred from PMC documentation]
- A7 Card border radius: unknown
- A8 Card border weight: unknown
- A9 Icon stroke weight: unknown
- A10 Icon size default: unknown
- A11 Font family: system sans (unconfirmed) [source: unknown]
- A12 Illustration or photography: photography-heavy on marketing; charts-dominant in-app [source: https://www.trainingpeaks.com]
- B1 Number of primary tabs: 4 approx (Home, Calendar, Dashboard, More) [source: https://www.trainingpeaks.com/learn/articles/trainingpeaks-mobile-home-view/]
- B2 Nav position: bottom (iOS) [source: https://www.trainingpeaks.com/learn/articles/trainingpeaks-mobile-home-view/]
- B3 Persistent header: yes [source: same]
- B4 Dashboard vs session split: yes — Home shows Fitness/Fatigue/Form + upcoming; workouts open into detail [source: same]
- B5 Program picker: hybrid — coach-authored plans + self-plan + marketplace ("Find your plan") [source: https://www.trainingpeaks.com]
- B6 Onboarding step count: unknown — likely long, sport-selection + goals-event
- B7 Auth-first or content-first: auth-first (paid; coach relationship required for many features) [source: https://www.trainingpeaks.com]
- B8 Web app parity: yes; web is the flagship, mobile is companion [source: multiple TrainingPeaks help articles]
- B9 Watch app included: yes — Apple Watch (broad partner ecosystem: Garmin, Wahoo, Polar, Suunto) [source: https://www.trainingpeaks.com]
- B10 Widget included: unknown for iOS/Android widgets specifically
- C1 Line chart present: yes (PMC is line + area) [source: https://help.trainingpeaks.com/hc/en-us/articles/204071874-Performance-Management-Chart-PMC]
- C2 Bar chart present: yes (daily TSS bars in PMC) [source: same]
- C3 Heatmap present: unknown for mobile; desktop yes (annual training load heatmap in some views)
- C4 Ring / donut present: unknown
- C5 Sparkline present: unknown
- C6 Sankey / flow present: no [source: PMC docs]
- C7 Time-scale zoom levels: 7d / 28d / 90d / 365d (CTL Ramp Rate windows), plus custom season/annual [source: https://www.trainingpeaks.com/learn/articles/trainingpeaks-mobile-home-view/]
- C8 Absolute + relative deltas: yes — CTL/ATL/TSB numeric plus ramp rate percentage [source: same]
- C9 Comparison mode (this week vs last): yes — season-over-season is a coach staple [source: PMC docs]
- C10 Trend arrow chips: unknown for mobile
- C11 Aggregation tier at scale: rolling avg (CTL = 42-day EWMA, ATL = 7-day EWMA) [source: PMC docs]
- C12 Empty-state visualization design: unknown
- D1 Words-per-screen on primary home: medium (dashboard is chart + list) [source: https://www.trainingpeaks.com/learn/articles/trainingpeaks-mobile-home-view/]
- D2 Cards-per-scroll: unknown
- D3 Text-to-visual ratio: balanced [source: same]
- D4 Video embedded in session: yes (Lift adds 1,000+ video-guided strength movements) [source: https://www.trainingpeaks.com]
- D5 GIF/anim for exercises: yes (strength lift videos) [source: same]
- D6 Voice guidance: no (structured workouts have step prompts on head unit, not app voice) [source: PMC and general knowledge]
- D7 Music integration: no [source: unknown]
- D8 Instructor photos on session: yes for coach-authored plans (coach card) [source: https://www.trainingpeaks.com]
- D9 Long-form articles / blog inside app: partial (blog is on web, in-app coach comments) [source: https://www.trainingpeaks.com]
- D10 Colored states used: green/yellow/red for compliance score, plus PMC's fitness/fatigue/form triad [source: PMC docs; App Store description mentions "compliance scores"]
- E1 Confirm-first or auto-apply changes: none — schedule changes are user-driven; plan is coach-driven [source: App Store description]
- E2 Streaks visible on home: no explicit streak, but weeks-to-A-event countdown [source: mobile home article]
- E3 Achievements / badges surface: unknown; historically limited
- E4 Points / XP / rings: no
- E5 Push notification frequency: daily (workout reminders + coach comments)
- E6 Social feed: no (coaching platform, not social)
- E7 Skip / move affordance for planned session: yes — daily routine synchronization / move workouts [source: App Store description]
- E8 Undo affordance: unknown
- E9 Rest-timer type: not primary (endurance app); strength lift has structured workout timer [source: https://www.trainingpeaks.com]
- E10 Set-log input pattern: keypad + head-unit sync (auto-upload from Garmin etc.); manual set entry supported [source: App Store description]
- F1 Load-adjust proposals surface: partial — CTL trend informs coach, not auto-adjust [source: PMC docs]
- F2 Skip-effect propagation: no — coach must reshuffle; athlete can drag/move
- F3 Readiness / recovery score: yes — TSB (Form) is exactly this [source: PMC docs]
- F4 Symptom / injury tracking: partial — daily metrics (fatigue, motivation, sleep, soreness) available in athlete inputs [source: general TrainingPeaks knowledge]
- F5 Deload / rest indication: yes — Form value flags freshness; TSB > +25 = "fresh/peaked", < -30 = "overreached" [source: PMC docs]
- F6 Program deviation tolerance: flexible — plans are advisory, athlete-executed
- F7 Off-plan session logging: yes — device sync captures any workout
- F8 Coach chat surface: human coach — comments on workouts, notifications [source: App Store description]
- G1 Study citations visible in-product: no
- G2 Coach photos and credentials: yes — coach directory ("Find a coach") [source: https://www.trainingpeaks.com]
- G3 Peer testimonials in-app: unknown
- G4 "Backed by science" marketing: partial — PMC framed as sports-science-derived (Bannister/Coggan) [source: PMC docs]
- G5 Research / whitepaper pages: yes — help center articles explain PMC math [source: PMC docs]
- G6 Data export: yes — FIT/TCX/CSV via API and web [source: TrainingPeaks help center — inferred, standard endurance-tool feature]
- G7 Clinical / physio endorsement: no
- **H1 History time-range default:** week (calendar week is default home) [source: mobile home article]
- **H2 History aggregation at 400 days:** calendar navigation + PMC chart with rolling averages; year and season views [source: PMC docs; mobile home article]
- **H3 Progress metrics tier at 400 days:** rolling avg (CTL 42-d, ATL 7-d), plus per-workout retained [source: PMC docs]
- **H4 Retest list growth:** not applicable in the strength-log sense; sport-specific PRs surface via reports
- **H5 Off-day representation:** blank on calendar; PMC continues to decay CTL (visible dip) [source: PMC docs]
- **H6 Program-completion archive:** visible — seasons/plans are dated, historical plans remain in calendar
- **H7 Chart densification at 400 points:** rolling avg dominates; individual TSS bars remain visible but the CTL/ATL/TSB lines smooth them [source: PMC docs]
- **H8 Weekly-narrative retention:** all — coach comments and completed workouts stored indefinitely
- **H9 Data export as counterweight:** yes — CSV/FIT/TCX (assumed; industry standard) [source: unknown for exact format list]
- **H10 Long-time-user identity — "power user" surface:** partial — annual season summary, PMC's multi-year visualization; no formal tenure badges observed

---

### 2. Hevy

- A1 Background scheme: dual/auto (explicit dark-mode toggle, plus shareables in light/dark/transparent) [source: https://apps.apple.com/us/app/hevy-gym-tracker-workout-log/id1458862350]
- A2 Primary accent color: blue (calendar highlights + brand blue, approx #1E7EFB) [source: https://www.hevyapp.com/features/gym-progress/]
- A3 Accent economy: mostly single-accent blue with RPE colour scaling (green→red) on recent versions [source: App Store recent updates: "RPE color scaling"]
- A4 H1 max size: unknown
- A5 Body-copy default: unknown
- A6 Mono/tabular numerals for data: yes (set rows use tabular figures) [source: App Store screenshots caption "redesigned set row UI"]
- A7 Card border radius: unknown
- A8 Card border weight: unknown, likely hairline
- A9 Icon stroke weight: regular (system SF Symbols on iOS) [source: inferred]
- A10 Icon size default: unknown
- A11 Font family: system sans [source: inferred]
- A12 Illustration or photography: minimal — data-first UI, illustrations only in Year-in-Review [source: https://www.hevyapp.com/features/year-in-review/]
- B1 Number of primary tabs: 5 (Home/Feed, Workout, Exercises, Statistics, Profile — approximate per help center) [source: https://help.hevyapp.com/hc/en-us/articles/35688036014231]
- B2 Nav position: bottom [source: general iOS convention + screenshots]
- B3 Persistent header: yes
- B4 Dashboard vs session split: yes — Home is social feed, active workout is a separate modal screen [source: hevyapp.com/features/social-features/]
- B5 Program picker: hybrid — routine builder + Hevy Coach programs + copy-from-friends [source: https://hevyapp.com]
- B6 Onboarding step count: unknown — quick auth, unit/goal
- B7 Auth-first or content-first: auth-first (login required for any logging)
- B8 Web app parity: yes — hevy.com desktop for routine creation and analysis [source: https://hevyapp.com]
- B9 Watch app included: yes — Apple Watch and WearOS with complications, live activity, Dynamic Island [source: App Store]
- B10 Widget included: yes — widget support on iOS confirmed [source: App Store: "Widget support"]
- C1 Line chart present: yes (volume, weight, reps, 1RM lines) [source: https://hevyapp.com — "Advanced exercise charts"]
- C2 Bar chart present: yes (weekly volume bars, muscle distribution) [source: same]
- C3 Heatmap present: yes-ish — muscle distribution chart approximates it; workout calendar is the strongest heatmap-like view [source: https://www.hevyapp.com/features/training-chart/]
- C4 Ring / donut present: yes (muscle distribution donut) [source: same]
- C5 Sparkline present: unknown
- C6 Sankey / flow present: no
- C7 Time-scale zoom levels: 30d / 3mo / 1y / all-time (last two Pro-gated); calendar has week/year/multi-year [source: https://www.hevyapp.com/features/gym-progress/]
- C8 Absolute + relative deltas: yes — set rows show "vs. last time" delta [source: App Store: "with previous session comparison"]
- C9 Comparison mode (this week vs last): yes — monthly report compares to prior month [source: https://www.hevyapp.com/features/monthly-report/]
- C10 Trend arrow chips: partial — PR flags and up-arrows on new records [source: App Store]
- C11 Aggregation tier at scale: weekly volume aggregates + monthly report + annual review [source: gym-progress / monthly-report / year-in-review pages]
- C12 Empty-state visualization design: illustration (per marketing screenshots) — not verified
- D1 Words-per-screen on primary home: low-to-medium (feed is card-based with images)
- D2 Cards-per-scroll: 1-2 per scroll (social feed cards)
- D3 Text-to-visual ratio: balanced — data-first with workout images optional
- D4 Video embedded in session: yes — 400+ exercise instructional videos [source: App Store]
- D5 GIF/anim for exercises: yes [source: same]
- D6 Voice guidance: no
- D7 Music integration: no
- D8 Instructor photos on session: no (peer photos, not instructor)
- D9 Long-form articles / blog inside app: no (blog on web)
- D10 Colored states used: RPE color scale (green → red) on set rows; blue for logged calendar days [source: App Store "RPE color scaling"; https://www.hevyapp.com/features/gym-progress/]
- E1 Confirm-first or auto-apply changes: none — user-authored routines; auto-progression is opt-in and applies on next-set fill, not silent
- E2 Streaks visible on home: yes — active streak (consecutive weeks with ≥1 session) [source: gym-progress page]
- E3 Achievements / badges surface: yes — PR badges, milestones [source: App Store]
- E4 Points / XP / rings: no
- E5 Push notification frequency: silent to daily (rest timer + social)
- E6 Social feed: yes — full follow/like/comment feed on home [source: social-features page]
- E7 Skip / move affordance: yes — routines are user-controlled
- E8 Undo affordance: yes — sets can be edited/deleted post-hoc
- E9 Rest-timer type: large digit with auto-start; lock-screen Live Activity + Dynamic Island [source: App Store]
- E10 Set-log input pattern: keypad + previous-set autofill + +/- steppers on some fields [source: App Store]
- F1 Load-adjust proposals surface: partial — progressive overload nudge for bodyweight and standard lifts; not a "propose/accept" flow, more auto-fill [source: App Store recent updates]
- F2 Skip-effect propagation: no
- F3 Readiness / recovery score: no
- F4 Symptom / injury tracking: yes — "Injury management system" [source: App Store]
- F5 Deload / rest indication: no
- F6 Program deviation tolerance: flexible / self-authored
- F7 Off-plan session logging: yes — freeform workouts always allowed
- F8 Coach chat surface: none in athlete app; Hevy Coach is a separate product for trainers [source: hevycoach.com]
- G1 Study citations visible in-product: no
- G2 Coach photos and credentials: no in athlete app
- G3 Peer testimonials in-app: partial — social feed serves this purpose
- G4 "Backed by science" marketing: no strong claim
- G5 Research / whitepaper pages: no
- G6 Data export: CSV [source: https://help.hevyapp.com/hc/en-us/articles/38001424401943]
- G7 Clinical / physio endorsement: no
- **H1 History time-range default:** 3 months on graphs (free); calendar defaults to current week [source: https://www.hevyapp.com/features/gym-progress/]
- **H2 History aggregation at 400 days:** calendar with year/multi-year zoom, monthly reports, annual year-in-review [source: gym-progress + year-in-review pages]
- **H3 Progress metrics tier at 400 days:** individual entries retained + weekly rollups + monthly reports + annual [source: same]
- **H4 Retest list growth:** uncapped — every workout in calendar tap-through; PR list grows unbounded (per user reports) [source: App Store]
- **H5 Off-day representation:** blank calendar cells; streak counts weeks not days
- **H6 Program-completion archive:** visible — historical routines remain, workouts always accessible
- **H7 Chart densification at 400 points:** unknown — Pro users get all-time but reviews don't detail decimation. Muscle distribution chart aggregates by selected window (30d/3mo/1y/all) [source: training-chart page]
- **H8 Weekly-narrative retention:** all — monthly reports archive by month, annual year-in-review [source: monthly-report + year-in-review pages]
- **H9 Data export as counterweight:** CSV workouts + measurements [source: help center export article]
- **H10 Long-time-user identity — "power user" surface:** yes — annual Year-in-Review requires 10+ workouts, plus streak counter and all-time bests [source: year-in-review + gym-progress pages]

---

### 3. Fitbod

- A1 Background scheme: dual/auto (dark mode confirmed in reviews; marketing shows light) [source: https://fitbod.me — light marketing; https://www.indiehackers.com/post/fitbod-app-review-2026]
- A2 Primary accent color: coral / pink-red (pink-star.svg assets; brand red-orange) [source: https://fitbod.me]
- A3 Accent economy: multi — coral + muscle heatmap colors (green→yellow→red for recovery)
- A4 H1 max size: unknown
- A5 Body-copy default: unknown
- A6 Mono/tabular numerals for data: yes (weight/rep grid) [source: inferred from screenshot descriptions]
- A7 Card border radius: unknown
- A8 Card border weight: hairline (inferred)
- A9 Icon stroke weight: regular
- A10 Icon size default: unknown
- A11 Font family: custom sans (unconfirmed brand type)
- A12 Illustration or photography: illustration (muscle diagrams) + photography (marketing) [source: fitbod.me]
- B1 Number of primary tabs: 4 approx (Workout, Log, Progress, Profile — per common Fitbod description) [source: https://medium.com/product-x-management/app-critique-fitbod-b78db0b8e61e]
- B2 Nav position: bottom [source: same]
- B3 Persistent header: yes
- B4 Dashboard vs session split: yes — Log tab vs in-workout mode with restricted nav [source: App Store review "restricts navigation during active workouts"]
- B5 Program picker: algorithmic (workouts generated per session, not selected from catalog) [source: https://fitbod.me]
- B6 Onboarding step count: 8-12 (goal, experience, equipment, muscle priority, schedule, gender, weight, birthdate — approximate) [source: inferred from Medium critique]
- B7 Auth-first or content-first: auth-first (3 free workouts before paywall)
- B8 Web app parity: no dedicated web app
- B9 Watch app included: yes — Apple Watch logs sets, rest, HR [source: https://help.fitbod.me/hc/en-us/articles/360006499194]
- B10 Widget included: yes — iOS widget shows workouts this week vs goal [source: https://help.fitbod.me/hc/en-us/sections/35305345636375-Integrations]
- C1 Line chart present: yes ("beautiful charts and graphics") [source: https://www.indiehackers.com/post/fitbod-app-review-2026]
- C2 Bar chart present: unknown
- C3 Heatmap present: yes — muscle-fatigue heatmap is the signature feature [source: same]
- C4 Ring / donut present: unknown
- C5 Sparkline present: unknown
- C6 Sankey / flow present: no
- C7 Time-scale zoom levels: unknown — reviews mention "over time" without specifying
- C8 Absolute + relative deltas: yes — recommendations shift ("update as you improve") [source: fitbod.me]
- C9 Comparison mode: unknown
- C10 Trend arrow chips: unknown
- C11 Aggregation tier at scale: unknown from public sources — critique mentions "lacks a dedicated personal records tab" [source: App Store description]
- C12 Empty-state visualization design: illustration (muscle silhouette in empty states)
- D1 Words-per-screen on primary home: low (workout card + list)
- D2 Cards-per-scroll: 1-3
- D3 Text-to-visual ratio: visual-heavy (muscle silhouette dominant)
- D4 Video embedded in session: yes — 1,000+ HD exercise videos [source: App Store]
- D5 GIF/anim for exercises: yes — HD multi-angle demos [source: same]
- D6 Voice guidance: no
- D7 Music integration: no direct player; Apple Music can run alongside
- D8 Instructor photos on session: no
- D9 Long-form articles / blog inside app: no (blog on web)
- D10 Colored states used: green/yellow/red for muscle recovery on the fatigue heatmap [source: https://www.indiehackers.com/post/fitbod-app-review-2026]
- E1 Confirm-first or auto-apply changes: auto — algorithm generates next workout; user can swap/edit but the default is auto-applied [source: fitbod.me]
- E2 Streaks visible on home: partial — widget shows workouts-per-week vs goal [source: help center widget article]
- E3 Achievements / badges surface: unknown
- E4 Points / XP / rings: no
- E5 Push notification frequency: daily (workout reminders)
- E6 Social feed: no
- E7 Skip / move affordance: yes — swap exercises, skip
- E8 Undo affordance: yes
- E9 Rest-timer type: large digit with auto-start [source: App Store]
- E10 Set-log input pattern: keypad + previous-value autofill; +/- steppers [source: App Store]
- F1 Load-adjust proposals surface: yes — "real-time adjustments during workouts" [source: App Store]
- F2 Skip-effect propagation: yes — recovery model shifts next workout composition [source: fitbod.me]
- F3 Readiness / recovery score: yes — muscle-fatigue heatmap [source: indiehackers review]
- F4 Symptom / injury tracking: partial — exercise exclusions [source: App Store]
- F5 Deload / rest indication: yes (non-linear periodization schedules deloads automatically) [source: App Store]
- F6 Program deviation tolerance: flexible — algorithm adapts to edits [source: App Store: "learns from your edits"]
- F7 Off-plan session logging: yes — custom routines saveable
- F8 Coach chat surface: none (email support only) [source: App Store]
- G1 Study citations visible in-product: no
- G2 Coach photos and credentials: no (no human coach)
- G3 Peer testimonials in-app: no
- G4 "Backed by science" marketing: yes — "science-backed, proprietary algorithm" [source: fitbod.me]
- G5 Research / whitepaper pages: no
- G6 Data export: partial — third-party export tools exist (rrebase/fitdata on GitHub); no official CSV export documented [source: https://github.com/rrebase/fitdata]
- G7 Clinical / physio endorsement: no
- **H1 History time-range default:** unknown; "Log" tab shows all-history scroll [source: indiehackers review]
- **H2 History aggregation at 400 days:** unknown — reviewer flagged lack of PR tab; suggests limited long-term aggregation UI
- **H3 Progress metrics tier at 400 days:** unknown — likely individual entries with per-exercise chart drill-in
- **H4 Retest list growth:** unknown; reviewer notes no dedicated PR tab, implies per-exercise lookup required
- **H5 Off-day representation:** blank in Log; widget shows weekly count against goal
- **H6 Program-completion archive:** not applicable — no discrete "program" (session-by-session generator)
- **H7 Chart densification at 400 points:** unknown
- **H8 Weekly-narrative retention:** unknown — Fitbod does not appear to have monthly/annual recap analogous to Hevy
- **H9 Data export as counterweight:** unofficial only (community tools)
- **H10 Long-time-user identity — "power user" surface:** weak — no year-in-review or tenure badge found; long users are the ones who benefit most from the algorithm but the UI doesn't celebrate that [source: indiehackers review notes long-time users rate higher but doesn't cite in-app surface]

---

### 4. StrongLifts 5×5

- A1 Background scheme: dual (dark and light) — screenshots on app store show both [source: https://apps.apple.com/us/app/stronglifts-5x5-workout-plan/id488580022]
- A2 Primary accent color: red-orange / brand red [source: stronglifts.com]
- A3 Accent economy: single-accent (utilitarian design)
- A4 H1 max size: unknown — described as "dated" and functional [source: https://dr-muscle.com/stronglift-5x5-app-review/]
- A5 Body-copy default: unknown
- A6 Mono/tabular numerals for data: yes (weight/rep tables central)
- A7 Card border radius: small / squared per review's "early 2000s" descriptor [source: dr-muscle review]
- A8 Card border weight: hairline / 1px
- A9 Icon stroke weight: regular
- A10 Icon size default: unknown
- A11 Font family: system sans [source: inferred]
- A12 Illustration or photography: minimal — text-first [source: stronglifts.com]
- B1 Number of primary tabs: 3-4 (Workout, History, Charts, Settings — approximate) [source: App Store description]
- B2 Nav position: bottom or tab
- B3 Persistent header: yes
- B4 Dashboard vs session split: yes — plan-of-the-day vs in-workout tap-to-log
- B5 Program picker: catalog — 5×5 default; custom programs available on Pro [source: App Store]
- B6 Onboarding step count: minimal (starting weights, units)
- B7 Auth-first or content-first: content-first (free tier is generous; auth for cloud sync)
- B8 Web app parity: partial — spreadsheets on stronglifts.com; no web app per se [source: https://stronglifts.com/spreadsheet/stronglifts-5x5/]
- B9 Watch app included: yes — Apple Watch highly praised [source: App Store]
- B10 Widget included: yes — iOS widget shows workouts this week/month [source: https://support.stronglifts.com/article/186-widget]
- C1 Line chart present: yes — clear progress charts per lift [source: App Store]
- C2 Bar chart present: unknown
- C3 Heatmap present: no
- C4 Ring / donut present: no
- C5 Sparkline present: unknown
- C6 Sankey / flow present: no
- C7 Time-scale zoom levels: unknown — likely all-time by default
- C8 Absolute + relative deltas: yes — weight-up rules are core loop
- C9 Comparison mode: partial (previous workout's weights displayed)
- C10 Trend arrow chips: no
- C11 Aggregation tier at scale: unknown; charts likely stay per-lift line
- C12 Empty-state visualization design: text-only (inferred from "dated" descriptor)
- D1 Words-per-screen on primary home: low (workout card, sparse)
- D2 Cards-per-scroll: 1-2
- D3 Text-to-visual ratio: text-heavy
- D4 Video embedded in session: yes — form videos [source: App Store]
- D5 GIF/anim for exercises: unknown
- D6 Voice guidance: no
- D7 Music integration: no
- D8 Instructor photos on session: no
- D9 Long-form articles / blog inside app: partial — creator (Mehdi) emails and articles, delivered outside app [source: App Store]
- D10 Colored states used: green (set complete) / red (failed rep) — inferred from progressive-overload loop
- E1 Confirm-first or auto-apply changes: auto — deload triggers automatically on 3 fails [source: stronglifts.com]
- E2 Streaks visible on home: partial — widget shows count [source: widget support]
- E3 Achievements / badges surface: unknown — likely PR flags
- E4 Points / XP / rings: no
- E5 Push notification frequency: daily reminders
- E6 Social feed: no
- E7 Skip / move affordance: partial — workout order swap, skip day
- E8 Undo affordance: yes — set-tap can be undone
- E9 Rest-timer type: large digit auto-timer between sets [source: App Store]
- E10 Set-log input pattern: tap to check off (no keypad in default 5×5 loop); manual override available
- F1 Load-adjust proposals surface: yes — auto progression is the entire product
- F2 Skip-effect propagation: yes — deload triggered by fail streak [source: stronglifts.com]
- F3 Readiness / recovery score: no
- F4 Symptom / injury tracking: no
- F5 Deload / rest indication: yes — automatic deload logic [source: stronglifts.com]
- F6 Program deviation tolerance: rigid (5×5 dogma); custom programs available on Pro
- F7 Off-plan session logging: partial — custom workouts on Pro tier
- F8 Coach chat surface: none (email support only)
- G1 Study citations visible in-product: no
- G2 Coach photos and credentials: partial — Mehdi (creator) named
- G3 Peer testimonials in-app: no
- G4 "Backed by science" marketing: partial — progressive overload framing
- G5 Research / whitepaper pages: no (blog articles instead)
- G6 Data export: yes — spreadsheet export [source: App Store: "spreadsheet export capabilities"]
- G7 Clinical / physio endorsement: no
- **H1 History time-range default:** all-time / per-lift chart [source: App Store]
- **H2 History aggregation at 400 days:** unknown — line chart likely just gets longer; no decimation described [source: unknown]
- **H3 Progress metrics tier at 400 days:** individual entries per session; lifetime PR flagged
- **H4 Retest list growth:** limited — 5 lifts in the standard program keeps list short; uncapped in Pro custom
- **H5 Off-day representation:** blank; program is 3 days/week
- **H6 Program-completion archive:** not applicable — program is open-ended progression
- **H7 Chart densification at 400 points:** unknown — no aggregation described
- **H8 Weekly-narrative retention:** unknown — likely all-history
- **H9 Data export as counterweight:** spreadsheet export
- **H10 Long-time-user identity — "power user" surface:** partial — total lifetime volume implied but no year-in-review noted; historical PR list is the primary long-user surface

---

### 5. Caliber

- A1 Background scheme: dual (dark mode explicitly added in v5.13.1) [source: https://apps.apple.com/us/app/caliber-strength-training/id1482405410]
- A2 Primary accent color: blue [source: https://caliberstrong.com — "Blue call-to-action buttons"]
- A3 Accent economy: single-accent (professional-looking; blue-forward)
- A4 H1 max size: unknown
- A5 Body-copy default: unknown
- A6 Mono/tabular numerals for data: yes — Strength Score is a number [source: barbend review]
- A7 Card border radius: unknown
- A8 Card border weight: unknown
- A9 Icon stroke weight: regular
- A10 Icon size default: unknown
- A11 Font family: custom sans (unconfirmed)
- A12 Illustration or photography: photography (real members in coach content) [source: caliberstrong.com]
- B1 Number of primary tabs: 4-5 (Home, Workouts, Progress, Chat, Profile — inferred)
- B2 Nav position: bottom
- B3 Persistent header: yes
- B4 Dashboard vs session split: yes
- B5 Program picker: hybrid — 60+ coach-designed plans + custom + 1:1 coach [source: App Store]
- B6 Onboarding step count: unknown; free tier lets you start fast
- B7 Auth-first or content-first: auth-first for tracking; free tier is generous
- B8 Web app parity: unknown; primary is mobile
- B9 Watch app included: yes — Apple Watch, Mac, Vision noted in App Store metadata [source: App Store]
- B10 Widget included: unknown
- C1 Line chart present: yes — Strength Score trend, Strength Balance trend [source: caliberstrong.com; App Store: "Progress chart customization"]
- C2 Bar chart present: yes (volume, sets)
- C3 Heatmap present: unknown
- C4 Ring / donut present: unknown
- C5 Sparkline present: unknown
- C6 Sankey / flow present: no
- C7 Time-scale zoom levels: unknown (customization added recently) [source: App Store recent updates]
- C8 Absolute + relative deltas: yes — "improved by 11 points" style copy [source: caliberstrong.com]
- C9 Comparison mode: yes — weekly progress reviews from coach
- C10 Trend arrow chips: unknown
- C11 Aggregation tier at scale: weekly review is the primary rollup [source: caliberstrong.com]
- C12 Empty-state visualization design: unknown
- D1 Words-per-screen on primary home: medium
- D2 Cards-per-scroll: 2-3
- D3 Text-to-visual ratio: balanced (photography-rich)
- D4 Video embedded in session: yes — exercise tutorials + coach videos [source: App Store]
- D5 GIF/anim for exercises: yes
- D6 Voice guidance: unknown
- D7 Music integration: unknown
- D8 Instructor photos on session: yes — named coach visible in chat/workout header [source: caliberstrong.com]
- D9 Long-form articles / blog inside app: unknown
- D10 Colored states used: unknown; recent updates add dark mode
- E1 Confirm-first or auto-apply changes: none automated — coach proposes plan changes weekly (human-in-the-loop) [source: barbend review]
- E2 Streaks visible on home: unknown
- E3 Achievements / badges surface: yes — Strength Score is a milestone metric
- E4 Points / XP / rings: partial — Strength Score functions like XP
- E5 Push notification frequency: daily (coach chat + workout reminders)
- E6 Social feed: partial — "private workout groups" for training with friends [source: App Store]
- E7 Skip / move affordance: yes — schedule flex is coach-supported
- E8 Undo affordance: yes — set edits
- E9 Rest-timer type: unknown
- E10 Set-log input pattern: keypad + supersets support [source: App Store]
- F1 Load-adjust proposals surface: yes — coach adjusts weekly (Premium Coaching tier)
- F2 Skip-effect propagation: yes (coach reflows plan)
- F3 Readiness / recovery score: partial — coach interprets; no dedicated score
- F4 Symptom / injury tracking: unknown
- F5 Deload / rest indication: yes (coach-scheduled)
- F6 Program deviation tolerance: flexible; coach-authored plans are advisory
- F7 Off-plan session logging: yes — unlimited custom workouts [source: App Store]
- F8 Coach chat surface: human coach — in-app chat + video [source: App Store]
- G1 Study citations visible in-product: no
- G2 Coach photos and credentials: yes — "elite-level personal trainer" named, credential markers [source: App Store + caliberstrong.com]
- G3 Peer testimonials in-app: partial (marketing shows testimonials; unclear if surfaced in-product)
- G4 "Backed by science" marketing: yes — "science-based" positioning [source: App Store]
- G5 Research / whitepaper pages: no
- G6 Data export: yes — Menu > Account Details export [source: App Store recent updates]
- G7 Clinical / physio endorsement: no
- **H1 History time-range default:** unknown — Progress section revamped in v5.13.1
- **H2 History aggregation at 400 days:** unknown; recent updates mention "Progress chart customization across multiple activity types" — suggests configurable window [source: App Store]
- **H3 Progress metrics tier at 400 days:** unknown; Strength Score and Strength Balance are the summary metrics [source: caliberstrong.com]
- **H4 Retest list growth:** unknown; per-exercise history retained
- **H5 Off-day representation:** unknown
- **H6 Program-completion archive:** unknown; plans are dated so archival is implied
- **H7 Chart densification at 400 points:** unknown
- **H8 Weekly-narrative retention:** all — weekly coach reviews stored in chat history [source: App Store]
- **H9 Data export as counterweight:** yes (Account Details export) [source: App Store]
- **H10 Long-time-user identity — "power user" surface:** partial — Strength Score all-time improvement, before-and-after progress-photo comparisons; no explicit year-in-review noted [source: App Store]

---

### 6. Ladder

- A1 Background scheme: dark-primary (marketing site is dark; app screenshots on App Store are dark) [source: https://joinladder.com]
- A2 Primary accent color: teal / cyan [source: https://joinladder.com]
- A3 Accent economy: single-accent teal + white text
- A4 H1 max size: large marketing hero, but in-app unknown
- A5 Body-copy default: unknown
- A6 Mono/tabular numerals for data: unknown
- A7 Card border radius: unknown
- A8 Card border weight: unknown
- A9 Icon stroke weight: regular
- A10 Icon size default: unknown
- A11 Font family: custom sans (Ladder brand type)
- A12 Illustration or photography: photography (coach portraits + demo photos) [source: joinladder.com]
- B1 Number of primary tabs: 4-5 (Team, Workout, Chat, Progress, Profile — inferred) [source: theeverygirl.com review]
- B2 Nav position: bottom
- B3 Persistent header: yes
- B4 Dashboard vs session split: yes — daily-plan home vs in-workout guided screen
- B5 Program picker: catalog — 20+ coach-led team programs [source: App Store]
- B6 Onboarding step count: quiz-based; 6-10 steps (goals, style, coach team) [source: joinladder.com]
- B7 Auth-first or content-first: content-first (free workout of the day visible without account) [source: joinladder.com]
- B8 Web app parity: partial (quiz/onboarding on web; app is mobile) [source: joinladder.com]
- B9 Watch app included: yes — Apple Watch + Health integration [source: App Store]
- B10 Widget included: yes — home-screen widgets for water, macros, steps [source: App Store]
- C1 Line chart present: yes — 1RM estimation trend [source: App Store]
- C2 Bar chart present: unknown
- C3 Heatmap present: unknown
- C4 Ring / donut present: partial — macro ring likely [source: App Store]
- C5 Sparkline present: unknown
- C6 Sankey / flow present: no
- C7 Time-scale zoom levels: unknown
- C8 Absolute + relative deltas: yes — plateau detection alerts [source: App Store]
- C9 Comparison mode: yes — historical trend analysis [source: App Store]
- C10 Trend arrow chips: yes — plateau alerts function as trend chips
- C11 Aggregation tier at scale: unknown; weekly new-workout cadence implies weekly rollups
- C12 Empty-state visualization design: unknown
- D1 Words-per-screen on primary home: medium (workout card + coach video)
- D2 Cards-per-scroll: 1-3
- D3 Text-to-visual ratio: visual-heavy (coach video prominent)
- D4 Video embedded in session: yes — coach demonstrates each move [source: bustle review]
- D5 GIF/anim for exercises: yes
- D6 Voice guidance: yes — voiceover announcing next move; toggleable [source: outdoorsynomad review]
- D7 Music integration: yes — Spotify/Apple Music; auto-volume during coaching [source: joinladder.com]
- D8 Instructor photos on session: yes — coach face + name on card [source: joinladder.com]
- D9 Long-form articles / blog inside app: unknown
- D10 Colored states used: teal (primary), progress bars during workout; captions + screen flash for accessibility [source: App Store]
- E1 Confirm-first or auto-apply changes: none automated — coach programs weekly [source: joinladder.com]
- E2 Streaks visible on home: unknown
- E3 Achievements / badges surface: yes — PR alerts [source: joinladder.com]
- E4 Points / XP / rings: unknown
- E5 Push notification frequency: daily (coach post + reminders)
- E6 Social feed: yes — team chat + "Cheers" [source: App Store]
- E7 Skip / move affordance: unknown — workouts are the day's plan
- E8 Undo affordance: yes
- E9 Rest-timer type: countdown timer + progress bar during work interval [source: bustle review]
- E10 Set-log input pattern: keypad + previous-value autofill [source: joinladder.com]
- F1 Load-adjust proposals surface: yes — plateau detection [source: App Store]
- F2 Skip-effect propagation: no
- F3 Readiness / recovery score: no
- F4 Symptom / injury tracking: unknown
- F5 Deload / rest indication: partial — coach-programmed
- F6 Program deviation tolerance: rigid — the team follows the coach's weekly plan
- F7 Off-plan session logging: partial — journal-only, not part of the program flow
- F8 Coach chat surface: human coach — team chat with live coach [source: joinladder.com]
- G1 Study citations visible in-product: no
- G2 Coach photos and credentials: yes — 24 named coaches [source: joinladder.com]
- G3 Peer testimonials in-app: yes — teammate "Cheers" feed
- G4 "Backed by science" marketing: partial
- G5 Research / whitepaper pages: no
- G6 Data export: unknown
- G7 Clinical / physio endorsement: no
- **H1 History time-range default:** unknown; journal + trend implies scrolling recent workouts
- **H2 History aggregation at 400 days:** unknown; app is 5 years old, mature enough to have long users but no explicit archival strategy described [source: unknown]
- **H3 Progress metrics tier at 400 days:** individual entries + historical trend analysis per lift [source: App Store]
- **H4 Retest list growth:** unknown; team programs cycle so unclear if PR list is per-program or unified
- **H5 Off-day representation:** unknown
- **H6 Program-completion archive:** unknown; users can switch teams so completion likely shows
- **H7 Chart densification at 400 points:** unknown
- **H8 Weekly-narrative retention:** partial — chat retains weekly team discussion; unclear retention window
- **H9 Data export as counterweight:** unknown — no explicit CSV export noted
- **H10 Long-time-user identity — "power user" surface:** unknown — no year-in-review or tenure surface documented

---

### 7. Boostcamp

- A1 Background scheme: dual (dark mode confirmed) [source: https://barbend.com/boostcamp-review/]
- A2 Primary accent color: unknown — neutral palette with CTA color [source: boostcamp.app]
- A3 Accent economy: single-accent (utilitarian)
- A4 H1 max size: unknown
- A5 Body-copy default: unknown
- A6 Mono/tabular numerals for data: yes (RPE + weight grid)
- A7 Card border radius: unknown
- A8 Card border weight: hairline
- A9 Icon stroke weight: regular
- A10 Icon size default: unknown
- A11 Font family: system sans
- A12 Illustration or photography: minimal — data-focused screens [source: boostcamp.app]
- B1 Number of primary tabs: 5 approx (Home, Programs, Coaches, Exercises, About/Profile) [source: boostcamp.app]
- B2 Nav position: bottom
- B3 Persistent header: yes
- B4 Dashboard vs session split: yes
- B5 Program picker: catalog-first — 11,000+ programs (130+ coach-designed + community) [source: boostcamp.app]
- B6 Onboarding step count: minimal (program pick is the onboarding)
- B7 Auth-first or content-first: content-first — free programs; browse before signup [source: boostcamp.app]
- B8 Web app parity: yes — "streamlined on both mobile and desktop" [source: barbend review]
- B9 Watch app included: yes — Apple Watch, iPad, Vision [source: App Store]
- B10 Widget included: unknown
- C1 Line chart present: yes — performance / 1RM trend [source: App Store]
- C2 Bar chart present: yes — muscle volume [source: App Store]
- C3 Heatmap present: partial — body-mapping muscle engagement view [source: barbend review]
- C4 Ring / donut present: unknown
- C5 Sparkline present: unknown
- C6 Sankey / flow present: no
- C7 Time-scale zoom levels: unknown
- C8 Absolute + relative deltas: yes — "previous session comparison" [source: barbend review]
- C9 Comparison mode: yes (previous session)
- C10 Trend arrow chips: unknown
- C11 Aggregation tier at scale: annual — year-in-review is confirmed [source: App Store: "Year-in-review annual statistics sharing"]
- C12 Empty-state visualization design: unknown
- D1 Words-per-screen on primary home: medium
- D2 Cards-per-scroll: 2-3
- D3 Text-to-visual ratio: text-heavy (program-cards)
- D4 Video embedded in session: yes — form videos [source: boostcamp.app]
- D5 GIF/anim for exercises: yes
- D6 Voice guidance: no
- D7 Music integration: no
- D8 Instructor photos on session: partial — coach avatars on program cards [source: boostcamp.app]
- D9 Long-form articles / blog inside app: partial (blog on web; help text on RPE etc.)
- D10 Colored states used: unknown
- E1 Confirm-first or auto-apply changes: auto — auto-progressions fill in your weights, but user still logs/confirms per set [source: App Store]
- E2 Streaks visible on home: unknown
- E3 Achievements / badges surface: partial — PR reset flags
- E4 Points / XP / rings: no
- E5 Push notification frequency: daily
- E6 Social feed: yes — community feed for friend connections [source: App Store]
- E7 Skip / move affordance: yes — exercise swaps, program customization
- E8 Undo affordance: yes
- E9 Rest-timer type: large digit + plate calculator [source: boostcamp.app]
- E10 Set-log input pattern: keypad + previous-set autofill + RPE picker [source: App Store]
- F1 Load-adjust proposals surface: yes — auto-progression [source: App Store]
- F2 Skip-effect propagation: partial — program handles it
- F3 Readiness / recovery score: no
- F4 Symptom / injury tracking: no
- F5 Deload / rest indication: yes — built into programs (deload weeks) [source: App Store]
- F6 Program deviation tolerance: flexible — swap and customize
- F7 Off-plan session logging: yes — custom program builder
- F8 Coach chat surface: none (coach = program author, not conversational)
- G1 Study citations visible in-product: no
- G2 Coach photos and credentials: yes — named coaches (Cody Lefever, Jim Wendler, Alex Bromley) on program cards [source: boostcamp.app]
- G3 Peer testimonials in-app: partial
- G4 "Backed by science" marketing: partial — periodization language
- G5 Research / whitepaper pages: no (blog articles)
- G6 Data export: unknown
- G7 Clinical / physio endorsement: no
- **H1 History time-range default:** unknown
- **H2 History aggregation at 400 days:** unknown — year-in-review is the confirmed annual surface [source: App Store]
- **H3 Progress metrics tier at 400 days:** unknown
- **H4 Retest list growth:** unknown; PR reset function suggests it can be curated [source: App Store]
- **H5 Off-day representation:** unknown
- **H6 Program-completion archive:** yes (programs are discrete; complete a program → next one) — implied by catalog structure
- **H7 Chart densification at 400 points:** unknown
- **H8 Weekly-narrative retention:** unknown
- **H9 Data export as counterweight:** unknown
- **H10 Long-time-user identity — "power user" surface:** yes — annual year-in-review shareable [source: App Store]

---

### 8. Future

- A1 Background scheme: dual (App Store screenshots show both; app is chat-heavy so likely follows system) [source: https://apps.apple.com/us/app/future-pro-personal-training/id1288178982]
- A2 Primary accent color: unknown — reviews describe "clean" without color specifics [source: garagegymreviews]
- A3 Accent economy: single-accent (calm, coaching-focused)
- A4 H1 max size: unknown
- A5 Body-copy default: unknown
- A6 Mono/tabular numerals for data: unknown
- A7 Card border radius: unknown
- A8 Card border weight: unknown
- A9 Icon stroke weight: unknown
- A10 Icon size default: unknown
- A11 Font family: custom sans (unconfirmed)
- A12 Illustration or photography: photography (coach headshots dominate) [source: future.co]
- B1 Number of primary tabs: 3-4 (Workout, Chat, Progress, Profile — inferred from reviews) [source: onbetterliving.com/future-app]
- B2 Nav position: bottom
- B3 Persistent header: yes
- B4 Dashboard vs session split: yes
- B5 Program picker: none (1:1 coach designs each workout) [source: future.co]
- B6 Onboarding step count: high — quiz + intake + coach match + FaceTime consultation [source: future.co]
- B7 Auth-first or content-first: auth-first (paid $50 first month → $199/mo)
- B8 Web app parity: unknown (Apple Watch + iOS focus)
- B9 Watch app included: yes — Apple Watch integration [source: future.co]
- B10 Widget included: unknown
- C1 Line chart present: yes — visualized workout reports [source: garagegymreviews]
- C2 Bar chart present: unknown
- C3 Heatmap present: no
- C4 Ring / donut present: unknown
- C5 Sparkline present: unknown
- C6 Sankey / flow present: no
- C7 Time-scale zoom levels: unknown
- C8 Absolute + relative deltas: unknown
- C9 Comparison mode: yes (coach compares week-over-week in chat) [source: future.co]
- C10 Trend arrow chips: unknown
- C11 Aggregation tier at scale: weekly review from coach [source: future.co]
- C12 Empty-state visualization design: unknown
- D1 Words-per-screen on primary home: medium (chat messages + workout card)
- D2 Cards-per-scroll: 1-2
- D3 Text-to-visual ratio: text-heavy (chat) + visual (workout videos)
- D4 Video embedded in session: yes — interactive workout videos step-by-step [source: garagegymreviews]
- D5 GIF/anim for exercises: yes
- D6 Voice guidance: yes — voice cues during exercise [source: garagegymreviews]
- D7 Music integration: unknown
- D8 Instructor photos on session: yes — coach face prominent throughout [source: future.co]
- D9 Long-form articles / blog inside app: no
- D10 Colored states used: unknown
- E1 Confirm-first or auto-apply changes: partial — coach proposes plan changes conversationally, user opts in (human confirm-first)
- E2 Streaks visible on home: unknown
- E3 Achievements / badges surface: unknown
- E4 Points / XP / rings: no
- E5 Push notification frequency: daily-multiple (coach messages + reminders + check-ins)
- E6 Social feed: no (only 1:1 with coach)
- E7 Skip / move affordance: yes — reschedule without penalty [source: future.co]
- E8 Undo affordance: yes
- E9 Rest-timer type: unknown; guided workouts have step timers
- E10 Set-log input pattern: keypad + "Record Form" video upload to coach [source: garagegymreviews]
- F1 Load-adjust proposals surface: yes — coach modifies weekly [source: future.co]
- F2 Skip-effect propagation: yes — coach reflows plan
- F3 Readiness / recovery score: unknown
- F4 Symptom / injury tracking: partial — coach knows history including injuries [source: future.co]
- F5 Deload / rest indication: partial — coach-scheduled
- F6 Program deviation tolerance: flexible — flexible scheduling core to product [source: future.co]
- F7 Off-plan session logging: yes
- F8 Coach chat surface: human coach — chat + FaceTime video calls [source: future.co]
- G1 Study citations visible in-product: no
- G2 Coach photos and credentials: yes — coach directory with certifications [source: future.co]
- G3 Peer testimonials in-app: no
- G4 "Backed by science" marketing: partial
- G5 Research / whitepaper pages: no
- G6 Data export: unknown
- G7 Clinical / physio endorsement: no
- **H1 History time-range default:** unknown
- **H2 History aggregation at 400 days:** unknown — likely chat-centric; long chats accumulate
- **H3 Progress metrics tier at 400 days:** unknown — coach interprets, no dedicated aggregation UI documented
- **H4 Retest list growth:** unknown
- **H5 Off-day representation:** unknown
- **H6 Program-completion archive:** unknown; programs are continuously reshaped by coach
- **H7 Chart densification at 400 points:** unknown
- **H8 Weekly-narrative retention:** all — weekly coach check-ins accumulate in chat
- **H9 Data export as counterweight:** unknown
- **H10 Long-time-user identity — "power user" surface:** partial — long tenure with same coach IS the identity, but no explicit tenure badge / year-in-review observed [source: onbetterliving.com/future-app: 4-year user's review does not mention such a surface]

---

### 9. SugarWOD

- A1 Background scheme: dual (light-primary marketing; dark option in-app implied by "Blue opening screen" mention in reviews) [source: https://apps.apple.com/us/app/sugarwod/id665516348]
- A2 Primary accent color: blue (SugarWOD brand blue; "blue opening screen") [source: App Store user review]
- A3 Accent economy: single-accent + gray design accent per marketing [source: sugarwod.com]
- A4 H1 max size: unknown
- A5 Body-copy default: unknown
- A6 Mono/tabular numerals for data: yes (leaderboard tables)
- A7 Card border radius: unknown
- A8 Card border weight: hairline
- A9 Icon stroke weight: regular
- A10 Icon size default: unknown
- A11 Font family: custom sans (unconfirmed)
- A12 Illustration or photography: photography (athletes at CrossFit boxes) [source: sugarwod.com]
- B1 Number of primary tabs: 4-5 (Today's WOD, Leaderboard, History, Tribe/Social, More/Profile — inferred)
- B2 Nav position: bottom
- B3 Persistent header: yes
- B4 Dashboard vs session split: yes — Today's WOD card is the daily home
- B5 Program picker: catalog — gym owner picks; athlete follows; marketplace has CompTrain, Mayhem, Invictus etc. [source: sugarwod.com]
- B6 Onboarding step count: minimal — gym affiliation drives content
- B7 Auth-first or content-first: auth-first (must join a gym or programmer)
- B8 Web app parity: partial — coach/programmer tools are web; athlete is mobile-first
- B9 Watch app included: unknown — GPS running feature exists, watch integration unclear [source: App Store]
- B10 Widget included: unknown
- C1 Line chart present: yes — 1RM chart estimation [source: App Store]
- C2 Bar chart present: unknown
- C3 Heatmap present: no
- C4 Ring / donut present: no
- C5 Sparkline present: unknown
- C6 Sankey / flow present: no
- C7 Time-scale zoom levels: unknown; per-movement history scrollable
- C8 Absolute + relative deltas: yes — PR call-outs, previous lift data pre-filled [source: App Store]
- C9 Comparison mode: yes (previous benchmark comparison)
- C10 Trend arrow chips: yes — PR flags
- C11 Aggregation tier at scale: unknown
- C12 Empty-state visualization design: unknown
- D1 Words-per-screen on primary home: medium (WOD text is prose-heavy by CrossFit convention)
- D2 Cards-per-scroll: 1-2 (today's WOD + leaderboard tile)
- D3 Text-to-visual ratio: text-heavy (WOD prose) with photos in feed
- D4 Video embedded in session: yes — movement instruction library [source: sugarwod.com]
- D5 GIF/anim for exercises: partial (video-first)
- D6 Voice guidance: no
- D7 Music integration: no
- D8 Instructor photos on session: partial (coach note headers)
- D9 Long-form articles / blog inside app: unknown
- D10 Colored states used: unknown — leaderboard likely uses Rx/Scaled color badges
- E1 Confirm-first or auto-apply changes: none — daily WOD comes from gym; not adaptive
- E2 Streaks visible on home: unknown
- E3 Achievements / badges surface: yes — PR flags + Rx badge
- E4 Points / XP / rings: partial — "fist bumps" are a social-currency mechanic [source: sugarwod.com]
- E5 Push notification frequency: daily — WOD-posted notifications [source: sugarwod.com]
- E6 Social feed: yes — daily leaderboard + comments + fist bumps [source: sugarwod.com]
- E7 Skip / move affordance: no — WOD is the day's WOD
- E8 Undo affordance: yes (result edits)
- E9 Rest-timer type: WOD timer (AMRAP/EMOM/for-time) not "rest between sets" — CrossFit-specific
- E10 Set-log input pattern: text/number entry for result (time, reps, weight) + Rx toggle
- F1 Load-adjust proposals surface: no (gym-programmed)
- F2 Skip-effect propagation: no
- F3 Readiness / recovery score: no
- F4 Symptom / injury tracking: no
- F5 Deload / rest indication: no (gym decides)
- F6 Program deviation tolerance: rigid — daily WOD is the WOD
- F7 Off-plan session logging: yes — "Record custom workouts outside the gym" [source: App Store]
- F8 Coach chat surface: partial — gym coach comments on the feed
- G1 Study citations visible in-product: no
- G2 Coach photos and credentials: partial (coach names)
- G3 Peer testimonials in-app: yes — daily leaderboard functions as peer proof
- G4 "Backed by science" marketing: no
- G5 Research / whitepaper pages: no
- G6 Data export: yes — CSV via More > Export Workouts [source: https://help.sugarwod.com/hc/en-us/articles/115003724008]
- G7 Clinical / physio endorsement: no
- **H1 History time-range default:** likely recent-first per-movement scroll [source: App Store]
- **H2 History aggregation at 400 days:** unknown from screenshots; benchmark comparisons across long history is a documented use case [source: sugarwod.com]
- **H3 Progress metrics tier at 400 days:** individual entries + benchmark comparisons; 1RM chart estimation [source: App Store]
- **H4 Retest list growth:** unknown; per-movement PRs are the primary long-term surface [source: App Store]
- **H5 Off-day representation:** blank on calendar (implied)
- **H6 Program-completion archive:** not applicable — daily WOD, no discrete program
- **H7 Chart densification at 400 points:** unknown
- **H8 Weekly-narrative retention:** unknown
- **H9 Data export as counterweight:** CSV [source: SugarWOD help center]
- **H10 Long-time-user identity — "power user" surface:** partial — 35M+ "fist bumps given" is a lifetime-community metric; benchmark PRs form the long-user identity. No year-in-review documented [source: sugarwod.com]

---

### 10. Wodwell

- A1 Background scheme: light-primary with black accents (blue-and-black scheme per marketing) [source: https://wodwell.com]
- A2 Primary accent color: blue [source: wodwell.com]
- A3 Accent economy: single-accent
- A4 H1 max size: unknown
- A5 Body-copy default: unknown
- A6 Mono/tabular numerals for data: unknown
- A7 Card border radius: unknown
- A8 Card border weight: unknown
- A9 Icon stroke weight: regular
- A10 Icon size default: unknown
- A11 Font family: unknown
- A12 Illustration or photography: photography (athletes in garages, hotels, outdoors) [source: wodwell.com]
- B1 Number of primary tabs: 3-4 (Training, Search, WOD Whiteboard, Profile — inferred from marketing nav) [source: wodwell.com]
- B2 Nav position: bottom
- B3 Persistent header: yes
- B4 Dashboard vs session split: yes — "the Whiteboard" is a session view [source: wodwell.com]
- B5 Program picker: hybrid — ELEMENT (guided daily program) + VAULT (searchable WOD database for self-selection) [source: wodwell.com]
- B6 Onboarding step count: unknown; ELEMENT quiz for equipment/goals implied [source: wodwell.com]
- B7 Auth-first or content-first: partial — web has extensive open catalog; app requires signup
- B8 Web app parity: yes — wodwell.com is the flagship; app is companion [source: wodwell.com]
- B9 Watch app included: unknown — not mentioned
- B10 Widget included: unknown
- C1 Line chart present: unknown
- C2 Bar chart present: unknown
- C3 Heatmap present: unknown
- C4 Ring / donut present: unknown
- C5 Sparkline present: unknown
- C6 Sankey / flow present: no
- C7 Time-scale zoom levels: unknown
- C8 Absolute + relative deltas: unknown
- C9 Comparison mode: partial — public sharing on wodwell.com for peer comparison [source: wodwell.medium.com/log-your-workouts-on-wodwell]
- C10 Trend arrow chips: unknown
- C11 Aggregation tier at scale: unknown
- C12 Empty-state visualization design: unknown
- D1 Words-per-screen on primary home: high (WOD prose is dense)
- D2 Cards-per-scroll: 1-2
- D3 Text-to-visual ratio: text-heavy (workout descriptions)
- D4 Video embedded in session: yes — movement demos in exercise library
- D5 GIF/anim for exercises: unknown
- D6 Voice guidance: no
- D7 Music integration: no
- D8 Instructor photos on session: partial — coach notes with names in ELEMENT [source: wodwell.com]
- D9 Long-form articles / blog inside app: partial — "daily coaching notes and intent explanations" [source: wodwell.com]
- D10 Colored states used: unknown; blue accent button treatment described
- E1 Confirm-first or auto-apply changes: none — ELEMENT is pre-programmed; VAULT is self-select
- E2 Streaks visible on home: unknown
- E3 Achievements / badges surface: partial — public leaderboard rank
- E4 Points / XP / rings: no
- E5 Push notification frequency: daily (daily workout post)
- E6 Social feed: yes — global community feed / leaderboards + community chat [source: wodwell.com]
- E7 Skip / move affordance: partial — random WOD button; can swap in VAULT [source: wodwell.com]
- E8 Undo affordance: yes
- E9 Rest-timer type: WOD timer (AMRAP/EMOM etc.) — CrossFit convention
- E10 Set-log input pattern: text/number entry for result (time, reps, weight) + share toggle
- F1 Load-adjust proposals surface: partial — AI-powered personalization adapts to goals/schedule/equipment [source: wodwell.com]
- F2 Skip-effect propagation: unknown
- F3 Readiness / recovery score: no
- F4 Symptom / injury tracking: partial — movement limitations feed adaptation [source: wodwell.com]
- F5 Deload / rest indication: unknown
- F6 Program deviation tolerance: flexible — VAULT allows total self-authoring
- F7 Off-plan session logging: yes — Activity Log
- F8 Coach chat surface: partial — "direct coaching support and on-demand personalization options" [source: wodwell.com]
- G1 Study citations visible in-product: no
- G2 Coach photos and credentials: partial
- G3 Peer testimonials in-app: yes — leaderboard + public sharing
- G4 "Backed by science" marketing: no
- G5 Research / whitepaper pages: no
- G6 Data export: unknown — no documented CSV export
- G7 Clinical / physio endorsement: no
- **H1 History time-range default:** unknown
- **H2 History aggregation at 400 days:** unknown — Activity Log is new to the app (moved from web-only) [source: wodwell.medium.com]
- **H3 Progress metrics tier at 400 days:** unknown
- **H4 Retest list growth:** unknown; benchmark WODs are the CrossFit-standard long-user metric
- **H5 Off-day representation:** unknown
- **H6 Program-completion archive:** not applicable
- **H7 Chart densification at 400 points:** unknown
- **H8 Weekly-narrative retention:** unknown
- **H9 Data export as counterweight:** unknown
- **H10 Long-time-user identity — "power user" surface:** partial — public leaderboard rank on wodwell.com is a tenure-adjacent surface; no year-in-review documented

---

## Candidate new attributes worth adding

These patterns surfaced across the 10 apps and don't cleanly map to the existing 79 attributes:

1. **Confidence in the confirm/auto boundary.** Existing E1 forces a binary. Reality is a spectrum: Hevy's "progressive overload auto-fills next set weight" is auto-inline; Fitbod's "generates next workout" is auto-macro; Ladder/Future/Caliber have a human coach conversationally propose. Consider splitting E1 into `E1a inline auto-fill` and `E1b macro plan changes` with confirm/auto/none each.
2. **Coach identity persistence.** Only some apps (Ladder, Future, Caliber, Boostcamp) show a named coach whose face persists across sessions. This is orthogonal to G2 (credentials on marketing) — this is about session-level coach face on-screen.
3. **Widget content type.** Widgets exist on Hevy, Fitbod, Ladder, StrongLifts, but they show very different things: workouts-this-week (Fitbod, StrongLifts), macros/steps (Ladder), latest PR (Hevy shareables). Worth an attribute if widgets are important to Terav's positioning.
4. **"Previous session pre-fill" as a pattern.** Almost every strength app has this (Hevy, Boostcamp, StrongLifts, Ladder). Absence would be a red flag; presence is table stakes.
5. **Data-provenance for adaptive suggestions.** Fitbod uses recovery model; Boostcamp uses program rules; StrongLifts uses fail-streak. None of them cite the study / signal name. Terav's confirm-first citation is genuinely novel in this cohort — worth an attribute to make that visible.
6. **Onboarding-to-first-value time.** Rough time from install to first useful action (Boostcamp/Wodwell → seconds; Future → days waiting for coach match).
7. **Freemium boundary.** Where does the paywall land? Fitbod (3 workouts), Hevy (feature-gated), Boostcamp (very generous free), StrongLifts (free core + Pro). Predicts long-term user retention shape.
8. **RPE / subjective-load logging.** Boostcamp, Hevy, Caliber all support RPE. Fitbod uses difficulty-tap. This is a distinctive data-model choice that affects H3.
9. **Public shareability primitives.** Hevy has shareable cards + Year-in-Review; SugarWOD has fist bumps; Ladder has Cheers; Wodwell has public-post toggle. Different social-loop mechanics.
10. **Retest cadence expectation.** Some apps assume PRs happen naturally (log-first apps); Terav explicitly retests. Worth a matrix column: `does the app schedule retests?` (Fitbod's algo yes; Caliber's Strength Score yes; log-first no).

---

## Notes on unknowns

**Broadly unverified across the whole cohort:**
- A4 (H1 px), A5 (body px), A7 (card radius), A8 (border weight), A10 (icon px) — these require pixel-level screenshot inspection which I did not do directly for any app. Marking these as unknown throughout would be honest; I've marked them unknown where they were not verifiable.
- C11–C12 (aggregation tier + empty state) are hard to answer without direct app use.
- H7 (chart densification at 400 points) is not describable from marketing copy for any app. Hevy is the only one where any behavior is documentable (window-selectable aggregation). All others: unknown.

**Apps with weakest data:**
- **Wodwell**: sparsest public UI documentation; the mobile app is new (relaunched 2025) and reviewers haven't covered it. Most H-bucket attributes marked unknown.
- **Future**: chat-heavy design means the "progress screen" is de-emphasized in reviews; long-term data-shape unclear.
- **Ladder**: reviewers focus on coach personality and workout quality, not the progress screen.

**H-bucket confidence ranking (highest → lowest):**
1. Hevy — richest documented long-user surface (calendar zoom, monthly reports, year-in-review, streaks) — the standard the rest should be measured against.
2. TrainingPeaks — PMC provides year+ visualization by design; strongest long-user math.
3. StrongLifts — long-run chart per lift is documented, but aggregation behavior at 400d is unverified.
4. SugarWOD — benchmark PRs + fist-bump lifetime count are documented long-user surfaces.
5. Boostcamp — year-in-review confirmed; other H attributes unverified.
6. Fitbod — reviewer flagged the *absence* of a PR tab, which itself is signal about weak long-user surface.
7. Caliber — Progress section recently revamped; capabilities exist but detailed behavior undocumented.
8. Ladder — 5-year-old product, but reviewers don't cover long-term progress views.
9. Future — likely coach-only surface; no user-facing long-term aggregation documented.
10. Wodwell — Activity Log is new to the app; behavior at 400d is unknown.
