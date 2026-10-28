import { describe, it, expect } from "vitest";
import { estimatedMinutes, leadFigureId } from "./TodayHero";
import type { Block } from "@/lib/schemas";

const b = (x: Partial<Block>) => x as Block;

describe("TodayHero helpers", () => {
  it("sums authored minutes, ranges by upper end", () => {
    expect(estimatedMinutes([b({ duration_min: 10 }), b({ duration_min: [15, 20] })])).toBe(30);
  });
  it("returns null with nothing authored", () => {
    expect(estimatedMinutes([b({ items: [] })])).toBeNull();
  });
  it("lead figure is null when no exercise has one", () => {
    expect(leadFigureId([b({ items: [{ exercise_id: "nope_x" } as never] })])).toBeNull();
  });
  it("lead figure resolves the first exercise with a figure", () => {
    expect(leadFigureId([b({ items: [{ exercise_id: "back_squat_highbar" } as never] })])).toBe("squat");
  });
});
