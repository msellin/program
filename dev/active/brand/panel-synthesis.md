# Brand panel synthesis (2026-10-27)

The panel had 3 Sonnet lenses, 1 round, each scoring blind against its own four criteria out of 40. The method is
the one the codename.ee looks review used. The boards are in `directions/dir-{A,B,C}.png`. The individual
reviews are in `panel-{brand,ux,product}.md`. Peer research in `research.md` was thin (most peer icons
unverified), so the distinctiveness scores rest on the reviewers' own knowledge.

| | Brand | UX/UI | Product | **Total /120** |
|---|---|---|---|---|
| A · Chisel | 20 | 20 | **29** | 69 |
| **B · Lettermark** | **31** | **34** | 26 | **91** |
| C · Edge | 26 | 23 | 22 | 71 |

**Converged pick: B, 2 votes to 1.** Product voted A. No second round was needed.

## Where all three agreed
- **A's chisel T and C's wedge fall apart at 16px.** Both renders smear, and C's teal edge is gone below 32px. B's
  white "t" holds at 16px.
- **The current icon and wordmark don't match:** the icon is a chisel T and the wordmark uses a pip. Fix this
  whichever direction wins.
- **Unify the accents on one set.**
  - Rename the app's `slate` to `teal`.
  - Split the `"any maskable"` icon into separate `any` and `maskable` files.
  - Add iOS splash images.
  - Render every size from the SVG source. Never downscale a PNG.
- **Keep lucide at 1.75.** No custom icon set.

## Disagreements (recorded, not resolved by vote)
1. **Ownability.** All three, including the two who picked B, say a heavy lowercase "t." is the least ownable
   option. The brand lens calls C the most ownable mark, and C would need a small-size rebuild. Product says ad
   recall will come from the Accept-card screenshot, not the logo.
2. **Equity and cost this week (product).**
   - B changes the icon for installed users.
   - B orphans the landing hero's animated bronze→teal chisel stroke.
   - Product would keep the T flat and re-icon later.
3. **The hero chisel stroke.**
   - Brand: retire it or make it flat bronze.
   - UX: keep it as a decorative element, not identity.
   - Product: keep the gradient.
4. **Which bronze and teal.**
   - Brand and UX: the app's #c89666 / #79b8c4, already contrast-audited.
   - Product: the landing's #d09a68 / #7fc4d0, which are brighter.
5. **Type scale.**
   - H1 weight: 700 (brand, UX) vs 600 (product: "calmer").
   - Eyebrow 11 → 12 (brand; product for ad crops). UX keeps 11 with more tracking.

## Must-fix items surfaced by one lens
- **UX:** bronze is only about 11° of hue from amber #e0a63a. Status must always be icon + word + tint, never colour
  alone, and bronze fills are for the primary button only.
- **Brand:** add a dark bronze (about #9a6a3c) for text on light backgrounds, because #c89666 on cream is about
  2.4:1. Also add one-colour and reversed versions of the mark for press.

## Proposed final spec (B, with the converged changes)
- **Mark.**
  - The "t" is drawn from Inter 800 geometry in strong #f4f5f7 on ground #0e0f12.
  - The bronze #c89666 dot has a diameter about the stem width and sits on the baseline.
  - The t+dot group is optically centred.
- **Icon files.**
  - `any`: a tighter crop.
  - `maskable`: the glyph inside the central 66%, with a full-bleed ground.
  - 180 apple-touch: opaque.
  - 16/32 favicons: hand-tuned.
- **Wordmark.**
  - In headers and lockups: "terav." in Inter 800, −0.04em, with a bronze full stop. It replaces "TERAV" plus
    pip.
  - In running copy: "Terav".
- **Colour.**
  - Bronze #c89666, hover #d9a97c, on-tint #e2b686, and a new light-background bronze, about #9a6a3c.
  - Teal #79b8c4, for data and info only.
  - No gradients in the identity.
- **Type.**
  - H1 32/700 −0.02em, H2 20/600 −0.01em, body 16, caption 13.
  - Eyebrow 12 mono caps +0.08em.
- **Splash.** The mark only, centred, on ground. iOS startup images per device; Android builds its splash from the
  manifest.
- **Tokens.** One `brand/tokens.css` imported by both `@theme` blocks. One `<Wordmark/>` per app, drawn from one SVG.

## Cost
Research (Haiku) about 84k tokens. Panel about 262k (3 × about 87k), against the estimate of about 150k: each
lens read three 2400px board images and the CSS.
