import { describe, it, expect } from "vitest";
import { checkTrainingMaxes, bestEstimatedOneRM, estimateOneRM } from "./tm-plausibility";
import type { Store, DayLog } from "../schemas";

/**
 * Built from the founder's real 2026-09 data. His front-squat TM was 110 —
 * identical to his back-squat TM and above the single he could demonstrate —
 * and nothing checked. It surfaced only because he went to a gym, worked to
 * 115, missed 120, and said so.
 */
function log(date: string, key: string, sets: Array<[number, number]>): DayLog {
  return {
    date, notes: "", symptoms: null, derived_state: null,
    exercises: { [key]: { done: true, weight_kg: null, reps: null, notes: "",
      sets: sets.map(([weight_kg, reps]) => ({ weight_kg, reps, rpe: null })) } },
  } as unknown as DayLog;
}
const store = (tms: Record<string, number>, days: DayLog[]) =>
  ({ version: 2, training_maxes: tms, cycle: {},
     logs: Object.fromEntries(days.map((d) => [d.date, d])) } as unknown as Store);

describe("estimateOneRM", () => {
  it("refuses rep counts the formula cannot carry", () => {
    // Epley degrades past ~12. Extrapolating a 20-rep set into a single is
    // how a plausibility check becomes the thing that needs checking.
    expect(estimateOneRM(60, 20)).toBeNull();
    expect(estimateOneRM(0, 5)).toBeNull();
    expect(estimateOneRM(100, 5)).toBeCloseTo(116.7, 1);
  });

  it("treats a single as the max itself, not Epley's inflated version", () => {
    // Epley returns w × (1 + 1/30) at one rep — 3.3% high. That error runs
    // the wrong way here: it raises the bar a TM must clear before the check
    // says anything, and it hid the founder's own front squat.
    expect(estimateOneRM(115, 1)).toBe(115);
  });
});

describe("bestEstimatedOneRM", () => {
  it("prefers a measured top single over an extrapolated double", () => {
    // The founder's ladder. Epley reads 110×2 as 117.3 — above the 115 he
    // lifted and below the 120 he missed. The measurement wins.
    const s = store({}, [log("2026-09-01", "b:front_squat", [[110, 2], [115, 1]])]);
    const best = bestEstimatedOneRM(s.logs, "front_squat")!;
    expect(best.e1rm).toBe(115);
    expect(best.reps).toBe(1);
  });

  it("ignores a warm-up single lighter than the working sets", () => {
    // Otherwise a 60 kg opener would cap the estimate under a 110 double and
    // the check would go quiet on exactly the lifts it exists for.
    const s = store({}, [log("2026-09-01", "b:front_squat", [[60, 1], [110, 2]])]);
    expect(bestEstimatedOneRM(s.logs, "front_squat")!.reps).toBe(2);
  });

  it("takes the best set across the whole log, not the most recent", () => {
    const s = store({}, [
      log("2026-08-20", "b:back_squat_highbar", [[115, 5]]),
      log("2026-08-31", "b:back_squat_highbar", [[95, 9]]),
    ]);
    expect(bestEstimatedOneRM(s.logs, "back_squat_highbar")!.weightKg).toBe(115);
  });

  it("returns null for a lift with no logged sets", () => {
    expect(bestEstimatedOneRM({}, "front_squat")).toBeNull();
  });
});

describe("checkTrainingMaxes", () => {
  it("flags the founder's real front squat ladder", () => {
    // 80×3 90×3 100×3 105×2 110×2 115×1, 120 failed. The single is the max.
    // TM 110 is 95.7% of it; convention puts a training max near 103.5.
    const s = store({ front_squat: 110 }, [
      log("2026-09-01", "b:front_squat", [[100, 3], [110, 2], [115, 1]]),
    ]);
    const f = checkTrainingMaxes(s);
    expect(f).toHaveLength(1);
    expect(f[0].kind).toBe("above_demonstrated");
    expect(f[0].suggestedTM).toBe(103.5);
  });

  it("flags a TM above what a volume day can evidence", () => {
    const s = store({ front_squat: 110 }, [log("2026-09-03", "b:front_squat", [[80, 9]])]);
    const f = checkTrainingMaxes(s);
    expect(f).toHaveLength(1);
    expect(f[0].kind).toBe("above_demonstrated");
    expect(f[0].suggestedTM).toBeCloseTo(93.5, 1);
  });

  it("flags a TM far below what the log can evidence — the back squat case", () => {
    // 115x5 at RPE 8-9, repeatedly, against a TM of 110. This is why a "5+"
    // top set came back at 9 reps.
    const s = store({ back_squat_highbar: 100 }, [
      log("2026-08-20", "b:back_squat_highbar", [[115, 5]]),
    ]);
    const f = checkTrainingMaxes(s);
    expect(f[0].kind).toBe("far_below_demonstrated");
    expect(f[0].suggestedTM).toBe(121);
  });

  it("says nothing when the TM sits where convention puts it", () => {
    // 140x5 -> ~163 single, TM 145 is 89% of it. Correct, and silence is the
    // right output — a checker that flags everything gets ignored.
    const s = store({ block_pull_midshin: 145 }, [
      log("2026-08-24", "b:block_pull_midshin", [[140, 5]]),
    ]);
    expect(checkTrainingMaxes(s)).toEqual([]);
  });

  it("flags two squat TMs sharing a number as a copied value", () => {
    const s = store({ back_squat_highbar: 110, front_squat: 110 }, []);
    const f = checkTrainingMaxes(s);
    expect(f).toHaveLength(1);
    expect(f[0].kind).toBe("sibling_identical");
    expect(f[0].suggestedTM).toBeCloseTo(93.5, 1);
  });

  it("does not flag a sibling pair at a sensible ratio", () => {
    const s = store({ back_squat_highbar: 120, front_squat: 102 }, []);
    expect(checkTrainingMaxes(s)).toEqual([]);
  });

  it("stays quiet on a lift with no logged history", () => {
    // A new user's intake TM is an estimate, not a claim contradicted by
    // evidence. Nagging before there is any data is how a warning gets
    // dismissed permanently on day one.
    expect(checkTrainingMaxes(store({ front_squat: 110 }, []))).toEqual([]);
  });

  it("reproduces the founder's real store: the front squat and the copied pair", () => {
    const s = store({ front_squat: 110, back_squat_highbar: 110 }, [
      log("2026-08-20", "b:back_squat_highbar", [[115, 5]]),
      log("2026-09-03", "b:front_squat", [[80, 9]]),
    ]);
    const kinds = checkTrainingMaxes(s).map((f) => f.kind).sort();
    expect(kinds).toEqual(["above_demonstrated", "sibling_identical"]);
  });

  it("leaves a conservative-but-defensible TM alone", () => {
    // The founder's back squat: TM 110 against a demonstrated ~134 single is
    // 82% — under the 85-90% convention, and deliberately NOT flagged. He is
    // returning from a hip issue, where conservative is the point. Warning on
    // every cautious number is how a checker earns a permanent dismissal.
    const s = store({ back_squat_highbar: 110 }, [
      log("2026-08-20", "b:back_squat_highbar", [[115, 5]]),
    ]);
    expect(checkTrainingMaxes(s)).toEqual([]);
  });
});
