#!/usr/bin/env node
/**
 * Diagnostic — load /progress with the persona-strength store and capture
 * the actual JS exception. Static analysis couldn't find the throw source;
 * this runs Playwright against the deployed app and hooks pageerror.
 *
 * Usage: node dev/scripts/diagnose-progress-crash.mjs
 *
 * Outputs:
 *   /tmp/progress-crash-diagnosis.json — { errors, warnings, consoleLog, url }
 *   /tmp/progress-crash-screenshot.png — screenshot of the actual state
 */

import { chromium } from "@playwright/test";
import fs from "node:fs";

const APP_URL = process.env.E2E_BASE_URL ?? "https://app.terav.fit";
const STORE_PATH = "next-app/tests/e2e/artifacts/personas/persona-strength/final-store.json";

const store = JSON.parse(fs.readFileSync(STORE_PATH, "utf8"));

const errors = [];
const consoleLog = [];

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 393, height: 852 },
  userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
});
const page = await context.newPage();

page.on("pageerror", (err) => {
  errors.push({ message: err.message, stack: err.stack });
  console.log("[pageerror]", err.message);
  if (err.stack) console.log(err.stack.split("\n").slice(0, 8).join("\n"));
});

page.on("console", (msg) => {
  const t = msg.type();
  if (t === "error" || t === "warning") {
    consoleLog.push({ type: t, text: msg.text() });
    console.log(`[console.${t}]`, msg.text());
  }
});

// Bypass auth by injecting the Supabase session + store into localStorage.
// The app reads Zustand persistence from localStorage key `terav-store`.
console.log("[step 1] navigating to /sign-in to establish session context");
await page.goto(`${APP_URL}/sign-in`, { waitUntil: "domcontentloaded" });

console.log("[step 2] injecting persona-strength store into localStorage");
await page.evaluate((storeData) => {
  const persistShape = { state: { store: storeData, hydrated: true }, version: 0 };
  localStorage.setItem("terav-store", JSON.stringify(persistShape));
  // Fake a Supabase session so AuthGate doesn't kick us to /sign-in
  localStorage.setItem("sb-persona-strength-auth-token", JSON.stringify({
    access_token: "fake",
    token_type: "bearer",
    user: { id: "persona-strength", email: "persona-strength@example.test" },
    expires_at: Math.floor(Date.now() / 1000) + 3600,
  }));
}, store);

console.log("[step 3] navigating to /progress");
try {
  await page.goto(`${APP_URL}/progress/`, { waitUntil: "domcontentloaded", timeout: 15000 });
  await page.waitForTimeout(3000); // let React hydrate + throw if it's going to
} catch (e) {
  errors.push({ message: `nav failed: ${e.message}`, stack: e.stack });
}

console.log("[step 4] capturing final state");
const url = page.url();
const title = await page.title();
const bodyText = await page.evaluate(() => document.body.innerText.slice(0, 500));
const nextErrorMarker = await page.evaluate(() => document.documentElement.id === "__next_error__");

await page.screenshot({ path: "/tmp/progress-crash-screenshot.png", fullPage: true });

const result = {
  url, title, bodyText, nextErrorMarker,
  errors, consoleLog,
  timestamp: new Date().toISOString(),
};
fs.writeFileSync("/tmp/progress-crash-diagnosis.json", JSON.stringify(result, null, 2));

console.log("\n=== SUMMARY ===");
console.log(`url: ${url}`);
console.log(`title: ${title}`);
console.log(`__next_error__ marker: ${nextErrorMarker}`);
console.log(`js errors captured: ${errors.length}`);
console.log(`console warns/errors: ${consoleLog.length}`);
if (errors.length) {
  console.log("\nFIRST ERROR:");
  console.log(errors[0].message);
  console.log((errors[0].stack || "").split("\n").slice(0, 15).join("\n"));
}
console.log(`\nscreenshot: /tmp/progress-crash-screenshot.png`);
console.log(`full log: /tmp/progress-crash-diagnosis.json`);

await browser.close();
