/**
 * WeeklySessionStrip — v1.1.1 §2.5
 *
 * 7-cell M-T-W-T-F-S-S row. Renders on:
 *   - Today (inside WorkoutHero, display-only)
 *   - /session/[slug] header (display-only)
 *   - /week (interactive — tap to expand day detail)
 *
 * Tap-target resolution (mobile-UX P0-3): cells are 44×44 minimum when
 * interactive=true. Container is min-h-11, each cell is flex-1 min-h-11.
 * When interactive=false, cells are pure visual marks, container
 * role="img" with computed summary.
 *
 * NO breathing pulse on today's cell (motion-perf §5.1). Static
 * slate-outline treatment. R5-adjacent to invite "keep the streak going."
 *
 * Compliance: R5 (no streak count/badge), a11y §4 (interactive/display
 * ARIA split), mobile-UX P0-3 (44×44 tap targets).
 */

"use client";

import { cn } from "@/lib/utils";

export type WeeklySessionStripDay = {
  /** Single-letter label M · T · W · T · F · S · S. */
  dayLetter: string;
  scheduled: boolean;
  completed: boolean;
  isToday: boolean;
  isRest: boolean;
};

export type WeeklySessionStripProps = {
  weekStart: string;
  days: WeeklySessionStripDay[];
  interactive?: boolean;
  onCellTap?: (dayIndex: number) => void;
  /** Required when interactive=false; computed if omitted. */
  ariaLabel?: string;
  className?: string;
};

export function WeeklySessionStrip({
  weekStart,
  days,
  interactive = false,
  onCellTap,
  ariaLabel,
  className,
}: WeeklySessionStripProps) {
  const label = ariaLabel ?? computeSummary(days);

  if (interactive) {
    return (
      <div
        role="group"
        aria-label={label}
        data-week-start={weekStart}
        className={cn("flex items-stretch gap-1 min-h-11 w-full", className)}
      >
        {days.map((d, i) => (
          <button
            key={`${d.dayLetter}-${i}`}
            type="button"
            onClick={onCellTap ? () => onCellTap(i) : undefined}
            aria-label={cellAriaLabel(d)}
            aria-current={d.isToday ? "date" : undefined}
            aria-pressed={d.completed}
            className={cn(
              "flex-1 min-h-11 rounded flex flex-col items-center justify-center gap-1 py-1",
              "focus-visible:outline focus-visible:outline-2 focus-visible:outline-bronze focus-visible:outline-offset-2",
              onCellTap ? "hover:bg-line-soft" : "cursor-default",
              d.isToday && "ring-1 ring-strong/50",
            )}
            disabled={!onCellTap}
          >
            <span className="font-mono text-[10px] font-medium uppercase tracking-widest text-muted">
              {d.dayLetter}
            </span>
            <StateDot day={d} />
          </button>
        ))}
      </div>
    );
  }

  // Display-only variant (Today, Session header). Static.
  return (
    <div
      role="img"
      aria-label={label}
      data-week-start={weekStart}
      className={cn("flex items-center gap-1", className)}
    >
      {days.map((d, i) => (
        <div
          key={`${d.dayLetter}-${i}`}
          className={cn(
            "flex-1 min-w-[28px] flex flex-col items-center gap-0.5 py-0.5",
            d.isToday && "ring-1 ring-strong/50 rounded",
          )}
        >
          <span
            aria-hidden
            className="font-mono text-[10px] font-medium uppercase tracking-widest text-muted"
          >
            {d.dayLetter}
          </span>
          <StateDot day={d} />
        </div>
      ))}
    </div>
  );
}

function StateDot({ day }: { day: WeeklySessionStripDay }) {
  const classes = day.isRest
    ? "bg-line-soft"
    : day.completed
      ? "bg-green"
      : day.isToday
        ? "bg-slate ring-1 ring-slate/40"
        : day.scheduled
          ? "border border-line-strong bg-transparent"
          : "bg-line-soft";
  return <span aria-hidden className={cn("h-2 w-2 rounded-full flex-shrink-0", classes)} />;
}

function cellAriaLabel(d: WeeklySessionStripDay): string {
  const state = d.isRest
    ? "rest day"
    : d.completed
      ? "session completed"
      : d.isToday
        ? "today, session upcoming"
        : d.scheduled
          ? "scheduled"
          : "no session";
  return `${dayFull(d.dayLetter)}: ${state}`;
}

function dayFull(letter: string): string {
  return (
    { M: "Monday", T: "Tuesday", W: "Wednesday", F: "Friday", S: "Saturday" }[letter[0]] ??
    letter
  );
}

function computeSummary(days: WeeklySessionStripDay[]): string {
  const done = days.filter((d) => d.completed).length;
  const rest = days.filter((d) => d.isRest).length;
  const scheduled = days.filter((d) => d.scheduled && !d.completed && !d.isToday).length;
  const today = days.filter((d) => d.isToday).length;
  return `Week strip: ${done} done, ${rest} rest, ${scheduled} scheduled${today ? ", today included" : ""}`;
}
