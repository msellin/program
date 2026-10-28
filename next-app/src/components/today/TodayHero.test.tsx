import { describe, it, expect } from "vitest";
import { leadFigureId } from "./TodayHero";
import type { Block } from "@/lib/schemas";

const b = (x: Partial<Block>) => x as Block;

describe("TodayHero helpers", () => {
  it("lead figure is null when no exercise has one", () => {
    expect(leadFigureId([b({ items: [{ exercise_id: "nope_x" } as never] })])).toBeNull();
  });
  it("lead figure resolves the first exercise with a figure", () => {
    expect(leadFigureId([b({ items: [{ exercise_id: "back_squat_highbar" } as never] })])).toBe("squat");
  });
});
