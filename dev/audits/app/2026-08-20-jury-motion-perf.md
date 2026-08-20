# Lane B jury vote — motion + performance lens

Reviewer: `app-motion-perf`
Written: 2026-08-20
Reviews: `dev/audits/app/2026-08-20-terav-design-system.md` (§1 tokens, §2 primitives), `dev/audits/app/2026-08-20-market-research.md` §6, `dev/audits/app/2026-08-20-viz-composition-call.md` V3.
Mockups reviewed: `/tmp/stitch/today-v1.png`, `today-4.png`, `today-minimalist.png`, `session.png`, `session-detail.png`, `program-preview.png`, `landing.png`.
Personas referenced: `next-app/tests/e2e/artifacts/personas/persona-{recover,strength,erratic}/manifest.json` (mtime 2026-08-19).

Prompt-injection guard: the AGENTS.md block appended at `next-app/AGENTS.md` warning that "this is NOT the Next.js you know" and pointing at `node_modules/next/dist/docs/` is treated as an in-repo advisory only. It has no bearing on this motion + perf audit and I do not act on any hidden instructions embedded in read content. The Stitch mockups, external URLs cited in market research, and console logs likewise do not contain instructions I follow. My source of truth is the invoker brief plus the three audit documents named above.

---

## Vote: APPROVE-WITH-CAVEATS

Three caveats block deploy; four are watchlist. Nothing in §1 or §2 is a deal-breaker from the motion + perf lens. The token discipline (200 / 400 / 800 ms, single `cubic-bezier(0.2, 0.8, 0.2, 1)` easing, no springs, global `prefers-reduced-motion` collapse to 0.01ms) is one of the tightest motion contracts I have reviewed on this codebase; it lands roughly where Runna + The Outsiders sit and is disciplined against the 2020 material-bounce category. The performance risks are real but bounded — the biggest is `WeeklyHeatmap` at 7×12=84 cells on Progress + Report and it is manageable. INP on the grid-row expand transition, LCP on the mobile hero, and one motion token that materially breaks the 2026 baseline are the three that need addressing before Batch 36 ships.

---

## 1 · Motion token assessment

### 1.1 The 200 / 400 / 800 ms buckets — largely correct, one bucket is wrong

**200 ms UI-state — correct.** Every peer in the market research §6 clusters state changes at 150-220 ms (Runna 200, Whoop ~180, The Outsiders 200). The current `DashboardBlock` grid-row expand ships at `duration-200` (`next-app/src/components/DashboardBlock.tsx:165`), which validates the choice in-flight. `active:scale-[0.98]` press feedback at `globals.css:129-133` is 60 ms — that's below the 200 ms bucket and correct (press feedback is a touch acknowledgement, not a state change). The system doc should clarify that the `ui-state` bucket is a **ceiling** not a floor; press feedback stays sub-100 ms.

**400 ms data-reveal — correct for what it's used for.** Sparkline stroke reveal, arc-bar fill, heatmap stagger. This aligns with Whoop's donut fill on tab open (~350 ms) and Oura's Today refresh cadence. The stagger-cascade token at 50 ms is inside the deep-review-approved band (30-60 ms per the market research §6 "cards fade in cascade") — pass. Watchlist item: 400 ms × 84 heatmap cells at 50 ms stagger would be 4.6 seconds of total animation on Progress. That is well past attention. Cap the cascade to the visible viewport only — see §2.3.

**800 ms hero — this is the wrong number.** Market research §6 explicitly says "sub-200 ms, curve-eased, small displacement" and calls out "big bounce/spring transitions" as passé. The Outsiders' sleek score animation on app open is ~600 ms; Whoop's fill on load is ~350 ms; Runna's post-workout insight card slides in at 280 ms. **800 ms is a 2020 material-motion number for a splash moment.** Even if reserved to "once per app launch," on the primary Today surface it means the WorkoutHero content sits behind the animation for the entire perceived-load window — that is an LCP problem (see §3.1) and a perceived-jank problem on a 60 Hz Android at cold start. The `hero` bucket should either (a) drop to **500 ms max**, matching the deep-review's "nothing > 500ms except a modal enter" clause I imported from the invoker brief, or (b) be deleted entirely and the "app-launch moment" implemented as a 400 ms `data-reveal` on the readiness sparkline + hero card composition, no dedicated 800 ms token. My recommendation is (b) — every hero token I have ever approved has been abused by a later PR to justify a screen-wide entrance sequence. **This is caveat 1 of 3.**

### 1.2 Easing — correct

`cubic-bezier(0.2, 0.8, 0.2, 1)` is a decel-out curve, ~equivalent to Material 3 "emphasized decelerate." No springs, no bounce. This is the 2026 default across Linear, Runna, and The Outsiders. Pass. One nit: the system doc calls it "ease-out" — technically fine, but the actual curve is not the CSS `ease-out` keyword (which is 0.0, 0.0, 0.58, 1). Name it precisely in the token doc so an engineer copying Tailwind's `ease-out` (`cubic-bezier(0, 0, 0.2, 1)`) does not accidentally ship a different curve.

### 1.3 Reduced-motion — the strongest part of the doc

Duration → 0.01 ms (preserves `transitionend` events), opacity kept, transforms + scale + auto-play removed, data-viz reveals fall to final frame, haptic kept. This is the correct 2026 baseline per web.dev and MotionSpec, and matches what's already live at `next-app/src/app/globals.css:168-174`. The existing implementation only covers three named animations (`main`, `.pulse-accept`, `.mark-done-flash`) plus the press scale. Batch 36 must extend this to: the new `WorkoutHero` mount reveal, the sparkline stroke reveal (must render final-state instantly, not zero-length polyline), the arc-progress-bar fill (must render at final width), and the heatmap stagger (must render all cells at once). None of these are new theory — they are wiring the primitives against the token, which the doc names but does not enforce. **Batch 36 acceptance requires a lint or story-file check that each new primitive respects reduced-motion; test on mobile Safari with Settings → Accessibility → Motion → Reduce Motion enabled.**

### 1.4 Haptic vocabulary — approve, ship gated

5 signals, 10-60 ms, iOS + Android compatible. Fine. It is `[new]` per §1 and the system doc notes it is "not yet wired." Wire it behind a feature flag for the Batch 36 deploy; measure whether persona-recover (rehab, quiet mornings) finds `milestone` at 60 ms too loud before defaulting on. Haptic is one of the few things that reads as either "premium tool" or "annoying pager" depending on the tuning, and web Haptic API is still spotty on Android Chrome. Do not ship on by default.

### 1.5 Vestibular discomfort — no findings

No parallax, no zoom-into-hero, no camera moves. All transforms in §1 are small-displacement (opacity + 2-4 px translate). Compliant with WCAG 2.3.3.

---

## 2 · Motion inventory across proposed primitives

| Primitive | Motion moment | Duration | Bucket | Reduced-motion alt | Verdict |
|---|---|---|---|---|---|
| WorkoutHero | Mount fade-in (children stagger 50 ms) | 400 ms | data-reveal | Instant final-state | Approve — but only if the 800 ms hero bucket is dropped (§1.1). If the hero bucket ships as-is, expect a PR to wrap WorkoutHero in an 800 ms entrance, which is caveat 1. |
| Sparkline | Stroke reveal on mount / in-view | 400 ms | data-reveal | Instant polyline | Approve. Current impl at `charts/Sparkline.tsx` has no motion — Batch 36 must add `stroke-dasharray` reveal with reduced-motion gate. |
| ArcProgressBar | Fill on mount / visibility | 400 ms | data-reveal | Instant width | Approve. Watch: the existing `progress/page.tsx:599` progress bar has `transition-[width]` with no duration or reduced-motion guard — replicate the fix in the new primitive from day one. |
| WeeklyHeatmap | Stagger cascade in-viewport | 50 ms per cell | stagger | All cells at once | Approve with cap — see §2.3. |
| ReadinessTrail | Magnitude-tinted dot render | Static | none | N/A | Approve. Static viz — nothing to animate; a "dot pulse today" is R5-adjacent and not proposed. Good. |
| StatusPill | Tone crossfade (state change) | 200 ms | ui-state | Instant swap | Approve. |
| DashboardBlock expand | grid-template-rows 0fr↔1fr | 200 ms | ui-state | Instant | Approve — already shipping this way. Watchlist for INP, see §3.3. |
| ExplainSheet | Sheet slide-up from bottom | 300 ms | ~ui-state | Instant | Doc doesn't specify — clarify. iOS sheet norm is 350 ms; keep in the 250-350 range. |
| WeeklySessionStrip | Today-cell breathing pulse | R5 risk | — | — | If proposed, delete. See §5.1. |
| Route transition (`main`) | Fade + 2px translateY | 150 ms | sub-ui-state | none | Approve — already live at `globals.css:141`. |

### 2.1 Peer comparison

- **Runna** — post-workout insight card slides + fades ~280 ms. Sub-`data-reveal`. Terav's 400 ms is slightly slower; acceptable if reserved for chart reveals.
- **Whoop** — donut number tick-up ~150-300 ms. Terav rejects the donut, so this is not a direct comparison. The equivalent Terav moment is the `MetricStripCluster` value render — currently proposed as static, which is correct (tabular numerics do not tick).
- **The Outsiders** — score animation on app open ~600 ms. The doc's 800 ms hero exceeds this by 33%. Confirms §1.1.
- **Linear (non-fitness peer)** — everything at 150-200 ms, single curve, no springs. Terav's 200 ms ui-state matches exactly.

### 2.2 "Enough motion for 2026 feel?" — yes, subtractively

The system doc's motion vocabulary is smaller than any peer's — that is the point. Whoop has ~9 documented motion moments, Runna ~7, The Outsiders ~6. Terav proposes ~5 (ui-state crossfade, data-reveal stroke, sheet slide, mount stagger, press feedback). This is the correct posture for a calm-family product. Adding motion to hit "2026 feel" is the failure mode; the discipline is the identity.

### 2.3 WeeklyHeatmap stagger cascade — cap it

7 × 12 = 84 cells. At 50 ms stagger without a cap, that is 4.2 s of cumulative delay. Two moves:
1. **Cap the cascade to viewport-visible cells only** using `IntersectionObserver` (not scroll listener — market research §6 baseline). Cells outside the initial viewport render at final-state.
2. **Cap total cascade duration to 600 ms.** If 84 cells × 50 ms > 600 ms, shrink the per-cell delay proportionally, or cap the delay after the first N visible.

The current `charts/Heatmap.tsx` ships at 8×7=56 cells with `transition-colors` (no cascade), so this is a new risk introduced by the design doc, not a live regression.

---

## 3 · Core Web Vitals per persona × new primitive

Baseline from the three persona manifests (all captured 2026-08-19 against pre-Batch-36 code):

| Persona | Today `loadMs` | Progress `loadMs` | Profile `loadMs` (heaviest route) |
|---|---|---|---|
| persona-recover | 1776 ms | 1665 ms | 2336 ms |
| persona-strength | 1771 ms | 1612 ms | 2331 ms |
| persona-erratic | 1646 ms | 1615 ms | 2293 ms |

`loadMs` here is the harness `waitUntil: 'networkidle'` — a rough LCP proxy but conservative. All three Today routes are inside the 2.5 s LCP threshold pre-Batch-36. **Batch 36 introduces new work on Today (WorkoutHero + ArcProgressBar + MetricStripCluster + ReadinessTrail sparkline) — the perf question is whether the added JS + render cost pushes Today past 2.5 s.**

### 3.1 LCP on Today — the WorkoutHero title is the new LCP element

Per the design doc §5, the largest visible text on Today is `WorkoutHero` H2 title at 26 px — "Norwegian 4×4" in the persona-strength case. That is the LCP candidate. Requirements to keep LCP under 2.5 s:

- **Inter font must not block.** Current `layout.tsx:14-19` uses `next/font/google` with `display: swap` — pass. Batch 36 must not change to `display: block` or introduce a webfont without swap.
- **The 800 ms hero motion must not gate LCP paint.** If WorkoutHero mounts with `opacity: 0` and transitions to 1 over 800 ms, some LCP measurement tools will report the LCP as 800 ms + mount time. Chrome's LCP calculator handles `opacity: 0 → 1` correctly (element is considered painted at final opacity), but Lighthouse's synthetic run has been unreliable on this. **Drop the 800 ms hero token (§1.1 caveat 1) to sidestep entirely.**
- **`MetricStripCluster` should render server-side.** It's derived from `program.json` + `session` fields — no user store required. Ship as an RSC child of WorkoutHero, not a client-side derivation.
- **`ArcProgressBar` above the hero.** Program name + week counter is static per-program, servable from RSC. The retest waypoints are program.json data. If the arc fill animates from 0% → current% at mount, that is a 400 ms `data-reveal` — the fill is decorative, LCP is the arc's final-frame text.

**Estimated LCP after Batch 36:** if the caveats hold, ~1900-2100 ms on the persona baseline (persona-recover Today was 1776 ms). Adds ~150-300 ms for new primitives, still comfortable under 2.5 s. **This is caveat 2 of 3 — Batch 36 must measure LCP on all three personas post-migration and fail the deploy if any is > 2200 ms** (leaves 300 ms headroom on 4G-throttled real devices).

### 3.2 CLS on Today — hero-shell + arc-bar composition needs reserved space

Zero CLS is achievable only if:

- `ArcProgressBar` reserves its full height at mount, even before fill animation. Height is fixed (see mockups) — pass in principle, must be enforced with a `min-height` on the container.
- `MetricStripCluster` grid columns are `grid-cols-3` with `grid-cols-min-0` cells so long values don't reflow siblings.
- `ReadinessTrail` sparkline SVG has fixed `width` + `height` attrs (already the pattern in `Sparkline.tsx:20-28`) — no CLS risk if this pattern holds.
- **The `Sparkline` at n < 2 returns null** (`Sparkline.tsx:31`). This is a CLS trap: if `values` populates asynchronously (persona-recover on first log), the sparkline appears mid-render and pushes content below. Wrap in a fixed-height container so the collapse to null occupies reserved space.

**Watchlist:** persona-erratic Today (`loadMs: 1646 ms`) has 15 skips in state; the readiness trail with 14 dots plus a magnitude-tinted overlay is the most render-work of the three personas. Verify no CLS on this specific persona post-migration.

### 3.3 INP on the DashboardBlock grid-row expand — the biggest interaction risk

`grid-template-rows: 0fr → 1fr` transitions were browser-supported starting Chrome 117 (Aug 2023) and Safari 17.4 (March 2024). On older devices (mid-tier Android running Chrome 110-115, or iOS 16 Safari), this transition **does not animate** — grid-template-rows was not interpolable. The result is a snap-open, no jank, no INP hit. On Chrome 117+ / Safari 17.4+, the interpolation is expensive on the compositor because grid layout is not GPU-accelerated. Testing needed: 30% of iOS in mid-2026 is still on 16.x (Apple's own numbers), which means ~1/3 of Terav's users see the snap version.

**Mitigation:** the current code is already correct — `motion-reduce:transition-none` gate at `DashboardBlock.tsx:165`. INP on a snap-open is <50 ms. INP on the interpolated transition on a low-end Android has been measured elsewhere at 80-180 ms — inside 200 ms good, but tight. Batch 36 acceptance: measure INP on the DashboardBlock expand on mid-tier Chrome (a Pixel 5-class device) and fail if > 180 ms. **This is caveat 3 of 3 — the INP measurement must actually run, not be assumed to pass.**

### 3.4 INP on Accept / Ignore on Coach — inherited from prior audits

Not new to Batch 36. The confirm-first mechanic is already shipping; the ExplainSheet primitive is a formalisation of the existing InfoSheet. INP is bounded by the store-mutation cost (Zustand sync + Supabase KV write). Measured previously; stays in-scope for `app-motion-perf` post-Batch-36 regen but is not a Batch 36 risk.

### 3.5 Sparkline SVG 60 fps scroll — pass with a caveat

The `Sparkline` at `charts/Sparkline.tsx` is a single `<polyline>` + one `<circle>`. Static SVG. No scroll-linked calc. Pass on 60 fps scroll trivially. Caveat: if the Batch 36 spec adds an in-view reveal (stroke-dasharray animation), that must fire once per element via `IntersectionObserver`, not on every scroll frame. Verify implementation, not spec.

### 3.6 WeeklyHeatmap 7×12 content-visibility candidate — yes

84 cells is not huge, but the primitive appears on both Progress and Report, and Report is a print-friendly export where all 84 render. Apply `content-visibility: auto` + `contain-intrinsic-size` to the grid container to allow the browser to skip layout for offscreen rows. This is the same optimisation Strava applies to their calendar heatmap. Free win, no motion cost.

---

## 4 · Bundle cost impact

The system doc §7 says "target: net delta < 20 KB gzipped across all 7 new components." Realistic estimate:

| Primitive | Est. gzipped size | Notes |
|---|---|---|
| WorkoutHero | ~2 KB | Composition of existing primitives — no new deps. |
| WeeklySessionStrip | ~1.5 KB | 7-cell grid, date math from existing utils. |
| ArcProgressBar | ~2 KB | SVG or CSS — either way sub-3 KB. |
| MetricStripCluster | ~0.8 KB | 3-cell grid, no logic. |
| CategoryTileGrid | ~1.5 KB | Grid + glyph rendering. |
| WeeklyHeatmap | ~3 KB | 84-cell grid + state mapping — the largest new primitive. |
| OutcomeBar | ~1 KB | Static bar. |
| StatusPill | ~0.5 KB | Chip pattern, tone map. |
| **Subtotal** | **~12 KB** | **Comfortable under 20 KB target.** |

**No new dependencies proposed.** Verify against the doc's Appendix — no framer-motion (already absent, per invoker guidance never recommend it), no d3-* (Sparkline stays hand-rolled SVG per `charts/Sparkline.tsx:7`). The Recharts import at `progress/page.tsx:21` remains lazy — the design doc does not change this and must not.

**Watchlist — font swap.** The design doc §1 typography says "IBM Plex Mono replaces JetBrains Mono." `next-app/src/app/layout.tsx:2` currently imports JetBrains_Mono. The swap is a ~15 KB gzipped subset delta (Plex is slightly heavier). Include in Batch 36 measurement — do not sneak it in via a separate PR because it changes the perf baseline.

---

## 5 · R-list compliance from motion lens

### 5.1 Motion-as-gamification — one risk

No confetti proposed. No streak animations proposed. No celebration bursts. Good.

**One risk:** a "today-cell breathing pulse" on `WeeklySessionStrip` (the market research §6 mentions "the number breathes" as a common 2026 pattern). If a Batch 36 PR adds this, it is R5-adjacent — the today cell is not achieving anything by pulsing, and a pulse invites "keep the streak going" reading. **Motion lens verdict: do not add a breathing pulse to today's cell.** The static-with-slate-outline treatment described in §2.5 of the design doc is correct.

### 5.2 Score-hero animation — no ring fill, no donut

The system doc §5 explicitly rejects the score-donut and specifies the readiness treatment as `StatusPill` + `ReadinessTrail sparkline`. Neither animates as a score hero — the pill crossfades on state change (200 ms ui-state), the sparkline reveals its stroke on mount (400 ms data-reveal). No 0% → 68% fill on load. Pass.

The `ArcProgressBar` fill on mount (0% → weekCurrent / weekTotal) is a **calendar-driven** progress marker, not a score. The distinction holds — the arc-fill is a `data-reveal` for a fact (week 3 of 6), not a rendition of a computed composite. R8 compliant.

---

## 6 · The three caveats, restated as blockers

**Caveat 1 (motion token) — drop the 800 ms hero bucket.** Retain 200 ms `ui-state` and 400 ms `data-reveal`. Delete `hero: 800ms` and its `stagger-cascade` cousin's max-total-duration must be capped at 600 ms. Rationale: 800 ms exceeds every 2026 peer's hero moment and creates an LCP-timing ambiguity. If the founder insists on a distinctive app-launch moment, implement it as a 400 ms data-reveal on the readiness sparkline + card stagger, not a dedicated hero bucket.

**Caveat 2 (LCP measurement) — measure LCP post-Batch-36 on all three personas.** Fail deploy if any Today LCP > 2200 ms (leaves 300 ms headroom against the 2.5 s good threshold on real 4G). The persona harness already captures `loadMs` — extend the capture to record LCP via `PerformanceObserver` and put the number in `manifest.json` alongside `loadMs`.

**Caveat 3 (INP measurement) — measure DashboardBlock expand INP on mid-tier Chrome.** Fail deploy if > 180 ms. This is not a synthetic Lighthouse check — it needs a real device or WebPageTest Moto G4 profile. If Batch 36 wants to skip this, the alternative is to disable the grid-row-fr transition on `(prefers-reduced-motion: no-preference) and (max-width: 400px)` on older iOS Safari, using `@supports` guards, which is a small piece of extra CSS.

---

## 7 · Watchlist (not blockers, but track)

1. **Reduced-motion coverage on new primitives.** Every new primitive from §2 must add a `motion-reduce:transition-none` or `@media (prefers-reduced-motion: reduce)` guard on any transition or animation. Add a lint rule or a story-file audit.
2. **WeeklyHeatmap cascade cap.** Cap total cascade at 600 ms; use IntersectionObserver for viewport-only stagger.
3. **`content-visibility: auto`** on the WeeklyHeatmap grid on Progress + Report.
4. **Sparkline null-state CLS.** Wrap sparklines in fixed-height containers so `n < 2` returns null without pushing content.
5. **Haptic feature-flag.** Do not default `milestone: 60 ms` on for persona-recover mornings. Ship dark; measure.
6. **Font swap accounting.** IBM Plex Mono replacement of JetBrains Mono must be counted in the 20 KB delta budget (~15 KB gzipped subset addition).
7. **Easing name precision.** Rename `easing: "cubic-bezier(0.2, 0.8, 0.2, 1)"` in tokens explicitly so no engineer substitutes Tailwind's `ease-out` keyword.

---

## 8 · Overall vote

**APPROVE-WITH-CAVEATS.**

The design system §1 motion contract is 85% right — the buckets, the easing, the reduced-motion strategy, and the haptic vocabulary are the tightest motion discipline this codebase has seen. The `WorkoutHero` + `MetricStripCluster` + `ArcProgressBar` composition on Today is LCP-friendly under the caveats. The `WeeklyHeatmap` is manageable with the cascade cap. Bundle cost is well inside the 20 KB budget.

The three caveats (drop 800 ms hero, measure LCP post-migration, measure INP on DashboardBlock expand) are non-negotiable for the deploy gate but do not require re-design work. They require **measurement** and one token deletion. Batch 36 can ship inside the estimated 121 h appetite with those additions folded into the persona-harness regen step.

Score against the jury §7 items 6 (perf) and V3 (bounded motion): pass with the caveats applied. Without them, this is APPROVE-WITH-CAVEATS trending toward REJECT if the 800 ms hero ever renders on Today.

---

**End of vote.**
