# Panel: UX/UI + design systems lens (2026-10-27)

Contrast figures are my own WCAG calculations from the hexes, not measured in a tool. Peer data is thin, so treat the peer comparisons as weak.

## Scores (0-10; platform / in-app / a11y / tokens = total)
- **A Chisel: 5 / 5 / 6 / 4 = 20.** The T becomes a smear at 16px (the render shows a pixel blob with the gradient lost). The skewed bevel sits off-centre in the maskable circle and the gradient needs 3 stops plus a flat fallback. The tiny wordmark parallelogram does not read as the T. Gradient fills with dark text are uneven: the teal end of the button cuts contrast. Gradient costs a token, a rule ("below 48px go flat") and an SVG variant per size.
- **B Lettermark: 9 / 8 / 8 / 9 = 34.** The white "t" holds at 16 and 32 (the pip drops to 2px but the "t" carries it alone). It is centred and safe in the mask. A single accent means no fight with status colours. Contrast is as strong as the neutrals: strong #f4f5f7 on ground is about 17:1. Fewest tokens.
- **C Edge: 6 / 6 / 5 / 6 = 23.** The wedge is the most distinct shape, but at 16px it is an unreadable diagonal streak, and the thin teal edge vanishes below 32px. The off-axis shape is awkward in a circle mask. A teal+bronze pair beside green/amber status fills is the biggest confusion risk of the three.

## Pick: B, with two changes taken from the others
1. Cap-height "t" in Inter 800 at -0.04em, white (#f4f5f7) on #0e0f12. Pip is a circle of ~0.16 of the x-height, bronze. Scale the pip to ~0.22 of x-height in the icon, so it survives 32px. At 16px, ship a hand-tuned favicon with a 3px pip and no antialias fuzz.
2. Keep the maskable icon separate. Put the glyph inside the central 60% (a 40% margin ring, stricter than the spec's 80% circle), on a solid #0e0f12 bleed. Ship a separate `"purpose":"any"` icon with a smaller margin. Never `"any maskable"` combined.
3. From C: reserve the teal edge as an optional 2px rule under the wordmark in ad creative only. It is not a core rule.
4. Splash: generate iOS splash PNGs (apple-touch-startup-image) as #0e0f12 with the "t." centred at ~18% of screen width. A static splash is cheap and avoids the white flash.

## Strongest argument against B
A generic lowercase "t." looks like a thousand fintech/SaaS marks and drops the chisel/edge idea the landing hero stroke already earns. The landing hero stroke then orphans. A bronze pip is also a weak differentiator at 16px, where it is essentially one orange pixel. And lowercase "terav." in a header reads casual beside an app that makes a safety-gate decision.

## Must fix whichever direction wins
- Pick ONE accent set for both apps. Bronze and teal currently differ across the two (#d09a68/#7fc4d0 vs #c89666/#79b8c4). Rename `slate` to `teal`; "slate" misleads (it is not grey).
- Maskable: split the `any maskable` into two entries with separate safe-zone artwork. Add an apple-touch-icon at 180 without transparency.
- Add iOS splash images, or accept the white-flash fallback.
- Status colours must never share hue territory with a brand accent. Amber #e0a63a is only about 11 degrees of hue from bronze #c89666, so an amber banner next to a bronze CTA is ambiguous for protan/deutan users. Rule: status = icon + word + tint, never colour alone. Bronze fills are for the primary button only, never for status.
- Fix the 16px favicon by hand. Don't downscale the 180.

## Recommendations (my lens)
- **Bronze/teal:** bronze #c89666 (app value, about 7.3:1 on ground, dark text on a bronze fill also about 7.3:1); hover #d9a97c; text-on-tint bronze-hi #e2b686. Teal #79b8c4 (about 8.6:1). Use the app's values in both apps. The landing's #d09a68/#7fc4d0 are brighter but not audited, and unifying down is cheaper than re-auditing the app.
- **Gradient:** No. It breaks flat tokens, hurts text-on-fill contrast and doubles icon assets. Keep the hero chisel stroke on the landing only as a decorative element (aria-hidden, reduced-motion respected), not as brand identity.
- **Wordmark case:** lowercase "terav." in the mark and header; "Terav" in running copy. One component, `<Wordmark/>`, one SVG source.
- **Type scale:** the current scale holds. One tweak: caption 13 to 13/1.45 with muted #93989f is about 5.9:1 on surface; keep it, but don't go below 13. Eyebrow 11 mono caps needs +0.08em tracking and strong or ink colour, not muted, on surface-2. H1 32 bold: apply -0.02em to match B headings.
- **Icons:** keep lucide at 1.75. No custom glyph set, since B has no angle to inherit. Check that 1.75 stays visible at 16px next to the 800-weight "t".

## Token/system cost (B)
New tokens: 0 beyond a unified bronze, bronze-hover, bronze-hi, teal and one `--pip` alias of bronze. Share via a tiny `brand/` folder (tokens.css + wordmark.svg + icon sources) copied by a prebuild script in each Next app, or a workspace package. No gradient token, no size-switch rule.
