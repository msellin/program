"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Printer, ChevronLeft } from "lucide-react";
import dynamic from "next/dynamic";
import { useStore } from "@/lib/useStore";
import { loadProgram, loadExercises, loadClinicalContext, type ClinicalContext } from "@/lib/data-loader";
import { computeReport, type ReportData } from "@/lib/engine/report";
import { RetestMetricsPanel } from "@/components/progress/RetestMetricsPanel";
import { isPastProgramEnd } from "@/lib/engine/schedule";
import { evaluateRetestMetrics, deltaFromBaseline, formatMetric } from "@/lib/engine/retest-evaluator";
import { today as todayISO, iso } from "@/lib/utils";
import type { Program, Exercise } from "@/lib/schemas";
import { HIP_FLEXOR_PACK } from "@/lib/assessments-data";
import { EmptyStateCard } from "@/components/EmptyStateCard";

const SymptomLoadChart = dynamic(
  () => import("@/components/charts/SymptomLoadChart").then((m) => ({ default: m.SymptomLoadChart })),
  { ssr: false, loading: () => <div className="h-[220px] text-[12px] text-muted italic">Loading chart…</div> },
);

type RangePreset = "4w" | "12w" | "26w" | "all";

/**
 * Specialist-ready training report.
 *
 * Framing: this is a *log*, not a diagnosis. Every field is either directly
 * observed (a score the user typed, a set they logged) or a deterministic
 * aggregation of same. No inference, no LLM. Designed to hand to an
 * orthopaedist / physio and have them read the shape in 30 seconds.
 *
 * Print CSS at the bottom of the file hides the interactive chrome so
 * browser Print → Save as PDF gives a clean output.
 */
export default function ReportPage() {
  const [program, setProgram] = useState<Program | null>(null);
  const [byId, setById] = useState<Record<string, Exercise>>({});
  const [clinical, setClinical] = useState<ClinicalContext | null>(null);
  // Default to "all" for accounts with little data so a fresh account doesn't
  // open on "Last 12w" and see empty sections everywhere. Once the user has
  // 4+ weeks of logs the 12w default becomes useful; before that, "all" is
  // more welcoming.
  const [preset, setPreset] = useState<RangePreset>("12w");
  const [presetChosenByUser, setPresetChosenByUser] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const store = useStore((s) => s.store);
  const hydrated = useStore((s) => s.hydrated);
  const primarySlug = useStore((s) => s.store.user_profile?.active_program_id);

  // Delta audit 2026-08-19 P1-3 regression — the prior default-preset
  // heuristic ran on `useStore.getState().store` at component mount, which
  // fires BEFORE `hydrated` is true, so the store's `logs` and
  // `active_program_started_at` were empty and every user landed on "all"
  // (3Y range). Now recompute the default when hydration completes, but
  // only if the user hasn't manually overridden it yet.
  useEffect(() => {
    if (!hydrated || presetChosenByUser) return;
    const logCount = Object.keys(store.logs ?? {}).length;
    const programStart = store.user_profile?.active_program_started_at;
    const elapsedDays = programStart
      ? Math.max(0, Math.floor((Date.now() - new Date(programStart).getTime()) / 864e5))
      : null;
    const scoped: RangePreset | null =
      elapsedDays == null
        ? null
        : elapsedDays <= 28
          ? "4w"
          : elapsedDays <= 84
            ? "12w"
            : elapsedDays <= 182
              ? "26w"
              : "all";
    setPreset(scoped ?? (logCount >= 28 ? "12w" : "all"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  useEffect(() => {
    if (!primarySlug) return;
    void Promise.all([loadProgram(primarySlug), loadExercises(), loadClinicalContext()])
      .then(([p, x, c]) => {
        setProgram(p);
        setById(x.byId);
        setClinical(c);
      })
      .catch((e) => setError(e instanceof Error ? e.message : String(e)));
  }, [primarySlug]);

  const range = useMemo(() => {
    const end = todayISO();
    const endD = new Date(end + "T00:00:00");
    const daysBack = preset === "4w" ? 28 : preset === "12w" ? 84 : preset === "26w" ? 182 : 365 * 3;
    const startD = new Date(endD);
    startD.setDate(endD.getDate() - daysBack + 1);
    return { start: iso(startD), end };
  }, [preset]);

  const report: ReportData | null = useMemo(() => {
    if (!program) return null;
    return computeReport(store, program, range);
  }, [store, program, range]);

  if (error) {
    return (
      <div className="mt-8 rounded border border-red bg-surface p-4">
        <h2 className="mb-2 text-lg font-semibold">Couldn&apos;t load report data</h2>
        <p className="text-sm text-muted">{error}</p>
      </div>
    );
  }
  if (!hydrated) return <div className="mt-8 text-sm text-muted">Loading…</div>;
  if (!primarySlug) {
    return (
      <EmptyStateCard
        title="Your training summary generates here."
        body="A shareable training summary — for your coach or clinician — generates here once you pick a program and log a few sessions."
        cta={{ href: "/programs/", label: "Browse programs" }}
      />
    );
  }
  if (!program || !report) return <div className="mt-8 text-sm text-muted">Loading…</div>;

  // Anterior-hip-specific sections (hip assessments, groin/buttock/low-back
  // symptom series, provocative positions, rehab-adherence bar) only make
  // sense for the hip program. Other programs get overview + load progression
  // and a program-agnostic note that per-program metrics are coming.
  const isHipProgram = program.slug === "anterior-hip-rebuild";

  const startPretty = new Date(range.start + "T12:00:00").toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const endPretty = new Date(range.end + "T12:00:00").toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const generatedPretty = new Date().toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const daysWithLogs =
    report.symptomSeries.groin_left.length +
    report.symptomSeries.buttock_left.length +
    report.symptomSeries.low_back.length;

  const chartDays = Object.values(store.logs)
    .filter((d) => d.date >= range.start && d.date <= range.end)
    .sort((a, b) => a.date.localeCompare(b.date));

  // Delta-3 multi-track: acknowledge extras that this report doesn't
  // (yet) render. Compact strip only shows when the user has secondary
  // tracks. Full multi-track rewrite of Report is bigger scope.
  const activeProgramIds = store.user_profile?.active_program_ids ?? [];
  const extraSlugs = activeProgramIds.filter((s) => s !== primarySlug);

  return (
    // P0-6 (Batch 26) — added `min-w-0 overflow-x-hidden` defensively.
    // Mobile-UX audit flagged the report as force-zooming on 393 px;
    // without a concrete overflow source in the DOM inventory, the
    // pragmatic fix is to cap the root so nothing inside can push the
    // page beyond the viewport. Charts (Recharts ResponsiveContainer)
    // and mobile-cards (sm:hidden) already respect the container.
    <div className="space-y-6 pt-4 report-root min-w-0 overflow-x-hidden">
      <header className="no-print space-y-3">
        <div className="flex items-center gap-2">
          <Link
            href="/progress/"
            className="inline-flex items-center gap-1 text-[14px] text-slate hover:text-ink"
          >
            <ChevronLeft size={14} />
            Progress
          </Link>
        </div>
        <div className="flex items-baseline justify-between gap-3 flex-wrap">
          <h1 className="text-[32px] font-semibold tracking-tight text-strong leading-none">Training summary</h1>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider px-3 py-2 rounded bg-bronze text-ground"
          >
            <Printer size={14} />
            Print / save PDF
          </button>
        </div>
        <div className="flex items-center gap-1 flex-wrap">
          {(["4w", "12w", "26w", "all"] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => {
                setPreset(p);
                setPresetChosenByUser(true);
              }}
              aria-pressed={preset === p}
              className={
                "min-h-[36px] px-3 py-1.5 rounded font-mono text-[11px] uppercase tracking-wider " +
                (preset === p
                  ? "bg-slate text-surface"
                  : "bg-line-soft text-muted hover:text-ink")
              }
            >
              {p === "all" ? "3y" : `Last ${p}`}
            </button>
          ))}
        </div>
      </header>

      <section className="report-header space-y-1">
        <h1 className="hidden print:block text-xl font-semibold text-strong">Training summary</h1>
        <p className="text-[14px] text-muted">
          <strong className="text-ink">Program:</strong>{" "}
          {program.slug
            ?.split("-")
            .map((w) => (w.length ? w[0].toUpperCase() + w.slice(1) : w))
            .join(" ") ?? program.slug}
        </p>
        <p className="text-[14px] text-muted">
          <strong className="text-ink">Range:</strong> {startPretty} → {endPretty}
        </p>
        <p className="text-[14px] text-muted">
          <strong className="text-ink">Generated:</strong> {generatedPretty}
        </p>
        {extraSlugs.length > 0 ? (
          <p className="text-[12px] text-muted italic pt-1">
            Also active for this user (not in this report yet):{" "}
            {extraSlugs
              .map((s) =>
                s
                  .split("-")
                  .map((w) => (w.length ? w[0].toUpperCase() + w.slice(1) : w))
                  .join(" "),
              )
              .join(", ")}
            .
          </p>
        ) : null}
        <p className="text-[14px] text-muted italic pt-1">
          {isHipProgram
            ? "This is a self-tracked training log, not a diagnosis. Symptom scores are the user's own 0–10 ratings from a daily morning check. Load values are logged workout data."
            : "This is a self-tracked training log, not medical advice. Values below are the user's own logged sessions, morning checks, and derived retest deltas."}
        </p>
      </section>

      {/* Arc summary — renders only when the user has graduated this
          program. Delta-3 graduation audit 2026-08-19 flagged Report
          rendered identically to a mid-arc report; there's now a
          verdict chip + target pass-fail. */}
      {isPastProgramEnd(program, todayISO(), store.user_profile) ? (
        <ArcSummarySection program={program} store={store} />
      ) : null}

      {/* Overview */}
      <ReportSection title="Overview">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-[14px]">
          <Stat label="Days in range" value={String(report.overview.daysInRange)} />
          <Stat label="Days logged" value={String(report.overview.daysWithAnyLog)} />
          <Stat
            label="Strength sessions"
            value={String(report.overview.strengthSessionsCompleted)}
          />
          <Stat
            label="Endurance sessions"
            value={
              report.overview.enduranceSessionsLogged > 0
                ? `${report.overview.enduranceSessionsLogged} · ${report.overview.endurance_totalKm} km`
                : "0"
            }
          />
          <Stat label="Rehab days" value={String(report.overview.rehabDays)} />
          <Stat
            label="Morning check"
            value={[
              report.overview.stateDistribution.green
                ? `${report.overview.stateDistribution.green} green`
                : null,
              report.overview.stateDistribution.amber
                ? `${report.overview.stateDistribution.amber} amber`
                : null,
              report.overview.stateDistribution.red
                ? `${report.overview.stateDistribution.red} red`
                : null,
              // Skip the "unchecked" line on the shareable report — a fresh
              // account with a 6-week program showed "1047 unchecked" against
              // a default 3-year range, which read as a printf bug on
              // shareable surfaces. Comprehensive audit 2026-08-18 P1-9.
            ]
              .filter(Boolean)
              .join(" · ") || "—"}
          />
        </div>
      </ReportSection>

      {/* Symptom trend chart — hip program (the chart plots groin/buttock/low-back
          series against strength load). Other programs will get a program-aware
          chart in a follow-up. */}
      {isHipProgram ? (
      <ReportSection
        title="Symptom vs load"
        subtitle="Peak morning symptom score alongside heaviest daily top-set weight."
      >
        {daysWithLogs > 0 ? (
          <div className="rounded border border-line bg-surface p-3">
            <SymptomLoadChart days={chartDays} />
          </div>
        ) : (
          <p className="text-[14px] text-muted italic">
            No symptom or load data in this range.
          </p>
        )}
      </ReportSection>
      ) : (
        <>
          <ReportSection title="How you&apos;re trending against the program">
            <RetestMetricsPanel program={program} store={store} />
          </ReportSection>

          {/* Weekly aerobic volume — hidden entirely when there's nothing to
              show. Empty state is already carried by RetestMetricsPanel above. */}
          {Object.values(store.logs)
            .filter((d) => d.date >= range.start && d.date <= range.end)
            .some((d) => (d.runs?.length ?? 0) > 0) ? (
          <ReportSection
            title="Weekly aerobic volume"
            subtitle="Total logged duration per week, hard-session count, and average HR when captured."
          >
            {(() => {
              const daysIn = Object.values(store.logs)
                .filter((d) => d.date >= range.start && d.date <= range.end)
                .filter((d) => (d.runs?.length ?? 0) > 0);
              if (!daysIn.length) {
                return null;
              }
              type WeekAgg = {
                weekStart: string;
                sessions: number;
                totalMinutes: number;
                hardSessions: number;
                hrSum: number;
                hrCount: number;
              };
              const weeks = new Map<string, WeekAgg>();
              const weekStartOf = (iso: string): string => {
                const d = new Date(iso + "T00:00:00");
                const day = d.getDay() || 7; // Mon=1..Sun=7
                d.setDate(d.getDate() - (day - 1));
                return d.toISOString().slice(0, 10);
              };
              for (const day of daysIn) {
                const wk = weekStartOf(day.date);
                if (!weeks.has(wk))
                  weeks.set(wk, {
                    weekStart: wk,
                    sessions: 0,
                    totalMinutes: 0,
                    hardSessions: 0,
                    hrSum: 0,
                    hrCount: 0,
                  });
                const agg = weeks.get(wk)!;
                for (const r of day.runs ?? []) {
                  agg.sessions += 1;
                  const min =
                    (r.minutes ?? (r.total_seconds ? r.total_seconds / 60 : 0));
                  agg.totalMinutes += min;
                  if (r.intensity === "hard" || r.session_type === "threshold" || r.session_type === "race_pace" || r.session_type === "vo2max_intervals")
                    agg.hardSessions += 1;
                  if (r.avg_hr) {
                    agg.hrSum += r.avg_hr;
                    agg.hrCount += 1;
                  }
                }
              }
              const rows = Array.from(weeks.values()).sort((a, b) =>
                a.weekStart.localeCompare(b.weekStart),
              );
              return (
                <ul className="text-[14px] space-y-1.5">
                  {rows.map((w) => (
                    <li
                      key={w.weekStart}
                      className="flex items-baseline gap-3 font-mono"
                    >
                      <span className="text-muted text-[11px] w-28 flex-shrink-0">
                        wk of {w.weekStart}
                      </span>
                      <span className="text-ink flex-1">
                        {Math.floor(w.totalMinutes / 60)}h{" "}
                        {Math.round(w.totalMinutes % 60)}m · {w.sessions}{" "}
                        session{w.sessions !== 1 ? "s" : ""}
                        {w.hardSessions > 0 ? ` · ${w.hardSessions} hard` : ""}
                        {w.hrCount > 0
                          ? ` · avg HR ${Math.round(w.hrSum / w.hrCount)}`
                          : ""}
                      </span>
                    </li>
                  ))}
                </ul>
              );
            })()}
          </ReportSection>
          ) : null}

        {/* Aerobic sessions list — same visibility gate: don't render at all
            when there's no data. RetestMetricsPanel above already tells the
            "no data yet" story once. */}
        {Object.values(store.logs)
          .filter((d) => d.date >= range.start && d.date <= range.end)
          .some((d) => (d.runs?.length ?? 0) > 0) ? (
        <ReportSection
          title="Aerobic sessions in range"
          subtitle="Every logged run / row / bike / erg session, chronological. Session type + total time + 500m pace shown where you entered them."
        >
          {(() => {
            const aerobicDays = Object.values(store.logs)
              .filter((d) => d.date >= range.start && d.date <= range.end)
              .filter((d) => (d.runs?.length ?? 0) > 0)
              .sort((a, b) => a.date.localeCompare(b.date));
            if (!aerobicDays.length) return null;
            const fmtSec = (s: number) =>
              `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, "0")}`;
            // Flatten and group by session_type. Over 25 sessions the flat
            // chronological list becomes a scroll wall; the grouped view lets
            // the rowing user compare their threshold runs against each other.
            type Row = { date: string; run: NonNullable<NonNullable<typeof aerobicDays>[number]["runs"]>[number] };
            const all: Row[] = [];
            for (const d of aerobicDays)
              for (const r of d.runs ?? []) all.push({ date: d.date, run: r });
            const byType = new Map<string, Row[]>();
            for (const row of all) {
              const key = row.run.session_type ?? row.run.activity_type ?? "session";
              if (!byType.has(key)) byType.set(key, []);
              byType.get(key)!.push(row);
            }
            const groupOrder = [
              "2k_test",
              "race_pace",
              "threshold",
              "vo2max_intervals",
              "z2",
              "z1",
              "technique",
              "steady_state",
              "recovery",
            ];
            const sortedKeys = Array.from(byType.keys()).sort((a, b) => {
              const ai = groupOrder.indexOf(a);
              const bi = groupOrder.indexOf(b);
              if (ai === -1 && bi === -1) return a.localeCompare(b);
              if (ai === -1) return 1;
              if (bi === -1) return -1;
              return ai - bi;
            });
            return (
              <div className="space-y-4">
                {sortedKeys.map((key) => {
                  const rows = byType.get(key)!;
                  return (
                    <div key={key}>
                      <p className="mono-caps mb-1 text-bronze">
                        {key.replace(/_/g, " ")} · {rows.length}
                      </p>
                      <ul className="space-y-0.5 text-[14px]">
                        {rows.map(({ date, run: r }, i) => (
                          <li
                            key={`${date}:${i}`}
                            className="flex items-baseline gap-2 flex-wrap font-mono"
                          >
                            <span className="text-muted text-[11px] w-20 flex-shrink-0">
                              {date.slice(5)}
                            </span>
                            <span className="text-ink">
                              {[
                                r.total_seconds != null ? fmtSec(r.total_seconds) : null,
                                r.avg_pace_500m_seconds != null
                                  ? `${fmtSec(r.avg_pace_500m_seconds)}/500m`
                                  : null,
                                r.avg_watts != null ? `${r.avg_watts} W` : null,
                                r.distance_km != null ? `${r.distance_km} km` : null,
                                r.minutes != null && r.total_seconds == null
                                  ? `${Math.round(r.minutes)} min`
                                  : null,
                                r.avg_hr != null ? `HR ${r.avg_hr}` : null,
                              ]
                                .filter(Boolean)
                                .join(" · ")}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </ReportSection>
        ) : null}
        </>
      )}

      {/* Monthly hip check — hip program only */}
      {isHipProgram ? (
      <ReportSection
        title={HIP_FLEXOR_PACK.name}
        subtitle="Six-item self-scored check, cadence every 28 days. Lower = fewer symptoms. Individual scores below the overall."
      >
        {report.hipAssessments.length === 0 ? (
          <p className="text-[14px] text-muted italic">No checks logged in this range.</p>
        ) : (
          <>
            {/* Mobile: card per check-in. The 7-column table below only fits on
                sm+ viewports; on phones it either overflows or scrolls awkwardly
                against page chrome. Cards read top-to-bottom. */}
            <ul className="sm:hidden space-y-2">
              {report.hipAssessments.map((a) => (
                <li
                  key={a.date}
                  className="rounded border border-line-soft bg-surface p-3"
                >
                  <div className="flex items-baseline justify-between">
                    <span className="font-mono text-[12px] text-muted">{a.date}</span>
                    <span className="font-mono text-[15px] font-semibold text-strong">
                      {a.overall.toFixed(1)}
                    </span>
                  </div>
                  {/* Mobile card layout — full test names on their own row so
                      "Hanging leg raise — click during the lowering phase" doesn't
                      truncate to "Hanging leg raise". The signal is IN the details. */}
                  <dl className="mt-2 space-y-1.5 text-[12px]">
                    {HIP_FLEXOR_PACK.questions.map((q) => {
                      const label = q.label.split("—")[0].split("(")[0].trim();
                      const detail = q.label.includes("—")
                        ? q.label.split("—").slice(1).join("—").trim()
                        : q.label.includes("(")
                          ? q.label.split("(").slice(1).join("(").replace(/\)$/, "").trim()
                          : null;
                      if (q.paired === "left_right") {
                        const l = a.byKey[`${q.id}:left`];
                        const r = a.byKey[`${q.id}:right`];
                        return (
                          <div key={q.id} className="flex items-baseline justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <dt className="text-ink">{label}</dt>
                              {detail ? (
                                <dt className="text-[10px] text-muted italic leading-tight mt-0.5">
                                  {detail}
                                </dt>
                              ) : null}
                            </div>
                            <dd className="font-mono text-ink flex-shrink-0">
                              {l != null ? `L${l}` : "—"} / {r != null ? `R${r}` : "—"}
                            </dd>
                          </div>
                        );
                      }
                      const v = a.byKey[q.id];
                      return (
                        <div key={q.id} className="flex items-baseline justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <dt className="text-ink">{label}</dt>
                            {detail ? (
                              <dt className="text-[10px] text-muted italic leading-tight mt-0.5">
                                {detail}
                              </dt>
                            ) : null}
                          </div>
                          <dd className="font-mono text-ink flex-shrink-0">
                            {v != null ? v : "—"}
                          </dd>
                        </div>
                      );
                    })}
                  </dl>
                </li>
              ))}
            </ul>
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-[14px] border-collapse">
                <thead>
                  <tr className="text-left text-[11px] text-muted border-b border-line-soft">
                    <th className="py-1.5 pr-2">Date</th>
                    <th className="py-1.5 pr-2">Overall</th>
                    {HIP_FLEXOR_PACK.questions.map((q) => (
                      <th key={q.id} className="py-1.5 pr-2 font-normal">
                        {q.label.split("—")[0].split("(")[0].trim().slice(0, 24)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {report.hipAssessments.map((a) => (
                    <tr key={a.date} className="border-b border-line-soft/50">
                      <td className="py-1.5 pr-2 font-mono">{a.date}</td>
                      <td className="py-1.5 pr-2 font-mono font-semibold">
                        {a.overall.toFixed(1)}
                      </td>
                      {HIP_FLEXOR_PACK.questions.map((q) => {
                        if (q.paired === "left_right") {
                          const l = a.byKey[`${q.id}:left`];
                          const r = a.byKey[`${q.id}:right`];
                          return (
                            <td key={q.id} className="py-1.5 pr-2 font-mono text-[12px]">
                              {l != null ? `L${l}` : "—"}
                              {" / "}
                              {r != null ? `R${r}` : "—"}
                            </td>
                          );
                        }
                        const v = a.byKey[q.id];
                        return (
                          <td key={q.id} className="py-1.5 pr-2 font-mono text-[12px]">
                            {v != null ? v : "—"}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </ReportSection>
      ) : null}

      {/* Provocateur incidents — hip program only (keyword set + threshold
          semantics are tuned for hip-flare detection) */}
      {isHipProgram ? (
      <ReportSection
        title="Provocateur incidents"
        subtitle="Days where morning-check symptoms crossed a threshold or a note contained pain/click/flare keywords."
      >
        {report.provocateurIncidents.length === 0 ? (
          <p className="text-[14px] text-muted italic">
            Nothing crossed threshold in this range.
          </p>
        ) : (
          <ul className="text-[14px] space-y-1.5">
            {report.provocateurIncidents.map((i, idx) => (
              <li key={idx} className="flex items-baseline gap-2 flex-wrap">
                <span className="font-mono text-[11px] text-muted w-24 flex-shrink-0">
                  {i.date}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-line-soft text-muted flex-shrink-0">
                  {i.context === "check" ? "Morning check" : "Note"}
                </span>
                <span className="flex-1 min-w-0">
                  {i.exercise ? (
                    <span className="font-mono text-slate mr-2">
                      {i.exercise}
                      {i.weight_kg != null && i.reps != null
                        ? ` ${i.weight_kg} × ${i.reps}`
                        : ""}
                      :
                    </span>
                  ) : null}
                  {i.text}
                </span>
              </li>
            ))}
          </ul>
        )}
      </ReportSection>
      ) : null}

      {/* Load progression — universal (works for any strength program) */}
      <ReportSection
        title="Load progression"
        subtitle="Heaviest logged top-set per lift, chronological."
      >
        {report.loadProgression.length === 0 ? (
          <p className="text-[14px] text-muted italic">Nothing logged in this range.</p>
        ) : (
          <div className="space-y-3">
            {report.loadProgression.map((l) => (
              <div key={l.exerciseId}>
                <p className="font-semibold text-sm text-strong">
                  {byId[l.exerciseId]?.name ?? l.exerciseId}
                  <span className="ml-2 text-[11px] font-normal text-muted font-mono">
                    TM {store.training_maxes[l.exerciseId] ?? "—"} kg
                  </span>
                </p>
                <ul className="mt-1 grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-0.5 text-[14px] font-mono">
                  {l.entries.map((e) => (
                    <li key={e.date} className="text-muted">
                      <span className="text-[11px] mr-1">{e.date}</span>
                      <span className="text-ink">
                        {e.top_kg} × {e.top_reps}
                      </span>
                      {e.rpe != null ? ` @ ${e.rpe}` : ""}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </ReportSection>

      {/* Weekly rehab adherence — hip program only (reads the specific
          hip-flexor home rehab block) */}
      {isHipProgram ? (
      <ReportSection
        title="Rehab adherence"
        subtitle="Days per week the home hip-flexor rehab block was touched."
      >
        {report.weeklyRehabAdherence.length === 0 ? (
          <p className="text-[14px] text-muted italic">No range data.</p>
        ) : (
          <ul className="text-[14px] space-y-2 sm:space-y-1">
            {report.weeklyRehabAdherence.map((w) => (
              <li
                key={w.weekStart}
                className="sm:flex sm:items-baseline sm:gap-3"
              >
                <div className="flex items-baseline justify-between sm:contents">
                  <span className="font-mono text-[11px] text-muted sm:w-24 sm:flex-shrink-0">
                    Week of {w.weekStart}
                  </span>
                  <span className="font-mono text-[11px] text-muted sm:order-3">
                    {w.done} / 7
                  </span>
                </div>
                <div className="mt-1 h-2 rounded bg-line-soft overflow-hidden sm:mt-0 sm:flex-1 sm:max-w-[240px]">
                  <div
                    className="h-full bg-bronze"
                    style={{ width: `${Math.round((w.done / 7) * 100)}%` }}
                    aria-hidden
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </ReportSection>
      ) : null}

      {/* User-maintained contraindications */}
      {(store.contraindications?.length ?? 0) > 0 ? (
        <ReportSection
          title="Personal contraindications"
          subtitle="Movements / positions the user has flagged as painful or off-limits."
        >
          <ul className="list-disc pl-5 text-[14px] space-y-1">
            {store.contraindications!.map((c) => (
              <li key={c.id}>
                <span className="font-semibold">{c.label}</span>
                {c.reason ? <span className="text-muted"> — {c.reason}</span> : null}
              </li>
            ))}
          </ul>
        </ReportSection>
      ) : null}

      {/* Clinical context — hip program only. `clinical-context.json` is the
          founder's personal file (imaging findings, provocative-position
          screening, red-flag rules for HIS hip). Rendering it under a
          rowing / engine / handstand user's Report was a cross-program leak. */}
      {clinical && isHipProgram ? (
        <ReportSection
          title="Clinical constraints on file"
          subtitle="Constraints the training programme respected across the range above. Sourced from the user's clinical records; not medical advice from this app."
        >
          {clinical.provocative_positions?.length ? (
            <div className="mb-3">
              <p className="font-semibold text-[14px] text-strong mb-1">
                Provocative positions avoided
              </p>
              <ul className="list-disc pl-5 text-[14px] space-y-1">
                {clinical.provocative_positions.map((p) => (
                  <li key={p.id}>
                    <span className="font-semibold">{p.label}</span>
                    {p.reason ? <span className="text-muted"> — {p.reason}</span> : null}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {clinical.red_flags?.length ? (
            <div className="mb-3">
              <p className="font-semibold text-[14px] text-strong mb-1">Red-flag rules</p>
              <ul className="list-disc pl-5 text-[14px] space-y-1">
                {clinical.red_flags.map((r) => (
                  <li key={r.id}>
                    <span className="font-semibold">{r.label}</span>
                    {r.action ? (
                      <span className="text-muted">
                        {" "}
                        — action: {r.action.replace(/_/g, " ")}
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {clinical.staleness_warning ? (
            <p className="text-[12px] text-muted italic mt-2">{clinical.staleness_warning}</p>
          ) : null}
        </ReportSection>
      ) : null}

      <footer className="text-[11px] text-muted italic pt-4 border-t border-line-soft">
        Generated by a self-tracking app. Not medical advice. Clinical decisions remain with the
        user&apos;s orthopaedist and physiatrist.
      </footer>

      {/* Print-only stylesheet */}
      <style jsx global>{`
        @media print {
          .no-print,
          nav,
          header nav,
          .fixed,
          [role="dialog"] {
            display: none !important;
          }
          body,
          html {
            background: #fff !important;
            color: #111 !important;
          }
          .report-root {
            padding-top: 0 !important;
          }
          .report-root section {
            page-break-inside: avoid;
          }
          .rounded,
          .bg-surface,
          .bg-line-soft {
            background: transparent !important;
          }
          .border,
          .border-line,
          .border-line-soft {
            border-color: #ccc !important;
          }
          .text-muted {
            color: #444 !important;
          }
          .text-strong,
          .text-ink {
            color: #111 !important;
          }
        }
      `}</style>
    </div>
  );
}

function ReportSection({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-2">
      <div>
        <h2 className="text-[15px] font-semibold text-strong">{title}</h2>
        {subtitle ? <p className="text-[14px] text-muted mt-0.5">{subtitle}</p> : null}
      </div>
      {children}
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-line-soft bg-surface p-2.5">
      <p className="text-[11px] text-muted uppercase tracking-wider">{label}</p>
      <p className="text-[15px] font-mono font-semibold text-strong mt-0.5">{value}</p>
    </div>
  );
}

/**
 * ArcSummarySection — graduated-arc verdict + target pass/fail.
 * Only renders when isPastProgramEnd(program, today) is true.
 * Delta-3 graduation audit 2026-08-19 flagged Report rendered
 * identically to a mid-arc report; this gives graduation a distinct
 * shareable surface.
 */
function ArcSummarySection({
  program,
  store,
}: {
  program: Program;
  store: import("@/lib/schemas").Store;
}) {
  const userTier = program.slug
    ? store.user_profile?.program_states?.[program.slug]?.tier
    : undefined;
  const metrics = evaluateRetestMetrics(program, store, userTier ?? undefined);
  const displayable = metrics.filter((m) => m.supported && m.current != null);
  const feedback = program.slug
    ? store.user_profile?.program_states?.[program.slug]?.graduation_feedback
    : undefined;

  // Arc verdict — same logic as GraduationCard's chip. Compare each
  // retest's delta direction against target direction.
  const verdict = (() => {
    if (!displayable.length) return null;
    let hit = 0;
    let total = 0;
    for (const m of displayable) {
      const delta = deltaFromBaseline(m);
      if (!delta || m.target == null) continue;
      total++;
      if (delta.isImprovement) hit++;
    }
    if (total === 0) return null;
    if (hit === total) return { tone: "green" as const, label: "Targets hit" };
    if (hit > 0) return { tone: "amber" as const, label: `${hit}/${total} on track` };
    return { tone: "red" as const, label: "Below target" };
  })();

  return (
    <ReportSection title="Arc summary">
      <div className="space-y-3">
        <div className="flex items-baseline justify-between gap-2 flex-wrap">
          <p className="text-[14px] text-muted">
            <strong className="text-ink">Status:</strong> graduated
          </p>
          {verdict ? (
            <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border border-line-soft text-muted inline-flex items-center gap-1.5">
              <span
                aria-hidden
                className={`h-1.5 w-1.5 rounded-full ${
                  verdict.tone === "green"
                    ? "bg-green"
                    : verdict.tone === "amber"
                      ? "bg-amber"
                      : "bg-red"
                }`}
              />
              {verdict.label}
            </span>
          ) : null}
        </div>
        {displayable.length ? (
          <div className="rounded border border-line-soft bg-surface p-3 space-y-2">
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted">
              Retest deltas vs baseline
            </p>
            <ul className="space-y-1.5">
              {displayable.map((m) => {
                const delta = deltaFromBaseline(m);
                return (
                  <li
                    key={m.metric_id}
                    className="flex items-baseline justify-between gap-2 text-[14px]"
                  >
                    <span className="text-ink truncate">{m.display_name}</span>
                    <span className="font-mono flex items-baseline gap-2 flex-shrink-0">
                      <span className="text-muted">
                        {formatMetric(m.baseline, m.unit)} →
                      </span>
                      <span className="text-strong">
                        {formatMetric(m.current, m.unit)}
                      </span>
                      {delta ? (
                        <span
                          className={
                            delta.isImprovement ? "text-green" : "text-red"
                          }
                        >
                          ({formatMetric(delta.value, m.unit)})
                        </span>
                      ) : null}
                      {m.target != null ? (
                        <span className="text-muted italic">
                          target {formatMetric(m.target, m.unit)}
                        </span>
                      ) : null}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : (
          <p className="text-[14px] text-muted italic">
            No retest metrics recorded — log final readings on Progress to
            complete this section.
          </p>
        )}
        {feedback ? (
          <div className="rounded border border-line-soft bg-surface p-3 space-y-1">
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted">
              User feedback
            </p>
            <p className="text-[14px] text-ink">
              Rated {feedback.rating}/5
              {feedback.note ? ` — "${feedback.note}"` : ""}
            </p>
          </div>
        ) : null}
      </div>
    </ReportSection>
  );
}
