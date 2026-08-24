import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import {
  ensureMaterialized,
  slugsNeedingMaterialization,
  activeSlugsOf,
  LOOKAHEAD_DAYS,
  REFRESH_WHEN_RUNWAY_UNDER_DAYS,
} from "./ensure-materialized";
import { getBlocksForDate } from "./block-selectors";
import type { Program, Store } from "../schemas";

function loadProgram(slug: string): Program {
  const p = path.resolve(__dirname, "../../../public/data/programs", `${slug}.json`);
  const parsed = JSON.parse(fs.readFileSync(p, "utf8")) as Program;
  parsed.slug = slug; // Mirrors lib/data-loader.ts.
  return parsed;
}

const TODAY = "2026-08-24";
const PRIMARY = "anterior-hip-rebuild";
const SECOND = "concurrent-strength-maintenance";

function addDays(iso: string, n: number): string {
  return new Date(new Date(iso + "T00:00:00").getTime() + n * 864e5)
    .toISOString()
    .slice(0, 10);
}

const programs: Record<string, Program> = {
  [PRIMARY]: loadProgram(PRIMARY),
  [SECOND]: loadProgram(SECOND),
};

/** A store mid-life: primary materialized with runway, second just added. */
function storeWithSecondJustAdded(): Store {
  return {
    logs: {},
    training_maxes: {},
    user_profile: {
      active_program_id: PRIMARY,
      active_program_ids: [PRIMARY, SECOND],
      program_states: {},
    },
    program_materialization: {
      [PRIMARY]: {
        materialized_through: addDays(TODAY, 40),
        materialized_at: TODAY,
        materialization_seed: "",
      },
    },
    scheduled_blocks: {},
  } as unknown as Store;
}

describe("activeSlugsOf", () => {
  it("unions active_program_id and active_program_ids without duplicating", () => {
    expect(activeSlugsOf(storeWithSecondJustAdded())).toEqual([PRIMARY, SECOND]);
  });
});

describe("slugsNeedingMaterialization", () => {
  it("flags a program that has never been materialized", () => {
    // The reported bug: a track added after the one-shot migration ran had
    // no scheduled_blocks, so Plan listed it and Day couldn't see it.
    expect(slugsNeedingMaterialization(storeWithSecondJustAdded(), TODAY)).toEqual([SECOND]);
  });

  it("flags a program whose runway has run down", () => {
    const store = storeWithSecondJustAdded();
    store.program_materialization![SECOND] = {
      materialized_through: addDays(TODAY, REFRESH_WHEN_RUNWAY_UNDER_DAYS - 1),
      materialized_at: TODAY,
      materialization_seed: "",
    };
    expect(slugsNeedingMaterialization(store, TODAY)).toEqual([SECOND]);
  });

  it("is a no-op while every program still has runway", () => {
    const store = storeWithSecondJustAdded();
    store.program_materialization![SECOND] = {
      materialized_through: addDays(TODAY, REFRESH_WHEN_RUNWAY_UNDER_DAYS + 1),
      materialized_at: TODAY,
      materialization_seed: "",
    };
    expect(slugsNeedingMaterialization(store, TODAY)).toEqual([]);
  });
});

describe("ensureMaterialized", () => {
  it("gives a newly-added second track blocks Day can actually read", () => {
    const before = storeWithSecondJustAdded();
    const after = ensureMaterialized(before, programs, TODAY);
    expect(after).not.toBeNull();

    const secondBlocks = Object.values(after!.scheduled_blocks ?? {}).filter(
      (b) => b.program_slug === SECOND,
    );
    expect(secondBlocks.length).toBeGreaterThan(0);
    expect(after!.program_materialization?.[SECOND]?.materialized_through).toBe(
      addDays(TODAY, LOOKAHEAD_DAYS),
    );
  });

  it("leaves a program that still has runway untouched", () => {
    const before = storeWithSecondJustAdded();
    const after = ensureMaterialized(before, programs, TODAY)!;
    // Primary had 40 days of runway — it should not have been re-stamped.
    expect(after.program_materialization?.[PRIMARY]?.materialized_through).toBe(
      addDays(TODAY, 40),
    );
  });

  it("returns null when there is nothing to do, so no pointless store write", () => {
    const store = storeWithSecondJustAdded();
    store.program_materialization![SECOND] = {
      materialized_through: addDays(TODAY, LOOKAHEAD_DAYS),
      materialized_at: TODAY,
      materialization_seed: "",
    };
    expect(ensureMaterialized(store, programs, TODAY)).toBeNull();
  });

  it("never clobbers user state on blocks already logged or skipped", () => {
    // First pass materializes; mark one done, then re-materialize with the
    // runway wound back so the same window is regenerated.
    const first = ensureMaterialized(storeWithSecondJustAdded(), programs, TODAY)!;
    const someId = Object.keys(first.scheduled_blocks!).find(
      (id) => first.scheduled_blocks![id].program_slug === SECOND,
    )!;
    first.scheduled_blocks![someId] = { ...first.scheduled_blocks![someId], state: "done" };
    first.program_materialization![SECOND] = {
      materialized_through: TODAY,
      materialized_at: TODAY,
      materialization_seed: "",
    };

    const second = ensureMaterialized(first, programs, TODAY)!;
    expect(second.scheduled_blocks![someId].state).toBe("done");
  });

  it("skips a slug whose program JSON failed to load rather than blanking it", () => {
    const before = storeWithSecondJustAdded();
    const after = ensureMaterialized(before, { [PRIMARY]: programs[PRIMARY] }, TODAY);
    // Nothing was materializable, so no write at all — the next load retries.
    expect(after).toBeNull();
  });

  it("materialized blocks are visible through the same selector Day uses", () => {
    const after = ensureMaterialized(storeWithSecondJustAdded(), programs, TODAY)!;
    const secondBlocks = Object.values(after.scheduled_blocks ?? {}).filter(
      (b) => b.program_slug === SECOND,
    );
    const aDate = secondBlocks[0].actual_date;
    const viaSelector = getBlocksForDate(after, aDate, { slug: SECOND });
    expect(viaSelector.length).toBeGreaterThan(0);
  });
});
