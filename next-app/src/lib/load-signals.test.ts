import { describe, it, expect } from "vitest";
import {
  LOAD_SIGNALS,
  loadSignalsForProgram,
  axisUnitFor,
  LEGACY_LOAD_SIGNALS,
} from "./load-signals";
import type { DayLog } from "./schemas";

/**
 * The defect: `SymptomLoadChart` hardcoded three squat and four deadlift ids
 * as its entire notion of load. Only two of nine shipped programs prescribe
 * any of them, so the other seven drew a symptom line against an empty load
 * line — on `/record` and on the `/report` page meant for a specialist.
 *
 * The symptom axis of the same chart had already been de-hardcoded for
 * exactly this reason. These tests pin the load axis so it cannot drift back.
 */

function day(partial: Partial<DayLog> & { date: string }): DayLog {
  return {
    exercises: {},
    symptoms: null,
    derived_state: null,
    notes: "",
    ...partial,
  } as DayLog;
}

const signal = (id: string) => {
  const s = LOAD_SIGNALS.find((x) => x.id === id);
  if (!s) throw new Error(`no signal ${id}`);
  return s;
};

describe("load signals extract what their program actually logs", () => {
  it("reads a barbell top set from the heaviest set of the day", () => {
    const d = day({
      date: "2026-09-01",
      exercises: {
        "block_a:back_squat_highbar": {
          sets: [{ weight_kg: 100, reps: 5 }, { weight_kg: 120, reps: 3 }],
        },
      } as unknown as DayLog["exercises"],
    });
    expect(signal("squat_top_kg").extract(d)).toBe(120);
  });

  it("reads aerobic minutes from runs[], where run-category blocks are logged", () => {
    // DaySession skips `category: "run"` blocks, so this work never lands in
    // exercises[] — a set-based signal reads empty for every aerobic program.
    const d = day({
      date: "2026-09-01",
      runs: [{ minutes: 40 }, { minutes: 25 }],
    } as unknown as Partial<DayLog> & { date: string });
    expect(signal("aerobic_minutes").extract(d)).toBe(65);
  });

  it("falls back to total_seconds when a run has no minutes field", () => {
    const d = day({
      date: "2026-09-01",
      runs: [{ total_seconds: 428 }],
    } as unknown as Partial<DayLog> & { date: string });
    expect(signal("aerobic_minutes").extract(d)).toBe(7);
  });

  it("sums working reps for bodyweight skill programs", () => {
    const d = day({
      date: "2026-09-01",
      exercises: {
        "block_a:negative_pullup": { sets: [{ reps: 5 }, { reps: 4 }] },
        "block_b:ring_row": { sets: [{ reps: 8 }] },
      } as unknown as DayLog["exercises"],
    });
    expect(signal("working_reps").extract(d)).toBe(17);
  });

  it("sums hold seconds for hold-dominant programs", () => {
    const d = day({
      date: "2026-09-01",
      exercises: {
        "block_a:wall_handstand": { sets: [{ seconds: 30 }, { seconds: 45 }] },
      } as unknown as DayLog["exercises"],
    });
    expect(signal("hold_seconds").extract(d)).toBe(75);
  });

  it("returns null rather than zero on a day with nothing to say", () => {
    // A null leaves a gap in the line; a zero draws a point claiming the user
    // trained and lifted nothing.
    const d = day({ date: "2026-09-01" });
    for (const s of LOAD_SIGNALS) expect(s.extract(d)).toBeNull();
  });

  it("ignores a set logged with no weight when reading a kg signal", () => {
    const d = day({
      date: "2026-09-01",
      exercises: {
        "block_a:back_squat_highbar": { sets: [{ reps: 5 }] },
      } as unknown as DayLog["exercises"],
    });
    expect(signal("squat_top_kg").extract(d)).toBeNull();
  });
});

describe("a program selects its load signals the way it selects symptom regions", () => {
  it("resolves declared ids", () => {
    const out = loadSignalsForProgram({ load_signals: ["aerobic_minutes"] });
    expect(out.map((s) => s.id)).toEqual(["aerobic_minutes"]);
  });

  it("drops an unknown id rather than throwing", () => {
    const out = loadSignalsForProgram({ load_signals: ["aerobic_minutes", "nope"] });
    expect(out.map((s) => s.id)).toEqual(["aerobic_minutes"]);
  });

  it("falls back to the historical squat/pull pair when none is declared", () => {
    expect(loadSignalsForProgram({}).map((s) => s.id)).toEqual([...LEGACY_LOAD_SIGNALS]);
    expect(loadSignalsForProgram(null).map((s) => s.id)).toEqual([...LEGACY_LOAD_SIGNALS]);
  });
});

describe("the load axis has one unit", () => {
  it("agrees when every signal shares a unit", () => {
    expect(axisUnitFor(loadSignalsForProgram({ load_signals: ["squat_top_kg", "pull_top_kg"] }))).toBe("kg");
  });

  it("returns null when signals disagree, so the caller can draw no axis", () => {
    // Kilograms and minutes on one scale is a chart that lies about both.
    expect(
      axisUnitFor(loadSignalsForProgram({ load_signals: ["squat_top_kg", "aerobic_minutes"] })),
    ).toBeNull();
  });

  it("returns null for an empty set", () => {
    expect(axisUnitFor([])).toBeNull();
  });
});
