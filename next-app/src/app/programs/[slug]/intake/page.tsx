import { readFileSync } from "node:fs";
import path from "node:path";
import { IntakeClient } from "./IntakeClient";

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

export default async function ProgramIntakePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <IntakeClient slug={slug} />;
}
