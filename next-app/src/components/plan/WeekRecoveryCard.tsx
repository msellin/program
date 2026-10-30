"use client";

import { useState } from "react";
import { useStore } from "@/lib/useStore";
import { isBlockObjectOn } from "@/lib/engine/block-selectors";
import type { MissedWeekSignal } from "@/lib/engine/missed-week";
import type { Program } from "@/lib/schemas";
import { Card } from "@/components/ui/Card";

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
  // Collapsed by default (r23 rescore, all four lenses): open, the card was
  // ~650px and pushed every day row below the fold on the screen meant to
  // show the week.
  const [open, setOpen] = useState(false);
  const [applied, setApplied] = useState<string | null>(null);

  const { missedDates, totalScheduledThisWeek, remainingScheduledCount } = signal;
  const missedCount = missedDates.length;
  const earliestMissed = missedDates[0];

  const apply = (label: string, run: () => void) => {
    run();
    setApplied(label);
  };

  const skipOnly = () =>
    apply("Skipped the unlogged days", () => {
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
      <Card status="green" flush className="px-3 py-2.5 text-small flex items-center justify-between gap-3">
        <p className="text-strong">
          <span className="font-semibold">{applied}.</span>{" "}
          <span className="text-muted">The plan reads it either way — nothing here is punitive.</span>
        </p>
        <button type="button" onClick={onDismiss} className="text-muted hover:text-ink text-caption flex-shrink-0">
          Done
        </button>
      </Card>
    );
  }

  const dayWord = missedCount === 1 ? "day" : "days";
  const headline =
    totalScheduledThisWeek > 0
      ? `${missedCount} of ${totalScheduledThisWeek} not logged this week`
      : `${missedCount} ${dayWord} not logged this week`;
  const left =
    remainingScheduledCount > 0
      ? ` · ${remainingScheduledCount} ${remainingScheduledCount === 1 ? "day" : "days"} left`
      : "";

  if (!open) {
    return (
      <Card status="amber" flush className="px-3 py-2 flex items-center justify-between gap-3">
        <p className="text-small text-strong min-w-0">
          {headline}
          <span className="text-muted">{left}</span>
        </p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-expanded={false}
          className="text-small font-semibold text-strong flex-shrink-0 min-h-11 px-1"
        >
          Adjust the week ›
        </button>
      </Card>
    );
  }

  return (
    <Card status="amber" className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-h3 text-strong leading-snug">{headline}</p>
          <p className="text-caption text-muted mt-0.5">
            Nothing here is a failure. Pick what matches what happened.
          </p>
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

      <div className="space-y-2">
        <button
          type="button"
          onClick={skipOnly}
          className="w-full text-left rounded-lg border border-line-strong bg-surface px-3.5 py-3 hover:bg-line-soft"
        >
          <p className="text-small font-semibold text-strong">Skip the unlogged days</p>
          <p className="text-caption text-muted mt-0.5 leading-snug">
            Marks {missedCount === 1 ? "that day" : `those ${missedCount} days`} skipped. Rest of the week
            runs as scheduled — progression order breaks if you&apos;re on a wave.
          </p>
        </button>
        <button
          type="button"
          onClick={shiftWeek}
          className="w-full text-left rounded-lg border border-bronze/50 bg-bronze/[0.06] px-3.5 py-3 hover:bg-bronze/10"
        >
          <p className="text-small font-semibold text-strong">Shift the week</p>
          <p className="text-caption text-muted mt-0.5 leading-snug">
            Each remaining session moves up to cover the gap. The last scheduled day this week drops.
            Recommended if you&apos;re mid-wave.
          </p>
        </button>
        <button
          type="button"
          onClick={pushWeek}
          className="w-full text-left rounded-lg border border-line-strong bg-surface px-3.5 py-3 hover:bg-line-soft"
        >
          <p className="text-small font-semibold text-strong">Push the week out</p>
          <p className="text-caption text-muted mt-0.5 leading-snug">
            Every remaining session this week moves out exactly 7 days. This week becomes a rest week.
          </p>
        </button>
      </div>

      <div>
        <p className="text-eyebrow uppercase tracking-widest text-muted mb-1.5">
          Or tell Terav why — optional
        </p>
        <div className="flex gap-2 flex-wrap">
          {REASONS.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setReason((cur) => (cur === r ? null : r))}
              className={
                "rounded-full px-3.5 py-2 text-caption font-medium border " +
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

      <p className="text-caption text-muted leading-snug">
        Your training max holds either way, and the record shows the gap as it is.
      </p>
    </Card>
  );
}
