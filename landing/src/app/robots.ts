import type { MetadataRoute } from "next";

/**
 * robots.txt (2026-09-06). There wasn't one.
 *
 * Everything on this host is public marketing, so the rule is permissive.
 * The authenticated app is a DIFFERENT host (app.terav.fit) and is not
 * covered by this file — it needs its own, and does not have one either.
 *
 * AI crawlers are deliberately NOT blocked. The founder's interest is
 * discovery, LLM answers included, and this site's content is exactly what
 * it wants quoted: what the programmes are and what the evidence says.
 */
/**
 * Required by `output: "export"` — a route handler must declare itself
 * static or the build refuses to collect it. Without this the build fails
 * outright rather than silently omitting robots, which is the good failure mode.
 */
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: "https://terav.fit/sitemap.xml",
    host: "https://terav.fit",
  };
}
