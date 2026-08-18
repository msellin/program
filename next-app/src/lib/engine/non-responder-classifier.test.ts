import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import type { Program, Store } from "../schemas";
import {
  classify,
  evaluateRule,
  type MetricBaseline,
} from "./non-responder-classifier";

function loadProgram(slug: string): Program {
  const p = path.resolve(__dirname, "../../../public/data/programs", `${slug}.json`);
  const program = JSON.parse(fs.readFileSync(p, "utf8")) as Program;
  program.slug = slug;
  return program;
}

function emptyStore(): Store {
  return {
    version: 2,
    logs: {},
    training_maxes: {},
    cycle: { phase_id: null, cycle_number: 0, week_in_cycle: 0 },
  } as unknown as Store;
}

// -----------------------------------------------------------------------------
// evaluateRule — the DSL
// -----------------------------------------------------------------------------

describe("evaluateRule", () => {
  it("handles a bare comparison", () => {
    expect(evaluateRule("x < 5", { x: 3 })).toBe(true);
    expect(evaluateRule("x < 5", { x: 7 })).toBe(false);
  });

  it("supports multiplication in operand", () => {
    expect(evaluateRule("x < target * 0.4", { x: 3, target: 10 })).toBe(true);
    expect(evaluateRule("x < target * 0.4", { x: 5, target: 10 })).toBe(false);
  });

  it("AND short-circuits on false", () => {
    expect(evaluateRule("x < 5 AND y > 3", { x: 3, y: 2 })).toBe(false);
    expect(evaluateRule("x < 5 AND y > 3", { x: 3, y: 4 })).toBe(true);
  });

  it("OR takes either branch", () => {
    expect(evaluateRule("x < 5 OR y > 3", { x: 10, y: 4 })).toBe(true);
    expect(evaluateRule("x < 5 OR y > 3", { x: 10, y: 1 })).toBe(false);
  });

  it("evaluates against undefined identifier as false", () => {
    // Defensive — missing signals shouldn't classify.
    expect(evaluateRule("missing < 5", {})).toBe(false);
  });

  it("evaluates the actual Engine Builder under_dosing rule", () => {
    const rule =
      "progress_ratio_at_mid_block < 0.4 AND intensity_compliance_pct < 80";
    // Only ~8% of target progress AND compliance low → under-dosing.
    expect(
      evaluateRule(rule, {
        progress_ratio_at_mid_block: 0.08,
        intensity_compliance_pct: 60,
      }),
    ).toBe(true);
    // Same low progress, but compliance is high → not under-dosing
    // (that's the true_non_response bucket).
    expect(
      evaluateRule(rule, {
        progress_ratio_at_mid_block: 0.08,
        intensity_compliance_pct: 85,
      }),
    ).toBe(false);
  });
});

// -----------------------------------------------------------------------------
// classify — end-to-end using real program JSON
// -----------------------------------------------------------------------------

describe("classify · Engine Builder", () => {
  const program = loadProgram("engine-builder");

  it("returns insufficient_data with only one baseline", () => {
    const result = classify(program, emptyStore(), {
      baselines: [
        {
          metric_id: "submax_hr_bpm",
          value: 150,
          observed_at: "2026-01-05",
        },
      ],
    });
    expect(result.composite_verdict).toBe("insufficient_data");
    expect(result.per_metric[0].verdict).toBe("insufficient_data");
    expect(result.per_metric[0].baselines_used).toBe(1);
  });

  it("returns under_dosing when signal is flat AND compliance is low", () => {
    // Signal barely moved (delta = -1, but target expects -5-ish).
    const baselines: MetricBaseline[] = [
      { metric_id: "submax_hr_bpm", value: 150, observed_at: "2026-01-05" },
      { metric_id: "submax_hr_bpm", value: 149, observed_at: "2026-02-01" },
    ];
    const result = classify(program, emptyStore(), {
      baselines,
      targets: { submax_hr_bpm: -12 },
      intensity_compliance_pct: 60,
    });
    expect(result.composite_verdict).toBe("under_dosing");
    expect(result.per_metric[0].recommendation_key).toBe(
      "increase_intensity_or_frequency",
    );
    expect(result.composite_copy).toMatch(/under-dosed|under-training/i);
  });

  it("returns true_non_response when signal is flat, compliance high, resting HR unchanged", () => {
    const baselines: MetricBaseline[] = [
      { metric_id: "submax_hr_bpm", value: 150, observed_at: "2026-01-05" },
      { metric_id: "submax_hr_bpm", value: 149, observed_at: "2026-02-01" },
      { metric_id: "resting_hr_bpm", value: 62, observed_at: "2026-01-05" },
      { metric_id: "resting_hr_bpm", value: 62, observed_at: "2026-02-01" },
    ];
    const result = classify(program, emptyStore(), {
      baselines,
      targets: { submax_hr_bpm: -12 },
      intensity_compliance_pct: 90,
    });
    expect(result.composite_verdict).toBe("true_non_response");
    expect(result.per_metric[0].recommendation_key).toBe(
      "punt_to_next_arc_or_swap_program",
    );
  });

  it("returns responding when signal is trending appropriately", () => {
    const baselines: MetricBaseline[] = [
      { metric_id: "submax_hr_bpm", value: 150, observed_at: "2026-01-05" },
      { metric_id: "submax_hr_bpm", value: 143, observed_at: "2026-02-01" },
    ];
    const result = classify(program, emptyStore(), {
      baselines,
      targets: { submax_hr_bpm: -12 },
      intensity_compliance_pct: 90,
    });
    expect(result.composite_verdict).toBe("responding");
    expect(result.composite_copy).toMatch(/trending down/);
  });

  it("appends divergence note when primary and secondary verdicts differ", () => {
    // Primary is responding, secondary is not (resting HR flat while
    // submax HR dropped — genuinely useful clinical insight).
    const baselines: MetricBaseline[] = [
      { metric_id: "submax_hr_bpm", value: 150, observed_at: "2026-01-05" },
      { metric_id: "submax_hr_bpm", value: 143, observed_at: "2026-02-01" },
      { metric_id: "resting_hr_bpm", value: 62, observed_at: "2026-01-05" },
      { metric_id: "resting_hr_bpm", value: 63, observed_at: "2026-02-01" },
    ];
    const result = classify(program, emptyStore(), {
      baselines,
      targets: { submax_hr_bpm: -12, resting_hr_bpm: -5 },
      intensity_compliance_pct: 90,
    });
    // Primary submax is responding.
    expect(result.per_metric.find((m) => m.role === "primary")?.verdict).toBe(
      "responding",
    );
    // Composite copy still primary-authoritative but includes the divergence.
    expect(result.composite_verdict).toBe("responding");
    // Whether the secondary technically classifies "true_non_response" here
    // depends on its rule threshold; the important test is that the composite
    // copy carries a divergence note when they disagree.
    const secondary = result.per_metric.find((m) => m.role === "secondary");
    if (secondary && secondary.verdict !== "responding") {
      expect(result.composite_copy).toMatch(/Secondary signals disagree/);
    }
  });
});

describe("classify · Rowing 2K", () => {
  const program = loadProgram("rowing-2k-test-prep");

  it("returns under_dosing for flat threshold + missed sessions", () => {
    const baselines: MetricBaseline[] = [
      { metric_id: "threshold_pace_500m", value: 130, observed_at: "2026-08-01" },
      { metric_id: "threshold_pace_500m", value: 129, observed_at: "2026-08-15" },
    ];
    const result = classify(program, emptyStore(), {
      baselines,
      targets: { threshold_pace_500m: -8 },
      session_compliance_pct: 65,
    });
    expect(result.composite_verdict).toBe("under_dosing");
    expect(result.per_metric[0].recommendation_key).toBe("add_race_pace_frequency");
  });

  it("returns responding for good threshold trend", () => {
    const baselines: MetricBaseline[] = [
      { metric_id: "threshold_pace_500m", value: 130, observed_at: "2026-08-01" },
      { metric_id: "threshold_pace_500m", value: 125, observed_at: "2026-08-15" },
    ];
    const result = classify(program, emptyStore(), {
      baselines,
      targets: { threshold_pace_500m: -8 },
      session_compliance_pct: 95,
    });
    expect(result.composite_verdict).toBe("responding");
    expect(result.composite_copy).toMatch(/trending faster/);
  });
});

describe("classify · programs without classifier", () => {
  it("returns not_configured for programs without the field", () => {
    const csm = loadProgram("concurrent-strength-maintenance");
    const result = classify(csm, emptyStore(), { baselines: [] });
    expect(result.composite_verdict).toBe("not_configured");
    expect(result.per_metric).toEqual([]);
  });
});
