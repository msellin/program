import { describe, it, expect } from "vitest";
import { tallyCompletions } from "../../functions/api/admin/completions";

/**
 * EVID-2. The ladder says VERIFIED depends partly on "≥5 users completed the
 * arc", and nothing could count that — `graduated_at` lives inside each user's
 * own jsonb blob. A promotion criterion nobody can measure is a guess wearing a
 * number.
 */
const user = (states: Record<string, unknown>) => ({
  user_profile: { program_states: states },
});

describe("tallyCompletions", () => {
  it("counts one completion per user per program", () => {
    const rows = tallyCompletions([
      user({ "first-strict-pullup": { graduated_at: "2026-09-01T10:00:00Z" } }),
      user({ "first-strict-pullup": { graduated_at: "2026-09-03T10:00:00Z" } }),
      user({ "muscle-up": { graduated_at: "2026-09-02T10:00:00Z" } }),
    ]);
    expect(rows.map((r) => [r.slug, r.completed])).toEqual([
      ["first-strict-pullup", 2],
      ["muscle-up", 1],
    ]);
  });

  it("ignores programs a user started but never finished", () => {
    // started_at / tier / intake_answers present, no graduated_at.
    const rows = tallyCompletions([
      user({ "muscle-up": { started_at: "2026-07-01", tier: "tier_a_prep" } }),
    ]);
    expect(rows).toEqual([]);
  });

  it("counts a user who finished two different programs once each", () => {
    const rows = tallyCompletions([
      user({
        "first-strict-pullup": { graduated_at: "2026-08-01T00:00:00Z" },
        "engine-builder": { graduated_at: "2026-08-20T00:00:00Z" },
      }),
    ]);
    expect(rows.every((r) => r.completed === 1)).toBe(true);
    expect(rows).toHaveLength(2);
  });

  it("tracks how many completions carry subjective feedback", () => {
    // "completed the arc WITH SUBJECTIVE SUCCESS" is the actual wording — a
    // bare completion count is not the criterion the ladder publishes.
    const rows = tallyCompletions([
      user({ "muscle-up": { graduated_at: "2026-09-01T00:00:00Z", graduation_feedback: { rating: 4 } } }),
      user({ "muscle-up": { graduated_at: "2026-09-02T00:00:00Z" } }),
    ]);
    expect(rows[0].completed).toBe(2);
    expect(rows[0].graduated_with_feedback).toBe(1);
  });

  it("reports the first and latest completion dates", () => {
    const rows = tallyCompletions([
      user({ "muscle-up": { graduated_at: "2026-09-05T00:00:00Z" } }),
      user({ "muscle-up": { graduated_at: "2026-07-11T00:00:00Z" } }),
    ]);
    expect(rows[0].first_completion).toBe("2026-07-11");
    expect(rows[0].latest_completion).toBe("2026-09-05");
  });

  it("orders by completions so the promotion question is answerable at a glance", () => {
    const rows = tallyCompletions([
      user({ a: { graduated_at: "2026-01-01T00:00:00Z" } }),
      user({ b: { graduated_at: "2026-01-01T00:00:00Z" } }),
      user({ b: { graduated_at: "2026-01-02T00:00:00Z" } }),
    ]);
    expect(rows[0].slug).toBe("b");
  });

  it("survives malformed and empty rows without throwing", () => {
    // Real jsonb from a partially-migrated or brand-new user.
    expect(
      tallyCompletions([null, undefined, {}, { user_profile: {} }, user({}), user({ x: {} }),
        user({ y: { graduated_at: "" } })]),
    ).toEqual([]);
  });
});
