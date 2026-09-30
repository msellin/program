import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { selectProposals } from "./select";
import type { Program, Store, DayLog } from "@/lib/schemas";

/**
 * BUG-37 (2026-09-30). The "trim 5-10%" proposal fired on seven of eight
 * mornings from 21 to 28 Sep for the founder, every one green, every one
 * ignored — life load 4 and a daily CrossFit class read as fatigue against
 * fixed thresholds. It now reads load-shaped signals against the user's own
 * last 28 days. Each suppression below has a control that must still fire, so
 * a selector that simply stopped softening would fail here.
 */
const program = (() => {
  const p = JSON.parse(
    fs.readFileSync(path.resolve(process.cwd(), "public/data/programs/concurrent-strength-maintenance.json"), "utf8"),
  ) as Program;
  p.slug = "concurrent-strength-maintenance";
  return p;
})();

const DATE = "2026-09-28";
const START = "2026-08-20";

const day = (date: string, o: { life?: number; hiit?: number; hard?: number; notes?: string; pain?: boolean } = {}): DayLog =>
  ({
    date,
    derived_state: "green",
    notes: o.notes ?? "",
    symptoms: { life_load: o.life ?? 4, low_back: 0 },
    exercises: {},
    runs: [
      ...(o.hiit ? [{ minutes: o.hiit, activity_type: "other" }] : []),
      ...(o.hard ? [{ minutes: o.hard, intensity: "hard", activity_type: "hyrox" }] : []),
    ],
  }) as unknown as DayLog;

/** 28 days of this founder's ordinary week: life load 4, 80-120 min of HIIT. */
function history(): Record<string, DayLog> {
  const out: Record<string, DayLog> = {};
  for (let i = 1; i <= 28; i++) {
    const d = new Date(Date.parse(DATE + "T12:00:00Z") - i * 864e5).toISOString().slice(0, 10);
    out[d] = day(d, { life: 4, hiit: 80 + (i % 5) * 10 });
  }
  return out;
}

const store = (logs: Record<string, DayLog>): Store =>
  ({
    version: 2,
    training_maxes: { back_squat: 100 },
    logs,
    user_profile: {
      active_program_id: program.slug,
      active_program_ids: [program.slug],
      active_program_started_at: `${START}T00:00:00.000Z`,
      program_states: { [program.slug!]: { started_at: START } },
    },
  }) as unknown as Store;

const softens = (logs: Record<string, DayLog>) =>
  selectProposals(store(logs), program, DATE).filter((p) => p.kind === "day_adjustment_soften");

describe("soften reads load against the user's own normal (BUG-37)", () => {
  it("control: the same morning with no history still softens", () => {
    expect(softens({ [DATE]: day(DATE, { life: 4, hiit: 100 }) })).toHaveLength(1);
  });

  it("an ordinary morning for this user does not", () => {
    expect(softens({ ...history(), [DATE]: day(DATE, { life: 4, hiit: 100 }) })).toEqual([]);
  });

  it("life load well above their usual still softens", () => {
    expect(softens({ ...history(), [DATE]: day(DATE, { life: 6 }) })).toHaveLength(1);
  });

  it("cardio above their usual still softens", () => {
    expect(softens({ ...history(), [DATE]: day(DATE, { life: 4, hiit: 160 }) })).toHaveLength(1);
  });

  it("a hard race-length effort still softens, however much they usually train", () => {
    expect(softens({ ...history(), [DATE]: day(DATE, { life: 4, hard: 80 }) })).toHaveLength(1);
  });

  it("a note saying they are sore is never explained away by a baseline", () => {
    expect(softens({ ...history(), [DATE]: day(DATE, { life: 4, hiit: 100, notes: "legs sore, everything felt heavy" }) })).toHaveLength(1);
  });
});
