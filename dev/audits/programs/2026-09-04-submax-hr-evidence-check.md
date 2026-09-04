# `submax_hr_pace5_bpm` — evidence check

Requested 2026-09-04. SR-3's objection was left open across two handovers:
no pace anchor, effect inside the instrument's noise, and none of the
citations attached to it. This checks those claims rather than repeating
them.

**All three hold. A fourth problem is worse than any of them.**

Nothing here has been changed. The signal still runs.

---

## 1. Citations: zero support it

`engine-builder.json` carries **35** references. Three mention heart rate:

| id | what it is | what it supports |
|---|---|---|
| `tanaka_2001` | HRmax = 208 − 0.7 × age | zone *methodology* |
| `nes_2013_hunt` | HRmax = 211 − 0.64 × age (SEE 10.8 bpm) | zone *methodology* |
| `rogers_2021_dfa` | DFA a1 = 0.75 as VT1 anchor | zone *methodology* |

All three answer "where are this person's zones". **None** supports the
claim the metric actually makes: that average HR at self-reported easy
effort is a valid longitudinal progress signal, or that a 5–10 bpm change
over eight weeks is detectable above noise.

`bouchard_1999_heritage` is cited, but at
`non_responder_classifier.variance_source` — for the 10× variance in
trainability. It says nothing about how to MEASURE the response.

SR-3 was right.

## 2. The pace anchor is gone, and it is already documented

The metric's own `note` records it: `display_name` used to be "Submax HR at
pace-5 (row 2:00/500m)", was renamed on 2026-08-21 because `RunLog` has no
pace field, and `source_ref` is now `runs[].avg_hr where intensity ==
'easy'`.

So the metric is **average HR on runs the user called easy**. "Easy" is
self-reported and drifts — a fitter runner runs their easy faster, holding
HR constant. The metric is structurally unable to distinguish "aerobic base
improved" from "the user's sense of easy got faster". That is not noise; it
is a confound pointing the wrong way.

## 3. The declared aggregation is not the one that runs

`retest_metrics[0]` declares `aggregation: "trend_slope"` and
`window_days: 28`. A 28-day slope would genuinely blunt day-to-day HR
variability, and it is a large part of why this metric reads as defensible.

**The classifier does not use it.** `non-responder-classifier.ts:199-205`:

```ts
const sorted  = [...baselines].sort(byDate);
const first   = sorted[0];
const midOrLatest = sorted[1] ?? sorted[0];
const delta   = midOrLatest.value - first.value;
```

Two raw readings. No slope, no window. Another declared field that nothing
consumes — the same shape as `daily_log_schema` and
`progression_rules.states[]`.

Consequence: `progress_ratio = delta / target`, Foundation target is
**−5 bpm**, and day-to-day submax HR moves several bpm on sleep, heat,
hydration and caffeine alone. The rules then threshold that ratio at 0.4
and 0.15 — and `true_non_response` tells the user:

> "accept genetic ceiling and move to maintenance"

That sentence can currently be produced by the difference between two
heart-rate readings, either of which can be off by more than the whole
target.

## 4. Primary and secondary signals disagree, six lines apart

In the same function:

```ts
// secondary — uses ALL the data
restingHrDelta = restingSorted[restingSorted.length - 1].value - restingSorted[0].value;

// primary — uses the SECOND reading ever, and ignores everything after it
midOrLatest = sorted[1] ?? sorted[0];
```

With exactly two baselines these agree, which is why it has never shown.
With three or more the primary signal silently discards every reading after
the second, while the secondary reads the latest. The local is named
`midOrLatest` and is neither, once there are more than two.

One of the two is wrong. They cannot both be right.

**Not fixed here, deliberately.** Both conventions are defensible —
"at_mid_block" naming argues for the second point, parity with resting HR
argues for the latest — and the choice changes who gets told their training
may be genetically capped. That is the same line as the safety gates: the
engine proposes, it does not quietly decide. It is also entangled with the
decision below; if the signal goes, the fix is moot.

Recommendation if the signal stays: make the primary match the secondary
(`last − first`), and either implement `trend_slope`/`window_days` or delete
them so they stop reading as functioning.

---

## The decision, unchanged and still the founder's

The replacement already exists: **block-2's 20-minute threshold test**. It
has a pace anchor, a defined protocol, and it is a test rather than an
inference off self-labelled easy runs.

Removing a primary signal from three shipped programmes
(`engine-builder`, `engine-builder-block-2`,
`concurrent-strength-maintenance`) is a programming decision. What this
document removes is the excuse that the evidence question was unresolved.
It is resolved: there is none.
