# Terav — Design system (v1.0, full-surface)

Owner: product-design-lead
Written: 2026-08-20
Status: draft — awaiting Lane B jury + founder review
Related audits:
- `dev/audits/app/2026-08-20-market-research.md` (2026 peer landscape)
- `dev/audits/app/2026-08-20-viz-composition-call.md` (viz + composition call — V1-V5)
- `dev/audits/app/2026-08-20-viz-layer-brief.md` (six viz positions)
- `dev/audits/app/2026-08-20-deep-design-review.md` (five-move deep review)
- `dev/audits/app/2026-08-19-master-task-list.md` §G Rejected (R1-R12, hard constraint)
- `dev/audits/app/2026-08-19-founder-observations-queue.md` (O1-O21)
Governs: **all 13 surfaces** shipped as one coordinated batch (Batch 36).
Supersedes: any single-surface visual proposal from Batches 33/34/35.

---

## 0 · Philosophy

Terav is a **calm, disciplined, evidence-forward tool** for people who take one thing seriously at a time. Its aesthetic north star is the intersection of two 2026 peer clusters. First, the *serious operator tool* — Linear, Anthropic Console, Superhuman — where warm-dark ground plus a single chromatic accent plus tabular numerals plus generous whitespace signals "software made for grown-ups." Second, the *calm-first fitness family* — The Outsiders, Gentler Streak, Pliability — where anti-gamification is not a niche stance but a recognisable product membership. The apps Terav is nearest to are **The Outsiders** (2026 ADA Finalist, Gentler Stories' athlete tracker — serious + calm coexisting) and **Runna** (post-workout explanation card as the differentiator, calendar one tap away from Today). Terav borrows their surface temperature and information cadence, not their imagery or scoring.

The single move Terav does that everyone else doesn't: **explain-back + confirm-first + honest-viz combined**. Every peer ships at most two of these. Whoop has honest-viz and explain-back (Coach) but silently mutates. Runna has explain-back post-hoc but no confirm-first gate on plan changes. The Outsiders has honest-viz and calm-first but no citation contract. Terav's engine proposes, the user Accepts, every change cites a study or names its log signal, **and** the viz layer refuses to smooth over honest bad states (10 red readiness dots looks like 10 red dots). This is the design's actual product-integrity claim, and the system below is the visual grammar that makes it legible. Everything downstream — palette, primitives, motion, IA — either serves that claim or gets deleted.

---

## 1 · Tokens

Everything below is **the** token set. If a color, size, or duration is not in this section, it does not ship. Feed the YAML block directly into `tailwind.config.ts`; the CSS variables already live in `next-app/src/app/globals.css:8-55` — this is the canonical superset (existing tokens marked `[live]`, new tokens marked `[new]`, changed values marked `[bumped]`).

```yaml
# terav design system — tokens v1.0
# all values are the canonical source of truth
# do NOT introduce a color/size not in this file

color:
  # canvas + surfaces — warm-dark tonal layering, no shadows
  ground:     "#0e0f12"   # [live] app canvas — every route
  surface:    "#16181c"   # [live] card base — secondary blocks, extras, dashboards
  surface-2:  "#20232a"   # [live] card elevated — WorkoutHero, hero content, ExplainSheet
  surface-3:  "#2a2e37"   # [new]  modal / sheet peak — bottom sheets, dialogs only
  # rule: never four elevation tiers on one surface. surface-2 + surface = the pair.

  # text (2 muted levels max — P1-30 discipline holds)
  strong:     "#f4f5f7"   # [live] titles + hero numeric
  ink:        "#d6d9de"   # [live] body copy
  muted:      "#8a8f9a"   # [live] captions, meta, secondary

  # lines
  line:       "#4d525d"   # [live] input borders, hairlines around interactive
  line-soft:  "#24272f"   # [live] dividers, section boundaries

  # bronze — the ONE CTA color. never used for large decorative fills.
  bronze:         "#c89666"  # [live] filled CTAs, arc fill, target-hit sparkline
  bronze-hover:   "#d9a97c"  # [live] hover state (touch: unused)
  bronze-hi:      "#e2b686"  # [live] on-tint variant inside bronze/20 backgrounds
  bronze-active:  "#b3814f"  # [live] :active press feedback

  # slate — secondary accent, rehab/skill/mobility category tint
  slate:      "#79b8c4"   # [live] category tint (rehab/skill/mobility), status pill "moved"

  # semantic — state colors, NEVER used as CTAs
  green:         "#5fb37a"  # [live] "ready" / improving / session-done-felt-good
  amber:         "#e0a63a"  # [live] "check first" / worsening / caution
  amber-strong:  "#f0b854"  # [live] on-tint for amber/20
  red:           "#e5654b"  # [live] red-flag symptoms, intervention card
  red-strong:    "#f28068"  # [live] on-tint for red/20 (P1-59)

  # laterality — L/R visual marks in rehab tracks
  lat-left:   "#4a8894"   # [live] left-side markers
  lat-right:  "#a279a8"   # [live] right-side markers

  # rule (R2): bronze is CTA. slate/green/amber/red are STATE. never mix.
  # rule (§H V4): one accent per surface. bronze as CTA, one category tint (left stripe
  # or metric-strip cell), no third chromatic value in the same visible frame.

typography:
  font-sans:  "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
  font-mono:  "IBM Plex Mono, ui-monospace, 'SF Mono', Menlo, Consolas, monospace"
  # note: Inter is the sans workhorse. IBM Plex Mono replaces JetBrains Mono for
  # eyebrows + numeric captions — Plex was designed for data-accuracy interfaces
  # (per market research §4). Weight subsets shipped: sans 400/500/600/700, mono 400/500.
  # tabular-nums is a global default via `html { font-feature-settings: "tnum" }` [live].

  scale:
    # ramp: 10 · 11 · 12 · 14 · 15 · 20 · 26 · 32 (8-step, no middle weight, no 13, no 18)
    eyebrow-mono:      { size: 10px, weight: 500, tracking: 0.06em, case: upper, family: mono }
    label-mono:        { size: 11px, weight: 500, tracking: 0.04em, case: upper, family: mono }
    caption:           { size: 12px, weight: 400, tracking: 0em,    line-height: 1.4, family: sans }
    body:              { size: 14px, weight: 400, tracking: 0em,    line-height: 1.5, family: sans }
    body-strong:       { size: 14px, weight: 600, tracking: 0em,    line-height: 1.5, family: sans }
    section:           { size: 15px, weight: 600, tracking: -0.01em,line-height: 1.4, family: sans }
    numeric-caption:   { size: 15px, weight: 500, tracking: 0em,    line-height: 1.2, family: mono }
    metric-display:    { size: 20px, weight: 500, tracking: -0.01em,line-height: 1.1, family: mono }
    h3-card:           { size: 20px, weight: 600, tracking: -0.02em,line-height: 1.2, family: sans }
    h2-hero:           { size: 26px, weight: 600, tracking: -0.02em,line-height: 1.15,family: sans }
    h1-display:        { size: 32px, weight: 700, tracking: -0.03em,line-height: 1.05,family: sans }
    # rule (R3): H1 never > 32px. no Whoop-scale hero (48+ px numeric).
    # rule (R4): mono-caps is a TIER (eyebrow + label + numeric), not a style.

spacing:
  # 4px base — every spatial value is a multiple. no rogue 5/7/13/17.
  scale: [0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80]
  # mobile gutter: 16px page horizontal, 12px card-internal, 8px inline-cluster
  # desktop gutter: 24px page horizontal, 16px card-internal (only relevant on /report + /profile wide)
  # rule: card padding = 16px on 393; internal grid gutters = 12px; row rhythm = 12-16px vertical.

elevation:
  # tonal layering ONLY. no drop shadows in dark mode (per market research §4 — Linear rule).
  # elevation is a FILL step on the same warm axis.
  e0: { fill: ground,    border: none                  }  # canvas
  e1: { fill: surface,   border: "1px solid line-soft" }  # secondary card
  e2: { fill: surface-2, border: "1px solid line-soft" }  # primary card (WorkoutHero)
  e3: { fill: surface-3, border: "1px solid line",     shadow: "0 -8px 32px rgba(0,0,0,0.6)" }
       # sheets/modals ONLY. the shadow is a directional cue (sheet slides up); still no ambient shadow.
  # DELETE: the two-part box-shadow at DashboardBlock.tsx:99 — invisible on #0e0f12 ground, not carrying weight.

radius:
  none:   0
  sm:     4px    # inline pills (StatusPill, chips)
  md:     8px    # cards, buttons, tiles (default)
  lg:     12px   # bottom sheets, modals
  full:   9999px # avatar circle only
  # rule: 8px is the default. never a 5/6/7 rogue radius.

motion:
  # three duration buckets, no fourth. every animation is either UI-state, data-reveal, or hero.
  ui-state:     200ms   # state changes, pill crossfades, mark-done, press feedback
  data-reveal:  400ms   # sparkline stroke, progress-bar fill, arc-bar fill, heatmap stagger
  hero:         800ms   # once-per-app-launch splash-esque moment — reserved. use ONE per surface, max.
  easing:       "cubic-bezier(0.2, 0.8, 0.2, 1)"   # ease-out, no springs, no bounce
  stagger-cascade: 50ms  # card mount cascade (§H V3 approved)

  reduced-motion:
    # global rule: any duration > 0 collapses to 0.01ms to preserve transition-end events.
    # opacity keeps (no motion sickness). transforms + scale + auto-play REMOVED.
    # haptic keeps (accessibility-neutral).
    # data-viz reveals fall to their final frame. no partial-state renders.
    # tokens `ui-state`, `data-reveal`, `hero` all collapse.

haptic:
  # 5-signal vocabulary — nothing more, nothing less. iOS + Android compatible.
  confirm:      { pattern: "light-tap",   duration: 15ms   }  # tap register
  accept:       { pattern: "medium-tap",  duration: 25ms   }  # proposal accepted, session done
  error:        { pattern: "double-tap",  duration: 40ms   }  # form error, blocked action
  milestone:    { pattern: "soft-heavy",  duration: 60ms   }  # arc-complete, retest logged
  section:      { pattern: "light-tap",   duration: 10ms   }  # tab change, route mount
  # NEVER: sustained rumble, celebratory bursts. gamification vector; R5.
```

**What is new vs live:** `surface-3` (sheets/modals), the `bronze-hi` variant enters the CTA docs, `caption` at 12px replaces stray `text-[13px]` (P0-4 already swept — this locks it), the whole `motion` block is codified for the first time (was ad-hoc in globals.css), the `haptic` vocabulary is new (not yet wired). Everything else is a formalisation of what already lives in `next-app/src/app/globals.css:8-55`.

**What is deleted:** the two-part box-shadow on `DashboardBlock.tsx:99` (invisible, no work); any `text-[13px]` / `text-[18px]` sizes not on the ramp (P1-31 pattern — collapse to `caption`/`h3-card`); any `text-muted/70` (P1-30 killed it — do not revive); any drop shadow beyond the sheet directional cue.

---

## 2 · Primitives (component vocabulary)

Twelve components. If a surface needs something outside this list, that is a new-primitive proposal — write a brief first. **Do not add variants to escape the discipline.**

### 2.1 `DashboardBlock` — the workhorse [existing, keep]

```ts
type DashboardBlockProps = {
  eyebrow?: string;         // 10-11px mono-caps
  title: string;            // h3-card 20px
  lede?: string;            // caption 12px
  accent?: 'bronze'|'slate'|'green'|'amber';  // 4px left stripe (category tint)
  collapsible?: boolean;
  primaryCta?: { label: string; onClick: () => void };
  children: ReactNode;
};
```

- **Use for:** Extras block, Signals card, secondary content, "why this?" auxiliary blocks, meta/spec sections.
- **Do NOT use for:** the primary daily action (use `WorkoutHero`), category browsing (use `CategoryTileGrid`), retest metrics (use `DashboardBlock` **wrapping** the retest cluster — not each metric card).
- **Compliance:** R1/R2/R3/R4 pass. This is the primitive that got over-used in Batches 33/34/35 — the fix is a dedicated hero, not more props here.

### 2.2 `WorkoutHero` — the primary anchor [NEW]

```ts
type WorkoutHeroProps = {
  eyebrow: string;                           // "THURSDAY · WEEK 3 OF 6"
  title: string;                             // "Norwegian 4×4" — h2-hero
  lede: string;                              // "Row/Ski · concurrent strength maintenance"
  status: StatusPillProps;                   // right-eyebrow pill (WORKOUT READY / CHECK FIRST / ...)
  metrics: MetricStripClusterItem[];         // 3 cells: duration / blocks / target
  blocks: { number: number; name: string; setsLabel: string }[];
  primaryCta: { label: string; onClick: () => void };  // "Open session →"
};
```

- **Use for:** the workout summary on Today, the session opener on `/session/[slug]`, the retest hero on Progress' retest-week Monday state, the "start intake" hero on program preview.
- **Do NOT use for:** anything else. This primitive earns its cost by being the **primary emphasis** on the surface. Multiple `WorkoutHero`s on one route = system failure.
- **Compliance:** R1 (no photo), R2 (bronze CTA only), R3 (26px title ≤ 32px cap), R4 (eyebrow + status pill are mono-caps), R5 (no streak/gamification — "workout ready" is a state, not a game), R8 (no autonomous score — metrics are engine-known facts from `program.json`, not a proprietary composite).
- **Composition:** e2 surface, no shadow, no left stripe (status pill does the semantic work). MetricStripCluster nested on e1 (real tonal contrast, not decoration).

### 2.3 `Sparkline` — trend as shape [existing, expand]

```ts
type SparklineProps = {
  data: number[];               // ordered oldest→newest
  direction?: 'improving'|'worsening'|'flat';   // color tint
  targetValue?: number;         // [new] horizontal dashed line; goes solid bronze when crossed
  width?: number;               // default 96
  height?: number;              // default 20
  ariaLabel: string;            // required — SR summary in words
};
```

- **Use for:** every state that has ≥ 2 data points (§H V2). Readiness strip, retest metric cards, milestone context, extras drill-count trend.
- **Do NOT use for:** point-in-time single values (use `StatusPill`), target-oriented promises (use `OutcomeBar`), completion booleans (use `WeeklySessionStrip`).
- **Compliance:** R5 (no streak — a sparkline is a shape), R8 (single self-reported series, not a composite), R11 (self only, never aggregated).

### 2.4 `ReadinessTrail` — magnitude-tinted state history [existing, upgrade]

```ts
type ReadinessTrailProps = {
  readings: { date: string; state: 'green'|'amber'|'red'; magnitude?: number }[];
  window?: 14 | 30;             // default 14; 30 on Progress
  ariaLabel: string;
};
```

- **Use for:** ambient state history on Today (14-dot inline strip), Progress top-of-page 30-day trail expansion.
- **Compliance:** R5 (no "N-in-a-row" language, no streak counter — the dots are state), R8 (state per day is user-authored via `/check`, not proprietary).
- **Upgrade from live:** magnitude tint inside each state color (§H V2 · V5) — a green dot at 0.9 magnitude is a deeper green than a green dot at 0.5. Honest gradient of intensity within a state.

### 2.5 `WeeklySessionStrip` — 7-cell M-T-W-T-F-S-S [NEW]

```ts
type WeeklySessionStripProps = {
  weekStart: string;
  days: { dayLetter: string; scheduled: boolean; completed: boolean; isToday: boolean; isRest: boolean }[];
  onCellTap?: (dayIndex: number) => void;
};
```

- **Use for:** inside `WorkoutHero` on Today, expanded inside `/session/[slug]` header, replicated at the top of `/week`.
- **Do NOT use for:** any "N in a row" language. Adjacent completed cells stay adjacent completed cells — never a badge, never a count.
- **Compliance:** R5 (state, not a game — a missed cell is a neutral slate outline, not a red shame), R8 (boolean per day, no composite).

### 2.6 `ArcProgressBar` — "week 3 / 6" horizontal [NEW]

```ts
type ArcProgressBarProps = {
  programName: string;
  glyph: CategoryGlyph;
  weekCurrent: number;
  weekTotal: number;
  retestSchedule: { weekIndex: number; label: string }[];
  nextMilestone?: string;
};
```

- **Use for:** above `WorkoutHero` on Today (single program), stacked per-program on multi-track Today, full-width on Progress with retest waypoints as diamond markers.
- **Do NOT use for:** self-imposed streaks, session count, calendar-independent goals. The bar advances with **time** against an authored program endpoint — it is not a game state.
- **Compliance:** R5 (calendar-driven, not user-achievement-driven), R8 (single metric — weeks elapsed / weeks total — not a composite readiness score).

### 2.7 `MetricStripCluster` — 3-cell nested strip [NEW]

```ts
type MetricStripClusterItem = { label: string; value: string; hint?: string };
type MetricStripClusterProps = { items: MetricStripClusterItem[]; density?: 'default'|'compact' };
```

- **Use for:** inside `WorkoutHero` (duration/blocks/target), inside retest metric cards (baseline/current/Δ), inside program preview meta grid (weeks/hours-per-week/level).
- **Do NOT use for:** more than 3 cells (compresses below legibility at 393). If a 4th value exists, promote it to its own row.
- **Compliance:** all pass. Metric labels are mono-caps eyebrow tier; values are `metric-display` mono numeric.

### 2.8 `CategoryTileGrid` — 2×2 or 2×3 browse [NEW]

```ts
type CategoryTileGridProps = {
  categories: {
    id: string;
    name: string;
    glyph: CategoryGlyph;
    tint: 'bronze'|'slate'|'green'|'amber';
    count: number;
    pitch: string;
  }[];
  onTileTap: (id: string) => void;
};
```

- **Use for:** `/programs` catalog (2×3 grid of 6 categories), Extras block on Today (2×2 grid of 4 drill categories).
- **Do NOT use for:** vertical text lists (that is `DashboardBlock` stacked). Tiles carry visual identity via glyph + subtle 8-12% gradient overlay.
- **Compliance:** R1 (gradient is CSS math, not photography), R2 (tiles are tap targets, not CTAs — bronze is not consumed).

### 2.9 `WeeklyHeatmap` — 7×12 GitHub-style [NEW]

```ts
type WeeklyHeatmapProps = {
  cells: { date: string; sessionState: 'green'|'amber'|'red'|'rest'|'missed' }[];  // 7 × 12 = 84
  onCellTap?: (date: string) => void;
};
```

- **Use for:** top of Progress route only. Nowhere else — this primitive is heavy and its context is "the shape of my last 12 weeks."
- **Do NOT use for:** streak-counter framing, "keep the green going" copy nearby, any label that reads compliance.
- **Compliance:** R5 (§H V5 explicit — a missed day is slate outline, not red shame; done+red-symptoms IS red because that's honest; no streak language anywhere near the grid), R8 (per-cell state = one self-reported symptom + one boolean session-done, not a composite).

### 2.10 `OutcomeBar` — baseline → target on preview [NEW]

```ts
type OutcomeBarProps = {
  metricName: string;
  baselineValue: string;
  targetValue: string;
  rangeCaption: string;   // "TYPICAL RANGE +15 TO +25 KG · 8 WEEKS"
};
```

- **Use for:** `/programs/[slug]` "What you'll achieve" section — stacked 2-3 rows. Static; not a live progress bar.
- **Compliance:** R11 (rangeCaption is authored from the evidence base, not aggregated from users), R5 (this is a spec-visualisation of intent, not a progress-tracker), R8 (baseline + target are authored numbers).

### 2.11 `ExplainSheet` — the "because…" surface [align with existing `InfoSheet`]

```ts
type ExplainSheetProps = {
  trigger: 'proposal-citation'|'metric-explain'|'engine-signal';
  title: string;
  citation?: { label: string; source: string; year: number };
  logSignal?: { name: string; value: string; window: string };
  body: string;
};
```

- **Use for:** the "why this?" tap on every engine-proposed change, every retest-metric explain, every readiness-state tap. Opens as a bottom sheet at e3.
- **Do NOT use for:** first-run help, generic tooltips (use `title` attr or inline caption), settings.
- **Compliance:** this is Terav's explainability pattern surfacing per market research §5. Citations always name a source (study or log signal). Never a chat.

### 2.12 `StatusPill` — the chip pattern [existing, formalise]

```ts
type StatusPillProps = {
  label: string;                           // "WORKOUT READY", "CHECK FIRST", "MOVED FROM TUE"
  tone: 'green'|'amber'|'slate'|'muted';   // never bronze — bronze is CTA
  dot?: boolean;                           // colored dot prefix
};
```

- **Use for:** `WorkoutHero` right-eyebrow, program preview status (ACTIVE/REVIEWED), Profile identity chip, proposal state, retest waypoint state.
- **Do NOT use for:** primary action (use bronze CTA), long labels (>16 chars — reflow to a caption instead).
- **Compliance:** R2 (bronze is not a pill tone — tone is semantic state, CTA is separate).

**What this primitive set explicitly rejects:**
- Score-donut hero — R8 (see §5 for the semantic-hero call that replaces it).
- Ring-as-goal — R8 + market research §3 (rings-as-baseline is OK, but rings-as-close-me is Apple Watch which is exactly the mechanic Terav rejects).
- Streak counter — R5.
- Photography components — R1.
- Coach chat component — R12.
- Video component — R10.

---

## 3 · Surface patterns (all 13 surfaces)

Every surface picks from §2. Deviations are prohibited; deviations become new primitive proposals in a new brief.

| # | Surface | Route | Pattern | Primitives used | V1-V5 check |
|---|---|---|---|---|---|
| 1 | Today | `/` | Bento — arc bar + workout hero + secondary tiles | ArcProgressBar · WeeklySessionStrip · ReadinessTrail (sparkline variant) · WorkoutHero · MetricStripCluster · CategoryTileGrid (Extras 2×2) · Sparkline | V1 · V2 · V3 · V4 · V5 ✓ |
| 2 | Session | `/session/[slug]` | Focused workshop — hero at top, block list, live progress ring [DEFERRED per viz-comp §What-this-doesn't-solve] | WorkoutHero (compact) · WeeklySessionStrip · MetricStripCluster (per-block) · block-progress ring [session-only] · Sparkline (rest-timer trend) | V1 · V3 · V5 ✓ |
| 3 | Week | `/week` | Collapsed calendar rows, MoveSheet on tap | WeeklySessionStrip (top) · DashboardBlock (per-day collapsed) · ExplainSheet (why-this rest day) · StatusPill (per-day state) | V2 · V4 ✓ (V1 satisfied by top strip) |
| 4 | Progress | `/progress` | Data-viz-dense | WeeklyHeatmap (top) · ArcProgressBar (expanded with waypoints) · DashboardBlock (retest cluster wrappers) · MetricStripCluster (baseline/current/Δ) · Sparkline (with `targetValue`) · MilestoneBar (via `OutcomeBar` static variant repurposed for live progress) | V1 · V2 · V3 · V4 · V5 ✓ |
| 5 | Programs catalog | `/programs` | Category tile grid | CategoryTileGrid (2×3 = 6 categories) · DashboardBlock (filtered list below tiles) · StatusPill (per-program status) | V4 ✓ (V1 via tile glyphs) |
| 6 | Program preview | `/programs/[slug]` | Trust-escalation vertical stack | WorkoutHero variant (top — as intake entry) · DashboardBlock (Who this is for + What you'll achieve, e2 with bronze stripe) · OutcomeBar (stacked 2-3) · MetricStripCluster (weeks/hours/level) · StatusPill (ACTIVE/REVIEWED) · ExplainSheet (citation drill-down) | V1 · V4 · V5 ✓ |
| 7 | Intake (per program) | `/programs/[slug]/intake` | Step-by-step wizard | DashboardBlock (per step) · StatusPill (step counter as pill) · form primitives (buttons, sliders — not in this doc; delegated to component-level) | V4 ✓ (no viz needed on a form) |
| 8 | Check (morning check) | `/check` | Slider + confirm | DashboardBlock · SliderRow (form primitive) · StatusPill (state preview: "you're logging AMBER") · ReadinessTrail (post-submit preview) | V4 ✓ |
| 9 | Profile | `/profile` | Identity + programs + more | Identity chip (currently best card in app — keep exactly as shipped) · DashboardBlock (per program row) · StatusPill (INTAKE PENDING, ACTIVE, PAUSED) · MoreList (4 rows: Extras/Report/Guide/Evidence — treated as a `DashboardBlock` list variant) | V4 ✓ (V1 satisfied by identity chip + program stripe) |
| 10 | Account (auth + delete) | `/account` | Sectioned settings | DashboardBlock (per section — Sign-in / Programs / Extensions / Data & privacy) · StatusPill (extension state) · ExplainSheet (delete-consequence detail) | V4 ✓ |
| 11 | Evidence | `/evidence` | Reference library | DashboardBlock (per-citation card) · StatusPill (referenced/reviewed/verified — three tones) · ExplainSheet (full citation → external link) | V4 ✓ |
| 12 | Guide | `/guide` | Documentation reader | H1 · body · DashboardBlock (per-section) · inline cross-references | V4 ✓ |
| 13 | Report | `/report` | Specialist-shareable summary | H1 · MetricStripCluster (top summary) · WeeklyHeatmap (embed) · DashboardBlock (per-week narrative) · footer with print-friendly export | V1 · V2 · V4 · V5 ✓ |

**Reading the table:** V1 (viz on hero) applies to Today/Session/Progress/Programs preview/Report. V2 (trend + history when n≥2) applies to every state surface. V3 (bounded motion) applies to Today/Session/Progress + any surface with a data-reveal moment. V4 (one accent per surface) applies everywhere — non-negotiable. V5 (honest worst state) applies everywhere but is load-bearing on Today (readiness), Progress (heatmap), Program preview (outcome bar — no false-precision projections).

**What did NOT get a per-surface hero:** Week, Check, Profile, Account, Evidence, Guide, Intake. These are utility surfaces. Adding a `WorkoutHero` there would violate "one primary emphasis per view" — the utility IS the emphasis.

---

## 4 · The bento-grid call

**The call: Today is a single-column stack with two tiles side-by-side ONLY at the Extras block. Not a Garmin 2×N bento. Not a 2-column full-page grid.**

Why not Garmin bento on 393:
- 393 - 32 (page margins) = 361px content width. A 2-column bento with 12px gutter = ~174px per tile. That's genuinely legible for a metric card. But Terav's tiles aren't primarily metric cards — they're **workout heroes with metric strips inside**. Bento-tile-sized (174px wide, ~140px tall) cannot hold `WorkoutHero`'s composition (26px title + 3-cell strip + numbered block list + CTA) without breaking legibility. The primary anchor loses its anchor role.
- Multi-track users (`persona-multitrack`) with 2 active programs still get one primary program surfaced — the second stacks below via `ArcProgressBar` + inline block list, not a competing bento tile. Fold-competition on Today is exactly the failure Batches 33/34/35 didn't fix; a 2-col bento reinvents it.
- Bento's stated appeal in the market research is *dashboards for slow-moving data* (Garmin's In Focus tiles, Ultrahuman PowerPlugs). Terav's Today is *primary-action surface for one focused thing*, not a data wall. Different job → different composition. The Outsiders — Terav's closest peer — uses **one hero + a stack of individual metric cards below**, not a bento. That's the pattern to follow.

Where bento shows up in Terav:
- **Extras block on Today:** 2×2 grid of drill category tiles. This is the bento moment. Tiles are ~172×64 (Position 3 of viz-layer brief), correctly sized because each tile is a *browse target*, not a hero.
- **Programs catalog:** 2×3 category tile grid. Same reasoning — browse.
- **Progress:** 7×12 heatmap **is** a bento of a different kind (uniform micro-cells). Not the 2-col big-tile pattern; the grid is a viz primitive.

So Terav uses grid layouts where the job is *browse* or *aggregate viz*. Terav does **not** use bento for the primary daily hero, which is where Garmin puts theirs. This is a deliberate deviation from the 2026 default because Terav's positioning — one focus, one arc, one primary action — demands hero singularity. The market research call for bento is a *category signal*, not a *category law*. When category signal collides with product positioning, positioning wins.

**Test to falsify:** if after Batch 36 ships, personas + founder walk Today and it reads as under-organised ("where is everything?"), revisit and consider a 2-col bento below the workout hero (Extras + Signals + Adherence as three ~172px-wide tiles). If Today reads as focused ("clear what to do"), the call is correct and Progress remains the bento-adjacent surface via its heatmap.

---

## 5 · The score-hero call

**The call: Terav ships a semantic readiness hero that is NOT a proprietary score-donut. Composition: a `StatusPill` inside `WorkoutHero`'s eyebrow row (WORKOUT READY / CHECK FIRST / MOVED FROM TUE / IN PROGRESS / DONE), backed by a 14-day `ReadinessTrail` sparkline in the ambient chrome above the hero, and an `ExplainSheet` "why this?" that surfaces the log signal or citation on tap. That's the readiness hero. No ring. No donut. No 72pt Whoop number.**

The R8 constraint is: **no autonomous proprietary composite score rendered as a big ring at the top of the primary surface**. It is not: no state indicator, no semantic readiness signal, no color hint. The distinction is load-bearing:

- **What R8 forbids:** a "Readiness 68%" number in a big ring, computed by a proprietary algorithm the user did not consent to and cannot inspect. The Whoop pattern. The Outsiders' "Training Readiness score" (72pt fill-arc) is R8-adjacent — arguably compliant because the user opens it and gets the ratio, but the pattern of *big single number as identity of the app* is the trap.
- **What R8 permits:** a state pill (WORKOUT READY / CHECK FIRST) whose meaning is derived from the user's own morning check + engine-known program state, with a "why this?" that names the specific inputs. This is semantic — green means "you logged a green check + engine says today's workout is ready" — not autonomous.

The composition, precisely:

```
+-------------------------------------------------+
|  READINESS · GREEN ▁▂▃▄▅▄▃▂▃▄▅▆▄▅           →  |  <- ReadinessTrail sparkline (30-day, 96×20)
|                                                 |     tap opens ExplainSheet with study + signals
|  +-------------------------------------------+  |
|  |  THURSDAY · WEEK 3 OF 6   [◕ WORKOUT READY] | |  <- eyebrow (left) + StatusPill (right)
|  |  Norwegian 4×4                              | |  <- WorkoutHero title
|  |  ...                                        | |
|  +-------------------------------------------+  |
+-------------------------------------------------+
```

- The **StatusPill** carries the categorical state (green/amber/slate) — the user reads it in <200ms and decides "am I going / am I checking first / has this been moved."
- The **ReadinessTrail sparkline** provides trend context (§H V2) — today isn't a single dot in isolation; it's the current position on a 30-day shape. Improving trend = green sparkline tint, worsening = amber tint, flat = bronze — this is the honest-viz commitment.
- The **ExplainSheet** on tap opens a bottom sheet naming the specific inputs: "Green because Symptom score 2/10 (green threshold ≤ 3), Sleep proxy OK, no engine-flagged risk. Citation: Halson 2014 recovery framework."

**Why this is not R8:**
- No composite hidden math. The pill is a threshold on a signal the user logged. The trend is that same signal over 30 days.
- No dominant numeric hero. The largest element on Today remains `WorkoutHero`'s **workout name** at 26px — "Norwegian 4×4", not a readiness percentage.
- No "close me" mechanic. There is no goal state to reach on the pill. Green is a state, not an achievement.

**Why this is stronger than a big ring:**
- A ring answers "what's my score?" A pill + trend + why answers "what should I do?" — which is what a rehab/strength/skill user actually wants at 6am.
- A ring is a fixed visual regardless of state — the pill collapses to invisibility on IN PROGRESS / DONE states, which is the correct behavior when the daily-check job is done.
- The Outsiders' fill-arc is the current calm-family default. Terav's pill + sparkline is *more disciplined* than the fill-arc — one accent tone, no arc chrome, all the signal at 1/10 the pixel budget.

**Cross-persona guardrails:**
- persona-recover (rehab, symptomatic morning) — pill reads CHECK FIRST amber. Sparkline shows worsening tint. Tap ExplainSheet says "Amber because Groin symptom 6/10 (amber threshold 4-7). Engine paused strength blocks per program authored rule."
- persona-strength (green, overperformer) — pill WORKOUT READY green. Sparkline flat bronze. Tap says "Green because Symptom clean, Sleep proxy OK, TM 152.5 kg is at cycle-end schedule."
- persona-erratic (15 skips) — pill MOVED FROM TUE slate. Sparkline honest (whatever it shows). No shame framing. Tap says "Moved from Tuesday per your explicit move on 18 Aug."

---

## 6 · Migration order

**The call: Batch 36 ships all 13 surfaces in ONE coordinated deploy. No incremental ship. No per-surface staging. Cross-surface consistency is the acceptance criterion; that criterion cannot be measured mid-migration. Founder-set constraint holds — Lane B jury reviews the system.**

The alternative (Batch 36 primary surfaces = Today/Session/Progress/Programs/Preview, Batch 37 secondary = Week/Check/Profile/Account/Evidence/Guide/Report) is tempting for scope-shrink reasons and is **rejected** because:

- **The primitive set is the migration.** Once `WorkoutHero`, `MetricStripCluster`, `CategoryTileGrid`, `WeeklyHeatmap`, `OutcomeBar`, `WeeklySessionStrip`, `ArcProgressBar` all exist and are wired, the secondary surfaces are 2-6h each of primitive-composition. There is no substantive engineering saving in staging them.
- **Visual drift during the gap poisons the jury.** If Batch 36 ships hero surfaces and Batch 37 ships secondary two weeks later, in the interim persona-recover walks the app and sees Today at v1.0 quality + Profile at 2022 quality. The founder walks the same. The jury walks the same. That mid-state IS the failure mode of every previous batch — beautiful individual surface + inconsistent whole. Ship together.
- **Persona harness cannot verify partial state.** The harness regenerates every surface. A half-migrated app produces a half-consistent artifact, which is nothing to judge against a pre-migration baseline. Do it once.

Cost estimate for Batch 36 (all 13 surfaces):
- Primitives (new): WorkoutHero 8h + WeeklySessionStrip 3h + ArcProgressBar 6h + MetricStripCluster 3h + CategoryTileGrid 5h + WeeklyHeatmap 5h + OutcomeBar 4h + StatusPill formalisation 2h. Subtotal: **36h**.
- Primitives (upgrade): ReadinessTrail sparkline variant 3h + Sparkline `targetValue` prop 2h + DashboardBlock cleanup (remove shadow, tighten props) 2h + ExplainSheet alignment on InfoSheet 3h. Subtotal: **10h**.
- Surface wiring: Today 8h + Session 6h + Week 4h + Progress 10h + Programs 5h + Preview 6h + Profile 3h + Account 2h + Evidence 3h + Guide 2h + Report 4h + Intake 2h + Check 2h. Subtotal: **57h**.
- Schema additions: `hero_metric` per program 2h + `expected_outcomes` per program 3h + `hero_metrics` (2-3 top-signal) per program 3h + `magnitude` field on readings 1h + backfill authoring for 5 shipping programs 6h. Subtotal: **15h**.
- Persona harness regen + verification: **3h**.
- **Total Batch 36 appetite: ~121h.** Realistic across 2-3 weeks of focused work by one engineer, or 1 week by two.

Rollback plan: Every new primitive is additive; the DashboardBlock swap on each surface is a git-revert. Schema additions are optional fields. Nothing destructive.

Ship order **within** Batch 36 (all in the same deploy, but in-branch ordering):
1. Ship primitives to a hidden route (`/dev/primitives`) — story-file style. Visual QA against Stitch v1+viz mockup.
2. Wire Today + Progress (the two surfaces the jury will look at first).
3. Wire Session + Preview + Programs (the three that convert users).
4. Wire Week + Profile + Account + Evidence + Guide + Report + Intake + Check.
5. Persona-harness regen.
6. Founder + Lane B jury review of the full-system artifact set.
7. Deploy.

---

## 7 · What Lane B jury tests

The jury does not review individual surfaces. The jury reviews **the system as it walks across surfaces**. Success criteria, in the order they apply:

1. **V1-V5 compliance per surface.** Walk each of the 13 surfaces. For each: does at least one viz element exist on hero surfaces (V1)? Does every state show history when n≥2 (V2)? Is motion within 200/400/800 buckets with reduced-motion alts (V3)? Is bronze the sole CTA + one accent per surface (V4)? Does the worst state look worst (V5)? Score per surface, average > 4/5 to pass.

2. **Cross-surface consistency.** `StatusPill` on Today's WorkoutHero must be pixel-identical (radius, padding, tone tokens, dot) to `StatusPill` on Profile's program row and Program preview's ACTIVE chip. Same for `MetricStripCluster` on WorkoutHero and Progress retest. Any deviation is a system failure. The jury walks all 13 surfaces looking for chip variance, sparkline variance, and eyebrow-tier variance.

3. **Peer-benchmark test.** Take three side-by-side screenshots — Terav Today, The Outsiders home, Runna today. Would a designer looking at all three read Terav as a peer product from 2026? If Terav visually reads as 2022 (single-column prose stack) or as Whoop (score-hero), fail. If Terav reads as *its own thing in the calm-family cluster*, pass. This is subjective; the jury calls it.

4. **Ergonomic test (delegate to `app-mobile-ux`).** Every primary CTA in the cradle thumb zone (bottom third of 393×852). Every tap target ≥ 44×44. `WorkoutHero`'s "Open session →" specifically — measured against the 393×852 grid. StatusPill top-right is a state indicator (high-thumb-cost is correct — not for accidental taps). Pass criteria: all 13 surfaces have primary action reachable one-handed.

5. **A11y test (delegate to `app-accessibility`).** WCAG 2.2 AA on every surface. Every viz element gets an `aria-label` prose summary. Every StatusPill has `role="status"`. Every sparkline has a text alternative. Focus order is top-down on every surface. Contrast ratios verified against the token set. Pass criteria: 0 open a11y issues before Batch 36 deploy.

6. **Perf test (delegate to `app-motion-perf`).** Bundle cost of new primitives measured. Target: net delta < 20 KB gzipped across all 7 new components. No new dependencies. Motion respects `prefers-reduced-motion` globally. CLS < 0.01 on Today. LCP < 2.0s on 4G cold. INP < 200ms on the primary CTAs.

7. **Copy honesty test (delegate to `app-copy-clarity`).** Every viz + explain pair passes the "would a scientist accept this claim?" bar. The sparkline is honest at n=2. The heatmap is honest with 10 missed days. The OutcomeBar is honest about typical range including the low end. The StatusPill explanation cites the log signal or the study. Pass criteria: no viz element makes a claim its data cannot substantiate.

**Fail states the jury explicitly watches for:**
- Any surface with two competing primary CTAs — V4 breach.
- Any viz element with no aria alternative — a11y breach.
- Any hero surface that is still text-only — V1 breach.
- Any "N in a row" language anywhere — R5 breach.
- Any composite readiness percentage as a big ring — R8 breach.
- Any photography/illustration/mascot — R1 breach.
- Any surface where the workout name is smaller than the status/count/eyebrow — hierarchy inversion (the deep review's core diagnosis).

---

## 8 · Ship discipline

The rules of engagement between now and Batch 36 deploy:

- **No new UI code until this document is founder-approved.** Every open PR referencing UI touched by Batches 33/34/35 pauses. Bug-fixes to shipped code are allowed; new visual work is not.

- **Every implementation PR must cite this document.** PR description includes: "This PR ships §{X} of `dev/audits/app/2026-08-20-terav-design-system.md`. Primitives touched: {list}. V1-V5 checks: {pass/notes}. R-list compliance: {pass}."

- **Every new component must respect V1-V5 + §G Rejected + this system doc.** No exceptions. If a surface needs something not in §2, the escalation path is a new brief that *proposes* an addition to this document — not a component shipped ahead of the doc.

- **Persona harness regenerates twice.**
  - **Pre-Batch-36 baseline** (already exists — mtime 2026-08-20 per deep review §1). Save these artifacts as `tests/e2e/artifacts/personas.baseline-pre-batch-36/` before Batch 36 lands.
  - **Post-Batch-36 verification** (regenerate against Batch 36 deploy). Founder + jury walk both sets side-by-side.

- **Success gate: cross-surface consistency + founder-perception improvement (defined a priori).**
  - **Consistency:** the jury pass in §7 items 1 + 2.
  - **Founder perception:** the founder walks the post-Batch-36 artifacts (all 13 surfaces × 5 personas = 65 screenshots). They score each surface on the 1-10 scale from the deep review, blind to their previous score. A pass is: average across 13 surfaces rises from ~5.2/10 (deep review baseline) to ≥7.0/10, with no surface below 6.0. This is the a-priori gate.

- **If the gate fails:** we are wrong about the system. Do not iterate on this document — write a new brief diagnosing the gap. Options at that point: (a) the pattern set is right but wiring is buggy → fix and re-verify; (b) the pattern set is wrong for Terav's positioning → new brief, potentially deeper restructure; (c) the founder-perception axis is measuring the wrong thing → separate brief. Do not silently patch.

- **What this document does NOT cover.**
  - Landing site (separate system — `landing-conversion-strategist` owns).
  - Marketing pages, blog, changelog (marketing brief, not app).
  - Onboarding sequence copy — delegate to `app-copy-clarity`.
  - Exact type ramp math and palette contrast ratios beyond §1 — delegate to `app-visual-craft` to verify each token against WCAG 2.2 AA.
  - Motion easing curves beyond `ease-out (0.2, 0.8, 0.2, 1)` — delegate to `app-motion-perf`.
  - Component-level accessibility semantics (aria attributes, focus management) — delegate to `app-accessibility`.

- **What this document IS.** The complete visual + composition + primitive contract for the app. Every future design decision resolves against §1 + §2 + §3 + the V1-V5 rules from viz-composition. If a proposal violates any, either the proposal changes or this document does — via a written brief, not a silent PR.

---

## Appendix A · Primitive-to-surface matrix (double-check)

Reading this bottom-up: every primitive should have at least one primary consumer surface. If a primitive appears in fewer than 2 surfaces, it's a one-off (kill it or fold it into another).

| Primitive | Surfaces used on | Count |
|---|---|---|
| DashboardBlock | Today (Extras), Week, Progress (wrappers), Programs (filtered list), Preview (Who this is for / What you'll achieve), Intake, Check, Profile, Account, Evidence, Guide, Report | 12 |
| WorkoutHero | Today, Session, Progress (retest-week Monday), Preview (intake entry) | 4 |
| Sparkline | Today (ReadinessTrail), Progress (retest cards), Report | 3 |
| ReadinessTrail | Today, Progress (top expansion), Report | 3 |
| WeeklySessionStrip | Today (inside WorkoutHero), Session, Week (top) | 3 |
| ArcProgressBar | Today (above hero), Progress (expanded), Profile (per-program) | 3 |
| MetricStripCluster | Today (in WorkoutHero), Session, Progress, Preview (meta grid), Report | 5 |
| CategoryTileGrid | Today (Extras 2×2), Programs (2×3) | 2 |
| WeeklyHeatmap | Progress, Report | 2 |
| OutcomeBar | Preview, Progress (as MilestoneBar variant) | 2 |
| ExplainSheet | Today, Session, Week, Progress, Preview, Evidence — anywhere with a "why this?" | 6 |
| StatusPill | Today, Session, Week, Progress, Programs, Preview, Profile, Account, Evidence | 9 |

Every primitive earns its place. No one-offs.

## Appendix B · What Terav is NOT (canonical list)

Reference this list when a founder observation, a competitor screenshot, or a market trend argues for something. If it's on this list, the answer is no — write a brief to change the list before writing the code.

1. Not a score-hero app (R8).
2. Not a streak app (R5).
3. Not a photo-first app (R1).
4. Not a coach-chat app (R12).
5. Not a video-form-analysis app (R10).
6. Not a social/aggregate app (R11).
7. Not a full training-plan app — Terav is focused-improvement (memory `feedback_focused-not-full-plan.md`).
8. Not a drag-to-reschedule calendar app (R7).
9. Not a bento-first dashboard app (§4 — bento is a browse tool, not the hero).
10. Not a Liquid Glass / refractive-UI app (market research §4 — trap for calm-first positioning).
11. Not a mascot / illustration app (deep review §3.6 rejected).
12. Not a "close the ring" motivator app (market research §3 — rings are baselines here).
13. Not a "3rd competing accent" app (R2 + §H V4).

---

## Appendix C · Delegate-to-specialist queue for Batch 36 review

- **`app-visual-craft`** — verify type ramp math against every surface; audit accent economy per §H V4 across all 13 surfaces; confirm bronze usage is bounded to CTA + arc-fill + target-hit only.
- **`app-mobile-ux`** — verify tap-target compliance across new primitives; confirm CTA thumb-zone on Today/Session/Preview; check Bottom Nav interaction with `WorkoutHero`'s fold behavior on 375/393/430 breakpoints.
- **`app-accessibility`** — verify WCAG 2.2 AA on every surface; verify aria-labels on Sparkline / WeeklyHeatmap / ReadinessTrail; verify focus order top-down; verify contrast on new StatusPill tones against surface-2.
- **`app-copy-clarity`** — write StatusPill state strings (WORKOUT READY / CHECK FIRST / MOVED FROM TUE / IN PROGRESS / DONE — plus IN PROGRESS variants for skill/mobility); write ExplainSheet body strings for the 5 shipping programs; audit MetricStripCluster labels; write OutcomeBar rangeCaption strings.
- **`app-motion-perf`** — verify motion buckets (200/400/800) implemented; verify `prefers-reduced-motion` alts; measure bundle delta; verify no new dependencies; measure CLS/LCP/INP on Today post-migration.
- **`landing-conversion-strategist`** — out of scope for this doc, but landing must not diverge visually from the app's warm-dark language; sanity check `landing/src/i18n/dictionaries/en.ts` copy against the app's StatusPill vocabulary post-Batch 36.

Each specialist writes a one-pass verification note after Batch 36 lands. If any specialist returns fail, Batch 36 is not deployed — the fix ships in-batch.

---

**End of document. This is the contract.** Batch 36 = ship all 13 surfaces against this system. Lane B jury reviews the system, not the surfaces. Founder-set constraint holds: no incremental Today-first ship. One coordinated migration, one verification, one deploy.
