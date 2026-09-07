import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";

type Citation = {
  id: string;
  url?: string;
  doi?: string;
  pmid?: string;
  verification_status?: string;
  review_note?: string;
};

const CITATIONS = (
  JSON.parse(
    fs.readFileSync(
      path.resolve(__dirname, "../../public/data/citations.json"),
      "utf8",
    ),
  ) as { citations: Citation[] }
).citations;

const byId = new Map(CITATIONS.map((c) => [c.id, c]));

/**
 * Citations found NOT to exist stay labelled as such.
 *
 * The 2026-09-05 sweep checked all 126 records against the live literature.
 * Roughly 45% verified clean; the rest split between overstated, misattributed
 * and — these — papers that are not retrievable at all under the byline, title
 * and venue claimed for them.
 *
 * The label is an annotation, not a withdrawal: nothing in the app reads
 * `verification_status`, so a phantom still renders on /evidence as a cited
 * study. What the label buys is that the finding cannot be quietly lost the
 * next time someone edits the record, and that a re-verification pass can tell
 * "checked, absent" from "not yet checked".
 *
 * There are two verdicts here and they must not collapse into one. A paper
 * that does not exist and a real paper whose text nobody could retrieve are
 * different problems with different fixes, and this repo's signature defect is
 * a correct decision applied uniformly to cases that differ.
 */
describe("citation verification labels survive edits", () => {
  const NOT_FOUND = ["kim_2013", "kilding_2012"];
  /**
   * Withdrawn, not merely labelled.
   *
   * `ferrari_2021` was retired from handstand-walk on 2026-08-18 and the
   * retirement never reached `citations.json` or `exercises.json`. The
   * exercises half has since been done — every handstand drill now cites
   * `grabowiecki_2021` (PMID 33839425), which is real, verified, and states
   * the repo's own cue rationale almost verbatim — leaving the record an
   * orphan that nothing referenced and `/evidence` still rendered as a cited
   * study. Removed 2026-09-07, which completes a decision already taken
   * rather than making a new one.
   */
  const WITHDRAWN = ["ferrari_2021"];

  it.each(WITHDRAWN)("%s is gone from the library, not just labelled", (id) => {
    expect(byId.has(id)).toBe(false);
  });
  const RECORD_OK_CLAIM_NOT = ["robertson_2004", "salmoni_schmidt_walter_1984"];

  it.each(NOT_FOUND)("%s is labelled not_found", (id) => {
    const c = byId.get(id);
    expect(c, `${id} missing from citations.json`).toBeDefined();
    expect(c!.verification_status).toBe("not_found");
    expect(
      (c!.review_note ?? "").length,
      `${id} needs a note saying what was searched, not just a verdict`,
    ).toBeGreaterThan(80);
  });

  it.each(RECORD_OK_CLAIM_NOT)(
    "%s is labelled record-verified but claim-unverified, and is followable",
    (id) => {
      const c = byId.get(id);
      expect(c, `${id} missing from citations.json`).toBeDefined();
      expect(c!.verification_status).toBe("record_verified_claim_unverified");
      // The whole point of this verdict is that the RECORD checked out, so the
      // record must carry the identifier that let it check out.
      expect(c!.doi ?? c!.pmid, `${id} verified against a record but carries no identifier`)
        .toBeTruthy();
    },
  );

  /**
   * A search box is not a citation.
   *
   * Several records shipped a PubMed query string in `url`
   * (`pubmed.ncbi.nlm.nih.gov/?term=...`). Those render on /evidence as a link
   * that looks like a source and resolves to a results page — which is exactly
   * how `kim_2013` and `kilding_2012` went unnoticed: a link that always works
   * is indistinguishable from one that points at a real paper. Seven were
   * corrected on 2026-09-05; this keeps them corrected.
   */
  it("no citation links to a search query instead of a record", () => {
    const offenders = CITATIONS.filter((c) => /[?&]term=|\/\?/.test(c.url ?? ""))
      .map((c) => `${c.id}: ${c.url}`);
    expect(offenders).toEqual([]);
  });

  /**
   * And the same rule in the programmes, which is where six of them were.
   *
   * Yesterday's version of this test checked `citations.json` only, passed
   * clean, and I recorded the search-query URLs as fixed. Every programme
   * keeps its OWN copy of a reference in `evidence_base.references[]`, and
   * six of those copies still carried the search string — including
   * `kim_2013` and `kilding_2012`, the two phantoms, whose "links" resolved
   * to a results page and therefore looked alive.
   *
   * A guard applied to one of two places that hold the same data is this
   * repo's signature defect, and I wrote one into the fix for it.
   */
  it("no programme reference links to a search query either", () => {
    const dir = path.resolve(__dirname, "../../public/data/programs");
    const offenders = fs
      .readdirSync(dir)
      .filter((f) => f.endsWith(".json") && f !== "manifest.json")
      .flatMap((f) => {
        const prog = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")) as {
          evidence_base?: { references?: Array<{ id?: string; url?: string }> };
        };
        return (prog.evidence_base?.references ?? [])
          .filter((r) => /[?&]term=|\/\?/.test(r.url ?? ""))
          .map((r) => `${f} → ${r.id}: ${r.url}`);
      });
    expect(offenders).toEqual([]);
  });

  /**
   * A programme's copy of a reference must not contradict the library.
   *
   * `kibler_2013`, `bullock_2019` and `manske_2010` all had a verified PubMed
   * URL in `citations.json` and a search-box string in the programme copy —
   * the correction had been made once and never propagated.
   */
  it("a programme reference carries the library's identifier where one exists", () => {
    const dir = path.resolve(__dirname, "../../public/data/programs");
    const drift = fs
      .readdirSync(dir)
      .filter((f) => f.endsWith(".json") && f !== "manifest.json")
      .flatMap((f) => {
        const prog = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")) as {
          evidence_base?: { references?: Array<{ id?: string; doi?: string; pmid?: string }> };
        };
        return (prog.evidence_base?.references ?? []).flatMap((r) => {
          const lib = r.id ? byId.get(r.id) : undefined;
          if (!lib) return [];
          const out: string[] = [];
          if (lib.doi && r.doi && lib.doi !== r.doi) out.push(`${f} → ${r.id}: doi ${r.doi} ≠ ${lib.doi}`);
          if (lib.pmid && r.pmid && lib.pmid !== r.pmid) out.push(`${f} → ${r.id}: pmid ${r.pmid} ≠ ${lib.pmid}`);
          return out;
        });
      });
    expect(drift).toEqual([]);
  });

  /**
   * Every unverified verdict carries its evidence.
   *
   * A bare `verification_status` is an assertion; the note is what lets the
   * next reader re-run the searches instead of trusting this one.
   */
  it("every non-verified label explains itself", () => {
    const unexplained = CITATIONS.filter(
      (c) =>
        c.verification_status &&
        c.verification_status !== "verified" &&
        c.verification_status !== "pending" &&
        !(c.review_note && c.review_note.length > 80),
    ).map((c) => c.id);
    expect(unexplained).toEqual([]);
  });
});
