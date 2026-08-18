/**
 * A5 (Phase 3). Consolidated proposal selector.
 *
 * Reads every proposal source the engine has today and returns a sorted array
 * of `Proposal` payloads ready for `<ProposalCard>` to render. Pure function
 * — no store mutation, no DOM.
 *
 * Sources absorbed:
 *   - readiness.ts assessReintroReadiness → readiness_after_layoff
 *   - note-signals.ts daySignals + proposedLoadMultiplier → day_adjustment_soften
 *   - tier-promotion.ts nextEligibleTier → tier_advance
 *   - adapt.ts evaluateOverperformer → tm_bump
 *
 * Priority ordering (higher = more urgent, shown at top):
 *   100  day_adjustment (pain flagged) — safety
 *    80  day_adjustment (fatigue) — engine-cited
 *    60  readiness_after_layoff — opportunistic exit from rehab reintro
 *    40  tier_advance — earned progression
 *    30  tm_bump — off-cycle bump
 */

import type {
  Program,
  Store,
  Proposal,
  DayAdjustmentProposalPayload,
  ReadinessProposalPayload,
  TierAdvanceProposalPayload,
  TMBumpProposalPayload,
  NonResponderProposalPayload,
} from "@/lib/schemas";
import { daySignals, proposedLoadMultiplier } from "@/lib/engine/note-signals";
import { assessReintroReadiness } from "@/lib/engine/readiness";
import { nextEligibleTier, isProposalDismissed } from "@/lib/engine/tier-promotion";
import { evaluateOverperformer } from "@/lib/engine/adapt";
import { classify } from "@/lib/engine/non-responder-classifier";
import { citationIdForKind } from "@/lib/engine/proposal-citations";
import { iso, today as todayISO } from "@/lib/utils";

/**
 * Bug #1 fix (flow-review 2026-08-17): the ONLY signal that a life-load slider
 * value the user just tapped in onboarding is not enough evidence to propose
 * a soften. A first-time user who picks 7 on the LifeLoadStep and lands on
 * Today should NOT see "Apply 10% lighter today?" as their first-ever engine
 * message.
 *
 * Real signals need at least one of:
 *   - a logged exercise or run today
 *   - a non-empty note today
 *   - a symptom field other than life_load today
 *   - ANY signal-producing state on the two prior days
 *
 * A bare `life_load` on an otherwise empty day is baseline calibration, not
 * evidence. The proposal reappears the moment any of the above kicks in.
 */
function todayHasOnlyLifeLoadSeed(store: Store, date: string): boolean {
  const day = store.logs[date];
  if (!day) return false;
  const sym = day.symptoms;
  if (!sym || sym.life_load == null) return false;
  const otherSymptomField = (Object.keys(sym) as Array<keyof typeof sym>).some(
    (k) => k !== "life_load" && sym[k] != null && sym[k] !== 0 && sym[k] !== false,
  );
  if (otherSymptomField) return false;
  if ((day.notes ?? "").trim().length > 0) return false;
  if ((day.runs ?? []).length > 0) return false;
  const hasExerciseWork = Object.values(day.exercises ?? {}).some(
    (ex) => ex.done || (ex.sets && ex.sets.length > 0) || (ex.notes ?? "").trim().length > 0,
  );
  if (hasExerciseWork) return false;
  return true;
}

function selectDayAdjustment(store: Store, date: string): DayAdjustmentProposalPayload | null {
  // Already accepted? Not a proposal any more.
  if (store.day_adjustments?.[date]) return null;

  // Look at today + the 2 prior days for a signal.
  let sig = daySignals(store.logs[date]);
  const todayIsLifeLoadOnly = todayHasOnlyLifeLoadSeed(store, date);
  if (!(sig.fatigue === "high" || sig.pain)) {
    const t = new Date(date + "T00:00:00");
    for (let back = 1; back <= 2 && sig.matches.length === 0; back++) {
      const d = new Date(t);
      d.setDate(t.getDate() - back);
      sig = daySignals(store.logs[iso(d)]);
    }
  }
  const proposal = proposedLoadMultiplier(sig);
  if (!proposal) return null;

  // Bug #1 fix: if the ONLY thing today has is a life-load value AND no prior
  // signal contributed, we're looking at an onboarding-fresh user. Suppress.
  if (todayIsLifeLoadOnly) {
    const priorSignalPresent = sig.matches.length > 0 && sig !== daySignals(store.logs[date]);
    if (!priorSignalPresent) return null;
  }

  const id = `day-adj:load-${proposal.multiplier}`;
  const dismissed = store.dismissed_proposals?.[date] ?? [];
  if (dismissed.includes(`load-${proposal.multiplier}`)) return null;

  return {
    kind: "day_adjustment_soften",
    id,
    priority: sig.pain ? 100 : 80,
    reason: proposal.reason,
    citationId: citationIdForKind("day_adjustment_soften"),
    date,
    multiplier: proposal.multiplier,
    matches: sig.matches,
  };
}

function selectReadiness(
  store: Store,
  program: Program,
  date: string,
): ReadinessProposalPayload | null {
  const result = assessReintroReadiness(store, program, date);
  if (!result.ready) return null;

  const dismissed = store.dismissed_proposals?.[date] ?? [];
  if (dismissed.includes("reintro-graduation")) return null;

  // Hip-rebuild-specific — next phase after reintro is Cycle 1.
  const NEXT_PHASE_ID = "phase_2_cycle_1";
  const nextPhase = program.phases.find((p) => p.id === NEXT_PHASE_ID);
  if (!nextPhase?.starts || !program.slug) return null;

  const orig = new Date(nextPhase.starts + "T00:00:00").getTime();
  const now = new Date(todayISO() + "T00:00:00").getTime();
  if (!Number.isFinite(orig) || !Number.isFinite(now)) return null;
  const daysToShift = Math.round((now - orig) / 864e5);

  return {
    kind: "readiness_after_layoff",
    id: "readiness:reintro-graduation",
    priority: 60,
    reason:
      "Two straight sessions above 80% TM at RPE ≤ 7 with no red/amber days. Mechanically you're done with Phase 1.",
    citationId: citationIdForKind("readiness_after_layoff"),
    programSlug: program.slug,
    targetPhaseId: NEXT_PHASE_ID,
    targetPhaseName: nextPhase.name?.replace(/\s*\([^)]*\)\s*$/, "") ?? "next phase",
    daysToShift,
    evidence: result.evidence,
    nonQualifyingSessionsSkipped: result.nonQualifyingSessionsSkipped,
  };
}

function selectTierAdvance(store: Store, program: Program): TierAdvanceProposalPayload | null {
  const eligible = nextEligibleTier(program, store.user_profile);
  if (!eligible) return null;
  if (isProposalDismissed(program, store.user_profile, eligible)) return null;

  const tierMeta = program.plan_tiers?.find((t) => t.id === eligible.tier_id);
  const tierLabel = tierMeta?.label ?? eligible.tier_id;
  if (!program.slug) return null;

  return {
    kind: "tier_advance",
    id: `tier-advance:${eligible.tier_id}`,
    priority: 40,
    reason: `Your latest retest clears ${tierLabel}'s threshold. Advancing swaps your weekly focus to the next tier's drills. Prep + recovery blocks stay.`,
    citationId: citationIdForKind("tier_advance"),
    programSlug: program.slug,
    tierId: eligible.tier_id,
    tierLabel,
    varsHash: eligible.vars_hash,
    rationale: eligible.rationale,
  };
}

/**
 * HERITAGE Phase 4 (2026-08-18 · #63) — non-responder recommendation.
 * Fires when the classifier says the user is either under-dosing or in
 * true HERITAGE non-response for their active program's primary signal
 * metric. Uses the confirm-first mechanic: Accept marks the recommendation
 * acknowledged; Ignore dismisses for the standard 7-day window via
 * dismissed_proposals[date].
 */
function selectNonResponder(
  store: Store,
  program: Program,
  date: string,
): NonResponderProposalPayload | null {
  const classifier = (
    program as unknown as {
      non_responder_classifier?: Program["non_responder_classifier"];
    }
  ).non_responder_classifier;
  if (!classifier || !program.slug) return null;

  const readings = store.retest_readings ?? [];
  if (readings.length < classifier.requires_baselines) return null;

  // Resolve per-metric targets from program.retest_metrics against the user's
  // tier (if any). Rules like `progress_ratio_at_mid_block < 0.1` need
  // `target` in the context; without it the classifier can't distinguish
  // responding from non-response.
  const slug = program.slug;
  const userTier = slug
    ? store.user_profile?.program_states?.[slug]?.tier
    : undefined;
  const retestMetrics =
    ((program as unknown as { retest_metrics?: Array<Record<string, unknown>> })
      .retest_metrics) ?? [];
  const targets: Record<string, number> = {};
  for (const m of retestMetrics) {
    const metricId = String(m.metric_id ?? "");
    if (!metricId) continue;
    const rows = (m.targets as Array<Record<string, unknown>> | undefined) ?? [];
    const found = userTier ? rows.find((r) => r.tier_id === userTier) : undefined;
    const row = found ?? rows[0];
    if (row && typeof row.target === "number") targets[metricId] = row.target;
  }

  const result = classify(program, store, { baselines: readings, targets });
  if (
    result.composite_verdict !== "true_non_response" &&
    result.composite_verdict !== "under_dosing"
  ) {
    return null;
  }

  const dismissKey = `non-responder:${result.composite_verdict}`;
  const dismissed = store.dismissed_proposals?.[date] ?? [];
  if (dismissed.includes(dismissKey)) return null;

  // Pull the recommendation_key from whichever metric flagged. Prefer primary
  // (which drives the composite in combineVerdicts), fall back to first
  // per-metric that has one.
  const recommendationKey =
    result.per_metric.find((p) => p.recommendation_key && p.role === "primary")
      ?.recommendation_key ??
    result.per_metric.find((p) => p.recommendation_key)?.recommendation_key ??
    "review_arc";

  return {
    kind: "non_responder_recommendation",
    id: `non-responder:${result.composite_verdict}`,
    // Priority sits between readiness (60) and tier advance (40). It's not
    // safety-urgent like a soften, but it's the kind of "consider a bigger
    // change" the user should see before an incremental tier bump.
    priority: 50,
    reason: result.composite_copy,
    citationId: result.variance_source_citation_id ?? null,
    programSlug: program.slug,
    verdict: result.composite_verdict,
    compositeCopy: result.composite_copy,
    perMetric: result.per_metric.map((m) => ({
      metric_id: m.metric_id,
      role: m.role,
      delta_at_mid_block: m.delta_at_mid_block,
      verdict: m.verdict,
    })),
    recommendationKey,
  };
}

function selectTMBump(
  program: Program,
  store: Store,
  date: string,
): TMBumpProposalPayload | null {
  const proposal = evaluateOverperformer(program, store, date);
  if (!proposal) return null;

  const dismissed = store.dismissed_proposals?.[date] ?? [];
  const remaining = proposal.lifts.filter(
    (l) => !dismissed.includes(`tm-bump:${l.exerciseId}`),
  );
  if (remaining.length === 0) return null;

  return {
    kind: "tm_bump",
    id: `tm-bump:${remaining.map((l) => l.exerciseId).join(",")}`,
    priority: 30,
    reason: proposal.reason,
    citationId: citationIdForKind("tm_bump"),
    lifts: remaining,
    triggers: proposal.triggers,
  };
}

export function selectProposals(store: Store, program: Program, date: string): Proposal[] {
  const out: Proposal[] = [];
  const dayAdj = selectDayAdjustment(store, date);
  if (dayAdj) out.push(dayAdj);
  const readiness = selectReadiness(store, program, date);
  if (readiness) out.push(readiness);
  const nonResponder = selectNonResponder(store, program, date);
  if (nonResponder) out.push(nonResponder);
  const tier = selectTierAdvance(store, program);
  if (tier) out.push(tier);
  const tm = selectTMBump(program, store, date);
  if (tm) out.push(tm);
  // Highest priority first.
  out.sort((a, b) => b.priority - a.priority);
  return out;
}
