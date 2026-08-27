import type { Store, ExerciseLog, Program } from "../schemas";
import { iso } from "../utils";

const MAIN_PHASE_IDS = new Set([
  "phase_2_cycle_1",
  "phase_3_cycle_2",
  "phase_4_cycles_3_4_test",
]);
const PEAK_PHASE_ID = "phase_6_peak_test";

/**
 * 5/3/1 percentage tables. Week index 0-based within the 4-week cycle.
 * Fix vs. old app: the old code clamped to week 4 (deload) from week 4 onwards,
 * so a phase spanning multiple cycles silently repeated deloads. Here we mod by 4.
 */
const CYCLE_PERCENTS = [
  { top: [65, 75, 85], topReps: ["5", "5", "5+"], fsl: 65 },
  { top: [70, 80, 90], topReps: ["3", "3", "3+"], fsl: 70 },
  { top: [75, 85, 95], topReps: ["5", "3", "1+"], fsl: 75 },
  { top: [40, 50, 60], topReps: ["5", "5", "5"], fsl: null },
] as const;

/**
 * Phase-6 peak-block percentages. Fix vs old app: peak phase was
 * running standard 5/3/1 percentages instead of the peak table.
 */
const PEAK_PERCENTS = [
  { top: [70, 80, 87.5], topReps: ["5", "5", "5"], fsl: 70, label: "peak week 1 (5RM)" },
  { top: [75, 85, 92], topReps: ["3", "3", "3"], fsl: 75, label: "peak week 2 (3RM)" },
  { top: [80, 90, 96], topReps: ["1", "1", "1"], fsl: null, label: "peak week 3 (1RM opener)" },
  { top: [40, 50, 60], topReps: ["5", "5", "5"], fsl: null, label: "peak week 4 (test/deload)" },
] as const;

/**
 * Legacy whitelist. Kept as a safety fallback for exercises that were
 * hardcoded before Phase A, so guest users with no training_maxes still get
 * autoreg on the canonical strength lifts.
 *
 * Phase A change: `isTMExercise` now returns true if EITHER the exercise is
 * in this list OR the user has a TM stored for it. This means adding a new
 * strength program is JSON only — no code change to expand the whitelist.
 * The former was the tightest scaling lock-in the architecture agent flagged.
 */
const LEGACY_TM_EXERCISES = new Set([
  "back_squat_highbar",
  "back_squat_ssb",
  "front_squat",
  "block_pull_midshin",
  "deadlift_conventional",
  "trap_bar_dl_blocks",
  "trap_bar_dl_floor",
]);

function isTMExercise(exId: string, store: Store): boolean {
  if (LEGACY_TM_EXERCISES.has(exId)) return true;
  return store.training_maxes[exId] != null && store.training_maxes[exId]! > 0;
}

// Half-UP rounding (not banker's) so 96.25 kg → 96.5, not surprising nudges to even.
// Also handles negative-zero cleanly.
const round = (v: number, step = 0.5) => {
  const scaled = v / step;
  const rounded = Math.floor(scaled + 0.5);
  return rounded * step;
};

export type Suggestion = {
  warmups?: { kg: number; reps: string }[];
  top_set: { kg: number; reps: string };
  fsl?: { kg: number; sets: number; reps: number } | null;
  state?: "green" | "amber" | "red" | null;
  reasoning: string;
  cap_applied?: boolean;
};

/**
 * Compute a concrete weight suggestion for an exercise on today's session.
 * Considers: current TM, prior logs for the same exercise, current phase,
 * cycle week (mod 4), and morning-check derived state.
 */
// Blocks whose scheme is a fixed moderate volume day — NOT a 5/3/1 top-set day.
// Suggest 65% × 5 for 5 sets (no top-set, no FSL) so the 48h-between-heavy-days
// invariant in program.json:weekly_template.principles is respected.
const VOLUME_BLOCKS = new Set(["block_squat_volume"]);
// Blocks whose scheme is a moderate variant day (65-75% TM).
const VARIANT_BLOCKS = new Set(["block_squat_variant"]);

// Concurrent Strength Maintenance uses fixed-percentage maintenance
// prescriptions rather than 5/3/1 cycles. Before this map, CSM strength
// days fell through to the autoreg-from-last-set path at 55% TM cold-
// start — silently voiding the JSON-authored "5×5 @ 75% TM" scheme.
// Comprehensive audit 2026-08-18 P0-5. Encoded per-block-per-pattern
// because Heavy uses different %s for squat vs pull. If CSM adds more
// strength blocks, extend here.
const MAINTENANCE_BLOCK_PCTS: Record<string, (exId: string) => number> = {
  block_strength_heavy: (exId) =>
    exId.includes("pull") || exId.includes("dl") || exId.includes("deadlift") ? 0.78 : 0.75,
  block_strength_moderate: () => 0.65,
};

export function suggestForExercise(
  exId: string,
  blockId: string,
  program: Program,
  store: Store,
  todayISO: string,
): Suggestion | null {
  if (!isTMExercise(exId, store)) return null;
  // An evaluation must not prescribe from the number it exists to set
  // (2026-08-27). The Friday squat evaluation was rendering "117.5 kg × 5
  // — 90% of your 130 kg training max": a target derived from the very TM
  // the session is meant to replace, and in this case a TM that is 26%
  // above the founder's best logged 5RM. Circular, and it reinforces the
  // wrong number at exactly the moment you are trying to correct it. The
  // block's own note carries the ramp instead.
  if (blockId.startsWith("block_eval")) return null;
  const tm = store.training_maxes[exId];
  if (tm == null || tm <= 0) return null;

  const phase = activePhase(program, todayISO);
  if (!phase) return null;

  // Symptom-state modifier. If today has no check saved, look back up to 3 days for
  // the most recent state — a red day on Friday should still colour Saturday's session
  // until the user records a new morning check.
  const todaysLog = store.logs[todayISO];
  let todayState: "green" | "amber" | "red" | null = todaysLog?.derived_state ?? null;
  let stateSourceDate: string | null = todayState ? todayISO : null;
  if (!todayState) {
    // Walk back up to 3 days looking for the most recent morning check
    const t = new Date(todayISO + "T00:00:00");
    for (let back = 1; back <= 3; back++) {
      const d = new Date(t);
      d.setDate(t.getDate() - back);
      const key = iso(d);
      const s = store.logs[key]?.derived_state;
      if (s) {
        todayState = s;
        stateSourceDate = key;
        break;
      }
    }
  }
  const stateMod =
    todayState === "red" ? 0.9 : todayState === "amber" ? 0.95 : 1.0;
  const carriedSuffix = stateSourceDate && stateSourceDate !== todayISO ? ` (from ${stateSourceDate})` : "";
  const stateNote =
    todayState === "red"
      ? ` ⚠ Red state${carriedSuffix} → load reduced 10%. Consider skipping and doing Extras only.`
      : todayState === "amber"
        ? ` ⚠ Amber state${carriedSuffix} → load reduced 5%. Hold, don't push.`
        : "";

  // User-accepted per-day adjustment (from the notes-signal proposal banner or manual).
  // Rehab / mobility exercises don't have TMs and never reach this code, so they
  // are therefore not scaled — hip-flexor consistency preserved by construction.
  const dayAdj = store.day_adjustments?.[todayISO]?.load_multiplier;
  const adjMod = typeof dayAdj === "number" && dayAdj > 0 ? dayAdj : 1.0;
  const combinedMod = stateMod * adjMod;
  const adjNote = adjMod !== 1
    ? ` User-confirmed adjustment: ×${adjMod.toFixed(2)} (${store.day_adjustments?.[todayISO]?.reason ?? "manual"}).`
    : "";

  // CSM maintenance strength days — fixed percentage, no cycle ramp.
  const maintPctFn = MAINTENANCE_BLOCK_PCTS[blockId];
  if (maintPctFn) {
    const pct = maintPctFn(exId);
    const kg = round(tm * pct * combinedMod);
    // Pull patterns run 5×3, everything else 5×5. Matches the JSON schemes
    // "5×5 @ 75% TM" for squat and "5×3 @ 78% TM" for pull at
    // concurrent-strength-maintenance.json:287-297.
    const isPull = exId.includes("pull") || exId.includes("dl") || exId.includes("deadlift");
    const repsStr = isPull ? "3" : "5";
    const repsNum = isPull ? 3 : 5;
    return {
      top_set: { kg, reps: repsStr },
      fsl: { kg, sets: 5, reps: repsNum },
      state: todayState,
      reasoning: `Maintenance day: 5×${repsStr} @ ${Math.round(pct * 100)}% TM, RPE cap 7.${stateNote}${adjNote}`,
    };
  }

  // Sat moderate volume — 65% TM × 5 for 5 sets. No top-set / FSL structure.
  if (VOLUME_BLOCKS.has(blockId)) {
    const kg = round(tm * 0.65 * combinedMod);
    return {
      top_set: { kg, reps: "5" },
      fsl: { kg, sets: 5, reps: 5 },
      state: todayState,
      reasoning: `Moderate volume day: 5×5 @ 65% TM${stateNote}${adjNote}`,
    };
  }
  // Thu front-squat variant — 70% TM × 5 for 5 sets on the variant lift.
  if (VARIANT_BLOCKS.has(blockId)) {
    const kg = round(tm * 0.7 * combinedMod);
    return {
      top_set: { kg, reps: "5" },
      fsl: { kg, sets: 5, reps: 5 },
      state: todayState,
      reasoning: `Variant day: 5×5 @ 70% TM${stateNote}${adjNote}`,
    };
  }

  // 5/3/1 main cycles
  if (MAIN_PHASE_IDS.has(phase.id)) {
    const week = cycleWeekIndex(phase.starts, todayISO);
    const pcts = CYCLE_PERCENTS[week % 4];
    const kg = pcts.top.map((p) => round((tm * p) / 100 * combinedMod));
    return {
      warmups: kg.slice(0, 2).map((w, i) => ({ kg: w, reps: pcts.topReps[i] })),
      top_set: { kg: kg[2], reps: pcts.topReps[2] },
      fsl: pcts.fsl
        ? { kg: round((tm * pcts.fsl) / 100 * combinedMod), sets: 5, reps: 5 }
        : null,
      state: todayState,
      reasoning: `${cycleLabelForPhase(phase.id)}, week ${(week % 4) + 1}. Top set: ${pcts.top[2]}% TM × ${pcts.topReps[2]}.${stateNote}${adjNote}`,
    };
  }

  // Peak phase — uses its own percentage table
  if (phase.id === PEAK_PHASE_ID) {
    const week = cycleWeekIndex(phase.starts, todayISO);
    const pcts = PEAK_PERCENTS[Math.min(3, week)];
    const kg = pcts.top.map((p) => round((tm * p) / 100 * combinedMod));
    return {
      warmups: kg.slice(0, 2).map((w, i) => ({ kg: w, reps: pcts.topReps[i] })),
      top_set: { kg: kg[2], reps: pcts.topReps[2] },
      fsl: pcts.fsl
        ? { kg: round((tm * pcts.fsl) / 100 * combinedMod), sets: 5, reps: 5 }
        : null,
      state: todayState,
      reasoning: `Peak phase — ${pcts.label}. Top set: ${pcts.top[2]}% TM × ${pcts.topReps[2]}.${stateNote}${adjNote}`,
    };
  }

  // Phase 1 (reintro/eval) or other — autoregulate from last logged set
  const last = findLastLoggedSet(store, exId, todayISO);
  const reintroCap = round(tm * 0.8);
  if (last) {
    const rpe = last.rpe ?? null;
    // RPE 9 now BACKS OFF instead of holding (2026-08-27).
    //
    // The ladder targets "RPE ~7" but had no rung below zero, so an
    // athlete who arrived at RPE 9 simply stayed there: hold, hold, hold.
    // The founder ran phase 1 at 115 kg for weeks at RPE 8/9/9/9/8, on a
    // block whose authored scheme reads "3-4 × 5 ramping empty bar to a
    // moderate 5 (RPE 6-7)". Two full RPE points above prescription, in a
    // rehab reintroduction phase, and the engine's only move was to hold.
    // His notes across those weeks read "very heavy", "no strength at just
    // parallel position", "had to go deep and bounce" — and then the groin
    // and buttock symptoms started.
    //
    // Backing off is not losing the progressive approach. It is what makes
    // progression possible: you cannot ramp from a weight you cannot
    // complete.
    let bump = 5;
    if (rpe != null) {
      if (rpe <= 5) bump = 10;
      else if (rpe <= 6) bump = 7.5;
      else if (rpe <= 7) bump = 5;
      else if (rpe <= 8) bump = 2.5;
      else bump = -5;
    }
    const rawNext = round(last.weight_kg + bump);
    // The 80% TM reintro cap only applies while the athlete is still UNDER it.
    // Once they've demonstrated tolerance above the cap, we no longer clamp them back down
    // (that would violate "never lose the progressive approach").
    // Escaping the reintro cap requires TOLERANCE, not merely having gone
    // heavier once. The old test was `weight >= cap`, so a single hard
    // session above 80% TM disabled the cap permanently — and the cap was
    // 104 kg while the founder climbed to 115+. "Demonstrated tolerance"
    // has to mean the set was actually manageable; at RPE 9 it was not,
    // and the cap should still be doing its job.
    const alreadyAboveCap = last.weight_kg >= reintroCap && (rpe == null || rpe <= 8);
    const beforeStateMod = alreadyAboveCap ? rawNext : Math.min(rawNext, reintroCap);
    const capApplied = !alreadyAboveCap && rawNext > reintroCap;
    const suggested = round(beforeStateMod * combinedMod);
    // Assemble reasoning as clean sentences, no awkward concat.
    const parts: string[] = [];
    parts.push(`Last ${last.date}: ${last.weight_kg} kg × ${last.reps} @ RPE ${rpe ?? "?"}.`);
    if (bump < 0) {
      parts.push(`Back off ${Math.abs(bump)} kg — last set was RPE ${rpe}, and this block asks for 6-7.`);
    } else if (bump === 0) {
      parts.push("Hold weight (no headroom).");
    } else {
      parts.push(`Bump ${bump > 0 ? "+" : ""}${bump} kg to target RPE ~7.`);
    }
    if (capApplied) {
      parts.push(`Capped at 80% TM = ${reintroCap} kg (reintro).`);
    } else if (alreadyAboveCap && rawNext > reintroCap) {
      parts.push("Above the reintro cap — the cap no longer applies.");
    }
    if (stateNote) parts.push(stateNote.trim());
    if (adjNote) parts.push(adjNote.trim());
    return {
      top_set: { kg: suggested, reps: "5" },
      state: todayState,
      cap_applied: capApplied,
      reasoning: parts.join(" "),
    };
  }

  // Cold start — no prior log
  const cold = round(tm * 0.55 * combinedMod);
  return {
    top_set: { kg: cold, reps: "5" },
    state: todayState,
    reasoning: `No prior log. Start moderate: ~55% TM. Ramp in fives from empty bar to ${cold} kg.${stateNote}${adjNote}`,
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

function cycleWeekIndex(phaseStart: string, todayISO: string) {
  const start = new Date(phaseStart + "T00:00:00");
  const today = new Date(todayISO + "T00:00:00");
  const days = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(0, Math.floor(days / 7));
}

function cycleLabelForPhase(phaseId: string): string {
  if (phaseId === "phase_2_cycle_1") return "Cycle 1";
  if (phaseId === "phase_3_cycle_2") return "Cycle 2";
  if (phaseId === "phase_4_cycles_3_4_test") return "Cycle 3/4";
  return phaseId;
}

function findLastLoggedSet(
  store: Store,
  exId: string,
  todayISO: string,
): { date: string; weight_kg: number; reps: number; rpe: number | null } | null {
  const dates = Object.keys(store.logs).sort().reverse();
  for (const d of dates) {
    // The day's suggestion is an anchor value computed at day-start from PRIOR
    // sessions. Once the user logs a set today, we do NOT want the same-day
    // suggestion to shift under them — otherwise a light warm-up feel at RPE 5
    // rewrites the day's headline recommendation upward mid-workout, and the
    // user loses the "what was I supposed to hit today" reference. Within-
    // session next-set autoreg is a separate concern that a future component
    // can compute directly from today's logged sets.
    if (d >= todayISO) continue;
    const day = store.logs[d];
    for (const [key, entry] of Object.entries(day.exercises)) {
      if (!key.endsWith(":" + exId)) continue;
      const rec = entry as ExerciseLog;
      if (rec.sets && rec.sets.length) {
        // Take the heaviest set with positive weight
        const heaviest = [...rec.sets]
          .filter((s) => s.weight_kg != null && s.weight_kg > 0 && s.reps != null && s.reps > 0)
          .sort((a, b) => (b.weight_kg ?? 0) - (a.weight_kg ?? 0))[0];
        if (heaviest && heaviest.weight_kg != null && heaviest.reps != null) {
          return {
            date: d,
            weight_kg: heaviest.weight_kg,
            reps: heaviest.reps,
            rpe: heaviest.rpe ?? null,
          };
        }
      }
      if (rec.weight_kg != null && rec.reps != null) {
        return {
          date: d,
          weight_kg: rec.weight_kg,
          reps: rec.reps,
          rpe: rec.rpe ?? null,
        };
      }
    }
  }
  return null;
}

/**
 * Infer a TM from a single set using Epley with RPE-adjusted reps in reserve.
 * TM = 0.85 × est 1RM, clamped to sane range and (if a current TM is provided)
 * to at most +30 kg over current so a typo of 500 kg doesn't propose a 425 kg TM.
 */
export function inferTMFromSet(
  weight: number,
  reps: number,
  rpe?: number | null,
  currentTM?: number | null,
): { est1RM: number; suggestedTM: number; maxReps: number; rir: number; clamped?: boolean } | null {
  if (!weight || !reps || weight <= 0 || reps <= 0) return null;
  if (weight > 500 || reps > 50) return null; // implausible entry, ignore

  const rir = rpe != null && rpe >= 1 && rpe <= 10 ? Math.max(0, 10 - rpe) : 0;
  const maxReps = reps + rir;
  const est1RM = weight * (1 + maxReps / 30);
  let suggestedTM = round(est1RM * 0.85);

  // Clamp: absolute upper bound
  const ABS_MAX_TM = 400;
  let clamped = false;
  if (suggestedTM > ABS_MAX_TM) {
    suggestedTM = ABS_MAX_TM;
    clamped = true;
  }
  // Relative clamp — no more than +30 kg vs current TM per single-set inference.
  // Big jumps must come from cycle-end evaluation, not one typo.
  if (currentTM != null && currentTM > 0) {
    const maxJump = currentTM + 30;
    if (suggestedTM > maxJump) {
      suggestedTM = maxJump;
      clamped = true;
    }
  }

  return { est1RM: round(est1RM), suggestedTM, maxReps, rir, clamped };
}
