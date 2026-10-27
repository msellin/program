# Terav brand guide

**Direction B · Lettermark**, approved by the owner on 2026-10-27. The panel record is in this folder:
`panel-synthesis.md`, `panel-{brand,ux,product}.md` and the rendered boards in `directions/`.

## The mark
- **Icon:** a heavy lowercase **t.** It is an Inter ExtraBold outline in strong `#f4f5f7`, with a bronze `#c89666`
  full stop, on ground `#0e0f12`.
- **Wordmark:** **terav.** in the same outline, tracked −0.04em, with the bronze full stop.
  - Use it in headers, nav, the splash, ads and OG cards.
  - In running text, write **Terav** as a plain word. Never add a pronunciation or a meaning to it.
- **Variants** in `brand/`:
  - `wordmark.svg` / `mark.svg` for dark grounds.
  - `*-light.svg` for cream or white: ink `#14110d`, the dot stays bronze.
  - `*-mono.svg` for one colour (`currentColor`), used for print and stamps.
- **Clear space:** at least the dot's diameter on every side. Never recolour the t, stretch it, add a gradient or
  outline it.
- **Minimum size:** 16px icon (a hand-tuned pixel version) and 14px wordmark height.

## Colour
The only source is `brand/tokens.css`, imported by both `globals.css` files.

| Role | Token | Hex | Rule |
|---|---|---|---|
| Brand + primary CTA + Accept | `bronze` | `#c89666` | The only accent. Flat, no gradients. |
| Hover / pressed | `bronze-hover` / `bronze-active` | `#d9a97c` / `#b3814f` | |
| Bronze text on a bronze tint | `bronze-hi` | `#e2b686` | |
| Bronze text on a light ground | `bronze-deep` | `#9a6a3c` | `#c89666` on cream is about 2.4:1 |
| Data, charts, info | `teal` (the app alias is `slate`) | `#79b8c4` | Never a CTA, never decoration |
| Status | `green` / `amber` / `red` | | Always with an icon and a word. Amber is about 11° of hue from bronze. |

Neutrals are ground `#0e0f12`, surface `#16181c`, surface-2 `#20232a`, ink `#d6d9de`, strong `#f4f5f7` and muted
`#93989f`, the same on both surfaces.

## Type
Inter and JetBrains Mono only. This is the **target** scale for the app and the ads. Components adopt it under
D-04's type work; this change did not restyle any screen.

| Style | Size / weight / tracking |
|---|---|
| H1 | 32 / 700 / −0.02em |
| H2 | 20 / 600 / −0.01em |
| Body | 16 |
| Caption | 13, muted, never smaller |
| Eyebrow | 12 mono caps, +0.08em |

Mono is for numbers, dates and eyebrows. The landing hero may go larger.

## Icons
Lucide at 1.75 stroke, or 2 when drawn at 16px. No custom icon set. The brand mark is the only custom glyph.

## Assets
- **How to regenerate:** never hand-edit a PNG. Change the geometry or a colour in
  `dev/scripts/brand/build-brand-assets.mjs` (or the glyphs in `brand/glyphs.json`), then run
  `node dev/scripts/brand/build-brand-assets.mjs`.
- **What it writes:**
  - Both `public/` folders: `favicon.ico` (16/32/48), `favicon-16/32/48.png`, `icon.svg`, `apple-touch-icon.png`
    (180, opaque), `icon-192/512.png` (`any`), `icon-maskable-192/512.png` (glyph inside the central 66% circle),
    `wordmark.svg` and `mark.svg`.
  - In the app only: 12 iOS launch images under `public/splash/`, plus `src/lib/brand-splash.ts`.
- **Android splash:** Chrome builds it from the manifest's name, `background_color` and icon. There is no file for it.
- **Guard:** `next-app/src/lib/brand.test.ts` fails in either of these cases:
  - a `globals.css` stops importing the token file or redefines one of its tokens;
  - the two `public/` copies differ.

  It also fails on any of these:
  - the manifest goes back to `"any maskable"`;
  - a splash size doesn't match its media query;
  - an `app/favicon.ico` file-convention icon reappears;
  - a retired landing accent (`#d09a68`, `#7fc4d0`) comes back.

## Ads and screenshots
- Ground `#0e0f12` with a flat bronze highlight word. The ad tile in `directions/dir-B.png` is the template.
- Use real app screenshots from the persona harness, never the owner's account (L-12). The Accept card,
  "Because: your log…", is the differentiator.
- The wordmark goes top left, or the end card shows the t. icon.

## Known follow-ups
- The landing's `TodayMockup` still draws its own mini-header. It will be replaced by real screenshots in L-12.
- Programs category tints and the remaining hardcoded styles are D-03 / D-04 BEFORE-SCALE work. This change didn't
  touch them.
- Renaming `slate` to `teal` in the 64 app files can happen gradually, because the alias keeps them correct.
- iPad launch images are not generated, because the app is portrait-phone first.
