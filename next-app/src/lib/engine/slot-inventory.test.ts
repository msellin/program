import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import type { Program, Block } from "../schemas";
import { composeSlotDrills } from "./plan-generator";

const PROGRAMS = path.resolve(__dirname, "../../../public/data/programs");
const EXERCISES = path.resolve(__dirname, "../../../public/data/exercises.json");

type Ex = { id: string; level?: number; capability_domains?: string[]; prerequisites?: unknown[] };

const drillsById: Record<string, Ex> = Object.fromEntries(
  (JSON.parse(fs.readFileSync(EXERCISES, "utf8")) as { exercises: Ex[] }).exercises.map((e) => [e.id, e]),
);

function programs(): Array<[string, Program]> {
  return fs
    .readdirSync(PROGRAMS)
    .filter((f) => f.endsWith(".json") && f !== "manifest.json")
    .map((f) => {
      const p = JSON.parse(fs.readFileSync(path.join(PROGRAMS, f), "utf8")) as Program;
      p.slug = f.replace(/\.json$/, "");
      return [p.slug, p] as [string, Program];
    });
}

/**
 * Every capability slot must yield at least one drill at every user level.
 *
 * `composeSlotDrills` admits a drill only when `|drill.level - userLevel| <= 1`.
 * The window is symmetric; the drill inventory is not. Where a slot's drills
 * all sit at one end, the composer returns nothing for users at the other, and
 * it does not fail — it falls through to the block's authored `items`. For a
 * slot-based programme those are empty, so the user is shown a NAMED BLOCK
 * WITH NOTHING IN IT, counted in the session summary.
 *
 * Two live instances in overhead-mobility, both confirmed against the data:
 *
 *   thoracic_extension_mobility  drills [1, 1]     → 0 at user level 3 (push)
 *   shoulder_flexion_loaded      drills [3, 3, 4]  → 0 at user level 1 (foundation)
 *   overhead_endurance           drills [3, 3]     → 0 at user level 1 (foundation)
 *
 * The foundation pair never reaches a user — `reference_week_foundation` does
 * not schedule those blocks, which is its own problem (the phases are named
 * for loaded work the tier never receives). The push one does reach users,
 * four days a week, in all three phases.
 *
 * The fix is a programming decision — widen the window, fall back to the
 * nearest available level, or author entry drills — so this test does not
 * make it. It pins the known set so a NEW instance goes red, and counts the
 * existing ones so they stop being invisible. Nothing here was reported by
 * any previous audit; all of it was found by running the real composer.
 */
describe("capability slots are fillable at every level", () => {
  /** `slug/slot@level` for each gap accepted today. Shrink this, never grow it. */
  const KNOWN_GAPS = new Set([
    "overhead-mobility/thoracic_extension_mobility@3",
    "overhead-mobility/shoulder_flexion_loaded@1",
    "overhead-mobility/overhead_endurance@1",
  ]);

  function gapsFor(slug: string, program: Program): string[] {
    const out: string[] = [];
    for (const block of (program.blocks ?? []) as Block[]) {
      const slot = block.capability_slot;
      if (!slot || !program.drill_library?.length) continue;
      // Authored items are the composer's own fallback — a block that carries
      // them can never render empty, so it is not at risk.
      if ((block.items ?? []).length > 0) continue;
      // Every domain gets the same level, not just this slot's.
      // `composeSlotDrills` also drops a drill whose PREREQUISITES are unmet,
      // and a prerequisite names another domain — passing one key made every
      // cross-domain drill look unavailable and produced a gap list full of
      // artefacts of the harness. Measuring the app requires giving it the
      // shape it actually receives.
      const domains = new Set<string>();
      for (const id of program.drill_library ?? []) {
        for (const d of drillsById[id]?.capability_domains ?? []) domains.add(d);
      }
      /**
       * Only the levels this programme can actually assign.
       *
       * `tierIdToBaseLevel` derives a user's level from the tier's POSITION in
       * `plan_tiers`, capped at 5 — so a three-tier programme never produces a
       * level 4 or 5 user, and asking whether its slots are fillable there
       * measures a state no one can be in. The first run of this test reported
       * nine such "gaps"; every one was at level 4 or 5 in a three-tier
       * programme. A test that reports unreachable states as defects trains
       * you to ignore it.
       */
      const maxLevel = Math.min(5, Math.max(1, (program.plan_tiers ?? []).length));
      for (const level of ([1, 2, 3, 4, 5] as const).filter((l) => l <= maxLevel)) {
        const levels = Object.fromEntries([...domains].map((d) => [d, level]));
        const composed = composeSlotDrills(
          program,
          block,
          drillsById as never,
          levels as never,
        );
        if (!composed || (composed.items ?? []).length === 0) {
          out.push(`${slug}/${slot}@${level}`);
        }
      }
    }
    return out;
  }

  const all = programs().flatMap(([slug, p]) => gapsFor(slug, p));

  it("no capability slot is unfillable except the ones on record", () => {
    const unexpected = all.filter((g) => !KNOWN_GAPS.has(g));
    expect(
      unexpected,
      "a user at this level would be shown a named block containing nothing. " +
        "Author a drill at that level, widen the window, or add the entry to " +
        "KNOWN_GAPS with a reason.",
    ).toEqual([]);
  });

  it("the recorded gaps still exist", () => {
    // Guards the list. A gap that has been fixed must come off, or the next
    // regression at that exact slot/level would be silently tolerated.
    const stale = [...KNOWN_GAPS].filter((g) => !all.includes(g));
    expect(stale, "these are fixed — remove them from KNOWN_GAPS").toEqual([]);
  });
});
