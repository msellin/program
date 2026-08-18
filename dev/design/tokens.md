# Terav design tokens

Canonical source of truth for colors, typography, spacing, radii, motion, focus
rings, and shadows across **both** the landing (`landing/`) and the app
(`next-app/`).

If you're about to pick a hex value, a font size, a border radius, or an
animation duration — read this first. If a value you need isn't listed, add it
here at the same time you use it (in the same PR). Never add a one-off literal
in a component file "just for this surface" — that's how drift starts, and the
whole point of this doc is to catch it.

If a rule below feels wrong, change it here. Don't just override in code.

Companion: [`components.md`](./components.md) — component inventory (button /
form / card / progress / nav / layout patterns). This doc handles atoms;
components.md handles compositions.

---

## Rule 1 · Accent economy

Adapted from Refactoring UI. Applies to landing AND app equally.

| Accent | Meaning | Never use for |
|---|---|---|
| **bronze** | Brand + primary CTA + user commitment + identity gradient | Warnings, decorative dividers, category tones |
| **teal / slate** | Product signal, secondary accent, identity gradient companion | Primary CTA, safety |
| **amber** | Warning, calibration tone, refusal ("this dose won't hit the promise") | Decorative |
| **green** | Success, "available", accept-fire pulse | Decorative, category tones |
| **red** | Destructive, safety-gate trip, dismissal-with-consequence | Decorative, warning-only |
| **muted** | Meta, hints, disabled | Actual disabled state (use opacity 0.4 too) |

If you're using amber/green/red as a category color or a sibling accent, stop.

## Rule 2 · Two surfaces, shared tokens, variant components

Landing and app do different jobs — landing sells, app works. They share every
color hex, every font, every spacing unit, every radius scale. They diverge in
**component variants** (landing's hero CTA is a bronze-gradient pill; the app's
primary action is a solid-bronze small-radius mono-caps button). Both draw
from the same tokens.

Do NOT diverge tokens. If a color, a font size, or a radius needs a different
value on one surface, either (a) it's a bug — pull to the shared value, or
(b) it's a new variant token — add it here, name it, and document when to use
which. There is no third path.

## Rule 3 · One CSS file per surface implements this doc

- `next-app/src/app/globals.css` — the app's `@theme` block IS the source of
  truth in code
- `landing/src/app/globals.css` — the landing's `@theme` block

Both must stay in lockstep with this doc. When you edit a token here, edit
both CSS files. When you edit either CSS file, edit here.

---

## Colors

### Canvas + surfaces

Unified across landing and app.

| Token | Hex | Purpose |
|---|---|---|
| `ground` | `#0e0f12` | Page background. The floor everything sits on. |
| `surface` | `#16181c` | First raised surface — cards, sections, modal bodies. |
| `surface-2` | `#20232a` | Second raised surface — bottom nav, callouts, elevated panels. |

**Landing-only variants (documented drift):**
- `ground-2` (`#16181c`) — alias for surface. Landing uses to signal "raised container"; app does the same via `surface`. If you're on landing, prefer `ground-2`; if on app, prefer `surface`. Consolidation candidate.
- `surface-3` (`#2a2e37`) — third raise, used for landing's evidence-grid tiles. App has no analog. Keep landing-only until app needs one.

### Text

| Token | Hex | Purpose |
|---|---|---|
| `strong` | `#f4f5f7` | Primary headings, question labels, values-that-matter |
| `ink` | `#d6d9de` | Body text default |
| `muted` | `#8a8f9a` | Hints, secondary labels, mono-caps default |
| `faint` (landing-only) | `#5a5f6a` | Ultra-quiet meta, footnote sources. App has no analog. |

### Lines

| Token | Hex (app) | Hex (landing) | Note |
|---|---|---|---|
| `line` | `#3a3f4a` | `#2a2e37` | **Documented drift.** App's line is punchier (higher-contrast) because in-app dense UIs need visible separators. Landing's line is softer because heavy borders on a marketing surface read as clip-art. Do NOT unify without a call. |
| `line-soft` | `#24272f` | `#20232a` | Same rationale. |

### Semantic states

Identical across both surfaces.

| Token | Hex | Use for |
|---|---|---|
| `green` | `#5fb37a` | Success. Accept-fire pulse (`.pulse-accept`). VERIFIED status chip. |
| `amber` | `#e0a63a` | Warning / refusal. REFERENCED status chip. Calibration tone in intake. |
| `red` | `#e5654b` | Destructive. Safety-gate trip. Dismissal-with-consequence. |

### Accents

| Token | Hex (app) | Hex (landing) | Note |
|---|---|---|---|
| `bronze` | `#c89666` | `#d09a68` | **Documented drift.** Landing's bronze is punchier (marketing wants glow). App's bronze is calmer (in-flow UI needs the button to sit, not shout). |
| `bronze-hover` (app) | `#d9a97c` | — | Solid hover for app's flat button |
| `bronze-active` (app) | `#b3814f` | — | Pressed state for app's flat button |
| `bronze-hi` (landing) | `#e8b988` | — | Highlight stop for landing's gradient buttons |
| `bronze-lo` (landing) | `#a67a4a` | — | Shadow stop for landing's gradient buttons |
| `slate` (app) / `teal` (landing) | `#79b8c4` | `#7fc4d0` | Same role, different name. **Rename candidate** — both should be `teal` for consistency. |

### Laterality (app only)

| Token | Hex | Purpose |
|---|---|---|
| `lat-left` | `#4a8894` | Left-side data (left hip, left shoulder). Rehab context. |
| `lat-right` | `#a279a8` | Right-side data. Rehab context. |

Landing has no analog and shouldn't. Body-region colors only appear inside
rehab flows.

---

## Typography

### Font families

Both surfaces use identical fallbacks.

```
--font-sans: var(--font-sans), -apple-system, BlinkMacSystemFont, "Segoe UI",
             Roboto, sans-serif;
--font-mono: var(--font-mono), ui-monospace, "SF Mono", Menlo, Consolas,
             monospace;
```

`var(--font-sans)` resolves to **Inter** in both apps (loaded via `next/font`).
`var(--font-mono)` resolves to **JetBrains Mono**.

### Type scale (mobile-first, sm ≥ 640px cross-check)

| Purpose | Size | Weight | Notes |
|---|---|---|---|
| Page H1 | `text-2xl` (24px) | `font-semibold` | With `tracking-tight` |
| Section H2 | `text-[18px] sm:text-[20px]` | `font-semibold` | Wizard question labels, callout titles |
| Card H3 | `text-[15px]` | `font-semibold` | Program-card names, block titles |
| Body | `text-sm` (14px) | normal | Card descriptions, help text |
| Meta | `text-[13px]` | normal, `text-muted` | Hints, per-question help |
| Mono-caps | `.mono-caps` | see below | Section labels, step counters, status badges |
| Micro | `text-[10px]-[11px]` | normal | Chip badges, footer meta |

### `.mono-caps` convention

Small quiet label in mono for section titles, status chips, and step counters.

- **Landing**: uppercase, `letter-spacing: 0.02em`. Marketing surfaces earn the SHOUT.
- **App**: sentence-case by default, `letter-spacing: 0.005em`. In-app density means uppercase drives visual noise. Individual instances can opt into uppercase via `uppercase` utility class.

**Divergence is intentional.** Do not "fix."

### Line-height

| Case | Value |
|---|---|
| Headings | `leading-tight` (1.25) or `leading-snug` (1.375) |
| Body / help copy | `leading-relaxed` (1.625) |
| Dense mono / caption | default (~1.15) — mono-caps ships with `line-height: 1.15` |

---

## Spacing

Terav uses Tailwind's default spacing scale (`0.25rem` = 1 unit). No custom
values in the theme. If you need a bespoke gap, use arbitrary values sparingly
(`gap-[10px]`) and document why in a comment.

### Container widths

| Context | Max width | Rationale |
|---|---|---|
| App shell body | `max-w-[760px]` | Long-form scroll surfaces (Today, Progress, Programs). Set on `<main>` in AppShell. |
| Wizard body + footer | `max-w-2xl` (672px) | Focused flow — narrower than page shell so it doesn't feel unbounded. |
| Modal / dialog | `max-w-md` (448px) — `max-w-xl` (576px) | Depends on content weight. Onboarding uses `md`. |
| Bottom nav row | `max-w-[760px]` | Matches app shell. |
| Landing hero + sections | Custom per section, generally `max-w-6xl` — `max-w-7xl` | Marketing surface, wider than app. |

### Bottom-of-content padding rule

Any surface with a fixed BottomNav or a fixed wizard footer must budget
padding for it via `paddingBottom: calc(64px + env(safe-area-inset-bottom) + 1rem)`
on the scroll container, so the last visible content is never buried.

### Safe-area

Every fixed bottom element **must** include `pb-[env(safe-area-inset-bottom)]`
or equivalent. iOS home-indicator eats ~34px otherwise.

---

## Radii

| Value | Use for |
|---|---|
| `rounded` (4px) | App flat buttons, chip buttons, input fields, tag badges |
| `rounded-md` (6px) | Small tiles (monogram, pictogram) |
| `rounded-lg` (8px) | Cards, panels, elevated surfaces |
| `rounded-3xl` (24px) | Landing-only — hero mockup frames, evidence tiles |
| `rounded-full` | Landing-only — hero CTA pill. **App does not use pill buttons.** |

If you want a pill button in the app, stop — read `components.md` first. There
should be a reason.

---

## Motion

### Durations

| Purpose | Value |
|---|---|
| Press feedback (scale 0.98) | `60ms ease-out` |
| Route mount fade | `150ms ease-out` |
| Accept-fire pulse | `500ms ease-out` |
| Mark-done wash | `450ms ease-out` |
| Chip / tab / card hover | `200ms ease-out` default |
| Landing hero chisel-in | up to `1800ms cubic-bezier(0.19, 1, 0.22, 1)` — case-by-case |

### Rules

- **Every animation must respect `prefers-reduced-motion: reduce`.** App
  `globals.css` has an audit clause that nulls transforms + auto-firing
  keyframes; landing wildcards `animation-duration: 0.01ms !important`.
- **Landing's ambient blob drift** (`.blob-drift`) is decorative; it can be
  disabled entirely under reduced motion.
- **App's route mount** fades <main> in on every navigation. Feels like a
  screen change instead of a page load. Disable under reduced motion.
- **Never** animate content into position from off-screen on an interactive
  surface — reads as jank, catches slow devices.

---

## Focus rings

Identical rule across both surfaces.

```css
*:focus-visible {
  outline: 2px solid var(--color-bronze);
  outline-offset: 2px;
}
```

Input fields tighten to `outline-offset: -1px` and swap the border to bronze
so the focus state reads as a filled border, not a floating ring:

```css
input:focus, textarea:focus, select:focus {
  outline: 2px solid var(--color-bronze);
  outline-offset: -1px;
  border-color: var(--color-bronze);
}
```

**Never disable focus rings** — WCAG 2.1 AA hard requirement.

---

## Shadows

App uses zero shadows on flat UI — flat surfaces + line-based hierarchy is the
brand.

Landing uses shadow only on the hero CTA and one or two floating elements:

```
shadow-[0_10px_40px_-10px_rgba(208,154,104,0.6)]
```

That specific shadow is the bronze-glow variant. Do not use box-shadow for
generic elevation. The `line` token IS the elevation.

---

## Drift log (things to reconcile later)

- **bronze base hex** — app `#c89666` vs landing `#d09a68`. Landing's is
  punchier for marketing. Consider unifying to one and adding a
  `bronze-punchy` variant landing opts into.
- **slate vs teal** — same role, different name. Rename slate → teal on the
  app side.
- **ground-2 (landing)** duplicates surface. Consolidate.
- **mono-caps casing** — landing forces uppercase, app doesn't. This is
  intentional (density argument) but worth revisiting when we do a broader
  landing→app copy alignment.
- **line hex** — app is punchier, landing is softer. Intentional. Kept.

---

## Change log

- 2026-08-18 — initial bootstrap (Path X, founder request). Snapshots the
  current state of both `globals.css` files with rules and drift log.
