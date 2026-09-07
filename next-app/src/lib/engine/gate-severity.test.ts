import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import { severityOf } from "./safety-gates";

const DIR = path.resolve(__dirname, "../../../public/data/programs");

type Gate = { question_id: string; severity?: string; unsafe_values?: string[] };

function gates(): Array<{ file: string; gate: Gate }> {
  return fs
    .readdirSync(DIR)
    .filter((f) => f.endsWith(".json") && f !== "manifest.json")
    .flatMap((f) => {
      const prog = JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8")) as {
        intake?: { safety_gates?: Gate[] };
      };
      return (prog.intake?.safety_gates ?? []).map((gate) => ({ file: f, gate }));
    });
}

/**
 * Every safety gate declares its severity. None inherits it.
 *
 * `severityOf` returns "block" for anything that is not exactly "warn", so an
 * absent `severity` blocks. That default is the right one — a gate whose
 * author forgot to say should stop the user, not wave them through — but it
 * meant twenty-six gates across nine programmes were refusing people by
 * omission. Nothing in the data said whether that was chosen.
 *
 * The distinction is not academic. It is exactly the state that produced an
 * `authoring_note` reading "OPEN: whether this should be warn instead", which
 * sat unanswered long enough to be copied into a task list, alongside a claim
 * about tier reachability that was false. An undeclared default is a decision
 * nobody can review, and this repo keeps finding out what those cost.
 *
 * Declaring them changed nothing at runtime — that is the point. The gates
 * behaved identically before and after; what changed is that a reader can now
 * tell a deliberate block from a forgotten one, and a future edit to
 * `severityOf` cannot silently reclassify twenty-six safety gates.
 */
describe("safety gates declare their own severity", () => {
  const ALL = gates();

  it("there are gates to check", () => {
    expect(ALL.length).toBeGreaterThan(20);
  });

  it("no gate relies on the default", () => {
    const implicit = ALL.filter((g) => g.gate.severity === undefined).map(
      (g) => `${g.file} → ${g.gate.question_id}`,
    );
    expect(
      implicit,
      "add an explicit severity. `severityOf` defaults to block, so omitting it " +
        "refuses users by accident-shaped-like-intent.",
    ).toEqual([]);
  });

  it("every declared severity is one the engine understands", () => {
    const unknown = ALL.filter(
      (g) => g.gate.severity !== "block" && g.gate.severity !== "warn",
    ).map((g) => `${g.file} → ${g.gate.question_id}: ${g.gate.severity}`);
    // A typo'd severity is worse than a missing one: it reads as deliberate
    // and `severityOf` silently turns it into a block.
    expect(unknown).toEqual([]);
  });

  it("declaring the severity did not change what the engine does", () => {
    // The guarantee that made this a safe edit. If any gate's resolved
    // severity now differs from what the default would have produced, the
    // change was not the no-op it was described as.
    for (const { file, gate } of ALL) {
      const declared = severityOf(gate as never);
      const asIfAbsent = severityOf({ ...gate, severity: undefined } as never);
      if (gate.severity === "block") {
        expect(declared, `${file} → ${gate.question_id}`).toBe(asIfAbsent);
      }
    }
  });
});
