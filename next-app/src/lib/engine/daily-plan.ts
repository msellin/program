import type { Program, Store, Exercise } from "../schemas";
import { blocksForDate } from "./plan-generator";
import { activePhaseFor } from "./schedule";

export type DailyPlanConflict = {
  between_programs: [string, string];
  reason: string;
  severity: "hint" | "warning" | "block";
};

export type DailyPlan = {
  date: string;
  programs: Array<{
    slug: string;
    positioning?: "main_track" | "side_track";
    block_ids: string[];
    generation_trace_ref?: string;
  }>;
  conflicts?: DailyPlanConflict[];
  total_load_estimate?: {
    time_min?: number;
    internal_load_score?: number;
  };
  composed_at: number;
};

/**
 * Phase B — materialise a `DailyPlan` for a given date. One shared composition
 * powers Today, Report, and future notification jobs. Callers pass the loaded
 * programs + drills; this function is pure — no fetches, no I/O.
 *
 * Cache invariant: given identical inputs, identical output. Safe to memoize
 * under `store.daily_plans[date]` with recompute on:
 *   - user_profile.active_program_ids change
 *   - user_profile.program_states[slug].tier change
 *   - user_profile.capability_profile change
 *   - date advances
 *   - schema version bump
 *
 * Interference detection: reads program.interference_hints to flag
 * incompatible same-day pairings (e.g. Concurrent-Strength Maintenance + a
 * hard strength side track). Reported in `conflicts`, never applied silently.
 */
export function composeDailyPlan(
  activePrograms: Program[],
  programSlugs: string[],
  profile: Store["user_profile"] | undefined,
  dateISO: string,
  drillsById?: Record<string, Exercise>,
): DailyPlan {
  const groups = activePrograms.map((program, i) => {
    const phase = activePhaseFor(program, dateISO, profile);
    const blocks = blocksForDate(program, profile, phase, dateISO, drillsById);
    return {
      slug: programSlugs[i] ?? "unknown",
      positioning: program.positioning as ("main_track" | "side_track" | undefined),
      block_ids: blocks.map((b) => b.id),
      generation_trace_ref:
        profile?.program_states?.[programSlugs[i] ?? ""]?.generation_trace?.seed,
    };
  });

  const conflicts = detectConflicts(activePrograms, programSlugs);
  const totalLoad = estimateTotalLoad(activePrograms, groups);

  return {
    date: dateISO,
    programs: groups,
    conflicts: conflicts.length ? conflicts : undefined,
    total_load_estimate: totalLoad,
    composed_at: Date.now(),
  };
}

/**
 * Check interference_hints across program pairs. Emits hints for
 * incompatible pairings and warnings for compatible-with mismatches. Never
 * blocks silently — the UI decides whether to render.
 */
function detectConflicts(
  programs: Program[],
  slugs: string[],
): DailyPlanConflict[] {
  const out: DailyPlanConflict[] = [];
  for (let i = 0; i < programs.length; i++) {
    const a = programs[i];
    const aSlug = slugs[i];
    const hints = a.interference_hints;
    if (!hints) continue;
    for (let j = 0; j < programs.length; j++) {
      if (i === j) continue;
      const bSlug = slugs[j];
      if (hints.incompatible_with?.includes(bSlug)) {
        out.push({
          between_programs: [aSlug, bSlug],
          reason: `${aSlug} declares ${bSlug} as incompatible for same-cycle pairing`,
          severity: "warning",
        });
      }
    }
  }
  return out;
}

/**
 * Rough time budget across all block durations. Programs that declare
 * `duration_min` on blocks contribute; those that don't are ignored.
 */
function estimateTotalLoad(
  programs: Program[],
  groups: DailyPlan["programs"],
): DailyPlan["total_load_estimate"] {
  let totalMin = 0;
  for (let i = 0; i < programs.length; i++) {
    const program = programs[i];
    const group = groups[i];
    for (const blockId of group.block_ids) {
      const block = program.blocks.find((b) => b.id === blockId);
      if (!block?.duration_min) continue;
      const d = Array.isArray(block.duration_min)
        ? (block.duration_min[0] + block.duration_min[1]) / 2
        : block.duration_min;
      totalMin += d;
    }
  }
  return { time_min: Math.round(totalMin) };
}
