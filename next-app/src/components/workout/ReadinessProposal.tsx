"use client";

import { useMemo } from "react";
import { useStore } from "@/lib/useStore";
import { assessReintroReadiness } from "@/lib/engine/readiness";
import type { Program } from "@/lib/schemas";

const PROPOSAL_ID = "reintro-graduation";

/**
 * Informational banner: shows only when the athlete has two qualifying sessions
 * above the 80% TM reintro cap at RPE ≤ 7 with no red/amber days in between.
 *
 * This banner does NOT advance the phase itself — phase advancement is still
 * user-initiated (through skip / move flows, or a future explicit action).
 * Rendering the readiness state visibly is enough for the user to make the
 * call; auto-advancing would violate the confirm-first rule.
 */
export function ReadinessProposal({
  program,
  date,
}: {
  program: Program;
  date: string;
}) {
  const store = useStore((s) => s.store);
  const dismissProposal = useStore((s) => s.dismissProposal);

  const dismissedFor = store.dismissed_proposals?.[date] ?? [];

  const result = useMemo(
    () => assessReintroReadiness(store, program, date),
    [store, program, date],
  );

  if (!result.ready) return null;
  if (dismissedFor.includes(PROPOSAL_ID)) return null;

  return (
    <section
      aria-label="Reintro graduation signal"
      className="border border-green/40 bg-green/10 rounded-md p-3 space-y-2"
    >
      <p className="font-mono text-[10px] uppercase tracking-widest text-green">
        Signal · you look ready to leave reintro
      </p>
      <p className="text-[14px] text-ink leading-snug">
        Two straight sessions above 80% TM at RPE ≤ 7 with no red/amber days. Mechanically
        you&apos;re done with Phase 1. Advancing to Cycle 1 is a call to make deliberately —
        not something the app will do behind your back.
      </p>
      <ul className="text-[12.5px] font-mono text-muted space-y-0.5">
        {result.evidence.map((e) => (
          <li key={e.date + e.exerciseId}>
            {e.date} · {e.exerciseId} · {e.weightKg} kg × {e.reps}
            {e.rpe != null ? ` @ RPE ${e.rpe}` : ""} · {e.pctTM}% TM (cap {e.reintroCap} kg)
          </li>
        ))}
      </ul>
      <p className="text-[12px] text-muted">
        When you&apos;re ready, either wait for Phase 2&apos;s natural start or talk to the coach.
        Hip-flexor / rehab work stays on regardless.
      </p>
      <div className="flex flex-wrap gap-2 pt-1">
        <button
          type="button"
          onClick={() => dismissProposal(date, PROPOSAL_ID)}
          className="font-mono text-[11.5px] uppercase tracking-wider px-3 py-2 rounded border border-line hover:bg-line-soft"
        >
          Got it
        </button>
      </div>
    </section>
  );
}
