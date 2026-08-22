"use client";

import { useState } from "react";
import { useStore } from "@/lib/useStore";
import { hapticTap } from "@/lib/utils";
import { playConfirm } from "@/lib/sound";
import { announce } from "@/lib/announce";
import type { Proposal } from "@/lib/schemas";

/**
 * P0-1 — Accept/Ignore handler extraction so `<ProposalCard>` (inline
 * verbs on non-top cards) and `<ProposalStickyActionBar>` (bottom-of-
 * viewport verb for the top proposal) can share logic without
 * duplicating the switch/case.
 *
 * The pulse-accept class is added by the button's `onClick` handler on
 * the DOM node itself (via `pulseTarget` param), because the animation
 * must run before store mutation to keep INP low.
 */
export function useProposalActions(proposal: Proposal, date: string) {
  const setTM = useStore((s) => s.setTM);
  const acceptDayAdjustment = useStore((s) => s.acceptDayAdjustment);
  const promoteTier = useStore((s) => s.promoteTier);
  const dismissTierProposal = useStore((s) => s.dismissTierProposal);
  const advancePhase = useStore((s) => s.advancePhase);
  const dismissProposal = useStore((s) => s.dismissProposal);
  const recordProposalOutcome = useStore((s) => s.recordProposalOutcome);
  const [retestSheetOpen, setRetestSheetOpen] = useState(false);

  const onAccept = (pulseTarget: HTMLElement | null) => {
    hapticTap("medium");
    playConfirm();
    pulseTarget?.closest("[data-proposal-card]")?.classList.add("pulse-accept");

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
          `Plan sharpened. Load ${Math.round((1 - proposal.multiplier) * 100)}% lighter today.`,
        );
        break;
      }
      case "readiness_after_layoff": {
        advancePhase(proposal.programSlug, proposal.daysToShift);
        dismissProposal(date, "reintro-graduation");
        announce(`Plan sharpened. Advanced to ${proposal.targetPhaseName}.`);
        break;
      }
      case "tier_advance": {
        promoteTier(proposal.programSlug, proposal.tierId, "retest");
        announce(`Plan sharpened. Advanced to ${proposal.tierLabel}.`);
        break;
      }
      case "tm_bump": {
        for (const l of proposal.lifts) {
          setTM(l.exerciseId, l.newTM);
          // Bug fix 2026-08-22 · founder report — Accept without dismiss
          // let the engine re-fire the same tm_bump on the next render
          // using the newly-bumped TM as currentTM, so a fast tapper could
          // stack +5kg × 10 = +50kg in one tap-storm. Mirror the Ignore
          // path (line 89) so the proposal is gone for the day.
          dismissProposal(date, `tm-bump:${l.exerciseId}`);
        }
        const summary = proposal.lifts.map((l) => `${l.exerciseId} +${l.delta} kg`).join(", ");
        announce(`Plan sharpened. Training max bumped: ${summary}.`);
        break;
      }
      case "non_responder_recommendation": {
        dismissProposal(date, proposal.id.replace(/^[^:]*:/, "non-responder:"));
        announce("Recommendation acknowledged.");
        break;
      }
      case "retest_due": {
        setRetestSheetOpen(true);
        return;
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
      case "non_responder_recommendation":
        dismissProposal(date, `non-responder:${proposal.verdict}`);
        break;
      case "retest_due":
        dismissProposal(date, `retest-due:${proposal.metricId}:${proposal.atWeek}`);
        break;
    }
    recordProposalOutcome(proposal, "ignored", date);
    announce("Ignored.");
  };

  const closeRetestSheet = (didSubmit: boolean) => {
    setRetestSheetOpen(false);
    if (proposal.kind !== "retest_due") return;
    if (didSubmit) {
      dismissProposal(date, `retest-due:${proposal.metricId}:${proposal.atWeek}`);
      recordProposalOutcome(proposal, "accepted", date);
    }
  };

  return {
    onAccept,
    onIgnore,
    retestSheetOpen,
    closeRetestSheet,
    acceptVerb: acceptVerbFor(proposal),
  };
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
    case "non_responder_recommendation":
      return "Acknowledge";
    case "retest_due":
      return "Log reading";
  }
}
