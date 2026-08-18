import { describe, it, expect } from "vitest";
import { assessReintroReadiness } from "./readiness";
import type { Program, Store } from "@/lib/schemas";

/**
 * #67 (founder Q1) — advance-signal transparency verification.
 *
 * The founder observed that the readiness banner claimed "you're ready to
 * leave reintro" while showing only two dates without telling the user
 * whether more sessions existed in the window or how many lower-intensity
 * sessions had been skipped between the two flagged. The fix added
 * `qualifyingSessionsWalked` + `nonQualifyingSessionsSkipped` +
 * `windowStartDate` to the ReadinessResult so the card can honestly say
 * "these 2 qualifying + N skipped for not hitting the threshold."
 *
 * These tests prove the counter is populated correctly.
 */

function programWithPhase1(): Program {
  return {
    slug: "test-hip",
    phases: [
      {
        id: "phase_1_rebuild_evaluate",
        name: "Phase 1",
        starts: "2026-01-01",
        ends: "2026-12-31",
        blocks: [],
      },
    ],
  } as unknown as Program;
}

function baseStore(overrides?: Partial<Store>): Store {
  return {
    version: 2,
    logs: {},
    training_maxes: { back_squat_highbar: 100 },
    cycle: { phase_id: null, cycle_number: 1, week_in_cycle: 1 },
    ...overrides,
  } as Store;
}

describe("assessReintroReadiness — #67 transparency", () => {
  it("counts non-qualifying strength-work days between two qualifying sessions", () => {
    // Two heavy squats (81 kg > 80% cap of 100) three days apart,
    // sandwiching one low-intensity session in between.
    const store = baseStore({
      logs: {
        "2026-08-10": {
          date: "2026-08-10",
          exercises: {
            "block_squat_heavy:back_squat_highbar": {
              done: true,
              weight_kg: null,
              reps: null,
              notes: "",
              sets: [{ weight_kg: 82, reps: 3, rpe: 7 }],
            },
          },
          symptoms: null,
          derived_state: "green",
          notes: "",
        },
        "2026-08-11": {
          date: "2026-08-11",
          // Light day — 60 kg squat (under 80% cap) → strength work but not qualifying
          exercises: {
            "block_squat_heavy:back_squat_highbar": {
              done: true,
              weight_kg: null,
              reps: null,
              notes: "",
              sets: [{ weight_kg: 60, reps: 5, rpe: 4 }],
            },
          },
          symptoms: null,
          derived_state: "green",
          notes: "",
        },
        "2026-08-12": {
          date: "2026-08-12",
          exercises: {
            "block_squat_heavy:back_squat_highbar": {
              done: true,
              weight_kg: null,
              reps: null,
              notes: "",
              sets: [{ weight_kg: 82, reps: 3, rpe: 7 }],
            },
          },
          symptoms: null,
          derived_state: "green",
          notes: "",
        },
      },
    });

    const result = assessReintroReadiness(store, programWithPhase1(), "2026-08-13");
    expect(result.ready).toBe(true);
    if (result.ready) {
      expect(result.qualifyingSessionsWalked).toBe(2);
      expect(result.nonQualifyingSessionsSkipped).toBe(1);
      expect(result.evidence.length).toBe(2);
    }
  });

  it("reports zero non-qualifying when the two qualifying days are consecutive", () => {
    const store = baseStore({
      logs: {
        "2026-08-11": {
          date: "2026-08-11",
          exercises: {
            "block_squat_heavy:back_squat_highbar": {
              done: true,
              weight_kg: null,
              reps: null,
              notes: "",
              sets: [{ weight_kg: 85, reps: 3, rpe: 7 }],
            },
          },
          symptoms: null,
          derived_state: "green",
          notes: "",
        },
        "2026-08-12": {
          date: "2026-08-12",
          exercises: {
            "block_squat_heavy:back_squat_highbar": {
              done: true,
              weight_kg: null,
              reps: null,
              notes: "",
              sets: [{ weight_kg: 85, reps: 3, rpe: 7 }],
            },
          },
          symptoms: null,
          derived_state: "green",
          notes: "",
        },
      },
    });

    const result = assessReintroReadiness(store, programWithPhase1(), "2026-08-13");
    expect(result.ready).toBe(true);
    if (result.ready) {
      expect(result.qualifyingSessionsWalked).toBe(2);
      expect(result.nonQualifyingSessionsSkipped).toBe(0);
    }
  });
});
