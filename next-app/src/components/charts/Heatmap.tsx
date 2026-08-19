"use client";

import { useMemo } from "react";
import type { Store, DayLog } from "@/lib/schemas";
import { cn, iso } from "@/lib/utils";
import { isBlockObjectOn } from "@/lib/engine/block-selectors";

/**
 * GitHub-contribution-style calendar heatmap. Each cell = 1 day.
 * Colour by daily state:
 *   green filled = green symptom state OR barbell session logged
 *   amber filled = amber
 *   red filled   = red or skipped-for-symptom
 *   bronze fill  = accessory-only day (some work done, no strength)
 *   empty        = no activity
 * Layout: columns = weeks (oldest→newest), rows = Mon..Sun.
 */

type Cell = {
  date: string; // YYYY-MM-DD
  state: "none" | "accessory" | "green" | "amber" | "red" | "skip";
  strengthLogged: boolean;
  exerciseCount: number;
  isToday: boolean;
};

// P1-12 — 8 weeks × 44 px cell = 352 px + gaps at 393 mobile, cells
// meet Apple 44 min tap target when they render as `<button onDayClick>`.
// Was 8 weeks × 32 px (audit D3 partial fix from Batch 5).
const WEEKS = 8;
const DAYS = WEEKS * 7;

const STRENGTH_LIFTS = new Set([
  "back_squat_highbar",
  "back_squat_ssb",
  "front_squat",
  "block_pull_midshin",
  "deadlift_conventional",
  "trap_bar_dl_blocks",
  "trap_bar_dl_floor",
]);

function buildCells(store: Store): Cell[] {
  const now = new Date();
  const blockObjectOn = isBlockObjectOn(store);
  // Anchor the LAST column of the grid to the CURRENT week (Mon..Sun).
  // Otherwise a Wednesday viewer never sees today's cell.
  const jsDow = now.getDay();
  const daysToNextSun = (7 - jsDow) % 7; // Sun=0 stays, Mon=6, Sat=1
  const endOfWeek = new Date(now);
  endOfWeek.setDate(now.getDate() + daysToNextSun);
  const start = new Date(endOfWeek);
  start.setDate(endOfWeek.getDate() - (7 * WEEKS - 1));
  // start is guaranteed to be a Monday (endOfWeek is a Sunday, subtract 7×WEEKS - 1 days)

  const cells: Cell[] = [];
  const todayISO = iso(now);
  const gridDays = 7 * WEEKS;
  for (let i = 0; i < gridDays; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const dateISO = iso(d);
    const log = store.logs[dateISO];
    // Phase E · when block-object is on, derive skip signal from block
    // state as well as legacy `skipped[date]`. Once Phase F removes the
    // legacy map, this becomes the sole source.
    const legacySkipped = store.skipped?.[dateISO];
    const blockObjectSkipped = blockObjectOn
      ? Object.values(store.scheduled_blocks ?? {}).some(
          (b) =>
            b.actual_date === dateISO && (b.state === "skipped" || b.state === "moved"),
        )
      : false;
    const skipped = legacySkipped || blockObjectSkipped;

    let state: Cell["state"] = "none";
    let strengthLogged = false;
    let exerciseCount = 0;

    if (log) {
      const exs = Object.entries(log.exercises);
      exerciseCount = exs.filter(([, v]) => v && v.done).length;
      strengthLogged = exs.some(([key, v]) => {
        const exId = key.split(":")[1];
        return v && v.done && STRENGTH_LIFTS.has(exId);
      });
      if (log.derived_state === "red") state = "red";
      else if (log.derived_state === "amber") state = "amber";
      else if (log.derived_state === "green") state = "green";
      else if (strengthLogged) state = "green";
      else if (exerciseCount > 0) state = "accessory";
    }
    if (skipped && state === "none") state = "skip";

    cells.push({
      date: dateISO,
      state,
      strengthLogged,
      exerciseCount,
      isToday: dateISO === todayISO,
    });
  }
  return cells;
}

export function Heatmap({ store, onDayClick }: { store: Store; onDayClick?: (date: string) => void }) {
  const cells = useMemo(() => buildCells(store), [store]);
  // Turn linear cells into a grid: rows = DOW (Mon..Sun), columns = week index
  const rows: Cell[][] = Array.from({ length: 7 }, () => []);
  for (let i = 0; i < cells.length; i++) {
    const row = i % 7;
    rows[row].push(cells[i]);
  }
  const totalStrengthDays = cells.filter((c) => c.strengthLogged).length;
  const totalActiveDays = cells.filter((c) => c.state !== "none" && c.state !== "skip").length;
  const rowLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between">
        <p className="mono-caps">
          Last {WEEKS} weeks
        </p>
        <p className="font-mono text-[11px] text-muted">
          {totalStrengthDays} strength · {totalActiveDays} active total
        </p>
      </div>
      {/* P1-6 — the DOM structure is column-first (grid-flow-col) so a
          proper WAI-ARIA grid (which needs row-first rowheader/gridcell
          descendants) doesn't fit. Simpler: treat the whole heatmap as
          a labeled composite image. Row-day labels stay decorative for
          SR; the summary counts above already convey the semantic. */}
      <div
        role="img"
        aria-label={`Activity heatmap for the last ${WEEKS} weeks: ${totalStrengthDays} strength days, ${totalActiveDays} active days total`}
        className="flex gap-2"
      >
        <div className="flex flex-col gap-0.5" aria-hidden="true">
          {rowLabels.map((r) => (
            <span
              key={r}
              className="mono-caps text-[10px] h-4 leading-4 flex items-center pr-1"
            >
              {r[0]}
            </span>
          ))}
        </div>
        <div className="flex-1 overflow-x-auto">
          <div
            className="grid grid-flow-col gap-0.5"
            style={{
              gridTemplateRows: "repeat(7, 1fr)",
              gridAutoColumns: "minmax(44px, 1fr)",
            }}
          >
            {cells.map((c) =>
              onDayClick ? (
                <button
                  key={c.date}
                  type="button"
                  onClick={() => onDayClick(c.date)}
                  aria-label={cellAria(c)}
                  title={cellAria(c)}
                  className={cn(
                    "aspect-square rounded-[2px] transition-colors cursor-pointer hover:ring-1 hover:ring-slate/60",
                    c.state === "green" && "bg-green",
                    c.state === "amber" && "bg-amber",
                    c.state === "red" && "bg-red",
                    c.state === "accessory" && "bg-bronze/50",
                    c.state === "skip" && "bg-line-soft border border-dashed border-line",
                    c.state === "none" && "bg-line-soft",
                    c.isToday && "ring-1 ring-bronze",
                  )}
                />
              ) : (
              <span
                key={c.date}
                role="gridcell"
                aria-label={cellAria(c)}
                title={cellAria(c)}
                className={cn(
                  "aspect-square rounded-[2px] transition-colors",
                  c.state === "green" && "bg-green",
                  c.state === "amber" && "bg-amber",
                  c.state === "red" && "bg-red",
                  c.state === "accessory" && "bg-bronze/50",
                  c.state === "skip" && "bg-line-soft border border-dashed border-line",
                  c.state === "none" && "bg-line-soft",
                  c.isToday && "ring-1 ring-bronze",
                )}
              />
              ),
            )}
          </div>
        </div>
      </div>
      <Legend />
    </div>
  );
}

function cellAria(c: Cell): string {
  const stateWord =
    c.state === "green"
      ? "green day"
      : c.state === "amber"
        ? "amber day"
        : c.state === "red"
          ? "red day"
          : c.state === "accessory"
            ? "accessory only"
            : c.state === "skip"
              ? "skipped"
              : "no activity";
  return `${c.date}: ${stateWord}${c.exerciseCount ? ` (${c.exerciseCount} exercise${c.exerciseCount === 1 ? "" : "s"})` : ""}${c.isToday ? " · today" : ""}`;
}

function Legend() {
  return (
    <div className="flex flex-wrap gap-3 text-[11px] text-muted">
      <LegendItem colorClass="bg-green" label="green" />
      <LegendItem colorClass="bg-amber" label="amber" />
      <LegendItem colorClass="bg-red" label="red" />
      <LegendItem colorClass="bg-bronze/50" label="accessory" />
      <LegendItem
        colorClass="bg-line-soft border border-dashed border-line"
        label="skipped"
      />
      <LegendItem colorClass="bg-line-soft" label="nothing" />
    </div>
  );
}

function LegendItem({ colorClass, label }: { colorClass: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span className={`inline-block w-3 h-3 rounded-[2px] ${colorClass}`} aria-hidden />
      {label}
    </span>
  );
}
