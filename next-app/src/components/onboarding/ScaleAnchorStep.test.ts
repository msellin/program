import { describe, it, expect } from "vitest";
import { SCALE_BANDS } from "./ScaleAnchorStep";
import { deriveState } from "@/lib/symptom-state";
import type { Symptoms } from "@/lib/schemas";

/**
 * The onboarding step that teaches the 0-10 scale must band exactly where the
 * safety gate does (G-12). If the gate ever moves, this fails and the copy
 * follows it; the copy never moves the gate.
 */
describe("the scale anchors band where the gate does", () => {
  const at = (v: number) => deriveState({ elbow_right: v } as Symptoms);
  const expected = { low: "green", mid: "amber", high: "red" } as const;

  for (const key of ["low", "mid", "high"] as const) {
    it(`${key} band ${SCALE_BANDS[key].join("-")} is ${expected[key]} at both ends`, () => {
      const [a, b] = SCALE_BANDS[key];
      expect(at(a)).toBe(expected[key]);
      expect(at(b)).toBe(expected[key]);
    });
  }

  it("the bands cover 0-10 with no gap", () => {
    expect(SCALE_BANDS.low[0]).toBe(0);
    expect(SCALE_BANDS.mid[0]).toBe(SCALE_BANDS.low[1] + 1);
    expect(SCALE_BANDS.high[0]).toBe(SCALE_BANDS.mid[1] + 1);
    expect(SCALE_BANDS.high[1]).toBe(10);
  });
});
