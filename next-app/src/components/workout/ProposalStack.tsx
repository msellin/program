"use client";

import { useMemo } from "react";
import { useStore } from "@/lib/useStore";
import { selectProposals } from "@/lib/proposals/select";
import { ProposalCard } from "./ProposalCard";
import type { Program } from "@/lib/schemas";

/**
 * A5 (Phase 3). The single first-class Today surface for all confirm-first
 * proposals. Renders `null` when the engine has nothing to say — the fold
 * collapses; HeroStateCard + the session content take the space back. Never
 * a placeholder.
 *
 * Multi-proposal case: stacked vertically, highest-priority first. Natural
 * scroll; no pager. If persona rerun shows this feels like nag, add pager
 * in a follow-up brief.
 */
export function ProposalStack({ program, date }: { program: Program | null | undefined; date: string }) {
  const store = useStore((s) => s.store);

  const proposals = useMemo(() => {
    if (!program) return [];
    return selectProposals(store, program, date);
  }, [store, program, date]);

  if (proposals.length === 0) return null;

  return (
    <section aria-label="Engine proposals" className="space-y-2">
      {proposals.map((p) => (
        <ProposalCard key={p.id} proposal={p} date={date} />
      ))}
    </section>
  );
}
