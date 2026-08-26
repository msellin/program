"use client";

import { useState } from "react";
import { humanPhaseName, phaseProgress, programDisplayName, humanBlockName } from "@/lib/day-format";
import { entrySets } from "@/lib/useStore";
import { ProposalCard } from "@/components/workout/ProposalCard";
import { CycleStartCard } from "@/components/session/CycleStartCard";
import { OffPlanSheet } from "@/components/session/OffPlanSheet";
import type { RailExercise, SessionSheet } from "@/components/session/DaySession";
import type { Block, Phase, Program, Proposal, Store } from "@/lib/schemas";

/**
 * Screen 4a (single track) from the Day redesign. Never scrolls past one
 * screen in the common case — the exercise-row list is what compresses if
 * it would, not the hero. See dev/active/day-redesign-plan.md.
 *
 * 4b (concurrent-track picker) is NOT built here: `/session/[slug]` is
 * inherently single-program (the slug narrows to one), so the track-
 * choice screen has no route to live at until the `/` Today tab itself
 * becomes the Brief — that's explicitly out of scope for this pass (see
 * plan). The interference banner + "N tracks scheduled" case is still
 * carried on `/` today, unchanged.
 */
export function BriefView({
  program,
  phase,
  activeDate,
  blocks,
  railExercises,
  store,
  proposals,
  cycleGateProposal,
  onStart,
  onSelectExercise,
  sheet,
  onOpenSheet,
  onCloseSheet,
}: {
  program: Program;
  phase: Phase | null | undefined;
  activeDate: string;
  blocks: Block[];
  railExercises: RailExercise[];
  store: Store;
  proposals: Proposal[];
  cycleGateProposal: Proposal | null;
  onStart: (key?: string) => void;
  onSelectExercise: (key: string) => void;
  sheet: SessionSheet;
  onOpenSheet: (s: SessionSheet) => void;
  onCloseSheet: () => void;
}) {
  const [expandedProposalId, setExpandedProposalId] = useState<string | null>(null);
  const hero = railExercises[0];
  const totalMinutes = blocks.reduce((sum, b) => {
    if (!b.duration_min) return sum;
    const d = Array.isArray(b.duration_min) ? b.duration_min[1] : b.duration_min;
    return sum + d;
  }, 0);
  const exWord = railExercises.length === 1 ? "exercise" : "exercises";
  // "0 exercises · about 40 min" for a threshold row is a count of the
  // wrong thing. When a session prescribes in prose rather than sets, the
  // duration IS the summary.
  const summary =
    railExercises.length === 0 && totalMinutes
      ? `About ${totalMinutes} min`
      : totalMinutes
        ? `${railExercises.length} ${exWord} · about ${totalMinutes} min`
        : `${railExercises.length} ${exWord}`;

  const progressLabel = phase ? humanPhaseName(phase.name) : null;
  const progressDetail = phase ? phaseProgress(phase, activeDate) : null;

  const gateUnresolved = !!cycleGateProposal;

  // README: the Start CTA reads "Continue — Bench press, set 4" once
  // progress exists, never re-announcing "Start" for a session already
  // under way. Mirrors DaySession's own resume-to-first-unfinished-set
  // logic so the label always matches where tapping it actually lands.
  const heroLoggedCount = hero
    ? entrySets(store.logs[activeDate]?.exercises[hero.key] ?? null).filter(
        (s) => s.weight_kg != null && s.reps != null,
      ).length
    : 0;
  // Prescription-only sessions (2026-08-26).
  //
  // Rowing's six blocks author ZERO items — they are described by a `note`
  // and `duration_min`, not by a list of exercises. The Brief only knew how
  // to render a session as exercise rows, so a rowing user saw "0 exercises
  // · about 40 min", an empty "The whole session", and a Start button that
  // started nothing. The prescription was in the data the whole time:
  // block_threshold_row's note is "4×8 min @ ~5-10 sec/500m over 2K pace,
  // 2 min rest. HR 82-88%".
  //
  // Same shape for any block that prescribes work in prose rather than
  // sets — this is not rowing-specific.
  // Any block the set flow cannot represent: run-category work (logged as
  // an activity) or a block that authors no items at all. Both are
  // described in prose, and both were previously invisible.
  const prescriptionBlocks = blocks.filter(
    (b) =>
      ((b.category ?? "strength") === "run" || (b.items?.length ?? 0) === 0) &&
      (b.note ?? "").trim().length > 0,
  );
  // "Log this session" replaces Start only when there is nothing to step
  // through. A mixed day — strength blocks plus a run — keeps Start and
  // shows the run's prescription alongside the exercise rows.
  const isPrescriptionSession = prescriptionBlocks.length > 0 && railExercises.length === 0;

  const startLabel = isPrescriptionSession
    ? "Log this session"
    : !hero
    ? "Start"
    : heroLoggedCount > 0
      ? `Continue — ${hero.exercise.name}, set ${Math.min(heroLoggedCount + 1, hero.rowCount)}`
      : `Start — ${hero.exercise.name}`;

  return (
    <div className="flex flex-col" style={{ minHeight: "calc(100vh - 64px - env(safe-area-inset-bottom))" }}>
      <div className="flex-1 space-y-5">
        <header className="flex items-baseline justify-between gap-3">
          <h1 className="text-[32px] font-bold tracking-[-0.035em] text-strong leading-none">
            {dayName(activeDate)}
          </h1>
          {program.slug ? (
            <span className="font-mono text-[10px] uppercase tracking-[.14em] text-bronze flex-shrink-0">
              {programDisplayName(program, program.slug)}
            </span>
          ) : null}
        </header>
        <p className="text-[13.5px] text-muted -mt-3">{summary}</p>

        {cycleGateProposal ? (
          <CycleStartCard proposal={cycleGateProposal} date={activeDate} />
        ) : null}

        {proposals.length ? (
          <div className="space-y-2">
            {proposals.map((p) =>
              expandedProposalId === p.id ? (
                <ProposalCard key={p.id} proposal={p} date={activeDate} />
              ) : (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setExpandedProposalId(p.id)}
                  className={toneClasses(p.kind) + " w-full text-left rounded border px-3 py-2 text-[13.5px]"}
                >
                  {p.reason}
                </button>
              ),
            )}
          </div>
        ) : null}

        {hero ? (
          <div className="rounded border-2 border-l-bronze border-line-strong bg-surface px-4 py-[15px]">
            <p className="font-mono text-[10px] uppercase tracking-[.16em] text-muted mb-2.5">
              Today&apos;s top set
            </p>
            <p className="text-[16.5px] font-semibold text-strong mb-2 tracking-[-.015em]">
              {hero.exercise.name}
            </p>
            {hero.suggestion ? (
              <>
                <div className="flex items-baseline gap-[7px] mb-2">
                  <span className="text-[40px] leading-none font-semibold tracking-[-.04em] text-strong">
                    {hero.suggestion.top_set.kg}
                  </span>
                  <span className="text-[16px] font-medium text-muted">kg</span>
                  <span className="text-[18px] text-line">×</span>
                  <span className="text-[24px] leading-none font-semibold text-strong">
                    {hero.suggestion.top_set.reps}
                  </span>
                </div>
                {basisLine(hero, store) ? (
                  <p className="text-[14px] leading-snug text-ink">{basisLine(hero, store)}</p>
                ) : null}
              </>
            ) : (
              <p className="text-[14px] text-ink">{hero.rowCount} sets</p>
            )}
          </div>
        ) : null}

        <div>
          <p className="font-mono text-[10px] uppercase tracking-[.16em] text-muted mb-[9px]">
            {isPrescriptionSession ? "Today's session" : "The whole session"}
          </p>
          <div className="space-y-[7px]">
            {prescriptionBlocks.map((b) => (
              <div
                key={b.id}
                className="rounded border border-line-soft bg-surface px-3.5 py-[13px]"
              >
                <p className="text-[15px] font-semibold text-strong tracking-[-.01em] mb-0.5">
                  {humanBlockName(b.name)}
                </p>
                {b.duration_min ? (
                  <p className="font-mono text-[10px] uppercase tracking-[.14em] text-line mb-1">
                    {Array.isArray(b.duration_min)
                      ? `${b.duration_min[0]}–${b.duration_min[1]} min`
                      : `${b.duration_min} min`}
                  </p>
                ) : null}
                <p className="text-[13.5px] leading-snug text-ink">{b.note}</p>
              </div>
            ))}
            {railExercises.map((r) => {
              const entry = store.logs[activeDate]?.exercises[r.key] ?? null;
              const loggedCount = entrySets(entry).filter(
                (s) => s.weight_kg != null && s.reps != null,
              ).length;
              // Not `entry?.done` — the store flips that flag true on the
              // FIRST logged set of any exercise (existing behaviour used
              // elsewhere for a manual "mark done" checkbox), which would
              // tag a 1-of-5 exercise "Done" here. "All rows logged" is
              // the honest signal for this row's tag.
              const isDone = loggedCount >= r.rowCount;
              const isMain = r === hero;
              return (
                <button
                  key={r.key}
                  type="button"
                  onClick={() => onSelectExercise(r.key)}
                  className="w-full flex items-center justify-between gap-3 rounded border border-line-soft bg-surface px-3.5 py-[13px] text-left"
                >
                  <span className="min-w-0">
                    <span className="block text-[15px] font-semibold text-strong tracking-[-.01em] mb-0.5">
                      {r.exercise.name}
                    </span>
                    <span className="block text-[13px] text-ink">
                      {r.rowCount} sets{r.suggestion ? ` · ${r.suggestion.top_set.kg} kg` : ""}
                    </span>
                    {/* A7 (2026-08-26): notes were WRITE-ONLY. Two buried
                        entry points, and no screen ever showed one back —
                        so there was no reason to write one, and the
                        founder's 24 Aug session recorded eight exercises,
                        five sets at RPE 9, and not a single note. The
                        engine mines these for fatigue and pain signals
                        (note-signals.ts), so an invisible note is a lost
                        engine input, not just lost prose. */}
                    {entry?.notes?.trim() ? (
                      <span className="block text-[12.5px] italic text-slate mt-1 line-clamp-2">
                        “{entry.notes.trim()}”
                      </span>
                    ) : null}
                  </span>
                  <span
                    className={
                      "flex-shrink-0 font-mono text-[10px] uppercase tracking-[.1em] " +
                      (isDone ? "text-line" : isMain ? "text-bronze" : "text-muted")
                    }
                  >
                    {isDone ? "Done" : loggedCount > 0 ? "Held" : isMain ? "Main" : ""}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex-shrink-0 border-t border-line-soft pt-2 pb-1 mt-5 space-y-2">
        <button
          type="button"
          onClick={() => onOpenSheet("off-plan")}
          className="w-full flex items-center justify-between gap-2.5 py-0.5 text-left"
        >
          {/* Renamed 2026-08-24. "Off-plan work" bundled two unrelated
              things under one vague label: the program's own accessory
              drills (now behind a flag — the plan already schedules them)
              and activity logging, which is the retest data source for
              four programs. Only the second survives here, so the line
              names it. */}
          <span className="text-[13.5px] text-muted">Log a run, row, or class</span>
          <span className="flex-shrink-0 text-[14px] text-line">›</span>
        </button>
        {progressLabel ? (
          <p className="font-mono text-[10px] uppercase tracking-[.14em] text-muted">
            {progressLabel}
            {progressDetail ? ` · ${progressDetail}` : ""}
          </p>
        ) : null}
        {gateUnresolved ? (
          <p className="font-mono text-[10px] uppercase tracking-[.14em] text-muted">
            Accept the numbers to start
          </p>
        ) : null}
        <button
          type="button"
          disabled={gateUnresolved}
          onClick={() => {
            // A prescription-only session has no sets to step through —
            // the row IS the session, and it is recorded as an activity,
            // which is also where the program's retest metric reads from
            // (`runs[].total_seconds where activity_type == 'row'`).
            // Starting the set flow here opened an empty shell.
            if (isPrescriptionSession) onOpenSheet("off-plan");
            else onStart();
          }}
          className={
            "w-full h-[60px] rounded-[10px] text-[17px] font-semibold tracking-[-.01em] " +
            (gateUnresolved
              ? "bg-surface-2 text-line cursor-not-allowed"
              : "bg-bronze text-ground hover:bg-bronze-hover")
          }
        >
          {startLabel}
        </button>
      </div>

      {sheet === "off-plan" ? (
        <OffPlanSheet program={program} date={activeDate} onClose={onCloseSheet} />
      ) : null}
    </div>
  );
}

function toneClasses(kind: Proposal["kind"]): string {
  if (kind === "day_adjustment_soften") return "border-amber/40 bg-amber/10 text-amber-strong";
  if (kind === "tier_advance" || kind === "readiness_after_layoff") return "border-slate/40 bg-slate/10 text-slate";
  return "border-line-soft bg-surface text-ink";
}

function basisLine(r: RailExercise, store: Store): string | null {
  const tm = store.training_maxes[r.exercise.id];
  if (!tm || !r.suggestion) return null;
  const pct = Math.round((r.suggestion.top_set.kg / tm) * 100);
  if (!Number.isFinite(pct) || pct <= 0) return null;
  return `${pct}% of your ${tm} kg training max`;
}

function dayName(dateISO: string): string {
  const d = new Date(dateISO + "T12:00:00");
  return d.toLocaleDateString("en-GB", { weekday: "long" });
}
