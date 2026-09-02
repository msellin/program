import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { programSchema } from "../schemas";

const raw = JSON.parse(
  fs.readFileSync(
    path.resolve(__dirname, "../../../public/data/programs/handstand-walk.json"),
    "utf8",
  ),
);

/**
 * `isPhaseSkipped` reads `phase_gates` through a cast, so TypeScript could not
 * see that `programSchema` was stripping the field. The gate was fully written
 * and could never fire: `gates?.length` was always undefined.
 *
 * These assert the data survives the parse, which is the part that broke — the
 * gate logic itself was never wrong.
 */
describe("phase_gates survive programSchema.parse", () => {
  const parsed = programSchema.parse(raw) as unknown as {
    phase_gates?: Array<{
      phase_id: string;
      question_id: string;
      skip_if_value_in?: string[];
      run_if_value_in?: string[];
    }>;
  };

  it("the authored gate is still there after parsing", () => {
    expect(raw.phase_gates?.length ?? 0).toBeGreaterThan(0);
    expect(parsed.phase_gates?.length).toBe(raw.phase_gates.length);
  });

  it("keeps the fields the gate logic reads", () => {
    const gate = parsed.phase_gates![0];
    expect(gate.phase_id).toBe("phase_0_bail_out_prep");
    expect(gate.question_id).toBe("bail_out_readiness");
    expect(gate.skip_if_value_in).toContain("can_exit_reliably");
  });

  it("the gated phase and its question both exist in the program", () => {
    // A gate naming a phase or question that does not exist would parse fine
    // and silently never fire — the same failure one level along.
    const phaseIds = new Set((raw.phases ?? []).map((p: { id: string }) => p.id));
    const questionIds = new Set(
      (raw.intake?.questions ?? []).map((q: { id: string }) => q.id),
    );
    for (const g of parsed.phase_gates!) {
      expect(phaseIds.has(g.phase_id), `phase ${g.phase_id}`).toBe(true);
      expect(questionIds.has(g.question_id), `question ${g.question_id}`).toBe(true);
    }
  });
});
