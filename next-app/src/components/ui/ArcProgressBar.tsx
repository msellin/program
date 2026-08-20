/**
 * ArcProgressBar — v1.1.1 §2.6
 *
 * "Week 3 of 6" horizontal progress bar. Renders on:
 *   - Above WorkoutHero on Today (single program)
 *   - Full-width on Progress with retest waypoints as diamond markers
 *
 * role="progressbar" with aria-valuenow/min/max REQUIRED per a11y §4
 * (v1.0 primitive had NO aria field — this is the fix).
 *
 * Retest waypoints render as siblings inside role="group" with per-
 * waypoint accessible names. When tappable, each is a <button> with
 * 44×44 hit-slop (mobile-UX §2.6).
 *
 * Reserved height (motion-perf §3.2): container fixes min-height so
 * fill animation from 0 → weekCurrent/weekTotal doesn't shift siblings
 * during mount.
 *
 * Compliance: R5 (calendar-driven, not self-imposed streak), R8 (single
 * metric — weeks elapsed / weeks total).
 */

"use client";

import { cn } from "@/lib/utils";

export type ArcRetestWaypoint = {
  weekIndex: number;
  label: string;
  onTap?: () => void;
};

export type ArcProgressBarProps = {
  programName: string;
  weekCurrent: number;
  weekTotal: number;
  retestSchedule?: ArcRetestWaypoint[];
  nextMilestone?: string;
  /** REQUIRED per a11y §4. Include program name + progress + next retest. */
  ariaLabel: string;
  className?: string;
};

export function ArcProgressBar({
  programName,
  weekCurrent,
  weekTotal,
  retestSchedule,
  nextMilestone,
  ariaLabel,
  className,
}: ArcProgressBarProps) {
  const pct = weekTotal > 0 ? Math.min(100, Math.max(0, (weekCurrent / weekTotal) * 100)) : 0;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <div className="flex items-baseline gap-2 min-w-0">
          <span className="font-mono text-[10px] font-medium uppercase tracking-widest text-muted">
            {programName}
          </span>
          <span className="font-mono text-[14px] tabular-nums text-strong">
            {weekCurrent}/{weekTotal}
          </span>
        </div>
        {nextMilestone && (
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted truncate">
            Next: {nextMilestone}
          </span>
        )}
      </div>
      <div className="relative">
        {/* Rail — reserved height so fill animation doesn't cause CLS. */}
        <div
          role="progressbar"
          aria-label={ariaLabel}
          aria-valuenow={weekCurrent}
          aria-valuemin={0}
          aria-valuemax={weekTotal}
          className="h-2 w-full rounded-full bg-line-soft overflow-hidden min-h-[8px]"
        >
          <div
            className="h-full rounded-full bg-bronze transition-[width] duration-[400ms] motion-reduce:transition-none"
            style={{
              width: `${pct}%`,
              transitionTimingFunction: "var(--ease-out-terav, cubic-bezier(0.2, 0.8, 0.2, 1))",
            }}
          />
        </div>
        {/* Retest waypoints — diamonds positioned along the rail. */}
        {retestSchedule && retestSchedule.length > 0 && (
          <div
            role="group"
            aria-label="Retest waypoints"
            className="absolute inset-0 flex items-center pointer-events-none"
          >
            {retestSchedule.map((wp) => {
              const leftPct = weekTotal > 0 ? (wp.weekIndex / weekTotal) * 100 : 0;
              const achieved = wp.weekIndex <= weekCurrent;
              const marker = (
                <span
                  aria-hidden
                  className={cn(
                    "absolute h-2.5 w-2.5 -translate-x-1/2 rotate-45 rounded-sm",
                    achieved
                      ? "bg-bronze ring-1 ring-strong/30"
                      : "bg-surface-2 ring-1 ring-line-strong",
                  )}
                  style={{ left: `${leftPct}%` }}
                />
              );
              if (wp.onTap) {
                return (
                  <button
                    key={wp.weekIndex}
                    type="button"
                    onClick={wp.onTap}
                    aria-label={`Retest week ${wp.weekIndex}: ${wp.label}`}
                    className={cn(
                      "absolute min-h-[44px] min-w-[44px] flex items-center justify-center pointer-events-auto",
                      "focus-visible:outline focus-visible:outline-2 focus-visible:outline-bronze focus-visible:outline-offset-2 rounded",
                    )}
                    style={{ left: `calc(${leftPct}% - 22px)` }}
                  >
                    {marker}
                  </button>
                );
              }
              return <span key={wp.weekIndex}>{marker}</span>;
            })}
          </div>
        )}
      </div>
    </div>
  );
}
