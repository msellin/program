import { describe, expect, it, vi } from "vitest";
import type { Program, Store } from "@/lib/schemas";

/**
 * G-06 (2026-10-27): "Advance to Tier D" rendered under a red banner.
 * The tier selector is forced eligible here so the only thing under test is
 * the state gate in `selectProposals`.
 */
vi.mock("@/lib/engine/tier-promotion", () => ({
  nextEligibleTier: () => ({ tier_id: "tier_d", vars_hash: "h", rationale: [] }),
  isProposalDismissed: () => false,
}));

const { selectProposals } = await import("./select");

const DATE = "2026-10-27";
const program = {
  slug: "test-program",
  blocks: [],
  phases: [{ id: "phase_1", name: "Phase 1", starts: "2026-01-01", ends: "2026-12-31", blocks: [] }],
  plan_tiers: [{ id: "tier_d", label: "Tier D" }],
  weekly_template: {},
  training_maxes: {},
} as unknown as Program;

const storeOn = (state: "green" | "amber" | "red" | null) =>
  ({
    version: 2,
    training_maxes: {},
    logs: state ? { [DATE]: { exercises: {}, symptoms: null, derived_state: state, notes: "" } } : {},
    retest_readings: [{ metric_id: "m", value: 1, observed_at: DATE }],
    user_profile: { program_states: { "test-program": { tier: "tier_c" } } },
  }) as unknown as Store;

const kinds = (state: "green" | "amber" | "red" | null) =>
  selectProposals(storeOn(state), program, DATE).map((p) => p.kind);

describe("no push proposals on a red or amber day (G-06)", () => {
  it("offers the tier advance on green or with no check", () => {
    expect(kinds("green")).toContain("tier_advance");
    expect(kinds(null)).toContain("tier_advance");
  });

  it("withholds it on red and amber", () => {
    expect(kinds("red")).not.toContain("tier_advance");
    expect(kinds("amber")).not.toContain("tier_advance");
  });
});

describe("tier advance needs a retest on record (P-09)", () => {
  it("is not offered to a user with no retest, however the intake inferred", () => {
    const store = { ...storeOn("green"), retest_readings: [] } as unknown as Store;
    expect(selectProposals(store, program, DATE).map((p) => p.kind)).not.toContain("tier_advance");
  });
});
