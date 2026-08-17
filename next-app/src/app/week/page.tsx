"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { loadProgram } from "@/lib/data-loader";
import { EmptyStateCard } from "@/components/EmptyStateCard";
import { useStore } from "@/lib/useStore";
import { today as todayISO, iso, cn } from "@/lib/utils";
import { activePhaseFor } from "@/lib/engine/schedule";
import { blocksForDate } from "@/lib/engine/plan-generator";
import type { Program } from "@/lib/schemas";

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

/**
 * How far ahead / behind Week lets you jump.
 *
 * Design call: we know exactly what's scheduled for the next few weeks
 * because phase dates are baked into program.json. But real training changes
 * — a skip cascades, life happens, the engine will propose adjustments after
 * cycles, and the plan itself will be revised as milestones hit or slip.
 *
 * So we let the user see roughly one cycle ahead / behind, not the full year.
 * If they want the whole timeline they can consult the milestones on Progress.
 */
const FUTURE_WEEKS = 6;
const PAST_WEEKS = 12;

type Wt = {
  week?: Array<{ day: string; session: string; conditioning?: string }>;
  principles?: string[];
  note?: string;
};

export default function WeekPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [offset, setOffset] = useState(0);
  const hydrated = useStore((s) => s.hydrated);
  const skipped = useStore((s) => s.store.skipped);
  const overrides = useStore((s) => s.store.scheduled_overrides);
  const logs = useStore((s) => s.store.logs);
  const userProfile = useStore((s) => s.store.user_profile);
  const primarySlug = useStore((s) => s.store.user_profile?.active_program_id);
  const activeProgramIds = useStore((s) => s.store.user_profile?.active_program_ids);

  const activeSlugs: string[] = activeProgramIds && activeProgramIds.length
    ? primarySlug
      ? [primarySlug, ...activeProgramIds.filter((s) => s !== primarySlug)]
      : activeProgramIds
    : primarySlug
      ? [primarySlug]
      : [];
  const activeSlugsKey = activeSlugs.join("|");

  useEffect(() => {
    if (!activeSlugs.length) {
      // No program picked — don't fall back to the founder's default. Render
      // the empty state below instead of leaking anterior-hip's schedule.
      setPrograms([]);
      return;
    }
    void Promise.all(activeSlugs.map((s) => loadProgram(s))).then(setPrograms);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSlugsKey]);

  const program = programs[0] ?? null;

  if (!hydrated) return <div className="mt-8 text-sm text-muted">Loading…</div>;
  if (!activeSlugs.length) {
    return (
      <EmptyStateCard
        title="Pick your focus."
        body="The weekly rhythm shows up here once you pick a program — one session per row, colored by domain, with skipped-day cascade visible at a glance."
        cta={{ href: "/programs/", label: "Browse programs" }}
      />
    );
  }
  if (!program) return <div className="mt-8 text-sm text-muted">Loading…</div>;

  const wt = program.weekly_template as Wt | undefined;

  const now = new Date(todayISO() + "T00:00:00");
  const jsDow = now.getDay();
  const daysBackToMon = (jsDow + 6) % 7;
  const thisMon = new Date(now);
  thisMon.setDate(now.getDate() - daysBackToMon);
  const viewedMon = new Date(thisMon);
  viewedMon.setDate(thisMon.getDate() + offset * 7);

  const rangeLabel = `${viewedMon.toLocaleDateString("en-GB", { day: "numeric", month: "short" })} → ${
    new Date(viewedMon.getTime() + 6 * 864e5).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
    })
  }`;

  // Determine the dominant phase for the viewed week (use Mon; falls back to sample days if unset).
  const weekPhase = activePhaseFor(program, iso(viewedMon), userProfile);

  const atFutureEdge = offset >= FUTURE_WEEKS;
  const atPastEdge = offset <= -PAST_WEEKS;

  return (
    <div className="space-y-6 pt-4">
      <header className="flex items-baseline justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-3xl font-semibold tracking-tight truncate">Week</h1>
          <p className="mt-1 text-[13px] text-muted">
            The 7-day rhythm, with your skips and moves applied.
          </p>
        </div>
        <a
          href="/programs"
          className="font-mono text-[11px] uppercase tracking-wider px-3 py-2 rounded border border-line text-muted hover:text-ink hover:bg-line-soft min-h-[36px] whitespace-nowrap"
        >
          Programs
        </a>
      </header>

      <div className="flex items-center gap-2 rounded border border-line bg-surface p-1">
        <button
          type="button"
          onClick={() => setOffset(offset - 1)}
          disabled={atPastEdge}
          aria-label="Previous week"
          className="w-11 h-11 flex items-center justify-center rounded hover:bg-surface-2 text-muted hover:text-ink disabled:opacity-30 disabled:cursor-not-allowed"
        >
          ‹
        </button>
        <div className="flex-1 text-center">
          <p className="text-[14px] font-semibold text-strong leading-tight">{rangeLabel}</p>
          <p className="mono-caps mt-0.5">
            {offset === 0
              ? "This week"
              : offset === 1
                ? "Next week"
                : offset === -1
                  ? "Last week"
                  : `${offset > 0 ? "+" : ""}${offset} weeks`}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOffset(offset + 1)}
          disabled={atFutureEdge}
          aria-label="Next week"
          className="w-11 h-11 flex items-center justify-center rounded hover:bg-surface-2 text-muted hover:text-ink disabled:opacity-30 disabled:cursor-not-allowed"
        >
          ›
        </button>
        {offset !== 0 ? (
          <button
            type="button"
            onClick={() => setOffset(0)}
            aria-label="Jump to this week"
            className="w-11 h-11 flex items-center justify-center rounded hover:bg-surface-2 text-bronze font-mono text-[11px]"
          >
            Now
          </button>
        ) : null}
      </div>

      {weekPhase ? (
        <div className="rounded border border-line-soft border-l-4 border-l-slate bg-surface px-3 py-2 text-[13px]">
          <span className="font-semibold text-strong">
            {humanPhaseName(weekPhase.name)}
          </span>
          {weekPhase.goal ? <span className="text-muted"> · {weekPhase.goal}</span> : null}
        </div>
      ) : (
        <div className="rounded border border-line-soft border-l-4 border-l-slate bg-surface px-3 py-2 text-[13px] text-muted">
          {program.slug === "anterior-hip-rebuild"
            ? "No phase covers this week — either before the program starts or in the Phase 4→5 light window."
            : "No phase covers this week — you're looking at a date before the program starts or after its final phase."}
        </div>
      )}

      {atFutureEdge ? (
        <p className="text-[13px] text-muted italic">
          Looking further ahead than {FUTURE_WEEKS} weeks isn&apos;t useful — the plan will have
          adapted by then. See milestones on Progress for the year-long shape.
        </p>
      ) : null}

      {!wt?.week ? (
        <p className="text-sm text-muted">No weekly template.</p>
      ) : (
        <div className="rounded border border-line bg-surface divide-y divide-line-soft">
          {DAY_NAMES.map((dayName, i) => {
            const dateForDay = new Date(viewedMon);
            dateForDay.setDate(viewedMon.getDate() + i);
            const dateISO = iso(dateForDay);
            const templateEntry = wt.week?.[i];
            const skip = skipped?.[dateISO];
            const override = overrides?.[dateISO];
            const isToday = dateISO === todayISO();
            const dayLog = logs?.[dateISO];
            const doneCount = dayLog
              ? Object.values(dayLog.exercises).filter((e) => e.done).length
              : 0;
            const totalPrescribed = dayLog
              ? Object.keys(dayLog.exercises).length
              : 0;
            const complianceRatio =
              totalPrescribed > 0 ? doneCount / totalPrescribed : 0;
            const dayPhase = activePhaseFor(program, dateISO, userProfile);
            const isPast = dateISO < todayISO();

            // Per-day phase-correct block list — iterated over every active
            // program. Blocks get tagged with their source program so the row
            // can show a "×N programs" hint when multiple contribute.
            let displayBlocks: { id: string; name: string; programSlug?: string }[];
            let displayLabel: string;
            let contributingProgramCount = 0;
            if (override) {
              displayBlocks = override.blocks
                .map((id) => program.blocks.find((b) => b.id === id))
                .filter((b): b is NonNullable<typeof b> => !!b)
                .map((b) => ({ id: b.id, name: b.name }));
              displayLabel = "Moved-in session";
              contributingProgramCount = displayBlocks.length ? 1 : 0;
            } else {
              const perProgram = programs.map((p) => ({
                slug: activeSlugs[programs.indexOf(p)],
                blocks: blocksForDate(p, userProfile, activePhaseFor(p, dateISO, userProfile), dateISO),
              }));
              contributingProgramCount = perProgram.filter((g) => g.blocks.length > 0).length;
              displayBlocks = perProgram.flatMap((g) =>
                g.blocks.map((b) => ({ id: b.id, name: b.name, programSlug: g.slug })),
              );
              displayLabel = displayBlocks.length ? "" : "Rest / accessory day";
            }

            const names = displayBlocks.map((b) => b.name).join(" + ");
            const isRest = displayBlocks.length === 0 && !override;

            // Pick a single status the leading dot represents. Priority order picks
            // the most action-relevant state; the rest goes into the subline text.
            // TrainingPeaks-style compliance colouring: partial completion gets
            // its own shade, missed-past-day gets muted red.
            const status:
              | "today"
              | "skipped"
              | "moved"
              | "logged-full"
              | "logged-partial"
              | "missed"
              | "rest"
              | "planned" =
              isToday
                ? "today"
                : skip
                  ? "skipped"
                  : override
                    ? "moved"
                    : doneCount > 0
                      ? complianceRatio >= 1
                        ? "logged-full"
                        : "logged-partial"
                      : isRest
                        ? "rest"
                        : isPast && !isRest && totalPrescribed === 0 && displayBlocks.length > 0
                          ? "missed"
                          : "planned";
            const dotColor = {
              today: "bg-bronze",
              skipped: "bg-amber",
              moved: "bg-slate",
              "logged-full": "bg-green",
              "logged-partial": "bg-green/50",
              missed: "bg-red/60",
              rest: "bg-line",
              planned: "bg-muted/60",
            }[status];

            return (
              <div
                key={dayName + i}
                className={cn(
                  "px-3 py-3 flex items-start gap-3",
                  isToday && "bg-bronze/8",
                  skip && "opacity-70",
                )}
              >
                <span
                  aria-hidden
                  className={cn("mt-2 w-2 h-2 rounded-full flex-shrink-0", dotColor)}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-3">
                    <div className="font-semibold flex items-baseline gap-2 flex-wrap">
                      <span>{dayName}</span>
                      <span className="font-mono text-[11px] text-muted font-normal">
                        {dateForDay.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                      </span>
                      {doneCount > 0 && !isToday ? (
                        <span className="text-[11px] text-green font-mono font-normal">
                          · {doneCount} logged
                        </span>
                      ) : null}
                      {contributingProgramCount > 1 ? (
                        <span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber/20 text-amber font-normal">
                          {contributingProgramCount} programs
                        </span>
                      ) : null}
                    </div>
                    <span className="font-mono text-[11px] text-muted text-right">
                      {isRest ? "rest" : names ? "" : "—"}
                    </span>
                  </div>
                  <p
                    className={cn(
                      "text-[13px] mt-1",
                      skip ? "line-through text-muted" : "text-muted",
                    )}
                  >
                    {names || displayLabel}
                  </p>
                {override?.reason ? (
                  <p className="text-[12px] text-slate italic mt-1">↳ {override.reason}</p>
                ) : null}
                {skip ? (
                  <p className="text-[12px] text-muted italic mt-1">
                    Skipped{skip.reason ? `: ${skip.reason}` : ""}
                    {skip.moved_to ? ` · moved to ${skip.moved_to}` : ""}
                  </p>
                ) : null}
                {templateEntry?.conditioning && !skip && !override ? (
                  <p className="text-[12px] text-muted italic mt-1">{templateEntry.conditioning}</p>
                ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {wt?.principles?.length ? <RulesAccordion principles={wt.principles} /> : null}
    </div>
  );
}

function RulesAccordion({ principles }: { principles: string[] }) {
  const [open, setOpen] = useState(false);
  return (
    <section>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="inline-flex items-center gap-1.5 text-[13px] text-slate hover:text-ink"
      >
        <span aria-hidden>{open ? "▾" : "▸"}</span>
        {open ? "Hide" : "Show"} rules of the week
      </button>
      {open ? (
        <ul className="mt-2 rounded border border-line bg-surface p-3 space-y-2 list-disc pl-6 text-sm">
          {principles.map((p, i) => (
            <li key={i}>{p}</li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

function humanPhaseName(name: string): string {
  return name
    .replace(/\s*\((?:Phase|weeks?|week|sub-goal|dev|internal)\b[^)]*\)\s*$/i, "")
    .trim();
}
