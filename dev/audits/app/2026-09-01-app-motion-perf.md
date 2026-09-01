# Terav app — Motion + Core Web Vitals audit (2026-09-01)

**Personas audited:** persona-recover, persona-strength, persona-erratic (mandated) + persona-pullup, persona-pullup-fast, persona-muscleup, persona-engine-block2 (new today, never audited)
**Artifacts:** `next-app/tests/e2e/artifacts/personas/` — captured `2026-09-01T09:48–09:58Z`, all 21 bundles regenerated
**Baseline:** `dev/audits/app/2026-08-21-app-motion-perf-post-batch36.md` §3.1 and §9
**Assumption:** authenticated PWA, mobile Safari, 4G-throttled, mid-tier CPU. `loadMs` is the harness's `waitUntil: 'networkidle'` — an LCP-conservative proxy on an unthrottled runner. Real 4G devices trend 300–800 ms slower on this architecture (see §3.1 caveat).

---

## 1. Overall verdict

**LCP proxy improved substantially and every route is under gate; the architecture that produces those numbers is the liability.** Today dropped 351/340/43 ms on the three tracked personas (1640→1289, 1718→1378, 1590→1547) and `/profile` — the slowest route in the app for three audit rounds — fell 854–1009 ms to 1382–1489 ms. All four new personas land Today at 1200–1288 ms, the fastest cohort ever measured. Console logs across all seven personas are **completely empty** — 26 route sections, zero errors, zero warnings, zero hydration mismatches. The `/events` 404 that was P2 last round is gone.

The liability is that `next-app/out/*/index.html` ships **8 bytes of body text — the string `Loading…` — on every route except `/legal/*`**. There is no server-rendered content anywhere in the authenticated app. LCP on Today is the `<h1>` program name at `text-[32px]` (`components/ui/WorkoutHero.tsx`), and it cannot paint until ~302 KB gz of JavaScript across 18 chunks downloads, parses and executes; React hydrates; a Supabase session resolves; and three JSON files fetch (two of them **twice** — see §4). The proof is in the same manifest: `/legal/disclaimer`, the one route that server-renders its content, is the fastest route in every single persona at 1036–1098 ms, while `/evidence` — a static bibliography that ships as `Loading…` and fetches a 56 KB `citations.json` client-side behind the auth gate — is the **slowest route in every single persona at 1659–1834 ms**. Same content class, 600–750 ms apart, and the difference is entirely `"use client"`.

CLS is effectively zero on Today (no images anywhere in `src/`, no async content displacing static content, chart `loading:` fallbacks reserve exact pixel heights). INP is still **unmeasured** — the harness records `loadMs` and nothing else, which was last round's P1 and remains open. I profiled the two handlers most likely to spike and they don't (§3.3).

Motion craft has one real regression: `globals.css:230-236` reduced-motion block covers `button:active` and `[role="button"]:active` but **not `a[href]:active`**, while `globals.css:191-194` applies `transform: scale(0.98)` to every anchor in the app. Last round claimed 100% WCAG 2.3.3 coverage. It is not 100% — every bottom-nav tab, every card-link, and `HeroStateCard` still scale under `prefers-reduced-motion: reduce`.

---

## 2. Motion inventory + purpose test

Full re-enumeration. `grep` across `next-app/src/` for `@keyframes`, `animation:`, `transition`, `animate-`, `motion-safe:`, `motion-reduce:` — 51 hits, 20 distinct animations. framer-motion is absent (correctly — do not add it).

| Animation | File:line | Duration | Easing | What the user learns | Reduced-motion guard | Verdict |
|---|---|---|---|---|---|---|
| Route mount fade | `app/globals.css:199-203` | 150 ms | ease-out | "new screen, not a page load" | yes — `:231` `main { animation: none }` | keep |
| Button press scale | `app/globals.css:191-194` | 60 ms | ease-out | "the tap registered" | **partial** — `:235` covers `button` + `[role=button]`, **not `a[href]`** | **P1 fix** |
| Touch active opacity dip | `app/globals.css:255-258` | 60 ms | ease-out | tap feedback on `hover:none` | opacity-only, inherently safe | keep |
| Pulse-accept (proposal Accept) | `app/globals.css:213-217` | 500 ms | ease-out | "your Accept landed" | yes — `:232` | keep — confirm-first is meaningless without an ack |
| Mark-done row wash | `app/globals.css:220-225` | 450 ms | ease-out | "that set is logged" | yes — `:233` | keep |
| PR tag-in | `components/workout/SetRow.tsx:159` | 260 ms | `cubic-bezier(0.16,1,0.3,1)` | "you hit a PR" | yes — `motion-safe:` | keep; carry-over P2 on the one-off curve |
| DashboardBlock expand | `components/DashboardBlock.tsx:165` | 200 ms | ease-out | reveal without content jump | yes — `motion-reduce:transition-none` | keep |
| InfoSheet backdrop | `components/InfoSheet.tsx:103` | 200 ms | ease-out | modal enter | yes | keep |
| InfoSheet panel slide | `components/InfoSheet.tsx:114-118` | 300 ms | `var(--ease-out-terav)` | iOS sheet physics | yes | keep — the app's best motion moment |
| ArcProgressBar fill | `components/ui/ArcProgressBar.tsx:83-86` | 400 ms | `var(--ease-out-terav)` | "you moved this many weeks" | yes | keep |
| CategoryTileGrid tap | `components/ui/CategoryTileGrid.tsx:80` | 100 ms | ease-out | tile tap feedback | yes | keep |
| Programs catalog tile tap | `app/programs/page.tsx:252` | 100 ms | ease-out | tile tap feedback | yes | keep |
| Intake progress bar | `app/programs/[slug]/intake/IntakeClient.tsx:911` | 150 ms (Tailwind default) | default | question-step progress | yes | keep; carry-over P2 (unnamed duration) |
| RestTimer bar shrink | `components/workout/RestTimer.tsx:96` | 500 ms | default | rest countdown | yes | carry-over P2 — outside the 100/200/300/400 band, and it animates `width` (§6) |
| Skeleton pulse (Profile) | `app/profile/page.tsx:122` | 2 s | ease-in-out | loading | yes — `motion-safe:animate-pulse` | keep |
| **RestTakeover bar** | `components/session/RestTakeover.tsx:174` | **unspecified** | **default** | rest countdown | **NO** | **P1 — new, unguarded** |
| **Settings toggle knob** | `app/settings/page.tsx:188` | default 150 ms | default | switch state | **NO** (`transition-transform`) | **P2** |
| **Plan chevron rotate** | `app/plan/page.tsx:627` | default | default | expand/collapse | **NO** | **P2** |
| **BeliefsSection chevrons** | `components/profile/BeliefsSection.tsx:87,160` | default | default | expand/collapse | **NO** | **P2** |
| **CitationRef chevron** | `components/citations/CitationRef.tsx:53` | default | default | expand/collapse | **NO** | **P2** |
| **HeroStateCard press** | `components/workout/HeroStateCard.tsx:196` | 60 ms (inherited) | ease-out | tap feedback | **NO** — it's a `<Link>`, see the `a[href]` gap | **P1** |

**Purpose test:** 20 animations, every one answers "what does the user learn." No spinning gradients, no idle motion, no decorative parallax, no scroll-linked effects at all (`grep` for `addEventListener("scroll")`, `onScroll`, `IntersectionObserver`, `scroll-timeline` across `src/` returns **zero hits** — there is nothing to get wrong here, which is the right answer). Subtract-first verdict: nothing needs killing. The 260 ms `tag-in` curve and the 500 ms `RestTimer` are the only two outside the token band, both defensible, both already on the P2 list from 2026-08-21.

**Sticky / compositor:** `BottomNav.tsx:44` is `fixed bottom-0 z-40` with an **opaque** `bg-surface-2` and no `backdrop-filter`. That's the cheap version — Safari promotes fixed layers automatically on scroll and there is no per-frame blur to repaint. No `translateZ(0)` hack needed; don't add one. The two `backdrop-blur-sm` sites are both inside the intake wizard (`IntakeClient.tsx:890, 1477`) on a short-scroll surface — acceptable, but they are the only two blur-on-scroll surfaces in the app and worth watching if intake ever gets longer.

---

## 3. CWV per persona × route

### 3.1 LCP proxy (`loadMs`)

LCP element on Today is the `<h1>` program name — confirmed from the captured DOM (`persona-*/dom/01-day.html`, single `text-[32px]` node, one `<h1>`, program name text). **There are zero images in the app** — `grep -rn "next/image\|<img"` across `src/` returns nothing — so `priority`, `unoptimized`, and image LCP are all non-issues by construction. Fonts are `next/font/google` Inter (400/500/600) + JetBrains Mono (400/500) with `display: swap`, self-hosted, and only two `.woff2` files are requested on Today. FOIT-safe.

| Persona | Today `/` | vs 2026-08-21 | `/plan` | `/record` | `/programs` | `/profile` | vs 2026-08-21 | `/evidence` | `/legal/disclaimer` |
|---|---|---|---|---|---|---|---|---|---|
| persona-recover | **1289** | −351 | 1327 | 1419 | 1392 | **1448** | −892 | 1721 | 1082 |
| persona-strength | **1378** | −340 | 1268 | 1380 | 1342 | **1470** | −854 | 1636 | 1072 |
| persona-erratic | **1547** | −43 | 1265 | 1329 | 1330 | **1382** | −1009 | 1671 | 1036 |
| persona-pullup *(new)* | **1254** | — | 1305 | 1312 | 1381 | 1451 | — | 1834 | 1060 |
| persona-pullup-fast *(new)* | **1208** | — | 1265 | 1367 | 1424 | 1462 | — | 1660 | 1062 |
| persona-muscleup *(new)* | **1288** | — | 1321 | 1460 | 1415 | 1482 | — | 1769 | 1066 |
| persona-engine-block2 *(new)* | **1200** | — | 1265 | 1396 | **1709** | 1489 | — | 1659 | 1098 |

**Every one of 182 route captures across the 7 personas is under 2100 ms.** The single value above 2000 ms in the entire set is `persona-engine-block2 /week` at **2035 ms** — a client-side redirect route (`/week` → `/plan`), n=1, no corroborating signal in any other persona (1245–1353 ms). Noise, not a regression. Log it, don't chase it.

**Today for the four new personas is fine and needs no further work.** persona-engine-block2 (1200 ms) is the fastest Today in the set despite carrying the largest program JSON in the catalog (`engine-builder-block-2.json`, 70.6 KB raw / 19.4 KB gz) — the program payload is not on the LCP path in any meaningful way.

**Programs catalog: 5 → 8 cards is a non-event.** Median `/programs` across personas is 1381 ms; the manifest grew to 15.3 KB raw / 4.8 KB gz with 9 entries (8 public + 1 personal), and `programManifestSchema.parse` measures **0.04 ms**. Rendered DOM is 361 nodes on every persona (identical, as expected — the catalog is user-independent). The 1709 ms on engine-block2 is a single-capture outlier against a 1330–1424 ms band.

**Caveat on all of the above.** These are unthrottled `networkidle` captures. On a real 4G / mid-tier device the chain in §1 — 302 KB gz JS parse+exec, then session resolve, then a three-deep data fetch — will put Today at 2600–3400 ms LCP, i.e. **outside the 2500 ms "good" threshold**. The harness numbers are healthy; the architecture is not. This is the gap that needs field data, not more lab data (§8).

### 3.2 CLS

| Surface | Async content? | Reserved? | Estimated CLS |
|---|---|---|---|
| Today `/` — WorkoutHero + h1 | no (renders once, post-hydration) | n/a | **0** |
| Today — ArcProgressBar fill | width transition inside `overflow-hidden`, `min-h-[8px]` rail | yes | **0** |
| Today — Sparkline `n<2` | 20 px reserved wrapper (`Sparkline.tsx:53-57`) | yes | **0** |
| Today — `RunSlotCard` (new today) | wrapped in `cv-auto` (`TodaySession.tsx:478,579`, `DaySession.tsx:182`) — `content-visibility: auto` **without a `contain-intrinsic-size`** | **no** | see below |
| `/record` — SymptomLoadChart | `next/dynamic` with `loading: <div className="h-[220px]">` | **yes, exact px** | **0** |
| `/record` — CutC curve | `loading: <div className="h-[200px]">` | **yes, exact px** | **0** |
| `/record` — WeeklyHeatmap | `contentVisibility: auto` + `containIntrinsicSize: ${weeks.length*20}px 200px` (`WeeklyHeatmap.tsx:90-93`) | yes | **0** |
| `/programs` — 8-card catalog | `Loading…` → full page (`programs/page.tsx:146`) | no, but nothing below it to displace | ~0, LCP problem not CLS |
| Toast / announcer | `#app-status` is `sr-only`, absolutely out of flow (`AppShell.tsx:186`) | n/a | **0** — confirmed |
| BottomNav | fixed height at load, `main` reserves `calc(64px + safe-area + 1rem)` | yes | **0** |

**One new CLS exposure.** `globals.css:270` defines `.cv-auto { content-visibility: auto; }` with **no `contain-intrinsic-size`**. `WeeklyHeatmap` sets its own intrinsic size inline and is safe; `.cv-auto` as used on `RunSlotCard` is not. An element with `content-visibility: auto` and no intrinsic size collapses to zero height until it enters the viewport, then jumps to its real height. `RunSlotCard` is an 877-line form — several hundred pixels. It sits below the fold on Today so the shift is scroll-triggered, and scroll-triggered shifts within 500 ms of user input are excluded from CLS; but on a short Today (rest day, new user) it can land above the fold and it *will* count. Give `.cv-auto` a `contain-intrinsic-size: auto 400px`. Cheap, one line.

### 3.3 INP — profiled, not guessed

The harness still writes no INP (`manifest.json` has `route`, `slug`, `status`, `loadMs`, `viewports` — nothing else; `flows/results.json` records pass/fail and control coverage, no timings). So I profiled the two handlers most likely to spike, against the real persona stores.

| Interaction | Handler | Measured / inspected | Verdict |
|---|---|---|---|
| Coach **Accept** | `lib/proposals/useProposalActions.ts:30-36` | `.pulse-accept` class is applied to the DOM node **before** the store mutation (line 33), `playConfirm()` is synthesized Web Audio (no fetch, no decode), and the KV push is on a 2 s debounce (`lib/persistence/postgres-adapter.ts:127`). **No Supabase round-trip in the click path.** | pass |
| Post-Accept re-derive | `selectProposals(store, program, date)` re-runs 6 selectors over the full log | **measured**: 0.02 ms (erratic, 45 logs), 0.07 ms (strength, 30), 0.01 ms (recover, 30), 0.04 ms (engine-block2, 35) on an M-series runner. Call it ≤0.5 ms on a mid-tier phone. | pass — **and this closes a plausible-sounding worry**: `DaySession.tsx:242` calls `selectProposals` **unmemoized** on every render while `ProposalStack.tsx:31` memoizes it. That asymmetry is real hygiene debt, but at 0.07 ms it is **not** an INP problem. P2, not P0. |
| Log-a-set | `SetView` → store commit → debounced push | same debounce path; no zod validation on blur, no network in handler | pass |
| Today cold data parse | `exercises.json` 136 KB raw | **measured**: `JSON.parse` 1.24 ms + `exercisesFileSchema.parse` 1.23 ms = ~2.5 ms desktop, ~10 ms mid-tier mobile — **×2 because it is fetched twice** (§4) | ~20 ms of avoidable main-thread work; the network duplication matters more than the CPU |
| BottomNav tap | `<Link>` client nav; all four hrefs already carry trailing slashes | no redirect on tab switch | pass |

**INP verdict: no evidence of a problem, and no evidence of its absence.** Every claim above is code inspection plus microbenchmark, not field data. See §8 P1.

---

## 4. JS payload + the request waterfall

Measured by gzipping every `<script>` referenced in `next-app/out/*/index.html`.

| Route | scripts | JS gz | CSS gz | body text in static HTML |
|---|---|---|---|---|
| `/` (Today) | 18 | **341.0 KB** | 13.6 KB | **8 bytes** |
| `/plan` | 15 | 303.7 KB | 13.6 KB | 8 bytes |
| `/record` | 16 | 315.3 KB | 13.6 KB | 8 bytes |
| `/programs` | 15 | 300.9 KB | 13.6 KB | 8 bytes |
| `/profile` | 15 | 301.9 KB | 13.6 KB | 8 bytes |
| `/evidence` | 15 | 295.8 KB | 13.6 KB | 8 bytes |
| `/legal/privacy` | — | — | 13.6 KB | **4175 bytes** |

Subtract `polyfills-*.js` (38.5 KB gz, served `noModule` — modern Safari skips it) and Today is **302.5 KB gz of JavaScript to render one `<h1>`**. Alex Russell's mobile budget for an app shell is ~150–200 KB gz. We are ~1.5–2× over.

**Third-party attribution (corrects last round's §4.2):**

- **Recharts** — `8838.ddc1c62b6aacfc25.js`, **110.8 KB gz**. Correctly dynamic (`app/record/page.tsx:46`, `app/report/page.tsx:18`, `components/record/CutCProgramCurveCard.tsx:36`). Network logs confirm it is requested on **exactly three route captures** — `/record` and the two redirects that land there (`/history`, `/progress`) — and nowhere else. Not on Today. Clean.
- **Sentry** — `9997.5f744b6e5fe8e340.js`, **149.4 KB gz**, the largest chunk in the build. The 2026-08-21 audit labelled this "Supabase + related, dynamic — auth flows." It is not; it contains `Sentry`, `captureException`, `browserTracing`, `replay`. It is loaded from `sentry.client.config.ts` inside an `if (DSN)` guard. **It is never requested in production** — zero hits across all 21 persona network logs, zero requests to any `*.ingest.sentry.io`. `NEXT_PUBLIC_SENTRY_DSN` is unset in the deployed build. Good news for the bundle; **bad news for §8** — the app has Sentry's INP + web-vitals tracking configured and switched off, which is exactly the field data missing from every audit since Batch 30.
- **Supabase** — `5541-37a58dda46069495.js`, **52.3 KB gz**, eager on Today, on the critical path.
- **date-fns** — not a dependency, zero imports. Nothing to tree-shake.
- **lucide-react** — `optimizePackageImports` set in `next.config.ts:24`. Correct.
- **zod** — bundled eagerly (`5602-*.js`, 19.5 KB gz shared with lucide). Runs on every JSON load.

**The Today waterfall, from `persona-erratic/network.log` §`01-day`** — 93 requests, of which:

1. `GET /` → **`GET /` (again)** — trailing-slash redirect. This fires on **every one of the 26 routes** (`trailingSlash: true` + harness navigating without the slash). It inflates every `loadMs` in §3.1 by one round-trip. Internal `<Link>` hrefs already carry trailing slashes so real in-app navigation is unaffected, but any external deep link, any share URL, and `start_url: "/"` in `public/manifest.json` are exposed. Interpretation note for future audits: **subtract ~50–150 ms from every number in §3.1** before comparing against real-user data.
2. 2 × `.woff2`, 1 × `.css`, 18 × JS chunk.
3. **Then**, and only then, the data layer: `manifest.json`, `exercises.json`, `concurrent-strength-maintenance.json`, **`concurrent-strength-maintenance.json` again**, **`exercises.json` again**.
4. `GET supabase.co/rest/v1/user_states` — the KV pull.
5. `GET supabase.co/auth/v1/user` — see below.
6. 4 × `HEAD` + 4 × `__next._tree.txt` + 4 × `__next.__PAGE__.txt` — BottomNav `<Link>` prefetch for all four tabs, ~12 requests firing *during* the data fetch window.

**Two concrete defects in that waterfall:**

**(a) `lib/data-loader.ts` has no in-flight promise dedup.** `loadProgram` (`:38-50`) and `loadExercises` (`:68-88`) cache the *result*, not the *promise*. Two components mount in the same tick, both miss the cache, both fetch. `exercises.json` is 136 KB raw / 23.4 KB gz — downloading and zod-parsing it twice on 4G is ~150–250 ms of pure waste on the LCP path. Fix is four lines: cache the promise.

**(b) `useIsSuperAdmin()` fires a network round-trip on every Day render — and today's change spread it further.** `lib/super-admin.ts:25` calls `supabase.auth.getUser()`, which is a **network** call to `/auth/v1/user`, to decide whether to show an admin-only FIT-import button gated on four hardcoded email addresses. Its only caller on Today is `RunSlotCard.tsx:34`. Today's change — rest-day screens now mount a full `RunSlotCard` where previously nothing rendered (`DaySession.tsx:182-183`) — means this round-trip now also fires on every rest day and inside `OffPlanSheet.tsx:77`. The email is already in the session `AuthGate` resolved; `getSession()` is a local read and answers the same question with zero network. This is the single cheapest LCP win available.

**(c) Auth is resolved three times independently, plus a fourth network call.** `app/layout.tsx:82` renders `<AuthGate>` (→ `useSession()` → `createClient()` + `getSession()` + `onAuthStateChange`), which wraps `<AppShell>`, which contains `AuthGatedShell` (`components/AppShell.tsx:76-95` — its own `createClient()` + `getSession()` + `onAuthStateChange`), alongside `StoreHydrator` (a third `createClient()` + `getSession()`). Four `createBrowserClient()` instances, three independent gates, three `onAuthStateChange` subscriptions. Consolidating to one context provider removes a full render-blocking gate from the Today path.

**(d) `app/layout.tsx:3,4,6` import `BottomNav`, `StoreHydrator` and `RestTimerHost` and never render them** — `AppShell` renders all three. Dead imports of `"use client"` modules from a server component feed the client reference manifest. Byte impact unverified; cleanup is free.

---

## 5. Service worker + PWA

- **Precache scope** (`src/app/sw.ts:25-27`, emitted to `public/sw.js`): **111 entries, 3.94 MB** on disk. Composition: 66 `.js`, 17 `.json` (the program catalog — good, programs are available offline), 13 `.woff2`, 6 `.png`, 6 `.svg`, 1 `.css`. `_headers` / `_redirects` correctly filtered (`sw.ts:19-23`).
- **Notably absent from precache: the HTML shells.** Navigations fall through to `defaultCache`, which is Serwist's NetworkFirst-for-pages. With `navigationPreload: true` that's reasonable, but it means a genuinely offline cold start depends on the runtime page cache having been populated, not on precache.
- **Runtime cache** (`sw.ts:30-48`): `/data/*` network-first with cache fallback and a 503 JSON terminal fallback. Correct — program updates land, offline reads still work.
- **Second-visit prediction:** with 3.94 MB precached, the 302 KB gz shell is served from Cache Storage. The remaining critical path is the auth resolve + the `user_states` pull, both network. Estimate **900–1300 ms** warm LCP. The harness does not do warm re-visits so this is unverified.
- **Install prompt:** `grep -rn "beforeinstallprompt" src/` → 0 hits. Browser default, fires on the browser's own heuristic, never interrupts onboarding. Fine — leave it.

**On the specced on-device video analysis (`dev/active/video-analysis/`) — a view, since you asked.** Two constraints from what exists today:

1. **Cache budget.** Current Cache Storage footprint is ~3.94 MB. A 5.5–29 MB MediaPipe model takes the origin to **9.4–33 MB**, a 2.4×–8.4× increase. WebKit does not evict individual Cache Storage entries — it evicts **per-origin**. Under pressure or after 7 days of non-use of a non-installed PWA, iOS drops the whole origin's storage, which today costs a re-download of a 302 KB shell and tomorrow costs a re-download of the shell *plus* a 29 MB model on cellular. **Do not put the model in the same cache as the app shell.** Open a separate named cache (`caches.open("pose-model-v1")`), never precache it, fetch it on explicit user opt-in with a size-and-network disclosure, and give it its own eviction/cleanup path. Take the 5.5 MB model, not the 29 MB one, unless the accuracy delta is demonstrable on Terav's actual movements.
2. **Main-thread contention.** A Web Worker is the right call and the app has zero workers today, so there's no contention to inherit. But the WASM *instantiation* is not free on the main thread, and the video frames have to cross the boundary — use `OffscreenCanvas` + `ImageBitmap` transfer, not `postMessage` of pixel arrays. The bigger risk is that the app's current shell is already 302 KB gz; if any part of the MediaPipe JS glue lands in the shell bundle rather than behind a `next/dynamic` boundary on the video route only, Today's LCP regresses for every user who never opens the feature. Gate it exactly the way Recharts is gated (`app/record/page.tsx:46`) — that pattern is proven in this codebase and the network logs confirm it holds.

---

## 6. Chart + timer render cost

- **`WeeklyHeatmap`** — no per-cell stagger (deleted in Batch 36 and still deleted), `content-visibility: auto` + `containIntrinsicSize` at `WeeklyHeatmap.tsx:90-93`, cells memoized on `store` (`Heatmap.tsx:109`). One-paint render. **Smooth.**
- **`/record` DOM** is 651–783 nodes across personas — persona-erratic at 783 with 45 days of data is the densest surface in the app and sits just under Lighthouse's 800-element advisory. 39 `<svg>`, 55 `<path>`, 2 `<rect>`. Watch it; don't act on it.
- **Canvas migration: no.** SVG is correct at this density. Canvas pays off past ~500 cells or with 60 fps interactive charts. Neither applies.
- **Recharts memoization:** the *chart* isn't memoized but the *chunk* is deferred and the *data* is memoized upstream. Fine.

**The one real paint-cost finding is the rest timer, not the charts.** Four progress bars animate `width` — `RestTimer.tsx:96` (500 ms), `RestTakeover.tsx:174` (unspecified), `ArcProgressBar.tsx:83` (400 ms), `IntakeClient.tsx:911`. `width` is layout-triggering; it cannot be composited. For `ArcProgressBar` (fires once) that's irrelevant. For `RestTakeover` — which is `fixed inset-0`, i.e. **full-screen**, and ticks every second for up to 5 minutes — it's ~300 layout+paint passes over a full-viewport element. Switch both timer bars to `transform: scaleX()` with `transform-origin: left`; it's compositor-only and the visual result is identical.

**And the timer is wrong in a way Hevy already solved.** `RestTimer.tsx:38` is `setInterval(() => setElapsed(e => e + 1), 1000)` — a *tick counter*, not a wall-clock deadline. iOS Safari throttles and then suspends timers in backgrounded tabs and in a locked-screen PWA. A user who pockets the phone during a 3-minute rest comes back to a timer that has *under-counted* — it says 40 s remaining when 20 s have actually elapsed. Hevy's answer to exactly this problem is an iOS Live Activity (see §7); a PWA can't do Live Activities, but it can do the correct version of the underlying fix: store `startedAt = Date.now()` in the timer store, derive `elapsed = (Date.now() - startedAt) / 1000` on each tick, and resync on `visibilitychange`. Same code size, correct under backgrounding.

---

## 7. Competitive motion + perf research

Peer set per `dev/audits/app/competitor-refs.md`. **PageSpeed Insights could not be run** — the public PSI API returned `Quota exceeded for quota metric 'Queries'` for all three attempted origins, so there are no measured peer CWV numbers in this round. Everything below is qualitative and is an **idea, not an action item**.

**Whoop** — the 925studios teardown characterizes Whoop's motion as three-tier progressive disclosure (glanceable score → trend → biometric deep-dive) where "transitions between tiers use smooth animations that maintain spatial context, so users always know where they are in the data hierarchy," with the Recovery score set at ~72 pt. Motion serves *spatial continuity*, not delight.
**Steal:** the spatial-continuity contract. Terav's `/record` is a three-tier surface (heatmap → curve → metric detail) and today those tiers swap with a flat 150 ms `main` fade that teaches nothing about hierarchy. A shared-element or directional transition on drill-down would teach "you went deeper, and here's back."
**Reject:** the 72 pt hero number. Whoop compresses dozens of biometrics into one score and animates its reveal because the score *is* the product. Terav's product is a proposal you Accept. A dramatic number reveal on Today would be exactly the "engine decided for you" register the confirm-first mechanic exists to avoid.

**Hevy** — built "from the ground up around the logging experience"; recent releases add haptics throughout and, most relevantly, an **iOS Live Activity** for the rest timer so a user can complete sets and watch rest tick down without unlocking the phone.
**Steal:** the diagnosis, not the implementation. Hevy shipped a Live Activity because *the rest timer must survive backgrounding* — which is precisely the bug at `RestTimer.tsx:38` (§6). Terav already has haptics (`hapticTap`) and audio (`playConfirm`) on the Accept path, which is the right density. Fix the wall-clock derivation; that's the 90% of the value a PWA can capture. Do not chase Live Activities — a PWA cannot have them and the workaround (a Notification with `requireInteraction`) is worse than nothing.
**Reject:** Hevy's auto-fill-previous-and-go pacing. Terav's whole positioning is confirm-first; instant auto-advance is the opposite mechanic.

**Runna** — 2026 releases add per-workout "Workout Briefings" and a mileage graph; the screensdesign teardown flags a **26-step onboarding** as a friction point and suggests a progress indicator.
**Steal:** nothing motion-wise; the useful transfer is that Terav's intake already has the progress bar Runna is criticized for lacking (`IntakeClient.tsx:911`). Keep it, and give it the 400 ms `--ease-out-terav` treatment so it matches `ArcProgressBar` (already a standing P2).
**Reject:** the 26-step onboarding pattern itself, and the "gentle progression, fear of injury" framing Runna's 2026 beginner plans lean into. Terav's rehab-not-fragile positioning is deliberate — the record shows this user's exercise tolerance improved under load, and softening the motion register to match Runna's beginner tone would contradict the data model.

**Pliability** — 2026 reviews consistently describe it as "doesn't feel like a workout app… someone thought about what it's actually like to be stiff, tired, or stressed," with big cards and aggressive whitespace; latest release notes are generic UI/UX + performance.
**Steal:** nothing concrete this round — no motion documentation surfaced. The one transferable idea is that Pliability's calm register comes from *whitespace and card scale*, not from animation, which supports the subtract-first stance in §2.
**Reject:** the "cleaner is better" pull generally. Terav's proposals carry citations and log signals; hiding them behind Pliability-scale whitespace would break the "every change cites a study" promise. → out of scope here, see `app-audit-N-visual-craft`.

**Net:** the peer set produces exactly two actionable motion ideas — Whoop's spatial-continuity contract for `/record` drill-down, and Hevy's rest-timer-survives-backgrounding diagnosis. Both are already in the priorities below. No peer suggests adding animation; two suggest fixing what's there.

---

## 8. Reduced-motion coverage

| Animation | Guarded? | Fix if not |
|---|---|---|
| Route fade, pulse-accept, mark-done | yes (`globals.css:230-234`) | — |
| `button:active` scale | yes (`globals.css:235`) | — |
| **`a[href]:active` scale** | **NO** — `globals.css:191-194` applies it, `:235` doesn't reset it | add `a[href]:active` to the `:235` selector list. One token. |
| **`HeroStateCard` `active:scale-[0.98]`** | **NO** — it's a `<Link>` (`HeroStateCard.tsx:194-197`) | covered by the fix above, or add `motion-reduce:transition-none` inline |
| **`RestTakeover` bar** (`RestTakeover.tsx:174`) | **NO** | add `duration-500 motion-reduce:transition-none`, and switch to `scaleX` (§6) |
| **Settings toggle knob** (`settings/page.tsx:188`) | **NO** | `motion-reduce:transition-none` |
| **Plan chevron** (`plan/page.tsx:627`) | **NO** | `motion-reduce:transition-none` |
| **BeliefsSection chevrons** (`BeliefsSection.tsx:87,160`) | **NO** | `motion-reduce:transition-none` |
| **CitationRef chevron** (`CitationRef.tsx:53`) | **NO** | `motion-reduce:transition-none` |
| InfoSheet ×2, ArcProgressBar, DashboardBlock, RestTimer, CategoryTileGrid, Programs tile, Intake bar, SetRow tag-in, Profile skeleton | yes | — |

**Coverage is 12/20, not 20/20.** The 2026-08-21 claim of 100% was correct for the *primitives layer* and missed the base-CSS anchor rule plus six chevron/knob `transition-transform` sites. Reduced motion here should be "no transform, keep the colour change" — every one of these fixes is a single Tailwind variant except the CSS one.

---

## 9. Priorities

**P0 — none.** No route exceeds gate, no console errors across 7 personas, no CLS source on Today, no INP evidence of a problem. Nothing here blocks a ship.

**P1 — this month**

1. **Close the `a[href]` reduced-motion hole.** `globals.css:235` — add `a[href]:active` to the reset. WCAG 2.3.3, one line, affects every nav tab and card-link in the app.
2. **Guard `RestTakeover.tsx:174`** — `duration-500 motion-reduce:transition-none`, and move both timer bars from `width` to `transform: scaleX()`. Removes ~300 full-viewport layout+paint passes per rest.
3. **Wall-clock the rest timer.** `RestTimer.tsx:38` — derive `elapsed` from a stored `Date.now()` start, resync on `visibilitychange`. Currently under-counts whenever iOS backgrounds the PWA, which is every time the user pockets the phone mid-rest.
4. **Kill the `getUser()` round-trip on Today.** `lib/super-admin.ts:25` → `getSession()`. Today's `RunSlotCard`-on-rest-days change spread this network call to more surfaces; it costs one Supabase RTT on the LCP path to gate a four-email admin button.
5. **Dedup in-flight fetches in `lib/data-loader.ts`.** Cache the promise, not the result (`:38-50`, `:68-88`). `exercises.json` (136 KB) and the active program JSON are each fetched **twice** on every Today cold load.
6. **Turn on field CWV.** `sentry.client.config.ts` is fully configured — `tracesSampleRate: 0.05`, INP tracking on by default in `@sentry/nextjs` v8+ — and `NEXT_PUBLIC_SENTRY_DSN` is **unset in production** (zero Sentry requests across all 21 persona network logs). Every INP verdict in this audit and the last three is code inspection. Set the DSN, or extend the harness to write a `PerformanceObserver` INP sample into `manifest.json`. This has been P1 since Batch 30; the finding that the tooling is already built and switched off should make it a one-line fix.

**P2 — nice to have**

7. **Server-render what can be server-rendered.** `/evidence` is the slowest route in all 7 personas (1659–1834 ms) and is a static bibliography; `/legal/disclaimer` renders the same content class as a server component and is the fastest (1036–1098 ms). `/guide`, `/evidence`, and the `/programs` catalog shell are all candidates. This is the highest-ceiling item in the audit and the reason it's P2 rather than P1 is scope, not value.
8. **Add `contain-intrinsic-size` to `.cv-auto`** (`globals.css:270`). `content-visibility: auto` without an intrinsic size on an 877-line form is a latent CLS source.
9. **Consolidate the three auth gates** (`layout.tsx:82` `AuthGate` + `AppShell.tsx:76` `AuthGatedShell` + `StoreHydrator`) into one provider. Four `createBrowserClient()` instances, three `onAuthStateChange` subscriptions, two render-blocking gates.
10. **Memoize `selectProposals` at `DaySession.tsx:242`** to match `ProposalStack.tsx:31`. Measured at 0.01–0.07 ms, so this is consistency debt, not perf — recorded so nobody re-flags it as a suspected INP spike.
11. **Remove dead imports** in `app/layout.tsx:3,4,6` (`BottomNav`, `StoreHydrator`, `RestTimerHost` — all rendered by `AppShell`).
12. Carry-over from 2026-08-21, still open: `RestTimer` 500 ms is outside the 100/200/300/400 band; `IntakeClient.tsx:911` has an unnamed default duration; `SetRow.tsx:159` `cubic-bezier(0.16,1,0.3,1)` is the only non-canonical easing in the app.
13. **Whoop's spatial-continuity idea** (§7) — a directional transition on `/record` tier drill-down. Idea only; needs a design call before it's a task.

**Closed since 2026-08-21:** `/events` 404 (route gone from harness, console clean across all 7 personas); `/profile` slowness (2340 → 1448 ms); `9997-*.js` mislabelled as Supabase (it's Sentry, and it never ships).

---

*Audit generated 2026-09-01 against persona bundles captured `2026-09-01T09:48–09:58Z`. Bundle sizes via `gzip -c` on `next-app/out/_next/static/`. `selectProposals`, `exercisesFileSchema.parse` and `programManifestSchema.parse` timings measured with a temporary vitest harness against each persona's `final-store.json` and the live `public/data/` payloads; harness removed after measurement. PageSpeed Insights unavailable this round (API quota), so §7 carries no measured peer CWV.*
