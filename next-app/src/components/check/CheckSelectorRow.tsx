"use client";

/**
 * Cut D · Check · segmented picker for buckets (stiffness / life load).
 *
 * Replaces the raw minute/severity sliders. The buckets map to numeric
 * values written to the store — backward-compatible with existing
 * derive() thresholds.
 *
 * Design (per Cut D audit findings):
 * - Segmented container with 3px inset padding
 * - Each button ≥44px min-height (mobile-UX audit P1 — mockup had 40px)
 * - Active state: surface-2 fill + strong-ink text (quieter than the
 *   region tap-scale, which uses border+underline — hierarchy is correct
 *   because stiffness/life-load is context, not the primary symptom read)
 */

import { cn } from "@/lib/utils";

export type CheckSelectorOption<T extends string | number> = {
  label: string;
  value: T;
};

export type CheckSelectorRowProps<T extends string | number> = {
  label: string;
  options: CheckSelectorOption<T>[];
  value: T | null;
  onChange: (v: T) => void;
};

export function CheckSelectorRow<T extends string | number>({
  label,
  options,
  value,
  onChange,
}: CheckSelectorRowProps<T>) {
  return (
    <div className="py-3 border-b border-line-soft last:border-b-0">
      <div className="text-[14px] font-medium text-strong mb-2">{label}</div>
      <div
        role="radiogroup"
        aria-label={label}
        className="grid gap-1 border border-line-soft rounded-md p-1"
        style={{ gridTemplateColumns: `repeat(${options.length}, 1fr)` }}
      >
        {options.map((opt) => {
          const isActive = value === opt.value;
          return (
            <button
              key={String(opt.value)}
              type="button"
              role="radio"
              aria-checked={isActive}
              onClick={() => onChange(opt.value)}
              className={cn(
                "min-h-[44px] px-1 py-2 text-[12px] rounded motion-reduce:transition-none transition-colors",
                "focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-bronze focus-visible:outline-offset-2",
                isActive
                  ? "bg-surface-2 text-strong font-medium"
                  : "text-muted hover:text-ink",
              )}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
