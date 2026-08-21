"use client";

/**
 * Cut D · Check · live verdict bar rendering the current state.
 *
 * Updates as the user taps — no "save to see" delay. Same derive()
 * logic as the shipping /check page (green/amber/red), so backward
 * compatible with every downstream consumer.
 *
 * Design (per Cut D brief):
 * - 4px left rail in state color (green / amber / red)
 * - Mono-caps state pill "WORKOUT READY / CHECK FIRST / BACK OFF"
 * - Sub-line explaining WHY (which threshold fired)
 * - Inline citation to Kellmann 2010 with tap-open sheet (uses InfoSheet
 *   primitive from v1.1.1 · matches Record's LatestRetestTile pattern)
 *
 * The verdict IS the differentiator dramatization per matrix rec #4
 * (cite-per-adjustment first-class UI, not a footnote).
 */

import { useState } from "react";
import { InfoSheet } from "@/components/InfoSheet";
import { cn } from "@/lib/utils";

export type CheckState = "green" | "amber" | "red";

export type CheckLiveVerdictProps = {
  state: CheckState;
  /** Which specific threshold fired the state — one line, human-readable. */
  reason: string;
};

const COPY: Record<CheckState, { pill: string; rail: string }> = {
  green: { pill: "Workout ready", rail: "border-l-green" },
  amber: { pill: "Check first", rail: "border-l-amber" },
  red: { pill: "Back off", rail: "border-l-red" },
};

const CITATION_BODY: Record<CheckState, string> = {
  green: "All symptom scores ≤ 3/10 and no red-flag signals — the engine progresses your load.",
  amber: "One or more scores between 4-5/10 or morning stiffness over 30 min — hold today's load; don't push through.",
  red: "A symptom above 5/10 or a red-flag signal (night pain, gait change, painful click) — back off. If persistent, see a clinician.",
};

export function CheckLiveVerdict({ state, reason }: CheckLiveVerdictProps) {
  const copy = COPY[state];
  const [sheetOpen, setSheetOpen] = useState(false);
  return (
    <>
      <div
        className={cn(
          "rounded-md border border-line-soft bg-surface p-3 border-l-4",
          copy.rail,
        )}
      >
        <span className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.04em] text-strong font-medium">
          <span
            aria-hidden
            className={cn(
              "inline-block w-2 h-2 rounded-full",
              state === "green" && "bg-green",
              state === "amber" && "bg-amber",
              state === "red" && "bg-red",
            )}
          />
          {copy.pill}
        </span>
        <p className="mt-1.5 text-[14px] text-ink leading-relaxed">{reason}</p>
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          className="mt-1 inline-flex items-center gap-1.5 min-h-[44px] py-2 text-[12px] text-ink cursor-pointer motion-reduce:transition-none transition-colors hover:text-strong focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-bronze focus-visible:outline-offset-2 rounded"
          aria-label="View citation source"
        >
          <span className="font-mono text-[10px] uppercase tracking-[0.06em] text-strong font-medium">
            Cited
          </span>
          <span>Kellmann 2010 · pain-provocation thresholds</span>
          <span aria-hidden className="text-muted ml-1">→</span>
        </button>
      </div>
      {sheetOpen ? (
        <InfoSheet
          title={`${copy.pill}`}
          onClose={() => setSheetOpen(false)}
          citation={{
            study: "Kellmann M, Bertollo M, Bosquet L, et al. (2018). Recovery and Performance in Sport: Consensus Statement. Int J Sports Physiol Perform.",
            threshold: CITATION_BODY[state],
          }}
        >
          <p className="text-[14px] text-ink leading-relaxed">
            Terav uses a rehab-safe threshold model: any symptom above 3/10 crosses to amber (hold), above 5/10 crosses to red (back off). Red-flag signals (night pain, gait change, painful click) short-circuit to red regardless of score.
          </p>
          <p className="text-[14px] text-ink leading-relaxed mt-3">
            This isn&apos;t a diagnosis — it&apos;s a state read that gates today&apos;s prescribed load. If a red state persists, see a clinician.
          </p>
        </InfoSheet>
      ) : null}
    </>
  );
}
