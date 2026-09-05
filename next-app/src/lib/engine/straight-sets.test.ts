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

describe("concurrent-strength-maintenance — the sibling that was missed", () => {
  /**
   * Same defect, same rowCount maths, different programme — found 2026-09-05
   * from the founder's own question: "we have programmes that are not
   * fixed...why dnt we fix them?"
   *
   * The 2026-09-03 fix added `straight_sets` to `VOLUME_BLOCKS` and
   * `VARIANT_BLOCKS`, both holding `anterior-hip-rebuild` ids alone. CSM's
   * maintenance branch sits TEN LINES ABOVE them in the same function,
   * authors straight sets too, and did not get the flag — so every CSM user
   * saw six rows for a 5×5 and six for a 5×3.
   *
   * It reached the SR panel as a prescription concern ("block note
   * contradicts its own items") and was filed as a clinical judgement
   * nobody could action. It was a one-line rendering defect.
   */
  const csm: Program = (() => {
    const p = JSON.parse(
      fs.readFileSync(
        path.resolve(
          __dirname,
          "../../../public/data/programs/concurrent-strength-maintenance.json",
        ),
        "utf8",
      ),
    ) as Program;
    p.slug = "concurrent-strength-maintenance";
    return p;
  })();

  const csmStore = {
    logs: {},
    training_maxes: { back_squat_highbar: 140, block_pull_midshin: 160, front_squat: 110 },
    cycle: { phase_id: null, cycle_number: 1, week_in_cycle: 1 },
  } as unknown as Store;

  const cases: Array<[string, string, string, number]> = [
    ["back squat 5×5 @75%", "back_squat_highbar", "block_strength_heavy", 5],
    ["block pull 5×3 @78%", "block_pull_midshin", "block_strength_heavy", 5],
    ["front squat 5×5 @65%", "front_squat", "block_strength_moderate", 5],
  ];

  for (const [label, exId, blockId, rows] of cases) {
    it(`${label} shows ${rows} sets, not ${rows + 1}`, () => {
      const s = suggestForExercise(exId, blockId, csm, csmStore, "2026-09-05");
      expect(s?.straight_sets, `${label} must be marked straight`).toBe(true);
      expect(rowsFor(s!), label).toBe(rows);
      // A maintenance day is one weight, all sets. If these ever diverge the
      // branch has started behaving like 5/3/1 again.
      expect(s?.top_set.kg).toBe(s?.fsl?.kg);
    });
  }

  it("prescribes the authored percentages, not an autoregulated guess", () => {
    // The other half of what looked wrong: CSM's phases are not in
    // MAIN_PHASE_IDS, so if this branch ever stopped matching, the fall-through
    // is the autoregulate-from-last-set path written for hip REHAB — including
    // an "80% TM (reintro)" cap, in a maintenance programme.
    const s = suggestForExercise(
      "back_squat_highbar",
      "block_strength_heavy",
      csm,
      csmStore,
      "2026-09-05",
    );
    expect(s?.top_set.kg).toBe(105); // 75% of 140
    expect(s?.reasoning).not.toMatch(/reintro/i);
  });
});
