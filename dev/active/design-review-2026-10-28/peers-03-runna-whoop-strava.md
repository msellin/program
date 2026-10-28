# Peers 03: Runna, Whoop, Strava (2026-10-28)

Evidence caveat: App Store pages for Runna and Whoop returned no screenshot captions, and Tom's Guide and the Whoop Locker returned 403. Screen-level claims below rest on text sources only. Anything not found is marked "(unverified)". I saw no images of peer screens, so visual-style notes are text-derived or from memory.

## Terav today (from screenshots, 375px)
- Today (`C-viewport-375/01-today-top.png`): wordmark, program H1, one red-edged text card ("Rest today. Your shoulder is 8/10..."), a text link. No imagery, no figure, no number.
- Record (`04-record-top.png`): a 12-week readiness heatmap (green/amber/red pills) and a "Week of 26 Oct" stats card. Rows are key/value text, "1 green · 1 amber · 1 red" is monospaced prose.
- Session (`03-session-top.png`): text card plus one big bronze CTA. No exercise media seen.
- Bottom nav: 4 icon tabs. Flat dark warm palette, one bronze accent. Mostly paragraphs and labels.

## Whoop
- Scores. Recovery is a daily 0-100% figure, banded green 67-100, yellow 34-66, red 0-33. Inputs: HRV, resting heart rate, sleep, respiratory rate. Strain is 0-21. Sleep Performance is 0-100%. Stress is 0-3. Sources: https://apps.apple.com/us/app/id933944389 and the band search result (whoop.com/au/en/thelocker/how-does-whoop-recovery-work-101/).
- Rings. The overview screen "uses rings" that show the day's tracking at a glance (search summary of whoop.com sources; which ring is which, and the colors, not confirmed).
- Strain Target. Recommended exertion range derived from Recovery: score in, instruction out (same App Store page).
- Coaching. Whoop Coach is a generative-AI chat that answers "why am I tired" using your biometrics; Journal tracks 160+ habits; Weekly Plan (App Store page above).
- Trends. Heart-rate zones, VO2 Max, steps and trends over time (App Store page). Chart type not verified.
- Density. One number plus a colour per card; explanation sits behind a tap (unverified, from memory).
- Style. Dark, saturated traffic-light colour as the only decoration, big numerals (unverified, from memory).
- Not found: onboarding, exercise detail, catalog, completion screens.

## Runna
- Onboarding. Questions on running history, typical 5K pace, goals and available days, then it generates a six-week plan (https://www.aol.com/articles/inside-controversy-surrounding-strava-run-162700562.html).
- Home. Weekly view marks run days, a progress bar fills as workouts complete, race countdown when a race is set (same AOL article). Reviewers add colour-coded sessions by type and weekly distance totals (search summary: therunnerbeans.com, techradar.com review).
- Session. Warm-up, main set and cool-down each with a stated purpose; pace shown as a target range, not labels like "easy" (AOL article). Watch cues say speed up or slow down (search summary).
- Post-run. Route map, pace and elevation graphs, per-mile splits, per-rep results versus target (search summary of reviews). AI workout feedback exists (same source).
- Adaptation. Pace targets come from one estimated race time. Targets change only after repeated misses or beats, and outlier reps are ignored. "Not Feeling 100%" handles illness, an ache or no time, then returns to plan in steps (https://the5krunner.com/2026/09/28/is-runna-ai/).
- Plan control. Scroll ahead, move runs to other days, adjust progression speed, accept or reject suggested changes (AOL article). This is the same confirm-first shape as Terav.
- Criticism. Intensity felt high by week three and coaches say it ignores fatigue (AOL article). Terav's morning check is a real edge here.
- Not found: catalog, body maps, reward screens.

## Strava
- Fitness and Freshness chart (subscribers). Fitness, Fatigue and Form over a user-chosen range, optional Fatigue and Form lines, tap a point to read that date's values, races marked red, a 7-day Fitness delta beside the score, and the contributing activities listed under the graph (https://support.strava.com/hc/en-us/articles/216918477-Fitness-Freshness). The support page itself says trends matter more than the numbers.
- Relative Effort. One comparable effort number across sports, from heart rate or perceived exertion (support.strava.com Fitness and Freshness article; the5krunner.com 2021 explainer).
- Progress tab. Release note: refreshed for training trends and streaks (https://apps.apple.com/us/app/strava-run-bike-hike/id426826309). Challenges award digital badges, and Athlete Intelligence turns workout data into insights (same page).
- Year in Sport. Mobile-only, subscriber-only personalised slideshow, needs 3 or more activities, surfaced on the Progress page (https://support.strava.com/hc/en-us/articles/22067973274509-Your-Year-in-Sport). Users call it a slideshow of known stats; the shareable format is Strava's own framing.
- Routes, segments and KOMs exist on the App Store page; the map and segment screen visuals were not verified.

## Gap table
| Element | Peers | Terav? | Effort | Impact on paid-ad stranger |
|---|---|---|---|---|
| Single hero score (0-100 or state word) in a ring/gauge, colour-banded | Whoop | no (text sentence only) | M | High |
| Today card = score + "so do this" target | Whoop Strain Target | weak (text) | S | High |
| Week strip: day chips, colour per session type, fill bar | Runna | weak (plan is a list) | M | High |
| Progress bar plus countdown to goal/test | Runna | no | S | High |
| Time-series line chart with tap-to-read, delta chip | Strava F&F | no (heatmap only) | M | High |
| Heatmap of readiness | Terav-unique, Strava streaks adjacent | yes | - | Medium |
| Post-session summary with graph and per-set vs target | Runna, Strava | no | M | High |
| Session structure with a purpose line per block | Runna | weak | S | Medium |
| "Not feeling 100%" soft path | Runna | weak (red banner says rest) | S | Medium |
| Cited plain-language reason for each change | Terav-unique; Whoop Coach chat adjacent | yes | - | Medium |
| Badges/streaks/challenges | Strava | no | M | Medium |
| Shareable recap card or year slideshow | Strava | no | L | Medium |
| Hero imagery, motion, exercise video/figures | not evidenced for these three | no | L | Not tested here |

## 10 elements to adopt first, ranked
1. Readiness ring with big numeral and band colour on Today (replaces the "Rest today" paragraph; keep the shoulder sentence as one sub-line). Whoop recovery pattern.
2. Today target chip under the ring: "Go moderate" or "Rest", mapped to the existing green/amber/red state. Whoop Strain Target.
3. Week strip on Today and Plan: seven day chips, colour by session type, progress bar filling as sessions complete. Runna home.
4. Goal progress bar on Today: for pull-up, the current rung on the progression toward the first rep, with a days-to-retest count. Runna countdown/progress.
5. Record trend line chart (for example top-set or readiness over time) with tap-to-read tooltip and a 7-day delta chip, above the heatmap. Strava Fitness chart.
6. Weekly card on Record redesigned as 3 stat tiles with delta arrows (sessions, mean readiness, load) instead of key/value text rows. Strava Progress and Whoop trends.
7. Post-session summary screen: sets done versus target as a small bar chart plus one coach line. Runna post-run.
8. Session player blocks labelled warm-up, main, cool-down with a one-line purpose each. Runna guided workouts.
9. Proposal and change cards on Record show "was to now" as a mini chart or chip with the citation as a footer, not a paragraph. Strava click-a-point plus Runna accept/reject.
10. "Not feeling 100%" amber path on the red Today state: offer a lighter session instead of only "rest". Runna.
