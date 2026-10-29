import { test, expect } from "@playwright/test";
import * as fs from "node:fs";
import * as path from "node:path";
import * as dotenv from "dotenv";

const envPath = path.resolve(__dirname, "..", "..", ".env.local");
if (fs.existsSync(envPath)) dotenv.config({ path: envPath });

/**
 * The real sign-up form, end to end (2026-10-29): arrival UTMs and the chosen program (`next=`) survive sign-up,
 * the consent + attribution metadata reach the auth user, and confirming then signing in lands on that program's
 * intake. Covers what O-02 (a phone, a real inbox) cannot be replaced for, minus the inbox.
 *
 * Run against a LOCAL dev server started with Cloudflare's public always-pass Turnstile key
 * (`.claude/launch.json` → terav-app-signup-test, port 3001):
 *   E2E_BASE_URL=http://localhost:3001 npx playwright test -c tests/e2e/playwright.config.ts signup-flow
 * Supabase is the real project, so the confirmation mail goes to Resend's test inbox (delivered@resend.dev accepts
 * and discards, so no bounce), and the user is deleted at the end.
 */
const EMAIL = "delivered+e2e-signup@resend.dev";
const PASSWORD = "TestPassword123!";
// What a landing program page links to (landing/src/app/programs/[slug]/page.tsx + CtaLink forwarding utm_*).
const NEXT = "/programs/first-strict-pullup";

const SB = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const admin = (p: string, init: RequestInit = {}) =>
  fetch(`${SB}/auth/v1/admin${p}`, {
    ...init,
    headers: { apikey: SERVICE, Authorization: `Bearer ${SERVICE}`, "Content-Type": "application/json" },
  });

test.skip(!/localhost|127\.0\.0\.1/.test(process.env.E2E_BASE_URL ?? ""), "runs against a local dev server only");

test("sign-up keeps UTMs and next=, writes consent metadata, lands on the program", async ({ page }) => {
  test.setTimeout(180_000);
  let uid = "";
  try {
    await page.goto(`/sign-up/?next=${encodeURIComponent(NEXT)}&utm_source=e2e&utm_medium=test&utm_campaign=signup-flow`);
    for (const box of await page.locator('main input[type="checkbox"]').all()) await box.check();
    await page.fill('input[type="email"]', EMAIL);
    await page.fill('input[type="password"]', PASSWORD);

    const signup = page.waitForRequest((r) => r.url().includes("/auth/v1/signup") && r.method() === "POST");
    const response = page.waitForResponse((r) => r.url().includes("/auth/v1/signup"));
    // The test key's widget issues its token after a moment; the form refuses to submit without one.
    await expect(page.getByRole("button", { name: /create account|sign up/i })).toBeEnabled({ timeout: 20_000 });
    await page.waitForTimeout(2500);
    await page.getByRole("button", { name: /create account|sign up/i }).click();

    const req = await signup;
    const body = JSON.parse(req.postData() ?? "{}") as { data?: Record<string, string> };
    // redirect_to is itself a URL whose next= is encoded inside it.
    expect(decodeURIComponent(decodeURIComponent(req.url()))).toContain(`next=${NEXT}`);
    expect(body.data?.utm_source).toBe("e2e");
    expect(body.data?.utm_campaign).toBe("signup-flow");
    for (const k of ["accepted_terms_at", "consented_symptom_data_at", "confirmed_age_16_at"]) expect(body.data?.[k]).toBeTruthy();

    const res = await response;
    expect(res.status()).toBeLessThan(400);
    const json = (await res.json()) as { id?: string; user?: { id?: string } };
    uid = json.user?.id ?? json.id ?? "";
    expect(uid).toBeTruthy();

    const stored = (await (await admin(`/users/${uid}`)).json()) as { email?: string; user_metadata?: Record<string, string> };
    expect(stored.email).toBe(EMAIL);
    expect(stored.user_metadata?.utm_source).toBe("e2e");
    expect(stored.user_metadata?.consented_symptom_data_at).toBeTruthy();

    // Stand-in for clicking the mail link: confirm, then sign in through the same next= the link carries.
    expect((await admin(`/users/${uid}`, { method: "PUT", body: JSON.stringify({ email_confirm: true }) })).ok).toBe(true);
    await page.goto(`/sign-in/?next=${encodeURIComponent(NEXT)}`);
    await page.fill('input[type="email"]', EMAIL);
    await page.fill('input[type="password"]', PASSWORD);
    await page.waitForTimeout(2500);
    await page.click('button[type="submit"]');
    await page.waitForURL((u) => u.pathname.startsWith(NEXT), { timeout: 30_000 });
  } finally {
    // Same fence as setup-test-user: only this spec's own address is ever deleted.
    if (uid) {
      const u = (await (await admin(`/users/${uid}`)).json()) as { email?: string };
      if (u.email === EMAIL) await admin(`/users/${uid}`, { method: "DELETE" });
    }
  }
});
