# CLAUDE.md

Project context for Claude Code sessions in this repo.

## What this is

A personal rehab and strength-training tracker for one user (Margus). Data model lives
in `data/`. No app code yet — that's the work.

Derived from ten Digilugu / Terviseportaal documents covering 2020-12 to 2023-11:
pelvic and lumbar X-ray, hip MRI, lumbar spine MRI x3, SI joint MRI, right shoulder
MR arthrogram, and four specialist consultation summaries. The source PDFs are NOT in
this repo and should not be added — they contain isikukood and provider identifiers.

## Read these first

1. `data/clinical-context.json` — findings, exam results, history, provocative positions,
   red flags. This is the constraint set. Everything else must respect it.
2. `data/open-questions.json` — ten unanswered questions with rationale and impact
   mapping. Until these are answered, program content is provisional.
3. `data/exercises.json` — movement library, 24 exercises, plus class modifications.
4. `data/program.json` — blocks, phases, progression rules. Marked `PROVISIONAL`.

## Non-obvious reasoning you would not otherwise recover

**The left hip findings do not match the left hip symptoms.** The left labral lesion is
superior-POSTERIOR. Documented pain is ANTERIOR (groin, "puusaliigese eesmisel pinnal").
Meanwhile the anterior lesion is on the asymptomatic right side. Combined with groin pain
on resisted straight-leg raise (documented twice, a year apart) and clicking in the
LOWERING phase of hanging leg raises, the working hypothesis is iliopsoas involvement,
not labral pathology. Labral changes are common in asymptomatic athletes. Do not build
a labral-tear rehab programme.

**Hanging knee raises and L-sits are wrong for this user**, despite being standard hip
flexor recommendations. They are documented provocateurs. Same for Copenhagen planks as
a first-line choice (adduction load, and FADIR was positive bilaterally) and aggressive
couch stretching (pushes the anterior capsule).

**Possible sacroiliitis was raised in 2021 and never closed out.** See
`open-questions.json` q4. If inflammatory features are present, this stops being a
programming problem.

**Exercise demonstrably worked once.** 2021-01-21: orthopaedist recorded positive
dynamics and significantly improved strength indicators. Do not treat this user as
fragile — the record argues against it.

**The mechanism was disc golf, not just CrossFit.** Both physiatry notes name it.

**Physiotherapy is the highest-value unaddressed action.** Two referrals, one attended
session. Any advice generated here should keep saying so rather than substituting for it.

## Hard constraints on generated content

- Never reintroduce a movement flagged in `clinical-context.json.provocative_positions`
  without an explicit phase gate and symptom condition.
- Every `exercise_id` in `program.json` must resolve against `exercises.json`.
- Progression rules stay machine-evaluable — conditions, not prose.
- Keep the data de-identified. No name, isikukood, provider names or codes.
- This is not medical advice and the files should not present it as such. The user has an
  orthopaedist and a physiatrist; the programme is a supplement to clinical care.

## Workflow for turning PROVISIONAL into real

1. User fills `answer` fields in `data/open-questions.json`.
2. Check q4 first. Inflammatory features present → stop, refer, do not regenerate.
3. Check q1 and q3. These set the starting point and determine whether the
   `barbell_reintroduction` ladder in `program.json` is needed at all.
4. Apply each answered question's `impact` mapping.
5. Regenerate `program.json` only. `exercises.json` and `clinical-context.json` change
   only if new clinical information arrives.
6. Flip `status` from `PROVISIONAL` and record the date.

## App notes

`program.json.daily_log_schema` is the logging input shape. `progression_rules.states[]`
derives `green|amber|red` from a logged symptom score.

Suggested MVP is in `README.md`. The history view matters most: a multi-year symptom
record with load context is something none of the clinical notes contain, and it is what
would make the next specialist appointment productive.

## Validation

```bash
for f in data/*.json; do python3 -m json.tool "$f" > /dev/null && echo "ok $f"; done
```

Referential integrity between `program.json` and `exercises.json` should be checked on
load and fail loudly.
