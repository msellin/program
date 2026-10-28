# Ideas 01: animator lens (weight and realism in motion)

Baseline: the figures are clean and correct, but every move is the same `ease()` cosine between two poses,
then dead still. That is what reads as "animated diagram" rather than "a body with weight". Scores below are
my estimate of motion realism on 1-10, today about 5.5 on average (holds 4, moves 6). All ideas stay inside
`prog` / `drawFigure` / `build` and cost a few multiplies per frame. Reduced motion keeps showing the poster:
every idea below is gated on `!reduced && !still`, so that path is untouched.

## 1. Per-phase ease shapes and a sticking point (S, +0.8)
What: effort and return stop being mirror cosines. Concentric = fast start, decelerating hard into the top
(a grinding "sticking point" in the last 15%); eccentric = slow, near-linear, with a soft stop at the bottom.
Why: a body under load is slow where it is mechanically weakest; a cosine reads as a motor.
Sketch: `prog(t, k, shape?)` takes a shape per segment: up `u -> 1 - (1-u)^1.8` blended 70/30 with
`ease(u)`, then multiply the last 0.15 by 0.85 (a flat spot); down `u^1.15` ease-out at the end. A per-Fig
`feel: "grind" | "snap" | "float"` (pull-up/squat = grind, kick-up/sled = snap, wrist prep/roller = float).
Safe: same endpoints, only the curve changes. Add to `rig.test.ts`: `prog` monotone per segment, 0 and 1 hit.

## 2. Anticipation and settle (M, +0.7)
What: a 3-4% counter-move before a rep (pull-up shoulders dip 2px, squat unlocks the knees, kick-up swings
back) and a damped settle after arriving (a 4% overshoot decaying in ~0.4 s).
Why: anticipation and overshoot are what make a pose change look caused by something. The hold entry today
is a clean cosine with no life.
Sketch: `prog` returns a second value or the builds get `p` slightly outside 0..1: `p' = p - a*sin(pi*u)` in
the first 8% of `k0..k1`; `p' = 1 + s*exp(-4.5 v)*cos(14 v)` after k1 (v = seconds since arrival).
DANGER: overshoot is forbidden on bridge, hip thrust, kneel, `ninety`, leg swing and A-march (past the line =
lumbar extension, past the range = a provocative position). Add `Fig.spring?: 0..1` default 0 and clamp `p'`
to [0,1] unless set; allowed on pull-ups, hangs, handstands, pallof, carries. Test: `spring` figures only.

## 3. Breathing and micro-life on holds (M, +1.0, the biggest hold fix)
What: holds currently freeze after 0.9 s and the rAF loop even stops (`figureIsStatic`). Add a 4.5 s breath:
shoulders and head rise ~0.8px in the authored frame on inhale, ribcage width +4%, fall on exhale. Hang: add
a 0.3Hz body sway of 1.2 degrees decaying over 3 s after the grab. Isometrics (adductor, hip flexor, top
hold): effort tremor, a 6 Hz +-0.25px on the working limb, ramping in after 3 s.
Why: a body that is not breathing is a mannequin. This is the cheapest "alive" signal there is.
Sketch: `drawFigure` post-processes `sc.items`: add `role?: "head" | "chest"` to `FigureSlot` (set by
`Scene.dot` for r>=10 and by the TORSO line), shift role points by `(0, -b)` where
`b = 0.8*sin(2*pi*elapsed/4500)`; keep limb joint positions unchanged (limb lengths hold, only the
shoulder end moves, within 0.8px). `figureIsStatic` returns true only for reduced; holds poll at 15 fps
(`if (ts - last >= 66)` when the figure is a hold) to protect battery. Gate: `elapsed > 900`.

## 4. Overlap and drag: head, neck, hands lag the trunk (M, +0.9)
What: the head is currently glued to the shoulder (`sc.dot(P(S,20,a))`). Make it follow with a 120-150 ms
lag, and the free hand/foot trail the arm/leg by ~80 ms. The neck is its own short segment so the spine reads
as chest plus neck plus head, not one stick with a ball.
Why: overlapping action: the heavy mass arrives first, the light end settles after. Head lag on a pull-up or
squat is the single most "this is a person" cue.
Sketch: `build(sc, side, p, rep, ph)` receives `ph = prog(t - 0.13, k)` (same function, shifted time, free).
Builds use `ph` only for head angle and distal joints: `neck = P(S, 8, lerp(trunkA, headA(ph), 0.7))`,
`head = P(neck, 12, ...)`. Trunk stays one segment; do NOT bend the lumbar. Thoracic bend of <=6 degrees
only on: hang (ribs flare is wrong: skip), squat (upper back stays), roller (that is the exercise).
Limb lengths constant, so the existing bounds test holds. Retrofit order: pullFig, squatPose, deadlift,
slrdl, handstand, nordic, then the rest via the generic `headAt(S, a, ph)` helper.

## 5. Centre-of-mass logic (M, +0.9)
What: make the body balance over its base instead of hips travelling on a scripted path. A cheap 9-point mass
model (head 8%, trunk 50%, thighs 2x10, shins 2x4.5, arms 2x5, plus the load) gives a CoM x; solve the hip's
x so CoM sits over the mid-foot (squat, deadlift, slrdl, split squat, nordic, sled).
Why: the eye detects a wrong CoM instantly: a squat whose hips do not go back far enough looks pasted, and
a Romanian deadlift with the free leg rising but no counter-shift looks like it will tip.
Sketch: `comX(sc)` over the item polylines by role; in `squatPose`/`deadlift`/`slrdl`, replace the authored
`H.x` lerp with `H.x = solve(F.x + 6 - restOfBodyOffset)` using 2 fixed-point iterations (bounded, no loops
at render: precompute a 33-sample table per figure in the `boxCache` style). Also a test:
`comX within [heel, toe]` for every standing figure at all 33 samples. The test is worth it by itself.

## 6. Ground contact that holds, and shows load (S, +0.6)
What: (a) a test that finds planted endpoints (y >= 164 or on the bar y=28-30) and asserts x drift < 0.5px
over the cycle; (b) a contact shadow: a 10-14px dash under every loaded foot/hand, widening 10% and darkening
with load, lifting out when the foot lifts (sled, march, hswalk step).
Why: foot sliding is the commonest tell of a cheap rig. The audit found `hswalk` and `wristprep` by eye;
a test makes it permanent. Contact shadows are a one-line weight cue.
Sketch: `rig.test.ts` samples `drawFigure` at 64 times, takes the last point of each limb polyline with
y>=164, fails on drift unless the figure is on an allow-list (`hswalk` plants slide by design: treadmill).
`Scene.shadow(pt, load)` pushes a FLOOR-coloured polyline (no slot count rise if merged into the `floor()`
slot as a dashed `bg` polyline: one extra slot at most; `SLOTS` is 24, check head-room).

## 7. Real handstand and hang balance (M, +1.0 for those figures)
What: replace the single lean with an inverted-pendulum sway: lean(t) = 1.4*sin(2.1t) + 0.8*sin(5.3t + 1)
degrees, and a visible correction: fingertip/heel-of-hand segment length changes when the body leans over it
(toes press when the lean goes forward, heel when it goes back), arms hold, shoulders move 1px.
Why: the founder wanted it ("irregular sway"); today `hsfree` is a lean on a hinge. Visible finger
corrections are exactly what "small balance corrections through the fingers" says in the label.
Sketch: handstand `build` gets elapsed (add `t` 6th arg; sines of absolute time so it never loops visibly);
amplitude ramps 0 -> 1 over the first 1.5 s; `hand` finger line `[hand.x-3, hand.x+13]` becomes
`[hand.x-3 - c, hand.x+13 - c*0.5]` with `c = clamp(lean_velocity*...)`. Wall variants: no sway, only
breathing (idea 3). Safe: no ranges change; amplitude is 2 degrees.

## 8. Timing variety so a screen does not pulse in sync (S, +0.5)
What: (a) phase offset per figure from a hash of `id + side` (0-100% of dur) wherever the figure is not
driven by a set timer (Today tiles, any list of figures); (b) rep-to-rep tempo variation: bottom pause and
return length vary +-6% by `rep` (deterministic hash), the last rep of a set a touch slower.
Why: 5 figures in a list all hitting their end pose on the same frame is the strongest "screensaver" tell.
Sketch: `drawFigure(..., phase = 0)`: `t = elapsed + phase * dur`; `ExerciseFigure` passes
`hash(figure+side) / 2^32` only when `getElapsed` is the free-running tile clock (new prop `desync`); in
the player keep 0 so the figure still matches the set timer and the voice/beep. `prog` gets `k` jittered:
`k2 += 0.015*sin(repIndex*12.99)`.

## 9. World scroll for locomotion, load tells for implements (S, +0.5)
What: sled, handstand walk, carries, A-march and wall walk keep the body still in frame, so travel is
invisible. Scroll dashed floor ticks with the step phase (`sc.floor(travel)`), and add equipment weight cues:
the bar deflects 1px under a pull-up's peak (the `bg` bar becomes a 3-point polyline), the kettlebell lags
the hand by `ph`, the sled shakes +-0.4px at toe-off.
Why: it answers "is it moving forward?" and shows load without text. Dashes are existing slot style
(`dash` attribute is already painted), only the offset needs a computed phase.
Sketch: `Scene.floor(offset = 0)`: dash `"10 10"` with points offset by `offset % 20`; builds pass
`travel = step * 20`. Floor is `bg` so bounds are unaffected.

## Ranked top 3
1. Ideas 1+2 together (ease shapes, sticking point, anticipation and a safe settle): one `prog` change lifts
   all 36+14 figures at once; gate overshoot with `Fig.spring`. Biggest gain per hour of work.
2. Idea 3 (breathing, tremor, sway on holds): holds are half the library and are currently dead; ~1 point
   on those, small code, keep the loop at 15 fps for holds.
3. Idea 4 (head and neck overlap with lag `ph`): the best "weight" cue after timing, and the head/neck
   segment gives the spine its second joint. Idea 5 (CoM solve plus test) is the runner-up and the best
   safety net against a figure looking wrong later.

Expected combined: motion realism about 5.5 -> 8.0. No new bitmap, no engine; per-frame cost is under 100
extra float ops per figure.
