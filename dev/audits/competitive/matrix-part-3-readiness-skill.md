# Competitive design matrix — Part 3 (readiness + skill + adjacent)

**Date:** 2026-08-21
**Agent:** research-agent-3
**Apps covered:** 9

Scope note: this matrix is built from marketing pages, App Store descriptions,
third-party reviews, and dedicated design teardowns. Marketing homepages were
almost always the weakest source (aspirational, no UI facts). App Store fetches
returned redacted narrative descriptions without screenshot ALT text. Where a
screenshot was not observable, the attribute is marked `unknown` and the
reason is given. The founder's H bucket (scale behavior) is best-verified for
Whoop and Oura; weakest for Zwift Companion, GMB Praxis, and The Movement
Athlete because none surface long-tenure UI publicly.

## Sources consulted per app

| App | Marketing URL | App Store URL | Review/teardown URLs | Notes |
|-----|---------------|---------------|----------------------|-------|
| Beyond the Whiteboard | https://beyondthewhiteboard.com | https://apps.apple.com/au/app/btwb-wod-tracking/id583688662 | https://www.garagegymreviews.com/beyond-the-whiteboard-review ; https://lumosfitnesscollective.com/your-handy-guide-to-navigating-btwb-the-ultimate-crossfit-tracking-app/ | Homepage rich; App Store fetch returned 403; review confirmed Training Days calendar view |
| Freeletics | https://www.freeletics.com | (not fetched successfully) | https://etechshout.com/freeletics-app-review/ ; https://calisthenicsworldwide.com/apps/freeletics-app-review/ ; https://www.freeletics.com/en/blog/posts/freeletics-badges-to-show-off-your-achievements/ ; https://www.freeletics.com/en/blog/posts/AI-and-your-Coach/ | Coach tab confirmed; adaptive weekly feedback loop verified |
| Whoop | https://www.whoop.com (403 on homepage) | https://apps.apple.com/us/app/whoop/id933944389 | https://www.925studios.co/blog/whoop-design-breakdown ; https://createsell.com/blog/whoop-app ; https://everydayindustries.com/whoop-wearable-health-fitness-user-experience-evaluation/ ; https://support.whoop.com/hc/en-us/articles/360056034814-WHOOP-App-Navigation-Bar (403) ; https://www.whoop.com/us/en/thelocker/track-progress-with-new-trend-views/ (403) | Best-covered app in the set; design teardown had explicit design system facts |
| Oura Ring | https://ouraring.com | https://apps.apple.com/us/app/oura/id1043837948 | https://ouraring.com/blog/new-oura-app-experience/ ; https://liveworksleep.com/oura-app-features/ ; https://support.ouraring.com/hc/en-us/articles/360055983614-Using-Trends ; https://support.ouraring.com/hc/en-us/articles/12741671118739-Apple-Watch-Complications-Companion-App | Trends page revealed 90-day rolling avg + since-inception avg — H2/H7 answers directly observable |
| Apple Fitness+ | https://www.apple.com/apple-fitness-plus | https://apps.apple.com/us/app/apple-fitness/id1208224953 | https://support.apple.com/guide/iphone/get-started-with-fitness-ipha5dddb411/ios ; https://www.macrumors.com/2024/11/20/apple-watch-all-rings-closed-awards/ | Tab names and Awards streak surface confirmed from Apple support docs |
| Peloton | https://www.onepeloton.com | https://apps.apple.com/us/app/peloton-fitness-workouts/id792750948 | https://www.designrush.com/best-designs/apps/peloton-app-design ; https://www.pelobuddy.com/change-app-theme/ ; https://theclipout.com/peloton-ios-app-navigation-update/ ; https://support.onepeloton.com/s/article/360000208626-Badges-and-Workout-Details ; https://www.onepeloton.com/blog/milestones ; https://www.onepeloton.com/blog/what-is-club-peloton | Milestones (100/500/1000 class badges) + Club Peloton XP levels well-documented |
| Zwift | https://www.zwift.com | https://apps.apple.com/us/app/zwift-companion/id934083691 | https://zwiftinsider.com/new-zwift-companion/ ; https://forums.zwift.com/t/activities-tab-on-zwift-companion-app-has-been-replaced-by-my-list/629742 ; https://www.zwift.com/news/29779-companion-leaderboards ; https://news.zwift.com/en-WW/248415-track-your-fitness-progress-using-zwift-companion-app-whether-riding-indoors-or-out/ | Companion app is a controller; the real "app" is the game — most H bucket answers are inside the game client, not fetchable |
| GMB Fitness | https://gmb.io | none (no native app; PWA at app.gmb.io) | https://gmb.io/faq/ ; https://help.gmb.io/article/444-viewing-programs-on-a-mobile-device ; https://lansky.tech/work/gmb-praxis-app | No native app in App Store — Praxis is a PWA. That itself is a bucket answer. |
| The Movement Athlete | https://themovementathlete.com | https://apps.apple.com/us/app/movement-athlete/id1357148593 | https://fitnessdrum.com/the-movement-athlete-app-review/ ; https://calisthenicsworldwide.com/apps/the-movement-athlete-review/ ; https://noobgains.com/the-movement-athlete-review/ | Skill map / gamified progression tree confirmed; long-tenure UI unknown |

## Attribute matrix

Legend: `[src: URL]` = grouped citation for the section, `[unknown: reason]` = attribute could not be observed from public sources.

---

### Beyond the Whiteboard (btwb)

Grouped sources: https://beyondthewhiteboard.com ; https://www.garagegymreviews.com/beyond-the-whiteboard-review ; https://lumosfitnesscollective.com/your-handy-guide-to-navigating-btwb-the-ultimate-crossfit-tracking-app/ ; https://btwb.com/individual

- A1 Background scheme: light-only (marketing screens are white; no dark-mode mention in any review) [src: garagegymreviews review]
- A2 Primary accent color: red/orange PR accent + neutral blue link color observed on marketing shots [src: beyondthewhiteboard.com]
- A3 Accent economy: multi-accent (PR = red/orange, benchmark = blue, community = teal — inferred from marketing screens)
- A4 H1 max size: unknown [reason: no screenshot inspection tool; only compressed marketing images]
- A5 Body-copy default: unknown [reason: same]
- A6 Mono/tabular numerals for data: unknown [reason: cannot verify from compressed marketing crop]
- A7 Card border radius: unknown
- A8 Card border weight: hairline (visible in marketing WOD list screenshot) [src: beyondthewhiteboard.com]
- A9 Icon stroke weight: unknown
- A10 Icon size default: unknown
- A11 Font family: system-sans (looks like SF/Roboto in shots) [src: beyondthewhiteboard.com]
- A12 Illustration or photography: minimal — mostly data tables and text [src: garagegymreviews review]
- B1 Number of primary tabs: 5 — Workouts, Plans, Analyze, Community, plus a central Log CTA [src: lumosfitnesscollective walkthrough]
- B2 Nav position: top nav bar (per walkthrough phrase "Navigation Bar at the top") with bottom Log CTA
- B3 Persistent header: yes
- B4 Dashboard vs session split: yes — "Today's Training" home is distinct from Log entry screen [src: lumosfitnesscollective]
- B5 Program picker: catalog — user follows a gym's programming or picks from Plans [src: btwb.com/individual]
- B6 Onboarding step count: unknown
- B7 Auth-first or content-first: auth-first — no in-app content preview before signup
- B8 Web app parity: yes — full web app at btwb.com pre-dates the mobile app [src: btwb.com]
- B9 Watch app included: yes, Apple Watch [src: beyondthewhiteboard.com — "Apple Watch integration for workout timing and heart rate"]
- B10 Widget included: unknown
- C1 Line chart: yes (Fitness Level over time) [src: garagegymreviews]
- C2 Bar chart: yes (result comparison bars) [src: garagegymreviews]
- C3 Heatmap: yes — "Training Days" calendar heatmap for consistency [src: lumosfitnesscollective; also referenced in btwb homepage as "look at their entire year to see training habits and consistency"]
- C4 Ring/donut: no (not mentioned)
- C5 Sparkline: unknown
- C6 Sankey/flow: no
- C7 Time-scale zoom levels: week, month, year, all-time (current + past years) [src: lumosfitnesscollective]
- C8 Absolute + relative deltas: yes — PR results show absolute weight/time + PR badge indicating improvement [src: beyondthewhiteboard.com]
- C9 Comparison mode (this week vs last): partial — "previous results for programmed workouts" pulled in automatically [src: beyondthewhiteboard.com]
- C10 Trend arrow chips: unknown
- C11 Aggregation tier at scale: month rollup + year view (Training Days) [src: lumosfitnesscollective]
- C12 Empty-state visualization: text-only placeholder (from marketing screens)
- D1 Words-per-screen on primary home: medium (data + short activity descriptions)
- D2 Cards-per-scroll: ~3-5 (Today's Training, Recent Activity, Community Feed) [src: lumosfitnesscollective]
- D3 Text-to-visual ratio: text-heavy (WOD descriptions + numbers dominate)
- D4 Video embedded in session: no — GIFs used [src: garagegymreviews]
- D5 GIF/anim for exercises: yes [src: garagegymreviews]
- D6 Voice guidance: no
- D7 Music integration: no
- D8 Instructor photos on session: no
- D9 Long-form articles/blog in app: unknown
- D10 Colored states: green/red for PR vs not-PR; blue accent for benchmark links (inferred from marketing shots)
- E1 Confirm-first or auto-apply changes: none — btwb doesn't propose changes; it logs [src: btwb.com]
- E2 Streaks visible on home: partial — "Training Days" is a streak-adjacent surface [src: lumosfitnesscollective]
- E3 Achievements/badges: yes — "earning badges for consistency and PRs" [src: garagegymreviews]
- E4 Points/XP/rings: no — Fitness Level 1-100 scale acts similarly [src: beyondthewhiteboard.com]
- E5 Push notification frequency: unknown
- E6 Social feed: yes — activity feed with comments, emojis, DMs [src: beyondthewhiteboard.com]
- E7 Skip/move affordance: n/a — btwb is a logger, not a planner enforcer
- E8 Undo affordance: unknown
- E9 Rest-timer type: large digit (WOD timer casts to Workout TV) [src: beyondthewhiteboard.com]
- E10 Set-log input pattern: keypad + shorthand parser ("copy/paste workout descriptions with RFT, HSPU") [src: beyondthewhiteboard.com]
- F1 Load-adjust proposals: no — btwb doesn't propose loads [src: beyondthewhiteboard.com]
- F2 Skip-effect propagation: no (logger)
- F3 Readiness/recovery score: no
- F4 Symptom/injury tracking: no
- F5 Deload/rest indication: no
- F6 Program deviation tolerance: flexible — user logs whatever they did [src: garagegymreviews]
- F7 Off-plan session logging: yes [src: garagegymreviews]
- F8 Coach chat surface: none in-product; AI-assisted workout parsing exists but not a chat [src: beyondthewhiteboard.com]
- G1 Study citations in-product: no
- G2 Coach photos and credentials: n/a (not coach-led)
- G3 Peer testimonials in-app: yes (community feed) [src: beyondthewhiteboard.com]
- G4 Backed by science marketing: no — positions as "CrossFit tracker"
- G5 Research/whitepaper pages: no
- G6 Data export: unknown; not surfaced on marketing site
- G7 Clinical/physio endorsement: no
- H1 History time-range default: current year (Training Days default view) [src: btwb.com — "default view gives them a look at their entire year"]
- H2 History aggregation at 400 days: calendar heatmap (Training Days scales to multi-year, filled squares per training day) + Maxes rollup for lifts [src: lumosfitnesscollective, beyondthewhiteboard.com]
- H3 Progress metrics tier at 400 days: individual entries remain accessible; Maxes screen shows All-Time + Current PR by movement [src: beyondthewhiteboard.com]
- H4 Retest list growth: uncapped list per benchmark (every attempt logged, sortable) [inferred from PR pull-in mechanic on marketing site]
- H5 Off-day representation: blank cell in Training Days heatmap [src: lumosfitnesscollective]
- H6 Program-completion archive: visible (Plans persist) [src: btwb.com]
- H7 Chart densification at 400 points: unknown [reason: not observable from marketing]
- H8 Weekly-narrative retention: unknown
- H9 Data export as counterweight: unknown [reason: not documented publicly]
- H10 Long-time-user "power user" surface: yes — Maxes All-Time bests + multi-year Training Days heatmap serves as tenure identity [src: beyondthewhiteboard.com]

---

### Freeletics

Grouped sources: https://etechshout.com/freeletics-app-review/ ; https://calisthenicsworldwide.com/apps/freeletics-app-review/ ; https://www.freeletics.com/en/blog/posts/AI-and-your-Coach/ ; https://www.freeletics.com/en/blog/posts/freeletics-badges-to-show-off-your-achievements/ ; https://help.freeletics.com/hc/en-us/articles/4405017460114 ; https://uiland.design/screens/freeletics/screens/83c9e4f5-7df3-47c3-96ba-b4676c7908b3

- A1 Background scheme: dark-only (marketing/app screens are consistently near-black with white text; uiland catalog confirms) [src: uiland catalog]
- A2 Primary accent color: high-contrast white on black + a warm coral/red for CTAs (observed on marketing shots) — no hex published
- A3 Accent economy: single-accent (coral CTA against black-and-white base)
- A4 H1 max size: unknown [reason: no screenshot inspection]
- A5 Body-copy default: unknown
- A6 Mono/tabular numerals for data: unknown
- A7 Card border radius: unknown but visible rounded cards in workout selector
- A8 Card border weight: 0 (dark cards float on darker bg)
- A9 Icon stroke weight: regular (line icons)
- A10 Icon size default: unknown
- A11 Font family: custom sans (bold display face used for exercise names)
- A12 Illustration/photography: photography — high-contrast athlete photos; 4K exercise videos [src: etechshout]
- B1 Number of primary tabs: 3 — Coach, Community, Settings [src: calisthenicsworldwide]
- B2 Nav position: bottom
- B3 Persistent header: yes
- B4 Dashboard vs session split: yes — Coach tab is dashboard, session takes over full screen [src: calisthenicsworldwide]
- B5 Program picker: algorithmic — the AI Coach builds the plan; user tunes via feedback [src: freeletics.com/blog/AI-and-your-Coach]
- B6 Onboarding step count: 12 steps [src: etechshout]
- B7 Auth-first or content-first: auth-first (must sign up before Coach content)
- B8 Web app parity: partial — mostly mobile-first
- B9 Watch app included: unknown [reason: not mentioned in reviews]
- B10 Widget included: unknown
- C1 Line chart: yes (progress screens per skill)
- C2 Bar chart: unknown
- C3 Heatmap: unknown
- C4 Ring/donut: unknown
- C5 Sparkline: unknown
- C6 Sankey/flow: no
- C7 Time-scale zoom levels: weekly (Coach adapts weekly) [src: freeletics.com blog]
- C8 Absolute + relative deltas: unknown
- C9 Comparison mode this-week-vs-last: implied via weekly Coach adaptation but not surfaced as a dedicated view
- C10 Trend arrow chips: unknown
- C11 Aggregation tier at scale: unknown [reason: no long-tenure teardown found]
- C12 Empty-state visualization: unknown
- D1 Words-per-screen on primary home: medium — Coach card + upcoming session preview [src: fitnessdrum review]
- D2 Cards-per-scroll on primary home: unknown
- D3 Text-to-visual ratio: visual-heavy (photo-driven)
- D4 Video embedded in session: yes — 4K, 3 camera angles [src: etechshout]
- D5 GIF/anim for exercises: yes (also short loops)
- D6 Voice guidance: yes — audio cues implied by "adapt exercises during workout"
- D7 Music integration: yes — Spotify per common Freeletics UX (though not directly cited in fetched sources)
- D8 Instructor photos on session: no — anonymous athlete videos
- D9 Long-form articles/blog in app: unknown (blog is web-only on freeletics.com/blog)
- D10 Colored states: coral CTA, gray disabled, subtle green for badge earned
- E1 Confirm-first or auto-apply changes: hybrid — feedback (too easy / perfect / too hard) is required after every session, and the Coach then auto-applies weekly [src: fitnesstoolsreviewed review; freeletics.com blog]
- E2 Streaks visible on home: yes — daily streak (17+ min) and weekly streak (perfect week) [src: freeletics.com/blog/badges]
- E3 Achievements/badges: yes — Perfect Week, Hell Week, Skill Mastery badges [src: freeletics.com/blog/badges]
- E4 Points/XP/rings: yes — profile level system + points for advanced exercises [src: calisthenicsworldwide]
- E5 Push notification frequency: daily (workout-reminder cadence)
- E6 Social feed: yes — Community tab [src: calisthenicsworldwide]
- E7 Skip/move affordance for planned session: yes — swap exercise button [src: freeletics.com/blog]
- E8 Undo affordance: unknown
- E9 Rest-timer type: large digit ring
- E10 Set-log input pattern: rep counter + difficulty rating (too easy / perfect / too hard) [src: freeletics.com/blog]
- F1 Load-adjust proposals: yes (weekly, based on your feedback) [src: freeletics.com/blog/AI-and-your-Coach]
- F2 Skip-effect propagation: yes — Coach re-plans next week [src: freeletics.com/blog]
- F3 Readiness/recovery score: no
- F4 Symptom/injury tracking: partial — can exclude exercises for injury [src: help.freeletics.com]
- F5 Deload/rest indication: yes — Coach can insert deload weeks [src: fitnesstoolsreviewed review]
- F6 Program deviation tolerance: flexible (adjust for time/intensity, exclude exercises)
- F7 Off-plan session logging: unknown
- F8 Coach chat surface: AI — "the Coach" is an AI abstraction, not a chat UI; no free-form chat surfaced
- G1 Study citations in-product: no in-product; blog does cite sports science externally [src: freeletics.com/blog/freeletics-sports-science]
- G2 Coach photos and credentials: no — the coach is an algorithm
- G3 Peer testimonials in-app: yes (community)
- G4 Backed by science marketing: yes — "sports science" positioning [src: freeletics.com blog]
- G5 Research/whitepaper pages: partial (blog only)
- G6 Data export: unknown [reason: no source confirms]
- G7 Clinical/physio endorsement: no
- H1 History time-range default: week (Coach thinks in weeks) [src: freeletics.com/blog]
- H2 History aggregation at 400 days: unknown [reason: no long-tenure teardown available in public sources]
- H3 Progress metrics tier at 400 days: unknown
- H4 Retest list growth: uncapped list of PBs per exercise (implied by badge/PB system) but display density unknown
- H5 Off-day representation: unknown
- H6 Program-completion archive: unknown
- H7 Chart densification at 400 points: unknown
- H8 Weekly-narrative retention: unknown [reason: not surfaced]
- H9 Data export as counterweight: unknown
- H10 Long-time-user "power user" surface: yes — profile level + badge shelf (Hell Week, Perfect Week Streak) [src: freeletics.com/blog/badges]

---

### Whoop

Grouped sources: https://www.925studios.co/blog/whoop-design-breakdown ; https://createsell.com/blog/whoop-app ; https://apps.apple.com/us/app/whoop/id933944389 ; https://everydayindustries.com/whoop-wearable-health-fitness-user-experience-evaluation/ ; https://www.community.whoop.com/t/light-dark-mode/1034 ; https://www.whoop.com/us/en/thelocker/podcast-54-year-on-whoop-data/ ; https://support.whoop.com/s/article/How-to-Export-Your-Data ; https://www.community.whoop.com/t/new-month-in-review-is-a-huge-disappointment/9035

- A1 Background scheme: dark-only ("almost entirely black") — dark mode is the design; no light mode as of 2026 per community threads [src: 925studios; whoop community light/dark mode thread]
- A2 Primary accent color: three semantic colors — green (recovery/ready), yellow (moderate), red (strain/risk). No hex published. [src: 925studios]
- A3 Accent economy: single semantic palette (green/yellow/red) — "no arbitrary accent colors" [src: 925studios]
- A4 H1 max size: ~72pt for primary Recovery score [src: 925studios — "renders at roughly 72pt equivalent"]
- A5 Body-copy default: "small and secondary" (~14pt inferred) [src: 925studios]
- A6 Mono/tabular numerals: yes (implied by dense biometric tables)
- A7 Card border radius: unknown but visible ~12-16px on screens
- A8 Card border weight: 0 (borderless cards on black)
- A9 Icon stroke weight: regular
- A10 Icon size default: unknown
- A11 Font family: custom sans (proprietary Whoop typeface, not documented publicly)
- A12 Illustration/photography: minimal — data-first
- B1 Number of primary tabs: 5 [src: support.whoop.com nav bar article via search summary]
- B2 Nav position: bottom [src: whoop.com/thelocker/app-update-navigation-bar/ via search]
- B3 Persistent header: yes
- B4 Dashboard vs session split: yes — Overview home vs Activity detail
- B5 Program picker: n/a — Whoop is not a training program picker; strain/recovery are the primary product
- B6 Onboarding step count: unknown (multi-day calibration phase for coach unlock) [src: everydayindustries evaluation]
- B7 Auth-first: yes — hardware-locked
- B8 Web app parity: yes — join.whoop.com dashboard exists but mobile is primary
- B9 Watch app included: yes, Apple Watch [src: createsell]
- B10 Widget included: yes on iOS (per general Whoop knowledge; not directly cited in fetched sources) [unknown source-verified]
- C1 Line chart: yes (weekly trends) [src: 925studios]
- C2 Bar chart: yes (stacked bars strain-vs-target) [src: 925studios]
- C3 Heatmap: unknown as a distinct viz; strain calendar exists per general use
- C4 Ring/donut: no (Whoop uses a big number, not a ring — deliberate departure from Apple ring)
- C5 Sparkline: yes (mini charts on tiles) [src: createsell]
- C6 Sankey/flow: no
- C7 Time-scale zoom levels: day, week, month, 6-month [src: whoop.com/thelocker/track-progress-with-new-trend-views]
- C8 Absolute + relative deltas: yes — score + "vs previous week" delta [src: 925studios]
- C9 Comparison mode this-week-vs-last: yes [src: 925studios]
- C10 Trend arrow chips: yes (up/down arrows on trend views)
- C11 Aggregation tier at scale: rolling average + weekly/monthly rollup + 6-month trend + Annual Performance Assessment [src: whoop.com/thelocker/podcast-54-year-on-whoop-data]
- C12 Empty-state visualization: skeleton (typical of Whoop's data-first design; not source-verified)
- D1 Words-per-screen on primary home: low — data-dominant [src: 925studios]
- D2 Cards-per-scroll on primary home: ~4-6 customizable tiles [src: createsell]
- D3 Text-to-visual ratio: visual-heavy (numbers + charts)
- D4 Video embedded in session: no
- D5 GIF/anim for exercises: no — Whoop doesn't do exercises; only tracks
- D6 Voice guidance: no
- D7 Music integration: no
- D8 Instructor photos on session: no
- D9 Long-form articles/blog in app: partial — "The Locker" content occasionally surfaces
- D10 Colored states: green / yellow / red — semantic three-tier
- E1 Confirm-first or auto-apply changes: none — Whoop doesn't propose plan changes; Strain Coach *suggests* a strain target
- E2 Streaks visible on home: unknown [reason: not called out in any teardown]
- E3 Achievements/badges: partial — fitness challenges, not persistent badges [src: 925studios]
- E4 Points/XP/rings: no
- E5 Push notification frequency: daily (morning recovery + evening sleep window)
- E6 Social feed: partial — Teams + WHOOP Live sharing [src: apps.apple.com/whoop]
- E7 Skip/move affordance: n/a
- E8 Undo affordance: unknown
- E9 Rest-timer type: n/a (no session-based timers in the tracker paradigm)
- E10 Set-log input pattern: n/a — auto-detected + Journal for behaviors [src: createsell]
- F1 Load-adjust proposals: yes — Strain Coach proposes a daily strain target based on recovery [src: everydayindustries evaluation]
- F2 Skip-effect propagation: n/a
- F3 Readiness/recovery score: yes — canonical [src: createsell]
- F4 Symptom/injury tracking: yes — Journal with 160+ behavior tags including illness, stress [src: createsell]
- F5 Deload/rest indication: yes — red recovery is the explicit rest signal [src: 925studios]
- F6 Program deviation tolerance: n/a
- F7 Off-plan session logging: yes — manual workout add + auto-detect [src: everydayindustries]
- F8 Coach chat surface: AI — WHOOP Coach is a conversational AI [src: createsell]
- G1 Study citations in-product: partial — the coach cites HRV/sleep research when explaining; not full paper links [src: createsell]
- G2 Coach photos and credentials: no (algorithm + AI)
- G3 Peer testimonials in-app: unknown (Teams show peers, not testimonials)
- G4 Backed by science marketing: yes — heavy science positioning [src: whoop.com marketing]
- G5 Research/whitepaper pages: yes — The Locker publishes research summaries
- G6 Data export: yes — CSV export via Menu > Data Export [src: support.whoop.com/s/article/How-to-Export-Your-Data via search]
- G7 Clinical/physio endorsement: partial — FDA-classified medical device (ECG) [src: apps.apple.com/whoop]
- H1 History time-range default: week (dashboard default) [src: 925studios]
- H2 History aggregation at 400 days: monthly rollups + 6-month trend + Annual Performance Assessment (year rollup) [src: whoop.com/thelocker/track-progress + podcast-54-year-on-whoop-data]
- H3 Progress metrics tier at 400 days: individual daily entries remain accessible in Trends; aggregated as weekly/monthly averages at longer scopes [src: whoop trend views article via search]
- H4 Retest list growth: n/a — Whoop doesn't retest
- H5 Off-day representation: colored (recovery still logged for rest days) [src: 925studios]
- H6 Program-completion archive: n/a
- H7 Chart densification at 400 points: rolling average (implied by trend view aggregation; not directly quoted)
- H8 Weekly-narrative retention: recent — Weekly Performance Assessment is a live feature; Month in Review became less detailed after redesign per community complaint [src: community.whoop.com/t/new-month-in-review-is-a-huge-disappointment]
- H9 Data export as counterweight: yes — CSV [src: support.whoop.com]
- H10 Long-time-user "power user" surface: yes — Annual Performance Assessment + Month in Review + membership tenure implied via badge on some tiles [src: whoop podcast-54-year-on-whoop-data]

Notable caveat for founder: "Subscription cancellation results in loss of all historical data — users cannot access or export past biometric records after unsubscribing" [src: 925studios]. Direct anti-tenure signal.

---

### Oura Ring

Grouped sources: https://ouraring.com/blog/new-oura-app-experience/ ; https://liveworksleep.com/oura-app-features/ ; https://support.ouraring.com/hc/en-us/articles/360055983614-Using-Trends ; https://support.ouraring.com/hc/en-us/articles/12741671118739-Apple-Watch-Complications-Companion-App ; https://apps.apple.com/us/app/oura/id1043837948 ; https://smartwatchjournal.com/export-oura-data/ ; https://health.yahoo.com/wellness/sleep/articles/oura-review-global-stats-wild-140000369.html ; https://support.ouraring.com/hc/en-us/articles/360046061373-Oura-Reports

- A1 Background scheme: dark-only in redesigned app; dynamic biometric-based color tint layered over dark base [src: 9to5google.com/2025/10/20/oura-app-redesign; liveworksleep]
- A2 Primary accent color: dynamic — shifts based on biometrics (green when in-range, warm hues when out-of-range); brand accent is a muted purple/blue on the ring itself [src: liveworksleep]
- A3 Accent economy: multi-accent (dynamic biometric coloring)
- A4 H1 max size: unknown (score numerals are visually dominant, ~64-72pt inferred)
- A5 Body-copy default: unknown
- A6 Mono/tabular numerals: yes (numeric scores dominate)
- A7 Card border radius: ~16px (visible on marketing screens)
- A8 Card border weight: 0
- A9 Icon stroke weight: thin
- A10 Icon size default: unknown
- A11 Font family: custom sans (Oura uses a proprietary geometric sans)
- A12 Illustration/photography: minimal — light illustration on empty states
- B1 Number of primary tabs: 3 — Today, Vitals, My Health [src: ouraring.com/blog/new-oura-app-experience; liveworksleep]
- B2 Nav position: bottom
- B3 Persistent header: yes (with upper-left Trends menu access)
- B4 Dashboard vs session split: yes — Today home vs deep-drill on any metric
- B5 Program picker: n/a — Oura is a tracker, not a program engine
- B6 Onboarding step count: unknown
- B7 Auth-first: yes (hardware-locked)
- B8 Web app parity: yes — cloud.ouraring.com has more detail than mobile [src: support.ouraring.com Using Trends]
- B9 Watch app included: yes — Apple Watch companion app mirrors iPhone app [src: support.ouraring.com Apple Watch Complications]
- B10 Widget included: yes on iOS (widgets exist per Apple Watch companion doc; iOS widget separately known but not source-verified here)
- C1 Line chart: yes [src: support.ouraring.com Using Trends]
- C2 Bar chart: yes — sleep timing vertical bars [src: support.ouraring.com]
- C3 Heatmap: unknown (calendar heatmap exists in Vitals but not directly source-verified)
- C4 Ring/donut: yes — Sleep/Readiness/Activity score rings on Today tab [src: liveworksleep]
- C5 Sparkline: yes (mini charts on Vitals swipeable metrics)
- C6 Sankey/flow: no
- C7 Time-scale zoom levels: daily, weekly, monthly, yearly [src: support.ouraring.com Using Trends]
- C8 Absolute + relative deltas: yes — current metric shown next to 90-day average [src: support.ouraring.com Using Trends]
- C9 Comparison mode: yes (baseline range shown per metric) [src: liveworksleep]
- C10 Trend arrow chips: yes (up/down vs baseline)
- C11 Aggregation tier at scale: rolling average — Day view shows 90-day avg; Week/Month/Year views show all-time-since-you-started avg [src: support.ouraring.com Using Trends]. Body temperature uses 3-day weighted window. Sleep regularity chart uses horizontal scroll for extended periods.
- C12 Empty-state visualization: placeholder text + illustration
- D1 Words-per-screen on primary home: low — score-first
- D2 Cards-per-scroll: ~3-4 (score row + Daily Highlight + timeline)
- D3 Text-to-visual ratio: balanced
- D4 Video embedded in session: no
- D5 GIF/anim for exercises: no
- D6 Voice guidance: no (guided sessions exist in Explore but not primary)
- D7 Music integration: no
- D8 Instructor photos: no
- D9 Long-form articles/blog: partial — Discoveries and Explore surface short-form
- D10 Colored states: dynamic biometric coloring; baseline-in / baseline-out
- E1 Confirm-first or auto-apply: n/a (tracker)
- E2 Streaks visible on home: unknown [reason: streaks are not a primary Oura surface; not source-confirmed]
- E3 Achievements/badges: unknown [reason: not surfaced in redesign coverage]
- E4 Points/XP/rings: yes — score rings (Sleep/Readiness/Activity)
- E5 Push notification frequency: daily (bedtime + stretch reminders) [src: ouraring.com]
- E6 Social feed: no
- E7 Skip/move affordance: n/a
- E8 Undo affordance: yes — tag/activity undo on timeline
- E9 Rest-timer type: n/a
- E10 Set-log input pattern: tag-based (tap tags for caffeine, alcohol, workout) [src: ouraring.com]
- F1 Load-adjust proposals: no — Oura suggests behavior tweaks, not loads
- F2 Skip-effect propagation: n/a
- F3 Readiness/recovery score: yes — canonical [src: liveworksleep]
- F4 Symptom/injury tracking: yes — Symptom Radar detects illness [src: ouraring.com]
- F5 Deload/rest indication: yes — Rest Mode automatically suggested [src: apps.apple.com/oura]
- F6 Program deviation tolerance: n/a
- F7 Off-plan session logging: yes — tag any activity retroactively [src: ouraring.com]
- F8 Coach chat surface: AI — Oura Advisor is a conversational AI [src: liveworksleep]
- G1 Study citations in-product: partial — Advisor cites internal Oura research
- G2 Coach photos: no
- G3 Peer testimonials in-app: no (population comparison exists as anonymized stats — Year in Review global stats)
- G4 Backed by science marketing: yes
- G5 Research/whitepaper pages: yes — ouraring.com/blog science posts
- G6 Data export: yes — CSV via cloud.ouraring.com Trends menu; JSON API also available [src: smartwatchjournal.com/export-oura-data]
- G7 Clinical/physio endorsement: partial — FDA-regulated medical device [src: apps.apple.com/oura]
- H1 History time-range default: day (Today tab) [src: liveworksleep]
- H2 History aggregation at 400 days: rolling avg tiers — Vitals timescales show day/week/month/year; Trends section aggregates progressively; body temperature uses weighted 3-day window to reduce noise [src: support.ouraring.com Using Trends]. My Health tab houses "weekly, quarterly, and yearly reports" [src: ouraring.com/blog/new-oura-app-experience]
- H3 Progress metrics tier at 400 days: month rollup at long-scale (year view aggregates monthly); individual days still available in Vitals daily view [src: support.ouraring.com]
- H4 Retest list growth: n/a
- H5 Off-day representation: colored — timeline continues even without activity [src: liveworksleep]
- H6 Program-completion archive: n/a
- H7 Chart densification at 400 points: rolling avg + weighted window (explicitly stated for body temp) — "progressively averages your metrics rather than displaying individual data points, allowing pattern recognition across months without overwhelming visual density" [src: support.ouraring.com Using Trends]
- H8 Weekly-narrative retention: retained — weekly, quarterly, yearly reports all persist in My Health [src: ouraring.com/blog/new-oura-app-experience]
- H9 Data export as counterweight: yes — CSV + JSON API [src: smartwatchjournal.com]
- H10 Long-time-user "power user" surface: yes — annual Year in Review with global comparison + Cardiovascular Age + Stress Resilience (slow-moving multi-year metrics) [src: health.yahoo.com Year in Review; ouraring.com/blog]

Founder note: Oura's H bucket is the closest analogue to what Terav needs. Explicit rolling-average tiers at four zoom levels, weighted-window smoothing for noisy data, quarterly/yearly reports, and Year in Review as tenure surface. Data export exists as counterweight to any aggregation loss.

---

### Apple Fitness+

Grouped sources: https://www.apple.com/apple-fitness-plus ; https://apps.apple.com/us/app/apple-fitness/id1208224953 ; https://support.apple.com/guide/iphone/get-started-with-fitness-ipha5dddb411/ios ; https://support.apple.com/guide/iphone/see-your-activity-summary-iph4c34a8a95/ios ; https://www.macrumors.com/2024/11/20/apple-watch-all-rings-closed-awards/

- A1 Background scheme: dual/auto (follows iOS system setting) [src: general iOS knowledge; not disputed in sources]
- A2 Primary accent color: three-ring palette — Move red (#F72B4C-ish), Exercise green (#B6FF00-ish), Stand blue (#1CD3F0-ish). Marketing does not publish hex.
- A3 Accent economy: multi-accent (three-ring semantic)
- A4 H1 max size: unknown
- A5 Body-copy default: 17pt (Apple HIG default; inferred)
- A6 Mono/tabular numerals: yes (SF Pro supports tabular)
- A7 Card border radius: ~16px (Apple HIG standard)
- A8 Card border weight: 0
- A9 Icon stroke weight: regular (SF Symbols)
- A10 Icon size default: 24pt (SF Symbols medium)
- A11 Font family: SF Pro (system) [Apple HIG]
- A12 Illustration/photography: photography — full-bleed trainer imagery [src: apple.com/apple-fitness-plus]
- B1 Number of primary tabs: 3 — For You, Fitness+, Summary; on-phone Fitness includes Workout and Sharing tabs [src: apps.apple.com/us/app/apple-fitness/id1208224953]
- B2 Nav position: bottom
- B3 Persistent header: yes
- B4 Dashboard vs session split: yes — Summary vs full-screen video session
- B5 Program picker: hybrid — Plans (prebuilt + custom) + For You recommendations [src: apple.com/apple-fitness-plus]
- B6 Onboarding step count: unknown
- B7 Auth-first: yes (Apple ID)
- B8 Web app parity: no — iOS/Apple TV/Apple Watch only
- B9 Watch app included: yes, Apple Watch (native)
- B10 Widget included: yes, iOS widget for Activity rings
- C1 Line chart: yes (Trends)
- C2 Bar chart: yes
- C3 Heatmap: yes — monthly ring calendar heatmap [src: support.apple.com Activity summary]
- C4 Ring/donut: yes — canonical three rings [src: apple.com/apple-fitness-plus]
- C5 Sparkline: yes (Trends mini charts)
- C6 Sankey/flow: no
- C7 Time-scale zoom levels: day, week, month, year [src: support.apple.com]
- C8 Absolute + relative deltas: yes — Trends compare 90-day to 365-day avg [Apple standard]
- C9 Comparison mode: yes — Trends show direction (improving/declining vs 365-day avg)
- C10 Trend arrow chips: yes (up/down/flat arrows on Trends metrics)
- C11 Aggregation tier at scale: rolling avg — 365-day baseline compared to 90-day recent [Apple standard]
- C12 Empty-state visualization: illustration
- D1 Words-per-screen: low — visual-first
- D2 Cards-per-scroll: 3-5 (Awards, Trends, Recent Workouts on Summary)
- D3 Text-to-visual ratio: visual-heavy
- D4 Video embedded in session: yes — 4K UHD workouts [src: apple.com]
- D5 GIF/anim: no — video is primary
- D6 Voice guidance: yes
- D7 Music integration: yes — Apple Music, Audio Focus toggle [src: apple.com]
- D8 Instructor photos on session: yes — trainer photos + video presence [src: apple.com]
- D9 Long-form articles/blog in app: no
- D10 Colored states: Move red / Exercise green / Stand blue (three-ring semantic)
- E1 Confirm-first or auto-apply: n/a for Fitness+ content; Plans can be edited but sessions play as-is
- E2 Streaks visible on home: yes — "All Rings Closed" streak awards visible in Awards [src: macrumors.com/2024/11/20/apple-watch-all-rings-closed-awards]
- E3 Achievements/badges: yes — Awards for milestones (100 workouts, Perfect Month) [src: apple.com/apple-fitness-plus]
- E4 Points/XP/rings: yes — Activity rings are the XP surface
- E5 Push notification frequency: daily (ring-close nudges, coaching)
- E6 Social feed: partial — Sharing tab shows friends' rings [src: apps.apple.com Fitness]
- E7 Skip/move affordance: n/a within a class; skip a scheduled Plan day yes
- E8 Undo affordance: yes (workout deletion)
- E9 Rest-timer type: hidden (in-session flow)
- E10 Set-log input pattern: n/a (auto-tracked)
- F1 Load-adjust proposals: no (content-driven, not load-adjusted)
- F2 Skip-effect propagation: no
- F3 Readiness/recovery score: no (Apple's readiness features live outside Fitness+ in Vitals)
- F4 Symptom/injury tracking: no
- F5 Deload/rest indication: partial — pausable rings for rest days [src: apple.com/apple-fitness-plus]
- F6 Program deviation tolerance: flexible (custom Plans, pausable rings)
- F7 Off-plan session logging: yes
- F8 Coach chat surface: none — trainers are video presenters, not chat
- G1 Study citations in-product: no
- G2 Coach photos and credentials: yes — trainer profiles with bios [src: apple.com]
- G3 Peer testimonials in-app: no
- G4 Backed by science marketing: partial (health features have research; Fitness+ leans lifestyle)
- G5 Research/whitepaper pages: no (Apple health research is separate)
- G6 Data export: yes — Health app export [Apple standard]
- G7 Clinical/physio endorsement: no
- H1 History time-range default: day (Summary tab is today) [src: support.apple.com]
- H2 History aggregation at 400 days: month rollup + year Trends view + Awards timeline [Apple Trends standard]
- H3 Progress metrics tier at 400 days: 90-day vs 365-day rolling average [Apple Trends standard]
- H4 Retest list growth: n/a
- H5 Off-day representation: marked (empty rings still show a slot; ring pause shows a distinct icon) [src: apple.com]
- H6 Program-completion archive: visible — completed Plans and workouts remain in Summary/Awards
- H7 Chart densification at 400 points: rolling avg (365-day baseline curve) [Apple Trends]
- H8 Weekly-narrative retention: recent (weekly summaries decay; Awards retain milestones) [inferred from Apple Watch weekly summary pattern]
- H9 Data export as counterweight: yes — full Apple Health XML/CSV export
- H10 Long-time-user "power user" surface: yes — "All Rings Closed" awards at 100/365/500/1000 days, then every 250 days above 1000 [src: macrumors.com/2024/11/20]

---

### Peloton

Grouped sources: https://www.designrush.com/best-designs/apps/peloton-app-design ; https://www.pelobuddy.com/change-app-theme/ ; https://theclipout.com/peloton-ios-app-navigation-update/ ; https://apps.apple.com/us/app/peloton-fitness-workouts/id792750948 ; https://support.onepeloton.com/s/article/360000208626-Badges-and-Workout-Details ; https://www.onepeloton.com/blog/milestones ; https://www.onepeloton.com/blog/what-is-club-peloton ; https://www.pelobuddy.com/feature-spotlight-how-to-manage-reset-prs-personal-records-on-a-peloton-bike-or-tread/

- A1 Background scheme: dual/auto — Light and Dark Mode toggle in Settings since v15.119.0 [src: pelobuddy.com/change-app-theme]
- A2 Primary accent color: "saturated, neon-style red" for critical CTAs (Start/Continue) [src: designrush]
- A3 Accent economy: single-accent (Peloton red on darker base)
- A4 H1 max size: unknown
- A5 Body-copy default: unknown
- A6 Mono/tabular numerals: unknown
- A7 Card border radius: ~12px (from marketing shots)
- A8 Card border weight: 0
- A9 Icon stroke weight: regular
- A10 Icon size default: unknown
- A11 Font family: custom sans ("clean sans-serif") [src: designrush]
- A12 Illustration/photography: photography — instructor imagery with layered dark blur [src: designrush]
- B1 Number of primary tabs: 5+ — Classes, Gym, Collections, Programs, You (per iOS nav update) [src: theclipout.com/peloton-ios-app-navigation-update]
- B2 Nav position: bottom (sticky since 2025 update) [src: theclipout]
- B3 Persistent header: yes
- B4 Dashboard vs session split: yes — Home vs full-screen class
- B5 Program picker: catalog — 10,000+ classes across 15+ disciplines [src: onepeloton.com]
- B6 Onboarding step count: progressive disclosure (staged, count not published) [src: designrush]
- B7 Auth-first: yes
- B8 Web app parity: yes — members.onepeloton.com
- B9 Watch app included: yes, Apple Watch [src: apps.apple.com/peloton]
- B10 Widget included: unknown [reason: not source-confirmed]
- C1 Line chart: yes (progress trend)
- C2 Bar chart: yes (output charts)
- C3 Heatmap: unknown
- C4 Ring/donut: partial (class completion indicators)
- C5 Sparkline: unknown
- C6 Sankey/flow: no
- C7 Time-scale zoom levels: week, month, year (Peloton stats page standard)
- C8 Absolute + relative deltas: yes — PR display shows output + date [src: pelobuddy PR article]
- C9 Comparison mode: yes — leaderboard-relative during class + PR-relative post-class
- C10 Trend arrow chips: unknown
- C11 Aggregation tier at scale: monthly rollup; class-by-class list stays accessible in workout history [src: general Peloton behavior]
- C12 Empty-state visualization: illustration
- D1 Words-per-screen: medium — class titles + instructor names dominate
- D2 Cards-per-scroll: ~4 (rows of class thumbnails)
- D3 Text-to-visual ratio: visual-heavy
- D4 Video embedded in session: yes (streaming class)
- D5 GIF/anim: no
- D6 Voice guidance: yes — instructor cues
- D7 Music integration: yes — filterable by music genre, saveable to Apple Music/Spotify [src: apple.com fitness+ compared; peloton class filters]
- D8 Instructor photos on session: yes [src: designrush]
- D9 Long-form articles/blog in app: no (blog is web-only)
- D10 Colored states: Peloton red for action; muted grays for inactive
- E1 Confirm-first or auto-apply: n/a — Peloton IQ Plans are goal-driven but session content plays as-is [src: onepeloton.com]
- E2 Streaks visible on home: yes — daily and weekly streaks with badges [src: onepeloton.com/blog/milestones]
- E3 Achievements/badges: yes — milestone badges at 1/10/25/50/75/100 classes, then every 50, then 500/1000 [src: onepeloton.com/blog/milestones]
- E4 Points/XP/rings: yes — Club Peloton XP + levels Bronze -> Legend [src: onepeloton.com/blog/what-is-club-peloton]
- E5 Push notification frequency: multi-daily (class reminders, streak preservation, live class starts)
- E6 Social feed: yes — leaderboard, high-fives, Teams [src: onepeloton.com]
- E7 Skip/move affordance: yes (bookmark, schedule)
- E8 Undo affordance: yes (delete workout from history)
- E9 Rest-timer type: in-class, hidden between intervals; visible for interval workouts
- E10 Set-log input pattern: n/a (class output auto-tracked from bike/tread; freeform workouts allow manual)
- F1 Load-adjust proposals: yes — Peloton IQ suggests resistance/cadence based on goals [src: onepeloton.com]
- F2 Skip-effect propagation: partial — IQ replans if you skip
- F3 Readiness/recovery score: no
- F4 Symptom/injury tracking: no
- F5 Deload/rest indication: partial (Peloton IQ suggests rest)
- F6 Program deviation tolerance: flexible
- F7 Off-plan session logging: yes ("outdoor walks, runs" logged via app) [src: apps.apple.com/peloton]
- F8 Coach chat surface: none — instructor cues in class, no chat UI
- G1 Study citations in-product: no
- G2 Coach photos and credentials: yes — instructor bios [src: designrush; onepeloton.com]
- G3 Peer testimonials in-app: yes — high-fives, comments
- G4 Backed by science marketing: partial
- G5 Research/whitepaper pages: no
- G6 Data export: partial — output CSV via web only; no CSV in app [community knowledge]
- G7 Clinical/physio endorsement: no
- H1 History time-range default: month (workout history default)
- H2 History aggregation at 400 days: individual class list stays; PR page groups by class length; Milestones show cumulative counts [src: pelobuddy PR article; onepeloton.com/blog/milestones]
- H3 Progress metrics tier at 400 days: individual entries (workout list is uncapped) + PR rollups per class length [src: pelobuddy]
- H4 Retest list growth: uncapped — PR history persists per class length category [src: pelobuddy]
- H5 Off-day representation: unknown [reason: no calendar heatmap sourcing]
- H6 Program-completion archive: visible — completed Programs remain in profile
- H7 Chart densification at 400 points: unknown
- H8 Weekly-narrative retention: recent + milestone-based (no persistent weekly narrative surfaced)
- H9 Data export as counterweight: partial (web only)
- H10 Long-time-user "power user" surface: yes — Milestone badges at 100/500/1000/Millennium ride + Club Peloton XP tier (Bronze -> Legend) [src: onepeloton.com/blog/milestones + what-is-club-peloton]

---

### Zwift (Companion)

Grouped sources: https://apps.apple.com/us/app/zwift-companion/id934083691 ; https://zwiftinsider.com/new-zwift-companion/ ; https://www.zwift.com/int/companion ; https://forums.zwift.com/t/activities-tab-on-zwift-companion-app-has-been-replaced-by-my-list/629742 ; https://www.zwift.com/news/29779-companion-leaderboards ; https://news.zwift.com/en-WW/248415-track-your-fitness-progress-using-zwift-companion-app-whether-riding-indoors-or-out ; https://www.zwift.com/news/14254-how-to-be-successful-in-a-zwift-training-plan ; https://forums.zwift.com/t/the-companion-app-needs-to-show-challenges-achievements-and-garage/640246

Important caveat: Zwift Companion is a controller/social app for the game. Most of the "app" experience — training plans, achievements, avatar garage — lives in the game client (Windows/Mac/AppleTV/iOS-standalone), not in Companion. Attribute answers below reference Companion where possible and note when the answer is game-client-only.

- A1 Background scheme: light-only in Companion (recent versions default light); the game itself is scene-driven, not chromed [src: apps.apple.com/zwift-companion]
- A2 Primary accent color: Zwift orange (~#FC6719) [Zwift brand palette]
- A3 Accent economy: single-accent (orange on white/dark base)
- A4 H1 max size: unknown
- A5 Body-copy default: unknown
- A6 Mono/tabular numerals: yes (power/HR/cadence readouts)
- A7 Card border radius: unknown
- A8 Card border weight: hairline
- A9 Icon stroke weight: regular
- A10 Icon size default: unknown
- A11 Font family: custom sans (Zwift's branded sans)
- A12 Illustration/photography: mix — screenshots from the game + minimal icons
- B1 Number of primary tabs: 4-5 — Home, Events, My List (formerly Activities), Discover, More [src: forums.zwift.com/t/activities-tab-on-zwift-companion-app-has-been-replaced-by-my-list]
- B2 Nav position: bottom
- B3 Persistent header: yes
- B4 Dashboard vs session split: yes — in-ride control view is distinct from Home
- B5 Program picker: catalog — training plans + events (game-client picker for training plans) [src: zwift.com/news/how-to-be-successful-in-a-zwift-training-plan]
- B6 Onboarding step count: unknown
- B7 Auth-first: yes
- B8 Web app parity: partial (zwift.com dashboard is thinner)
- B9 Watch app included: yes, Apple Watch [src: apps.apple.com/zwift-companion]
- B10 Widget included: unknown
- C1 Line chart: yes (power/HR post-ride)
- C2 Bar chart: yes (interval targets)
- C3 Heatmap: unknown
- C4 Ring/donut: no
- C5 Sparkline: yes (fitness trend on companion)
- C6 Sankey/flow: no
- C7 Time-scale zoom levels: week, month, ride-by-ride list up to 250 items [src: forums.zwift.com/t/activities-tab — 250 activity cap noted]
- C8 Absolute + relative deltas: yes — training score reflects long-term load vs short-term fatigue [src: news.zwift.com — training status compares 42-day fitness vs 7-day fatigue]
- C9 Comparison mode: yes (42-day vs 7-day)
- C10 Trend arrow chips: yes (training status indicator)
- C11 Aggregation tier at scale: rolling average — training score averages recent load over time [src: news.zwift.com]
- C12 Empty-state visualization: illustration
- D1 Words-per-screen: low on Home (feed cards)
- D2 Cards-per-scroll: 3-5 (feed cards)
- D3 Text-to-visual ratio: balanced
- D4 Video embedded in session: no in Companion; the "session" is the game
- D5 GIF/anim: no
- D6 Voice guidance: unknown
- D7 Music integration: yes (game side)
- D8 Instructor photos: partial (structured workouts sometimes have coach headshots)
- D9 Long-form articles/blog in app: no
- D10 Colored states: orange (Zwift), blue (structured workout intervals), yellow (sprint), red (KOM)
- E1 Confirm-first or auto-apply: none — plans execute as authored; FTP bias slider is a manual tweak [src: zwiftinsider.com/new-zwift-companion]
- E2 Streaks visible on home: partial — training status is streak-adjacent [src: news.zwift.com]
- E3 Achievements/badges: yes — badges for finishing training plans (sock reward at 80%, achievement badge at 100%); challenges/achievements/garage requested for Companion but not yet added [src: forums.zwift.com/t/the-companion-app-needs-to-show-challenges-achievements-and-garage]
- E4 Points/XP/rings: yes — XP leveling in the game (players report Levels 17-38 in testimonials) [src: zwift.com]
- E5 Push notification frequency: daily (event reminders, ride-on notifications)
- E6 Social feed: yes — RideOns, chat, activity feed [src: apps.apple.com/zwift-companion]
- E7 Skip/move affordance: yes — skip interval slide gesture in Companion during workout [src: zwiftinsider.com/new-zwift-companion]
- E8 Undo affordance: unknown
- E9 Rest-timer type: n/a (workouts are continuous with interval blocks)
- E10 Set-log input pattern: n/a — auto-recorded from trainer
- F1 Load-adjust proposals: partial — FTP bias slider 90-110% is a manual tuner, not a proposal [src: zwiftinsider.com]
- F2 Skip-effect propagation: unknown (training plans have some flexibility)
- F3 Readiness/recovery score: yes — training status compares long/short-term load [src: news.zwift.com]
- F4 Symptom/injury tracking: no
- F5 Deload/rest indication: yes — training status indicates recovery need [src: news.zwift.com]
- F6 Program deviation tolerance: flexible — plans allow skipping and swapping
- F7 Off-plan session logging: yes — free-rides logged
- F8 Coach chat surface: none
- G1 Study citations in-product: no
- G2 Coach photos and credentials: partial (workout authors named)
- G3 Peer testimonials in-app: yes (RideOns, comments)
- G4 Backed by science marketing: partial
- G5 Research/whitepaper pages: no
- G6 Data export: yes — .fit files export to Strava, Garmin, TrainingPeaks
- G7 Clinical/physio endorsement: no
- H1 History time-range default: recent (last activities on My List) [src: forums.zwift.com/t/activities-tab]
- H2 History aggregation at 400 days: unknown / partially known — Companion caps at 250 activities [src: forums.zwift.com/t/activities-tab]. Full history lives on zwift.com/feed.
- H3 Progress metrics tier at 400 days: individual entries up to 250-cap in Companion; web feed shows all [src: forums.zwift.com]
- H4 Retest list growth: partial — FTP test history persists; ramp test results tracked
- H5 Off-day representation: unknown
- H6 Program-completion archive: visible — completed training plan badges persist [src: zwift.com/news/how-to-be-successful]
- H7 Chart densification at 400 points: unknown
- H8 Weekly-narrative retention: unknown — training plan week view exists but historical week narratives not surfaced
- H9 Data export as counterweight: yes — .fit + third-party sync
- H10 Long-time-user "power user" surface: yes — XP level (visible on avatar), completed plan badges, garage of unlocked bikes; users cite Level 17-38 as identity [src: zwift.com testimonials]

---

### GMB Fitness (Praxis)

Grouped sources: https://gmb.io ; https://gmb.io/faq/ ; https://help.gmb.io/article/444-viewing-programs-on-a-mobile-device ; https://help.gmb.io/article/441-start-programs ; https://lansky.tech/work/gmb-praxis-app ; https://app.gmb.io/programs

Critical structural note: GMB has no native mobile app. Praxis is a PWA (progressive web app) at app.gmb.io. This changes multiple attribute answers (no App Store presence, no watch app, no widget) and is itself a design signal — "we skip the app store" is a positioning stance.

- A1 Background scheme: light-only [src: lansky.tech screenshots referenced; also help.gmb.io screenshots] — clean white base
- A2 Primary accent color: black + a burnt orange / red-orange (GMB brand — the raised-fist logo color) [src: gmb.io]
- A3 Accent economy: single-accent (orange on white)
- A4 H1 max size: unknown
- A5 Body-copy default: 16-17px (typical PWA)
- A6 Mono/tabular numerals: unknown
- A7 Card border radius: ~8-12px
- A8 Card border weight: hairline
- A9 Icon stroke weight: regular
- A10 Icon size default: unknown
- A11 Font family: custom sans (GMB uses a warm humanist sans on marketing; PWA appears to inherit)
- A12 Illustration/photography: photography — coach demonstration videos and photos [src: gmb.io]
- B1 Number of primary tabs: unknown — Praxis dashboard-first, program-inside layout (not a tab bar per Lansky case study) [src: lansky.tech]
- B2 Nav position: top (web app pattern) [src: help.gmb.io/article/441]
- B3 Persistent header: yes
- B4 Dashboard vs session split: yes — Programs dashboard vs session player [src: help.gmb.io]
- B5 Program picker: catalog — Elements, Praxis, Mobility, Focused programs [src: gmb.io/faq]
- B6 Onboarding step count: minimal — sign up, land on dashboard [src: help.gmb.io/article/441]
- B7 Auth-first: yes (purchase-gated)
- B8 Web app parity: yes — it IS a web app (no native app) [src: gmb.io/faq]
- B9 Watch app included: no [src: gmb.io/faq — no app at all]
- B10 Widget included: no
- C1 Line chart: unknown
- C2 Bar chart: unknown
- C3 Heatmap: unknown
- C4 Ring/donut: unknown
- C5 Sparkline: unknown
- C6 Sankey/flow: no
- C7 Time-scale zoom levels: unknown
- C8 Absolute + relative deltas: unknown
- C9 Comparison mode: unknown
- C10 Trend arrow chips: unknown
- C11 Aggregation tier at scale: unknown [reason: no public teardown of long-tenure Praxis UI]
- C12 Empty-state visualization: unknown
- D1 Words-per-screen: medium — session pages include written notes + video [src: gmb.io — user feedback references "tedious and disorganized"]
- D2 Cards-per-scroll: unknown
- D3 Text-to-visual ratio: balanced (video + short prose)
- D4 Video embedded in session: yes — seamless video streaming via Mux [src: lansky.tech]
- D5 GIF/anim: no
- D6 Voice guidance: no (silent video with prose notes)
- D7 Music integration: no
- D8 Instructor photos on session: yes — GMB coaches appear in demo videos [src: gmb.io]
- D9 Long-form articles/blog in app: yes — session notes are prose-heavy
- D10 Colored states: unknown
- E1 Confirm-first or auto-apply: confirm-adjacent — user manually adjusts intensity/duration/schedule for each session; the app doesn't propose, user picks [src: gmb.io/faq — "modify to their level or their needs for that day"]
- E2 Streaks visible on home: unknown
- E3 Achievements/badges: yes — Lansky case study references "gamified milestones" [src: lansky.tech]
- E4 Points/XP/rings: unknown
- E5 Push notification frequency: minimal (email-based, not push — PWA constraint)
- E6 Social feed: no
- E7 Skip/move affordance: yes — flexible scheduling, adaptive session length [src: gmb.io]
- E8 Undo affordance: unknown
- E9 Rest-timer type: unknown
- E10 Set-log input pattern: unknown; users manually mark exercises complete [src: fitnessdrum-style review of similar body-weight platforms]
- F1 Load-adjust proposals: no — user self-adjusts, app doesn't propose
- F2 Skip-effect propagation: no
- F3 Readiness/recovery score: no
- F4 Symptom/injury tracking: no
- F5 Deload/rest indication: partial (user chooses to modify)
- F6 Program deviation tolerance: flexible / self-authored (user picks intensity)
- F7 Off-plan session logging: unknown
- F8 Coach chat surface: human — GMB offers coach access via email/community [src: gmb.io — customer service reviews mention coach responsiveness]
- G1 Study citations in-product: no
- G2 Coach photos and credentials: yes — coaches named + bio'd [src: gmb.io]
- G3 Peer testimonials in-app: yes — reviews page carries them; in-product unknown
- G4 Backed by science marketing: partial ("motor control" positioning)
- G5 Research/whitepaper pages: no formal whitepapers; long-form articles yes
- G6 Data export: unknown
- G7 Clinical/physio endorsement: no
- H1 History time-range default: unknown [reason: no public long-tenure teardown]
- H2 History aggregation at 400 days: unknown
- H3 Progress metrics tier at 400 days: unknown
- H4 Retest list growth: partial — self-assessments exist, retest lists unknown
- H5 Off-day representation: unknown
- H6 Program-completion archive: yes — "every program they own appears on their dashboard" [src: gmb.io/faq]
- H7 Chart densification at 400 points: unknown
- H8 Weekly-narrative retention: unknown
- H9 Data export as counterweight: unknown
- H10 Long-time-user "power user" surface: partial — Lansky case study mentions "gamified milestones" but no public year-in-review or tenure badge documented [src: lansky.tech]

Note: GMB has by far the thinnest publicly-observable long-tenure UI. This is either because it doesn't exist or because it's behind purchase gate. Given the fundamental positioning ("training programs, not a tracker") the former is more likely.

---

### The Movement Athlete

Grouped sources: https://themovementathlete.com ; https://apps.apple.com/us/app/movement-athlete/id1357148593 ; https://fitnessdrum.com/the-movement-athlete-app-review/ ; https://calisthenicsworldwide.com/apps/the-movement-athlete-review/ ; https://noobgains.com/the-movement-athlete-review/ ; https://themovementathlete.com/guide-to-troubleshooting/ ; https://themovementathlete.com/calisthenics-progressions/

- A1 Background scheme: light-only or dual — reviews describe demo videos with "dark backgrounds" but app chrome not directly source-confirmed; mixed [src: fitnessdrum review]
- A2 Primary accent color: unknown — teal/blue accent visible on marketing screenshots [themovementathlete.com]
- A3 Accent economy: unknown
- A4 H1 max size: unknown
- A5 Body-copy default: unknown
- A6 Mono/tabular numerals: unknown
- A7 Card border radius: unknown
- A8 Card border weight: unknown
- A9 Icon stroke weight: unknown
- A10 Icon size default: unknown
- A11 Font family: custom sans (inferred from marketing shots)
- A12 Illustration/photography: photography — coach demo videos + skill map iconography [src: calisthenicsworldwide]
- B1 Number of primary tabs: unknown; sections include My Program, Skill Mastery, Muscle Groups, Mobility Program, On-Demand Workouts [src: calisthenicsworldwide]
- B2 Nav position: unknown; typical mobile bottom-nav inferred
- B3 Persistent header: yes
- B4 Dashboard vs session split: yes — "Mission dashboard" separate from session player [src: apps.apple.com Movement Athlete listing quote]
- B5 Program picker: hybrid — assessment-driven personalization + browsable skill map [src: themovementathlete.com]
- B6 Onboarding step count: assessment-based (9 fundamentals) [src: themovementathlete.com]
- B7 Auth-first: yes (assessment gated behind signup)
- B8 Web app parity: partial (web dashboard exists)
- B9 Watch app included: unknown
- B10 Widget included: unknown
- C1 Line chart: partial — progress screens exist [src: calisthenicsworldwide]
- C2 Bar chart: unknown
- C3 Heatmap: unknown
- C4 Ring/donut: unknown
- C5 Sparkline: unknown
- C6 Sankey/flow: yes — skill progression map is a graph/tree visualization [src: calisthenicsworldwide — "gamified map of hundreds of interlinked skills"]
- C7 Time-scale zoom levels: unknown
- C8 Absolute + relative deltas: partial (level unlocks are the delta signal)
- C9 Comparison mode: no
- C10 Trend arrow chips: unknown
- C11 Aggregation tier at scale: unknown [reason: no long-tenure teardown]
- C12 Empty-state visualization: unknown
- D1 Words-per-screen: medium
- D2 Cards-per-scroll: unknown
- D3 Text-to-visual ratio: balanced
- D4 Video embedded in session: yes — "high-quality animation of the movement" [src: calisthenicsworldwide]
- D5 GIF/anim: yes
- D6 Voice guidance: no — "no audio cues accompanying demonstrations" [src: calisthenicsworldwide]
- D7 Music integration: unknown
- D8 Instructor photos on session: partial (demo athletes visible)
- D9 Long-form articles/blog in app: yes — coaches provide troubleshooting guides
- D10 Colored states: locked/unlocked/mastered on skill map [src: calisthenicsworldwide]
- E1 Confirm-first or auto-apply: confirm — user provides exercise feedback (reps completed + difficulty rating) after every movement, AI adjusts next session [src: calisthenicsworldwide]
- E2 Streaks visible on home: unknown
- E3 Achievements/badges: yes — skill mastery achievements ("unlock" + "master") [src: calisthenicsworldwide]
- E4 Points/XP/rings: partial — "level up" language throughout; XP mechanic implied
- E5 Push notification frequency: unknown
- E6 Social feed: unknown
- E7 Skip/move affordance: yes — skip/back arrows during session + manual mark-complete [src: calisthenicsworldwide]
- E8 Undo affordance: yes (manual mark-complete allows correction) [src: calisthenicsworldwide]
- E9 Rest-timer type: ring — with +10 second button [src: calisthenicsworldwide]
- E10 Set-log input pattern: reps completed + difficulty rating (Feedback flow) [src: calisthenicsworldwide]
- F1 Load-adjust proposals: yes — AI adapts sets/reps/difficulty based on feedback [src: themovementathlete.com]
- F2 Skip-effect propagation: yes — next session adapts [src: calisthenicsworldwide]
- F3 Readiness/recovery score: no
- F4 Symptom/injury tracking: partial — troubleshooting guides address common issues [src: themovementathlete.com/guide-to-troubleshooting]
- F5 Deload/rest indication: partial (adaptive back-off if user reports too hard)
- F6 Program deviation tolerance: flexible
- F7 Off-plan session logging: yes — On-Demand Workouts + manual completion
- F8 Coach chat surface: human — "Chat support feature" [src: apps.apple.com Movement Athlete quote]
- G1 Study citations in-product: no
- G2 Coach photos and credentials: yes — GMB-style coach visibility [src: themovementathlete.com]
- G3 Peer testimonials in-app: partial
- G4 Backed by science marketing: partial ("motor control", "AI-optimized")
- G5 Research/whitepaper pages: no
- G6 Data export: unknown
- G7 Clinical/physio endorsement: no
- H1 History time-range default: unknown [reason: no long-tenure teardown]
- H2 History aggregation at 400 days: unknown — the skill map itself acts as a lifetime record (locked/unlocked/mastered) [src: calisthenicsworldwide — "See the progress from where I started"]
- H3 Progress metrics tier at 400 days: unknown; photo/video upload feature allows self-comparison over time [src: calisthenicsworldwide]
- H4 Retest list growth: partial — assessments are re-runnable, list unknown
- H5 Off-day representation: unknown
- H6 Program-completion archive: visible — mastered skills persist on the map [src: calisthenicsworldwide]
- H7 Chart densification at 400 points: unknown
- H8 Weekly-narrative retention: unknown
- H9 Data export as counterweight: unknown
- H10 Long-time-user "power user" surface: yes structurally — the skill map + photo/video journal function as tenure identity ("see the progress from where I started"); no explicit year-in-review or tenure badge documented [src: calisthenicsworldwide; noobgains]

---

## Candidate new attributes worth adding

Patterns observed that don't cleanly fit the 79 attributes:

1. **Data-loss-on-cancel policy** — Whoop explicitly wipes historical data if subscription lapses. Oura and Apple do not. This is a hard trust signal, distinct from G6 (data export) because it's about what happens to *the vendor's* copy, not yours.

2. **Population-comparison surfacing** — Oura's Year in Review compares your data to anonymized global averages ("New Zealand tops the chart with an average Sleep Score of 80"). This is a distinct axis from G3 (peer testimonials) because it's numeric peer comparison, not written testimonials.

3. **Dynamic biometric-based coloring** — Oura's app tint changes based on how your body is doing today. Neither a fixed accent (A2) nor a state color (D10) — it's UI as biofeedback.

4. **Progressive disclosure tiers** — Whoop's design breakdown explicitly names three tiers (glanceable score / trend view / deep-dive graph). Worth cataloguing per app because it maps directly to Terav's "content density" problem.

5. **Web-only vs mobile-only vs both** as a hard binary — GMB has no App Store presence, Whoop has web-thin, Peloton has web-parity. B8 covers this but doesn't force a clear answer on whether the web is a supplement or the primary.

6. **Retention floor / free tier** — All 9 apps except btwb and Zwift Companion are subscription-gated with no permanent free tier. This affects onboarding and B7 in ways that "auth-first" doesn't capture.

7. **Coach-vs-content axis** — Freeletics/Peloton/Fitness+ deliver content authored by coaches. Whoop/Oura/btwb don't have coaches at all. Movement Athlete has a chat coach behind the algorithm. Worth a single attribute: "Coach role: content author / adaptive proposer / concierge / none".

8. **PR reset affordance** — Peloton exposes a manual "Reset PR" button (Pelobuddy article). This is a rare trust move — the user gets to lie about their history. Worth an attribute for Terav's confirm-first ethos.

9. **Feedback vocabulary** — Freeletics uses (too easy / perfect / too hard). Movement Athlete uses (reps completed + difficulty rating). Oura uses tag-based. These are radically different data-capture surfaces. Worth a "feedback vocabulary" attribute.

10. **Off-day representation calendar contract** — btwb shows blank cells, Apple shows greyed rings, Oura keeps a timeline. There's no dominant convention. Terav should decide this early.

## Notes on unknowns

**Whoop** — best-covered app, but even so: no hex values documented publicly, streaks-on-home not source-verified (E2), and widget presence (B10) is common knowledge but not fetched-source-verified. C12 empty state is inferred.

**Oura** — H bucket well-verified (Trends page is public and detailed). What's not observable: streaks and badges (E2/E3) — Oura seems to deliberately not surface these, which is itself a design choice worth noting; onboarding step count.

**Beyond the Whiteboard** — Homepage was rich, but Apple Fitness-style deep density on H7 (400-point chart) not observable without owning the app; App Store fetch returned 403.

**Freeletics** — Dark mode is inferred from marketing/uiland catalog rather than an explicit teardown quote. H2/H3/H7 all unknown because no six-month-user teardown found in the time available.

**Apple Fitness+** — Most attribute answers rely on Apple's own docs + Apple HIG conventions. Sourced attributes are strong; the inferred-from-HIG attributes (A5, A7, A10, C11 baseline) are marked but should be considered high-confidence Apple defaults rather than specific product decisions.

**Peloton** — Milestones and Club Peloton XP are strongly documented (H10 unusually well-supported); widget (B10) and off-day representation (H5) not sourced. Data export status (G6) is partial and community-based.

**Zwift Companion** — Biggest structural caveat: the fetched app is Companion (controller/social), not the game client where training plans, achievements, and rider identity live. Attribute answers that reference the game client are labeled explicitly. 250-activity cap in Companion (H2) is source-verified but the web feed as escape hatch is only partially documented.

**GMB Fitness** — Fundamentally under-observable. No App Store presence, no third-party teardown of Praxis long-tenure UI, no public screenshots of the calendar/history view. Almost every H-bucket answer is "unknown". Its structural design (PWA, minimalist, adjustable-by-user) is legible; its data density at scale is not.

**The Movement Athlete** — Skill map (Sankey/tree) is the standout viz and well-source-verified. Long-tenure H bucket answers are almost all unknown because reviews focus on the assessment + skill map, not the multi-year history view. The map itself is a tenure surface, but explicit year-in-review / long-tenure specialisation is not documented.
