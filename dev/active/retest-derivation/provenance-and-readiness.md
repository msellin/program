# Provenance fields + the readiness meter

**Shipped 2026-09-03.** Three items from the S4 advisory panel that are cheap
now and impossible (or useless) later.

## 1. `first_written_at` on every day log

`date` is the day an entry is ABOUT. Nothing recorded when it was WRITTEN.

Logging Tuesday's session on Tuesday morning and backfilling the whole week on
Sunday night are different measurement processes with different recall error.
Server snapshots prune at 14 days (`SNAPSHOT_RETENTION_DAYS`), so beyond two
weeks nothing anywhere could tell them apart — and any longitudinal analysis
silently pools them.

Stamped in `ensureDay`, which is safe because **all eight callers are write
paths** in `useStore` actions; the row exists only because the user just
recorded something. Never rewritten: a later edit does not change when the day
was first written.

**Not repairable for existing history.** That is why it went in before more
accrued rather than when a consumer wanted it.

## 2. `symptoms.scale_version`

Every symptom field is `z.number()` on 0-10, but the instrument changed. Until
2026-08-21 the check used continuous sliders and any value could appear; Cut D
replaced them with a four-option tap scale writing exactly {0, 2, 5, 8}, plus
three-option life load and four-option stiffness.

Nothing recorded which produced a given row, so a multi-year chart shows a step
at that date belonging to the FORM, not the person — and no consumer could
tell the difference.

`SYMPTOM_SCALE_VERSION` lives in `lib/symptom-regions.ts`, not in the check
component: a lib importing from a component is the wrong dependency direction,
and `setDaySymptoms` is the single chokepoint every symptom write passes
through. Absent means a pre-Cut-D slider entry, which is the honest reading.

**Bump it when the writable VALUES change** — a new bucket, a different
mapping, a return to continuous. Never for wording, layout or colour: it
identifies the measurement, not the design.

## 3. `GET /api/admin/readiness`

F5 is gated on "90+ days of real log data" and the locked M3 trigger reads
"25 users x 90 days". Nothing could evaluate either, so build-or-defer was a
judgement about an invisible number — `completions.ts`'s "guess wearing a
number", again.

Returns a threshold table: how many users clear 30/60/90/120/180 logged days,
the same for completed checks, and — the row that matters most — how many
clear 5/15/30 days at a **non-zero symptom score**. A user answering "None"
for ninety days contributes nothing about how load relates to symptoms while
inflating every day count, so a day-only trigger can fire on a dataset with no
variance in the thing being explained. Also reports mean check-completion as a
share of span, because day counts overstate how continuous a record is.

Privacy stance copied from `completions.ts` and asserted in a test: counts
only, no user ids, no per-user rows, no dates. A per-user list would answer the
same question while being re-identifying at beta scale.

Aggregation is in `src/lib/data-readiness.ts`, HTTP shell in `functions/` —
the separation `completions.ts` documents, because importing a Pages Function
from a test drags `functions/` into the Next app's tsconfig scope and breaks
the production build.

## Guards

18 tests. Mutation-tested: stamping the logged date instead of the write
moment, dropping the scale stamp, and counting every checked day as variance
each fail by name.

549 tests, was 538.

## For the founder

`first_written_at` records when someone uses the app, to the second. It sits
inside "training logs" as the privacy page already describes them, so this is
not a new category of data — but it is new behavioural metadata (it reveals
that somebody logged at 3am), and whether to name it explicitly on the privacy
page is a disclosure judgement, not an engineering one.
