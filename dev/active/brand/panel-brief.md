# Brand panel brief (2026-10-27)

**Product:** Terav, a focused-improvement training PWA. You pick one focus (a skill, a lift, an engine or a joint).
Terav adjusts each session from your log, cites a study or a log signal for every change, and you approve each change.
It runs alongside your existing training and is not a full plan. The audience is CrossFit and functional-fitness
athletes. It is a dark UI with warm-dark neutrals. Landing: terav.fit. App: app.terav.fit. Paid ads launch this week
using real app screenshots.

**Fixed:** the name "Terav". Don't propose renames, pronunciation lockups or meaning annotations. Inter and
JetBrains Mono stay, because both apps already load them. The neutrals are already decided by an accessibility audit:
ground #0e0f12, surface #16181c, surface-2 #20232a, ink #d6d9de, strong #f4f5f7, muted #93989f.

**Today's state:**
- Both apps already ship the same chisel-T icon, a bronze→teal gradient on #0e0f12.
- The wordmark is "TERAV" caps with a bronze dot (pip). It doesn't match the icon's chisel motif.
- There are no iOS splash screens.
- The manifest uses `"any maskable"` on one icon.
- The landing (bronze #d09a68, teal #7fc4d0) and the app (bronze #c89666, teal #79b8c4, named "slate") disagree on
  accents.
- The landing hero underlines a word with an animated bronze→teal "chisel stroke".

**Inputs:**
- `dev/active/brand/directions/dir-A.png`, `dir-B.png`, `dir-C.png`: three directions rendered at real sizes
  (icon masks, favicons at 16/32, wordmark on dark and light, splash, ad tile, palette, a card).
- `dev/active/brand/directions/board.html`: the source, if you need the exact SVG geometry.
- `dev/active/brand/research.md`: platform icon rules and peer notes. Peer data is thin; say so where it matters.

**Directions:**
- **A · Chisel.** Evolve the current chisel T. Gradient as signature, flat bronze at small sizes.
- **B · Lettermark.** Heavy lowercase "t." with the bronze pip as a full stop. Flat, bronze the only accent.
- **C · Edge.** New symbol: a rising bronze wedge with a teal edge. Flat bronze and teal pair, title-case wordmark.

**Scoring:** score each direction on your lens's 4 criteria, 0–10 each (max 40).

**Then:**
1. Pick one direction to converge on, possibly with named changes taken from the others. Be concrete: geometry,
   hex values, weights.
2. Give the strongest argument against your own pick.
3. Name what must be fixed whichever direction wins.
4. Give a concrete recommendation for each of the following, stated under your lens:
   - the bronze and teal values to unify on;
   - gradient yes or no;
   - wordmark case;
   - type-scale tweaks to: H1 32 bold, H2 20 semibold, body 16, caption 13, eyebrow 11 mono caps;
   - the icon set: lucide at 1.75 stroke is current.

**Output:** at most 45 lines, written to the file your prompt names. Reply with at most 10 lines: your scores, your
pick and your top disagreement risk.
