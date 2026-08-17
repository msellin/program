import type { Store, Program, DayLog, Milestone } from "../schemas";
import { inferTMFromSet } from "./suggest";
import { iso } from "../utils";
import { daySignals } from "./note-signals";

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
    const rpeStat = averageTopSetRPE(cycleDays, lift);

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
      // RPE-aware green-cycle adjustment. RPE-averaged over top sets across
      // the cycle tells us whether the current TM is at ceiling (RPE ≥ 9 —
      // hold) or has room (RPE ≤ 7 — bigger bump). Silently uses the default
      // path when RPE isn't logged (opt-in only).
      if (rpeStat && rpeStat.count >= 2 && rpeStat.avg >= 9) {
        // Hold — the user is already grinding at RPE 9+, adding weight will
        // just erase the AMRAP quality next cycle. Same rule powerlifting
        // coaches use: bar speed / RPE trumps calendar-based bumps.
        reason = `Green cycle, but avg top-set RPE ${rpeStat.avg.toFixed(1)} (${rpeStat.count} sessions). Hold TM — no headroom.`;
      } else if (rpeStat && rpeStat.count >= 2 && rpeStat.avg <= 7) {
        // Extra headroom — RPE ≤ 7 across the cycle means the user has real
        // margin. Bump by 1.5× the standard step.
        const bump = isSquat(lift) ? 7.5 : 10;
        newTM = currentTM + bump;
        reason = `Green cycle, avg top-set RPE ${rpeStat.avg.toFixed(1)} (${rpeStat.count} sessions). Bigger bump — headroom detected.`;
      } else {
        newTM = currentTM + (isSquat(lift) ? 5 : 7.5);
        reason = rpeStat
          ? `Green cycle, avg top-set RPE ${rpeStat.avg.toFixed(1)}. Standard +5 (squat) / +7.5 (pull).`
          : "Green cycle. Standard +5 (squat) / +7.5 (pull).";
      }
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

// ---- overperformer (A1) ----

/**
 * A1 (2026-08-17). The off-cycle overperformer TM-bump proposal.
 *
 * Persona-strength gap surfaced in the 2026-08-17 audit: 30 green days + 4
 * "felt strong" notes produced ZERO day_adjustments because the engine was
 * one-directional (soften-only via `proposedLoadMultiplier`). This rule adds
 * the missing "raise" path.
 *
 * Distinct from `evaluateCycleEnd` — that fires at the tail of a 5/3/1 cycle
 * against AMRAP performance. This fires OFF-cycle, based purely on green-state
 * streak + easy-signal notes. Both are cited to the same progression
 * literature (Rhea 2003 meta on strength dose-response).
 *
 * Confirm-first: the rule proposes; the user Accepts via TMBumpProposal.
 */

export type TMBumpProposal = {
  kind: "tm_bump";
  lifts: {
    exerciseId: string;
    currentTM: number;
    newTM: number;
    delta: number;
  }[];
  triggers: string[];
  reason: string;
};

// Phases where a bump is wrong regardless of streak — reintro caps loads at
// 80% TM by design, and any "hip" phase is rehab-adjacent.
function isReintroOrRehabPhase(phaseId: string | undefined): boolean {
  if (!phaseId) return false;
  const p = phaseId.toLowerCase();
  return p.includes("reintro") || p.includes("rehab") || p.includes("hip");
}

// Squat pattern lifts get a smaller bump (heavier absolute load). Pull /
// press / deadlift patterns get the larger step. Matches evaluateCycleEnd's
// isSquat heuristic exactly.
function bumpFor(exerciseId: string): number {
  return exerciseId.includes("squat") ? 2.5 : 5;
}

/**
 * Does this program declare a strength-progression surface? Checked by shape
 * (program JSON has `training_maxes.starting_values_kg`) rather than by
 * slug-blacklist. Any future strength arc that declares TMs gets A1 without
 * a code change; aerobic / skill / mobility / test-prep programs stay out.
 *
 * Fixed post-flow-review 2026-08-17. The prior slug blacklist left A1
 * eligible on exactly ONE catalog program (anterior-hip-rebuild), which is
 * `personal: true` and hidden from the catalog — meaning A1 fired for zero
 * beta users. Concurrent Strength Maintenance was collateral damage.
 */
function hasStrengthProgression(program: Program): boolean {
  const tms = program.training_maxes as Record<string, unknown> | undefined;
  return Boolean(tms && tms.starting_values_kg);
}

export function evaluateOverperformer(
  program: Program,
  store: Store,
  todayISO: string,
): TMBumpProposal | null {
  // Guard: program must declare a strength-progression surface.
  if (!hasStrengthProgression(program)) return null;
  const tms = store.training_maxes ?? {};
  if (Object.keys(tms).length === 0) return null;

  // Guard: not in a reintro / rehab phase.
  const phase = activePhase(program, todayISO);
  if (isReintroOrRehabPhase(phase?.id)) return null;

  // Look at the last 7 days of logs.
  const today = new Date(todayISO + "T00:00:00");
  const cutoff = new Date(today.getTime() - 6 * 864e5);
  const cutoffISO = iso(cutoff);
  const recent = Object.values(store.logs)
    .filter((d) => d.date >= cutoffISO && d.date <= todayISO)
    .sort((a, b) => a.date.localeCompare(b.date));
  if (recent.length < 3) return null;

  // Green-streak check — the last 3 logged days with derived_state must be
  // all green. Days without derived_state break the streak (we can't tell).
  const stated = recent.filter((d) => d.derived_state);
  if (stated.length < 3) return null;
  const last3 = stated.slice(-3);
  if (!last3.every((d) => d.derived_state === "green")) return null;

  // Easy-signal check — at least one recent day carries a "felt strong" /
  // "felt easy" / "grooved" cue. daySignals already folds day.notes +
  // exercise notes + set notes into `.easy`.
  const easyDays = recent.filter((d) => daySignals(d).easy);
  if (easyDays.length === 0) return null;

  // Which lifts to bump? Ones the user actually trained in the last 7 days
  // with logged working sets AND has a TM for.
  const trainedTMLifts = new Set<string>();
  for (const d of recent) {
    for (const [key, entry] of Object.entries(d.exercises)) {
      if (!entry || !entry.done) continue;
      const exId = key.split(":")[1];
      if (!tms[exId]) continue;
      const worked =
        (entry.sets && entry.sets.some((s) => s.weight_kg && s.reps)) ||
        (entry.weight_kg != null && entry.reps != null);
      if (worked) trainedTMLifts.add(exId);
    }
  }
  if (trainedTMLifts.size === 0) return null;

  // Cap the bump surface to the two heaviest-loaded lifts. Bumping every TM
  // on the same day is high-commitment and reads as pushy.
  const ranked = Array.from(trainedTMLifts)
    .map((id) => ({ id, tm: tms[id] }))
    .sort((a, b) => b.tm - a.tm)
    .slice(0, 2);

  const lifts = ranked.map(({ id, tm }) => {
    const delta = bumpFor(id);
    return { exerciseId: id, currentTM: tm, newTM: round(tm + delta), delta };
  });

  const triggers = [
    "3 straight green days",
    easyDays.length > 1 ? `${easyDays.length} "felt strong" notes` : "'felt strong' in a recent note",
  ];

  const liftNames = lifts.map((l) => l.exerciseId).join(", ");
  const reason =
    `${triggers[0]} and ${triggers[1]}. The engine reads that as headroom — ` +
    `nudging ${liftNames} up ${lifts.map((l) => `+${l.delta} kg`).join(" / ")}. ` +
    `Small step; if it feels heavy next session, you can Ignore the next one and reset.`;

  return {
    kind: "tm_bump",
    lifts,
    triggers,
    reason,
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

/**
 * Average top-set RPE for a given lift across a set of cycle days.
 * Only counts sessions where the top set has a numeric RPE (0-10 range).
 * Returns { avg, count } or null if fewer than 1 session has RPE data.
 *
 * The engine treats this as an opt-in signal — users who don't log RPE
 * preserve the existing (RPE-agnostic) TM adjustment behavior exactly.
 */
export function averageTopSetRPE(
  cycleDays: DayLog[],
  liftId: string,
): { avg: number; count: number } | null {
  let sum = 0;
  let count = 0;
  for (const d of cycleDays) {
    for (const [key, entry] of Object.entries(d.exercises)) {
      const exId = key.split(":")[1];
      if (exId !== liftId) continue;
      if (!entry.done) continue;
      const top = pickHeaviest(entry);
      if (!top || top.rpe == null) continue;
      if (top.rpe < 0 || top.rpe > 10) continue;
      sum += top.rpe;
      count += 1;
    }
  }
  if (count < 1) return null;
  return { avg: sum / count, count };
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
