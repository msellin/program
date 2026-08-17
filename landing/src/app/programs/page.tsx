import type { Metadata } from "next";
import Link from "next/link";
import { Ambient } from "@/components/Ambient";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { PUBLIC_PROGRAMS, type LandingProgram } from "@/lib/programs-catalog";

const PROGRAMS_TITLE = "Programs — pick your focus";
const PROGRAMS_DESC =
  "Each Terav program is one focus arc — an engine, a skill, a lift, a stubborn joint. Authored against real evidence with honest outcome ranges.";

export const metadata: Metadata = {
  title: PROGRAMS_TITLE,
  description: PROGRAMS_DESC,
  openGraph: {
    title: `${PROGRAMS_TITLE} · Terav`,
    description: PROGRAMS_DESC,
    type: "article",
    url: "https://terav.fit/programs",
  },
  twitter: {
    card: "summary_large_image",
    title: `${PROGRAMS_TITLE} · Terav`,
    description: PROGRAMS_DESC,
  },
  alternates: { canonical: "https://terav.fit/programs" },
};

export default function ProgramsIndexPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--color-ground)] text-white">
      <Ambient />
      <div className="relative">
        <Nav />
        <div className="mx-auto max-w-6xl px-5 pt-8 pb-16 sm:px-6 sm:pt-12">
          <Link
            href="/"
            className="mono-caps mb-6 inline-block text-[var(--color-muted)] hover:text-white/80"
          >
            ← Terav
          </Link>

          <header className="mb-10 max-w-3xl">
            <div className="mono-caps mb-3 text-[var(--color-bronze-hi)]">Programs</div>
            <h1 className="text-4xl font-black leading-[1.05] tracking-tight text-white sm:text-5xl md:text-6xl">
              Pick your fight.
            </h1>
            <p className="mt-4 text-base leading-relaxed text-white/70 sm:text-lg">
              Every program lists what it&apos;s for, what it&apos;s <em>not</em> for, and
              the studies it&apos;s built on. Preview before you sign up.
            </p>
          </header>

          <div className="grid gap-5 md:grid-cols-2">
            {PUBLIC_PROGRAMS.map((p) => (
              <ProgramCard key={p.slug} p={p} />
            ))}
          </div>

          <p className="mt-10 text-sm text-[var(--color-muted)]">
            More programs land as they&apos;re authored. Two are already in flight — see the{" "}
            <Link
              href="/roadmap"
              className="underline decoration-white/20 underline-offset-4 hover:text-white hover:decoration-white/50"
            >
              roadmap
            </Link>
            .
          </p>
        </div>
        <Footer />
      </div>
    </div>
  );
}

function ProgramCard({ p }: { p: LandingProgram }) {
  const tone = TONE[p.toneColor];
  return (
    <Link
      href={`/programs/${p.slug}`}
      className="group relative block overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.02] p-6 transition hover:border-white/25 hover:bg-white/[0.04] sm:p-7"
    >
      {/* Bronze/teal gradient wash */}
      <div
        className={`pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full opacity-30 blur-3xl transition group-hover:opacity-50 ${tone.blob}`}
        aria-hidden
      />

      <div className="relative">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className={`inline-block h-1.5 w-1.5 rounded-full ${tone.dot}`} />
            <span className="mono-caps">{p.domainLabel}</span>
          </div>
          <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-medium tracking-wide ${tone.pill}`}>
            {p.duration}
          </span>
        </div>

        <h2 className="text-2xl font-bold leading-tight text-white sm:text-[26px]">
          {p.name}
        </h2>
        <p className={`mt-2 text-[15px] font-medium leading-snug ${tone.tagline}`}>
          {p.tagline}
        </p>

        <ul className="mt-5 space-y-1.5 text-[13.5px] text-white/70">
          {p.fitFor.slice(0, 2).map((f) => (
            <li key={f} className="flex items-start gap-2">
              <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-white/40" />
              <span>{f}</span>
            </li>
          ))}
        </ul>

        <div className="mt-6 flex items-center justify-between border-t border-white/[0.06] pt-4">
          <span className="text-[11.5px] text-[var(--color-muted)] uppercase tracking-wider font-mono">
            {p.evidence.length} cited studies
          </span>
          <span className="text-[13px] font-medium text-white/80 transition group-hover:text-white">
            Preview →
          </span>
        </div>
      </div>
    </Link>
  );
}

type ToneClasses = {
  dot: string;
  blob: string;
  pill: string;
  tagline: string;
};

const TONE: Record<LandingProgram["toneColor"], ToneClasses> = {
  bronze: {
    dot: "bg-[var(--color-bronze)]",
    blob: "bg-[var(--color-bronze)]",
    pill: "border-[var(--color-bronze)]/40 bg-[var(--color-bronze)]/[0.08] text-[var(--color-bronze-hi)]",
    tagline: "text-[var(--color-bronze-hi)]",
  },
  teal: {
    dot: "bg-[var(--color-teal)]",
    blob: "bg-[var(--color-teal)]",
    pill: "border-[var(--color-teal)]/40 bg-[var(--color-teal)]/[0.08] text-[var(--color-teal)]",
    tagline: "text-white/85",
  },
  green: {
    dot: "bg-[var(--color-green)]",
    blob: "bg-[var(--color-green)]",
    pill: "border-[var(--color-green)]/40 bg-[var(--color-green)]/[0.08] text-[var(--color-green)]",
    tagline: "text-white/85",
  },
  amber: {
    dot: "bg-[var(--color-amber)]",
    blob: "bg-[var(--color-amber)]",
    pill: "border-[var(--color-amber)]/40 bg-[var(--color-amber)]/[0.08] text-[var(--color-amber)]",
    tagline: "text-[var(--color-amber)]",
  },
};
