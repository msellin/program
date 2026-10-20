import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { applyProgramExerciseOverrides } from "@/lib/data-loader";
import type { Exercise, Program } from "@/lib/schemas";
import { buildSteps, type FollowInput } from "./steps";

const DATA = path.resolve(__dirname, "../../../public/data");
const lib = JSON.parse(fs.readFileSync(path.join(DATA, "exercises.json"), "utf8")) as { exercises: Exercise[] };
const program = JSON.parse(fs.readFileSync(path.join(DATA, "programs/anterior-hip-rebuild.json"), "utf8")) as Program;
const byId = applyProgramExerciseOverrides(
  Object.fromEntries(lib.exercises.map((e) => [e.id, e])),
  program,
);
const home = program.blocks.find((b) => b.id === "block_a_home")!;
const inputs: FollowInput[] = home.items!.filter((i) => i.exercise_id).map((item) => ({
  blockId: home.id,
  exercise: byId[item.exercise_id!],
  item,
}));

describe("follow-along steps for the founder's home block", () => {
  const steps = buildSteps(inputs);
  const of = (id: string) => steps.filter((s) => s.exerciseId === id);

  it("interleaves left and right sets, with the programme's extra left set at the end", () => {
    // hip_flexor_iso_seated: 5×20 s per side, extra set left (exercise_overrides).
    const hf = of("hip_flexor_iso_seated");
    expect(hf.map((s) => s.side).join("")).toBe("LRLRLRLRLRL");
    expect(hf.every((s) => s.kind === "hold" && s.seconds === 20)).toBe(true);
    expect(hf.filter((s) => s.side === "L")).toHaveLength(6);
  });

  it("logs a per-side set once: both sides of set n share setIndex n-1, the extra set gets its own", () => {
    const hf = of("hip_flexor_iso_seated");
    expect(hf.map((s) => s.setIndex)).toEqual([0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5]);
  });

  it("treats a both-sides hold as one step per set", () => {
    const ad = of("adductor_iso_bent");
    expect(ad).toHaveLength(5);
    expect(ad.every((s) => s.side === "B" && s.kind === "hold")).toBe(true);
  });

  it("counts reps for rep work, and alternates the dead bug inside one set", () => {
    const db = of("dead_bug");
    expect(db).toHaveLength(3);
    expect(db.every((s) => s.side === "E" && s.kind === "reps" && s.reps === 6)).toBe(true);
    const gb = of("glute_bridge_single");
    expect(gb.map((s) => s.side).join("")).toBe("LRLRLRL"); // 3 per side + extra left
  });

  it("carries the 90/90 as optional and gives every illustrated exercise its figure", () => {
    expect(of("hip_switch_9090").every((s) => s.optional)).toBe(true);
    // No authored set count: the same default (3) the Brief shows.
    expect(of("hip_switch_9090")).toHaveLength(3);
    for (const s of steps) expect(s.figure, s.exerciseId).not.toBeNull();
  });

  it("rests briefly: 5 s to switch sides, longer between sets and exercises, none after the last", () => {
    const hf = of("hip_flexor_iso_seated");
    expect(hf[0].restSeconds).toBe(5);
    expect(hf[1].restSeconds).toBe(15);
    expect(steps[steps.length - 1].restSeconds).toBe(0);
  });
});
