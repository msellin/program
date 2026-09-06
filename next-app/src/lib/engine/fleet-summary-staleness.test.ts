import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { collectReports } from "../../../tests/e2e/harness/coverage";

/**
 * The fleet summary must not report numbers from a persona that did not run.
 *
 * Persona artifacts are never cleaned between sweeps, and `collectReports`
 * builds the summary by reading every `coverage.json` on disk. A persona that
 * FAILS aborts before writing a fresh one — so the summary read the report
 * from the last sweep that persona passed and folded those numbers into the
 * new fleet total, with nothing anywhere saying so.
 *
 * That is how sweep #5 reported 269 behavioural checks while
 * `persona-pullup-elbow` was failing, and sweep #6 reported 263 with all 22
 * personas passing and a new flow's checks added on top. The six "missing"
 * checks were never a regression in the app. The larger number was wrong.
 *
 * A summary that silently substitutes yesterday's data for the one persona
 * that failed today hides exactly the persona you most need to look at.
 */
describe("fleet summary ignores stale persona reports", () => {
  let root: string;

  const write = (personaId: string, sweepId: string, checks: number) => {
    const dir = path.join(root, personaId);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(
      path.join(dir, "coverage.json"),
      JSON.stringify({
        personaId,
        sweepId,
        capturedAt: new Date().toISOString(),
        // Presence of `controls` is the pre-existing older-harness guard.
        controls: { pct: 100, exercised: 1, seen: 1, heldBack: 0, bySurface: [] },
        checks: { passed: checks, failed: 0, failures: [] },
      }),
      "utf8",
    );
  };

  beforeEach(() => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), "fleet-"));
  });
  afterEach(() => {
    fs.rmSync(root, { recursive: true, force: true });
    delete process.env.SWEEP_ID;
  });

  it("drops a report left behind by a previous sweep", () => {
    process.env.SWEEP_ID = "sweep-b";
    write("persona-ran", "sweep-b", 10);
    write("persona-failed-today", "sweep-a", 23); // yesterday's file, still on disk

    const reports = collectReports(root);

    expect(reports.map((r) => r.personaId)).toEqual(["persona-ran"]);
    expect(reports.reduce((n, r) => n + r.checks.passed, 0)).toBe(10);
  });

  it("drops a report from a harness that predates sweep stamping", () => {
    process.env.SWEEP_ID = "sweep-b";
    write("persona-ran", "sweep-b", 10);
    const dir = path.join(root, "persona-ancient");
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(
      path.join(dir, "coverage.json"),
      JSON.stringify({
        personaId: "persona-ancient",
        capturedAt: new Date().toISOString(),
        controls: { pct: 100, exercised: 1, seen: 1, heldBack: 0, bySurface: [] },
        checks: { passed: 99, failed: 0, failures: [] },
      }),
      "utf8",
    );

    expect(collectReports(root).map((r) => r.personaId)).toEqual(["persona-ran"]);
  });

  it("keeps every report when they all belong to the current sweep", () => {
    process.env.SWEEP_ID = "sweep-b";
    write("persona-one", "sweep-b", 5);
    write("persona-two", "sweep-b", 7);

    expect(collectReports(root).reduce((n, r) => n + r.checks.passed, 0)).toBe(12);
  });

  it("falls back to reading everything when no sweep is in progress", () => {
    // Reading the artifact directory by hand, outside a run, must still work.
    write("persona-one", "sweep-a", 5);
    write("persona-two", "sweep-b", 7);

    expect(collectReports(root)).toHaveLength(2);
  });
});
