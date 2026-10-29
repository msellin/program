import { describe, it, expect } from "vitest";
import { loggingKind, isLoadable } from "./logging-kind";

describe("loggingKind", () => {
  it("defaults by category", () => {
    expect(loggingKind({ category: "strength" })).toBe("load_reps");
    expect(loggingKind({ category: "unilateral" })).toBe("load_reps");
    expect(loggingKind({ category: "mobility" })).toBe("bodyweight_reps");
  });
  it("explicit logging wins", () => {
    expect(loggingKind({ category: "strength", logging: "distance_load" })).toBe("distance_load");
  });
  it("isLoadable covers load kinds only", () => {
    expect(isLoadable({ category: "strength" })).toBe(true);
    expect(isLoadable({ category: "strength", logging: "load_optional" })).toBe(true);
    expect(isLoadable({ category: "strength", logging: "distance_load" })).toBe(true);
    expect(isLoadable({ category: "strength", logging: "bodyweight_reps" })).toBe(false);
    expect(isLoadable({ category: "strength", logging: "time_hold" })).toBe(false);
  });
});
