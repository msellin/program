import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { activePhaseFor } from "./schedule";
import { blocksForDate } from "./plan-generator";
import { programSchema, type Program, type Store } from "../schemas";

/**
 * `block_replacements` — phase-wide block substitution.
 *
 * `block_replacements_final_week` already existed but fires only on a taper
 * phase in its last 7 days, so a phase wanting a substitution for its whole
 * length had to edit the shared `weekly_template`, changing every phase at
 * once. Rowing's threshold build needs its weekly race-pace session to become
 * a race-PLAN rehearsal — same slot, same cost, different intent.
 *
 * Runs against the REAL shipped JSON on real dates, matching the convention
 * `taper-week.test.ts` set: a substitution that works on a fixture and not on
 * the programme nobody would notice.
 */
const DATA = path.resolve(__dirname, "../../../public/data");
const rowing: Program = programSchema.parse(
  JSON.parse(fs.readFileSync(path.join(DATA, "programs/rowing-2k-test-prep.json"), "utf8")),
);

const noProfile: Store["user_profile"] = undefined;

/** Same entry point taper-week.test.ts uses — the real scheduling path. */
function idsOn(dateISO: string): string[] {
  const phase = activePhaseFor(rowing, dateISO, noProfile);
  return blocksForDate(rowing, noProfile, phase, dateISO).map((b) => b.id);
}

/** Saturdays inside each phase — the day the template puts race-pace on. */
const SAT_PHASE_2 = "2026-09-05"; // inside phase_2_threshold_build
const SAT_PHASE_1 = "2026-08-22"; // inside phase_1_base_check

describe("phase-wide block replacements", () => {
  it("swaps race-pace for the plan rehearsal throughout the threshold build", () => {
    const ids = idsOn(SAT_PHASE_2);
    expect(ids).toContain("block_race_plan_rehearsal");
    expect(ids).not.toContain("block_race_pace_row");
  });

  it("leaves other phases alone", () => {
    const ids = idsOn(SAT_PHASE_1);
    expect(ids).not.toContain("block_race_plan_rehearsal");
  });

  it("the substitute is declared in the phase it substitutes into", () => {
    // The phase-scope filter runs AFTER replacement, so a substitute missing
    // from the phase's `blocks[]` would be silently filtered to a rest day —
    // the same silent-vanish failure an unresolved exercise_id causes.
    const phase = rowing.phases.find((p) => p.id === "phase_2_threshold_build")!;
    const rep = (phase as unknown as { block_replacements?: Record<string, string> })
      .block_replacements!;
    for (const target of Object.values(rep)) {
      expect(phase.blocks).toContain(target);
    }
  });

  it("every replacement target is a block the programme defines", () => {
    const known = new Set(rowing.blocks.map((b) => b.id));
    for (const phase of rowing.phases) {
      const rep = (phase as unknown as { block_replacements?: Record<string, string> })
        .block_replacements;
      for (const [from, to] of Object.entries(rep ?? {})) {
        expect(known.has(from), `${phase.id}: unknown source ${from}`).toBe(true);
        expect(known.has(to), `${phase.id}: unknown target ${to}`).toBe(true);
      }
    }
  });
});
