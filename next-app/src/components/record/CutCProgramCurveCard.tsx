"use client";

/**
 * Cut C · Record surface · Trend-section rolling-avg curve card.
 *
 * The load-bearing chart primitive. Renders:
 * - A slate rolling-average line (`--dv-curve-primary`, NOT bronze)
 * - Retest event pins overlaid on the curve, tri-color by outcome
 *   (green hit / muted hold / amber back · NEVER red per R8)
 * - Reduced gridlines (3 not 5) per Oura restraint
 * - Delta callout beneath the chart in mono tabular-nums
 * - Optional raw-points scatter overlay when the zoom tier is 30d or
 *   90d (Oura decimation split — raw points hidden at 1y / All)
 *
 * Uses Recharts (already in the bundle, lazy-loaded for
 * SymptomLoadChart). Adding this second chart to the same lazy chunk
 * costs zero incremental bundle bytes.
 *
 * Batch 37 pattern reminder: no `?? []` inside a useStore selector.
 * Data flows via props.
 */

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import type { Program, Store } from "@/lib/schemas";
import {
  evaluateRetestMetrics,
  formatMetric,
  type RetestValue,
} from "@/lib/engine/retest-evaluator";
import { computeRollingAvg, capToWindow, type CurvePoint } from "@/lib/engine/rolling-avg";
import type { WindowTier } from "./CutCWindowTierControl";
import { cn } from "@/lib/utils";

// Lazy Recharts — same chunk that SymptomLoadChart uses. Zero incremental cost.
const RechartsChart = dynamic(
  () => import("./_CutCRechartsInner").then((m) => ({ default: m.CutCRechartsInner })),
  {
    ssr: false,
    loading: () => (
      <div className="h-[200px] flex items-center justify-center text-[12px] text-muted italic">
        Loading chart…
      </div>
    ),
  },
);

export type CutCProgramCurveCardProps = {
  program: Program;
  store: Store;
  zoomTier: WindowTier;
  className?: string;
};

function pickPrimaryMetric(program: Program, store: Store): RetestValue | null {
  const userTier = program.slug
    ? store.user_profile?.program_states?.[program.slug]?.tier
    : undefined;
  const values = evaluateRetestMetrics(program, store, userTier);
  const withData = values.filter((v) => v.current != null);
  if (withData.length === 0) return null;

  // Primary = most-readings metric (matches RetestTimeline choice for
  // consistency across the two Trend components).
  const readings = store.retest_readings ?? [];
  let primary = withData[0];
  let count = 0;
  for (const v of withData) {
    const c = readings.filter((r) => r.metric_id === v.metric_id).length;
    if (c > count) {
      count = c;
      primary = v;
    }
  }
  return primary;
}

const WINDOW_DAYS: Record<WindowTier, number | null> = {
  "30d": 30,
  "90d": 90,
  "1y": 365,
  "all": null,
};

const ROLLING_WINDOW_DAYS: Record<WindowTier, number> = {
  "30d": 7,   // 1-week rolling avg at 30d zoom
  "90d": 14,  // 2-week rolling at 90d
  "1y": 28,   // 4-week rolling at 1y
  "all": 84,  // 12-week rolling at All
};

export function CutCProgramCurveCard({
  program,
  store,
  zoomTier,
  className,
}: CutCProgramCurveCardProps) {
  const [showRaw, setShowRaw] = useState(false);
  const rawByDefault = zoomTier === "30d" || zoomTier === "90d";
  const effectiveShowRaw = rawByDefault || showRaw;

  const metric = useMemo(() => pickPrimaryMetric(program, store), [program, store]);

  const { points, allInWindow } = useMemo(() => {
    if (!metric) return { points: [], allInWindow: [] as CurvePoint[] };
    const windowDays = WINDOW_DAYS[zoomTier];
    const rollingWindow = ROLLING_WINDOW_DAYS[zoomTier];
    const raw = computeRollingAvg(store, metric.metric_id, rollingWindow);
    const capped = capToWindow(raw, windowDays);
    return { points: capped, allInWindow: capped };
  }, [metric, store, zoomTier]);

  if (!metric || points.length === 0) {
    return (
      <div className={cn("rounded border border-line-soft bg-surface p-3", className)}>
        <p className="font-mono text-[10px] font-medium uppercase tracking-widest text-muted mb-2">
          Rolling {ROLLING_WINDOW_DAYS[zoomTier]}-day avg
        </p>
        <p className="text-[12px] text-muted italic">
          The trend curve builds here once you have two or more retest readings for the same metric.
        </p>
      </div>
    );
  }

  const higherBetter = metric.direction === "higher_is_better";
  const currentAvg = points[points.length - 1].rollingAvg ?? null;
  const firstAvg = points[0].rollingAvg ?? null;
  const deltaAvg = currentAvg != null && firstAvg != null ? currentAvg - firstAvg : null;
  const deltaSign = deltaAvg == null ? "" : deltaAvg > 0 ? "+" : deltaAvg < 0 ? "−" : "";
  const deltaAbs = deltaAvg == null ? "" : Math.abs(deltaAvg).toFixed(1);

  return (
    <div className={cn("rounded border border-line-soft bg-surface p-3", className)}>
      <p className="font-mono text-[10px] font-medium uppercase tracking-widest text-muted mb-2">
        {ROLLING_WINDOW_DAYS[zoomTier]}-day rolling {metric.display_name} · {higherBetter ? "higher is better" : "lower is better"}
      </p>

      <div style={{ height: 200 }}>
        <RechartsChart
          points={allInWindow}
          showRaw={effectiveShowRaw}
          unit={metric.unit}
          direction={metric.direction}
        />
      </div>

      {/* Legend row */}
      <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-muted">
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden className="inline-block w-3.5 h-0.5 bg-[var(--dv-curve-primary)] align-middle" />
          {ROLLING_WINDOW_DAYS[zoomTier]}-day rolling avg
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden className="inline-block w-2 h-2 rounded-full bg-[var(--dv-retest-hit)] border border-strong align-middle" />
          retest event
        </span>
      </div>

      {/* Show raw toggle — hidden by default at 1y / All (Oura split) */}
      {!rawByDefault ? (
        <div className="mt-2">
          <button
            type="button"
            onClick={() => setShowRaw((v) => !v)}
            aria-pressed={showRaw}
            className="border border-line-strong rounded px-3 py-2 min-h-[44px] font-mono text-[11px] uppercase tracking-widest text-ink motion-reduce:transition-none transition-colors hover:bg-line-soft focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-bronze focus-visible:outline-offset-2"
          >
            {showRaw ? "Hide raw" : "Show raw"}
          </button>
        </div>
      ) : null}

      {/* Delta callout */}
      {deltaAvg != null ? (
        <p className="mt-2 font-mono text-[12px] text-ink tabular-nums">
          Avg {formatMetric(currentAvg, metric.unit)}   {deltaSign}
          {deltaAbs} since {points[0].date}
        </p>
      ) : null}
    </div>
  );
}
