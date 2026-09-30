import { describe, it, expect } from "vitest";
import {
  detectPauseResume,
  assessWaypoints,
  evaluateCycleEnd,
  averageTopSetRPE,
  evaluateOverperformer,
  performanceSignals,
} from "./adapt";
import type { Store, Program, DayLog } from "../schemas";

const emptyStore: Store = {
  version: 2,
  logs: {},
  training_maxes: {},
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

// ─────────────────────────────────────────────────────────────────────────────
// evaluateOverperformer (A1) — off-cycle TM-bump proposal
// ─────────────────────────────────────────────────────────────────────────────

describe("evaluateOverperformer", () => {
  const evalDay = "2026-08-17";
  // Post-flow-review 2026-08-17: A1 gates on program.training_maxes.
  // starting_values_kg (shape check) rather than a slug blacklist. Tests
  // must declare a strength-progression shape for the eligibility gate to pass.
  const trainingProgram: Program = {
    ...makeProgram("2026-08-03", "2026-08-30"),
    slug: "custom-strength",
    training_maxes: {
      starting_values_kg: { back_squat_highbar: 100, deadlift_conventional: 140 },
    },
  } as unknown as Program;

  function overStore(
    args: {
      days: Array<{ date: string; state: DayLog["derived_state"]; notes?: string; sets?: number[][] }>;
      tms?: Record<string, number>;
    },
  ): Store {
    const logs: Record<string, DayLog> = {};
    for (const d of args.days) {
      const sets = d.sets ?? [[100, 5, 6]];
      logs[d.date] = buildDay(
        d.date,
        { "block:back_squat_highbar": { done: true, sets: sets.map((s) => set(s[0], s[1], s[2] ?? null)), notes: "" } },
        null,
        d.state,
      );
      if (d.notes) logs[d.date] = { ...logs[d.date], notes: d.notes };
    }
    return {
      version: 2,
      logs,
      training_maxes: args.tms ?? { back_squat_highbar: 100, deadlift_conventional: 140 },
    };
  }

  it("fires with 3 green days + a 'felt strong' note on a strength program", () => {
    const s = overStore({
      days: [
        { date: "2026-08-15", state: "green" },
        { date: "2026-08-16", state: "green", notes: "felt strong today" },
        { date: "2026-08-17", state: "green" },
      ],
    });
    const out = evaluateOverperformer(trainingProgram, s, evalDay);
    expect(out).not.toBeNull();
    expect(out!.lifts.length).toBeGreaterThan(0);
    expect(out!.lifts[0].delta).toBeGreaterThan(0);
    const squat = out!.lifts.find((l) => l.exerciseId === "back_squat_highbar");
    // Sized from the set since BUG-35: 100 × 5 at RPE 6 on a 100 kg TM is an
    // estimated max of ~130, whose 85% is 110 — capped at +10 per proposal.
    // It used to be the fixed +2.5 regardless of what the set said.
    expect(squat?.delta).toBe(10);
  });

  describe("the founder's 2026-09-28 squat (BUG-35, BUG-36)", () => {
    // 100 × 10 at RPE 6 on a 115 kg TM: about 14 reps possible, an estimated
    // max near 147. The engine offered 115 → 117.5 on Monday and nothing at
    // all by Wednesday.
    const founderSet = [[100, 10, 6]];

    it("sizes the bump from the set, not a fixed +2.5", () => {
      const s = overStore({
        tms: { back_squat_highbar: 115 },
        days: [
          { date: "2026-08-12", state: "green", sets: [[80, 5, 5]] },
          { date: "2026-08-14", state: "green", sets: [[80, 5, 5]] },
          { date: "2026-08-17", state: "green", sets: founderSet },
        ],
      });
      const out = evaluateOverperformer(trainingProgram, s, evalDay);
      const squat = out?.lifts.find((l) => l.exerciseId === "back_squat_highbar");
      // 146.7 × 0.85 = 124.7, rounded DOWN to a loadable 122.5 — what the
      // founder set by hand.
      expect(squat?.newTM).toBe(122.5);
      expect(out!.reason).toContain("estimated max ~147 kg");
    });

    it("still proposes with two green checks in the week, when the set carries it", () => {
      // Ill 25-27 Sep: no morning checks, so only two stated days in the window.
      const s = overStore({
        tms: { back_squat_highbar: 115 },
        days: [
          { date: "2026-08-12", state: "green", sets: [[80, 5, 5]] },
          { date: "2026-08-17", state: "green", sets: founderSet },
        ],
      });
      const out = evaluateOverperformer(trainingProgram, s, evalDay);
      expect(out, "a set this strong on a green morning is evidence on its own").not.toBeNull();
      expect(out!.triggers[0]).toContain("no amber or red");
    });

    it("does not bypass the streak when any check this week was amber", () => {
      const s = overStore({
        tms: { back_squat_highbar: 115 },
        days: [
          { date: "2026-08-12", state: "amber", sets: [[80, 5, 5]] },
          { date: "2026-08-17", state: "green", sets: founderSet },
        ],
      });
      expect(evaluateOverperformer(trainingProgram, s, evalDay)).toBeNull();
    });

    it("a note alone still needs the full streak", () => {
      const s = overStore({
        tms: { back_squat_highbar: 115 },
        days: [
          { date: "2026-08-12", state: "green", sets: [[80, 5, 9]] },
          { date: "2026-08-17", state: "green", notes: "felt strong today", sets: [[80, 5, 9]] },
        ],
      });
      expect(evaluateOverperformer(trainingProgram, s, evalDay)).toBeNull();
    });

    it("only the lift whose set earned it moves — nothing rides along", () => {
      // 2026-09-28: the front squat was bumped +2.5 on the strength of a
      // back-squat AMRAP, by the heaviest-two fallback meant for notes.
      const s = overStore({
        tms: { back_squat_highbar: 115, deadlift_conventional: 140 },
        days: [
          { date: "2026-08-12", state: "green", sets: [[80, 5, 5]] },
          { date: "2026-08-14", state: "green", sets: [[80, 5, 5]] },
          { date: "2026-08-17", state: "green", sets: founderSet },
        ],
      });
      s.logs["2026-08-17"].exercises["block:deadlift_conventional"] = {
        done: true,
        sets: [set(100, 5, 8)],
        notes: "",
      } as DayLog["exercises"][string];
      const out = evaluateOverperformer(trainingProgram, s, evalDay);
      expect(out!.lifts.map((l) => l.exerciseId)).toEqual(["back_squat_highbar"]);
    });

    it("leaves a lift out when its set implies a training max no higher than the current one", () => {
      // Plenty of reps, but 80 × 8 at RPE 9 is an estimated max near 104 —
      // proposing 115 → 117.5 on it would push the wrong way.
      const weak = overStore({
        tms: { back_squat_highbar: 115 },
        days: [
          { date: "2026-08-12", state: "green", sets: [[80, 5, 5]] },
          { date: "2026-08-14", state: "green", sets: [[80, 5, 5]] },
          { date: "2026-08-17", state: "green", sets: [[80, 8, 9]] },
        ],
      });
      const strong = overStore({
        tms: { back_squat_highbar: 115 },
        days: [
          { date: "2026-08-12", state: "green", sets: [[80, 5, 5]] },
          { date: "2026-08-14", state: "green", sets: [[80, 5, 5]] },
          { date: "2026-08-17", state: "green", sets: [[110, 8, 9]] },
        ],
      });
      // The weak set DOES fire a performance signal — the rep surplus — so a
      // null below is the sizing rule, not a missing signal.
      expect(performanceSignals(trainingProgram, weak, Object.values(weak.logs)).map((p) => p.liftId)).toContain("back_squat_highbar");
      expect(evaluateOverperformer(trainingProgram, strong, evalDay), "control: the same shape with real headroom proposes").not.toBeNull();
      expect(evaluateOverperformer(trainingProgram, weak, evalDay)).toBeNull();
    });
  });

  it("does not fire without an easy signal", () => {
    // Sets must be genuinely hard for this to mean "no signal". The default
    // fixture logs RPE 6, which since 2026-09-03 IS an easy signal on its own
    // — `performanceSignals` reads the numbers rather than waiting for the
    // user to also type "felt easy" underneath them.
    const hard: number[][] = [[100, 5, 9]];
    const s = overStore({
      days: [
        { date: "2026-08-15", state: "green", sets: hard },
        { date: "2026-08-16", state: "green", sets: hard },
        { date: "2026-08-17", state: "green", sets: hard },
      ],
    });
    const out = evaluateOverperformer(trainingProgram, s, evalDay);
    expect(out).toBeNull();
  });

  it("fires on an easy top-set RPE with no note at all", () => {
    // The founder's case: three sessions of deliberate overperformance and
    // empty notes produced nothing, because the only detector read prose.
    const s = overStore({
      days: [
        { date: "2026-08-15", state: "green", sets: [[100, 5, 6]] },
        { date: "2026-08-16", state: "green", sets: [[100, 5, 6]] },
        { date: "2026-08-17", state: "green", sets: [[100, 5, 6]] },
      ],
    });
    const out = evaluateOverperformer(trainingProgram, s, evalDay);
    expect(out).not.toBeNull();
    expect(out!.triggers.join(" ")).toMatch(/RPE 6/);
  });

  it("cites the numbers that fired, not a note that does not exist", () => {
    const s = overStore({
      days: [
        { date: "2026-08-15", state: "green", sets: [[100, 5, 6]] },
        { date: "2026-08-16", state: "green", sets: [[100, 5, 6]] },
        { date: "2026-08-17", state: "green", sets: [[100, 5, 6]] },
      ],
    });
    const out = evaluateOverperformer(trainingProgram, s, evalDay);
    expect(out!.reason).not.toMatch(/felt strong/);
  });

  it("does not fire when any of the last 3 stated days is not green", () => {
    const s = overStore({
      days: [
        { date: "2026-08-15", state: "green" },
        { date: "2026-08-16", state: "amber", notes: "felt strong" },
        { date: "2026-08-17", state: "green" },
      ],
    });
    const out = evaluateOverperformer(trainingProgram, s, evalDay);
    expect(out).toBeNull();
  });

  it("does not fire on programs without strength progression (no training_maxes)", () => {
    const s = overStore({
      days: [
        { date: "2026-08-15", state: "green", notes: "felt strong" },
        { date: "2026-08-16", state: "green" },
        { date: "2026-08-17", state: "green" },
      ],
    });
    // Shape check post-flow-review: no training_maxes.starting_values_kg → ineligible.
    const aerobic: Program = {
      ...trainingProgram,
      slug: "engine-builder",
      training_maxes: undefined,
    } as unknown as Program;
    const out = evaluateOverperformer(aerobic, s, evalDay);
    expect(out).toBeNull();
  });

  it("does not fire in a reintro phase", () => {
    const s = overStore({
      days: [
        { date: "2026-08-15", state: "green", notes: "felt strong" },
        { date: "2026-08-16", state: "green" },
        { date: "2026-08-17", state: "green" },
      ],
    });
    const rehab: Program = {
      ...trainingProgram,
      phases: [
        { id: "phase_1_reintro", name: "Reintro", starts: "2026-08-03", ends: "2026-08-30" } as unknown as Program["phases"][number],
      ],
    };
    const out = evaluateOverperformer(rehab, s, evalDay);
    expect(out).toBeNull();
  });

  it("does not fire when training_maxes is empty", () => {
    const s = overStore({
      days: [
        { date: "2026-08-15", state: "green", notes: "felt strong" },
        { date: "2026-08-16", state: "green" },
        { date: "2026-08-17", state: "green" },
      ],
      tms: {},
    });
    const out = evaluateOverperformer(trainingProgram, s, evalDay);
    expect(out).toBeNull();
  });

  it("uses +5 kg for non-squat lifts", () => {
    const s = overStore({
      days: [
        { date: "2026-08-15", state: "green" },
        { date: "2026-08-16", state: "green", notes: "felt strong" },
        { date: "2026-08-17", state: "green" },
      ],
      tms: { deadlift_conventional: 140 },
    });
    // But the day logs only include back_squat_highbar — deadlift wasn't trained.
    // Add a deadlift log day.
    s.logs["2026-08-16"] = {
      ...s.logs["2026-08-16"],
      exercises: {
        ...s.logs["2026-08-16"].exercises,
        "block:deadlift_conventional": { done: true, sets: [set(140, 3, 7)], notes: "" },
      },
    };
    const out = evaluateOverperformer(trainingProgram, s, evalDay);
    expect(out).not.toBeNull();
    const dl = out!.lifts.find((l) => l.exerciseId === "deadlift_conventional");
    expect(dl?.delta).toBe(5);
  });
});
