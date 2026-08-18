import { describe, it, expect, beforeEach } from "vitest";
import { useStore } from "./useStore";

/**
 * HERITAGE Phase 5 (2026-08-18 · #73) — logRetestReading action tests.
 *
 * Proves the write path is idempotent on (metric_id, observed_at) so a
 * user who re-submits the same day's reading gets a REPLACEMENT, not a
 * duplicate. Two duplicates would double-count in the classifier's
 * baselines_used check.
 */

describe("useStore.logRetestReading (HERITAGE Phase 5)", () => {
  beforeEach(() => {
    useStore.getState().wipe();
  });

  it("appends a first reading", () => {
    useStore.getState().logRetestReading({
      metric_id: "submax_hr_bpm",
      value: 150,
      observed_at: "2026-01-05",
    });
    const readings = useStore.getState().store.retest_readings ?? [];
    expect(readings.length).toBe(1);
    expect(readings[0]).toMatchObject({
      metric_id: "submax_hr_bpm",
      value: 150,
      observed_at: "2026-01-05",
    });
  });

  it("appends a second reading on a different date", () => {
    useStore.getState().logRetestReading({
      metric_id: "submax_hr_bpm",
      value: 150,
      observed_at: "2026-01-05",
    });
    useStore.getState().logRetestReading({
      metric_id: "submax_hr_bpm",
      value: 145,
      observed_at: "2026-02-02",
    });
    const readings = useStore.getState().store.retest_readings ?? [];
    expect(readings.length).toBe(2);
    expect(readings.map((r) => r.observed_at).sort()).toEqual(["2026-01-05", "2026-02-02"]);
  });

  it("replaces a reading with the same metric_id + observed_at (idempotent)", () => {
    useStore.getState().logRetestReading({
      metric_id: "submax_hr_bpm",
      value: 150,
      observed_at: "2026-01-05",
    });
    // Same metric + date, different value → overwrite
    useStore.getState().logRetestReading({
      metric_id: "submax_hr_bpm",
      value: 148,
      observed_at: "2026-01-05",
      intensity_compliance_pct: 85,
    });
    const readings = useStore.getState().store.retest_readings ?? [];
    expect(readings.length).toBe(1);
    expect(readings[0].value).toBe(148);
    expect(readings[0].intensity_compliance_pct).toBe(85);
  });

  it("keeps readings for different metrics on the same date", () => {
    useStore.getState().logRetestReading({
      metric_id: "submax_hr_bpm",
      value: 150,
      observed_at: "2026-01-05",
    });
    useStore.getState().logRetestReading({
      metric_id: "resting_hr_bpm",
      value: 58,
      observed_at: "2026-01-05",
    });
    const readings = useStore.getState().store.retest_readings ?? [];
    expect(readings.length).toBe(2);
  });
});
