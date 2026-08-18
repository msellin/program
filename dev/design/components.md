# Terav component inventory

Canonical inventory of button / form / card / progress / nav / layout patterns
across landing (`landing/`) and app (`next-app/`). Companion to
[`tokens.md`](./tokens.md).

**Rules of use:**

1. If you need a button, pick a variant from this doc. Do not invent.
2. If your case doesn't fit any variant, propose a new one HERE (pull request),
   then use it. Don't ship the divergent one-off and "we'll clean up later."
3. Every component uses tokens from `tokens.md`. If it doesn't, either the
   token is missing (add) or the component is wrong (fix).
4. When you change a component here, run a grep for its class strings and
   update every instance in the same PR.

---

## Buttons

### 1 · Landing hero CTA (pill, bronze gradient)

**When**: landing marketing CTAs only. "Pick my focus", "Start", any
convert-focused button on `landing/`.

**Shape**: full pill (`rounded-full`), generous padding, bronze gradient,
black text, bronze-glow shadow, sentence-case sans-serif semibold.

```jsx
<a
  className="group inline-flex w-full items-center justify-center rounded-full
             bg-gradient-to-r from-[var(--color-bronze-hi)] to-[var(--color-bronze-lo)]
             px-6 py-3.5 text-sm font-semibold text-black
             shadow-[0_10px_40px_-10px_rgba(208,154,104,0.6)]
             transition hover:brightness-110 sm:w-auto sm:text-base"
>
  Pick my focus
</a>
```

Padding scales: hero uses `px-7 py-4 text-base`; in-section CTAs use
`px-6 py-3 text-sm`.

**Never use in the app.** The app has its own primary. Mixing pill + gradient
into the app's flat surface breaks the utility feel.

### 2 · App primary action (solid bronze, small radius, mono-caps)

**When**: the ONE most-important button on a screen — Accept a proposal, Start
program, Submit log, Continue.

**Shape**: `rounded` (4px), solid bronze fill, mono-caps 11px uppercase, min
44×44 tap target.

```jsx
<button
  className="font-mono text-[11px] uppercase tracking-wider px-3 py-2 rounded
             bg-bronze text-ground hover:bg-bronze-hover min-h-[44px]
             disabled:opacity-40 disabled:cursor-not-allowed"
>
  Accept
</button>
```

Full-width variant swaps `px-3` for `w-full inline-flex items-center justify-center gap-1.5 px-4 py-3`.

### 3 · App secondary action (outline, small radius, mono-caps)

**When**: the alternative to a primary — Ignore, Skip, Cancel, Back.

**Shape**: `rounded` (4px), transparent, `border border-line`, mono-caps
11px, min 44×44.

```jsx
<button
  className="font-mono text-[11px] uppercase tracking-wider px-3 py-2 rounded
             border border-line text-ink hover:bg-line-soft min-h-[44px]
             disabled:opacity-30 disabled:cursor-not-allowed"
>
  Back
</button>
```

### 4 · App ghost button (no border, no fill)

**When**: tertiary actions in a dense row (top-of-page Back link, "Add another"
in a list, header quick links).

**Shape**: no border, no fill. Icon + label. Colored by role — slate for
navigation, muted for meta.

```jsx
<Link className="inline-flex items-center gap-1 text-[13px] text-slate hover:text-ink">
  <ChevronLeft size={14} />
  Back to program
</Link>
```

### 5 · App danger action (red)

**When**: destructive with lasting effect — delete event, clear log,
remove program.

**Shape**: solid red, mono-caps, otherwise identical to primary. Consider
a confirm-first pattern before the destructive fires.

```jsx
<button
  className="font-mono text-[11px] uppercase tracking-wider px-3 py-2 rounded
             bg-red text-strong hover:brightness-110 min-h-[44px]"
>
  Delete
</button>
```

### 6 · Chip (compact rectangular selection)

**When**:

- Yes/No boolean answers
- Numeric strip (e.g. `2 · 3 · 4 · 5 · 6 · 7` days per week)
- Filter pills at the top of a catalog (`All · Rehab · Strength`)
- Tag badges (status chips, category chips)

**Do NOT use** for 3+ options with word-labels — those become option rows
(next variant).

**Shape**: `rounded` (4px), border, min 44×44. Picked = bronze border + bronze/15
fill.

```jsx
<button
  className="text-[14px] px-4 py-3 rounded border min-h-[48px]
             border-line bg-surface text-strong hover:border-slate/40"
  // picked: replace with
  //   border-bronze bg-bronze/15 text-strong
  // safety-gate unsafe picked:
  //   border-red/50 bg-red/10 text-red
>
  {label}
</button>
```

### 7 · Option row (stacked list-item selection) *NEW 2026-08-18*

**When**: 3+ options with word-labels or option-with-description. Radio-picker
UX. Any intake `select` question that isn't Yes/No or a numeric strip.

**Rule from intake audit 2026-08-18**: in a wizard where the chip row IS the
screen, chips read as tags. Convert to stacked option rows with radio dots. The
review screen's tier picker at `IntakeClient.tsx:513-543` is the canonical
implementation.

**Shape**: full-width row, left radio dot, label + optional secondary line,
right padding for tap target. Min 52px.

```jsx
<button
  type="button"
  onClick={() => onPick(id)}
  className={cn(
    "w-full text-left rounded border px-3 py-2 flex items-start gap-2 min-h-[52px]",
    selected
      ? "border-bronze bg-bronze/10"
      : "border-line hover:border-slate/40 bg-surface",
  )}
>
  <div
    className={cn(
      "mt-0.5 w-4 h-4 rounded-full border flex-shrink-0 flex items-center justify-center",
      selected ? "border-bronze bg-bronze" : "border-line",
    )}
  >
    {selected ? <Check size={11} className="text-ground" strokeWidth={3} /> : null}
  </div>
  <div className="min-w-0 flex-1">
    <p className="text-sm font-semibold text-strong">{label}</p>
    {secondary ? <p className="text-[12px] text-muted mt-0.5">{secondary}</p> : null}
  </div>
</button>
```

**Safety-gate variant**: when the row's value trips a gate, apply
`border-red/50 bg-red/10` and swap the dot color to red.

### Button decision tree

```
Is it landing marketing? ─→ Variant 1 (hero pill)
Is it destructive?       ─→ Variant 5 (danger)
Is it primary action?    ─→ Variant 2 (solid bronze)
Is it secondary action?  ─→ Variant 3 (outline)
Is it a nav / meta link? ─→ Variant 4 (ghost)
Is it a selection?
  ├─ 2 options (Y/N)      ─→ Variant 6 (chip)
  ├─ numeric strip 2–7    ─→ Variant 6 (chip)
  ├─ 3+ options w/ words  ─→ Variant 7 (option row)
  └─ filter / tag         ─→ Variant 6 (chip)
```

---

## Form primitives

### Text input

```jsx
<input
  type="text"
  className="w-full text-[15px] px-3 py-3 min-h-[48px] border border-line rounded bg-surface
             focus:outline-none focus:ring-2 focus:ring-slate/40 focus:border-slate"
/>
```

Compact variant (`text-[13px] px-2 py-1.5 min-h-[44px]`) allowed inside dense
tables (e.g. SetRow) but not inside primary flows.

### Number input

Same shape as text input. Add `inputMode="decimal"` and
`min` / `max` / `step` where applicable. Native spin buttons are hidden
globally via `globals.css`.

### Date input

Same shape as text input with `type="date"`. Question ids ending in `_date` in
intake JSON get date input automatically (`IntakeClient.tsx` `q.id.endsWith("_date")`).

### Checkbox

```jsx
<label className="flex items-start gap-3 cursor-pointer">
  <input type="checkbox" className="mt-1 flex-shrink-0 w-5 h-5" />
  <span className="text-[14px] text-strong leading-relaxed">{label}</span>
</label>
```

Minimum tap target for the checkbox itself: 20×20. The whole label is
clickable — that widens the target to the row width.

### Range slider

Uses native `<input type="range">` with `accent-color: var(--color-bronze)`
applied globally. No custom skinning.

---

## Cards

### Surface card

The default container for grouped content.

```jsx
<section className="rounded border border-line bg-surface p-4 space-y-3">
  <header>…</header>
  <div>…</div>
</section>
```

**Padding scale**: `p-3` compact, `p-4` default, `p-5` breathing room.

### Callout — bronze (invitation)

For "you did the thing" or "look here" moments.

```jsx
<section className="rounded border border-bronze/40 bg-bronze/10 p-4 space-y-2">…</section>
```

### Callout — red (block / danger)

For safety-gate trips, hard blocks, destructive confirmations.

```jsx
<div className="rounded border border-red/40 bg-red/10 p-4 space-y-2">
  <p className="font-semibold text-red flex items-center gap-2">
    <ShieldAlert size={16} />
    {title}
  </p>
  <p className="text-[13px] text-strong">{body}</p>
</div>
```

### Callout — amber (warning)

Same shape as red, swap tokens.

### Empty state

Use `<EmptyStateCard>` (`next-app/src/components/EmptyStateCard.tsx`).
Signature: `{title, body, cta?: {href, label}}`.

---

## Progress

### Wizard progress rail

Sticky top rail with a thin bronze fill on a `line-soft` track.

```jsx
<div
  role="progressbar"
  aria-valuenow={currentIndex + 1}
  aria-valuemin={1}
  aria-valuemax={total}
  className="sticky top-0 z-30 -mx-4 px-4 py-2 bg-ground/95 backdrop-blur-sm border-b border-line-soft"
>
  <div className="flex items-center gap-3">
    <div className="h-[3px] flex-1 rounded-full bg-line-soft overflow-hidden">
      <div
        className="h-full rounded-full bg-bronze transition-[width] motion-reduce:transition-none"
        style={{ width: `${pct}%` }}
        aria-hidden
      />
    </div>
    <span className="font-mono text-[10px] text-muted uppercase tracking-widest whitespace-nowrap">
      {currentSection} · Step {currentIndex + 1} of {total}
    </span>
  </div>
</div>
```

**Rule from intake audit 2026-08-18**: put the section name IN the rail
(`SCREENING · Step 3 of 12`) rather than as a separate paragraph below.

### Data progress bar (linear)

`h-1 bg-line-soft` track, `bg-bronze` fill. Used for per-set completion, tier
% arcs. Same primitive as wizard rail; different context.

### Progress dots

Reserved for onboarding step indicators where each step deserves a discrete
visual — 3-5 total. Do not use for wizards with 10+ steps (that's what the rail
is for).

---

## Navigation

### App bottom nav

Fixed 5-tab surface. `fixed left-0 right-0 bottom-0 z-40 border-t border-line
bg-surface-2 pb-[env(safe-area-inset-bottom)]`. Hidden during iOS keyboard
open + on focused single-purpose routes (currently `/programs/*/intake`).

Do not add tabs. Do not repurpose tabs. If Coach or Retest earns a top-level
slot, it goes in Profile until it's proven.

### Top back link

Ghost button (Variant 4) with `ChevronLeft size={14}`. Only one per screen.

**Rule from intake audit 2026-08-18**: never render both a top back link AND
a footer Back button that go to different places. Pick one anchor per screen.

---

## Modals / overlays

- **z-index scale**: BottomNav is `z-40`. Modals sit at `z-50`. OnboardingRunner
  is `z-[60]` because it must always win the z-race — previous IntroGallery bug
  taught us the lesson.
- **Backdrop**: `bg-ground/95 backdrop-blur-sm`.
- **Body**: `bg-surface border border-line rounded-t-lg sm:rounded-lg
  w-full max-w-xl max-h-[85vh] overflow-auto` — sheet on mobile, dialog on
  desktop.
- **Focus trap**: use `useFocusTrap` hook. Falls back to first focusable
  element when the trigger element unmounts.

---

## Layout

### Max-widths

See `tokens.md` Spacing → Container widths.

### Sticky patterns

- **Sticky top progress**: `sticky top-0 z-30`, `-mx-4 px-4` to break out of
  the container's horizontal padding.
- **Sticky bottom footer**: `fixed left-0 right-0 bottom-0 z-40` for global
  chrome. `fixed bottom-0 z-50` only when the surface is a focused flow AND
  BottomNav is hidden.
- **Every fixed-bottom element** must include `pb-[env(safe-area-inset-bottom)]`
  or wrap children in a `paddingBottom: env(safe-area-inset-bottom)` container.

### Wizard body constraint *NEW 2026-08-18*

Wizard content AND wizard footer both constrain to `max-w-2xl mx-auto`. Prevents
the footer from reading as a floating tab bar on desktop; body + footer align
vertically as one flow.

---

## Pictograms

CSS-only decorative glyphs. Zero SVG pipeline.

**Sizes:**

| Context | Size | Reasoning |
|---|---|---|
| Inline row leading | 40×40 | Enough presence to signal "this is a movement question," not so big it dominates |
| Chip prefix | 24×24 | Rare — only where the chip is huge |
| Screen-hero | ~~96×96~~ | **REJECTED per intake audit 2026-08-18** — reads as image placeholder. Do not use. |

**Style**: bronze at 60-80% opacity, drawn with `border` + pseudo-elements.
`aria-hidden` always.

Reference implementation: `PictogramTile` in `IntakeClient.tsx`.

---

## Block state → color mapping (canonical)

**Rule from 2026-08-18 audit** — every surface that renders a scheduled
block's state must use the exact same color per state. This keeps Today's
per-program menu, Week's dot cluster, History's chip, and Progress's
adherence bar visually synchronous.

| State | Color token | When |
|---|---|---|
| `planned` | `bg-muted/60` | Default upcoming state |
| `done` | `bg-green` (or `bg-green/20 text-green` for chips) | Completed session |
| `skipped` | `bg-amber` (chip: `bg-amber/20 text-amber`) | User explicitly skipped |
| `moved` | `bg-slate` (chip: `bg-slate/20 text-slate`) | Rescheduled to another day |
| `amber_downshifted` (chip: "eased") | `bg-amber/60` (chip: `bg-amber/20 text-amber`) | Engine-softened |
| Today (planned) | `bg-bronze` overrides `bg-muted/60` | Current day only |

**Terminology map** — user-facing chip labels:
- `done` → "done"
- `skipped` → "skipped"
- `moved` → "moved"
- `amber_downshifted` → "eased" (never "downshifted" in a user-facing chip)

Reference implementations:
- `PerProgramAdherenceCard` stacked ratio bar
- `Week` dot-per-program cluster + `perProgramDayStates` helper
- `BlockHistorySection` `stateChip()` helper
- `PerProgramActions` amber/slate banner border-l

## Component adoption rules (for future contributors)

- Pull class strings straight from this doc. Copy-paste is fine.
- If a component would be reused in 3+ places, extract to
  `src/components/ui/` and name it. Update this doc's example to point at the
  extracted component.
- If a component is a one-off but has non-obvious spacing/motion/state
  math, cite the token or the rule in a comment (`// tokens.md#buttons#2`).
- If your case really needs something new — propose a variant in a PR that
  updates this doc AND uses the variant in one place.

---

## Change log

- 2026-08-18 — initial bootstrap. Adds Variant 7 (Option row) and the wizard
  body/footer max-width rule from the 2026-08-18 intake audit. Pictogram hero
  size (96×96) explicitly rejected.
