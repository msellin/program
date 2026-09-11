import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { evaluateOverperformer } from "./adapt";
import { daySignals } from "./note-signals";
import type { Program, Store, DayLog } from "../schemas";

/**
 * A green day carrying 106 minutes of HIIT is not evidence of headroom.
 *
 * The founder's Monday: a 5.79 km run and 106 minutes of HIIT alongside the
 * squats. The day read green, the top set came in at RPE 7, and the engine
 * proposed a training-max bump on the strength of it — then explained itself
 * with "3 straight green days. The engine reads that as headroom."
 *
 * Every input it needed was already recorded and already audited.
 * `daySignals` computes `fatigue: "high"` at >=90 cardio minutes, and
 * `runLogSchema`'s own comment states that a Z3 today counts as external load
 * for the next session. Nothing downstream read either — `externalLoad`
 * reached the weekly-narrative TILE and stopped there, so the one consumer was
 * a display.
 *
 * The correction is deliberately narrow. The green-streak check is untouched:
 * it is symptom-derived and means something different. Days at merely
 * ELEVATED load still count, because a concurrent athlete does cardio by
 * design and disqualifying that would mean they never earn a bump at all.
 * Only `high` is withheld, and only as EVIDENCE.
 */
const load = (slug: string): Program => {
  const p = JSON.parse(
    fs.readFileSync(
      path.resolve(__dirname, `../../../public/data/programs/${slug}.json`),
      "utf8",
    ),
  ) as Program;
  p.slug = slug;
  return p;
};

const day = (
  date: string,
  opts: { minutes?: number; easy?: boolean; lifted?: boolean } = {},
): DayLog =>
  ({
    date,
    derived_state: "green",
    notes: opts.easy ? "felt strong, moved well" : "",
    // A logged working set is required or `trainedTMLifts` is empty and the
    // evaluator bails before the evidence check — which would make every
    // assertion below pass for the wrong reason.
    exercises: opts.lifted
      ? {
          "block_squat:back_squat": {
            done: true,
            sets: [{ weight_kg: 100, reps: 5, rpe: 7, failed: false }],
          },
        }
      : {},
    ...(opts.minutes
      ? { runs: [{ minutes: opts.minutes, intensity: "hard" as const, activity_type: "other" as const }] }
      : {}),
  }) as unknown as DayLog;

const storeWith = (logs: DayLog[]): Store =>
  ({
    version: 2,
    training_maxes: { back_squat: 120 },
    cycle: { cycle_number: 1, week_in_cycle: 1 },
    logs: Object.fromEntries(logs.map((d) => [d.date, d])),
  }) as unknown as Store;

const DATES = ["2026-09-07", "2026-09-08", "2026-09-09"];

describe("external load and the headroom read", () => {
  it("a clean green streak with an easy note proposes a bump", () => {
    // The control, and it has to be a real one: a test that only demonstrates
    // suppression cannot tell a working guard from a broken evaluator.
    const program = load("concurrent-strength-maintenance");
    const logs = DATES.map((d, i) => day(d, { easy: i === 2, lifted: i === 2 }));
    const proposal = evaluateOverperformer(program, storeWith(logs), DATES[2]);

    expect(proposal, "the evaluator must still fire on clean evidence").not.toBeNull();
    expect(proposal!.reason).toContain("headroom");
  });

  it("106 minutes of HIIT withdraws that day as evidence", () => {
    const program = load("concurrent-strength-maintenance");

    // The heavy day is the SOLE carrier of the evidence — it is the only day
    // with an easy note and the only day with a logged working set. That is
    // what makes this test decisive: if the day still counts, a proposal
    // comes out; if it is withdrawn, there is nothing left to propose on.
    //
    // The first version set `lifted` on all three days, so days 1-2 kept
    // supplying performance signals and a proposal appeared either way.
    // Reverting the filter did not break it. A test that survives the removal
    // of the thing it is testing is not testing it.
    const withoutLoad = DATES.map((d, i) => day(d, { easy: i === 2, lifted: i === 2 }));
    const withLoad = DATES.map((d, i) =>
      day(d, { easy: i === 2, lifted: i === 2, minutes: i === 2 ? 106 : undefined }),
    );

    // 106 >= the 90-minute `high` threshold. Not a number this test invented.
    expect(daySignals(withLoad[2]).fatigue).toBe("high");
    expect(daySignals(withoutLoad[2]).fatigue).toBe("normal");

    const clean = evaluateOverperformer(program, storeWith(withoutLoad), DATES[2]);
    const loaded = evaluateOverperformer(program, storeWith(withLoad), DATES[2]);

    expect(clean, "control must propose — otherwise this proves nothing").not.toBeNull();
    expect(
      loaded,
      "the only day carrying evidence was a 106-minute HIIT day; the bump must not stand on it",
    ).toBeNull();
  });

  it("a 50-minute Z3 day still counts — concurrent athletes do cardio", () => {
    const moderate = day(DATES[2], { easy: true, minutes: 50 });
    // Elevated, not high: it is real load, and it does not disqualify.
    expect(daySignals(moderate).fatigue).toBe("elevated");
    expect(daySignals(moderate).externalLoad).toBe(true);
  });

  it("the evaluator actually consults fatigue now", () => {
    // Mirror-guard. The filter is three lines and easy to lose in a refactor;
    // without this, losing it fails nothing.
    const src = fs.readFileSync(path.join(__dirname, "adapt.ts"), "utf8");
    expect(src, "heavy-load days must be excluded from headroom evidence").toContain(
      'daySignals(d).fatigue === "high"',
    );
    expect(src, "and the proposal must disclose the load it saw").toContain("loadNote");
  });
});
