"use client";

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
import type { DayLog } from "@/lib/schemas";

type Row = {
  date: string;
  short: string;
  peak_symptom: number | null;
  squat_top: number | null;
  pull_top: number | null;
};

const SQUAT_KEYS = ["back_squat_highbar", "back_squat_ssb", "front_squat"];
const PULL_KEYS = ["block_pull_midshin", "deadlift_conventional", "trap_bar_dl_blocks", "trap_bar_dl_floor"];

function heaviestFor(day: DayLog, lifts: string[]): number | null {
  let best: number | null = null;
  for (const [key, entry] of Object.entries(day.exercises)) {
    const exId = key.split(":")[1];
    if (!lifts.includes(exId)) continue;
    if (entry.sets && entry.sets.length) {
      for (const s of entry.sets) {
        if (s.weight_kg != null && s.weight_kg > 0)
          best = Math.max(best ?? 0, s.weight_kg);
      }
    }
    if (entry.weight_kg != null && entry.weight_kg > 0) {
      best = Math.max(best ?? 0, entry.weight_kg);
    }
  }
  return best;
}

function peakSymptom(day: DayLog): number | null {
  const s = day.symptoms;
  if (!s) return null;
  return Math.max(
    s.groin_left ?? 0,
    s.low_back ?? 0,
    s.buttock_left ?? 0,
    s.shoulder_right ?? 0,
  );
}

export function SymptomLoadChart({ days }: { days: DayLog[] }) {
  const rows: Row[] = days.map((d) => ({
    date: d.date,
    short: d.date.slice(5), // MM-DD
    peak_symptom: peakSymptom(d),
    squat_top: heaviestFor(d, SQUAT_KEYS),
    pull_top: heaviestFor(d, PULL_KEYS),
  }));

  const anyStrength = rows.some((r) => r.squat_top != null || r.pull_top != null);
  const anySymptom = rows.some((r) => r.peak_symptom != null);

  if (!anyStrength && !anySymptom) {
    return (
      <div className="text-[13px] text-muted italic">
        No data yet — log a session or morning check first.
      </div>
    );
  }

  // Dark-theme chart palette — WCAG AA on #16181C surface
  const grid = "#2A2E37";
  const axisLine = "#3A3F4A";
  const axisTick = "#D6D9DE";
  const red = "#E5654B";
  const bronze = "#C89666";
  const green = "#5FB37A";

  // Summarise for screen-reader users — Recharts SVG has no accessible name.
  const lastSquat = [...rows].reverse().find((r) => r.squat_top != null)?.squat_top;
  const lastPull = [...rows].reverse().find((r) => r.pull_top != null)?.pull_top;
  const peakOfPeak = rows.reduce<number>((acc, r) => Math.max(acc, r.peak_symptom ?? 0), 0);
  const summary = [
    `Symptom vs load, last ${rows.length} days.`,
    peakOfPeak > 0 ? `Peak symptom ${peakOfPeak} out of 10.` : "No symptoms logged.",
    lastSquat != null ? `Most recent squat top set ${lastSquat} kg.` : null,
    lastPull != null ? `Most recent pull top set ${lastPull} kg.` : null,
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
          <YAxis
            yAxisId="load"
            orientation="left"
            tick={{ fontSize: 10, fill: axisTick }}
            axisLine={{ stroke: axisLine }}
            tickLine={{ stroke: axisLine }}
            label={{ value: "kg", angle: -90, position: "insideLeft", fontSize: 10, fill: axisTick }}
          />
          <YAxis
            yAxisId="pain"
            orientation="right"
            domain={[0, 10]}
            tick={{ fontSize: 10, fill: axisTick }}
            axisLine={{ stroke: axisLine }}
            tickLine={{ stroke: axisLine }}
            label={{ value: "pain", angle: 90, position: "insideRight", fontSize: 10, fill: axisTick }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: 11, color: axisTick }} />
          <Bar
            yAxisId="pain"
            dataKey="peak_symptom"
            name="Peak symptom (0-10)"
            fill={red}
            fillOpacity={0.55}
            barSize={16}
          />
          <Line
            yAxisId="load"
            type="monotone"
            dataKey="squat_top"
            name="Squat top set kg"
            stroke={bronze}
            strokeWidth={2}
            dot={{ r: 3, fill: bronze }}
            connectNulls
          />
          <Line
            yAxisId="load"
            type="monotone"
            dataKey="pull_top"
            name="Pull top set kg"
            stroke={green}
            strokeWidth={2}
            dot={{ r: 3, fill: green }}
            connectNulls
          />
        </ComposedChart>
      </ResponsiveContainer>
      </div>
      <details className="mt-2 text-[12px] text-muted">
        <summary className="cursor-pointer select-none hover:text-ink">Show data as table</summary>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full text-left border-collapse font-mono text-[11px]">
            <thead>
              <tr className="border-b border-line-soft text-muted">
                <th scope="col" className="py-1 pr-3 font-normal">Date</th>
                <th scope="col" className="py-1 pr-3 font-normal">Peak symptom</th>
                <th scope="col" className="py-1 pr-3 font-normal">Squat kg</th>
                <th scope="col" className="py-1 font-normal">Pull kg</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.date} className="border-b border-line-soft/50">
                  <td className="py-0.5 pr-3">{r.date}</td>
                  <td className="py-0.5 pr-3">{r.peak_symptom ?? "—"}</td>
                  <td className="py-0.5 pr-3">{r.squat_top ?? "—"}</td>
                  <td className="py-0.5">{r.pull_top ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}

function CustomTooltip(props: { active?: boolean; payload?: Array<{ payload: Row }> }) {
  const { active, payload } = props;
  if (!active || !payload || !payload.length) return null;
  const row = payload[0].payload as Row;
  return (
    <div className="rounded border border-line bg-surface p-2 shadow-sm text-[11px]">
      <p className="font-mono text-muted mb-1">{row.date}</p>
      {row.squat_top != null ? (
        <p>
          <span className="text-lat-left">■</span> Squat: {row.squat_top} kg
        </p>
      ) : null}
      {row.pull_top != null ? (
        <p>
          <span className="text-green">■</span> Pull: {row.pull_top} kg
        </p>
      ) : null}
      {row.peak_symptom != null ? (
        <p>
          <span className="text-red">■</span> Peak symptom: {row.peak_symptom}/10
        </p>
      ) : null}
    </div>
  );
}
