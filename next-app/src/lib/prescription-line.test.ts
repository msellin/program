import { describe, it, expect } from "vitest";
import { authoredDose, prescriptionLine } from "@/lib/prescription-line";
import type { RailExercise } from "@/components/session/DaySession";
import type { Store } from "@/lib/schemas";

const rail = (exercise: Record<string, unknown>, item: Record<string, unknown>, rowCount: number) =>
  ({ exercise, item, rowCount, schemeRowCount: rowCount, suggestion: null, isLoadable: false }) as unknown as RailExercise;
const store = { version: 2, logs: {}, training_maxes: {} } as unknown as Store;

describe("prescriptionLine", () => {
  it("names the distance for a sled push instead of a bare set count", () => {
    const r = rail({ id: "sled_push", default: { sets: 6, distance_m: 20 } }, { exercise_id: "sled_push" }, 6);
    expect(authoredDose(r).kind).toBe("distance");
    expect(prescriptionLine(r, store, "2026-10-29")).toBe("6 × 20 m");
  });

  it("keeps reps when both reps and a distance are authored", () => {
    const r = rail({ id: "x", default: { reps: 8, distance_m: 20 } }, { exercise_id: "x" }, 3);
    expect(prescriptionLine(r, store, "2026-10-29")).toBe("3×8");
  });
});
