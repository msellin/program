"use client";

/**
 * Block-object rebuild · Phase E — per-program recent block history.
 * See dev/active/block-object-rebuild-2026-08-18.md §5.
 *
 * Compact "last 14 days" view of block state changes per active program.
 * Only renders when `block_object` is on and there are actually blocks
 * to show. Additive to legacy History — doesn't remove anything.
 */

import { useMemo } from "react";
import { useStore } from "@/lib/useStore";
import { getBlocksForProgram, isBlockObjectOn } from "@/lib/engine/block-selectors";
import type { ScheduledBlock, Store } from "@/lib/schemas";

const WINDOW_DAYS = 14;

function stateChip(state: ScheduledBlock["state"]): { label: string; className: string } {
  switch (state) {
    case "done":
      return { label: "done", className: "bg-green/20 text-green" };
    case "skipped":
      return { label: "skipped", className: "bg-amber/20 text-amber" };
    case "moved":
      return { label: "moved", className: "bg-slate/20 text-slate" };
    case "amber_downshifted":
      return { label: "downshifted", className: "bg-amber/20 text-amber" };
    default:
      return { label: state, className: "bg-line-soft/60 text-muted" };
  }
}

export function BlockHistorySection() {
  const store = useStore((s) => s.store);
  const primary = store.user_profile?.active_program_id;
  const secondaries = store.user_profile?.active_program_ids ?? [];
  const slugs = useMemo(() => {
    const set = new Set<string>();
    if (primary) set.add(primary);
    for (const s of secondaries) set.add(s);
    return Array.from(set);
  }, [primary, secondaries]);

  if (!isBlockObjectOn(store) || slugs.length === 0) return null;

  const today = new Date();
  const start = new Date(today.getTime() - WINDOW_DAYS * 864e5)
    .toISOString()
    .slice(0, 10);
  const end = today.toISOString().slice(0, 10);

  const perProgram = slugs
    .map((slug) => ({
      slug,
      blocks: getBlocksForProgram(store as Store, slug, start, end).filter(
        (b) => b.state !== "planned",
      ),
    }))
    .filter((g) => g.blocks.length > 0);

  if (perProgram.length === 0) return null;

  return (
    <section className="space-y-3">
      <h2 className="font-mono text-[13px] uppercase tracking-widest">
        Recent blocks · last {WINDOW_DAYS} days
      </h2>
      <div className="rounded border border-line bg-surface divide-y divide-line-soft">
        {perProgram.map((g) => (
          <div key={g.slug} className="p-3 space-y-2">
            <p className="text-[13px] font-semibold text-strong">
              {g.slug.replace(/-/g, " ")}
            </p>
            <ul className="space-y-1.5">
              {g.blocks
                .slice()
                .reverse()
                .map((b) => {
                  const chip = stateChip(b.state);
                  return (
                    <li key={b.id} className="flex items-baseline gap-2 text-[12px]">
                      <span className="font-mono text-muted min-w-[80px]">
                        {b.actual_date}
                      </span>
                      <span className="flex-1 text-strong">{b.block_template_id}</span>
                      <span
                        className={`font-mono text-[10px] uppercase tracking-widest px-1.5 py-0.5 rounded ${chip.className}`}
                      >
                        {chip.label}
                      </span>
                    </li>
                  );
                })}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
