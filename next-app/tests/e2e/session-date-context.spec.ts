import { test, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { resetTestUser } from "./setup-test-user";
import { runSimulationV2 } from "./harness/simulator-v2";
import { PERSONAS, personaArchetype } from "./harness/personas";

/**
 * 2026-08-21 · Date-context regression test.
 *
 * Founder-reported bug: on Today, tap DateNav next → view tomorrow's
 * plan → tap "Open session" → session route rendered as if it were
 * today, ignoring the user's active date.
 *
 * Root cause: /session/[slug] href in TodaySession did not carry the
 * activeDate, and SessionClient did not read a date query param.
 *
 * Fix: pass `?date=YYYY-MM-DD` on the href; SessionClient forwards it
 * as `initialDate` to TodaySession's useState seed.
 *
 * This spec locks the fix in. Uses persona-strength (concurrent-
 * strength-maintenance, always has planned blocks for today AND
 * tomorrow) so we can verify the destination reflects the correct
 * date via the DateNav's date label.
 */

test.describe.configure({ mode: "serial" });

test("date-context · tomorrow's Open session lands on tomorrow's plan", async ({ page }) => {
  test.setTimeout(180_000);

  const persona = PERSONAS.find((p) => p.id === "persona-strength");
  if (!persona) throw new Error("persona-strength missing");

  // Fresh test user + simulated history so DateNav has a real timeline
  await resetTestUser(persona.email, persona.password);

  const today = new Date();
  const start = new Date(today);
  start.setDate(today.getDate() - persona.days);

  const outDir = path.resolve(
    process.cwd(),
    "tests/e2e/artifacts/date-context",
  );
  fs.mkdirSync(outDir, { recursive: true });

  await runSimulationV2(page, {
    archetype: personaArchetype(persona),
    programSlug: persona.programSlug,
    additionalProgramSlugs: persona.additionalProgramSlugs,
    tier: persona.tier,
    startDate: start.toISOString().slice(0, 10),
    days: persona.days,
    snapshotDays: [],
    screenshotDir: path.join(outDir, "sim-snapshots"),
  });
  await page.clock.setSystemTime(new Date()).catch(() => {});

  // Land on Today and sanity-check
  await page.goto("/");
  await page.waitForLoadState("domcontentloaded");
  await page.waitForTimeout(600);

  // Tap DateNav "Next day" — need to shift to tomorrow
  const nextBtn = page.getByRole("button", { name: /next day/i });
  await expect(nextBtn).toBeVisible({ timeout: 10_000 });
  await nextBtn.click();
  await page.waitForTimeout(400);

  // Tomorrow's ISO
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const tomorrowISO = tomorrow.toISOString().slice(0, 10);

  // Find any "Open session" affordance on the visible Today page.
  const openSession = page.getByRole("link", { name: /open session/i }).first();
  await expect(openSession).toBeVisible({ timeout: 10_000 });

  // The href must carry ?date=<tomorrowISO> — the actual fix
  const href = await openSession.getAttribute("href");
  expect(href, "Open session href").toMatch(new RegExp(`\\?date=${tomorrowISO}`));

  // Navigate + verify session route respects the date param
  await openSession.click();
  await page.waitForLoadState("domcontentloaded");
  await page.waitForTimeout(600);

  // URL contains the date
  expect(page.url()).toMatch(new RegExp(`\\?date=${tomorrowISO}`));

  // Session's own DateNav label should show tomorrow's date, NOT today.
  // Terav renders a "Tomorrow" affordance in the DateNav when the
  // active date is +1 day from real today.
  const dateNavLabel = page.locator("[aria-live=polite], .mono-caps").filter({
    hasText: /tomorrow|\+1 day/i,
  });
  await expect(dateNavLabel.first()).toBeVisible({ timeout: 10_000 });

  // Save a debug artifact for the destination render.
  await page.screenshot({
    path: path.join(outDir, "session-on-tomorrow.png"),
    fullPage: true,
  });
});
