"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useStore } from "@/lib/useStore";
import { loadExercises } from "@/lib/data-loader";
import { Heatmap } from "@/components/charts/Heatmap";
import { BlockHistorySection } from "@/components/history/BlockHistorySection";
import type { Exercise, DayLog, ExerciseLog } from "@/lib/schemas";
import { EmptyStateCard } from "@/components/EmptyStateCard";

// The full palette of possible symptom regions across all program schemas.
// History only renders the ones the user has actually logged data for — so a
// rowing user never sees empty "Groin" sparklines.
const ALL_REGIONS: { key: string; label: string; lat?: "L" | "R" }[] = [
  { key: "groin_left", label: "Groin", lat: "L" },
  { key: "low_back", label: "Low back" },
  { key: "buttock_left", label: "Buttock", lat: "L" },
  { key: "shoulder_right", label: "Shoulder", lat: "R" },
  { key: "shoulder_left", label: "Shoulder", lat: "L" },
  { key: "joint_pain", label: "Joint pain" },
  { key: "muscle_soreness", label: "Muscle soreness" },
];

// All possible primary lifts across every program. History only renders the
// ones the user has actually logged top-set weight for.
const ALL_LIFTS = [
  "back_squat_highbar",
  "front_squat",
  "block_pull_midshin",
  "deadlift_conventional",
  "bench_press",
  "overhead_press",
  "snatch",
  "clean_and_jerk",
];

/**
 * History-view scale defaults (#66, 2026-08-18):
 *
 * The page has to survive at 50 days (early user) and 500+ days (Margus's
 * own 4-year rehab record). Past ~180 days the mini-bar sparklines pack
 * denser than 2 CSS px per bar on iPhone SE — the visual signal collapses
 * to noise. So we default LiftSpark and SymptomSpark to the last 180 days
 * with a "See full history" toggle. Log list stays paginated (30 per page)
 * so a 500-day user doesn't render 500 accordion rows on first paint.
 */
const DEFAULT_SPARK_WINDOW_DAYS = 180;
const LOG_PAGE_SIZE = 30;

export default function HistoryPage() {
  const hydrated = useStore((s) => s.hydrated);
  const store = useStore((s) => s.store);
  const [byId, setById] = useState<Record<string, Exercise>>({});
  const [openDate, setOpenDate] = useState<string | null>(null);
  const [logPage, setLogPage] = useState(1);
  const [fullSparkHistory, setFullSparkHistory] = useState(false);

  useEffect(() => {
    void loadExercises().then((x) => setById(x.byId));
  }, []);

  // When heatmap cell clicked, scroll the matching LogRow into view.
  useEffect(() => {
    if (!openDate) return;
    const el = document.getElementById(`day-${openDate}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [openDate]);

  if (!hydrated) return <div className="mt-8 text-sm text-muted">Loading…</div>;

  const days = Object.values(store.logs).sort((a, b) =>
    a.date.localeCompare(b.date),
  );
  const recent = days.slice(-30);
  // Scale defaults — see comment above. Sparklines cap to last 180 days by
  // default; the toggle opens the full history when the user asks for it.
  const sparkWindow = fullSparkHistory
    ? days
    : days.slice(-DEFAULT_SPARK_WINDOW_DAYS);

  if (!days.length) {
    return (
      <EmptyStateCard
        title="Nothing to look back on yet."
        body="Your log history shows up here — a heatmap of morning-check states, sessions logged per week, symptom trends, and the days you skipped. Starts the moment you save your first check or session."
        cta={{ href: "/check/", label: "Open morning check" }}
      />
    );
  }

  return (
    <div className="space-y-6 pt-4">
      <header>
        <h1 className="text-[32px] font-semibold tracking-tight text-strong leading-none">History</h1>
        <p className="mt-1 text-sm text-muted">
          Symptom trends and strength progression over time.
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="font-mono text-[13px] uppercase tracking-widest">Activity heatmap</h2>
        <div className="rounded border border-line bg-surface p-3">
          <Heatmap store={store} onDayClick={setOpenDate} />
        </div>
      </section>

      <BlockHistorySection />

      {(() => {
        // Only render regions the user has actually logged non-zero data for.
        // For a rowing / engine-builder user with no symptom logging, the
        // whole section disappears rather than showing four flat lines.
        const activeRegions = ALL_REGIONS.filter((r) =>
          recent.some((d) => {
            const v = (d.symptoms as Record<string, unknown> | null | undefined)?.[r.key];
            return typeof v === "number" && v > 0;
          }),
        );
        if (!activeRegions.length) return null;
        return (
          <section className="space-y-3">
            <h2 className="font-mono text-[13px] uppercase tracking-widest">
              Symptoms — last {recent.length}
            </h2>
            <div className="rounded border border-line bg-surface p-3 space-y-2">
              {activeRegions.map((r) => (
                <SymptomSpark key={r.key} region={r} days={recent} />
              ))}
            </div>
          </section>
        );
      })()}

      {(() => {
        // Only render lifts the user has actually logged top-set weight for.
        // A rowing user never sees "Back squat 0kg" lines.
        const activeLifts = ALL_LIFTS.filter((id) =>
          days.some((d) => {
            const ex = d.exercises?.[id];
            return ex?.sets?.some((s) => s.weight_kg != null && s.weight_kg > 0);
          }),
        );
        if (!activeLifts.length) return null;
        const canExpand = days.length > DEFAULT_SPARK_WINDOW_DAYS;
        return (
          <section className="space-y-3">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="font-mono text-[13px] uppercase tracking-widest">
                Top-set weight — main lifts
              </h2>
              {canExpand ? (
                <button
                  type="button"
                  onClick={() => setFullSparkHistory((v) => !v)}
                  className="font-mono text-[10px] uppercase tracking-wider text-slate hover:text-ink"
                >
                  {fullSparkHistory
                    ? `Show last ${DEFAULT_SPARK_WINDOW_DAYS} days`
                    : `Show all ${days.length} days`}
                </button>
              ) : null}
            </div>
            <div className="rounded border border-line bg-surface p-3 space-y-3">
              {activeLifts.map((id) => (
                <LiftSpark
                  key={id}
                  lift={id}
                  name={byId[id]?.name ?? id}
                  logs={sparkWindow}
                />
              ))}
            </div>
          </section>
        );
      })()}

      {(() => {
        // Pagination for the log list — #66 scale defaults. At 500 days a
        // fresh render allocated 500 accordion rows even though only 30
        // were visible pre-scroll; the button lets the user extend by
        // LOG_PAGE_SIZE per tap.
        const nonEmpty = days
          .slice()
          .reverse()
          .filter((d) => {
            const anyExDone = Object.values(d.exercises ?? {}).some((e) => e.done);
            const anyRun = (d.runs?.length ?? 0) > 0;
            const anyNote = !!d.notes?.trim();
            const anySymptom = d.symptoms != null;
            return anyExDone || anyRun || anyNote || anySymptom;
          });
        // If the user clicked into a specific day from the heatmap and that
        // day is outside the current page, extend the page to include it —
        // so the scroll-into-view actually lands.
        const rendered = nonEmpty.slice(0, logPage * LOG_PAGE_SIZE);
        const idxOfOpen = openDate ? nonEmpty.findIndex((d) => d.date === openDate) : -1;
        if (idxOfOpen >= rendered.length && idxOfOpen !== -1) {
          const needed = Math.ceil((idxOfOpen + 1) / LOG_PAGE_SIZE);
          if (needed > logPage) {
            // Defer to next tick so we don't setState mid-render
            queueMicrotask(() => setLogPage(needed));
          }
        }
        const hasMore = rendered.length < nonEmpty.length;
        return (
          <section className="space-y-3">
            <h2 className="font-mono text-[13px] uppercase tracking-widest">
              Log — {nonEmpty.length} active day{nonEmpty.length === 1 ? "" : "s"}
              {" · showing "}
              {rendered.length}
            </h2>
            <div className="rounded border border-line bg-surface divide-y divide-line-soft">
              {rendered.map((d) => (
                <LogRow
                  key={d.date}
                  day={d}
                  byId={byId}
                  forceOpen={openDate === d.date}
                />
              ))}
            </div>
            {hasMore ? (
              <button
                type="button"
                onClick={() => setLogPage((p) => p + 1)}
                className="w-full mt-1 py-3 min-h-[44px] rounded border border-line text-ink hover:bg-line-soft font-mono text-[11px] uppercase tracking-wider"
              >
                Load {Math.min(LOG_PAGE_SIZE, nonEmpty.length - rendered.length)} more
              </button>
            ) : null}
          </section>
        );
      })()}
    </div>
  );
}

function SymptomSpark({
  region,
  days,
}: {
  region: { key: string; label: string; lat?: "L" | "R" };
  days: DayLog[];
}) {
  return (
    <div className="grid grid-cols-[100px_1fr] items-center gap-3">
      <div className="font-mono text-[11px] text-muted uppercase tracking-wider flex items-center gap-1.5">
        {region.lat ? (
          <span
            className={`font-mono text-[9px] font-bold px-1 rounded text-surface ${region.lat === "L" ? "bg-lat-left" : "bg-lat-right"}`}
          >
            {region.lat}
          </span>
        ) : null}
        {region.label}
      </div>
      <div className="flex items-end gap-0.5 h-8">
        {days.map((d) => {
          const s = d.symptoms as Record<string, number> | null;
          const v = s?.[region.key];
          if (v == null) {
            return <span key={d.date} className="flex-1 bg-line rounded-sm min-w-[2px] h-0.5" />;
          }
          const h = Math.max(3, (v / 10) * 32);
          return (
            <span
              key={d.date}
              title={`${d.date}: ${v}`}
              style={{ height: `${h}px` }}
              className="flex-1 bg-slate/70 rounded-t min-w-[2px]"
            />
          );
        })}
      </div>
    </div>
  );
}

function LiftSpark({
  lift,
  name,
  logs,
}: {
  lift: string;
  name: string;
  logs: DayLog[];
}) {
  // Find each day's heaviest logged set for this lift
  const points: { date: string; kg: number }[] = [];
  for (const d of logs) {
    for (const [key, entry] of Object.entries(d.exercises)) {
      if (!key.endsWith(":" + lift)) continue;
      let best: number | null = null;
      if (entry.sets && entry.sets.length) {
        for (const s of entry.sets) {
          if (s.weight_kg != null && s.weight_kg > 0) {
            best = Math.max(best ?? 0, s.weight_kg);
          }
        }
      }
      if (best == null && entry.weight_kg != null && entry.weight_kg > 0) {
        best = entry.weight_kg;
      }
      if (best != null) points.push({ date: d.date, kg: best });
    }
  }
  if (!points.length) {
    return (
      <div className="grid grid-cols-[130px_1fr_60px] items-center gap-3 text-[12px] text-muted">
        <span className="truncate">{name}</span>
        <span className="italic">no logged sets yet</span>
        <span></span>
      </div>
    );
  }
  const max = Math.max(...points.map((p) => p.kg));
  const first = points[0].kg;
  const last = points[points.length - 1].kg;
  const delta = last - first;
  return (
    <div className="grid grid-cols-[130px_1fr_60px] items-center gap-3 text-sm">
      <span className="truncate font-medium">{name}</span>
      <div className="flex items-end gap-0.5 h-8">
        {points.map((p) => {
          const h = Math.max(3, (p.kg / max) * 32);
          return (
            <span
              key={p.date}
              title={`${p.date}: ${p.kg} kg`}
              style={{ height: `${h}px` }}
              className="flex-1 bg-green/70 rounded-t min-w-[3px]"
            />
          );
        })}
      </div>
      <span className="font-mono text-right text-[12px]">
        {last} kg
        {delta !== 0 ? (
          <span className={`block text-[10px] ${delta > 0 ? "text-green" : "text-red"}`}>
            {delta > 0 ? "+" : ""}
            {delta.toFixed(1)}
          </span>
        ) : null}
      </span>
    </div>
  );
}

function LogRow({
  day,
  byId,
  forceOpen,
}: {
  day: DayLog;
  byId: Record<string, Exercise>;
  forceOpen?: boolean;
}) {
  const [open, setOpen] = useState(false);
  // When the heatmap requests this row (via `forceOpen`), auto-open it. User
  // can still collapse afterward — we track userToggled to avoid overriding.
  const [userToggled, setUserToggled] = useState(false);
  useEffect(() => {
    if (forceOpen && !userToggled) setOpen(true);
  }, [forceOpen, userToggled]);
  const doneEntries = Object.entries(day.exercises).filter(([, e]) => e.done);
  const doneCount = doneEntries.length;
  const notesCount = doneEntries.filter(([, e]) => !!(e.notes && e.notes.trim())).length;
  const parsedDate = new Date(day.date + "T12:00:00");
  const label = parsedDate.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
  return (
    <div id={`day-${day.date}`}>
      <button
        type="button"
        onClick={() => {
          setUserToggled(true);
          setOpen((v) => !v);
        }}
        aria-expanded={open}
        className="w-full px-3 py-2.5 flex items-center justify-between gap-3 font-mono text-[12px] text-left hover:bg-line-soft/40 min-h-[44px]"
      >
        <span className="flex items-center gap-2">
          {open ? (
            <ChevronDown size={12} aria-hidden />
          ) : (
            <ChevronRight size={12} aria-hidden />
          )}
          {day.derived_state ? (
            <span
              className={`inline-block w-2 h-2 rounded-full ${
                day.derived_state === "green"
                  ? "bg-green"
                  : day.derived_state === "amber"
                    ? "bg-amber"
                    : "bg-red"
              }`}
              aria-label={day.derived_state}
            />
          ) : null}
          <span>{label}</span>
          <span className="text-muted/70 hidden sm:inline">{day.date}</span>
        </span>
        <span className="text-muted">
          {doneCount} done{notesCount ? ` · ${notesCount} note${notesCount === 1 ? "" : "s"}` : ""}
        </span>
      </button>
      {open ? (
        <div className="px-3 pb-3 pt-1 space-y-2 border-t border-line-soft/50">
          {doneCount === 0 ? (
            <p className="text-[12px] text-muted italic">No exercises marked done.</p>
          ) : (
            doneEntries.map(([key, entry]) => (
              <ExerciseRow key={key} keyStr={key} entry={entry} byId={byId} />
            ))
          )}
          {day.symptoms ? (
            <SymptomsSummary symptoms={day.symptoms} />
          ) : (
            <p className="text-[12px] text-muted italic">No morning check saved.</p>
          )}
          {day.notes ? (
            <p className="text-[12px] text-muted">
              <span className="mono-caps mr-1">Day note:</span>
              {day.notes}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function ExerciseRow({
  keyStr,
  entry,
  byId,
}: {
  keyStr: string;
  entry: ExerciseLog;
  byId: Record<string, Exercise>;
}) {
  const exId = keyStr.split(":")[1];
  const ex = byId[exId];
  const sets = entry.sets ?? [];
  const legacySet =
    !sets.length && (entry.weight_kg != null || entry.reps != null)
      ? [{ weight_kg: entry.weight_kg ?? null, reps: entry.reps ?? null, rpe: entry.rpe ?? null }]
      : sets;
  const validSets = legacySet.filter((s) => s.weight_kg != null || s.reps != null);
  return (
    <div className="rounded border border-line-soft bg-surface-2/40 p-2">
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-[13px] font-medium">{ex?.name ?? exId}</p>
        <p className="mono-caps text-[10px]">{validSets.length} set{validSets.length === 1 ? "" : "s"}</p>
      </div>
      {validSets.length ? (
        <ul className="mt-1 space-y-0.5 font-mono text-[11px] text-muted">
          {validSets.map((s, i) => (
            <li key={i} className="flex gap-2 items-center">
              <span className="w-5 text-center">#{i + 1}</span>
              <span className="tabular-nums">
                {s.weight_kg != null ? `${s.weight_kg} kg` : "—"} × {s.reps != null ? s.reps : "—"}
                {s.rpe != null ? ` @ RPE ${s.rpe}` : ""}
              </span>
              {s.notes ? (
                <span className="text-[11px] italic ml-2 truncate">{s.notes}</span>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
      {entry.notes ? (
        <p className="mt-1 text-[11px] italic text-muted">{entry.notes}</p>
      ) : null}
    </div>
  );
}

function SymptomsSummary({ symptoms }: { symptoms: NonNullable<DayLog["symptoms"]> }) {
  const items: string[] = [];
  if (symptoms.groin_left != null && symptoms.groin_left > 0) items.push(`Groin L ${symptoms.groin_left}`);
  if (symptoms.low_back != null && symptoms.low_back > 0) items.push(`Low back ${symptoms.low_back}`);
  if (symptoms.buttock_left != null && symptoms.buttock_left > 0) items.push(`Buttock L ${symptoms.buttock_left}`);
  if (symptoms.shoulder_right != null && symptoms.shoulder_right > 0) items.push(`Shoulder R ${symptoms.shoulder_right}`);
  if (symptoms.night_pain) items.push("night pain");
  if (symptoms.gait_change) items.push("gait change");
  if (symptoms.click_present) items.push(symptoms.click_painful ? "painful click" : "click (painless)");
  return (
    <p className="text-[11px] text-muted">
      <span className="mono-caps mr-1">Check:</span>
      {items.length ? items.join(" · ") : "all zero"}
    </p>
  );
}
