import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { programSchema, type Program, type Store } from "../schemas";
import { redDayDirective } from "./red-day";

const DATA = join(__dirname, "../../../public/data");
const manifest = JSON.parse(readFileSync(join(DATA, "programs/manifest.json"), "utf8")) as {
  programs: { id: string; slug?: string }[];
};
const programs = manifest.programs.map((p) => ({
  id: p.id,
  program: programSchema.parse(
    JSON.parse(readFileSync(join(DATA, `programs/${p.slug ?? p.id}.json`), "utf8")),
  ),
}));

type Log = Store["logs"][string];
const row = (derived_state: Log["derived_state"], symptoms: Partial<Log["symptoms"]> = null): Log =>
  ({ exercises: {}, symptoms, derived_state, notes: "" }) as unknown as Log;

const pullup = programs.find((p) => p.id === "first-strict-pullup")!.program as Program;

describe("red_day (G-07): every program says what a red day becomes", () => {
  it.each(programs.map((p) => p.id))("%s declares red_day and its blocks resolve", (id) => {
    const program = programs.find((p) => p.id === id)!.program;
    expect(program.red_day, `${id} has no red_day`).toBeDefined();
    const blockIds = new Set(program.blocks.map((b) => b.id));
    for (const b of program.red_day!.alternative_block_ids) expect(blockIds, `${id} :: ${b}`).toContain(b);
  });
});

describe("redDayDirective", () => {
  it("does not hold on green, amber, or no check", () => {
    expect(redDayDirective(pullup, {}, "2026-10-27")).toEqual({ hold: false });
    expect(redDayDirective(pullup, { "2026-10-27": row("amber") }, "2026-10-27")).toEqual({ hold: false });
    expect(redDayDirective(pullup, { "2026-10-27": row("green") }, "2026-10-27")).toEqual({ hold: false });
  });

  it("holds on red and offers the program's alternative blocks", () => {
    const d = redDayDirective(pullup, { "2026-10-27": row("red", { elbow: 7 }) }, "2026-10-27");
    expect(d.hold).toBe(true);
    if (!d.hold) return;
    expect(d.redFlag).toBe(false);
    expect(d.reason).toMatch(/above 5\/10/);
    expect(d.alternative?.blocks.map((b) => b.id)).toEqual(["block_shoulder_prep", "block_active_hollow"]);
  });

  it("carries a red check forward up to 3 days, and no further", () => {
    const logs = { "2026-10-24": row("red", { elbow: 7 }) };
    const d = redDayDirective(pullup, logs, "2026-10-27");
    expect(d.hold && d.sourceDate).toBe("2026-10-24");
    expect(redDayDirective(pullup, logs, "2026-10-28")).toEqual({ hold: false });
  });

  it("a newer green check clears an older red", () => {
    const logs = { "2026-10-26": row("red", { elbow: 7 }), "2026-10-27": row("green") };
    expect(redDayDirective(pullup, logs, "2026-10-27")).toEqual({ hold: false });
  });

  it("a red flag offers rest only, never a training alternative", () => {
    const d = redDayDirective(pullup, { "2026-10-27": row("red", { night_pain: true }) }, "2026-10-27");
    expect(d.hold && d.redFlag).toBe(true);
    expect(d.hold && d.alternative).toBeNull();
  });
});
