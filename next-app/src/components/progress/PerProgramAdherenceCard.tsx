"use client";

/**
 * Block-object rebuild · Phase E — per-program adherence card.
 * See dev/active/block-object-rebuild-2026-08-18.md §5.
 *
 * Read-only Progress-page surface that becomes meaningful only when
 * `block_object` is on. Iterates active programs, queries the last N
 * weeks of blocks per program via `getBlocksForProgram`, and renders a
 * compact done / planned / skipped / moved breakdown per program.
 *
 * When the flag is off, renders nothing — the legacy Progress page
 * doesn't lose anything; this is purely additive.
 */

import { useMemo } from "react";
import { useStore } from "@/lib/useStore";
import {
  getBlocksForProgram,
  isBlockObjectOn,
} from "@/lib/engine/block-selectors";
import type { Store } from "@/lib/schemas";

const WINDOW_DAYS = 28;

type ProgramRow = {
  slug: string;
  done: number;
  planned: number;
  skipped: number;
  moved: number;
  total: number;
  adherencePct: number; // done / (total - moved) — moved isn't a miss, just a shift
};

function computeRows(store: Store, slugs: string[]): ProgramRow[] {
  const today = new Date();
  const startISO = new Date(today.getTime() - WINDOW_DAYS * 864e5)
    .toISOString()
    .slice(0, 10);
  const endISO = today.toISOString().slice(0, 10);
  const rows: ProgramRow[] = [];
  for (const slug of slugs) {
    const blocks = getBlocksForProgram(store, slug, startISO, endISO);
    let done = 0;
    let planned = 0;
    let skipped = 0;
    let moved = 0;
    for (const b of blocks) {
      if (b.state === "done") done++;
      else if (b.state === "skipped") skipped++;
      else if (b.state === "moved") moved++;
      else planned++;
    }

    // Log-augment: if scheduled_blocks are materialized but nothing is
    // marked done yet (e.g. legacy-to-blocks materializer materialized
    // the calendar but the sim / real user has been logging exercises +
    // runs directly), count log-based done days. Engine delta-2 caught
    // this: adherence showed "0/15 done · 0%" despite 22 runs because
    // the fallback trigger was "blocks.length === 0" instead of "no
    // block state === done".
    if (done === 0) {
      let logDone = 0;
      for (const [dateISO, day] of Object.entries(store.logs ?? {})) {
        if (dateISO < startISO || dateISO > endISO) continue;
        const anyExerciseDone = Object.values(day.exercises ?? {}).some((e) => e.done);
        const anyRun = (day.runs ?? []).length > 0;
        if (anyExerciseDone || anyRun) logDone++;
      }
      done = logDone;
      // Consume log-done days from `planned`. If sim log-days > planned
      // blocks (legacy-materializer only wrote N weeks), let the total
      // grow so the ratio stays honest.
      if (planned > 0) {
        planned = Math.max(0, planned - done);
      }
    }

    if (blocks.length === 0 && done === 0) continue;

    // Total = the four counts summed. Was `Math.max(blocks.length, sum)`
    // which let the "total" go out of sync with the segment breakdown
    // when the log-augment pushed `done` above the materialized-blocks
    // count. Delta-2 caught: "0/51 done" + "39 upcoming" + "12 skipped"
    // = 51 counted as total-moved but breakdown summed to 51 too — the
    // two nominal totals just weren't the same 51. Recomputing here
    // makes the label + bar + aria all agree.
    const total = done + planned + skipped + moved;
    const denom = total - moved;
    rows.push({
      slug,
      done,
      planned,
      skipped,
      moved,
      total,
      adherencePct: denom > 0 ? Math.round((done / denom) * 100) : 0,
    });
  }
  return rows;
}

export function PerProgramAdherenceCard() {
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
  const rows = computeRows(store, slugs);
  if (rows.length === 0) return null;

  return (
    <section className="rounded border border-line bg-surface p-4 space-y-3">
      <header className="flex items-baseline justify-between gap-2">
        <h2 className="text-[15px] font-semibold text-strong">Per-track adherence</h2>
        <span className="text-[10px] font-mono uppercase tracking-widest text-muted">
          last {WINDOW_DAYS} days
        </span>
      </header>
      <ul className="space-y-3">
        {rows.map((r) => (
          <li key={r.slug} className="space-y-1.5">
            <div className="flex items-baseline justify-between gap-2">
              <p className="text-[14px] text-strong font-medium">
                {r.slug.replace(/-/g, " ")}
              </p>
              <span className="font-mono text-[11px] text-muted">
                {r.done}/{r.total - r.moved} done · {r.adherencePct}%
              </span>
            </div>
            {/* Audit 2026-08-18 (visual-craft) — was 4 segments at h-1.5
                which muddied amber-next-to-slate. Moved isn't a miss (already
                excluded from adherencePct denominator); render only 3
                segments here and keep the moved count in the label row. */}
            <div
              className="flex h-2 rounded-full bg-line-soft overflow-hidden"
              role="img"
              aria-label={`${r.adherencePct}% adherence — ${r.done} done, ${r.planned} upcoming, ${r.skipped} skipped, ${r.moved} moved (moved shown in caption, not bar)`}
            >
              <span
                className="bg-green"
                style={{ width: r.total > 0 ? `${(r.done / r.total) * 100}%` : "0%" }}
                aria-hidden
              />
              <span
                className="bg-muted"
                style={{ width: r.total > 0 ? `${(r.planned / r.total) * 100}%` : "0%" }}
                aria-hidden
              />
              <span
                className="bg-amber"
                style={{ width: r.total > 0 ? `${(r.skipped / r.total) * 100}%` : "0%" }}
                aria-hidden
              />
            </div>
            <p className="text-[10px] font-mono text-muted uppercase tracking-widest">
              {r.done > 0 ? `${r.done} done` : ""}
              {r.planned > 0 ? ` · ${r.planned} upcoming` : ""}
              {r.skipped > 0 ? ` · ${r.skipped} skipped` : ""}
              {r.moved > 0 ? ` · ${r.moved} moved` : ""}
            </p>
          </li>
        ))}
      </ul>
      <p className="text-[11px] text-muted italic">
        Moved sessions don&apos;t count as misses — they&apos;re rescheduled work.
      </p>
    </section>
  );
}
