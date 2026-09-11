import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { deriveLevelsFromProfile } from "./plan-generator";
import type { Program } from "../schemas";

/**
 * Per-capability independence — the stated premise of the skill programmes.
 *
 * handstand-walk declares it outright: "Static hold, dynamic walk, turns,
 * obstacles are separate state variables — trained independently, not
 * chained. A user who wall-holds 60s but can't take a step needs different
 * drills from one who walks 8m but can't turn."
 *
 * It did not exist. `deriveLevelsFromProfile` built its map from
 * `capability_profile`, which the intake writes keyed by PHYSICAL TEST ID
 * (`dead_hang_max_seconds`), while every reader looks up a CAPABILITY DOMAIN
 * (`pu_dead_hang_grip`). The namespaces never intersect — verified across all
 * three skill programmes — so every lookup missed and fell through the Proxy
 * to a single tier baseline. Every capability moved together, which is the
 * exact opposite of the premise.
 *
 * The correct data was already there and unread:
 * `plan_tiers[].program_adjustments.starting_capability_levels`, keyed by
 * domain. Two findings turned out to be one — `program_adjustments` was
 * reported dead, and this lives inside it.
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

describe("capability levels come from the tier's authored domains", () => {
  /**
   * These fixtures are chosen so the assertion CAN fail.
   *
   * The first version of this test used tier A, whose authored domains are
   * all level 1 — and the tier baseline is also 1, so the test passed
   * whether or not the wiring existed. Mutation-testing caught it: removing
   * the read left all three green. Third decoration test of the day.
   *
   * handstand-walk tier_c_freestand has baseline 3 and authors
   * turns: 2 / obstacles: 1. muscle-up tier_b_transition has baseline 2 and
   * authors transition_control: 1. Those disagreements are the whole point —
   * they are what "trained independently, not chained" means in data.
   */
  const CASES: Array<[string, string, string, number, number]> = [
    // slug, tierId, domain, authored, tier baseline it must NOT return
    ["handstand-walk", "tier_c_freestand", "handstand_turns", 2, 3],
    ["handstand-walk", "tier_c_freestand", "handstand_obstacles", 1, 3],
    ["handstand-walk", "tier_d_advanced", "handstand_obstacles", 2, 4],
    ["muscle-up", "tier_b_transition", "mu_transition_mechanics", 1, 2],
  ];

  /**
   * That last case read `mu_transition_control` until 2026-09-11, and passed
   * the whole time the feature was broken.
   *
   * It asked `deriveLevelsFromProfile` for the domain using the TIER's key.
   * The tier had one, so a level came back and the assertion held. But
   * `composeSlotDrills` looks up the BLOCK's `capability_slot`, which
   * 8fde4c2 had renamed to `mu_transition_mechanics` — so the real consumer
   * asked for a domain the tier did not declare, fell through the Proxy to
   * the flat tier baseline, and four of five capabilities moved together
   * again. The test and the app were reading different keys.
   *
   * Using the slot name is what makes this test track the thing that
   * actually runs. `data-integrity.test.ts` now fails if the two namespaces
   * drift apart again.
   */

  for (const [slug, tierId, domain, authored, baseline] of CASES) {
    it(`${slug}/${tierId}: ${domain} is ${authored}, not the tier baseline ${baseline}`, () => {
      const program = load(slug);
      const levels = deriveLevelsFromProfile(undefined, program, tierId);
      expect(levels[domain]).toBe(authored);
      expect(levels[domain], "fell through to the tier baseline").not.toBe(baseline);
    });
  }

  it("a domain the tier does not declare still falls back", () => {
    // The Proxy default has to survive: an unknown domain must not be
    // undefined, or every prerequisite lookup on a new drill throws.
    const program = load("muscle-up");
    const levels = deriveLevelsFromProfile(undefined, program, "tier_b_transition");
    expect(levels["a_domain_no_tier_declares"]).toBeGreaterThanOrEqual(1);
  });

  it("capabilities within one tier are not all the same level", () => {
    // The premise in one assertion, independent of any particular number.
    const program = load("handstand-walk");
    const levels = deriveLevelsFromProfile(undefined, program, "tier_c_freestand");
    const vals = ["handstand_hold_static", "handstand_walk_dynamic", "handstand_turns", "handstand_obstacles"]
      .map((d) => levels[d]);
    expect(new Set(vals).size, `all capabilities identical: ${vals.join(", ")}`).toBeGreaterThan(1);
  });
});
