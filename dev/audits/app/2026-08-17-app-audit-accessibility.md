# Terav app — Accessibility audit (WCAG 2.2 AA, 3 personas)

Personas audited: persona-recover, persona-strength, persona-erratic
Artifacts basis: `next-app/tests/e2e/artifacts/personas/`
Palette source: `next-app/src/app/globals.css`
Viewport: 393×852 mobile, desktop cross-check via DOM
Date of audit: 2026-08-17

---

## 1. Overall verdict

The app is neither ARIA soup nor an accessibility greenfield. The palette computes clean on ratio math (bronze/slate/green/amber/muted all clear 4.5:1 against the ground and surface tokens), most icon-only buttons carry `aria-label`, and modals (`ConfirmSheet`, `InfoSheet`, `VideoModal`, `Onboarding`, `ExerciseDetailsSheet`) all render as `role="dialog" aria-modal="true"` with a labelled title. What kills it for WCAG 2.2 AA is four systemic failures: (1) **Today has no `<h1>` on any persona** — the "Today" label is a bottom-nav tab, not a page title, so SR users land on the Barbell block's `<h2>` cold; (2) **Profile has no headings at all** across all three personas; (3) **the viewport is locked to `maximum-scale=1, user-scalable=no`**, a hard fail of 1.4.4 that no other polish covers up; (4) **the confirm-first proposal UI has no live regions**, so Accept / Ignore / Advance produce a visible pulse and a silent DOM mutation for AT users. The Recharts SVG on Progress and Report renders as `role="application" tabindex="0"` with no name and no text alternative — 1.1.1 and 4.1.2 fail together. One thing done well: the Heatmap has per-cell `aria-label` naming date and state, and the Verdict banner uses paired icon + word (not colour-alone) for green/amber/red.

---

## 2. Systemic issues (fire across ≥2 personas)

### 2.1 Today has no `<h1>`
- **SC:** WCAG 2.4.6 (Headings and Labels, AA), 1.3.1 (Info and Relationships, A), 2.4.2 (Page Titled, A) — the `<title>` is generic "Terav — sharpen the plan", so the H1 is the only route-specific landmark for SR users.
- **Where:** persona-recover, persona-strength, persona-erratic — all three `/dom/01-today.html` show `<h1>` count = 0. `next-app/src/app/page.tsx:127` explicitly deleted the H1 ("Big top slab is gone. Screen-title H1 was showing the same word …") without a replacement. `next-app/src/app/page.tsx:709` shows the first heading now is `<h2>` for the block name (e.g., "Barbell reintro session").
- **What:** an SR user landing on Today has no page-scope heading. `next-app/src/app/page.tsx:353` proves the author knew how to render one — it appears in the `NoActiveProgram` branch as "Pick a program" — but the primary Today branch skipped it.
- **Fix:** re-add a visually-hidden H1 at the top of the rendered Today branch. Keep it out of the visual layout the founder complained about:
```tsx
<h1 className="sr-only">Today</h1>
```

### 2.2 Profile has no headings at all
- **SC:** WCAG 2.4.6 (AA), 1.3.1 (A), 2.4.10 (Section Headings, AAA — flag).
- **Where:** persona-recover:/profile, persona-strength:/profile, persona-erratic:/profile — `dom/08-profile.html` all report h1=0 h2=0 h3=0. `next-app/src/app/profile/page.tsx` — zero `<h1>`/`<h2>`/`<h3>` in the file.
- **What:** SR users on Profile hear an email string, three named `<nav>`s ("More", "Legal", "Primary"), and no semantic top-level anchor. On mobile this is the account/settings page — 6 distinct sections per the file's own comment (Identity, My plan, My constraints, Data & privacy, Coach, Help, Sign out) — with none of them marked as headings.
- **Fix:** add `<h1 className="sr-only">Profile</h1>` at the top of `next-app/src/app/profile/page.tsx` component root, and promote each section title (currently a `<p className="mono-caps">` or plain text) to `<h2>`.

### 2.3 Viewport locks user scaling
- **SC:** WCAG 1.4.4 (Resize Text, AA), 1.4.10 (Reflow, AA) — hard fail. This is Success Criterion 1.4.4's most-cited anti-pattern.
- **Where:** every persona's every DOM capture — `meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover"`. Source: `next-app/src/app/layout.tsx:49-51`.
- **What:** the layout comment ("Lock pinch-zoom on the PWA — the sticky top nav + bottom tab bar are `position: fixed`, and pinch-zoom scales them along with the content") justifies this on aesthetic grounds. WCAG 1.4.4 requires 200% resize without loss of content or functionality. The workaround "Base font sizes are 14-16px so no user needs to zoom" fails the SC — the SC is written to protect low-vision users who need MORE than 200% by pinching. Bottom-nav labels are 9px (`text-[9px]` in `next-app/src/components/nav/BottomNav.tsx:42`), so the premise is also false.
- **Fix:** remove `maximumScale: 1` and `userScalable: false` from `next-app/src/app/layout.tsx:49-51`. Fix the sticky-chrome-on-pinch-zoom problem in CSS (use viewport-relative sizing or drop `position: fixed` when scaled), not by forbidding zoom.

### 2.4 Confirm-first proposals mutate state with no live region
- **SC:** WCAG 4.1.3 (Status Messages, AA), 1.3.1 (A).
- **Where:** Accept / Advance / Not yet buttons in:
  - `next-app/src/components/workout/ReadinessProposal.tsx:77-104` (Advance to Cycle 1 → mutates phase, no announcement)
  - `next-app/src/components/workout/DayAdjustmentProposal.tsx:108-127` (Apply lighter today → mutates day_adjustments, no announcement)
  - `next-app/src/components/workout/TierAdvanceProposal.tsx:61-89` (Advance to tier → mutates capability_profile, no announcement)
  - `next-app/src/components/workout/SetRow.tsx:113-127` (PR `<output aria-label="…">` is inside `<article>` but with no `aria-live` container).
- **What:** the entire codebase has TWO `aria-live` usages (`next-app/src/components/Onboarding.tsx:166`, `next-app/src/components/workout/RestTimer.tsx:62`). The rest-timer's is scoped to timer text only. When a user taps "Advance to Cycle 1", the proposal card gets a `.pulse-accept` class and unmounts on next render — SR users get a visual pulse they can't see and a silent DOM removal.
- **Fix:** wrap the proposal region in `next-app/src/app/page.tsx` (around the `<TierAdvanceProposal>` slot at line 170) with a single persistent live region:
```tsx
<div id="proposal-announcer" role="status" aria-live="polite" aria-atomic="true" className="sr-only" />
```
Then have each proposal's Accept handler write a short confirmation string ("Advanced to Cycle 1", "Lighter session applied", "Advanced to intermediate tier") into that node. Container must exist at load — dynamically injecting a live region on Accept misses NVDA/JAWS.

### 2.5 Recharts SVG has `role="application"` with no accessible name
- **SC:** WCAG 1.1.1 (Non-text Content, A), 4.1.2 (Name, Role, Value, A).
- **Where:** persona-recover:/progress, persona-strength:/progress, persona-erratic:/progress — each `dom/05-progress.html` and `dom/10-report.html` shows exactly one `<svg role="application" tabindex="0" class="recharts-surface" …>` with no `aria-label` or `aria-labelledby`. Source: `next-app/src/components/charts/SymptomLoadChart.tsx:86-142`. Recharts injects `role="application"` and `tabindex="0"` by default and the wrapper does not override.
- **What:** `role="application"` is the most aggressive ARIA role — it tells screen readers to disable browse mode and pass every keystroke to the widget. On a chart with no keyboard operation and no name, this makes the SR experience *worse* than the default SVG. Additionally, there is no text-alternative summary of the trend nearby. A rehab user on Progress cannot get "peak symptom trended down from 6 to 2 while squat top-set moved 50 → 89 kg over 30 days" without eyeballing the chart.
- **Fix:** on the outer `<ResponsiveContainer>` wrapper, add a text summary sibling and force role=img on the SVG. Precise patch:
```tsx
// In SymptomLoadChart.tsx, before <ResponsiveContainer>:
const summary = buildTrendSummary(rows); // e.g. "Symptom peak declined from 6 (Jul 07) to 2 (Jul 31). Squat top set rose 49 → 89 kg. Pull top set rose 62.5 → 113.5 kg."
return (
  <figure role="figure" aria-label="Symptom versus load, last 30 days">
    <div className="sr-only">{summary}</div>
    <div className="h-[300px] w-full" aria-hidden="true">
      <ResponsiveContainer …>…</ResponsiveContainer>
    </div>
  </figure>
);
```
Then `aria-hidden` the inner chart so `role="application"` doesn't leak.

### 2.6 WeeklyNarrativeTile skips heading level from H1 → H3
- **SC:** WCAG 1.3.1 (A), 2.4.6 (AA).
- **Where:** persona-recover:/progress, persona-strength:/progress, persona-erratic:/progress. Emitted DOM shows `<h1>Progress` immediately followed by `<h3>Week of 17 Aug` with no H2 between. Source: `next-app/src/components/WeeklyNarrativeTile.tsx:41` emits `<h3>`, but the tile is rendered in `next-app/src/app/progress/page.tsx:245` right after the Progress H1.
- **Fix:** change `WeeklyNarrativeTile.tsx:41` from `<h3>` to `<h2>`. The tile is a top-level card on Progress — nothing about its content demands H3.

### 2.7 Report page emits two `<h1>` elements
- **SC:** WCAG 1.3.1 (A) — spec-strict there is no "one H1 per page" rule, but the DOM-order duplicate confuses AT and the H1 pair is not a heading structure choice, it's a copy-paste of the same text.
- **Where:** persona-recover:/report, persona-strength:/report, persona-erratic:/report — `dom/10-report.html` shows two `<h1>` both reading "Training summary". Source: `next-app/src/app/report/page.tsx:149` (visible) and `next-app/src/app/report/page.tsx:180` (`className="hidden print:block"`). The print-only one is still emitted to the DOM and read by SR (`display:none` in a print media query still counts as present in the accessibility tree because it's not `display:none`ed for screen).
- **Fix:** move the print H1 into `@media print` CSS that toggles the display of a single H1, or remove the second `<h1>` and use `print:text-xl` on the first.

### 2.8 Placeholder text on SetRow inputs is `text-line` (#2a2e37)
- **SC:** WCAG 1.4.3 (Contrast Minimum, AA), 1.3.3 (Sensory Characteristics, A — placeholder-as-only-cue).
- **Where:** `next-app/src/components/workout/SetRow.tsx:73` and `:95` — inputs use `placeholder:text-line`. `#2a2e37` on `bg-surface` (#16181c) computes to **1.31:1** — well below 4.5:1.
- **What:** the placeholders carry actual information — previous kg / previous reps / "RPE" — so 1.4.3 fully applies. In addition, the placeholder is the only visible "prev/rx" cue for a returning user; if the previous set was 92.5 × 5, the placeholder shows "92.5" invisibly.
- **Fix:** switch to `placeholder:text-muted/70` and add a proper `<span>` above the input for prev/rx that persists.

### 2.9 `bronze/40` focus ring on form controls fails 2.4.11 focus visibility
- **SC:** WCAG 2.4.11 (Focus Not Obscured (Minimum), AA — new in 2.2), 1.4.11 (Non-text Contrast, AA).
- **Where:** every form input on `next-app/src/components/workout/SetRow.tsx:73/95/111/160`, `next-app/src/app/check/page.tsx:176`, `next-app/src/app/(auth)/sign-in/page.tsx:85/96`, `next-app/src/app/(auth)/sign-up/page.tsx:104/118`, `next-app/src/app/coach/page.tsx:315`, `next-app/src/app/events/page.tsx:104-161`, `next-app/src/app/data/page.tsx:263`, `next-app/src/app/reset-password/page.tsx:87/99`, `next-app/src/app/progress/page.tsx:688`, `next-app/src/app/programs/[slug]/intake/IntakeClient.tsx:629/641/648/702`.
- **What:** the ring `focus:ring-bronze/40` = bronze (#c89666) at 40% opacity mixed against ground = ~**2.11:1**. Non-text UI needs ≥3:1. WCAG 2.4.11 requires the focus indicator to remain visible against adjacent colours.
- **Fix:** bump to `focus:ring-bronze` (full opacity, 7.31:1) or `focus:ring-bronze/70` (~5.0:1 estimated). Globals's `*:focus-visible` at `next-app/src/app/globals.css:103-106` already uses full bronze — the inline `focus:ring-*/40` overrides that with a weaker version. Just remove the alpha.

### 2.10 Coach textarea has no label
- **SC:** WCAG 1.3.1 (A), 3.3.2 (Labels or Instructions, A), 4.1.2 (A).
- **Where:** `next-app/src/app/coach/page.tsx:304-316` — `<textarea placeholder="Ask about your plan, form, symptoms… ⌘⏎ to send" …>` has no `aria-label`, no adjacent `<label htmlFor>`, no `aria-labelledby`. Only the placeholder identifies it. Placeholder disappears on focus.
- **Where else:** all three personas render this textarea (though for engine-builder/erratic the Coach page currently displays the "Coming soon" placeholder — for recover, the chat UI is live).
- **Fix:** add `aria-label="Message the coach"` to the textarea in `next-app/src/app/coach/page.tsx:304`. Ideal: `<label htmlFor="coach-input" className="sr-only">Message the coach</label>` and `id="coach-input"` on the textarea.

---

## 3. Per-persona findings

### persona-recover (rehab, anterior-hip-rebuild, day 30)

| Route | SC | Severity | Finding | Fix |
|-------|----|----------|---------|-----|
| /today | 2.4.6 | P0 | No H1 (see §2.1) | `<h1 className="sr-only">Today</h1>` in `next-app/src/app/page.tsx` |
| /today | 4.1.3 | P0 | Missed-session banner appears without live region on load — for a returning user, SR gets no announcement of the yesterday-strength-day gap. `next-app/src/components/workout/MissedSessionPrompt.tsx:80` renders `<div>` (no role). | Wrap in `<section aria-labelledby>` or set `role="region" aria-label="Missed session prompt"` |
| /today | 2.4.4 | P2 | "Log yesterday now" / "Mark yesterday skipped" — button labels are clear when read in isolation, but they mutate `activeDate` and navigate the visible day; SR gets no context about what changed. Handoff to §2.4 live-region fix. | (See §2.4) |
| /coach | 1.3.1 | P0 | Coach textarea unlabelled (see §2.10) | `aria-label="Message the coach"` |
| /coach | 2.4.6 | P1 | H1 = "Coach" but subhead "Reads your full history + clinical context each turn" is a `<p>` where it's a lead — fine. No violation. | — |
| /history | 4.1.2 | P1 | Heatmap `role="grid"` on the wrapping div (`next-app/src/components/charts/Heatmap.tsx:114`) but child buttons are not `role="gridcell"`. Row labels Mon..Sun (`Heatmap.tsx:120-123`) are `aria-hidden`, so no row-header context. The grid semantics are incomplete and unusable. | Either drop `role="grid"` and let each button be its own labelled control, or add `role="row"` on 7 wrapping divs and change the `<button>`s to `<button role="gridcell">`. Simpler fix: `<ul aria-label="Activity heatmap">` and `<li><button …/></li>` per cell — semantic list, no fake grid. |
| /history | 1.4.11 | P1 | "Skipped" cell state uses `bg-line-soft border-dashed border-line` (`Heatmap.tsx:169`) — the dashed border is `#2a2e37` on ground (1.41:1). Skip cells therefore look identical to "no activity" cells at a distance and to any user with low vision. | Add a per-state icon or textured pattern instead of dashed border, or bump border to `border-muted` (5.91:1). |
| /progress | 1.1.1 | P0 | Symptom-vs-load chart is `role="application" tabindex="0"` with no name and no summary (see §2.5). | See §2.5 patch. |
| /progress | 1.3.1 | P0 | H3 "Week of 17 Aug" between H1 Progress and H2 Symptom vs load (see §2.6). | Change `WeeklyNarrativeTile.tsx:41` to `<h2>`. |
| /programs | 4.1.2 | P2 | Two `<nav>`: "Primary" (bottom) and "Program category filter". Both are named — good. | — |
| /profile | 2.4.6 | P0 | No headings at all (see §2.2) | See §2.2 |
| /data | 1.3.1 | P1 | Long text-area `data-export` field is labelled by a preceding heading — check ID linkage. `next-app/src/app/data/page.tsx:263` uses `focus:outline-none focus:ring-bronze/40` — fails focus contrast (§2.9). | See §2.9 |
| /report | 1.3.1 | P0 | Two `<h1>` "Training summary" (see §2.7) | See §2.7 |
| /report | 1.1.1 | P0 | Report chart same Recharts SVG treatment (see §2.5) | See §2.5 |
| /guide | 1.3.1 | P2 | H1 → H2 heading order clean. No findings. | — |
| /extras | 1.3.1 | ok | H1 → H2 → H3 clean. No findings. | — |
| /check | 1.3.1 | P1 | `<label id="sym-…">` in `next-app/src/app/check/page.tsx:221` has no `htmlFor` — the visible label is not associated with the range input. The input has `aria-label` so SR still names it, but a keyboard-only user tapping the visible label word does not focus the slider. | Add `htmlFor` on the label OR wrap the label around the input (best-practice: nest, no id/for needed). |
| /check | 1.4.11 | P1 | The L/R laterality pill in `next-app/src/app/check/page.tsx:223-228` is `text-surface` on `bg-lat-left` (#16181c on #4a8894) = 4.44:1 — fails at 9px small-text (needs 4.5:1). | Bump lat-left/lat-right lightness or make the pill text `text-strong`. |
| /check/hip | 1.3.1 | ok | H1 present, no findings. | — |
| /events | n/a | P2 | Rendered as Next `__next_error__` for non-super-admin (`next-app/src/app/events/page.tsx:73-89`). Error page has H1 "This page couldn't load" — fine as fallback but the intended "Not available" H1 at `events/page.tsx:76` is not reachable in this build. | Product decision (out of scope for a11y). |

### persona-strength (overperformer, engine-builder, day 30)

| Route | SC | Severity | Finding | Fix |
|-------|----|----------|---------|-----|
| /today | 2.4.6 | P0 | No H1 (see §2.1) | See §2.1 |
| /today | 4.1.3 | P0 | No engine-proposal is present in the DOM (day_adjustments=0, missed=0). The failure mode: if a proposal *did* appear later via polling, there is no live region to announce it. Same class of failure as §2.4. | See §2.4 |
| /coach | 2.4.6 | ok | H1 Coach present. | — |
| /history | 4.1.2 | P1 | Heatmap issues same as recover — role="grid" without gridcells (see recover:/history). | See recover:/history |
| /progress | 1.1.1 | P0 | Recharts chart unlabelled (see §2.5). | See §2.5 |
| /progress | 1.3.1 | P0 | H3 Week-of skip (see §2.6). Additionally: retest metrics section uses H2. Order is H1 → H3 → H2. | See §2.6 |
| /programs | 1.3.1 | ok | H1 → H2 → H3 order clean. | — |
| /programs-active | 1.3.1 | P2 | Active program page starts H1 "Engine Builder — Block 1: Base" then H2 sections. Clean order but H2 "Who this is for", "What you'll achieve", "Retest" — persona-strength has completed 30 days, so the "Who this is for" H2 reads as marketing rather than user-context. Copy issue → see app-audit-N-copy-clarity. | — |
| /profile | 2.4.6 | P0 | No headings at all (see §2.2). | See §2.2 |
| /data | 1.3.1 | P1 | Same as recover. | See recover |
| /report | 1.3.1 | P0 | Two H1s (see §2.7). | See §2.7 |
| /guide | ok | ok | — | — |
| /extras | 1.3.1 | ok | Six H3 exercises under two H2. Clean. | — |
| /check | 1.3.1 | P1 | Same slider label issue (see recover:/check). | See recover:/check |
| /events | n/a | P2 | Same error-page render (see recover:/events). | — |

### persona-erratic (erratic, concurrent-strength-maintenance, day 45)

| Route | SC | Severity | Finding | Fix |
|-------|----|----------|---------|-----|
| /today | 2.4.6 | P0 | No H1 (see §2.1). | See §2.1 |
| /today | 4.1.3 | P0 | "Not feeling 100%?" collapsed signal-strip button is present (`SignalsStrip.tsx:180`) — accordion state `aria-expanded="false"`. Expand does not project any live-region update; a screen reader user must know to activate the button to hear the reason. Not a fail on its own — the button pattern is fine — but 19 day_adjustments accumulated over 45 days is the highest-density surface, and none of them announced when accepted. | See §2.4 |
| /today | 1.4.11 | P1 | Warm-amber Signals-strip button: text `text-strong` on `bg-amber/10` computes to ~15:1 — good. Border-left `border-l-amber` on ground = 8.84:1 — good. The state pill inside "Not feeling 100%?" (`DayAdjustmentProposal.tsx:96-100`) uses `bg-amber/20 text-amber` on card `bg-amber/10` — text amber on amber/20 background layered over ground computes to ~6.4:1 for the pill — fine. | — |
| /coach | ok | ok | Coming-soon placeholder. H1 Coach present. | — |
| /history | 4.1.2 | P1 | 45-day heatmap × 15 skipped days = many "skipped" cells rendered as `bg-line-soft border-dashed border-line` — visually indistinguishable from "no activity" (see recover:/history 1.4.11). aria-label distinguishes: "2026-06-01: skipped" vs "…: no activity" — SR ok, sighted low-vision users can't tell. | See recover:/history |
| /history | 1.3.1 | P1 | H2 "Symptoms — last 30" present but 15 skipped days means very sparse sparklines. Sparkline SVG (`next-app/src/app/history/page.tsx`) — verify each `<svg>` has aria-hidden or aria-label. | Check source; add aria-label to sparkline SVGs with "Groin trend, last 30 days: last non-zero 2 on Jul 12" or similar. |
| /progress | 1.1.1 | P0 | Recharts chart unlabelled (see §2.5). | See §2.5 |
| /progress | 1.3.1 | P0 | H3 Week-of skip (see §2.6). | See §2.6 |
| /programs | ok | ok | — | — |
| /profile | 2.4.6 | P0 | No headings (see §2.2). Also — profile compliance summary "Sessions 0/7 · Morning checks 0/7" is a hard truth for this persona but shown without semantic labels. | See §2.2 |
| /data | 1.3.1 | P1 | Same. | See recover |
| /report | 1.3.1 | P0 | Two H1s (see §2.7). | See §2.7 |
| /guide | ok | ok | — | — |
| /extras | 1.3.1 | P2 | H1 Extras but 0 H3 (no exercises available for CSM) — DOM captures 0 H3. Empty state may or may not be intentional. | Confirm intended layout. |
| /check | 1.3.1 | P1 | Same slider label issue. | See recover:/check |
| /events | n/a | P2 | Same error render. | — |

---

## 4. Contrast ratio table (palette)

Ground bg = `#0e0f12` (var(--color-ground)). Surface = `#16181c`. Surface-2 = `#20232a`.

| Token | Hex | Against bg | Ratio | Role | Pass @ AA |
|-------|-----|------------|-------|------|-----------|
| `text-ink` | #d6d9de | ground | 13.54:1 | body | yes |
| `text-strong` | #f4f5f7 | ground | 17.57:1 | headings | yes |
| `text-muted` | #8a8f9a | ground | 5.91:1 | secondary body | yes |
| `text-muted` | #8a8f9a | surface | 5.48:1 | secondary body on card | yes |
| `text-muted` | #8a8f9a | surface-2 | 4.85:1 | secondary body on bottom-nav | yes (borderline) |
| `text-muted/60` | 60% #8a8f9a | ground | 2.86:1 | tiny meta ("→") | **no (1.4.3)** |
| `text-muted/70` | 70% #8a8f9a | ground | 3.48:1 | date in history, citation | **no (1.4.3)** |
| `text-muted/80` | 80% #8a8f9a | ground | 4.16:1 | tier rationale in `TierAdvanceProposal.tsx:39` | **no (1.4.3)** |
| `text-bronze` | #c89666 | ground | 7.31:1 | primary CTA, brand | yes |
| `bronze/40` focus-ring | ~mix | ground | 2.11:1 | focus indicator | **no (1.4.11 & 2.4.11)** |
| `text-slate` | #79b8c4 | ground | 8.64:1 | secondary CTA / suggestion | yes |
| `text-slate` | #79b8c4 | surface | 8.01:1 | on card | yes |
| `text-green` | #5fb37a | ground | 7.50:1 | pass/tag | yes |
| `text-green` on `green/10` bg | #5fb37a | ~#151f18 | 6.59:1 | ReadinessProposal caption | yes |
| `text-amber` | #e0a63a | ground | 8.84:1 | warning caption | yes |
| `text-amber` on `amber/10` | #e0a63a | ~#221c14 | 7.63:1 | banner caption | yes |
| `text-red` | #e5654b | ground | 5.74:1 | error, red-day pill | yes |
| `text-red` on `red/10` | #e5654b | ~#221513 | 5.16:1 | error banner | yes |
| `border-line` | #2a2e37 | ground | 1.41:1 | card border | **no (1.4.11 non-text)** |
| `placeholder:text-line` | #2a2e37 | surface | 1.31:1 | input placeholder in SetRow | **no (1.4.3)** |
| `text-lat-left` bg pill | #4a8894 | on surface via `text-surface` fg | 4.44:1 | L/R pill background text | **no (1.4.3 small-text)** |
| `text-lat-right` bg pill | #a279a8 | on surface via `text-surface` fg | 4.94:1 | L/R pill background text | yes (borderline) |

Notable pass: after the earlier audit's slate bump from #4a8894 to #79b8c4, primary secondary text passes at 8.64:1. Notable fail: `border-line` at 1.41:1 is the app's card boundary — for the whole surface hierarchy this is invisible to low-vision users. WCAG 1.4.11 applies when the border conveys information; on this app the card boundary distinguishes one exercise-card from the next, so 3:1 is required.

---

## 5. Charts & data-viz (dedicated section)

**Heatmap** (`next-app/src/components/charts/Heatmap.tsx:113-181`):
- SR treatment: each cell is `<button aria-label="2026-07-15: red day (3 exercises) · today">` when interactive, `<span role="gridcell" aria-label="…">` otherwise. Aria naming is thorough.
- Structural issue: outer `<div role="grid">` (line 114) with children that are `<button>` (line 140) or `<span role="gridcell">` (line 158) — inconsistent. Buttons are not `role="gridcell"`, so grid navigation (arrow keys) is not implemented. Row labels Mon..Sun (line 120-123) are `aria-hidden`, so grid row headers are missing.
- Recommendation: **drop `role="grid"`**. It sets an expectation of grid keyboard nav that the component does not implement. Replace with `<ul aria-label="Activity, last 12 weeks">` and per-cell `<li><button aria-label="…"/></li>`. This is a semantically correct, keyboard-tabbable list; the exact NVDA reading works.
- Also 1.4.11: skipped cells (`bg-line-soft border-dashed border-line`) — the dashed border is invisible at 1.41:1. Add a small inline diagonal-hatch pattern or an inner dot to convey "skipped" without contrast.

**SymptomLoadChart** (`next-app/src/components/charts/SymptomLoadChart.tsx:56-146`):
- SR treatment: none. Recharts injects `<svg role="application" tabindex="0">` and the wrapper does not override. Bars/lines are inaccessible to SR.
- 1.1.1 fail; 4.1.2 fail (no name for the application widget).
- Recommendation: (a) wrap in `<figure role="figure" aria-label="…">` with a sibling `<div className="sr-only">` containing a computed text summary (min/max/trend for each series over the visible window); (b) `aria-hidden="true"` on the ResponsiveContainer inner div; (c) provide a "View as table" toggle that swaps the chart for a `<table>` of dates × series. Modern chart-a11y pattern (see Adrian Roselli, David Storey), not a research project.

**Report chart** (same Recharts instance in `next-app/src/app/report/page.tsx`) — same treatment needed.

**Progress sparklines on History** — verify each `<svg>` for aria-hidden or aria-label; body-text summary above it (e.g. "Groin trend last 30 days: peak 5 on Jul 06, last non-zero 2 on Jul 12"). Not audited in detail — see per-persona table.

---

## 6. Forms (dedicated section — this is where rehab data lands)

**Morning check** (`next-app/src/app/check/page.tsx`):
- Sliders: `<input type="range">` at line 232-245 have `aria-label`, `aria-valuemin`, `aria-valuemax`, `aria-valuenow`, `aria-valuetext`. Value-text says "3 out of 10" — clean.
- Visible label: `<label id="sym-groin">` (line 221) with no `htmlFor` — the label word is not clickable to focus the slider. Body text of the slider region works via `aria-label` but a mouse user tapping the word "Groin" gets nothing.
- Checkboxes (line 265-274) — properly wrapped in `<label>`, no id/for dance needed. Good.
- Outside-training input (line 170-177) has `<label htmlFor="outside-training">` on line 164-169. Good.
- Save button — clear label "Save check". Verdict output (`<Verdict>` at line 277-300) — not a live region. Saving triggers a state change and renders the verdict below; SR users don't hear it. **4.1.3 fail.**
- Fix: `<div role="status" aria-live="polite">…verdict…</div>` OR add `aria-live` on the parent container that toggles it.

**Log form (SetRow)** (`next-app/src/components/workout/SetRow.tsx`):
- Weight/reps/RPE inputs (lines 53-112) have `aria-label` "Set N weight/reps/RPE" — good.
- Placeholder shows prescribed OR previous value — `placeholder:text-line` at 1.31:1 is a 1.4.3 fail (see §2.8).
- Set-note toggle (line 113-127) has `aria-expanded={notesOpen}` — good — and `aria-label` distinguishing add vs edit — good.
- Textarea for notes (line 154-161) has `<label htmlFor="set-note-N">` on line 153 — good.
- PR announcement (`<output aria-label="Personal record: 92.5 kilograms for 5 reps">` at line 141-147) — uses `<output>` which is an implicit live region (role=status). Solid. But: the `<output>` is inside the article, not inside an announcer element that persists across mounts, so the moment the PR set is not the latest, the `<output>` unmounts. Testing on NVDA/JAWS: this works because the SR reads the `<output>` insertion. On VoiceOver Safari, `<output>` announcements are inconsistent — safer to use `role="status" aria-live="polite"` on the containing element.

**Onboarding** (`next-app/src/components/Onboarding.tsx:140-166`):
- `role="dialog" aria-modal="true" aria-labelledby="onboarding-title"` — clean.
- `aria-live="polite"` on step-content region (line 166) — good.
- Escape key not handled (no `onKeyDown={... if e.key==='Escape'}`). ARIA APG dialog pattern strongly recommends Escape close. Not a hard SC fail (WCAG doesn't mandate Escape); but 2.1.2 "no keyboard trap" is fine because user can tab out.

**Events form** (`next-app/src/app/events/page.tsx:104-161`): only reachable by super-admin; every field has a proper `<label>` above the input. `focus:ring-bronze/40` fails focus contrast (§2.9).

**Coach chat** (`next-app/src/app/coach/page.tsx:304-316`): textarea unlabelled — see §2.10.

**Auth forms** (`next-app/src/app/(auth)/sign-in/page.tsx`, `sign-up/page.tsx`, `reset-password/page.tsx`): labels look present on inspection — spot-check confirmed at `sign-in:82-86` uses `<label htmlFor="email">Email</label>`. Focus ring alpha issue applies (§2.9).

**Errors**: forms don't identify errors in text — most (e.g. weight input `clamp(n, 0, 500)` at SetRow:168-171) silently clamp invalid values. This is not a 3.3.1 fail on its own (silent success is fine), but it prevents 3.3.3 error-suggestion when the user tries to enter a number they think is valid.

---

## 7. Priorities

**P0 (blocking, ship before beta):**
- **1.4.4** — remove `maximumScale: 1, userScalable: false` from `next-app/src/app/layout.tsx:49-51`.
- **2.4.6 / 1.3.1** — add `<h1 className="sr-only">Today</h1>` to `next-app/src/app/page.tsx`, `<h1 className="sr-only">Profile</h1>` + promote section titles to `<h2>` in `next-app/src/app/profile/page.tsx`.
- **1.3.1** — fix H1→H3 skip: change `next-app/src/components/WeeklyNarrativeTile.tsx:41` `<h3>` → `<h2>`.
- **1.3.1** — remove duplicate print H1 in `next-app/src/app/report/page.tsx:180`; use CSS media-query to swap classes on a single H1.
- **1.1.1 / 4.1.2** — wrap Recharts `<ResponsiveContainer>` with `<figure aria-label>` + sibling `sr-only` text summary + `aria-hidden` on the inner chart. `next-app/src/components/charts/SymptomLoadChart.tsx:84-146`. Same treatment in Report's chart.
- **4.1.3** — add a persistent live-region container in `next-app/src/app/page.tsx` and write short strings from ReadinessProposal/DayAdjustmentProposal/TierAdvanceProposal Accept handlers.
- **1.3.1 / 3.3.2** — label the Coach textarea in `next-app/src/app/coach/page.tsx:304`.

**P1 (do this month):**
- **1.4.11 / 2.4.11** — remove `/40` alpha on `focus:ring-bronze`; use full-opacity bronze rings across the ~15 forms listed in §2.9.
- **1.4.3** — SetRow `placeholder:text-line` → `placeholder:text-muted/70` in `next-app/src/components/workout/SetRow.tsx:73/95`.
- **1.4.3** — replace `text-muted/60`, `text-muted/70`, `text-muted/80` usages (`next-app/src/app/history/page.tsx:320`, `next-app/src/app/programs/page.tsx:225`, `next-app/src/app/programs/[slug]/ProgramPreviewClient.tsx:193`, `next-app/src/components/workout/TierAdvanceProposal.tsx:39`, `next-app/src/components/workout/SuggestionBox.tsx:38`, `next-app/src/app/page.tsx:247`) with full `text-muted`.
- **1.4.11** — `border-line` at 1.41:1 → introduce `--color-line-strong` at ≥3:1 for card boundaries where the line carries meaning; keep current `border-line` only for decorative rules.
- **4.1.2** — Heatmap: drop `role="grid"`; convert to `<ul>` of `<li><button/></li>`. `next-app/src/components/charts/Heatmap.tsx:114`.
- **1.4.11** — Heatmap "skipped" cells need non-border differentiator (icon or pattern).
- **1.3.1** — check-page slider label linkage: add `htmlFor` on `<label>` in `next-app/src/app/check/page.tsx:221` OR nest the input inside the label.
- **4.1.3** — Verdict banner in `next-app/src/app/check/page.tsx:277-300` → wrap in `role="status" aria-live="polite"`.
- **4.1.3** — SetRow PR `<output>` → wrap the surrounding region in `role="status" aria-live="polite"` for cross-SR consistency (VoiceOver drops `<output>`).

**P2 (nice to have):**
- Skip link ("Skip to main content") as first tabbable element. WCAG 2.4.1 is Level A but the current top-header has 4 links before main; skip-link would help keyboard users. Add to `next-app/src/components/AppShell.tsx` above the `<header>`.
- Modal Escape handling: `VideoModal`, `InfoSheet`, `ExerciseDetailsSheet`, `Onboarding` don't respond to Escape (only `ConfirmSheet` does at line 50). ARIA APG dialog convention; not a WCAG fail.
- Reduced motion: `next-app/src/app/globals.css:130` (`main { animation: route-in 150ms }`) fires unconditionally. Not a 2.3.3 (AAA) hard fail — motion is brief and non-flashing — but add `@media (prefers-reduced-motion: reduce) { main { animation: none } }`. Same for `pulse-accept`, `mark-done`, `tag-in`, and the button active-scale in `globals.css:118-122`.
- Bottom-nav labels at 9px (`next-app/src/components/nav/BottomNav.tsx:42`) — with viewport unlocked (P0 fix) users can zoom, but consider bumping to 10-11px.
- Estonian medical terms (FADIR, iliopsoas) appear in Guide and clinical-context content — consider `<abbr title="Flexion Adduction Internal Rotation">FADIR</abbr>`. Not a WCAG fail, a comprehension nudge.
- `/events` renders as Next `__next_error__` for non-super-admin — either return a proper 403 page with H1 or fix the routing gate. → see app-audit-N-copy-clarity for the user-facing message; the a11y concern is just having a real H1.

**Deferred (out of my scope):**
- Tap-target sizes ≥ 44×44 — WCAG 2.5.8 (AA in 2.2); the app is generally good (min-h-[44px] and w-11/h-11 patterns) but a systematic audit is → see app-audit-N-mobile-ux.
- Copy tone on error and empty states → see app-audit-N-copy-clarity.
- Type-scale hierarchy / visual density → see app-audit-N-visual-craft.
- Motion timing and jank → see app-audit-N-motion-perf.
