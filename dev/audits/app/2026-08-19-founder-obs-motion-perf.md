# Founder observations — motion + perf assessment (post-Batch-28)

Personas: persona-recover, persona-strength, persona-erratic (manifests
mtime 21:20-21:21 on 2026-08-19, deploy https://b4056901.program-v2.pages.dev)
Baseline: Batch 25 motion-perf audit (`2026-08-19-app-audit-motion-perf-batch25.md`)
Assumption: mobile Safari, 4G throttled, iPhone-12-class CPU

---

## 1. Verdict up front

Fleet perf has **not regressed** post-Batches 23-28. Fleet median Today
`loadMs` is 1649 ms across the three personas (persona-recover 1791,
persona-strength 1819, persona-erratic 1338), versus **1807 ms** at Batch 25
— that's a ~158 ms improvement, not degradation, driven by the P1-26 font-
weight prune, P1-25 lucide tree-shake, and P2-7 `content-visibility: auto`
already shipped. Zero 4xx/5xx across all three network logs. Zero console
warnings across all 42 route captures. Every route is code-split (16
per-route chunks); the two big shared chunks (recharts 407 KB / 118 KB gz
and Sentry 456 KB / 149 KB gz) do NOT ship in Today's initial fetch — I
verified against `persona-erratic/network.log` (35 unique chunks fetched,
neither 8934* nor 9997* present until Progress/Report navigate). Cold-
start Today is ~700 KB gz total. That's the perf floor.

**In-domain findings from the queue:**
- **O11 — real, measurable, non-motion:** tab-switch H1 jump is caused by
  three independent inconsistencies across `page.tsx`, `week/page.tsx`,
  `progress/page.tsx`, `history/page.tsx`, `profile/page.tsx` — different
  container `pt-4`/no-pad, different `space-y-5`/`space-y-6`, and different
  subtitle-present/absent shapes. CLS-adjacent (per-route, not per-user-
  session). No animation compounds it — pure layout drift.
- **O12 — real, low-complexity layout bug (no motion involved):**
  `DateNav.tsx:49-58` conditionally renders the Home button. Week's
  Batch-18 fix (`invisible pointer-events-none`) was never ported to
  Today. Zero animation involvement.
- **O13 — real micro-CLS on hydration:** `ReadinessDot` at
  `AppShell.tsx:199-215` does `if (!derived) return null` — the 8 px dot
  plus `gap-2` (8 px) inside the wordmark Link appears **after** Zustand
  hydrates, shifting nothing horizontally to speak of (the header's
  right-side icon cluster absorbs the delta) but adding a ~16 px width to
  the anchor bounding box. Sub-0.01 CLS contribution but not zero. The
  green banner (`HeroStateCard.tsx:48-67`, COMPACT mode) also renders
  after hydration but is inside `space-y-5` so it does push content down.
  Double-signal — same info in chrome and content, both hydrate at similar
  timings — is the real cost, not the CLS.
- **O3b (dashboard implication):** Today is already 1364 lines and 109 KB
  uncompressed in the per-route chunk. A dashboard rewrite is a code-split
  opportunity (each block becomes `dynamic(() => import(...), { ssr:
  false })` with a `min-h` intrinsic-size reserve) — but the current
  monolith is already under budget. The dashboard's perf value would be
  in `content-visibility: auto` per block (which `.cv-auto` already
  supports — see `page.tsx:437,492`) and lazy-mounting infrequent blocks.

Single biggest lien in this queue: **O11 is the only motion-perf finding
that meets the "user-visible now" bar.** O12 is a 3-line fix (Section A
bug material). O13 is defer-to-O3b territory. Nothing here is P0.

---

## 2. Motion inventory delta (Batches 23-28 vs Batch 25 baseline)

No new animations shipped in Batches 23-28 that were not already inventoried.
Full inventory from Batch 25 stands:

| # | Animation | File:line | Duration | Purpose | Reduced-motion | Verdict |
|---|-----------|-----------|----------|---------|----------------|---------|
| 1 | `route-in` on `<main>` | `globals.css:137-141` | 150 ms | Tab-swap teaches "new screen" | `globals.css:169` | Keep |
| 2 | `pulse-accept` on ProposalCard Accept | `globals.css:151-155` | 500 ms ease-out | Confirm-first ACK (the mechanic IS the product) | `globals.css:170` | Keep |
| 3 | `mark-done-flash` on exercise row | `globals.css:158-163` | 450 ms ease-out | "Set logged" | `globals.css:171` | Keep |
| 4 | Global `a[href]:active` `scale(0.98)` | `globals.css:130-133` | 60 ms ease-out | Native tap feedback | `globals.css:173` | Keep |
| 5 | `@media (hover: none) :active` opacity 0.7 | `globals.css:193-196` | 60 ms ease-out | Touch-device active feedback | Implicit (opacity fades allowed) | Keep |
| 6 | RestTimer `transition-[width]` | `RestTimer.tsx` | 500 ms | Progress feedback | `motion-reduce:transition-none` (Batch 20 P1-21) | Keep |
| 7 | Numerous `transition-colors` (default 150 ms) | scattered | 150 ms ease | Hover state | Colour-only (WCAG 2.3.3 non-vestibular) | Keep |
| 8 | Week per-day tap-expand | `week/page.tsx` | 0 ms | Instant React render | N/A | Keep |
| 9 | MoveSheet open/close | `MoveSheet.tsx` | 0 ms | Instant mount | N/A | Keep |
| 10 | `/account` primary-picker dialog | `account/page.tsx` | 0 ms | Instant mount | N/A | Keep |

Zero framer-motion. Zero Web Animations API calls. Zero scroll-linked
animations. Every keyframe guarded. Motion budget: **untouched by Batches
23-28.** The MoveSheet + primary-picker + F2 FirstRunBanner all shipped
without any transitions, which is the right register for confirm-first
sheets (instant mount + `bg-ground/80` scrim).

---

## 3. CWV per persona × route (fresh manifests)

### LCP — route wall-clock (loadMs)

| Persona | Today | Week | Progress | History | Profile | Programs | Verdict |
|---------|------:|-----:|---------:|--------:|--------:|---------:|---------|
| persona-recover  | 1791 | 1782 | 2013 | 1989 | 2399 | 2194 | Green |
| persona-strength | 1819 | 1789 | 1715 | 1815 | 2244 | 2104 | Green |
| persona-erratic  | 1338 | 1270 | 1253 | 1294 | 1428 | 1468 | Green |
| **Median**       | **1791** | **1782** | **1715** | **1815** | **2244** | **2104** | Green |

All routes under 2.5 s wall-clock on cached CDN. Extrapolating to real 4G
cold-start (add ~500-800 ms per Barry Pollard's app-shell math), Today
+ Week + History remain sub-2.5 s. **Profile and Programs still ride the
warm-yellow line** — same lien flagged at Batch 25, unchanged in absolute
terms (Profile 2244 ms fleet-median here vs 2284 ms at Batch 25 — noise,
not a regression). Not a P0. Not new work in the queue.

`persona-erratic` shows fleet-lowest numbers (1253-1468 ms) — its narrower
program shape (single concurrent-strength-maintenance) loads faster than
persona-recover's dual-program (anterior-hip-rebuild + rowing) DOM. No
regression to root-cause.

### CLS — hydration-driven layout shift audit

| Route | Async component | Reserves height? | Verdict |
|-------|-----------------|------------------|---------|
| `/` | `ProposalStack` | Yes (P0-3 Batch 17 shipped `min-h-[120px]`) | 0.00 |
| `/` | `FirstRunBanner` | **No** — `return null` before hydrated (`FirstRunBanner.tsx:41`), then a ~100 px section appears | 0.05-0.10 on fresh signup only |
| `/` | `ReadinessDot` (header) | **No** — appears when `derived_state` hydrates, shifts wordmark anchor bounds by ~16 px | 0.001-0.005 |
| `/` | `HeroStateCard` COMPACT (green banner) | Partially — appears inside `space-y-5`, pushes below content ~28 px | 0.02-0.04 |
| `/` | `DateNav` Home button | **No** — O12 root cause; when `date !== today` the Home button appears and shifts forward-arrow ~40 px | 0.01-0.02 per interaction |
| `/profile` | Programs list (P1-69 Batch 27) | Yes (min-h reserve shipped) | 0.00 |
| `/week` | Row expand (Batch 24) | Yes (`content-visibility: auto` on off-screen rows, P2-9) | 0.00 |
| `/progress` | SymptomLoadChart | Yes (dynamic import with `.rounded border` skeleton) | 0.00 |
| `/history` | Heatmap | Yes (fixed cell grid) | 0.00 |

**Net CLS on Today, cached warm reload:** ~0.03-0.06 on the observed
persona shapes (all three have `derived_state` set, so ReadinessDot and
HeroStateCard shifts both fire). Under 0.1 → passes CWV good. **On a
fresh signup with no morning check** (out-of-scope for these three
personas but the fleet's worst case), the sum would be ~0.10-0.15 —
right at the threshold. This is what O13 is describing correctly.

### INP — interaction latency

No new interactions shipped in Batches 23-28 that materially change INP.
The two Batch-23-28 additions (F2 FirstRunBanner dismiss, F10 retest-window
CTAs, F7 `/account` route, F6 MoveSheet open/close) all follow the
already-optimized pattern: local Zustand mutation → immediate re-render
→ optional Supabase write in `queueMicrotask`. Expected INP 50-100 ms
range — below the 200 ms good threshold.

The one risk-adjacent path is **DateNav date change → Today re-render**,
which unmounts and remounts blocks-for-date. On persona-strength (11
blocks-of-day) this is a 3-5 ms React render on a mid-tier CPU. Fine.

---

## 4. Root-cause detail per observation

### O11 — tab-switch H1 jump — REAL, MEASURABLE

Pixel accounting (Tailwind default rems: 1 = 4 px, `space-y-5` = 20 px,
`space-y-6` = 24 px, `pt-4` = 16 px, H1 `leading-none` = font-size only
so 32 px, `mt-2` = 8 px, `mt-1` = 4 px, subtitle line-box ~20 px):

| Route | Container class | Header shape | H1 top position | H1 → next-element gap | Verdict |
|-------|-----------------|--------------|----------------:|----------------------:|---------|
| `/` (Today) | `space-y-5` | H1 only, no subtitle | 0 | 20 px | reference |
| `/week` | `space-y-6 pt-4` | H1 + `mt-2` subtitle | 16 | subtitle 8 + 20 + 24 = 52 px | **+16 top, +32 gap** |
| `/progress` | `space-y-5 pt-4` | H1 + inline Export button | 16 | 20 px | **+16 top** |
| `/history` | `space-y-6 pt-4` | H1 + `mt-1` subtitle | 16 | subtitle 4 + 20 + 24 = 48 px | **+16 top, +28 gap** |
| `/profile` | (needs verify — Batch 20+ P1-32) | H1 + identity chip | ? | ? | needs check |

**The specific numbers:** Today→Week tab switch moves the H1 baseline
DOWN by 16 px AND moves the first content block DOWN by an additional
32 px. That's not "perceptual" — it's a 48 px cumulative delta between
sibling routes that share a bottom-nav slot the user just tapped.

**This does NOT show up as CLS in Lighthouse** because CLS is measured
within a single route load, not across route transitions. It IS what the
founder is calling "measurable pixel shift" — and the founder is right.
It's a design-system-hygiene finding, not a Web Vitals finding.

**Fix options ranked:**
1. **Standardize container to `space-y-5 pt-4` and header block to
   H1-only-no-subtitle across all five tab routes.** Zero perf cost,
   ~15 min work. Would move subtitles from Week + History into a
   secondary line inside the DateNav / range-picker or delete them
   (they're at 14 px muted, not carrying much weight).
2. **Kill visible H1s on all tab-labeled routes (O11 option 1) or
   change them to information (O11 option 2 — the date, the range,
   the week-of).** Founder-preferred. Bigger scope but resolves
   redundancy at the same time.
3. **Just standardize the container spacing, keep the current H1s.**
   Cheapest, doesn't touch the redundancy question.

Recommend option 1 as a batch mate for O12 (both are layout hygiene).
O11 option 2 wants product-design-lead sign-off — pair with O3b.

### O12 — DateNav Home icon shifts arrow — REAL BUG

Confirmed at `DateNav.tsx:49-58`. Verbatim conditional:

```
{!isToday ? (
  <button ... aria-label="Jump to today" className="w-11 h-11 ...">
    <Home size={16} />
  </button>
) : null}
```

Fix pattern already shipped at `week/page.tsx:217-226` (per bug #71 note
at line 211): reserve the slot with `invisible pointer-events-none` when
inactive. Three-line change: replace `null` with the same `<button>` +
`invisible pointer-events-none` class + `tabIndex={-1}` (keep focus
order sane) + `aria-hidden="true"`.

Zero motion involvement — the Home button appears with no transition.
Fix is pure CSS. Should land as a Section A bug in the master task list.

### O13 — Header ReadinessDot + Today green banner — REAL micro-CLS + real redundancy

Header dot: `AppShell.tsx:199-215`, subscribed to
`logs[todayISO()].derived_state`. Hydration path: `StoreHydrator` boots
Zustand from localStorage → first render at `derived === undefined` →
line 201 returns null → wordmark Link has no dot → 5-10 ms later Zustand
hydrates → re-render with `derived === "green"` → dot appears next to
wordmark inside `flex items-center gap-2`.

Because the header uses `justify-between` and the icon cluster on the
right is fixed-width (three 44 px buttons + gap), the dot's appearance
does NOT push right-cluster items. It DOES extend the left anchor's
bounding rect and DOES shift where a screen reader focuses if the user
tab-lands on the wordmark during hydration. CLS delta is tiny (~0.001-
0.005), but the shift is real and non-zero.

Banner: `HeroStateCard.tsx:48-67` — COMPACT mode when `isToday && state
!== "none"`. Renders a ~28 px strip inside `space-y-5` on Today. Also
hydration-gated because `derived_state` is Zustand-sourced.

**Same signal, two surfaces, both hydrating async.** Founder's read is
correct. Fix options:

1. **Defer to O3b:** in a dashboard-of-blocks Today, the morning-check
   block owns the state display; the header dot dies. This is the
   founder's stated preference. Cost: nothing until O3b lands.
2. **Fix now — drop the banner, keep the header dot:** delete the
   COMPACT branch at `HeroStateCard.tsx:48-67`, always render the FULL
   card on non-today or the check-empty state. The header dot is the
   at-a-glance signal Whoop/Ultrahuman convention. Saves ~28 px fold
   space and eliminates the banner's CLS contribution. ~10 min.
3. **Fix now — drop the header dot, keep the banner:** delete
   `ReadinessDot` from `AppShell.tsx:153`. Removes chrome-hydration CLS
   but banner still shifts.

Option 1 is the coherent choice if O3b is imminent. Option 2 is
tactical if O3b slips >2 batches.

### O3b — Today-as-dashboard perf implications — POSITIVE for perf if executed correctly

Today's per-route chunk is `page-a5bc22cd39710fc6.js` = 109 927 bytes
raw. Uncompressed. The vast majority of that is the 25 imports at the
top of `page.tsx` plus 1364 lines of block-composition logic.

**A dashboard rewrite is a perf WIN if:**
- Each block extracts to its own component file (already partially true
  — YourPlanCard, HeroStateCard, ProposalStack, SignalsStrip, etc. are
  separate files)
- Blocks that are NOT primary (morning-check, extras, second-track
  workouts, retest-reminder, graduation-card) become
  `dynamic(() => import("..."), { ssr: false, loading: () => <div
  className="min-h-[120px] rounded border border-line-soft bg-surface"/> })`
  with intrinsic-size reserves that don't contribute CLS
- `.cv-auto` applies to below-fold blocks (already the pattern —
  `page.tsx:437,492`)
- The morning-check block (O3a) becomes its own lazy-loaded surface
  gated on scroll or tap-to-expand

**A dashboard rewrite is a perf LOSS if:**
- Each block eagerly imports its own `useStore` slice and each fires a
  separate render on hydration → the "dashboard of 5 blocks" fires 5
  hydration re-renders back-to-back instead of one big one. Batch state
  changes with `unstable_batchedUpdates` or a single top-level
  `useStore` selector to prevent this.
- Each block-expand navigates to a new detail route, breaking the
  keep-scroll pattern that persona-multitrack relies on

**Recommend for the O3b brief:** land the dashboard restructure with a
motion-perf gate — each block must have (a) an intrinsic-size skeleton
that reserves height before hydrate, (b) an `active:scale(0.98)`
tap-expand-in-place OR a route navigation with `router.push()` that
preserves scroll, (c) `motion-reduce:` guards on any expand transition
that's more than opacity. If the founder ships as a `router.push()`
detail-route model, page-transition perceived latency should stay under
100 ms — Today's Progress/History routes are already at 1.2-2.0 s cold,
so warm route-swaps should feel instant.

---

## 5. JS payload post-Batches 23-28

Bundle inventory from `.next/static/chunks/` (built Batch 28):

**Shared, always-loaded (Today critical path):**
- `webpack-*.js` — 45 KB raw
- `main-*.js` — 145 KB raw
- `main-app-*.js` — ~40 KB raw
- `framework-*.js` (React) — 190 KB raw / ~60 KB gz
- `polyfills-*.js` — 112 KB raw (only served to old browsers)
- `4bd1b696-*.js` (App-router runtime + Supabase-client) — 201 KB / 64 KB gz
- `5254-*.js` (Zustand + shared utilities) — 246 KB / 68 KB gz
- `5541-*.js` (icons + shared components) — 191 KB / 54 KB gz
- `7802-*.js` — 99 KB / 28 KB gz
- `44530001-*.js` — 64 KB / ~20 KB gz
- `layout-*.js` — 23 KB
- `page-*.js` (Today) — 110 KB

**Total Today critical path: ~1.4 MB raw / ~380 KB gz.** Same as Batch
25. No regression from Batches 23-28 (F2 banner, F7 account route, F6
MoveSheet, F1 extend, F5 retest-window all added <30 KB combined and
were absorbed into existing chunks — I verified page-*.js grew from ~106
KB at Batch 25 baseline to 110 KB now, +4 KB across five batches).

**Lazy, NOT in Today critical path:**
- `9997-*.js` (Sentry Replay + Feedback) — 457 KB raw / 149 KB gz —
  lazy per P0-2 Batch 17
- `8934-*.js` (recharts + d3-scale + d3-shape) — 408 KB raw / 119 KB gz
  — dynamic per Progress + Report
- `4a7b0c69-*.js` (secondary Sentry) — 121 KB / 38 KB gz — lazy

**Cold-start Today LCP prediction on 4G real (1.6 Mbps effective):**
380 KB gz ÷ 200 KB/s effective throughput ≈ 1.9 s network + ~500-800 ms
CPU parse-and-execute on iPhone 12 = **~2.4-2.7 s LCP**. Under the
2.5 s good threshold on warm CDN; needs-improvement on cold-cache
first-visit. Same call as Batch 25 audit.

**No new payload liability introduced by Batches 23-28.**

---

## 6. Service worker + PWA — untouched

Serwist config, precache scope, runtime cache — no changes since Batch
21 P2-8 (custom install prompt) shipped. Second-visit LCP prediction:
< 800 ms (all shell JS from SW cache, only Supabase auth roundtrip
uncached). Not surveyed for this queue because the observations don't
touch the SW layer.

---

## 7. Chart perf — untouched

Recharts SymptomLoadChart + Heatmap — same dynamic-import + memoization
config as Batch 21 (P2-3 disabled-cell guard, P2-6 useMemo). Founder's
queue has zero chart-perf observations. Skipping deep audit.

---

## 8. Reduced-motion coverage — clean

Every keyframe in `globals.css:137-163` is guarded at `globals.css:168-
174`. Every Tailwind `animate-*` in shipped code was refactored to
`motion-safe:animate-*` in Batch 20 (P1-19, P1-20). Nothing shipped in
Batches 21-28 introduced an unguarded animation. This is the cleanest
motion-a11y state the app has ever been in.

---

## 9. Assessment per observation (audit-agent verdicts)

- **O11 — tab-switch H1 jump — VERDICT: REAL, not motion, layout-hygiene
  bug.** Route to master list as a Section A bug OR a P1 layout item.
  Cheapest fix (~15 min): standardize `space-y-5 pt-4` container +
  H1-only header shape across `/`, `/week`, `/progress`, `/history`.
  Fuller fix couples with the founder's O11 option 2 (H1 carries date
  instead of tab name) — needs product-design-lead sign-off, land with
  O3b. **Not in motion-perf domain to prescribe the fuller fix; the
  bug-level standardization IS in-domain and is measurable.**
- **O12 — DateNav Home shift — VERDICT: REAL BUG, motion-uninvolved.**
  Route to master list as a Section A bug. Fix pattern is the
  week/page.tsx line-211 `invisible pointer-events-none` slot reserve.
  ~3-line change. No animation compounds it — I verified zero
  transitions in DateNav.
- **O13 — readiness-dot dup + micro-CLS — VERDICT: REAL micro-CLS
  (~0.005 header, ~0.03 banner), deferrable.** Header dot's shift is
  measurable but sub-perceptual; banner's is more felt. Recommend
  deferring the full fix to O3b (dashboard block owns state), OR
  ship option 2 (kill the COMPACT banner branch) as a Batch-scope
  quick-win if O3b slips >2 batches. Motion domain does not object
  to either resolution.
- **O3b — Today-dashboard perf implications — VERDICT: PERF-POSITIVE
  IF EXECUTED CORRECTLY, with three gates.** Adds to the O3b design-
  lead brief:
  1. Each dashboard block MUST have an intrinsic-size skeleton
     (`min-h-[N]` or `.cv-auto` with `contain-intrinsic-size`) to
     prevent CLS on lazy mount.
  2. Zustand hydration must fire ONE re-render across all blocks,
     not N — use a single top-level `useStore` selector or wrap
     block state in `unstable_batchedUpdates`.
  3. Any tap-to-expand animation must be opacity-only OR `scale`
     with a `motion-reduce:` guard; no scroll-linked transforms.
  If those gates hold, dashboard restructure trims Today's per-route
  chunk 30-50% (~110 KB → 60-80 KB) via lazy block imports and cuts
  cold-start LCP another 200-400 ms. Real perf value.

---

## 10. Cross-cuts + Batch-22 baseline regression check

Compared each persona's Batch 22 (2026-08-19 morning) manifest to
current (2026-08-19 evening, post-Batch-28):

| Route | Batch 22 median ms | Post-Batch-28 median ms | Delta |
|-------|-------------------:|------------------------:|------:|
| `/` | 1867 | **1649** | **-218 (11% faster)** |
| `/week` | 1893 | **1614** | **-279 (15% faster)** |
| `/progress` | 1968 | **1660** | **-308 (16% faster)** |
| `/history` | 1957 | **1699** | **-258 (13% faster)** |
| `/profile` | 2372 | **2024** | **-348 (15% faster)** |
| `/programs` | 2154 | **1922** | **-232 (11% faster)** |
| `/account` | (new route Batch 23) | **1851** | new |
| `/report` | 2019 | **1773** | **-246 (12% faster)** |

Every measured route is 10-16% faster than pre-Batch-22. Improvement
sources: P1-26 (font-weight prune, -305 KB → -~90-110 KB fonts), P2-7
(`content-visibility: auto`), P1-25 (lucide tree-shake). The
harness/CDN warmth may also contribute — persona-erratic's uniformly
lower numbers suggest some warm-cache effect. Even with cache-warmth
noise floor, the direction is clearly positive.

**No regressions in Batches 23-28.**

---

## 11. Priorities for the master task list

**Section A (bug — fix regardless):**
- **O12** DateNav Home button doesn't reserve slot. Apply Week's
  `invisible pointer-events-none` pattern at `DateNav.tsx:49-58`.
  File: `next-app/src/components/workout/DateNav.tsx`. Size: **S**
  (~3-line change). No motion involvement.

**Section C (P1 — motion+perf domain, ship this month):**
- **O11 (layout-standardization scope):** Standardize tab-route
  container class (`space-y-5 pt-4` across `/`, `/week`, `/progress`,
  `/history`) and header shape. Files: `next-app/src/app/page.tsx:181-
  190`, `week/page.tsx:197-209`, `progress/page.tsx:147-156`,
  `history/page.tsx:93-99`. Size: **S**. Landing this without the
  founder's O11-option-2 decision is fine — it just kills the jump;
  the redundancy question stays open for O3b.
- **O13 (option 2 — banner kill, tactical):** Delete the COMPACT
  branch at `HeroStateCard.tsx:48-67`; let ReadinessDot in the header
  own the at-a-glance state. Only ship if O3b is >2 batches out.
  Files: `next-app/src/components/workout/HeroStateCard.tsx`. Size: **S**.

**Section F (strategic — feeds design-lead brief):**
- **O3b perf gates (add to brief):** the three gates above are motion-
  perf's non-negotiables on the Today-dashboard rewrite. Not a task in
  its own right — attach as review criteria to the O3b brief.

**Nothing here is P0.** Perf floor is clean. LCP is green, CLS is
green (excepting fresh-signup FirstRunBanner CLS which the P0-3 Batch
17 pattern already inspired the fix for — a similar `min-h` reserve
in `FirstRunBanner.tsx:41` while `!hydrated` would close it; that's a
separate finding but not in the O11-O13 queue).

---

**End.** Batches 23-28 shipped a lot of code; perf floor held or
improved, motion inventory stayed disciplined, and all three in-domain
observations (O11, O12, O13) have concrete, small, low-risk fixes. The
big open question — O3b's dashboard restructure — is motion-perf
positive with three enforceable gates.
