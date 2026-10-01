import { describe, it, expect, beforeEach, vi } from "vitest";
import { repairStore } from "./store-repair";
import { loadStore, emptyStore } from "./storage";
import { storeSchema } from "./schemas";

vi.mock("@sentry/nextjs", () => ({ captureMessage: vi.fn() }));

/**
 * BUG-44 (2026-10-01). One malformed field cost a user their whole store:
 * the local load rebuilt it without `user_profile` ("Pick your focus" over
 * intact logs) and the server copy was refused. These pin that a single bad
 * entry now costs that entry and nothing else.
 */
type Fixture = {
  version: number;
  training_maxes: unknown;
  logs: Record<
    string,
    {
      date: string;
      notes: string;
      symptoms: null;
      derived_state: string;
      exercises: Record<string, { done: boolean; sets: Array<Record<string, unknown>> }>;
    }
  >;
  user_profile: {
    active_program_id: string;
    active_program_ids: string[];
    capability_profile: Record<string, Record<string, unknown>>;
  };
};

const good = (): Fixture =>
  ({
    version: 2,
    training_maxes: { back_squat_highbar: 122.5 },
    logs: {
      "2026-09-28": {
        date: "2026-09-28",
        notes: "",
        symptoms: null,
        derived_state: "green",
        exercises: {
          "block_squat_heavy:back_squat_highbar": {
            done: true,
            sets: [{ weight_kg: 100, reps: 10, rpe: 6 }],
          },
        },
      },
    },
    user_profile: {
      active_program_id: "first-strict-pullup",
      active_program_ids: ["first-strict-pullup"],
      capability_profile: {
        strict_pullup_max_reps: { estimated_level: 2, confidence: "physical_test", measured_value: 1, last_measured_at: "2026-09-27T08:00:00.000Z" },
      },
    },
  });

describe("repairStore (BUG-44)", () => {
  it("leaves a valid store exactly as it is", () => {
    const r = repairStore(good(), emptyStore());
    expect(r?.dropped).toEqual([]);
    expect(r?.store).toEqual(storeSchema.parse(good()));
  });

  it("drops only the malformed capability entry the simulator wrote, and keeps the programme", () => {
    const bad = good();
    bad.user_profile.capability_profile.dead_hang_max_seconds = {
      measured_value: 30,
      measured_at: "2026-09-27T08:00:00.000Z",
    };
    expect(storeSchema.safeParse(bad).success, "fixture must actually be invalid").toBe(false);

    const r = repairStore(bad, emptyStore())!;
    expect(r.dropped).toEqual(["user_profile.capability_profile.dead_hang_max_seconds"]);
    expect(r.store.user_profile?.active_program_id).toBe("first-strict-pullup");
    expect(r.store.user_profile?.capability_profile?.strict_pullup_max_reps?.measured_value).toBe(1);
    expect(r.store.logs["2026-09-28"].exercises["block_squat_heavy:back_squat_highbar"].sets?.[0].reps).toBe(10);
    expect(r.store.training_maxes.back_squat_highbar).toBe(122.5);
  });

  it("a bad value inside one set costs that value, not the day", () => {
    const bad = good();
    bad.logs["2026-09-28"].exercises["block_squat_heavy:back_squat_highbar"].sets[0].rpe = "hard";
    const r = repairStore(bad, emptyStore())!;
    expect(r.dropped.every((p) => p.startsWith("logs.2026-09-28.exercises"))).toBe(true);
    const set = r.store.logs["2026-09-28"].exercises["block_squat_heavy:back_squat_highbar"].sets?.[0];
    expect(set?.weight_kg).toBe(100);
    expect(set?.reps).toBe(10);
  });

  it("a broken top-level key is reset, never deleted", () => {
    const bad = good();
    bad.training_maxes = "not an object";
    const r = repairStore(bad, emptyStore())!;
    expect(r.store.training_maxes).toEqual({});
    expect(Object.keys(r.store.logs)).toEqual(["2026-09-28"]);
  });

  it("returns null for something that is not a store at all", () => {
    expect(repairStore("nope", emptyStore())).toBeNull();
    expect(repairStore([1, 2], emptyStore())).toBeNull();
  });
});

describe("loadStore keeps the programme when one field is bad (BUG-44)", () => {
  beforeEach(() => localStorage.clear());

  it("repairs instead of rebuilding without user_profile, and backs the original up", () => {
    const bad = good();
    bad.user_profile.capability_profile.dead_hang_max_seconds = { measured_value: 30, measured_at: "x" };
    const raw = JSON.stringify(bad);
    localStorage.setItem("program.log.v2", raw);

    const s = loadStore();
    expect(s.user_profile?.active_program_id).toBe("first-strict-pullup");
    expect(Object.keys(s.logs)).toEqual(["2026-09-28"]);
    expect(Object.values(localStorage).includes(raw), "the original payload is backed up").toBe(true);
  });
});
