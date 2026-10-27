import { describe, expect, it } from "vitest";
import { humanPhaseName } from "./day-format";

describe("humanPhaseName drops tier words (P-09)", () => {
  it("strips a (Tier A) suffix and 'for all tiers'", () => {
    expect(humanPhaseName("Hang, scap, row base (Tier A)")).toBe("Hang, scap, row base");
    expect(humanPhaseName("Interleaved consolidation for all tiers")).toBe("Interleaved consolidation");
  });
});
