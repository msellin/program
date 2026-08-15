import { test, chromium } from "@playwright/test";
import * as fs from "node:fs";
import * as path from "node:path";

const LANDING_URL = "https://terav-landing.pages.dev";
const OUT_ROOT = "tests/e2e/screenshots/landing";

const PAGES = [
  { path: "/", name: "01-home" },
  { path: "/evidence", name: "02-evidence" },
  { path: "/privacy", name: "03-privacy" },
  { path: "/terms", name: "04-terms" },
  { path: "/disclaimer", name: "05-disclaimer" },
];

// Mobile is priority. Also capture desktop for comparison.
const VIEWPORTS = [
  { label: "mobile", width: 390, height: 844 },
  { label: "desktop", width: 1440, height: 900 },
];

test.describe("landing screenshot capture", () => {
  for (const vp of VIEWPORTS) {
    for (const p of PAGES) {
      test(`${vp.label} · ${p.path}`, async () => {
        const dir = path.join(OUT_ROOT, vp.label);
        fs.mkdirSync(dir, { recursive: true });

        const browser = await chromium.launch();
        const context = await browser.newContext({
          viewport: { width: vp.width, height: vp.height },
          deviceScaleFactor: 2,
        });
        const page = await context.newPage();
        await page.goto(LANDING_URL + p.path, { waitUntil: "networkidle" });
        // Give lazy backgrounds / gradients a beat to settle.
        await page.waitForTimeout(500);
        await page.screenshot({
          path: path.join(dir, `${p.name}.png`),
          fullPage: true,
        });
        await context.close();
        await browser.close();
      });
    }
  }
});
