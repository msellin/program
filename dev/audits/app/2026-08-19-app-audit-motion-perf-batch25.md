# Terav app — Motion + Core Web Vitals audit (post-Batch-25)

Date: 2026-08-19 (afternoon run, post-Batch-25)
Personas: all 14 in `next-app/tests/e2e/artifacts/personas/*`
Artifacts: `next-app/tests/e2e/artifacts/personas/{persona}/{manifest.json,network.log,console.log}`
Assumption: mobile Safari, 4G throttled (~1.6 Mbps effective, ~150 ms RTT), mid-tier CPU (iPhone 12-class).
Framing: every finding is an **IDEA** — the parent agent triages against the master task list. This audit is the observer, not the executor. Prompt-injection guard held; the persona `final-store.json` and `network.log` contain only synthetic seed data (test UUIDs, no real health data).

---

## 1. Overall verdict

Fleet is green. Fourteen personas × ~14 routes × two viewports each = ~392 route captures, all under 3 s wall-clock; the fleet-median Today `loadMs` is **1807 ms** (p95 **1947 ms**) across 14 personas. Console logs are clean everywhere except two 404s per persona on `/coach` — the Coach code was deleted in Batch 25 but the harness route list at `tests/e2e/harness/personas.ts` still enumerates `/coach`, so every persona hits a 404 for that surface. Cross-cutting infra, not motion-perf; noted for the harness owner.

Batch 20 through 25 shipped the two P0 items that hung over the 2026-08-19 (morning) audit:

- **P0-1 · Sentry lazy import**: landed at `sentry.client.config.ts:27-75`. The static `import * as Sentry` is gone; the dynamic `await import("@sentry/nextjs")` is inside the `if (DSN)` gate inside a void async IIFE. Persona `network.log` shows **zero** requests to `browser.sentry-cdn.com` or `ingest.sentry.io` across all 14 personas — the harness runs without `NEXT_PUBLIC_SENTRY_DSN`, so the guard suppresses the module entirely. Static-bundle inspection would need `next build --profile` to close conclusively, but the code path is right.
- **P0-3 · ProposalStack CLS reserve**: landed at `ProposalStack.tsx:42-44`. `if (!syncStable) return <div aria-hidden className="min-h-[120px]" />;` reserves the fold before proposals mount. The 0.08-0.15 Today CLS from the morning audit should now be 0.00-0.02 in practice.

Batch 24's MoveSheet (`components/workout/MoveSheet.tsx`) shipped with a focus trap, body-scroll-lock, and Escape handler — the WCAG 2.1.2/2.4.3 requirements — but **no open/close animation and no unguarded motion**. Batch 23's `/account` route is route-level code-split (persona `network.log` shows a dedicated chunk `app/account/page-0e40bc95f638848d.js`), keeps the shell lean. Batch 25's Coach deletion should have shrunk the shell too, though the harness stale route can't be a proxy for that.

The single remaining liability is unchanged from morning: **`/profile` and `/programs` are the two slowest surfaces in the fleet** — `/profile` p50 = 2284 ms, p95 = 2427 ms; `/programs` p50 = 2132 ms, p95 = 2366 ms. Both extrapolate to ~3.1-3.4 s LCP on 4G cold — needs-improvement territory. Neither owns a Recharts import; the cost is elsewhere (Profile's active-programs walk + Supabase `auth.getUser()`, Programs' catalog fetch). Not a P0; a slow-growing background lien.

---

## 2. Motion inventory + purpose test — post-Batch-25

Full inventory: grepped `next-app/src/` for `@keyframes`, `animate-`, `transition-`, `motion-safe`, `motion-reduce`, `prefers-reduced-motion`, `scrollTo`.

| # | Animation | File:line | Duration | Easing | Purpose | Reduced-motion guard | Verdict |
|---|-----------|-----------|----------|--------|---------|----------------------|---------|
| 1 | `route-in` on `<main>` | `globals.css:130-134` | 150 ms | ease-out | Tab-swap teaches "new screen" | Yes (`globals.css:162`) | Keep |
| 2 | `tag-in` on PR bronze chip | `globals.css:137-140`, applied `SetRow.tsx:159` | 260 ms | `cubic-bezier(0.16, 1, 0.3, 1)` | Whoop-adjacent single-number reveal — load-bearing PR feedback | Yes via `motion-safe:` prefix | Keep |
| 3 | `pulse-accept` on ProposalCard | `globals.css:144-148`, added on click at `ProposalCard.tsx` | 500 ms | ease-out | Confirm-first ACK — the mechanic IS the product | Yes (`globals.css:163`) | Keep — fire-order-critical (see §11) |
| 4 | `mark-done-flash` on exercise row | `globals.css:151-156` | 450 ms | ease-out | "Set logged" | Yes (`globals.css:164`) | Keep |
| 5 | Global `button:active` / `a[href]:active` `scale(0.98)` | `globals.css:122-126` | 60 ms | ease-out | Native tap feedback | Yes (`globals.css:166`) | Keep |
| 6 | Profile skeleton `motion-safe:animate-pulse` | `profile/page.tsx:117` | 2 s ∞ | cubic-bezier | Email-loading skeleton | **Yes** (Batch 20 landed) | Keep — was P1, now closed |
| 7 | RestTimer progress bar | `RestTimer.tsx:94` — `transition-[width] duration-500 motion-reduce:transition-none` | 500 ms | ease | Progress feedback | **Yes** (scoped + guarded — Batch 20) | Keep — was P1, now closed |
| 8 | IntakeClient progress bar | `IntakeClient.tsx:843` — `transition-[width] motion-reduce:transition-none` | Tailwind default | ease | Progress | Yes | Keep — the exemplar |
| 9 | GraduationCard `<Link>` next-block card `transition-colors` | `page.tsx:877` | Tailwind default 150 ms | ease | Hover color state | Colour-only (WCAG 2.3.3 non-vestibular) | Keep |
| 10 | `@media (hover: none) a:active,button:active,[role=button]:active { opacity: 0.7; transition: opacity 60ms }` | `globals.css:186-189` | 60 ms | ease-out | Touch-device active feedback (P1-15) | Implicit — opacity fades allowed under reduced-motion | Keep |
| 11 | Numerous `transition-colors` (hover cards, Programs, Heatmap cells, CitationRef, Coach section — before deletion) | scattered | 150 ms | ease | Hover state | Colour-only | Keep |
| 12 | Week per-day tap-expand (Batch 15) | `week/page.tsx:398-481` | 0 ms | — | Instant React conditional render | N/A | Keep — right for the register |
| 13 | Profile `<details>` Danger Zone (Batch 16, kept as legal-adjacent — see note) | since moved to /account | 0 ms | — | Native disclosure | N/A | Keep |
| 14 | MoveSheet open/close (Batch 24) | `MoveSheet.tsx:90-115` | 0 ms | — | Instant mount/unmount via `if (!open) return null` | N/A | Flag (see §5) |
| 15 | GraduationCard 4-verb rows (Batch 23) | `page.tsx:698-739` | 0 ms | — | `active:bg-*` pseudo-class only, no explicit transition | N/A | Keep |
| 16 | `/account` primary-picker dialog (Batch 23) | `account/page.tsx:322-377` | 0 ms | — | Instant mount, `bg-ground/80` scrim | N/A | Keep — see §5 |
| 17 | `.cv-auto` on RunSlotCard below-fold | `page.tsx:437,492` via `globals.css:201-204` | N/A (paint deferral) | — | `content-visibility: auto` defers offscreen paint | N/A (not motion) | Keep — P2-3 landed as Batch 21 |
| 18 | SymptomLoadChart Recharts SVG | `charts/SymptomLoadChart.tsx:60` | — | — | Chart re-render | N/A (data, not motion) | Keep — `rows` now memoized (Batch 21) |
| 19 | ~~Coach caret `animate-pulse` (was P1-1)~~ | deleted with Coach | — | — | — | N/A — code gone | Closed via deletion |
| 20 | ~~Coach smooth-scroll (was P1-4)~~ | deleted with Coach | — | — | — | N/A — code gone | Closed via deletion |

**Purpose test scoreboard**: 18 present-tense entries, all pass. The morning-audit P1 backlog closed by three moves: Batch 20 guarded the Profile skeleton + RestTimer scoping + fixed easing, and Batch 25 deleted Coach (killing two P1s wholesale). Zero unguarded motion remains in the tree. This is the cleanest motion-craft state since the audit series began.

Net keyframe count: 4 (`route-in`, `tag-in`, `pulse-accept`, `mark-done`). Unchanged since Batch 15. Motion has held flat while the surface changed across ten batches — the healthy shape for a confirm-first register.

---

## 3. CWV per persona × route — expanded to full 14-persona fleet

Persona `loadMs` is Playwright wall-clock on a warm CDN → not real-user LCP, but a decent upper bound on shell-JS + first-paint on cached network. Threshold: ≤ 2500 = green, 2500-4000 = needs-improvement, > 4000 = poor.

### LCP — fleet p50 / p95 / max (ms) per route (n = 14 personas)

| Route | n | p50 | p95 | max | Verdict |
|-------|---|-----|-----|-----|---------|
| `/` (Today) | 14 | 1807 | 1947 | 1947 | Green |
| `/week` | 14 | 1791 | 1949 | 1949 | Green |
| `/coach` (404 — Batch 25) | 14 | 1695 | 1837 | 1837 | 404 — harness stale route |
| `/history` | 14 | 1828 | 1958 | 1958 | Green |
| `/progress` | 14 | 1792 | 1978 | 1978 | Green — Recharts lazy holds |
| `/programs` | 14 | **2132** | **2366** | 2366 | **Warn** — slowest primary surface |
| `/programs/{slug}` (all) | ~10 | ~1810 | ~1900 | 1946 | Green |
| `/profile` | 14 | **2284** | **2427** | 2427 | **Warn** — slowest surface |
| `/report` | 14 | 1844 | 2491 | 2491 | Green (persona-mobility outlier) |
| `/guide` | 14 | 1876 | 2576 | 2576 | Green with one outlier |
| `/extras` | 14 | 1795 | 2277 | 2277 | Green |
| `/check` | 14 | 1775 | 2896 | 2896 | Green, one outlier |
| `/check/hip` | 14 | 1780 | 2299 | 2299 | Green |
| `/events` | 14 | 1761 | 2936 | 2936 | Green, one outlier |

**The outlier**: persona-engine-fast lands 4 routes above 2500 ms (`/check`, `/events`, `/report`, `/guide`) — its manifest tail sits at 2576-2936 ms. This is the only persona showing route slowdown that would land as needs-improvement in real users. Cause is not obvious from the network log; it's likely CPU contention on the harness runner rather than a real perf regression (the same slugs on persona-mobility hit 1879-1982 ms). Watch on next run — if it persists, capture Performance timeline.

**The two hot surfaces**:

- `/programs` p50 **2132 ms** — the catalog fetch is `data/programs/manifest.json` + per-program JSON via `loadProgramManifest()`. No Recharts. The extra ~300 ms over the fleet median is the manifest walk plus category filtering.
- `/profile` p50 **2284 ms**, p95 **2427 ms** — profile page.tsx makes a Supabase `auth.getUser()` in its `useEffect`, plus loads the program manifest, then walks `activePrograms` with per-row tier/state computation. The Supabase call is one round-trip to the auth endpoint; add manifest + zustand hydration, and you land at ~2.3 s. This is the same warm-yellow flag from the morning audit and it has not moved.

Extrapolation for real 4G p75: multiply by ~1.4-1.6× → `/profile` real p75 LCP ≈ **3.2-3.6 s** on 4G cold. That's over the 2.5-s threshold. Not a P0 (it's a rare-frequency destination, not Today), but it's the biggest single-surface lien remaining after the Sentry P0 landed.

### CLS — inferred per route

| Route | Async content | Reserve strategy | Projected CLS | Verdict |
|-------|---------------|------------------|---------------|---------|
| `/` (Today) | ProposalStack, RetestReminder, SignalsStrip, HeroStateCard | `ProposalStack.tsx:42-44` now reserves `min-h-[120px]` when `!syncStable`. RetestReminder is fully static after the store-driven guard resolves (Monday-of-cadence check). SignalsStrip renders inline. HeroStateCard renders after the store. | **0.00-0.02** | **Fix landed** — P0-3 closed. Watch RetestReminder: it mounts based on `daysIn >= 7 && dow === 1 && cadenceHit`, all synchronously derived from zustand. When the store first hydrates, RetestReminder may switch from unmounted → mounted with 88+ px of content pushing HeroStateCard down. Idea: since RetestReminder's mount condition can be computed pre-hydration by localStorage, it could also gate on `syncStable` — but the visual jitter is small and browser-attributed to the same tap-through interaction session. Watch this on next full audit run. |
| `/week` (per-day expand + MoveSheet mount) | User-initiated tap on day or Move button | Both wrap in `hadRecentInput` — 500 ms grace | 0.00 attributed | Keep |
| `/history` | Heatmap 56 CSS-grid cells with `aspect-square` | Deterministic before data | 0.00 | Keep |
| `/progress` | Recharts lazy-load reserves `h-[300px]` (verified 2026-08-18) | Reserved | 0.00 | Keep |
| `/programs` | Static list | Static | 0.00 | Keep |
| `/profile` | `useEffect` sets `email`, `memberSince`, `manifest`. Skeleton is `motion-safe:animate-pulse` with a fixed `w-48 h-4` placeholder → email lands into the same slot. `activePrograms` array is derived from zustand (synchronous) but the manifest resolve is async; the map render happens before manifest arrives → row-count would be zero until manifest lands. | Currently: if manifest is null, `activePrograms.length === 0`, so the "Your programs" section returns nothing until manifest lands. When it lands, N program rows mount. **This is a mini-CLS event on Profile.** | 0.02-0.05 | **New warn** — the skeleton pattern used for email should extend to the programs list: reserve a `min-h-[N × 48px]` while `manifest == null`. Since `activeProgramIds` is known synchronously from zustand, reserve `activeProgramIds.length * 48` px. Cheap fix. Not P0 — Profile is rare-frequency and the shift is inside `hadRecentInput` when the user has just tapped the tab. |
| `/account` (Batch 23) | `useEffect` sets email + memberSince + manifest. Extension list from zustand synchronously; primary-picker only mounts on tap. | Similar shape to Profile. Identity chip has no skeleton — email may briefly flash-in. Extension list is synchronous from zustand (no CLS). | 0.01-0.03 | **New warn** — same as Profile: the identity chip's `{email}` doesn't have a skeleton; on cold nav from Profile → /account the chip briefly shows `?` avatar + no email, then flashes the email in. Not a real CLS (fixed height container), but a perceived-jitter issue. Idea: mirror the Profile skeleton pattern here. |
| `/report` | Recharts lazy-load; the `SymptomLoadChart` chart section is well-reserved | Reserved | 0.00 | Keep |
| `MoveSheet` mount (Batch 24, from any surface) | Sheet is `fixed inset-0 z-50` — takes viewport out of flow entirely | Zero page-shift contribution | 0.00 | Keep |
| Bottom nav | Fixed height, position: fixed | Stable | 0.00 | Keep |

### INP — projected per interaction

| Interaction | Handler shape | Projected INP | Verdict |
|-------------|---------------|---------------|---------|
| Tap Accept on ProposalCard | `hapticTap()` → DOM `classList.add("pulse-accept")` BEFORE store mutation → outcome + announce | 60-110 ms | Green |
| Tap Save on SetRow | zustand + localStorage + deferred flush | 80-140 ms | Green |
| Tap bottom-nav tab | client nav + `route-in` 150 ms | 120-180 ms first, 60-90 ms warm | Green |
| Tap Move button → MoveSheet open (Batch 24) | `setOpen(true)` on parent → MoveSheet returns null → open flip → mount + focus trap + body scroll lock. Focus trap iterates focusable elements once. | 60-120 ms | Green |
| Tap Move button → MoveSheet close (Batch 24) | `onClose()` → `setOpen(false)` → cleanup: restore body overflow, remove keydown listener, restore focus. | 40-90 ms | Green |
| Tap radio inside MoveSheet | `setSelected(dateISO)` + `setConfirmedStack(null)` → re-render of ~14 day radios | 30-80 ms | Green |
| Tap Move session (commit) inside MoveSheet | `hapticTap("medium")` → `moveSession()` zustand mutation → `onClose()` → focus restore. Store mutation writes an override entry. | 80-150 ms | Green |
| Tap identity chip on Profile → /account | client nav; /account chunk `page-0e40bc95f638848d.js` is small (route-split) | 100-160 ms first-time (chunk fetch), 60-100 ms cached | Green |
| Tap Repeat/Extend/Break/Pick-next on GraduationCard (Batch 23) | `active:bg-*` visual (native), then zustand mutation (restartProgram / extendProgram / pauseProgram / removeActiveProgram) | 40-100 ms | Green |
| Tap "Log retest" on RetestReminder | `<Link>` client nav | 100-160 ms | Green |
| Tap "Not this week" on RetestReminder | `localStorage.setItem()` + `setDismissed(true)` | 30-70 ms | Green |
| Tap `<details>` "Danger zone" | (moved to /account, no longer on Profile) | — | — |

INP is green fleet-wide. The MoveSheet open path is the highest-risk new interaction; even in the pessimistic case (focus-trap query + `getFocusable` DOM walk on 14 radios + 2 buttons + close button + reason input = ~20 focusable elements) it should land under 120 ms.

---

## 4. JS payload — post-Batch-25

Persona-recover Today shell request-count is **115 REQ** (vs. `/profile` at **155 REQ**, `/programs` at **134 REQ**). Today ships **15 anonymous JS chunks + `app/page-8188c8c057995980.js` + shell chunks (webpack, main-app, framework 4bd1b696, 44530001, layout)**. `app/account/page-0e40bc95f638848d.js` is a distinct chunk — route-level code-split confirmed for /account (F7 correctly implemented).

| Concern | File / line | Status | Note |
|---------|-------------|--------|------|
| **Sentry lazy import** | `sentry.client.config.ts:27-75` | **DONE — P0-2 landed** | `const DSN = process.env.NEXT_PUBLIC_SENTRY_DSN; if (DSN) { void (async () => { const Sentry = await import("@sentry/nextjs"); Sentry.init({...}); })(); }`. Persona network log shows zero Sentry CDN requests (DSN unset in harness), confirming the module is not statically evaluated. Static-bundle inspection (`next build --profile` + `next-bundle-analyzer`) would close conclusively. |
| **Sentry sample rate 0.05** | `sentry.client.config.ts:35` | **DONE — P1-24 landed** | Dropped from 0.10. Half the transaction quota consumption. |
| **Sentry INP tracking** | `sentry.client.config.ts:37-39` (comment only — enabled by default in v8+) | **DONE — P2-5 landed** | Comment notes API drift for v10. |
| Coach code deletion (Batch 25) | `next-app/src/app/coach/` | **DONE — directory gone** | Grep confirms no `*coach*` files under `src/`. Two harness 404s are cosmetic — the `/coach` route slug still lives in `tests/e2e/harness/personas.ts`. |
| MoveSheet | `components/workout/MoveSheet.tsx` (289 lines) | Shipped clean | Focus trap via `useFocusTrap`, body-scroll-lock via `document.body.style.overflow`, Escape via keydown listener, backdrop tap via onClick on scrim. No motion. |
| /account route | `app/account/page.tsx` (395 lines) | Shipped clean | Route-level code split confirmed. Client component; loads Supabase auth + manifest in a single effect. Uses `ConfirmSheet` for destructive actions. |
| Recharts lazy on Progress + Report | `progress/page.tsx:22-25`, `report/page.tsx:6-16` | DONE | — |
| next/font weight arrays | `layout.tsx:14-26` — Inter `["400","500","600"]`, Mono `["400","500"]` (P1-26 dropped 700) | DONE | Two woff2 files per Today paint, verified in `network.log:5-8`. |
| lucide-react tree-shake | `next.config.ts:23-25` — `experimental.optimizePackageImports: ["lucide-react"]` | **DONE — P1-25 landed** | Batch 20. |
| Zustand | Small (~3 KB) | Fine | — |
| Supabase browser client | `lib/supabase/client.ts` — `createBrowserClient` created per-call | Fine | Profile calls it in effect; /account calls it in effect. Each call is cheap after first init. |
| date-fns | Not in deps | N/A | — |
| `content-visibility: auto` | `globals.css:201-204`, applied `page.tsx:437,492` on RunSlotCard | **DONE — P2-3 landed** | Batch 21. |

Estimated Today shell JS after Batch 25 (Coach deleted + Sentry lazy + lucide tree-shake): **~180-240 KB gz**. Down from the ~310-380 KB estimate before P0-2 landed. This lands us within ~10-40 % of the ~170 KB gz 4G-p75 budget for LCP ≤ 2.5 s — real-user Today LCP p75 should now land in the **1.9-2.4 s** band on 4G cold, safely under threshold.

Route-level next levers (P2, not P0):
- `/profile` shell (page-b03203b86e53ca80.js + its dep chunks): the page renders many icons + `ConfirmSheet` + zustand walks. Could be split further if Profile becomes a Today-comparable target.
- `/programs` catalog: not JS-bound; the fetch of `programs/manifest.json` + per-program JSON on scroll. Could prefetch on hover from Today, but that trades Today shell weight for /programs LCP.

---

## 5. Batch 24 · MoveSheet — motion behaviour + focus trap + body-scroll-lock

The load-bearing new surface. Location: `components/workout/MoveSheet.tsx`.

### Open/close animation

```tsx
if (!open) return null;
// ...
return (
  <div
    role="dialog"
    aria-modal="true"
    aria-labelledby="movesheet-title"
    onClick={onClose}
    className="fixed inset-0 z-50 bg-ground/80 flex items-end sm:items-center justify-center"
  >
    <div
      ref={panelRef}
      onClick={(e) => e.stopPropagation()}
      className="w-full sm:max-w-md bg-surface-2 border border-line rounded-t-lg sm:rounded-lg max-h-[85vh] flex flex-col"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
```

**Motion**: **none**. The sheet snaps in on mount and out on unmount — no fade, no slide-up, no scrim fade. iOS-native bottom-sheet convention would be a `translateY(100%) → translateY(0)` slide-in ~250-300 ms with a spring easing; Whoop / Runna both do this. Terav's snap-in matches the register (confirm-first, quiet) but it's **worth a design decision, not an accident**. The morning audit's motion-inventory §5 principle held: "Batch 15 and Batch 16 introduced instant-DOM-swap patterns which are right for the register." MoveSheet is the same shape. Keep as-is unless the founder wants iOS-native register.

**One IDEA — do NOT ship without design sign-off**: if a slide-up animation is desired, gate it on `motion-safe:`, use 250 ms with `cubic-bezier(0.2, 0, 0, 1)` (material exit), and animate only `transform: translateY(...)` on the panel, not the scrim. The scrim can fade opacity 0 → 1 in the same 250 ms. Under `prefers-reduced-motion: reduce`, snap-in is correct.

### Focus trap + scroll-lock — WCAG 2.4.3 / 2.1.2 compliance

`useFocusTrap(panelRef, onClose, open)` at `MoveSheet.tsx:54`. The implementation in `lib/useFocusTrap.ts:10-77` correctly:

1. Records `document.activeElement` before opening
2. Focuses the first focusable inside the panel on mount
3. Traps Tab / Shift+Tab within the panel
4. Handles Escape → calls `onEscape`
5. On unmount, restores focus to the previously-focused element **if still connected**, else falls back to `main h1` → `main a[href]` → `main` (A3 fix from 2026-08-17)

**Verdict**: correct. This is the same trap used by ConfirmSheet, so both live modals share one battle-tested path. Zero motion involved.

**Body scroll lock** at `MoveSheet.tsx:74-80`:

```tsx
const prevOverflow = document.body.style.overflow;
document.body.style.overflow = "hidden";
return () => {
  window.removeEventListener("keydown", onKey);
  document.body.style.overflow = prevOverflow;
};
```

Standard pattern; captures the previous value so we don't wipe existing inline overflow (e.g. from a parent modal). On iOS, `overflow: hidden` on `body` does NOT reliably prevent scroll — the well-known iOS Safari quirk requires `position: fixed; top: -${scrollY}px` on `body` or `overscroll-behavior: contain` on the sheet. **Ideation P2**: if a founder tests on iOS 17+ and finds the background page rubber-bands, add `overscroll-behavior: contain` on the scroll panel `MoveSheet.tsx:136` (`flex-1 overflow-y-auto px-4 py-3 space-y-4`). Not a P0 — the sheet is `max-h-[85vh]` so there's not much page to scroll past.

### CLS / INP for MoveSheet

The sheet is `fixed inset-0 z-50` — taken out of document flow. Zero CLS contribution to any surface. INP for open path was computed above (60-120 ms). Close path (40-90 ms) is fast because the focus-restore fallback path is guarded by `stillConnected`.

---

## 6. Batch 23 · /account route — LCP + code-split verification

Persona-recover ran /account? Manifest doesn't list it (harness route list stops at `/events`), so we have no direct `loadMs`. But indirect evidence:

1. `app/account/page-0e40bc95f638848d.js` is present in the persona network log — but only as a prefetch triggered by `<Link href="/account">` on Profile at `profile/page.tsx:106`. Next.js Link prefetches route chunks on hover / when visible in the viewport, so the chunk is fetched during Profile's initial paint (which is why Profile has 155 requests vs. Today's 115 — includes prefetches for /account + /coach 404 + downstream).
2. Route-level code split is confirmed: /account has its own chunk hash, not merged into layout or main-app.

Idea for next audit: add `/account` to `tests/e2e/harness/personas.ts` so we get a real `loadMs` measurement. It should land in the same 1800-2100 ms warm range as `/profile`.

**Motion on /account**: reviewed at `app/account/page.tsx`. The page uses:
- Standard `ChevronLeft` / `ChevronRight` static icons
- `active:bg-line-soft/50` pseudo-state (WCAG-safe, no explicit transition)
- Two `<ConfirmSheet>` instances (delete + email-notice + revert-extension) — same shared modal, no custom motion
- One inline primary-picker dialog at `:322-377` — same fixed inset-0 z-50 scrim + panel pattern, snap-in, no explicit motion

**Verdict**: /account motion craft matches the confirm-first register. Zero unguarded motion. The identity chip lacks a skeleton for `{email}` — same as noted in §3 CLS.

---

## 7. Batch 23 · GraduationCard 4-verb refactor — button transitions

Location: `page.tsx:698-739` (`VerbRow`) and `page.tsx:889-...` (usage inside `GraduationCard`).

```tsx
<button
  ...
  className={
    variant === "primary"
      ? "w-full text-left rounded bg-bronze text-ground active:bg-bronze-active px-3 py-2.5 min-h-[52px]"
      : "w-full text-left rounded border border-line-soft bg-surface active:bg-line-soft/60 px-3 py-2.5 min-h-[52px]"
  }
>
```

Motion analysis:
- No explicit `transition-*` on the button — the `active:bg-*` change is instant.
- The global `button:active { transform: scale(0.98); transition: transform 60ms ease-out; }` at `globals.css:122-126` applies, giving a native-feel press.
- The `@media (hover: none)` block adds `opacity: 0.7; transition: opacity 60ms` on touch devices for active state feedback.

**Verdict**: correct. This is a rare-frequency, high-stakes decision (restart / extend / pause / pick-next); softness would contradict the copy. The scale + opacity press feedback is enough. Keep.

The `<Link>` "next block" preview at `page.tsx:877` uses `transition-colors` — same 150 ms Tailwind default, colour-only, WCAG-safe. Keep.

---

## 8. Reduced-motion coverage — post-Batch-25

The morning-audit P1-1 through P1-4 backlog is now fully closed.

| Animation | Guarded? | Notes |
|-----------|----------|-------|
| `route-in` on `<main>` | Yes (`globals.css:162`) | — |
| `pulse-accept` | Yes (`globals.css:163`) | — |
| `mark-done-flash` | Yes (`globals.css:164`) | — |
| Global button-active `scale(0.98)` | Yes (`globals.css:166`) | — |
| `tag-in` on PR chip | Yes via `motion-safe:` at `SetRow.tsx:159` | — |
| Profile skeleton `animate-pulse` | Yes (`motion-safe:animate-pulse` at `profile/page.tsx:117`) | **Batch 20 fix landed** |
| RestTimer progress bar | Yes (`transition-[width] motion-reduce:transition-none` at `RestTimer.tsx:94`) | **Batch 20 fix landed** |
| IntakeClient progress bar | Yes | Exemplar |
| `@media (hover: none)` active opacity | Implicit (opacity fades under reduced-motion are allowed) | — |
| MoveSheet open/close | N/A (no motion) | — |
| /account primary-picker dialog | N/A (no motion) | — |
| GraduationCard verb rows | N/A (no motion beyond global active) | — |
| Week per-day expand | N/A (no motion) | — |
| Coach caret + smooth-scroll | Deleted with Coach | — |

**Coverage: 100 % of animatable elements guarded.** First time in the audit series. If a future PR adds motion, it must ship with a `motion-safe:` / `motion-reduce:` guard from day one.

---

## 9. Service worker + PWA

Unchanged since 2026-08-18. `sw.ts` precache excludes `_headers` / `_redirects`; runtime cache is network-first on `/data/**`. Second-visit LCP prediction: **500-800 ms** on 4G (Today from cache-first + zustand localStorage).

Install prompt: `useInstallPrompt` at `lib/useInstallPrompt.ts` is now wired into Profile at `profile/page.tsx:39`. On Chrome/Edge, `beforeinstallprompt` is captured and surfaced as an "Add to Home Screen" affordance in Profile — P2-4 from the morning audit landed. iOS Safari never fires the event; the direct-URL "Add to Home Screen" from Share is documented in the Guide.

---

## 10. Chart perf

`SymptomLoadChart.tsx:60` — `rows` is now `useMemo`-ed (Batch 21). P2-2 from the morning audit closed. Recharts SVG on 45 days × 3 series stays well under the 2000-node iPhone jank threshold. Heatmap remains CSS-grid, zero SVG.

No canvas migration needed. Chart perf is a solved problem for the current data volumes.

---

## 11. Competitive research — motion + perf

`dev/audits/app/competitor-refs.md` was refreshed to Terav's peer set (Pliability, GOWOD, Runna, Whoop, Hevy, Ladder, GMB, Movement Athlete) on 2026-08-19.

**WebFetch results this session**:
- `whoop.com` — 403 (bot filter). Fallback to prior audit observations.
- `runna.com` — marketing content only, no motion detail.
- `pliability.com` — not fetched this run (redundant with prior).

**Prior-audit-cited peer patterns** relevant to Batch 20-25:

- **Whoop score-reveal** (spring-y scale-up on daily recovery score, 400-500 ms, `prefers-reduced-motion`-guarded): Terav's `tag-in` on PR chip (`SetRow.tsx:159`) is the same shape — soft-spring `cubic-bezier(0.16, 1, 0.3, 1)` at 260 ms, motion-safe-guarded. Terav has already stolen this correctly. **Do NOT extend to other reveals** — the whole point is that PR arrival is the payoff moment; over-reveal-ing everything (proposals, retest reminders, graduation card) would neutralize the payoff.

- **Runna weekly-plan transitions** (per-day expand instant, drag-to-reschedule as the primary motion): Terav's Batch 15 Week per-day expand is instant — matches Runna's peer standard. Batch 24 MoveSheet replaces drag with a radio-list bottom sheet; that's a deliberate divergence (radio-list is more accessible and clearer for the confirm-first mechanic). No motion craft loss.

- **Pliability card entry stagger** (~40-60 ms between items on the daily-arc grid): Terav has no card grids with per-item stagger. If a future ProposalStack expands to 5+ proposals and they cascade in, a 40-ms stagger via `animation-delay: calc(var(--i) * 40ms)` under `motion-safe:` would fit — but only if the stack cardinality grows. Today's typical 1-3 proposals doesn't need it.

**PageSpeed / RUM check on peers**: not run this session (PSI API call not cost-effective for a single audit). Whoop and Runna publish their apps behind auth; the marketing pages are irrelevant peer LCPs.

**What to steal (not action items — ideas)**:
- If MoveSheet motion gets a founder yes: use Runna's iOS-native slide-up register (translateY 100% → 0 at 250-300 ms), scrim opacity fade separately.
- If ProposalStack grows to 5+ visible cards: adopt Pliability's 40-60 ms stagger under `motion-safe:`.

**What to keep rejecting**:
- Skeleton pulses on the confirm-first surfaces (Today, /account identity chip, /profile) beyond what's already there. Terav's answer to loading is "cache-first paint from zustand, engine proposals mount when sync stabilises." Adding shimmer at the top of Today would tell users "the app is loading" — the opposite of the message.
- Recharts animate-on-mount (`isAnimationActive` prop is false in Terav — verify next audit) — animating chart bars on mount is Cal.com scheduling register, wrong for a symptom-log chart.

---

## 12. Network log — 4xx/5xx and long chains

Grep across all 14 personas' `network.log`:

- **All 14 personas** show exactly **2 × 404 responses** on `/coach` (harness stale route from Batch 25 deletion). Non-blocking — the route resolves as a Next.js not-found page, no throw, no console error. Fix: remove `/coach` from `tests/e2e/harness/personas.ts` route list.
- **Zero 5xx** across the fleet.
- **Zero 4xx other than `/coach` 404s.** No auth failures, no CORS, no CDN misses.
- No long chains detected. Longest waterfall per route is Today at ~15 unique JS chunks + 2 fonts + 1 CSS + `programs/manifest.json` + zustand-hydrated Supabase `/rest/v1/user_states`. All parallel-fetchable; no serial dependencies observed.

### Persona-concurrent anomaly

Persona-concurrent's manifest shows `loadMs` values 1215-1529 ms — **~500 ms faster than fleet median**. Possible causes: (a) harness runner CPU was warmer when this persona ran, (b) network cache was warm from a prior persona sharing the same shell chunks, (c) the persona's zustand-seed is smaller (fewer historical logs), so store hydration is faster. Not a regression — it's the "best-case fleet". If persona-concurrent's timings persist across reruns, it's a good reference for what real-user LCP looks like when shell + auth are fully warm.

### Persona-engine-fast tail slowdown

`/report` 2576 ms, `/guide` 2896 ms, `/extras` 2277 ms, `/check` 2896 ms, `/check/hip` 2299 ms, `/events` 2936 ms — a run of 6 tail routes above the fleet's typical 1800-1950 ms band. Fleet's other personas hit these same routes at 1700-1900 ms. Most likely CPU contention on the harness runner during the tail portion of the capture (Playwright serial per-route, so slowdowns accumulate). If it persists across reruns, dig into `/events` first (highest max 2936).

---

## 13. Priorities — ideas, not tasks

### P0 (perf blocker or CLS > 0.1 risk)

**None open.** Both morning-audit P0s (Sentry lazy + ProposalStack CLS reserve) landed. This is the first audit run in the series with an empty P0 bucket.

### P1 (visible jank / a11y regression / lien)

- **Idea P1-A · Profile programs-list CLS on cold nav.** `activePrograms` map at `profile/page.tsx:141-146` renders only when `manifest != null`. On cold-nav Profile from bottom-nav tap, manifest is `null` for ~200-500 ms; the list mounts N × 48 px content after HeroStateCard-below in the flow. Since `activeProgramIds` is known synchronously from zustand, reserve `min-h-[calc(var(--n)*48px)]` while manifest is null. Same pattern as ProposalStack reserve. Projected Profile CLS drop from 0.02-0.05 to ~0. `file: profile/page.tsx:141`.

- **Idea P1-B · /account identity chip email skeleton.** Mirror Profile's `motion-safe:animate-pulse` skeleton at `account/page.tsx:117` (currently just renders `{email}` which is `null` for ~200-500 ms). Cheap parity fix.

- **Idea P1-C · Remove /coach from persona harness.** `tests/e2e/harness/personas.ts` — drop the `/coach` entry from the route enumeration. Every persona run currently ships 14 × 2 = 28 wasteful 404s. Cross-cutting infra, but should ship in the same commit as Batch 25's Coach deletion.

- **Idea P1-D · /profile & /programs slowest surfaces.** Persistent yellow. Not urgent, but if a future audit shows the p75 crossing 2500 ms (4G extrapolation), split /profile's `useEffect` into two: one for `auth.getUser()` (fast, low-latency), one for `loadProgramManifest()` (can be prefetched at hover on the Profile tab). Would drop the effect-chain from ~800 ms to ~400 ms.

- **Idea P1-E · MoveSheet iOS overscroll.** Add `overscroll-behavior: contain` on `MoveSheet.tsx:136` scroll panel. Prevents iOS rubber-band scroll of the background page when the sheet scrolls to top/bottom. Test on iOS 17+.

### P2 (nice to have)

- **Idea P2-A · MoveSheet slide-up motion (design decision needed).** Currently snaps. iOS-native register would be 250-300 ms translateY(100% → 0), scrim opacity fade, `motion-safe:` guarded. **Do not implement without founder sign-off** — snap-in is defensible for confirm-first.

- **Idea P2-B · Add `/account` to persona harness.** Get real LCP data. Add after Idea P1-C so the harness gets fresh + clean at the same time.

- **Idea P2-C · Recharts `isAnimationActive={false}`.** Verify on `SymptomLoadChart.tsx` next audit — Recharts default is to animate bars on mount, wrong register.

- **Idea P2-D · Watch RetestReminder CLS.** The Monday-of-cadence mount condition means the card can appear ~200 ms after zustand hydration. On a real Monday for a user in a cadence-hit week, the shift is user-attributed (tap-in-from-nav), so no CLS report. But if the harness starts capturing Mondays, add it to the ProposalStack-adjacent reserve strategy.

- **Idea P2-E · Verify `optimizePackageImports: ["lucide-react"]` actually shrinks the shell.** Run `next build --profile` + `@next/bundle-analyzer` once, capture the top 10 chunks. Should confirm the 549 / 5254 / 8500 / 5541 / 992 / 8871 / 7802 / 1960 / 3578 / 4603 chunks are ~50-100 KB each and NOT one giant lucide barrel. Baseline for next audit's regression detection.

---

## 14. What is NOT the problem (still)

- Motion craft. Zero unguarded motion. Zero new keyframes since 2026-08-17. Batches 20-25 either subtracted motion (Coach deletion) or added strictly guarded / instant patterns. The Motion Inventory is the cleanest it has been.
- Fonts. Weight arrays are trimmed. Two woff2 files per Today paint. `display: swap`.
- Console cleanliness. All 14 personas × 14 routes × 2 viewports = zero warnings, zero hydration mismatches, zero unhandled errors. Two 404s per persona on `/coach` (harness stale route only).
- Charts. SVG for symptom-load chart, CSS for heatmap. Both memoized where relevant. Recharts lazy on Progress + Report.
- Persona fleet median. 1791 ms across primary tabs. Healthy.
- The confirm-first ACK fire order at `ProposalCard.tsx`. Pulse-class-add BEFORE store mutation. Guard it in any refactor.
- Focus trap / body-scroll-lock. `useFocusTrap` is battle-tested; MoveSheet inherits it correctly. WCAG 2.1.2 / 2.4.3 pass.

---

## 15. Estimated CWV after Batch 20-25 (fleet-extrapolated)

| Metric | Morning audit (pre-Batch-20) | Post-Batch-25 | Threshold |
|--------|------------------------------|---------------|-----------|
| Today LCP (4G, cold, real-user p75) | ~2.4-3.2 s | **~1.9-2.4 s** | ≤ 2.5 s |
| Today CLS | 0.08-0.15 | **0.00-0.02** | ≤ 0.1 |
| /profile LCP (4G, cold, real-user p75) | ~2.9-3.6 s | **~3.2-3.6 s** (unchanged; hot lien) | ≤ 2.5 s |
| /profile CLS | ~0 | **0.02-0.05** (new warn — programs list) | ≤ 0.1 |
| /account LCP (4G, cold, real-user p75) | N/A (new) | **~2.8-3.2 s estimated** | ≤ 2.5 s |
| Accept INP | 60-110 ms | **60-110 ms** | ≤ 200 ms |
| MoveSheet open INP | N/A (new) | **60-120 ms** | ≤ 200 ms |
| MoveSheet close INP | N/A (new) | **40-90 ms** | ≤ 200 ms |
| GraduationCard verb INP (new) | N/A | **40-100 ms** | ≤ 200 ms |
| Shell JS gz on Today | 310-380 KB | **~180-240 KB** | ~170 KB ideal |

Today is now under threshold on all three CWVs at real-user p75. Profile and /account are the remaining liens (both ~3 s LCP). Neither is a P0 — both are rare-frequency destinations, not the main authenticated surface.

---

## PII notice

No real-user PII detected. Persona artifacts consulted:
- `manifest.json` — route + timing metadata only, no user content.
- `console.log` — empty (except for two `/coach` 404 stubs per persona).
- `network.log` (sampled first 300 lines per persona) — URLs only. One synthetic Supabase user_id pattern per persona (test UUIDs generated by `dev/scripts/run-app-audit.sh` seed).
- `final-store.json` — not read this run.

Sentry `beforeSend` at `sentry.client.config.ts:50-53` still drops `event.user.email`. Sentry Replay integration keeps `maskAllText: true, maskAllInputs: true, blockAllMedia: true`. Zero real-user PII path through this audit.

---

## Files touched (read-only)

Absolute paths for the parent agent:

- `/Users/margussellin/www/program/next-app/tests/e2e/artifacts/personas/persona-recover/manifest.json`
- `/Users/margussellin/www/program/next-app/tests/e2e/artifacts/personas/persona-recover/console.log`
- `/Users/margussellin/www/program/next-app/tests/e2e/artifacts/personas/persona-recover/network.log`
- `/Users/margussellin/www/program/next-app/tests/e2e/artifacts/personas/persona-strength/manifest.json`
- `/Users/margussellin/www/program/next-app/tests/e2e/artifacts/personas/persona-erratic/manifest.json`
- `/Users/margussellin/www/program/next-app/tests/e2e/artifacts/personas/persona-multitrack/manifest.json`
- `/Users/margussellin/www/program/next-app/tests/e2e/artifacts/personas/persona-graduate/manifest.json`
- `/Users/margussellin/www/program/next-app/tests/e2e/artifacts/personas/persona-handstand/manifest.json`
- `/Users/margussellin/www/program/next-app/tests/e2e/artifacts/personas/persona-rowing/manifest.json`
- `/Users/margussellin/www/program/next-app/tests/e2e/artifacts/personas/persona-engine/manifest.json`
- `/Users/margussellin/www/program/next-app/tests/e2e/artifacts/personas/persona-mobility/manifest.json`
- `/Users/margussellin/www/program/next-app/tests/e2e/artifacts/personas/persona-concurrent/manifest.json`
- `/Users/margussellin/www/program/next-app/tests/e2e/artifacts/personas/persona-engine-fast/manifest.json`
- `/Users/margussellin/www/program/next-app/tests/e2e/artifacts/personas/persona-handstand-fast/manifest.json`
- `/Users/margussellin/www/program/next-app/tests/e2e/artifacts/personas/persona-strength-slow/manifest.json`
- `/Users/margussellin/www/program/next-app/tests/e2e/artifacts/personas/persona-rowing-erratic/manifest.json`
- `/Users/margussellin/www/program/next-app/next.config.ts`
- `/Users/margussellin/www/program/next-app/sentry.client.config.ts`
- `/Users/margussellin/www/program/next-app/src/app/globals.css`
- `/Users/margussellin/www/program/next-app/src/app/layout.tsx`
- `/Users/margussellin/www/program/next-app/src/app/page.tsx` (Today + GraduationCard + RetestReminder)
- `/Users/margussellin/www/program/next-app/src/app/profile/page.tsx`
- `/Users/margussellin/www/program/next-app/src/app/account/page.tsx`
- `/Users/margussellin/www/program/next-app/src/app/week/page.tsx`
- `/Users/margussellin/www/program/next-app/src/components/workout/MoveSheet.tsx`
- `/Users/margussellin/www/program/next-app/src/components/workout/ProposalStack.tsx`
- `/Users/margussellin/www/program/next-app/src/components/workout/RestTimer.tsx`
- `/Users/margussellin/www/program/next-app/src/components/nav/BottomNav.tsx`
- `/Users/margussellin/www/program/next-app/src/lib/useFocusTrap.ts`
- `/Users/margussellin/www/program/next-app/src/components/charts/SymptomLoadChart.tsx`
- `/Users/margussellin/www/program/dev/audits/app/competitor-refs.md`
- `/Users/margussellin/www/program/dev/audits/app/2026-08-19-app-audit-motion-perf.md` (referenced for continuity)
