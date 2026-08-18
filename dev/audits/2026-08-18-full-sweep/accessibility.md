# Full-sweep accessibility audit — 2026-08-18

Scope: intake wizard rewrite + block-object rebuild (Phases A–F) surfaces shipped today.
Standard: WCAG 2.2 AA. Palette source: `next-app/src/app/globals.css`.

---

## 1. Top 3 to fix this week (P0)

1. **Wizard step change is silent to SR and does not move focus.** `IntakeClient.tsx:653–688` renders a new `<h2>` per step but nothing announces the change and focus stays on the pressed Next button (a fixed-footer control that survives step transitions). NVDA / VoiceOver users cannot tell they advanced. SC 4.1.3 (Status Messages) + SC 2.4.3 (Focus Order). Fix: on `stepIndex` change, focus a `ref`-tagged step heading (`tabIndex={-1}`) inside the `min-h-[280px]` container, AND wrap that container in `role="region" aria-live="polite" aria-labelledby="wizard-step-heading"`. Two lines.

2. **Option-row `<button>` list is not a radio group and has no arrow-key navigation.** `IntakeClient.tsx:793–847`: single-select "one answer at a time" rendered as a `<ul>` of `<button>` elements. Every button becomes a tab stop and none announces the "1 of 4 selected" semantic. SC 4.1.2 + SC 2.1.1. Fix: put `role="radiogroup" aria-labelledby={qHeadingId}` on the `<ul>`, `role="radio" aria-checked={picked}` on each button, `tabIndex={picked ? 0 : -1}` so only the selected radio is in tab order, and add ArrowUp/Down/Left/Right handlers that move focus + call `setAnswer`. Same treatment for the boolean and chip strips at `:878–902` and `:850–874`.

3. **Block-state changes (Skip / Move / Restore / Skip whole day) are not announced.** `useStore.ts:928–1036` commits state and mutates the store; no `announce()` call. On Today (`page.tsx:376–418`) the affected card unmounts or morphs into an amber "Skipped today" banner (`PerProgramActions.tsx:57–82`) with no live-region update. SR users lose the confirmation loop that legacy `SessionActions` provided. SC 4.1.3. Fix: import `announce` from `@/lib/announce` and call it inside each action, e.g. `announce(\`${programName} skipped today.\`)` at the confirm-callback site in `PerProgramActions.tsx:113` and `:126`, and `announce("Whole day skipped.")` at `page.tsx:478`. `announce()` already exists and the live region is already mounted at shell level.

---

## 2. Findings by surface

### `IntakeClient.tsx`

- **Progressbar is well-formed but its visual bar is styled with a `<div>` sibling; passes SC 1.3.1** — `:715–735`. Uses `role="progressbar" aria-valuenow/min/max`. Percent-fill span is correctly `aria-hidden`. OK.
- **Step count `Step X of Y` is not in a live region** — `:730`. When step changes, SR users get no announcement (see P0 #1). SC 4.1.3.
- **Question `<h2>` uses SC-neutral hierarchy but has no `id` tied to the answer group** — `:767–770`. Fix by adding `id={\`q-${q.id}\`}` and referencing it from the wrapping radiogroup / group. SC 1.3.1.
- **Placeholder used as the only label for number and date inputs** — `:904–935`. `q.label` is the `<h2>` above, so the input has no `aria-labelledby`. Add `aria-labelledby={\`q-${q.id}\`}` (and the id above). SC 3.3.2 + 1.3.1.
- **`min={new Date().toISOString().slice(0,10)}` on the date input silently blocks past dates without any accessible error** — `:924`. If a user types a past date, the browser rejects it with locale-dependent UI or nothing. SC 3.3.1: pair with an inline `<p role="alert">` under the input when `Date.parse(value) < today`.
- **Safety-gate inline block panel is a paragraph stack, not a status role** — `:937–948`. When a picked option flips the answer into a hard-block, `showGateBlockInline` re-renders content and the user's SR does not announce it. SC 4.1.3. Wrap the block panel in `role="alert"` (assertive is correct here — this stops progression).
- **`aria-hidden` on the check-mark div is fine, but the button's accessible name is only the label text** — `:812–826`. When `unsafePicked` fires the visible cue is a red border; no announcement of "unsafe answer" beyond color. SC 1.4.1 (Use of Color): add `aria-describedby` pointing at the gate block panel's id, and add a visually hidden `sr-only` marker (e.g. "Unsafe answer — cannot continue.") to the selected row.
- **`WizardFooter` Next button uses `title` attribute for the "answer above to continue" hint** — `:1092`. `title` is not a reliable accessible label / tooltip on touch. When disabled, SR users just hear "Next, dimmed." Fix: expose the message as `aria-describedby` on the disabled button, and mirror it as visible sub-text below the button on mobile. SC 3.3.1 / SC 1.3.1.
- **Reviewing screen "Recommended tier" section — buttons work but focus lands where?** — `:517–544`. Toggling `overrideTier` mutates state without moving focus back to the confirm-primary. Minor; SC 2.4.3.
- **`.mono-caps` at `:730` is `text-muted` on `--color-ground` (#8a8f9a on #0e0f12) — ~6.5:1** — passes SC 1.4.3.
- **Sticky top progress rail is inside `-mx-4 px-4` and stays on scroll — no keyboard shortcut to skip past it**. Not a WCAG blocker (single element, no landmark), but consider `role="progressbar"` alone is enough — do not add `role="region"`.
- **Fixed footer overlays content near bottom, not accounted for by scroll padding** — `:1067–1102`. Wizard body uses `pb-32` (`:634`). Confirm this always exceeds footer height with safe-area — currently OK on iPhone 15. SC 1.4.10 (Reflow) passes.

### `ScaleAnchorStep.tsx`

- **`h2 id="onboarding-title"` labels the parent dialog** — clean. SC 1.3.1 + 4.1.2 OK.
- **Anchor tiles are non-interactive `<li>` items** — matches the comment intent. No SR/keyboard issue since not interactive. OK.
- **`text-red` (#e5654b) on `bg-line-soft/40` for "7-10" label** — `:38`. Ratio ~4.9:1, passes SC 1.4.3 for the small mono caption.
- **The three anchor colors (slate / amber / red) are the only cue for severity** — SC 1.4.1. The 0-3 / 4-6 / 7-10 numeric labels ARE a redundant cue, so this passes. Note only.

### `OnboardingRunner.tsx`

- **Modal semantics correct** — `role="dialog" aria-modal="true" aria-labelledby="onboarding-title"` (`:100–103`). SC 4.1.2 OK.
- **`useFocusTrap` engaged, Escape dismisses** — `:73`. Fallback focus on unmount at `useFocusTrap.ts:60–66` is well-thought-through. OK.
- **`How Terav reads you · N of M` uses `aria-live="polite"` on a paragraph that already exists at mount** — `:107`. Correct. SC 4.1.3 OK.
- **Advance button "Next / Start" swap has no live announcement** — `:139`. Low-signal; step content re-renders anyway. Defer.
- **"Skip setup" button has no confirmation for irreversible dismissal** — `:127–133`. Not a WCAG issue but a cognitive one — SC 3.3.4 applies only to legal/financial. Note.

### `BottomNav.tsx`

- **`nav aria-label="Primary"`** — `:38`. Correct. SC 1.3.1 OK.
- **`aria-current="page"` on active link** — `:54`. Correct. SC 4.1.2 OK.
- **`Icon aria-hidden`, label visible** — `:64`. Accessible name is the label text, meets SC 2.4.4 + 4.1.2.
- **Hides on intake route AND on keyboard-open** — `:31, :35`. Hiding on keyboard-up prevents the fixed nav from covering inputs; hiding on intake is intentional per the wizard fixed footer. Reasonable, but SR users on desktop with keyboard-navigation get the nav yanked from under them if `visualViewport` reports a large delta — verify this can't happen on desktop (it can't, per the useKeyboardOpen impl using visualViewport). OK.
- **Text `text-muted` on `bg-surface-2` (#20232a) — ratio ~4.9:1**, passes SC 1.4.3 for the 10px UPPERCASE label (which counts as small text; the 10px is on the low end but tab labels are `font-medium tracking-[0.08em]` which improves legibility. Not a fail, note only).

### `PerProgramActions.tsx`

- **ConfirmSheet / MoveSheet — `role="dialog" aria-modal="true" aria-labelledby={titleId}`** — `:159–161, :237–239`. Correct. SC 4.1.2 OK.
- **`useFocusTrap` used** — `:156, :233`. Auto-focuses first element (the close X), Escape closes. OK.
- **`X` close button has `aria-label="Cancel"`** — `:175, :249`. Correct. SC 4.1.2 OK.
- **Backdrop click closes without announcing** — `:162, :239`. Minor. Defer.
- **Move/Skip 2-button grid** — `:88–105`. Both are real `<button>` with visible labels ("Move" / "Skip"). Icons are non-decorative but the text label already reads correctly; leave icon inline. OK.
- **Reason input in ConfirmSheet has a `<label>` sibling but NOT `htmlFor`** — `:184–192`. The label is a `<label className="mono-caps">Reason (optional)</label>` above the input, not associated. SC 1.3.1 / SC 3.3.2. Fix: add `htmlFor` + `id` OR wrap the input in the label element.
- **Move date input has same bug** — `:258–265`. Same fix.
- **Amber "Skipped today" banner Undo button has no explicit confirmation state** — `:69–79`. Undoing is safe (`restoreBlock` reverts state), fine. SR announcement missing — see P0 #3.
- **State transition not announced** — see P0 #3. SC 4.1.3.
- **`bg-amber` border-l-4 + amber text is the sole indicator of the "skipped" state** — passes 1.4.1 because the word "skipped today" is in the text.

### `app/page.tsx` (Today — new components)

- **`<h1 className="sr-only">Today</h1>`** — `:181`. OK. SC 1.3.1 / 2.4.6.
- **`DayHeaderShortcut`** — `:442–489`. `setConfirming(true)` swaps a single button for a two-button cluster in-place with no live-region announcement, and focus stays on the pressed button (which just unmounted). SC 2.4.3 + 4.1.3. Fix: move focus to "Confirm skip" when confirming becomes true; add `announce("Confirm skip whole day.")`.
- **Confirm skip button removes the day's work without a modal** — cognitive risk, not a WCAG blocker (SC 3.3.4 exempts non-legal / non-financial). Note.
- **Section labels ("×N programs") use `bg-amber/20 text-amber`** — `week/page.tsx:370` and Today headline via `page.tsx:319–330`. Ratio ~7.6:1. Passes SC 1.4.3.
- **`programCount` is a raw number, no accessible pluralization** — `:454`: `"{programCount} programs scheduled today."` — reads fine; if `programCount === 1` never fires (component gated on `multipleProgramsToday`).
- **Per-program group headline `programDisplayName` is `<p className="font-mono ... uppercase">`** — `:380–383`. Not an `<h2>` / `<h3>`. Screen-reader users cannot jump between per-program groups by heading. SC 1.3.1 / 2.4.10. Fix: promote to `<h2>` (visual style unchanged).

### `app/week/page.tsx`

- **Per-program dot cluster is `aria-hidden` with hover title only** — `:333–350`. SR users get zero access to the per-program breakdown; `title` is not exposed to most screen readers on touch. SC 1.1.1 + SC 4.1.2. Fix: replace the `aria-hidden` cluster with an accessible summary — either `role="img" aria-label` with a plain-English summary ("engine-builder: done, handstand-walk: skipped"), OR keep the dots aria-hidden AND add a visually-hidden `<span className="sr-only">` sibling with the same summary. Recommend the sr-only sibling for clarity.
- **Legend row is decorative and aria-hidden dots** — `:196, :202, :205`. The label text sits next to each dot ("planned", "done", "skipped", "moved"). OK. SC 1.4.1 passes because color is not the sole indicator.
- **"Previous week" / "Next week" nav has `aria-label`** — `:130, :151`. Correct. SC 4.1.2 OK.
- **"Now" button `aria-label="Jump to this week"`** — `:160`. OK.
- **Dominant-status dot color mapping** — `:305–314`. Every non-decorative status has a text sibling ("Skipped: reason", "N logged", etc.). SC 1.4.1 passes.
- **Numeric mono `+N` overflow indicator has no accessible equivalent when there are 5+ programs** — `:345–349`. When 5 programs run concurrently (unusual but supported), 4 are shown as dots (hidden) + "+1" is visible mono text. Neither is exposed to SR. Same fix as the cluster.
- **`RulesAccordion` `aria-expanded`** — `:419`. Correct. SC 4.1.2 OK.

### `PerProgramAdherenceCard.tsx`

- **Stacked ratio bar has `role="img" aria-label`** — `:104–108`. Correct — SC 1.1.1 satisfied. Verify label reads correctly: `"25% adherence — 6 done, 2 planned, 3 skipped, 1 moved"`. Solid.
- **Sub-labels under bar duplicate the info** — `:130–134`. Fine as visual reinforcement; not read twice by SR since aria-label handles it.
- **`text-muted` "last 28 days" mono caption** — `:89–91`. Ratio ~5.6:1 on `bg-surface`. Pass.
- **`bg-amber` and `bg-slate` slices** — non-text UI. Need 3:1 against adjacent slices for SC 1.4.11. Amber (#e0a63a) vs. green (#5fb37a) ~1.7:1 — fails 1.4.11 if user relies on color alone to distinguish adjacent segments. Mitigation: the `role="img" aria-label` describes the counts explicitly, and adjacent slices only appear together when both non-zero. Note. Would be stronger with a 1px `border` between slices.

### `BlockHistorySection.tsx`

- **`<h2>` heading correct** — `:66–68`. SC 1.3.1 OK.
- **Chip contrast**: `bg-green/20 text-green` — ~5.7:1, pass. `bg-amber/20 text-amber` — ~7.6:1, pass. `bg-slate/20 text-slate` — ~7.9:1 pass. All SC 1.4.3 pass.
- **`block_template_id` is exposed raw** — `:86`. Not an a11y issue; note for copy team → see app-copy-clarity.
- **Chip class only uses color + label text; label carries the semantic** — SC 1.4.1 OK.
- **Date column is monospace and left-of-title; SR reads "2026-08-15 threshold-row done"** — flows naturally. OK.

### `app/profile/page.tsx` — `BetaFeatureToggles`

- **`<label>` wraps the checkbox + text** — `:325`. Native association via wrapping is valid. SC 1.3.1 + 3.3.2 OK.
- **`<span>` inside `<label>` contains a nested `<span className="font-semibold">` + a "default on" mono badge + a description block** — `:332–343`. All read as one label. Clicking any part toggles the box. OK.
- **"default on" badge is `text-green` on transparent — inherits `bg-surface`** — ratio ~5.7:1. Pass SC 1.4.3.
- **Checkbox has native focus ring via global `*:focus-visible`** — `globals.css:104`. OK.
- **Toggling has no announcement** — the checkbox's own checked state is announced by SR, no additional `announce()` needed. OK.
- **`<section>` has an `<h2>` "Beta features"** — `:319`. OK SC 1.3.1.
- **Description text `text-[12px] text-muted` on `bg-surface`** — `:337`. Ratio ~5.6:1. Pass SC 1.4.3 (small text 4.5:1).

### `SignalsStrip.tsx` — the two block-object changes only

- **`blockObjectMovedIn` detection expands `signals` array** — `:51–56`. The expanded reason under "Rescheduled session" now prefers `move_history[last].reason` — that pathway inherits the strip's `aria-expanded` semantics from `:162–166`. OK. SC 4.1.2 OK.
- **`aria-label="Today's signals"` on the section, `aria-expanded` on the trigger** — `:159, :163`. Correct.
- **When new signals appear (e.g. a fresh move creates the "Rescheduled session" chip), no live announcement** — SC 4.1.3. Consider `announce()` from the store action side (see P0 #3), not here. Note.

---

## 3. What passes cleanly

Modal dialog semantics on `OnboardingRunner`, `ConfirmSheet`, `MoveSheet` are correct: role, aria-modal, aria-labelledby, focus trap, Escape dismiss, focus restoration with fallback. `BottomNav` landmark + `aria-current`. Progress rail SC 1.3.1 landmarks. Contrast on every warm-dark token combo verified — muted-on-ground 6.5:1, muted-on-surface 5.6:1, red-on-red/10 4.9:1, amber-on-amber/10 7.6:1, slate-on-slate/10 7.9:1, green-on-green/20 5.7:1, bronze-on-bronze/10 5.6:1. Slate already retuned to #79b8c4 per the earlier a11y audit — no regressions today. Focus-visible ring globally set via `*:focus-visible { outline: 2px solid var(--color-bronze); }` (`globals.css:104`) covers every button and link in the new components. `role="img"` + `aria-label` on the stacked adherence bar is textbook and reads well. Wizard `role="progressbar"` uses valuenow/min/max cleanly. `<label>`-wraps-`<input>` in `BetaFeatureToggles` and `WizardConsentScreen` is valid form association. `useFocusTrap`'s fallback-on-detached-node (`useFocusTrap.ts:55–66`) is a genuinely thoughtful piece of engineering — leave it alone. Motion: no autoplay, no parallax; `transition-[width] motion-reduce:transition-none` on the progress bar (`IntakeClient.tsx:725`) is the only movement and it honors `prefers-reduced-motion`. SC 2.3.3 OK.

---

## 4. Deferred / low-signal

- **`title` attributes as fallback narration on Week dots and BottomNav** — `title` is unreliable on touch but not a blocker when the underlying issue is fixed by the sr-only sibling recommended above. Once dots have an accessible summary, dropping `title` is fine.
- **`text-slate italic` for "Rescheduled" reason** — SC 1.4.8 discourages italic body but this is a single-line meta line, not blocker.
- **`ChevronRight` / `ChevronUp` / `ChevronDown` `aria-hidden` decisions** — all consistent, decorative-only. OK.
- **`.mono-caps` at 10-11px** — small but tabular-numeric monospace, the contrast is generous, and none of it is the primary content path. Note.
- **`DayHeaderShortcut` "Skip whole day" without a modal confirmation** — cognitive UX call, not SC 3.3.4 (irreversible, but the amber Undo banner restores). Defer.
- **`SR-only` heading `<h1>Today</h1>`** — acceptable pattern; some auditors prefer visible. Keep.
- **`aria-live` on the "How Terav reads you · N of M" line inside a modal** — SR already announces the dialog opening; the live region may double-fire on first mount. Low signal. Note.
- **`humanBlockName` / `humanPhaseName` regex-strips parentheticals from data** — copy team owns → see app-copy-clarity.
- **`intake-tier.ts` inferred tier reveal** — copy team → see app-copy-clarity.
- **Reason inputs in `PerProgramActions` sheets accept unlimited text with no character count** — not an a11y issue.
- **`transform: scale(0.98)` on button/link `:active`** (`globals.css:118`) — SC 2.3.3 exempts brief pointer feedback. OK.
