import { describe, it, expect } from "vitest";
import { activeExclusions, applyIntakeExclusions, exclusionNotices } from "./intake-exclusions";
import type { Program, Block, Store } from "../schemas";

const RULE = {
  id: "elbow_current",
  question_id: "elbow_tendon_pain",
  when_value_in: ["current"],
  exclude_exercise_ids: ["mu_ring_dip_full", "mu_ring_dip_deep"],
  substitute_with: "mu_band_assisted_ring_dip",
  reason: "Ring dip work is band-assisted only while your elbow is symptomatic.",
};

const program = { slug: "muscle-up", intake_exclusions: [RULE] } as unknown as Program;
const profileWith = (answers: Record<string, string>) =>
  ({ program_states: { "muscle-up": { intake_answers: answers } } }) as unknown as Store["user_profile"];
const block = (ids: string[]): Block =>
  ({ id: "b", items: ids.map((exercise_id) => ({ exercise_id })) }) as unknown as Block;
const idsOf = (b: Block) => (b.items ?? []).map((i) => i.exercise_id);

describe("activeExclusions", () => {
  it("fires on the answer the user actually gave", () => {
    expect(activeExclusions(program, profileWith({ elbow_tendon_pain: "current" }))).toHaveLength(1);
  });

  it("stays silent for other answers to the same question", () => {
    for (const v of ["no", "resolved"]) {
      expect(activeExclusions(program, profileWith({ elbow_tendon_pain: v })), v).toEqual([]);
    }
  });

  it("stays silent when intake was never completed", () => {
    expect(activeExclusions(program, undefined)).toEqual([]);
    expect(activeExclusions(program, profileWith({}))).toEqual([]);
  });
});

describe("applyIntakeExclusions", () => {
  const rules = [RULE];

  it("replaces the deferred movements with the substitute, once", () => {
    // Both ring dips are excluded; the user should get one band-assisted dip,
    // not two — and not a session that quietly lost two movements.
    const out = applyIntakeExclusions(block(["mu_false_grip_hang", "mu_ring_dip_full", "mu_ring_dip_deep"]), rules);
    expect(idsOf(out)).toEqual(["mu_false_grip_hang", "mu_band_assisted_ring_dip"]);
  });

  it("keeps the substitute in the position of what it replaced", () => {
    const out = applyIntakeExclusions(block(["mu_ring_dip_full", "mu_false_grip_hang"]), rules);
    expect(idsOf(out)).toEqual(["mu_band_assisted_ring_dip", "mu_false_grip_hang"]);
  });

  it("does not duplicate a movement the block already programmes", () => {
    const out = applyIntakeExclusions(
      block(["mu_band_assisted_ring_dip", "mu_ring_dip_full"]), rules,
    );
    expect(idsOf(out)).toEqual(["mu_band_assisted_ring_dip"]);
  });

  it("drops without substituting when the rule names no replacement", () => {
    const bare = [{ ...RULE, substitute_with: undefined }];
    expect(idsOf(applyIntakeExclusions(block(["mu_ring_dip_full", "x"]), bare))).toEqual(["x"]);
  });

  it("returns the block untouched when nothing matches", () => {
    const b = block(["mu_false_grip_hang"]);
    expect(applyIntakeExclusions(b, rules)).toBe(b);
    expect(applyIntakeExclusions(b, [])).toBe(b);
  });

  it("leaves non-exercise rows alone", () => {
    const b = { id: "b", items: [{}, { exercise_id: "mu_ring_dip_full" }] } as unknown as Block;
    expect(applyIntakeExclusions(b, rules).items).toHaveLength(2);
  });
});

describe("exclusionNotices", () => {
  it("deduplicates so one reason is not shown twice", () => {
    expect(exclusionNotices([RULE, { ...RULE, id: "other" }])).toEqual([RULE.reason]);
  });
});
