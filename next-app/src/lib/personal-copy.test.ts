import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

/**
 * P-10 (2026-10-30): the guide, shown to every user, named "the anterior-hip
 * case study", and the persona harness typed "no groin pain" into a pull-up
 * user's session note. Both put the founder's personal programme in front of
 * strangers. Hip copy belongs to `anterior-hip-rebuild` alone.
 */
const read = (rel: string) => fs.readFileSync(path.resolve(process.cwd(), rel), "utf8");
const PERSONAL = /anterior[- ]hip|hip case study|groin|labr(al|um)/i;

describe("surfaces every user sees carry no founder hip copy", () => {
  it.each(["src/app/guide/page.tsx", "tests/e2e/harness/flows.ts"])("%s", (rel) => {
    expect(read(rel)).not.toMatch(PERSONAL);
  });
});
