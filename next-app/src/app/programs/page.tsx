"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { loadProgramManifest } from "@/lib/data-loader";
import { useStore } from "@/lib/useStore";
import { cn } from "@/lib/utils";
import { DashboardBlock } from "@/components/DashboardBlock";
import { InfoSheet } from "@/components/InfoSheet";
import { StatusPill } from "@/components/ui/StatusPill";
import type { ProgramManifest, ProgramManifestEntry } from "@/lib/schemas";

// F9 Batch 30 · category → accent tone mapping for the DashboardBlock left
// stripe. Was previously duplicated in CATEGORY_META's borderClass.
const CATEGORY_ACCENT: Record<string, "slate" | "bronze" | "green" | "amber" | "default"> = {
  rehab: "slate",
  strength: "bronze",
  skill: "slate",
  gymnastics: "slate",
  endurance: "green",
  hyrox: "amber",
  mobility: "slate",
  other: "default",
};

// Batch 36 Step 13 · same accent → left-stripe classname map used by the
// "5 REFERENCED · Live now" strip card. Kept local so the strip doesn't
// pull the whole CategoryTileGrid primitive when it only needs a stripe.
const ACCENT_STRIPE: Record<string, string> = {
  slate: "border-l-slate",
  bronze: "border-l-bronze",
  green: "border-l-green",
  amber: "border-l-amber",
  default: "border-l-line-strong",
};

// Batch 36 P0 (audit 2026-08-21 · app-copy-clarity) — collapse the
// 3-tier ladder (REFERENCED / REVIEWED / VERIFIED) to 2 tiers per
// v1.1.1 §7.5. Prior 3-tier map created a same-program-3-labels
// collision (catalog: REVIEWED / preview: VERIFIED / evidence:
// REFERENCED for the same program).
// Now: REFERENCED → "CITED" (slate) · REVIEWED + VERIFIED + stable
// → "VERIFIED" (green). Two tiers, consistent everywhere.
function statusLabelOf(status: string | undefined): string {
  if (!status) return "CITED";
  if (status === "stable") return "VERIFIED";
  if (status === "REVIEWED") return "VERIFIED";
  if (status === "REFERENCED") return "CITED";
  return status.toUpperCase();
}

function statusToneOf(status: string | undefined): "slate" | "green" | "amber" | "muted" {
  if (status === "VERIFIED" || status === "stable" || status === "REVIEWED") return "green";
  if (status === "REFERENCED") return "slate";
  return "muted";
}

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
  const [ladderSheetOpen, setLadderSheetOpen] = useState(false);
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
    <div className="space-y-8 pt-4">
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
        {/* P1-77 (2026-08-19) — tap any tier word to open the deeper
            "How programs earn each status" sheet. Was inline-legend
            only; the sheet adds the full definitional detail without
            crowding the catalog surface. */}
        {/* Batch 36 audit 2026-08-21 (app-copy-clarity) — legend now
            describes the 2-tier ladder the CARDS actually render. Prior
            legend still named 3 tiers ("referenced / reviewed / verified"),
            which drifted from §7.5's collapse to `cited` / `verified` and
            from `statusLabelOf` above (which never emits "REVIEWED"). One
            lexicon everywhere. Sheet still holds the historical 3-tier
            detail for anyone who wants it. */}
        <p className="text-[12px] text-ink pt-1 leading-relaxed">
          <button
            type="button"
            onClick={() => setLadderSheetOpen(true)}
            className="font-mono uppercase text-slate underline-offset-2 hover:underline"
          >
            cited
          </button>{" "}
          = every claim references a study, simulator harness passes.{" "}
          <button
            type="button"
            onClick={() => setLadderSheetOpen(true)}
            className="font-mono uppercase text-green underline-offset-2 hover:underline"
          >
            verified
          </button>{" "}
          = the citations have been audited against the literature in a documented review,
          with reviewer, date and scope on record.
        </p>
        <p className="text-[12px] text-muted pt-1 leading-relaxed italic">
          Every program ships at least CITED. VERIFIED means a second, documented
          pass over the citations — currently Terav&apos;s own audit process, not an
          outside clinician. No program has yet been signed off by an independent
          specialist, and none has five completed field arcs. When one does, we
          will say so and name them. Personal programs (author&apos;s own clinical
          context) sit outside this ladder — see the &ldquo;personal&rdquo; badge instead.
        </p>
      </header>

      {/* Batch 36 Step 13 · "5 REFERENCED · Live now" strip per v1.1.1
          §3 row 5. Horizontal peek-scroll of every shipping REFERENCED+
          program with a category-tint stripe on the left edge. Sits
          above the filter chips so the browse mental model is: "here's
          what's shipping today" first, "browse by category" second.
          Sizes tuned for one-and-a-half card peek at 393px. */}
      {publicPrograms.length > 0 ? (
        <section className="space-y-2 -mx-4 sm:-mx-6" aria-labelledby="live-now-eyebrow">
          <div className="px-4 sm:px-6 flex items-baseline gap-2">
            {/* Batch 36 P0 (audit 2026-08-21 · app-visual-craft) — swapped
                text-bronze to text-muted. Bronze is CTA-only per R2; the
                strip eyebrow is a label, not an invitation. Also collapsed
                "referenced" wording to "cited" per §7.5 2-tier ladder. */}
            <p
              id="live-now-eyebrow"
              className="font-mono text-[10px] font-medium uppercase tracking-widest text-muted"
            >
              {publicPrograms.length} cited · live now
            </p>
          </div>
          <ul
            className="flex gap-3 overflow-x-auto px-4 sm:px-6 pb-2 snap-x snap-mandatory"
            style={{ overscrollBehaviorX: "contain" }}
          >
            {publicPrograms.map((p) => {
              const accent = CATEGORY_ACCENT[p.category] ?? CATEGORY_ACCENT.other;
              const stripeClass = ACCENT_STRIPE[accent];
              return (
                <li key={p.slug} className="snap-start flex-shrink-0 w-[240px]">
                  <Link
                    href={`/programs/${p.slug}`}
                    className={cn(
                      "block h-full rounded-lg border border-line-soft border-l-4 bg-surface-2 p-3 space-y-2",
                      "hover:bg-surface-3 active:scale-[0.98] transition-transform duration-100 motion-reduce:transition-none",
                      "focus-visible:outline focus-visible:outline-2 focus-visible:outline-bronze focus-visible:outline-offset-2",
                      stripeClass,
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-mono text-[10px] uppercase tracking-widest text-muted">
                        {p.category}
                      </p>
                      <StatusPill
                        label={statusLabelOf(p.status)}
                        tone={statusToneOf(p.status)}
                      />
                    </div>
                    <p className="text-[14px] font-semibold text-strong leading-snug line-clamp-2">
                      {p.name}
                    </p>
                    <p className="text-[12px] text-muted leading-snug line-clamp-2">
                      {p.short_description}
                    </p>
                    <p className="font-mono text-[10px] tabular-nums text-muted">
                      {p.duration_weeks} wks · {p.difficulty}
                    </p>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

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
            const meta = manifest.categories[category];
            const label = meta?.label ?? category;
            const accent = CATEGORY_ACCENT[category] ?? CATEGORY_ACCENT.other;
            const count = programs.length;
            return (
              <DashboardBlock
                key={category}
                accent={accent}
                title={label}
                eyebrow={`${count} program${count === 1 ? "" : "s"}`}
                lede={meta?.description}
              >
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
              </DashboardBlock>
            );
          })
      )}

      <footer className="pt-6 border-t border-line-soft text-[14px] text-muted italic">
        More programs land as they&apos;re authored.
      </footer>

      {/* P1-77 (2026-08-19) — long-form disclosure sheet. Content per
          the copy-clarity audit's Ginny Redish framework: users scan
          headings first, then read the tier that matters. */}
      {ladderSheetOpen ? (
        <InfoSheet
          title="How programs earn each status"
          onClose={() => setLadderSheetOpen(false)}
        >
          <section className="space-y-2">
            <p className="font-mono text-[11px] uppercase tracking-widest text-slate">
              Cited — the floor. Nothing ships below it.
            </p>
            <ul className="list-disc pl-5 space-y-1 text-[14px]">
              <li>Every claim in the program cites a peer-reviewed paper.</li>
              <li>
                The adaptive engine passes the simulator harness across
                archetypes (novice, intermediate, advanced) without stalling.
              </li>
              <li>Written by Terav, reviewed once.</li>
            </ul>
          </section>
          <section className="space-y-2">
            <p className="font-mono text-[11px] uppercase tracking-widest text-green">
              Verified — audited a second time, on the record
            </p>
            <ul className="list-disc pl-5 space-y-1 text-[14px]">
              <li>
                Every citation re-checked against the current literature in a
                separate, structured pass — not by the person who wrote the program.
              </li>
              <li>
                The reviewer, the date, the scope, and the audit documents are
                recorded in the program file itself.
              </li>
              <li>Not endorsement — audit. It flags anything it would change.</li>
            </ul>
          </section>
          <section className="space-y-2 rounded border border-line-soft bg-surface p-3">
            <p className="font-mono text-[11px] uppercase tracking-widest text-muted">
              What verified does not mean
            </p>
            <ul className="list-disc pl-5 space-y-1 text-[14px]">
              <li>
                <strong>Not an outside clinician.</strong> Terav&apos;s audits are run
                by its own review process, working from published literature. No
                physiotherapist, coach or sport scientist has independently signed
                off any program in this catalog.
              </li>
              <li>
                <strong>Not field-proven.</strong> No program has yet been completed
                start-to-finish by five users reporting the outcome. That evidence
                takes a full arc to gather, and Terav is early.
              </li>
              <li>
                Both are bars we intend to clear, and we will name the specialist and
                publish the completion count when we do. Until then this badge means
                what is written above it and nothing more.
              </li>
            </ul>
          </section>
          <p className="text-[13px] text-muted italic pt-1 border-t border-line-soft">
            Personal programs (author&apos;s own clinical context) sit outside this
            ladder entirely — see the &ldquo;personal&rdquo; badge instead.
          </p>
        </InfoSheet>
      ) : null}
    </div>
  );
}

/**
 * B1 (2026-08-17): status chip. Renders one of REFERENCED / REVIEWED /
 * VERIFIED (or the legacy PROVISIONAL / stable aliases). Colored by
 * confidence. See legend on this page for meaning.
 */
function StatusChip({ status, personal }: { status?: string; personal?: boolean }) {
  // DRAFT / draft / PROVISIONAL programs are hidden from the catalog by the
  // publicOnly filter above; the chip returning null here is defensive belt-
  // and-suspenders in case a DRAFT program leaks through some other surface
  // (super-admin view, direct URL, /account list). No visible chip.
  // S6 (2026-08-19): personal programs are outside the referenced/reviewed/
  // verified ladder entirely — the "personal" badge is their own signal.
  // Adding them to the ladder blurs the boundary the personal-italic warning
  // is trying to draw.
  if (personal) return null;
  if (!status || status === "draft" || status === "DRAFT" || status === "PROVISIONAL") return null;
  // Batch 36 P0 (audit 2026-08-21 · app-copy-clarity) — collapsed 3-tier
  // ladder to 2-tier per v1.1.1 §7.5. Prior 3-tier (REFERENCED/REVIEWED/
  // VERIFIED) created a same-program-3-labels collision: catalog showed
  // REVIEWED while preview showed VERIFIED and evidence showed REFERENCED.
  // Now: REFERENCED → "cited" (slate); REVIEWED + VERIFIED + stable →
  // "verified" (green). Two tiers, consistent across every surface.
  const map: Record<string, { label: string; dotClass: string; title: string }> = {
    REFERENCED: {
      label: "cited",
      dotClass: "bg-slate",
      title: "Cited: every claim references a peer-reviewed paper. Simulator harness passes across archetypes.",
    },
    REVIEWED: {
      label: "verified",
      dotClass: "bg-green",
      title: "Verified: citations re-audited against the literature in a documented second pass — reviewer, date and scope on record. Not an outside clinician; not yet field-proven.",
    },
    VERIFIED: {
      label: "verified",
      dotClass: "bg-green",
      title: "Verified: citations re-audited against the literature in a documented second pass. See the ladder note for what this does and does not mean.",
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
      className={cn(
        // F9 Batch 30 · when inside a category DashboardBlock, drop the
        // per-card border (block owns the container + accent stripe). Left
        // border-l-2 keeps the category color as a subtle marker on the row.
        "block rounded border-l-2 bg-line-soft/30 hover:bg-line-soft/60 transition-colors px-4 py-3.5",
        cat.borderClass,
      )}
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
            <StatusChip status={p.status} personal={p.personal} />
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
