import type { Program, Store } from "../schemas";
import { inferTier, type InferredTier } from "./intake-tier";
import { evaluateRetestMetrics, type RetestValue } from "./retest-evaluator";

/**
 * Multi-tier promotion mechanic. Reuses the intake tier-inference evaluator on
 * the user's UPDATED capability values (from retests) to detect eligibility
 * for a higher tier. Confirm-first: this module never mutates — it only
 * reports what's eligible. The store action `promoteTier` performs the change
 * once the user Accepts.
 *
 * Only fires for programs with `plan_tiers[]` defined (skill programs today).
 */

export type NextTierResult = {
  tier_id: string;
  tier_index: number;
  rationale: string;
  vars_hash: string;
} | null;

/**
 * Return the next tier the user's current capability profile qualifies for.
 * Null if:
 *  - program has no plan_tiers
 *  - user isn't on a tier yet
 *  - inferred highest-matching tier isn't strictly above the stored tier
 */
export function nextEligibleTier(
  program: Program,
  profile: Store["user_profile"] | undefined,
): NextTierResult {
  const tiers = program.plan_tiers;
  if (!tiers?.length) return null;
  const slug = program.slug;
  if (!slug) return null;
  const state = profile?.program_states?.[slug];
  if (!state?.tier) return null;
  const currentIdx = tiers.findIndex((t) => t.id === state.tier);
  if (currentIdx < 0) return null;

  const capability = profile?.capability_profile ?? {};
  const capabilityValues: Record<string, number> = {};
  for (const [testId, cap] of Object.entries(capability)) {
    if (typeof cap?.measured_value === "number") {
      capabilityValues[testId] = cap.measured_value;
    }
  }

  const inferred: InferredTier | null = inferTier(
    program,
    slug,
    (state.intake_answers ?? {}) as Record<string, string>,
    capabilityValues,
  );
  if (!inferred) return null;
  const nextIdx = tiers.findIndex((t) => t.id === inferred.tier_id);
  if (nextIdx <= currentIdx) return null;

  return {
    tier_id: inferred.tier_id,
    tier_index: nextIdx,
    rationale: inferred.rationale ?? "",
    vars_hash: hashCapability(capabilityValues),
  };
}

/**
 * Filter the program's retest metrics down to those that are DUE — the
 * user's `last_measured_at` on the corresponding capability is older than
 * `cadence_weeks * 7` days, or was never recorded post-intake.
 */
export function dueRetestMetrics(
  program: Program,
  store: Store,
  todayISO: string,
  userTierId?: string,
): RetestValue[] {
  const all = evaluateRetestMetrics(program, store, userTierId);
  const capability = store.user_profile?.capability_profile ?? {};
  const slug = program.slug;
  const startedRaw = slug
    ? store.user_profile?.program_states?.[slug]?.started_at
    : undefined;
  const startedISO = startedRaw ? startedRaw.slice(0, 10) : null;
  const now = new Date(todayISO + "T00:00:00").getTime();
  if (!Number.isFinite(now)) return [];

  return all.filter((m) => {
    if (!m.supported) return false;
    const cadence = m.cadence_weeks;
    if (typeof cadence !== "number" || cadence <= 0) return false;
    // Prefer per-capability last_measured_at; fall back to program start.
    const testId = m.metric_id;
    const lastCap = capability[testId]?.last_measured_at;
    const anchor = lastCap ?? startedISO;
    if (!anchor) return false;
    const anchorMs = new Date(anchor.slice(0, 10) + "T00:00:00").getTime();
    if (!Number.isFinite(anchorMs)) return false;
    const days = Math.floor((now - anchorMs) / 864e5);
    return days >= cadence * 7;
  });
}

function hashCapability(vals: Record<string, number>): string {
  const keys = Object.keys(vals).sort();
  return keys.map((k) => `${k}:${Math.round(vals[k] * 100)}`).join("|");
}

export function isProposalDismissed(
  program: Program,
  profile: Store["user_profile"] | undefined,
  proposal: NonNullable<NextTierResult>,
): boolean {
  const slug = program.slug;
  if (!slug) return false;
  const stored = profile?.program_states?.[slug]?.tier_proposal_dismissed_for;
  if (!stored) return false;
  return stored === `${proposal.tier_id}@${proposal.vars_hash}`;
}
