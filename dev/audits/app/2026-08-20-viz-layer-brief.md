# Terav — Viz layer brief for Today + adjacent surfaces

**Author:** app-visual-craft
**Date:** 2026-08-20
**Trigger:** Founder verdict on Stitch v1 (best of three): *"clean but not very many visuals or graphs or engaging things."*
**Related files:**
- `/tmp/stitch/today-v1.png` — accepted-direction mockup (letter-prefix block list, dot trail, bronze CTA)
- `/tmp/stitch/today-v2.png` — denser mono variant
- `/tmp/stitch/today-v3.png` — rejected barebones
- `dev/audits/app/2026-08-20-deep-design-review.md` — prior 25-page review
- `dev/audits/app/2026-08-20-design-review-call.md` — design-review-first protocol
- `dev/audits/app/2026-08-19-founder-observations-queue.md` — O21 (still 1995)
- `dev/audits/app/2026-08-19-master-task-list.md` §G Rejected list

**Hard constraint check (R-list) — this brief operates inside these:**
- R1 no photography · R5 no gamification (no streaks / N-in-a-row / badges / XP / confetti / autonomous "keep it up") · R8 no autonomous score-donut hero (no proprietary composite score in a big ring)
- **Explicitly permitted:** sparklines, dot trails, honest progress bars toward authored targets, state chips, small heatmaps, category glyphs, delta arrows, target-line overlays on charts. Terav rejected the *gamified variants* of viz; viz itself is fine.

---

## Section 0 — Is v1's skeleton right, or does the composition also need another pass?

**Short answer: v1's skeleton is directionally correct; it needs viz *added*, not restructured.** Founder's read is accurate — "clean but not many visuals" is a viz-density problem, not a composition problem. Look at what v1 has right:

- **One hero object.** The workout summary card (bronze CTA at bottom, block list inside) IS the primary emphasis, unambiguously. That fixes the primary failure diagnosed in the deep review (proposal outranks workout).
- **Extras is visibly secondary.** Smaller, no filled CTA, drills as chip row. Correct tiering.
- **Bottom nav clears the fold.** Workout hero + CTA fit above the nav on 393 × 852.
- **Readiness strip is inline chrome, not a full card.** 14-day dot trail carries state ambiently. Correct — this was the R8-safe alternative to a score donut.
- **Letter-prefix block list (A/B/C/D/E) reads as a *program*, not a spec sheet.** Ordered, alphabet-anchored, scannable. This is the single strongest move in the whole mockup — it's the fix for the "1 block · 0 exercises" arithmetic-headline problem the deep review named.
- **Type ramp is right.** "3 blocks · 12 exercises · 48 min" as the H2, "Cycle 2 · week 3 of 4" as caption, block names as body — three tiers, no more.

What v1 lacks is what founder said: *engagement via honest data-shape*. There are exactly two visual elements in the whole mockup: the dot trail (14 dots) and the bronze CTA. Everything else is text-on-surface. That is not enough visual signal for a daily-use dashboard where the user *walks* the app.

**Verdict: keep v1's skeleton. Add a viz layer.** This brief proposes what.

**Rejected alternative — restructure to v2 (mono/dense).** v2 is a stylistic detour, not a composition improvement. It reads like a terminal readout — different flavor of "1995." The letter-prefix list is preserved but the whole card tone shifts to mono-caps, which fights the R4 discipline that mono-caps is a *tier* (eyebrow + numeric), not a *style*. Reject.

---

## Section 1 — The six surface positions

### Position 1 — Above/inside the WorkoutHero card

**Context.** v1's hero currently reads: eyebrow ("TODAY · ENGINE BUILDER") → H2 ("3 blocks · 12 exercises · 48 min") → caption ("Cycle 2 · week 3 of 4") → letter-prefix list → CTA. All prose + numbers. Zero visual anchor. Founder walks Today daily and sees the same text every time.

**Ideas evaluated:**
- *Donut showing exercises-completed vs total.* **Reject.** Pre-session, the ratio is 0/12 — a donut showing "0 done" is a nihilism icon, not a viz. Post-session, the whole card disappears anyway. Also R8-adjacent: a big ring on Today is exactly the score-donut pattern we rejected.
- *Horizontal segment bar for block progress.* **Weak.** Pre-session it's empty; post-session redundant with the letter-prefix list which will visibly gain checkmarks. Adds a second progress channel with no new info.
- *Weekly rhythm strip M-T-W-T-F-S-S with today highlighted + past days shaded by session-completed.* **Ship.** This is the winner. It gives the card a temporal anchor (today isn't a session in isolation — it's session 3 of the week), the past days carry a visual completion signal (filled vs empty), and it's honest — the app already knows session-completed state per day. This is a **weekly session strip**, distinct from the readiness dot trail (which is health-state, not session-completed).

**Verdict:** SHIP.

**Concrete description.**
A 7-cell weekly session strip renders between the "Cycle 2 · week 3 of 4" caption and the letter-prefix block list. Each cell is a ~40 × 28 px pill labeled with the day-letter (M T W T F S S), tabular, monospaced 11 px caption above a filled indicator bar. Past days that had a scheduled+completed session render bronze-filled; scheduled-but-missed render slate-outlined; rest days render as a subtle 2 px dotted underline; today renders bronze-outlined with a 1 px inner ring; future scheduled days render as slate hairline outlines. The strip is 24 px tall, 100% width of the card interior. Tapping a cell navigates to that day (uses existing DateNav routing).

**R-list compliance.**
- R5 (no gamification) — this is a *scheduled-vs-actual* strip, not a streak counter. It does not display "N days in a row." It does not congratulate. Missed sessions render neutrally (slate outline), not shame-red. If the user has done 4 of 4 scheduled days it does NOT say "4 IN A ROW" or add a badge — it just shows 4 filled bronze pills. R5 forbids gamification *language*; a strip of state indicators is state, not a game.
- R8 (no score-donut) — this is a horizontal typographic strip, not a proprietary composite score. Each cell is a single boolean (completed or not).
- R11 (no cross-user aggregation) — self-only.

**Sample Stitch prompt.**
> Inside the workout hero card on Today, add a compact 7-cell weekly session strip between the phase caption and the letter-prefix block list. Each cell is ~40 × 28 px with the day-letter (M T W T F S S) in mono-caps 11 px above a 4 px filled indicator bar. Filled bronze `#C89666` = session completed on that day; slate hairline outline = scheduled but not yet done; muted 1 px dotted = rest day. Today is bronze-outlined with a subtle 1 px inner ring. Full strip is 24 px tall, occupies full card interior width, sits 12 px below the caption. Warm-dark ground `#20232a` behind. No labels, no counts, no "streak" text — just the strip.

**Ship cost.** S (2-3 h). New `WeeklySessionStrip.tsx` primitive, ~50 LoC. Wire in `WorkoutHero`. Data derives from the existing `store.log` entries scoped to current week; `getCurrentWeekBounds()` helper likely exists already.

**Dependencies.** None new — existing log store has `date, sessionCompleted` fields. Adds one selector (`selectWeekSessionStates`).

---

### Position 2 — In the readiness strip (beyond the 14-day dot trail)

**Context.** `ReadinessTrail.tsx` currently renders 14 colored dots representing the past 14 days of morning-check state. Each dot is 6 px, spaced 4 px, tinted green/amber/red per state. Founder observation: this is *ambient* but not *informative* — you know the app "has state" but you can't read a *trend*.

**Ideas evaluated:**
- *30-day trail.* **Reject.** 30 × 6 = 180 px + gaps = too wide for a mobile chrome strip. Compresses to a smaller dot which loses the color signal.
- *Symptom-score sparkline.* **Ship as the primary.** A 96 × 20 px sparkline of the last 30 morning-check symptom scores gives the trend the dots don't. Colored per direction (improving = green, worsening = amber). This is the piece the deep review said was missing and the Sparkline primitive already exists (`components/charts/Sparkline.tsx`) — it just needs a home on Today.
- *HR-trend sparkline.* **Defer.** Data-gated — only meaningful if the user has been logging HR-having sessions for 2+ weeks. Not universal. Add later as a second-position sparkline when the persona has enough data (gated on `store.sessions.filter(has_hr).length >= 8`).
- *Sleep-hours mini-bars.* **Reject.** Sleep isn't logged in the current schema. Adding a data-plumbing dependency for a viz element is scope inflation.

**Verdict:** SHIP (symptom sparkline). DEFER HR sparkline as a Phase 2 companion.

**Concrete description.**
The readiness strip becomes a two-part row: on the left, the label "READINESS" in mono-caps 10 px (existing) with a small colored state dot (green/amber/red per today's state). To the right of the label, in the space currently occupied by 14 dots, render a 96 × 20 px sparkline of the last 30 days' symptom-score (or morning-check composite where symptom-score is null). Sparkline is colored bronze if the trend delta is neutral, green if improving, amber if worsening — reused from `Sparkline.tsx`'s existing `direction` prop. The 14-dot trail moves to a second row below (or is retired if the sparkline covers the same signal). Total strip height: 32 px (was 20 px). On tap: opens a small sheet with the full 90-day trend + numeric readout. Numeric readout uses tabular-nums.

**R-list compliance.**
- R5 — a sparkline of your own symptom score is not gamification. There's no "days without pain" counter. It's just a shape. If the shape goes up (worse) or down (better), the user reads it as data, not as a scoreboard.
- R8 — sparkline is one series (symptom score), not a composite. The user chose to log those numbers; the engine did not manufacture a proprietary "wellness" number.
- R11 — self only.

**Sample Stitch prompt.**
> The readiness strip at the top of Today is a horizontal two-column row, 32 px tall. Left column: "READINESS" in mono-caps 10 px on a green colored dot. Right column: a 96 × 20 px sparkline showing the last 30 days of symptom-score (single line, 1.5 px stroke, tinted green if the 30-day trend is improving, amber if worsening, bronze if flat). Y-axis unlabeled; sparkline conveys shape not exact values. Small tap-affordance chevron on the far right. Warm-dark ground; sparkline stroke uses `#5FB37A` (improving) or `#E0A63A` (worsening) or `#C89666` (flat). No streak counter, no "N days" label, no big number.

**Ship cost.** S (2 h). Sparkline primitive already exists (30 LoC in `Sparkline.tsx`); the work is (a) wire a selector for `last30SymptomScores` from the log store, (b) update `ReadinessTrail.tsx` to render the sparkline in place of / alongside the dots, (c) add the tap-to-open-sheet with the 90-day version.

**Dependencies.** Existing `Sparkline` primitive. New selector `selectLast30SymptomScores(store)`. No new components required.

---

### Position 3 — In the Extras card (making 8 available drills feel like more than a list)

**Context.** v1's Extras card reads: "8 drills available" as a title, then four chips (Warm-up flow / Shoulder prep / Hip mobility / CNS activation). Visually flat.

**Ideas evaluated:**
- *Mini category-tiles with icon glyphs.* **Ship.** The four drill categories (warm-up, prep, mobility, activation) have natural glyph associations — Unicode geometric or lucide icons. Turning chips into small tiled affordances (glyph + name + drill-count) gives the card visual identity without violating R1.
- *"N recovered today" ring.* **Reject.** This is the score-donut pattern in miniature. Also "recovered" is a fake composite Terav doesn't have data for.
- *Cumulative-time visual bar.* **Reject.** Extras are optional; visualizing "time spent" implies a target, which implies a goal, which implies streak/completion which trips R5. Optional-content should stay optional-looking.
- *Category drill-count bars* (small horizontal bar showing how many drills exist in each category). **Weak.** Redundant with the count next to the category label. Skip.

**Verdict:** SHIP (mini category tiles with glyphs + counts).

**Concrete description.**
The Extras card becomes a 2 × 2 grid of small drill-category tiles (~150 × 64 px each on 393 mobile, 12 px gutter). Each tile shows: a category glyph (lucide icon at 20 px, category-tinted — bronze for CNS activation, slate for mobility, green for prep, muted for warm-up) in the top-left; the category name at 14 px semibold; "N drills" at 11 px mono-caps muted. Tapping a tile navigates to `/extras/[category]`. The card title becomes just "Extras · 8 available" as a mono-caps eyebrow; the tiles ARE the content. No CTA button on Extras — the tiles are the taps.

**R-list compliance.**
- R1 — glyphs are lucide vector icons, not photography.
- R2 — category-tint colors reuse existing tokens (bronze, slate, green, muted). No new accent introduced.
- R5 — no completion tracking, no "3/8 done today" counter, no badges. The tiles show what exists, not what you've achieved.

**Sample Stitch prompt.**
> The Extras card is a 2×2 grid of small drill-category tiles at ~150 × 64 px each with 12 px gutters. Each tile has a warm-dark surface `#16181C` (visually lower elevation than the workout hero at `#20232A`), a lucide category icon at 20 px in the top-left corner tinted by category (bronze `#C89666` for CNS activation, slate `#79B8C4` for mobility, green `#5FB37A` for prep, muted `#8b8f98` for warm-up), the category name at 14 px semibold, and "N drills" in 11 px mono-caps muted below. The card title is just "Extras · 8 available" as a mono-caps eyebrow at the top of the card. No filled button; each tile is the tap target. No completion badges, no "you did N today" counters.

**Ship cost.** S (3 h). Refactor `ExtrasCard` to render a 2×2 grid instead of a chip row. Category glyphs are already in `CATEGORY_META` (per programs/page.tsx pattern) or need a small mapping added.

**Dependencies.** Small new: category-tile subcomponent (`DrillCategoryTile.tsx`). Reuses lucide icons + existing category tint tokens.

---

### Position 4 — NEW section that doesn't exist yet on Today

**Context.** The founder gave us a menu: current-week micro-heatmap 7×3, this-arc's-progress horizontal bar showing week X/N, trending-metrics strip with 2-3 sparklines. Ranked below with verdicts.

**Ideas evaluated:**
- *Current-week micro-heatmap 7×3.* **Reject.** Redundant with Position 1's weekly session strip. Same information (day × completion) at higher visual cost.
- *"This arc's progress" horizontal bar showing week X/N.* **Ship.** This is the piece that gives Today a *narrative* — "you're in week 3 of a 6-week arc" is currently a caption inside the workout card ("Cycle 2 · week 3 of 4") but should be its own object because the arc is the whole point of Terav. A dedicated "arc progress" strip carries the focus-improvement mission that Terav's positioning depends on. Founder literally called out "focused-improvement, not full training plan" in the project memory — the arc bar IS that positioning made visible.
- *"Your PR streak."* **Reject** (R5, streak).
- *Trending metrics strip showing 2-3 sparklines of top metrics.* **Ship as Phase 2.** Genuinely engaging — 2-3 mini sparklines showing top-signal metrics for the active program (e.g., strength: top set weight sparkline / conditioning: 500m row pace sparkline / rehab: symptom score sparkline). But this requires per-program *hero-metric selection* logic, which isn't authored in `program.json` yet. Add a `hero_metrics: [metric_id]` field per program (2-3 entries), then wire on Today below the workout card. Cost is Medium and it depends on program-schema evolution, so ship after arc-bar.

**Verdict:** SHIP arc-progress bar (Phase 1). SHIP trending-metrics strip (Phase 2, requires schema field).

**Concrete description — Arc progress bar (Phase 1).**
A new full-width strip above the workout hero card (or immediately below the readiness strip). Renders as:
- Left: program name at 14 px semibold ("Engine Builder Block 1") with the small program-category glyph on its left.
- Middle: a 200 × 6 px bar with bronze fill up to the current week's fraction. Segment ticks every 1 week (so a 6-week arc has 5 tick marks). Current-week position marked with a slightly taller bronze notch.
- Right: "week 3 / 6" mono-numeric 12 px on the right.

Below the bar (12 px muted): "Next retest: week 5" or "Cycle-end 5RM confirm at week 6" — a small forward-looking caption pulled from the program's retest schedule.

For multi-track users, the strip becomes stacked — one row per active program, each with its own bar (Batch F4 aligned).

**Concrete description — Trending metrics (Phase 2).**
A horizontal-scrollable strip of 2-3 mini metric cards, each ~120 × 72 px. Card contents: metric name at 11 px mono-caps (e.g., "TOP SET WEIGHT"), current value in mono 18 px ("152.5 KG"), sparkline 96 × 20 px below showing 12 recent readings tinted green/amber/bronze per direction. Tapping a card goes to `/progress#{metric_id}` deep link. Only renders when the active program has a `hero_metrics` array with ≥ 1 entry.

**R-list compliance.**
- R5 — the arc bar shows progress *toward an authored program endpoint*, not a self-imposed streak. Week 3 of 6 is a *plan*, not a game. The bar goes up as time passes (calendar-driven), not as the user "wins." No congratulations, no "keep going!" language, no badges at completion — at week 6 the bar is full and the card either shows retest-time or the next arc.
- R8 — the arc bar is a single-metric progress (weeks elapsed / weeks total), not a proprietary composite score. Trending metrics are the raw values the user logged.
- R11 — self only.

**Sample Stitch prompt (arc bar, Phase 1).**
> Above the workout hero on Today, add a horizontal "arc progress" strip. Full-width card at `#16181C` surface (lower elevation than the workout hero at `#20232A`), 60 px tall total. Left side: a small category glyph (chevron for endurance, square for strength, triangle for skill) + program name "Engine Builder Block 1" at 14 px semibold. Middle: a 200 × 6 px progress bar filled bronze `#C89666` to 50%, with 1 px slate segment ticks at each week boundary (so 6-week arc has 5 ticks), and a slightly taller bronze notch at the current-week position. Right: "week 3 / 6" in mono-numeric 12 px. Below the bar in 12 px muted: "Next retest: week 5." No motion, no gradient wash, no percentage number, no "streak" wording.

**Ship cost.** M (5 h) for arc-progress bar (Phase 1). M (6 h) for trending metrics (Phase 2, includes program-schema addition + wire + backfill hero_metrics for 5 shipping programs).

**Dependencies.**
- Phase 1: new `ArcProgressStrip.tsx` component. Reads `program.duration_weeks`, `program.start_date`, `program.retest_schedule` from existing program.json. Adds selector `selectArcProgress(programId)`.
- Phase 2: `program.json` schema addition — `hero_metrics: [metric_id, metric_id, metric_id]` (2-3 entries), authored per program. `TrendingMetricsStrip.tsx` component. Uses existing `Sparkline` primitive.

---

### Position 5 — Program preview card — viz next to "What you'll achieve"

**Context.** Program preview page currently shows "What you'll achieve" as a `DashboardBlock` with prose (see `ProgramPreviewClient.tsx` around section 2 of 4). Prose describes outcomes ("you'll add 10 kg to your 5RM squat over 8 weeks"), but there's no visual trajectory.

**Ideas evaluated:**
- *Trajectory line.* **Ship (constrained).** A small line chart showing the *authored expected progression* of the program's primary metric (e.g., 5RM squat over 8 weeks) with a subtle target-line at the end. This turns a promise into a shape. But there's a real risk: if the trajectory is TOO precise ("+2.5 kg every week"), it becomes an expectation the engine can't honor for every user. Mitigation: render as a shaded confidence range, not a single line — showing typical outcomes as a band, with the median as a dashed line. Honest about variability.
- *Users-completed count.* **Reject.** Founder rejected cross-user aggregation (R11). No "3,412 users completed this" language.
- *Simple horizontal outcome bars* (each authored outcome as a bar, ~150 px, labeled with the target metric + delta). **Ship.** Simpler alternative if the trajectory is too speculative — each "What you'll achieve" bullet becomes: metric name + baseline value + target value + a horizontal delta arrow. Data-shape without projection.

**Verdict:** SHIP outcome bars (simpler, more honest). DEFER trajectory-band as a Phase 2 experiment.

**Concrete description — Outcome bars (Phase 1).**
The "What you'll achieve" section renders as a vertical stack of 2-3 outcome rows. Each row is a full-width horizontal composition:
- Metric name at 15 px semibold ("Top set 5RM back squat")
- Below it, a horizontal composition: baseline value on the left (mono 14 px, "120 kg"), a subtle 100 × 4 px slate track with a bronze filled fill from baseline to target position, target value on the right (mono 14 px, "140 kg"), and a small "+20 kg" delta pill floating above the fill line.
- Below the bar, 11 px mono-caps muted: "TYPICAL RANGE +15 TO +25 KG · 8 WEEKS".

The bar isn't a *live progress bar* (the user hasn't started); it's a *visual promise*. The fill represents the expected outcome, statically.

**R-list compliance.**
- R5 — no gamification. This is a spec-sheet visualization of what the program aims for, not a progress-tracker.
- R11 — no cross-user aggregation number. "TYPICAL RANGE" is authored per program from the founder's / evidence base (Rhea 2003 etc.), not aggregated from other Terav users.

**Sample Stitch prompt.**
> On the program preview page, the "What you'll achieve" section renders as a stack of 2-3 outcome rows. Each row: metric name at 15 px semibold ("Top set 5RM back squat"), then a horizontal 100 × 4 px composition — baseline mono-numeric on the left ("120 kg"), a slate track with a bronze `#C89666` filled progress from baseline to target, target mono-numeric on the right ("140 kg"), and a small "+20 kg" bronze-outlined pill floating above the bar. Below the bar in 11 px mono-caps muted: "TYPICAL RANGE +15 TO +25 KG · 8 WEEKS". Warm-dark card ground `#20232A`. No animation, no "click to progress" — this is a static promise of the outcome.

**Ship cost.** M (4 h). New `OutcomeBar.tsx` component. Requires per-program `expected_outcomes: [{metric_id, baseline_typical, target_typical, range_low, range_high, timeframe_weeks}]` array in `program.json`. Author 2-3 entries for each of the 5 shipping programs.

**Dependencies.** `program.json` schema addition. `OutcomeBar.tsx` component (~40 LoC). No new dependencies.

---

### Position 6 — Progress page — full viz treatment

**Context.** Progress currently ships one real sparkline (SymptomLoadChart in `progress/`), one adherence bar, some retest metric cards as text-only, milestones as prose. The deep review's Move C proposed wiring `Sparkline` into every retest card + humanizing exercise_ids + adding milestone progress bars. That still stands. This position expands that to a "not-gamified-but-visual" full treatment.

**Ideas evaluated:**
- *Weekly heatmap.* **Ship.** A 7 × 12 grid (7 days × 12 weeks = last 12 weeks of session activity) at the top of Progress. Each cell is 20 × 20 px tinted by session-completed *and* symptom state (green = done + felt good, amber = done + amber symptoms, red = done + red symptoms, muted = rest day, slate outline = missed). This is the GitHub-contributions pattern applied honestly — not "keep the streak green" but "here's the shape of your last 12 weeks." Reject the "commit graph" gamification framing; keep the heatmap-as-shape framing.
- *Per-metric sparklines with target-line overlay.* **Ship.** Already proposed in Move C. Every retest metric gets a 96 × 24 px inline sparkline + a subtle horizontal target-line at the authored target value. When current reading crosses the target-line, the target-line becomes bronze (target hit) instead of muted (target pending) — no confetti, no toast, just the line color.
- *Program-arc timeline.* **Ship (extends Position 4's arc bar).** On Progress, the arc bar expands to full width and shows retest waypoints (week 3, week 5, week 8) as diamond markers on the timeline. Tapping a waypoint scrolls to that retest's metric card.
- *Correlation view (weight × sleep, load × symptoms).* **Defer.** F5 in the master list; requires >= 8 weeks of paired data. Not universal.

**Verdict:** SHIP weekly heatmap + sparkline-with-target-line + expanded arc timeline. DEFER correlation.

**Concrete description.**
Progress becomes a genuinely dense viz page with the following top-to-bottom composition:
1. **Weekly heatmap** — 7 × 12 grid at the top of the page, ~280 × 240 px total, 20 px cells with 2 px gaps, rounded 3 px. Cells tinted per the state rules above. Day-of-week labels in mono-caps 10 px along the top; week labels ("Wk-11 · Wk-8 · Wk-4 · Wk-0") along the left in mono 10 px at every 4th week. On tap: opens a sheet with that day's session + morning-check + symptoms detail.
2. **Arc timeline** (per active program) — full-width horizontal timeline with retest waypoints as small diamond markers. Currently-live retest waypoint pulses subtly on load (200 ms scale-in).
3. **Retest metric cards** — each metric renders as a card with metric name + BASELINE / CURRENT / Δ columns + a 128 × 32 px sparkline with a horizontal target-line at authored target value. Line tinted bronze (hit) or muted-dashed (pending).
4. **Milestone progress bars** — as Move C proposed. Target on the right, current on the left, bronze fill.
5. **Symptom vs. load chart** (existing SymptomLoadChart, kept) — the one real chart in the app; keep as-is.
6. **Per-track adherence** (existing PerProgramAdherenceCard, kept).

**R-list compliance.**
- R5 — the heatmap does NOT reward streaks. It doesn't say "you did 5 in a row" or "keep the green going." A missed day is a slate outline, not a red-shaming cell. The page is a *record*, not a game.
- R8 — no proprietary composite. Each cell renders raw self-reported symptom state + boolean session-completed. No "readiness score" summarization.
- R11 — self-only.

**Sample Stitch prompt (Progress full viz).**
> Design the Progress page for a warm-dark fitness app at 393 × 852. At the top, a weekly heatmap: 7 columns (M T W T F S S in mono-caps 10 px above) × 12 rows (last 12 weeks). Each cell 20 × 20 px, 2 px gaps, 3 px corner radius. Cell colors: `#5FB37A` (green — session done, felt good), `#E0A63A` (amber — session done, amber symptoms), `#E5654B` (red — session done, red symptoms), `#20232A` fill (rest day, muted), 1 px `#3a3d45` slate hairline outline (scheduled but missed). Below the heatmap, an "arc timeline" horizontal strip showing the current 8-week program with diamond markers at retest waypoints (week 3, week 5, week 8) and a bronze fill from start to current position. Below that, 2-3 retest metric cards each with metric name, three-column BASELINE / CURRENT / Δ text, and a 128 × 32 px inline sparkline showing the last 12 readings with a horizontal 1 px dashed target-line at the authored target value — line goes bronze when a reading crosses target. Milestone section below with 200 × 8 px progress bars. Everything on warm-dark surfaces `#16181C` / `#20232A`. No streak counters, no "keep it going!" text, no medals.

**Ship cost.** L (10-12 h) as a full package. Break into three shippable slices:
- L1 (4 h): weekly heatmap component + selector + tap-sheet. New `WeeklyHeatmap.tsx`.
- L2 (4 h): retest sparkline + target-line overlay wired into every retest card. Extends existing `Sparkline.tsx` with a `targetValue` prop that renders a dashed horizontal line.
- L3 (4 h): arc timeline (expands Position 4's arc bar) + humanize-id sweep (deep review Move C).

**Dependencies.**
- New `WeeklyHeatmap.tsx` component (~80 LoC).
- Extension to `Sparkline.tsx` for target-line overlay (~15 LoC added).
- Selector `selectLast12WeeksSessionState(store)` — reads existing log entries, no new plumbing.
- Retest metric cards need a `target_value` field per metric (partially present in `program.json`; audit and backfill).

---

## Section 2 — Meta-notes on the viz layer as a whole

### Palette usage summary (accent-economy audit)

The six viz elements above use only these colors (all existing tokens):
- **Bronze `#C89666`** — session-completed, arc progress fill, target-hit sparkline, tile glyph for CNS activation.
- **Slate `#79B8C4`** — scheduled-but-not-yet-done, skill/mobility tile glyph, hairline outlines.
- **Green `#5FB37A`** — improving trend, done+felt-good heatmap cell, prep tile glyph.
- **Amber `#E0A63A`** — worsening trend, done+amber-symptoms heatmap cell, INTAKE PENDING chip (existing).
- **Red `#E5654B`** — red-symptoms heatmap cell only. Not used on Today's viz layer.
- **Muted `#8b8f98`** — rest days, dashed target-lines, pending chips.

**R2 compliance:** no new accent introduced. Bronze remains the sole CTA color; semantic tokens (green/amber/red) remain state-only. The viz layer stays inside the shipped palette.

### Motion budget

- **Sparkline draw** (all sparklines): 400 ms `ease-out` stroke-dashoffset animation on mount. Motion-safe respected.
- **Heatmap cells** (Progress): 20 ms stagger on mount, 150 ms fade-in per cell. Total 60 × 20 = 1200 ms — feels alive, respects `prefers-reduced-motion` (renders solid).
- **Arc bar fill** (Today + Progress): 300 ms `ease-out` width transition on mount.
- **Outcome bars** (Program preview): static; no motion (this is a promise, not a trend).
- **Weekly session strip** (Today): static cells; no motion.

Total motion additions: ~4 places. This is well within the "app should breathe once, not perform" ceiling the deep review named.

### What this brief explicitly does NOT propose

- **A hero score donut** — R8.
- **A "days in a row" streak counter** anywhere — R5.
- **Photography or illustrations** — R1.
- **A leaderboard or peer comparison** — R11.
- **A "wellness score" or "readiness percentage"** anywhere — R8 + honesty.
- **Confetti, medals, badges, "great job!" toasts** — R5.
- **Trajectory projections on Today** ("you'll hit 160 kg in 4 weeks") — false-promise risk; keep projections on the Programs preview page as *typical ranges* (with a range band), not on Today as *your prediction*.
- **Charts that aggregate other Terav users' data** — R11.

### Bundle cost estimate

- Position 1 (Weekly session strip): S (2-3 h) — new component only, no dep.
- Position 2 (Symptom sparkline on readiness): S (2 h) — reuses Sparkline primitive.
- Position 3 (Extras category tiles): S (3 h) — refactor of ExtrasCard.
- Position 4a (Arc progress bar, Today): M (5 h) — new component, reads existing program.json.
- Position 4b (Trending metrics, Phase 2): M (6 h) — program.json schema addition.
- Position 5 (Outcome bars, Program preview): M (4 h) — program.json schema addition.
- Position 6 (Progress full viz): L (10-12 h in three slices) — largest addition.

**Total: ~32-35 h** across all six positions if shipped as one wave. **Recommended batching:**
- **Batch 36-viz-A (12 h):** Positions 1 + 2 + 4a. All on Today. This is the wave that answers founder's "more visuals" ask directly. If Today feels engaging after this, other positions are Phase 2.
- **Batch 36-viz-B (7 h):** Position 3 + Position 5. Extras tiles + Program preview outcome bars. Same batch since they're both small.
- **Batch 37-viz-C (10-12 h):** Position 6 (Progress full viz). Ships after Today's viz layer proves the pattern.
- **Batch 38-viz-D (6 h):** Position 4b (Trending metrics, Phase 2). Ships after program.json has hero_metrics fields authored.

---

## Section 3 — v1 skeleton verdict + composition parity

Restating cleanly for the record:

**v1's underlying skeleton is directionally correct.** The letter-prefix block list, the one-hero-per-view pattern, the ambient dot trail, the secondary Extras card, the full-width bronze CTA — all of this holds. The composition is not the failure; the viz density is.

**What v1 needs to *become* v-ship:**
- Inject the weekly session strip inside the hero card (Position 1).
- Replace the dot trail with sparkline + retain small state dot label (Position 2).
- Convert Extras chips into a 2×2 tile grid (Position 3).
- Add an arc progress bar above the workout hero (Position 4a).

That's four viz additions on Today. After those four, the founder walks the app and sees: an arc bar (what am I on), a readiness sparkline (how am I trending), a weekly session strip (where am I in the week), letter-prefix block list (what I'm doing today), category-tinted extras tiles (what else is available). Every one of those is *engaging honest data*. None of them are gamified. None of them are score-donuts. All of them stay inside the existing palette + type ramp.

**Founder verdict test:** if after Batch 36-viz-A ships, the founder still says "clean but not many visuals," the diagnosis is wrong and we need a much bigger swing (illustration, photography, animated hero — all currently prohibited). If the founder says "yes, this," then Positions 3 + 5 + 6 follow in Batches 36-viz-B and 37-viz-C. That's the test.

**One-sentence recommendation:** ship Batch 36-viz-A (Positions 1 + 2 + 4a on Today) as the response to founder's "more visuals" ask; hold the rest until Today's viz layer proves the pattern; do not add a hero score donut, streaks, or photography no matter how tempting the request.

---

## Files that would need edits (for handoff to the implementation agent)

**New components:**
- `next-app/src/components/workout/WeeklySessionStrip.tsx` (Position 1)
- `next-app/src/components/workout/ArcProgressStrip.tsx` (Position 4a)
- `next-app/src/components/workout/DrillCategoryTile.tsx` (Position 3)
- `next-app/src/components/programs/OutcomeBar.tsx` (Position 5)
- `next-app/src/components/progress/WeeklyHeatmap.tsx` (Position 6)
- `next-app/src/components/progress/TrendingMetricsStrip.tsx` (Position 4b, Phase 2)

**Modified components:**
- `next-app/src/components/workout/ReadinessTrail.tsx` — swap dot trail for sparkline layout (Position 2)
- `next-app/src/components/workout/HeroStateCard.tsx` — host WeeklySessionStrip + ArcProgressStrip
- `next-app/src/components/charts/Sparkline.tsx` — add `targetValue?: number` prop for horizontal target-line (Position 6)
- `next-app/src/components/progress/RetestMetricsPanel.tsx` — wire Sparkline + target-line per metric card
- `next-app/src/app/progress/page.tsx` — host WeeklyHeatmap + expanded arc timeline
- `next-app/src/app/programs/[slug]/ProgramPreviewClient.tsx` — replace prose "What you'll achieve" with OutcomeBar stack

**Schema additions (`data/program.json` per-program):**
- `hero_metrics: [metric_id, metric_id, metric_id]` — 2-3 top-signal metrics for Trending strip (Phase 2, Position 4b)
- `expected_outcomes: [{metric_id, baseline_typical, target_typical, range_low, range_high, timeframe_weeks}]` — for OutcomeBar (Position 5)
- Verify `duration_weeks`, `retest_schedule` exist (Position 4a)

**Selectors / lib additions:**
- `selectWeekSessionStates(store, weekStart)` (Position 1)
- `selectLast30SymptomScores(store)` (Position 2)
- `selectArcProgress(store, programId)` (Position 4a)
- `selectLast12WeeksSessionState(store)` (Position 6)

Total: 6 new components, 6 modified components, 2 schema fields, 4 selectors. This is the shape of the work.
