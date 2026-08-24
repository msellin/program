import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import {
  isOffPlanOn,
  hasOffPlanSetting,
  offPlanUsageDays,
  shouldGrandfatherOffPlan,
  OFF_PLAN_GRANDFATHER_MIN_DAYS,
} from "./features";
import type { Program, Store } from "./schemas";

function loadProgram(slug: string): Program {
  const p = path.resolve(__dirname, "../../public/data/programs", `${slug}.json`);
  const parsed = JSON.parse(fs.readFileSync(p, "utf8")) as Program;
  parsed.slug = slug; // Mirrors lib/data-loader.ts.
  return parsed;
}

const hip = loadProgram("anterior-hip-rebuild");
const offPlanBlock = hip.blocks.find((b) => b.category === "accessory" || b.category === "run")!;
const strengthBlock = hip.blocks.find((b) => (b.category ?? "strength") === "strength")!;

function storeWithDays(entries: Array<{ date: string; blockId: string; logged?: boolean }>): Store {
  const logs: Store["logs"] = {};
  for (const e of entries) {
    logs[e.date] = {
      exercises: {
        [`${e.blockId}:some_exercise`]:
          e.logged === false
            ? { sets: [{ weight_kg: null, reps: null, rpe: null }] }
            : { sets: [{ weight_kg: 20, reps: 10, rpe: null }] },
      },
    } as unknown as Store["logs"][string];
  }
  return { logs, training_maxes: {} } as unknown as Store;
}

describe("isOffPlanOn / hasOffPlanSetting", () => {
  it("treats an undefined flag as off and as never-set", () => {
    const store = { logs: {}, training_maxes: {} } as unknown as Store;
    expect(isOffPlanOn(store)).toBe(false);
    // The distinction that matters: a new account gets no Settings row at
    // all, so the feature is invisible rather than merely off.
    expect(hasOffPlanSetting(store)).toBe(false);
  });

  it("keeps the Settings row once the flag exists, even when turned off", () => {
    const store = { logs: {}, training_maxes: {}, feature_flags: { off_plan: false } } as unknown as Store;
    expect(isOffPlanOn(store)).toBe(false);
    // The PWA has no URL bar — without this the user could never get back.
    expect(hasOffPlanSetting(store)).toBe(true);
  });
});

describe("offPlanUsageDays", () => {
  it("counts only days with logged work against an off-plan block", () => {
    const store = storeWithDays([
      { date: "2026-08-01", blockId: offPlanBlock.id },
      { date: "2026-08-02", blockId: strengthBlock.id }, // scheduled work, not off-plan
      { date: "2026-08-03", blockId: offPlanBlock.id },
    ]);
    expect(offPlanUsageDays(store, [hip])).toBe(2);
  });

  it("ignores an off-plan entry that was opened but never logged", () => {
    const store = storeWithDays([{ date: "2026-08-01", blockId: offPlanBlock.id, logged: false }]);
    expect(offPlanUsageDays(store, [hip])).toBe(0);
  });

  it("returns 0 when the program has no off-plan blocks", () => {
    const rowing = loadProgram("rowing-2k-test-prep");
    const store = storeWithDays([{ date: "2026-08-01", blockId: offPlanBlock.id }]);
    // Block ids from a program the user never ran can't be theirs.
    expect(offPlanUsageDays(store, [rowing])).toBe(0);
  });
});

describe("shouldGrandfatherOffPlan", () => {
  const days = (n: number) =>
    storeWithDays(
      Array.from({ length: n }, (_, i) => ({
        date: `2026-08-${String(i + 1).padStart(2, "0")}`,
        blockId: offPlanBlock.id,
      })),
    );

  it("grandfathers an account that actually used off-plan", () => {
    expect(shouldGrandfatherOffPlan(days(OFF_PLAN_GRANDFATHER_MIN_DAYS), [hip])).toBe(true);
  });

  it("does NOT grandfather an incidental single tap during beta", () => {
    expect(shouldGrandfatherOffPlan(days(OFF_PLAN_GRANDFATHER_MIN_DAYS - 1), [hip])).toBe(false);
  });

  it("never overrides a deliberate Settings choice", () => {
    const store = days(10);
    store.feature_flags = { off_plan: false };
    expect(shouldGrandfatherOffPlan(store, [hip])).toBe(false);
  });
});
