import type { Store } from "../schemas";
import { bestEstimatedOneRM, bestFailedAttempt } from "./tm-plausibility";

/**
 * How a training max came to hold the value it holds.
 *
 * A TM used to be a bare number, and nothing recorded whether it was measured,
 * typed, or ratcheted there by accepted proposals. That matters more than it
 * sounds: the same 112.5 means something different coming from a single lifted
 * last week than from eight green-day increments since anyone last measured
 * anything — and only one of those two is evidence.
 */
export type TMSource = "manual" | "test" | "bump" | "cycle" | "intake";

/** Sources the ENGINE chose. These must clear the bounds; a person may override. */
const AUTOMATED: ReadonlySet<TMSource> = new Set(["bump", "cycle"]);

/**
 * How far above an ESTIMATED 1RM a training max must sit before we call it
 * implausible.
 *
 * Not a convention — it is the estimator's own error bar. The meta-analytic
 * standard error of submaximal 1RM estimation is 9.8% (95% CI 7.4-12.2%):
 * Greig et al. 2023, Sports Medicine, PMID 37493929, verified 2026-09-07. For
 * lower-body lifts specifically it is worse (Reynolds 2006, SEE 16.16 kg).
 *
 * So a TM sitting 5% above an Epley estimate tells you nothing: it is inside
 * the noise of the instrument. Flagging there would be the same error this
 * codebase made with shoulder flexion — reporting the measurement error back
 * to the user as a finding. We use the upper end of Greig's CI, because being
 * slow to complain about a plausible number is cheaper than crying wolf about
 * one.
 */
const ESTIMATE_TOLERANCE = 1.12;

export type TMViolation = {
  kind: "above_failed_attempt" | "far_above_estimate" | "out_of_range";
  message: string;
  /** The value the bound permits, where the bound is a real ceiling. */
  ceilingKg?: number;
  /**
   * True when this rests on arithmetic over the log rather than on a 1RM
   * prediction equation. Only hard bounds block an automated write.
   */
  hard: boolean;
};

export type TMWriteVerdict = { ok: boolean; violations: TMViolation[] };

/**
 * Can this training max be written, and by whom?
 *
 * Two kinds of claim live in `tm-plausibility`, and this is the file that
 * refuses to treat them alike.
 *
 *   HARD — "you failed 122 on this date". Your 1RM is below 122; a TM at or
 *   above it is impossible, not merely unlikely. Arithmetic over the log, no
 *   citation needed, and it blocks the engine.
 *
 *   SOFT — "your 5×5 implies a single around 134". This runs through a
 *   prediction equation carrying ~10% standard error, which is LARGER than the
 *   6-7% discrepancies that motivated this whole mechanism. It warns; it never
 *   blocks, and nothing in this file ever SETS a TM from an estimate. Greig's
 *   own conclusion is that "practitioners should incorporate direct assessment
 *   of 1RM wherever possible" — the honest response to a bad TM is to measure,
 *   not to infer harder.
 *
 * Note what is deliberately NOT a bound: the heaviest weight in the log.
 * `tm-plausibility` worked this out already — a user who works up to 115 and
 * then misses 122 has a true single somewhere in [115, 122), so the heaviest
 * MADE lift is a floor under the 1RM, not a ceiling over it. Treating it as a
 * ceiling understates anyone who stopped before failing.
 *
 * The asymmetry between sources is the point. A person typing a number their
 * log contradicts is making a choice, and it is theirs; we record it. The
 * ENGINE proposing one is a defect. On 2026-09-07 the adaptive path proposed
 * raising a front-squat TM for a user who had maxed 115 at RPE 10 six days
 * earlier, nothing consulted the bounds, and it was accepted.
 */
export function validateTMWrite(
  store: Store,
  exerciseId: string,
  kg: number,
  source: TMSource,
): TMWriteVerdict {
  const violations: TMViolation[] = [];
  const logs = store.logs ?? {};

  if (!Number.isFinite(kg) || kg <= 0 || kg > 500) {
    return {
      ok: false,
      violations: [
        {
          kind: "out_of_range",
          hard: true,
          message: `${kg} kg is outside the range a training max can take.`,
        },
      ],
    };
  }

  const failed = bestFailedAttempt(logs, exerciseId);
  if (failed && kg >= failed.weightKg) {
    violations.push({
      kind: "above_failed_attempt",
      hard: true,
      ceilingKg: failed.weightKg,
      message:
        `A training max of ${kg} kg is at or above ${failed.weightKg} kg, which you ` +
        `missed on ${failed.date}. A training max has to sit under a weight you have ` +
        `failed, not on top of it.`,
    });
  }

  const est = bestEstimatedOneRM(logs, exerciseId);
  if (est && kg > est.e1rm * ESTIMATE_TOLERANCE) {
    violations.push({
      kind: "far_above_estimate",
      hard: false,
      message:
        `A training max of ${kg} kg is more than 12% above the single your log ` +
        `implies (${Math.round(est.e1rm)} kg, from ${est.weightKg} × ${est.reps} on ` +
        `${est.date}). That estimate carries about 10% error of its own, so this is a ` +
        `prompt to measure rather than a verdict.`,
    });
  }

  const blocking = violations.filter((v) => v.hard);
  return { ok: blocking.length === 0 || !AUTOMATED.has(source), violations };
}
