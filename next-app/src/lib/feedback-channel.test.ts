import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { isPublicRoute, isSemiPublicRoute } from "@/lib/route-access";

const ROOT = path.resolve(process.cwd());
const FN = path.join(ROOT, "functions", "api", "feedback.ts");
const PAGE = path.join(ROOT, "src", "app", "feedback", "page.tsx");
const PROFILE = path.join(ROOT, "src", "app", "profile", "page.tsx");

const read = (p: string) => fs.readFileSync(p, "utf8");
const stripComments = (s: string) =>
  s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

/**
 * The feedback channel, and the three ways it could go wrong.
 *
 * Beta users had no way to say anything. The app asks for a symptom score
 * every morning and an Accept or Ignore on every proposal, and offered no
 * channel to report that a proposal made no sense — the only route was knowing
 * the founder personally, which describes this beta and not the next one.
 *
 * A form that sends mail is also the easiest thing in an app to get wrong, in
 * three specific ways, and each has a test:
 *
 *   1. An OPEN RELAY. An unauthenticated endpoint that mails a fixed address
 *      is a spam vector with a nice UI.
 *   2. A SPOOFABLE sender. If the address comes from the request body rather
 *      than the verified token, any user can make feedback appear to come from
 *      anyone.
 *   3. LEAKING THE LOG. The tempting "attach context" version reads the user's
 *      store server-side. A feedback form is not a reason to give a mail
 *      function access to Article 9 health data.
 */
describe("feedback channel", () => {
  const fn = stripComments(read(FN));

  it("requires a verified session — not an open relay", () => {
    expect(fn, "no auth check in the feedback endpoint").toContain("requireUser");
    expect(fn, "the token must be checked against Supabase, not just parsed").toContain(
      "/auth/v1/user",
    );
  });

  it("takes the sender from the token, never from the request body", () => {
    // The address used for `reply_to` and the subject must come from the
    // verified identity. If `payload.email` ever appears here, feedback can be
    // made to look like it came from another user.
    expect(fn).toContain("who.email");
    expect(fn, "sender must not be read off the request body").not.toMatch(
      /payload\.(email|from|sender)/,
    );
  });

  it("sends to the one canonical contact address", () => {
    // Same address the landing and the app already use; `data-integrity`
    // asserts those agree, and a third spelling here would fork it again.
    expect(fn).toContain('"sellinmargus@gmail.com"');
  });

  it("caps the message rather than letting the provider reject it", () => {
    // A 4xx from Resend is not something a user can act on.
    expect(fn).toMatch(/MAX_MESSAGE\s*=\s*\d+/);
    expect(fn).toContain("message.length > MAX_MESSAGE");
  });

  it("says so when mail is unconfigured, instead of failing silently", () => {
    // The silent version is a user typing out a considered bug report and
    // watching it vanish. `RESEND_API_KEY` is a runtime Pages binding and can
    // be absent while everything else is green — see CLAUDE.md.
    expect(fn).toContain("RESEND_API_KEY");
    expect(fn).toMatch(/503/);
  });

  it("the endpoint never reads the user's store", () => {
    // Context is attached client-side and travels in the body. Nothing here
    // should reach for logs, symptoms or training maxes.
    for (const forbidden of ["logs", "symptoms", "training_maxes", "user_states"]) {
      expect(fn, `feedback endpoint references ${forbidden}`).not.toContain(forbidden);
    }
  });

  it("the page attaches only programme and path", () => {
    const page = stripComments(read(PAGE));
    expect(page).toContain("active_program_id");
    for (const forbidden of ["store.logs", "symptoms", "training_maxes"]) {
      expect(page, `feedback page reads ${forbidden}`).not.toContain(forbidden);
    }
  });

  it("/feedback is behind auth", () => {
    // It mails on the user's behalf, so an unauthenticated visitor has no
    // business reaching the form either.
    expect(isPublicRoute("/feedback")).toBe(false);
    expect(isSemiPublicRoute("/feedback")).toBe(false);
  });

  it("Profile links to it — a PWA has no address bar", () => {
    expect(stripComments(read(PROFILE))).toContain('href="/feedback/"');
  });
});
