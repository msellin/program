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
} from "@/lib/schemas";
import { daySignals, proposedLoadMultiplier } from "@/lib/engine/note-signals";
import { assessReintroReadiness } from "@/lib/engine/readiness";
import { nextEligibleTier, isProposalDismissed } from "@/lib/engine/tier-promotion";
import { evaluateOverperformer } from "@/lib/engine/adapt";
import { citationIdForKind } from "@/lib/engine/proposal-citations";
import { iso, today as todayISO } from "@/lib/utils";

function selectDayAdjustment(store: Store, date: string): DayAdjustmentProposalPayload | null {
  // Already accepted? Not a proposal any more.
  if (store.day_adjustments?.[date]) return null;

  // Look at today + the 2 prior days for a signal.
  let sig = daySignals(store.logs[date]);
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
  const tier = selectTierAdvance(store, program);
  if (tier) out.push(tier);
  const tm = selectTMBump(program, store, date);
  if (tm) out.push(tm);
  // Highest priority first.
  out.sort((a, b) => b.priority - a.priority);
  return out;
}
