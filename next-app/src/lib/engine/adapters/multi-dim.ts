import type { AdaptAdapter } from "./types";
import type { Phase, Program, Store } from "../../schemas";

/**
 * multi_dimensional adapter (Phase B stub, Phase C fills the body).
 *
 * Design: skill programs don't run 5/3/1 cycles. What they run is:
 *   1. Retest metric hits → capability_level bumps in capability_profile.
 *   2. Prerequisite gates that unlock harder drills as levels increase.
 *   3. External-focus cue feedback per session (Wulf 2013).
 *
 * Phase B ships this as a no-op (returns null for both evaluate + suggest).
 * That's honest: Handstand Walk currently doesn't have per-set weight
 * autoreg (bodyweight skill), and cycle-end evaluation for skill programs
 * is retest-triggered, which Phase B routes through retest_metrics on the
 * program JSON rather than in adapter code.
 *
 * Phase C: read `program.retest_metrics`, resolve `source_ref` against
 * physical_test results, aggregate over `window_days`, and emit
 * CycleEvaluation entries proposing capability_profile level bumps.
 */
export const multiDimAdapter: AdaptAdapter = {
  strategy: "multi_dimensional",

  shouldEvaluate(_program: Program, _phase: Phase | undefined, _todayISO: string): boolean {
    // Phase B stub — retest metric evaluation lands in Phase C.
    return false;
  },

  evaluate(_program, _store, _todayISO) {
    return null;
  },

  suggest(_exId, _blockId, _program, _store, _todayISO) {
    // Skill drills don't get weight autoreg. Duration + cue attachment
    // happen in the plan-generator pipeline, not through the adapter.
    return null;
  },
};
