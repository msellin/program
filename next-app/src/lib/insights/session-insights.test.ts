import { describe, it, expect } from "vitest";
import { sessionInsights, type InsightExercise } from "./session-insights";
import type { Store } from "@/lib/schemas";

const ex = (id: string, name: string, loadable = true): InsightExercise => ({
  key: `b:${id}`, exerciseId: id, name, isLoadable: loadable, planned: true,
});
const log = (sets: Array<[number, number, number?]>) => ({
  done: true, weight_kg: null, reps: null, notes: "",
  sets: sets.map(([weight_kg, reps, rpe]) => ({ weight_kg, reps, rpe: rpe ?? null })),
});
const mk = (logs: Record<string, Record<string, unknown>>, tms = {}) =>
  ({ logs: Object.fromEntries(Object.entries(logs).map(([d, e]) => [d, { date: d, exercises: e }])), training_maxes: tms }) as unknown as Store;

describe("sessionInsights", () => {
  it("says all-Easy sets with percent of working max", () => {
    const s = mk({ "2026-10-29": { "b:front_squat": log([[80, 5, 6], [80, 5, 6], [80, 5, 5], [80, 5, 6], [80, 5, 6]]) } }, { front_squat: 108 });
    expect(sessionInsights([ex("front_squat", "Front squat")], s, "2026-10-29")).toEqual([
      "Front squat: all 5 sets Easy at 80 kg (74% of your working max)",
    ]);
  });
  it("counts extra reps at the same weight vs last time", () => {
    const s = mk({
      "2026-10-20": { "b:back_squat": log([[110, 5, 8]]) },
      "2026-10-29": { "b:back_squat": log([[110, 7, 9]]) },
    });
    expect(sessionInsights([ex("back_squat", "Back squat")], s, "2026-10-29")).toEqual([
      "Back squat 110 × 7: 2 more reps than last time at this weight",
    ]);
  });
  it("skips a comparison at a different weight and Easy without a max", () => {
    const s = mk({
      "2026-10-20": { "b:back_squat": log([[100, 5]]) },
      "2026-10-29": { "b:back_squat": log([[110, 7, 6], [110, 7, 6], [110, 7, 6]]) },
    });
    expect(sessionInsights([ex("back_squat", "Back squat")], s, "2026-10-29")).toEqual([]);
  });
  it("names exercises not logged, and caps at 3 lines", () => {
    const s = mk({ "2026-10-29": { "b:a": log([[50, 5]]) } });
    const out = sessionInsights([ex("a", "A"), ex("b", "Split squat"), ex("c", "Nordic curl")], s, "2026-10-29");
    expect(out).toEqual(["1 of 3 exercises logged — Split squat, Nordic curl not logged"]);
  });
  it("names two missing exercises at most", () => {
    const s = mk({ "2026-10-29": { "b:a": log([[50, 5]]) } });
    const out = sessionInsights(
      [ex("a", "A"), ex("b", "B"), ex("c", "C"), ex("d", "D"), ex("e", "E")],
      s,
      "2026-10-29",
    );
    expect(out).toEqual(["1 of 5 exercises logged — B, C and 2 more not logged"]);
  });
  it("says nothing when everything was logged and nothing is provable", () => {
    const s = mk({ "2026-10-29": { "b:a": log([[50, 5]]) } });
    expect(sessionInsights([ex("a", "A")], s, "2026-10-29")).toEqual([]);
  });
});
