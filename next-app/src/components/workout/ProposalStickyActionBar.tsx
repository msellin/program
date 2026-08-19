"use client";

import { useProposalActions } from "@/lib/proposals/useProposalActions";
import { RetestLoggingSheet } from "@/components/workout/RetestLoggingSheet";
import type { Proposal } from "@/lib/schemas";

/**
 * P0-1 — sticky bottom action bar for the top proposal, pinned above
 * the BottomNav (60 px + safe-area) so the confirm-first Accept/Ignore
 * ceremony lands in the thumb zone regardless of scroll position.
 *
 * Only renders for the FIRST proposal in the stack. Non-top proposals
 * keep their inline card buttons. Rationale: users see one primary
 * decision at a time, sub-proposals stay tap-accessible in-place.
 */
export function ProposalStickyActionBar({
  proposal,
  date,
}: {
  proposal: Proposal;
  date: string;
}) {
  const { onAccept, onIgnore, acceptVerb, retestSheetOpen, closeRetestSheet } =
    useProposalActions(proposal, date);

  return (
    <>
      <div
        role="region"
        aria-label="Top proposal actions"
        className="fixed left-0 right-0 z-30 bg-surface/95 backdrop-blur-sm border-t border-line-soft"
        style={{
          bottom: "calc(60px + env(safe-area-inset-bottom))",
        }}
      >
        <div className="mx-auto max-w-md px-3 py-2 flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => onAccept(e.currentTarget)}
            className="flex-1 font-mono text-[11px] uppercase tracking-wider px-3 py-2 rounded bg-bronze text-ground hover:bg-bronze-hover active:bg-bronze-active min-h-[44px]"
          >
            {acceptVerb}
          </button>
          <button
            type="button"
            onClick={onIgnore}
            className="font-mono text-[11px] uppercase tracking-wider px-3 py-2 rounded border border-line text-ink hover:bg-line-soft active:bg-line-soft min-h-[44px]"
          >
            Ignore
          </button>
        </div>
      </div>
      {retestSheetOpen && proposal.kind === "retest_due" ? (
        <RetestLoggingSheet proposal={proposal} onClose={() => closeRetestSheet(true)} />
      ) : null}
    </>
  );
}
