import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import {
  arePrerequisitesMet,
  blocksForDate,
  composeBlockForUser,
  composeSlotDrills,
  filterBlockItemsByPrerequisites,
  resolveActiveTier,
} from "./plan-generator";
import { strengthBlocksForDate, activePhaseFor } from "./schedule";
import type { Block, Exercise, Program, Store } from "../schemas";

function loadProgram(slug: string): Program {
  const p = path.resolve(
    __dirname,
    "../../../public/data/programs",
    `${slug}.json`,
  );
  const parsed = JSON.parse(fs.readFileSync(p, "utf8")) as Program;
  // Mirror the real loader (lib/data-loader.ts) — most program JSONs
  // carry no `slug` field of their own; it's stamped on at load. Tests
  // that skip the stamp aren't testing what the app runs.
  parsed.slug = slug;
  return parsed;
}

describe("blocksForDate — correlated_tier (legacy)", () => {
  const program = loadProgram("anterior-hip-rebuild");

  it("returns the same block list as strengthBlocksForDate", () => {
    // Monday 2026-08-31, inside phase_2_cycle_1 → block_squat_heavy per weekly_template.
    const dateISO = "2026-08-31";
    const phase = activePhaseFor(program, dateISO);
    expect(phase?.id).toBe("phase_2_cycle_1");

    const viaGenerator = blocksForDate(program, undefined, phase, dateISO);
    const viaSchedule = strengthBlocksForDate(program, phase, dateISO);

    expect(viaGenerator.map((b) => b.id)).toEqual(viaSchedule.map((b) => b.id));
    expect(viaGenerator.map((b) => b.id)).toContain("block_squat_heavy");
  });
});

describe("blocksForDate — multi_dimensional (handstand-walk)", () => {
  const program = loadProgram("handstand-walk");
  // 2026-01-19 is a Monday inside phase_1_foundation_prep (Wrist prep +
  // Kinoshita). Chosen so the phase-aware substitution keeps the tier A
  // layout as-authored (kinoshita is in phase_1.blocks).
  const phase1MondayISO = "2026-01-19";

  function profileWith(tier: string): Store["user_profile"] {
    return {
      active_program_id: "handstand-walk",
      program_states: {
        "handstand-walk": { tier },
      },
    };
  }

  it("returns Tier A Monday layout blocks when tier_a_foundation is picked", () => {
    const profile = profileWith("tier_a_foundation");
    const out = blocksForDate(program, profile, undefined, phase1MondayISO);
    const ids = out.map((b) => b.id);
    // From reference_week_tier_a Mon entry: primary_block + wrap[]
    expect(ids).toContain("block_skill_A_kinoshita");
    expect(ids).toContain("block_wrist_prep");
    expect(ids).toContain("block_recovery");
  });

  it("puts a Tier D user in the Tier D phase on the same date, not Tier A's", () => {
    // Rewritten 2026-08-24. This previously asserted that a Tier D user on
    // this date landed in phase_1 (Tier A's phase) and got Kinoshita
    // substituted in. That only happened because the test's loader didn't
    // stamp `program.slug`, and `activePhaseFor` reads the user's tier via
    // `program.slug` — so tier came back undefined and phase selection fell
    // through to `matches[0]`, which is Tier A's phase. The real loader
    // always stamps the slug, so the app never behaved that way.
    //
    // What actually happens, and what handstand-walk.json authors: every
    // tier has its own phase covering the SAME dates, tagged with
    // `for_tier_ids`. A Tier D user on this date is in phase_4_variability,
    // whose blocks include block_skill_A_variability — so the tier's
    // reference-week layout needs no substitution at all.
    const profile = profileWith("tier_d_advanced");
    const out = blocksForDate(program, profile, undefined, phase1MondayISO);
    const ids = out.map((b) => b.id);
    expect(ids).toContain("block_skill_A_variability");
    expect(ids).toContain("block_wrist_prep");
    expect(ids).toContain("block_recovery");
    // Tier A's headline block belongs to a phase this user is not in.
    expect(ids).not.toContain("block_skill_A_kinoshita");
  });

  it("phase_0 gates every tier to bail-out blocks (fear-of-falling prep)", () => {
    // Bug #70 fix: during phase_0_bail_out_prep, the tier's reference week
    // is filtered against phase_0.blocks (bail-only). All 4 tiers see a
    // bail block on their skill_A day — phase_0's whole purpose.
    const phase0MondayISO = "2026-01-05"; // inside phase_0
    for (const tier of [
      "tier_a_foundation",
      "tier_b_wall_to_free",
      "tier_c_freestand_walker",
      "tier_d_advanced",
    ]) {
      const out = blocksForDate(program, profileWith(tier), undefined, phase0MondayISO);
      const ids = out.map((b) => b.id);
      expect(ids.length).toBeGreaterThan(0);
      // At least one bail block must appear.
      expect(ids.some((id) => id.startsWith("block_bail_"))).toBe(true);
    }
  });

  it("returns [] for a rest day (no layout entry in the tier's week)", () => {
    // Tier A's layout is Mon/Wed/Fri/Sun → Tue (2026-01-20) is a rest day.
    const profile = profileWith("tier_a_foundation");
    const restDayISO = "2026-01-20"; // Tuesday in phase_1
    const out = blocksForDate(program, profile, undefined, restDayISO);
    expect(out).toEqual([]);
  });
});

describe("resolveActiveTier", () => {
  const program = loadProgram("handstand-walk");

  it("returns the picked tier from user_profile.program_states[slug].tier", () => {
    const profile: Store["user_profile"] = {
      active_program_id: "handstand-walk",
      program_states: {
        "handstand-walk": { tier: "tier_c_freestand" },
      },
    };
    expect(resolveActiveTier(program, profile)).toBe("tier_c_freestand");
  });

  it("resolves the tier of the program passed in, not the primary program", () => {
    // Regression (2026-08-24): this read `profile.active_program_id`, so a
    // second active track resolved the PRIMARY's tier — or, when the
    // primary had no entry, silently fell back to tier 1. Handstand-walk
    // is the secondary here; the primary is a different program entirely.
    const profile: Store["user_profile"] = {
      active_program_id: "anterior-hip-rebuild",
      active_program_ids: ["anterior-hip-rebuild", "handstand-walk"],
      program_states: {
        "anterior-hip-rebuild": { tier: "tier_a_foundation" },
        "handstand-walk": { tier: "tier_c_freestand" },
      },
    };
    expect(resolveActiveTier(program, profile)).toBe("tier_c_freestand");
  });

  it("falls back to program.plan_tiers[0].id when no pick", () => {
    // Undefined profile → first tier.
    expect(resolveActiveTier(program, undefined)).toBe(
      program.plan_tiers![0].id,
    );

    // Profile present but no program_states → first tier.
    const emptyProfile: Store["user_profile"] = {
      active_program_id: "handstand-walk",
    };
    expect(resolveActiveTier(program, emptyProfile)).toBe(
      program.plan_tiers![0].id,
    );
  });
});

describe("F-105 · prerequisite filtering", () => {
  const drill = (
    id: string,
    prereqs?: { capability_domain: string; minimum_level: 1 | 2 | 3 | 4 | 5 }[],
  ): Exercise => ({
    id,
    name: id,
    category: "skill",
    prerequisites: prereqs?.map((p) => ({
      capability_domain: p.capability_domain,
      minimum_level: p.minimum_level,
      rationale: "load_tolerance" as const,
      source: "literature" as const,
    })),
  });

  it("arePrerequisitesMet — passes when every domain meets threshold", () => {
    const prereqs = drill("x", [
      { capability_domain: "wrist_load_tolerance", minimum_level: 2 },
      { capability_domain: "shoulder_overhead_endurance", minimum_level: 1 },
    ]).prerequisites!;
    const levels = { wrist_load_tolerance: 3, shoulder_overhead_endurance: 2 } as const;
    expect(arePrerequisitesMet(prereqs, levels)).toBe(true);
  });

  it("arePrerequisitesMet — fails when one domain is under threshold", () => {
    const prereqs = drill("x", [
      { capability_domain: "wrist_load_tolerance", minimum_level: 3 },
    ]).prerequisites!;
    const levels = { wrist_load_tolerance: 2 } as const;
    expect(arePrerequisitesMet(prereqs, levels)).toBe(false);
  });

  it("arePrerequisitesMet — unknown domain defaults to level 1 (blocks level 2+)", () => {
    const prereqs = drill("x", [
      { capability_domain: "handstand_turns", minimum_level: 2 },
    ]).prerequisites!;
    expect(arePrerequisitesMet(prereqs, {})).toBe(false);
  });

  it("filterBlockItemsByPrerequisites — drops items whose prereqs aren't met", () => {
    const drillsById = {
      easy: drill("easy"),
      moderate: drill("moderate", [
        { capability_domain: "wrist_load_tolerance", minimum_level: 2 },
      ]),
      hard: drill("hard", [
        { capability_domain: "wrist_load_tolerance", minimum_level: 4 },
      ]),
    };
    const block: Block = {
      id: "block_test",
      name: "Test block",
      category: "accessory",
      items: [
        { exercise_id: "easy" },
        { exercise_id: "moderate" },
        { exercise_id: "hard" },
      ],
    };
    const levels = { wrist_load_tolerance: 2 } as const;
    const filtered = filterBlockItemsByPrerequisites(block, drillsById, levels);
    expect(filtered.items!.map((i) => i.exercise_id)).toEqual([
      "easy",
      "moderate",
    ]);
  });

  it("filterBlockItemsByPrerequisites — returns block unchanged when nothing to drop", () => {
    const drillsById = { a: drill("a") };
    const block: Block = {
      id: "block_test",
      name: "Test",
      items: [{ exercise_id: "a" }],
    };
    const filtered = filterBlockItemsByPrerequisites(block, drillsById, {});
    // Identity-preserving optimisation — same reference when nothing changes.
    expect(filtered).toBe(block);
  });

  it("blocksForDate — Tier A user sees Kinoshita drills (level 1) but not Advanced ones", () => {
    // Real integration test against handstand-walk.json
    const program = JSON.parse(
      fs.readFileSync(
        path.resolve(
          __dirname,
          "../../../public/data/programs/handstand-walk.json",
        ),
        "utf8",
      ),
    ) as Program;
    const exs = JSON.parse(
      fs.readFileSync(
        path.resolve(__dirname, "../../../public/data/exercises.json"),
        "utf8",
      ),
    ) as { exercises: Exercise[] };
    const drillsById = Object.fromEntries(exs.exercises.map((e) => [e.id, e]));

    const profile: Store["user_profile"] = {
      active_program_id: "handstand-walk",
      program_states: {
        "handstand-walk": { tier: "tier_a_foundation" },
      },
    };
    // Monday of the sim start window
    const dateISO = "2026-08-17";
    const blocks = blocksForDate(program, profile, undefined, dateISO, drillsById);
    expect(blocks.length).toBeGreaterThan(0);

    // Every drill left in the block must have prerequisites the Tier A user meets.
    // Tier A → base level 1 across all domains (unknown → tier baseline).
    for (const b of blocks) {
      for (const it of b.items ?? []) {
        if (!it.exercise_id) continue;
        const d = drillsById[it.exercise_id];
        if (!d?.prerequisites) continue;
        for (const p of d.prerequisites) {
          expect(p.minimum_level).toBeLessThanOrEqual(1);
        }
      }
    }
  });
});

describe("#64 · Overhead Mobility multi-dim wiring", () => {
  const program = loadProgram("overhead-mobility");
  const exs = JSON.parse(
    fs.readFileSync(
      path.resolve(__dirname, "../../../public/data/exercises.json"),
      "utf8",
    ),
  ) as { exercises: Exercise[] };
  const drillsById = Object.fromEntries(exs.exercises.map((e) => [e.id, e]));

  // Program starts 2026-08-13 (phase 1). Monday inside phase 1:
  const monISO = "2026-08-17";

  function profileWith(tier: string): Store["user_profile"] {
    return {
      active_program_id: "overhead-mobility",
      program_states: { "overhead-mobility": { tier } },
    };
  }

  it("uses multi_dimensional strategy", () => {
    expect(program.generation_strategy).toBe("multi_dimensional");
  });

  it("composes thoracic drills into block_thoracic_prep at Foundation tier", () => {
    const blocks = blocksForDate(program, profileWith("foundation"), undefined, monISO, drillsById);
    const thoracic = blocks.find((b) => b.id === "block_thoracic_prep");
    expect(thoracic).toBeDefined();
    expect(thoracic!.items).toBeDefined();
    expect(thoracic!.items!.length).toBeGreaterThan(0);
    // Every composed drill must target the thoracic slot
    for (const it of thoracic!.items ?? []) {
      if (!it.exercise_id) continue;
      const d = drillsById[it.exercise_id];
      expect(d.capability_domains).toContain("thoracic_extension_mobility");
    }
  });

  it("attaches an external-focus cue as note on composed drills", () => {
    const blocks = blocksForDate(program, profileWith("foundation"), undefined, monISO, drillsById);
    const thoracic = blocks.find((b) => b.id === "block_thoracic_prep");
    const withNote = (thoracic?.items ?? []).filter((it) => it.note);
    expect(withNote.length).toBeGreaterThan(0);
  });

  it("Foundation-tier user gets level 1-2 drills (not the loaded overhead ones)", () => {
    const blocks = blocksForDate(program, profileWith("foundation"), undefined, monISO, drillsById);
    for (const b of blocks) {
      for (const it of b.items ?? []) {
        if (!it.exercise_id) continue;
        const drill = drillsById[it.exercise_id];
        // Foundation baseline level = 1; composeSlotDrills targets ±1
        expect(drill.level).toBeLessThanOrEqual(2);
      }
    }
  });
});

describe("F-105 M2 · composeSlotDrills", () => {
  const program = JSON.parse(
    fs.readFileSync(
      path.resolve(
        __dirname,
        "../../../public/data/programs/handstand-walk.json",
      ),
      "utf8",
    ),
  ) as Program;
  const exs = JSON.parse(
    fs.readFileSync(
      path.resolve(__dirname, "../../../public/data/exercises.json"),
      "utf8",
    ),
  ) as { exercises: Exercise[] };
  const drillsById = Object.fromEntries(exs.exercises.map((e) => [e.id, e]));

  it("composes wrist_load_tolerance drills for block_wrist_prep at Tier A", () => {
    const block = program.blocks.find((b) => b.id === "block_wrist_prep")!;
    expect(block.capability_slot).toBe("wrist_load_tolerance");
    // Tier A user — level 1 across all domains
    const levels = { wrist_load_tolerance: 1 } as const;
    const composed = composeSlotDrills(program, block, drillsById, levels);
    expect(composed).not.toBeNull();
    expect(composed!.items!.length).toBeGreaterThan(0);
    // Every composed drill must target the slot AND be within level ±1 of user's level 1
    for (const it of composed!.items!) {
      if (!it.exercise_id) continue;
      const drill = drillsById[it.exercise_id];
      expect(drill.capability_domains).toContain("wrist_load_tolerance");
      expect(drill.level).toBeLessThanOrEqual(2);
    }
  });

  it("attaches external-focus cue as note on composed drills", () => {
    const block = program.blocks.find((b) => b.id === "block_wrist_prep")!;
    const composed = composeSlotDrills(program, block, drillsById, { wrist_load_tolerance: 1 });
    const withNote = composed!.items!.filter((it) => it.note);
    expect(withNote.length).toBeGreaterThan(0);
  });

  it("respects slot_drill_count", () => {
    const block = program.blocks.find((b) => b.id === "block_wrist_prep")!;
    expect(block.slot_drill_count).toBe(3);
    const composed = composeSlotDrills(program, block, drillsById, { wrist_load_tolerance: 1 });
    expect(composed!.items!.length).toBeLessThanOrEqual(3);
  });
});

describe("F-105 M3 · contextual interference", () => {
  it("applyContextualInterference — weeks 1-2 keep composed order (blocked)", async () => {
    const { applyContextualInterference } = await import("./plan-generator");
    const block: Block = {
      id: "block_test",
      name: "Test",
      items: [
        { exercise_id: "a" },
        { exercise_id: "b" },
        { exercise_id: "c" },
      ],
    };
    const week1 = applyContextualInterference(block, 1, "2026-01-05");
    expect(week1.items!.map((i) => i.exercise_id)).toEqual(["a", "b", "c"]);
    const week2 = applyContextualInterference(block, 2, "2026-01-12");
    expect(week2.items!.map((i) => i.exercise_id)).toEqual(["a", "b", "c"]);
  });

  it("applyContextualInterference — weeks 3+ shuffle deterministically", async () => {
    const { applyContextualInterference } = await import("./plan-generator");
    const block: Block = {
      id: "block_test",
      name: "Test",
      items: [
        { exercise_id: "a" },
        { exercise_id: "b" },
        { exercise_id: "c" },
        { exercise_id: "d" },
      ],
    };
    const shuffled = applyContextualInterference(block, 3, "2026-01-19");
    const ids = shuffled.items!.map((i) => i.exercise_id);
    // Same set of items
    expect([...ids].sort()).toEqual(["a", "b", "c", "d"]);
    // Same shuffle on second call — deterministic
    const shuffled2 = applyContextualInterference(block, 3, "2026-01-19");
    expect(shuffled2.items).toEqual(shuffled.items);
    // Different date, different shuffle
    const shuffled3 = applyContextualInterference(block, 3, "2026-01-20");
    expect(shuffled3.items).not.toEqual(shuffled.items);
  });

  it("applyContextualInterference — different users on same date see different orderings (Phase A)", async () => {
    const { applyContextualInterference } = await import("./plan-generator");
    const block: Block = {
      id: "block_test",
      name: "Test",
      items: [
        { exercise_id: "a" },
        { exercise_id: "b" },
        { exercise_id: "c" },
        { exercise_id: "d" },
        { exercise_id: "e" },
      ],
    };
    // Simulate two users on the same program + same date but different uids.
    const userA = "uidA:handstand-walk:2026-01-01:1.0:2026-01-19:block_test";
    const userB = "uidB:handstand-walk:2026-01-01:1.0:2026-01-19:block_test";
    const shuffledA = applyContextualInterference(block, 3, userA);
    const shuffledB = applyContextualInterference(block, 3, userB);
    // Both have the same items, just re-ordered.
    expect([...shuffledA.items!].map((i) => i.exercise_id).sort()).toEqual(
      [...shuffledB.items!].map((i) => i.exercise_id).sort(),
    );
    // Orderings should be different — this is the whole point of Phase A.
    expect(shuffledA.items).not.toEqual(shuffledB.items);
  });

  it("applyContextualInterference — returns block unchanged if items < 2", async () => {
    const { applyContextualInterference } = await import("./plan-generator");
    const block: Block = { id: "b", name: "b", items: [{ exercise_id: "only" }] };
    const out = applyContextualInterference(block, 5, "2026-01-19");
    expect(out).toBe(block);
  });
});

describe("composeBlockForUser (block-object read path)", () => {
  const mobility = JSON.parse(
    fs.readFileSync(
      path.resolve(__dirname, "../../../public/data/programs/overhead-mobility.json"),
      "utf8",
    ),
  ) as Program;
  const handstand = JSON.parse(
    fs.readFileSync(
      path.resolve(__dirname, "../../../public/data/programs/handstand-walk.json"),
      "utf8",
    ),
  ) as Program;
  const exs = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, "../../../public/data/exercises.json"), "utf8"),
  ) as { exercises: Exercise[] };
  const drillsById = Object.fromEntries(exs.exercises.map((e) => [e.id, e]));
  const profile = {
    active_program_id: "overhead-mobility",
    program_states: { "overhead-mobility": { tier: "foundation" } },
  } as unknown as Store["user_profile"];

  it("fills a slot block that authors no items — the empty-session bug", () => {
    const block = mobility.blocks.find((b) => b.id === "block_thoracic_prep")!;
    expect(block.items ?? []).toHaveLength(0);
    const out = composeBlockForUser(mobility, block, profile, "2026-08-24", drillsById, {
      onlyIfEmpty: true,
    });
    expect(out.items!.length).toBeGreaterThan(0);
    for (const it of out.items!) {
      expect(drillsById[it.exercise_id!].capability_domains).toContain(
        "thoracic_extension_mobility",
      );
    }
  });

  it("leaves an authored block untouched under onlyIfEmpty", () => {
    const block = handstand.blocks.find((b) => b.capability_slot && b.items?.length)!;
    const out = composeBlockForUser(handstand, block, profile, "2026-08-24", drillsById, {
      onlyIfEmpty: true,
    });
    expect(out).toBe(block);
  });

  it("without onlyIfEmpty it still composes over authored items (legacy path)", () => {
    const block = handstand.blocks.find((b) => b.capability_slot && b.items?.length)!;
    const out = composeBlockForUser(handstand, block, profile, "2026-08-24", drillsById);
    expect(out).not.toBe(block);
  });
});
