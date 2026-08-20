/**
 * OutcomeBar — v1.1.1 §2.10
 *
 * baseline → target bar on program preview. Stacked 2-3 rows under
 * "What you'll achieve" (§3 row 6). Static, no interaction, no focus
 * concern.
 *
 * Range honesty rule (landing C7): `rangeCaption` is REQUIRED per
 * program. Point-value-only targets violate the "not certain about
 * you" landing promise. QA-2 sync check `check-outcome-honesty.py`
 * (Batch 36 Step 13 ripple) asserts every program's
 * expected_outcomes includes a rangeCaption. Fail merge on missing.
 *
 * TypeScript enforces this — `rangeCaption` is required in the props
 * type, not optional. Callers cannot forget it.
 *
 * Compliance: R11 (range authored from evidence base, not aggregated),
 * R5 (spec-visualisation of intent, not a tracker), R8 (baseline and
 * target both authored).
 */

"use client";

import { cn } from "@/lib/utils";

export type OutcomeBarProps = {
  metricName: string;
  baselineValue: string;
  targetValue: string;
  /** REQUIRED per landing C7. "Typical range +15 to +25 kg over 8 weeks." */
  rangeCaption: string;
  /** Computed if omitted. */
  ariaLabel?: string;
  className?: string;
};

export function OutcomeBar({
  metricName,
  baselineValue,
  targetValue,
  rangeCaption,
  ariaLabel,
  className,
}: OutcomeBarProps) {
  const label =
    ariaLabel ??
    `${metricName}: baseline ${baselineValue}, target ${targetValue}. ${rangeCaption}`;
  return (
    <div
      role="img"
      aria-label={label}
      className={cn("space-y-2", className)}
    >
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-[14px] font-semibold text-strong">{metricName}</span>
        <span className="font-mono text-[12px] tabular-nums text-muted">
          <span className="text-ink">{baselineValue}</span>
          <span className="mx-1.5 text-line-strong">→</span>
          <span className="text-strong">{targetValue}</span>
        </span>
      </div>
      <div className="relative h-2 w-full rounded-full bg-line-soft overflow-hidden">
        {/* Static bar — from left (baseline) to right (target). No live
            progress fill; this is a spec visualization, not a tracker. */}
        <div
          aria-hidden
          className="h-full rounded-full bg-gradient-to-r from-slate/60 to-bronze"
          style={{ width: "100%" }}
        />
      </div>
      <p className="font-mono text-[10px] uppercase tracking-widest text-muted">
        {rangeCaption}
      </p>
    </div>
  );
}
