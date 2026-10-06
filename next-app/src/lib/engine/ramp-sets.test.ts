import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { prescriptionRows, suggestForExercise } from "./suggest";
import type { Program, Store } from "../schemas";

/**
 * The 5/3/1 sets before the top set are working sets, and every surface must
 * show them as rows.
 *
 * Founder, 2026-10-06, on the 2026-10-05 squat day (Cycle 2 week 2, TM
 * 122.5): the session opened on set 1 = 110 × 3+, then 5 × 85. The 70% and
 * 80% sets — 85 × 3 and 97.5 × 3 — were in `warmups`, which the set-by-set
 * session never rendered, so every week of every cycle went straight to the
 * top set cold. "All weeks app doesn't seem to show correct structure on the
 * lifts."
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

const store = {
  logs: {},
  training_maxes: { back_squat_highbar: 122.5, front_squat: 107.5, block_pull_midshin: 155 },
} as unknown as Store;

const rows = (date: string, exId = "back_squat_highbar", blockId = "block_squat_heavy") =>
  prescriptionRows(suggestForExercise(exId, blockId, program, store, date), 5).map((r) =>
    r ? `${r.kg}x${r.reps}` : null,
  );

describe("5/3/1 days render every working set, in order", () => {
  it("2026-10-05, the day it was found: 85x3, 97.5x3, 110x3+, then 5 x 85", () => {
    expect(rows("2026-10-05")).toEqual(["85x3", "97.5x3", "110x3+", "85x5", "85x5", "85x5", "85x5", "85x5"]);
  });

  it("week 1 (5s): 65/75/85% x 5, 5+", () => {
    expect(rows("2026-09-28").slice(0, 3)).toEqual(["80x5", "92.5x5", "105x5+"]);
  });

  it("week 3 (5/3/1): 75/85/95% x 5, 3, 1+", () => {
    expect(rows("2026-10-12").slice(0, 3)).toEqual(["92.5x5", "105x3", "117.5x1+"]);
  });

  it("week 4 (deload) stays a three-set ladder with no ramp", () => {
    expect(rows("2026-10-19")).toEqual(["50x5", "62.5x5", "72.5x5"]);
  });

  it("pull day gets the same structure", () => {
    expect(rows("2026-10-07", "block_pull_midshin", "block_pull_heavy").slice(0, 3)).toEqual([
      "107.5x3",
      "125x3",
      "140x3+",
    ]);
  });

  it("straight-set days are unchanged: 5 rows, one weight", () => {
    const r = rows("2026-10-08", "front_squat", "block_squat_variant");
    expect(r).toHaveLength(5);
    expect(new Set(r).size).toBe(1);
  });

  it("passing a result's length back in returns the same rows", () => {
    const s = suggestForExercise("back_squat_highbar", "block_squat_heavy", program, store, "2026-10-05");
    const once = prescriptionRows(s, 5);
    expect(prescriptionRows(s, once.length)).toEqual(once);
  });
});
