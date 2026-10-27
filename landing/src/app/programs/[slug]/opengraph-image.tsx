import { findProgram, PUBLIC_PROGRAMS } from "@/lib/programs-catalog";
import { ogCard, OG_SIZE } from "../../og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Terav program";

export function generateStaticParams() {
  return PUBLIC_PROGRAMS.map((p) => ({ slug: p.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = findProgram(slug);
  return ogCard({
    kicker: p ? `${p.domainLabel} · ${p.duration}` : "Terav",
    title: p?.name ?? "Terav",
    sub: p?.tagline ?? "Improve your weakest area. Keep your training.",
  });
}
