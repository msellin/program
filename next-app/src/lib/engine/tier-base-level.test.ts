import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { composeBlockForUser } from "./plan-generator";
import type { Program, Store } from "../schemas";

/**
 * A programme's tier must change what the user is given.
 *
 * Found 2026-09-06 by the `programme-integrity` agent.
 *
 * `tierIdToBaseLevel` mapped `tier_a` … `tier_e` to levels 1-5 and returned
 * **1 for anything else**. Five of the nine shipped programmes name their
 * tiers `foundation` / `progression` / `push`, so every one of their users
 * was level 1 no matter which tier they were placed in.
 *
 * For overhead-mobility that was not a subtle skew. It is the only programme
 * with no authored items, so it is the only one that actually reaches the
 * composer — and `|drill.level - userLevel| <= 1` at level 1 excludes every
 * level-3 drill. `block_loaded_overhead` and `block_overhead_endurance`
 * rendered ZERO exercises for every user, always.
 *
 * The function's own docstring had promised the fix the whole time:
 * "Programs that use different tier naming get their base level from the
 * position in `plan_tiers`." The code did not do it.
 *
 * This asserts the OBSERVABLE consequence rather than the helper, because
 * the helper is private and the consequence is what shipped.
 */
const read = (f: string) =>
  JSON.parse(fs.readFileSync(path.resolve(__dirname, "../../../public/data", f), "utf8"));

const program = (() => {
  const p = read("programs/overhead-mobility.json") as Program;
  p.slug = "overhead-mobility";
  return p;
})();
const drillsById = Object.fromEntries(
  (read("exercises.json") as { exercises: Array<{ id: string }> }).exercises.map((e) => [e.id, e]),
) as never;

const profileAt = (tier: string) =>
  ({
    active_program_id: "overhead-mobility",
    program_states: { "overhead-mobility": { tier } },
  }) as unknown as Store["user_profile"];

const itemCount = (tier: string, blockId: string): number => {
  const block = program.blocks.find((b) => b.id === blockId)!;
  const composed = composeBlockForUser(program, block, profileAt(tier), "2026-09-06", drillsById);
  return [
    ...(composed.items ?? []),
    ...(composed.segments ?? []).flatMap((s) => s.items ?? []),
  ].length;
};

describe("tier placement changes what a user is prescribed", () => {
  for (const blockId of ["block_loaded_overhead", "block_overhead_endurance"]) {
    it(`${blockId} is not empty for the top tier`, () => {
      // The whole defect in one assertion: before the fix this was 0.
      expect(itemCount("push", blockId)).toBeGreaterThan(0);
    });
  }

  it("the tiers are not all the same level", () => {
    // If a future change collapses them again, every tier composes
    // identically and this fails — which is the shape of the original bug,
    // independent of any particular drill's level.
    const counts = ["foundation", "progression", "push"].map((t) =>
      itemCount(t, "block_loaded_overhead"),
    );
    expect(new Set(counts).size, `all tiers composed identically: ${counts.join(", ")}`)
      .toBeGreaterThan(1);
  });
});
