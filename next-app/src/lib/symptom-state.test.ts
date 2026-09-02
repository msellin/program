import { describe, it, expect } from "vitest";
import { deriveState, reasonForState, peakRegionScore } from "./symptom-state";
import { regionsForProgram, REGION_BY_ID, LEGACY_REGIONS } from "./symptom-regions";
import type { Symptoms } from "./schemas";

const s = (o: Partial<Symptoms>): Symptoms => o as Symptoms;

describe("the safety gate sees every scored region, not four hip fields", () => {
  it("an elbow at 7/10 reds a pull-up user", () => {
    // The defect this whole change exists for: first-strict-pullup authors
    // elbow_symptom_score because medial epicondylitis is the classic pull-up
    // injury, there was no elbow field, and the engine saw green.
    expect(deriveState(s({ elbow_right: 7 }))).toBe("red");
    expect(reasonForState(s({ elbow_right: 7 }), "red")).toBe("Elbow R is above 5/10.");
  });

  it("a wrist at 4/10 ambers a muscle-up user", () => {
    // False grip is notorious for wrist strain; muscle-up authors
    // wrist_symptom_score and had no field for it.
    expect(deriveState(s({ wrist_left: 4 }))).toBe("amber");
  });

  it("a left shoulder is visible — only shoulder_right used to exist", () => {
    expect(deriveState(s({ shoulder_left: 6 }))).toBe("red");
  });

  it("still behaves exactly as before for the hip program's four regions", () => {
    expect(deriveState(s({ groin_left: 2, low_back: 1 }))).toBe("green");
    expect(deriveState(s({ groin_left: 4 }))).toBe("amber");
    expect(deriveState(s({ buttock_left: 6 }))).toBe("red");
    expect(deriveState(s({ shoulder_right: 3, life_load: 8 }))).toBe("red");
  });

  it("keeps the non-region thresholds unchanged", () => {
    expect(deriveState(s({ morning_stiffness_min: 45 }))).toBe("amber");
    expect(deriveState(s({ life_load: 5 }))).toBe("amber");
    expect(deriveState(s({ night_pain: true }))).toBe("red");
    expect(deriveState(s({ click_present: true, click_painful: true }))).toBe("red");
    expect(deriveState(s({}))).toBe("green");
  });

  it("reports the worst region, not the first one it finds", () => {
    const { value, regionId } = peakRegionScore(s({ shoulder_left: 2, elbow_right: 6, neck: 4 }));
    expect(value).toBe(6);
    expect(regionId).toBe("elbow_right");
  });
});

describe("programs select their regions from the shared library", () => {
  it("falls back to the historical four when a program declares none", () => {
    expect(regionsForProgram(null).map((r) => r.id)).toEqual([...LEGACY_REGIONS]);
    expect(regionsForProgram({}).map((r) => r.id)).toEqual([...LEGACY_REGIONS]);
  });

  it("returns exactly what a program declares, in order", () => {
    const ids = ["shoulder_left", "shoulder_right", "elbow_left", "elbow_right"];
    expect(regionsForProgram({ symptom_regions: ids }).map((r) => r.id)).toEqual(ids);
  });

  it("drops ids that are not in the library rather than rendering a blank row", () => {
    // data-integrity.test.ts fails the build on an unknown id; this is the
    // runtime belt to that braces.
    expect(regionsForProgram({ symptom_regions: ["elbow_left", "nonsense"] }).map((r) => r.id))
      .toEqual(["elbow_left"]);
  });

  it("every legacy id still resolves, so old history keeps its labels", () => {
    for (const id of LEGACY_REGIONS) expect(REGION_BY_ID[id], id).toBeDefined();
  });
});
