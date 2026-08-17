# Terav landing — Visual craft audit (session 2026-08-17)

Viewport basis: 375px, 393px, 1280px. Tailwind rem base = 16px. Live URL: https://terav.fit.
Screenshots: `dev/audits/session-2026-08-17/shots/hero-{375,393,1280}.png`, `contrast-{375-scrolled,1280}.png`.
Sources read: `landing/src/app/globals.css`, `landing/src/components/sections/Hero.tsx`, `landing/src/components/sections/ThreeWayContrast.tsx`, `landing/src/i18n/dictionaries/en.ts`, plus `Nav.tsx`, `Wordmark.tsx`, `YourFirstWeek.tsx`, `Programs.tsx`, `WontDo.tsx`, `OriginStory.tsx`, `BetaCTA.tsx`, `EvidenceClaim.tsx`, `app/page.tsx`.

---

## Verdict — go-with-caveats

The composition holds. Type ramp is disciplined (one display face, one accent gradient, four weights in use), the accent economy is honest (bronze primary, teal secondary, all three "semantic" reds/greens/ambers cordoned to state), the rhythm system is real (mostly `sm:py-24` sections, `mt-6/8/10` betweens). The new H1_c "Sharpen it every session." earns its own line — it functions as a lead sub-headline, not a rider on H1, and the size step from H1 (48px) → H1_c (24px) → sub (16px) is a clean 2:1 chord.

Three caveats keep this from a clean go:

1. **The chisel underline is a lie at 375 and 393**. H1_b wraps to two lines on both real iPhone widths ("you want" / "stronger.") and the SVG stroke is absolutely positioned to the wrapping `<span>` — it slashes diagonally underneath the *entire* wrapped block, sitting under the descender of "stronger." only. It reads as an underline of "stronger." with an orphan bronze slash floating above "you want." At 1280 it lands correctly. This is the single most damaging finding in the audit because the chisel is the brand's visual signature.
2. **The new Scope row breaks row-height parity on mobile** (`ThreeWayContrast.tsx:19-28`). "Your focus arc. The rest is still yours." wraps to 3 lines in the Terav card vs. 2 lines in "Your whole week" — visible ragged rhythm in the 2-col mobile layout. Fixes are copy-side (tighten Terav text) or layout-side (equal-height grid rows).
3. **H1_c at `text-2xl` (24px) sits inside a size gap.** H1 = 48px, H1_c = 24px, sub = 16px. The 48→24 step is a clean halving; 24→16 is 1.5. That's fine on its own. But H1_c is set on `leading-tight` (1.25 → 30px line-height on 24px), one line at 375. It reads as a subhead. Consider dropping H1_c to `text-xl` (20px) so the visual hierarchy chord becomes 48/20/16 and H1_c stops competing with the sub for the eye's first landing.

The site is disciplined enough that these are surgical fixes, not a rework.

---

## Top 5 findings ranked by blast-radius

### 1. Chisel underline detaches from H1_b when the line wraps · Blast: high · Fix: S

`landing/src/components/sections/Hero.tsx:59-68`. `<h1>` uses `text-balance` with an inline `<span className="relative inline-block">` wrapping H1_b, and `<ChiselStroke>` absolutely positions itself `absolute -bottom-1 left-0 w-full` inside that span. When H1_b breaks — which it does at 375 (48px type in ~335px column) and at 393 — the SVG stretches diagonally under the wrapped block. Visually, the stroke lands only under "stronger." with a bronze slash above "you want."

**Fix**: two options, pick one.

- **A (preferred, S)**: force H1_b to never wrap. Add `whitespace-nowrap` to the inner gradient span. Requires H1_b copy to fit ~11ch at 48px in ~335px. Current H1_b "you want stronger." at ~48px in Geist bold is ~305–320px. Marginal. If it clips, drop H1 mobile from `text-5xl` to `text-[44px]` — costs 4px of type presence, gains a working brand signature.
- **B (M)**: rewrite `ChiselStroke` to sample the wrapped span's last-line bounding box (via `getClientRects()` in a client component) and draw only under the last visual line. More flexible, more code, more chances to break.

`text-balance` (line 59) also fights this by rebalancing wraps at render — `sm:hidden` the `<br>` (line 61) already exists, so the mobile wrap is deliberate. Kill `text-balance` on H1 too, or accept that the chisel and text-balance are incompatible.

### 2. Scope row breaks row-height parity in the mobile 2-col grid · Blast: med-high · Fix: S

`landing/src/components/sections/ThreeWayContrast.tsx:82-108` renders each row as its own 2-col grid. Because each row is a fresh grid instance, tallest card in the row dictates row height — but rows do not align to each other. Result at 375: the SCOPE row's Terav cell is 3 lines ("Your focus arc. / The rest is still / yours."), Template cell is 2 lines ("Your whole week"). WHAT YOU GET row is balanced (both 2 lines). WHEN IT ADJUSTS row is balanced (both 2 lines). SCOPE is the outlier.

Verified in `shots/contrast-375-scrolled.png` — SCOPE Terav cell visibly tallest, an unbalanced first impression for the section.

**Fix (S)**: tighten Terav-scope copy. `en.ts:30` reads `"Your focus arc. The rest is still yours."` — 41 chars, 3 lines at 13.5px. Try `"One focus arc. Rest is yours."` (30 chars, 2 lines) or `"A focus arc. Rest stays yours."` — matches the terse pattern of the other two rows and keeps the "rest is yours" promise. The "focus arc" phrase already appears in the sub (Hero) and Y1W section; you're not risking the concept.

Alternative M fix: use CSS grid `auto-rows-fr` with equal-height rows so the tallest cell dictates all sibling row heights across the section. Overengineered for a 3-row list; do the copy fix.

### 3. H1_c at 24px competes with the sub for hierarchy weight · Blast: med · Fix: S

`Hero.tsx:70-72`. Class chain: `text-2xl font-medium leading-tight tracking-tight text-white/85 sm:text-3xl`. At 375 = 24px / 30px line-height / white/85. Sub (line 74) = `text-base text-white/70` = 16px / ~26px line-height / white/70. The 24→16 step is 1.5× — technically distinct, but H1_c is only 15% opaque-brighter than sub and lives right above it with 12px gap (`mt-3`). At real thumb-scan speed on 375, the eye reads two paragraphs of similar-weight text.

Refactoring UI move: widen the chord. Either **shrink H1_c** to `text-xl sm:text-2xl` (20/24px) and keep it as a bridge, **or grow the gap** — move `mt-3` (12px) to `mt-4` (16px) so the sub reads as a distinct block. Or both. My call: `text-xl` (20px) mobile, `sm:text-2xl` (24px) tablet, `md:text-3xl` (30px) desktop, and bump gap to `mt-4`. Result: hierarchy chord = 48 / 20 / 16 = 2.4× / 1.25× — the octave that hero copy wants.

### 4. `text-balance` on H1 + hardcoded `<br className="hidden sm:inline">` fight each other · Blast: low-med · Fix: S

`Hero.tsx:59-61`. Line 59 sets `text-balance` on the H1, and line 61 injects a manual line break at `sm+`. `text-balance` will fight to redistribute the wrap regardless of the `<br>` — you're paying the layout cost of both. On mobile (`sm:hidden` on the `<br>`), the browser wraps H1_a "Pick one thing" as its own line and H1_b "you want stronger." as its own — but `text-balance` will still try to re-flow the total two-word cluster of H1_b if given a fractional pixel. Empirically the mobile screenshot shows H1_b wrapping at "you want / stronger." — a 2/1 split that no reader wants (visual weight collapses to a single word on line 2).

**Fix (S)**: remove `text-balance` from the H1. Rely on the manual `<br>` for the intended sm+ line-break, and let mobile wrap naturally (which, combined with fix #1, will also unbreak the chisel).

### 5. Section rhythm has one drift — sub-block gaps on 24px betweens · Blast: low · Fix: S

Cross-section audit of vertical rhythm:

| Section | py mobile | py sm+ | Between-item gap |
|---|---|---|---|
| Hero (`Hero.tsx:51`) | `pt-8 pb-16` (32/64) | `sm:pt-16 sm:pb-24` (64/96) | `gap-10` (40) |
| ThreeWayContrast (`ThreeWayContrast.tsx:44`) | `py-16` (64) | `sm:py-24` (96) | `mt-8`, `mt-10` |
| Evidence (`EvidenceClaim.tsx:8`) | `py-10` (40) | `sm:py-16` (64) | inline |
| YourFirstWeek (`YourFirstWeek.tsx:44`) | `py-16` (64) | `sm:py-24` (96) | `mt-10` |
| Programs (`Programs.tsx:75`) | `py-16` (64) | `sm:py-24` (96) | `mt-10`, `mt-12` |
| WontDo (`WontDo.tsx:6`) | `py-10` (40) | `sm:py-16` (64) | — |
| Origin (`OriginStory.tsx:6`) | `py-10` (40) | `sm:py-16` (64) | — |
| BetaCTA (`BetaCTA.tsx:7`) | `py-16` (64) | `sm:py-24` (96) | — |

Two sizes of section: **major (`py-16/24`)** and **minor (`py-10/16`)**. The minor set is Evidence + WontDo + Origin — three "supporting" sections that are all cards-in-a-card. Deliberate. Keep.

The only drift: `Hero.tsx:70` uses `mt-3` (12px) between H1 and H1_c, and `mt-6` (24px) between H1_c and sub. Elsewhere the site uses 6/8/10 exclusively. `mt-3` is the outlier — see finding #3. Ships as `mt-4` (16px).

`Hero.tsx:94` uses a bare `mt-2` (8px) on the "See how it works" tertiary link — under the CTA row which has `mt-8` (32px). That's a rhythm break, but a defensible one (the tertiary link is a rider on the CTA cluster, not a peer to the sub). Keep.

---

## What I did NOT cover

- **Copy strength / positioning**. H1_c "Sharpen it every session." vs. the older single-sentence H1 — that's a copy call. Deferred to `landing-conversion-strategist` and the positioning audit at `dev/audits/landing/2026-08-17-positioning-focused-vs-full-plan.md`.
- **Thumb-reach and CTA tap targets** on the Hero CTA cluster. → `landing-mobile-ux`.
- **WCAG contrast ratios** on `white/85` H1_c, `white/70` sub, `white/60` tertiary link. Hierarchy is fine; a11y math is not in scope. → `landing-accessibility`.
- **Chisel-stroke animation timing** (currently 1.2s ease at 0.4s delay). Motion craft. → `landing-motion-perf`.
- **CORS / auth redirects / PWA install prompt on the new domain**. Called out in context.md as of interest, but out of scope for a visual audit.
- **Competitor benchmark ramp** (Linear/Stripe/Framer type scale side-by-side). Included in the prior full audit at `dev/audits/landing-audit-7-visual.md`; nothing shipped this session changes that comparison.
- **Icon stroke weights**. This landing barely uses icons — one Programs status pip, one CTA arrow, one details caret in WontDo. All consistent by omission; nothing to critique.
- **`text-white/85` vs `text-[var(--color-strong)]` inconsistency** across sections. Minor tokenization drift; not blast-worthy this session.
