import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import type { Program } from "../schemas";

/**
 * Off-plan logging has to reach the lifts the engine actually reads.
 *
 * Until 2026-09-03 it offered `accessory` and `run` blocks and nothing else,
 * so there was no way to record a barbell lift done outside your own session.
 * The founder front-squatted to a 115 single in a CrossFit class; nothing
 * about it reached the app; his front-squat training max stayed wrong for
 * weeks, and the engine prescribed front squats two days later knowing
 * nothing about the session that had just happened.
 *
 * This asserts the thing that made it unreachable: the categories off-plan
 * surfaces must cover every lift that carries a training max, because those
 * are exactly the lifts `tm-plausibility` and `performanceSignals` read.
 */
const DATA = path.resolve(__dirname, "../../../public/data/programs");

/** Mirrors `groupDefs` in OffPlanSession. */
const OFFPLAN_CATEGORIES = new Set(["accessory", "run", "strength"]);

const SOURCE = fs.readFileSync(
  path.resolve(__dirname, "../../components/offplan/OffPlanSession.tsx"),
  "utf8",
);

function programs(): Array<{ slug: string; program: Program }> {
  return fs
    .readdirSync(DATA)
    .filter((f) => f.endsWith(".json") && f !== "manifest.json")
    .map((f) => ({
      slug: f.replace(/\.json$/, ""),
      program: JSON.parse(fs.readFileSync(path.join(DATA, f), "utf8")) as Program,
    }));
}

describe("off-plan reaches every lift the engine reads", () => {
  it("the component still declares the categories this test assumes", () => {
    // Guards the guard: the list above is a mirror, and a mirror that stops
    // matching is worse than no test.
    for (const cat of OFFPLAN_CATEGORIES) {
      expect(SOURCE, `OffPlanSession no longer offers "${cat}"`).toContain(`cat: "${cat}"`);
    }
  });

  /**
   * A TM whose lift no block prescribes. Not an off-plan failure — the lift
   * is unreachable everywhere, not just here — so it is named separately
   * rather than folded into the coverage count.
   */
  const TM_WITHOUT_A_BLOCK: Record<string, string> = {
    "anterior-hip-rebuild: deadlift_conventional":
      "KEPT ON PURPOSE, resolved 2026-09-04. This entry previously read as a " +
      "loose end awaiting deletion, on the claim that it 'puts a number in the " +
      "user's store'. It does not, on two counts: the starting value is null, " +
      "and nothing reads starting_values_kg to seed a TM anyway — the only " +
      "runtime read of that object is Boolean(tms.starting_values_kg), a shape " +
      "check in adapt.ts's hasStrengthProgression. Training maxes reach a store " +
      "from intake and setTM, nowhere else. So there is no number and nothing " +
      "for tm-plausibility to reason about. " +
      "What the entry actually is: the programme's goal state. It carries an " +
      "exercise_overrides gate — 'Only if the block pull has been symptom-free " +
      "at ~150 kg for at least 4 weeks' — and block_pull_midshin is cued as " +
      "'the primary heavy pull until conventional deadlift is symptom-free'. " +
      "Deleting it would delete a documented clinical reintroduction gate to " +
      "tidy up a field that does nothing.",
  };

  it("every TM lift a block prescribes can be logged off-plan", () => {
    const offenders: string[] = [];
    for (const { slug, program } of programs()) {
      const tmLifts = new Set(
        Object.keys(
          (program as unknown as { training_maxes?: { starting_values_kg?: Record<string, number> } })
            .training_maxes?.starting_values_kg ?? {},
        ),
      );
      if (tmLifts.size === 0) continue;

      const inAnyBlock = new Set<string>();
      const reachable = new Set<string>();
      for (const b of program.blocks ?? []) {
        const cat = (b as unknown as { category?: string }).category ?? "strength";
        for (const item of b.items ?? []) {
          if (!item.exercise_id) continue;
          inAnyBlock.add(item.exercise_id);
          if (OFFPLAN_CATEGORIES.has(cat)) reachable.add(item.exercise_id);
        }
      }

      for (const lift of tmLifts) {
        if (!inAnyBlock.has(lift)) continue; // covered by the test below
        if (!reachable.has(lift)) offenders.push(`${slug}: ${lift} cannot be logged off-plan`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it("no NEW training max exists for a lift nothing prescribes", () => {
    const offenders: string[] = [];
    for (const { slug, program } of programs()) {
      const tmLifts = Object.keys(
        (program as unknown as { training_maxes?: { starting_values_kg?: Record<string, number> } })
          .training_maxes?.starting_values_kg ?? {},
      );
      const inAnyBlock = new Set(
        (program.blocks ?? []).flatMap((b) =>
          (b.items ?? []).map((i) => i.exercise_id).filter(Boolean as unknown as (x: unknown) => boolean),
        ) as string[],
      );
      for (const lift of tmLifts) {
        const key = `${slug}: ${lift}`;
        if (!inAnyBlock.has(lift) && !(key in TM_WITHOUT_A_BLOCK)) offenders.push(key);
      }
    }
    expect(offenders).toEqual([]);
  });

  it("strength is offered, which is the whole point", () => {
    // Named separately so a regression reads as what it is rather than as a
    // generic coverage failure.
    expect(SOURCE).toContain('cat: "strength"');
    expect(SOURCE).toMatch(/Lifts you did elsewhere/);
  });
});

/**
 * The 2026-09-03 fix was half a fix, and the founder hit the other half.
 *
 * The test above asserts off-plan surfaces the `strength` CATEGORY. It does,
 * and the category was sourced — like every other group — from
 * `program.blocks`. So "lifts you did elsewhere" could only ever offer lifts
 * your own programme already prescribes. A front squat worked because the
 * founder's programme has a front-squat block. A bench press did not: no
 * programme has a bench block, and `bench_press` was not among the 134
 * exercises at all.
 *
 * The consequence was a bench session filed as `activity_type: "other"` on
 * `runLogSchema` — an AEROBIC shape with distance, minutes and heart rate, and
 * nowhere to put sets, reps or weight. The lift was recorded as cardio.
 *
 * A group whose premise is "this was not on the plan" cannot be sourced from
 * the plan. These assert the two halves that fix it: the library carries the
 * common barbell lifts, and the component reads the library rather than only
 * the programme.
 */
describe("off-plan reaches lifts no programme prescribes", () => {
  const EXERCISES = path.resolve(__dirname, "../../../public/data/exercises.json");
  const library = JSON.parse(fs.readFileSync(EXERCISES, "utf8")) as {
    exercises: Array<{ id: string; category: string }>;
  };

  /**
   * The lifts a strength athlete logs outside a plan. The library grew out of
   * a hip-rehab corpus, so it was squat / deadlift / hip heavy and had no
   * horizontal or vertical press of any kind.
   */
  const MUST_EXIST = [
    "bench_press",
    "overhead_press_barbell",
    "barbell_row",
    "weighted_pullup",
    "dip_weighted",
    "romanian_deadlift",
  ];

  it.each(MUST_EXIST)("%s is in the shared library", (id) => {
    const found = library.exercises.find((e) => e.id === id);
    expect(found, `${id} missing — a lift with no library entry cannot be logged as a lift`).toBeTruthy();
    expect(["strength", "unilateral"]).toContain(found!.category);
  });

  it("none of them is prescribed by any programme, which is the point", () => {
    // If one of these ever enters a programme's blocks it stops being proof
    // that the library path works, and this test should pick a different lift
    // rather than quietly keep passing for the wrong reason.
    const prescribed = new Set(
      programs().flatMap(({ program }) =>
        (program.blocks ?? []).flatMap((b) => {
          const items = b.items ?? (b.segments ?? []).flatMap((s) => s.items ?? []);
          return items.map((i) => i.exercise_id).filter(Boolean) as string[];
        }),
      ),
    );
    expect(MUST_EXIST.filter((id) => prescribed.has(id))).toEqual([]);
  });

  it("the component sources that group from the library, not from program.blocks", () => {
    // Mirror-guard, same contract as the category check above. If this read
    // reverts to `program.blocks` the group silently narrows back to the
    // programme's own lifts and nothing else fails.
    expect(SOURCE, "libraryLifts was removed — off-plan is back to programme-only lifts").toContain(
      "libraryLifts",
    );
    expect(SOURCE, "library lifts must reach the rail, not just be computed").toMatch(
      /return \[\.\.\.out, \.\.\.libraryLifts\]/,
    );
    expect(SOURCE, "library lifts need their own block id so logs stay keyed distinctly").toContain(
      'LIBRARY_BLOCK_ID = "off_plan_library"',
    );
  });

  it("does not offer a lift twice when the programme already prescribes it", () => {
    expect(SOURCE, "library lifts must exclude what the programme's strength blocks contribute").toContain(
      "fromProgram.has(e.id)",
    );
  });
});
