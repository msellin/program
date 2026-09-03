import { describe, it, expect } from "vitest";
import { resolveRetestReadings, readingsForMetric } from "./retest-readings";
import { deriveMetricSeries, metricHasDerivableSeries } from "./retest-evaluator";
import type { Program, Store } from "../schemas";

/**
 * The defect these tests pin: a retest metric's current value came from its
 * declared `source_ref`, but its *history* came only from
 * `store.retest_readings`, which nothing but the hand-entry sheet writes. A
 * rowing user saw a real 2K time on the card above an empty timeline, and the
 * non-responder classifier stayed silent, until they typed the same number in
 * a second time.
 */

const rowingProgram = {
  slug: "rowing-2k-test-prep",
  retest_metrics: [
    {
      metric_id: "row_2k_time_seconds",
      source: "log_field",
      source_ref: "runs[].total_seconds where activity_type == 'row'",
    },
    {
      metric_id: "threshold_pace_500m_seconds",
      source: "run_field",
      source_ref: "runs[].avg_pace_500m_seconds where activity_type == 'row'",
    },
  ],
  // Shares a metric_id with the end-of-block entry, as the shipped program does.
  retest_metrics_mid_block: [
    { metric_id: "threshold_pace_500m_seconds" },
  ],
} as unknown as Program;

function storeWith(
  runs: Record<string, Array<Record<string, unknown>>>,
  readings: Store["retest_readings"] = undefined,
): Store {
  const logs: Record<string, unknown> = {};
  for (const [date, r] of Object.entries(runs)) {
    logs[date] = { date, exercises: {}, symptoms: null, derived_state: null, runs: r };
  }
  return {
    logs,
    training_maxes: {},
    retest_readings: readings,
  } as unknown as Store;
}

describe("resolveRetestReadings", () => {
  it("derives a reading from the row the user actually did", () => {
    const store = storeWith({
      "2026-09-01": [{ activity_type: "row", total_seconds: 428 }],
    });
    const out = readingsForMetric(store, rowingProgram, "row_2k_time_seconds");
    expect(out).toEqual([
      { metric_id: "row_2k_time_seconds", value: 428, observed_at: "2026-09-01", origin: "derived" },
    ]);
  });

  it("keeps deriving after the user hand-logs an unrelated metric", () => {
    // The bug in HeritageClusterChip.collectBaselines: derivation was a
    // fallback for an ENTIRELY empty retest_readings, so one hand entry of
    // any metric switched it off for every metric.
    const store = storeWith(
      { "2026-09-01": [{ activity_type: "row", total_seconds: 428 }] },
      [{ metric_id: "threshold_pace_500m_seconds", value: 104, observed_at: "2026-08-20" }],
    );
    const out = readingsForMetric(store, rowingProgram, "row_2k_time_seconds");
    expect(out.map((r) => r.value)).toEqual([428]);
  });

  it("prefers the hand-logged reading when both exist on the same date", () => {
    const store = storeWith(
      { "2026-09-01": [{ activity_type: "row", total_seconds: 428 }] },
      [{ metric_id: "row_2k_time_seconds", value: 425, observed_at: "2026-09-01" }],
    );
    const out = readingsForMetric(store, rowingProgram, "row_2k_time_seconds");
    expect(out).toHaveLength(1);
    expect(out[0]).toMatchObject({ value: 425, origin: "logged" });
  });

  it("keeps both when the logged and derived readings are on different dates", () => {
    const store = storeWith(
      { "2026-09-01": [{ activity_type: "row", total_seconds: 428 }] },
      [{ metric_id: "row_2k_time_seconds", value: 440, observed_at: "2026-08-01" }],
    );
    const out = readingsForMetric(store, rowingProgram, "row_2k_time_seconds");
    expect(out.map((r) => [r.observed_at, r.origin])).toEqual([
      ["2026-08-01", "logged"],
      ["2026-09-01", "derived"],
    ]);
  });

  it("does not double-count a metric declared both end-of-block and mid-block", () => {
    const store = storeWith({
      "2026-09-01": [{ activity_type: "row", avg_pace_500m_seconds: 106 }],
    });
    expect(readingsForMetric(store, rowingProgram, "threshold_pace_500m_seconds")).toHaveLength(1);
  });

  it("honours the source_ref where clause", () => {
    const store = storeWith({
      "2026-09-01": [
        { activity_type: "run", total_seconds: 999 },
        { activity_type: "row", total_seconds: 428 },
      ],
    });
    expect(
      readingsForMetric(store, rowingProgram, "row_2k_time_seconds").map((r) => r.value),
    ).toEqual([428]);
  });

  it("keeps logged history for metrics the program no longer declares", () => {
    const store = storeWith({}, [
      { metric_id: "some_retired_metric", value: 12, observed_at: "2026-07-01" },
    ]);
    expect(resolveRetestReadings(store, rowingProgram)).toHaveLength(1);
  });

  it("returns readings sorted ascending by date", () => {
    const store = storeWith({
      "2026-09-05": [{ activity_type: "row", total_seconds: 420 }],
      "2026-09-01": [{ activity_type: "row", total_seconds: 428 }],
    });
    expect(
      resolveRetestReadings(store, rowingProgram).map((r) => r.observed_at),
    ).toEqual(["2026-09-01", "2026-09-05"]);
  });

  it("ignores runs from before the user started this arc", () => {
    const store = storeWith({
      "2025-01-01": [{ activity_type: "row", total_seconds: 500 }],
      "2026-09-01": [{ activity_type: "row", total_seconds: 428 }],
    });
    (store as unknown as { user_profile: unknown }).user_profile = {
      program_states: { "rowing-2k-test-prep": { started_at: "2026-08-01" } },
    };
    expect(
      readingsForMetric(store, rowingProgram, "row_2k_time_seconds").map((r) => r.value),
    ).toEqual([428]);
  });

  it("returns only logged readings when there is no program", () => {
    const store = storeWith(
      { "2026-09-01": [{ activity_type: "row", total_seconds: 428 }] },
      [{ metric_id: "row_2k_time_seconds", value: 425, observed_at: "2026-08-01" }],
    );
    expect(resolveRetestReadings(store, null).map((r) => r.origin)).toEqual(["logged"]);
  });
});

describe("deriveMetricSeries", () => {
  it("returns nothing for a physical test — there is no dated log field to read", () => {
    const store = storeWith({ "2026-09-01": [{ activity_type: "row", total_seconds: 428 }] });
    expect(
      deriveMetricSeries(store, {
        metric_id: "dead_hang_max_seconds",
        source: "physical_test",
        source_ref: "dead_hang_max_seconds",
      }),
    ).toEqual([]);
  });

  it("returns nothing for a training-max metric — the store keeps a value, not a series", () => {
    const store = storeWith({});
    expect(
      deriveMetricSeries(store, {
        metric_id: "back_squat_5rm_kg",
        source: "log_field",
        source_ref: "training_maxes.back_squat_highbar",
      }),
    ).toEqual([]);
  });

  it("skips runs missing the field rather than reading a non-number", () => {
    const store = storeWith({
      "2026-09-01": [{ activity_type: "row" }, { activity_type: "row", total_seconds: 428 }],
    });
    expect(
      deriveMetricSeries(store, {
        metric_id: "row_2k_time_seconds",
        source: "log_field",
        source_ref: "runs[].total_seconds where activity_type == 'row'",
      }).map((p) => p.value),
    ).toEqual([428]);
  });

  it("refuses a where-clause it cannot fully honour", () => {
    // `parseSource` used to drop unparseable conjuncts silently, so
    // engine-builder-block-2's metric declared `... and week_in_program in
    // [1, 4, 8]` and sampled every easy session instead of three. A reading
    // that honours half its filter is wrong AND looks right, which is worse
    // than no reading — the metric should read as untrackable instead.
    expect(
      metricHasDerivableSeries({
        source: "run_field",
        source_ref: "runs[].avg_hr where intensity == 'easy' and week_in_program in [1, 4, 8]",
      }),
    ).toBe(false);
  });

  it("still accepts a where-clause made only of equalities", () => {
    expect(
      metricHasDerivableSeries({
        source: "run_field",
        source_ref: "runs[].avg_hr where intensity == 'easy' and activity_type == 'row'",
      }),
    ).toBe(true);
  });

  it("reports which declared sources can yield a series", () => {
    expect(
      metricHasDerivableSeries({
        source: "run_field",
        source_ref: "runs[].avg_hr where intensity == 'easy'",
      }),
    ).toBe(true);
    expect(
      metricHasDerivableSeries({ source: "physical_test", source_ref: "wall_hold_max_seconds" }),
    ).toBe(false);
  });
});
