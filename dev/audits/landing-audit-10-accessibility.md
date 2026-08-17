# Terav landing — Accessibility audit (WCAG 2.2 AA)

Baseline: WCAG 2.2 Level AA. Viewports evaluated: 375 px + 1280 px. Automated scan: axe-core CLI failed to launch (ChromeDriver 152 vs installed Chrome 151 mismatch on this workstation); source-inspection only.

Source: `landing/src/app/layout.tsx`, `landing/src/app/page.tsx`, `landing/src/app/globals.css`, `landing/src/components/sections/*.tsx`, `landing/src/components/Nav.tsx`, `landing/src/components/Footer.tsx`, `landing/src/components/Ambient.tsx`, `landing/src/components/Wordmark.tsx`, `landing/src/components/mockups/*.tsx`.

## 1. Overall a11y verdict

Partial pass. The page gets the biggest things right — one `<h1>`, a global `:focus-visible` bronze outline, native `<button>` / `<a href>` for every interaction, `<html lang="en">`, high-contrast primary text — and would survive most automated tooling. It fails on four things a manual expert audit catches: **no `<main>` landmark and no skip link** (SC 2.4.1 Bypass Blocks), **incomplete `role="tablist"` ARIA pattern** in `ThreeWayContrast.tsx` (SC 4.1.2 Name/Role/Value), **`text-white/40` used for real label text** in the phone mockup (SC 1.4.3 Contrast Minimum, 3.78 : 1 fails 4.5 : 1), and **no `prefers-reduced-motion` handling** on the two decorative animations (SC 2.3.3 Animation from Interactions, at AAA — but the ambient blob drift risks vestibular symptoms and is trivial to gate). None are architectural. All are small edits.

## 2. Landmark structure (SC 1.3.1, 2.4.1)

Enumerated landmarks on the home page:

| Landmark | Element | Source |
|---|---|---|
| banner | none | — |
| navigation | `<nav>` | `landing/src/components/Nav.tsx:7` |
| main | **missing** | `landing/src/app/page.tsx:17` renders a bare `<div>` around all sections |
| contentinfo | `<footer>` | `landing/src/components/Footer.tsx:8` |

**Fail — SC 2.4.1 Bypass Blocks / SC 1.3.1 Info and Relationships.** The page has no `<main>` element. Every screen-reader user has to arrow past the whole `<nav>` and Hero eyebrow to reach primary content on every visit. Wrap the section stack in `<main id="main">`.

**Fail — SC 2.4.1 Bypass Blocks.** No skip link exists (`grep sr-only\|Skip to` returns zero matches). Add a first-focusable `<a href="#main" className="sr-only focus:not-sr-only …">Skip to content</a>` in `landing/src/app/layout.tsx:53`, and a matching `sr-only` utility class in `globals.css` (Tailwind v4 no longer ships one by default here).

Nav has no accessible name — there is only one navigation landmark on the page so this is technically fine per ARIA authoring practices, but adding `aria-label="Primary"` at `Nav.tsx:7` future-proofs against a footer nav being added later.

Footer subsections "Product" and "Legal" (`Footer.tsx:24, 50`) are `<div className="mono-caps">` rather than headings. Not required by SC, but the two link lists inside would benefit from `<h2>` labels for programmatic grouping.

## 3. Heading hierarchy (SC 1.3.1, 2.4.6)

DOM-order heading tree walked from `page.tsx`:

- **h1** — `Hero.tsx:60` — `{t.h1_a} … {t.h1_b}` (gradient keyword)
- h2 — `ThreeWayContrast.tsx:144` — via `SectionHead`, `{t.contrast.title}`
- h2 — `YourFirstWeek.tsx:51` — "This is Engine Builder, Week 1."
  - h3 — `YourFirstWeek.tsx:82` — each day's session name (×3)
- h2 — `Programs.tsx` — via `SectionHead` at line 77
  - h3 — `Programs.tsx:156` — each program card name (×5)
- h2 — `BetaCTA.tsx:8` — `{t.h2_a}` / `{t.h2_b}`

Exactly one `<h1>`. No level skips. Pass — SC 1.3.1, SC 2.4.6.

Sections without headings — `EvidenceClaim.tsx` (an announcement `<Link>` block), `WontDo.tsx` (`<details>/<summary>`), `OriginStory.tsx` (`<blockquote>` under a `mono-caps` eyebrow) — are minor SC 1.3.1 friction. The eyebrow `<div>`s should ideally be `<h2>` where the section carries meaning. Softest P1.

## 4. Interactive semantics (SC 4.1.2, 2.1.1)

Full enumeration of interactive nodes on the home route:

| Element | Type | File | Notes |
|---|---|---|---|
| Wordmark link | `<Link href="/">` | `Nav.tsx:8` | native anchor, good |
| Evidence link | `<Link href="/evidence">` | `Nav.tsx:12` | good |
| Sign in | `<a href={APP_URL/sign-in}>` | `Nav.tsx:18` | good |
| Hero primary CTA | `<a>` | `Hero.tsx:76` | good |
| Hero secondary "Browse programs" | `<a href="/programs">` | `Hero.tsx:83` | good |
| Hero "how it works" jump | `<a href="#how-it-works">` | `Hero.tsx:91` | good; target `id="how-it-works"` exists at `YourFirstWeek.tsx:48` |
| Compare tabs (×2) | `<button role="tab">` | `ThreeWayContrast.tsx:44, 58` | native `<button>` — semantics OK; role incomplete — see §10 |
| Evidence claim card | `<Link href="/evidence">` | `EvidenceClaim.tsx:9` | good |
| Program cards (×5) | `<a>` | `Programs.tsx:140` | good |
| Roadmap link | `<a href="/roadmap">` | `Programs.tsx:110` | good |
| WontDo disclosure | `<summary>` inside `<details>` | `WontDo.tsx:7–13` | native, keyboard-operable |
| BetaCTA primary | `<a>` | `BetaCTA.tsx:22` | good |
| BetaCTA email | `<a href="mailto:…">` | `BetaCTA.tsx:29` | good |
| Footer links (×6) | `<Link>` / `<a>` | `Footer.tsx:27–65` | good |

Grep results confirm zero instances of `<div onClick>`, zero `role="button"` on non-buttons, zero `<a>` without `href`. **Pass — SC 4.1.2, SC 2.1.1** on interactive semantics.

No form controls exist on the home page (email capture is a `mailto:` anchor at `BetaCTA.tsx:29`), so SC 3.3.2 (Labels or Instructions) is not exercised on this route.

## 5. Focus management (SC 2.4.7, 2.4.11, 2.4.3)

**SC 2.4.7 Focus Visible — pass.** `globals.css:64` sets a global `*:focus-visible { outline: 2px solid var(--color-bronze); outline-offset: 2px; }`. No component grep result for `outline-none`, `outline: none`, or `focus:outline-none` — no override anywhere in `landing/src/`. The bronze `#d09a68` outline on the `#0e0f12` ground yields a **7.74 : 1** ratio (see §6), well above the 3 : 1 required by SC 1.4.11 for focus indicators.

**SC 2.4.11 Focus Not Obscured (Minimum) — pass.** No sticky headers, cookie banners, or overlays that could clip the focus ring were found. `Nav.tsx:7` is `relative`, not `sticky` / `fixed`, so it does not overlap page content on scroll.

**SC 2.4.3 Focus Order — pass.** No positive `tabindex` values used anywhere (`grep tabIndex` returns matches only inside `PlanMockup.tsx` `aria-label` strings). Tab order = DOM order = visual order.

Focus indicator uniformity — the outline width (2 px) plus offset (2 px) meets SC 2.4.11 minimum contrast area (24 CSS px² adjacent, from the 2024 clarification). Pass.

## 6. Color contrast (SC 1.4.3, 1.4.11)

Contrast computed from actual hex tokens in `landing/src/app/globals.css:8–46` against the primary background `--color-ground: #0e0f12` (relative luminance L ≈ 0.00435, using sRGB linearization + `L = 0.2126 R + 0.7152 G + 0.0722 B`).

| Foreground | Hex / effective | Background | Ratio | Required | Verdict | Source |
|---|---|---|---|---|---|---|
| `--color-strong` | `#f4f5f7` | `#0e0f12` | **17.8 : 1** | 4.5 : 1 | pass | Wordmark, headings |
| `--color-ink` | `#d6d9de` | `#0e0f12` | **13.6 : 1** | 4.5 : 1 | pass | body text |
| `--color-muted` | `#8a8f9a` | `#0e0f12` | **5.9 : 1** | 4.5 : 1 | pass | `.mono-caps`, eyebrows |
| `--color-faint` | `#5a5f6a` | `#0e0f12` | **3.06 : 1** | 4.5 : 1 (text) / 3 : 1 (UI) | fail as text, pass as UI | if used for body copy anywhere — currently not used on home |
| `text-white/90` | ≈ `#e6e7e8` | `#0e0f12` | **15.6 : 1** | 4.5 : 1 | pass | `WontDo.tsx:16` |
| `text-white/85` | ≈ `#dadbdc` | `#0e0f12` | **13.9 : 1** | 4.5 : 1 | pass | `Nav.tsx:19`, Hero secondary CTA |
| `text-white/70` | ≈ `#b6b7b8` | `#0e0f12` | **9.6 : 1** | 4.5 : 1 | pass | Hero sub `Hero.tsx:71`, ThreeWayContrast rows |
| `text-white/60` | ≈ `#9e9fa0` | `#0e0f12` | **7.2 : 1** | 4.5 : 1 | pass | most secondary copy |
| `text-white/40` | ≈ `#6f7071` | `#0e0f12` | **3.78 : 1** | 4.5 : 1 (text) | **fail as body text** / pass as decorative | see §7 |
| `--color-bronze` `#d09a68` | | `#0e0f12` | **7.74 : 1** | 4.5 : 1 | pass | focus outline, dot pips |
| `--color-bronze-hi` `#e8b988` | | `#0e0f12` | **10.5 : 1** | 4.5 : 1 | pass | eyebrow accents, gradient text |
| `--color-teal` `#7fc4d0` | | `#0e0f12` | **9.96 : 1** | 4.5 : 1 | pass | dot pips, category chips |
| `--color-teal-hi` `#a0d8e0` | | `#0e0f12` | **12.3 : 1** | 4.5 : 1 | pass | |
| `--color-amber` `#e0a63a` | | `#0e0f12` | **8.03 : 1** | 4.5 : 1 | pass | proposal text `TodayMockup.tsx:63` |
| `--color-green` `#5fb37a` | | `#0e0f12` | **7.36 : 1** | 4.5 : 1 | pass | AVAILABLE chip |
| `--color-red` `#e5654b` | | `#0e0f12` | **5.79 : 1** | 4.5 : 1 | pass | not used on home |
| black text on `bronze-lo` `#a67a4a` (worst end of Hero CTA gradient) | `#000` | `#a67a4a` | **5.51 : 1** | 4.5 : 1 | pass | `Hero.tsx:78`, `BetaCTA.tsx:23` |
| black text on `bronze-hi` `#e8b988` (start of gradient) | `#000` | `#e8b988` | **11.4 : 1** | 4.5 : 1 | pass | same |

**Non-text UI contrast (SC 1.4.11) — pass.** Bronze focus outline **7.74 : 1**, chip borders `border-white/15` at ≈ 2.1 : 1 vs ground fail 3 : 1 in isolation but chips are decorative accents around a text label, not the boundary of a UI control; they carry no meaning users rely on. Buttons themselves have solid fills (Hero primary) or borders at `white/15` supplemented by high-contrast text, so the control boundary is discernible.

**Failure — SC 1.4.3.** `text-white/40` at 3.78 : 1 is used for actual text in `TodayMockup.tsx:96–101` (the "Set / Time / HR / RPE" table labels and the empty-row placeholders `—`). Also `PhoneFrame.tsx:24` uses `text-white/60` (7.2 : 1, fine) for the status bar. And `PhoneFrame.tsx:31` neutral dot. But the mockup is real DOM text that assistive tech reads. Either raise these to `white/60` (still visually quiet, ratio 7.2 : 1) or mark the whole phone mockup `aria-hidden="true"` at `PhoneFrame.tsx:22` since it duplicates messaging present in the Hero copy. `aria-hidden` on the mockup is the cleanest fix — screen-reader users don't need a duplicated fake-app announcement anyway.

`WontDo.tsx:10` chevron `<span className="text-white/40">↓</span>` is decorative UI (state indicator adjacent to a `<summary>` whose text conveys state programmatically via `[open]`), so 3.78 : 1 is within the SC 1.4.11 3 : 1 requirement — pass. But mark it `aria-hidden` so screen readers don't read "down arrow" as content.

## 7. Media / non-text (SC 1.1.1)

Zero `<Image>` or `<img>` tags in `landing/src/components/`. The only non-text content is:

- `ChiselStroke` decorative `<svg>` at `Hero.tsx:12–44` — carries `aria-hidden` on the outer `<svg>` (`Hero.tsx:14`). Pass — SC 1.1.1 decorative.
- `BottomNavStrip` icons `<svg>` at `BottomNavStrip.tsx:13–45` — no `aria-hidden`, but they render inside `TodayMockup` which itself has no `aria-hidden`. Screen readers will announce them as unlabeled graphics. Adding `aria-hidden` on the mockup wrapper solves this in one line — see §6.
- `Ambient.tsx` background gradient blobs — pure `<div>` with `background:` styles, no semantics. Fine.
- Wordmark bronze pip — decorative `<span>` at `Wordmark.tsx:13`, no ARIA needed.

Icon-only buttons: none on this route. `PlanMockup.tsx:16, 21` have `aria-label="Previous week"` / `"Next week"` but PlanMockup is not rendered on `page.tsx`.

Pass — SC 1.1.1.

## 8. Motion sensitivity (SC 2.3.3, 2.2.2)

Three animations defined:

1. `blob-drift` — 22 s ease-in-out infinite, ±20 px translate, applied to three large blurred blobs (`globals.css:97–104`, used at `Ambient.tsx:9–11`).
2. `fade-up` — 0.6 s translate + opacity, defined at `globals.css:81–94` but grep shows no consumers on the home route (defined but not used).
3. `chisel-draw` — 1.2 s stroke-dashoffset animation on the hero underline (`Hero.tsx:34–41`), fires once on load.

**SC 2.3.3 Animation from Interactions (AAA)** is not required at AA, but the ambient blob drift is a continuous background motion. **No `@media (prefers-reduced-motion: reduce)` block exists anywhere in `landing/src/`** — grep confirms zero matches. This is the standard fix a manual audit catches that axe misses.

Fix in `globals.css`:

```css
@media (prefers-reduced-motion: reduce) {
  .blob-drift,
  .fade-up,
  .chisel-path {
    animation: none !important;
  }
}
```

**SC 2.2.2 Pause, Stop, Hide — pass.** The blob drift runs longer than 5 s but does not "start automatically" in the SC-defined sense (it is decorative background motion parallel to static content, not a moving/blinking/scrolling widget conveying information). Text does not animate. Auto-playing carousel or marquee — none.

## 9. Keyboard operability (SC 2.1.1, 2.1.2)

Mental walkthrough at 1280 px:

1. Tab 1 → Wordmark link (Nav)
2. Tab 2 → Evidence link
3. Tab 3 → Sign in
4. Tab 4 → Hero primary CTA
5. Tab 5 → Hero secondary "Browse programs"
6. Tab 6 → "How it works" anchor
7. Tab 7 → Contrast tab 1 (desktop hides these; on mobile they're first tabbable Hero-below block)
8. Tab 8 → Contrast tab 2
9. Tab 9 → Evidence claim card
10. Tabs 10–14 → Program cards ×5
11. Tab 15 → Roadmap link
12. Tab 16 → `<summary>` (WontDo)
13. Tab 17 → BetaCTA primary
14. Tab 18 → BetaCTA email
15. Tabs 19–24 → Footer links

No keyboard traps. All CTAs reach with Tab + Enter. `Space` activates `<button>` and `<summary>`, `Enter` activates anchors. `Esc` behavior: no modals, so no obligation.

`ThreeWayContrast` tab pair (`ThreeWayContrast.tsx:44–70`): as `<button>` elements they are Tab + Enter/Space operable — passes SC 2.1.1. But because they carry `role="tab"` (which promises a full ARIA tablist pattern), a screen-reader user will expect arrow-key navigation between tabs, `role="tabpanel"` for the switched content region, and `aria-controls` linking each tab to its panel. None of that exists (`ThreeWayContrast.tsx:72–98` is a plain `<div>` with no `role="tabpanel"` and no `id`). See §10.

**Pass — SC 2.1.1, SC 2.1.2** for basic keyboard operability. **Fail — SC 4.1.2** on the tab role misuse (§10).

Horizontal snap carousel (`Programs.tsx:83–99`) contains focusable `<a>` cards — Tab moves focus and browser auto-scrolls the offscreen card into view. Keyboard-accessible. Pass.

## 10. ARIA usage

Native-first score is high. Total ARIA attributes in the home route:

| Attribute | Location | Verdict |
|---|---|---|
| `aria-hidden` on decorative SVG | `Hero.tsx:14` | correct |
| `aria-hidden` on carousel dots | `Programs.tsx:96` | correct — dots are non-functional |
| `role="tablist"` | `ThreeWayContrast.tsx:41` | **incomplete pattern — see below** |
| `role="tab"` (×2) | `ThreeWayContrast.tsx:46, 59` | incomplete |
| `aria-selected` (×2) | `ThreeWayContrast.tsx:47, 60` | present but insufficient alone |

**Failure — SC 4.1.2 Name, Role, Value.** The tab pattern in `ThreeWayContrast.tsx:41–70` promises `role="tablist"` semantics but doesn't ship them: no `aria-controls` pointing at the panel, no `id` on the switched panel (`ThreeWayContrast.tsx:72`), no `role="tabpanel"` on the panel, no `tabIndex={0}` on the panel, no `aria-labelledby` back-reference, no roving-tabindex arrow-key handler on the tab buttons. NVDA / VoiceOver users will hear "tab 1 of 2, selected" but pressing Right arrow does nothing and there is no tabpanel to focus into.

Two fixes acceptable at AA:

- **Option A (fastest, recommended)** — drop `role="tablist"` / `role="tab"` / `aria-selected` at `ThreeWayContrast.tsx:41–70` and treat these as plain toggle `<button>`s with `aria-pressed={compare === "template"}`. That is honest about the widget: it's a two-way toggle, not a tabs pattern.
- **Option B** — complete the tabs pattern: add `id="tabpanel-compare"` and `role="tabpanel"` on the wrapper at `ThreeWayContrast.tsx:72`, add `aria-controls="tabpanel-compare"` on both buttons, add `id="tab-template"` / `id="tab-trainer"` on the buttons, add `aria-labelledby={\`tab-${compare}\`}` on the panel, add arrow-key handler with roving `tabIndex`.

Everything else is correct or benign. Nav landmark is `<nav>` — no redundant `role="navigation"`. Footer is `<footer>` — no redundant `role="contentinfo"`. No `role="button"` on `<div>`. No `aria-hidden="true"` on interactive elements.

## 11. Language & metadata (SC 3.1.1)

`<html lang="en">` set at `layout.tsx:52`. Pass — SC 3.1.1.

No mixed-language content in `dictionaries/` (the "Terav = sharp" note is annotated in English, no untranslated Estonian sentences in the copy). If Estonian localisation ships later, ensure `<html lang>` is swapped by locale and any bilingual copy uses `<span lang="et">` for individual foreign words.

`layout.tsx:17–38` metadata is thorough (title, description, OG, Twitter). `viewport` at `layout.tsx:40` uses `width=device-width, initialScale=1`, no `maximumScale` cap and no `user-scalable=no` — pass **SC 1.4.4 Resize Text** and **SC 1.4.10 Reflow**.

## 12. Priorities

### P0 — SC failures, ship blockers

1. **Add `<main>` landmark.** `landing/src/app/page.tsx:19` — wrap `<div className="relative">…</div>` as `<main id="main" className="relative">`. Fixes SC 1.3.1 + enables the skip-link target.
2. **Add skip link.** `landing/src/app/layout.tsx:53` — inject `<a href="#main" className="sr-only focus:not-sr-only …">Skip to content</a>` as the first body child, and define `.sr-only` + `.sr-only:focus` (or `focus:not-sr-only`) rules in `globals.css`. Fixes SC 2.4.1.
3. **Fix the tab pattern in `ThreeWayContrast.tsx:41–70`.** Prefer Option A (drop tab semantics; use `aria-pressed`). Fixes SC 4.1.2.
4. **Fix `text-white/40` real-text usage in `TodayMockup.tsx:96`** — either mark the whole phone mockup `aria-hidden="true"` at `PhoneFrame.tsx:22` (recommended — the mockup is decorative, its content duplicates the Hero pitch) or lift `text-white/40` to `text-white/60`. Fixes SC 1.4.3.

### P1 — best-practice, high impact

5. **Honor `prefers-reduced-motion`.** Add the media query block in `globals.css` shown in §8. Prevents vestibular symptoms from the ambient blob drift. Common WCAG 2.2 review finding.
6. **Mark decorative chevron `aria-hidden`.** `WontDo.tsx:10` — add `aria-hidden` to the `<span>` containing `↓`. Screen readers currently read "down arrow" as content.
7. **Mark `Ambient` container `aria-hidden="true"`.** `Ambient.tsx:8` — outer wrapper is purely presentational.
8. **Nav accessible name.** `Nav.tsx:7` — add `aria-label="Primary"`. Not required today (single nav), but cheap future-proofing.

### P2 — polish

9. Promote Footer "Product" / "Legal" `<div className="mono-caps">` labels at `Footer.tsx:24, 50` to `<h2>` so the two link lists are programmatically grouped for AT users.
10. Consider promoting eyebrow `<div>`s inside `EvidenceClaim`, `WontDo`, `OriginStory` to `<h2>` when the section carries meaning — improves the SR landmark rotor.
11. On the mobile carousel at `Programs.tsx:83`, add `role="region" aria-label="Programs"` and `tabIndex={0}` on the scroll container so keyboard users on desktops in touch-emulation mode can pan with arrow keys before diving into card focus. Nice-to-have.
12. Once localisation switches on, plumb `lang` through `layout.tsx:52` from the same source that drives `getDict()` at `page.tsx:15`.

### Non-issues (documented to save re-audit time)

- One `<h1>` — pass.
- Heading hierarchy has no skips — pass.
- Global `:focus-visible` outline with bronze at 7.74 : 1 — pass.
- Body / primary / eyebrow / accent contrast all pass 4.5 : 1 or 3 : 1 by wide margins (§6 table).
- Native `<button>` and `<a href>` everywhere; no `<div onClick>`; no `role="button"` on non-buttons.
- `<details>/<summary>` for the WontDo disclosure — correct native pattern, no ARIA needed.
- `<html lang="en">` set.
- Viewport supports pinch-zoom (SC 1.4.4, 1.4.10).
- No keyboard traps; tab order = DOM order = visual order.
- No form controls on the home route — SC 3.3.1/3.3.2 not exercised.
