"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import {
  deltaFromBaseline,
  evaluateRetestMetrics,
  formatMetric,
  type RetestValue,
} from "@/lib/engine/retest-evaluator";
import { dueRetestMetrics } from "@/lib/engine/tier-promotion";
import { useStore } from "@/lib/useStore";
import { today as todayISO } from "@/lib/utils";
import type { Program, Store } from "@/lib/schemas";

/**
 * The load-bearing "how am I doing?" surface for every non-hip program.
 *
 * Reads `program.retest_metrics[]` and renders one card per metric with:
 *   - Baseline (first logged value)
 *   - Current (latest logged value)
 *   - Delta from baseline (green when improving in the metric's direction)
 *   - Tier target + stretch, when the user's tier supplies them
 *   - For physical_test metrics that are DUE: an inline Retest form.
 *
 * Unsupported metric queries render a placeholder rather than throwing.
 */
export function RetestMetricsPanel({
  program,
  store,
}: {
  program: Program;
  store: Store;
}) {
  const slug = program.slug;
  const userTier = slug ? store.user_profile?.program_states?.[slug]?.tier : undefined;
  const values = evaluateRetestMetrics(program, store, userTier);
  const due = dueRetestMetrics(program, store, todayISO(), userTier);
  const dueIds = new Set(due.map((m) => m.metric_id));
  const isPhysicalTest = (metricId: string): boolean => {
    const raw = (program as unknown as { retest_metrics?: Array<{ metric_id?: string; source?: string }> })
      .retest_metrics;
    return !!raw?.find((r) => r.metric_id === metricId && r.source === "physical_test");
  };

  if (!values.length) return null;

  return (
    <section className="space-y-3">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-[15px] font-semibold text-strong">Retest metrics</h2>
        <span className="text-[11px] text-muted">
          {userTier ? `Tier target: ${userTier}` : "Program targets"}
        </span>
      </div>
      <ul className="space-y-2">
        {values.map((m) => (
          <RetestCard
            key={m.metric_id}
            m={m}
            due={dueIds.has(m.metric_id)}
            canRetest={isPhysicalTest(m.metric_id)}
          />
        ))}
      </ul>
      <p className="text-[11px] text-muted italic">
        Current = latest logged value. Baseline = first. Delta measured in the
        metric&apos;s direction (lower is better for times, higher for kg).
      </p>
    </section>
  );
}

function RetestCard({
  m,
  due,
  canRetest,
}: {
  m: RetestValue;
  due: boolean;
  canRetest: boolean;
}) {
  const delta = deltaFromBaseline(m);
  const deltaColor = !delta
    ? "text-muted"
    : delta.isImprovement
      ? "text-green"
      : "text-amber";

  const [retestOpen, setRetestOpen] = useState(false);
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const recordCapabilityMeasurement = useStore((s) => s.recordCapabilityMeasurement);
  // HERITAGE Phase 5 (2026-08-18 · #73) — dual-write so a reading logged
  // through the Progress panel ALSO lands in retest_readings for the
  // classifier. capability_profile drives tier-eligibility; retest_readings
  // drives Cluster A/B/C. Both are true, and both should be updated by the
  // same user action.
  const logRetestReading = useStore((s) => s.logRetestReading);
  const activeSlug = useStore((s) => s.store.user_profile?.active_program_id);

  const submit = () => {
    const num = Number(value);
    if (!Number.isFinite(num) || num < 0) {
      setError("Enter a positive number.");
      return;
    }
    recordCapabilityMeasurement(m.metric_id, num, m.unit);
    logRetestReading({
      metric_id: m.metric_id,
      value: num,
      observed_at: todayISO(),
      program_slug: activeSlug,
    });
    setValue("");
    setRetestOpen(false);
  };

  return (
    <li className="rounded border border-line-soft bg-surface p-3">
      <div className="flex items-baseline justify-between gap-2 flex-wrap">
        <p className="font-semibold text-sm text-strong flex items-center gap-1.5">
          {m.display_name}
          {due && canRetest ? (
            <span className="font-mono text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-bronze/20 text-bronze">
              retest due
            </span>
          ) : null}
        </p>
        {m.at_week ? (
          <span className="font-mono text-[10px] text-muted uppercase tracking-wider">
            check at week {m.at_week}
          </span>
        ) : null}
      </div>

      {!m.supported ? (
        <p className="mt-1 text-[13px] text-muted italic">
          {m.note ?? "Not yet trackable in the app."}
        </p>
      ) : m.baseline == null && m.current == null && canRetest ? (
        // Empty-state prompt when no readings exist yet and the user can
        // actually log them. Was rendering `— · — · —` in a silent grid;
        // comprehensive audit 2026-08-18 P1-5 flagged that users don't
        // realize physical-test metrics need their own log input.
        <p className="mt-2 text-[13px] text-muted italic">
          No readings yet. Log your baseline below so the delta has something to track against.
        </p>
      ) : (
        <div className="mt-2 grid grid-cols-3 gap-2 text-[13px]">
          <div>
            <p className="text-muted text-[10px] uppercase tracking-wider">Baseline</p>
            <p className="font-mono text-ink">{formatMetric(m.baseline, m.unit)}</p>
          </div>
          <div>
            <p className="text-muted text-[10px] uppercase tracking-wider">Current</p>
            <p className="font-mono text-strong font-semibold">
              {formatMetric(m.current, m.unit)}
            </p>
          </div>
          <div>
            <p className="text-muted text-[10px] uppercase tracking-wider">Δ</p>
            <p className={`font-mono ${deltaColor}`}>
              {delta ? formatDelta(delta.value, m.unit) : "—"}
            </p>
          </div>
        </div>
      )}

      {m.supported && (m.target != null || m.stretch != null) ? (
        <p className="mt-2 text-[11px] text-muted">
          Target {formatMetric(m.target, m.unit)}
          {m.stretch != null ? ` · stretch ${formatMetric(m.stretch, m.unit)}` : ""}
        </p>
      ) : null}

      {canRetest ? (
        <div className="mt-3 pt-2 border-t border-line-soft">
          {retestOpen ? (
            <div className="space-y-2">
              <label className="block text-[12px] text-muted">
                New reading ({m.unit})
                <input
                  type="number"
                  step="any"
                  min="0"
                  value={value}
                  onChange={(e) => {
                    setValue(e.target.value);
                    setError(null);
                  }}
                  className="mt-1 w-full px-2 py-2 min-h-[40px] border border-line rounded bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-bronze focus:border-bronze font-mono"
                  autoFocus
                />
              </label>
              {error ? <p className="text-[11px] text-red">{error}</p> : null}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={submit}
                  className="flex-1 bg-bronze text-ground rounded py-2 min-h-[40px] text-[12px] font-mono uppercase tracking-wider hover:bg-bronze-hover"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRetestOpen(false);
                    setValue("");
                    setError(null);
                  }}
                  className="border border-line rounded py-2 px-3 min-h-[40px] text-[12px] font-mono uppercase tracking-wider hover:bg-line-soft"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setRetestOpen(true)}
              className="inline-flex items-center gap-1.5 text-[12px] font-mono uppercase tracking-wider text-slate hover:text-ink"
            >
              <RefreshCw size={11} />
              {due
                ? "Retest — log new reading"
                : m.baseline == null
                  ? "Log baseline"
                  : "Log a new reading"}
            </button>
          )}
        </div>
      ) : null}
    </li>
  );
}

function formatDelta(value: number, unit: string): string {
  const sign = value < 0 ? "−" : value > 0 ? "+" : "";
  if (unit === "seconds") {
    const abs = Math.abs(Math.round(value));
    return `${sign}${Math.floor(abs / 60) ? Math.floor(abs / 60) + ":" + String(abs % 60).padStart(2, "0") : abs + "s"}`;
  }
  return `${sign}${Math.abs(value).toFixed(1)} ${unit}`;
}
