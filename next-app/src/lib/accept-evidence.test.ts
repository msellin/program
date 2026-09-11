import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

/**
 * Every Accept that changes the plan records what it was accepted ON.
 *
 * The product's stated mechanic is that the engine proposes, the user Accepts,
 * and every change cites a study or names its log signal. `acceptDayAdjustment`
 * has snapshotted its citation since the feature shipped.
 *
 * Its two siblings on the same `switch` — `promoteTier` and `advancePhase` —
 * did not. So the two most consequential accepts in the app, promoting a user's
 * tier and moving them bodily forward through their programme, were written
 * with no trace of why. `tier_history[]` recorded a promotion and no evidence.
 *
 * The repo's signature defect, in its purest form: the right thing was built,
 * and one sibling was missed.
 *
 * A SNAPSHOT rather than a citation id, matching the sibling. `citations.json`
 * is edited — papers here have been withdrawn, re-attributed and had their
 * claims narrowed — so resolving an id later can show a different sentence
 * from the one the user agreed to, or none at all.
 */
const SRC = path.resolve(process.cwd(), "src");
const read = (rel: string) => fs.readFileSync(path.join(SRC, rel), "utf8");
const stripComments = (s: string) =>
  s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

describe("plan-changing accepts record their evidence", () => {
  const store = stripComments(read("lib/useStore.ts"));

  it.each(["acceptDayAdjustment", "promoteTier", "advancePhase"])(
    "%s snapshots the citation",
    (fn) => {
      // lastIndexOf, not indexOf: the name appears twice — once in the store
      // INTERFACE and once in the implementation below it. The first draft
      // matched the interface, found no call, and reported all three as
      // broken including the one that has worked since it shipped.
      const start = store.lastIndexOf(`  ${fn}: (`);
      expect(start, `${fn} not found in useStore`).toBeGreaterThan(-1);
      // To the next top-level store action.
      const rest = store.slice(start + 1);
      const nextIdx = rest.search(/\n {2}[a-zA-Z]+: \(/);
      const body = nextIdx === -1 ? rest : rest.slice(0, nextIdx);
      expect(
        body,
        `${fn} accepts a plan change without recording what it was accepted on`,
      ).toContain("snapshotCitation");
    },
  );

  it("the accept handler passes the proposal's citation to both siblings", () => {
    // The store can be willing and the caller still pass nothing — which is
    // how this stayed broken while `snapshotCitation` sat imported two lines
    // above the functions that ignored it.
    const actions = stripComments(read("lib/proposals/useProposalActions.ts"));
    for (const fn of ["advancePhase", "promoteTier"]) {
      const i = actions.indexOf(`${fn}(`);
      expect(i, `${fn} call site missing`).toBeGreaterThan(-1);
      expect(
        actions.slice(i, i + 220),
        `${fn} is called without the proposal's citationId`,
      ).toContain("citationId: proposal.citationId");
    }
  });

  it("does not declare a log_signal field nothing writes", () => {
    /**
     * The mechanic is "cites a study OR names its log signal", so a
     * `log_signal` column on `tier_history` looks obviously right. No proposal
     * payload carries one, so it would be written by nothing.
     *
     * That is the exact shape of `daily_log_schema` and
     * `progression_rules.states[]` — authored in good faith, silently
     * discarded by Zod, believed for months. The field arrives with its
     * writer or not at all.
     */
    const schemas = stripComments(read("lib/schemas.ts"));
    const start = schemas.indexOf("tier_history:");
    const block = schemas.slice(start, start + 700);
    expect(block).not.toContain("log_signal");
  });
});
