# 36 R1 Illustrator rescore (2026-10-29). Evidence: sheets-all 01,02,04,06-10 + thumbs-actual-size; sheets 03,05 judged from the thumbs sheet only.
Overall: the look is kept (tapered limbs, outlines, side colours, tile ground line). ARM86/ARM80 arms read as human proportion now (goblet,
front squat, farmer, deadlift: arm ~ trunk-length, no more stub arms). Remaining gap is legibility at 56x40 and a few frontal figures.

## Scores
hipflex 8 | adductor 8 | adductor_ext 8 | bridge 8 | deadbug 8 | kneel 8 | ninety 7 | hang 7 | pullover 8 | roller 7
pullup 7 | pullup_single 7 | pullup_slow 7 | pullup_band 7 | pullup_band_light 7 | pullup_partial 7 | pullup_negative 7 | pullup_negative5 7
pullup_top 8 | pullup_mid 8 | scappull 7 | activehang 8 | rowflat 8 | rowincline 8 | rowfeet 8 | pullapart 8 | hollow 8 | hollowpull 8
wristprep 8 | fingerraise 8 | downdog 8 | child 8 | wallhs 7 | wallhs_90 8 | wallhs_lean 8 | wallhs_shrug 7 | wallhs_taps 7 | hsfree 7
hstuck 7 | hswalk 7 | kickup 8 | wallwalk 8 | squat 8 | frontsquat 8 | deadlift 8 | bridge2 8 | hipthrust 8 | splitsquat 7
slrdl 8 | pallof 8 | nordic 7 | sled 8 | suitcase 7 | farmer 8 | airsquat 8 | goblet 8 | amarch 7 | legswing 7 | hollowtuck 8
(No figure 9-10: a 10 would need the thumbnail issues below fixed library-wide plus a head/hand polish pass; not reached.)

## Library-wide
- [H] 56x40 thumbnail of the pull-up family (pullup, _single, _slow, _band x2, _partial, _negative x2, scappull, hang; 11 figures) is
  near-identical: ~10 px wide figure, bar, one orange blob. Cannot tell variants apart or see chin-over-bar → give each variant ONE thumbnail
  discriminator that is already in the pose (chin height relative to bar: top/mid/hang drawn at the bar-contact frame; band loop in contrast
  colour; negative = down-arrow in the existing arrow slot), and render the 56x40 at the variant's key frame, not frame 0.
- [H] Frontal pull-up arms: at 144 px tile the ARM80 arms form a thin V that vanishes behind head/shoulders from 25-75% (pullup 754/1456 ms
  frames); elbows not readable → widen grip to ~1.4x shoulder width in the frontal view or let the forearm stroke render over the torso
  outline so the elbow flare stays visible at 6-8 px stroke.
- [M] Orange side/effort icon beside pull-up figures (arrow, blob, chevron; activehang, scappull, pullup_top) is as large as the torso at
  thumb size and reads as a second figure/limb → cut to ~60% area, same x offset, so the body keeps the focus.
- [M] Frontal figures (hang, pullup family, farmer, suitcase, pallof, wallhs family) have two legs fused into one 6 px grey stem at thumb size;
  near/far leg contrast is lost → 1.5 px gap or darker far-leg fill (still >= 3:1 vs background).
- [M] Head: clean disc everywhere, but at 56x40 side views of squat/goblet/airsquat/deadlift the head is the same grey as torso; fine
  in tile. No change except keep ring contrast; consistency across library is good.

## Per-figure items (only what drops it below 9; most share the issues above)
- ninety 7 [M] frontal arms+torso+two thighs: at tile the arms (T-line) cross the chest bar and merge; thumb is a spider → arms down to hip-width diagonal as in first frame, lower torso bar clutter.
- hang 7 [M] bar at the top edge crops arm/hand; thumb shows only a stick → drop bar 6 px, hands visible as small knobs.
- roller 7 [M] hands behind head + roller + head lie in one 20 px blob at thumb; roller grey = torso grey → roller darker or outlined with brand tone.
- wallhs/_shrug/_taps/hsfree/hstuck/hswalk 7 [M] 18 px wide, ~110 px tall figures: thumb legible but head/shoulder shrug (3 px) and taps are invisible at 56x40; the wall line is the only cue → accept for hold; for taps/shrug draw the working hand/shoulder with the side accent colour so the change registers.
- hstuck 7 [M] tucked legs at top are orange sticks 2 px thick, read as arms → tuck legs get grey thigh/orange shin like other floor figures.
- hswalk 7 [L] ground dashes are the sole travel cue and sit under the hand; at 144 px they look dotted ground; good in motion, fine.
- nordic 7 [M] tile/thumb frame is the full-flat bottom (figure = 80 px line), looks like a person lying down, not the exercise → pick tile frame at ~50% (hips extended, torso ~45 deg), and keep the ankle anchor visible.
- suitcase 7 [M] L marker and a thin teal arm hide the bell; frontal, hip-width legs fine; thumb shows teal arm only → bell outline thicker or filled.
- amarch 7 [M] swinging arm in the 144 px tile is a 4 px stroke, the raised knee carries it; in thumb the arm is lost → arm stroke width = other figures' arm width.
- legswing 7 [M] frontal rail+figure+teal leg; at thumb it is a stick next to a rail → rail lighter (grey 40% less contrast) so the leg is the only saturated element.
- splitsquat 7 [M] bench, load, two legs and L marker in 40 px; rear foot on the bench merges with the box top → rear shin outline contrast; dumbbells greyer.
- scappull 7 [M] the cue icon is the only moving element and is bigger than the scapula motion it shows (see library-wide).
- squat/frontsquat/goblet/airsquat 8 [L] lifter now balanced and readable; the bar on the shoulders is a thin brown dash, goblet bell hidden behind arm at thumb → bell outline ring +20% radius.
- deadlift 8 [L] bar plate ring and vertical forearm stroke overlap along the shin (tile shows plate over knee); lockout figure is correct and tall; plate stroke slightly lighter so the leg shows through.
- sled 8 [L] ground ticks give travel; the push arm (ARM86 long) now reads; sled block grey = box grey elsewhere, fine. Limb fill difference near/far leg is low in the lunge → far leg darker.
- bridge/bridge2/hipthrust 8 [L] the dashed shoulder-hip-knee guide line is thin at tile, vanishes at thumb; consistent with before.
- kickup 8 [L] tile frame = lunge start, thumb frame = vertical (different frames), consistent with the rest? No: other figures use frame 0 → choose one rule (key frame) library-wide.
- Lying figures (adductor x2, pullover, hollow, hollowpull, hollowtuck, deadbug, child) 8: ARMLY arms and ground line OK; hollow/hollowpull arms overhead against the head disc fine; deadbug raised arm/leg poles 40 px grey+pink vertical lines are the thinnest strokes in the library (3 px) → 4 px.

## Unreachable targets
Lane notes' unreachable items (goblet no deeper than parallel, bridge knee 90-110, hipthrust knee 100-110) are drawing/safety constraints, not illustration faults: reasoning holds, not counted.
