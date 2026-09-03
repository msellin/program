# Retest readings: one resolver, derived + logged

**Opened 2026-09-03.** Closes REV-5 (d) and the 2026-08-24 follow-up at
`dev/audits/app/2026-08-19-master-task-list.md:290` — the same defect recorded
twice from two directions.

## The defect

Every retest metric declares where its value lives:

```json
{ "metric_id": "row_2k_time_seconds",
  "source": "log_field",
  "source_ref": "runs[].total_seconds where activity_type == 'row'" }
```

`schemas.ts:826` says `adapt.ts` "resolves `source_ref` against the user's log
data." Nothing in `adapt.ts` reads it. **One** consumer resolves it —
`HeritageClusterChip.collectBaselines` — and it does so under three
restrictions that make the feature nearly unreachable:

1. It fires **only when `retest_readings` is entirely empty**. The moment the
   user logs one reading of any metric through the sheet, derivation switches
   off for every metric. The double-entry problem gets *worse* after the first
   manual entry, not better.
2. It resolves **only** `non_responder_classifier.primary_signal_metric_id`.
3. It lives in a component, so the four Record surfaces, the trend curve,
   `RetestMetricsPanel` and the classifier all read `store.retest_readings`
   raw and see nothing.

Net effect for a rowing or engine-builder user: you row the prescribed 2K
inside the session, it lands in `runs[]`, and the metric that 2K exists to
feed stays empty until you open a second sheet and type the number again.

## The fix

Extract the resolver to `src/lib/engine/retest-readings.ts` and make it the
single read path.

- `parseSourceRef(ref)` — `runs[].<field> where <k> == '<v>' and ...`
- `deriveReadings(store, metric)` — every declared metric, not just primary
- `resolveRetestReadings(store, program)` — **merge**, not fallback:
  logged ∪ derived, logged wins on the same `(metric_id, observed_at)`,
  each reading tagged `origin: "logged" | "derived"`.

Then repoint every consumer and delete `collectBaselines`.

Consumers: `HeritageClusterChip`, `RetestMetricsPanel`, `CutCProgramCurveCard`,
`CutCRetestTimeline`, `CutCLatestRetestTile`, `engine/rolling-avg`.
`record-export` keeps raw stored readings — derived values are already in the
export via `runs[]`, and duplicating them would misrepresent the record.

## Guards

- Test that every `source_ref` in every manifest program either parses or is
  a `physical_test` (genuinely manual — a wall hold has no log field).
- Merge precedence test: a logged reading overrides a derived one on the same
  date; both survive on different dates.
- Regression test for the bug this replaces: seed one unrelated logged
  reading, assert derivation still fires.

## Not in scope

`physical_test` metrics stay manual entry. That is correct — there is no log
field a max-effort dead hang could be derived from.
