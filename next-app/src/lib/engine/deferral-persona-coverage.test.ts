import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import type { Program } from "../schemas";
import { PERSONAS } from "../../../tests/e2e/harness/personas";

/**
 * The persona sweep's intake-deferral assertion is the only one that can stop
 * running without anything going red: a persona whose simulated day lands on a
 * rest day has no session, nothing to defer from, and the check skips.
 *
 * That happened. `persona-pullup-elbow` was the ONLY persona in the fleet
 * carrying intake answers, and on the two sweeps that ran after intake
 * deferrals were fixed to execute in production at all, its day-21 landed on a
 * rest day both times. The sweep reported green. The most consequential fix of
 * that day went unverified end-to-end and looked exactly like a verified one.
 *
 * A second persona on a different programme decorrelates the calendar, and
 * this test keeps that decorrelation from being quietly undone — by someone
 * deleting a persona, pointing both at the same programme, or changing an
 * intake answer to one no rule matches.
 *
 * What it deliberately does NOT do is assert that a deferral persona has a
 * session TODAY. That was the first version, and it was wrong: it re-derived
 * the schedule with `strengthBlockIdsForDate`, which returns nothing for
 * either skill programme at any day count, because their sessions come from
 * `plan-generator` off a tier the simulator assigns at run time. The test went
 * red every day for a reason that was in the test. Re-implementing the
 * scheduler to check the scheduler is how you get a guard that agrees with
 * itself and with nothing else.
 *
 * The calendar question is answered where it can be answered honestly: the
 * sweep records `deferralCheck` per persona and the fleet summary prints
 * "N/M verified end-to-end". A sweep where nothing verified now says so.
 */
function loadProgram(slug: string): Program {
  return JSON.parse(
    fs.readFileSync(
      path.resolve(__dirname, "../../../public/data/programs", `${slug}.json`),
      "utf8",
    ),
  ) as Program;
}

describe("intake-deferral persona coverage", () => {
  const deferralPersonas = PERSONAS.filter((p) => p.intakeAnswers);

  it("has more than one persona carrying intake answers", () => {
    // One persona covering one path is a coin flip against the calendar.
    expect(deferralPersonas.length).toBeGreaterThan(1);
  });

  it("covers at least two distinct programmes", () => {
    // Two personas on the same programme share its rest days exactly, which
    // buys nothing — the point is that they cannot both be idle at once.
    expect(new Set(deferralPersonas.map((p) => p.programSlug)).size).toBeGreaterThan(1);
  });

  it("every deferral persona's answers actually trigger a rule", () => {
    for (const p of deferralPersonas) {
      const prog = loadProgram(p.programSlug) as unknown as {
        intake_exclusions?: Array<{ question_id: string; when_value_in: string[] }>;
      };
      const fired = (prog.intake_exclusions ?? []).filter((r) =>
        r.when_value_in.includes(p.intakeAnswers?.[r.question_id] ?? " "),
      );
      expect(fired.length, `${p.id}: intake answers trigger no exclusion rule`)
        .toBeGreaterThan(0);
    }
  });

});
