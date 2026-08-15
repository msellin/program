import type { Metadata } from "next";
import Link from "next/link";
import { Ambient } from "@/components/Ambient";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Roadmap — Terav",
  description:
    "What Terav has shipped, what's in build, and what's next. Programs highlighted; product development mixed in.",
};

type Status = "shipped" | "in_build" | "planned" | "deferred";

/**
 * `kind` = type of change. Kept as a single-axis pill on every row so the
 * mixed feed stays scannable — a reader looking for "any new programs?" can
 * find them by the bronze pill; someone tracking product-development can
 * scan the other colors. Programs get visual prominence because they're the
 * user-facing thing most people came here for.
 */
type Kind =
  | "new_program"
  | "program_upgrade"
  | "new_feature"
  | "new_surface"
  | "brand"
  | "under_the_hood";

const KIND_META: Record<Kind, { label: string; tone: string; priority: number }> = {
  // Programs — bronze, prominent
  new_program: {
    label: "New program",
    tone: "border-[var(--color-bronze)]/50 bg-[var(--color-bronze)]/[0.14] text-[var(--color-bronze-hi)]",
    priority: 0,
  },
  program_upgrade: {
    label: "Program upgrade",
    tone: "border-[var(--color-bronze)]/35 bg-[var(--color-bronze)]/[0.07] text-[var(--color-bronze-hi)]",
    priority: 1,
  },
  // Product development — muted teal / neutral
  new_feature: {
    label: "Feature",
    tone: "border-[var(--color-teal)]/35 bg-[var(--color-teal)]/[0.08] text-[var(--color-teal-hi)]",
    priority: 2,
  },
  new_surface: {
    label: "New surface",
    tone: "border-white/15 bg-white/[0.04] text-white/70",
    priority: 3,
  },
  brand: {
    label: "Brand",
    tone: "border-white/15 bg-white/[0.04] text-white/70",
    priority: 4,
  },
  under_the_hood: {
    label: "Under the hood",
    tone: "border-white/10 bg-white/[0.03] text-white/55",
    priority: 5,
  },
};

type Item = {
  title: string;
  status: Status;
  kind: Kind;
  detail: string;
  evidence?: string;
};

const items: Item[] = [
  // ---- Programs ----
  {
    title: "Engine Builder · Block 1",
    status: "shipped",
    kind: "new_program",
    detail: "8-week aerobic base for lifters. Foundation / Progression / Push tiers.",
    evidence: "Helgerud 2007, Wisløff 2007, Seiler 2010",
  },
  {
    title: "Concurrent-Strength Maintenance",
    status: "shipped",
    kind: "new_program",
    detail: "8 weeks. Add cardio without losing the squat. Explosive-strength cost bounded.",
    evidence: "Schumann 2022, Wilson 2012, Robineau 2016, Eddens 2018",
  },
  {
    title: "Rowing 2K Test Prep",
    status: "shipped",
    kind: "new_program",
    detail: "6-week race-anchored block: base check → threshold build → taper + test.",
    evidence: "Seiler 2010, Mujika & Padilla 2000, Joyner & Coyle 2008",
  },
  {
    title: "Handstand Walk",
    status: "shipped",
    kind: "new_program",
    detail: "Four tiers, five capability slots, multi-dimensional drill selection.",
    evidence: "Wulf 1998/2013, Shea & Morgan 1979, Karni 1998, Kinoshita 2022",
  },
  {
    title: "Overhead Mobility",
    status: "shipped",
    kind: "new_program",
    detail: "10 weeks. Kinematic base before load — snatch / OHS / press.",
    evidence: "Ludewig 2000/2009, Reinold 2007, Wulf 2013",
  },
  {
    title: "First Strict Pull-Up",
    status: "in_build",
    kind: "new_program",
    detail:
      "Multi-dim skill program on the shared drill library. Scap → hang → negative → band → unassisted.",
    evidence: "Wulf 1998/2013, Shea & Morgan 1979 · pending Youdas 2010 authoring",
  },
  {
    title: "Muscle-Up Acquisition",
    status: "in_build",
    kind: "new_program",
    detail: "Reuses handstand + pull-up drill libraries. False-grip base, transition, dip.",
    evidence: "Motor learning · specificity of practice",
  },
  {
    title: "Engine Builder · Block 2 (Volume)",
    status: "in_build",
    kind: "program_upgrade",
    detail: "Threshold-dominant continuation of Block 1.",
    evidence: "Seiler 2010, Astorino 2013, Joyner & Coyle 2008",
  },
  {
    title: "First Strict HSPU",
    status: "planned",
    kind: "new_program",
    detail: "Wrist tolerance → wall → freestand. Shares handstand drill library.",
    evidence: "Kinoshita 2022, Sadowski 2021, Barlow 2020",
  },
  {
    title: "HYROX prep — strength-floor protected",
    status: "planned",
    kind: "new_program",
    detail: "For hybrid athletes who won't sacrifice the squat. VO2max-led per Brandt 2025.",
    evidence: "Brandt 2025, Helgerud 2007, Schumann 2022",
  },
  {
    title: "Rehab as a main track",
    status: "deferred",
    kind: "new_program",
    detail:
      "Anterior Hip Rebuild is personal-scope. A general rehab main track needs a second user to validate against. Post-launch.",
  },

  // ---- Product development ----
  {
    title: "Confirm-first adaptive engine",
    status: "shipped",
    kind: "new_feature",
    detail: "Every proposal shows a source. Nothing changes without your Accept.",
  },
  {
    title: "Multi-dimensional drill composition",
    status: "shipped",
    kind: "new_feature",
    detail: "Drills picked at your level, prerequisites gated, external-focus cue attached.",
  },
  {
    title: "Declarative retest metrics",
    status: "shipped",
    kind: "under_the_hood",
    detail: "Unified schema for every program's progression signal.",
  },
  {
    title: "Capacity gate at intake",
    status: "shipped",
    kind: "new_feature",
    detail: "If your available days are below a program's evidence-backed floor, we tell you upfront.",
  },
  {
    title: "'Your plan built' reveal",
    status: "shipped",
    kind: "new_feature",
    detail:
      "Program-start card that shows what your intake answers changed — not just what tier you got.",
  },
  {
    title: "Public program preview",
    status: "shipped",
    kind: "new_surface",
    detail: "Every program's shape, phases, and evidence base — no signup required to read.",
  },
  {
    title: "Terav brand identity",
    status: "shipped",
    kind: "brand",
    detail: "Bronze T monogram, chisel-stroke gradient, icon set at every size, sign-in wordmark.",
  },
  {
    title: "Estonian (ET) landing",
    status: "shipped",
    kind: "new_surface",
    detail: "Full landing translated to Estonian. Language switcher persists across sub-pages.",
  },
  {
    title: "Level 3 constraint solver",
    status: "in_build",
    kind: "under_the_hood",
    detail:
      "Weekly template layout picked from user's schedule constraints (available days, session length, modality).",
  },
  {
    title: "Adaptive engine per program strategy",
    status: "planned",
    kind: "under_the_hood",
    detail:
      "Trend-based adapter (aerobic HR trend), hybrid concurrent adapter — beyond the current 5/3/1-shaped evaluator.",
  },
  {
    title: "Materialised DailyPlan",
    status: "planned",
    kind: "under_the_hood",
    detail: "One shared daily plan powers Today, Report, and future notification jobs.",
  },
  {
    title: "Estonian app UI",
    status: "planned",
    kind: "brand",
    detail:
      "Technical vocabulary (Zone 2, RPE, external-focus cue) needs careful translation — done with Estonian beta users, not for them.",
  },
  {
    title: "Medical-data upload",
    status: "deferred",
    kind: "new_feature",
    detail:
      "6-12 month build + EU MDR class IIa regulatory surface. Not for beta. Structured intake for movement contraindications covers 70% of value.",
  },
];

const STATUS_META: Record<Status, { title: string; note: string; tone: string }> = {
  shipped: { title: "Live", note: "In production today.", tone: "bronze" },
  in_build: {
    title: "In build",
    note: "Cited before authored. Ships when the evidence is defensible.",
    tone: "teal",
  },
  planned: { title: "Planned", note: "Named, scoped, waiting for signal.", tone: "muted" },
  deferred: {
    title: "Explicitly deferred",
    note: "We know it's asked for. Here's why not now.",
    tone: "muted",
  },
};

export default function RoadmapPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--color-ground)] text-white">
      <Ambient />
      <div className="relative">
        <Nav />
        <section className="mx-auto max-w-4xl px-5 pt-8 pb-16 sm:px-6 sm:pt-12">
          <Link href="/" className="mono-caps mb-6 inline-block text-white/60 hover:text-white/80">
            ← Terav
          </Link>
          <h1 className="text-4xl font-black leading-[1.05] tracking-tight text-white sm:text-5xl md:text-6xl">
            Roadmap.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-white/60 sm:text-lg">
            What&rsquo;s shipped, what&rsquo;s in build, what&rsquo;s next.
            Programs highlighted in bronze; product development mixed in.
          </p>

          <div className="mt-12 space-y-10">
            {(Object.keys(STATUS_META) as Status[]).map((status) => {
              const groupItems = items
                .filter((i) => i.status === status)
                // Programs first within each status group
                .sort((a, b) => KIND_META[a.kind].priority - KIND_META[b.kind].priority);
              if (!groupItems.length) return null;
              const meta = STATUS_META[status];
              return (
                <div key={status}>
                  <div className="mb-3 flex items-baseline gap-3">
                    <span
                      className={`inline-block h-2 w-2 rounded-full ${
                        meta.tone === "bronze"
                          ? "bg-[var(--color-bronze)]"
                          : meta.tone === "teal"
                          ? "bg-[var(--color-teal)]"
                          : "bg-white/30"
                      }`}
                    />
                    <h2 className="text-xl font-bold text-white sm:text-2xl">{meta.title}</h2>
                    <span className="mono-caps text-white/60">{groupItems.length}</span>
                  </div>
                  <p className="mb-4 text-[13px] text-white/60">{meta.note}</p>
                  <ul className="divide-y divide-white/[0.06] rounded-2xl border border-white/[0.06] bg-white/[0.02]">
                    {groupItems.map((item) => {
                      const kindMeta = KIND_META[item.kind];
                      return (
                        <li key={item.title} className="px-5 py-4 sm:px-6 sm:py-5">
                          <div className="flex flex-wrap items-baseline gap-2">
                            <h3 className="text-[14.5px] font-semibold text-white">
                              {item.title}
                            </h3>
                            <span
                              className={`rounded-full border px-2 py-0.5 text-[10px] font-medium tracking-wide ${kindMeta.tone}`}
                            >
                              {kindMeta.label}
                            </span>
                          </div>
                          <p className="mt-1 text-[13px] leading-relaxed text-white/60">
                            {item.detail}
                          </p>
                          {item.evidence ? (
                            <p className="mt-2 font-mono text-[11px] text-white/40">
                              {item.evidence}
                            </p>
                          ) : null}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>
        <Footer />
      </div>
    </div>
  );
}
