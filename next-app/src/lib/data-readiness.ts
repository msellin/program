/**
 * How close the beta is to having enough logged history to answer a
 * data-gated question honestly.
 *
 * Written for S4. The F5 correlation view is gated on "90+ days of real log
 * data from beta users", and the locked M3 trigger reads "25 users × 90 days"
 * — but nothing could evaluate either. A threshold nobody can measure is, in
 * `completions.ts`'s phrase, a guess wearing a number. Two separate advisory
 * reviews independently landed on the same point: the founder cannot tell
 * whether the trigger has fired.
 *
 * It also answers the narrower gates that are already live — F2 Phase B's
 * "30 days", and the ≥2-baselines the non-responder classifier needs.
 *
 * Privacy
 * -------
 * Counts only, matching `completions.ts`: no user ids, no per-user rows, no
 * dates that could pin an individual. The output is a threshold table — how
 * MANY users clear each bar — which is exactly what a trigger needs and
 * nothing more. A per-user list would answer the same question while making
 * the response re-identifying at beta scale.
 *
 * The symptom-variance counts matter more than the day counts. A user who
 * answers "None" for ninety consecutive days contributes no information about
 * how load relates to symptoms while inflating every day-based total; a
 * trigger counting days alone can fire on a dataset with no variance in the
 * thing being explained.
 */

/** Day thresholds reported, chosen to cover the gates that actually exist. */
export const DAY_THRESHOLDS = [30, 60, 90, 120, 180] as const;

/** How many days at a non-zero symptom score before a user's series has spread. */
export const NONZERO_SYMPTOM_THRESHOLDS = [5, 15, 30] as const;

export type ReadinessReport = {
  users_total: number;
  /** Users with at least one logged day. */
  users_with_any_log: number;
  /** users[] clearing each day threshold, by kind of day. */
  logged_days: Array<{ min_days: number; users: number }>;
  checked_days: Array<{ min_days: number; users: number }>;
  /** Days carrying a symptom score above zero — the variance that a correlation needs. */
  nonzero_symptom_days: Array<{ min_days: number; users: number }>;
  /** Longest first-to-last span any single user has, in days. */
  max_span_days: number;
  /**
   * Share of days inside a user's span that carry a completed check, averaged
   * over users with any check. Rounded to a percentage. A low figure means the
   * day counts above overstate how continuous the record is.
   */
  mean_check_completion_pct: number | null;
};

type RawDay = {
  symptoms?: Record<string, unknown> | null;
  exercises?: Record<string, unknown>;
  runs?: unknown[];
};

const SCORE_EXCLUDED = new Set([
  "night_pain",
  "gait_change",
  "click_present",
  "click_painful",
  "morning_stiffness_min",
  "life_load",
  "outside_training",
  "scale_version",
]);

/** True when any region score on this check is above zero. */
function hasNonzeroSymptom(symptoms: Record<string, unknown> | null | undefined): boolean {
  if (!symptoms) return false;
  for (const [key, value] of Object.entries(symptoms)) {
    if (SCORE_EXCLUDED.has(key)) continue;
    if (typeof value === "number" && value > 0) return true;
  }
  return false;
}

function daysBetween(firstISO: string, lastISO: string): number {
  const a = Date.parse(firstISO + "T00:00:00Z");
  const b = Date.parse(lastISO + "T00:00:00Z");
  if (!Number.isFinite(a) || !Number.isFinite(b)) return 0;
  return Math.round((b - a) / 86_400_000) + 1;
}

/**
 * Pure aggregation over raw `user_states.state` blobs, exported so it can be
 * tested without a database — the same separation `completions.ts` documents,
 * for the same reason: importing a Pages Function from a test drags
 * `functions/` into the Next app's tsconfig scope and breaks the build.
 */
export function tallyReadiness(states: unknown[]): ReadinessReport {
  const perUser: Array<{
    logged: number;
    checked: number;
    nonzero: number;
    span: number;
  }> = [];

  for (const raw of states) {
    const logs = (raw as { logs?: Record<string, RawDay> })?.logs;
    if (!logs || typeof logs !== "object") {
      perUser.push({ logged: 0, checked: 0, nonzero: 0, span: 0 });
      continue;
    }
    const dates = Object.keys(logs).sort();
    let logged = 0;
    let checked = 0;
    let nonzero = 0;
    for (const date of dates) {
      const day = logs[date];
      if (!day) continue;
      const trained =
        Object.keys(day.exercises ?? {}).length > 0 || (day.runs?.length ?? 0) > 0;
      const hasCheck = day.symptoms != null;
      if (trained || hasCheck) logged += 1;
      if (hasCheck) checked += 1;
      if (hasNonzeroSymptom(day.symptoms)) nonzero += 1;
    }
    const span = dates.length ? daysBetween(dates[0], dates[dates.length - 1]) : 0;
    perUser.push({ logged, checked, nonzero, span });
  }

  const clearing = (pick: (u: (typeof perUser)[number]) => number, thresholds: readonly number[]) =>
    thresholds.map((min_days) => ({
      min_days,
      users: perUser.filter((u) => pick(u) >= min_days).length,
    }));

  const withChecks = perUser.filter((u) => u.checked > 0 && u.span > 0);
  const meanCompletion = withChecks.length
    ? Math.round(
        (withChecks.reduce((acc, u) => acc + u.checked / u.span, 0) / withChecks.length) * 100,
      )
    : null;

  return {
    users_total: perUser.length,
    users_with_any_log: perUser.filter((u) => u.logged > 0).length,
    logged_days: clearing((u) => u.logged, DAY_THRESHOLDS),
    checked_days: clearing((u) => u.checked, DAY_THRESHOLDS),
    nonzero_symptom_days: clearing((u) => u.nonzero, NONZERO_SYMPTOM_THRESHOLDS),
    max_span_days: perUser.reduce((acc, u) => Math.max(acc, u.span), 0),
    mean_check_completion_pct: meanCompletion,
  };
}
