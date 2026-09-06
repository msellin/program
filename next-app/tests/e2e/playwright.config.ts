import { defineConfig, devices } from "@playwright/test";

/**
 * One id per sweep, stamped into every artifact the run writes.
 *
 * Artifacts are never cleaned between sweeps, and the fleet summary is built
 * by reading every `coverage.json` on disk — so a persona that FAILED (and
 * therefore never wrote a fresh report) silently contributed its PREVIOUS
 * sweep's numbers to the new summary. Sweep #5 reported 269 behavioural
 * checks with one persona failed; sweep #6 reported 263 with all of them
 * passing, and the difference is not a regression in the app. It is one
 * stale report being counted as if it had run.
 *
 * Set in the config module body, which runs once in the main process before
 * any worker is forked, so every worker inherits the same value.
 */
process.env.SWEEP_ID ||= new Date().toISOString();

export default defineConfig({
  testDir: ".",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: [["list"]],
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "https://app.terav.fit",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    viewport: { width: 390, height: 844 }, // iPhone 14 Pro dimensions — mobile-first
    launchOptions: { headless: true },
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
});
