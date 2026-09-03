/**
 * Test-day pacing plan for a fixed-distance erg test.
 *
 * `rowing-2k-test-prep` spent six weeks building fitness and then said, in
 * full: *"Full 2K. Warm-up + all-out effort + cool-down."* That is "go hard".
 * Meanwhile its progression tier sells **"split consistency across all four
 * 500s"** — which nothing programmed and nothing measured.
 *
 * A recreational rower who opens the first 500 four seconds under target
 * gives the whole block back between 1000m and 1500m. Pacing is the cheapest
 * seconds in the sport and the only ones that need no extra fitness.
 *
 * The plan is DERIVED, not authored. A pacing table written into the program
 * JSON would be the same number for a 6:30 rower and an 8:30 rower, which is
 * worse than nothing. This computes from the user's own baseline and their
 * tier's target, so the four numbers they see on test day are theirs.
 *
 * Deliberately not a coaching opinion machine: the shape below (small
 * negative-split-ish opener, honest middle, empty the tank) is the
 * conventional erg pacing model. It is stated in one place so it can be
 * argued with, rather than implied across six blocks.
 */

/** One 500m piece of the plan. */
export type SplitTarget = {
  /** 1-4 for a 2K. */
  piece: number;
  /** Metres covered by the end of this piece. */
  through_m: number;
  /** Target pace for this piece, seconds per 500m. */
  target_split_s: number;
  /** Target stroke rate, strokes per minute. */
  target_spm: number;
  /** What the user should be doing here, in one line. */
  cue: string;
};

export type RacePlan = {
  /** The 2K time this plan is built to hit, in seconds. */
  goal_total_s: number;
  /** Average 500m split that time requires. */
  goal_average_split_s: number;
  /** Where the goal came from, shown to the user. */
  basis: string;
  splits: SplitTarget[];
  /** Pre-decided response to going out too fast. */
  failure_branch: string;
};

/**
 * Pacing shape, as offsets from the goal average split (seconds per 500m).
 *
 * The opener is faster because the first strokes come from a standing catch
 * and are genuinely free speed — but only about a second and a half of it.
 * Beyond that the user is borrowing from the third 500, which is where
 * recreational 2Ks fall apart. The middle is where the discipline is; the
 * last piece is open.
 */
const SHAPE: Array<{ offset: number; spm: number; cue: string }> = [
  { offset: -1.5, spm: 30, cue: "Start high, settle by stroke 10. Do not chase the number." },
  { offset: +0.5, spm: 28, cue: "The hard part. Hold the split when it starts asking questions." },
  { offset: +0.5, spm: 28, cue: "Same split, same rate. This is the piece that decides the time." },
  { offset: -0.5, spm: 32, cue: "Empty it. Rate up over the last 300m." },
];

const round1 = (n: number) => Math.round(n * 10) / 10;

/**
 * Build a plan from a baseline time and a target improvement.
 *
 * `targetDeltaSeconds` is negative for an improvement, matching how
 * `retest_metrics.targets` express a `lower_is_better` goal.
 */
export function buildRacePlan(
  baselineTotalSeconds: number,
  targetDeltaSeconds: number,
  opts: { distanceM?: number; tierLabel?: string } = {},
): RacePlan | null {
  if (!Number.isFinite(baselineTotalSeconds) || baselineTotalSeconds <= 0) return null;
  const distance = opts.distanceM ?? 2000;
  const pieces = Math.round(distance / 500);
  if (pieces < 1) return null;

  const goalTotal = baselineTotalSeconds + targetDeltaSeconds;
  // A "target" that is slower than the baseline, or physically absurd, means
  // the inputs are wrong. Show nothing rather than a plan built on them.
  if (goalTotal <= 0 || goalTotal > baselineTotalSeconds) return null;

  const goalAvg = goalTotal / pieces;
  const splits: SplitTarget[] = [];
  for (let i = 0; i < pieces; i++) {
    const shape = SHAPE[Math.min(i, SHAPE.length - 1)];
    splits.push({
      piece: i + 1,
      through_m: (i + 1) * 500,
      target_split_s: round1(goalAvg + shape.offset),
      target_spm: shape.spm,
      cue: shape.cue,
    });
  }

  return {
    goal_total_s: round1(goalTotal),
    goal_average_split_s: round1(goalAvg),
    basis: opts.tierLabel
      ? `Your baseline ${formatSplit(baselineTotalSeconds)} minus your ${opts.tierLabel} target of ${Math.abs(targetDeltaSeconds)}s.`
      : `Your baseline ${formatSplit(baselineTotalSeconds)} minus ${Math.abs(targetDeltaSeconds)}s.`,
    splits,
    failure_branch:
      `If the first 500 comes in more than 2s/500m under ${round1(goalAvg + SHAPE[0].offset)}, ` +
      `do NOT hold it. Back to ${round1(goalAvg + 0.5)} and let the rate carry you. ` +
      `Decide this now — you will not decide it well at 1200m.`,
  };
}

/** mm:ss.s — the format an erg monitor shows. */
export function formatSplit(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds - m * 60;
  return `${m}:${s.toFixed(1).padStart(4, "0")}`;
}

/**
 * How evenly a completed test was paced — the thing the progression tier
 * promises ("split consistency across all four 500s") and which nothing
 * measured, because `row_2k_time_seconds` records only the total.
 *
 * Returns the spread between fastest and slowest piece in seconds per 500m.
 * Null when the user logged a total without splits, which is the common case
 * and must not be reported as perfect consistency.
 */
export function splitConsistencySpread(
  splits: Array<{ pace_500m_s?: number }> | undefined,
): number | null {
  const paces = (splits ?? [])
    .map((s) => s.pace_500m_s)
    .filter((p): p is number => typeof p === "number" && Number.isFinite(p));
  if (paces.length < 2) return null;
  return round1(Math.max(...paces) - Math.min(...paces));
}

/**
 * Plain-language read of a spread. Thresholds are coaching convention, not a
 * cited finding, and are stated here rather than scattered so they can be
 * argued with in one place.
 */
export function describeConsistency(spread: number | null): string | null {
  if (spread == null) return null;
  if (spread <= 1.5) return "Evenly paced — that is a well-executed test.";
  if (spread <= 3) return "Slightly uneven. There are seconds in tightening this up.";
  return "Uneven — the fast opener cost you more than it bought. Same fitness, better pacing, faster time.";
}
