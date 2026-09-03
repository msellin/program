"use client";

import { useMemo } from "react";
import { buildRacePlan, formatSplit } from "@/lib/engine/race-plan";
import { readingsForMetric } from "@/lib/engine/retest-readings";
import type { Program, Store } from "@/lib/schemas";

/**
 * The four numbers a rower needs on test day.
 *
 * `rowing-2k-test-prep`'s entire test-day instruction was "Full 2K. Warm-up +
 * all-out effort + cool-down" — while its progression tier sold "split
 * consistency across all four 500s", which nothing programmed and nothing
 * measured. A recreational rower who opens four seconds under target gives
 * the block back between 1000m and 1500m; pacing is the cheapest seconds
 * available and needs no extra fitness.
 *
 * Derived, never authored: a pacing table in the program JSON would show the
 * same splits to a 6:30 rower and an 8:30 rower. This computes from the
 * user's own baseline and their tier's target, so the numbers are theirs.
 *
 * Renders nothing when there is no baseline yet — on the day-1 baseline test
 * there is no plan to give, and inventing one would be worse than silence.
 */
export function RacePlanCard({
  program,
  store,
}: {
  program: Program | null | undefined;
  store: Store;
}) {
  const plan = useMemo(() => {
    if (!program?.slug) return null;
    const metric = (program as unknown as {
      retest_metrics?: Array<{
        metric_id?: string;
        direction?: string;
        targets?: Array<{ tier_id?: string; target?: number }>;
      }>;
    }).retest_metrics?.find((m) => m.metric_id === "row_2k_time_seconds");
    if (!metric) return null;

    // Baseline = the earliest recorded 2K. `readingsForMetric` merges the
    // hand-logged reading with anything derived from the run log, so a user
    // who logged the baseline inside the session is covered either way.
    const readings = readingsForMetric(store, program, "row_2k_time_seconds");
    const baseline = readings[0]?.value;
    if (baseline == null) return null;

    const tier = store.user_profile?.program_states?.[program.slug]?.tier;
    const row =
      (tier ? metric.targets?.find((t) => t.tier_id === tier) : undefined) ??
      metric.targets?.[0];
    if (typeof row?.target !== "number") return null;

    return buildRacePlan(baseline, row.target, { tierLabel: tier });
  }, [program, store]);

  if (!plan) return null;

  return (
    <div className="rounded border border-line-soft border-l-4 border-l-bronze bg-surface px-3.5 py-3 space-y-3">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[.16em] text-muted">
          Your plan for today
        </p>
        <p className="text-[15px] font-semibold text-strong tracking-[-.01em] mt-0.5">
          {formatSplit(plan.goal_total_s)} — average {formatSplit(plan.goal_average_split_s)}/500m
        </p>
        <p className="text-[12px] text-muted italic mt-0.5">{plan.basis}</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-[13px] border-collapse">
          <thead>
            <tr className="text-left text-muted border-b border-line-soft font-mono text-[10px] uppercase tracking-[.14em]">
              <th className="py-1.5 pr-3 font-normal">Through</th>
              <th className="py-1.5 pr-3 font-normal">Split</th>
              <th className="py-1.5 pr-3 font-normal">Rate</th>
            </tr>
          </thead>
          <tbody>
            {plan.splits.map((s) => (
              <tr key={s.piece} className="border-b border-line-soft/50 align-top">
                <td className="py-1.5 pr-3 font-mono text-ink whitespace-nowrap">{s.through_m}m</td>
                <td className="py-1.5 pr-3 font-mono text-strong whitespace-nowrap">
                  {formatSplit(s.target_split_s)}
                </td>
                <td className="py-1.5 pr-3 font-mono text-ink whitespace-nowrap">{s.target_spm}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="space-y-1 text-[13px] text-ink">
        {plan.splits.map((s) => (
          <li key={s.piece}>
            <span className="font-mono text-muted">{s.through_m}m</span> · {s.cue}
          </li>
        ))}
      </ul>

      {/* Decided in advance on purpose. Nobody makes this call well at 1200m. */}
      <p className="rounded border border-amber/40 bg-amber/10 px-3 py-2 text-[13px] text-strong">
        {plan.failure_branch}
      </p>
    </div>
  );
}
