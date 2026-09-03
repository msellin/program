/**
 * Load signals — what "training load" means for a given program.
 *
 * `SymptomLoadChart` renders symptoms against load on `/record` and
 * `/report`. Its symptom axis was de-hardcoded in August, with a comment
 * recording why: a Math.max over four hip regions meant "a pull-up user's
 * elbow or a muscle-up user's wrist never reached this chart at all — the
 * symptom line read flat while they were hurting."
 *
 * The load axis was left as it was: two hardcoded arrays of barbell lift ids
 * — three squat variants and four pull variants. Only `anterior-hip-rebuild`
 * and `concurrent-strength-maintenance` prescribe any of them. **The other
 * seven shipped programs drew a symptom line against an empty load line**, on
 * both surfaces, including the report page meant to be handed to a
 * specialist. Same defect as the symptom axis, same cause — one program's
 * shape rendered to every program's users — fixed on one axis and not the
 * other.
 *
 * This is the load-side counterpart to `symptom-regions.ts`, and deliberately
 * the same shape: a curated library, programs select from it by id, and a
 * test fails on an unknown id or a program that declares none. A program says
 * WHAT its load is; it does not get to define new extraction logic, the same
 * way it declares which symptom regions feed the gate without setting the
 * gate's thresholds.
 *
 * Signals on one chart must share a unit — the load axis has one scale and
 * one label. `data-integrity.test.ts` enforces that; kilograms and minutes on
 * a shared axis is a chart that lies about both.
 */

import type { DayLog } from "./schemas";

export type LoadSignal = {
  id: string;
  /** Series name in the legend and the data table. */
  label: string;
  /** Axis unit. Every signal a program declares must agree. */
  unit: "kg" | "min" | "reps" | "s";
  /** Pull this day's value, or null when the day has nothing to say. */
  extract: (day: DayLog) => number | null;
};

/** Heaviest single set across a set of exercise ids. */
function heaviestOf(day: DayLog, exerciseIds: string[]): number | null {
  let best: number | null = null;
  for (const [key, entry] of Object.entries(day.exercises ?? {})) {
    // Keys are `${blockId}:${exerciseId}`.
    const exId = key.split(":")[1];
    if (!exerciseIds.includes(exId)) continue;
    for (const s of entry.sets ?? []) {
      if (s.weight_kg != null && s.weight_kg > 0) best = Math.max(best ?? 0, s.weight_kg);
    }
    if (entry.weight_kg != null && entry.weight_kg > 0) {
      best = Math.max(best ?? 0, entry.weight_kg);
    }
  }
  return best;
}

/** Sum a numeric field across every set logged that day. */
function totalAcrossSets(day: DayLog, field: "reps" | "seconds"): number | null {
  let total = 0;
  let saw = false;
  for (const entry of Object.values(day.exercises ?? {})) {
    for (const s of entry.sets ?? []) {
      const v = s[field];
      if (typeof v === "number" && Number.isFinite(v) && v > 0) {
        total += v;
        saw = true;
      }
    }
  }
  return saw ? total : null;
}

const SQUAT_IDS = ["back_squat_highbar", "back_squat_ssb", "front_squat"];
const PULL_IDS = [
  "block_pull_midshin",
  "deadlift_conventional",
  "trap_bar_dl_blocks",
  "trap_bar_dl_floor",
];

export const LOAD_SIGNALS: LoadSignal[] = [
  {
    id: "squat_top_kg",
    label: "Squat top set",
    unit: "kg",
    extract: (d) => heaviestOf(d, SQUAT_IDS),
  },
  {
    id: "pull_top_kg",
    label: "Pull top set",
    unit: "kg",
    extract: (d) => heaviestOf(d, PULL_IDS),
  },
  {
    id: "aerobic_minutes",
    label: "Session minutes",
    unit: "min",
    // Aerobic programs log through RunSlotCard into `runs[]`; DaySession skips
    // `category: "run"` blocks entirely, so their work never lands in
    // `exercises[]` and a set-based signal would read empty for them.
    extract: (d) => {
      let total = 0;
      let saw = false;
      for (const r of d.runs ?? []) {
        if (typeof r.minutes === "number" && r.minutes > 0) {
          total += r.minutes;
          saw = true;
        } else if (typeof r.total_seconds === "number" && r.total_seconds > 0) {
          total += r.total_seconds / 60;
          saw = true;
        }
      }
      return saw ? Math.round(total) : null;
    },
  },
  {
    id: "working_reps",
    label: "Working reps",
    unit: "reps",
    extract: (d) => totalAcrossSets(d, "reps"),
  },
  {
    id: "hold_seconds",
    label: "Time under tension",
    unit: "s",
    // `sets[].seconds` landed 2026-08-25. Before that a 30-second hold was
    // logged as "x12" reps, so this signal is blank for earlier history
    // rather than wrong — which is the correct failure for a chart.
    extract: (d) => totalAcrossSets(d, "seconds"),
  },
];

const SIGNAL_BY_ID: Record<string, LoadSignal> = Object.fromEntries(
  LOAD_SIGNALS.map((s) => [s.id, s]),
);

/**
 * What the chart drew before programs could declare anything. Kept as the
 * fallback so a program that somehow ships without a declaration renders what
 * it always did, rather than nothing — the same reasoning as `LEGACY_REGIONS`
 * in `symptom-regions.ts`. The data test is what stops a program relying on
 * it.
 */
export const LEGACY_LOAD_SIGNALS = ["squat_top_kg", "pull_top_kg"] as const;

export function loadSignalsForProgram(
  program?: { load_signals?: string[] } | null,
): LoadSignal[] {
  const ids = program?.load_signals?.length
    ? program.load_signals
    : [...LEGACY_LOAD_SIGNALS];
  return ids.map((id) => SIGNAL_BY_ID[id]).filter((s): s is LoadSignal => !!s);
}

/**
 * The axis unit for a set of signals, or null when they disagree. A caller
 * that gets null should render no load axis rather than pick a winner.
 */
export function axisUnitFor(signals: LoadSignal[]): LoadSignal["unit"] | null {
  if (signals.length === 0) return null;
  const first = signals[0].unit;
  return signals.every((s) => s.unit === first) ? first : null;
}
