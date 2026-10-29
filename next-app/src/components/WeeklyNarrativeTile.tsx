"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useStore } from "@/lib/useStore";
import { computeWeekSummary, weekDates } from "@/lib/engine/weekly-narrative";
import { loadExercises } from "@/lib/data-loader";
import { exerciseListName } from "@/lib/day-format";
import { today as todayISO, iso, cn } from "@/lib/utils";
import type { Exercise, Program } from "@/lib/schemas";
import { cardClass } from "@/components/ui/Card";

/**
 * Record's headline: this week (founder-feedback round 4, 2026-10-29).
 *
 * A sessions ring and a plain "on track / N behind" lead; then only the lines that have something to say: the
 * heaviest set by exercise NAME (it showed the raw id), real new bests (it counted lifts trained), outside sessions,
 * and a one-line note after an amber or red check. No AI — a pure aggregate of the log. Arrows step back 12 weeks.
 */
export function WeeklyNarrativeTile({ program }: { program: Program }) {
  const store = useStore((s) => s.store);
  const [offset, setOffset] = useState(0);
  const [byId, setById] = useState<Record<string, Exercise>>({});

  useEffect(() => {
    void loadExercises().then((x) => setById(x.byId));
  }, []);

  const anchorDate = useMemo(() => {
    const t = new Date(todayISO() + "T00:00:00");
    t.setDate(t.getDate() + offset * 7);
    return iso(t);
  }, [offset]);

  const summary = useMemo(() => computeWeekSummary(store, program, anchorDate), [store, program, anchorDate]);

  const isCurrentWeek = weekDates(todayISO())[0] === summary.weekStart;
  const { completed, scheduled } = summary.sessions;
  // The rule, stated (rescore 2026-10-29): mid-week there is no "behind" — only what is left; a closed week says how
  // many planned sessions were done. A week with nothing planned says so instead of "On track" over an empty ring.
  const left = Math.max(0, scheduled - completed);
  const status =
    scheduled === 0
      ? "No sessions planned"
      : isCurrentWeek
        ? left === 0
          ? "All done this week"
          : `${left} left this week`
        : left === 0
          ? "All planned sessions done"
          : `${completed} of ${scheduled} planned sessions done`;
  const top = summary.training.topLift;
  const topName = top ? (byId[top.exerciseId] ? exerciseListName(byId[top.exerciseId]) : top.exerciseId.replace(/_/g, " ")) : null;
  const flagged = summary.states.red + summary.states.amber;

  return (
    <section className={cn(cardClass(), "space-y-4")} aria-labelledby="week-headline">
      <header className="flex items-center justify-between gap-2">
        <h2 id="week-headline" className="text-body font-semibold text-strong">
          {isCurrentWeek ? "This week" : summary.label}
        </h2>
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={() => setOffset(offset - 1)}
            disabled={offset <= -12}
            aria-label="Previous week"
            className="w-11 h-11 flex items-center justify-center rounded-lg hover:bg-line-soft text-muted hover:text-ink disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={() => setOffset(offset + 1)}
            disabled={offset >= 0}
            aria-label="Next week"
            className="w-11 h-11 flex items-center justify-center rounded-lg hover:bg-line-soft text-muted hover:text-ink disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </header>

      <div className="flex items-center gap-5">
        <SessionsRing done={completed} of={scheduled} />
        <div className="min-w-0 space-y-1">
          <p className="text-h3 font-semibold text-strong leading-tight">{status}</p>
          {scheduled > 0 ? (
            <p className="text-small text-muted">
              {completed} of {scheduled} planned session{scheduled === 1 ? "" : "s"} done
            </p>
          ) : null}
        </div>
      </div>

      {summary.hasAnyActivity ? (
        <ul className="space-y-2 border-t border-line-soft pt-3 text-small">
          {top && topName ? (
            <Line label="Heaviest set" value={topName} figure={`${top.weight_kg} kg × ${top.reps}`} />
          ) : null}
          {summary.training.newBests > 0 ? <Line label="New bests" value={String(summary.training.newBests)} /> : null}
          {summary.endurance.runsCount > 0 ? (
            <Line
              label="Outside sessions"
              value={[
                String(summary.endurance.runsCount),
                summary.endurance.totalKm > 0 ? `${summary.endurance.totalKm} km` : null,
                summary.endurance.totalMinutes > 0 ? `${summary.endurance.totalMinutes} min` : null,
              ]
                .filter(Boolean)
                .join(" · ")}
            />
          ) : null}
          {flagged > 0 ? (
            <li className={cn("text-small", summary.states.red > 0 ? "text-red" : "text-amber")}>
              {summary.states.red > 0
                ? `${summary.states.red} red check${summary.states.red === 1 ? "" : "s"}`
                : `${summary.states.amber} amber check${summary.states.amber === 1 ? "" : "s"}`}{" "}
              this week.
            </li>
          ) : null}
        </ul>
      ) : (
        <p className="text-small text-muted">Your week shows up here after your first session.</p>
      )}
    </section>
  );
}

/** Done of planned, as a ring. Bronze fill; a full ring when everything planned is done. */
function SessionsRing({ done, of }: { done: number; of: number }) {
  const r = 34;
  const c = 2 * Math.PI * r;
  const frac = of > 0 ? Math.min(1, done / of) : 0;
  return (
    <div className="relative h-24 w-24 flex-shrink-0" role="img" aria-label={`${done} of ${of} sessions`}>
      <svg viewBox="0 0 80 80" className="h-full w-full -rotate-90" aria-hidden>
        <circle cx="40" cy="40" r={r} fill="none" stroke="currentColor" strokeWidth="7" className="text-line-soft" />
        <circle
          cx="40"
          cy="40"
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - frac)}
          className="text-bronze transition-[stroke-dashoffset] duration-500 motion-reduce:transition-none"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center font-mono text-h3 tabular-nums text-strong" aria-hidden>
        {done}/{of}
      </span>
    </div>
  );
}

function Line({ label, value, figure }: { label: string; value: string; figure?: string }) {
  return (
    <li className="flex items-baseline justify-between gap-3">
      <span className="flex-shrink-0 text-muted">{label}</span>
      {/* A long exercise name truncates; the figure never wraps under it. */}
      <span className="flex min-w-0 items-baseline justify-end text-ink">
        <span className="truncate" title={value}>{value}</span>
        {figure ? <span className="flex-shrink-0 whitespace-nowrap tabular-nums">&nbsp;· {figure}</span> : null}
      </span>
    </li>
  );
}
