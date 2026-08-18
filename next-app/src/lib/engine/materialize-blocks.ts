/**
 * Block-object rebuild · Phase B — materializer.
 * See dev/active/block-object-rebuild-2026-08-18.md §2.
 *
 * Given a program + a date window + a user profile, walk each date and
 * write ScheduledBlock records for every block the schedule engine says
 * is scheduled that day.
 *
 * Determinism: same (program, profile-with-same-phase_shift_days, date
 * range) → same set of block ids. That's what makes materialization safe
 * to re-run — repeated calls with the same window are idempotent because
 * every id is a pure function of (slug, planned_date, block_template_id).
 *
 * Does NOT touch drill-selection logic. The block level ("Norwegian 4×4
 * on Tuesday") is what gets materialized. Drill selection inside a block
 * still happens on read via the existing plan-generator, feeding off
 * `capability_profile` and `intake_answers` — that layer is untouched.
 */

import type {
  Program,
  ScheduledBlock,
  Store,
} from "../schemas";
import { activePhaseFor } from "./schedule";
import { blocksForDate } from "./plan-generator";

/**
 * Stable id for a scheduled block instance. Uses the ORIGINAL
 * planned_date so a moved block keeps its id (and links to logs stay
 * intact). Human-readable for dev tools.
 */
export function blockInstanceId(
  slug: string,
  plannedDate: string,
  blockTemplateId: string,
): string {
  return `${slug}:${plannedDate}:${blockTemplateId}`;
}

/**
 * Enumerate ISO dates in [start, end], inclusive.
 */
function datesInRange(startISO: string, endISO: string): string[] {
  const out: string[] = [];
  const start = new Date(startISO + "T00:00:00").getTime();
  const end = new Date(endISO + "T00:00:00").getTime();
  if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) return out;
  const DAY_MS = 864e5;
  for (let t = start; t <= end; t += DAY_MS) {
    out.push(new Date(t).toISOString().slice(0, 10));
  }
  return out;
}

/**
 * Core materializer. Returns a plain array of ScheduledBlock records
 * for every scheduled block in the window. Rest days emit nothing.
 * Callers merge the result into `store.scheduled_blocks` — duplicates
 * (same id) get overwritten with the fresh planned entry, which is
 * exactly what we want when a phase gets regenerated after a tier
 * promotion.
 *
 * IMPORTANT: This ONLY emits blocks in `state: "planned"`. Existing
 * done / skipped / moved records must be preserved by the caller. See
 * `mergeMaterialization()` below for the safe-merge helper.
 */
export function materializeBlocks(
  program: Program,
  startDateISO: string,
  endDateISO: string,
  profile?: Store["user_profile"],
): ScheduledBlock[] {
  const slug = program.slug;
  if (!slug) return [];
  const out: ScheduledBlock[] = [];
  for (const date of datesInRange(startDateISO, endDateISO)) {
    const phase = activePhaseFor(program, date, profile);
    // `blocksForDate` handles both correlated_tier and multi_dimensional
    // strategies. It returns Block objects; we only need the ids.
    const blocks = blocksForDate(program, profile, phase, date);
    for (const b of blocks) {
      const templateId = b.id;
      if (!templateId) continue;
      out.push({
        id: blockInstanceId(slug, date, templateId),
        program_slug: slug,
        block_template_id: templateId,
        planned_date: date,
        actual_date: date,
        state: "planned",
      });
    }
  }
  return out;
}

/**
 * Merge newly-materialized blocks into an existing scheduled_blocks map
 * without clobbering user state.
 *
 * Rule: if a fresh materialization emits an id that already exists AND
 * the existing block's state is anything other than "planned" (i.e.
 * done / skipped / moved / adjusted), the existing record wins. Only
 * pristine "planned" blocks may be overwritten — allowing phase
 * regeneration to freely rewrite untouched future work without
 * destroying history.
 */
export function mergeMaterialization(
  existing: Record<string, ScheduledBlock> | undefined,
  fresh: ScheduledBlock[],
): Record<string, ScheduledBlock> {
  const next: Record<string, ScheduledBlock> = { ...(existing ?? {}) };
  for (const b of fresh) {
    const prior = next[b.id];
    if (!prior || prior.state === "planned") {
      next[b.id] = b;
    }
    // Else preserve user state (done / skipped / moved / amber_downshifted).
  }
  return next;
}

/**
 * Convenience helper — given a program and a target lookahead in days,
 * materialize the window [today, today + lookaheadDays] and merge into
 * the existing map. Returns the new map plus the ISO date it extended to.
 */
export function materializeLookahead(
  program: Program,
  todayISO: string,
  lookaheadDays: number,
  existing: Record<string, ScheduledBlock> | undefined,
  profile?: Store["user_profile"],
): { blocks: Record<string, ScheduledBlock>; materializedThrough: string } {
  const end = new Date(new Date(todayISO + "T00:00:00").getTime() + lookaheadDays * 864e5)
    .toISOString()
    .slice(0, 10);
  const fresh = materializeBlocks(program, todayISO, end, profile);
  const blocks = mergeMaterialization(existing, fresh);
  return { blocks, materializedThrough: end };
}
