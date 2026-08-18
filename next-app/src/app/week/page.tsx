"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { loadProgram } from "@/lib/data-loader";
import { EmptyStateCard } from "@/components/EmptyStateCard";
import { useStore } from "@/lib/useStore";
import { today as todayISO, iso, cn } from "@/lib/utils";
import { activePhaseFor } from "@/lib/engine/schedule";
import { blocksForDate } from "@/lib/engine/plan-generator";
import { getBlocksForDate, isBlockObjectOn } from "@/lib/engine/block-selectors";
import type { DayLog, Program, RunLog, ScheduledBlock, Store } from "@/lib/schemas";

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
  // Phase D · block-object rebuild — flag gate + block-object read.
  // See dev/active/block-object-rebuild-2026-08-18.md §5.
  const blockObjectOn = useStore((s) => isBlockObjectOn(s.store));
  const scheduledBlocksMap = useStore((s) => s.store.scheduled_blocks);

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
        title="Your week starts once you pick a focus."
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
          <h1 className="text-2xl font-semibold tracking-tight text-strong truncate">Week</h1>
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

      {/* Bug fix 2026-08-18 (#71) — the forward arrow used to shift left when
          the "Now" affordance appeared on offset !== 0. Founder principle:
          containers must not shift. Now the "Now" button occupies a
          permanently-reserved slot (invisible on offset === 0). The row width
          stays constant across all offsets, so arrows and range label never
          move. */}
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
        <button
          type="button"
          onClick={() => setOffset(0)}
          disabled={offset === 0}
          aria-label={offset === 0 ? "Currently on this week" : "Jump to this week"}
          aria-hidden={offset === 0}
          tabIndex={offset === 0 ? -1 : 0}
          className={cn(
            "w-11 h-11 flex items-center justify-center rounded font-mono text-[11px]",
            offset === 0
              ? "invisible pointer-events-none"
              : "hover:bg-surface-2 text-bronze",
          )}
        >
          Now
        </button>
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

      {/* Phase D · block-object legend — appears only when the flag is on
          and 2+ programs are active so the multi-dot per day reads
          without hover. See §0.3 of the plan. */}
      {blockObjectOn && activeSlugs.length >= 2 ? (
        <div className="flex items-center gap-3 flex-wrap font-mono text-[10px] text-muted uppercase tracking-widest">
          <span className="inline-flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-muted/60" aria-hidden /> planned
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green" aria-hidden /> done
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber" aria-hidden /> skipped
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-slate" aria-hidden /> moved
          </span>
        </div>
      ) : null}

      {/* Bug fix 2026-08-18 · founder reported empty Week view on Handstand
          Walk. Cause: the prior top-level bail on `!wt?.week` skipped
          rendering for any program whose weekly_template uses tier-specific
          reference weeks (multi_dimensional strategy — HSW, First Pull-Up)
          or per-week overrides (engine-builder's week_1 / week_2 shape).
          The per-day loop below already handles missing `templateEntry`
          gracefully — no bail needed. */}
      <div className="rounded border border-line bg-surface divide-y divide-line-soft">
          {DAY_NAMES.map((dayName, i) => {
            const dateForDay = new Date(viewedMon);
            dateForDay.setDate(viewedMon.getDate() + i);
            const dateISO = iso(dateForDay);
            const templateEntry = wt?.week?.[i];
            // Legacy day-state readers. Block-object mode overrides these
            // via `blocksTodayByProgram` below, but `skip` / `override` are
            // still consulted for the reason string + line-through styling
            // until Phase F removes the legacy fields.
            const skip = skipped?.[dateISO];
            const override = overrides?.[dateISO];
            // Phase D · block-object per-program read for this day.
            const blocksTodayByProgram: Record<string, ScheduledBlock[]> = {};
            if (blockObjectOn) {
              const blocksForThisDay = getBlocksForDate(
                { scheduled_blocks: scheduledBlocksMap } as Store,
                dateISO,
              );
              for (const b of blocksForThisDay) {
                (blocksTodayByProgram[b.program_slug] ??= []).push(b);
              }
            }
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

            // Phase D · when block-object is on, render one dot per program
            // colored by that program's dominant state on the date. Capped at
            // 4 dots then collapses to "+N" per §0.3 of the plan. Otherwise
            // fall back to the legacy single-status dot.
            const perProgramDots = blockObjectOn
              ? perProgramDayStates(blocksTodayByProgram, activeSlugs, isToday)
              : null;

            return (
              <div
                key={dayName + i}
                className={cn(
                  "px-3 py-3 flex items-start gap-3",
                  isToday && "bg-bronze/8",
                  skip && "opacity-70",
                )}
              >
                {perProgramDots ? (
                  <>
                    <span
                      aria-hidden
                      className="mt-2 flex items-center gap-0.5 flex-shrink-0"
                    >
                      {perProgramDots.dots.slice(0, 4).map((d, idx) => (
                        <span
                          key={idx}
                          className={cn("w-2 h-2 rounded-full", d.className)}
                          title={`${d.programName}: ${d.state}`}
                        />
                      ))}
                      {/* Audit 2026-08-18 (visual-craft) — "+N" bumped
                          from text-[9px] to text-[10px] to respect the
                          tokens.md typography floor. */}
                      {perProgramDots.dots.length > 4 ? (
                        <span className="text-[10px] font-mono text-muted ml-0.5">
                          +{perProgramDots.dots.length - 4}
                        </span>
                      ) : null}
                    </span>
                    {/* Audit 2026-08-18 (a11y P1) — SR-only summary so
                        screen-reader users get the per-track state
                        information the dots convey visually. */}
                    <span className="sr-only">
                      {perProgramDots.dots
                        .map((d) => `${d.programName}: ${d.state}`)
                        .join("; ")}
                    </span>
                  </>
                ) : (
                  <span
                    aria-hidden
                    className={cn("mt-2 w-2 h-2 rounded-full flex-shrink-0", dotColor)}
                  />
                )}
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
                          {contributingProgramCount} tracks
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
                {/* Founder request 2026-08-18 — Week view should show what
                    actually happened, not just what was scheduled. Compact
                    lines for logged runs / classes + a per-lift roll-up
                    when top sets were recorded. Both draw from `dayLog`,
                    which is authoritative for actual work. */}
                {dayLog?.runs?.length ? (
                  <ul className="mt-1 space-y-0.5">
                    {dayLog.runs.map((r, idx) => (
                      <li
                        key={idx}
                        className="text-[12px] font-mono text-green flex items-baseline gap-1.5"
                      >
                        <span aria-hidden>✓</span>
                        <span>
                          {prettyRun(r)}
                          {r.note ? (
                            <span className="text-muted italic font-sans"> · {r.note}</span>
                          ) : null}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : null}
                {(() => {
                  const topLift = topLoggedLift(dayLog);
                  if (!topLift) return null;
                  return (
                    <p className="mt-1 text-[12px] font-mono text-green flex items-baseline gap-1.5">
                      <span aria-hidden>✓</span>
                      <span>{topLift}</span>
                    </p>
                  );
                })()}
                </div>
              </div>
            );
          })}
        </div>

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

/**
 * Phase D · block-object per-program day-state resolver.
 *
 * For each active program on a given date, compute a "dominant state"
 * from that program's scheduled blocks. Multiple blocks per program per
 * day is possible (e.g. strength + accessory) — we pick the loudest
 * signal: skipped > moved > done > amber_downshifted > planned. Returns
 * an ordered array matching activeSlugs so dots stay stable across
 * renders. Programs with no blocks that day are omitted.
 *
 * Dot color mapping matches the legend rendered at the top of the week
 * (see `tokens.md#colors` semantic states + `bronze` for today).
 */
type DayDot = {
  programSlug: string;
  programName: string;
  state: string;
  className: string;
};

function perProgramDayStates(
  blocksByProgram: Record<string, ScheduledBlock[]>,
  activeSlugs: string[],
  isToday: boolean,
): { dots: DayDot[] } {
  const dots: DayDot[] = [];
  for (const slug of activeSlugs) {
    const blocks = blocksByProgram[slug];
    if (!blocks?.length) continue;
    const states = new Set(blocks.map((b) => b.state));
    // Precedence: skipped > moved > done > amber > planned.
    let state: string = "planned";
    if (states.has("skipped")) state = "skipped";
    else if (states.has("moved")) state = "moved";
    else if (states.has("done")) state = "done";
    else if (states.has("amber_downshifted")) state = "amber_downshifted";
    let className: string;
    if (isToday && state === "planned") className = "bg-bronze";
    else if (state === "skipped") className = "bg-amber";
    else if (state === "moved") className = "bg-slate";
    else if (state === "done") className = "bg-green";
    else if (state === "amber_downshifted") className = "bg-amber/60";
    else className = "bg-muted/60";
    dots.push({
      programSlug: slug,
      programName: slug.replace(/-/g, " "),
      state,
      className,
    });
  }
  return { dots };
}

function humanPhaseName(name: string): string {
  return name
    .replace(/\s*\((?:Phase|weeks?|week|sub-goal|dev|internal)\b[^)]*\)\s*$/i, "")
    .trim();
}

/**
 * Compact single-line summary of a logged run/class for the Week view.
 * e.g. "5.2 km run · easy" or "45 min CrossFit class" or "row 2K · 7:35".
 * Matches the info-density budget of the surrounding session names.
 */
function prettyRun(r: RunLog): string {
  const activity =
    r.activity_type === "crossfit_class"
      ? "CrossFit class"
      : r.activity_type === "ski_erg"
        ? "ski erg"
        : (r.activity_type ?? "run");
  const parts: string[] = [];
  if (r.session_type === "2k_test") parts.push(`${activity} · 2K test`);
  else if (r.distance_km != null && r.distance_km > 0) {
    parts.push(`${r.distance_km} km ${activity}`);
  } else if (r.minutes != null && r.minutes > 0) {
    parts.push(`${Math.round(r.minutes)} min ${activity}`);
  } else {
    parts.push(activity);
  }
  if (r.total_seconds != null && r.session_type === "2k_test") {
    parts.push(
      `${Math.floor(r.total_seconds / 60)}:${String(r.total_seconds % 60).padStart(2, "0")}`,
    );
  } else if (r.intensity) {
    parts.push(r.intensity);
  }
  return parts.join(" · ");
}

/**
 * Roll up the day's logged exercises into one "heaviest working set"
 * headline. Nothing if the user logged no sets. Founder request: Week
 * view should show what actually got done, not just what was scheduled.
 */
function topLoggedLift(day: DayLog | undefined): string | null {
  if (!day) return null;
  let best: { name: string; weight: number; reps: number } | null = null;
  for (const [key, entry] of Object.entries(day.exercises)) {
    const sets = entry.sets ?? [];
    for (const s of sets) {
      if (s.weight_kg == null || s.weight_kg <= 0 || s.reps == null || s.reps <= 0) continue;
      if (!best || s.weight_kg > best.weight) {
        const exId = key.split(":")[1] ?? key;
        best = { name: exId.replace(/_/g, " "), weight: s.weight_kg, reps: s.reps };
      }
    }
  }
  if (!best) return null;
  return `${best.name} · ${best.weight} kg × ${best.reps}`;
}
