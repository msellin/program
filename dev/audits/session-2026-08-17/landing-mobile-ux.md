# Terav landing — Mobile UX audit (session 2026-08-17, live at terav.fit)

Viewport basis: iPhone SE 375×667, iPhone 15 Pro 393×852, iPhone 15 Plus 414×896. Desktop cross-check 1280×720. Landscape sanity 812×375. Specs: iOS HIG 44pt, Material 3 48dp, Hoober 2021 thumb zones.
Screenshots + `boundingBox()` measurements at `/Users/margussellin/www/program/dev/audits/session-2026-08-17/shots/` (Playwright, iOS UA, `isMobile:true`, `hasTouch:true`, DPR 2).

---

## Verdict

The three-line H1 lands. On 375×667 the primary CTA sits at y=520 of 667 — right on the thumb-zone/two-thumb boundary in Hoober's 2021 map (bottom third starts ~y=445). At 393×852 the CTA sits at y=494 of 852 (upper middle third — reachable, small stretch on one-handed use); the Today mockup peeks in above the fold at y≈700, which is the intended affordance. Zero horizontal overflow at any tested viewport (`scrollWidth === clientWidth` at 375/393/414/812/1280). The new Scope row in the mobile 2-column comparison card fits: card measured 399px tall at 375×667 and 380px at 393×852 — no over-scroll, "When it adjusts" fully visible without inner scroll. The one thing done right for touch: `globals.css:79-94` applies `-webkit-tap-highlight-color: transparent` and `touch-action: manipulation` to every interactive role, plus `active:` scale — the site *feels* like an app, not a brochure. The one ergonomic failure worth flagging: `Pick my focus` is not full-width at 375, forcing a right-thumb reach to a 166px pill anchored at x=20. Every direct comp (Runna, Robinhood beta, Superhuman) uses full-bleed primary CTAs below 640px. That's the only P0.

---

## Top 5 findings by blast radius

### 1. Primary CTA is left-anchored, not full-bleed on ≤414px
**Where:** `landing/src/components/sections/Hero.tsx:78-92` — parent is `flex flex-col items-start gap-3 sm:flex-row`. `items-start` on mobile means the CTA takes only its content width (166px measured at 375, x=20..186). Same shape at `BetaCTA.tsx:20-33` — content-width pill, centered.
**Impact:** For a right-handed one-handed grip at 375×667, the CTA center-point sits at x=103, y=545. Hoober's map for 375-class phones marks the left half of the bottom third as the *stretch* zone for the right thumb — reachable, but forces a grip shift. Every direct comp ships full-bleed below 640px.
**Fix (S):** Add `w-full sm:w-auto` to both anchors in Hero.tsx:81 and Hero.tsx:88, same to BetaCTA. `sm:flex-row` auto-releases the width on desktop. One class per CTA.

### 2. Sub-pages use `min-h-screen` — iOS Safari address-bar bug
**Where:** `landing/src/app/evidence/page.tsx:141`, `landing/src/app/roadmap/page.tsx:257`, `landing/src/app/programs/page.tsx:16`, `landing/src/app/programs/[slug]/page.tsx:40`, `landing/src/components/LegalLayout.tsx:16`. Root landing at `page.tsx:17` correctly uses `min-h-dvh`; `globals.css:69` also uses `100dvh` on body — sub-page shells regressed.
**Impact:** `100vh` reports the *large* viewport height on iOS Safari with the address bar expanded, then doesn't recompute on collapse. On short-content pages (privacy/terms/disclaimer/roadmap intro) users see a ground-color gap. The exact class of bug Rachel Andrew's `dvh` fix was written for.
**Fix (S):** Global replace `min-h-screen` → `min-h-dvh` across those 5 files.

### 3. Programs snap carousel has no active-position affordance
**Where:** `landing/src/components/sections/Programs.tsx:91-99` — dots are `aria-hidden`, all rendered identically at `bg-white/25`, no active-state binding.
**Impact:** The carousel itself is well-tuned — `snap-x snap-mandatory`, `snap-center`, `basis-[82vw]` gives the ~9vw peek that Apple.com/iphone tunes (theirs is 85vw; 82vw is defensible). But five identical decorative dots vs a five-card carousel *promises* position feedback the code doesn't deliver. Josh Clark (Tapworthy): a position indicator without a position is noise.
**Fix (M):** Either (a) delete the dots — peek alone is the affordance, Airbnb does this on chip rails, 1 line; or (b) wire real active state via `IntersectionObserver` on the snap children, toggling `bg-white` on the intersecting card's dot, ~30 lines. Recommend (a).

### 4. Interactive cards are hover-only affordances
**Where:** `EvidenceClaim.tsx:11-19`, `Programs.tsx:142` (ProgramCard), `YourFirstWeek.tsx:57-80` (day cards) all use `hover:border-white/…` + `hover:bg-white/[0.04]` with no `focus-visible:` sibling. `globals.css:87-94` saves them with a `summary:active` / `a:active` scale, but the color/border affordance is invisible to touch users.
**Impact:** Desktop visitors get the "this is tappable" reveal on hover; mobile visitors see static cards until tap. Systemic pattern across all interactive card surfaces on the landing.
**Fix (S):** Add `focus-visible:border-white/25 focus-visible:bg-white/[0.04]` alongside every `hover:` on interactive cards. Systemic fix: `.card-interactive` utility in `globals.css` pairing hover + focus-visible + active so no future card can regress. Blast radius: EvidenceClaim, 5 ProgramCards, 3 YourFirstWeek day cards.

### 5. Hero stat row wraps at 393px, competes with H1 for attention
**Where:** `landing/src/components/sections/Hero.tsx:116-120,126-133` — `<Stat>` value uses `font-mono text-lg` (18px), no `whitespace-nowrap`. At 393×852 each stat column has ~110px effective width — "5 programs" and "Your focus" each wrap to two lines. Confirmed in `shots/393x852-contrast.png` top-of-frame.
**Impact:** These read like fintech numbers-with-labels ("88 / CITED STUDIES"). When the value slot wraps, they become three-line stacks visually competing with the H1's own three-line composition 100px above. Primary noise in the fold-plus-one region.
**Fix (S):** `className="font-mono text-base sm:text-xl leading-tight"` on the value div at Hero.tsx:130. Cross-scope: → see landing-visual-craft for the full type-ramp reasoning.

---

## Specifically requested spot-checks

**(1) H1 three-line composition on 375×667.** Fits. Measured y-positions on 375: Nav ends y≈68, Beta badge y=88, H1 line-1 y=134, H1 line-2 (gradient) y=192, H1 line-3 (`text-2xl font-medium`) y=282, sub-paragraph y=344, CTA y=520. CTA sits 147px above the fold — comfortable. On 393×852 the Today mockup peeks above the fold, intended affordance. No wrapping problems. Passes.

**(2) Scope row in ThreeWayContrast, mobile 2-col card.** No over-scroll. Card heights: 399px at 375×667, 380px at 393×852, 380px at 414×896. Card top at y≈380 on 375 → bottom at y=779, ending 112px above natural page bottom. All three rows (Scope / What you get / When it adjusts) fit inside the card without inner overflow. Toggle swap between "vs. Template apps" and "vs. A trainer" preserves card height (both tested — `shots/375x667-contrast.png` and `shots/375x667-contrast-trainer.png`). Passes cleanly.

**(3) `Pick my focus` CTA tap target + thumb reach.** Measured 166×48 on 375/393, 181.7×52 on desktop. 48px height clears HIG 44pt and Material 3 48dp. Vertical position (y=520/375, y=494/393) is reachable-with-stretch, not "cannot reach." Placement is the issue — see finding #1. Critique is placement, not size, not zone.

---

## Passed without concern

- Viewport meta `layout.tsx:40-45` — `initialScale:1`, `width:device-width`, `viewportFit:'cover'`, no `user-scalable=no`.
- Tap targets: Nav (`Nav.tsx:14,20`), Footer (`Footer.tsx:27-63`), Hero secondary (`Hero.tsx:96`), ThreeWayContrast toggles (measured 136×44 and 101×44) — all meet HIG.
- Horizontal overflow: none at any tested viewport.
- `-webkit-tap-highlight-color` + `touch-action: manipulation` global at `globals.css:79-86` — no 300ms delay, no iOS grey flash.
- `prefers-reduced-motion` honored globally at `globals.css:120-129`.
- Skip link at `layout.tsx:55-60` uses `focus:not-sr-only` — doesn't fight touch layout.
- Programs snap carousel item width 82vw — near-optimal peek (finding #3 is about the dots).
- Landscape 812×375 — hero H1 reflows to 2 lines, above-fold content present, gradient stroke correctly positioned (`shots/812x375-landscape-fold.png`).
- No form inputs on the landing → no 16px iOS zoom trap. Signup lives on `app.terav.fit`.
- No sticky/fixed nav → no address-bar-collapse stacking. Nav is `relative z-10` at `Nav.tsx:7`.
- Safe-area env() — not needed (no sticky top nav, no sticky bottom CTA). Comes back if future changes add either.

---

## What I did NOT cover

- **App subdomain mobile UX.** Signup form ergonomics live in `next-app/src/app/sign-up/` — out of landing scope.
- **PWA install prompt on the new `terav.fit` domain.** Service-worker / domain-migration bug class. → see a fresh live-URL pass.
- **CWV / entry animation perf.** Chisel-stroke SVG at `Hero.tsx:34-43` and blob-drift at `globals.css:107-115`. → see landing-motion-perf.
- **Type-ramp math beyond finding #5.** → see landing-visual-craft.
- **Copy meaning of "Pick my focus" vs "Build my plan."** Covered by `dev/audits/landing/2026-08-17-positioning-focused-vs-full-plan.md`. → see landing-conversion-strategist.
- **A11y semantics of the `aria-pressed` toggle vs full ARIA tablist.** Author noted trade-off at `ThreeWayContrast.tsx:47-49`. → see landing-accessibility.
- **Systemic focus-visible coverage beyond finding #4.** → see landing-accessibility.
- **Cookie banner / chat widget / modal + `viewport-fit=cover`.** None present.
