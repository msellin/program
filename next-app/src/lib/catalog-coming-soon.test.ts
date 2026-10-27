import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { PERSONAS } from "../../tests/e2e/harness/personas";

/**
 * L-04 (2026-10-27): the launch catalog. Three programs are open to new
 * starts and advertised; the rest are listed as "coming soon" until their
 * claims and gates are fixed. The app manifest and the landing catalog say
 * the same thing, and every shipped program keeps a persona either way:
 * "coming soon" closes new starts, not existing users' plans.
 */
const ROOT = path.resolve(__dirname, "..", "..");
const manifest = JSON.parse(
  fs.readFileSync(path.join(ROOT, "public/data/programs/manifest.json"), "utf8"),
) as { programs: { slug: string; personal?: boolean; coming_soon?: boolean }[] };
const LANDING = path.resolve(ROOT, "..", "landing", "src", "lib", "programs-catalog.ts");

const ADVERTISED = ["concurrent-strength-maintenance", "first-strict-pullup", "handstand-walk"];

describe("launch catalog (L-04)", () => {
  const publicPrograms = manifest.programs.filter((p) => !p.personal);

  it("exactly the advertised programs are open to new starts", () => {
    expect(publicPrograms.filter((p) => !p.coming_soon).map((p) => p.slug).sort()).toEqual(ADVERTISED);
  });

  it("the landing marks the same programs open and coming", () => {
    if (!fs.existsSync(LANDING)) return;
    const src = fs.readFileSync(LANDING, "utf8");
    const landing = new Map(
      [...src.matchAll(/slug:\s*"([^"]+)"[\s\S]*?status:\s*"(AVAILABLE|COMING|PERSONAL)"/g)].map((m) => [m[1], m[2]]),
    );
    const mismatches = publicPrograms
      .map((p) => ({ slug: p.slug, app: p.coming_soon ? "COMING" : "AVAILABLE", landing: landing.get(p.slug) }))
      .filter((r) => r.app !== r.landing);
    expect(mismatches).toEqual([]);
  });

  it("every program, open or coming soon, still has a harness persona", () => {
    const covered = new Set(PERSONAS.flatMap((p) => [p.programSlug, ...(p.additionalProgramSlugs ?? [])]));
    expect(manifest.programs.map((p) => p.slug).filter((s) => !covered.has(s))).toEqual([]);
  });
});
