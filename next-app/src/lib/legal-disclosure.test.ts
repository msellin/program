import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

/**
 * AUDIT-1's actual headline was never "the privacy page is wrong". It was
 * "the legal pages describe a system that no longer exists, and NOTHING
 * CHECKS THEM." Every correction so far has been a one-off: the Cloudflare KV
 * sub-processor entry that survived the August Postgres migration, the
 * "Frankfurt" region that was always Ireland, the blanket "no email attached"
 * that the feedback widget falsified the day it shipped. Each was found by a
 * person reading the page, which is not a mechanism.
 *
 * This file is the mechanism. It pins the disclosures that ARE derivable from
 * the codebase — which processors the code actually talks to, and whether a
 * page's own freshness claim is a real assertion — and deliberately does not
 * touch the ones that are not. What the retention period should be, or
 * whether a processor needs a DPA, is a legal judgement and belongs to the
 * founder. Whether the app imports Sentry is not.
 */

const APP = path.resolve(__dirname, "..");
const REPO = path.resolve(__dirname, "../../..");
const LANDING = path.join(REPO, "landing/src/app");

const appLegal = {
  privacy: path.join(APP, "app/legal/privacy/page.tsx"),
  terms: path.join(APP, "app/legal/terms/page.tsx"),
  disclaimer: path.join(APP, "app/legal/disclaimer/page.tsx"),
};
const landingLegal = {
  privacy: path.join(LANDING, "privacy/page.tsx"),
  terms: path.join(LANDING, "terms/page.tsx"),
  disclaimer: path.join(LANDING, "disclaimer/page.tsx"),
};

const readIfPresent = (p: string) => (fs.existsSync(p) ? fs.readFileSync(p, "utf8") : null);
const appPrivacy = fs.readFileSync(appLegal.privacy, "utf8");
const appDeps = Object.keys(
  JSON.parse(fs.readFileSync(path.join(APP, "../package.json"), "utf8")).dependencies ?? {},
);
const functionsSrc = fs
  .readdirSync(path.join(APP, "../functions/api/admin"))
  .map((f) => fs.readFileSync(path.join(APP, "../functions/api/admin", f), "utf8"))
  .join("\n");

describe("a legal page's freshness claim must be an assertion, not a clock reading", () => {
  // `Last updated {new Date().getFullYear()}` re-stamps itself as current on
  // every build, whether or not a word changed — and will say 2027 next
  // January with no edit. A page that cannot go stale cannot be detected as
  // stale, which is the exact failure AUDIT-1 names, mechanised into the page.
  for (const [name, file] of Object.entries({ ...appLegal, ...landingLegal })) {
    const src = readIfPresent(file);
    if (src == null) continue;
    it(`${file.includes("landing") ? "landing" : "app"}/${name} does not compute its own date`, () => {
      expect(src).not.toMatch(/new Date\(\)/);
    });
  }
});

describe("every processor the code talks to is disclosed", () => {
  // One direction only. Code present ⟹ named on the privacy page. The
  // converse would fail on Paddle, which is disclosed ahead of the paid tier
  // as "when paid tier launches" — disclosing early is not a defect.
  const required: Array<{ label: string; present: boolean; why: string }> = [
    {
      label: "Supabase",
      present: appDeps.some((d) => d.startsWith("@supabase/")),
      why: "@supabase/* is a dependency",
    },
    {
      label: "Sentry",
      present: appDeps.includes("@sentry/nextjs"),
      why: "@sentry/nextjs is a dependency",
    },
    {
      label: "Resend",
      present: /resend/i.test(functionsSrc),
      why: "a Pages Function calls Resend",
    },
  ];

  for (const r of required) {
    it(`names ${r.label} when ${r.why}`, () => {
      if (!r.present) return;
      expect(appPrivacy).toContain(r.label);
    });
  }
});

describe("the sub-processor list does not name a store the app stopped using", () => {
  // The specific historical failure: the list named Cloudflare KV for training
  // and symptom data for two weeks after `PostgresAdapter` became the only
  // implementation of the persistence interface. Generalising "is this store
  // still used?" is not possible; pinning the one that already went wrong is.
  it("only claims Cloudflare KV holds user data if a KV adapter exists", () => {
    const adapters = fs
      .readdirSync(path.join(APP, "lib/persistence"))
      .filter((f) => f.endsWith(".ts") && !f.includes(".test."));
    const hasKvAdapter = adapters.some((f) => /kv/i.test(f));
    if (hasKvAdapter) return;
    expect(appPrivacy).not.toMatch(/Cloudflare KV/i);
  });
});

describe("the two privacy pages do not promise different things", () => {
  const landingPrivacy = readIfPresent(landingLegal.privacy);

  it("agree on how a policy change reaches the user", () => {
    if (landingPrivacy == null) return;
    // The app page promises email, and `POST /api/admin/notify` makes that
    // true. A second page promising a different channel is a second promise,
    // and the one with no mechanism behind it is the one users would rely on.
    const channel = /announced by email/i;
    const appPromises = channel.test(appPrivacy);
    const landingPromises = channel.test(landingPrivacy);
    if (!appPromises) return;
    expect(
      landingPromises || !/will be announced/i.test(landingPrivacy),
    ).toBe(true);
  });

  it("does not claim zero third-party embeds on a page the app contradicts", () => {
    if (landingPrivacy == null) return;
    // The app page discloses the click-to-load YouTube embed. If the landing
    // ever widens its "no trackers" line from advertising to all third-party
    // requests, the two pages disagree about the same product.
    if (/no third-party (requests|embeds)/i.test(landingPrivacy)) {
      expect(appPrivacy).not.toMatch(/YouTube/i);
    }
  });
});
