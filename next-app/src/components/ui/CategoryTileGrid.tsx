/**
 * CategoryTileGrid — v1.1.1 §2.8
 *
 * 2×2 or 2×3 browse grid. Renders on:
 *   - /programs catalog (2×3, 6 categories)
 *   - Extras block on Today (2×2, 4 drill categories)
 *
 * <ul>/<li>/<button> per tile — role="grid" is NOT correct here (grid
 * ≠ tile grid semantically per a11y §4).
 *
 * Whole tile is tappable; corner chevrons decorative. Tile min-height =
 * 96px (2×2) or 88px (2×3). Bronze reserved for CTA — tile tint is
 * slate/green/amber even when category is Strength (which uses bronze
 * stripe elsewhere, e.g. per-program row) — tiles carry visual identity
 * via glyph + subtle 8-12% gradient overlay.
 *
 * Compliance: R1 (gradient is CSS math, not photo), R2 (tiles are tap
 * targets, not CTAs — bronze economy preserved).
 */

"use client";

import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type CategoryTileTint = "bronze" | "slate" | "green" | "amber";

export type CategoryTile = {
  id: string;
  name: string;
  Glyph?: LucideIcon;
  tint: CategoryTileTint;
  count: number;
  pitch: string;
};

export type CategoryTileGridProps = {
  categories: CategoryTile[];
  onTileTap: (id: string) => void;
  /** 'wide' = 2×3 (Programs). 'compact' = 2×2 (Extras). Default 'wide'. */
  layout?: "wide" | "compact";
  className?: string;
};

const TINT_STRIPE: Record<CategoryTileTint, string> = {
  bronze: "border-l-bronze",
  slate: "border-l-slate",
  green: "border-l-green",
  amber: "border-l-amber",
};

const TINT_GRADIENT: Record<CategoryTileTint, string> = {
  bronze: "from-bronze/[0.08] to-transparent",
  slate: "from-slate/[0.08] to-transparent",
  green: "from-green/[0.08] to-transparent",
  amber: "from-amber/[0.08] to-transparent",
};

export function CategoryTileGrid({
  categories,
  onTileTap,
  layout = "wide",
  className,
}: CategoryTileGridProps) {
  const minH = layout === "wide" ? "min-h-[96px]" : "min-h-[88px]";
  return (
    <ul className={cn("grid grid-cols-2 gap-3", className)}>
      {categories.map((c) => (
        <li key={c.id} className="min-w-0">
          <button
            type="button"
            onClick={() => onTileTap(c.id)}
            aria-label={`${c.name}: ${c.pitch}, ${c.count} available`}
            className={cn(
              "w-full flex flex-col items-start gap-1 rounded-lg border border-line-soft border-l-4 bg-surface-2 p-3 text-left",
              "bg-gradient-to-br",
              TINT_STRIPE[c.tint],
              TINT_GRADIENT[c.tint],
              minH,
              "hover:bg-surface-3 active:scale-[0.98] transition-transform duration-100 motion-reduce:transition-none",
              "focus-visible:outline focus-visible:outline-2 focus-visible:outline-bronze focus-visible:outline-offset-2",
            )}
          >
            <div className="flex items-center gap-2 w-full min-w-0">
              {c.Glyph ? (
                <c.Glyph
                  size={18}
                  strokeWidth={1.75}
                  aria-hidden
                  className="text-muted flex-shrink-0"
                />
              ) : null}
              <span className="text-[14px] font-semibold text-strong truncate flex-1 min-w-0">
                {c.name}
              </span>
            </div>
            <p className="text-[12px] text-muted leading-snug line-clamp-2 flex-1">{c.pitch}</p>
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted mt-auto tabular-nums">
              {c.count} available
            </p>
          </button>
        </li>
      ))}
    </ul>
  );
}
