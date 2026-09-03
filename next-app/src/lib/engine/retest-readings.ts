/**
 * The one read path for retest reading *history* — logged and derived, merged.
 *
 * A retest metric had two halves reading two different sources.
 * `evaluateRetestMetrics` resolved `current` and `baseline` from the metric's
 * declared `source_ref`, so the number on the card was real. But every
 * surface that shows the metric *over time* — the Record timeline pins, the
 * Progress sparkline, the rolling trend curve, and the non-responder
 * classifier's baselines — read `store.retest_readings`, which is populated
 * only by hand through the retest sheet.
 *
 * So a rowing user rowed the prescribed 2K inside the session, it landed in
 * `runs[]`, the card showed the time it produced, and the timeline underneath
 * stayed empty until they opened a second sheet and typed the same number in
 * again.
 *
 * One consumer had noticed and patched around it privately:
 * `HeritageClusterChip.collectBaselines` derived readings from `runs[]`, but
 * only when `retest_readings` was ENTIRELY empty, and only for the
 * classifier's `primary_signal_metric_id`. So the first hand-logged reading
 * of any metric switched derivation off for every metric — the double-entry
 * problem got worse after the first manual entry, not better. That function
 * is gone; this module replaces it, and it merges rather than falls back.
 *
 * Merge rule: a hand-logged reading wins over a derived one on the same
 * (metric_id, observed_at). Typing a number is a more deliberate statement
 * than a field read off a session. Everything else is a union.
 *
 * Parsing is NOT re-implemented here — `retest-evaluator.ts` owns
 * `source_ref` and exposes `deriveMetricSeries`. There were three parsers of
 * that grammar in the codebase before this change; there is one now.
 */

import type { Store, Program } from "../schemas";
import type { MetricBaseline } from "./non-responder-classifier";
import { deriveMetricSeries } from "./retest-evaluator";

/** Where a reading came from. */
export type ReadingOrigin = "logged" | "derived";

export type ResolvedReading = MetricBaseline & { origin: ReadingOrigin };

type RetestMetricLike = {
  metric_id?: string;
  source?: string;
  source_ref?: string;
};

/**
 * Declared metrics with mid-block duplicates collapsed. A mid-block entry
 * routinely shares its `metric_id` with its end-of-block sibling — same
 * measurement, different cadence — and deriving both would put every run on
 * the curve twice.
 */
function declaredMetrics(program: Program): RetestMetricLike[] {
  const p = program as unknown as {
    retest_metrics?: RetestMetricLike[];
    retest_metrics_mid_block?: RetestMetricLike[];
  };
  const out: RetestMetricLike[] = [];
  const seen = new Set<string>();
  for (const m of [...(p.retest_metrics ?? []), ...(p.retest_metrics_mid_block ?? [])]) {
    const id = m?.metric_id;
    if (!id || seen.has(id)) continue;
    seen.add(id);
    out.push(m);
  }
  return out;
}

/**
 * Every reading available for `program`, logged and derived, merged and
 * sorted ascending by date (then metric id, so ordering is stable).
 *
 * Logged readings for metrics the program no longer declares are kept — a
 * user who switches programs should not silently lose their history.
 */
export function resolveRetestReadings(
  store: Store,
  program: Program | null | undefined,
): ResolvedReading[] {
  const merged: ResolvedReading[] = (store.retest_readings ?? []).map((r) => ({
    ...r,
    origin: "logged" as const,
  }));
  const taken = new Set(merged.map((r) => `${r.metric_id} ${r.observed_at}`));

  if (program) {
    for (const metric of declaredMetrics(program)) {
      const id = metric.metric_id;
      if (!id) continue;
      for (const point of deriveMetricSeries(store, metric, program.slug)) {
        const key = `${id} ${point.observed_at}`;
        if (taken.has(key)) continue;
        taken.add(key);
        merged.push({
          metric_id: id,
          value: point.value,
          observed_at: point.observed_at,
          origin: "derived",
        });
      }
    }
  }

  return merged.sort(
    (a, b) =>
      a.observed_at.localeCompare(b.observed_at) ||
      a.metric_id.localeCompare(b.metric_id),
  );
}

/** Readings for one metric, in date order. */
export function readingsForMetric(
  store: Store,
  program: Program | null | undefined,
  metricId: string,
): ResolvedReading[] {
  return resolveRetestReadings(store, program).filter((r) => r.metric_id === metricId);
}
