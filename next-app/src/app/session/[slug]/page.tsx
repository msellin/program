import { readFileSync } from "node:fs";
import path from "node:path";
import { SessionClient } from "./SessionClient";

/**
 * F8-second (2026-08-19) — /session/[slug] route.
 *
 * Renders the same session view as Today's `/` route, but narrowed to a
 * single program (the `[slug]`). Users navigate here from Today's
 * "Open session →" affordance (or a bookmark) to focus on one program's
 * workout without dashboard chrome around it.
 *
 * For now the route reuses `<TodayView />` with a `slugOverride` prop —
 * both routes look nearly identical. Future work will diverge them:
 * Today becomes a pure dashboard (MorningCheck + Workout summary +
 * Extras blocks), and /session hosts the focused workout. See
 * dev/active/F8-second-plan.md for the full split plan.
 *
 * Static params: pre-render one route per program slug at build time so
 * the routes exist even when the app hasn't loaded manifest yet.
 * dynamicParams = false — any slug not in the manifest 404s (safer than
 * rendering a broken session view for a typo).
 */
export function generateStaticParams(): Array<{ slug: string }> {
  const manifestPath = path.join(
    process.cwd(),
    "public",
    "data",
    "programs",
    "manifest.json",
  );
  const raw = readFileSync(manifestPath, "utf-8");
  const manifest = JSON.parse(raw) as { programs: Array<{ slug: string }> };
  return manifest.programs.map((p) => ({ slug: p.slug }));
}

export const dynamicParams = false;

export default async function SessionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <SessionClient slug={slug} />;
}
