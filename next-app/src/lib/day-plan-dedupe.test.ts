import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { planDayItems } from "./day-format";

/**
 * One card per exercise per day, across every block scheduled on it.
 *
 * Found in the founder's own log for 2026-09-14: `block_a_home:dead_bug` and
 * `block_squat_heavy:dead_bug`, both marked done, three sets each. He did six
 * sets of dead bug because the app asked for them twice.
 *
 * `dedupeItems` had always collapsed repeats WITHIN a block — that is why the
 * heavy-squat day's A1 top set and A2 FSL show as one back-squat card. Nothing
 * did the same across blocks, and Monday schedules both the home rehab block
 * and the heavy squat block.
 */
const program = JSON.parse(
  fs.readFileSync(
    path.resolve(__dirname, "../../public/data/programs/anterior-hip-rebuild.json"),
    "utf8",
  ),
) as { blocks: { id: string; category?: string; items?: { exercise_id?: string; scheme?: string }[] }[] };

const blockById = Object.fromEntries(program.blocks.map((b) => [b.id, b]));
const all = () => true;

describe("a Monday scheduling home rehab and the heavy squat day", () => {
  const monday = [blockById["block_a_home"], blockById["block_squat_heavy"]];

  it("still contains the duplicate in the DATA — this is a render rule, not a data edit", () => {
    const raw = monday.flatMap((b) => (b.items ?? []).map((i) => i.exercise_id));
    expect(raw.filter((id) => id === "dead_bug").length).toBeGreaterThan(1);
  });

  it("renders dead bug exactly once", () => {
    const planned = planDayItems(monday, all);
    expect(planned.filter((p) => p.item.exercise_id === "dead_bug")).toHaveLength(1);
  });

  it("renders every exercise at most once", () => {
    const ids = planDayItems(monday, all).map((p) => p.item.exercise_id);
    expect(ids.length).toBe(new Set(ids).size);
  });

  it("keeps the first block's copy, so the rehab block still owns its warm-up work", () => {
    const planned = planDayItems(monday, all);
    const db = planned.find((p) => p.item.exercise_id === "dead_bug");
    expect(db?.blockId).toBe("block_a_home");
  });

  it("collapses the back squat's A1 top set and A2 FSL into one card", () => {
    const planned = planDayItems([blockById["block_squat_heavy"]], all);
    expect(planned.filter((p) => p.item.exercise_id === "back_squat_highbar")).toHaveLength(1);
  });

  it("merges the second scheme into the surviving card rather than dropping it", () => {
    const planned = planDayItems([blockById["block_squat_heavy"]], all);
    const bs = planned.find((p) => p.item.exercise_id === "back_squat_highbar");
    expect(bs?.item.scheme).toContain("FSL");
  });
});

describe("the filter is not a hiding place", () => {
  it("an unresolvable exercise_id cannot occupy the slot and mask a real duplicate", () => {
    const blocks = [
      { id: "b1", items: [{ exercise_id: "ghost" }, { exercise_id: "dead_bug" }] },
      { id: "b2", items: [{ exercise_id: "dead_bug" }] },
    ];
    const planned = planDayItems(blocks, (id) => id !== "ghost");
    expect(planned.map((p) => p.item.exercise_id)).toEqual(["dead_bug"]);
  });

  it("skips run blocks, which are logged as activities rather than sets", () => {
    const blocks = [{ id: "r", category: "run", items: [{ exercise_id: "easy_run" }] }];
    expect(planDayItems(blocks, all)).toHaveLength(0);
  });
});
