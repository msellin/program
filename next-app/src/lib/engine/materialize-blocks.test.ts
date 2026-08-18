import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import type { Program, ScheduledBlock } from "../schemas";
import {
  blockInstanceId,
  materializeBlocks,
  mergeMaterialization,
  materializeLookahead,
} from "./materialize-blocks";

function loadProgram(slug: string): Program {
  const p = path.resolve(__dirname, "../../../public/data/programs", `${slug}.json`);
  const program = JSON.parse(fs.readFileSync(p, "utf8")) as Program;
  // The `slug` field isn't in the JSON — data-loader.ts tags it at fetch time.
  // Tests bypass that path, so replicate the tagging here.
  program.slug = slug;
  return program;
}

describe("blockInstanceId", () => {
  it("produces a stable, human-readable id", () => {
    expect(blockInstanceId("handstand-walk", "2026-08-18", "block_skill_A_kinoshita")).toBe(
      "handstand-walk:2026-08-18:block_skill_A_kinoshita",
    );
  });
});

describe("materializeBlocks", () => {
  it("emits blocks with state='planned' for a Handstand Walk phase", () => {
    const program = loadProgram("concurrent-strength-maintenance");
    const phase = program.phases[0];
    const start = phase.starts;
    const end = new Date(new Date(phase.starts + "T00:00:00").getTime() + 6 * 864e5)
      .toISOString()
      .slice(0, 10); // 1 week window
    const blocks = materializeBlocks(program, start, end);
    // Some blocks scheduled in the week (rest days won't emit)
    expect(blocks.length).toBeGreaterThan(0);
    for (const b of blocks) {
      expect(b.state).toBe("planned");
      expect(b.program_slug).toBe("concurrent-strength-maintenance");
      expect(b.actual_date).toBe(b.planned_date);
      expect(b.id).toBe(
        blockInstanceId("concurrent-strength-maintenance", b.planned_date, b.block_template_id),
      );
    }
  });

  it("is deterministic — same window twice → same block ids", () => {
    const program = loadProgram("concurrent-strength-maintenance");
    const phase = program.phases[0];
    const start = phase.starts;
    const end = new Date(new Date(phase.starts + "T00:00:00").getTime() + 13 * 864e5)
      .toISOString()
      .slice(0, 10);
    const a = materializeBlocks(program, start, end);
    const b = materializeBlocks(program, start, end);
    const idsA = a.map((x) => x.id).sort();
    const idsB = b.map((x) => x.id).sort();
    expect(idsA).toEqual(idsB);
  });

  it("returns [] for a window before the program starts", () => {
    const program = loadProgram("concurrent-strength-maintenance");
    const beforeStart = new Date(new Date(program.phases[0].starts + "T00:00:00").getTime() - 30 * 864e5)
      .toISOString()
      .slice(0, 10);
    const beforeEnd = new Date(new Date(program.phases[0].starts + "T00:00:00").getTime() - 24 * 864e5)
      .toISOString()
      .slice(0, 10);
    const blocks = materializeBlocks(program, beforeStart, beforeEnd);
    expect(blocks).toEqual([]);
  });
});

describe("mergeMaterialization", () => {
  it("overwrites planned blocks with fresh planned blocks (idempotent regen)", () => {
    const b1: ScheduledBlock = {
      id: "x:2026-01-01:foo",
      program_slug: "x",
      block_template_id: "foo",
      planned_date: "2026-01-01",
      actual_date: "2026-01-01",
      state: "planned",
    };
    const merged = mergeMaterialization({ "x:2026-01-01:foo": b1 }, [b1]);
    expect(merged["x:2026-01-01:foo"]).toEqual(b1);
  });

  it("preserves user state (done / skipped / moved) against a fresh planned overwrite", () => {
    const doneBlock: ScheduledBlock = {
      id: "x:2026-01-01:foo",
      program_slug: "x",
      block_template_id: "foo",
      planned_date: "2026-01-01",
      actual_date: "2026-01-01",
      state: "done",
      completed_at: "2026-01-01T09:00:00Z",
    };
    const freshPlanned: ScheduledBlock = { ...doneBlock, state: "planned", completed_at: undefined };
    const merged = mergeMaterialization({ "x:2026-01-01:foo": doneBlock }, [freshPlanned]);
    expect(merged["x:2026-01-01:foo"].state).toBe("done");
    expect(merged["x:2026-01-01:foo"].completed_at).toBe("2026-01-01T09:00:00Z");
  });

  it("adds brand-new fresh blocks that don't exist in `existing`", () => {
    const fresh: ScheduledBlock = {
      id: "x:2026-01-02:foo",
      program_slug: "x",
      block_template_id: "foo",
      planned_date: "2026-01-02",
      actual_date: "2026-01-02",
      state: "planned",
    };
    const merged = mergeMaterialization(undefined, [fresh]);
    expect(merged["x:2026-01-02:foo"]).toEqual(fresh);
  });
});

describe("materializeLookahead", () => {
  it("extends materialization by lookaheadDays and reports the reached end date", () => {
    const program = loadProgram("concurrent-strength-maintenance");
    const start = program.phases[0].starts;
    const result = materializeLookahead(program, start, 7, undefined);
    const expectedEnd = new Date(new Date(start + "T00:00:00").getTime() + 7 * 864e5)
      .toISOString()
      .slice(0, 10);
    expect(result.materializedThrough).toBe(expectedEnd);
    expect(Object.keys(result.blocks).length).toBeGreaterThan(0);
  });
});
