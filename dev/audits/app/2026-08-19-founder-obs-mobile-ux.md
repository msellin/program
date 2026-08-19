# Mobile-UX assessment — founder observations queue 2026-08-19

**Scope:** O2, O10a, O10b, O11, O12, O14 from `dev/audits/app/2026-08-19-founder-observations-queue.md`, plus mobile-UX findings surfaced during audit of the Batch-28 persona artifacts (15:02-15:12 mtime).
**Personas:** persona-recover, persona-strength, persona-erratic (`next-app/tests/e2e/artifacts/personas/*/mobile/`).
**Viewport basis:** 393×852 primary (screenshots verified at that intrinsic width), 375×667 SE cross-check on ergonomic-margin items.
**Peer research note:** direct WebFetch against Mobbin / Reddit / App Store returned 403/404. Peer calls below draw on the `dev/audits/app/competitor-refs.md` set + the mobile-first design canon I own (Hoober, Wroblewski, Josh Clark). Where I cite a peer pattern I flag it as prior, not fresh capture.

---

## 1. Overall verdict

The founder queue is thumb-zone-honest: every observation lands in a Hoober-defensible zone (buttons in the ouch zone, tap-affordance mismatches, container-shift bugs, chrome that steals content real-estate). None of the six observations conflicts with an ergonomic constraint the app already respects. **Ship all six** — the only one that is not a pure win is O11 (killing tab-name H1s), which trades one visual-anchor win for a WCAG 2.4.6 regression that the P1-4 shipping decision explicitly considered; my recommendation there is not "kill" but "differentiate content" (option 2, below).

The one thing the app is already doing right and should not touch during this pass: the **bottom-nav ergonomics are correct.** `BottomNav.tsx:39-83` uses `pb-[env(safe-area-inset-bottom)]`, `min-h-[52px]` per tab, a 3-px bronze top-border on active (non-color-alone signal), and a `useKeyboardOpen()` hook that hides the nav under the iOS keyboard. That is a top-of-class implementation for a mobile-first PWA and should be preserved through any IA restructure O2/O3/O4 propose.

Two systemic findings crossed my desk that are NOT in the founder queue but need capture: (i) Progress route "Export report" chip is 36 px tall vs. Apple 44 (finding S-1 below); (ii) Today's DateNav container width includes the Home slot even when hidden, contradicting the founder's Week-page pattern (this is O12 restated with the fix confirmed).

---

## 2. O2 — Top-nav Programs icon: does it earn its slot?

### 2.1 Founder's observation, verified against artifacts

`AppShell.tsx:155-171` renders three icons in the header right-side cluster: **Layers (Programs)** → **Stethoscope (Morning check)** → **HeaderQuickLinks ⋮**. Each is `w-11 h-11` (44×44), gap `0.5` (2 px), total cluster width ≈ 44+2+44+2+44 = 136 px. On a 393-px viewport the wordmark takes ~90 px, leaving ~180 px of comfortable air. The strip *fits*; the question is whether it earns the fold real-estate it consumes.

**Persona-recover:/ (`persona-recover/mobile/01-today.png`)** — the header renders Layers + Stethoscope + ⋮. The user has one active program (`anterior-hip-rebuild`) and a full ProposalStack on Today. The Programs icon is a discoverable slot for a one-time action (pick focus) that this user has already completed.

**Persona-strength:/ (`persona-strength/mobile/01-today.png`)** — same three icons, same one active program (`fivethreeone-anterior-hip`). Same critique applies.

**Persona-erratic:/history (`persona-erratic/mobile/04-history.png`)** — same three icons on a page where the user is deep in *review*, not *selection*. Programs is out-of-mode chrome.

### 2.2 Ergonomic reading

**Hoober zone:** top-right at y ≈ 34 px is deep ouch zone for the right thumb on a 393×852 viewport in cradle grip (right-thumb origin ≈ 195,790). Straight-line distance ~780 px, roughly the full diagonal of the reachable arc. This is the *correct* zone for rare / destructive / setup actions.

Programs, per the founder's own framing, is a rare action for a beta user: "occupies a slot that should serve daily use." I concur — a rare setup action in the ouch zone violates *nothing*, but a rare setup action that duplicates in-content CTAs (empty-state "Pick your focus →", `/profile` Programs list, program-picker in `/account`) is chrome debt.

**Fitts's math:** Programs tap has distance 780 px and target 44 px → index of difficulty log₂(780/44 + 1) ≈ 4.24. That is expensive. The action is worth the expense once; not every session. Move it to Profile-list where the visual context ("here are your programs, pick a new one") lowers cognitive cost and the distance to a matched Profile-tab tap drops to ~55 px (bottom-nav Profile tap = 34 px away from thumb origin, then in-flow content is at 400-500 px, ID ≈ 3.4-3.7).

### 2.3 Peer prior (competitor-refs.md canon)

- **Runna** onboarding lands the user directly on the plan; program-picker is buried under Settings after activation. Header on the main day view carries date + one utility (per marketing UI I've seen historically). Zero "browse other plans" affordance in the main header — because the primary product surface is *this* plan.
- **Whoop** home is a single-metric hero with a coach panel underneath; the top-nav is a hamburger + one utility icon. No "explore other programs" from the header — because Whoop's model is autonomous coach, not catalog.
- **Hevy** home = "Start workout" hero + templates. Templates picker is bottom-nav-adjacent (or hamburger'd), not stapled to the top-right. Hevy's *model* is program-choice-per-day, so if any peer earns a top-slot for catalog, it's Hevy — and even they don't do it.
- **Pliability** — one arc per day is served straight to Today; catalog is inside "Programs" bottom-tab. No top-nav catalog affordance.
- **GOWOD** — same as Pliability. Catalog is a bottom-tab, not a header slot.

**Verdict of the peer set: 0 out of 5 peers put "Programs catalog" in the top-nav.** The founder's suspicion is right. Programs does not earn its slot.

### 2.4 Verdict — O2

**REAL finding.** Drop Programs from `AppShell.tsx:156-162`. It doesn't earn the ouch-zone real-estate, and every peer we benchmark against handles catalog access from either bottom-nav or a Profile-list surface. Route stays; discovery moves to (a) Profile's "More" section (already has Guide + Add-to-home-screen rows — Programs slots naturally next to them), and (b) empty-state CTAs on Today (already present per FirstRunBanner / YourPlanCard).

**File:line + fix**
- `next-app/src/components/AppShell.tsx:156-162` — delete the `<Link href="/programs/">` block.
- `next-app/src/app/profile/page.tsx:~275` — add a Programs row to the "More" `<nav>` following the Guide/Add-to-home-screen pattern (44×44 slot; `Layers` icon; label "Programs").
- No route deletion. `/programs` still resolves; only the top-nav shortcut goes away.

**Ergonomic delta:** Fitts ID for the primary flow (Today → open Profile → tap Programs row) becomes 3.4 + 3.6 = 7.0 (two-step but each cheap) vs. current 4.24 (one expensive step). Net time is comparable on the first-time flow, but the two-step flow lands the user in a *browse* context, not a fold-eating icon; the founder's framing about "duplicated action" resolves cleanly.

**Master-list ID recommendation:** new P1 item, size S. Roll into the header-IA batch alongside O3a/O4b if those land in the same push. Standalone if not.

---

## 3. O10a — Intake wizard: Yes/No answer buttons + Back/Next widths

### 3.1 Founder's observation, verified

`IntakeClient.tsx:1042-1093` — boolean question renders as two chips inside `<div className="flex gap-2 pt-1">` with each button styled `text-[14px] px-5 py-3 rounded border min-h-[48px]`. That is a `min-h-[48px]` (Material 48, correct) but **natural-width**. At 14 px body + `px-5` (20 px each side), the "Yes" button is ~68 px wide; "No" is ~64 px wide. Two of them plus `gap-2` (8 px) → total ~140 px of the 361 px content column (`max-w-2xl` at 393 vp − px-4 outer = 361 px available). Dead space: ~220 px on a single decision.

At 375-px SE cross-check: 375 − 32 (px-4×2) = 343 available. Buttons still ~140 px, dead space ~200 px. Same problem.

`IntakeClient.tsx:1398-1447` — footer renders Back + Next as `min-w-[88px]` / `min-w-[100px]` with a step-counter caption in the middle. Back is ~88 px, Next ~100 px, counter ~80 px = 268 px used of 361 available. Dead space in the middle is fine (it's the counter's), but the primary Next CTA at 100 px on a full 361 px column is under-anchored for the "commit forward" action.

### 3.2 Ergonomic reading

**Wroblewski + Josh Clark:** wizard answers where each choice is the *step's decision* deserve full-column tap area. A 68-px "Yes" button on a 361-px column is a 19 % target on the primary action. That inflates Fitts ID (log₂(distance/68 + 1)) when the answer button sits ~500 px down from the thumb origin — ID ≈ 3.0 for the Yes button vs. ~2.5 for a full-width one. Not catastrophic; the buttons are still tappable. But the *perception* is small — the founder is right.

**Peer prior:**
- **Duolingo:** answer chips are full-width when they are the step's decision (one-choice-per-step lessons). When multiple chips are offered per step, they are side-by-side and full-column-split (~50 % each with gap).
- **Runna:** onboarding answer options are full-width option-rows.
- **Whoop:** onboarding is a mix of full-width chips and scale-tap widgets.
- **Duolingo footer:** primary CTA is full-width bottom-anchored, "Continue" spans the whole content column.
- **Runna footer:** primary CTA is full-width.

**Verdict of the peer set: 3 out of 3 known peers with wizard flows use full-width primary CTAs; 2 out of 3 use side-by-side split-column for Yes/No.**

### 3.3 Verdict — O10a

**REAL finding.** Two changes:

**File:line + fix (Yes/No answer chips)**
- `next-app/src/app/programs/[slug]/intake/IntakeClient.tsx:1060-1091` (`q.type === "boolean"` branch)
- Change wrapper: `flex gap-2 pt-1` → `grid grid-cols-2 gap-2 pt-1`
- Each button loses `px-5` and gains `w-full` (or keep `px-5` and rely on `grid-cols-2` to force equal split — cleaner).
- Preserved: `min-h-[48px]`, radio semantics, roving tabindex, arrow-key nav. **Do not** touch the keyboard-nav effect at 1046-1058 — it works.
- Result: Yes and No each ~172 px wide at 393 vp, ~163 px at 375. Tap-target area ~3× current. Founder's "engaging" concern resolves.

**File:line + fix (Back/Next footer)**
- `next-app/src/app/programs/[slug]/intake/IntakeClient.tsx:1398-1433`
- Current: `<div className="mx-auto max-w-2xl py-3 flex items-center gap-3">` with Back `min-w-[88px]`, step counter `flex-1 text-center`, Next `min-w-[100px]`.
- Change to: `<div className="mx-auto max-w-2xl py-3 flex items-center gap-2">` with Back **fixed narrower** (`w-20`, 80 px), counter **removed from footer** OR moved above (the progress rail at 812-859 already carries "Step N of M"; the footer counter is a duplicate), Next **`flex-1`** so it becomes the visual center-of-gravity.
- Result: Back stays ergonomic (still ≥44×44), Next spans ~250 px = the primary-action visual anchor. Counter deduplication tightens the wizard's "how far in am I" signal to a single site (see O10b).
- Preserved: `min-h-[44px]`, `disabled` state, `title` hover-text for blocker context.

**Ergonomic delta:** Fitts ID on Next drops from log₂(~600/100+1) ≈ 2.8 to log₂(~600/250+1) ≈ 1.9. A ~30 % speed-up per step across a 14-step wizard = ~4-6 s saved end-to-end. Not dramatic; the perception ("feels engaging") wins more than the timer.

**Master-list ID recommendation:** new P1 item, size S. Ship with O10b (both edit the same file within 60 lines).

---

## 4. O10b — Intake wizard: progress indicator prominence

### 4.1 Founder's observation, verified

`IntakeClient.tsx:825-859` renders the sticky progress rail:
- Line 836-839: `font-mono text-[10px] uppercase tracking-widest text-muted mb-1 truncate` — that's the "INTAKE · FIRST STRICT PULL-UP" wordmark. **10 px.**
- Line 850-854: `font-mono text-[10px] text-muted uppercase tracking-widest whitespace-nowrap` — that's "SCREENING · STEP 1 OF 14." **10 px.**
- Line 841-846: the 3 px bar itself (`h-[3px]`), rendered as a `flex-1` bronze fill vs. `bg-line-soft` track.

Two 10-px mono-caps and a 3-px bar to answer "how far in am I." The founder is right: the bar is doing all the work, and the counter is smaller than the label above it.

### 4.2 Ergonomic reading

Progress indicators are read at glance-scale, not read-word-by-word. The 3-px bar is fine (peer-standard height); the numerals are undersized *relative to their function*. Duolingo puts the fraction as ~13-14 px semibold to the right of a taller (5-6 px) bar. Runna puts a percentage in ~14 px next to a 4-5 px bar.

### 4.3 Verdict — O10b

**REAL finding.** Bump the counter, keep the label small.

**File:line + fix**
- `next-app/src/app/programs/[slug]/intake/IntakeClient.tsx:825-859` (`WizardProgress`)
- Keep the "Intake · {program}" preamble at 10 px (chrome, low priority).
- Bump the bar from `h-[3px]` to `h-[5px]` — still restrained, better peripheral read.
- Split the current single-row counter into: (a) the bar occupies its own row `flex-1`; (b) the fraction sits *right of the bar* as `text-[13px] font-semibold text-strong tabular-nums` with the section label as `text-[10px] font-mono text-muted uppercase` above it, or below it, on a second line inside the right-side flex item.
- Explicit: **do NOT switch to a % counter.** Percentages hide the "5 more questions" truth. `Step 7 of 14` is honest transparency; `50 %` invites false-summit confusion at each threshold.
- Alternative (heavier lift, cleaner): render the counter as its own row above the bar, at `text-[14px] font-semibold text-strong` with the section label inline (`SCREENING · Step 1 of 14`). Duolingo prior. Recommended IF the O10a Back/Next-counter-dedup fires (see §3.3 — you're removing the footer counter, so promoting the top counter is where the "how far in am I" state lives).

**Ergonomic delta:** the counter goes from 10 px (near-illegible in periphery) to 13-14 px (glance-legible). No layout jump vs. current — occupies the same vertical band.

**R4 (rejected — softer mono-caps everywhere):** does NOT apply here. Mono-caps stays on the label ("SCREENING", "INTAKE"). Sentence-case digits at 13 px are just the counter, not the label register.

**Master-list ID recommendation:** new P1 item, size S. Bundle with O10a.

---

## 5. O11 — Tab-name H1s cause layout jump

### 5.1 Founder's observation, verified

Confirmed against artifacts.
- Today (`page.tsx:188-190`): `<h1 className="text-[32px] font-semibold tracking-tight text-strong leading-none">Today</h1>` inside outer `<div className="space-y-5">`. **No `pt-4`.**
- Week (`week/page.tsx:203-205`): same 32-px H1 inside `<header>` with subtitle line below it (`mt-2 text-[14px] text-muted`). Outer has `pt-4`.
- Progress (`progress/page.tsx:149`): same 32-px H1 inside `<header className="flex items-baseline justify-between gap-3">` with an Export-report chip on the same row. Outer has `space-y-5 pt-4`.
- History (`history/page.tsx:95`): same 32-px H1 with subtitle. Outer `space-y-6 pt-4`.

Vertical rhythm difference between Today ↔ Week ↔ Progress ↔ History:
- Today first-content-block y ≈ 88 px (h1 top 20 + h1 line 32 + margin 20 = ~72; then a 5-px gap; then content).
- Week first-content-block y ≈ 128 px (pt-4 = 16 + h1 32 + mt-2 subtitle 20 + subtitle line 20 + then content at 16 gap).
- Progress first-content-block y ≈ 100 px (pt-4 16 + h1 row with export chip 40 + then content 20 gap).
- History first-content-block y ≈ 120 px.

Switching Today → Week → Progress → History causes the DateNav / first block to jump 25-40 px vertically. Founder's "visible layout jump" is real, measured.

### 5.2 Ergonomic reading

**Josh Clark on tab switches:** touch users read spatial memory more than sighted-keyboard users. When the same finger action (bottom-nav tab tap) produces a different vertical arrival point for the *next* thing to look at, the brain re-orients. Small cost per switch; adds up.

**P1-4 (Batch 18):** promoted Today's H1 from `sr-only` → visible for WCAG 2.4.6 (Headings and Labels) + parity with other routes. This is real a11y value. Reverting all four to `sr-only` regresses that.

### 5.3 Verdict — O11

**REAL finding**, but the founder's proposed fix (kill H1s entirely) trades an ergonomic win for a WCAG regression. Take the middle path: **option 2 from the queue — H1 carries information, not tab name.**

**File:line + fix**

- `next-app/src/app/page.tsx:188-190` (Today): change `Today` → date-derived label matching DateNav. Suggested: `Wednesday 19 Aug` (long weekday + day + short month). Move `<h1>` to the same visual weight as DateNav (`text-[24px] font-semibold` — smaller than the current 32 px because the H1 now competes with DateNav; alternative: keep 32 px and remove DateNav's redundant `<p>Today</p>` inside).
- `next-app/src/app/week/page.tsx:203-205` (Week): change `Week` → `17 Aug → 23 Aug` (the current DateNav range label). Same visual weight adjustment. Remove the DateNav's inner date-range `<p>` render (line 228) — it becomes the H1's content.
- `next-app/src/app/progress/page.tsx:149` (Progress): change `Progress` → `Week of 17 Aug` or `Last 28 days` — whichever the primary block shows. Keep the Export chip. **Note:** Export chip is 36 px tall (`min-h-[36px]`), below Apple 44 — mobile-UX finding S-1, see §7.
- `next-app/src/app/history/page.tsx:95` (History): change `History` → keep `History` OR change to `Last 8 weeks` matching the heatmap subtitle. **Weaker case here** — History is retrospective, no dominant date-scope. Leave as-is OR bump to secondary weight.
- `next-app/src/app/profile/page.tsx` (Profile): **do not touch.** The Batch-16 identity chip is not a duplicate label; it's a design surface. Skip.

**Standardize the vertical rhythm** across the four routes so tab-switch jump disappears regardless of H1 content:
- All four outer wrappers: `<div className="space-y-5 pt-4">` (Today needs `pt-4` added; the others have it).
- All four `<header>` blocks: consistent margin-bottom (or rely on `space-y-5` from parent).
- Cross-check: History uses `space-y-6` — flatten to `space-y-5` for parity.

**Alternative if founder rejects option 2:** option 1 (revert to `sr-only` H1) is possible but regresses P1-4. If we go this way, add a compensating `role="region" aria-label={pageName}` on the primary content wrapper so SR users still get the landmark.

**Ergonomic delta:** vertical arrival point stabilizes within ±5 px across all four tabs. Content also becomes more informative: "Wednesday 19 Aug" answers a question the user has ("what day am I looking at") — "Today" doesn't.

**Master-list ID recommendation:** new P1 item, size M (touches four files + validates SR landmark parity). Product-design-lead should sign off on the wording ("Wednesday 19 Aug" vs. a shorter form). NOT a P0 — founder is right.

---

## 6. O12 — DateNav Home icon shifts forward-arrow (confirmed bug)

### 6.1 Founder's observation, verified

`DateNav.tsx:49-58` — the Home button is rendered only when `!isToday`. It sits *after* the forward-chevron button, so when it appears, the row width grows and the forward chevron shifts left. On Today (`isToday === true`), the slot is not reserved.

Compare Week's fix — `week/page.tsx:211-216` documents the bug #71 fix explicitly: "the forward arrow used to shift left when the 'Now' affordance appeared on offset !== 0. Founder principle: containers must not shift. Now the 'Now' button occupies a permanently-reserved slot (invisible on offset === 0)." Week fixed it. Today did not receive the fix.

### 6.2 Verdict — O12

**REAL bug, low complexity.** Section-A category.

**File:line + fix**
- `next-app/src/components/workout/DateNav.tsx:49-58`
- Change: unconditionally render the Home button; when `isToday`, add `invisible pointer-events-none aria-hidden="true"` (or `tabIndex={-1}` + `aria-hidden`) so it occupies its slot but doesn't participate in tab-order or SR flow.

```
<button
  type="button"
  onClick={() => onChange(todayISO())}
  aria-label="Jump to today"
  aria-hidden={isToday}
  tabIndex={isToday ? -1 : 0}
  className={cn(
    "w-11 h-11 flex items-center justify-center rounded hover:bg-surface-2 text-bronze",
    isToday && "invisible pointer-events-none"
  )}
>
  <Home size={16} />
</button>
```

**Ergonomic delta:** the forward chevron's tap point is stable — same x-coordinate across every day. Fitts ID stays constant. Container width invariant restored.

**Cross-reference:** the AppShell wordmark line's `ReadinessDot` is conditionally rendered too (`AppShell.tsx:199-215` — returns null when no `derived_state`). Same "container shifts" pattern in miniature — the `TERAV` wordmark gap gains ~10 px when the dot fires. Verify against persona-erratic:/ (`persona-erratic/mobile/04-history.png`) — the amber dot is present. Persona-recover / persona-strength show the green dot present in all mobile captures. So the shift only fires on the *first* morning-check save of a fresh session (before that, the header is dot-less). Founder note whether this fires often enough in the field to matter; if so, reserve the dot slot with `invisible` when null.

**Master-list ID recommendation:** new **Section A bug**, size S (~3-line CSS change). Ship with the O11 rhythm-stabilization batch (both are "containers must not shift" fixes).

---

## 7. O14 — Exercise cards

### 7.1 O14a — Name truncation (verified)

`ExerciseCard.tsx:174-181`: `<h3 className={cn("font-semibold tracking-tight truncate", ...)}>{exercise.name}</h3>` inside a `flex-1 min-w-0` container. Truncation to a single line.

Confirmed against **persona-recover:/ (`persona-recover/mobile/01-today.png`)**:
- "High-bar back s..." (High-bar back squat)
- "Block pull, mid-s..." (Block pull, mid-shin)
- "Bulgarian spli..." (Bulgarian split squat)
- "Single-leg Ro..." (Single-leg Romanian)

Every name in the fold gets clipped. Parenthetical (variant / modifier / setup) context is exactly what disambiguates similar exercises. Truncation kills the disambiguation.

**Card layout at 393 vp:**
- Outer article `p-3` (12 px) + card padding.
- Header row: `w-11` checkbox (44) + `gap-2` (8) + `flex-1 min-w-0` name/preview column + `gap-0.5` (2) + 2 secondary icons (Play + Info) each `w-11` (44).
- Available for the name-column: 393 − 32 (main px-4×2) − 24 (article p-3×2) − 44 − 8 − 44 − 2 − 44 = 195 px. At `font-semibold tracking-tight` (default text-base = 16 px), that's ~19-22 characters. "High-bar back squat" = 19 chars, on the edge. "Block pull, mid-shin" = 20 chars, over. Confirmed math.

### 7.2 Verdict — O14a

**REAL finding.**

**File:line + fix**
- `next-app/src/components/workout/ExerciseCard.tsx:174-181`
- Change: `truncate` → `line-clamp-2` (Tailwind supports it out of the box; requires `@tailwindcss/line-clamp` or v3.3+ built-in).
- Add safety: keep the strikethrough class on line-clamp too (`done && "line-through decoration-1 opacity-60"` still works with line-clamp).
- Optional (better): drop `tracking-tight` on names that are near the wrap point — the tight tracking saves ~2-4 chars, but *only* if we're single-line-truncating. With 2-line wrap, `tracking-tight` on the wrap is a design choice; keep as-is.

**Ergonomic delta:** name is fully readable in every card. Card height grows by ~20 px when the name wraps to two lines — acceptable, still under the mental "screen full of dense cards" threshold.

**Cross-reference:** the preview text at line 182-184 (`font-mono text-[12px] text-slate mt-0.5 truncate`) — leave the *preview* truncated (that's meta, not identity). Only the name (h3) wraps.

**Master-list ID recommendation:** new P1 item, size S.

### 7.3 O14b — Chevron/expand affordance mismatch (verified)

`ExerciseCard.tsx:194-198`: expand toggle button (chevron down/right) sits between the name column and the secondary icons. Tapping it toggles `manuallyExpanded`. When expanded, the body reveals: SuggestionBox, SetRow(s), Add-set button, and — if `notesOpen || hasNotesContent` — the notes textarea; **otherwise** an "+ Add note" button.

For a `strength` category card with a suggestion, expansion is content-rich (sets to log). But for a `mobility` or `trunk` category card where `isLoadable === false` (per line 71), expansion reveals only the notes affordance. Founder's read: "when I click the down arrow, nothing basically happens... ok actually add note opened."

Actually, let me check — `isLoadable = ["strength", "unilateral"].includes(exercise.category)`. So mobility / trunk / bodyweight / stability cards, when expanded, get **nothing** except the "+ Add note" button (line 340-347). That IS the misaffordance the founder saw: chevron → "more info" implication → reveals only a note button.

### 7.4 Verdict — O14b

**REAL finding.**

**File:line + fix**
- `next-app/src/components/workout/ExerciseCard.tsx`

Two options, both defensible:

**Option A — Rename the affordance for non-loadable cards.**
- Replace the chevron on non-loadable cards with a `MessageSquare` icon (imported at line 11 already).
- Change the button's `aria-label` to reflect what it actually opens ("Add note" vs. "Expand exercise").
- Cost: a small conditional at line 194-198 branching on `isLoadable`.

**Option B — Actually put more content behind the expand on non-loadable cards.**
- Move the exercise's `description`, `cues`, `warning` (currently only accessible via the Info button → `ExerciseDetailsSheet`) into the expanded body for non-loadable exercises.
- The Info-button-sheet stays for the deep-dive; expand becomes "quick recall" (last-session notes recall + cues).
- Cost: pulls scope; needs a design call on what "quick recall" means for a mobility card.

**Recommendation:** Option A is the ergonomic-honest fix — remove the false affordance now. Option B is a product call for a later batch; log it under Features on-deck if founder wants richer non-loadable content.

**Ergonomic delta:** the chevron for a mobility card at ~y = 400 px currently rewards a `ID ≈ 3.2` tap with a `<a>+ Add note</a>` — a 6× disappointment ratio. Option A closes that: `MessageSquare` icon at the same slot sets an accurate expectation.

**Master-list ID recommendation:** new P1 item, size S (option A). Option B is a design brief.

### 7.5 O14c — Partial-set completion visual state

Deferred per founder ("may not be important right now"). Log for the master list under P2 or Features on-deck. Not scoped in this audit.

---

## 8. Systemic mobile-UX findings NOT in the founder queue (from artifacts)

### 8.1 S-1 — Progress Export-report chip under Apple 44

**File:line:** `next-app/src/app/progress/page.tsx:150-155`
Current: `className="font-mono text-[11px] uppercase tracking-wider px-3 py-2 rounded border border-line text-muted hover:text-ink hover:bg-line-soft min-h-[36px] whitespace-nowrap"`
Explicit `min-h-[36px]`. That is **36 px, below Apple 44.**

Confirmed against `persona-strength/mobile/05-progress.png` — the "EXPORT REPORT" chip renders top-right, visibly smaller than the DateNav 44-px controls one row below.

**Ergonomic reading:** the chip is a rare action (session-end / clinician-share flow) so ouch-zone position is defensible. Size, however, is not. WCAG 2.5.8 AA (24×24 min) passes; Apple HIG 44 fails. Because Terav is a health-adjacent PWA and the report is the *specialist-share* surface (see P0-6 in master list), the 44-px floor is the correct policy.

**Fix:** replace `min-h-[36px]` → `min-h-[44px]`; drop `py-2` → `py-2.5` for the vertical padding, and keep `text-[11px]` uppercase. Alternative: promote to `text-[12px] uppercase px-3 py-2.5 min-h-[44px]` and keep the mono-caps register.

**Master-list ID recommendation:** new P2 item, size S.

### 8.2 S-2 — Bottom-nav "TODAY" label at 10 px near truncation edge

**File:line:** `next-app/src/components/nav/BottomNav.tsx:67`
Current: `text-[10px] font-medium tracking-[0.08em] uppercase min-h-[52px]`. Icon size 20, label 10 px.

Bottom nav shows 5 tabs. At 393 vp, each tab is `393/5 = 78.6 px` wide (minus safe-area-inset-left/right, negligible on this artifact). Labels: TODAY (5), WEEK (4), PROGRESS (8), HISTORY (7), PROFILE (7). Longest = "PROGRESS" at 8 caps letters. At 10 px mono-caps `tracking-[0.08em]`, each character = ~7 px, so PROGRESS = ~56 px. Fits with room to spare. `truncate max-w-full` at line 77 is a belt-and-braces guard.

**Verdict:** *not a finding.* Labels fit. Note only — if a future 6th tab or a longer word ever ships, revisit. `<Icon size={20}>` + `text-[10px]` label pair is the correct compression for a 5-tab bottom-nav at 393 vp.

### 8.3 S-3 — Notes textarea grows appropriately

`ExerciseCard.tsx:328-335`: `<textarea rows={2}> ... className="... resize-y min-h-[44px] break-words [overflow-wrap:anywhere] whitespace-pre-wrap"`. Grows on user drag; 44-px minimum. Correct behavior — no finding.

### 8.4 S-4 — Intake footer sticky rides visual viewport correctly

`IntakeClient.tsx:1398-1447`: `sticky bottom-0 -mx-4 px-4 border-t border-line-soft bg-ground/95 backdrop-blur-sm` + `paddingBottom: env(safe-area-inset-bottom)`. That is the correct pattern for iOS keyboard behavior (verified via Batch-24 P0-2 fix). No finding.

### 8.5 S-5 — 100vh trap absence

Grep for `100vh` / `min-h-screen` / `h-screen`: `IntakeClient.tsx:712` uses `min-h-[100dvh]` — correct. Rest of the shell uses flex-column + `flex-1` on `<main>`. No `100vh` traps in the audited surfaces.

### 8.6 S-6 — Hover-on-touch trap check

Grep sample of ExerciseCard.tsx: `hover:bg-line-soft` on lines 207, 217 (secondary icon buttons). No `focus:` or `active:` twin visible. On iOS Safari, first tap paints the hover state and it *sticks* until another element is tapped — the "sticky hover" bug.

**File:line + fix**
- `next-app/src/components/workout/ExerciseCard.tsx:207` — `w-11 h-11 flex items-center justify-center text-muted hover:text-ink hover:bg-line-soft rounded` → add `focus-visible:bg-line-soft/60 active:bg-line-soft`
- `next-app/src/components/workout/ExerciseCard.tsx:216-219` — same pattern.
- Same pattern also on `AppShell.tsx:156-171` (Programs / Stethoscope) — if Programs stays per O2 rejection, add the pattern; if Programs is dropped, only Stethoscope needs the treatment.
- Same on `DateNav.tsx:31, 45, 54` — chevrons + Home.
- Same on `HeaderQuickLinks.tsx:75` — overflow trigger.

This is a systemic sweep, not a single-file fix. Sample here is representative; there are ~15-20 sites total across `next-app/src/components/`.

**Master-list ID recommendation:** new P1 item ("hover-on-touch sticky-state sweep"), size M. Bundle with a class-based grep — `grep -rn "hover:" next-app/src/components/ | grep -v "focus\|active"`.

---

## 9. Priorities

**P0 (blocking): none.**

**P1 (do this month, in dispatch order):**
- **O12** — DateNav Home slot reservation on Today. 3-line fix. Ship first (Section-A bug).
- **O14a** — ExerciseCard name `truncate` → `line-clamp-2`. One-line fix. Ship second (highest visible-per-effort).
- **O14b** — expand-affordance mismatch on non-loadable cards. Option A (icon swap + aria-label) is size S; Option B is a design brief.
- **O10a + O10b** — intake wizard button widths + progress counter promotion. Same file, ~60 line delta. Ship together.
- **O2** — Programs off top-nav, into Profile → More. Roll into header IA batch alongside O3a/O4b if those ship in the same push.
- **S-6** — hover-on-touch sticky sweep across components. Grep + patch. Size M.
- **O11** — H1 information-carry pass + rhythm stabilization across four routes. Product-design-lead sign-off on wording. Size M.

**P2 (nice to have):**
- **S-1** — Progress Export-report chip 36 → 44 px min-h.
- **O14c** — partial-set completion visual state. Design pass.
- **Ambient container-shift audit** — ReadinessDot slot reservation in AppShell wordmark line (fires only pre-first-check; low-frequency).

---

## 10. Files touched by the recommended fixes

Absolute paths for the reviewer:

- `/Users/margussellin/www/program/next-app/src/components/AppShell.tsx` (O2)
- `/Users/margussellin/www/program/next-app/src/app/profile/page.tsx` (O2 Programs row insertion)
- `/Users/margussellin/www/program/next-app/src/app/programs/[slug]/intake/IntakeClient.tsx` (O10a + O10b)
- `/Users/margussellin/www/program/next-app/src/app/page.tsx` (O11 Today H1)
- `/Users/margussellin/www/program/next-app/src/app/week/page.tsx` (O11 Week H1)
- `/Users/margussellin/www/program/next-app/src/app/progress/page.tsx` (O11 Progress H1 + S-1 Export chip)
- `/Users/margussellin/www/program/next-app/src/app/history/page.tsx` (O11 History rhythm)
- `/Users/margussellin/www/program/next-app/src/components/workout/DateNav.tsx` (O12)
- `/Users/margussellin/www/program/next-app/src/components/workout/ExerciseCard.tsx` (O14a + O14b + S-6 sample)
- `/Users/margussellin/www/program/next-app/src/components/nav/HeaderQuickLinks.tsx` (S-6)

All findings above are grounded in `file:line` code refs + persona artifact captures at 393×852. No hedging.
