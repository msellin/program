import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { evaluateCondition, inferTier } from "./intake-tier";
import type { Program } from "../schemas";

function loadProgram(slug: string): Program {
  const p = path.resolve(
    __dirname,
    "../../../public/data/programs",
    `${slug}.json`,
  );
  return JSON.parse(fs.readFileSync(p, "utf8")) as Program;
}

describe("evaluateCondition", () => {
  it("evaluates '&&' with mixed comparators (true case)", () => {
    expect(evaluateCondition("a >= 15 && b < 5", { a: 20, b: 3 })).toBe(true);
  });

  it("evaluates '&&' with mixed comparators (false case)", () => {
    expect(evaluateCondition("a >= 15 && b < 5", { a: 10, b: 3 })).toBe(false);
  });

  it("respects parentheses with || and &&", () => {
    const expr = "(a >= 15 || b >= 15) && c > 0";
    // Left disjunct true via a, c positive → true
    expect(evaluateCondition(expr, { a: 20, b: 0, c: 1 })).toBe(true);
    // Left disjunct true via b, c positive → true
    expect(evaluateCondition(expr, { a: 0, b: 15, c: 5 })).toBe(true);
    // Left disjunct true, but c not > 0 → false
    expect(evaluateCondition(expr, { a: 20, b: 20, c: 0 })).toBe(false);
    // Neither disjunct true → false
    expect(evaluateCondition(expr, { a: 0, b: 0, c: 10 })).toBe(false);
  });

  it("returns false for malformed input rather than throwing", () => {
    expect(() => evaluateCondition("foo bar baz", {})).not.toThrow();
    expect(evaluateCondition("foo bar baz", {})).toBe(false);
  });

  it("returns false for tokenizer-rejected characters", () => {
    // '$' is not a valid character in the tokenizer's grammar.
    expect(evaluateCondition("a $ 5", { a: 10 })).toBe(false);
  });
});

describe("inferTier", () => {
  const program = loadProgram("handstand-walk");

  it("returns Tier D when self-report answers indicate advanced", () => {
    const answers = {
      walk_distance_selfreport: "20m_plus",
      freestand_hold_seconds_selfreport: "over_30s",
      wall_hold_seconds_selfreport: "over_60s",
    };
    const out = inferTier(program, "handstand-walk", answers, {});
    expect(out).not.toBeNull();
    expect(out!.tier_id).toBe("tier_d_advanced");
  });

  it("returns Tier A (Foundation) when answers are all 'never'", () => {
    const answers = {
      walk_distance_selfreport: "never",
      freestand_hold_seconds_selfreport: "never",
      wall_hold_seconds_selfreport: "never",
    };
    const out = inferTier(program, "handstand-walk", answers, {});
    expect(out).not.toBeNull();
    expect(out!.tier_id).toBe("tier_a_foundation");
  });

  it("returns the first tier as default when no answers/tests are supplied", () => {
    // All vars default to 0. Only tier_a_foundation's condition
    // (wall_hold < 5 && freestand_hold < 1) evaluates to true with zero vars,
    // so tier_a_foundation is returned as the matched tier (and also happens
    // to be the first tier in the list). This asserts we don't throw and
    // that we get the safe/conservative default.
    const out = inferTier(program, "handstand-walk", {}, {});
    expect(out).not.toBeNull();
    expect(out!.tier_id).toBe(program.plan_tiers![0].id);
  });

  it("physical test values override self-report proxies", () => {
    // Self-report says 'never' across the board (would default to Tier A),
    // but the physical test result for walk_distance_max_metres = 20 satisfies
    // Tier D's condition (walk_distance_max_metres >= 10). Tier D should win.
    const answers = {
      walk_distance_selfreport: "never",
      freestand_hold_seconds_selfreport: "never",
      wall_hold_seconds_selfreport: "never",
    };
    const physicalTestResults = { walk_distance_max_metres: 20 };
    const out = inferTier(program, "handstand-walk", answers, physicalTestResults);
    expect(out).not.toBeNull();
    expect(out!.tier_id).toBe("tier_d_advanced");
    expect(out!.vars.walk_distance_max_metres).toBe(20);
  });
});
