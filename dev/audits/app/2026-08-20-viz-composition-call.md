# Viz + composition call — v1 skeleton verdict + composition rule

Owner: product-design-lead
Written: 2026-08-20
Status: draft — awaiting founder review
Related:
- `dev/audits/app/2026-08-20-deep-design-review.md` (visual-craft deep review — five-move proposal)
- `dev/audits/app/2026-08-20-design-review-call.md` (prior call — mockup-first protocol)
- `dev/audits/app/2026-08-20-visual-refresh-brief.md` (Batches 33-35 driver)
- `dev/audits/app/2026-08-19-founder-observations-queue.md` (O21 — "1995 not 2026")
- `dev/audits/app/2026-08-19-master-task-list.md` §G Rejected R1-R12 (hard constraint)
- Stitch mockups: `/tmp/stitch/today-v1.png`, `/tmp/stitch/today-v2.png`, `/tmp/stitch/today-v3.png`

Founder stance: v1 is closer to modern consumer-app language than v2/v3, but "not many visuals or graphs or engaging things." Approves mockup-first protocol. Wants one more agent-round before locking.

Note: the visual-craft viz-layer brief referenced in the invoker prompt is not yet on disk — proceeding without it. If it lands later, treat this brief as the composition ceiling; the viz-layer brief supplies the specific chart primitives that fit inside it.

Blocks: Batch 36 shape, next Stitch re-prompt, any UI-visible commit.

---

## The calls

**Call 1 — v1's skeleton is right. Add viz as a LAYER on top of it. Reprompt Stitch with v1 + viz. Do not restructure. (Option a.)**

**Call 2 — Composition rule going forward is "viz-per-hero + trend-per-state + motion-per-state-change, one accent per surface." Written as an additive V1-V5 positive rule set in a new §H of the master task list — NOT a new rejects entry.**

Why Call 1:
- v1 already reads as modern consumer-app language. The composition is not the failing layer.
- The failing layer is *inside* the hero — the workout hero is a text list, not a data object. That's a viz problem, not a skeleton problem.
- Restructuring (option b) throws away persona-tested composition while the founder is asking for a specific missing thing (viz). Fix what's missing; do not demolish what's working.

Why Call 2:
- The R-list is what we won't ship — a hard-constraint list. Do not pollute it with positive rules.
- Positive composition rules deserve their own namespace (V-rules — "viz language") so "how do I make X engaging" has a written answer, not a debate.
- Terav's ceiling depends on a distinctive viz language that is neither Whoop score-donuts nor Strava heatmaps. Name the rule now; prevent drift.

---

## The problem

Three Stitch mockups landed against the mockup-first protocol. Founder read: v1's composition ("wordmark · H1 · readiness trail · hero block · extras · bottom-nav") is *closer* to modern consumer fitness than v2 (denser, letter-prefixed block list, less white) or v3 (flat debug-console text stack). Founder is not saying v1 is wrong; founder is saying v1 lacks the *engagement layer* — sparklines, charts, dot-trails-with-scale, progress bars, motion. The stuff that says "the app has interpreted your data and is showing it back as shape."

Two paths open. **(a) v1 stays; viz bolts on** — readiness trail gains magnitude tinting, workout hero grows a duration/blocks/target metric strip, extras gains a mini sparkline, progress inherits sparklines and milestone bars. **(b) Viz-first restructure** — the workout hero becomes a segmented progress ring, readiness collapses to a pill, extras becomes a weekly heat cell.

The trap: "founder said not enough viz" reads as an invitation to explore max-viz. Wrong. The invitation is to *fix what v1 lacks*, not *rebuild v1 into what v1 isn't*. Modern consumer-fitness apps that are neither Whoop nor Strava (Hevy, Runna, Fitbod, TrainerRoad mobile) universally use v1's composition — top state strip + hero action card + supporting card. Viz is added *inside* each element; the container is not restructured.

Future scenarios this design must hold under:
1. **New program shipping** — catalog is 5 now, growing. Hero must accommodate any category without special-case layout.
2. **New proposal type** — status pill must show state changes without eating the composition.
3. **Dense-log user** (persona-strength, 15 logs/wk) — trend viz must scale `n=2` to `n=50+`.
4. **Symptomatic user** (persona-recover, amber-week) — viz must not become gamified when a red-flag day is honestly bad.
5. **Erratic user** (persona-erratic, 15 skips) — trend must show honesty, not shame.
6. **Offline / SSR** — sparklines are SVG, no fetch, no hydration jank.
7. **Screen-reader user** — every viz gets an `aria-label` summary in words.
8. **Reduced-motion user** — every state-change has a still-frame alternative.

---

## Options considered

### Option A — v1 skeleton + viz layers (winner)

- **Shape:** keep v1's composition. Grow each element inward. Readiness trail gains magnitude color per dot. Workout hero: replace "3 blocks · 12 exercises" title with the workout NAME + a 3-cell nested metric strip (duration / blocks / target). Numbered block list, not letter-prefixed. Extras gains a 60×16 px sparkline of "drills done this week." Progress inherits sparklines on retest cards + a milestone progress bar (in a follow-on brief, not this ship).
- **Sketch (393 × 852):**
```
+-----------------------------------------+
|  • TERAV                        [ ⚙ ]   |
|                                         |
|  Today   < Thu 20 Aug >                 |  <- H1 20px + inline date-nav (Move B)
|  ⬤⬤⬤⬤⬤⬤⬤⬤⬤⬤⬤⬤⬤⬤ GREEN — progress load |  <- 14-day trail, magnitude-tinted
|                                         |
|  +-----------------------------------+  |
|  | THU · WEEK 3 OF 6   [◕ READY]     |  |  <- eyebrow + status pill
|  | Norwegian 4×4                     |  |  <- 26 px workout NAME
|  | Row/Ski · concurrent strength     |  |
|  | +------+------+------+            |  |
|  | | 48min| 3 blk| RPE7 |            |  |  <- 3-cell metric strip (viz)
|  | | DUR  | BLK  | TARG |            |  |
|  | +------+------+------+            |  |
|  | 1  Primary Strength         5×    |  |
|  | 2  Accessory Work           4×    |  |
|  | 3  Power Development        3×    |  |
|  | 4  Trunk Stability          3×    |  |
|  | 5  Metabolic Finish         1×    |  |
|  | [  Open session  →           ]    |  |
|  +-----------------------------------+  |
|  +-----------------------------------+  |
|  | 8 drills available    ▁▂▃▂▄▃▅     |  |  <- extras + tiny sparkline
|  | warm-up · shoulder · hip · CNS    |  |
|  +-----------------------------------+  |
|  [Today] [Week] [Progress] [Profile]    |
+-----------------------------------------+
```
- **Pros:** preserves persona-tested composition; smallest surface-area of change; R1/R5/R8-safe; viz-layer brief (when it lands) drops cleanly into elements.
- **Cons:** ceiling bounded by v1's shape — cannot break past "hero card with viz inside" until we prove it and revisit.
- **Verdict:** winner.

### Option B — viz-first restructure (loser)

- **Shape:** workout hero becomes a dashboard-tile — segmented progress ring (5 segments for 5 blocks, filled bronze as blocks complete during session, hollow before start), "48 min · RPE 7" wraps around it. Readiness collapses to an inline pill. Extras becomes a 7-cell weekly heat.
- **Pros:** higher ceiling; distinctive; drops the text-list feel entirely.
- **Cons:** the progress ring on Today is 90 % of the way to a Whoop score-donut (R8) — segments are honest, but a first-time viewer reads it as *readiness score display*, exactly R8's shape. Worse: the ring displays block completion, which is *state-of-the-session-you-haven't-started* — before Open Session it's 0/5, which reads as "you haven't done anything" and is a founder-hostile empty state on the primary daily surface. Also throws away v1's persona-tested composition without proof it's wrong.
- **Verdict:** rejected on Today. The ring is a real move for the **Session** view, where it can fill live during the workout (state you produced, not a null-state score). Reserve it for that brief.

### Option C — parallel-explore both (loser, kept for contrast)

- **Shape:** generate v1+viz AND viz-first-restructure, put both to founder.
- **Pros:** hedges; real A/B moment.
- **Cons:** violates the prior call's discipline ("design first, ship one thing"). Junior designers hedge; senior designers call. Also spends +2 h of Stitch + 1 h of founder review on a decision that has a clear winner once the R8-conflict in B is named.
- **Verdict:** rejected. If founder disagrees with A, we then generate B as a follow-on. Do not front-load ambiguity.

---

## Chosen: Option A — v1 skeleton + viz layers

### Composition contracts

- **Header row:** 44 px, wordmark + settings gear.
- **Route/date row:** 40 px, "Today" H1 (20 px inline) with an inline arrow-date-nav. Merges v1's two rows (Move B of deep review). Trims ~80 px of fold chrome.
- **Readiness trail:** 14 dots × 6 px + 3 px gap, magnitude-tinted (green/amber/red intensity within state), inline "GREEN — progress load" label in 11 px mono-caps. `aria-label="readiness green last 14 days: 12 green, 2 amber, 0 red"`.
- **Workout hero:** `bg-surface-2` (#20232a), 4 px bronze left stripe, eyebrow row (day + week counter on left, status pill on right), 26 px workout NAME, 14 px lede, 3-cell nested metric strip on `bg-surface`, numbered block list with right-aligned mono set count, full-width bronze CTA "Open session →" in sentence case.
- **Extras block:** `bg-surface` (one tier lower — real elevation contrast), title + 60 × 16 px sparkline of drills-this-week + 14 px muted comma-separated drill categories.
- **Bottom nav:** unchanged.

### Cross-persona coherence check

| Persona | State | Holds? | Notes |
|---------|-------|--------|-------|
| persona-recover | rehab, amber morning check | y | Status pill "CHECK FIRST" (amber). Metric strip "18 min / 4 drills / SLATE". |
| persona-strength | overperformer, cycle-end | y | Pill "WORKOUT READY" (green). Strip "48 min / 4 blocks / RPE 7". |
| persona-erratic | 15 skips, proposal pending | y | Proposal appears as 40 px compact strip above the hero, not a 200 px block. Pill "MOVED FROM TUE" (slate). |
| persona-multitrack | 2 programs, 1 active + 1 paused | y | Active program renders as workout hero. Paused surfaces as extras-tier block below, labeled "OVERHEAD MOBILITY · PAUSED". No fold-competition. |
| persona-mobility | 1 skill-track program | y | NAME = "Overhead Mobility · block 2". Strip "22 min / 6 drills / FORM-HOLD". Target column adapts via `hero_metric` field. |
| persona-graduate | finished, retest pending | y | Hero flips to a retest-hero variant (title = retest name, strip = "3 tests / ~15 min / RESULT"). Same skeleton, retest content. |

Composition holds across all six. Failure modes push to inside-the-hero details (proposal pill, status chip, target column) — not to the skeleton.

### Modern-standard checks

- **iOS HIG:** header 44 px tap-target compliant. Bronze CTA `w-full` in thumb-zone cradle. Safe-area via existing `pb-safe`. Proposals expand to a bottom sheet; never a modal. **Pass.**
- **Material 3:** state-layer 8 % darken on CTA press (existing `active:bg-bronze-active`). Motion buckets: 200 ms ease-out state changes, 400 ms ease-out data-viz reveals. **Pass.**
- **Refactoring UI:** one primary emphasis per view (workout NAME at 26 px is loudest). One accent (bronze). Hierarchy via weight + spatial grouping + surface tier, not size alone. **Pass.**
- **`prefers-reduced-motion`:** readiness dots render static (no reveal). Metric-strip cells static. Sparkline stroke reveal falls back to final-state render. Status-pill state-crossfade falls back to instant swap. Progress-bar fill on milestones (in a follow-on brief) has a still-frame alt. **Pass.**
- **Fitts's law:** Open session CTA `w-full` at hero bottom = thumb-zone cradle. Status pill top-right (informational only — high thumb-reach cost is correct; you do not want accidental taps). **Pass.**

---

## The composition rule going forward (V-rules, §H addition)

Written as a positive rule set alongside §G Rejected, in a new §H of `dev/audits/app/2026-08-19-master-task-list.md` (proposed title: **Section H — Viz language (V1-V5)**). This is the written contract for future "make X more engaging" asks.

**§H paragraph (canonical):**

> Terav's engagement layer is a bounded viz vocabulary — five patterns that turn data into shape without importing gamification, photography, or a score-hero. **V1 — every hero surface has at least ONE data-viz element** (sparkline, dot trail, ring, heatmap, progress bar, or metric-strip cluster). Text-only heroes do not count as "engaging"; a card with a single numeric-strong callout is still a text hero. **V2 — every "state" surface (readiness, adherence, retest, milestone) shows history plus trend, not just current value.** A readiness dot for today is honest; a readiness dot for today plus 13 dots of context is *readable*. Data must be shown as shape whenever `n ≥ 2` data points exist. **V3 — motion is allowed for state changes, bounded to 200 ms for UI-state and 400 ms for data-reveal, always with a `prefers-reduced-motion` still-frame alternative.** Approved moments: mark-done tick-in, proposal-accept fade, block-complete pulse, sparkline stroke on mount, progress-bar fill on visibility, status-pill state crossfade. Motion is the app breathing; not the app performing. **V4 — one accent per surface.** Bronze is the CTA color everywhere; category tint (bronze/green/slate/amber) may appear as a left stripe or a metric-strip cell but never as a competing CTA. R2 holds. **V5 — a data-viz element must be honest in its worst state.** A readiness trail with 10 red dots looks like 10 red dots, not smoothed into a green ring; a milestone bar at 5 % of target looks like a stub, not a "keep going!" motivator; a symptom-vs-load chart with a symptomatic peak shows the peak in orange, not blurred to amber. Gamified variants remain rejected (R5); charts, trends, rings-as-progress-not-reward, and honest empty states are approved. **In one sentence: Terav's viz is the honest shape of your data, motion is the app noticing you tapped, and bronze is the only invitation.**

Add to §H in the same commit that ships this brief. Future asks resolve to: "which of V1-V5 is missing from X?"

---

## Data shape changes

Small. Additive only.

```ts
// src/lib/schemas.ts — program schema
hero_metric?: {
  label: string;             // "TARGET", "FORM-HOLD", "ZONE"
  value_source: 'target_rpe' | 'target_zone' | 'target_form' | 'session_result';
};

// src/lib/state/readiness.ts — reading entry
type ReadingEntry = {
  date: string;
  state: 'green' | 'amber' | 'red';
  magnitude?: number;        // 0-1, tints the dot within its state color
};
```

Extras `weekly_count` is derived — `useMemo` reads last 7 days of drill logs. Metric-strip values, sparkline data, milestone progress all derive from existing store shape via memoized selectors. No migration.

---

## Component tree

Proposed:
```
TodaySession
├── AppHeader (wordmark + gear)                    [unchanged]
├── RouteDateRow (H1 inline + arrow-date-nav)      [Move B — merges 2 rows]
├── ReadinessTrail (14 dots + label)               [magnitude-tinted per V2/V5]
├── ProposalStrip (40 px compact → sheet on tap)   [Move B — was 200 px]
├── WorkoutHero                                    [NEW — Move A]
│   ├── HeroEyebrow (day+week eyebrow + status pill)
│   ├── HeroTitle (workout NAME, 26 px)
│   ├── HeroLede (row-type + program)
│   ├── MetricStrip (3 cells nested bg-surface)    [V1 viz]
│   ├── NumberedBlockList (right-aligned set count)
│   └── HeroCTA (bronze filled, w-full)
├── ExtrasBlock                                    [DashboardBlock, one tier lower]
│   ├── Title + Sparkline (weekly count)           [V1 viz]
│   └── DrillCategoryRow
└── BottomNav
```

### File-level changes

- **New: `next-app/src/components/workout/WorkoutHero.tsx`** — composes HeroEyebrow, MetricStrip, NumberedBlockList, HeroCTA. Reads `program`, `session`, `readiness` from store.
- **New: `next-app/src/components/workout/MetricStrip.tsx`** — 3-cell nested strip; takes `{ label, value, mono? }[]`.
- **`next-app/src/components/session/TodaySession.tsx:198-577`** — swap DashboardBlock at `:542` for `<WorkoutHero />`. Merge H1 + DateNav at `:217-226`. Compact ProposalCard.
- **`next-app/src/components/workout/ReadinessTrail.tsx:17-68`** — accept `magnitude` per reading; tint within state color; update aria-label.
- **`next-app/src/components/workout/ExtrasBlock.tsx`** (or inline) — 60×16 px sparkline next to title, from last-7-day drill logs.
- **`next-app/src/lib/schemas.ts`** — add optional `hero_metric` to program schema.
- **`next-app/src/lib/state/readiness.ts`** — add optional `magnitude` to reading entry.

### Delegate-to-specialist

- **Type / palette:** → `app-visual-craft` — apply ramp inside WorkoutHero + MetricStrip; audit that bronze CTA + left stripe + status-pill dot do not compete.
- **Ergonomics:** → `app-mobile-ux` — verify tap targets ≥ 44 × 44; Open Session CTA in cradle grip; 393 + 375 breakpoints.
- **A11y:** → `app-accessibility` — ARIA on ReadinessTrail (magnitude-aware summary), MetricStrip (`<dl>`/dt/dd), status-pill `role="status"`, focus order top-down.
- **Copy:** → `app-copy-clarity` — hero eyebrow, status-pill states (WORKOUT READY / CHECK FIRST / MOVED FROM TUE / IN PROGRESS / DONE), metric-strip captions, numbered block rows.
- **Motion:** → `app-motion-perf` — sparkline stroke reveal (400 ms + reduced-motion alt), status-pill crossfade (200 ms), progress-bar fill on Progress milestones (follow-on brief).

---

## Migration

Additive. No destructive migration.

- **Step 1:** ship WorkoutHero + MetricStrip components in isolation. Verify via story-file / hidden route.
- **Step 2:** swap DashboardBlock in TodaySession for WorkoutHero. Regenerate persona artifacts.
- **Step 3:** merge H1 + DateNav + compact ProposalStrip.
- **Step 4:** extend ReadinessTrail with magnitude coloring.
- **Step 5:** add extras sparkline.
- **Step 6:** ship + write §H V1-V5 into master task list in same commit.
- **Rollback:** WorkoutHero is additive; reverting the TodaySession swap restores DashboardBlock render. New schema fields are optional; no rollback there.

---

## Peer benchmarks

- **Hevy (post-2024):** exact composition Terav v1 is chasing — top status strip, hero workout card with metric strip inside, secondary block. Steal: metric-strip pattern (3-cell nested, 20 px numeric + 10 px caption). Reject: streak counter, thumbnail photos.
- **Runna today-view:** hero workout card with duration/pace/effort strip + a "training-plan progress" ring in the corner. Steal: metric strip. Reject: ring on Today (moves to Progress where target-adherence is honest — R8).
- **Linear inbox:** two-tier surface with a status pill on every row. Steal: status-pill pattern for the hero eyebrow. Reject: nothing — directly transferable.
- **Whoop app dark:** readiness ring is the hero. Steal: nothing on Today (R8). Steal on Progress: "trend up / flat / down" arrow-pill on retest deltas.
- **Anthropic console:** numeric-forward elevated cards, mono-caps eyebrows, warm-dark. Steal: entire type + surface vocabulary. Reject: nothing — this is Terav's north-star for tone.

---

## What this decision does NOT solve

- **Session view composition.** Deferred to `dev/design-briefs/2026-08-21-session-workshop-composition.md`. This is where the progress-ring (Option B's rejected treatment) may land honestly — fills as blocks complete during the workout, which is state you produced.
- **Programs catalog tile treatment** (Move D of deep review) — deferred to its own brief; not blocked by this call.
- **Program preview info-hierarchy** (Move E) — deferred.
- **Progress viz sweep** (Move C — sparkline wiring, humanize exercise_ids, milestone bars) — deferred to its own brief; V1-V5 already asks Progress to become this.
- **Whether magnitude-tinted trail survives founder review.** If founder decides it looks too heatmap-adjacent, fall back to plain trail. Reserve one iteration cycle.

---

## Estimated implementation cost

- **Today refresh (this brief):** 10-14 h. WorkoutHero + MetricStrip + ReadinessTrail magnitude + extras sparkline + Move B header compact + `hero_metric` schema. Medium-high confidence — mostly composition of primitives that already exist.
- **Stitch re-prompt for v1 + viz:** ~1 h, single mockup, one iteration budget.
- **§H V1-V5 written into master task list:** ~15 min, same commit.
- **Persona-harness regen + review:** ~1 h.

**Total appetite: ~14 h across one shippable batch (Batch 36).** Session, Progress, Programs preview, and Programs catalog follow in their own briefs — one per batch, per the prior call's discipline.

One rule for the ship: do not batch Today with Session or Progress. Ship Today first, screenshot personas, measure founder response. If Today reads as modern after this batch, ship the rest in order. If Today still reads as 1995, we are wrong about "keep the skeleton, add viz layers" and Option B becomes the next brief.
