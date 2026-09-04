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
