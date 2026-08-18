import type { Store, Program, ExerciseLog } from "../schemas";
import { iso } from "../utils";

/**
 * Reintro-graduation detector.
 *
 * During Phase 1 (rebuild + evaluate) the plan holds the athlete at ≤ 80% TM
 * with RPE cap 7. Once he's clearing the cap at RPE ≤ 7 across multiple sessions
 * with no red/amber days in between, he's mechanically ready for Phase 2.
 *
 * This function only PROPOSES; the UI banner shows the result and the user
 * decides whether to skip the remainder of Phase 1 (via existing skip/move
 * flows or a future explicit "advance phase" action).
 */

const TM_EXERCISES = [
  "back_squat_highbar",
  "back_squat_ssb",
  "front_squat",
  "block_pull_midshin",
  "deadlift_conventional",
  "trap_bar_dl_blocks",
  "trap_bar_dl_floor",
] as const;

export type ReadinessResult =
  | {
      ready: true;
      evidence: ReadinessEvidence[];
      /**
       * Transparency payload — added 2026-08-18 per founder observation
       * that the proposal card showed 2 dates without saying whether more
       * qualifying sessions existed or how many were skipped for
       * intensity/RPE reasons. Card renders these so the rule is
       * legible: "2 most recent qualifying · N non-qualifying skipped
       * in between."
       */
      qualifyingSessionsWalked: number;
      nonQualifyingSessionsSkipped: number;
      windowStartDate: string;
    }
  | { ready: false; reason?: string };

export type ReadinessEvidence = {
  date: string;
  exerciseId: string;
  weightKg: number;
  reps: number;
  rpe: number | null;
  reintroCap: number;
  pctTM: number;
};

/**
 * Returns `ready:true` when the last two logged strength sessions each contained
 * a working set that (a) exceeded the 80% TM reintro cap and (b) was RPE ≤ 7,
 * with no red/amber morning-check states in the window.
 *
 * Called by `ReadinessProposal` on Today; nothing else mutates state.
 */
export function assessReintroReadiness(
  store: Store,
  program: Program,
  todayISO: string,
): ReadinessResult {
  // Only relevant while the active phase is Phase 1.
  const phase = program.phases.find(
    (p) => todayISO >= p.starts && (p.ends == null || todayISO <= p.ends),
  );
  if (!phase || phase.id !== "phase_1_rebuild_evaluate") {
    return { ready: false, reason: "not in reintro phase" };
  }

  // Walk backwards through log dates, collecting qualifying strength sessions.
  const dates = Object.keys(store.logs).filter((d) => d <= todayISO).sort().reverse();
  const found: ReadinessEvidence[] = [];
  const sessionsSeen = new Set<string>();
  let nonQualifyingSkipped = 0;

  for (const d of dates) {
    if (found.length >= 2) break;
    const day = store.logs[d];
    if (!day) continue;
    // Any red/amber check between the qualifying sessions is disqualifying.
    if (day.derived_state === "red" || day.derived_state === "amber") {
      return { ready: false, reason: `red/amber day on ${d}` };
    }
    let dayHadStrengthWork = false;
    let dayQualified = false;
    for (const [key, entry] of Object.entries(day.exercises)) {
      const exId = key.split(":")[1];
      if (!TM_EXERCISES.includes(exId as (typeof TM_EXERCISES)[number])) continue;
      const tm = store.training_maxes[exId];
      if (!tm) continue;
      dayHadStrengthWork = true;
      const cap = tm * 0.8;
      const rec = entry as ExerciseLog;
      const sets = rec.sets ?? [];
      // Pick the heaviest set that also has RPE ≤ 7 (or no RPE — treat unknown as pass).
      const qualifying = sets
        .filter((s) => s.weight_kg != null && s.weight_kg > cap)
        .filter((s) => s.rpe == null || s.rpe <= 7)
        .sort((a, b) => (b.weight_kg ?? 0) - (a.weight_kg ?? 0))[0];
      if (qualifying && qualifying.weight_kg != null && qualifying.reps != null) {
        if (sessionsSeen.has(d)) continue;
        sessionsSeen.add(d);
        dayQualified = true;
        found.push({
          date: d,
          exerciseId: exId,
          weightKg: qualifying.weight_kg,
          reps: qualifying.reps,
          rpe: qualifying.rpe ?? null,
          reintroCap: Math.round(cap * 10) / 10,
          pctTM: Math.round((qualifying.weight_kg / tm) * 1000) / 10,
        });
        break; // one qualifying exercise per day is enough
      }
    }
    // Track strength-work days that DIDN'T qualify — audit 2026-08-18
    // transparency for the ProposalCard.
    if (dayHadStrengthWork && !dayQualified) nonQualifyingSkipped++;
  }

  if (found.length >= 2) {
    const windowStartDate = found[found.length - 1]?.date ?? todayISO;
    return {
      ready: true,
      evidence: found,
      qualifyingSessionsWalked: found.length,
      nonQualifyingSessionsSkipped: nonQualifyingSkipped,
      windowStartDate,
    };
  }
  return { ready: false, reason: `only ${found.length}/2 qualifying sessions` };
}

/** Convenience: today string helper for callers that don't want to import twice. */
export function todayIso(): string {
  return iso(new Date());
}
