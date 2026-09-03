"use client";

/**
 * Cut C · Record surface · Log-section accordion list.
 *
 * Extracted from `/history` LogRow/ExerciseRow/SymptomsSummary pattern
 * with pagination (30-per-page) and the new "N active days · showing
 * last M" summary line.
 *
 * See DESIGN-cut-c.md · LogList · Log section is enumeration (drill-in
 * detail), aggregation lives above (heatmap + curve + timeline).
 * Matrix rec #9: aggregation is primary at scale, enumeration is
 * drill-in — this is the drill-in.
 *
 * Batch 37 pattern reminder: no `?? []` inside a useStore selector.
 * Data flows via props (store).
 */

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { loadExercises } from "@/lib/data-loader";
import type { DayLog, Exercise, ExerciseLog, Store } from "@/lib/schemas";
import { cn } from "@/lib/utils";
import { SYMPTOM_REGIONS } from "@/lib/symptom-regions";

const PAGE_SIZE = 30;

export type CutCLogListProps = {
  store: Store;
  className?: string;
};

export function CutCLogList({ store, className }: CutCLogListProps) {
  const [byId, setById] = useState<Record<string, Exercise>>({});
  const [visible, setVisible] = useState(PAGE_SIZE);

  useEffect(() => {
    void loadExercises().then((x) => setById(x.byId));
  }, []);

  // Sort most-recent-first; only days with any activity.
  const activeDays = useMemo(() => {
    const logs = store.logs ?? {};
    const days = Object.values(logs).filter((day): day is DayLog => {
      if (!day) return false;
      const hasExercise = day.exercises && Object.keys(day.exercises).length > 0;
      const hasRun = (day.runs ?? []).length > 0;
      const hasSymptoms = !!day.symptoms;
      return hasExercise || hasRun || hasSymptoms;
    });
    return days.sort((a, b) => b.date.localeCompare(a.date));
  }, [store.logs]);

  const totalActive = activeDays.length;
  const shown = activeDays.slice(0, visible);
  const hasMore = totalActive > visible;

  if (totalActive === 0) {
    return (
      <div className={cn("rounded border border-line-soft bg-surface p-3", className)}>
        <p className="text-[12px] text-muted italic">
          Your log builds here. Every session, morning check, and extra activity lands as a row you can expand.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      <p className="text-[12px] text-muted">
        {totalActive} active day{totalActive === 1 ? "" : "s"} · showing last {Math.min(visible, totalActive)}
      </p>

      <div className="rounded border border-line-soft bg-surface divide-y divide-line-soft/50">
        {shown.map((day) => (
          <LogRow key={day.date} day={day} byId={byId} />
        ))}
      </div>

      {hasMore ? (
        <button
          type="button"
          onClick={() => setVisible((v) => v + PAGE_SIZE)}
          className="w-full min-h-[44px] py-2.5 rounded border border-line-strong font-mono text-[12px] uppercase tracking-widest text-ink motion-reduce:transition-none transition-colors hover:bg-line-soft focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-bronze focus-visible:outline-offset-2"
        >
          Load {PAGE_SIZE} more
        </button>
      ) : null}
    </div>
  );
}

function LogRow({ day, byId }: { day: DayLog; byId: Record<string, Exercise> }) {
  const [open, setOpen] = useState(false);
  const doneEntries = Object.entries(day.exercises).filter(([, e]) => e.done);
  const doneCount = doneEntries.length;
  const runCount = (day.runs ?? []).length;
  const notesCount = doneEntries.filter(([, e]) => !!(e.notes && e.notes.trim())).length;
  const parsed = new Date(day.date + "T12:00:00");
  const label = parsed.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

  const summary = [
    doneCount > 0 ? `${doneCount} done` : null,
    runCount > 0 ? `${runCount} run${runCount === 1 ? "" : "s"}` : null,
    notesCount > 0 ? `${notesCount} note${notesCount === 1 ? "" : "s"}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div id={`day-${day.date}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full px-3 py-2.5 flex items-center justify-between gap-3 font-mono text-[12px] text-left hover:bg-line-soft/40 min-h-[44px] focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-bronze focus-visible:outline-offset-2"
      >
        <span className="flex items-center gap-2">
          {open ? (
            <ChevronDown size={12} aria-hidden />
          ) : (
            <ChevronRight size={12} aria-hidden />
          )}
          {day.derived_state ? (
            <span
              aria-label={day.derived_state}
              className={`inline-block w-2 h-2 rounded-full ${
                day.derived_state === "green"
                  ? "bg-green"
                  : day.derived_state === "amber"
                    ? "bg-amber"
                    : "bg-red"
              }`}
            />
          ) : null}
          <span>{label}</span>
        </span>
        <span className="text-muted">{summary || "logged"}</span>
      </button>
      {open ? (
        <div className="px-3 pb-3 pt-1 space-y-2 border-t border-line-soft/50">
          {doneCount === 0 && runCount === 0 ? (
            <p className="text-[12px] text-muted italic">No exercises or runs on this day.</p>
          ) : (
            <>
              {doneEntries.map(([key, entry]) => (
                <ExerciseRow key={key} keyStr={key} entry={entry} byId={byId} />
              ))}
              {(day.runs ?? []).map((run, i) => (
                <RunRow key={i} run={run} />
              ))}
            </>
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
      ? [{ weight_kg: entry.weight_kg ?? null, reps: entry.reps ?? null, rpe: entry.rpe ?? null, notes: undefined }]
      : sets;
  const validSets = legacySet.filter((s) => s.weight_kg != null || s.reps != null);
  return (
    <div className="rounded border border-line-soft bg-surface-2/40 p-2">
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-[14px] font-medium">{ex?.name ?? exId}</p>
        <p className="mono-caps text-[10px]">
          {validSets.length} set{validSets.length === 1 ? "" : "s"}
        </p>
      </div>
      {validSets.length ? (
        <ul className="mt-1 space-y-0.5 font-mono text-[11px] text-muted">
          {validSets.map((s, i) => (
            <li key={i} className="flex gap-2 items-center">
              <span className="w-5 text-center">#{i + 1}</span>
              {/* A held set reads as its duration, not as "— × 1".
                  Isometrics and stretches carry `seconds`; see
                  setLogSchema. */}
              {/* A missed attempt reads as a miss, not as "122 kg × 0" —
                  which looks like a data-entry error rather than the most
                  informative number in the session. */}
              <span className="tabular-nums">
                {s.failed === true
                  ? `${s.weight_kg != null ? `${s.weight_kg} kg` : "—"} — missed`
                  : s.seconds != null
                    ? `${s.seconds}s hold`
                    : `${s.weight_kg != null ? `${s.weight_kg} kg` : "—"} × ${s.reps != null ? s.reps : "—"}`}
                {s.rpe != null ? ` @ RPE ${s.rpe}` : ""}
              </span>
              {s.notes ? (
                <span className="text-[11px] italic ml-2 truncate">{s.notes}</span>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
      {entry.notes ? <p className="mt-1 text-[11px] italic text-muted">{entry.notes}</p> : null}
    </div>
  );
}

function RunRow({ run }: { run: NonNullable<DayLog["runs"]>[number] }) {
  const parts: string[] = [];
  if (run.activity_type) parts.push(run.activity_type);
  if (run.intensity) parts.push(run.intensity);
  if (run.minutes) parts.push(`${run.minutes} min`);
  if (run.distance_km) parts.push(`${run.distance_km.toFixed(1)} km`);
  if (run.avg_hr) parts.push(`${run.avg_hr} bpm`);
  return (
    <div className="rounded border border-line-soft bg-surface-2/40 p-2 font-mono text-[12px] text-ink">
      <span className="tabular-nums">{parts.join(" · ") || "run"}</span>
      {run.note ? <p className="mt-1 text-[11px] italic text-muted">{run.note}</p> : null}
    </div>
  );
}

function SymptomsSummary({ symptoms }: { symptoms: NonNullable<DayLog["symptoms"]> }) {
  const items: string[] = [];
  // Enumerated from the region library rather than four hardcoded hip keys, so
  // a logged elbow or wrist actually appears in the record instead of being
  // written and never shown back.
  for (const r of SYMPTOM_REGIONS) {
    const v = (symptoms as Record<string, unknown>)[r.id];
    if (typeof v === "number" && v > 0) items.push(`${r.short} ${v}`);
  }
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
