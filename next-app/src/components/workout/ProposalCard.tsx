"use client";

import { ArrowUp } from "lucide-react";
import { CitationRef } from "@/components/citations/CitationRef";
import { RetestLoggingSheet } from "@/components/workout/RetestLoggingSheet";
import { useProposalActions } from "@/lib/proposals/useProposalActions";
import { humanizeMetricId, humanizeVerdict, humanizeExerciseId } from "@/lib/humanize-metrics";
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
          {/* A8 + P1-57 (Batch 26) — guard empty eyebrow (was rendering
              a phantom h3 to SR when the switch returned nothing), and
              demote h3 → h2 so the Today page hierarchy stops skipping
              h1 → h3. Visual style is class-based; tag change has no
              visual effect. */}
          {eyebrow ? (
            <h2
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
            </h2>
          ) : null}
          <p className="text-[14px] text-ink mt-1 leading-snug">
            <span className="text-muted">Because:</span> {proposal.reason}
          </p>
          {proposal.kind === "tm_bump" ? (
            <ul className="text-[12px] font-mono text-ink mt-1 space-y-0.5">
              {proposal.lifts.map((l) => (
                <li key={l.exerciseId}>
                  {/* P1-66 (Batch 27) — was rendering raw exercise_id
                      like "back_squat_highbar" — snake_case leak in a
                      user-facing string. Humanize via shared helper. */}
                  {humanizeExerciseId(l.exerciseId)} · {l.currentTM} → {l.newTM} kg (+{l.delta})
                </li>
              ))}
            </ul>
          ) : null}
          {/* Which day this actually changes (2026-08-27). The proposal used
              to be silent about it, and accepting it on a rest day wrote an
              adjustment nothing would ever read. It now targets the next
              loaded day, and says so when that is not today. */}
          {proposal.kind === "day_adjustment_soften" && proposal.signalDate ? (
            <p className="text-[12px] font-mono uppercase tracking-wider text-bronze mt-1">
              Applies to{" "}
              {new Date(proposal.date + "T12:00:00Z").toLocaleDateString("en-GB", {
                weekday: "long",
                day: "numeric",
                month: "short",
              })}{" "}
              — your next session with load
            </p>
          ) : null}
          {proposal.kind === "day_adjustment_soften" && proposal.matches.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 mt-1">
              {proposal.matches.map((m) => (
                <span
                  key={m}
                  className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border border-line-soft text-muted inline-flex items-center gap-1.5"
                >
                  <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-amber" />
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
                    {e.date} · {humanizeExerciseId(e.exerciseId)} · {e.weightKg} kg × {e.reps}
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

// P1-40 → A10 (Batch 26): humanizeMetricId + humanizeVerdict moved to
// `lib/humanize-metrics.ts` so HeritageClusterChip can share them.

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

