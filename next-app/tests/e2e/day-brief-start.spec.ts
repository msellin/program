import { test, expect } from "@playwright/test";
import * as fs from "node:fs";
import * as path from "node:path";
import { ensureTestUser, TEST_EMAIL, TEST_PASSWORD } from "./setup-test-user";
import { gotoSessionWithWork } from "./helpers/session";

/**
 * Repro for "I can see the blocks but I can't start a block" (2026-08-24).
 *
 * The Brief's exercise rows call DaySession's `jumpTo`, which set the
 * active exercise but never flipped `mode` to "set" — so tapping a row
 * from the Brief re-rendered the Brief and nothing happened. Only the
 * bottom CTA could open Set.
 */
const SLUG = "concurrent-strength-maintenance";

test("Brief: tapping an exercise row opens the Set view", async ({ page }) => {
  const { uid } = await ensureTestUser();

  const seedPath = path.join(
    __dirname,
    "artifacts",
    "personas",
    "persona-strength",
    "final-store.json",
  );
  const seed = JSON.parse(fs.readFileSync(seedPath, "utf8")) as Record<string, unknown>;

  await page.goto("/sign-in/");
  await page.fill('input[type="email"]', TEST_EMAIL);
  await page.fill('input[type="password"]', TEST_PASSWORD);
  await Promise.all([
    page.waitForURL((url) => !url.pathname.startsWith("/sign-in"), { timeout: 20_000 }),
    page.click('button[type="submit"]'),
  ]);

  await page.evaluate(
    (args) => {
      const store = args.seed as { user_profile?: Record<string, unknown>; updated_at?: number };
      store.user_profile = { ...(store.user_profile ?? {}), uid: args.uid, email: args.email };
      store.updated_at = Date.now();
      localStorage.setItem("program.log.v2", JSON.stringify(store));
      localStorage.setItem("program.firstrun.dismissed", "1");
      localStorage.setItem(`program.intro-gallery.seen.${args.slug}`, "1");
    },
    { seed, uid, email: TEST_EMAIL, slug: SLUG },
  );

  // Walks nearby dates rather than pinning to today — CSM trains on a
  // schedule, so this spec passed or failed on the weekday it ran.
  expect(await gotoSessionWithWork(page, SLUG)).toBe(true);
  // Brief renders: "The whole session" list of exercise rows.
  await expect(page.getByText("The whole session")).toBeVisible({ timeout: 20_000 });
  const rows = page.locator('button:has-text("sets")').filter({ hasNotText: "Start" });
  const first = rows.first();
  await expect(first).toBeVisible();
  await first.click();
  // Set view header: "<exercise> · set 1 of N" + "N sets left".
  await expect(page.getByText(/sets left/i)).toBeVisible({ timeout: 5_000 });
  await expect(page.getByText(/· set \d+ of \d+/i)).toBeVisible();
});
