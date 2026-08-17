"use client";

import { useMemo } from "react";
import { useStore } from "@/lib/useStore";
import { daySignals, proposedLoadMultiplier } from "@/lib/engine/note-signals";
import { iso, hapticTap } from "@/lib/utils";
import { announce } from "@/lib/announce";

/**
 * PROPOSAL — not auto-apply.
 *
 * Reads notes signals from the current day and the two prior days, and if any
 * of them warrant a lighter session, renders a banner with an explicit Accept
 * / Not today action. Nothing changes state until the user taps a button.
 *
 * Rehab & mobility exercises are unaffected regardless of the accepted
 * multiplier — the strength `suggestForExercise` restricts scaling to the
 * TM_EXERCISES set. This keeps hip-flexor work consistent by construction.
 */
export function DayAdjustmentProposal({ date }: { date: string }) {
  const store = useStore((s) => s.store);
  const acceptDayAdjustment = useStore((s) => s.acceptDayAdjustment);
  const clearDayAdjustment = useStore((s) => s.clearDayAdjustment);
  const dismissProposal = useStore((s) => s.dismissProposal);

  const accepted = store.day_adjustments?.[date];
  const dismissedFor = store.dismissed_proposals?.[date] ?? [];

  // Look at the past 2 days too so a Sunday padel session influences Monday.
  const signals = useMemo(() => {
    const s = daySignals(store.logs[date]);
    if (s.fatigue === "high" || s.pain) return s;
    const t = new Date(date + "T00:00:00");
    for (let back = 1; back <= 2; back++) {
      const d = new Date(t);
      d.setDate(t.getDate() - back);
      const prev = daySignals(store.logs[iso(d)]);
      if (prev.matches.length > 0) return prev;
    }
    return s;
  }, [store.logs, date]);

  // If the user has already accepted an adjustment for this date, show a small
  // confirmation strip with an undo action instead of the proposal card.
  if (accepted) {
    return (
      <section
        aria-label="Not feeling 100% adjustment"
        className="border border-slate/30 bg-slate/10 rounded-md p-3 flex items-start gap-3"
      >
        <div className="flex-1 min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-widest text-slate mb-1">
            Not feeling 100% · ×{accepted.load_multiplier.toFixed(2)} applied
          </p>
          <p className="text-sm text-ink">{accepted.reason}</p>
          <p className="text-[12px] text-muted mt-1">
            Applies only to today&apos;s barbell suggestions. Rehab &amp; mobility work is unchanged.
          </p>
        </div>
        <button
          type="button"
          onClick={() => clearDayAdjustment(date)}
          className="font-mono text-[11px] uppercase tracking-wider px-2 py-1 rounded border border-line hover:bg-line-soft"
        >
          Undo
        </button>
      </section>
    );
  }

  const proposal = proposedLoadMultiplier(signals);
  if (!proposal) return null;

  // The multiplier applies only to TM_EXERCISES (strength top sets); non-strength
  // sessions ignore it by design. This means CSM's Wed lift day gets a proposal
  // when Tue's Z2 was hard; the proposal is silently no-op on aerobic-only days
  // for pure-aerobic programs — which is fine, the copy still gives the user
  // useful context that the app noticed yesterday's load.

  const proposalId = `load-${proposal.multiplier}`;
  if (dismissedFor.includes(proposalId)) return null;

  return (
    <section
      aria-label="Not feeling 100% proposal"
      data-day-proposal
      className="border border-amber/40 bg-amber/10 rounded-md p-3 space-y-2"
    >
      <p className="font-mono text-[10px] uppercase tracking-widest text-amber">
        Not feeling 100%? · needs your ok
      </p>
      <p className="text-[14px] text-ink leading-snug">
        <span className="text-muted">Because:</span> {proposal.reason}
      </p>
      {signals.matches.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {signals.matches.map((m) => (
            <span
              key={m}
              className="font-mono text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber/20 text-amber"
            >
              {m}
            </span>
          ))}
        </div>
      )}
      <p className="text-[12px] text-muted">
        Rehab &amp; mobility work stays as prescribed regardless of your choice.
      </p>
      <div className="flex flex-wrap gap-2 pt-1">
        <button
          type="button"
          onClick={(e) => {
            hapticTap("medium");
            (e.currentTarget.closest("[data-day-proposal]") as HTMLElement | null)?.classList.add(
              "pulse-accept",
            );
            acceptDayAdjustment(date, proposal.multiplier, proposal.reason, "notes");
            announce(
              `Load adjustment applied: ${Math.round((1 - proposal.multiplier) * 100)}% lighter today.`,
            );
          }}
          className="font-mono text-[11px] uppercase tracking-wider px-3 py-2 rounded bg-amber text-ground hover:bg-amber/90"
        >
          Apply {Math.round((1 - proposal.multiplier) * 100)}% lighter today
        </button>
        <button
          type="button"
          onClick={() => dismissProposal(date, proposalId)}
          className="font-mono text-[11px] uppercase tracking-wider px-3 py-2 rounded border border-line hover:bg-line-soft"
        >
          Not today
        </button>
      </div>
    </section>
  );
}
