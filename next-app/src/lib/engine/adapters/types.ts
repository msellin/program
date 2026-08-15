import type { CycleEvaluation } from "../adapt";
import type { Suggestion } from "../suggest";
import type { Phase, Program, Store } from "../../schemas";

/**
 * Phase B — the AdaptAdapter interface.
 *
 * Different generation strategies need different adaptive-engine behavior:
 *   - correlated_tier    → 5/3/1 cycle-end AMRAP evaluation, TM autoreg per set
 *   - multi_dimensional  → capability_level bumps from retest_metric hits
 *   - trend_based        → HR trend + sliding window (aerobic)
 *   - hybrid_concurrent  → composes strength + aerobic adapters
 *
 * Each adapter is a plug-in. Adding a new strategy = new adapter class, one
 * registry entry. No changes to consumers (Today, Progress, Report).
 */
export interface AdaptAdapter {
  strategy: NonNullable<Program["generation_strategy"]>;

  /**
   * Should the cycle-end evaluator run for this program right now?
   * (e.g. 5/3/1 fires in days 21-28 of a cycle; trend-based fires when the
   * window has enough data; skill fires on retest cadence.)
   */
  shouldEvaluate(program: Program, phase: Phase | undefined, todayISO: string): boolean;

  /**
   * Run the cycle-end evaluation. Returns null when nothing to propose.
   * The proposal is confirm-first — caller decides whether to Accept.
   */
  evaluate(program: Program, store: Store, todayISO: string): CycleEvaluation | null;

  /**
   * Compute a concrete weight/dose suggestion for an exercise on today's
   * session. Returns null when the exercise isn't eligible for autoreg
   * under this strategy (e.g. rehab drill under 5/3/1, or a body-weight
   * skill drill under multi-dim).
   */
  suggest(
    exId: string,
    blockId: string,
    program: Program,
    store: Store,
    todayISO: string,
  ): Suggestion | null;
}
