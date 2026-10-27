import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { programSchema, type Store } from "../schemas";
import { activePhaseFor, activePhaseForWeek } from "./schedule";

const DATA = join(__dirname, "../../../public/data");
const program = programSchema.parse(
  JSON.parse(readFileSync(join(DATA, "programs/first-strict-pullup.json"), "utf8")),
);

/** G-09: a Wednesday start must not leave week 1 with "No phase covers this week". */
describe("activePhaseForWeek (G-09)", () => {
  const profile = {
    active_program_started_at: "2026-10-28",
    program_states: { "first-strict-pullup": { started_at: "2026-10-28" } },
  } as Store["user_profile"];

  it("finds the phase for a week whose Monday is before the start", () => {
    expect(activePhaseFor(program, "2026-10-26", profile), "fixture drifted").toBeUndefined();
    expect(activePhaseForWeek(program, "2026-10-26", profile)).toBeDefined();
  });

  it("agrees with the Monday lookup once the week is fully inside the program", () => {
    expect(activePhaseForWeek(program, "2026-11-02", profile)?.id).toBe(
      activePhaseFor(program, "2026-11-02", profile)?.id,
    );
  });

  it("is undefined for a week entirely before the start", () => {
    expect(activePhaseForWeek(program, "2026-10-19", profile)).toBeUndefined();
  });
});
