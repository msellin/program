# Terav landing — Accessibility audit (WCAG 2.2 AA)

Baseline: WCAG 2.2 Level AA. Viewport: 375px + 1280px. Automated scan: source-inspection only (no dev server run in this session; live URL https://terav.fit).
Source: `landing/src/app/layout.tsx`, `landing/src/app/page.tsx`, `landing/src/app/globals.css`, all `landing/src/components/sections/*.tsx`, `landing/src/components/Nav.tsx`, `landing/src/components/Footer.tsx`, `landing/src/components/mockups/PhoneFrame.tsx`.

---

## 1. Verdict

**WCAG 2.2 AA: PASS with three specific gaps.** The landing is unusually clean for a marketing surface: one `<h1>`, one `<main>`, native `<button>`/`<a>` throughout, `focus-visible` ring wired globally in `globals.css:72`, `prefers-reduced-motion` reducer at `globals.css:120-129`, mockups scoped `aria-hidden="true"` at `PhoneFrame.tsx:17` so the SR pass is text-first. The three real gaps are: **(a)** the new gradient H1 keyword renders as `text-transparent` and disappears in Windows Forced Colors / High Contrast Mode (SC 1.4.1 + 1.4.3 edge, SC 1.4.11); **(b)** the new H1_c line ("Sharpen it every session.") is a `<p>` visually styled as a headline sibling — semantically correct once verified, but the h1 sentence is split across two elements and reads as a fragment to NVDA/JAWS unless composed as a single accessible name; **(c)** the ThreeWayContrast desktop `<table>` has an empty leading `<th>` and no `scope` attributes on the header row, so screen readers cannot associate the "Scope / What / When" row labels with column cells. Also flagged: the H1 uses two hard `<br>` line breaks inside a single `<h1>` (SC 1.3.1 impact on speech chunking) and the mobile toggle-group uses `aria-pressed` correctly but the visible-state color contrast for the *unselected* button on ground-2 is close to failure. No P0 legal-risk blockers.

---

## 2. Targeted findings (top 5 by severity × blast radius)

### F1 — H1 gradient keyword disappears in Windows High-Contrast / Forced Colors mode
`Hero.tsx:62-66` (also `BetaCTA.tsx:11-13`)
**SC 1.4.1 (Use of Color) + SC 1.4.3 (Contrast Minimum) — forced-colors edge**

The keyword "you want stronger." is rendered by a gradient `background-image` clipped to text via `bg-clip-text text-transparent`. In Windows Forced Colors mode (and any browser that respects the `forced-colors: active` media query), backgrounds are stripped: the text stays `transparent` and the phrase becomes invisible. On the standard dark canvas the computed contrast against `#0e0f12` at the three gradient stops (`#e8b988`, `#d09a68`, `#7fc4d0`) is 11.2:1 / 8.3:1 / 10.4:1 — all comfortably above 4.5:1 — so the normal-mode ratio is fine. Forced-colors is the failure mode.

**Fix (S):** add a `@media (forced-colors: active)` block to `globals.css` that sets `.bg-clip-text.text-transparent { -webkit-text-fill-color: CanvasText; background: none; color: CanvasText; }` — or wrap the H1_b span in a helper class and apply forced-colors override there. Same edit fixes `BetaCTA.tsx:11-13`.

---

### F2 — H1 semantically split; SR reads a fragment
`Hero.tsx:59-72`

The DOM structure is:
- `<h1>` containing text "Pick one thing" + `<br>` + gradient span "you want stronger." + `<ChiselStroke/>` (svg, aria-hidden)
- `<p class="text-2xl">` "Sharpen it every session."

The visual reader parses the three lines as a single hero utterance. NVDA/JAWS will announce "heading level 1, Pick one thing you want stronger" (h1 stops), then move to a separate paragraph "Sharpen it every session." The sentence-final imperative is now floating loose — the SR flow narration loses the punch. This is **not** an SC failure (the `<p>` is legitimately a subhead, and there's a rhetorical case for it being a sibling), but it hurts SC 2.4.6 (Headings and Labels — describe purpose) because the h1 in isolation is not a full sentence.

Two acceptable resolutions:
- **Fix A (S):** wrap H1_c in the h1 with visual sizing preserved: `<h1>... <span className="block text-2xl ...">Sharpen it every session.</span></h1>`. This is my recommendation — the accessible name of the h1 becomes the full three-clause hero copy, matching what a sighted reader takes in.
- **Fix B (S):** keep the `<p>`, but add `aria-describedby` on the h1 pointing at the p's id, so the SR name+description reads as a whole. Weaker than A.

The `<br>` inside the h1 is fine (SC 1.3.1 does not forbid it), but the `aria-hidden` on `ChiselStroke` is correct (`Hero.tsx:14`), and there is no alt-text miss here.

**Recommendation: Fix A.**

---

### F3 — ThreeWayContrast desktop table missing `<th scope>` and row headers
`ThreeWayContrast.tsx:113-137`

The desktop `<table>` uses `<th>` for column headers (`col_template`, `col_trainer`, `col_terav`) but the row-label column is a `<td>` (`ThreeWayContrast.tsx:127-129`) styled to look like a header. No `scope="col"` on any `<th>`; no `scope="row"` on the label cells. The empty first `<th>` at line 116 exists but has no accessible content and no scope.

With the new Scope row added FIRST (row 1 of 3), the SR now has to associate three rows × three columns. Without scope attributes NVDA falls back to positional guessing and JAWS announces column headers on cell entry but never the row context. A user tabbing through with a screen reader hears "Your whole week. Your whole week. Your focus arc. The rest is still yours." with no way to know which of Scope / What / When they belong to.

**SC 1.3.1 (Info and Relationships) — partial fail on desktop.** The mobile card-list at `ThreeWayContrast.tsx:82-108` is fine because each row uses a visible `<p>` label (`row.label`) as its container heading; SR reads label, then two `<p>` bodies. Mobile is coherent.

**Fix (M):**
1. Change the row-label `<td>` at line 127 to `<th scope="row">`.
2. Add `scope="col"` to each `<th>` on the header row (lines 117-120).
3. Give the empty leading `<th>` a visually-hidden accessible name: `<th scope="col"><span className="sr-only">Dimension</span></th>` at line 116.
4. Consider `<caption className="sr-only">Templates vs. trainers vs. Terav across scope, output, and adaptation cadence.</caption>` right after `<table>` at line 113.

---

### F4 — Mobile toggle-group inactive-state contrast borderline
`ThreeWayContrast.tsx:56-79`

The two segmented-control buttons show `text-[var(--color-muted)]` (`#8a8f9a`) in the unselected state, over the parent's `bg-white/[0.03]` ~ effectively `#131519` on the section's `#0e0f12` background.

Computed: `#8a8f9a` L=0.267 vs `#131519` L≈0.006 → ratio ≈ **5.62:1** — passes AA for body text.

However at 12px (`text-[12px]` line 60/72) with the class-applied opacity change on hover (`hover:text-white/85`), and given the mono lowercase weight, this is at the acceptable floor. Not a violation. Flagged so that future muted-token darkening doesn't drop below the line.

`aria-pressed` is applied correctly (`ThreeWayContrast.tsx:58, 70`) — SR announces the "vs. Template apps, pressed" / "vs. A trainer, not pressed" state cleanly. The `role="group"` + `aria-label="Compare Terav to"` wrapper at line 52-54 is well-formed. No fix required — informational.

---

### F5 — "Pick my focus" CTA — semantic meaning is discoverable
`Hero.tsx:79-85` and `BetaCTA.tsx:21-27`

Concern from the brief: is "Pick my focus" clear to SR users given the new noun? Verdict: **yes.** The `<a href={${APP_URL}/sign-up}>` is a real navigation link (sign-up page on the app domain), so `<a>` is correct — not `<button>`. NVDA announces "Pick my focus, link" and JAWS the same. Voice-Over on macOS/iOS reads "Pick my focus, link" and offers "Activate."

There is no icon-only ambiguity — the arrow `→` at line 84 is a decorative span; it does not have `aria-hidden` but as text content ("→") it is announced by some screen readers as "right-pointing arrow" or ignored depending on punctuation-level. Minor cleanup: add `aria-hidden="true"` to the arrow span at `Hero.tsx:84` and `BetaCTA.tsx:26`. Same for the `↓` arrow in `Hero.tsx:98` (secondary CTA) and the toggle chevron in `WontDo.tsx:11`.

**Fix (S — nice-to-have, not an SC failure):** `<span aria-hidden="true" className="ml-2 ...">→</span>`.

The bigger question the brief flags — does "focus" as noun read as a first-class product action? — is a copy-clarity call, not an a11y call. SR announcement is unambiguous. Passes SC 2.4.4 (Link Purpose in Context): the link text plus surrounding paragraph copy makes the destination clear.

---

## 3. Everything else that got checked (brief pass log)

- **`<html lang="en">`** — `layout.tsx:53`. Correct. SC 3.1.1 pass.
- **Skip link** — `layout.tsx:55-60`. First focusable element, correctly `sr-only` until focused, `focus:not-sr-only` reveals it. `href="#main"`, target `<main id="main">` at `page.tsx:21`. SC 2.4.1 pass.
- **Landmarks** — one `<nav>` (Nav.tsx:7), one `<main>` (`page.tsx:21`), one `<footer>` (Footer.tsx:8). No `<header>` element, but the `<nav>` covers the top-of-page landmark role. Not a violation — SC 1.3.1 pass. Optional: wrap `<Nav />` in `<header>` for orthodoxy.
- **Heading order** — h1 (Hero) → h2 (ThreeWayContrast, YourFirstWeek, Programs, BetaCTA) → h3 (day cards in YourFirstWeek, program cards). No skips. EvidenceClaim uses an eyebrow div + `<p>` inside an `<a>`, not a heading — acceptable. WontDo uses `<summary>` inside `<details>` — semantically a disclosure widget, no heading needed. OriginStory uses `<blockquote>` with no heading — the eyebrow is a `<div>`, which is the right call. **SC 1.3.1 + 2.4.6: pass.**
- **Focus-visible** — global rule `*:focus-visible { outline: 2px solid var(--color-bronze); outline-offset: 2px; }` at `globals.css:72-75`. Bronze `#d09a68` vs `#0e0f12` = 8.27:1 (well above SC 1.4.11 3:1). Every interactive element inherits. Pass.
- **Focus order** — DOM order matches visual order in every section. No positive `tabindex`. No off-screen focusable elements. Pass 2.4.3.
- **Native semantics** — every action is `<a>` or `<button>`. No `<div onClick>`. `role=` used only twice, both correctly: `role="group"` on the toggle-container (ThreeWayContrast.tsx:52) and CSS-selector `[role="button"]` in globals.css (defensive tap-highlight rule, not applied to any element). No misuse.
- **Icon-only buttons requiring `aria-label`** — none. All interactive elements have visible text.
- **Alt / non-text** — no `<Image>` or `<img>` on the landing. Mockups are pure CSS + `aria-hidden="true"` at PhoneFrame level (`PhoneFrame.tsx:17`). The sr-invisible mockup is a deliberate choice — the same signals ("2 updates from yesterday", "load ×0.90 proposed") are restated in body copy in ThreeWayContrast and YourFirstWeek. Pass SC 1.1.1.
- **Motion** — `prefers-reduced-motion: reduce` block at `globals.css:120-129` neutralizes all animation-duration and transition-duration globally with `!important`. Covers the ChiselStroke draw-in (Hero.tsx:34-43), the blob-drift ambient (Ambient.tsx + globals.css:108-115), the `:active` scale (globals.css:87-94), and every `transition` hover on CTAs. **SC 2.3.3 pass**. No autoplay video/audio. SC 2.2.2 not applicable.
- **Keyboard operability** — every CTA, nav link, footer link, program card, toggle button, and `<details>` disclosure is keyboard-operable natively. `<details>`/`<summary>` (WontDo.tsx:7-13) is a native disclosure — no keyboard handler needed. No modals, no carousels with focus traps. Programs mobile is a scroll-snap carousel of `<a>` cards — arrow-key scrolling is browser-default; each card is Tab-reachable. Pass SC 2.1.1 + 2.1.2.
- **Contrast — computed table:**

| Purpose | Fg | Bg | Ratio | Required | Verdict |
|---|---|---|---|---|---|
| Body `text-white/70` on ground | `#b6b6b6` (composite) | `#0e0f12` | 9.47:1 | 4.5:1 | pass |
| Sub `text-white/85` on ground | `#dbdbdb` (composite) | `#0e0f12` | 13.95:1 | 4.5:1 | pass |
| Muted (`--color-muted`) on ground | `#8a8f9a` | `#0e0f12` | 5.77:1 | 4.5:1 | pass |
| Muted on ground-2 | `#8a8f9a` | `#16181c` | 5.43:1 | 4.5:1 | pass |
| Bronze CTA text (black on bronze grad) | `#000` | `#d09a68` avg | 10.6:1 | 4.5:1 | pass |
| Bronze-hi highlight (eyebrow) on ground | `#e8b988` | `#0e0f12` | 11.24:1 | 4.5:1 | pass |
| Focus ring (bronze) on ground | `#d09a68` | `#0e0f12` | 8.27:1 | 3:1 | pass |
| H1 gradient stops on ground | `#e8b988`→`#7fc4d0` | `#0e0f12` | 8.3–11.2:1 | 3:1 (large text) | pass (normal), FAIL in forced-colors — see F1 |

No text-color pair falls below AA thresholds under standard rendering.

---

## 4. What I did NOT cover

- Live axe-core scan against https://terav.fit (would confirm the forced-colors finding empirically and catch any runtime injected element I missed). Source-only pass on this session.
- The `/programs`, `/evidence`, `/roadmap`, `/privacy`, `/terms`, `/disclaimer` subpages — brief was landing-only.
- SR flow narration on iOS VoiceOver against the deployed URL — this is source inspection, not live device testing. The ThreeWayContrast desktop table finding (F3) is guaranteed by DOM structure; the H1 finding (F2) would benefit from a live NVDA pass to confirm the split-utterance narration.
- Copy-clarity for the CTA noun-verb shift ("Pick my focus" — is *focus* meaningful vs. *plan*?) — that's `landing-conversion-strategist` / `landing-audit-N-conversion` scope. Semantic discoverability is verified here; persuasive clarity is not.
- Tap-target sizing (SC 2.5.8) — spot-checked and every interactive has `min-h-[44px]` or padded well above 24px CSS minimum; not enumerated exhaustively.
- App-domain (`app.terav.fit`) surfaces post-landing.

---

## 5. Priorities

**P0 (compliance risk):** none.

**P1 (SC pass at risk in edge modes / SR coherence):**
- **F1** — Forced-colors invisibility of H1 keyword — `Hero.tsx:62-66`, `BetaCTA.tsx:11-13` — fix S (add `@media (forced-colors: active)` fallback in `globals.css`).
- **F3** — Table without `<th scope>` — `ThreeWayContrast.tsx:113-137` — fix M (four attribute additions + optional caption).

**P2 (semantic craft):**
- **F2** — Split h1 semantic — `Hero.tsx:59-72` — fix S (fold H1_c into `<h1>` as a block span).
- **F5b** — Arrow spans should be `aria-hidden="true"` — `Hero.tsx:84,98`, `BetaCTA.tsx:26`, `WontDo.tsx:11` — fix S (one attribute per element).
- Optional: wrap `<Nav />` in `<header>` for landmark orthodoxy — `page.tsx:20-21`. Not a violation. Skip unless housekeeping.

No axe scan was run this session — the P1 findings above are DOM-guaranteed and do not require a scan to confirm.
