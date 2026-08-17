"use client";

import { useMemo } from "react";
import { ArrowUp, X } from "lucide-react";
import { useStore } from "@/lib/useStore";
import { evaluateOverperformer } from "@/lib/engine/adapt";
import { hapticTap } from "@/lib/utils";
import { announce } from "@/lib/announce";
import { citationIdForKind } from "@/lib/engine/proposal-citations";
import { CitationRef } from "@/components/citations/CitationRef";
import type { Program } from "@/lib/schemas";

const PROPOSAL_ID_BASE = "tm-bump";

/**
 * A1 (Phase 2). Off-cycle training-max bump proposal. Fires when the engine
 * detects a green streak + "felt strong" signal on a strength program.
 *
 * Renders alongside the other confirm-first proposals for now. Phase 3 (A5)
 * absorbs this into the single ProposalStack + ProposalCard surface.
 */
export function TMBumpProposal({
  program,
  date,
}: {
  program: Program | null | undefined;
  date: string;
}) {
  const store = useStore((s) => s.store);
  const setTM = useStore((s) => s.setTM);
  const dismissProposal = useStore((s) => s.dismissProposal);

  const dismissedFor = store.dismissed_proposals?.[date] ?? [];

  const proposal = useMemo(() => {
    if (!program) return null;
    return evaluateOverperformer(program, store, date);
  }, [program, store, date]);

  if (!proposal) return null;
  const liftsToShow = proposal.lifts.filter(
    (l) => !dismissedFor.includes(`${PROPOSAL_ID_BASE}:${l.exerciseId}`),
  );
  if (liftsToShow.length === 0) return null;

  const acceptAll = () => {
    hapticTap("medium");
    for (const l of liftsToShow) setTM(l.exerciseId, l.newTM);
    const summary = liftsToShow
      .map((l) => `${l.exerciseId} +${l.delta} kg`)
      .join(", ");
    announce(`Training max bumped: ${summary}.`);
  };

  const ignoreAll = () => {
    for (const l of liftsToShow) {
      dismissProposal(date, `${PROPOSAL_ID_BASE}:${l.exerciseId}`);
    }
  };

  const citationId = citationIdForKind("tm_bump");

  return (
    <div
      data-tm-bump-proposal
      className="rounded border border-green/50 border-l-4 border-l-green bg-green/10 p-3 space-y-2"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[10px] uppercase tracking-widest text-green flex items-center gap-1.5">
            <ArrowUp size={12} className="text-green" />
            Signal · headroom detected
          </p>
          <p className="text-[13px] text-ink mt-1 leading-snug">
            <span className="text-muted">Because:</span> {proposal.reason}
          </p>
          <ul className="text-[12px] font-mono text-muted mt-1 space-y-0.5">
            {liftsToShow.map((l) => (
              <li key={l.exerciseId}>
                {l.exerciseId} · {l.currentTM} → {l.newTM} kg (+{l.delta})
              </li>
            ))}
          </ul>
          {citationId ? (
            <div className="mt-1">
              <CitationRef id={citationId} />
            </div>
          ) : null}
        </div>
        <button
          type="button"
          onClick={ignoreAll}
          aria-label="Ignore all"
          className="text-muted hover:text-ink w-9 h-9 -m-2 flex items-center justify-center flex-shrink-0"
        >
          <X size={16} />
        </button>
      </div>
      <div className="flex flex-wrap gap-2 pt-1">
        <button
          type="button"
          onClick={(e) => {
            (e.currentTarget.closest("[data-tm-bump-proposal]") as HTMLElement | null)?.classList.add(
              "pulse-accept",
            );
            acceptAll();
          }}
          className="font-mono text-[11px] uppercase tracking-wider px-3 py-2 rounded bg-bronze text-ground hover:bg-bronze-hover min-h-[44px]"
        >
          Apply bump
        </button>
        <button
          type="button"
          onClick={ignoreAll}
          className="font-mono text-[11px] uppercase tracking-wider px-3 py-2 rounded border border-line text-ink hover:bg-line-soft min-h-[44px]"
        >
          Ignore
        </button>
      </div>
    </div>
  );
}
