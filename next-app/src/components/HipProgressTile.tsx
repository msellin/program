"use client";

import Link from "next/link";
import { useStore } from "@/lib/useStore";
import { HIP_FLEXOR_PACK } from "@/lib/assessments-data";
import {
  isDue,
  packScoreSeries,
  rehabAdherence,
} from "@/lib/engine/assessment-engine";
import { today } from "@/lib/utils";

/**
 * Progress tile focused on the hip-flexor sub-track.
 *
 * Post-rebuild (2026-08-18): two data views instead of three. The 90d
 * symptom trend column was dropped — the top-level SymptomLoadChart
 * renders the same signal at higher fidelity (single home for the
 * chart, per the density-brief decision).
 *
 *   1. Monthly hip-check overall score (from the self-scored pack)
 *   2. Rehab adherence — % of days in the last 30 that block_a_home was touched
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
  const adherence = rehabAdherence(store, "block_a_home", 30, todayISO);

  const latest = scoreSeries[scoreSeries.length - 1];
  const previous = scoreSeries.length >= 2 ? scoreSeries[scoreSeries.length - 2] : null;
  const delta = latest && previous ? latest.overall - previous.overall : null;

  return (
    <section className="space-y-3">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-mono text-[13px] uppercase tracking-widest">Hip flexor &amp; balance</h2>
        {dueStatus.due ? (
          <Link
            href="/check/hip"
            className="font-mono text-[10px] uppercase tracking-widest px-2 py-1 rounded bg-slate text-surface"
          >
            Check due →
          </Link>
        ) : (
          <span className="font-mono text-[11px] text-muted">
            Next check in {Math.max(0, dueStatus.cadence - (dueStatus.daysSince ?? 0))} days
          </span>
        )}
      </div>

      <p className="text-[13px] text-muted">
        Trend for the sub-track from the clinical reports — subjective self-checks, morning
        symptoms, and daily rehab consistency. No claims about diagnosis.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Monthly self-check score */}
        <div className="rounded border border-line bg-surface p-3">
          <p className="mono-caps text-muted">Monthly check (lower = better)</p>
          {latest ? (
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-mono tabular-nums text-strong">
                {latest.overall.toFixed(1)}
              </span>
              {delta != null ? (
                <span
                  className={
                    "font-mono text-[12px] " +
                    (delta > 0.3 ? "text-red" : delta < -0.3 ? "text-green" : "text-muted")
                  }
                >
                  {delta >= 0 ? "+" : ""}
                  {delta.toFixed(1)} vs last
                </span>
              ) : null}
            </div>
          ) : (
            <p className="mt-1 text-[13px] text-muted">Not logged yet.</p>
          )}
          <MiniSpark points={scoreSeries.map((p) => p.overall)} max={10} />
          {scoreSeries.length > 0 ? (
            <p className="mt-1 font-mono text-[10px] text-muted">
              {scoreSeries.length} entr{scoreSeries.length === 1 ? "y" : "ies"} · latest {latest?.date}
            </p>
          ) : null}
        </div>

        {/* Rehab adherence */}
        <div className="rounded border border-line bg-surface p-3">
          <p className="mono-caps text-muted">Rehab · last 30d</p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-mono tabular-nums text-strong">
              {adherence.doneDays}/{adherence.totalDays}
            </span>
            <span className="font-mono text-[12px] text-muted">
              {Math.round(adherence.ratio * 100)}%
            </span>
          </div>
          <div className="mt-2 h-1.5 rounded bg-line-soft overflow-hidden">
            <div
              className="h-full bg-bronze"
              style={{ width: `${Math.round(adherence.ratio * 100)}%` }}
              aria-hidden
            />
          </div>
          <p className="mt-2 text-[12px] text-muted">
            Home rehab is the daily consistency layer the clinical file leans on. High
            adherence here is what protects everything else.
          </p>
        </div>
      </div>
    </section>
  );
}

/** Small inline sparkline built from CSS bars — Recharts is overkill for 6 points. */
function MiniSpark({ points, max }: { points: number[]; max: number }) {
  if (points.length === 0) {
    return (
      <div className="mt-2 h-8 rounded bg-line-soft/40 flex items-center justify-center">
        <span className="text-[10px] text-muted italic">No data yet</span>
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

