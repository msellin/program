import { chromium } from "playwright";
import * as fs from "node:fs";
import * as path from "node:path";

const OUT = "/Users/margussellin/www/program/dev/audits/session-2026-08-17/shots";
fs.mkdirSync(OUT, { recursive: true });

const URL = "https://terav.fit";
const VPS = [
  { label: "375x667", w: 375, h: 667 },
  { label: "393x852", w: 393, h: 852 },
  { label: "414x896", w: 414, h: 896 },
  { label: "1280x720", w: 1280, h: 720 },
  { label: "812x375-landscape", w: 812, h: 375 },
];

const browser = await chromium.launch();
for (const v of VPS) {
  const ctx = await browser.newContext({
    viewport: { width: v.w, height: v.h },
    deviceScaleFactor: 2,
    isMobile: v.w < 500,
    hasTouch: v.w < 500,
  });
  const page = await ctx.newPage();
  await page.goto(URL, { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(700);
  await page.screenshot({ path: path.join(OUT, `${v.label}-fold.png`), fullPage: false });
  await page.screenshot({ path: path.join(OUT, `${v.label}-full.png`), fullPage: true });

  // Scroll to ThreeWayContrast on mobile viewports
  if (v.w < 500) {
    const contrast = page.locator("section:has-text('Terav')").nth(1);
    try {
      await contrast.scrollIntoViewIfNeeded({ timeout: 2000 });
      await page.waitForTimeout(300);
      await page.screenshot({ path: path.join(OUT, `${v.label}-contrast.png`), fullPage: false });

      // Try clicking the "vs. Trainer" toggle to see swap
      const trainerBtn = page.getByRole("button", { name: /vs\. A trainer/i });
      if (await trainerBtn.isVisible().catch(() => false)) {
        await trainerBtn.click();
        await page.waitForTimeout(200);
        await page.screenshot({ path: path.join(OUT, `${v.label}-contrast-trainer.png`), fullPage: false });
      }
    } catch (e) {
      console.log("contrast section fallback:", e?.message);
    }
  }
  await ctx.close();
  console.log("done", v.label);
}
await browser.close();
console.log("all done, output at", OUT);
