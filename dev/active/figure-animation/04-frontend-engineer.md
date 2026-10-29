# 04 Frontend engineer (feasibility, licence, pipeline, cost, tests)

**Recommendation: IMPROVE THE RIG. Do not adopt a motion-capture source.** Now 6/10 human-like, step-by-step, form. After the ranked fixes about 8/10.

## 1. Why the motion reads less than human (code, not guesswork)
- One easing for everything: `prog()` is rest, cosine, hold, cosine, rest (rig.ts:101-110). Every joint finishes together, so there is no lead-lag, no sticking point, no anticipation. Reads as a puppet on a timeline.
- 31 builders serve 97 exercise ids (`exercise-figures.ts` maps many drills to one builder), so "different drill" often means "same motion". Scores are limited by the poses, not by the data source.
- Holds freeze after 0.9 s (rig.ts:1068): hollow_hold, plank, bridge and wall-sit go dead. Handstand has no sway.
- A rep is a single p in 0..1 driving angles linearly. "Step by step" is missing: no phase beats (descend, pause, drive). The player only shows one phase at a time.
- Head and hands are rigid with the trunk (head is `P(T,18,a+155)`-style offsets), and floor figures use the trunk length as a single segment.

## 2. Open-source motion: feasibility
- **MediaPipe / BlazePose** (Apache-2.0 code and models; the model weights ship through Google's terms, which permit use). Needs source video per drill. We have none: ~97 drills, many rehab-specific, no filmed clips (owner has not filmed; AI video paused). Extraction from stock footage means video licences (not ours), a single-camera 2.5D z estimate, jitter, and left/right swaps on side views (BlazePose flips L/R under occlusion; a safety issue here). Output is 33 noisy landmarks with per-frame varying bone lengths, which breaks the rig.test.ts "segment length never changes" invariant until re-solved.
- **CMU Mocap**: free for any use, but covers walking, running, jumping, dance. Almost none of the drills (Copenhagen, Pallof, dead bug, Nordic, 90/90). **AMASS**: non-commercial research licence plus the SMPL licence. Unusable in a product. **Mixamo**: Adobe terms forbid redistributing the raw animation files; retargeting output still derived. **Human3.6M, 100STYLE, etc.**: academic-only.
- **Retarget to 2D**: project 3D to side view, solve 2-bone IK for each limb at fixed lengths 44/42/etc. (the `ik()` helper already exists). Feasible per frame, but every figure still needs hand-fixed contact (planted hands/feet slide), the provocative-range clamps (90/90, bridge) and the L/R colour layers. That is a manual review per drill, i.e. the work we do now, plus a pipeline.
- **Spine/Rive/Lottie**: runtime 100-250 KB plus editor lock-in, and no mirroring-by-construction. Prior panel rejected it; I agree.
- **Bundle/runtime**: baked keyframes are small (31 figures x 30 fps x ~12 joints x 2 floats at 1 decimal is ~50 KB json before gzip, ~15 KB after) and cheap. The existing rAF loop at 30 fps updates ~28 polylines in place; nothing needs to change on mid phones. MediaPipe at runtime (about 8-10 MB wasm and model) is out. Cost is not the blocker; data and safety are.
- **Precision risk**: mocap would replace hand-set key poses that coach panels verified (bridge lines up with shoulder, squat stops at parallel). Noisy human data would regress exactly what the owner calls precise.

## 3. IMPROVE THE RIG, ranked (all keep rig.test.ts valid)
1. **Per-phase ease and sticking point** (S): `prog()` returns eased p per phase plus a small per-builder `lag` (head/hands trail the trunk by 60-90 ms by sampling p at t-lag). Never overshoot on bridge/thrust/kneel/90-90/swing/march (clamp p to [0,1] already in tests). Biggest human-feel gain per line.
2. **Holds that breathe** (S): after 0.9 s add +/-0.6 px trunk and rib sway at 0.25 Hz, plus handstand pendulum +/-1.5 deg; 15 fps while holding, off for reduced motion. The existing "holds ease once then stay still" test must change to "still within a 1 px tolerance" (the test edit is the only invariant touched; segment lengths are unaffected because it rotates joints).
3. **Step-by-step phase beats** (M): optional `phases: [{name,at}]` per builder, shown as a thin phase caption or dots under the figure ("down / pause / drive") on the 15 most-used drills; a tap pauses at a beat. Reuses `cueSlots` plumbing. Add a test that every phase `at` is inside k[0..3].
4. **Unique builders for the busiest shared drills** (M each): split the drills that share a builder but differ in coaching (tempo, range). Only where review panels flag it.
5. **Optional later: authored keyframe tracks** (L): hand-keyed or filmed-and-solved poses for the 10-15 most-used drills only, baked JSON, validated by the same segment-length test (assert |bone| = const +/-0.5). If the owner films clips, MediaPipe can be an authoring aid offline (not shipped), reviewed by a human per drill.

## 4. Test plan
Add: (a) no frame has a segment length change beyond 0.5 px over the full cycle for every figure/side; (b) planted contacts (hands, feet in the floor figures) stay fixed under the new lag; (c) provocative ranges stay clamped after easing (existing tests, run on 20 sampled t values rather than the endpoints); (d) reduced motion draws the poster pose unchanged.

## 5. Score
Now 6/10. After items 1-3: 8/10. After 5 for top drills with filmed reference: 8.5-9. Mocap adoption: 6-7 at best with a high risk of losing the form the owner likes.
