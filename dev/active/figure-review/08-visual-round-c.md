# Round C visual review (cues, variant glyphs, band weight, ladder ghosts) - 2026-10-29

Inputs: `after-round-c/thumbs-actual-size.png` (real 56x40), `sheet-03.png` (pull-up family, tile 144 and brief 56x40 at 2x), `before-after-round-c.png`, `rig.ts` (CUE_W 3, CUE_OP .85, CUE_DASH "5 4", glyph x=228 W=6, ladderGhost w2 op.6).

## Scores (1-10, 10 = best)

| Axis | Score | One line |
|---|---|---|
| Variant distinctness @56x40 | **6.5** (was 4.5) | Direction now reads (up / down / none / bars). Magnitude and band weight still do not. |
| Cue legibility, 144 tile | **5.5** | Plumb/level lines fine; elbow arcs (r=14, 3px) are nearly invisible against bronze forearms. |
| Cue legibility, player | **6** | Better at larger size, but arc fades to 30% opacity at the start and is the same hue as the arm it hugs. |
| Visual noise / clutter | **7.5** | Restrained. Only the pull-up family adds marks; ghosts are quiet. |
| Looks professional | **7** | Bodies are good; the floating glyphs are the least "drawn" thing on the page. |

## What the 56x40 strip actually shows
- `pullup` vs `pullup_single` vs `pullup_slow` vs `pullup_partial`: all four are a small bronze arrow, 5-6 px tall, to the right of the legs. Rest dot, three ticks and "short" shaft are sub-pixel differences at 56 px. You can tell "arrow up" from "arrow down" and from "two bars"; you cannot tell the up-family apart.
- `pullup_negative` vs `pullup_negative5`: same arrow, shaft 66 vs 32 units; at 56 px that is about 9 vs 4 px, which does separate them (best pair in the set).
- `pullup_band` / `band_light`: the band is a thin bronze line down both sides of the torso. Heavy vs light cannot be told apart at 56 px (width difference under 1 px). Only the 144 tile shows it.
- `hold` bars read as a tiny "II" and `pullup_top` vs `pullup_mid` differ only in vertical position. Weak.

## Glyph: chrome or drawing?
They read as UI chrome. Same bronze as the forearms, but they float alone in empty space right of the figure at a fixed x=228, with flat caps and no outline, while every body part has the dark outline and fill. They look like an icon badge, not an annotation drawn on the same page. It is acceptable (a legend-style mark) but it should be anchored to the figure (closer, at hip/shoulder height, mirroring the movement line) and share the body's stroke treatment.

## Ghosts
Not a second person, which is the right outcome. The risk is the opposite: with w=2, op .6, no fill, the outline of only the limbs reads as stray wires/lines (rowflat: a long thin line off the feet and a lone ring; wallhs_lean: an extra pole-like line plus a ring near the hands). Viewers will take the ring as an object (a plate?). Unlabelled, it teaches nothing. Hidden at 56 px already (OK).

## Top 5 fixes
1. **Scale glyph with size, not with the viewBox.** At 56 px make arrow W 6 -> 9 and shaft length min 40 units; draw the head as a filled triangle (about 16 wide), not a 6-wide chevron. Make `slow` ticks 3 -> 4 wide-bars of 5 units, spaced 10, and `single` a filled dot r 6 (now 4). Goal: >= 8 px of distinct shape at 56x40.
2. **Differentiate magnitude by a second channel.** Put the glyph at the start/end height of the pull (partial: arrow from hip to chest only, short and ending at a small ROM tick on the bar; full: arrow reaching the bar). Move x from 228 to about 214 so it sits 14 units off the shoulder line and joins the figure.
3. **Band: raise weight contrast and vary the colour.** Heavy w ~ 9, light w ~ 3 (currently both thin); at 56 px heavy also needs op 1 and a darker outline; light op .75. Add a loop under the feet so it reads as a band, not a cape/hair.
4. **Cues: separate from the limb hue.** Keep plumb/level at w 2 (current 3 is a hair loud on the 144 tile against the 2-wide ladder), but make the elbow arc w 3.5, r 20, floor opacity .6 (now .3 at start), and dash "3 4" at 144. Arc and arm are both bronze: draw the arc 6 units inside the angle with a dark under-stroke (w 5, op .5) so it separates from the forearm.
5. **Ghost: pull toward "intention", not "wireframe".** Fill-less is right; set op .6 -> .4, w 2 -> 2.5, dash "2 3" so it reads as a hint rather than rigging, and drop the ring (head) and any rigging line (rope, pole) from the ghost: keep only body limbs. Add one 10px label ("next: ...") in the player only.

## Too faint or too loud?
- Faint: elbow arc, band at thumbnail, ghosts at 144 (appropriate; they should stay faint).
- Loud: nothing is loud. The glyph colour and the 85% cue opacity are consistent. The solid arrow beside the body is the loudest object on the tile and it is also where the information is, which is right.
- Hierarchy to aim for: body > glyph > cue line > ghost. Today glyph and arm are equal; fix 1-2 lifts the glyph, fix 4 lowers the arc.
