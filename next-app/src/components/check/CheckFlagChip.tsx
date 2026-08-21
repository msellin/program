"use client";

/**
 * Cut D · Check · single toggle chip for a boolean red-flag signal.
 *
 * Replaces the row-per-checkbox pattern from prior /check. Chips wrap
 * horizontally, tap to toggle, amber outline when on.
 *
 * Design constraints:
 * - min-height 44px per Apple HIG
 * - horizontal padding 14px for visual weight (mobile-UX nit)
 * - amber (not red) when on — this is a "flag" signal that FEEDS red state
 *   via derive(), not itself a red-tone chrome (per R8 · no autonomous
 *   score-drama)
 */

import { cn } from "@/lib/utils";

export type CheckFlagChipProps = {
  label: string;
  on: boolean;
  onToggle: () => void;
};

export function CheckFlagChip({ label, on, onToggle }: CheckFlagChipProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={onToggle}
      className={cn(
        "inline-flex items-center gap-2 min-h-[44px] px-3.5 py-2 rounded-full border text-[13px] motion-reduce:transition-none transition-colors",
        "focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-bronze focus-visible:outline-offset-2",
        on
          ? "text-strong border-amber bg-amber/10"
          : "text-muted border-line-strong hover:text-ink hover:bg-line-soft",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "inline-block w-2 h-2 rounded-full",
          on ? "bg-amber" : "bg-line-strong",
        )}
      />
      {label}
    </button>
  );
}
