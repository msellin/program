"use client";

/**
 * Block-object rebuild · Phase E — per-track recent block history.
 * See dev/active/block-object-rebuild-2026-08-18.md §5.
 *
 * Compact "last 14 days" view of block state changes per active track.
 * Only renders when `block_object` is on and there are actually blocks
 * to show. Additive to legacy History — doesn't remove anything.
 */

import { useEffect, useMemo, useState } from "react";
import { useStore } from "@/lib/useStore";
import { getBlocksForProgram, isBlockObjectOn } from "@/lib/engine/block-selectors";
import { loadProgram } from "@/lib/data-loader";
import type { Program, ScheduledBlock, Store } from "@/lib/schemas";

const WINDOW_DAYS = 14;

/**
 * User-facing chip labels + color mapping.
 * Audit 2026-08-18 (copy) — "downshifted" was engineer-speak in a chip.
 * Rewrote to "eased." Color mapping stays canonical per tokens.md.
 */
// P0-8 palette-collision fix 2026-08-19: semantic tone lives on a 6px
// dot; chip body is neutral-outlined. Category / status axes no longer
// compete for the same amber/green/slate token weight.
function stateChip(state: ScheduledBlock["state"]): { label: string; dotClass: string | null } {
  switch (state) {
    case "done":
      return { label: "done", dotClass: "bg-green" };
    case "skipped":
      return { label: "skipped", dotClass: "bg-amber" };
    case "moved":
      return { label: "moved", dotClass: "bg-slate" };
    case "amber_downshifted":
      return { label: "eased", dotClass: "bg-amber" };
    default:
      return { label: state, dotClass: null };
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

  // Load the active programs so we can resolve block template ids to
  // authored block names. Audit 2026-08-18 — Phase E shipped this section
  // rendering raw ids ("block_z2_row") because it never loaded the program
  // JSON. Programs cache is process-shared so re-loads are cheap.
  const [programsBySlug, setProgramsBySlug] = useState<Record<string, Program>>({});
  const slugsKey = slugs.join("|");
  useEffect(() => {
    if (slugs.length === 0) {
      setProgramsBySlug({});
      return;
    }
    let cancelled = false;
    void Promise.all(slugs.map((s) => loadProgram(s).catch(() => null)))
      .then((ps) => {
        if (cancelled) return;
        const map: Record<string, Program> = {};
        for (let i = 0; i < slugs.length; i++) {
          const p = ps[i];
          if (p) map[slugs[i]] = p;
        }
        setProgramsBySlug(map);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slugsKey]);

  if (!isBlockObjectOn(store) || slugs.length === 0) return null;

  const today = new Date();
  const start = new Date(today.getTime() - WINDOW_DAYS * 864e5)
    .toISOString()
    .slice(0, 10);
  const end = today.toISOString().slice(0, 10);

  const perProgram = slugs
    .map((slug) => ({
      slug,
      program: programsBySlug[slug],
      blocks: getBlocksForProgram(store as Store, slug, start, end).filter(
        (b) => b.state !== "planned",
      ),
    }))
    .filter((g) => g.blocks.length > 0);

  if (perProgram.length === 0) return null;

  return (
    <section className="space-y-3">
      <h2 className="font-mono text-[14px] uppercase tracking-widest">
        Recent sessions · last {WINDOW_DAYS} days
      </h2>
      <div className="rounded border border-line bg-surface divide-y divide-line-soft">
        {perProgram.map((g) => (
          <div key={g.slug} className="p-3 space-y-2">
            <p className="text-[14px] font-semibold text-strong">
              {/* Slug title-case matches manifest names for every current
                  program; `program_goal.display_name` is often the target
                  metric (e.g. "Loaded overhead shoulder flexion") and reads
                  as a bug. Same anti-pattern the reveal-copy fix addressed
                  at only its own call site. Delta audit 2026-08-19. */}
              {g.slug
                .split("-")
                .map((w) => (w.length ? w[0].toUpperCase() + w.slice(1) : w))
                .join(" ")}
            </p>
            <ul className="space-y-1.5">
              {g.blocks
                .slice()
                .reverse()
                .map((b) => {
                  const chip = stateChip(b.state);
                  // Resolve template id → authored block name via the
                  // loaded program. Falls back to the id if the program
                  // JSON hasn't loaded yet or the id doesn't match.
                  const blockName =
                    g.program?.blocks.find((tb) => tb.id === b.block_template_id)?.name ??
                    b.block_template_id;
                  return (
                    <li key={b.id} className="flex items-baseline gap-2 text-[12px]">
                      <span className="font-mono text-muted min-w-[80px]">
                        {b.actual_date}
                      </span>
                      <span className="flex-1 text-strong">{blockName}</span>
                      <span className="font-mono text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full border border-line-soft text-muted inline-flex items-center gap-1.5">
                        {chip.dotClass ? (
                          <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${chip.dotClass}`} />
                        ) : null}
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
