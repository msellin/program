# Terav app — Mobile UX audit (thumb reach, tap targets, safe area)

Personas: `persona-recover`, `persona-strength`, `persona-erratic`
Artifacts: `next-app/tests/e2e/artifacts/personas/*/mobile/`
Viewport basis: 393×852 primary, 375×667 SE cross-check
Post-batch: Batch 16 deployed `https://4df8a948.program-v2.pages.dev`
Framing: findings are IDEAS, not action items. Terav's confirm-first engine may deliberately reject peer patterns.

Note on artifacts: the persona screenshots in `mobile/` were captured Aug 19 11:30, ~1 h before the Batch 16 source changes (`week/page.tsx` mtime 12:43). Every screenshot in the persona-strength / persona-recover Week view therefore still shows the "PROGRAMS" pill in the top-right, and Profile still shows Sign Out above the legal row. Source code is the ground truth used below; discrepancies are called out where relevant.

---

## 1. Overall verdict

Terav's mobile chrome is unusually disciplined for a beta: the bottom nav sits on `pb-[env(safe-area-inset-bottom)]` and hides itself when the iOS soft keyboard is detected via `visualViewport` (`BottomNav.tsx:39, 84-99`), the sticky rest timer is anchored above the nav with a `calc(60px + env(safe-area-inset-bottom))` bottom offset (`RestTimer.tsx:63`), and morning-check symptom sliders are real `type="range"` with `min-h-[44px]` (`check/page.tsx:233, 244`) instead of the JS-drag traps most training apps still ship. The systemic failure is thumb-zone inversion on the two most-tapped destinations: on Today, the Accept / Ignore verbs on the coach proposal card render in the TOP THIRD (ouch zone at ~y=420 on a 393×852 viewport — see `persona-recover/mobile/01-today.png`), while the Move / Skip session-level actions sit low but only ~52px tall with icons that read secondary. On Week, the tap-to-expand day rows are not visibly distinguishable from static rows, so the peer pattern most Runna-adjacent (weekly plan with an obvious "hold to move") is invisible. Batch 16's Delete-behind-`<details>` disclosure is defensible (destructive verb no longer 44 px away from a Privacy link, ~450 ms cost to reach) — but users who WANT to delete now pay a summary-tap + read + click sequence which is exactly the confirm-first discipline the engine embodies elsewhere, so the trade-off tracks.

What's done right: safe-area insets are respected top and bottom, no `min-h-screen` occurrences in `src/`, no `100vh` bleed, keyboard-triggered nav hide, and every meaningful destructive action funnels through `ConfirmSheet.tsx` — this is closer to Runna / Whoop discipline than to Hevy's aggressive-log density.

---

## 2. Systemic issues (≥2 personas)

### 2.1 Coach proposal buttons live in the ouch zone

- **Where:** persona-recover:/, persona-strength:/, persona-erratic:/ — `next-app/src/components/workout/ProposalCard.tsx:236-251`
- **Ergonomic law violated:** Hoober thumb reach — the primary decision of the day ("Advance to Cycle 1", "Apply bump", "Ignore") sits at roughly y=420-500 on a 393×852 canvas, which is the middle-to-top of the secondary zone, not the primary. Cradle-grip right-thumb origin at (~195, ~790) reaches those buttons only by rolling the hand.
- **What:** the coach card is stacked directly under the date strip, ABOVE the strength / accessory session rows. Users scroll UP to see the pending decision, and every screenshot confirms Accept sits well above the fold's midline. Persona-recover:/01-today.png shows "ADVANCE TO CYCLE 1" at ~y=420. Persona-erratic:/01-today.png shows "Not feeling 100% · ×0.95 applied" collapsed card at the same y-band.
- **Fix idea (STEAL from Whoop):** the proposal card is the day's single most important signal — pin its Accept/Ignore to the bottom-of-viewport action row (above the nav, below the rest timer position). Whoop pins the "recovery score" hero and lets the coaching content scroll under it; Terav can invert — content scrolls, Accept/Ignore pins.
- **REJECT from Runna:** Runna auto-schedules and lets users override; Terav is confirm-first. Do not make Accept a swipe gesture — the explicit tap IS the ceremony. Only move the position.
- **Cross-persona:** hits all three. The engine proposal is Terav's most differentiated surface; putting it in Fitts's-law-hostile territory undermines the entire "engine proposes, user Accepts" pitch.

### 2.2 Header "More" (⋯) is under Apple 44

- **Where:** persona-recover, persona-strength, persona-erratic × every route — `next-app/src/components/nav/HeaderQuickLinks.tsx:73`
- **Ergonomic law violated:** Apple HIG 44×44. Class is `w-9 h-9` = 36×36.
- **What:** the overflow menu that reaches Extras / Report / Guide (and Events for super-admin) is the rightmost target in the top chrome, closest to a right-handed thumb's arc when the phone is held for reading. Making it 36 px means users graze it or open it accidentally when swiping down for pull-to-refresh.
- **Fix:** `w-11 h-11` and inner icon can stay `size={18}`. Same treatment already applied to the two siblings (`AppShell.tsx:132, 139`).

### 2.3 Bottom nav gap-density insufficient for two-handed cradle mistap

- **Where:** all personas × all routes — `BottomNav.tsx:45-72`
- **Ergonomic law violated:** Josh Clark "adjacent tap targets need visual and physical separation". Five equal-flex tabs at a max container width of 760 px means each tab is up to 152 px wide on tablets, but at the 393 px persona viewport each tab is ~78.6 px wide with only `px-0.5` (2 px) side padding.
- **What:** icon + label is `min-h-[52px]` (good) but there's no vertical divider or per-tab hit-region compression. Cradle-grip right thumb aiming for Profile (rightmost, distance from origin ~0 px vertically, ~150 px horizontally on 393 vp) risks grazing History. This is the classic mistap surface — Whoop separates its tabs with a subtle divider AND the active tab gets a top-edge accent line, not just a text-weight bump.
- **Fix idea:** add a 4-px "active tab" top-border indicator (currently ONLY icon strokeWidth + text color signal active, which is a WCAG 1.4.1 issue also — see `app-accessibility`). This gives thumbs a peripheral-vision landing pad. See `BottomNav.tsx:57-59` — the `active ? "text-ink" : "text-muted"` alone is what disambiguates state.

### 2.4 Undersized icon buttons on session-detail rows

- **Where:** persona-strength:/01-today.png (Front squat SetRow chevron), persona-recover:/01-today.png (Block pull chevron/info stack) — `next-app/src/components/workout/YourPlanCard.tsx:84` (`w-8 h-8`), `RunSlotCard.tsx:254, 303` (`w-9 h-9`, `w-8 h-8`), `RestTimer.tsx:85, 103, 114` (`w-10 h-10`)
- **Ergonomic law violated:** Apple 44. YourPlanCard's dismiss X is 32 px, RunSlotCard's info button is 36 px, its remove-run X is 32 px, RestTimer's reset/play/close are all 40 px.
- **What:** on Today the session preview rows show a chevron + play + info icon triplet per exercise. On persona-strength /01-today.png the "Front squat" row shows the info glyph at approximately x=340, y=606 — 40 px target next to a 44 px checkbox. The RestTimer especially matters because it's a fixed sticky element the user reaches for mid-set with sweaty hands.
- **Fix idea:** promote to `w-11 h-11`; icon size can stay 14-16 px. Cost is 4-8 px total row height per exercise — acceptable given the top-of-fold is the coach card, not the exercise list.

### 2.5 Move / Skip pair vs. Log session — competing primary bottom actions

- **Where:** persona-recover:/, persona-strength:/, persona-erratic:/ — `PerProgramActions.tsx:92-108`
- **Ergonomic law violated:** Wroblewski primary-action singularity. Two side-by-side 52-px cards for Move and Skip, then a `+ Log session` link below them, then a `Log an extra session` cross-modal empty state card BELOW that.
- **What:** on all three personas the primary CTA hierarchy at the bottom-of-Today reads Move | Skip → Log session → Log extra session card. Three "primary-ish" actions vertically stacked at the base of the primary zone means the thumb has three equally reachable, equally weighted decisions. Skip in particular is 50 % of the bottom-primary real estate for what should be the 5th-most-common verb behind Log, Accept, Move, and dismiss.
- **Fix idea (STEAL from Pliability):** collapse Move/Skip into a single secondary control (e.g. an "Adjust today" summary sheet triggered by a single 52-px button) and let the actual verbs live inside the sheet. Pliability's "swap today's session" uses this pattern — the primary tile is the session, adjustment is one tap away in a sheet, not two visible buttons.

---

## 3. Per-persona findings

### persona-recover

| Route | Zone/Rule | Severity | Finding | Fix |
|-------|-----------|----------|---------|-----|
| `/` | Hoober ouch zone | P0 | "Advance to Cycle 1" proposal Accept at ~y=430 (top third of 852-vp) | Pin proposal actions to a bottom sticky bar above nav; see §2.1 |
| `/` | Apple 44 | P1 | Session-list info/play glyphs on Block pull row at 40 px (`YourPlanCard.tsx:84`) | `w-11 h-11` |
| `/` | Wroblewski primary singularity | P1 | 4 competing bottom actions (Move / Skip / Log session / Log extra card) | Collapse Move/Skip into one "Adjust today" sheet, see §2.5 |
| `/check/` | Fitts distance | P2 | Save-check button placement — hidden BELOW the bottom nav in screenshot at first render (BottomNav overlays the fold before scroll), sliders visible but bottom of check panel clipped by nav band | Bottom padding of `main` is `calc(64px + safe-area + 1rem)` = ~96 px on iPhone 14 Pro, but the "Save check" button lives inside content, not sticky, so a user who hits the bottom of the sliders sees Save PARTIALLY under the nav. Consider a sticky Save above the nav on `/check/` specifically (same pattern as intake footer `IntakeClient.tsx:1397`). |
| `/coach/` | Empty-state ergonomics | P2 | Screenshot shows "Coming soon" placeholder — stale (source now has full chat UI, `coach/page.tsx:1-50`). Not a bug, but the persona harness needs re-running. | Regenerate persona artifacts post-Batch 16. |
| `/history/` | Heatmap tap target | P2 | 8×7 heatmap cells at `minmax(32px, 1fr)` = ~32-42 px each on 393 vp (`Heatmap.tsx:150`), still below 44 | Cells are `role="button"` when `onDayClick` supplied; enforce `min-w-[44px] min-h-[44px]` with `aspect-ratio` unset so grid can breathe (or 7 weeks × 44 = 308 px, fits) |

### persona-strength

| Route | Zone/Rule | Severity | Finding | Fix |
|-------|-----------|----------|---------|-----|
| `/` | Hoober ouch zone | P0 | "APPLY BUMP" at y≈420, IGNORE next to it — top-third of viewport | See §2.1 |
| `/` | Apple 44 | P1 | Front squat SetRow info + play icons 40 px | See §2.4 |
| `/week/` | Progressive disclosure signaling | P1 | Day rows tap-to-expand (`week/page.tsx:42-50`) but visually indistinguishable from static rows — the screenshot shows no chevron, no "tap to reveal" affordance on collapsed rows | Add a 12 px right-side chevron on collapsed rows; peer pattern: Runna, Whoop, Hevy all use a chevron-down that rotates on expand |
| `/week/` | STALE screenshot | — | Persona artifact still shows "PROGRAMS" pill (source removed it). Not a bug — capture drift. | Re-run persona harness after Batch 16. |
| `/coach/` | (post-Batch 16 fully functional) | — | Placeholder screenshot; verify tap target of Send button + textarea `inputMode` after harness re-run | — |
| `/profile/` | Batch 16 Delete disclosure | P1 (contested) | Delete now behind `<details><summary>Danger zone</summary>` with `min-h-[44px]` summary. Users WHO WANT to delete pay ~450 ms extra (summary tap + read + click). Users at RISK of misclicking Delete save that same 450 ms of regret. Trade-off favors the many; ergonomically OK. | Keep. But note: the summary text "Danger zone" is a GitHub convention that may not read as "Delete lives here" to a first-time user. Consider "Delete my account" as the summary text itself (still requires an inner tap on the actual button that fires the ConfirmSheet — one confirm layer preserved). |
| `/profile/` | Legal row tap targets | P2 | Three inline links (Privacy · Terms · Medical disclaimer) at 11 px muted text, no min-h enforced (`profile/page.tsx:313-328`) | Wrap each link with `inline-flex items-center min-h-[44px]` — currently the anchor's implicit line-height defines the hit region. |

### persona-erratic

| Route | Zone/Rule | Severity | Finding | Fix |
|-------|-----------|----------|---------|-----|
| `/` | Hoober ouch zone | P0 | Not-feeling-100% collapsed proposal at y≈244 with expand chevron | See §2.1 |
| `/history/` | Heatmap density on sparse data | P1 | Persona-erratic:/04-history.png shows a 45-active-days heatmap where cells are mostly amber. Empty cells (bottom-right corner where the current week hasn't finished) are `bg-line-soft` and NOT tappable when `onDayClick` is undefined. On history route the heatmap IS tappable — verify cells are not `role="button"` when disabled. | `Heatmap.tsx:154-172` — the button branch runs for ALL cells including future/empty; give `disabled` prop for future dates. |
| `/history/` | overflow-x on heatmap | ok | `overflow-x-auto` on `Heatmap.tsx:145` correctly contains the wide grid — persona-erratic doesn't trigger horizontal overscroll on 393 vp because 8 weeks × 32 px = 256 px. Would break at 12 weeks × 32 px = 384 px on 375 SE viewport. | If WEEKS ever bumps up, retest. |
| `/progress/` | "Export Report" button in ouch zone | P2 | Persona-erratic:/05-progress.png shows Export Report at y≈100, top-right. This is a rare action (matches ouch-zone appropriateness) — CORRECT placement. | Keep. |
| `/report/` | Table overflow at 393 | P2 | `report/page.tsx:577` has `hidden sm:block overflow-x-auto` — mobile users below sm (< 640 px) see a fallback (verify), not a scrollable table. | Confirm fallback exists; if not, drop `hidden sm:block` and rely on overflow. |

---

## 4. Sticky bottom nav — deep dive

- **File:** `next-app/src/components/nav/BottomNav.tsx:36-73`
- **Safe-area handling:** `pb-[env(safe-area-inset-bottom)]` on the `<nav>` + `paddingLeft/Right: env(safe-area-inset-left/right)` — home-indicator zone respected, iPhone Pro rounded-corner side insets respected. Verdict: **correct**.
- **Behavior with iOS keyboard on log form:** `useKeyboardOpen()` (`BottomNav.tsx:84-99`) uses `visualViewport` height delta > 100 px as the trigger and returns `null` to remove the nav from DOM. This is a **strong** pattern — most competitors either leave the nav visible (Runna in older versions), animate a slide-down (Whoop), or ignore the problem (Hevy). Terav's remove-from-DOM avoids the "nav rides up over the input" bug entirely on iOS Safari.
- **Route indication clarity:** currently active tab differentiated by `text-ink` (vs `text-muted`) + `strokeWidth={2.25}` (vs `1.75`). No top-border, no background color change. Reads as an unloaded state to a new user — flag P1 (see §2.3). Peer benchmark: Whoop uses a top-edge indicator; Pliability uses a filled icon + label color; Runna uses a filled dot under the active label.
- **Bottom padding on scrollable content:** `AppShell.tsx:150` sets `paddingBottom: calc(64px + env(safe-area-inset-bottom) + 1rem)` on `<main>`. 64 px nav height + 34 px home indicator + 16 px = 114 px total. Verified against `min-h-[52px]` on nav items × 2 (icon + label + padding) ≈ 52 px + 12 px chrome = 64 px. Verdict: **correct** but tight — if nav grows a hairline top-border indicator (§2.3) redo the math to 66 px.

---

## 5. Heatmap & wide-content specifics

- **File:** `next-app/src/components/charts/Heatmap.tsx`
- **overflow-x containment:** `overflow-x-auto` on line 145. **Contained** — does not push the whole page horizontally. Verified via persona-erratic:/04-history.png where the grid ends at the card's right edge.
- **Tap target per cell at 393 vp:** `gridAutoColumns: minmax(32px, 1fr)` — 8 columns in ~264 px available width (393 - 32 px card padding - 32 px chart margin) = ~33 px per cell. Below Apple 44, below WCAG 2.5.5 AAA (44), above WCAG 2.5.8 AA minimum (24). Flag P1.
- **Long-year edge case (persona-erratic day 45):** the heatmap always shows 8 × 7 = 56 cells regardless of dataset length. 45 active days on persona-erratic renders correctly — the "extra" 11 empty cells at grid top are `bg-line-soft` (`Heatmap.tsx:168`) and STILL render as `<button>` when `onDayClick` provided. Tapping a future empty cell fires `onDayClick(futureDate)` — needs a guard. Flag P1.
- **hover:ring on cells:** `hover:ring-1 hover:ring-slate/60` on line 162 has NO active/focus twin. On touch devices this ring appears on tap-and-hold and persists (iOS sticky-hover). Flag with §6.

---

## 6. Hover-on-touch traps

Only **1** file in `src/components/` uses `focus-visible:` or `active:` alongside 98 `hover:` occurrences. Effectively every interactive element in the app has a mouse-only feedback path with no touch/keyboard twin.

| File | Class | Fix |
|------|-------|-----|
| `next-app/src/components/nav/BottomNav.tsx:58` | `hover:text-ink` (no focus/active) | add `focus-visible:text-ink active:text-ink` |
| `next-app/src/components/AppShell.tsx:132, 139` | `hover:text-ink hover:bg-line-soft` | add `focus-visible:bg-line-soft active:bg-line-soft` |
| `next-app/src/components/charts/Heatmap.tsx:162` | `hover:ring-1 hover:ring-slate/60` (sticky-hover risk) | swap for `focus-visible:ring-2` on cells; drop `hover:ring` on touch |
| `next-app/src/components/workout/ProposalCard.tsx:240, 247` | `hover:bg-bronze-hover`, `hover:bg-line-soft` | add `active:brightness-90 focus-visible:ring-2 focus-visible:ring-bronze` |
| `next-app/src/components/workout/PerProgramActions.tsx:96, 104` | `hover:bg-surface-2` on Move/Skip | add `active:bg-line-soft` |
| `next-app/src/components/workout/SetRow.tsx:120, 135` | `hover:bg-line-soft` on inline row buttons | add `active:` twins |
| `next-app/src/components/workout/RestTimer.tsx:85, 103, 114` | `hover:bg-surface-2` on all three controls | add `active:` twins — rest timer is used exclusively on touch |
| `next-app/src/components/nav/HeaderQuickLinks.tsx:73, 95` | `hover:bg-surface-2` | add `active:` twin |

Systemic recommendation: rather than 98 hand-edits, wrap the common patterns in a `@utility` in `globals.css` (e.g. `.tap-feedback` that expands to `hover:bg-line-soft focus-visible:bg-line-soft active:bg-line-soft`) so the intent is one class.

---

## 7. iOS-specific gotchas

- **100vh occurrences:** grep returned **zero** hits for `min-h-screen` or `h-screen` in `src/`. Zero 100vh traps. This is unusually clean — most Next apps ship with at least one loading skeleton at `min-h-screen`. Verdict: **strong**.
- **PWA standalone top-inset:** `AppShell.tsx:117` — `<header>` uses `style={{ paddingTop: "env(safe-area-inset-top)" }}`. `layout.tsx:31-35` sets `apple.web-app.statusBarStyle: "black-translucent"` which reserves top inset for content, so header's paddingTop correctly avoids the notch/dynamic-island. Verdict: **correct**.
- **Pull-to-refresh on Today:** no `overscroll-behavior: none` set globally. The default browser PTR fires on Today when scrolling up at y=0. Given Terav loads from a Zustand store hydrator and PTR would re-execute the SW cache path, this is likely harmless but unexpected — users may re-load the whole app while trying to swipe the date-navigator arrow. Flag P2. Consider `overscroll-behavior-y: contain` on `<main>`.
- **Fixed nav on iOS Safari scroll:** `BottomNav.tsx:39` uses `fixed left-0 right-0 bottom-0 z-40`. Historically `fixed` on iOS jitters when the URL bar retracts. The `visualViewport` listener (`BottomNav.tsx:84-99`) implicitly guards this by removing the nav on keyboard, but does NOT reposition on URL-bar collapse. Test on real device — if jitter occurs, `position: sticky` inside a container with `height: 100dvh` is the modern replacement.

---

## 8. Competitive ergonomic research

Fetched: Pliability marketing site (mobile UI descriptions), Runna marketing site + support hub, Whoop App Store. WebFetch success rate low (App Store URLs 404'd, Reddit blocked, Google consent-walled). Findings drawn from source markup + prior audit references.

### 8.1 Runna — weekly plan interaction (Margus's stated target for Week tab)

- **Peer pattern:** Runna's weekly plan uses a dated list of runs (Mon Rest, Tue Easy 5km, Wed Interval, etc.) where each run tile is tappable to open a session detail sheet, and swipe / long-press exposes "Move to another day" and "Swap with another run" verbs. Reschedule is destructive-adjacent (invalidates the plan's autobalance) so Runna gates it behind a confirmation.
- **STEAL:** the dated-list format with per-day tap-to-expand — already implemented in Terav (`week/page.tsx:42-50`). What's missing is the **affordance signal** that the row is tappable. Runna shows a chevron; Terav shows nothing until you tap. See §3 persona-strength P1.
- **REJECT:** long-press-to-drag-reschedule. Terav's `PerProgramActions` MoveSheet is the confirm-first equivalent — explicit tap on Move, sheet opens, date picker, confirm. This is stronger than Runna's optimistic drag because it makes the plan-invalidation cost visible to the user. Keep the current pattern.
- **STEAL (Batch 17 candidate):** on the collapsed Week row, add a per-day skip indicator (icon or muted "skipped" tag) so the cascade is visible without tap. Runna does this well — a rest day reads as rest at glance.

### 8.2 Pliability — spacious card interaction

- **Peer pattern:** Pliability's daily-routine cards are ~90 % of viewport width with generous internal padding (guessed ~20-24 px). One card = one arc = one primary action ("Start"). Tap surface is the entire card.
- **STEAL:** the Batch 16 Week card px-3 → px-4 change moves in this direction. Extend to Today's session card — currently the Today card padding varies by content, and the "primary tap surface" is fragmented across chevron / play / info / checkbox. Pliability's entire-card-is-a-tap is a stronger touch model.
- **REJECT:** Pliability's single-arc-per-day. Terav explicitly ships multi-track (Concurrent, Strength, Handstand run in parallel per user profile) — the multi-card Today is a feature, not a bug. Do not compress to one arc.

### 8.3 Whoop — adaptive-coach thumb reach

- **Peer pattern:** Whoop pins the recovery-score hero at the top of Today (large numeric readout) and lets coaching content scroll under it. The primary daily verb ("Log a strain event" / "See your plan") lives in the bottom-anchored tab bar's center slot.
- **STEAL for proposal placement:** Whoop's center-slot primary CTA — currently Terav's bottom nav has 5 equally-weighted tabs. Consider a 5-tab layout where the CENTER tab is contextual: on Today it becomes "Accept proposal" when a proposal exists, on Week it becomes "Adjust week", on History it disappears. This is the Runna+Whoop primary-verb-in-nav pattern.
- **REJECT:** Whoop's recovery-score-as-hero. Terav's readiness dot next to the wordmark (`AppShell.tsx:170-186`) is a strictly smaller commitment and matches Terav's confirm-first ("nothing changes until you tap") tone. Do not scale it up.
- **DIVERGENCE (WHY):** Whoop's coach is autonomous — score changes drive UI without user input. Terav's is confirm-first — the user IS the acceptance gate. Whoop can afford a big hero because the hero is the coach's output; Terav's coach output is a card the user acts on. The two require different chrome.

---

## 9. Batch 16 assessment

### 9.1 Week card padding px-3 → px-4 — VERDICT: improvement

- Verified `week/page.tsx` current source uses `px-4` on day rows. The 4-px increase per side takes internal tap surface from ~360 to ~356 px (viewport 393 - 2*16 = 361; previous 393 - 2*12 = 369). Very minor content-space cost, meaningful visual breathing room, and aligns with Pliability's spacious-card direction.
- No new ergonomic problem introduced.

### 9.2 "Programs" pill removed from Week header — VERDICT: net positive

- Rationale in `week/page.tsx:123-126` — pill was redundant with the bottom-nav Programs slot AND the header quick-links "Layers" icon (`AppShell.tsx:129-135`).
- Ergonomic gain: reclaims ~48 px of top-of-page real estate, header no longer competes with H1 for the eye.
- Ergonomic cost: users who navigated Week → Programs via the pill now need one extra glance to spot the layers icon in the top chrome. Not a real cost — the layers icon is in the top-right thumb arc for right-handed cradle grip, closer to reach than a header pill was.

### 9.3 Profile Delete moved into `<details>` disclosure — VERDICT: contested, defensible

- Verified `profile/page.tsx:336-357`. Summary has `min-h-[44px]`, inner Delete button also `min-h-[44px]`.
- **For users who don't want to delete:** clear win — destructive verb no longer inline with Privacy / Terms. The disclosure is a semantic "danger zone" separator.
- **For users who DO want to delete:** cost is one extra tap on `<summary>` before the Delete button appears. This adds ~450 ms of motor time (Fitts × 2 taps) + reading "Danger zone" and locating the inner button. Then Delete opens a ConfirmSheet (`profile/page.tsx:388-396`). So the sequence is: tap Danger zone → tap Delete → tap Confirm sheet's Delete forever → account gone. That's 3 taps + 1 read, vs. the old 2 taps + 1 read.
- **Verdict:** Terav's users are more likely to delete by accident than by intent (rehab tool, personal data, most sessions don't need to be nuked). The extra tap protects the many at moderate cost to the few. Keep. But consider inline copy under the disclosure summary: "Danger zone — delete account, wipe logs" so the summary text explains what's inside.

### 9.4 New concern introduced by Batch 16

- The Profile page in screenshots shows Sign Out ABOVE the legal footer, but `profile/page.tsx:365-370` places it at the bottom. This confirms screenshots are pre-Batch 16. Post-Batch 16, Sign Out sits at bottom-of-page — good bottom-anchored rest position, but a scroll is now required on Profile to reach Sign Out. Given users sign out rarely, and the bottom-nav Profile tab means Profile is always one tap away, this is fine.

---

## 10. Priorities

**P0 (blocking) — one item:**
- Reposition coach-proposal Accept/Ignore out of the ouch zone. See §2.1. This is the single most impactful mobile-UX fix on the app. It hits all three personas and undermines Terav's core value prop when the proposal ceremony requires a hand-roll to complete.

**P1 (this month):**
- Bottom-nav active-tab indicator (§2.3) — 4 px top-border in `bg-bronze` on active `<li>`
- HeaderQuickLinks More button `w-9 h-9` → `w-11 h-11` (§2.2)
- Session-row icon buttons `w-8-9` → `w-11 h-11` (§2.4)
- Heatmap cell min 44 px OR reduce to 6 columns (§5 P1)
- Week collapsed-row expand affordance (chevron) (§3 persona-strength P1)
- Legal-row link min-h enforcement on Profile (§3 persona-strength P2 promoted)
- Add `active:` / `focus-visible:` twins to the top 20 hover: sites (§6) — or ship a `.tap-feedback` utility

**P2 (nice to have):**
- `overscroll-behavior-y: contain` on `<main>` to disable Safari PTR on Today (§7)
- Sticky Save-check button on `/check/` above the bottom nav (§3 persona-recover P2)
- Heatmap disabled-cell guard for future/empty dates (§3 persona-erratic P1)
- Report table mobile fallback confirmation (§3 persona-erratic P2)
- Regenerate persona artifacts post-Batch 16 so future audits are cross-checking against current UI, not the Aug-19-11:30 snapshot

---

## 11. Out-of-scope callouts (flagged, not owned)

- Bottom-nav active state relies on color + text weight only → see `app-accessibility` (WCAG 1.4.1 use of color).
- Coach-proposal card body copy density → see `app-copy-clarity`.
- Warmth of tap feedback animation (whether an `active:` scale-95 transition feels right) → see `app-motion-perf`.
- Heatmap cell contrast for amber-on-dark → see `app-visual-craft`.
- Landing promise "engine proposes, user Accepts" — this audit assumed the promise is genuine and only scored the ergonomics of the Accept surface, not whether the acceptance itself does what the landing claims → see `app-landing-alignment`.

---

*Audit written 2026-08-19. Peer-set: Runna, Pliability, Whoop (per `dev/audits/app/competitor-refs.md`). No PII was inspected — persona emails are `e2e-persona-{name}@example.test` dummy accounts.*
