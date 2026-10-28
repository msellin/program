# Peers 02: Hevy, Strong, Fitbod (strength logging) — 2026-10-28

Scope: set logger, exercise media, muscle maps, strength charts, PR celebrations. Method note: WebFetch returns text only,
no images, so visual style is inferred from text and marked (unverified) where no source describes it. Screenshot captions
were not retrievable from App Store pages. I found no source that describes onboarding or program-catalog screens for any
of the three in enough detail, so those rows say so rather than guess.

## Terav baseline (screenshots seen: C-viewport-375 01-today, 03-session, 04-record, 06-programs)
- Today (rest state): H1 + one red-edged text card ("Rest today. Your shoulder is 8/10...") + text link. No image, no number, no ring.
- Session: three text blocks and one bronze "Back to Today" button. Zero visuals.
- Record: 12-week readiness heatmap (green/amber/red cells) + a "Week of 26 Oct" card of label/value text rows. Only real graph in the app.
- Programs: "Pick your focus." paragraph, small text cards (category, title, 2-line description, "8 wks"), chip filters. No hero imagery.
- Style: dark warm palette, monospace eyebrow labels, flat. Density: ~40-60 words per screen, mostly sentences.

## Per peer, per screen type

### Hevy (https://apps.apple.com/us/app/hevy-workout-tracker-gym-log/id1458862350, https://www.hevyapp.com/features/)
- Onboarding/assessment: not found. (unverified)
- Home/today: Feed-style home with followed lifters; calendar plus streak tracking (monthly/yearly/multi-year) per App Store list.
- Session player: quick logging of weight, reps, duration, RPE; previous session's weight/reps shown per exercise; supersets, drop/warm-up/failure set types; automatic rest timer; live PR notification (feature titled "Live Personal Record Notification", hevyapp.com/features). Very low words, number-input grid.
- Exercise detail: free library with videos and step-by-step instructions (App Store listing). Per-exercise strength progression graph and PR tracking.
- Progress/graphs: Muscle-group workout chart = a body diagram with trained parts highlighted in blue; "Body Distribution" drilldown shows total sets per muscle for the calendar week with week arrows and a share icon (https://www.hevyapp.com/features/muscle-group-workout-chart/). Also "Sets Per Muscle Group Per Week", "Muscle Distribution", Monthly Report, Year in Review (feature titles only).
- Catalog: "Hevy's Routine Library", folders, shareable routines (feature titles). Trainer program is a Pro item.
- Reward: live PR notification mid-workout; shareable stat overviews. Exact visual unverified.
- Body maps/scores: body diagram above; no score or level system found.
- Style: utilitarian, number-forward, blue accent. (unverified from images)

### Strong (https://apps.apple.com/us/app/strong-workout-tracker-gym-log/id464254577, https://lifting-apps.pages.dev/reviews/strong)
- Onboarding: reviewer says "no learning curve", productive in minutes (lifting-apps.pages.dev). No assessment.
- Home: routine list + start; "no social feeds, gamification, or AI coaching" (same review).
- Session player: logging a set takes two taps; tapping a set reuses previous weight/reps, swipe adjusts; rest timer starts automatically (same review). Set tags warm-up/failure/drop, supersets, plate calculator and warm-up calculator (App Store).
- Exercise detail: instructions plus a growing set of animated videos (App Store); reviewer praises "exercise library with images".
- Progress: graphs for volume and 1RM progression, PR list, total weight lifted (App Store). Reviewer calls analytics "functional but basic".
- Catalog/reward/body maps: none documented. PR display visual not described in any source I found.
- Style: minimal, text and numbers, essentially no decoration. 4.9 rating, ~109K ratings: proof logging speed beats decoration.

### Fitbod (https://apps.apple.com/us/app/fitbod-workout-gym-planner/id1041517543, https://fitbod.me/blog/fitbod-insights-feature/)
- Onboarding: level (beginner/intermediate/advanced), equipment, goals feed an AI-built workout (App Store). Screens unverified.
- Home/today: generated workout for today, modifiers, save favorites (App Store).
- Session player: not described beyond Apple Watch support and AI learning from edits.
- Exercise detail: professionally filmed videos, written instructions, popularity rank, 0-100 "mScore" strength rank, difficulty label, alternatives, recommended reps/weight/1RM by level (https://fitbod.me/about-fitbod-exercises). Multi-angle video per App Store description.
- Progress: single "Strength Score" number on Results screen, framed like a credit score; est. 1RM line charts for squat/deadlift/bench/OHP; per-muscle progress; Workout Report (workouts, weight lifted, calories, duration) vs prior period with week/month/6mo/year filter (https://fitbod.me/blog/how-fitbod-tracks-your-strength-progress-with-real-time-metrics-and-scores/, insights post).
- Body map: muscle recovery as a 0-100% heat map per muscle group (insights post; whether it is an anatomical figure is not stated).
- Reward: milestone markers on new volume PRs or est. 1RM PRs (strength-progress post). No levels/badges.
- Catalog: none, the app generates rather than lists.
- Style: video-led, coach-like; (unverified from images).

## Gap table
| Element | Peers | Terav? | Effort | Impact on paid-ad stranger |
|---|---|---|---|---|
| Single headline score (strength/readiness number) | Fitbod | no | M | High: instant "what am I looking at" |
| Muscle/body-region map, highlighted | Hevy, Fitbod (heat) | no | M | High: most recognisable fitness visual |
| Per-exercise line chart (est. 1RM / load over time) | Hevy, Strong, Fitbod | no | M | High: shows progress is tracked |
| Exercise demo video/animation | all three | no | L (content) | High: removes "what is this move" |
| Pre-filled last-session values in the set row | Hevy, Strong | weak (unverified) | S | Medium |
| Two-tap set logging, big numeric inputs | Strong, Hevy | weak (unverified) | M | Medium |
| Auto rest timer with visible countdown | all three | unknown | S | Medium |
| Live PR moment (in-session) + milestone markers | Hevy, Fitbod | no | S-M | High: the reward beat |
| Streak/calendar of consistency | Hevy | weak (12-wk heatmap exists) | S | Medium |
| Period report with week/month/year filter and vs-prior delta | Fitbod, Hevy | weak (one week card) | M | Medium |
| Shareable weekly summary card | Hevy | no | M | Medium: organic reach |
| Difficulty/level label per item | Fitbod | no | S | Medium |
| Program/routine library with browsable previews | Hevy | weak (text cards) | M | High |
| Set-type tags (warm-up/drop/failure) | Hevy, Strong | no | S | Low for Terav focus |

## The 10 elements to adopt first (ranked)
1. Hero number on Today: one score (readiness or arc progress) big at top, in place of the sentence-only rest card. Terav: Today, 01-today. (Fitbod Strength Score model)
2. Per-exercise progress line chart (load or est. 1RM, 4/12 weeks) on the exercise/drill detail and on Record. Terav: Record, session detail. (Hevy, Strong, Fitbod)
3. Exercise demo media (looping clip or illustrated figure) at the top of each movement in the session. Terav: 03-session. (all three)
4. Body-region map highlighting what the focus arc loads and where the symptom region sits. Terav: Today/Record and program page. (Hevy blue-highlight diagram, Fitbod heat map)
5. In-session PR/milestone moment: inline badge when a set beats prior best, plus end-of-session recap with the PR list. Terav: session player, completion. (Hevy live PR, Fitbod milestone markers)
6. Set row redesign: large numeric inputs, last-session values prefilled, tap to repeat previous set, auto rest timer. Terav: session. (Strong, Hevy)
7. Period report card with week/month/year toggle and delta vs prior period, replacing label/value text rows. Terav: Record "Week of 26 Oct" card. (Fitbod Workout Report)
8. Week-by-week muscle/region volume view with arrows and a share icon. Terav: Record. (Hevy Body Distribution)
9. Visual program cards: hero image or illustration, difficulty label, mini week preview, rather than 2-line text. Terav: 06-programs. (Hevy routine library, Fitbod difficulty labels)
10. Shareable summary image of the week or a PR. Terav: completion screen and Record. (Hevy share icon)

Caveat for the lead: Strong wins 4.9 stars with near-zero decoration, so logging speed (items 6) matters as much as new visuals. Fitbod's recovery-percent map is a poor fit for Terav's confirm-first safety gate unless it is driven by symptom state, not guessed recovery.
