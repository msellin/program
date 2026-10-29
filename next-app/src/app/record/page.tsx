"use client";

/**
 * Record — what the user has done, at a glance (founder-feedback round 4, 2026-10-29; panel in
 * `dev/active/founder-feedback-2026-10-29/00-summary-r4.md`). This week first (sessions ring, on track / behind,
 * heaviest set, new bests), one 12-week grid, the program's focus metric once it has readings, the last five days
 * with the rest at /record/history/, and the hip program's own views collapsed at the bottom.
 */

import { useEffect, useState } from "react";
import { loadProgram, loadExercises, applyProgramExerciseOverrides } from "@/lib/data-loader";
import { useStore } from "@/lib/useStore";
import { WeeklyHeatmap, dayCellState, type WeeklyHeatmapCell, type WeeklyHeatmapCellState } from "@/components/ui/WeeklyHeatmap";
import { WeeklyNarrativeTile } from "@/components/WeeklyNarrativeTile";
import { HipProgressTile } from "@/components/HipProgressTile";
import { EmptyStateCard } from "@/components/EmptyStateCard";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { CutCLatestRetestTile } from "@/components/record/CutCLatestRetestTile";
import { CutCProgramCurveCard } from "@/components/record/CutCProgramCurveCard";
import { CutCLogList } from "@/components/record/CutCLogList";
import dynamic from "next/dynamic";
import type { Program, Exercise } from "@/lib/schemas";
import { cardClass } from "@/components/ui/Card";
import { cn, today as todayISO } from "@/lib/utils";
import { isDue } from "@/lib/engine/assessment-engine";
import { HIP_FLEXOR_PACK } from "@/lib/assessments-data";
import { resolveRetestReadings } from "@/lib/engine/retest-readings";

// Recharts is ~112KB gz. Already lazy for SymptomLoadChart; adding the
// Record surface's rolling-avg curve later reuses the same lazy chunk.
const SymptomLoadChart = dynamic(
  () => import("@/components/charts/SymptomLoadChart").then((m) => ({ default: m.SymptomLoadChart })),
  { ssr: false, loading: () => <div className="h-[220px] text-caption text-muted italic">Loading chart…</div> },
);

export default function RecordPage() {
  const [program, setProgram] = useState<Program | null>(null);
  const [_byId, setById] = useState<Record<string, Exercise>>({});
  const [error, setError] = useState<string | null>(null);
  const hydrated = useStore((s) => s.hydrated);
  const store = useStore((s) => s.store);
  const primarySlug = useStore((s) => s.store.user_profile?.active_program_id);

  useEffect(() => {
    if (!primarySlug) {
      void loadExercises().then((x) => setById(x.byId));
      return;
    }
    void Promise.all([loadProgram(primarySlug), loadExercises()])
      .then(([p, x]) => {
        setProgram(p);
        setById(applyProgramExerciseOverrides(x.byId, p));
      })
      .catch((e) => setError(e instanceof Error ? e.message : String(e)));
  }, [primarySlug]);

  if (error) return <ErrorBox msg={error} />;
  if (!hydrated) return <div className="mt-8 text-small text-muted">Loading…</div>;
  if (!primarySlug) {
    return (
      <EmptyStateCard
        title="Your record lands here after a few sessions."
        body="Your sessions, your week and your progress show up here once you pick a program."
        cta={{ href: "/programs/", label: "Browse programs" }}
      />
    );
  }
  if (!program) return <div className="mt-8 text-small text-muted">Loading…</div>;

  const cells: WeeklyHeatmapCell[] = buildReadinessHeatmap(store.logs, 12);

  const hasRehabTrack = primarySlug === "anterior-hip-rebuild"; // Personal-program firewall gate.
  const hipDue = hasRehabTrack && isDue(store, HIP_FLEXOR_PACK.id, todayISO()).due;
  // The focus-metric curve only once it has a line to draw: two readings of one metric.
  const readings = resolveRetestReadings(store, program);
  const hasTrend = readings.some((r) => readings.filter((x) => x.metric_id === r.metric_id).length >= 2);

  // Founder-feedback round 4 (2026-10-29, Record 3/10): this week leads; one 12-week grid (Readiness and Activity
  // drew the same picture); the focus metric only when it has data; the last few days, with everything else
  // behind "All sessions"; the hip program's own views last and collapsed. No section dividers, no empty cards.
  return (
    <div className="space-y-4" role="main">
      <h1 className="text-h1 tracking-[-0.03em] text-strong leading-none pb-2">Record</h1>

      <ErrorBoundary fallback={<p className="text-caption text-muted italic">This week is unavailable.</p>}>
        <WeeklyNarrativeTile program={program} />
      </ErrorBoundary>

      {cells.some((c) => c.sessionState !== "none") ? (
        <section className={cardClass()} aria-labelledby="record-12w">
          <h2 id="record-12w" className="text-body font-semibold text-strong mb-3">
            Last 12 weeks
          </h2>
          <ErrorBoundary fallback={<p className="text-caption text-muted italic">Heatmap unavailable.</p>}>
            <WeeklyHeatmap cells={cells} ariaLabel="Training days over the past 12 weeks." />
          </ErrorBoundary>
        </section>
      ) : null}

      <ErrorBoundary fallback={<p className="text-caption text-muted italic">Progress unavailable.</p>}>
        <CutCLatestRetestTile program={program} store={store} />
      </ErrorBoundary>
      {hasTrend ? (
        <ErrorBoundary fallback={<p className="text-caption text-muted italic">Trend curve unavailable.</p>}>
          <CutCProgramCurveCard program={program} store={store} zoomTier="all" />
        </ErrorBoundary>
      ) : null}

      <ErrorBoundary fallback={<p className="text-caption text-muted italic">Log unavailable.</p>}>
        <CutCLogList store={store} recent={5} moreHref="/record/history/" />
      </ErrorBoundary>

      {hasRehabTrack ? (
        <details className={cn(cardClass(), "group")}>
          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3">
            <span className="text-body font-semibold text-strong">Hip check and symptoms</span>
            <span className="flex items-center gap-2 text-small">
              {hipDue ? <span className="text-slate">Check due</span> : null}
              <span aria-hidden className="text-muted transition-transform group-open:rotate-90">›</span>
            </span>
          </summary>
          <div className="space-y-4 pt-3">
            <ErrorBoundary fallback={<p className="text-caption text-muted italic">Hip tile unavailable.</p>}>
              <HipProgressTile />
            </ErrorBoundary>
            <ErrorBoundary fallback={<p className="text-caption text-muted italic">Symptom chart unavailable.</p>}>
              <SymptomLoadChart days={Object.values(store.logs ?? {})} program={program} />
            </ErrorBoundary>
          </div>
        </details>
      ) : null}
    </div>
  );
}

function ErrorBox({ msg }: { msg: string }) {
  return (
    <div className="rounded-lg border border-red/40 bg-red/10 p-3 text-small text-red">
      Failed to load record: {msg}
    </div>
  );
}

/**
 * Build 12-week readiness heatmap cells from store.logs.derived_state.
 * Same shape the Cut C mockup uses — 12 columns × 7 rows.
 */
function buildReadinessHeatmap(
  logs:
    | Record<
        string,
        | {
            derived_state?: WeeklyHeatmapCellState | null;
            exercises?: Record<string, { done?: boolean }>;
            runs?: unknown[];
          }
        | undefined
      >
    | undefined,
  weeks: number,
): WeeklyHeatmapCell[] {
  const cells: WeeklyHeatmapCell[] = [];
  const now = new Date();
  const totalDays = weeks * 7;
  for (let i = totalDays - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const iso = d.toISOString().slice(0, 10);
    const log = logs?.[iso];
    cells.push({ date: iso, sessionState: dayCellState(log) });
  }
  return cells;
}
