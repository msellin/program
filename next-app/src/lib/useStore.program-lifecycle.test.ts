import { describe, it, expect, beforeEach } from "vitest";
import { useStore } from "./useStore";

/**
 * Program lifecycle — the single-main-track cap and the exits from it.
 *
 * Written 2026-08-27, before opening the app to beta testers. Nothing
 * asserted the cap: the only spec that touched it
 * (tests/e2e/handstand-walk-flow.spec.ts) asserted the "Add alongside"
 * button was visible, which stopped being true when that button moved
 * behind the super-admin allowlist — and that spec is not in any npm
 * script, so it never ran and never failed.
 *
 * What matters for a tester: they can never end up with two tracks
 * running, switching is reversible, and leaving a program is possible
 * at all.
 */

const profile = () => useStore.getState().store.user_profile;

describe("single-main-track cap (MULTI_MAIN_ENABLED=false)", () => {
  beforeEach(() => {
    useStore.getState().wipe();
  });

  it("addSecondaryProgram REPLACES an existing primary rather than stacking", () => {
    useStore.getState().setActiveProgram("engine-builder");
    useStore.getState().addSecondaryProgram("handstand-walk");

    expect(profile()?.active_program_id).toBe("handstand-walk");
    expect(profile()?.active_program_ids).toEqual(["handstand-walk"]);
  });

  it("adopts the slug as primary when nothing is active yet", () => {
    useStore.getState().addSecondaryProgram("rowing-2k-test-prep");

    expect(profile()?.active_program_id).toBe("rowing-2k-test-prep");
    expect(profile()?.active_program_ids).toEqual(["rowing-2k-test-prep"]);
  });

  it("is idempotent when the slug is already the primary", () => {
    useStore.getState().setActiveProgram("engine-builder");
    useStore.getState().addSecondaryProgram("engine-builder");

    expect(profile()?.active_program_ids).toEqual(["engine-builder"]);
  });

  it("never leaves two tracks active across a chain of switches", () => {
    for (const slug of [
      "engine-builder",
      "handstand-walk",
      "overhead-mobility",
      "concurrent-strength-maintenance",
    ]) {
      useStore.getState().addSecondaryProgram(slug);
      expect(profile()?.active_program_ids).toHaveLength(1);
    }
    expect(profile()?.active_program_id).toBe("concurrent-strength-maintenance");
  });

  it("addSecondaryProgramForce still stacks — the admin escape hatch is intact", () => {
    // Reachable only from the super-admin-gated "+ Add alongside" button.
    // Asserted so that flipping the cap later is a deliberate change and
    // not a silent one.
    useStore.getState().setActiveProgram("engine-builder");
    useStore.getState().addSecondaryProgramForce("handstand-walk");

    expect(profile()?.active_program_ids).toEqual(
      expect.arrayContaining(["engine-builder", "handstand-walk"]),
    );
    expect(profile()?.active_program_ids).toHaveLength(2);
    expect(profile()?.active_program_id).toBe("engine-builder");
  });
});

describe("switching focus is reversible", () => {
  beforeEach(() => {
    useStore.getState().wipe();
  });

  it("keeps the replaced program's state so its arc resumes on re-pick", () => {
    useStore.getState().setActiveProgram("engine-builder");
    const originalStart = profile()?.program_states?.["engine-builder"]?.started_at;
    expect(originalStart).toBeTruthy();

    useStore.getState().addSecondaryProgram("handstand-walk");

    // Dropped from the active list, but its arc clock survives.
    expect(profile()?.active_program_ids).not.toContain("engine-builder");
    expect(profile()?.program_states?.["engine-builder"]?.started_at).toBe(
      originalStart,
    );

    // Coming back does not restart the arc — schedule.ts:82 reads the
    // per-program started_at, so the user lands back in the phase they left.
    useStore.getState().addSecondaryProgram("engine-builder");
    expect(profile()?.active_program_id).toBe("engine-builder");
    expect(profile()?.program_states?.["engine-builder"]?.started_at).toBe(
      originalStart,
    );
  });

  it("preserves a stored tier across the round trip", () => {
    useStore.getState().setActiveProgram("handstand-walk");
    useStore.getState().setProgramTier("handstand-walk", "tier_b_progression");

    useStore.getState().addSecondaryProgram("engine-builder");
    useStore.getState().addSecondaryProgram("handstand-walk");

    expect(profile()?.program_states?.["handstand-walk"]?.tier).toBe(
      "tier_b_progression",
    );
  });
});

describe("leaving a program", () => {
  beforeEach(() => {
    useStore.getState().wipe();
  });

  it("removing the sole primary clears the active state entirely", () => {
    // Profile's "End this program" path. Before 2026-08-27 this was
    // unreachable — the affordance required a non-primary row, which the
    // cap makes impossible — so a user mid-arc had no way to quit.
    useStore.getState().setActiveProgram("engine-builder");
    useStore.getState().removeActiveProgram("engine-builder");

    expect(profile()?.active_program_id).toBeUndefined();
    expect(profile()?.active_program_ids).toBeUndefined();
    expect(profile()?.active_program_started_at).toBeUndefined();
  });

  it("keeps the ended program's history so it can be picked up again", () => {
    useStore.getState().setActiveProgram("engine-builder");
    const originalStart = profile()?.program_states?.["engine-builder"]?.started_at;

    useStore.getState().removeActiveProgram("engine-builder");

    expect(profile()?.program_states?.["engine-builder"]?.started_at).toBe(
      originalStart,
    );
  });

  it("promotes the next track when a stacked secondary is removed", () => {
    useStore.getState().setActiveProgram("engine-builder");
    useStore.getState().addSecondaryProgramForce("handstand-walk");
    useStore.getState().removeActiveProgram("engine-builder");

    expect(profile()?.active_program_id).toBe("handstand-walk");
    expect(profile()?.active_program_ids).toEqual(["handstand-walk"]);
  });
});
