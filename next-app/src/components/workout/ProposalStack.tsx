"use client";

import { useMemo } from "react";
import { useStore } from "@/lib/useStore";
import { selectProposals } from "@/lib/proposals/select";
import { ProposalCard } from "./ProposalCard";
import { ProposalStickyActionBar } from "./ProposalStickyActionBar";
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

  // Reserve minimum vertical space while sync is settling so HeroStateCard
  // below doesn't jump down when the first proposal mounts. Once syncStable
  // is true AND no proposals exist, collapse to null (the common case) —
  // that collapse is a small shift only for the 0-proposal branch and
  // eliminates the larger shift for the with-proposal branch. Net CLS
  // 0.08-0.15 → 0.00-0.02. P0-3 in dev/audits/app/2026-08-19-master-task-list.md.
  if (!syncStable) {
    return <div aria-hidden className="min-h-[120px]" />;
  }
  if (proposals.length === 0) return null;

  // P0-1 (Batch 17): top proposal's verbs live in the sticky bottom bar
  // (thumb-reach). Non-top proposals keep inline buttons.
  //
  // P0-5 (Batch 26): the pb-20 (80 px) reserve wasn't enough — the sticky
  // bar (~56 px) sits above BottomNav (60 px) + safe-area, so total
  // reserved footprint is ~120 px + safe-area. Bumped to match so the
  // last inline card's Accept/Ignore buttons never sit under the sticky
  // bar. Also caps pb at pb-32 on small screens where safe-area is 0
  // to avoid gratuitous whitespace.
  const [topProposal, ...rest] = proposals;
  return (
    <>
      <section
        aria-label="Engine proposals"
        className="space-y-3"
        style={{ paddingBottom: "calc(128px + env(safe-area-inset-bottom))" }}
      >
        <ProposalCard proposal={topProposal} date={date} showInlineActions={false} />
        {rest.map((p) => (
          <ProposalCard key={p.id} proposal={p} date={date} />
        ))}
      </section>
      <ProposalStickyActionBar proposal={topProposal} date={date} />
    </>
  );
}
