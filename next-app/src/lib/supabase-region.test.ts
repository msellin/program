import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

/**
 * The privacy page's Supabase region has now been wrong three times.
 *
 * It said "Frankfurt" from the day it was written. On 2026-09-01 that was
 * corrected to "eu-west-1 — Ireland" after the founder read it off Project
 * Settings. On 2026-09-03 the Supabase management API says the project this
 * app actually points at — wrrqzpqgggxhcyabmmlm, the ref in
 * NEXT_PUBLIC_SUPABASE_URL — is in **eu-west-3, Paris**. The account's OTHER
 * project, Odds Intel, is the one in eu-west-1.
 *
 * Every correction so far has been read off a screen by a person. This pins
 * the two things a file can check: that the page names exactly one AWS
 * region, and that the city named next to it is the right city for it. What
 * it cannot check is which project the deployed build points at — that lives
 * in a build-time secret. Sub-processor location is a legal disclosure, so
 * the remaining human step is worth naming rather than automating away.
 */
const PAGE = fs.readFileSync(
  path.resolve(__dirname, "../app/legal/privacy/page.tsx"),
  "utf8",
);

/** AWS region → the city a reader would expect beside it. */
const REGION_CITY: Record<string, string> = {
  "eu-west-1": "Ireland",
  "eu-west-2": "London",
  "eu-west-3": "Paris",
  "eu-central-1": "Frankfurt",
  "eu-north-1": "Stockholm",
};

describe("the Supabase region disclosure", () => {
  it("names the region the app's own project is in", () => {
    // Pinned to the project ref in NEXT_PUBLIC_SUPABASE_URL. If the project
    // moves or the app repoints, this fails and the page gets read again.
    expect(PAGE).toContain("eu-west-3");
  });

  it("does not still name a region the training data is not in", () => {
    // Scoped to the Supabase bullet. Resend legitimately sits in eu-west-1
    // and says so two bullets down — a page-wide grep would flag that and
    // teach the next reader to ignore this test.
    const start = PAGE.indexOf("Supabase</strong>");
    const supabaseLine = PAGE.slice(start, start + 260);
    expect(start).toBeGreaterThan(-1);
    expect(supabaseLine).not.toMatch(/Frankfurt/);
    expect(supabaseLine).not.toMatch(/eu-west-1\b/);
  });

  it("pairs the Supabase region with the right city", () => {
    const start = PAGE.indexOf("Supabase</strong>");
    const line = PAGE.slice(start, start + 260);
    const region = Object.keys(REGION_CITY).find((r) => line.includes(r));
    expect(region, "no AWS region named beside Supabase").toBeTruthy();
    expect(line).toContain(REGION_CITY[region!]);
  });
});
