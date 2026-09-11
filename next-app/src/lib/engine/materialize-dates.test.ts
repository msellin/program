import { describe, it, expect } from "vitest";
import { materializeBlocks } from "./materialize-blocks";
import type { Program } from "../schemas";

/**
 * Materialized blocks are keyed by the day the user is living in.
 *
 * `datesInRange` started its walk at LOCAL midnight —
 * `new Date(startISO + "T00:00:00")` — and then converted each step back
 * through `toISOString()`, which is UTC. Local in, UTC out, in one function.
 *
 * East of UTC those disagree by a day. In UTC+3, local midnight on the 11th is
 * 21:00 UTC on the 10th, so `datesInRange("2026-09-11", "2026-09-13")`
 * returned ["2026-09-10", "2026-09-11", "2026-09-12"]. **Every materialized
 * block was keyed a day early**, on the block-object WRITE path that
 * `StoreHydrator` enables for everyone who has not opted out — and
 * `blockInstanceId` embeds `plannedDate`, so the instance ids were wrong with
 * them.
 *
 * The assertion is on the BOUNDARY rather than on a mocked timezone: the first
 * materialized date must equal the requested start. Under the old code it was
 * the day before, in any timezone east of UTC, and identical in UTC — which is
 * why this survived: it is correct on a CI runner and wrong on the founder's
 * laptop and phone.
 */
const program = {
  slug: "test-program",
  phases: [
    {
      id: "phase_1",
      starts: "2026-09-11",
      ends: "2026-09-17",
      blocks: ["block_a"],
    },
  ],
  blocks: [{ id: "block_a", name: "Block A", category: "strength", frequency_per_week: 7 }],
  weekly_template: {
    week: [
      { day: "Mon", session: "block_a" },
      { day: "Tue", session: "block_a" },
      { day: "Wed", session: "block_a" },
      { day: "Thu", session: "block_a" },
      { day: "Fri", session: "block_a" },
      { day: "Sat", session: "block_a" },
      { day: "Sun", session: "block_a" },
    ],
  },
} as unknown as Program;

describe("materialization date keys", () => {
  it("never plans a block before the requested start date", () => {
    const blocks = materializeBlocks(program, "2026-09-11", "2026-09-13");
    expect(blocks.length, "no blocks materialized — fixture drifted from the schedule rules").toBeGreaterThan(0);

    const earliest = blocks
      .map((b) => (b as unknown as { planned_date: string }).planned_date)
      .sort()[0];
    expect(
      earliest,
      "a block is planned BEFORE the window opened — the UTC date shift is back",
    ).toBe("2026-09-11");
  });

  it("never plans one after the requested end date", () => {
    const blocks = materializeBlocks(program, "2026-09-11", "2026-09-13");
    const latest = blocks
      .map((b) => (b as unknown as { planned_date: string }).planned_date)
      .sort()
      .at(-1);
    expect(latest, "a block is planned after the window closed").toBe("2026-09-13");
  });

  it("instance ids carry the corrected date", () => {
    // `blockInstanceId` embeds `plannedDate`, so a shifted date produced
    // shifted ids — which is what makes this expensive to discover late:
    // the ids are what Skip and Move address.
    const blocks = materializeBlocks(program, "2026-09-11", "2026-09-11");
    for (const b of blocks) {
      expect((b as unknown as { id: string }).id).toContain("2026-09-11");
      expect((b as unknown as { id: string }).id).not.toContain("2026-09-10");
    }
  });
});
