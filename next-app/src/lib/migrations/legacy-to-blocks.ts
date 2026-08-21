/**
 * Block-object rebuild · Phase B — legacy → block-object migration.
 * See dev/active/block-object-rebuild-2026-08-18.md §7.
 *
 * Written in Phase B, NOT invoked yet. Phase E flips the feature flag
 * for beta users; on their next hydrate the block-object reader path
 * calls this migrator before touching `store.scheduled_blocks`.
 *
 * Idempotent — `migrations_applied.includes("blocks_v1")` short-circuits.
 * Safe to call on every hydrate.
 *
 * What it does:
 *   1. Materializes 8 weeks of blocks for every active program (past 4
 *      weeks + next 4 weeks so history and lookahead both exist).
 *   2. Replays `store.scheduled_overrides` — for each override, marks the
 *      matching materialized block as `moved` with the new actual_date.
 *   3. Replays `store.skipped` — for each entry:
 *        - `moved_to` present → the corresponding block was handled by
 *          step 2, but we still validate.
 *        - Bare `reason` → mark the matching block on that date as
 *          `skipped`.
 *   4. Links every existing log entry to its block via `log_entry_id`
 *      when a same-day + program match exists. Log stays where it is
 *      (in `store.logs`); the block just gets a pointer.
 *   5. Writes `migrations_applied: ["blocks_v1"]` so this whole function
 *      short-circuits on the next mount.
 *
 * The legacy fields (`store.skipped`, `store.scheduled_overrides`) are
 * NOT removed here — Phase F does the cleanup. Kept alongside the new
 * block map during transition so a bug in migration doesn't lose data.
 */

import type { Program, Store, ScheduledBlock } from "../schemas";
import { materializeBlocks, blockInstanceId, mergeMaterialization } from "../engine/materialize-blocks";

// Batch 38 (2026-08-21) — bumped v1 → v2 so users whose data was migrated
// under v1 (before BUG-8's shouldFlipDone logic landed) get their stuck
// state=planned blocks re-evaluated. Without the bump, `needsBlockMigration`
// returns false on repeat hydrations and the fix never applies to already-
// migrated stores. The v2 run is idempotent — it only flips planned→done
// where log evidence exists; done/skipped/moved blocks are untouched.
const MIGRATION_ID = "blocks_v2";

export function needsBlockMigration(store: Store): boolean {
  const applied = store.migrations_applied ?? [];
  // Any prior migration counts as "applied" for the base materialization
  // step (steps 1-3). Only the log-link + state-flip step needs to re-run
  // if the store was last migrated under blocks_v1.
  return !applied.includes(MIGRATION_ID);
}

/**
 * Programs must be resolved by the caller (async fetch of program
 * JSONs). We take a map keyed by slug so the migrator itself stays
 * pure and testable.
 */
export function migrateLegacyToBlocks(
  store: Store,
  programsBySlug: Record<string, Program>,
  todayISO: string = new Date().toISOString().slice(0, 10),
): Store {
  if (!needsBlockMigration(store)) return store;

  const next: Store = { ...store };
  const profile = next.user_profile;

  // Enumerate active programs (union of active_program_id + active_program_ids).
  const activeSlugs = new Set<string>();
  if (profile?.active_program_id) activeSlugs.add(profile.active_program_id);
  for (const s of profile?.active_program_ids ?? []) activeSlugs.add(s);

  // Anchor: 4 weeks back so a prior `moved` or `skipped` on a recent
  // date has a target block to attach to. 4 weeks forward gives the
  // materializer's rollover a lead.
  const start = new Date(new Date(todayISO + "T00:00:00").getTime() - 28 * 864e5)
    .toISOString()
    .slice(0, 10);
  const end = new Date(new Date(todayISO + "T00:00:00").getTime() + 28 * 864e5)
    .toISOString()
    .slice(0, 10);

  // 1 — materialize
  let blocks: Record<string, ScheduledBlock> = { ...(next.scheduled_blocks ?? {}) };
  const materialization = { ...(next.program_materialization ?? {}) };
  for (const slug of activeSlugs) {
    const program = programsBySlug[slug];
    if (!program) continue;
    const fresh = materializeBlocks(program, start, end, profile);
    blocks = mergeMaterialization(blocks, fresh);
    const seed = profile?.program_states?.[slug]?.generation_trace?.seed ?? "";
    materialization[slug] = {
      materialized_through: end,
      materialized_at: new Date().toISOString(),
      materialization_seed: seed,
    };
  }

  // 2 — replay scheduled_overrides (moves)
  //    For each override at `toDate` with `reason` "moved from <fromDate>",
  //    find the block whose planned_date === fromDate and template id
  //    matches one of `blocks[toDate].blocks`. Flip its state to "moved".
  const overrides = next.scheduled_overrides;
  if (overrides) {
    for (const [toDate, ov] of Object.entries(overrides)) {
      const fromMatch = ov.reason?.match(/moved from (\d{4}-\d{2}-\d{2})/);
      if (!fromMatch) continue;
      const fromDate = fromMatch[1];
      for (const templateId of ov.blocks) {
        for (const slug of activeSlugs) {
          const id = blockInstanceId(slug, fromDate, templateId);
          const target = blocks[id];
          if (!target) continue;
          blocks[id] = {
            ...target,
            state: "moved",
            actual_date: toDate,
            move_history: [
              ...(target.move_history ?? []),
              { from: fromDate, to: toDate, at: new Date().toISOString(), reason: ov.reason },
            ],
          };
        }
      }
    }
  }

  // 3 — replay skipped
  const skipped = next.skipped;
  if (skipped) {
    for (const [date, entry] of Object.entries(skipped)) {
      // moved_to entries are already handled above via scheduled_overrides.
      if (entry.moved_to) continue;
      // Bare skip — mark every block whose actual_date === date as skipped.
      for (const id in blocks) {
        const b = blocks[id];
        if (b.actual_date === date && b.state === "planned") {
          blocks[id] = { ...b, state: "skipped", notes: entry.reason };
        }
      }
    }
  }

  // 4 — link log entries to blocks (log entry ids: `<date>` — legacy
  // logs are day-keyed, not block-keyed. We store the date as the link.)
  // Also flip state to "done" when the log has evidence attributable to
  // this block: (a) an exercise key prefixed with the block's instance
  // id where done=true, OR (b) at least one run entry when the block's
  // template id names a run-modality block. BUG-8 fix 2026-08-19 —
  // PerProgramAdherenceCard was reporting 0/25 despite 23 logged sessions
  // because blocks never flipped from "planned" to "done" without an
  // explicit "Mark done" tap.
  //
  // Batch 38 (2026-08-21) — dropped the `if (b.log_entry_id) continue;`
  // short-circuit. It prevented the shouldFlipDone check from firing on
  // blocks that were already log-linked under blocks_v1 (before BUG-8
  // shipped). With the migration ID bump above (v1 → v2), every stuck
  // planned block now gets re-evaluated exactly once. Idempotent: the
  // `b.state === "planned"` guard still prevents flipping done→done or
  // touching skipped/moved.
  const logs = next.logs;
  if (logs) {
    for (const [date, dayLog] of Object.entries(logs)) {
      if (!dayLog) continue;
      for (const id in blocks) {
        const b = blocks[id];
        if (b.actual_date !== date) continue;
        // Exercise-key prefix match: `${blockId}:${exId}` in day.exercises.
        const hasMatchingExercise = Object.entries(dayLog.exercises ?? {}).some(
          ([k, v]) => k.startsWith(`${b.id}:`) && v.done,
        );
        // Run-modality fallback: if this block template is a run/row block
        // and the day has runs, count it done. Modality inferred from the
        // block_template_id since we don't have program access here.
        const isRunModalityBlock =
          /(?:_row|_run|z2|threshold|race_pace|easy_recovery|engine|aerobic)/i.test(
            b.block_template_id,
          );
        const hasRun = (dayLog.runs ?? []).length > 0;
        const shouldFlipDone =
          b.state === "planned" &&
          (hasMatchingExercise || (isRunModalityBlock && hasRun));
        blocks[id] = {
          ...b,
          log_entry_id: date,
          state: shouldFlipDone ? "done" : b.state,
        };
      }
    }
  }

  next.scheduled_blocks = blocks;
  next.program_materialization = materialization;
  next.migrations_applied = [...(next.migrations_applied ?? []), MIGRATION_ID];
  return next;
}
