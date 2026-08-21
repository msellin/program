"use client";

/**
 * Cut C · Record surface · Log-section ActivityHeatmap.
 *
 * Auto-switching primitive:
 * - `<120 days` of data → 12-week matrix mode (reuses existing
 *   WeeklyHeatmap primitive with `sessionState`-per-day cells)
 * - `≥120 days` → year-column mode (12 months × N years of monthly-
 *   total mini bars with 3-tone density ramp)
 *
 * "Sessions per month" framing — the peer-mainstream frame. Hevy
 * calendar month view + Strava/Peloton stats bars all use this
 * shape. Product-design-lead's stress test caught the earlier
 * "false density lie" (4 cells × 12 months ≠ 365 days) and
 * replaced with honest monthly-total bars.
 *
 * See dev/active/redesign-progress/DESIGN-cut-c.md · ActivityHeatmap
 * See mockup: dev/active/redesign-progress/record-mockup-day400-v3.png
 * (year-column) + record-mockup-day90-recover.png (12-week matrix).
 *
 * Batch 37 pattern reminder: no `?? []` inside a useStore selector.
 */

import { useMemo } from "react";
import {
  WeeklyHeatmap,
  type WeeklyHeatmapCell,
  type WeeklyHeatmapCellState,
} from "@/components/ui/WeeklyHeatmap";
import type { Store } from "@/lib/schemas";
import { cn } from "@/lib/utils";

export type CutCActivityHeatmapProps = {
  store: Store;
  className?: string;
};

/**
 * Build 12-week readiness heatmap from store.logs.
 * Same cell shape WeeklyHeatmap expects.
 */
function build12WeekCells(store: Store): WeeklyHeatmapCell[] {
  const cells: WeeklyHeatmapCell[] = [];
  const now = new Date();
  const totalDays = 12 * 7;
  const logs = store.logs ?? {};
  for (let i = totalDays - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const iso = d.toISOString().slice(0, 10);
    const log = logs[iso];
    const state = (log?.derived_state ?? null) as WeeklyHeatmapCellState | null;
    cells.push({
      date: iso,
      sessionState: state ?? "none",
    });
  }
  return cells;
}

type MonthTotal = {
  year: number;
  month: number; // 0-11
  count: number;
};

function buildMonthlyTotals(store: Store): MonthTotal[] {
  const logs = store.logs ?? {};
  const buckets = new Map<string, MonthTotal>();
  for (const [iso, day] of Object.entries(logs)) {
    if (!day) continue;
    // A day counts if it has any exercise entry OR a run entry.
    const hasExercise = day.exercises && Object.keys(day.exercises).length > 0;
    const hasRun = (day.runs ?? []).length > 0;
    if (!hasExercise && !hasRun) continue;
    const d = new Date(iso + "T00:00:00");
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const existing = buckets.get(key);
    if (existing) existing.count += 1;
    else buckets.set(key, { year: d.getFullYear(), month: d.getMonth(), count: 1 });
  }
  return Array.from(buckets.values()).sort(
    (a, b) => a.year - b.year || a.month - b.month,
  );
}

function daysSinceFirstLog(store: Store): number {
  const dates = Object.keys(store.logs ?? {}).sort();
  if (dates.length === 0) return 0;
  const first = new Date(dates[0] + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.max(
    0,
    Math.round((today.getTime() - first.getTime()) / (1000 * 60 * 60 * 24)),
  );
}

const MONTH_LETTERS = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];

export function CutCActivityHeatmap({ store, className }: CutCActivityHeatmapProps) {
  const days = useMemo(() => daysSinceFirstLog(store), [store]);
  const use12Week = days < 120;

  const cells = useMemo(
    () => (use12Week ? build12WeekCells(store) : []),
    [use12Week, store],
  );
  const monthly = useMemo(
    () => (use12Week ? [] : buildMonthlyTotals(store)),
    [use12Week, store],
  );

  if (use12Week) {
    return (
      <div className={cn("rounded border border-line-soft bg-surface p-3", className)}>
        <p className="font-mono text-[10px] font-medium uppercase tracking-widest text-muted mb-2">
          Activity — last 12 weeks
        </p>
        <WeeklyHeatmap
          cells={cells}
          ariaLabel="Activity heatmap over the past 12 weeks."
        />
      </div>
    );
  }

  return <YearColumnHeatmap monthly={monthly} className={className} />;
}

/**
 * Year-column mode — 12 months × N years of monthly-total mini bars.
 * 3-tone lightness ramp: low <70% of max, mid, high >85% of max.
 * Redundant with height for legibility per visual-craft audit.
 */
function YearColumnHeatmap({
  monthly,
  className,
}: {
  monthly: MonthTotal[];
  className?: string;
}) {
  const maxCount = monthly.reduce((m, x) => Math.max(m, x.count), 1);
  // Group by year
  const byYear = new Map<number, MonthTotal[]>();
  for (const m of monthly) {
    const arr = byYear.get(m.year) ?? [];
    arr.push(m);
    byYear.set(m.year, arr);
  }
  const years = Array.from(byYear.keys()).sort();
  const rangeStart = years[0];
  const rangeEnd = years[years.length - 1];

  return (
    <div
      role="img"
      aria-label={`Monthly session totals from ${rangeStart} to ${rangeEnd}. Max ${maxCount} sessions in a single month.`}
      className={cn("rounded border border-line-soft bg-surface p-3", className)}
    >
      <p className="font-mono text-[10px] font-medium uppercase tracking-widest text-muted mb-2">
        Sessions per month — {rangeStart}{rangeStart !== rangeEnd ? ` · ${rangeEnd}` : ""}
      </p>

      {/* Header row — month letters */}
      <div className="grid grid-cols-[repeat(12,1fr)_auto] items-baseline mb-1" aria-hidden>
        {MONTH_LETTERS.map((letter, i) => (
          <span
            key={i}
            className="text-center font-mono text-[10px] uppercase text-muted"
          >
            {letter}
          </span>
        ))}
        <span className="pl-2" />
      </div>

      {/* Year rows */}
      <div className="space-y-1.5">
        {years.map((year) => {
          const yearMonths = byYear.get(year) ?? [];
          const byMonth = new Map(yearMonths.map((m) => [m.month, m.count]));
          return (
            <div
              key={year}
              className="grid grid-cols-[repeat(12,1fr)_auto] gap-1 items-end h-8"
              aria-hidden
            >
              {Array.from({ length: 12 }, (_, mi) => {
                const count = byMonth.get(mi) ?? 0;
                const heightPct = maxCount > 0 ? (count / maxCount) * 100 : 0;
                const ratio = maxCount > 0 ? count / maxCount : 0;
                let barColor = "bg-[var(--dv-bar-mid)]";
                if (ratio > 0.85) barColor = "bg-[var(--dv-bar-high)]";
                else if (ratio < 0.7 && ratio > 0) barColor = "bg-[var(--dv-bar-low)]";
                return (
                  <div
                    key={mi}
                    className="h-full border-b border-line-soft flex items-end"
                  >
                    {count > 0 ? (
                      <span
                        className={cn("w-full rounded-t-sm", barColor)}
                        style={{ height: `${heightPct}%`, opacity: 0.7 }}
                      />
                    ) : null}
                  </div>
                );
              })}
              <span className="pl-2 font-mono text-[10px] text-muted self-end">{year}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
