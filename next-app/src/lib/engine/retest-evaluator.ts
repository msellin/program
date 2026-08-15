import type { Program, Store } from "../schemas";

/**
 * Retest metrics — evaluate `program.retest_metrics[]` against the store.
 *
 * Each metric declares a `source_ref` query string. This is a small parser for
 * the subset actually used in the shipped programs:
 *
 *   - `training_maxes.<lift_id>`
 *     → store.training_maxes[lift_id]
 *
 *   - `runs[].<field> where <k1> == '<v1>' [and <k2> == '<v2>']`
 *     → find the latest run in store.logs across every date whose fields match
 *       all filters, return the given field (defaults to null if none).
 *
 *   - `runs[].<field> where intensity == 'easy'` (aggregation "trend_slope")
 *     → weekly means over the last N days, slope of the linear regression.
 *
 * Anything more exotic is skipped (returns null) — the metric card renders as
 * "not yet trackable" instead of throwing.
 *
 * Deliberately narrow syntax. Programs don't get to embed arbitrary code.
 */

export type RetestValue = {
  metric_id: string;
  display_name: string;
  unit: string;
  direction: "higher_is_better" | "lower_is_better";
  current: number | null;
  baseline: number | null;
  target: number | null;
  stretch: number | null;
  at_week: number | null;
  cadence_weeks: number | null;
  supported: boolean;
  note?: string;
};

type Filter = { field: string; op: "eq"; value: string };
type ParsedSource =
  | { kind: "training_maxes"; liftId: string }
  | { kind: "runs"; field: string; filters: Filter[] }
  | { kind: "physical_test"; testId: string }
  | { kind: "unsupported"; raw: string };

function parseSource(raw: string, sourceKind?: string): ParsedSource {
  const trimmed = raw.trim();
  // Skill programs declare `source: "physical_test"` alongside a bare source_ref
  // testId (e.g. `wall_hold_max_seconds`). The value lives on
  // `capability_profile[testId].measured_value`.
  if (sourceKind === "physical_test") {
    const testMatch = /^([a-z0-9_]+)$/i.exec(trimmed);
    if (testMatch) return { kind: "physical_test", testId: testMatch[1] };
  }
  // training_maxes.<lift_id>
  const tmMatch = /^training_maxes\.([a-z0-9_]+)$/i.exec(trimmed);
  if (tmMatch) return { kind: "training_maxes", liftId: tmMatch[1] };

  // runs[].<field> where <k>=='v' [and <k>=='v'] ...
  const runsMatch = /^runs\[\]\.([a-z0-9_]+)(?:\s+where\s+(.+))?$/i.exec(trimmed);
  if (runsMatch) {
    const field = runsMatch[1];
    const filters: Filter[] = [];
    const whereClause = runsMatch[2];
    if (whereClause) {
      for (const part of whereClause.split(/\s+and\s+/i)) {
        const eq = /^([a-z0-9_]+)\s*==\s*'([^']*)'$/i.exec(part.trim());
        if (eq) filters.push({ field: eq[1], op: "eq", value: eq[2] });
      }
    }
    return { kind: "runs", field, filters };
  }
  return { kind: "unsupported", raw };
}

function runsAcrossDates(
  store: Store,
): Array<{ date: string; run: NonNullable<Store["logs"][string]["runs"]>[number] }> {
  const out: Array<{ date: string; run: NonNullable<Store["logs"][string]["runs"]>[number] }> = [];
  for (const [date, day] of Object.entries(store.logs)) {
    for (const run of day.runs ?? []) out.push({ date, run });
  }
  return out.sort((a, b) => a.date.localeCompare(b.date));
}

function runMatchesFilters(
  run: NonNullable<Store["logs"][string]["runs"]>[number],
  filters: Filter[],
): boolean {
  for (const f of filters) {
    // `modality` isn't a field on the run; treat it as an alias for
    // activity_type since the program author intent is the same.
    const val =
      f.field === "modality"
        ? (run as { activity_type?: string }).activity_type
        : ((run as unknown as Record<string, unknown>)[f.field] as unknown);
    if (String(val ?? "") !== f.value) return false;
  }
  return true;
}

function readRunNumericField(
  run: NonNullable<Store["logs"][string]["runs"]>[number],
  field: string,
): number | null {
  const v = (run as unknown as Record<string, unknown>)[field];
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

function evaluateSource(
  store: Store,
  parsed: ParsedSource,
  slug: string | undefined,
): {
  current: number | null;
  baseline: number | null;
} {
  if (parsed.kind === "training_maxes") {
    const v = store.training_maxes[parsed.liftId];
    // Baseline snapshot is written at intake commit into
    // `program_states[slug].baseline_training_maxes`. Reading it here lets
    // the Δ column show a real number instead of always dashing out.
    const snap = slug
      ? store.user_profile?.program_states?.[slug]?.baseline_training_maxes
      : undefined;
    const baseline = typeof snap?.[parsed.liftId] === "number" ? snap[parsed.liftId] : null;
    return { current: typeof v === "number" ? v : null, baseline };
  }
  if (parsed.kind === "physical_test") {
    // Skill programs: capability_profile[testId].measured_value is the current
    // reading. Intake commit stamps both capability_profile AND a separate
    // baseline_capabilities snapshot so a future retest-capture flow can update
    // the current reading without losing the baseline for Δ math.
    const profile = store.user_profile;
    const cap = profile?.capability_profile?.[parsed.testId];
    const currentRaw = cap?.measured_value;
    const current = typeof currentRaw === "number" ? currentRaw : null;
    const snap = slug
      ? (profile?.program_states?.[slug] as unknown as { baseline_capabilities?: Record<string, number> })
          ?.baseline_capabilities
      : undefined;
    const baselineRaw = snap?.[parsed.testId];
    // If the baseline snapshot doesn't exist yet (existing user, pre-fix),
    // fall back to the current value so Δ renders as 0 rather than dashing out.
    const baseline =
      typeof baselineRaw === "number" ? baselineRaw : current;
    return { current, baseline };
  }
  if (parsed.kind === "runs") {
    // Only count runs on or after the user started this program — a returning
    // user shouldn't have their years-old easy-run HRs used as the baseline.
    const startedAt = slug
      ? store.user_profile?.program_states?.[slug]?.started_at?.slice(0, 10)
      : undefined;
    const all = runsAcrossDates(store).filter(({ date }) =>
      startedAt ? date >= startedAt : true,
    );
    const matching = all.filter(({ run }) => runMatchesFilters(run, parsed.filters));
    if (matching.length === 0) return { current: null, baseline: null };
    const firstV = readRunNumericField(matching[0].run, parsed.field);
    const lastV = readRunNumericField(matching[matching.length - 1].run, parsed.field);
    return { current: lastV, baseline: firstV };
  }
  return { current: null, baseline: null };
}

/**
 * Evaluate every retest metric on a program against the current store state.
 * Missing / unsupported metrics come back with `supported: false`.
 */
export function evaluateRetestMetrics(
  program: Program,
  store: Store,
  userTierId?: string,
): RetestValue[] {
  const metrics =
    ((program as unknown as { retest_metrics?: unknown[] }).retest_metrics as
      | Array<Record<string, unknown>>
      | undefined) ?? [];
  if (!metrics.length) return [];

  return metrics.map((m): RetestValue => {
    const metric_id = String(m.metric_id ?? "unknown");
    const display_name = String(m.display_name ?? metric_id);
    const unit = String(m.unit ?? "");
    const direction =
      m.direction === "lower_is_better" ? "lower_is_better" : "higher_is_better";
    const cadence_weeks = typeof m.cadence_weeks === "number" ? m.cadence_weeks : null;
    const sourceRef = typeof m.source_ref === "string" ? m.source_ref : "";
    const sourceKind = typeof m.source === "string" ? m.source : undefined;
    const parsed = sourceRef
      ? parseSource(sourceRef, sourceKind)
      : { kind: "unsupported" as const, raw: "" };

    if (parsed.kind === "unsupported") {
      return {
        metric_id,
        display_name,
        unit,
        direction,
        current: null,
        baseline: null,
        target: null,
        stretch: null,
        at_week: null,
        cadence_weeks,
        supported: false,
        note: "This metric will land once its data source is wired.",
      };
    }

    const { current, baseline } = evaluateSource(store, parsed, program.slug);

    // Pick the user's tier target row when present.
    const targets = (m.targets as Array<Record<string, unknown>> | undefined) ?? [];
    const found = userTierId ? targets.find((t) => t.tier_id === userTierId) : undefined;
    const row: Record<string, unknown> = found ?? targets[0] ?? {};
    const target = typeof row.target === "number" ? row.target : null;
    const stretch = typeof row.stretch === "number" ? row.stretch : null;
    const at_week = typeof row.at_week === "number" ? row.at_week : null;

    return {
      metric_id,
      display_name,
      unit,
      direction,
      current,
      baseline,
      target,
      stretch,
      at_week,
      cadence_weeks,
      supported: true,
    };
  });
}

/**
 * Human-format a metric value for display. Seconds are rendered as mm:ss.
 */
export function formatMetric(value: number | null, unit: string): string {
  if (value == null) return "—";
  if (unit === "seconds") {
    const abs = Math.abs(Math.round(value));
    const sign = value < 0 ? "−" : "";
    return `${sign}${Math.floor(abs / 60)}:${String(abs % 60).padStart(2, "0")}`;
  }
  if (unit === "bpm" || unit === "kg" || unit === "watts") {
    return `${Math.round(value)} ${unit}`;
  }
  return `${value} ${unit}`;
}

/**
 * Delta from baseline, respecting `direction`. Positive = improvement.
 * Returns { value, isImprovement } — the panel styles green/red accordingly.
 */
export function deltaFromBaseline(
  m: RetestValue,
): { value: number; isImprovement: boolean } | null {
  if (m.current == null || m.baseline == null) return null;
  const raw = m.current - m.baseline;
  const isImprovement = m.direction === "higher_is_better" ? raw > 0 : raw < 0;
  return { value: raw, isImprovement };
}
