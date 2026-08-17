import { chromium } from 'playwright';
const url = process.argv[2] || 'http://localhost:3050';
const shots = [
  { w: 375, h: 667, name: 'mobile-375' },
  { w: 393, h: 852, name: 'mobile-393' },
  { w: 414, h: 896, name: 'mobile-414' },
  { w: 1280, h: 720, name: 'desktop-1280' },
];
const browser = await chromium.launch();
for (const s of shots) {
  const ctx = await browser.newContext({ viewport: { width: s.w, height: s.h }, deviceScaleFactor: 2, isMobile: s.w < 700, hasTouch: s.w < 700 });
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  await page.screenshot({ path: `/tmp/terav-mobile-shots/${s.name}-fold.png`, fullPage: false });
  await page.screenshot({ path: `/tmp/terav-mobile-shots/${s.name}-full.png`, fullPage: true });
  // scroll to Programs section for carousel check
  const hasHscroll = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  console.log(`${s.name}: hscroll=${hasHscroll} scrollW=${await page.evaluate(() => document.documentElement.scrollWidth)}`);
  await ctx.close();
}
await browser.close();
