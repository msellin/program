# 01 Animator lens: recommendation IMPROVE THE RIG (small, targeted). Do NOT adopt mocap/MediaPipe.
Scores (human-like / step-by-step / form, 1-10): now 5.5, after the ranked fixes 7.5. After mocap adoption: ~7 at best, with safety and precision regressed.

## 1. What reads as less than human today (code: `prog`, `drawFigure`, one scalar `p` per figure)
- Every move is ONE scalar p through ONE cosine between two authored poses (`prog`, rig.ts ~L85). All joints arrive together: no lead/follow, no overlap. Squat/air squat/goblet: hip slides on a straight line from [155,80] to [129,127] while trunk lean lerps linearly; a real squat has hips-back first, trunk counter-rotating, then knee bend. Deadlift, hip thrust, nordic, pull-up behave the same.
- Effort and return have the same shape family. No sticking point on the way up, no controlled eccentric. Authored k keys give different DURATIONS (good, fourth key) but not different curves.
- No anticipation, no settle. Holds (planks, hangs, 90/90 end, pallof) ease in 0.9 s then freeze and the rAF loop stops (`figureIsStatic`): a mannequin, not a body. Worst: `hang`, `scappull` top, `pallof`, `handstand`, `bridge` hold.
- move2 gaits (`sled`, `amarch`, `farmer`, `suitcase`, `hswalk`) alternate by cutting at the half cycle; the near/far leg roles swap in one frame with the colour/draw-order pop, and there is no double-support or weight transfer. They read as two poses toggling, not walking. `legswing` and `kickup` are one arc each, no follow-through.
- Step-by-step: phases are timed (k0..k3) but nothing marks them. Rest, effort, hold and return look the same, so "step by step" is carried only by the label text and the (round C) cue overlays.

## 2. Would open-source motion help? Mostly no.
- Data: MediaPipe/BlazePose needs video of each drill; we have none, and licensing our own filming per ~100 drills (incl. rehab specifics: kneel, 90/90, bridge variants) is the founder's open task. CMU/AMASS cover walking, squat-ish, jumps; they lack pull-up variants, ring rows, wall walks, Nordics, Pallof, hip-rehab drills. AMASS licence is non-commercial/registration; CMU is permissive but 3D, noisy, and unlabelled by form quality (mocap of an average person is not "excellent form").
- Retargeting: 3D skeleton to our 2D side view with FIXED segment lengths and our L/R convention needs per-drill IK cleanup, i.e. a per-drill hand edit anyway. Pose-estimator landmarks jitter, flip L/R on side views (the exact failure that is a safety issue in rehab), and cannot respect provocative-range caps (`ninety` knee never past hip, bridge free leg bent). Every extracted clip would need a clamp pass; `rig.test.ts` reads the skeleton, not baked tracks.
- Bundle/runtime: baked keyframe tracks for 100+ drills at 30 fps are 5-20x the size of the procedural builds; reduced-motion poster and ghost logic would have to be re-derived. Spine/Rive: runtime plus licence cost for no gain; prior panel (2026-10-28) already rejected it.
- Precision: owner likes the current figures because they are authored and exact. Captured motion makes them wobblier, not better.
- Useful as REFERENCE only: scrub public video/mocap to read real hip/knee/trunk angle timing, then author the curve numbers by hand.

## 3. Ranked improvements (all inside `prog`/`drawFigure`/`build`; reduced motion and posters untouched)
1. Per-phase ease shapes plus sticking point (S, +0.8): concentric decelerates into the top, eccentric near-linear with soft stop. `Fig.feel: grind|snap|float`. Test: monotone, endpoints 0 and 1.
2. Sequenced joints on the 6-8 loaded lifts (M, +0.8): squat/deadlift/hip thrust/nordic/pull-up get a second phase parameter (p_hip leads p_trunk by ~8% of the move; hip path an arc). Improves "step-by-step" most: you see hips back, then knees, then trunk.
3. Alive holds (M, +0.7): 4.5 s breath, <=0.8px on head/chest only (limbs unchanged), hang sway decaying, 15 fps poll; replace the static stop. Gate `!reduced && !still`.
4. Phase beats (S, +0.4): a 150 ms dwell and a subtle tick/outline pulse at each k key (arrive, hold, release), so phases are readable; reuse cue-slot style.
5. Gait pass for move2 (M, +0.4): cross-fade near/far roles over ~120 ms, add a weight-transfer hip bob and a foot arc; no pop.
6. Anticipation/overshoot (M, +0.3): only on figures marked `spring` (pull-ups, hangs, handstands, carries); FORBIDDEN on bridge, hip thrust, kneel, ninety, legswing, amarch (past-range = provocative position).
Effort total: items 1+3+4 = one M-size round (~1 day); 2 and 5 a second round.
Risk to what the owner likes: low; endpoint poses and segment lengths are unchanged, so `rig.test.ts` limb/range checks still pass.
