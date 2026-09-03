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
  aggregation?: string,
  windowDays?: number,
  direction?: "higher_is_better" | "lower_is_better",
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
    const values = matching
      .map(({ run }) => readRunNumericField(run, parsed.field))
      .filter((v): v is number => v != null);
    if (values.length === 0) return { current: null, baseline: null };

    // Aggregation-aware current/baseline selection. Prior behavior was
    // point-sample first vs last regardless of the JSON-declared
    // `aggregation` and `window_days` — which inverted persona-engine-fast's
    // Δ from real −1 bpm to false +4 bpm because random per-session noise
    // dominated the point sample. Delta audit 2026-08-19.
    if (aggregation === "trend_slope" && values.length >= 2) {
      // Baseline = mean of first third of the values (or first ceil(N/3)).
      // Current = mean of last third. Δ then reads the trend, not noise.
      const third = Math.max(1, Math.ceil(values.length / 3));
      const firstThird = values.slice(0, third);
      const lastThird = values.slice(values.length - third);
      const mean = (a: number[]) => a.reduce((s, v) => s + v, 0) / a.length;
      return { current: Math.round(mean(lastThird) * 10) / 10, baseline: Math.round(mean(firstThird) * 10) / 10 };
    }

    if (aggregation === "best_of_last_n") {
      // Best-of-window: current = the "best" value (respects direction);
      // baseline = the first value in the window (unchanged).
      // Optional windowDays trims the tail to that many days from the last
      // date; if unset, use the full match set.
      let windowed = matching;
      if (windowDays && windowDays > 0) {
        const lastDate = matching[matching.length - 1].date;
        const cutoffMs = new Date(lastDate + "T00:00:00").getTime() - windowDays * 864e5;
        windowed = matching.filter(({ date }) =>
          new Date(date + "T00:00:00").getTime() >= cutoffMs,
        );
      }
      const windowedValues = windowed
        .map(({ run }) => readRunNumericField(run, parsed.field))
        .filter((v): v is number => v != null);
      if (windowedValues.length === 0) return { current: null, baseline: values[0] };
      const best =
        direction === "higher_is_better"
          ? Math.max(...windowedValues)
          : Math.min(...windowedValues);
      return { current: best, baseline: values[0] };
    }

    // Default / "latest" mode — original behavior. Point-sample first vs
    // last. This is the correct semantic when aggregation isn't declared.
    return { current: values[values.length - 1], baseline: values[0] };
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
  // Include both end-of-block and mid-block metrics. Mid-block was
  // authored on engine-builder + rowing but never rendered on Progress —
  // silent gap flagged in delta audit 2026-08-19. Mid-block entries
  // reference the same metric_id family as their end-of-block sibling
  // (see rowing-2k-test-prep.json), so we tag them with a `mid_block`
  // marker so the panel can render a distinct row.
  const endOfBlock =
    ((program as unknown as { retest_metrics?: unknown[] }).retest_metrics as
      | Array<Record<string, unknown>>
      | undefined) ?? [];
  const midBlock =
    ((program as unknown as { retest_metrics_mid_block?: unknown[] })
      .retest_metrics_mid_block as Array<Record<string, unknown>> | undefined) ?? [];

  // De-dupe: if a mid_block entry has the same metric_id as an
  // end-of-block entry, prefix its display_name so both can coexist on
  // the panel. Programs sometimes use the exact same metric_id — that's
  // OK for scoring but reads as duplicate on Progress.
  // Also inherit source_ref / source / direction / unit / aggregation /
  // window_days from the sibling when mid-block omits them — authors add
  // a mid-block cadence check without repeating all the source metadata.
  // BUG-7 fix 2026-08-19: was silently showing "This metric will land
  // once its data source is wired" because mid-block entries lacked
  // source_ref, so the HERITAGE two-baseline classifier never fired.
  const endById = new Map<string, Record<string, unknown>>();
  for (const m of endOfBlock) endById.set(String(m.metric_id ?? ""), m);
  const midWithFlag = midBlock.map((m) => {
    const id = String(m.metric_id ?? "");
    const sibling = endById.get(id);
    if (sibling) {
      const inherit = (k: string) => (m[k] === undefined ? sibling[k] : m[k]);
      return {
        ...m,
        source: inherit("source"),
        source_ref: inherit("source_ref"),
        direction: inherit("direction"),
        unit: inherit("unit"),
        aggregation: inherit("aggregation"),
        window_days: inherit("window_days"),
        display_name: `${String(m.display_name ?? sibling.display_name ?? id)} · mid-block`,
        metric_id: `${id}__mid_block`,
      };
    }
    return m;
  });

  const metrics = [...endOfBlock, ...midWithFlag];
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

    const aggregation = typeof m.aggregation === "string" ? m.aggregation : undefined;
    const windowDays = typeof m.window_days === "number" ? m.window_days : undefined;
    const { current, baseline } = evaluateSource(
      store,
      parsed,
      program.slug,
      aggregation,
      windowDays,
      direction,
    );

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
 * Every dated observation a metric can claim from the log — not just the
 * current/baseline pair `evaluateRetestMetrics` reduces them to.
 *
 * This exists because the two halves of a retest metric were reading
 * different sources. `current` and `baseline` came from `source_ref` here;
 * the *history* — timeline pins, sparkline, rolling curve, and the
 * non-responder classifier's baselines — came only from
 * `store.retest_readings`, which is populated exclusively by hand through
 * the retest sheet. So a rowing user's 2K card showed a current time
 * derived from the row they actually did, above an empty timeline, and the
 * classifier stayed silent until they typed the same number a second time.
 *
 * Only run-backed metrics produce a series. `training_maxes` and
 * `physical_test` keep a current value and a baseline snapshot in the
 * store, not dated observations, so there is nothing honest to plot — they
 * stay logged-only. Returns [] rather than inventing two points.
 *
 * Consumed by `retest-readings.ts`, which merges this with what the user
 * logged by hand. Parsing lives here because this file owns `source_ref`.
 */
export function deriveMetricSeries(
  store: Store,
  metric: { metric_id?: string; source?: string; source_ref?: string },
  slug?: string,
): Array<{ observed_at: string; value: number }> {
  const ref = typeof metric.source_ref === "string" ? metric.source_ref : "";
  if (!ref) return [];
  const parsed = parseSource(ref, typeof metric.source === "string" ? metric.source : undefined);
  if (parsed.kind !== "runs") return [];

  // Same program-start cutoff `evaluateSource` applies: a returning user's
  // years-old sessions are not observations of this arc.
  const startedAt = slug
    ? store.user_profile?.program_states?.[slug]?.started_at?.slice(0, 10)
    : undefined;

  const out: Array<{ observed_at: string; value: number }> = [];
  for (const { date, run } of runsAcrossDates(store)) {
    if (startedAt && date < startedAt) continue;
    if (!runMatchesFilters(run, parsed.filters)) continue;
    const v = readRunNumericField(run, parsed.field);
    if (v == null) continue;
    out.push({ observed_at: date, value: v });
  }
  return out;
}

/** True when a metric's declared source can yield a dated series at all. */
export function metricHasDerivableSeries(metric: {
  source?: string;
  source_ref?: string;
}): boolean {
  const ref = typeof metric.source_ref === "string" ? metric.source_ref : "";
  if (!ref) return false;
  return (
    parseSource(ref, typeof metric.source === "string" ? metric.source : undefined).kind ===
    "runs"
  );
}

/**
 * Human-format a metric value for display. Seconds are rendered as mm:ss.
 */
export function formatMetric(value: number | null, unit: string): string {
  if (value == null) return "—";
  if (unit === "seconds") {
    const abs = Math.abs(Math.round(value));
    const sign = value < 0 ? "−" : "";
    // Value-magnitude heuristic: rowing pace / 2K times land at 90+ seconds
    // and read as mm:ss ("7:52"). Skill / mobility holds (TGU, wall hold,
    // freestand) land under 90s and read as "45s" — mm:ss format ("0:45")
    // was a print-fallback bug on those cards. Comprehensive audit
    // 2026-08-18 P1-6.
    if (abs < 90) return `${sign}${abs}s`;
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
