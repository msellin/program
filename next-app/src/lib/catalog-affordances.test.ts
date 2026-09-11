import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

const SRC = path.resolve(process.cwd(), "src");
const read = (rel: string) => fs.readFileSync(path.join(SRC, rel), "utf8");
const stripComments = (s: string) =>
  s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

/**
 * Two catalog affordances that were on the backlog and already shipped.
 *
 * Both were listed as open on 2026-09-11 and both turned out to be built —
 * the fifth and sixth stale entry found that day. They are pinned here rather
 * than simply delisted, because a register entry that was wrong once will be
 * re-added by the next person who cannot find the feature, and because both
 * are easy to lose in a refactor without anything failing.
 */
describe("catalog: sort", () => {
  const src = stripComments(read("app/programs/page.tsx"));

  it("offers duration and difficulty orderings, not just the curated one", () => {
    expect(src).toContain('"duration_asc"');
    expect(src).toContain('"difficulty_asc"');
  });

  it("is a real control, wired to state", () => {
    // The orderings can exist as a type while nothing renders a way to pick
    // them, which is indistinguishable from the feature being absent.
    expect(src, "no <select> for sort").toMatch(/<select[\s\S]{0,400}id="programs-sort"/);
    expect(src).toContain("setSort(e.target.value as SortOrder)");
  });

  it("the control is labelled and reaches the 36px tap floor", () => {
    expect(src).toMatch(/htmlFor="programs-sort"/);
    expect(src).toMatch(/min-h-\[3[6-9]px\]|min-h-\[4[0-9]px\]/);
  });

  it("sorts on fields the manifest actually carries", () => {
    // A sort keyed on a field no programme declares silently does nothing.
    const manifest = JSON.parse(
      fs.readFileSync(
        path.resolve(process.cwd(), "public", "data", "programs", "manifest.json"),
        "utf8",
      ),
    ) as { programs: Array<Record<string, unknown>> };
    for (const p of manifest.programs) {
      expect(typeof p.duration_weeks, `${p.slug} has no duration_weeks to sort on`).toBe("number");
      expect(typeof p.difficulty, `${p.slug} has no difficulty to sort on`).toBe("string");
    }
  });
});

describe("catalog: switching your focus asks first", () => {
  const src = stripComments(read("app/programs/[slug]/ProgramPreviewClient.tsx"));

  it("a switch raises a confirmation", () => {
    expect(src).toContain("setSwitchWarning(true)");
    expect(src).toMatch(/open=\{switchWarning\}/);
  });

  it("the confirmation comes BEFORE the intake hand-off", () => {
    /**
     * The ordering is the entire feature. Every catalog programme declares an
     * intake, so with the hand-off first the warning never fired for anything
     * a beta user could reach: they answered the whole wizard and their
     * current focus vanished from Day and Plan without being asked.
     *
     * Under the single-main cap the swap REPLACES rather than demotes, so
     * this is the only chance to ask.
     */
    const warn = src.indexOf("setSwitchWarning(true)");
    const intake = src.indexOf("if (routeThroughIntake) return goToIntake();");
    expect(warn, "no switch warning").toBeGreaterThan(-1);
    expect(intake, "no intake hand-off").toBeGreaterThan(-1);
    expect(
      warn < intake,
      "the intake hand-off runs first again — the warning will never fire for a catalog programme",
    ).toBe(true);
  });

  it("it returns rather than falling through to the swap", () => {
    // Raising the sheet and continuing would switch the programme anyway and
    // ask about it afterwards.
    const at = src.indexOf("setSwitchWarning(true)");
    expect(src.slice(at, at + 60)).toContain("return;");
  });
});
