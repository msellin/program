# Figure ideas: four experts (2026-10-28)

The founder asked how to make the figures more realistic and better, after the review pass in `00-summary.md`. Four
Sonnet experts answered independently:
- [animator](ideas-01-animator.md): motion
- [illustrator](ideas-02-illustrator.md): body form and visual language
- [S&C coach / biomechanist](ideas-03-coach-biomech.md): does it teach correctly
- [product design lead](ideas-04-product.md): where to invest

Gains are each expert's own 1–10 estimate, so they are not directly comparable.

## Where they agree

1. **Keep the procedural SVG rig.** The product lead calls it strategic. The illustrator found that the existing
   `<polyline>` slots already take `fill`, so a richer body needs no new renderer. Do not move to Lottie/Rive, a 3D
   rig, a drawn coach avatar, or AI video. AI video is out because L/R mirroring is a safety issue in rehab.
2. **Add a teaching overlay per drill** (3 of 4 experts). Examples:
   - bar path over mid-foot
   - a hip or elbow angle arc
   - an ear–shoulder–hip line
   - a dashed range arc with an end-pose ghost
   - a ghost of the neighbouring variant rung (band 24/14/6, ring-row angle 0/30/55°)

   The biomechanist ranks this first (8/10) and the product lead first ("specificity reads as real coaching, not
   prettiness"). It doubles as the static cue for reduced motion.
3. **Give the body form.**
   - Tapered limbs (thigh thicker than shin) and a ribcage + pelvis torso instead of one line. The illustrator
     estimates +2.5 for these together.
   - **The floor figures use different proportions.** Their trunk is ~40% too long (100 vs ~71) and their arms are
     25% too short, so lying drills look long-bodied with stubby arms (biomechanist).
   - A 3-segment spine with a visible neutral curve.
4. **Make holds and reps feel alive** (animator).
   - Per-phase ease shapes with a sticking point.
   - Anticipation and a damped settle. Never an overshoot on bridge, thrust, kneel, 90/90, swing or march, where it
     would depict lumbar extension or a provocative range.
   - Breathing on holds. Holds currently freeze after 0.9 s.
   - Head and hands lag the trunk.
   - A real inverted-pendulum handstand sway.
   - A phase offset so a screen of figures doesn't pulse in sync.
5. **Encode physics as tests.**
   - The centre of mass stays over the base on the squat, deadlift, RDL and nordic.
   - Planted hands and feet never slide.

   These are the safety net that keeps later edits honest (animator and biomechanist).

## Where they disagree
- **Muscle highlight.** The illustrator wants a "lens" over the working muscle (+1.2). The product lead says no
  anatomical muscle maps, and only a `muscles[]` chip next to the figure. A middle ground is a soft highlight on the
  working *segment* at tile and player size only, with no anatomy.
- **Front/side view toggle.** The biomechanist rates it 7 (valgus and elbow flare only show from the front). The
  product lead and illustrator rate it low per hour (L effort). Defer it.

## Proposed rounds (each one commit, coach + visual re-check, same tests)

| round | contents | effort | expected |
|---|---|---|---|
| **A: body v2** | <ul><li>one proportion table for every figure (fixes the floor figures)</li><li>tapered limb capsules</li><li>ribcage + pelvis torso</li><li>head facing cue and neck</li><li>ground contact shadow</li><li>level-of-detail tiers: silhouette at 56px, mid at 144px, full in the player</li></ul> | M–L | looks-professional 5.5 → ~8 |
| **B: motion life** | <ul><li>`prog` ease shapes, anticipation and settle</li><li>breathing and tremor on holds (15 fps, holds only)</li><li>head and hand lag</li><li>handstand pendulum sway</li><li>phase offset</li><li>tests: CoM over base, no slide</li></ul> | M | motion realism 5.5 → ~8 |
| **C: teaching** | <ul><li>a key-cue overlay per drill</li><li>scapulohumeral rhythm on pulls</li><li>variant-ladder ghosts</li></ul>Fix the "full depth" squat copy first | M | teaches-correctly +1–2; richness 7.7 → ~8.5 with the product items |
| **later** | <ul><li>real-clip slot in the player (`media/<exercise_id>.mp4` falls back to the figure), so filmed clips need no layout change</li><li>figures on session-done and the extra-session list</li><li>tap to scrub / 0.5x</li></ul>These touch the session screens another session owns | S–M each | the product lead says 9/10 richness needs real clips on the 10–15 most-used drills |

Still-shared figures that teach poorly:
- pirouettes (static handstand)
- six `hs_walk_*` variants on one figure
- wrist push-ups on wrist prep
- chest and belly wall hold on one pose
- 90/90, top-down and hard to read. Cut or redraw it.
