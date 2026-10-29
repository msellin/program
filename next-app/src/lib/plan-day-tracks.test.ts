import { describe, expect, it } from "vitest";
import { dayTracks } from "./plan-day-tracks";
import type { DayLog, ScheduledBlock } from "./schemas";

const HIP = "anterior-hip-rebuild";
const OHM = "overhead-mobility";
const DATE = "2026-10-26";

function block(slug: string, tpl: string, state: ScheduledBlock["state"] = "planned"): ScheduledBlock {
  return {
    id: `${slug}:${DATE}:${tpl}`,
    program_slug: slug,
    block_template_id: tpl,
    planned_date: DATE,
    actual_date: DATE,
    state,
  } as ScheduledBlock;
}

function log(keys: string[]): DayLog {
  return {
    date: DATE,
    exercises: Object.fromEntries(keys.map((k) => [k, { done: true }])),
    symptoms: null,
    derived_state: null,
    notes: "",
  } as unknown as DayLog;
}

const base = {
  activeSlugs: [HIP, OHM],
  displayBlocks: [
    { id: "heavy_squat_day", programSlug: HIP },
    { id: "thoracic_prep", programSlug: OHM },
  ],
  blocksByProgram: {
    [HIP]: [block(HIP, "heavy_squat_day")],
    [OHM]: [block(OHM, "thoracic_prep")],
  },
  names: { [HIP]: "Anterior Hip Rebuild", [OHM]: "Overhead Mobility" },
};

describe("dayTracks", () => {
  it("reads a track done from the log even when its block state was never flipped (founder's Mon back squat)", () => {
    const t = dayTracks({ ...base, dayLog: log(["heavy_squat_day:back_squat_highbar"]), isPast: true });
    expect(t.map((x) => [x.name, x.state])).toEqual([
      ["Anterior Hip Rebuild", "done"],
      ["Overhead Mobility", "notLogged"],
    ]);
  });

  it("matches log keys written under the scheduled instance id too", () => {
    const t = dayTracks({ ...base, dayLog: log([`${OHM}:${DATE}:thoracic_prep:wall_slide`]), isPast: true });
    expect(t.find((x) => x.slug === OHM)?.state).toBe("done");
  });

  it("never says planned on a past day with nothing logged", () => {
    const t = dayTracks({ ...base, dayLog: undefined, isPast: true });
    expect(t.every((x) => x.state === "notLogged")).toBe(true);
  });

  it("says planned on a future day", () => {
    const t = dayTracks({ ...base, dayLog: undefined, isPast: false });
    expect(t.every((x) => x.state === "planned")).toBe(true);
  });

  it("keeps a skipped track visible as skipped", () => {
    const t = dayTracks({
      ...base,
      displayBlocks: [base.displayBlocks[0]],
      blocksByProgram: { ...base.blocksByProgram, [OHM]: [block(OHM, "thoracic_prep", "skipped")] },
      dayLog: undefined,
      isPast: false,
    });
    expect(t.find((x) => x.slug === OHM)?.state).toBe("skipped");
  });

  it("omits programmes with nothing on the day and falls back to a title-cased slug", () => {
    const t = dayTracks({
      ...base,
      activeSlugs: [HIP, OHM, "engine-builder"],
      names: {},
      dayLog: undefined,
      isPast: false,
    });
    expect(t.map((x) => x.name)).toEqual(["Anterior Hip Rebuild", "Overhead Mobility"]);
  });
});
