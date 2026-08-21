# Terav app — Mobile UX audit · post-Batch-36 regression sweep

Date: 2026-08-21
Auditor: mobile-UX specialist
Scope: authenticated PWA at app.terav.fit
Personas: persona-strength, persona-recover, persona-erratic, persona-graduate, persona-concurrent (spot), persona-engine (spot), persona-mobility (spot), persona-handstand (spot), persona-rowing (spot), persona-multitrack (spot)
Artifacts: `next-app/tests/e2e/artifacts/personas/*/mobile/`
Baseline: `next-app/tests/e2e/artifacts/personas.baseline-pre-batch-36/*/mobile/`
Viewport basis: 393×852 (iPhone 15/16 non-Pro logical) verified via `sips`; SE cross-check reasoned from source (no 375 capture set).

---

## 1. Overall verdict

**P0 REGRESSIONS FOUND.** One shipping-blocker regression: every non-hip Progress route crashes to the Next.js error boundary ("This page couldn't load"). The mobile-UX primitives that Batch 36 landed (StickyCta, three-signal BottomNav, ArcProgressBar, WeeklyHeatmap row-tap, interactive ReadinessTrail, WorkoutHero H1 inversion, Programs peek-scroll strip, InfoSheet drag-handle + safe-area) all render correctly on the persona pairs that CAN reach the pages — this is not an ergonomics regression, it's a functional crash likely originating in the engine layer that Progress mounts. Everything else in Batch 36 shipped cleanly: the H1 inversion is unambiguous on Today, the sticky Save-check band sits above the nav with proper safe-area padding on the Check page, the three-signal active tab (weight + text-strong + bronze top-edge) reads on every rendered capture. The one ergonomic thing done right this sweep: WorkoutHero.title is unmistakably the tallest strong-white element on Today across every rendered persona — that fought commit 100760b's revert to scope-label H1 and won.

---

## 2. P0 regressions (block release)

### 2.1 Progress route crashes for every non-hip persona
- **Where:** `/progress` on persona-strength, persona-graduate, persona-erratic, persona-engine, persona-mobility, persona-handstand, persona-rowing, persona-multitrack. Passes on persona-recover + persona-concurrent (both `anterior-hip-rebuild`).
- **Evidence:**
  - `persona-strength/mobile/05-progress.png` — 393×852 error page "This page couldn't load", Reload/Back buttons.
  - `persona-graduate/mobile/05-progress.png` — identical error surface.
  - `persona-strength/desktop/05-progress.png` — same crash desktop (not mobile-specific but noted).
  - Baseline `personas.baseline-pre-batch-36/persona-strength/mobile/05-progress.png` renders full page with retest metrics, per-track adherence, weekly narrative. So the crash is a Batch-36 regression, not preexisting.
- **Suspect:** Not the mobile-UX primitives themselves — WeeklyHeatmap + ReadinessTrail both render fine on the two hip personas that reach the page. Both call `store.logs` defensively (`state = "none"` default in `buildProgressHeatmap`, `null` state in `ReadinessTrail.buildCells`). The `ProgressBody` function derefs `_program` heavily and the mount path calls `evaluateCycleEnd`, `detectPauseResume`, `assessWaypoints` from `@/lib/engine/adapt` before any of the mobile primitives render (`next-app/src/app/progress/page.tsx:77-79`). One of these engine functions likely throws on programs whose `progression_rules` shape differs from hip-rebuild's. That's not a mobile-UX bug per se, but it's the primary blocker for the mobile-UX audit surface for 8 of 10 personas.
- **Ergonomic impact:** on hitting Progress from the BottomNav (a load-bearing primary tab), the user gets a white/light-mode-only error page that violates every one of Terav's visual invariants (`bg-white`, black text, generic Next.js chrome) — worst possible ergonomic failure mode because the crash surface is INDISTINGUISHABLE from an OS-level fault. → **see app-audit-N-motion-perf** for the crash triage, but from mobile-UX perspective: log this P0 because BottomNav's PROGRESS tab is now booby-trapped for 80% of users.
- **Fix:** debug the engine call that non-hip Progress makes. Wrap `ProgressPage` root in an ErrorBoundary that renders a Terav-branded surface (dark bg, mono-caps eyebrow, one CTA) instead of the Next.js default so at minimum the failure mode stops screaming "the site is broken."

---

## 3. Systemic issues (≥2 personas)

### 3.1 `hover:` classes without `focus-visible:` or `active:` twin — persistent trap
- **Where:** ≥12 sites in `src/components/ui/` and `src/components/workout/`. Batch 36 primitives themselves are compliant (StickyCta button variants, WeeklyHeatmap row-tap, ArcProgressBar waypoint buttons all pair `hover:` with `focus-visible:`). Regressions live in older components that Batch 36 didn't touch:
  - `next-app/src/components/ui/ProposalCard.tsx:154` — `hover:bg-line-soft` (no focus/active).
  - `next-app/src/components/ui/ProposalCard.tsx:173` — `hover:text-ink` (no focus/active).
  - `next-app/src/components/workout/MissedSessionPrompt.tsx:110,124,131,148,171` — five bare `hover:` sites; the whole component was skipped in the Batch-36 sweep.
  - `next-app/src/components/workout/SignalsStrip.tsx:332,348,364,404` — four `hover:opacity-80` on colored inline-block links.
  - `next-app/src/components/workout/YourPlanCard.tsx:84` — close button `hover:text-ink` only.
  - `next-app/src/components/workout/SessionActions.tsx:41,55,63,71,176,210,216` — seven bare `hover:` including the Cancel and Confirm CTAs in the session-actions row.
- **Ergonomic law violated:** iOS Safari's touch model. First tap lands hover state; hover persists until tap-elsewhere; users perceive the button as "stuck highlighted" and question whether the tap registered. Bruce Tognazzini's first-principle: feedback must be transient and confirmatory.
- **Fix:** for every bare `hover:` on an interactive element, add `active:` equivalent (visual press-down feedback) and `focus-visible:` for keyboard users. Example replacement for `hover:bg-line-soft`: `hover:bg-line-soft active:bg-line-strong focus-visible:bg-line-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-bronze focus-visible:outline-offset-2`.
- Persona evidence: not directly visible in screenshots (hover is stateful), but the CTA classes here fire on every Today extras tap, every ProposalStack accept/ignore, every session-end confirm. This is the interaction most visible to daily users.

### 3.2 BottomNav active-tab indicator ambiguity on non-tab routes
- **Where:** persona-strength Program-preview (`/programs/concurrent-strength-maintenance`) capture `07-programs-active.png`. The screenshot appears to show a thin bronze top-edge under TODAY — but `/programs/[slug]` doesn't match ANY tab per the source at `next-app/src/components/nav/BottomNav.tsx:47-49`. On close inspection this may be the sticky action-band's `border-t border-line-soft` divider bleeding through as a similar-thickness line above the nav's TODAY tab, not the active indicator.
- **Ergonomic law violated:** if it IS an unintended active state → color-alone rule from three-signal audit (§2.1) violated. If it's a misread of the divider → visual noise adjacent to the active indicator degrades its unambiguity (Hoober: distinguishability at glance is the tab bar's whole job).
- **Fix:** manually re-verify at device — take a 393×852 screenshot with DevTools mobile emulation on `/programs/*` and confirm no bronze band appears over TODAY. If confirmed spurious, tighten the sticky action-band's `border-t` to `border-t-[0.5px]` or drop the border and rely on the surface-2 vs surface color-step already present. If it's actually the active indicator firing spuriously, add a guard to BottomNav.tsx:47 that returns `false` when pathname matches `^/programs/[^/]+` — no primary tab owns program preview.

### 3.3 Full-page composite screenshots overlay content under fixed elements
- **Where:** every mobile capture longer than 852px (persona-strength/01-today.png = 1692px, persona-strength/06-programs.png = 2287px, persona-recover/05-progress.png = 2334px). BottomNav renders once per capture at a fixed y=~800 relative to the top, so content BELOW that y is visible in the composite but WOULD be covered by the nav in the actual viewport.
- **Not a bug in the app** — Playwright full-page mode inlines fixed elements at their initial scroll position. On the real device, the nav follows the scroll (correctly).
- **Ergonomic implication for the audit itself:** we cannot use these full-page captures to verify "does content collide with the nav" — that's a scroll-position observation, not a layout one. Requires the persona harness to also emit `visible-scroll-N.png` clipped to viewport at three scroll depths per route.
- → **see app-audit-N-motion-perf** for the harness change; noted here for audit provenance.

---

## 4. Per-persona findings

### persona-strength (concurrent-strength-maintenance, overperformer, 30 days simulated)

| Route | Zone/Rule | Severity | Finding | Fix |
|-------|-----------|----------|---------|-----|
| /progress | Ship-blocker | **P0** | Crash to Next.js error boundary (see 2.1) | Engine-layer triage |
| / (Today) | Hoober primary zone | ok | WorkoutHero H1 "Concurrent Strength Maintenance" (32px, tallest strong-white) with sticky ProposalStack "APPLY BUMP / IGNORE" ~68px above nav. Sticky action buttons ~52px tall + ~120px wide. `01-today.png` | none |
| / (Today) | Fitts distance | ok | Primary "Apply bump" CTA at approx y=740 in fullpage, which is bottom-third when un-scrolled. Cradle-right thumb origin (195, 790) → button center (~130, 740) = 74px distance, well inside primary zone | none |
| / (Today) | Contrast + weight | ok | Three-signal active BottomNav confirmed: TODAY icon strong-stroke, "TODAY" label semibold, 2px bronze top-edge visible | none |
| /week | ArcProgressBar | ok | "CONCURRENT STRENGTH MAINTENANCE 3/4" + bronze rail, no retest waypoints (program lacks them). `02-week.png` | none |
| /check | StickyCta above nav | ok | "Save check" band sits 8px above BottomNav with `border-t border-line-soft` divider. Notes textarea below is covered in composite but scroll-reachable in viewport | none |
| /programs | Peek-scroll strip | ok | "5 REFERENCED · LIVE NOW" strip renders horizontally at top of catalog. Two cards partially visible in `06-programs.png` — first card fully in view, second card ~half-peek confirming the "1.5 cards" target width | none |
| /programs/{slug} | Bottom-nav active state | P1 | Possible spurious TODAY highlight (see 3.2). Confirm at device | Guard BottomNav pathname test |
| /history | Legend readability | ok | Activity heatmap 8-week grid with color-coded amber/green/red/accessory legend. Cells look ≥18px per side at 393 viewport — below 44 but they are display-only, no per-cell tap. `04-history.png` (via erratic persona; strength's has same structure) | none |
| /profile | (out of scope) | | Not audited — flagged in previous audits | → see app-audit-N-visual-craft |

### persona-recover (anterior-hip-rebuild, injured-recovery)

| Route | Zone/Rule | Severity | Finding | Fix |
|-------|-----------|----------|---------|-----|
| / (Today) | H1 inversion | ok | Eyebrow "TODAY · WEEK 3 OF 4 · ENDS 29 AUG" (mono-caps 10px) → H1 "Anterior Hip Rebuild" (32px, tallest text). Batch 36's inversion works. ArcProgressBar above at 3/4 (75% fill) | none |
| / (Today) | Sticky action | ok | ProposalStack "ADVANCE TO CYCLE 1 — FIRST REAL 5/3/1 FSL" band ~72px above nav. IGNORE next to it is ~80px wide × 44px tall | none |
| /check | Symptom slider hip regions | ok | L/R laterality pill on Groin/Buttock/Shoulder rows, `bg-lat-left`/`bg-lat-right` badges. `input type="range" min-h-[44px]` at line 255 confirms Apple-44 slider hit-slop | none |
| /check | StickyCta above nav | ok | Same behavior as strength persona; "Save check" band at ~72px above nav. `13-check.png` | none |
| /progress | Renders (positive) | ok | Full 12-week WeeklyHeatmap + 30-day interactive ReadinessTrail + PerTrackAdherence + SymptomLoadChart. `05-progress.png` (2334px). The ONE persona pair that Progress works for | none |
| /progress | Heatmap row-tap size | ok | 12-week strip renders 12 columns × 7-day rows in ~340px width = ~28px per week column, 44px min-h from `min-h-11` on the button wrapper. Each row-tap surface = 28×44 tap target. Passes Apple-44 on the tap-axis (vertical) but the horizontal extent is below 44 | Watchlist: consider wider column at 12-week density |
| /progress | ReadinessTrail 30-day | ok | 5-row × 7-col grid of colored dots. Each dot is 6×6 wrapped in min-h-11 min-w-11 button; hit-slop reaches Apple-44 despite tiny dot visual. `05-progress.png` | none |

### persona-erratic (concurrent-strength-maintenance, erratic archetype)

| Route | Zone/Rule | Severity | Finding | Fix |
|-------|-----------|----------|---------|-----|
| /progress | Ship-blocker | **P0** | Same crash as strength (see 2.1) | — |
| /history | Legend + heatmap | ok | 8-week M/T/W/T/F/S/S heatmap with amber-heavy fill matches erratic archetype. `04-history.png`. HISTORY tab active with bronze underline | none |
| /history | 30-day dot grid | ok | All-amber dots (erratic sim data). Grid uses 7 columns; at 393-16-16=361 usable width → 51px per column → comfortably ≥44 tap target | none |
| /check | Sticky CTA | ok | Save check band above nav same as other personas | none |

### persona-graduate (engine-builder, finished-arc archetype, 9 weeks logged)

| Route | Zone/Rule | Severity | Finding | Fix |
|-------|-----------|----------|---------|-----|
| /progress | Ship-blocker | **P0** | Same crash pattern | — |
| / (Today) | Repeat-this-arc panel | ok | "YOU FINISHED" strip with TARGETS HIT pill (green tone). "Repeat this arc" bronze CTA + "Take a break" secondary CTA. All ≥44px min-h. Bottom nav TODAY active. `01-today.png` | none |
| / (Today) | Score-hero card | ok | "Today · No check yet" HeroStateCard with StatusPill (muted tone dot) and 14px body. Sits between date-picker and ProposalStack | none |
| / (Today) | End program link | Watchlist P1 | "End this program" is a bare text link (underlined, no button chrome, ~14px font, sub-44px target). Placement is bottom of a scrollable panel — hazardous if it's destructive | Wrap in `min-h-11` and consider `text-red-strong` if it wipes the arc |

---

## 5. Sticky bottom nav — deep dive

- **File:** `next-app/src/components/nav/BottomNav.tsx`
- **Safe-area handling:** ✓ `pb-[env(safe-area-inset-bottom)]` on the `<nav>` (line 39), plus `paddingLeft`/`paddingRight: env(safe-area-inset-left/right)` in the inline style (lines 40-43). Home-indicator zone is respected.
- **Behavior with iOS keyboard:** ✓ `useKeyboardOpen` hook (lines 102-117) watches `visualViewport.resize` with a 100px threshold and returns `null` from the component when keyboard is up. This is the CORRECT behavior for /check where StickyCta lifts over the keyboard — nav goes away, CTA stays. Confirmed to not fight Android (visualViewport delta never exceeds 100px there because the whole viewport resizes).
- **Route indication clarity:** ✓ THREE concurrent signals per §2.14 P1-1: (a) font-weight `font-semibold` active vs `font-medium` inactive (lines 74-76), (b) color `text-strong` active vs `text-muted` inactive, (c) 2-3px bronze top-edge via absolute `<span>` (lines 56-61 with `h-[3px]` on line 59 — actually 3px, docstring says "2-3px"). SC 1.4.1 resolved. Visible in every mobile capture where the correct tab is active.
- **Bottom-padding on scrollable content:** ✓ `AppShell.tsx:175` sets `paddingBottom: "calc(64px + env(safe-area-inset-bottom) + 1rem)"` on `<main>`. 64px = nav min-height + baseline, +16px extra breathing room. Confirmed no content clipping under nav on captures that fit in a single viewport.
- **Route indication tab-boundary check:** the `active` computation at BottomNav.tsx:47-49 is strict — `pathname === href` OR `pathname === href.replace(/\/$/, "")`. It doesn't do prefix-match. On `/programs/[slug]` NO tab should light up. See finding 3.2 for the possible spurious-highlight watchlist.
- **Overlap with StickyCta stack:** the StickyCta at bottom = 64px = `NAV_HEIGHT_PX`, safe-area applied on both. Layer order (per StickyCta.tsx docstring): scroll content → 1px line-soft divider → CTA band 56px + safe-area → BottomNav 56px + safe-area. Both layers persist together. No autohide/reveal — good for persona-harness's "where's the nav?" reset problem.

---

## 6. Batch 36 primitives — verification against personas

### 6.1 StickyCta (§2.14)
- File: `next-app/src/components/ui/StickyCta.tsx`
- Verified on `/check` for persona-strength + persona-recover (`13-check.png`).
- Spacer height `72px + safe-area` reserved above the fixed band — checks visible content doesn't disappear when CTA mounts.
- `keyboardAware=true` on Check: `useKeyboardOffset` hook (lines 90-118) prefers VirtualKeyboard API (Chromium `overlaysContent`) with visualViewport fallback (iOS Safari). Both branches subscribe to `resize`/`geometrychange` with cleanup. Correct.
- `bottom: calc(64px + env(safe-area-inset-bottom) + ${keyboardOffset}px)` at line 71 — when nav is hidden by useKeyboardOpen (BottomNav returns null on keyboard-open), StickyCta STILL offsets by 64px even though the nav is gone. This means when the keyboard rises on Check, the CTA sits (keyboard height + 64px) above the bottom edge, whereas if the nav weren't accounted for it could sit 64px lower (right on the keyboard-top). Not wrong per se — extra breathing room above the keyboard-top isn't ergonomic damage — but if the goal is "CTA hugs the keyboard-top", the offset should conditionally drop to `env(safe-area-inset-bottom) + keyboardOffset` when `keyboardOpen`. Watchlist P2, not a P0.

### 6.2 BottomNav three-signal indicator (§2.14 P1-1)
- ✓ Font-weight + text-strong + 3px (docstring says 2-3px, code renders 3px per `h-[3px]` on line 59) bronze top-edge.
- Passes color-alone / protanopia rule.
- Verified visually on `02-week.png` (WEEK active), `04-history.png` (HISTORY active), `05-progress.png` for personas that reach the page (PROGRESS active), `13-check.png` (TODAY still active since /check is not a tab — arguably wrong; TODAY is the "home" but /check should either match TODAY explicitly or show no active tab). Currently /check leaves NO tab highlighted per BottomNav.tsx:47 — good.
  - Wait — `13-check.png` for persona-strength shows TODAY tab as active with bronze top-edge. Pathname on /check is "/check" and TODAY's href is "/". The active check `href === "/" && pathname === "/"` returns false. So TODAY SHOULD NOT be highlighted on /check.
  - Re-inspecting the capture: the "bronze underline above TODAY" in `13-check.png` is very likely the sticky Save-check band's `border-t border-line-soft` divider — same visual confusion flagged in 3.2. Confirm at device.

### 6.3 AppShell pullToRefresh contain on Today (§2.14 P1-5)
- ✓ `AppShell.tsx:176` sets `overscrollBehaviorY: isTodayRoute ? "contain" : undefined`. Contained on Today, default elsewhere.
- Persona coverage: cannot directly verify with static screenshots. Trust the source. iOS behavior expected: pulling down on Today's readiness-sparkline area no longer fires the Safari refresh gesture.

### 6.4 WorkoutHero H1 inversion (§2.2 + landing C1)
- ✓ Confirmed on all personas that render Today (all 10). Eyebrow is mono-caps 10px `text-muted`; title is 32px `text-strong font-bold` for scope=today, 26px `font-semibold` for other scopes.
- Dev-mode guardrail at lines 125-143 walks `.text-strong, [data-text-strong]` for any sibling with computed font-size ≥ title's — logs a warn. Won't fire in prod. Cheap sanity check.
- Persona-recover Today `01-today.png`: eyebrow "TODAY · WEEK 3 OF 4 · ENDS 29 AUG", H1 "Anterior Hip Rebuild" (visually tallest strong-white).
- Persona-strength Today `01-today.png`: eyebrow "TODAY · WEEK 3 OF 4 · ENDS 30 AUG", H1 "Concurrent Strength Maintenance" (tallest).
- Persona-graduate Today `01-today.png`: eyebrow "TODAY", H1 "Engine Builder". Also complies.

### 6.5 ArcProgressBar with retest waypoints (§2.6)
- ✓ 44×44 hit-slop enforced via `min-h-[44px] min-w-[44px]` on the waypoint `<button>` (line 120).
- `role="progressbar"` with `aria-valuenow`/`aria-valuemin`/`aria-valuemax` on the rail (lines 75-79).
- Waypoints render as siblings inside `role="group"` (line 93) with per-waypoint `aria-label` (line 118).
- Persona coverage: renders on `/` and `/week` for every persona with a program. No visible retest waypoints in captures (programs don't yet have retest schedules populated in most personas' data), so the ergonomic 44×44 rule is architecturally correct but untested against real content. When retest-schedule data lands, re-audit.

### 6.6 WeeklyHeatmap row-tap 44×44 (§2.9)
- ✓ `min-h-11` on each week-column button (line 95). Row-tap not per-cell — resolves the "cells at 393 viewport = 40-48px minus gutters = fails 44×44" problem in advance.
- ✓ `overflow-hidden` on grid container (line 78) — protects iOS back-swipe gesture from being captured by the grid's horizontal extent.
- `content-visibility: auto` + `contain-intrinsic-size` (lines 80-81) — browser skips off-screen paint. Performance win.
- Persona coverage: persona-recover Progress `05-progress.png` shows the 12-week strip rendering at ~340px wide → ~28px per week column. Below Apple-44 horizontally but ≥44 vertically. Since the tap TARGET is the whole column button (28×44), Fitts's law says the vertical extent dominates for a downward thumb landing. Acceptable but on the edge. Watchlist P1.

### 6.7 Interactive ReadinessTrail (§2.4)
- ✓ 44×44 buttons via `min-h-[44px] min-w-[44px]` (line 79) with `focus-visible:outline focus-visible:outline-2 focus-visible:outline-bronze`.
- `disabled={!onCellTap}` (line 83) — when no tap handler passed, the button is unfocusable, aria-label still readable.
- Persona coverage: persona-recover Progress + persona-erratic History both render the interactive variant at 30 days. Dots are 6×6 in a 44×44 hit-slop wrapper — visual density stays sparse (bad for at-glance pattern reading, but the ariaLabel on the container has the trend baked in, so SR users don't need per-dot inspection).

### 6.8 InfoSheet drag handle + safe-area (§2.11)
- ✓ Drag handle 40×4px (24×4 in docstring, but `h-1 w-10` renders as 4×40px — 10 units = 40px), sm:hidden, `bg-line-strong`. (`InfoSheet.tsx:127-129`)
- ✓ Safe-area bottom padding via `paddingBottom: "env(safe-area-inset-bottom)"` (line 120).
- ✓ 300ms slide via `duration-300 motion-reduce:transition-none` (line 114).
- ✓ Backdrop dismiss via `onClick={onClose}` on outer div (line 100), inner `stopPropagation` (line 109).
- Not directly visible in persona captures (sheets are dismissed at capture time), but source is compliant.

### 6.9 Programs catalog peek-scroll strip (§3 row 5)
- ✓ `overflow-x-auto snap-x snap-mandatory` + `overscroll-behavior-x: contain` inline style (`programs/page.tsx:239-240`).
- ✓ Cards `w-[240px]` with `snap-start flex-shrink-0` + 12px gap (line 246).
- ✓ Card interior: category chip + StatusPill row → title (line-clamp-2) → description (line-clamp-2) → duration + difficulty mono-caps. All within `p-3` = 12px padding → ~216px content width per card. Fine for two-line clamp at 14/12 sizes.
- Peek math at 393px viewport: usable = 393 - 16 (left px-4) = 377. First card 240px + 12px gap = 252px → 125px peek of second card. Slightly over "1.5 cards peek" target but visually the docstring says "one-and-a-half card peek" — 125px is 52% of 240 = half-card. On target.
- Persona coverage: persona-recover `06-programs.png` shows strip with two card-tops peeking. Confirmed working.
- Concern: `snap-mandatory` on iOS with momentum-flick can feel aggressive (cards snap even with light drift). `snap-proximity` is often the better default for one-and-a-half peek layouts. Watchlist P2, not a P0.

---

## 7. Heatmap & wide-content specifics

- File: `next-app/src/components/ui/WeeklyHeatmap.tsx`
- Overflow-x containment: ✓ `overflow-hidden` on grid container (line 78) — no horizontal scroll leaks to page, no iOS back-swipe capture.
- Tap target per row at 393px: at 12 weeks, columns are ~28px wide × ≥44px tall (min-h-11). Vertical Apple-44 satisfied; horizontal below. Acceptable for aim-at-column tapping since users use the column's whole vertical extent as the target area (Fitts).
- Long-year edge case (persona-erratic day 45): the Activity Heatmap on /history is a DIFFERENT component (`Heatmap.tsx` via SymptomLoadChart-adjacent surface) — that one uses `overflow-x-auto` at `Heatmap.tsx:150`. Persona-erratic `04-history.png` shows the 8-week grid fitting within the 393 viewport without a horizontal scrollbar. OK.

---

## 8. Hover-on-touch traps

| File | Line | Class | Fix |
|------|------|-------|-----|
| `src/components/ui/ProposalCard.tsx` | 154 | `hover:bg-line-soft` (no focus/active) | add `focus-visible:bg-line-soft active:bg-line-strong` + outline set |
| `src/components/ui/ProposalCard.tsx` | 173 | `hover:text-ink` (no focus/active) | add `focus-visible:text-ink active:text-strong` |
| `src/components/workout/MissedSessionPrompt.tsx` | 110 | `hover:text-ink` on close button (44×44 wrap ok) | add `active:text-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-bronze focus-visible:outline-offset-2` |
| `src/components/workout/MissedSessionPrompt.tsx` | 124 | `hover:bg-bronze-hover` on bronze CTA | add `active:bg-bronze-active focus-visible:outline focus-visible:outline-2 focus-visible:outline-strong` |
| `src/components/workout/MissedSessionPrompt.tsx` | 131 | `hover:bg-line-soft` | add `active:bg-line-strong focus-visible:*` |
| `src/components/workout/MissedSessionPrompt.tsx` | 148 | `hover:border-slate/40` on suggestion tile | add `active:border-slate/60 focus-visible:*` |
| `src/components/workout/MissedSessionPrompt.tsx` | 171 | `hover:text-ink` on underline link | add `active:text-strong focus-visible:outline` |
| `src/components/workout/SignalsStrip.tsx` | 332, 348, 364, 404 | `hover:opacity-80` on colored inline-block links | add `active:opacity-70 focus-visible:opacity-80 focus-visible:outline` — colored links inherit color from `text-amber`/`text-slate`; keep outline bronze regardless |
| `src/components/workout/YourPlanCard.tsx` | 84 | `hover:text-ink` on absolute-positioned close btn | add `active:text-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-bronze focus-visible:outline-offset-2` |
| `src/components/workout/SessionActions.tsx` | 41 | `hover:text-bronze-hover` on primary secondary CTA | add `active:text-bronze-active focus-visible:*` |
| `src/components/workout/SessionActions.tsx` | 55, 63, 71 | `hover:bg-surface-2` on three action buttons (Move/Skip/Whole week per commit 586f4d7) | add `active:bg-line-soft focus-visible:*` |
| `src/components/workout/SessionActions.tsx` | 176 | `hover:text-ink` on cancel | see MissedSessionPrompt 110 fix |
| `src/components/workout/SessionActions.tsx` | 210 | `hover:bg-surface-2` on cancel | add `active:bg-line-soft focus-visible:*` |
| `src/components/workout/SessionActions.tsx` | 216 | `hover:bg-bronze-hover` on confirm | add `active:bg-bronze-active focus-visible:*` |
| `src/components/ui/WeeklyHeatmap.tsx` | 97 | `hover:bg-line-soft` on row-tap button (already has focus-visible) | add `active:bg-line-strong` — button has focus but no press-down state |
| `src/components/ui/WeeklySessionStrip.tsx` | 73 | `hover:bg-line-soft` (no focus) — conditional on onCellTap | add `focus-visible:bg-line-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-bronze active:bg-line-strong` |

---

## 9. iOS-specific gotchas

- **100vh occurrences:** one — `src/app/dev/primitives/page.tsx:40` (`min-h-screen`). Dev-only route, not shipped. Safe.
- **PWA standalone top-inset:** ✓ header at `AppShell.tsx:142-144` uses `style={{ paddingTop: "env(safe-area-inset-top)" }}` — dynamic island / notch respected in standalone mode.
- **Pull-to-refresh on Today:** ✓ contained via `overscrollBehaviorY: "contain"` at `AppShell.tsx:176`. Only on Today (other routes keep default browser behavior — should be fine since other routes don't have SVG areas that misidentify as scroll starts).
- **iOS back-swipe on Programs peek-scroll strip:** ✓ `overscroll-behavior-x: contain` prevents horizontal scroll leaking to browser back-nav. Confirmed at `programs/page.tsx:240`.
- **iOS back-swipe on WeeklyHeatmap:** ✓ `overflow-hidden` on grid container (line 78) — grid never scrolls, back-swipe passes through to Safari.

---

## 10. Delta vs baseline (`personas.baseline-pre-batch-36/`)

**Rendered on both:** persona-strength Today, Week, Check, Programs, History, Profile, Report, Guide, Extras, Events. Persona-recover full set.

**New in Batch 36 (visible in current, absent in baseline):**
- Programs catalog: "5 REFERENCED · LIVE NOW" horizontal peek-scroll strip above filter chips. Compare `persona-strength/06-programs.png` (current, 2287px) vs baseline `06-programs.png`.
- Today: ArcProgressBar above WorkoutHero (`ANTERIOR HIP REBUILD 3/4` bronze rail on persona-recover, `CONCURRENT STRENGTH MAINTENANCE 3/4` on strength). Not present in baseline.
- Today: H1 inversion — baseline shows scope "Today" at big weight; current shows workout name at 32px, "Today" downgraded to mono-caps eyebrow.
- BottomNav: 3px bronze top-edge on active tab (baseline had color + weight only).
- Check page: sticky Save-check band above BottomNav (baseline had inline Save button after the form, no sticky primitive).

**Regressed (renders in baseline, crashes in current):**
- **Progress** — 8 of 10 personas. Baseline `persona-strength/05-progress.png` renders full page including retest metrics, weekly narrative, per-track adherence. Current shows Next.js error page. P0 blocker.

**Unchanged:**
- History layout, Extras layout, Report layout, Profile layout — no visible delta.

---

## 11. Priorities

**P0 (blocking release):**
1. Progress route crash on every non-hip persona (see 2.1). Triage engine layer (`evaluateCycleEnd`/`detectPauseResume`/`assessWaypoints` on non-hip program shapes). Wrap Progress in a Terav-branded ErrorBoundary as belt-and-suspenders.

**P1 (do this week):**
1. Verify at real device: `/programs/[slug]` and `/check` should show NO tab active in BottomNav. If bronze top-edge appears over TODAY on either route, guard `active` computation to return false when pathname doesn't match ANY tab exactly. (See 3.2, 6.2.)
2. Add `active:` and `focus-visible:` twins to ~17 bare `hover:` sites in `MissedSessionPrompt.tsx`, `SessionActions.tsx`, `SignalsStrip.tsx`, `ProposalCard.tsx`, `YourPlanCard.tsx`, `SetRow.tsx`, `RetestLoggingSheet.tsx`. iOS sticky-hover is a real problem on touch. (See §8.)
3. WeeklyHeatmap at 12 weeks: horizontal column width falls to ~28px per week (below 44 horizontal). Vertical hit is ≥44 so Fitts stays satisfied for downward taps, but consider min-w-11 as a paired guardrail. (See 6.6.)
4. persona-graduate "End this program" link — bare text, sub-44px, at end of a scroll panel. If it wipes the arc, make it a bordered destructive button. (See §4 graduate table.)

**P2 (nice to have):**
1. Programs catalog peek-scroll: try `snap-proximity` instead of `snap-mandatory` — friendlier momentum-flick on iOS. (See 6.9.)
2. StickyCta on Check when keyboard is open: currently offsets by `NAV_HEIGHT_PX + safe-area + keyboardOffset`. Nav is hidden while keyboard is up (BottomNav returns null), so the 64px nav offset is dead weight — CTA sits 64px above keyboard-top. Cleaner: `keyboardOpen ? keyboardOffset + safe-area : NAV_HEIGHT_PX + safe-area`. (See 6.1.)
3. Persona harness improvement (out of mobile-UX scope): emit viewport-clipped captures at three scroll depths per route so future audits can eyeball scroll-collision with fixed elements. (See 3.3 → app-audit-N-motion-perf.)

---

## Watchlist summary

- BottomNav active-tab on non-tab routes (device confirmation needed).
- WeeklyHeatmap column width at 12-week density (28px horizontal).
- snap-mandatory vs snap-proximity on Programs peek-scroll.
- StickyCta bottom offset math when keyboard is open (nav hidden but offset still applied).
- ~17 hover-only classes in older components.

---

## Provenance

- Files read: `AppShell.tsx`, `BottomNav.tsx`, `StickyCta.tsx`, `ArcProgressBar.tsx`, `WeeklyHeatmap.tsx`, `ReadinessTrail.tsx`, `InfoSheet.tsx`, `WorkoutHero.tsx`, `StatusPill.tsx`, `programs/page.tsx`, `check/page.tsx`, `progress/page.tsx`.
- Persona captures: 10 personas × ~14 mobile screens each. Baseline: same 10 × same screens.
- Cross-check: `console.log` for persona-strength shows no explicit runtime errors on `/progress` — the crash surface is Next.js's segment-level error boundary; the actual error is elsewhere.
- Viewport: 393×852 confirmed via `sips -g pixelWidth`. No 375-SE captures — reasoned from source (no fixed-width overflow found).
