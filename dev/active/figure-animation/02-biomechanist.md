# 02 Biomechanist / form lens (2026-10-29)

Basis: rig.ts (builders, `prog` timing, k-keys), the round-C contact sheets, ideas-03. Not re-filming anything; judged from code and stills.

## 1. Why the motion reads less than human / less than step-by-step
- **One global easing, one phase.** Every limb moves on the same `ease(cos)` curve, from one scalar `p`. Real lifts are sequenced: a squat or deadlift starts hip-first, the knee and trunk follow, the bar moves in a near-vertical line over midfoot. Here hip, knee, trunk reach their ends simultaneously, so squat, deadlift, RDL, split squat and hip thrust all read as "the figure morphs", not "hips, then knees".
- **No sub-phases inside the move.** A rep is rest, move, hold, return. Deadlift has no "bar clears the knee, then hips lock"; the pull-up has no scapular-depress-then-elbow-drive; the bridge has no pelvic tilt before the lift; the dead bug has no "ribs down before the limb leaves". These are exactly the cues the cue overlays name, but the motion does not stage them.
- **Rigid trunk.** One TORSO line for the whole spine (ideas-03 #2): no lumbar/thoracic curve, no rib-flare, so "keep a neutral back" has nothing to be visibly neutral against. Floor family proportions (trunk about 40% long, arms short) make bridge, pullover, dead bug, roller look stubby.
- **Mirror-symmetric timing.** Return is already slower on pull-ups and negatives (good), but squat/bridge/deadlift lowering vs raising are still the same shape. Human eccentric is controlled, concentric has a sticking-point slow-down; neither is shown.
- **Dead stops.** Hold = exactly frozen; a real hold has a few px of micro-sway (breath, tension). Gives life, costs nothing.
- Worst by name: squat family, deadlift, slrdl, hipthrust, pullup (shoulder never leads), pullover/roller (no thoracic motion), hswalk (kind move2, k [0,1,1,1]: two-frame cycle, no weight shift).

## 2. Would open-source motion fix it? Mostly no, and it would teach worse form
- **Source quality.** MediaPipe/BlazePose from random video returns noisy 2D/3D landmarks of an unknown performer: depth ambiguity in side view, foot/ankle jitter, no real spine. The performer's own faults (knee valgus, lumbar flexion at the bottom, bar drift, short ROM) become the lesson. A figure is a demonstration; it must be a model rep, and nobody is vetting 100 filmed reps. Authored keys are the vetting.
- **Coverage.** CMU/AMASS cover walking, running, jumping, a few squats/lunges. Nothing for dead bug, 90/90 transitions, Nordic, scap pull-up, muscle-up, Pallof, handstand kick-up. About 80% of the library (rehab, skill, isometrics) has no clean public data; those would still be hand-authored, so you ship two styles.
- **Retargeting breaks the safety rules.** Mocap bones have different lengths; fitting to a fixed-length 2D rig means IK drift, re-solving every frame. rig.ts rules (segments never stretch; near-side is RIGHT; provocative ranges never drawn: no deep flexion+adduction+IR, bridge free leg bent, kneel trunk never leans back) can be violated by any captured frame, and a mocap lunge or squat happily goes past parallel. You would need a clamp pass per exercise, which is authoring anyway.
- **L/R.** Sided drills mirror via the near-side convention; a captured clip has one handedness and unknown camera side. Mirroring is a safety issue here (prior panel); data cannot be trusted to carry it.
- **Cost.** Keyframe tracks per exercise at 30 fps, 100+ drills: tens of KB to MB, vs the current procedural few-KB. Licences: CMU is free but "no commercial resale of data" wording is awkward; AMASS is research-only, which rules it out for a paid product; MediaPipe is Apache-2.0 but you must film the performers (consent, health-adjacent). Rive/Spine: paid runtime/editor, same authoring effort, no gain on sequencing.
- **Precision.** The owner likes the figures because every pose is an intended key. Mocap replaces intent with a recording: you lose the clean poster pose, the cue anchors (named joints), and reduced-motion ghost (a defined end pose).
- Verdict: reject mocap for the figures. Use real clips only if the founder films them (already planned in the exercise-media track); that is a different asset, not this rig.

## 3. Recommendation: IMPROVE THE RIG (keep procedural, keep every constraint)
Ranked by form-teaching gain per effort:
1. **Per-joint phase offsets (S-M).** Replace the single `p` with `p_hip = ease(p)`, `p_knee = ease(p - lag)` etc. in squatPose, deadlift, slrdl, hipthrust, bridge: hip leads on the ascent, knee/trunk follow; add a bar-path assertion (bar x within a few px of midfoot) to rig.test.ts. Biggest "human, sequenced" gain.
2. **Asymmetric eccentric/concentric curves (S).** A second ease option (ease-out for the descent, a gentle slow-down 80-95% on the ascent). Pull-up already has the pattern; extend to squat/deadlift/bridge via the existing k keys.
3. **Micro-motion on holds (S).** +/-1-2 px breathing on trunk/shoulder in `hold` figures, reduced-motion safe (static ghost unchanged).
4. **Three-segment spine with neutral curve (M).** ideas-03 #2; `torso(sc,H,S,curve)` helper swap. Teaches neutral vs flat/rounded, rib stack.
5. **Staged sub-phases for the cue drills (M):** pull-up scap-depress then elbow-drive; dead bug ribs-down then limb; bridge tilt then lift. Uses the existing fourth key, all within provocative-range tests.
6. **Floor-family proportions (M)**, ideas-03 #1.
Test guard for all: segment-length invariance, near-side R, provocative-range checks already in rig.test.ts must stay green; add a "joints never reverse mid-rep" monotonicity test.

## Scores (1-10, human-like / step-by-step / excellent form)
- Now: **6.5** (poses are accurate and safe; sequencing and spine are the weak points).
- After items 1-3: **7.5**. After 1-5: **8.5**. Mocap adoption: **5-6** (more fluid, worse form, safety regressions).
