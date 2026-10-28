# Peers 01: Pliability and GOWOD (2026-10-28)

Evidence limits: App Store pages returned no screenshot captions or images, and I could not fetch screens (no Mobbin/Dribbble hits).
Everything below is from text sources only. Visual-style claims are therefore marked (unverified) unless a source states them.
The Terav side comes from screenshots in `launch-readiness/screens/gaps/` (Today, Session, Record, program detail).

## Terav today (what I saw)
- Today (375): H1 plus one red "Rest today" text card, otherwise empty. Session: bordered text box plus one button.
- Record: a 12-week readiness heatmap (the one real visual) and a text/number table ("1 green - 1 amber - 1 red").
- Program detail: title, "CITED" chip, paragraph, text levels "Hang -> Assisted -> First Rep -> Volume", then "Section 1 of 4" text cards.
- No video, figure, illustration, ring, score, body map or hero image on any screen I viewed. Dense mono text, one bronze accent.

## Pliability (pliability.com, iOS)
Sources: [site](https://pliability.com), [App Store listing](https://apps.apple.com/us/app/-/id1175346453), [support: mobility test](https://support.pliability.com/en/articles/8909599-how-does-the-mobility-test-work), [Athletech review](https://athletechnews.com/product-of-the-week-pliability-stretching-app-review/).
- **Onboarding / assessment:** 3-minute camera-based Mobility Test, phone scans the movement and returns a score plus plan (site; listing says "on-device technology"). Support says it scores the whole kinetic chain, not range of motion, from a dysfunction pattern. Retest to track progress. Android lacks it and gets "Build Your Program" (what hurts, how you train, how much time) instead.
- **Home / today:** prompt "What do you need today?"; Daily Routines list (day, routine name, minutes, e.g. "Today: Upper Body Intensive, 12 min"); Smart Routines card; Build Your Program card; category-tagged suggestion cards ("Relieve pain", "SLEEP", "GOLF") (site). Low word count: name + minutes + tag. Layout and imagery (unverified).
- **Session player:** expert-led guided video start to finish, with modifications; equipment notice before a routine; iOS picture-in-picture, AirPlay/Apple TV, offline downloads (listing, Athletech). Reviewer: voiceover is hard to follow, users lean on the video. Breathwork cues.
- **Exercise detail:** no distinct screen documented. Video is the exercise detail.
- **Progress / graphs:** "track your progress over time"; mobility score history under You > Mobility Score > View Results (support). Chart type not documented (unverified). Whoop/Garmin/Apple Health integrations to relate mobility to recovery (listing).
- **Catalog / program page:** Performance (HYROX, Running, Racket, Golf...) and Recovery and Relief (Back, Knee, Hips, Sleep, Desk Bound...) under a 2,000+ routine library (site). Sessions tab: Recommended, Recovery/Restorative/Relief/Warmup categories, Favorites, Recents (listing 3.41). Custom program card: "Your custom HYROX program", Days 1-3, 26 min each.
- **Completion / reward:** Rewards program (referral guest pass, shop credit) in Settings (listing). Streaks only appear as a testimonial (90+ week); no streak UI documented. In-app completion screen: no evidence found.
- **Body maps / scores / levels:** per-joint scores with low-scoring joints as focus areas; elbows/knees greyed out as secondary joints (support). So a body figure with joint states exists. Exact look (unverified).

## GOWOD (gowod.app, iOS)
Sources: [site](https://www.gowod.app/?hash=home), [App Store listing](https://apps.apple.com/us/app/gowod/id1227834875), [FAQ/search summary](https://www.gowod.app/faq), [user reviews](https://justuseapp.com/en/app/1227834875/gowod/reviews).
- **Onboarding / assessment:** free test, under 15 minutes, 10 tests each with a video demonstration; reached by "TEST MY MOBILITY" on the dashboard. Sport carousel (50+ sports) picks what the plan is built around.
- **Home / today:** personalized dashboard with mobility scores and stats (site). Three session types: Activate, Recover, Daily Flow (listing). Apple Watch app.
- **Session player:** guided workout screen with a built-in timer (example "Samson Stretch") (site). Reviewer wants the video separate from the timer, so the video and timer clash. Another says stretches repeat daily.
- **Exercise detail:** video + step-by-step instructions + "stimulus" tab (what you should feel), praised by reviewers (site). 300+ videos filterable by movement type, equipment, body zone.
- **Progress / graphs:** per-sport mobility tracking, month-over-month progress, personal goals; monthly retest (listing). Marketing claim "18% mobility in 60 days" (self-reported). Benefit timeline Instant / 1 mo / 3 mo / 6 mo (site marketing). Chart type (unverified).
- **Catalog / program page:** sport pages (judo, hockey, padel...) and a sport selector; routines adapt to latest assessment score. Layout (unverified).
- **Completion / reward:** Strava sync of the mobility session (site). Levels, streaks and badges are explicitly not on the page.
- **Body maps / scores / levels:** overall score as a percent (mockup shows 63%) with sub-scores for shoulders, overhead, thorax, hips, postchain, ankles (site). This is the single strongest score-as-hero device in the pair.

## Gap table
| Element | Peers | Terav? | Effort | Impact on paid-ad stranger |
|---|---|---|---|---|
| Baseline assessment that yields a score | both | no (intake questions only) | L | very high: first-minute proof of personalisation |
| Headline score % with named sub-scores | GOWOD (Pliability per-joint) | no | M | very high |
| Body figure with joint/region states | Pliability (greyed secondary joints) | no | M-L | high |
| Exercise video on session + detail | both | no | L (content) | very high |
| "Stimulus / what you should feel" tab | GOWOD | no | S | medium |
| Home as short card list: name, minutes, tag | Pliability | weak (one text card) | S | high |
| Category/goal browse of programs | Pliability, GOWOD sport carousel | weak (text list) | M | high |
| Personalised custom-plan card ("Your custom X program") | Pliability | no | S | high |
| Score history chart / retest delta | both | weak (heatmap, no score) | M | high |
| Session timer with video visible | GOWOD (with complaint) | no | M | medium |
| Equipment / duration pre-session notice | Pliability | weak | S | low |
| Wearable / Strava sync | both | no | L | low |
| Streaks / badges / completion reward | neither documented in-app | no | S | low (peers don't lead with it) |

## 10 elements to adopt first
1. Baseline assessment screen with a result score (percent + named sub-capability bars): for the intake flow (`A-first-run/06-intake-*`) and onboarding end.
2. Hero score on Today replacing the text-only state card (readiness or capability score; GOWOD dashboard pattern).
3. Per-capability breakdown tied to Terav's weakest-sub-capability engine (pull-up: grip/scap/negative/band/rep), shown as bars or rings on Today and Record.
4. Exercise video or looping clip on every session exercise and the exercise detail sheet (both peers; the video is the detail screen).
5. Body figure for the symptom check (morning check regions) with tappable, coloured regions; fits Pliability's per-joint map.
6. Today as short cards: session name, minutes, tag, one CTA (Pliability "Today: Upper Body Intensive, 12 min"); cut the prose.
7. Program catalog with goal/category browse and a hero image per program (Pliability categories, GOWOD sport selector), replacing "Section 1 of 4" text cards on `A-first-run/05-program-detail.png`.
8. "Your custom program" summary card produced by intake (Pliability Build Your Program card): the thing an ad stranger sees at the end of intake.
9. Score-over-time line with retest deltas on Record, next to the existing heatmap (both peers retest monthly and track progress).
10. "What you should feel" cue strip on the exercise detail (GOWOD stimulus tab), short and cheap to add, and it fits Terav's cited-reason positioning.
