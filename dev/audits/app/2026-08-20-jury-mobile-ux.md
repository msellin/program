# Terav design system — Lane B jury verdict (mobile-UX lens)

**Reviewer:** app-mobile-ux (Wroblewski / Hoober / Clark / HIG / Material 3 lens)
**Date:** 2026-08-20
**Viewport basis:** 393×852 primary, 375×667 SE cross-check

## Overall system vote — **APPROVE-WITH-CAVEATS**

The system as documented is *ergonomically sound in its bones*. The token set enforces an 8pt grid (44/48-friendly), the motion budget respects `prefers-reduced-motion`, the accent-economy call keeps CTA reach unambiguous, and — critically — Terav's rejection of a score-hero puts the primary emphasis on a **workout name**, which is the only element large enough on 393×852 to be readable at arm's length in a gym.

The mockups reveal two mobile-critical omissions: (a) the top-right settings gear on Today and the top-right chevrons on the drill list live in the ouch zone at ~x=340, y=60 — Hoober's data has that at ~46 % thumb-cost in cradle grip, and there's no written rule preventing new primitives from putting *primary* affordances there; (b) the **Session detail** mockup shows a `START BLOCK` bronze CTA at y≈340-ish — the mid-scroll position, not the bottom-thumb zone — because the block is inside a scroll container, not pinned. Without a "primary CTAs sticky in the bottom third" rule in the design system, engineering will ship the mid-page CTA that the mockup literally shows.

Bronze remains the sole invitation; the mockups uphold R2/R4 with one CTA per view — this is the biggest ergonomic win in the whole doc, because "which button do I press?" is answered by color, not by hunting. But the doc's silence on sticky vs. scroll behavior for primary CTAs and safe-area handling for the new `WorkoutHero` fold and `ExplainSheet` are P0 gaps.

## Primitive votes (12/12)

- **2.1 DashboardBlock** — YES (chevron needs ≥44×44 tap-slop even if icon is 16×16)
- **2.2 WorkoutHero** — YES with caveats (CTA sticky rule missing; status pill hit-slop rule)
- **2.3 Sparkline** — YES (`pointer-events-none` inside interactive cards)
- **2.4 ReadinessTrail** — YES with caveat (raise strip to `min-h-11`; don't try to make dots individually tappable)
- **2.5 WeeklySessionStrip** — **NO, needs revision** (cells at 40×28 fail Apple 44 as tappable; raise to `min-h-11` or spec display-only)
- **2.6 ArcProgressBar** — YES (retest markers need 44×44 hit-slop if tappable)
- **2.7 MetricStripCluster** — YES (3-cell cap already good)
- **2.8 CategoryTileGrid** — YES with caveat (whole-tile-tappable rule; corner chevrons decorative)
- **2.9 WeeklyHeatmap** — YES with caveat (per-cell drilldown fails 44; move to row/column tap; `overflow-hidden` to protect iOS back-swipe)
- **2.10 OutcomeBar** — YES
- **2.11 ExplainSheet** — YES with P0 caveats (safe-area-inset-bottom padding, handle + explicit X, backdrop tap-dismiss safety)
- **2.12 StatusPill** — YES (never independently interactive; whole row handles the tap)

## Surface votes (13/13)

| # | Surface | Vote | Reason |
|---|---|---|---|
| 1 | Today | YES | Open session CTA lands cradle-zone at y≈700 |
| 2 | Session | **NO — requires sticky primary** | START BLOCK CTA at y≈340 mid-scroll fails Fitts |
| 3 | Week | YES with `pb-24` on scroll container | |
| 4 | Progress | YES if heatmap `overflow-hidden` | |
| 5 | Programs catalog | YES | |
| 6 | Program preview | YES with sticky CTA rule | |
| 7 | Intake | YES with keyboard-aware CTA rule | |
| 8 | Check | YES | |
| 9 | Profile | YES | |
| 10 | Account | YES (destructive in top third of section) | |
| 11 | Evidence | YES | |
| 12 | Guide | YES | |
| 13 | Report | YES | |

## Cross-cutting P0 blockers

1. **§1 tokens** — add `safe-area` sub-section with `env()` tokens + hard "100dvh not 100vh" rule
2. **§2 preamble** — hover/focus/active parity rule for all interactive primitives (no `hover:` alone; iOS sticky-hover)
3. **§2.5 WeeklySessionStrip** — `min-h-11` if tappable OR spec as display-only
4. **§2.9 WeeklyHeatmap** — row-tap or column-tap, not per-cell
5. **§2.11 ExplainSheet** — safe-area + handle + X + backdrop safety
6. **§3 Session** — sticky bottom CTA rule for START BLOCK / NEXT BLOCK
7. **§3 Intake / Check** — keyboard-aware CTA rule (VirtualKeyboard API + `env(keyboard-inset-height)`)

## P1 mobile-UX issues

- P1-1 Bottom-nav route indication via weight + color + top-edge bronze indicator line (not color alone)
- P1-2 Bottom-nav ↔ WorkoutHero CTA visual separation (4-8px top-edge shadow)
- P1-3 Horizontal-scroll viz (`overflow-x: contain` + `scroll-snap`)
- P1-4 Long-press discoverability note (prefer whole-card tap)
- P1-5 Pull-to-refresh handling on Today (`overscroll-behavior-y: contain`)

## What the doc gets right

- Bronze as sole CTA — halves cognitive load per surface
- Motion 200/400/800 ms with reduced-motion collapse — WCAG 2.3.3 territory
- Haptic vocabulary of 5 matches iOS UIImpactFeedbackGenerator grain
- No score-donut — 72pt Whoop-scale unreadable at arm's length in a gym on 393px
- Static outcome bars on preview — no scroll-linked animation, avoids iOS Safari jank
- Tabular-nums global — critical for column alignment

## One-line verdict

Terav's system correctly refuses the ergonomic traps of a score-hero and a many-CTA surface, but currently under-specifies four mobile-critical behaviors (tap-target minimum on tiny viz cells, sticky primary CTA on scrollable surfaces, safe-area on sheets and full-height containers, keyboard-aware form CTAs). Land those seven amendments in the doc and Batch 36 is a mobile-shippable system.
