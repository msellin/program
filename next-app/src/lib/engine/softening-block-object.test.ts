import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { applyProgramSoftening } from "./plan-generator";
import type { Program, Store, Block, DayLog } from "../schemas";

/**
 * The amber rule now fires on the path users are actually on.
 *
 * It ran inside `blocksForDate`, behind an optional `store` argument. The
 * `block_object` branch of `TodaySession` never calls `blocksForDate` — it
 * reads materialized `scheduled_blocks` — and `StoreHydrator` defaults
 * `block_object` to true for everyone who has not opted out. So the one path
 * that applied CSM's safety rule was the one almost nobody was on, and a user
 * with three amber days in a week went on being prescribed `block_4x4_row`
 * while the programme's own red state says to drop it.
 *
 * Fixed at READ rather than at materialization. That is parity with the legacy
 * path, which also filters at read, rather than a new decision: a withdrawn
 * block disappears from today's view and the user's saved week is untouched.
 * Rewriting `scheduled_blocks` would be a much larger claim and a different
 * conversation.
 *
 * The threshold is untouched and stays in code. Making
 * `progression_rules.states[]` live would put nine unreviewed threshold sets
 * on the decision that tells someone not to train, which CLAUDE.md rules out
 * deliberately: a programme declares what feeds the gate, not how lenient the
 * gate is.
 */
const load = (slug: string): Program => {
  const p = JSON.parse(
    fs.readFileSync(
      path.resolve(__dirname, `../../../public/data/programs/${slug}.json`),
      "utf8",
    ),
  ) as Program;
  p.slug = slug;
  return p;
};

const amberDays = (dates: string[]): Record<string, DayLog> =>
  Object.fromEntries(
    dates.map((d) => [d, { date: d, derived_state: "amber", exercises: {} } as unknown as DayLog]),
  );

const storeWith = (logs: Record<string, DayLog>): Store =>
  ({ version: 2, training_maxes: {}, cycle: { cycle_number: 1, week_in_cycle: 1 }, logs }) as unknown as Store;

const TODAY = "2026-09-11";

describe("CSM amber softening", () => {
  const program = load("concurrent-strength-maintenance");
  const blocks = (program.blocks ?? []) as Block[];

  it("the programme still has the block the rule withdraws", () => {
    // Guards the guard: if `block_4x4_row` is renamed, every assertion below
    // passes over a block that was never there.
    expect(blocks.some((b) => b.id === "block_4x4_row")).toBe(true);
  });

  it("two amber days is not enough — the rule is not trigger-happy", () => {
    const store = storeWith(amberDays(["2026-09-10", "2026-09-11"]));
    const out = applyProgramSoftening(blocks, program, TODAY, store);
    expect(out.some((b) => b.id === "block_4x4_row")).toBe(true);
  });

  it("three amber days in the trailing week withdraws the rowing block", () => {
    const store = storeWith(amberDays(["2026-09-09", "2026-09-10", "2026-09-11"]));
    const out = applyProgramSoftening(blocks, program, TODAY, store);
    expect(
      out.some((b) => b.id === "block_4x4_row"),
      "the programme's red state says to drop 4x4 for a week",
    ).toBe(false);
    // Everything else survives: this withdraws one block, it is not a rest day.
    expect(out.length).toBe(blocks.length - 1);
  });

  it("another programme is untouched by CSM's rule", () => {
    const other = load("engine-builder");
    const store = storeWith(amberDays(["2026-09-09", "2026-09-10", "2026-09-11"]));
    const out = applyProgramSoftening((other.blocks ?? []) as Block[], other, TODAY, store);
    expect(out.length).toBe((other.blocks ?? []).length);
  });

  it("counts TODAY, which UTC arithmetic silently dropped", () => {
    /**
     * The regression that made this file fail on its first run.
     *
     * The window walked dates with `toISOString().slice(0, 10)`. In UTC+3 —
     * where this app is developed and used — `new Date("2026-09-11T00:00:00")`
     * is 21:00 UTC on the 10th, so `back = 0` resolved to YESTERDAY and the
     * window covered -1 through -7 instead of 0 through -6.
     *
     * Today's amber day was therefore never counted: the single most relevant
     * day to a rule about whether to train today. A user on their third
     * consecutive amber day was read as having had two, and kept the block.
     *
     * Asserted as the boundary rather than by mocking a timezone: the three
     * amber days END on `TODAY`, so if the window is shifted even one day the
     * count comes back as two and the block survives.
     */
    const store = storeWith(amberDays(["2026-09-09", "2026-09-10", "2026-09-11"]));
    const out = applyProgramSoftening(blocks, program, "2026-09-11", store);
    expect(
      out.some((b) => b.id === "block_4x4_row"),
      "today's amber day is not being counted — the window has shifted again",
    ).toBe(false);

    // And the far edge still works: three ambers ending 6 days back is inside
    // the window; one more day out and it is not.
    const edge = storeWith(amberDays(["2026-09-05", "2026-09-06", "2026-09-07"]));
    expect(
      applyProgramSoftening(blocks, program, "2026-09-11", edge).some(
        (b) => b.id === "block_4x4_row",
      ),
      "2026-09-05 is exactly 6 days back and must still count",
    ).toBe(false);

    const outside = storeWith(amberDays(["2026-09-02", "2026-09-03", "2026-09-04"]));
    expect(
      applyProgramSoftening(blocks, program, "2026-09-11", outside).some(
        (b) => b.id === "block_4x4_row",
      ),
      "a week-old amber run must not still be withdrawing blocks",
    ).toBe(true);
  });

  it("TodaySession applies it on the block_object path", () => {
    // Source-mirror. The defect was a whole read path not calling the filter,
    // which no behavioural test on the filter itself can detect.
    const src = fs.readFileSync(
      path.resolve(__dirname, "../../components/session/TodaySession.tsx"),
      "utf8",
    );
    const branch = src.slice(
      src.indexOf("if (blockObjectOn && p.slug)"),
      src.indexOf("// Legacy path."),
    );
    expect(branch.length, "the block_object branch moved").toBeGreaterThan(0);
    expect(
      branch,
      "block_object path no longer softens — the safety rule is inert again for ~every user",
    ).toContain("applyProgramSoftening");
    expect(
      branch,
      "scheduled[] must be filtered to match, or Skip/Move offers verbs for a withdrawn block",
    ).toContain("softened.some");
  });
});
