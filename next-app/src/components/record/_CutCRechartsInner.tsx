"use client";

/**
 * Recharts inner for CutCProgramCurveCard.
 *
 * Split into its own file so the parent can dynamic-import it (SSR-off)
 * without pulling recharts into the initial bundle. Reuses the same
 * lazy chunk as SymptomLoadChart — zero incremental bytes.
 *
 * Renders:
 * - The slate rolling-avg line (`--dv-curve-primary`)
 * - Optional raw-points scatter overlay
 * - 3 reduced gridlines (Oura restraint per DESIGN-cut-c.md)
 * - Themed axis in `--color-line-soft` gridlines, `--color-muted` labels
 */

import {
  ComposedChart,
  Line,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { CurvePoint } from "@/lib/engine/rolling-avg";

export type CutCRechartsInnerProps = {
  points: CurvePoint[];
  showRaw: boolean;
  unit: string;
  direction: "higher_is_better" | "lower_is_better";
};

function shortDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  const m = d.toLocaleString("en-US", { month: "short" });
  return `${d.getDate()} ${m}`;
}

export function CutCRechartsInner({ points, showRaw, unit, direction }: CutCRechartsInnerProps) {
  // Rows shaped for Recharts. `raw` is only present when the reading
  // exists; the rolling-avg line follows every point.
  const data = points.map((p) => ({
    date: p.date,
    short: shortDate(p.date),
    rollingAvg: p.rollingAvg,
    raw: showRaw ? (p.raw ?? null) : null,
  }));

  // For lower-is-better metrics, we don't invert the Y axis — the user
  // is expected to read the curve as-drawn. The Rest of the surface
  // makes the direction unambiguous ("lower is better" sub-label +
  // green delta chip).
  void direction; // reserved for future axis-orient overrides

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart
        data={data}
        margin={{ top: 8, right: 8, left: -8, bottom: 4 }}
      >
        <CartesianGrid
          stroke="#24272f"
          strokeWidth={1}
          horizontal
          vertical={false}
        />
        <XAxis
          dataKey="short"
          axisLine={{ stroke: "#3A3F4A" }}
          tickLine={false}
          tick={{ fill: "#93989f", fontSize: 10, fontFamily: "var(--font-mono)" }}
          interval="preserveStartEnd"
          minTickGap={30}
        />
        <YAxis
          axisLine={{ stroke: "#3A3F4A" }}
          tickLine={false}
          tick={{ fill: "#93989f", fontSize: 10, fontFamily: "var(--font-mono)" }}
          domain={["auto", "auto"]}
          width={40}
        />
        <Tooltip
          contentStyle={{
            background: "#16181c",
            border: "1px solid #3A3F4A",
            borderRadius: 4,
            fontSize: 12,
            color: "#D6D9DE",
          }}
          // Founder-reported 2026-08-21: default Recharts cursor draws a
          // full-height white rectangle band across the chart on hover/tap.
          // Ugly on the warm-dark palette + reads as "selection box". Replace
          // with a hairline dashed vertical guide in line-strong.
          cursor={{ stroke: "#3A3F4A", strokeWidth: 1, strokeDasharray: "3 3" }}
          formatter={(value, name) => {
            const num = typeof value === "number" ? value : null;
            if (num == null) return ["—", String(name)];
            const rounded =
              unit === "seconds" ? Math.round(num) : Number(num.toFixed(1));
            return [`${rounded} ${unit}`, name === "rollingAvg" ? "avg" : "raw"];
          }}
          labelFormatter={(label) => String(label)}
        />
        {/* Rolling-average line — slate, 2px stroke. NEVER bronze. */}
        <Line
          type="monotone"
          dataKey="rollingAvg"
          stroke="#79b8c4"
          strokeWidth={2}
          dot={false}
          isAnimationActive={false}
          name="rollingAvg"
          connectNulls
        />
        {showRaw ? (
          <Scatter
            dataKey="raw"
            fill="#6b717d"
            stroke="#f4f5f7"
            strokeWidth={1}
            r={3}
            isAnimationActive={false}
            name="raw"
          />
        ) : null}
      </ComposedChart>
    </ResponsiveContainer>
  );
}
