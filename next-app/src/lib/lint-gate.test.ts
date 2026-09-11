import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(__dirname, "../../..");

/**
 * Lint stays gated, and stays at zero errors.
 *
 * Until 2026-09-11 eslint ran nowhere automatic: `npm run verify` is vitest,
 * the pre-commit hook runs verify, and `npm run deploy` runs verify. It ran
 * when somebody chose to run it, and had accumulated 27 errors.
 *
 * Twenty of those were one React Compiler rule — `set-state-in-effect` —
 * firing on an idiom this codebase uses correctly (the SSR-hydration-safe
 * localStorage read, browser APIs that do not exist until mount, an
 * empty-guard branch in an async loader). Five were read in full before the
 * rule was downgraded to a warning.
 *
 * That mattered because of what the other seven turned out to be. A `use`
 * disable directive that silenced nothing, because a five-line explanation sat
 * between `eslint-disable-next-line` and the code it was meant to cover. A
 * `Date.now()` during render that also bypassed the `?today=` override the
 * app provides for testing at fixed dates. And a `useMemo` naming two
 * properties of `program` where it depends on `program` — on the gate that
 * decides whether someone may start a programme at all.
 *
 * Twenty benign errors are how seven real ones stay invisible. This asserts
 * the gate exists; eslint itself asserts the zero.
 */
describe("lint is gated in CI", () => {
  it("the verify job runs npm run lint", () => {
    const wf = path.join(ROOT, ".github", "workflows", "deploy.yml");
    if (!fs.existsSync(wf)) return;
    const src = fs.readFileSync(wf, "utf8");
    const jobs = [...src.matchAll(/^ {2}[a-z][a-z0-9_-]*:$/gm)].map((m) => m.index!);
    const start = src.indexOf("\n  verify:") + 1;
    const end = jobs.find((i) => i > start) ?? src.length;
    const verify = src.slice(start, end);

    expect(
      verify,
      "the verify job no longer runs lint — 27 errors accumulated last time it was ungated",
    ).toContain("npm run lint");
  });

  it("the lint script still actually runs eslint", () => {
    // A gate that shells out to a script someone later points at `echo ok`
    // is worse than no gate, because it reports green.
    const pkg = JSON.parse(
      fs.readFileSync(path.join(ROOT, "next-app", "package.json"), "utf8"),
    ) as { scripts?: Record<string, string> };
    expect(pkg.scripts?.lint, "no lint script").toBeTruthy();
    expect(pkg.scripts!.lint).toContain("eslint");
  });

  it("set-state-in-effect is a warning, and says why in the config", () => {
    // Downgraded deliberately after reading five of its twenty occurrences.
    // If someone flips it back to error without revisiting them, CI goes red
    // on working code and the rule gets disabled outright — which is the
    // outcome this is trying to avoid.
    const cfg = fs.readFileSync(
      path.join(ROOT, "next-app", "eslint.config.mjs"),
      "utf8",
    );
    expect(cfg).toContain('"react-hooks/set-state-in-effect": "warn"');
    expect(
      cfg,
      "the downgrade must keep its reasoning next to it",
    ).toMatch(/hydration|idiom|cascading/i);
  });
});
