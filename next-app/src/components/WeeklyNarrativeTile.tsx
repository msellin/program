"use client";

import { useMemo, useState, type ReactNode } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from "lucide-react";
import { useStore } from "@/lib/useStore";
import { computeWeekSummary, weekDates } from "@/lib/engine/weekly-narrative";
import { today as todayISO, iso, cn } from "@/lib/utils";
import type { Program } from "@/lib/schemas";

/**
 * Deterministic weekly summary tile — no AI. Pure aggregate of what happened.
 *
 * Lives on Progress > Insights. Defaults to the current week; arrows step back
 * up to 12 weeks (matches the Week-tab back-look). Reads like a coach's Sunday
 * note without the coach: sessions, states, top lift, PRs, endurance, rehab,
 * fatigue signals.
 */
export function WeeklyNarrativeTile({
  program,
  headerChip,
  expandableSlot,
}: {
  program: Program;
  /**
   * Progress rebuild 2026-08-18 — an inline chip rendered right of the
   * week label. HERITAGE cluster (Phase 3 of #63) uses this slot;
   * anything categorical + non-directional can render here.
   */
  headerChip?: ReactNode;
  /**
   * Progress rebuild 2026-08-18 — an expandable disclosure at the
   * bottom of the tile. Progress folds the standalone "How the engine
   * reads you" card into this slot to halve the visible cards.
   */
  expandableSlot?: ReactNode;
}) {
  const store = useStore((s) => s.store);
  const [offset, setOffset] = useState(0);
  const [expanded, setExpanded] = useState(false);

  const anchorDate = useMemo(() => {
    const t = new Date(todayISO() + "T00:00:00");
    t.setDate(t.getDate() + offset * 7);
    return iso(t);
  }, [offset]);

  const summary = useMemo(
    () => computeWeekSummary(store, program, anchorDate),
    [store, program, anchorDate],
  );

  const isCurrentWeek = weekDates(todayISO())[0] === summary.weekStart;
  const atFutureEdge = offset >= 0;
  const atPastEdge = offset <= -12;

  return (
    <section className="rounded border border-line bg-surface p-3 space-y-3">
      <header className="flex items-center justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-[15px] font-semibold text-strong">{summary.label}</h3>
            {headerChip}
          </div>
          <p className="text-[12px] text-muted">
            {isCurrentWeek ? "This week so far" : "Completed week"}
          </p>
        </div>
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={() => setOffset(offset - 1)}
            disabled={atPastEdge}
            aria-label="Previous week"
            className="w-11 h-11 flex items-center justify-center rounded hover:bg-line-soft text-muted hover:text-ink disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={() => setOffset(offset + 1)}
            disabled={atFutureEdge}
            aria-label="Next week"
            className="w-11 h-11 flex items-center justify-center rounded hover:bg-line-soft text-muted hover:text-ink disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </header>

      {!summary.hasAnyActivity ? (
        <p className="text-[13px] text-muted italic">
          Nothing logged this week yet. Come back Sunday for a summary.
        </p>
      ) : (
        <ul className="space-y-1.5 text-sm">
          <SummaryLine
            label="Sessions"
            value={`${summary.sessions.completed} / ${summary.sessions.scheduled}`}
            tone={
              summary.sessions.completionRatio >= 0.75
                ? "good"
                : summary.sessions.completionRatio >= 0.5
                  ? "neutral"
                  : "warn"
            }
          />
          {summary.training.topLift ? (
            <SummaryLine
              label="Top lift"
              value={`${summary.training.topLift.exerciseId} · ${summary.training.topLift.weight_kg} kg × ${summary.training.topLift.reps}`}
              tone="good"
            />
          ) : null}
          {summary.training.prsHit > 0 ? (
            <SummaryLine
              label="Weekly bests"
              value={`${summary.training.prsHit} lift${summary.training.prsHit === 1 ? "" : "s"}`}
              tone="good"
            />
          ) : null}
          {summary.endurance.runsCount > 0 ? (
            <SummaryLine
              label="Endurance"
              value={
                [
                  `${summary.endurance.runsCount} session${summary.endurance.runsCount === 1 ? "" : "s"}`,
                  summary.endurance.totalKm > 0 ? `${summary.endurance.totalKm} km` : null,
                  summary.endurance.totalMinutes > 0 ? `${summary.endurance.totalMinutes} min` : null,
                ]
                  .filter(Boolean)
                  .join(" · ")
              }
              tone="neutral"
            />
          ) : null}
          {summary.rehab.daysWithBlockADone > 0 ? (
            <SummaryLine
              label="Rehab"
              value={`${summary.rehab.daysWithBlockADone} of 7 days`}
              tone={summary.rehab.daysWithBlockADone >= 5 ? "good" : "neutral"}
            />
          ) : null}
          {(summary.states.green + summary.states.amber + summary.states.red) > 0 ? (
            <SummaryLine
              label="Morning check"
              value={[
                summary.states.green ? `${summary.states.green} green` : null,
                summary.states.amber ? `${summary.states.amber} amber` : null,
                summary.states.red ? `${summary.states.red} red` : null,
              ]
                .filter(Boolean)
                .join(" · ")}
              tone={summary.states.red > 0 ? "warn" : summary.states.amber > 0 ? "neutral" : "good"}
            />
          ) : null}
          {summary.signals.fatigueDaysHighOrElevated + summary.signals.painDays + summary.signals.externalLoadDays > 0 ? (
            <SummaryLine
              label="Signals"
              value={[
                summary.signals.painDays ? `${summary.signals.painDays} pain-day` : null,
                summary.signals.fatigueDaysHighOrElevated
                  ? `${summary.signals.fatigueDaysHighOrElevated} fatigue`
                  : null,
                summary.signals.externalLoadDays
                  ? `${summary.signals.externalLoadDays} outside load`
                  : null,
              ]
                .filter(Boolean)
                .join(" · ")}
              tone={summary.signals.painDays > 0 ? "warn" : "neutral"}
            />
          ) : null}
        </ul>
      )}
      {expandableSlot ? (
        <div className="border-t border-line-soft pt-2">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            className="w-full flex items-center justify-between gap-2 py-1 text-left"
          >
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
              How the engine reads you
            </span>
            <span aria-hidden className="text-muted">
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </span>
          </button>
          {expanded ? <div className="pt-3">{expandableSlot}</div> : null}
        </div>
      ) : null}
    </section>
  );
}

function SummaryLine({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "good" | "neutral" | "warn";
}) {
  const toneClass = {
    good: "text-green",
    neutral: "text-ink",
    warn: "text-amber",
  }[tone];
  return (
    <li className="flex items-baseline justify-between gap-3">
      <span className="text-muted text-[13px]">{label}</span>
      <span className={cn("font-mono text-[13px] text-right", toneClass)}>{value}</span>
    </li>
  );
}
