import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import { hasSelfReportProxy, selfReportProxySlugs } from "./intake-tier";

const DIR = path.resolve(__dirname, "../../../public/data/programs");

type Prog = {
  slug?: string;
  plan_tiers?: Array<{ id: string; condition?: string }>;
  intake?: { physical_tests?: Array<{ id: string }> };
};

function programs(): Array<[string, Prog]> {
  return fs
    .readdirSync(DIR)
    .filter((f) => f.endsWith(".json") && f !== "manifest.json")
    .map((f) => [f.replace(/\.json$/, ""), JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8")) as Prog]);
}

/**
 * A programme that places users by measured result must either proxy the
 * self-report, or stop promising that it does.
 *
 * The intake's physical-test step told every user: "Physical tests are
 * optional. Skip and we use your self-report as a proxy." That is true for
 * three programmes and false for two. `SELF_REPORT_TO_TEST_VAR` is keyed by
 * slug, `muscle-up` and `overhead-mobility` have no entry, and an unresolved
 * test variable falls back to 0 — so the self-report is not a proxy, it is
 * discarded.
 *
 * The visible consequence: `muscle-up`'s `tier_b_transition` needs
 * `ring_dip_max_reps >= 3`, which cannot be true for a skipper, so a user who
 * reports 3-5 ring dips is placed in `tier_a_prep` — the tier for people who
 * cannot do three — with the internal rationale "No tier matched — defaulted
 * to lowest".
 *
 * This test does not demand the maps be built. Deciding that "3-5 ring dips"
 * means 3 rather than 4 is a programming judgement about who gets which tier
 * and belongs to the programme author. It demands only that the two facts
 * agree: no proxy, no promise.
 */
describe("self-report proxy claims match reality", () => {
  /**
   * Programmes known to place by measured result with no proxy. Listed, not
   * silent — the intake copy branches on `hasSelfReportProxy` so these users
   * are now told they start at the introductory tier instead of being told
   * their self-report will be used.
   */
  const KNOWINGLY_UNPROXIED = new Set(["muscle-up", "overhead-mobility"]);

  it("every proxy map entry names a real programme", () => {
    const slugs = new Set(programs().map(([slug]) => slug));
    const orphans = selfReportProxySlugs().filter((s) => !slugs.has(s));
    expect(orphans).toEqual([]);
  });

  it("a programme whose tiers read a physical test either proxies or is listed", () => {
    const unaccounted: string[] = [];
    for (const [slug, prog] of programs()) {
      const testIds = (prog.intake?.physical_tests ?? []).map((t) => t.id);
      if (!testIds.length) continue;
      const conditions = (prog.plan_tiers ?? []).map((t) => t.condition ?? "").join(" ");
      // Does any tier condition actually read a physical-test variable?
      const readsATest = testIds.some((id) => conditions.includes(id));
      if (!readsATest) continue;
      if (hasSelfReportProxy(slug)) continue;
      if (KNOWINGLY_UNPROXIED.has(slug)) continue;
      unaccounted.push(slug);
    }
    expect(
      unaccounted,
      "these programmes place users by a measured test with no self-report proxy, " +
        "and are not listed as knowingly unproxied. Either add a " +
        "SELF_REPORT_TO_TEST_VAR entry or add the slug to KNOWINGLY_UNPROXIED " +
        "so the intake stops promising a proxy it does not have.",
    ).toEqual([]);
  });

  it("the listed programmes really do lack a proxy", () => {
    // Guards the list itself. If someone builds the muscle-up map, this fails
    // and the slug should come off KNOWINGLY_UNPROXIED — otherwise the intake
    // would keep showing the pessimistic copy after the proxy exists.
    const stale = [...KNOWINGLY_UNPROXIED].filter((s) => hasSelfReportProxy(s));
    expect(stale, "these now HAVE a proxy — remove them from KNOWINGLY_UNPROXIED").toEqual([]);
  });
});
