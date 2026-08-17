"use client";

import { useMemo } from "react";
import { useStore } from "@/lib/useStore";
import { assessReintroReadiness } from "@/lib/engine/readiness";
import { today as todayISO, hapticTap } from "@/lib/utils";
import { announce } from "@/lib/announce";
import { citationIdForKind } from "@/lib/engine/proposal-citations";
import { CitationRef } from "@/components/citations/CitationRef";
import type { Program } from "@/lib/schemas";

const PROPOSAL_ID = "reintro-graduation";

// Which phase to advance to when the reintro readiness signal fires. Hip
// program's phase_2 is the 5/3/1 Cycle 1 phase — the natural next.
const NEXT_PHASE_ID = "phase_2_cycle_1";

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
  const advancePhase = useStore((s) => s.advancePhase);

  const dismissedFor = store.dismissed_proposals?.[date] ?? [];

  const result = useMemo(
    () => assessReintroReadiness(store, program, date),
    [store, program, date],
  );

  if (!result.ready) return null;
  if (dismissedFor.includes(PROPOSAL_ID)) return null;

  const nextPhase = program.phases.find((p) => p.id === NEXT_PHASE_ID);
  const canAdvance = !!nextPhase?.starts && !!program.slug;
  const targetName = nextPhase?.name?.replace(/\s*\([^)]*\)\s*$/, "") ?? "next phase";

  return (
    <section
      aria-label="Reintro graduation signal"
      data-readiness-proposal
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
      <ul className="text-[13px] font-mono text-muted space-y-0.5">
        {result.evidence.map((e) => (
          <li key={e.date + e.exerciseId}>
            {e.date} · {e.exerciseId} · {e.weightKg} kg × {e.reps}
            {e.rpe != null ? ` @ RPE ${e.rpe}` : ""} · {e.pctTM}% TM (cap {e.reintroCap} kg)
          </li>
        ))}
      </ul>
      <p className="text-[12px] text-muted">
        Advance now and {targetName} starts today. Hip-flexor / rehab work stays on regardless.
        You can also sit tight and let Phase 2 begin on its scheduled date.
      </p>
      {(() => {
        const citationId = citationIdForKind("readiness_after_layoff");
        return citationId ? <CitationRef id={citationId} /> : null;
      })()}
      <div className="flex flex-wrap gap-2 pt-1">
        {canAdvance ? (
          <button
            type="button"
            onClick={(e) => {
              const originalStart = nextPhase!.starts;
              const orig = new Date(originalStart + "T00:00:00").getTime();
              const now = new Date(todayISO() + "T00:00:00").getTime();
              if (!Number.isFinite(orig) || !Number.isFinite(now)) return;
              const daysToShift = Math.round((now - orig) / 864e5);
              hapticTap("medium");
              (e.currentTarget.closest("[data-readiness-proposal]") as HTMLElement | null)?.classList.add(
                "pulse-accept",
              );
              advancePhase(program.slug!, daysToShift);
              dismissProposal(date, PROPOSAL_ID);
              announce(`Advanced to ${targetName}.`);
            }}
            className="font-mono text-[11px] uppercase tracking-wider px-3 py-2 rounded bg-bronze text-ground hover:bg-bronze-hover"
          >
            Advance to {targetName}
          </button>
        ) : null}
        <button
          type="button"
          onClick={() => dismissProposal(date, PROPOSAL_ID)}
          className="font-mono text-[11px] uppercase tracking-wider px-3 py-2 rounded border border-line hover:bg-line-soft"
        >
          Not yet
        </button>
      </div>
    </section>
  );
}
