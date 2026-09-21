import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { suggestForExercise } from "./suggest";
import { STANDARD_PLATES_KG } from "../plates";
import type { Program, Store } from "../schemas";

/**
 * The 5/3/1 deload week, and the loadability of every prescription.
 *
 * Both found by the founder on 2026-09-21, the first deload Monday this
 * programme has ever reached — which is why nothing caught either earlier:
 * weeks 1-3 all carry FSL, and every test and every persona ran on those.
 *
 * Two defects, one cause. `Suggestion` could only say "one heavy set, then N
 * identical lighter ones". A deload is three DIFFERENT working sets
 * (40/50/60% × 5), so it was folded into `warmups` (a text line, not rows)
 * plus a `top_set`, and `fsl: null` sent the row count to `defaultSets` — 5,
 * from `exercises.json`. The app showed five rows for a three-set day, four
 * of them blank, the only weight on the last one.
 *
 * The second: 50% of a 112.5 kg TM is 56.25, which rounded to 56.5 on a 0.5
 * step. The smallest plate is 1.25 kg and plates go on in pairs, so the bar
 * moves in 2.5 kg jumps and 56.5 cannot be loaded at all.
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

/** The founder's real TM on the day this was found. */
const store = {
  logs: {},
  training_maxes: { back_squat_highbar: 112.5, front_squat: 112.5, block_pull_midshin: 155 },
} as unknown as Store;

/** Mirrors DaySession's row maths — the number of rows the user is shown. */
const rowsFor = (
  s: { working_sets?: unknown[]; fsl?: { sets: number } | null; straight_sets?: boolean } | null,
  defaultSets: number,
) =>
  s?.working_sets?.length
    ? s.working_sets.length
    : s?.fsl
      ? s.fsl.sets + (s.straight_sets ? 0 : 1)
      : defaultSets;

const BAR_STEP = Math.min(...STANDARD_PLATES_KG) * 2;
const isLoadable = (kg: number) => Math.abs(kg / BAR_STEP - Math.round(kg / BAR_STEP)) < 1e-9;

// Week 4 of phase_2_cycle_1, which starts 2026-08-30. Day 22 → week index 3.
const DELOAD_MONDAY = "2026-09-21";
// Week 3 — the last week that carries FSL. Guards against the fix leaking.
const HEAVY_MONDAY = "2026-09-14";

describe("the deload week prescribes the sets it actually wants", () => {
  const s = suggestForExercise(
    "back_squat_highbar", "block_squat_heavy", program, store, DELOAD_MONDAY,
  );

  it("emits an explicit three-set ladder", () => {
    expect(s?.working_sets?.length, "a 40/50/60 deload is three working sets").toBe(3);
  });

  it("shows three rows, not the five that exercises.json defaults to", () => {
    // 5 is back_squat_highbar's `default.sets` — the number the row count fell
    // through to, and the number the founder was shown.
    expect(rowsFor(s!, 5)).toBe(3);
  });

  it("carries no FSL, because a deload has no back-off work", () => {
    expect(s?.fsl ?? null).toBeNull();
  });

  it("ascends, and tops out at the heaviest set", () => {
    const kgs = s!.working_sets!.map((w) => w.kg);
    expect(kgs).toEqual([...kgs].sort((a, b) => a - b));
    expect(s!.top_set.kg).toBe(kgs[kgs.length - 1]);
  });

  it("does not hide two thirds of the session in `warmups`", () => {
    // The warm-up line renders as text. Anything listed there is work the
    // user is told is optional preamble.
    expect(s?.warmups ?? []).toEqual([]);
  });

  it("says the word deload, so the screen explains itself", () => {
    expect(s?.reasoning.toLowerCase()).toContain("deload");
  });
});

describe("every prescribed weight can be put on a bar", () => {
  const cases: [string, string, string][] = [
    ["back_squat_highbar", "block_squat_heavy", DELOAD_MONDAY],
    ["back_squat_highbar", "block_squat_heavy", HEAVY_MONDAY],
    ["block_pull_midshin", "block_pull_heavy", DELOAD_MONDAY],
    ["front_squat", "block_squat_variant", "2026-09-17"],
  ];

  for (const [exId, blockId, date] of cases) {
    it(`${exId} on ${date} rounds to a loadable weight`, () => {
      const s = suggestForExercise(exId, blockId, program, store, date);
      if (!s) return;
      const all = [
        s.top_set.kg,
        ...(s.working_sets ?? []).map((w) => w.kg),
        ...(s.warmups ?? []).map((w) => w.kg),
        ...(s.fsl ? [s.fsl.kg] : []),
      ];
      for (const kg of all) {
        expect(
          isLoadable(kg),
          `${kg} kg cannot be loaded — plates are ${STANDARD_PLATES_KG.join("/")} and go on in pairs`,
        ).toBe(true);
      }
    });
  }

  it("specifically does not ask for 56.5 kg, the weight that started this", () => {
    const s = suggestForExercise(
      "back_squat_highbar", "block_squat_heavy", program, store, DELOAD_MONDAY,
    );
    expect(s!.working_sets!.map((w) => w.kg)).not.toContain(56.5);
  });
});

describe("the heavy weeks are unchanged", () => {
  const s = suggestForExercise(
    "back_squat_highbar", "block_squat_heavy", program, store, HEAVY_MONDAY,
  );

  it("still uses the top-set + FSL shape", () => {
    expect(s?.working_sets ?? null).toBeNull();
    expect(s?.fsl?.sets).toBe(5);
  });

  it("still shows six rows — one top set plus five back-offs", () => {
    expect(rowsFor(s!, 5)).toBe(6);
  });
});
