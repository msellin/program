"use client";

import { ArrowUp } from "lucide-react";
import { CitationRef } from "@/components/citations/CitationRef";
import { RetestLoggingSheet } from "@/components/workout/RetestLoggingSheet";
import { useProposalActions } from "@/lib/proposals/useProposalActions";
import type { Proposal } from "@/lib/schemas";

/**
 * A5 (Phase 3). One card per `Proposal` payload. Renders the reason /
 * evidence / citation. Accept + Ignore verbs render inline on non-top
 * cards; the top proposal in a stack surfaces its verbs in a sticky
 * bottom action bar (`ProposalStickyActionBar`) so the confirm-first
 * ceremony lands in the thumb zone — see P0-1 in the master task list.
 */
export function ProposalCard({
  proposal,
  date,
  showInlineActions = true,
}: {
  proposal: Proposal;
  date: string;
  showInlineActions?: boolean;
}) {
  const { onAccept, onIgnore, acceptVerb, retestSheetOpen, closeRetestSheet } =
    useProposalActions(proposal, date);

  const tone = toneFor(proposal);
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
          <p className="text-[14px] text-ink mt-1 leading-snug">
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
              Week {proposal.currentWeek} · log {proposal.metricDisplayName}
              {proposal.metricUnit ? ` (${proposal.metricUnit})` : ""}
            </p>
          ) : null}
          {proposal.kind === "non_responder_recommendation" ? (
            <ul className="text-[12px] font-mono text-ink mt-1 space-y-0.5">
              {proposal.perMetric.map((m) => (
                <li key={m.metric_id}>
                  {humanizeMetricId(m.metric_id)}
                  {m.delta_at_mid_block != null
                    ? ` · Δ ${m.delta_at_mid_block.toFixed(2)} at mid-block`
                    : ""}
                  <span className="text-muted"> · {humanizeVerdict(m.verdict)}</span>
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
      {showInlineActions ? (
        <div className="flex flex-wrap gap-2 pt-1">
          <button
            type="button"
            onClick={(e) => onAccept(e.currentTarget)}
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
      ) : null}
      {retestSheetOpen && proposal.kind === "retest_due" ? (
        <RetestLoggingSheet
          proposal={proposal}
          onClose={() => closeRetestSheet(true)}
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

// P1-40 — humanize the per-metric readout on non-responder proposals.
// Metric IDs come from engine payloads (`submax_hr_bpm`, `resting_hr_bpm`,
// `time_to_exhaustion_min`, ...). Underscore→space + acronym uppercase is
// enough for beta; if a program authors a fully unreadable id, add it to
// the DISPLAY_NAMES map below rather than baking that into the JSON.
const DISPLAY_NAMES: Record<string, string> = {
  submax_hr_bpm: "sub-max HR",
  resting_hr_bpm: "resting HR",
  hrv_rmssd_ms: "HRV (RMSSD)",
};
function humanizeMetricId(id: string): string {
  return DISPLAY_NAMES[id] ?? id.replace(/_/g, " ");
}
function humanizeVerdict(v: string): string {
  switch (v) {
    case "true_non_response":
      return "not responding";
    case "under_dosing":
      return "room to push";
    case "responding":
      return "responding";
    case "insufficient_data":
      return "not enough data yet";
    default:
      return v.replace(/_/g, " ");
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

