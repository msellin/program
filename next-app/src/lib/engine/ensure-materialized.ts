/**
 * Keeps `store.scheduled_blocks` current (2026-08-24).
 *
 * The bug this exists to fix: `scheduled_blocks` was written exactly
 * ONCE, by `migrateLegacyToBlocks`, covering `today ± 28 days` for
 * whatever programs happened to be active at that moment.
 * `needsBlockMigration` short-circuits forever afterwards, and
 * `materializeLookahead` — the rollover helper that was supposed to keep
 * the window moving — had no callers at all. Two consequences, both
 * observed:
 *
 *   1. A program added AFTER the migration ran never got blocks. Plan
 *      still listed it (Plan derives days from phase math), but Day reads
 *      `scheduled_blocks`, so the track was invisible there — the
 *      "week shows 2 tracks, day shows 1" report.
 *   2. Every track would silently empty out once the calendar passed the
 *      migration date + 28 days, with no error anywhere.
 *
 * This runs on every hydrate and whenever the active-program set changes.
 * It is idempotent: `mergeMaterialization` only overwrites blocks still
 * in `planned` state, so done / skipped / moved / amber_downshifted user
 * state is never clobbered.
 */

import { materializeLookahead } from "./materialize-blocks";
import type { Program, ScheduledBlock, Store } from "../schemas";

/** How far ahead we keep blocks materialized. */
export const LOOKAHEAD_DAYS = 56;

/**
 * Re-materialize once the remaining runway drops below this. Keeps the
 * work off the critical path on most loads while guaranteeing Plan's
 * 4-week horizon always has blocks behind it.
 */
export const REFRESH_WHEN_RUNWAY_UNDER_DAYS = 28;

function addDays(iso: string, days: number): string {
  return new Date(new Date(iso + "T00:00:00").getTime() + days * 864e5)
    .toISOString()
    .slice(0, 10);
}

export function activeSlugsOf(store: Store): string[] {
  const profile = store.user_profile;
  const slugs = new Set<string>();
  if (profile?.active_program_id) slugs.add(profile.active_program_id);
  for (const s of profile?.active_program_ids ?? []) slugs.add(s);
  return Array.from(slugs);
}

/**
 * Which active programs need materializing right now — never
 * materialized at all, or their runway has run down. Callers use this to
 * skip the program fetch entirely on the common no-op path.
 */
export function slugsNeedingMaterialization(store: Store, todayISO: string): string[] {
  const threshold = addDays(todayISO, REFRESH_WHEN_RUNWAY_UNDER_DAYS);
  return activeSlugsOf(store).filter((slug) => {
    const through = store.program_materialization?.[slug]?.materialized_through;
    return !through || through < threshold;
  });
}

/**
 * Extend materialization for every program that needs it. Returns a new
 * store, or `null` when there was nothing to do — so callers can avoid a
 * pointless `replaceStore` (and the KV write behind it) on every load.
 */
export function ensureMaterialized(
  store: Store,
  programsBySlug: Record<string, Program>,
  todayISO: string,
): Store | null {
  const slugs = slugsNeedingMaterialization(store, todayISO);
  if (!slugs.length) return null;

  let blocks: Record<string, ScheduledBlock> | undefined = store.scheduled_blocks;
  const materialization = { ...(store.program_materialization ?? {}) };
  let changed = false;

  for (const slug of slugs) {
    const program = programsBySlug[slug];
    // Program JSON not loaded (offline, or a slug that no longer ships).
    // Leave the bookkeeping untouched so the next load retries.
    if (!program) continue;
    const result = materializeLookahead(
      program,
      todayISO,
      LOOKAHEAD_DAYS,
      blocks,
      store.user_profile,
    );
    blocks = result.blocks;
    materialization[slug] = {
      materialized_through: result.materializedThrough,
      materialized_at: new Date().toISOString(),
      materialization_seed:
        store.user_profile?.program_states?.[slug]?.generation_trace?.seed ?? "",
    };
    changed = true;
  }

  if (!changed) return null;
  return { ...store, scheduled_blocks: blocks, program_materialization: materialization };
}
