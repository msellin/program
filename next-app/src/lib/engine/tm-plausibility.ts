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
 * Three checks, deliberately narrow:
 *
 *   1. **Against the user's own log.** A TM is a working number, not a max —
 *      convention puts it at 85-90% of a true 1RM. A TM above the best single
 *      the log can evidence is unusable; one far below it silently caps every
 *      prescription.
 *   2. **Against a failed attempt.** Added 2026-09-03. Every other signal in
 *      the log is a lower bound — evidence of what someone CAN do, silent
 *      about what they cannot. A miss is the only upper bound there is, and
 *      until sets could carry `failed` this function had to guess a ceiling
 *      it could not see. The founder's missed 122 sat in a free-text note.
 *   3. **Against a sibling lift.** Front squat is not back squat. A pair at
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
  kind:
    | "above_demonstrated"
    | "far_below_demonstrated"
    | "sibling_identical"
    | "above_failed_attempt";
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
  // A single IS the one-rep max. Epley's formula gives w × (1 + 1/30) at one
  // rep, inflating it by 3.3%, and that error runs the wrong way for this
  // check: it raises the bar a TM has to clear before anything is said.
  //
  // Found on real data. The founder's front squat ladder tops at a 115 single
  // with a failed 120. Epley called that 118.8, which put his 110 kg TM at
  // 92.6% of "1RM" — inside the band, silent. Against the actual 115 it is
  // 95.7%, which is the flag. The bug hid the very case the check was written
  // for.
  if (reps === 1) return weightKg;
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

/**
 * Best evidence of a one-rep max in the log, and the set that produced it.
 *
 * Takes the HIGHER of a measured top single and the best multi-rep estimate,
 * because both are lower bounds on capability and the least-wrong answer is
 * the larger one.
 *
 * This was briefly "a measured single always wins", on the reasoning that a
 * single is a measurement and Epley is a guess about it. The founder's own
 * ladder disproved it within the hour. He worked to 115×1 and then attempted
 * 122 — so 115 was not his max, it was the last rung he made, and his true
 * single sits somewhere in [115, 122). Epley reads his 110×2 as 117.3, right
 * inside that window. Treating the 115 as a measured ceiling understated him
 * and made the check fire on a training max that is defensible.
 *
 * A top single is still worth preferring over a LOWER estimate — someone who
 * works up to a real single has given you a number better than an
 * extrapolation from fives. It just cannot be treated as a ceiling, because
 * the log has no idea what they failed afterwards.
 *
 * A single only counts at all when it is heavier than every multi-rep set for
 * that lift; otherwise a 60 kg warm-up opener would drag the estimate down.
 */
export function bestEstimatedOneRM(
  logs: Record<string, DayLog>,
  liftId: string,
): { e1rm: number; weightKg: number; reps: number; date: string } | null {
  let bestEstimate: { e1rm: number; weightKg: number; reps: number; date: string } | null = null;
  let topSingle: { weightKg: number; date: string } | null = null;
  let heaviestMultiRep = 0;

  for (const [date, day] of Object.entries(logs ?? {})) {
    for (const [key, entry] of Object.entries(day?.exercises ?? {})) {
      if (key.split(":")[1] !== liftId || !entry) continue;
      for (const s of entry.sets ?? []) {
        if (s.weight_kg == null || s.reps == null) continue;
        const e = estimateOneRM(s.weight_kg, s.reps);
        if (e == null) continue;
        if (s.reps === 1) {
          if (!topSingle || s.weight_kg > topSingle.weightKg) topSingle = { weightKg: s.weight_kg, date };
        } else if (s.weight_kg > heaviestMultiRep) {
          heaviestMultiRep = s.weight_kg;
        }
        if (!bestEstimate || e > bestEstimate.e1rm) {
          bestEstimate = { e1rm: e, weightKg: s.weight_kg, reps: s.reps, date };
        }
      }
    }
  }

  const singleCounts = topSingle && topSingle.weightKg >= heaviestMultiRep;
  if (singleCounts && (!bestEstimate || topSingle!.weightKg > bestEstimate.e1rm)) {
    return { e1rm: topSingle!.weightKg, weightKg: topSingle!.weightKg, reps: 1, date: topSingle!.date };
  }
  return bestEstimate;
}

/**
 * The lightest load this lift has been FAILED at, and when.
 *
 * A failed attempt is the only entry in the log that bounds a one-rep max
 * from above. Everything else — a made single, an Epley estimate off a set
 * of five — is a lower bound: evidence of what someone can do, silent about
 * what they cannot. The founder's ladder is the canonical case. He made 115
 * and missed 122, so his true single sits in [115, 122). Before this, the
 * log could see the 115 and had no idea the 122 existed.
 *
 * `since` is the date of the best MADE lift, and only failures on or after
 * it count. Without that, a miss on a bad day two years ago would cap every
 * estimate forever — the ceiling has to be able to move when the person
 * does. Ties (failed and made on the same day) count: that is precisely the
 * ladder case, where both numbers come from one session.
 *
 * The LIGHTEST failure is the binding one. Missing 122 and later missing
 * 130 does not raise the ceiling to 130; you still have not lifted 122.
 */
export function bestFailedAttempt(
  logs: Record<string, DayLog>,
  liftId: string,
  since?: string,
): { weightKg: number; date: string } | null {
  let lightest: { weightKg: number; date: string } | null = null;
  for (const [date, day] of Object.entries(logs ?? {})) {
    if (since && date < since) continue;
    for (const [key, entry] of Object.entries(day?.exercises ?? {})) {
      if (key.split(":")[1] !== liftId || !entry) continue;
      for (const s of entry.sets ?? []) {
        if (s.failed !== true || s.weight_kg == null || s.weight_kg <= 0) continue;
        if (!lightest || s.weight_kg < lightest.weightKg) {
          lightest = { weightKg: s.weight_kg, date };
        }
      }
    }
  }
  return lightest;
}

/**
 * How far under a failed load the true max is assumed to sit.
 *
 * Missing 122 means the max is below 122, not at 121.9. A single increment
 * of the smallest plate pair is the least-assuming gap that is still
 * strictly below the failure, and it keeps the arithmetic in numbers the
 * user recognises from their own bar.
 */
const FAILURE_MARGIN_KG = 2.5;

const round = (n: number) => Math.round(n * 2) / 2;

export function checkTrainingMaxes(store: Store): TMFinding[] {
  const tms = store.training_maxes ?? {};
  const logs = store.logs ?? {};
  const out: TMFinding[] = [];

  for (const [liftId, tm] of Object.entries(tms)) {
    if (typeof tm !== "number" || tm <= 0) continue;
    const best = bestEstimatedOneRM(logs, liftId);
    // Only failures at or after the best made lift bound anything — see
    // `bestFailedAttempt`. With no made lift to date from, every failure
    // counts, because there is nothing for a stale one to be stale against.
    const failed = bestFailedAttempt(logs, liftId, best?.date);

    // A training max at or above a load the user could not lift once needs
    // no estimate and no convention to be wrong, so it is checked before
    // anything Epley has an opinion about. A TM is a working weight meant
    // for repeated sets; if a single at that load did not go up, every
    // prescription derived from it is fiction.
    if (failed && tm >= failed.weightKg) {
      out.push({
        liftId,
        kind: "above_failed_attempt",
        currentTM: tm,
        suggestedTM: round((failed.weightKg - FAILURE_MARGIN_KG) * TM_TARGET),
        message:
          `Your training max is ${tm} kg, and you missed ${failed.weightKg} kg on ` +
          `${failed.date}. A training max is a weight you work with, not one you ` +
          `are reaching for — it should sit near 90% of a single you can actually make.`,
      });
      continue;
    }

    if (!best) continue;

    // The failed load caps what the log can be read as evidence FOR. Epley
    // off a high-rep set overshoots badly — 100 kg × 10 reads as 133 — and
    // an overshoot here is silence, not a false alarm: it raises the number
    // a TM has to clear before the check says anything. A miss is the one
    // entry that can pull it back down.
    const ceiling = failed ? failed.weightKg - FAILURE_MARGIN_KG : null;
    const e1rm = ceiling != null ? Math.min(best.e1rm, ceiling) : best.e1rm;
    const cappedByFailure = ceiling != null && ceiling < best.e1rm;

    if (tm > e1rm * TM_OF_1RM_HIGH) {
      out.push({
        liftId,
        kind: "above_demonstrated",
        currentTM: tm,
        suggestedTM: round(e1rm * TM_TARGET),
        message:
          `Your training max is ${tm} kg, but the heaviest set in your log — ` +
          `${best.weightKg} kg × ${best.reps} on ${best.date} — points to a single ` +
          `around ${round(e1rm)} kg` +
          (cappedByFailure ? `, and you missed ${failed!.weightKg} kg on ${failed!.date}` : "") +
          `. A training max is meant to sit near 90% of that.`,
      });
      continue;
    }

    if (tm < e1rm * TM_OF_1RM_LOW) {
      out.push({
        liftId,
        kind: "far_below_demonstrated",
        currentTM: tm,
        suggestedTM: round(e1rm * TM_TARGET),
        message:
          `Your training max is ${tm} kg, but ${best.weightKg} kg × ${best.reps} on ` +
          `${best.date} points to a single around ${round(e1rm)} kg. Every ` +
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
