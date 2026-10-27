# Panel: brand / identity lens (2026-10-27)

Peer data in research.md is thin, so "distinctiveness vs peers" below rests on my own knowledge of
Whoop, Hevy, Strava, Runna and similar apps, and on three boards rather than a market sample.

## Scores (0-10: distinct / craft / coherence / longevity)
- A Chisel: 6 / 5 / 5 / 4 = 20. A T is the most generic initial in the category. The gradient is the only ownable
  part. The bevelled slab is too fine for 16px: the 16px render is a smear. The header mark is a bare slab, not the T,
  so icon and wordmark don't match. Gradient fails in print and on light backgrounds, and dates fast.
- B Lettermark: 5 / 8 / 9 / 9 = 31. Heavy "t." holds at 16 and 32px. The bronze dot is the one idea shared by the
  icon, wordmark, splash and ad, and it keeps the wordmark's existing pip. It is flat, so it survives print, a
  one-colour stamp and a light background.
- C Edge: 8 / 5 / 6 / 7 = 26. The most ownable shape on the boards, and the "edge being sharpened" idea matches the
  product. But the 1.5px teal edge vanishes at 32px and turns to mush at 16px, so the mark degrades to a bronze
  smear. It also reads as a ramp or ruler. A title-case "Terav" in Inter 600 is generic and has no link to the symbol.

## Pick: B, with one borrow from C
- Icon: Inter ExtraBold (800) lowercase "t", ink #f4f5f7 on #0e0f12. Dot is a bronze #c89666 circle, diameter equal to
  the stem width (about 0.9x the t's x-stem), sitting on the baseline right of the t with a gap of about 0.4x stem.
  Optically centre the t+dot group in the canvas, not the t alone (the dot makes it right-heavy; shift the group left).
- Borrow from C: use teal as a pair colour, not a second logo colour. Keep the mark itself bronze and ink. Reserve
  teal #79b8c4 for data and info UI. Do not add a teal edge to the icon, because C shows it can't survive 32px.
- Maskable: ship a separate `maskable` file, not "any maskable". The group sits inside the central 66% circle with
  a full-bleed #0e0f12 ground. Ship a separate "any" icon with a tighter crop.
- Wordmark: "terav." Inter 800, tracking -0.04em, with the pip as a real full stop in bronze. Replace caps-with-pip.
- Splash: add iOS splash images (t. mark only, centred, no wordmark under it, since the icon is the brand).

## Strongest argument against B
A lowercase heavy letter plus a dot is the least ownable move in app branding: "t." has no meaning of its own
beyond the name, and a growing number of consumer apps already use a lowercase heavy letter in a rounded square.
It is a safe, wordmark-led identity, so ownability will have to come from product and copy, not from the mark.
B is also the lowest-risk option for an ad launch this week, which is a reason to choose it and not a defence of its
distinctiveness. If ownability matters more than robustness, C is the better mark and needs a rebuild at small
sizes: thicker teal edge, simpler wedge.

## Fix whichever direction wins
1. Add an explicit light-background bronze, about #9a6a3c, for text and thin strokes on cream or white. #c89666 on
   cream is only about 2.4:1, which is fine for a dot or fill but fails as text.
2. Separate "any" and "maskable" icon files and check the 16/32/180/192/512 renders from the SVG source, not by
   scaling one PNG.
3. Produce a one-colour (all ink) and a reversed version of the mark for press and print.
4. Unify landing and app accents on one token set. Rename the app's "slate" so it doesn't collide with the neutrals.
5. Retire the animated gradient "chisel stroke" in the hero, or make it flat bronze, so the landing does not
   contradict a flat identity.

## Recommendations
- Bronze/teal: bronze #c89666 (hover #d9a97c) and teal #79b8c4, app values, already contrast-audited. Landing moves
  to them (#d09a68 / #7fc4d0 retire). The delta is small and invisible; one source of truth matters more.
- Gradient: no. It fails flat/print/16px and splits identity from UI. If the hero needs a moment, use flat bronze
  type on a surface, as the ad tile already does with "weakest area."
- Wordmark case: lowercase "terav." with the bronze full stop. It is the only option whose mark and wordmark match
  (both are the same heavy lowercase form + dot). The dot has to be in the font, not a separate pip. If the name
  must also appear in running text, write "Terav" as a normal word.
- Type scale: H1 32/700 with -0.02em tracking (match B's heading rule); H2 20/600 with -0.01em; body 16 unchanged;
  caption 13 is fine; raise eyebrow 11 to 12 mono caps with +0.08em tracking (11px mono caps is under the legibility
  floor on a dark ground at muted #93989f). Don't add sizes.
- Icon set: lucide 1.75 stroke is fine at 20-24px; at 16px move to 2 to avoid thin-line fade. Keep corners round to
  echo the dot. No custom glyphs for now.
