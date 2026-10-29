import type { Store } from "../schemas";

type Blocks = NonNullable<Store["scheduled_blocks"]>;

/**
 * Move and undo on `scheduled_blocks`, for the legacy-shaped actions (2026-10-29).
 *
 * `skipDay` was routed to block-object state in August; `moveSession` (Plan → Move…, the session's Move) and
 * `clearSkip` / `undoSkip` (Unskip, Undo move) were not. With `block_object` on — the default — Today and the
 * session page read only `scheduled_blocks`, so a move from Plan changed nothing a user could train from, and an
 * Unskip left the day skipped. These two pure functions are the block half those actions now also write.
 */

/**
 * Planned blocks on `fromDate` move to `toDate`. When `templateIds` names some of them (Plan passes the day's
 * template ids), only those move; ids that match nothing (legacy callers) fall back to the whole day.
 */
export function moveDayBlocks(
  blocks: Blocks,
  fromDate: string,
  toDate: string,
  templateIds: string[],
  reason: string,
  at: string,
): { blocks: Blocks; moved: number } {
  const onDay = Object.values(blocks).filter((b) => b.actual_date === fromDate && b.state === "planned");
  const named = onDay.filter((b) => templateIds.includes(b.block_template_id));
  const targets = named.length ? named : onDay;
  if (!targets.length) return { blocks, moved: 0 };
  const next = { ...blocks };
  for (const b of targets) {
    next[b.id] = {
      ...b,
      state: "moved",
      actual_date: toDate,
      move_history: [...(b.move_history ?? []), { from: fromDate, to: toDate, at, reason }],
    };
  }
  return { blocks: next, moved: targets.length };
}

/**
 * Undo for a day, from either end of a move: blocks skipped on `date` return to planned; a block whose latest move
 * left `date` (Unskip on the source row) or arrived on it (Plan's "Undo move" sits on the destination row) goes
 * back to where that move started. Done blocks are never touched — a session already trained stays put.
 */
export function restoreDayBlocks(blocks: Blocks, date: string): { blocks: Blocks; restored: number } {
  let restored = 0;
  const next = { ...blocks };
  for (const b of Object.values(blocks)) {
    const last = b.move_history?.[b.move_history.length - 1];
    if (b.state === "skipped" && b.actual_date === date) {
      next[b.id] = { ...b, state: "planned" };
      restored++;
    } else if (b.state === "moved" && last && b.actual_date === last.to && (last.from === date || last.to === date)) {
      const history = b.move_history?.slice(0, -1) ?? [];
      next[b.id] = {
        ...b,
        // Back to where the undone move started; "moved" again if that was itself a moved-in date.
        state: last.from === b.planned_date ? "planned" : "moved",
        actual_date: last.from,
        move_history: history,
      };
      restored++;
    }
  }
  return { blocks: restored ? next : blocks, restored };
}
