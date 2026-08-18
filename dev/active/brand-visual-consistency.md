# Brand + visual system consolidation

**Status:** future work. Founder observation 2026-08-18: landing visual system
(colors, blocks, "papers") is materially stronger than the app; logo/brand
identity currently forks between the two surfaces. Needs a unified visual
system + asset set.

## Current inconsistency inventory

- **Landing** — warm-dark palette with bronze gradient chisel accent, teal
  hover, subtle noise/texture (the "papers" the founder mentioned). Feels
  editorial + intentional.
- **App (post-auth)** — same tokens on paper (warm-dark, bronze, teal),
  but the execution reads as less refined. Card padding rhythm, accent
  economy, and iconography weight are less disciplined than the landing.
- **Wordmark** — landing uses `font-mono text-[13px] uppercase tracking-
  [0.2em] text-bronze` "Terav". App uses the same token in some places
  (sign-in/sign-up header) but plain text in others. No committed logo
  SVG.
- **Icons** — landing uses mostly bespoke SVG (ChiselStroke). App uses
  lucide-react at various stroke weights (should be 1.75 everywhere,
  but ExerciseCard had 1.9 until 2026-08-18 fix).
- **Favicons** — `next-app/public/favicon-16.png`, `favicon-32.png`,
  `favicon-48.png`, `apple-touch-icon.png`, `icon-192.png`, `icon-512.png`,
  `icon.svg` — inherited from an early draft, may not match final brand.
- **Splash / PWA install** — `manifest.json` references the icon set +
  brand name; needs review after logo lock.
- **Instagram / social** — no assets exist. Founder plans a social
  presence (memory reference to `@terav.fit` handle?); needs Instagram
  post templates + story templates + profile picture.

## Deliverables

### Phase A · Brand system decisions (founder-led)

1. **Wordmark** — final "Terav" wordmark. Options:
   - Keep the current all-caps bronze mono-space treatment as canonical
   - Design a custom wordmark with a symbol (e.g., the chisel stroke
     as a stylized T underline)
2. **Symbol / icon mark** — for favicons + splash + Instagram avatar.
   Currently none. Suggested: the chisel-stroke shape distilled to a
   single glyph.
3. **Color roles** — lock which color means what across every surface:
   - Bronze: primary CTA + wordmark + Accept
   - Teal: secondary accent + hover states
   - Green: positive semantic (done, responding)
   - Amber: caution semantic (soften, under-dosing)
   - Red: destructive semantic (delete, non-responder, red morning state)
   - Slate: informational semantic (rescheduled, engine-cited proposal)
   Both landing + app must obey identical rules.
4. **Type ramp** — one type scale that applies to both surfaces. Landing
   is 5xl/6xl on hero, app is 3xl at largest — reconcile.

### Phase B · Asset production

Once Phase A is locked, produce:

1. **Logos** in a range of sizes + formats
   - `wordmark.svg` (color, dark bg — for landing/app headers)
   - `wordmark-light.svg` (color, light bg — for the light-mode variant
     we don't have yet)
   - `wordmark-mono.svg` (monochrome — for Instagram overlays, print)
   - `symbol.svg` (icon-only version for tight spaces)
2. **Favicons** — replace the existing set
   - `favicon.ico` (multi-size ICO for legacy)
   - `favicon-16.png`, `favicon-32.png`, `favicon-48.png`
   - `favicon.svg` (modern browsers prefer SVG)
   - `apple-touch-icon.png` (180×180)
   - Update `next-app/public/manifest.json` icon paths if any change
3. **PWA icons** — `icon-192.png`, `icon-512.png`, plus maskable variants
4. **Splash screens** — iOS PWA install requires per-device splash sizes.
   Multiple resolutions needed for iPhone SE through iPhone 15 Pro Max.
5. **Instagram assets**
   - Profile picture (1080×1080)
   - Post template (1080×1080) — for citations, progress screenshots,
     evidence quotes
   - Story template (1080×1920)
   - Link-in-bio graphic (if using linktree pattern)

### Phase C · Application

1. **Landing** — swap in final wordmark; audit for stale asset paths
2. **App** — swap in final wordmark on Profile header + sign-in/sign-up
   + intake progress rail. Currently the wordmark rendering differs
   slightly between these locations.
3. **Docs** — commit brand rules to `dev/design/brand.md` alongside
   `tokens.md` and `components.md`. This becomes the canonical
   reference.
4. **README** — add a Brand section referencing the assets so future
   agents don't guess.

## Cost estimate

- **Phase A** — 1-2h if founder + designer align quickly; potentially
  a design sprint if starting fresh
- **Phase B** — Depends on execution: professional designer 4-8h, or
  the founder + AI tools 2-4h if the direction is clear
- **Phase C** — 1-2h of code + asset swap once assets exist

## What this does NOT solve

- The underlying visual craft of the app (spacing rhythm, accent
  economy inside components) — that's the app-visual-craft audit at
  `dev/audits/app/2026-08-18-visual-craft-sweep.md` (in progress).
- Motion + micro-interactions — separate motion-craft brief when we do
  one.
- Design system component library — we already have tokens.md +
  components.md; those extend naturally.

## Decision needed

Founder needs to answer: keep the current wordmark treatment as-is, or
invest in a custom mark? That decision gates everything else.
