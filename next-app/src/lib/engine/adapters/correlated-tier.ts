import { evaluateCycleEnd } from "../adapt";
import { suggestForExercise } from "../suggest";
import type { AdaptAdapter } from "./types";
import type { Phase, Program, Store } from "../../schemas";

/**
 * correlated_tier adapter — thin wrapper over the existing 5/3/1 evaluator
 * and per-exercise autoreg. This is Phase B's non-breaking extraction:
 * behavior identical to the legacy code path, callers can now go through
 * the registry.
 *
 * The 5/3/1-specific hardcodes (MAIN_PHASE_IDS, PEAK_PHASE_ID, CYCLE_PERCENTS)
 * remain inside suggest.ts + adapt.ts. Phase C moves them behind this
 * adapter's private surface so multiDim / trendBased can't accidentally
 * see them.
 */
export const correlatedTierAdapter: AdaptAdapter = {
  strategy: "correlated_tier",

  shouldEvaluate(program: Program, phase: Phase | undefined, _todayISO: string): boolean {
    // adapt.ts internally checks phase.runs_cycle_end_eval / legacy whitelist.
    // The registry-level should is a wrapper: any program with the strategy
    // is eligible, adapt.ts owns the phase-level gate.
    return phase !== undefined || program.phases.length > 0;
  },

  evaluate(program, store, todayISO) {
    return evaluateCycleEnd(program, store, todayISO);
  },

  suggest(exId, blockId, program, store, todayISO) {
    return suggestForExercise(exId, blockId, program, store, todayISO);
  },
};
