import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { regionsForProgram, LEGACY_REGIONS } from "@/lib/symptom-regions";

const src = (rel: string) => fs.readFileSync(path.resolve(process.cwd(), "src", rel), "utf8");
const stripComments = (s: string) =>
  s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

/**
 * The morning check must never open with someone else's body map.
 *
 * CLAUDE.md records this defect as fixed: "the check rendered groin_left /
 * low_back / buttock_left / shoulder_right — anterior-hip-rebuild's clinical
 * map, the one program marked personal: true — to every user of every program.
 * A pull-up user with medial epicondylitis had no elbow field and the engine
 * saw green."
 *
 * The RESOLVER was fixed. The INITIAL STATE was not: `/check` seeded
 * `useState(() => regionsForProgram(null))`, and that fallback is
 * `LEGACY_REGIONS` — the hip programme's four. So every load opened with them,
 * for every user, until the programme resolved a moment later.
 *
 * Persona sweep #8 caught it on production, 2026-09-14.
 * `persona-pullup-elbow`'s captured check reads "Left groin / Low back / Left
 * buttock / Right shoulder".
 *
 * It is worse than a flash. Scores are written under the REGION ID, so a
 * pull-up user tapping "Right shoulder" writes `shoulder_right` — their
 * programme's own `shoulder` stays unscored, and the day's green/amber/red is
 * derived from a region their programme never asked about.
 */
describe("check page region resolution", () => {
  const page = stripComments(src("app/check/page.tsx"));

  it("does not seed state with the legacy fallback", () => {
    // The single line that caused it.
    expect(
      page,
      "the check is seeding regions with the hip programme's map again",
    ).not.toMatch(/useState[^\n]*regionsForProgram\(null\)/);
    expect(page).not.toMatch(/useState[^\n]*flagsForProgram\(null\)/);
  });

  it("distinguishes NOT YET KNOWN from DECLARES NOTHING", () => {
    // `null` is the unresolved state; `[]` after a failed load. Collapsing
    // them is exactly how the fallback started standing in for "loading".
    expect(page).toMatch(/useState<SymptomRegion\[\] \| null>\(null\)/);
    expect(page).toContain("REGIONS === null");
  });

  it("renders nothing scoreable until it knows", () => {
    // Not an empty form and not a wrong one — a stated loading state.
    const at = page.indexOf("REGIONS === null");
    expect(at).toBeGreaterThan(-1);
    expect(page.slice(at, at + 260)).toMatch(/Loading/i);
  });

  it("a failed load refuses to collect, rather than collecting wrongly", () => {
    /**
     * The old catch fell back to the legacy four with the reasoning that "a
     * failed program load must not blank the check". That is the wrong trade:
     * a score recorded against the wrong region is worse than no score,
     * because it is indistinguishable from a real one afterwards.
     */
    expect(page).toContain("regionsError");
    const at = page.indexOf("regionsError ?");
    expect(at, "no error branch in the render").toBeGreaterThan(-1);
    expect(page.slice(at, at + 320)).toMatch(/role="alert"/);
    expect(page.slice(at, at + 420)).toMatch(/reload/i);
  });

  it("still uses the legacy four when NO programme is picked", () => {
    // That is the case the fallback was actually written for, and it stays.
    expect(page).toMatch(/if \(!activeSlug\)/);
    const at = page.indexOf("if (!activeSlug)");
    expect(page.slice(at, at + 220)).toContain("regionsForProgram(null)");
  });

  it("the fallback is still the hip four, which is why seeding with it mattered", () => {
    // Guards the premise: if LEGACY_REGIONS ever became generic, the severity
    // of the original defect changes and this file should be re-read.
    expect([...LEGACY_REGIONS]).toEqual([
      "groin_left",
      "low_back",
      "buttock_left",
      "shoulder_right",
    ]);
    const pullup = regionsForProgram({
      symptom_regions: ["shoulder", "elbow", "low_back"],
    }).map((r) => r.id);
    expect(pullup, "a pull-up programme must resolve to its own regions").toEqual([
      "shoulder",
      "elbow",
      "low_back",
    ]);
    // And the two sets share exactly one id — which is why the sweep reported
    // "missing: Shoulder, Elbow" rather than missing everything.
    const overlap = pullup.filter((id) => (LEGACY_REGIONS as readonly string[]).includes(id));
    expect(overlap).toEqual(["low_back"]);
  });
});
