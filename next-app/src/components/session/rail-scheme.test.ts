import { describe, it, expect } from "vitest";
import { railScheme } from "./BriefView";
import type { RailExercise } from "./DaySession";

// railScheme only reads `rowCount` and `suggestion`; the rest of RailExercise
// is irrelevant to the label, so the fixtures stay minimal on purpose.
const rail = (rowCount: number, suggestion: RailExercise["suggestion"]) =>
  ({ rowCount, suggestion }) as RailExercise;

describe("railScheme", () => {
  it("splits a 5/3/1 day into top set and FSL instead of claiming one weight for all sets", () => {
    // BUG-29: this row used to read "6 sets · 93.5 kg".
    const label = railScheme(
      rail(6, {
        top_set: { kg: 93.5, reps: "5+" },
        fsl: { kg: 71.5, sets: 5, reps: 5 },
        reasoning: "",
      }),
    );
    expect(label).toBe("1 × 93.5 kg · 5 × 71.5 kg");
    expect(label).not.toContain("6 sets");
  });

  it("keeps the sets total honest — the split still adds up to rowCount", () => {
    const suggestion = {
      top_set: { kg: 100, reps: "3+" },
      fsl: { kg: 70, sets: 4, reps: 5 },
      reasoning: "",
    };
    // useMemoRail derives rowCount as fsl.sets + 1; the label must agree.
    expect(1 + suggestion.fsl.sets).toBe(5);
    expect(railScheme(rail(5, suggestion))).toBe("1 × 100 kg · 4 × 70 kg");
  });

  it("shows one weight for a straight-sets day, where every set IS at that weight", () => {
    expect(
      railScheme(rail(5, { top_set: { kg: 60, reps: "5" }, fsl: null, reasoning: "" })),
    ).toBe("5 sets · 60 kg");
  });

  it("falls back to a bare set count when there is no suggestion", () => {
    expect(railScheme(rail(3, null))).toBe("3 sets");
  });
});
