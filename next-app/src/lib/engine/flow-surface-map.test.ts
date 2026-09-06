import { describe, it, expect } from "vitest";
import { FLOW_SURFACES, INTERACTIVE_SURFACES } from "../../../tests/e2e/harness/coverage";
import { FLOWS } from "../../../tests/e2e/harness/flows";

/**
 * Every harness flow declares which surfaces it reaches.
 *
 * `buildCoverage` credits a surface as reached by looking the completed
 * flow's id up in `FLOW_SURFACES`. A flow missing from that map contributes
 * nothing — it runs, it passes, and the surface it exercised still reports as
 * unreached. Three flows were in that state (`hip-check`, `session-hold`,
 * `cold-load-resume`), and there was no way to tell them apart from a flow
 * that genuinely reaches no tracked surface, because both look like an absent
 * key.
 *
 * That is the same failure mode as everything else this week: a measurement
 * that fails quiet. The coverage number does not go red when it stops
 * counting something — it just gets smaller, and someone spends a sweep
 * chasing a gap that is in the instrument.
 */
describe("flow → surface map", () => {
  const flowIds = FLOWS.map((f) => f.id);

  it("has an entry for every flow, even if that entry is empty", () => {
    const missing = flowIds.filter((id) => !(id in FLOW_SURFACES));
    expect(
      missing,
      "add these to FLOW_SURFACES — `[]` if the flow reaches no tracked surface, " +
        "which is a claim worth making explicitly rather than by omission",
    ).toEqual([]);
  });

  it("has no entry for a flow that no longer exists", () => {
    const orphans = Object.keys(FLOW_SURFACES).filter((id) => !flowIds.includes(id));
    expect(orphans).toEqual([]);
  });

  it("only names surfaces the coverage denominator tracks", () => {
    // A typo'd surface name credits nothing and reports nothing.
    const unknown = Object.entries(FLOW_SURFACES).flatMap(([id, surfaces]) =>
      surfaces
        .filter((s) => !(INTERACTIVE_SURFACES as readonly string[]).includes(s))
        .map((s) => `${id} → ${s}`),
    );
    expect(unknown).toEqual([]);
  });

  it("every tracked surface is reachable by at least one flow", () => {
    // A surface no flow can reach is permanently 0% and drags the average
    // down for a reason that is not the app's.
    const reachable = new Set(Object.values(FLOW_SURFACES).flat());
    const unreachable = INTERACTIVE_SURFACES.filter((s) => !reachable.has(s));
    expect(unreachable).toEqual([]);
  });
});
