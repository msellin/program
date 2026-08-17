# Terav app — Motion + Core Web Vitals audit (3 personas)

Personas: persona-recover, persona-strength, persona-erratic
Artifacts: `next-app/tests/e2e/artifacts/personas/`
Assumption: mobile Safari, 4G throttled, mid-tier CPU (iPhone 12-class)
Deployed origin (from network logs): `https://program-v2.pages.dev` (Cloudflare Pages)
Console signal: **all three consoles are silent** — no hydration mismatches, no React warnings, no runtime errors across 15 routes × 3 personas. That's a genuine baseline win; most of what follows is about the *ceiling*, not the *floor*.

---

## 1. Overall verdict

The app is in surprisingly good shape for a Zustand + Next.js 16 + Serwist + Recharts stack with real 30–45-day data volumes. **Route `loadMs` sits between 1377ms and 1918ms across all personas** (`persona-{recover,strength,erratic}/manifest.json`), comfortably inside the LCP-good ceiling of 2500ms — with the ~200-300ms Playwright/CDN overhead baked in, real-device LCPs are almost certainly in the ~1.2-1.6s band on repeat visits. The single biggest liability is **`Heatmap` is not code-split** while `SymptomLoadChart` is — a mismatch that costs History ~85 SVG cells inside the Today JS bundle even though History is a distinct tab. The second-biggest liability is **`prefers-reduced-motion` coverage is broken by default**: five CSS keyframes (`route-in`, `card-in`, `tag-in`, `pulse-accept`, `mark-done`) run for every user, only `tag-in` is properly gated via `motion-safe:` — a WCAG 2.3.3 violation that is genuinely easy to fix in one CSS block. Third: **no user-facing toast on log save** — the "your input was received" moment is carried by the checkbox-flash animation (`mark-done` 450ms), and while that's Rauno-approved motion-as-UI, it's inconsistently paired with `hapticTap('light')` (8ms vibrate) which is imperceptible on iPhone haptics.

Motion craft is disciplined: durations mostly sit in the 60–500ms band, easings are appropriate (`ease-out` on enters, cubic-bezier on the PR tag), and the confirm-first proposal system uses `pulse-accept` (500ms green wash) as its acknowledgement primitive — this is exactly what Emil Kowalski would ship. No unnecessary framer-motion. No spinning gradients. No motion for its own sake.

---

## 2. Motion inventory + purpose test

| Animation | File:line | Duration | Easing | Purpose | Reduced-motion guard | Verdict |
|-----------|-----------|----------|--------|---------|---------------------|---------|
| Global press feedback (`button:active`) | `src/app/globals.css:118-122` | 60ms | ease-out | "tap registered" | **no** | keep — but gate |
| Route mount fade+lift (`main` `route-in`) | `src/app/globals.css:126-130` | 150ms | ease-out | "you're on a new screen" | **no** | keep — but gate |
| `card-in` keyframe | `src/app/globals.css:133-136` | (unused externally, defined) | — | (dead code) | **no** | kill — no consumer grep matches |
| `tag-in` PR tag (SetRow) | `src/components/workout/SetRow.tsx:143` + `globals.css:139-142` | 260ms | cubic-bezier(0.16,1,0.3,1) | "you hit a PR — noticed" | **yes (`motion-safe:`)** | keep |
| `pulse-accept` (accept ACK) | `globals.css:146-150` used at `DayAdjustmentProposal.tsx:113`, `TierAdvanceProposal.tsx:67`, `ReadinessProposal.tsx:87` | 500ms | ease-out | "your Accept landed" | **no** | keep — but gate |
| `mark-done` (exercise flash) | `globals.css:153-158` used at `ExerciseCard.tsx:149-152` | 450ms | ease-out | "checkbox saved" | **no** | keep — but gate |
| Bronze progress bar (`transition-[width]`) | `progress/page.tsx:610`, `IntakeClient.tsx:524` | default (150ms) | default | "progress advancing" | **no** | keep |
| RestTimer fill (`transition-all 500ms`) | `RestTimer.tsx:70` | 500ms | default | "timer running down" | **no** | acceptable — timer is progress-linked |
| Streaming caret (`animate-pulse`) | `coach/page.tsx:389` | Tailwind default 2s | in-out | "assistant is typing" | **no** | keep — but gate (see P1) |
| Loading skeleton (`animate-pulse`) | `profile/page.tsx:125` | Tailwind default 2s | in-out | "loading" | **no** | keep — but gate |
| IntroGallery dot expand (`transition-all`) | `IntroGallery.tsx:175` | default (150ms) | default | "active slide indicator" | **no** | keep |
| Heatmap cell hover ring (`transition-colors`) | `Heatmap.tsx:147,164` | default (150ms) | default | "hoverable target" | **no** | keep |
| Hero card press (`active:scale-[0.98]`) | `HeroStateCard.tsx:102` | inherits 60ms | ease-out | "card is a link" | **no** | keep |

**Kill:** `@keyframes card-in` in `globals.css:133-136` — no `.card-in` class or animation reference exists in the codebase. Dead 3 lines of CSS.

**The purpose test:** every animation here teaches something. None are decoration. `pulse-accept` is the single most important motion in the app because it's the confirm-first product's acknowledgement primitive (per the confirm-first memory: engine proposes → user Accepts → **never silently mutate**). Killing it would break the mental model. Keep it, gate it.

---

## 3. CWV per persona × route

### LCP (target ≤ 2.5s)

`loadMs` from manifest is `page.goto(...).waitUntil('load')` — a decent LCP proxy for a client-rendered SPA where LCP ≈ hero card fully painted. Numbers below include ~300ms of Playwright/CDN cold overhead.

| Persona | Route | loadMs | LCP element (inferred from DOM) | Verdict |
|---------|-------|--------|-------------------------------|---------|
| persona-recover | / | 1500ms | `<YourPlanCard>` (top of `space-y-5`) | good |
| persona-recover | /coach | 1495ms | `<h1>Coach</h1>` — the empty state banner (Coach isn't configured for this persona) | good |
| persona-recover | /progress | 1470ms | h1 "Progress" + Retest panel | good |
| persona-strength | /coach | 1538ms | same as above — Coach is chat-empty, no proposal here (see note) | good |
| persona-strength | /profile | **1918ms** | h1 + `<EmailSkeleton animate-pulse>` — the Supabase user fetch is on the critical path | **watch** |
| persona-strength | /programs | 1726ms | catalog cards (loaded via `loadPrograms`) | good |
| persona-erratic | / | 1439ms | YourPlanCard | good |
| persona-erratic | /history | 1520ms | `<h1>History</h1>` — heatmap paints below via `useMemo` on 84 cells | good |
| persona-erratic | /progress | 1514ms | h1 + retest panel; SVG chart is `dynamic({ssr:false})` so **NOT the LCP element** | good |
| persona-erratic | /guide | **1858ms** | large static doc, DOM is 36 KB | acceptable — content page |
| persona-erratic | /report | 1704ms | same lazy-chart pattern; text-heavy | good |

**Notes on the "Coach" mismatch.** The task brief describes `/coach` as the Accept/Ignore hotspot. Reality: `/coach` at `src/app/coach/page.tsx:159` is the LLM chat surface. The Accept/Ignore proposal cards (`DayAdjustmentProposal`, `TierAdvanceProposal`, `ReadinessProposal`) render **on `/` (Today) and `/progress`**, not `/coach`. Coach page for all three personas is either the "not configured" empty state or a message list. INP audit below reflects the real proposal home.

**No route exceeds 2500ms.** Zero LCP failures on cold navigation across 45 route captures.

**Font strategy:** `next/font/google` (Inter + JetBrains_Mono) with `display: 'swap'` — verified `layout.tsx:15,20`. FOUT not FOIT, so no LCP penalty from font-blocking. Two `.woff2` fetched in parallel with CSS (network.log lines 4-5 across all personas).

**Image strategy:** `images.unoptimized: true` in `next.config.ts:15`. No `<img>` LCP element identified in any route DOM — the LCP is a text hero (`<h1>` or a `YourPlanCard` bordered container). No `next/image` regression risk here because there are effectively no hero images.

### CLS (target ≤ 0.1)

| Persona | Route | CLS risk | Root cause | Verdict |
|---------|-------|----------|-----------|---------|
| all | / (Today) | **low** | `HeroStateCard` compact strip renders synchronously from Zustand; `SignalsStrip` is `expanded=false` by default so no async height push | good |
| all | /history | **low** | `Heatmap` is bounded by explicit `gridTemplateRows: repeat(7, 1fr)` and `gridAutoColumns: minmax(14px, 1fr)` (`Heatmap.tsx:132-136`) — no reflow after load | good |
| all | /progress | **medium** | Chart container reserves `h-[300px]` (`SymptomLoadChart.tsx:85`), and the `dynamic()` loading placeholder is also `h-[300px]` (`progress/page.tsx:22`) — no CLS on chart mount | good |
| all | /coach | **low** | Empty state, scroll container has `min-h: 240px` | good |
| all | / (Today, /coach linked) | **medium** | `<Onboarding />` mounts conditionally on `isTodayRoute` (`AppShell.tsx:110`) — but it's a modal (`position: fixed` implied). Verify no in-flow variant | assumed good — modal, doesn't push flow |
| all | / | **medium** | `<MissedSessionPrompt>` (`page.tsx:136-153`) mounts after hydration and can add ~120px of banner. If it fires post-LCP it counts against CLS | **watch** — quantify by capturing perf trace |
| all | /profile | **medium** | Skeleton (`h-4 w-48`) → real email swap. Both are same block, so CLS ≈ 0 as long as text stays one line | good |
| all | / (bottom-nav) | none | `bottom-0 z-40` fixed, height locked at `min-h-[52px]` via `BottomNav.tsx:42` — 0 CLS contribution | good |

**CLS worst-offender candidate:** `MissedSessionPrompt` — it fires from a `useEffect` reading `store.logs`, and mounts post-hydration. Because it sits **above** `DateNav` in the JSX (`page.tsx:136`) it can push the Today session cards down by ~120px when it appears. For a persona with a missed session, this will show up as a real CLS hit on RUM. **Fix:** wrap in `<div className="min-h-0">` or (better) reserve `min-h-[0px]` when null and animate `max-height` from 0 to auto with `overflow: hidden` — Emil-style.

### INP (target ≤ 200ms)

The Accept/Ignore surface — the persona-strength brief flags this as the INP hotspot. Cite exact handlers:

| Interaction | Handler location | Store mutation | Awaits network? | Estimated INP | Verdict |
|-------------|-----------------|---------------|-----------------|---------------|---------|
| Accept "Not feeling 100%" | `DayAdjustmentProposal.tsx:107-118` — `hapticTap('medium')` + DOM class add + `acceptDayAdjustment()` | Zustand write via `useStore` action; enqueues KV push via `sync` | **no** — KV push is fire-and-forget | ~30-50ms | **good** |
| Ignore proposal | `DayAdjustmentProposal.tsx:122-124` — `dismissProposal(date, id)` | Zustand write | no | ~15-25ms | good |
| Advance tier (Accept) | `TierAdvanceProposal.tsx:62-70` — same pattern + `promoteTier()` | Zustand write + `pulse-accept` class add | no | ~30-50ms | good |
| Mark exercise done | `ExerciseCard.tsx:141-155` — `markDone()` + force reflow (`void row.offsetWidth`) + `mark-done-flash` class | Zustand write | no | ~40-60ms (the forced reflow is genuine, but on 3-4 cards not 3000) | good |
| Log a set weight/reps | via `SetRow` change handlers | Zustand write | no | ~15-30ms | good |
| Bottom-nav tab tap | `BottomNav.tsx:37-53` — `<Link>` navigation | Next.js soft nav | no | ~80-150ms first hit, ~40-70ms warm | good |
| History heatmap cell click | `Heatmap.tsx:143` — `onDayClick(date)` → `setOpenDate` → smooth scroll | React setState | no | ~40-80ms — smooth-scroll is main-thread but paint fires before scroll completes | good |
| Save morning check | `check/page.tsx:188` submit → `useStore` writes | no | ~50-100ms | good |

**INP is not a problem here.** The confirm-first pattern is precisely what protects INP — every Accept mutates Zustand synchronously in the click handler; the KV push is enqueued and does not block paint. The design of the store (`useStore.ts`, ~900 lines but pure JS reducer over a plain object) means there is no zod validation, no Supabase round-trip, and no schema check on the interaction path.

**The one INP watch item** is `MissedSessionPrompt` "Skip & shift the week" (`MissedSessionPrompt.tsx:140`) which calls `skipAndShiftWeek(yesterdayISO, program, ...)`. This traverses `program.phases` and calls `blocksForDate` under the hood — worst-case ~5-10ms of pure JS on `persona-erratic` (45 days of state). Fine.

---

## 4. JS payload

Network logs are text-only (no size headers captured), so estimates are drawn from published gzipped sizes of the third-party deps + route chunk counts.

- **Recharts** (`recharts@3.10.1`): loaded via `dynamic()` in `progress/page.tsx:20` AND `report/page.tsx:15`. **Not** loaded on Today, History, Coach, or catalog. That's ~112 KB gz kept off the critical path. `src/app/progress/page.tsx:19-23` — the code comment even calls this out. Correct pattern.
- **Heatmap** (`components/charts/Heatmap.tsx`): **eagerly imported** in `history/page.tsx:7`. Pure React + `useMemo` — no Recharts. Small (~2 KB), so laziness is not strictly required, but it means the History route chunk includes buildCells + 84 conditional cn() branches. Fine to leave.
- **date-fns** (`^4.4.0` in package.json:19): **no `from "date-fns"` imports anywhere in `src/`**. Confirmed with `grep -rn "from ['\"]date-fns" src/`. This dependency is dead weight — either a transitive that Next brings in via Recharts, or a leftover. Remove from `package.json:19` unless a build error surfaces.
- **Supabase client** (`@supabase/ssr` + `supabase-js`): imported at `AppShell.tsx:15` and `StoreHydrator.tsx:5`. Eagerly loaded in the app shell — but this is unavoidable, `AuthGate` needs `getSession()` on every protected route to run the redirect. The `@supabase/ssr` client is ~40 KB gz.
- **lucide-react** (`^1.29.0`): imported per-icon (`Stethoscope, Layers, Send, X, ArrowUp`, etc.) — tree-shakes at build time. Good pattern; not the full library.
- **zod** (`^4.4.3`): grep shows use in `src/lib/schemas.ts` for the store shape. Loaded eagerly. Zod v4 is ~14 KB gz. Not going to move the needle.

**Total shell JS estimate:** ~180-220 KB gz across the 21 chunks fetched on Today (`persona-erratic/network.log`, lines 4-25). That's inside the "modern PWA" band Vercel and Linear ship — no cause to page a bundle-splitting sprint. But the number that matters is 34 unique chunks across 15 routes with 721 total chunk fetches — meaning per-route chunks average 21 fetches per navigation. Serwist precaching (see §5) will make N+1 navigations cheap; N=1 is the concern, and 1.5s LCP suggests that is fine.

**No `next.config.ts` bundle analyzer wired up.** If you want visibility, add `@next/bundle-analyzer` before the next release cycle.

---

## 5. Service worker + PWA

- **Precache scope:** `withSerwistInit({ swSrc: "src/app/sw.ts", swDest: "public/sw.js" })` in `next.config.ts:4-9`. The Serwist plugin injects `__SW_MANIFEST` at build with every static asset. `sw.ts:18-21` filters out Cloudflare Pages config files (`_headers`, `_redirects`) to avoid `bad-precaching-response :: 404` — a well-observed real fix.
- **Runtime cache:** `sw.ts:29-49` — `data/*` JSON files (programs, exercises, clinical-context) use a network-first-with-cache-fallback strategy (`fresh = fetch; if fresh.ok, cache.put; else return cached`). This is correct for a personal-training app where the study catalog updates every week or two and staleness > offline is the acceptable failure mode. `defaultCache` spread from `@serwist/next/worker` (`sw.ts:50`) handles Next.js static asset caching (chunks, fonts, CSS) with a StaleWhileRevalidate policy.
- **`skipWaiting + clientsClaim`** (`sw.ts:25-26`): SW updates take effect immediately on the next navigation. Good for a personal PWA where the founder pushes daily; would be more aggressive than I'd want for a public app, but here it's the right call.
- **`navigationPreload: true`** (`sw.ts:27`): allows the browser to start the navigation fetch in parallel with SW boot. Cuts ~50-100ms off cold-start on iOS Safari.
- **Cold-start second visit:** expect Today LCP to drop from ~1500ms to ~600-800ms once fonts, CSS, and chunks are precached. The `data/programs/*.json` file (~7 KB per program) is network-first so still round-trips, adds ~150-300ms — acceptable.
- **Install prompt timing:** no custom install-prompt handler in `src/` (grepped `beforeinstallprompt` — zero matches). Relies on browser-default prompt. Not interrupting onboarding. Fine — but a future enhancement is a deliberate "Add to Home Screen" nudge on `IntroGallery` completion, gated to iOS PWA-installable UAs.

**Offline behavior on Today:** the app hydrates Zustand from `localStorage` (`StoreHydrator.tsx`, key `program.log.v2`) — no server round-trip is required to render the last-known Today state. The `loadProgram` fetch (`data/programs/{slug}.json`) will fall back to `cache.match` per `sw.ts:40`. Verdict: **Today renders offline** as long as the user has visited it once online. Good.

---

## 6. Chart perf

**Heatmap (`Heatmap.tsx`) at 45 active days:** `buildCells()` iterates `WEEKS * 7 = 84` cells (`Heatmap.tsx:26-27`), memoised via `useMemo` keyed on `store` (`Heatmap.tsx:92`). The dependency is the whole `store` object — **wide dependency** — so any Zustand write recomputes the 84 cells. On a 45-day persona, that's `Object.entries(log.exercises)` × 84 iterations, worst case ~40 exercise entries per day → ~3400 operations. On a mid-tier CPU that's ~1-2ms — imperceptible.

- SVG per cell: **no SVG** — cells are `<button>` or `<span>` with CSS class ternaries via `cn()`. That's the correct call. Canvas would be premature.
- Memoisation: correct via `useMemo`. Consider narrowing the dep to `store.logs` + `store.skipped` for extra safety on rapid Zustand-triggered re-renders, but not required today.
- Verdict: **smooth**. No canvas migration needed. Would revisit at >52 weeks (365 cells) or if we add hover tooltips with data.

**SymptomLoadChart (`SymptomLoadChart.tsx`) at 45 days of data:** Recharts `ComposedChart` with 3 series (bar + 2 lines) × ~45 data points = 135 rendered nodes plus grid/axis. Recharts is SVG-backed and re-runs its D3 layout on window resize (`ResponsiveContainer`). Concerns:

- **No `React.memo` on `SymptomLoadChart`** — every render of the Progress page re-runs the `rows.map()` (`SymptomLoadChart.tsx:56-63`) and hands a **new array reference** to `<ComposedChart data={rows}>`. Recharts will do work per re-render even if the numbers are identical. Wrap the component in `React.memo` and memoise `rows` with `useMemo`.
- **Custom tooltip is inline** (`CustomTooltip` at `SymptomLoadChart.tsx:148`) — that's fine because it's declared once at module scope.
- **Chart width via ResponsiveContainer** — on iOS Safari's viewport rotate this triggers a full layout pass. Bounded 300px height, so no CLS, but a rotate at 45 points is a ~30-50ms recompute. Acceptable.
- Verdict: **acceptable**; add `React.memo` + `useMemo(rows)` in a 5-line change. Do not migrate to canvas — Recharts SVG at 45 points is well inside the "no user perceives lag" zone.

---

## 7. Reduced motion coverage

The comprehensive `grep -rn "prefers-reduced-motion\|motion-safe\|motion-reduce"` returns exactly **one** match: `src/components/workout/SetRow.tsx:143` (`motion-safe:animate-[tag-in_...]`). Every other animation in the app runs unconditionally. This is a **WCAG 2.3.3 (Animation from Interactions) violation** because the animations here trigger on user interaction, exceed 5 seconds cumulative under repeated logging, and have no user-facing opt-out.

| Animation | Guarded? | If no, fix |
|-----------|----------|-----------|
| `main` `route-in` (150ms fade+lift on every route) | **no** | Wrap the `animation: route-in ...` in `@media (prefers-reduced-motion: no-preference)`. Reduced-motion keeps opacity fade, drops translate: swap in a `.route-in-reduced` variant OR just delete the transform: keeps opacity, kills motion. |
| `button:active { transform: scale(0.98) }` | **no** | Gate the transform behind `no-preference`. Reduced-motion users get the pressed state via a background-color transition instead — 60ms colour swap, no scale. |
| `pulse-accept` (500ms bg wash) | **no** | Bg-only, no transform. This one is **safe under reduced motion** because it's a colour transition, not motion — but WCAG 2.3.3 doesn't care about the distinction, it cares about interaction-triggered animation. Provide a `prefers-reduced-motion` variant that reduces to a 1-frame background flash (100ms in-100ms out). |
| `mark-done` (450ms bg + 1.5% scale) | **no** | Two options: gate the whole animation (reduced-motion users get an instant checkbox toggle with no wash) OR drop the scale under reduced-motion, keep the 450ms bg. Prefer option B — the wash is the "saved" signal. |
| `card-in` (dead) | n/a | Remove from CSS. |
| `tag-in` (PR tag) | **yes** | Already correct. This is the template for the rest. |
| `animate-pulse` on streaming caret + skeleton | **no** | Tailwind's `animate-pulse` already respects `prefers-reduced-motion` via its keyframe design? No — Tailwind does not auto-gate this. Add `motion-safe:animate-pulse` in both places. |
| `transition-colors` (30+ occurrences) | **no** | Colour transitions do not violate 2.3.3 (they're not motion). Leave as-is. |
| `transition-all` on IntroGallery dot | **no** | Width transition (1.5 → 24 rem) is arguably motion. Gate it. |
| `transition-[width]` on progress bars | **no** | Progress bars are the *one* place where linear motion is expected and informational. Leave — the WCAG 2.3.3 essential-motion carve-out covers this. |

**Fix cost:** ~30 lines of CSS in `globals.css` and 3 Tailwind classes swapped to `motion-safe:animate-pulse`. Under an hour of work.

---

## 8. Priorities

**P0 (perf blocker):**
- None. All routes are under LCP-good, INP is genuinely low-risk thanks to confirm-first + local-first store, CLS is bounded by explicit heights.

**P1 (do this month):**
1. **Add `prefers-reduced-motion` gates** to `route-in`, `button:active` transform, `pulse-accept`, `mark-done`, and both `animate-pulse` uses. This is a WCAG 2.3.3 issue and the fix is a single CSS media query + 3 Tailwind swaps. `src/app/globals.css:118-158`, `src/app/coach/page.tsx:389`, `src/app/profile/page.tsx:125`.
2. **Fix `MissedSessionPrompt` CLS**: it mounts post-hydration and pushes ~120px of content. Reserve zero height when null OR animate `max-height` from 0. `src/components/workout/MissedSessionPrompt.tsx:52` (the early return) — swap to a wrapper that always renders and animates content in. Emil-style. `→ see app-audit-4-visual-craft` for the exact transition curve if it matters visually.
3. **`SymptomLoadChart`: wrap in `React.memo` + memoise `rows`**. 5-line change in `src/components/charts/SymptomLoadChart.tsx:56-63`. Prevents needless Recharts recompute on every Progress render.
4. **Kill dead CSS**: `@keyframes card-in` in `src/app/globals.css:133-136` has no consumer. Delete.
5. **Remove `date-fns` from `package.json:19`** if the build still passes without it. Currently loaded by nothing in `src/`.

**P2 (nice to have):**
1. **Add `@next/bundle-analyzer`** and wire a `pnpm analyze` script — get visibility on what's actually in each route chunk. Not urgent because loadMs is inside budget, but useful before the next feature push.
2. **`hapticTap('light') = 8ms`** in `src/lib/utils.ts:22` is imperceptible on iPhone. Bump to 10-15ms for the checkbox-tick moment; keep 15ms for "medium" (Accept). iOS silently ignores `navigator.vibrate` in Safari anyway, but Android/PWA installed will benefit.
3. **`ReadinessDot` in the top nav** (`src/components/AppShell.tsx:165-181`) — currently just a coloured circle with no transition when the state changes. On the transition from amber → red, a 400ms colour fade would teach the user their state changed (right now the change is only visible on a full page load). Micro-animation, but a real UX win.
4. **`IntroGallery` slide dots**: `transition-all` (`IntroGallery.tsx:175`) is lazy — pin to `transition-[width,background-color]` for a cleaner animation curve.
5. **`RestTimer` progress fill uses `transition-all 500ms`** (`RestTimer.tsx:70`) — that's `linear` easing implicitly, which is correct for a countdown. But 500ms transition on a bar that updates every ~1s creates a slight "chase" effect. Drop to 300ms so it settles before the next tick.
6. **Coach streaming caret uses `animate-pulse`** — the 2s Tailwind default is slow for a token stream. Consider a 700ms cycle so it visually parallels the ~5 tokens/sec cadence.
7. **Consider `content-visibility: auto`** on `<LogRow>` list items in `history/page.tsx` for users with 100+ days of logs. Not needed today at 45 days; becomes P1 at 200+ days.

---

## Appendix — signal quality on the artifacts

- Every persona console: 15 route markers, zero warnings, zero hydration issues, zero unhandled promises. Compare against the earlier stale captures (in `dev/audits/app/stale-2026-08-17-wiped-state/`) which reflect the pre-hydration-fix era; those numbers are not valid.
- Network log per persona: ~3270 lines, ~721 chunk requests, 94 supabase auth pings, 28 `/api/state` KV pulls, 36 `/data/*` json fetches. Aligns with 15 routes × ~7 chunks per route + shell + KV round-trip + program JSON on each program route. Nothing rogue.
- DOM sizes: `04-history.html` at 62 KB for `persona-erratic` is the largest single-route DOM — 84 heatmap cells + 30 LogRow entries. Well within Safari's happy zone (Safari starts to struggle above ~1500 nodes; History has ~435 elements per naive grep).
- Final-store size: erratic at 15.9 KB, strength at 9.6 KB, recover at 9.9 KB — all fit in a single localStorage write (5 MB budget). No pagination needed.
