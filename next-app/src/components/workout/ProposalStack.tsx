"use client";

import { useEffect, useMemo, useState } from "react";
import { useStore } from "@/lib/useStore";
import { announce } from "@/lib/announce";
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
  // synchronously but the remote row lands ~200-500ms later. Rendering
  // proposals before the remote sync lands causes content below to shift
  // when the first real proposal mounts. Gate on `updated_at > 0` — either
  // the user has local data (any real store has updated_at) or sync landed.
  // On a fresh signup, updated_at stays 0 briefly; that's fine — no shift,
  // Day1EmptyState owns the fold anyway.
  const syncStable = (store.updated_at ?? 0) > 0;

  /**
   * Undo affordance (2026-09-11).
   *
   * Confirm-first means the user is the one who decides — and until now that
   * decision was one-way. There was no undo anywhere on the stack, and
   * `recordProposalOutcome` had shipped with the undo it was written for
   * missing, because nothing recorded a "before" to restore.
   *
   * Shown only when the last accept is genuinely reversible, so the offer is
   * never made and then refused. Six seconds, then it goes: an undo that
   * lingers reads as an invitation to second-guess a decision already made,
   * and the accept itself is repeatable from tomorrow's proposal anyway.
   *
   * `role="status"` rather than `alert` — this is a confirmation with an
   * option attached, not an error, and `alert` interrupts a screen reader
   * mid-sentence.
   */
  const undoLast = useStore((s) => s.undoLastProposalOutcome);
  const lastReversible = useStore((s) => {
    const h = s.store.proposal_history ?? [];
    for (let i = h.length - 1; i >= 0; i--) {
      if (h[i].outcome === "accepted" && h[i].reversal && !h[i].undone_at) return h[i];
    }
    return undefined;
  });
  const [undoVisible, setUndoVisible] = useState(false);
  const lastAt = lastReversible?.at;
  useEffect(() => {
    if (!lastAt) return;
    // Only for an accept that just happened — a reversible entry from last
    // week should not raise a toast when the component mounts.
    if (Date.now() - lastAt > 6000) return;
    setUndoVisible(true);
    const timer = setTimeout(() => setUndoVisible(false), 6000 - (Date.now() - lastAt));
    return () => clearTimeout(timer);
  }, [lastAt]);

  const undoToast = undoVisible ? (
    <div
      role="status"
      className="flex items-center justify-between gap-3 rounded border border-line-soft bg-surface px-3 py-2 text-sm"
    >
      <span className="text-ink">Applied.</span>
      <button
        type="button"
        onClick={() => {
          const what = undoLast();
          setUndoVisible(false);
          announce(what ? `Undone — ${what} put back.` : "Nothing to undo.");
        }}
        className="min-h-[44px] px-2 font-mono text-[11px] uppercase tracking-wider text-bronze"
      >
        Undo
      </button>
    </div>
  ) : null;

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
  // Render the toast even with an empty stack: accepting the LAST proposal
  // collapses the stack, which is precisely the moment the undo is wanted.
  if (proposals.length === 0) return undoToast;

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
      {undoToast}
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
