import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { deriveLevelsFromProfile } from "./plan-generator";
import type { Program } from "../schemas";

/**
 * The obvious fix to `capability_profile` would undo T12. Do not apply it.
 *
 * The reported defect is real and narrow: the intake WRITES
 * `capability_profile` keyed by PHYSICAL TEST ID (`dead_hang_max_seconds`),
 * while `deriveLevelsFromProfile` READS it expecting a capability DOMAIN
 * (`pu_dead_hang_grip`). The namespaces never intersect, so a measured
 * capability contributes nothing.
 *
 * The obvious fix is a test-id-to-domain mapping. It would make things worse,
 * and the reason is in the writer rather than the key:
 *
 *     newCaps[testId] = { estimated_level: tierBaseline, ... }
 *
 * Every test gets the SAME level — the tier's baseline. So the map does not
 * carry per-capability information at all; it carries one number repeated.
 *
 * And it is read AFTER the tier's authored levels, overriding them. On
 * 2026-09-11 muscle-up's tier keys were repaired so that
 * `starting_capability_levels` finally reached the composer: tier_b_transition
 * authors `mu_transition_mechanics: 1` against a baseline of 2, which is what
 * "trained independently, not chained" means in data. Mapping the keys without
 * fixing the value would flatten every one of those back to the baseline —
 * reintroducing the exact defect, through the code path added to fix it, while
 * looking like progress.
 *
 * The real work is deriving a level from `measured_value` against the
 * programme's own tier conditions. That is the same authoring gap as
 * `SELF_REPORT_TO_TEST_VAR`, and it is a programming decision about who lands
 * in which tier.
 *
 * This test fails if either half changes, so the second half cannot be
 * forgotten once the first is done.
 */
const load = (slug: string): Program => {
  const p = JSON.parse(
    fs.readFileSync(
      path.resolve(__dirname, `../../../public/data/programs/${slug}.json`),
      "utf8",
    ),
  ) as Program;
  p.slug = slug;
  return p;
};

const INTAKE = path.resolve(
  __dirname,
  "../../app/programs/[slug]/intake/IntakeClient.tsx",
);

describe("capability_profile: the naive fix is a regression", () => {
  it("the intake still writes one flat level for every test", () => {
    // If this stops being true, the writer has learned to derive a level per
    // measurement — and the key mapping becomes safe to add.
    const src = fs.readFileSync(INTAKE, "utf8");
    expect(
      src,
      "IntakeClient no longer assigns tierBaseline to every test — re-read this file before mapping keys",
    ).toContain("estimated_level: tierBaseline");
  });

  it("the tier's authored per-domain levels are what a flat override would destroy", () => {
    // The concrete thing at stake, stated as data rather than prose.
    const program = load("muscle-up");
    const levels = deriveLevelsFromProfile(undefined, program, "tier_b_transition");

    // Authored below the tier baseline of 2 — the disagreement IS the feature.
    expect(levels["mu_transition_mechanics"]).toBe(1);
    expect(levels["mu_ring_dip_strength"]).toBe(2);
    expect(
      levels["mu_transition_mechanics"] === levels["mu_ring_dip_strength"],
      "muscle-up's tier no longer distinguishes its domains — T12 has regressed",
    ).toBe(false);
  });

  it("a flat capability_profile would override them, which is the trap", () => {
    const program = load("muscle-up");

    // Exactly what a test-id-to-domain mapping would produce today: every
    // domain carrying the tier baseline, because that is all the writer has.
    const flat = {
      capability_profile: {
        mu_transition_mechanics: { estimated_level: 2 as const, confidence: "physical_test" as const },
        mu_ring_dip_strength: { estimated_level: 2 as const, confidence: "physical_test" as const },
      },
    } as never;

    const levels = deriveLevelsFromProfile(flat, program, "tier_b_transition");

    // Demonstrated, not asserted as an opinion: the authored 1 is gone.
    expect(levels["mu_transition_mechanics"]).toBe(2);
    expect(
      levels["mu_transition_mechanics"] === levels["mu_ring_dip_strength"],
      "this is the regression — every capability moving together again",
    ).toBe(true);
  });
});
