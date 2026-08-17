"use client";

import { useEffect, useRef, useState } from "react";
import { Info } from "lucide-react";
import { loadProgram, loadExercises } from "@/lib/data-loader";
import { useStore } from "@/lib/useStore";
import { evaluateCycleEnd, detectPauseResume, assessWaypoints } from "@/lib/engine/adapt";
import { HipProgressTile } from "@/components/HipProgressTile";
import { WeeklyNarrativeTile } from "@/components/WeeklyNarrativeTile";
import { RetestMetricsPanel } from "@/components/progress/RetestMetricsPanel";
import { ProposalStack } from "@/components/workout/ProposalStack";
import { InfoSheet } from "@/components/InfoSheet";
import { today } from "@/lib/utils";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";
import type { Program, Exercise, Milestone } from "@/lib/schemas";


// Lazy — Recharts is ~112 KB gz, no reason to prefetch to Today
const SymptomLoadChart = dynamic(
  () => import("@/components/charts/SymptomLoadChart").then((m) => ({ default: m.SymptomLoadChart })),
  { ssr: false, loading: () => <div className="h-[300px] text-[12px] text-muted italic">Loading chart…</div> },
);

const HIP_PRIMARY_LIFTS = [
  "back_squat_highbar",
  "front_squat",
  "block_pull_midshin",
  "deadlift_conventional",
];

/**
 * Which lifts render in the Lifts editor for this program.
 * Priority:
 *   1. Any existing training_maxes keys on the user's store (these already
 *      matter to them — never hide a lift the user has entered)
 *   2. Program's declared starting_values_kg exercise IDs (if present)
 *   3. Hip program's canonical four (legacy fallback)
 */
function primaryLiftsForProgram(
  program: Program,
  storeTMs: Record<string, number>,
): string[] {
  const userLifts = Object.keys(storeTMs);
  const startingValues =
    ((program.training_maxes as { starting_values_kg?: Record<string, number> } | undefined)
      ?.starting_values_kg) ?? {};
  const authored = Object.keys(startingValues);
  const merged = new Set<string>([...userLifts, ...authored]);
  if (merged.size > 0) return Array.from(merged);
  return HIP_PRIMARY_LIFTS;
}

export default function ProgressPage() {
  const [program, setProgram] = useState<Program | null>(null);
  const [byId, setById] = useState<Record<string, Exercise>>({});
  const [error, setError] = useState<string | null>(null);
  const hydrated = useStore((s) => s.hydrated);
  const store = useStore((s) => s.store);
  const setTM = useStore((s) => s.setTM);
  const primarySlug = useStore((s) => s.store.user_profile?.active_program_id);

  useEffect(() => {
    if (!primarySlug) {
      // No program picked — don't fall back to the founder's default. The
      // empty state renders below.
      void loadExercises().then((x) => setById(x.byId));
      return;
    }
    void Promise.all([loadProgram(primarySlug), loadExercises()])
      .then(([p, x]) => {
        setProgram(p);
        setById(x.byId);
      })
      .catch((e) => setError(e instanceof Error ? e.message : String(e)));
  }, [primarySlug]);

  if (error) return <ErrorBox msg={error} />;
  if (!hydrated) return <div className="mt-8 text-sm text-muted">Loading…</div>;
  if (!primarySlug) {
    return (
      <div className="pt-8 space-y-4">
        <h1 className="text-3xl font-semibold tracking-tight">Progress</h1>
        <p className="text-[14px] text-muted leading-relaxed">
          Pick a program to see your training maxes, milestones, and trends here.
        </p>
        <a
          href="/programs"
          className="inline-block font-mono text-[11px] uppercase tracking-wider px-3 py-2 rounded bg-bronze text-ground"
        >
          Start a program →
        </a>
      </div>
    );
  }
  if (!program) return <div className="mt-8 text-sm text-muted">Loading…</div>;

  const goals = program.goals as Record<string, unknown> | undefined;
  const targets = goals?.progression_targets as
    | { note?: string; milestones?: Milestone[]; auto_adjust_policy?: string; target_date?: string }
    | undefined;
  const tmMeta = (program.training_maxes ?? {}) as Record<string, unknown>;
  const evalWeek = tmMeta.evaluation_week as
    | { protocol?: string; tm_formula?: string }
    | undefined;
  const stretchTargets = store.stretch_targets ?? {};

  const todayISO = today();
  const cycleEval = evaluateCycleEnd(program, store, todayISO);
  const pauseSignal = detectPauseResume(store, todayISO);
  const waypointStatus = assessWaypoints(program, store, todayISO);

  return (
    <ProgressBody
      program={program}
      byId={byId}
      pauseSignal={pauseSignal}
      cycleEval={cycleEval}
      waypointStatus={waypointStatus}
      tmMeta={tmMeta}
      evalWeek={evalWeek}
      targets={targets}
      stretchTargets={stretchTargets}
      setTM={setTM}
    />
  );
}

function ProgressBody({
  program: _program,
  byId,
  pauseSignal,
  cycleEval,
  waypointStatus,
  tmMeta,
  evalWeek,
  targets,
  stretchTargets,
  setTM,
}: {
  program: Program;
  byId: Record<string, Exercise>;
  pauseSignal: ReturnType<typeof detectPauseResume>;
  cycleEval: ReturnType<typeof evaluateCycleEnd>;
  waypointStatus: ReturnType<typeof assessWaypoints>;
  tmMeta: Record<string, unknown>;
  evalWeek: { protocol?: string; tm_formula?: string } | undefined;
  targets:
    | { note?: string; milestones?: Milestone[]; auto_adjust_policy?: string; target_date?: string }
    | undefined;
  stretchTargets: Record<string, number>;
  setTM: (id: string, kg: number | null) => void;
}) {
  const store = useStore((s) => s.store);
  // Default landing tab depends on the primary training modality. Aerobic-
  // primary programs (Engine Builder, Rowing 2K) land on Insights — Lifts is
  // an empty state for them. Strength / concurrent land on Lifts. Skill
  // programs also land on Insights.
  const activeSlugForDefault = store.user_profile?.active_program_id;
  const [insightsInfoOpen, setInsightsInfoOpen] = useState(false);

  // Progress used to be a 3-tab surface (Lifts / Hip / Insights). The tab-swap
  // hid the strongest content (retest metrics + weekly narrative) behind an
  // extra tap, and the Lifts tab rendered a placeholder for aerobic/skill
  // users. Flattened to single scroll — Insights first (most important),
  // then Lifts if the program has strength content, then Hip if hip.
  const activeSlug = activeSlugForDefault;
  const showHipSection = activeSlug === "anterior-hip-rebuild";
  const hideLifts =
    activeSlug === "engine-builder" ||
    activeSlug === "rowing-2k-test-prep" ||
    activeSlug === "handstand-walk" ||
    activeSlug === "overhead-mobility";

  return (
    <div className="space-y-5 pt-4">
      <header className="flex items-baseline justify-between gap-3">
        <h1 className="text-3xl font-semibold tracking-tight">Progress</h1>
        <a
          href="/report"
          className="font-mono text-[11px] uppercase tracking-wider px-3 py-2 rounded border border-line text-muted hover:text-ink hover:bg-line-soft min-h-[36px] whitespace-nowrap"
        >
          Export report
        </a>
      </header>

      {/* Progress used to be a 3-tab surface — flattened to single scroll.
          Order: engine banners (surface adaptive proposals up-front) →
          Insights (strongest content) → Lifts if applicable → Hip if hip. */}

      {/* Engine banners — pause / cycle-end / accelerate. Always visible when
          they fire, regardless of program shape. */}
      {pauseSignal.recommendation === "calibration" ? (
        <EngineBanner
          tone="amber"
          title={`Welcome back — you've been away ${pauseSignal.gapDays} days`}
          body={pauseSignal.reasoning}
        />
      ) : null}
      {cycleEval && cycleEval.recommendation.length ? (
        <EngineBanner
          tone={cycleEval.worstState === "red" ? "red" : cycleEval.worstState === "amber" ? "amber" : "green"}
          title={`Cycle end — ${cycleEval.reasoning}`}
          body={
            <ul className="mt-2 space-y-1">
              {cycleEval.recommendation.map((r) => (
                <li key={r.lift} className="font-mono text-[12px]">
                  <span>{r.lift}: </span>
                  <span className={r.delta >= 0 ? "text-green" : "text-red"}>
                    {r.currentTM} → {r.newTM} kg ({r.delta >= 0 ? "+" : ""}
                    {r.delta})
                  </span>
                  <span className="text-muted italic ml-1">— {r.reason}</span>
                </li>
              ))}
            </ul>
          }
          action={{
            label: "Apply all TM changes",
            onClick: () => cycleEval.recommendation.forEach((r) => setTM(r.lift, r.newTM)),
          }}
        />
      ) : null}
      {waypointStatus.recommendation === "accelerate" ? (
        <EngineBanner
          tone="green"
          title={`You're ahead of the plan — ${waypointStatus.beatenEarly.length} milestone${waypointStatus.beatenEarly.length > 1 ? "s" : ""} beaten early`}
          body={waypointStatus.reasoning}
        />
      ) : null}

      {/* SECTION 1 — Insights (retest metrics + weekly narrative + charts). */}
      <div className="space-y-5">
          <p className="text-[13px] text-muted italic -mb-2">
            {activeSlug === "concurrent-strength-maintenance"
              ? "Concurrent training indicators — HR trend, weekly minutes, strength retention, retest deltas."
              : activeSlug === "engine-builder"
                ? "Aerobic base indicators — HR trend, weekly minutes, retest deltas."
                : activeSlug === "rowing-2k-test-prep"
                  ? "Race-prep indicators — 2K trend, pace targets, taper compliance."
                  : activeSlug === "handstand-walk" || activeSlug === "overhead-mobility"
                    ? "Skill progression indicators — retest metrics + tier gates."
                    : "Program-agnostic indicators — retest metrics, weekly narrative."}
          </p>
          <WeeklyNarrativeTile program={_program} />
          <ProposalStack program={_program} date={today()} />
          <RetestMetricsPanel program={_program} store={store} />
          {activeSlug === "anterior-hip-rebuild" ? (
            (() => {
              // Gate the ~112 KB Recharts import behind "we actually have data
              // to plot" — a fresh account shouldn't pay the bundle cost to
              // see an empty axis.
              const chartDays = Object.values(store.logs)
                .filter((d) => d.symptoms || Object.keys(d.exercises).length > 0)
                .sort((a, b) => a.date.localeCompare(b.date));
              if (chartDays.length < 3) {
                return (
                  <section className="space-y-3">
                    <div className="flex items-baseline justify-between gap-2">
                      <h2 className="text-[15px] font-semibold text-strong">Symptom vs load</h2>
                    </div>
                    <p className="text-[13px] text-muted italic px-1">
                      A trend line needs at least three logged days. Log a morning check
                      on Today and lift a session to start the picture.
                    </p>
                  </section>
                );
              }
              return (
                <section className="space-y-3">
                  <div className="flex items-baseline justify-between gap-2">
                    <h2 className="text-[15px] font-semibold text-strong">Symptom vs load</h2>
                    <button
                      type="button"
                      onClick={() => setInsightsInfoOpen(true)}
                      aria-label="About this chart"
                      className="text-muted hover:text-ink w-9 h-9 -my-1 flex items-center justify-center rounded"
                    >
                      <Info size={16} strokeWidth={1.75} />
                    </button>
                  </div>
                  <div className="rounded border border-line bg-surface p-3">
                    <SymptomLoadChart days={chartDays} />
                  </div>
                </section>
              );
            })()
          ) : null}
        </div>

      {/* SECTION 2 — Lifts (TM editor + milestones). Rendered only for programs
          with strength content; aerobic + skill programs skip this entirely. */}
      {!hideLifts ? (
        <div className="space-y-6 pt-6 border-t border-line-soft">
          <section className="space-y-3">
            <div className="flex items-baseline justify-between gap-2">
              <h2 className="text-[15px] font-semibold text-strong">Training maxes</h2>
            </div>
            <div className="rounded border border-line bg-surface divide-y divide-line-soft">
              {(() => {
                const lifts = primaryLiftsForProgram(_program, store.training_maxes);
                const visible = lifts.filter((id) => byId[id]);
                if (visible.length === 0) {
                  return (
                    <div className="px-3 py-4 space-y-2">
                      <p className="text-sm text-strong">
                        No training maxes yet.
                      </p>
                      <p className="text-[13px] text-muted italic">
                        Enter a training max to see progress against milestones — it appears here as soon as it&apos;s set.
                      </p>
                    </div>
                  );
                }
                return visible.map((id) => {
                  const ex = byId[id]!;
                  const val = store.training_maxes[id] ?? "";
                  return (
                    <div key={id} className="grid grid-cols-[1fr_90px_40px] items-center gap-3 px-3 py-3">
                      <p className="font-medium text-sm">{ex.name}</p>
                      <DebouncedTMInput id={id} initialValue={val} onCommit={setTM} />
                      <span className="font-mono text-[11px] text-muted">kg</span>
                    </div>
                  );
                });
              })()}
            </div>
            {tmMeta.progression_rule ? (
              <p className="text-[12px] text-muted italic">{tmMeta.progression_rule as string}</p>
            ) : null}
          </section>

          {targets?.milestones ? (
            <section className="space-y-3">
              <div className="flex items-baseline justify-between gap-3">
                <div className="flex items-baseline gap-2">
                  <h2 className="text-[15px] font-semibold text-strong">Milestones</h2>
                </div>
                {targets.target_date ? (
                  <span className="font-mono text-[11px] text-muted">→ {targets.target_date}</span>
                ) : null}
              </div>
              <MilestoneTable
                milestones={targets.milestones}
                tms={store.training_maxes}
                byId={byId}
                stretched={stretchTargets}
              />
            </section>
          ) : null}
        </div>
      ) : null}

      {/* SECTION 3 — Hip (anterior-hip only). */}
      {showHipSection ? (
        <div className="pt-6 border-t border-line-soft">
          <HipProgressTile />
        </div>
      ) : null}

      {insightsInfoOpen ? (
        <InfoSheet title="Symptom vs load" onClose={() => setInsightsInfoOpen(false)}>
          <p>
            The KPI no other strength app tracks: peak symptom score alongside top-set kg over
            time. What the next specialist visit should actually see.
          </p>
        </InfoSheet>
      ) : null}
    </div>
  );
}

function MilestoneTable({
  milestones,
  tms,
  byId,
  stretched,
}: {
  milestones: Milestone[];
  tms: Record<string, number>;
  byId: Record<string, Exercise>;
  stretched: Record<string, number>;
}) {
  const grouped = new Map<string, Milestone[]>();
  for (const m of milestones) {
    if (!grouped.has(m.lift)) grouped.set(m.lift, []);
    grouped.get(m.lift)!.push(m);
  }
  return (
    <div className="rounded border border-line bg-surface divide-y divide-line-soft">
      {Array.from(grouped.entries()).map(([lift, items]) => (
        <MilestoneLiftGroup
          key={lift}
          lift={lift}
          items={items}
          ex={byId[lift]}
          currentTM={tms[lift]}
          stretched={stretched}
        />
      ))}
    </div>
  );
}

function MilestoneLiftGroup({
  lift,
  items,
  ex,
  currentTM,
  stretched,
}: {
  lift: string;
  items: Milestone[];
  ex: Exercise | undefined;
  currentTM: number | undefined;
  stretched: Record<string, number>;
}) {
  const [open, setOpen] = useState(false);
  const now = new Date();

  // Sort items by date so "next" and "final" are well-defined.
  const sorted = [...items].sort((a, b) => a.date.localeCompare(b.date));

  const effectiveOf = (m: Milestone) => stretched[`${m.lift}:${m.date}`] ?? m.target_tm_kg;

  // Next uncleared milestone, if any.
  const next = sorted.find((m) => currentTM == null || currentTM < effectiveOf(m));
  const final = sorted[sorted.length - 1];
  const totalBeaten = sorted.filter(
    (m) => currentTM != null && currentTM >= effectiveOf(m),
  ).length;

  const nextEff = next ? effectiveOf(next) : null;
  const nextDelta = nextEff != null && currentTM != null ? currentTM - nextEff : null;
  const nextDate = next ? new Date(next.date + "T12:00:00") : null;
  const nextDays = nextDate ? Math.round((nextDate.getTime() - now.getTime()) / 864e5) : null;

  // Overall progress along the roadmap, treating each milestone as an equal
  // segment. Segments already beaten count as full; the current segment fills
  // proportionally between its previous target and its own. Range clamped [0,100].
  const overallPct = computeOverallPct(sorted, currentTM, effectiveOf);
  const finalEff = final ? effectiveOf(final) : null;
  const finalPct = finalEff != null && currentTM != null
    ? Math.max(0, Math.min(100, Math.round((currentTM / finalEff) * 100)))
    : null;

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full px-3 py-3 text-left flex items-start gap-3 min-h-[48px] hover:bg-line-soft/50"
      >
        <span aria-hidden className="font-mono text-[11px] text-muted w-4 flex-shrink-0 mt-0.5">
          {open ? "▾" : "▸"}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between gap-2">
            <p className="font-medium text-sm text-strong truncate">{ex?.name ?? lift}</p>
            <span className="font-mono text-[10px] text-muted flex-shrink-0">
              {totalBeaten}/{sorted.length}
            </span>
          </div>
          <p className="text-[11px] text-muted mt-0.5">
            {currentTM != null ? `TM ${currentTM} kg` : "TM —"}
            {next ? (
              <>
                {" · "}next {nextEff} kg
                {nextDays != null && nextDays >= 0 ? ` in ${nextDays}d` : nextDays != null ? ` (${Math.abs(nextDays)}d ago)` : ""}
                {nextDelta != null ? (
                  <span className={nextDelta >= 0 ? "text-green ml-1" : "text-red ml-1"}>
                    ({nextDelta >= 0 ? "+" : ""}
                    {nextDelta.toFixed(1)})
                  </span>
                ) : null}
              </>
            ) : (
              <> · all cleared 🎉</>
            )}
            {final && final !== next ? (
              <>
                {" · final "}
                {effectiveOf(final)} kg by {final.date}
              </>
            ) : null}
          </p>
          <MilestoneProgressBar
            sorted={sorted}
            currentTM={currentTM}
            effectiveOf={effectiveOf}
            overallPct={overallPct}
            finalPct={finalPct}
          />
        </div>
      </button>
      {open ? (
        <ul className="divide-y divide-line-soft bg-line-soft/20">
          {sorted.map((m) => {
            const effective = effectiveOf(m);
            const mDate = new Date(m.date + "T12:00:00");
            const days = Math.round((mDate.getTime() - now.getTime()) / 864e5);
            const beaten = currentTM != null && currentTM >= effective;
            const delta = currentTM != null ? currentTM - effective : null;
            return (
              <li
                key={m.date + m.lift}
                className="px-3 py-2.5 pl-10 flex flex-wrap items-baseline justify-between gap-3"
              >
                <div className="min-w-0">
                  <p className="text-[11px] text-muted">
                    {m.date} · {m.phase.replace(/^phase_/, "").replace(/_/g, " ")}
                  </p>
                  <p className="text-sm mt-0.5">
                    TM target {effective} kg{" "}
                    {beaten ? (
                      <span className="ml-1 px-1.5 py-0.5 rounded bg-green text-surface text-[10px] font-mono uppercase tracking-wider">
                        beaten
                      </span>
                    ) : days < 0 ? (
                      <span className="ml-1 px-1.5 py-0.5 rounded bg-red text-surface text-[10px] font-mono uppercase tracking-wider">
                        missed
                      </span>
                    ) : days <= 14 ? (
                      <span className="ml-1 px-1.5 py-0.5 rounded bg-amber text-surface text-[10px] font-mono uppercase tracking-wider">
                        soon
                      </span>
                    ) : null}
                    {m.waypoint ? (
                      <span className="ml-1 px-1.5 py-0.5 rounded bg-slate text-surface text-[10px] font-mono uppercase tracking-wider">
                        waypoint
                      </span>
                    ) : null}
                  </p>
                  {m.note ? (
                    <p className="text-[12px] text-muted mt-0.5">{m.note}</p>
                  ) : null}
                </div>
                <div className="text-right font-mono text-[11px] text-muted">
                  {delta != null ? (
                    <>
                      {delta >= 0 ? "+" : ""}
                      {delta.toFixed(1)} kg
                      <br />
                    </>
                  ) : (
                    <>
                      no TM
                      <br />
                    </>
                  )}
                  {days >= 0 ? `${days}d away` : `${Math.abs(days)}d ago`}
                </div>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

/**
 * Roadmap-percentage over a lift's milestone list. Each milestone is an equal
 * segment. Beaten segments count fully; the current segment fills between its
 * previous target and its own. If there's no current TM or no beatable
 * milestones, returns 0.
 */
function computeOverallPct(
  sorted: Milestone[],
  currentTM: number | undefined,
  effectiveOf: (m: Milestone) => number,
): number {
  if (sorted.length === 0 || currentTM == null) return 0;
  const beaten = sorted.filter((m) => currentTM >= effectiveOf(m)).length;
  if (beaten === sorted.length) return 100;
  const currentMilestone = sorted[beaten];
  const prevTarget = beaten === 0 ? 0 : effectiveOf(sorted[beaten - 1]);
  const curTarget = effectiveOf(currentMilestone);
  const range = curTarget - prevTarget;
  const partial = range > 0 ? Math.max(0, (currentTM - prevTarget) / range) : 0;
  const raw = ((beaten + Math.min(1, partial)) / sorted.length) * 100;
  return Math.max(0, Math.min(100, Math.round(raw)));
}

function MilestoneProgressBar({
  sorted,
  currentTM: _currentTM,
  effectiveOf,
  overallPct,
  finalPct,
}: {
  sorted: Milestone[];
  currentTM: number | undefined;
  effectiveOf: (m: Milestone) => number;
  overallPct: number;
  finalPct: number | null;
}) {
  if (sorted.length === 0) return null;
  // Ticks along the bar for each milestone at its equal-segment position.
  const segments = sorted.length;
  return (
    <div className="mt-2 space-y-1" aria-hidden>
      {/* Bar is taller and ticks are wider (0.5px is invisible on any device;
          2px reads as a real divider). If there are >8 milestones on the
          list the ticks bunch up on iPhone SE — thin them to every Nth so
          the roadmap stays readable. */}
      <div className="relative h-2 rounded-full bg-line-soft overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-bronze transition-[width]"
          style={{ width: `${overallPct}%` }}
        />
        {(() => {
          const inner = sorted.slice(0, -1);
          const stride = Math.max(1, Math.ceil(inner.length / 8));
          return inner.map((m, i) => {
            if (i % stride !== 0 && i !== inner.length - 1) return null;
            return (
              <span
                key={m.date + m.lift}
                className="absolute inset-y-0 w-0.5 bg-ground/70"
                style={{ left: `${((i + 1) / segments) * 100}%` }}
              />
            );
          });
        })()}
      </div>
      <p className="text-[10px] text-muted font-mono">
        Roadmap {overallPct}%
        {finalPct != null ? (
          <>
            {" · "}
            {finalPct}% of final {effectiveOf(sorted[sorted.length - 1])} kg
          </>
        ) : null}
      </p>
    </div>
  );
}

function DebouncedTMInput({
  id,
  initialValue,
  onCommit,
}: {
  id: string;
  initialValue: number | "";
  onCommit: (id: string, kg: number | null) => void;
}) {
  const [local, setLocal] = useState<string>(String(initialValue));
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync down if the store value changes externally (e.g. Apply All button)
  useEffect(() => {
    setLocal(String(initialValue));
  }, [initialValue]);

  return (
    <input
      type="number"
      inputMode="decimal"
      step={0.5}
      min={0}
      max={500}
      value={local}
      placeholder="—"
      aria-label={`Training max for ${id}`}
      onChange={(e) => {
        const raw = e.target.value;
        setLocal(raw);
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => {
          if (raw === "") return onCommit(id, null);
          const n = Number(raw);
          if (isFinite(n) && n > 0 && n <= 500) onCommit(id, n);
        }, 300);
      }}
      onBlur={() => {
        // Flush any pending write immediately on blur
        if (timer.current) {
          clearTimeout(timer.current);
          timer.current = null;
        }
        if (local === "") return onCommit(id, null);
        const n = Number(local);
        if (isFinite(n) && n > 0 && n <= 500) onCommit(id, n);
      }}
      className="w-full font-mono text-sm px-2 py-1.5 border border-line rounded bg-surface text-right focus:outline-none focus:ring-2 focus:ring-bronze focus:border-bronze min-h-[44px]"
    />
  );
}

function EngineBanner({
  tone,
  title,
  body,
  action,
}: {
  tone: "green" | "amber" | "red";
  title: string;
  body: React.ReactNode;
  action?: { label: string; onClick: () => void };
}) {
  const toneClass =
    tone === "green"
      ? "bg-green/10 border-l-green"
      : tone === "amber"
        ? "bg-amber/10 border-l-amber"
        : "bg-red/10 border-l-red";
  return (
    <div className={`border-l-4 rounded-r px-3 py-3 ${toneClass}`}>
      <p className="font-semibold text-sm">{title}</p>
      <div className="mt-1 text-[13px] text-muted">
        {typeof body === "string" ? <p>{body}</p> : body}
      </div>
      {action ? (
        <button
          type="button"
          onClick={action.onClick}
          className="mt-3 px-3 py-1.5 border border-slate text-slate rounded text-sm hover:bg-slate hover:text-surface transition-colors"
        >
          {action.label}
        </button>
      ) : null}
    </div>
  );
}

function ErrorBox({ msg }: { msg: string }) {
  return (
    <div className="mt-8 rounded border border-red bg-surface p-4">
      <h2 className="mb-2 text-lg font-semibold">Couldn&apos;t load data</h2>
      <p className="text-sm text-muted">{msg}</p>
    </div>
  );
}
