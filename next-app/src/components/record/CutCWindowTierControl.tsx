"use client";

/**
 * Cut C · Record surface · Trend-section zoom control.
 *
 * Segmented 4-tier control [ 30d · 90d · 1y · All ] with data-adaptive
 * default. Peer alignment: Hevy's zoom tiers use exactly this label
 * set (30d / 90d / 1y / All) — Cut C locked-decisions doc calls this
 * "Hevy-aligned", NOT Oura-aligned (Oura uses d/w/m/y).
 *
 * Design rules from DESIGN-cut-c.md:
 * - Active state: `text-strong` label + 2px underline in `text-strong`.
 *   NOT bronze (R2). NOT filled background.
 * - Inactive: `text-muted`, no underline.
 * - Type: 12px mono uppercase tracking-widest.
 * - Each button ≥44×44 tap target (Apple HIG).
 * - Persist per-user via localStorage.
 *
 * Batch 37 pattern reminder: no `?? []` inside a useStore selector
 * (React #185 trap). This component uses props for data; no direct
 * store reads.
 */

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export type WindowTier = "30d" | "90d" | "1y" | "all";

const TIERS: { value: WindowTier; label: string }[] = [
  { value: "30d", label: "30d" },
  { value: "90d", label: "90d" },
  { value: "1y", label: "1y" },
  { value: "all", label: "All" },
];

const STORAGE_KEY = "terav.record.window_tier";

export type CutCWindowTierControlProps = {
  /**
   * Range in days of the user's available log history. Drives
   * data-adaptive default: <30d → "30d", <90d → "90d", <365d → "1y",
   * ≥365d → "all".
   */
  dataDays: number;
  /**
   * Called whenever the active tier changes (user tap OR data-adaptive
   * initial resolution). Parent components (curve, timeline) react.
   */
  onChange: (tier: WindowTier) => void;
  className?: string;
};

function resolveDefault(dataDays: number): WindowTier {
  if (dataDays < 30) return "30d";
  if (dataDays < 90) return "90d";
  if (dataDays < 365) return "1y";
  return "all";
}

function readStored(): WindowTier | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    if (raw === "30d" || raw === "90d" || raw === "1y" || raw === "all") return raw;
    return null;
  } catch {
    // localStorage can throw in private-browsing mode; fall through to default.
    return null;
  }
}

function writeStored(tier: WindowTier): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, tier);
  } catch {
    /* private-browsing — no-op */
  }
}

export function CutCWindowTierControl({ dataDays, onChange, className }: CutCWindowTierControlProps) {
  // Initial state: stored preference if any, else data-adaptive default.
  // Effect runs post-mount to keep server-render + client-hydrate the same.
  const [active, setActive] = useState<WindowTier>(() => resolveDefault(dataDays));

  useEffect(() => {
    const stored = readStored();
    const initial = stored ?? resolveDefault(dataDays);
    setActive(initial);
    onChange(initial);
    // Effect intentionally runs once on mount; onChange isn't in deps to
    // avoid firing on every parent re-render — parent recomputes from
    // whichever tier the segmented control lands on.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataDays]);

  const handleClick = (tier: WindowTier) => {
    setActive(tier);
    writeStored(tier);
    onChange(tier);
  };

  return (
    <div
      role="tablist"
      aria-label="Trend zoom range"
      className={cn(
        "grid grid-cols-4 border-b border-line-soft",
        className,
      )}
    >
      {TIERS.map((tier) => {
        const isActive = active === tier.value;
        return (
          <button
            key={tier.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => handleClick(tier.value)}
            className={cn(
              "relative min-h-[44px] py-3.5 font-mono text-[12px] uppercase tracking-widest",
              "motion-reduce:transition-none transition-colors",
              isActive ? "text-strong" : "text-muted",
              "focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-bronze focus-visible:outline-offset-2 rounded",
            )}
          >
            {tier.label}
            {isActive ? (
              <span
                aria-hidden
                className="absolute left-[20%] right-[20%] -bottom-px h-[2px] bg-strong"
              />
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
