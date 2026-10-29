"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useStore, entrySets } from "@/lib/useStore";
import { countLoggedSets, isMadeSet, requiredRowCount } from "@/lib/set-progress";
import { IN_SESSION_HURT_SCORE, useSessionRegions } from "@/components/session/HurtSheet";
import type { RailExercise } from "@/components/session/DaySession";
import { Button } from "@/components/ui/Button";
import { exerciseListName, humanBlockName } from "@/lib/day-format";
import { loadProgram } from "@/lib/data-loader";
import { selectProposals } from "@/lib/proposals/select";
import { lastSessionFor } from "@/lib/engine/history";
import { shortDate } from "@/lib/prescription-line";
import { ProposalCard } from "@/components/workout/ProposalCard";
import type { Program } from "@/lib/schemas";
import { BestSetCard, DoneLadder, DoneStats, NextSessionCard } from "./done/DoneSections";
import { bestSetOfSession, nextPlanned, sessionTotals } from "./done/session-stats";

export type SessionEnd = "finished" | "stopped";

/** What was actually logged today, per movement. Pure, so Stop ≠ Finish is testable. */
export function summarizeSession(
  rail: RailExercise[],
  logs: Record<string, { exercises?: Record<string, unknown> } | undefined>,
  date: string,
): { movements: { key: string; name: string; sets: number }[]; totalSets: number } {
  const movements = rail
    .map((r) => ({
      key: r.key,
      // Variant included: three "Ring row" rows are three different movements.
      name: exerciseListName(r.exercise),
      sets: countLoggedSets(entrySets((logs[date]?.exercises?.[r.key] ?? null) as never), r.isLoadable),
    }))
    .filter((m) => m.sets > 0);
  return { movements, totalSets: movements.reduce((n, m) => n + m.sets, 0) };
}

/**
 * The end of a session. Finish → "Done" with a summary; Stop → "Session
 * stopped" with a symptom prompt. Both end in one button, "Back to Today",
 * so no "Continue" CTA survives either.
 */
export function SessionDone({
  end,
  rail,
  date,
  slug,
}: {
  end: SessionEnd;
  rail: RailExercise[];
  date: string;
  slug: string;
}) {
  const logs = useStore((s) => s.store.logs);
  const store = useStore((s) => s.store);
  const report = useStore((s) => s.reportInSessionSymptom);
  const [recorded, setRecorded] = useState<string | null>(null);
  const regions = useSessionRegions(slug, end === "stopped");
  const { movements, totalSets } = summarizeSession(rail, logs, date);
  const scheduled = useStore((s) => s.store.scheduled_blocks);
  const tierId = useStore((s) => s.store.user_profile?.program_states?.[slug]?.tier);
  const [program, setProgram] = useState<Program | null>(null);
  useEffect(() => {
    let live = true;
    void loadProgram(slug)
      .then((p) => live && setProgram(p as Program))
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [slug]);
  const finished = end === "finished" && totalSets > 0;
  const totals = sessionTotals(rail, logs, date);
  const best = finished ? bestSetOfSession(rail, logs, date) : null;
  const next = nextPlanned(scheduled, slug, date);
  const nextFocus = next ? program?.blocks.find((b) => b.id === next.blockId)?.name : undefined;
  const tiers = program?.plan_tiers?.map((t) => ({ id: t.id, label: t.label })) ?? [];

  return (
    <div
      className="flex flex-col gap-4 pt-4"
      data-surface="SessionDone"
      data-end={end}
    >
      <header className="space-y-1.5">
        <h1 className="text-h1 font-semibold tracking-[-0.035em] text-strong leading-none">
          {end === "finished" ? "Session done" : "Session stopped"}
        </h1>
        {movements.length ? (
          <p className="text-small text-muted">
            {new Date(date + "T12:00:00").toLocaleDateString("en-GB", { weekday: "long" })} ·{" "}
            {movements.map((m) => m.name).join(", ")}
          </p>
        ) : null}
      </header>
      {/* The tiles below already say how much; the sentence only repeated them. */}
      {finished ? null : (
        <p className="text-body text-ink">
          {end === "finished" ? "Nothing logged this time." : "Good call. What you logged is saved."}
        </p>
      )}
      {best ? (
        <BestSetCard
          best={best}
          lastTime={(() => {
            // Today against last time, from the log (round 8, DL/SC).
            const last = lastSessionFor(store, best.exerciseId, date);
            const top = last?.sets.reduce<(typeof last.sets)[number] | null>(
              (a, b) => (a == null || (b.weight_kg ?? 0) > (a.weight_kg ?? 0) ? b : a),
              null,
            );
            return last && top?.weight_kg != null
              ? `Last time · ${shortDate(last.date, date)} · ${top.weight_kg} kg × ${top.reps}`
              : null;
          })()}
        />
      ) : null}
      {/* Every set you logged, as you logged it (round 8): the honest record,
          and it fills what was a dead band on a one-exercise day. */}
      {finished ? (
        <ul className="flex flex-wrap gap-1.5" aria-label="Your sets">
          {rail.flatMap((r) =>
            entrySets((logs[date]?.exercises?.[r.key] ?? null) as never)
              .filter((s) => isMadeSet(s, r.isLoadable))
              .map((s, i) => (
                <li
                  key={`${r.key}:${i}`}
                  className="rounded-full border border-line-soft px-2.5 py-1 text-caption tabular-nums text-ink"
                >
                  {s.seconds != null ? `${s.seconds} s` : r.isLoadable ? `${s.weight_kg} × ${s.reps}` : `${s.reps} reps`}
                </li>
              )),
          )}
        </ul>
      ) : null}
      {finished ? (
        <DoneStats
          sets={totalSets}
          planned={rail.reduce((n, r) => n + requiredRowCount(r), 0)}
          movements={movements.length}
          reps={totals.reps}
          holdSeconds={totals.holdSeconds}
        />
      ) : null}
      {/* What the log changed (round-3 vote). A load change the session earned
          is shown here, with its reason, and only takes effect on Accept —
          the engine proposes, the lifter decides. */}
      {finished && program
        ? (() => {
            const bumps = selectProposals(store, program, date).filter((p) => p.kind === "tm_bump");
            if (bumps.length) return bumps.map((p) => <ProposalCard key={p.id} proposal={p} date={date} />);
            // A quiet day still says what the log did: the number your sets
            // are built from, and that nothing moves without you.
            const tmLift = rail.find(
              (r) => typeof store.training_maxes?.[r.exercise.id] === "number" && movements.some((m) => m.key === r.key),
            );
            if (!tmLift) return null;
            return (
              <section aria-label="Training max" className="rounded-xl border border-line-soft px-3.5 py-3">
                <p className="flex items-baseline justify-between gap-3 text-small text-ink">
                  <span>Training max{rail.filter((r) => typeof store.training_maxes?.[r.exercise.id] === "number").length > 1 ? ` · ${exerciseListName(tmLift.exercise)}` : ""}</span>
                  <span className="flex-shrink-0 font-semibold text-strong tabular-nums">
                    {store.training_maxes[tmLift.exercise.id]} kg · no change
                  </span>
                </p>
                <p className="text-caption text-muted mt-0.5">Changes only when a top set earns it. You decide.</p>
              </section>
            );
          })()
        : null}
      {finished && tierId && tiers.length > 1 ? <DoneLadder levels={tiers} activeId={tierId} /> : null}
      {movements.length > 1 ? (
        <ul className="rounded-xl border border-line-soft divide-y divide-line-soft">
          {movements.map((m) => (
            <li key={m.key} className="flex justify-between gap-3 px-3.5 py-3 text-small">
              <span className="text-strong">{m.name}</span>
              <span className="flex-shrink-0 text-caption text-muted tabular-nums">
                {m.sets} {m.sets === 1 ? "set" : "sets"}
                {(() => {
                  const r = rail.find((x) => x.key === m.key);
                  const b = r ? bestSetOfSession([r], logs, date) : null;
                  return b ? ` · best ${b.label}` : "";
                })()}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
      {end === "stopped" ? (
        <section aria-label="Where did it hurt?" className="space-y-2">
          <p className="text-small text-muted">
            {recorded ? `Recorded — ${recorded}.` : "Where did it hurt? This goes on today’s record."}
          </p>
          {recorded
            ? null
            : regions.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => {
                    report(date, r.id, IN_SESSION_HURT_SCORE);
                    setRecorded(r.label.toLowerCase());
                  }}
                  className="flex min-h-[48px] w-full items-center justify-between rounded-lg border border-line-soft px-3 py-3 text-left text-small"
                >
                  <span>{r.label}</span>
                  <span aria-hidden className="text-muted">›</span>
                </button>
              ))}
        </section>
      ) : null}
      {next ? (
        <NextSessionCard
          dayLabel={new Date(next.date + "T12:00:00").toLocaleDateString("en-GB", {
            weekday: "long",
            day: "numeric",
            month: "short",
          })}
          focus={nextFocus ? humanBlockName(nextFocus).replace(/^(Mon|Tue|Wed|Thu|Fri|Sat|Sun)\s+[—–-]\s+/, "") : undefined}
        />
      ) : null}
      <div className="sticky bottom-[calc(64px+env(safe-area-inset-bottom))] -mx-4 border-t border-line-soft bg-ground px-4 pt-2 pb-2">
        <Button href="/" size="lg" block>
          Back to Today
        </Button>
      </div>
    </div>
  );
}
