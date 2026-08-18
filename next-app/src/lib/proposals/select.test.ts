import { describe, it, expect } from "vitest";
import { selectProposals } from "./select";
import type { Program, Store } from "@/lib/schemas";

/**
 * HERITAGE Phase 6 (#63) — proposal selector tests.
 *
 * Covers the non_responder_recommendation kind. The other proposal kinds
 * have their own coverage under the engine/ modules; here we just prove
 * selection routes end-to-end for the newly-added HERITAGE path.
 */

function baseProgram(overrides?: Partial<Program>): Program {
  const p: unknown = {
    slug: "test-program",
    version: "1.0",
    title: "Test",
    subtitle: "",
    tagline: "",
    hero_promise: "",
    intake_questions: [],
    blocks: [],
    phases: [
      {
        id: "phase_1",
        name: "Phase 1",
        starts: "2026-01-01",
        ends: "2026-03-01",
        blocks: [],
      },
    ],
    weekly_template: {},
    training_maxes: {},
    onboarding_steps: [],
    ...overrides,
  };
  return p as Program;
}

function baseStore(overrides?: Partial<Store>): Store {
  return {
    version: 2,
    logs: {},
    training_maxes: {},
    cycle: { phase_id: null, cycle_number: 1, week_in_cycle: 1 },
    user_profile: {
      uid: "test-uid",
      active_program_id: "test-program",
      program_states: {
        "test-program": { tier: "push" },
      },
    },
    ...overrides,
  } as Store;
}

const CLASSIFIER = {
  requires_baselines: 2,
  variance_source: "bouchard_1999_heritage",
  variance_source_citation_id: "bouchard_1999_heritage",
  primary_signal_metric_id: "submax_hr_bpm",
  secondary_signal_metric_ids: ["resting_hr_bpm"],
  patterns: {
    responding: {
      copy: "Responding as expected — stay the course.",
    },
    under_dosing: {
      rule: "progress_ratio_at_mid_block < 0.4 AND intensity_compliance_pct < 80",
      copy: "Under-dosing — the engine will bump load.",
      recommendation_key: "increase_intensity_or_frequency",
    },
    true_non_response: {
      rule: "progress_ratio_at_mid_block < 0.1",
      copy: "HERITAGE non-responder pattern — consider a different arc.",
      recommendation_key: "punt_to_next_arc_or_swap_program",
    },
  },
} as const;

describe("selectProposals — non_responder_recommendation", () => {
  const date = "2026-02-01";

  it("returns nothing when the program has no non_responder_classifier", () => {
    const program = baseProgram();
    const store = baseStore({
      retest_readings: [
        { metric_id: "submax_hr_bpm", value: 150, observed_at: "2026-01-01" },
        { metric_id: "submax_hr_bpm", value: 148, observed_at: "2026-02-01" },
      ],
    });
    const out = selectProposals(store, program, date);
    expect(out.find((p) => p.kind === "non_responder_recommendation")).toBeUndefined();
  });

  it("returns nothing when readings are below requires_baselines", () => {
    const program = baseProgram({
      // deliberately cast — classifier is added ad-hoc for the test
      non_responder_classifier: CLASSIFIER,
    } as unknown as Partial<Program>);
    const store = baseStore({
      retest_readings: [
        // Only one reading → classifier says insufficient_data
        { metric_id: "submax_hr_bpm", value: 150, observed_at: "2026-01-01" },
      ],
    });
    const out = selectProposals(store, program, date);
    expect(out.find((p) => p.kind === "non_responder_recommendation")).toBeUndefined();
  });

  it("fires a true_non_response proposal when the classifier flags it", () => {
    const program = baseProgram({
      non_responder_classifier: CLASSIFIER,
      retest_metrics: [
        {
          metric_id: "submax_hr_bpm",
          display_name: "Submax HR",
          unit: "bpm",
          direction: "lower_is_better",
          source: "log",
          source_ref: "runs.hr",
          targets: [{ tier_id: "push", target: -12, at_week: 8 }],
        },
      ],
    } as unknown as Partial<Program>);

    // Two baselines with essentially no improvement (progress_ratio = 0)
    // → true_non_response rule fires (< 0.1).
    const store = baseStore({
      retest_readings: [
        { metric_id: "submax_hr_bpm", value: 150, observed_at: "2026-01-01" },
        { metric_id: "submax_hr_bpm", value: 150, observed_at: "2026-02-01" },
      ],
    });
    const out = selectProposals(store, program, date);
    const proposal = out.find((p) => p.kind === "non_responder_recommendation");
    expect(proposal).toBeDefined();
    if (proposal?.kind === "non_responder_recommendation") {
      expect(proposal.verdict).toBe("true_non_response");
      expect(proposal.programSlug).toBe("test-program");
      expect(proposal.recommendationKey).toBe("punt_to_next_arc_or_swap_program");
      expect(proposal.perMetric.length).toBeGreaterThan(0);
      expect(proposal.priority).toBe(50);
    }
  });

  it("HERITAGE Phase 5 — fires a retest_due proposal when the mid-block window opens", () => {
    // Program starts 2026-01-05 → Week 4 window opens 2026-01-26 (Mon).
    const program = baseProgram({
      retest_metrics_mid_block: [
        {
          metric_id: "submax_hr_bpm",
          at_week: 4,
          cadence_weeks: 4,
          trigger: "user_initiated",
          purpose: "HERITAGE first baseline",
        },
      ],
      retest_metrics: [
        {
          metric_id: "submax_hr_bpm",
          display_name: "Submax HR at 200W",
          unit: "bpm",
          direction: "lower_is_better",
          source: "log",
          source_ref: "runs.hr",
          at_week: 8,
          targets: [{ tier_id: "push", target: -12, at_week: 8 }],
        },
      ],
    } as unknown as Partial<Program>);
    const store = baseStore({
      user_profile: {
        uid: "test-uid",
        active_program_id: "test-program",
        active_program_started_at: "2026-01-05",
        program_states: {
          "test-program": { tier: "push" },
        },
      },
    });
    const dateInWeek4 = "2026-01-28"; // Wednesday of Week 4
    const out = selectProposals(store, program, dateInWeek4);
    const proposal = out.find((p) => p.kind === "retest_due");
    expect(proposal).toBeDefined();
    if (proposal?.kind === "retest_due") {
      expect(proposal.metricId).toBe("submax_hr_bpm");
      expect(proposal.atWeek).toBe(4);
      expect(proposal.cadenceKind).toBe("mid_block");
      expect(proposal.currentWeek).toBe(4);
      expect(proposal.priority).toBe(45);
    }
  });

  it("HERITAGE Phase 5 — suppresses retest_due when a fresh reading exists within 7 days", () => {
    const program = baseProgram({
      retest_metrics_mid_block: [
        { metric_id: "submax_hr_bpm", at_week: 4, cadence_weeks: 4, trigger: "user_initiated", purpose: "" },
      ],
    } as unknown as Partial<Program>);
    const store = baseStore({
      user_profile: {
        uid: "test-uid",
        active_program_id: "test-program",
        active_program_started_at: "2026-01-05",
        program_states: {
          "test-program": { tier: "push" },
        },
      },
      retest_readings: [
        // Yesterday — within the 7-day freshness window.
        { metric_id: "submax_hr_bpm", value: 150, observed_at: "2026-01-27" },
      ],
    });
    const dateInWeek4 = "2026-01-28";
    const out = selectProposals(store, program, dateInWeek4);
    expect(out.find((p) => p.kind === "retest_due")).toBeUndefined();
  });

  it("HERITAGE Phase 5 — retest_due is silent outside the [at_week, at_week+1] window", () => {
    const program = baseProgram({
      retest_metrics_mid_block: [
        { metric_id: "submax_hr_bpm", at_week: 4, cadence_weeks: 4, trigger: "user_initiated", purpose: "" },
      ],
    } as unknown as Partial<Program>);
    const store = baseStore({
      user_profile: {
        uid: "test-uid",
        active_program_id: "test-program",
        active_program_started_at: "2026-01-05",
        program_states: {
          "test-program": { tier: "push" },
        },
      },
    });
    // Week 2 (2026-01-19) — way too early
    const early = selectProposals(store, program, "2026-01-19");
    expect(early.find((p) => p.kind === "retest_due")).toBeUndefined();
    // Week 7 (2026-02-16) — window closed (was open weeks 4 + 5)
    const late = selectProposals(store, program, "2026-02-16");
    expect(late.find((p) => p.kind === "retest_due")).toBeUndefined();
  });

  it("respects dismissed_proposals so a rejected recommendation does not re-fire same day", () => {
    const program = baseProgram({
      non_responder_classifier: CLASSIFIER,
      retest_metrics: [
        {
          metric_id: "submax_hr_bpm",
          display_name: "Submax HR",
          unit: "bpm",
          direction: "lower_is_better",
          source: "log",
          source_ref: "runs.hr",
          targets: [{ tier_id: "push", target: -12, at_week: 8 }],
        },
      ],
    } as unknown as Partial<Program>);

    const store = baseStore({
      retest_readings: [
        { metric_id: "submax_hr_bpm", value: 150, observed_at: "2026-01-01" },
        { metric_id: "submax_hr_bpm", value: 150, observed_at: "2026-02-01" },
      ],
      dismissed_proposals: {
        [date]: ["non-responder:true_non_response"],
      },
    });
    const out = selectProposals(store, program, date);
    expect(out.find((p) => p.kind === "non_responder_recommendation")).toBeUndefined();
  });
});
