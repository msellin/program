"use client";

/**
 * Cut C · Record surface · Now-section tenure-identity anchor.
 *
 * The load-bearing "you are 400 days in" surface. Shows the most
 * recent retest event with:
 *   - Metric name + current value + delta chip
 *   - vs-previous line with the previous value + date
 *   - Since-baseline mono-caps line ("+25.0 KG SINCE Q1'24 · 14 RETESTS")
 *   - Basis line naming the log signal that triggered it
 *   - Inline citation (first-class UI per matrix rec #4, NOT a footnote)
 *   - Next-retest-in-Nd chip
 * With a 4px left rail in `text-strong` marking it as a tenure event.
 *
 * See dev/active/redesign-progress/DESIGN-cut-c.md · LatestRetestTile.
 * See mockup: dev/active/redesign-progress/record-mockup-day400-v3.png
 *
 * Retest events supersede PRs per R-CutC-1 — do NOT add PR-badge
 * language, achievement chips, or streak counts to this component.
 *
 * Batch 37 pattern reminder: no `?? []` inside a useStore selector
 * (React #185 trap). Data flows via props.
 */

import { useMemo } from "react";
import {
  deltaFromBaseline,
  evaluateRetestMetrics,
  formatMetric,
  type RetestValue,
} from "@/lib/engine/retest-evaluator";
import { resolveRetestReadings, readingsForMetric } from "@/lib/engine/retest-readings";
import type { Program, Store } from "@/lib/schemas";
import { cn } from "@/lib/utils";
import { cardClass } from "@/components/ui/Card";

export type CutCLatestRetestTileProps = {
  program: Program;
  store: Store;
  className?: string;
};

/**
 * Pick the most recent retest event across program.retest_metrics
 * that has both a baseline AND a current value (i.e. the user has
 * completed at least one retest with prior baseline in place).
 * Returns null if no metric qualifies — parent renders a "no retest
 * yet" placeholder instead.
 */
function pickLatestRetest(
  program: Program,
  store: Store,
): { metric: RetestValue; nextRetestInDays: number | null } | null {
  const userTier = program.slug
    ? store.user_profile?.program_states?.[program.slug]?.tier
    : undefined;
  const values = evaluateRetestMetrics(program, store, userTier);
  // P-05 (2026-10-27): the card and the chart must read one source. The evaluator's
  // current/baseline can differ from the logged readings (and show 0 / 0.0 beside a
  // chart averaging 109), so both come from the readings. Fewer than 2 readings means
  // there is nothing to compare: hide the card rather than show a delta of zero.
  const readings = resolveRetestReadings(store, program);
  const withData: RetestValue[] = [];
  for (const v of values) {
    const rs = readings
      .filter((r) => r.metric_id === v.metric_id)
      .sort((a, b) => a.observed_at.localeCompare(b.observed_at));
    if (rs.length < 2) continue;
    withData.push({ ...v, baseline: rs[0].value, current: rs[rs.length - 1].value });
  }
  if (withData.length === 0) return null;

  // Prefer the metric whose most-recent reading is most recent (matches
  // the mockup's "latest retest" concept).
  let bestMetric: RetestValue = withData[0];
  let bestDate = "";
  for (const v of withData) {
    const latest = readings
      .filter((r) => r.metric_id === v.metric_id)
      .sort((a, b) => b.observed_at.localeCompare(a.observed_at))[0];
    const date = latest?.observed_at ?? "";
    if (date > bestDate) {
      bestDate = date;
      bestMetric = v;
    }
  }

  // Compute days-until-next-retest from cadence_weeks and last reading.
  let nextRetestInDays: number | null = null;
  if (bestMetric.cadence_weeks && bestDate) {
    const last = new Date(bestDate + "T00:00:00");
    const next = new Date(last);
    next.setDate(last.getDate() + bestMetric.cadence_weeks * 7);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffMs = next.getTime() - today.getTime();
    nextRetestInDays = Math.max(0, Math.round(diffMs / (1000 * 60 * 60 * 24)));
  }

  return { metric: bestMetric, nextRetestInDays };
}

function formatSinceBaseline(m: RetestValue, retestCount: number): string {
  if (m.current == null || m.baseline == null) return "";
  const delta = m.current - m.baseline;
  const sign = delta > 0 ? "+" : delta < 0 ? "−" : "";
  const abs = Math.abs(delta);
  const formatted = m.unit === "seconds" ? `${Math.round(abs)}s` : abs.toFixed(1);
  return `${sign}${formatted} ${m.unit} since baseline · ${retestCount} retest${retestCount === 1 ? "" : "s"}`;
}

export function CutCLatestRetestTile({ program, store, className }: CutCLatestRetestTileProps) {
  const picked = useMemo(() => pickLatestRetest(program, store), [program, store]);

  if (!picked) return null;

  const { metric, nextRetestInDays } = picked;
  const delta = deltaFromBaseline(metric);
  const retestCount = readingsForMetric(store, program, metric.metric_id).length;

  const deltaColor = !delta || delta.value === 0
    ? "text-muted"
    : delta.isImprovement
      ? "text-green"
      : "text-amber";

  // Prev reading for the "vs" line — sort readings, pick the second-latest.
  const readings = readingsForMetric(store, program, metric.metric_id).slice().reverse();
  const prev = readings[1];

  return (
    <div
      className={cn(
        cardClass(),
        className,
      )}
    >
      <p className="font-mono text-eyebrow font-medium uppercase tracking-widest text-muted mb-2">
        Latest retest · {metric.display_name}
      </p>

      {/* Metric row: name + value + delta */}
      <div className="flex items-baseline justify-between gap-2 flex-wrap">
        <span className="text-small font-semibold text-strong">
          {metric.display_name}
        </span>
        <span className="inline-flex items-baseline gap-2">
          <span className="text-h2 text-strong font-mono tabular-nums">
            {formatMetric(metric.current, metric.unit)}
          </span>
          {delta ? (
            <span className={`font-mono text-small tabular-nums ${deltaColor}`}>
              {delta.value > 0 ? "+" : delta.value < 0 ? "−" : ""}
              {Math.abs(delta.value).toFixed(1)}
            </span>
          ) : null}
        </span>
      </div>

      {/* vs-previous line */}
      {prev ? (
        <div className="mt-1 flex items-baseline justify-between text-caption text-muted">
          <span>vs previous ({prev.observed_at})</span>
          <span className="mono">{formatMetric(prev.value, metric.unit)}</span>
        </div>
      ) : null}

      {/* Since-baseline tenure line */}
      <p className="mt-1 font-mono text-eyebrow uppercase tracking-widest text-muted tabular-nums">
        {formatSinceBaseline(metric, retestCount)}
      </p>

      {/* Next-retest chip */}
      {nextRetestInDays != null ? (
        <p className="mt-2 text-right text-eyebrow text-muted font-mono tabular-nums">
          Next test in {nextRetestInDays} day{nextRetestInDays === 1 ? "" : "s"}
        </p>
      ) : null}
    </div>
  );
}
