import { describe, expect, it } from "vitest";
import { dayCellState } from "./WeeklyHeatmap";

describe("dayCellState", () => {
  it("uses the morning check when there is one", () => {
    expect(dayCellState({ derived_state: "amber", exercises: { a: { done: true } } })).toBe("amber");
  });
  it("counts a trained day without a check as done", () => {
    expect(dayCellState({ exercises: { a: { done: true } } })).toBe("green");
    expect(dayCellState({ runs: [{}] })).toBe("green");
  });
  it("leaves untouched days empty", () => {
    expect(dayCellState(undefined)).toBe("none");
    expect(dayCellState({ exercises: { a: { done: false } } })).toBe("none");
  });
});
