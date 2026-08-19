"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { loadProgramManifest } from "@/lib/data-loader";
import { useStore } from "@/lib/useStore";
import { cn } from "@/lib/utils";
import type { ProgramManifest, ProgramManifestEntry } from "@/lib/schemas";

type FilterCat = "all" | ProgramManifestEntry["category"];
// F4 — sort ordering. `default` preserves the manifest's authored order
// (curated + status_priority). `duration_asc` sorts shortest arc first
// so week-length shoppers scan quickly. `difficulty_asc` sorts
// beginner → intermediate → multi-tier so newcomers see the on-ramps.
type SortOrder = "default" | "duration_asc" | "difficulty_asc";
const DIFFICULTY_RANK: Record<string, number> = {
  beginner: 0,
  intermediate: 1,
  advanced: 2,
  "multi-tier": 3,
};

/**
 * Program catalog — user browses available programs and picks one to start.
 *
 * Every program is an 8-week (or longer) arc targeting a specific weakness.
 * Category filter on the top, cards below. Preview page (/programs/[slug]) has
 * the full intake + description + start button.
 */
export default function ProgramCatalogPage() {
  const [manifest, setManifest] = useState<ProgramManifest | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterCat>("all");
  const [sort, setSort] = useState<SortOrder>("default");
  const activeProgramId = useStore((s) => s.store.user_profile?.active_program_id);
  const activeProgramIds = useStore((s) => s.store.user_profile?.active_program_ids);
  const activeSet = new Set([
    ...(activeProgramIds ?? []),
    ...(activeProgramId ? [activeProgramId] : []),
  ]);

  useEffect(() => {
    void loadProgramManifest()
      .then(setManifest)
      .catch((e) => setError(e instanceof Error ? e.message : String(e)));
  }, []);

  const grouped = useMemo(() => {
    if (!manifest) return null;
    // Personal programs (Margus's anterior-hip-rebuild) are hidden from the
    // public catalog — their content refers to a specific individual's clinical
    // context. The program still loads if the user has active_program_id set
    // to it (legacy accounts, direct URL, or Margus himself), but it doesn't
    // show up in browse.
    // P0-9 (F10 Batch 31, 2026-08-19): DRAFT / PROVISIONAL programs also
    // hidden from the public catalog. Same filter — they render on direct
    // URL for authoring but never leak past the trust surface.
    const publicOnly = manifest.programs.filter(
      (p) => !p.personal && p.status !== "DRAFT" && p.status !== "PROVISIONAL",
    );
    const list = filter === "all"
      ? publicOnly
      : publicOnly.filter((p) => p.category === filter);
    // F4 — apply sort ordering. `default` preserves authored order (already
    // in manifest sequence). Sorting is applied WITHIN the current filter's
    // list so category grouping still reads cleanly per row.
    const sorted = (() => {
      if (sort === "duration_asc") {
        return [...list].sort((a, b) => (a.duration_weeks ?? 99) - (b.duration_weeks ?? 99));
      }
      if (sort === "difficulty_asc") {
        return [...list].sort(
          (a, b) =>
            (DIFFICULTY_RANK[a.difficulty ?? ""] ?? 9) -
            (DIFFICULTY_RANK[b.difficulty ?? ""] ?? 9),
        );
      }
      return list;
    })();
    const byCat = new Map<string, ProgramManifestEntry[]>();
    for (const p of sorted) {
      if (!byCat.has(p.category)) byCat.set(p.category, []);
      byCat.get(p.category)!.push(p);
    }
    return byCat;
  }, [manifest, filter, sort]);

  if (error) {
    return (
      <div className="mt-8 rounded border border-red bg-surface p-4">
        <h2 className="mb-2 text-lg font-semibold">Couldn&apos;t load programs</h2>
        <p className="text-sm text-muted">{error}</p>
      </div>
    );
  }
  if (!manifest || !grouped) {
    return <div className="mt-8 text-sm text-muted">Loading…</div>;
  }

  const sortedCategories = Object.entries(manifest.categories).sort(
    ([, a], [, b]) => a.order - b.order,
  );

  // Only show category chips that actually have at least one non-personal
  // program. Founder observed 2026-08-17 that "HYROX prep" and
  // "Left/right & mobility" chips existed but were empty — a promise-then-
  // deliver-nothing pattern. Hidden until they have at least one program.
  const publicPrograms = manifest.programs.filter(
    (p) => !p.personal && p.status !== "DRAFT" && p.status !== "PROVISIONAL",
  );
  const populatedCategoryIds = new Set<string>(publicPrograms.map((p) => p.category));

  const filterOptions: Array<{ id: FilterCat; label: string }> = [
    { id: "all", label: "All" },
    ...sortedCategories
      .filter(([id]) => populatedCategoryIds.has(id))
      .map(([id, meta]) => ({ id: id as FilterCat, label: meta.label })),
  ];

  return (
    <div className="space-y-5 pt-4">
      <header className="space-y-1">
        <h1 className="text-[32px] font-semibold tracking-tight text-strong leading-none">Pick your focus.</h1>
        <p className="text-sm text-muted">
          Each program is one focus arc — an engine, a skill, a lift, a stubborn joint.
          The rest of your week stays yours. Personalised to your baseline, adaptive to how you respond.
        </p>
        {/* Visual-craft audit 2026-08-18 — legend defines the trust
            affordance for the catalog. 11px muted was invisible on
            iPhone SE. Promoted to 12px ink; mono-caps colored terms
            keep their brightness. */}
        <p className="text-[12px] text-ink pt-1 leading-relaxed">
          <span className="font-mono uppercase text-amber">referenced</span> = every claim cites a paper, simulator harness passes.{" "}
          <span className="font-mono uppercase text-slate">reviewed</span> = domain specialist has audited the citations against literature.{" "}
          <span className="font-mono uppercase text-green">verified</span> = ≥5 users completed the arc with subjective success.
        </p>
        {/* F10 Batch 31 · honesty callout below the legend. Names the actual
            distribution so users can see the ladder isn't marketing — some
            programs will earn REVIEWED and some may never, depending on
            specialist availability and user completion volume. */}
        <p className="text-[12px] text-muted pt-1 leading-relaxed italic">
          Every program ships at least REFERENCED. Higher tiers unlock as
          specialists audit and as users complete arcs — that&apos;s the ladder,
          not a marketing gradient.
        </p>
      </header>

      <nav
        aria-label="Program category filter"
        className="flex items-center gap-1 flex-wrap"
      >
        {filterOptions.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            aria-pressed={filter === f.id}
            className={cn(
              "min-h-[36px] px-3 py-1.5 rounded-full font-mono text-[11px]",
              filter === f.id
                ? "bg-bronze text-ground"
                : "bg-line-soft text-muted hover:text-ink",
            )}
          >
            {f.label}
          </button>
        ))}
      </nav>

      {/* F4 — sort control. Uses <select> for cheap accessibility (SR
          reads native, keyboard works, no custom popover needed). Sits
          under the filter chips so the visual hierarchy stays: what
          category → then what order. */}
      <div className="flex items-center gap-2 -mt-2 text-[11px] text-muted">
        <label htmlFor="programs-sort" className="font-mono uppercase tracking-widest">
          Sort
        </label>
        <select
          id="programs-sort"
          value={sort}
          onChange={(e) => setSort(e.target.value as SortOrder)}
          className="font-mono text-[11px] px-2 py-1 min-h-[36px] rounded border border-line-soft bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-bronze focus:border-bronze"
        >
          <option value="default">Curated</option>
          <option value="duration_asc">Shortest first</option>
          <option value="difficulty_asc">Easiest first</option>
        </select>
      </div>

      {Array.from(grouped.entries()).length === 0 ? (
        <p className="text-sm text-muted italic">
          Nothing in this category yet. Try another, or check back — the catalog is growing.
        </p>
      ) : (
        Array.from(grouped.entries())
          .sort((a, b) => (manifest.categories[a[0]]?.order ?? 99) - (manifest.categories[b[0]]?.order ?? 99))
          .map(([category, programs]) => {
            const cat = CATEGORY_META[category] ?? CATEGORY_META.other;
            return (
              <section key={category} className="space-y-3">
                <div className="flex items-baseline gap-2">
                  <span className={`text-[15px] ${cat.iconClass}`}>{cat.icon}</span>
                  <h2 className="text-[15px] font-semibold text-strong">
                    {manifest.categories[category]?.label ?? category}
                  </h2>
                  <span className="text-[11px] font-mono text-muted">
                    · {programs.length}
                  </span>
                </div>
                {manifest.categories[category]?.description ? (
                  <p className="text-[14px] text-muted -mt-1">
                    {manifest.categories[category].description}
                  </p>
                ) : null}
                <ul className="space-y-2">
                  {programs.map((p) => (
                    <li key={p.slug}>
                      <ProgramCard
                        program={p}
                        isActive={activeSet.has(p.slug)}
                        category={category}
                      />
                    </li>
                  ))}
                </ul>
              </section>
            );
          })
      )}

      <footer className="pt-6 border-t border-line-soft text-[14px] text-muted italic">
        More programs land as they&apos;re authored.
      </footer>
    </div>
  );
}

/**
 * B1 (2026-08-17): status chip. Renders one of REFERENCED / REVIEWED /
 * VERIFIED (or the legacy PROVISIONAL / stable aliases). Colored by
 * confidence. See legend on this page for meaning.
 */
function StatusChip({ status }: { status?: string }) {
  // DRAFT / draft / PROVISIONAL programs are hidden from the catalog by the
  // publicOnly filter above; the chip returning null here is defensive belt-
  // and-suspenders in case a DRAFT program leaks through some other surface
  // (super-admin view, direct URL, /account list). No visible chip.
  if (!status || status === "draft" || status === "DRAFT" || status === "PROVISIONAL") return null;
  // P0-8 palette-collision fix 2026-08-19: status chips become neutral-
  // outlined pill + 6px colored dot. Category color still lives on the
  // card border-l-4 accent; status is now a small semantic tag that
  // doesn't compete for attention. Legend keeps the semantic tone words.
  const map: Record<string, { label: string; dotClass: string; title: string }> = {
    REFERENCED: {
      label: "referenced",
      dotClass: "bg-amber",
      title: "Default state: every claim cites a paper. Simulator harness passes across archetypes.",
    },
    REVIEWED: {
      label: "reviewed",
      dotClass: "bg-slate",
      title: "Domain-specialist audit complete: cited studies verified against literature. Drill sequencing evidence-backed.",
    },
    VERIFIED: {
      label: "verified",
      dotClass: "bg-green",
      title: "Field-verified: ≥5 beta users completed the arc with subjective success.",
    },
    stable: {
      label: "verified",
      dotClass: "bg-green",
      title: "Legacy status — same meaning as Verified.",
    },
  };
  const meta = map[status];
  if (!meta) return null;
  return (
    <span
      className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border border-line-soft text-muted inline-flex items-center gap-1.5"
      title={meta.title}
    >
      <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${meta.dotClass}`} />
      {meta.label}
    </span>
  );
}

/**
 * Category visual metadata — one emoji + a border-accent colour per group.
 * Keeps the catalog readable at a glance. Categories the manifest doesn't
 * explicitly cover fall back to `other`.
 */
const CATEGORY_META: Record<string, { icon: string; iconClass: string; borderClass: string }> = {
  rehab: { icon: "◆", iconClass: "text-slate", borderClass: "border-l-slate" },
  strength: { icon: "▮", iconClass: "text-bronze", borderClass: "border-l-bronze" },
  skill: { icon: "△", iconClass: "text-slate", borderClass: "border-l-slate" },
  gymnastics: { icon: "△", iconClass: "text-slate", borderClass: "border-l-slate" },
  endurance: { icon: "○", iconClass: "text-green", borderClass: "border-l-green" },
  hyrox: { icon: "☰", iconClass: "text-amber", borderClass: "border-l-amber" },
  mobility: { icon: "◇", iconClass: "text-slate", borderClass: "border-l-slate" },
  other: { icon: "·", iconClass: "text-muted", borderClass: "border-l-line" },
};

function ProgramCard({
  program: p,
  isActive,
  category,
}: {
  program: ProgramManifestEntry;
  isActive: boolean;
  category: string;
}) {
  const cat = CATEGORY_META[category] ?? CATEGORY_META.other;
  // A1 density brief 2026-08-17 · dev/design-briefs/2026-08-17-programs-picker-density.md
  // Compact card: name + status chips + one-line pitch (line-clamp-2) + one
  // metadata row. Removed from card (moved to preview):
  //   levels[] chain, `adapts` italic bronze sentence, `difficulty`,
  //   `positioning: side_track` note, `requires prereq` marker,
  //   personal italic warning paragraph.
  // Kept chips: PROVISIONAL, personal (defensive — public catalog filters
  // personal:true out but keep the visual language stable if we ever mix).
  return (
    <Link
      href={`/programs/${p.slug}`}
      className={`block rounded border border-line border-l-4 ${cat.borderClass} bg-surface px-4 py-3.5 hover:bg-line-soft/50 transition-colors`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 flex-wrap">
            <h3 className="text-sm font-semibold text-strong">{p.name}</h3>
            {isActive ? (
              <span className="font-mono text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-bronze text-ground">
                active
              </span>
            ) : null}
            <StatusChip status={p.status} />
            {p.personal ? (
              <span
                className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border border-line-soft text-muted inline-flex items-center gap-1.5"
                title="Authored for one specific user's clinical context. Not general-purpose."
              >
                <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-slate" />
                personal
              </span>
            ) : null}
          </div>
          <p
            className="text-[14px] text-muted mt-1 leading-snug"
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {p.short_description}
          </p>
          <div className="mt-2 flex items-center gap-2 text-[11px] font-mono text-muted">
            <span>{p.duration_weeks} wk</span>
            {p.load_hint ? (
              <>
                <span aria-hidden="true">·</span>
                <span>{p.load_hint}</span>
              </>
            ) : null}
          </div>
        </div>
        <ChevronRight size={16} className="text-muted flex-shrink-0 mt-1" aria-hidden />
      </div>
    </Link>
  );
}
