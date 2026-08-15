import { test as base, expect, Page } from "@playwright/test";
import { ensureTestUser, TEST_EMAIL, TEST_PASSWORD } from "./setup-test-user";

type AuthFixtures = {
  authedPage: Page;
};

/**
 * Playwright fixture that hands each test a signed-in page.
 *
 * Steps:
 *   1. Ensure a confirmed Supabase user exists (idempotent — reuses if there).
 *   2. Navigate to /sign-in.
 *   3. Fill email + password and submit.
 *   4. Wait for the redirect off /sign-in.
 *
 * Playwright's project-level `storageState` would cache the session cookie,
 * but Supabase stores its session in localStorage and rotates the access
 * token every hour — reusing state across long runs (like a 180-day sim)
 * is fragile. We just sign in fresh per test; it takes ~1-2 seconds.
 */
export const test = base.extend<AuthFixtures>({
  authedPage: async ({ page }, use) => {
    await ensureTestUser();
    await page.goto("/sign-in/");
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await Promise.all([
      page.waitForURL((url) => !url.pathname.startsWith("/sign-in"), { timeout: 15_000 }),
      page.click('button[type="submit"]'),
    ]);
    // First-run onboarding modal — dismiss so tests can actually see the UI.
    // Presents a 3-step symptom baseline; "Skip setup" bypasses it. Idempotent:
    // if the modal isn't there (returning user), the click times out fast and
    // we move on.
    const skip = page.getByRole("button", { name: /^skip setup$/i })
      .or(page.getByRole("link", { name: /^skip setup$/i }));
    try {
      await skip.click({ timeout: 3000 });
    } catch {
      /* no modal — fine */
    }
    await use(page);
  },
});

export { expect };
