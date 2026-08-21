# Today + Week + Session — mobile ergonomics brainstorm

**Lens:** thumb-zone travel, gesture language, and date-scoped navigation at 393×852.
**Scope:** the Today ↔ Week ↔ Session triangle, not the whole app.
**Anchor viewport:** iPhone 15/14/13 non-mini (393 × 852), SE cross-check at 375 × 667.
**Grip model assumed:** cradle-grip right thumb, origin ~ x=195, y=790 (Hoober's dominant one-thumb model).

---

## 1. Navigation-friction inventory (~200 words)

The Today ↔ Week ↔ Session flow leaks friction in three specific *movements*, not "small tap targets":

1. **The DateNav is stranded at the top third of Today (y ≈ 245–305).** From a right-thumb cradle origin at y ≈ 790, that's a 500 px vertical reach for the chevrons — the exact stretch Hoober labels "ouch." Yet the DateNav is what a user touches *most often* to answer "what's tomorrow?" A frequency-vs-reach mismatch: high-frequency control in the ouch zone.
2. **Two different date primitives don't share state.** DateNav on Today shifts single days (`Fri 21 Aug`); Week's own week-range shifter (`17 Aug → 23 Aug`) shifts by 7. Move Today to tomorrow, tap the **Week** tab in the bottom nav, and you land on the current week with today highlighted — your context is thrown away. This is a cognitive re-orient every time the user switches tabs.
3. **"Open session →" is a link that clones the current view under a new URL.** From multi-track Today (three visible session cards), the user must scroll ~200 px down to reach the second card's CTA, then commit to a route change that visually looks identical to the surface they left. On multitrack + concurrent programs, the *primary* thumb-drop zone (bottom third) is occupied by whichever card scrolled into it — not necessarily the one the user intended.

Add multi-track: three bronze "Open session" CTAs vertically stacked means the user is doing precision-vertical-flick scrolling on a bright chrome background. It's ergonomic noise.

---

## 2. Three alternative navigation models

### Model A — **Swipe Timeline** (horizontal day pager)

- **Gesture language:** Today becomes a *horizontal pager* of day cards. Swipe left → tomorrow, swipe right → yesterday. Chevrons remain as accessibility fallback but move to the bottom right (thumb-primary). Native peek: 24 px of adjacent-day content bleeds in from the edge so the user *sees* there's more without hint text.
- **How DateNav lives:** DateNav is *promoted* into a persistent bottom-anchored strip (48 px tall, sits directly above BottomNav) showing three date pills: `‹ Thu` · **`Fri · Today`** · `Sat ›`. Tap a pill = jump to that day (Fitts-optimal, 48 px targets in the primary thumb zone). The current-day label at the top of the content area becomes purely informational — no chevrons up there.
- **Multi-track handling:** each day-page becomes one vertical stack of program cards for *that day*. Swiping horizontally moves the whole stack — the user's mental model is "browse days," not "browse programs × days." A collapsed "3 tracks" chip at the top summarizes the day's contributors.
- **Session opening flow:** browse to tomorrow (1 swipe) → tap "Open session →" on the target card (1 tap). **2 gestures.** But the "session" surface itself becomes redundant — the day page IS the session. `/session/[slug]` could reduce to a scroll-lock mode where non-focus tracks collapse.
- **Peer inspiration:** Peloton's Home tab uses a horizontal date-scroller for scheduled classes. Runna's calendar-strip lets you swipe forward to preview upcoming runs. Whoop's Overview has a horizontal day-strip pinned near the bottom. Freeletics also uses horizontal week-pager.
- **Tradeoffs:**
  - Gives up: single-scroll browsing of "all my sessions this week." You can't see Fri + Sat together on one screen without swiping.
  - iOS gesture conflict: horizontal swipe from the *left edge* is iOS back-navigation — must disable the leftmost 20 px of swipe capture. Manageable but non-trivial.
  - Cold-hands / gloves: swipes are less reliable than taps. Chevrons must stay.

```
+---------------------------+  y=0
|  TERAV       [⚙]         |  header (24 px in ouch zone)
+---------------------------+  y=110
|  Fri 21 Aug · Today       |  date label — no chevrons
|                           |
|  ┌───────────────────────┐|
|  │ Engine Builder        ││ ← swipe left/right on this
|  │ 1 block · 1 exercise  ││   whole content area
|  │ [Open session ▶]      ││
|  └───────────────────────┘|
|                           |
|  ┌───────────────────────┐|
|  │ Concurrent Strength   ││
|  │ 1 block · 0 exercises ││
|  │ [Open session ▶]      ││
|  └───────────────────────┘|
|                           |  y=670
+---------------------------+
| ‹ Thu   [Fri · Today]  Sat ›|  DateNav strip (48 px, primary zone)
+---------------------------+  y=735
| TODAY  WEEK  PROG  HIST  ⓤ|  BottomNav
+---------------------------+  y=852
```

### Model B — **Day Rail** (vertical scrubbable rail on the left edge)

- **Gesture language:** a 40 px-wide vertical rail pinned to the *left* edge of Today shows 7 day-cells (Mon–Sun) as compact circles with status dots. The active day is enlarged (52 px). Tap a cell → jump. Drag vertically along the rail = scrub through days with haptic tick. Content area to the right stays scroll-vertical.
- **How DateNav lives:** DateNav is replaced by the rail. No chevrons; no "Today" home button (tap the enlarged current day). Full-week context always visible without navigation.
- **Multi-track handling:** the day-cell shows up to 3 mini-dots (one per program) with track colors — persona-multitrack instantly sees "which days have all three tracks converge." The content area to the right still stacks program cards.
- **Session opening flow:** tap a day on the rail (1 tap in primary zone if rail bottom is at y ≈ 700+) → tap "Open session" on the target card (1 tap). **2 taps.** Rail is *always* thumb-reachable because it hugs the left edge — natural for left-handed users, and reachable for right-thumb users via mid-screen sweep.
- **Peer inspiration:** Google Calendar's month-strip on iPad-portrait; some Garmin Connect layouts. Zwift Companion also has a vertical calendar rail in its "Plan" surface. The pattern is uncommon on phones — it's a bet, not a copy.
- **Tradeoffs:**
  - Gives up: 40 px of horizontal content real estate. On 393 px that's 10% — noticeable in a stat-dense card.
  - Right-handed thumb has to cross the phone to hit the rail — bad ergonomics *unless* we mirror the rail to the right edge under user preference (like iOS's reachable-side setting). Not great by default.
  - Landscape orientation looks weird with a tall rail on the side.

```
+---+-----------------------+  y=0
| M | TERAV       [⚙]      |
|17 |                       |
+---+                       |
| T | Fri 21 Aug · Today    |
|18 |                       |
+---+ ┌───────────────────┐ |
| W | │ Engine Builder    │ |
|19●| │ 1 block · 1 ex    │ |
+---+ │ [Open session ▶]  │ |
| T | └───────────────────┘ |
|20●|                       |
+---+ ┌───────────────────┐ |
|●F●| │ Concurrent Strength│ |
|●21│ │ 1 block · 0 ex    │ |  ← rail cells show
+---+ │ [Open session ▶]  │ |    per-track dots
| S | └───────────────────┘ |
|22 |                       |
+---+                       |
| S |                       |
|23 |                       |
+---+-----------------------+  y=735
| TODAY  WEEK  PROG  HIST  ⓤ|
+---------------------------+  y=852
```

### Model C — **Bottom-Sheet Session Picker** (context-preserving overlay)

- **Gesture language:** Today stays a static single-page dashboard for **today only** (no DateNav at all). To browse another day, the user drags up a bottom sheet (or taps a persistent "Browse days ▲" chip pinned above BottomNav). The sheet slides up covering the bottom two-thirds with a horizontally-scrolling day strip + full session preview for the selected day. Dismiss = drag down / tap outside.
- **How DateNav lives:** DateNav is *deleted from Today entirely*. It becomes a bottom-sheet element only, appearing on demand. Today reverts to being "what's happening NOW."
- **Multi-track handling:** the sheet's preview shows the selected day's program cards stacked, same as Today does but scoped to the picked date. The user never leaves Today's route until they commit to "Open session" — the sheet is a lightweight preview layer.
- **Session opening flow:** tap "Browse days ▲" chip (1 tap in primary zone) → tap the day cell in the sheet (1 tap in primary zone since the sheet's day strip is bottom-anchored) → tap "Open session" (1 tap). **3 taps** but every tap is in the bottom third. Zero reach into the ouch zone.
- **Peer inspiration:** Apple Fitness+ uses a bottom sheet to pick a workout preview. Oura's Home surfaces detailed data via bottom sheets rather than route changes. Whoop's "Recovery" bottom sheet works the same way. Hevy uses a bottom-sheet for exercise substitution in mid-workout. This is the *most iOS-native* of the three models.
- **Tradeoffs:**
  - Gives up: at-a-glance "look at tomorrow" without any tap. You must invoke the sheet.
  - The Week tab starts to look redundant — if the sheet gives day-scoped preview, Week is a longer-range version of the same. Might force a Week refactor (potentially a *good* thing — Cut C already killed Progress; killing Week wouldn't be crazy).
  - Bottom-sheet drag conflicts with the BottomNav below it — sheet dismissal must not accidentally hit a nav tab. Need a 12 px dead zone at the sheet's bottom edge, plus an "X" close in the top-right of the sheet header (in the ouch zone — but rare action).

```
+---------------------------+  y=0
|  TERAV       [⚙]         |  header
+---------------------------+  y=110
|                           |
|  Today · Fri 21 Aug       |  no DateNav — read-only label
|                           |
|  ┌───────────────────────┐|
|  │ Engine Builder        ││
|  │ [Open session ▶]      ││
|  └───────────────────────┘|
|                           |
|  ┌───────────────────────┐|
|  │ Concurrent Strength   ││
|  │ [Open session ▶]      ││
|  └───────────────────────┘|
|                           |  y=680
+---------------------------+
|  ▲ Browse other days      |  sheet-open chip (48 px primary)
+---------------------------+  y=735
| TODAY  WEEK  PROG  HIST  ⓤ|
+---------------------------+  y=852

              ↓ tap chip ↓

+---------------------------+  y=0
|                           |
|  Today content (dimmed)   |
|                           |
+---------------------------+  y=340  ← sheet edge
| ═══                       |  drag handle
| Browse a day              |
| ‹ [17] 18  19  20  ●21  22 23 ›|
|                           |
| Fri 21 Aug · Today        |
| Engine Builder — 1 block  |
| Concurrent — 1 block      |
| Overhead — 3 blocks       |
|                           |
| [Open Fri's sessions ▶]   |  primary CTA in thumb zone
+---------------------------+  y=735
| TODAY  WEEK  PROG  HIST  ⓤ|
+---------------------------+
```

---

## 3. Thumb-zone map (for the recommended model, C — Bottom Sheet)

Right-thumb cradle-grip, origin at ~ x=195, y=790.

```
+---------------------------+  y=0
|   OUCH ZONE (rare/dest)   |  y=0–284 (top third)
|                           |
|  · TERAV wordmark         |  y=35 → decorative, no tap needed
|  · [⚙] settings icon      |  y=35, x=355 → rare
|  · Date label (read-only) |  y=110 → no tap = OK
|                           |
+---------------------------+  y=284
|   REACHABLE ZONE          |  y=284–568 (middle third)
|                           |
|  · Program card 1         |
|  · [Open session] CTA     |  y=440 → reach OK, most-used card
|  · Program card 2         |
|  · [Open session] CTA     |  y=580 → borderline, ergonomic ceiling
|                           |
+---------------------------+  y=568
|   PRIMARY ZONE            |  y=568–852 (bottom third)
|                           |
|  · [▲ Browse other days]  |  y=680, full-width chip = huge target
|  · Bottom-sheet handle    |  y=735 = drag origin in prime area
|  · TODAY | WEEK | PROG    |  y=790, BottomNav tabs
|  · HIST | PROFILE         |
|  · home indicator         |  y=832 → safe-area padding respected
+---------------------------+  y=852

When sheet is open:
  Day strip pills          y=470 → REACHABLE (mid-third top)
  [Open Fri's sessions]    y=680 → PRIMARY (thumb-optimal)
```

**Key interactions and their zone placement:**

| Interaction | y-position | Zone | Fitts distance from thumb origin (390, 790) |
|---|---|---|---|
| Browse days sheet-open chip | 680 | Primary | ~110 px |
| Bottom-sheet primary CTA | 680 | Primary | ~110 px |
| BottomNav Today tab | 790 | Primary | ~155 px |
| BottomNav Week tab | 790 | Primary | ~80 px |
| "Open session" card 1 | ~440 | Reachable | ~350 px |
| "Open session" card 2 | ~580 | Reachable/Primary edge | ~215 px |
| Settings gear | 35 | Ouch | ~760 px (rare = OK) |

---

## 4. Gesture inventory (recommended model — C)

**Introduces:**
- **Bottom-sheet drag-up / drag-down.** New but iOS-native, discoverable via the "▲ Browse other days" chip.
- **Horizontal day-strip scroll inside the sheet.** Fingertip flick, no snap required — the pills are self-contained tap targets.

**Eliminates:**
- The **top-of-page DateNav chevron tapping loop** — gone. This is a big ergonomic win.
- The **mismatch between Today's day-shifter and Week's week-shifter** — the sheet is the *only* date-scoping affordance, shared across surfaces.

**Preserves (does not touch):**
- No swipes for day navigation (avoids conflict with iOS edge-back-swipe on the left edge).
- No pull-to-refresh (already blocked by overscroll-behavior; the model doesn't need it).
- No long-press (leaves that gesture free for future contextual menus).
- No drag-to-reschedule (R7 preserved — reschedule remains a confirm-first Move action inside the sheet or via Week's expanded row).

**Cross-checks:**
- R7 compliance: the sheet doesn't allow drag-to-move a session between days. Any date change to a *session* still opens ConfirmSheet.
- Rehab firewall: the sheet groups per program; anterior-hip-rebuild stays visually segregated inside the day preview, no aggregate metrics.
- Static export compatible: the sheet is a client-side component, no dynamic routing needed. URL doesn't change when the sheet opens.

---

## 5. Recommendation

**Bet on Model C — Bottom-Sheet Session Picker.**

**Why:**
1. It respects the fundamental frequency principle: high-frequency date browsing moves *into* the primary thumb zone; low-frequency route switching (BottomNav) stays where it is; low-frequency destructive/settings actions stay in the ouch zone. Every interaction lands where its frequency deserves.
2. It **collapses semantic ambiguity**. Today becomes truly "now" — no "Today, but I've shifted to tomorrow" confusion. The date-context bug the founder reported (`8edfe46`) fundamentally exists because Today wears two hats at once. C strips a hat.
3. **It scales to the Cut C world.** Progress + History are collapsing into Record; if C works, Week can eventually collapse into "sheet + agenda" without a whole new tab.
4. It is the **most iOS-native** of the three — Apple HIG, Fitness+, and peer competitors (Oura, Whoop, Hevy) all validate the sheet-for-context-change pattern. Users already know the gesture.
5. Model A (Swipe Timeline) is more ergonomically elegant per-gesture but conflicts with iOS edge-back-swipe and hurts accessibility for glove-users and one-thumb-while-walking. Model B (Day Rail) is a novel bet but sacrifices horizontal content real estate and crosses the thumb across the phone.

**Device-scenario tests to run before committing:**

1. **One-thumb-while-walking test** — sheet open, day-strip scroll, primary CTA tap. Can the user complete "browse Tue → open session" with a single thumb while walking, no correction taps? (Baseline: the current DateNav-at-top fails this — thumb can't reach y=270 while stabilizing the phone with the same hand.)
2. **iPhone SE 375 × 667 cross-check** — the sheet takes ~65% of screen height on the taller phone; on SE the day-strip pills and the primary CTA must still fit above the safe-area. Verify no overlap with home-indicator zone.
3. **Cold-hands / gloves test** — 48 px pill day-strip should hit reliably even with imprecise touches. Verify hit-slop is generous (min 44, aim 52).
4. **Bottom-sheet dismissal vs. BottomNav tap** — sitting on Week or Today, sheet open. Does a downward flick to dismiss ever accidentally land on a BottomNav tab? Instrument with 100 trial taps at boundary y positions.
5. **Sheet + iOS keyboard interaction** — if the sheet ever contains a text input (e.g., "note this day"), does the keyboard shove the sheet up correctly or trap the CTA behind the keyboard? (The BottomNav already handles this with `useKeyboardOpen`; the sheet must adopt the same pattern.)
6. **PWA-installed standalone mode** — sheet header respects `env(safe-area-inset-top)` when partially expanded to a "full sheet" state. Verify with the dynamic island group.
7. **Multi-track load: persona-multitrack with 3+ programs** — the day preview in the sheet lists 3+ program cards. Does the sheet grow past 90% of viewport height? If so, the sheet needs internal scroll — verify momentum doesn't fight the sheet's own drag-to-dismiss gesture.

**The one gesture I'd fight hardest for:** the **bottom-anchored "▲ Browse other days" chip** as the sheet trigger. Not a top-nav chevron. Not a swipe. A named, tappable, unambiguous 48 px pill in the primary thumb zone. Discoverable, accessible, satisfying, and it eliminates the entire ergonomic sin of putting a high-frequency date shifter above y=300.
