import type { Program } from "@/lib/schemas";
import { figureFor } from "@/lib/figures/exercise-figures";

type PlanTier = NonNullable<Program["plan_tiers"]>[number];

/** The first working (not warm-up / cool-down) exercise of a phase that has an authored figure. */
function leadFigureOfPhase(program: Program, phaseId: string): string | null {
  const phase = program.phases.find((p) => p.id === phaseId);
  if (!phase) return null;
  for (const bid of phase.blocks ?? []) {
    const block = program.blocks?.find((b) => b.id === bid);
    for (const it of block?.items ?? []) {
      if (!it.exercise_id || it.role === "warmup" || it.role === "cooldown") continue;
      const f = figureFor(it.exercise_id);
      if (f) return f;
    }
  }
  return null;
}

/**
 * Figure id for one level's representative exercise: the lead working exercise
 * of the phase that level starts in. A phase shared by several levels cannot
 * tell them apart, so only a phase owned by exactly this level (via
 * `for_tier_ids`, or a unique `starting_phase_id`) yields a figure; otherwise null.
 */
export function levelFigure(program: Program, tier: PlanTier): string | null {
  const tiers = program.plan_tiers ?? [];
  const own = program.phases.find((p) => p.for_tier_ids?.includes(tier.id));
  const phaseId =
    own?.id ??
    (tier.starting_phase_id && tiers.filter((t) => t.starting_phase_id === tier.starting_phase_id).length === 1
      ? tier.starting_phase_id
      : null);
  return phaseId ? leadFigureOfPhase(program, phaseId) : null;
}

/**
 * Figures for every level, or none at all. A figure is only worth showing when it
 * tells the levels apart, so a program where any level lacks a figure, or two
 * levels share one, gets no level figures.
 */
export function levelFigures(program: Program, tiers: PlanTier[]): Map<string, string> | null {
  const ids = tiers.map((t) => levelFigure(program, t));
  if (ids.some((f) => !f) || new Set(ids).size !== ids.length) return null;
  return new Map(tiers.map((t, i) => [t.id, ids[i] as string]));
}
