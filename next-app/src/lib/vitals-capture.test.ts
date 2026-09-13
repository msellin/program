import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { overBudget, VITALS_BUDGET, type RouteVitals } from "../../tests/e2e/harness/vitals";

const ROOT = path.resolve(process.cwd());
const read = (rel: string) => fs.readFileSync(path.join(ROOT, rel), "utf8");
const stripComments = (s: string) =>
  s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

/**
 * The persona tour measures how the app LOADS, not only what it shows.
 *
 * Eight sweeps at full route coverage produced screenshots, DOM and text for
 * every surface and not a single number about load performance — so a
 * regression making Today a second slower would have shipped invisibly, on a
 * mobile-first app whose own design brief benchmarks it against Linear and
 * Runna.
 */
const v = (p: Partial<RouteVitals> = {}): RouteVitals => ({
  route: "day",
  viewport: "mobile",
  lcp_ms: 1000,
  cls: 0.01,
  inp_max_ms: 50,
  ...p,
});

describe("vitals budget", () => {
  it("a healthy route reports nothing", () => {
    expect(overBudget(v())).toEqual([]);
  });

  it("flags each metric independently", () => {
    expect(overBudget(v({ lcp_ms: 4000 }))).toEqual(["LCP 4000ms"]);
    expect(overBudget(v({ cls: 0.3 }))).toEqual(["CLS 0.3"]);
    expect(overBudget(v({ inp_max_ms: 500 }))).toEqual(["INP(max) 500ms"]);
  });

  it("treats a missing metric as unknown, not as passing", () => {
    // A route where LCP never fired reports null. Counting null as 0 would
    // report the worst case as the best one.
    expect(overBudget(v({ lcp_ms: null, cls: null, inp_max_ms: null }))).toEqual([]);
    expect(overBudget(v({ lcp_ms: null, cls: 0.3 }))).toEqual(["CLS 0.3"]);
  });

  it("holds the standard thresholds", () => {
    expect(VITALS_BUDGET).toEqual({ lcp_ms: 2500, cls: 0.1, inp_max_ms: 200 });
  });

  it("is exclusive, not inclusive, at the boundary", () => {
    // Exactly 2500 is "good" by Google's definition; only above it is not.
    expect(overBudget(v({ lcp_ms: 2500 }))).toEqual([]);
    expect(overBudget(v({ lcp_ms: 2501 }))).toHaveLength(1);
  });
});

describe("the tour actually collects them", () => {
  const tour = stripComments(read("tests/e2e/harness/tour.ts"));

  it("installs the observer BEFORE the first navigation", () => {
    /**
     * The ordering is the measurement. `addInitScript` runs before the page's
     * own script; an observer attached after `page.goto` misses the LCP
     * candidate on a fast route entirely — which is the route you would most
     * want to be sure about.
     */
    const install = tour.indexOf("installVitals(page)");
    const firstGoto = tour.indexOf("page.goto(");
    expect(install, "the tour no longer installs vitals").toBeGreaterThan(-1);
    expect(firstGoto).toBeGreaterThan(-1);
    expect(
      install < firstGoto,
      "installVitals must run before any navigation or LCP is missed on fast routes",
    ).toBe(true);
  });

  it("reads them per route, not once at the end", () => {
    // One reading at the end would report the last route's numbers for all of
    // them.
    expect(tour).toContain("readVitals(page, route.slug, viewport.name)");
  });

  it("writes an artifact, so two sweeps can be compared", () => {
    expect(tour).toContain('"vitals.json"');
    expect(tour).toContain("over_budget");
  });
});

describe("the artifact is honest about what INP is not", () => {
  it("the field is named inp_max_ms, not inp", () => {
    /**
     * Real INP is the p98 of interaction latencies across a session. The tour
     * visits a route, screenshots it and leaves — nowhere near enough
     * interactions for a percentile to mean anything. Naming the field `inp`
     * would be claiming a metric this measurement cannot produce, which is the
     * failure mode this repo has spent the day removing from its data.
     */
    const src = read("tests/e2e/harness/vitals.ts");
    expect(src).toContain("inp_max_ms");
    expect(src).not.toMatch(/^\s*inp:/m);
  });

  it("the written artifact says so in words", () => {
    // The reader of a JSON file six months from now will not have read this
    // test.
    expect(read("tests/e2e/harness/tour.ts")).toMatch(/not INP/);
  });
});
