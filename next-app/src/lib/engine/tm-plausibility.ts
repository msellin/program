/**
 * Does a training max agree with what the user has actually lifted?
 *
 * Nothing checked. The founder's front-squat TM sat at 110 kg — identical to
 * his back-squat TM, and above the 1RM he could demonstrate — for as long as
 * it had existed. Every front squat prescription ran ~7% heavy, and the way
 * it surfaced was him going to a gym, working to a 115 single, missing 120,
 * and telling us. Meanwhile his back-squat TM was too LOW by about the same
 * margin in the other direction, which is why a "5+" top set came back at 9.
 *
 * The tell was that both squats sat at exactly 110: one had been copied from
 * the other, and it happened to be wrong in both directions at once.
 *
 * Two checks, deliberately narrow:
 *
 *   1. **Against the user's own log.** A TM is a working number, not a max —
 *      convention puts it at 85-90% of a true 1RM. A TM above the best single
 *      the log can evidence is unusable; one far below it silently caps every
 *      prescription.
 *   2. **Against a sibling lift.** Front squat is not back squat. A pair at
 *      an identical number is the signature of a copied value.
 *
 * This does NOT propose a new TM and does not change anything. It says "this
 * looks wrong, here is the arithmetic" and leaves the number alone — the same
 * confirm-first line every other engine surface holds. `evaluateOverperformer`
 * is what proposes an actual bump, and it needs green days and a performance
 * signal; this needs neither, because a TM above a demonstrated max is wrong
 * on the day it is entered.
 */

import type { Store, DayLog } from "../schemas";

export type TMFinding = {
  liftId: string;
  kind: "above_demonstrated" | "far_below_demonstrated" | "sibling_identical";
  /** One sentence, in the app's voice, naming the arithmetic. */
  message: string;
  currentTM: number;
  /** What the log supports, when the finding is log-derived. */
  suggestedTM?: number;
};

/**
 * Epley. Deliberately the same formula the rest of the engine uses, so a
 * number shown here cannot disagree with a number shown elsewhere.
 * Unreliable past ~12 reps, so those sets are ignored rather than
 * extrapolated.
 */
export function estimateOneRM(weightKg: number, reps: number): number | null {
  if (!(weightKg > 0) || !(reps > 0) || reps > 12) return null;
  return weightKg * (1 + reps / 30);
}

/** Convention: a training max sits at 85-90% of a true single. */
const TM_OF_1RM_HIGH = 0.95;
const TM_OF_1RM_LOW = 0.8;
const TM_TARGET = 0.9;

/**
 * Lift pairs that should not share a number, with the rough ratio of the
 * second to the first. Kept short and conventional on purpose — this exists
 * to catch a copied value, not to police anyone's programming.
 */
const SIBLINGS: Array<{ a: string; b: string; ratio: number; label: string }> = [
  { a: "back_squat_highbar", b: "front_squat", ratio: 0.85, label: "front squat is typically ~85% of back squat" },
];

/** Best e1RM the log can evidence for a lift, and the set that produced it. */
export function bestEstimatedOneRM(
  logs: Record<string, DayLog>,
  liftId: string,
): { e1rm: number; weightKg: number; reps: number; date: string } | null {
  let best: { e1rm: number; weightKg: number; reps: number; date: string } | null = null;
  for (const [date, day] of Object.entries(logs ?? {})) {
    for (const [key, entry] of Object.entries(day?.exercises ?? {})) {
      if (key.split(":")[1] !== liftId || !entry) continue;
      for (const s of entry.sets ?? []) {
        if (s.weight_kg == null || s.reps == null) continue;
        const e = estimateOneRM(s.weight_kg, s.reps);
        if (e == null) continue;
        if (!best || e > best.e1rm) best = { e1rm: e, weightKg: s.weight_kg, reps: s.reps, date };
      }
    }
  }
  return best;
}

const round = (n: number) => Math.round(n * 2) / 2;

export function checkTrainingMaxes(store: Store): TMFinding[] {
  const tms = store.training_maxes ?? {};
  const logs = store.logs ?? {};
  const out: TMFinding[] = [];

  for (const [liftId, tm] of Object.entries(tms)) {
    if (typeof tm !== "number" || tm <= 0) continue;
    const best = bestEstimatedOneRM(logs, liftId);
    if (!best) continue;

    if (tm > best.e1rm * TM_OF_1RM_HIGH) {
      out.push({
        liftId,
        kind: "above_demonstrated",
        currentTM: tm,
        suggestedTM: round(best.e1rm * TM_TARGET),
        message:
          `Your training max is ${tm} kg, but the heaviest set in your log — ` +
          `${best.weightKg} kg × ${best.reps} on ${best.date} — points to a single ` +
          `around ${round(best.e1rm)} kg. A training max is meant to sit near 90% of that.`,
      });
      continue;
    }

    if (tm < best.e1rm * TM_OF_1RM_LOW) {
      out.push({
        liftId,
        kind: "far_below_demonstrated",
        currentTM: tm,
        suggestedTM: round(best.e1rm * TM_TARGET),
        message:
          `Your training max is ${tm} kg, but ${best.weightKg} kg × ${best.reps} on ` +
          `${best.date} points to a single around ${round(best.e1rm)} kg. Every ` +
          `prescription is being calculated from a number well under what you have shown.`,
      });
    }
  }

  for (const pair of SIBLINGS) {
    const a = tms[pair.a];
    const b = tms[pair.b];
    if (typeof a !== "number" || typeof b !== "number" || a <= 0 || b <= 0) continue;
    if (a !== b) continue;
    out.push({
      liftId: pair.b,
      kind: "sibling_identical",
      currentTM: b,
      suggestedTM: round(a * pair.ratio),
      message:
        `Your ${pair.b.replace(/_/g, " ")} and ${pair.a.replace(/_/g, " ")} training maxes ` +
        `are both ${b} kg. That usually means one was copied — ${pair.label}.`,
    });
  }

  return out;
}
