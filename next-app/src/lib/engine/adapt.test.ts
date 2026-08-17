import { describe, it, expect } from "vitest";
import {
  detectPauseResume,
  assessWaypoints,
  evaluateCycleEnd,
  averageTopSetRPE,
} from "./adapt";
import type { Store, Program, DayLog } from "../schemas";

const emptyStore: Store = {
  version: 2,
  logs: {},
  training_maxes: {},
  cycle: { phase_id: null, cycle_number: 1, week_in_cycle: 1 },
};

describe("detectPauseResume", () => {
  it("returns none when there is no prior log", () => {
    const out = detectPauseResume(emptyStore, "2026-08-06");
    expect(out.recommendation).toBe("none");
    expect(out.lastLogDate).toBeNull();
  });

  it("returns none for a short gap", () => {
    const s: Store = {
      ...emptyStore,
      logs: {
        "2026-08-01": {
          date: "2026-08-01",
          exercises: { "block:ex": { done: true, notes: "" } },
          symptoms: null,
          derived_state: null,
          notes: "",
        },
      },
    };
    const out = detectPauseResume(s, "2026-08-06");
    expect(out.gapDays).toBe(5);
    expect(out.recommendation).toBe("none");
  });

  it("recommends calibration after a 14+ day gap", () => {
    const s: Store = {
      ...emptyStore,
      logs: {
        "2026-07-15": {
          date: "2026-07-15",
          exercises: { "block:ex": { done: true, notes: "" } },
          symptoms: null,
          derived_state: null,
          notes: "",
        },
      },
    };
    const out = detectPauseResume(s, "2026-08-06");
    expect(out.gapDays).toBe(22);
    expect(out.recommendation).toBe("calibration");
  });
});

describe("assessWaypoints", () => {
  const program: Program = {
    schema_version: "1.0.0",
    generated: "2026-08-06",
    status: "ACTIVE",
    phases: [],
    blocks: [],
    goals: {
      progression_targets: {
        milestones: [
          {
            date: "2026-12-20",
            phase: "phase_4",
            lift: "back_squat_highbar",
            target_tm_kg: 130,
          },
          {
            date: "2027-04-24",
            phase: "birthday",
            lift: "block_pull_midshin",
            target_tm_kg: 185,
            waypoint: true,
          },
        ],
      },
    },
  } as unknown as Program;

  it("returns none when no milestones beaten", () => {
    const s: Store = { ...emptyStore, training_maxes: { back_squat_highbar: 110 } };
    const out = assessWaypoints(program, s, "2026-08-06");
    expect(out.recommendation).toBe("none");
    expect(out.beatenEarly).toEqual([]);
  });

  it("flags an early beat when TM meets a distant milestone", () => {
    const s: Store = { ...emptyStore, training_maxes: { back_squat_highbar: 135 } };
    const out = assessWaypoints(program, s, "2026-08-06");
    expect(out.recommendation).toBe("accelerate");
    expect(out.beatenEarly.length).toBe(1);
    expect(out.beatenEarly[0].lift).toBe("back_squat_highbar");
    expect(out.beatenEarly[0].weeksEarly).toBeGreaterThan(4);
  });

  it("does not flag a beat when the milestone is <= 4 weeks away", () => {
    const s: Store = { ...emptyStore, training_maxes: { back_squat_highbar: 135 } };
    // 2026-11-25 is 25 days before the 12-20 milestone (< 28 days)
    const out = assessWaypoints(program, s, "2026-11-25");
    expect(out.beatenEarly).toEqual([]);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// evaluateCycleEnd — the RPE-aware TM adjustment logic
// ─────────────────────────────────────────────────────────────────────────────

// Helpers to build test cycles. Cycle = 28 days (Mon 4 wk block).
function buildDay(date: string, exercises: DayLog["exercises"], symptoms: DayLog["symptoms"] = null, derived: DayLog["derived_state"] = "green"): DayLog {
  return { date, exercises, symptoms, derived_state: derived, notes: "" };
}

function set(weight_kg: number, reps: number, rpe: number | null = null) {
  return { weight_kg, reps, rpe, notes: "" };
}

// Program with a phase covering the test date, marked runs_cycle_end_eval.
function makeProgram(phaseStarts: string, phaseEnds: string): Program {
  return {
    schema_version: "1.0.0",
    generated: "2026-08-06",
    status: "ACTIVE",
    phases: [
      {
        id: "phase_test",
        starts: phaseStarts,
        ends: phaseEnds,
        runs_cycle_end_eval: true,
      },
    ],
    blocks: [],
  } as unknown as Program;
}

describe("averageTopSetRPE", () => {
  it("returns null when no session has RPE", () => {
    const days: DayLog[] = [
      buildDay("2026-08-01", { "block:back_squat_highbar": { done: true, sets: [set(90, 5), set(100, 5)], notes: "" } }),
    ];
    expect(averageTopSetRPE(days, "back_squat_highbar")).toBeNull();
  });

  it("uses top-set RPE (heaviest weight) not last set", () => {
    const days: DayLog[] = [
      buildDay("2026-08-01", {
        "block:back_squat_highbar": {
          done: true,
          sets: [set(90, 5, 6), set(110, 3, 9), set(80, 8, 7)],
          notes: "",
        },
      }),
    ];
    const stat = averageTopSetRPE(days, "back_squat_highbar");
    expect(stat).not.toBeNull();
    expect(stat!.avg).toBe(9);
    expect(stat!.count).toBe(1);
  });

  it("averages across multiple cycle days for the same lift", () => {
    const days: DayLog[] = [
      buildDay("2026-08-01", { "block:back_squat_highbar": { done: true, sets: [set(100, 5, 8)], notes: "" } }),
      buildDay("2026-08-08", { "block:back_squat_highbar": { done: true, sets: [set(105, 5, 9)], notes: "" } }),
      buildDay("2026-08-15", { "block:back_squat_highbar": { done: true, sets: [set(110, 5, 10)], notes: "" } }),
    ];
    const stat = averageTopSetRPE(days, "back_squat_highbar");
    expect(stat!.avg).toBeCloseTo(9, 5);
    expect(stat!.count).toBe(3);
  });

  it("ignores un-done sessions", () => {
    const days: DayLog[] = [
      buildDay("2026-08-01", { "block:back_squat_highbar": { done: false, sets: [set(100, 5, 8)], notes: "" } }),
      buildDay("2026-08-08", { "block:back_squat_highbar": { done: true, sets: [set(100, 5, 9)], notes: "" } }),
    ];
    const stat = averageTopSetRPE(days, "back_squat_highbar");
    expect(stat!.count).toBe(1);
    expect(stat!.avg).toBe(9);
  });

  it("ignores other lifts", () => {
    const days: DayLog[] = [
      buildDay("2026-08-01", {
        "block:back_squat_highbar": { done: true, sets: [set(100, 5, 8)], notes: "" },
        "block:front_squat": { done: true, sets: [set(80, 5, 6)], notes: "" },
      }),
    ];
    const stat = averageTopSetRPE(days, "back_squat_highbar");
    expect(stat!.avg).toBe(8);
    expect(stat!.count).toBe(1);
  });

  it("rejects out-of-range RPE values", () => {
    const days: DayLog[] = [
      buildDay("2026-08-01", { "block:back_squat_highbar": { done: true, sets: [set(100, 5, 15)], notes: "" } }),
    ];
    expect(averageTopSetRPE(days, "back_squat_highbar")).toBeNull();
  });
});

describe("evaluateCycleEnd — RPE integration", () => {
  // Cycle: 2026-08-03 (Mon) → 2026-08-30 (Sun) = 4 weeks. Eval fires on day 21+
  // per the code's `dayInCycle >= 21` gate.
  const phaseStarts = "2026-08-03";
  const phaseEnds = "2026-08-30";
  const evalDay = "2026-08-24"; // day 22 of cycle — inside eval window

  function buildStore(dailyExercises: Record<string, DayLog["exercises"]>): Store {
    const logs: Record<string, DayLog> = {};
    for (const [date, exercises] of Object.entries(dailyExercises)) {
      logs[date] = buildDay(date, exercises);
    }
    return {
      version: 2,
      logs,
      training_maxes: { back_squat_highbar: 100 },
      cycle: { phase_id: "phase_test", cycle_number: 1, week_in_cycle: 4 },
    };
  }

  it("no RPE logged → uses default +5 (regression protection)", () => {
    // 5 non-RPE sessions across the cycle. Week-3 (day 14-20) top set should
    // not qualify as AMRAP either (only 1 rep, no over).
    const store = buildStore({
      "2026-08-04": { "block:back_squat_highbar": { done: true, sets: [set(90, 5)], notes: "" } },
      "2026-08-08": { "block:back_squat_highbar": { done: true, sets: [set(90, 5)], notes: "" } },
      "2026-08-12": { "block:back_squat_highbar": { done: true, sets: [set(90, 5)], notes: "" } },
      "2026-08-19": { "block:back_squat_highbar": { done: true, sets: [set(90, 1)], notes: "" } },
      "2026-08-22": { "block:back_squat_highbar": { done: true, sets: [set(90, 5)], notes: "" } },
    });
    const out = evaluateCycleEnd(makeProgram(phaseStarts, phaseEnds), store, evalDay);
    expect(out).not.toBeNull();
    expect(out!.recommendation).toHaveLength(1);
    expect(out!.recommendation[0].delta).toBe(5); // squat +5 default
    expect(out!.recommendation[0].reason).not.toContain("RPE");
  });

  it("avg top-set RPE ≥ 9 → HOLD TM (no bump)", () => {
    const store = buildStore({
      "2026-08-04": { "block:back_squat_highbar": { done: true, sets: [set(95, 5, 9)], notes: "" } },
      "2026-08-08": { "block:back_squat_highbar": { done: true, sets: [set(95, 5, 9.5)], notes: "" } },
      "2026-08-12": { "block:back_squat_highbar": { done: true, sets: [set(97.5, 5, 9)], notes: "" } },
      "2026-08-19": { "block:back_squat_highbar": { done: true, sets: [set(97.5, 1, 10)], notes: "" } },
    });
    const out = evaluateCycleEnd(makeProgram(phaseStarts, phaseEnds), store, evalDay);
    expect(out).not.toBeNull();
    expect(out!.recommendation).toHaveLength(0); // hold — no recommendation
  });

  it("avg top-set RPE ≤ 7 → BIGGER bump (7.5 instead of 5)", () => {
    const store = buildStore({
      "2026-08-04": { "block:back_squat_highbar": { done: true, sets: [set(85, 5, 6)], notes: "" } },
      "2026-08-08": { "block:back_squat_highbar": { done: true, sets: [set(85, 5, 7)], notes: "" } },
      "2026-08-12": { "block:back_squat_highbar": { done: true, sets: [set(87.5, 5, 6.5)], notes: "" } },
      "2026-08-19": { "block:back_squat_highbar": { done: true, sets: [set(87.5, 1, 7)], notes: "" } },
    });
    const out = evaluateCycleEnd(makeProgram(phaseStarts, phaseEnds), store, evalDay);
    expect(out).not.toBeNull();
    expect(out!.recommendation).toHaveLength(1);
    expect(out!.recommendation[0].delta).toBe(7.5); // squat +7.5 (bigger)
    expect(out!.recommendation[0].reason).toContain("headroom");
  });

  it("avg top-set RPE 7-9 → standard bump with RPE mention", () => {
    const store = buildStore({
      "2026-08-04": { "block:back_squat_highbar": { done: true, sets: [set(90, 5, 8)], notes: "" } },
      "2026-08-08": { "block:back_squat_highbar": { done: true, sets: [set(90, 5, 8)], notes: "" } },
      "2026-08-12": { "block:back_squat_highbar": { done: true, sets: [set(92.5, 5, 8)], notes: "" } },
      "2026-08-19": { "block:back_squat_highbar": { done: true, sets: [set(92.5, 1, 8)], notes: "" } },
    });
    const out = evaluateCycleEnd(makeProgram(phaseStarts, phaseEnds), store, evalDay);
    expect(out).not.toBeNull();
    expect(out!.recommendation).toHaveLength(1);
    expect(out!.recommendation[0].delta).toBe(5); // default +5
    expect(out!.recommendation[0].reason).toContain("RPE 8.0");
  });

  it("only one RPE-logged session → still requires ≥2 to gate the RPE-aware path", () => {
    // Only one session has RPE; four sessions total. Should fall through to
    // the default path (not the RPE-aware hold or bigger-bump branches).
    const store = buildStore({
      "2026-08-04": { "block:back_squat_highbar": { done: true, sets: [set(90, 5)], notes: "" } },
      "2026-08-08": { "block:back_squat_highbar": { done: true, sets: [set(90, 5, 9.5)], notes: "" } },
      "2026-08-12": { "block:back_squat_highbar": { done: true, sets: [set(90, 5)], notes: "" } },
      "2026-08-19": { "block:back_squat_highbar": { done: true, sets: [set(90, 1)], notes: "" } },
    });
    const out = evaluateCycleEnd(makeProgram(phaseStarts, phaseEnds), store, evalDay);
    expect(out).not.toBeNull();
    // With only 1 RPE datapoint, the "hold TM" path shouldn't fire — default
    // bump applies. RPE mention still appears in reason.
    expect(out!.recommendation).toHaveLength(1);
    expect(out!.recommendation[0].delta).toBe(5);
  });

  it("crushed AMRAP (over ≥6) still fires regardless of RPE", () => {
    const store = buildStore({
      "2026-08-04": { "block:back_squat_highbar": { done: true, sets: [set(90, 5, 9)], notes: "" } },
      "2026-08-08": { "block:back_squat_highbar": { done: true, sets: [set(90, 5, 9)], notes: "" } },
      "2026-08-12": { "block:back_squat_highbar": { done: true, sets: [set(90, 5, 9)], notes: "" } },
      // Week-3 top set — 8 reps at TM weight (100 kg). Over = 7, "crushed".
      "2026-08-19": { "block:back_squat_highbar": { done: true, sets: [set(100, 8, 9)], notes: "" } },
    });
    const out = evaluateCycleEnd(makeProgram(phaseStarts, phaseEnds), store, evalDay);
    expect(out).not.toBeNull();
    expect(out!.recommendation).toHaveLength(1);
    expect(out!.recommendation[0].reason).toContain("Crushed");
  });

  it("amber cycle → holds regardless of RPE", () => {
    const store = buildStore({
      "2026-08-04": { "block:back_squat_highbar": { done: true, sets: [set(90, 5, 6)], notes: "" } },
      "2026-08-08": {
        "block:back_squat_highbar": { done: true, sets: [set(90, 5, 6)], notes: "" },
      },
      "2026-08-12": {
        "block:back_squat_highbar": { done: true, sets: [set(90, 5, 6)], notes: "" },
      },
      "2026-08-19": {
        "block:back_squat_highbar": { done: true, sets: [set(90, 1, 6)], notes: "" },
      },
    });
    // Mark 2026-08-08 as amber.
    store.logs["2026-08-08"] = { ...store.logs["2026-08-08"], derived_state: "amber" };
    const out = evaluateCycleEnd(makeProgram(phaseStarts, phaseEnds), store, evalDay);
    expect(out).not.toBeNull();
    expect(out!.worstState).toBe("amber");
    expect(out!.recommendation).toHaveLength(0); // hold
  });
});
