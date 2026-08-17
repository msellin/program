import { SectionHead } from "./ThreeWayContrast";
import type { LandingDict } from "@/i18n/dictionaries/types";

type Program = {
  slug: string;
  name: string;
  duration: string;
  category: string;
  tone: "bronze" | "teal" | "green" | "amber";
  status: "AVAILABLE" | "COMING" | "PERSONAL";
  body: string;
  evidence: string;
};

function programsFor(dict: LandingDict): Program[] {
  const t = dict.programs;
  return [
    {
      slug: "engine-builder",
      name: "Engine Builder",
      duration: "8 weeks",
      category: t.domain_aerobic,
      tone: "teal",
      status: "AVAILABLE",
      body: t.engine_builder_pitch,
      evidence: "Helgerud 2007 · Seiler 2010",
    },
    {
      slug: "concurrent-strength-maintenance",
      name: "Concurrent-Strength Maintenance",
      duration: "8 weeks",
      category: t.domain_concurrent,
      tone: "bronze",
      status: "AVAILABLE",
      body: t.csm_pitch,
      evidence: "Schumann 2022 · Robineau 2016",
    },
    {
      slug: "rowing-2k-test-prep",
      name: "Rowing 2K Test Prep",
      duration: "6 weeks",
      category: t.domain_aerobic,
      tone: "teal",
      status: "AVAILABLE",
      body: t.rowing_pitch,
      evidence: "Bosquet 2007 · Mujika 2000",
    },
    {
      slug: "handstand-walk",
      name: "Handstand Walk",
      duration: "Multi-tier",
      category: t.domain_skill,
      tone: "bronze",
      status: "AVAILABLE",
      body: t.handstand_pitch,
      evidence: "Wulf 1998 · Shea &amp; Morgan 1979",
    },
    {
      slug: "overhead-mobility",
      name: "Overhead Mobility",
      duration: "10 weeks",
      category: t.domain_skill,
      tone: "bronze",
      status: "AVAILABLE",
      body: t.overhead_pitch,
      evidence: "Ludewig &amp; Cook 2000 · Karni 1998",
    },
  ];
}

export function Programs({ dict }: { dict: LandingDict }) {
  const t = dict.programs;
  const programs = programsFor(dict);
  return (
    <section className="relative mx-auto max-w-6xl py-16 sm:py-24">
      <div className="px-5 sm:px-6">
        <SectionHead eyebrow={t.eyebrow} title={t.title} sub={t.sub} />
      </div>

      {/* Mobile: horizontal snap carousel with peek. Uses CSS scroll-snap only —
          no JS library. Cards are 82vw so the next card peeks in ~12vw at the
          right edge, teaching the swipe affordance without dots. */}
      <div className="mt-10 sm:hidden">
        <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2 [scrollbar-width:none] [&amp;::-webkit-scrollbar]:hidden">
          {programs.map((p) => (
            <div key={p.slug} className="snap-center shrink-0 basis-[82vw]">
              <ProgramCard p={p} />
            </div>
          ))}
        </div>
        <div className="mt-2 flex justify-center gap-1.5">
          {programs.map((p) => (
            <span
              key={p.slug}
              className="h-1 w-1 rounded-full bg-white/25"
              aria-hidden
            />
          ))}
        </div>
      </div>

      {/* Desktop: grid unchanged */}
      <div className="mt-12 hidden gap-4 px-6 sm:grid md:grid-cols-2 lg:grid-cols-3">
        {programs.map((p) => (
          <ProgramCard key={p.slug} p={p} />
        ))}
      </div>

      <p className="mt-6 px-5 text-[13px] text-[var(--color-muted)] sm:px-6">
        <a
          href={"/roadmap"}
          className="underline decoration-white/20 underline-offset-4 hover:text-white hover:decoration-white/50"
        >
          {t.roadmap_link}
        </a>
      </p>
    </section>
  );
}

function ProgramCard({ p }: { p: Program }) {
  const accent =
    p.tone === "bronze"
      ? "bg-[var(--color-bronze)]"
      : p.tone === "teal"
      ? "bg-[var(--color-teal)]"
      : p.tone === "green"
      ? "bg-[var(--color-green)]"
      : "bg-[var(--color-amber)]";
  const statusStyle =
    p.status === "AVAILABLE"
      ? "border-[var(--color-green)]/40 bg-[var(--color-green)]/[0.08] text-[var(--color-green)]"
      : p.status === "PERSONAL"
      ? "border-[var(--color-amber)]/40 bg-[var(--color-amber)]/[0.08] text-[var(--color-amber)]"
      : "border-white/15 bg-white/[0.03] text-[var(--color-muted)]";

  const href = `/programs/${p.slug}`;

  return (
    <a
      href={href}
      className="group relative block overflow-hidden rounded-2xl border border-white/[0.08] bg-[var(--color-ground-2)] p-6 backdrop-blur transition hover:border-white/20 hover:bg-white/[0.04] active:border-white/35 active:bg-white/[0.07] focus-visible:border-white/25 focus-visible:bg-white/[0.05]"
    >
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`inline-block h-1.5 w-1.5 rounded-full ${accent}`} />
          <span className="mono-caps">{p.category}</span>
        </div>
        {p.status !== "AVAILABLE" ? (
          <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium tracking-wide ${statusStyle}`}>
            {p.status}
          </span>
        ) : null}
      </div>

      <h3 className="mb-1 text-xl font-bold text-white sm:text-2xl">{p.name}</h3>
      <div className="mb-3 text-xs text-[var(--color-muted)]">{p.duration}</div>
      <p className="text-sm leading-relaxed text-[var(--color-muted)]">{p.body}</p>

      {p.evidence ? (
        <div className="mt-5 border-t border-white/[0.06] pt-3">
          <div className="mono-caps mb-1">Cites</div>
          <div className="text-[11px] leading-relaxed text-[var(--color-muted)]">{p.evidence}</div>
        </div>
      ) : null}

      <div className="mt-4 text-[12px] text-[var(--color-muted)] transition group-hover:text-white">
        Preview →
      </div>
    </a>
  );
}
