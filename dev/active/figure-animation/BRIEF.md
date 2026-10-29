# Figure animation round (owner request, 2026-10-29)

The owner wants the exercise figures to move more like a human, step by step, with excellent form, and asked
whether open-source motion (e.g. Google MediaPipe pose landmarks, mocap-driven rigs, CMU / AMASS-style mocap
retargeted to a 2D rig) would do better than the current rig. **The owner likes the current figures: "really
precise and nice".** Experts decide what to do, and whether to do anything; the owner approves one
recommendation before any build.

## Read first
- `next-app/src/lib/figures/rig.ts` (header comment = constraints set by earlier panels; they are not cosmetic:
  fixed segment lengths, side conventions, provocative ranges never depicted, contrast, timing keys),
  `rig.test.ts`, `lib/figures/exercise-figures.ts`, `components/follow-along/ExerciseFigure.tsx`.
- Prior rounds: `dev/active/figure-review/00-summary.md`, `ideas-00-synthesis.md` (four experts on 2026-10-28:
  keep the procedural SVG rig, no Lottie/Rive/3D/AI video — L/R mirroring is a safety issue in rehab) and the
  latest sheets in `dev/active/figure-review/after-round-c/` (PNG contact sheets of every figure).
- `CLAUDE.md` at the repo root (hip-rehab provocative positions, de-identified shared library).

## Your question (your lens only)
1. What, concretely, makes the current motion read as less than human or less than step-by-step? Name figures.
2. Would an open-source source of motion (MediaPipe / BlazePose landmarks extracted from video, public mocap
   sets, IK solvers, Spine/Rive-style skeletal tools) improve that — weigh licence, data availability per
   exercise (~100+ drills incl. rehab-specific ones), retargeting to a 2D side-view rig with fixed segment
   lengths, L/R safety, bundle size, reduced motion, and the risk of losing the precision the owner likes.
3. Your recommendation: one of KEEP AS IS / IMPROVE THE RIG (what, ranked, effort S/M/L) / ADOPT <option>
   (how), with a 1–10 estimate of "human-like, step-by-step, excellent form" now and after.

Write `dev/active/figure-animation/<NN>-<lens>.md` (≤ 35 lines). Don't edit code. Reply with your recommendation
and the two scores only (≤ 8 lines).
