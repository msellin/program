# Terav app — Accessibility sweep (WCAG 2.2 AA)

Date: 2026-08-18
Palette source: `next-app/src/app/globals.css`
Basis: static source audit across all 15 authenticated routes. `next-app/tests/e2e/artifacts/personas/` is empty this pass (harness not rerun after Postgres/OAuth migration), so persona-state cross-referencing is done against the current source tree; matrix screenshots under `next-app/tests/e2e/screenshots/matrix-v2/` were used to sanity-check focus visibility and tinted-card contrast at 393px.
A1-A8 backlog reconciliation is in §7.

---

## 1. Overall verdict

**Passing at AA on structure and contrast; two real gaps at the input layer, one at the chart, and one on the InfoSheet close semantics.** Landmarks, headings, focus visibility, focus-trap+restore, live regions, reduced-motion, `aria-current`, and the ProposalCard tinted-tone contrast all check out — the recent A1-A8 fixes hold up (§7). The remaining fails are focused: the Coach `<textarea>` ships without an accessible name (WCAG 4.1.2), the SetRow / RetestLoggingSheet placeholders sit at `#3a3f4a` on `#16181c` for 1.66:1 (WCAG 1.4.3) and those placeholders carry the prescribed rep/weight numbers, and the Recharts SVG is exposed via `role="img" + aria-label` but has no keyboard route to the underlying data (WCAG 1.3.1/2.1.1 — has an alt-text summary, so the low-vision case is covered but the sighted-keyboard case is not). Best-in-class thing done well: the shell-mounted `<div id="app-status" aria-live="polite">` in `AppShell.tsx:158` is the correct pattern for `announce()` — polite region exists at load time so NVDA/JAWS won't miss late `Accept` messages.

---

## 2. Systemic issues (fire across ≥2 routes)

### 2.1 Placeholder color fails 1.4.3 and placeholders carry meaning

- **SC:** WCAG 1.4.3 (AA), 1.3.3 (A) 
- **Where:** `next-app/src/components/workout/SetRow.tsx:73`, `:95` (`placeholder:text-line`); `next-app/src/components/workout/RetestLoggingSheet.tsx:120` (`placeholder:text-muted` is fine at 5.48:1, but the empty-value semantics are the same); every `<input placeholder=…>` under `next-app/src/app/events/page.tsx:111,119,134,146,157,168` (uses default browser placeholder color).
- **What:** `text-line` = `#3a3f4a` on `bg-surface #16181c` = **1.66:1**, below the 4.5:1 threshold for body text. SetRow uses the placeholder to display the prescribed kg / reps (line 59-65 and 81-87) — those numbers are the primary hint for the user in the field. The placeholder is doing an information job that only the sighted-non-low-vision user can read; a low-vision user cannot see the prescription. This is a 1.3.3 fail (instructions relying only on sensory presentation) compounding 1.4.3.
- **Fix:** replace `placeholder:text-line` with `placeholder:text-muted` (`#8a8f9a` on surface = **5.48:1** — passes AA), and additionally surface the prescription in an `aria-describedby` sibling so the value is announced. Minimal patch:
  ```diff
  - className="… placeholder:text-line"
  + className="… placeholder:text-muted"
  + aria-describedby={`set-${index}-hint`}
  ```
  Add a visually hidden `<span id={`set-${index}-hint`} className="sr-only">` with `Prescribed ${prescribed.kg} kg × ${prescribed.reps} reps`.

### 2.2 Route h1s are inconsistently marked

- **SC:** WCAG 1.3.1 (A), 2.4.6 (AA), 2.4.10 (AA)
- **Where:** `next-app/src/app/page.tsx:181` (`<h1 className="sr-only">Today</h1>`), `next-app/src/app/profile/page.tsx:178` (`sr-only`), `next-app/src/app/programs/[slug]/intake/IntakeClient.tsx:735` (`sr-only`). Meanwhile `next-app/src/app/coach/page.tsx:252`, `week/page.tsx:112`, `progress/page.tsx:144`, `history/page.tsx:95`, `check/page.tsx:104` all render a **visible** `text-3xl` h1.
- **What:** Inconsistent. Today and Profile hide their h1 while the other main tabs have a visible route title. NVDA/VoiceOver users hit "Today" as an announced h1 (fine), but sighted keyboard users have no visible anchor to know where they are — and no visible h1 breaks the shell-header/main-column expectation set by the other four tabs. The Intake sr-only h1 is defensible because the WizardProgress rail carries the program name; Today and Profile have no such rail.
- **Fix:** Promote Today and Profile h1s to visible. On Today (`page.tsx:181`), most conservative fix is:
  ```diff
  - <h1 className="sr-only">Today</h1>
  + <h1 className="text-3xl font-semibold tracking-tight">Today</h1>
  ```
  Same for Profile. If real-estate is the concern, keep sr-only but at minimum add `<div aria-hidden> Today </div>` styled to visually anchor — but the simpler answer is to render the h1.

### 2.3 InfoSheet close uses a text glyph without an SR name on the character

- **SC:** WCAG 4.1.2 (A), 1.1.1 (A)
- **Where:** `next-app/src/components/InfoSheet.tsx:43-50`. Button has `aria-label="Close"` (good) but the visible glyph is the ASCII `×`, not a lucide `<X size={18} />`. Compare `ConfirmSheet.tsx:75-82` which uses lucide.
- **What:** minor — the button carries `aria-label` so SR names it correctly. The concern is inconsistency across the modal family (the `×` is not an icon component, so it's not aria-hidden, and font substitution on some Android chromiums renders it as a bullet-like char rather than close). Low risk but real.
- **Fix:** swap `×` for `<X size={18} />` from lucide-react to match ConfirmSheet, ExerciseDetailsSheet, VideoModal.

### 2.4 aria-live announcing per-second countdown

- **SC:** WCAG 4.1.3 (AA), 2.2.2 (A)
- **Where:** `next-app/src/components/workout/RestTimer.tsx:60-64` — `role="status" aria-live="polite"` wraps the timer number that re-renders every second.
- **What:** SR users get "one minute thirty… one minute twenty-nine… one minute twenty-eight…" repeatedly. The polite queue absorbs some of it but NVDA in particular is very literal. This is what the shell `#app-status` container in `AppShell.tsx:158` was built to prevent.
- **Fix:** remove `role="status" aria-live="polite"` from the outer div. Fire single announcements via `announce()` at start, at 30s remaining, and at 0. The visible countdown stays; SR gets three messages instead of ~90.

---

## 3. Per-route findings

Only routes with findings listed. Clean routes noted at the end of the table.

| Route | SC | Sev | Finding | Fix (file:line) |
|-------|----|-----|---------|------------------|
| `/` (Today) | 2.4.6 / 1.3.1 | P1 | h1 is sr-only; other tab routes have visible h1 | Promote to visible — `page.tsx:181` |
| `/coach` | 4.1.2 / 3.3.2 | P0 | `<textarea>` has no `<label>`, `aria-label`, or `aria-labelledby` — only a `placeholder` | Add `aria-label="Message coach"` at `coach/page.tsx:309` or wrap in a visually-hidden `<label htmlFor="coach-input">` |
| `/coach` | 1.3.1 | P2 | Bubble list has no `role="log"` — new streamed messages announce whole-region on repaint | Add `role="log" aria-live="polite" aria-atomic="false"` to the message-list container at `coach/page.tsx:283` |
| `/progress` | 1.3.1 / 2.1.1 | P1 | `SymptomLoadChart` exposes `role="img" aria-label={summary}` (good) but no keyboard-reachable underlying data. Backlog acknowledges the data-table expander was deleted (line 159-162 of the chart) | Restore an expander OR add a `<details>` inside the section: `<details><summary>Data table</summary><table>…</table></details>` — see `charts/SymptomLoadChart.tsx:96-165` |
| `/progress` | 4.1.3 | P2 | `HeritageClusterChip` button has `aria-label="{state}. Tap to see why."` — the sentence casing plus period reads well on VoiceOver. Verified against `HeritageClusterChip.tsx:61` | — clean |
| `/history` | 1.3.1 | P1 | Heatmap grid has `role="grid" aria-label` but no `<th>` day-of-week header row — the row labels at `charts/Heatmap.tsx:135-144` are `<span aria-hidden>` so SR gets 56 cells with no columnar context | Change `<span aria-hidden>` to `<div role="rowheader">Mon</div>` etc., or drop the `role="grid"` and use `role="table"` with proper headers |
| `/check` | 4.1.2 | P0 | `SliderRow` range input has `aria-label` (good, `check/page.tsx:237`) but the visible label at `:219` is `<label id="sym-…">` with NO `htmlFor` — the visible label is not programmatically associated with the input; the input relies on `aria-label` alone. Redundant and confusing. | Add `htmlFor={`sym-${label…}`}` on the label OR remove the visible label's `id=` and put the input inside the `<label>` (implicit association) |
| `/check` | 1.4.11 | P2 | Verdict green/amber/red pill (line 275-onward) — verify red is not the sole state indicator. `Verdict` renders text + color; passes. | — clean |
| `/programs/[slug]/intake` | 2.4.6 | P1 | h1 is sr-only (line 735). The rail at `:832-853` carries "Intake · {program}" which is sufficient orientation. Marginal. | Accept as documented decision. Alternatively promote to visible on step 1 only. |
| `/programs/[slug]/intake` | 4.1.3 | P2 | `aria-live="polite"` on the step body (`:746`) means every step change announces the whole body. Loud but not wrong. | Consider `aria-live="polite"` only on a "Step 3 of 17" region, not the whole body. |
| `/report` | 1.3.1 | P2 | Print h1 (`report/page.tsx:174`) shows only on print, screen h1 is `:143`. Two h1s in the DOM. `hidden print:block` hides one from AT too. Passes. | — clean |
| `/events` | 4.1.2 | P1 | Event form inputs (`events/page.tsx:111-168`) have no `<label>` — labels are visually-adjacent `<span>` blocks. Placeholders shown but not associated. | Add `<label htmlFor>` for each input; ~30 min patch. |
| `/(auth)/sign-in`, `/sign-up`, `/reset-password` | 4.1.2 | P1 | Inputs use adjacent `<label>` via CSS, no `htmlFor`. Verify — `sign-in/page.tsx:147` and `:158`, `sign-up/page.tsx:167,181`, `reset-password/page.tsx:87,99`. | Add `htmlFor="email"` etc., ~10 min patch. |
| `/profile` | 2.4.6 | P1 | h1 sr-only (line 178) — see §2.2. | Promote to visible. |
| `/week` | — | — | — | — clean (visible h1, sectioned) |
| `/history` | — | — | Heatmap section (§3 above) is the only finding. h1 visible. | — |
| `/legal/*` | — | — | Structured with h1 + h2 hierarchy, no h3+. | — clean |
| `/guide`, `/extras`, `/admin/keywords` | — | — | Visible h1s. | — clean |

---

## 4. Contrast ratio table (warm-dark palette)

Computed against `--color-ground #0e0f12` unless noted. All ratios computed with sRGB relative-luminance per WCAG 2.2. Tinted backgrounds computed by blending state color at declared alpha onto ground.

| Token / usage | Fg | Bg | Ratio | Threshold | Pass |
|----|----|----|----|----|----|
| `text-ink` body | `#d6d9de` | `#0e0f12` | **13.54:1** | 4.5 | AAA |
| `text-strong` heading | `#f4f5f7` | `#0e0f12` | **17.57:1** | 4.5 | AAA |
| `text-muted` secondary | `#8a8f9a` | `#0e0f12` | **5.91:1** | 4.5 | AA |
| `text-muted` on surface | `#8a8f9a` | `#16181c` | **5.48:1** | 4.5 | AA |
| `text-muted` on `bg-amber/10` (ProposalCard) | `#8a8f9a` | blended `(35,30,22)` | **5.10:1** | 4.5 | AA |
| `text-muted` on `bg-green/10` | `#8a8f9a` | blended | **5.19:1** | 4.5 | AA |
| `text-muted` on `bg-red/10` | `#8a8f9a` | blended | **5.31:1** | 4.5 | AA |
| `text-muted` on `bg-slate/10` | `#8a8f9a` | blended | **5.09:1** | 4.5 | AA |
| Amber eyebrow on amber/10 | `#e0a63a` | blended | **7.63:1** | 4.5 | AAA |
| Green eyebrow on green/10 | `#5fb37a` | blended | **6.59:1** | 4.5 | AAA |
| Red eyebrow on red/10 | `#e5654b` | blended | **5.16:1** | 4.5 | AA |
| Slate eyebrow on slate/10 | `#79b8c4` | blended | **7.43:1** | 4.5 | AAA |
| Ground on bronze button | `#0e0f12` | `#c89666` | **7.31:1** | 4.5 | AAA |
| Ground on bronze-hover | `#0e0f12` | `#d9a97c` | **9.05:1** | 4.5 | AAA |
| BottomNav inactive muted | `#8a8f9a` | `#20232a` | **4.85:1** | 4.5 | AA |
| BottomNav active ink | `#d6d9de` | `#20232a` | **11.11:1** | 4.5 | AAA |
| Bronze focus ring (non-text UI) | `#c89666` | `#0e0f12` | **7.31:1** | 3.0 | AA |
| Bronze focus ring vs amber/10 | `#c89666` | blended amber/10 | **6.31:1** | 3.0 | AA |
| **`placeholder:text-line`** (SetRow) | `#3a3f4a` | `#16181c` | **1.66:1** | 4.5 | **FAIL** |

**A2 backlog item disposition:** RESOLVED. `text-muted` on the tinted ProposalCard backgrounds (amber/10, green/10, red/10, slate/10) is **5.09 to 5.31:1**, safely above 4.5:1. No bump to `text-ink` needed.

---

## 5. Charts & data-viz

**`SymptomLoadChart`** (`next-app/src/components/charts/SymptomLoadChart.tsx:97-158`): wraps the Recharts `<ResponsiveContainer>` in `<div role="img" aria-label={summary}>` where `summary` is a computed sentence covering peak symptom, latest squat kg, latest pull kg (`:87-95`). This is the correct fallback pattern per WCAG 1.1.1 for a complex SVG. Downside: the data-as-table expander was removed on 2026-08-18 (comment at `:159-162`), leaving sighted keyboard users no way to inspect precise numbers without the "Export report" flow. WCAG doesn't strictly require the table if the summary satisfies the text-alternative — it does — so this remains a P2 nice-to-have. Restoring a `<details>` fold under the chart is the minimum-change path.

**`Heatmap`** (`next-app/src/components/charts/Heatmap.tsx:107-198`): each cell has a computed `aria-label` (`:200-214`) covering date, state, exercise count, and today marker — this is genuinely well-done. The container carries `role="grid"` (`:130`). The row headers (Mon..Sun) at `:135-144` are `<span aria-hidden>` which means the grid has no row-header association. When SR users navigate the grid, they get "2026-07-15: green day" but no directional structure. See §3 finding. Interactive mode (with `onDayClick`) uses `<button>` per cell (`:156-172`) — correct.

**`SymptomPrimerStep` visualisation, `HeritageClusterChip`, `HipProgressTile`**: no chart-shaped rendering — just labelled buttons and text nodes. Nothing to note.

---

## 6. Forms & inputs (rehab data lands here — highest-stakes surface)

**Morning check** (`next-app/src/app/check/page.tsx`): range sliders carry `aria-label`, `aria-valuemin/max/now`, `aria-valuetext` — this is the gold-standard slider pattern (§SR announces `"Groin, 3 out of 10"` correctly). The visible label at `:219` is not `htmlFor`-associated with the input at `:230` — the SR falls back to the `aria-label`, so nothing is lost, but the redundant unlinked `<label>` is a semantic smell. Text input at `:171` has proper `<label htmlFor>` at `:165-170`. Checkboxes at `:263-271` use implicit-association (`<label>…<input>`) — correct. Symptom pack notes at `check/hip/page.tsx:359-371` also correctly `htmlFor`-linked.

**Intake wizard** (`next-app/src/app/programs/[slug]/intake/IntakeClient.tsx`): 17-step form. Each question step uses `<h2 id={`q-heading-${q.id}`}>` at `:887` — inputs need `aria-labelledby` pointing at it. Skimmed the WizardQuestionScreen input rendering — inputs are radio-group patterns with `aria-labelledby`. Passes on the sampled surface. Error at `:1128` uses `role="alert"` — correct.

**Retest logging** (`next-app/src/components/workout/RetestLoggingSheet.tsx`): both inputs wrapped in `<label>` at `:86-103` and `:105-122` — implicit association. `aria-invalid={error != null}` at `:100`. `<p role="alert">` at `:125`. Text-error identification passes 3.3.1. `focus:outline-none` at `:101` is paired with `focus:ring-2 focus:ring-bronze` — visible replacement, passes 2.4.7. **Cancel button label OK; but the "Log reading" primary button lacks a distinct disabled state on invalid input** — the button always looks live even when `value` is empty. That's a 3.3.4 concern for the confirmation flow but not strictly a fail because there's a text `role="alert"` on submit-with-bad-input.

**SetRow** (`next-app/src/components/workout/SetRow.tsx`): weight/reps/RPE inputs at `:53-112` each carry `aria-label={\`Set ${index+1} weight\`}` etc. — good. Notes textarea at `:154-161` has a real `<label htmlFor>` at `:153`. The placeholder problem is §2.1.

**Coach textarea** (`next-app/src/app/coach/page.tsx:309-321`): **no label, no aria-label**. This is the P0 finding.

**Sign-in / sign-up** (`(auth)/sign-in/page.tsx:147-158`, `(auth)/sign-up/page.tsx:167-181`): input labels use CSS-adjacent `<span>` rather than `<label htmlFor>`. Sample verified; add `htmlFor`.

---

## 7. A1-A8 reconciliation (backlog verification)

Backlog: `dev/active/session-audit-2026-08-17/backlog.md`.

| # | Item | Backlog status | Verified in current code |
|----|------|-----|-----|
| A1 | sr-only h3 in ProposalCard duplicates eyebrow | DONE | **Confirmed** — `ProposalCard.tsx:139` uses `aria-labelledby={\`proposal-${id}\`}` pointing at the visible eyebrow h3 at `:144-159`. No sr-only h3. |
| A2 | Muted text on tinted proposal bg | Open | **Resolved** — see §4 contrast table. 5.09-5.31:1, passes 4.5:1. Close A2. |
| A3 | useFocusTrap restores focus to stale button | DONE | **Confirmed** — `useFocusTrap.ts:55-66` implements `isConnected` guard + fallback chain to `main h1` → `main a[href]` → `main`. |
| A4 | IntroGallery lacks focus trap | STALE | **Confirmed** — IntroGallery deleted; only OnboardingRunner remains. `useFocusTrap` wired at `OnboardingRunner.tsx:73`, dialog role at `:100-103`, `aria-labelledby="onboarding-title"` matches h2s in each step primitive. Passes. |
| A5 | h2 id="day1-title" orphan | DONE | **Confirmed** — `page.tsx:181` renders `<h1 className="sr-only">Today</h1>` above Day1EmptyState. Marked in §2.2 as a P1 to promote h1 to visible, but the orphan issue itself is resolved. |
| A6 | H1_b text-transparent invisible in forced-colors | DONE | Not verified this pass — landing scope; deferred. |
| A7 | ThreeWayContrast table lacks scope attrs | DONE | Not verified this pass — landing scope; deferred. |
| A8 | H1_c is a `<p>`, not sibling to h1 | Open | Landing scope — deferred. Route to `landing-accessibility`. |

**New findings NOT in the A1-A8 backlog:** §2.1 (placeholder contrast + meaning), §2.2 (h1 visibility inconsistency), §2.4 (RestTimer aria-live spam), §3 rows for Coach textarea, Heatmap row headers, sliderRow label association, events form labels, sign-in form labels.

---

## 8. Priorities

**P0 (blocking — WCAG 2.1 AA fails):**
- **4.1.2 / 3.3.2** — Coach textarea missing accessible name. `next-app/src/app/coach/page.tsx:309` — add `aria-label="Message coach"`.
- **1.4.3 / 1.3.3** — SetRow placeholder color `text-line` (1.66:1) doubling as prescription hint. `next-app/src/components/workout/SetRow.tsx:73,95` — change `placeholder:text-line` → `placeholder:text-muted`, add `aria-describedby` with sr-only prescription text.
- **4.1.2** — SliderRow visible `<label>` at `next-app/src/app/check/page.tsx:219` lacks `htmlFor`. Add `htmlFor={\`sym-${label…}\`}` OR wrap input in the label element for implicit association.

**P1 (should ship this week — 2.2 AA + high-impact 2.1):**
- **2.4.6** — Today (`page.tsx:181`) and Profile (`profile/page.tsx:178`) h1s should be visible for parity with Coach/Week/Progress/History/Check.
- **4.1.2** — Events form inputs (`events/page.tsx:111,119,134,146,157,168`) and auth forms (`sign-in/page.tsx:147,158`, `sign-up/page.tsx:167,181`, `reset-password/page.tsx:87,99`) — add `<label htmlFor>` for each.
- **1.3.1** — Heatmap row headers (`charts/Heatmap.tsx:135-144`) — replace `<span aria-hidden>` with row-header elements or drop `role="grid"`.
- **4.1.3** — RestTimer per-second `aria-live` (`workout/RestTimer.tsx:60-64`) — remove `role="status" aria-live="polite"` from the wrapper; fire discrete `announce()` calls at start / 30s / 0s.

**P2 (nice to have — best practice):**
- Restore data-as-table expander under `SymptomLoadChart` (`charts/SymptomLoadChart.tsx:159-162`) via a `<details>` fold.
- Coach message list — add `role="log" aria-live="polite" aria-atomic="false"` at `coach/page.tsx:283`.
- InfoSheet — swap the ASCII `×` for a lucide `<X>` to match ConfirmSheet.
- Intake `aria-live="polite"` on the whole step body (`IntakeClient.tsx:746`) is over-broad — scope to the step-counter.
- RetestLoggingSheet — disable "Log reading" primary while `value === ""` (`workout/RetestLoggingSheet.tsx:138-144`).

**Deferred to landing scope (A6/A7/A8, C4, C5):** `landing-accessibility` audit — flagged in the 2026-08-17 backlog; nothing regressed.

---

## 9. What was verified and left alone

- Landmark structure: exactly one `<main>` per route via `AppShell.tsx:147`. One `<nav aria-label="Primary">` (BottomNav). One `<header>`. Passes 1.3.1 + 2.4.1.
- `<html lang="en">` at `layout.tsx:61`. Passes 3.1.1.
- Viewport allows pinch-zoom — `layout.tsx:47-57` explicitly documents this. Passes 1.4.4.
- `prefers-reduced-motion` block at `globals.css:157-163` kills route-transition, pulse-accept, mark-done-flash, and press-scale keyframes. `motion-safe:` on the PR tag animation at `SetRow.tsx:143`, `motion-reduce:transition-none` on the intake progress bar at `IntakeClient.tsx:839`. Passes 2.3.3.
- Focus-visible universal ring in `globals.css:103-106` (`outline: 2px solid var(--color-bronze); outline-offset: 2px`) — every interactive element gets a visible focus indicator. Bronze on ground = 7.31:1 vs the 3:1 minimum for non-text UI (WCAG 1.4.11). Passes 2.4.7 + 2.4.11.
- `aria-current="page"` on active BottomNav item at `nav/BottomNav.tsx:54`. Passes 2.4.8.
- Shell `aria-live="polite" aria-atomic="true"` region mounted at load in `AppShell.tsx:158`. This is the correct pattern for `announce()` in `lib/announce.ts`. NVDA/JAWS/VoiceOver will pick up all `Accept`, `Ignore`, `PR fired`, `Retest logged` messages.
- Modal focus trap + Escape + focus restoration: `useFocusTrap.ts` handles all three, and the A3 fix (isConnected fallback) is present. OnboardingRunner (z-60) and RetestLoggingSheet (z-70) modal stack is z-ordered correctly. `role="dialog" aria-modal="true" aria-labelledby="…"` is present on OnboardingRunner (`:100-103`), RetestLoggingSheet (`:60-62`), ConfirmSheet (`:60-62`), InfoSheet (`:28-30`).
- Icon-only buttons have `aria-label`: BottomNav icons via visible text ("Today" etc. at `nav/BottomNav.tsx:67`); Coach's Trash/Send/Stop at `coach/page.tsx:259,326,335`; Progress's Info at `progress/page.tsx:246`; header's Layers/Stethoscope at `AppShell.tsx:131,138`. All labelled.
- ProposalCard Accept/Ignore are real `<button type="button">` at `ProposalCard.tsx:237,244` — not div-onClick.
- Set-row PR tag uses `<output aria-label="Personal record: …">` at `SetRow.tsx:141-144` — correct live-region kind.

**Total blocking-fixes cost: ~90 minutes. P0+P1 combined: ~3-4h.**
