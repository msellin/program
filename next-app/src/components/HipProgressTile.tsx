"use client";

import Link from "next/link";
import { useStore } from "@/lib/useStore";
import { HIP_FLEXOR_PACK } from "@/lib/assessments-data";
import {
  isDue,
  packScoreSeries,
} from "@/lib/engine/assessment-engine";
import { today } from "@/lib/utils";
import { cardClass } from "@/components/ui/Card";

/**
 * Progress tile focused on the hip-flexor sub-track.
 *
 * Post-rebuild (2026-08-18): two data views instead of three. The 90d
 * symptom trend column was dropped — the top-level SymptomLoadChart
 * renders the same signal at higher fidelity (single home for the
 * chart, per the density-brief decision).
 *
 *   1. Monthly hip-check overall score (from the self-scored pack)
 *
 * Zero medical claims. Every visualisation is a straight readout of what the
 * user logged. If nothing has been logged yet, tile prompts the user to start.
 */
export function HipProgressTile() {
  const store = useStore((s) => s.store);
  const pack = HIP_FLEXOR_PACK;
  const todayISO = today();

  const dueStatus = isDue(store, pack.id, todayISO);
  const scoreSeries = packScoreSeries(store, pack);

  const latest = scoreSeries[scoreSeries.length - 1];
  const previous = scoreSeries.length >= 2 ? scoreSeries[scoreSeries.length - 2] : null;
  const delta = latest && previous ? latest.overall - previous.overall : null;

  return (
    <section className="space-y-3">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-small uppercase tracking-widest">Hip flexor & balance</h2>
        {dueStatus.due ? (
          <Link
            href="/check/hip"
            className="text-eyebrow uppercase tracking-widest px-2 py-1 rounded-lg bg-slate text-surface"
          >
            Check due →
          </Link>
        ) : (
          <span className="text-eyebrow text-muted">
            Next check in {Math.max(0, dueStatus.cadence - (dueStatus.daysSince ?? 0))} days
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Monthly self-check score */}
        <div className={cardClass()}>
          <p className="text-muted text-caption font-medium">Monthly check (lower = better)</p>
          {latest ? (
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-h2 font-mono tabular-nums text-strong">
                {latest.overall.toFixed(1)}
              </span>
              {delta != null ? (
                <span
                  className={
                    "font-mono text-caption " +
                    (delta > 0.3 ? "text-red" : delta < -0.3 ? "text-green" : "text-muted")
                  }
                >
                  {delta >= 0 ? "+" : ""}
                  {delta.toFixed(1)} vs last
                </span>
              ) : null}
            </div>
          ) : (
            /* Batch 36 P1 (audit 2026-08-21 · app-copy) — was orient-only
               ("Not logged yet."). Empty state now also motivates + guides
               with an explicit run-length hint and the canonical §2.13
               arrow CTA to /check/hip. */
            <div className="mt-1 space-y-2">
              <p className="text-small text-muted">
                No hip check on file yet. Runs 6 items, ~4 min.
              </p>
              <Link
                href="/check/hip"
                className="inline-flex items-center gap-1 text-eyebrow uppercase tracking-widest text-slate hover:text-ink"
              >
                Start check →
              </Link>
            </div>
          )}
          <MiniSpark points={scoreSeries.map((p) => p.overall)} max={10} />
          {scoreSeries.length > 0 ? (
            <p className="mt-1 text-eyebrow text-muted">
              {scoreSeries.length} entr{scoreSeries.length === 1 ? "y" : "ies"} · latest {latest?.date}
            </p>
          ) : null}
        </div>

        {/* The "Rehab · last 30d" adherence card was cut (founder-feedback round 4, 2026-10-29): 0/30 beside a
            paragraph about the clinical file read as noise on Record; Plan and the week headline count sessions. */}
      </div>
    </section>
  );
}

/** Small inline sparkline built from CSS bars — Recharts is overkill for 6 points. */
function MiniSpark({ points, max }: { points: number[]; max: number }) {
  if (points.length === 0) {
    return (
      <div className="mt-2 h-8 rounded-lg bg-line-soft/40 flex items-center justify-center">
        <span className="text-eyebrow text-muted italic">No data yet</span>
      </div>
    );
  }
  return (
    <div className="mt-2 h-8 flex items-end gap-0.5" aria-hidden>
      {points.map((v, i) => (
        <span
          key={i}
          className="flex-1 rounded-sm bg-slate/60"
          style={{ height: `${Math.max(4, (v / max) * 100)}%` }}
        />
      ))}
    </div>
  );
}

