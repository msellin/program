# Terav app — Mobile UX audit (thumb reach, tap targets, safe area)

Date: 2026-09-01
Personas: persona-recover, persona-strength, persona-erratic (primary) · persona-pullup, persona-pullup-fast, persona-muscleup, persona-engine-block2 (new, first audit)
Artifacts: `next-app/tests/e2e/artifacts/personas/*/mobile/` + `*/flows/` (captured 2026-09-01T09:4x)
Viewport basis: 393×852 primary, 375×667 SE cross-check
Prior rounds cross-referenced: `2026-08-21-app-mobile-ux-post-batch36.md`, `2026-08-20-jury-mobile-ux.md`, `2026-08-19-app-audit-mobile-ux-batch25.md`

A note on method: full-page Playwright captures are downscaled when rendered, so **every pixel figure below is computed from the class string against a 393px viewport**, not measured off an image. Screenshots are used for composition and zone placement only.

---

## 1. Overall verdict

The chrome is in the best shape it has ever been. `AppShell.tsx:146` puts `env(safe-area-inset-top)` on the header, `AppShell.tsx:177` reserves `calc(64px + env(safe-area-inset-bottom) + 1rem)` under `<main>`, `BottomNav.tsx:50-54` handles all three insets, and `BottomNav.tsx:42` genuinely unmounts the nav when the iOS keyboard rises — that last one is a pattern most peers still get wrong. `min-h-screen` has been driven out of every shipping route. Pull-to-refresh is dead app-wide via `globals.css:120`. The systemic failures from Batch 25/36 are closed.

The top ergonomic failure is now inside the one surface shipped today: **`RestTakeover.tsx:204` sets `pb-[22px]` with no `env(safe-area-inset-bottom)`**, while the bottom sheet *twelve lines further down in the same file* (`RestTakeover.tsx:311`) does it correctly. On any iPhone with a home indicator, the bottom-most control of a full-screen takeover — "Do something else next" — sits inside the 34px system swipe band. That is a P0 and it is a one-token fix.

Second: the new four-way RPE picker is dimensionally legal (74×66pt per target) but its 9px mono sub-label is 2pt below the iOS legibility floor and wraps to two lines on two of four options, producing a ragged row that reads as a rendering bug rather than a scale. Third: **`/coach` 404s on all personas and the 404 shell renders a five-tab bottom nav with tab labels that no longer exist** (`persona-strength/text/03-coach.txt`) — a nav-identity break, not just a dead route.

The one thing done unambiguously right: `CheckRegionRow.tsx:89`. The symptom "sliders" named in the audit brief are not sliders — they are 4-up segmented buttons at `min-h-[44px]`. That is a correct rejection of drag-only input on the app's highest-friction surface, and it should never be reverted to a range slider.

---

## 2. Systemic issues (≥2 personas)

### 2.1 Full-screen takeover ignores the home indicator

- **Where:** persona-strength:/session/* (`flows/session-rest-extend/01-rest-before.png`), persona-recover and all six strength/skill personas reach the same component — `next-app/src/components/session/RestTakeover.tsx:204`
- **Ergonomic law violated:** Safe area / home-indicator exclusion (Apple HIG); Hoober primary zone contaminated by system gesture.
- **What:** the footer stack is `className="flex-shrink-0 px-[22px] pb-[22px] flex flex-col gap-3.5"`. 22px < the 34px home indicator. The final control, `RestTakeover.tsx:292-298`, is `w-full h-10` ("Do something else next") occupying y ≈ 796–836 on a 852pt screen. Its entire lower half is inside the swipe-up band. First tap dismisses the app to the home screen. The `w-24 h-[58px]` "+30s" and `flex-1 h-[58px]` "Skip rest" pair sits at y ≈ 690–748 and is fine.
- **Fix:** `pb-[calc(22px+env(safe-area-inset-bottom))]` on line 204 — copy the string already used at line 311 and at `BottomSheet.tsx:56`.

### 2.2 Bottom nav gives touch users no press feedback and stays live under modals

- **Where:** every persona × every route — `next-app/src/components/nav/BottomNav.tsx:87`
- **Ergonomic law violated:** hover-on-touch trap (Clark); iOS sticky-hover.
- **What:** inactive tabs carry `hover:text-ink` with no `active:` or `focus-visible:` twin. On iOS the hover state latches after tap and persists until the user taps elsewhere, so a stale tab can look semi-active alongside the real active tab. Separately, `RestTakeover.tsx:171` is `z-40` and `BottomNav.tsx:50` is also `z-40` — the tie resolves on paint order alone. The nav is confirmed still in the a11y tree during the takeover (`flows/session-rest-extend/01-rest-before.txt` ends with `DAY / PLAN / RECORD / PROFILE`), so it is focusable behind a full-screen modal and one CSS refactor away from painting over "Skip rest".
- **Fix:** `BottomNav.tsx:87` → `"text-muted font-medium hover:text-ink focus-visible:text-ink active:bg-line-soft"`. And bump `RestTakeover.tsx:171` to `z-50` (matching `StickyCta.tsx`'s documented precedent at line 73) plus `inert` on the nav while a takeover is mounted.

### 2.3 `hover:` without a touch twin — 33 files

- **Where:** all three primary personas; highest-traffic offenders are `ProposalCard.tsx`, `Heatmap.tsx`, `plan/page.tsx`, `BriefView.tsx`, `Day1EmptyState.tsx`, `ConfirmSheet.tsx`.
- **Ergonomic law violated:** touch has no hover; feedback must be `:active`.
- **What:** 33 `.tsx` files under `src/components/` and `src/app/` contain a `hover:` variant and contain **zero** `active:`, `focus:` or `focus-visible:` variants anywhere in the file. On a phone every one of these is a control that visually does nothing when pressed.
- **Fix:** codemod — for any `hover:bg-X`, append `active:bg-X`; for any `hover:text-X`, append `active:text-X focus-visible:text-X`. Table in §6.

### 2.4 Notes never grow

- **Where:** persona-recover:/check (`check/hip/page.tsx:365`), persona-strength:/session (`NoteSheet.tsx:117`, `SetRow.tsx:170`), persona-erratic:/off-plan (`RunSlotCard.tsx:621`), persona-muscleup:/ graduation feedback (`StatusCards.tsx:532`).
- **Ergonomic law violated:** input affordance — a 2-row box on a phone with the keyboard up shows ~40px of a note the user is still writing.
- **What:** all six textareas in the app are hard `rows={2}` with no auto-grow.
- **Fix:** shared `<AutoTextarea>` — `rows={2}` as the floor, `onInput` setting `style.height = scrollHeight` capped at `max-h-40`.

### 2.5 Snap carousel snaps flush to the viewport edge

- **Where:** persona-recover / persona-strength / persona-erratic all capture `/programs` (`06-programs.png`) — `next-app/src/app/programs/page.tsx:240`
- **Ergonomic law violated:** snap-point vs. scroll-padding mismatch.
- **What:** `flex gap-3 overflow-x-auto px-4 sm:px-6 pb-2 snap-x snap-mandatory` with `w-[240px]` children. Peek-through is correct (240 + 12 gap = 252 of 393, leaving 141px of card 2 visible) and `overscrollBehaviorX: "contain"` at line 241 correctly stops the swipe from triggering iOS back-nav. But `snap-start` aligns to the scrollport's padding *box*, not its content box, so cards 2..n snap flush against x=0 while card 1 sits at x=16. The rail visibly loses its left margin the moment you swipe.
- **Fix:** add `scroll-pl-4 sm:scroll-pl-6` to line 240. Now 8 catalog programs instead of 5, this rail is 2× longer than when it was last reviewed and the defect fires 7 times per traverse.

---

## 3. Per-persona findings

### persona-recover

| Route | Zone/Rule | Sev | Finding | Fix |
|-------|-----------|-----|---------|-----|
| `/check` | Adjacency | P2 | `CheckRegionRow.tsx:77` `grid-cols-4 gap-1.5` = 6px between targets. Josh Clark / Material floor is 8px. Each cell computes to (361 − 32 card padding − 18 gaps)/4 = **77.75 × 44pt** — size passes, separation does not. With 8+ regions stacked, mis-taps land on the adjacent severity. | `gap-2` |
| `/check` | Fitts | — | **Good.** `check/page.tsx:399` `<StickyCta keyboardAware>`. CTA band centre ≈ (196, 758); cradle-thumb origin (195, 790) → **32px travel**. Best primary action in the app. |
| `/check` | Consistency | P2 | Region rows are `min-h-[44px]`; the CONTEXT block's "Morning stiffness" / "Life load" segmented rows are a different, un-normalised control family. Two segmented-control sizings on one screen. | route both through `CheckRegionRow`'s sizing token |
| `/` | Apple 44 | — | **Good.** `RunSlotCard.tsx:657,669` "Log session" / "Import GPX" both `min-h-[44px]`. The new rest-day surface is compliant out of the gate. |
| `/` | Hit area | P2 | Same two buttons use `py-2 pr-2` — **no left padding**. The icon's left edge is the hit edge; the natural "aim at the +" tap lands 4px outside. | `px-2 -ml-2` |
| `/` | Touch feedback | P1 | `RunSlotCard.tsx:657,669` `hover:text-ink`, no `active:`. On the rest-day card these are now the only two controls on the screen. | `active:text-ink` |
| `/coach` | Route indication | P1 | 404 shell, 5-tab nav, labels `TODAY/WEEK/PROGRESS/HISTORY/PROFILE` (`text/03-coach.txt`). No tab matches the route so **no active indicator renders at all**. | see §7 |

### persona-strength

| Route | Zone/Rule | Sev | Finding | Fix |
|-------|-----------|-----|---------|-----|
| `/session/*` rest | Safe area | **P0** | `RestTakeover.tsx:204` `pb-[22px]`, no inset. §2.1. | `pb-[calc(22px+env(safe-area-inset-bottom))]` |
| `/session/*` rest | Apple 44 | P1 | `RestTakeover.tsx:278` "Add a note" is `py-2.5` on a `text-[13.5px]` line ≈ **41pt**; `:295` "Do something else next" is `h-10` = **40pt**. Both short of 44. The two shortest targets on the screen are also the two lowest. | `min-h-11` on both |
| `/session/*` rest | Apple 44 / Fitts | P2 | RPE picker (`RestTakeover.tsx:214-238`): card inner = 361 − 28 = 333; `flex gap-2` ×3 = 24; **(333−24)/4 = 77.25 × 66pt** per target. Passes Apple 44 both axes. Reach from (195,790) to outer buttons ≈ **226px** — clean secondary zone, symmetric left/right. Ergonomically the four-way is fine. | none |
| `/session/*` rest | Legibility of target | P1 | The `text-[9px]` sub-label (`:230`) is 2pt under the iOS 11pt floor, and at 77px "4-5+ in reserve" and "0-1 in reserve" wrap to two lines while "~3 in reserve"/"~2 in reserve" do not — a ragged row that reads as broken. Buttons also have **zero horizontal padding**, so "Plenty left" touches the border. → type scale itself: see app-audit-N-visual-craft | `text-[10px]`, `px-1`, and shorten to `4-5+ left` / `~3 left` / `~2 left` / `0-1 left` so all four fit one line |
| `/` (day) | Hoober inversion | P1 | `16-session-today.png`: the gate — "Use these" / "Adjust" — sits at y ≈ 325 (**465px from thumb rest**, top of the middle third), while the thing it unblocks, the sticky "ACCEPT THE NUMBERS TO START" band, sits at ~32px. The required action is **15× farther** than the blocked one. Confirm-first is correct product-wise; its geometry is inverted. | mirror the accept action into the sticky band as an enabled "Use these →" while the proposal is pending; keep "Adjust" in the card |
| `/coach` | Nav identity | P1 | 404 + stale 5-tab nav. §7. | |
| `/programs` | Snap | P2 | §2.5. | `scroll-pl-4` |

### persona-erratic

| Route | Zone/Rule | Sev | Finding | Fix |
|-------|-----------|-----|---------|-----|
| `/record` | overflow-x | — | **Good.** `Heatmap.tsx:150` `flex-1 overflow-x-auto` with `gridAutoColumns: "minmax(44px, 1fr)"` (`:154`). Wide grid scrolls internally; **no page-level horizontal scroll** at 393 or 375. |
| `/record` | Apple 44 | — | **Good.** `minmax(44px, ...)` + `aspect-square` = 44×44 minimum per cell. Cell tap targets are compliant even at max density. |
| `/record` | Empty cells | — | **Good.** `Heatmap.tsx:159-198`: future cells degrade to a non-interactive `<span>` with `opacity-50`. persona-erratic's sparse 45-day record (`05b-record.png`: "45 active days · showing last 30", five red-flag days, many rest slots) renders empty states as flat `bg-line-soft` with no phantom affordance. This was a P2 in the Batch 25 round; it is closed. |
| `/record` | Touch feedback | P1 | `Heatmap.tsx:170` `hover:ring-1 hover:ring-slate/60` — **the only feedback on a 44px cell, and it is hover-only**. On touch, tapping a heatmap cell produces no visual acknowledgement whatsoever before the route changes. Worst instance of §2.3 in the app. | `active:ring-1 active:ring-bronze focus-visible:ring-1 focus-visible:ring-bronze` |
| `/record` | Height | P2 | Full-page height **3300px** = 3.9 screens with no in-page anchor. Retests → Log → 30 day rows is a single unbroken scroll. → IA, see app-audit-N-visual-craft |
| `/record` | Apple 44 | — | Day accordion rows are full-width `flex` rows ≈ 45pt. Compliant. |

### New personas (first audit)

| Persona | Route | Zone/Rule | Sev | Finding |
|---------|-------|-----------|-----|---------|
| persona-muscleup | `/` | Ouch zone | P1 | Graduation card (`StatusCards.tsx:464`) puts **"End this program" — irreversible — as the bottom-most control**, ≈60px from the cradle-thumb rest once scrolled. `min-h-11` and red text are correct; placement is not. Hoober: destructive belongs in the ouch zone. Move it behind the existing `ConfirmSheet`, or relocate above "Pick your next focus". |
| persona-muscleup | `/` | Apple 44 | — | **Good.** `StatusCards.tsx:522` rating chips are `w-11 h-11` = exactly 44×44. Five chips + gaps fit 393 with room. |
| persona-pullup, persona-pullup-fast, persona-engine-block2 | `/` | — | — | No new mobile-ergonomic surface. Day/Plan/Record/Profile render inside the audited chrome; all four inherit §2.2/2.3 and nothing persona-specific. |

### 375×667 SE cross-check

- `/check` — clears. 4-up segmented row becomes (343 − 32 − 18)/4 = **72.75 × 44pt**. Still legal.
- **RPE picker — clips.** At 375 each button is **72.75px**. "Plenty left" at `text-[13.5px] font-semibold` measures ~72px and will wrap to two lines; combined with a two-line 9px sub-label that is 4 lines ≈ 62px of content in a fixed `h-[66px]` box with no padding. This is the only route that visibly degrades at SE, and it degraded *today*.
- `RestTakeover` overall — the footer stack sums to ~333px (66 card + 58 + 41 + 40 + gaps + 22). On a 667 device in Safari with chrome (~517px usable) that leaves ~184px for a `text-[104px]` numeral plus the "Next up" block. `flex-1 min-h-0` (`:177`) lets the middle compress, but the 104px numeral has no shrink allowance. **Verify on-device at SE.**

---

## 4. Sticky bottom nav — deep dive

- **File:** `next-app/src/components/nav/BottomNav.tsx:48-102`
- **Safe-area handling: pass.** `pb-[env(safe-area-inset-bottom)]` (`:50`) plus explicit left/right insets (`:52-53`) for Pro rounded corners. `AppShell.tsx:177` reserves `calc(64px + env(safe-area-inset-bottom) + 1rem)` on `<main>` — no content is trapped under the nav on any of the 21 personas.
- **iOS keyboard: pass, and better than peers.** `:42` returns `null` when `useKeyboardOpen()` fires; the detector (`:113-127`) uses a 100px `visualViewport` delta with a documented rationale for the threshold. The nav does not ride up over log-form numerics. `StickyCta.tsx:77` independently lifts by `keyboardOffset` and reclaims the vacated 64px.
- **Tap targets: pass.** 393/4 = **98.25 × 52pt** per tab (`min-h-[52px]`, `:84`). Adjacency is moot — tabs are `flex-1` and edge-to-edge, so there is no dead gutter.
- **Route indication: pass on signal, fail on feedback.** Three concurrent signals — 3px bronze top edge (`:70`), `text-strong` vs `text-muted`, `font-semibold` vs `font-medium`, plus icon `strokeWidth` 2.25 vs 1.75 (`:92`). Visible in `persona-recover/mobile/01-day.png` on DAY. But there is no press state at all (§2.2), so a tab tap that triggers a slow route change looks like a missed tap.
- **z-order: latent P1.** z-40, tied with `RestTakeover`. `StickyCta` correctly documents its z-50 escape at `StickyCta.tsx:67-73`; `RestTakeover` never got the same treatment.

---

## 5. Heatmap & wide-content specifics

- **File:** `next-app/src/components/charts/Heatmap.tsx:150-198` (plus `record/CutCActivityHeatmap.tsx` for the 12-week strip)
- **overflow-x containment: pass.** Scroll is on the inner `flex-1` (`:150`); the row-label column (`:140`) stays pinned outside it. No page-level horizontal scroll on persona-erratic at 393 or 375.
- **Tap target per cell at 393px: pass.** `gridAutoColumns: minmax(44px, 1fr)` + `aspect-square` guarantees 44×44 regardless of range length.
- **Long-range edge case (persona-erratic, 45 days / 3300px `/record`): pass on layout, fail on feedback.** Sparse data renders correctly, future cells are inert, red-flag and rest states are distinguishable. But cell press feedback is `hover:`-only (`:170`), so on touch the highest-density interactive grid in the app is also the only one with zero press acknowledgement.
- **Not the heatmap but adjacent:** `CutCRetestTimeline.tsx:164` uses `overflow-x-auto pb-2 pl-5 -ml-5` — a negative-margin bleed with no `overscroll-behavior-x: contain`, so a horizontal swipe at the rail's left edge can trigger iOS back-navigation. Add `style={{ overscrollBehaviorX: "contain" }}` to match `programs/page.tsx:241`.

---

## 6. Hover-on-touch traps

33 files carry `hover:` with no `active:`/`focus:`/`focus-visible:` anywhere in the file. Highest-impact:

| File | Class | Fix |
|------|-------|-----|
| `nav/BottomNav.tsx:87` | `hover:text-ink` | `+ active:bg-line-soft focus-visible:text-ink` |
| `charts/Heatmap.tsx:170` | `hover:ring-1 hover:ring-slate/60` | `+ active:ring-1 active:ring-bronze focus-visible:ring-1 focus-visible:ring-bronze` |
| `workout/RunSlotCard.tsx:657,669` | `hover:text-ink` | `+ active:text-ink` |
| `workout/ProposalCard.tsx` | hover-only card + action states | `+ active:` twins on Accept/Ignore |
| `app/plan/page.tsx:818,827` | `hover:bg-bronze-hover` / `hover:bg-line-soft` | `+ active:bg-bronze-hover` / `active:bg-line-soft` |
| `session/BriefView.tsx` | hover-only | `+ active:` |
| `ConfirmSheet.tsx` | hover-only on a confirm/cancel pair | `+ active:` — a confirm dialog with no press state is the worst place for this |
| `EmptyStateCard.tsx`, `Day1EmptyState.tsx` | hover-only CTA | `+ active:` |
| `charts/SymptomLoadChart.tsx`, `record/CutCLatestRetestTile.tsx`, `progress/HeritageClusterChip.tsx`, `citations/CitationRef.tsx`, `profile/AwayDays.tsx`, `workout/SignalsStrip.tsx`, `workout/YourPlanCard.tsx`, `workout/PerProgramActions.tsx`, `workout/MissedSessionPrompt.tsx`, `workout/ExerciseDetailsSheet.tsx`, `workout/RestTimer.tsx`, `plan/WeekRecoveryCard.tsx`, `onboarding/*` (3), `auth/GoogleAuthButton.tsx`, `VideoModal.tsx`, `FirstRunBanner.tsx`, `AssessmentDueBanner.tsx`, `HipProgressTile.tsx`, `WeeklyNarrativeTile.tsx`, `app/evidence`, `app/report`, `ProgramPreviewClient.tsx` | assorted | codemod |

The codemod is mechanical: for `hover:bg-X` add `active:bg-X`; for `hover:text-X` add `active:text-X focus-visible:text-X`. One PR, no design decisions.

---

## 7. iOS-specific gotchas

- **100vh occurrences:** two, both defensible-but-fixable. `session/BriefView.tsx:127` uses `minHeight: calc(100vh - 64px - env(safe-area-inset-bottom))` — on iOS Safari this over-computes by the URL-bar height while the bar is shown, adding ~60px of dead scroll under the Brief. `app/dev/primitives/page.tsx:40` `min-h-screen` — dev-only, ignore. **Fix BriefView to `100dvh`;** `globals.css:105` already ships a `.dvh-screen` helper and `IntakeClient.tsx:775` already uses `min-h-[100dvh]`, so the pattern is established and BriefView is the sole straggler.
- **PWA standalone top inset: pass.** `AppShell.tsx:146-147` applies `paddingTop: env(safe-area-inset-top)` to the header container unconditionally, so the wordmark/Settings row clears the Dynamic Island without Safari chrome. `manifest` declares `display: standalone`, `orientation: portrait`.
- **Pull-to-refresh: pass, twice over.** `globals.css:120` sets `overscroll-behavior-y: none` on the body app-wide (documented as the iOS-PWA white-gap fix), and `AppShell.tsx:178` additionally sets `contain` on Today's `<main>`. Cannot fire.
- **Orientation:** `orientation: portrait` in the manifest locks the installed PWA. In a browser tab landscape is unlocked and the nav stays `fixed bottom-0` correctly; the heatmap's internal `overflow-x-auto` reflows. No landscape action needed.
- **`/coach` 404 with a stale nav shell — P1.** `persona-strength/dom/03-coach.html` contains a `<nav aria-label="Primary">` whose class string matches current `BottomNav.tsx:50` **exactly**, but whose tabs are the pre-Cut-C five: `TODAY / WEEK / PROGRESS / HISTORY / PROFILE`. There is no `src/app/not-found.tsx` and no `public/404.html`, so this is a **stale Serwist precache serving an obsolete app-shell document for an unrouted path**. Consequences that are mine: the user gets a nav bar advertising four tabs that do not exist, none matches the current route so no active indicator paints, and tapping WEEK/PROGRESS/HISTORY sends them through a redirect chain. In an installed PWA with no URL bar, a 404 with a lying nav is a genuine trap. Fix: ship `src/app/not-found.tsx` rendering inside `AppShell` with a single "Back to Day" CTA in the sticky band, and add a navigation-fallback rule to the SW so unrouted paths serve the *current* shell.

---

## 8. Competitive ergonomic research

Peers from `dev/audits/app/competitor-refs.md`. IDEAS only — Terav's confirm-first engine and rehab-not-fragile positioning override "cleaner is better" more often than not.

| Peer | Reference | Primary-action position | Tap-target convention | Signature gesture | Steal | Reject |
|------|-----------|------------------------|------------------------|-------------------|-------|--------|
| **Runna** | [Navigating the app](https://support.runna.com/en/articles/10473504-your-quick-guide-to-navigating-the-runna-app) · [Adjusting your schedule](https://support.runna.com/en/articles/6206024-adjusting-your-running-schedule) | 5-tab bottom bar (Today / Plan / Activities / Support / Profile); primary log action is a **`+` in the top-right** — an explicit ouch-zone placement for a rare action | Full-width day rows in the plan list; edit affordances live in a dedicated "Rearrange Workouts" mode, not on the row | **Yes — drag-and-drop to reschedule**, but gated: same week or ±1 week, target day must be empty, one workout at a time, and it commits only on an explicit **Save (top-right)** with a warning if the move degrades the plan | The **modal rearrange mode**. Runna does not make rows draggable in the default plan view — you enter a mode. That is exactly how Terav's `/plan` can get move-drag without every scroll gesture becoming a reschedule risk. Also steal the "this change may impact your training" warning: it is confirm-first by another name. | Their `+`-in-top-right for logging. Terav's rest-day/off-plan log is now a *frequent* action (persona-recover's founder-101km case), so it belongs in the card in the primary zone — where `RunSlotCard.tsx:657` already puts it. Correct as-is. |
| **Whoop** | [Home screen revamp](https://the5krunner.com/2025/10/15/whoop-homescreen-gets-a-revamp/) · [The all-new Home](https://support.whoop.com/APP_FEATURES__COACHING/Understanding_Your_WHOOP_Features/The_All-New_Home) | Collapsed **swipeable tabs into one dense scrollable home**; moved the `+` Action button to **centre of the bottom bar**, moved **Coach to the bottom-right corner** so it stays reachable while browsing past days | Bottom bar owns both navigation and the single global create action | Tap-to-expand tiles; no destructive gesture on the home surface | The **bottom-right persistent Coach**. Reviewers specifically noted the old placement was "poorly placed and easily overlooked". Terav's analogue is the proposal-accept gate, currently stranded at 465px of thumb travel on persona-strength:/ (§3). Whoop's fix — put the always-relevant action in the bottom-right of the nav band — is directly transplantable. | Whoop's **swipe-tabs → one dense scroll** consolidation. Terav's `/record` is already 3300px on persona-erratic; more consolidation is the wrong direction. Also reject a centre `+` FAB: Terav has no single global create action, and a FAB would sit exactly where the RPE picker and StickyCta already live. |
| **Hevy** | [Workout rest timer](https://www.hevyapp.com/features/workout-rest-timer/) · [Track workouts](https://www.hevyapp.com/features/track-workouts/) | Rest timer is **inline, near the top of each movement** — not a takeover. `−15 / +15` symmetric adjust pair. RPE is an **opt-in numeric column** on the set row, off by default | Set-row grid with a recently redesigned active/checked state and an **RPE colour scale** | Tap timer to adjust (5s–5min); scroll to 'off' per exercise | The **symmetric −15/+15 pair**. Terav ships `+30s` only (`RestTakeover.tsx:242`), so a user who over-set their rest has no way back and must "Skip rest" — a coarser action than they want. Add `−30s` in the existing `w-24` slot. Also steal the **RPE colour scale**: it would let Terav's four-way picker carry its meaning in colour and drop the unreadable 9px sub-label entirely. | Hevy's **inline timer**. Terav's full-screen takeover is the better call — rest is the only moment the lifter is actually looking at the phone, and the takeover is what makes a 74×66pt RPE target affordable at all. Also reject Hevy's opt-in numeric RPE: a 1–10 numeric scale is exactly the input a fatigued lifter answers badly, which is why `RestTakeover.tsx:23-27` leads with reps-in-reserve. Keep that. |

**Cross-peer pattern:** all three keep a **persistent bottom bar** and put the one always-relevant action in the **bottom-right or bottom-centre**. Runna and Whoop both moved a key action *down and out* of the top-right within the last year, and both published the reachability rationale for doing so. Terav's bottom bar is four navigation tabs and nothing else — no persistent action slot at all. Every peer has one.

**Terav's deliberate divergence:** confirm-first genuinely breaks long-press-to-reschedule. A gesture that commits a plan change without a citation and an explicit Accept violates the core mechanic. Runna's answer — a distinct **rearrange mode** with an explicit Save and an impact warning — is the version Terav can adopt without breaking anything, and it is a better fit than Runna's own default because Terav has something Runna does not: a reason to name *why* the move is risky. Second divergence: do **not** shrink the rest takeover toward Hevy's inline widget for the sake of screen economy. The takeover is what buys the four-way RPE picker its legal tap targets; going inline would force the picker back under 44pt and undo the accuracy fix that shipped today.

---

## 9. Priorities

**P0 (blocking):**
1. `RestTakeover.tsx:204` — `pb-[22px]` → `pb-[calc(22px+env(safe-area-inset-bottom))]`. Bottom-most control currently sits in the home-indicator swipe band on every notched iPhone. Regression introduced with today's takeover work; the correct string already exists at `:311`.

**P1 (do this month):**
2. Hover-without-touch-twin codemod across 33 files (§6). Start with `BottomNav.tsx:87` and `Heatmap.tsx:170` — the nav and the densest tap grid in the app both have zero press feedback.
3. `RestTakeover.tsx:171` z-40 → z-50, plus `inert`/`aria-hidden` on `BottomNav` while a takeover is mounted. The nav is confirmed live in the a11y tree behind a full-screen modal.
4. RPE sub-label: `text-[9px]` → `text-[10px]`, add `px-1`, shorten copy to `4-5+ left / ~3 left / ~2 left / 0-1 left` so all four fit one line at both 393 and 375. Clips at SE today.
5. `RestTakeover.tsx:278,295` — `min-h-11` on "Add a note" (41pt) and "Do something else next" (40pt).
6. Ship `src/app/not-found.tsx` inside `AppShell` + an SW navigation-fallback rule. The stale five-tab 404 shell is a dead end in an installed PWA.
7. persona-strength:/ — mirror the proposal-accept into the sticky band. 465px vs 32px of thumb travel between the required action and the blocked one.
8. persona-muscleup:/ — move "End this program" (`StatusCards.tsx:464`) out of the bottom-most position or behind `ConfirmSheet`.
9. `BriefView.tsx:127` — `100vh` → `100dvh`.

**P2 (nice to have):**
10. `CheckRegionRow.tsx:77` — `gap-1.5` → `gap-2` (6px → 8px adjacency).
11. `programs/page.tsx:240` — add `scroll-pl-4 sm:scroll-pl-6`. Fires 7× per traverse now that the catalog is 8 programs.
12. `RunSlotCard.tsx:657,669` — `pr-2` → `px-2 -ml-2`.
13. `CutCRetestTimeline.tsx:164` — add `overscrollBehaviorX: "contain"`.
14. Shared auto-growing textarea for all six `rows={2}` instances.
15. Add `−30s` alongside `+30s` in the rest footer (Hevy's symmetric pair).
16. Normalise the `/check` CONTEXT segmented rows onto `CheckRegionRow`'s sizing token.

**Closed since 2026-08-21:** `min-h-screen` on shipping routes; heatmap page-level horizontal scroll; future-cell phantom affordances; StickyCta hidden behind the nav (`StickyCta.tsx:67-73`); pull-to-refresh on Today.

---

*Out of scope, flagged and moved on:* `/coach` route existence and the redirect chain from the stale nav → see app-audit-N-landing-alignment. `text-[9px]` as a type-scale decision (I audit it only as a tap-target disambiguator) and `/record`'s 3300px IA → see app-audit-N-visual-craft. `hover:` twins also improve keyboard focus visibility → see app-audit-N-accessibility, but the touch rationale stands on its own.
