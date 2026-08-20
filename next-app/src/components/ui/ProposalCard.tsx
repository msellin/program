/**
 * ProposalCard (ui/) — v1.1.1 §3.14 generic surface.
 *
 * The Accept/Ignore visual pattern delivering landing's "engine proposes,
 * you Accept or Ignore" promise (landing C2). This primitive is generic;
 * for domain-specific engine proposals (tm_bump, retest_due,
 * day_adjustment_soften, etc.) see `workout/ProposalCard.tsx`, which
 * predates v1.1.1 and continues to render those payload types with
 * their kind-specific evidence blocks.
 *
 * This generic version is for NEW consumers that don't need the domain
 * kind-switch — e.g. "move Tuesday's session," "swap Aerobic slot for
 * Skill work," "add an extra recovery day this week."
 *
 * Layout per §3.14:
 *   - Card at e1 (surface) with a 4px amber left stripe (proposal = state,
 *     not CTA — R2 preserved).
 *   - Title (workout-name adjacent, semibold) + one-line rationale.
 *   - Optional citation chip (bronze mono-caps) opens ExplainSheet with
 *     trigger="proposal-citation".
 *   - Two buttons side-by-side on mobile: Accept (bronze filled) · Ignore
 *     (ghost outline, 1px line-strong). CTA strings locked per §2.13.
 *   - Post-decision state: renders `accepted` or `ignored` with a
 *     StatusPill and an Undo button (confirm-first mechanic — landing
 *     C2 requires the decision be reversible within the session).
 *
 * Compliance: R2 (bronze is Accept; Ignore is ghost), R5 (not a game —
 * a proposal is a factual suggestion, not a challenge), R8 (rationale
 * cites source or signal via ExplainSheet), R12 (never a chat — two
 * buttons + one sheet).
 */

"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { StatusPill } from "@/components/ui/StatusPill";
import { InfoSheet, type ExplainSheetCitation, type ExplainSheetLogSignal } from "@/components/InfoSheet";

export type ProposalCardStatus = "pending" | "accepted" | "ignored";

export type ProposalCardProps = {
  proposalId: string;
  title: string;
  rationale: string;
  /**
   * Optional structured citation. When present, renders a bronze
   * [cited] chip next to the title that opens ExplainSheet with the
   * citation body. Enforces landing C3 "citation affordance visible".
   */
  citation?: ExplainSheetCitation;
  /**
   * Optional log-signal source. When present alongside or instead of
   * `citation`, opens ExplainSheet with the signal body. Enforces
   * §2.11 rule 7 "cite threshold + logSignal, not sentiment."
   */
  logSignal?: ExplainSheetLogSignal;
  onAccept: () => void;
  onIgnore: () => void;
  /** Optional undo handler — restores status to `pending`. */
  onUndo?: () => void;
  status?: ProposalCardStatus;
  className?: string;
};

export function ProposalCard({
  proposalId,
  title,
  rationale,
  citation,
  logSignal,
  onAccept,
  onIgnore,
  onUndo,
  status = "pending",
  className,
}: ProposalCardProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const canExplain = Boolean(citation || logSignal);

  return (
    <section
      data-proposal-card
      data-proposal-id={proposalId}
      aria-labelledby={`proposal-${proposalId}-title`}
      className={cn(
        // Amber left stripe (proposal = state, not CTA). e1 fill.
        "rounded-md border border-amber/40 border-l-4 border-l-amber bg-surface p-3 space-y-2",
        className,
      )}
    >
      <header className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1 space-y-1">
          <h3
            id={`proposal-${proposalId}-title`}
            className="text-[15px] font-semibold text-strong leading-snug"
          >
            {title}
          </h3>
          <p className="text-[14px] text-ink leading-snug">
            <span className="text-muted">Because: </span>
            {rationale}
          </p>
        </div>
        {canExplain ? (
          <span
            className="font-mono text-[10px] uppercase tracking-widest text-bronze whitespace-nowrap"
            aria-hidden
          >
            cited
          </span>
        ) : null}
      </header>

      {canExplain ? (
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          className={cn(
            "font-mono text-[11px] uppercase tracking-wider text-slate hover:text-ink active:text-strong",
            "focus-visible:outline focus-visible:outline-2 focus-visible:outline-bronze focus-visible:outline-offset-2",
            // Batch 36 P0 (visual-craft audit) — 44×44 tap target per §2.0.
            "min-h-11 py-1 px-2 -mx-2 rounded inline-flex items-center",
          )}
          aria-label={`Why ${title}?`}
        >
          Why this? →
        </button>
      ) : null}

      {status === "pending" ? (
        <div className="flex gap-2 pt-1">
          {/* Accept — bronze filled, primary. String locked per §2.13
              row 7 vocabulary. */}
          <button
            type="button"
            onClick={onAccept}
            className={cn(
              "flex-1 font-mono text-[11px] font-semibold uppercase tracking-wider",
              "rounded bg-bronze text-ground hover:bg-bronze-hover active:bg-bronze-active",
              "min-h-[44px] px-3 py-2",
              "focus-visible:outline focus-visible:outline-2 focus-visible:outline-strong focus-visible:outline-offset-2",
            )}
          >
            Accept
          </button>
          {/* Ignore — ghost outline. Slate line-strong border. NEVER
              bronze (R2 preserved). */}
          <button
            type="button"
            onClick={onIgnore}
            className={cn(
              "flex-1 font-mono text-[11px] font-semibold uppercase tracking-wider",
              "rounded border border-line-strong text-ink hover:bg-line-soft",
              "min-h-[44px] px-3 py-2",
              "focus-visible:outline focus-visible:outline-2 focus-visible:outline-bronze focus-visible:outline-offset-2",
            )}
          >
            Ignore
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-2 pt-1">
          <StatusPill
            label={status === "accepted" ? "Accepted" : "Ignored"}
            tone={status === "accepted" ? "green" : "muted"}
          />
          {onUndo ? (
            <button
              type="button"
              onClick={onUndo}
              className={cn(
                "font-mono text-[11px] uppercase tracking-wider text-slate hover:text-ink",
                "focus-visible:outline focus-visible:outline-2 focus-visible:outline-bronze focus-visible:outline-offset-2",
                "min-h-[44px] px-2",
              )}
            >
              Undo
            </button>
          ) : null}
        </div>
      )}

      {sheetOpen ? (
        <InfoSheet
          title={`Why ${title}?`}
          trigger="proposal-citation"
          citation={citation}
          logSignal={logSignal}
          onClose={() => setSheetOpen(false)}
        >
          <p>{rationale}</p>
        </InfoSheet>
      ) : null}
    </section>
  );
}
