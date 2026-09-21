import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

/**
 * Adding a set has to produce a row you can see, and every row has to be
 * removable.
 *
 * Found in the founder's 2026-09-21 back squat, which is stored as three real
 * sets (60, 80, 100) followed by three rows of nulls. He had tapped "Add a
 * set" three times and nothing appeared on screen.
 *
 * `addSet` pushes onto `sets[]` in the store. `rowCount` was computed purely
 * from the SCHEME — `working_sets.length`, or `fsl.sets + 1`, or the
 * exercise's `default.sets` — and never consulted what was stored. So the
 * button wrote a row the rail would not render: real in the data, invisible
 * in the app, and impossible to remove because the session flow had no
 * removal at all ("Remove a set" was cut in the original design).
 *
 * These are source-level guards. The arithmetic they protect lives inside a
 * React hook and a sheet, and the defect was never that the arithmetic was
 * hard — it was that nothing anywhere asserted the two halves agreed.
 */
const read = (rel: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", rel), "utf8");

/** Comments have satisfied guards in this repo before. Strip them first. */
const stripComments = (src: string) =>
  src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

describe("the prescription is a floor, not a ceiling", () => {
  const src = stripComments(read("components/session/DaySession.tsx"));

  it("rowCount takes the max of the scheme and what is stored", () => {
    expect(src).toContain("Math.max(schemeRowCount, storedSetCount)");
  });

  it("reads the stored set count from the day being viewed", () => {
    // activeDate, not today: editing a past session must count ITS sets.
    expect(src).toMatch(/store\.logs\[activeDate\][\s\S]{0,120}\.sets\?\.length/);
  });

  it("no longer passes the scheme count straight through", () => {
    expect(src).not.toContain("rowCount: schemeRowCount");
  });
});

describe("a set can be removed from the session flow", () => {
  const sheet = stripComments(read("components/session/OverflowSheet.tsx"));
  const setView = stripComments(read("components/session/SetView.tsx"));

  it("the sheet offers a remove action", () => {
    expect(sheet).toContain("onRemoveSet");
    expect(sheet).toMatch(/Remove set/);
  });

  it("it is hidden when only one row is left, so a set cannot vanish entirely", () => {
    expect(sheet).toMatch(/active\.rowCount > 1/);
  });

  it("the sheet is told which row it would remove", () => {
    expect(sheet).toContain("activeSetIndex: number");
  });

  it("SetView removes the row actually being viewed", () => {
    expect(setView).toMatch(
      /removeSet\(active\.blockId,\s*active\.exercise\.id,\s*activeSetIndex,\s*date\)/,
    );
  });

  it("add and remove are both wired — an app that can only add is asymmetric", () => {
    expect(setView).toContain("s.addSet");
    expect(setView).toContain("s.removeSet");
  });
});

describe("the store actions behave", () => {
  const src = stripComments(read("lib/useStore.ts"));

  it("removeSet drops exactly one index", () => {
    expect(src).toMatch(/sets = ex\.sets\.filter\(\(_, i\) => i !== setIndex\)/);
  });

  it("addSet appends a blank row rather than a prescribed one", () => {
    // A blank row is honest: the user has not done it yet, and prefilling a
    // weight is how a set nobody performed ends up in the record.
    expect(src).toMatch(/sets\.push\(\{ weight_kg: null, reps: null, rpe: null \}\)/);
  });
});
