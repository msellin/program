"use client";

import { X, ArrowUp } from "lucide-react";
import { useStore } from "@/lib/useStore";
import { nextEligibleTier, isProposalDismissed } from "@/lib/engine/tier-promotion";
import { hapticTap } from "@/lib/utils";
import { announce } from "@/lib/announce";
import { citationIdForKind } from "@/lib/engine/proposal-citations";
import { CitationRef } from "@/components/citations/CitationRef";
import type { Program } from "@/lib/schemas";

/**
 * Confirm-first tier advancement. Shown on Today and Progress when the user's
 * capability profile qualifies them for a tier above their current one.
 * Modeled on ReadinessProposal — never mutates without an explicit Advance tap.
 */
export function TierAdvanceProposal({ program }: { program: Program | null | undefined }) {
  const store = useStore((s) => s.store);
  const promoteTier = useStore((s) => s.promoteTier);
  const dismissTierProposal = useStore((s) => s.dismissTierProposal);

  if (!program) return null;
  const eligible = nextEligibleTier(program, store.user_profile);
  if (!eligible) return null;
  if (isProposalDismissed(program, store.user_profile, eligible)) return null;

  const tierMeta = program.plan_tiers?.find((t) => t.id === eligible.tier_id);
  const tierLabel = tierMeta?.label ?? eligible.tier_id;

  return (
    <div data-tier-proposal className="rounded border border-green/50 border-l-4 border-l-green bg-green/10 p-3 space-y-2">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[10px] uppercase tracking-widest text-green flex items-center gap-1.5">
            <ArrowUp size={12} className="text-green" />
            Signal · tier gate cleared
          </p>
          <p className="text-[12px] text-muted mt-1 leading-snug">
            Your latest retest clears <span className="text-strong">{tierLabel}</span>&apos;s threshold. Advancing swaps your weekly focus to the next tier&apos;s drills. Prep + recovery blocks stay.
          </p>
          {eligible.rationale ? (
            <p className="font-mono text-[11px] text-muted/80 mt-1 truncate">
              {eligible.rationale}
            </p>
          ) : null}
          {(() => {
            const citationId = citationIdForKind("tier_advance");
            return citationId ? (
              <div className="mt-1">
                <CitationRef id={citationId} />
              </div>
            ) : null;
          })()}
        </div>
        <button
          type="button"
          onClick={() => {
            if (program.slug) {
              dismissTierProposal(
                program.slug,
                `${eligible.tier_id}@${eligible.vars_hash}`,
              );
            }
          }}
          aria-label="Dismiss"
          className="text-muted hover:text-ink w-9 h-9 -m-2 flex items-center justify-center flex-shrink-0"
        >
          <X size={16} />
        </button>
      </div>
      <div className="flex flex-wrap gap-2 pt-1">
        <button
          type="button"
          onClick={(e) => {
            if (!program.slug) return;
            hapticTap("medium");
            (e.currentTarget.closest("[data-tier-proposal]") as HTMLElement | null)?.classList.add(
              "pulse-accept",
            );
            promoteTier(program.slug, eligible.tier_id, "retest");
            announce(`Advanced to ${tierLabel}.`);
          }}
          className="font-mono text-[11px] uppercase tracking-wider px-3 py-2 rounded bg-bronze text-ground hover:bg-bronze-hover min-h-[36px]"
        >
          Advance to {tierLabel}
        </button>
        <button
          type="button"
          onClick={() => {
            if (program.slug) {
              dismissTierProposal(
                program.slug,
                `${eligible.tier_id}@${eligible.vars_hash}`,
              );
            }
          }}
          className="font-mono text-[11px] uppercase tracking-wider px-3 py-2 rounded border border-line text-ink hover:bg-line-soft min-h-[36px]"
        >
          Not yet
        </button>
      </div>
    </div>
  );
}
