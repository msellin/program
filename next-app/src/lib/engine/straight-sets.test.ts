import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { suggestForExercise } from "./suggest";
import type { Program, Store } from "../schemas";

/**
 * Straight-set days must prescribe the number of sets they authored.
 *
 * Found by the founder from his own 2026-09-03 session: "the front squat
 * weights for all 1 + 5 sets in app showed the same, 77kg". The programme
 * authors front squat as `5×5 at 65-75% front squat TM` — five sets — and the
 * app rendered six, because `Suggestion` could only express 5/3/1 (a heavier
 * top set plus lighter back-offs) and a plain 5×5 had to be encoded as
 * `top_set` + `fsl` with the same weight in both.
 *
 * The tell was already in the source: the comment above `VOLUME_BLOCKS` reads
 * "No top-set / FSL structure" directly above a return statement containing
 * exactly that structure.
 *
 * Runs against the real shipped programme on real dates.
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
  training_maxes: { front_squat: 110, back_squat_highbar: 140 },
  cycle: { phase_id: null, cycle_number: 1, week_in_cycle: 1 },
} as unknown as Store;

/** Mirrors DaySession's row maths — the number of sets the user is shown. */
const rowsFor = (s: { fsl?: { sets: number } | null; straight_sets?: boolean } | null) =>
  s?.fsl ? s.fsl.sets + (s.straight_sets ? 0 : 1) : null;

describe("front squat — a straight-set day", () => {
  const s = suggestForExercise("front_squat", "block_squat_variant", program, store, "2026-09-03");

  it("is marked as straight sets", () => {
    expect(s?.straight_sets).toBe(true);
  });

  it("shows five sets, matching the authored 5×5", () => {
    expect(rowsFor(s!)).toBe(5);
  });

  it("puts every set at the same weight, because that is the prescription", () => {
    expect(s?.top_set.kg).toBe(s?.fsl?.kg);
  });
});

describe("back squat — a real 5/3/1 day", () => {
  const s = suggestForExercise(
    "back_squat_highbar",
    "block_squat_heavy",
    program,
    store,
    "2026-09-01",
  );

  it("is not marked straight", () => {
    expect(s?.straight_sets).toBeFalsy();
  });

  it("shows six sets — a top set plus five back-offs", () => {
    expect(rowsFor(s!)).toBe(6);
  });

  it("keeps the top set heavier than the back-offs", () => {
    // The founder's other observation, and this one is the programme working:
    // block_squat_heavy authors back_squat_highbar TWICE, as a 5/3/1 top set
    // and an FSL 5×5. Heavier-then-lighter is correct here.
    expect(s!.top_set.kg).toBeGreaterThan(s!.fsl!.kg);
  });
});
