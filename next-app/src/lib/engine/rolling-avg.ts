/**
 * Cut C · Rolling-average helper for the Record surface's Trend curve.
 *
 * Given the retest_readings for a metric (or run-field values), returns
 * a series of `{ date, rollingAvg }` points at the requested window.
 * Consumed by CutCProgramCurveCard for its slate line + baseline math.
 *
 * Peer alignment: Oura Trends math (rolling window default per-tier),
 * TrainingPeaks CTL (42-day EWMA — we don't do EWMA; simple rolling
 * arithmetic mean is honest enough at 4-12 week windows).
 *
 * Direction is respected downstream — this file just computes values.
 */

import type { Store } from "../schemas";

export type CurvePoint = {
  /** ISO date (YYYY-MM-DD) */
  date: string;
  /** Raw reading value at that date (may be null if smoothed-only) */
  raw?: number;
  /** Rolling-window average up to and including this date, null when not enough history */
  rollingAvg: number | null;
};

/**
 * Build the rolling-avg curve from `retest_readings` for one metric.
 * Rolling window is in days. When a retest has multiple readings within
 * the window, they average together.
 *
 * Note: This is a fact-only computation. Direction ("higher_is_better"
 * vs "lower_is_better") is a display-time decision — the raw numbers
 * flow through unchanged. The consumer flips the Y-axis if needed.
 */
export function computeRollingAvg(
  store: Store,
  metricId: string,
  windowDays: number,
): CurvePoint[] {
  const readings = (store.retest_readings ?? [])
    .filter((r) => r.metric_id === metricId)
    .sort((a, b) => a.observed_at.localeCompare(b.observed_at));
  if (readings.length === 0) return [];

  const points: CurvePoint[] = [];
  for (let i = 0; i < readings.length; i++) {
    const anchor = readings[i];
    const anchorDate = new Date(anchor.observed_at + "T00:00:00");
    const windowStart = new Date(anchorDate);
    windowStart.setDate(anchorDate.getDate() - windowDays);
    // Include every reading whose observed_at falls in [windowStart, anchor]
    const inWindow = readings.filter((r) => {
      const d = new Date(r.observed_at + "T00:00:00");
      return d >= windowStart && d <= anchorDate;
    });
    const sum = inWindow.reduce((acc, r) => acc + r.value, 0);
    const avg = inWindow.length > 0 ? sum / inWindow.length : null;
    points.push({
      date: anchor.observed_at,
      raw: anchor.value,
      rollingAvg: avg,
    });
  }
  return points;
}

/**
 * Cap points to the visible zoom window. Callers pass a zoom tier's
 * day range; the curve chops off older-than-cutoff points so the chart
 * doesn't render 10 years of history when the user selected 30d.
 */
export function capToWindow(
  points: CurvePoint[],
  windowDays: number | null,
): CurvePoint[] {
  if (windowDays == null) return points; // "All"
  if (points.length === 0) return points;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const cutoff = new Date(today);
  cutoff.setDate(today.getDate() - windowDays);
  return points.filter((p) => {
    const d = new Date(p.date + "T00:00:00");
    return d >= cutoff;
  });
}
