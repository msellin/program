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
  const NOT_FOUND = ["kim_2013", "kilding_2012", "ferrari_2021"];
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
