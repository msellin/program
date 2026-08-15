import type { CycleEvaluation } from "../adapt";
import type { Suggestion } from "../suggest";
import type { Phase, Program, Store } from "../../schemas";
import type { AdaptAdapter } from "./types";
import { correlatedTierAdapter } from "./correlated-tier";
import { multiDimAdapter } from "./multi-dim";

/**
 * Adapter registry. `strategy` field on program.generation_strategy selects
 * the adapter. Unknown / undeclared strategies fall back to correlated_tier
 * for backward compat.
 *
 * New strategy = new adapter class + one entry here. No conditional in any
 * caller. That's the Phase B scaling win.
 */
const ADAPTERS: Record<string, AdaptAdapter> = {
  correlated_tier: correlatedTierAdapter,
  multi_dimensional: multiDimAdapter,
  // Phase C:
  // trend_based: trendBasedAdapter,
  // hybrid_concurrent: hybridConcurrentAdapter,
};

export function adapterFor(program: Program): AdaptAdapter {
  const strategy = program.generation_strategy ?? "correlated_tier";
  return ADAPTERS[strategy] ?? correlatedTierAdapter;
}

/**
 * Convenience passthroughs so consumers can import from this module without
 * knowing about the adapter object.
 */
export function evaluateProgram(
  program: Program,
  store: Store,
  todayISO: string,
): CycleEvaluation | null {
  const adapter = adapterFor(program);
  return adapter.evaluate(program, store, todayISO);
}

export function suggestForProgram(
  exId: string,
  blockId: string,
  program: Program,
  store: Store,
  todayISO: string,
): Suggestion | null {
  const adapter = adapterFor(program);
  return adapter.suggest(exId, blockId, program, store, todayISO);
}

export function shouldEvaluateProgram(
  program: Program,
  phase: Phase | undefined,
  todayISO: string,
): boolean {
  const adapter = adapterFor(program);
  return adapter.shouldEvaluate(program, phase, todayISO);
}

export type { AdaptAdapter };
