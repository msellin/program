import { readFileSync } from "node:fs";
import path from "node:path";
import { ProgramPreviewClient } from "./ProgramPreviewClient";

/**
 * Static params for the [slug] route — read from the manifest at build time.
 * Adding a program is one JSON edit + rebuild; no code change here.
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

export default async function ProgramPreviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <ProgramPreviewClient slug={slug} />;
}
