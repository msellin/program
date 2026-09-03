import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

/**
 * Every user-facing route carries its own <title>.
 *
 * Before 2026-09-03 all of them shared the root title, so browser tabs,
 * history entries and — the one that actually bites — the installed PWA's app
 * switcher all read "Terav" and were indistinguishable from each other.
 *
 * The pages are client components and cannot export `metadata`, so each route
 * has a small server `layout.tsx` that does. This fails when a new route
 * ships without one, which is the only way the set stays complete.
 */
const APP = path.resolve(__dirname, "../app");

/** Routes that legitimately have no title of their own. */
const EXEMPT = new Set([
  ".", // root layout carries the default
  "dev/primitives", // internal component gallery, never linked
  "admin", // super-admin surfaces, behind a 404 gate
]);

function routeDirsWithPages(dir: string, rel = ""): string[] {
  const out: string[] = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!e.isDirectory()) continue;
    const abs = path.join(dir, e.name);
    const r = rel ? `${rel}/${e.name}` : e.name;
    if (fs.existsSync(path.join(abs, "page.tsx"))) out.push(r);
    out.push(...routeDirsWithPages(abs, r));
  }
  return out;
}

describe("every route names itself", () => {
  const routes = routeDirsWithPages(APP).filter(
    (r) => ![...EXEMPT].some((e) => r === e || r.startsWith(`${e}/`)),
  );

  it("finds the app's routes at all", () => {
    // Guards the guard: a path change that made routeDirsWithPages return []
    // would turn every assertion below into a silent pass.
    expect(routes.length).toBeGreaterThan(8);
  });

  it.each(routes)("%s has a title", (route) => {
    const dir = path.join(APP, route);
    const hasOwn = ["layout.tsx", "page.tsx"].some((f) => {
      const p = path.join(dir, f);
      return fs.existsSync(p) && /title:\s*["'`]/.test(fs.readFileSync(p, "utf8"));
    });
    // A dynamic segment may inherit from its parent, which is correct —
    // /programs/[slug] taking "Programs" is better than a generic default.
    const parent = route.includes("/") ? route.slice(0, route.lastIndexOf("/")) : null;
    const parentHas =
      parent != null &&
      ["layout.tsx"].some((f) => {
        const p = path.join(APP, parent, f);
        return fs.existsSync(p) && /title:\s*["'`]/.test(fs.readFileSync(p, "utf8"));
      });
    expect(hasOwn || parentHas, `${route} has no <title> of its own`).toBe(true);
  });

  it("the root layout templates the product name onto them", () => {
    const root = fs.readFileSync(path.join(APP, "layout.tsx"), "utf8");
    expect(root).toMatch(/template:\s*["']%s · Terav["']/);
  });
});
