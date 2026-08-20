"use client";

/**
 * Batch 35 · minimal SVG sparkline for retest metric trends.
 *
 * Renders a small line-chart of `values` in a fixed viewport. Zero
 * dependencies (Recharts would add ~112 KB — sparkline is 30 lines
 * of SVG math). Auto-scales to the data range so a metric that moves
 * 138→132 bpm and one that moves 90→85 seconds both fill the box.
 *
 * `direction` controls the accent color:
 *   - "improving" (matches program-goal direction) → green
 *   - "worsening" → amber
 *   - "flat" → muted line
 * The visual is honest — trending in the wrong direction shouldn't
 * read as celebration. R5 no-gamification: no confetti, no glow.
 */
export function Sparkline({
  values,
  direction = "flat",
  width = 96,
  height = 24,
  className,
}: {
  values: number[];
  direction?: "improving" | "worsening" | "flat";
  width?: number;
  height?: number;
  className?: string;
}) {
  if (!values.length || values.length < 2) return null;

  const min = Math.min(...values);
  const max = Math.max(...values);
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

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      aria-hidden
      className={className}
    >
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
  );
}
