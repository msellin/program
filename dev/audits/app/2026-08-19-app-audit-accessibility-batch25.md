# Terav app — Accessibility audit (WCAG 2.2 AA, batch 25)

Personas audited: persona-recover, persona-strength, persona-erratic (all day-30/45, refreshed 2026-08-19)
Artifacts basis: `next-app/tests/e2e/artifacts/personas/{recover,strength,erratic}/dom/*.html`
Palette source: `next-app/src/app/globals.css`
Viewport: 393×852 mobile
PII scan: no client PII; test personas use `@example.test` fixtures.

---

## 1. Overall verdict

Batches 22–25 landed meaningful gains. MoveSheet, ConfirmSheet, RetestReminder, GraduationCard VerbRow, FirstRunBanner, and the Week-row `aria-expanded`/`aria-controls` wiring all clear WCAG 2.2 AA in isolation. The AppShell's `aria-live="polite"` announcer is present at load on every route, `<html lang="en">` is set (`layout.tsx:66`), `useFocusTrap` handles Tab cycling + Escape + focus restore, `outline-none` is always paired with a bronze focus ring.

Three systemic misses remain: no skip-link, an h1→h3 heading skip on Today + Progress, and SignalsStrip still uses `aria-expanded` without `aria-controls`.

---

## 2. Systemic issues (fire across ≥2 personas)

### 2.1 No skip link on any authenticated route
- **SC:** WCAG 2.4.1 Bypass Blocks (A)
- **Where:** all 15 routes × 3 personas — `AppShell.tsx:102-146`.
- **Fix:** In AppShell, before the `<header>`, render:
  ```tsx
  <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:bg-bronze focus:text-ground focus:px-3 focus:py-2 focus:rounded">Skip to content</a>
  ```
  Add `id="main-content" tabIndex={-1}` on `<main>`.

### 2.2 Heading hierarchy skips h1→h3
- **SC:** WCAG 1.3.1, 2.4.6.
- **Where:** Today's `ProposalCard.tsx:39` emits `<h3>`, Progress's `SignalCompletenessCard.tsx:114` emits `<h3>` — both before the first `<h2>` in document order.
- **Fix:** Demote both `<h3>` → `<h2>` (visual style depends on className, not tag).

### 2.3 SignalsStrip `aria-expanded` without `aria-controls`
- **SC:** WCAG 4.1.2 — advisory but inconsistent with the Batch 24 Week-row pattern.
- **Where:** `SignalsStrip.tsx:234`.
- **Fix:** Add `aria-controls="signals-detail"` on the button + `id="signals-detail"` on the expanded div. Mirror `week/page.tsx:483,526` pattern.

### 2.4 /account sections lack accessible names
- **SC:** WCAG 1.3.1 — nit.
- **Where:** `account/page.tsx:126, 146, 170, 203`.
- **Fix:** Convert each of the four sections to `<section aria-labelledby="acct-signin" | "acct-programs" | "acct-extensions" | "acct-data">`.

---

## 3. Per-persona findings

Only route-specific findings that don't roll up to §2.

### persona-recover
- `/coach` 404 page rendered as expected (Batch 25 killed the route). Next.js default 404 chrome — out of scope.
- `/events` and `15-events.html`: `<h1>Not available</h1>` is the entire main content — SR user hears no context. **P2:** add explanatory `<p>`.
- `/programs/active` H1 is `text-2xl` (~24 px), not the 32 px promoted on primary tabs. → see app-visual-craft.

### persona-strength
- ProposalCard `<h3>` renders BEFORE first `<h2>` — see §2.2. **P1**.
- Empty `<h3>` text on captured DOM implies a proposal card renders an empty eyebrow slot — investigate `ProposalCard.tsx:43-53`. **P2:** skip render when `eyebrow` is falsy.

### persona-erratic
- Signals strip button `aria-expanded="false"` without `aria-controls` — see §2.3. **P1**.
- History heatmap `role="img"` + `aria-label` cover 1.1.1. Heading hierarchy clean.
- Progress `Week of 17 Aug` heading skip — see §2.2. **P1**.

---

## 4. Contrast ratio table

Body text needs ≥4.5:1, non-text UI needs ≥3:1.

| Pair | Ratio | Role | Pass @ AA |
|---|---|---|---|
| `text-ink` / `bg-ground` | 13.54:1 | body | yes |
| `text-strong` / `bg-ground` | 17.57:1 | H1-H3 | yes |
| `text-muted` / `bg-ground` | 5.91:1 | body-secondary | yes |
| `text-muted` / `bg-surface` | 5.48:1 | on card | yes |
| `text-bronze` / `bg-ground` | 7.31:1 | brand | yes |
| `text-bronze-hi` / bronze/20 | 6.81:1 | avatar mono | yes |
| `text-slate` / `bg-surface` | 8.01:1 | secondary link | yes |
| `text-green` / green/20-over-surface | 4.93:1 | "logged" pill | yes |
| `text-amber` / amber/20-over-surface | 5.63:1 | MoveSheet warning | yes |
| **`text-red` / red/20-over-surface** | **4.12:1** | red pill | **fails at 14 px body** |
| `text-red` / red/10-over-ground | 5.16:1 | error message | yes |
| Focus ring bronze / ground | 7.31:1 | 2 px outline | yes |
| Border `line` (#3a3f4a) / surface | 1.82:1 | input border | **fails 1.4.11** |
| Underline `decoration-line` on muted "Undo" | 1.82:1 | link affordance | **fails 1.4.1 + 1.4.11** |

**Fixes:**
- **P1 (1.4.3)** — bump `text-red` on `red/20` to `text-red-strong` (introduce `#f28068` — computes ~4.9:1) OR drop the red/20 background and use `bg-red/10` (~5:1). `page.tsx:838` and any other `bg-red/20 text-red`.
- **P1 (1.4.11)** — bump `--color-line` from `#3a3f4a` (1.82:1) toward `#4d525d` (~3.05:1), OR switch input `bg-surface` to `bg-ground` so the surface delta carries the boundary. Affected: `MoveSheet.tsx:182`, `SetRow.tsx`, `RetestLoggingSheet.tsx`, `check/page.tsx:177`, sign-in/up forms.

---

## 5. Charts

**Heatmap** — `role="img"` + summary `aria-label`, interactive cells become `<button aria-label>`. Pass. Note: dead `role="gridcell"` on non-interactive cells at `Heatmap.tsx:183` — ignored due to parent `role="img"`. Remove for clarity.

**SymptomLoadChart** — not read but referenced from Progress. P2 spot-check next audit — verify summary `aria-label`.

---

## 6. Forms

All log inputs (SetRow, ExerciseCard notes, check-hip textarea, check symptom sliders, MoveSheet reason + radios, /account email + primary picker, catalog sort) pair `htmlFor` labels with `id`. **Pass.**

**P2**: `<div role="alert">` on `account/page.tsx:231-234` delete error message, and on `MoveSheet.tsx:161-166` amber stacking warning — currently silent to SR.

---

## 7. Focused checks from batch context

- **/account landmarks + H1** — visible `<h1 className="text-[32px]">` at `account/page.tsx:104-106`. Pass on H1. Fails §2.4 on section-level `aria-labelledby`.
- **/account back-nav focus restore** — `router.back()` doesn't automatically restore focus. Keyboard users lose focus to `<body>`. **P2:** focus `<h1>` on route mount via `tabIndex={-1}` + effect. Not batch-25-specific.
- **MoveSheet focus trap on open** — `useFocusTrap` picks first-focusable, which is the close X button (DOM order). Design intent: user lands on a target-day radio. **P1:** either reorder DOM (move X after radios) or explicitly focus first non-source radio via `useEffect`.
- **GraduationCard VerbRow** — `<button type="button">` with concatenated label+caption forms the accessible name. Pass.
- **Week row aria-expanded/aria-controls** — verified at `week/page.tsx:482-484` + expanded div `id={weekday-${dateISO}}` at `:526`. Pass. **P2:** the button's `aria-label="Mon — expand details"` overrides visible content — drop the aria-label; let visible text compute.
- **/account Extensions Undo affordance** — `decoration-line` (1.82:1) is essentially invisible. **P1:** swap `decoration-line` → `decoration-slate/60` (~4.6:1) OR color the text `text-slate` (8.01:1).
- **RetestReminder "Not this week" dismiss** — keyboard reachable, focus ring inherits. Pass.

---

## 8. Motion & reduced motion

`prefers-reduced-motion` block at `globals.css:161-167` disables `.pulse-accept`, `.mark-done-flash`, `main` route-in, button-active scale. **Pass 2.3.3.**

---

## 9. Language, keyboard traps, ⋮ menu

- `<html lang="en">` — pass 3.1.1.
- ⋮ overflow button: `aria-label="More" aria-haspopup="menu" aria-expanded`. Escape / arrow-key not verified from source. **P2 spot-check next audit.**
- Bottom nav: `<nav aria-label="Primary">` + `aria-current="page"` on active tab. Clean.

---

## 10. Priorities

**P0:** none.

**P1 (do this month):**
- Skip link in AppShell (§2.1)
- Fix h1→h3 skip — demote to h2 in ProposalCard + SignalCompletenessCard (§2.2)
- Add `aria-controls` on SignalsStrip button (§2.3)
- Bump red-on-red/20 chip contrast (§4)
- Bump `--color-line` OR switch input bg to ground (§4)
- Fix /account Undo underline visibility (§7 Extensions)
- MoveSheet initial focus → first non-source radio, not close X (§7 MoveSheet)

**P2 (nice to have):**
- Guard empty `<h3>` in ProposalCard when eyebrow falsy
- `<section aria-labelledby>` on /account four groups (§2.4)
- Week-row button — drop `aria-label` override
- `role="alert"` on delete error + MoveSheet amber warning
- Route-mount focus-to-h1 for `router.back()` restoration
- Remove dead `role="gridcell"` in Heatmap
- Verify SymptomLoadChart summary aria-label
- Add explanatory `<p>` under "Not available" on `/events`
- Spot-check ⋮ menu keyboard operation

**Out of scope, flagged:**
- 44×44 tap targets — → see app-mobile-ux.
- Copy tone on ConfirmSheet — → see app-copy-clarity.
- H1 size mismatch tabs vs detail pages — → see app-visual-craft.
