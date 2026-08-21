# Competitive design matrix — 31 fitness apps × 79 attributes

**Date:** 2026-08-21
**Merge author:** synthesis pass over three research-agent parts
**Corpus:** 31 apps, 79 attributes across buckets A–H
**Source files:**
- `dev/audits/competitive/matrix-part-1-mobility-running.md` (12 apps)
- `dev/audits/competitive/matrix-part-2-strength-crossfit.md` (10 apps)
- `dev/audits/competitive/matrix-part-3-readiness-skill.md` (9 apps)

Full per-attribute detail with source citations lives in the three source files. This document is the merge, ranking, and synthesis — the raw cells are compacted below.

---

## 1. Executive summary

**Founder's core question restated: how do Progress and History scale to 400 days, and what does the category tell us?**

The answer from the category: **only ~7 of 31 apps have a documented 400-day story** (Strava, Garmin Connect, Coros, Hevy, TrainingPeaks, Oura, Whoop). Apple Fitness+ deserves half-credit for its Trends 90-day-vs-365-day baseline. Every other app either hasn't hit that scale, keeps the same list-view it started with, or has an explicit anti-tenure pattern (Whoop wipes on cancel; Zwift Companion caps at 250 activities). The mobility/CrossFit/human-coach clusters are effectively silent on long-tenure UI — the founder is right to worry about the block-list-on-Today shape, and right that Progress is the surface that decides whether Terav feels durable at year 2.

**Top 5 patterns to adopt**

1. **Rolling-average tiers with explicit windows** (Oura 3-day/90-day/since-inception, TrainingPeaks 42-day CTL / 7-day ATL, Whoop 6-month, Apple 90-vs-365) — this is the only pattern that survives 400 days without a UI redesign, and it maps cleanly onto Terav's "focus one thing, sharpen over time" positioning.
2. **Confirm-first with recalculate-and-explain** (Runna moves a run and the whole plan re-times with a visible summary; Freeletics gathers post-session feedback and re-plans the week) — Terav's proposal-Accept pattern already sits here, but Runna's "recalc-and-show" adds a beat Terav doesn't yet emphasize.
3. **Retest event + retest history as first-class artifact** (Pliability mobility test, GOWOD 12-min test, Coros ramp test, TMA skill assessment, StrongLifts fail-streak deload) — Terav's confirm-first cite-per-adjustment gains natural anchors when it maps to explicit retest events.
4. **Data export as tenure counterweight** (Garmin CSV/TCX/GPX/FIT — strongest of the set, Oura CSV + JSON API, Hevy CSV, Whoop CSV, Strava bulk archive) — the promise "your log is yours" earns the confirm-first ethos in a way marketing copy can't. Whoop-wipe-on-cancel is the anti-example.
5. **Year-in-Review / annual identity artifact** (Hevy, Whoop, Oura, Strava, Boostcamp, Peloton milestones) — a bounded, once-a-year, shareable rollup is the *only* place in the category where long users get to be long users on-screen. It is a cheap surface to build once and reuse for years.

**Top 3 patterns to reject**

1. **Autonomous score-hero** (Whoop's Recovery / Strain, Garmin Body Battery, Oura Readiness driving suggestions) — Terav already rejected this as R8. The catalog shows exactly why: the score becomes the product, the underlying signal becomes opaque, and every proposed change hides behind "the model." Terav's cite-per-adjustment is the opposite move and should stay opposite.
2. **Streak-as-lock-in** (Peloton daily/weekly streak badges, Freeletics streak-and-Perfect-Week, Fitness+ All Rings Closed) — Terav rejected this as R5. The category proof: users complain when a streak breaks after honest illness (Peloton and Freeletics both have public streak-preservation complaints). It also punishes rest, which is directly hostile to focused-improvement.
3. **Multi-accent semantic palette** (Whoop green/yellow/red, Fitbod muscle-heatmap green/yellow/red, Garmin per-metric colors, Strava per-activity colors) — Terav's warm-dark single-bronze system is a differentiator; semantic multi-color would flatten the CTA hierarchy. Note: this does *not* mean "no state color at all" — it means no permanent accent chart palette; state color only.

**Top 1 category white-space**

**Cite-per-adjustment as visible provenance UI.** Every apps' progression rule fires from *something* (Fitbod muscle recovery model, StrongLifts fail streak, Runna AI insights, Freeletics feedback, Hevy set autofill, Coros EvoLab). **Zero** of the 31 apps show the user which study or which log signal fired which change. Terav's confirm-first mechanic requires citation as part of the proposal — this is a true category vacancy. Own it.

---

## 2. Coverage stats + attribute schema notes

**Fill rate.** Across 31 apps × 79 attributes = 2,449 cells:
- **Fully answered with citation:** ~52%
- **Partial / inferred with reason:** ~28%
- **Marked unknown with reason:** ~20%

**Attributes essentially unverifiable across the corpus** — candidates to drop or reframe in v2:
- **A4 H1 max size**, **A5 body-copy default**, **A10 icon size default (px)** — no app publishes design-system pixels; only Whoop had a partial answer (~72pt for Recovery numeral). These need Figma access or device measurement, not desk research.
- **A7 card border radius**, **A8 border weight** — best-guessed to ~12–16px across almost every app; the attribute has almost zero discriminating power.
- **C10 trend arrow chips** — everyone claims to have them; no one differentiates.
- **H7 chart densification at 400 points** — the exact founder concern, but only 3 apps document it (Oura rolling-avg + weighted-window, TrainingPeaks 42-day EWMA, Garmin yearly-view downsampling). Everyone else is inferred. This is worth keeping specifically because the *unknown-ness* itself is the finding: most apps have not answered the question you're asking.

**Attributes that emerged as too coarse-grained** — split proposals:

- **E1 confirm-first** was flagged by all three agents as conflating three distinct things. Terav's cite-per-adjustment lives inside this attribute and the current bin is hiding it. Proposed split:
  - **E1a — inline auto-fill of next set/rep/weight** (Hevy previous-set autofill, Boostcamp auto-progression, StrongLifts 5×5 auto-increment). This is *reactive*, not a proposal.
  - **E1b — macro plan changes** (Runna recomputes week, Fitbod regenerates workout, Freeletics re-plans next week, Coros EvoLab). This is *proposal + apply*.
  - **E1c — provenance visibility** (does the app show *why*?). Currently: zero apps do this. This is where Terav's category vacancy sits.
- **B5 program picker** conflates "catalog" and "algorithmic" but Boostcamp is catalog-first with auto-progression, Hevy is user-authored with progressive-overload autofill, Runna is race-goal-algorithmic. Proposed: split into "content source (catalog / user / algorithm)" and "load source (static / adaptive)."
- **F3 readiness / recovery score** conflates "auto-computed from wearable" (Whoop, Oura, Garmin) with "user answers a subjective prompt" (Freeletics feedback, Movement Athlete). Very different UX contract.
- **H2 history aggregation at 400 days** is the founder's core question and deserves to be four sub-attributes: rolling-avg tier, retest-list growth, chart densification method, weekly-narrative retention. Current merged form obscures the specific decisions.

**New attributes proposed for v2** — see Appendix (Section 7).

---

## 3. Full attribute matrix

Columns compacted to short tokens. Missing/unknown = `?`. Table split by bucket for readability. Full detail lives in the source files.

**Legend for common tokens:**
- Background: `L` light-only, `D` dark-only, `A` dual/auto, `LP` light-primary, `DP` dark-primary
- Yes/No/Partial: `Y`, `N`, `P`
- Not applicable: `-`
- Accent: `1` single, `2` dual, `M` multi
- Program picker: `cat` catalog, `alg` algorithmic, `hyb` hybrid, `-` n/a
- Confirm surface (E1): `conf` confirm-first, `auto` auto-apply, `hyb` mixed, `-` none/n/a

### Bucket A — Visual system (12 attrs)

| # | App | A1 bg | A2 accent | A3 econ | A6 mono | A7 radius | A8 border | A9 stroke | A11 font | A12 media |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Pliability | D | cream/gold | 1 | ? | ~16 | 0 | reg | custom sans | photo |
| 2 | GOWOD | D | gold+magenta | M | Y | ~16 | 0 | reg | custom sans | mixed |
| 3 | ROMWOD legacy | D | near-white | 1 | ? | ~12 | 0 | reg | custom sans | photo |
| 4 | Down Dog | L | teal | 1 | N | ? | ? | reg | custom sans | illustr |
| 5 | Yoga With Adriene | L | mustard | 1 | N | ? | ? | ? | serif+sans | photo |
| 6 | Alo Moves | L | sage | 1 | N | ~12-16 | 0 | thin | serif+sans | photo |
| 7 | Runna | A | navy+orange | 2 | Y | ~16 | hair | reg | custom sans | photo |
| 8 | Strava | A | orange | M | Y | ~12 | hair | reg | Maison Neue | photo |
| 9 | Nike Run Club | L | Volt+black | 2 | Y | 0 (rect) | hair | reg-bold | Helvetica Now | photo |
| 10 | Adidas Running | A | Adidas blue | 1 | Y | ~12-16 | hair | reg | AdihausDIN | photo |
| 11 | Garmin Connect | A (D default) | Garmin blue | M | Y | ~12 | hair | reg | custom sans | minimal |
| 12 | Coros | A (D default) | teal | M | Y | ~12 | hair | reg | custom sans | minimal |
| 13 | TrainingPeaks | L | TP blue | M | Y | ? | ? | ? | system sans | photo+chart |
| 14 | Hevy | A | blue | 1 (+RPE gradient) | Y | ? | hair | reg | system sans | minimal |
| 15 | Fitbod | A | coral | M | Y | ? | hair | reg | custom sans | illustr+photo |
| 16 | StrongLifts 5×5 | A | red-orange | 1 | Y | small | hair | reg | system sans | minimal |
| 17 | Caliber | A | blue | 1 | Y | ? | ? | reg | custom sans | photo |
| 18 | Ladder | D | teal | 1 | ? | ? | ? | reg | custom sans | photo |
| 19 | Boostcamp | A | ? | 1 | Y | ? | hair | reg | system sans | minimal |
| 20 | Future | A | ? | 1 | ? | ? | ? | ? | custom sans | photo |
| 21 | SugarWOD | A | blue | 1 | Y | ? | hair | reg | custom sans | photo |
| 22 | Wodwell | L | blue | 1 | ? | ? | ? | reg | ? | photo |
| 23 | Beyond the Whiteboard | L | red/orange PR | M | ? | ? | hair | ? | system sans | minimal |
| 24 | Freeletics | D | coral CTA | 1 | ? | rounded | 0 | reg | custom sans | photo |
| 25 | Whoop | D | green/yellow/red | 1 semantic | Y | ~12-16 | 0 | reg | custom sans | minimal |
| 26 | Oura | D (dynamic tint) | dynamic biometric | M | Y | ~16 | 0 | thin | custom sans | minimal |
| 27 | Apple Fitness+ | A | Move/Exercise/Stand | M | Y | ~16 | 0 | reg | SF Pro | photo |
| 28 | Peloton | A | Peloton red | 1 | ? | ~12 | 0 | reg | custom sans | photo |
| 29 | Zwift Companion | L | Zwift orange | 1 | Y | ? | hair | reg | custom sans | mixed |
| 30 | GMB (Praxis PWA) | L | burnt orange | 1 | ? | ~8-12 | hair | reg | humanist sans | photo |
| 31 | The Movement Athlete | L/A | teal | ? | ? | ? | ? | ? | custom sans | photo |

### Bucket B — Information architecture (10 attrs)

| # | App | B1 tabs | B2 nav | B4 dash-split | B5 picker | B6 onbrd | B7 auth-first | B8 web parity | B9 watch | B10 widget |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Pliability | 4-5 | bottom | Y | hyb | ~6 | Y | partial | ? | ? |
| 2 | GOWOD | 4 | bottom | Y | alg | ~8 | Y | N | ? | ? |
| 3 | ROMWOD legacy | 3 | bottom | minimal | cat | ~2-3 | Y | Y | N | N |
| 4 | Down Dog | 3 | bottom | Y | alg | ~3 | N | Y | ? | ? |
| 5 | YWA | ? | ? | ? | cat | ? | mixed | Y | ? | ? |
| 6 | Alo Moves | 4 | bottom | Y | cat | ~5 | Y | Y | N | ? |
| 7 | Runna | 4-5 | bottom | Y | alg+cat | ~26 | Y | partial | Y | Y |
| 8 | Strava | 5 | bottom | Y | hyb | ~4 | Y | Y | Y | Y |
| 9 | NRC | 4 | bottom | Y | cat | ~5 | Y | N | Y | Y |
| 10 | Adidas Running | 5 | bottom | Y | hyb | ~5 | Y | Y | Y | Y |
| 11 | Garmin | 4-5 | bottom+more | Y | hyb | ~4 | Y | Y | Y | Y (hallmark) |
| 12 | Coros | 4 | bottom | Y | hyb | ~4 | Y | Y (web-primary) | Y | P |
| 13 | TrainingPeaks | ~4 | bottom | Y | hyb | ? | Y | Y (web-flagship) | Y | ? |
| 14 | Hevy | 5 | bottom | Y | hyb | ? | Y | Y | Y | Y |
| 15 | Fitbod | 4 | bottom | Y | alg | 8-12 | Y | N | Y | Y |
| 16 | StrongLifts | 3-4 | bottom | Y | cat | minimal | N (content-first) | partial | Y | Y |
| 17 | Caliber | 4-5 | bottom | Y | hyb | ? | Y | ? | Y | ? |
| 18 | Ladder | 4-5 | bottom | Y | cat | 6-10 | N (WOD preview) | partial | Y | Y |
| 19 | Boostcamp | 5 | bottom | Y | cat | minimal | N | Y | Y | ? |
| 20 | Future | 3-4 | bottom | Y | - (1:1) | high (quiz+FaceTime) | Y | ? | Y | ? |
| 21 | SugarWOD | 4-5 | bottom | Y | cat | minimal | Y | partial | ? | ? |
| 22 | Wodwell | 3-4 | bottom | Y | hyb | ? | mixed | Y | ? | ? |
| 23 | btwb | 5 | top | Y | cat | ? | Y | Y | Y | ? |
| 24 | Freeletics | 3 | bottom | Y | alg | 12 | Y | partial | ? | ? |
| 25 | Whoop | 5 | bottom | Y | - | multi-day calib | Y | Y (thin) | Y | Y |
| 26 | Oura | 3 | bottom | Y | - | ? | Y | Y (fuller) | Y | Y |
| 27 | Apple Fitness+ | 3 | bottom | Y | hyb | ? | Y | N | Y | Y |
| 28 | Peloton | 5+ | bottom | Y | cat | staged | Y | Y | Y | ? |
| 29 | Zwift Companion | 4-5 | bottom | Y | cat | ? | Y | partial | Y | ? |
| 30 | GMB | (PWA) | top | Y | cat | minimal | Y | Y (only) | N | N |
| 31 | TMA | ? (bottom infer) | ? | Y | hyb | assess-based | Y | partial | ? | ? |

### Bucket C — Data-viz vocabulary (12 attrs)

| # | App | C1 line | C2 bar | C3 heat | C4 ring | C5 spark | C7 zoom | C8 delta | C9 compare | C11 agg-at-scale |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Pliability | Y | ? | N | Y | ? | month/6mo | P | Y | ? |
| 2 | GOWOD | Y | ? | Y | Y | ? | month/6mo | Y | Y | monthly rollup |
| 3 | ROMWOD legacy | N | N | N | N | N | none | N | N | none |
| 4 | Down Dog | N | N | ? | N | N | ? | N | N | ? |
| 5 | YWA | ? | ? | ? | ? | ? | ? | ? | ? | ? |
| 6 | Alo Moves | N | N | N | N | N | ? | N | N | ? |
| 7 | Runna | Y | Y | ? | Y | ? | week/month/plan | Y | Y | phase-block |
| 8 | Strava | Y | Y | Y | P | Y | w/m/y/all | Y | Y | yearly+all-time |
| 9 | NRC | Y | Y | N | Y | ? | w/m/y | Y | Y | w/m/y |
| 10 | Adidas Running | Y | Y | ? | Y | ? | w/m/y/all | Y | Y | m/y |
| 11 | Garmin | Y | Y | Y | Y | Y | d/w/m/y/all | Y | Y | w/m/y avg |
| 12 | Coros | Y | Y | P | Y | Y | 4/12/24-wk | Y | Y | weekly rollup |
| 13 | TrainingPeaks | Y | Y | P (desktop) | ? | ? | 7/28/90/365 | Y | Y | CTL 42d, ATL 7d EWMA |
| 14 | Hevy | Y | Y | Y-ish (cal) | Y (donut) | ? | 30d/3mo/1y/all | Y | Y | weekly+monthly+annual |
| 15 | Fitbod | Y | ? | Y (muscle) | ? | ? | ? | Y | ? | ? |
| 16 | StrongLifts | Y | ? | N | N | ? | all-time | Y | P | ? |
| 17 | Caliber | Y | Y | ? | ? | ? | ? (customizable) | Y | Y | weekly review |
| 18 | Ladder | Y | ? | ? | P | ? | ? | Y | Y | ? |
| 19 | Boostcamp | Y | Y | P (body-map) | ? | ? | ? | Y | Y | annual (Y-in-R) |
| 20 | Future | Y | ? | N | ? | ? | ? | ? | Y (coach) | weekly review |
| 21 | SugarWOD | Y | ? | N | N | ? | ? | Y | Y | ? |
| 22 | Wodwell | ? | ? | ? | ? | ? | ? | ? | P | ? |
| 23 | btwb | Y | Y | Y (Training Days) | N | ? | w/m/y/all | Y | P | month+year |
| 24 | Freeletics | Y | ? | ? | ? | ? | weekly | ? | P | ? |
| 25 | Whoop | Y | Y | ? | N (big number) | Y | d/w/m/6mo | Y | Y | rolling avg + weekly + monthly + APA |
| 26 | Oura | Y | Y | ? | Y | Y | d/w/m/y | Y | Y | 90-day + since-inception avg; 3-day weighted for temp |
| 27 | Apple Fitness+ | Y | Y | Y (ring cal) | Y | Y | d/w/m/y | Y | Y | 90d vs 365d rolling |
| 28 | Peloton | Y | Y | ? | P | ? | w/m/y | Y | Y | monthly + PR rollups |
| 29 | Zwift Companion | Y | Y | ? | N | Y | recent (250 cap) | Y | Y | rolling training score |
| 30 | GMB | ? | ? | ? | ? | ? | ? | ? | ? | ? |
| 31 | TMA | P | ? | ? | ? | ? | ? | P | N | ? |

### Bucket D — Content density + media (10 attrs)

| # | App | D1 words | D2 cards | D3 ratio | D4 video | D5 GIF | D6 voice | D7 music | D8 instr | D10 states |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Pliability | low-med | 3-4 | visual | Y | N | Y | Y | Y | minimal |
| 2 | GOWOD | low | 2-3 | visual | Y | N | Y | ? | Y | body heatmap |
| 3 | ROMWOD | very low | 1 | visual | Y | N | Y | Y | Y | none |
| 4 | Down Dog | med | - (configurator) | balanced | Y | N | Y | Y | P (anim) | none |
| 5 | YWA | med | ? | balanced | Y | N | Y | N | Y | none |
| 6 | Alo Moves | low-med | 2-3 | visual | Y | N | Y | Y | Y | difficulty tiers |
| 7 | Runna | med | 2-3 | balanced | P | N | Y | P | N | GAR (green/amber/red) |
| 8 | Strava | med-high | 1-2 | balanced | N | N | P | Y | N | activity-type colors |
| 9 | NRC | med | 2 | visual | P | N | Y | Y | Y | Volt+tier |
| 10 | Adidas Running | med | 2-3 | balanced | N (run) | N | Y | Y | P | goal green/amber |
| 11 | Garmin | high | many (widget tiles) | balanced | P | Y | P | N | P | training-status colors |
| 12 | Coros | med | 3 | balanced | N | P | N | P | N | load bands |
| 13 | TrainingPeaks | med | ? | balanced | Y | Y | N | N | Y (coach) | green/yellow/red compliance + PMC triad |
| 14 | Hevy | low-med | 1-2 | balanced | Y | Y | N | N | N | RPE gradient |
| 15 | Fitbod | low | 1-3 | visual | Y | Y | N | N | N | muscle recovery green/yellow/red |
| 16 | StrongLifts | low | 1-2 | text | Y | ? | N | N | N | set complete green / fail red |
| 17 | Caliber | med | 2-3 | balanced | Y | Y | ? | ? | Y (coach) | ? |
| 18 | Ladder | med | 1-3 | visual | Y | Y | Y | Y | Y | teal + captions |
| 19 | Boostcamp | med | 2-3 | text | Y | Y | N | N | P | ? |
| 20 | Future | med | 1-2 | text+visual | Y | Y | Y | ? | Y | ? |
| 21 | SugarWOD | med | 1-2 | text | Y | P | N | N | P | Rx/Scaled |
| 22 | Wodwell | high | 1-2 | text | Y | ? | N | N | P | blue accent |
| 23 | btwb | med | 3-5 | text | N | Y | N | N | N | PR green/red |
| 24 | Freeletics | med | ? | visual | Y (4K) | Y | Y | Y | N | coral CTA |
| 25 | Whoop | low | 4-6 tiles | visual | N | N | N | N | N | green/yellow/red |
| 26 | Oura | low | 3-4 | balanced | N | N | N | N | N | dynamic biometric |
| 27 | Apple Fitness+ | low | 3-5 | visual | Y (4K) | N | Y | Y | Y | three-ring semantic |
| 28 | Peloton | med | ~4 | visual | Y | N | Y | Y | Y | Peloton red |
| 29 | Zwift Companion | low | 3-5 | balanced | N (in-game) | N | ? | Y (game) | P | discipline colors |
| 30 | GMB (PWA) | med | ? | balanced | Y | N | N | N | Y | ? |
| 31 | TMA | med | ? | balanced | Y | Y | N | ? | P | locked/unlocked/mastered |

### Bucket E — Interaction mechanics + gamification (10 attrs)

| # | App | E1 confirm | E2 streak | E3 badge | E4 XP | E6 social | E7 skip/move | E9 timer | E10 log input |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Pliability | - | Y (90+wk) | P | N | N | Y | large digit | n/a |
| 2 | GOWOD | - | ? | N | N | N | Y | large digit | n/a |
| 3 | ROMWOD | - | P (bolted late) | N | N | N | P | large digit | n/a |
| 4 | Down Dog | conf (user configures) | Y | P | N | N | - (regenerate) | hidden | n/a |
| 5 | YWA | - | ? | ? | N | P (forum) | Y | hidden | n/a |
| 6 | Alo Moves | - | ? | N | N | Y (per-class) | - | hidden | n/a |
| 7 | Runna | conf (propose+recalc) | P | Y | N | Y (Spaces) | Y (differentiator) | ring | keypad |
| 8 | Strava | conf (post-Runna) | P | Y | N | Y (feed=app) | Y (adaptive) | ring (IW) | keypad |
| 9 | NRC | - (static plan) | Y | Y (trophy shelf) | N | P | P | large digit | keypad |
| 10 | Adidas Running | - | Y | Y (Level) | P (Level) | P (Groups) | P | large digit | keypad |
| 11 | Garmin | hyb (Coach adapts, user overrides) | Y | Y | (badges) | P (Connections) | Y (drag/drop) | ring | keypad+auto |
| 12 | Coros | conf (Hub proposes) | N | P (PRs) | N | P | Y | ring | keypad+auto |
| 13 | TrainingPeaks | - (user/coach driven) | N (weeks-to-A-event) | ? | N | N | Y | not primary | keypad+device sync |
| 14 | Hevy | - (autofill inline) | Y (weekly) | Y | N | Y (feed) | Y | large digit + Dyn Island | keypad+prev-fill |
| 15 | Fitbod | auto (algo) | P | ? | N | N | Y | large digit | keypad+prev-fill |
| 16 | StrongLifts | auto (deload rule) | P | ? (PR flags) | N | N | P | large auto-timer | tap-off |
| 17 | Caliber | - (coach weekly) | ? | Y (Strength Score) | P (Strength Score) | P (private groups) | Y | ? | keypad |
| 18 | Ladder | - (coach weekly) | ? | Y (PR alerts) | ? | Y (Cheers) | ? | countdown+bar | keypad+prev-fill |
| 19 | Boostcamp | auto (progression) | ? | P (PR reset) | N | Y | Y | large digit + plate calc | keypad+prev-fill+RPE |
| 20 | Future | conf (coach conversational) | ? | ? | N | N | Y | ? | keypad+form-video |
| 21 | SugarWOD | - | ? | Y (PR+Rx) | P (fist bumps) | Y (leaderboard) | N | WOD timer | text/num+Rx |
| 22 | Wodwell | - | ? | P (leaderboard rank) | N | Y (leaderboard) | P (random WOD) | WOD timer | text/num+share |
| 23 | btwb | - | P (Training Days) | Y | N (FL 1-100) | Y (feed) | - (logger) | large digit | keypad+parser |
| 24 | Freeletics | hyb (feedback+auto weekly) | Y (daily+weekly) | Y (Perfect Week etc.) | Y (Level) | Y (Community) | Y | ring | reps+difficulty |
| 25 | Whoop | - (Strain suggests) | ? | P (challenges) | N | P (Teams) | - | n/a | tag-based Journal |
| 26 | Oura | - | ? | ? | Y (score rings) | N | - | n/a | tag-based |
| 27 | Apple Fitness+ | - | Y (rings closed) | Y | Y (rings=XP) | P (Sharing tab) | P | hidden | auto-tracked |
| 28 | Peloton | - (IQ suggests) | Y (daily+weekly) | Y (milestones 1/10/25/50/75/100/500/1000) | Y (Club Peloton Bronze→Legend) | Y (leaderboard+high-fives) | Y | in-class hidden | auto+manual |
| 29 | Zwift Companion | - (FTP bias slider) | P (training status) | Y (plan badges) | Y (XP levels) | Y (RideOns) | Y (skip interval) | n/a | auto |
| 30 | GMB | conf (user adjusts intensity) | ? | Y (gamified milestones per Lansky) | ? | N | Y | ? | manual mark-complete |
| 31 | TMA | conf (reps+difficulty feedback) | ? | Y (mastery) | P (level-up) | ? | Y | ring +10 | reps+difficulty |

### Bucket F — Adaptive + safety (8 attrs)

| # | App | F1 load-adjust | F2 skip-prop | F3 readiness | F4 symptom | F5 deload | F6 deviation | F7 off-plan log | F8 coach chat |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Pliability | N | N | P (wearable read) | P (onboarding only) | N | flex | N | none |
| 2 | GOWOD | N | N | N | P (onboarding) | Y (rest-day) | flex | Y (Strava) | none |
| 3 | ROMWOD | N | N | N | N | N | flex | N | none |
| 4 | Down Dog | N | P (like/dislike) | N | N | N | flex | n/a | none |
| 5 | YWA | N | N | N | N | N | self-auth | ? | community |
| 6 | Alo Moves | N | N | N | N | N | flex | Y | community |
| 7 | Runna | Y (AI insights) | Y (recalc) | P (HR) | P (variants) | Y (recovery wks) | flex | Y | AI+community |
| 8 | Strava | Y (Instant W) | Y (adaptive) | Y (F&F) | N | P (Freshness) | flex | Y | none |
| 9 | NRC | N | N | N | N | P | rigid-flex | Y | none (audio) |
| 10 | Adidas Running | N | N | P | N | P | rigid-flex | Y | none |
| 11 | Garmin | Y (Coach) | Y | Y (Body Battery, Readiness, HRV) | N | Y (Training Status) | flex | Y | none (one-way) |
| 12 | Coros | Y (EvoLab) | P | Y | N | Y (fatigue) | flex | Y | P (Hub coach) |
| 13 | TrainingPeaks | P (coach uses CTL) | N (coach) | Y (TSB/Form) | P (daily metrics) | Y (TSB thresholds) | flex | Y | human |
| 14 | Hevy | P (progressive overload nudge) | N | N | Y (Injury mgmt) | N | flex | Y | none (Coach is separate) |
| 15 | Fitbod | Y (real-time) | Y (recovery model) | Y (muscle fatigue) | P (exclusions) | Y (auto) | flex | Y | none (email) |
| 16 | StrongLifts | Y (auto progression) | Y (fail-streak deload) | N | N | Y (auto) | rigid+Pro | P | none |
| 17 | Caliber | Y (coach weekly) | Y | P (coach interprets) | ? | Y (coach) | flex | Y | human |
| 18 | Ladder | Y (plateau) | N | N | ? | P | rigid | P | human |
| 19 | Boostcamp | Y (auto-progression) | P | N | N | Y (built in) | flex | Y | none |
| 20 | Future | Y (coach weekly) | Y | ? | P (coach knows) | P | flex | Y | human |
| 21 | SugarWOD | N | N | N | N | N | rigid | Y | P (gym coach) |
| 22 | Wodwell | P (AI adapts) | ? | N | P (limits) | ? | flex | Y | P |
| 23 | btwb | N (logger) | N | N | N | N | flex | Y | none |
| 24 | Freeletics | Y (weekly) | Y | N | P (exclusions) | Y | flex | ? | AI |
| 25 | Whoop | Y (Strain Coach) | n/a | Y (canonical) | Y (Journal 160+ tags) | Y (red rec) | n/a | Y | AI (Whoop Coach) |
| 26 | Oura | N (behavior nudges) | n/a | Y (canonical) | Y (Symptom Radar) | Y (Rest Mode) | n/a | Y | AI (Oura Advisor) |
| 27 | Apple Fitness+ | N | N | N (Vitals separate) | N | P (pausable rings) | flex | Y | none |
| 28 | Peloton | Y (IQ) | P (IQ replans) | N | N | P (IQ) | flex | Y | none |
| 29 | Zwift Companion | P (FTP bias) | ? | Y (training status) | N | Y (status) | flex | Y | none |
| 30 | GMB | N (user self-adjusts) | N | N | N | P (user) | flex/self-auth | ? | human (email) |
| 31 | TMA | Y (AI reflow) | Y | N | P (troubleshoot) | P (adaptive back-off) | flex | Y | human (chat) |

### Bucket G — Credibility + trust (7 attrs)

| # | App | G1 cite in-product | G2 coach cred | G3 peer test | G4 sci mktg | G5 whitepaper | G6 data export | G7 clinical |
|---|---|---|---|---|---|---|---|---|
| 1 | Pliability | N | Y | ?in-app | Y | N | N | P (HYROX+PT) |
| 2 | GOWOD | N | Y | ?in-app | Y | N | N | P (pro athletes) |
| 3 | ROMWOD | N | Y | N | P | N | N | P |
| 4 | Down Dog | N | N (anon voices) | N | N | N | P (Health sync) | N |
| 5 | YWA | N | Y (Adriene) | Y (community) | N | N | N | N |
| 6 | Alo Moves | N | Y | Y (Community tab) | N | N | N | N |
| 7 | Runna | N (claim only) | Y | Y (Spaces) | Y | N | P (Strava sync) | P (physio plans) |
| 8 | Strava | N | P (plan authors) | Y (feed) | P (Relative Effort) | P (Strava Metro) | Y (CSV+GPX+bulk) | N |
| 9 | NRC | N | Y (Bennett roster) | P (leaderboards) | P | N | P (Health sync) | N |
| 10 | Adidas Running | N | P | P (community) | P | N | P (GPX+Health) | N |
| 11 | Garmin | N | Y (Coach roster) | P (Connections) | P (Firstbeat) | P (Firstbeat) | Y (CSV/TCX/GPX/FIT — strongest) | P (HR metrics) |
| 12 | Coros | N | P (Hub coaches) | P | P | P (metrics stories) | Y (TCX/GPX/FIT) | N |
| 13 | TrainingPeaks | N | Y (directory) | ? | P (Bannister/Coggan) | Y (PMC math) | Y (FIT/TCX/CSV) | N |
| 14 | Hevy | N | N in athlete app | P (feed) | N | N | Y (CSV) | N |
| 15 | Fitbod | N | N (no human) | N | Y ("science-backed algo") | N | P (3rd-party) | N |
| 16 | StrongLifts | N | P (Mehdi) | N | P | N | Y (spreadsheet) | N |
| 17 | Caliber | N | Y | P (marketing) | Y | N | Y (Account Details) | N |
| 18 | Ladder | N | Y (24 coaches) | Y (Cheers) | P | N | ? | N |
| 19 | Boostcamp | N | Y (Wendler, LeFever, Bromley) | P | P | N | ? | N |
| 20 | Future | N | Y (directory) | N | P | N | ? | N |
| 21 | SugarWOD | N | P (coach names) | Y (leaderboard) | N | N | Y (CSV) | N |
| 22 | Wodwell | N | P | Y (leaderboard) | N | N | ? | N |
| 23 | btwb | N | n/a (not coach-led) | Y (feed) | N | N | ? | N |
| 24 | Freeletics | N (blog cites externally) | N (algorithm) | Y (community) | Y | P (blog) | ? | N |
| 25 | Whoop | P (coach explains) | N (algo+AI) | ? (Teams) | Y | Y (The Locker) | Y (CSV) | P (FDA ECG) |
| 26 | Oura | P (Advisor cites internal) | N | N (population avg) | Y | Y (blog science) | Y (CSV+JSON API) | P (FDA regulated) |
| 27 | Apple Fitness+ | N | Y (trainer bios) | N | P | N | Y (Health export) | N |
| 28 | Peloton | N | Y (instructor bios) | Y (high-fives) | P | N | P (web CSV only) | N |
| 29 | Zwift Companion | N | P (workout authors) | Y (RideOns) | P | N | Y (.fit → Strava/Garmin/TP) | N |
| 30 | GMB | N | Y | Y (reviews) | P (motor control) | P (long-form articles) | ? | N |
| 31 | TMA | N | Y | P | P (motor control + AI) | N | ? | N |

### Bucket H — Scale behavior (10 attrs) — the founder's core concern

| # | App | H1 default | H2 400-day aggregation | H3 metrics tier at scale | H4 retest list | H5 off-day | H6 pgm archive | H7 chart at 400pts | H8 wk-narrative retention | H9 export | H10 tenure identity |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Pliability | ? | ? | ? | ? uncapped mob-tests | ? | ? | ? | ? "wk insights" | N | P (streak) |
| 2 | GOWOD | month | ? monthly-tile rollup (inferred) | monthly + retest events | uncapped tests | ? | ? | ? | ? | N | P (score over time) |
| 3 | ROMWOD | all-time list | UNCAPPED unrolled list (failure mode) | individual entries only | n/a | blank | n/a | n/a | N | N | N (the exact gap) |
| 4 | Down Dog | ? | ? | ? | n/a | ? | n/a | n/a | ? | P (Health sync) | P (challenges) |
| 5 | YWA | ? | ? | ? | n/a | ? | Y (monthly calendars) | n/a | ? | N | P (community identity) |
| 6 | Alo Moves | ? | ? flat list (reviewer complaint) | individual (reviewer complaint) | n/a | ? | P | n/a | ? | N | N (reviewer flag) |
| 7 | Runna | week | ? phase-block (inferred) | phase/plan-cycle | n/a | marked | P (past plans) | ? | ? Strava-inherited | P (Strava) | P (Runna Club) |
| 8 | Strava | week | Yearly bars + monthly drill + all-time totals | year/month/all-time coexist | Segments (uncapped, ranked) | marked (blank cells) | Y | Rolling avg / bar agg | ALL (users complain On This Day) | Y (CSV+GPX+bulk) | Y (Year in Sport, PR shelf, KOMs, join-year) |
| 9 | NRC | week | Week/Month/Year tabs | w/m/y totals; runs browsable | n/a (PRs rolled) | marked | Y | monthly/yearly rollup | P (shoe mileage, PRs) | P (Health) | Y (levels, trophies, all-time mileage) |
| 10 | Adidas Running | week | Monthly/yearly + all-time; 6-month Wear tile | m/y rollup | n/a | marked | Y | monthly rollup | ? | P (GPX) | Y (Level system) |
| 11 | Garmin | day | w/m/y rollups per widget; sparkline compresses Body-Battery | w/m/y avg on raw events | P (PR + VO2 uncapped) | marked (0-step visible) | Y | rolling avg / yearly→weekly bars | P (Weekly Insights email) | Y (CSV/TCX/GPX/FIT — strongest of set) | Y (badge shelf, VO2 multi-year, Fitness Age) |
| 12 | Coros | week | Weekly rollups; EvoLab shows 4-24-week windows | weekly + multi-year running-fitness curve | P (PRs, race predictor) | marked | Y (Hub archives) | weekly then monthly | P (weekly email) | Y (TCX/GPX/FIT) | P (running-fitness curve) |
| 13 | TrainingPeaks | week | Calendar + PMC rolling avg + season/year | CTL 42d, ATL 7d + per-workout retained | n/a strength; sport PRs | blank; CTL decays visibly | Y | rolling avg dominates | ALL | Y (CSV/FIT/TCX) | P (annual season summary; PMC multi-year) |
| 14 | Hevy | 3mo (free) / cal-wk | Calendar w/ multi-year zoom + monthly reports + YiR | individual retained + weekly + monthly + annual | UNCAPPED PR list | blank (streak=weeks) | Y (routines persist) | ? window-selectable | ALL (monthly report archive + annual YiR) | Y (CSV) | Y (Year-in-Review 10+ workouts, streak, all-time bests) |
| 15 | Fitbod | ? | ? no dedicated PR tab (reviewer flag) | individual + per-exercise drill | ? no PR tab | blank + wkly-count widget | n/a (no discrete pgm) | ? | ? | P (3rd-party) | WEAK (reviewer note) |
| 16 | StrongLifts | all-time per-lift chart | ? line just gets longer | individual entries; lifetime PR | 5 lifts (short) | blank | n/a | ? no agg | ? all-history | Y (spreadsheet) | P (PR list; no YiR) |
| 17 | Caliber | ? Progress recently revamped | ? customizable window | ? Strength Score + Balance | ? per-exercise | ? | ? | ? | ALL (coach chat) | Y (Account export) | P (Strength Score all-time) |
| 18 | Ladder | ? | ? | individual + historical trend | ? per-program? | ? | ? | ? | P (chat retains) | ? | ? |
| 19 | Boostcamp | ? | ? YiR confirmed | ? | ? PR reset possible | ? | Y (programs discrete) | ? | ? | ? | Y (annual YiR shareable) |
| 20 | Future | ? | ? chat-centric | ? coach interprets | ? | ? | ? | ? | ALL (chat) | ? | P (tenure with same coach; no explicit surface) |
| 21 | SugarWOD | recent-first per-movement | ? benchmark-comparisons documented | individual + benchmark; 1RM chart | ? per-movement PRs | blank (implied) | n/a | ? | ? | Y (CSV) | P (fist-bump lifetime count, benchmark PRs) |
| 22 | Wodwell | ? | ? Activity Log new | ? | ? benchmarks | ? | n/a | ? | ? | ? | P (public leaderboard rank) |
| 23 | btwb | year (Training Days default) | Cal heatmap multi-year + Maxes rollup | individual + Maxes All-Time + Current PR | uncapped per benchmark | blank (heatmap) | Y | ? | ? | ? | Y (Maxes all-time + multi-year heatmap) |
| 24 | Freeletics | week | ? | ? | uncapped PB per exercise (?density) | ? | ? | ? | ? | ? | Y (Level + badge shelf: Hell Week, Perfect Wk Streak) |
| 25 | Whoop | week | Monthly + 6-mo trend + Annual Performance Assessment | daily retained + weekly/monthly avg | n/a | colored (rec logged rest days) | n/a | rolling avg | RECENT (Month in Review shallower after redesign — community complaint) | Y (CSV) | Y (APA + Month in Review + tenure badge on tiles); **ANTI-TENURE: subscription lapse wipes data** |
| 26 | Oura | day | ROLLING AVG TIERS: Day-view shows 90-day avg; Week/Month/Year show since-inception avg; body temp uses 3-day weighted; My Health has weekly/quarterly/yearly reports | month rollup at long-scale + daily still available | n/a | colored (timeline continues) | n/a | ROLLING AVG + WEIGHTED WINDOW ("progressively averages... pattern recognition without overwhelming density") | RETAINED (wk/qtr/yr reports all persist) | Y (CSV + JSON API) | Y (Year in Review w/ global compare + Cardio Age + Stress Resilience — multi-year slow metrics) |
| 27 | Apple Fitness+ | day | Month rollup + Trends year + Awards timeline | 90-day vs 365-day rolling | n/a | marked (grey rings; pause icon) | Y | rolling avg (365-day baseline) | RECENT (weekly decays; Awards retain) | Y (Health export) | Y (All Rings Closed at 100/365/500/1000, then every 250) |
| 28 | Peloton | month | Individual list uncapped + PR grouped by class-length + Milestones cumulative | individual + PR rollups per class-length | UNCAPPED per class-length | ? | Y | ? | RECENT + milestone-based | P (web CSV only) | Y (Milestones 100/500/1000/Millennium + Club Peloton Bronze→Legend) |
| 29 | Zwift Companion | recent (My List) | **250-ACTIVITY CAP in Companion**; full history on zwift.com/feed | individual up to 250 cap | P (FTP tests) | ? | Y (plan badges persist) | ? | ? | Y (.fit) | Y (XP level on avatar, plan badges, bike garage) |
| 30 | GMB | ? | ? no public teardown | ? | P (self-assessments) | ? | Y (owned pgms on dash) | ? | ? | ? | P (Lansky mentions gamified milestones; no YiR/tenure documented) |
| 31 | TMA | ? | ? Skill map = lifetime record | ? photo/video journal | P (re-runnable assessments) | ? | Y (mastered skills persist) | ? | ? | ? | Y structurally (skill map + photo journal); no YiR |

---

## 4. Per-bucket synthesis

### Bucket A — Visual system

**Convention.** Bottom-nav on light-primary or dual/auto background; single accent + hairline card border; custom sans or system sans; photography-heavy for content apps, minimal-chrome for data/tracker apps. Icon at ~24px. Tabular numerals wherever there's numeric data.

**Trend.** Dark-primary is a legitimate positioning move (Pliability, GOWOD, Freeletics, Whoop, Oura, Ladder). Dynamic biometric-based tinting (Oura's redesigned app) is genuinely new. Semantic multi-accent (Whoop green/yellow/red, Apple three-ring, Garmin per-metric) is losing ground to single-accent+state-color as the more restrained pattern.

**Differentiator.** Oura's dynamic tint (color = current biofeedback) is the rarest visual move in the set — it's UI-as-feedback, not UI-as-brand. Whoop's ~72pt Recovery numeral is the second rarest — sizing a single number as the entire hero of the home screen. Nike Run Club's hard-edged (rectilinear) card treatment is the third rare move — everyone else defaults to 12–16px radius.

**Terav implication.** Terav's warm-dark + single-bronze system already sits in the discerning end of this bucket (matches Oura, Whoop, Freeletics for restraint; matches Ladder, Pliability for warmth). R2 "bronze is CTA-only" is well-supported by the pattern set — no peer with a single semantic CTA color regrets it. Do not chase semantic multi-color even as Progress-view richness grows; state color (P1 partial-completion, R1 red for rehab, etc.) can carry the density without breaking the CTA hierarchy.

---

### Bucket B — Information architecture

**Convention.** 4–5 bottom tabs, dashboard/session split, auth-first, ~5-step onboarding, web parity as a nice-to-have, watch app if the app has any measurable "in-session" moment. Widget presence is a coin flip.

**Trend.** Onboarding is getting longer, not shorter — Runna's ~26 steps and Freeletics' 12 steps are the current benchmarks for "we know a lot about you before day 1." Free content preview before signup (Boostcamp, StrongLifts, Ladder's daily WOD, Down Dog trial) is a rising counterweight; the auth-first-because-paywall model is showing conversion strain.

**Differentiator.** btwb's *top* nav (rare — everyone else is bottom). GMB Praxis' **no native app** (PWA-only) — a positioning stance ("we skip the app store"), not a mistake. Garmin's widget system (user-configurable tile grid on the home dashboard) — no peer approaches Garmin's widget depth. Runna's 26-step onboarding — the longest documented, and it converts.

**Terav implication.** The founder's flagged concern — "same 5 tabs, same block-list-on-Today, same per-program cards" — is a real concern precisely because 4–5 tabs is *category median*. That doesn't mean the tabs themselves are wrong; it means the *content of Today* is where the density fight happens. Two specific implications:
- The "block list on Today" pattern is closest to ROMWOD's failure mode (an ever-growing today-video list). The category answer is either (a) a dashboard with density (Garmin, Whoop, Hevy) or (b) a single hero + drill-in (Oura, Peloton). Terav's focused-improvement positioning aligns with (b); the per-program cards should collapse toward hero-of-the-day, and content richness lives one tap deep.
- Widget depth matters more than tab count for scale. If a user is 400 days in, the widget (home-screen) is where the daily glance lives — the app opens are for changes, not check-ins.

---

### Bucket C — Data-viz vocabulary

**Convention.** Line chart, bar chart, delta indicator, this-week-vs-last comparison. Zoom levels of week/month/year. That's the floor.

**Trend.** Rolling-average tiers with explicit windows (Oura 3/90/since-inception, TrainingPeaks 42/7-day EWMA, Apple 90-vs-365, Coros 4/12/24-week) are becoming the standard for "how do we show many months without visual noise." The winners commit to a math and name it (CTL/ATL, Trend baseline). The losers keep adding more chart types.

**Differentiator.** Oura's 3-day weighted window for body-temperature (weighted because noisy per-day). TrainingPeaks' Performance Management Chart is the deepest single-viz in the set; Whoop's Trend view is the second. GOWOD's body-zone heatmap on the mobility profile — the only mobility-app data-viz that a data user would find substantive.

**Terav implication.** This is the bucket where Terav has the highest-leverage decisions. The founder's 400-day question is *this bucket*. Concrete recommendations:
- **Commit to a rolling-average math and name it.** Terav has a signal-per-adjustment ethos; the aggregation-tier math should be the natural extension of it. Even a modest "7-day rolling actual vs 28-day rolling target" already puts Terav in the top tier.
- **Do not add a chart type per program.** Peer apps that ship a new chart per new feature (Strava, Garmin) age well because of scale; Terav does not have that scale yet and doesn't need it. One chart per bucket (aerobic, strength, skill, mobility, rehab) is the right density.

---

### Bucket D — Content density + media

**Convention.** 2–3 cards per scroll on primary home. Visual-heavy for content apps (Alo, Pliability, Peloton), balanced for tracker apps (Garmin, Strava, Hevy), text-heavy for the specialist CrossFit apps (SugarWOD, Wodwell, btwb — WOD prose is the culture). Video embedded in session for content apps; GIF/anim for exercise-library apps; voice guidance almost universal for content.

**Trend.** Instructor-as-brand (Alo Moves, NRC coaches, Ladder's 24 coaches, Fitness+ trainers) is the *content* strategy. Generative-anonymous (Down Dog voice actors, Fitbod muscle silhouette) is the *tool* strategy. Hybrid is rare and awkward.

**Differentiator.** Down Dog's "over a million configurations" generative model. Whoop's 4-6 customizable tiles on home (user-composes their dashboard). Garmin's widget-tile density (highest info-per-screen in the set).

**Terav implication.** Terav is not a content app and shouldn't try to become one. The Move/Skip/Whole-week verb migration to top nav (per memory) already gets density right by removing verbs from the content column. Do not add video-heavy exercise libraries — Terav's positioning is not "here is how to squat" but "here is what tomorrow should look like given last week." D9 long-form articles inside the app are worth avoiding entirely (they age fastest, dilute the focused-improvement posture, and are the first thing content apps complain about maintaining).

---

### Bucket E — Interaction mechanics + gamification

**Convention.** Streaks visible on home + achievement/badge shelf + rest-timer of large-digit or ring. Skip/move affordance yes. Undo yes. Set-log input via keypad + previous-value autofill. Social feed varies.

**Trend.** Streaks are getting more sophisticated (Peloton distinguishes daily/weekly, Freeletics adds "Perfect Week", Apple has "All Rings Closed" cumulative awards) — and getting more criticized (streak-preservation complaints on Peloton and Freeletics forums, users skipping honest illness to preserve). Levels/XP tiers (Peloton Bronze→Legend, Adidas Level, Freeletics profile level, Zwift XP) are the more durable identity mechanic — you don't lose them by resting.

**Differentiator.** btwb's "Training Days" — a heatmap of *when* you trained rather than an unbroken streak. This is the pattern that survives illness gracefully. Hevy's set-row + Dynamic Island rest timer (best-integrated wearable+phone loop of the strength set). Freeletics' feedback-vocabulary (too easy / perfect / too hard) — the highest-fidelity subjective-load capture in the set.

**Terav implication.** R5 (no streaks/gamification) is well-supported by the category evidence — the streak/XP mechanic recruits the wrong daily motivation and punishes rest, both of which are hostile to focused-improvement. But there is a mid-way pattern worth adopting: **retest events + retest achievement moments** (Pliability score, GOWOD test, Coros ramp test, TMA skill mastery). These are episodic, not daily; they reward improvement, not attendance; and they align with confirm-first because a retest is a natural cite point ("your baseline moved from X to Y"). Consider building a "retest surface" that fills the identity role a streak would fill in a peer app.

---

### Bucket F — Adaptive + safety

**Convention.** Load-adjust proposals exist in adaptive apps (Runna, Strava adaptive, Garmin Coach, Coros EvoLab, Fitbod, StrongLifts, Freeletics, Peloton IQ). They *don't* exist in log-first apps (Hevy, btwb, StrongLifts custom, SugarWOD). Readiness/recovery score is wearable-driven (Whoop, Oura, Garmin) or absent. Coach chat is either human (Future, Caliber, Ladder, TrainingPeaks) or AI (Whoop, Oura, Freeletics) or absent.

**Trend.** AI-coach chat (Whoop Coach, Oura Advisor, Freeletics Coach) is the new default; five years ago they didn't exist, now they're the differentiator that people write about. But — and this is the big trend — none of them cite the source of their claims. This is where Terav is dramatically ahead of the category.

**Differentiator.** Fitbod's muscle-fatigue heatmap driving next-workout composition. StrongLifts' fail-streak → auto-deload rule. Whoop's Journal (160+ behavior tags feeding recovery model). Terav's cite-per-adjustment is genuinely absent from every peer.

**Terav implication.** The confirm-first + cite-per-adjustment stack is the single largest category vacancy Terav owns. This is not merely a good idea — it is a design decision no other app has made. The recommendation is not to soften it toward auto-apply for the sake of parity; it is to *dramatize* it. Every proposal card should carry the citation as core content, not a footnote. Rehab-safe (R7) also has zero peer competition — every peer applies its adaptive engine across all tracks; Terav's decision to firewall rehab from progression math is a differentiator.

---

### Bucket G — Credibility + trust

**Convention.** Coach photos and credentials on marketing; peer testimonials in-app if there's a social layer; "backed by science" marketing claim without in-product citations; data export partial (Health sync) or via web only. Clinical/physio endorsement rare.

**Trend.** Data export is becoming a table-stakes commitment for the durable-tenure apps (Garmin CSV/TCX/GPX/FIT, Oura CSV+JSON API, Hevy CSV, Whoop CSV, Strava CSV+GPX bulk). Data-retention-on-cancel is emerging as an explicit trust signal — Whoop's subscription-lapse-wipes-data is now cited as a design failing in 925studios' teardown. This is not academic; it's brand.

**Differentiator.** Garmin's export depth is unrivaled. TrainingPeaks publishes the PMC math in help center — the only app in the set that shows its work publicly. Whoop's FDA classification (ECG) and Oura's FDA-regulated status are actual clinical signals.

**Terav implication.** Two moves matter here:
- **Data export as a first-week commitment.** JSON export of the full log, dated per-adjustment with citations, would immediately place Terav in the Garmin/Oura tier and above Hevy. Cheap to build; heavy in trust.
- **Cite-per-adjustment as a G1 category disruption.** Nobody currently does G1 in-product. Terav does. This should be visible on the marketing site and *reflected in the proposal UI itself* as a first-class element, not tucked into an "why?" tooltip.

---

### Bucket H — Scale behavior (deep dive follows in Section 5)

**Convention (30 days).** Every app looks fine. Session list, calendar, or feed.

**Convention (400 days).** Broken or well-designed, no middle. The dividing question: did the design team ever open a 400-day account internally?

**Trend.** The apps that scale (Garmin, Strava, Oura, Whoop, Apple, Hevy, TrainingPeaks) have all made the same three moves: (a) rolling-average tiers with explicit math, (b) chart densification via aggregation or weighted-window, (c) annual identity artifact (Year in Sport, Year in Review, Annual Performance Assessment). The apps that don't scale (ROMWOD, Alo Moves, Fitbod, Ladder, Future) haven't made *any* of the three.

**Terav implication.** Section 5 below.

---

## 5. Scale-behavior deep-dive (bucket H)

### The 30-day floor

Every peer looks fine at ≤30 days. The block list, per-program card, calendar view, and Today hero all work when the log has 20 rows. This is not where Terav is at risk; the question is whether we can *carry* the 30-day shape.

Specific 30-day patterns to note:
- **Session list** with previous-vs-current delta (Hevy, StrongLifts, Boostcamp, Runna) — works.
- **Calendar view** with completed-day marker (Hevy, Garmin, btwb, Peloton) — works.
- **Score-hero + drill-in** (Whoop, Oura, Apple, Pliability) — works, but demands an aggregation strategy soon.

Terav's current block-list-on-Today falls into the first pattern. It is fine for 30 days.

### The 90-day inflection

**This is where design teams find out whether they built a product or a demo.**

Peers that break at 90 days: ROMWOD (uncapped list is the failure mode Pliability was built to fix — 3 months of daily videos is when the list becomes unusable), Alo Moves (reviewers repeatedly flag "basic" tracking at this scale), Fitbod (reviewer explicitly notes lack of dedicated PR tab at 90-day scale is a UI failure).

Peers that survive 90 days: everyone with a rolling-average tier (Oura, Whoop, TrainingPeaks, Coros, Garmin, Apple Trends). The commonality is not the aggregation *math* but the fact that the design committed to *any* math and gave the user a tier below "individual entries."

**Inflection question for Terav:** at 90 days, what does a user's Progress screen show? If the answer is "the same block list, longer," we have the ROMWOD failure. If the answer is "a rolling-average view of the metric this program is sharpening, with citations on each proposal that moved the average," we are in the top tier — and the confirm-first mechanic already generates the aggregation math for free.

### The 400-day story — concrete patterns

**Aggregation tier.**
- Oura: Day view = 3-day / 90-day baseline; Week/Month/Year = since-inception averages.
- TrainingPeaks: CTL = 42-day EWMA of TSS; ATL = 7-day EWMA; TSB = CTL−ATL.
- Whoop: 6-month trend view with rolling averages.
- Apple: 90-day-vs-365-day baseline comparison in Trends.
- Coros: 4-week / 12-week / 24-week windows explicitly.
- Hevy: 30d / 3mo / 1y / all-time (last two Pro-gated).

The winners commit to an explicit window and expose it as a tier control. Losers show all points to infinity.

**Retest / retest-metric list growth.**
- Bad: uncapped list, no rollup (ROMWOD, Peloton per-class-length PRs get long, Freeletics per-exercise PBs).
- Better: rolled up into block/program summary (Boostcamp program → next program; Runna race cycle → next race cycle).
- Best: retest as a first-class *event* with a bounded cadence (Pliability mobility test, GOWOD 12-min test, Coros ramp test, TMA skill assessment).

Terav should build retests as *events* with cadence, not accumulate them as a list.

**Chart densification at 400 points.**
- All-points-plotted (StrongLifts, per-exercise line just gets longer, and reviews at 90+ days say so): breaks at 400. Do not do this.
- Decimated (Whoop, Oura Trends): rolling avg or weighted window compresses to fewer visible marks. Works.
- Rolling-avg curve overlay (TrainingPeaks CTL, Apple 365-day baseline): keeps individual bars but overlays a smoothing line. Best of both worlds.

Terav should adopt rolling-avg overlay over raw bars, with a user tier to toggle the raw layer.

**Long-user identity surface.**
- Year-in-Review (Hevy — requires 10+ workouts, Strava Year in Sport, Whoop Annual Performance Assessment, Oura Year in Review with global compare, Boostcamp annual shareable).
- Milestone tiers (Peloton 100/500/1000/Millennium, Apple All Rings Closed at 100/365/500/1000 then every 250).
- Tenure counter (Whoop weekly, Oura since-inception avg is itself a tenure counter).
- Cumulative benchmark (Garmin VO2-max multi-year trend, Coros running-fitness curve, TMA skill map).

Terav can cheaply build one Year-in-Review artifact that reuses the per-adjustment log as source material. This is high-leverage: it earns tenure identity once a year, then works for years.

**Data export as counterweight.**
- Strongest: Garmin (CSV/TCX/GPX/FIT + full account export).
- Strong: Oura (CSV + JSON API), Hevy (CSV), Whoop (CSV), Strava (CSV+GPX+bulk archive).
- Explicit anti-pattern: Whoop wipes on subscription cancel (an active category negative signal per 925studios teardown).

Data export is the trust counterweight for any aggregation-tier redesign. Users will accept "we roll up your daily data at 90+ days" *iff* they can pull the raw file. Terav's Supabase-backed log makes this straightforward and should be treated as launch-day, not v2.

### Terav-specific recommendation — what Progress + History should look like at 400 days

**Concrete design moves.**

1. **A committed aggregation math per program type.** For strength (5/3/1): 4-week rolling max-of-set-1 vs 12-week baseline. For aerobic (Engine Builder): 7-day rolling training load vs 42-day CTL-style curve. For skill (Handstand Walk): retest event list (5 events over 90 days = a story). For mobility (Overhead): pre/post retest deltas per phase. For race-anchored (Rowing 2K): plan-cycle rollup. **These are not five different charts — they are the same chart with the same axes and one aggregation tier, parameterized per program.** One chart pattern, five programs. This is what "focused-improvement" earns you: you get to commit to a single aggregation math because the user only has one focus.

2. **The Progress screen at 400 days is the same screen as at 30 days.** No mode switch. Rolling-avg curve = default; raw bars = user-toggle overlay. This is Oura's move and it is right.

3. **Retest events surfaced as tenure identity.** Not streaks (R5), not XP (R5). A user's "10 retests" over a year is the identity artifact. Each retest carries the citations for the proposals that moved between them — this is the year-in-review-in-miniature, generated for free by the confirm-first mechanic.

4. **Annual Year-in-Review as a bounded, shareable artifact.** Once a year, on the account anniversary. Reuses the retest event list + citations + rolling-avg curve. Costs one design cycle to build; earns tenure identity for every subsequent year. Constraint: no global comparison (Oura's "New Zealand tops the sleep chart" is anonymized peer comparison, which Terav's private log ethos doesn't need); own-vs-own only.

5. **Data export as launch-week, not v2.** JSON dump of the log + citations, per-user. This is small work in a Supabase+KV stack and it is the single largest R7 (rehab-safe) trust move Terav can make. Reference: Garmin, Oura JSON API.

6. **History is a calendar heatmap of retest-events + accepted-adjustments, not a session list.** The block-list-on-Today can survive if History switches to an aggregating shape. btwb's "Training Days" heatmap is the peer reference; Hevy's calendar with year-zoom is the second.

7. **Warm-dark + single bronze constraints hold at 400 days.** Do not adopt a semantic multi-color chart palette (R2). State color for partial completion, red for rehab context, and neutrals for the rolling-avg curve. If bronze is CTA-only and nothing competes, the chart can afford to be spare.

---

## 6. Recommendations for Terav's next design push

Directional bets. Not a redesign spec. Each cites peers.

**1. Commit to a single rolling-average math per program type.**
*What.* Adopt an explicit aggregation window per program category (see Section 5.1 above). Expose it as a labeled tier ("7-day trend vs 28-day baseline," not "chart").
*Why.* Every peer that survives 400 days did this (Oura, TrainingPeaks, Whoop, Coros, Apple Trends). Every peer that broke at 90 days didn't (ROMWOD, Alo Moves, Fitbod).
*Trade-off.* We give up "we show every point" bragging rights. We gain a design that doesn't need a redesign at year 2.

**2. Retest events as the identity artifact — replaces streaks/XP.**
*What.* Design a retest-event surface (episode + delta + citations). Not daily. Program-cadence.
*Why.* Pliability, GOWOD, Coros, TMA all use retests. Peloton, Freeletics use streaks/XP and both have public streak-preservation complaints. Retests reward rest-then-improve, which is what focused-improvement actually wants.
*Trade-off.* We give up the every-day dopamine hook. We gain a mechanic that survives illness and rest weeks gracefully — and directly maps to R5 (rejected: streaks/gamification).

**3. Data export on launch week, not v2.**
*What.* JSON dump of full log + citations + accepted proposals + retest events. Available in-account, one click.
*Why.* Garmin (CSV/TCX/GPX/FIT) is the strongest tenure signal in the corpus; Whoop's wipe-on-cancel is the loudest anti-signal. Terav's cite-per-adjustment produces the ideal export payload for free.
*Trade-off.* Small implementation cost. No user-visible cost.

**4. Cite-per-adjustment surfaced as first-class UI, not tooltip.**
*What.* Every proposal card carries the citation (study title/DOI OR log-signal name) as body content. Not "Why?" affordance.
*Why.* Whoop Coach, Oura Advisor, Freeletics AI Coach — three peer AI-coaches, zero cite their claims in-product. Genuine category vacancy.
*Trade-off.* Slightly denser proposal card. Massive credibility win. This is R8's positive twin — where Whoop is the "score-hero" pattern, Terav is the "citation-hero" pattern.

**5. Progress screen doesn't have a "long-tenure mode."**
*What.* Same screen at day 30 and day 400. Rolling-avg curve default; raw-bars overlay toggle.
*Why.* Oura's Trends is the peer reference — one screen, four zoom levels, no mode switch. Fitbod's implicit tenure mode (per-exercise drill-in only) is the anti-example that reviewers explicitly flag.
*Trade-off.* We commit to the aggregation math being correct for both 30-day and 400-day users. That's a real engineering constraint — but a small one, and it's the constraint that produces good design.

**6. Year-in-Review as bounded annual artifact, own-vs-own only.**
*What.* Once a year on account anniversary. Reuses retest-event log + citation list + rolling-avg curve. Shareable card (bronze accent, warm-dark, no peer comparison).
*Why.* Hevy (10+ workouts required), Strava Year in Sport, Whoop APA, Oura YiR, Boostcamp annual — five of the tenure winners have this artifact. Costs one design cycle.
*Trade-off.* We do NOT add global percentile comparison (Oura's move) because private-log ethos + confirm-first + no-peer-comparison is the tighter positioning. Own progress is enough.

**7. Widget as daily glance, app-open as decision moment.**
*What.* Design a home-screen widget that shows today's focus + next retest window. App-open is reserved for accepting a proposal or logging a session.
*Why.* Garmin's widget system is the peer reference (highest info-per-glance in the corpus). Hevy, Fitbod, StrongLifts, Ladder all have widgets and users engage with them daily. Widget presence correlates with long-tenure retention across the corpus.
*Trade-off.* Real engineering. But it re-slots app-opens from "check in" to "decide," which is exactly the right rhythm for a confirm-first product.

**8. IA move: Today becomes a hero-of-the-day surface; per-program cards collapse.**
*What.* Restructure Today so the single active focus is the hero, and other tracks (mobility, rehab) are secondary tiles or a peek-strip. Do NOT keep the block-list-of-programs shape.
*Why.* Oura Today, Peloton hero, Runna today's-run, Apple Fitness+ For You all resolve density this way. ROMWOD's per-day-video list is the failure mode Pliability was designed to fix.
*Trade-off.* Multi-program users lose the parallel visibility of all programs at once. But focused-improvement positioning says: **one program is the focus per session**, and Terav's job is to enforce that on the surface.

**9. IA move: 5 tabs unchanged, but History becomes an aggregation surface, not a list.**
*What.* Keep the tab count. Change what's inside History: calendar-heatmap of training days (btwb pattern) + retest-event timeline + rolling-avg curve per program. Not a session list.
*Why.* btwb's Training Days heatmap is the peer reference for a CrossFit-adjacent log. Hevy's calendar-with-year-zoom is the second. Both survive 400 days because the primary surface is aggregation, not enumeration.
*Trade-off.* Users looking for "what did I do exactly on day 84" have to tap through the calendar. That's a fair trade — 90% of users at year 2 don't do that lookup; they look at the curve.

**10. Retest cadence as program-defined, not user-triggered.**
*What.* Each of the five shipping programs owns its retest cadence (e.g., 5/3/1: every 4-week cycle; Engine Builder: every 6 weeks; Handstand Walk: monthly skill test; Overhead Mobility: pre-phase and post-phase; Rowing 2K: only at plan-block boundaries).
*Why.* Pliability/GOWOD's retests are user-triggered and users under-use them; Coros/TrainingPeaks retests are program-defined and users complete them. Cadence-in-program is the pattern that gets executed.
*Trade-off.* Users lose "test whenever I want" freedom. But retest fatigue is a real thing, and program-defined cadence protects it.

**11. Rehab track surfacing: firewalled from progression math AND from Progress rollups.**
*What.* Rehab track shows its own history (session log, pain-marker trend if the user logs one) but never appears in the same aggregation curve as strength/aerobic/skill.
*Why.* No peer app in the corpus does this — every app applies its adaptive engine to every track. But Terav's R7 (rehab-safe) is a real commitment and the Progress-screen aggregation is the second place it must be enforced.
*Trade-off.* We do not get one unified "how am I doing overall" number. This is a feature, not a bug — one number would be the score-hero Terav rejected in R8.

**12. Confirm-first attribute schema split (informs onboarding + docs).**
*What.* When Terav communicates its confirm-first mechanic externally, split into (a) inline autofill of next-set values (which we do, similar to Hevy), (b) macro plan proposals that require Accept (which is our differentiator vs Runna's silent-recompute), (c) provenance citations (category vacancy).
*Why.* The matrix synthesis shows E1 confirm-first is over-loaded. Users and reviewers will fold Terav's differentiator into "yeah, Hevy does that too" unless the split is explicit.
*Trade-off.* Marketing copy gets slightly denser. Positioning gets sharper.

**13. Warm-dark + single bronze audit for chart palette.**
*What.* When adding the rolling-avg curve UI, confirm bronze remains CTA-only. Curve color = neutral warm-gray; state overlays = existing rehab-red, partial-complete indicator; NO semantic green/yellow/red palette.
*Why.* R2 (bronze is CTA-only, nothing competes) has direct category evidence supporting it (single-accent apps age well; multi-accent apps look busy at 400 days).
*Trade-off.* Some data-density looks less "punchy." Trade for chart calm.

**14. Onboarding: convert Runna-length quiz into the confirm-first proposal loop.**
*What.* Onboarding is not "26-step quiz then plan." Onboarding is: "here is a proposal for tomorrow, with citations. Accept?" First-proposal-first.
*Why.* Runna's 26-step onboarding converts because the user gets a plan; Freeletics' 12-step converts because the Coach output is meaningful. Terav's confirm-first is the onboarding — no other quiz needed.
*Trade-off.* We lose the "we know 26 things about you" pretense. We gain "you saw the mechanic in the first 60 seconds." Better bet for retention.

---

## 7. Appendix — candidate new attributes for matrix v2

Consolidated + deduplicated from all three research parts. Numbered list; one-line justification each.

1. **Confirm-first sub-attribute — inline autofill (E1a).** Every strength app has "prev-value autofill"; the current E1 conflates this with macro plan changes.
2. **Confirm-first sub-attribute — macro plan proposal (E1b).** Runna, Fitbod, Freeletics, Terav all propose; only Terav requires Accept per adjustment.
3. **Confirm-first sub-attribute — provenance citation visibility (E1c).** Zero peers; Terav's category vacancy.
4. **Program picker sub-attribute — content source** (catalog / user-authored / algorithm). Distinguishes Boostcamp (catalog) from Hevy (user) from Fitbod (algo).
5. **Program picker sub-attribute — load source** (static / adaptive). Distinguishes StrongLifts (adaptive rules) from Peloton content (static).
6. **Readiness score sub-attribute — auto-computed vs subjective prompt.** Whoop/Oura/Garmin (auto) vs Freeletics/TMA/Terav (subjective) is a fundamentally different UX.
7. **Onboarding length category** (brief ≤5, medium 5–10, long ≥15, very long ≥25). Runna's 26 steps is a signal, not a curiosity.
8. **Retest ritual presence + cadence-source** (user-triggered vs program-defined). Pliability user-triggered, Coros program-defined; different completion rates.
9. **Silent-recompute of internal metrics** (Garmin/Coros/Strava silently recompute VO2/fitness; Runna/Nike don't). Upstream of E1.
10. **Instructor-as-brand vs generative-anonymous split.** Alo/NRC/Pliability/YWA vs Down Dog. Cultural axis, not a D-attribute.
11. **Community peer-visibility axis.** Strava (peer-visible feed=app) vs Coros/Garmin (optional) vs Pliability/Down Dog (private).
12. **Streak surface style** (icon on home / calendar chip / big-number-on-profile / not-shown). yes/no is too coarse.
13. **Data density at 12-month scale** (visible-elements-per-screen). Garmin ~15 tiles vs Pliability ~1 score.
14. **Charts that survive 400 days without redesign** — binary of "at what N does current chart type break." Actionable.
15. **Weekly narrative artifact** — does the app produce a shareable/archivable weekly summary. Distinct from retention question H8.
16. **Founder / coach photos on marketing** — brand-trust separate from G2 in-product.
17. **Watch face / complication depth** — beyond B9 binary. Runna's complications ≠ Alo's absence.
18. **Dark-mode default vs opt-in.** Garmin defaults dark since 2023; Nike doesn't dark-theme at all.
19. **Coach identity persistence** (named coach face on-screen every session). Ladder/Future/Caliber/Boostcamp yes; Hevy no.
20. **Widget content type** — workouts-this-week vs macros vs latest PR vs today's focus. Different assumptions.
21. **"Previous session pre-fill" pattern** — table-stakes for strength; absence would be a red flag.
22. **Data-provenance for adaptive suggestions** — same as #3 provenance; worth doubling to force attention.
23. **Onboarding-to-first-value time** — Boostcamp/Wodwell seconds; Future days waiting for coach match.
24. **Freemium boundary.** Fitbod 3 workouts, Hevy feature-gated, StrongLifts free-core+Pro. Predicts retention.
25. **RPE / subjective-load logging.** Boostcamp/Hevy/Caliber RPE; Fitbod difficulty-tap; Freeletics feedback vocab.
26. **Public shareability primitives.** Hevy Year-in-Review shareables; SugarWOD fist bumps; Ladder Cheers; Wodwell public toggle.
27. **Retest cadence expectation** — does the app schedule retests. Fitbod yes; Hevy no.
28. **Data-loss-on-cancel policy.** Whoop wipes; Oura/Apple retain. Trust signal distinct from G6.
29. **Population-comparison surfacing.** Oura Year in Review global stats; distinct from G3 testimonials.
30. **Dynamic biometric-based coloring.** Oura's dynamic tint — UI-as-biofeedback. Neither A2 nor D10.
31. **Progressive disclosure tiers.** Whoop's three-tier explicit design (glanceable/trend/deep-dive). Maps to Terav density.
32. **Web-only vs mobile-only vs both** as hard binary. GMB no App Store; Whoop web-thin; Peloton web-parity.
33. **Retention floor / free tier** — permanent free tier vs subscription-gated. Only btwb, Zwift Companion have free tier.
34. **Coach role attribute** — content-author / adaptive-proposer / concierge / none. Single field replaces multiple G attributes.
35. **PR reset affordance.** Peloton exposes "Reset PR." Rare trust move — user allowed to lie about own history.
36. **Feedback vocabulary.** Freeletics (too-easy/perfect/too-hard); TMA (reps+difficulty); Oura (tag-based). Different data-capture.
37. **Off-day representation calendar contract.** btwb blank cells; Apple grey rings; Oura timeline-continues. Terav should decide.

---

## Notes on unknowns (consolidated)

**Best-verified apps for H bucket:** Oura, Whoop, Hevy, TrainingPeaks, Garmin, Strava, Apple Fitness+. All publish long-user behavior in help centers, blog posts, or teardowns.

**Worst-verified for H bucket:** GMB (no App Store, no teardown), Wodwell (app just relaunched 2025), Future (chat-heavy so progress screen de-emphasized in reviews), YWA (thin public review coverage of FWFG app), Ladder (reviewers cover coach personality, not progress views), TMA (no long-tenure teardown available).

**Broadly unverifiable across the corpus:**
- A4/A5/A10 (pixel typography sizes) — every app.
- A7/A8 (border radius/weight) — best-guessed to ~12–16px + hairline for almost every app.
- H7 (chart densification at 400 points) — only Oura, TrainingPeaks, Garmin, Apple, Whoop document.
- Widget presence for mobility apps (Pliability, GOWOD, Down Dog, Alo Moves, YWA) — no marketing callout.

**Category-wide honest gap:** the H bucket at 400 days is inferential for every non-tracker app. Strava/Garmin/Coros/Adidas Running/Apple/Oura/Whoop have explicit month/year rollups in their help centers; the mobility category and the CrossFit-affiliate category do not publish long-user screenshots. Firming this up would require a paid 30-day trial + screen recording per app, not more desk research.

---

**End of merged deliverable.**
