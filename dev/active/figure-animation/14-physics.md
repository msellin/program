# Physics review of all 59 figures (contacts, balance, equipment, timing), 2026-10-29
Method: read `rig.ts` builds; COM from a Winter segment model (trunk .497, head .081, arms .10, thighs .20, shanks .093, feet .029, bar as stated) computed in a scratch script from the squat/deadlift formulas. Scale used: ~1 px = 1 cm (leg 80-86, trunk 56). Foot sole is x = ankle-4 .. ankle+12 (heel 151, midfoot 159, toe 167 for the squat ankle at 155).

## Ground contact: the owner's question (sled push, handstand walk)
The athlete does not travel, so a planted foot or hand slides backward over a static floor line. The motion itself is right (in the body frame a stance foot does move backward at body speed); only the missing reference is wrong. Correct fix: treadmill with a tracking camera. Keep the athlete and sled still in frame and scroll the ground backward at exactly the stance speed. Add floor ticks (bg slot, floor colour, 2 px, ~8 px tall) so the viewer can see the foot stand still on the ground. Without ticks a featureless line reads as a moonwalk or ice, and the owner's reading is the correct one. Letting the athlete travel across the frame forces a reset jump (loop seam). Do not use it.
- Sled: stance foot travels 52 px in 0.6 x 2600 ms, so ground speed 33 px/s, 86.7 px per cycle. Ticks every 43.3 px (two per cycle) scrolled 86.7 px per cycle: seamless, and the stance foot sits on one tick for its whole stance. The sled body and runner move with the athlete; the runner (y 166) sliding over scrolling ticks is correct (it skids).
- Handstand walk: stance hand 18 px in 0.55 x 3600 ms, ground speed 9.1 px/s, 32.7 px per cycle. Ticks every 16.4 px, scroll 32.7 px per cycle. Landing hand is 9 px ahead of the COM and leaves 9 px behind: correct inverted-pendulum order, keep it.
- Carries and A-march are drawn front-on or in place: no horizontal slide exists, nothing to fix. Gait loops are continuous (swing Hermite matches stance speed at both ends).

## Per figure
### sled
- [H] Static floor under a sliding stance foot → ground ticks as above (86.7 px/cycle).
- [M] Label says arms long, but hand (232,80) is 43 px from the shoulder (191,64), reach 54: elbow ~110° → hand x 244 (post x 244) or hips 10 px back so the arm is ~175°.
- OK: balance. Stance foot 108 -> hand 232 with COM ~170 needs a sled drag of ~0.7 BW (62 px x W = 86 px x F), which is a believable heavy sled.
### hswalk
- [H] Same slide on a static floor → ticks 32.7 px/cycle (above).
- [L] Both legs are one line and never counter-balance the weight shift; a 2-3 px opposite hip drift would read as balance, not a puppet.
### squat
- [H] System COM (body + 0.5 BW bar) sits at x=152 at depth, heel is 151, midfoot 159: one more pixel back and it topples. The cue plumb is drawn at midfoot 159 but the bar is at 155.5, so the figure contradicts its own cue. Target COM 156-160: hip x 129 -> 135 at the bottom and lean 37° (bar x = 159). Knee goes to ~176.
### frontsquat
- [H] COM 146, five px behind the heel (bar 151 vs midfoot 159, trunk only 12°): the figure would fall backward. Target COM 158: lean 24° and hip x 129 -> 137 at depth (bar over midfoot 159).
### goblet, airsquat
- [M] goblet COM 150 (on the heel), airsquat 153. Hip x +5 at depth (goblet lean 26°, airsquat 32°) puts both at 157-159. The arms-forward counterbalance in airsquat is correct physics, keep it.
### deadlift
- [H] The bar centre passes within 1 px of the knee centre between p 0.15-0.35 (dx 0.7, dy 3.5 at p=0.2): the bar goes through the knee. The knee moves forward (178 -> 181) as the bar rises; a real knee travels BACK as it extends. Target: knee x <= 168 (shin leaning back ~0° then forward again) while the bar line stays at x 172-176, so the bar clears the knee by >= 10 px at p 0.2-0.3. Alternatively hold the bar 12 px in front (x 188) and move the plumb cue.
- [L] At lockout the bar sits on the hip centre (x 172, y 80); it should rest on the thigh ~6 px forward, hanging vertical from the shoulder (it does).
### rowincline
- [H] The pose is geometrically unreachable: feet (268,164) to rings (118,36) is 197 px, a 150 px body + 20 px arm reaches 170, so `ik` clamps and the arm only goes 51.5 -> 47 px (elbow stays 130-164°). The rep does not move. Fix: feet x 268 -> 214 (distance 160, steep ~50° body, top arm 20 reachable) or ring y >= 84.
### rowflat, rowfeet
- [M] Ropes are vertical while the athlete pulls with a large horizontal component; a loaded ring rope tilts toward the feet by ~15-20°: anchor x 118 -> 138 (rope 66 px long, tan 18° = 21 px), hand stays at x 118.
### kickup
- [M] Start pose has COM ~157, behind the push foot (162-178) and 33 px behind the hands: the figure falls backward before it moves. Move the push foot to x ~145 (under the hip 141).
- [M] Hip rises beyond the planted push leg's length from p ~0.05 (hip-foot 82-85 px, leg 80). The foot must roll to the toe, or the foot leaves earlier (q from p=0.05).
- [L] Swing leg peaks at ~136°/s; a kick-up leg is 300-500°/s. It stops dead (eased) on the vertical: make the last 10% a decelerating drift, not a stop.
### wallwalk
- [M] Hands (hx 171 -> 254, 83 px) and feet (172 px up the wall) glide continuously over the floor and the wall in sliding contact. Quantise to 4 steps: 0.3 s of travel, 0.8 s planted, hands and feet alternating.
### nordic
- [M] The hand is solved to touch the floor only at p=1, then drifts 10 px back and 8 px up at p=0.9: it leaves the floor as soon as the rise starts. Pin the hand at x ~273, y 166 for p >= 0.6 and let the shoulder rise over it.
### pullapart
- [M] A taut stretched band is a straight line through the hands; here it is a U with a fixed 10 px sag below the hands at every angle. Draw it hand-to-hand at y 80, slack (small sag) only for a < 30°, and thinner as it stretches.
### pallof
- [M] The anchored end slides up the post 16 px with the hands (62 -> 46). Fix the anchor at y 54; the band runs slightly slanted.
- [L] Band widens 3 -> 5 as it stretches; a stretched band is thinner, not thicker.
### farmer, suitcase
- [M] Feet are 30 px apart but the trunk shifts only 2.5 px, so in single support the COM is 12.5 px off the stance foot and the body would tip toward the lifted leg. Either feet 12-14 px apart (hips 18) or sway +-9 px.
### pullup_negative, pullup_negative5
- [M] The reset to the top is a one-frame teleport (intentional, per rig header). If it stays, mark it as a cut (80 ms fade of the whole figure); animating it quickly is the thing to avoid. A bar-head clearance of 0 px at the top is fine.
### pullup_band, pullup_band_light
- [L] The band is always straight at the same width. It is stretched at the bottom (length 150 vs 118 at the top), so it should thin about 20% at the bottom and go slack-wavy near the top.
### splitsquat
- [L] COM ~162 puts ~37% on the rear foot (real 15-30%). Bench 8 px nearer (R x 118) or front foot 8 px back.
### hang
- [L] Torso moves 4 px away from the fixed shoulder bar (`dn`), so the arm-trunk joint opens. Move the shoulder points down with it and bend nothing.
### downdog
- [L] Leg is 119 px, the rest of the library 80-86: a 40% longer limb. Hip 190 -> hip (186,92) and foot 260 keep the angle with a leg of 86.
### hipflex
- [L] An isometric hold against the hand moves the thigh 6°; the hand should not displace (hold wAng at -8, show effort by the arrow only).

## No physics issue
adductor, adductor_ext, bridge, bridge2, hipthrust, deadbug, kneel, ninety, pullover, roller, hollow, hollowpull, hollowtuck, hang (apart from above), pullup, pullup_single, pullup_slow, pullup_partial, pullup_top, pullup_mid, scappull, activehang, wristprep, fingerraise, child, wallhs, wallhs_90, wallhs_lean (wall force 0.49 BW at the feet, feasible), wallhs_shrug, wallhs_taps, hsfree (COM 5 px ahead of the wrist, inside the palm), hstuck, slrdl (COM ~192 over the stance foot 192-208), amarch (single support under the COM), legswing (1.3 s per swing, hand on rail), hipthrust bar (rides the hip).
