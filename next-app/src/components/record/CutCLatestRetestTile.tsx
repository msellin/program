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
import Link from "next/link";
import {
  deltaFromBaseline,
  evaluateRetestMetrics,
  formatMetric,
  type RetestValue,
} from "@/lib/engine/retest-evaluator";
import type { Program, Store } from "@/lib/schemas";
import { CitationRef } from "@/components/citations/CitationRef";
import { cn } from "@/lib/utils";

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
  const withData = values.filter((v) => v.current != null && v.baseline != null);
  if (withData.length === 0) return null;

  // Prefer the metric whose most-recent reading in retest_readings is
  // most recent (matches the mockup's "latest retest" concept).
  const readings = store.retest_readings ?? [];
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

/**
 * Basis line — names the log signal that triggered the retest.
 * Falls back to a program-agnostic default when the metric doesn't
 * carry an explicit signal name.
 */
function basisLine(m: RetestValue, store: Store): string {
  const readings = store.retest_readings ?? [];
  const count = readings.filter((r) => r.metric_id === m.metric_id).length;
  if (count === 0) return `Basis · first reading`;
  // Prefer explicit signal name from the metric config if the program
  // schema carries it (extended per program in Cut A retest-cadence work).
  const anyM = m as unknown as { signal_name?: string };
  if (anyM.signal_name) {
    return `Basis · log signal \`${anyM.signal_name}\``;
  }
  return `Basis · ${count} reading${count === 1 ? "" : "s"} logged`;
}

export function CutCLatestRetestTile({ program, store, className }: CutCLatestRetestTileProps) {
  const picked = useMemo(() => pickLatestRetest(program, store), [program, store]);

  if (!picked) {
    return (
      <div className={cn("rounded border border-line-soft bg-surface p-3", className)}>
        <p className="font-mono text-[10px] font-medium uppercase tracking-widest text-muted mb-2">
          Latest retest
        </p>
        <p className="text-[14px] text-muted italic">
          Your first retest lands here once you have a baseline reading. Log a session at the retest window to seed it.
        </p>
        <Link
          href="/check/"
          className="mt-2 inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-widest text-slate hover:text-ink"
        >
          Log a check →
        </Link>
      </div>
    );
  }

  const { metric, nextRetestInDays } = picked;
  const delta = deltaFromBaseline(metric);
  const retestCount = (store.retest_readings ?? []).filter(
    (r) => r.metric_id === metric.metric_id,
  ).length;

  const deltaColor = !delta
    ? "text-muted"
    : delta.isImprovement
      ? "text-green"
      : "text-amber";

  // Prev reading for the "vs" line — sort readings, pick the second-latest.
  const readings = (store.retest_readings ?? [])
    .filter((r) => r.metric_id === metric.metric_id)
    .sort((a, b) => b.observed_at.localeCompare(a.observed_at));
  const prev = readings[1];

  // Citation ID from program.retest_metrics config (if present).
  const rawMetrics = (program as unknown as { retest_metrics?: Array<{ metric_id?: string; citation_id?: string }> }).retest_metrics;
  const citationId = rawMetrics?.find((r) => r.metric_id === metric.metric_id)?.citation_id;

  return (
    <div
      className={cn(
        "rounded border border-line-soft bg-surface p-3 border-l-4 border-l-strong",
        className,
      )}
    >
      <p className="font-mono text-[10px] font-medium uppercase tracking-widest text-muted mb-2">
        Latest retest · {metric.display_name}
      </p>

      {/* Metric row: name + value + delta */}
      <div className="flex items-baseline justify-between gap-2 flex-wrap">
        <span className="text-[14px] font-semibold text-strong">
          {metric.display_name}
        </span>
        <span className="inline-flex items-baseline gap-2">
          <span className="text-[20px] font-semibold text-strong font-mono tabular-nums">
            {formatMetric(metric.current, metric.unit)}
          </span>
          {delta ? (
            <span className={`font-mono text-[14px] tabular-nums ${deltaColor}`}>
              {delta.value > 0 ? "+" : delta.value < 0 ? "−" : ""}
              {Math.abs(delta.value).toFixed(1)}
            </span>
          ) : null}
        </span>
      </div>

      {/* vs-previous line */}
      {prev ? (
        <div className="mt-1 flex items-baseline justify-between text-[12px] text-muted">
          <span>vs previous ({prev.observed_at})</span>
          <span className="mono">{formatMetric(prev.value, metric.unit)}</span>
        </div>
      ) : null}

      {/* Since-baseline tenure line */}
      <p className="mt-1 font-mono text-[11px] uppercase tracking-widest text-muted tabular-nums">
        {formatSinceBaseline(metric, retestCount)}
      </p>

      <hr className="my-2.5 border-0 h-px bg-line-soft" />

      {/* Basis + citation — inline body content, NOT a footnote (matrix rec #4). */}
      <p className="text-[12px] text-ink leading-relaxed">{basisLine(metric, store)}</p>

      {citationId ? (
        <div className="mt-1">
          <CitationRef id={citationId} />
        </div>
      ) : (
        <p className="mt-1 text-[11px] text-muted italic">
          Signal-cited · no study reference for this metric.
        </p>
      )}

      {/* Next-retest chip */}
      {nextRetestInDays != null ? (
        <p className="mt-2 text-right text-[11px] text-muted font-mono tabular-nums">
          Next retest in {nextRetestInDays}d
        </p>
      ) : null}
    </div>
  );
}
