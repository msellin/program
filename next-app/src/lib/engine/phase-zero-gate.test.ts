import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { activePhaseFor } from "./schedule";
import type { Program } from "../schemas";

/**
 * The bail-out phase is gated, and `gates_on` was a dead copy of the gate.
 *
 * `phase_0_bail_out_prep` teaches someone how to fall out of a handstand. It
 * should run for a user who has never been inverted and be skipped by one who
 * can already exit reliably.
 *
 * It declared that twice. `phases[].gates_on` said it in a key Zod discards,
 * and `phase_gates[]` said the same thing in the key `isPhaseGateSkipped`
 * actually reads. The audit recorded the dead one as an unenforced gate, which
 * made it look like the bail-out phase was ungated. It is not: driving
 * `activePhaseFor` across both answers shows the live gate working.
 *
 * So `gates_on` was DELETED rather than implemented, on 2026-09-11. Two
 * declarations of one rule is a drift hazard in the direction nobody checks —
 * an author correcting the dead one would change nothing and believe they had.
 * This test carries the record, and asserts the surviving gate behaves.
 *
 * `retest_gate` on the same phase is a different matter and is still open. It
 * declares how a user EXITS phase 0 — "bail_out_confidence >= 6 for 2
 * consecutive days", and "if fear persists > 2 weeks, nudge toward a coach".
 * Phases here are date-driven and phase 0 is one authored week, so none of
 * that happens: there is no `bail_out_confidence` log field for it to read.
 */
const load = (): Program => {
  const p = JSON.parse(
    fs.readFileSync(
      path.resolve(__dirname, "../../../public/data/programs/handstand-walk.json"),
      "utf8",
    ),
  ) as Program;
  p.slug = "handstand-walk";
  return p;
};

const profileFor = (tier: string, answer: string) =>
  ({
    active_program_id: "handstand-walk",
    active_program_started_at: new Date().toISOString(),
    program_states: {
      "handstand-walk": { tier, intake_answers: { bail_out_readiness: answer } },
    },
  }) as never;

/** Phase ids seen over the first two weeks from today. */
const phasesOverTwoWeeks = (program: Program, profile: never): Set<string> => {
  const seen = new Set<string>();
  for (let d = 0; d < 14; d++) {
    const day = new Date();
    day.setDate(day.getDate() + d);
    const ph = activePhaseFor(program, day.toISOString().slice(0, 10), profile);
    if (ph?.id) seen.add(ph.id);
  }
  return seen;
};

const TIERS = [
  "tier_a_foundation",
  "tier_b_wall_handstand",
  "tier_c_freestand",
  "tier_d_advanced",
];

describe("phase_0_bail_out_prep gating", () => {
  const program = load();

  it("the live gate is still declared, and still names the same answers", () => {
    const gates = (program as unknown as {
      phase_gates?: Array<{
        phase_id: string;
        question_id: string;
        skip_if_value_in?: string[];
        run_if_value_in?: string[];
      }>;
    }).phase_gates;
    const gate = gates?.find((g) => g.phase_id === "phase_0_bail_out_prep");
    expect(gate, "the bail-out phase lost its gate — it now runs for everyone").toBeTruthy();
    expect(gate!.question_id).toBe("bail_out_readiness");
    expect(gate!.skip_if_value_in).toContain("can_exit_reliably");
    expect(gate!.run_if_value_in).toEqual(
      expect.arrayContaining(["never_inverted", "would_fall", "can_step_out"]),
    );
  });

  it("the dead duplicate stays deleted", () => {
    // Re-adding `gates_on` would recreate the drift: two declarations of one
    // rule, one of them silently inert.
    for (const ph of program.phases) {
      expect(
        "gates_on" in (ph as unknown as Record<string, unknown>),
        `${ph.id} re-declares gates_on, which Zod discards`,
      ).toBe(false);
    }
  });

  it.each(TIERS)("%s: a user who has never been inverted gets phase 0", (tier) => {
    const seen = phasesOverTwoWeeks(program, profileFor(tier, "never_inverted"));
    expect(
      seen.has("phase_0_bail_out_prep"),
      "the falling-safety week is being skipped for someone who has never been upside down",
    ).toBe(true);
  });

  it.each(TIERS)("%s: a user who can exit reliably skips it", (tier) => {
    const seen = phasesOverTwoWeeks(program, profileFor(tier, "can_exit_reliably"));
    expect(
      seen.has("phase_0_bail_out_prep"),
      "a confident inverter is being made to spend a week on bail-outs",
    ).toBe(false);
  });

  it("the intake question the gate reads still exists and offers those answers", () => {
    // The gate is only as real as the question feeding it. If the answer set
    // is renamed, the gate silently stops matching and the phase runs for all.
    const q = ((program as unknown as {
      intake?: { questions?: Array<{ id?: string; options?: Array<{ value?: string }> }> };
    }).intake?.questions ?? []).find((x) => x.id === "bail_out_readiness");
    expect(q, "bail_out_readiness question is gone — the gate cannot match").toBeTruthy();
    const values = (q!.options ?? []).map((o) => o.value);
    for (const v of ["never_inverted", "would_fall", "can_step_out", "can_exit_reliably"]) {
      expect(values, `answer "${v}" no longer offered`).toContain(v);
    }
  });
});
