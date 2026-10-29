# Figure animation: one recommendation for the owner (2026-10-29)

Four Sonnet experts answered independently: [animator](01-animator.md), [biomechanist / coach](02-biomechanist.md),
[illustrator](03-illustrator.md), [front-end engineer](04-frontend-engineer.md). Brief: [BRIEF.md](BRIEF.md).

## Verdict (4 of 4): improve the rig's MOTION; keep the drawing; do not adopt MediaPipe or mocap

**Why the figures look less than human:** the drawing is not the problem. Each figure moves on one number `p` and one
cosine curve, so hips, knees, trunk, head and hands start and stop on the same frame. Holds freeze after 0.9 s. The
carries and walks swap between two poses.

**Why not MediaPipe or mocap:**
- **No data.** There is no footage for ~97 drills. CMU / AMASS contain no rehab or skill drills.
- **Licences.** AMASS and most academic sets are non-commercial. Mixamo terms forbid redistributing the files.
- **Form.** Captured reps carry the performer's own faults. Nobody vets 100 reps.
- **Safety.** Pose estimators swap L/R on side views, bone lengths vary per frame, and nothing clamps the
  provocative ranges. All three break rules in `rig.ts` that the tests enforce.

Estimated result: 5–7, losing the precision the owner likes.
Reference video may still be used offline to tune the curves of 5–6 flagship drills.

## What to build (one round, ~1 day, posters, reduced motion and every rig.test.ts invariant unchanged)
1. **Sequenced joints** (4/4): the hips lead, then knees and trunk follow; the head and hands trail by 60–120 ms.
   Applies to the squat family, deadlift, single-leg RDL, hip thrust, bridge and pull-ups.
2. **Per-phase easing** (4/4): a controlled lower, a sticking point on the way up, and a short pause at the end.
   This makes "step by step" visible.
3. **Holds that breathe** (4/4): ±1 px rib and head motion, plus handstand sway. Off under reduced motion. The one
   "hold stays still" test becomes a 1 px tolerance.
4. **Real gait for carries and walks** (3/4): heel strike, pelvis bob and arm counter-swing, replacing the two-pose
   flip. Applies to the sled, farmer and suitcase carries, the march and the handstand walk.

**Never overshoot** on the bridge, thrust, kneel, 90/90, swing or march.
**New tests:** segment lengths stay constant over 20 sampled frames, planted feet and hands do not slide, and
provocative clamps hold mid-rep.

**Scores** ("human-like, step-by-step, excellent form", 1–10):
- **Now:** 5–6.5.
- **After items 1–3:** 7.5–8.
- **Later, separately:** a 3-segment spine, floor-figure proportions, and phase beats on the top 15 drills could
  reach ~8.5.

**Owner decision:** approve items 1–4 as the next figure round, or keep the figures as they are.
