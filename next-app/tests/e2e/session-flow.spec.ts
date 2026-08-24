import { test, expect } from "@playwright/test";
import * as fs from "node:fs";
import * as path from "node:path";
import { ensureTestUser, TEST_EMAIL, TEST_PASSWORD } from "./setup-test-user";

/**
 * Post-ship flow checks (2026-08-24), all three founder-reported gaps:
 *  - saving the morning check returns to Day instead of sitting on the form
 *  - the Set CTA names the set it logs, not just the weight
 *  - the rest screen's "Next up" matches where the timer actually lands
 */
const TODAY = new Date().toISOString().slice(0, 10);

async function signInWithPersona(page: import("@playwright/test").Page, persona: string) {
  const { uid } = await ensureTestUser();
  await page.goto("/sign-in/");
  await page.fill('input[type="email"]', TEST_EMAIL);
  await page.fill('input[type="password"]', TEST_PASSWORD);
  await Promise.all([
    page.waitForURL((u) => !u.pathname.startsWith("/sign-in"), { timeout: 20_000 }),
    page.click('button[type="submit"]'),
  ]);
  const seed = JSON.parse(
    fs.readFileSync(path.join(__dirname, "artifacts", "personas", persona, "final-store.json"), "utf8"),
  ) as Record<string, unknown>;
  await page.evaluate(
    (args) => {
      const s = args.seed as {
        user_profile?: Record<string, unknown>;
        updated_at?: number;
        logs?: Record<string, unknown>;
      };
      s.user_profile = { ...(s.user_profile ?? {}), uid: args.uid, email: args.email };
      delete (s.logs as Record<string, unknown>)[args.today];
      s.updated_at = Date.now();
      localStorage.setItem("program.log.v2", JSON.stringify(s));
      localStorage.setItem("program.firstrun.dismissed", "1");
    },
    { seed, uid, email: TEST_EMAIL, today: TODAY },
  );
}

test("morning check returns to Day on save", async ({ page }) => {
  await signInWithPersona(page, "persona-recover");
  await page.goto("/check/");
  await expect(page.getByRole("heading", { name: /morning check/i })).toBeVisible({ timeout: 20_000 });
  await page.getByRole("radio", { name: /mild/i }).first().click();
  await page.getByRole("button", { name: /save check/i }).click();
  await page.waitForURL((u) => !u.pathname.startsWith("/check"), { timeout: 10_000 });
  expect(new URL(page.url()).pathname).toBe("/");
  // The check actually landed.
  const symptoms = await page.evaluate(
    (today) => JSON.parse(localStorage.getItem("program.log.v2") ?? "{}").logs?.[today]?.symptoms ?? null,
    TODAY,
  );
  expect(symptoms).not.toBeNull();
});

test("Set CTA names the set, and rest announces the set the timer lands on", async ({ page }) => {
  await signInWithPersona(page, "persona-recover");
  await page.goto("/session/anterior-hip-rebuild/");
  await page.getByRole("button", { name: /^Start —/ }).click({ timeout: 20_000 });
  await expect(page.getByText(/· set 1 of \d+/i)).toBeVisible();
  const cta = page.getByRole("button", { name: /^Done — set 1 · \d/ });
  await expect(cta).toBeVisible();
  await cta.click();
  // Rest takeover: the timer advances to set 2 of the SAME exercise, so
  // that — not the next exercise — is what "Next up" must say.
  await expect(page.getByText("Next up")).toBeVisible({ timeout: 5_000 });
  await expect(page.getByText(/^Set 2 of \d+$/)).toBeVisible();
  await page.getByRole("button", { name: /skip rest/i }).click();
  await expect(page.getByText(/· set 2 of \d+/i)).toBeVisible({ timeout: 5_000 });
  await expect(page.getByRole("button", { name: /^Done — set 2 · \d/ })).toBeVisible();
});

test("off-plan runs the same Set/Rest pattern", async ({ page }) => {
  await signInWithPersona(page, "persona-recover");
  await page.goto("/off-plan/");
  const row = page.locator("button", { hasText: /\d+ sets/ }).first();
  await row.click({ timeout: 20_000 });
  await expect(page.getByText(/· set 1 of \d+/i)).toBeVisible({ timeout: 10_000 });
  await page.getByRole("button", { name: /^Done — set 1/ }).click();
  await expect(page.getByText("Next up")).toBeVisible({ timeout: 10_000 });
});
