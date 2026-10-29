# 06 Visual re-score: body v2 (scores 1-10, 10 = best)

Read: thumbs-actual-size.png, before-after-body-v2.png, sheets 01 and 05 (others skimmed via thumbs), rig.ts flesh/fleshChain/fleshTrunk, ExerciseFigure paint.

## Scores (previous round -> now)
| axis | before | now | note |
|---|---|---|---|
| Readability at 56x40 | 4 | 6 | Mass reads as a person now. Pull-up, squat, hipthrust, bridge, kneel identifiable. Lying and thin front-view poses still stripes. |
| 144px Today tile | 6 | 8 | Biggest gain. Head+trunk+thigh now have weight; shadow grounds it. |
| Full player | 6.5 | 8 | Reads as a mannequin. Rowincline, bridge, splitsquat, hipthrust look intentional. |
| "Looks professional" | 4 | 6.5 | Competent flat mannequin, not yet "illustrated". Failures are joins, not style. |
| Variant distinctness | 4 | 4.5 | Unchanged by flesh. pullup x8, wallhs x6 tiles still near-identical; flesh gave no new signal. |

## What now works
- Head r=0.21T plus trunk polygon fixes the "dot on a stick" look; the squat/rowincline before/after is night and day.
- Accent limb in bronze/teal on a light-grey body gives clear working-limb identity even at 56x40 (bridge, hipthrust, kneel).
- Shadow (op .35) helps at 144px and in the player; at 56x40 it is invisible, harmless, and does not blob.

## Top issues (concrete, in rig terms)

1. **Near/far limbs do not separate when both are filled.** adductor/adductor_ext: far leg #8a909c and near accent leg overlap as one grey+orange slab; deadbug far leg is a flat grey bar behind the body. Both limbs are same radii, no edge differential. Fix: far limbs radii x0.88 and a 1.25px darker edge stroke (#5c626e) on far-colour shapes only; near limb gets a 1px #0f1114 outline "gap" stroke at op .5 drawn UNDER it, so it cuts the far limb behind (the classic cartoon separation). Order: far limbs first, then trunk, then near limbs (check Scene add order; kneel/splitsquat show far legs drawn over trunk at the hip).
2. **Joints do not read.** Knee/elbow are single continuous capsules with identical colour; bent bridge/adductor legs look like a bent sausage with no kneecap, hipthrust arm like a block. Fix: in fleshChain, bump the middle joint radius r1 to 1.12x (knee/elbow bulge) and add a tiny 0.3 op lighter highlight circle (r=0.4*r1, +#e6e9ee) at the joint for BODY-coloured limbs only; for accent limbs, a darker 0.25 op circle at the inner angle. Alternative cheaper: shrink r1 to 0.9x (waist-in) so the joint reads as a pinch. Pick one; the pinch is cheaper at 56x40.
3. **Neck/head join.** Head is a disc, neck capsule (0.075T) is the same grey and vanishes into trunk top; on hollow/hollowpull/rowincline the head floats against the shoulder like a ball. Fix: head centre offset 0.03T along the trunk axis toward the shoulder is not enough; instead set neck radius 0.085T and draw head with a 1px edge stroke of #0f1114 op .35 on its lower-back side, or lighten head to #d6dae1 (+1 step vs BODY) so it separates from the chest. Also lying/prone poses: head sits at the end of the trunk with no chin offset, see wristprep: reads as a lump.
4. **Front-view figures (pullup, pullapart, suitcase, farmer, pallof) look wrong.** Figure is a tall vertical sausage: trunk is a side-profile polygon (waist narrow, ribcage wide in the *depth* direction), so in front view the torso is narrower than the shoulders-plus-head and legs fuse into one tapering block ("ghost in a sheet", pullup tiles at 56x40 are a 3px column). Fix: for front-view figures (flag on Fig: `front: true`, or detect: both shoulder points share x) widen the trunk profile x1.5 (ribcage 0.28T, waist 0.2T, pelvis 0.22T), spread legs: add 0.08T gap between legs (currently overlapping capsules merge; draw far leg FAR colour at 0.9x with the dark gap stroke from #1). Add a shoulder girdle bar r=0.09T so arms hang from shoulders, not the neck (pullup arms start at the head).
5. **Thin/lying and small-extent poses still stripes at 56x40.** hollow, hollowpull, adductor, deadbug, wallhs, handstand family: 2-3px tall. Flesh cannot fix framing. Fix (carry over from 03-visual): per-figure tight viewBox crop for thumbs (fit bounds + 12% pad, scale to width), so a lying pose uses 56px width and ~24px height; and at drawnPx<=64 add +15% to every flesh radius (limb 1.5px -> 2px) via a `thumbBoost` param in flesh(). This also helps the "pull-up column".

## Smaller
- Shadow: good at 144px; at the player it is a hard ellipse under the floor line, clipped by it on hipthrust/rowincline (sits half below the line). Lower op to .28, ry 0.05T, blur not needed; offset centre y +1 so it sits on the line not across it. On wall figures the floor shadow is under a 3px foot: skip if contact width < 0.5T.
- Blobby at 56x40: kneel/splitsquat thigh+shank where the bent leg doubles back (the knee is a 6px blob), wristprep/fingerraise (all-fours: torso+thigh+arm merge into one mass; the arm accent is the only legible part), hollowtuck (bronze mass of arms+legs, no structure at 56). The 1.25px edge stroke is the right width; the blobbing is overlap of same-colour shapes, solved by issue 1 (gap stroke).
- Downdog and rowflat/rowincline remain best-in-class stick-like and slightly inconsistent in weight versus the fleshy ones: downdog legs read as lines, trunk missing (trunk shape polygon degenerates when hip-shoulder line is long thin). Check it applies T clamp (45-90): T is clamped, so long trunks (downdog, prone planks ~ 130u) get slim flesh. Raise max clamp to 120 for those.
- Props stay outlines: good contrast with filled body; box fill #23262c vs tile bg #2a231f is nearly same value (nothing separates it on the tile); lift to #2f333a with PROP edge.
- Edge strokes in same colour as fill add nothing; give BODY shapes a faint darker edge (#aab0ba) so overlapping body parts show a seam (cheap partial fix for issue 1).

## Verdict
Strong step: from "stick diagram" to "flat mannequin". The remaining amateur tells are (a) overlapping same-colour shapes without a gap/edge, (b) no joint articulation, (c) side-view trunk reused for front views, (d) thin poses unframed at thumbnail size. All four are rig-level (flesh + one crop rule), none need new art. After 1+4+5 I'd expect ~7 on professional and ~7 at 56x40.
