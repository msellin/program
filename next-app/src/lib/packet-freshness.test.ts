import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

/**
 * A reviewer packet that no longer describes what ships is worse than no
 * packet — it sends a specialist a document that quietly lies, and the whole
 * point of generating them (rather than writing them) was that they cannot
 * drift.
 *
 * They drifted anyway, because regeneration is manual. The packets were built
 * 2026-09-02 and declared sent-ready. On 2026-09-03 a citation's byline was
 * corrected — `sci_reports_2026_handstand_shoulder`, whose `used_for` had
 * said its existence at the claimed URL was "unconfirmed" until one HTTP
 * request showed the paper is real. Nothing regenerated the packets, so the
 * document waiting to be emailed to a reviewer still opened that citation by
 * telling them we could not confirm the paper existed.
 *
 * So each packet now embeds a fingerprint of the exact data files it was built
 * from, and this recomputes it. Edit a citation or a program without
 * regenerating and the suite fails with the command to run.
 *
 * Deliberately recomputed in JS rather than by shelling out to the generator:
 * the check must not need a Python runtime in CI, and a test that re-runs the
 * thing it is checking proves only that the generator is deterministic.
 */

const REPO = path.resolve(__dirname, "../../..");
const DATA = path.join(REPO, "next-app/public/data");
const PACKETS = path.join(REPO, "dev/audits/reviewer-packets");

/** Must mirror `source_fingerprint` in dev/scripts/build-reviewer-packet.py. */
function fingerprint(slugs: string[]): string {
  const h = crypto.createHash("sha256");
  const paths = [
    path.join(DATA, "citations.json"),
    path.join(DATA, "programs", "manifest.json"),
    ...[...slugs].sort().map((s) => path.join(DATA, "programs", `${s}.json`)),
  ];
  for (const p of paths) {
    h.update(path.basename(p), "utf8");
    h.update(Buffer.from([0]));
    h.update(fs.readFileSync(p));
    h.update(Buffer.from([0]));
  }
  return h.digest("hex").slice(0, 16);
}

/** Must mirror DOMAINS in the generator. */
const DOMAINS: Record<string, string[]> = {
  "gymnastics-skill": ["first-strict-pullup", "muscle-up", "handstand-walk"],
  "endurance-engine": ["engine-builder", "engine-builder-block-2"],
  "endurance-race-concurrent": ["rowing-2k-test-prep", "concurrent-strength-maintenance"],
  mobility: ["overhead-mobility"],
};

describe("reviewer packets describe what currently ships", () => {
  for (const [domain, slugs] of Object.entries(DOMAINS)) {
    it(`${domain}.md is current`, () => {
      const file = path.join(PACKETS, `${domain}.md`);
      expect(fs.existsSync(file), `${domain}.md is missing — run the generator`).toBe(true);
      const src = fs.readFileSync(file, "utf8");
      const found = /<!-- source-fingerprint: ([0-9a-f]{16}) -->/.exec(src)?.[1];
      expect(
        found,
        `${domain}.md carries no fingerprint. Run: python3 dev/scripts/build-reviewer-packet.py`,
      ).toBeTruthy();
      expect(
        found,
        `${domain}.md is stale — the program data changed since it was generated. ` +
          `Run: python3 dev/scripts/build-reviewer-packet.py`,
      ).toBe(fingerprint(slugs));
    });
  }

  it("every domain in the generator has a packet on disk", () => {
    // A domain added to the generator but never run produces no file, and the
    // per-domain tests above would be the only thing to notice.
    const onDisk = fs
      .readdirSync(PACKETS)
      .filter((f) => f.endsWith(".md") && !["README.md", "outreach-email.md"].includes(f))
      .map((f) => f.replace(/\.md$/, ""))
      .sort();
    expect(onDisk).toEqual(Object.keys(DOMAINS).sort());
  });

  it("no packet hands a reviewer internal authoring scaffolding", () => {
    // The packets used to open each program with its `status_note`, an
    // authoring field nothing in the app reads. Three of nine use it to record
    // internal state — whitepaper filenames a reviewer cannot open, and in
    // overhead-mobility's case "4 shoulder-specific citations that need
    // pre-launch URL verification". Opening a request for external review by
    // saying our citations are unverified, in the document whose purpose is to
    // have them verified, is the wrong first paragraph.
    const offenders: string[] = [];
    for (const domain of Object.keys(DOMAINS)) {
      const src = fs.readFileSync(path.join(PACKETS, `${domain}.md`), "utf8");
      for (const m of src.matchAll(/^\*\*What it .*$/gm)) {
        if (/whitepaper|pre-launch|will refine|citations\.json/i.test(m[0])) {
          offenders.push(`${domain}: ${m[0].slice(0, 90)}`);
        }
      }
    }
    expect(offenders).toEqual([]);
  });
});
