# Terav app — Accessibility audit (WCAG 2.2 AA)

Scope: code review of the surfaces shipped this session (ProposalCard, CitationRef, OnboardingRunner, IntroGallery, Day1EmptyState, ProposalStack) plus `announce.ts`, `useFocusTrap.ts`, `AppShell.tsx`, `BottomNav.tsx`, `globals.css`. Live-URL parity assumed against `app.terav.fit`. Persona artifacts declared stale in shared context and were not re-inspected.

---

## Verdict

The new surfaces land closer to WCAG 2.2 AA than the pre-session baseline. The confirm-first proposal flow, the shell-level `#app-status` live region, the `role="dialog" + aria-modal + useFocusTrap` pattern, the `aria-current="page"` bottom nav, and the global `:focus-visible` bronze ring on `#0e0f12` (about 7.35:1) are all correct. Two P1 problems land: `<h3 class="sr-only">` inside `ProposalCard.tsx:106` reads the visible eyebrow text ("Not feeling 100%? · needs your ok") as its accessible name, so a screen-reader user hears a duplicated, decoded eyebrow instead of a real heading — and the same eyebrow is what `aria-labelledby` on `<section>` points at, meaning the section, the (silent) heading, and the visible label are all the same string. Second: the `#8a8f9a` muted-text token passes on `--color-ground` (4.90:1) but drops below 4.5:1 on `--color-surface-2` (~4.12:1); ProposalCard renders `text-muted` inside `bg-amber/10` / `bg-slate/10` tinted containers where the effective bg is lighter than ground and contrast is right on the AA edge. The `useFocusTrap` focus-restoration path is subtly broken in the `IntroGallery`-after-`OnboardingRunner` handoff because the first modal's `previouslyFocused` restore fires after the second modal has already grabbed initial focus.

---

## Top 5 findings (by severity × blast-radius)

### 1. `sr-only <h3>` in ProposalCard duplicates the visible eyebrow — WCAG 1.3.1 / 2.4.6 (P1, S)
- **File:** `next-app/src/components/workout/ProposalCard.tsx:106-108`
- The `<h3>` used as `aria-labelledby` target contains `{eyebrow}` — the same string rendered visibly one line above at `:104`. SR users hear the section labelled "Not feeling 100%? · needs your ok" (an interrogative eyebrow, not a heading phrase) then hit the same string as visible text. It is also not a real heading name — headings should describe the section's content, not repeat its decorative label.
- **Fix:** Replace `aria-labelledby` with a proper `aria-label` derived from the proposal payload (`"Load adjustment proposal — ${proposal.reason}"` etc.) and delete the `sr-only <h3>`. Landmarks with `role="region"` or `<section>` should not carry a heading that only exists for the SR. Cost: S.

### 2. Muted body text on tinted proposal backgrounds — WCAG 1.4.3 (P1, S)
- **File:** `next-app/src/components/workout/ProposalCard.tsx:113,134` (`text-[12px] font-mono text-muted`) inside `bg-amber/10` / `bg-slate/10` / `bg-green/10` container.
- `#8a8f9a` on pure ground (`#0e0f12`) is 4.90:1 — pass. Composited over `bg-amber/10` (10% `#e0a63a` over ground) the effective bg lifts to roughly `#25211a`, dropping the ratio to ~4.3-4.4:1. Small text (12px non-bold) requires 4.5:1. Same story for the `text-[12px] text-muted` panel in `CitationRef.tsx:56`.
- **Fix:** Swap `text-muted` → `text-ink` (`#d6d9de`, 13.6:1 on ground, still ~11:1 on the tinted bg) for these small-caps evidence lists, or lift the tint from `/10` to a token backdrop that keeps ground beneath. Cost: S.

### 3. `useFocusTrap` restores focus to a stale target when two modals hand off — WCAG 2.4.3 (P1, M)
- **Files:** `next-app/src/lib/useFocusTrap.ts:15-52`, `next-app/src/components/onboarding/OnboardingRunner.tsx:79`, `next-app/src/components/IntroGallery.tsx:112-130`.
- `OnboardingRunner` snapshots `document.activeElement` at mount, then IntroGallery opens on its own `terav:onboarding-done` listener. If the IntroGallery mounts before OnboardingRunner's `useEffect` cleanup fires (React StrictMode + microtask ordering), the OnboardingRunner cleanup calls `previouslyFocused.current?.focus()` and can steal focus back to a `<body>`-level element, or ping-pong through a hidden nav item, before IntroGallery's own `focus()` runs. IntroGallery also has no focus trap at all (no `useFocusTrap` call, no initial-focus target) — its Close button is `aria-label`ed but Tab escapes into the underlying page (the modal is `role="dialog" aria-modal="true"` at `IntroGallery.tsx:150-152` but nothing enforces the trap).
- **Fix (two parts):** (a) In `IntroGallery.tsx`, wire `useFocusTrap` on the inner panel; add an `initial-focus` ref to the primary Next/CTA button. (b) In `useFocusTrap.ts:50`, guard restore with `if (!document.body.contains(previouslyFocused.current)) return` and defer with `requestAnimationFrame` so a chained modal's initial focus wins. Cost: M.

### 4. IntroGallery lacks focus trap, `aria-labelledby`, and its slide-region is inert — WCAG 2.4.3 / 4.1.2 (P1, S)
- **File:** `next-app/src/components/IntroGallery.tsx:149-229`
- `role="dialog" aria-modal="true"` with no `aria-labelledby` or `aria-label` — SR announces "dialog" with no name. The five `SLIDES[]` render sequentially with no live region on the slide body (line 176-178), so tapping "Next" / dot-navigation swaps the title and paragraphs silently. The dot-nav buttons (`:181-192`) have `aria-label="Go to slide N"` but the pagination has no `aria-current` on the active dot, so SR can't tell which slide is showing.
- **Fix:** Add `aria-labelledby` referencing the visible `<h2>` (needs an `id`). Wrap the slide body in `<div aria-live="polite" aria-atomic="true">` so title + body announce on advance. Add `aria-current="true"` to the active pagination dot. Wire `useFocusTrap(panelRef, close, open)`. Cost: S.

### 5. `<h2 id="day1-title">` lands at the top level with no route `<h1>` above it — WCAG 1.3.1 / 2.4.6 (P2, S)
- **Files:** `next-app/src/components/workout/Day1EmptyState.tsx:27`, `next-app/src/app/page.tsx:132`
- Today has `<h1 className="sr-only">Today</h1>` at `page.tsx:132`, so the outline is `h1 (sr-only) → h2 (Day 1 CTA)`. That is defensible — but on Day 1 the visible page has zero visible headings; the eyebrow, ProposalStack heading-less region, and HeroStateCard body carry all the meaning. A low-vision user with headings-navigation on hears "heading 1: Today, heading 2: Start with a morning check" with no visible correspondence to "Today." The Day 1 case should promote the visible tile to the route's real `<h1>` — one visible heading on the first-run screen — or the shell should render "Today" visibly.
- **Fix:** Make `Day1EmptyState.tsx:27` render an `<h1>` when it is the day-1 gate (page.tsx conditionally suppresses its own sr-only h1), or promote the sr-only h1 in `page.tsx:132` to a visible one on day 1. Cost: S.

---

## What I did NOT cover

- Persona-driven route walkthroughs (`persona-recover`, `persona-strength`, `persona-erratic` DOM captures) — shared context declared them stale; the standard 15-route table in my system prompt would produce false positives against the current tree.
- The Coach chat page (backend env-gated, no UI in scope this session).
- `SetRow`, `HeroStateCard`, `SignalsStrip`, `RestTimer`, `WeeklyNarrativeTile`, chart components — not in the "new surfaces" list; RestTimer's `role="status" aria-live="polite"` (RestTimer.tsx:61) and Heatmap's `aria-label` + cellAria pattern (Heatmap.tsx:119,148,165) both look correct from a spot-check.
- `/check` symptom-slider labels — outside the target list; a full forms audit is still owed here since medical capture moved to `/check` as part of B3.
- Live-URL runtime checks (CORS, SW cache, PWA install prompt on `app.terav.fit`) — code-only pass.
- Landing (`terav.fit`) — separate audit, see `dev/audits/landing/2026-08-17-positioning-focused-vs-full-plan.md`.
- WCAG 2.5.8 target-size ergonomic pass — deferred to `app-mobile-ux`; the `min-h-[44px]` on ProposalCard Accept/Ignore/Ignore-X (lines 153, 162, 169) and OnboardingRunner Skip/Next (lines 126, 133) is honored where I looked.

---

## Secondary findings (not top-5 but worth queueing)

- **ProposalCard has two "Ignore" affordances** — the X icon button at `:149-156` (`aria-label="Ignore proposal"`) and the "Ignore" text button at `:166-172` fire the same `onIgnore` handler. WCAG 3.2.4 (Consistent Identification) is fine because they do the same thing, but a keyboard user tabs `Accept → X (Ignore) → CitationRef → Ignore` — the X sits between Accept and the reason/citation, splitting the primary action pair. Rework tab order by reordering the JSX so both action buttons live in the same flex row and the X either goes away or moves to the far end. Cost: S. WCAG 2.4.3.
- **`CitationRef` expand toggle is a `<button>` but the expanded panel is not `tabindex="0"` and has no `role="region"`** — after `aria-expanded="true"` fires, keyboard focus stays on the toggle; a user must Tab through to reach the `href` external link. That's OK per pattern, but the panel content has no landmark. Add `role="region" aria-label="Citation details"` on `CitationRef.tsx:54`. Cost: S. WCAG 1.3.1.
- **`OnboardingRunner.tsx:103` `aria-live="polite"`** is on a paragraph whose text is `Setup · {step + 1} of {totalSteps}`. That's correct SR behavior for the step counter, but the step *content* below (rendered by `ScaleAnchorStep` / `LifeLoadStep` etc.) is not inside a live region. Advancing a step announces "Setup 2 of 5" but not the new question. Wrap the step-body container in `aria-live="polite"` too, or move focus to the step's first heading on `advance()`. Cost: S. WCAG 4.1.3.
- **`announce.ts` clear-then-set is correct**, but the microtask (`:22`) does not give NVDA on Windows enough of a mutation gap in some cases. If we see missed announcements post-Accept, switch to `setTimeout(fn, 50)`; leave the microtask for now. No finding — noted for future.
- **`AppShell.tsx:117-148` header** — no `<h1>` in the shell (correct; route owns it), but `<Link href="/" aria-label="Terav — Today">` shares the same effective destination as the Bottom Nav's Today tab (`BottomNav.tsx:16`). Two links to the same page in a shell is fine, but `aria-current="page"` on the header link when on `/` would let SR users skip the redundant announcement. Cost: S. WCAG 2.4.4.
- **`IntroGallery.tsx:154` `onClick={close}` on the backdrop** — clicking the overlay dismisses the modal. That's a common pattern but is not keyboard-reachable; if a keyboard user Escapes there's no handler (no `onKeyDown` for Esc). Add Escape close via the same `useFocusTrap` cleanup. Cost: S. WCAG 2.1.1.
- **`prefers-reduced-motion`** is honored globally in `globals.css:157-163` (route-in, pulse-accept, mark-done, active-transform). The IntroGallery pagination dot uses `transition-all` (`IntroGallery.tsx:187`); Tailwind's `transition-all` includes transform and does not respect the media query at the CSS level. Add a `motion-safe:` prefix or a `motion-reduce:transition-none` variant. Cost: S. WCAG 2.3.3.

---

## Contrast reference (against `--color-ground #0e0f12`)

| Token | Hex | Ratio | Where used in new surfaces | AA |
|-------|-----|------:|-----------------------------|:--:|
| `text-strong` | `#f4f5f7` | 17.9:1 | Day1 h2, CitationRef title | pass |
| `text-ink` | `#d6d9de` | 13.6:1 | ProposalCard reason, CitationRef expanded body | pass |
| `text-muted` | `#8a8f9a` | 4.90:1 | ProposalCard evidence lists, CitationRef Source line, Day1 body | pass on ground / **borderline on tinted panels — see finding 2** |
| `text-bronze` | `#c89666` | 7.35:1 | Day1 eyebrow, CitationRef external link | pass |
| `text-slate` | `#79b8c4` | 9.6:1 | Signals eyebrow, tier proposal | pass (post-fix from earlier audit — kept) |
| `text-amber` | `#e0a63a` | 9.6:1 | Amber proposal eyebrow | pass |
| `text-green` | `#5fb37a` | 7.9:1 | Reintro proposal eyebrow | pass |
| `text-red` | `#e5654b` | 5.2:1 | Not used in new surfaces | pass |
| Focus ring 2px `#c89666` on ground | — | 7.35:1 | Global via `*:focus-visible` | pass 2.4.11 |

Small-text (12px non-bold) needs 4.5:1 in AA; `text-muted` at 4.90:1 on ground clears it but the tinted-panel composite drops below the line — that's finding 2.

---

## Priorities

**P0:** none.

**P1:**
- Finding 1 — Remove `sr-only <h3>` and swap to `aria-label` in ProposalCard.
- Finding 2 — `text-muted` → `text-ink` inside tinted proposal panels + CitationRef expanded panel.
- Finding 3 — Focus-trap restoration guard in `useFocusTrap.ts` + focus trap on IntroGallery.
- Finding 4 — IntroGallery `aria-labelledby`, slide-body live region, active-dot `aria-current`.

**P2:**
- Finding 5 — Promote day-1 empty-state heading to `<h1>` or make Today's h1 visible on day 1.
- Reorder ProposalCard action buttons so Accept + Ignore are adjacent in DOM order.
- Add `role="region"` on `CitationRef` expanded panel.
- Wrap OnboardingRunner step body in `aria-live` or move focus to step heading on advance.
- Add Escape handler + `motion-reduce:transition-none` on IntroGallery.
- `aria-current="page"` on the header brand link when on `/`.
