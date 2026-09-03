"use client";

import { useMemo } from "react";
import { peakRegionScore } from "@/lib/symptom-state";
import { loadSignalsForProgram, axisUnitFor } from "@/lib/load-signals";
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { DayLog, Program } from "@/lib/schemas";

/**
 * Symptoms against training load, per day.
 *
 * Both axes used to be one program's shape shown to everyone. The symptom
 * axis was fixed in August — the comment in `peakSymptom` below records why.
 * The load axis was not: it hardcoded three squat and four deadlift ids, and
 * only `anterior-hip-rebuild` and `concurrent-strength-maintenance` prescribe
 * any of them. **The other seven shipped programs rendered a symptom line
 * against an empty load line**, on `/record` and on the `/report` page meant
 * to be handed to a specialist.
 *
 * Load now comes from the program's declared `load_signals` (see
 * `lib/load-signals.ts`), so a rowing user's load line is session minutes and
 * a pull-up user's is working reps.
 */

type Row = {
  date: string;
  short: string;
  peak_symptom: number | null;
  /** One key per declared load signal id. */
  [signalId: string]: string | number | null;
};

function peakSymptom(day: DayLog): number | null {
  const s = day.symptoms;
  if (!s) return null;
  // Was a Math.max over four hardcoded hip regions, so a pull-up user's elbow
  // or a muscle-up user's wrist never reached this chart at all — the symptom
  // line read flat while they were hurting.
  return peakRegionScore(s).value;
}

// Series colours, in declaration order. Two is the practical maximum on one
// axis; a third program signal would need a colour decision, not a fallback.
const SERIES_COLORS = ["#C89666", "#5FB37A"];

export function SymptomLoadChart({
  days,
  program,
}: {
  days: DayLog[];
  program?: Program | null;
}) {
  const signals = useMemo(() => loadSignalsForProgram(program), [program]);
  const unit = axisUnitFor(signals);

  // P2-6 — memoize derivation to avoid rebuilding on every Recharts
  // re-render (tooltip hover triggers a lot).
  const rows: Row[] = useMemo(
    () =>
      days.map((d) => {
        const row: Row = {
          date: d.date,
          short: d.date.slice(5), // MM-DD
          peak_symptom: peakSymptom(d),
        };
        for (const sig of signals) row[sig.id] = sig.extract(d);
        return row;
      }),
    [days, signals],
  );

  const anyLoad = rows.some((r) => signals.some((s) => r[s.id] != null));
  const anySymptom = rows.some((r) => r.peak_symptom != null);

  if (!anyLoad && !anySymptom) {
    return (
      <div className="text-[14px] text-muted italic">
        No data yet — log a session or morning check first.
      </div>
    );
  }

  // Dark-theme chart palette — WCAG AA on #16181C surface
  // P2-13 — was rogue #2A2E37; unified on the --color-line-soft token so
  // chart grid pitch matches the app's line hierarchy.
  const grid = "#24272f";
  const axisLine = "#3A3F4A";
  const axisTick = "#D6D9DE";
  const red = "#E5654B";

  // Summarise for screen-reader users — Recharts SVG has no accessible name.
  const peakOfPeak = rows.reduce<number>((acc, r) => Math.max(acc, r.peak_symptom ?? 0), 0);
  const summary = [
    `Symptom vs load, last ${rows.length} days.`,
    peakOfPeak > 0 ? `Peak symptom ${peakOfPeak} out of 10.` : "No symptoms logged.",
    ...signals.map((s) => {
      const last = [...rows].reverse().find((r) => r[s.id] != null)?.[s.id];
      return last != null ? `Most recent ${s.label.toLowerCase()} ${last} ${s.unit}.` : null;
    }),
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div>
      <div role="img" aria-label={summary} className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={rows} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
          <CartesianGrid stroke={grid} strokeDasharray="3 3" />
          <XAxis
            dataKey="short"
            tick={{ fontSize: 10, fill: axisTick }}
            axisLine={{ stroke: axisLine }}
            tickLine={{ stroke: axisLine }}
          />
          {unit ? (
            <YAxis
              yAxisId="load"
              orientation="left"
              tick={{ fontSize: 10, fill: axisTick }}
              axisLine={{ stroke: axisLine }}
              tickLine={{ stroke: axisLine }}
              label={{ value: unit, angle: -90, position: "insideLeft", fontSize: 10, fill: axisTick }}
            />
          ) : null}
          <YAxis
            yAxisId="pain"
            orientation="right"
            domain={[0, 10]}
            tick={{ fontSize: 10, fill: axisTick }}
            axisLine={{ stroke: axisLine }}
            tickLine={{ stroke: axisLine }}
            label={{ value: "pain", angle: 90, position: "insideRight", fontSize: 10, fill: axisTick }}
          />
          <Tooltip content={<CustomTooltip signals={signals} />} />
          <Legend wrapperStyle={{ fontSize: 11, color: axisTick }} />
          <Bar
            yAxisId="pain"
            dataKey="peak_symptom"
            name="Peak symptom (0-10)"
            fill={red}
            fillOpacity={0.55}
            barSize={16}
          />
          {unit
            ? signals.map((s, i) => (
                <Line
                  key={s.id}
                  yAxisId="load"
                  type="monotone"
                  dataKey={s.id}
                  name={`${s.label} (${s.unit})`}
                  stroke={SERIES_COLORS[i % SERIES_COLORS.length]}
                  strokeWidth={2}
                  dot={{ r: 3, fill: SERIES_COLORS[i % SERIES_COLORS.length] }}
                  connectNulls
                />
              ))
            : null}
        </ComposedChart>
      </ResponsiveContainer>
      </div>
      {/* P2-14 — restore data-table fallback under a <details> disclosure.
          Sighted keyboard users can't hit tooltip trigger points; the
          table gives them the same numbers with Tab + arrow keys. Screen
          readers already have the chart's aria-label summary. */}
      <details className="mt-3 text-[13px]">
        <summary className="cursor-pointer inline-flex items-center min-h-[44px] py-2 text-muted hover:text-ink select-none">
          Data table
        </summary>
        <div className="mt-1 overflow-x-auto">
          <table className="w-full text-[12px] font-mono border-collapse">
            <thead>
              <tr className="text-left text-muted border-b border-line-soft">
                <th className="py-1.5 pr-3 font-normal">Date</th>
                <th className="py-1.5 pr-3 font-normal">Peak symptom</th>
                {signals.map((s) => (
                  <th key={s.id} className="py-1.5 pr-3 font-normal">
                    {s.label} ({s.unit})
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.date} className="border-b border-line-soft/50">
                  <td className="py-1 pr-3 text-ink">{r.date}</td>
                  <td className="py-1 pr-3 text-ink">
                    {r.peak_symptom ?? "—"}
                  </td>
                  {signals.map((s) => (
                    <td key={s.id} className="py-1 pr-3 text-ink">
                      {r[s.id] ?? "—"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}

function CustomTooltip(props: {
  active?: boolean;
  payload?: Array<{ payload: Row }>;
  signals?: ReturnType<typeof loadSignalsForProgram>;
}) {
  const { active, payload, signals = [] } = props;
  if (!active || !payload || !payload.length) return null;
  const row = payload[0].payload as Row;
  return (
    <div className="rounded border border-line bg-surface p-2 shadow-sm text-[11px]">
      <p className="font-mono text-muted mb-1">{row.date}</p>
      {signals.map((s, i) =>
        row[s.id] != null ? (
          <p key={s.id}>
            {/* Audit 2026-08-18 (visual-craft) — legend swatch must match the
                line colour exactly; inline style keeps recharts and the token
                palette synchronized. */}
            <span style={{ color: SERIES_COLORS[i % SERIES_COLORS.length] }}>■</span>{" "}
            {s.label}: {row[s.id]} {s.unit}
          </p>
        ) : null,
      )}
      {row.peak_symptom != null ? (
        <p>
          <span className="text-red">■</span> Peak symptom: {row.peak_symptom}/10
        </p>
      ) : null}
    </div>
  );
}
