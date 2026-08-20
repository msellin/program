# Terav — Design system (v1.1.1, full-surface, jury-folded + verification-patched)

Owner: product-design-lead
Written: 2026-08-20 (v1.1) · Patched: 2026-08-20 (v1.1.1)
Status: **founder-approvable — Batch 36 clear** — Lane B jury caveats folded (v1.1); verification-round P1 fold gaps and design-lead conditions patched (v1.1.1); 6/6 juries clear for wire-up
Related audits:
- v1.0 baseline: `dev/audits/app/2026-08-20-terav-design-system.md`
- Lane B jury — mobile-UX: `dev/audits/app/2026-08-20-jury-mobile-ux.md`
- Lane B jury — copy clarity: `dev/audits/app/2026-08-20-jury-copy-clarity.md`
- Lane B jury — landing↔app alignment: `dev/audits/app/2026-08-20-jury-landing-alignment.md`
- Lane B jury — motion + perf: `dev/audits/app/2026-08-20-jury-motion-perf.md`
- Lane B jury — accessibility (WCAG 2.2 AA): `dev/audits/app/2026-08-20-jury-accessibility.md`
- Lane B jury — design-lead synthesis: `dev/audits/app/2026-08-20-jury-design-lead-synthesis.md`
- Market: `dev/audits/app/2026-08-20-market-research.md`
- Viz brief: `dev/audits/app/2026-08-20-viz-layer-brief.md`, `dev/audits/app/2026-08-20-viz-composition-call.md`
- Deep review: `dev/audits/app/2026-08-20-deep-design-review.md`
- Master task list: `dev/audits/app/2026-08-19-master-task-list.md` §G Rejected (R1-R12, hard constraint)
- Founder observations queue: `dev/audits/app/2026-08-19-founder-observations-queue.md` (O1-O21)

Governs: **all 13 surfaces** shipped as one coordinated batch (Batch 36).
Supersedes: v1.0 (`2026-08-20-terav-design-system.md`) in full — do not read v1.0 as authoritative once v1.1 is founder-signed.

**What v1.1 changes vs v1.0:** every Lane B jury caveat has been folded into the section it belongs in. The system calls from v1.0 (bento rejected for Today; semantic score-hero shipped; 13-surface single-batch; 7.0/10 success gate) are preserved — v1.1 does not re-argue rejected options. Where multiple juries flagged the same convergence (workout name as H1; ExplainSheet dialog contract; ARIA hooks on score-hero; interactive cell tap targets), the resolution lands in one place with cross-references. Every section ends with a **Jury caveats applied** audit trail so the founder can trace any caveat back to where it landed.

**What v1.1.1 patches on top of v1.1** (verification-round fixes, 2026-08-20 same-day):
- **§2.0 invariant 7** [NEW] — horizontal-scroll containment rule (mobile-UX P1-3, previously implicit/watchlist)
- **§2.14 AppShell** [expanded] — bottom-nav weight+color+indicator (P1-1); sticky CTA + nav layering rule with 1px `line-soft` divider (P1-2 + design-lead condition 1); pull-to-refresh containment via `pullToRefresh` prop (P1-5); wordmark pinning as per-surface decision, not shell-owned (landing C4)
- **§5 score-hero tab order** [refined] — merged "why-readiness" + "why-status" into a single composite `"Why this?"` trigger button (design-lead condition 2), reducing eyebrow-tier focusable nodes from four to one and simplifying persona-recover pre-CTA gauntlet

All six verification juries returned `Batch 36 clear` after these patches OR at initial v1.1 read; mobile-UX's `v1.2 needed` verdict resolves via §2.0 + §2.14 patches above. No new content added — only rules the verification juries said were claimed-but-not-actually-in-section-text.

---

## 0 · Philosophy

Terav is a **calm, disciplined, evidence-forward tool** for people who take one thing seriously at a time. Its aesthetic north star is the intersection of two 2026 peer clusters. First, the *serious operator tool* — Linear, Anthropic Console, Superhuman — where warm-dark ground plus a single chromatic accent plus tabular numerals plus generous whitespace signals "software made for grown-ups." Second, the *calm-first fitness family* — The Outsiders, Gentler Streak, Pliability — where anti-gamification is not a niche stance but a recognisable product membership. The apps Terav is nearest to are **The Outsiders** (2026 ADA Finalist, Gentler Stories' athlete tracker — serious + calm coexisting) and **Runna** (post-workout explanation card as the differentiator, calendar one tap away from Today). Terav borrows their surface temperature and information cadence, not their imagery or scoring.

The single move Terav does that everyone else doesn't: **explain-back + confirm-first + honest-viz combined**. Every peer ships at most two of these. Whoop has honest-viz and explain-back (Coach) but silently mutates. Runna has explain-back post-hoc but no confirm-first gate on plan changes. The Outsiders has honest-viz and calm-first but no citation contract. Terav's engine proposes, the user Accepts, every change cites a study or names its log signal, **and** the viz layer refuses to smooth over honest bad states (10 red readiness dots looks like 10 red dots). This is the design's actual product-integrity claim, and the system below is the visual grammar that makes it legible. Everything downstream — palette, primitives, motion, IA — either serves that claim or gets deleted.

**Jury caveats applied:** none direct to §0. Composition-lens synthesis §Q5 confirmed v1 skeleton is right and the philosophy does not need revision.

---

## 1 · Tokens

Everything below is **the** token set. If a color, size, or duration is not in this section, it does not ship. Feed the YAML block directly into `tailwind.config.ts`; the CSS variables already live in `next-app/src/app/globals.css:8-55` — this is the canonical superset (existing tokens marked `[live]`, new tokens marked `[new]`, changed values marked `[bumped]`, jury-folded tokens marked `[v1.1]`).

```yaml
# terav design system — tokens v1.1
# all values are the canonical source of truth
# do NOT introduce a color/size not in this file

color:
  # canvas + surfaces — warm-dark tonal layering, no shadows
  ground:     "#0e0f12"   # [live] app canvas — every route
  surface:    "#16181c"   # [live] card base — secondary blocks, extras, dashboards
  surface-2:  "#20232a"   # [live] card elevated — WorkoutHero, hero content, ExplainSheet content
  surface-3:  "#2a2e37"   # [new]  modal / sheet peak — bottom sheets, dialogs only
  # rule: never four elevation tiers on one surface. surface-2 + surface = the pair.

  # text (2 muted levels max — P1-30 discipline holds)
  strong:     "#f4f5f7"   # [live] titles + hero numeric
  ink:        "#d6d9de"   # [live] body copy
  muted:      "#93989f"   # [v1.1 bumped from #8a8f9a — a11y C2]
  # rule (v1.1): muted computes 4.19 on surface-3 in the v1.0 palette (fails WCAG 1.4.3).
  # bump to #93989f gives 4.60 on surface-3, 5.15 on surface-2. Muted is now legible
  # everywhere the design puts it, including inside ExplainSheet body captions.

  # lines
  line:         "#5f6570"   # [v1.1 bumped from #4d525d — a11y C1]
  # rule (v1.1): #4d525d computed 2.45 on ground and 2.27 on surface — fails 1.4.11
  # for non-text-interactive-boundary (input border, StatusPill outline, MetricStripCluster
  # divider that carries meaning). #5f6570 computes ~3.16 on ground — passes 3:1.
  line-strong:  "#6b717d"   # [v1.1 new — a11y C1]
  # use for: focusable input outline, StatusPill outline when interactive, arc-progress
  # rest-color, MetricStripCluster cell divider carrying semantic separation.
  line-soft:    "#24272f"   # [live] dividers, section boundaries — decorative only

  # bronze — the ONE CTA color. never used for large decorative fills.
  bronze:         "#c89666"  # [live] filled CTAs, arc fill, target-hit sparkline
  bronze-hover:   "#d9a97c"  # [live] hover state (touch: unused per §2 hover-parity rule v1.1)
  bronze-hi:      "#e2b686"  # [live] on-tint variant inside bronze/20 backgrounds
  bronze-active:  "#b3814f"  # [live] :active press feedback (all touch surfaces MUST wire this)

  # slate — secondary accent, rehab/skill/mobility category tint
  slate:      "#79b8c4"   # [live] category tint (rehab/skill/mobility), status pill "moved"

  # semantic — state colors, NEVER used as CTAs
  green:         "#5fb37a"  # [live] "ready" / improving / session-done-felt-good
  amber:         "#e0a63a"  # [live] "check first" / worsening / caution
  amber-strong:  "#f0b854"  # [live] on-tint for amber/20
  red:           "#e5654b"  # [live] red-flag symptoms, intervention card
  red-strong:    "#f28068"  # [live] on-tint for red/20 (P1-59 + a11y C3 — inside ExplainSheet always -strong)

  # laterality — L/R visual marks in rehab tracks (non-text-only per v1.1)
  lat-left:   "#4a8894"   # [live] left-side markers — DOT/MARK ONLY, never text glyph
  lat-right:  "#a279a8"   # [live] right-side markers — DOT/MARK ONLY, never text glyph
  # rule (v1.1 — a11y C4): lat-left computes 4.44 on surface (fails 4.5:1 as body).
  # These tokens are for non-text visual marks only (SC 1.4.11 target 3:1, which they meet).
  # If a surface needs an "L" or "R" text glyph, promote to `slate` or `bronze-hi`.

  # rule (R2): bronze is CTA. slate/green/amber/red are STATE. never mix.
  # rule (§H V4): one accent per surface. bronze as CTA, one category tint (left stripe
  # or metric-strip cell), no third chromatic value in the same visible frame.
  # rule (v1.1): inside ExplainSheet (surface-3), on-tint text escalates to -strong variants
  # (red → red-strong, amber → amber-strong). Muted is permitted at the v1.1 bumped value.

focus:
  # [v1.1 new — a11y §7]
  ring-color:  bronze
  ring-width:  2px
  ring-offset: 2px
  ring-style:  solid
  # rule: outline-none is ONLY permitted when :focus-visible replaces it.
  # WCAG 2.4.11: focus indicator must not be clipped by scroll container or sticky element.
  # Bronze focus ring at 2px on ground = 7.31 contrast; on surface-3 (sheets) = 5.19.
  # Every :focus-visible state uses these tokens. No route-specific focus overrides.

safe-area:
  # [v1.1 new — mobile-UX P0-1]
  top:        "env(safe-area-inset-top,    0px)"
  bottom:     "env(safe-area-inset-bottom, 0px)"
  left:       "env(safe-area-inset-left,   0px)"
  right:      "env(safe-area-inset-right,  0px)"
  keyboard:   "env(keyboard-inset-height,  0px)"   # VirtualKeyboard API — Intake + Check
  # rule (v1.1): every full-height container MUST use `100dvh`, not `100vh`.
  # 100vh miscalculates on iOS Safari with dynamic address-bar chrome and produces the
  # "primary CTA hidden below the fold" failure mode mobile-UX flagged as P0.
  # rule (v1.1): every fixed / sticky bottom element (bottom-nav, sticky primary CTA,
  # ExplainSheet drag handle) MUST pad by `safe-area.bottom`. iPhone home-indicator overlap
  # is a Fitts failure and a shipped-fresh a11y violation.

typography:
  font-sans:  "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
  font-mono:  "IBM Plex Mono, ui-monospace, 'SF Mono', Menlo, Consolas, monospace"
  # note: Inter is the sans workhorse. IBM Plex Mono replaces JetBrains Mono for
  # eyebrows + numeric captions — Plex was designed for data-accuracy interfaces
  # (per market research §4). Weight subsets shipped: sans 400/500/600/700, mono 400/500.
  # tabular-nums is a global default via `html { font-feature-settings: "tnum" }` [live].
  # motion-perf watchlist §7.6: Plex is ~15 KB gzipped delta over JetBrains Mono. Counted in the budget.

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
    # rule (v1.1 — score-hero guardrail — see §5):
    #   the workout name is always the tallest strong-white element on Today. If a state
    #   indicator, sparkline caption, or eyebrow ever renders visually larger than the
    #   workout name at 26px, the composition breaks the R8 spirit and the surface fails.

spacing:
  # 4px base — every spatial value is a multiple. no rogue 5/7/13/17.
  scale: [0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80]
  # mobile gutter: 16px page horizontal, 12px card-internal, 8px inline-cluster
  # desktop gutter: 24px page horizontal, 16px card-internal (only relevant on /report + /profile wide)
  # rule: card padding = 16px on 393; internal grid gutters = 12px; row rhythm = 12-16px vertical.

elevation:
  # tonal layering ONLY. no drop shadows in dark mode (per market research §4 — Linear rule).
  e0: { fill: ground,    border: none                    }  # canvas
  e1: { fill: surface,   border: "1px solid line-soft"   }  # secondary card
  e2: { fill: surface-2, border: "1px solid line-soft"   }  # primary card (WorkoutHero)
  e3: { fill: surface-3, border: "1px solid line",       shadow: "0 -8px 32px rgba(0,0,0,0.6)" }
       # sheets/modals ONLY. shadow is a directional cue (sheet slides up); still no ambient shadow.
  # DELETE: two-part box-shadow at DashboardBlock.tsx:99 — invisible on ground.

radius:
  none:   0
  sm:     4px    # inline pills (StatusPill, chips)
  md:     8px    # cards, buttons, tiles (default)
  lg:     12px   # bottom sheets, modals
  full:   9999px # avatar circle only
  # rule: 8px is the default. never a 5/6/7 rogue radius.

motion:
  # [v1.1 — motion-perf caveat 1: 800ms hero bucket DROPPED]
  # two duration buckets, no third. every animation is either UI-state or data-reveal.
  ui-state:     200ms   # state changes, pill crossfades, mark-done, press feedback (ceiling; press-feedback stays sub-100ms)
  data-reveal:  400ms   # sparkline stroke, progress-bar fill, arc-bar fill, heatmap stagger
  # DELETED [v1.1]: `hero: 800ms`. Rationale: exceeds every 2026 peer's hero moment
  # (Outsiders 600, Whoop 350, Runna 280), creates LCP-timing ambiguity, and every hero
  # bucket I have shipped has been abused by a later PR to justify a screen-wide entrance.
  # If a distinctive app-launch moment is required, implement as a 400ms data-reveal on the
  # readiness sparkline + card stagger — no dedicated hero bucket.

  sheet-slide:  300ms   # [v1.1 new — motion-perf §2] ExplainSheet slide-up; iOS sheet norm 250-350ms
  easing:       "cubic-bezier(0.2, 0.8, 0.2, 1)"
  # [v1.1 note — motion-perf §1.2]: this is a decel-out curve (~Material 3 "emphasized
  # decelerate"). It is NOT the same as CSS `ease-out` keyword (which is 0.0,0.0,0.58,1).
  # Do not swap to Tailwind's `ease-out` — name the cubic-bezier explicitly in every
  # transition. A follow-up commit adds `--ease-out-terav` in globals.css.
  stagger-cascade: 50ms  # (§H V3 approved) — capped total 600ms per §2.9 WeeklyHeatmap

  reduced-motion:
    # global rule: any duration > 0 collapses to 0.01ms to preserve transition-end events.
    # opacity keeps (no motion sickness). transforms + scale + auto-play REMOVED.
    # haptic keeps (accessibility-neutral).
    # data-viz reveals fall to their final frame. no partial-state renders.
    # tokens `ui-state`, `data-reveal`, `sheet-slide` all collapse.
    # [v1.1 — a11y M1]: any opacity-breathing pulse HALTS at 100% opacity (not mid-cycle).
    # [v1.1 — a11y M2]: stagger-cascade collapses to 0ms — no stagger at all under reduce.

haptic:
  # 5-signal vocabulary — nothing more, nothing less. iOS + Android compatible.
  # [v1.1 — motion-perf §1.4]: ship behind feature flag. default OFF for persona-recover
  # (quiet mornings). Measure whether milestone 60ms reads as "premium" or "annoying pager"
  # before enabling by default.
  confirm:      { pattern: "light-tap",   duration: 15ms   }
  accept:       { pattern: "medium-tap",  duration: 25ms   }
  error:        { pattern: "double-tap",  duration: 40ms   }
  milestone:    { pattern: "soft-heavy",  duration: 60ms   }
  section:      { pattern: "light-tap",   duration: 10ms   }
  # NEVER: sustained rumble, celebratory bursts. gamification vector; R5.
```

**What is new vs v1.0:**
- `focus` sub-block for the design-system focus-ring token (a11y §7).
- `safe-area` sub-block with `env()` tokens and the 100dvh rule (mobile-UX P0-1).
- `line-strong` token; `line` bumped from `#4d525d` to `#5f6570` (a11y C1).
- `muted` bumped from `#8a8f9a` to `#93989f` for surface-3 compliance (a11y C2).
- `lat-left` / `lat-right` explicitly non-text-only (a11y C4).
- `hero: 800ms` **deleted**; `sheet-slide: 300ms` added (motion-perf caveat 1).
- Explicit rule the workout name is always the tallest strong-white on Today (design-lead synthesis caveat 2).
- Reduced-motion extended: cascade collapse to 0ms; breathing pulse halts at 100% (a11y M1+M2).
- Haptic ships flag-gated (motion-perf §1.4).

**What is deleted:**
- The two-part box-shadow on `DashboardBlock.tsx:99` (from v1.0).
- Any `text-[13px]` / `text-[18px]` sizes not on the ramp (from v1.0).
- Any `text-muted/70` (P1-30 killed it — do not revive).
- The `hero: 800ms` motion bucket [v1.1 delete].
- Any drop shadow beyond the sheet directional cue.

**Jury caveats applied:**
- **a11y C1, C2, C3, C4** — line bumped, line-strong added, muted bumped, lat-* non-text-only.
- **a11y §6 M1+M2** — reduced-motion extended for cascade + breathing pulse.
- **a11y §7** — focus token sub-block added.
- **motion-perf caveat 1** — 800ms hero dropped; sheet-slide added.
- **motion-perf §1.2** — easing curve name locked; do not substitute Tailwind ease-out.
- **motion-perf §1.4** — haptic flag-gated.
- **motion-perf §4** — Plex font swap counted in the 20 KB bundle delta budget.
- **mobile-UX P0-1** — safe-area tokens + 100dvh rule + keyboard inset.
- **design-lead synthesis caveat 2** — workout-name-tallest rule.
- **copy §7.4** — muted usage inside ExplainSheet clarified (paired with §2.11 style rules).

---

## 2 · Primitives (component vocabulary)

Twelve components. If a surface needs something outside this list, that is a new-primitive proposal — write a brief first. **Do not add variants to escape the discipline.**

### 2.0 Universal primitive rules (v1.1)

Before the per-primitive specs, six invariants apply to **every** interactive primitive:

1. **Hover/focus/active parity** — no `hover:` alone. iOS sticky-hover means touch users see hover states stuck after tap; every hover state must be paired with `active:` (for touch feedback) and `focus-visible:` (for keyboard). Never rely on `hover:` alone to communicate interactive state.
2. **Tap-target minimum** — 44×44 CSS pixels or larger for every interactive element (per HIG + WCAG 2.5.5 AAA target that we adopt as AA policy). Icons smaller than 44px pad their hit-slop with `padding` or `min-h-11 min-w-11`.
3. **Focus visibility** — `:focus-visible` state uses the `focus` tokens (§1). `outline-none` is only permitted where `:focus-visible` replaces it (per a11y §7).
4. **DOM order = visual order** — tab order must match visual reading order. This is a fail-state in §7 (a11y §9).
5. **Accessible name always present** — every interactive primitive has an accessible name via visible text, `aria-label`, or `aria-labelledby`. No unlabelled buttons.
6. **`prefers-reduced-motion`** — every animated transition wraps in `motion-reduce:transition-none` or `@media (prefers-reduced-motion: reduce)` guard (per §1 reduced-motion block).
7. **Horizontal-scroll containment** [v1.1.1 — mobile-UX P1-3] — any primitive that scrolls horizontally on mobile (`WeeklySessionStrip` at ≤375px, `WeeklyHeatmap` at ≤393px, `CategoryTileGrid` collapse) uses `overflow-x: auto` + `overscroll-behavior-x: contain` + `scroll-snap-type: x mandatory` on the scroll container, and `scroll-snap-align: start` on each child. Prevents iOS Safari back-swipe capture and delivers a positional resting state after flick. Verified in Batch 36 wire-up review.

### 2.1 `DashboardBlock` — the workhorse [existing, keep]

```ts
type DashboardBlockProps = {
  eyebrow?: string;                     // 10-11px mono-caps
  title: string;                        // h3-card 20px
  headingLevel?: 2 | 3;                 // [v1.1 — a11y §4] default 2; 3 when nested inside WorkoutHero
  lede?: string;                        // caption 12px
  accent?: 'bronze' | 'slate' | 'green' | 'amber';   // 4px left stripe
  collapsible?: boolean;
  primaryCta?: { label: string; onClick: () => void };
  children: ReactNode;
};
```

Rendered as `<section aria-labelledby={id}>` with the heading getting the `id`. If `lede` and `primaryCta` are both present, the CTA carries `aria-describedby={lede-id}` so SR reads the context before the action.

- **Use for:** Extras block, Signals card, secondary content, "why this?" auxiliary blocks, meta/spec sections.
- **Do NOT use for:** the primary daily action (use `WorkoutHero`), category browsing (use `CategoryTileGrid`), retest metrics (use `DashboardBlock` **wrapping** the retest cluster — not each metric card).
- **Compliance:** R1/R2/R3/R4 pass. This is the primitive that got over-used in Batches 33/34/35 — the fix is a dedicated hero, not more props here.
- **INP watchlist [v1.1 — motion-perf caveat 3]:** the `grid-template-rows: 0fr → 1fr` expand transition must be measured on mid-tier Chrome (Pixel 5-class). Fail deploy if INP > 180ms. Fallback: disable the interpolation via `@supports` guard on older iOS Safari.

**Jury caveats applied:** a11y §4 (headingLevel prop, section-labelledby); motion-perf caveat 3 (INP measurement).

### 2.2 `WorkoutHero` — the primary anchor [NEW]

```ts
type WorkoutHeroProps = {
  scope: 'today' | 'tomorrow' | 'session' | 'retest' | 'preview';   // [v1.1 — copy §7.2] drives the eyebrow
  eyebrow: string;                           // "TODAY · WEEK 3 OF 6" — scope + coord, mono-caps
  title: string;                             // "Norwegian 4×4" — h1-display on Today, h2-hero on Session/Preview
  headingLevel: 1 | 2;                       // [v1.1 — a11y §4] required, not optional
  lede: string;                              // "Row/Ski · concurrent strength maintenance"
  status: StatusPillProps;                   // right-eyebrow pill (WORKOUT READY / CHECK FIRST / ...)
  metrics: MetricStripClusterItem[];         // 3 cells: duration / blocks / target
  blocks: { number: number; name: string; setsLabel: string; citationCount?: number }[];  // [v1.1 — landing C3] citation chip per block
  primaryCta: { label: string; onClick: () => void };   // "Open session →" (Today), "Start block ▶" (Session), etc — see §2.13
  stickyCTA?: boolean;                       // [v1.1 — mobile-UX P0-6] true on Session; false on Today (CTA is already cradle-zone)
};
```

- **Use for:** the workout summary on Today, the session opener on `/session/[slug]`, the retest hero on Progress' retest-week Monday state, the "start intake" hero on program preview.
- **Do NOT use for:** anything else. This primitive earns its cost by being the **primary emphasis** on the surface. Multiple `WorkoutHero`s on one route = system failure.
- **Compliance:** R1 (no photo), R2 (bronze CTA only), R3 (26-32px title ≤ 32px cap), R4 (eyebrow + status pill are mono-caps), R5 (no streak — "workout ready" is a state), R8 (no autonomous score).
- **Composition:** e2 surface, no shadow. StatusPill in top-right of eyebrow row; MetricStripCluster nested on e1.

**H1 pattern [v1.1 — landing C1 + copy §7.2 + design-lead synthesis convergence]:**
- On Today, `title` (the workout name) renders at `h1-display` (32px) and is the `<h1>` on the page.
- Above the H1, a small mono-caps eyebrow gives scope: **"TODAY · WEEK 3 OF 6"** (or "TOMORROW · REST DAY", "SESSION · BLOCK 1 · WARM-UP"). This is the small coordinate label — 10px, tracking 0.06em, weight 500 — that solves the DateNav duplication problem without inverting hierarchy.
- **The route name "Today" is NEVER an H1 on Today.** The bottom nav labels the route; the H1 belongs to the focus. This overturns commit `100760b` which reverted H1 to the scope label; the fix stands but H1 belongs to the workout name and the scope moves to the eyebrow tier.
- On Session, `title` renders at `h2-hero` (26px) and is the `<h1>` semantically (page-scoped). The eyebrow above reads "SESSION · BLOCK 1 · WARM-UP".
- On Program preview, `title` renders at `h2-hero` and is the `<h1>`. Eyebrow: "PROGRAM · REFRESHED" or "PROGRAM · ACTIVE".
- On Progress retest-week Monday, `title` renders at `h2-hero` and is `<h2>` — page has its own H1 "Progress".

**Sticky CTA rule [v1.1 — mobile-UX P0-6]:**
On Session, the primary CTA (`Start block ▶` / `Next block ▶`) sits inside a **fixed bottom container** with `padding-bottom: safe-area.bottom + 12px`. This ensures the primary action is always reachable in the cradle grip regardless of scroll position. The rule: any scrollable surface with a primary CTA that lives below the fold sticks the CTA to the bottom. Applies to Session (P0), Preview (P0), Intake (P0 — plus keyboard-aware, see below). Does NOT apply to Today (CTA is already positioned in the cradle zone at ~y=700 on 393×852). Does NOT apply to Progress (dense scroll, no single primary action).

**Keyboard-aware CTA rule [v1.1 — mobile-UX P0-7]:**
On Intake and Check, sticky CTAs use the VirtualKeyboard API and `env(keyboard-inset-height)` to sit above the on-screen keyboard when active. If VirtualKeyboard API unsupported, fall back to `visualViewport` height listener. Never let the sticky CTA get covered by the keyboard.

**Citation chip per block [v1.1 — landing C3]:**
Each block row in `blocks[]` may include `citationCount`. If present, render a small bronze `[cited]` chip (mono-caps, 10px, tracking 0.06em) next to the block name that opens `ExplainSheet` with trigger `proposal-citation`. This delivers landing's `evidence.title` promise ("Every session cites its research") visibly on the Session surface. If `citationCount` is undefined, no chip renders — do not fabricate.

**Jury caveats applied:** landing C1 (H1 hierarchy), landing C3 (citation chip), copy §7.2 (kill "Focus session" H1), a11y §4 (headingLevel required, ordered-list markup for blocks), mobile-UX P0-6 (sticky CTA), mobile-UX P0-7 (keyboard-aware).

### 2.3 `Sparkline` — trend as shape [existing, expand]

```ts
type SparklineProps = {
  data: number[];
  direction?: 'improving' | 'worsening' | 'flat';
  targetValue?: number;
  width?: number;               // default 96
  height?: number;              // default 20
  ariaLabel: string;            // required — SR summary in words, NOT "chart" or "sparkline"
  caption?: string;             // [v1.1 — copy §5.1] visible caption below the shape
};
```

Rendered as `role="img"` with the required `ariaLabel`. `pointer-events: none` inside interactive card contexts to avoid intercepting whole-card taps (mobile-UX §2.3).

- **Use for:** every state that has ≥ 2 data points (§H V2). Readiness strip, retest metric cards, milestone context, extras drill-count trend.
- **Do NOT use for:** point-in-time single values (use `StatusPill`), target-oriented promises (use `OutcomeBar`), completion booleans (use `WeeklySessionStrip`).
- **Compliance:** R5 (a sparkline is a shape), R8 (single self-reported series, not a composite), R11 (self only, never aggregated).

**Caption vocabulary [v1.1 — copy §5.1]:**
When rendered with visible caption, the string is a factual one-liner: **"Symptom trend, 14 days · improving"**, **"Load, 14 days · steady"**, **"TM · 8 weeks · +7.5 kg"**. Not decorative — orienting. Mono-caps eyebrow tier when it sits above the sparkline; sans caption when below.

**ARIA label format [v1.1 — copy §5.1 + a11y §4]:**
`"Readiness trend, 14 days, improving. Values ranged 2 to 4 out of 10. Latest reading 2."` — concrete range + latest + direction. Do not say "chart" or "sparkline". Third-person factual, no "you", no exclamation.

**CLS trap [v1.1 — motion-perf §3.2]:**
`Sparkline` returns null at `n < 2`. Wrap in fixed-height container (`min-h-[20px]` at default height) so async data population does not push content below.

**Jury caveats applied:** copy §5.1 (caption + aria format), a11y §4 (role="img", ariaLabel format), motion-perf §3.2 (CLS wrapper), mobile-UX §2.3 (pointer-events).

### 2.4 `ReadinessTrail` — magnitude-tinted state history [existing, upgrade]

```ts
type ReadinessTrailProps = {
  readings: { date: string; state: 'green' | 'amber' | 'red'; magnitude?: number }[];
  window?: 14 | 30;
  ariaLabel: string;                        // required
  interactive?: boolean;                    // [v1.1 — a11y §4] declare intent
  onCellTap?: (date: string) => void;
};
```

**Interactive vs display-only [v1.1 — a11y §4]:**
The v1.0 spec left cell interactivity ambiguous. Decision: **display-only by default, interactive only when `interactive={true}` is explicitly set.** Interactive mode is exclusively for Progress' 30-day expansion; Today's 14-dot strip is display-only. When interactive, each cell is a `<button aria-label="{date}: {state} magnitude {magnitude}">` with `min-h-11 min-w-11` hit-slop, and the wrapping element becomes `role="group"` (not `role="img"`). When display-only, the wrapping element is `role="img"` with the summary aria-label.

**Tap-target rule [v1.1 — mobile-UX P0-3]:**
When rendered as an interactive strip, raise container to `min-h-11`. Do NOT try to make individual dots individually tappable at native size — hit-slop is the whole cell region.

- **Use for:** ambient state history on Today (14-dot inline strip, display-only), Progress top-of-page 30-day trail expansion (interactive).
- **Compliance:** R5 (no "N-in-a-row" language, no streak counter), R8 (state per day is user-authored via `/check`).
- **Upgrade from live:** magnitude tint inside each state color (§H V2 · V5). Honest gradient of intensity within a state.

**ARIA label format [v1.1 — copy §5.3]:**
`"Readiness, past 14 days: 9 green, 3 amber, 2 red. Latest reading green (magnitude 0.8). Trend: improving over the last 7 days."` Full breakdown; do not omit any state count.

**Score-hero guardrail [v1.1 — synthesis caveat 2]:**
ReadinessTrail width MUST be ≤ 40% of the card interior width, and MUST sit ABOVE the WorkoutHero in visual weight rank order 3 (behind the workout name at 32px H1 and the CTA at 14px semibold bronze). If a persona render shows the ReadinessTrail visually outweighing the workout name, ship fails.

**Jury caveats applied:** a11y §4 (interactive/display-only decision, role="img" vs role="group"), copy §5.3 (aria format), mobile-UX P0-3 (min-h-11 when interactive), synthesis caveat 2 (weight-rank guardrail).

### 2.5 `WeeklySessionStrip` — 7-cell M-T-W-T-F-S-S [NEW]

```ts
type WeeklySessionStripProps = {
  weekStart: string;
  days: { dayLetter: string; scheduled: boolean; completed: boolean; isToday: boolean; isRest: boolean }[];
  interactive?: boolean;
  onCellTap?: (dayIndex: number) => void;
  ariaLabel?: string;      // required when interactive=false, computed
};
```

**Tap-target resolution [v1.1 — mobile-UX P0-3]:**
v1.0 spec was ambiguous about cell size (40×28 fails Apple 44). Resolution: **cells are 44×44 minimum when `interactive=true`.** In the strip layout that means the strip container is `min-h-11` and each cell is `flex-1 min-h-11` (48px+ per cell on 393×852). When `interactive=false` (Today's ambient strip), cells are pure visual marks, container `role="img"` with the summary aria-label.

**No breathing pulse on today's cell [v1.1 — motion-perf §5.1]:**
Do not add a breathing pulse to today's cell. The static-with-slate-outline treatment is correct — a pulse is R5-adjacent and invites "keep the streak going" reading.

**ARIA when interactive:** each cell is `<button aria-label="{dayFull}: {state}" aria-current={isToday ? 'date' : undefined} aria-pressed={completed}>`.

**ARIA when display-only:** `role="img"` with computed summary "Week strip: Mon done, Tue done, Wed rest, Thu today, Fri scheduled, Sat scheduled, Sun rest."

- **Use for:** inside `WorkoutHero` on Today (display-only), expanded inside `/session/[slug]` header (display-only), replicated at the top of `/week` (interactive — tap to expand day detail).
- **Do NOT use for:** any "N in a row" language. Adjacent completed cells stay adjacent completed cells — never a badge, never a count.

**Jury caveats applied:** mobile-UX P0-3 (44×44 when interactive), a11y §4 (interactive/display-only ARIA split), motion-perf §5.1 (no breathing pulse).

### 2.6 `ArcProgressBar` — "week 3 / 6" horizontal [NEW]

```ts
type ArcProgressBarProps = {
  programName: string;
  glyph: CategoryGlyph;
  weekCurrent: number;
  weekTotal: number;
  retestSchedule: { weekIndex: number; label: string }[];
  nextMilestone?: string;
  ariaLabel: string;                                     // [v1.1 — a11y §4] required
};
```

Rendered as `role="progressbar"` with `aria-valuenow={weekCurrent} aria-valuemin={0} aria-valuemax={weekTotal} aria-label="{programName} progress: week {weekCurrent} of {weekTotal}. Next retest week {nextRetestIndex}."` — this is the primitive whose v1.0 spec had no aria field at all (a11y §4). Fix landed.

Retest diamond waypoints render as siblings inside `role="group"` with per-waypoint accessible names (`aria-label="Retest week 4: 30-second plank hold"`). If waypoints are tappable, each is a `<button>` with 44×44 hit-slop (mobile-UX §2.6).

- **Use for:** above `WorkoutHero` on Today (single program), stacked per-program on multi-track Today, full-width on Progress with retest waypoints as diamond markers.
- **Do NOT use for:** self-imposed streaks, session count, calendar-independent goals.
- **Compliance:** R5 (calendar-driven), R8 (single metric — weeks elapsed / weeks total).

**Reserved height [v1.1 — motion-perf §3.2]:**
Container fixes `min-height` so the fill animation from 0 → weekCurrent/weekTotal does not shift siblings during mount. Fill uses `data-reveal` (400ms); reserved space is the final-frame layout.

**Jury caveats applied:** a11y §4 (progressbar role + aria-valuenow required), mobile-UX §2.6 (44×44 waypoints), motion-perf §3.2 (reserved height for CLS).

### 2.7 `MetricStripCluster` — 3-cell nested strip [NEW]

```ts
type MetricStripClusterItem = { label: string; value: string; hint?: string };
type MetricStripClusterProps = { items: MetricStripClusterItem[]; density?: 'default' | 'compact'; ariaGroupLabel?: string };
```

**Semantic markup [v1.1 — a11y §4]:**
Rendered as `<dl>` with three `<dt>` (label, mono-caps) + `<dd>` (value, mono-numeric) pairs. Alternative: `role="group" aria-label={ariaGroupLabel || 'Session metrics'}` with each cell semantically `<div>` containing label + value. `<dl>` is cleanest and preferred.

**Mono-numeric text alternative [v1.1 — a11y §4]:**
Values containing `×` (U+00D7) glyph or `/` separator MUST include an explicit `aria-label` on the cell. Example: `<dd aria-label="2 sets of 8 per leg">2 × 8 / leg</dd>`. JAWS default reads "×" as "X"; VoiceOver reads it correctly. Do not rely on SR pronunciation of composite math.

- **Use for:** inside `WorkoutHero` (duration/blocks/target), inside retest metric cards (baseline/current/Δ), inside program preview meta grid (weeks/hours-per-week/level).
- **Do NOT use for:** more than 3 cells (compresses below legibility at 393). If a 4th value exists, promote it to its own row.
- **Compliance:** all pass. Labels are mono-caps eyebrow tier; values are `metric-display` mono numeric.

**Grid CLS rule [v1.1 — motion-perf §3.2]:**
`grid-cols-3` with `grid-cols-min-0` cells so long values don't reflow siblings during hydration.

**Jury caveats applied:** a11y §4 (`<dl>` markup + aria-label on `×`/`/` cells), motion-perf §3.2 (grid-cols-min-0).

### 2.8 `CategoryTileGrid` — 2×2 or 2×3 browse [NEW]

```ts
type CategoryTileGridProps = {
  categories: {
    id: string;
    name: string;
    glyph: CategoryGlyph;
    tint: 'bronze' | 'slate' | 'green' | 'amber';
    count: number;
    pitch: string;
  }[];
  onTileTap: (id: string) => void;
};
```

Rendered as `<ul>` with `<li><button aria-label="{name}: {pitch}, {count} available">...</button></li>` per tile. Glyph is `aria-hidden="true"`. `role="grid"` is NOT correct here (grid ≠ tile grid semantically per a11y §4).

**Tap target:** whole tile is tappable; corner chevrons decorative (aria-hidden). No individual affordance smaller than the tile itself. Tile min-height = 96 (2×2) or 88 (2×3).

- **Use for:** `/programs` catalog (2×3 grid of 6 categories), Extras block on Today (2×2 grid of 4 drill categories).
- **Do NOT use for:** vertical text lists (that is `DashboardBlock` stacked). Tiles carry visual identity via glyph + subtle 8-12% gradient overlay.
- **Compliance:** R1 (gradient is CSS math), R2 (tiles are tap targets, not CTAs — bronze is not consumed).

**Jury caveats applied:** a11y §4 (`<ul>` + `<button>` per tile, glyph aria-hidden), mobile-UX §2.8 (whole-tile-tappable, corner chevrons decorative).

### 2.9 `WeeklyHeatmap` — 7×12 GitHub-style [NEW]

```ts
type WeeklyHeatmapProps = {
  cells: { date: string; sessionState: 'green' | 'amber' | 'red' | 'rest' | 'missed' }[];   // 7 × 12 = 84
  ariaLabel: string;                       // [v1.1 — a11y §4] required
  onRowTap?: (weekIndex: number) => void;  // [v1.1 — mobile-UX P0-4] row-tap not per-cell
  legend?: boolean;                        // [v1.1 — copy §5.2] default true
};
```

**Tap-target resolution [v1.1 — mobile-UX P0-4]:**
Per-cell drilldown at ~48px viewport = 40-48px cells minus gutters = fails 44×44. Resolution: **row-tap or column-tap only, never per-cell.** Each week row is a `<button aria-label="Week of {weekStart}: {n} done, {n} amber, {n} red, {n} rest, {n} missed">` with `min-h-11`.

**Legend [v1.1 — copy §5.2]:**
Below the grid: **"Green · session done, felt good.  Amber · done, symptoms bumped.  Red · red-flag day.  Slate outline · rest or missed."** Four states in one row of mono-caps captions with colored dots. If `legend={false}`, the surrounding surface must provide the legend elsewhere.

**Overflow protection [v1.1 — mobile-UX §2.9]:**
Grid container is `overflow-hidden` to protect iOS back-swipe gesture. Do not allow horizontal drift.

**Stagger cascade cap [v1.1 — motion-perf §2.3]:**
84 cells × 50ms uncapped = 4.2s of cumulative delay — unacceptable. Two caps: (1) `IntersectionObserver`-scoped to viewport-visible cells only (not scroll listener); off-viewport cells render final-state instantly. (2) total cascade duration capped at 600ms — if cells × 50ms > 600ms, shrink per-cell delay proportionally. Combined with `content-visibility: auto` + `contain-intrinsic-size` on the grid container for browser layout skipping.

**ARIA label format [v1.1 — copy §5.2]:**
`"Session history, past 12 weeks: 42 green days, 8 amber, 2 red, 12 rest, 20 no session logged."` Full breakdown including "no session logged" — hiding it is the streak-app move.

- **Use for:** top of Progress route only. Nowhere else — this primitive is heavy and its context is "the shape of my last 12 weeks."
- **Do NOT use for:** streak-counter framing, "keep the green going" copy nearby, any label that reads compliance.
- **Compliance:** R5 (missed = slate outline, not red shame; no streak language), R8 (per-cell state = one self-reported symptom + one boolean session-done).

**Jury caveats applied:** a11y §4 (ariaLabel required + summary format), copy §5.2 (legend + aria breakdown including "no session logged"), mobile-UX P0-4 (row-tap only), mobile-UX §2.9 (overflow-hidden), motion-perf §2.3 (cascade cap + IntersectionObserver), motion-perf §3.6 (content-visibility auto).

### 2.10 `OutcomeBar` — baseline → target on preview [NEW]

```ts
type OutcomeBarProps = {
  metricName: string;
  baselineValue: string;
  targetValue: string;
  rangeCaption: string;                    // "TYPICAL RANGE +15 TO +25 KG · 8 WEEKS"  (REQUIRED — landing §6, C7)
  ariaLabel?: string;                      // computed if omitted
};
```

Rendered as `role="img" aria-label="{metricName}: baseline {baselineValue}, target {targetValue}. {rangeCaption}"`. Static, no interaction, no focus concern.

**Range honesty rule [v1.1 — landing C7]:**
`rangeCaption` is REQUIRED per program. Point-value-only targets violate the "not certain about you" promise (`wontdo.not_certain_body`). Add QA-2 sync check `check-outcome-honesty.py` that asserts every program's `expected_outcomes` includes a `rangeCaption`. Fail merge on missing range.

- **Use for:** `/programs/[slug]` "What you'll achieve" section — stacked 2-3 rows. Static; not a live progress bar.
- **Compliance:** R11 (rangeCaption is authored from evidence base, not aggregated), R5 (spec-visualisation of intent, not tracker), R8 (baseline + target are authored).

**Jury caveats applied:** landing C7 (rangeCaption required, sync check).

### 2.11 `ExplainSheet` — the "because…" surface [align with existing `InfoSheet`]

```ts
type ExplainSheetProps = {
  trigger: 'proposal-citation' | 'metric-explain' | 'engine-signal' | 'status-pill' | 'readiness-trail';
  title: string;
  titleId?: string;                        // for aria-labelledby wiring
  citation?: { label: string; source: string; year: number; url?: string };
  logSignal?: { name: string; value: string; window: string };
  body: string;                            // subject to style rules — see below
  onClose: () => void;                     // [v1.1 — a11y §4] required, not optional
  isOpen: boolean;
};
```

**The 8 sheet rules [v1.1 — mobile-UX P0-5 + a11y §4 + copy §7.4 convergence]:**

This is the load-bearing convergence primitive. Three juries flagged it. All 8 rules land here.

1. **Safe-area bottom padding.** Every sheet renders with `padding-bottom: safe-area.bottom + 16px`. Content never overlaps iPhone home indicator.
2. **Drag handle + explicit X.** Top-center drag handle (24×4px pill, `line-strong` color, `aria-hidden="true"`) for gesture-familiar dismiss. Top-right explicit close button (`<button aria-label="Close">`) with 44×44 hit-slop for keyboard + explicit-tap dismissal. Both required — handle alone is insufficient (a11y), X alone is insufficient (touch discoverability).
3. **Backdrop tap-dismiss safety zone.** Backdrop is tappable to dismiss, but the top 40px above the sheet chrome is a safety margin (no tap-through) to prevent accidental dismissal during handle drag. The remaining backdrop area dismisses on tap. `role="presentation"` on backdrop, tap listener explicit.
4. **`role="dialog"` + `aria-modal="true"` + `aria-labelledby={titleId}`.** Full dialog semantics. `role="alertdialog"` is NOT used here — an ExplainSheet is not an alert.
5. **Focus trap on open, focus restore on close.** Use existing `useFocusTrap` (batch 25). First focus goes to the close button; last focusable element cycles back. On close, focus returns to the invoking element (StatusPill's why-this button, block cite chip, etc.).
6. **Keyboard escape.** `Escape` closes. `Tab` cycles within. `Shift+Tab` cycles backward.
7. **Body style rules (copy §7.4):**
   - **First word is the state or verb.** "Green because…", "Amber because…", "Moved because…", "Paused because…". Not "You're in green…".
   - **Cite the threshold.** "Symptom score 2/10 (green threshold ≤ 3)". Not "Your symptoms look good".
   - **Name the signal, not the sentiment.** "Sleep proxy OK" is a signal; "You slept well" is a sentiment. Signals only.
   - **Uncertainty gets a range, not a hedge.** No "might be", "could be", "seems like". If uncertain, quote a range (match landing `wontdo.not_certain_body`).
   - **No second person for evaluations.** "You did well" → cut. "Session completed, symptom log clean" → keep.
   - **No exclamation marks. Ever.**
8. **Sheet-parity across surfaces.** Same primitive on Today, Session, Week, Progress, Preview, Evidence. Same sheet-slide duration (300ms), same easing, same reduced-motion collapse. The user learns the sheet once.

**Contrast escalation inside sheet [v1.1 — a11y C3]:**
Inside ExplainSheet (surface-3), on-tint colors escalate to `-strong` variants. `red` → `red-strong`. `amber` → `amber-strong`. Muted body copy uses the v1.1-bumped `#93989f` (or resolves to `ink` where legibility is critical — the type contract enforces this).

- **Use for:** the "why this?" tap on every engine-proposed change, every retest-metric explain, every readiness-state tap. Opens as a bottom sheet at e3.
- **Do NOT use for:** first-run help, generic tooltips (use `title` attr or inline caption), settings.
- **Compliance:** this is Terav's explainability pattern per market research §5. Citations always name a source (study or log signal). **Never a chat.**

**Jury caveats applied:** mobile-UX P0-5 (safe-area + handle + X + backdrop safety), a11y §4 (onClose required + full dialog contract + focus trap), copy §3+§7.4 (body style rules), a11y C3 (red-strong inside sheet), motion-perf §2 (sheet-slide 300ms bucket).

### 2.12 `StatusPill` — the chip pattern [existing, formalise]

```ts
type StatusPillProps = {
  label: string;                           // e.g. "WORKOUT READY"
  tone: 'green' | 'amber' | 'slate' | 'muted';   // never bronze
  dot?: boolean;
  interactive?: boolean;                   // [v1.1 — a11y §3, §4]
  ariaRole?: 'status' | 'button';          // computed from interactive; explicit override for edge cases
  ariaLive?: 'polite' | 'off';             // default 'polite' when role=status
};
```

**Role rules [v1.1 — a11y §3 + §4 convergence]:**
- When the pill represents a state (readiness on Today, program status on Profile), `ariaRole="status"` with `aria-live="polite"` on a container that persists across mounts. Do NOT inject the pill fresh each render — SR misses live-region announcements from freshly-mounted nodes.
- When the pill is interactive (filter chip, selector), `ariaRole="button"`. `interactive={true}` triggers this.
- The dot inside the pill is `aria-hidden="true"` so SR does not read "green dot workout ready" twice.
- Full label is the accessible name — do not compress abbreviations for SR.

**Score-hero ARIA hooks [v1.1 — a11y §3 + design-lead synthesis convergence]:**
On Today's readiness composition, the StatusPill and the ExplainSheet trigger are TWO focusable elements. The pill itself is `role="status"` (not `role="button"` — cleaner semantics per a11y §3 recommendation b). An adjacent icon-only `<button aria-label="Why workout ready?">` opens ExplainSheet with `trigger="status-pill"`. The ReadinessTrail has its own `<button aria-label="Open readiness history">` that opens ExplainSheet with `trigger="readiness-trail"`. Two focusable elements, two distinct accessible names, one shared sheet primitive.

- **Use for:** `WorkoutHero` right-eyebrow (status), Program preview status (ACTIVE/REFRESHED), Profile identity chip, proposal state, retest waypoint state.
- **Do NOT use for:** primary action (use bronze CTA), long labels (>16 chars — reflow to a caption instead).
- **Compliance:** R2 (bronze is not a pill tone — tone is semantic state, CTA is separate).

**Interactive rule [v1.1 — mobile-UX 2.12]:**
Pills are NEVER independently interactive as tap targets embedded in a row where the whole row handles the tap. If a row is tappable (proposal card row, program row on Profile), the whole row handles the tap; the pill is display.

**Jury caveats applied:** a11y §3 (role=status + aria-live + separate button for ExplainSheet trigger), a11y §4 (interactive prop + role clarification), mobile-UX 2.12 (whole-row tap when embedded), synthesis caveat 2 (score-hero ARIA hooks resolve here).

### 2.13 CTA vocabulary — the 8-surface strings [v1.1 NEW — copy §7.3]

Every primary and secondary CTA across the app, published as canonical strings before Batch 36 wires. Do not invent CTAs at wire-up.

| # | Surface | Primary CTA | Secondary CTA(s) |
|---|---|---|---|
| 1 | Today (`WorkoutHero`) | **Open session →** | (none — arc/pill are ambient) |
| 2 | Session (block idle) | **Start block ▶** | Skip block · Move day |
| 2b | Session (block active) | **Log set →** | End block |
| 3 | Programs catalog | (tap tile) | (none) |
| 4 | Program preview | **Make this my focus →** | Read the citations → |
| 5 | Intake | **Start intake →** (entry) · **Continue →** (per step) | Save draft |
| 6 | Check | **Save check →** | Save draft |
| 7 | ExplainSheet (proposal) | **Accept** | **Ignore** |
| 8 | Profile (per-program row) | **Manage →** | (none — row-tap opens program detail) |
| 9 | ExplainSheet trigger (icon button) | **Why this? →** | (none — opens sheet) |
| 10 | RunSlot (extras logger) | **Log extra session →** | (none) |
| 11 | Account (delete) | **Delete account →** | (confirmation modal) |

**Rules:**
- All primary CTAs end with `→` (or `▶` on Session start — a play glyph is legitimate for a "begin the workout" verb).
- All are 1-3 words, sentence case (except mono-caps eyebrows above).
- No exclamation points. No "Now", "Today", "Ready?". No motivational verbs ("Crush", "Own", "Level up").
- Bronze filled = primary; ghost outline = secondary.
- Accept + Ignore verbs match landing (`beta.cta_primary` = "Pick my focus"; `how.step_03_body` = "engine proposes, you Accept or Ignore"). This closes landing C2 (Accept/Apply verb mismatch) — the verb is **Accept**.

**Verb family:** pick / make / open / start / log / save / accept / ignore / manage / delete. All physical-hand verbs, none motivational. Terav's CTAs read as mechanics ("open the session file"), not pep-talks.

**Jury caveats applied:** copy §7.3 (full CTA vocabulary table), landing C2 (Accept verb locked), landing §2.5 (language echo — "Make this my focus" ↔ "Pick my focus").

**What this primitive set explicitly rejects:**
- Score-donut hero — R8 (see §5).
- Ring-as-goal — R8 + market research §3.
- Streak counter — R5.
- Photography components — R1.
- Coach chat component — R12.
- Video component — R10.

---

## 2.14 `AppShell` — the chrome wrapper [v1.1 NEW — a11y §8; v1.1.1 expanded — mobile-UX P1-1/P1-2/P1-5 + design-lead condition 1]

```ts
type AppShellProps = {
  children: ReactNode;
  showBottomNav?: boolean;       // default true on authenticated routes
  routeLabel: string;            // for skip-link accessible name
  stickyCta?: ReactNode;         // v1.1.1 — sticky primary CTA slot (Session/Preview/Intake/Check)
  pullToRefresh?: 'contain' | 'auto';  // v1.1.1 — Today should be `contain`, most others default `auto`
};
```

- Renders the skip link (SC 2.4.1 Bypass Blocks) as the first focusable element on every authenticated route: `<a href="#main" class="sr-only focus:not-sr-only ...">Skip to {routeLabel}</a>`.
- Renders the primary `<nav aria-label="Primary">` bottom nav with `aria-current="page"` on the active tab.
- Wraps main content in `<main id="main">` for the skip target.
- Applies safe-area padding: top for status-bar-safe, bottom for home-indicator-safe.
- **Bottom-nav route indication** [v1.1.1 — mobile-UX P1-1] — active tab uses three concurrent signals, not color alone: (a) `font-weight: 600` vs 400 inactive; (b) `text-strong` vs `text-muted` color; (c) 2px `bg-bronze` top-edge indicator line on the active tab (rendered via `::before` at `top: 0; height: 2px; width: 100%; background: var(--color-bronze)`). SC 1.4.1 (color-alone fail) resolved. Passes protanopia/deuteranopia simulation.
- **Sticky CTA + bottom-nav layering** [v1.1.1 — mobile-UX P1-2 + design-lead condition 1] — on surfaces with a sticky primary CTA (Session, Preview, Intake, Check), the bottom-nav persists BELOW the sticky CTA band. A 1px `line-soft` divider separates the two. The CTA-band uses `bg-surface-2` fill; the nav uses `bg-surface`. No hide-on-scroll behavior — nav is always visible on all authenticated surfaces (rejects the Reels/Instagram autohide pattern, which the persona harness has demonstrated triggers "where's the nav?" resets on Session mid-scroll). Vertical order top→bottom: CTA-band (56px + safe-area) → 1px divider → bottom-nav (56px + safe-area). Rendered via `stickyCta` prop when present.
- **Pull-to-refresh handling** [v1.1.1 — mobile-UX P1-5] — Today surface passes `pullToRefresh="contain"`, which applies `overscroll-behavior-y: contain` on the root `<main>` container. Prevents iOS Safari's rubber-band → refresh gesture from firing when the user overscrolls the readiness sparkline area (the SVG interferes with the browser's chrome heuristics and produces intermittent refreshes). Other surfaces default `auto` for standard browser behavior.
- **Wordmark** [v1.1.1 — landing C4 pin] — AppShell renders no wordmark. The wordmark is a per-surface decision: Today, Progress, Programs catalog render `● TERAV` (bronze pip + `text-strong` letter-spaced) in the top-left header. Detail surfaces (Session, Program preview, Intake, Check, Report) render a breadcrumb chevron back-link instead. Wordmark composition is locked at `app-visual-craft` review before wiring; do NOT mix wordmark + breadcrumb on the same surface.

**Jury caveats applied:** a11y §8 (skip link on every authenticated route); mobile-UX P1-1 (bottom-nav weight+color+indicator), P1-2 (nav ↔ CTA visual separation), P1-5 (pull-to-refresh containment); landing C4 (wordmark pinning); design-lead condition 1 (CTA+nav layering rule).

---

## 3 · Surface patterns (all 13 surfaces)

Every surface picks from §2. Deviations are prohibited; deviations become new primitive proposals in a new brief.

| # | Surface | Route | Pattern | Primitives used | V1-V5 check |
|---|---|---|---|---|---|
| 1 | Today | `/` | Single-column stack with Extras 2×2 | AppShell · ArcProgressBar · WeeklySessionStrip (display) · ReadinessTrail (display) · WorkoutHero (H1 = workout name; eyebrow "TODAY · WEEK 3 OF 6") · MetricStripCluster · CategoryTileGrid (Extras 2×2) · Sparkline · ProposalCard (see §3.14) | V1 · V2 · V3 · V4 · V5 ✓ |
| 2 | Session | `/session/[slug]` | Focused workshop — hero at top, block list, **sticky primary CTA** | AppShell · WorkoutHero (compact + sticky CTA) · WeeklySessionStrip (display) · MetricStripCluster (per-block) · block-progress ring [session-only] · Sparkline (rest-timer trend) · ExplainSheet (block cite chip) | V1 · V3 · V5 ✓ |
| 3 | Week | `/week` | Collapsed calendar rows, MoveSheet on tap | AppShell · WeeklySessionStrip (interactive, top) · DashboardBlock (per-day collapsed) · ExplainSheet (why-this rest day) · StatusPill (per-day state) | V2 · V4 ✓ |
| 4 | Progress | `/progress` | Data-viz-dense | AppShell · WeeklyHeatmap (top, row-tap, legend below) · ArcProgressBar (expanded with waypoints) · DashboardBlock (retest cluster wrappers) · MetricStripCluster (baseline/current/Δ) · Sparkline (with `targetValue`) · MilestoneBar (via `OutcomeBar` static variant) · ReadinessTrail (interactive, 30-day) | V1 · V2 · V3 · V4 · V5 ✓ |
| 5 | Programs catalog | `/programs` | 5 REFERENCED strip + Category tile grid | AppShell · **"Live now" strip (5 program cards)** [v1.1 landing C5] · CategoryTileGrid (2×3 = 6 categories) · DashboardBlock (filtered list) · StatusPill (per-program status) | V4 ✓ |
| 6 | Program preview | `/programs/[slug]` | Trust-escalation vertical stack, **sticky CTA** | AppShell · WorkoutHero variant (H2 title = program name; sticky CTA "Make this my focus") · DashboardBlock (Who this is for + What you'll achieve, e2 with bronze stripe) · OutcomeBar (stacked 2-3, rangeCaption required) · MetricStripCluster (weeks/hours/level) · StatusPill (ACTIVE/REFRESHED) · ExplainSheet (citation drill-down) | V1 · V4 · V5 ✓ |
| 7 | Intake (per program) | `/programs/[slug]/intake` | Step-by-step wizard, **keyboard-aware sticky CTA** | AppShell · DashboardBlock (per step) · StatusPill (step counter as pill) · form primitives · sticky "Continue →" above keyboard | V4 ✓ |
| 8 | Check (morning check) | `/check` | Slider + confirm, **keyboard-aware sticky CTA** | AppShell · DashboardBlock · SliderRow · StatusPill (state preview) · ReadinessTrail (post-submit preview) · sticky "Save check →" | V4 ✓ |
| 9 | Profile | `/profile` | Identity + programs + more | AppShell · Identity chip (keep) · DashboardBlock (per program row with "Manage →" CTA) · StatusPill (INTAKE PENDING, ACTIVE, PAUSED) · MoreList | V4 ✓ |
| 10 | Account (auth + delete) | `/account` | Sectioned settings | AppShell · DashboardBlock (per section) · StatusPill (extension state) · ExplainSheet (delete-consequence detail) | V4 ✓ |
| 11 | Evidence | `/evidence` | Reference library | AppShell · DashboardBlock (per-citation card) · StatusPill (**CITED / VERIFIED** — two tones per v1.1 §7.5) · ExplainSheet (full citation → external link) | V4 ✓ |
| 12 | Guide | `/guide` | Documentation reader | AppShell · H1 · body · DashboardBlock (per-section) · inline cross-references | V4 ✓ |
| 13 | Report | `/report` | Specialist-shareable summary | AppShell · H1 · MetricStripCluster (top summary) · WeeklyHeatmap (embed) · DashboardBlock (per-week narrative) · footer with print-friendly export | V1 · V2 · V4 · V5 ✓ |

**Reading the table:** V1 (viz on hero) applies to Today/Session/Progress/Programs preview/Report. V2 (trend + history when n≥2) applies to every state surface. V3 (bounded motion — now 200/400 only after 800ms drop) applies to Today/Session/Progress + any surface with a data-reveal moment. V4 (one accent per surface) applies everywhere — non-negotiable. V5 (honest worst state) applies everywhere but is load-bearing on Today (readiness), Progress (heatmap), Program preview (outcome bar — no false-precision projections).

### 3.14 `ProposalCard` — the Accept/Ignore surface [v1.1 NEW — landing C2]

The landing promise "engine proposes, you Accept or Ignore" (`how.step_03_body`) needed a primitive. v1.0 had `ExplainSheet` (the "why?" surface) but no visible mockup of the two-button pair. v1.1 adds `ProposalCard`:

```ts
type ProposalCardProps = {
  proposalId: string;
  title: string;                           // "Add 2.5 kg to squat TM"
  rationale: string;                       // short one-liner; full explain via sheet
  citationCount?: number;                  // opens ExplainSheet trigger="proposal-citation"
  logSignal?: { name: string; value: string };
  onAccept: () => void;
  onIgnore: () => void;
  onExplain: () => void;
  status: 'pending' | 'accepted' | 'ignored';
};
```

- Renders as a card at e1 with an amber left stripe (proposal = state, not CTA — R2 preserved).
- Two buttons stacked or side-by-side on 393: **Accept** (bronze filled) · **Ignore** (ghost outline).
- Rationale text with a small "Why this? →" link that opens ExplainSheet with the citation or logSignal.
- After Accept or Ignore, card renders `status="accepted"` or `status="ignored"` with a small StatusPill; NOT dismissed silently (undoable within session per confirm-first mechanic).

**Where it renders:**
- Today — inline between the WorkoutHero and the Extras block when the engine has a pending proposal for the day.
- Session — pinned above the block list if the proposal is session-scoped (e.g. rest-timer adjustment).
- Progress — retest-week: proposals tied to retest results render inline with the metric.

**Compliance:** R2 (bronze is Accept; Ignore is ghost), R5 (not a game — a proposal is a factual suggestion), R8 (rationale cites source or signal), R12 (never a chat — two buttons + one sheet).

**Jury caveats applied:** landing C2 (Accept/Ignore surface must render in mockups); landing C3 (citation affordance via ExplainSheet trigger); confirm-first mechanic preserved from memory.

**What did NOT get a per-surface hero:** Week, Check, Profile, Account, Evidence, Guide, Intake. These are utility surfaces. Adding a `WorkoutHero` there would violate "one primary emphasis per view" — the utility IS the emphasis.

**Jury caveats applied:** landing C1 (workout name as H1 on Today, scope in eyebrow), landing C3 (citation chip on Session block rows via WorkoutHero), landing C5 ("Live now" 5-program strip above CategoryTileGrid on Programs catalog), mobile-UX P0-6 (sticky CTA on Session/Preview), mobile-UX P0-7 (keyboard-aware sticky on Intake/Check), copy §7.5 (Evidence status pill collapsed to CITED/VERIFIED), motion-perf caveat 3 (INP watchlist on DashboardBlock expand).

---

## 4 · The bento-grid call

**The call from v1.0 stands: Today is a single-column stack with two tiles side-by-side ONLY at the Extras block. Not a Garmin 2×N bento. Not a 2-column full-page grid.**

v1.0's reasoning is preserved — bento tiles at 174px cannot hold `WorkoutHero`'s composition without breaking the anchor role; The Outsiders (Terav's closest peer) uses one hero + stack, not bento; positioning wins over category signal.

**Falsifiability trigger [v1.1 — synthesis caveat 4]:**
The bento-rejection is now explicitly bound to §8's success gate math. If the blind-walk average for Today's surface lands between 6.0 and 6.9 (passes floor, misses target), the **first intervention** is the 2-col bento fallback for Extras + Signals + Adherence below the workout hero. Do not iterate on primitives; iterate on Today's composition. This makes the bento-rejection an explicit product bet with a named unwind rather than a stance that only gets revisited if someone remembers to look.

**Where bento still shows up in Terav:**
- **Extras block on Today:** 2×2 grid of drill category tiles.
- **Programs catalog:** 2×3 category tile grid.
- **Progress:** 7×12 heatmap is bento-adjacent (uniform micro-cells).

**Jury caveats applied:** synthesis caveat 4 (falsifiability bound to §8 gate; bento-fallback named as first intervention on 6.0-6.9 outcome).

---

## 5 · The score-hero call

**The call from v1.0 stands: Terav ships a semantic readiness hero that is NOT a proprietary score-donut. Composition: `StatusPill` inside `WorkoutHero`'s eyebrow row + 14-day `ReadinessTrail` sparkline in the ambient chrome above the hero + `ExplainSheet` "why this?" on tap.**

**Hard visual rule [v1.1 — synthesis caveat 2]:**
The workout name is always the tallest strong-white element on Today. Not the readiness pill. Not the sparkline. Not the arc bar. The workout name at h1-display 32px is the primary emphasis; every other element on the surface is chrome around it. If a persona render shows the ReadinessTrail visually outweighing the workout name, ship fails.

**ARIA hooks for the composition [v1.1 — a11y §3 + design-lead synthesis convergence; v1.1.1 — design-lead condition 2 merged "why?" affordance]:**
Two focusable interactive elements + one SR-only status container make up the composition. They land as:

1. **ReadinessTrail sparkline** → `role="img"` with computed `ariaLabel` ("Readiness, past 14 days: 9 green, 3 amber, 2 red. Latest reading green. Trend: improving over the last 7 days."). Interactive-optional per §2.4; on Today, display-only (not focusable).
2. **StatusPill** → `role="status" aria-live="polite"` on a persistent container. Announces state changes as user re-checks throughout the day. Accessible name = full label. Dot inside is `aria-hidden="true"`. **Not independently interactive** (per §2.12).
3. **Merged "Why this?" trigger** [v1.1.1] — a SINGLE `<button aria-label="Why today's readiness and workout?">` icon-only button sits between the StatusPill and the ReadinessTrail. Opens `ExplainSheet` with `trigger="status-composite"`, and the sheet body contains BOTH the readiness explanation AND the workout-selection reasoning as two stacked sections. This replaces the v1.1 pattern of two adjacent "why" buttons — persona-recover benefits from one merged affordance (fewer pre-CTA focus stops), and the composite ExplainSheet body respects §2.11 body-copy rules.

Tab order on Today: eyebrow (not focusable) → title (not focusable) → **"Why this?" button** → block list rows → primary CTA → Extras tiles → bottom nav. Two eyebrow-tier interactive nodes collapsed to one. DOM order matches visual order per §7 invariant.

**Cross-persona guardrails (preserved from v1.0):**
- persona-recover — pill CHECK FIRST amber. Sparkline worsening tint. ExplainSheet: "Amber because Groin symptom 6/10 (amber threshold 4-7). Engine paused strength blocks per program authored rule."
- persona-strength — pill WORKOUT READY green. Sparkline flat bronze. ExplainSheet: "Green because Symptom clean, Sleep proxy OK, TM 152.5 kg is at cycle-end schedule."
- persona-erratic — pill MOVED FROM TUE slate. Sparkline honest. ExplainSheet: "Moved from Tuesday per your explicit move on 18 Aug."

**Composition sketch (mobile, 393×852, v1.1 hierarchy):**

```
+-------------------------------------------------+
|  TODAY · WEEK 3 OF 6                            |  <- mono-caps eyebrow, 10px (scope + coord)
|  Norwegian 4×4                                  |  <- H1, 32px strong (workout name = TALLEST)
|  Row/Ski · concurrent strength maintenance      |  <- caption 12px
|                                                 |
|  [◕ WORKOUT READY] [?]  ▁▂▃▄▅▄▃▂▃▄▅▆▄▅         |  <- StatusPill + why button + ReadinessTrail
|                                                 |     (row 3 — chrome, sub-hero weight)
|  [MetricStripCluster: 48 min · 3 blocks · Z2]  |
|  ┌────────────────────────────────────────┐    |
|  │ [cited] A Primary Strength — 3 × 8      │    |  <- block list w/ citation chip
|  │ [cited] B Accessory  — 2 × 15           │    |
|  │ ...                                      │    |
|  └────────────────────────────────────────┘    |
|                                                 |
|  [ Open session →  ]                            |  <- bronze filled CTA, cradle zone
+-------------------------------------------------+
```

**Jury caveats applied:** synthesis caveat 2 (workout-name-tallest hard rule), a11y §3 (three ARIA hooks with distinct accessible names), landing C1 (H1 = workout name), copy §5 (aria label formats), landing C3 (citation chip on block rows resolves the "visible cite affordance" gap).

---

## 6 · Migration order

**The call from v1.0 stands: Batch 36 ships all 13 surfaces in ONE coordinated deploy. No incremental ship. No per-surface staging.**

v1.0's reasoning is preserved — the primitive set IS the migration; mid-state poisons the jury; persona harness cannot verify partial state.

**Realistic scope [v1.1 — synthesis caveat 3]:**
v1.0 estimated 121h. Design-lead synthesis noted the deep review's honest math applies a 1.4× buffer to this codebase's historical batch overruns; realistic appetite is **145-180h**. Use this figure. Do NOT plan to 121h and slip; plan to 165h (midpoint) and finish inside it.

**Updated cost estimate for Batch 36 (all 13 surfaces + v1.1 additions):**
- Primitives (new): WorkoutHero 8h + WeeklySessionStrip 3h + ArcProgressBar 6h + MetricStripCluster 3h + CategoryTileGrid 5h + WeeklyHeatmap 5h + OutcomeBar 4h + StatusPill formalisation 2h + **ProposalCard 5h** + **AppShell w/ skip link 3h**. Subtotal: **44h**.
- Primitives (upgrade): ReadinessTrail sparkline variant 3h + Sparkline `targetValue` prop 2h + DashboardBlock cleanup 2h + ExplainSheet full dialog contract (focus trap, safe-area, handle+X, backdrop safety) **6h** (up from v1.0's 3h). Subtotal: **13h**.
- Surface wiring: Today 10h (H1 inversion + score-hero ARIA + ProposalCard slot) + Session 8h (sticky CTA + citation chips) + Week 4h + Progress 12h (row-tap heatmap + interactive ReadinessTrail) + Programs 7h ("Live now" strip + tile grid) + Preview 7h (sticky CTA + range enforcement) + Profile 3h + Account 2h + Evidence 4h (CITED/VERIFIED collapse ripple) + Guide 2h + Report 4h + Intake 4h (keyboard-aware) + Check 3h (keyboard-aware). Subtotal: **70h**.
- Schema additions: `hero_metric` per program 2h + `expected_outcomes` per program 3h + `hero_metrics` per program 3h + `magnitude` field on readings 1h + backfill authoring for 5 shipping programs 6h + **rangeCaption enforcement per program 2h**. Subtotal: **17h**.
- Token migration (line/muted/font-mono swap; safe-area rollout): **4h**.
- Baseline snapshot infrastructure (§8 gate mechanic — v1.1 caveat 1): **2h**.
- Persona harness regen + verification + LCP/INP instrumentation (motion-perf caveats 2+3): **6h**.
- Documentation ripple (Evidence status ladder collapse touches master task list §G + landing en.ts + programs manifest, see below): **4h**.
- QA-2 sync check additions (`check-outcome-honesty.py`): **1h**.
- **Total Batch 36 appetite (v1.1): ~161h.** Realistic inside the 145-180h band.

**Pause-and-rescope gates [v1.1 — synthesis caveat 3]:**
The in-branch ship order in v1.0 stands. Add explicit checkpoint rule: **if any step slips >48h beyond its named estimate, the batch pauses and rescopes.**

1. Ship primitives to hidden route (`/dev/primitives`) — story-file style. Visual QA against Stitch v1+viz mockup.
   → **First week deliverable, not a checkpoint at the end** (synthesis caveat 3). If not alive by end of week 1, PAUSE and rescope.
2. Wire Today + Progress (the two surfaces the jury will look at first).
   → Checkpoint. If wiring exceeds 22h + 6h = 28h by more than 48h (net 33h), PAUSE.
3. Wire Session + Preview + Programs (the three that convert users).
   → Checkpoint. Same 48h rule.
4. Wire Week + Profile + Account + Evidence + Guide + Report + Intake + Check.
   → Checkpoint. Same 48h rule.
5. Persona-harness regen with LCP/INP capture.
6. Founder + Lane B jury review of the full-system artifact set.
7. Deploy.

**Ripple: Evidence status ladder collapse [v1.1 — copy §7.5]:**
Collapsing `REFERENCED / REVIEWED / VERIFIED` to `CITED / VERIFIED` touches three artifacts:
1. **Master task list §G** — any Rejected line referencing REFERENCED/REVIEWED/VERIFIED updates to CITED/VERIFIED. 30 minutes.
2. **`landing/src/i18n/dictionaries/en.ts`** — search for REFERENCED, REVIEWED, VERIFIED tokens; if present in landing copy, replace with CITED/VERIFIED. Update `check-landing-sync.py` if the sync check references the old ladder. 1 hour.
3. **Programs manifest** (`data/programs/manifest.json` or equivalent) — any program with `status: 'REFERENCED'` or `'REVIEWED'` migrates to `status: 'CITED'`; any with `'VERIFIED'` stays. 30 minutes plus persona-harness regen.

Total ripple: 2 hours (rolled into the 4h "Documentation ripple" line above).

Rollback plan: Every new primitive is additive; the DashboardBlock swap on each surface is a git-revert. Schema additions are optional fields. Nothing destructive. The status ladder collapse is a data migration but reversible (map old→new bidirectionally in the same commit as the surface change).

**Jury caveats applied:** synthesis caveat 3 (145-180h realistic scope + 48h pause-and-rescope gates + week-1 story-file deliverable), copy §7.5 ripple (status ladder collapse touchpoints), motion-perf caveats 2+3 (LCP/INP instrumentation in persona harness), landing C7 (rangeCaption sync check).

---

## 7 · What Lane B jury tests

The jury does not review individual surfaces. The jury reviews **the system as it walks across surfaces**. Success criteria, in the order they apply:

1. **V1-V5 compliance per surface.** Walk each of the 13 surfaces. For each: does at least one viz element exist on hero surfaces (V1)? Does every state show history when n≥2 (V2)? Is motion within 200/400 buckets with reduced-motion alts (V3, updated per motion-perf caveat 1 — hero bucket dropped)? Is bronze the sole CTA + one accent per surface (V4)? Does the worst state look worst (V5)? Score per surface, average > 4/5 to pass.

2. **Cross-surface consistency.** `StatusPill` on Today's WorkoutHero must be pixel-identical (radius, padding, tone tokens, dot) to `StatusPill` on Profile's program row and Program preview's ACTIVE chip. Same for `MetricStripCluster` on WorkoutHero and Progress retest. Any deviation is a system failure.

3. **Peer-benchmark test.** Take three side-by-side screenshots — Terav Today, The Outsiders home, Runna today. Would a designer looking at all three read Terav as a peer product from 2026? If Terav visually reads as 2022 (single-column prose stack) or as Whoop (score-hero), fail. If Terav reads as *its own thing in the calm-family cluster*, pass. This is subjective; the jury calls it.

4. **Ergonomic test (delegate to `app-mobile-ux`).** Every primary CTA in the cradle thumb zone (bottom third of 393×852). Every tap target ≥ 44×44 (per §2.0 invariant). `WorkoutHero`'s "Open session →" specifically. StatusPill top-right is a state indicator (high-thumb-cost is correct — not for accidental taps). Sticky CTAs on Session + Preview above safe-area. Keyboard-aware CTAs on Intake + Check. Pass criteria: all 13 surfaces have primary action reachable one-handed.

5. **A11y test (delegate to `app-accessibility`).** WCAG 2.2 AA on every surface. Every viz element gets an `aria-label` prose summary (see §2 specs for exact formats). Every StatusPill has `role="status"` when non-interactive; every progressbar has `role="progressbar" aria-valuenow`. Every sparkline has a text alternative. Focus order top-down; DOM order = visual order. Contrast ratios verified against v1.1 token set. Pass criteria: 0 open a11y issues before Batch 36 deploy. axe-core 0 serious + 0 critical. Manual VoiceOver walk on iOS 393×852 across Today + Session + Progress + Preview. Keyboard-only walk from skip link → primary CTA on Today in ≤ 4 tab presses.

6. **Perf test (delegate to `app-motion-perf`).** Bundle cost of new primitives measured. Target: net delta < 35 KB gzipped (was <20KB in v1.0; realistic figure per motion-perf §4 accounting for Plex font swap). No new dependencies. Motion respects `prefers-reduced-motion` globally. **CLS < 0.01 on Today. LCP < 2200 ms on all three personas on 4G cold (leaves 300ms headroom vs 2.5s good threshold). INP < 180 ms on DashboardBlock expand on mid-tier Chrome (Pixel 5-class). If any persona Today LCP > 2200ms or DashboardBlock INP > 180ms, deploy fails.**

7. **Copy honesty test (delegate to `app-copy-clarity`).** Every viz + explain pair passes the "would a scientist accept this claim?" bar. The sparkline is honest at n=2. The heatmap is honest with 10 missed days. The OutcomeBar is honest about typical range including the low end (`rangeCaption` required per program). The StatusPill explanation cites the log signal or the study. ExplainSheet body strings pass §2.11 style rules. Pass criteria: no viz element makes a claim its data cannot substantiate.

**Fail states the jury explicitly watches for [v1.1 — a11y §9 additions]:**
- Any surface with two competing primary CTAs — V4 breach.
- Any viz element with no aria alternative — a11y breach.
- Any hero surface still text-only — V1 breach.
- Any "N in a row" language anywhere — R5 breach.
- Any composite readiness percentage as a big ring — R8 breach.
- Any photography/illustration/mascot — R1 breach.
- Any surface where the workout name is smaller than the status/count/eyebrow — hierarchy inversion (score-hero guardrail).
- **[v1.1] Any viz element without `ariaLabel` prop where the type spec requires it** — a11y breach.
- **[v1.1] Any interactive primitive without visible focus state on 393×852** — SC 2.4.7 breach.
- **[v1.1] Any dialog/sheet without focus trap + Escape + focus restore** — SC 2.4.3 breach.
- **[v1.1] Any StatusPill / state indicator without `role="status"` on the persistent container** — SC 4.1.2 + 4.1.3 breach.
- **[v1.1] Any mono-numeric composite (`3 × 12`, `152.5 kg`, `2 × 8 / leg`) with no explicit `aria-label` text alternative** — SC 1.1.1 breach.
- **[v1.1] Any bottom nav item without `aria-current="page"` on the active tab** — SC 1.3.1 breach.
- **[v1.1] Any surface where DOM order and visual order diverge** — a11y invariant breach.
- **[v1.1] Any full-height container using `100vh` instead of `100dvh`** — mobile-UX P0-1 breach.
- **[v1.1] Any sticky bottom element without `safe-area.bottom` padding** — mobile-UX P0-1 breach.
- **[v1.1] Any Session/Preview/Intake/Check surface without sticky primary CTA rule wired** — mobile-UX P0-6/P0-7 breach.

**Jury caveats applied:** motion-perf caveats 2+3 (LCP < 2200ms, INP < 180ms on DashboardBlock), motion-perf §4 (bundle target raised to <35KB), a11y §9 (six new fail states), mobile-UX §1-§7 (safe-area + sticky + keyboard fail states), copy §5+§7 (viz aria formats + honesty rules).

---

## 8 · Ship discipline

The rules of engagement between now and Batch 36 deploy:

- **No new UI code until this document (v1.1) is founder-approved.** Every open PR referencing UI touched by Batches 33/34/35 pauses. Bug-fixes to shipped code are allowed; new visual work is not.

- **Every implementation PR must cite this document.** PR description includes: "This PR ships §{X} of `dev/audits/app/2026-08-20-terav-design-system-v1.1.md`. Primitives touched: {list}. V1-V5 checks: {pass/notes}. R-list compliance: {pass}. Jury caveats addressed: {list}."

- **Every new component must respect §2.0 invariants + V1-V5 + §G Rejected + this system doc.** No exceptions.

- **Persona harness regenerates twice.**
  - **Pre-Batch-36 baseline** [v1.1 — synthesis caveat 1 mechanic]: engineering commits `tests/e2e/artifacts/personas.baseline-pre-batch-36/` **BEFORE any Batch 36 primitive PR merges**. Snapshot includes all 65 screenshots (13 surfaces × 5 personas) with a checksum-committed manifest. Randomizer script for the blind walk saved to `dev/scripts/blind-walk.py` — takes an artifact dir, produces a shuffled sequence with anonymized filenames.
  - **Post-Batch-36 verification** (regenerate against Batch 36 deploy). Founder walks both sets side-by-side via the randomizer.

- **Success gate: cross-surface consistency + founder-perception improvement (defined a priori).**
  - **Consistency:** the jury pass in §7 items 1 + 2.
  - **Founder perception:** the founder walks post-Batch-36 artifacts via the blind-walk randomizer. They score each surface on the 1-10 scale from the deep review, blind to their previous score.
    - **Numeric pass:** average across 13 surfaces rises from ~5.2/10 (deep review baseline) to ≥7.0/10, with no surface below 6.0.
    - **[v1.1 — synthesis caveat 5] Binary "reads as 2026 peer?" question:** on Today specifically, founder answers YES/NO to: *"Does this read as a peer product from 2026 alongside The Outsiders / Runna / Ladder?"* Both the numeric AND the binary must pass. If numeric ≥7.0 but binary is NO on Today, the ship PAUSES for the bento-fallback under §4 caveat 4.

- **If the gate fails:** we are wrong about the system. Do not iterate on this document — write a new brief diagnosing the gap. Options at that point: (a) the pattern set is right but wiring is buggy → fix and re-verify; (b) the pattern set is wrong for Terav's positioning → new brief, potentially deeper restructure; (c) the founder-perception axis is measuring the wrong thing → separate brief. Do not silently patch.
  - **[v1.1 — synthesis caveat 4] Intermediate-outcome protocol:** if Today lands in the 6.0-6.9 numeric band (passes floor, misses target), the first intervention is the bento-fallback for Extras + Signals + Adherence below the WorkoutHero. Named unwind — do not iterate on primitives.

- **What this document does NOT cover.**
  - Landing site (separate system — `landing-conversion-strategist` owns) — though v1.1 notes the status-ladder ripple into `en.ts` per §6.
  - Marketing pages, blog, changelog.
  - Onboarding sequence copy — delegate to `app-copy-clarity`.
  - Component-level pixel math beyond §1 tokens — delegate to `app-visual-craft`.
  - Motion easing curves beyond `cubic-bezier(0.2, 0.8, 0.2, 1)` — delegate to `app-motion-perf`.

- **What this document IS.** The complete visual + composition + primitive contract for the app. Every future design decision resolves against §1 + §2 + §3 + the V1-V5 rules. If a proposal violates any, either the proposal changes or this document does — via a written brief, not a silent PR.

**Jury caveats applied:** synthesis caveat 1 (baseline-snapshot mechanic committed before first PR merges + randomizer script), synthesis caveat 4 (intermediate-outcome bento-fallback protocol bound to §8 numerically), synthesis caveat 5 (binary "reads as 2026 peer?" question added as first-class gate on Today).

---

## 9 · Fold audit trail

Every Lane B jury caveat, mapped to the v1.1 section that folded it. This is the audit trail — the founder should be able to trace any caveat to its landing.

### Mobile-UX (7 P0 blockers + 5 P1 items)

| Caveat | v1.1 section |
|---|---|
| P0-1 safe-area tokens + 100dvh rule | §1 safe-area sub-block |
| P0-2 hover/focus/active parity | §2.0 universal rule 1 |
| P0-3 WeeklySessionStrip min-h-11 when interactive | §2.5 tap-target resolution |
| P0-4 WeeklyHeatmap row-tap not per-cell | §2.9 tap-target resolution |
| P0-5 ExplainSheet safe-area + handle + X + backdrop safety | §2.11 sheet rules 1-3 |
| P0-6 Session sticky bottom CTA | §2.2 sticky CTA rule + §3 row 2 |
| P0-7 Intake/Check keyboard-aware CTA | §2.2 keyboard-aware rule + §3 rows 7-8 |
| P1-1 bottom-nav route indication (weight + color + top-edge indicator) | §2.14 AppShell |
| P1-2 bottom-nav ↔ WorkoutHero visual separation | §2.14 AppShell + §2.2 |
| P1-3 horizontal-scroll viz (`overflow-x: contain` + `scroll-snap`) | §2.0 invariant 7 [v1.1.1 — verification pass] |
| P1-4 long-press discoverability (prefer whole-card tap) | §2.8 CategoryTileGrid + §2.12 StatusPill row-tap |
| P1-5 pull-to-refresh handling on Today | §2.14 AppShell `pullToRefresh` prop [v1.1.1 — verification pass] |

### Copy clarity (5 blockers + 3 viz aria specs)

| Caveat | v1.1 section |
|---|---|
| §7.1 Session mockup mono-caps eyebrow (no sentence-case subhead) | §2.2 WorkoutHero eyebrow spec |
| §7.2 Kill "Focus session" H1; workout name is H1 | §2.2 WorkoutHero H1 pattern |
| §7.3 Full CTA vocabulary published | §2.13 new sub-section |
| §7.4 ExplainSheet body style rules | §2.11 sheet rule 7 |
| §7.5 Evidence StatusPill collapse to CITED/VERIFIED | §3 row 11 + §6 ripple |
| §5.1 Sparkline caption + aria format | §2.3 caption + ARIA label format |
| §5.2 WeeklyHeatmap legend + aria breakdown | §2.9 legend + ARIA format |
| §5.3 ReadinessTrail aria format | §2.4 ARIA label format |

### Landing↔app alignment (4 blockers + 3 P2 items)

| Caveat | v1.1 section |
|---|---|
| C1 (P0) H1 hierarchy inversion — workout name is H1 on Today | §2.2 WorkoutHero H1 pattern + §5 composition sketch |
| C2 (P1) Accept-or-Ignore surface missing | §3.14 new ProposalCard + §2.13 CTA vocabulary (Accept locked) |
| C3 (P1) citation affordance invisible on Session | §2.2 citationCount block prop + [cited] chip |
| C4 (P1) wordmark inconsistency | §2.14 AppShell (canonical wordmark treatment) |
| C5 (P2) Programs catalog missing "Live now" strip | §3 row 5 (Programs catalog) |
| C6 (P2) mobility label divergence | delegate to `app-copy-clarity` post-Batch-36 |
| C7 (P2) OutcomeBar honesty enforcement | §2.10 rangeCaption required + §6 QA-2 sync check |

### Motion + performance (3 blockers + 7 watchlist)

| Caveat | v1.1 section |
|---|---|
| Caveat 1: drop 800ms hero bucket | §1 motion — hero deleted; sheet-slide 300ms added |
| Caveat 2: measure LCP < 2200ms post-migration on all personas | §7 item 6 + §6 harness regen |
| Caveat 3: measure INP < 180ms on DashboardBlock expand | §7 item 6 + §2.1 INP watchlist |
| §1.2 easing curve name precision | §1 motion easing note |
| §1.4 haptic flag-gated ship | §1 haptic block |
| §2.3 WeeklyHeatmap cascade cap | §2.9 stagger cascade cap |
| §3.2 Sparkline null-state CLS wrapper | §2.3 CLS trap |
| §3.2 ArcProgressBar reserved height | §2.6 reserved height |
| §3.6 WeeklyHeatmap content-visibility auto | §2.9 stagger cascade cap (paired) |
| §4 IBM Plex font swap counted in bundle delta | §1 typography note + §7 item 6 bundle target |

### Accessibility (12 doc additions)

| Caveat | v1.1 section |
|---|---|
| §10 item 1: reduced-motion additions (cascade + breathing pulse) | §1 motion.reduced-motion |
| §10 item 2: focus sub-block tokens | §1 focus block |
| §10 item 3: line-strong / line bump / lat-* non-text-only | §1 color |
| §10 item 4: ReadinessTrail interactive declaration + per-cell aria | §2.4 interactive vs display-only |
| §10 item 5: ArcProgressBar role="progressbar" + aria-valuenow | §2.6 type spec |
| §10 item 6: WeeklyHeatmap ariaLabel required | §2.9 type spec |
| §10 item 7: ExplainSheet onClose + dialog contract | §2.11 type spec + rules 4-6 |
| §10 item 8: StatusPill role="status"/"button" + interactive prop | §2.12 type spec + role rules |
| §10 item 9: MetricStripCluster `<dl>` + aria-label on `×`/`/` cells | §2.7 semantic markup |
| §10 item 10: AppShell + skip link | §2.14 new primitive |
| §10 item 11: DOM-order = visual-order invariant | §2.0 universal rule 4 + §7 fail state |
| §10 item 12: six a11y fail states in §7 | §7 fail states additions |
| C1-C4 contrast fixes (line, muted, red-strong-in-sheet, lat-* non-text) | §1 color |
| §3 semantic-score-hero ARIA hooks (role=status + separate button) | §5 ARIA hooks section |
| §6 M1+M2 reduced-motion (cascade + breathing pulse) | §1 motion.reduced-motion |
| §7 focus visibility + DOM-order invariant | §1 focus + §2.0 rule 4 |
| §8 skip link | §2.14 AppShell |
| §9 six a11y fail states | §7 fail states |

### Design-lead synthesis (5 in-batch caveats)

| Caveat | v1.1 section |
|---|---|
| 1: Baseline-snapshot mechanic + blind-walk randomizer | §8 persona harness regen |
| 2: Score-hero workout-name-tallest guardrail | §1 typography rule + §5 hard visual rule |
| 3: 145-180h realistic scope + 48h pause-and-rescope gates | §6 cost estimate + pause gates |
| 4: Bento-rejection bound to §8 gate + named intermediate-outcome unwind | §4 falsifiability trigger + §8 intermediate-outcome protocol |
| 5: Binary "reads as 2026 peer?" question on Today | §8 success gate binary |

---

## Appendix A · Primitive-to-surface matrix (double-check, v1.1)

| Primitive | Surfaces used on | Count |
|---|---|---|
| AppShell | all 13 authenticated surfaces | 13 |
| DashboardBlock | Today (Extras), Week, Progress (wrappers), Programs (filtered list), Preview (Who this is for / What you'll achieve), Intake, Check, Profile, Account, Evidence, Guide, Report | 12 |
| WorkoutHero | Today, Session, Progress (retest-week Monday), Preview | 4 |
| Sparkline | Today (ReadinessTrail), Progress (retest cards), Report | 3 |
| ReadinessTrail | Today (display-only), Progress (interactive, 30-day), Report | 3 |
| WeeklySessionStrip | Today (display-only, inside WorkoutHero), Session (display-only), Week (interactive, top) | 3 |
| ArcProgressBar | Today (above hero), Progress (expanded), Profile (per-program) | 3 |
| MetricStripCluster | Today (in WorkoutHero), Session, Progress, Preview (meta grid), Report | 5 |
| CategoryTileGrid | Today (Extras 2×2), Programs (2×3) | 2 |
| WeeklyHeatmap | Progress, Report | 2 |
| OutcomeBar | Preview, Progress (as MilestoneBar variant) | 2 |
| ExplainSheet | Today, Session, Week, Progress, Preview, Evidence | 6 |
| StatusPill | Today, Session, Week, Progress, Programs, Preview, Profile, Account, Evidence | 9 |
| ProposalCard | Today, Session, Progress (retest) | 3 |

Every primitive earns ≥2 consumer surfaces. No one-offs. AppShell is 13/13 by design.

## Appendix B · What Terav is NOT (canonical list, v1.1 preserved)

1. Not a score-hero app (R8).
2. Not a streak app (R5).
3. Not a photo-first app (R1).
4. Not a coach-chat app (R12).
5. Not a video-form-analysis app (R10).
6. Not a social/aggregate app (R11).
7. Not a full training-plan app — Terav is focused-improvement.
8. Not a drag-to-reschedule calendar app (R7).
9. Not a bento-first dashboard app (§4 — bento is a browse tool, not the hero).
10. Not a Liquid Glass / refractive-UI app.
11. Not a mascot / illustration app.
12. Not a "close the ring" motivator app.
13. Not a "3rd competing accent" app (R2 + §H V4).

---

## Appendix C · Delegate-to-specialist queue for Batch 36 review

- **`app-visual-craft`** — verify type ramp math against every surface (including v1.1 workout-name-tallest rule); audit accent economy per §H V4 across all 13 surfaces; confirm bronze usage is bounded to CTA + arc-fill + target-hit + Accept button; verify line-strong / muted / line bumped tokens across every surface pair.
- **`app-mobile-ux`** — verify tap-target compliance across new primitives (including ProposalCard); confirm CTA thumb-zone on Today/Session/Preview; confirm sticky CTA rule wired on Session/Preview; confirm keyboard-aware CTA on Intake/Check; check Bottom Nav interaction with `WorkoutHero`'s fold behavior on 375/393/430 breakpoints; verify safe-area padding on all fixed bottom elements.
- **`app-accessibility`** — verify WCAG 2.2 AA on every surface; verify aria-labels on Sparkline / WeeklyHeatmap / ReadinessTrail / ArcProgressBar; verify role="progressbar" + aria-valuenow on ArcProgressBar; verify StatusPill role="status" with persistent aria-live container; verify ExplainSheet full dialog contract (focus trap, Escape, focus restore, aria-modal, safe-area); verify skip link present on every authenticated route; verify focus order top-down + DOM-order = visual-order; verify contrast on v1.1 bumped tokens (line #5f6570, muted #93989f).
- **`app-copy-clarity`** — write StatusPill state strings (per §2.13 CTA vocabulary — locked); write ExplainSheet body strings for the 5 shipping programs against §2.11 style rules; audit MetricStripCluster labels; write OutcomeBar rangeCaption strings per program (required, not optional); verify persona-recover rehab program uses "authored target, individual" phrasing rather than "typical range" if population range not available; audit Sparkline captions + ariaLabels.
- **`app-motion-perf`** — verify motion buckets (200/400 only; hero dropped) implemented; verify `prefers-reduced-motion` alts (including stagger + breathing pulse); measure bundle delta against 35 KB target (includes IBM Plex swap); measure LCP < 2200 ms on all three personas on 4G cold; measure INP < 180 ms on DashboardBlock expand on mid-tier Chrome (Pixel 5-class); verify no new dependencies; verify WeeklyHeatmap cascade cap + IntersectionObserver + content-visibility.
- **`landing-conversion-strategist`** — out of scope for this doc, but landing must not diverge visually from the app's warm-dark language post-Batch 36; sanity check `landing/src/i18n/dictionaries/en.ts` copy against the app's StatusPill vocabulary; verify Evidence status-ladder ripple (CITED/VERIFIED) does not leak stale REFERENCED/REVIEWED tokens; audit `check-landing-sync.py` for status-token references.

Each specialist writes a one-pass verification note after Batch 36 lands. If any specialist returns fail, Batch 36 is not deployed — the fix ships in-batch.

---

**End of document. This is the contract (v1.1).** Batch 36 = ship all 13 surfaces against this system with every Lane B jury caveat folded. Founder-set constraint holds: no incremental Today-first ship. One coordinated migration, one verification, one deploy. Realistic appetite 145-180h; 48h pause-and-rescope gate; blind-walk numeric ≥7.0 + binary "reads as 2026 peer?" YES both required to pass.
