import { describe, it, expect } from "vitest";
import { isSetLogged, countLoggedSets } from "./set-progress";

/**
 * Regression cover for the 31 Aug founder report: bodyweight sets were
 * invisible to every progress counter, so saving set 2 or 3 of dead bug
 * bounced back to set 1 and the exercise never read as done.
 */
describe("set-progress", () => {
  it("counts a bodyweight set as logged when it carries reps", () => {
    expect(isSetLogged({ weight_kg: null, reps: 6 }, false)).toBe(true);
  });

  it("does NOT count a bodyweight set with no reps", () => {
    expect(isSetLogged({ weight_kg: null, reps: null }, false)).toBe(false);
  });

  it("still requires a weight on loadable exercises", () => {
    expect(isSetLogged({ weight_kg: null, reps: 5 }, true)).toBe(false);
    expect(isSetLogged({ weight_kg: 93.5, reps: 9 }, true)).toBe(true);
  });

  it("treats a zero weight as logged — 0 kg is a value, not an absence", () => {
    expect(isSetLogged({ weight_kg: 0, reps: 12 }, true)).toBe(true);
  });

  it("handles missing/undefined sets", () => {
    expect(isSetLogged(undefined, false)).toBe(false);
    expect(isSetLogged(null, true)).toBe(false);
  });

  it("counts the founder's 31 Aug dead bug as 3 of 3, not 0", () => {
    const sets = [
      { weight_kg: null, reps: 6, rpe: 7 },
      { weight_kg: null, reps: 6, rpe: null },
      { weight_kg: null, reps: 6, rpe: 7 },
    ];
    expect(countLoggedSets(sets, false)).toBe(3);
    // The old open-coded predicate scored this zero, which is the bug.
    expect(sets.filter((s) => s.weight_kg != null && s.reps != null).length).toBe(0);
  });

  it("counts a loaded accessory normally", () => {
    const sets = [
      { weight_kg: 12.5, reps: 8, rpe: 7 },
      { weight_kg: 12.5, reps: 8, rpe: 8 },
    ];
    expect(countLoggedSets(sets, true)).toBe(2);
  });
});
