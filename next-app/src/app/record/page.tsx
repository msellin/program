"use client";

/**
 * Cut C · Record surface — collapsed Progress + History.
 *
 * See `dev/active/redesign-progress/brief.md` (design brief) +
 * `dev/active/redesign-progress/DESIGN-cut-c.md` (design system) +
 * `dev/active/decisions-2026-08-21-locked.md` (locked decisions from
 * 4-agent panel majority) for the full context.
 *
 * IA: 5 tabs → 4 tabs. `/progress` deleted (redirected here). `/history`
 * also collapses in. Three sections stacked on ONE surface:
 *   - NOW  · today's context (12-week readiness, weekly narrative, latest retest)
 *   - TREND · rolling-average curve + retest event timeline
 *   - LOG  · activity history + log rows
 *
 * Same surface at day 30 and day 400 (Oura Trends model, matrix rec #5).
 * WindowTierControl auto-selects zoom based on data range.
 *
 * Sprint status: Phase 1 scaffold. CutC- primitives land in Phase 2-4.
 * See `dev/active/cut-c-code-sprint/tasks.md` for phase-by-phase progress.
 */

import { useEffect, useMemo, useState } from "react";
import { loadProgram, loadExercises, applyProgramExerciseOverrides } from "@/lib/data-loader";
import { useStore } from "@/lib/useStore";
import { WeeklyHeatmap, type WeeklyHeatmapCell, type WeeklyHeatmapCellState } from "@/components/ui/WeeklyHeatmap";
import { WeeklyNarrativeTile } from "@/components/WeeklyNarrativeTile";
import { HipProgressTile } from "@/components/HipProgressTile";
import { EmptyStateCard } from "@/components/EmptyStateCard";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { CutCWindowTierControl, type WindowTier } from "@/components/record/CutCWindowTierControl";
import { CutCLatestRetestTile } from "@/components/record/CutCLatestRetestTile";
import { CutCRetestTimeline } from "@/components/record/CutCRetestTimeline";
import { CutCActivityHeatmap } from "@/components/record/CutCActivityHeatmap";
import { CutCProgramCurveCard } from "@/components/record/CutCProgramCurveCard";
import { CutCLogList } from "@/components/record/CutCLogList";
import { CutCRecordOnboardingBeacon } from "@/components/record/CutCRecordOnboardingBeacon";
import { downloadRecordExport } from "@/lib/engine/record-export";
import { today } from "@/lib/utils";
import dynamic from "next/dynamic";
import type { Program, Exercise } from "@/lib/schemas";

// Recharts is ~112KB gz. Already lazy for SymptomLoadChart; adding the
// Record surface's rolling-avg curve later reuses the same lazy chunk.
const SymptomLoadChart = dynamic(
  () => import("@/components/charts/SymptomLoadChart").then((m) => ({ default: m.SymptomLoadChart })),
  { ssr: false, loading: () => <div className="h-[220px] text-[12px] text-muted italic">Loading chart…</div> },
);

/**
 * Section anchor — mono-caps eyebrow with hairline horizontal rule
 * per DESIGN-cut-c.md §Layout invariants. Screen-reader landmark.
 */
function SectionAnchor({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span
        aria-hidden
        className="h-px flex-none w-5"
        style={{ background: "linear-gradient(to left, var(--color-line-soft), transparent)" }}
      />
      <span className="font-mono text-[10px] font-medium uppercase tracking-widest text-muted">{label}</span>
      <span
        aria-hidden
        className="h-px flex-1"
        style={{ background: "linear-gradient(to right, var(--color-line-soft), transparent)" }}
      />
    </div>
  );
}


export default function RecordPage() {
  const [program, setProgram] = useState<Program | null>(null);
  const [_byId, setById] = useState<Record<string, Exercise>>({});
  const [error, setError] = useState<string | null>(null);
  // The WindowTierControl is the source of truth for the Trend section's
  // zoom. Curve + timeline read from this state to filter their data.
  const [zoomTier, setZoomTier] = useState<WindowTier>("30d");
  const hydrated = useStore((s) => s.hydrated);
  const store = useStore((s) => s.store);
  const primarySlug = useStore((s) => s.store.user_profile?.active_program_id);

  // Data-adaptive default for the zoom control — count days from the
  // earliest log entry to today.
  const dataDays = useMemo(() => {
    const logs = store.logs ?? {};
    const dates = Object.keys(logs).sort();
    if (dates.length === 0) return 0;
    const first = new Date(dates[0] + "T00:00:00");
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Math.max(0, Math.round((today.getTime() - first.getTime()) / (1000 * 60 * 60 * 24)));
  }, [store.logs]);

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
  if (!hydrated) return <div className="mt-8 text-sm text-muted">Loading…</div>;
  if (!primarySlug) {
    return (
      <EmptyStateCard
        title="Your record lands here after a few sessions."
        body="The rolling-average curve, retest events, and activity history show up here once you pick a program."
        cta={{ href: "/programs/", label: "Browse programs" }}
      />
    );
  }
  if (!program) return <div className="mt-8 text-sm text-muted">Loading…</div>;

  // 12-week readiness heatmap cells — same primitive Cut C mockup uses.
  // Sources from store.logs derived_state per day.
  const cells: WeeklyHeatmapCell[] = buildReadinessHeatmap(store.logs, 12);

  const hasRehabTrack = primarySlug === "anterior-hip-rebuild"; // Personal-program firewall gate; extended per program in Phase 3.

  return (
    <div className="space-y-8" role="main">
      {/* Header — H1 + Export button. Phase 3 wired: JSON export downloads
          a citation-attributed payload per R-CutC-2. */}
      <header className="flex items-baseline justify-between gap-3">
        <h1 className="text-[32px] font-bold tracking-[-0.03em] text-strong leading-none">Record</h1>
        <button
          type="button"
          onClick={() => downloadRecordExport(store)}
          className="border border-line-strong rounded-md px-3 py-2 min-h-[44px] font-mono text-[11px] uppercase tracking-widest text-ink motion-reduce:transition-none transition-colors hover:bg-line-soft focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-bronze focus-visible:outline-offset-2"
          aria-label="Export your record as JSON"
        >
          Export
        </button>
      </header>

      {/* C5 — one-time onboarding beacon dramatizing the cite-per-adjustment
          differentiator per matrix rec #4. Renders on first /record visit
          only; localStorage-persisted seen state. */}
      <CutCRecordOnboardingBeacon />

      {/* NOW section */}
      <section aria-labelledby="record-now">
        <SectionAnchor label="Now" />
        <span id="record-now" className="sr-only">Now</span>
        <div className="space-y-3">
          <div className="rounded border border-line-soft bg-surface p-3">
            <p className="font-mono text-[10px] font-medium uppercase tracking-widest text-muted mb-2">
              Readiness — 12 weeks
            </p>
            <ErrorBoundary fallback={<p className="text-[12px] text-muted italic">Heatmap unavailable.</p>}>
              <WeeklyHeatmap
                cells={cells}
                ariaLabel="Readiness heatmap over the past 12 weeks."
              />
            </ErrorBoundary>
            <div className="mt-2 flex items-center gap-3 text-[11px] text-muted">
              <span className="inline-flex items-center gap-1.5">
                <span aria-hidden className="inline-block w-2 h-2 rounded-sm bg-green" />
                green day
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span aria-hidden className="inline-block w-2 h-2 rounded-sm bg-amber" />
                amber (check first)
              </span>
            </div>
          </div>

          <ErrorBoundary fallback={<p className="text-[12px] text-muted italic">Weekly narrative unavailable.</p>}>
            <WeeklyNarrativeTile program={program} />
          </ErrorBoundary>

          <ErrorBoundary fallback={<p className="text-[12px] text-muted italic">Latest retest unavailable.</p>}>
            <CutCLatestRetestTile program={program} store={store} />
          </ErrorBoundary>
        </div>
      </section>

      {/* TREND section */}
      <section aria-labelledby="record-trend">
        <SectionAnchor label="Trend" />
        <span id="record-trend" className="sr-only">Trend</span>
        <div className="space-y-3">
          <ErrorBoundary fallback={<p className="text-[12px] text-muted italic">Zoom control unavailable.</p>}>
            <CutCWindowTierControl dataDays={dataDays} onChange={setZoomTier} />
          </ErrorBoundary>
          <ErrorBoundary fallback={<p className="text-[12px] text-muted italic">Trend curve unavailable.</p>}>
            <CutCProgramCurveCard program={program} store={store} zoomTier={zoomTier} />
          </ErrorBoundary>
          <ErrorBoundary fallback={<p className="text-[12px] text-muted italic">Retest timeline unavailable.</p>}>
            <CutCRetestTimeline program={program} store={store} />
          </ErrorBoundary>

          {/* Rehab firewall — never in the main Trend curve. Renders as its
              own subsection ONLY when the user has a rehab track. Matrix
              recommendation #11 (category vacancy) — no peer does this. */}
          {hasRehabTrack ? (
            <div className="space-y-3">
              <p className="font-mono text-[10px] font-medium uppercase tracking-widest text-muted pt-2">
                Rehab
              </p>
              <ErrorBoundary fallback={<p className="text-[12px] text-muted italic">Hip tile unavailable.</p>}>
                <HipProgressTile />
              </ErrorBoundary>
              <ErrorBoundary fallback={<p className="text-[12px] text-muted italic">Symptom chart unavailable.</p>}>
                <SymptomLoadChart days={Object.values(store.logs ?? {})} />
              </ErrorBoundary>
            </div>
          ) : null}
        </div>
      </section>

      {/* LOG section */}
      <section aria-labelledby="record-log">
        <SectionAnchor label="Log" />
        <span id="record-log" className="sr-only">Log</span>
        <div className="space-y-3">
          <ErrorBoundary fallback={<p className="text-[12px] text-muted italic">Activity heatmap unavailable.</p>}>
            <CutCActivityHeatmap store={store} />
          </ErrorBoundary>
          <ErrorBoundary fallback={<p className="text-[12px] text-muted italic">Log unavailable.</p>}>
            <CutCLogList store={store} />
          </ErrorBoundary>
        </div>
      </section>

      {/* Footer — beta feedback channel per FLAG-1 (product-owner panel
          made this an explicit prerequisite for M2 billing trigger: "you
          literally cannot detect the payment-intent trigger without an
          inbound channel"). Ships as mailto until real analytics + inbox
          infra decision. Founder-durable email per user_founder-email
          memory. */}
      <footer className="pt-6 border-t border-line-soft flex items-center justify-between gap-3 text-[12px] text-muted">
        {/* "Cut C" is the internal name of the redesign that produced this
            surface, not something a user should ever read. Caught by the
            2026-09-01 copy audit. */}
        <span>Terav — Record</span>
        <a
          href="mailto:sellinmargus@gmail.com?subject=Terav%20feedback"
          className="inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-widest text-slate hover:text-ink motion-reduce:transition-none transition-colors min-h-[44px] py-2"
          aria-label="Send feedback to Terav founder"
        >
          Feedback? →
        </a>
      </footer>
    </div>
  );
}

function ErrorBox({ msg }: { msg: string }) {
  return (
    <div className="rounded border border-red/40 bg-red/10 p-3 text-[14px] text-red">
      Failed to load record: {msg}
    </div>
  );
}

/**
 * Build 12-week readiness heatmap cells from store.logs.derived_state.
 * Same shape the Cut C mockup uses — 12 columns × 7 rows.
 */
function buildReadinessHeatmap(
  logs: Record<string, { derived_state?: WeeklyHeatmapCellState | null } | undefined> | undefined,
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
    const state = (log?.derived_state ?? null) as WeeklyHeatmapCellState | null;
    cells.push({
      date: iso,
      sessionState: state ?? "none",
    });
  }
  return cells;
}
