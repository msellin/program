/**
 * Feature-flag reads for surfaces that ship dark (2026-08-24).
 *
 * `isBlockObjectOn` lives in `engine/block-selectors.ts` because it gates
 * a data-model read path. These gate product surfaces, so they live here.
 */

import type { Program, Store } from "./schemas";

/**
 * Distinct days of logged off-plan drill work an account needs before it
 * is grandfathered onto the flag. Three rather than one so a beta user
 * who tapped into `/off-plan` once out of curiosity doesn't get handed a
 * surface the catalog no longer offers.
 */
export const OFF_PLAN_GRANDFATHER_MIN_DAYS = 3;

/** Marker written to `migrations_applied` once the check has run. */
export const OFF_PLAN_GRANDFATHER_MARKER = "off_plan_grandfather_v1";

/** Is the off-plan drill surface enabled for this account? */
export function isOffPlanOn(store: Store): boolean {
  return store.feature_flags?.off_plan === true;
}

/**
 * Has this account ever had off-plan? Drives whether the Settings toggle
 * renders at all — an account that has never qualified never sees the
 * row, and one that has can always turn it back on.
 */
export function hasOffPlanSetting(store: Store): boolean {
  return store.feature_flags?.off_plan !== undefined;
}

/**
 * Count distinct days carrying logged work against an off-plan block.
 *
 * Exercise logs are keyed `${blockId}:${exerciseId}`, so identifying
 * off-plan work means knowing which block ids are `accessory` / `run` —
 * hence the program argument. Only the account's own active programs are
 * considered; a block id from a program they never ran can't be theirs.
 */
export function offPlanUsageDays(
  store: Store,
  programs: Program[],
): number {
  const offPlanBlockIds = new Set<string>();
  for (const p of programs) {
    for (const b of p.blocks ?? []) {
      if (b.category === "accessory" || b.category === "run") offPlanBlockIds.add(b.id);
    }
  }
  if (!offPlanBlockIds.size) return 0;

  let days = 0;
  for (const dayLog of Object.values(store.logs ?? {})) {
    const used = Object.entries(dayLog.exercises ?? {}).some(([key, entry]) => {
      const blockId = key.slice(0, key.lastIndexOf(":"));
      if (!offPlanBlockIds.has(blockId)) return false;
      if (entry.done) return true;
      return (entry.sets ?? []).some((s) => s.reps != null || s.weight_kg != null);
    });
    if (used) days++;
  }
  return days;
}

/**
 * Should this account be grandfathered onto the off-plan flag? Only ever
 * turns the flag ON — it never takes the surface away from someone who
 * has it, and it never overrides a deliberate choice in Settings.
 */
export function shouldGrandfatherOffPlan(store: Store, programs: Program[]): boolean {
  if (hasOffPlanSetting(store)) return false;
  return offPlanUsageDays(store, programs) >= OFF_PLAN_GRANDFATHER_MIN_DAYS;
}
