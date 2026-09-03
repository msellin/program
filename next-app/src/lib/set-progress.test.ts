import { describe, it, expect } from "vitest";
import { countLoggedSets, isSetLogged, requiredRowCount, isOptionalRow } from "./set-progress";

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

describe("requiredRowCount / isOptionalRow (optional session items, 2026-09-03)", () => {
  it("a plain exercise: every row is required", () => {
    const r = { rowCount: 5 };
    expect(requiredRowCount(r)).toBe(5);
    expect(isOptionalRow(r, 0)).toBe(false);
    expect(isOptionalRow(r, 4)).toBe(false);
  });

  it("a wholly-optional exercise has zero required rows", () => {
    const r = { rowCount: 3, optional: true };
    expect(requiredRowCount(r)).toBe(0);
    expect(isOptionalRow(r, 0)).toBe(true);
    expect(isOptionalRow(r, 2)).toBe(true);
  });

  it("a taper day: top set required, the five FSL rows optional", () => {
    // rowCount = fsl.sets + 1, so row 0 is the top set and rows 1-5 are FSL.
    const r = { rowCount: 6, optionalRows: 5 };
    expect(requiredRowCount(r)).toBe(1);
    expect(isOptionalRow(r, 0)).toBe(false);
    expect(isOptionalRow(r, 1)).toBe(true);
    expect(isOptionalRow(r, 5)).toBe(true);
  });

  it("never returns a negative count if optionalRows overshoots", () => {
    expect(requiredRowCount({ rowCount: 2, optionalRows: 9 })).toBe(0);
  });

  it("optional work still counts once logged — it is skippable, not fake", () => {
    // The whole design: optional rows are excluded from what you OWE, not
    // from what you DID. countLoggedSets stays ignorant of optionality.
    const sets = [
      { weight_kg: 100, reps: 3 },
      { weight_kg: 77, reps: 5 },
    ];
    expect(countLoggedSets(sets, true)).toBe(2);
  });
});
