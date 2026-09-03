import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { performanceSignals } from "./adapt";
import type { Program, Store, DayLog } from "../schemas";

/**
 * The founder spent three sessions demonstrating that his training maxes were
 * wrong — going heavier than prescribed and taking extra reps on every top
 * set — and the engine proposed nothing, because `evaluateOverperformer`
 * required a written "felt strong" cue and his notes were empty.
 *
 * His words: "the reps and TM should pretty much show how the weight felt and
 * how easy or hard it was." He had logged RPE 7 on nine reps. The app had
 * "this was easy" in numbers and went looking for the words.
 *
 * Fixtures below are his real logged sets, against the real shipped program.
 */
const program: Program = (() => {
  const p = JSON.parse(
    fs.readFileSync(
      path.resolve(__dirname, "../../../public/data/programs/anterior-hip-rebuild.json"),
      "utf8",
    ),
  ) as Program;
  p.slug = "anterior-hip-rebuild";
  return p;
})();

function day(date: string, key: string, sets: Array<[number, number, number | null]>): DayLog {
  return {
    date,
    notes: "",
    symptoms: null,
    derived_state: "green",
    exercises: {
      [key]: {
        done: true,
        weight_kg: null,
        reps: null,
        notes: "",
        sets: sets.map(([weight_kg, reps, rpe]) => ({ weight_kg, reps, rpe })),
      },
    },
  } as unknown as DayLog;
}

const store = {
  version: 2,
  logs: {},
  training_maxes: { front_squat: 110, back_squat_highbar: 110, block_pull_midshin: 145 },
  cycle: { phase_id: null, cycle_number: 1, week_in_cycle: 1 },
} as unknown as Store;

describe("performanceSignals — the founder's own sessions", () => {
  it("reads 95×9 against a prescribed 93.5×5+ as headroom", () => {
    const d = day("2026-08-31", "block_squat_heavy:back_squat_highbar", [
      [95, 9, null],
      [75, 5, 7],
    ]);
    const out = performanceSignals(program, { ...store, logs: { "2026-08-31": d } }, [d]);
    expect(out.map((s) => s.liftId)).toContain("back_squat_highbar");
    expect(out[0].reason).toMatch(/95 kg × 9/);
  });

  it("reads 80×9 at RPE 7 on the front squat as headroom", () => {
    const d = day("2026-09-03", "block_squat_variant:front_squat", [
      [80, 9, 7],
      [80, 5, 5],
    ]);
    const out = performanceSignals(program, { ...store, logs: { "2026-09-03": d } }, [d]);
    expect(out.map((s) => s.liftId)).toContain("front_squat");
  });

  it("does not fire on a top set that was genuinely hard", () => {
    // 115×5 at RPE 9 is the lift working as intended. A detector that reads
    // every session as headroom is a detector nobody can trust.
    const d = day("2026-08-20", "block_squat_heavy:back_squat_highbar", [[115, 5, 9]]);
    const out = performanceSignals(program, { ...store, logs: { "2026-08-20": d } }, [d]);
    expect(out).toEqual([]);
  });

  it("ignores a lift with no training max", () => {
    const d = day("2026-09-02", "block_pull_heavy:hip_thrust_barbell", [[60, 8, 5]]);
    const out = performanceSignals(program, { ...store, logs: { "2026-09-02": d } }, [d]);
    expect(out).toEqual([]);
  });

  it("names one signal per lift, not one per set", () => {
    const d = day("2026-09-02", "block_pull_heavy:block_pull_midshin", [
      [125, 9, 7],
      [100, 7, 5],
      [100, 7, 5],
    ]);
    const out = performanceSignals(program, { ...store, logs: { "2026-09-02": d } }, [d]);
    expect(out).toHaveLength(1);
  });
});
