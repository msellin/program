# 03 Illustrator: figure animation

Lens: silhouette, body form under motion, how "human" reads in flat SVG, keeping the look the owner likes.
Read: rig.ts header + prog/ease/build table, after-round-c sheet-01, ideas-00-synthesis, ideas-02.

## 1. What reads as less than human (and why)
The look is already good: tapered limbs, ribcage/pelvis, bronze/side colours, outlined props. The weakness is
only in TIME, not in the drawing. One global cause: every build takes ONE scalar `p` (0..1) from one cosine
`ease`, so every joint of the figure starts, peaks and stops on the same frame. People do not move like that.
- No sequencing. squat/goblet/airsquat/frontsquat: hip, knee, ankle and trunk lean all arrive together; a real
  squat leads with hips-back, knees follow, trunk pitches to counter. deadlift/slrdl: bar, hips and trunk
  rise as one rigid unit; no hips-first pull.
- Head and hands are bolted on. Head never lags or tilts; hands on pallof/pullapart/pull-ups do not trail
  the trunk. Reads as a mannequin being slid between two poses.
- Holds freeze after 0.9 s (hipflex, adductor, adductor_ext, ninety, handstand holds). A held human breathes
  and tremors; a frozen one reads as a still image with a play button.
- move2 figures (sled, farmer, suitcase, amarch, hswalk, deadbug) are two-pose alternation. Carries and
  walks have no gait: no heel-toe, no pelvis drop, no arm counter-swing. This is the least human set.
- Pull-ups: up 1.3 s / down 2.3 s is right, but no scapular set before the pull and no kip-free settle at
  the top; the body is a rigid line travelling vertically.
- "Step by step" is weak because phases are not legible: one smooth sweep, no visible beats (brace, descend,
  pause, drive). Cues (round C) show WHAT to watch, not WHEN.
All of these are fixable inside the existing rig; none needs a different body.

## 2. Would open-source motion help?
No, net negative for this product.
- MediaPipe/BlazePose from video: needs ~100+ filmed drills (we have no footage; the founder films later),
  BlazePose is noisy in side view (far limb occluded, jitter, 2D depth ambiguity), and output limb lengths
  vary frame to frame, which breaks the fixed-segment rule the panels made load-bearing. Needs L/R flip
  handling per clip, which is exactly the rehab safety hazard.
- CMU/AMASS mocap: covers squat, deadlift, walk, push-up; covers NONE of the rehab drills (adductor iso, 90/90,
  dead bug, nordic variants, ring rows, handstand walk). Licences vary (AMASS is non-commercial, SMPL-bound;
  CMU is permissive but generic). Retargeting 3D to a 2D side rig still needs hand-authored provocative-range
  clamps; mocap of a healthy athlete will happily go through 90/90 internal rotation or lumbar extension.
- Bundle: keyframe tracks for 100 drills x ~40 joints is 100s of KB, vs a few KB of code now. Reduced motion
  already works because a pose is a function of p; baked clips would need a separate poster per drill.
- Spine/Rive/Lottie: already ruled out 2026-10-28 (L/R mirroring, no tests reading the skeleton).
- Precision risk: mocap pose is "average human", the owner's liked precision is authored joint angles with
  tests. Any import would replace that. One cheap use remains: look at mocap/video once as REFERENCE when
  hand-tuning curves for 5-6 flagship drills (squat, deadlift, pull-up, bridge), not as shipped data.

## 3. Recommendation: IMPROVE THE RIG (motion layer only; body and poses untouched)
Ranked, all keep skeletons, segment lengths, side rules and provocative-range clamps (tests unchanged):
1. S: per-joint phase offset inside `p`. A `lag(p, d)` helper (delay/ease-shaped) so hips lead knees,
   trunk follows, head and hands trail ~60-120 ms. Apply to squat family, deadlift, slrdl, bridge, pull-ups.
2. S: breathing on holds, +/-1.2 px ribcage rise, 4 s period, no overshoot into lumbar extension. Reduced
   motion: off (poster).
3. M: gait cycle for sled/farmer/suitcase/amarch/hswalk (heel-strike, pelvis bob, opposite arm counter-swing)
   as a continuous phase rather than two-pose alternation.
4. S: per-phase ease shapes (sticking point on the pull/stand, controlled lower, brief pause at end) so the
   beats are visible; speaks directly to "step by step".
5. S: phase offset between tiles so a screen of figures does not pulse in sync (was in round B).
Never overshoot on bridge, thrust, kneel, 90/90, swing, march (provocative ranges).

Scores (1-10, human-like / step-by-step / excellent form together):
- Now: human-like 5, step-by-step 5.5, form 8 (form is the strength; motion is the gap).
- After items 1-4: human-like 7.5, step-by-step 8, form 8 (unchanged, test-protected).
