import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

/**
 * Does the CSM amber softening reach a real user? No. (Established 2026-09-11.)
 *
 * `applyProgramSoftening` is CSM's safety rule: three amber days in a trailing
 * week and `block_4x4_row` is withdrawn. It lives inside `blocksForDate`,
 * behind `if (store)` — `store` being the sixth and optional parameter, so a
 * caller that omits it silently receives the UNSOFTENED plan with no error, no
 * type complaint and no failing test.
 *
 * That much was on the register as a suspicion. The answer is worse than the
 * suspicion:
 *
 *   1. `TodaySession` has two paths. The legacy one calls `blocksForDate` and
 *      passes the store, so the rule applies. The `block_object` one reads
 *      materialized `scheduled_blocks` and NEVER CALLS `blocksForDate AT ALL`.
 *   2. `StoreHydrator` sets `block_object: true` whenever the flag is
 *      undefined. Its own comment: "the flag is effectively on for everyone
 *      unless they opted out on Profile."
 *
 * So the softened path is the one almost nobody is on. A CSM user who has
 * logged three amber days is still prescribed the rowing block the programme's
 * own rule says to withdraw.
 *
 * `materialize-blocks.ts`, which builds those scheduled blocks, also omits the
 * store — so the softening is absent at write time as well as read time. There
 * is nowhere in the block-object flow where it currently could apply.
 *
 * This file does not fix that. Where the rule belongs — filtering at
 * materialization, or at read over materialized blocks — decides whether a
 * withdrawn block disappears from a user's saved week or only from today's
 * view, and that is a prescription decision. It records the gap so it cannot
 * be rediscovered a third time, and fails if any of the load-bearing facts
 * change.
 *
 * Source-text mirror on purpose: the defect is which CALLERS opt in, which is
 * a property of the call sites and not of the function. A behavioural test on
 * `blocksForDate` passes happily while every caller forgets the argument.
 */
const SRC = path.resolve(__dirname, "../../..", "src");
const read = (rel: string) => fs.readFileSync(path.join(SRC, rel), "utf8");

/** `blocksForDate(` … matching close paren. */
function callsIn(src: string): string[] {
  const out: string[] = [];
  let i = src.indexOf("blocksForDate(");
  while (i !== -1) {
    let depth = 0;
    let j = src.indexOf("(", i);
    const start = j;
    for (; j < src.length; j++) {
      if (src[j] === "(") depth++;
      else if (src[j] === ")") {
        depth--;
        if (depth === 0) break;
      }
    }
    out.push(src.slice(start + 1, j));
    i = src.indexOf("blocksForDate(", j);
  }
  return out;
}

/** The store is the 6th argument, so it is last before the close. */
const passesStore = (args: string) => /\bstore\b\s*,?\s*$/.test(args.trim());

/** Callers that DO opt in, and must keep doing so. */
const SOFTENED = [
  "components/session/TodaySession.tsx",
  "components/session/DaySession.tsx",
  "app/plan/page.tsx",
];

/**
 * Callers that do not. OPEN, not approved — shrink this.
 *
 * `lib/engine/daily-plan.ts` was here until 2026-09-11 and is now deleted.
 * `composeDailyPlan` had zero callers anywhere in src — 127 lines that looked
 * like a live read path while being reachable from nothing. It is the kind of
 * entry that makes a gap list longer without making anything safer, and
 * keeping it would have meant carrying a permanent exception for code no user
 * can reach. Recoverable from git history if ever wanted.
 */
const UNSOFTENED: Record<string, string> = {
  "lib/engine/materialize-blocks.ts":
    "THE IMPORTANT ONE — builds scheduled_blocks for the block_object path, " +
    "which is on by default, so the rule is absent at write time too",
  "lib/engine/missed-week.ts": "reconstructs a missed week from the unsoftened plan",
  "components/workout/SignalsStrip.tsx": "derives signals from an unsoftened block list",
  "components/workout/MissedSessionPrompt.tsx": "asks about yesterday's unsoftened plan",
};

describe("the CSM amber softening and the path users are actually on", () => {
  it.each(SOFTENED)("%s still passes the store", (rel) => {
    const calls = callsIn(read(rel));
    expect(calls.length, `${rel} no longer calls blocksForDate`).toBeGreaterThan(0);
    expect(
      calls.some(passesStore),
      `${rel} stopped passing \`store\` — the amber rule silently stops applying there`,
    ).toBe(true);
  });

  it.each(Object.keys(UNSOFTENED))("%s is still on record as unsoftened", (rel) => {
    const calls = callsIn(read(rel));
    if (!calls.length) return;
    expect(
      calls.some(passesStore),
      `${rel} now passes the store — delist it (${UNSOFTENED[rel]})`,
    ).toBe(false);
  });

  it("no OTHER caller quietly skips the softening", () => {
    const known = new Set([...SOFTENED, ...Object.keys(UNSOFTENED)]);
    const offenders: string[] = [];
    const walk = (dir: string) => {
      for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, e.name);
        if (e.isDirectory()) { walk(full); continue; }
        if (!/\.tsx?$/.test(e.name) || e.name.includes(".test.")) continue;
        const rel = path.relative(SRC, full);
        if (known.has(rel) || rel === "lib/engine/plan-generator.ts") continue;
        const calls = callsIn(fs.readFileSync(full, "utf8"));
        if (calls.length && !calls.some(passesStore)) offenders.push(rel);
      }
    };
    walk(SRC);
    expect(
      offenders,
      "new blocksForDate caller without `store` — pass it, or add it to UNSOFTENED with a reason",
    ).toEqual([]);
  });

  it("the block_object path softens, even though it never calls blocksForDate", () => {
    /**
     * Updated 2026-09-11, when the gap this file recorded was closed.
     *
     * The branch still does not call `blocksForDate` — it reads materialized
     * `scheduled_blocks`, which is the whole point of the block-object path.
     * What changed is that it now applies `applyProgramSoftening` directly, so
     * the safety rule reaches the path users are actually on.
     *
     * Comments are stripped before matching. The first version of this
     * assertion broke the moment the fix landed, because the fix's own comment
     * explains that the branch "never calls blocksForDate" — and the check was
     * scanning prose. Third time in one day that a guard matched an
     * explanation instead of code.
     */
    const src = read("components/session/TodaySession.tsx");
    const branch = src.slice(
      src.indexOf("if (blockObjectOn && p.slug)"),
      src.indexOf("// Legacy path."),
    );
    expect(branch.length, "the block_object branch moved").toBeGreaterThan(0);

    const code = branch
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/^\s*\/\/.*$/gm, "");

    expect(
      code.includes("blocksForDate"),
      "block_object path now routes through blocksForDate — re-read this file, the model here has changed",
    ).toBe(false);
    expect(
      code,
      "block_object path stopped softening — the safety rule is inert again for ~every user",
    ).toContain("applyProgramSoftening");
  });

  it("block_object is still defaulted ON for users who never chose", () => {
    // The fact that makes the bypass matter. If this flips, the exposure
    // changes and the priority of fixing it changes with it.
    const hydrator = read("components/StoreHydrator.tsx");
    expect(hydrator).toMatch(/block_object === undefined/);
    expect(hydrator).toMatch(/setFeatureFlag\("block_object",\s*true\)/);
  });
});
