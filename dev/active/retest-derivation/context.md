# Retest derivation — context

**Status: shipped 2026-09-03.** See `plan.md` for the defect statement.

## What the plan got wrong, and what was actually there

The plan (and REV-5 (d) before it) said `source_ref` was prose nothing read.
That was wrong. **Three** parsers of the grammar existed:

1. `retest-evaluator.ts` — the good one. Full grammar (`training_maxes.*`,
   `physical_test`, `runs[] where ...`), aggregation-aware, applies the
   program-start cutoff. Eight surfaces use it. This is what makes the
   *current value* on a retest card real.
2. `HeritageClusterChip.collectBaselines` — a private partial copy, used as an
   all-or-nothing fallback for one metric.
3. A fourth one I wrote before finding (1), and deleted.

So the defect was narrower and more interesting than recorded: a metric's
**current value** was derived correctly, and its **history** was not. Timeline
pins, sparkline, rolling curve and classifier baselines all read
`store.retest_readings`, which only the hand-entry sheet writes. A rowing user
saw a real 2K time on the card, above an empty trend.

## Shape of the fix

- `retest-evaluator.ts` gains `deriveMetricSeries` + `metricHasDerivableSeries`
  — the series form of what it already computed. Parsing stays here.
- `retest-readings.ts` is merge logic only: logged ∪ derived, logged wins on
  the same `(metric_id, observed_at)`, each reading tagged `origin`.
- `collectBaselines` deleted. Three parsers became one.
- Repointed: `HeritageClusterChip`, `RetestMetricsPanel`, `CutCProgramCurveCard`,
  `CutCRetestTimeline`, `CutCLatestRetestTile`, `engine/rolling-avg`.
- `record-export` still exports raw stored readings — derived values are
  already in the export via `runs[]`.

## Two things found on the way

**The cluster chip's baseline gate was counting the wrong thing.** It compared
`requires_baselines` against readings for *every* metric in the store. That was
survivable while only the primary metric was ever collected; with merged
readings, two unrelated readings would have shown a chip the classifier cannot
speak to. Now gated on the classifier's own metric ids.

**`rowing-2k-test-prep` named a secondary signal that does not exist.**
`submax_hr_at_threshold` is declared by no `retest_metrics` entry, so it could
never accumulate a reading. It is referenced by neither pattern rule, and
`combineVerdicts` filters out `insufficient_data` secondaries — so it was
inert, except that it rendered a permanent "not enough data yet" row in the
Cluster sheet for every rowing user. Emptied.

**Founder decision left open:** the signal itself is derivable —
`runs[].avg_hr where session_type == 'threshold'`. Promoting it to a real
secondary metric means authoring per-tier target deltas, which is programming,
not cleanup, and inventing target numbers in a VERIFIED-badged program is
exactly what this repo forbids. Left alone deliberately.

## Guards

`retest-readings.test.ts` (14) — merge precedence, the post-first-manual-entry
regression, mid-block de-dup, where-clause filtering, program-start cutoff,
and the two source kinds that correctly derive nothing.

`data-integrity.test.ts` (+2) — every shipped `source_ref` parses or is a
manual test; every metric a classifier reads is one its program declares. The
second one caught the rowing defect on its first run.

All three mutation-tested: reverting the merge to a fallback, dropping the
where-clause filter, and restoring the dead classifier id each fail.

467 tests (was 451).
