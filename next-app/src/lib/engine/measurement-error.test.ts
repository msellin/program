import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import { deltaFromBaseline, type RetestValue } from "./retest-evaluator";

const DIR = path.resolve(__dirname, "../../../public/data/programs");

type Metric = {
  metric_id: string;
  unit: string;
  minimal_detectable_change?: number;
  mdc_reference_id?: string;
  targets?: Array<{ tier_id?: string; target: number; stretch?: number }>;
};

function metricsWithMdc(): Array<{ slug: string; metric: Metric }> {
  return fs
    .readdirSync(DIR)
    .filter((f) => f.endsWith(".json") && f !== "manifest.json")
    .flatMap((f) => {
      const prog = JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8")) as {
        retest_metrics?: Metric[];
      };
      return (prog.retest_metrics ?? [])
        .filter((m) => m.minimal_detectable_change != null)
        .map((metric) => ({ slug: f.replace(/\.json$/, ""), metric }));
    });
}

const value = (over: Partial<RetestValue>): RetestValue => ({
  metric_id: "m",
  display_name: "m",
  unit: "degrees",
  direction: "higher_is_better",
  current: null,
  baseline: null,
  target: null,
  stretch: null,
  at_week: null,
  cadence_weeks: null,
  supported: true,
  ...over,
});

/**
 * A change smaller than the instrument's error is not progress.
 *
 * `overhead-mobility` measures supine shoulder flexion with a goniometer.
 * Best-case single-rater MDC is 7 degrees in normal shoulders and 9 in
 * pathological ones (Muir 2010, PMID 21589666) — measured by trained
 * physiotherapists on a plinth, where this app's users measure themselves at
 * home, so that is a floor and not an estimate.
 *
 * The programme claimed a Push-tier gain of "+5-10 degrees". The lower half
 * of that range cannot be distinguished from measurement error, and the app
 * coloured any positive delta green: a 6-degree reading got the same green as
 * a real 20-degree gain. The product was reporting the instrument's noise
 * back to the user as their own progress.
 */
describe("measurement error is respected", () => {
  it("a delta inside the MDC is flagged, in both directions", () => {
    const m = value({ baseline: 160, current: 166, minimal_detectable_change: 9 });
    expect(deltaFromBaseline(m)).toEqual({ value: 6, isImprovement: true, withinError: true });
    const back = value({ baseline: 166, current: 160, minimal_detectable_change: 9 });
    expect(deltaFromBaseline(back)).toEqual({ value: -6, isImprovement: false, withinError: true });
  });

  it("a delta at or beyond the MDC is real", () => {
    const m = value({ baseline: 160, current: 169, minimal_detectable_change: 9 });
    expect(deltaFromBaseline(m)?.withinError).toBe(false);
  });

  it("a metric with no declared MDC is unchanged", () => {
    // Absent means unknown, not zero. Inventing a figure would be the same
    // error pointing the other way.
    const m = value({ baseline: 160, current: 161 });
    expect(deltaFromBaseline(m)).toEqual({ value: 1, isImprovement: true, withinError: false });
  });

  it("every declared MDC resolves to a citation", () => {
    const citations = new Set(
      (
        JSON.parse(
          fs.readFileSync(path.resolve(__dirname, "../../../public/data/citations.json"), "utf8"),
        ) as { citations: Array<{ id: string }> }
      ).citations.map((c) => c.id),
    );
    const unsourced = metricsWithMdc()
      .filter(({ metric }) => !metric.mdc_reference_id || !citations.has(metric.mdc_reference_id))
      .map(({ slug, metric }) => `${slug} → ${metric.metric_id}`);
    // An MDC is a claim about the world. A number with no paper behind it is
    // exactly the shape of the three phantom citations this repo just spent a
    // week removing.
    expect(unsourced).toEqual([]);
  });

  it("no tier target sits closer to its own baseline than the MDC", () => {
    /**
     * This is the check that would have caught the Push tier. It compares
     * consecutive tier targets: if progressing from one tier's target to the
     * next moves the metric by less than the MDC, the higher tier cannot
     * demonstrate that it did anything.
     */
    /**
     * Known and NOT silently tolerated.
     *
     * overhead-mobility's Progression target is 180 degrees and Push's is
     * 185 — a 5-degree step inside a 9-degree MDC, so a Push user cannot
     * demonstrate they reached anything Progression did not. The stretch
     * target of 190 is worse: Muir's healthy supine passive mean was 177
     * (SD 6), so 190 is more than two standard deviations above the measured
     * healthy average.
     *
     * Moving a target changes what the programme asks of people, which is the
     * programme author's call and not mine. Listed here so it is a decision
     * on the register rather than a quiet failure, and so a SECOND instance
     * of this shape goes red.
     */
    const ACCEPTED = new Set([
      "overhead-mobility → shoulder_flexion_supine_deg: 180 → 185 is 5°, under the 9 MDC",
    ]);
    const offenders: string[] = [];
    for (const { slug, metric } of metricsWithMdc()) {
      const mdc = metric.minimal_detectable_change!;
      const targets = (metric.targets ?? []).map((t) => t.target);
      for (let i = 1; i < targets.length; i++) {
        const step = Math.abs(targets[i] - targets[i - 1]);
        if (step > 0 && step < mdc) {
          offenders.push(
            `${slug} → ${metric.metric_id}: ${targets[i - 1]} → ${targets[i]} ` +
              `is ${step}${metric.unit === "degrees" ? "°" : ""}, under the ${mdc} MDC`,
          );
        }
      }
    }
    expect(
      offenders.filter((o) => !ACCEPTED.has(o)),
      "a tier whose target is within measurement error of the tier below it " +
        "cannot show it was reached. Widen the targets or add to ACCEPTED with a reason.",
    ).toEqual([]);
    // And the list cannot outlive its reason.
    expect(
      [...ACCEPTED].filter((a) => !offenders.includes(a)),
      "these are fixed — remove them from ACCEPTED",
    ).toEqual([]);
  });
});
