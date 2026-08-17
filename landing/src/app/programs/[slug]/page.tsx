import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Ambient } from "@/components/Ambient";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { findProgram, PUBLIC_PROGRAMS, type LandingProgram } from "@/lib/programs-catalog";
import { APP_URL } from "@/config";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return PUBLIC_PROGRAMS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = findProgram(slug);
  if (!p) return { title: "Program not found" };
  return {
    title: `${p.name} — ${p.tagline}`,
    description: p.arcSummary,
  };
}

export default async function ProgramDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const p = findProgram(slug);
  if (!p || p.personal) notFound();

  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--color-ground)] text-white">
      <Ambient />
      <div className="relative">
        <Nav />
        <article className="mx-auto max-w-3xl px-5 pt-8 pb-16 sm:px-6 sm:pt-12">
          <Link
            href="/programs"
            className="mono-caps mb-6 inline-block text-[var(--color-muted)] hover:text-white/80"
          >
            ← All programs
          </Link>

          <header className="mb-10">
            <div className="mb-3 flex items-center gap-2">
              <span className={`inline-block h-1.5 w-1.5 rounded-full ${accent(p)}`} />
              <span className="mono-caps">{p.domainLabel}</span>
              <span className="text-white/25">·</span>
              <span className="mono-caps text-[var(--color-muted)]">{p.duration}</span>
              <span className="text-white/25">·</span>
              <span className="mono-caps text-[var(--color-muted)]">{p.difficulty}</span>
            </div>
            <h1 className="text-4xl font-black leading-[1.05] tracking-tight text-white sm:text-5xl md:text-6xl">
              {p.name}
            </h1>
            <p className="mt-4 text-lg font-medium leading-snug text-white/85 sm:text-xl">
              {p.tagline}
            </p>
          </header>

          <Section title="What it's for">
            <ul className="space-y-2 text-[15px] leading-relaxed text-white/75">
              {p.fitFor.map((f) => (
                <li key={f} className="flex items-start gap-3">
                  <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[var(--color-bronze-hi)]" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </Section>

          <Section title="The arc">
            <p className="text-[15px] leading-relaxed text-white/75">{p.arcSummary}</p>
          </Section>

          <Section title="What gets retested">
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5">
              <p className="text-[15px] leading-relaxed text-white/85">{p.retest}</p>
            </div>
          </Section>

          <Section title="Honest outcome ranges">
            <div className="space-y-2">
              {p.outcomes.map((o) => (
                <div
                  key={o.tier}
                  className="grid grid-cols-[100px_1fr] gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3"
                >
                  <span className="mono-caps text-[var(--color-bronze-hi)]">{o.tier}</span>
                  <span className="text-[14px] leading-relaxed text-white/75">{o.expected}</span>
                </div>
              ))}
            </div>
            <p className="mt-3 text-[12.5px] italic text-[var(--color-muted)]">
              Ranges are honest, not guarantees. Response varies — HERITAGE non-response
              distributions apply to any structured training program.
            </p>
          </Section>

          <Section title="What it cites">
            <ul className="space-y-4">
              {p.evidence.map((e) => (
                <li key={e.label}>
                  <p className="font-mono text-[12.5px] uppercase tracking-wider text-[var(--color-bronze-hi)]">
                    {e.label}
                  </p>
                  <p className="mt-1 text-[14px] leading-relaxed text-white/70">
                    {e.source}
                  </p>
                </li>
              ))}
            </ul>
          </Section>

          <Section title="Not for you if">
            <ul className="space-y-2 text-[14px] leading-relaxed text-white/70">
              {p.contraindications.map((c) => (
                <li key={c} className="flex items-start gap-3">
                  <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[var(--color-amber)]" />
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </Section>

          <section className="mt-12 rounded-3xl border border-[var(--color-bronze)]/25 bg-[var(--color-bronze)]/[0.05] p-6 sm:p-8">
            <div className="mono-caps mb-3 text-[var(--color-bronze-hi)]">
              Ready to start
            </div>
            <p className="text-[15px] leading-relaxed text-white/85">
              Sign up on the app, complete the intake, and your first session is on
              Today within two minutes. Free during beta.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <a
                href={`${APP_URL}/sign-up?next=${encodeURIComponent(
                  `/programs/${p.slug}`,
                )}`}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[var(--color-bronze-hi)] to-[var(--color-bronze-lo)] px-6 py-3 text-sm font-semibold text-black shadow-[0_10px_40px_-10px_rgba(208,154,104,0.6)] transition hover:brightness-110"
              >
                Sign up to start
                <span>→</span>
              </a>
              <a
                href={`${APP_URL}/sign-in?next=${encodeURIComponent(
                  `/programs/${p.slug}`,
                )}`}
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.03] px-6 py-3 text-sm font-medium text-white/85 backdrop-blur transition hover:border-white/40 hover:bg-white/[0.06]"
              >
                Already have an account
              </a>
            </div>
          </section>

          <div className="mt-12 flex flex-wrap gap-4 border-t border-white/[0.06] pt-8 text-[13px]">
            <Link
              href="/programs"
              className="text-white/70 underline decoration-white/25 underline-offset-4 hover:text-white hover:decoration-white/60"
            >
              ← All programs
            </Link>
            <Link
              href="/evidence"
              className="text-white/70 underline decoration-white/25 underline-offset-4 hover:text-white hover:decoration-white/60"
            >
              Evidence base →
            </Link>
          </div>
        </article>
        <Footer />
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-10">
      <h2 className="mb-4 mono-caps text-[var(--color-muted)]">{title}</h2>
      {children}
    </section>
  );
}

function accent(p: LandingProgram): string {
  switch (p.toneColor) {
    case "bronze":
      return "bg-[var(--color-bronze)]";
    case "teal":
      return "bg-[var(--color-teal)]";
    case "green":
      return "bg-[var(--color-green)]";
    case "amber":
      return "bg-[var(--color-amber)]";
  }
}
