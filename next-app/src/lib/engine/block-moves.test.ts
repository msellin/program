import { describe, expect, it } from "vitest";
import type { ScheduledBlock } from "../schemas";
import { getBlocksForDate, DAY_VISIBLE_BLOCK_STATES } from "./block-selectors";
import { moveDayBlocks, restoreDayBlocks } from "./block-moves";

const blk = (id: string, date: string, tpl: string, state: ScheduledBlock["state"] = "planned"): ScheduledBlock =>
  ({
    id,
    program_slug: "handstand-walk",
    block_template_id: tpl,
    planned_date: date,
    actual_date: date,
    state,
  }) as ScheduledBlock;

const map = (...bs: ScheduledBlock[]) => Object.fromEntries(bs.map((b) => [b.id, b]));
const onDay = (blocks: Record<string, ScheduledBlock>, d: string) =>
  getBlocksForDate({ scheduled_blocks: blocks } as never, d, { states: DAY_VISIBLE_BLOCK_STATES }).map((b) => b.id);

describe("moveDayBlocks", () => {
  it("moves the day's planned blocks so Today's selector finds them on the new date", () => {
    const blocks = map(blk("a", "2026-10-30", "warm"), blk("b", "2026-10-30", "wall"), blk("c", "2026-11-01", "wall"));
    const { blocks: out, moved } = moveDayBlocks(blocks, "2026-10-30", "2026-10-29", ["warm", "wall"], "moved from 2026-10-30", "t");
    expect(moved).toBe(2);
    expect(onDay(out, "2026-10-29").sort()).toEqual(["a", "b"]);
    expect(onDay(out, "2026-10-30")).toEqual([]);
    expect(out.c.actual_date).toBe("2026-11-01");
    expect(out.a.move_history?.[0]).toMatchObject({ from: "2026-10-30", to: "2026-10-29" });
  });
  it("moves only the named templates, and the whole day when none match", () => {
    const blocks = map(blk("a", "2026-10-30", "warm"), blk("b", "2026-10-30", "wall"));
    expect(moveDayBlocks(blocks, "2026-10-30", "2026-10-29", ["wall"], "r", "t").blocks.a.actual_date).toBe("2026-10-30");
    expect(moveDayBlocks(blocks, "2026-10-30", "2026-10-29", ["x"], "r", "t").moved).toBe(2);
  });
  it("leaves done and skipped blocks alone", () => {
    const blocks = map(blk("a", "2026-10-30", "warm", "done"), blk("b", "2026-10-30", "wall", "skipped"));
    expect(moveDayBlocks(blocks, "2026-10-30", "2026-10-29", [], "r", "t").moved).toBe(0);
  });
});

describe("restoreDayBlocks", () => {
  const moved = () => moveDayBlocks(map(blk("a", "2026-10-30", "wall")), "2026-10-30", "2026-10-29", [], "r", "t").blocks;
  it("undoes a move from the source date (Unskip)", () => {
    const out = restoreDayBlocks(moved(), "2026-10-30").blocks;
    expect(out.a).toMatchObject({ state: "planned", actual_date: "2026-10-30", move_history: [] });
  });
  it("undoes a move from the destination date (Plan's Undo move)", () => {
    expect(restoreDayBlocks(moved(), "2026-10-29").blocks.a).toMatchObject({ state: "planned", actual_date: "2026-10-30" });
  });
  it("unskips a skipped day and never touches done blocks", () => {
    const blocks = map(blk("a", "2026-10-30", "wall", "skipped"), blk("b", "2026-10-30", "warm", "done"));
    const out = restoreDayBlocks(blocks, "2026-10-30");
    expect(out.restored).toBe(1);
    expect(out.blocks.a.state).toBe("planned");
    expect(out.blocks.b.state).toBe("done");
  });
});
