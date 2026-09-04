/**
 * HERITAGE non-responder classifier · Phase 2.
 * See dev/active/heritage-non-responder-gate-plan.md.
 *
 * Program-agnostic: reads the program's `non_responder_classifier` shape,
 * evaluates each declared rule against the user's baseline observations,
 * and returns a per-metric verdict + composite classification.
 *
 * Requires ≥2 baselines per Hecksteden 2015. Single-baseline calls return
 * `insufficient_data`. Phase 3+ will surface transitions between states
 * as confirm-first proposals; this module produces the pure classification.
 */

import type { Program, Store } from "../schemas";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

/**
 * A single baseline observation of a metric — one point in time, one value.
 * Callers gather these from `store.logs` (for symptom/HR readings) or
 * `store.assessments` / `store.training_maxes` (for lift-related metrics).
 */
export type MetricBaseline = {
  metric_id: string;
  value: number;
  observed_at: string; // ISO yyyy-mm-dd
  // Optional context the classifier can use for the intensity-compliance
  // sub-rule (e.g., "you hit prescribed intensity 8/10 sessions").
  intensity_compliance_pct?: number;
  session_compliance_pct?: number;
};

export type ClassificationVerdict =
  | "responding"
  | "under_dosing"
  | "true_non_response"
  | "insufficient_data"
  | "not_configured";

/**
 * Per-metric classification result. Composite verdict is derived from all
 * metric verdicts using the `combineVerdicts` helper below.
 */
export type PerMetricClassification = {
  metric_id: string;
  role: "primary" | "secondary";
  verdict: ClassificationVerdict;
  baselines_used: number;
  delta_at_mid_block?: number;
  copy?: string;
  recommendation_key?: string;
};

export type ClassificationResult = {
  composite_verdict: ClassificationVerdict;
  composite_copy: string;
  per_metric: PerMetricClassification[];
  requires_baselines: number;
  variance_source_citation_id?: string;
};

// -----------------------------------------------------------------------------
// Rule expression evaluator
// -----------------------------------------------------------------------------

/**
 * Program JSONs declare classification rules as string expressions like
 *   "primary_signal_delta_at_mid_block < target * 0.4 AND intensity_compliance_pct < 80"
 *
 * A full expression parser would be overkill; instead we evaluate a limited
 * DSL against a name→value context. Supported:
 *   - Bare identifier (looked up in context)
 *   - Literal number
 *   - Binary ops: < <= > >= == != * / + -
 *   - `AND` / `OR` (left-to-right, no precedence beyond insertion order)
 *
 * The DSL is intentionally small. Adding more operators is fine when the
 * classifier's needs grow — right now three programs' rules fit this shape.
 *
 * Unknown identifiers evaluate to `undefined`; any comparison against an
 * undefined operand yields `false` (defensive — a rule that references a
 * missing signal shouldn't classify).
 */

type RuleContext = Record<string, number | undefined>;

const AND = "AND";
const OR = "OR";
const COMPARE_OPS = ["<=", ">=", "==", "!=", "<", ">"] as const;

export function evaluateRule(rule: string, ctx: RuleContext): boolean {
  const parts = tokenizeConjuncts(rule);
  let result: boolean | null = null;
  let mode: "AND" | "OR" = "AND";
  for (const p of parts) {
    if (p === AND) {
      mode = "AND";
      continue;
    }
    if (p === OR) {
      mode = "OR";
      continue;
    }
    const v = evaluateComparison(p, ctx);
    result = result === null ? v : mode === "AND" ? result && v : result || v;
  }
  return result === true;
}

function tokenizeConjuncts(rule: string): string[] {
  // Split on AND / OR keywords while preserving them as separators.
  return rule
    .split(/(\bAND\b|\bOR\b)/i)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => s.toUpperCase() === AND ? AND : s.toUpperCase() === OR ? OR : s);
}

function evaluateComparison(expr: string, ctx: RuleContext): boolean {
  for (const op of COMPARE_OPS) {
    const idx = expr.indexOf(op);
    if (idx === -1) continue;
    const lhs = expr.slice(0, idx).trim();
    const rhs = expr.slice(idx + op.length).trim();
    const l = evaluateOperand(lhs, ctx);
    const r = evaluateOperand(rhs, ctx);
    if (l === undefined || r === undefined) return false;
    switch (op) {
      case "<":
        return l < r;
      case "<=":
        return l <= r;
      case ">":
        return l > r;
      case ">=":
        return l >= r;
      case "==":
        return l === r;
      case "!=":
        return l !== r;
    }
  }
  return false;
}

function evaluateOperand(expr: string, ctx: RuleContext): number | undefined {
  // Basic arithmetic: `target * 0.4`, `a + b`, `a - b`, etc. Left-to-right,
  // no precedence — sufficient for the rules we ship. Anything more complex
  // should be parenthesized in the JSON (rare).
  const arithOps = ["*", "/", "+", "-"];
  for (const op of arithOps) {
    const idx = expr.lastIndexOf(op);
    if (idx <= 0) continue; // leading `-` is a unary; skip
    const left = evaluateOperand(expr.slice(0, idx).trim(), ctx);
    const right = evaluateOperand(expr.slice(idx + 1).trim(), ctx);
    if (left === undefined || right === undefined) return undefined;
    switch (op) {
      case "*":
        return left * right;
      case "/":
        return right === 0 ? undefined : left / right;
      case "+":
        return left + right;
      case "-":
        return left - right;
    }
  }
  // Literal or identifier.
  const asNum = Number(expr);
  if (Number.isFinite(asNum)) return asNum;
  return ctx[expr];
}

// -----------------------------------------------------------------------------
// Classifier
// -----------------------------------------------------------------------------

/**
 * Build the rule-evaluation context for one metric.
 *
 * We EXPOSE `progress_ratio_at_mid_block` (0 = no progress, 1 = full target
 * hit) instead of raw delta because rules like `< target * 0.4` don't work
 * for lower_is_better metrics — a negative-delta target (e.g. submax HR
 * should drop 12) makes `delta < target * 0.4` semantically wrong. Progress
 * ratio is direction-agnostic: `actual_delta / target_delta`, positive when
 * both are same sign, ≥ 1 when target reached or beaten.
 */
function buildMetricCtx(opts: {
  metricId: string;
  baselines: MetricBaseline[];
  target: number | undefined;
  intensityCompliancePct: number | undefined;
  sessionCompliancePct: number | undefined;
  restingHrDelta: number | undefined;
}): { ctx: RuleContext; deltaAtMidBlock: number | undefined } {
  const { baselines, target } = opts;
  const sorted = [...baselines].sort((a, b) =>
    a.observed_at.localeCompare(b.observed_at),
  );
  const first = sorted[0];
  const midOrLatest = sorted[1] ?? sorted[0];
  const delta =
    first && midOrLatest ? midOrLatest.value - first.value : undefined;
  const progressRatio =
    delta !== undefined && target !== undefined && target !== 0
      ? delta / target
      : undefined;
  const restingHrProgressRatio =
    opts.restingHrDelta !== undefined && target !== undefined && target !== 0
      ? opts.restingHrDelta / target
      : undefined;
  const ctx: RuleContext = {
    primary_signal_delta_at_mid_block: delta,
    progress_ratio_at_mid_block: progressRatio,
    intensity_compliance_pct: opts.intensityCompliancePct,
    session_compliance_pct: opts.sessionCompliancePct,
    resting_hr_delta_at_mid_block: opts.restingHrDelta,
    resting_hr_progress_ratio: restingHrProgressRatio,
    target,
  };
  return { ctx, deltaAtMidBlock: delta };
}

export type ClassifyOptions = {
  /**
   * All observed baselines for every metric this program tracks. The
   * classifier picks the ones matching the program's primary + secondary
   * ids. Callers gather these from their preferred data source (retest
   * metrics, physical tests, symptom scores).
   */
  baselines: MetricBaseline[];
  /**
   * Optional pre-computed compliance percentages. If unset, the classifier
   * treats them as "not blocking" — meaning under-dosing rules that require
   * a compliance floor will not fire (returns "responding" instead).
   */
  intensity_compliance_pct?: number;
  session_compliance_pct?: number;
  /**
   * Optional target lookup: for each metric_id, the numeric target the
   * program expects to hit (usually pulled from `retest_metrics[].targets`
   * for the user's tier). Rules like `< target * 0.4` need this. If a
   * metric target is missing, the rule silently short-circuits.
   */
  targets?: Record<string, number>;
};

export function classify(
  program: Program,
  store: Store,
  opts: ClassifyOptions,
): ClassificationResult {
  const classifier = (
    program as unknown as { non_responder_classifier?: Program["non_responder_classifier"] }
  ).non_responder_classifier;
  if (!classifier) {
    return {
      composite_verdict: "not_configured",
      composite_copy: "",
      per_metric: [],
      requires_baselines: 2,
    };
  }
  void store; // Reserved for future signals (log-derived compliance, etc.)

  const targets = opts.targets ?? {};
  const perMetric: PerMetricClassification[] = [];

  const metrics: Array<{ id: string; role: "primary" | "secondary" }> = [
    { id: classifier.primary_signal_metric_id, role: "primary" },
    ...(classifier.secondary_signal_metric_ids ?? []).map((id) => ({
      id,
      role: "secondary" as const,
    })),
  ];

  // Precompute resting HR delta once (needed by Engine Builder's
  // true_non_response rule).
  const restingHrBaselines = opts.baselines.filter(
    (b) => b.metric_id === "resting_hr_bpm",
  );
  const restingSorted = [...restingHrBaselines].sort((a, b) =>
    a.observed_at.localeCompare(b.observed_at),
  );
  const restingHrDelta =
    restingSorted.length >= 2
      ? restingSorted[restingSorted.length - 1].value - restingSorted[0].value
      : undefined;

  for (const m of metrics) {
    const bl = opts.baselines.filter((b) => b.metric_id === m.id);
    if (bl.length < classifier.requires_baselines) {
      perMetric.push({
        metric_id: m.id,
        role: m.role,
        verdict: "insufficient_data",
        baselines_used: bl.length,
      });
      continue;
    }
    const { ctx, deltaAtMidBlock } = buildMetricCtx({
      metricId: m.id,
      baselines: bl,
      target: targets[m.id],
      intensityCompliancePct: opts.intensity_compliance_pct,
      sessionCompliancePct: opts.session_compliance_pct,
      restingHrDelta,
    });

    const underDosing = evaluateRule(classifier.patterns.under_dosing.rule, ctx);
    const trueNonResponse = evaluateRule(
      classifier.patterns.true_non_response.rule,
      ctx,
    );

    let verdict: ClassificationVerdict;
    let copy: string;
    let recommendation_key: string | undefined;
    if (trueNonResponse) {
      verdict = "true_non_response";
      copy = classifier.patterns.true_non_response.copy;
      recommendation_key = classifier.patterns.true_non_response.recommendation_key;
    } else if (underDosing) {
      verdict = "under_dosing";
      copy = classifier.patterns.under_dosing.copy;
      recommendation_key = classifier.patterns.under_dosing.recommendation_key;
    } else {
      verdict = "responding";
      copy = classifier.patterns.responding.copy;
    }

    perMetric.push({
      metric_id: m.id,
      role: m.role,
      verdict,
      baselines_used: bl.length,
      delta_at_mid_block: deltaAtMidBlock,
      copy,
      recommendation_key,
    });
  }

  const composite = combineVerdicts(perMetric, classifier);

  /**
   * `true_non_response` is suppressed (2026-09-04, founder decision).
   *
   * It rendered a RED proposal card — "Not responding to current dose" —
   * offering the user three options, one of which was to accept a genetic
   * ceiling and move to maintenance. That is the most discouraging thing
   * this app can say to anyone, and the evidence under it does not hold:
   *
   *   - the primary signal is `submax_hr_pace5_bpm`, average HR on runs the
   *     user LABELLED easy. Submax HR is a real marker of aerobic
   *     adaptation, but only at a FIXED external workload — and RunLog has
   *     no pace field, so there is no anchor. A fitter runner runs their
   *     easy faster at the same HR.
   *   - the delta is two raw readings (`buildMetricCtx`), not the
   *     `trend_slope` over 28 days the programme declares. The Foundation
   *     target is -5 bpm; day-to-day submax HR moves several bpm on sleep,
   *     heat, hydration and caffeine.
   *   - HERITAGE, the citation behind the construct, was a supervised lab
   *     study with standardised ergometer testing. It establishes that
   *     non-response EXISTS. It does not license detecting it this way.
   *
   * The costs are asymmetric, which is what decides it. `under_dosing`
   * wrong means someone trains slightly harder than they needed to.
   * `true_non_response` wrong means someone abandons an arc that was
   * working. There is no symmetric upside: a person wrongly told to keep
   * going loses nothing.
   *
   * Downgraded to `insufficient_data` rather than `responding`, because
   * that is the honest reading — with this instrument we cannot tell the
   * two apart. `under_dosing` is untouched: its rule also requires
   * `intensity_compliance_pct < 80`, which is measured from the user's own
   * logs rather than inferred from noisy HR, and Ross 2015 (already cited
   * in engine-builder) says under-dosing is the likelier explanation
   * anyway.
   *
   * To re-enable: this needs a measurement with a real workload anchor —
   * block-2's 20-minute threshold test is the obvious candidate — and
   * review by someone qualified to sign off on telling a user their
   * training may be capped. Removing a discouraging claim needs no
   * expertise; restoring one does. Full working:
   * `dev/audits/programs/2026-09-04-submax-hr-evidence-check.md`.
   */
  const suppressed = composite.verdict === "true_non_response";
  const verdict: ClassificationVerdict = suppressed ? "insufficient_data" : composite.verdict;
  const copy = suppressed
    ? "Your aerobic signals aren't moving much yet — but easy-run heart rate on its own can't tell us whether that's the dose or the plan. Keep going, and let the next threshold test answer it."
    : composite.copy;

  /**
   * The PER-METRIC verdicts are suppressed too, not just the composite.
   *
   * `HeritageClusterChip` renders the per-metric list underneath the chip
   * (`humanizeVerdict(m.verdict)`), so downgrading only the headline would
   * have left "not responding" sitting one tap down — the claim removed
   * from the place it was noticed and kept in the place it would be
   * believed. `recommendation_key` goes with it: it is
   * `punt_to_next_arc_or_swap_program`, and `select.ts` reads the key off
   * per-metric rows independently of the composite.
   */
  const publishedMetrics = suppressed
    ? perMetric.map((m) =>
        m.verdict === "true_non_response"
          ? { ...m, verdict: "insufficient_data" as const, copy: undefined, recommendation_key: undefined }
          : m,
      )
    : perMetric;

  return {
    composite_verdict: verdict,
    composite_copy: copy,
    per_metric: publishedMetrics,
    requires_baselines: classifier.requires_baselines,
    variance_source_citation_id: classifier.variance_source.citation_id,
  };
}

/**
 * Composite rule: primary signal is authoritative. Secondary signals modulate
 * copy (e.g., "responding on submax HR, flat on VO2max estimate") but do NOT
 * flip the composite verdict. This matches how HERITAGE literature reports
 * classifications — the primary aerobic-adaptation metric is the anchor.
 */
function combineVerdicts(
  perMetric: PerMetricClassification[],
  classifier: NonNullable<Program["non_responder_classifier"]>,
): { verdict: ClassificationVerdict; copy: string } {
  const primary = perMetric.find((p) => p.role === "primary");
  if (!primary || primary.verdict === "insufficient_data") {
    return {
      verdict: "insufficient_data",
      copy:
        "Not enough data yet. Come back after your mid-block retest — we need at least 2 baselines to classify honestly.",
    };
  }

  // Enrich the primary copy with a "responding on X, flat on Y" note when
  // secondaries diverge — the multi-metric insight the founder asked for.
  const secondaryDivergent = perMetric
    .filter((p) => p.role === "secondary" && p.verdict !== "insufficient_data")
    .filter((p) => p.verdict !== primary.verdict);
  if (secondaryDivergent.length === 0) {
    return {
      verdict: primary.verdict,
      copy: primary.copy ?? classifier.patterns.responding.copy,
    };
  }
  const divergentNote = secondaryDivergent
    .map((p) => `${humanMetric(p.metric_id)}: ${p.verdict.replace(/_/g, " ")}`)
    .join("; ");
  return {
    verdict: primary.verdict,
    copy: `${primary.copy ?? classifier.patterns.responding.copy} · Secondary signals disagree — ${divergentNote}.`,
  };
}

function humanMetric(id: string): string {
  return id.replace(/_/g, " ");
}
