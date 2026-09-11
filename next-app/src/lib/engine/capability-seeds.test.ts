import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

/**
 * Every programme with physical tests is seeded, and every seed is honest.
 *
 * `simulator-v2.ts` has a `capabilitySeed` writer and, for a long time, almost
 * nothing to write: `capability_profile` came back `{}` in all 23 persona
 * artifacts, the `bumpBy` ramp looped over an empty object every persona-day,
 * and every baseline-dependent surface in the app went unexercised by the
 * fleet. Retest cards rendered "— · — · —" and no persona ever caught it.
 *
 * The gap was reported first as "0 of 23 personas define capabilitySeed" and
 * later as "7 of 9 programmes unseeded". Both overcount. Three programmes —
 * anterior-hip-rebuild, concurrent-strength-maintenance, rowing-2k-test-prep —
 * declare NO physical tests, so there is nothing to seed and never was. Six
 * are seedable.
 *
 * Three properties are worth holding, and the third is the one that bites:
 *
 *   1. Every seedable programme has a seed.
 *   2. Every seeded key is a real test id — a typo writes a
 *      `capability_profile` entry nothing will ever read, which is the same
 *      silent-drift failure as the tier keys and the block slots.
 *   3. Every seed is CONSISTENT WITH THE TIER the persona actually lands in.
 *      Personas set no `tier`, so `resolveActiveTier` falls back to
 *      `plan_tiers[0]`. A muscle-up seed of 5 pull-ups and 4 ring dips would
 *      satisfy `tier_b_transition` while the harness believes it is testing
 *      tier A — the fleet would be exercising a different programme state
 *      from the one its own report claims.
 */
const DATA = path.resolve(process.cwd(), "public", "data", "programs");
const SIM = path.resolve(process.cwd(), "tests", "e2e", "harness", "simulator-v2.ts");

type Program = {
  intake?: { physical_tests?: Array<{ id?: string }> };
  plan_tiers?: Array<{ id?: string; condition?: string }>;
};

const load = (slug: string) =>
  JSON.parse(fs.readFileSync(path.join(DATA, `${slug}.json`), "utf8")) as Program;

const slugs = fs
  .readdirSync(DATA)
  .filter((f) => f.endsWith(".json") && f !== "manifest.json")
  .map((f) => f.replace(/\.json$/, ""));

/** Parse the CAPABILITY_SEEDS literal out of the simulator. */
function seeds(): Record<string, Record<string, number>> {
  const src = fs.readFileSync(SIM, "utf8");
  const start = src.indexOf("const CAPABILITY_SEEDS");
  expect(start, "CAPABILITY_SEEDS is gone from the simulator").toBeGreaterThan(-1);
  const body = src.slice(start, src.indexOf("\n  };", start));
  const out: Record<string, Record<string, number>> = {};
  // `"slug": {` … `}` — comments between entries are skipped by the shape.
  for (const m of body.matchAll(/"([a-z0-9-]+)":\s*\{([^}]*)\}/g)) {
    const entries: Record<string, number> = {};
    for (const kv of m[2].matchAll(/([a-z0-9_]+):\s*(-?\d+(?:\.\d+)?)/g)) {
      entries[kv[1]] = Number(kv[2]);
    }
    out[m[1]] = entries;
  }
  return out;
}

const SEEDS = seeds();
const seedable = slugs.filter((s) => (load(s).intake?.physical_tests ?? []).length > 0);

describe("persona capability seeds", () => {
  it("there are seedable programmes and the parser found seeds", () => {
    // Guards the guard: a regex that silently matches nothing would make every
    // assertion below vacuous.
    expect(seedable.length).toBeGreaterThan(0);
    expect(Object.keys(SEEDS).length).toBeGreaterThan(0);
  });

  it.each(seedable)("%s is seeded", (slug) => {
    expect(
      SEEDS[slug],
      `${slug} declares physical tests but the fleet never seeds them — its ` +
        "capability_profile stays {} and every baseline surface goes unexercised",
    ).toBeTruthy();
  });

  it("no programme WITHOUT physical tests carries a seed", () => {
    // The other direction: a seed for a programme with no tests writes keys
    // nothing can resolve.
    const noTests = slugs.filter((s) => !seedable.includes(s));
    expect(noTests.filter((s) => SEEDS[s])).toEqual([]);
  });

  it.each(seedable)("%s seeds only real test ids", (slug) => {
    const known = new Set(
      (load(slug).intake?.physical_tests ?? []).map((t) => t.id).filter(Boolean),
    );
    const unknown = Object.keys(SEEDS[slug] ?? {}).filter((k) => !known.has(k));
    expect(unknown, `${slug}: seeded key matches no physical_test id`).toEqual([]);
  });

  /**
   * Tier consistency, for the programmes whose tier conditions actually read
   * these tests.
   *
   * The engine programmes tier on intake answers (`cardio_hours_per_week`),
   * so their seeds cannot move the tier and are excluded rather than
   * asserted against a condition they do not appear in.
   */
  const TIER_A_EXPECT: Record<string, (s: Record<string, number>) => boolean> = {
    // tier_a_hang: dead_hang_max_seconds < 15
    "first-strict-pullup": (s) => s.dead_hang_max_seconds < 15,
    // tier_a_prep: strict_pullup_max_reps >= 3 && ring_dip_max_reps < 3
    "muscle-up": (s) => s.strict_pullup_max_reps >= 3 && s.ring_dip_max_reps < 3,
  };

  it.each(Object.keys(TIER_A_EXPECT))(
    "%s's seed lands the persona in plan_tiers[0], not somewhere else",
    (slug) => {
      const seed = SEEDS[slug];
      expect(seed, `${slug} unseeded`).toBeTruthy();
      const firstTier = load(slug).plan_tiers?.[0]?.id;
      expect(
        TIER_A_EXPECT[slug](seed),
        `${slug}: seed does not satisfy ${firstTier}'s condition — personas set no ` +
          "tier, so the fleet would silently exercise a different tier from the one it reports",
      ).toBe(true);
    },
  );

  it("the tier conditions these expectations mirror have not changed", () => {
    // The mirror above is hand-written from the JSON. If an author edits a
    // condition, the expectation must be re-read rather than left asserting
    // yesterday's rule.
    expect(load("first-strict-pullup").plan_tiers?.[0]?.condition).toBe(
      "dead_hang_max_seconds < 15",
    );
    expect(load("muscle-up").plan_tiers?.[0]?.condition).toBe(
      "strict_pullup_max_reps >= 3 && ring_dip_max_reps < 3",
    );
  });
});
