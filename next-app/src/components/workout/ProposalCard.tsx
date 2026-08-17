"use client";

import { ArrowUp, X } from "lucide-react";
import { useStore } from "@/lib/useStore";
import { hapticTap, today as todayISO } from "@/lib/utils";
import { announce } from "@/lib/announce";
import { CitationRef } from "@/components/citations/CitationRef";
import type { Proposal } from "@/lib/schemas";

/**
 * A5 (Phase 3). One card per `Proposal` payload. Always renders Accept +
 * Ignore inline — the landing-verb promise stays honest.
 *
 * Kind-specific state mutation happens here (Accept branches on
 * `proposal.kind`), but the outcome audit trail flows through the single
 * `recordProposalOutcome` action.
 */
export function ProposalCard({ proposal, date }: { proposal: Proposal; date: string }) {
  const setTM = useStore((s) => s.setTM);
  const acceptDayAdjustment = useStore((s) => s.acceptDayAdjustment);
  const promoteTier = useStore((s) => s.promoteTier);
  const dismissTierProposal = useStore((s) => s.dismissTierProposal);
  const advancePhase = useStore((s) => s.advancePhase);
  const dismissProposal = useStore((s) => s.dismissProposal);
  const recordProposalOutcome = useStore((s) => s.recordProposalOutcome);

  const onAccept = (e: React.MouseEvent<HTMLButtonElement>) => {
    hapticTap("medium");
    (e.currentTarget.closest("[data-proposal-card]") as HTMLElement | null)?.classList.add(
      "pulse-accept",
    );

    switch (proposal.kind) {
      case "day_adjustment_soften": {
        acceptDayAdjustment(
          proposal.date,
          proposal.multiplier,
          proposal.reason,
          "notes",
          proposal.citationId,
        );
        announce(
          `Load adjustment applied: ${Math.round((1 - proposal.multiplier) * 100)}% lighter today.`,
        );
        break;
      }
      case "readiness_after_layoff": {
        advancePhase(proposal.programSlug, proposal.daysToShift);
        dismissProposal(date, "reintro-graduation");
        announce(`Advanced to ${proposal.targetPhaseName}.`);
        break;
      }
      case "tier_advance": {
        promoteTier(proposal.programSlug, proposal.tierId, "retest");
        announce(`Advanced to ${proposal.tierLabel}.`);
        break;
      }
      case "tm_bump": {
        for (const l of proposal.lifts) setTM(l.exerciseId, l.newTM);
        const summary = proposal.lifts.map((l) => `${l.exerciseId} +${l.delta} kg`).join(", ");
        announce(`Training max bumped: ${summary}.`);
        break;
      }
    }

    recordProposalOutcome(proposal, "accepted", date);
  };

  const onIgnore = () => {
    switch (proposal.kind) {
      case "day_adjustment_soften":
        dismissProposal(date, `load-${proposal.multiplier}`);
        break;
      case "readiness_after_layoff":
        dismissProposal(date, "reintro-graduation");
        break;
      case "tier_advance":
        dismissTierProposal(proposal.programSlug, `${proposal.tierId}@${proposal.varsHash}`);
        break;
      case "tm_bump":
        for (const l of proposal.lifts) dismissProposal(date, `tm-bump:${l.exerciseId}`);
        break;
    }
    recordProposalOutcome(proposal, "ignored", date);
    announce("Ignored.");
  };

  const tone = toneFor(proposal);
  const acceptVerb = acceptVerbFor(proposal);
  const eyebrow = eyebrowFor(proposal);

  return (
    <section
      data-proposal-card
      aria-labelledby={`proposal-${proposal.id}`}
      className={`rounded border ${tone.border} ${tone.borderLeft} ${tone.bg} p-3 space-y-2`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className={`font-mono text-[10px] uppercase tracking-widest ${tone.eyebrow} flex items-center gap-1.5`}>
            {proposal.kind === "tm_bump" || proposal.kind === "tier_advance" ? (
              <ArrowUp size={12} className={tone.eyebrow} />
            ) : null}
            {eyebrow}
          </p>
          <h3 id={`proposal-${proposal.id}`} className="sr-only">
            {eyebrow}
          </h3>
          <p className="text-[13px] text-ink mt-1 leading-snug">
            <span className="text-muted">Because:</span> {proposal.reason}
          </p>
          {proposal.kind === "tm_bump" ? (
            <ul className="text-[12px] font-mono text-muted mt-1 space-y-0.5">
              {proposal.lifts.map((l) => (
                <li key={l.exerciseId}>
                  {l.exerciseId} · {l.currentTM} → {l.newTM} kg (+{l.delta})
                </li>
              ))}
            </ul>
          ) : null}
          {proposal.kind === "day_adjustment_soften" && proposal.matches.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 mt-1">
              {proposal.matches.map((m) => (
                <span
                  key={m}
                  className="font-mono text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber/20 text-amber"
                >
                  {m}
                </span>
              ))}
            </div>
          ) : null}
          {proposal.kind === "readiness_after_layoff" ? (
            <ul className="text-[12px] font-mono text-muted mt-1 space-y-0.5">
              {proposal.evidence.map((e) => (
                <li key={e.date + e.exerciseId}>
                  {e.date} · {e.exerciseId} · {e.weightKg} kg × {e.reps}
                  {e.rpe != null ? ` @ RPE ${e.rpe}` : ""} · {e.pctTM}% TM
                </li>
              ))}
            </ul>
          ) : null}
          {proposal.citationId ? (
            <div className="mt-1">
              <CitationRef id={proposal.citationId} />
            </div>
          ) : null}
        </div>
        <button
          type="button"
          onClick={onIgnore}
          aria-label="Ignore proposal"
          className="text-muted hover:text-ink w-9 h-9 -m-2 flex items-center justify-center flex-shrink-0"
        >
          <X size={16} />
        </button>
      </div>
      <div className="flex flex-wrap gap-2 pt-1">
        <button
          type="button"
          onClick={onAccept}
          className="font-mono text-[11px] uppercase tracking-wider px-3 py-2 rounded bg-bronze text-ground hover:bg-bronze-hover min-h-[44px]"
        >
          {acceptVerb}
        </button>
        <button
          type="button"
          onClick={onIgnore}
          className="font-mono text-[11px] uppercase tracking-wider px-3 py-2 rounded border border-line text-ink hover:bg-line-soft min-h-[44px]"
        >
          Ignore
        </button>
      </div>
    </section>
  );
}

type Tone = {
  border: string;
  borderLeft: string;
  bg: string;
  eyebrow: string;
};

function toneFor(p: Proposal): Tone {
  // Rehab-safety amber left-border; engine-cited bronze/slate; opportunistic slate.
  switch (p.kind) {
    case "day_adjustment_soften":
      return {
        border: "border-amber/40",
        borderLeft: "border-l-4 border-l-amber",
        bg: "bg-amber/10",
        eyebrow: "text-amber",
      };
    case "readiness_after_layoff":
      return {
        border: "border-green/40",
        borderLeft: "border-l-4 border-l-green",
        bg: "bg-green/10",
        eyebrow: "text-green",
      };
    case "tier_advance":
    case "tm_bump":
      return {
        border: "border-slate/40",
        borderLeft: "border-l-4 border-l-slate",
        bg: "bg-slate/10",
        eyebrow: "text-slate",
      };
  }
}

function eyebrowFor(p: Proposal): string {
  switch (p.kind) {
    case "day_adjustment_soften":
      return "Not feeling 100%? · needs your ok";
    case "readiness_after_layoff":
      return "Signal · you look ready to leave reintro";
    case "tier_advance":
      return "Signal · tier gate cleared";
    case "tm_bump":
      return "Signal · headroom detected";
  }
}

function acceptVerbFor(p: Proposal): string {
  switch (p.kind) {
    case "day_adjustment_soften":
      return `Apply ${Math.round((1 - p.multiplier) * 100)}% lighter`;
    case "readiness_after_layoff":
      return `Advance to ${p.targetPhaseName}`;
    case "tier_advance":
      return `Advance to ${p.tierLabel}`;
    case "tm_bump":
      return "Apply bump";
  }
}

// Silence unused-import warning during checkpoint refactors — todayISO stays
// available for downstream date-comparison work.
void todayISO;
