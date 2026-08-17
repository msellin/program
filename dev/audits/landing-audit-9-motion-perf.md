# Terav landing — Motion & Performance audit (mobile, throttled)

Baseline: Lighthouse 12.8.2 mobile preset (Moto G Power emulation, 4× CPU slowdown, Slow 4G-equivalent RTT/throughput). CWV 2025 mobile thresholds — LCP ≤2.5s, CLS ≤0.1, INP ≤200ms, TTFB ≤800ms.

Source:
- `/Users/margussellin/www/program/landing/src/app/layout.tsx`
- `/Users/margussellin/www/program/landing/src/app/page.tsx`
- `/Users/margussellin/www/program/landing/src/app/globals.css`
- `/Users/margussellin/www/program/landing/src/components/*.tsx`
- `/Users/margussellin/www/program/landing/src/components/sections/*.tsx`
- `/Users/margussellin/www/program/landing/src/components/mockups/*.tsx`
- `/Users/margussellin/www/program/landing/next.config.ts`
- `/Users/margussellin/www/program/landing/package.json`

Measurements: **measured**. Lighthouse ran twice — once against `next dev` on `:3000` (dev-mode overhead: HMR client, devtools bundle, unminified) and once against the exported static output (`out/`) served via `serve` on `:4321`. Prod numbers are load-bearing. Dev numbers are called out where informative but never used to judge shipped perf. INP is inferred from TBT (Lighthouse does not measure INP directly — TBT ≤200ms is the field-INP proxy Google publishes).

## Lighthouse summary (static export, mobile, throttled)

| Metric | Value | Threshold | Verdict |
|---|---|---|---|
| Performance score | **0.98** | ≥0.90 = green | Pass |
| LCP | **2.0 s** (1973 ms observed) | ≤2.5 s | Pass |
| FCP | **2.0 s** | ≤1.8 s good, ≤3.0 s ok | Borderline |
| CLS | **0.001** | ≤0.1 | Pass, effectively zero |
| TBT | **50 ms** (49 ms observed) | ≤200 ms proxies INP≤200 ms | Pass |
| Speed Index | **2.0 s** | ≤3.4 s | Pass |
| TTI | **2.5 s** | — | Pass |
| TTFB | **11 ms** (localhost) | ≤800 ms | Not representative — will be Cloudflare Pages edge in prod, comfortably ≤200 ms |
| JS transferred | **141 KB** across 7 chunks | — | Lean |
| CSS transferred | **9.3 KB** (compressed, 52 KB uncompressed Tailwind bundle) | — | Fine |
| Fonts transferred | **89 KB** (2 preloaded subsets) | — | Room to trim |
| Third-party scripts | **0** | — | Best-in-class |
| Render-blocking | **1** (the 9.3 KB CSS, 730 ms on 4G-slow) | — | Expected |

Dev-mode reference (informational only): perf score 0.85, LCP 2.9 s, TBT 250 ms, ~740 KB JS including devtools. This is why you never trust `next dev` numbers.

## 1. Overall motion + perf verdict

Restrained and fast. The founder called for "quiet authority" and the code makes good on it — no `framer-motion`, no `IntersectionObserver`-driven reveals, no scroll-linked parallax, no auto-playing video, no third-party scripts, zero raster images on the page. Every visual mockup (`PhoneFrame`, `TodayMockup`, ambient gradients) is composed from HTML+CSS, so there is no LCP image to preload and no CLS from late media. LCP 2.0 s and CLS 0.001 on throttled mobile are the payoff.

The two real defects are both motion-side, not perf-side. First, **zero `prefers-reduced-motion` coverage** — the chisel-stroke draw (`Hero.tsx:37`), the 22 s `blob-drift` ambient loop (`globals.css:102`), and the `fade-up` keyframes (`globals.css:92`) all run unconditionally. This is a real accessibility hit on iOS/macOS users with Reduce Motion on, and it's the single P0. Second, the `blob-drift` animation runs infinitely on three blurred 640/520/420-px radial-gradient blobs at the same time — three continuously animating `filter: blur(64px)` layers is the exact compositor pattern Chromium's perf docs warn about, and it will chew battery on low-end mobile even if it doesn't move the CWV needle in a 15 s Lighthouse run.

The chisel-stroke earns its pixels. Bronze→teal `stroke-dashoffset` on a 1.2 s cubic-bezier(0.65, 0, 0.35, 1) delayed by 0.4 s under the H1 keyword — this is exactly the Val Head criterion for purposeful motion: it draws the eye to the word that carries the product's meaning, it happens once, it uses a real easing curve. Keep it.

## 2. Motion inventory

| Location | file:line | Trigger | Duration | Easing | Purpose | Reduced-motion? | Verdict |
|---|---|---|---|---|---|---|---|
| Chisel-stroke underline (H1 keyword) | `sections/Hero.tsx:37` | Page load, 0.4 s delay | 1.2 s | `cubic-bezier(0.65, 0, 0.35, 1)` | Draw attention to the brand-carrying word | No | **Keep**. Purposeful, well-eased, one-shot. Gate on reduced-motion. |
| Ambient blob drift ×3 | `globals.css:97-104`, applied `Ambient.tsx:9,10,11` | Page load | 22 s | `ease-in-out infinite` | Ambient life; atmosphere | No | **Nerf**. Three simultaneous animated blurred blobs is a compositor tax with no attention job. See §6 + P1. |
| `.fade-up` reveal keyframe | `globals.css:81-94` | Not applied anywhere in `sections/*` today | 0.6 s | `ease-out both` | Defined but unused | No | **Delete** or wire up with reduced-motion gate. Dead CSS is a smell. |
| CTA arrow slide on hover | `sections/Hero.tsx:81`, `sections/BetaCTA.tsx:26`, `sections/EvidenceClaim.tsx:19` | Hover | Tailwind default 150 ms | Tailwind default `ease-in-out` | Micro-affordance — "this is a link, going somewhere" | Partial (Tailwind's `transition-transform` respects OS reduced-motion natively? **No** — Tailwind does not; must be gated explicitly) | **Keep**. 0.5 rem translate is exactly right, subtle, purposeful. Cheap on GPU (transform-only). |
| CTA `hover:brightness-110` | `sections/Hero.tsx:78`, `sections/BetaCTA.tsx:23` | Hover | Tailwind default 150 ms | ease | Feedback | n/a (compositor filter) | **Keep**. Cheap. |
| Card `hover:border-*` / `hover:bg-*` | `sections/Programs.tsx:142`, `sections/EvidenceClaim.tsx:11`, everywhere | Hover | 150 ms | ease | Affordance | n/a | **Keep**. |
| `<details>` open rotation of chevron | `sections/WontDo.tsx:10` | Click on summary | Tailwind default 150 ms | ease | State feedback — "opened" | n/a | **Keep**. Textbook state-cue. |
| Segmented control button transition | `sections/ThreeWayContrast.tsx:49,62` | Tap | 150 ms | ease | Toggle feedback | n/a | **Keep**. |
| Mobile snap carousel scroll | `sections/Programs.tsx:84` | Touch drag | Native | Native (browser scroll physics) | Content navigation | Native (browser respects OS reduced-motion for scroll) | **Keep**. CSS `snap-x snap-mandatory`, zero JS. Best practice. |
| Nav link opacity/color | `Nav.tsx:8-20`, `Footer.tsx:*` | Hover | 150 ms | ease | Affordance | n/a | **Keep**. |
| CTA drop shadow (bronze) | `sections/Hero.tsx:78`, `sections/BetaCTA.tsx:23` | Static | — | — | Depth — the button is the thing to click | n/a | **Keep**, static. |

Total moving pixels above the fold on load: one 292-pixel chisel stroke (1.2 s, one-shot) + three 640/520/420-px translate-only drifts (22 s loop, ~20 px range). Motion budget is tiny. This is the correct call for quiet authority.

## 3. Reduced-motion compliance

**Zero matches for `prefers-reduced-motion`** across `landing/src/**` (verified with grep). This is the biggest single defect in the audit.

Concretely, under macOS System Settings → Accessibility → Display → Reduce motion (or Windows equivalent):

- The chisel-stroke still animates (`Hero.tsx:37`). It's a 1.2 s stroke draw; not a distraction risk, but the spec (MDN, WCAG 2.3.3 Animation from Interactions) says user preference wins.
- The three ambient blobs still drift 20 px over 22 s, forever (`globals.css:102`). This is exactly the class of continuous background motion the reduced-motion media query was created to disable.
- `transition-transform` on hover-slide arrows will still play. Small but ignored preference.

Fix — add to `globals.css`:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
    scroll-behavior: auto !important;
  }
}
```

That kills all three violations in one rule and is the industry-standard shim (Andy Bell's `reset.css`, Josh Comeau's snippet, MDN docs, Anthropic's own docs use variants of this). No component-level changes needed.

**P0.** No exceptions.

## 4. Core Web Vitals — LCP

**Measured: 2.0 s. Threshold: 2.5 s. Pass with 500 ms headroom.**

LCP element (measured, from Lighthouse trace against static export): the hero sub-paragraph `<p class="mt-6 max-w-xl text-base leading-relaxed text-white/70 sm:text-lg">Adaptive training that reads your log every session…</p>` at `Hero.tsx:71`.

That the LCP is a text element, not an image, is the reason LCP is 2.0 s. There is no `<Image>` on the landing to prioritise, no OG image loading above the fold, no hero photo — the mockup phone frame is CSS-drawn (`mockups/PhoneFrame.tsx:22`). This is exactly the pattern Addy Osmani recommends for content-driven landing pages: if you don't need a hero image, don't ship one, and let the H1/sub-copy be the LCP.

Font loading is the only real gate on this LCP. Two woff2 files are `<link rel="preload">`ed in the head (verified in `out/index.html`): Inter latin subset (40 KB, `70bc3e132a0a741e-s.p.*.woff2`) and JetBrains Mono latin subset (48 KB, `83afe278b6a6bb3c-s.p.*.woff2`). Both use `display: swap` (`layout.tsx:8,14`). The measured 2.0 s FCP == 2.0 s LCP means the browser waited for those fonts to arrive before painting text (WOFF2 arrived and text painted in one go). That's the trade-off with `display: swap` + preload: no invisible-text period on fast networks, one paint on 4G-slow.

**Room to improve, not needed to pass**: the render-blocking CSS is 9.3 KB gzipped / 52 KB uncompressed. On 4G-slow that's the 730 ms Lighthouse flagged. If you ever push FCP under 1.8 s (currently 2.0 s, "needs improvement" band per Google), inlining the above-the-fold critical CSS is where the gain lives. Not worth doing today. Ship as is.

**No LCP image, so no `<Image priority>`, no `fetchpriority="high"`, no `sizes` conversation** — all correctly absent. If you ever add a hero image, revisit this section.

## 5. Core Web Vitals — CLS

**Measured: 0.001. Threshold: 0.1. Two orders of magnitude under.**

Why: no lazy-loaded images, no ads, no embeds, fonts are preloaded with `display: swap` on a body that already has `-webkit-font-smoothing: antialiased` and `font-variant-numeric: tabular-nums` (`globals.css:50-52`). No unsized media. The one interactive state change on load is `<details>` (`WontDo.tsx`) — collapsed by default, opens on click below the fold, not counted.

The 0.001 residual is likely the font-metrics-adjust between Inter fallback and Inter arriving — well under noise. Nothing to fix.

## 6. Core Web Vitals — INP

**Measured proxy: TBT 50 ms. Lighthouse does not measure INP directly.** Field-INP correlation from Google's docs: TBT under 200 ms strongly predicts INP under 200 ms. This landing passes comfortably.

Main-thread work per interaction:

- **Segmented control tap** (`ThreeWayContrast.tsx:47,60`): `useState` + re-render of 2-column mobile table. React 19.2 on a component that renders ~30 nodes. Trivial. This is the only interactive React island on the page.
- **`<details>` toggle** (`WontDo.tsx:7`): native `<details>` — no JS. Native compositor animation. Zero INP cost.
- **Carousel scroll** (`Programs.tsx:83-99`): CSS-only `snap-x snap-mandatory`. Zero JS. Native.
- **Nav / footer link taps**: static Next `<Link>` prefetches. No handler.

The lurking risk is the ambient `blob-drift` animation. It runs continuously on **three simultaneous blurred layers with `blur-3xl`** (Tailwind for `filter: blur(64px)`) on 420/520/640-px elements. Compositor thread, not main thread — so it won't inflate TBT/INP — but on low-end Android devices with weak GPUs it is a real battery/heat pattern. The animation only translates 20 px over 22 s. Recommend: pause when `prefers-reduced-motion: reduce`, and consider pausing when the tab is hidden (`document.visibilityState`) or when the section scrolls out of view. Bare minimum, gate on reduced-motion (§3 already covers this).

## 7. Image strategy

**There are no images on the landing.** No `<img>`, no `next/image`, no `<Image>`, no `background-image: url(…)`, no SVG assets from disk. The only SVG is the inline chisel-stroke (`Hero.tsx:12-45`) which is generated from JSX. The only "background image" is the CSS gradient grid overlay (`Ambient.tsx:15-18`) — pure gradient, no fetch.

This is the correct answer for a text-driven B2C/prosumer landing and it is a huge part of why LCP is 2.0 s. Do not change this without a very good reason.

`next.config.ts:6-8` sets `images.unoptimized: true` because output is `export` — irrelevant given zero images are used, but correctly configured for the Cloudflare Pages target.

If you eventually add an OG social image for real-world sharing (`layout.tsx:25-31` declares `openGraph` metadata without an `images` array — some social platforms will fall back to a screenshot), that image lives at `og.png` and is loaded by crawlers, not visitors. It never touches CWV.

## 8. Font loading strategy

Two Google Fonts served through `next/font/google` (`layout.tsx:2, 5-15`): `Inter` and `JetBrains_Mono`, both `display: swap`, both self-hosted after build (verified — the woff2 files sit at `out/_next/static/media/*.woff2`, no external Google DNS lookup at runtime). Both preloaded via `<link rel="preload" as="font" type="font/woff2" crossorigin>` (verified in `out/index.html`).

This is textbook. Nothing to change.

One nit: the preload manifest ships **both** Inter (~40 KB) and JetBrains Mono (~48 KB). JetBrains Mono is only used for `mono-caps`, `font-mono` class, and numeric readouts (stats, HR/RPE columns). Above the fold it's used on: the beta badge (`Hero.tsx:56`), the three stats (`Hero.tsx:117`), and the "Cites" caption pattern. All present in the initial paint. So the preload is defensible — the alternative (preload only Inter, let Mono swap in) would introduce a small FOFT on the mono-caps and stat numbers that's arguably worse than the 48 KB tax. Leave it.

`display: swap` (`layout.tsx:8, 14`) is the right call for CWV — never invisible-text period. The fact that measured FCP==LCP at 2.0 s suggests the preloaded fonts landed before FCP anyway, so swap never triggers on 4G-slow. Perfect.

## 9. JS payload on the landing

**141 KB gzipped across 7 chunks** on the production static export (measured from `network-requests` audit).

Largest three chunks:
- `08ttfj81-47mu.js` — 72 KB gzipped, 28 KB unused-JS flagged by Lighthouse. This is the Next.js runtime bundle (React 19.2 + Next 16 client).
- `1f5ust74o0qp9.js` — 45 KB gzipped.
- `19mx3mg6lkumu.js` — 8 KB gzipped.

For a Next 16 + React 19.2 app that renders a static page with **one** `"use client"` island (`ThreeWayContrast.tsx:1`), 141 KB is reasonable — you can't get much lower without ejecting the framework. The 28 KB unused-JS is the framework's client runtime carrying features this page never uses.

The single `"use client"` island for a mobile segmented control that toggles a `useState<"template"|"trainer">` is a defensible use of a client component (the compare state has to live somewhere), but if you wanted to eliminate the last React island entirely, this is doable with a pure CSS `:has(:checked)` + hidden radio pattern — the exact trick Anthropic docs use for their tab widgets. Saves ~5 KB and one hydration boundary. Not worth doing today; call it if the perf budget ever gets tight.

Zero third-party JS (`third-party-summary`: no third-parties). No analytics, no gtag, no Segment, no Vercel Analytics, no Sentry, no chat widget. `landing/src/app/privacy/page.tsx:42-43` confirms this is a deliberate posture ("zero analytics or tracking scripts during beta"). Keep it. When you eventually add analytics, prefer a first-party proxy or an edge-side beacon (Cloudflare Web Analytics is one-line and first-party) rather than reintroducing a client script.

## 10. Framework-specific notes

- **Next.js 16.3.0**, React 19.2.8, Tailwind 4 via PostCSS (`package.json:12-25`). Bleeding edge; the `AGENTS.md` note about "not the Next.js you know" is real and applies to future contributors.
- `output: "export"` (`next.config.ts:4`) — full static site generation, deployed to Cloudflare Pages per `MEMORY.md`. TTFB will be edge-served, comfortably ≤200 ms globally.
- `trailingSlash: true` (`next.config.ts:5`) — CF Pages friendly.
- Server components everywhere by default (the file list shows one `"use client"` in `ThreeWayContrast.tsx`). Correct discipline.
- Font loading via `next/font/google` — this compiles to self-hosted woff2 at build time, no runtime Google DNS. Verified in `out/_next/static/media/`.
- No `<Script>` tag anywhere. No `<Suspense>` boundaries needed (nothing streams).

**Turbopack** is bundling (default in Next 16). The dev-mode HMR client explains the 250 ms TBT on `:3000` — irrelevant to shipped perf.

## 11. Competitor benchmark

Picked three of the five referenced. All observations are from public-web reputation, prior audits, and design memory — not from re-fetching each site today.

**Stripe (stripe.com)** — the reference for subtle purposeful motion. Their hero uses a gradient-morph WebGL canvas that runs at 60fps and is off-main-thread; hover states on nav links are ~80 ms opacity/color; scroll-triggered reveals are 400 ms staggered opacity fades gated by `IntersectionObserver`. **Terav's landing is quieter than Stripe.** That's a defensible position for "quiet authority" — Stripe is selling infrastructure to devs who like polish; Terav is selling training discipline to lifters who distrust polish. Terav wins on restraint. Stripe wins on choreography if you ever need to sell "look how much thought went into this."

**Anthropic docs (docs.claude.com)** — the reference for editorial restraint. Zero decorative animation. Hover states are ~100 ms. Focus states are visible and non-decorative. Reduced-motion is respected. **Terav's landing is close but not equal**: Anthropic honours `prefers-reduced-motion`; Terav does not (§3). Fix that and Terav is peer.

**Apple.com (product pages)** — the reference for choreographed scroll narrative. Scroll-linked video scrubbing, sticky sections, parallax layers gated by `IntersectionObserver`. **Terav has none of this and shouldn't.** Apple's product pages are cinematic ads. Terav's landing is a claim + evidence + programs + CTA. Different job. The right thing to steal from Apple is the discipline of one motion per section, and the way they gate everything on reduced-motion (they do — verified in prior audits). Steal the discipline, not the scroll-videos.

Net: Terav is in the right neighbourhood — closer to Anthropic than Stripe on the restraint axis, which matches the brand voice. The only gap that puts Terav behind all three references is reduced-motion compliance.

## 12. Priorities — P0 / P1 / P2

### P0 — do before next deploy

1. **Add `prefers-reduced-motion: reduce` global reset in `globals.css`** (see §3 snippet). Fixes chisel-stroke, blob-drift, and hover-slide arrows in one media query. ~6 lines of CSS. No component changes. This is a WCAG 2.3.3 concern and an iOS accessibility default; it is the one defect that makes this landing worse than the Anthropic/Stripe reference.

2. **Delete the unused `.fade-up` class + keyframe from `globals.css:81-94`** or wire it up. Dead CSS is a smell in a codebase this disciplined. Grep shows zero call sites in `src/**`.

### P1 — do this week

3. **Nerf the ambient `blob-drift` animation.** Three simultaneous `filter: blur(64px)` layers translating on an infinite loop is the pattern that shows up on low-end Android GPU-thermal profiles. Options in order of restraint (pick one):
   - **Cheapest**: reduce to a single blob animating; the other two stay static. The atmospheric effect survives.
   - **Middle**: keep all three but pause on `document.visibilityState !== "visible"` via a one-line client component or set `animation-play-state: paused` and use `:has()` / IntersectionObserver equivalent. Marginal complexity gain, real battery win.
   - **Purist**: remove the animation entirely. Static gradient blobs read the same in a screenshot. Deletion is the ultimate optimisation.
   - The `prefers-reduced-motion` fix in P0 already covers the a11y case. This item is about the always-on cost.

4. **Consider dropping the `"use client"` on `ThreeWayContrast.tsx:1`** by replacing `useState<"template"|"trainer">` with a `<input type="radio">` + `:has(:checked) ~ …` CSS selector pattern. Kills the last React hydration boundary. Saves ~5 KB. Purely a discipline move; not needed for CWV.

5. **Set `NEXT_PUBLIC_` or in-metadata OG image** in `layout.tsx:25-31` so social crawlers don't fall back to server-rendered screenshots. Not a landing-render concern but adjacent to the 2025 image-strategy discussion.

### P2 — nice to have

6. **Inline critical CSS above the fold.** The 9.3 KB render-blocking CSS costs 730 ms on Lighthouse's 4G-slow throttle. Getting FCP under 1.8 s (currently 2.0 s, borderline) would move the last remaining metric into "good". Next 16 supports this via the App Router's CSS extraction plus a Turbopack option; check the migration notes at `node_modules/next/dist/docs/` per project `AGENTS.md`. Only worth it if you decide FCP-borderline matters for the story you're telling perf-side.

7. **When you add analytics**, use a first-party edge beacon (Cloudflare Web Analytics for CF Pages is one line and first-party; Vercel Analytics if you migrate). Do not reintroduce a third-party client script — the "zero third-parties" audit result is a competitive advantage in this niche.

8. **Chisel-stroke curve review** (`Hero.tsx:37`). Current: `cubic-bezier(0.65, 0, 0.35, 1)` over 1.2 s with a 0.4 s delay. This is a symmetric ease — draws in slowly, ends slowly. Sarah Drasner's canonical "material" ease is `cubic-bezier(0.4, 0, 0.2, 1)` (Material's standard) — starts fast, settles slow — which reads as "chiselled" (the stroke lands with authority instead of feathering to a stop). Try it. This is a taste call, low stakes; not urgent.

---

**Bottom line for the founder:** the landing already ships the "quiet authority" motion posture and hits CWV green on throttled mobile out of the box. There is exactly one defect that puts you behind the reference sites — `prefers-reduced-motion` — and it is a six-line CSS fix. Do P0 (a11y + dead-code delete), sleep well, ship.
