# 02 Motion review: 36 stick-figure illustrations

Scope: `rig.ts` timing model, `ExerciseFigure.tsx` loop, contact sheets (sheets 02 and 05 viewed as images; the rest judged from the build functions plus index.txt). Scores 1-10, 10 = best. Scale note: viewBox is 358 wide and a 144 px tile is x0.40, so 10 viewBox units is about 4 px on the tile. Limbs are about 3.9 px thick on the tile.

## Findings that apply to many figures

1. **Every move uses the same symmetric cosine.** Out and back take equal time unless `k` is bent. Real reps are not symmetric. A pull-up goes up fast and down slow. A squat goes down slow and up fast. `pullup`, `pullup_slow`, `pullup_band` and the deadlift are bent correctly by `k` alone. Squat and front squat are INVERTED: p=1 is the bottom, so down = (0.45-0.10)x6000 = 2.1 s and up = 0.45x6000 = 2.7 s. The ascent is the slow one.
2. **`k` cannot decouple return time from the hold.** Return = (1-k2)xdur, and the pause between reps is only the lead-in rest k0xdur. To get a quick concentric after a short hold you must inflate the hold. A 4th key (end of return) fixes this.
3. **The start pose is the weakest frame for most figures.** Thumbs and the brief screen draw p=0 with `playing=false`. Holds start at p=0 (pre-effort) but the reduced-motion ghost and the settled state are p=1. So the thumb disagrees with what the user sees 1 s into the set.
4. **Several end-range displacements are too small for a 144 px tile.** `scappull` is 8 units (3 px). `hang` shrug is 4 units. The adductor ball is 1.5 units. `hipflex` is 6 degrees. A tile reads motion only above about 12 units of peak end-point travel (about 5 px).
5. **Limb length breaks** (rig contract: lengths constant):
   - `scappull` and `activehang`: the arm is a bare `[hand, shoulder]` line, so it shrinks from 50 to 40.6 (-19%) as Sy goes 78 to 70.
   - `wristprep`: the thigh is knee-to-hip with the knee at H.x, so it shortens 10%.
   - `wristprep`: the knee and shin SLIDE about 23 units forward along the floor as the hip follows the shoulder.
   - `hswalk`: the whole body translates with the hand (18 units), then slides BACKWARD on the return. It reads as a moonwalk.
   - `hswalk`: it also floats. The hand lifts 6 units while the body stays supported by nothing.
   - `pullapart` arm length is projection foreshortening (18 to 52). That one is legitimate, but the start frame is hands-near-shoulders and reads as nothing.
6. **Fixed-point violations.** Only wristprep knees (above) and `deadlift` bar path: the bar drifts 11 units sideways (S.x 183 to 172) when it should travel vertically.
7. **Pull-up top frame:** end Sy=32 puts the head centre at 18 and the chin at about 29, i.e. ON the 28-high bar line, not over it. "Chin clears the bar" is not drawn. Raise the end to Sy=26 (chin at about 23).
8. **Loop wrap is clean everywhere.** prog(0)=0 and prog(1)=0, with zero velocity because of cosine. `move2` swaps rep at p=0. The only pop is the dead bug badge letters and limb colours swapping instantly. A 150 ms crossfade is optional.
9. **Isometric `hold` entry** uses cubic-out over 900 ms. It starts at maximum velocity, so there is a jolt at the first frame of the set. Cosine in-out over 900 ms is gentler. Visual difference is small because the ranges are small (see 4).

## Table

| figure | verdict | score | problem |
|---|---|---|---|
| hipflex | PASS | 7 | 6 deg thigh lift plus fading arrow; correct for an isometric, but the effort reads from the arrow only. Start p=0 has a dim arrow |
| adductor | FIX | 5 | Ball radius 10 to 8.5 (1.5 units) is invisible at tile size. Nothing readable moves |
| bridge | PASS | 8 | Foot planted, shoulders fixed, constant lengths. Up 1.2 s, hold 1.6 s, down 1.8 s is good. p=0 is lying flat, the least informative frame |
| deadbug | PASS | 7 | Opposite pairing right. 7 s per rep is slow (aim about 5 s). Rest between reps only 0.49 s. Colour and badge pop at the wrap |
| kneel | PASS | 7 | Knee and foot fixed, trunk upright, 7.2 s hold is right for a stretch. Hip shift 16 units and trunk 2 deg is small; the glute ring (opacity p) carries it. Start p=0 has no ring |
| ninety | PASS | 7 | Side to side with 0.8 s dwell at each end; fine. p=0.5 would be the least informative frame (knees neutral), p=0 is fine as a poster. Segment lengths vary about 15% (top-view projection, acceptable) |
| hang | FIX | 4 | The only change is a 4 unit sink over 0.9 s; effectively static. Start and end look identical, and identical to the pull-up dead hang |
| pullover | PASS | 8 | Arm length constant, hip and feet fixed, 4 s hold at overhead is good for a stretch. Poster p=0 is arms vertical, the less informative end |
| roller | PASS | 7 | 28 deg extension over a fixed roller, readable. Start p=0 is near flat and tells you little |
| pullup | FIX | 7 | Good asymmetry (up 1.7 s, down 2.25 s) and bar fixed. Chin only reaches the bar line. No pause at the bottom beyond 0.3 s, so reps read as one continuous wave. p=0 dead hang is the least informative frame |
| pullup_slow | FIX | 7 | Same as pullup; 3.06 s up and 4.05 s down matches a 3-1-3 tempo. Same top-chin and bottom-pause issues |
| pullup_band | FIX | 7 | Same; band length tracking the hips is good. Poster p=0 hides the band-vs-pullup difference only slightly (band visible) |
| pullup_partial | PASS | 7 | Half range at Sy=55 gives right-angle elbows, readable. p=0 is a dead hang, poster should be p=1 (the half-way pose is the point) |
| pullup_negative | FIX | 6 | The "reset" return runs 1.2 s upward, which looks like a fast pull-up: the opposite of what a negative teaches. Lower phase 7.6 s is right |
| pullup_top | PASS | 8 | Static from t=0 by construction; nothing to ease. Same chin-on-the-bar issue as pullup |
| pullup_mid | PASS | 8 | Static, right-angle elbows read well |
| scappull | FIX | 3 | 8 unit travel (3 px on a tile) is unreadable, and the straight arm shrinks 19% (see 5). Both defects together |
| activehang | FIX | 6 | Static at Sy=70 with a 19% shorter arm than hang; this is the same limb-length issue, and the stance is nearly indistinguishable from hang |
| rowflat | PASS | 8 | Rigid body pivots on fixed feet, 40 unit travel, up 2.2 s, down 2.7 s. Good |
| rowincline | PASS | 8 | Same. Angle is the difference from rowflat and is clear at p=0 |
| rowfeet | PASS | 8 | Same; box fixed. Clear |
| pullapart | FIX | 5 | Start frame (hands near the shoulders) is the least informative. The T-shape at p=1 is the exercise. No release at p=1 beyond a 1.35 s dwell |
| hollow | PASS | 6 | 14 deg lift over 0.9 s then frozen; the reduced and settled frame show the lift, but p=0 is flat on the floor. Hollow hold is 20-30 s: static for that long reads dead |
| wristprep | FIX | 4 | Knee and shin slide 23 units on the floor; thigh shortens 10%. Hands correctly fixed |
| downdog | PASS | 7 | Static, correct. Hand ring fades in (q). p=0 lacks the ring |
| child | PASS | 7 | Static, correct. Very flat at tile size (tall 25 units), reads poorly in the 56x40 thumb |
| wallhs | PASS | 6 | Static from t=0; correct for a hold. Ok but lifeless for 30+ s holds |
| wallhs_lean | PASS | 6 | Same. Angle difference vs wallhs is readable |
| hsfree | FIX | 5 | Sway is one lean of 4 deg then back, which reads as a periodic pendulum; the whole body rotates around the hands (top travels about 11 units). Real balance is a small irregular oscillation. Head offset fixed in world space, does not follow trunk |
| hstuck | FIX | 5 | Same sway; the tuck is a static pose |
| hswalk | FIX | 3 | Body slides 18 forward then 18 BACK on return; hand lifts 6 units while the body floats. Reads as a skate, not a step |
| kickup | FIX | 5 | Starts as a floating plank (feet 70 units off the floor, nothing supports them). Up and down are mirrored by cosine: the kick should be fast and the return slow |
| wallwalk | PASS | 7 | Constant 140 body length, feet on the wall, hands slide continuously (not steps). Range is large and readable. Start (p=0) is near-plank, informative |
| squat | FIX | 6 | Foot fixed, constant limbs, but INVERTED tempo (down 2.1 s, up 2.7 s). p=0 is standing, least informative |
| frontsquat | FIX | 6 | Same |
| deadlift | PASS | 7 | Tempo right (lift 2.1 s, lower 2.7 s, 0.8 s lockout). Bar path drifts 11 units sideways. p=0 (bottom) is already the best poster |

## Cross-cutting proposals

### 1. Easing
- Keep cosine in-out as the base (continuous velocity at the wrap, good for loops). Add a per-figure shape exponent pair `shape: [a, b]`, applied as `ease(x^a)` for the first phase and `1 - ease(1-(1-x)^b)`... in code, simply `ease(Math.pow(x, e))`.
- Concentric (the rise of a pull-up, deadlift lift, kick-up): front-load with e=0.8. Eccentric (lowering, squat descent, negative): back-load with e=1.2. Neutral stretches and mobility: e=1.0.
- Holds: swap cubic-out for `ease(min(1, t/900))`. No jolt.

### 2. Four-key timing `k=[k0,k1,k2,k3]`
Rest until k0, go to the end pose by k1, hold until k2, return by k3, rest to 1.0. Existing 3-key figures stay valid with k3=1.0.

| figure | dur ms | k | resulting phases (s) |
|---|---|---|---|
| pullup | 5200 | [0.02, 0.27, 0.37, 0.82] | up 1.3, top 0.5, down 2.3, bottom pause 1.0 |
| pullup_slow | 9000 | [0.02, 0.35, 0.40, 0.88] | up 3.0, top 0.45, down 4.3, pause 1.1 |
| pullup_band | 5500 | [0.02, 0.27, 0.36, 0.82] | up 1.4, top 0.5, down 2.5, pause 1.0 |
| pullup_partial | 4600 | [0.02, 0.26, 0.34, 0.80] | up 1.1, top 0.4, down 2.1, pause 1.0 |
| pullup_negative | 10000 | [0.03, 0.80, 0.88, 0.96] | lower 7.7, hold 0.8, reset step 0.8 (use e=0.8), pause 0.4 |
| squat / frontsquat | 5500 | [0.05, 0.40, 0.46, 0.78] | down 1.9 (e=1.2), hold 0.35, up 1.8 (e=0.8), pause 1.2 |
| deadlift | 5200 | [0.05, 0.33, 0.43, 0.82] | lift 1.5 (e=0.8), lockout 0.5, lower 2.0 (e=1.2), pause 1.1 |
| kickup | 4500 | [0.06, 0.28, 0.45, 0.90] | kick 1.0 (e=0.7), hold 0.8, return 2.0 (e=1.2), pause 0.5 |
| deadbug | 12000 (6 s/rep) | [0.06, 0.40, 0.52, 0.94] | reach 2.0, hold 0.7, return 2.5, pause 0.8 |

Other figures keep their current dur/k; they already read as reps. Rule of thumb: concentric 1.0-1.5 s, eccentric 2.0-2.5 s (3-4 s for tempo and 7+ s for negatives), end hold 0.4-0.6 s (0.8-1.0 s for kick-up/lockouts, 4+ s for stretches), pause at the bottom 1.0 s.

### 3. Fix the movement defects
- `scappull`: end Sy=66 instead of 70 (12 units). Draw the arm as `[hand, shoulder]` but also move the hands' contact (see limb note): simplest is to accept a straight arm whose length stays 50 by letting shoulders move along the arc (shoulder x +/-); if not, add a 4 unit elbow bow via `ikSide` with L1=L2=26 so a shortened chord bends visibly less than it stretches. Decide between these two options; either way remove the pure 19% shrink.
- `wristprep`: keep the knee fixed at x=110 (start hip x). Let the hip move with the shoulder only by tilting the torso (rotate H about the knee thigh length 52): `H = P(knee, 52, -90 + a*0.5)`, torso length 98 via `S = P(H, 98, -a*0.4)`. Hands stay at 208.
- `hswalk`: make the figure stationary and scroll floor ticks left by 18 units per step (two ticks, repeating); move the hand and body through two small steps per loop; keep the supporting hand on the floor while the OTHER hand lifts (draw the far hand in FAR colour). Remove translation of S and the 6 unit hand lift.
- `kickup`: start with the rear foot on the floor: p=0 gives the lunge, H angle -155 becomes -130 and F reaches y=166 at p=0.
- `hsfree` / `hstuck`: replace the single lean with `lean = 2.5*(0.6*sin(2pi*p*2)+0.4*sin(2pi*p*3.1))` driven by time (not by p), amplitude 2.5 deg; rotate the head offset with the trunk.
- `pullup`, `pullup_top`: end Sy=26 for chin over the bar.
- `deadlift`: hold S.x = 183 constant by solving lean from the hip x; bar then rises vertically.
- `deadbug`: crossfade the colour and badges over 150 ms around the rep swap.
- `adductor`: add a squeeze cue that survives 0.4x scale: knees move 5 units toward each other (K.x -2.5 each side is below the ik freedom here, so instead pulse the ball radius 10 to 7 and add a 2 px ring in ACCENT at q) or drop the ball shrink and rely on the arrow-style ring as `hipflex` does.
- `hang`: shoulders shrug 4 to 10 units (still 2 px lighter than readable) or accept it as static. Recommended: accept static and distinguish by label/poster.
- Optional breathing on long holds (downdog, child, hollow, wallhs*, hang, activehang): +/-1 unit trunk and head sine, 4 s period. The rAF loop would then run for holds, so gate it to `playing` only. Low priority; skip if battery matters.

### 4. Poster frame (thumbnails and the static brief)
Rule: **the poster is the frame a person would pick to describe the exercise** = the end of the concentric or the peak of effort, never the rest pose, except where the rest pose is itself the teaching point (deadlift bottom, negative top, row angle).

Implementation: add `poster?: number` to `Fig` (default: 1 for `hold`, else 0). In `drawFigure`, accept `elapsed <= 0 && !reduced` as "poster" and use `p = f.poster ?? (hold ? 1 : 0)`. `ExerciseFigure` calls it unchanged (`elapsed 0` from `first` and from paint when not playing). A paused-at-0 set shows the poster; any elapsed above 0 plays normally. The first frame of playback therefore jumps from poster to start pose; to avoid the jump, let `first`/paint treat `elapsed==0 && !playing` as the only poster case (once playing starts, `getElapsed()` is greater than 0 within a frame).

Numbers (p; blank = default):

| figure | poster p | why |
|---|---|---|
| hipflex, adductor, hang, pullup_top, pullup_mid, activehang, hollow, downdog, child | 1 | peak effort, same as reduced-motion frame |
| wallhs, wallhs_lean, hsfree, hstuck | 1 | static; pick the sway end |
| bridge | 1 | hips up, not lying flat |
| deadbug | 1 (rep 0) | arm overhead and opposite leg out |
| kneel | 1 | hip forward, glute ring visible |
| ninety | 0 | one-sided pose; 0.5 is the worst |
| pullover | 1 | arms overhead |
| roller | 1 | extension over the roller |
| pullup, pullup_slow, pullup_band | 1 | chin over the bar (dead hang equals every hang) |
| pullup_partial | 1 | the half-way pose is the point |
| pullup_negative | 0 | already the top; poster = start |
| scappull | 1 | shoulders down |
| rowflat, rowincline, rowfeet | 0 | body angle is the difference; arms-straight is the setup |
| pullapart | 1 | T-shape |
| wristprep | 1 | shoulders over hands |
| hswalk | 0.25 | mid step |
| kickup | 0.5 | legs mid-swing |
| wallwalk | 0.8 | feet up the wall |
| squat, frontsquat | 0.9 | bottom position |
| deadlift | 0 | bottom setup is the best frame |

Reduced motion already shows p=0 plus a ghost of the end pose; with posters, reduced-motion should show the poster in solid and the other extreme as ghost (swap when poster=1).

### 5. Tile readability rule
Add a unit test: for each figure, max point distance between p=0 and p=1 frames of any working-limb vertex >= 12 viewBox units (or the figure is declared `kind: "hold"` with a static brief). Today this fails for `scappull` (8), `hang` (4), `adductor` (1.5), `hipflex` (rough 8) and `hsfree` sway (11, borderline).

### Not checked
Sheets 01, 03, 04 and 06 were not looked at as images; verdicts there rest on the build functions and index.txt. The Today tile in sheet 02 shows the pull-ups at the top frame, so the Today tile is evidently not drawn at elapsed 0, unlike the 56x40 thumb; confirm which callers pass 0 before relying on the poster for the Today tile.
