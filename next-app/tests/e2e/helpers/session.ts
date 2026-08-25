import type { Page } from "@playwright/test";

/**
 * Navigate to a session Brief on whatever nearby day actually prescribes
 * work, and report whether one was found.
 *
 * Specs that hard-coded `/session/<slug>/` passed or failed depending on
 * the weekday the suite happened to run: programs train on a schedule, and
 * the date rolling over mid-session was enough to break four of them at
 * once. `?date=` is the app's own cross-day affordance, so walking it here
 * is exercising a real path rather than working around one.
 *
 * Mirrors `harness/flows.ts:openBrief`, which hit the same problem across
 * the persona fleet.
 */
export async function gotoSessionWithWork(page: Page, slug: string): Promise<boolean> {
  for (const offset of [0, 1, 2, 3, 4, 5, 6, -1, -2, -3]) {
    const iso = new Date(Date.now() + offset * 864e5).toISOString().slice(0, 10);
    await page.goto(offset === 0 ? `/session/${slug}/` : `/session/${slug}/?date=${iso}`);
    await page.waitForTimeout(1200);
    if ((await page.getByRole("button", { name: /^(Start|Continue) —/ }).count()) > 0) return true;
  }
  return false;
}
