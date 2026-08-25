import type { Page, ConsoleMessage } from "@playwright/test";
import * as fs from "node:fs";
import * as path from "node:path";

export type TourRoute = {
  slug: string;
  path: string;
  desc: string;
};

export type TourViewport = { name: string; width: number; height: number };

export const DEFAULT_VIEWPORTS: TourViewport[] = [
  { name: "mobile", width: 393, height: 852 },
  { name: "desktop", width: 1280, height: 800 },
];

/** ISO date `n` days from today. Used for the timeline tour variants. */
function shiftISO(days: number): string {
  return new Date(Date.now() + days * 864e5).toISOString().slice(0, 10);
}

export function buildRoutes(activeProgramSlug: string): TourRoute[] {
  return [
    // Week 4a/b (2026-08-21) — Today tab renamed to Day (label only,
    // route stays /); Week tab renamed to Plan and moved to /plan/
    // (old /week/ now redirects). Keep both tour entries so we verify
    // the redirect stub + the new canonical route both render.
    { slug: "01-day", path: "/", desc: "Day (formerly Today)" },
    { slug: "02-plan", path: "/plan", desc: "Plan (formerly Week — new canonical route)" },
    { slug: "02b-week-redirect", path: "/week", desc: "Week → Plan redirect stub" },
    // A9 (Batch 26) — /coach shelved by S1 kill. Slot 03 kept open with a
    // stable slug ("03-account") so downstream tooling that indexes by
    // route position stays coherent; if a fresh route lands here, it
    // takes 03 naturally.
    { slug: "03-account", path: "/account", desc: "Account" },
    // Cut C · 2026-08-21 · Phase 3 cut-over — /progress + /history now
    // redirect to /record. Tour still visits them to verify the
    // redirect stubs land on Record without crashes.
    { slug: "04-history-redirect", path: "/history", desc: "History (redirects to Record)" },
    { slug: "05-progress-redirect", path: "/progress", desc: "Progress (redirects to Record)" },
    { slug: "05b-record", path: "/record", desc: "Record (Cut C canonical surface)" },
    { slug: "06-programs", path: "/programs", desc: "Programs catalog" },
    {
      slug: "07-programs-active",
      path: `/programs/${activeProgramSlug}`,
      desc: "Active program detail",
    },
    { slug: "08-profile", path: "/profile", desc: "Profile" },
    // /data was removed 2026-08-18 — GDPR export + delete inlined on /profile.
    { slug: "10-report", path: "/report", desc: "Report" },
    { slug: "11-guide", path: "/guide", desc: "Guide" },
    { slug: "12-off-plan", path: "/off-plan", desc: "Off-plan (formerly Extras)" },
    { slug: "12b-extras-redirect", path: "/extras", desc: "Extras → Off-plan redirect stub" },
    { slug: "13-check", path: "/check", desc: "Check" },
    { slug: "14-check-hip", path: "/check/hip", desc: "Check — hip" },
    // 15-events removed 2026-08-24 — `src/app/events` does not exist and
    // never did in this repo's history. Every persona had been capturing a
    // 404 into 15-events.png at both viewports since the slot was added.
    { slug: "15-settings", path: "/settings", desc: "Settings" },
    // The session shell — the app's most-used screen and the entire
    // subject of the Day redesign — was absent from the tour until
    // 2026-08-24. Toured at three points on the timeline, because
    // `?date=` is the only way to reach another day's session and none
    // of it had ever been captured.
    {
      slug: "16-session-today",
      path: `/session/${activeProgramSlug}`,
      desc: "Session — today",
    },
    {
      slug: "17-session-past",
      path: `/session/${activeProgramSlug}?date=${shiftISO(-3)}`,
      desc: "Session — a past day (already logged or missed)",
    },
    {
      slug: "18-session-future",
      path: `/session/${activeProgramSlug}?date=${shiftISO(3)}`,
      desc: "Session — a future day (planned, nothing logged)",
    },
    {
      slug: "19-intake",
      path: `/programs/${activeProgramSlug}/intake`,
      desc: "Program intake",
    },
    { slug: "20-evidence", path: "/evidence", desc: "Evidence" },
    { slug: "21-legal-privacy", path: "/legal/privacy", desc: "Legal — privacy" },
    { slug: "22-legal-terms", path: "/legal/terms", desc: "Legal — terms" },
    { slug: "23-legal-disclaimer", path: "/legal/disclaimer", desc: "Legal — disclaimer" },
    // Reached without a recovery token, so this captures the route's
    // error/expired state — which is what a user who clicks a stale email
    // link actually sees, and had never been looked at.
    { slug: "24-reset-password", path: "/reset-password", desc: "Reset password (no token)" },
  ];
}

type TourResult = {
  route: string;
  slug: string;
  status: "ok" | "error";
  error?: string;
  loadMs: number;
  viewports: string[];
};

export async function runTour(
  page: Page,
  opts: {
    routes: TourRoute[];
    viewports: TourViewport[];
    outDir: string;
    personaId: string;
  },
): Promise<TourResult[]> {
  const { routes, viewports, outDir, personaId } = opts;
  const results: TourResult[] = [];

  const consoleLines: string[] = [];
  const networkLines: string[] = [];

  const consoleListener = (msg: ConsoleMessage) => {
    consoleLines.push(`[${msg.type()}] ${msg.text()}`);
  };
  // Batch 36 · 2026-08-21 — capture uncaught JS errors so Progress/Report
  // crash diagnosis has an actual stack trace next time. Prior tour only
  // logged console + network, which is why static analysis couldn't find
  // the throw source. `pageerror` fires on any unhandled JS exception
  // (React render errors, promise rejections). Persisted alongside
  // console.log per route.
  const pageErrorListener = (err: Error) => {
    consoleLines.push(`[pageerror] ${err.message}`);
    if (err.stack) {
      const frames = err.stack.split("\n").slice(0, 10).map((s) => `  ${s.trim()}`).join("\n");
      consoleLines.push(frames);
    }
  };
  const requestListener = (req: import("@playwright/test").Request) => {
    networkLines.push(`REQ ${req.method()} ${req.url()}`);
  };
  const responseListener = (res: import("@playwright/test").Response) => {
    networkLines.push(`RES ${res.status()} ${res.url()}`);
  };

  page.on("console", consoleListener);
  page.on("pageerror", pageErrorListener);
  page.on("request", requestListener);
  page.on("response", responseListener);

  for (const viewport of viewports) {
    ensureDir(path.join(outDir, viewport.name));
  }
  ensureDir(path.join(outDir, "text"));
  ensureDir(path.join(outDir, "dom"));

  try {
    for (const route of routes) {
      consoleLines.push(`\n=== ${route.slug} (${route.path}) ===`);
      networkLines.push(`\n=== ${route.slug} (${route.path}) ===`);

      for (const viewport of viewports) {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        const start = Date.now();
        let status: TourResult["status"] = "ok";
        let error: string | undefined;

        try {
          await page.goto(route.path, { waitUntil: "domcontentloaded", timeout: 20_000 });
          await page.waitForLoadState("networkidle", { timeout: 15_000 }).catch(() => {
            // networkidle can hang on SW / polling — treat as best-effort.
          });
          await page.waitForTimeout(400); // let animations settle
          await page.screenshot({
            path: path.join(outDir, viewport.name, `${route.slug}.png`),
            fullPage: true,
          });

          if (viewport.name === "mobile") {
            const text = await page.evaluate(() => document.body?.innerText ?? "");
            fs.writeFileSync(path.join(outDir, "text", `${route.slug}.txt`), text, "utf8");
            const dom = await page.content();
            fs.writeFileSync(path.join(outDir, "dom", `${route.slug}.html`), dom, "utf8");
          }
        } catch (e) {
          status = "error";
          error = e instanceof Error ? e.message : String(e);
        }

        const loadMs = Date.now() - start;
        const existing = results.find((r) => r.slug === route.slug);
        if (existing) {
          existing.viewports.push(viewport.name);
          if (status === "error") {
            existing.status = "error";
            existing.error = existing.error ?? error;
          }
          existing.loadMs = Math.max(existing.loadMs, loadMs);
        } else {
          results.push({
            route: route.path,
            slug: route.slug,
            status,
            error,
            loadMs,
            viewports: [viewport.name],
          });
        }
      }
    }
  } finally {
    page.off("console", consoleListener);
    page.off("request", requestListener);
    page.off("response", responseListener);
  }

  fs.writeFileSync(path.join(outDir, "console.log"), consoleLines.join("\n"), "utf8");
  fs.writeFileSync(path.join(outDir, "network.log"), networkLines.join("\n"), "utf8");

  fs.writeFileSync(
    path.join(outDir, "manifest.json"),
    JSON.stringify(
      {
        personaId,
        capturedAt: new Date().toISOString(),
        viewports: viewports.map((v) => ({ name: v.name, width: v.width, height: v.height })),
        routes: results,
      },
      null,
      2,
    ),
    "utf8",
  );

  return results;
}

function ensureDir(dir: string): void {
  fs.mkdirSync(dir, { recursive: true });
}
