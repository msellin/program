# Concern C — Free vs paid tier split

## 1. The question, restated

Given Terav's focused-improvement positioning ("pick one thing, sharpen it") and the 5-program surface area, what actually justifies a paid tier? The founder's hunches are:

- **Free (loss-leader):** exercise demos, all 5 programs, log + engine + citations, history.
- **Paid (candidates):** video form analysis, wearable ingest (Garmin/Whoop/Oura), Coach chat, concurrent tracks, multi-year trends.

The load-bearing sub-question is whether **video form analysis** is really the killer feature, or an industry mirage that founders keep re-discovering.

## 2. Comparable apps studied

### Runna (~$18/mo, $110/yr; ~$150 bundled w/ Strava)
- **Free:** Week 1 of any plan, a couple of "New to Running" plans.
- **Paid:** dynamic re-planning, watch sync (Garmin/Apple), integrated strength/mobility.
- **What works:** the plan adapts *and* lands on the watch. Users pay for the next session waiting on their wrist, adjusted for what they did last time.
- **Telling:** Strava bought Runna and bundled it cheaper than a pair of run shoes — adaptive planning + social loop is a durable combo.

### Ladder ($30/mo team, $180/yr all-access)
- **Free:** near-nothing. Full-content paywall.
- **Paid:** coach-led programs, in-ear audio cues, community.
- **What works:** in-ear coaching is the emotional hook, not the programming spreadsheet.
- **What doesn't:** hard to defend vs. free YouTube; retention is the coach relationship, not the software.

### MacroFactor (~$12/mo, ~$72/yr)
- **Free:** none. 7-day trial, hard paywall.
- **Paid:** everything, especially the adaptive expenditure algorithm that re-calibrates calorie targets weekly from real intake + weight trend.
- **What works:** the team publicly argues *ad-free, paywall-only* keeps incentives aligned. Users pay to be told what to eat *next week*.
- **Signal for Terav:** people will pay for a small, adaptive number that recalculates from their own data — Terav's confirm-first proposal, in a different domain.

### Fitbod ($13/mo, ~$96/yr)
- **Free:** ~3 workouts then paywall.
- **Paid:** unlimited generation, recovery-aware selection, progressive-overload automation.
- **What works:** "what should I do today?" answered.
- **What doesn't:** reviewers complain suggestions aren't personalised enough. A few ask for Hinge-Health-style motion coaching — but that's not why they cancel. They cancel because the *program* feels generic, not because there's no form check.

### Hevy Pro ($6/mo, ~$50/yr — bootstrapped, ~$160K MRR by 2023, 2M+ downloads, no paid marketing)
- **Free:** unlimited logging, basic templates, social feed, exercise library.
- **Paid:** unlimited routines, advanced analytics (muscle heatmaps, volume charts, plateau detection), body measurements, HevyGPT.
- **What works:** founder Guillem Ros says publicly he *doesn't* raise price even when users would pay more — the free tier drives the viral loop. Paid is deliberately narrow: analytics + template ceiling, not content. Closest ideological match for Terav.
- **Quiet, high-signal-to-noise:** trend charts, not flashy AI.

### Whoop ($200-360/yr, hardware included)
- **Free:** nothing standalone.
- **Paid:** recovery score, strain targets, sleep coach, journal correlations.
- **What works:** 83% DAU claim, 80%+ retention, $1.1B ARR bookings 2025 (Sacra). A single daily number people trust is the entire product.
- **Backfired:** May 2025 change to "free forever" hardware upgrades caused public backlash. Once paid promises exist, breaking them destroys goodwill fast.

### Strava Premium (~$12/mo, joint bundle w/ Runna)
- **Free:** activity recording, follow, kudos, comments — the *social graph*.
- **Paid:** route builder, heatmaps, training dashboard, HR/power zones, relative effort.
- **Worked:** progressively moving *analysis* behind paywall while keeping *social* free.
- **Backfired:** journalists routinely flag paywall creep. Reclaiming previously free features is a churn accelerant. Adding new value is safer than reclaiming old.

### TrainerRoad ($20/mo, $210/yr — single tier)
- **Free:** trial only.
- **Paid:** everything, especially Adaptive Training (ML re-plans from performance + post-workout surveys).
- **What works:** single-tier honesty + "plan responds to your reality." Culturally similar to MacroFactor.
- **Signal for Terav:** single-tier is defensible when the core is one adaptive engine.

### Squat University / Kneesovertoesguy / CrossFit Journal (creator/publisher paywall)
- **Free:** infinite YouTube, podcasts, IG demos.
- **Paid:** structured programs ($20-100 one-off or coaching sub), e.g. Knees Ability Zero.
- **What works:** the sequenced *protocol for a named goal* is what people pay for. Free content is the funnel.
- **CrossFit Journal:** low-price ($25/yr) archive; the paywall exists but is thin, and the affiliate ecosystem is the real growth engine.
- **Signal for Terav:** "sequenced protocol for a named goal" is a proven paid unit and matches Terav's programs conceptually.

### Nike Training Club (was $15/mo → free permanently 2020)
- Went free in COVID, never re-paywalled. ~60% engagement lift, $170M incremental attributed revenue — but Nike monetises via shoes.
- **Signal for Terav:** if you're not selling shoes, "go free" isn't a strategy. NTC proves content-only paywalls are extremely hard to defend once free alternatives exist.

### Peloton App ($0 / $13 / $24)
- $13 tier for classes-without-bike; $24 as defensive floor for equipment owners.
- **Signal for Terav:** three tiers expensive to operate and confusing at Terav's scale. Skip.

### Video form analysis vendors — the specific question
- **Coach's Eye** (TechSmith): discontinued Sept 2022. Paying users were *coaches*, not athletes.
- **Hudl Technique**: sunset, users pushed to OnForm.
- **OnForm**: alive, positioned at **coaches**, not solo athletes.
- **HomeCourt (NEX Team)**: alive, NBA-invested. Wins are basketball-shot-tracking for kids/parents — narrow, gamified.
- **Uplift Labs**: shipped a consumer iOS app Sept 2024, grew to ~20k athletes in 2025 — but paying accounts are pro teams (MLB, NBA, NCAA) and youth orgs. Consumer app is a funnel to the enterprise sale.

**Read across the pattern:** every "AI form check" business that survived pivoted to selling coaches, teams, or narrow sports (golf swing, basketball shot). None built a durable *consumer subscription* around "film your squat, get feedback." Coach's Eye is the tombstone.

## 3. What the industry has learned

Common patterns:

1. **Adaptive planning >> content.** The apps that grow — MacroFactor, TrainerRoad, Runna, Whoop — all paywall a *decision engine*, not a library. Users pay to be told what to do next, informed by their own data.
2. **Free tier = social/graph/logging. Paid tier = the number and the next step.** Strava and Hevy are near-canonical: the log and the community are the acquisition loop; the analysis and the recommendation are the paid product.
3. **Content-only paywalls lose to free alternatives.** Nike ate NTC's own paywall. Peloton's $13 tier survives because there's *live-instructor production value* free apps can't replicate.
4. **Once free, don't re-paywall.** Strava's slow paywall creep and Whoop's 2025 hardware-upgrade reversal both generated meaningful churn signal.
5. **Wearable ingest is table stakes, not a paid feature.** Runna, Strava, TrainerRoad, MacroFactor, Whoop all sync — it's an acquisition requirement. Charging for Garmin sync alone will feel petty.
6. **Single-tier honesty is a viable moat when your core is one adaptive engine.** TrainerRoad, MacroFactor. Simpler ops, clearer pitch.
7. **"Program for a named goal" is a proven paid unit** in the creator economy (KneesZero, Squat University programs, TrainerRoad plans). This is exactly what Terav's 5 programs are.
8. **Video form analysis has never converted at consumer scale.** It's a founder-obvious feature that keeps failing commercially. The buyers are coaches, not athletes.

Surprising:

- **Coaches, not athletes, are the video-analysis buyers.** Every survivor sells B2B. Terav is D2C. This is a fatal mismatch for putting video analysis at the centre of the paid tier.
- **Willingness-to-pay for "the software knows me" is the highest of any category.** MacroFactor's premium-only model and Whoop's 80% retention both prove this.
- **Hevy Pro's deliberately narrow $6 paywall (analytics + template ceiling) outperformed higher-priced competitors on retention economics** because it protected the viral loop.

## 4. What this suggests for Terav

Given Terav's positioning (focused-improvement, confirm-first, engine cites its evidence) and its 5 programs:

**Defensible path 1 — The MacroFactor stance ("adaptive engine is the product").** Small free trial (2-4 weeks or Week 1 of one program). Everything paid. Pitch is: *the engine gets sharper the more you log*. Ops-cheap. Positioning matches. Risk: kills the viral loop; harder to seed a beta.

**Defensible path 2 — The Hevy stance ("free log + community, paid analytics + engine ceiling").** Free: unlimited logging on 1 chosen program, exercise library with demos, history, engine proposals for that program. Paid: additional concurrent programs, wearable ingest, multi-program correlation trends, "Sharpness"-raising features from Concern A (video retest → grade lift), export. Best fit for Terav's current adjacency to full-plan providers because users try Terav alongside their real training — a genuinely useful free tier makes that adoption easy.

**Defensible path 3 — The Kneesovertoesguy stance ("free everything, paid programs").** Free: engine, log, one entry-level program. Paid: unlocked sequenced programs for named goals (handstand walk protocol, overhead mobility protocol). Familiar to CrossFit/gymnastics users who already buy programs on Gumroad. Risk: only 5 programs today; needs a content roadmap.

**Anti-pattern to avoid: video form analysis as a paid tier centrepiece.** The industry evidence is unambiguous. Consumer video form analysis has not converted at scale for any competitor since 2016. Coach's Eye died. Uplift and OnForm pivoted to coaches. Users don't film themselves, don't rewatch, don't act on the feedback. If it's built, it should be *free and optional*, feeding the Concern-A "Sharpness" grade — not a paywall pillar. Selling it as the tentpole is likely a 12-month misallocation.

Also probably-a-mistake: **Coach chat (Sonnet-powered)** as the flagship. It's a commodity in 2026 — every fitness app is bolting it on, users treat it as decoration, and it inherits LLM ambiguity that contradicts Terav's "confirm-first, cite the study" positioning. Fine as an extra; wrong as anchor.

## 5. What we still don't know

- Terav's actual funnel: how many free users log twice? Nobody's data works exactly like Terav's confirm-first loop.
- Whether current beta users would pay $8, $12, or $20. Cheapest test: a Stripe link on the settings page today, no gate, "support Terav." A pricing survey is not this.
- Whether the "Sharpness" grade (Concern A) can drive upgrade intent — a user who sees their program at grade C and knows connecting a Garmin lifts it to A is a highly qualified upsell.
- Whether users experience the 5 programs as one product or as five products. Determines whether concurrent-tracks belongs paid or is a natural single-tier feature.
- The rehab-adjacent segment specifically: they may pay for the *program* (Squat U pattern) more than the *engine* (MacroFactor pattern) because they already have a specialist.

## 6. Recommendation

**Ranked paid-tier candidates by expected conversion × defensibility:**

1. **Wearable ingest + multi-program concurrent use.** Highest defensibility. Table-stakes for the target athletes (Hyrox/CrossFit users have Garmin/Whoop already), technically real work, low churn once wired. *Worth building.*
2. **Multi-year trend + correlation view + Concern-A "Sharpness" grade lifters.** The MacroFactor lesson — pay for the number, not the log. Small, defensible, ideologically consistent. *Worth building.*
3. **Additional/premium programs behind paywall (Kneesovertoesguy shape).** Proven paid unit in the exact user segment. Requires content roadmap. *Needs more research — depends on program authoring velocity.*
4. **Coach chat (LLM-powered).** Nice-to-have, not a pillar. Ship as included-in-paid, don't market it as *the* reason. *Needs more research.*
5. **Video form analysis.** Almost certainly a mistake as a paid-tier pillar. Every consumer competitor has died or pivoted to B2B. If built at all, ship free, tie to Concern-A "Sharpness" grade lifts. **Almost certainly a mistake** to prioritise.

**Overall verdict:** the founder's paid list is directionally sensible except for one item. Reshape the paid tier around *wearable ingest + adaptive trend/correlation view + optional program unlocks*. Kill "video form analysis" as a paid centrepiece before it eats a quarter of engineering time. Model: closer to Hevy Pro than Runna Premium — narrow, quiet, high-signal, protects the free viral loop.

Sources: Runna/Strava (T3, Garmin Rumors, TechRadar); Ladder (Parade, Garage Gym Reviews); MacroFactor team statements; Fitbod (App Store, Trustpilot, Indie Hackers); Hevy (RevenueCat Sub Club, Starter Story); Whoop (Sacra, TechCrunch, TechRadar 2025); Strava paywall (T3, road.cc); TrainerRoad Adaptive Training; Coach's Eye retirement (Jason Gaylord); Onform, Uplift Labs, HomeCourt, NEX Team; NTC COVID case study (Appventurez); Peloton (Fortune, Retail Dive); CrossFit Journal.
