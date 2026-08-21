"use client";

/**
 * Cut D · Check · 4-option tap-scale for a single symptom region.
 *
 * Replaces the 0-10 native slider (see prior /check/page.tsx before Cut D).
 * The rationale: sliders demand a precise drag on a small screen, which is
 * unusable one-handed at 5am. A 4-bucket tap-scale gives the SAME state
 * mapping (green/amber/red via the `derive()` function) with 3× faster
 * completion.
 *
 * Value mapping (backward-compatible with existing 0-10 storage):
 *   None:0 · Mild:2 · Notable:5 · Severe:8
 *
 * `derive()` amber threshold is ≥4, red is >5 — so Mild=2 stays green,
 * Notable=5 crosses to amber, Severe=8 goes red. Matches user intuition.
 *
 * Design (per Cut D brief + audit passes):
 * - min-height 44px per button (Apple HIG)
 * - Active state escalates by bucket: None/Mild use strong-ink underline,
 *   Notable uses amber, Severe uses red. R2 preserved (never bronze).
 * - 4-column grid, 6px gap
 * - Row label with optional laterality marker (L / R)
 */

import { cn } from "@/lib/utils";

export type SymptomBucket = "none" | "mild" | "notable" | "severe";

/**
 * Map bucket → numeric value stored in `symptoms[region_key]`.
 * Reverse-map: for any 0-10 legacy value, resolve() picks the closest bucket.
 */
export const BUCKET_TO_VALUE: Record<SymptomBucket, number> = {
  none: 0,
  mild: 2,
  notable: 5,
  severe: 8,
};

export function valueToBucket(v: number | null | undefined): SymptomBucket {
  if (v == null || v <= 0) return "none";
  if (v <= 3) return "mild";
  if (v <= 5) return "notable";
  return "severe";
}

export type CheckRegionRowProps = {
  label: string;
  lat?: "L" | "R";
  value: number;
  onChange: (v: number) => void;
};

const OPTIONS: { bucket: SymptomBucket; label: string; tone: "neutral" | "amber" | "red" }[] = [
  { bucket: "none", label: "None", tone: "neutral" },
  { bucket: "mild", label: "Mild", tone: "neutral" },
  { bucket: "notable", label: "Notable", tone: "amber" },
  { bucket: "severe", label: "Severe", tone: "red" },
];

export function CheckRegionRow({ label, lat, value, onChange }: CheckRegionRowProps) {
  const active = valueToBucket(value);
  return (
    <div className="py-3 border-b border-line-soft last:border-b-0">
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-[14px] font-medium text-strong">{label}</span>
        {lat ? (
          <span className="font-mono text-[10px] uppercase tracking-[0.06em] text-muted">
            {lat}
          </span>
        ) : null}
      </div>
      <div
        role="radiogroup"
        aria-label={`${label} severity`}
        className="grid grid-cols-4 gap-1.5"
      >
        {OPTIONS.map((opt) => {
          const isActive = active === opt.bucket;
          return (
            <button
              key={opt.bucket}
              type="button"
              role="radio"
              aria-checked={isActive}
              onClick={() => onChange(BUCKET_TO_VALUE[opt.bucket])}
              className={cn(
                "relative min-h-[44px] px-1.5 py-2 text-[12px] rounded border motion-reduce:transition-none transition-colors",
                "focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-bronze focus-visible:outline-offset-2",
                isActive
                  ? cn(
                      "text-strong bg-surface-2",
                      opt.tone === "neutral" && "border-strong",
                      opt.tone === "amber" && "border-amber",
                      opt.tone === "red" && "border-red",
                    )
                  : "text-muted border-line-strong hover:text-ink hover:bg-line-soft",
              )}
            >
              {opt.label}
              {isActive ? (
                <span
                  aria-hidden
                  className={cn(
                    "absolute left-[20%] right-[20%] -bottom-px h-[2px] rounded-sm",
                    opt.tone === "neutral" && "bg-strong",
                    opt.tone === "amber" && "bg-amber",
                    opt.tone === "red" && "bg-red",
                  )}
                />
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
