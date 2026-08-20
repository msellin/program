/**
 * MetricStripCluster — v1.1.1 §2.7
 *
 * 3-cell (or 2-cell) nested strip. Baseline/Current/Δ on retest cards.
 * Duration/Blocks/Target inside WorkoutHero. Weeks/Hours/Level on program
 * preview meta.
 *
 * Semantic markup (a11y §4): <dl> with <dt>/<dd> pairs. Cleanest structure
 * for label/value pairs; SR reads label then value naturally.
 *
 * Mono-numeric text alternative (a11y §4): values containing × (U+00D7)
 * or / MUST include explicit aria-label on the cell. JAWS reads "×" as
 * "X"; VoiceOver correctly reads "times." Don't rely on SR pronunciation
 * of composite math.
 *
 * Do NOT use for more than 3 cells — compresses below legibility at 393.
 * If a 4th value exists, promote to its own row.
 *
 * Grid CLS rule (motion-perf §3.2): grid with grid-cols-3 and min-w-0
 * cells so long values don't reflow siblings during hydration.
 */

"use client";

import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

export type MetricStripClusterItem = {
  /** Mono-caps eyebrow label — 10px uppercase, tracking-widest. */
  label: string;
  /** Numeric or short string value — mono, tabular. */
  value: ReactNode;
  /** Optional caption below the value (12px muted). */
  hint?: string;
  /**
   * Optional explicit aria-label on the cell. REQUIRED when value contains
   * × (multiplication) or / (separator). Example: "2 sets of 8 per leg"
   * for value "2 × 8 / leg". SR-pronounces reliably.
   */
  ariaLabel?: string;
  /** Tint on the value — default strong. Green on improvement, amber on worsening. */
  tone?: "strong" | "green" | "amber" | "red" | "muted";
};

export type MetricStripClusterProps = {
  items: MetricStripClusterItem[];
  /** Accessible group label — defaults to "Metrics". */
  ariaGroupLabel?: string;
  density?: "default" | "compact";
  className?: string;
};

const TONE_TEXT: Record<NonNullable<MetricStripClusterItem["tone"]>, string> = {
  strong: "text-strong",
  green: "text-green",
  amber: "text-amber-strong",
  red: "text-red-strong",
  muted: "text-muted",
};

export function MetricStripCluster({
  items,
  ariaGroupLabel = "Metrics",
  density = "default",
  className,
}: MetricStripClusterProps) {
  if (items.length === 0) return null;
  if (items.length > 3) {
    // Dev-mode guard per §2.7. Compression below legibility is a fail state.
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        `[MetricStripCluster] ${items.length} cells requested; §2.7 caps at 3. ` +
          `Promote overflow to a separate row.`,
      );
    }
  }

  const cellCountClass =
    items.length === 3 ? "grid-cols-3" : items.length === 2 ? "grid-cols-2" : "grid-cols-1";

  const rowPadding = density === "compact" ? "gap-2" : "gap-3";

  return (
    <dl
      role="group"
      aria-label={ariaGroupLabel}
      className={cn("grid", cellCountClass, rowPadding, className)}
    >
      {items.map((item, idx) => (
        <div
          key={`${item.label}-${idx}`}
          className="min-w-0"
          aria-label={item.ariaLabel}
        >
          <dt className="font-mono text-[10px] font-medium uppercase tracking-widest text-muted">
            {item.label}
          </dt>
          <dd
            className={cn(
              "font-mono tabular-nums text-[20px] font-semibold leading-tight tracking-tight truncate",
              TONE_TEXT[item.tone ?? "strong"],
            )}
          >
            {item.value}
          </dd>
          {item.hint ? (
            <p className="mt-1 text-[12px] text-muted leading-tight">{item.hint}</p>
          ) : null}
        </div>
      ))}
    </dl>
  );
}
