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
  RetestDueProposalPayload,
} from "@/lib/schemas";
import { daySignals, proposedLoadMultiplier } from "@/lib/engine/note-signals";
import { activePhaseFor } from "@/lib/engine/schedule";
import { blocksForDate } from "@/lib/engine/plan-generator";
import { assessReintroReadiness } from "@/lib/engine/readiness";
import { nextEligibleTier, isProposalDismissed } from "@/lib/engine/tier-promotion";
import { evaluateOverperformer } from "@/lib/engine/adapt";
import { classify } from "@/lib/engine/non-responder-classifier";
import { weekNumberFromProgramStart } from "@/lib/engine/plan-generator";
import { isPastProgramEnd } from "@/lib/engine/schedule";
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

/**
 * The next day that actually carries loaded work, searching forward from
 * `from` for a week. Returns null when nothing loaded is scheduled.
 *
 * A load softening has to land on a day with a load to soften. Accepted on
 * a rest day it wrote `day_adjustments[thatRestDay]`, where no session
 * would ever read it.
 */
function nextLoadedDay(store: Store, program: Program, from: string): string | null {
  for (let i = 0; i < 7; i++) {
    const d = new Date(Date.parse(from + "T12:00:00Z") + i * 864e5).toISOString().slice(0, 10);
    const phase = activePhaseFor(program, d, store.user_profile);
    const blocks = blocksForDate(program, store.user_profile, phase, d, undefined, store);
    const loaded = blocks.some(
      (b: { category?: string; items?: unknown[] }) =>
        (b.category ?? "strength") === "strength" && (b.items?.length ?? 0) > 0,
    );
    if (loaded) return d;
  }
  return null;
}

function selectDayAdjustment(
  store: Store,
  program: Program,
  date: string,
): DayAdjustmentProposalPayload | null {
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
  // What gets softened depends on the modality. Only programs that declare
  // `training_maxes` have a top set to trim — exactly the two barbell programs
  // (anterior-hip-rebuild, concurrent-strength-maintenance). The other six
  // shipped programs are skill, gymnastics or aerobic, and all of them were
  // being told to "trim 5% from the top set" on sessions that have none.
  const hasTopSet = Object.keys(program.training_maxes ?? {}).length > 0;
  const loadNoun = hasTopSet ? "top set" : "session";
  const proposal = proposedLoadMultiplier(sig, loadNoun);
  if (!proposal) return null;

  // Bug #1 fix: if the ONLY thing today has is a life-load value AND no prior
  // signal contributed, we're looking at an onboarding-fresh user. Suppress.
  if (todayIsLifeLoadOnly) {
    const priorSignalPresent = sig.matches.length > 0 && sig !== daySignals(store.logs[date]);
    if (!priorSignalPresent) return null;
  }

  // Target the next day that has loaded work, which may not be today.
  const target = nextLoadedDay(store, program, date);
  if (!target) return null;
  if (store.day_adjustments?.[target]) return null;

  const id = `day-adj:load-${proposal.multiplier}`;
  const dismissed = store.dismissed_proposals?.[date] ?? [];
  if (dismissed.includes(`load-${proposal.multiplier}`)) return null;

  return {
    kind: "day_adjustment_soften",
    id,
    priority: sig.pain ? 100 : 80,
    reason: proposal.reason,
    citationId: citationIdForKind("day_adjustment_soften"),
    date: target,
    ...(target !== date ? { signalDate: date } : {}),
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

/**
 * HERITAGE Phase 5 (2026-08-18 · #73) — retest-due proposal.
 * Fires ONE proposal at a time (the earliest at_week whose window is open
 * and unlogged). Two sources:
 *   1. program.retest_metrics_mid_block[] — the mid-block baseline
 *      that unlocks the classifier.
 *   2. program.retest_metrics[] — the end-of-block target check.
 *
 * Window: the proposal appears from the at_week start through the end of
 * the following week (7-day grace), so an athlete who misses Monday can
 * still log Sunday. If the user already has a reading for that metric
 * within the past 7 days, we suppress — the reading is fresh enough.
 */
function selectRetestDue(
  store: Store,
  program: Program,
  date: string,
): RetestDueProposalPayload | null {
  if (!program.slug) return null;
  const profile = store.user_profile;
  if (!profile?.active_program_started_at) return null;

  // Post-graduation, retest_due proposals stop firing — Batch 5 #1 gated
  // the phase readout + retest banner + reveal card on isPastProgramEnd
  // but missed this proposal path. Engine delta-2 caught the leak:
  // "END-OF-BLOCK RETEST WINDOW OPEN" + "YOU FINISHED" rendered
  // simultaneously on both graduated engine personas.
  if (isPastProgramEnd(program, date, profile)) return null;

  const currentWeek = weekNumberFromProgramStart(profile, date);

  type Row = { atWeek: number; metricId: string; kind: "mid_block" | "end_of_block" };
  const rows: Row[] = [];

  // Read from both cadence sources. Use `unknown` casts because the fields
  // on the Program type are marked optional-and-loose (they arrive from JSON).
  const midBlock =
    ((program as unknown as { retest_metrics_mid_block?: Array<Record<string, unknown>> })
      .retest_metrics_mid_block) ?? [];
  for (const m of midBlock) {
    const atWeek = typeof m.at_week === "number" ? m.at_week : null;
    const metricId = typeof m.metric_id === "string" ? m.metric_id : null;
    if (atWeek == null || metricId == null) continue;
    rows.push({ atWeek, metricId, kind: "mid_block" });
  }

  const endOfBlock =
    ((program as unknown as { retest_metrics?: Array<Record<string, unknown>> })
      .retest_metrics) ?? [];
  for (const m of endOfBlock) {
    const metricId = typeof m.metric_id === "string" ? m.metric_id : null;
    if (metricId == null) continue;
    // Prefer explicit at_week; fall back to the first target row's at_week.
    let atWeek: number | null =
      typeof m.at_week === "number" ? m.at_week : null;
    if (atWeek == null) {
      const targets = (m.targets as Array<Record<string, unknown>> | undefined) ?? [];
      const found = targets.find((t) => typeof t.at_week === "number");
      atWeek = found ? (found.at_week as number) : null;
    }
    if (atWeek == null) continue;
    rows.push({ atWeek, metricId, kind: "end_of_block" });
  }

  if (rows.length === 0) return null;

  const readings = store.retest_readings ?? [];

  // Pick the earliest at_week row whose (a) window is open and (b) hasn't
  // been logged in the past 7 days. Sort ascending so the user sees the
  // most-due first.
  rows.sort((a, b) => a.atWeek - b.atWeek);

  const nowMs = new Date(date + "T00:00:00").getTime();
  for (const row of rows) {
    // Window: [at_week, at_week + 1] inclusive. currentWeek starts at 1.
    if (currentWeek < row.atWeek || currentWeek > row.atWeek + 1) continue;

    // Suppress if a reading exists in the past 7 days for this metric.
    const fresh = readings.some((r) => {
      if (r.metric_id !== row.metricId) return false;
      const t = new Date(r.observed_at + "T00:00:00").getTime();
      if (!Number.isFinite(t)) return false;
      return nowMs - t <= 7 * 864e5;
    });
    if (fresh) continue;

    // Dismissed today? Skip.
    const dismissed = store.dismissed_proposals?.[date] ?? [];
    const dismissKey = `retest-due:${row.metricId}:${row.atWeek}`;
    if (dismissed.includes(dismissKey)) continue;

    // Resolve display name + unit from the end-of-block metrics list if
    // possible (mid-block is often just a reference to the same metric).
    const meta = endOfBlock.find((m) => m.metric_id === row.metricId);
    const displayName =
      (meta && typeof meta.display_name === "string" ? meta.display_name : row.metricId);
    const unit = meta && typeof meta.unit === "string" ? meta.unit : "";

    return {
      kind: "retest_due",
      id: `retest-due:${row.metricId}:${row.atWeek}`,
      // Priority sits between non-responder (50) and tier-advance (40).
      // Retest is preparatory: fresh data enables the sharper proposals
      // above it.
      priority: 45,
      reason:
        row.kind === "mid_block"
          ? `Week ${row.atWeek} mid-block retest is due. Two baselines unlock the classifier — this is the first.`
          : `Week ${row.atWeek} end-of-block retest is due. Log a reading to compare against baseline.`,
      citationId: citationIdForKind("retest_due"),
      programSlug: program.slug,
      metricId: row.metricId,
      metricDisplayName: displayName,
      metricUnit: unit,
      atWeek: row.atWeek,
      currentWeek,
      cadenceKind: row.kind,
    };
  }
  return null;
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
  const dayAdj = selectDayAdjustment(store, program, date);
  if (dayAdj) out.push(dayAdj);
  const readiness = selectReadiness(store, program, date);
  if (readiness) out.push(readiness);
  const nonResponder = selectNonResponder(store, program, date);
  if (nonResponder) out.push(nonResponder);
  const retest = selectRetestDue(store, program, date);
  if (retest) out.push(retest);
  const tier = selectTierAdvance(store, program);
  if (tier) out.push(tier);
  const tm = selectTMBump(program, store, date);
  if (tm) out.push(tm);

  // Mutex: a "trim the top set" soften and a "bump the TM" push should
  // never render on the same Today — they contradict. CSM delta-2 caught
  // both firing on persona-strength ("Halson 2014 trim 5%" + "Rhea 2003
  // add weight"). Priority is a proxy for confidence; the higher-priority
  // signal wins. If both fire, drop the softer one. Confidence rank:
  // non_responder (50) > tier_advance (40) > tm_bump (30) > day_adjust
  // (20) > everything else. Only drop `day_adjustment_soften` (fatigue)
  // when `tm_bump` (headroom) also fires — that's the direct contradiction.
  const hasTmBump = out.some((p) => p.kind === "tm_bump");
  const hasFatigueSoften = out.some(
    (p) => p.kind === "day_adjustment_soften",
  );
  if (hasTmBump && hasFatigueSoften) {
    // Keep the higher-confidence signal. TM-bump requires 3 consecutive
    // green days + easy notes — a stronger signal than a single day's
    // fatigue read. Drop the soften.
    for (let i = out.length - 1; i >= 0; i--) {
      if (out[i].kind === "day_adjustment_soften") out.splice(i, 1);
    }
  }

  // Highest priority first.
  out.sort((a, b) => b.priority - a.priority);
  return out;
}
