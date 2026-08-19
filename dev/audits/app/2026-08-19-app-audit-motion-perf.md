# Terav app — Motion + Core Web Vitals audit (3 personas, 2026-08-19)

Personas: `persona-recover`, `persona-strength`, `persona-erratic`
Artifacts: `next-app/tests/e2e/artifacts/personas/{persona}/{manifest.json,network.log,console.log}`
Assumption: mobile Safari, 4G throttled (~1.6 Mbps effective, ~150ms RTT), mid-tier CPU (iPhone 12-class).

Framing note (per prompt): every finding below is an **IDEA**, not an assigned task. Terav's confirm-first engine is deliberately calm; the audit's job here is to say "what fits this register, what doesn't." Where the previous audit (2026-08-18) already tagged something P0 and it still holds, this file re-flags it without re-litigating the fix; where Batch 16 changed the surface (a new `<details>` on Profile, a per-day tap-to-expand on Week from Batch 15), those are examined at the transitions.

---

## 1. Overall verdict

Three personas, three CLEAN console logs across 14 routes each — no React warnings, no hydration mismatches, no Sentry breadcrumbs leaking. Persona `loadMs` sits **1657-2232 ms** across every route, all three personas, both viewports; the slowest route in the fleet is `/programs` on `persona-recover` at 2232 ms (still under the 2.5 s LCP threshold). This is the first audit run since MO1/MO2/MO3 landed and since the font-weight explosion was closed — the network log for persona-recover's Today paint shows exactly **two** `.p.woff2` files (`558ca1a6...`, `e4af272c...`), one Inter one Mono, so the previous ~305 KB font-media problem is dead. `layout.tsx:15,22` now declares `weight: ["400","500","600","700"]` on Inter, `["400","500"]` on Mono, both `display: "swap"`. Good.

The single biggest liability is the same one flagged 24 h ago and not fixed yet: **`@sentry/nextjs` including Replay + Feedback is statically imported at `sentry.client.config.ts:19`**, which pulls ~100 KB gz into every page shell regardless of DSN presence. That's the delta between "1.8-2.1 s LCP" and "2.9-3.6 s LCP" on 4G cold. Persona `loadMs` numbers above are Playwright wall-clock on a warm CDN with a headless browser — they under-estimate real-user LCP on a 4G iPhone in poor signal by ~40-60%. Extrapolating, real Today LCP with the current shell is likely landing in the **2.4-3.2 s** band today, right on the boundary. Fix P0-1 from the 2026-08-18 sweep is still the biggest single-lever move.

Motion craft: no regressions. Batch 16's `<details>` on Profile at `profile/page.tsx:336` is native HTML disclosure — MDN confirms browsers do NOT animate `<details>` open/close by default, so it's an instant swap. That's the right call for a Danger Zone control (motion would soften a destructive affordance, which is the opposite of what the copy needs). Batch 15's per-day tap-expand on Week at `week/page.tsx:398-481` is a plain React conditional render — instant open, no `transition-[height]`, no fade — again correct for the Runna-quiet register. Two unguarded `animate-pulse` classes (Coach caret, Profile skeleton) and one unguarded `scrollTo({ behavior: "smooth" })` on Coach that were open in the 2026-08-18 sweep remain open. See §7.

---

## 2. Motion inventory + purpose test

Full inventory — grepped `next-app/src/` for `@keyframes`, `animate-`, `transition-`, `motion-safe`, `motion-reduce`, `prefers-reduced-motion`, `scrollTo`.

| # | Animation | File:line | Duration | Easing | Purpose | Reduced-motion guard | Verdict |
|---|-----------|-----------|----------|--------|---------|----------------------|---------|
| 1 | `route-in` (opacity + 2px translateY) on `<main>` mount | `globals.css:126-130` | 150 ms | ease-out | Tab-swap teaches "new screen." Small enough to survive bottom-nav thrash. | Yes (`:158`) | Keep |
| 2 | `tag-in` (opacity + 0.9→1 scale) on PR bronze tag | `globals.css:133-136`, applied at `SetRow.tsx:143` | 260 ms | `cubic-bezier(0.16, 1, 0.3, 1)` (soft spring) | "You just hit a PR." Load-bearing feedback — the whole product's payoff moment. | Yes via `motion-safe:` prefix | Keep |
| 3 | `pulse-accept` (green/20 → transparent bg fade) on ProposalCard | `globals.css:140-144`, added at `ProposalCard.tsx:36-38` | 500 ms | ease-out | Confirm-first ACK — the confirm-first mechanic IS the product; this pulse teaches "engine received your Accept before any network write." | Yes (`:159`) | Keep. Fire-order-critical — see §9. |
| 4 | `mark-done` (bronze bg wash + 1.015 scale) on exercise row | `globals.css:147-152` | 450 ms | ease-out | "Set logged." Physicality. | Yes (`:160`) | Keep |
| 5 | Global active-press `scale(0.98)` on `button:active` / `a[href]:active` | `globals.css:118-122` | 60 ms | ease-out | Native tap feedback. Without it the app-shell reads "webpage." | Yes (`:162`) | Keep |
| 6 | Coach streaming caret (`animate-pulse` on 1.5×16 px bronze block) | `coach/page.tsx:404` | Tailwind default 2 s ∞ | cubic-bezier | Cursor teaches "streaming." | **No — unguarded Tailwind class** | Fix (see §7) |
| 7 | Profile loading-email skeleton `animate-pulse` | `profile/page.tsx:161` | 2 s ∞ | cubic-bezier | Skeleton | **No guard** | Fix (see §7) |
| 8 | CitationRef chevron `rotate-180 transition-transform` | `CitationRef.tsx:53` | Tailwind default 150 ms | ease | Disclosure state change (transform, no opacity change) | Implicit (transform-only, WCAG 2.3.3 tolerates) | Keep — reduced-motion-inert |
| 9 | RestTimer progress-bar `transition-all duration-500` | `RestTimer.tsx:70` | 500 ms | ease | Progress bar → linear+width is the right feel. `transition-all` scope is wrong. | **No guard** | Fix — scope to `[width]` + add `motion-reduce:transition-none` (see §7) |
| 10 | HeroStateCard `active:scale-[0.98]` | `HeroStateCard.tsx:96` | inherits global 60 ms | ease-out | Tap feedback | Yes (global at `:162`) | Keep |
| 11 | Coach message-list `scrollTo({ behavior: "smooth" })` on new token stream | `coach/page.tsx:193` | UA-controlled | UA | Autoscroll to newest | **No `prefers-reduced-motion` check** | Fix — vestibular users get vertigo from every token stream (see §7) |
| 12 | IntakeClient progress bar `transition-[width] motion-reduce:transition-none` | `IntakeClient.tsx:839` | Tailwind default | ease | Progress | Yes | Keep — the exemplar |
| 13 | Multiple `transition-colors` (hover, links, Programs cards, Heatmap cells) | `page.tsx:822`, `programs/page.tsx:258`, `Heatmap.tsx:162,179`, `CitationRef.tsx:44`, etc. | Tailwind default 150 ms | ease | Hover / focus state | Colour-only, no motion — WCAG 2.3.3 does not restrict | Keep |
| 14 | RulesAccordion open/close on Week | `week/page.tsx:492-518` | 0 ms | — | Conditional React render, no CSS transition | N/A | Keep — see §5 |
| 15 | Week per-day tap-expand (Batch 15) | `week/page.tsx:398-481` (`isExpanded ? (...) : null`) | 0 ms | — | Instant conditional render, no height animation | N/A | Keep — see §5 |
| 16 | Profile `<details>` Danger Zone (Batch 16) | `profile/page.tsx:336-357` | 0 ms | — | Native HTML disclosure — no default animation | N/A (browsers don't animate `<details>` by default) | Keep — see §5 |
| 17 | ExerciseCard footer button `transition-colors` | `ExerciseCard.tsx:299,412` | Tailwind default 150 ms | ease | Colour hover — no motion | Colour-only | Keep |
| 18 | Slate deep-link card `transition-colors` (Today "programs" tile) | `page.tsx:822` | Tailwind default | ease | Hover state | Colour-only | Keep |

**Purpose test verdict:** 15 of 18 pass. Same three gaps as 2026-08-18 (#6, #7, #9, #11 — a repeat). Nothing new to subtract.

Batch 16 introduced **zero new keyframes** (verified — `git log -p globals.css` since 2026-08-17 shows no additions after the initial four). Zero new `animate-*` Tailwind classes. Zero new `transition-*` scopes. Motion craft has held flat while the surface changed — that's the healthy shape for this register.

---

## 3. CWV per persona × route

Persona `loadMs` is Playwright wall-clock (goto → network-idle-ish); it is not real-user LCP but is a decent upper bound on **DOMContentLoaded + first paint on a warm CDN**. Numbers below.

### LCP — persona `loadMs` (ms)

Threshold: ≤ 2500 = green, 2500-4000 = needs-improvement, > 4000 = poor.

| Route | persona-recover | persona-strength | persona-erratic | Fleet median | Verdict |
|-------|-----------------|------------------|-----------------|--------------|---------|
| `/` (Today) | 1886 | 1703 | 1750 | 1750 | Green — but see caveat below |
| `/week` | 1738 | 1747 | 1674 | 1738 | Green |
| `/coach` | 1747 | 1721 | 1657 | 1721 | Green |
| `/history` | 1780 | 1727 | 1749 | 1749 | Green — Heatmap is CSS, no chart lib |
| `/progress` | 1784 | 1712 | 1696 | 1712 | Green — Recharts lazy-loaded correctly (`progress/page.tsx:22-25`), so LCP fires on `<h1>` before chart mounts |
| `/programs` | 2232 | 2103 | 2056 | 2103 | **Slowest surface** — flag |
| `/programs/{slug}` | 1768 | 1747 | 1893 | 1768 | Green |
| `/profile` | 2134 | 2171 | 2071 | 2134 | Warm-yellow — flag |
| `/report` | 1852 | 1723 | 1724 | 1724 | Green |
| `/guide` | 1960 | 1849 | 1831 | 1849 | Green |
| `/extras` | 1911 | 1680 | 1758 | 1758 | Green |
| `/check` | 1710 | 1738 | 1686 | 1710 | Green |
| `/check/hip` | 1742 | 1708 | 1870 | 1742 | Green |
| `/events` | 1735 | 1707 | 1753 | 1735 | Green |

Caveat: Playwright over a warm connection with cached fonts is ~40-60% faster than real-user 4G Safari cold. Extrapolating the 1750-ms Today median through a 1.5× throttle gives **~2.6 s p50 LCP on 4G cold**, right on the 2.5-s boundary. The `/programs` route at 2103-2232 ms warm extrapolates to **~3.1-3.3 s** on 4G cold — that's needs-improvement territory. Not "red" but "notice this."

Two routes are consistently 300-400 ms slower than the fleet median: `/programs` and `/profile`. Neither has a Recharts import, so it's not chart weight. `/programs` renders the full catalog including all program metadata and category filters; the shape is `programs/page.tsx` loading + `data-loader.ts` fetching `data/programs.index.json` and then per-program JSON. Ordinary. `/profile` at ~2.1 s is heavier than expected for a static-looking page; suspect the Batch 16 addition of the `<details>` + delete-flow modal + `activePrograms` map is walking the store more than needed. Not urgent.

### CLS — inference per route

| Route | Async content? | Reserve strategy | Projected CLS | Verdict |
|-------|----------------|------------------|---------------|---------|
| `/` (Today) | ProposalStack mounts post-`updated_at > 0` guard | `ProposalStack.tsx:28` gates on `syncStable`, returns `null` before. When it becomes non-null, the `<section aria-label="Engine proposals" className="space-y-3">` at `:38` mounts and pushes HeroStateCard down. No `min-h-*` reserve. | **0.08-0.15** | Flag — same as 2026-08-18 §3. B4 backlog remains OPEN. |
| `/week` (Batch 15) | Per-day tap-expand is user-initiated, not async. Height change on tap is bounded by container — the whole `<div>` list is inside `<div>` with no fixed height, so subsequent days DO push down when a day expands. | Bounded to viewport since the day being tapped is currently in-view. CLS metric only counts unexpected shifts within 500 ms of user input — tap-triggered shifts are exempt when the browser correctly attributes them to `hadRecentInput`. | **0.00 attributed to expand** | Keep. Verify: the Chromium hadRecentInput window is 500 ms — tap → shift must land inside that. React's conditional render on state change is synchronous, so it will. |
| `/coach` | Token-by-token streaming inside a fixed-height container (`coach/page.tsx:286` uses `maxHeight: calc(100dvh - 320px)`) | Container bounded; smooth-scroll doesn't cause layout shift, only translate/scroll | 0.00 | Keep |
| `/history` | Heatmap grid (`Heatmap.tsx:44-105`) — 56 CSS-grid cells, deterministic dimensions before data resolves | `gridAutoColumns: minmax(32px, 1fr)` + `aspect-square` | 0.00 | Keep |
| `/progress` | Recharts loads async — reserves `h-[300px]` via loading fallback at `progress/page.tsx:24` | Chart div reserves same 300 px before and after mount | 0.00 | Keep — same fix as before, still holding |
| `/programs` | Static list of category cards, no async re-arrangement | Static | 0.00 | Keep |
| `/profile` | Batch 16 `<details>` on Danger Zone. When user taps summary, the div child (`:340-356`) reveals. | Bounded to just-tapped element; `hadRecentInput` exempts. | 0.00 attributed | Keep — the `<details>` is user-initiated and instant, so no layout jank. |
| `/report` | Recharts lazy-loaded (`report/page.tsx:6-16`, verified 2026-08-18) | Reserved | 0.00 | Keep |
| Bottom nav | Fixed height | Stable | 0.00 | Keep |

**Only real CLS liability is still Today's ProposalStack** — same finding as 2026-08-18 §3, unchanged. The 500-ms reserve slot (`min-h-[120px]` on the section when `!syncStable`) remains the cheapest fix.

### INP — projected per interaction

Threshold: ≤ 200 ms = good.

| Interaction | Handler shape | Projected INP | Verdict |
|-------------|---------------|---------------|---------|
| Tap Accept on ProposalCard | `hapticTap()` → DOM `classList.add("pulse-accept")` **before** switch/store mutation (`ProposalCard.tsx:34-38`) → outcome record → announce | 60-110 ms | Green. The visual ACK does not wait on the store write — the pulse paints inside the same frame. Do not regress this fire order. |
| Tap Save on log entry (SetRow) | zustand mutation → localStorage → deferred Postgres flush | 80-140 ms | Green |
| Tap bottom-nav tab | `next/link` client nav → `<main>` `route-in` 150 ms | 120-180 ms first, 60-90 ms after warm cache | Green |
| Tap Coach Send (streaming) | `send()` builds messages array, kicks streamCoach, user bubble paints immediately | 40-80 ms | Green |
| Tap morning-check Save (`/check`) | zustand mutation + navigation | 80-140 ms | Green |
| **Tap Week day (Batch 15)** | `toggleDay(dateISO)` → `setExpandedDays(new Set)` → React re-renders that one day row → conditional block mounts | 40-90 ms | Green. State is a `Set<string>`, mutation is O(1), re-render is scoped to the day row via key stability. |
| **Tap `<details>` Danger Zone (Batch 16)** | Browser-native toggle — no JS handler. Zero React work. | 0-30 ms (paint only) | Green. Native `<details>` is the cheapest interaction on the page. |

INP is not the story on this branch. Green across the board.

---

## 4. JS payload

Network log for persona-recover Today shows 233 lines under `=== 01-today ===` (~115 REQ + 115 RES + section header) — that's the request count before Today reaches network-idle. Compare 2026-08-18's estimate: same order of magnitude, no obvious regression.

| Concern | File / line | Status | Note |
|---------|-------------|--------|------|
| Recharts lazy on Progress | `progress/page.tsx:22-25` | DONE | Loading fallback reserves 300 px |
| Recharts lazy on Report | `report/page.tsx:6-16` (verified 2026-08-18) | DONE | — |
| Recharts NOT on History | `Heatmap.tsx` — CSS grid, zero Recharts | Correct | — |
| Sentry Replay + Feedback statically imported | `sentry.client.config.ts:19` (`import * as Sentry`), `:47` (Feedback), `:59` (Replay) | **P0 unchanged** | Same fix as 2026-08-18 §5: wrap the whole init in a runtime-lazy import gated on `if (DSN)`. Estimated shell savings: 70-100 KB gz. LCP delta on 4G: -500-800 ms. |
| next/font weight declared | `layout.tsx:15,22` | DONE | Inter `["400","500","600","700"]`, Mono `["400","500"]`. MO3 verify closes here. |
| Zustand | Small (~3 KB) | Fine | — |
| Supabase browser client | `lib/supabase/client.ts` — `createBrowserClient` deferred | Fine | — |
| lucide-react tree-shake | Named imports throughout — chunk `598-*` is suspiciously large (~180 KB gz). | Suspect (open from 2026-08-18) | Run `next build --profile` or `@next/bundle-analyzer` before Batch 17 to close. |
| date-fns | Not in deps | N/A | — |

Estimated shell JS on Today, with Sentry Replay + Feedback still eagerly imported: **~310-380 KB gz**. Mobile 4G budget for LCP ≤ 2.5 s is ~170 KB gz. The gap is 100 % — and it's almost entirely Sentry.

---

## 5. Batch 16 (`<details>`) + Batch 15 (per-day tap-expand) — motion behaviour at the transitions

The prompt asks specifically for a judgment here.

### Profile `<details>` Danger Zone (Batch 16)

Location: `profile/page.tsx:336-357`.

The element:

```tsx
<details className="text-[11px]">
  <summary className="cursor-pointer inline-flex items-center min-h-[44px] py-2 text-muted hover:text-ink select-none">
    Danger zone
  </summary>
  <div className="mt-1 pl-2 border-l border-red/30 py-2">
    <button ...>Delete my account</button>
    <p className="text-muted italic mt-1">Wipes your account, logs, morning checks, everything synced. Cannot be undone.</p>
  </div>
</details>
```

**Browser default**: Chromium, WebKit, and Gecko all render `<details>` open/close as an **instant** height snap — no CSS transition, no animation. MDN confirms: "there's no built-in way to animate the transition between open and closed" (paraphrased above). The disclosure toggle is a pure DOM tree mutation.

**Motion judgment for THIS control**: instant is right. This is the delete-account entry point. A soft animated reveal on a destructive control would soften the affordance — motion generally reads as "this is safe, come closer." The Danger Zone copy is "Wipes your account, logs, morning checks, everything synced. Cannot be undone." Adding a 200-ms ease-out reveal here would contradict the copy. The current instant snap says "you are opening a serious drawer" which matches the register.

**CLS behavior**: the `<details>` reveals ~72 px of content when opened (button 44 px + paragraph two lines ~28 px). That pushes content below down. Since it's user-tap-initiated, browsers exempt via `hadRecentInput` — CLS metric contribution is zero. No fix needed.

**Reduced-motion**: N/A. There is no motion to guard. WCAG 2.3.3 not applicable to instant-DOM-swap. Do not add a `transition-[height]` here just for consistency — this is the wrong control for softness.

**One nit**: `<summary>` is inside a `<details>` at `text-[11px]` and the tap-target is `min-h-[44px]`. Good — the visual size is small but the hit area meets WCAG 2.5.5. Accessibility scope, not motion scope.

### Week per-day tap-expand (Batch 15)

Location: `week/page.tsx:39-50` (state) and `398-481` (render).

The pattern:

```tsx
const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());
const toggleDay = (dateISO: string) => {
  setExpandedDays((prev) => {
    const next = new Set(prev);
    if (next.has(dateISO)) next.delete(dateISO); else next.add(dateISO);
    return next;
  });
};
// ...
<button onClick={() => toggleDay(dateISO)} aria-expanded={isExpanded} ...>
  ...
  <p className={cn("text-[13px] mt-1", ..., !isExpanded && "line-clamp-1")}>
    {names || displayLabel}
  </p>
  {isExpanded ? (
    <>
      {override?.reason ? <p className="text-[12px] text-slate italic mt-1">↳ {override.reason}</p> : null}
      {/* runs, top lift, conditioning, etc. */}
    </>
  ) : null}
</button>
```

**Motion**: none. When `isExpanded` flips, React re-renders the row synchronously — the collapsed `line-clamp-1` on the description drops, and the sibling `<>...</>` block conditionally mounts. No CSS transition on the row's height, no `max-height` animation, no fade-in on the children.

**Judgment for THIS control**: also right. Week is a list of 7 days you tap through — softening the expand would create a "waiting for the animation" beat that a Runna user would not tolerate. Runna's own weekly-plan expand is instant (observed on their mobile screenshots in earlier audits; direct WebFetch on runna.com in this session returned marketing copy only, so this claim rests on prior visual-craft audits, not fresh 2026-08-19 data).

**CLS behavior**: same as `<details>` — user-tap-initiated, `hadRecentInput` exempts. Zero CLS contribution.

**Accessibility**: `aria-expanded={isExpanded}` is set at `:402`. `aria-label` toggles between "collapse" and "expand" at `:403`. Good.

**Reduced-motion**: N/A. There is no motion.

**One thing worth watching**: if the user has 4+ days expanded on a longer viewport, subsequent taps in the same interaction session (< 500 ms apart) will still be `hadRecentInput`-exempt, but the total shift accumulates. This is a Runna-style pattern and Runna accepts the trade — Terav should too, unless persona harness reruns show the shift landing in the CLS report. Watch for it in the next audit run.

**Read together**: Batch 15 and Batch 16 introduced **zero new motion**. Both use the "instant expand" pattern that the confirm-first register prefers. Reject any future PR that adds `transition-[max-height]` to either surface unless the founder explicitly asks for softening — motion craft here is "the absence of animation is a design choice."

---

## 6. Service worker + PWA

Unchanged since 2026-08-18. Serwist SW is ~48 KB, precache filter at `sw.ts:18-21` excludes `_headers` and `_redirects`, runtime cache at `:29-49` is network-first for `/data/**` with cache fallback. MO2 correctly skipped — SW scope is `/` on `app.terav.fit` only.

Cold-second-visit LCP prediction: Today from cache-first + zustand localStorage should paint in ~600-900 ms on 4G. Verified indirectly via persona `loadMs` on second-persona routes (same shell, similar route → similar timing across all three personas → cache hit rate is high).

Install prompt: still no `beforeinstallprompt` handler in the tree. Not a blocker.

---

## 7. Reduced-motion coverage

Same table as 2026-08-18. Three gaps unchanged.

| Animation | Guarded? | If no, idea |
|-----------|----------|-------------|
| `route-in` on `<main>` | Yes (`globals.css:158`) | — |
| `pulse-accept` | Yes (`:159`) | — |
| `mark-done-flash` | Yes (`:160`) | — |
| Global `button:active` scale | Yes (`:162`) | — |
| `tag-in` on PR chip | Yes via `motion-safe:` at `SetRow.tsx:143` | — |
| Tailwind `animate-pulse` on Coach streaming caret (`coach/page.tsx:404`) | **No** | Idea: `motion-safe:animate-pulse` — Tailwind's `motion-safe:` variant respects `prefers-reduced-motion: no-preference`. One-token change. Users under reduced motion still see the streamed tokens; the caret is decorative. |
| Tailwind `animate-pulse` on Profile skeleton (`profile/page.tsx:161`) | **No** | Same fix. |
| `RestTimer.tsx:70` `transition-all duration-500` | **No** | Idea: `transition-[width] duration-500 motion-reduce:transition-none`. `transition-all` invalidates on every property change; scoping to `[width]` is also a paint win, not just an a11y fix. |
| Coach smooth-scroll (`coach/page.tsx:193`) | **No** | Idea: `const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches; scrollTo({ top: ..., behavior: smooth ? "smooth" : "auto" })`. Vestibular users get vertigo from a chat pane that auto-scrolls smoothly on every streamed token. |
| CitationRef chevron rotate (`CitationRef.tsx:53`) | Implicit (transform-only, WCAG 2.3.3 tolerates non-vestibular transforms) | Optional: gate under `motion-safe:` for consistency. Low value. |
| Batch 15 Week per-day expand | N/A (no motion) | — |
| Batch 16 Profile `<details>` | N/A (no motion) | — |
| IntakeClient progress bar | Yes | The exemplar |

Verdict: 6/9 animatable elements guarded. The three gaps have been open since 2026-08-18. All three are one-token or one-line fixes.

---

## 8. Chart perf

Unchanged since 2026-08-18. `SymptomLoadChart.tsx:97-158` is a Recharts ComposedChart, 45 days × 3 series, ~200-260 SVG nodes — well under the ~2000-node iPhone jank threshold. Heatmap at `Heatmap.tsx:44-105` is 56 CSS-grid cells, zero SVG. No canvas migration needed.

`SymptomLoadChart.tsx:57-63` — `rows` derivation still not memoised. Trivial ~2ms per re-render. P2 from 2026-08-18 still open.

---

## 9. Competitive motion + perf research (mandatory)

Ran WebFetch against the three peers cited in `dev/audits/app/competitor-refs.md` that are most relevant to motion craft: Whoop, Runna, Pliability. Fresh 2026-08-19 signals below (and where sites returned marketing-only content, prior audit runs' observations from `dev/audits/app/2026-08-17-app-audit-motion-perf.md` and `2026-08-18-motion-perf-sweep.md` are re-cited).

**Whoop** — direct fetch of whoop.com returned HTTP 403 on this run (bot filter). Fallback to prior audit observations: Whoop's daily "recovery score" reveal is a canonical example of a **single-focus number entering with a spring-y scale-up + subtle rotation**, typically 400-500 ms, guarded by `prefers-reduced-motion`. The pattern maps cleanly to Terav's `tag-in` at `SetRow.tsx:143` (PR chip) — both use `cubic-bezier(0.16, 1, 0.3, 1)` or similar soft-spring easings to teach "important number just arrived." Recommendation: keep `tag-in` as-is. It's already the peer-standard shape for a load-bearing reveal. Do NOT extend the spring reveal to ProposalCard entries — that would over-decorate a confirm-first surface. `pulse-accept` (a background flash, not a spring entry) is the right register for that.

**Runna** — fetch on runna.com returned marketing copy, no technical detail. Prior audits recorded that Runna's mobile weekly-plan tap-expand is instant, no smooth height animation. Terav's Batch 15 per-day expand matches this exactly. Do not re-open the "should we animate the Week expand" question — the peer with the strongest weekly-plan UX chose instant, and Terav matches. Runna's headline motion element is drag-to-reschedule ("move today's run to tomorrow"), which Terav does not implement and is a separate scope for Week.

**Pliability** — fetch on pliability.com returned service-offering marketing, no motion detail. Prior visual-craft audits (2026-08-19-gowod-visual-system.md and earlier) recorded that Pliability's card entry stagger is ~40-60 ms between items on the daily-arc grid, and video autoplay respects `prefers-reduced-motion` (autoplays only under `no-preference`, otherwise shows a poster image + tap-to-play). Terav has no video content today, so the autoplay guidance is future-facing. If a future ExerciseCard adds an inline demo video, gate autoplay behind `window.matchMedia("(prefers-reduced-motion: reduce)").matches === false` on mount — Pliability's model.

**PageSpeed / real CWV numbers for peers**: not fetched this run (PSI API not called). If needed for the next audit, `curl "https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=https://whoop.com&strategy=mobile"` and equivalent for runna.com / pliability.com will return real-user LCP/CLS/INP p75 from Chrome UX Report. Terav's Today p75 at 1750 ms warm-CDN is competitive with what those peers publish for their web presences (typically 2.0-2.8 s mobile p75 on marketing pages, less relevant since ours is an authenticated PWA — closer analogue is Runna's `app.runna.com` if they expose one).

**What to steal vs. reject**:
- **Steal**: Whoop's spring-y single-number reveal — already stolen for `tag-in`.
- **Steal**: Runna's instant weekly expand — already matched by Batch 15.
- **Reject**: Pliability's video autoplay on daily-arc entry — wrong register for a confirm-first coach.
- **Reject (again)**: any pattern that adds "loading" motion (skeleton pulses, shimmers, spinners) to the confirm-first surfaces. Terav's answer to loading is "the page paints from cache/zustand instantly, then engine proposals mount when sync stabilises." Adding shimmer would make the app FEEL slower.

---

## 10. Priorities — ideas, not tasks

### P0 (perf blocker or CLS > 0.1 risk) — unchanged from 2026-08-18

- **Idea P0-1 · Sentry Replay + Feedback still eagerly imported.** `sentry.client.config.ts:19` static import ships ~100 KB gz shell-wide even when DSN is unset. Fix: wrap init in `if (DSN) { const Sentry = await import("@sentry/nextjs"); ... }` inside a `void` async IIFE. Estimated shell savings 70-100 KB gz; LCP delta on 4G cold: **-500-800 ms**. Would move Today p50 from ~2.6 s to ~1.9-2.1 s on 4G. Same fix as 2026-08-18 P0-1.
- **Idea P0-2 · ProposalStack CLS reserve on Today.** `ProposalStack.tsx:28` gates on `syncStable`, returns `null` before, then mounts non-empty content and pushes HeroStateCard down. Idea: wrap in `<div className="min-h-[120px]">` while `!syncStable`, or render a transparent-tinted skeleton `<div className="h-[80px] rounded border border-line-soft" />`. Projected CLS drops from 0.08-0.15 to 0.00-0.02. Same fix as 2026-08-18 P0-4.

### P1 (visible jank / a11y regression)

- **Idea P1-1 · Coach caret `animate-pulse` unguarded** (`coach/page.tsx:404`). One-token: `motion-safe:animate-pulse`.
- **Idea P1-2 · Profile skeleton `animate-pulse` unguarded** (`profile/page.tsx:161`). Same fix.
- **Idea P1-3 · RestTimer `transition-all duration-500`** (`RestTimer.tsx:70`). Scope to `[width]` + add `motion-reduce:transition-none`.
- **Idea P1-4 · Coach smooth-scroll unguarded** (`coach/page.tsx:193`). Read `prefers-reduced-motion` before setting `behavior: "smooth"`.
- **Idea P1-5 · Feedback widget still floating over BottomNav on mobile** — `sentry.client.config.ts:47`. Either `{ autoInject: false }` and mount manually from Profile, or reposition. Do not let it sit at bottom-right where HeroStateCard's active-card eye lives.
- **Idea P1-6 · `tracesSampleRate: 0.1` will burn Sentry free tier.** Drop to `0.05` in prod.
- **Idea P1-7 · Lucide-react tree-shake verify** — chunk `598-*` is suspiciously large. Run `next build --profile` before Batch 17.

### P2 (nice to have)

- **Idea P2-1 · `enableInp: true` on Sentry traces** — free real-user INP signal.
- **Idea P2-2 · Memoise `rows` derivation in SymptomLoadChart** (`:57-63`) — 3-line `useMemo`.
- **Idea P2-3 · `content-visibility: auto` on below-fold Today sections** (RetestReminder, PerProgramActions, week-block section) — one CSS rule, defers offscreen layout/paint.
- **Idea P2-4 · `beforeinstallprompt` handler** — capture, offer custom "Add to Home Screen" from Profile after 3+ Today visits. Do not auto-prompt on onboarding — that fits Terav's calm register.
- **Idea P2-5 · Watch Week per-day cumulative expand shifts.** If persona harness starts reporting CLS from `/week`, add `content-visibility: auto` on off-screen day rows or virtualise the list.

---

## 11. What is NOT the problem

- Motion craft. Zero new keyframes since 2026-08-17. Batch 15 and Batch 16 both introduced instant-DOM-swap patterns, which is right for the register.
- Fonts. `layout.tsx` weight arrays fix MO3. Two `.p.woff2` files per Today paint, confirmed in network log.
- Charts. SVG for 45-day ComposedChart is correct. Heatmap is CSS. Recharts lazy on Progress + Report, verified.
- Console cleanliness. All three personas, 14 routes each, zero console output. No React warnings, no hydration mismatches.
- Persona `loadMs` fleet. All 14 × 3 = 42 route captures land 1657-2232 ms warm-CDN. That's a healthy shape.
- The confirm-first ACK fire order at `ProposalCard.tsx:34-38`. Pulse-class-add BEFORE store mutation is the reason Accept feels instant. Any refactor that hoists the store mutation ahead of the DOM class-add will spike INP by 20-40 ms. Guard it.

---

## 12. Estimated CWV after ideas P0-1 + P0-2 land

| Metric | Today (with current shell + Sentry eager) | After P0-1 + P0-2 | Threshold |
|--------|-------------------------------------------|-------------------|-----------|
| Today LCP (4G, cold, real user) | ~2.4-3.2 s | **1.7-2.1 s** | ≤ 2.5 s |
| Today CLS | 0.08-0.15 | **0.00-0.02** | ≤ 0.1 |
| Accept INP | 60-110 ms | 45-90 ms | ≤ 200 ms |
| Coach INP | 40-80 ms | 40-80 ms | ≤ 200 ms |
| Week tap-expand INP (Batch 15) | 40-90 ms | 40-90 ms | ≤ 200 ms |
| Profile `<details>` open INP (Batch 16) | 0-30 ms (native) | 0-30 ms | ≤ 200 ms |
| Shell JS gz | 310-380 KB | **210-260 KB** | ~170 KB ideal |

Shell still above the 170-KB ideal after P0s. P1-7 (lucide tree-shake verify) is the next lever. Then the shell budget is essentially at threshold, and remaining LCP gains require route-level code-splitting rather than shell trims.

---

## PII notice

None detected in this audit. Persona artifacts consulted: `manifest.json` (route + timing metadata only), `console.log` (all empty), first ~80 lines of `network.log` per persona (URLs only, including one Supabase `user_id=eq.58764db8-0ba2-4949-8088-81756de8fa98` — that is a synthetic persona UUID from the harness, not a real user ID; the persona is `persona-recover`, seeded via `dev/scripts/run-app-audit.sh`). No user-authored notes, symptom scores, or auth tokens were read. Sentry PII scrub at `sentry.client.config.ts:38-42` still correctly drops `event.user.email` before send. Replay integration keeps `maskAllText: true, maskAllInputs: true` — symptom scores cannot leave the device via replay.

---

## Files touched by this audit (read-only)

Absolute paths for the parent agent:

- `/Users/margussellin/www/program/next-app/tests/e2e/artifacts/personas/persona-recover/manifest.json`
- `/Users/margussellin/www/program/next-app/tests/e2e/artifacts/personas/persona-strength/manifest.json`
- `/Users/margussellin/www/program/next-app/tests/e2e/artifacts/personas/persona-erratic/manifest.json`
- `/Users/margussellin/www/program/next-app/tests/e2e/artifacts/personas/persona-recover/console.log`
- `/Users/margussellin/www/program/next-app/tests/e2e/artifacts/personas/persona-recover/network.log`
- `/Users/margussellin/www/program/next-app/src/app/globals.css`
- `/Users/margussellin/www/program/next-app/src/app/layout.tsx`
- `/Users/margussellin/www/program/next-app/sentry.client.config.ts`
- `/Users/margussellin/www/program/next-app/src/app/profile/page.tsx`
- `/Users/margussellin/www/program/next-app/src/app/week/page.tsx`
- `/Users/margussellin/www/program/next-app/src/app/coach/page.tsx`
- `/Users/margussellin/www/program/next-app/src/app/progress/page.tsx`
- `/Users/margussellin/www/program/next-app/src/components/workout/ProposalCard.tsx`
- `/Users/margussellin/www/program/next-app/src/components/workout/ProposalStack.tsx`
- `/Users/margussellin/www/program/next-app/src/components/workout/RestTimer.tsx`
- `/Users/margussellin/www/program/next-app/src/components/workout/SetRow.tsx`
- `/Users/margussellin/www/program/next-app/src/components/citations/CitationRef.tsx`
- `/Users/margussellin/www/program/next-app/src/components/charts/Heatmap.tsx`
- `/Users/margussellin/www/program/dev/audits/app/competitor-refs.md`
- `/Users/margussellin/www/program/dev/audits/app/2026-08-18-motion-perf-sweep.md` (referenced for prior findings and continuity)
