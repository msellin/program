"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { loadProgram, loadExercises } from "@/lib/data-loader";
import { ExerciseCard } from "@/components/workout/ExerciseCard";
import { DateNav } from "@/components/workout/DateNav";
import { useStore } from "@/lib/useStore";
import { today as todayISO } from "@/lib/utils";
import type { Program, Block, Exercise } from "@/lib/schemas";
import { EmptyStateCard } from "@/components/EmptyStateCard";

export default function ExtrasPage() {
  const [program, setProgram] = useState<Program | null>(null);
  const [byId, setById] = useState<Record<string, Exercise>>({});
  const [activeDate, setActiveDate] = useState(() => todayISO());
  const hydrated = useStore((s) => s.hydrated);
  const primarySlug = useStore((s) => s.store.user_profile?.active_program_id);

  useEffect(() => {
    if (!primarySlug) {
      void loadExercises().then((x) => setById(x.byId));
      return;
    }
    void Promise.all([loadProgram(primarySlug), loadExercises()]).then(([p, x]) => {
      setProgram(p);
      setById(x.byId);
    });
  }, [primarySlug]);

  if (!hydrated) return <div className="mt-8 text-sm text-muted">Loading…</div>;
  if (!primarySlug) {
    return (
      <EmptyStateCard
        title="Accessory work lives here — once you have a focus."
        body="Accessory work, mobility drills, and around-session blocks show up here once you pick a program. Optional — the plan's core sessions live on Today."
        cta={{ href: "/programs/", label: "Browse programs" }}
      />
    );
  }
  if (!program) return <div className="mt-8 text-sm text-muted">Loading…</div>;

  // "run"-category label depends on the primary program. Hip / strength users
  // read these as around-run accessory work; aerobic users read them as the
  // actual cardio sessions.
  const runGroupTitle =
    primarySlug === "anterior-hip-rebuild" ? "Around runs" : "Cardio & conditioning";
  const runGroupNote =
    primarySlug === "anterior-hip-rebuild"
      ? "Attach these to your run sessions. Log to today."
      : "Aerobic + conditioning blocks from your program.";
  const groups: { cat: string; title: string; note: string }[] = [
    { cat: "accessory", title: "Accessories & home rehab", note: "Do these when you can — they log to today, no calendar constraint." },
    { cat: "run", title: runGroupTitle, note: runGroupNote },
  ];

  const isToday = activeDate === todayISO();
  const activeProgramIds = useStore.getState().store.user_profile?.active_program_ids ?? [];
  const extraSlugs = activeProgramIds.filter((s) => s !== primarySlug);
  const titleCase = (s: string) =>
    s.split("-").map((w) => (w.length ? w[0].toUpperCase() + w.slice(1) : w)).join(" ");

  return (
    <div className="space-y-8 pt-4">
      <header>
        <h1 className="text-[32px] font-semibold tracking-tight text-strong leading-none">Off-plan</h1>
        <p className="mt-1 text-sm text-muted">
          Accessory work, home rehab, around-runs. {isToday ? "Logging to today." : "Logging to the selected date."}
        </p>
        {extraSlugs.length > 0 ? (
          <p className="mt-1 text-[12px] text-muted italic">
            Showing extras from{" "}
            <span className="text-ink font-semibold">
              {primarySlug ? titleCase(primarySlug) : "primary program"}
            </span>
            . Also active: {extraSlugs.map(titleCase).join(", ")}.
          </p>
        ) : null}
      </header>

      <DateNav date={activeDate} onChange={setActiveDate} />

      {(() => {
        const rendered = groups
          .map((g) => {
            const blocks = program.blocks.filter((b) => (b.category ?? "strength") === g.cat);
            if (!blocks.length) return null;
            const withItems = blocks.filter((b) => (b.items?.length ?? 0) > 0);
            if (!withItems.length) return null;
            return (
              <section key={g.cat} className="space-y-4">
                <header>
                  <h2 className="font-mono text-[14px] uppercase tracking-widest">{g.title}</h2>
                  <p className="mt-1 text-[14px] text-muted">{g.note}</p>
                </header>
                {withItems.map((b) => (
                  <BlockSection
                    key={b.id}
                    block={b}
                    byId={byId}
                    program={program}
                    date={activeDate}
                  />
                ))}
              </section>
            );
          })
          .filter(Boolean);
        if (rendered.length === 0) {
          return (
            <div className="rounded border border-line-soft bg-surface p-4 text-sm text-muted">
              <p>
                This program has no extras — every prescribed session lives on Today.
                You can still use the session-log card on Today to log cross-modal work
                (cardio, class attendance, walks) if you want it in your history.
              </p>
            </div>
          );
        }
        return rendered;
      })()}
    </div>
  );
}

function BlockSection({
  block,
  byId,
  program,
  date,
}: {
  block: Block;
  byId: Record<string, Exercise>;
  program: Program;
  date: string;
}) {
  const items = dedupeItemsExtras(block.items ?? (block.segments ?? []).flatMap((s) => s.items));
  const categoryColor = block.category === "run" ? "border-l-green" : "border-l-slate";
  const [open, setOpen] = useState(false);
  const exercises = items.filter((it) => it.exercise_id).map((it) => byId[it.exercise_id!]).filter(Boolean);
  return (
    <div className={`pl-3 border-l-4 ${categoryColor}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-3 py-2 text-left"
      >
        <div className="min-w-0">
          <h3 className="font-semibold text-sm">{block.name}</h3>
          <p className="text-[12px] text-muted mt-0.5 truncate">
            {exercises.length} exercise{exercises.length === 1 ? "" : "s"}
            {block.frequency ? ` · ${block.frequency}` : ""}
          </p>
        </div>
        {open ? (
          <ChevronDown size={16} className="text-muted flex-shrink-0" aria-hidden />
        ) : (
          <ChevronRight size={16} className="text-muted flex-shrink-0" aria-hidden />
        )}
      </button>
      {open ? (
        <div className="space-y-2 pb-3">
          {block.note ? (
            <p className="rounded border border-line-soft border-l-4 border-l-slate bg-surface px-3 py-2 text-[14px] text-muted">
              {block.note}
            </p>
          ) : null}
          {items.map((it, i) => {
            if (!it.exercise_id) return null;
            const ex = byId[it.exercise_id];
            if (!ex) return null;
            return (
              <ExerciseCard
                key={`${it.exercise_id}-${i}`}
                blockId={block.id}
                item={it}
                exercise={ex}
                program={program}
                date={date}
              />
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function dedupeItemsExtras<T extends { exercise_id?: string | null; scheme?: string }>(
  items: T[],
): T[] {
  const seen = new Map<string, number>();
  const out: T[] = [];
  for (const it of items) {
    if (!it.exercise_id) {
      out.push(it);
      continue;
    }
    const idx = seen.get(it.exercise_id);
    if (idx == null) {
      seen.set(it.exercise_id, out.length);
      out.push(it);
    } else if (it.scheme) {
      const existing = out[idx];
      out[idx] = { ...existing, scheme: existing.scheme ? `${existing.scheme} · then ${it.scheme}` : it.scheme };
    }
  }
  return out;
}
