"use client";

import { useState } from "react";
import { useStore } from "@/lib/useStore";
import { today as todayISO } from "@/lib/utils";
import { announce } from "@/lib/announce";
import type { RetestDueProposalPayload } from "@/lib/schemas";

/**
 * HERITAGE Phase 5 (2026-08-18 · #73) — retest logging sheet.
 *
 * Confirm-first mechanic: opens when the user Accepts a `retest_due`
 * proposal. Captures a numeric reading + optional intensity compliance %.
 * Submits via `logRetestReading` (idempotent on metric+date). Two readings
 * per metric unlock the classifier, which then drives the Cluster A/B/C
 * chip on Progress and the non-responder proposal.
 *
 * Purposefully minimal — this is the fastest path from the founder-decided
 * scheduler to real data on the user's device. A richer form (RPE, notes,
 * pre-post comparisons) is a natural follow-up.
 */
export function RetestLoggingSheet({
  proposal,
  onClose,
}: {
  proposal: RetestDueProposalPayload;
  onClose: () => void;
}) {
  const logRetestReading = useStore((s) => s.logRetestReading);
  const [value, setValue] = useState("");
  const [compliance, setCompliance] = useState("");
  const [error, setError] = useState<string | null>(null);
  const observedAt = todayISO();

  const submit = () => {
    const n = Number(value);
    if (!Number.isFinite(n)) {
      setError("Enter a number.");
      return;
    }
    const compNum = compliance.trim() === "" ? undefined : Number(compliance);
    if (compNum != null && (!Number.isFinite(compNum) || compNum < 0 || compNum > 100)) {
      setError("Compliance % must be between 0 and 100 (or leave blank).");
      return;
    }
    logRetestReading({
      metric_id: proposal.metricId,
      value: n,
      observed_at: observedAt,
      program_slug: proposal.programSlug,
      at_week: proposal.atWeek,
      intensity_compliance_pct: compNum,
    });
    announce(`Retest reading logged. ${proposal.metricDisplayName}: ${n} ${proposal.metricUnit}.`);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="retest-log-title"
      // Mobile-UX audit 2026-08-18 (P0) — sheet card was parking primary
      // button under the iPhone home indicator + iOS soft keyboard could
      // push it below the fold. Two fixes:
      //   1. Reserve safe-area-inset-bottom on the outer container so the
      //      card itself is never under the home indicator.
      //   2. Scrollable overlay `overflow-y-auto` with items-end on mobile
      //      keeps the keyboard's push-up behavior graceful.
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      className="fixed inset-0 z-[70] bg-ground/95 backdrop-blur-sm flex items-end sm:items-center justify-center overflow-y-auto p-4"
    >
      <div className="w-full max-w-md rounded border border-line bg-surface p-4 space-y-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-slate">
            Week {proposal.atWeek} · {proposal.cadenceKind === "mid_block" ? "mid-block" : "end-of-block"}
          </p>
          <h2 id="retest-log-title" className="text-lg font-semibold text-strong mt-1">
            Log {proposal.metricDisplayName}
          </h2>
          <p className="text-[12px] text-muted mt-1">
            Recorded {observedAt}. Re-submitting today updates this entry — it won&apos;t duplicate.
          </p>
        </div>

        <label className="block space-y-1.5">
          <span className="text-[12px] text-muted">
            Reading{proposal.metricUnit ? ` (${proposal.metricUnit})` : ""}
          </span>
          <input
            type="number"
            inputMode="decimal"
            step="any"
            value={value}
            autoFocus
            onChange={(e) => {
              setValue(e.target.value);
              setError(null);
            }}
            aria-invalid={error != null}
            className="w-full font-mono text-sm px-3 py-2 border border-line rounded bg-ground text-ink focus:outline-none focus:ring-2 focus:ring-bronze focus:border-bronze min-h-[44px]"
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-[12px] text-muted">
            Intensity compliance % (optional)
          </span>
          <input
            type="number"
            inputMode="decimal"
            min={0}
            max={100}
            value={compliance}
            onChange={(e) => {
              setCompliance(e.target.value);
              setError(null);
            }}
            placeholder="How closely did prescribed intensity hit? Blank = don't score."
            className="w-full font-mono text-sm px-3 py-2 border border-line rounded bg-ground text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-bronze focus:border-bronze min-h-[44px]"
          />
        </label>

        {error ? (
          <p role="alert" className="text-[12px] text-red">
            {error}
          </p>
        ) : null}

        <div className="flex justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 min-h-[44px] border border-line text-ink rounded font-mono text-[11px] uppercase tracking-wider hover:bg-line-soft"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            className="px-4 py-2 min-h-[44px] bg-bronze text-ground rounded font-mono text-[11px] uppercase tracking-wider hover:bg-bronze-hover"
          >
            Log reading
          </button>
        </div>
      </div>
    </div>
  );
}
