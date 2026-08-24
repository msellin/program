import { test, expect } from "@playwright/test";
import * as fs from "node:fs";
import * as path from "node:path";
import { ensureTestUser, TEST_EMAIL, TEST_PASSWORD } from "./setup-test-user";

/**
 * Founder-reported gaps from a live workout (2026-08-24):
 *  - a completed set couldn't be reopened, so a mis-logged weight was permanent
 *  - the Day view showed one track on a day Plan said had two
 *  - +30s reset the rest timer instead of extending it
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

test("a logged set can be reopened and corrected from the set pips", async ({ page }) => {
  await signInWithPersona(page, "persona-recover");
  await page.goto("/session/anterior-hip-rebuild/");
  await page.getByRole("button", { name: /^Start —/ }).click({ timeout: 20_000 });

  await expect(page.getByText(/· set 1 of \d+/i)).toBeVisible();
  await page.getByRole("button", { name: /^Done — set 1 · \d/ }).click();
  await page.getByRole("button", { name: /skip rest/i }).click();
  await expect(page.getByText(/· set 2 of \d+/i)).toBeVisible({ timeout: 5_000 });

  // The whole point: go BACK to a set that is already logged.
  await page.getByRole("button", { name: /^Set 1, logged .* Edit\.$/ }).click();
  await expect(page.getByText(/· set 1 of \d+/i)).toBeVisible();
  await expect(page.getByText("Editing")).toBeVisible();

  // Correcting it must not start a rest timer, and must persist.
  await page.getByRole("button", { name: /change the weight/i }).click();
  const kg = page.getByLabel("kg", { exact: true });
  await kg.fill("42.5");
  const save = page.getByRole("button", { name: /^Save — set 1 · 42\.5 kg$/ });
  await expect(save).toBeVisible();
  await save.click();

  await expect(page.getByText("Next up")).toHaveCount(0);
  const weight = await page.evaluate((today) => {
    const s = JSON.parse(localStorage.getItem("program.log.v2") ?? "{}");
    const exercises = s.logs?.[today]?.exercises ?? {};
    for (const key of Object.keys(exercises)) {
      const first = exercises[key]?.sets?.[0];
      if (first?.weight_kg === 42.5) return first.weight_kg;
    }
    return null;
  }, TODAY);
  expect(weight).toBe(42.5);
});

test("Day renders tracks that were never materialized", async ({ page }) => {
  // Reproduces the reported state exactly. `scheduled_blocks` used to be
  // written once, by the `blocks_v2` migration, for whatever programs were
  // active at that instant — and `materializeLookahead` had no callers, so
  // nothing ever extended it. Stamping the migration as already-applied
  // with an empty block map is what a user looks like after adding a
  // second track: Plan still listed it (phase math), Day could not see it
  // (block map). The only thing that can produce blocks here is the
  // materialization keeper in StoreHydrator.
  await signInWithPersona(page, "persona-multitrack");
  await page.evaluate(() => {
    const s = JSON.parse(localStorage.getItem("program.log.v2") ?? "{}");
    s.migrations_applied = ["blocks_v2"];
    s.scheduled_blocks = {};
    delete s.program_materialization;
    s.updated_at = Date.now();
    localStorage.setItem("program.log.v2", JSON.stringify(s));
  });

  await page.goto("/");
  await page.waitForSelector("text=Open session", { timeout: 20_000 });

  const blocks = await page.evaluate(() => {
    const s = JSON.parse(localStorage.getItem("program.log.v2") ?? "{}");
    const slugs = new Set<string>();
    for (const b of Object.values(s.scheduled_blocks ?? {}) as Array<{ program_slug: string }>) {
      slugs.add(b.program_slug);
    }
    return Array.from(slugs).sort();
  });
  // Every active track got blocks, not just the primary.
  expect(blocks).toEqual([
    "concurrent-strength-maintenance",
    "engine-builder",
    "overhead-mobility",
  ]);

  // And Plan agrees with Day about how many tracks today carries.
  const dayTracks = await page.getByRole("link", { name: /open session/i }).count();
  await page.goto("/plan/");
  await page.waitForSelector("text=/rest|·/", { timeout: 20_000 });
  const chip = page.getByText(/^\d+ tracks$/).first();
  const planTracks = (await chip.count())
    ? Number((await chip.textContent())!.match(/\d+/)![0])
    : 1;
  expect(dayTracks).toBe(planTracks);
});

test("+30s extends the rest timer instead of resetting it", async ({ page }) => {
  await signInWithPersona(page, "persona-recover");
  await page.goto("/session/anterior-hip-rebuild/");
  await page.getByRole("button", { name: /^Start —/ }).click({ timeout: 20_000 });
  await page.getByRole("button", { name: /^Done — set 1 · \d/ }).click();

  const clock = page.locator("p").filter({ hasText: /^\d+:\d\d$/ }).first();
  await expect(clock).toBeVisible({ timeout: 5_000 });
  const toSeconds = async () => {
    const [m, s] = (await clock.textContent())!.trim().split(":").map(Number);
    return m * 60 + s;
  };
  const before = await toSeconds();
  await page.getByRole("button", { name: /add 30 seconds/i }).click();
  const after = await toSeconds();
  // Tapping inside the first 30s used to clamp to the full duration.
  // Extending must always put remaining ABOVE where it started.
  expect(after).toBeGreaterThan(before);
  expect(after).toBeGreaterThanOrEqual(before + 29);
});
