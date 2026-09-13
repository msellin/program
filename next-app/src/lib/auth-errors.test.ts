import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { mapAuthError } from "@/lib/auth-errors";

const src = (rel: string) => fs.readFileSync(path.resolve(process.cwd(), "src", rel), "utf8");

/**
 * The closed-beta signup message.
 *
 * T87 was filed as "Clerk allowlist mode enabled". Clerk was replaced by
 * Supabase, so the task named a system this project does not have — the same
 * staleness that had `middleware.ts` and `functions/api/state.ts` ticked as
 * done for an architecture that never shipped.
 *
 * Closing the beta is a Supabase dashboard toggle, not code. What IS code is
 * what a visitor sees afterwards: both auth pages rendered `err.message`
 * verbatim, so flipping that toggle would have shown "Signups not allowed for
 * this instance" — accurate, and useless. Someone a beta user recommended the
 * app to reads a sentence about an instance and leaves.
 */
describe("closed-beta signup", () => {
  it("tells the reader what to do, and who to ask", () => {
    const m = mapAuthError("Signups not allowed for this instance");
    expect(m.closedBeta).toBe(true);
    expect(m.message).toMatch(/invite/i);
    expect(m.message, "no way to actually get one").toContain("sellinmargus@gmail.com");
  });

  it("matches the wording variants Supabase has used", () => {
    // The string has changed across versions; matching the whole sentence
    // would break silently on an upgrade and drop the user back to the raw
    // provider text.
    for (const raw of [
      "Signups not allowed for this instance",
      "Signup is disabled",
      "signups not allowed",
      "Email signups are disabled",
    ]) {
      expect(mapAuthError(raw).closedBeta, `missed: ${raw}`).toBe(true);
    }
  });

  it("leaves unrecognised errors alone", () => {
    // Inventing friendlier copy for errors nobody has thought about is how a
    // real diagnostic gets buried.
    expect(mapAuthError("Password is too weak").message).toBe("Password is too weak");
  });

  it("has something to say when the provider says nothing", () => {
    expect(mapAuthError(null).message.length).toBeGreaterThan(10);
    expect(mapAuthError("").message.length).toBeGreaterThan(10);
  });

  it("does not disclose whether an email exists", () => {
    /**
     * Supabase returns "Invalid login credentials" for BOTH a wrong password
     * and an unknown email, deliberately. Softening the tone is fine;
     * splitting it into "no such account" would turn the sign-in form into an
     * account-enumeration oracle.
     */
    const m = mapAuthError("Invalid login credentials").message.toLowerCase();
    expect(m).not.toMatch(/no such|not registered|doesn't exist|no account/);
  });

  it("both auth pages route their errors through it", () => {
    for (const page of ["app/(auth)/sign-up/page.tsx", "app/(auth)/sign-in/page.tsx"]) {
      const s = src(page);
      expect(s, `${page} still renders the raw provider message`).not.toContain(
        "setError(err.message)",
      );
      expect(s).toContain("mapAuthError");
    }
  });
});
