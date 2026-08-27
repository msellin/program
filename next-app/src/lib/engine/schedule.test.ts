import { describe, it, expect } from "vitest";
import { blocksForDate } from "./plan-generator";
import { strengthBlocksForDate } from "./schedule";
import fs from "node:fs";
import path from "node:path";
import type { Program, Store } from "../schemas";

function loadProgramJson(slug: string): Program {
  const p = path.resolve(__dirname, "../../../public/data/programs", `${slug}.json`);
  const parsed = JSON.parse(fs.readFileSync(p, "utf8")) as Program;
  parsed.slug = slug; // Mirrors lib/data-loader.ts.
  return parsed;
}

// Minimal program shape for override tests. Base weekly_template has heavy
// sessions Mon/Wed/Thu/Sat; the phase declares an override for one week
// swapping Tue/Fri to eval blocks and marking Mon/Thu as rest.
const program: Program = {
  slug: "test-program",
  schema_version: "1.0.0",
  generated: "2026-08-01",
  status: "ACTIVE",
  phases: [
    {
      id: "phase_test",
      name: "Test phase",
      starts: "2026-08-10",
      ends: "2026-08-30",
      blocks: [
        "block_squat_heavy",
        "block_pull_heavy",
        "block_squat_variant",
        "block_squat_volume",
        "block_eval_squat",
        "block_eval_pull",
        "block_reintro_light",
        "block_a_home",
      ],
      weekly_overrides: [
        {
          starts: "2026-08-24",
          ends: "2026-08-29",
          days: {
            Mon: "",
            Tue: "block_eval_squat",
            Wed: "block_reintro_light",
            Thu: "",
            Fri: "block_eval_pull",
            Sat: "block_reintro_light",
            Sun: "block_a_home",
          },
        },
      ],
    },
  ],
  blocks: [
    { id: "block_squat_heavy", name: "Squat heavy", category: "strength", items: [] },
    { id: "block_pull_heavy", name: "Pull heavy", category: "strength", items: [] },
    { id: "block_squat_variant", name: "Squat variant", category: "strength", items: [] },
    { id: "block_squat_volume", name: "Squat volume", category: "strength", items: [] },
    { id: "block_eval_squat", name: "5RM squat", category: "strength", items: [] },
    { id: "block_eval_pull", name: "5RM pull", category: "strength", items: [] },
    { id: "block_reintro_light", name: "Light recovery", category: "strength", items: [] },
    { id: "block_a_home", name: "Home rehab", category: "accessory", items: [] },
  ],
  weekly_template: {
    week: [
      { day: "Sun", session: "block_a_home" },
      { day: "Mon", session: "block_squat_heavy" },
      { day: "Tue", session: "block_a_home" },
      { day: "Wed", session: "block_pull_heavy" },
      { day: "Thu", session: "block_squat_variant" },
      { day: "Fri", session: "block_a_home" },
      { day: "Sat", session: "block_squat_volume" },
    ],
  },
} as unknown as Program;

const emptyStore: Store["user_profile"] = undefined;

function idsFor(dateISO: string): string[] {
  const phase = program.phases[0];
  const blocks = blocksForDate(program, emptyStore, phase, dateISO);
  return blocks.map((b) => b.id);
}

describe("weekly_overrides", () => {
  it("uses the default template for dates OUTSIDE the override window", () => {
    // Aug 17 (Mon) — inside phase, but before Aug 24 override window.
    expect(idsFor("2026-08-17")).toEqual(["block_squat_heavy"]);
    // Aug 19 (Wed) — same.
    expect(idsFor("2026-08-19")).toEqual(["block_pull_heavy"]);
    // Aug 22 (Sat) — same.
    expect(idsFor("2026-08-22")).toEqual(["block_squat_volume"]);
  });

  it("uses the override for dates INSIDE the window (Tue → eval squat)", () => {
    // Aug 25 (Tue) — override says block_eval_squat.
    expect(idsFor("2026-08-25")).toEqual(["block_eval_squat"]);
  });

  it("uses the override for Fri → eval pull", () => {
    // Aug 28 (Fri) — override says block_eval_pull.
    expect(idsFor("2026-08-28")).toEqual(["block_eval_pull"]);
  });

  it("uses the override for Wed + Sat → light recovery", () => {
    // Aug 26 (Wed) — override says block_reintro_light.
    expect(idsFor("2026-08-26")).toEqual(["block_reintro_light"]);
    // Aug 29 (Sat) — override says block_reintro_light.
    expect(idsFor("2026-08-29")).toEqual(["block_reintro_light"]);
  });

  it("treats empty-string override as explicit REST (no blocks)", () => {
    // Aug 24 (Mon) — override says "" (rest).
    expect(idsFor("2026-08-24")).toEqual([]);
    // Aug 27 (Thu) — override says "" (rest).
    expect(idsFor("2026-08-27")).toEqual([]);
  });

  it("keeps Sunday's home block during override week (day IS in override map)", () => {
    // Aug 30 is Sun but AFTER the override window (ends Aug 29). Should
    // fall back to default template: block_a_home.
    expect(idsFor("2026-08-30")).toEqual(["block_a_home"]);
  });

  it("returns default template when a day is NOT in the override.days map", () => {
    // Give the same program a partial override that only maps Tue, leaves
    // other days to fall through.
    const partial: Program = {
      ...program,
      phases: [
        {
          ...program.phases[0],
          weekly_overrides: [
            {
              starts: "2026-08-24",
              ends: "2026-08-29",
              days: { Tue: "block_eval_squat" }, // only Tuesday overridden
            },
          ],
        },
      ],
    } as unknown as Program;
    // Aug 25 (Tue) — overridden.
    const tue = blocksForDate(partial, emptyStore, partial.phases[0], "2026-08-25");
    expect(tue.map((b) => b.id)).toEqual(["block_eval_squat"]);
    // Aug 24 (Mon) — NOT in override.days → falls back to default.
    const mon = blocksForDate(partial, emptyStore, partial.phases[0], "2026-08-24");
    expect(mon.map((b) => b.id)).toEqual(["block_squat_heavy"]);
    // Aug 26 (Wed) — NOT in override.days → falls back to default.
    const wed = blocksForDate(partial, emptyStore, partial.phases[0], "2026-08-26");
    expect(wed.map((b) => b.id)).toEqual(["block_pull_heavy"]);
  });

  it("multiple override windows — first match wins, disjoint ranges", () => {
    const multi: Program = {
      ...program,
      phases: [
        {
          ...program.phases[0],
          weekly_overrides: [
            {
              starts: "2026-08-17",
              ends: "2026-08-23",
              days: { Mon: "block_eval_squat" },
            },
            {
              starts: "2026-08-24",
              ends: "2026-08-29",
              days: { Mon: "block_eval_pull" },
            },
          ],
        },
      ],
    } as unknown as Program;
    // Aug 17 (Mon) — first window.
    expect(blocksForDate(multi, emptyStore, multi.phases[0], "2026-08-17").map((b) => b.id)).toEqual(["block_eval_squat"]);
    // Aug 24 (Mon) — second window.
    expect(blocksForDate(multi, emptyStore, multi.phases[0], "2026-08-24").map((b) => b.id)).toEqual(["block_eval_pull"]);
  });

  it("no phase.weekly_overrides field → falls through to default template (backwards compat)", () => {
    const noOverride: Program = {
      ...program,
      phases: [{ ...program.phases[0], weekly_overrides: undefined }],
    } as unknown as Program;
    // Aug 25 (Tue) — no override, uses default block_a_home for Tue.
    expect(
      blocksForDate(noOverride, emptyStore, noOverride.phases[0], "2026-08-25").map((b) => b.id),
    ).toEqual(["block_a_home"]);
  });
});

describe("user events (race / competition / travel)", () => {
  const noOverridesProgram: Program = {
    ...program,
    phases: [{ ...program.phases[0], weekly_overrides: undefined }],
  } as unknown as Program;

  it("no events → default template unchanged", () => {
    const profile = { events: [] };
    const blocks = blocksForDate(
      noOverridesProgram,
      profile as unknown as Store["user_profile"],
      noOverridesProgram.phases[0],
      "2026-08-17",
    );
    expect(blocks.map((b) => b.id)).toEqual(["block_squat_heavy"]);
  });

  it("event on the date → force rest (no session)", () => {
    const profile = {
      events: [{ id: "e1", date: "2026-08-17", name: "5K race" }],
    };
    const blocks = blocksForDate(
      noOverridesProgram,
      profile as unknown as Store["user_profile"],
      noOverridesProgram.phases[0],
      "2026-08-17",
    );
    expect(blocks).toEqual([]);
  });

  it("event date DIFFERENT from today → no effect", () => {
    const profile = {
      events: [{ id: "e1", date: "2026-08-29", name: "Race" }],
    };
    // Aug 17 is 12 days before the race, no pre_deload → session as scheduled.
    const blocks = blocksForDate(
      noOverridesProgram,
      profile as unknown as Store["user_profile"],
      noOverridesProgram.phases[0],
      "2026-08-17",
    );
    expect(blocks.map((b) => b.id)).toEqual(["block_squat_heavy"]);
  });

  it("pre_deload_days: 2 → 2 days before event also become rest", () => {
    const profile = {
      events: [{ id: "e1", date: "2026-08-19", name: "Comp", pre_deload_days: 2 }],
    };
    // Aug 17 (2 days before) = rest.
    expect(
      blocksForDate(noOverridesProgram, profile as unknown as Store["user_profile"], noOverridesProgram.phases[0], "2026-08-17"),
    ).toEqual([]);
    // Aug 18 (1 day before) = rest.
    expect(
      blocksForDate(noOverridesProgram, profile as unknown as Store["user_profile"], noOverridesProgram.phases[0], "2026-08-18"),
    ).toEqual([]);
    // Aug 19 (day of) = rest.
    expect(
      blocksForDate(noOverridesProgram, profile as unknown as Store["user_profile"], noOverridesProgram.phases[0], "2026-08-19"),
    ).toEqual([]);
    // Aug 16 (3 days before) = normal session (Sun in this template = block_a_home).
    expect(
      blocksForDate(noOverridesProgram, profile as unknown as Store["user_profile"], noOverridesProgram.phases[0], "2026-08-16").map((b) => b.id),
    ).toEqual(["block_a_home"]);
  });

  it("rest_days_after: 1 → day after also rest", () => {
    const profile = {
      events: [{ id: "e1", date: "2026-08-17", name: "Race", rest_days_after: 1 }],
    };
    // Aug 17 (day of) = rest.
    expect(
      blocksForDate(noOverridesProgram, profile as unknown as Store["user_profile"], noOverridesProgram.phases[0], "2026-08-17"),
    ).toEqual([]);
    // Aug 18 (day after) = rest.
    expect(
      blocksForDate(noOverridesProgram, profile as unknown as Store["user_profile"], noOverridesProgram.phases[0], "2026-08-18"),
    ).toEqual([]);
    // Aug 19 (2 days after) = normal.
    expect(
      blocksForDate(noOverridesProgram, profile as unknown as Store["user_profile"], noOverridesProgram.phases[0], "2026-08-19").map((b) => b.id),
    ).toEqual(["block_pull_heavy"]);
  });

  it("multiple events → any match wins", () => {
    const profile = {
      events: [
        { id: "e1", date: "2026-08-17", name: "Race A" },
        { id: "e2", date: "2026-08-22", name: "Race B" },
      ],
    };
    expect(
      blocksForDate(noOverridesProgram, profile as unknown as Store["user_profile"], noOverridesProgram.phases[0], "2026-08-17"),
    ).toEqual([]);
    expect(
      blocksForDate(noOverridesProgram, profile as unknown as Store["user_profile"], noOverridesProgram.phases[0], "2026-08-22"),
    ).toEqual([]);
    // In-between date not covered → normal.
    expect(
      blocksForDate(noOverridesProgram, profile as unknown as Store["user_profile"], noOverridesProgram.phases[0], "2026-08-19").map((b) => b.id),
    ).toEqual(["block_pull_heavy"]);
  });

  it("event supersedes weekly_overrides too", () => {
    // Program has an override for Aug 24-29 (Tue=eval); event on Tue Aug 25
    // should still force rest despite the override.
    const profile = {
      events: [{ id: "e1", date: "2026-08-25", name: "Injury day" }],
    };
    expect(
      blocksForDate(program, profile as unknown as Store["user_profile"], program.phases[0], "2026-08-25"),
    ).toEqual([]);
  });
});

describe("phase 1 barbell-day spacing (anterior-hip-rebuild)", () => {
  // Founder hit two heavy days back to back on 2026-08-26. `block_reintro`
  // is a single session containing BOTH back_squat_highbar and
  // block_pull_midshin, and phase 1 scheduled it Mon/Wed/Thu/Sat — so Wed
  // and Thu were a heavy squat 24h apart, contradicting the program's own
  // first principle: "48h between the two heavy squat days".
  const program = loadProgramJson("anterior-hip-rebuild");
  const phase = program.phases.find((p) => p.id === "phase_1_rebuild_evaluate")!;

  function barbellDowsInWeek(): number[] {
    // Walk the first week of the phase and collect the days that prescribe work.
    // Day-of-week is derived from the ISO string at UTC noon, exactly as
    // `strengthBlockIdsForDate` does. Using a local Date and calling
    // getDay() disagreed with the engine by a day in a UTC+3 timezone,
    // and the test reported Sun/Tue/Thu for a Mon/Wed/Sat schedule.
    const out: number[] = [];
    const start = Date.parse(phase.starts + "T12:00:00Z");
    for (let i = 0; i < 7; i++) {
      const iso = new Date(start + i * 864e5).toISOString().slice(0, 10);
      if (strengthBlocksForDate(program, phase, iso).length > 0) {
        out.push(new Date(iso + "T12:00:00Z").getUTCDay());
      }
    }
    return out.sort((a, b) => a - b);
  }

  it("never schedules two barbell sessions on consecutive days", () => {
    const dows = barbellDowsInWeek();
    expect(dows.length).toBeGreaterThan(0);
    for (let i = 1; i < dows.length; i++) {
      expect(dows[i] - dows[i - 1]).toBeGreaterThan(1);
    }
  });

  it("leaves Sunday clear, per the program's rest-day principle", () => {
    expect(barbellDowsInWeek()).not.toContain(0);
  });
});

describe("away periods", () => {
  // Replaces HIP_RACE_DATE, a single date hard-coded into the scheduler.
  const program = loadProgramJson("anterior-hip-rebuild");
  const phase = program.phases.find((p) => p.id === "phase_1_rebuild_evaluate")!;

  function blocksOn(dateISO: string, profile?: Store["user_profile"]) {
    return strengthBlocksForDate(program, phase, dateISO, profile).map((b) => b.id);
  }

  // A Monday inside phase 1 that does prescribe work.
  const trainingDay = "2026-08-24";

  it("prescribes nothing on an away day", () => {
    expect(blocksOn(trainingDay).length).toBeGreaterThan(0);
    const away: Store["user_profile"] = {
      away_periods: [{ start: trainingDay, end: trainingDay, reason: "90 km ride" }],
    };
    expect(blocksOn(trainingDay, away)).toEqual([]);
  });

  it("covers a whole range, not just its edges", () => {
    const away: Store["user_profile"] = {
      away_periods: [{ start: "2026-08-20", end: "2026-08-28", reason: "Summer trip" }],
    };
    expect(blocksOn(trainingDay, away)).toEqual([]);
    // And leaves days outside the range alone.
    expect(blocksOn("2026-08-31", away).length).toBeGreaterThanOrEqual(0);
  });

  it("leaves days outside every period untouched", () => {
    const away: Store["user_profile"] = {
      away_periods: [{ start: "2026-09-10", end: "2026-09-12" }],
    };
    expect(blocksOn(trainingDay, away)).toEqual(blocksOn(trainingDay));
  });
});

describe("phase-1 evaluation is schedulable", () => {
  // `block_evaluate` was returned by the scheduler and does not exist in
  // the program — strengthBlocksForDate filters ids against real blocks,
  // so the evaluation never appeared on any calendar, and the founder's
  // training maxes stayed at their intake values as a result.
  const program = loadProgramJson("anterior-hip-rebuild");
  const phase = program.phases.find((p) => p.id === "phase_1_rebuild_evaluate")!;

  function idsOn(dateISO: string) {
    return strengthBlocksForDate(program, phase, dateISO).map((b) => b.id);
  }

  it("schedules the squat evaluation on a Friday from week 2 onward", () => {
    // 2026-08-28 is a Friday in week 3 of the phase.
    expect(idsOn("2026-08-28")).toEqual(["block_eval_squat"]);
  });

  it("schedules the pull evaluation on a Tuesday", () => {
    // 2026-08-25 is a Tuesday in week 2.
    expect(idsOn("2026-08-25")).toEqual(["block_eval_pull"]);
  });

  it("never returns a block the program does not author", () => {
    const authored = new Set(program.blocks.map((b) => b.id));
    for (let i = 0; i < 24; i++) {
      const d = new Date(Date.parse(phase.starts + "T12:00:00Z") + i * 864e5)
        .toISOString()
        .slice(0, 10);
      for (const id of idsOn(d)) expect(authored.has(id)).toBe(true);
    }
  });
});

describe("evaluations count as heavy days for spacing", () => {
  // Friday's 5RM squat test was landing next to Saturday's full reintro
  // session — squat and pull 24h after a max squat. Eval days and barbell
  // days were independent sets, so the 48h rule the phase-1 fix enforces
  // did not see the evaluation at all.
  const program = loadProgramJson("anterior-hip-rebuild");
  const phase = program.phases.find((p) => p.id === "phase_1_rebuild_evaluate")!;
  const idsOn = (d: string) => strengthBlocksForDate(program, phase, d).map((b) => b.id);

  it("does not put a barbell session the day after an evaluation", () => {
    expect(idsOn("2026-08-28")).toEqual(["block_eval_squat"]); // Friday, eval
    expect(idsOn("2026-08-29")).toEqual([]); // Saturday, was block_reintro
  });

  it("still trains the day BEFORE an evaluation", () => {
    // Clearing both neighbours emptied the whole barbell week — with evals
    // on Tue/Fri and barbell on Mon/Wed/Sat, every barbell day borders one.
    // Recovery after a max effort is what matters.
    expect(idsOn("2026-08-25")).toEqual(["block_eval_pull"]); // Tuesday
    expect(idsOn("2026-08-24")).toEqual(["block_reintro"]); // Monday, kept
  });
});
