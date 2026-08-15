import type { Store, Program, DayLog, Milestone } from "../schemas";
import { inferTMFromSet } from "./suggest";
import { iso } from "../utils";

// Legacy fallback: these phase IDs run cycle-end eval even if the program
// JSON was authored before the `runs_cycle_end_eval` field existed. New
// programs should set the flag explicitly on each 4-week 5/3/1 phase.
// Non-cycle phases (reintro, Hatch, peak, post-goal continue) do NOT run this.
const LEGACY_CYCLE_END_ELIGIBLE_PHASES = new Set([
  "phase_2_cycle_1",
  "phase_3_cycle_2",
  "phase_4_cycles_3_4_test",
]);

/**
 * The adaptive engine — pure functions taking (store, program, today) and
 * returning suggested changes. Never mutates. Never touches the DOM.
 * Callers decide whether to apply the recommendations.
 */

const round = (v: number, step = 0.5) => Math.round(v / step) * step;

// ---- cycle-end evaluation ----

export type CycleEvaluation = {
  phaseId: string;
  cycleWeek: number;
  daysLogged: number;
  worstState: "green" | "amber" | "red";
  stateCounts: { green: number; amber: number; red: number };
  amrapPerformances: { lift: string; date: string; weight: number; reps: number; expected: number; over: number }[];
  recommendation: TMAdjustment[];
  reasoning: string;
};

export type TMAdjustment = {
  lift: string;
  currentTM: number;
  newTM: number;
  delta: number;
  reason: string;
};

/**
 * Called after a 4-week cycle. Reads the last 4 weeks of logs, examines
 * top-set AMRAP performance vs expected, and combines with symptom state.
 *
 * SCOPE: this evaluator is 5/3/1-shaped. It assumes a 4-week wave with a
 * week-3 AMRAP top set that produces the primary signal for TM adjustment.
 * Do NOT enable `runs_cycle_end_eval: true` on programs whose strength
 * blocks don't follow this shape:
 *   - Concurrent-Strength-Maintenance: strength is HELD, not progressed.
 *     A green cycle here would silently propose +5 kg every 4 weeks against
 *     the program's explicit "no PRs" positioning.
 *   - Engine Builder / Rowing 2K: aerobic-primary; no wave structure.
 *   - Handstand-walk / Overhead-mobility: skill / mobility, not TM-driven.
 *
 * Skill programs use TierAdvanceProposal (tier-promotion.ts) instead.
 * Non-5/3/1 strength programs need a per-metric phase-end evaluator that
 * reads retest metrics (deferred — see B3 design in
 * dev/audits/tier-promotion-design.md item M).
 */
export function evaluateCycleEnd(
  program: Program,
  store: Store,
  todayISO: string,
): CycleEvaluation | null {
  const phase = activePhase(program, todayISO);
  if (!phase) return null;

  // Only fire in phases that actually run a 4-week 5/3/1 cycle. Prefer the
  // program-declared flag; fall back to the legacy phase-ID whitelist for
  // programs authored before the field existed.
  const eligible = phase.runs_cycle_end_eval === true || LEGACY_CYCLE_END_ELIGIBLE_PHASES.has(phase.id);
  if (!eligible) return null;

  const start = new Date(phase.starts + "T00:00:00");
  const today = new Date(todayISO + "T00:00:00");
  const daysIn = Math.floor((today.getTime() - start.getTime()) / 864e5);
  // Fire the banner during the deload week (days 21-27 of any 4-week cycle) AND
  // the boundary day (day 28 = end of cycle / start of next). Off-by-one on the
  // boundary day was the "banner disappears on Sun morning" bug — fixed here.
  const dayInCycle = daysIn === 0 ? 0 : ((daysIn - 1) % 28) + 1; // 1..28, or 0 if daysIn==0
  if (dayInCycle < 21) return null;
  const cycleWeek = 3; // if we got here we're in the review window

  // Aggregate the last 28 days
  const cutoff = new Date(today.getTime() - 27 * 864e5);
  const cutoffISO = iso(cutoff);
  const cycleDays: DayLog[] = Object.values(store.logs).filter((d) => d.date >= cutoffISO);
  if (cycleDays.length < 4) return null; // not enough data

  const stateCounts = { green: 0, amber: 0, red: 0 };
  cycleDays.forEach((d) => {
    if (d.derived_state) stateCounts[d.derived_state]++;
  });
  const worstState: "green" | "amber" | "red" =
    stateCounts.red > 0 ? "red" : stateCounts.amber > 0 ? "amber" : "green";

  // Find AMRAP week-3 top-set performances vs 5/3/1 expected reps
  const amrapPerformances: CycleEvaluation["amrapPerformances"] = [];
  for (const d of cycleDays) {
    const dDate = new Date(d.date + "T00:00:00");
    const dDays = Math.floor((dDate.getTime() - start.getTime()) / 864e5);
    const dWeek = Math.floor(dDays / 7) % 4;
    if (dWeek !== 2) continue; // week 3 in 0-indexed
    for (const [key, entry] of Object.entries(d.exercises)) {
      const exId = key.split(":")[1];
      const tm = store.training_maxes[exId];
      if (!tm) continue;
      // heaviest set
      const heaviest = pickHeaviest(entry);
      if (!heaviest) continue;
      const expected = 1; // week-3 top set is 1+
      const over = heaviest.reps - expected;
      if (over >= 0) {
        amrapPerformances.push({
          lift: exId,
          date: d.date,
          weight: heaviest.weight_kg,
          reps: heaviest.reps,
          expected,
          over,
        });
      }
    }
  }

  // Build a set of lifts that were actually TRAINED during the cycle (had any logged set).
  // We only recommend TM changes for lifts the user touched.
  const trainedLifts = new Set<string>();
  for (const d of cycleDays) {
    for (const [key, entry] of Object.entries(d.exercises)) {
      if (!entry || !entry.done) continue;
      const exId = key.split(":")[1];
      const hasWork =
        (entry.sets && entry.sets.some((s) => s.weight_kg && s.reps)) ||
        (entry.weight_kg != null && entry.reps != null);
      if (hasWork) trainedLifts.add(exId);
    }
  }

  // TM adjustment logic
  const recommendation: TMAdjustment[] = [];
  const isSquat = (id: string) => id.includes("squat");

  for (const [lift, currentTM] of Object.entries(store.training_maxes)) {
    // Skip lifts that weren't trained during the cycle — no data, no recommendation.
    if (!trainedLifts.has(lift)) continue;

    let newTM = currentTM;
    let reason = "";

    const perf = amrapPerformances.find((a) => a.lift === lift);
    if (perf && perf.over >= 6) {
      const inferred = inferTMFromSet(perf.weight, perf.reps, null, currentTM);
      if (inferred) {
        newTM = round(Math.max(currentTM + 10, inferred.suggestedTM));
        reason = `Crushed week-3 AMRAP (${perf.reps} reps at ${perf.weight} kg, target 1+). Big bump to inferred TM.`;
      }
    } else if (perf && perf.over >= 3 && worstState !== "red") {
      newTM = currentTM + (isSquat(lift) ? 7.5 : 10);
      reason = `Strong AMRAP (${perf.reps} vs 1+). Bumping.`;
    } else if (worstState === "green") {
      newTM = currentTM + (isSquat(lift) ? 5 : 7.5);
      reason = "Green cycle. Standard +5 (squat) / +7.5 (pull).";
    } else if (worstState === "amber") {
      reason = "Amber week detected. Hold TM, repeat cycle.";
    } else {
      newTM = round(currentTM * 0.9);
      reason = "Red state during cycle. TM -10% for next cycle.";
    }

    if (newTM !== currentTM) {
      recommendation.push({
        lift,
        currentTM,
        newTM,
        delta: round(newTM - currentTM),
        reason,
      });
    }
  }

  return {
    phaseId: phase.id,
    cycleWeek,
    daysLogged: cycleDays.length,
    worstState,
    stateCounts,
    amrapPerformances,
    recommendation,
    reasoning:
      worstState === "green" && recommendation.length
        ? "Cycle finished clean. Recommend TM bump per 5/3/1 rules."
        : worstState === "amber"
          ? "One or more amber weeks. Hold TMs, repeat the cycle."
          : worstState === "red"
            ? "Red days present. Drop TMs by 10% and consider a physio check."
            : "No changes recommended.",
  };
}

// ---- pause / resume detection ----

export type PauseResumeSignal = {
  gapDays: number;
  lastLogDate: string | null;
  recommendation: "none" | "calibration";
  reasoning: string;
};

/**
 * Called on every hydration. If there's a gap of ≥ 14 days since the last
 * logged session, recommend a calibration mini-cycle.
 */
export function detectPauseResume(store: Store, todayISO: string): PauseResumeSignal {
  const dates = Object.keys(store.logs).sort().reverse();
  const lastWithActivity = dates.find((d) => {
    const day = store.logs[d];
    return (
      d !== todayISO &&
      (Object.values(day.exercises).some((e) => e.done) || day.symptoms != null)
    );
  });
  if (!lastWithActivity) {
    return {
      gapDays: 0,
      lastLogDate: null,
      recommendation: "none",
      reasoning: "No prior log — no pause to detect.",
    };
  }
  const last = new Date(lastWithActivity + "T00:00:00");
  const today = new Date(todayISO + "T00:00:00");
  const gap = Math.floor((today.getTime() - last.getTime()) / 864e5);
  if (gap < 14) {
    return {
      gapDays: gap,
      lastLogDate: lastWithActivity,
      recommendation: "none",
      reasoning: `Only ${gap} days since last session. No calibration needed.`,
    };
  }
  return {
    gapDays: gap,
    lastLogDate: lastWithActivity,
    recommendation: "calibration",
    reasoning: `You've been away ${gap} days. Suggest a 2-week calibration mini-cycle: week 1 reintro at 60-70% previous TM, week 2 5RM test to reset TM.`,
  };
}

// ---- waypoint acceleration ----

export type WaypointStatus = {
  beatenEarly: {
    lift: string;
    milestone: Milestone;
    currentTM: number;
    weeksEarly: number;
  }[];
  recommendation: "none" | "accelerate";
  reasoning: string;
};

export function assessWaypoints(
  program: Program,
  store: Store,
  todayISO: string,
): WaypointStatus {
  const goals = program.goals as Record<string, unknown> | undefined;
  const targets = goals?.progression_targets as
    | { milestones?: Milestone[] }
    | undefined;
  if (!targets?.milestones) {
    return { beatenEarly: [], recommendation: "none", reasoning: "No milestones defined." };
  }
  const now = new Date(todayISO + "T00:00:00");
  const beatenEarly: WaypointStatus["beatenEarly"] = [];
  // Only count each lift's FARTHEST beaten milestone — otherwise a lift that's ahead
  // by two cycles shows up twice in the banner. One "you're ahead on X" per lift.
  const bestByLift = new Map<string, WaypointStatus["beatenEarly"][number]>();
  for (const m of targets.milestones) {
    const currentTM = store.training_maxes[m.lift];
    if (currentTM == null) continue;
    if (currentTM < m.target_tm_kg) continue;
    const mDate = new Date(m.date + "T12:00:00");
    const daysAhead = Math.floor((mDate.getTime() - now.getTime()) / 864e5);
    if (daysAhead > 28) {
      const entry = {
        lift: m.lift,
        milestone: m,
        currentTM,
        weeksEarly: Math.round(daysAhead / 7),
      };
      const existing = bestByLift.get(m.lift);
      if (!existing || entry.weeksEarly > existing.weeksEarly) {
        bestByLift.set(m.lift, entry);
      }
    }
  }
  beatenEarly.push(...bestByLift.values());
  return {
    beatenEarly,
    recommendation: beatenEarly.length ? "accelerate" : "none",
    reasoning: beatenEarly.length
      ? `Ahead of plan on ${beatenEarly.length} lift${beatenEarly.length > 1 ? "s" : ""} — TMs beat their farthest dated target by 4+ weeks. Consider stretching subsequent targets forward.`
      : "No lifts ahead of plan by more than 4 weeks yet.",
  };
}

// ---- helpers ----

function activePhase(program: Program, todayISO: string) {
  return (
    program.phases.find(
      (p) => todayISO >= p.starts && (p.ends == null || todayISO <= p.ends),
    ) ?? program.phases[program.phases.length - 1]
  );
}

function pickHeaviest(
  entry: DayLog["exercises"][string],
): { weight_kg: number; reps: number; rpe: number | null } | null {
  let best: { weight_kg: number; reps: number; rpe: number | null } | null = null;
  const consider = (w: number | null | undefined, r: number | null | undefined, rpe: number | null | undefined) => {
    if (w == null || r == null || w <= 0 || r <= 0) return;
    if (!best || w > best.weight_kg) best = { weight_kg: w, reps: r, rpe: rpe ?? null };
  };
  if (entry.sets) {
    for (const s of entry.sets) consider(s.weight_kg, s.reps, s.rpe);
  }
  consider(entry.weight_kg, entry.reps, entry.rpe);
  return best;
}
