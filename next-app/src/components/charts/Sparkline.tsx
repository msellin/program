"use client";

/**
 * Sparkline — Batch 35 baseline + v1.1.1 §2.3 extensions.
 *
 * Renders a small line-chart of `values` in a fixed viewport. Zero
 * dependencies (Recharts would add ~112 KB — sparkline is 30 lines
 * of SVG math). Auto-scales to the data range.
 *
 * v1.1.1 additions:
 *   - `ariaLabel` — when provided, promotes container from aria-hidden
 *     to role="img". SR-visible. Per copy §5.1 format: "Readiness
 *     trend, 14 days, improving. Values ranged 2 to 4 out of 10.
 *     Latest reading 2." Third-person factual — no "chart", no "you",
 *     no exclamation.
 *   - `targetValue` — dashed horizontal reference line at that value.
 *     Used on retest metric cards to show target inline with actual.
 *   - `caption` — visible caption below the shape (copy §5.1).
 *
 * When n<2 returns a min-h wrapper (CLS-safe) instead of null so
 * hydration doesn't shift siblings.
 *
 * `direction` controls the accent color:
 *   - "improving" (matches program-goal direction) → green
 *   - "worsening" → amber
 *   - "flat" → muted line
 * Honest visual — trending wrong shouldn't read as celebration.
 * R5 no-gamification: no confetti, no glow.
 */
export type SparklineProps = {
  values: number[];
  direction?: "improving" | "worsening" | "flat";
  targetValue?: number;
  width?: number;
  height?: number;
  /** Optional SR-visible label. When provided, drops aria-hidden. */
  ariaLabel?: string;
  /** Optional visible caption below the shape. */
  caption?: string;
  className?: string;
};

export function Sparkline({
  values,
  direction = "flat",
  targetValue,
  width = 96,
  height = 24,
  ariaLabel,
  caption,
  className,
}: SparklineProps) {
  if (!values.length || values.length < 2) {
    // CLS-safe null-state — reserve height so late hydration doesn't
    // reflow siblings. Semantically equivalent to "nothing to show yet."
    return <div aria-hidden style={{ minHeight: 20 }} className={className} />;
  }

  const dataMin = Math.min(...values);
  const dataMax = Math.max(...values);
  // Include targetValue in the visible range so the reference line
  // sits on the chart, not clipped.
  const min = targetValue != null ? Math.min(dataMin, targetValue) : dataMin;
  const max = targetValue != null ? Math.max(dataMax, targetValue) : dataMax;
  const range = max - min || 1;
  const stepX = width / (values.length - 1);
  const pad = 2;

  const points = values
    .map((v, i) => {
      const x = i * stepX;
      const y = height - pad - ((v - min) / range) * (height - pad * 2);
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");

  const stroke =
    direction === "improving"
      ? "var(--color-green)"
      : direction === "worsening"
        ? "var(--color-amber)"
        : "var(--color-muted)";

  const lastX = (values.length - 1) * stepX;
  const lastY =
    height - pad - ((values[values.length - 1] - min) / range) * (height - pad * 2);

  const targetY =
    targetValue != null
      ? height - pad - ((targetValue - min) / range) * (height - pad * 2)
      : null;

  const isSrVisible = Boolean(ariaLabel);

  return (
    <div className={className}>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        role={isSrVisible ? "img" : undefined}
        aria-label={isSrVisible ? ariaLabel : undefined}
        aria-hidden={isSrVisible ? undefined : true}
        style={{ pointerEvents: "none" }}
      >
        {targetY != null ? (
          <line
            x1={0}
            x2={width}
            y1={targetY}
            y2={targetY}
            stroke="var(--color-line-strong)"
            strokeWidth={1}
            strokeDasharray="2 3"
          />
        ) : null}
        <polyline
          fill="none"
          stroke={stroke}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
        <circle cx={lastX} cy={lastY} r={2} fill={stroke} />
      </svg>
      {caption ? (
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted mt-1">
          {caption}
        </p>
      ) : null}
    </div>
  );
}
