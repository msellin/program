# The load axis nobody could see

**Shipped 2026-09-03.** Found by the adversarial member of the S4 panel — the
agent briefed to argue AGAINST building F5 — while checking whether F5's
deliverable already existed. It does, and it was broken.

## The defect

`SymptomLoadChart` renders symptoms against training load on `/record` and on
`/report`, the page framed as the thing to hand an orthopaedist. Its load axis
hardcoded seven barbell exercise ids:

```
SQUAT_KEYS = ["back_squat_highbar", "back_squat_ssb", "front_squat"]
PULL_KEYS  = ["block_pull_midshin", "deadlift_conventional",
              "trap_bar_dl_blocks", "trap_bar_dl_floor"]
```

Two of nine shipped programs prescribe any of them. **The other seven drew a
symptom line against an empty load line.** A rowing user, a pull-up user, a
handstand user: symptom bars, no load.

The same file documents the identical bug being fixed on the *other* axis,
twelve lines below the hardcoding:

> Was a Math.max over four hardcoded hip regions, so a pull-up user's elbow or
> a muscle-up user's wrist never reached this chart at all — the symptom line
> read flat while they were hurting.

The symptom axis was de-hardcoded to `peakRegionScore`. The load axis was left
alone. Third occurrence of `anterior-hip-rebuild`'s shape being rendered to
everyone, after the morning check's symptom regions and this chart's own
symptom axis.

**Why nothing caught it:** an empty chart series is indistinguishable from a
user who has not trained yet. The failure mode is silence.

## The fix

`lib/load-signals.ts`, deliberately the same shape as `lib/symptom-regions.ts`
— a curated library, programs select by id, a test fails on an unknown id or a
program that declares none. A program declares WHAT its load is; it does not
get to define extraction logic.

Signals: `squat_top_kg`, `pull_top_kg`, `aerobic_minutes`, `working_reps`,
`hold_seconds`. Declarations follow what each program actually logs, which is
decided by block `category` — `DaySession` skips `category: "run"` blocks, so
aerobic work never reaches `exercises[]` and only a `runs[]`-based signal can
see it:

| programs | signal | why |
|---|---|---|
| anterior-hip-rebuild, concurrent-strength-maintenance | squat + pull kg | prescribe the barbell lifts |
| engine-builder, engine-builder-block-2, rowing-2k-test-prep | aerobic_minutes | every block is `category: "run"` |
| first-strict-pullup, muscle-up | working_reps | bodyweight, reps are the dose |
| handstand-walk, overhead-mobility | hold_seconds | hold-dominant |

`load_signals` added to `programSchema` — an undeclared key is stripped by Zod
and would have been inert, which is this repo's most-repeated defect.

Signals on one chart must share a unit; kilograms and minutes on one axis is a
chart that lies about both. When they disagree the chart draws no load axis
rather than picking a winner.

## Guards

Five in `data-integrity.test.ts`, two of which name the original defect
directly: a program may not declare a kg signal without prescribing those
lifts, and may not declare a set-based signal when every block is
run-category. Plus 13 unit tests on extraction and 4 render tests through the
chart's data table and aria summary — the accessible surface, since Recharts
measures to 0x0 in jsdom.

Mutation-tested: giving rowing the old barbell axis fails both integrity
guards by name; making `loadSignalsForProgram` ignore declarations fails six
tests across two suites, including "shows a rowing user their session
minutes".

538 tests, was 476.

## Still open

The panel's other findings are recorded but NOT actioned, and they are the
founder's:
- `dayLogSchema` has no write timestamp, and snapshots prune at 14 days, so
  same-day entry and Sunday-night backfill are already indistinguishable in
  older history. One additive field; irreversible for anything older.
- No `scale_version` on symptoms. The check moved from sliders to a 4-bucket
  tap scale on 2026-08-21, and nothing records which instrument produced a
  given value — a multi-year chart will show a step that is an artifact of the
  form.
- The locked M3 trigger for F5 (`25 users x 90 days`, rationale "cross-user
  signal") counts users for a per-user feature and cites a rationale R11
  forbids.
