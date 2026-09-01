import { SectionHead } from "./ThreeWayContrast";
import type { LandingDict } from "@/i18n/dictionaries/types";
import { PUBLIC_PROGRAMS, type LandingProgram } from "@/lib/programs-catalog";

type Program = {
  slug: string;
  name: string;
  duration: string;
  category: string;
  tone: "bronze" | "teal" | "green" | "amber";
  status: "AVAILABLE" | "COMING" | "PERSONAL";
  review: "cited" | "verified";
  body: string;
  evidence: string;
};

/**
 * Single source of truth (2026-09-01).
 *
 * This section used to carry its own hardcoded array of five programs, parallel
 * to `programs-catalog.ts` which backs `/programs` and every detail page. When
 * the catalog went to eight, the detail pages followed and this list did not —
 * so the home page rendered "Eight programs live." above five cards, with a
 * "Three more in build" link underneath. Two lists, one of them wrong.
 *
 * Now derived from `PUBLIC_PROGRAMS`. Adding a program to the catalog adds it
 * here for free, and the two can no longer disagree. The dictionary keeps only
 * the marketing pitch per slug, because that is genuinely landing-owned copy
 * and is the part that gets translated.
 */
function programsFor(dict: LandingDict): Program[] {
  const t = dict.programs;
  const pitchBySlug: Record<string, string | undefined> = {
    "engine-builder": t.engine_builder_pitch,
    "concurrent-strength-maintenance": t.csm_pitch,
    "rowing-2k-test-prep": t.rowing_pitch,
    "handstand-walk": t.handstand_pitch,
    "overhead-mobility": t.overhead_pitch,
    "first-strict-pullup": t.pullup_pitch,
    "muscle-up": t.muscleup_pitch,
    "engine-builder-block-2": t.engine_block2_pitch,
  };
  const domainLabel: Record<LandingProgram["domain"], string> = {
    aerobic: t.domain_aerobic,
    concurrent: t.domain_concurrent,
    skill: t.domain_skill,
  };
  return PUBLIC_PROGRAMS.map((p) => ({
    slug: p.slug,
    name: p.name,
    // The catalog carries "Multi-tier · 8 weeks"; the card has room for the
    // short form only.
    duration: p.duration.includes("·")
      ? p.duration.split("·")[0].trim()
      : p.duration,
    category: domainLabel[p.domain],
    tone: p.toneColor,
    status: p.status,
    review: p.review,
    // Falls back to the catalog tagline so a newly-added program still renders
    // a sentence rather than an empty card if the pitch key is not added yet.
    body: pitchBySlug[p.slug] ?? p.tagline,
    evidence: p.evidence
      .slice(0, 2)
      .map((e) => e.label.split("·")[0].trim())
      .join(" · "),
  }));
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
        <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {programs.map((p) => (
            <div key={p.slug} className="snap-center shrink-0 basis-[82vw]">
              <ProgramCard p={p} />
            </div>
          ))}
        </div>
        {/* M2 fix (2026-08-17): removed decorative dots. All identical
            bg-white/25 pips with no active-state binding promise position
            feedback the code doesn't deliver — noise per Tapworthy. Peek
            (basis-[82vw] snap-center) is the affordance. */}
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
        ) : (
          /* The app distinguishes CITED from VERIFIED and the landing did not,
             so the marketing site implied a specialist audit three programs
             have not had. Same two tiers, same words. */
          <span
            className={
              "rounded-full border px-2 py-0.5 text-[10px] font-medium tracking-wide " +
              (p.review === "verified"
                ? "border-[var(--color-green)]/40 bg-[var(--color-green)]/[0.08] text-[var(--color-green)]"
                : "border-white/15 bg-white/[0.03] text-[var(--color-muted)]")
            }
            title={
              /* "Specialist-audited" claimed a credential nobody holds: the
                 audits are Terav's own documented review pass, not an outside
                 clinician's sign-off. Wording now matches the app's ladder
                 note, which states plainly what the badge does and does not
                 mean. (2026-09-01) */
              p.review === "verified"
                ? "Citations re-audited against the literature in a documented second pass."
                : "Every claim cites a study. The second audit pass is still to come."
            }
          >
            {p.review === "verified" ? "VERIFIED" : "CITED"}
          </span>
        )}
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
