# Terav app — Mobile UX audit (post 2026-08-17 sitting)

Focus: changes shipped since 2026-08-17 (intake wizard rebuild, physical-test
radiogroups, Week Now-button reserved slot, Progress density rebuild, catalog +3
programs, HERITAGE RetestLoggingSheet, ProposalCard Cluster A/B/C variant,
WeeklyNarrativeTile headerChip slot). Viewport basis: 393×852 primary, 375×667
SE cross-check.

Codebase: `next-app/` on `main` @ 586f4d7.

---

## Backlog reconciliation — 2026-08-17 mobile items (M1-M9 inferred)

The prior mobile audit expressed its P0/P1s as sections 2.1-2.8 and
D1/D2/D3 in `dev/active/post-audit-p0s/tasks.md`. Cross-referencing to the
in-code `M[n] fix` comment markers actually present (`M5`, `M6`, `M7`, `M9`)
and to the P0/P1 order I close the loop as:

- **M1 · Primary CTAs land above the thumb zone** — `SessionActions.tsx`,
  `HeroStateCard.tsx`. STATUS: **OPEN**. Still no sticky action bar on `/check`;
  Save Check button is still inline at bottom of a long form.
- **M2 · `hover:` without `active:`/`focus-visible:` twin (60+ occ.)** —
  STATUS: **OPEN**. Sample grep: `BottomNav.tsx:58` (`text-muted hover:text-ink`
  no active), `AppShell.tsx:132/139`, `WeeklyNarrativeTile.tsx:74,83`. Newly
  shipped surfaces repeat the pattern: `RetestLoggingSheet.tsx:127,134`,
  `IntakeClient.tsx:961,1026,1079,1216` all `hover:` only.
- **M3 · 100vh trap in `<html class="h-full"> + <body class="min-h-full">`** —
  `layout.tsx:61,66`. STATUS: **OPEN**. Unchanged. IntakeClient now sets
  `min-h-[100dvh]` on its own root (`IntakeClient.tsx:712`) which is the
  correct pattern — root layout should copy it.
- **M4 · Fixed nav collides with iOS keyboard on `/check`, log flows** —
  `BottomNav.tsx:26-31,84-99`. STATUS: **DONE**. `useKeyboardOpen()` listens
  to `visualViewport.resize`, threshold 100px, returns `null` from the nav
  while open. Ships the D2 fix.
- **M5 · OnboardingRunner modal z-index above ConfirmSheet** —
  `OnboardingRunner.tsx:88`. STATUS: **DONE** (2026-08-17).
- **M6 · Double body padding under fixed nav** — `layout.tsx:62-66`.
  STATUS: **DONE** (2026-08-17).
- **M7 · ProposalCard duplicate dismiss affordances (X + Ignore)** —
  `ProposalCard.tsx:225`. STATUS: **DONE** (2026-08-17).
- **M8 · Heatmap cells below Apple 44** — `Heatmap.tsx:151`. STATUS:
  **PARTIAL** — cell floor lifted from `minmax(14px, 1fr)` to
  `minmax(32px, 1fr)`. Still 12px shy of Apple 44 in practice. On
  393px viewport with 12 columns the aspect-square renders ~32×32.
  Cell hit area is not wrapped in a 44px slop container. Re-open as **STALE**.
- **M9 · Onboarding modal keyboard-open scroll** — `OnboardingRunner.tsx:94`.
  STATUS: **DONE** (2026-08-17).

Net: 5 done, 1 partial/stale (M8), 3 open (M1, M2, M3). Focus of this audit is
the eight items the founder just asked about — findings below.

---

## 1. Overall verdict

Since 2026-08-17 the app shipped several genuinely correct mobile-UX patterns:
the intake wizard footer is `sticky bottom-0` with `env(safe-area-inset-bottom)`
padding (`IntakeClient.tsx:1391-1394`); the intake root is `min-h-[100dvh]`,
the Bottom nav auto-hides on iOS keyboard-open with a real 100px `visualViewport`
threshold; the Week Now button occupies a permanently-reserved 44×44 slot so
container width never shifts across offsets; Progress collapsed 10 cards to 5
and every clickable row still hits `min-h-[48px]`; the physical-test intake
radio rows use `min-h-[56px]` label targets. That is a good body of work.

Three ergonomic failures are new or regressed:

- **RetestLoggingSheet has no bottom safe-area on the sheet card and no keyboard
  handling.** The sheet is `flex items-end sm:items-center` (bottom-anchored on
  mobile) but the inner card is only `p-4` — the Log-reading button on an
  iPhone 14 Pro parks 34pt below the visible area under the home indicator.
  Additionally the modal has no `useKeyboardOpen` behavior; when the numeric
  input focuses, the fixed inset-0 backdrop stays full-screen but the buttons
  ride *up* with the visualViewport and the sheet card can end up scrolled off.
  P0 for a form that only fires after a user Accepts a proposal.
- **HERITAGE Cluster chip in WeeklyNarrativeTile header renders at 10px inside
  a `px-2 py-0.5` container.** Vertical hit area is ~20px, horizontal ~90px.
  Currently the chip is NOT interactive (no onClick, no href) — the title
  attribute carries `composite_copy` as a tooltip. This is fine on desktop,
  hostile on touch: users can't see the explanation without a keyboard, and
  the visual size implies a chip they cannot press. Either promote to a real
  tap target (44×44) that opens an InfoSheet with the composite copy, or drop
  the 10px chip in favor of a caption line below the h3.
- **The intake wizard progress rail is `sticky top-0` at z-30 with
  `bg-ground/95 backdrop-blur-sm` — but the AppShell header above it is
  also `sticky`-ish in behavior on some browsers (in-flow scroll-away header).**
  On iOS Safari with URL bar visible, the two chrome layers momentarily overlap
  during scroll bounce because the wizard rail's `-mx-4 px-4` bleeds under the
  header. Cosmetic, not blocking, but visible.

The one thing done right this sitting: the Week Now button's `invisible
pointer-events-none` slot pattern. Container-shift-on-state-change is a
Fitts-law hazard (targets move under the thumb) and the fix is the correct
solution. Copy this pattern for any button that appears conditionally.

---

## 2. Focus-area findings

### 2.1 Physical-test intake radio-group rows — tap-target compliance

- **File:** `IntakeClient.tsx:1201-1249`
- **Options rendered as `<label>` wrapping `<input type="radio">`** at
  `min-h-[56px]` with `p-3` padding. Compliant with Apple 44 and Material 48
  with room to spare. Verdict: **PASS**.
- The `<input type="radio">` itself is `w-4 h-4` (line 1225) — 16×16 — but
  the *label* is the click target, so the visible radio circle can stay
  small. `<label>` wraps everything and `cursor-pointer` is set. Correct.
- Adjacent spacing: `space-y-1.5` = 6px between rows. Below the 8px Apple
  recommends and below the WCAG 2.5.8 24×24 target-spacing safe harbor.
  Minor: bump to `space-y-2` (8px). **P2**.
- The word-labelled option rows (`IntakeClient.tsx:936-999`) use the same
  `min-h-[52px]` I flagged last sitting on the Programs preview — 52 is fine
  for Apple 44 but 48 is stricter Material. Kept the 52. Verdict: **PASS**.
- Chip strip variant for ≤8-char labels (`IntakeClient.tsx:1002-1035`) uses
  `min-h-[48px]` + `px-4 py-3`. Verdict: **PASS**.

### 2.2 RetestLoggingSheet — iOS keyboard + safe-area

- **File:** `RetestLoggingSheet.tsx:58-141`
- Backdrop: `fixed inset-0 z-[70] bg-ground/95 backdrop-blur-sm flex items-end
  sm:items-center justify-center overflow-y-auto p-4`. Bottom-anchored on
  mobile — good default; the sheet lands under the thumb.
- **Missing:** the *card* inside (`rounded border border-line bg-surface p-4
  space-y-4`) has no `pb-[env(safe-area-inset-bottom)]`. On an iPhone 14+ with
  a 34pt home-indicator inset, the "Log reading" bronze button (line 131-137)
  is a compliant 44px tall but its bottom edge parks 34pt *below* the safe
  area. **P0**. Fix: on the outer flex container change `p-4` to
  `p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]`, or add
  `mb-[env(safe-area-inset-bottom)]` to the inner card.
- **Missing:** no iOS keyboard listener. When `autoFocus` fires on the
  numeric input (line 88), iOS pops the keyboard, the visualViewport shrinks
  by ~336px, and the sheet's `flex items-end` re-anchors to the *new* visible
  bottom — the card can jump upward mid-focus. Worse: at 375×667 SE with the
  keyboard up, the card + 2 inputs + 2 buttons exceed the ~330px remaining
  viewport, `overflow-y-auto` on the backdrop lets the user scroll, but the
  card's `space-y-4` (16px) between the second input and the button row means
  the "Log reading" primary button drops below the fold. **P0**. Fix: on
  small viewports render the card without the second (optional) compliance
  input by default — collapse it behind a "Add compliance %" disclosure so
  the primary path is one number + one button. Or: shrink `space-y-4` to
  `space-y-3` when `visualViewport.height < 500`.
- Numeric inputs use `type="number" inputMode="decimal"` on both lines
  84-85 and 103-104. Correct — decimal keypad on iOS. Verdict: **PASS**
  for keypad, **FAIL** for safe-area + keyboard-position.
- Cancel + Log reading buttons at `min-h-[44px]` — compliant.
- `hover:bg-line-soft` and `hover:bg-bronze-hover` at 127/134 with no `active:`
  twin — sticky-hover risk on iOS Safari. **P2**, part of the M2 codemod.

### 2.3 Week view Now button — permanently reserved slot when active

- **File:** `next-app/src/app/week/page.tsx:162-177`
- Slot is `w-11 h-11` = 44×44. When `offset === 0`, class chain adds
  `invisible pointer-events-none`. **Correct**: the slot still occupies grid
  width so container never shifts. When `offset !== 0`, class chain becomes
  `hover:bg-surface-2 text-bronze` (visible). Text `Now` at default font size
  (~16px) inside a 44×44 target. Verdict: **PASS on 44** when active.
- `aria-hidden={offset === 0}` and `tabIndex={offset === 0 ? -1 : 0}` on the
  invisible slot — SR and keyboard users skip it. Correct.
- Fitts-law: Now button lives at the far right of the week nav row, page-y ~180
  (header + h1 + description above). This is *secondary* zone on 393×852. For
  a jump-back-to-current-week affordance that's a rare tap after browsing
  offsets, secondary zone is honest. Verdict: **PASS**.
- Adjacent previous/next arrows also `w-11 h-11` with `gap-2` on the row —
  8px spacing. Meets Apple 8pt minimum. **PASS**.

### 2.4 Progress page density — milestone row tap targets

- **File:** `next-app/src/app/progress/page.tsx:388-434`
- MilestoneLiftGroup collapsed row: `w-full px-3 py-3 text-left flex
  items-start gap-3 min-h-[48px]`. **PASS** — Material 48 satisfied.
- Post-density rebuild, the collapsed header is now a 2-line block:
  line 1 `TM {n} kg · next {n} kg in {n}d (+/-Δ)`, line 2 `MilestoneProgressBar`.
  Vertical rhythm: `mt-0.5` + `mt-2` on the bar. Full row height at 393px
  renders ~72-84px depending on lift name length. Comfortable target size.
- Expanded rows (line 451-500): `px-3 py-2.5 pl-10` — no explicit `min-h-[44px]`
  but the content (2-3 lines + right-column meta) reliably renders ≥ 48px.
  Non-interactive rows so this is fine. Verdict: **PASS**.
- Header Export report button (line 145-150) is `px-3 py-2 min-h-[36px]` —
  below Apple 44 and below Material 48. Same finding as prior audit. Not
  changed this sitting. **P1 · STILL OPEN**. Fix: `min-h-[44px]`.

### 2.5 Programs catalog — 9 programs, scroll + peek + thumb reach

- **File:** `next-app/src/app/programs/page.tsx`
- Manifest currently has 9 slugs; `personal:true` filters `anterior-hip-rebuild`
  out for non-hip users, so the *public* catalog renders 8 cards (line 39).
- Grouped by category (line 43-48): rehab (empty in public), strength,
  gymnastics/skill, endurance, mobility. Each category is a `<section>` with
  a `<ul>` of `<li>` cards — **vertical scroll, not horizontal**. No
  carousel, no snap, no peek affordance needed. Verdict: **PASS** on layout.
- Category filter chips (line 100-115) are `min-h-[36px] px-3 py-1.5`. **Below
  Apple 44 and Material 48**. Chip strip at the top of the page, so `-mx-2`
  or scrollable overflow-x would be next-level, but the immediate gap is
  target size. **P1**. Fix: `min-h-[44px]`.
- ProgramCard link (line 247-294) is `block ... p-3` — full-width tap target
  wrapping the whole card. At 393px viewport, card renders ~80-110px tall
  depending on line-clamp-2 hit. Well above minimum. **PASS**.
- Fitts distance from cradle-grip thumb (x=195, y=790): the 1st card of the
  first category is at page-y ~250 (header + filter + section h2), reachable
  after 1 scroll. Further cards are progressively higher-priority-to-reach
  (bottom-most = most recent scroll position). Card density is such that at
  393×852 the user sees ~3-4 cards per fold. Verdict: **PASS** on catalog
  ergonomics.
- Chevron on card at `size={16}` on top-right of a `p-3` card — the chevron
  itself is not the tap target (the entire `<Link>` is), so its size is
  a visual affordance only. **PASS**.

### 2.6 Intake wizard sticky footer + reserved caption slot

- **File:** `IntakeClient.tsx:1358-1440`
- Footer is `sticky bottom-0 -mx-4 px-4 border-t border-line-soft
  bg-ground/95 backdrop-blur-sm` with
  `style={{ paddingBottom: "env(safe-area-inset-bottom)" }}`. **PASS** on
  bottom safe-area.
- Back + Next buttons at `min-w-[88px] min-h-[44px]` and `min-w-[100px]
  min-h-[44px]`. **PASS** on tap size.
- Reserved caption slot (line 1430-1437): the `<p>` is always rendered.
  When `nextReady` is true, its content is a `" "` NBSP wrapped in `invisible
  text-muted`. When false, it renders the visible secondaryTitle. Same
  container-shift-prevention pattern as the Week Now button. Verdict:
  **PASS**. The height reservation is real — `pb-3 -mt-1` and italic text at
  `text-[11px]` render ~24px whether visible or not.
- Regression check on iOS keyboard: because the wizard body uses `flex-1
  space-y-5 pb-4` inside a `flex flex-col min-h-[100dvh]` parent, the sticky
  footer rides the visualViewport correctly when the keyboard opens on a
  text/number input step. The BottomNav is hidden by the pathname regex
  (`BottomNav.tsx:35`) — no two-nav collision. **PASS**.
- One nit: `bg-ground/95` on the sticky footer means the last 24px of body
  content behind the footer are dimmed at 95% opacity. On dark backgrounds
  this is invisible; on any lighter surface (like the Consent step's
  `<details>` review card) the shadow of the ground bleeds through. Cosmetic
  only. **P2**.

### 2.7 Bottom nav — 5 tabs unchanged, safe-area on newer iPhones

- **File:** `BottomNav.tsx:16-22`. TABS array still 5: Today, Week,
  Progress, History, Profile. Verdict: **UNCHANGED**.
- Safe-area: `pb-[env(safe-area-inset-bottom)]` on the nav (line 39) +
  `paddingLeft/Right: env(safe-area-inset-left/right)` for landscape.
  Also `AppShell.tsx:150` reserves
  `calc(64px + env(safe-area-inset-bottom) + 1rem)` bottom padding on main.
  **PASS**.
- Label size: still `text-[10px]` (was `text-[9px]` last audit — this appears
  to have been bumped as part of the E2 fix). tracking is `tracking-[0.08em]`.
  At 393px viewport, 5 tabs × ~78px per tab. Labels "TODAY / WEEK / PROGRESS
  / HISTORY / PROFILE" all fit without truncation. **PASS**.
- Icon size 20, strokeWidth 2.25/1.75 for active/inactive. Active tab
  distinguished by weight + color, not color alone. WCAG 1.4.1 compliant.
- Tab hit target: `min-h-[52px]` per tab, full flex-1 width (~78px). **PASS**
  on Apple 44 by a comfortable margin.

### 2.8 HERITAGE Cluster chip in WeeklyNarrativeTile header

- **File:** `HeritageClusterChip.tsx:48-56`, wired at
  `progress/page.tsx:213`.
- Chip is `<span>`, not `<button>` or `<a>`. **Not tappable**. Title
  attribute carries the composite copy for a hover tooltip. On mobile,
  hover tooltips don't fire — users can't read `title` on touch.
- Visual: `inline-flex ... rounded-full px-2 py-0.5 font-mono text-[10px]
  uppercase tracking-widest`. Renders ~18-22px tall × ~140px wide. If it
  were interactive, this would fail Apple 44 by more than 50%.
- **Question the founder asked:** is the chip too small if tappable?
  **Answer: not tappable today.** But rendering a chip that carries
  explanatory content in a tooltip on a touch-first PWA hides information
  from the primary users. **P1**. Two options:
  - **(a) Keep non-interactive, drop the chip form-factor.** Render the
    label as a caption line below the WeeklyNarrativeTile h3
    (`WeeklyNarrativeTile.tsx:60-63`) at 12px, so the label is always
    readable. Drop the `composite_copy` tooltip entirely.
  - **(b) Make it a real button.** Wrap in `<button>` at `min-h-[44px]
    min-w-[44px]` with an `-my-2 -mx-1` negative margin so the hit-slop
    grows without visual reflow. On click, open an InfoSheet with the
    composite copy. This is the more discoverable option.
- Either way, the current state — tooltip-only affordance on a touch device —
  is a mobile-UX failure. Not blocking beta; blocking a shippable HERITAGE
  Phase 3.

---

## 3. Systemic issues (still open from prior sitting)

### 3.1 100vh trap in root layout

- **File:** `layout.tsx:61,66`. `<html class="h-full">` + `<body class="min-h-full">`.
- **Fix (still):** change to `h-[100dvh]` and `min-h-[100dvh]`. The intake
  wizard now uses `min-h-[100dvh]` on its own root
  (`IntakeClient.tsx:712`) — the pattern works, roll it up to the layout.
- **P1 · STILL OPEN.**

### 3.2 `hover:` without `active:` twin

- New surfaces added this sitting that repeat the pattern:
  `RetestLoggingSheet.tsx:127,134`, `IntakeClient.tsx:961,1026,1079,1216`,
  `WeeklyNarrativeTile.tsx:74,83`, `progress/page.tsx:147,247,392`.
- **Fix (still):** codemod `hover:bg-X` in `<button>` / `<a>` → append
  `active:bg-X`. Same for `hover:text-X`. **P2 · STILL OPEN.**

### 3.3 Heatmap cell hit-slop

- `Heatmap.tsx:151` — cell floor lifted 14 → 32. Still short of Apple 44.
  Wrap each cell in a `min-h-[44px] min-w-[44px]` transparent slop parent
  or bump the floor to 44 and accept horizontal scroll on 12+ weeks.
- **P1 · PARTIALLY DONE, STILL SHORT.**

---

## 4. Priorities

**P0 (blocking beta polish):**

- 2.2 RetestLoggingSheet safe-area-bottom + iOS keyboard handling.
  `RetestLoggingSheet.tsx:63,65` — add
  `pb-[calc(1rem+env(safe-area-inset-bottom))]` and either move the
  compliance input behind a disclosure or add a `useKeyboardOpen`
  listener that shrinks `space-y-4` to `space-y-2` when the keyboard
  is up.

**P1 (do this month):**

- 2.8 HERITAGE Cluster chip — decide (a) caption line or (b) real 44px
  button opening an InfoSheet. Ship one.
- 2.4 Progress `Export report` button `min-h-[36px]` → `min-h-[44px]`.
- 2.5 Programs catalog filter chips `min-h-[36px]` → `min-h-[44px]`.
- 3.1 Root layout 100vh → 100dvh. `layout.tsx:61,66`.
- 3.3 Heatmap cell 32 → 44 (or slop wrapper).

**P2 (nice to have):**

- 2.1 Radio row spacing `space-y-1.5` → `space-y-2`.
- 2.6 Sticky footer `bg-ground/95` opacity bleed on lighter surfaces.
- 3.2 `hover:` codemod across `RetestLoggingSheet`, `IntakeClient`,
  `WeeklyNarrativeTile`, `progress/page.tsx`.
- M1 (still open) — sticky primary CTA on `/check`.

---

Out of scope, flagged for sibling audits:

- Nav label "TODAY / WEEK / PROGRESS / HISTORY / PROFILE" uppercase → see
  `app-audit-copy-clarity`.
- Cluster chip color palette (green/amber/red at 15% bg) contrast → see
  `app-audit-accessibility` (WCAG 1.4.3).
- Progress rebuild animation on the milestone progress bar transition-[width]
  perf → see `app-audit-motion-perf`.
- Whether the Cluster A/B/C label is honest given classifier `requires_baselines`
  → see `app-audit-copy-clarity`.
