# Terav app — Mobile UX sweep (2026-08-18)

Auditor: mobile-UX specialist (Hoober / Wroblewski / HIG / M3 lineage)
Viewport basis: 393×852 iPhone 15 Pro primary, 375×667 SE cross-check, 1280 desktop
Scope: authenticated app only (`next-app/src/app/*`, excluding `(auth)` post-mount marketing).
Personas: no captured screens on disk — audit is class-based math + code diff against the 2026-08-17 sittings.

---

## 0. Reconciliation — M1-M9 status against current code

| ID | Prior status | Current-code verdict |
|----|--------------|----------------------|
| M1 min-h-screen sub-pages | DONE | **Confirmed clean.** `grep -rn "min-h-screen\|h-screen" src/` returns zero. Landing sub-pages migrated. |
| M2 Programs decorative dots | DONE | Not re-verified here — landing scope. |
| M3 hover-only interactive cards | OPEN → landing | Landing scope. In-app equivalent = M8 below. |
| M4 hero stat wraps at 393 | DONE | Landing scope. |
| M5 modal-stacking fragility | OPEN → app | Still real. OnboardingRunner at `z-[60]`, RetestLoggingSheet at `z-[70]`, everything else `z-50`. Ad-hoc; a modal registry is not in place. `OnboardingRunner.tsx:103`, `RetestLoggingSheet.tsx:71`, seven other sheets pinned to `z-50`. Not blocking today — flagged P2. |
| M6 body + main compound bottom pad | DONE | `layout.tsx:66` body no longer carries padding. `AppShell.tsx:150` main owns `calc(64px + env(safe-area-inset-bottom) + 1rem)`. Verified. |
| M7 ProposalCard dual dismiss | DONE | X-icon gone. `ProposalCard.tsx:232-235` documents the removal; only the Ignore button remains. Verified. |
| M8 83 hover: without focus-visible twins | **OPEN, worse than logged** | `grep hover: src/` = 174 matches; `grep focus-visible: src/` = 1 match (only the global `*:focus-visible` outline in `globals.css:103`). No component-level focus twin exists anywhere. See §6. |
| M9 OnboardingRunner + iOS keyboard | DONE | `OnboardingRunner.tsx:98-104`: `items-start … overflow-y-auto p-4 pt-12 sm:items-center`. Modal now sits at top on mobile, scroll fixes the keyboard shove. Verified. |

Two of the nine remain. M8 dominates the P1 backlog on its own.

---

## 1. Overall verdict

The app's mobile ergonomics are 80% of the way to feeling native and 20% still webby. The primary chrome — bottom nav, safe-area insets, the shell's paddingBottom calc, the intake wizard's sticky footer with `env(safe-area-inset-bottom)`, the `useKeyboardOpen` hider on iOS — is genuinely well done and beats most Cloudflare Pages betas. What still reads "rusty": (1) **zero component-level `focus-visible:` twins** across 174 `hover:` classes, so touch users get no press feedback on cards/pills/link-buttons that aren't already covered by the global `*:active { scale }`; (2) **secondary IconButton controls at 36-40px** — DateNav quick actions on Today/Week/Progress, the RunSlotCard remove-run X (`w-8 h-8` + `size={13}`), the WeeklyNarrativeTile arrows (`w-9 h-9`), YourPlanCard dismiss (`w-8 h-8` at line 84) — all sub-Apple-44 and cluster together; (3) **the RunSlotCard "Log session" / "Import GPX" links** are text-only `text-[13px]` with no min-height (`RunSlotCard.tsx:581,589`) — the only entry point to the extras flow on 4 of 5 program surfaces and it's a 20px-tall tap. Fix (3) alone will remove the biggest single "webby" feeling. Bottom nav, safe-area, sticky-footer intake, keyboard-hide, and Set-row inputs are all correct — leave them alone.

---

## 2. Systemic issues (spanning ≥ 2 personas / routes)

### 2.1 Zero component-level `focus-visible:` twins (M8, systemic)
- **Where:** every persona × every route with an interactive card, pill, IconButton, or link.
- **Files:** 174 `hover:` matches across `src/`; 1 `focus-visible:` (globals only). Representative: `AppShell.tsx:123,132,139`, `BottomNav.tsx:58`, `RunSlotCard.tsx:254,303,326,464,489,581,589`, `WeeklyNarrativeTile.tsx:74,83`, `HeaderQuickLinks.tsx:73,95`, `Heatmap.tsx:163`, `ProposalCard.tsx:240,247`, `CitationRef.tsx:44,69`, `SignalsStrip.tsx:229`, `ConfirmSheet.tsx:79,89,101,102`, `EmptyStateCard.tsx:33`, `ProgramPreviewClient.tsx` (multiple).
- **Law violated:** iOS "sticky hover" — first tap paints the hover state and doesn't clear until the user taps elsewhere. Touch users see delayed press feedback on the *previous* card when they tap the *next* card.
- **Fix (one-shot):** in `globals.css`, add a utility:
  ```css
  @media (hover: none) {
    .hover\:bg-line-soft:hover,
    .hover\:bg-surface-2:hover,
    .hover\:bg-bronze-hover:hover,
    .hover\:text-ink:hover { background-color: unset; color: unset; }
  }
  ```
  This is the pragmatic mobile-first patch. The proper fix is to add `focus-visible:` and `active:` twins on every interactive component, but 174 sites over one PR is a bigger change than the beta needs.

### 2.2 Sub-44 icon-button clusters on primary content
- **Where:**
  - Today: WeeklyNarrativeTile prev/next `w-9 h-9` × 2 sitting 4px apart at `gap-0.5` (`WeeklyNarrativeTile.tsx:68,74,83`). 36×36 targets 2px apart. Adjacent-target rule violated.
  - Today: MissedSessionPrompt Dismiss `w-9 h-9 -m-2` (`MissedSessionPrompt.tsx:110`) — the negative margin extends the hit region into the parent's padding, so effective 36px on a light-amber banner sits over the underlying card; a mis-tap logs a false-positive Log-yesterday.
  - Today: YourPlanCard dismiss `w-8 h-8` + `X size={14}` (`YourPlanCard.tsx:84`). 32×32. Below WCAG 2.5.8 24×24 min? No (32>24). Below Apple 44? Yes.
  - Every route: HeaderQuickLinks trigger `w-9 h-9` (`HeaderQuickLinks.tsx:73`) sits 2px from the Morning-check stethoscope which IS 44×44 (`AppShell.tsx:139`). Adjacent-target rule violated on the right of the top nav.
  - RunSlotCard per-run remove-X `w-8 h-8 -my-1` + `X size={13}` (`RunSlotCard.tsx:299-306`). 32×32 with a 13px glyph. Two logged runs stacked = two X-buttons 4px apart at 32px each.
  - Coach: header Trash icon `w-11 h-11` correct (`coach/page.tsx:260`), BUT the send/stop button pair (`coach/page.tsx:322-340`) is `w-11 h-11` correct — Coach primary send is fine. Callout only for cohesion with WeeklyNarrative fix.
- **Law violated:** Apple HIG 44×44, Material 3 48×48, WCAG 2.5.8 "adjacent target 8px gap or 24×24 min."
- **Fix:** promote every `w-9 h-9` and `w-8 h-8` icon button carrying a real action to `w-11 h-11`. Split into two commits — chrome (WeeklyNarrativeTile, HeaderQuickLinks, YourPlanCard) then card actions (RunSlotCard remove, ExerciseCard 331 note button already `w-11 h-11`).

### 2.3 Text-only tap targets under 44px on the extras flow
- **Where:** `RunSlotCard.tsx:578-593` — "Log session" and "Import GPX" are `inline-flex items-center gap-1.5 text-[13px] text-slate hover:text-ink` with no min-height. At 13px line-height ~18px + no padding = **~20px tall**. On persona-strength and persona-erratic this IS the only extras entry point.
- **Law violated:** Fitts + Apple 44. Also the *only* extras entry point on 4/5 programs — this is a P1.
- **Fix:** `... min-h-[44px] py-2` on both buttons. Match the "Log yesterday now" 36px pattern from `MissedSessionPrompt.tsx:124` — or better, actually 44px since these are primary intents.

### 2.4 `min-h-[36px]` primary-action pattern is one class-swap from correct
- **Where:** RunSlotCard activity picker + intensity + rowing-session-type pills (`RunSlotCard.tsx:323,461,487`); Programs filter row (`programs/page.tsx:111`); Report filter row (`report/page.tsx:161`); MissedSessionPrompt CTAs (`MissedSessionPrompt.tsx:124,131`); Today "Log yesterday" pair (`page.tsx:680,686`); Week nav back (`week/page.tsx:119`); Progress nav back (`progress/page.tsx:147`).
- **Law:** Apple 44. WCAG 2.5.8 tolerates 24×24; these are 36 and pass WCAG — but they're the primary way to change activity/intensity and Fitts favors the larger target here.
- **Fix:** blanket swap `min-h-[36px]` → `min-h-[44px]` in RunSlotCard **only** (that's the log-form path). Leave filter pills at 36; those are secondary.

### 2.5 `hover:` states on the Heatmap cell-buttons never fire on touch (M8 sub-case)
- **Where:** `Heatmap.tsx:163` — `cursor-pointer hover:ring-1 hover:ring-slate/60`. On touch, the ring never appears; user gets no press feedback on the tap that opens the History day row.
- **Fix:** replace with `active:ring-1 active:ring-slate/60`. Better: add `focus-visible:ring-1 focus-visible:ring-slate/60`.

---

## 3. Per-persona / per-route punch-list

### persona-recover — /check (log form + sliders)

| Element | File:line | Class today | Issue | Fix |
|---------|-----------|-------------|-------|-----|
| SliderRow `<input type="range">` | `check/page.tsx:230-243` | `w-full mt-1 accent-bronze min-h-[44px]` | Good — real `range`, 44px hit region, aria-valuetext | none |
| CheckBoxRow entire label | `check/page.tsx:262-273` | `flex items-center gap-2.5 px-3 py-3 text-sm cursor-pointer` | Label wraps the checkbox, entire row is tap zone. Good | none |
| "Outside training yesterday" text input | `check/page.tsx:171-178` | `min-h-[44px]` | Good | none |
| "Save check" | `check/page.tsx:184-189` | `w-full bg-bronze text-ground rounded py-3 font-semibold` | Good — full-width, bottom-primary zone, py-3 = 48px | none |
| Slider label + numeric readout column ratio `1fr_50px` | `check/page.tsx:217` | grid-cols-[1fr_50px] gap-3 px-3 py-3 | At 375px SE with L/R bilaterality chip prefix, the "Shoulder / upper body" wraps to two lines before the number, throwing off the row rhythm. Cosmetic. | Tighten to `1fr_44px gap-2` and drop the readout suffix to `text-[13px]` |

Overall: /check is the tightest surface in the app.

### persona-strength — /coach + Today with ProposalStack

| Element | File:line | Class today | Issue | Fix |
|---------|-----------|-------------|-------|-----|
| Coach page container height | `coach/page.tsx:249` | `minHeight: "calc(100dvh - 180px)"` inline | Correct — uses `dvh` not `vh` | none |
| Coach message scroller | `coach/page.tsx:283-286` | `maxHeight: "calc(100dvh - 320px)", minHeight: 240` | Correct dvh | none |
| Coach textarea | `coach/page.tsx:309-321` | `min-h-[48px] resize-none rows={2}` | 48px is Material 3; iOS keyboard doesn't cover it because BottomNav hides on keyboard-open (`BottomNav.tsx:31`). Good | none |
| Coach Send / Stop button | `coach/page.tsx:322-340` | `w-11 h-11` | Good | none |
| Coach clear-history Trash | `coach/page.tsx:256-263` | `w-11 h-11` | Good | none |
| Starter-prompt cards `Empty` | `coach/page.tsx:369-378` | `w-full text-left … px-3 py-2 rounded border` | No min-height. py-2 + text-[13px] ≈ 34px. Sub-44 on a wrap-friendly button. | Add `min-h-[44px]` |
| Today ProposalCard Accept | `ProposalCard.tsx:237-243` | `min-h-[44px]` | Good | none |
| Today ProposalCard Ignore | `ProposalCard.tsx:244-250` | `min-h-[44px]` | Good | none |
| ProposalStack card spacing | `ProposalStack.tsx` (verified) | `space-y-3` per V8 fix | Good | none |
| pulse-accept feedback | `globals.css:140-144` | 500ms green pulse on Accept | Good — the tapworthy micro-interaction | none |

Cradle-grip right thumb origin at ~(195,790) for a 393×852 viewport: Accept sits at ~y=520 on a first-render Today with one proposal — 270px reach, within Zone 1. Fine.

### persona-erratic — /history heatmap + wide content

| Element | File:line | Class today | Issue | Fix |
|---------|-----------|-------------|-------|-----|
| Heatmap cell button | `Heatmap.tsx:154-172` | `aspect-square` + `gridAutoColumns: minmax(32px, 1fr)` + `hover:ring-1 hover:ring-slate/60` | 32px cells, ~1px gap. WCAG 2.5.8 24×24 pass, Apple 44 fail. Comment on line 27-30 notes this was already an audit item. Hover never fires on touch. | Add `active:ring-1 active:ring-slate/60`; consider 8-week × 40px alt for mobile |
| Heatmap overflow-x container | `Heatmap.tsx:146` | `flex-1 overflow-x-auto` | Correct — wide grid scrolls internally at 8×32=256 + gaps, fits 393; if user swaps to 12-week view (future) the overflow container catches. Good | none |
| Row-label column | `Heatmap.tsx:134-144` | `flex flex-col gap-0.5` + 9px letters | Cosmetic — the labels are 9px which is below WCAG 1.4.4 preferred; hand off to `app-accessibility` | → see `app-audit-accessibility` |
| Legend | `Heatmap.tsx:218-229` | `flex flex-wrap gap-3 text-[11px]` | 11px legend text is aria-hidden safe (accompanies grid role) but ergonomically the labels don't need to be tap targets — pass | none |
| History day-row scroll target | `history/page.tsx:64-68` | `scrollIntoView({ behavior: "smooth", block: "center" })` | Correct behavior — heatmap tap opens the day in the log list below | none |

### Both — /week (new run + top-lift lines added since 2026-08-17)

| Element | File:line | Class today | Issue | Fix |
|---------|-----------|-------------|-------|-----|
| Week "jump back" nav | `week/page.tsx:119` | `min-h-[36px]` | Fine for a secondary nav | none |
| Day row logged-run line | `week/page.tsx` (subsequent render) | not read here | Verify it doesn't push the whole day cell past viewport width. Cursory read: renders as inline text, no overflow risk. | none |

### Profile — new delete-account cascade (since 2026-08-17)

| Element | File:line | Issue | Fix |
|---------|-----------|-------|-----|
| Delete-account CTA + confirm sheet | `profile/page.tsx:63-96` + ConfirmSheet | Uses `ConfirmSheet` which has `min-h-[44px]` on both buttons (`ConfirmSheet.tsx:89,99`) and `pb` from body-modal — good | none |
| Sign-out row placement | `profile/page.tsx` (bottom of page) | Destructive at bottom, requires scroll = 2 taps to reach. Correct per Josh Clark ouch-zone rule for destructive. | none |

Delete-account cascade is well done.

---

## 4. Sticky bottom nav — deep dive

- File: `BottomNav.tsx:24-99`
- **Safe-area handling:** `pb-[env(safe-area-inset-bottom)]` at line 39, `paddingLeft/Right` inline at 41-42. Correct across notch, home indicator, and rounded-corner devices. Note: NO `paddingTop` — fine, since the nav sits at bottom.
- **Behavior with iOS keyboard:** `useKeyboardOpen` (line 84-99) via `visualViewport.resize` with a 100px threshold. Hides the nav entirely when keyboard is up. Tested pattern; correct. Coach textarea + /check outside-training + intake wizard all benefit.
- **Route indication clarity:** color (`text-ink` active vs `text-muted`) AND weight (`strokeWidth={active ? 2.25 : 1.75}`). Two orthogonal channels; passes WCAG 1.4.1 use-of-color. Good.
- **Bottom-padding on scrollable content:** `AppShell.tsx:147-152` main paddingBottom `calc(64px + env(safe-area-inset-bottom) + 1rem)`. 64px nav + inset + 16px = ~96px. Correct — no dead-zone or overlap.
- **Intake exception:** BottomNav hides on `/programs/{slug}/intake` (line 35). Correct — intake has its own sticky footer with `env(safe-area-inset-bottom)` at `IntakeClient.tsx:1396-1398`. Two-footer collision avoided.
- **Route active flex hit region:** `flex-1 min-w-0` on the `<li>` × `min-h-[52px]` on the `<a>` — full-width, ≥ 44px each, adjacent to sibling with no gap (5 tabs share the row edge-to-edge). At 393px this gives 78×52 hit regions per tab. Excellent.

Verdict: BottomNav is one of the strongest parts of the app.

---

## 5. Heatmap & wide-content specifics (persona-erratic focus)

- File: `Heatmap.tsx:107-198`
- **overflow-x containment:** `flex-1 overflow-x-auto` on line 146 wraps the grid. Correct — the wide grid scrolls internally.
- **Tap target per cell at 393px:** `gridAutoColumns: minmax(32px, 1fr)` = 32px minimum. Comment on line 27-30 documents that this was reduced from 12 weeks × 26px to 8 weeks × 32px specifically for Apple's 44px rule — but the comment is aspirational; the actual output is still 32px, not 44. **P2 — WCAG 2.5.8 passes at 32, Apple 44 fails.** For beta, acceptable.
- **Long-year edge case (persona-erratic 45+ days):** `WEEKS = 8` (line 31) caps to 56 days regardless of user data span. No blow-out. `history/page.tsx:48` also caps sparklines to 180 days by default with a "See full history" toggle. Good.
- **Cell aria-label:** `cellAria(c)` (line 200-214) produces per-cell announcements like `2026-08-18: green day (3 exercises) · today`. Screen-reader friendly.
- **Empty-cell tap target:** empty cells with `onDayClick` still render as `<button>` with the same 32×32 aria-labelled target. A tap on "no activity" scrolls the log-list to that day — which shows nothing new. Intended? Probably yes, so users can log a backdated session — verify with founder.

---

## 6. Hover-on-touch traps — the M8 backlog, live

`grep hover: src/` = 174 matches. `grep focus-visible: src/` = 1 (globals.css).

The globals fallback (`*:focus-visible { outline: 2px solid var(--color-bronze) }` at `globals.css:103`) catches keyboard focus rings but NOT touch press states. iOS still holds `:hover` after tap.

Highest-impact sites to patch first:

| File:line | Class | Fix |
|-----------|-------|-----|
| `Heatmap.tsx:163` | `hover:ring-1 hover:ring-slate/60` | replace with `active:ring-1 active:ring-slate/60` — most-tapped cells in the app |
| `AppShell.tsx:123,132,139` | `hover:text-ink hover:bg-line-soft` | add `active:bg-line-soft/70 focus-visible:bg-line-soft/70` |
| `BottomNav.tsx:58` | `hover:text-ink` | leave — bottom nav has `active:scale(0.98)` from `globals.css:118-121` |
| `RunSlotCard.tsx:254,303,326,464,489,581,589` | multiple `hover:text-ink` etc | 7 sites — biggest cluster in a single component |
| `WeeklyNarrativeTile.tsx:74,83` | `hover:bg-line-soft hover:text-ink` | + `active:bg-line-soft/70` |
| `HeaderQuickLinks.tsx:73,95` | `hover:bg-surface-2` | + `active:bg-surface-2/70` |
| `ProposalCard.tsx:240,247` | `hover:bg-bronze-hover` / `hover:bg-line-soft` | `active:` twin (pulse-accept already covers Accept — Ignore needs `active:`) |
| `CitationRef.tsx:44,69` | `hover:text-strong` / `hover:text-bronze-hover` | + `active:` twin |
| `SignalsStrip.tsx:229` | `hover:opacity-80` on the underline | + `active:opacity-70` |
| `EmptyStateCard.tsx:33` | `hover:bg-bronze-hover` | + `active:bg-bronze-active` |
| `ConfirmSheet.tsx:79,89,101,102` | 4 sites | + `active:` twins |
| `ExerciseDetailsSheet.tsx:69` | `hover:text-ink` on close | + `active:bg-line-soft` |
| `programs/[slug]/ProgramPreviewClient.tsx` | multiple card `hover:border-bronze/40` | biggest visual "webpage" tell — add `active:border-bronze/60` |

Practical one-PR fix (recommended over per-site edits): add the `@media (hover: none)` reset block in §2.1. Then `active:scale(0.98)` (already global) plus a per-component `active:` variant on the ~15 highest-traffic sites above cleans up the perception.

---

## 7. iOS-specific gotchas

- **100vh trap:** clean. `grep -rn "min-h-screen\|h-screen"` returns nothing in `src/`. All routes using viewport-height math (`coach/page.tsx:249,286`, `IntakeClient.tsx:712`) use `100dvh`. Verified. M1 truly done.
- **PWA standalone top-inset:** `AppShell.tsx:117` sets `paddingTop: env(safe-area-inset-top)` on `<header>`. Correct for standalone. `layout.tsx:29-33` declares `apple-mobile-web-app-capable` + `black-translucent`. Under status-bar overlay, the header still shows below the notch. Verified.
- **Pull-to-refresh on Today:** `overscroll-behavior-y: none` on `html, body` (`globals.css:57`). Kills the PTR gesture globally. Correct for a stateful app — user's scroll position at the top of Today doesn't accidentally reload. Verified.
- **Sentry User Feedback widget:** if the DSN is set, the SDK injects a floating trigger. Verify z-index against ConfirmSheet (`z-50`) — Sentry's default is `z-index: 99999`. Should sit above modals, which is what the widget wants. No action needed unless a modal explicitly blocks the widget.
- **Google OAuth "Continue with Google":** button is `min-h-[44px]` full-width (`GoogleAuthButton.tsx:59-70`). Correct.
- **Viewport meta:** `viewport.tsx` sets `viewportFit: "cover"` and NO `maximumScale`/`userScalable` lock (comment on `layout.tsx:51-56` explicitly preserves pinch-zoom for WCAG 1.4.4). Correct.
- **iOS soft keyboard on intake:** sticky footer `IntakeClient.tsx:1396` uses `sticky bottom-0` not `fixed` — rides `visualViewport` correctly. M9-adjacent fix from 2026-08-18 audit. Verified.
- **RunSlotCard conditional-field render on activity change:** the `showDistance` block (`RunSlotCard.tsx:355-416`) recomputes on every activity switch. Confirmed: distance is hidden for `row`, `ski_erg`, `crossfit_class`, `other`; duration hidden for `row`, `ski_erg`. Matches the founder note. On mobile this means the form shrinks/grows in-place — verify no layout thrash when the parent card auto-scrolls; the sheet-less inline expansion is fine on iOS.

---

## 8. Priorities

**P0 (blocking beta polish — fix this week):**
- 2.3 RunSlotCard "Log session" / "Import GPX" text-only links → `min-h-[44px] py-2`. `RunSlotCard.tsx:578-593`. This is the only extras entry point on 4/5 program surfaces.
- 2.2 subset: promote the two adjacent-target IconButton clusters on Today's ubiquitous WeeklyNarrativeTile (`w-9 h-9` prev/next arrows, `WeeklyNarrativeTile.tsx:74,83`) → `w-11 h-11`. Same tile ships on Progress.
- 6 minimal patch: add the `@media (hover: none) { .hover\:... { unset } }` block in `globals.css`. One CSS block, kills iOS sticky-hover across all 174 sites at once.

**P1 (do before public launch):**
- 2.2 remaining: YourPlanCard dismiss `w-8 h-8` → `w-11 h-11` (`YourPlanCard.tsx:84`); RunSlotCard remove-run X `w-8 h-8` → `w-9 h-9` minimum, ideally `w-10 h-10` (`RunSlotCard.tsx:299-306`); MissedSessionPrompt dismiss + HeaderQuickLinks trigger → `w-11 h-11`.
- 2.4 subset: RunSlotCard activity/intensity/session-type pills 36→44 (`RunSlotCard.tsx:323,461,487`). This is the log-form path; 44 is right here even though 36 passes WCAG.
- 5 Heatmap: add `active:ring-1 active:ring-slate/60` on `Heatmap.tsx:163` for touch press feedback.
- 6 systemic: add `active:` twins on the top 15 high-traffic hover sites listed in §6, not just the CSS reset.

**P2 (nice to have, post-beta):**
- 2.2 whole class of 32-40px targets on secondary chrome (bottom of §2.2 list) — WCAG 2.5.8 passes at 24; these are aesthetic upgrades to Apple 44.
- M5 modal z-index registry: normalize to a `z-modal-{1,2,3}` scale in `@theme` block to prevent the OnboardingRunner-vs-IntroGallery class of bug recurring with future modals. Not critical while modal count stays ≤ 8.
- 3 /check "Shoulder / upper body" wrap at SE — tighten grid to `1fr_44px gap-2`.
- Heatmap cells 32→44 at 8-week × 44px alt for mobile. Founder call — visual density trade.

**Explicit non-issues (verified, do not touch):**
- BottomNav sizing, safe-area, keyboard hide, route indication.
- `AppShell.tsx` main paddingBottom calc + safe-area top.
- SetRow numeric inputs — 44px, `inputMode` correct on all 4 (`weight_kg` decimal, `reps` numeric, `rpe` decimal, note textarea 44px min).
- ProposalCard Accept/Ignore — 44px, single dismiss affordance, pulse-accept feedback.
- ConfirmSheet — 44px both buttons, safe-area on parent, focus-trap upstream.
- OnboardingRunner — items-start on mobile, z-[60] wins, focus trap present.
- Intake wizard sticky footer — 44px buttons, safe-area, sticky-not-fixed, rides visualViewport.
- Coach page — dvh not vh, textarea 48px, send/stop 44px, keyboard-hide covers.
- 100vh/dvh — all migrated.
- `overscroll-behavior-y: none` — PTR safely killed.
- `-webkit-tap-highlight-color: transparent` + `active:scale(0.98)` global — good baseline.
- Google OAuth button — 44px, Continue-with-Google copy, official G glyph.
- pinch-zoom preserved (no maximumScale lock).

---

## Coda

The bones are right. The remaining friction is 15-20 class-string edits, one CSS `@media (hover: none)` block, and swapping two `w-9 h-9` clusters on the tile that ships to two routes. Estimated 90 minutes end-to-end for P0 + P1 batch. The founder's "looks bit rusty" instinct is probably the touch-press-feedback gap (§2.1 / §6) more than any single sizing miss — that's the one that reads "webpage" instead of "native." Fix that class of thing first.
