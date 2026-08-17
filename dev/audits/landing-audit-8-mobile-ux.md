# Terav landing — Mobile UX audit (375 / 393 / 414 px)

Viewport basis: iPhone SE 375×667, iPhone 15 Pro 393×852, Plus/Max 414×896. Desktop 1280×720. Specs: iOS HIG 44pt, Material 3 48dp, Hoober 2021 thumb zone, Rachel Andrew dvh/svh/lvh (2023).
Source: `landing/src/app/layout.tsx`, `landing/src/app/globals.css`, `landing/src/app/page.tsx`, `landing/src/components/{Nav,Footer,Ambient,Wordmark}.tsx`, `landing/src/components/sections/*.tsx`, `landing/src/components/mockups/*.tsx`.
Screenshots: Playwright, real touch emulation (`isMobile: true, hasTouch: true, deviceScaleFactor: 2`), captured at 375×667, 393×852, 414×896, landscape 812×375, desktop 1280×720. Live measurements taken via `getBoundingClientRect()` on the built page at localhost:3000.

---

## 1. Overall mobile verdict

Solid B. The landing does not embarrass itself on a phone — no horizontal scroll (measured `document.documentElement.scrollWidth === viewport.width` at all three widths), the ThreeWayContrast regression from a prior audit is genuinely fixed (segmented control replaces the 640px table), Programs adopted a snap-carousel with peek, and the top-of-fold CTA is above 500px on 375×667.

Where it slips, it slips in ergonomic detail rather than in layout: primary tap targets are 48–50px which is fine, but every text link — nav Evidence, the "See how it works" scroll cue, the entire footer link cluster — is 17–22px tall CSS, which is a straight-up iOS HIG 44pt / Material 3 48dp failure. The viewport meta omits `viewport-fit=cover`, so `env(safe-area-inset-*)` is nowhere and cannot be (Beta CTA does not use it, but there is no sticky bottom bar so it is a smaller wound than in a productised app). Body `min-height: 100vh` is the pre-2023 pattern and produces the ~50px address-bar dead zone on iOS Safari that dvh fixed. Every interactive element carries a `hover:*` state and no matching `active:` or `focus-visible` (touch users get zero press feedback beyond the OS grey tap highlight). No `touch-action: manipulation`, so the 300ms double-tap zoom delay is theoretically still in play on iOS (mitigated in practice by `width=device-width` + `initial-scale=1`, but not defensively disabled).

No inputs on this page (all CTAs are `<a>` to `sign-up`), so form ergonomics is not in scope for the landing itself, but is a live concern for `/programs/[slug]` and any embedded email capture the beta later adds.

**Priorities headline**: three P0 (footer links, nav links, "See how it works" scroll cue — all under 30px), two P1 (missing `touch-action: manipulation` + `-webkit-tap-highlight-color`, missing `viewport-fit=cover` and dvh), rest P2.

---

## 2. Fold + thumb-zone map (375×667)

Measured element top offsets on 375×667 at scrollY=0:

| Element | `file:line` | Top (px) | Zone (Hoober 2021) |
|---|---|---|---|
| Wordmark (TERAV) | `Nav.tsx:8-10` | 27 | Hard (top third: 0–222) |
| Nav Sign-in pill | `Nav.tsx:18-23` | 20 | Hard |
| Beta badge chip | `Hero.tsx:53-58` | ~100 | Hard |
| H1 "Sharpen your edge." | `Hero.tsx:60-69` | ~170 | Hard→OK boundary |
| Sub-copy | `Hero.tsx:71-73` | ~310 | OK (middle third: 222–445) |
| **Primary CTA "Start the intake"** | `Hero.tsx:76-82` | **394** | **OK, near easy** |
| Secondary "Browse programs" | `Hero.tsx:83-88` | 454 | Easy (bottom third: 445–667) |
| "See how it works ↓" | `Hero.tsx:91-96` | 520 | Easy |
| Stats row (5 programs / 100+ / Every session) | `Hero.tsx:98-102` | ~600 | Easy |

Fold cuts around y=667. The primary CTA lands at 394–442px (top + 48px height), which is on the boundary of the middle and easy thumb zones — reachable one-handed on a 375px device without a stretch. This is well-tuned for a landing whose only conversion event is a single tap.

The upper-right nav Sign-in pill at y=20 is in the hardest reach zone (top-right corner of the phone in a right-handed one-handed grip is the canonical worst spot per Hoober 2021), but that is defensible — it is secondary intent, and the button size (79×34 measured) is generous horizontally.

The Wordmark at y=27 (78×20 measured) is a link to `/` (`Nav.tsx:8`). At 20px tall it is well under 44pt and technically hard-to-hit in the worst zone, but it is a logo-home affordance, not a conversion target, so ergonomic priority is lower.

Below fold, the pattern repeats correctly: BetaCTA final section places its Start-intake button roughly at page-bottom minus 400px, which puts it back in the easy zone after the user scrolls to the end. Good.

---

## 3. Tap target audit — table

All measurements are live from `getBoundingClientRect()` at 375×667, unless noted. Spec references: iOS HIG (Human Interface Guidelines, "Provide ample touch targets for interactive elements. Try to maintain a minimum tappable area of 44pt x 44pt"), Material 3 (48dp minimum, "Aim for at least 48 x 48 dp with 8dp between").

| Element | `file:line` | Measured (w × h CSS px) | HIG 44 | Material 48 | Verdict |
|---|---|---|---|---|---|
| Nav Sign-in | `Nav.tsx:20` (`px-4 py-1.5`) | 79 × 34 | fail | fail | **P0 — 10px below HIG** |
| Nav Evidence link | `Nav.tsx:12-16` (`text-sm`, no padding) | ~60 × 20 | fail | fail | Hidden below sm — desktop-only. On mobile: not present, so no bug. But mobile users have no "Evidence" nav anywhere in the header. |
| Wordmark link | `Nav.tsx:8-10` | 78 × 20 | fail | fail | P2 (home link, low intent) |
| Hero primary CTA "Start the intake" | `Hero.tsx:76-82` (`px-6 py-3.5 text-sm`) | 243 × 48 | pass | pass | Good |
| Hero secondary "Browse programs" | `Hero.tsx:83-88` (`px-6 py-3.5 text-sm`) | 255 × 50 | pass | pass | Good |
| Hero "See how it works ↓" | `Hero.tsx:91-96` (`text-[13px]`, no padding) | 119 × 20 | fail | fail | **P0 — scroll cue is a 20px underlined link, and it is a real navigation affordance to `#how-it-works`.** |
| Contrast segmented tabs | `ThreeWayContrast.tsx:44-69` (`px-4 py-2 text-[12px]`) | 136 × 34, 101 × 34 | fail | fail | **P0 — segmented control is 34px tall.** Two adjacent tabs 34px each with no separator spacing = a mis-tap risk. |
| Evidence claim card | `EvidenceClaim.tsx:9-23` (whole `<Link>` block, `py-4`) | ~343 × ~78 | pass | pass | Good — huge tap area, correct pattern. |
| WontDo `<details>` summary | `WontDo.tsx:8-13` | 293 × 22 | fail | fail | **P0 — the disclosure trigger itself is 22px CSS.** The `py-4` on the parent `<details>` gives visual breathing but the `<summary>` element itself is the click target. |
| Programs card (each) | `Programs.tsx:139-172` (whole `<a>`) | 308 × 296 | pass | pass | Good |
| BetaCTA primary | `BetaCTA.tsx:21-27` (`px-7 py-4 text-base`) | 277 × 56 | pass | pass | Good — bigger than hero, correct hierarchy for terminal CTA. |
| BetaCTA "Talk to the founder" mailto | `BetaCTA.tsx:28-33` (`px-7 py-4`) | 202 × 58 | pass | pass | Good |
| Footer Evidence | `Footer.tsx:26-30` | 61 × 17 | fail | fail | **P0** |
| Footer Sign in | `Footer.tsx:32-37` | 45 × 17 | fail | fail | **P0** |
| Footer Contact | `Footer.tsx:39-45` | 52 × 17 | fail | fail | **P0** |
| Footer Privacy | `Footer.tsx:52-56` | 49 × 17 | fail | fail | **P0** |
| Footer Terms | `Footer.tsx:57-60` | 41 × 17 | fail | fail | **P0** |
| Footer Medical disclaimer | `Footer.tsx:62-66` | 124 × 17 | fail | fail | **P0** (also the highest-legal-risk link on the page) |

**Adjacent-spacing note**: Material 3 asks for 8dp between adjacent targets. Footer `space-y-2` = 8px vertical gap between links (`Footer.tsx:25`). At a 17px link height this leaves rows centred 25px apart. Fitts' law + 25px pitch + fat thumb = wrong link ~5% of the time on the six-link Product/Legal columns. Fix: pad the `<li>` with `py-2` (or the `<a>` with `-my-1 py-2 -mx-2 px-2` to expand the hit area without shifting visual layout).

**Contrast tab spacing**: the two `<button role="tab">` in `ThreeWayContrast.tsx:44-69` sit inside a shared `p-1` pill (`ThreeWayContrast.tsx:41`). The visual gap between the two tabs is ~4px. At 34px height and adjacent, this is under both HIG and Material spacing guidance. Fix: `py-3 text-[13px]` (would land at 42–44px height) and add a hairline divider.

---

## 4. Horizontal scroll & overflow bugs

Playwright measurement at 375, 393, 414 all returned `scrollWidth === clientWidth`. No overflow. This is a real fix from the prior audit — `ThreeWayContrast.tsx` no longer emits a `<table min-w-[640px]>`; the mobile branch (`ThreeWayContrast.tsx:39-99`) is a segmented control feeding a 2-column grid, and the `<table>` is guarded by `hidden sm:block` (`ThreeWayContrast.tsx:102`). Confirmed clean.

`Programs.tsx:84` uses `overflow-x-auto` on the mobile carousel intentionally (`snap-x snap-mandatory`, cards at `basis-[82vw]`). Measured: five cards laid out at 308×296 CSS px, scroller width 375, `scrollWidth` 1626. Peek behaviour visible on the screenshot — the second card protrudes ~35px into view at the right edge, teaching the swipe. This is the Airbnb / Apple.com/iphone carousel pattern executed correctly.

Ambient blobs (`Ambient.tsx:9-11`) are absolutely positioned and use `-right-40 -top-40 -translate-x-1/2`. The parent `<div className="relative min-h-screen overflow-hidden">` in `page.tsx:17` clips these. Confirmed no lateral bleed.

The desktop-only 3-column table in `ThreeWayContrast.tsx:102-127` is `w-full text-left text-sm` with percentage widths — no `min-w-*`. Safe on all viewports it renders in (sm and up).

**No P0 or P1 horizontal-scroll bugs.** One P2: `Programs.tsx:84` uses `pb-2` inside the scroller but no `snap-padding-inline-start` / `scroll-padding-inline-start`. First card sits at `left: 20px` (from `px-5`). That is fine, but on subsequent `snap-center` snaps a peek-into-frame of the previous card can undershoot in Safari 15. Non-critical.

---

## 5. Viewport height & safe-area

**`globals.css:60`**: `body { min-height: 100vh; }`. This is the wrong unit post-iOS Safari 15.4. On iOS Safari with the URL bar visible, `100vh` equals viewport height with URL bar collapsed (the tallest possible state), so at page load — when the URL bar is expanded — the body is ~65–75px taller than the visible viewport. Effect on Terav: minor, because the page is content-driven and always taller than one viewport. Cosmetic-only for now. Post-2023 correct pattern is `min-height: 100dvh` (dynamic — resizes as the URL bar collapses) or `min-height: 100svh` (small — locks to the URL-bar-visible height). Rachel Andrew's recommendation for a landing hero is `100svh` so the fold does not "jump" when the URL bar retracts on scroll. Fix: swap `100vh` → `100dvh` at `globals.css:60`, and if any section ever uses `h-screen` (currently `page.tsx:17` uses `min-h-screen` which Tailwind maps to `min-height: 100vh` — same problem), swap to `min-h-dvh` (Tailwind ≥ 3.4).

**`page.tsx:17`**, **`evidence/page.tsx:141`**, **`roadmap/page.tsx:257`**, **`programs/page.tsx:16`**, **`programs/[slug]/page.tsx:40`**, **`LegalLayout.tsx:16`**: all use `min-h-screen`. Same fix — bulk replace with `min-h-dvh` (or `min-h-svh` if you want the fold locked to URL-bar-visible height).

**`layout.tsx:40-44`**: viewport meta is:
```
themeColor: "#0a0b0e",
width: "device-width",
initialScale: 1,
```
Missing `viewportFit: "cover"`. Without it, iOS Safari does not expose `env(safe-area-inset-*)` correctly, and the page cannot render under the Dynamic Island / notch. Because Terav's landing has no sticky top nav (`Nav` uses `relative`, not `sticky`) and no sticky bottom CTA, the absence is currently harmless. It becomes a P0 the moment anyone adds a sticky bottom sign-up bar (which is the standard conversion pattern for beta landings and one this landing arguably should have). Add now: `viewportFit: "cover"` in the viewport export.

Also note: `themeColor: "#0a0b0e"` is stale — `globals.css:13` moved the ground colour to `#0e0f12` after the design-system alignment audit. The address bar will paint two shades off from the page background on iOS Safari. Cosmetic-only, one-line fix.

**Safe-area insets**: zero uses of `env(safe-area-inset-*)` anywhere in `landing/src/`. Confirmed by grep. This is fine for the current layout because there is no fixed / sticky UI, but it is technical debt.

---

## 6. Hover-only affordances & touch traps

Grep of `hover:` vs. `active:` in `landing/src/`:
- **`hover:` usages**: 30+ across `Nav.tsx`, `Footer.tsx`, `Hero.tsx`, `BetaCTA.tsx`, `Programs.tsx`, `ThreeWayContrast.tsx`, `EvidenceClaim.tsx`, `HowItWorks.tsx`, `programs/page.tsx`, `programs/[slug]/page.tsx`, `roadmap/page.tsx`.
- **`active:` usages**: **zero**.
- **`focus-visible` explicit usages in Tailwind classes**: zero (there is a global `*:focus-visible` outline in `globals.css:64-67`, which handles keyboard focus but not the touch tap-down state).

Touch users on the primary CTA get no press feedback other than the browser default `-webkit-tap-highlight-color` (which is nowhere overridden in the stylesheet — grep of `tap-highlight` returns zero matches). The default on iOS is a translucent black flash which on Terav's warm-dark background is barely visible. Result: taps feel dead — user cannot tell if the tap registered until the page navigates (200–400ms delay from touchstart to route change on 4G).

Concrete offenders:
- `Hero.tsx:78` primary CTA has `hover:brightness-110` only. No `active:brightness-90` or `active:scale-[0.98]`.
- `Hero.tsx:85` secondary CTA — same pattern.
- `Programs.tsx:142` program cards — `hover:border-white/20 hover:bg-white/[0.04]`. On mobile the card is a link and shows no feedback on press.
- `EvidenceClaim.tsx:11` evidence card — same.
- `Nav.tsx:20` Sign-in pill — `hover:border-white/40 hover:bg-white/[0.06] hover:text-white`. Dead on touch.
- `BetaCTA.tsx:23` bottom primary CTA — `hover:brightness-110`. Dead on touch.
- `WontDo.tsx:7` disclosure — no press feedback.

Also `Hero.tsx:81` and `BetaCTA.tsx:26` use `group-hover:translate-x-0.5` on the arrow. This is a hover-only micro-interaction — touch users never see the arrow move. Not broken, just missed conveyance.

**Fix pattern for every CTA**:
```
active:brightness-90 active:scale-[0.98] transition-transform
touch-action: manipulation
```
Plus a global `-webkit-tap-highlight-color: transparent` in `globals.css` and per-CTA custom press styles.

**`touch-action: manipulation`**: not set anywhere. Should be on every button-shaped `<a>` to opt out of the 300ms double-tap zoom delay on iOS Safari (which `initial-scale=1` mostly kills, but `touch-action: manipulation` is the belt-and-braces defence and also prevents accidental zoom when a user taps twice trying to activate).

---

## 7. Snap carousels & gesture patterns

`Programs.tsx:83-100`. This is the audit's positive surprise. Implementation:
- `flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2` on the scroller (`Programs.tsx:84`).
- `snap-center shrink-0 basis-[82vw]` on each card (`Programs.tsx:86`).
- Scrollbar hidden via `[scrollbar-width:none] [&::-webkit-scrollbar]:hidden`.
- Static dot indicators at `Programs.tsx:91-99` (five 4×4px dots, all inactive-styled `bg-white/25` and `aria-hidden`).

**What's right**:
- 82vw peek. At 375px viewport → 308px cards (measured) → the next card protrudes ~35px on the right at rest. This is the exact affordance Apple.com/iphone uses to teach "swipe me". Confirmed visible in screenshot `/tmp/terav-mobile-shots/programs-375.png` — right edge shows the next card's dot + partial "AEROBIC" text.
- `snap-center` biases the scroller to centre each card, which is correct for a "one hero card at a time" pattern. Airbnb chip rails use `snap-start`; for content cards `snap-center` is more forgiving.
- No JS library. Pure CSS. Zero perf cost.

**What's wrong**:
- **Dots are decorative, not active.** All five are `bg-white/25` all the time — no `aria-hidden={false}` state, no active-dot styling based on scroll position, no click-to-jump. The dots give the *count* affordance but not the *position* affordance. Instagram-style dot pagination requires JS or `scroll-driven-animations` (`animation-timeline: scroll(...)` — Safari 17.4+, Chrome 115+) to be functional. Current implementation is a decorative half-measure — cheaper to drop the dots and rely on peek + gutter, or invest in `animation-timeline` for real dots.
- **No `scroll-padding-inline-start`.** First card snap-centres at `left: 20px` (correct because of `px-5`), but subsequent snap-centres don't respect the 20px left gutter. On a fast flick the third card can snap-centre with only the current card visible and no peek. Fix: `scroll-padding-inline-start: 20px` on the scroller, or use `snap-align: start` with explicit `scroll-margin-inline-start: 20px` on each card.
- **No `scroll-snap-stop: always`.** On a hard swipe from card 1 the scroller may skip past card 2 and land on card 3. `scroll-snap-stop: always` (on each card) forces one-card-at-a-time. Robinhood's card carousels use this pattern.
- **`gap-3` = 12px between cards.** Runna and Apple both use 8px (matches the visual-hierarchy density of a card list). 12px is fine; not a bug.
- **No swipe hint animation.** First-visit users see a static card with peek and dots. A one-time nudge (`animation: swipe-hint 1s ease 1s 1` translating the scroller 12px right then back) is what Airbnb and Instagram both add. Optional P2.

The prior audit finding "Programs used mobile stack of 5 cards (~2200px)" is fixed. The snap-carousel adoption is real and mostly correct. Regression: none.

**HowItWorks / YourFirstWeek**: `HowItWorks.tsx` still exists in the codebase (`landing/src/components/sections/HowItWorks.tsx`) but is no longer imported by `page.tsx` — replaced by `YourFirstWeek.tsx`. Dead code. `YourFirstWeek.tsx:59-100` stacks three cards vertically on mobile (`grid gap-4 sm:grid-cols-3`) — three cards at ~250px each = ~750px total. Reasonable. No PhoneFrame stack regression.

---

## 8. Form ergonomics

No forms on the landing itself. The primary CTA is `<a href={APP_URL + "/sign-up"}>` (`Hero.tsx:76-82`, `BetaCTA.tsx:21-27`), which hands off to the app. The `mailto:` in `BetaCTA.tsx:29` is a system link, not a form.

Zero `type=`, `inputmode=`, `autocomplete=`, or `<input>` elements in `landing/src/`. Confirmed by grep.

**Forward-looking note**: if the beta adds inline email capture on this landing (recommended by the conversion audit), the ergonomic rules are:
- `type="email" inputmode="email" autocomplete="email"` — inline keyboard, no autocap, one-tap email suggest.
- **Font size ≥ 16px CSS on the `<input>`.** iOS Safari zooms in on any focused input under 16px, which yanks the layout and is a documented cause of drop-off. Terav's base body is 16px so the safe default is `text-base`, not `text-sm` (14px).
- `enterkeyhint="go"` (or `"send"`) so the return key on iOS reads "Go".
- `autocapitalize="off" autocorrect="off"` on email fields.
- Wrap in a `<form>` so iOS shows the correct return-key affordance.

Cross-check: `WontDo.tsx:8` `<summary>` at `text-[14.5px]` (`WontDo.tsx:9`) — that is under 16px, but it is not an input, so no zoom risk. Just a hit-area problem covered in §3.

---

## 9. Sticky nav + address-bar interaction

`Nav.tsx:7` uses `relative`, not `sticky`. There is no sticky top bar. The landing scrolls the wordmark and Sign-in out of view on scroll, which is a defensible choice (uncommon for a beta landing where Sign-in is a stated conversion path, but consistent with the "one primary CTA" narrative — the Hero and Beta section both link to sign-up).

Because nothing is sticky, iOS Safari's address-bar collapse behaviour is a non-issue for header UI. It does cause the well-known content-jump on scroll (URL bar retracts → `100vh` remeasures → any `h-screen` element grows → content reflows). Confirmed above in §5.

No sticky bottom CTA either. This is arguably a missed conversion pattern (Runna and Robinhood both use sticky bottom bars on their landings), but it is out of scope for a mobile-UX correctness audit. If added, the pattern must be:
```
class="fixed bottom-0 left-0 right-0 pb-[env(safe-area-inset-bottom)]"
+ viewportFit: "cover" in the layout viewport export
```
Without both, the bar collides with the iOS home indicator (bottom 34px on notchless-Face-ID phones).

---

## 10. Orientation

Landscape 812×375 screenshot: page renders, but the H1 wrapping is now aggressive because the sub-copy grid gets pushed. Fold at y=375: wordmark and Sign-in still at y=27, H1 is fully visible ("Sharpen your edge."), but the sub-copy and primary CTA are pushed below the fold in landscape. This is Hero content design's problem, not mobile-UX per se — the fold in landscape 375h is genuinely tiny (375 minus browser chrome ~ 300–320 usable px). Same problem every landing has. Not a P0.

The one landscape-specific ergonomic risk: on a 375-tall landscape phone, the top-third thumb zone is y=0–125 and the primary CTA needs to be inside y=125–375. Currently it lands around y=550–600 in landscape — user must scroll to reach the CTA, then the tap zone is right. Acceptable.

No orientation-locked layout, no landscape-broken absolute positioning. Ambient blobs (`Ambient.tsx:9-11`) reflow gracefully because they use viewport-relative sizes (`h-[640px] w-[640px]` fixed dims + `overflow-hidden` on parent). No leaks.

---

## 11. Competitor benchmark (mobile ergonomics)

Three reference apps, one lesson each.

**Apple.com/iphone** — carousel peek. Product-shot carousels on the iPhone landing use exactly the 82vw peek pattern Terav Programs section adopted (`Programs.tsx:86`). What Apple adds and Terav does not: (1) real animated dot pagination that tracks scroll position — Apple uses `IntersectionObserver` on each card and updates a `data-active` on the corresponding dot; (2) `scroll-snap-stop: always` so a hard flick lands one card away, not two; (3) a first-visit swipe-hint microinteraction. **Take**: Terav's carousel scaffolding is correct; the dot pagination is decorative and should either become functional or be dropped.

**Runna** (fitness landing, runna.com) — tap target discipline. Every link in Runna's mobile landing has a `py-3` minimum (~48px total height at 14px text). Runna does not have 17px-tall footer links. **Take**: Terav Footer.tsx and Nav.tsx are the clear misses. A single `py-2` on each `<li>` in `Footer.tsx:25-47` and `Footer.tsx:50-67` would take footer links from 17px to 33px, still below HIG but a big improvement, and combined with `-mx-2 px-2` on the `<a>` would push effective hit area past 44px without changing visible layout.

**Airbnb** (mobile web) — chip-rail affordance. Airbnb's category chip rail uses `snap-x snap-mandatory` + `snap-start` with `scroll-padding-inline-start: 16px`. The first chip always sits flush against the 16px gutter. Terav Programs' `snap-center` is a valid alternative for content cards but requires more thumb work per swipe (centre-to-centre distance = card width + gap = 320px vs. Airbnb's start-to-start = card width alone). **Take**: for the Programs section, `snap-center` is the right call because cards are content-heavy, but for any future chip rail (categories, filters, program-domain pills) use Airbnb's `snap-start`.

Instagram and Robinhood I would name for the CTA press-feedback problem (`active:scale-[0.98]` + `-webkit-tap-highlight-color: transparent` + custom press ring), but the three above are the ones most directly matched to this landing's structure.

---

## 12. Priorities — P0 (broken on mobile) / P1 / P2

### P0 — must fix before beta launch

1. **Footer links 17px tall.** `Footer.tsx:25-47` and `50-67`. Fix: `py-2 -my-1` on each `<a>`, or wrap `<li>` with `py-2`. Effect: 17px → 33–41px effective. Six links × two columns × probably every legal page's first navigation = highest-frequency tap in the tail.
2. **Nav Sign-in pill 34px tall.** `Nav.tsx:20`. Change `py-1.5` → `py-2.5` and `text-sm` stays. Lands at 44px. Two-line diff.
3. **Hero "See how it works ↓" 20px tall.** `Hero.tsx:91-96`. This is a real scroll-to-section CTA — should be at least 36–44px. Add `py-2` and `-mx-1 px-1`.
4. **WontDo `<details>` summary 22px.** `WontDo.tsx:8-13`. The `<summary>` is the tap target, not the parent. Add `py-2` on the `<summary>` itself (`className="... py-2"` on the summary element).
5. **Contrast segmented tabs 34px.** `ThreeWayContrast.tsx:44-69`. Change `py-2` → `py-3` and `text-[12px]` → `text-[13px]`. Lands at ~42–44px.
6. **Every CTA has hover-only feedback.** `Hero.tsx:78,85`, `BetaCTA.tsx:23,29`, `Nav.tsx:20`, `Programs.tsx:142`, `EvidenceClaim.tsx:11`, `programs/[slug]/page.tsx:147,156`. Add `active:brightness-90 active:scale-[0.98] transition` to every CTA. Add `-webkit-tap-highlight-color: transparent` globally in `globals.css` and replace with per-CTA press states.

### P1 — mobile hygiene, ship in the next visual sweep

7. **`min-height: 100vh` → `100dvh`.** `globals.css:60` and every `min-h-screen` in `page.tsx:17`, `evidence/page.tsx:141`, `roadmap/page.tsx:257`, `programs/page.tsx:16`, `programs/[slug]/page.tsx:40`, `LegalLayout.tsx:16`. Bulk replace `min-h-screen` → `min-h-dvh`.
8. **Add `viewportFit: "cover"` to viewport export.** `layout.tsx:40-44`. Enables `env(safe-area-inset-*)` for any future sticky UI, allows Ambient / hero background to paint under the notch/Dynamic Island (which currently shows a black bar).
9. **Update `themeColor` to `#0e0f12`.** `layout.tsx:41` currently says `#0a0b0e`; the actual ground per `globals.css:13` is `#0e0f12`. iOS Safari's address bar paints two shades off.
10. **`touch-action: manipulation` on every CTA.** Kills the residual 300ms tap delay and prevents accidental zoom.
11. **Contrast tab spacing.** Add `gap-1` to the tab container in `ThreeWayContrast.tsx:41` so the two 34→44px tabs don't share an edge.

### P2 — polish

12. **Programs carousel: real dot pagination or drop the dots.** `Programs.tsx:91-99`. Either wire `IntersectionObserver` to a `data-active` on each dot, or use CSS `animation-timeline: scroll(inline nearest)` (Chrome 115+, Safari 17.4+), or delete the dots and rely on peek. Current decorative dots are worse than no dots.
13. **`scroll-snap-stop: always` on carousel cards.** `Programs.tsx:86`. Prevents flick-past.
14. **`scroll-padding-inline-start: 20px` on carousel scroller.** `Programs.tsx:84`. Keeps peek consistent.
15. **First-visit swipe-hint animation on carousel.** Optional; Airbnb / Instagram convention.
16. **Consider a sticky bottom CTA for mobile.** Out of scope for correctness but a missed conversion opportunity. If added, gate with `pb-[env(safe-area-inset-bottom)]` (which requires P1 #8 first).
17. **Wordmark link height.** `Nav.tsx:8-10` is 20px. Low-intent, but a `py-2 -my-2` widens the hit region without visual shift.
18. **Kill dead code.** `HowItWorks.tsx` is unused (not imported in `page.tsx:1-13`). Remove to keep the section list authoritative.

---

## Appendix — key file references (absolute paths)

- `/Users/margussellin/www/program/landing/src/app/layout.tsx` — viewport meta (missing `viewportFit`), stale `themeColor`.
- `/Users/margussellin/www/program/landing/src/app/globals.css` — `min-height: 100vh` on body, no `-webkit-tap-highlight-color` override, no `touch-action` defaults.
- `/Users/margussellin/www/program/landing/src/app/page.tsx` — `min-h-screen` on root wrapper.
- `/Users/margussellin/www/program/landing/src/components/Nav.tsx` — Sign-in pill 34px, no `active:` state, Evidence link hidden on mobile.
- `/Users/margussellin/www/program/landing/src/components/Footer.tsx` — every link 17px CSS.
- `/Users/margussellin/www/program/landing/src/components/sections/Hero.tsx` — CTAs correct (48/50px), "See how it works" 20px, hover-only micro-interactions.
- `/Users/margussellin/www/program/landing/src/components/sections/ThreeWayContrast.tsx` — mobile fix landed (segmented control), tabs 34px.
- `/Users/margussellin/www/program/landing/src/components/sections/Programs.tsx` — snap-carousel with peek, correct scaffolding, decorative dot pagination.
- `/Users/margussellin/www/program/landing/src/components/sections/WontDo.tsx` — `<summary>` 22px.
- `/Users/margussellin/www/program/landing/src/components/sections/BetaCTA.tsx` — CTAs correctly sized (56/58px).
- `/Users/margussellin/www/program/landing/src/components/sections/HowItWorks.tsx` — dead code, no longer imported.
- Screenshots: `/tmp/terav-mobile-shots/{mobile-375,mobile-393,mobile-414,desktop-1280}-{fold,full}.png`, `programs-375.png`, `contrast-375.png`, `firstweek-375.png`, `footer-375.png`, `landscape-812.png`.
