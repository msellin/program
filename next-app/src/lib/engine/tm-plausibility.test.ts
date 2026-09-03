import { describe, it, expect } from "vitest";
import {
  checkTrainingMaxes,
  bestEstimatedOneRM,
  bestFailedAttempt,
  estimateOneRM,
} from "./tm-plausibility";
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
/**
 * Same shape, but each set carries a `failed` flag. Separate helper rather
 * than a third tuple slot on `log` so the twenty existing cases stay
 * readable — a miss is the unusual case, not the default.
 */
function logWithMisses(
  date: string,
  key: string,
  sets: Array<[number, number, boolean?]>,
): DayLog {
  return {
    date, notes: "", symptoms: null, derived_state: null,
    exercises: { [key]: { done: true, weight_kg: null, reps: null, notes: "",
      sets: sets.map(([weight_kg, reps, failed]) => ({
        weight_kg, reps, rpe: null, ...(failed ? { failed: true } : {}),
      })) } },
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
  it("does not treat a mid-ladder single as a ceiling", () => {
    // The founder made 115×1 and then attempted 122, so 115 was the last rung
    // he made rather than his max. Epley reads his 110×2 as 117.3, inside the
    // real [115, 122) window. Taking the lower number understated him and
    // fired the check on a defensible training max.
    const s = store({}, [log("2026-09-01", "b:front_squat", [[110, 2], [115, 1]])]);
    expect(bestEstimatedOneRM(s.logs, "front_squat")!.e1rm).toBeCloseTo(117.3, 1);
  });

  it("still uses a top single when it beats every estimate", () => {
    const s = store({}, [log("2026-09-01", "b:front_squat", [[100, 3], [125, 1]])]);
    const best = bestEstimatedOneRM(s.logs, "front_squat")!;
    expect(best.e1rm).toBe(125);
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
  it("stays silent on the founder's real front squat ladder", () => {
    // 80×3 ... 110×2 115×1, then a failed 122. Best evidence is ~117.3, and
    // a 110 training max is 94% of it — high, inside the band, and not worth
    // a warning. The first version of this test asserted the opposite, from
    // a wrong number.
    const s = store({ front_squat: 110 }, [
      log("2026-09-01", "b:front_squat", [[100, 3], [110, 2], [115, 1]]),
    ]);
    expect(checkTrainingMaxes(s)).toEqual([]);
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

describe("bestFailedAttempt", () => {
  it("finds the missed load the founder's note used to hold", () => {
    // The whole point of the field. He worked to 115×1 and missed 122; before
    // this the log could see the 115 and had no idea the 122 existed.
    const s = store({}, [
      logWithMisses("2026-09-01", "b:front_squat", [[110, 2], [115, 1], [122, 0, true]]),
    ]);
    expect(bestFailedAttempt(s.logs, "front_squat")).toEqual({
      weightKg: 122,
      date: "2026-09-01",
    });
  });

  it("binds on the LIGHTEST miss, not the most recent or the heaviest", () => {
    // Missing 122 and later missing 130 does not raise the ceiling to 130.
    // You still have not lifted 122.
    const s = store({}, [
      logWithMisses("2026-09-01", "b:front_squat", [[122, 0, true]]),
      logWithMisses("2026-09-08", "b:front_squat", [[130, 0, true]]),
    ]);
    expect(bestFailedAttempt(s.logs, "front_squat")!.weightKg).toBe(122);
  });

  it("ignores misses older than the best made lift", () => {
    // A bad day two years ago must not cap every estimate forever. The
    // ceiling has to be able to move when the person does.
    const s = store({}, [
      logWithMisses("2024-01-01", "b:front_squat", [[100, 0, true]]),
      logWithMisses("2026-09-01", "b:front_squat", [[115, 1]]),
    ]);
    expect(bestFailedAttempt(s.logs, "front_squat", "2026-09-01")).toBeNull();
  });

  it("counts a miss from the same session as the made lift", () => {
    // This is the ladder case — both numbers come out of one session, so a
    // strict `>` on the date would discard exactly the pairing this exists
    // to read.
    const s = store({}, [
      logWithMisses("2026-09-01", "b:front_squat", [[115, 1], [122, 0, true]]),
    ]);
    expect(bestFailedAttempt(s.logs, "front_squat", "2026-09-01")!.weightKg).toBe(122);
  });

  it("does not mistake a plain 0-rep set for a miss", () => {
    // `failed` is the flag, not the rep count. A zero-rep row with no flag is
    // a logging artefact (SetView seeded 0 before 2026-08-25), not evidence.
    const s = store({}, [logWithMisses("2026-09-01", "b:front_squat", [[122, 0]])]);
    expect(bestFailedAttempt(s.logs, "front_squat")).toBeNull();
  });
});

describe("checkTrainingMaxes — against failed attempts", () => {
  it("flags a training max at or above a load the user could not lift once", () => {
    // Needs no estimate and no convention to be wrong. A TM is a working
    // weight for repeated sets; if a single at that load did not go up,
    // every prescription derived from it is fiction.
    const s = store({ front_squat: 125 }, [
      logWithMisses("2026-09-01", "b:front_squat", [[110, 5], [125, 0, true]]),
    ]);
    const f = checkTrainingMaxes(s).find((x) => x.liftId === "front_squat")!;
    expect(f.kind).toBe("above_failed_attempt");
    expect(f.message).toContain("missed 125 kg");
    // 90% of (125 − 2.5), rounded to the half kilo.
    expect(f.suggestedTM).toBe(110.5);
  });

  it("caps an Epley over-read so the check does not go silent", () => {
    // THE case the ceiling exists for. 100×10 reads as 133.3 through Epley,
    // so a 118 TM sits well under the 95% line (126.7) and nothing is said —
    // even though the user has demonstrably failed 120. Capped to 117.5 the
    // TM is above the estimate outright and the check speaks.
    //
    // 118 is deliberately BELOW the failed 120, so the certain
    // `above_failed_attempt` branch cannot fire and this proves the capping
    // path specifically.
    const s = store({ front_squat: 118 }, [
      logWithMisses("2026-09-01", "b:front_squat", [[100, 10], [120, 0, true]]),
    ]);
    const f = checkTrainingMaxes(s).find((x) => x.liftId === "front_squat")!;
    expect(f.kind).toBe("above_demonstrated");
    expect(f.message).toContain("missed 120 kg");
  });

  it("stays silent on the founder's real front squat", () => {
    // Regression guard on the handover's claim that this check is correctly
    // silent on all three of his lifts. 110×2 → Epley 117.3; the missed 122
    // caps at 119.5, which is above it, so the estimate is untouched and a
    // 110 TM sits at 94% — inside the band. If adding a ceiling had made
    // this fire, the ceiling would be wrong.
    const s = store({ front_squat: 110 }, [
      logWithMisses("2026-09-01", "b:front_squat", [[110, 2], [115, 1], [122, 0, true]]),
    ]);
    expect(checkTrainingMaxes(s).filter((x) => x.liftId === "front_squat")).toEqual([]);
  });

  it("does not read the missed load as a lift", () => {
    // The failure mode that would make this whole feature worse than the
    // free-text note: 122 flowing into the estimate as evidence of strength.
    // If it did, a 110 TM would look far BELOW a 122 max and the check would
    // tell him to add weight he has just proved he cannot lift.
    const s = store({ front_squat: 110 }, [
      logWithMisses("2026-09-01", "b:front_squat", [[115, 1], [122, 0, true]]),
    ]);
    expect(bestEstimatedOneRM(s.logs, "front_squat")!.e1rm).toBe(115);
    expect(checkTrainingMaxes(s).map((x) => x.kind)).not.toContain("far_below_demonstrated");
  });

  it("fires on a miss even with no made lift to estimate from", () => {
    const s = store({ front_squat: 130 }, [
      logWithMisses("2026-09-01", "b:front_squat", [[130, 0, true]]),
    ]);
    expect(checkTrainingMaxes(s)[0].kind).toBe("above_failed_attempt");
  });
});
