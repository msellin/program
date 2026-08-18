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
  // CLS mitigation (P0 B4 fix, 2026-08-17): the store hydrates locally
  // synchronously but the remote KV blob lands ~200-500ms later. Rendering
  // proposals before the remote sync lands causes content below to shift
  // when the first real proposal mounts. Gate on `updated_at > 0` — either
  // the user has local data (any real store has updated_at) or sync landed.
  // On a fresh signup, updated_at stays 0 briefly; that's fine — no shift,
  // Day1EmptyState owns the fold anyway.
  const syncStable = (store.updated_at ?? 0) > 0;

  const proposals = useMemo(() => {
    if (!program || !syncStable) return [];
    return selectProposals(store, program, date);
  }, [store, program, date, syncStable]);

  if (proposals.length === 0) return null;

  return (
    <section aria-label="Engine proposals" className="space-y-3">
      {proposals.map((p) => (
        <ProposalCard key={p.id} proposal={p} date={date} />
      ))}
    </section>
  );
}
