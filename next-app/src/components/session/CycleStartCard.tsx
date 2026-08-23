"use client";

import { useState } from "react";
import { useProposalActions } from "@/lib/proposals/useProposalActions";
import { useStore } from "@/lib/useStore";
import { humanizeExerciseId } from "@/lib/humanize-metrics";
import type { Proposal, TMBumpProposalPayload } from "@/lib/schemas";

/**
 * Screen 6c from the Day redesign. The only card in the app allowed to
 * block Start.
 *
 * Trigger (confirmed decision, see dev/active/day-redesign-context.md):
 * a `tm_bump` proposal is pending AND nothing has been logged yet today.
 * There is no "day one of a 5/3/1 cycle" detector in the engine — the
 * README's framing ("your numbers go up... because you cleared every top
 * set last cycle") is reinterpreted as "before you've started lifting,
 * whenever a TM bump is due," which delivers the same rationale (accept
 * the number before it's the weight on the bar) using the proposal
 * engine that already exists (`selectProposals` / `useProposalActions`)
 * instead of new cycle-boundary logic.
 */
export function CycleStartCard({
  proposal,
  date,
}: {
  proposal: Proposal;
  date: string;
}) {
  const bump = proposal as TMBumpProposalPayload;
  const setTM = useStore((s) => s.setTM);
  const { onAccept } = useProposalActions(proposal, date);
  const [adjusting, setAdjusting] = useState(false);
  const [overrides, setOverrides] = useState<Record<string, number>>({});

  const effectiveNewTM = (liftExId: string, fallback: number) => overrides[liftExId] ?? fallback;

  return (
    <div className="rounded border border-slate bg-[rgba(121,184,196,.08)] px-[15px] py-[14px]">
      <p className="font-mono text-[10px] uppercase tracking-[.16em] text-slate mb-[9px]">
        New numbers — your training max goes up
      </p>
      <div className="flex flex-col gap-[9px] mb-[14px]">
        {bump.lifts.map((l) => (
          <div key={l.exerciseId} className="flex items-baseline justify-between gap-3">
            <span className="text-[14.5px] text-ink">{humanizeExerciseId(l.exerciseId)}</span>
            {adjusting ? (
              <span className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() =>
                    setOverrides((o) => ({
                      ...o,
                      [l.exerciseId]: round(effectiveNewTM(l.exerciseId, l.newTM) - 2.5),
                    }))
                  }
                  className="w-8 h-8 rounded border border-line-strong bg-surface-2 text-strong text-[16px]"
                >
                  −
                </button>
                <span className="font-mono text-[14px] text-strong w-14 text-center">
                  {effectiveNewTM(l.exerciseId, l.newTM)} kg
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setOverrides((o) => ({
                      ...o,
                      [l.exerciseId]: round(effectiveNewTM(l.exerciseId, l.newTM) + 2.5),
                    }))
                  }
                  className="w-8 h-8 rounded border border-line-strong bg-surface-2 text-strong text-[16px]"
                >
                  +
                </button>
              </span>
            ) : (
              <span className="text-[15px] font-semibold text-strong">
                {l.currentTM} → <span className="text-green">{l.newTM}</span>{" "}
                <span className="text-[12.5px] font-medium text-muted">kg</span>
              </span>
            )}
          </div>
        ))}
      </div>
      <p className="text-[13px] leading-snug text-ink mb-[13px]">{bump.reason}</p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => {
            // onAccept sets each lift's TM to the proposal's original
            // newTM and dismisses it. Apply overrides AFTER — otherwise
            // onAccept's unconditional setTM would clobber the adjusted
            // value back to the original proposed number.
            onAccept(null);
            if (Object.keys(overrides).length) {
              for (const l of bump.lifts) setTM(l.exerciseId, effectiveNewTM(l.exerciseId, l.newTM));
            }
          }}
          className="flex-1 h-[52px] rounded-[9px] bg-slate text-ground text-[15.5px] font-semibold"
        >
          Use these
        </button>
        <button
          type="button"
          onClick={() => setAdjusting((v) => !v)}
          className="w-28 h-[52px] rounded-[9px] border border-line-strong text-ink text-[15px]"
        >
          {adjusting ? "Done" : "Adjust"}
        </button>
      </div>
    </div>
  );
}

function round(n: number): number {
  return Math.round(n * 2) / 2;
}
