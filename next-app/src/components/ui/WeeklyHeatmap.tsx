/**
 * WeeklyHeatmap — v1.1.1 §2.9
 *
 * 7 × 12 GitHub-style grid. Renders on Progress top + Report.
 *
 * Tap-target resolution (mobile-UX P0-4): per-cell drilldown at ~48px
 * viewport = 40-48px cells minus gutters = fails 44×44. Resolution:
 * ROW-tap only, never per-cell. Each week row is a <button
 * aria-label="Week of {weekStart}: N done, N amber, N red, N rest, N
 * missed"> with min-h-11.
 *
 * Legend (copy §5.2): below the grid, four states in mono-caps
 * captions with colored dots. Set `legend={false}` if surrounding
 * surface provides it elsewhere.
 *
 * Overflow protection (mobile-UX §2.9): grid container is
 * overflow-hidden to protect iOS back-swipe gesture.
 *
 * Stagger cascade cap (motion-perf §2.3): 84 cells × 50ms uncapped =
 * 4.2s. Two caps landed here: (1) render is one paint by default —
 * NO per-cell stagger. Kept the option via `stagger` prop if a
 * showcase surface wants it, but Today/Progress use stagger=false.
 * (2) content-visibility: auto on the grid container for browser
 * layout skipping.
 *
 * Compliance: R5 (honest — no session logged shows as empty, not
 * hidden), a11y §4 (row-tap, computed summary), mobile-UX P0-4.
 */

"use client";

import { cn } from "@/lib/utils";

export type WeeklyHeatmapCellState = "green" | "amber" | "red" | "rest" | "missed" | "none";

export type WeeklyHeatmapCell = {
  date: string;
  sessionState: WeeklyHeatmapCellState;
};

export type WeeklyHeatmapProps = {
  /** Exactly 7 × N cells (default 12 weeks = 84 cells). Ordered by row-major (M-T-W-T-F-S-S). */
  cells: WeeklyHeatmapCell[];
  ariaLabel: string;
  onRowTap?: (weekIndex: number) => void;
  legend?: boolean;
  className?: string;
};

// Batch 36 P0 fix (visual-craft audit) — "green" was mapped to bg-bronze
// which paints every "session done" cell CTA-bronze and violates R2/V4
// (bronze is CTA-only). Green cells now use bg-green as the semantic
// state color. Bronze reserved for target/PR waypoints and primary CTA.
const STATE_CLASS: Record<WeeklyHeatmapCellState, string> = {
  green: "bg-green",
  amber: "bg-amber/70",
  red: "bg-red/70",
  rest: "border border-line-strong bg-transparent",
  missed: "border border-line-strong bg-transparent opacity-60",
  none: "bg-line-soft/40",
};

export function WeeklyHeatmap({
  cells,
  ariaLabel,
  onRowTap,
  legend = true,
  className,
}: WeeklyHeatmapProps) {
  // Group cells into weeks. Column-major (each week is a column of 7).
  const weeks = groupByWeek(cells);

  return (
    <div className={cn("space-y-2", className)}>
      <div
        role="group"
        aria-label={ariaLabel}
        className="overflow-hidden rounded"
        style={{
          contentVisibility: "auto",
          containIntrinsicSize: `${weeks.length * 20}px 200px`,
        }}
      >
        <div className="flex gap-1">
          {weeks.map((week, wIdx) => {
            const summary = weekSummary(wIdx, week);
            if (onRowTap) {
              return (
                <button
                  key={wIdx}
                  type="button"
                  onClick={() => onRowTap(wIdx)}
                  aria-label={summary}
                  className={cn(
                    "flex flex-col gap-1 min-h-11 flex-1 rounded p-0.5",
                    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-bronze focus-visible:outline-offset-2",
                    "hover:bg-line-soft",
                  )}
                >
                  {week.map((c, dIdx) => (
                    <span
                      key={`${wIdx}-${dIdx}`}
                      aria-hidden
                      title={`${c.date}: ${c.sessionState}`}
                      className={cn(
                        "h-3 w-full rounded-sm flex-1 min-h-[10px]",
                        STATE_CLASS[c.sessionState],
                      )}
                    />
                  ))}
                </button>
              );
            }
            return (
              <div
                key={wIdx}
                aria-label={summary}
                className="flex flex-col gap-1 flex-1 p-0.5"
              >
                {week.map((c, dIdx) => (
                  <span
                    key={`${wIdx}-${dIdx}`}
                    aria-hidden
                    title={`${c.date}: ${c.sessionState}`}
                    className={cn(
                      "h-3 w-full rounded-sm flex-1 min-h-[10px]",
                      STATE_CLASS[c.sessionState],
                    )}
                  />
                ))}
              </div>
            );
          })}
        </div>
      </div>
      {legend ? <Legend /> : null}
    </div>
  );
}

function Legend() {
  const items: { label: string; cls: string }[] = [
    { label: "Done", cls: STATE_CLASS.green },
    { label: "Amber", cls: STATE_CLASS.amber },
    { label: "Red-flag", cls: STATE_CLASS.red },
    { label: "Rest or missed", cls: STATE_CLASS.rest },
  ];
  return (
    <ul className="flex flex-wrap items-center gap-x-4 gap-y-1">
      {items.map((it) => (
        <li key={it.label} className="flex items-center gap-1.5">
          <span aria-hidden className={cn("h-2 w-2 rounded-sm", it.cls)} />
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
            {it.label}
          </span>
        </li>
      ))}
    </ul>
  );
}

function groupByWeek(cells: WeeklyHeatmapCell[]): WeeklyHeatmapCell[][] {
  const weeks: WeeklyHeatmapCell[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }
  return weeks;
}

function weekSummary(idx: number, week: WeeklyHeatmapCell[]): string {
  const g = week.filter((c) => c.sessionState === "green").length;
  const a = week.filter((c) => c.sessionState === "amber").length;
  const r = week.filter((c) => c.sessionState === "red").length;
  const rest = week.filter((c) => c.sessionState === "rest").length;
  const miss = week.filter((c) => c.sessionState === "missed").length;
  const anchor = week[0]?.date ?? `week ${idx + 1}`;
  return `Week of ${anchor}: ${g} done, ${a} amber, ${r} red, ${rest} rest, ${miss} missed`;
}
