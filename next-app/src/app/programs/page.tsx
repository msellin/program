"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { loadProgramManifest } from "@/lib/data-loader";
import { useStore } from "@/lib/useStore";
import { cn } from "@/lib/utils";
import type { ProgramManifest, ProgramManifestEntry } from "@/lib/schemas";

type FilterCat = "all" | ProgramManifestEntry["category"];

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
  const activeProgramId = useStore((s) => s.store.user_profile?.active_program_id);

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
    const publicOnly = manifest.programs.filter((p) => !p.personal);
    const list = filter === "all"
      ? publicOnly
      : publicOnly.filter((p) => p.category === filter);
    const byCat = new Map<string, ProgramManifestEntry[]>();
    for (const p of list) {
      if (!byCat.has(p.category)) byCat.set(p.category, []);
      byCat.get(p.category)!.push(p);
    }
    return byCat;
  }, [manifest, filter]);

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
  const publicPrograms = manifest.programs.filter((p) => !p.personal);
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
        <h1 className="text-2xl font-semibold tracking-tight text-strong">Pick your focus.</h1>
        <p className="text-sm text-muted">
          Each program is one focus arc — an engine, a skill, a lift, a stubborn joint.
          The rest of your week stays yours. Personalised to your baseline, adaptive to how you respond.
        </p>
        <p className="text-[11px] text-muted pt-1">
          <span className="font-mono uppercase text-amber">provisional</span> = beta, evidence and prescription drafted but not clinically reviewed.
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
                ? "bg-slate text-surface"
                : "bg-line-soft text-muted hover:text-ink",
            )}
          >
            {f.label}
          </button>
        ))}
      </nav>

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
                  <p className="text-[13px] text-muted -mt-1">
                    {manifest.categories[category].description}
                  </p>
                ) : null}
                <ul className="space-y-2">
                  {programs.map((p) => (
                    <li key={p.slug}>
                      <ProgramCard
                        program={p}
                        isActive={p.slug === activeProgramId}
                        category={category}
                      />
                    </li>
                  ))}
                </ul>
              </section>
            );
          })
      )}

      <footer className="pt-6 border-t border-line-soft text-[13px] text-muted italic">
        More programs land as they&apos;re authored.
      </footer>
    </div>
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
      className={`block rounded border border-line border-l-4 ${cat.borderClass} bg-surface p-3 hover:bg-line-soft/50 transition-colors`}
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
            {p.status === "PROVISIONAL" ? (
              <span
                className="font-mono text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber/20 text-amber"
                title="Beta — evidence and prescription are drafted, not yet clinically reviewed. Use with judgement."
              >
                provisional
              </span>
            ) : null}
            {p.personal ? (
              <span
                className="font-mono text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate/20 text-slate"
                title="Authored for one specific user's clinical context. Not general-purpose."
              >
                personal
              </span>
            ) : null}
          </div>
          <p
            className="text-[13px] text-muted mt-1 leading-snug"
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
