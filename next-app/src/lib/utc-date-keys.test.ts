import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

/**
 * `toISOString().slice(0, 10)` is a date-key bug east of UTC.
 *
 * `lib/utils.ts` exports `iso()` and says why in its docstring: `toISOString`
 * converts to UTC, "in any timezone east of UTC that flips the calendar date
 * at local midnight, causing off-by-one bugs everywhere date strings are used
 * as keys (skipped, overrides, logs, streak counter, etc.)".
 *
 * The helper existed and the pattern kept being written anyway. On 2026-09-11
 * it was found inside `applyProgramSoftening`, walking CSM's amber window: in
 * UTC+3, where this app is developed and used, `back = 0` resolved to
 * yesterday, the window covered days -1 to -7 instead of 0 to -6, and **the
 * user's amber day today was never counted** by the rule deciding whether they
 * should train today.
 *
 * Ten other call sites use the same pattern. They are baselined rather than
 * fixed in one sweep, because they are not all the same bug — some format a
 * date for display, where a one-day slip is cosmetic, and some compute a
 * PROGRAMME START DATE, where it is not. Each needs reading. The baseline
 * stops the count growing while that happens.
 */
const SRC = path.resolve(process.cwd(), "src");
const PATTERN = /toISOString\(\)\s*\.slice\(\s*0\s*,\s*10\s*\)/;

/**
 * Comments are stripped before matching.
 *
 * Without this, `plan-generator.ts` reported as an offender the moment it was
 * FIXED — its new docstring quotes the pattern to explain what was wrong. The
 * same trap caught the unshipped-block guard earlier the same day: a check
 * that scans prose will be satisfied, or triggered, by the explanation of the
 * thing rather than the thing.
 */
const stripComments = (src: string) =>
  src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

/**
 * Known offenders as of 2026-09-11. OPEN, not approved.
 *
 * Sharpest first: a programme whose start date lands a day early changes which
 * phase a user is in and which day their retest falls on.
 */
const BASELINE: Record<string, string> = {
  // Prescription-critical: a slipped day changes WHAT a user is told to do.
  "lib/engine/materialize-blocks.ts":
    "builds scheduled_blocks keyed by date — the block-object write path",
  "lib/migrations/legacy-to-blocks.ts": "date keys during the one-shot migration",
  "lib/proposals/select.ts": "proposal dating",
  "lib/engine/ensure-materialized.ts": "lookahead window boundaries for materialization",
  "lib/persistence/postgres-adapter.ts": "snapshot keys",
  // Start dates: a day's slip moves every phase boundary after it.
  "app/programs/[slug]/intake/IntakeClient.tsx":
    "computes the PROGRAMME START DATE — moves every phase boundary",
  "app/programs/[slug]/ProgramPreviewClient.tsx": "start date on the preview path",
  "components/StoreHydrator.tsx": "migration 'today' plus a second date key",
  // Read paths and display.
  "components/session/TodaySession.tsx": "date key on the Today read path",
  "components/workout/MissedSessionPrompt.tsx": "yesterday's key",
  "components/workout/PerProgramActions.tsx": "date key behind the per-track verbs",
  "components/workout/SessionActions.tsx": "date key behind the session verbs",
  "components/workout/ReadinessTrail.tsx": "trail cell keys",
  "components/history/BlockHistorySection.tsx": "history grouping keys",
  "components/progress/PerProgramAdherenceCard.tsx": "adherence window keys",
  "components/profile/AwayDays.tsx": "away-period boundaries",
  "components/record/CutCActivityHeatmap.tsx": "heatmap cell key",
  "app/record/page.tsx": "date key while building the record view",
  "app/report/page.tsx": "date key while building the report",
  "app/dev/primitives/page.tsx": "dev-only fixture",
};

function offenders(dir: string, found: string[] = []): string[] {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      offenders(full, found);
      continue;
    }
    if (!/\.tsx?$/.test(e.name) || e.name.includes(".test.")) continue;
    if (PATTERN.test(stripComments(fs.readFileSync(full, "utf8")))) {
      found.push(path.relative(SRC, full));
    }
  }
  return found;
}

describe("UTC date keys", () => {
  const found = offenders(SRC).sort();

  it("no NEW file converts a date key through UTC", () => {
    const unexpected = found.filter((f) => !(f in BASELINE));
    expect(
      unexpected,
      "use `iso()` from lib/utils — toISOString() is UTC and shifts the calendar date east of UTC",
    ).toEqual([]);
  });

  it("fixed files are delisted, so the baseline cannot rot", () => {
    const stale = Object.keys(BASELINE).filter((f) => !found.includes(f));
    expect(stale, "these no longer match — remove them from BASELINE").toEqual([]);
  });

  it("the two fixed on 2026-09-11 stay fixed", () => {
    // Not "the engine is clean" — it is not. These are the two that were
    // traced to a concrete wrong behaviour and repaired:
    //
    //   plan-generator  — CSM's amber window never counted TODAY, the single
    //                     most relevant day to a rule about training today.
    //   schedule        — every phase boundary shifted by intake's
    //                     phase_shift_days landed a day early, moving which
    //                     blocks a user gets and when their retest falls.
    //
    // The rest are listed above and still need reading one at a time. Several
    // are display-only, where a slipped day is cosmetic; several are not.
    for (const f of ["lib/engine/plan-generator.ts", "lib/engine/schedule.ts"]) {
      expect(found, `${f} regressed to UTC date keys`).not.toContain(f);
    }
  });
});
