import { describe, it, expect } from "vitest";
import {
  buildRacePlan,
  formatSplit,
  splitConsistencySpread,
  describeConsistency,
} from "./race-plan";

/**
 * The gap: `rowing-2k-test-prep` built six weeks of fitness and then said
 * "Full 2K. Warm-up + all-out effort + cool-down." Its progression tier sold
 * "split consistency across all four 500s" — nothing programmed it, and
 * `row_2k_time_seconds` records only the total, so nothing measured it either.
 */

describe("buildRacePlan", () => {
  // 8:00 baseline, 15s target improvement → 7:45 goal, 116.25s/500m average.
  const plan = buildRacePlan(480, -15)!;

  it("builds a goal from the user's own baseline and target", () => {
    expect(plan.goal_total_s).toBe(465);
    expect(plan.goal_average_split_s).toBeCloseTo(116.3, 1);
  });

  it("gives one target per 500m", () => {
    expect(plan.splits.map((s) => s.through_m)).toEqual([500, 1000, 1500, 2000]);
  });

  it("opens faster than average, but only by about a second and a half", () => {
    // The first strokes from a standing catch are free speed. Beyond ~1.5s
    // the rower is borrowing from the third 500, which is where recreational
    // 2Ks come apart.
    const opener = plan.splits[0].target_split_s;
    expect(plan.goal_average_split_s - opener).toBeCloseTo(1.5, 1);
  });

  it("holds the middle 1000 at or above average", () => {
    expect(plan.splits[1].target_split_s).toBeGreaterThan(plan.goal_average_split_s);
    expect(plan.splits[2].target_split_s).toBeGreaterThan(plan.goal_average_split_s);
  });

  it("prescribes a stroke rate per piece, not splits alone", () => {
    // Splits without rate is half a plan — the same split at 34spm and 28spm
    // are different races, and rate is what distinguishes an efficiency gain
    // from rate-cheating.
    expect(plan.splits.every((s) => s.target_spm > 0)).toBe(true);
    expect(plan.splits[3].target_spm).toBeGreaterThan(plan.splits[1].target_spm);
  });

  it("pre-decides the response to going out too fast", () => {
    expect(plan.failure_branch).toMatch(/do NOT hold it/i);
  });

  it("returns null with no baseline", () => {
    expect(buildRacePlan(0, -15)).toBeNull();
    expect(buildRacePlan(Number.NaN, -15)).toBeNull();
  });

  it("returns null rather than a plan slower than the baseline", () => {
    // A positive target on a lower_is_better metric means the inputs are
    // wrong. Showing a "goal" slower than what they already rowed would be
    // worse than showing nothing.
    expect(buildRacePlan(480, +15)).toBeNull();
  });

  it("scales to a different distance", () => {
    const k1 = buildRacePlan(240, -8, { distanceM: 1000 })!;
    expect(k1.splits).toHaveLength(2);
  });
});

describe("formatSplit", () => {
  it("renders the way an erg monitor does", () => {
    expect(formatSplit(116.25)).toBe("1:56.3");
    expect(formatSplit(465)).toBe("7:45.0");
  });

  it("dashes out a missing value rather than printing 0:00", () => {
    expect(formatSplit(Number.NaN)).toBe("—");
  });
});

describe("splitConsistencySpread", () => {
  it("measures the thing the progression tier promises", () => {
    expect(
      splitConsistencySpread([
        { pace_500m_s: 114 },
        { pace_500m_s: 117 },
        { pace_500m_s: 117.5 },
        { pace_500m_s: 115 },
      ]),
    ).toBe(3.5);
  });

  it("returns null when the user logged a total without splits", () => {
    // The common case, and it must not be reported as perfect consistency —
    // that would turn missing data into a flattering result.
    expect(splitConsistencySpread([])).toBeNull();
    expect(splitConsistencySpread(undefined)).toBeNull();
    expect(splitConsistencySpread([{ pace_500m_s: 116 }])).toBeNull();
  });

  it("ignores pieces with no pace recorded", () => {
    expect(splitConsistencySpread([{ pace_500m_s: 114 }, {}, { pace_500m_s: 118 }])).toBe(4);
  });
});

describe("describeConsistency", () => {
  it("says nothing when there is nothing to say", () => {
    expect(describeConsistency(null)).toBeNull();
  });

  it("distinguishes a well-executed test from a fast opener", () => {
    expect(describeConsistency(1)).toMatch(/evenly paced/i);
    expect(describeConsistency(5)).toMatch(/fast opener cost you/i);
  });
});
