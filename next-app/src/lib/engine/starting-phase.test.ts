import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { activePhaseFor } from "./schedule";
import type { Program, Store } from "../schemas";

/**
 * A tier's declared entry phase.
 *
 * Found 2026-09-06 by the `programme-integrity` agent.
 *
 * `plan_tiers[].starting_phase_id` was in `schemas.ts` and read by NOTHING —
 * the schema line was its only occurrence in `src`.
 *
 * engine-builder-block-2 is where it bit. `phase_0_re_entry_ramp`
 * (Jan 5-18) and `phase_1_intro_week` (Jan 5-11) begin on the SAME DAY and
 * neither carries `for_tier_ids`, so `matches[0]` returned the re-entry ramp
 * for everyone. Foundation declares phase_0 and got it by luck; progression
 * and push both declare phase_1_intro_week — the programme's own reference
 * plan — and could never reach it.
 *
 * The fixture is deliberately a date where BOTH phases match. On any later
 * date the ranges no longer overlap and the test would pass without the fix,
 * which is the trap that made three earlier tests today decoration.
 */
const program = (() => {
  const p = JSON.parse(
    fs.readFileSync(
      path.resolve(__dirname, "../../../public/data/programs/engine-builder-block-2.json"),
      "utf8",
    ),
  ) as Program;
  p.slug = "engine-builder-block-2";
  return p;
})();

const OVERLAP_DAY = "2026-01-07"; // inside phase_0 (5-18) AND phase_1 (5-11)

const profileAt = (tier: string) =>
  ({
    active_program_id: "engine-builder-block-2",
    program_states: { "engine-builder-block-2": { tier } },
  }) as unknown as Store["user_profile"];

describe("a tier starts in the phase it declares", () => {
  it("both phases really do match the fixture date", () => {
    // If this ever stops being true the assertions below prove nothing.
    const overlapping = (program.phases ?? []).filter(
      (p) => OVERLAP_DAY >= p.starts && (p.ends == null || OVERLAP_DAY <= p.ends),
    );
    expect(overlapping.map((p) => p.id)).toEqual(
      expect.arrayContaining(["phase_0_re_entry_ramp", "phase_1_intro_week"]),
    );
  });

  it("progression reaches phase_1_intro_week, not the re-entry ramp", () => {
    expect(activePhaseFor(program, OVERLAP_DAY, profileAt("progression"))?.id).toBe(
      "phase_1_intro_week",
    );
  });

  it("push reaches phase_1_intro_week too", () => {
    expect(activePhaseFor(program, OVERLAP_DAY, profileAt("push"))?.id).toBe(
      "phase_1_intro_week",
    );
  });

  it("foundation still gets the re-entry ramp it declares", () => {
    // The fix must not simply flip the winner — foundation's declared start
    // is phase_0, and it has to keep it.
    expect(activePhaseFor(program, OVERLAP_DAY, profileAt("foundation"))?.id).toBe(
      "phase_0_re_entry_ramp",
    );
  });
});
