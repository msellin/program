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

export function buildRoutes(activeProgramSlug: string): TourRoute[] {
  return [
    { slug: "01-today", path: "/", desc: "Today" },
    { slug: "02-week", path: "/week", desc: "Week" },
    { slug: "03-coach", path: "/coach", desc: "Coach (proposals)" },
    { slug: "04-history", path: "/history", desc: "History (heatmap)" },
    { slug: "05-progress", path: "/progress", desc: "Progress (charts)" },
    { slug: "06-programs", path: "/programs", desc: "Programs catalog" },
    {
      slug: "07-programs-active",
      path: `/programs/${activeProgramSlug}`,
      desc: "Active program detail",
    },
    { slug: "08-profile", path: "/profile", desc: "Profile" },
    { slug: "09-data", path: "/data", desc: "Data / export" },
    { slug: "10-report", path: "/report", desc: "Report" },
    { slug: "11-guide", path: "/guide", desc: "Guide" },
    { slug: "12-extras", path: "/extras", desc: "Extras" },
    { slug: "13-check", path: "/check", desc: "Check" },
    { slug: "14-check-hip", path: "/check/hip", desc: "Check — hip" },
    { slug: "15-events", path: "/events", desc: "Events" },
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
  const requestListener = (req: import("@playwright/test").Request) => {
    networkLines.push(`REQ ${req.method()} ${req.url()}`);
  };
  const responseListener = (res: import("@playwright/test").Response) => {
    networkLines.push(`RES ${res.status()} ${res.url()}`);
  };

  page.on("console", consoleListener);
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
