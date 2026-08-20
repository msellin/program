# 2026 Fitness/Training App UI — External Market Research

*Compiled 2026-08-20 for the Terav design review. All findings are external — shipped peer apps, published design writeups, and 2025–2026 trend reports. Nothing here is derived from the Terav codebase. Every claim is sourced.*

---

## 1 · Executive Summary

Five findings the Terav design must respond to:

1. **The score-donut hero is a live category convention, not a Whoop quirk.** Whoop, Oura, Ultrahuman and The Outsiders (Gentler Stories' new endurance app, 2026 Apple Design Award finalist) all lead their home tab with a single primary score, then progressively disclose. The category signal is: **one hero number, everything else earns its slot below the fold.** Terav rejects Whoop's *specific* aesthetic (score-hero as toy), but the underlying pattern — one dominant readiness/target/focus number at the top — is what "training app" looks like in 2026 whether you like it or not. If Terav does not put its focus at the top of the today tab, users trained on this pattern will be disoriented. ([Whoop design breakdown, 925 Studios](https://www.925studios.co/blog/whoop-design-breakdown), [Oura new app blog](https://ouraring.com/blog/new-oura-app-experience/), [Outsiders launch coverage](https://tech.yahoo.com/wearables/articles/outsiders-fitness-tracker-ios-serious-105754890.html))

2. **Anti-gamification has stopped being a niche and started being a design language.** Gentler Streak (2024 Apple Design Award), The Outsiders (2026 ADA Finalist) and the "less streak, more listen" movement have concrete visual signals: soothing palettes, "activity path" bands (in/above/below optimal range) instead of goals, dynamic dashboards that change with the user rather than punishing them for a missed day. Terav's "reject streaks/XP" stance is now a recognisable *product family*, not a contrarian position. Design should signal membership in it. ([Sketch blog on Gentler Streak](https://www.sketch.com/blog/gentler-streak/), [Pixso Gentler UX gems](https://pixso.net/articles/gentler/), [FitTech Global](https://www.fittechglobal.com/fit-tech-news/Kind-activity-tracker-Gentler-Streak-wins-Apple-Watch-App-of-the-Year/350559))

3. **The 2025–2026 "serious tool" aesthetic is Linear, not fitness.** Warm-dark / near-black canvas + one chromatic accent + tabular numerics + generous whitespace + no decorative shadows. Linear itself cut chromatic color in its 2025 refresh (down to mono black/white plus a single accent). Superhuman ships the same reduction with a purple glow. Both are the reference points serious lifters/coders/operators recognise as "software made for grown-ups." Terav's bronze-on-slate palette is well-aligned to this — the risk is under-committing (too many accents) rather than over-committing. ([Linear design analysis, LogRocket](https://blog.logrocket.com/ux-design/linear-design/), [Design System Analysis: Linear](https://getdesign.md/linear.app/design-md), [Superhuman design study](https://blakecrosley.com/en/guides/design/superhuman))

4. **Dashboards have quietly moved to bento grids of varying tile sizes.** Garmin Connect's 2024–2025 overhaul is the clearest fitness-vertical example: Latest Activity + In Focus (up to five swappable tiles) + At a Glance (up to eight data cards) + Events. Every peer built or is building this. The 2026 trend blogs call it "Bento Grid 2.0" with AI-personalised tile position (color/typography stays fixed, tile order adapts). This is now the default composition; a single-column stack of full-bleed cards reads as 2022. ([Wareable on Garmin Connect redesign](https://www.wareable.com/garmin/garmin-connect-app-update-2024-hands-on), [Muzli 2026 dashboard examples](https://muz.li/blog/best-dashboard-design-examples-inspirations-for-2026/), [SaaSFrame Bento Grids 2026](https://www.saasframe.io/blog/designing-bento-grids-that-actually-work-a-2026-practical-guide))

5. **"Explain-back" is now a documented AI UX pattern with a name.** Every AI-recommendation feature that shipped in 2025–2026 attaches a one-line "because…" label: Whoop Coach, Runna's post-workout AI insights, Ultrahuman UltraSphere's "Next Best Actions," Peloton IQ, Strava Athlete Intelligence. Smashing Magazine, Clearly Design, and High Peaks all documented this as the *Explainability Pattern* in 2025. Terav's "engine proposes, user Accepts, every change cites a study OR log signal" mechanic *is* the industry-recognised pattern — Terav just has a stricter enforcement bar. Design should surface the citation visually (chip, footnote, "why this?" affordance), not hide it in copy. ([Smashing Magazine: AI design patterns](https://www.smashingmagazine.com/2025/07/design-patterns-ai-interfaces/), [Ideatheorem AI patterns guide](https://ideatheorem.com/insights/blog/the-ultimate-guide-to-ai-design-patterns-for-next-gen-ux), [Clearly Design AI failures](https://clearly.design/articles/ai-design-4-designing-for-ai-failures))

---

## 2 · What's Shipping in 2026 — Per-App Notes

### Whoop (5.0 hardware + app v5.24, 2025–2026)

- **Home structure.** Three primary tabs render Recovery %, Strain 0–21, Sleep hours + performance on the Home tab; bottom nav = Sleep / Recovery / Strain / Stress / Behaviors / Coach.
- **Score-donut hero.** Recovery score renders at ~72pt equivalent for arm's-length readability; supporting text is deliberately small. Everything on the home screen collapses into "how should I train today?"
- **Color system is intentionally narrow.** Green = readiness/recovery, red = strain/risk, yellow = in-between. No arbitrary accent colors. "Every hue carries meaning." Information design by Martin Oberhaeuser (BMW/Airbnb/Facebook alumnus).
- **Data density approach.** Compression, not expansion — multiple biometrics synthesise into one score; raw data lives 2–3 taps down. Three-tier progressive disclosure: Overview → Trend → Deep-Dive.
- **What makes it feel 2026.** Healthspan and Pace-of-Aging metrics, 160+ tracked behaviors, WHOOP Coach LLM as its own tab. Signature move: refusing to grow the score vocabulary — the same three numbers you saw in 2020 are still the frame.
- **Community pain points that shipped anyway.** "Confusing app navigation" and "too much data" recur in complaint threads; the redesign didn't address density, it added a Coach layer on top.
- Sources: [WHOOP 2026 What's New](https://www.whoop.com/us/en/thelocker/2026-whats-new/), [WHOOP All-New Home Screen](https://www.whoop.com/us/en/thelocker/the-all-new-whoop-home-screen/), [925 Studios design breakdown](https://www.925studios.co/blog/whoop-design-breakdown), [CreateSell 2026 guide](https://createsell.com/blog/whoop-app), [Dev Problems on Whoop privacy/data](https://www.devproblems.com/whoops-privacy-practices/).

### Garmin Connect (redesigned 2024, default-rolled through 2025)

- **New home = four labelled sections.**
  1. *Latest Activity / Planned Workouts*
  2. *In Focus* — up to five swappable focus tiles
  3. *At a Glance* — up to eight data cards
  4. *Events / Training Plans / Challenges*
- **Colour-coded activity cards.** Consistent color per sport; the same coding mirrors to web dashboard.
- **Customisation.** Pin/remove any tile with one tap; layout syncs mobile ↔ web.
- **2026 feel.** The Verge called it Garmin's long-awaited "simplified design." The signature move is **the four-section split as an information architecture**: it separates "what just happened," "what you're working toward," "what you're tracking," and "what's on the horizon." That is the Terav-adjacent architecture — a focus rail, not a stat wall.
- Sources: [Wareable hands-on](https://www.wareable.com/garmin/garmin-connect-app-update-2024-hands-on), [road.cc coverage](https://road.cc/content/tech-news/231723-garmin-connect-mobile-app-gets-revamp-colourful-new-dashboard), [Garmin forums thread on customization](https://forums.garmin.com/apps-software/mobile-apps-web/f/garmin-connect-mobile-andriod/142485/customize-dashboard-cards).

### Runna (running plans, App Store Editors' pick 2025)

- **Today-first, calendar-second.** The primary tab is *Today*: today's session, expert tips, warm-up/cool-down chunked into cards. Calendar is a top-right affordance, not the frame.
- **Drag-and-drop within week ± one week.** Sessions are movable but bounded — you can't drag a Tuesday tempo four weeks forward.
- **AI insights are post-hoc, not pre-emptive.** After you log a run, Runna surfaces an AI insight interpreting pace/HR against the plan — creates a felt sense that the plan is adapting.
- **Onboarding is depth-first, then simple.** 25+ question quiz (hilliness of local routes, weekly availability, races). Everything after is minimal.
- **What makes it 2026.** The "Today = one session, Calendar = shape of the week" split is now the running-app default (see also Peloton Programs 3.0, TrainingPeaks calendar redesign). Runna's signature move is the *post-workout insight card* — a chat-shaped explanation of what the last run meant.
- Sources: [Runna support: navigating the app](https://support.runna.com/en/articles/10473504-your-quick-guide-to-navigating-the-runna-app), [Runna Training Calendar](https://support.runna.com/en/articles/10137793-how-to-use-your-training-calendar), [ScreensDesign Runna showcase](https://screensdesign.com/showcase/runna-running-training-plans), [Uiland Runna screens](https://uiland.design/screens/runna/screens/b7d405f1-038c-4c19-9787-b1cc3f41e2d2).

### Hevy (workout logger, iOS/Android)

- **Set-row redesign 2025.** Clearer active/checked states; per-set RPE color scale.
- **PR alerts inline.** Notification when weight or reps beat a personal best — surfaced *in the set row*, not on a separate screen.
- **Progressive overload now supports reps-only movements.** Pull-ups, push-ups tracked as PRs on rep count alone — a nod to non-barbell lifters.
- **Signature move.** Text-forward, table-forward. Almost no imagery in the workout screen. Rows of tabular numerals. The design "feels like a spreadsheet on purpose" — this is what a serious lifter tool visually reads as.
- Sources: [Hevy 2025 features guide](https://help.hevyapp.com/hc/en-us/articles/33106320824727-Everything-You-Need-to-Know-About-the-Hevy-App-2025-Features-Guide), [Hevy workout logger use-case](https://www.hevyapp.com/use-cases/workout-logger/), [Setgraph best workout tracker 2025](https://setgraph.app/ai-blog/best-app-to-log-workout-tested-by-lifters).

### Ladder (coach-driven strength, Apple 2025 App of the Year Finalist)

- **Teams as the unit of programming.** 22+ coach-led teams; users pick a coach's programme, not build their own.
- **Weekly session cards drop Sunday evening.** Programmed content is time-boxed, ritualised.
- **In-ear coaching + video demos + built-in timer** — the card is a container for a session, not a checklist.
- **Signature move.** The *coach* is the hero, not the number. The face and voice are the identity; the numbers are secondary. This is the opposite pole from Whoop.
- Sources: [Ladder App Store](https://apps.apple.com/us/app/ladder-strength-training-plans/id1502936453), [Garage Gym Reviews 2026](https://www.garagegymreviews.com/ladder-app-review), [Parade review](https://parade.com/health/ladder-app-review).

### Pliability (mobility, formerly ROMWOD)

- **Drill grid + calming palette.** Soft blues/greens, oversized whitespace, video-thumbnail cards.
- **Minimalist trajectory.** Recent releases are UI/UX polish + performance rather than new features — an app deliberately holding still.
- **What it teaches Terav.** Mobility is the vertical closest to Terav's "one focus, one arc" ethos. Pliability's move is *not* to add streaks or points but to make the video the ritual. If Terav had a mobility program, this is the visual language it'd sit next to.
- Sources: [Pliability App Store](https://apps.apple.com/mu/app/pliability-mobilit%C3%A9-r%C3%A9%C3%A9duc/id1175346453?l=en-GB), [Graphic Folks minimalist 2025](https://graphicfolks.com/blog/minimalist-app-design-2025/).

### Ultrahuman (Ring, "Emerald" redesign July 2025)

- **Three-mode nav: Ring / Jade AI / Longevity.** Jade AI gets its own tab — this is the current best-practice for "AI is a first-class surface, not a chat drawer."
- **UltraSphere = decision engine.** Generates 60+ "Next Best Actions" tied to metrics. This is the *literal* recommend-and-explain pattern.
- **Light and dark mode both first-class.** Ultrahuman is one of the few 2026 health apps not defaulting exclusively to dark.
- **Long-view UI.** UltraAge, Pulse Age, Brain Age, Blood Age — grouped in a Longevity tab. Slow-moving metrics get their own container so the daily tab isn't confused with the yearly.
- **Signature move.** Actionability language everywhere. "People need more than a number — they want to know what to do" (CEO quote). Metrics never appear without a next action.
- Sources: [Digital Health News on Emerald](https://www.digitalhealthnews.com/ultrahuman-launches-emerald-update-with-redesigned-app-ultrasphere-decision-engine-improved-vo-max-accuracy), [Trusted Reviews](https://www.trustedreviews.com/news/the-ultrahuman-smart-ring-app-just-got-a-huge-upgrade), [Zenodo research paper on UH dashboard](https://zenodo.org/records/16777849).

### Strong (workout logger, iOS-first)

- **Almost aggressively minimal.** Set/rep/weight, rest timer, history. That's it.
- **No AI, no gamification, no social.** In 2026 this is a stance, not a lack of features. Strong is the "still no bullshit" reference — users who want zero chrome pick it.
- **Adjacent apps in the same family.** FitNotes (offline, local-only, "almost too minimal"), Liftosaur, Stronger, BuiltDiff — all cluster around the same aesthetic: text-forward, high-contrast, cell-borders instead of chrome.
- Sources: [Strong App Store](https://apps.apple.com/us/app/strong-workout-tracker-gym-log/id464254577), [Setgraph 2025 tested by lifters](https://setgraph.app/ai-blog/best-app-to-log-workout-tested-by-lifters), [Stronger app](https://www.strongermobileapp.com/).

### Future (1:1 coaching, $200/mo)

- **Chat-forward.** The primary surface is a conversation with a human coach; workouts live inside the chat.
- **Voice messaging as first-class.** 2026 differentiator across the coaching-app category (Trainerize, Everfit, Caliber, Coachway all shipped variants).
- **What it teaches Terav.** The high-price-point coaching apps have collapsed to *chat + workout card + voice memo*. If Terav ever adds a "coach" role, this is the surface.
- Sources: [TrueCoach 2026 voice-messaging guide](https://truecoach.co/blog/the-best-personal-trainer-apps-with-voice-messaging-2026-guide/), [Coachway best apps 2026](https://coachway.io/articles/best-apps-for-personal-trainers/).

### Peloton (Programs 3.0, 2025)

- **Programs are no longer locked schedules.** Miss a day, don't restart; take days off; classes inside a program taken at your own pace.
- **Descriptions visible from landing page.** Program cards now show the "what and why" upfront, then Tabs (All / In Progress / Completed) organise the picker.
- **Big imagery, content-first.** Peloton remains the anchor for "instructor photography as identity." Terav's rejection of photography is a deliberate positioning against this pole.
- Sources: [PeloBuddy Programs v3.0](https://www.pelobuddy.com/programs-2025-relaunch/), [The Clip Out on Peloton 2025 updates](https://theclipout.com/peloton-updates2025/).

### Oura (redesign October–November 2025)

- **Three tabs: Today / Vitals / My Health.** Today = "top stories of your body." Vitals = current snapshot with baselines. My Health = long-term trends.
- **Score presentation.** Sleep + Readiness + Activity at top of Today; shortcuts to HR, Daytime Stress, Cycle Insights below.
- **Today updates dynamically through the day.** Not a static morning snapshot — the primary surface refreshes on new signal.
- **Oura Advisor AI is opened up to more metrics** (sleep, activity, dietary from Meals).
- **Menstrual-cycle-aware Readiness** — biometric baseline adjusts per cycle phase.
- Sources: [Oura blog: new app experience](https://ouraring.com/blog/new-oura-app-experience/), [Droid-Life on Oura app refresh](https://www.droid-life.com/2025/11/13/oura-ring-app-gets-big-facelift-ai-gets-more-access-to-your-metrics/), [9to5Google on Oura redesign](https://9to5google.com/2025/10/20/oura-app-redesign/), [TechRadar on Readiness upgrade](https://www.techradar.com/health-fitness/oura-ring-users-are-getting-a-revamped-ai-powered-app-and-samsung-galaxy-ring-users-are-going-to-be-seriously-jealous).

### The Outsiders (Gentler Stories, launched 2025, 2026 ADA Finalist)

- **"Training Readiness" score** = ratio of chronic training load × body metrics × sleep quality. Rendered on the Today tab.
- **Body metrics as *individual cards***, not stat rows. Each metric opens into its own detail card — this is a deliberate anti-density move.
- **Endurance-athlete focused.** Advanced power metrics, Garmin workout import, training form, widgets — but the primary surface remains one number.
- **What makes it 2026-defining.** It's the Gentler-Streak team applying their calm-first design language to serious athletes. Proves anti-gamification and "serious tool" can coexist without contradiction. **This is arguably the closest peer to Terav that ships today.**
- Sources: [Yahoo Tech launch](https://tech.yahoo.com/wearables/articles/outsiders-fitness-tracker-ios-serious-105754890.html), [9to5Mac on ADA nomination + biggest update](https://9to5mac.com/2026/05/20/the-outsiders-celebrates-apple-design-awards-2026-nomination-with-biggest-update-yet/), [Gentler Stories on advanced metrics](https://gentlerstories.com/newsroom/20260310advancedmetrics), [The Outsiders App Store](https://apps.apple.com/us/app/the-outsiders-athlete-tracker/id6751584800).

### Gentler Streak (Apple Design Award 2024, still shipping)

- **"Activity Path" band** — shows if today is in / above / below optimal range. Not a goal. Not a streak. A *range*.
- **Soft blues and greens.** Explicit rejection of red = bad, green = good hierarchies. Palette signals kindness.
- **Rest days are surfaced, not shamed.** The app suggests rest as a first-class recommendation.
- **Positioning as anti-toxic.** "Move consistently, not constantly" is the tagline. Sold as the response to faster-higher-stronger culture.
- Sources: [Apple Developer: Behind the Design](https://developer.apple.com/news/?id=3m0ht22s), [Sketch blog](https://www.sketch.com/blog/gentler-streak/), [Pixso hidden UX gems](https://pixso.net/articles/gentler/), [gentler.app](https://gentler.app/).

---

## 3 · Data-Viz Trends in Fitness Apps 2025–2026

### Sparklines & trend lines

- Universal on the ring wearables (Oura, Whoop, Ultrahuman). Rendered inside individual metric cards, usually 30-day window, unlabeled Y-axis, subtle stroke color, no fill.
- **Pattern:** sparkline lives *inside* the card that owns the metric, not on a separate "trends" page. Two competing numbers (today + 7-day average) sit above the line.
- Sources: [Muzli dashboard examples](https://muz.li/blog/best-dashboard-design-examples-inspirations-for-2026/), [Fontalternatives on dense dashboards](https://fontalternatives.com/blog/best-fonts-dense-dashboards/).

### GitHub-style weekly heatmaps

- **Strava** shipped Night + Weekly Heatmaps in Nov 2024; Weekly = 7-day rolling snapshot, refreshed every 24h. Strava's is *geographic* (map heat) not calendar-style.
- **CommitFit** and **DotActive** ship the *calendar-style* GitHub heatmap for fitness — 365 dots, colored by workout intensity. DotActive positions the whole year as "365 opportunities."
- **Habit Heatmap** (App Store 2025) is the reference for the pattern on iOS.
- **shadcn-heatmap** (React component, MIT-licensed) is the free-tier implementation everyone uses.
- **Pattern:** 4-level color scale (empty → light → medium → dark → darkest), month-labelled columns, day-of-week rows, tooltip on hover. Ships in both mobile and web.
- Sources: [Strava press release on heatmaps](https://press.strava.com/articles/strava-expands-mapping-tools-with-night-and-weekly-heatmaps), [DotActive Google Play](https://play.google.com/store/apps/details?id=app.dotactive&hl=en_US), [CommitFit App Store](https://apps.apple.com/us/app/commitfit-workout-tracker/id6758589361), [shadcn-heatmap GitHub](https://github.com/fishdev20/shadcn-heatmap), [Habit Heatmap App Store](https://apps.apple.com/us/app/habit-heatmap/id6747598515).

### Progress rings — how they've evolved past % complete

- Apple's Activity Rings turned 10 in 2025 (limited-edition award). The "closed ring" mechanic ("a ring is either closed or not closed") was explicitly designed as addictive — Apple has since faced criticism for exactly this.
- **Whoop's donut** is a variant: not a "close the ring" mechanic but a *readout* — 0–100% recovery, rendered as a filled arc.
- **Oura's Readiness ring** is now cycle-aware — the baseline shifts by phase, so "100%" means different things different weeks. This is a subtle but massive shift: the ring isn't a goal, it's a comparison to your own baseline.
- **The Outsiders** uses a fill-arc for Training Readiness that reads as "how full is your tank today" rather than "how much did you achieve."
- **Pattern in 2026:** rings are *readouts against a personal baseline*, not *goals to close*. Terav should not adopt a ring; if it does, the semantics should be "here's your focus's current readiness," not "close this."
- Sources: [Apple 10 years of Activity Rings](https://m.gsmarena.com/apple_celebrates_ten_years_of_apple_watch_activity_rings_with_limitededition_award-news-67385.php), [MacRumors on VP retirement + criticism](https://www.macrumors.com/2026/04/02/apple-vp-activity-rings-retiring-misconduct-claims/), [Apple HIG Activity Rings](https://developer.apple.com/design/human-interface-guidelines/activity-rings), [TechRadar on Oura cycle-aware Readiness](https://www.techradar.com/health-fitness/oura-ring-unveils-big-readiness-score-upgrade-that-accounts-for-menstrual-cycles).

### Dot trails (14 / 30 / 90 day)

- Common on habit and mobility apps: a row of small dots, one per day, filled/empty depending on completion.
- **Duolingo popularised the pattern.** Fitness adoption is slower — Gentler Streak uses variants (an "activity path" band rather than binary dots), Zero uses badges instead.
- **When it works in a serious-tool context:** show *what* you did, not *whether* you did. Different dot colors = different session types. This is the Hevy/TrainingPeaks approach — the dot trail is a *legend of session types*, not a compliance record.

### Micro-charts inside cards

- The Ultrahuman Emerald redesign shipped "PowerPlugs" — customizable widgets that live inside cards.
- Standard pattern: a card containing a big number + a 7-bar micro-chart (weekday distribution) + a "vs last week" delta chip.
- Bar-chart-in-card is the 2026 default over line-chart-in-card because it survives tiny sizes better.
- Source: [Digital Health News on Ultrahuman](https://www.digitalhealthnews.com/ultrahuman-launches-emerald-update-with-redesigned-app-ultrasphere-decision-engine-improved-vo-max-accuracy), [SaaSFrame Bento Grids](https://www.saasframe.io/blog/designing-bento-grids-that-actually-work-a-2026-practical-guide).

### Non-gamified progress viz

The visual moves that show progress without triggering streak/XP:

- **"Optimal range" bands** (Gentler Streak's activity path). Progress = *where you are inside your own range*, not distance to a fixed target.
- **Trajectory arrows** ("you're moving *toward* your baseline"), not achievement badges.
- **Delta chips** ("+3% vs your 30-day average") instead of absolute scores.
- **Composition breakdown** (60% Zone 2, 40% Threshold this week) rather than a total volume number that begs to grow.
- **Session-type dot grid** (a mosaic of the last N sessions colored by type) — shows character of training rather than count.
- Sources: [Pixso Gentler UX](https://pixso.net/articles/gentler/), [Sketch blog on Gentler Streak](https://www.sketch.com/blog/gentler-streak/), [Indie Hackers on Habi + Gentler Streak](https://www.indiehackers.com/post/gym-streak-review-2026-my-honest-take-on-gymstreak-app-359b48d0e3).

---

## 4 · Dark-Mode + Typography in 2026

### Palette shift — warm-dark is winning over pure black

- **Near-black over #000.** Reference stack: Linear's `#010102` deepest surface + `#f7f8f8` text + one accent (`#5e6ad2` lavender-blue in Linear's case). Pure `#000` is out because it "vibrates" against OLED, and there's no headroom for a *deeper* black on error/modal surfaces.
- **Warm-dark specifically** — `#1A1410` (warm brown/amber cast) reads as "cozy + premium," better for media/lifestyle brands. Terav's bronze-primary + slate-secondary is on this axis.
- **The Pantone 2025 Color of the Year is Mocha Mousse** — a warm mid-brown. Explicitly recommended as a warm-dark accent for CTAs, paired with off-white text and a cool secondary for interactive contrast.
- **Standard alternative:** Dark Slate `#1E293B` + Amber `#F59E0B` — high-contrast warm accent, common in 2025 dashboards.
- Sources: [Canvas Builder 2026 fitness dark-mode](https://canvasbuilder.co/blog/fitness-website-design-trends-2026), [Colorhero 2025 dark palettes](https://colorhero.io/blog/dark-mode-color-palettes-2025), [Devpalettes dark schemes](https://devpalettes.com/dark-color-palettes/), [Linear design system analysis](https://getdesign.md/linear.app/design-md), [Ihor Chyshkala on Linear dark mode](https://chyshkala.com/blog/why-linear-design-systems-break-in-dark-mode-and-how-to-fix-them), [Huedserve 2025 palettes](https://medium.com/@blmouh86/best-5-color-palettes-for-app-design-in-november-2025-03928995c298).

### Typography

- **Inter is still the safe default** — variable weight, screen-optimised, distinctive letterforms.
- **IBM Plex Sans** is the "brand-face" alternative when Inter feels too neutral. Plex was designed specifically for interfaces where data accuracy matters.
- **The tabular numerals rule.** `font-variant-numeric: tabular-nums` is now considered a table-stakes CSS one-liner for any numeric display. Full monospace is overkill; tabular-nums in a proportional font gives you aligned columns without the "code" aesthetic.
- **Weight pairing pattern:** ultra-bold heading (700–900) + regular body (400) + tabular semibold numeric. No middle weight.
- **Display sizes.** 2026 blogs recommend 96–120px display headings on marketing surfaces; in-app hero numbers land 48–72pt (Whoop's Recovery number is ~72pt-equivalent).
- **Density approach for "serious" apps.** iOS Human Interface Guidelines 2026 emphasize "clarity over density" — the *default* is generous whitespace + 8pt grid + 44×44pt tap targets. Fitness apps that go dense (Hevy's spreadsheet-look) do so as a deliberate stance, not a default.
- Sources: [Fontalternatives dense dashboards](https://fontalternatives.com/blog/best-fonts-dense-dashboards/), [BonFX on IBM Plex pairings](https://bonfx.com/what-fonts-go-with-ibm-plex-sans/), [Authon Blog on tabular-nums](https://blog.authon.dev/tabular-numbers-in-css-font-variant-numeric-vs-monospace-hacks), [Caro Appleby on tabular nums](https://www.caro.fyi/articles/tabular-nums/), [Superdesign Apple design system](https://superdesign.dev/blog/apple-design-system), [Timothy Graf on whitespace 2026](https://timgraf.com/ui/whitespace-in-ui-design-the-ultimate-guide-to-mastering-negative-space-2026/).

### Shadow / elevation

- **Tonal layering has replaced traditional shadows** in dark mode. Each surface level is a *lighter* fill on the same warm/cool axis, not a drop shadow.
- **Linear's approach:** `#010102` base → `#0a0a0c` card → `#14141a` elevated modal. No shadows; hierarchy is pure fill.
- **Apple's Liquid Glass** (iOS 26, WWDC 2025) added refractive glass surfaces — reflective, semi-transparent, distorts background. This is Apple's current signature, and it will influence 2026 fitness apps that want to feel Apple-native. **Not compatible with anti-gamification stance** — Liquid Glass is decorative.
- Sources: [Wikipedia on Liquid Glass](https://en.wikipedia.org/wiki/Liquid_Glass), [iOS 26 Wikipedia](https://en.wikipedia.org/wiki/IOS_26), [Linear design system](https://getdesign.md/linear.app/design-md).

---

## 5 · "Calm" / Anti-Gamification Positioning

### Apps explicitly rejecting gamification

- **Gentler Streak** — 2024 Apple Watch App of the Year. Marketing quote: "move consistently, not constantly." "Response to the toxic faster-higher-stronger culture." No streak-you-lose mechanic; instead, an *Activity Path* band showing in/above/below optimal.
- **The Outsiders** — 2026 ADA Finalist. Same design team as Gentler Streak. Serious athletes, no gamification. Sleek score animation on app open, but no XP, no badges, no leaderboards.
- **Zero (fasting)** — minimalist timer + educational library. Some celebratory confetti moments but core surface is data-honest.
- **Habi** — habit tracker positioning: "shared streak projects add healthy social pressure without gamification clutter."
- **Strong** — the veteran anti-gamification workout tracker. Still shipping.

### How they visually communicate "serious tool, not toy"

Common signals across the peer set:

1. **No mascot, no illustration.** Iconography is geometric, not characterful.
2. **Photography is instructional or absent** — never aspirational. (Pliability shows drill demos; Hevy shows nothing; The Outsiders shows nothing above the fold.)
3. **Fonts are Inter / Plex / SF-family** — not display fonts, not scripts.
4. **Color palette narrow.** ≤3 chromatic values used systematically. Whoop's semantic three-color; Linear's mono-plus-accent.
5. **No punctuation-heavy tone.** No exclamation points, no ALL CAPS praise. Copy is declarative.
6. **Numbers over words.** The number is the primary content; the label is small.
7. **Rest and skip are first-class actions.** Present in the primary nav or as prominent card affordances, not hidden in settings.

### Engagement without streaks

- **Post-session insight** (Runna, Ultrahuman UltraSphere, Peloton IQ, Strava Athlete Intelligence). Delivered as a chat-shaped card *after* you complete work, not as a prompt to work.
- **Baseline drift.** Show the user their 30/90-day trend line and their *personal average* — engagement comes from watching your own baseline change.
- **Compositional variety.** Show *what kind* of work you've done recently (Zone 2 %, technical %, strength %) — humans engage with the shape of their training more than the total.
- **Ritualised delivery.** Ladder drops the week's sessions Sunday evening; Peloton Programs unlock on schedule. Anticipation replaces streaks.

### Coach-first / Explain-back UI patterns

- **The "why this?" chip.** A small affordance on every recommendation that expands into the rationale (study cited, log signal named).
- **The confirmation gate.** The AI proposes; the user Accepts before anything mutates. Documented as the *Confirmation Pattern* — required whenever AI can take action on behalf of the user.
- **The rationale label under the recommendation.** "Recommended because you opened similar cases last week." Two purposes: demystify for skeptics, confirm for believers that personalisation is working.
- **Named source.** Naming the study or log signal is the current best-practice for coach-authored content — Terav's mechanic is unusually strict about this and it's a defensible positioning.
- Sources: [Smashing Magazine AI design patterns](https://www.smashingmagazine.com/2025/07/design-patterns-ai-interfaces/), [Ideatheorem AI patterns guide](https://ideatheorem.com/insights/blog/the-ultimate-guide-to-ai-design-patterns-for-next-gen-ux), [High Peaks designing AI UIs](https://highpeaksw.com/designing-ai-uis-people-actually-trust-microcopy-controls-and-recovery/), [Groovy Web AI UI mistakes 2026](https://www.groovyweb.co/blog/ui-mistakes-ai-apps-2026), [Clearly Design AI failures + recovery](https://clearly.design/articles/ai-design-4-designing-for-ai-failures).

---

## 6 · Motion + Micro-Interactions in 2026

### What's expected

- **Haptic vocabulary of ~5 signals**, 200–500ms each. Confirm, error, milestone, section-change, long-press. Consistent across the whole app.
- **Section transitions** on tab change — subtle, ~200ms cross-fade + a few pixels of Y-translation.
- **Number tick-up on load** — big numeric heroes animate from 0 to value on first render (150–300ms). Whoop's donut fills on tab open.
- **Card lift on press** — 4–6px transform, no shadow change (because dark mode).
- **Sticky headers** collapse from large to compact as content scrolls.
- **Pull-to-refresh with a metric-relevant spinner** — Whoop uses its logo; Runna uses a running-shoe icon.

### What's overdone / passé

- **Confetti and burst animations** — Zero still uses them, but they now read as childish in a serious-tool context.
- **Parallax hero images** — 2018 pattern, gone from all serious tools.
- **Loading spinners on every action** — replaced with optimistic UI + local shimmer.
- **Big bounce/spring transitions** — 2020 material-design leftovers. 2026 is *sub-200ms, curve-eased, small displacement*.
- **Animated illustrations of body/muscle** — replaced with real photo/anatomy overlays or removed entirely.

### `prefers-reduced-motion` handling

- Now considered a *baseline requirement*, not a nice-to-have. Cited as the practical mechanism behind WCAG 2.3.3 (Level AAA).
- **Common pattern:** duration → 0.01ms (not 0) to preserve transition-end events; disable parallax; disable auto-play; keep haptic (accessibility-neutral).
- Terav's audit-tracked reduced-motion sweep aligns with the 2026 baseline expectation. Nothing exotic here.
- Sources: [MotionSpec prefers-reduced-motion](https://motionspec.dev/blog/prefers-reduced-motion), [web.dev on prefers-reduced-motion](https://web.dev/articles/prefers-reduced-motion), [BricxLabs micro-animations 2025](https://bricxlabs.com/blogs/micro-interactions-2025-examples), [Earlams haptic strategies](https://earlams.co.uk/mastering-haptic-micro-interactions-deep-technical-strategies-for-enhanced-mobile-engagement/), [Rosalie on microinteractions 2025](https://rosalie24.medium.com/microinteractions-in-mobile-apps-2025-best-practices-c2e6ecd53569).

### Micro-interactions that convey "this app cares" without gamification

- **The number breathes.** Slow 4-second pulse on the primary hero number when today's data is fresh.
- **Cards fade in cascade** (staggered ~50ms) on first mount — signals "this was composed for you."
- **Long-press = detail.** Reserve tap for primary action, long-press for the "why this?" pattern.
- **Undo everywhere.** A 5-second undo toast on any accept action. Confirms trust without demanding certainty.

---

## 7 · Design-Tool + AI-Generation Trends 2026

### The tool landscape

- **Figma still dominates for team design work.** Figma AI (2026) generates layouts from text prompts — "create a dashboard for a fitness app with a weekly step count chart and a recent workouts list" produces a working UI in seconds.
- **Figma Make** is Figma's AI code-gen path — Figma-to-working-app without engineering.
- **Framer** owns AI marketing sites + rapid publishing. SSR, SEO, A/B testing built in. Less useful for app UI.
- **91% of surveyed designers use AI at least weekly in 2026 (up from 54% in 2025).** AI design has moved out of experimentation into production work.

### AI code-generation tools (as of 2026)

- **v0 (Vercel)** — production-grade React components with Tailwind + shadcn/ui. Only tool with image-to-code. Frontend-only.
- **Lovable** — full-stack React + Supabase, GitHub sync, fast deploy. Best for MVPs.
- **Bolt** — AI-native browser IDE, full-stack via conversational interface. Best for demos.
- **Recommended combo for fitness UI:** v0 for components + Lovable for backend. This is the pipeline shipping the fastest MVPs in the health vertical right now.

### What "AI-generated fitness UI" looks like in 2026

- Free Figma community kits (search "AI Fitness & Health App UI Kit") — dozens exist, all converge on the same visual grammar: dark canvas, big hero number, bento tiles, chat-shaped AI coach card, calendar strip.
- Warning: **the AI-generated look is now recognisable**. Users are starting to feel it. Anything shipped straight from v0 without opinionated overrides reads as "generated."
- shadcn/ui remains the *actual* production system underlying most of these — it's the substrate whether or not you use an AI tool.

### shadcn/ui specifically

- Now the reference component system for React fitness dashboards. All blocks support dark mode out of the box.
- **Free dashboard blocks** (shadcndashboard.dev, shadcnblocks.com, thefrontkit) are the current starting point for most 2026 fitness MVPs.
- Chart integration uses shadcn's theming system → dark mode automatic.
- Sources: [Vercel v0 vs Lovable vs Bolt (Digital Applied)](https://www.digitalapplied.com/blog/v0-lovable-bolt-ai-app-builder-comparison), [UI Bakery Bolt vs Lovable vs v0 2026](https://uibakery.io/blog/bolt-vs-lovable-vs-v0), [Figma AI features 2026](https://precisionaiacademy.com/blog/figma-ai-features-2026), [Figma AI Fitness Health kit](https://www.figma.com/community/file/1453020428709281986/ai-fitness-health-app-ui-kit-100-free-personalized-ai-powered-fitness-and-wellness-journey-with), [shadcn dashboard tutorial 2026](https://designrevision.com/blog/shadcn-dashboard-tutorial), [Shadcn dashboard blocks](https://www.shadcnblocks.com/blocks/dashboard), [thefrontkit shadcn templates 2026](https://thefrontkit.com/blogs/best-shadcn-dashboard-templates-2026).

---

## 8 · Direct Implications for Terav

Ordered by force of the market signal, not by ease of implementation.

### 8.1 — Adopt the score-hero pattern, but with Terav semantics

- Every peer that ships puts a single number at the top of the Today tab. Users are trained on it.
- Terav's number is not "recovery" or "readiness" — it's **focus readiness** or **arc position**. The number should answer: *how sharp is today's session against your focus?*
- This is *not* Whoop's donut. It's a numeric hero on warm-dark, tabular numerals, with a one-line "because…" label immediately underneath naming the log signal.
- Do not adopt a ring. Rings semantically say "close me." Use a horizontal bar, a fill arc, or just a number with a delta chip.
- **Peer to study:** The Outsiders (Training Readiness on Today tab, individual metric cards below).

### 8.2 — Move to a four-section bento home, Garmin-style

Terav's Today tab should adopt approximately Garmin's four-section split, translated:

1. **Focus of the day** (one card, full width) — today's session for the active program
2. **In arc** (2–3 tiles) — the metrics that move against the current focus, e.g., top set velocity, aerobic ceiling, hip range
3. **At a glance** (up to 6 tiles) — supporting data: last 7 days composition, sleep-if-connected, symptom trend
4. **Ahead** — next 3–5 planned sessions + any accepted engine adjustments

Each tile has a fixed grid position; the *contents* can adapt per user (Bento Grid 2.0). This gives Terav the density expected of a serious tool without the wall-of-numbers feel of Whoop.

### 8.3 — Commit harder to the warm-dark palette

- Bronze primary + slate secondary is well-aligned to 2026. **Under-commit is the risk, not over-commit.**
- Reduce accents. If a fifth chromatic color exists, remove it.
- Layer surfaces with tonal fill (bronze-tinted slate at 3 levels), not shadow.
- Use `font-variant-numeric: tabular-nums` on every numeric display. Non-negotiable.
- Reference stack: Linear's palette discipline + Whoop's semantic three-color logic. Not Peloton, not Whoop's specific hues.

### 8.4 — Explicitly signal anti-gamification membership

The Gentler Streak / Outsiders / Strong axis is a recognisable product family. Terav's landing already positions correctly; the app itself needs to *look* like a member. Concrete moves:

- Any progress indicator should show *position inside a range*, not distance to a fixed goal.
- Rest and Skip should be visible affordances on the Today card, not settings-buried.
- No mascot. No aspirational photography. No exclamation points in system copy.
- Consider a "sessions this arc" mosaic (session types colored) instead of a total-volume number.

### 8.5 — Make the "because…" citation visually first-class

Terav's confirm-first + citation mechanic is the industry-recognised *Explainability Pattern*, executed strictly. Design should make this visible:

- Every engine-proposed change gets a *citation chip* below the proposal (study title truncated, or "log signal: <name>").
- Tapping/long-pressing the chip expands to the full rationale.
- The Accept button is *never* the primary color until the citation has been surfaced — a small anti-dark-pattern move.
- Undo toast on every Accept (5 seconds).

### 8.6 — One AI surface, not scattered AI touches

Ultrahuman put Jade AI in its own tab. Oura opened Advisor to more metrics. Whoop Coach is a dedicated tab. Terav's engine deserves a *named surface* — a Coach tab, a Focus tab, an Arc tab — where all recommendations live. Scattering AI-generated micro-recommendations across cards is 2023 pattern; consolidating them in one place is 2026 pattern.

### 8.7 — Adopt the calendar/session split, not calendar-first

Runna, Ladder, Peloton Programs 3.0 all converged on: **Today is one session; Calendar is the shape of the week, one tap away.** Terav should follow. The calendar view exists but is not the frame.

### 8.8 — Session-type dot mosaic > streak counter

For history/consistency without gamification: a compact GitHub-heatmap-shaped grid of the last 60–90 days, colored *by session type* (or by focus signal). This shows character, not compliance. shadcn-heatmap is the free implementation.

### 8.9 — Motion discipline

Everything ≤200ms, curve-eased, small displacement. One breathing pulse on the primary hero. No confetti. No bounce. `prefers-reduced-motion` respected globally. Cards fade in cascade on first mount (~50ms stagger). This is the 2026 baseline; anything more feels 2020 gamified, anything less feels neglected.

### 8.10 — Do not adopt Liquid Glass

Apple's iOS 26 Liquid Glass is decorative refractive UI. It's beautiful and it will define "Apple-native" for 2026–2027 apps that want that. **It is fundamentally incompatible with anti-gamification / serious-tool positioning.** Terav's stance should be: warm-dark tonal layers, opaque surfaces, no refraction. That's the disciplined-tool signal.

---

## Appendix A — Peer set at a glance

| App | Hero pattern | Palette | Rejects | Signature move |
|---|---|---|---|---|
| Whoop | Donut, three semantic colors | Pure black + green/red/yellow | Nothing (embraces score) | Compression, not expansion |
| Garmin Connect | Four labelled dashboard sections | Custom per user | Density-panic | User-swappable tiles |
| Runna | Today card + AI post-hoc insight | White/coral, light-first | Photography-heavy chrome | Post-workout chat-shaped insight |
| Hevy | Table of set rows | Almost mono, high-contrast | AI, gamification, social | Spreadsheet-as-identity |
| Ladder | Weekly session card, coach face | Dark, coach photography | User self-programming | Sunday-night session drop |
| Pliability | Video-thumbnail drill grid | Soft blues/greens | Loudness | Video as ritual |
| Ultrahuman | Ring tab + Jade AI tab + Longevity | Light *and* dark first-class | "Just a number" | Actionability language everywhere |
| Strong | Set/rep/weight table | Mono, high-contrast | Everything else | Refusing to grow |
| Future | Chat + workout card + voice memo | Warm, coach-face-forward | User autonomy | Coach as UI |
| Peloton | Program cards, instructor photography | Bright, content-first | Non-guided training | Instructor as identity |
| Oura | Today = top-stories, Vitals, My Health | Warm dark, purple accent | Static daily snapshots | Cycle-aware baseline |
| The Outsiders | Training Readiness on Today | Warm dark, Gentler-family | Toxic training culture | Serious + calm coexisting |
| Gentler Streak | Activity Path band | Soft blues/greens | Streak-you-lose | Range, not goal |

## Appendix B — Sources index (all URLs used)

Peer apps:
- [WHOOP 2026 What's New](https://www.whoop.com/us/en/thelocker/2026-whats-new/)
- [WHOOP All-New Home Screen](https://www.whoop.com/us/en/thelocker/the-all-new-whoop-home-screen/)
- [WHOOP 5.0 unveil press release](https://www.whoop.com/us/en/press-center/whoop-unveils-5.0-MG/)
- [925 Studios: WHOOP Design Breakdown](https://www.925studios.co/blog/whoop-design-breakdown)
- [CreateSell: Ultimate Guide to the Whoop App for 2026](https://createsell.com/blog/whoop-app)
- [Dev Problems: Whoop's Privacy Practices](https://www.devproblems.com/whoops-privacy-practices/)
- [Wareable: Garmin Connect App Update 2024](https://www.wareable.com/garmin/garmin-connect-app-update-2024-hands-on)
- [road.cc: Garmin Connect revamp](https://road.cc/content/tech-news/231723-garmin-connect-mobile-app-gets-revamp-colourful-new-dashboard)
- [Runna Support: Navigating the App](https://support.runna.com/en/articles/10473504-your-quick-guide-to-navigating-the-runna-app)
- [Runna Support: Training Calendar](https://support.runna.com/en/articles/10137793-how-to-use-your-training-calendar)
- [ScreensDesign: Runna Showcase](https://screensdesign.com/showcase/runna-running-training-plans)
- [Uiland: Runna screens](https://uiland.design/screens/runna/screens/b7d405f1-038c-4c19-9787-b1cc3f41e2d2)
- [Hevy: 2025 Features Guide](https://help.hevyapp.com/hc/en-us/articles/33106320824727-Everything-You-Need-to-Know-About-the-Hevy-App-2025-Features-Guide)
- [Hevy Workout Logger use-case](https://www.hevyapp.com/use-cases/workout-logger/)
- [Setgraph: Best App to Log Workout (2025)](https://setgraph.app/ai-blog/best-app-to-log-workout-tested-by-lifters)
- [Ladder Strength Training Plans (App Store)](https://apps.apple.com/us/app/ladder-strength-training-plans/id1502936453)
- [Garage Gym Reviews: Ladder 2026](https://www.garagegymreviews.com/ladder-app-review)
- [Parade: Ladder Review](https://parade.com/health/ladder-app-review)
- [Pliability App Store](https://apps.apple.com/mu/app/pliability-mobilit%C3%A9-r%C3%A9%C3%A9duc/id1175346453?l=en-GB)
- [Digital Health News: Ultrahuman Emerald](https://www.digitalhealthnews.com/ultrahuman-launches-emerald-update-with-redesigned-app-ultrasphere-decision-engine-improved-vo-max-accuracy)
- [Trusted Reviews: Ultrahuman upgrade](https://www.trustedreviews.com/news/the-ultrahuman-smart-ring-app-just-got-a-huge-upgrade)
- [Zenodo: Ultrahuman dashboard analysis](https://zenodo.org/records/16777849)
- [Strong App Store](https://apps.apple.com/us/app/strong-workout-tracker-gym-log/id464254577)
- [Stronger mobile app](https://www.strongermobileapp.com/)
- [TrueCoach: Voice Messaging 2026 Guide](https://truecoach.co/blog/the-best-personal-trainer-apps-with-voice-messaging-2026-guide/)
- [Coachway: Best Apps for Personal Trainers 2026](https://coachway.io/articles/best-apps-for-personal-trainers/)
- [PeloBuddy: Programs 3.0 Relaunch](https://www.pelobuddy.com/programs-2025-relaunch/)
- [The Clip Out: Peloton 2025 Updates](https://theclipout.com/peloton-updates2025/)
- [Oura Blog: New App Experience](https://ouraring.com/blog/new-oura-app-experience/)
- [Droid-Life: Oura App Refresh](https://www.droid-life.com/2025/11/13/oura-ring-app-gets-big-facelift-ai-gets-more-access-to-your-metrics/)
- [9to5Google: Oura Redesign](https://9to5google.com/2025/10/20/oura-app-redesign/)
- [TechRadar: Oura Cycle-Aware Readiness](https://www.techradar.com/health-fitness/oura-ring-unveils-big-readiness-score-upgrade-that-accounts-for-menstrual-cycles)
- [Yahoo Tech: The Outsiders Launch](https://tech.yahoo.com/wearables/articles/outsiders-fitness-tracker-ios-serious-105754890.html)
- [9to5Mac: The Outsiders ADA Nomination + Update](https://9to5mac.com/2026/05/20/the-outsiders-celebrates-apple-design-awards-2026-nomination-with-biggest-update-yet/)
- [The Outsiders App Store](https://apps.apple.com/us/app/the-outsiders-athlete-tracker/id6751584800)
- [Gentler Stories: Advanced Metrics](https://gentlerstories.com/newsroom/20260310advancedmetrics)
- [Apple Developer: Gentler Streak Behind-the-Design](https://developer.apple.com/news/?id=3m0ht22s)
- [Sketch Blog: Gentler Streak](https://www.sketch.com/blog/gentler-streak/)
- [Pixso: Gentler Streak UX Gems](https://pixso.net/articles/gentler/)
- [FitTech Global: Gentler Streak wins Apple Watch AotY](https://www.fittechglobal.com/fit-tech-news/Kind-activity-tracker-Gentler-Streak-wins-Apple-Watch-App-of-the-Year/350559)
- [gentler.app](https://gentler.app/)
- [Zero: ScreensDesign](https://screensdesign.com/showcase/zero-fasting-health-tracker)
- [Zero Longevity](https://zerolongevity.com/)
- [TrainingPeaks App Store](https://apps.apple.com/us/app/trainingpeaks/id408047715)
- [TrainingPeaks Feature Updates](https://www.trainingpeaks.com/trainingpeaks-feature-updates/)
- [TrainingPeaks Coach Calendar features](https://www.trainingpeaks.com/coach-blog/speed-up-your-coaching-with-5-trainingpeaks-calendar-efficiency-features/)

Trends & design systems:
- [Muzli: 50 Best Dashboards 2026](https://muz.li/blog/best-dashboard-design-examples-inspirations-for-2026/)
- [SaaSFrame: Bento Grids 2026 Practical Guide](https://www.saasframe.io/blog/designing-bento-grids-that-actually-work-a-2026-practical-guide)
- [Orbix: Bento Grid Dashboard 2026](https://www.orbix.studio/blogs/bento-grid-dashboard-design-aesthetics)
- [Peterdraw: Bento Grid Layout](https://peterdraw.studio/blog/bento-grid-layou)
- [Canvas Builder: Fitness Dark Mode 2026](https://canvasbuilder.co/blog/fitness-website-design-trends-2026)
- [Colorhero: Dark Mode Palettes 2025](https://colorhero.io/blog/dark-mode-color-palettes-2025)
- [Devpalettes: Dark Color Palettes](https://devpalettes.com/dark-color-palettes/)
- [Huedserve: Best App Palettes Nov 2025](https://medium.com/@blmouh86/best-5-color-palettes-for-app-design-in-november-2025-03928995c298)
- [UI Colors Lab: Dark Mode UI Colors](https://uicolors.org/dark-mode-ui-colors)
- [Fontalternatives: Dense Dashboards](https://fontalternatives.com/blog/best-fonts-dense-dashboards/)
- [BonFX: IBM Plex Pairings](https://bonfx.com/what-fonts-go-with-ibm-plex-sans/)
- [Authon Blog: Tabular Numbers in CSS](https://blog.authon.dev/tabular-numbers-in-css-font-variant-numeric-vs-monospace-hacks)
- [Caro Appleby: Tabular Numbers](https://www.caro.fyi/articles/tabular-nums/)
- [Number Analytics: Tabular Figures Guide](https://www.numberanalytics.com/blog/art-tabular-figures-typographic-guide)
- [I Love Typography: Numerals Guide](https://ilovetypography.com/2025/05/22/a-font-lovers-guide-to-numerals/)
- [Timothy Graf: Whitespace 2026](https://timgraf.com/ui/whitespace-in-ui-design-the-ultimate-guide-to-mastering-negative-space-2026/)
- [Superdesign: Apple Design System 2026](https://superdesign.dev/blog/apple-design-system)
- [asAppStudio: iOS UX Trends 2026](https://www.asappstudio.com/ios-ux-design-trends-2026/)
- [Gluestack: Mobile Design Best Practices 2026](https://market.gluestack.io/blog/mobile-app-design-best-practices)
- [Sphinx: App Design 2026](https://sphinxjsc.com/blog/app-design-for-2026-trends-techniques-and-tools)
- [Tubik Studio: UI Design Trends 2026](https://tubikstudio.com/blog/ui-design-trends-2026/)
- [Groovetechnology: Top 10 UI/UX Trends 2025](https://groovetechnology.com/blog/software-development/trends-ui-ux-mobile-app-degisn/)
- [SPDLoad: 16 Mobile Trends 2025](https://spdload.com/blog/mobile-app-ui-ux-design-trends/)
- [Fuselab Creative: App Design Trends 2026](https://fuselabcreative.com/mobile-app-design-trends-for-2025/)
- [Graphic Folks: Minimalist App Design 2025](https://graphicfolks.com/blog/minimalist-app-design-2025/)
- [Dataconomy: UX Practices for Fitness Apps 2025](https://dataconomy.com/2025/11/11/best-ux-ui-practices-for-fitness-apps-retaining-and-re-engaging-users/)
- [Stormotion: Fitness App UI/UX](https://stormotion.io/blog/fitness-app-ux/)
- [Design Your Way: 27 Modern Fitness Apps](https://www.designyourway.net/blog/fitness-app-design/)

Design systems, motion, AI patterns:
- [LogRocket: Linear Design](https://blog.logrocket.com/ux-design/linear-design/)
- [Chyshkala: Linear Dark Mode](https://chyshkala.com/blog/why-linear-design-systems-break-in-dark-mode-and-how-to-fix-them)
- [Design MD: Linear Analysis](https://getdesign.md/linear.app/design-md)
- [Awesome Design MD: Linear DESIGN.md](https://github.com/voltagent/awesome-design-md/blob/main/design-md/linear.app/DESIGN.md)
- [Bootcamp Medium: Linear Style Rise](https://medium.com/design-bootcamp/the-rise-of-linear-style-design-origins-trends-and-techniques-4fd96aab7646)
- [Blake Crosley: Superhuman Design Study](https://blakecrosley.com/en/guides/design/superhuman)
- [Design MD: Superhuman](https://getdesign.md/superhuman/design-md)
- [Blake Crosley: Arc Browser](https://blakecrosley.com/guides/design/arc)
- [Wikipedia: Liquid Glass](https://en.wikipedia.org/wiki/Liquid_Glass)
- [Wikipedia: iOS 26](https://en.wikipedia.org/wiki/IOS_26)
- [Web.dev: prefers-reduced-motion](https://web.dev/articles/prefers-reduced-motion)
- [MotionSpec: prefers-reduced-motion](https://motionspec.dev/blog/prefers-reduced-motion)
- [OpenReplay: prefers-reduced-motion](https://blog.openreplay.com/prefers-reduced-motion-accessible-animation/)
- [BricxLabs: Micro-Interactions 2025](https://bricxlabs.com/blogs/micro-interactions-2025-examples)
- [Earlams: Haptic Micro-Interactions](https://earlams.co.uk/mastering-haptic-micro-interactions-deep-technical-strategies-for-enhanced-mobile-engagement/)
- [Rosalie/Medium: Microinteractions 2025](https://rosalie24.medium.com/microinteractions-in-mobile-apps-2025-best-practices-c2e6ecd53569)
- [Smashing Magazine: AI Design Patterns 2025](https://www.smashingmagazine.com/2025/07/design-patterns-ai-interfaces/)
- [Ideatheorem: AI Design Patterns](https://ideatheorem.com/insights/blog/the-ultimate-guide-to-ai-design-patterns-for-next-gen-ux)
- [High Peaks: Designing AI UIs](https://highpeaksw.com/designing-ai-uis-people-actually-trust-microcopy-controls-and-recovery/)
- [Clearly Design: AI Failures + Recovery](https://clearly.design/articles/ai-design-4-designing-for-ai-failures)
- [Groovy Web: AI UI Mistakes 2026](https://www.groovyweb.co/blog/ui-mistakes-ai-apps-2026)

Data-viz / heatmaps:
- [Strava Press: Weekly + Night Heatmaps](https://press.strava.com/articles/strava-expands-mapping-tools-with-night-and-weekly-heatmaps)
- [Strava Help: Weekly Heatmap](https://support.strava.com/hc/en-us/articles/26887067613197-Weekly-Heatmap)
- [Strava Press: Redesigned Record Experience](https://press.strava.com/articles/strava-launches-redesigned-record-experience)
- [DotActive Google Play](https://play.google.com/store/apps/details?id=app.dotactive&hl=en_US)
- [CommitFit App Store](https://apps.apple.com/us/app/commitfit-workout-tracker/id6758589361)
- [shadcn-heatmap GitHub](https://github.com/fishdev20/shadcn-heatmap)
- [Habit Heatmap App Store](https://apps.apple.com/us/app/habit-heatmap/id6747598515)
- [Apple HIG: Activity Rings](https://developer.apple.com/design/human-interface-guidelines/activity-rings)
- [Apple 10-year Activity Rings award](https://m.gsmarena.com/apple_celebrates_ten_years_of_apple_watch_activity_rings_with_limitededition_award-news-67385.php)
- [MacRumors: Apple VP retirement + criticism](https://www.macrumors.com/2026/04/02/apple-vp-activity-rings-retiring-misconduct-claims/)

AI-generation tools:
- [Digital Applied: v0 vs Lovable vs Bolt](https://www.digitalapplied.com/blog/v0-lovable-bolt-ai-app-builder-comparison)
- [UI Bakery: Bolt vs Lovable vs v0 2026](https://uibakery.io/blog/bolt-vs-lovable-vs-v0)
- [ToolJet: Lovable vs Bolt vs v0](https://blog.tooljet.com/lovable-vs-bolt-vs-v0/)
- [NxCode: v0 vs Bolt.new vs Lovable 2026](https://www.nxcode.io/resources/news/v0-vs-bolt-vs-lovable-ai-app-builder-comparison-2025)
- [Precision AI: Figma AI 2026](https://precisionaiacademy.com/blog/figma-ai-features-2026)
- [Figma Community: AI Fitness Health Kit](https://www.figma.com/community/file/1453020428709281986/ai-fitness-health-app-ui-kit-100-free-personalized-ai-powered-fitness-and-wellness-journey-with)
- [Figma: AI Fitness App Builder](https://www.figma.com/solutions/ai-fitness-app-builder/)
- [QuaDiz: Figma vs Framer 2026](https://quadiz.com/2026/03/18/figma-vs-framer/)
- [AI Designer: Best AI UI Tools 2026](https://www.aidesigner.ai/blog/best-ai-ui-design-tools)
- [Design Revision: Shadcn Dashboard Tutorial 2026](https://designrevision.com/blog/shadcn-dashboard-tutorial)
- [Shadcn Dashboard Blocks](https://www.shadcnblocks.com/blocks/dashboard)
- [thefrontkit: Best shadcn Templates 2026](https://thefrontkit.com/blogs/best-shadcn-dashboard-templates-2026)

Meta / Apple Design Awards:
- [App Store: 2026 ADA Finalists](https://apps.apple.com/us/iphone/story/id1896567319)
- [App Store: 2026 ADA Winners](https://apps.apple.com/us/story/id1896834607)
- [Retail Dive: Peloton rebrand](https://www.retaildive.com/news/peloton-fitness-rebrand-bike-gym-membership/651134)

Anti-gamification / streak fatigue:
- [Yu-Kai Chou: Top 10 Fitness Gamification 2026](https://yukaichou.com/gamification-analysis/top-10-gamification-in-fitness/)
- [Indie Hackers: Gym Streak Review 2026](https://www.indiehackers.com/post/gym-streak-review-2026-my-honest-take-on-gymstreak-app-359b48d0e3)
- [Habi App: Best Streak Trackers 2026](https://habi.app/insights/best-streak-tracker-apps/)
- [Gentler Streak App Store](https://apps.apple.com/us/app/gentler-streak-fitness-tracker/id1576857102)
