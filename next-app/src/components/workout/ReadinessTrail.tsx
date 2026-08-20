"use client";

import { cn } from "@/lib/utils";
import type { Store } from "@/lib/schemas";

/**
 * ReadinessTrail — v1.1.1 §2.4 upgraded.
 *
 * Renders N tiny dots — one per day — colored by that day's derived_state
 * (green / amber / red). Days with no check saved show a muted hollow
 * ring. Reads store.logs[date].derived_state.
 *
 * Two variants:
 *   - `interactive=false` (default, used on Today): container is
 *     role="img" with a computed aria-label describing the trend.
 *     Dots are decorative <span>s. No individual dot tap targets.
 *
 *   - `interactive=true` (used on Progress 30-day): container is
 *     role="group". Each cell is a <button min-h-11 min-w-11> with
 *     aria-label describing the specific day + state. Optional
 *     `onCellTap(date)` handler for parent to open an ExplainSheet
 *     with day detail.
 *
 * R5 no-gamification: no streak count, no "N days in a row" — just an
 * honest history glance. Data as visualization, not text.
 *
 * Width guardrail (§2.4): on Today, keep ReadinessTrail ≤ 40% of
 * WorkoutHero card interior. Visual-weight rank 3 behind title + CTA.
 * If persona render inverts, ship fails.
 */

type State = "green" | "amber" | "red" | null;

type Cell = { date: string; state: State };

export type ReadinessTrailProps = {
  logs: Store["logs"];
  activeDate: string;
  /** Number of days to display. 14 on Today (default), 30 on Progress. */
  days?: number;
  /**
   * When true, cells become tappable buttons with 44×44 hit targets and
   * role="group" container. Default false → static role="img".
   */
  interactive?: boolean;
  /** Called with the ISO date when a cell is tapped (interactive only). */
  onCellTap?: (date: string) => void;
  className?: string;
};

export function ReadinessTrail({
  logs,
  activeDate,
  days = 14,
  interactive = false,
  onCellTap,
  className,
}: ReadinessTrailProps) {
  const cells = buildCells(activeDate, days, logs);
  const anyState = cells.some((c) => c.state !== null);
  if (!anyState) {
    // Batch 36 P1 (audit 2026-08-21 · app-copy) — was silent null, now
    // renders a small placeholder so the section eyebrow doesn't hover
    // over an empty area. Reserved layout height matches interactive
    // (min-h-11) so no CLS on hydration.
    return (
      <p
        className={cn(
          "text-[12px] text-muted italic min-h-11 flex items-center",
          className,
        )}
      >
        No morning checks logged in the last {days} days yet.
      </p>
    );
  }

  const ariaLabel = buildAriaLabel(cells, days);

  if (interactive) {
    return (
      <div
        role="group"
        aria-label={ariaLabel}
        className={cn("flex items-center gap-1 flex-wrap", className)}
      >
        {cells.map((c, idx) => (
          <button
            key={c.date}
            type="button"
            onClick={onCellTap ? () => onCellTap(c.date) : undefined}
            aria-label={cellAriaLabel(c, idx === cells.length - 1)}
            className={cn(
              "min-h-[44px] min-w-[44px] flex items-center justify-center rounded",
              "focus-visible:outline focus-visible:outline-2 focus-visible:outline-bronze focus-visible:outline-offset-2",
              onCellTap ? "hover:bg-line-soft" : "cursor-default",
            )}
            disabled={!onCellTap}
          >
            <span aria-hidden className={dotClasses(c, idx === cells.length - 1)} />
          </button>
        ))}
      </div>
    );
  }

  // Display variant (Today). Static, no per-cell interactivity.
  return (
    <div
      role="img"
      aria-label={ariaLabel}
      className={cn("flex items-center gap-1", className)}
    >
      {cells.map((c, idx) => (
        <span
          key={c.date}
          title={`${c.date}: ${c.state ?? "no check"}`}
          aria-hidden
          className={dotClasses(c, idx === cells.length - 1)}
        />
      ))}
    </div>
  );
}

function buildCells(activeDate: string, days: number, logs: Store["logs"]): Cell[] {
  const today = new Date(activeDate + "T00:00:00");
  const cells: Cell[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const iso = d.toISOString().slice(0, 10);
    const state = (logs?.[iso]?.derived_state ?? null) as State;
    cells.push({ date: iso, state });
  }
  return cells;
}

function dotClasses(c: Cell, isToday: boolean): string {
  const base = "h-1.5 w-1.5 rounded-full flex-shrink-0";
  const tone =
    c.state === "green"
      ? "bg-green"
      : c.state === "amber"
        ? "bg-amber"
        : c.state === "red"
          ? "bg-red"
          : "bg-line-soft ring-1 ring-line-soft";
  const highlight = isToday ? "ring-1 ring-strong/50" : "";
  return `${base} ${tone} ${highlight}`.trim();
}

/**
 * v1.1.1 §2.4 enhanced aria-label. Describes the full trend so an SR
 * user can hear the pattern without needing to tab into individual
 * cells. Format: "Readiness, past N days: X green, Y amber, Z red.
 * Latest reading STATE. Trend: TREND over the last 7 days."
 */
function buildAriaLabel(cells: Cell[], days: number): string {
  const green = cells.filter((c) => c.state === "green").length;
  const amber = cells.filter((c) => c.state === "amber").length;
  const red = cells.filter((c) => c.state === "red").length;
  const nolog = cells.filter((c) => c.state === null).length;

  const latest = cells[cells.length - 1]?.state ?? null;
  const latestPart = latest ? `Latest reading ${latest}.` : "Latest: no check today.";

  // 7-day trend heuristic: compare last 7 to prior N-7 for each color.
  const trend = describeTrend(cells);

  const parts = [
    `Readiness, past ${days} days:`,
    `${green} green, ${amber} amber, ${red} red`,
    nolog > 0 ? `, ${nolog} without check.` : ".",
    latestPart,
    trend,
  ];
  return parts.join(" ").replace(/\s+/g, " ").trim();
}

function cellAriaLabel(c: Cell, isLatest: boolean): string {
  const state = c.state ?? "no check";
  const suffix = isLatest ? " (today)" : "";
  return `${c.date}: ${state}${suffix}`;
}

function describeTrend(cells: Cell[]): string {
  if (cells.length < 4) return "";
  const half = Math.floor(cells.length / 2);
  const older = cells.slice(0, half);
  const recent = cells.slice(half);
  const oldGreen = older.filter((c) => c.state === "green").length / Math.max(older.length, 1);
  const recGreen = recent.filter((c) => c.state === "green").length / Math.max(recent.length, 1);
  const delta = recGreen - oldGreen;
  if (delta > 0.15) return "Trend: improving.";
  if (delta < -0.15) return "Trend: worsening.";
  return "Trend: flat.";
}
