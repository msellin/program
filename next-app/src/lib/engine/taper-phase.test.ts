import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { programSchema } from "../schemas";

/**
 * A phase flag the runtime could never see.
 *
 * Found 2026-09-06 by the `programme-integrity` agent.
 *
 * `rowing-2k-test-prep`'s `phase_3_taper_test` authors `is_taper` and
 * `duration_multiplier`. Neither was in `phaseSchema`, and Zod strips unknown
 * keys silently, so both were gone by the time any code ran.
 *
 * Two consumers read `is_taper` — and both read it through an
 * `as unknown as` cast, which is precisely what hid the bug. `phase.is_taper`
 * would not have compiled and someone would have noticed in seconds;
 * `(phase as unknown as { is_taper?: boolean }).is_taper` compiles and
 * returns undefined forever:
 *
 *   - `schedule.ts:318` swaps in `block_replacements_final_week` inside the
 *     last seven days of the taper. Never fired.
 *   - `TodaySession.tsx:310` renders the taper banner. Never appeared.
 *
 * `block_replacements_final_week` WAS in the schema, so the data survived and
 * the gate in front of it did not — the most confusing possible split.
 *
 * NOT the same mechanism as anterior-hip-rebuild's competition week, which
 * runs on `TAPER_BLOCKS` in `suggest.ts` and was never affected.
 */
const rowing = JSON.parse(
  fs.readFileSync(
    path.resolve(__dirname, "../../../public/data/programs/rowing-2k-test-prep.json"),
    "utf8",
  ),
);

describe("a taper phase survives parsing", () => {
  it("authors is_taper in the raw file", () => {
    const raw = rowing.phases.find((p: { id: string }) => p.id === "phase_3_taper_test");
    expect(raw?.is_taper).toBe(true);
  });

  it("still has it after programSchema.parse", () => {
    // The whole defect in one assertion. Before the schema fix this was
    // undefined, and both consumers silently no-opped.
    const parsed = programSchema.parse(rowing) as unknown as {
      phases: Array<{ id: string; is_taper?: boolean; block_replacements_final_week?: unknown }>;
    };
    const phase = parsed.phases.find((p) => p.id === "phase_3_taper_test");
    expect(phase?.is_taper, "is_taper stripped by Zod").toBe(true);
    // The gate and the data it guards must both survive, or the split that
    // caused this returns.
    expect(phase?.block_replacements_final_week, "final-week swap data").toBeDefined();
  });

  it("keeps duration_multiplier, which nothing reads yet", () => {
    // Recorded deliberately: the phase declares it, no consumer exists.
    // Better a known-unread field than a silently stripped one.
    const parsed = programSchema.parse(rowing) as unknown as {
      phases: Array<{ id: string; duration_multiplier?: number }>;
    };
    const phase = parsed.phases.find((p) => p.id === "phase_3_taper_test");
    expect(phase?.duration_multiplier).toBeTypeOf("number");
  });
});
