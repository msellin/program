/**
 * Block-object rebuild · Phase B — selectors.
 * See dev/active/block-object-rebuild-2026-08-18.md §3.
 *
 * Read-side helpers for the new `store.scheduled_blocks` map. Views
 * (Today, Week, History, Progress, Heatmap) use these instead of
 * indexing the map directly — encapsulates the "moved block appears at
 * actual_date, not planned_date" invariant that fixes the Today-view
 * duplication bug.
 */

import type { ScheduledBlock, Store } from "../schemas";

export type GetBlocksOptions = {
  /** Filter to a specific program slug. */
  slug?: string;
  /**
   * Include blocks in these states. Defaults to every state (all show
   * up in every view). Today usually wants ["planned", "amber_downshifted"];
   * History usually wants ["done", "skipped", "moved"].
   */
  states?: ScheduledBlock["state"][];
};

/**
 * Return every block whose `actual_date` matches `dateISO`.
 *
 * The Today-view duplication bug (2026-08-18): pre-block-object, moving
 * Friday → Saturday made the plan appear on BOTH days because Today
 * derived blocks from phase math without consulting the move state.
 * This selector keys on `actual_date`, so a moved block appears only on
 * its destination date. Planned blocks that haven't been moved have
 * `actual_date === planned_date`; moved blocks have
 * `actual_date === (last move target)`.
 */
export function getBlocksForDate(
  store: Store,
  dateISO: string,
  opts?: GetBlocksOptions,
): ScheduledBlock[] {
  const map = store.scheduled_blocks;
  if (!map) return [];
  const out: ScheduledBlock[] = [];
  const states = opts?.states;
  for (const key in map) {
    const b = map[key];
    if (b.actual_date !== dateISO) continue;
    if (opts?.slug && b.program_slug !== opts.slug) continue;
    if (states && !states.includes(b.state)) continue;
    out.push(b);
  }
  // Stable order — planned date then template id — so views render
  // deterministically across renders.
  out.sort(
    (a, b) =>
      a.planned_date.localeCompare(b.planned_date) ||
      a.block_template_id.localeCompare(b.block_template_id),
  );
  return out;
}

/**
 * All blocks for a given program in a date range (inclusive), keyed by
 * `actual_date`. Used by Progress / History.
 */
export function getBlocksForProgram(
  store: Store,
  slug: string,
  startISO: string,
  endISO: string,
  opts?: { states?: ScheduledBlock["state"][] },
): ScheduledBlock[] {
  const map = store.scheduled_blocks;
  if (!map) return [];
  const states = opts?.states;
  const out: ScheduledBlock[] = [];
  for (const key in map) {
    const b = map[key];
    if (b.program_slug !== slug) continue;
    if (b.actual_date < startISO || b.actual_date > endISO) continue;
    if (states && !states.includes(b.state)) continue;
    out.push(b);
  }
  out.sort((a, b) => a.actual_date.localeCompare(b.actual_date));
  return out;
}

/**
 * Fast lookup — returns the block with the given id or undefined.
 */
export function getBlockById(store: Store, id: string): ScheduledBlock | undefined {
  return store.scheduled_blocks?.[id];
}

/**
 * Count blocks by program on a specific date. Used by Week view to
 * render "N blocks today" summaries without materializing full arrays.
 */
export function countBlocksByProgramForDate(
  store: Store,
  dateISO: string,
  opts?: { states?: ScheduledBlock["state"][] },
): Record<string, number> {
  const counts: Record<string, number> = {};
  const map = store.scheduled_blocks;
  if (!map) return counts;
  const states = opts?.states;
  for (const key in map) {
    const b = map[key];
    if (b.actual_date !== dateISO) continue;
    if (states && !states.includes(b.state)) continue;
    counts[b.program_slug] = (counts[b.program_slug] ?? 0) + 1;
  }
  return counts;
}

/**
 * True if the block-object feature flag is on for the current user's
 * store. Callers gate reads on this so partial rollout is safe.
 */
export function isBlockObjectOn(store: Store): boolean {
  return store.feature_flags?.block_object === true;
}
