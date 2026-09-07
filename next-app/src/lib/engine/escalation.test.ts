import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import type { Program, Store } from "../schemas";
import { redStreak, escalationNoticeFor, RED_STREAK_THRESHOLD } from "./escalation";

const DIR = path.resolve(__dirname, "../../../public/data/programs");

function storeWith(days: Array<[string, string | undefined]>): Store {
  return {
    version: 2,
    logs: Object.fromEntries(
      days.map(([date, state]) => [
        date,
        { date, exercises: {}, ...(state ? { derived_state: state } : {}) },
      ]),
    ),
    training_maxes: {},
    cycle: { phase_id: null, cycle_number: 0, week_in_cycle: 0 },
  } as unknown as Store;
}

const program = (escalation?: string): Program =>
  ({ slug: "x", ...(escalation ? { progression_rules: { escalation } } : {}) }) as unknown as Program;

/**
 * The engine counted three greens to add load and counted nothing to stop.
 *
 * Six programmes author an escalation rule — "three red days in a row means
 * take a full week off and consult a clinician". One line of code read any of
 * them, pushing the string into a default-collapsed accordion on `/plan`. A
 * user could have three red days and never see the rule their own programme
 * wrote for exactly that situation.
 *
 * `evaluateOverperformer`, meanwhile, counts three consecutive greens and
 * raises a proposal to ADD load — and `proposals/select.ts` resolves the
 * collision by deleting the caution proposal and keeping the optimism one.
 *
 * This is the counter that was missing. It surfaces, it does not enforce:
 * these six rules are prose in three different predicate shapes, and
 * CLAUDE.md's standing reason for keeping authored thresholds dead applies
 * here too — an interpreted stop-rule is a stop-rule nobody wrote.
 */
describe("red streak", () => {
  it("counts consecutive red days ending today", () => {
    const s = storeWith([
      ["2026-09-01", "green"],
      ["2026-09-02", "red"],
      ["2026-09-03", "red"],
      ["2026-09-04", "red"],
    ]);
    expect(redStreak(s, "2026-09-04")).toBe(3);
  });

  it("a green day breaks it", () => {
    const s = storeWith([
      ["2026-09-02", "red"],
      ["2026-09-03", "green"],
      ["2026-09-04", "red"],
    ]);
    expect(redStreak(s, "2026-09-04")).toBe(1);
  });

  it("an unclassified day breaks it, exactly as the green-streak read does", () => {
    // A day we cannot classify is unknown, not fine. Mirroring
    // `evaluateOverperformer` matters: the caution signal must not be
    // accused of using a softer standard than the optimism signal it
    // balances.
    const s = storeWith([
      ["2026-09-02", "red"],
      ["2026-09-03", undefined],
      ["2026-09-04", "red"],
    ]);
    expect(redStreak(s, "2026-09-04")).toBe(1);
  });

  it("ignores days after the date being asked about", () => {
    const s = storeWith([
      ["2026-09-02", "red"],
      ["2026-09-03", "red"],
      ["2026-09-04", "red"],
    ]);
    expect(redStreak(s, "2026-09-03")).toBe(2);
  });

  it("an empty log is not a streak", () => {
    expect(redStreak(storeWith([]), "2026-09-04")).toBe(0);
  });
});

describe("escalation notice", () => {
  const threeRed = storeWith([
    ["2026-09-02", "red"],
    ["2026-09-03", "red"],
    ["2026-09-04", "red"],
  ]);

  it("fires at the threshold with the programme's own words", () => {
    const text = "Three red days in a row means take a full week off.";
    const n = escalationNoticeFor(program(text), threeRed, "2026-09-04");
    expect(n).toEqual({ text, streak: 3 });
  });

  it("does not fire below the threshold", () => {
    const twoRed = storeWith([
      ["2026-09-03", "red"],
      ["2026-09-04", "red"],
    ]);
    expect(escalationNoticeFor(program("stop"), twoRed, "2026-09-04")).toBeNull();
  });

  it("stays silent when the programme authored no rule", () => {
    // The alternative — substituting a generic warning — attributes a
    // stop-rule to a programme that never wrote one. That is the shape of
    // claim this repo has spent a week withdrawing.
    expect(escalationNoticeFor(program(), threeRed, "2026-09-04")).toBeNull();
  });

  it("never paraphrases", () => {
    const text = "Persistent shoulder or elbow pain > 3 days → stop, see a clinician.";
    expect(escalationNoticeFor(program(text), threeRed, "2026-09-04")?.text).toBe(text);
  });
});

describe("the authored rules this actually covers", () => {
  const withEscalation = fs
    .readdirSync(DIR)
    .filter((f) => f.endsWith(".json") && f !== "manifest.json")
    .map((f) => {
      const prog = JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8")) as {
        progression_rules?: { escalation?: string };
      };
      return { slug: f.replace(/\.json$/, ""), text: prog.progression_rules?.escalation };
    })
    .filter((p): p is { slug: string; text: string } => typeof p.text === "string");

  it("six programmes author one", () => {
    expect(withEscalation.map((p) => p.slug).sort()).toEqual([
      "anterior-hip-rebuild",
      "engine-builder",
      "engine-builder-block-2",
      "first-strict-pullup",
      "handstand-walk",
      "muscle-up",
    ]);
  });

  it("the threshold matches what the rules themselves say", () => {
    /**
     * Three is not a number I picked. Five of the six rules say three — three
     * red days in a row, or persistent pain past three days. Reading the
     * authored rules is the difference between surfacing a programme's
     * guidance and inventing one.
     *
     * `anterior-hip-rebuild` is the sixth and its rule is about three amber
     * WEEKS. A day-counter does not fire on it, and stretching one over a
     * rule written about weeks would be worse than not covering it.
     */
    expect(RED_STREAK_THRESHOLD).toBe(3);
    const sayThree = withEscalation.filter((p) => /three|3 /i.test(p.text));
    expect(sayThree.length).toBe(6);
    const hip = withEscalation.find((p) => p.slug === "anterior-hip-rebuild")!;
    expect(hip.text).toMatch(/amber weeks/i);
  });
});
