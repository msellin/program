# Terav brand research: peer conventions and platform icon rules

Research date: 2026-10-27. Several fetches 404'd or returned titles only. Items marked **UNVERIFIED** come from memory or secondhand snippets and need checking on the real asset or device before a decision rests on them.

## Part 1: Peer brand conventions

| Brand | Icon (bg / glyph / fill) | Wordmark | Primary colour | UI default | Typeface |
|---|---|---|---|---|---|
| Pliability | UNVERIFIED, not found | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED |
| GOWOD | UNVERIFIED, not found | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED |
| Runna | Black ground per secondhand splash description (white logo centred); glyph/fill not confirmed | Not confirmed | Black/white core, no hex found | Dark (splash) per one showcase | UNVERIFIED |
| Whoop | Black/white core palette; glyph not confirmed | UNVERIFIED | Black #000000, white #FFFFFF; teal #00F19F (CTA/highlights), blue #0093E7 (Strain) | Dark (black core) | UNVERIFIED |
| Hevy | Official icon file not retrieved; dark-bg white-logo variant exists per Dashboard Icons (label conflict) | UNVERIFIED | Hex not found | UNVERIFIED | UNVERIFIED |
| Oura | UNVERIFIED | Wordmark in Helsinki Blue per 2020 API brand PDF, hex not given; white on dark backgrounds allowed | Helsinki Blue (hex not found) | UNVERIFIED | UNVERIFIED |
| Strava | Orange mark on UNVERIFIED ground | Custom/brand wordmark | #FC4C02 (Tangelo; sources agree). One third-party reference says #fc5200 | UNVERIFIED | Inter per third-party only; no official spec |

Sources: [Whoop brand guidelines PDF](https://developer.whoop.com/assets/files/WHOOP%20-%20Brand%20&%20Design%20Guidelines-bdea3554e94b4ea09e68695b1e8dc8e7.pdf); [Runna logo listing](https://logotyp.us/logo/runna/); [Dashboard Icons Hevy](https://dashboardicons.com/icons/external/hevy); [Oura 2020 brand PDF](https://static.ouraring.com/pdfs/Oura_BrandGuidelines_v1.pdf); [Strava palette](https://brandpalettes.com/strava-colors/).

Patterns (limited by the gaps above):
- Dark UI is the norm among the peers where a default was found (Whoop black core, Runna black splash), which fits Terav's warm-dark palette.
- Brands with a published palette use one saturated accent plus black/white (Whoop teal, Strava orange). Terav should do the same rather than add a second brand hue.
- Strava's orange is the only icon-level colour confirmed for a fitness brand. A lettermark or abstract glyph on solid ground is the common shape; gradients were not found in the confirmed set.
- Oura's guidance is a single brand colour for the wordmark plus a reversed white version for dark grounds, i.e. the wordmark is designed for both backgrounds, not only one.
- Wordmark typefaces were not confirmed for any peer. Do not build a typeface claim on this research.

## Part 2: Platform icon rules

**iOS apple-touch-icon**
- Size: 180x180 PNG at site root or in a link tag. Sources converge on 180. [MDN apple-touch-icon](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/rel/apple-touch-icon) fetch failed; the 180 figure comes from [favicon guide 2025](https://favicon.im/blog/complete-favicon-size-format-guide-2025).
- Corners: iOS masks the icon with rounded corners itself. Ship a full-bleed square. The `-precomposed` variant suppresses the effects (older guidance; UNVERIFIED for iOS 26).
- Transparency: transparent pixels have been reported to render black on iOS. Ship an opaque 180 PNG. UNVERIFIED for iOS 26.
- iOS 26 (Liquid Glass) changed App Store / native icon layering. Whether web clips pick up glass treatment was NOT confirmed. Test on an iOS 26 device.

**iOS PWA splash (apple-touch-startup-image)**
- Still needed as of 2024 per a [WebKit bug report](https://bugs.webkit.org/show_bug.cgi?id=280262). Use separate PNG files, not data/blob URLs, and match the device resolution exactly. 2025 status NOT confirmed.
- Portrait-only set is acceptable. Landscape needs `(orientation: landscape)` entries.
- Without them iOS shows a generic blank/white screen on launch (UNVERIFIED for current iOS).
- Device pixel sizes, from community lists: iPhone X/11 Pro 1125x2436; Plus models 1242x2208; iPhone 5 640x1136 (old). Current iPhone sizes need checking against Apple's device table.

**Android / Chrome manifest icons**
- Chromium requires a 192 and a 512 icon. [web.dev add-manifest](https://web.dev/articles/add-manifest).
- Maskable: keep essential content inside a circle of radius 40% of icon width (the central 80% diameter). Outer 10% may be cropped. [web.dev maskable](https://web.dev/articles/maskable-icon).
- `"any maskable"` combined is discouraged: web.dev says "We don't recommend using multiple purposes for maskable icons", because the padding shrinks the core art. Ship separate `any` and `maskable` entries.
- Monochrome purpose: NOT covered by the fetched sources. Android 13+ themed icons use a monochrome layer; UNVERIFIED for this app.
- Splash: Chrome builds it from `name`, `background_color` and the icon closest to device resolution (192/512 usually enough). Set `background_color` to the load-page background so the handoff is seamless. [web.dev add-manifest](https://web.dev/articles/add-manifest).

**Favicon set (2025 consensus, from vendor guides)**
- `favicon.svg` for modern browsers, `favicon.ico` (16/32/48) as fallback, `apple-touch-icon.png` 180x180, manifest PNGs 192 and 512. Sources: [favicon guide](https://favicon.im/blog/favicon-formats-sizes-best-practices).
- SVG dark mode: put a `@media (prefers-color-scheme: dark)` block inside the SVG to swap fills. Test on light and dark tab bars.
- Safari: one source says Safari still needs a PNG fallback for SVG favicons. Conflicting claim; check current Safari behaviour. Keep the .ico/PNG fallback either way.
- Tag order matters: browsers use the last one they support.

## Decision-relevant facts (short)
1. Ship opaque square icons: iOS rounds corners and may render transparency black (UNVERIFIED).
2. Maskable art lives inside a 40%-radius circle; never combine `any maskable` in one entry.
3. iOS startup images still need per-device PNGs with exact media queries; 2025 status unconfirmed.
4. Chrome splash uses `background_color` plus the 192/512 icon; set it to the page background.
5. Peers that publish a palette use one accent plus black/white; Strava #FC4C02 and Whoop #00F19F are the confirmed examples.
