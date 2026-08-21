# Cut C revised · Design brief — unified training-record surface

Owner: product-design-lead
Written: 2026-08-21
Status: draft — awaiting founder review
Related audits: `dev/audits/competitive/2026-08-21-fitness-app-matrix.md` (esp. §4-H, §5, §6 recs #1/#2/#3/#5/#9/#11)
Blocked by / blocks: unblocks Cut B (Today hero rebuild) — the aggregation surface has to exist before Today can shed history-density into it.

---

## Recommendation summary

The new tab is called **Record**. It replaces `/progress`; `/history` is retired to a `redirect → /record`. IA collapses from five tabs (Today · Week · Progress · History · Programs) to four (Today · Week · **Record** · Programs). Record is a single scrollable surface with three fixed sections in order: **Now** (a 12-week readiness heatmap + weekly narrative + latest retest tile), **Trend** (one rolling-average curve, program-parameterised, with an explicit window-tier control copied from Oura), and **Log** (btwb-style Training Days calendar → tap → day detail sheet, paginated). Rehab is firewalled into a small Rehab section that never enters the Trend curve. JSON export lives in the header as `Export`, one tap, filename `terav-record-{userId}-{YYYY-MM-DD}.json`. The one peer we are most closely following is **Oura Trends**: one screen, four zoom tiers, rolling-average default, raw points as opt-in overlay — no long-tenure mode switch.

---

## 1. IA decision — the new tab

**The call.** Progress dies. History is renamed and rebuilt as **Record**. Route: `/record`. Bottom nav goes from five to four slots: `Today · Week · Record · Programs` (Account/Profile stays in the top-right avatar, unchanged).

**Why "Record" and not "History", "Trends", "Progress"?**

- **"History"** is the current name and it undersells the surface. The Hevy category-word for this tab; competent but backward-looking. Matrix bucket H says the pages that survive 400 days are aggregation surfaces, not enumeration surfaces — "History" primes the enumeration mental model that we're actively moving away from.
- **"Trends"** is what Oura and Apple Fitness+ call it, and it maps cleanly to the rolling-avg move. But it excludes the raw log (which we must keep — Terav's confirm-first ethos requires the raw log stay a first-class citizen). Trends implies decoration on top of raw; we want the raw underneath but the aggregation as the surface.
- **"Progress"** is the current name and it's the worst option post-collapse. It reads as a goal-clearance surface (roadmap %, milestone table) — which is exactly the block-list-longer failure mode the matrix warns against. It also has a positive-only connotation that misrepresents amber/red honest weeks.
- **"Record"** is the winner. It carries three overlapping meanings that all serve the brief: (a) *the record*, as in the archive — like Whoop's Overview or Peloton's Profile Stats, both bucket-H survivors; (b) *your record*, as in the personal-best sense — natural home for retest events; (c) *record of what*, the verb — the confirm-first log itself, which nobody else is exporting the way Terav does. It also reads well next to Today · Week: three temporal frames (now, near, forever). Peer citation: none of the 31 apps in the matrix use this exact word, which means we get the naming space clean.

**What dies.** `/progress` file is deleted; existing `/history` file becomes the new `/record` composition. The 5→4 tab collapse gives Record a wider slot in the bottom nav — good for thumb reach on iPhone SE.

---

## 2. Component tree

```
/record  (RecordPage)
│
├── Header
│   ├── H1 "Record"                          (existing 32px semibold)
│   ├── ProgramBadge                         (which program's context;
│   │                                         appears only if ≥2 programs
│   │                                         active — Delta-3 pattern)
│   └── ExportButton                         (mono-caps, hairline border,
│                                              44×44 target — retains the
│                                              current /report affordance)
│
├── ─── Now ──────────────────────────────────── (peer: Whoop Overview)
│   │
│   ├── WeeklyHeatmap    12 weeks, tap-week → InfoSheet
│   │                    (reused from current /progress ProgressReadinessSection)
│   │                    (peer: btwb Training Days)
│   │
│   ├── WeeklyNarrativeTile                     (kept — this is Terav's
│   │   ├── HeritageClusterChip                  differentiator;
│   │   └── SignalCompletenessCard (inline)      matrix G1 vacancy)
│   │
│   └── LatestRetestTile                        (NEW; peer: TMA skill
│       ├── event name + delta                   assessment card,
│       ├── citation line                        Coros ramp-test card)
│       └── next-retest-in-Nd chip
│
├── ─── Trend ────────────────────────────────── (peer: Oura Trends)
│   │
│   ├── WindowTierControl                       (segmented; labels below)
│   │   [ 30d  · 90d  · 1y  · All ]
│   │
│   ├── ProgramCurveCard                        (NEW; the one chart,
│   │   ├── program-parameterised y-axis        parameterised per
│   │   ├── rolling-avg line (bronze-neutral)   program category)
│   │   ├── raw points overlay (toggleable)
│   │   ├── retest event pins on x-axis
│   │   └── delta callout (7d actual vs 28d baseline)
│   │
│   ├── RetestTimeline                          (NEW; horizontally
│   │   [pin]──[pin]──[pin]──[you-here]         scrolling event list
│   │   each pin: date · metric · delta         under the curve;
│   │   tap → RetestEventSheet with citations   peer: Coros ramp-test log)
│   │
│   └── RehabSection (conditional)              (peer: none — category
│       ├── mono-caps eyebrow "Rehab"           vacancy per matrix rec #11)
│       ├── separator rule
│       ├── SymptomLoadChart                    (kept from /progress)
│       └── HipProgressTile                     (kept, hip-only)
│                                                Firewalled: never
│                                                aggregated into the Trend
│                                                curve above.
│
├── ─── Log ──────────────────────────────────── (peer: Hevy calendar +
│   │                                             btwb Training Days)
│   ├── ActivityHeatmap (calendar year-grid)    (rebuild of current Heatmap)
│   │   tap-day → scroll to LogRow + expand
│   │
│   ├── LogList                                 (kept — accordion rows,
│   │   ├── LogRow (accordion)                   30-per-page pagination
│   │   ├── ExerciseRow (inside)                 already in place)
│   │   └── SymptomsSummary (inside)
│   │
│   └── PaginationButton "Load 30 more"
│
└── Footer (invisible; matches other routes' bottom padding for
          nav safe-area)
```

**What did I delete from the current tree?**

- Engine banners (pause / cycle-end / accelerate) — moved OFF `/record` and ONTO `/today`. They are decision moments; Record is a review surface. This is the R-verb split: Today is *do*, Record is *see*.
- MilestoneTable — retired. The rolling-avg curve replaces it. Milestones-as-a-table read as gamified checkboxes; the curve renders the same story continuously and doesn't reward or punish cadence. Any per-milestone detail moves to the RetestTimeline pin sheet.
- PerProgramAdherenceCard + CrossTrackWeekTile — merged into a compact "This week, all tracks" strip inside the WeeklyNarrativeTile. Details on component-survivor list below.
- The 30-day ReadinessTrail that currently appears on BOTH pages is deleted from Record entirely. The 12-week WeeklyHeatmap covers the same territory at a better zoom for a Record surface; the 30-day trail lives on Today only.

---

## 3. Wireframes

All wireframes at mobile 393px width. Vertical rules `│` are the surface edges; content is 361px between 16px gutters.

### 3a. Day-14 state (near-empty; one week of data, morning check on 4 days, 2 sessions, no retest yet)

```
┌───────────────────────────────────────────────┐
│  Record                              [Export] │
│                                               │
│  ── NOW ────────────────────────────────────  │
│                                               │
│  RECENT — 12 WEEKS                            │
│  ┌─────────────────────────────────────────┐  │
│  │ · · · · · · · · · · · ·                 │  │
│  │ · · · · · · · · · · · ·                 │  │
│  │ · · · · · · · · · · · G                 │  │
│  │ · · · · · · · · · · A G                 │  │
│  │ · · · · · · · · · · · ·                 │  │
│  │ · · · · · · · · · · · G                 │  │
│  │ · · · · · · · · · · · ·                 │  │
│  │ 11 weeks empty          this  wk        │  │
│  └─────────────────────────────────────────┘  │
│  legend: · none  G green  A amber  R red      │
│                                               │
│  WEEK 1 — RAMP                                │
│  ┌─────────────────────────────────────────┐  │
│  │ 2 sessions logged · 4 morning checks    │  │
│  │ 0 accepted proposals — engine is        │  │
│  │ still collecting your baseline.          │  │
│  │ ▸ signal completeness   4/7 days        │  │
│  └─────────────────────────────────────────┘  │
│                                               │
│  RETESTS — none yet                           │
│  ┌─────────────────────────────────────────┐  │
│  │ Your first retest is your baseline.     │  │
│  │ For Engine Builder that's an easy-run   │  │
│  │ HR check, in about 3 weeks.             │  │
│  │                    Next retest in ~21d  │  │
│  └─────────────────────────────────────────┘  │
│                                               │
│  ── TREND ──────────────────────────────────  │
│                                               │
│  [ 30d ] [ 90d ] [ 1y ] [ All ]               │
│                                               │
│  ┌─────────────────────────────────────────┐  │
│  │                                         │  │
│  │        Trend needs three retest         │  │
│  │        events to draw a line.           │  │
│  │                                         │  │
│  │        Two sessions in — the shape      │  │
│  │        starts to form after your        │  │
│  │        first baseline check.            │  │
│  │                                         │  │
│  └─────────────────────────────────────────┘  │
│                                               │
│  ── LOG ────────────────────────────────────  │
│                                               │
│  2 active days                                │
│  ┌─────────────────────────────────────────┐  │
│  │ ▸ ● Fri 15 Aug          2 done          │  │
│  │ ▸ ● Wed 13 Aug          1 done · 1 note │  │
│  └─────────────────────────────────────────┘  │
│                                               │
└───────────────────────────────────────────────┘
```

Notes on day-14:

- Heatmap is mostly empty dots — but showing it now, empty, is the design promise. This is what "the shape of the record" looks like.
- Trend section is text-only: it does not fake a chart from two points. Copy names the exact trigger ("three retest events") and the exact timeframe ("about 3 weeks"), reusing the confirm-first cite-per-adjustment tone.
- Retest tile carries the identity that a peer's streak/XP would carry (matrix rec #2). Even at zero retests, we surface *when the first one lands* — the tenure clock starts now.
- No Rehab section unless the user's active program is `anterior-hip-rebuild` OR they've logged symptoms. Day-14 rowing user sees no Rehab section at all.

### 3b. Day-90 state (persona-strength, weekly checks, 22 sessions, 2 retest events, one accepted TM proposal)

```
┌───────────────────────────────────────────────┐
│  Record  · 5/3/1 anterior-hip        [Export] │
│                                               │
│  ── NOW ────────────────────────────────────  │
│                                               │
│  RECENT — 12 WEEKS                            │
│  ┌─────────────────────────────────────────┐  │
│  │ G G G · G G G · G A G G                 │  │
│  │ · · · G · · · G · · · ·                 │  │
│  │ G A G G G G G · G G G G                 │  │
│  │ · · · · · · · · A · · A                 │  │
│  │ G G G G G G · G G G G G                 │  │
│  │ · G · · · G · · · · · ·                 │  │
│  │ · · · · · · · · · · · ·                 │  │
│  │ wk1                              this   │  │
│  └─────────────────────────────────────────┘  │
│                                               │
│  WEEK 12 — DELOAD                             │
│  ┌─────────────────────────────────────────┐  │
│  │ Green week — 3/3 sessions, all top-set  │  │
│  │ hit or beat target. Cycle end tomorrow. │  │
│  │ ▸ signal completeness   7/7             │  │
│  │ ▸ this week, all tracks    3 str · 2 aer│  │
│  └─────────────────────────────────────────┘  │
│                                               │
│  LATEST RETEST — cycle-2 top-set              │
│  ┌─────────────────────────────────────────┐  │
│  │ Back squat 5RM         102.5 kg  +5.0   │  │
│  │ vs cycle-1 (28 Jul)     97.5 kg         │  │
│  │ ─────────────────────────────────       │  │
│  │ Basis · 3 green weeks · 0 amber ·       │  │
│  │ symptom score < 2 throughout            │  │
│  │ Cited · Wendler 5/3/1 5%-per-cycle      │  │
│  │                     Next retest in 21d  │  │
│  └─────────────────────────────────────────┘  │
│                                               │
│  ── TREND ──────────────────────────────────  │
│                                               │
│  [ 30d ] [ 90d ] [ 1y ] [ All ]               │
│    ●                                          │
│  90-day rolling top-set vs 4-week baseline    │
│                                               │
│  ┌─────────────────────────────────────────┐  │
│  │ kg                                      │  │
│  │110┤                                     │  │
│  │   │                        ·   ●        │  │
│  │105┤                    ·  ─┴──          │  │
│  │   │              ·─────                 │  │
│  │100┤          ·  ─                       │  │
│  │   │      ●  ─                           │  │
│  │ 95┤  ─── ·                              │  │
│  │   │  ·                                  │  │
│  │ 90┤· ·                                  │  │
│  │   └──────────────────────────────       │  │
│  │     wk1  wk3  wk6  wk9  wk12  ▲today   │  │
│  │                                         │  │
│  │  ● retest event  · raw top-set          │  │
│  │  ─ 4-wk rolling avg                     │  │
│  │                                         │  │
│  │  4-wk avg  102.1 kg   +4.6 vs baseline  │  │
│  └─────────────────────────────────────────┘  │
│                                               │
│  RETESTS                                      │
│  ┌─────────────────────────────────────────┐  │
│  │ ●───────●───────▲                       │  │
│  │ 28 Jul  25 Aug   you                    │  │
│  │ 97.5    102.5    102.5 kg               │  │
│  │  base   +5.0     est +7.5 next          │  │
│  └─────────────────────────────────────────┘  │
│                                               │
│  ── LOG ────────────────────────────────────  │
│                                               │
│  22 active days · showing 22                  │
│  ┌─────────────────────────────────────────┐  │
│  │ ▸ ● Wed 21 Aug          3 done          │  │
│  │ ▸ ● Mon 19 Aug          3 done · 2 note │  │
│  │ ▸ ● Fri 16 Aug          3 done          │  │
│  │ ▸ ○ Wed 14 Aug (amber)  2 done · 1 note │  │
│  │ ▸ ● Mon 12 Aug          3 done          │  │
│  │ ...                                     │  │
│  └─────────────────────────────────────────┘  │
│                                               │
└───────────────────────────────────────────────┘
```

Notes on day-90:

- The `Record · 5/3/1 anterior-hip` breadcrumb only shows when more than one program is active. If persona-strength has only 5/3/1, the breadcrumb is silent (there is no ambiguity to resolve).
- The curve renders raw dots + a 4-week rolling line + retest event pins (`●`). The window-tier control at `90d` is highlighted; changing to 30d compresses the same math to a 4-week view; 1y expands to a 12-week smoothed line with retest pins every ~4-6 weeks.
- The Latest Retest tile carries the citation *inline* — no "why?" tooltip. This is R8-positive-twin: where Whoop hides the model, Terav shows the study.
- The horizontally-scrolling Retest Timeline is a peer of Coros's ramp-test log and TMA's skill-assessment page. Anchor `▲today` shows tenure without a streak.
- No Rehab section for persona-strength on 5/3/1 unless the underlying `anterior-hip-rebuild` program is *also* active as a rehab track. If it is, it appears as its own subsection below the Rowing/Strength curve, on its own axes, never merged.

### 3c. Day-400 state (persona-strength-slow at 400+ days; the founder verification target)

```
┌───────────────────────────────────────────────┐
│  Record                              [Export] │
│                                               │
│  ── NOW ────────────────────────────────────  │
│                                               │
│  RECENT — 12 WEEKS                            │
│  ┌─────────────────────────────────────────┐  │
│  │ G G G G G G G G G G G G                 │  │
│  │ · · · · G · G · · · G ·                 │  │
│  │ G G G G G G G G A G G G                 │  │
│  │ · · G · · A · · · · · ·                 │  │
│  │ G G G G G G G G G G G G                 │  │
│  │ · G · · G · G · G · G ·                 │  │
│  │ · · · · · · · · · · · ·                 │  │
│  │ wk1                              this   │  │
│  └─────────────────────────────────────────┘  │
│                                               │
│  WEEK 57 — CYCLE 14                           │
│  ┌─────────────────────────────────────────┐  │
│  │ Green week — 3/3 sessions. 400 days     │  │
│  │ in. Longest amber streak this cycle: 0. │  │
│  │ ▸ signal completeness   7/7             │  │
│  └─────────────────────────────────────────┘  │
│                                               │
│  LATEST RETEST — cycle-14 top-set             │
│  ┌─────────────────────────────────────────┐  │
│  │ Back squat 5RM         137.5 kg  +2.5   │  │
│  │ vs cycle-13 (24 Jul)   135.0 kg         │  │
│  │ ─────────────────────────────────       │  │
│  │ Basis · 4 green weeks · 0 amber ·       │  │
│  │ log signal `top-set-hit-target` @ 100%  │  │
│  │ Cited · Wendler 5/3/1 slow-mode         │  │
│  │                     Next retest in 27d  │  │
│  └─────────────────────────────────────────┘  │
│                                               │
│  ── TREND ──────────────────────────────────  │
│                                               │
│  [ 30d ] [ 90d ] [ 1y ] [ All ]               │
│                     ●                         │
│  1-year rolling top-set vs 12-week baseline   │
│                                               │
│  ┌─────────────────────────────────────────┐  │
│  │ kg                                      │  │
│  │140┤                              ●─●    │  │
│  │   │                         ●─●─        │  │
│  │130┤                    ●─●─             │  │
│  │   │              ●─●─                   │  │
│  │120┤        ●─●─                         │  │
│  │   │   ●─●─                              │  │
│  │110┤●─                                   │  │
│  │   │                                     │  │
│  │100┤                                     │  │
│  │   └──────────────────────────────       │  │
│  │     Q1'24  Q2  Q3  Q4  Q1'25  ▲today   │  │
│  │                                         │  │
│  │  ● retest event  ─ 12-wk rolling avg    │  │
│  │  raw points hidden — [ show raw ]       │  │
│  │                                         │  │
│  │  12-wk avg 136.2 kg  +25.4 since Q1'24  │  │
│  └─────────────────────────────────────────┘  │
│                                               │
│  RETESTS · 14 events                          │
│  ┌─────────────────────────────────────────┐  │
│  │ ●─●─●─●─●─●─●─●─●─●─●─●─●─●─▲           │  │
│  │ Q1'24                    today          │  │
│  │ Base 112.5 · Current 137.5 · +25.0      │  │
│  │ scroll for per-event citations →        │  │
│  └─────────────────────────────────────────┘  │
│                                               │
│  ── LOG ────────────────────────────────────  │
│                                               │
│  Activity — 2024 · 2025                       │
│  ┌─────────────────────────────────────────┐  │
│  │ J F M A M J J A S O N D                 │  │
│  │ ▪▪▪ ▪▪▪ ▪▪▪ ▪ ▪ ▪▪▪ ▪▪▪ ▪▪▪  2024      │  │
│  │ ▪ ▪ ▪▪ ▪ ▪ ▪▪ ▪▪ ▪ ▪ ▪▪ ▪                │  │
│  │ ▪ ▪ ▪ ▪▪                       2025    │  │
│  └─────────────────────────────────────────┘  │
│                                               │
│  310 active days · showing 30                 │
│  ┌─────────────────────────────────────────┐  │
│  │ ▸ ● Wed 21 Aug          3 done          │  │
│  │ ▸ ● Mon 19 Aug          3 done          │  │
│  │ ...                                     │  │
│  └─────────────────────────────────────────┘  │
│  [ Load 30 more ]                             │
│                                               │
└───────────────────────────────────────────────┘
```

Notes on day-400:

- Same three sections. No mode switch. **This is the Oura promise.**
- Window control auto-selected `1y` at open; user can drop to 30d/90d for zoom-in, up to All for the founder-view. Persistent per user.
- Raw points hidden by default at 1y and All — a "[ show raw ]" affordance is a mono-caps hairline button, not a bronze CTA (bronze stays reserved for Accept/Export). At 30d and 90d, raw points on by default. This is Oura's decimation-vs-raw split.
- Retest Timeline compresses to a horizontal scroll of 14 events; the summary row underneath is the tenure-identity artifact (matrix rec #2). "Base → Current → Delta" carries what Peloton's Milestones would carry, without the numerology.
- Log heatmap switches from 12-week matrix to a two-year month-column view when data exceeds ~120 days. Both are the same primitive (btwb Training Days); it just re-projects axes.
- Log list defaults to 30 rows with `Load 30 more`, exactly the current pagination pattern from `/history` (line 246 of the current file). Extended to work with the calendar-tap deep-link.

---

## 4. Rolling-avg curve component spec

**The component.** `ProgramCurveCard`. One implementation, five parameterisations. This is Section-5 recommendation #5 rendered in code: same screen at day 30 and day 400, aggregation math per program.

### Data shape per program

| Program | Primary metric | Raw point cadence | Rolling avg window | Baseline window | Retest events source | Notes |
|---|---|---|---|---|---|---|
| **5/3/1 anterior-hip** | Top-set kg per main lift | ~2–3× per week | 4-week rolling | 12-week baseline | Cycle-end top-set (~every 4 weeks) | Group by lift; user picks one lift shown at a time via chip row. Terav's answer to StrongLifts' four-chart problem. |
| **Engine Builder** | Avg HR at easy runs / rows | Weekly (aerobic session cadence) | 7-day rolling load | 42-day CTL-style curve | Retest week's easy-run HR (~every 6 weeks) | Peer: **TrainingPeaks CTL/ATL** — the only peer in the matrix that publishes its math. Terav uses simpler EWMA-42 for CTL-like curve. |
| **CSM (concurrent)** | Dual axis — HR trend + top-set | Weekly aerobic + weekly strength | 4-week strength / 42-day HR | 12-week baseline (strength), 42-day (HR) | Every 4 weeks (dual retest) | The curve renders TWO curves stacked in one card, not two cards. Same axes convention. |
| **Handstand Walk** | Skill retest score (0–10) + drill volume | Weekly drills, monthly retest | No rolling avg on skill score — retest events ARE the line | Baseline = first retest | Monthly skill retest | Line connects retest pins directly. Raw layer = drill sessions as tick marks. Peer: **TMA skill map**. |
| **Overhead Mobility** | ROM angle degrees | Pre-phase + post-phase (episodic) | Not rolling — per-phase snapshot | Baseline = phase-entry measure | Pre/post phase pair | Two dots per phase (in/out) with delta arrows. Same card shell; different visual density. Peer: **Pliability mobility profile**. |
| **Rowing 2K Test Prep** | 2K time (mm:ss) + weekly Z2 volume | 2K test at block boundaries; Z2 weekly | 4-week rolling volume | Race-goal target line | 2K test events | Two elements: rolling Z2 volume as line; 2K test as event pins. Countdown to race labels the x-axis. Peer: **Runna's plan-cycle rollup**. |

**Universal rule:** every program's curve card is 361×220 px (bounded aspect), same font stack, same axis chrome, same window-tier control. Program identity comes from **content**, not from a different chart type. This is matrix Bucket-C recommendation: "do not add a chart type per program."

### Zoom tier labels + windows

Copied from Oura Trends nomenclature (matrix source citation §4-C, §5). Segmented control, four fixed labels, one always active.

| Label | Range | Rolling window | Raw overlay default |
|---|---|---|---|
| `30d` | Last 30 days | 7-day rolling | ON |
| `90d` | Last 90 days | 4-week rolling | ON |
| `1y` | Last 365 days | 12-week rolling | OFF (`show raw` toggle) |
| `All` | Since account creation | 12-week rolling | OFF |

Below the segmented control, a subtitle names the math: `90-day rolling top-set vs 4-week baseline`. This is what Oura does with `3-day / 90-day / since-inception`. **Name the math. Don't hide it.** This is where the copy-per-decision meets Terav's cite-per-adjustment ethos.

### Peer citation for the pattern

**Primary: Oura Trends.** One screen, four zoom levels, rolling-avg default, math explicitly named. Verbatim label pattern reused. The matrix identifies this as the only "one-screen-fits-400-days" peer. Reference: matrix §4-C, §5.

**Secondary: TrainingPeaks PMC (Performance Management Chart).** For the aerobic parameterisation specifically, Terav borrows the CTL(42d) / ATL(7d) framing. This is the deepest data-viz in the matrix; borrowing the *math name* (CTL-style) rather than the full three-line chart. Matrix §4-C.

**Rejected: Whoop 6-month trend.** Explicitly rejected because Whoop's trend view depends on the autonomous score-hero (Recovery/Strain) which Terav rejected as R8. Whoop hides the input; Terav shows it. Same shape, opposite ethos.

### Interaction

- **Tap the segmented control:** window changes, curve re-renders, subtitle updates. No animation beyond a 200ms crossfade on the line path (respect `prefers-reduced-motion` — instant swap).
- **Tap a retest pin (●):** opens `RetestEventSheet` (see §5 below). Not a tooltip; a sheet, because the citation is content, not chrome.
- **Tap a raw point (·):** nothing. Raw points are context, not affordances. This is a Krug clarity call — a tappable dot on a chart is a phantom target that fails Fitts's law on mobile.
- **`show raw` toggle** (1y and All views only): binary; persists per user in localStorage.
- **No long-press, no drag, no pinch-zoom.** The four labeled tiers cover the zoom demand. Complexity budget goes to citations, not gesture soup.

Delegate → `app-visual-craft`: pick the exact stroke weights, tick densities, and neutral warm-gray for the rolling-avg line. Rule: bronze cannot appear on this chart. Delegate → `app-motion-perf`: verify the 200ms crossfade holds at 60fps with a 365-point dataset.

---

## 5. Retest event surface

**Component: `LatestRetestTile` + `RetestTimeline` + `RetestEventSheet`.**

Matrix rec #2 is unambiguous: retest events replace streaks/XP as the tenure-identity artifact. This brief takes it literally.

### LatestRetestTile (in the Now section)

- Always visible if ≥1 retest event exists.
- Renders the most recent retest: event name, current value, delta vs previous, basis (log signals), citation, next-retest countdown.
- The citation line is **body text**, not a footnote. Font size matches the delta callout above it. This is the R8-inverse: where Whoop hides the model, Terav shows the study.
- Empty state (day 0–first retest) shows "your first retest is your baseline" copy with an explicit `Next retest in ~Nd` count-down. This is the equivalent of a Peloton milestone at 100 rides — but it lands at the *start* of the journey, not months in. Peer inspiration: TMA's onboarding sets first-assessment-in-N-days.

### RetestTimeline (in the Trend section)

- Horizontally scrolling row of pins, each pin = one retest event.
- Anchored right on `▲today`. At day 400 with 14 events, scrolls left through history.
- Summary strip underneath: `Base X.X · Current Y.Y · Delta`. This is the tenure counter. **Not a streak count. A delta count.** Delta counts don't punish rest.
- Peer: Coros ramp-test event log + Peloton milestone timeline. Rejected influences: Peloton's "1000-ride Millennium" numerology (arbitrary bright-line rewards) — Terav's timeline is scale-free.

### RetestEventSheet (bottom sheet on pin tap)

- Full citation: study title/DOI *or* named log signal (`top-set-hit-target @ 100%`).
- The engine's reasoning: `Basis: 4 green weeks · 0 amber · symptom score < 2 throughout.`
- The proposals accepted during this cycle, chronologically. Each with its own micro-citation.
- Peer: TMA's per-assessment history sheet + Runna's per-run "why we changed this" summary. Terav goes further because we have per-adjustment citations for free from confirm-first.

**Cadence policy.** Each program owns its retest cadence (matrix rec #10). No user-triggered retests in v1. This eliminates the retest-fatigue failure mode Pliability suffers.

Delegate → `app-copy-clarity`: the citation string budget. A study title + author + year in ≤80 chars. A log-signal citation in ≤50 chars.

---

## 6. Rehab firewall

Matrix rec #11 has no peer precedent. Terav must define the pattern.

**The call.** Rehab is a section inside Record, NOT a chart on top of the primary Trend curve. It appears below the primary Trend curve when relevant. It has its own eyebrow (`REHAB`), its own separator rule, and its own visualization primitives.

### When Rehab shows

- User's active or historical program includes `anterior-hip-rebuild`, OR
- User has logged any symptom score > 0 in the past 30 days.

If neither is true, the section is not rendered at all. Rowing user with zero symptoms: no Rehab section, no empty-state placeholder.

### What Rehab renders

- `SymptomLoadChart` — kept from current `/progress` (Recharts, symptom vs load, hip-only for now). No changes.
- `HipProgressTile` — kept as-is; hip-only.
- (Future) other rehab-program tiles slot in here as siblings.

### What Rehab must NOT do

- Symptom data must NEVER contribute to the Trend curve.
- The Trend curve's rolling-avg math must skip any rehab-flagged program's data.
- The retest-timeline in the Trend section only shows non-rehab retests. Rehab retests (e.g., pain-provocation tests, if we ever ship them) get their own timeline inside the Rehab section.
- The LatestRetestTile in the Now section never features a rehab retest.

**Why not a filter toggle?** A toggle implies rehab and strength are on the same axis — they aren't. A rehab red day and a strength green day are not comparable data; a toggle would let the user overlay them anyway. The section split enforces the incompatibility structurally.

**Why not entirely hidden from Record (visible on Today/Week only)?** Because then rehab users have no place to see their long-arc rehab record. That's a real user need — the founder's own multi-year hip record is *the* primary long-tenure use case. Hiding it would betray it.

Peer citation: none — matrix explicitly names this as a category vacancy. This is Terav territory.

---

## 7. JSON export

**Button.** Header, top-right. Mono-caps `Export`, hairline border, no bronze fill. Retains the current `/progress` header pattern — one existing affordance survives.

**Placement rationale.** Header placement (not overflow menu, not bottom-of-page) is Garmin's move — the strongest export in the matrix places it in the account/settings area but surfaces it as first-class. Terav puts it on the surface itself because the surface *is* the record — export is the "take this with you" affordance for the very thing you're looking at. Peer citations: Garmin CSV/TCX/GPX/FIT depth; Oura's CSV + JSON API; Hevy CSV. Rejected: Whoop's "hidden until account cancellation" placement — the anti-pattern in matrix §4-G.

**Filename.** `terav-record-{userId8}-{YYYY-MM-DD}.json` — 8-char user prefix for disambiguation across multiple exports, ISO date for chronological sort. Not `.terav.json` (unknown extension), not `.log.json` (ambiguous), not just `.json` with a random name.

**Warn about size?** No. The payload is small — even a 400-day account is well under 5 MB. No warning. If we ever cross 10 MB (unlikely — logs are small text records) we can add a passive `~N KB` size chip next to the button.

### JSON payload sketch

```json
{
  "schema_version": "1.0.0",
  "exported_at": "2026-08-21T14:30:00Z",
  "user": {
    "id": "usr_a1b2c3d4",
    "account_created": "2024-04-12",
    "active_programs": ["five-three-one-anterior-hip"]
  },
  "programs": [
    {
      "slug": "five-three-one-anterior-hip",
      "activated_at": "2024-04-12",
      "current_cycle": 14,
      "training_maxes": {
        "back_squat_highbar": 137.5,
        "bench_press": 92.5,
        "deadlift_conventional": 155.0,
        "overhead_press": 60.0
      }
    }
  ],
  "logs": [
    {
      "date": "2026-08-21",
      "derived_state": "green",
      "symptoms": { "groin_left": 1, "low_back": 0 },
      "exercises": {
        "1:back_squat_highbar": {
          "done": true,
          "sets": [
            { "weight_kg": 100, "reps": 5, "rpe": 7 },
            { "weight_kg": 110, "reps": 5, "rpe": 8 },
            { "weight_kg": 120, "reps": 5, "rpe": 9 }
          ]
        }
      },
      "runs": [],
      "notes": "hip felt fine"
    }
  ],
  "accepted_proposals": [
    {
      "accepted_at": "2026-08-19T09:12:00Z",
      "type": "cycle_end_tm_increase",
      "lift": "back_squat_highbar",
      "from_kg": 135.0,
      "to_kg": 137.5,
      "delta_kg": 2.5,
      "basis": {
        "log_signals": [
          "green_week_count:4",
          "amber_week_count:0",
          "symptom_score_max:1"
        ]
      },
      "citation": {
        "type": "study",
        "title": "Wendler 5/3/1: Simplest Strength Template",
        "author": "Wendler, J.",
        "year": 2011,
        "reference": "5/3/1 5%-per-cycle progression rule"
      }
    }
  ],
  "retest_events": [
    {
      "date": "2026-08-19",
      "program_slug": "five-three-one-anterior-hip",
      "metric": "back_squat_5rm_kg",
      "value": 137.5,
      "delta_vs_previous": 2.5,
      "previous_date": "2026-07-24",
      "citation": { "type": "internal", "reference": "cycle_end" }
    }
  ]
}
```

**Design principles baked into the payload:**

- `citation` on every accepted proposal — this is Terav's differentiator, exported. **No peer app exports its citations because no peer app has any.**
- `basis.log_signals` array names the exact signals in machine-readable form. A user can regenerate the reasoning independently.
- `schema_version` present from day one, so future exports carry forward-compat.
- Rehab data is present in the export but **flagged by its program's slug** — a downstream analyst can filter it out. The firewall is UI-level, not data-level. Consent-first: the user owns all their data; the UI just enforces the aggregation math.

Delegate → `app-accessibility`: the Export button must announce "Export training record as JSON" via ARIA. Not just "Export."

---

## 8. Empty state

Covered in §3a but restated as a design decision here.

**Copy at day 0 (fresh account, no logs yet).**

```
Record

Nothing here yet.
Your first morning check or first
session builds the record.

    ┌─────────────────────────────────┐
    │  Open today                     │
    └─────────────────────────────────┘
```

- The CTA is `Open today` (bronze — the primary action). One button. This is Refactoring UI economy: empty state has exactly one thing to do.
- Peer citation: **Cal.com dashboard empty state** — single-sentence declaration, single CTA, no illustration. Rejected: Alo Moves-style illustrated empty states (matrix §4-A: no photography, R1).

**Copy at day 1–13 (has some data but no retest yet).**

Full wireframe in §3a. Key copy moves:
- Trend section is not a fake chart. It's text: "Trend needs three retest events to draw a line."
- Retest tile shows the countdown to the first retest — the tenure clock has already started. This is the R5-alternative: no streak, but the identity artifact already exists.
- Log shows what's there. Two rows. Fine.

**Copy at day 14+ but new-to-Terav (e.g., imported log).** Same as day 90 shape but with a small `imported` chip on the retest timeline pins that came from before the account started. Not shipped in Cut C; deferred.

---

## 9. Component survivor list

| Existing component | Verdict | Notes |
|---|---|---|
| **`RetestMetricsPanel`** (progress) | **Rebuild → `LatestRetestTile` + `RetestTimeline`** | Current version renders as a stat panel; new spec puts one hero-tile in Now and a scrolling timeline in Trend. Same data source. |
| **`SignalCompletenessCard`** (progress) | **Keep as inline slot** | Already renders inline inside `WeeklyNarrativeTile`. Continues that role. |
| **`PerProgramAdherenceCard`** (progress) | **Merge into `WeeklyNarrativeTile`** | Adherence data becomes a two-line strip inside the narrative tile ("this week, all tracks · 3 str · 2 aer"). Standalone card retired. |
| **`HeritageClusterChip`** (progress) | **Keep** | Header chip on `WeeklyNarrativeTile`. Unchanged. |
| **`WeeklyNarrativeTile`** (`components/WeeklyNarrativeTile.tsx`) | **Keep as-is** | The differentiating narrative artifact. Category G1 vacancy. Absorbs the adherence merge above. |
| **`HipProgressTile`** (`components/HipProgressTile.tsx`) | **Keep, move into RehabSection** | Only renders for `anterior-hip-rebuild`. Now scoped explicitly to the Rehab firewall. |
| **`WeeklyHeatmap`** (`components/ui/WeeklyHeatmap.tsx`) | **Keep** | 12-week Now-section heatmap. Interactive week-tap → InfoSheet already implemented. |
| **`ReadinessTrail`** (`components/workout/ReadinessTrail.tsx`) | **Retire from Record entirely** | Currently duplicated on both `/progress` and `/history`. Lives on Today only after Cut C. This kills the duplication the founder called out. |
| **`SymptomLoadChart`** (Recharts, lazy) | **Keep, move into RehabSection** | Hip-specific rehab chart. Firewalled. |
| **`Heatmap`** (history — calendar heatmap) | **Rebuild → `ActivityHeatmap`** | Same primitive but supports two projections: 12-week matrix at day 14–120, two-year month-column view at day 120+. |
| **`BlockHistorySection`** (`components/history/BlockHistorySection.tsx`) | **Retire** | Block-history storytelling now lives inside `RetestEventSheet` (each retest event's expanded view). No standalone block history section. |
| **`LiftSpark`** (history, inline) | **Retire** | Replaced by the parameterised curve. Six mini-sparklines were a pre-consolidation pattern; the curve is post-consolidation. |
| **`SymptomSpark`** (history, inline) | **Retire** | Symptom data now feeds only into `SymptomLoadChart` inside RehabSection. Sparkline row was duplicating chart function. |
| **`LogRow`** + **`ExerciseRow`** + **`SymptomsSummary`** (history) | **Keep as-is** | The Log section keeps them verbatim. Pagination retained. |
| **`MilestoneTable`** + **`MilestoneLiftGroup`** + **`MilestoneProgressBar`** (progress) | **Retire** | Roadmap-percentage bars replaced by the curve. Any "missed / soon / beaten" state that mattered on the milestone chip is expressible on the retest timeline pin (retest hit target / retest missed target). Cleaner. |
| **`EngineBanner`** (progress) | **Move to `/today`** | Cycle-end / accelerate / pause banners are decision moments. Belong on Today, not Record. |
| **`CrossTrackWeekTile`** (progress) | **Merge into `WeeklyNarrativeTile`** | Same merge as `PerProgramAdherenceCard`. Cross-track becomes a strip, not a card. |

Net: 3 new components, 3 rebuilds, 7 keeps, 6 retires. Component budget: down.

---

## 10. Peer citation summary

| Decision | Design move | Peer we adopted | Peer we rejected (anti-example) |
|---|---|---|---|
| §1 Tab name | "Record" | (none uses this word — clean naming space) | "Progress" (current name; reads as goal-clearance) |
| §1 Collapse to 4 tabs | Progress + History merge | Whoop Overview (single training-record surface) | Garmin (5+ tabs; power-user only) |
| §2 Three-section IA | Now / Trend / Log | Whoop Overview vertical rhythm | ROMWOD flat list (matrix §5 90-day inflection failure) |
| §3 Same screen at 30d and 400d | No mode switch | Oura Trends | Fitbod's implicit tenure mode (reviewer-flagged) |
| §4 Rolling-avg default, raw opt-in | Curve overlay pattern | TrainingPeaks PMC + Oura Trends | StrongLifts all-points line (breaks at 90+) |
| §4 Segmented window tier | `30d / 90d / 1y / All` | Oura Trends verbatim label set | Hevy Pro-gated tiers (paywall behind aggregation) |
| §4 One chart, five parameterisations | Same primitive per program | Bucket-C recommendation (§4-C) | Strava/Garmin per-metric chart proliferation |
| §5 Retest as identity artifact | Latest tile + timeline + sheet | Coros ramp-test, TMA skill assessment, Pliability mobility test | Peloton streak milestones (streak-preservation complaints in §4-E) |
| §5 Cite on every retest | Citation as body content | (category vacancy — no peer) | Whoop Coach / Oura Advisor (models hidden) |
| §5 Program-defined retest cadence | Program owns cadence | Coros ramp test, TrainingPeaks PMC events | Pliability user-triggered retest (under-used per matrix §5) |
| §6 Rehab firewall | Separate section, never in Trend | (category vacancy — no peer) | Every adaptive-engine peer (Garmin, Coros, Fitbod, Whoop apply engine across tracks) |
| §7 Export in header | First-class, one tap | Garmin, Oura, Hevy export placement | Whoop wipe-on-cancel (§4-G anti-signal) |
| §7 Cited proposals in payload | Machine-readable citations | (category vacancy) | Any peer without a citation to export |
| §8 Empty state | One-sentence + one CTA | Cal.com dashboard | Alo Moves illustrated empty (photography-heavy, matrix §4-A) |

---

## 11. Open questions for founder review

Places I made calls that a founder might want to reverse. Listed as questions, not decisions.

1. **Is "Record" the right word?** I made the call over History / Trends / Progress. Founder-brand check: does "Record" fit Terav's tone of voice (which leans instrumental / rehab-adjacent / laconic)? If the founder prefers "Trends" (Oura parity) or "History" (Hevy parity), that's a one-line change but changes the tenure-identity framing. Answer this first — everything else in the brief keys off this tab name.

2. **Should engine banners (cycle-end / accelerate / pause) really move to Today?** This brief assumes yes because Record is a review surface and Today is a decision surface. But the current implementation places them at the top of `/progress` (progress/page.tsx:186–222), and there's a real argument that a cycle-end proposal *is* a Trend event that belongs on the trend surface. Founder call: is Today "do" and Record "see," or is Record also "decide-when-you-see"?

3. **Rehab section: below the primary Trend curve, or above it?** I placed it below because the primary progression is the hero of the surface, and rehab is context. But for the founder's own persona (hip user), rehab context might be the *primary* concern with strength as the secondary. Is Rehab-first-if-hip-user the right rule? This flips section order for one user type only.

4. **Retest cadence: program-owned means users can't test whenever they want. Do we ever expose an "I want to retest now" affordance?** Matrix §6 rec #10 says program-owned is the pattern that gets executed. But Terav's confirm-first ethos is user-in-control; forbidding user-triggered retests contradicts that ethos. I chose program-owned for v1 to avoid retest fatigue. Founder call: reversible in v2, or wrong in v1?

5. **The curve for skill/mobility programs (Handstand Walk, Overhead) has no rolling-avg — it renders retest pins directly.** This is a compromise: those metrics don't have a continuous signal to average. Is a card that renders "just retest pins in a line" still coherent inside a Trend section, or should skill/mobility programs get a different visualisation shape entirely (e.g., a "milestone tier" list instead of a curve)? I chose one card shape for consistency; the founder may prefer a differentiated skill card.

6. **JSON export at 5 MB — do we need any progress indicator, or is that overkill for a text file?** I said no. But a user on a slow Cloudflare edge with a 400-day account might see a 3–5 second delay between tap and download. Is a passive spinner state worth building for v1, or a v2 concern?

7. **Two-year month-column log heatmap kicks in at day 120+.** I picked 120 days as the switching point (roughly the last 12 weeks fit the current heatmap; beyond that, the calendar-year projection is more legible). But 120 is a hand-picked threshold. Should the switch be month-based (`>= 4 months`) or session-count-based (`>= 100 active days`)? Different users will hit these thresholds at different tenures.

8. **Delete `MilestoneTable` completely, or keep it accessible one-tap-deep under the curve?** I retired it because the curve tells the same story continuously. But some founders love a table. If the milestone table is genuinely load-bearing for the strength persona, this brief has the wrong call and should keep it in a `Milestones` collapsed section between Trend and Log.

---

## Notes on out-of-scope work

Flagged for downstream specialist agents once the founder approves this brief.

- **Type ramp / palette math for the curve card** → delegate to `app-visual-craft`. Rules: bronze cannot appear on the curve chart at all; state colors (existing green/amber/red for readiness) reserved for the heatmap only; curve line = neutral warm-gray; retest pins = filled circles in ink strong.
- **Thumb-reach verification for the segmented window control** → delegate to `app-mobile-ux`. The four-segment tier control at 361px width gives ~90px per segment; comfortable for thumb but borderline on iPhone SE. Verify tap-target ≥44 px vertical.
- **A11y audit on `RetestEventSheet`** → delegate to `app-accessibility`. Bottom sheet with citation content must announce as a dialog, focus first heading, allow escape-to-close.
- **Copy audit on the retest citations** → delegate to `app-copy-clarity`. String budget: 80 chars for study citations, 50 chars for log-signal citations, present-tense, no medical language.
- **Motion craft on the 200ms window-swap crossfade** → delegate to `app-motion-perf`. Verify 60fps at 365 points; verify `prefers-reduced-motion` alternative is instant swap, no perceptible jump.

---

## What this brief does NOT solve

- **Today's hero-of-the-day rebuild** — Cut B, later. Assumed here as a downstream dependency: engine banners moving to Today only makes sense if Today has room. If Cut B hasn't happened yet, Cut C temporarily leaves banners on Record and adds them to Today; the brief for Cut B will finalise placement.
- **Year-in-Review annual artifact** — matrix rec #6, deferred to Cut A. Record generates the data structure a YiR would need (retest events + citations + curve state) but does not render an annual shareable card.
- **Widget** — matrix rec #7, deferred to Cut A. Record is app-open territory; widget is home-screen territory.
- **Onboarding** — matrix rec #14, deferred. Record is not the first-run surface; Today is.
- **User-triggered retest** — open question #4, deferred to v2.
- **Multi-lift picker inside `ProgramCurveCard` for 5/3/1** — brief assumes a chip row above the curve for lift selection. Detailed chip design is downstream.
- **Concurrent-program stacked-curve rendering (CSM)** — brief specifies two curves in one card; exact composition (stacked axes vs. dual y-axis) is a visual-craft call downstream.
