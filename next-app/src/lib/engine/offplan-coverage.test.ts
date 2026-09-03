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
      "Seeds a starting training max for a lift no block prescribes. Harmless " +
      "at runtime, but it puts a number in the user's store for work the " +
      "programme never asks for, and tm-plausibility will happily reason about " +
      "it. Left for the programme's author: deleting a training max is a " +
      "programming decision, not a cleanup.",
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
