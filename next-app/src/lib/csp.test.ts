import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

/**
 * The CSP has to permit everything the app is wired to talk to.
 *
 * On 2026-09-02 Sentry had been "live" for a day and had never delivered a
 * single event. The SDK initialised, held a transport, and `flush()` returned
 * true — the browser was blocking every request at the CSP layer, and Sentry's
 * transport swallows network failures, so nothing anywhere reported a problem.
 * The dashboard said "waiting for this project's first error", which reads
 * identically to "no errors have happened".
 *
 * That is the worst shape a defect can take: a monitoring tool that is silent
 * both when it works and when it does not. Every check that looked at the
 * client rather than the wire — including three of mine — passed.
 */
const HEADERS = fs.readFileSync(
  path.resolve(__dirname, "../../public/_headers"),
  "utf8",
);
const csp = HEADERS.match(/Content-Security-Policy:\s*(.+)/)?.[1] ?? "";
const directive = (name: string) =>
  csp.split(";").map((d) => d.trim()).find((d) => d.startsWith(name + " ")) ?? "";

describe("CSP permits the services the app actually uses", () => {
  it("has a CSP at all", () => {
    expect(csp.length).toBeGreaterThan(50);
  });

  it("connect-src allows Sentry ingest, or no error is ever delivered", () => {
    expect(directive("connect-src")).toMatch(/ingest[^ ]*sentry\.io/);
  });

  it("connect-src allows Supabase, or nobody can sign in", () => {
    const d = directive("connect-src");
    expect(d).toContain("supabase.co");
    expect(d).toContain("wss://");
  });

  it("worker-src allows blob:, which session replay needs to compress", () => {
    // Replay spawns a blob worker. Without this it fails exactly as quietly as
    // the ingest block did.
    expect(directive("worker-src")).toContain("blob:");
  });

  it("frame-src allows the YouTube host the app embeds from", () => {
    // VideoModal builds youtube-nocookie embed URLs; a CSP that forbids them
    // yields a blank technique video with no error the user can act on.
    expect(directive("frame-src")).toContain("youtube-nocookie.com");
  });

  it("every external origin hard-coded in src/ is permitted somewhere in the CSP", () => {
    // The drift guard. Adding a third-party call without touching _headers is
    // exactly how Sentry ended up silently blocked.
    const walk = (dir: string): string[] =>
      fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
        const full = path.join(dir, e.name);
        if (e.isDirectory()) return walk(full);
        return /\.tsx?$/.test(e.name) && !/\.test\.tsx?$/.test(e.name) ? [full] : [];
      });
    // Documentation URLs in comments, and hosts the app only ever links to.
    const IGNORED = /(sentry\.io\/(platforms|answers)|docs\.|nextjs\.org|github\.com|w3\.org|schema\.org|aki\.ee|youtu\.be|terav\.fit|example\.)/;
    const origins = new Set<string>();
    for (const file of walk(path.resolve(__dirname, ".."))) {
      const text = fs.readFileSync(file, "utf8");
      for (const m of text.matchAll(/https:\/\/([a-z0-9.-]+\.[a-z]{2,})/gi)) {
        if (IGNORED.test(m[0])) continue;
        // A plain link is a navigation, which connect-src does not govern —
        // `www.google.com/search` behind an href needs no CSP entry, and
        // treating it as one would train people to ignore this test.
        const before = text.slice(Math.max(0, (m.index ?? 0) - 14), m.index ?? 0);
        if (before.includes("href")) continue;
        origins.add(m[1].toLowerCase());
      }
    }
    const allowed = (host: string) =>
      csp.includes(host) ||
      csp.includes("*." + host.split(".").slice(-3).join(".")) ||
      csp.includes("*." + host.split(".").slice(-2).join("."));
    const missing = [...origins].filter((h) => !allowed(h));
    expect(missing, `origins referenced in src/ but absent from the CSP: ${missing.join(", ")}`)
      .toEqual([]);
  });
});
