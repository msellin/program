# Terav app — Mobile UX audit (Batch 25, post-S1 kill)

Personas primary: `persona-recover`, `persona-strength`, `persona-erratic`
Personas supplementary: `persona-graduate` (GraduationCard live), `persona-multitrack` (Week 3-verb grid under load), `persona-handstand-fast` (Extend flow)
Artifacts: `next-app/tests/e2e/artifacts/personas/*/mobile/` refreshed 2026-08-19 16:04–16:05
Viewport basis: 393×852 primary, 375×667 SE cross-check
Focus: MoveSheet, Week expanded 3-verb grid, /account IA, GraduationCard 4-verb stack, RetestReminder card, FirstRunBanner

Competitor peers touched: Runna (weekly move), Whoop (adaptive-coach card), Pliability (spacious card), Hevy (row-log density). Findings are cited as IDEAS, not action items.

---

## 1. Overall verdict

Batch 22–25 has quietly turned the app into a well-behaved mobile citizen. The new interaction surfaces — MoveSheet, ConfirmSheet, the /account route, the Week expanded action grid, and the GraduationCard 4-verb vertical stack — all cleanly respect Apple 44 pt, all commit through explicit primaries, and every sheet locks body scroll and pads for `safe-area-inset-bottom`. The one live P0 that survived the batch is unrelated to the new work: on `persona-graduate:/` and `persona-recover:/` the ProposalStack CTA row ("Advance to cycle 1 — first real 5/3/1 FSL" / "Apply bump") is rendered flush behind the fixed BottomNav — the two most consequential taps in the app are covered by chrome. Everything else is P1 polish. What's done right: the MoveSheet's confirm-first "tap Move session again to stack" pattern is genuinely novel, has excellent touch ergonomics, and is friendlier than Runna's equivalent drag-to-reschedule. Ship it.

---

## 2. Systemic issues (≥2 personas)

### 2.1 ProposalStack CTA sits behind the fixed BottomNav

- **Where:** `persona-graduate:/`, `persona-recover:/`, `persona-strength:/` — `next-app/src/app/page.tsx` (ProposalStack region, referenced at `page.tsx:251`), `next-app/src/components/AppShell.tsx:150` sets `paddingBottom: calc(64px + env(safe-area-inset-bottom) + 1rem)` but the ProposalStack's Apply/Ignore row scrolls under the fixed nav in the current state.
- **Ergonomic law violated:** Fitts (destination is literally unreachable), Hoober primary-zone (the most-tapped verbs in the entire app are behind chrome), Apple HIG § "Layout" (never overlap tap-critical UI with system UI).
- **What:** In `persona-graduate:/mobile/01-today.png` the "APPLY BUMP" / "IGNORE" pair sits at ~y=740 with the fixed nav at ~y=798–848. The buttons are 52px tall — the top ~10px pokes above the nav; the bottom 42px is under the nav's translucent surface. On persona-recover it's identical. On persona-strength the proposal itself is scrolled higher, but the same failure mode is one thumb-flick away.
- **Fix:** Two options. (a) Cheapest: bump the `<main>` `paddingBottom` in `AppShell.tsx:150` from `calc(64px + env(safe-area-inset-bottom) + 1rem)` to `calc(64px + env(safe-area-inset-bottom) + 5rem)` — Today's ProposalStack already keeps itself at the natural document bottom on graduate, so 5rem of clearance parks the whole CTA row inside the primary zone. (b) Cleaner: make the ProposalStack itself sticky-bottom-72px (i.e. anchor it above the nav, Whoop-style) so it's always in the primary zone regardless of scroll depth. I recommend (b) — the accept/ignore decision is the app's core loop and Wroblewski would put it exactly where the thumb rests.

### 2.2 Report page ships desktop layout at 393px

- **Where:** `persona-strength:/report`, `persona-erratic:/report`, `persona-graduate:/report` — `next-app/src/app/report/page.tsx` (whole file).
- **Ergonomic law violated:** Viewport / touch target minima (WCAG 2.5.8, Apple 44 pt).
- **What:** All three report screenshots render a page zoomed to ~40% — content overflow forces the viewport to zoom out so a 3-column stat grid fits. Tap targets in the range selector row (`4w` / `12w` / `26w` / `all`) are ~24px on the rendered display. On `persona-erratic:/mobile/10-report.png` you can literally read the section headings only because the whole page has been shrunk. This is the same page that was flagged in the 2026-08-19 mobile-UX audit and it did not get remediated in Batch 22–25.
- **Fix:** Report page needs a mobile-first pass. Minimum: verify `<meta name="viewport" content="width=device-width">` is asserted (yes, it's in `layout.tsx`), and hunt for the offending fixed-width table or the `overflow-x-auto` sibling at `report/page.tsx:577` that pushes container width. Recommend: gate the desktop layout on `sm:` and ship a compact stacked layout below.

### 2.3 Underline-only Undo control on /account misses Apple 44 pt

- **Where:** `persona-handstand-fast:/account`, `persona-mobility:/account`, any persona with an active `extension_weeks` — `next-app/src/app/account/page.tsx:187-194`.
- **Ergonomic law violated:** Apple 44 pt / WCAG 2.5.5 (Target Size Enhanced, 44 CSS px).
- **What:** The "Undo" action inside the Extensions row is styled as a text-underline link (`text-[11px]` + `underline decoration-line`). No `min-h-[44px]`, no explicit width — the hit rect is roughly the rendered text bounds (~55×16 px). Adjacent to a row that itself has `min-h-[48px]` so the tap target intrudes on the row's tap area. A user going to undo an accidental extension is not doing so with intent to be careful.
- **Fix:** Wrap the Undo affordance in an explicit tap rect. Cheapest: add `min-h-[44px] px-2 -mr-2` (negative margin to visually keep the trailing edge flush). Better: promote to an icon+label button `inline-flex items-center gap-1.5 min-h-[44px] px-3 -mr-3 rounded text-[11px] uppercase tracking-wider font-mono text-muted hover:text-ink focus-visible:text-ink active:bg-line-soft/50` — matches the visual weight of Week's action-grid buttons.

### 2.4 Overflow menu (⋮) trigger sits in the "ouch" zone

- **Where:** every persona × every route — `next-app/src/components/nav/HeaderQuickLinks.tsx:75`.
- **Ergonomic law violated:** Hoober zone (top-right corner is the hardest reach in the phone).
- **What:** The overflow menu holds Extras, Events, Report, Guide, Evidence — collectively the destinations a user visits mid-session on an amber day, mid-week when planning extras, or on a follow-up appointment day for the Report. Its trigger is a 44×44 tap zone at approximately (368, 46), which is the exact ouch-zone corner from the Hoober reachability heat maps for a right-thumb cradle grip. On 375×667 SE it's even worse — the corner shifts inward but the thumb has to stretch further because the base of the thumb is lower on shorter phones.
- **Fix:** This is a Batch 24+ IA decision, not a class-level tweak. Two paths worth exploring: (a) promote Report to bottom-nav slot (kills Coach's ghost slot cleanly; matches Whoop's "score" slot semantics — a specialist-ready view is the app's non-log endpoint); (b) surface Extras from an in-flow chip on Today rather than the corner (Pliability convention — inline "more from your day" list, not a hamburger). Flagging for design-lead review, not for silent fix.

### 2.5 GraduationCard "End this program" underline link fails the same rule

- **Where:** `persona-graduate:/` — `next-app/src/app/page.tsx:941-947`.
- **Ergonomic law violated:** Apple 44 pt.
- **What:** Rendered as a `text-[12px]` underlined text button with no `min-h`. Hit rect ~50×16 px. This is a rare-frequency destructive action so density argues against a big button, but the current rendering also invites accidental fat-finger taps into a red state (the ConfirmSheet catches it, but a P1 fix is cheap).
- **Fix:** `inline-flex items-center min-h-[44px] px-2 -mx-2 py-2 rounded text-[12px] text-muted underline decoration-muted/40 hover:text-red hover:decoration-red focus-visible:text-red active:bg-red/5`. Same hit-slop pattern as MoveSheet's close-X.

---

## 3. Per-persona findings

### persona-recover

| Route | Zone/Rule | Severity | Finding | Fix |
|-------|-----------|----------|---------|-----|
| /  | Fitts / primary zone | **P0** | Apply-bump / Ignore CTA row buried under BottomNav (see §2.1). Two consequential verbs sit in the covered zone. | Sticky ProposalStack above nav (72px offset) or bump `AppShell.tsx:150` main pb. |
| /check | Sticky Save | ✓ | Save-check button correctly sticky-above-BottomNav via `sticky … bottom: calc(60px + env(safe-area-inset-bottom))` (`check/page.tsx:187-190`). Verified in mobile/13-check.png — button visible at ~y=757, nav at ~y=800. | None. |
| /check | Symptom sliders | P2 | Slider thumbs render at the OS-default (~20-24px) — smaller than Apple 44 on a 393px viewport. iOS native does supply 44pt tap slop internally so this is only marginally sub-standard; Material sizes range thumbs at 40-48px so Android users are fine. | Consider a `[&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6` bump; hit slop is more critical than thumb visual. |
| /check | Custom slider "0" label | P2 | The right-side numeric readout ("0") sits at ~x=356, y=238 on mobile/13-check.png. Not interactive but visually placed where users may attempt a tap. | Either style as clearly non-interactive (`text-muted italic tabular-nums`) or convert to a numeric-input for tap-to-edit — matches Runna's pace-picker convention. |
| /programs | Program cards | P1 | mobile/06-programs.png shows the page rendered at ~50% scale (whole page fits above the fold on 852px, which is impossible with ~10 cards at real-mobile sizes). Same forced-shrink issue as Report §2.2, less severe. | Investigate: the header intro block may be overflowing horizontally on 393px. |

### persona-strength

| Route | Zone/Rule | Severity | Finding | Fix |
|-------|-----------|----------|---------|-----|
| /week | ChevronDown affordance | P1 | On Week rows the collapse-indicator chevron sits at right, with the day-header label as the outer tap target. Tap target is the whole row so ergonomics are fine, but the chevron itself has no hit-slop indication — a user tapping the chevron doesn't get a pressed state. | Add `active:text-ink` to the chevron classes at `week/page.tsx:505-512` OR make the chevron sibling absent from the button and use CSS `[aria-expanded=true]` rotation on the parent-controlled sibling. |
| /week | Expanded 3-verb grid | ✓ | `grid grid-cols-3 gap-2` with each verb at `min-h-[44px] px-3 py-2` (`week/page.tsx:666-701`). All three verbs comfortably hit 44 pt. Grid gap 8px meets adjacent-target spacing. On 393px viewport, main is `max-w-[760px] mx-auto w-full px-4` so each verb cell is (393-32-16)/3 = 115 px wide × 44 tall. Fine for cradle thumb. | None. |
| /week | Move / Skip disabled states | P2 | `disabled:opacity-40 disabled:cursor-not-allowed` — visual disable is fine but there's no aria-disabled announcement pattern, and disabled + still-a-button is a known iOS VoiceOver confusion. Flag but out of scope: → see app-accessibility. | — |
| / | ProposalStack | P0 | Same §2.1. On strength persona the "Apply bump" primary is the most-tapped verb; hiding it under nav chrome is a first-order failure. | See §2.1. |
| /report | Viewport zoom | P0 | mobile/10-report.png renders at ~40% scale, page contents pinch to fit. Table sections like "Weekly aerobic volume" push viewport width. | See §2.2. |
| /profile | Identity chip | ✓ | Chip `w-full … min-h-[48px] py-3 px-4` with clear affordance chevron and 44+ tap rect. Deep-links to /account correctly. Verified. | None. |

### persona-erratic

| Route | Zone/Rule | Severity | Finding | Fix |
|-------|-----------|----------|---------|-----|
| /history | Heatmap cell tap | P1 | mobile/04-history.png shows 6×8 heatmap grid at ~40×40 px per cell. Under Apple 44 pt. Cell doesn't currently link anywhere so it's cosmetic, but if these become tappable ("go to that day") they need `min-w-[44px] min-h-[44px]` with 4-8px gap. | Enforce sizing in `Heatmap.tsx:150` container children. |
| /history | Empty-cell states | P2 | Empty (no-data) cells render as the same muted stroke as skipped cells. Erratic persona has ~50% empty cells; ambiguity between "no session prescribed" and "session prescribed but not logged" is meaningful. | Two visual tokens: light-stroke = no session; dashed = missed. Flag to app-visual-craft. |
| /report | Data density on wide tables | P0 | Same forced-zoom as §2.2. Compounds on erratic because tables have more sparse rows. | See §2.2. |
| /check | Save above nav | ✓ | Same verified sticky-Save behavior. | None. |
| / (Today) | Empty program CTA | ✓ | Rest / empty-program cards render with 44+ CTA buttons. Verified against handstand & mobility personas. | None. |

### persona-graduate (supplementary — GraduationCard live surface)

| Route | Zone/Rule | Severity | Finding | Fix |
|-------|-----------|----------|---------|-----|
| / | 4-verb stack readability | ✓ | mobile/01-today.png shows the 4-verb vertical stack clearly reads as **buttons**, not text — bronze fill on primary ("Repeat this arc"), bordered rows on secondary, all with the mono label + supporting caption. Hierarchy is unambiguous. **Better than the prior horizontal chip row** for the same reason Runna's "reschedule week" is a verb stack, not chips. | None. |
| / | 4-verb stack tap ergonomics | ✓ | Each VerbRow at `min-h-[52px] px-3 py-2.5` (`page.tsx:715/716`). 52 px vertical exceeds Apple 44 and Material 48. `w-full` so tap width = viewport minus 32 px padding = 361 px. Fitts distance from cradle-right-thumb origin (x=195, y=790) to primary at approximately (196, 610) is ~180 px — very short, matches Hoober's primary-zone sweet spot. | None. |
| / | "End this program" | P1 | See §2.5. Underline text link, sub-44 hit rect. | See §2.5. |
| / | "How was this arc?" 1-5 rating buttons | P1 | `w-9 h-9` = 36×36 px. Under Apple 44 pt. Adjacent gap `gap-2` = 8 px which is the bare minimum. On mobile/01-today.png at 852px viewport with the sticky bottom nav, the rating buttons render at y=~900 which is under the nav's overlap on scroll. | Bump to `w-11 h-11` (44 px) and re-verify visual density; 44×44 with 8-px gap uses 260 px of the 361 px available — comfortable. Alternatively convert to a segmented star-scale (single row of 5 stars with the whole row a 44-px slider) as Pliability uses for its post-session rating. |
| /account | Back-chevron reach | P2 | The "‹ Profile" back button at (page.tsx:94-102) has no `min-h-[44px]` — it's inline text `text-[13px]` with a 14-px chevron. Hit rect ~65×18 px. Users landing on /account via the Profile deep-link chevron are unlikely to want to go back the same way (they'll use BottomNav), but the affordance itself fails Apple 44. | `inline-flex items-center gap-1 text-[13px] text-slate hover:text-ink min-h-[44px] px-2 -ml-2 py-2 active:text-ink focus-visible:text-ink`. |
| /account | Rows | ✓ | Sign-in / Primary-program / Extensions / Data-and-privacy rows all use `min-h-[48px] px-4 py-3` and stack in a `divide-y` list. Trailing ChevronRight readable, clean IA. **Cleanest new surface in the batch.** | None. |
| / | RetestReminder card | ✓ | Only fires on Monday (Batch 24 hand-off), when it does the primary "Log retest →" is `min-h-[44px] px-3 py-2 bg-bronze` and the "Not this week" dismiss is `min-h-[44px] px-3 py-2 border border-line`. Both above nav-fold if user hasn't scrolled. Flex-wrap so on narrow SE the buttons stack. | None. |

### persona-multitrack (Week 3-verb under multi-program load)

| Route | Zone/Rule | Severity | Finding | Fix |
|-------|-----------|----------|---------|-----|
| /week | Multi-dot per-day row | ✓ | Per-program dots at `w-2 h-2 rounded-full` with `gap-0.5`. Non-interactive so 8-px marks are acceptable — they read as chart tokens, not tap targets. SR-only summary at `week/page.tsx:460` covers a11y. | None. |
| /week | "×N programs" chip | P2 | The "2 tracks" badge is `text-[10px]` uppercase — below the visual-craft type floor of 11 px. Cross-audit: → see app-visual-craft. | — |

---

## 4. Sticky bottom nav — deep dive

- File: `next-app/src/components/nav/BottomNav.tsx:37-45`
- Safe-area handling: **Correct.** `pb-[env(safe-area-inset-bottom)]` on the `<nav>` plus `paddingLeft/Right: env(safe-area-inset-left/right)` for iPhone Pro rounded corners. Home-indicator zone respected — the ~34px inset zone is padding, not tap surface.
- Behavior with iOS keyboard on log form: **Correct and clever.** `useKeyboardOpen()` uses `visualViewport.height` delta > 100 px to detect iOS keyboard and unmounts the nav entirely (`return null`). Threshold explicitly chosen so URL-bar shrinks (~50-60px) don't false-trigger. This is the cleanest solution to the "sticky nav rides up over input" problem I've reviewed — better than the CSS-only `env(keyboard-inset-height)` approach because it survives older iOS. `persona-recover:/check` verified — no nav overlap when the "Outside training yesterday" textarea is focused.
- Route indication clarity: **Correct.** 3-px bronze top-border on active tab (`BottomNav.tsx:56-61`) plus font weight bump (`strokeWidth: 2.25` vs `1.75`) — passes WCAG 1.4.1 (color-alone signal fail avoided). On all persona:/profile screenshots the "PROFILE" tab is unmistakable at a glance.
- Bottom-padding on scrollable content: **Almost right.** `AppShell.tsx:150` sets `paddingBottom: calc(64px + env(safe-area-inset-bottom) + 1rem)`. The nav's actual height is 52 px min (`min-h-[52px]`) + 32 px vertical padding = ~64 px, so the pad matches nav height with a 16 px cushion. **However** this cushion is not enough for the ProposalStack CTA row on Today — see §2.1. Recommend making the cushion 80-96 px (`5rem`) OR making the ProposalStack itself sticky-above-nav.

---

## 5. MoveSheet — deep dive (Batch 24 new)

- File: `next-app/src/components/workout/MoveSheet.tsx`
- Sheet chrome:
  - Bottom-sheet on mobile, centered modal on `sm:` (`MoveSheet.tsx:109`) — matches Apple bottom-sheet pattern.
  - `max-h-[85vh]` clamps sheet height so the OS chrome (status bar) never gets covered on 667px SE. Verified in code.
  - `paddingBottom: env(safe-area-inset-bottom)` on the panel (line 115) — home-indicator clear.
  - `document.body.style.overflow = 'hidden'` on open (line 75) — kills iOS Safari rubber-band behind sheet.
- Scrollability: **Correct.** `flex-1 overflow-y-auto` on the middle list region (line 136). Header sticks at the top of the sheet, primary sticks at the bottom of the sheet. This is textbook.
- Tap targets:
  - Day radio rows: `flex items-center gap-3 px-3 py-3 min-h-[48px]` (line 232-233) — passes Material 48, Apple 44.
  - Close X: `w-11 h-11` — 44 px, Apple minimum.
  - Radio input itself is `w-4 h-4` (16 px) but the whole `<label>` is the tap target so the radio's visual size is decorative — correct pattern.
  - Reason textarea: `min-h-[44px]` explicit — good.
  - Primary "Move session" button: `w-full … min-h-[44px]` — full-width primary in the safe-area-padded footer. **Excellent Fitts geometry.**
- Above safe-area: **Correct.** The primary is inside a `p-3 border-t` footer whose parent has `paddingBottom: env(safe-area-inset-bottom)`. The button won't hide under the home indicator.
- Novel confirm-first stack pattern (`needsSecondTap`): The sheet does not commit on radio pick. If the target already has a session, the first tap of "Move session" flips the label to "Confirm — stack the session" and the second tap commits (line 92-101). This is friendlier than Runna's "drag to reschedule" — no accidental commits on scroll, matches Terav's confirm-first ethos, and the amber warning-strip above the button (line 161) makes the state unambiguous.
- Peer comparison (IDEA not action):
  - **Runna** uses drag-and-drop to move a workout between weekly days — feels magical on a fast connection but produces motion-sickness and mis-drops on smaller phones and requires undo. Terav's radio-list is deliberately less magical, more predictable. **Keep.**
  - **Whoop** uses a similar bottom sheet for "reschedule recovery activity" but has fewer options and no stack-warning. Terav's stack-warning is a strict improvement.

**Verdict:** MoveSheet is the strongest new interaction surface in the batch. Zero P0/P1 findings. Ship as-is.

---

## 6. GraduationCard 4-verb stack — deep dive (Batch 23 new)

- File: `next-app/src/app/page.tsx:894-939` (verb list), `page.tsx:696-739` (VerbRow component)
- Read as: **taps, not text.** Each VerbRow is a `<button>` (or `<Link>`) with:
  - Bronze fill for primary, surface + line-soft border for secondary — visual button affordance immediately recognizable.
  - Mono uppercase 11px label + 12px muted caption on two lines — reads as a "labelled button with subtitle," the exact Whoop/Runna pattern for adaptive-coach cards.
  - `w-full text-left rounded … px-3 py-2.5 min-h-[52px]` — same size class across all four rows so visual rhythm is uniform.
- Thumb reach: On 852px viewport with card at y ~= 580, primary button center is at approximately (196, 605), secondary rows step down at +60 px intervals. Cradle-right-thumb origin (195, 790) → primary is 185 px away, well within the primary-zone envelope. The "Pick your next focus →" card at the bottom is at ~y=730, still primary-zone but flirting with the nav overlap zone on a scroll — worth verifying interactively.
- Verbs read cleanly:
  - "Repeat this arc" — primary bronze, mono "REPEAT THIS ARC" + "Restart · keep intake + baselines" (`page.tsx:896-905`)
  - "Extend +4 weeks" — secondary, mono "EXTEND +4 WEEKS" + "Push the retest date · keep the arc going"
  - "Take a break" — secondary, "TAKE A BREAK" + "Pauses Today · stays in your programs list"
  - "Pick your next focus →" — secondary Link to /programs with next-block preview language
- Peer comparison (IDEA): This is closer to Ladder's "next-cycle picker" — coached-strength apps universally use verb stacks post-arc, chip rows post-workout. Terav has picked the right density for the frequency.

**Verdict:** The 4-verb stack is a clear upgrade over the prior chip row (referenced at `page.tsx:889-893` comment). Zero P0/P1 findings on the stack itself. The only P1 nearby is the "End this program" underline link (§2.5).

---

## 7. /account IA — deep dive (Batch 23 new)

- File: `next-app/src/app/account/page.tsx`
- Back-chevron reach: **P2 fail** (see §2.3 in persona table). Text-inline back link, sub-44 hit rect.
- Section pattern: Every row is `w-full flex items-center justify-between gap-3 px-4 py-3 min-h-[48px]` with a trailing `<ChevronRight size={16}>` when tap-through. Passes Apple 44 with margin. Divide-y between rows in each card gives clear row separation without over-drawing borders.
- Extensions row (F1 new): Correct min-height on the row, **P1 fail on the Undo affordance** (§2.3).
- Delete flow: Delete button uses `text-red` for the label and `text-red/60` for the chevron — visual danger cue is legible. `ConfirmSheet` with `danger` prop wraps the actual delete call. Two-step commit for a destructive action, correct.
- Legal footer: Privacy / Terms / Medical disclaimer are all `inline-flex items-center min-h-[44px] py-2` — 44-safe. Dot-separators are `aria-hidden`. Good.
- Primary-picker inline sheet (multi-program only): Bottom-sheet at `items-end`, correct min-heights on rows, cancel-outside-tap handled. Fine.

**Verdict:** /account is the cleanest new route in the batch. One P2 (back-chevron), one P1 (Extensions Undo). Everything else is textbook.

---

## 8. RetestReminder card — deep dive (Batch 24 new)

- File: `next-app/src/app/page.tsx:1122-1230`
- Fires only Monday of a cadence-hit week (line 1146-1167). Correctly rate-limited.
- CTAs: Primary "Log retest →" (`min-h-[44px] px-3 py-2 bg-bronze`) + "Not this week" dismiss (`min-h-[44px] px-3 py-2 border`). Both 44-safe.
- `flex-wrap gap-2` at line 1213 — on narrow SE 375 the two buttons stack vertically instead of clipping. Correct.
- ISO-week-key dismiss: Cleaner than a single-tap "dismiss forever" because the reminder returns next Monday if the user did skip. Matches Whoop's "you missed your recovery reading" re-fire behavior.
- Position: Rendered in Today's normal flow, not sticky. Would benefit slightly from `-ml-4 -mr-4 px-4` full-bleed treatment to signal "system message" not "content" — but that's app-visual-craft territory, out of scope.

**Verdict:** Ship as-is.

---

## 9. FirstRunBanner — deep dive (Batch 23 new)

- File: `next-app/src/components/FirstRunBanner.tsx`
- CTA "Got it — start the day" at `min-h-[44px] px-3 py-2 rounded bg-bronze` — passes Apple 44.
- Close X at `w-10 h-10 -m-2` — 40 px with -8px negative margin. The negative margin visually tucks the X against the corner while keeping the tap rect intact. This is the "hit-slop trick" from Josh Clark's tapworthy — good pattern. Technically 40×40 is below the 44 Apple minimum but the `-m-2` extends the tap rect via the outer padding — verify: the parent is `flex items-start justify-between gap-3` with no bounding overflow-clip, so the negative margin only shifts visual position, not the button's tap surface. **Bump to `w-11 h-11 -m-2.5`** to hit true 44.
- Gates cleanly on `hydrated && !logsCount && !tmCount && !dismissed` — no flash on repeat visits.
- Peer comparison (IDEA): Pliability's onboarding uses a full-screen carousel first-run. Terav's inline hero card is dramatically friendlier — fewer taps to skip, respects an established user with a fresh device sync.

**Verdict:** One P2 (Close-X 40 vs 44). Otherwise clean.

---

## 10. iOS-specific gotchas

- **100vh occurrences**: `grep -rn 'min-h-screen\|h-screen' next-app/src` returns **zero hits**. Not previously flagged; **still zero after Batch 25**. Good.
- **PWA standalone top inset**: `AppShell.tsx:117` uses `paddingTop: env(safe-area-inset-top)` on the header — dynamic island / notch respected. Confirmed.
- **Pull-to-refresh on Today**: Not observably blocked. On iOS Safari PWA in-standalone this rarely fires accidentally because the top of Today is the header, not the scroll edge. Not urgent.
- **Body-scroll lock on modals**: MoveSheet (line 74-79), ConfirmSheet (line 47-62) both set `document.body.style.overflow = 'hidden'` on open. Prevents iOS rubber-band-behind-sheet. Correct.
- **Fixed-position jump on scroll**: BottomNav is `fixed left-0 right-0 bottom-0` — the classic iOS Safari jump pattern. In practice the visualViewport listener also stabilizes this because keyboard events remount the nav cleanly. No visible jump in the persona artifacts.

---

## 11. Hover-on-touch traps (new components only)

| File | Class | Fix |
|------|-------|-----|
| `next-app/src/components/workout/MoveSheet.tsx:129` | `hover:text-ink` on close-X, no focus/active twin | add `focus-visible:text-ink active:text-ink` |
| `next-app/src/components/workout/MoveSheet.tsx:193` | `hover:bg-bronze-hover` on primary, no active | add `active:bg-bronze-active focus-visible:ring-2 focus-visible:ring-bronze` |
| `next-app/src/components/FirstRunBanner.tsx:57` | `hover:text-ink` on close-X | add `focus-visible:text-ink active:text-ink` |
| `next-app/src/components/FirstRunBanner.tsx:76` | `hover:bg-bronze-hover` on CTA | add `active:bg-bronze-active focus-visible:ring-2 focus-visible:ring-bronze` |
| `next-app/src/app/account/page.tsx:97` | Back-chevron `hover:text-ink` | add `focus-visible:text-ink active:text-ink` + `min-h-[44px] px-2 -ml-2` (see §2.3) |
| `next-app/src/app/account/page.tsx:190` | Undo `hover:text-ink hover:decoration-ink` | add `focus-visible:text-ink active:bg-line-soft/50` + size fix per §2.3 |
| `next-app/src/app/account/page.tsx:245/252/259` | Legal-footer links `hover:text-ink` | add `focus-visible:text-ink active:text-ink` |
| `next-app/src/app/week/page.tsx:222/243` | Prev/Next week arrows `hover:bg-surface-2 hover:text-ink` | add `focus-visible:bg-surface-2 active:bg-surface-2` |
| `next-app/src/app/week/page.tsx:670/677/690/697` | 3-verb grid buttons `hover:bg-line-soft` / `hover:bg-bronze-hover` | add matching `active:` + `focus-visible:` states |
| `next-app/src/app/page.tsx:944` | "End this program" `hover:text-red hover:decoration-red` | add `focus-visible:text-red active:bg-red/5` |

None of these are P0 — but each one lets iOS's sticky-hover state persist after tap, giving a hovering-blob visual after every touch until the user taps elsewhere.

---

## 12. Priorities

**P0 (blocking):**
1. **ProposalStack CTA hidden by BottomNav** (§2.1) — the app's core Accept/Ignore loop is behind chrome. Sticky-above-nav pattern or 5rem cushion. Verified on `persona-recover:/`, `persona-graduate:/`, `persona-strength:/`.
2. **Report page renders as forced-zoom desktop layout** (§2.2) — same failure as prior audit, not remediated. Sub-24px tap targets on the range presets, unreadable tables. All three primary personas affected.

**P1 (do this month):**
1. Bump Extensions Undo affordance to 44+ tap rect with a proper active-state visual (§2.3).
2. Bump "End this program" underline link to 44+ tap rect (§2.5).
3. Bump GraduationCard 1-5 rating buttons from `w-9 h-9` to `w-11 h-11` and re-verify visual density.
4. Add `active:` and `focus-visible:` twins for every new `hover:`-only class in §11.
5. Bump FirstRunBanner Close-X from `w-10 h-10` to `w-11 h-11 -m-2.5`.
6. Consider promoting Report out of the ⋮ overflow menu (§2.4) — this is IA, not a class fix.

**P2 (nice to have):**
1. /account back-chevron min-h-44 (§2.3 P2 line).
2. Enhance heatmap cells to explicit 44×44 if they become tappable.
3. Symptom-slider thumb visual bump to 24px (native iOS supplies 44 hit slop internally).
4. Add `stateChange` announcement on Week's disabled Move/Skip buttons for SR users (→ see app-accessibility).

---

## 13. What Batch 22–25 did right

For the record, since audits tend to enumerate failures: MoveSheet is a strong ship. Its confirm-first stack pattern is a novel improvement on Runna's drag-to-move. The /account route is the cleanest new IA surface in the codebase — Krug-clean, correctly-sized rows, correct destructive gating. GraduationCard's 4-verb stack read the room correctly (rare-frequency decision, density < clarity) and is a strict improvement over the prior chip row. RetestReminder's Monday hand-off is coach-like without being naggy. The BottomNav's `visualViewport.height`-based keyboard detection is quietly one of the best implementations of this pattern in any PWA I've reviewed — it survives the failure modes that trip up CSS-only `keyboard-inset-height`.

The pattern I want to name: every new interaction surface in this batch adopts the same shape — bottom-sheet on mobile, centered on `sm:`, body-scroll lock, `paddingBottom: env(safe-area-inset-bottom)`, sticky primary at the bottom of the sheet. That consistency across MoveSheet / ConfirmSheet / /account primary picker means iOS users are learning one interaction grammar, not five. Ship it.
