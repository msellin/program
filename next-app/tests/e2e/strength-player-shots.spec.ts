import { test, expect, type Page } from "@playwright/test";
import * as fs from "node:fs";
import * as path from "node:path";
import { ensureTestUser, TEST_EMAIL, TEST_PASSWORD } from "./setup-test-user";

/**
 * Capture pass for the set-by-set brief and player on a strength day
 * (custom-track pass, 2026-10-28). Not an assertion suite: it shoots the
 * screens the review reads, on `anterior-hip-rebuild` seeded from the
 * persona-recover store (training maxes for block pull, squats, deadlifts).
 *
 *   SHOTS_OUT=../dev/active/custom-track/shots/before \
 *   E2E_BASE_URL=http://localhost:3000 \
 *   npx playwright test -c tests/e2e/playwright.config.ts strength-player-shots
 *
 * Skipped unless SHOTS_OUT is set, so the normal e2e run never writes here.
 */
const SLUG = "anterior-hip-rebuild";
const OUT = process.env.SHOTS_OUT;
const VIEWPORTS = [
  { name: "375x667", width: 375, height: 667 },
  { name: "393x852", width: 393, height: 852 },
];

async function signInAndSeed(page: Page) {
  const { uid } = await ensureTestUser();
  const seedPath = path.join(__dirname, "artifacts", "personas", "persona-recover", "final-store.json");
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
      const store = args.seed as { user_profile?: Record<string, unknown>; updated_at?: number; logs?: Record<string, unknown> };
      store.user_profile = { ...(store.user_profile ?? {}), uid: args.uid, email: args.email };
      // Today's log is cleared so the brief and player show an unstarted day.
      for (const k of Object.keys(store.logs ?? {})) if (k >= args.today) delete store.logs![k];
      store.updated_at = Date.now();
      localStorage.setItem("program.log.v2", JSON.stringify(store));
      localStorage.setItem("program.firstrun.dismissed", "1");
      localStorage.setItem(`program.intro-gallery.seen.${args.slug}`, "1");
    },
    { seed, uid, email: TEST_EMAIL, slug: SLUG, today: new Date().toISOString().slice(0, 10) },
  );
}

/** First nearby date whose brief has a loaded main lift (a kg prescription). */
async function gotoStrengthDay(page: Page): Promise<string | null> {
  for (const offset of [0, 1, 2, 3, 4, 5, 6]) {
    const iso = new Date(Date.now() + offset * 864e5).toISOString().slice(0, 10);
    await page.goto(`/session/${SLUG}/?date=${iso}`);
    await page.waitForTimeout(1500);
    const start = page.getByRole("button", { name: /^(Start|Continue)\b/ });
    if ((await start.count()) === 0) continue;
    if ((await page.getByText(/\bkg\b/).count()) === 0) continue;
    return iso;
  }
  return null;
}

for (const vp of VIEWPORTS) {
  test(`strength brief + player @ ${vp.name}`, async ({ page }) => {
    test.skip(!OUT, "set SHOTS_OUT to capture");
    test.setTimeout(180_000);
    const dir = path.resolve(OUT!, vp.name);
    fs.mkdirSync(dir, { recursive: true });
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await signInAndSeed(page);
    const day = await gotoStrengthDay(page);
    expect(day, "a strength day within a week").not.toBeNull();
    const shot = (name: string, fullPage = false) => page.screenshot({ path: path.join(dir, `${name}.png`), fullPage });

    await shot("01-brief");
    await shot("01-brief-full", true);

    // Player, set 1 of the main lift.
    await page.getByRole("button", { name: /^(Start|Continue)\b/ }).first().click();
    await page.waitForTimeout(800);
    await shot("02-player-set1");
    // The demo band after the tap (the only thing that loads YouTube).
    const demo = page.getByRole("button", { name: /^Watch demo video of/ }).first();
    if (await demo.isVisible().catch(() => false)) {
      await demo.click();
      await page.waitForTimeout(4000);
      await shot("02c-demo-open");
      const close = page.getByRole("button", { name: "Hide demo" });
      if (await close.count()) await close.click();
    }
    // Log three sets so the set list shows logged rows.
    for (let i = 0; i < 3; i++) {
      const done = page.getByRole("button", { name: /^Done\b/ }).first();
      if ((await done.count()) === 0) break;
      await done.click();
      await page.waitForTimeout(500);
      if (i === 0) await shot("02b-rest");
      const skip = page.getByRole("button", { name: /skip rest|next set|start next/i }).first();
      if (await skip.count()) await skip.click();
      await page.waitForTimeout(500);
    }
    await shot("03-player-after-3");

    // Pad the main lift to 15 sets through ⋯ → Add a set (the real path).
    for (let n = 0; n < 12; n++) {
      await page.getByRole("button", { name: "More options" }).click();
      const add = page.getByRole("button", { name: /add a set/i });
      if ((await add.count()) === 0) break;
      await add.click();
      await page.waitForTimeout(250);
    }
    await shot("04-player-15-sets");

    // Second exercise in the rail.
    const back = page.getByRole("button", { name: "Back to brief" });
    await back.click();
    await page.waitForTimeout(600);
    await shot("05-brief-in-progress");

    const finish = page.getByRole("button", { name: /^Finish session$/ }).first();
    if (await finish.count()) {
      await finish.click();
      await page.waitForTimeout(1200);
      await shot("06-session-done");
      await shot("06-session-done-full", true);
    }
  });
}
