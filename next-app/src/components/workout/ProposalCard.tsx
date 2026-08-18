"use client";

import { useState } from "react";
import { ArrowUp } from "lucide-react";
import { useStore } from "@/lib/useStore";
import { hapticTap, today as todayISO } from "@/lib/utils";
import { announce } from "@/lib/announce";
import { CitationRef } from "@/components/citations/CitationRef";
import { RetestLoggingSheet } from "@/components/workout/RetestLoggingSheet";
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
  // HERITAGE Phase 5 — the retest_due kind opens a logging sheet on Accept.
  // We record the Accepted outcome only when the sheet reports success
  // (submit path), not when the sheet opens — otherwise a cancelled sheet
  // would leave a false-positive audit entry.
  const [retestSheetOpen, setRetestSheetOpen] = useState(false);

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
        for (const l of proposal.lifts) setTM(l.exerciseId, l.newTM);
        const summary = proposal.lifts.map((l) => `${l.exerciseId} +${l.delta} kg`).join(", ");
        announce(`Plan sharpened. Training max bumped: ${summary}.`);
        break;
      }
      case "non_responder_recommendation": {
        // HERITAGE Phase 4 — Accept = acknowledge the recommendation.
        // We DON'T auto-switch the program here; the actual arc/track
        // change is a manual decision the user makes from
        // /programs. Accepting marks the recommendation seen and stops
        // the card re-appearing indefinitely.
        dismissProposal(date, proposal.id.replace(/^[^:]*:/, "non-responder:"));
        announce("Recommendation acknowledged.");
        break;
      }
      case "retest_due": {
        // HERITAGE Phase 5 — Accept opens the logging sheet. Outcome and
        // dismissal are recorded when the sheet submits; opening alone
        // is not an "accepted" state, otherwise a cancel-out leaves a
        // ghost audit entry.
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
        // Suppress on today; the selector re-fires tomorrow while window
        // is still open. If user consistently ignores, the window closes.
        dismissProposal(date, `retest-due:${proposal.metricId}:${proposal.atWeek}`);
        break;
    }
    recordProposalOutcome(proposal, "ignored", date);
    announce("Ignored.");
  };

  const onRetestSheetClose = (didSubmit: boolean) => {
    setRetestSheetOpen(false);
    if (proposal.kind !== "retest_due") return;
    if (didSubmit) {
      // Reading landed — dismiss for today so the same proposal doesn't
      // re-fire before the freshness window ticks over tomorrow.
      dismissProposal(date, `retest-due:${proposal.metricId}:${proposal.atWeek}`);
      recordProposalOutcome(proposal, "accepted", date);
    }
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
          <h3
            id={`proposal-${proposal.id}`}
            className={`font-mono text-[10px] uppercase tracking-widest ${tone.eyebrow} flex items-center gap-1.5 font-normal`}
          >
            {proposal.kind === "tm_bump" ||
            proposal.kind === "tier_advance" ||
            (proposal.kind === "non_responder_recommendation" &&
              proposal.verdict === "under_dosing") ? (
              // Visual-craft audit 2026-08-18 — under_dosing means "more",
              // same directional semantic as tm_bump + tier_advance. The
              // ArrowUp differentiates it from the amber-tone soften
              // proposal which is directionally "less".
              <ArrowUp size={12} className={tone.eyebrow} aria-hidden="true" />
            ) : null}
            {eyebrow}
          </h3>
          <p className="text-[13px] text-ink mt-1 leading-snug">
            <span className="text-muted">Because:</span> {proposal.reason}
          </p>
          {proposal.kind === "tm_bump" ? (
            <ul className="text-[12px] font-mono text-ink mt-1 space-y-0.5">
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
          {proposal.kind === "retest_due" ? (
            <p className="text-[12px] font-mono text-ink mt-1">
              Week {proposal.currentWeek} · logging {proposal.metricDisplayName}
              {proposal.metricUnit ? ` (${proposal.metricUnit})` : ""}
            </p>
          ) : null}
          {proposal.kind === "non_responder_recommendation" ? (
            <ul className="text-[12px] font-mono text-ink mt-1 space-y-0.5">
              {proposal.perMetric.map((m) => (
                <li key={m.metric_id}>
                  {m.metric_id} ({m.role})
                  {m.delta_at_mid_block != null
                    ? ` · Δ ${m.delta_at_mid_block.toFixed(2)} at mid-block`
                    : ""}
                  <span className="text-muted"> · {m.verdict.replace(/_/g, " ")}</span>
                </li>
              ))}
            </ul>
          ) : null}
          {proposal.kind === "readiness_after_layoff" ? (
            <>
              <ul className="text-[12px] font-mono text-ink mt-1 space-y-0.5">
                {proposal.evidence.map((e) => (
                  <li key={e.date + e.exerciseId}>
                    {e.date} · {e.exerciseId} · {e.weightKg} kg × {e.reps}
                    {e.rpe != null ? ` @ RPE ${e.rpe}` : ""} · {e.pctTM}% TM
                  </li>
                ))}
              </ul>
              {/* Audit 2026-08-18 (#67 · founder Q1) — was ambiguous which
                  two sessions the engine picked. Now says explicitly
                  "2 most recent qualifying" + counts any non-qualifying
                  strength sessions skipped in between so the rule reads
                  honestly. */}
              <p className="text-[11px] text-muted italic mt-1">
                2 most recent qualifying sessions
                {proposal.nonQualifyingSessionsSkipped > 0
                  ? ` · ${proposal.nonQualifyingSessionsSkipped} lower-intensity session${proposal.nonQualifyingSessionsSkipped === 1 ? "" : "s"} in between didn't hit the threshold`
                  : ""}
              </p>
            </>
          ) : null}
          {proposal.citationId ? (
            <div className="mt-1">
              <CitationRef id={proposal.citationId} />
            </div>
          ) : null}
        </div>
        {/* M7 fix (2026-08-17): X-icon dismiss removed. The Ignore button
            below is the semantic verb (matches the landing promise), and
            two same-action affordances confused reviewers. */}
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
      {retestSheetOpen && proposal.kind === "retest_due" ? (
        <RetestLoggingSheet
          proposal={proposal}
          onClose={() => onRetestSheetClose(true)}
        />
      ) : null}
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
    case "non_responder_recommendation":
      // Cluster C (non-responder) reads as red; Cluster B (under-dosing) as
      // amber. Both are "consider a bigger change" but only one is a strong
      // signal to stop grinding.
      return p.verdict === "true_non_response"
        ? {
            border: "border-red/40",
            borderLeft: "border-l-4 border-l-red",
            bg: "bg-red/10",
            eyebrow: "text-red",
          }
        : {
            border: "border-amber/40",
            borderLeft: "border-l-4 border-l-amber",
            bg: "bg-amber/10",
            eyebrow: "text-amber",
          };
    case "tier_advance":
    case "tm_bump":
    case "retest_due":
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
      return "Fatigue or pain flagged today";
    case "readiness_after_layoff":
      return "You look ready to leave reintro";
    case "tier_advance":
      return "Tier gate cleared";
    case "tm_bump":
      return "Room to push — headroom on your log";
    case "non_responder_recommendation":
      // Copy audit 2026-08-18 — dropped "HERITAGE" internal codename.
      return p.verdict === "true_non_response"
        ? "Not responding to current dose"
        : "Room to push — under-dosing pattern";
    case "retest_due":
      return p.cadenceKind === "mid_block"
        ? "Mid-block retest window open"
        : "End-of-block retest window open";
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
    case "non_responder_recommendation":
      // Accept just acknowledges — the arc change itself is a user
      // decision on the /programs page, not something the engine auto-does.
      // Copy audit 2026-08-18 — "Got it" broke the imperative-verb family.
      return "Acknowledge";
    case "retest_due":
      return "Log reading";
  }
}

// Silence unused-import warning during checkpoint refactors — todayISO stays
// available for downstream date-comparison work.
void todayISO;
