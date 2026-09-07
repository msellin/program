import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";

const DATA = path.resolve(__dirname, "../../public/data");
const CATALOG = path.resolve(__dirname, "../../../landing/src/lib/programs-catalog.ts");

type Citation = { id: string; verification_status?: string };
type Manifest = { programs: Array<{ slug: string; status?: string }> };

const CITATIONS: Record<string, Citation> = Object.fromEntries(
  (JSON.parse(fs.readFileSync(path.join(DATA, "citations.json"), "utf8")) as {
    citations: Citation[];
  }).citations.map((c) => [c.id, c]),
);

const MANIFEST = JSON.parse(
  fs.readFileSync(path.join(DATA, "programs/manifest.json"), "utf8"),
) as Manifest;

function referenceIdsOf(slug: string): string[] {
  const file = path.join(DATA, "programs", `${slug}.json`);
  if (!fs.existsSync(file)) return [];
  const prog = JSON.parse(fs.readFileSync(file, "utf8")) as {
    reference_ids?: string[];
    evidence_base?: { references?: Array<{ id?: string }> };
  };
  return [
    ...new Set([
      ...(prog.reference_ids ?? []),
      ...(prog.evidence_base?.references ?? []).map((r) => r.id).filter((x): x is string => !!x),
    ]),
  ];
}

/**
 * VERIFIED has to be earned by the citations, not asserted in the manifest.
 *
 * Until 2026-09-07 all eight public programmes carried `status: "REVIEWED"`,
 * which `programs/page.tsx` renders as a green VERIFIED, and the landing
 * hardcoded `review: "verified"` for the same eight. Meanwhile not one of the
 * 124 citations carried a `status` field, so `/evidence` rendered every single
 * study as CITED. The product asserted at the top of a programme what it
 * declined to assert about any of the studies inside it.
 *
 * The 2026-09-05 sweep put a number under that: roughly 45% of 126 records
 * verified clean, three cited papers did not exist at all, and two more were
 * real papers whose contents nobody could retrieve. A green badge on top of
 * that is not a rounding error, it is the claim the landing page leads with.
 *
 * So the badge is now derived. A programme may claim VERIFIED only when every
 * reference it names resolves to a citation carrying
 * `verification_status: "verified"`. None currently does, which is why all
 * eight read CITED — and CITED is true: the studies are named, listed and
 * followable. Nothing about the programmes changed. What changed is that the
 * word means something, and re-earning it is a matter of finishing the
 * verification rather than editing a string.
 */
describe("the VERIFIED badge is derived, not declared", () => {
  const VERIFIED_STATUSES = new Set(["REVIEWED", "VERIFIED", "stable"]);

  function earnsVerified(slug: string): boolean {
    const ids = referenceIdsOf(slug);
    if (ids.length === 0) return false;
    return ids.every((id) => CITATIONS[id]?.verification_status === "verified");
  }

  it("no programme claims VERIFIED without every citation verified", () => {
    const overclaiming = MANIFEST.programs
      .filter((p) => VERIFIED_STATUSES.has(p.status ?? ""))
      .filter((p) => !earnsVerified(p.slug))
      .map((p) => {
        const ids = referenceIdsOf(p.slug);
        const short = ids.filter(
          (id) => CITATIONS[id]?.verification_status !== "verified",
        ).length;
        return `${p.slug}: ${short} of ${ids.length} references not verified`;
      });
    expect(
      overclaiming,
      "either finish verifying those citations or set the programme's manifest " +
        "status to REFERENCED. The badge is a claim about the evidence; it is " +
        "not a description of how much work went into the programme.",
    ).toEqual([]);
  });

  it("no programme is under-claiming either", () => {
    // The rule has to bite in both directions or it is just a downgrade.
    // A programme whose citations are all verified should say so.
    const underclaiming = MANIFEST.programs
      .filter((p) => !VERIFIED_STATUSES.has(p.status ?? ""))
      .filter((p) => earnsVerified(p.slug))
      .map((p) => p.slug);
    expect(
      underclaiming,
      "every citation on these is verified — they have earned REVIEWED.",
    ).toEqual([]);
  });

  it("the landing agrees with the manifest, programme by programme", () => {
    /**
     * The landing keeps its own hardcoded copy of the ladder. That is the
     * shape that let the two drift: the app's own catalog and the marketing
     * page made the same claim from different sources, so correcting one
     * would have left the other stating the opposite.
     */
    const src = fs.readFileSync(CATALOG, "utf8");
    const entries = [...src.matchAll(/slug:\s*"([a-z0-9-]+)"[\s\S]*?review:\s*"(cited|verified)"/g)];
    expect(entries.length, "could not parse the landing catalog").toBeGreaterThan(0);
    const drift = entries
      .map(([, slug, review]) => {
        const status = MANIFEST.programs.find((p) => p.slug === slug)?.status ?? "";
        const appSaysVerified = VERIFIED_STATUSES.has(status);
        return review === "verified" && !appSaysVerified
          ? `${slug}: landing says verified, manifest says ${status || "(none)"}`
          : review === "cited" && appSaysVerified
            ? `${slug}: landing says cited, manifest says ${status}`
            : null;
      })
      .filter(Boolean);
    expect(drift).toEqual([]);
  });
});
