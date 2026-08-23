"use client";

import { useState } from "react";
import { useStore } from "@/lib/useStore";
import { isBlockObjectOn } from "@/lib/engine/block-selectors";
import type { MissedWeekSignal } from "@/lib/engine/missed-week";
import type { Program } from "@/lib/schemas";

const REASONS = ["Ill", "Something hurts", "Just busy"] as const;

/**
 * Design package turn t3, screen 3b ("the week going wrong"), built as a
 * dismissible banner above Plan's day-list rather than replacing it —
 * see dev/active/week-recovery-plan.md for why. Supersedes
 * `MissedSessionPrompt.tsx`'s single-day nudge (README's own reassignment:
 * "Missed yesterday → Plan's broken week").
 *
 * All three options are existing store actions — no new adaptive logic.
 * Reason chips are display-only context passed into the `reason` string,
 * matching the depth `skip.reason` already has everywhere else in the
 * app (shown on the day row, not fed into any engine decision — there is
 * no existing mechanism for that).
 */
export function WeekRecoveryCard({
  program,
  signal,
  onDismiss,
}: {
  program: Program;
  signal: MissedWeekSignal;
  onDismiss: () => void;
}) {
  const skipDay = useStore((s) => s.skipDay);
  const skipWholeDay = useStore((s) => s.skipWholeDay);
  const skipAndShiftWeek = useStore((s) => s.skipAndShiftWeek);
  const skipWholeWeek = useStore((s) => s.skipWholeWeek);
  const store = useStore((s) => s.store);
  const blockObjectOn = isBlockObjectOn(store);

  const [reason, setReason] = useState<(typeof REASONS)[number] | null>(null);
  const [applied, setApplied] = useState<string | null>(null);

  const { missedDates, totalScheduledThisWeek, remainingScheduledCount } = signal;
  const missedCount = missedDates.length;
  const earliestMissed = missedDates[0];

  const apply = (label: string, run: () => void) => {
    run();
    setApplied(label);
  };

  const skipOnly = () =>
    apply("Skipped what's missed", () => {
      for (const d of missedDates) {
        if (blockObjectOn) skipWholeDay(d, reason ?? undefined);
        else skipDay(d, reason ?? undefined);
      }
    });

  const shiftWeek = () =>
    apply("Shifted the week", () => {
      // computeWeekShift cascades every slot from the skipped day onward,
      // so calling this once on the earliest missed date already covers
      // any other missed days later in the week.
      skipAndShiftWeek(earliestMissed, program, reason ?? undefined);
    });

  const pushWeek = () =>
    apply("Pushed the week out", () => {
      skipWholeWeek(earliestMissed, program, reason ?? undefined);
    });

  if (applied) {
    return (
      <div className="rounded border border-line-soft border-l-4 border-l-green bg-green/10 px-3 py-2.5 text-[14px] flex items-center justify-between gap-3">
        <p className="text-strong">
          <span className="font-semibold">{applied}.</span>{" "}
          <span className="text-muted">The plan reads it either way — nothing here is punitive.</span>
        </p>
        <button type="button" onClick={onDismiss} className="text-muted hover:text-ink text-[13px] flex-shrink-0">
          Done
        </button>
      </div>
    );
  }

  const dayWord = missedCount === 1 ? "day" : "days";
  const headline =
    totalScheduledThisWeek > 0
      ? `You've missed ${missedCount} of ${totalScheduledThisWeek} this week.`
      : `You've missed ${missedCount} scheduled ${dayWord} this week.`;

  return (
    <div className="rounded border border-amber/40 bg-amber/10 p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-amber">This week</p>
          <p className="text-[17px] font-semibold text-strong mt-0.5 leading-snug">{headline}</p>
          {remainingScheduledCount > 0 ? (
            <p className="text-[13px] text-muted mt-0.5">
              {remainingScheduledCount} scheduled {remainingScheduledCount === 1 ? "day" : "days"} left.
            </p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          className="text-muted hover:text-ink w-9 h-9 -m-2 flex-shrink-0 flex items-center justify-center"
        >
          ×
        </button>
      </div>

      <p className="text-[13.5px] leading-snug text-muted">
        Nothing here is a failure — the plan reads a missed week the same way it reads a good one. Pick
        whichever of these matches what actually happened.
      </p>

      <div className="space-y-2">
        <button
          type="button"
          onClick={skipOnly}
          className="w-full text-left rounded border border-line-strong bg-surface px-3.5 py-3 hover:bg-line-soft"
        >
          <p className="text-[14.5px] font-semibold text-strong">Skip what&apos;s missed</p>
          <p className="text-[13px] text-muted mt-0.5 leading-snug">
            Marks {missedCount === 1 ? "that day" : `those ${missedCount} days`} skipped. Rest of the week
            runs as scheduled — progression order breaks if you&apos;re on a wave.
          </p>
        </button>
        <button
          type="button"
          onClick={shiftWeek}
          className="w-full text-left rounded border border-bronze/50 bg-bronze/[0.06] px-3.5 py-3 hover:bg-bronze/10"
        >
          <p className="text-[14.5px] font-semibold text-strong">Shift the week</p>
          <p className="text-[13px] text-muted mt-0.5 leading-snug">
            Each remaining session moves up to cover the gap. The last scheduled day this week drops.
            Recommended if you&apos;re mid-wave.
          </p>
        </button>
        <button
          type="button"
          onClick={pushWeek}
          className="w-full text-left rounded border border-line-strong bg-surface px-3.5 py-3 hover:bg-line-soft"
        >
          <p className="text-[14.5px] font-semibold text-strong">Push the week out</p>
          <p className="text-[13px] text-muted mt-0.5 leading-snug">
            Every remaining session this week moves out exactly 7 days. This week becomes a rest week.
          </p>
        </button>
      </div>

      <div>
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted mb-1.5">
          Or tell Terav why — optional
        </p>
        <div className="flex gap-2 flex-wrap">
          {REASONS.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setReason((cur) => (cur === r ? null : r))}
              className={
                "rounded-full px-3.5 py-2 text-[13px] font-medium border " +
                (reason === r
                  ? "border-bronze bg-[rgba(200,150,102,.14)] text-strong"
                  : "border-line-strong bg-surface text-ink")
              }
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded border border-line-soft bg-surface px-3.5 py-3">
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted mb-1">
          What a skipped week does
        </p>
        <p className="text-[13.5px] leading-snug text-ink">
          Nothing punitive. Your training max holds where it is, and the record shows the gap honestly
          rather than silently backfilling it.
        </p>
      </div>
    </div>
  );
}
