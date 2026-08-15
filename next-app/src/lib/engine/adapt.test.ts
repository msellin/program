import { describe, it, expect } from "vitest";
import { detectPauseResume, assessWaypoints } from "./adapt";
import type { Store, Program } from "../schemas";

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
