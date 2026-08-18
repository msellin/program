# Terav app · 2026-08-18 mobile-UX sweep

Scope: today's ship — intake wizard, block-object Today/Week, per-program adherence + history, Beta toggles, BottomNav intake-hide.
Viewport basis: 393×852 (iPhone 15 Pro) primary; 375×667 (iPhone SE) cross-check; desktop 1280 sanity.

---

## 1. Top 3 to fix this week (P0)

### P0-1. Wizard `ConfirmSheet` / `MoveSheet` inputs are ~32px tall — under Apple 44 and iOS date-picker anchors misalign

**Where:** `PerProgramActions.tsx:190` (skip-reason input) + `PerProgramActions.tsx:264` (move-date input).

Both inputs use `px-2 py-1.5 border rounded bg-surface text-sm`. `py-1.5 = 6px` top/bottom + `text-sm` 14px line-height ≈ **32px total height**. Apple HIG requires 44pt. The move-date input is worse: it's a `<input type="date">`, and on iOS Safari the wheel picker anchors to the input's baseline — a 32px input pushes the picker up such that on 375×667 SE the picker can overlap the sheet header. This is the ergonomic worst offender of the ship because both sheets sit inside a modal that the user is committing an action from.

**Fix (both files):** raise inputs to `px-3 py-3 min-h-[44px] text-[15px]` (matches wizard's own input treatment at `IntakeClient.tsx:914`). Also add `inputMode="text"` to the reason input for keyboard type predictability.

---

### P0-2. Wizard fixed footer covers text input on step 2 (rowing `current_2k_time`, hip `age_band` free-form) when iOS keyboard opens

**Where:** `IntakeClient.tsx:1068-1102` (`WizardFooter` = `fixed bottom-0 z-40`).

When the user focuses a `<input type="number">` (line 905) or `<input type="text">` (line 928), iOS Safari raises the keyboard but does NOT push the fixed footer up on legacy layout-viewport model — the footer *overlays* the input's escape route. The user has entered a value, the keyboard is up, but "Next →" is behind the keyboard AND the bottom-nav-style footer covers the visual bottom of the visualViewport. Worse: BottomNav's `useKeyboardOpen` hides `BottomNav` (line 31) but does NOT hide the wizard footer — inconsistent behavior for the same class of chrome.

**Fix:** either (a) mirror the `useKeyboardOpen` trick from `BottomNav.tsx:84` inside `WizardFooter` and swap `fixed bottom-0` for `sticky bottom-0` while keyboard is open, or (b) change the footer to `position: sticky` inside a `flex flex-col min-h-[100dvh]` outer — sticky respects the visualViewport on iOS and rides above the keyboard automatically. Option (b) is cleaner and eliminates the `pb-32` reservation on line 634. Bonus: on desktop 1280 the sticky pattern makes the footer sit at the natural end of the wizard body instead of pinned to viewport bottom over empty space (see check #2 in the brief — the desktop tab-bar feel goes away).

---

### P0-3. `DayHeaderShortcut` confirm-swap buttons are `min-h-[40px]` (under Apple 44) and the confirm button jumps 60+px on state swap

**Where:** `page.tsx:462` (Skip whole day) + `page.tsx:481` (Confirm skip) + `page.tsx:471` (Cancel).

Two problems in one component:

1. Both mono-caps buttons are `px-3 py-2 min-h-[40px]`. **40 < 44**, Apple fail. At 393×852 the top-right of the shortcut card sits in the primary thumb zone for a right-handed cradle grip, so this is not an ouch-zone excuse.
2. The initial state is one button ("Skip whole day", ~130px wide). Post-tap it's two buttons ("Cancel" + "Confirm skip", ~180px combined). The container is `flex items-center justify-between` — the swap pushes the day-header text on the left AND changes the click target's x-coordinate by ~50px. A user tapping "Confirm skip" is aiming at where "Skip whole day" was; Fitts distance from thumb origin (~x=290, y=790) shifts unpredictably.

**Fix:** raise both buttons to `min-h-[44px]`, and reserve width in the pre-confirm state — wrap both states in a fixed-width shell (`min-w-[176px] flex justify-end`) so the confirm button lands under the skip button's original position. Also autofocus Confirm after swap so keyboard users don't tab back through Cancel.

---

## 2. Findings by surface

### `IntakeClient.tsx`

- **line 634** `pb-32` (128px) reserves for the 40-52px footer + safe-area — over-reserved by ~30px but not harmful. Passes.
- **line 716** `WizardProgress` sticky top uses `-mx-4 px-4` to bleed edge-to-edge inside a `max-w-2xl` body. On 393×852 with AppShell `px-4`, the negative margin correctly cancels; verified. But it uses `bg-ground/95 backdrop-blur-sm` — the blur on scroll is a known Safari repaint cost. Not a P0 unless perf agent flags it.
- **line 719** `role="progressbar"` + `aria-valuenow/min/max` — good; but you're missing `aria-valuetext="Step X of Y"` for SR users. → see `app-accessibility`.
- **line 861** short-label chip strip `min-h-[48px]` — passes. Good.
- **line 804** option row `min-h-[52px]` — passes. Good.
- **line 914 / 925 / 932** numeric/date/text inputs `min-h-[48px]` — passes.
- **line 1029** consent checkbox `w-5 h-5` (20px). The whole `<label>` at line 1024 is `cursor-pointer` and contains the checkbox + span — the tap target is the label height (~48px given `leading-relaxed` + `space-y-3`). Passes; consent Q1 in the brief answered as "yes, whole label clickable".
- **line 1079** Back button: `px-4 py-3 min-w-[88px]`. `py-3 = 12px`, `text-[12px]` line-height ~16px → **~40px total height**. Under Apple 44. Contributes to P0-2 severity.
- **line 1094** Next/Finish button: `px-5 py-3 min-w-[100px]`. Same ~40px height. Same fix.
- **line 1123** `PictogramTile` uses inline `style={{ transform: 'scale(2)' }}` when `large` — creates a stacking context and Safari sometimes retains subpixel blur at scale on rotate. Cosmetic, not P0.
- **Sticky top progress on tall content:** WizardPhysicalTestsScreen (lines 953-1002) is the only step likely to exceed viewport on 393×852. With 3 tests × ~140px each = 420px + header 100px = 520px body. Fits in 852-100 nav = 752 easily. Progress bar stays visible; scroll works. Passes.

### `BottomNav.tsx`

- **line 35** route hide regex `/^\/programs\/[^/]+\/intake\/?$/` — `[^/]+` blocks subpaths, `\/?$` allows trailing slash, no `?` or `#` handling. **Edge case:** deep-link with query string `?resume=1` will match (query strings are not part of `usePathname()` return in Next 15). Passes.
- **line 39** `pb-[env(safe-area-inset-bottom)]` on the nav wrapper + inner `min-h-[52px]` on each tab — total tab height ≥ 52 + 34 (home indicator) = 86px on iPhone 15 Pro. Safe-area handled. Passes.
- **line 45** `max-w-[760px]` ul — on 393px viewport with 5 tabs = 78.6px each. Each tab is 78.6 × 52. That's a healthy target. Good.
- **line 31** `useKeyboardOpen` hide — inconsistent with wizard footer (see P0-2). Consider extracting the hook and reusing in `WizardFooter`.

### `PerProgramActions.tsx`

- **line 88-105** 2-button `grid-cols-2 gap-2` at 393×852 with `max-w-[760px]` outer + AppShell `px-4` inside a per-program section at `pl-3` (BlockSection border-l-4 pl-3 — see `page.tsx:846`) → button width ≈ (393 - 32 - 12 - 8) / 2 = **170px each**. On SE 375: (375 - 32 - 12 - 8) / 2 = **161px each**. Icon 14px above text `text-[12px]` — comfortable. Passes.
- **line 92, 100** each button `min-h-[52px]` — Apple 44 pass.
- **line 190, 264** — see P0-1.
- **line 172, 178, 249** X-to-dismiss buttons are ONLY an `<X size={18} />` with no wrapper padding/min-h. In flex `items-start justify-between gap-3` the click target is 18×18 icon **only** = massive Apple 44 fail. This is muscle-memory for iOS users but on cheap Androids the "close" hit rate craters.
  **Fix:** wrap in `p-1 -m-1` or apply `w-11 h-11 flex items-center justify-center` on the button.
- **line 194, 267** Cancel + Confirm buttons: `py-2 text-sm` ≈ **36px height**. Both are inside a modal footer. Apple 44 fail on the primary commit action.
  **Fix:** `py-3 min-h-[44px]`.
- **line 163, 240** modal shell `flex items-end sm:items-center` — good, bottom-sheet on mobile is the right pattern. `p-3` on the backdrop leaves ~12px of tap-outside-to-dismiss zone — usable.
- **iOS keyboard on reason input (line 185):** the modal is `fixed inset-0` with `items-end` — when the keyboard rises, iOS scrolls the modal panel above the keyboard automatically (the panel is bottom-anchored, not fixed). Passes.
- **iOS keyboard on date input (line 259):** `<input type="date">` opens the wheel picker, not the keyboard — panel stays put, picker overlays bottom half of viewport. If the panel sits at bottom (`items-end`), the picker will cover the panel including the Move/Cancel buttons. **Medium-priority:** on picker open, either add `items-center` at all breakpoints or scroll the panel up. Not P0 because the picker has its own Done button, but it's ugly.

### `page.tsx` (DayHeaderShortcut only)

- See P0-3.
- **line 451** container `flex items-center justify-between` at 393×852 with AppShell `px-4` = 361px content. Text left + button right; when text wraps to 2 lines and the button state has 2 elements, the whole card grows vertically. On SE 375px this crams — "Skip whole day" text might wrap to "Skip whole / day" if `programCount` label is long. Non-blocking but wrap in `flex-shrink-0` on the button cluster.
- **line 460** the `border-l-4` visual is fine (~4px eaten from left content); no thumb-reach implication.

### `week/page.tsx` (dot cluster only)

- **line 336-350** `flex items-center gap-0.5 flex-shrink-0` for the dot row. On SE 375 with 4 dots + `+N` fallback: 4 × 8 + 3 × 2 + label ~14 = **48px cluster max**. Row body `flex-1 min-w-0` gets 375 - 32 (px-4) - 12 (gap-3) - 48 (dots) = **283px** — enough for "Mon 18 Aug · block_strength_moderate + block_accessory_hip" wrapped to 2 lines. Passes.
- **line 344** `title={...}` tooltip only — touch users get nothing. Not a P0 because the legend (`week/page.tsx:193`) is above the list, but if the founder wants block-level detail on tap, tap-through-to-Today from the row would be the right pattern.
- **line 379** the "programs" chip `text-[10px]` + `px-1.5 py-0.5` = ~18px tall — informational only, not tappable. Fine.
- **Overflow-x on day row (per brief):** the row is `flex items-start gap-3` with a `flex-1 min-w-0` body. Inside body: `flex items-baseline gap-2 flex-wrap`. `flex-wrap` prevents horizontal overflow. Long block-id strings wrap to a new line. Passes.
- **line 388, 391** italic override/skip reason lines — no min-h, but they're purely informational.
- **Adherence stripe at 5% width:** on 375px viewport, PerProgramAdherenceCard bar width ≈ 343px. 5% = 17px. Visible. At 1% = 3.4px, barely visible. **Recommendation, not P0:** floor with `min-width: 4px` on the `<span className="bg-green">` when `r.done > 0`. → see `PerProgramAdherenceCard.tsx:110`.

### `PerProgramAdherenceCard.tsx`

- **line 105** stacked bar `h-1.5` = 6px. At 393px viewport, decent visibility. Would benefit from `min-w` floor when a state is `>0` but its percent is <2%. Non-blocking.
- **line 130-134** footer line concatenates up to 4 optional segments with `·` separators. At 393px `text-[10px] font-mono uppercase tracking-widest` — with all 4 segments: "12 done · 3 upcoming · 2 skipped · 1 moved" ≈ 220px. Fits comfortably. On SE 375: same, fits. Passes.
- **line 107** `role="img" aria-label={...}` — good verbose SR label. Passes.
- **line 88** header `flex items-baseline justify-between gap-2` — no wrap. On 375px "Per-program adherence" + "last 28 days" chip = ~280px. Fits. Good.

### `BlockHistorySection.tsx`

- **line 82-92** row `flex items-baseline gap-2 text-[12px]` with `date min-w-[80px] + block_template_id flex-1 + chip`. On 393px content ~343px minus 80 (date) minus 12 (gap) minus ~70 (chip) = 181px for `block_template_id`. Long IDs like `block_strength_moderate` (~180px at 12px font) fit tightly. On SE 375: 143px — clips. Non-critical (this is the History surface, secondary), but recommend `truncate` on the middle span at line 86: `<span className="flex-1 text-strong truncate">`.

### `profile/page.tsx` (`BetaFeatureToggles` only)

- **line 325** `<label className="flex items-start gap-3 cursor-pointer">` — whole label is clickable, widens tap target to the row height. Label content is ~72px tall (title + `default on` mono-caps + `block` description with `leading-relaxed`). Row tap target ~80px × ~340px. **Passes with room to spare** — brief's "is the whole label clickable" question answered yes.
- **line 328** `w-5 h-5` checkbox (20×20) — the checkbox itself is small, but per HIG the *label-with-checkbox* is the interaction unit and it's compliant. Passes.

---

## 3. Passes cleanly

- Wizard chip strip `min-h-[48px]` (line 861) and option row `min-h-[52px]` (line 804): Apple 44 pass, well-tuned.
- Wizard sticky top progress (line 715) with `bg-ground/95 backdrop-blur-sm border-b`: correct pattern for a wizard, respects `-mx-4 px-4` edge-bleed.
- `BottomNav` intake-route hide regex: covers both trailing-slash and non-trailing-slash. Fine for the founder's URL shapes; no known query-string variant.
- `BottomNav` safe-area padding + `min-h-[52px]` tabs: good ergonomics, no home-indicator overlap.
- AppShell main `paddingBottom: calc(64px + env(safe-area-inset-bottom) + 1rem)`: BottomNav (52px) + safe-area + 16px breathing room. Clears with margin.
- `PerProgramActions` Move/Skip 2-button grid at 393px: 170px each × 52px tall. Icon-over-label holds cleanly at both 393 and 375. No overflow.
- `PerProgramAdherenceCard` 4-segment footer line on 375: fits with all segments present.
- `BetaFeatureToggles` label-click widens tap target: brief's question answered yes.
- Week dot cluster on 375: 48px max cluster width, doesn't crowd the row body.

---

## 4. Deferred / low-signal

- Adherence bar 1-2% segment visibility: cosmetic. Add a `min-w-[4px]` when the value >0 if you want it visually honest at very small ratios. Not P0.
- `BlockHistorySection` middle-span truncation on SE 375: cosmetic overflow of block IDs. Add `truncate`.
- `MoveSheet` iOS date-picker overlap with panel buttons at `items-end`: ugly but the picker has its own Done. Fix if a beta user reports.
- `PerProgramActions` X-buttons at 18×18 icon-only: fails Apple 44 formally, but iOS users hit them at close range. Add wrapper padding when convenient — batch with P0-1.
- `WizardProgress` `aria-valuetext`: SR-only nicety. → `app-accessibility`.
- `PictogramTile` `transform: scale(2)` at large size: subpixel blur risk on rotate. → `app-visual-craft`.
- BottomNav `title` attribute at line 55 causes iOS Safari to show the browser tooltip on long-press — mostly harmless, could be removed since the visible `<span>` label already reads the name.

---

## Ship recommendation

Two P0 fixes (sheet inputs to `min-h-[44px]`, wizard footer keyboard behavior), one high-P0 (DayHeaderShortcut confirm-swap). All three are one-line-per-callsite changes. The intake wizard's option-row and chip-strip work is genuinely well-tuned and shipped correctly for touch — the debt is entirely in the modal footers.
