import type { MetadataRoute } from "next";
import { PUBLIC_PROGRAMS } from "@/lib/programs-catalog";

/**
 * Sitemap (2026-09-06).
 *
 * There wasn't one. Neither was there a robots.txt, so the only route to
 * discovery was whatever a crawler followed from the home page — and the
 * per-programme pages sit behind a snap carousel, which is exactly the kind
 * of link a crawler finds late or not at all.
 *
 * Derived from `PUBLIC_PROGRAMS`, the same source `generateStaticParams` uses,
 * so adding a programme adds its sitemap entry. A hand-listed sitemap drifts
 * the first time the catalog changes and nothing notices.
 *
 * `output: "export"` renders this to /sitemap.xml at build time.
 */

/**
 * Required by `output: "export"` — a route handler must declare itself
 * static or the build refuses to collect it. Without this the build fails
 * outright rather than silently omitting sitemap, which is the good failure mode.
 */
export const dynamic = "force-static";

const BASE = "https://terav.fit";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  // Static routes. `trailingSlash: true` is set in next.config, so the
  // canonical form carries the slash — a sitemap that disagrees with the
  // served URL invites a redirect on every entry.
  const staticRoutes = ["", "programs", "evidence", "roadmap", "privacy", "terms", "disclaimer"];

  return [
    ...staticRoutes.map((r) => ({
      url: r ? `${BASE}/${r}/` : `${BASE}/`,
      lastModified: now,
      changeFrequency: (r === "" || r === "programs" ? "weekly" : "monthly") as
        | "weekly"
        | "monthly",
      priority: r === "" ? 1 : r === "programs" ? 0.9 : 0.5,
    })),
    ...PUBLIC_PROGRAMS.map((p) => ({
      url: `${BASE}/programs/${p.slug}/`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
