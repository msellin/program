# Terav app — Motion + Core Web Vitals audit (session 2026-08-17)

Scope: post-migration app at `https://app.terav.fit`. Persona artifacts stale — code + config only. Assumption: mobile Safari, 4G throttled, mid-tier CPU.

---

## Verdict

The motion inventory is small, purposeful, and — after Phase F1 — properly guarded behind `prefers-reduced-motion` (`globals.css:157-163`). No `animate-card-in` class exists in the current tree; the audit prompt is referencing a name that never landed or was already renamed. What actually runs on Accept is `.pulse-accept` (500ms background flash on `ProposalCard.tsx:29-31`) plus the global `route-in` fade on `<main>` (`globals.css:130`). Both are covered. The real perf liability is not motion — it is the **Today critical path**: `ProposalStack` is `useMemo`'d on `store` (`ProposalStack.tsx:22-25`), which means the moment the async Supabase-KV pull finishes (`StoreHydrator.tsx` writes `hydrated: true` at `useStore.ts:260`), the whole store reference changes, `selectProposals` re-runs, and a Proposal card appears above `HeroStateCard` in the same tick — a textbook CLS trigger on the highest-traffic route. LCP is fine (single H1 sr-only + immediate render), INP on Accept/Ignore is fine (synchronous Zustand mutation, no network in the click handler), and Recharts is correctly lazy on Progress + Report. The single biggest liability is the ProposalStack post-hydration insertion; the second is a service-worker footgun from the domain migration.

---

## Top 5 findings by blast-radius

| # | Finding | File:line | Fix cost |
|---|---------|-----------|----------|
| 1 | **CLS on Today post-hydration.** `ProposalStack` renders `null` until `store` mutates via `hydrate()` (~200-500ms after first paint, KV-round-trip dependent). When a proposal exists, a full `<section>` with border, padding, and 2 buttons pops in **above** `HeroStateCard`, `SignalsStrip`, `RetestReminder`, all subsequent block sections — every element below shifts down by ~120-180px. Layout-shift score on this event alone will be ~0.15-0.25 depending on viewport, well past the 0.1 "good" threshold. Same class of bug affects `Day1EmptyState` (`page.tsx:169-180`) but only for fresh signups so blast radius is smaller. | `next-app/src/components/workout/ProposalStack.tsx:27` + `next-app/src/app/page.tsx:182` | **M** — reserve a `min-h-0` placeholder pre-hydration OR render `ProposalStack` inside a `hydrated` gate at the same level as `HeroStateCard` (i.e., only mount the whole Today content tree after `hydrated`, which `page.tsx:100` already does; the issue is that `hasHistory` is derived from `store.logs` and *changes* at hydration, so `Day1EmptyState` toggles off after paint). The clean fix is: block the whole "content" render until `hydrated`, keeping only a fixed-height skeleton — Today already does this at line 100-103 with a `Loading…` div, but the div is unstyled and reserves ~20px; bump it to `min-h-[600px]` to reserve the fold. |
| 2 | **Stale SW on the old origin.** Any user who visited `program-v2.pages.dev` pre-migration still has a Serwist SW registered at that origin with `clientsClaim: true` and precached HTML for the old build (`sw.ts:26`). Cloudflare Pages doesn't auto-remove SWs when you point DNS elsewhere. If `program-v2.pages.dev` still resolves and serves 200s, those users are running a frozen version of the app until they hard-reload past the SW OR the SW's precache fetches 404 (which unlocks self-update, but the shell HTML at `/` is fetched from cache-first via `defaultCache`, so they may never see the migration). No mechanism ships an SW `unregister` message from the new origin to the old one — cross-origin SW control is impossible by design. | `next-app/src/app/sw.ts:23-27`, `next-app/next.config.ts:8` | **S** — publish a tombstone `sw.js` at `program-v2.pages.dev` that does `self.registration.unregister()` + `caches.keys().then(k => Promise.all(k.map(caches.delete)))` on install. Deploy a minimal Cloudflare Pages project overwriting the old domain's `/sw.js` and `/index.html` with an "app has moved to app.terav.fit" redirect. Otherwise pre-migration users are stranded on stale JS with no path forward except manual clear-site-data. |
| 3 | **`transition-colors` on 56 heatmap cells + duplicate render path.** `Heatmap.tsx:150,167` applies `transition-colors` to every one of 56 grid cells (`WEEKS=8` × 7). On first paint, the cells transition from Tailwind's default (transparent) to their state color — that's 56 CSS transitions kicking off in the same frame on Progress. Not catastrophic but noticeable jitter on low-end Android. Compounded by the fact that both the `<button>` and `<span>` branches of the same map (lines 143-178) each carry the `transition-colors` — the ternary is fine, but code duplication makes it easy to regress. | `next-app/src/components/charts/Heatmap.tsx:151,168` | **S** — either move the transition to a `:hover` selector only (`hover:transition-colors` — but Tailwind doesn't do that idiomatically, so an explicit `hover:duration-150 transition-colors` on a shorter list is fine) OR drop `transition-colors` entirely; the coloring is definitional, not stateful. Users don't need to see a heatmap cell fade in over 150ms. |
| 4 | **`OnboardingRunner` has zero enter animation but a `backdrop-blur-sm` on a full-viewport overlay.** `OnboardingRunner.tsx:99` renders `fixed inset-0 z-50 bg-ground/95 backdrop-blur-sm`. Two problems: (a) no `motion-safe:` opacity transition on mount — the modal snaps in instantly, which reads "crash" more than "modal opened"; (b) `backdrop-blur-sm` on a 100vh element on Safari triggers a full-screen composited blur pass every frame it exists, ~4-6ms of GPU time on iPhone 12-class devices. On a fresh signup, this modal is the LCP element on `/`. With `display: swap` on Inter + JetBrains Mono (`layout.tsx:14,20`), the modal text may FOUT-flash before it settles. Same pattern in `IntroGallery.tsx:153` with `bg-ground/80` (no blur — better). | `next-app/src/components/onboarding/OnboardingRunner.tsx:99` | **S** — drop `backdrop-blur-sm` (the `/95` opacity already occludes 95% of the surface — the blur adds nothing users can perceive under that alpha); add a `motion-safe:animate-[fade-in_120ms_ease-out]` on the outer `<div>` and define the keyframe in globals.css with the reduced-motion guard. |
| 5 | **No `Suspense` boundary around Recharts on Progress; dynamic import has no `loading` fallback for the chart's own height.** `progress/page.tsx:19` uses `next/dynamic` on `SymptomLoadChart` (~112KB gz), which is correct — but the chart renders inside `<div className="h-[300px] w-full">` (`SymptomLoadChart.tsx:99`). While the chunk is downloading, that div is *not* in the tree — the parent component conditionally mounts it. So the ~300px chart height appears **after** the chunk resolves, pushing anything below it down. Second CLS pop, this time on Progress. | `next-app/src/app/progress/page.tsx:19-20,248` + `next-app/src/components/charts/SymptomLoadChart.tsx:99` | **S** — pass `dynamic(..., { loading: () => <div className="h-[300px] w-full" aria-hidden />, ssr: false })`. Reserves the height, kills the shift. |

---

## Motion inventory (verification of Phase F1)

| Animation | File:line | Duration | Reduced-motion guard | Verdict |
|-----------|-----------|----------|----------------------|---------|
| Global press scale | `globals.css:118-122` | 60ms | Yes — `globals.css:162` kills `button:active` transform | Keep |
| `route-in` fade on `<main>` | `globals.css:126-130` | 150ms ease-out | Yes — `globals.css:158` | Keep |
| `.pulse-accept` (Proposal Accept flash) | `globals.css:140-144` + applied at `ProposalCard.tsx:29-31` | 500ms ease-out | Yes — `globals.css:159` | Keep |
| `.mark-done-flash` (exercise checkbox) | `globals.css:147-152` + applied at `ExerciseCard.tsx:149-152` | 450ms ease-out | Yes — `globals.css:160` | Keep |
| `tag-in` keyframe on PR set-row indicator | referenced at `SetRow.tsx:143` | 260ms | Yes — `motion-safe:animate-[…]` prefix does the guard idiomatically | Keep |
| `animate-pulse` streaming cursor (Coach) | `coach/page.tsx:403` | Tailwind default 2s | **No** — pure Tailwind `animate-pulse`, no `motion-safe:` prefix | **P1** — add `motion-safe:` prefix |
| `animate-pulse` email skeleton | `profile/page.tsx:126` | Tailwind default 2s | **No** — same | **P1** — add `motion-safe:` prefix |
| `transition-all` IntroGallery pager dots | `IntroGallery.tsx:187` | Tailwind default 150ms | Partial — `transition-all` includes transform, which reduced-motion should nix; opacity-only would be safer | **P2** — swap to `transition-colors` |

**`animate-card-in` referenced in the audit prompt does not exist in the tree.** Neither `grep -rn "animate-card-in"` nor `grep -rn "animate-in"` returns any hits in `next-app/src` or tailwind config. Either Phase F1 shipped a renamed animation and the prompt is stale, or the class was replaced by `pulse-accept`. Either way: `ProposalCard` currently has **no enter animation** — cards appear instantly. That is arguably correct (motion for the sake of motion teaches nothing), but if the intent was "teach the user 'this is new'," a 120ms opacity fade `motion-safe:animate-[fade-in_120ms_ease-out]` on the card wrapper would restore the affordance cheaply.

---

## CWV per route (predicted, no live measurement — persona artifacts stale)

**LCP.** Today has no image, no hero. LCP element is either the `<h2>` in `Day1EmptyState` (fresh users) or the first block section's exercise title (returning users). Inter is loaded via `next/font/google` with `display: swap` — no FOIT, small FOUT flash acceptable. Predicted LCP on cold 4G: 1.6-2.0s. Good.

**CLS.** Two hotspots documented in findings #1 and #5. Predicted CLS on Today for a returning user with 1 proposal firing: **0.15-0.25** (over budget). Predicted CLS on Progress with data present: **0.10-0.15** (borderline).

**INP.** Accept button on `ProposalCard.tsx:159-165` — synchronous Zustand mutation via `acceptDayAdjustment`/`setTM`/`promoteTier`, plus a classList add and a screen-reader announce. Zero network in the click path. Predicted INP: **<50ms**. Good. Same for Ignore. Same for `Day1EmptyState` CTA (pure Link nav). Same for `ExerciseCard` checkbox (`ExerciseCard.tsx:140-155`) — the `void row.offsetWidth` forced reflow to restart the animation is a documented, cheap pattern.

---

## JS payload

- **Recharts** — `dynamic(..., { ssr: false })` on Progress (`progress/page.tsx:19`) and Report (`report/page.tsx:15`). Not in shell. Good.
- **No date-fns** — confirmed. Previous audit's removal held.
- **No framer-motion** — confirmed. All motion is CSS keyframes.
- **`@supabase/ssr` + `@supabase/supabase-js`** — eager in `StoreHydrator` and `AppShell.tsx:15`. This is the shell's heaviest transitive dep (~40KB gz). Unavoidable given the auth-gated model; the alternative (defer Supabase behind `dynamic`) would gate the whole app behind an extra chunk fetch, worse.
- **Zustand + Zod** — small, fine.
- **`lucide-react` at ^1.29.0** — tree-shakes to just the icons imported per file. Good.

---

## Service worker + PWA

- Precache scope: everything except `_headers` / `_redirects` (`sw.ts:18-21`) — correct.
- Data files under `/data/*` are network-first with cache fallback (`sw.ts:30-49`) — correct pattern for the JSON program definitions.
- `_headers` sets `Cache-Control: public, max-age=0, must-revalidate` on both `/data/*` and `/sw.js` — correct.
- Install prompt: no code fires `beforeinstallprompt` handling. The browser's native chip surfaces on its own heuristic. That is fine, but it means no way to defer it past the OnboardingRunner modal, which on a fresh signup is exactly when the browser is most likely to fire it — install prompt over an onboarding modal is a documented conversion killer.

---

## What I did NOT cover

- Live PageSpeed / Lighthouse capture against `https://app.terav.fit` — no network access in this session.
- Persona-artifact-based CLS numbers — artifacts stale per shared context.
- Landing (`terav.fit`) motion or CWV — out of scope for app auditor.
- Recharts render-cost benchmarks with real 45-day data — no fresh persona to profile against.
- `beforeinstallprompt` implementation (does not exist, so no code to audit).
- Coach page streaming perf beyond the `animate-pulse` reduced-motion gap.
- The `IntroGallery` z-index collision fix — validated by reading `IntroGallery.tsx:112-130`, no regression detected, out of motion/perf scope now.
- WCAG 2.3.3 conformance testing beyond checking the CSS `@media (prefers-reduced-motion: reduce)` block covers each keyframe — a11y agent owns full conformance.
- Bundle-analyzer report — no analyzer plugin in `next.config.ts`. Recommendation to add `@next/bundle-analyzer` and re-audit belongs in a follow-up brief.
