import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { evaluateCondition } from "./intake-tier";

/**
 * A tier nobody could reach, because of a missing character.
 *
 * Found 2026-09-06 by the `programme-integrity` agent.
 *
 * The condition tokenizer had a branch for digits and none for `-`. A leading
 * minus matched nothing, `tokenize` returned null, and `evaluateCondition`
 * returned false for the WHOLE expression — not merely the comparison holding
 * the negative number.
 *
 * engine-builder-block-2's Push tier reads
 *   block_1_completed == 'yes_recent' && (current_cardio_hours_per_week >= 6
 *    || block_1_submax_hr_delta <= -8)
 *
 * so Push was unreachable through the HR route, and those users fell through
 * to Foundation — two tiers down. The direction matters: a NEGATIVE submax-HR
 * delta is the good outcome, and the intake help text says so in as many
 * words ("Negative number = drop = good"). The bug specifically demoted the
 * users who had responded best to Block 1.
 */
describe("conditions can contain negative numbers", () => {
  it("evaluates a bare negative comparison", () => {
    expect(evaluateCondition("x <= -8", { x: -10 })).toBe(true);
    expect(evaluateCondition("x <= -8", { x: -2 })).toBe(false);
  });

  it("does not swallow a comparison that follows one", () => {
    // The failure mode was total, not local: one negative poisoned the whole
    // expression. This proves the rest of the expression still evaluates.
    expect(evaluateCondition("x <= -8 && y >= 2", { x: -9, y: 3 })).toBe(true);
    expect(evaluateCondition("x <= -8 && y >= 2", { x: -9, y: 1 })).toBe(false);
  });

  it("reaches the real Push tier on the HR route", () => {
    const p = JSON.parse(
      fs.readFileSync(
        path.resolve(__dirname, "../../../public/data/programs/engine-builder-block-2.json"),
        "utf8",
      ),
    ) as { plan_tiers: Array<{ id: string; condition: string }> };
    const push = p.plan_tiers.find((t) => t.id === "push")!;
    // Qualifies on the HR delta alone, below the cardio-hours threshold.
    expect(
      evaluateCondition(push.condition, {
        block_1_completed: "yes_recent",
        current_cardio_hours_per_week: 4,
        block_1_submax_hr_delta: -9,
      }),
      "a user whose submax HR dropped 9 bpm should reach Push",
    ).toBe(true);
  });

  it("still refuses a trailing minus rather than guessing", () => {
    // `a - b` is not arithmetic this DSL supports. Treating a trailing `-`
    // as a sign would silently change meaning instead of failing.
    expect(evaluateCondition("x - 8", { x: 10 })).toBe(false);
  });
});
