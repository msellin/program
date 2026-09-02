import type { Symptoms } from "./schemas";
import { SYMPTOM_REGIONS } from "./symptom-regions";

export type CheckState = "green" | "amber" | "red";

/**
 * The safety gate. Central and audited on purpose.
 *
 * Programs declare WHICH regions feed this (`symptom_regions[]`); they do not
 * declare how lenient it is. Every program authors a `progression_rules.states[]`
 * ladder with its own thresholds — `first-strict-pullup` reds at >6 where this
 * reds at >5 — and none of it was ever read. Making those live would put nine
 * independently-authored, unreviewed threshold sets on the one decision that
 * tells someone not to train, several of them laxer than this. One audited rule
 * citing Kellmann 2010 is the stronger position, and it is the same reasoning
 * behind confirm-first: the engine proposes, it does not quietly decide.
 *
 * The peak now runs over every scored region present rather than four hardcoded
 * hip fields, so an elbow at 7/10 raises red for a pull-up user the same way a
 * groin at 7/10 does for the hip program.
 */
export function peakRegionScore(s: Symptoms): { value: number; regionId: string | null } {
  let value = 0;
  let regionId: string | null = null;
  for (const r of SYMPTOM_REGIONS) {
    const v = (s as Record<string, unknown>)[r.id];
    if (typeof v === "number" && v > value) {
      value = v;
      regionId = r.id;
    }
  }
  return { value, regionId };
}

export function deriveState(s: Symptoms): CheckState {
  const { value: peak } = peakRegionScore(s);
  const life = s.life_load ?? 0;
  if (
    s.night_pain ||
    s.gait_change ||
    (s.click_present && s.click_painful) ||
    peak > 5 ||
    life >= 8
  ) {
    return "red";
  }
  if (peak >= 4 || (s.morning_stiffness_min ?? 0) > 30 || life >= 5) {
    return "amber";
  }
  return "green";
}

/**
 * The "why" line. Names the threshold that fired, and now names the region that
 * fired it — previously it could only say "a symptom score", because with four
 * hardcoded fields there was nothing useful to name.
 */
export function reasonForState(s: Symptoms, state: CheckState): string {
  const { value: peak, regionId } = peakRegionScore(s);
  const label = regionId
    ? SYMPTOM_REGIONS.find((r) => r.id === regionId)?.short ?? null
    : null;
  const life = s.life_load ?? 0;
  const stiff = s.morning_stiffness_min ?? 0;

  if (state === "red") {
    if (s.night_pain) return "Red flag: night pain woke you.";
    if (s.gait_change) return "Red flag: gait change (shortened stride).";
    if (s.click_present && s.click_painful) return "Red flag: painful clicking.";
    if (peak > 5) return label ? `${label} is above 5/10.` : "A symptom score is above 5/10.";
    if (life >= 8) return "Life load is at the ceiling — cooked.";
    return "A red-flag signal fired.";
  }
  if (state === "amber") {
    if (peak >= 4) return label ? `${label} is between 4-5/10.` : "A symptom score is between 4-5/10.";
    if (stiff > 30) return "Morning stiffness over 30 minutes.";
    if (life >= 5) return "Life load in the middle-high range.";
    return "A threshold crossed to amber.";
  }
  return "Progress load — nothing above 3/10 and no flags.";
}
