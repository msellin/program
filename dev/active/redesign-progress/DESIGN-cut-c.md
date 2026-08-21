# Terav Record — Cut C redesign · 2026-08-21

**Scope:** This design system is exclusively for the Cut C redesign of the collapsed Progress + History surface (`/record`). Every other Terav surface continues to use "Terav (v1.1.1)". Do NOT use this system for Today, Week, Programs, Account, Session, Check, Extras, Guide, Profile, Report, Evidence, or any legacy surface. When in doubt: this system = Record only.

## Inheritance

Inherits the full **Terav (v1.1.1)** visual language:

- **Palette:** warm-dark ground `#0E0F12`, surface `#16181c`, surface-2 `#20232a`, line `#5f6570`, line-strong `#6b717d`, muted `#93989f`, ink `#D6D9DE`, strong `#F0F1F3`
- **Accent economy (R2):** bronze `#d97e5b` is CTA-ONLY. NOTHING else uses bronze — not the rolling-avg curve, not chart axis, not the WindowTierControl active state, not the retest event dots. All non-CTA active states use strong-ink or line-strong instead.
- **Typography:** Inter (400/500/600), JetBrains Mono for numerals; H1 `32px semibold tracking-[-0.03em]`; mono-caps eyebrow `10px uppercase tracking-widest`; body `14px`; small `12px`
- **Numerals:** tabular-nums for every metric readout (weight, HR, delta)
- **Motion:** `--ease-out-terav: cubic-bezier(0.2, 0.8, 0.2, 1)`; `motion-reduce:transition-none` on every transition
- **Radius:** 4-8px cards; hairline borders on `border-line-soft`
- **Safe area:** env(safe-area-inset-*) padding on top and bottom
- **StatusPill, ArcProgressBar, InfoSheet, DashboardBlock:** as-is from v1.1.1

## What Cut C adds (new component specs)

### ProgramCurveCard

The load-bearing chart component for the Trend section. Renders one program's rolling-average curve at the currently selected zoom tier, with retest events as pins on the x-axis and raw points as an optional overlay.

- **Line color:** neutral warm-gray `text-strong / #F0F1F3` — NOT bronze
- **Retest event pins:** filled circles in `text-strong`, 6px diameter; on tap → InfoSheet with citation
- **Raw points overlay:** hollow circles `text-line-strong`, 3px diameter, only shown at 30d and 90d zoom (Oura decimation split); hidden by default at 1y and All zoom with a mono-caps `[ show raw ]` toggle
- **Y-axis:** JetBrains Mono, `10px text-muted`, tabular-nums
- **X-axis:** date labels in mono-caps `10px text-muted` at zoom-appropriate cadence (weeks at 30d, months at 90d, quarters at 1y, years at All)
- **Delta callout beneath chart:** `12-wk avg XXX.X kg  +XX.X since Q1'24` in mono, `text-ink`
- **Card:** `bg-surface border border-line-soft rounded p-3`

### WindowTierControl

Segmented control for the four zoom tiers at the top of the Trend section.

- **Layout:** 4 equal-width segments `[ 30d ]  [ 90d ]  [ 1y ]  [ All ]`
- **Active state:** `text-strong` label + 2px underline in `text-strong` beneath the active segment. NOT bronze. NOT filled background.
- **Inactive state:** `text-muted` label, no underline
- **Type:** `12px mono uppercase tracking-widest`
- **Persistence:** selection stored per-user; default is data-adaptive (30d for <30d users, 90d for <90d, 1y for <365d, All for 400+)

### RetestTimeline

Horizontally scrolling event list under the ProgramCurveCard.

- **Row 1:** `●─●─●─●─●─●─●─●─●─●─●─●─●─●─▲` connected dots + terminal `▲today` marker; dots in `text-strong`, connector line in `text-line-strong`
- **Row 2:** eyebrow `RETESTS · N events` in mono-caps `10px text-muted`
- **Row 3:** `Base X · Current Y · +D` summary in mono, `text-ink`, tabular-nums
- **Tap on any dot:** opens RetestEventSheet bottom sheet with per-event citation

### LatestRetestTile

The Now section's tenure-identity card — shows the most recent retest event.

- **Structure:**
  ```
  ┌─────────────────────────────────────┐
  │ [eyebrow: LATEST RETEST — context]  │
  │                                     │
  │ Metric name       Value  Δ          │
  │ vs previous (date)  PrevValue       │
  │ ─────────────────                   │
  │ Basis · signal name · triggered by  │
  │ Cited · Study reference             │
  │                Next retest in Nd    │
  └─────────────────────────────────────┘
  ```
- **Eyebrow:** mono-caps `10px text-muted`
- **Metric row:** `14px text-strong` name, `20px semibold text-strong` value + `text-green` delta (or `text-amber` for negative-direction improvement)
- **Basis + Cited rows:** `12px text-ink`; the citation is a study reference **inline in the card**, not behind a "Why?" chevron
- **Card:** `bg-surface border border-line-soft rounded p-3 border-l-4 border-l-strong` (subtle left rail marks it as a tenure artifact)

### ActivityHeatmap (year-column mode)

The Log section's history-at-scale primitive. Reuses the existing WeeklyHeatmap primitive at short data ranges, but re-projects to a year-column layout when data exceeds ~120 days.

- **Under 120 days:** 12-column × 7-row week matrix (existing WeeklyHeatmap unchanged)
- **Over 120 days:** 12-column × N-year layout, each column is a month letter (J F M A M J J A S O N D), each cell is a day; year label to the right of each row
- **Cell:** 12px×12px on mobile; `bg-line-soft` for logged, `bg-line-strong` for missed-planned, `bg-surface` for off-day
- **Grid:** hairline `border-line-soft` between month columns
- **Interaction:** tap-cell → scrolls to the corresponding LogRow and expands it

## Component naming discipline

New component names use `Cut-C-` prefix in code (`CutCProgramCurveCard`, `CutCRetestTimeline`, etc.) until the redesign lands. This is intentional friction — it makes it obvious in any diff which components are new-and-under-review vs stable-shipping components. After Cut C ships and stabilizes, the prefix is removed in a rename batch.

## Layout invariants

- Section anchors are horizontal rules `── NOW ────`, `── TREND ────`, `── LOG ────` — mono-caps eyebrow above each section as a screen-reader landmark
- Sections stack vertically with `space-y-6` between; components inside a section use `space-y-3`
- Every section works standalone (Now on its own reads as "how am I doing this week"; Trend on its own reads as "am I getting better"; Log on its own reads as "what have I done")
- No horizontal scroll except the RetestTimeline row

## Rejected patterns (explicit)

Reject anything the matrix flagged as anti-pattern OR anything that would compete with the founder's positioning:

- **Streaks, XP, tenure counters** (R5) — retest events carry tenure identity
- **Autonomous score-hero** (R8) — no single number that summarises "how am I doing overall"
- **Multi-accent palette** — bronze reserves CTA slot; no green/amber/red status pips in the curve
- **Whoop-style score reveal animation** — Trend curve draws statically with `motion-reduce` guard
- **Peloton-style milestone gamification** — no confetti, no "100 sessions" award badge
- **Fitbod-style implicit tenure mode** — this surface works identically at day 30 and day 400
