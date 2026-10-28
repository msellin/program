import { describe, it, expect } from "vitest";
import { sessionMinutes, formatMinutes } from "./session-duration";

describe("sessionMinutes", () => {
  it("sums ranges end to end", () => {
    expect(sessionMinutes([{ duration_min: [8, 12] }, { duration_min: 5 }, { duration_min: [5, 8] }])).toEqual({
      min: 18,
      max: 25,
    });
  });
  it("falls back to segments and skips optional blocks", () => {
    const r = sessionMinutes([
      { segments: [{ duration_min: 5 }, { duration_min: 5 }] },
      { duration_min: 20, optional: true },
    ]);
    expect(r).toEqual({ min: 10, max: 10 });
  });
  it("is null when nothing is authored", () => {
    expect(sessionMinutes([])).toBeNull();
    expect(sessionMinutes([{}])).toBeNull();
  });
});

describe("formatMinutes", () => {
  it("collapses to about when rounded ends meet", () => {
    expect(formatMinutes({ min: 28, max: 32 })).toBe("about 30 min");
    expect(formatMinutes({ min: 45, max: 45 })).toBe("about 45 min");
  });
  it("rounds a range to the nearest 5", () => {
    expect(formatMinutes({ min: 18, max: 32 })).toBe("20–30 min");
    expect(formatMinutes({ min: 25, max: 35 })).toBe("25–35 min");
  });
  it("handles null and tiny sessions", () => {
    expect(formatMinutes(null)).toBeNull();
    expect(formatMinutes({ min: 3, max: 3 })).toBe("about 3 min");
  });
});
