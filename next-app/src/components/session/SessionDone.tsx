"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useStore, entrySets } from "@/lib/useStore";
import { countLoggedSets } from "@/lib/set-progress";
import { IN_SESSION_HURT_SCORE, useSessionRegions } from "@/components/session/HurtSheet";
import type { RailExercise } from "@/components/session/DaySession";
import { Button } from "@/components/ui/Button";
import { humanBlockName } from "@/lib/day-format";
import { loadProgram } from "@/lib/data-loader";
import type { Program } from "@/lib/schemas";
import { BestSetCard, DoneLadder, DoneStats, NextSessionCard } from "./done/DoneSections";
import { bestSetOfSession, nextPlanned, sessionTotals } from "./done/session-stats";

export type SessionEnd = "finished" | "stopped";

/** What was actually logged today, per movement. Pure, so Stop ≠ Finish is testable. */
export function summarizeSession(
  rail: RailExercise[],
  logs: Record<string, { exercises?: Record<string, unknown> } | undefined>,
  date: string,
): { movements: { name: string; sets: number }[]; totalSets: number } {
  const movements = rail
    .map((r) => ({
      name: r.exercise.name,
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
    <div className="flex flex-col gap-5 pt-4" data-surface="SessionDone" data-end={end}>
      <h1 className="text-h1 font-semibold tracking-[-0.035em] text-strong leading-none">
        {end === "finished" ? "Done" : "Session stopped"}
      </h1>
      <p className="text-body text-ink">
        {end === "finished"
          ? totalSets > 0
            ? `${totalSets} ${totalSets === 1 ? "set" : "sets"} across ${movements.length} ${movements.length === 1 ? "movement" : "movements"}.`
            : "Nothing logged this time."
          : "Good call. What you logged is saved."}
      </p>
      {finished ? (
        <DoneStats sets={totalSets} movements={movements.length} reps={totals.reps} holdSeconds={totals.holdSeconds} />
      ) : null}
      {best ? <BestSetCard best={best} /> : null}
      {finished && tierId && tiers.length > 1 ? <DoneLadder levels={tiers} activeId={tierId} /> : null}
      {next ? (
        <NextSessionCard
          dayLabel={new Date(next.date + "T12:00:00").toLocaleDateString("en-GB", {
            weekday: "long",
            day: "numeric",
            month: "short",
          })}
          focus={nextFocus ? humanBlockName(nextFocus) : undefined}
        />
      ) : null}
      {movements.length > 0 ? (
        <ul className="rounded-xl border border-line-soft divide-y divide-line-soft">
          {movements.map((m) => (
            <li key={m.name} className="flex justify-between px-3.5 py-3 text-small">
              <span className="text-strong">{m.name}</span>
              <span className="text-caption text-muted">{m.sets} sets</span>
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
      <Button href="/" size="lg" block>
        Back to Today
      </Button>
    </div>
  );
}
