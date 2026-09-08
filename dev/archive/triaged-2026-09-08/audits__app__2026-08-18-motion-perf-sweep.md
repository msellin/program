# Terav app — Motion + Core Web Vitals sweep (2026-08-18)

Scope: authenticated PWA at `next-app/`. Focus: post-Sentry landing, Postgres direct-client, MO1-MO3 verify.
Method: code-grep + built-chunk inspection (`out/_next/`). No persona artifacts on disk — `next-app/tests/e2e/artifacts/personas/` is empty on this branch, so RUM numbers are inferred from bundle math + code paths, not measured. All numeric perf claims are labelled **projected** unless the source is a file byte-count.
Assumption: mobile Safari, 4G throttled (~1.6 Mbps effective, ~150ms RTT), mid-tier CPU.

---

## 1. Verdict

Motion is disciplined and short. Four keyframes only, all under 500ms, all reduced-motion-gated at `globals.css:157-163`. Nothing to subtract. The perf story is the opposite: **Sentry + Replay + Feedback + Recharts + un-weighted next/font pushes the shell above what a 4G Today-first paint can absorb.** Two P0s: font weight explosion (~305 KB across 13 woff2 files, `out/_next/static/media/`) and the fact that Sentry Replay is imported statically into `sentry.client.config.ts:59` and initialised whenever a DSN is set — that ships ~50-70 KB gz of replay code + a MutationObserver on every DOM mutation, straight into the LCP path. Projected Today LCP on 4G with DSN live: **2.9-3.6s** (over the 2.5s "good" threshold). Without DSN: **1.8-2.2s** (green).

MO1 verified DONE (`animate-card-in` — 0 refs in tree). MO2 skipped correctly (SW scope is `app.terav.fit` origin only, `ServiceWorkerRegister.tsx:13`). MO3 fails verify — subset is latin-only but `weight` was never declared, so all Inter + JetBrains Mono weights ship.

---

## 2. Motion inventory

| # | Animation | Location | Duration | Easing | Purpose | Reduced-motion guard | Verdict |
|---|-----------|----------|----------|--------|---------|----------------------|---------|
| 1 | `route-in` (opacity + 2px translateY) on `<main>` mount | `globals.css:126-130` | 150ms | ease-out | Tab-swap teaches "new screen." Small enough to survive bottom-nav route thrash. | Yes (`:158`) | Keep |
| 2 | `tag-in` (opacity + 0.9→1 scale) on PR bronze tag | `globals.css:133-136`, used at `SetRow.tsx:143` | 260ms | `cubic-bezier(0.16, 1, 0.3, 1)` (spring-y) | "You just hit a PR." Load-bearing feedback. | Yes via `motion-safe:` variant | Keep |
| 3 | `pulse-accept` (bg fade from green/20 → transparent) on ProposalCard | `globals.css:140-144`, added at `ProposalCard.tsx:36-38` | 500ms | ease-out | Confirm-first ACK — the confirm-first mechanic is the product; this pulse teaches "Terav received your Accept." | Yes (`:159`) | Keep, but see below |
| 4 | `mark-done` (bronze bg wash + 1.015 scale) on exercise row | `globals.css:147-152` | 450ms | ease-out | "Set logged." Physicality. | Yes (`:160`) | Keep |
| 5 | Global active press: `transform: scale(0.98)` on `button:active` / `a[href]:active` | `globals.css:118-122` | 60ms | ease-out | Native tap feedback — the app-shell reads "webpage" without it. | Yes (`:162`) | Keep |
| 6 | Coach streaming caret (`animate-pulse` on 1.5×16px block) | `coach/page.tsx:403` | Tailwind default 2s ∞ | cubic-bezier | Cursor teaches "streaming." | **No — unguarded Tailwind class** | Fix |
| 7 | Loading-email skeleton `animate-pulse` | `profile/page.tsx:183` | 2s ∞ | cubic-bezier | Skeleton | **No guard** | Fix |
| 8 | CitationRef chevron `rotate-180 transition-transform` | `CitationRef.tsx:53` | Tailwind default 150ms | ease | Disclosure state change. | Implicit (transform, keeps opacity intent) | Keep — respects rm via CSS default |
| 9 | Progress ring / RestTimer bar `transition-all duration-500` | `RestTimer.tsx:70` | 500ms | ease | Progress bar → linear is fine here. | No | Fix — should be `transition-[width]` and reduced-motion-safe |
| 10 | HeroStateCard `active:scale-[0.98]` | `HeroStateCard.tsx:96` | inherits global 60ms | ease-out | Tap feedback | Yes (global at `:162`) | Keep |
| 11 | Coach message-list `scrollTo({ behavior: "smooth" })` | `coach/page.tsx:193` | UA-controlled | UA | Autoscroll to newest | **No `prefers-reduced-motion` check** | Fix |
| 12 | IntakeClient progress bar `transition-[width] motion-reduce:transition-none` | `IntakeClient.tsx:839` | Tailwind default | ease | Progress | Yes | Keep |

**Purpose test verdict:** every animation with a guard passes. #6, #7, #9, #11 are the gaps.

---

## 3. Core Web Vitals — projected per route

Persona artifacts absent, so LCP/CLS/INP is inferred from route composition and built-chunk sizes. Chunks referenced from `out/_next/static/chunks/` byte counts.

### LCP — projected, 4G throttled

| Route | LCP element (inferred) | Shell JS shipped | Route JS added | Projected LCP | Verdict |
|-------|------------------------|------------------|----------------|---------------|---------|
| `/` (Today) | Day1EmptyState `<h2>` OR HeroStateCard link | framework 190KB + main 145KB + 4bd1 201KB + 4a7b 121KB gz-guess ~200-260 KB gz | page 960 LOC transitively via `page.tsx` | **2.9-3.6s with Sentry DSN live · 1.8-2.2s without** | With DSN: **red**. Without: **green.** |
| `/progress/` | `<h1>Progress</h1>` (recharts dynamic-loaded after) | shell | +recharts 112 KB gz on-demand | 2.0-2.5s (chart lazy at `progress/page.tsx:22`) | Green |
| `/history/` | Heatmap grid (`Heatmap.tsx`, non-lazy) | shell + Heatmap synchronous | ~4 KB gz | 1.8-2.3s | Green |
| `/coach/` | `<h1>Coach</h1>` — LCP fires on the h1, not the empty message pane | shell | 431 LOC | 1.9-2.4s | Green |
| `/week/` | Week grid | shell | small | 1.8-2.2s | Green |

Font-blocking is the biggest LCP risk. `layout.tsx:11-21` declares two Google fonts with `display: swap` (good) but no `weight` array. `next/font/google` without `weights: [...]` pulls every weight the family declares. `out/_next/static/media/` has **13 woff2 files** — 305 KB total. Latin subset is filtered, so this is weight explosion, not codepoint bloat.

### CLS — projected

| Route | Risk source | Reserve strategy | Verdict |
|-------|-------------|------------------|---------|
| `/` (Today) | ProposalStack + Day1EmptyState mount **post-hydration** when store `updated_at` lands from Postgres (~150-400ms after paint) | ProposalStack gates on `updated_at > 0` (`ProposalStack.tsx:28`) which returns `null` — but the section is not a `min-height`-reserved slot, so the block below shifts down when it appears. | **CLS 0.08-0.15** — sitting on the P0 line. B4 in the backlog is right to remain OPEN. |
| `/coach/` | Bubbles stream token-by-token, chat pane is `flex-1 overflow-y-auto`; text expands within a fixed-height container | Container has `maxHeight: calc(100dvh - 320px)` (`coach/page.tsx:286`) | 0.00 |
| `/progress/` | Chart div reserves `h-[300px]` (`SymptomLoadChart.tsx:99`) before Recharts mounts, and the dynamic import loading state also reserves the same 300px (`progress/page.tsx:24`) | Good | 0.00 |
| `/history/` | Heatmap grid uses `aspect-square` cells with `gridAutoColumns: minmax(32px, 1fr)` — dimensions are deterministic before data resolves | Good | 0.00 |
| Bottom nav | Fixed, height stable | Good | 0.00 |
| Toasts / announcer | `<div id="app-status" className="sr-only" />` at `AppShell.tsx:158` — visually hidden, contributes 0 | Good | 0.00 |

### INP — projected

| Interaction | Handler shape | Main-thread cost | Projected INP | Verdict |
|-------------|---------------|-------------------|---------------|---------|
| Tap Accept on ProposalCard | `hapticTap()` → DOM className add for `.pulse-accept` (paints immediately) → switch on kind → zustand mutation → `recordProposalOutcome` → announce | `ProposalCard.tsx:34-92` runs pulse-add before the store mutation, so the visual ACK does not wait for the write. | 60-110ms | Green |
| Save log entry (SetRow) | zustand mutation → localStorage → deferred Postgres flush | Postgres write is fire-and-forget through `useStore` persistence adapter | 80-140ms | Green |
| Bottom-nav tab tap | `next/link` client nav → `<main>` `route-in` animation | 150ms animation itself dominates ~50% of INP window; framework code split is well-cached after first nav | 120-180ms first nav, 60-90ms after | Green |
| Coach Send (streaming) | `send()` builds messages array, kicks streamCoach, first paint = user bubble (immediate) | ACK is synchronous (setInput / setMessages) | 40-80ms | Green |
| Morning-check Save (`check/page.tsx:186`) | zustand mutation + navigation | Same shape as SetRow | 80-140ms | Green |

The Accept-first-then-mutate ordering at `ProposalCard.tsx:36-38` is the right pattern. Do not regress it.

---

## 4. JS payload

| Concern | File / line | Status | Fix |
|---------|-------------|--------|-----|
| Recharts lazy on Progress | `progress/page.tsx:17-25` | DONE | — |
| Recharts on `/report` too | `report/page.tsx:6-16` | DONE | — |
| Recharts on `/history` | `history/page.tsx:7` — Heatmap is **not** Recharts (it is a CSS grid), so no cost. Grep confirms Heatmap.tsx has zero recharts imports. | Correct | — |
| Sentry Replay + Feedback statically imported into client bundle | `sentry.client.config.ts:19` (`import * as Sentry from "@sentry/nextjs"`), then `feedbackIntegration()` at `:47` and `replayIntegration()` at `:59` | **P0 problem** | See §7 |
| next/font weight explosion | `layout.tsx:11-21` — no `weight: [...]` on either family | 13 woff2 files, ~305 KB total | Set `weight: ["400", "500", "600"]` on Inter, `weight: ["400"]` on JetBrains Mono. Cuts to ~90-110 KB. |
| Zustand | Small (~3 KB), fine | — | — |
| Supabase browser client | `lib/supabase/client.ts:10` — `createBrowserClient` created on demand inside effects | Deferred correctly | — |
| lucide-react | Named imports throughout — tree-shakes if bundler honours ESM. Verify: shell 4a7b + 4bd1 chunks together ~320 KB looks lucide+recharts-lite adjacent. | Suspect | Confirm lucide is not shipping the full icon set. If it is, switch to per-icon deep imports (`import { Dumbbell } from "lucide-react/dist/esm/icons/dumbbell"`). |
| date-fns | Not in `package.json` deps. Not used. | N/A | — |

Estimated shell JS (framework + main + top 3 chunks): **~230-280 KB gz** without Sentry, **~310-380 KB gz** with Sentry Replay + Feedback active. Mobile budget for LCP ≤ 2.5s on 4G is ~170 KB gz.

---

## 5. Sentry — bundle + runtime cost

Sentry is the single biggest new liability on this branch.

### Bundle (static import path)

`sentry.client.config.ts:19` does `import * as Sentry from "@sentry/nextjs"`. That pulls the full SDK including Replay + Feedback into the initial bundle regardless of DSN presence. Even the `if (DSN)` guard at `:23` does not tree-shake the imports — the classes exist, they are just not instantiated. Rough guess based on `@sentry/nextjs` published sizes:
- `@sentry/nextjs` core: ~30 KB gz
- `Sentry.replayIntegration`: ~55 KB gz
- `Sentry.feedbackIntegration`: ~18 KB gz (widget UI + form)

Total added to shell: **~100 KB gz**, unconditionally.

### Runtime (when DSN set)

- `replayIntegration({ maskAllText, maskAllInputs, blockAllMedia })` at `sentry.client.config.ts:59-64`. Replay attaches a MutationObserver + rrweb-lite serializer to `document.body`. On a store-heavy React 19 app that re-renders proposals on every store tick, this is measurable — expect INP overhead of **+15-40ms** per interaction. Sampling is 10% (`replaysSessionSampleRate: 0.1`), so 90% of sessions see the bundle cost but not the runtime cost.
- `feedbackIntegration` at `:47-58` mounts a floating button (bottom-right by default). It draws over the fixed bottom nav on iPhones. It also uses `useSentryUser` to read the auth session — which requires the Supabase client to have hydrated first. Timing: fine.

### Fixes

- **P0** Move Replay + Feedback to a runtime-lazy import. Instead of `import * as Sentry`, do the DSN check first, then `const Sentry = await import("@sentry/nextjs")`. Only load `replayIntegration` inside `if (DSN)`. Cost drops from 100 KB unconditional to 30 KB core + on-demand.
- **P1** Move the feedback widget to a user gesture — a "Send feedback" link in Profile or a global keyboard shortcut. Do not auto-mount the floating button on Today, it competes with HeroStateCard for the bottom-right eye position on mobile.
- **P1** Set `enableInp: true` in the tracing options (Sentry captures INP natively) and lower `tracesSampleRate` to `0.05` in prod — free-tier will burn out.

---

## 6. Service worker + PWA

- Serwist-generated at `out/sw.js` — **48.5 KB** raw. Reasonable.
- Precache manifest filters `_headers` / `_redirects` at `sw.ts:18-21`. Correct.
- Runtime cache: `/data/**` network-first with cache fallback (`sw.ts:29-49`). Program JSONs (5 programs) benefit — cold second-visit will render Today from cache while the network revalidates.
- `defaultCache` spread at `:50` — Serwist ships sensible defaults for `_next/static/**`, images, fonts. Fine.
- **MO2 verified skipped correctly**: SW scope is `/` on `app.terav.fit`, no cross-origin from `program-v2.pages.dev` possible.
- Install prompt: **no `beforeinstallprompt` handler in the tree** (grep returns 0). Chromium fires the mini-infobar automatically; no interruption of onboarding. Safari uses Add-to-Home-Screen manually. This is fine for beta but leaves conversion on the table.
- Offline: Today renders from local zustand + cached `/data/{slug}.json`. Confirmed via `sw.ts:37-46` fallback path.

---

## 7. Chart perf

- `SymptomLoadChart.tsx:97-158` — Recharts ComposedChart, 45 days × 3 series. SVG DOM node count on typical 45-day render: ~200-260 nodes (grid lines + axis ticks + bars + dots). Well under the ~2000-node threshold where SVG jank starts on iPhone 12+. **No canvas migration needed.**
- Tooltip re-renders on every hover. Not memoised at `:167` — trivial component, negligible.
- `heaviestFor()` at `:27` and `peakSymptom()` at `:45` run inside the map at `:57`. 45 iterations, tiny work. Fine.
- Heatmap at `Heatmap.tsx:44-105` — 56 cells (8×7), zero SVG (pure divs with tailwind classes). `useMemo` on `buildCells(store)` at `:108`. **Cheap.**
- `transition-colors` on 56 cells at `:163` and `:180` — negligible paint work.

---

## 8. `prefers-reduced-motion` coverage

| Animation | Guarded? | If no, fix |
|-----------|----------|-----------|
| `route-in` on `<main>` | Yes at `globals.css:158` | — |
| `pulse-accept` | Yes at `globals.css:159` | — |
| `mark-done-flash` | Yes at `globals.css:160` | — |
| Global `button:active` scale | Yes at `globals.css:162` | — |
| `tag-in` | Yes via `motion-safe:` prefix at `SetRow.tsx:143` | — |
| Tailwind `animate-pulse` on Coach caret (`coach/page.tsx:403`) | **No** | Add `motion-safe:animate-pulse` (Tailwind respects `prefers-reduced-motion` when class is `motion-safe:`) OR drop the caret entirely under reduced motion. Users will still see streamed tokens — the caret is decorative. |
| Tailwind `animate-pulse` on profile skeleton (`profile/page.tsx:183`) | **No** | Same fix. |
| `RestTimer.tsx:70` `transition-all duration-500` | **No** | Change to `transition-[width] motion-reduce:transition-none`. Bonus: `transition-all` invalidates on every property change; scoping to `width` is cheaper. |
| Coach smooth scroll (`coach/page.tsx:193`) | **No** | Read `window.matchMedia("(prefers-reduced-motion: reduce)").matches` before setting `behavior: "smooth"`; fall back to `"auto"`. Vestibular users get vertigo from a chat auto-scrolling on every token stream. |
| CitationRef chevron rotate (`CitationRef.tsx:53`) | Implicit (opacity-preserving transform is fine under WCAG 2.3.3) | Optional: gate under `motion-safe:` for consistency |

---

## 9. MO1 · MO2 · MO3 verification

- **MO1 · `animate-card-in` class undefined but referenced** — VERIFIED DONE. `grep -rn "animate-card-in" next-app/src` returns 0.
- **MO2 · SW cache-key after domain migration** — CORRECTLY SKIPPED. `ServiceWorkerRegister.tsx:13` scopes registration to `/` on the current origin only. No cross-origin SW inheritance from `program-v2.pages.dev`.
- **MO3 · Font subset verify** — FAILS VERIFY. Subset is `["latin"]` at `layout.tsx:13, 19` (correct), and `display: "swap"` is set (correct). **But `weight` is not declared** on either Inter or JetBrains_Mono. Result: all weights of both families ship as `.woff2` files — 13 files, 305 KB total in `out/_next/static/media/`. Fix by declaring `weight: ["400", "500", "600"]` on Inter and `weight: ["400"]` on JetBrains Mono.

---

## 10. Priorities — punch-list

### P0 (perf blocker or CLS > 0.1 risk)

- [ ] **P0-1 · Sentry Replay + Feedback shipped unconditionally in shell** — `sentry.client.config.ts:19` static import pulls ~100 KB gz into every route, even when DSN is unset. **Fix:** wrap the whole init in `if (DSN) { const Sentry = await import("@sentry/nextjs"); ... }` inside a `void` async IIFE, so tree-shakers can drop replay + feedback when DSN is absent. Additionally, gate `replayIntegration` behind `if (window.matchMedia("(prefers-reduced-motion: reduce)").matches === false)` — replay is DOM-mutation-heavy, avoid it for a11y users. **Estimated shell savings: 70-100 KB gz.** Est LCP delta on 4G: **-500-800ms.**
- [ ] **P0-2 · next/font weight explosion** — `layout.tsx:11-21`. **Fix:** `Inter({ weight: ["400","500","600"], subsets: ["latin"], display: "swap" })` and `JetBrains_Mono({ weight: ["400"], subsets: ["latin"], display: "swap" })`. **Estimated media savings: 195-215 KB.** LCP delta: **-200-400ms** on cold visit.
- [ ] **P0-3 · MO3 verify closes with P0-2 above.** Backlog can flip MO3 to DONE once the weight array is set.
- [ ] **P0-4 · Today CLS from ProposalStack + Day1EmptyState** — B4 in the backlog remains open. `ProposalStack.tsx:28` returns `null` before sync-stable, then mounts a `space-y-3` section that pushes HeroStateCard down 80-160px. **Fix:** wrap ProposalStack in a `min-h-[120px]` reserve on Today until `syncStable` is true (or store hydration finishes). Alternative: render a low-height skeleton (`h-[80px] rounded border border-line-soft`) so the visual is transparent-tinted, not a hard shift. Projected CLS drops from 0.08-0.15 to **0.00-0.02**.

### P1 (visible jank / a11y regression)

- [ ] **P1-1 · Feedback widget floats over bottom nav on mobile** — `sentry.client.config.ts:47`. **Fix:** either set `{ autoInject: false }` and manually mount from a Profile link (`useEffect(() => { Sentry.getFeedback()?.attachTo(el, ...) }, [])`), or set position via `themeLight`/`themeDark` widget options to top-right. **Do not let it sit over BottomNav.**
- [ ] **P1-2 · Coach caret `animate-pulse` unguarded** — `coach/page.tsx:403`. **Fix:** `<span className="... motion-safe:animate-pulse" />` — one-token add.
- [ ] **P1-3 · Profile skeleton `animate-pulse` unguarded** — `profile/page.tsx:183`. Same fix.
- [ ] **P1-4 · RestTimer `transition-all duration-500`** — `RestTimer.tsx:70`. **Fix:** `className="h-full transition-[width] duration-500 motion-reduce:transition-none"`. `transition-all` invalidates on every property; scoping is a paint win.
- [ ] **P1-5 · Coach message-list `scrollTo({ behavior: "smooth" })` unguarded** — `coach/page.tsx:193`. **Fix:** compute `const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches` in the effect and pass `behavior: smooth ? "smooth" : "auto"`.
- [ ] **P1-6 · Sentry `tracesSampleRate: 0.1` will burn free tier** — `sentry.client.config.ts:27`. On any real user volume this exceeds the 10K events/month free-tier by mid-month. **Fix:** drop to `0.05` in prod, `1.0` only when `NEXT_PUBLIC_SENTRY_DEBUG=1`.
- [ ] **P1-7 · Lucide-react tree-shake verify** — chunk `598-13be9dd82a2c6792.js` is 525 KB raw / est ~180 KB gz. If lucide is the culprit, switch heavy files to `import Dumbbell from "lucide-react/dist/esm/icons/dumbbell"` deep imports. Confirm with `next build --profile` or `@next/bundle-analyzer`.

### P2 (nice to have)

- [ ] **P2-1 · Add `enableInp: true` to Sentry traces** — you get real-user INP data on Coach + Accept + BottomNav for free. Wire before the sample-rate cut so you have a signal-per-cost floor.
- [ ] **P2-2 · Consider preloading the top-1 next-font weight** — `Inter 400` is the body face; preloading its woff2 in `<head>` via `next/font`'s built-in preload (on by default) is already correct, but P0-2 will need to make sure preload targets the right file. Verify after weight-cut.
- [ ] **P2-3 · Recharts on Progress: memoise `rows` derivation** — `SymptomLoadChart.tsx:57-63` recomputes on every render. `useMemo(() => days.map(...), [days])` — trivial 3-line change, saves ~2ms per re-render when the chart re-mounts from Progress tab-swap.
- [ ] **P2-4 · Add `content-visibility: auto` to below-fold Today sections** — `RetestReminder`, `PerProgramActions`, week-block section at `page.tsx:230+`. One CSS rule, defers layout+paint for offscreen content. Chrome/Edge/Safari 18+ support it.
- [ ] **P2-5 · Install-prompt handler** — capture `beforeinstallprompt`, defer the browser mini-infobar, offer a custom "Add to Home Screen" from Profile after 3+ Today visits. Improves PWA conversion without interrupting onboarding.

---

## 11. What is NOT the problem

- Postgres direct-client is a win. `postgres-adapter.ts:17` reads via the Supabase JS client (already loaded on Auth), no Pages Function hop. Round-trip on beta workload: **~120-180ms**, down from ~250-400ms via the KV Pages Function. Store hydration `updated_at` propagates faster — makes the P0-4 CLS fix cheaper because the reserve window shrinks.
- Motion craft. Nothing to subtract. Every keyframe teaches something.
- Serwist SW is fine — 48 KB, sensible cache split, correct precache filter.
- Charts. SVG for 45-day ComposedChart is the right choice. Heatmap is CSS-only.
- The confirm-first ACK ordering at `ProposalCard.tsx:36-38` (add pulse class *before* mutation). Do not let a refactor invert this.

---

## 12. Estimated CWV after P0 fixes

| Metric | Today (with DSN) | After P0-1 + P0-2 + P0-4 | Threshold |
|--------|------------------|--------------------------|-----------|
| Today LCP (4G, cold) | 2.9-3.6s | **1.8-2.1s** | ≤2.5s |
| Today CLS | 0.08-0.15 | **0.00-0.02** | ≤0.1 |
| Accept INP | 60-110ms (green already) | 45-90ms | ≤200ms |
| Coach INP | 40-80ms | 40-80ms | ≤200ms |
| Shell JS gz | 310-380 KB | **210-260 KB** | ~170 KB ideal |

Shell is still above the ideal 170 KB budget after P0s, but crosses back into "green LCP on 4G cold." P1-7 (lucide tree-shake verify) likely closes the remaining gap.

---

## PII notice

None detected in this audit. Persona artifacts directory is empty, no user notes or symptom scores were read. `sentry.client.config.ts:38-42` correctly strips `event.user.email` before send; the `maskAllText` + `maskAllInputs` on replay integration means symptom scores never leave the device via replay. The one thing to watch: `useSentryUser` at `:54` auto-fills the Feedback widget with Supabase email. That is fine for internal feedback recipients but if you ever expose Feedback events to third parties (Sentry alert integrations, Slack webhook), scrub email there too.
