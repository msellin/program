import type { Store, Program, DayLog } from "../schemas";
import { iso } from "../utils";
import { daySignals } from "./note-signals";

/**
 * Deterministic weekly narrative — pure aggregation over the store's logs.
 *
 * This is the free-tier version of what an LLM would say. It counts, sums,
 * and diffs; it doesn't opine. If a paid tier turns on, the LLM gets fed the
 * same aggregate as context so the two versions stay in sync.
 *
 * Weeks run Monday to Sunday (matches the rest of the app's week model).
 */

export type WeekSummary = {
  weekStart: string;
  weekEnd: string;
  label: string;
  sessions: {
    scheduled: number;
    completed: number;
    completionRatio: number;
  };
  states: {
    green: number;
    amber: number;
    red: number;
    unchecked: number;
  };
  training: {
    prsHit: number;
    tmChanges: Array<{ lift: string; delta: number }>;
    topLift: { exerciseId: string; weight_kg: number; reps: number; date: string } | null;
  };
  endurance: {
    runsCount: number;
    totalKm: number;
    totalMinutes: number;
  };
  rehab: {
    daysWithBlockADone: number;
  };
  signals: {
    fatigueDaysHighOrElevated: number;
    painDays: number;
    externalLoadDays: number;
    easyDays: number;
  };
  hasAnyActivity: boolean;
};

/** Monday of the given date (local time). */
function mondayOf(dateISO: string): Date {
  const d = new Date(dateISO + "T00:00:00");
  const dow = d.getDay();
  const daysBackToMon = (dow + 6) % 7;
  const mon = new Date(d);
  mon.setDate(d.getDate() - daysBackToMon);
  return mon;
}

/** Return the 7 ISO date strings from Monday to Sunday of the week containing `dateISO`. */
export function weekDates(dateISO: string): string[] {
  const mon = mondayOf(dateISO);
  const out: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(mon);
    d.setDate(mon.getDate() + i);
    out.push(iso(d));
  }
  return out;
}

const TM_LIFT_IDS = new Set([
  "back_squat_highbar",
  "back_squat_ssb",
  "front_squat",
  "block_pull_midshin",
  "deadlift_conventional",
  "trap_bar_dl_blocks",
  "trap_bar_dl_floor",
]);

/**
 * Compute the summary for the week containing `anchorDateISO`. If the anchor is
 * mid-week, "completed" counts only up to that day; "scheduled" counts the full
 * planned week regardless.
 */
export function computeWeekSummary(
  store: Store,
  program: Program,
  anchorDateISO: string,
): WeekSummary {
  const dates = weekDates(anchorDateISO);
  const weekStart = dates[0];
  const weekEnd = dates[6];

  const wt = program.weekly_template as
    | { week?: Array<{ session: string; day: string }> }
    | undefined;
  const strengthCountsPerDay: number[] = (wt?.week ?? []).map((entry) => {
    if (!entry) return 0;
    const blockIds = (entry.session.match(/block_[a-z_]+/g) ?? []).filter((id) =>
      program.blocks.some((b) => b.id === id && (b.category ?? "strength") === "strength"),
    );
    return blockIds.length > 0 ? 1 : 0;
  });
  // wt.week is Mon..Sun already; matches our date order.
  const scheduled = strengthCountsPerDay.reduce((a, b) => a + b, 0);

  let completed = 0;
  const states = { green: 0, amber: 0, red: 0, unchecked: 0 };
  let prsHit = 0;
  let topLift: WeekSummary["training"]["topLift"] = null;
  let runsCount = 0;
  let totalKm = 0;
  let totalMinutes = 0;
  let rehabDays = 0;
  const signalCounts = { fatigueDaysHighOrElevated: 0, painDays: 0, externalLoadDays: 0, easyDays: 0 };
  const tmSeenAtStart = new Map<string, number>();
  const tmSeenAtEnd = new Map<string, number>();

  const bestByLift = new Map<string, { weight_kg: number; reps: number }>();

  for (const d of dates) {
    const day: DayLog | undefined = store.logs[d];
    if (!day) {
      if (d <= anchorDateISO) states.unchecked++;
      continue;
    }
    // Session complete if any exercise in a strength block is done that day.
    const anyStrengthDone = Object.entries(day.exercises).some(([key, e]) => {
      if (!e.done) return false;
      const blockId = key.split(":")[0];
      const b = program.blocks.find((x) => x.id === blockId);
      return (b?.category ?? "strength") === "strength";
    });
    if (anyStrengthDone) completed++;

    // State counts (only for days that have a check).
    if (day.derived_state === "green") states.green++;
    else if (day.derived_state === "amber") states.amber++;
    else if (day.derived_state === "red") states.red++;
    else if (d <= anchorDateISO) states.unchecked++;

    // Rehab adherence — any exercise in block_a_home done.
    if (Object.entries(day.exercises).some(([k, e]) => k.startsWith("block_a_home:") && e.done)) {
      rehabDays++;
    }

    // Endurance
    for (const r of day.runs ?? []) {
      runsCount++;
      if (r.distance_km) totalKm += r.distance_km;
      if (r.minutes) totalMinutes += r.minutes;
    }

    // Notes signals
    const sig = daySignals(day);
    if (sig.fatigue === "high" || sig.fatigue === "elevated") signalCounts.fatigueDaysHighOrElevated++;
    if (sig.pain) signalCounts.painDays++;
    if (sig.externalLoad) signalCounts.externalLoadDays++;
    if (sig.easy) signalCounts.easyDays++;

    // Best lift + PR count across TM lifts.
    for (const [key, entry] of Object.entries(day.exercises)) {
      const exId = key.split(":")[1];
      if (!TM_LIFT_IDS.has(exId)) continue;
      for (const s of entry.sets ?? []) {
        if (s.weight_kg == null || s.reps == null || s.weight_kg <= 0 || s.reps <= 0) continue;
        const prior = bestByLift.get(exId);
        // A "PR this week" is the heaviest set for that lift within these 7 days.
        if (!prior || s.weight_kg > prior.weight_kg) {
          bestByLift.set(exId, { weight_kg: s.weight_kg, reps: s.reps });
        }
        if (!topLift || s.weight_kg > topLift.weight_kg) {
          topLift = { exerciseId: exId, weight_kg: s.weight_kg, reps: s.reps, date: d };
        }
      }
    }
  }
  prsHit = bestByLift.size;

  // TM at start of week vs end — from training_maxes snapshot (best we can do
  // without a per-day snapshot). Report delta only if it changed vs same week
  // prior. Simplification: read current TMs. If we can, compare to the value
  // stored one week earlier; otherwise skip (we don't retain historical TMs).
  for (const [lift, tm] of Object.entries(store.training_maxes)) {
    tmSeenAtEnd.set(lift, tm);
    tmSeenAtStart.set(lift, tm); // Placeholder — no historical delta without snapshots.
  }
  const tmChanges: WeekSummary["training"]["tmChanges"] = [];

  const label = `Week of ${new Date(weekStart + "T00:00:00").toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  })}`;

  return {
    weekStart,
    weekEnd,
    label,
    sessions: {
      scheduled,
      completed,
      completionRatio: scheduled > 0 ? completed / scheduled : 0,
    },
    states,
    training: { prsHit, tmChanges, topLift },
    endurance: {
      runsCount,
      totalKm: Math.round(totalKm * 10) / 10,
      totalMinutes,
    },
    rehab: {
      daysWithBlockADone: rehabDays,
    },
    signals: signalCounts,
    hasAnyActivity:
      completed > 0 ||
      runsCount > 0 ||
      rehabDays > 0 ||
      states.green + states.amber + states.red > 0,
  };
}
