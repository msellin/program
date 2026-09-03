import { describe, it, expect } from "vitest";
import { nextAfterSet } from "./advance";
import type { RailExercise } from "@/components/session/DaySession";

// Only the fields nextAfterSet reads. The rest of RailExercise (exercise,
// suggestion, blockName…) is irrelevant here and casting keeps the intent
// of each case visible rather than burying it in fixture noise.
function rail(key: string, rowCount: number, opts: Partial<RailExercise> = {}) {
  return { key, rowCount, ...opts } as RailExercise;
}

describe("nextAfterSet", () => {
  it("advances to the next set of the same exercise while rows remain", () => {
    const r = [rail("a", 5), rail("b", 3)];
    expect(nextAfterSet(r, 0, 2)).toEqual({ kind: "set", setIndex: 2, rail: r[0] });
  });

  it("advances to the next exercise when the active one is complete", () => {
    const r = [rail("a", 5), rail("b", 3)];
    expect(nextAfterSet(r, 0, 5)).toEqual({ kind: "exercise", rail: r[1] });
  });

  it("is done at the end of the rail", () => {
    const r = [rail("a", 2)];
    expect(nextAfterSet(r, 0, 2)).toEqual({ kind: "done" });
  });

  it("returns done for an out-of-range index", () => {
    expect(nextAfterSet([], 0, 0)).toEqual({ kind: "done" });
  });

  // --- optional items (2026-09-03) ---

  it("does NOT auto-advance into a wholly-optional exercise", () => {
    // Taper Monday: squat, then an optional Bulgarian split squat.
    // Finishing the squat must not march the user into work the app just
    // told them they could skip.
    const r = [rail("squat", 1), rail("bulgarian", 3, { optional: true })];
    expect(nextAfterSet(r, 0, 1)).toEqual({ kind: "done" });
  });

  it("skips PAST an optional exercise to the next required one", () => {
    const r = [
      rail("squat", 1),
      rail("bulgarian", 3, { optional: true }),
      rail("dead_bug", 3),
    ];
    expect(nextAfterSet(r, 0, 1)).toEqual({ kind: "exercise", rail: r[2] });
  });

  it("an exercise whose rows are ALL optional is skipped too", () => {
    const r = [rail("squat", 1), rail("fsl_only", 5, { optionalRows: 5 }), rail("hollow", 2)];
    expect(nextAfterSet(r, 0, 1)).toEqual({ kind: "exercise", rail: r[2] });
  });

  it("an exercise with a required top set is still advanced into", () => {
    // Taper FSL: rowCount 6, five optional — one required row remains, so
    // this exercise is real work and must not be skipped.
    const r = [rail("a", 2), rail("squat", 6, { optionalRows: 5 })];
    expect(nextAfterSet(r, 0, 2)).toEqual({ kind: "exercise", rail: r[1] });
  });

  it("once you are IN optional work, it advances normally through it", () => {
    // Opting in is the user's call; having opted in, the flow should not
    // fight them by refusing to move to the next backoff set.
    const r = [rail("squat", 6, { optionalRows: 5 })];
    expect(nextAfterSet(r, 0, 3)).toEqual({ kind: "set", setIndex: 3, rail: r[0] });
  });
});
