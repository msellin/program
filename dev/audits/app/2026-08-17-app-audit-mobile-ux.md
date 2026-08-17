# Terav app — Mobile UX audit (thumb reach, tap targets, safe area)

Personas: persona-recover, persona-strength, persona-erratic
Artifacts: `next-app/tests/e2e/artifacts/personas/*/mobile/`
Viewport basis: 393×852 primary, 375×667 SE cross-check
Captured: 2026-08-17 (post-simulation state, 30–45 days of logs)

---

## 1. Overall verdict

Terav's mobile shell is materially better than most "responsive Next.js" apps because someone read Whoop and Strava with intent: bottom nav is `position: fixed` with `pb-[env(safe-area-inset-bottom)]`, the AppShell reserves a real 80px paddingBottom, viewport meta is `viewportFit: "cover"` with pinch-zoom locked, `overscroll-behavior-y: none` kills the iOS PWA overscroll gap, and `-webkit-tap-highlight-color: transparent` with a proper `button:active { scale(.98) }` replacement gives the app a native press feel. That is the one thing done right, and it is not a small thing.

The top ergonomic failure is **the ouch zone is stuffed with primary work**. The main action buttons on every persona's Today (`Log yesterday now`, `Save check`, `RETEST — LOG YOUR NUMBERS`, `Advance to X`, `Log session`) are consistently rendered in the *middle* of the page, at page-y 500–900 across the mobile captures, and everything in the *content thumb zone* (viewport y ~570–850) is a fixed nav strip you cannot press without changing routes. Combined with a `min-h-[52px]` nav that renders icons at 20×20 with 9px labels, plus range-slider thumbs at WebKit default (~14×14 visual, 44px hit-slop but no visible affordance), plus `hover:` state on 60+ buttons with no `focus-visible:` or `active:` twin, this is a Whoop-shaped shell wired for a desktop hover model. Fitts-law distance from the cradle-grip thumb origin (x=195, y=790) to the `Save check` button on `/check` is 350px — the user is fighting the app to complete the shortest journey it has.

The three P0 issues are: (1) `min-h-screen` / `h-screen` grep returned empty which is the good news, but `<html className="h-full">` in `layout.tsx:56` combined with `body className="min-h-full …"` inherits the 100vh trap because `h-full` on `<html>` resolves against the viewport height — under iOS Safari with the URL bar visible on first load, this reserves the WRONG height; recommendation is `[100dvh]`. (2) The BottomNav uses `fixed` positioning (`nav/BottomNav.tsx:28`); on iOS Safari with the software keyboard open on `/check` or the log-session flow, the fixed nav rides the visualViewport up and clips the numeric input. (3) The SessionActions grid on Today (Move day / Skip today / Whole week — `SessionActions.tsx:51`) sits directly beneath the fixed nav at max scroll on the erratic persona's viewport and its buttons at 52px × 118px are visually crowded and small-labeled for a destructive/reschedule surface.

The one thing done right: `AppShell.tsx:149` sets `paddingBottom: "calc(64px + env(safe-area-inset-bottom) + 1rem)"` and `layout.tsx:57` doubles the belt with `pb-[calc(64px+env(safe-area-inset-bottom))]`. Home-indicator safety is real, not accidental. Keep it.

---

## 2. Systemic issues (≥2 personas)

### 2.1 Primary CTAs land above the thumb zone, never in it

- **Where:** persona-strength:/ (`Retest — log your numbers`, page y=625) × persona-erratic:/ (`Log session`, page y=765) × persona-recover:/check (`Save check`, page y=1140 on a 1300+px page) — `SessionActions.tsx:51`, `app/check/page.tsx:~450`, `HeroStateCard.tsx`.
- **Ergonomic law violated:** Hoober cradle-grip primary zone is bottom third of viewport (y=568..852 on a 393×852 device). Above that is secondary zone. Above y=284 is the ouch zone (index-finger reach). None of the sampled primary CTAs land in the primary zone by design — they inherit whatever y coordinate the scroll offset happens to put them at. On persona-recover:/ the `LOG YESTERDAY NOW` button lives at page y=190; the user must reach for the top of the page even on first paint.
- **What:** The app has no notion of a viewport-anchored primary action. On Whoop, the Log button is a fixed FAB at bottom-right. On Runna, "Start workout" is a viewport-bottom bar. Terav renders every action inline with content, which reads clean but forces the user's thumb across the full 852px vertical every 3rd interaction.
- **Fix:** For the two highest-frequency actions (Save check on `/check`, Log session on Today when a session is unstarted) add a `sticky bottom-[calc(52px+env(safe-area-inset-bottom))]` action bar. Same technique used by `RestTimerHost` (`RestTimer.tsx:63`) — you already have the pattern. Copy it to `/check` and to Today when unlogged.

### 2.2 `hover:` state without `focus-visible:` or `active:` twin — 60+ occurrences

- **Where:** All three personas, every route. Sample: `AppShell.tsx:131`, `AppShell.tsx:138`, `AppShell.tsx:122`, `BottomNav.tsx:43`, `Onboarding.tsx:160,174,195-198`, `VideoModal.tsx:59,81`, `InfoSheet.tsx:47`, `IntroGallery.tsx:187,200,208`, `Heatmap.tsx:147`, `SessionActions.tsx:55,63,71`, `MissedSessionPrompt.tsx:97,111,118,131`, `WeeklyNarrativeTile.tsx:52,61`, `RetestMetricsPanel.tsx:182,193,203`.
- **Ergonomic law violated:** Josh Clark's tap-hover model — mobile Safari fires the `:hover` state on tap and *keeps* it until the next tap elsewhere ("sticky hover"). Without a `:active` twin, the user's tap either shows nothing or shows a lingering hover state on the button they just released.
- **What:** The globals.css `button:active { transform: scale(0.98) }` at `globals.css:118` mitigates this globally with a scale-press — that is the redeeming factor. But color-state changes on hover (bg swap, text-color swap) do NOT get an active twin, so any button whose "pressed" affordance is a bg change reads dead on touch.
- **Fix:** For every `hover:bg-…` or `hover:text-…` add a paired `active:` state. Example: `AppShell.tsx:131` becomes `text-muted hover:text-ink hover:bg-line-soft active:bg-line-soft/70 focus-visible:bg-line-soft`. Where the button is a Link with an aria-current active state (BottomNav), skip active on the current-page tab. Codemod scope: ~92 occurrences.

### 2.3 iOS Safari 100vh trap latent in `<html className="h-full">` + `min-h-full`

- **Where:** `layout.tsx:56-57`. All personas × all routes.
- **Ergonomic law violated:** iOS Safari's `100vh` reports the URL-bar-hidden viewport (largest possible), not the current visible viewport. `h-full` on the root html inherits from the viewport — on first paint, the body is *taller* than what the user actually sees, which is why a first-load user can scroll a page that seems to have "extra room" at the bottom. `[100dvh]` (or `[100svh]` for the small-viewport hint) solves this since 2022.
- **What:** No `min-h-screen` in the tree (good), but `<html class="h-full">` is the same trap at a different address.
- **Fix:** `layout.tsx:56` → `<html className={... "h-[100dvh]"}>` and `layout.tsx:57` → `<body className="min-h-[100dvh] ...">`. Verify Safari 15+ (dvh landed in iOS 15.4).

### 2.4 Fixed BottomNav collides with iOS software keyboard on `/check`, log form, run slot inputs

- **Where:** persona-recover:/check (5 sliders + text input + Save check), persona-strength:/ (rest timer + log session), persona-erratic:/ (Log session card at page y=680) — `BottomNav.tsx:28`, `RestTimer.tsx:63`, `RunSlotCard.tsx:348,363,376,399`.
- **Ergonomic law violated:** iOS keyboard-shifts-viewport quirk. `position: fixed` elements ride the visualViewport up when the keyboard opens on iOS. The BottomNav is 52px + safe-area — on a 852px viewport with a ~336px keyboard, the effective content viewport is 516px, and the nav parks at y=464, potentially covering the input the user just tapped.
- **What:** No keyboard-open guard visible. `RestTimer.tsx:63` positions above safe-area but doesn't check for `visualViewport.height < window.innerHeight`.
- **Fix:** On the nav (and RestTimerHost), listen for `visualViewport.resize` and either (a) `hide` the nav while keyboard-open on input-heavy routes (`/check`, log flows), or (b) reposition to `bottom: visualViewport.offsetTop + visualViewport.height - navHeight`. The lightest fix is a `[data-keyboard-open]` attribute on `<body>` and `nav[data-keyboard-open="true"] { display: none }` — the keyboard already ate the primary zone, hiding the nav returns 52px to content.

### 2.5 Heatmap cells at 393px are too small to tap reliably

- **Where:** persona-erratic:/history (heatmap at page y=185–420, 12 columns × 7 rows) — `Heatmap.tsx:130-136`.
- **Ergonomic law violated:** Apple 44×44 minimum. `gridAutoColumns: "minmax(14px, 1fr)"` at `Heatmap.tsx:135` sets cell floor at 14px wide, and `gridTemplateRows: "repeat(7, 1fr)"` divides available height into 7. On the erratic capture, cells render ~22×22px — half the Apple minimum, one-third of Material 48.
- **What:** Cells are `<button>`s when `onDayClick` is passed (`Heatmap.tsx:139`); the history page passes it (`app/history/page.tsx:83`). So these ARE interactive tap targets, and they're 22×22.
- **Fix:** Two paths. (a) Preserve 14 columns × 7 rows but wrap each cell in a `min-h-[44px] min-w-[44px]` invisible hit-slop container (visual cell stays small, hit target inflates — the "iceberg" pattern). (b) Reduce to 6 weeks × 7 rows at 393px so cells are 44+ px, and offer a "12 weeks" toggle that scrolls. Path (a) is faster; path (b) is more honest but a bigger change.

### 2.6 Bottom nav labels are 9px — below any legibility floor

- **Where:** All personas × all routes — `BottomNav.tsx:42`.
- **Ergonomic law violated:** WCAG 1.4.4 minimum resize and Apple HIG minimum tap-target-label legibility (11pt = ~11px CSS). 9px on a 393px viewport at DPR ~3 is ~27 physical pixels — readable at close inspection but not glanceable, and the app has 5 tabs so the user *does* rely on labels when the icon glyph is ambiguous (Dumbbell for "Today" is ambiguous, TrendingUp for "Progress" vs History's clock is ambiguous).
- **What:** `className="… text-[9px] font-medium tracking-wide uppercase min-h-[52px]"`. `min-h-[52px]` is Apple-compliant. The 9px label is not.
- **Fix:** Bump to `text-[10.5px]` and drop `uppercase` (uppercase micro-caps at 9px is a legibility antipattern; sentence-case at 10.5px reads faster). If the constraint is the 5-tab horizontal fit at 375px SE, the icons can shrink from `size={20}` to `size={18}` to buy back the vertical space.

### 2.7 Ouch-zone header actions include Programs and Morning check

- **Where:** All personas × all routes — `AppShell.tsx:128-141`.
- **Ergonomic law violated:** Hoober ouch zone (top third, y=0..284). Header Layers icon (Programs) at y=44-88 and Stethoscope (Morning check) at y=44-88 sit dead in ouch. Morning check is the highest-frequency FIRST action of the day for persona-recover — she opens the app, thumb wants the bottom third, but the CTA is a top-right icon.
- **What:** Both are 44×44 (`w-11 h-11`), which is compliant for touch. But placement is wrong for the user's most frequent flow.
- **Fix:** Add "Save morning check" as a primary CTA card at the top of Today when no check is saved for today (already exists as "No check yet" copy at `HeroStateCard`, but it's a passive tile at page y=440 — turn it into a full-width primary button with `min-h-[56px] bg-bronze text-ground` at page y=200, immediately below the date nav). Keep the header stethoscope icon as the "check other regions" secondary path.

### 2.8 Range-slider thumbs have Apple-compliant hit-slop but no visible affordance

- **Where:** persona-recover:/check (4 symptom sliders + life-load) — `app/check/page.tsx:232-245`.
- **Ergonomic law violated:** Discoverability. `accent-color: bronze` on `input[type="range"]` (`globals.css:88`) tints the WebKit thumb but does not enlarge it. Default WebKit thumb on iOS is ~14×14 physical pt — visually looks like a bead on a wire.
- **What:** The wrapper `<input>` gets `min-h-[44px]` (`app/check/page.tsx:244`) so the *vertical* hit slop is 44px. Horizontally the thumb is still WebKit-default. User can hit-drag from anywhere in the vertical band, but the *perceived* affordance is a 14px bead — first-time users don't know it's a large touch target.
- **Fix:** In `globals.css` add explicit `::-webkit-slider-thumb { width: 28px; height: 28px; border: 2px solid var(--color-ink); background: var(--color-bronze); border-radius: 50%; }` and the Mozilla `::-moz-range-thumb` twin. Track a wired mock — a fatter thumb also fixes the "am I on 4 or 5?" imprecision at 10px increments on a 260px-wide slider.

---

## 3. Per-persona findings

### persona-recover

| Route | Zone / Rule | Sev | Finding | Fix |
|-------|-------------|-----|---------|-----|
| `/` | Hoober primary | P1 | `LOG YESTERDAY NOW` and `MARK YESTERDAY SKIPPED` at page y=193/238 — ouch zone on initial view — `MissedSessionPrompt.tsx:111,118` | Move MissedSessionPrompt to a slide-down toast anchored below the date nav, or make it a bottom-sheet with a persistent chip |
| `/` | Apple 44 | P2 | `X` dismiss on MissedSessionPrompt is 36×36 visually (`w-9 h-9`) but has `-m-2` negative margin so hit area = 52×52 — compliant `MissedSessionPrompt.tsx:97` | Keep. Document the pattern. |
| `/check` | Fitts | P1 | Save check button at page y=1140 on a 1300px page — cradle-grip distance 350px `app/check/page.tsx:~450` | Add `sticky bottom-[calc(52px+env(safe-area-inset-bottom))]` action bar with Save check when any slider is dirty |
| `/check` | Apple 44 visible | P1 | Range thumbs render as ~14px bead `globals.css:88` | Add `::-webkit-slider-thumb { width:28px; height:28px }` |
| `/check` | Snap discreteness | P2 | Sliders are 0..10 step 1 on a ~260px track = 26px/step → very hard to hit a specific value with a 14px thumb `app/check/page.tsx:236` | Add tick marks (`background: linear-gradient(90deg, var(--color-line) 0, var(--color-line) 1px, transparent 1px, transparent 10%)`) and snap-to-integer |
| `/progress` | Ouch zone | P1 | `EXPORT REPORT` button in top-right ouch zone `app/progress/page.tsx:~40` — destructive action placement is fine but it's the ONLY visible CTA above the fold | Move Export to a "…" secondary menu; place `LOG A NEW READING` as the primary CTA above the retest cards |
| `/history` | Apple 44 | P1 | LogRow chevrons `<ChevronRight>` at 14-16px in 40-tall rows `app/history/page.tsx:~200` — hit area = row height, but the affordance reads as an icon | Keep row hit; enlarge the chevron to 20 for glanceability |

### persona-strength

| Route | Zone / Rule | Sev | Finding | Fix |
|-------|-------------|-----|---------|-----|
| `/` | Confirm-first | P0 | `RETEST — LOG YOUR NUMBERS` at y=625 and `PICK YOUR NEXT PROGRAM` at y=670 stacked vertically — page y=650 is *just above* the fold at 852px viewport, thumb has to stretch. Distance from cradle origin = 145px, acceptable but the primary action is not obvious as primary against the secondary `HeroStateCard.tsx` | Make `RETEST — LOG YOUR NUMBERS` full-width with `bg-bronze text-ground` and stack the "Pick next program" below as a secondary `border border-line` outlined action |
| `/` | Signal collapse | P1 | "Back after 17 days — soften plan? +1 more" is a collapsed accordion at y=305, and the actual Accept/Ignore surface lives INSIDE the expanded body `SignalsStrip.tsx:180-209` — the user reads a proposal but has to tap once to see the action | If the strip has exactly ONE proposal, render it in expanded form by default; only collapse when there are 2+ signals |
| `/` | Apple 44 | P1 | Chevron toggle on signals strip is 14px inside a 44px min-h button — hit area OK, glanceability weak `SignalsStrip.tsx:207` | Increase chevron to `size={18}` |
| `/coach` | Empty state | P2 | Placeholder card is centered but the whole page is empty from y=340 to y=780 — bottom nav floats on desolation `app/coach/page.tsx:~140` | Add a "Meanwhile" quick-actions row (Log session · Log a check · See last week) at page y=500 |
| `/progress` | Fitts | P1 | `LOG A NEW READING` button at y=790 is within thumb-reach — GOOD. `EXPORT REPORT` at y=105 is ouch — deprioritize | Same as recover: move Export to overflow |
| `/profile` | Sign out | P2 | `SIGN OUT` at y=605 in red outline — destructive at the edge of primary zone, no confirm before firing `app/profile/page.tsx:~150` | Wrap in ConfirmSheet — you already have the component |

### persona-erratic

| Route | Zone / Rule | Sev | Finding | Fix |
|-------|-------------|-----|---------|-----|
| `/` | Nav overlap | P0 | SessionActions grid (Move day / Skip today / Whole week) at page y=848–880 renders BEHIND the fixed nav visually on the full-page capture. On a live 852-viewport at max scroll, the buttons are reachable (paddingBottom=80px reserves clearance) but the *perceived* affordance is that they're occluded, and any user who mis-scrolls sees only "Log session · Import GPX" as the trailing action — `SessionActions.tsx:51`, `AppShell.tsx:149` | Confirmed via math OK, but visually reads as a bug on first landing. Move SessionActions ABOVE "Log an extra session" card (currently below it) so the last visible pre-nav content is the plain "Log session" action, not the reschedule buttons |
| `/` | Apple 44 | P1 | Move / Skip / Whole week buttons are `min-h-[52px]` w/ `px-2 py-2` — 52px tall, ~118px wide. Compliant. `text-[12px]` label + `size={14}` icon feels cramped `SessionActions.tsx:55,63,71` | Keep 52px, bump icon to `size={16}`, drop icon-and-label stacking on this row for a horizontal layout (icon + label inline) at 44px min-h |
| `/history` | Apple 44 | P0 | Heatmap cells ~22×22 as tappable buttons `Heatmap.tsx:139-156` — see systemic 2.5 | Wrap each cell in a `min-h-[44px] min-w-[44px]` transparent hit-slop parent |
| `/history` | Long list | P1 | LOG — 45 DAYS list on the erratic persona renders 45 dated rows, each with a chevron. At row height ~44px this is 1980px of list on top of the 420px heatmap + 200px chrome — total page 2155px. Scroll-restore on back-nav? `app/history/page.tsx:~200` | Virtualise or paginate ("Show 30 more") if >30 rows; use `content-visibility: auto` on rows outside viewport |
| `/history` | Empty-log affordance | P2 | Every row shows "0 done" — visually correct (this persona logged only symptoms, not exercises) but the row is still a tappable expand — user taps and gets an empty accordion `app/history/page.tsx:~230` | If exerciseCount=0 AND no symptom flags, render as `<div>` not `<button>`, or show "Symptom-only" caption without expand-chevron |

---

## 4. Sticky bottom nav — deep dive

- **File:** `next-app/src/components/nav/BottomNav.tsx:26-58`
- **Positioning:** `fixed left-0 right-0 bottom-0 z-40 border-t border-line bg-surface-2 pb-[env(safe-area-inset-bottom)]`. `fixed`, not `sticky`. On mobile Safari, `fixed` is the correct choice — `sticky` inside a scrolling ancestor jumps on iOS during momentum scroll. Verdict: correct.
- **Safe-area handling:** `pb-[env(safe-area-inset-bottom)]` on the nav element and `paddingBottom: calc(64px + env(safe-area-inset-bottom) + 1rem)` on `<main>` (`AppShell.tsx:149`) plus `pb-[calc(64px+env(safe-area-inset-bottom))]` on `<body>` (`layout.tsx:57`). Belt-and-suspenders — the doubled reservation is redundant but not harmful. Verdict: home indicator (34pt on iPhone 14+) is respected. Passes.
- **Behavior with iOS keyboard on log form:** No `visualViewport` listener. When the keyboard opens on `/check`, the SetRow log form, or the SessionActions reason input, the fixed nav parks at the visualViewport bottom which is now ABOVE the app's original bottom — likely overlapping the input the user is focused on. Verdict: broken on keyboard-open. See systemic 2.4.
- **Route indication clarity:** `aria-current="page"` set correctly; active state is `text-ink` (bright) vs inactive `text-muted` + `strokeWidth: 2.25` vs 1.75. No color-only differentiation (weight + color both change) — passes WCAG 1.4.1. But the `text-ink` vs `text-muted` delta on a small 9px label is subtle at the visual level; a user glancing at the nav can miss which tab is active without focusing. Verdict: technically correct, weakly legible. Add an underline or top-bar accent for the active tab (`border-t-2 border-bronze` on the active `<li>`).
- **Bottom-padding on scrollable content:** `AppShell.tsx:149` reserves 64+16=80px minimum; nav consumes 52px + safe-area (~0-34 depending on device). Clearance is real: on iPhone 14 Pro (safe-area-bottom=34px), reservation = 80+34 = 114, nav footprint = 52+34 = 86, slack = 28px. On a browser without inset, reservation = 80, nav = 52, slack = 28. Passes.

---

## 5. Heatmap & wide-content specifics

- **File:** `next-app/src/components/charts/Heatmap.tsx:91-181`
- **overflow-x containment:** `flex-1 overflow-x-auto` wrapper at line 130 with `gridAutoColumns: "minmax(14px, 1fr)"`. At 12 columns × 14px min = 168px content + gaps; wrapper is ~355px wide (393 - 38 for chrome). Since content < wrapper width, no scroll fires — grid stretches to fill. Verdict: containment is present but currently not needed because the WEEKS=12 constant fits. If WEEKS bumps to 26 or 52, `overflow-x-auto` correctly scrolls internally. Passes.
- **Tap target per cell at 393px:** ~22×22 as buttons. Fails Apple 44 by 50%. See systemic 2.5.
- **Long-year edge case (persona-erratic day 45):** Screenshot shows amber cluster centered in the 12-week grid — data density looks fine, no cell clipping. On a 52-week extension the grid would need horizontal scroll AND either sticky day-of-week labels or the labels detach as user scrolls. Not tested with 52w. Verdict: works today; risky at any longer horizon without added sticky-label logic.
- **Legend crowding:** 6 legend items on a single row at 393px (`Heatmap.tsx:202` — `flex-wrap gap-3 text-[11px]`) — wraps to 2 rows on 375 SE. Not a bug, but the wrap breaks scannability. Move to a single scrollable row with `overflow-x-auto snap-x` or drop `nothing` from the legend (it's the default state; explaining it is redundant).

---

## 6. Hover-on-touch traps (representative subset — full list is 60+)

| File | Class | Fix |
|------|-------|-----|
| `nav/BottomNav.tsx:43` | `text-muted hover:text-ink` (no active twin; sticky-hover risk on iOS) | add `active:text-ink focus-visible:text-ink` |
| `AppShell.tsx:131` | `text-muted hover:text-ink hover:bg-line-soft` | add `active:bg-line-soft/70 focus-visible:bg-line-soft` |
| `AppShell.tsx:138` | same as above (stethoscope) | same |
| `AppShell.tsx:122` | `text-bronze hover:text-ink` (brand wordmark) | add `active:text-ink focus-visible:text-ink` |
| `Heatmap.tsx:147` | `hover:ring-1 hover:ring-slate/60` on cell buttons | add `active:ring-1 active:ring-slate` (touch users get zero cell-focus indication now) |
| `Onboarding.tsx:195-198` | 3 conditional hover states on rating buttons | add matching `active:bg-{red,amber,line-soft}/20` for each branch |
| `WeeklyNarrativeTile.tsx:52,61` | `hover:bg-line-soft hover:text-ink` on prev/next nav | `active:bg-line-soft` |
| `RetestMetricsPanel.tsx:182,193,203` | 3 button hovers | `active:bg-{bronze-hover, line-soft}` |
| `MissedSessionPrompt.tsx:97,111,118,131` | 4 in one component | `active:` twin on each |
| `VideoModal.tsx:59,81` | Close X + subtext link | `active:text-ink` |
| `InfoSheet.tsx:47` | Close X | `active:text-ink` |
| `IntroGallery.tsx:187,200,208` | 3 CTA hovers | `active:bg-{bronze-active,line-soft}` |
| `SessionActions.tsx:55,63,71,176,210,216,335,405,412,454,477,483` | 12 in one component | `active:` twin on every button; the ConfirmSheets are especially exposed since they render in front of the app and are the last thing the user tapped |
| `VideoModal.tsx` / `InfoSheet.tsx` / `ConfirmSheet.tsx` X-close | `text-muted hover:text-ink w-11 h-11` | Compliant on size; missing active |

Recommended codemod: any `hover:bg-X` in a `<button>` or `<a>` gets `active:bg-X` (or `active:bg-X/80`) appended. Same for `hover:text-X`. Skip Links with `data-nopress` (globals.css:119 already respects this attr). Total scope: single `sed` pass across `src/components/` and `src/app/` — verify with a Playwright a11y run.

---

## 7. iOS-specific gotchas

- **100vh occurrences:** grep for `min-h-screen` and `h-screen` returned zero — the app has already been cleaned. BUT `layout.tsx:56` uses `<html className="h-full">` and `layout.tsx:57` uses `<body className="min-h-full ...">`, both of which resolve through the viewport-height chain on iOS. Recommend `[100dvh]`. See systemic 2.3.
- **Fixed nav on scroll bounce:** `overscroll-behavior-y: none` on html/body (`globals.css:57`) neutralises the classic iOS PWA "white gap on scroll" — confirmed clean. Passes.
- **PWA standalone top-inset:** `viewport.viewportFit = "cover"` (`layout.tsx:51`) opts in to safe-area insets on standalone. `appleWebApp.statusBarStyle = "black-translucent"` (`layout.tsx:31`) means the status bar overlays the top of the app — but the header at `AppShell.tsx:117` uses `pt-3` (12px) with NO `env(safe-area-inset-top)`, so on iPhone 14 Pro (dynamic-island 59pt safe-area-top) the TERAV wordmark renders UNDER the dynamic island in standalone/PWA install mode. Verdict: **P1 bug** on installed PWAs. Fix: change `layout.tsx:57` body to `min-h-[100dvh] pt-[env(safe-area-inset-top)]` OR the header to `pt-[calc(env(safe-area-inset-top)+0.75rem)]`.
- **Pull-to-refresh on Today:** `overscroll-behavior-y: none` on body kills the browser pull-to-refresh — the user can't accidentally trigger a reload while scrolling up. Verdict: correct for a PWA. Passes.
- **Zoom-lock:** `maximumScale=1, userScalable=false` (`layout.tsx:49-50`). Accessibility trade-off: users who genuinely need to zoom (low vision) cannot. WCAG 1.4.4 asks for zoom to 200%. Verdict: **A11y risk, out-of-scope for mobile-UX but flagged** → see `app-audit-N-accessibility`. As a compromise, remove `userScalable=false` and keep `maximumScale=5`; the "pinch-zoom compounds fixed chrome" bug can be addressed via `position: sticky` on top nav OR JS-locking zoom only on `/check` and log flows where the numeric keypad would collide.

---

## 8. Priorities

**P0 (blocking):**

- 2.5 Heatmap cells ≥ 44×44 hit area (`Heatmap.tsx:135-156`) — expand-slop wrapper. Cheapest possible tap-target win.
- 2.4 Fixed nav collides with iOS keyboard on `/check` and log flows — hide nav via `visualViewport.resize` listener on `<body>`.
- 3.persona-strength `/` primary CTA hierarchy — `RETEST — LOG YOUR NUMBERS` becomes the visually dominant action; secondary "Pick next program" outlined below.

**P1 (do this month):**

- 2.3 `[100dvh]` migration in `layout.tsx:56-57`.
- 2.7 Save-morning-check primary tile on Today for persona-recover (immediately below date nav).
- 2.8 `::-webkit-slider-thumb { width:28px; height:28px }` in `globals.css`.
- Section 7 PWA standalone: add `env(safe-area-inset-top)` to header padding so wordmark clears dynamic island.
- 3.persona-erratic `/history` heatmap-clickable-cells 44×44 (same as 2.5).
- 2.6 Bump nav labels 9px → 10.5px, drop uppercase.
- 3.persona-strength `/` — auto-expand SignalsStrip when only 1 signal present (`SignalsStrip.tsx:180`).

**P2 (nice to have):**

- 2.2 `active:` codemod across 60+ hover targets.
- 3.persona-recover `/check` slider tick marks + snap.
- 3.persona-strength `/coach` empty-state quick-actions.
- 3.persona-strength `/profile` wrap Sign out in ConfirmSheet.
- 3.persona-erratic `/history` virtualise 45-row LogList.
- Section 5 Heatmap legend: drop "nothing" swatch; single-row snap-scroll.
- Section 4 Bottom nav active tab: add `border-t-2 border-bronze` on active `<li>` for glanceable indication.

---

Out of scope, flagged:

- Nav label uppercase copywriting decision → see `app-audit-N-copy-clarity`.
- Range-slider color / palette on `accent-color` → see `app-audit-N-visual-craft`.
- `motion-safe:animate-*` route-in performance on entry → see `app-audit-N-motion-perf`.
- WCAG 1.4.4 zoom lock → see `app-audit-N-accessibility`.
- Whether "Coach" placeholder is honest against landing promises → see `app-audit-N-landing-alignment`.
