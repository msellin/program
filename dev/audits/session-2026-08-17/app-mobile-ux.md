# app.terav.fit — Mobile UX audit (2026-08-17)

Viewport basis: 393×852 primary, 375×667 SE cross-check, 1280 desktop sanity-check.
Scope: post-migration authenticated app. New surfaces: `ProposalCard`, `Day1EmptyState`, `OnboardingRunner`, `IntroGallery` (z-index bug fix), plus regression check on `RestTimerHost` + `ConfirmSheet` modal stacking.
Persona artifacts are stale — code-review only, per shared context.

---

## Verdict

**Ships.** The freshly-refactored fold — `Day1EmptyState` → `ProposalStack` → `HeroStateCard` — is thumb-reachable, tap-target-clean, and safe-area-correct on both 393 and 375 phones. Every primary CTA on the new surfaces is `min-h-[44px]`. The IntroGallery/OnboardingRunner z-index collision fix (`IntroGallery.tsx:112-130`) is defensively coded (event-driven re-check + localStorage gate) and holds. One real compound risk remains: **six discrete `fixed inset-0 z-50` modals plus the `z-40` RestTimer coexist in the tree with no shared modal manager**, and the Onboarding-vs-Intro pattern is one of several that could recur. Second: **`body` and `<main>` both apply `pb-[calc(64px + safe-area-inset-bottom)]`**, so authenticated pages carry ~144px of dead space at the bottom — cosmetic on today's short-content routes, will bite on long scrolls (History, Progress) at SE landscape. The Accept/Ignore ergonomics on ProposalCard are correct in absolute terms but the Ignore-X is duplicated (top-right glyph + inline Ignore button); on a rehab-safety amber card, doubled dismiss affordance is a soft nudge to skip signal. Everything else is table stakes and looks good.

---

## Top 5 findings by blast-radius

### 1. Modal-stacking fragility is systemic, not just IntroGallery — S to patch, M to fix right

- **Where:** `OnboardingRunner.tsx:99`, `IntroGallery.tsx:153`, `ConfirmSheet.tsx:64`, `SessionActions.tsx:167,251,324,445`, `VideoModal.tsx:44`, `InfoSheet.tsx:32`, `ExerciseDetailsSheet.tsx:45`. All render `fixed inset-0 z-50` with no coordinator.
- **What:** The recent bug was OnboardingRunner + IntroGallery both painting z-50 on fresh signup. The fix in `IntroGallery.tsx:112-130` (wait for `program.onboarding.done.<slug>` + listen for `terav:onboarding-done`) works for that specific pair. It does NOT protect any other pair. Realistic collisions: user opens `ExerciseDetailsSheet` on Today, a `ConfirmSheet` fires from a background action → both z-50, later mount wins clicks. Even the RestTimer (`z-40`, `bottom-[calc(60px+env(safe-area-inset-bottom))]`) sits directly under BottomNav's z-40 and above any inline content — if RestTimer is up and a `ConfirmSheet` opens, the sheet correctly wins (higher z), but the timer's translucent panel bleeds through in the gutter. On iOS Safari, tapping "through" a stacked backdrop is a known hover-sticky trigger.
- **Blast radius:** Any new modal shipped without checking this map re-introduces the IntroGallery class of bug. That is exactly the "cross-phase compositional bug" the shared context flagged.
- **Fix (S):** rename tiers now — `z-40` for BottomNav & RestTimer (peers), `z-50` for one-off sheets that can co-occur with content, `z-60` for reserved system modals (Onboarding, Auth error). Document in `AppShell.tsx` header comment.
- **Fix (M):** a real `ModalStack` context (`useModal({ id, priority })`), single portal, only the highest-priority visible. Standard shadcn / Radix pattern. Kills the whole class.

### 2. `body` + `<main>` compound bottom padding — S

- **Where:** `layout.tsx:54` sets `pb-[calc(64px+env(safe-area-inset-bottom))]` on `<body>`. `AppShell.tsx:151-153` sets `paddingBottom: "calc(64px + env(safe-area-inset-bottom) + 1rem)"` on `<main>`.
- **What:** The two stack. On 393×852 with 34px home-indicator inset, dead space at bottom of any content = 64 + 34 + 64 + 34 + 16 = **~212px** below the last content pixel before the BottomNav bar. Feels padded on Today (short scroll), but on Progress and History (long lists) the user thumb-scrolls a full page-length of nothing to reach the bottom of the list. Also: signals to the browser that the scroll region ends much later than it does, so pull-to-refresh at the "bottom" is meaningless. On SE (667 tall), that's ~32% of the viewport as dead trailing space when content overflows.
- **Fix (S):** drop the `<body>` pb — it's now redundant with the AppShell main pb. Public routes (`AppShell.tsx:32-37`) don't render a BottomNav, so they should not need the body-level pb either; verify at `/sign-in` there's no odd gap.

### 3. ProposalCard has two dismiss affordances for the same action — S

- **Where:** `ProposalCard.tsx:149-156` (top-right X, `w-9 h-9 -m-2` = 36px hitbox with -8px margin trick, calls `onIgnore`) and `ProposalCard.tsx:166-172` (inline "Ignore" `min-h-[44px]`, also calls `onIgnore`).
- **What:** On a `day_adjustment_soften` (amber, rehab-safety), the user is being asked to Accept a load reduction because the engine sees a signal in their notes. Two dismiss buttons on one card teaches "ignoring is a first-class action" — but the amber card exists precisely because ignoring is not neutral. The 36-effective-px top-right X is also below Apple 44 (the `-m-2` extends the hitbox to ~52 but visually it's 36, so users misjudge distance to neighbors: it's 8px from `min-w-0 flex-1` content and 12px from the eyebrow's baseline). On a stacked ProposalCard list, adjacent Xs can sit ~24px apart vertically — under WCAG 2.5.8's 24px cluster minimum only because they're inside distinct sections.
- **Fix (S):** drop the top-right X on ProposalCard entirely. The bottom-row `Ignore` is the correct single dismiss. Save the top-right X for one-shot modals (ConfirmSheet, InfoSheet), where dismiss-without-choice is expected.

### 4. `hover:` classes without `focus-visible:` / `active:` twins — 83 occurrences, M

- **Where:** ~83 instances across `next-app/src/components/**` and `next-app/src/app/**` (`grep hover: | grep -v focus | grep -v active | wc -l` = 83). Notable ones on new surfaces:
  - `ProposalCard.tsx:153` — top-right X: `hover:text-ink` no touch fallback.
  - `ProposalCard.tsx:162,169` — Accept and Ignore: `hover:bg-bronze-hover` / `hover:bg-line-soft` no touch fallback.
  - `Day1EmptyState.tsx:36` — CTA: `hover:bg-bronze-hover` no touch fallback.
  - `OnboardingRunner.tsx:126,133` — Skip and Next.
  - `BottomNav.tsx:54` — nav tab text.
- **What:** iOS Safari's "sticky hover" — after a tap, the `:hover` state persists until another element is tapped. On the Accept button, that means the button stays visually "hover" (bronze-hover) after tap. Usually a UX blur only; but on ProposalCard, the button also toggles `.pulse-accept` — user gets both animations layered. On the BottomNav, tapping "Progress" leaves the previously-hovered tab in `hover:text-ink` (indistinguishable from active) if the tap was via a non-active tab and the router hasn't yet updated. Semantic route indication briefly disagrees with visual.
- **Blast radius:** every tap on the app on iOS. Non-blocking, corrosive.
- **Fix (M):** codemod: for every `hover:` class add matching `active:` twin (one-line active states in Tailwind: `active:bg-bronze-active`, etc). Optional: strip `:hover` on `(pointer: coarse)` via a global CSS rule — `@media (hover: none) { .no-touch-hover:hover { background: initial; } }`.

### 5. OnboardingRunner modal + iOS soft keyboard — M

- **Where:** `OnboardingRunner.tsx:99` — `fixed inset-0 z-50 ... flex items-center justify-center p-4`. The `LifeLoadStep` (`LifeLoadStep.tsx:36`) is a grid of 11 tap-buttons — no text input, no keyboard. Good. But the `custom_copy` primitive (`CustomCopyStep.tsx`) and `symptom_primer` primitive (`SymptomPrimerStep.tsx`) may render `<input>` in future program JSONs, and today's `SymptomPrimerStep.tsx` uses only tap targets — but the modal itself has no keyboard-aware padding.
  - `BottomNav.tsx:26-31` hides itself when `useKeyboardOpen()` fires. Good.
  - The Onboarding modal is centered with `items-center` (line 99). When the iOS keyboard opens (LifeLoad → future primitives with an input), `items-center` centers against the pre-keyboard viewport height — the panel is pushed up out of view by iOS's viewport shrink. On Android, Chrome resizes and `items-center` re-centers. iOS the Skip/Next buttons at line 122-136 get clipped or hidden behind the keyboard.
- **What:** No current primitive triggers this. Any new primitive with a text input does. Also: on 375×667 (SE) the modal panel's `max-w-md` = 448px is wider than viewport, so it correctly falls back to `w-full`, but the vertical rhythm at SE is tight: eyebrow + h2 + 3 grid rows of `<ul>` + 6 grid rows of Life-Load + 2 CTAs = ~600px content, leaving ~60px of margin. Add a keyboard and Skip/Next fall off-screen.
- **Fix (M):** replace `items-center` with `items-start` + `pt-[10vh]` (or `sm:items-center`), OR listen to `visualViewport` and shift the panel up by (window.innerHeight - vv.height) on iOS. Same fix as BottomNav's `useKeyboardOpen`; extract to `useVisualViewport()` and reuse.

---

## Also worth noting (not top-5 but not zero)

- **BottomNav auto-hide on keyboard** (`BottomNav.tsx:26-31`) is correct behavior on iOS but silently removes the primary nav mid-interaction. When keyboard closes (e.g., user taps a numeric SetRow input, changes their mind, taps outside), the nav pops back in. On iOS the visualViewport transition is ~250ms; the nav re-appears with no animation. Add `transition: transform 200ms` and slide from bottom.
- **RestTimer at `bottom-[calc(60px+env(safe-area-inset-bottom))]`** (`RestTimer.tsx:63`) — uses `60px`, but BottomNav is `min-h-[52px]` + safe-area (which stacks). Mismatch: on a Pro Max with 34px home-indicator, BottomNav is ~86px tall, RestTimer floats at 60+34=94px from bottom. Correct. On an SE (no home indicator, `env(safe-area-inset-bottom)` = 0), BottomNav is ~52px, RestTimer at 60px = 8px above nav. Fine but visually inconsistent with Pro Max (where the gap is 8px too). Consistent by accident. If BottomNav height changes, fix breaks silently. Extract to a CSS var `--bottom-nav-height` set on `:root`.
- **`ScaleAnchorStep.tsx:21-33`** grid-cols-3 at 393×852 modal `max-w-md p-4` — each cell is (448 - 32 - 16) / 3 = ~133px wide. Fine. At 375, actual cell width = (375 - 32 - 32 - 16) / 3 = ~98px. Text `{low/mid/high}` risks wrap; `text-[13px]` = ~12-15 chars per line. Acceptable, but if a program JSON declares "profoundly cooked" as an anchor, it'll wrap 2 lines and misalign the three columns vertically. Use `min-h-[80px]` on the `<li>` to lock cell height.
- **CitationRef inside ProposalCard** (`ProposalCard.tsx:143-147`) — tap-expand affordance. Not read here; verify from citations audit that expand triggers below-the-fold layout shift that could push the `Ignore` button off-screen. If so, add `min-h-[3rem]` reservation.
- **Header hit-slop** (`AppShell.tsx:131-145`) — Programs and Check icons are `w-11 h-11` = 44×44. Correct. But they sit 8px apart horizontally, so touching between them can miss both. `gap-0.5` at line 130 = 2px gap. Increase to `gap-1` (4px) or add `hit-slop` via a wider `<button>` with inner `<span>` icon.
- **Landing → app promise-alignment** — copy says "Pick my focus" → "sharpen it every session". App's Day1 CTA says "Open morning check". Fine — the sharpening happens on the morning check. Not a regression, but the mental model handoff is: user just pressed "Pick my focus" on landing, and the first thing on Today is "morning check". Consider one line on `Day1EmptyState.tsx:26` swapping "Setup · one minute" for "Focus · one minute" to preserve the landing verb.

---

## What I did NOT cover

- **Persona artifacts** — flagged stale in the shared context. Any finding above that would benefit from a live-device screenshot (BottomNav re-appear animation, RestTimer gap on real Pro Max, iOS keyboard behavior on OnboardingRunner) should be re-verified after a persona regen.
- **Contrast / palette / type sizing** — belongs to `app-visual-craft` if it's regenerated this session. I did not enforce WCAG contrast on the amber/green/red proposal card tones.
- **Animation timing / CWV** — belongs to `app-motion-perf`. I noted the `pulse-accept` class on ProposalCard but did not benchmark it.
- **Focus rings + full keyboard traversal** — a11y agent's turn. I noted focus-trap in `useFocusTrap.ts` is present on all sheets.
- **PWA service-worker cache on the new domain** — the shared context flagged this as a live-URL concern. I did not attempt to hit `app.terav.fit` from this shell.
- **Landing at `terav.fit`** — auth-only scope; the `landing-conversion-strategist` audit covers the marketing site.
- **Coach worker CORS on the new domain** — infra, not UX.
- **CoachPage full audit** — Coach is currently profile-nested per IA audit 2026-08-11; not re-audited here.
- **`useKeyboardOpen()` false positive scenarios** — the 100px threshold could false-trigger on very small landscape iOS phones where URL-bar shrinkage plus DPI produces a >100px delta. Would need live test.
- **`ProposalCard` Accept-verb overflow** — `"Advance to {targetPhaseName}"` at line 231 can be long ("Reintroduction week 3 to Base"); no truncation. Cosmetic; would want to see it in a persona shot to judge whether it wraps to 3 lines and pushes Ignore.

Word count: ~1450.
