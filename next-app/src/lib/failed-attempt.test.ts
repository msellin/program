import { describe, it, expect } from "vitest";
import { setLogSchema, storeSchema } from "./schemas";
import { isSetLogged, isFailedAttempt, isMadeSet, countLoggedSets } from "./set-progress";
import { isSetPR } from "./pr";
import { lastSessionSetsFor } from "./engine/history";
import { bestFailedAttempt } from "./engine/tm-plausibility";
import { computeReport } from "./engine/report";
import type { Program } from "./schemas";
import type { Store, SetLog } from "./schemas";

/**
 * A missed attempt is the only entry in a training log that bounds a one-rep
 * max from ABOVE. The founder made 115×1 on front squat and missed 122; the
 * 122 was the most informative number in the session and it sat in a
 * free-text note nothing read.
 *
 * This file guards the two ways that fix could go wrong.
 *
 * **Dead key.** Zod strips unknown keys silently, and this repo's
 * most-repeated defect is a field authored in good faith that nothing
 * consumes — `daily_log_schema` and `progression_rules.states[]` both shipped
 * that way and neither ever took effect. So: prove `failed` survives a parse,
 * and prove the engine reads it.
 *
 * **Sibling drift.** `reps: 0` flows into consumers that had no `> 0` guard.
 * Fixing `SetView` alone would have put a missed 122 on the clinical report
 * as a top set and seeded the next session's weight from a lift that never
 * happened.
 */

const set = (over: Partial<SetLog> = {}): SetLog =>
  ({ weight_kg: 100, reps: 5, rpe: null, ...over }) as SetLog;

const MISS = set({ weight_kg: 122, reps: 0, failed: true });
const MADE = set({ weight_kg: 115, reps: 1 });

describe("failed survives the schema", () => {
  it("is not stripped by setLogSchema", () => {
    // The whole feature is one boolean. If Zod drops it the UI still looks
    // right, the write still succeeds, and the engine silently never sees a
    // miss — the exact failure mode of the two dead keys above.
    expect(setLogSchema.parse({ weight_kg: 122, reps: 0, failed: true }).failed).toBe(true);
  });

  it("survives a full store round-trip", () => {
    const raw = {
      version: 2,
      training_maxes: { front_squat: 110 },
      cycle: { cycle_number: 1, week_in_cycle: 1, phase_id: "p1" },
      logs: {
        "2026-09-01": {
          date: "2026-09-01", notes: "", symptoms: null, derived_state: null,
          exercises: {
            "b:front_squat": {
              done: true, weight_kg: null, reps: null, notes: "",
              sets: [MADE, MISS],
            },
          },
        },
      },
    };
    const parsed = storeSchema.parse(raw) as unknown as Store;
    const sets = parsed.logs["2026-09-01"].exercises["b:front_squat"].sets!;
    expect(sets[1].failed).toBe(true);
    // And the engine reads it off the PARSED store, not a hand-built one.
    expect(bestFailedAttempt(parsed.logs, "front_squat")!.weightKg).toBe(122);
  });

  it("stays absent on ordinary sets rather than defaulting to false", () => {
    // Optional, not `.default(false)`. Multi-year history predates the field
    // and must not be rewritten into claiming every past set was checked.
    expect(setLogSchema.parse({ weight_kg: 100, reps: 5 }).failed).toBeUndefined();
  });
});

describe("a miss is logged work, but it is not a lift", () => {
  it("counts as a logged set", () => {
    // You loaded the bar and tried. The row is spent, the session advanced,
    // the pips must show it. `reps: 0` rather than `null` exists precisely so
    // the 42 call sites keyed on `reps != null` keep working.
    expect(isSetLogged(MISS, true)).toBe(true);
    expect(countLoggedSets([MADE, MISS], true)).toBe(2);
  });

  it("does not count as a made set", () => {
    expect(isFailedAttempt(MISS)).toBe(true);
    expect(isMadeSet(MISS, true)).toBe(false);
    expect(isMadeSet(MADE, true)).toBe(true);
  });

  it("is never a personal record", () => {
    // 122 is the heaviest number in the log and the one thing it is not is
    // an achievement.
    const s = { logs: {} } as unknown as Store;
    expect(isSetPR(s, "front_squat", 122, 0, "2026-09-02")).toBe(false);
  });

  it("is not offered as 'last time'", () => {
    // This feeds SetView's prefill chain. Seeding the next front squat
    // session at 122 — a weight he has just proved he cannot lift — would
    // make the miss actively harmful rather than merely unread.
    const s = {
      logs: {
        "2026-09-01": {
          date: "2026-09-01", notes: "", symptoms: null, derived_state: null,
          exercises: {
            "b:front_squat": { done: true, weight_kg: null, reps: null, notes: "", sets: [MADE, MISS] },
          },
        },
      },
    } as unknown as Store;
    const prev = lastSessionSetsFor(s, "front_squat", "2026-09-08")!;
    expect(prev.map((p) => p.weight_kg)).toEqual([115]);
  });
});

describe("the clinical report", () => {
  const storeWith = (sets: SetLog[]): Store =>
    ({
      version: 2,
      training_maxes: { front_squat: 110 },
      cycle: { cycle_number: 1, week_in_cycle: 1, phase_id: "p1" },
      logs: {
        "2026-09-01": {
          date: "2026-09-01", notes: "", symptoms: null, derived_state: null,
          exercises: {
            "b:front_squat": { done: true, weight_kg: null, reps: null, notes: "", sets },
          },
        },
      },
    }) as unknown as Store;

  const program = { id: "p", blocks: [{ id: "b", category: "strength" }] } as unknown as Program;
  const range = { start: "2026-08-25", end: "2026-09-07" };

  it("reports the heaviest MADE set as the day's top set, not the miss", () => {
    // `loadProgression` sorts by weight and takes the top, so before the
    // exclusion a missed 122 outranked every set actually lifted and became
    // the day's top set on a document written for a clinician: a 122 kg
    // front squat, at zero reps, that never happened.
    const entries = computeReport(storeWith([MADE, MISS]), program, range)
      .loadProgression.find((l) => l.exerciseId === "front_squat")!.entries;
    expect(entries).toHaveLength(1);
    expect(entries[0].top_kg).toBe(115);
    expect(entries[0].top_reps).toBe(1);
  });

  it("omits the lift entirely on a day that was only misses", () => {
    // Nothing was lifted, so there is no point on the load curve. Better a
    // gap than a fabricated one.
    const report = computeReport(storeWith([MISS]), program, range);
    expect(report.loadProgression.find((l) => l.exerciseId === "front_squat")).toBeUndefined();
  });
});
